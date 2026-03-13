import { CloudFrontClient, ListDistributionsCommand } from '@aws-sdk/client-cloudfront';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const cloudfrontScanner: ServiceScanner = {
  service: 'cloudfront',
  global: true,
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new CloudFrontClient({ region, credentials: makeCredentials(credentials) });
    const resources: DiscoveredResource[] = [];

    let marker: string | undefined;
    do {
      const response = await client.send(new ListDistributionsCommand({ Marker: marker }));
      const list = response.DistributionList;
      for (const dist of list?.Items || []) {
        resources.push({
          id: dist.Id || '',
          arn: dist.ARN || '',
          type: 'cloudfront:distribution',
          service: 'cloudfront',
          name: dist.DomainName || dist.Id || '',
          region: 'global',
          state: dist.Status || 'unknown',
          createdAt: dist.LastModifiedTime?.toISOString(),
          tags: {},
        });
      }
      marker = list?.IsTruncated ? list.NextMarker : undefined;
    } while (marker);

    return { service: 'cloudfront', region: 'global', resources, errors: [] };
  },
};
