import { describe, it, expect, vi } from 'vitest';
import type { AwsCredentials } from '../credentials.js';

const mockCreds: AwsCredentials = {
  accessKeyId: 'AKIA123',
  secretAccessKey: 'secret',
};

// Mock all AWS SDK clients
vi.mock('@aws-sdk/client-ec2', () => ({
  EC2Client: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({
      Reservations: [
        {
          Instances: [
            {
              InstanceId: 'i-123',
              InstanceType: 't3.micro',
              State: { Name: 'running' },
              LaunchTime: new Date('2024-01-01'),
              Tags: [{ Key: 'Name', Value: 'test-server' }],
            },
          ],
        },
      ],
      Volumes: [
        {
          VolumeId: 'vol-abc',
          VolumeType: 'gp3',
          Size: 100,
          Attachments: [{ InstanceId: 'i-123' }],
          CreateTime: new Date('2024-01-01'),
          Tags: [],
        },
      ],
      Addresses: [
        {
          AllocationId: 'eipalloc-1',
          PublicIp: '1.2.3.4',
          AssociationId: null,
          Tags: [],
        },
      ],
      NatGateways: [
        {
          NatGatewayId: 'nat-123',
          State: 'available',
          CreateTime: new Date('2024-01-01'),
          Tags: [],
        },
      ],
    }),
  })),
  DescribeInstancesCommand: vi.fn(),
  DescribeVolumesCommand: vi.fn(),
  DescribeAddressesCommand: vi.fn(),
  DescribeNatGatewaysCommand: vi.fn(),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({
      Buckets: [
        { Name: 'my-bucket', CreationDate: new Date('2024-01-01') },
        { Name: 'logs-bucket', CreationDate: new Date('2024-06-01') },
      ],
    }),
  })),
  ListBucketsCommand: vi.fn(),
}));

vi.mock('@aws-sdk/client-rds', () => ({
  RDSClient: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockImplementation((cmd) => {
      if (cmd.constructor.name === 'DescribeDBInstancesCommand' || cmd.input === undefined) {
        return Promise.resolve({
          DBInstances: [
            {
              DBInstanceIdentifier: 'mydb',
              DBInstanceArn: 'arn:aws:rds:us-east-1::db:mydb',
              DBInstanceClass: 'db.t3.micro',
              DBInstanceStatus: 'available',
              InstanceCreateTime: new Date('2024-01-01'),
            },
          ],
          DBClusters: [],
        });
      }
      return Promise.resolve({ DBInstances: [], DBClusters: [] });
    }),
  })),
  DescribeDBInstancesCommand: vi.fn().mockImplementation(() => ({ input: undefined })),
  DescribeDBClustersCommand: vi.fn().mockImplementation(() => ({ input: 'clusters' })),
}));

vi.mock('@aws-sdk/client-lambda', () => ({
  LambdaClient: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({
      Functions: [
        {
          FunctionName: 'my-function',
          FunctionArn: 'arn:aws:lambda:us-east-1::function:my-function',
          Runtime: 'nodejs20.x',
          State: 'Active',
        },
      ],
    }),
  })),
  ListFunctionsCommand: vi.fn(),
}));

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockImplementation((cmd) => {
      if (cmd.constructor.name === 'ListTablesCommand' || !cmd.input?.TableName) {
        return Promise.resolve({ TableNames: ['users-table'] });
      }
      return Promise.resolve({
        Table: {
          TableName: 'users-table',
          TableArn: 'arn:aws:dynamodb:us-east-1::table/users-table',
          TableStatus: 'ACTIVE',
          CreationDateTime: new Date('2024-01-01'),
          BillingModeSummary: { BillingMode: 'PAY_PER_REQUEST' },
        },
      });
    }),
  })),
  ListTablesCommand: vi.fn().mockImplementation(() => ({})),
  DescribeTableCommand: vi.fn().mockImplementation((input: Record<string, unknown>) => ({ input })),
}));

describe('ec2Scanner', () => {
  it('discovers instances, volumes, EIPs, and NAT gateways', async () => {
    const { ec2Scanner } = await import('./ec2.js');
    const result = await ec2Scanner.scan(mockCreds, 'us-east-1');

    expect(result.service).toBe('ec2');
    // The mock returns same data for all calls, so we get instances + volumes + EIPs + NATs
    expect(result.resources.length).toBeGreaterThanOrEqual(1);
    const instance = result.resources.find((r) => r.id === 'i-123');
    expect(instance).toBeDefined();
    expect(instance?.state).toBe('running');
    expect(instance?.name).toBe('test-server');
  });
});

describe('s3Scanner', () => {
  it('discovers buckets globally', async () => {
    const { s3Scanner } = await import('./s3.js');
    expect(s3Scanner.global).toBe(true);

    const result = await s3Scanner.scan(mockCreds, 'us-east-1');
    expect(result.resources).toHaveLength(2);
    expect(result.resources[0].name).toBe('my-bucket');
    expect(result.region).toBe('global');
  });
});

describe('lambdaScanner', () => {
  it('discovers functions', async () => {
    const { lambdaScanner } = await import('./lambda.js');
    const result = await lambdaScanner.scan(mockCreds, 'us-east-1');

    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].name).toBe('my-function');
    expect(result.resources[0].type).toContain('nodejs20.x');
  });
});

describe('dynamodbScanner', () => {
  it('discovers tables', async () => {
    const { dynamodbScanner } = await import('./dynamodb.js');
    const result = await dynamodbScanner.scan(mockCreds, 'us-east-1');

    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].name).toBe('users-table');
    expect(result.resources[0].type).toContain('PAY_PER_REQUEST');
  });
});

describe('allScanners', () => {
  it('exports 14 scanners', async () => {
    const { allScanners } = await import('./index.js');
    expect(allScanners).toHaveLength(14);
    const services = allScanners.map((s) => s.service);
    expect(services).toContain('ec2');
    expect(services).toContain('s3');
    expect(services).toContain('rds');
    expect(services).toContain('lambda');
    expect(services).toContain('cloudfront');
    expect(services).toContain('route53');
  });
});
