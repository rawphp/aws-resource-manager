import { ECSClient, ListClustersCommand, ListServicesCommand, DescribeClustersCommand } from '@aws-sdk/client-ecs';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const ecsScanner: ServiceScanner = {
  service: 'ecs',
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new ECSClient({ region, credentials: makeCredentials(credentials) });
    const resources: DiscoveredResource[] = [];
    const errors: string[] = [];

    try {
      const clusterResponse = await client.send(new ListClustersCommand({}));
      const clusterArns = clusterResponse.clusterArns || [];

      if (clusterArns.length > 0) {
        const details = await client.send(new DescribeClustersCommand({ clusters: clusterArns }));
        for (const cluster of details.clusters || []) {
          resources.push({
            id: cluster.clusterName || '',
            arn: cluster.clusterArn || '',
            type: 'ecs:cluster',
            service: 'ecs',
            name: cluster.clusterName || '',
            region,
            state: cluster.status || 'unknown',
            tags: {},
          });
        }

        for (const clusterArn of clusterArns) {
          try {
            const servicesResponse = await client.send(new ListServicesCommand({ cluster: clusterArn }));
            for (const serviceArn of servicesResponse.serviceArns || []) {
              const name = serviceArn.split('/').pop() || serviceArn;
              resources.push({
                id: name,
                arn: serviceArn,
                type: 'ecs:service',
                service: 'ecs',
                name,
                region,
                state: 'active',
                tags: {},
              });
            }
          } catch (err: unknown) {
            errors.push(`services in ${clusterArn}: ${(err as Error).message}`);
          }
        }
      }
    } catch (err: unknown) {
      errors.push(`clusters: ${(err as Error).message}`);
    }

    return { service: 'ecs', region, resources, errors };
  },
};
