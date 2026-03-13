import { ElasticLoadBalancingV2Client, DescribeLoadBalancersCommand } from '@aws-sdk/client-elastic-load-balancing-v2';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const elbScanner: ServiceScanner = {
  service: 'elb',
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new ElasticLoadBalancingV2Client({ region, credentials: makeCredentials(credentials) });
    const resources: DiscoveredResource[] = [];
    let marker: string | undefined;

    do {
      const response = await client.send(new DescribeLoadBalancersCommand({ Marker: marker }));
      for (const lb of response.LoadBalancers || []) {
        resources.push({
          id: lb.LoadBalancerName || '',
          arn: lb.LoadBalancerArn || '',
          type: `elb:${lb.Type || 'unknown'}`,
          service: 'elb',
          name: lb.LoadBalancerName || '',
          region,
          state: lb.State?.Code || 'unknown',
          createdAt: lb.CreatedTime?.toISOString(),
          tags: {},
        });
      }
      marker = response.NextMarker;
    } while (marker);

    return { service: 'elb', region, resources, errors: [] };
  },
};
