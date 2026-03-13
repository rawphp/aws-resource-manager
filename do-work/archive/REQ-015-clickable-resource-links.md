# REQ-015: Clickable Resource Links in Dashboard

**UR:** UR-002
**Status:** done
**Created:** 2026-03-14

## Task

Make resource names/IDs in the ResourceTable component clickable links that open the corresponding AWS Console page in a new browser tab. Use the URL builder from REQ-014.

## Context

Users want to click on a resource in the dashboard and be taken directly to that resource in the AWS web console, so they can inspect or manage it without manually navigating the AWS Console.

## Acceptance Criteria

- [x] Resource name/ID in the table is rendered as an anchor (`<a>`) tag
- [x] Links open in a new tab (`target="_blank"` with `rel="noopener noreferrer"`)
- [x] Resources without a generated URL (unsupported types) display as plain text, not broken links
- [x] Link styling is visually distinct (e.g., underline or color) so users know it's clickable
- [x] Clicking the link does not interfere with row selection (checkbox still works independently)

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `cd packages/web && npm run build`
   - Expected: Build succeeds with no errors
2. **ui** Start the dev server, load a report, and click on a resource name in the table
   - Expected: A new browser tab opens to the correct AWS Console page for that resource
3. **ui** Verify that a resource with an unsupported type shows as plain text (no broken link)
   - Expected: Name displays normally without a link

## Assets

- None

## Outputs

- packages/web/src/components/ResourceTable.tsx — Updated with clickable AWS Console links
