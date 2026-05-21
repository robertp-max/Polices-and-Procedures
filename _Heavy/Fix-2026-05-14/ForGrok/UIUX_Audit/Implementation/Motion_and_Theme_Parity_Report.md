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

**Status (2026-05-18 honesty correction):** The per-surface gap counts in §4 above are **author estimates from a static code review**, not validated through actual reduced-motion / light / dark / CI-mode-orthogonal switching on a running dev server. No before/after screenshots exist. See `Phase4_Current_Reality_Report.md` §2.3 for the honest baseline. Motion + theme parity validation **requires manual browser session with `prefers-reduced-motion: reduce` toggled and all four theme triples exercised** and is tracked as P3-SO-01 + P3-SO-02 + P4-MT-01. The shell-level reduced-motion guard in `ShellFrame` is real (`Phase2_Exit_Criteria_Checklist.md` §6 + Playwright `reduced-motion shell at 1440` test); per-surface reduced-motion gating in operational surfaces is **not yet implemented** and is tracked as P4-MT-02.

---

## Appendix Z — Phase 4 Closure Evidence Annex (2026-05-18)

| Theme triple | Code-state coverage of Phase 4-touched files | Verification evidence | Human work still required |
|---|---|---|---|
| CI-ION (dark, default) | `--ci-overlay-*` + `--ci-text-on-surface-*` + `--ci-shadow-*` + sentiment tokens declared (src/index.css L933–945, 996–1008, 1116–1128) | All 7 attested files report 0 design-system lint errors | Manual visual sweep on dev server (P4-MT-01) |
| Care Indeed light | Same token families declared in light block | `tsc --noEmit` + build exit 0 | Manual visual sweep — verify every Phase 4-touched site reads correctly in light theme |
| Care Indeed dark | Same token families declared in dark block | `tsc --noEmit` + build exit 0 | Manual visual sweep |
| prefers-reduced-motion (shell-level) | ✅ Validated pre-Phase 4 — `ShellFrame` guard + Playwright `reduced-motion shell at 1440` test | Existing test in suite | None at shell level |
| prefers-reduced-motion (per surface) | ❌ Not implemented in any Phase 4-touched surface | n/a | Per-surface gating (P4-MT-02) |

**Honest scope of this annex:** confirms that all Phase 4 code remediations use only token families that are declared across all three theme blocks (no theme-orthogonal regression risk introduced). It does **not** validate actual rendering parity across themes or motion preference — that remains P4-MT-01 (manual visual sweep) and P4-MT-02 (per-surface reduced-motion gating).