# V2 — Hardened 16-Agent V3 Seeding Swarm Plan (Second Pass)

**Prepared by**: Grok 4.3  
**Date**: 2026-05-20  
**Status**: Second Pass — Hardened for Complete Endpoint Coverage  
**Trigger**: User request — "make sure when we seed we have all the endpoints covered... sprint toggle... ACHC surveyor view etc."

---

## Executive Summary — Why This Second Pass

The original 16-agent seeding plan was strong on core CES task/workflow/evidence data but **under-specified** several critical real-world surfaces that the V3 implementation and production Veil work will actually hit:

- **Sprint switching / multi-sprint selection** (activeSprint, SprintScopeToolbar, PM views, Calendar, CES Executive Dashboard, Audit Mode)
- **ACHC Surveyor mode & alignment views** (`AchcSurveyAlignmentPage`, `/framework/achc-survey`, surveyor evidence explorer, crosswalks, standard-specific evidence mapping)
- Role / View differentiated data (internal vs surveyor, DON vs Compliance Officer vs Surveyor perspectives)
- Executive / aggregate filter states and toolbar scopes
- Other high-visibility surfaces that currently rely on thin or missing mock data

**This V2 Hardened plan** expands scope, adds explicit agent charters for the gaps, and defines new required seed artifacts so that when we actually generate `V3_CES_SeedData.ts` (and siblings), **nothing important is left as "we'll fake it later"**.

---

## Gap Analysis vs Original Plan

| Gap Area                        | Original Plan Coverage          | Risk if Missed                                      | V2 Hardening |
|--------------------------------|----------------------------------|-----------------------------------------------------|--------------|
| Sprint selection & switching   | Only light "calendar / sprint projections" | SprintScopeToolbar, activeSprint in Dashboard/Calendar/PM/Audit will be broken or static | New dedicated Agent + `V3_SprintContextSeed` |
| ACHC Surveyor / Alignment      | Not mentioned                    | `AchcSurveyAlignmentPage`, surveyor routes, evidence matrix for standards will have no data | New Agent + `V3_AchcSurveyorAlignmentSeed` |
| Role / View-mode differentiation | Implicit only                    | Surveyor view vs internal view, different data density/permissions | Explicit role seeds + view-mode variants |
| Executive / CesExecutiveDashboard | Covered in "calendar/sprint" only | KPI aggregates, readiness scores, multi-sprint rollups | Strengthened Agent 07 + new aggregate seeds |
| Toolbar / Scope / Filter state | Weak                             | Many real components (SprintScopeToolbar, PmFilterBar, etc.) expect rich selectable scopes | New cross-cutting Agent |
| UAT flows involving "switch context" | Basic                            | "Switch to Q2 sprint", "Enter surveyor mode for ACHC", "View as DON" | Expanded scenario matrix in Agent 14 |

---

## Revised Scope (V2)

**Must be seeded for full endpoint coverage:**

- All original items (folders, tasks, workflows, signatures, artifacts, personnel)
- **Sprint context & selection**: Multiple sprints (Q1, Q2, current, upcoming), sprint windows, active sprint state, selectable scopes
- **ACHC Surveyor alignment data**: Standards, crosswalks, evidence requirements per standard, surveyor evidence explorer data, alignment status
- Role-aware / view-mode data (internal clinical, compliance, surveyor, executive)
- Executive dashboard aggregates and filterable rollups
- Toolbar / scope selector states that appear across Calendar, PM, CES, Audit
- Realistic filter + search result shapes for the various toolbars

---

## Updated Primary References (V2)

Add these to the original list:

- `src/policy/pm/pmViewSprintStore.ts`
- `src/policy/pm/sprintWindows.ts`
- `src/policy/components/pm/SprintScopeToolbar.tsx`
- `src/policy/ces/layouts/CesLayout.tsx`
- `src/policy/pages/AchcSurveyAlignmentPage.tsx`
- `src/policy/pages/AuditModePage.tsx` (sprint + audit mode usage)
- `src/policy/components/ces/dashboard/CesExecutiveDashboard.tsx`
- `src/policy/pm/SprintPlanPage.tsx`, `SprintReviewPage.tsx`
- Real ACHC crosswalk / standard data shapes

---

## V2 — 16 Specialized Agent Charters (Hardened)

Each agent must explicitly address **sprint switching** and **ACHC surveyor / alignment** surfaces where relevant.

### Agent 01 — Evidence Folder Hierarchy & Triplet (Hardened)
Same as V1 + ensure folders can be filtered/scoped by **active sprint** and **surveyor alignment standard**.

### Agent 02 — Task Detail & Timeline (Hardened)
Add sprint affiliation + surveyor visibility flags on tasks.

### Agent 03 — Workflow Unit & Execution (Hardened)
Workflows must support being viewed under different sprints and in surveyor mode.

### Agent 04 — Signature Roster & Multi-Signer (Hardened)
No major change.

### Agent 05 — Policy / Regulatory Event Linking (Hardened)
Strongly emphasize ACHC standard linking for surveyor alignment seeds.

### Agent 06 — Personnel & Role Context (Hardened — Upgraded)
**New primary focus**: Create differentiated seeds for:
- Internal clinical roles (DON, Staff Nurse)
- Compliance / QAPI roles
- **ACHC Surveyor persona** (what a surveyor sees vs internal user)
Deliver role-specific subsets + permission-aware data slices.

