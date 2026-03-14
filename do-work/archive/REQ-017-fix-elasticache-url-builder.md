# REQ-017: Fix ElastiCache URL builder for engine type

**UR:** UR-004
**Status:** done
**Created:** 2026-03-14

## Task

Update the ElastiCache case in `packages/web/src/utils/awsConsoleUrl.ts` to dynamically determine the engine type (redis vs memcached) from the resource type field instead of hardcoding `#/redis/`. Add a test case for Memcached clusters.

## Context

The ElastiCache scanner stores the engine in the resource type as `elasticache:{engine}:{nodeType}`. The URL builder currently hardcodes `#/redis/` which produces broken links for Memcached clusters. This was flagged as "not completely wired up."

## Acceptance Criteria

- [x] ElastiCache URL builder extracts engine from resource type field
- [x] Redis clusters produce URLs with `#/redis/{id}`
- [x] Memcached clusters produce URLs with `#/memcached/{id}`
- [x] Unknown engine type falls back gracefully (defaults to `redis`)
- [x] Test coverage for both Redis and Memcached URL generation

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **test** `npx vitest run --reporter=verbose awsConsoleUrl`
   - Expected: all ElastiCache tests pass including new Memcached case
2. **build** `npx tsc --noEmit -p packages/web/tsconfig.json`
   - Expected: no type errors

## Outputs

- `packages/web/src/utils/awsConsoleUrl.ts` — dynamic engine type extraction for ElastiCache URLs
- `packages/web/src/utils/awsConsoleUrl.test.ts` — added Memcached and unknown engine test cases
