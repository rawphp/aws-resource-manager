import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeVolumesCommand,
  DescribeAddressesCommand,
  DescribeNatGatewaysCommand,
} from '@aws-sdk/client-ec2';
import type { ServiceScanner } from '../engine.js';
import type { DiscoveredResource, ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials, extractTags, findName } from './helpers.js';

async function scanInstances(
  client: EC2Client,
  region: string,
): Promise<DiscoveredResource[]> {
  const resources: DiscoveredResource[] = [];
  let nextToken: string | undefined;

  do {
    const response = await client.send(
      new DescribeInstancesCommand({ NextToken: nextToken }),
    );
    for (const reservation of response.Reservations || []) {
      for (const instance of reservation.Instances || []) {
        const tags = extractTags(instance.Tags);
        resources.push({
          id: instance.InstanceId || '',
          arn: `arn:aws:ec2:${region}::instance/${instance.InstanceId}`,
          type: `ec2:instance:${instance.InstanceType || 'unknown'}`,
          service: 'ec2',
          name: findName(tags) || instance.InstanceId || '',
          region,
          state: instance.State?.Name || 'unknown',
          createdAt: instance.LaunchTime?.toISOString(),
          tags,
        });
      }
    }
    nextToken = response.NextToken;
  } while (nextToken);

  return resources;
}

async function scanVolumes(
  client: EC2Client,
  region: string,
): Promise<DiscoveredResource[]> {
  const resources: DiscoveredResource[] = [];
  let nextToken: string | undefined;

  do {
    const response = await client.send(
      new DescribeVolumesCommand({ NextToken: nextToken }),
    );
    for (const vol of response.Volumes || []) {
      const tags = extractTags(vol.Tags);
      resources.push({
        id: vol.VolumeId || '',
        arn: `arn:aws:ec2:${region}::volume/${vol.VolumeId}`,
        type: `ec2:volume:${vol.VolumeType || 'unknown'}:${vol.Size || 0}GB`,
        service: 'ec2',
        name: findName(tags) || vol.VolumeId || '',
        region,
        state: vol.Attachments?.length ? 'attached' : 'unattached',
        createdAt: vol.CreateTime?.toISOString(),
        tags,
      });
    }
    nextToken = response.NextToken;
  } while (nextToken);

  return resources;
}

async function scanElasticIPs(
  client: EC2Client,
  region: string,
): Promise<DiscoveredResource[]> {
  const response = await client.send(new DescribeAddressesCommand({}));
  return (response.Addresses || []).map((addr) => {
    const tags = extractTags(addr.Tags);
    return {
      id: addr.AllocationId || '',
      arn: `arn:aws:ec2:${region}::eip/${addr.AllocationId}`,
      type: 'ec2:elastic-ip',
      service: 'ec2',
      name: findName(tags) || addr.PublicIp || '',
      region,
      state: addr.AssociationId ? 'associated' : 'unassociated',
      tags,
    };
  });
}

async function scanNatGateways(
  client: EC2Client,
  region: string,
): Promise<DiscoveredResource[]> {
  const resources: DiscoveredResource[] = [];
  let nextToken: string | undefined;

  do {
    const response = await client.send(
      new DescribeNatGatewaysCommand({ NextToken: nextToken }),
    );
    for (const nat of response.NatGateways || []) {
      const tags = extractTags(nat.Tags);
      resources.push({
        id: nat.NatGatewayId || '',
        arn: `arn:aws:ec2:${region}::natgateway/${nat.NatGatewayId}`,
        type: 'ec2:nat-gateway',
        service: 'ec2',
        name: findName(tags) || nat.NatGatewayId || '',
        region,
        state: nat.State || 'unknown',
        createdAt: nat.CreateTime?.toISOString(),
        tags,
      });
    }
    nextToken = response.NextToken;
  } while (nextToken);

  return resources;
}

export const ec2Scanner: ServiceScanner = {
  service: 'ec2',
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new EC2Client({
      region,
      credentials: makeCredentials(credentials),
    });

    const errors: string[] = [];
    const resources: DiscoveredResource[] = [];

    const scanFns = [scanInstances, scanVolumes, scanElasticIPs, scanNatGateways];
    for (const fn of scanFns) {
      try {
        resources.push(...(await fn(client, region)));
      } catch (err: unknown) {
        errors.push(`${fn.name}: ${(err as Error).message}`);
      }
    }

    return { service: 'ec2', region, resources, errors };
  },
};
