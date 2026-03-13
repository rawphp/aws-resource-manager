import { ElastiCacheClient, DescribeCacheClustersCommand } from '@aws-sdk/client-elasticache';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const elasticacheScanner: ServiceScanner = {
  service: 'elasticache',
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new ElastiCacheClient({ region, credentials: makeCredentials(credentials) });
    const resources: DiscoveredResource[] = [];
    let marker: string | undefined;

    do {
      const response = await client.send(new DescribeCacheClustersCommand({ Marker: marker }));
      for (const cluster of response.CacheClusters || []) {
        resources.push({
          id: cluster.CacheClusterId || '',
          arn: cluster.ARN || '',
          type: `elasticache:${cluster.Engine || 'unknown'}:${cluster.CacheNodeType || 'unknown'}`,
          service: 'elasticache',
          name: cluster.CacheClusterId || '',
          region,
          state: cluster.CacheClusterStatus || 'unknown',
          createdAt: cluster.CacheClusterCreateTime?.toISOString(),
          tags: {},
        });
      }
      marker = response.Marker;
    } while (marker);

    return { service: 'elasticache', region, resources, errors: [] };
  },
};
