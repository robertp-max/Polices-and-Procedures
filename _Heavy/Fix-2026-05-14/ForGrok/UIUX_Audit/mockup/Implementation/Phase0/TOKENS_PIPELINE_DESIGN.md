# Tokens Pipeline Design

**Status:** DRAFT (Phase 0)
**Owner:** Engineering Lead + Design Lead

## Decision: Style Dictionary

Use **Style Dictionary** to transform a single source-of-truth `tokens.json` into:

1. `src/policy/styles/tokens.css` — CSS custom properties (`:root` + `[data-theme="dark"]`).
2. `tailwind.tokens.js` — Tailwind theme extension consumed by `tailwind.config.js`.
3. `src/policy/styles/tokens.d.ts` — TypeScript const map for programmatic access (charts, JS-driven styles).

Rationale: existing `tokens.json` is the authoritative source; Style Dictionary is well-maintained, supports multi-platform output, and avoids hand-rolled drift between CSS and Tailwind.

## Source File

`config/tokens/tokens.json` — single source of truth. Categories:

- `color.brand.*` (Clinical Teal, Primary Orange, etc.)
- `color.surface.{0,1,2,3}` (Layer 0 backdrop + glass layers)
- `color.text.{primary,secondary,muted,inverse}`
- `color.state.{success,warning,danger,info}`
- `color.contrast-pair.*` (auto-generated WCAG AA pairs)
- `spacing.{1..12}`
- `radius.{sm,md,lg,xl,2xl}`
- `blur.{glass-1,glass-2,glass-3}`
- `shadow.{glass-edge,glass-inner,focus-ring}`
- `motion.{reduced,default}`

## Dark Mode

Every color token has a `light` and `dark` value. Style Dictionary emits paired CSS variables; consumers reference the variable name only.

## Contrast Pair Generation

A build step computes WCAG AA contrast ratios for every (text, surface) pair and fails the build if any pair used in canonical primitives drops below 4.5:1. Failures block PRs.

## Codemod Strategy

`scripts/codemod-raw-values.mjs` (Phase 1 deliverable):

1. Scans `src/policy/**/*.{ts,tsx,css}` for hex literals and arbitrary Tailwind values.
2. Maps known values to nearest token (with confidence score).
3. High-confidence (exact match) → auto-rewrite with `// codemod: <old>` comment.
4. Low-confidence → emit report at `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/mockup/Implementation/Phase1/CODEMOD_REPORT.md` for manual review.

## Migration Plan

- **Phase 0:** Design doc (this file).
- **Phase 1 week 1–2:** Style Dictionary scaffolded, `tokens.css` emitted, shell + Dashboard migrated.
- **Phase 1 week 3–4:** Codemod run; high-confidence rewrites land; low-confidence report routed to surface owners.
- **Phase 2+:** Each surface rebuild consumes tokens; ESLint hex/arbitrary-value rules turned to ERROR.

## CI Gates

- `npm run tokens:build` runs in CI; emits artifacts; fails if `tokens.json` invalid.
- `npm run tokens:contrast` fails build on AA violation.
- Drift check: emitted `tokens.css` must match the version in `src/policy/styles/` (no manual edits).
