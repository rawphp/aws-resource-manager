import { EKSClient, ListClustersCommand, DescribeClusterCommand } from '@aws-sdk/client-eks';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const eksScanner: ServiceScanner = {
  service: 'eks',
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new EKSClient({ region, credentials: makeCredentials(credentials) });
    const resources: DiscoveredResource[] = [];
    const errors: string[] = [];
    let nextToken: string | undefined;

    do {
      const response = await client.send(new ListClustersCommand({ nextToken }));
      for (const name of response.clusters || []) {
        try {
          const detail = await client.send(new DescribeClusterCommand({ name }));
          const cluster = detail.cluster;
          resources.push({
            id: name,
            arn: cluster?.arn || '',
            type: `eks:cluster:${cluster?.version || 'unknown'}`,
            service: 'eks',
            name,
            region,
            state: cluster?.status || 'unknown',
            createdAt: cluster?.createdAt?.toISOString(),
            tags: cluster?.tags || {},
          });
        } catch (err: unknown) {
          errors.push(`cluster ${name}: ${(err as Error).message}`);
        }
      }
      nextToken = response.nextToken;
    } while (nextToken);

    return { service: 'eks', region, resources, errors };
  },
};
