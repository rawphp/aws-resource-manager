# REQ-035: Apply Theme Variables to All Components

**UR:** UR-009
**Status:** done
**Created:** 2026-03-14

## Task

Replace all hardcoded color values in inline styles across all components with CSS variable references (`var(--variable-name)`). Components to update:

- `App.tsx` — page background, header text
- `FileUpload.tsx` — background, text, button colors
- `SummaryCards.tsx` — card backgrounds, text, borders
- `ResourceTable.tsx` — table headers, rows, borders, filter inputs
- `CostBreakdown.tsx` — chart bars, text, backgrounds
- `CleanupPanel.tsx` — panel background, borders, buttons, input
- `AccountsManager.tsx` — table, form, buttons, inputs

Map existing colors to semantic variables:
- `#1a1a2e` → `var(--text-primary)`
- `#333` → `var(--text-primary)`
- `#666`, `#999` → `var(--text-secondary)` or `var(--text-muted)`
- `white`, `#fff` → `var(--bg-primary)`
- `#f8f9fa`, `#f0f0f0` → `var(--bg-secondary)`
- `#ddd`, `#eee` → `var(--border)`
- `#4361ee` → `var(--accent)`
- `#28a745` → `var(--success)`
- `#dc3545` → `var(--danger)`

## Context

With the theme CSS variables defined in REQ-034, this REQ wires them into the existing components so all three themes actually take effect.

## Acceptance Criteria

- [x] No hardcoded color hex values remain in any component's inline styles
- [x] All components render correctly with the light theme (visual parity with current look)
- [x] All components respond to theme changes (dark and cyberpunk themes apply correctly)
- [x] Font family set via CSS variable or theme CSS (not repeated inline)

## Outputs

- packages/web/src/App.tsx — theme variables applied
- packages/web/src/components/FileUpload.tsx — theme variables applied
- packages/web/src/components/SummaryCards.tsx — theme variables applied
- packages/web/src/components/ResourceTable.tsx — theme variables applied
- packages/web/src/components/CostBreakdown.tsx — theme variables applied
- packages/web/src/components/CleanupPanel.tsx — theme variables applied
- packages/web/src/components/AccountsManager.tsx — theme variables applied

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build --workspace=packages/web`
   - Expected: Build completes without errors
2. **test** `npx vitest run packages/web`
   - Expected: All tests pass
3. **ui** Navigate to `http://localhost:5173`, inspect any element
   - Expected: Colors use `var(--...)` references, no hardcoded hex values
