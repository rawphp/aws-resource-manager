# REQ-010: Resource Selection and Cleanup

**UR:** UR-001
**Status:** backlog
**Created:** 2026-03-14

## Task

Add a cleanup workflow to the web dashboard. Users can select resources for deletion via checkboxes in the resource table. Selected resources are shown in a "cleanup queue" panel with a review step. Before deletion, show a dry-run summary of what will be deleted. Require explicit confirmation. Deletions are executed via the scanner package's delete functions, which handle dependency ordering (e.g., detach ENI before deleting, empty S3 bucket before deleting).

## Context

"The second step is to choose what we want to destroy, remove, and clean up." This is the highest-risk feature and requires careful safeguards.

## Acceptance Criteria

- [ ] Checkbox selection on resource table rows
- [ ] "Cleanup Queue" sidebar/panel showing selected resources
- [ ] "Review & Delete" button opens confirmation modal with dry-run summary
- [ ] Dry-run summary shows: resource name, type, region, estimated cost savings, and any dependent resources that will also be affected
- [ ] Explicit confirmation required (type account name to confirm, similar to AWS console)
- [ ] Delete functions implemented for key services: EC2 instances, EBS volumes, Elastic IPs, S3 buckets, RDS instances, Lambda functions, ELB/ALB
- [ ] Dependency-aware deletion ordering
- [ ] Progress indicator during deletion with per-resource success/failure status
- [ ] Deletion results logged to a cleanup report file

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build`
   - Expected: Web app builds successfully
2. **test** `npm run test -- --filter=cleanup`
   - Expected: Cleanup logic tests pass including dependency ordering
3. **ui** Navigate to resource table, select resources, click Review & Delete
   - Expected: Confirmation modal appears with dry-run summary, requires typed confirmation
