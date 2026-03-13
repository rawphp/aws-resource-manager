import { OpenSearchClient, ListDomainNamesCommand, DescribeDomainCommand } from '@aws-sdk/client-opensearch';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const opensearchScanner: ServiceScanner = {
  service: 'opensearch',
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new OpenSearchClient({ region, credentials: makeCredentials(credentials) });
    const resources: DiscoveredResource[] = [];
    const errors: string[] = [];

    const listResponse = await client.send(new ListDomainNamesCommand({}));
    for (const domain of listResponse.DomainNames || []) {
      try {
        const detail = await client.send(new DescribeDomainCommand({ DomainName: domain.DomainName }));
        const status = detail.DomainStatus;
        resources.push({
          id: status?.DomainName || domain.DomainName || '',
          arn: status?.ARN || '',
          type: `opensearch:domain:${status?.EngineVersion || 'unknown'}`,
          service: 'opensearch',
          name: status?.DomainName || domain.DomainName || '',
          region,
          state: status?.Processing ? 'processing' : 'active',
          tags: {},
        });
      } catch (err: unknown) {
        errors.push(`domain ${domain.DomainName}: ${(err as Error).message}`);
      }
    }

    return { service: 'opensearch', region, resources, errors };
  },
};
