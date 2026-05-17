# Cross-Surface Consistency Report — Phase 4

**Program:** Care Indeed UI/UX Reconstruction  
**Phase:** 4 — Experience Maturity and Finalization  
**Version:** 1.0  
**Date:** 2026-05-17  
**Benchmark Surface:** Dashboard (Phase 3 reference)

## 1. Executive Summary

This report audits consistency across the Shell + five operational surfaces reconstructed in Phases 2 and 3. Dashboard serves as the quality benchmark. Findings are prioritized by severity (Critical / High / Medium / Low).

**Overall Assessment:** Good foundation with several polish-level inconsistencies that must be resolved before launch readiness. No critical structural breaks were found, but visual and interaction drift exists in secondary surfaces.

## 2. Audit Scope and Methodology

**Surfaces Audited:**
- Shell (Phase 2)
- Dashboard (benchmark)
- Evidence Center
- Audit Mode
- Calendar
- My Tasks

**Dimensions Audited:**
- Visual language (typography, elevation, glass, color usage)
- Component patterns (card elevation, button hierarchy, status treatment)
- Spacing and density
- Interaction states (hover, focus, active, disabled)
- Responsive behavior at breakpoints
- Accessibility patterns

**Methodology:**
- Side-by-side comparison against Dashboard screenshots and code
- Token usage verification against `tokens/tokens.json` v0.2.0
- Primitive usage verification against `primitives/CATALOG.md` and Phase 3 usage maps
- Manual review of Top Picks mock alignment

## 3. Key Findings by Dimension

### 3.1 Typography & Hierarchy

- **Dashboard (Benchmark):** Excellent use of `--ci-font-size-*` scale with consistent letter-spacing.
- **Evidence:** Mostly aligned. Minor drift in meta text sizing on evidence detail panels.
- **Audit:** Good, but some checklist item labels use `--ci-font-size-body-sm` where Dashboard uses `--ci-font-size-meta`.
- **Calendar:** Consistent on events; minor issues in header typography on sprint views.
- **My Tasks:** Strong alignment. Best secondary surface for typography.

**Gap:** Inconsistent eyebrow/meta treatment across Audit and Evidence.

### 3.2 Elevation & Glassmorphism

- **Shell + Dashboard:** Perfect execution of 4-sided inset + Layer 1/2 shadow system (`--ci-shadow-elevation-card-light`, `--ci-shadow-elevation-interactive`).
- **Evidence:** Good, but some capture review cards use legacy shadow values instead of the locked elevation tokens.
- **Audit:** Strong on readiness cards; weaker on long checklist rows (insufficient elevation separation).
- **Calendar:** Event cards slightly under-elevated compared to Dashboard KPI cards.
- **My Tasks:** Very close to benchmark.

**Critical Observation:** Evidence capture review panels occasionally collapse visually due to missing `--ci-shadow-elevation-md`.

### 3.3 Color & Status Treatment

- **All Surfaces:** Correct use of `CiStatusBadge` and semantic colors.
- **Minor Drift:** Audit Mode occasionally uses direct accent colors for non-status elements (should route through tokens or `CiStatusBadge` variants).

### 3.4 Button Hierarchy & Actions

- **Dashboard:** Clear primary (`ActionButton`) vs secondary (`UtilityButton`) distinction.
- **Evidence:** Capture actions sometimes use `UtilityButton` for primary flows (inconsistent).
- **Audit:** Strong.
- **Calendar & My Tasks:** Good, but My Tasks has a few "quick complete" buttons that lack the hover elevation Dashboard uses.

### 3.5 Responsive & Density

- All surfaces respect the 4-sided contract on desktop.
- Minor density differences in mobile list views (Evidence and My Tasks slightly tighter than Dashboard).

## 4. Prioritized Gap List

**High Priority (Must fix in Phase 4):**
1. Evidence capture review cards — elevate to match Dashboard `SurfaceCard` treatment.
2. Audit checklist rows — add consistent elevation and meta typography.
3. Calendar event cards — standardize shadow to `--ci-shadow-elevation-interactive`.
4. Evidence meta text sizing — align to Dashboard `--ci-font-size-meta`.

**Medium Priority:**
- My Tasks quick-action buttons — add Dashboard-style hover elevation.
- Calendar header typography — match Dashboard section headers.

**Low Priority (Polish):**
- Minor spacing inconsistencies in filter toolbars (all surfaces).

## 5. Recommendations

- Create a shared "SurfaceCard variants" documentation in `primitives/CATALOG.md` (Dashboard as canonical example).
- Add automated visual regression tests that compare every surface against Dashboard baseline at 1200px, 1440px, and 375px.
- Run a one-time "consistency sweep" PR focused only on the High Priority gaps above.

## 6. Next Steps

This report feeds directly into:
- `Accessibility_Edge_Cases_Fix_Plan.md`
- `Responsive_Parity_Validation.md`
- `Legacy_Cleanup_and_Migration_Guardrails.md`

**Status:** Report complete. Proceeding to next deliverable.