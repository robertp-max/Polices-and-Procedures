# 01 — eCIgn Form Submission Architecture

## Purpose
Define the system topology that makes **eCIgn the only controlled path** for form submission, signature, approval, evidence generation, and audit-trail creation in CES.

## Architecture (layers)
```
+------------------------------------------------------------+
|  PM Views (projection, read-mostly)                        |
|  EventView · MyTasks · Kanban · Gantt · SprintBoard        |
+------------------------------------------------------------+
|  Canonical Task Projector  (single Task[] for all views)   |
|     uses CES truth + eCIgn packet status + PM overlay      |
+------------------------------------------------------------+
|  CES (source of truth)                                     |
|  regulatoryExecutionStore · complianceExecutionStore       |
|  events · steps · required forms · validation · evidence   |
+------------------------------------------------------------+
|  eCIgn (controlled submission engine)                      |
|  packet lifecycle · disclosure · identity · review ·       |
|  signature · attestation · lock · evidence emit            |
+------------------------------------------------------------+
|  Evidence + Audit (append-only, AWS S3 + DynamoDB)         |
|  /api/esign/complete · hash-chained audit log              |
+------------------------------------------------------------+
```

## Components (existing — preserved, do not rebuild)
- Frontend signing: [src/policy/components/FormSigningWorkspace.tsx](../../src/policy/components/FormSigningWorkspace.tsx), [FormSignatureFlow.tsx](../../src/policy/components/FormSignatureFlow.tsx), [FormViewer.tsx](../../src/policy/components/FormViewer.tsx).
- eCIgn API client: [src/policy/ecign/api.ts](../../src/policy/ecign/api.ts), [hhcEvidence.ts](../../src/policy/ecign/hhcEvidence.ts).
- Backend engine: [server/ecign/](../../server/ecign/) (`store.ts`, `stateMachine.ts`, `compliance.ts`, `pdf.ts`, `hashChain.ts`, `integrity.ts`, `disclosures.ts`, `networkMetadata.ts`).
- Routes: [server/routes/ecign.ts](../../server/routes/ecign.ts), [server/routes/audit.ts](../../server/routes/audit.ts).
- CES: [src/policy/stores/regulatoryExecutionStore.ts](../../src/policy/stores/regulatoryExecutionStore.ts), [src/policy/compliance-execution/](../../src/policy/compliance-execution/).

## New components (introduced by this initiative)
- `src/policy/pm/ecignStatusMap.ts` — single source for status mapping (eCIgn ↔ CES ↔ PM).
- `src/policy/pm/weekendRule.ts` — schedule guard.
- `src/policy/pm/taskProjection.ts` — canonical Task projector.
- `src/policy/pm/pmOverlayStore.ts` — additive overlay (assignments, sprint, points; no compliance writes).
- `src/policy/components/pm/TaskDetailRightPanel.tsx` — unified panel reused across all PM views.

## Data flow (read)
1. CES emits events/steps/forms.
2. eCIgn emits packet state for required forms.
3. Projector merges → `Task[]` keyed by **stable** `task_id` (see [05](05-eCIgn-Form-Status-Model.md), [PM-Data-Model](../Compliance-Execution-Sprints/PM-Data-Model.md)).
4. Views render the same task objects.

## Data flow (write)
1. UI action on a form-submission task → routes into eCIgn packet (open form, sign, approve, return, lock).
2. On `signed_locked` → `evaluateOnLock()` triggers compliance rule → emits evidence to AWS via `recordEsignCompletion()`.
3. CES validation re-runs → form/step/event status recomputed.
4. Projector re-emits → all views update.
5. PM never writes compliance state.

## Backend contract impact
- **No breaking changes.** Additive endpoints only:
  - `POST /api/compliance/transitions` (already exists for state machine; ensure called on every lock — see [13](13-eCIgn-Failure-Modes-and-Controls.md) C-1).
  - PM overlay endpoints are out of scope until PM phase 1 lands; overlay is local Zustand store for now.

## UI behavior
- "Submit" / "Sign" / "Approve" / "Return for correction" buttons exist **only** inside the eCIgn workspace and the Task Detail Right Panel — both routes call the same API client.
- No PM view exposes a "Mark Done" control for source = `ces` tasks.
- Weekend scheduling triggers a confirmation modal with required reason (audit-logged).

## Risks
| # | Risk | Mitigation |
|---|---|---|
| A1 | Parallel "submit" path appears in a future feature | Lint check + code review checklist; submit handlers must call `ecignApi` |
| A2 | Status drift between CES form status and eCIgn packet | Single mapping module ([05](05-eCIgn-Form-Status-Model.md)); reconciler on packet state change |
| A3 | Evidence not linked to event/policy | Pre-lock guard ensures `event_id` populated; see [11](11-eCIgn-Integration-with-Evidence-Storage.md) |
| A4 | PM marks done a CES task | Right Panel + Kanban drag rules disallow; selectors filter compliance KPI by `source='ces'` validated |

## Acceptance criteria
- All form submit handlers route through `ecignApi`.
- A single status-mapping module governs CES ↔ eCIgn ↔ PM.
- Canonical Task projector exists; all views consume it.
- TaskDetailRightPanel exists and is usable from any PM view.
- Weekend rule helper exists and is enforced for compliance tasks.

## Verification checklist
- [ ] No `formStatus = 'complete'` write outside the eCIgn lock pathway.
- [ ] `ecignStatusMap` is the only place that maps packet → CES → PM status.
- [ ] `taskProjection` is the only place that constructs PM Task objects.
- [ ] `TaskDetailRightPanel` is the only component used to display task detail in PM views.
- [ ] Weekend scheduling without override is rejected and audit-logged.
