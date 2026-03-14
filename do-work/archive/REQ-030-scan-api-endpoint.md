# REQ-030: Scan API Endpoint

**UR:** UR-008
**Status:** done
**Created:** 2026-03-14

## Task

Add a POST `/api/scan` endpoint to the Vite dev server that triggers the scanner engine. The endpoint should:
- Read accounts from `accounts.yaml` (resolving the path the same way as the existing delete endpoint)
- Call `scanAccount()` for each account using the scanner engine
- Generate and save a report using `generateReport()` and `saveReport()`
- Track whether a scan is currently running (server-side boolean flag)
- Return a GET `/api/scan/status` endpoint that returns `{ scanning: boolean }` so the frontend can poll for state
- Return the report filename on completion

Follow the existing Vite plugin pattern (`reportsApiPlugin`, `deleteApiPlugin`) by creating a new `scanApiPlugin`.

## Context

The user wants to trigger the scanner from the dashboard instead of running it separately via CLI. The scanner engine already exists and has all the logic — this REQ just exposes it as an HTTP endpoint.

## Acceptance Criteria

- [x] POST `/api/scan` triggers a full scan of all accounts in accounts.yaml
- [x] GET `/api/scan/status` returns `{ scanning: boolean }`
- [x] While a scan is running, subsequent POST `/api/scan` requests return 409 Conflict
- [x] On completion, the scan saves a report to `/reports/` and returns the filename
- [x] Errors during scanning return appropriate error responses
- [x] The endpoint follows the same plugin pattern as existing API endpoints

## Outputs

- packages/web/vite.config.ts — scanApiPlugin added with POST /api/scan and GET /api/scan/status endpoints

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build --workspace=packages/web`
   - Expected: Build completes without errors
2. **test** `npm run test --workspace=packages/scanner`
   - Expected: All existing tests pass
3. **runtime** Start dev server and call `GET /api/scan/status`
   - Expected: Returns `{ "scanning": false }` with 200 status
