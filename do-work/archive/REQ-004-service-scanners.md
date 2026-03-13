# REQ-004: Service Scanner Modules

**UR:** UR-001
**Status:** done
**Created:** 2026-03-14

## Task

Implement scanner modules for the top AWS services that generate charges. Each module follows a common interface: takes a region + credentials, returns a list of discovered resources with metadata (ID, type, name/tags, creation date, state). Services to cover: EC2 (instances, EBS volumes, Elastic IPs, NAT Gateways), S3 (buckets + size estimate), RDS (instances, clusters), Lambda (functions), ELB/ALB, CloudFront distributions, Route 53 hosted zones, ECS/Fargate (clusters, services), DynamoDB tables, ElastiCache clusters, Redshift clusters, OpenSearch domains, SageMaker endpoints, EKS clusters.

## Context

These ~20 services account for 95%+ of typical AWS charges. Each scanner calls the relevant AWS SDK API to list resources in a given region.

## Acceptance Criteria

- [ ] Common `ServiceScanner` interface defined in shared types
- [ ] Scanner implemented for each listed service (15+ services)
- [ ] Each scanner returns: resource ID, ARN, type, name/tags, region, state, creation date
- [ ] S3 scanner handles global scope (only scans once, not per-region)
- [ ] CloudFront and Route 53 scanners handle global scope correctly
- [ ] Unit tests with mocked AWS responses for at least 5 key scanners
- [ ] Scanner registry that maps service names to scanner modules

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **test** `npm run test -- --filter=service-scanner`
   - Expected: All service scanner tests pass
2. **build** `npm run build`
   - Expected: Clean compilation
