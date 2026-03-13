import { Route53Client, ListHostedZonesCommand } from '@aws-sdk/client-route-53';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const route53Scanner: ServiceScanner = {
  service: 'route53',
  global: true,
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new Route53Client({ region, credentials: makeCredentials(credentials) });
    const resources: DiscoveredResource[] = [];

    let marker: string | undefined;
    do {
      const response = await client.send(new ListHostedZonesCommand({ Marker: marker }));
      for (const zone of response.HostedZones || []) {
        resources.push({
          id: zone.Id || '',
          arn: `arn:aws:route53:::hostedzone/${(zone.Id || '').replace('/hostedzone/', '')}`,
          type: zone.Config?.PrivateZone ? 'route53:private-zone' : 'route53:public-zone',
          service: 'route53',
          name: zone.Name || '',
          region: 'global',
          state: 'active',
          tags: {},
        });
      }
      marker = response.IsTruncated ? response.NextMarker : undefined;
    } while (marker);

    return { service: 'route53', region: 'global', resources, errors: [] };
  },
};
