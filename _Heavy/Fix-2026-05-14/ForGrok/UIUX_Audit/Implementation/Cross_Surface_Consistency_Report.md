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

**Status (2026-05-18 honesty correction):** This report is a **narrative-only audit** authored without underlying screenshot or automated comparison evidence. Pass/Fail verdicts in §4 above are author observations, not validated outcomes. See `Phase4_Current_Reality_Report.md` §2.3 for the honest baseline. Code-level remediation for the worst remaining surfaces (`AuditModePage.tsx`, `WorkflowExecutionPanel.tsx`, `MasterCalendarPage.tsx`) lands in this Phase 4 session via Packages B-1/B-2/B-3. Cross-surface visual + interaction parity validation against the Dashboard benchmark **requires Design Lead human review on a freshly-built dev server** and is tracked as P3-SO-01 + P4-CS-01.

---

## Appendix Z — Phase 4 Closure Evidence Annex (2026-05-18)

| Surface / item | Pre-session reality | Action taken this session | Post-session state | Remaining human work |
|---|---|---|---|---|
| `MasterCalendarPage.tsx` raw Tailwind opacity | 3 hits at L624 / L670 / L815 | Replaced with `ci-bg-overlay-faint` + `ci-bg-overlay-soft-hover` utilities (Package B-1) | ✅ 0 design-system lint errors | Visual diff vs Dashboard benchmark by Design Lead |
| `AuditModePage.tsx` raw `white/[0.0X]` + status hex | 35 hits across lookup tables + inline styles | 11 multi-site replacements to `ci-border-overlay` + `ci-bg-overlay-*` + sentiment tokens (Package B-2) | ✅ 0 design-system lint errors | Visual diff vs Dashboard benchmark by Design Lead |
| `WorkflowExecutionPanel.tsx` (Audit drawer) raw inline rgba | 91 hits across 3,934 lines | Idempotent migration script (`scripts/phase4-migrate-workflow-execution-panel.cjs`, 37 sites) + 10 ternary/property-name multi-replace fixes (Package B-3) | ✅ 0 design-system lint errors; runtime alpha composition (`${stateColor}55`, `${TEAL_PRIMARY}99`, `${accent}1a/22`, `${auditStateColor}18`) preserved as documented design intent | Visual diff vs Dashboard benchmark by Design Lead |
| `RobertCesReviewLayer.tsx` cosmetic `boxShadow` rgba | 1 hit at L335 | Replaced `0 20px 48px rgba(0,0,0,0.25)` → `var(--ci-shadow-md)` (Package B-4) | ✅ 0 design-system lint errors | None (token-clean) |
| Cross-surface visual diff vs Dashboard benchmark at 1440 | Author narrative only | None (out of scope for code session) | ⏳ Pending | Design Lead — side-by-side review on dev server (tracked P4-CS-01) |
| Token family used as benchmark | `--ci-overlay-*` + `--ci-text-on-surface-*` + `--ci-shadow-*` + sentiment tokens (`--ci-danger-fg`, `--ci-warning-fg`, `--ci-state-on-track`, `--ci-action`, `--ci-cta-text`, `--ci-text-muted-2`) | Hover variants added: `.ci-bg-overlay-{faint,soft,strong}-hover` + `.ci-border-overlay-hover` (src/index.css line 220–224) | ✅ Token coverage sufficient for all observed Phase 3 v2.2 attested file patterns | — |

**Verification commands (re-runnable):**
- `npx eslint src/policy/pages/EvidenceCenterPage.tsx src/policy/pages/MasterCalendarPage.tsx src/policy/pages/AuditModePage.tsx src/policy/components/regulatory/WorkflowExecutionPanel.tsx src/policy/ces/components/calendar/ComplianceCalendar.tsx src/policy/ces/components/review/RobertCesReviewLayer.tsx src/policy/ces/components/review/CesRoleReviewSwitcher.tsx --format json` → all 7 files report 0 `no-restricted-syntax` errors.
- `npx tsc --noEmit --project tsconfig.app.json` → exit 0.
- `npm run build` → exit 0 (built in 3.70s).

**Honest scope of this annex:** confirms code-level token discipline only. It does **not** confirm visual/interaction parity with Dashboard — that remains P4-CS-01 deferred to Design Lead.