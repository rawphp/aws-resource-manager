# REQ-019: Wire CleanupPanel to delete API

**UR:** UR-005
**Status:** done
**Created:** 2026-03-14

## Task

Update `CleanupPanel.tsx` to call `POST /api/delete` instead of `alert()`. Show loading state during deletion, then display results (success/failure per resource) before closing the modal.

## Context

The CleanupPanel UI has a confirmation flow (select resources → review → type DELETE → confirm) but line 166 just shows an `alert()`. Now that REQ-018 adds the API endpoint, this component needs to call it.

## Acceptance Criteria

- [x] Delete button calls `POST /api/delete` with selected resources
- [x] Loading/progress state shown while deletion is in progress
- [x] Results displayed after completion showing success/failure per resource
- [x] Failed deletions show error messages
- [x] Selection is cleared only after user acknowledges results
- [x] The `alert()` call is removed

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npx tsc --noEmit -p packages/web/tsconfig.json`
   - Expected: no type errors
2. **build** `npx vite build --config packages/web/vite.config.ts`
   - Expected: build succeeds

## Outputs

- `packages/web/src/components/CleanupPanel.tsx` — wired to POST /api/delete with loading state and results display
