# Ideate — UR-010

**Reviewed:** 2026-03-14

## Explorer — Assumptions & Perspectives

- The current error is displayed inline in the navbar as a `<span>` with `maxWidth: 200px`, `overflow: hidden`, `textOverflow: ellipsis`, and `whiteSpace: nowrap` — this is the direct cause of truncation (App.tsx:108).
- AWS errors can be multi-line or very long (e.g., "UnrecognizedClientException: The security token included in the request is invalid") — the display needs to handle arbitrary-length messages.

## Challenger — Risks & Edge Cases

- Moving the error below the navbar means it needs to be a separate block element — if the error is dismissed but the scan state isn't reset, it could linger across views.
- The FileUpload screen also shows `scanError` (FileUpload.tsx:41-43) — should that be updated too, or is it only about the main dashboard navbar? The brief says "below that top navbar" which implies the main dashboard view.

## Connector — Links & Reuse

- The error display pattern already exists in both App.tsx (inline span) and FileUpload.tsx (standalone span) — the fix should be consistent across both.
- This is a single-element style change in App.tsx — move the error `<span>` out of the navbar flex container and render it as a full-width block below the header div.

## Summary

The scan error is truncated because it's displayed inline in the navbar with a 200px max width and ellipsis overflow. The fix is to move the error out of the navbar flex row and render it as a full-width block element below the header. This is a small, focused change to App.tsx.
