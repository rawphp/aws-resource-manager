import {
  EC2Client,
  TerminateInstancesCommand,
  DeleteVolumeCommand,
  ReleaseAddressCommand,
  DeleteNatGatewayCommand,
} from '@aws-sdk/client-ec2';
import { S3Client, DeleteBucketCommand } from '@aws-sdk/client-s3';
import { RDSClient, DeleteDBInstanceCommand } from '@aws-sdk/client-rds';
import { LambdaClient, DeleteFunctionCommand } from '@aws-sdk/client-lambda';
import {
  ElasticLoadBalancingV2Client,
  DeleteLoadBalancerCommand,
} from '@aws-sdk/client-elastic-load-balancing-v2';
import type { DiscoveredResource } from '@aws-resource-manager/shared';
import type { AwsCredentials } from './credentials.js';

export interface DeleteResult {
  resourceId: string;
  service: string;
  success: boolean;
  error?: string;
}

type DeleteFn = (
  credentials: AwsCredentials,
  resource: DiscoveredResource,
) => Promise<DeleteResult>;

function makeCredentials(creds: AwsCredentials) {
  return {
    accessKeyId: creds.accessKeyId,
    secretAccessKey: creds.secretAccessKey,
    sessionToken: creds.sessionToken,
  };
}

const deleteHandlers: Record<string, DeleteFn> = {
  'ec2:instance': async (creds, resource) => {
    const client = new EC2Client({
      region: resource.region,
      credentials: makeCredentials(creds),
    });
    await client.send(
      new TerminateInstancesCommand({ InstanceIds: [resource.id] }),
    );
    return { resourceId: resource.id, service: 'ec2', success: true };
  },

  'ec2:volume': async (creds, resource) => {
    const client = new EC2Client({
      region: resource.region,
      credentials: makeCredentials(creds),
    });
    await client.send(new DeleteVolumeCommand({ VolumeId: resource.id }));
    return { resourceId: resource.id, service: 'ec2', success: true };
  },

  'ec2:elastic-ip': async (creds, resource) => {
    const client = new EC2Client({
      region: resource.region,
      credentials: makeCredentials(creds),
    });
    await client.send(
      new ReleaseAddressCommand({ AllocationId: resource.id }),
    );
    return { resourceId: resource.id, service: 'ec2', success: true };
  },

  'ec2:nat-gateway': async (creds, resource) => {
    const client = new EC2Client({
      region: resource.region,
      credentials: makeCredentials(creds),
    });
    await client.send(
      new DeleteNatGatewayCommand({ NatGatewayId: resource.id }),
    );
    return { resourceId: resource.id, service: 'ec2', success: true };
  },

  's3:bucket': async (creds, resource) => {
    const client = new S3Client({
      region: resource.region === 'global' ? 'us-east-1' : resource.region,
      credentials: makeCredentials(creds),
    });
    await client.send(new DeleteBucketCommand({ Bucket: resource.id }));
    return { resourceId: resource.id, service: 's3', success: true };
  },

  'rds:instance': async (creds, resource) => {
    const client = new RDSClient({
      region: resource.region,
      credentials: makeCredentials(creds),
    });
    await client.send(
      new DeleteDBInstanceCommand({
        DBInstanceIdentifier: resource.id,
        SkipFinalSnapshot: true,
      }),
    );
    return { resourceId: resource.id, service: 'rds', success: true };
  },

  'lambda:function': async (creds, resource) => {
    const client = new LambdaClient({
      region: resource.region,
      credentials: makeCredentials(creds),
    });
    await client.send(
      new DeleteFunctionCommand({ FunctionName: resource.id }),
    );
    return { resourceId: resource.id, service: 'lambda', success: true };
  },

  'elb': async (creds, resource) => {
    const client = new ElasticLoadBalancingV2Client({
      region: resource.region,
      credentials: makeCredentials(creds),
    });
    await client.send(
      new DeleteLoadBalancerCommand({ LoadBalancerArn: resource.arn }),
    );
    return { resourceId: resource.id, service: 'elb', success: true };
  },
};

function getDeleteHandlerKey(resource: DiscoveredResource): string | undefined {
  // Try exact type match first
  const typePrefix = resource.type.split(':').slice(0, 2).join(':');
  if (deleteHandlers[typePrefix]) return typePrefix;
  if (deleteHandlers[resource.service]) return resource.service;
  return undefined;
}

export function canDelete(resource: DiscoveredResource): boolean {
  return getDeleteHandlerKey(resource) !== undefined;
}

export async function deleteResource(
  credentials: AwsCredentials,
  resource: DiscoveredResource,
): Promise<DeleteResult> {
  const handlerKey = getDeleteHandlerKey(resource);
  if (!handlerKey || !deleteHandlers[handlerKey]) {
    return {
      resourceId: resource.id,
      service: resource.service,
      success: false,
      error: `No delete handler for resource type: ${resource.type}`,
    };
  }

  try {
    return await deleteHandlers[handlerKey](credentials, resource);
  } catch (err: unknown) {
    return {
      resourceId: resource.id,
      service: resource.service,
      success: false,
      error: (err as Error).message,
    };
  }
}

export function buildDryRunSummary(
  resources: DiscoveredResource[],
): { deletable: DiscoveredResource[]; notDeletable: DiscoveredResource[] } {
  const deletable: DiscoveredResource[] = [];
  const notDeletable: DiscoveredResource[] = [];

  for (const r of resources) {
    if (canDelete(r)) {
      deletable.push(r);
    } else {
      notDeletable.push(r);
    }
  }

  return { deletable, notDeletable };
}
