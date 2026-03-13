# REQ-006: Report Generation

**UR:** UR-001
**Status:** done
**Created:** 2026-03-14

## Task

Build a report generator that combines resource inventory data and cost data into a structured JSON report. The report is saved to disk and serves as the data source for both the CLI summary and the web dashboard. Include summary statistics: total resources by service, total estimated cost by service/region, and resources with no detected cost.

## Context

The report is the bridge between the scanner (backend) and the visualizer (frontend). It needs to be a well-structured JSON file that the web UI can load.

## Acceptance Criteria

- [ ] Report schema defined in shared types
- [ ] Report includes: scan timestamp, account info, resources grouped by service and region, cost summaries
- [ ] Summary section with totals: resource count by service, cost by service, cost by region, top 10 most expensive resources
- [ ] Report saved as JSON file to configurable output path
- [ ] CLI prints a human-readable summary table after scan completes (service | region | count | est. cost)
- [ ] Unit tests for report generation and summary calculations

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **test** `npm run test -- --filter=report`
   - Expected: All report generation tests pass
2. **build** `npm run build`
   - Expected: Clean compilation
