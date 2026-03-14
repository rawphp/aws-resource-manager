# REQ-032: Accounts CRUD API Endpoints

**UR:** UR-008
**Status:** done
**Created:** 2026-03-14

## Task

Add API endpoints for managing accounts in `accounts.yaml`:

- **GET `/api/accounts`** — Read and return all accounts (mask secretAccessKey and sessionToken in response, showing only last 4 chars)
- **POST `/api/accounts`** — Add a new account (validate required fields: name, accessKeyId, secretAccessKey)
- **PUT `/api/accounts/:name`** — Update an existing account by name
- **DELETE `/api/accounts/:name`** — Remove an account by name

All mutations should read the current YAML, modify the accounts array, and write back using the `yaml` package. If `accounts.yaml` doesn't exist, create it with an empty accounts array on first write.

Follow the existing Vite plugin pattern by creating an `accountsApiPlugin`.

## Context

The user wants to manage AWS accounts directly from the dashboard. Currently accounts.yaml must be edited manually. The `yaml` package is already a dependency of the scanner package.

## Acceptance Criteria

- [x] GET `/api/accounts` returns accounts with masked secrets
- [x] POST `/api/accounts` adds a new account and persists to accounts.yaml
- [x] PUT `/api/accounts/:name` updates an existing account
- [x] DELETE `/api/accounts/:name` removes an account
- [x] If accounts.yaml doesn't exist, it is created on first write
- [x] Required field validation on POST/PUT (name, accessKeyId, secretAccessKey)
- [x] Duplicate account name detection on POST

## Outputs

- packages/web/vite.config.ts — accountsApiPlugin with GET/POST/PUT/DELETE endpoints
- packages/web/src/plugins/accountsApi.test.ts — YAML operation tests

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build --workspace=packages/web`
   - Expected: Build completes without errors
2. **runtime** Start dev server and call `GET /api/accounts` when accounts.yaml doesn't exist
   - Expected: Returns `{ "accounts": [] }` with 200 status
3. **runtime** POST a new account, then GET `/api/accounts`
   - Expected: New account appears in response with masked secrets
