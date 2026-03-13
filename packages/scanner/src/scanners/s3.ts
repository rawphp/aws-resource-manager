import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import type { ServiceScanner } from '../engine.js';
import type { ServiceScanResult } from '@aws-resource-manager/shared';
import type { AwsCredentials } from '../credentials.js';
import { makeCredentials } from './helpers.js';

export const s3Scanner: ServiceScanner = {
  service: 's3',
  global: true,
  async scan(credentials: AwsCredentials, region: string): Promise<ServiceScanResult> {
    const client = new S3Client({
      region,
      credentials: makeCredentials(credentials),
    });

    const response = await client.send(new ListBucketsCommand({}));
    const resources = (response.Buckets || []).map((bucket) => ({
      id: bucket.Name || '',
      arn: `arn:aws:s3:::${bucket.Name}`,
      type: 's3:bucket',
      service: 's3',
      name: bucket.Name || '',
      region: 'global',
      state: 'active',
      createdAt: bucket.CreationDate?.toISOString(),
      tags: {},
    }));

    return { service: 's3', region: 'global', resources, errors: [] };
  },
};
