# REQ-003: Resource Scanner Engine

**UR:** UR-001
**Status:** backlog
**Created:** 2026-03-14

## Task

Build the core scanning engine that orchestrates resource discovery across all AWS regions. The engine takes an authenticated account, iterates over all enabled regions, and runs service-specific scanner modules against each region. Includes rate limiting, exponential backoff on throttling, concurrency controls, and graceful handling of AccessDenied errors (log and skip, don't crash).

## Context

AWS has 30+ regions and 200+ services. The engine needs to handle throttling, permission gaps, and parallelism efficiently. Individual service scanners will be plugged in as separate modules.

## Acceptance Criteria

- [ ] Scanner engine accepts an account config and a list of scanner modules
- [ ] Automatically discovers all enabled regions via EC2 DescribeRegions
- [ ] Runs scanners across all regions with configurable concurrency (default: 5 regions in parallel)
- [ ] Implements exponential backoff on ThrottlingException
- [ ] Catches and logs AccessDenied errors per service/region without stopping the scan
- [ ] Returns a structured result: `{ account, regions: { [region]: { [service]: Resource[] } } }`
- [ ] Progress reporting callback (for CLI/UI progress indicators)
- [ ] Unit tests for engine orchestration logic

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **test** `npm run test -- --filter=scanner-engine`
   - Expected: All engine tests pass including throttle/retry and error handling
2. **build** `npm run build`
   - Expected: Clean compilation
