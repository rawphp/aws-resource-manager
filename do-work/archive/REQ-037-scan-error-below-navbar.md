# REQ-037: Display Scan Error Below Navbar

**UR:** UR-010
**Status:** done
**Created:** 2026-03-14

## Task

Move the scan error message out of the inline navbar flex row and display it as a full-width block element below the header bar, so the full AWS error message is visible without truncation.

## Context

When a scan fails, the AWS error is displayed in the navbar as a `<span>` with `maxWidth: 200px`, `overflow: hidden`, `textOverflow: ellipsis`, and `whiteSpace: nowrap`. This truncates long error messages (e.g., credential errors, permission errors) making them unreadable.

## Acceptance Criteria

- [x] Scan error is rendered below the header bar, not inline in the navbar
- [x] Full error text is visible without truncation
- [x] Error is styled with danger color and appropriate padding
- [x] Error does not appear when there is no scan error
- [x] Build passes with no TypeScript errors

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `cd packages/web && npx vite build`
   - Expected: Build succeeds with no errors
2. **test** `npx vitest run`
   - Expected: All tests pass
3. **ui** Navigate to dashboard, trigger a scan with invalid credentials
   - Expected: Full error message appears below the navbar, not truncated, styled in red/danger color
