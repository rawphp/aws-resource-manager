# REQ-036: Theme Selector in Dashboard Header

**UR:** UR-009
**Status:** backlog
**Created:** 2026-03-14

## Task

Add a theme selector to the dashboard header (and the FileUpload empty state screen) that lets users switch between Light, Dark, and Cyberpunk themes.

- Use a `<select>` dropdown or segmented button group in the header bar, placed at the far right
- Show the current theme as selected
- On change, call `setTheme()` from the `useTheme()` hook
- Theme change should be instant (no page reload)
- Also show the selector on the FileUpload screen so users can set their theme before any scan

## Context

Users need a visible way to switch themes. The header already has controls (scan button, report selector, tab buttons) so a theme selector fits naturally there.

## Acceptance Criteria

- [ ] Theme selector is visible in the dashboard header
- [ ] Theme selector is visible on the FileUpload/empty state screen
- [ ] Selecting a theme immediately applies it
- [ ] All three themes are listed: Light, Dark, Cyberpunk
- [ ] Selected theme persists across page reloads

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build --workspace=packages/web`
   - Expected: Build completes without errors
2. **ui** Navigate to `http://localhost:5173`, find theme selector in header
   - Expected: Dropdown/selector is visible with three options
3. **ui** Select "Dark" theme
   - Expected: Dashboard immediately switches to dark colors, refresh preserves choice
