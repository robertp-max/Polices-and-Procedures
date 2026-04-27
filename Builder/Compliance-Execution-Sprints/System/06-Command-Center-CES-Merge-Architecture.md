# 06 — Command Center × CES Merge Architecture

> Status: ACTIVE · Owner: Platform Architecture
> Goal: Merge the existing **Compliance Command Center** with the new **Compliance Execution Sprint System (CES)** into ONE platform — without losing the Command Center's visual maturity or duplicating systems.

---

## 0. Guiding Principles

1. **One platform, two lenses.** The Command Center is the visual shell. CES is the execution engine. They share state, types, and routing.
2. **No duplicates.** No second calendar, no second dashboard, no orphan store.
3. **Source of truth wins on its own ground.** Where the Command Center is stronger (visual shell, calendar, audit mode UI) it stays primary. Where CES is stronger (sprint structure, execution units, enforcement, signature SLAs) it becomes canonical.
4. **All cross-component traffic flows through `src/policy/compliance-execution/`.** No component reads CES mock data directly anymore.

---

## 1. Current Compliance Command Center Components

| Concern | File | Route |
| --- | --- | --- |
| Shell / nav | [src/policy/components/CommandCenterLayout.tsx](src/policy/components/CommandCenterLayout.tsx) | (wraps all) |
| Dashboard | [src/policy/pages/DashboardPage.tsx](src/policy/pages/DashboardPage.tsx) | `/dashboard` |
| Master Calendar (Execution Timeline) | [src/policy/pages/MasterCalendarPage.tsx](src/policy/pages/MasterCalendarPage.tsx) | `/calendar` |
| Audit Mode | [src/policy/pages/AuditModePage.tsx](src/policy/pages/AuditModePage.tsx) | `/audit` |
| Master Controls | [src/policy/components/MasterControlInventory.tsx](src/policy/components/MasterControlInventory.tsx) | `/compliance/master-controls` |
| Workflows Library | [src/policy/workflows/WorkflowLibraryApp.tsx](src/policy/workflows/WorkflowLibraryApp.tsx) | `/workflows/*` |
| Regulatory data | [src/policy/data/regulatoryEvents.ts](src/policy/data/regulatoryEvents.ts) | — |
| Execution state | [src/policy/stores/regulatoryExecutionStore.ts](src/policy/stores/regulatoryExecutionStore.ts) | — |
| Audit classifier | [src/policy/audit/auditState.ts](src/policy/audit/auditState.ts) | — |
| Enforcement engine | [src/policy/stores/enforcementStore.ts](src/policy/stores/enforcementStore.ts) | — |
| Autogen events | [src/policy/stores/autogenStore.ts](src/policy/stores/autogenStore.ts) | — |
| eCIgn signing | [src/policy/ecign/](src/policy/ecign/) | — |

## 2. Current CES Components

| Concern | File | Route |
| --- | --- | --- |
| Sub-shell | [src/policy/ces/layouts/CesLayout.tsx](src/policy/ces/layouts/CesLayout.tsx) | (wraps `/ces/*`) |
| Sprint Dashboard | [src/policy/ces/components/dashboard/CesExecutiveDashboard.tsx](src/policy/ces/components/dashboard/CesExecutiveDashboard.tsx) | `/ces/dashboard` |
| Sprint Board (kanban) | [src/policy/ces/components/board/SprintExecutionBoard.tsx](src/policy/ces/components/board/SprintExecutionBoard.tsx) | `/ces/board` |
| Sprint Calendar (14-day) | [src/policy/ces/components/calendar/ComplianceCalendar.tsx](src/policy/ces/components/calendar/ComplianceCalendar.tsx) | `/ces/calendar` ⚠ duplicate |
| Workloads | [src/policy/ces/pages/CesWorkloadsPage.tsx](src/policy/ces/pages/CesWorkloadsPage.tsx) | `/ces/workloads` |
| Reports | [src/policy/ces/pages/CesReportsPage.tsx](src/policy/ces/pages/CesReportsPage.tsx) | `/ces/reports` |
| Types | [src/policy/ces/types.ts](src/policy/ces/types.ts) | — |
| Mock data | [src/policy/ces/data/mockSprint.ts](src/policy/ces/data/mockSprint.ts) | — |
| Enforcement hook | [src/policy/ces/hooks/useExecutionEnforcement.ts](src/policy/ces/hooks/useExecutionEnforcement.ts) | — |

