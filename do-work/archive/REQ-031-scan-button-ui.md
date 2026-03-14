# REQ-031: Scan Button in Dashboard

**UR:** UR-008
**Status:** done
**Created:** 2026-03-14

## Task

Add a "Scan" button to the dashboard header that triggers POST `/api/scan`. While a scan is running:
- The button should be disabled with a loading/spinning indicator
- Poll GET `/api/scan/status` to detect when the scan completes
- When the scan finishes, automatically refresh the reports list and load the new report

## Context

The user wants to trigger scans directly from the dashboard UI instead of running the CLI separately. The button should clearly indicate when a scan is in progress by being disabled.

## Acceptance Criteria

- [x] A "Scan" button is visible in the dashboard header area
- [x] Clicking the button sends POST `/api/scan`
- [x] While scanning, the button is disabled and shows a loading state
- [x] On completion, the reports list refreshes and the latest report is loaded
- [x] Error states are displayed to the user (e.g., toast or inline message)

## Outputs

- packages/web/src/hooks/useScan.ts — scan state management hook
- packages/web/src/App.tsx — scan button in header
- packages/web/src/components/FileUpload.tsx — scan button on empty state
- packages/web/src/hooks/useReport.ts — refreshReports function

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build --workspace=packages/web`
   - Expected: Build completes without errors
2. **ui** Navigate to `http://localhost:5173`, verify "Scan" button is visible in the header
   - Expected: Button is present, styled consistently with existing UI
