import { SageMakerClient, ListEndpointsCommand } from '@aws-sdk/client-sagemaker';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const sagemakerScanner: ServiceScanner = {
  service: 'sagemaker',
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new SageMakerClient({ region, credentials: makeCredentials(credentials) });
    const resources: DiscoveredResource[] = [];
    let nextToken: string | undefined;

    do {
      const response = await client.send(new ListEndpointsCommand({ NextToken: nextToken }));
      for (const endpoint of response.Endpoints || []) {
        resources.push({
          id: endpoint.EndpointName || '',
          arn: endpoint.EndpointArn || '',
          type: 'sagemaker:endpoint',
          service: 'sagemaker',
          name: endpoint.EndpointName || '',
          region,
          state: endpoint.EndpointStatus || 'unknown',
          createdAt: endpoint.CreationTime?.toISOString(),
          tags: {},
        });
      }
      nextToken = response.NextToken;
    } while (nextToken);

    return { service: 'sagemaker', region, resources, errors: [] };
  },
};
