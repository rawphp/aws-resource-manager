import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const lambdaScanner: ServiceScanner = {
  service: 'lambda',
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new LambdaClient({ region, credentials: makeCredentials(credentials) });
    const resources: DiscoveredResource[] = [];
    let marker: string | undefined;

    do {
      const response = await client.send(new ListFunctionsCommand({ Marker: marker }));
      for (const fn of response.Functions || []) {
        resources.push({
          id: fn.FunctionName || '',
          arn: fn.FunctionArn || '',
          type: `lambda:function:${fn.Runtime || 'unknown'}`,
          service: 'lambda',
          name: fn.FunctionName || '',
          region,
          state: fn.State || 'Active',
          createdAt: fn.LastModified,
          tags: {},
        });
      }
      marker = response.NextMarker;
    } while (marker);

    return { service: 'lambda', region, resources, errors: [] };
  },
};
