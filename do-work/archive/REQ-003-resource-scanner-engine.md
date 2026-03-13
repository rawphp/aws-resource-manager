# REQ-003: Resource Scanner Engine

**UR:** UR-001
**Status:** done
**Created:** 2026-03-14

## Task

Build the core scanning engine that orchestrates resource discovery across all AWS regions.

## Acceptance Criteria

- [x] Scanner engine accepts an account config and a list of scanner modules
- [x] Automatically discovers all enabled regions via EC2 DescribeRegions
- [x] Runs scanners across all regions with configurable concurrency (default: 5 regions in parallel)
- [x] Implements exponential backoff on ThrottlingException
- [x] Catches and logs AccessDenied errors per service/region without stopping the scan
- [x] Returns a structured result: `{ account, regions: { [region]: { [service]: Resource[] } } }`
- [x] Progress reporting callback (for CLI/UI progress indicators)
- [x] Unit tests for engine orchestration logic

## Outputs

- packages/scanner/src/engine.ts — scanner engine with retry, concurrency, and progress
- packages/scanner/src/engine.test.ts — 9 unit tests
