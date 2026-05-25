# Master Issues List for Claude — CES / UI-Staging Alignment & Seeding

**Date**: 2026-05-21  
**Purpose**: Consolidated list of problems between the live app and the UI-Staging harness (`V3StagingApp.tsx`), with focus on making rich V3 seeding work properly while achieving structural and behavioral alignment.

This document combines findings from the 16-agent swarm + direct observations from the current session.

---

## 1. Information Architecture & Navigation Problems (High Priority)

### 1.1 Only One Dashboard Should Exist
- There should be **only one Dashboard** in the entire application.
- That Dashboard must be the **home screen** of the app.
- The CES section should **never** have its own "Dashboard".

**Current Problem**: The CES section previously had (and still references) a "CES Dashboard".

### 1.2 Calendar Incorrectly Labelled as "Dashboard"
- In the live app, `CesDashboardPage.tsx` simply renders `<MasterCalendarPage />`.
- This means the Calendar is being presented to users under a "Dashboard" label / route name.
- This is confusing because:
  - There is already a real top-level Dashboard (home screen).
  - Users cannot tell whether they are in a dashboard or the calendar.

**Evidence**: Live code + user screenshot (Screenshot 2026-05-21 131952.png) showing the Calendar being treated as the CES Dashboard.

### 1.3 Desired CES Main View
- The **default / primary view** when entering the CES section should be the **Calendar** (the view shown in the referenced screenshot).
- The Calendar should be clearly named **"Calendar"**, not "Dashboard".
- The Calendar should be the main surface for CES execution visibility (events, units, sprints, etc.).

### 1.4 Harness (`V3StagingApp.tsx`) is Out of Sync
- The nav item `ces-dashboard` currently loads the old custom toy CES dashboard (with role tabs, KPI cards, veil layers, etc.).
- This no longer matches the intended structure (Calendar as the main CES view).
- The old toy `CesDashboardPage` inside the monolith has no long-term purpose under the CES section.

**Recommended Fix**:
- Remove or repurpose the `ces-dashboard` label.
- Make the Calendar the default landing page when navigating into the CES section in the harness.
- When `useV3Seeds` is enabled, the Calendar must render with rich seeded data.

---

## 2. Missing or Incomplete Components in the UI-Staging Harness

The harness has strong visual fidelity for the V3 glass style, but many production surfaces are missing or heavily simplified:

- **Calendar Gantt view** (timeline / Gantt rendering, dependencies, resource views)
- **Right panels** (evidence details, task details, signer panels, etc. that appear in the live app)
- **Audit Log** surface (full audit trail with proper filtering and detail)
- Other CES-related views that exist in the live app but are thin or absent in the `ces-*` sections of the harness

These gaps make it difficult to properly test seeded data in realistic contexts.

---

## 3. Seeding & Data Fidelity Roadblocks

### 3.1 Data Model Misalignment
- The toy models inside `V3StagingApp.tsx` (`CesExecutionUnit`, `CesBoardTask`, local compliance states, flat owner strings, etc.) are significantly different from the canonical live `ExecutionUnit` in `src/policy/ces/types.ts`.
- The current `mapToLocalUnit` adapter is lossy and destructive.

### 3.2 Grouping & Projection Logic Differences
- The toy board uses domain-based filtering and custom `PmTaskStatus` columns.
- The live `SprintExecutionBoard` uses event-based swimlanes + real `COMPLIANCE_STATE_ORDER` columns.
- Seeded data is not exercising the real grouping logic.

### 3.3 Component Parity Gaps
- The seeded path in the harness does not use real components (`ExecutionUnitCard`, `WorkflowDrawer`, drag + enforcement logic, etc.).
- Result: Seeded data looks different and behaves differently than it would in production.

### 3.4 Missing Supporting Data for Realistic Projections
- `V3_ExecutionUnitsSeed` alone is not enough.
- Live consumers require proper `RegulatoryEvent[]`, execution state (`formStates`, `stepStates`, signer tasks), workflow alignments, and correct sprint windows.
- Without this, real hooks (`useComplianceExecution`, projections, calendar, etc.) return empty or demo data even when seeds are enabled.

### 3.5 No Clean Injection Path into Live System
- Currently, seeding only affects the toy surfaces inside `V3StagingApp.tsx`.
- There is no good way to make the *real* live components (`SprintExecutionBoard`, dashboards, drawers, My Tasks, etc.) run on the rich V3 seed data.
- A dev-only, flag-driven injection point inside `useComplianceExecution` (or equivalent) is needed.

### 3.6 Role / ViewMode / Surveyor Differentiation Not Wired
- The seed data has `V3_ViewModeSeed` (internal vs surveyor) + `V3_AchcSurveyorAlignmentSeed`.
- This is only exercised in the isolated `/ui-staging/ces-seed` preview.
- The main CES pages in the harness do not support switching between internal and surveyor views with seeded data.

### 3.7 Evidence Hierarchy & Folder Structure Missing
- Seeded units contain `evidenceStatus`, but there is no corresponding seeded evidence folder tree or artifacts.
- The Evidence Center and evidence drawers in the harness are too thin to test realistic seeded evidence flows.

---

## 4. Harness Architecture & Maintainability Issues

- `V3StagingApp.tsx` (~3100+ LOC) is a monolith containing the shell + 25+ page functions + all mocks + seeding logic.
- The current `useV3Seeds` toggle is a localized hack (only wired to two CES pages, uses lossy per-page adapters).
- This pattern will not scale cleanly as more domains (PM, Evidence, Calendar, Audit, etc.) get rich seeds.
- Token usage is inconsistent (local `const V3` objects instead of `v3Tokens.ts`).
- No clean registry or preview component pattern.

**Recommended Direction** (from Agent 08 & 09):
- Introduce a global `SeededMode` context + central `seeds/` layer.
- Extract shell + use a preview registry.
- Make it easy to mount real live components inside the V3 glass shell when seeding is enabled.

---

## 5. References to Detailed Agent Reports

All individual agent reports are in this folder:

- `Agent_01_Data_Model_Alignment.md`
- `Agent_02_Grouping_Logic_Parity.md`
- `Agent_03_CES_Board_Parity.md`
- `Agent_04_Seed_Injection_Strategy.md`
- `Agent_05_Supporting_Data_Requirements_Events_Workflows_Sprints.md`
- `Agent_06_Role_View_Differentiation.md`
- `Agent_07_Evidence_Hierarchy_Roadblocks.md`
- `Agent_08_Seeding_UX_Strategy.md`
- `Agent_09_Monolith_Seeding_Maintainability.md`

These contain line numbers, code snippets, and detailed recommendations.

---

## Next Steps Recommendation

1. Fix the Information Architecture first (single Dashboard rule + correct naming of the Calendar as the primary CES surface).
2. Update the navigation in both the live app and the `V3StagingApp.tsx` harness accordingly.
3. Implement a proper seed injection path into `useComplianceExecution` so real components can run on V3 seed data.
4. Expand the seed data (events + state) so the Calendar and other surfaces actually populate realistically.
5. Refactor the harness architecture so adding more seeded surfaces becomes sustainable.

---

**Status**: This document is the single source the user wants Claude to work from for fixing both structural/IA issues and seeding alignment issues.