### Agent 07 — Sprint Context, Selection & Windows (NEW — Critical)
**Highest priority new agent.**
- Design `V3_SprintContextSeed` + `V3_ActiveSprintSeed`
- Multiple realistic sprints (current, previous, upcoming)
- Sprint windows, scope selectors, active sprint label + date range
- How `activeSprint` flows through `pmViewSprintStore`, `CesLayout`, `SprintScopeToolbar`, Calendar, PM views, Audit Mode, Executive Dashboard
- Deliver selectable sprint list + current active state that multiple components can consume

### Agent 08 — ACHC Surveyor Alignment & Evidence Mapping (NEW — Critical)
**Second highest priority new agent.**
- `V3_AchcSurveyorAlignmentSeed`
- Standards, domains, crosswalk data, required evidence per ACHC standard
- Surveyor evidence explorer / matrix state
- Alignment status (Met / Partial / Gap) per item
- What the `/framework/achc-survey` and `AchcSurveyAlignmentPage` actually need
- Deliver rich, realistic surveyor-view data that feels like a real prep for survey

### Agent 09 — Executive / Aggregate Dashboard Data (Hardened)
CesExecutiveDashboard, readiness scores, multi-sprint rollups, KPI cards that change based on selected sprint or surveyor context.

### Agent 10 — Toolbar, Scope & Filter State Seeds (NEW)
Dedicated agent for all the selector / filter components:
- `SprintScopeToolbar`
- `PmFilterBar`
- Various CES / Calendar filters
- What "current scope" looks like as seed data

### Agent 11 — Seed File Architecture & Public API (Hardened)
Update the architecture to support:
- `V3_SprintContextSeed`
- `V3_AchcSurveyorAlignmentSeed`
- Role / view-mode variants
- Easy switching for "surveyor mode" in prototypes

### Agent 12 — Feature Flags, isV3, glassVariant + View-Mode Flags (Hardened)
Add support for surveyor view toggle / role simulation flags alongside the existing `isV3` / `glassVariant` flags.

### Agent 13 — Fidelity Gap Analysis — Now Including Sprint + Surveyor Surfaces
Explicit audit of every place that reads `activeSprint`, surveyor data, alignment matrices, etc.

### Agent 14 — UAT & Demo Scenario Coverage (Hardened — Major Expansion)
**Minimum required scenarios** (must all be seedable):
- Switch between Q1 / Q2 / current sprint and see data update across Dashboard, Calendar, My Planner, CES Board
- Enter "ACHC Surveyor view" and see appropriate alignment matrix + evidence requirements
- View as different roles (DON vs Surveyor vs Compliance Officer)
- Executive rollup changes when sprint scope changes
- Full surveyor prep flow (review standards → find gaps → attach evidence)

### Agent 15 — Cross-Surface Consistency (Hardened)
Ensure seeds work for both ui-staging V3 pages **and** the real production components that use sprint + surveyor data.

### Agent 16 — Master Synthesis + Hardened Seeding Roadmap
Produce the final master report with:
- Complete seed file contract (all new exports)
- Phased generation order (Sprint + Surveyor first, then everything else)
- Risk register focused on the new gap areas
- Exact "ready to generate" instructions for the team

---

## New Required Seed Exports (V2 Additions)

In addition to the original list, the seed module(s) **must** export:

```ts
export const V3_SprintContextSeed = { ... };           // multiple sprints + active
export const V3_ActiveSprintSeed = { ... };            // currently selected
export const V3_AchcSurveyorAlignmentSeed = { ... };   // standards + evidence map + status
export const V3_RoleViewSeeds = { ... };               // surveyor vs internal variants
export const V3_ToolbarScopeSeeds = { ... };           // common filter/scope states
```

Plus a recommended `useV3SeededContext()` or similar that can return sprint + role + alignment context together.

---

## Success Criteria — V2 (Hardened)

- You can switch sprints in the seeded V3 harness (or a prototype) and every relevant surface updates realistically.
- You can toggle into an "ACHC Surveyor" view and see a convincing alignment matrix with real-shaped data.
- No major CES or PM surface in the IMPLEMENTATION_PLAN or Veil declutter work is left with "empty or static" data after seeding.
- The generated seed files are the single source of truth that both the staging harness and the real Veil components can consume safely.

---

## Recommended Execution Order (V2)

1. Deploy Agent 07 (Sprint Context) + Agent 08 (ACHC Surveyor) **first** — these are the two biggest current gaps.
2. Then Agent 06 (Role/View), Agent 10 (Toolbars), Agent 14 (Scenarios).
3. Run the rest of the swarm in parallel.
4. Agent 16 produces the final hardened master report + generation checklist.

---

**This V2 plan closes the specific holes you called out (sprint toggle + ACHC surveyor) and raises the bar so we don't discover more "we forgot X endpoint" issues during actual seeding or the IMPLEMENTATION_PLAN execution.**

Ready to proceed?

Options:
- Approve this V2 blueprint and I generate the first-draft seed file skeletons (starting with Sprint + ACHC Surveyor).
- Run the full 16-agent swarm using this hardened plan.
- First create a quick "Gap Audit" report by having me (or subagents) scan the key sprint + surveyor files.

Just tell me how aggressive you want to go. We're making sure this seeding pass is actually complete.