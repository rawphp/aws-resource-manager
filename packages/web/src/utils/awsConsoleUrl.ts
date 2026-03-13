import type { DiscoveredResource } from '@aws-resource-manager/shared';

function regionUrl(region: string): string {
  return `https://${region}.console.aws.amazon.com`;
}

export function getAwsConsoleUrl(resource: DiscoveredResource): string | null {
  const { service, type, id, region, arn } = resource;
  const r = region === 'global' ? 'us-east-1' : region;

  switch (service) {
    case 'ec2': {
      if (type.startsWith('ec2:instance'))
        return `${regionUrl(r)}/ec2/home?region=${r}#InstanceDetails:instanceId=${id}`;
      if (type.startsWith('ec2:volume'))
        return `${regionUrl(r)}/ec2/home?region=${r}#VolumeDetails:volumeId=${id}`;
      if (type === 'ec2:elastic-ip')
        return `${regionUrl(r)}/ec2/home?region=${r}#ElasticIpDetails:AllocationId=${id}`;
      if (type === 'ec2:nat-gateway')
        return `${regionUrl(r)}/vpc/home?region=${r}#NatGatewayDetails:natGatewayId=${id}`;
      return null;
    }
    case 's3':
      return `https://s3.console.aws.amazon.com/s3/buckets/${id}`;
    case 'rds': {
      const isCluster = type.startsWith('rds:cluster');
      return `${regionUrl(r)}/rds/home?region=${r}#database:id=${id};is-cluster=${isCluster}`;
    }
    case 'lambda':
      return `${regionUrl(r)}/lambda/home?region=${r}#/functions/${id}`;
    case 'elb':
      return `${regionUrl(r)}/ec2/home?region=${r}#LoadBalancer:loadBalancerArn=${arn}`;
    case 'cloudfront':
      return `${regionUrl('us-east-1')}/cloudfront/v4/home#/distributions/${id}`;
    case 'route53': {
      // Route 53 hosted zone IDs may be prefixed with /hostedzone/
      const zoneId = id.replace(/^\/hostedzone\//, '');
      return `${regionUrl('us-east-1')}/route53/v2/hostedzones#ListRecordSets/${zoneId}`;
    }
    case 'ecs': {
      if (type === 'ecs:cluster')
        return `${regionUrl(r)}/ecs/v2/clusters/${id}/services?region=${r}`;
      if (type === 'ecs:service') {
        // ECS service ARN format: arn:aws:ecs:region:account:service/cluster-name/service-name
        const parts = arn.split('/');
        const clusterName = parts.length >= 3 ? parts[parts.length - 2] : '';
        return `${regionUrl(r)}/ecs/v2/clusters/${clusterName}/services/${id}?region=${r}`;
      }
      return null;
    }
    case 'dynamodb':
      return `${regionUrl(r)}/dynamodbv2/home?region=${r}#table?name=${id}`;
    case 'elasticache':
      return `${regionUrl(r)}/elasticache/home?region=${r}#/redis/${id}`;
    case 'redshift':
      return `${regionUrl(r)}/redshiftv2/home?region=${r}#cluster-details?cluster=${id}`;
    case 'opensearch':
      return `${regionUrl(r)}/aos/home?region=${r}#/opensearch/domains/${id}`;
    case 'sagemaker':
      return `${regionUrl(r)}/sagemaker/home?region=${r}#/endpoints/${id}`;
    case 'eks':
      return `${regionUrl(r)}/eks/home?region=${r}#/clusters/${id}`;
    default:
      return null;
  }
}
