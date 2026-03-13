# REQ-012: Auto-Load Latest Report

**UR:** UR-003
**Status:** backlog
**Created:** 2026-03-14

## Task

Update the `useReport` hook to fetch `/api/reports` on mount and automatically load the latest (first) report. Add `availableReports`, `currentReportName`, and `selectReport()` to the hook's return value. Show a loading state while fetching. Fall back to the existing `FileUpload` component if no reports are available.

## Context

Users want the dashboard to show data immediately on load without manually uploading a file each time. The latest report should load automatically, with the manual upload as a fallback for first-time users or when no reports directory exists.

## Acceptance Criteria

- [ ] On mount, the hook fetches `/api/reports` and auto-loads the latest report
- [ ] Loading state is shown while the report is being fetched
- [ ] If no reports exist, the FileUpload screen is shown as fallback
- [ ] `availableReports` exposes the list of report filenames
- [ ] `currentReportName` tracks which report is currently loaded
- [ ] `selectReport(filename)` loads a different report by name

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build --workspace=packages/web`
   - Expected: builds without errors
2. **ui** Start dev server with at least one report in `reports/`, navigate to `http://localhost:5173`
   - Expected: dashboard loads automatically with the latest report data visible — no file upload prompt
3. **ui** Remove or rename `reports/` directory, navigate to `http://localhost:5173`
   - Expected: FileUpload screen is shown
