# Ideate — UR-003

**Reviewed:** 2026-03-14

## Explorer — Assumptions & Perspectives

- The brief assumes reports exist on disk in the `reports/` directory with timestamped filenames — this is true given REQ-006 saves reports as `report-YYYY-MM-DDTHH-MM-SS.json`, but a first-time user with no reports yet needs a graceful fallback (e.g., the existing FileUpload screen).
- The brief doesn't specify whether the dropdown should show raw filenames or human-readable timestamps — users likely expect formatted dates, not `report-2026-03-14T08-30-00.json`.
- The brief implies a server-side component to list/serve reports, since the Vite dev server currently serves static files only — this means a small API middleware is needed during development.

## Challenger — Risks & Edge Cases

- If the `reports/` directory contains non-report JSON files or malformed files, the API could serve broken data — filename filtering (`.json` suffix + `report-` prefix) mitigates this but isn't bulletproof.
- Path traversal attack: the `/api/reports/:filename` endpoint must reject `..` and `/` in filenames to prevent reading arbitrary files from the filesystem.
- No reports scenario: if `reports/` doesn't exist or is empty, the app should fall back to manual upload rather than showing an empty dropdown or error.

## Connector — Links & Reuse

- The existing `FileUpload` component and `loadReport(file: File)` in `useReport` already handle manual JSON loading — the new auto-load feature should coexist with this as a fallback, not replace it.
- The `useReport` hook is the natural place to add `availableReports`, `currentReportName`, and `selectReport()` state — keeping all report logic centralized.
- The Vite plugin system (`configureServer`) is the right mechanism for adding dev-time API routes without needing a separate Express server, matching the existing project pattern.

## Summary

The feature is well-scoped: add a reports API via Vite middleware, auto-load the latest report on mount, and provide a dropdown to switch between reports. Key considerations are path traversal prevention on the API, graceful fallback when no reports exist, and human-readable formatting of report timestamps in the dropdown.
