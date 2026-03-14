# Ideate — UR-005

**Reviewed:** 2026-03-14

## Explorer — Assumptions & Perspectives

- The backend delete logic already exists in `packages/scanner/src/cleanup.ts` with handlers for 8 resource types (EC2 instances/volumes/EIPs/NAT gateways, S3, RDS, Lambda, ELB). The `deleteResource()` function takes credentials and a resource, calls the correct AWS SDK method.
- The UI already exists in `CleanupPanel.tsx` — checkbox selection, confirmation modal with "type DELETE to confirm", cost savings display. But line 166 just runs `alert()` instead of making an API call.
- The missing piece is the API endpoint: no `/api/delete` route exists in `vite.config.ts` to bridge the UI to the backend.
- Credentials are loaded from `accounts.yaml` via `packages/scanner/src/credentials.ts` — the web server would need access to this same credential loader.

## Challenger — Risks & Edge Cases

- **Destructive operation**: This wires up actual AWS resource deletion. A bug here could delete production resources. The existing "type DELETE" confirmation is good, but we should also consider whether the API should require a dry-run step before executing.
- **Credential access from web server**: The Vite dev server plugin currently only reads report files. Adding delete capability means the web server now has AWS write access — this is a significant privilege escalation.
- **Error handling during bulk deletes**: If deleting 5 resources and #3 fails, the UI needs to show partial results (3 succeeded, 1 failed, 1 not attempted). The current `DeleteResult` type supports this.
- **S3 bucket deletion will fail if non-empty**: The existing handler calls `DeleteBucketCommand` which requires an empty bucket. This is a known limitation but shouldn't block the wiring.

## Connector — Links & Reuse

- REQ-010 (archived) built the cleanup.ts logic and CleanupPanel UI — this UR completes the wiring that REQ-010 left unfinished.
- The existing Vite plugin pattern in `vite.config.ts` (handling `/api/reports`) can be extended with a `/api/delete` POST endpoint.
- The `loadCredentials()` function from `packages/scanner/src/credentials.ts` can be reused to get AWS credentials for the delete operation.
- The `deleteResource()` and `canDelete()` functions are already exported and tested.

## Summary

The hard work is done — delete logic exists in the backend and UI exists in the frontend. This UR is about adding a single API endpoint (`POST /api/delete`) in the Vite plugin and updating CleanupPanel to call it instead of `alert()`. Keep the scope tight: wire the existing pieces together, show results, handle errors.
