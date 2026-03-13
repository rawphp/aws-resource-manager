import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  type GroupDefinition,
  type ResultByTime,
} from '@aws-sdk/client-cost-explorer';
import type { CostBreakdown, DiscoveredResource } from '@aws-resource-manager/shared';
import type { AwsCredentials } from './credentials.js';

export interface CostQueryOptions {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

function defaultDateRange(): CostQueryOptions {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

function createClient(credentials: AwsCredentials, region: string = 'us-east-1') {
  return new CostExplorerClient({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });
}

function extractCosts(
  results: ResultByTime[],
  groupKey: string,
): CostBreakdown[] {
  const costMap = new Map<string, number>();

  for (const result of results) {
    for (const group of result.Groups || []) {
      const key = group.Keys?.[0] || 'Unknown';
      const amount = parseFloat(
        group.Metrics?.['UnblendedCost']?.Amount || '0',
      );
      costMap.set(key, (costMap.get(key) || 0) + amount);
    }
  }

  const period = {
    start: results[0]?.TimePeriod?.Start || '',
    end: results[results.length - 1]?.TimePeriod?.End || '',
  };

  return Array.from(costMap.entries())
    .map(([key, amount]) => ({
      service: groupKey === 'SERVICE' ? key : '',
      region: groupKey === 'REGION' ? key : undefined,
      amount: Math.round(amount * 100) / 100,
      currency: 'USD',
      period,
    }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export async function getCostByService(
  credentials: AwsCredentials,
  options?: CostQueryOptions,
): Promise<CostBreakdown[]> {
  const { startDate, endDate } = options || defaultDateRange();
  const client = createClient(credentials);

  const groupBy: GroupDefinition[] = [{ Type: 'DIMENSION', Key: 'SERVICE' }];

  const response = await client.send(
    new GetCostAndUsageCommand({
      TimePeriod: { Start: startDate, End: endDate },
      Granularity: 'MONTHLY',
      Metrics: ['UnblendedCost'],
      GroupBy: groupBy,
    }),
  );

  return extractCosts(response.ResultsByTime || [], 'SERVICE');
}

export async function getCostByRegion(
  credentials: AwsCredentials,
  options?: CostQueryOptions,
): Promise<CostBreakdown[]> {
  const { startDate, endDate } = options || defaultDateRange();
  const client = createClient(credentials);

  const response = await client.send(
    new GetCostAndUsageCommand({
      TimePeriod: { Start: startDate, End: endDate },
      Granularity: 'MONTHLY',
      Metrics: ['UnblendedCost'],
      GroupBy: [{ Type: 'DIMENSION', Key: 'REGION' }],
    }),
  );

  return extractCosts(response.ResultsByTime || [], 'REGION');
}

export function mergeCostsToResources(
  resources: DiscoveredResource[],
  costByService: CostBreakdown[],
): void {
  // Build a service cost lookup
  const serviceCostMap = new Map<string, number>();
  for (const cost of costByService) {
    serviceCostMap.set(cost.service.toLowerCase(), cost.amount);
  }

  // Map AWS Cost Explorer service names to our scanner service names
  const serviceNameMap: Record<string, string> = {
    'amazon elastic compute cloud - compute': 'ec2',
    'amazon simple storage service': 's3',
    'amazon relational database service': 'rds',
    'aws lambda': 'lambda',
    'elastic load balancing': 'elb',
    'amazon cloudfront': 'cloudfront',
    'amazon route 53': 'route53',
    'amazon elastic container service': 'ecs',
    'amazon dynamodb': 'dynamodb',
    'amazon elasticache': 'elasticache',
    'amazon redshift': 'redshift',
    'amazon opensearch service': 'opensearch',
    'amazon sagemaker': 'sagemaker',
    'amazon elastic kubernetes service': 'eks',
  };

  // Count resources per service to distribute cost
  const resourceCountByService = new Map<string, number>();
  for (const resource of resources) {
    const count = resourceCountByService.get(resource.service) || 0;
    resourceCountByService.set(resource.service, count + 1);
  }

  for (const resource of resources) {
    // Try to find matching cost data
    for (const [ceServiceName, scannerService] of Object.entries(serviceNameMap)) {
      if (resource.service === scannerService) {
        const cost = serviceCostMap.get(ceServiceName);
        if (cost !== undefined) {
          const count = resourceCountByService.get(scannerService) || 1;
          resource.estimatedMonthlyCost = Math.round((cost / count) * 100) / 100;
        }
        break;
      }
    }
  }
}
