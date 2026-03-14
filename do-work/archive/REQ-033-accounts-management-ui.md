# REQ-033: Accounts Management UI

**UR:** UR-008
**Status:** done
**Created:** 2026-03-14

## Task

Add an "Accounts" tab to the dashboard (alongside existing "Resources" and "Costs" tabs) with a UI for managing AWS accounts:

- **List view**: Display all accounts in a table/card layout showing name, accessKeyId (masked), defaultRegion, and whether roleArn is configured
- **Add**: A form/modal to add a new account with fields for all account properties (name, accessKeyId, secretAccessKey, defaultRegion, roleArn, sessionToken — last three optional)
- **Edit**: Click an account to edit its properties in a form/modal. Pre-fill existing values (secrets shown as masked placeholders, only overwritten if the user types a new value)
- **Delete**: A delete button per account with confirmation dialog

All operations call the corresponding `/api/accounts` endpoints from REQ-032.

## Context

The user wants to add, remove, and edit accounts from the dashboard instead of manually editing the YAML file.

## Acceptance Criteria

- [x] "Accounts" tab is visible alongside "Resources" and "Costs"
- [x] Accounts list displays all configured accounts
- [x] Add form creates a new account via POST `/api/accounts`
- [x] Edit form updates an account via PUT `/api/accounts/:name`
- [x] Delete button removes an account via DELETE `/api/accounts/:name` with confirmation
- [x] Secret fields (secretAccessKey, sessionToken) are masked in display and only overwritten when user provides new values
- [x] Form validates required fields before submission
- [x] Empty state shown when no accounts are configured

## Outputs

- packages/web/src/components/AccountsManager.tsx — accounts management component
- packages/web/src/hooks/useAccounts.ts — accounts CRUD hook
- packages/web/src/App.tsx — Accounts tab added

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build --workspace=packages/web`
   - Expected: Build completes without errors
2. **ui** Navigate to `http://localhost:5173`, click "Accounts" tab
   - Expected: Tab loads, shows accounts list or empty state
3. **ui** Click "Add Account", fill in required fields, submit
   - Expected: Account appears in list, accounts.yaml is created/updated on disk
