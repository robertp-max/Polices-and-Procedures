# V3_Phase1_Master_Combined_Spec.md
**Darkmode_DesignzV3 — Phase 1 Complete Design Application Bundle**

**Status:** In Progress (core agents + cross-cutting complete; full 16 + endpoint inventory being assembled)

**Purpose:** This is the single source document that will be fed (together with current code + tokens + the two V3 reference images) to a high-capability model to generate the entire updated frontend in Phase 2/3.

---

## 1. V3 Visual Contract Summary (from all 16 agents)

- Primary aesthetic: Individual **floating glass cards** with strong visible 4-sided borders + luminous edges on deep navy atmospheric Layer 0 background.
- Max 3 layers.
- Dark mode is the primary target; light mode uses the identical layout and card structure with softer treatment.
- No giant single containers or edge-touching elements.
- Every major content block (KPI, task, evidence item, policy section, etc.) is an independent `FloatingGlassCard`.

**Reference Images (non-negotiable visual truth):**
- `mockup/v3/Dashboard_v3_Floating_Cards.jpg`
- `mockup/v3/Dashboard_v3_Light_Dark.jpg`
- `mockup/v3/V3_MOCKUP_DESIGN_SPEC.md`

---

## 2. Consolidated Primitive & Token Requirements (from Agents 01, 02, 03)

- New primary primitive: `FloatingGlassCard` (with `layer`, `elevation`, `v3Variant`)
- Supporting: `V3SurfaceHost`, elevated variants for drawers/modals
- Token families needed (Agent 03):
  - `--ci-v3-card-border-dark`, `--ci-v3-card-glow-dark`, `--ci-v3-card-gap`, elevation shadows, etc.
  - Full dark + light pairing that matches the two V3 images exactly

---

## 3. Per-Surface Application Rules (Condensed from Agents 05–14)

**Dashboard (Agent 05 — Reference)**
- KPI row = 6–8 small independent floating cards
- Main overview = one large floating card
- Must be generated first and become the living spec

**Evidence (07), CES (06), Calendar (10), Policy (08), Onboarding (09), Audit/iAdmin (specialist)**
- All grids, kanbans, lists, detail panels, and forms converted to floating card compositions with consistent V3 borders and breathing room.

**Shell & Navigation (04)**
- Evolved to Layer-0 atmospheric host + breathing room provider (not the old single inset canvas).

**Mobile (12)**
- Stacked floating cards + bottom sheets as elevated floating glass.

**Cross-Surface Patterns (15)**
- All shared components (TaskCard, StatusBadge, FilterBar, EmptyState, etc.) must ship V3 floating variants as the default in the new design.

**A11y (13), Legacy (14), Fidelity (16)**
- Full contracts and gates defined to protect quality during generation and migration.

---

## 4. Cross-Agent Interface Contracts (Master View)

(Consolidated table from all individual specs — Agents 01/02/03/04/15 form the core contract layer. All operational agents depend on them.)

---

## 5. Data, Endpoint & Store Inventory (To Be Completed)

**Placeholder for full matrix:**
Every surface's required queries, mutations, real-time needs, optimistic update rules, and recommended TypeScript shapes will be aggregated here from the individual agent specs + existing API inventory.

This section is the most critical input for the final Claude codegen prompt.

---

## 6. Recommended Generation Order (from Agent 16 + 05)

1. Tokens (03) + Primitives (01/02)
2. Pattern Library V3 variants (15)
3. Shell evolution (04)
4. Dashboard (05) — first full page (reference)
5. Evidence + CES (07, 06) — highest volume
6. All remaining surfaces
7. Mobile + A11y hardening
8. Fidelity gate + visual regression pass (16)

---

## 7. Master Claude-Ready Checklist (from all agents)

- [ ] All 16 individual Phase 1 specs complete and cross-signed
- [ ] V3 token set locked and generated
- [ ] Two V3 reference images + V3 spec attached to the prompt
- [ ] Full endpoint inventory included
- [ ] Current best `src/` + `tokens/` snapshot provided
- [ ] Generation order and quality gates documented

---

**This document + the individual Agent_XX files in this folder = the complete Phase 1 output for Darkmode_DesignzV3.**

Next: Full endpoint matrix + the single massive `V3_Phase1_Claude_Codegen_Prompt.md`.
