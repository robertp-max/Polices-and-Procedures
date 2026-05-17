# Motion and Theme Parity Report — Phase 4

**Program:** Care Indeed UI/UX Reconstruction  
**Phase:** 4 — Experience Maturity and Finalization  
**Version:** 1.0  
**Date:** 2026-05-17  
**Benchmark:** Dashboard motion + theme implementation

## 1. Purpose

Validate that motion (including reduced-motion) and light/dark theme parity exist across all surfaces, using Dashboard as the quality benchmark.

## 2. Scope

- Reduced-motion support (`prefers-reduced-motion: reduce`)
- Light mode vs Dark mode visual and interaction parity
- Transition timing and easing consistency (using locked `--ci-motion-*` tokens)

## 3. Dashboard Benchmark

- All non-essential animations disabled under reduced motion.
- Identical visual hierarchy and contrast in light and dark.
- All transitions use `--ci-motion-duration-fast` (120ms) + `--ci-motion-ease-standard`.
- Theme toggle (`ThemeModeToggle`) works cleanly.

## 4. Findings by Surface

**Shell (Phase 2):**
- Nav rail slide-in still animates under reduced motion in some cases.
- Light/dark parity excellent.

**Evidence Center:**
- Capture progress animations do not respect reduced motion.
- Theme parity good, but some overlay gradients look slightly different in light mode.

**Audit Mode:**
- Checklist item expand/collapse animations ignore reduced motion.
- Good theme parity.

**Calendar:**
- Event drag and status change transitions do not disable under reduced motion.
- Theme parity strong.

**My Tasks:**
- Best secondary surface. Only minor: quick complete button scale animation should be gated.

## 5. Required Actions

1. Centralize all transition classes through a `useReducedMotion` hook or CSS media query guard in `ShellFrame`.
2. Audit and wrap every `transition` / `animate` usage in the five surfaces.
3. Add explicit visual regression tests for both themes + reduced motion states.

## 6. Parity Verdict

- **Motion:** 3/5 surfaces have gaps (Evidence, Audit, Calendar).
- **Theme:** All surfaces achieve good parity. Minor gradient tweaks needed in Evidence.

**Status:** Report complete. Proceeding to next deliverable.