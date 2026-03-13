# REQ-013: Report Selector Dropdown

**UR:** UR-003
**Status:** backlog
**Created:** 2026-03-14

## Task

Add a dropdown selector to the App header that displays all available reports with human-readable timestamps (e.g., "2026-03-14 08:30:00" instead of "report-2026-03-14T08-30-00.json"). Selecting a report from the dropdown loads it via `selectReport()`. Clear any resource selections when switching reports.

## Context

Users need a way to browse and compare older scan reports without re-uploading files. The dropdown should be visible in the main dashboard header alongside the existing Resources/Costs view toggle.

## Acceptance Criteria

- [ ] Dropdown is visible in the dashboard header when reports are available
- [ ] Dropdown shows formatted timestamps, not raw filenames
- [ ] Selecting a different report loads it and updates the dashboard
- [ ] Resource selections (checkboxes) are cleared when switching reports
- [ ] Dropdown is hidden when no reports are available (manual upload fallback)

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build --workspace=packages/web`
   - Expected: builds without errors
2. **ui** Start dev server with 2+ reports in `reports/`, navigate to `http://localhost:5173`
   - Expected: dropdown visible in header showing formatted timestamps, latest report selected by default
3. **ui** Select a different report from the dropdown
   - Expected: dashboard updates with the selected report's data, any previously checked resources are unchecked
