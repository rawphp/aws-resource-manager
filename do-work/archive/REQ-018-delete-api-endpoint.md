# REQ-018: Add delete API endpoint

**UR:** UR-005
**Status:** done
**Created:** 2026-03-14

## Task

Add a `POST /api/delete` endpoint to the Vite dev server plugin in `packages/web/vite.config.ts`. The endpoint should:
1. Accept a JSON body with `{ accountName: string, resources: DiscoveredResource[] }`
2. Load credentials from `accounts.yaml` using the scanner's `parseConfigFile` and `resolveCredentials`
3. Call `deleteResource()` from `cleanup.ts` for each resource
4. Return `{ results: DeleteResult[] }` with per-resource success/failure

## Context

The backend delete logic exists in `packages/scanner/src/cleanup.ts` and the UI exists in `CleanupPanel.tsx`, but there's no API endpoint connecting them. The delete button currently just shows an `alert()`.

## Acceptance Criteria

- [x] `POST /api/delete` endpoint exists in the Vite plugin
- [x] Endpoint loads credentials from `accounts.yaml` via `parseConfigFile` and `resolveCredentials`
- [x] Endpoint calls `deleteResource()` for each resource in the request
- [x] Endpoint returns JSON array of `DeleteResult` objects
- [x] Endpoint returns 400 for invalid/missing request body
- [x] Endpoint returns 404 if the account is not found in `accounts.yaml`

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npx tsc --noEmit -p packages/web/tsconfig.json`
   - Expected: no type errors
2. **build** `npx vite build --config packages/web/vite.config.ts`
   - Expected: build succeeds

## Outputs

- `packages/web/vite.config.ts` — added `deleteApiPlugin()` with POST /api/delete endpoint
