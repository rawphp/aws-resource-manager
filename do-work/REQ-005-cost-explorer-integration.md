# REQ-005: Cost Explorer Integration

**UR:** UR-001
**Status:** backlog
**Created:** 2026-03-14

## Task

Integrate with the AWS Cost Explorer API to retrieve cost and usage data per account. Pull cost breakdowns by service, region, and resource (where available). Support configurable date ranges (default: last 30 days). Map cost data back to discovered resources where possible using resource IDs/ARNs.

## Context

The brief asks to know "which resources I'm being charged for." Cost Explorer provides the billing perspective that complements the resource inventory from the scanners.

## Acceptance Criteria

- [ ] Function to fetch cost data grouped by service for a date range
- [ ] Function to fetch cost data grouped by region for a date range
- [ ] Function to fetch resource-level cost data (for services that support it)
- [ ] Cost data merged into the resource model — each resource gets an `estimatedMonthlyCost` field where available
- [ ] Resources with no associated cost flagged as "free tier" or "no charge detected"
- [ ] Date range configurable via CLI flag (default: last 30 days)
- [ ] Unit tests with mocked Cost Explorer responses

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **test** `npm run test -- --filter=cost`
   - Expected: All cost integration tests pass
2. **build** `npm run build`
   - Expected: Clean compilation
