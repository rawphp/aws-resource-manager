# REQ-025: Add SECURITY.md

**UR:** UR-006
**Status:** backlog
**Created:** 2026-03-14

## Task

Create a `SECURITY.md` file documenting how to report security vulnerabilities and best practices for AWS credential management when using this tool.

## Context

This tool interacts with AWS credentials and can delete resources. Clear security guidance is essential for a public release of an AWS tool.

## Acceptance Criteria

- [ ] `SECURITY.md` exists at project root
- [ ] Covers: vulnerability reporting process, credential management best practices
- [ ] Warns against committing `accounts.yaml`

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `test -f SECURITY.md && echo "exists"`
   - Expected: outputs "exists"