## 3. Overlap Areas

| Concern | Command Center | CES | Resolution |
| --- | --- | --- | --- |
| Calendar | `/calendar` (month grid + workflow panel) | `/ces/calendar` (14-day sprint view) | **Single calendar at `/calendar`** with view toggle: `Calendar` (default) ↔ `Sprint`. `/ces/calendar` redirects to `/calendar?view=sprint`. |
| Dashboard | `/dashboard` (Critical / Pipeline / Audit Ready) | `/ces/dashboard` (Sprint metrics, blockers, phase distribution) | Both stay, but **both consume the same shared selectors**. Command Center dashboard gains a `Sprint Snapshot` strip from CES selectors. |
| Event model | `RegulatoryEvent` (rich, with steps, agendas, deps) | `ComplianceEvent` (lean, anchored) | `RegulatoryEvent` is the **parent**; `ComplianceEvent` is a **projection**. Adapter maps Command Center events into CES shape. |
| Execution state | `regulatoryExecutionStore` (steps, forms, minutes, approvals, certifications) | `EXECUTION_UNITS` (state machine: upcoming → ready → in_progress → awaiting_signature → blocked → completed) | `regulatoryExecutionStore` is canonical for **per-event operational state**. CES `ExecutionUnit`s are **derived** from it via adapter. CES seed sprint adds synthetic units for items not yet present in REGULATORY_EVENTS. |
| Audit readiness | `auditState.evaluateAudit()` (9 audit states) | `AuditReadiness` (`not_ready` / `partial` / `ready`) | Command Center's classifier is canonical. CES `AuditReadiness` is a **collapsed projection** of it. |
| Signatures | eCIgn (`useEcignSession`) + `requiredSigners` on units | `RequiredSigner[]` on `ExecutionUnit` | eCIgn drives the actual signing flow; CES's `RequiredSigner[]` is the schema for the SLA/escalation surface. Adapter pulls signer status from eCIgn signature sessions. |

## 4. Source-of-Truth Ownership

**CES owns:**
- Sprint instance (`Sprint`)
- Execution unit (`ExecutionUnit`) — schema, state machine, transitions
- Workflow phase (`WorkflowPhase`)
- Compliance state (`ComplianceState`) — `upcoming → completed`
- Audit readiness projection (`AuditReadiness`)
- Assignment (`OwnerAssignment`)
- Required signatures + escalation timers (`RequiredSigner.hoursToEscalation`)
- Sprint metrics (`SprintMetrics`) and trends (`SprintTrendPoint`)
- Enforcement rules (`useExecutionEnforcement.canTransitionState`)

**Compliance Command Center owns:**
- Visual shell, navigation style, glass-canvas layout (`CommandCenterLayout`)
- The primary calendar visual design (`MasterCalendarPage` + `TimelineMonth` + `WorkflowExecutionPanel`)
- Master Controls view (`MasterControlInventory`)
- Workflows Library view (`WorkflowLibraryApp`)
- Audit Mode view (`AuditModePage`) and the canonical audit classifier (`auditState.ts`)
- The canonical event model (`RegulatoryEvent`) and its operational state (`regulatoryExecutionStore`)

**Shared (lives in `src/policy/compliance-execution/`):**
- Cross-system selectors
- Adapter from `RegulatoryEvent` + `regulatoryExecutionStore` → CES execution units
- Cross-component event bus for selection / focus

## 5. Shared Data Model

```
RegulatoryEvent (Command Center, canonical)
   ├── processFlow[]   ─┐
   ├── requiredForms[] ─┼─► adapter ─► ExecutionUnit[] (CES shape)
   ├── approvals[]     ─┤
   └── dependencies     ┘

regulatoryExecutionStore (operational truth)
   ├── stepStates / formStates / minutesStates
   ├── approvals / certifications
   └── completions  ─► adapter ─► ComplianceState + AuditReadiness + EvidenceStatus

CES seed (mockSprint.ts) ─► additional synthetic events/units (kept for sprint demo continuity)

eCIgn session ─► RequiredSigner.status + hoursToEscalation
```

The shared layer (`compliance-execution/`) exposes ONE merged dataset (`useComplianceExecution()`) that every consumer reads from.

## 6. Routing Strategy

