# REQ-029: Upgrade CI actions to Node.js 24 compatible versions

**UR:** UR-007
**Status:** backlog
**Created:** 2026-03-14

## Task

Update `actions/checkout` and `actions/setup-node` in `.github/workflows/ci.yml` to v5 to resolve Node.js 20 deprecation warnings.

## Context

GitHub Actions is deprecating Node.js 20 runners. The v4 versions of checkout and setup-node use Node.js 20 and will be forced to Node.js 24 starting June 2nd, 2026. Upgrading to v5 resolves the warnings.

## Acceptance Criteria

- [ ] `actions/checkout` updated to `v5`
- [ ] `actions/setup-node` updated to `v5`

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `grep -E 'actions/checkout@v5|actions/setup-node@v5' .github/workflows/ci.yml | wc -l`
   - Expected: 2 (both actions at v5)
