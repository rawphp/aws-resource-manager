# AWS Resource Manager

[![CI](https://github.com/rawphp/aws-resource-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/rawphp/aws-resource-manager/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Scan all your AWS resources across every region and service, see what you're being charged for, and clean up what you don't need.

Works with multiple AWS accounts. Generates a JSON report that powers both a CLI summary and a web dashboard.

## What It Does

1. **Scan** - Discovers resources across 14 AWS services and all enabled regions
2. **Visualize** - Web dashboard with filterable resource table, cost charts, and waste detection
3. **Clean up** - Select resources for deletion with a confirmation workflow

### Supported Services

EC2 (instances, EBS volumes, Elastic IPs, NAT Gateways), S3, RDS (instances + clusters), Lambda, ELB/ALB, CloudFront, Route 53, ECS (clusters + services), DynamoDB, ElastiCache, Redshift, OpenSearch, SageMaker, EKS

## Quick Start

### 1. Install

```bash
git clone https://github.com/rawphp/aws-resource-manager.git
cd aws-resource-manager
npm install
npm run build
```

Requires **Node.js 18+**.

### 2. Configure Accounts

```bash
cp accounts.example.yaml accounts.yaml
```

Edit `accounts.yaml` with your AWS credentials:

```yaml
accounts:
  - name: production
    accessKeyId: AKIAIOSFODNN7EXAMPLE
    secretAccessKey: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
    defaultRegion: us-east-1

  - name: staging
    accessKeyId: AKIAIOSFODNN8EXAMPLE
    secretAccessKey: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
    roleArn: arn:aws:iam::123456789012:role/ReadOnlyAccess
```

**Never commit `accounts.yaml` to version control.** It's already in `.gitignore`. See [SECURITY.md](SECURITY.md) for credential best practices.

### 3. Run a Scan

```bash
# Using compiled output (after npm run build):
npm run start --workspace=packages/scanner -- scan --config accounts.yaml

# Or for development (no build step needed):
npm run dev --workspace=packages/scanner -- scan --config accounts.yaml
```

This will:
- Discover all enabled regions for each account
- Scan all 14 services across every region
- Fetch cost data from AWS Cost Explorer (last 30 days)
- Generate a JSON report in `./reports/`
- Print a summary table to the console

### 4. View the Dashboard

```bash
npm run dev --workspace=packages/web
```

Open `http://localhost:5173` and upload your report JSON file.

## CLI Reference

```
aws-resource-manager scan [options]    Run a full scan
aws-resource-manager report [options]  View an existing report
```

### Scan Options

| Flag | Description | Default |
|------|-------------|---------|
| `--config <path>` | Path to accounts YAML config | `./accounts.yaml` |
| `--output <dir>` | Output directory for reports | `./reports` |
| `--account <name>` | Scan only this account | all accounts |
| `--regions <list>` | Comma-separated regions | all enabled |
| `--start-date <date>` | Cost data start (YYYY-MM-DD) | 30 days ago |
| `--end-date <date>` | Cost data end (YYYY-MM-DD) | today |

### Report Options

| Flag | Description |
|------|-------------|
| `--input <path>` | Path to existing report JSON |

## Web Dashboard

The dashboard has two views:

**Resources** - Filterable, sortable table of all discovered resources. Filter by service, region, account, or search by name/ID. Select resources with checkboxes to add them to the cleanup queue.

**Costs** - Bar charts showing cost breakdown by service and region, top 10 most expensive resources, and waste detection (stopped instances, unattached EBS volumes, unused Elastic IPs).

**Cleanup** - Select resources from the table, review the dry-run summary, type `DELETE` to confirm. Shows estimated monthly savings.

## IAM Permissions

The scanning account needs read-only access to the services being scanned. Here's a minimal IAM policy for scanning:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "s3:ListAllMyBuckets",
        "s3:GetBucketLocation",
        "s3:GetBucketTagging",
        "rds:DescribeDBInstances",
        "rds:DescribeDBClusters",
        "rds:ListTagsForResource",
        "lambda:ListFunctions",
        "lambda:ListTags",
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeTags",
        "cloudfront:ListDistributions",
        "cloudfront:ListTagsForResource",
        "route53:ListHostedZones",
        "route53:ListResourceRecordSets",
        "route53:ListTagsForResource",
        "ecs:ListClusters",
        "ecs:DescribeClusters",
        "ecs:ListServices",
        "ecs:DescribeServices",
        "ecs:ListTagsForResource",
        "dynamodb:ListTables",
        "dynamodb:DescribeTable",
        "dynamodb:ListTagsOfResource",
        "elasticache:DescribeCacheClusters",
        "elasticache:DescribeReplicationGroups",
        "elasticache:ListTagsForResource",
        "redshift:DescribeClusters",
        "es:ListDomainNames",
        "es:DescribeDomains",
        "es:ListTags",
        "sagemaker:ListNotebookInstances",
        "sagemaker:ListEndpoints",
        "sagemaker:ListTags",
        "eks:ListClusters",
        "eks:DescribeCluster",
        "ce:GetCostAndUsage",
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

For cleanup/deletion, the account also needs write permissions for the targeted services.

## Project Structure

```
packages/
  shared/     Shared TypeScript types
  scanner/    CLI, scanning engine, service scanners, cost integration, cleanup
  web/        React dashboard (Vite)
```

## Development

```bash
npm install
npm run build        # Build all packages
npm run test         # Run all tests
npm run lint         # Run ESLint
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and [SECURITY.md](SECURITY.md) for credential management best practices.

## License

[MIT](LICENSE)
