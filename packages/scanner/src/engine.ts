import { EC2Client, DescribeRegionsCommand } from '@aws-sdk/client-ec2';
import type {
  ServiceScanResult,
  AccountScanResult,
  AwsAccountConfig,
} from '@aws-resource-manager/shared';
import type { AwsCredentials } from './credentials.js';
import { resolveCredentials } from './credentials.js';

export interface ServiceScanner {
  service: string;
  /** If true, scanner runs once globally (not per-region). E.g., S3, CloudFront. */
  global?: boolean;
  scan(
    credentials: AwsCredentials,
    region: string,
  ): Promise<ServiceScanResult>;
}

export interface ScanProgress {
  account: string;
  region: string;
  service: string;
  status: 'starting' | 'complete' | 'error';
  error?: string;
}

export interface EngineOptions {
  concurrency?: number;
  onProgress?: (progress: ScanProgress) => void;
}

export async function discoverRegions(
  credentials: AwsCredentials,
  defaultRegion: string = 'us-east-1',
): Promise<string[]> {
  const ec2 = new EC2Client({
    region: defaultRegion,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  const response = await ec2.send(
    new DescribeRegionsCommand({ AllRegions: false }),
  );

  return (response.Regions || [])
    .map((r) => r.RegionName!)
    .filter(Boolean)
    .sort();
}

async function runWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err as Error;
      const errorName = (err as { name?: string })?.name || '';

      if (
        errorName === 'ThrottlingException' ||
        errorName === 'Throttling' ||
        errorName === 'TooManyRequestsException'
      ) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

async function runConcurrent<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const currentIndex = index++;
      results[currentIndex] = await tasks[currentIndex]();
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

export async function scanAccount(
  account: AwsAccountConfig,
  scanners: ServiceScanner[],
  options: EngineOptions = {},
): Promise<AccountScanResult> {
  const { concurrency = 5, onProgress } = options;

  const credentials = await resolveCredentials(account);
  const regions = await discoverRegions(
    credentials,
    account.defaultRegion || 'us-east-1',
  );

  const result: AccountScanResult = {
    account: account.name,
    scannedAt: new Date().toISOString(),
    regions: {},
  };

  const globalScanners = scanners.filter((s) => s.global);
  const regionalScanners = scanners.filter((s) => !s.global);

  // Run global scanners once (using default region)
  for (const scanner of globalScanners) {
    const region = account.defaultRegion || 'us-east-1';
    onProgress?.({
      account: account.name,
      region: 'global',
      service: scanner.service,
      status: 'starting',
    });

    try {
      const scanResult = await runWithRetry(() =>
        scanner.scan(credentials, region),
      );
      if (!result.regions['global']) result.regions['global'] = {};
      result.regions['global'][scanner.service] = scanResult;
      onProgress?.({
        account: account.name,
        region: 'global',
        service: scanner.service,
        status: 'complete',
      });
    } catch (err: unknown) {
      const error = err as Error;
      const errorName = (err as { name?: string })?.name || '';

      if (
        errorName === 'AccessDeniedException' ||
        errorName === 'UnauthorizedAccess' ||
        errorName === 'AccessDenied'
      ) {
        if (!result.regions['global']) result.regions['global'] = {};
        result.regions['global'][scanner.service] = {
          service: scanner.service,
          region: 'global',
          resources: [],
          errors: [`Access denied: ${error.message}`],
        };
        onProgress?.({
          account: account.name,
          region: 'global',
          service: scanner.service,
          status: 'error',
          error: `Access denied: ${error.message}`,
        });
      } else {
        throw error;
      }
    }
  }

  // Run regional scanners across all regions with concurrency
  const regionTasks = regions.map((region) => async () => {
    const regionResults: Record<string, ServiceScanResult> = {};

    for (const scanner of regionalScanners) {
      onProgress?.({
        account: account.name,
        region,
        service: scanner.service,
        status: 'starting',
      });

      try {
        const scanResult = await runWithRetry(() =>
          scanner.scan(credentials, region),
        );
        regionResults[scanner.service] = scanResult;
        onProgress?.({
          account: account.name,
          region,
          service: scanner.service,
          status: 'complete',
        });
      } catch (err: unknown) {
        const error = err as Error;
        const errorName = (err as { name?: string })?.name || '';

        if (
          errorName === 'AccessDeniedException' ||
          errorName === 'UnauthorizedAccess' ||
          errorName === 'AccessDenied'
        ) {
          regionResults[scanner.service] = {
            service: scanner.service,
            region,
            resources: [],
            errors: [`Access denied: ${error.message}`],
          };
          onProgress?.({
            account: account.name,
            region,
            service: scanner.service,
            status: 'error',
            error: `Access denied: ${error.message}`,
          });
        } else {
          throw error;
        }
      }
    }

    result.regions[region] = regionResults;
  });

  await runConcurrent(regionTasks, concurrency);

  return result;
}

// Export for testing
export { runWithRetry, runConcurrent };
