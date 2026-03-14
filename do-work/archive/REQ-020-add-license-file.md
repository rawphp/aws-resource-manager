# REQ-020: Add MIT LICENSE file

**UR:** UR-006
**Status:** done
**Created:** 2026-03-14

## Task

Add an MIT LICENSE file to the project root. Without a license, the code is legally "all rights reserved" and cannot be used, modified, or distributed by anyone.

## Context

The project is being prepped for public GitHub release. A LICENSE file is the most fundamental requirement for any open-source project.

## Acceptance Criteria

- [x] MIT LICENSE file exists at project root
- [x] License year and copyright holder are correct (2025, Tom Kaczocha)

## Outputs

- LICENSE — MIT License file

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `cat LICENSE | head -1`
   - Expected: contains "MIT License"
