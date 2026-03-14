# REQ-021: Fix ESLint configuration

**UR:** UR-006
**Status:** done
**Created:** 2026-03-14

## Task

Create an `eslint.config.js` file for ESLint 9 (flat config format). The project has ESLint 9.0.0 and @typescript-eslint installed but no config file, so `npm run lint` currently fails.

## Context

Public contributors running `npm run lint` will hit an immediate error. A working linter is essential for contribution quality.

## Acceptance Criteria

- [x] `eslint.config.mjs` exists at project root using flat config format
- [x] Configures @typescript-eslint/parser and plugin for TypeScript files
- [x] `npm run lint` runs without errors on the existing codebase

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run lint`
   - Expected: exits 0 with no errors

## Outputs

- eslint.config.mjs — ESLint 9 flat config for TypeScript
