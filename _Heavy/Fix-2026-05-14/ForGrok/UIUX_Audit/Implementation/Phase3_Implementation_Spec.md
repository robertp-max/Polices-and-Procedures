# Phase 3 Implementation Spec — Operational Surface Reconstruction

**Phase 3 — Operational Surface Reconstruction**  
**Version:** 1.0  
**Date:** 2026-05-17  
**Working Directory:** `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation`

**Traceability:**
- `MASTER_UIUX_IMPLEMENTATION.md` (Phase 3 section)
- `docs/UIUX/UIUX_RECONSTRUCTION_MASTER_PLAN.md` (PHASE 3)
- `CANONICAL_UI_SYSTEM_SPEC.md`
- Phase 2 deliverables (Shell Architecture, Primitive Usage Map, Token Matrix, etc.)
- `DASHBOARD_RECONSTRUCTION_KICKOFF.md`
- `SURFACE_CHECKLISTS/Dashboard.md`
- `LEGACY_DEPRECATION_MATRIX.md`
- `ACCESSIBILITY_GAP_LIST.md`

---

## 1. Phase 3 Mission Statement

Rebuild all high-frequency operational surfaces on top of the hardened canonical shell, primitives, and token contract established in Phase 1 and Phase 2.

**Primary Sequence (Mandatory Order):**
1. **Dashboard** — Reference surface and template (highest priority)
2. Evidence Center
3. Audit Mode
4. Calendar
5. My Tasks

Dashboard must be completed to the highest standard so that it becomes the living template for all subsequent surfaces.

---

## 2. Non-Negotiable Constraints

- Use **only** components exported from `src/policy/components/ui/index.ts` (including new Phase 2 shell primitives: `ShellFrame`, `ShellTopbar`, `ShellNavRail`, `ShellContentFrame`, etc.)
- **Zero raw visual values** — No hex, rgb, arbitrary Tailwind `[...]` values, or magic numbers.
- Strictly follow the **Constrained Page View Contract** (4-sided breathing room on ≥1024px) enforced by the new `ShellFrame` + `ShellContentFrame`.
- Every surface must respect the 3-layer glass system.
- All surfaces must pass their respective `SURFACE_CHECKLISTS/*` and the Responsive Acceptance Matrix.
- No new local one-off components. Promote patterns to primitives when needed.
- Mobile-first behavior with 44px+ touch targets and bottom-sheet preference.

---

## 3. Overall Execution Approach

### 3.1 Per-Surface Reconstruction Process

For each surface (starting with Dashboard):

1. **Audit Current State**
   - Raw value inventory (colors, spacing, typography, shadows)
   - Legacy component families in use
   - Current adherence to constrained page view

2. **Define Target State**
   - Apply `Dashboard_Canonical_Primitive_Usage.md` style mapping
   - Define token usage via Token Application Matrix
   - Align to new shell

3. **Implementation**
   - Refactor using only canonical primitives + tokens
   - Enforce `ShellContentFrame` for all content
   - Remove legacy families per `LEGACY_DEPRECATION_MATRIX.md`

4. **Validation**
   - Responsive & Accessibility Validation
   - Visual regression (before/after + vs Top Picks mocks)
   - Surface-specific checklist completion

5. **Documentation**
   - Update surface checklist
   - Record drift closure
   - Attach evidence

### 3.2 Dashboard as Reference Surface

Dashboard is the **hero surface** for Phase 3:
- It will be the first to demonstrate the full Phase 1 + Phase 2 stack.
- All patterns proven on Dashboard (KPI cards, boards, command groups, empty states, etc.) become the template.
- Subsequent surfaces must reuse or extend the patterns established here.

---

## 4. Key Inputs for Phase 3

- Phase 2 hardened shell (`ShellFrame`, etc.)
- Locked token contract (`tokens/tokens.json` v0.2.0+)
- `primitives/CATALOG.md` (expanded with any new surface primitives)
- `LEGACY_DEPRECATION_MATRIX.md` (card families, tab families, etc.)
- Surface-specific checklists in `SURFACE_CHECKLISTS/`
- Accessibility Gap List
- Responsive Acceptance Matrix
- Approved reference captures (mocks/Top-Picks/)

---

## 5. Deliverables per Surface

For **each** major surface, the following must be produced (Dashboard first):

- `[Surface]_Reconstruction_Plan.md`
- `[Surface]_Canonical_Primitive_Usage.md`
- `[Surface]_Token_Application_Matrix.md`
- `[Surface]_Accessibility_Validation_Report.md`

At the end of Phase 3:
- Updated `Phase3_Exit_Criteria_Checklist.md`
- Consolidated drift register updates
- Full visual regression evidence package

---

## 6. Quality Gates (Applied to Every Surface)

- Zero raw visual values
- 100% use of canonical primitives
- 4-sided constrained framing verified on desktop/laptop
- Passes surface-specific checklist
- Accessibility risks closed or waived
- Visual regression approved
- Responsive matrix pass at all breakpoints

---

## 7. Risk Areas for Phase 3

- High volume of legacy card and layout patterns (especially in Dashboard and Evidence)
- Need to promote several new primitives (KpiCard, BoardColumn, CommandRail, etc.)
- Maintaining performance while adding structure
- Ensuring glassmorphism quality is preserved or improved during migration

---

## 8. Success Definition for Phase 3

- Dashboard is fully rebuilt as the canonical reference surface.
- All other listed surfaces follow the same patterns.
- The application demonstrates consistent, governed UI built on the Phase 1+2 foundation.
- No surface reintroduces raw values or local components.

---

**This document governs all Phase 3 work.**

Next artifact: `Dashboard_Reconstruction_Plan.md` will be produced immediately.