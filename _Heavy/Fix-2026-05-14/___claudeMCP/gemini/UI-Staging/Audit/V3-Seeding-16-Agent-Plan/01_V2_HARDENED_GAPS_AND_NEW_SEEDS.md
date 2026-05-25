# V2 Hardening — Quick Gap Summary + New Required Seeds

**Date**: 2026-05-20  
**Purpose**: Fast reference so you don't have to re-read the full 16-agent V2 blueprint.

---

## Top Gaps Identified in First Plan (Now Closed in V2)

1. **Sprint Selection / Switching** (`activeSprint`, `SprintScopeToolbar`, multi-sprint views)
   - Affects: Dashboard, Calendar, My Planner / PM views, CES Executive Dashboard, Audit Mode, CesLayout
   - Previously only lightly mentioned under "calendar/sprint projections"

2. **ACHC Surveyor View & Alignment** (`AchcSurveyAlignmentPage`, `/framework/achc-survey`, evidence matrix per standard)
   - Completely missing from original plan
   - This is a first-class production surface with its own data shape (standards, crosswalks, alignment status)

3. **Role / View-Mode Differentiation**
   - Surveyor sees different things than internal DON/Compliance Officer
   - Needed for realistic "view as" scenarios in both staging and Veil work

4. **Toolbar / Scope Selector State**
   - Many real components expect rich selectable scopes that change the underlying data

5. **Executive Aggregate + Filter Rollups**
   - CesExecutiveDashboard and similar surfaces need sprint-scoped + surveyor-context aggregates

---

## New / Heavily Upgraded Seed Exports Required in V2

```ts
// Core new ones
export const V3_SprintContextSeed = { ... };              // 3–5 realistic sprints (current, Q1, Q2, upcoming)
export const V3_ActiveSprintSeed = { ... };               // The one currently selected
export const V3_AchcSurveyorAlignmentSeed = { ... };      // ACHC standards + evidence requirements + alignment status

// Supporting
export const V3_RoleViewSeeds = {
  internal: { ... },
  surveyor: { ... },
  don: { ... },
  compliance: { ... }
};

export const V3_ToolbarScopeSeeds = { ... };              // Common filter/scope states used across surfaces

// Updated context hook recommendation
export function useV3SeededContext() {
  return {
    sprint: V3_ActiveSprintSeed,
    roleView: 'surveyor' | 'internal',
    alignment: V3_AchcSurveyorAlignmentSeed,
    ...
  };
}
```

---

## New/Upgraded Agent Focus (V2)

- **Agent 07 (Sprint Context)** — Brand new critical agent
- **Agent 08 (ACHC Surveyor Alignment)** — Brand new critical agent
- **Agent 06 (Personnel/Role)** — Now explicitly handles surveyor vs internal views
- **Agent 10 (Toolbars/Scopes)** — New dedicated agent
- **Agent 14 (UAT Scenarios)** — Major expansion to include sprint switching + surveyor mode flows
- **Agent 07/09/11/16** — All strengthened for the new surfaces

---

## Recommended First Actions

1. Generate `V3_SprintContextSeed` + `V3_ActiveSprintSeed` first
2. Generate `V3_AchcSurveyorAlignmentSeed` second
3. Then wire a simple prototype toggle ("Switch Sprint" + "View as Surveyor") in the ui-staging harness or a throwaway proto route

This order directly addresses the two examples you gave.

---

**Status**: V2 plan is now the source of truth for the actual seeding work.

Let me know when you're ready to start generating the real seed data skeletons.