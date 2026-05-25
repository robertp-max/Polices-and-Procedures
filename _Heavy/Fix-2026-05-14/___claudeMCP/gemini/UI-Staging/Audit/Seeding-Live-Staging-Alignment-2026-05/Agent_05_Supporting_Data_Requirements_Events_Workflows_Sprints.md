# Agent 05 — Supporting Data Requirements (Events, Workflows, Sprints)
## Seeding-Live-Staging-Alignment Audit (2026-05)

**Date**: 2026-05-21  
**Agent**: 05 — Supporting Data Requirements (Events, Workflows, Sprints)  
**Mission**: The current `V3_ExecutionUnitsSeed` is good but incomplete for realistic live projections. Analyze what else the real `complianceExecutionStore`, `taskProjection`, sprint logic, etc. require (`RegulatoryEvent`, `Workflow`, `SprintWindow` with proper overlaps, obligation sources, etc.). Identify the minimum set of additional seeded data structures needed so that when seeds are used in the live system, the board, dashboard, calendar, etc. all populate meaningfully without falling back to empty states or demo data. Propose the shape of a fuller `V3_CES_FullSeed` or per-sprint seed package.

**Files Analyzed (via list_dir + targeted read + cross-grep across src/policy, ui-staging, Builder/Compliance-Execution-Sprints/)**:
- `src/policy/ces/data/V3_CES_SeedData.ts` (current V3_SprintContextSeed, V3_ExecutionUnitsSeed (5 units with synthetic evt-/wf- IDs), V3_AchcSurveyorAlignmentSeed, personas, view modes; references parentEventId/workflowId/sourceType/sprintId)
- `src/policy/compliance-execution/complianceExecutionStore.ts` (ComplianceExecutionSnapshot: events (MergedComplianceEvent[] from REGULATORY_EVENTS + adapters), executionUnits (from onboardingEngine + regulatory), workflows, Sprint, useComplianceExecution(scope: sprint|month|all), buildSprintWindow (CES 12-day Mon-Fri epoch), filterRegulatoryEventsForScope + regulatoryEventOverlapsSprint)
- `src/policy/compliance-execution/complianceExecutionTypes.ts` & `complianceExecutionAdapters.ts` (Merged*, regulatoryEventToComplianceEvent, deriveExecutionUnit, DOMAIN_MAP, event → unit projection)
- `src/policy/pm/taskProjection.ts` + `taskProjectionCore.ts` (useProjectedTasks(scope), REGULATORY_EVENTS + generatedEvents + triggeredEvents + formStates/stepStates/signerTasks from regulatoryExecutionStore + overlays + WORKFLOWS; filters by regulatoryEventOverlapsSprint + projectTasks)
- `src/policy/pm/sprintWindows.ts` (PM SprintWindow: 26/year, 14-day Sun-Sat, firstSundayOfYear, sprintForDate, regulatoryEventOverlapsSprint helper; NOTE mismatch with CES store's buildSprintWindow)
- `src/policy/data/regulatoryEvents.ts` (REGULATORY_EVENTS_RAW via MANDATED_EVENTS_EXPANDED + inline May 2026 "now" window; real IDs: 'governing_body_meeting-20260514-01', 'qapi_meeting-20260512-09', 'claims_submission-20260513-01', etc.; dates 2026-05-11 to 05-31; full processFlow, requiredForms, policyRefs, dependencies, minutes, approvals)
- `src/policy/data/mandatedEventsExpanded.ts` (base mandated set)
- `src/policy/data/eventWorkflowAlignment.ts` + `src/policy/data/workflows.generated.ts` (WORKFLOWS keyed by 'CL-WF-26', 'QA-WF-...', eventWorkflowAlignment for processFlow derivation when event declares workflowId; V3 uses 'wf-gb-packet-2026-10' style — no match)
- `src/policy/stores/regulatoryExecutionStore.ts` (layers formStates, stepStates, signerTasksByFormInstanceId, evidence, approvals ON TOP of REGULATORY_EVENTS; seedFromRegulatoryEvent, effective*Status; persisted)
- `src/policy/compliance-execution/useEventExecutionDataflow.ts` + `eventTaskAdapter.ts` + `eventInstanceId.ts` (derives EventInstance, tasks, cesExecutionUnits, requiredForms from events + store state; buildEventInstanceIndex)
- `src/policy/ces/components/board/SprintExecutionBoard.tsx` + `src/policy/ces/pages/CesBoardPage.tsx` (live: useComplianceExecution({mode:'sprint', window}) → EVENTS + EXECUTION_UNITS; grouping by parentEventId + ComplianceState columns)
- `src/ui-staging/V3StagingApp.tsx` (useV3Seeds toggle; seededUnits feed some board paths but boardTasks=[] when seeded; mapToLocalUnit; synthetic IDs)
- `src/policy/pm/pmViewSprintStore.ts`, `src/policy/pm/pmOverlayStore.ts`, `src/policy/stores/autogenStore.ts` (sprintWindow for PM views, overlays, generated/triggeredEvents)
- `src/policy/onboarding/onboardingExecutionEngine.ts` (separate onboarding units/batches; mixed in snapshot)
- `src/policy/ces/types.ts` (ExecutionUnit with obligationKind/sourceType/parentEventId/workflowId/sprintId/ownership + Sprint/Workflow/SprintMetrics)
- Supporting: `src/policy/data/eventAlignmentPolicy.ts`, `src/policy/ces/cesExecutionMode.ts`, `src/policy/utils/appInitializer.ts` (hydrates framework/policy/calendar but relies on static REGULATORY_EVENTS), Builder/Compliance-Execution-Sprints/Documentation/* (data contracts, SprintWindow overlaps, obligation sources), V3 seeding blueprints (Agent 05 scope: Policy/Regulatory Event/Obligation Linking + supporting data)

---

## 1. Executive Summary of Incompleteness

`V3_ExecutionUnitsSeed` (5 rich canonical `ExecutionUnit[]` with domains, owners, signers, evidenceStatus, obligation extensions, role assignments, sprintId='2026-10' or '2026-09') is **production-shaped and correctly typed**. It powers realistic V3 staging renders for CES board/drawers (when `useV3Seeds`).

However, **live system paths** (`useComplianceExecution`, `useProjectedTasks`, SprintExecutionBoard, DashboardPage, MasterCalendarPage, EvidenceCenterPage, etc.) **do not consume V3_ExecutionUnitsSeed directly**. They derive everything from:

- Static `REGULATORY_EVENTS` (filtered by sprint overlap or scope)
- `useRegulatoryExecutionStore` state (form/step/signer/evidence)
- Autogen generated/triggered events
- Onboarding engine (for some units)
- WORKFLOWS + eventWorkflowAlignment
- SprintWindow from `pmViewSprintStore` (PM style) or CES internal

**Result**: When seeds are "turned on" for live-like previews, surfaces fall back to:
- Empty `EVENTS` / `EXECUTION_UNITS` arrays (no matching parentEventId)
- Zero projected Tasks (no overlapping real events + no formStates)
- Empty calendar tiles, dashboard KPIs, evidence hierarchies
- Demo/toy fallbacks or "no data" states in board/dashboard/calendar

**Core root cause**: V3 seed uses **synthetic/non-resolving references** (`parentEventId: 'evt-gb-q2-2026'`, `workflowId: 'wf-qapi-data-2026-10'`, sprint '2026-10' (CES 12d style)) + **no supporting event/state seeds**. The units exist in isolation; the graph (events → workflows → obligations → derived units/tasks → projections) is missing.

**Live projections require the full supporting data graph** for any sprint window to be non-empty.

---

## 2. Exact Data Requirements by Consumer (What Must Be Seeded)

### 2.1 complianceExecutionStore + useComplianceExecution(scope)
- **Requires**: `REGULATORY_EVENTS` subset (or full set) where `regulatoryEventOverlapsSprint(e, window)` or date in month/scope is true.
- Produces: `events: MergedComplianceEvent[]` (via adapters + regulatoryEventToComplianceEvent), `executionUnits: MergedExecutionUnit[]` (from engine + adapters), `workflows[]` (computed from batches/units).
- Current V3 seed units reference non-existent events → adapters produce 0 items for scope.
- Sprint computation: CES internal `buildSprintWindow` (Mon-Fri 12d, id=`sprint-N`) vs PM. V3_SprintContextSeed uses custom `{id:'2026-10', start:'2026-05-10', ...}` which does **not** match PM `sprintWindowsForYear(2026)` (26 sprints, YYYY-NN, Sun-Sat).
- **Gap**: No seed for events in 2026-05-10..23 window; no way to override scope input.

### 2.2 taskProjection / useProjectedTasks + taskProjectionCore
- **Requires**: Events overlapping sprint (from REGULATORY + autogen + triggered), `formStates`/`stepStates`/`signerTasksByFormInstanceId` from regulatoryExecutionStore, WORKFLOWS for titles, overlays/personal tasks.
- Produces: `Task[]` (CES + PM surfaces, Kanban, My Tasks, Gantt).
- Without seeded formStates for the events and real overlapping events → `projectTasks` returns [] or minimal.
- V3 units have `sourceType: 'REGULATORY_EVENT' | 'WORKFLOW' | ...` but no backing store state or events.

### 2.3 SprintExecutionBoard / CesBoard / details drawers
- Consumes `snap.events` + `snap.executionUnits` from complianceExecution (sprint-scoped).
- Groups by `parentEventId`. Synthetic IDs → empty swimlanes.
- Needs realistic events with `processFlow` (for WorkflowDrawer, steps), `requiredForms`, `dependencies`.

### 2.4 Dashboard, Calendar, Evidence Hierarchy, Audit surfaces
- Pull REGULATORY_EVENTS directly + derived state.
- Calendar: date-overlap + urgency + process steps.
- Evidence: `buildCesTaskRequirements`, folders via eventFolders.
- Empty without events that have full `processFlow[]`, `requiredForms[]`, `minutes`, `approvals`, `complianceFlags`.

### 2.5 Sprint logic / pm/* + overlaps
- PM: `pmViewSprintStore` supplies `SprintWindow` (14d) to filters.
- CES: separate 12d windows.
- `regulatoryEventOverlapsSprint` must return true for seeded events.
- V3 context has 4 sprints but IDs/dates conflict with PM generator; no "proper overlaps" test data.

### 2.6 Obligation sources + provenance
- Units use `sourceType`, `sourcePolicyIds`, `sourceWorkflowIds`, `obligationKind` ('SPRINT_TASK' vs 'TASK'), `parentObligationId`.
- Real system resolves via policyCorpus, WORKFLOWS, event refs.
- V3 has examples (e.g. 'GV-GB-001') but not a complete linked set for the sprint events.

### 2.7 RegulatoryExecutionStore state layer
- Critical: Without initial `formStates` (keyed by event+form), `stepStates`, signer tasks, evidence → all derived `effective*Status`, `cesExecutionUnits`, projections are default/empty.
- `seedFromRegulatoryEvent` exists but no bulk seed injector for V3 scenarios.

### 2.8 Autogen / generatedEvents
- Many live events come from autogenStore (annualGenerator, triggerEngine) on top of static mandated.
- For May "now" realism, need some generated/triggered seeds or the generator run against the window.

### 2.9 Other (for full non-empty)
- PmOverlayStore / personalStore tasks.
- ACHC crosswalks + evidence (partial in V3_Achc...).
- Form instances, eCIgn artifacts for signature flows.
- Consistent personas + owners that match real event owners.

**Minimum viable for "board + dashboard + calendar populate meaningfully"** (no empty/demo fallbacks):
1. Curated `RegulatoryEvent[]` slice for target sprint(s) (realistic May 2026 dates/IDs with full fields: processFlow, requiredForms, policyRefs, dependencies, minutes, category, domain, urgency).
2. `SprintWindow[]` (PM-style preferred) + updated V3 context that aligns or provides mapping + overlap-verified events.
3. Minimal `RegulatoryExecutionStateSeed` (formStates/stepStates/signers for the events above, enough to drive 2-4 units per event).
4. `Workflow` refs/alignments (use real '*-WF-*' IDs or extend units to declare `workflowId` that exists in generated).
5. Updated `V3_ExecutionUnitsSeed` (or companion) that reference the real event/workflow IDs + full source/obligation fields + sprintId matching windows.
6. (Optional but high-value) Small autogen seed + initial store state injector.

This set ensures `filterRegulatoryEventsForScope` + adapters + projection + dataflow all yield >0 items.

---

## 3. Sprint ID & Overlap Conflicts (Detailed)

- **V3 CES style** (in seed + old compliance store): id=`2026-10`, number=10, 12 calendar days (Mon-Fri), epoch-anchored from 2026-01-05.
- **PM canonical** (sprintWindows.ts, pmViewSprintStore, taskProjection, board live path): id=`2026-10` (padded NN), 14 days Sun-Sat, 26 per year from firstSundayOfYear(2026) ≈ Jan 4.
- Dates in V3 active ('2026-05-10'–'2026-05-23') roughly align with a real May sprint but the `id` and `regulatoryEventOverlapsSprint` contract differ.
- Real May events (from regulatoryEvents.ts): 2026-05-11 (governing_body_prep), 05-12 (qapi), 05-13 (claims, system_activity), 05-14 (governing_body, compliance_report), 05-18 (episode), 05-19/20/21/22 etc.
- V3 units reference non-matching evt-*/wf-* and sprint '2026-10' (CES) while live PM board may resolve different window.

**Consequence**: Even if events were present, sprint-scoped filters return [] for V3 units' sprintId.

---

## 4. Proposed Shape: V3_CES_FullSeed (or Per-Sprint Package)

**Recommended location**: `src/policy/ces/data/V3_CES_FullSeed.ts` (or extend V3_CES_SeedData.ts; export from there for tree-shaking).

**Core Interface Proposal** (minimal + extensible):

```ts
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { SprintWindow } from '@/policy/pm/sprintWindows';
import type { ExecutionUnit, Workflow, Sprint } from '@/policy/ces/types';
import type { FormState, StepState } from '@/policy/stores/regulatoryExecutionStore';
import type { V3SprintContext, V3AchcSurveyorAlignment, V3ViewModeSeeds, V3Persona } from './V3_CES_SeedData';

// Per-sprint or full bundle for injection
export interface V3RegulatoryExecutionStateSeed {
  formStates: Record<string, FormState>;           // key: `${eventId}:${formId}`
  stepStates: Record<string, StepState>;           // key: `${eventId}:${stepId}`
  signerTasksByFormInstanceId?: Record<string, any[]>;
  evidenceDocs?: any[];
  approvals?: any[];
  // For autogen merge
  generatedEvents?: RegulatoryEvent[];
  triggeredEvents?: RegulatoryEvent[];
}

export interface V3CESFullSeed {
  // Sprint context (updated to carry BOTH styles or canonical PM + CES label)
  sprint: V3SprintContext & {
    pmWindows: SprintWindow[];           // authoritative PM 14d windows for the range
    cesWindows: Sprint[];                // legacy 12d for CES store compat
    activePmWindow: SprintWindow;
  };

  // The critical missing graph — sprint-overlapping + realistic
  regulatoryEvents: RegulatoryEvent[];   // e.g. May 2026 slice with real IDs; dates overlap active window(s)
  workflows: Record<string, Workflow>;   // subset or full; or just alignment map eventId → workflowId

  // Units now fully linked (update existing V3_ExecutionUnitsSeed to reference real IDs above)
  executionUnits: ExecutionUnit[];       // parentEventId from regulatoryEvents[], workflowId from workflows, sprintId matches

  // State layer so derivations are populated (injected into regulatoryExecutionStore in dev/seed mode)
  regulatoryState: V3RegulatoryExecutionStateSeed;

  // Existing V3 richness (ACHC, personas, views)
  achc: V3AchcSurveyorAlignment;
  personas: Record<string, V3Persona>;
  viewModes: V3ViewModeSeeds;

  // Obligation / provenance completeness
  policyRefsSeed?: string[];             // e.g. ['GV-GB-001', 'QA-PG-001', ...] for cross-ref validation
  sourceObligationExamples?: Array<{sourceType: string; examples: string[]}>;

  // Helpers for consumers / staging injector
  getRegulatoryEventsForSprint(sprintIdOrWindow: string | SprintWindow): RegulatoryEvent[];
  getExecutionStateForEvent(eventId: string): Partial<V3RegulatoryExecutionStateSeed>;
  // buildSnapshotForScope(...) → partial ComplianceExecutionSnapshot
}

export const V3_CES_FullSeed: V3CESFullSeed = { ... };  // concrete for 2026-10 / May window

// Convenience: per-sprint packages (recommended for maintainability)
export const V3_Sprint10_FullSeed: V3CESFullSeed = { ... }; // May 10-23 focus
export const V3_Sprint09_FullSeed: V3CESFullSeed = { ... };
```

**Usage in live/staging (dev-only injection)**:
- Add dev flag `useV3FullSeeds`.
- In `useComplianceExecution`, `useRegulatoryExecutionStore`, `useProjectedTasks`, `appInitializer`: if flag, merge/inject the seed's `regulatoryEvents`, `regulatoryState.formStates` etc. before computing snapshot.
- Update `V3StagingApp` + live components to optionally bypass static REGULATORY_EVENTS.
- `mapToLocalUnit` / adapters become identity or thin when full seed used.
- Add verification: on seed load, assert every unit.parentEventId exists in regulatoryEvents, every workflowId resolves, every event date overlaps its sprint window, formStates cover the requiredForms.

**Per-sprint package benefits**: Smaller bundles, focused UAT scenarios, easy regeneration from real data + V3_ExecutionUnitsSeed for a target window.

**Additional supporting files** (minimal):
- `V3_CES_SeedData.ts` updates: make units reference real event IDs (e.g. map 'evt-gb-q2-2026' → 'governing_body_meeting-20260514-01'); add sprintId compat notes.
- New `scripts/generateV3SprintSeed.ts` (or extend existing) to extract May-slice events + realistic form/step states + linked units from live data for reproducibility.
- Alignment verifier (extend scripts/verifyAlignment.ts) that checks seed graph (event refs, workflow, sprint overlap, obligation sources).

---

## 5. Concrete Recommendations & Next Steps

1. **Immediate**: Curate 8-12 real May 2026 events (from regulatoryEvents.ts lines ~412+) into `V3_RegulatoryEventsSprintSlice` (include governing_body, qapi, claims, episode, compliance_report, system_activity + 1-2 drills/HR for variety). Ensure dates overlap V3 windows. Fix V3 units to point at them (e.g. ceu-gb-... → parentEventId: 'governing_body_meeting-20260514-01').

2. **State seeding**: Create 1-2 formStates + stepStates per event (matching requiredForms/processFlow) so dataflow produces 3-6 ExecutionUnits + signer tasks per event. Enough for board columns + projections to be non-empty.

3. **Sprint unification**: Decide canonical (recommend PM 14d + SprintWindow everywhere for PM/CES overlap). Update V3_SprintContextSeed to include `pmWindow` + provide `regulatoryEventOverlapsSprint` shim. Or dual-seed both styles.

4. **Workflow linkage**: For units with workflow, either (a) add `workflowId` from real WORKFLOWS (e.g. 'QA-WF-03' for QAPI) or (b) extend seed events with `workflowId` field so eventWorkflowAlignment + adapters fire.

5. **Injection layer**: Add `seedComplianceExecution( fullSeed )` helper + Zustand devtools / middleware override for regulatoryExecutionStore + autogenStore. Wire into V3StagingApp + a "Live Preview with Full Seed" toggle.

6. **Verification**: Add runtime asserts + a test that `useComplianceExecution({mode:'sprint', window: V3 active})` + `useProjectedTasks('sprint')` both return >= N items when full seed active.

7. **Maintainability**: Treat the May 2026 slice + state as the "golden" V3 live-projection dataset. Regenerate quarterly or on major data changes via script. Document in Builder/Compliance-Execution-Sprints/PM-Data-Model.md + V3 seeding plans.

8. **Scope control**: FullSeed supports the scope modes (sprint/month/all) so calendar (full) and board (sprint) both work.

This minimum augmentation makes V3 seeds a **first-class live data source** rather than a parallel toy. Board, dashboard (KPIs from events + metrics), calendar (tiles + process), My Tasks (projections), evidence panels, etc. will all render rich realistic content without demo fallbacks or empty states.

**Cross-Agent Dependencies**:
- Agent 07 (Sprint Context): incorporate PM windows + overlap tests here.
- Agent 03 (Workflow Units): align V3 workflow refs.
- Agent 12 (Seed Architecture): export the FullSeed bundle + injector API.
- Agent 17 (Cross-Surface): validate injection works in both staging + production components.

**Risk if not addressed**: Seeding remains "V3 units only" → live surfaces stay empty or toy when flag flipped → UAT / Veil integration blocked.

---

## 6. Files to Modify / Create (Targeted)

- **Extend/Create**: `src/policy/ces/data/V3_CES_FullSeed.ts` (new primary) or append to V3_CES_SeedData.ts
- **Update**: `src/policy/ces/data/V3_CES_SeedData.ts` (link units to real events; export helpers)
- **Update consumers** (guarded by dev flag): `complianceExecutionStore.ts`, `taskProjection.ts`, `regulatoryExecutionStore.ts`, `V3StagingApp.tsx`, `SprintExecutionBoard.tsx`
- **Docs**: Builder/Compliance-Execution-Sprints/Documentation/02-Architecture-and-Data-Model.md, PM-Data-Model.md (note dual sprint + seed injection)
- **Script** (nice-to-have): `scripts/v3-sprint-seed-extractor.ts`
- **Report location**: This file (Agent_05_...) in Seeding-Live-Staging-Alignment-2026-05/

**Status**: Analysis complete. Ready for Agent 12 architecture + implementation of injector + real-ID remapping of units.

---

*This report ensures the supporting data requirements close the live-projection gap identified in the 30-Agent V3 Seeding Blueprint (Tier 1 Agent 05 scope + supporting for 07/08/09). All surfaces will have meaningful data.*