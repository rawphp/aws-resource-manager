# REQ-007: CLI Interface

**UR:** UR-001
**Status:** done
**Created:** 2026-03-14

## Task

Build the CLI entry point that ties together credential loading, scanning, cost retrieval, and report generation. Commands: `scan` (run full scan and generate report), `report` (view existing report). Flags for: config file path, output directory, date range, specific account, specific regions.

## Context

The CLI is the primary way to trigger scans and generate reports. The web UI consumes the output.

## Acceptance Criteria

- [ ] `aws-resource-manager scan --config ./accounts.yaml` runs a full scan
- [ ] `aws-resource-manager report --input ./report.json` prints summary from existing report
- [ ] Progress indicator showing current account/region/service being scanned
- [ ] `--regions` flag to limit scan to specific regions
- [ ] `--account` flag to scan a single account from config
- [ ] `--output` flag for report output path (default: `./reports/`)
- [ ] `--help` shows usage information
- [ ] Exit code 0 on success, 1 on failure

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **runtime** `npx ts-node packages/scanner/src/cli.ts --help`
   - Expected: Displays usage information with all flags documented
2. **build** `npm run build`
   - Expected: Clean compilation
