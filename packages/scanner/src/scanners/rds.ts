import { RDSClient, DescribeDBInstancesCommand, DescribeDBClustersCommand } from '@aws-sdk/client-rds';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const rdsScanner: ServiceScanner = {
  service: 'rds',
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new RDSClient({ region, credentials: makeCredentials(credentials) });
    const resources: DiscoveredResource[] = [];
    const errors: string[] = [];

    try {
      let marker: string | undefined;
      do {
        const response = await client.send(new DescribeDBInstancesCommand({ Marker: marker }));
        for (const db of response.DBInstances || []) {
          resources.push({
            id: db.DBInstanceIdentifier || '',
            arn: db.DBInstanceArn || '',
            type: `rds:instance:${db.DBInstanceClass || 'unknown'}`,
            service: 'rds',
            name: db.DBInstanceIdentifier || '',
            region,
            state: db.DBInstanceStatus || 'unknown',
            createdAt: db.InstanceCreateTime?.toISOString(),
            tags: {},
          });
        }
        marker = response.Marker;
      } while (marker);
    } catch (err: unknown) {
      errors.push(`instances: ${(err as Error).message}`);
    }

    try {
      let marker: string | undefined;
      do {
        const response = await client.send(new DescribeDBClustersCommand({ Marker: marker }));
        for (const cluster of response.DBClusters || []) {
          resources.push({
            id: cluster.DBClusterIdentifier || '',
            arn: cluster.DBClusterArn || '',
            type: `rds:cluster:${cluster.Engine || 'unknown'}`,
            service: 'rds',
            name: cluster.DBClusterIdentifier || '',
            region,
            state: cluster.Status || 'unknown',
            tags: {},
          });
        }
        marker = response.Marker;
      } while (marker);
    } catch (err: unknown) {
      errors.push(`clusters: ${(err as Error).message}`);
    }

    return { service: 'rds', region, resources, errors };
  },
};
