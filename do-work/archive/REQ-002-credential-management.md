# REQ-002: Multi-Account Credential Management

**UR:** UR-001
**Status:** done
**Created:** 2026-03-14

## Task

Build a credential manager that reads AWS account configurations from a local config file (YAML). Each account entry includes a name, access key ID, secret access key, and optional session token / role ARN. Credentials are never logged. Provide a function that returns authenticated AWS SDK clients for a given account.

## Context

The app needs to scan multiple AWS accounts. Users provide credentials for each account, and the scanner uses them to enumerate resources per account.

## Acceptance Criteria

- [x] Config file schema defined (YAML) with account name, credentials, optional role ARN
- [x] Parser that reads and validates the config file
- [x] Function `resolveCredentials(account)` returns credentials (with STS AssumeRole support)
- [x] Support for STS AssumeRole when role ARN is provided
- [x] Credentials are never written to logs or console output
- [x] Example config file provided (with placeholder values)
- [x] Unit tests for config parsing and validation

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **test** `npm run test -- --filter=credential`
   - Expected: All credential management tests pass
2. **build** `npm run build`
   - Expected: Clean compilation with no errors

## Outputs

- packages/scanner/src/credentials.ts — credential management module
- packages/scanner/src/credentials.test.ts — 9 unit tests
- accounts.example.yaml — example config file
