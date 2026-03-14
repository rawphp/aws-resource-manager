# REQ-034: Theme System with CSS Variables

**UR:** UR-009
**Status:** done
**Created:** 2026-03-14

## Task

Create a theme system using CSS custom properties and React context:

1. Define a `themes.css` file with three themes using `[data-theme]` selectors:
   - `light` (default) — current look and feel (extract existing colors)
   - `dark` — dark backgrounds, light text
   - `cyberpunk` — dark base with neon accent colors (cyan/magenta/lime) for a distinctive look

2. Define semantic CSS variables for: `--bg-primary`, `--bg-secondary`, `--bg-card`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border`, `--accent`, `--accent-hover`, `--success`, `--danger`, `--input-bg`, `--input-border`, `--table-header-bg`, `--table-row-hover`

3. Create a `ThemeContext` with a `useTheme()` hook that:
   - Provides `theme` (current theme name) and `setTheme` (setter)
   - Sets `data-theme` attribute on `<html>` element
   - Persists choice to `localStorage`
   - Defaults to `light` on first visit

4. Import `themes.css` in `main.tsx`

## Context

The dashboard currently uses hardcoded inline colors. A CSS variable-based theme system allows all components to respond to theme changes without prop drilling.

## Acceptance Criteria

- [x] `themes.css` defines light, dark, and cyberpunk themes with all semantic variables
- [x] `ThemeContext` and `useTheme()` hook are created
- [x] Theme persists across page reloads via localStorage
- [x] `data-theme` attribute is set on `<html>`
- [x] `themes.css` is imported in the app entry point

## Outputs

- packages/web/src/themes.css — 3 themes with ~40 semantic CSS variables each
- packages/web/src/hooks/useTheme.tsx — ThemeContext + useTheme hook
- packages/web/src/main.tsx — ThemeProvider wrapper + CSS import

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build --workspace=packages/web`
   - Expected: Build completes without errors
2. **test** `npx vitest run packages/web`
   - Expected: All tests pass
