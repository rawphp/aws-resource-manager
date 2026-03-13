# REQ-011: Reports API Middleware

**UR:** UR-003
**Status:** backlog
**Created:** 2026-03-14

## Task

Add a Vite dev server middleware plugin that serves two API endpoints:
- `GET /api/reports` — lists all report JSON files in the `reports/` directory, sorted newest-first
- `GET /api/reports/:filename` — serves the contents of a specific report file

Include path traversal prevention (reject `..` and `/` in filenames). Return empty array if `reports/` directory doesn't exist.

## Context

The dashboard needs server-side endpoints to discover and load reports from disk so it can auto-load the latest report and let users switch between reports via a dropdown.

## Acceptance Criteria

- [ ] `GET /api/reports` returns a JSON array of report filenames sorted newest-first
- [ ] `GET /api/reports/:filename` returns the report JSON content
- [ ] Path traversal attempts (e.g., `../package.json`) are rejected with 400
- [ ] Missing `reports/` directory returns `[]` instead of an error
- [ ] Missing report file returns 404

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build --workspace=packages/web`
   - Expected: builds without errors
2. **runtime** Start dev server (`npm run dev --workspace=packages/web`), then `curl http://localhost:5173/api/reports`
   - Expected: JSON array of report filenames (or `[]` if no reports exist)
3. **runtime** `curl http://localhost:5173/api/reports/..%2Fpackage.json`
   - Expected: 400 response, not file contents
