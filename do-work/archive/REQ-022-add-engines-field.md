# REQ-022: Add engines field to package.json

**UR:** UR-006
**Status:** backlog
**Created:** 2026-03-14

## Task

Add an `engines` field to the root `package.json` specifying the minimum Node.js version required. AWS SDK v3 requires Node 18+.

## Context

Without an engines field, users on older Node versions will get cryptic errors. This is a simple guardrail for public users.

## Acceptance Criteria

- [ ] Root `package.json` has `"engines": { "node": ">=18.0.0" }`

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `node -e "const pkg = require('./package.json'); console.log(pkg.engines.node)"`
   - Expected: outputs `>=18.0.0`
