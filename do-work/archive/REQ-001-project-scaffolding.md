# REQ-001: Project Scaffolding

**UR:** UR-001
**Status:** done
**Created:** 2026-03-14

## Task

Set up the Node.js/TypeScript project with a monorepo structure: a `scanner` package (CLI + core logic) and a `web` package (React dashboard). Initialize package.json, TypeScript config, ESLint, and basic directory structure.

## Context

The AWS Resource Manager needs both a scanning/CLI component and a web visualizer. A monorepo keeps them together with shared types.

## Acceptance Criteria

- [x] Root package.json with workspaces configured
- [x] `packages/scanner/` with TypeScript config, src/index.ts entry point
- [x] `packages/web/` with Vite + React + TypeScript scaffolded
- [x] `packages/shared/` for shared types between scanner and web
- [x] ESLint configured at root level
- [x] `npm run build` succeeds for all packages
- [x] Basic .gitignore covering node_modules, dist, .env

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build`
   - Expected: All three packages compile without errors
2. **test** `npx tsc --noEmit`
   - Expected: Zero type errors across all packages

## Outputs

- packages/shared/src/index.ts — shared type definitions
- packages/scanner/src/index.ts — scanner entry point
- packages/web/src/App.tsx — React app shell
- package.json — monorepo root with workspaces
