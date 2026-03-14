# REQ-024: Add CONTRIBUTING.md

**UR:** UR-006
**Status:** backlog
**Created:** 2026-03-14

## Task

Create a `CONTRIBUTING.md` file with guidelines for contributing to the project: how to set up the dev environment, run tests, submit PRs, and coding standards.

## Context

Public repos need contribution guidelines so external contributors know the expected workflow and standards.

## Acceptance Criteria

- [ ] `CONTRIBUTING.md` exists at project root
- [ ] Covers: dev setup, running tests, linting, PR process
- [ ] References the monorepo workspace structure

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `test -f CONTRIBUTING.md && echo "exists"`
   - Expected: outputs "exists"
