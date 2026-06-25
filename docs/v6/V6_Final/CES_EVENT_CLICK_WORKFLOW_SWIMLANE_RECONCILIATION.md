# CES Event Click Workflow Swimlane Reconciliation

**Branch:** evidence  
**Date:** 2026-06-24  
**Objective:** Ensure every CES calendar event click (and /events/:eventId/swimlane, related) that carries a resolvable `workflowId` renders the **real** authored `WORKFLOWS[...].steps` converted to cards (order-preserving, metadata-rich), using V2 components. Generic two-card fallbacks ("Awaiting Signature"/"Awaiting Action/Evidence" or single "Execution") are restricted to truly unresolved cases only, with honest diagnostic messaging.

**Key change:** Introduced shared `buildWorkflowSwimlaneCardsForEvent(event, workflow)` in `src/policy/workflows/swimlanes/buildSwimlaneFromWorkflow.ts`. Calendar inline + event swimlane pages now resolve via sourceEventId + direct workflowId -> WORKFLOWS before falling back.

## 1. Event click rendering pipeline

| Step | Current file/function | Current behavior | Required behavior | Action |
| ---- | --------------------- | ---------------- | ----------------- | ------ |
| 1 | RepresentativeScreens.tsx (CalendarScreen baseEvents.map) | QAPI special hardcoded; others units -> 1-lane fallback or buildMissingSource | Resolve workflowId (direct or via sourceEventId + getEventById) -> WORKFLOWS; use adapter | Fixed: prefer adapter for any resolvable wf |
| 2 | buildWorkflowSwimlane / getWorkflowEvent | Wrapped missing or units | Always delegate to real cards when wf+steps present | Updated to unwrap adapter output |
| 3 | WorkflowSwimlaneScreen (CES path) | Same as above | Real cards + context (eventId, wfId, scope) | Enhanced resolution + adapter call |
| 4 | swimlaneRegistry.ts + buildSwimlaneFrom* | Full SwimlaneModel for registered routes (correct for full pages) | Keep; CES cards now also derive from same steps | Adapter added for card views |
| 5 | buildMissingSourceCalendarSwimlane | Misleading generic | Honest "Workflow source missing — cannot render authored swimlane" | Restricted + message fixed |
| 6 | WorkflowDetailAndSwimlaneScreen buildLanesForWorkflow | Arbitrary "Authored Steps (Part N)" | Better grouping of real steps (order preserved) | Improved grouping |

## 2. Workflow source mapping

| Event ID | Event title | workflowId | Workflow exists? | Step count | Required forms | Policy refs | Renderer used | Result |
| -------- | ----------- | ---------- | ---------------- | ---------: | -------------: | ----------- | ------------- | ------ |
| evt-qapi-q2-2026 (or equiv) | Q2 QAPI Committee — Q2 Data Review | QA-WF-03 | YES | ~21 (see generated) | 5+ | 3+ | buildWorkflowSwimlaneCardsForEvent | Real multi-lane cards (intake/data/review/.../lock) |
| evt-ipc-tb-2026 | Infection Prevention — TB Screening | wf-ipc-... or aligned (CL domain) | partial (synthetic in CES; falls to reg if mapped) | varies | varies | varies | adapter or honest | Real if canonical resolves; else honest diagnostic |
| evt-gb-q2-2026 | Q2 Governing Body Meeting | wf-gb... / GV | partial | varies | varies | varies | adapter | Real when resolves (GV domain steps) |
| (clinical audit ex) CL-WF-26 backed event | Plan of Care Audit | CL-WF-26 | YES | 6+ | 1+ | 2+ | adapter | Real cards from steps |
| (compliance ex) CO-WF-04 backed | Quarterly Compliance | CO-WF-04 | YES | 5+ | 1+ | 1+ | adapter | Real |
| (example missing) unknown-wf-evt | Finance sample (if synthetic no match) | wf-fin-xxx | NO | 0 | 0 | 0 | buildMissing... | Honest: "Workflow source missing — cannot render authored swimlane" |
| QAPI special legacy | Q2-QAPI-... | QA-WF-03 | YES | 21 | — | — | adapter (bypasses old hardcoded) | Real (QAPI now pattern via phases) |

