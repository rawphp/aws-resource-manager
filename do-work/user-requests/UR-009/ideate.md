# Ideate — UR-009

**Reviewed:** 2026-03-14

## Explorer — Assumptions & Perspectives

- All styling is currently inline `style={}` objects — 160 occurrences across 7 files. A theme system needs to replace hardcoded color values with theme-aware variables without rewriting every component from scratch.
- The most pragmatic approach is CSS custom properties (variables) on `:root` / `[data-theme]`, then referencing them from inline styles via `var()` or switching to a thin CSS file. CSS variables work with inline styles: `style={{ background: 'var(--bg-primary)' }}`.
- Theme persistence matters — users expect their choice to survive page reloads. `localStorage` is the natural fit.
- The brief says "something that stands out" for the third theme. A high-contrast or cyberpunk/neon theme would be visually distinct from light and dark.

## Challenger — Risks & Edge Cases

- 160 inline styles is a lot to touch. The risk is introducing visual regressions. The safest approach is to define CSS variables for just the semantic colors used (background, text, border, accent, etc.), then do a targeted find-and-replace of hardcoded hex values with `var()` references.
- Bar charts in CostBreakdown.tsx use inline colors for chart bars — these need to respect the theme too or they'll clash.
- The CleanupPanel has a `DELETE` confirmation input — contrast must remain readable across all themes.

## Connector — Links & Reuse

- React Context is the standard way to provide theme state across components — a `ThemeContext` with a `useTheme()` hook matches the existing hook pattern (`useReport`, `useScan`, `useAccounts`).
- The theme selector can sit in the header bar where the tab buttons already live — consistent placement without adding new UI regions.
- The existing `const thStyle`, `tdStyle`, etc. pattern in AccountsManager.tsx shows the codebase already extracts style objects — these can reference theme variables.

## Summary

The cleanest approach is CSS custom properties for color tokens, a React context for theme state with localStorage persistence, and a selector dropdown in the header. The main effort is replacing ~20 unique hardcoded colors with `var()` references across all components.
