# REQ-028: Add CHANGELOG.md

**UR:** UR-006
**Status:** backlog
**Created:** 2026-03-14

## Task

Create a `CHANGELOG.md` following Keep a Changelog format. Include a single `v1.0.0` entry summarizing the initial public release features.

## Context

A changelog helps users and contributors understand what has changed between releases. Starting with v1.0.0 signals this is the first stable public release.

## Acceptance Criteria

- [ ] `CHANGELOG.md` exists at project root
- [ ] Uses Keep a Changelog format
- [ ] Has a v1.0.0 entry with key features listed

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `test -f CHANGELOG.md && echo "exists"`
   - Expected: outputs "exists"
