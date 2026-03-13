# REQ-008: Web Dashboard Setup and Resource View

**UR:** UR-001
**Status:** done
**Created:** 2026-03-14

## Task

Build the web dashboard that loads a scan report JSON file and displays an interactive resource inventory. The dashboard shows: account selector (for multi-account reports), resource table with filtering/sorting by service, region, cost, and state. Include summary cards showing total resources, total estimated cost, and resources by service.

## Context

"The first step is to visualize what's there." The web UI gives a complete view of all discovered resources and their costs across accounts.

## Acceptance Criteria

- [ ] Dashboard loads report JSON via file upload or local file path
- [ ] Account selector dropdown when multiple accounts are present
- [ ] Summary cards: total resources, total estimated monthly cost, number of services with resources
- [ ] Resource table with columns: Name, Service, Type, Region, State, Est. Cost, Created
- [ ] Table supports sorting by any column
- [ ] Filter by service, region, cost range, and state
- [ ] Search bar for filtering by resource name/ID
- [ ] Responsive layout

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build`
   - Expected: Web app builds successfully
2. **ui** Start dev server with `npm run dev`, navigate to `http://localhost:5173`, upload a sample report JSON
   - Expected: Dashboard renders with summary cards, resource table is populated and sortable
