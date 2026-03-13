import { RedshiftClient, DescribeClustersCommand } from '@aws-sdk/client-redshift';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const redshiftScanner: ServiceScanner = {
  service: 'redshift',
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new RedshiftClient({ region, credentials: makeCredentials(credentials) });
    const resources: DiscoveredResource[] = [];
    let marker: string | undefined;

    do {
      const response = await client.send(new DescribeClustersCommand({ Marker: marker }));
      for (const cluster of response.Clusters || []) {
        resources.push({
          id: cluster.ClusterIdentifier || '',
          arn: `arn:aws:redshift:${region}::cluster:${cluster.ClusterIdentifier}`,
          type: `redshift:cluster:${cluster.NodeType || 'unknown'}`,
          service: 'redshift',
          name: cluster.ClusterIdentifier || '',
          region,
          state: cluster.ClusterStatus || 'unknown',
          createdAt: cluster.ClusterCreateTime?.toISOString(),
          tags: {},
        });
      }
      marker = response.Marker;
    } while (marker);

    return { service: 'redshift', region, resources, errors: [] };
  },
};
