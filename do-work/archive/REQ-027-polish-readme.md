# REQ-027: Polish README for public release

**UR:** UR-006
**Status:** backlog
**Created:** 2026-03-14

## Task

Update the README.md for public consumption: add badges (CI, license), add a copy-paste IAM policy JSON, ensure the quick start flow is clear for first-time users, and add links to CONTRIBUTING.md and SECURITY.md.

## Context

The existing README is comprehensive but needs polish for a public audience. A copy-paste IAM policy is a common friction point for AWS tools — users shouldn't have to guess which permissions they need.

## Acceptance Criteria

- [ ] README includes CI and license badges at the top
- [ ] README includes a copy-paste IAM policy JSON for read-only scanning
- [ ] README links to CONTRIBUTING.md and SECURITY.md
- [ ] Quick start section is clear for someone who has never seen the project

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `grep -c "badge" README.md`
   - Expected: at least 1 match
2. **build** `grep -c "IAM" README.md`
   - Expected: at least 1 match
