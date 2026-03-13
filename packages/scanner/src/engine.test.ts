import { describe, it, expect, vi } from 'vitest';
import { runWithRetry, runConcurrent, scanAccount } from './engine.js';
import type { ServiceScanner, ScanProgress } from './engine.js';
import type { AwsAccountConfig, ServiceScanResult } from '@aws-resource-manager/shared';

// Mock credentials module to avoid real AWS calls
vi.mock('./credentials.js', () => ({
  resolveCredentials: vi.fn().mockResolvedValue({
    accessKeyId: 'AKIA123',
    secretAccessKey: 'secret',
  }),
}));

// Mock EC2 client for discoverRegions
vi.mock('@aws-sdk/client-ec2', () => ({
  EC2Client: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({
      Regions: [
        { RegionName: 'us-east-1' },
        { RegionName: 'us-west-2' },
      ],
    }),
  })),
  DescribeRegionsCommand: vi.fn(),
}));

describe('runWithRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await runWithRetry(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on ThrottlingException', async () => {
    const throttleError = Object.assign(new Error('throttled'), {
      name: 'ThrottlingException',
    });
    const fn = vi
      .fn()
      .mockRejectedValueOnce(throttleError)
      .mockResolvedValue('ok');

    const result = await runWithRetry(fn, 1);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws non-throttle errors immediately', async () => {
    const error = new Error('bad request');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(runWithRetry(fn)).rejects.toThrow('bad request');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('runConcurrent', () => {
  it('runs tasks with concurrency limit', async () => {
    let active = 0;
    let maxActive = 0;

    const createTask = (value: number) => async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 10));
      active--;
      return value;
    };

    const tasks = [1, 2, 3, 4, 5].map((v) => createTask(v));
    const results = await runConcurrent(tasks, 2);

    expect(results).toEqual([1, 2, 3, 4, 5]);
    expect(maxActive).toBeLessThanOrEqual(2);
  });

  it('handles empty task list', async () => {
    const results = await runConcurrent([], 5);
    expect(results).toEqual([]);
  });
});

describe('scanAccount', () => {
  const mockAccount: AwsAccountConfig = {
    name: 'test-account',
    accessKeyId: 'AKIA123',
    secretAccessKey: 'secret',
  };

  it('scans all regions with regional scanners', async () => {
    const mockScanner: ServiceScanner = {
      service: 'ec2',
      scan: vi.fn().mockResolvedValue({
        service: 'ec2',
        region: 'us-east-1',
        resources: [{ id: 'i-123', arn: 'arn:ec2:i-123', type: 'instance', service: 'ec2', name: 'test', region: 'us-east-1', state: 'running', tags: {} }],
        errors: [],
      } satisfies ServiceScanResult),
    };

    const result = await scanAccount(mockAccount, [mockScanner], {
      concurrency: 2,
    });

    expect(result.account).toBe('test-account');
    expect(result.regions['us-east-1']).toBeDefined();
    expect(result.regions['us-west-2']).toBeDefined();
    expect(mockScanner.scan).toHaveBeenCalledTimes(2); // 2 regions
  });

  it('runs global scanners once', async () => {
    const globalScanner: ServiceScanner = {
      service: 's3',
      global: true,
      scan: vi.fn().mockResolvedValue({
        service: 's3',
        region: 'global',
        resources: [],
        errors: [],
      } satisfies ServiceScanResult),
    };

    const result = await scanAccount(mockAccount, [globalScanner]);

    expect(result.regions['global']).toBeDefined();
    expect(globalScanner.scan).toHaveBeenCalledTimes(1);
  });

  it('handles AccessDenied gracefully', async () => {
    const scanner: ServiceScanner = {
      service: 'rds',
      scan: vi.fn().mockRejectedValue(
        Object.assign(new Error('not allowed'), { name: 'AccessDenied' }),
      ),
    };

    const result = await scanAccount(mockAccount, [scanner]);

    expect(result.regions['us-east-1']?.['rds'].errors).toHaveLength(1);
    expect(result.regions['us-east-1']?.['rds'].errors[0]).toContain('Access denied');
  });

  it('reports progress', async () => {
    const scanner: ServiceScanner = {
      service: 'ec2',
      scan: vi.fn().mockResolvedValue({
        service: 'ec2',
        region: 'us-east-1',
        resources: [],
        errors: [],
      } satisfies ServiceScanResult),
    };

    const progress: ScanProgress[] = [];
    await scanAccount(mockAccount, [scanner], {
      onProgress: (p) => progress.push(p),
    });

    // 2 regions × 2 events (starting + complete) = 4
    expect(progress.length).toBe(4);
    expect(progress.filter((p) => p.status === 'starting')).toHaveLength(2);
    expect(progress.filter((p) => p.status === 'complete')).toHaveLength(2);
  });
});