| Route | Owner | Notes |
| --- | --- | --- |
| `/dashboard` | Command Center | Adds Sprint Snapshot strip (CES selectors). |
| `/calendar` | Command Center | Default `view=calendar`. Toggle to `view=sprint` reveals 14-day sprint surface (CES grid). |
| `/audit` | Command Center | Reads CES audit-readiness rollup as a tile. |
| `/compliance/master-controls` | Command Center | Reads `selectUnitsForControl(controlId)` — links execution units to controls. |
| `/workflows/*` | Command Center | Reads `selectUnitsForWorkflow(workflowId)`. |
| `/ces/dashboard` | CES | Sprint focus dashboard — uses shared selectors. |
| `/ces/board` | CES | Sprint kanban — uses shared selectors. |
| `/ces/calendar` | CES → **redirect** | `Navigate` to `/calendar?view=sprint` (no duplicate). |
| `/ces/workloads` | CES | Workload distribution from `selectOwnerAssignments()`. |
| `/ces/reports` | CES | Sprint trends from `selectSprintTrends()`. |

## 7. Calendar Merge Strategy

- Single page: `MasterCalendarPage` (`/calendar`).
- Top-right view toggle:
  - **Calendar View** (default) — month grid + workflow execution panel (existing design, unchanged).
  - **CES Sprint View** — 14-day sprint window, event anchors, signature windows, recurring + retrospective markers (existing CES design, unchanged).
- Both views read from the SAME shared dataset via `useComplianceExecution()`.
- Selecting an event in **Calendar View** opens the existing `WorkflowExecutionPanel` (which already shows steps, forms, minutes, certification).
- Selecting an execution unit in **Sprint View** opens the existing CES `WorkflowDrawer` for that unit (Event → Workflow → Phase → Evidence → Signatures → Audit).
- `/ces/calendar` becomes a redirect.

## 8. Component Communication Strategy

```
       ┌─────────────────────────────────────────────────┐
       │      src/policy/compliance-execution/           │
       │                                                 │
       │  complianceExecutionTypes.ts   (canonical)      │
       │  complianceExecutionStore.ts   (merged hook)    │
       │  complianceExecutionSelectors.ts                │
       │  complianceExecutionAdapters.ts                 │
       │  complianceExecutionEvents.ts  (event bus)      │
       └────┬────────────┬────────────┬────────────┬─────┘
            │            │            │            │
   /calendar  /dashboard /audit  /compliance/master-controls
   /ces/*     workflows  eCIgn   audit/auditState
```

- Selectors are pure: `(state) => readonly result`.
- Cross-page focus (e.g. dashboard click → calendar selection) flows through URL params (already in use) and a tiny in-memory event bus for transient signals.

## 9. Execution Phases

Implementation order (matches the user's Phase 8):

1. ✅ Architecture doc (this file)
2. ✅ Shared contracts (`compliance-execution/` 5 files)
3. ✅ CES dashboard + board reroute their imports through shared facade (drop-in safe)
4. ✅ Calendar `view` toggle wired in `MasterCalendarPage`
5. ✅ `/ces/calendar` route redirects to `/calendar?view=sprint`
6. ✅ Sprint Snapshot strip on `/dashboard` (consumes CES selectors)
7. ✅ Master Controls — linked execution units footer row
8. ✅ Audit-readiness rollup tile reads from shared selector
9. ✅ Documentation files 07 / 08 / 09
10. ✅ TypeScript / build check

## 10. Risks and Controls

| Risk | Control |
| --- | --- |
| Hidden duplicate state when CES selectors and `regulatoryExecutionStore` disagree | All CES projections are derived in adapters — no parallel writable copy. |
| Visual regressions in the existing calendar | Calendar View remains untouched; toggle adds Sprint View as a sibling render branch. |
| Type drift between `AuditState` and `AuditReadiness` | One mapping function in `complianceExecutionAdapters.ts` (`auditStateToReadiness`). |
| Performance regression from adapter recomputation | Adapter memoizes per-event using stable inputs (`event.id` + relevant store slices). |
| Loss of CES seed sprint demo content | Adapter merges seed sprint events alongside REGULATORY_EVENTS rather than replacing. |
| Future contributors writing direct `mockSprint` imports | New rule: any component outside `src/policy/ces/data/` that needs sprint data MUST import from `src/policy/compliance-execution/`. Documented in `07-Shared-Data-Contracts.md`. |
