# Ideate — UR-008

**Reviewed:** 2026-03-14

## Explorer — Assumptions & Perspectives

- The scanner currently runs as a CLI process (`packages/scanner/src/cli.ts`). Triggering it from the dashboard means the Vite dev server needs to spawn or import the scanner engine — this shifts the scanner from a standalone CLI to also being a library consumed by the web server.
- The `scanAccount()` function in `engine.ts` already accepts a `progressCallback` — this is ideal for streaming scan status back to the dashboard (e.g., via SSE or polling).
- Account management from the dashboard means writing credentials through the browser — this has security implications since access keys will transit through HTTP requests. The brief doesn't mention authentication on the dashboard itself, so this is assumed to be a local/trusted-network tool.
- The brief says "save to the accounts.yaml file" — the existing `parseConfigFile()` only reads YAML, so a write path needs to be built.

## Challenger — Risks & Edge Cases

- Running the scanner from within the Vite dev server process could block the event loop or cause memory pressure for large multi-account scans. The scanner uses concurrent AWS API calls with configurable concurrency — this should be fine for a dev server but worth noting.
- If two users trigger scans simultaneously (unlikely for a local tool but possible), there's no mutex. The brief says "disable the button while running" which implies single-scan-at-a-time — server-side state tracking is needed.
- Creating accounts.yaml when it doesn't exist is straightforward, but editing accounts means the dashboard needs to handle the full account schema including optional fields (roleArn, sessionToken, defaultRegion). The brief doesn't specify which fields are editable — safest to support all fields from the existing schema.
- The delete API in `vite.config.ts` already reads accounts.yaml at request time — so edits to accounts.yaml will be picked up on the next operation without restart.

## Connector — Links & Reuse

- The existing Vite plugin pattern in `vite.config.ts` (reportsApiPlugin, deleteApiPlugin) is the established way to add API endpoints — new endpoints for scan triggering and account CRUD should follow the same pattern.
- `parseConfigFile()` and `parseConfigYaml()` in `credentials.ts` handle reading and validation — the write path should use the `yaml` package (already a dependency) to serialize back.
- The `useReport` hook pattern can be extended or a new `useAccounts` hook created for account CRUD state management.
- The `accounts.example.yaml` file documents the expected format — the CRUD operations should produce output matching this format.

## Summary

This is a well-scoped request that extends the existing dashboard with two new capabilities: scan triggering and account management. The main architectural decision is how to expose the scanner engine as an API endpoint within the Vite dev server (following the existing plugin pattern). The progress callback in the scanner engine makes real-time status feasible. Account CRUD is straightforward YAML read/write with the existing `yaml` package.
