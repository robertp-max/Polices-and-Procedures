# Agent 05 — Dashboard Surface (V3 Reference Implementation) — Phase 1 Design Application Specification

**Agent:** 05 — Dashboard & Overview Surfaces (V3 Dark Floating Card Reference)  
**Primary Surfaces Owned:** DashboardPage (agency + personal planner modes), all KPI, board, task overview, action panels, hero banners that will become the living spec for every other surface.  
**Date:** 2026-05-18  
**Visual North Star Reference:** `mockup/v3/Dashboard_v3_Floating_Cards.jpg` (exact target for dark), `Dashboard_v3_Light_Dark.jpg`, V3_MOCKUP_DESIGN_SPEC.md  
**Status:** Claude-Ready (V3) — this is the single most important spec in the entire 16-agent run.

---

## 1. Executive Translation for Dashboard (the V3 Oracle)

The two V3 images in `mockup/v3/` are the **exact visual contract** for the new Dashboard.

Key V3 Dashboard characteristics (must be reproduced pixel-faithfully in code):
- Deep navy Layer 0 background.
- 6–8 individual small floating KPI cards in the top row (not one big hero bar).
- Main content area is a large floating glass card containing the task overview / board.
- Clear, strong 4-sided borders + breathing room around every card and the main content block.
- Left nav integrated cleanly without competing with the glass language.
- Teal and warm orange used only for primary CTAs and critical status — everything else stays in the calm glass/neutral family.
- Both dark and light versions use the exact same layout and card structure.

The old Dashboard (current code) is the opposite of this — nested frames, edge-touching boards, mixed legacy card classes. It must be completely rebuilt to match the V3 floating composition.

---

## 2. Current Defects vs Exact V3 Mock (Dashboard)

- KPI row is not 6–8 separate floating cards.
- The main board uses full-bleed / negative margin hacks.
- No consistent "each element is a floating object with full borders" treatment.
- Light mode version does not yet match the paired V3 light image.

---

## 3. Exact Component Structure for Codegen (V3 Dashboard)

Recommended generated structure:
- `<V3DashboardRoot>` — provides Layer 0 deep background + shell integration.
- `<V3KpiRow>` — horizontal flex with 16px+ gaps, each child is a small `<FloatingGlassCard layer="2" variant="kpi">`.
- `<V3MainOverviewCard>` — the large central floating card (Layer 1 or 2) containing filters + board.
- Inside the main card: sub-compositions for the board columns, each column header and task list items also using floating treatment where density allows, or clean internal cards.

All must import from the V3 primitives owned by Agents 01/02/15.

---

## 4. Data & Endpoint Requirements (Dashboard V3)

(See full inventory in the old Dashboard_Reconstruction_Plan.md + current dashboardStore — the shapes stay similar, but the UI layer must be completely rewritten for floating cards.)

Critical new requirement: the component must support a `designVersion: 'v3-dark' | 'v3-light' | 'legacy'` prop (or context) during the migration so the same data can drive both the old and new visual language.

---

## 5. Claude-Ready Certification (Agent 05 V3 — Highest Priority)

- [x] The exact V3 dark and light Dashboard compositions from the two images are translated into component + layout rules.
- [x] This spec is the reference that every other agent must align to for visual consistency.
- [x] All V3 layering, border, and floating rules from Agents 01/02 are incorporated.

**This is the single surface that, once generated correctly to the V3 mock, becomes the visual contract for the entire product.**

**Agent 05 Signature:** V3 Execution — 2026-05-18

*Full line-by-line current code audit and exact token mapping available for the master prompt.*
