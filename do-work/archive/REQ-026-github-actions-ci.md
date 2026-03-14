# REQ-026: Add GitHub Actions CI workflow

**UR:** UR-006
**Status:** backlog
**Created:** 2026-03-14

## Task

Create a `.github/workflows/ci.yml` GitHub Actions workflow that runs on push and PR to main. It should: install dependencies, run linting, run tests, and verify the build compiles.

## Context

CI is essential for a public repo to validate contributions and maintain quality. The project uses npm workspaces with vitest for testing.

## Acceptance Criteria

- [ ] `.github/workflows/ci.yml` exists
- [ ] Triggers on push to main and pull requests
- [ ] Runs: `npm ci`, `npm run lint`, `npm test`, `npm run build`
- [ ] Uses Node 18+ matrix

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `cat .github/workflows/ci.yml | head -5`
   - Expected: valid YAML with `name:` field
