# REQ-014: AWS Console URL Builder

**UR:** UR-002
**Status:** done
**Created:** 2026-03-14

## Task

Create a utility function that generates AWS Console URLs for each supported resource type. Given a `DiscoveredResource`, it should return the correct AWS Console URL based on the resource's service, type, id, name, and region.

## Context

Users want to click on a resource in the dashboard and be taken to that resource in the AWS web console. Each AWS service has a different URL pattern for its console pages.

## Acceptance Criteria

- [x] Function accepts a `DiscoveredResource` and returns a string URL (or null if unsupported)
- [x] Covers all 14 supported services: EC2 (instances, volumes, EIPs, NAT gateways), S3, RDS (instances, clusters), Lambda, ELB, CloudFront, Route 53, ECS (clusters, services), DynamoDB, ElastiCache, Redshift, OpenSearch, SageMaker, EKS
- [x] Global resources (S3, CloudFront, Route 53) use correct region-less URL patterns
- [x] Region-scoped resources include the correct region in the URL
- [x] URLs open to the specific resource page, not just the service landing page

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `cd packages/web && npx tsc --noEmit`
   - Expected: No type errors
2. **test** Write unit tests for the URL builder covering each service type with sample resource data
   - Expected: All tests pass, each service produces a valid-looking AWS Console URL

## Assets

- None

## Outputs

- packages/web/src/utils/awsConsoleUrl.ts — URL builder utility
- packages/web/src/utils/awsConsoleUrl.test.ts — 20 unit tests covering all services
