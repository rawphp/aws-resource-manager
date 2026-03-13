import type { ServiceScanner } from '../engine.js';
import { ec2Scanner } from './ec2.js';
import { s3Scanner } from './s3.js';
import { rdsScanner } from './rds.js';
import { lambdaScanner } from './lambda.js';
import { elbScanner } from './elb.js';
import { cloudfrontScanner } from './cloudfront.js';
import { route53Scanner } from './route53.js';
import { ecsScanner } from './ecs.js';
import { dynamodbScanner } from './dynamodb.js';
import { elasticacheScanner } from './elasticache.js';
import { redshiftScanner } from './redshift.js';
import { opensearchScanner } from './opensearch.js';
import { sagemakerScanner } from './sagemaker.js';
import { eksScanner } from './eks.js';

export const allScanners: ServiceScanner[] = [
  ec2Scanner,
  s3Scanner,
  rdsScanner,
  lambdaScanner,
  elbScanner,
  cloudfrontScanner,
  route53Scanner,
  ecsScanner,
  dynamodbScanner,
  elasticacheScanner,
  redshiftScanner,
  opensearchScanner,
  sagemakerScanner,
  eksScanner,
];

export {
  ec2Scanner,
  s3Scanner,
  rdsScanner,
  lambdaScanner,
  elbScanner,
  cloudfrontScanner,
  route53Scanner,
  ecsScanner,
  dynamodbScanner,
  elasticacheScanner,
  redshiftScanner,
  opensearchScanner,
  sagemakerScanner,
  eksScanner,
};
