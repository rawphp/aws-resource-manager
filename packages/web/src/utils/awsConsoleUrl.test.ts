import { describe, it, expect } from 'vitest';
import { getAwsConsoleUrl } from './awsConsoleUrl';
import type { DiscoveredResource } from '@aws-resource-manager/shared';

function makeResource(overrides: Partial<DiscoveredResource>): DiscoveredResource {
  return {
    id: 'test-id',
    arn: 'arn:aws:ec2:us-east-1:123456789:instance/test-id',
    type: 'ec2:instance:t3.medium',
    service: 'ec2',
    name: 'test-resource',
    region: 'us-east-1',
    state: 'running',
    tags: {},
    ...overrides,
  };
}

describe('getAwsConsoleUrl', () => {
  it('returns an EC2 instance URL with correct region and instance ID', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'ec2',
      type: 'ec2:instance:t3.medium',
      id: 'i-0abc123def456',
      region: 'us-west-2',
    }));
    expect(url).toBe('https://us-west-2.console.aws.amazon.com/ec2/home?region=us-west-2#InstanceDetails:instanceId=i-0abc123def456');
  });

  it('returns an EC2 volume URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'ec2',
      type: 'ec2:volume:gp3:100GB',
      id: 'vol-0abc123',
      region: 'us-east-1',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#VolumeDetails:volumeId=vol-0abc123');
  });

  it('returns an EC2 elastic IP URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'ec2',
      type: 'ec2:elastic-ip',
      id: 'eipalloc-0abc123',
      region: 'eu-west-1',
    }));
    expect(url).toBe('https://eu-west-1.console.aws.amazon.com/ec2/home?region=eu-west-1#ElasticIpDetails:AllocationId=eipalloc-0abc123');
  });

  it('returns an EC2 NAT gateway URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'ec2',
      type: 'ec2:nat-gateway',
      id: 'nat-0abc123',
      region: 'us-east-1',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/vpc/home?region=us-east-1#NatGatewayDetails:natGatewayId=nat-0abc123');
  });

  it('returns an S3 bucket URL (global, no region)', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 's3',
      type: 's3:bucket',
      id: 'my-bucket',
      region: 'global',
    }));
    expect(url).toBe('https://s3.console.aws.amazon.com/s3/buckets/my-bucket');
  });

  it('returns an RDS instance URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'rds',
      type: 'rds:instance:db.t3.micro',
      id: 'my-db',
      region: 'us-east-1',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/rds/home?region=us-east-1#database:id=my-db;is-cluster=false');
  });

  it('returns an RDS cluster URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'rds',
      type: 'rds:cluster:aurora-postgresql',
      id: 'my-cluster',
      region: 'us-east-1',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/rds/home?region=us-east-1#database:id=my-cluster;is-cluster=true');
  });

  it('returns a Lambda function URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'lambda',
      type: 'lambda:function:nodejs20.x',
      id: 'my-function',
      region: 'us-east-1',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions/my-function');
  });

  it('returns an ELB URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'elb',
      type: 'elb:application',
      id: 'my-alb',
      region: 'us-east-1',
      arn: 'arn:aws:elasticloadbalancing:us-east-1:123456789:loadbalancer/app/my-alb/abc123',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#LoadBalancer:loadBalancerArn=arn:aws:elasticloadbalancing:us-east-1:123456789:loadbalancer/app/my-alb/abc123');
  });

  it('returns a CloudFront distribution URL (global)', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'cloudfront',
      type: 'cloudfront:distribution',
      id: 'E1ABC2DEF3',
      region: 'global',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/cloudfront/v4/home#/distributions/E1ABC2DEF3');
  });

  it('returns a Route 53 hosted zone URL (global)', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'route53',
      type: 'route53:hosted-zone',
      id: '/hostedzone/Z1ABC2DEF3',
      region: 'global',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones#ListRecordSets/Z1ABC2DEF3');
  });

  it('returns an ECS cluster URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'ecs',
      type: 'ecs:cluster',
      id: 'my-cluster',
      region: 'us-east-1',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/ecs/v2/clusters/my-cluster/services?region=us-east-1');
  });

  it('returns an ECS service URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'ecs',
      type: 'ecs:service',
      id: 'my-service',
      region: 'us-east-1',
      arn: 'arn:aws:ecs:us-east-1:123456789:service/my-cluster/my-service',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/ecs/v2/clusters/my-cluster/services/my-service?region=us-east-1');
  });

  it('returns a DynamoDB table URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'dynamodb',
      type: 'dynamodb:table:PAY_PER_REQUEST',
      id: 'my-table',
      region: 'us-east-1',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/dynamodbv2/home?region=us-east-1#table?name=my-table');
  });

  it('returns an ElastiCache cluster URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'elasticache',
      type: 'elasticache:redis:cache.t3.micro',
      id: 'my-cache',
      region: 'us-east-1',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/elasticache/home?region=us-east-1#/redis/my-cache');
  });

  it('returns a Redshift cluster URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'redshift',
      type: 'redshift:cluster:dc2.large',
      id: 'my-redshift',
      region: 'us-east-1',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/redshiftv2/home?region=us-east-1#cluster-details?cluster=my-redshift');
  });

  it('returns an OpenSearch domain URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'opensearch',
      type: 'opensearch:domain:OpenSearch_2.11',
      id: 'my-domain',
      region: 'us-east-1',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/aos/home?region=us-east-1#/opensearch/domains/my-domain');
  });

  it('returns a SageMaker endpoint URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'sagemaker',
      type: 'sagemaker:endpoint',
      id: 'my-endpoint',
      region: 'us-east-1',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/sagemaker/home?region=us-east-1#/endpoints/my-endpoint');
  });

  it('returns an EKS cluster URL', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'eks',
      type: 'eks:cluster:1.28',
      id: 'my-eks',
      region: 'us-east-1',
    }));
    expect(url).toBe('https://us-east-1.console.aws.amazon.com/eks/home?region=us-east-1#/clusters/my-eks');
  });

  it('returns null for an unsupported service', () => {
    const url = getAwsConsoleUrl(makeResource({
      service: 'unknown',
      type: 'unknown:thing',
    }));
    expect(url).toBeNull();
  });
});
