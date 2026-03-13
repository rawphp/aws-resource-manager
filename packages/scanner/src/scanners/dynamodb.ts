import { DynamoDBClient, ListTablesCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const dynamodbScanner: ServiceScanner = {
  service: 'dynamodb',
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new DynamoDBClient({ region, credentials: makeCredentials(credentials) });
    const resources: DiscoveredResource[] = [];
    const errors: string[] = [];

    let lastTable: string | undefined;
    do {
      const response = await client.send(new ListTablesCommand({ ExclusiveStartTableName: lastTable }));
      for (const tableName of response.TableNames || []) {
        try {
          const detail = await client.send(new DescribeTableCommand({ TableName: tableName }));
          const table = detail.Table;
          resources.push({
            id: tableName,
            arn: table?.TableArn || '',
            type: `dynamodb:table:${table?.BillingModeSummary?.BillingMode || 'PROVISIONED'}`,
            service: 'dynamodb',
            name: tableName,
            region,
            state: table?.TableStatus || 'unknown',
            createdAt: table?.CreationDateTime?.toISOString(),
            tags: {},
          });
        } catch (err: unknown) {
          errors.push(`table ${tableName}: ${(err as Error).message}`);
        }
      }
      lastTable = response.LastEvaluatedTableName;
    } while (lastTable);

    return { service: 'dynamodb', region, resources, errors };
  },
};