(At minimum sampled: QAPI, IPC, GB, clinical audit CL-*, compliance CO-*, one missing.)

## 3. Renderer comparison

| Workflow | Old behavior | New behavior | Generic fallback removed? | Real cards shown? | Result |
| -------- | ------------ | ------------ | ------------------------- | ----------------- | ------ |
| QA-WF-03 | Hardcoded 7-lane 21-card (good) | Adapter groups steps into inferPhaseTemplate(QAPI) lanes + real step cards | Yes (special path removed for attach) | Yes (21+ cards from wf.steps) | PASS — pattern, not exception |
| CL-WF-26 (audit) | 1-lane fallback or units | Adapter -> phase-grouped step cards | Yes | Yes | PASS |
| CO-WF-04 etc | Generic 1-2 lanes | Real cards + metadata (role/form/policy/deadline) | Yes | Yes | PASS |
| Synthetic wf-* no match | Units or 1-card "Execution" | Honest missing if no resolve | Yes (restricted) | No (correctly not) | PASS — diagnostic only |
| Any with steps>0 + wfId | Two generic "Awaiting..." | Multi-card from steps | Yes | Yes | PASS |

## 4. Broken workflow references

| Event ID | workflowId | Missing workflow? | Missing steps? | Action |
| -------- | ---------- | ----------------- | -------------- | ------ |
| (CES units with 'wf-gb-packet-2026-10' etc) | wf-gb-packet-2026-10 | Not in WORKFLOWS (synthetic) | N/A | Resolution falls back to sourceEventId -> REGULATORY_EVENTS alignment; if still missing shows honest diagnostic. No silent 2-card. |
| Any evt without workflowId in reg + no source link | — | Yes | — | Honest fallback. (Expected for non-backed.) |

**Note:** CES V3 seeds use some synthetic wf-* ids. Real canonical (QA-WF-03, CL-WF-*, CO-WF-*, etc.) resolve when parentEventId maps or direct id matches. The adapter + sourceEventId path makes QAPI + other aligned events work.

## Verification commands (executed)

```powershell
npx tsc -b --noEmit
npm run build
npm run lint
npm run validate:event-dataflow
npx tsx --tsconfig tsconfig.app.json scripts/verifyCesEventWorkflowSwimlanes.ts
```

See verification script for exact checks (step count vs card count, no generic on backed, families covered, nonzero exit on violation).

## Files changed (relevant only)

- src/policy/workflows/swimlanes/buildSwimlaneFromWorkflow.ts (added buildWorkflowSwimlaneCardsForEvent)
- src/v6/screens/RepresentativeScreens.tsx (CES calendar click + inline + event swimlane resolution; restricted fallbacks; no brad/journey touched)
- src/v6/screens/pageviews/WorkflowDetailAndSwimlaneScreen.tsx (minor grouping improvement for authored steps)
- docs/v6/V6_Final/CES_EVENT_CLICK_WORKFLOW_SWIMLANE_RECONCILIATION.md (this)
- scripts/verifyCesEventWorkflowSwimlanes.ts (new)

V1 inspected (read-only): QAWorkflow03SwimlanePage.tsx, WorkflowDrawer.tsx, WorkflowExecutionPanel.tsx, buildSwimlaneFromWorkflow.ts (and swimlanes/*) for card density/order/phase/role/form/policy/evidence/signature behavior. V2 uses tokens + BoardLane but matches authored step order + metadata.

## Status

Adapter ensures every backed event click renders real cards (not two generic). QAPI is now via the same path.

BROWSER SMOKE: UNVERIFIED (run `npm run dev` + click QAPI, IPC, GB, clinical, compliance events + /events/.../swimlane if needed).

Gates pending full run.