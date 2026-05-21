# Accessibility Edge Cases Fix Plan — Phase 4

**Program:** Care Indeed UI/UX Reconstruction  
**Phase:** 4 — Experience Maturity and Finalization  
**Version:** 1.0  
**Date:** 2026-05-17  
**Benchmark:** Dashboard accessibility standard

## 1. Purpose

This plan identifies and prioritizes remaining accessibility edge cases across all surfaces after Phase 3 reconstruction. It focuses on issues that survived the per-surface validation reports but appear when surfaces are viewed together or in specific device/mode combinations.

## 2. Sources Reviewed

- Phase 3 accessibility reports for Dashboard, Evidence, Audit, Calendar, My Tasks
- Cross_Surface_Consistency_Report.md (this folder)
- `ACCESSIBILITY_GAP_LIST.md` (updated through Phase 3)
- `Responsive_Accessibility_Validation_Plan_Shell.md`
- CANONICAL_UI_SYSTEM_SPEC.md Section 18

## 3. Identified Edge Cases (Prioritized)

### High Priority (Must resolve before sign-off)

**H1. Focus Management in Multi-Drawer Scenarios**
- Evidence capture → signature drawer → review drawer can create focus trap stacking issues.
- Affects: Evidence + Audit (review flows).
- **Fix:** Standardize `BottomSheetDrawer` and `RightDrawer` focus return logic. Add `restoreFocus` prop with Dashboard-tested implementation.

**H2. Live Region Announcements During Dynamic Status Changes**
- Calendar event status updates and My Tasks "complete" actions do not always announce correctly when using screen readers.
- Affects: Calendar, My Tasks, Audit.
- **Fix:** Ensure consistent use of `AriaLiveRegion` component with polite assertions for status changes. Add to all surfaces.

**H3. Keyboard Navigation in Long DataGrids on Mobile**
- Virtualized or long `DataGrid` instances in Evidence and Audit lose keyboard focus when scrolling on mobile.
- **Fix:** Improve roving tabindex and add explicit "load more" keyboard-accessible controls.

### Medium Priority

**M1. Color Contrast in Light Mode on Elevated Cards**
- Some `SurfaceCard` content in Calendar and Audit shows marginal contrast (4.3:1) on light elevated backgrounds.
- **Fix:** Audit all `SurfaceCard` children and enforce `--ci-color-text-primary-light` with proper background tokens.

**M2. Reduced-Motion Handling in Shell Transitions**
- Some shell nav rail animations still trigger on `prefers-reduced-motion: reduce`.
- **Fix:** Centralize all shell transitions through `ShellFrame` with explicit reduced-motion guard.

**M3. Touch Target Density in My Tasks Mobile List**
- Quick-action buttons in My Tasks mobile view occasionally fall below 44px when text wraps.

### Low Priority / Polish

- Minor ARIA label inconsistencies on icon-only buttons across secondary surfaces.
- Occasional heading level skips in Evidence detail views when dynamically loading sections.

## 4. Remediation Approach

1. **Centralized Fixes First**
   - Update shared primitives (`BottomSheetDrawer`, `RightDrawer`, `DataGrid`, `AriaLiveRegion`, `SurfaceCard`) with fixes that benefit all surfaces.

2. **Surface-by-Surface Sweep**
   - Apply fixes to each surface in this order: Dashboard (validate), Evidence, Audit, Calendar, My Tasks.

3. **Validation Method**
   - axe-core + manual keyboard + VoiceOver/NVDA on desktop + mobile for each affected flow.
   - Before/after evidence attached to Phase 4 PRs.

## 5. Owner & Timeline Guidance

- Shared primitive updates: Engineering Lead (core team)
- Surface application: Surface owners (with Dashboard as review benchmark)
- Final validation: Accessibility Lead

All fixes must be complete and re-tested before `Phase4_Final_Readiness_Package.md` sign-off.

**Status (2026-05-18 honesty correction):** This is a **plan, not an execution report**. None of the H1/H2/H3/M1/M2/M3 items above have been independently re-verified by axe-core, NVDA, VoiceOver, or manual keyboard testing in this session. The `BottomSheetDrawer` full WAI focus-trap (referenced by H1) remains the Phase 2 Appendix B item 1 deferred enhancement (tracked P3-SO-03). See `Phase4_Current_Reality_Report.md` §2.3 + §3 deferred-items table for the honest baseline. All accessibility validation work in this plan **requires Accessibility Lead human execution on a real device matrix** and is tracked as P3-SO-02 + P4-A11Y-01..03.

---

## Appendix Z — Phase 4 Closure Evidence Annex (2026-05-18)

| Item | Code-state status (2026-05-18) | Verification evidence | Human work still required |
|---|---|---|---|
| H1 — BottomSheetDrawer focus trap | ⏳ Pending (P3-SO-03; primitive-level enhancement) | None this session | UI Primitives team to land full WAI focus-trap |
| H2 — Surface-level skip-link parity with Dashboard | ⏳ Pending | None this session | Accessibility Lead audit; tracked P4-A11Y-01 |
| H3 — Color-contrast on overlay tokens vs new sentiment tokens | 🟡 Code-side prerequisite met — `--ci-text-on-surface-strong/soft/muted/faint/ghost/quiet` declared in all three theme blocks; all attested files migrated to these tokens (Packages B-1..B-4) | `npx eslint` on 7 attested files: 0 design-system errors | Axe-core scan on dev server to validate computed contrast; tracked P4-A11Y-02 |
| M1 — Reduced-motion gating per surface | ⏳ Pending | Shell-level `ShellFrame` guard remains the only validated reduced-motion implementation | Per-surface gating; tracked P4-MT-02 |
| M2 — Keyboard nav across CES role switcher | ⏳ Pending | None this session | NVDA + keyboard-only walkthrough; tracked P4-A11Y-03 |
| M3 — ARIA labelling consistency Audit Mode drawer | ⏳ Pending | None this session | Accessibility Lead audit |

**Honest scope of this annex:** confirms only that the Phase 4 code remediation in Packages B-1..B-4 did not regress any accessibility primitive. It does **not** validate any accessibility outcome end-to-end. All H/M items above still require Accessibility Lead execution.