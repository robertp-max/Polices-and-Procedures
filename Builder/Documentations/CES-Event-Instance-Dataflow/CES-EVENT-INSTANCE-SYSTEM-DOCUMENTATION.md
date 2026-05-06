# CES Event Instance Dataflow — Complete System Documentation

**Version:** Application codebase (as implemented)  
**Scope:** Client/demo execution engine with compliance-grade patterns; AWS persistence described separately in `Builder/Documentations/AWS-CES/`.

---

## 1. Executive summary

The **Event Instance Dataflow** connects three layers:

1. **Canonical parent model** — `RegulatoryEvent` (seed data: calendar-facing regulatory obligations with process flow, required forms, approvals, policy references, workflow id).
2. **Operational state** — `regulatoryExecutionStore` (Zustand, persisted locally in demo): step/form/minutes/evidence/approvals, **EventInstance** metadata, **task overrides**, generated form instances, **append-only execution audit** with hash-chain-ready fields.
3. **Read / projection layer** — `buildEventExecutionDataflow` / `useEventExecutionDataflow` produces **`EventExecutionDataflow`**, consumed by the event drawer (`WorkflowExecutionPanel`), CES (`useComplianceExecution` → `buildEventExecutionDataflow` per event → `MergedExecutionUnit[]`), and other surfaces. **CES does not own a parallel event model**; when regulatory events exist, execution units are derived from the dataflow.

**Design goals achieved:**

- Stable **event instance id** separate from source calendar id where needed.
- Logical **folder paths** per instance (and S3-aligned evidence object path pattern).
- **Editable task list** merged from derived defaults + store overrides (soft delete, restore, generate).
- **Required forms** surfaced with paths and linkage to form instances.
- **Evidence** bound to `eventId` + `taskId` with integrity fields (`checksum`, `fileSize`, `mimeType`, `uploadedAt`).
- **Certification** locks instance, blocks mutations (with admin override paths where implemented), stores **immutable certification snapshot**.
- **Audit** events are structured for append-only, per-event hash chaining.

---

## 2. Sources of truth (non-negotiable)

| Concern | Source of truth | Notes |
|--------|-----------------|-------|
| Event definition (what must happen) | `RegulatoryEvent` in `src/policy/data/regulatoryEvents` | Not duplicated as a second event catalog. |
| Per-instance execution state | `regulatoryExecutionStore` | Single Zustand store for operational slices. |
| Merged read model for UI/CES | `EventExecutionDataflow` from `useEventExecutionDataflow` | Consumers should prefer this over re-deriving tasks ad hoc. |
| CES board cards | `MergedExecutionUnit` built from dataflow | Traceability: `sourceEventId`, `taskSourceId`, `sourceEvidenceIds`, `folderPath`, `auditReadinessScore`, etc. |

**Anti-patterns:** A second “event store” for CES; hard-deleting required tasks; creating evidence without `taskId`; mutating certified state without guard + audit.

---

## 3. Core type reference (`src/policy/compliance-execution/types.ts`)

### 3.1 `EventInstance`

Represents one **schedulable/executable occurrence** tied to a source regulatory event.

| Field | Purpose |
|-------|---------|
| `eventId` | Stable instance identifier (e.g. `EVT-…`). |
| `sourceEventId` | Parent `RegulatoryEvent.id`. |
| `scheduledDate` | When this occurrence is anchored. |
| `generatedFrom` | `mandated` \| `manual` \| `workflow` \| `user` \| `system`. |
| `status` | Lifecycle: `scheduled` → `in_progress` → `completed` → `certified`; or `cancelled`. |
| `lockState` | `unlocked` \| `locked` \| `certified`. |
| `certificationState` | Optional `certifiedAt`, `certifiedBy`, `certificationId`. |
| `certificationSnapshot` | **Immutable** after certification: tasks, form statuses, evidence ids/task/objectPath/checksum, timestamp. |
| `folderPath` | Root logical path, e.g. `/events/{eventId}`. |
| `createdAt` / `updatedAt` / `createdBy` | Audit-friendly metadata. |

### 3.2 `EventTask`

| Field | Purpose |
|-------|---------|
| `id` | Deterministic from `eventId` + `taskSourceId` where possible (`TASK-…`). |
| `eventId` | Instance id this task belongs to. |
| `taskSourceId` | Stable key for merge (e.g. `processFlow:{stepId}`, `form:{formId}`). |
| `taskSourceType` | `processFlow` \| `requiredForm` \| `approval` \| `minutes` \| `manual` \| `generated`. |
| `isRequired` / `requirementSource` | Compliance enforcement: `policy` \| `workflow` \| `regulation` \| `system`. |
| `workflowId`, `policyIds`, `formIds` | Traceability to workflow, policies, forms. |
| `status` | `not_started` \| `in_progress` \| `blocked` \| `awaiting_signature` \| `completed` \| `cancelled`. |
| `folderPath` | Under instance `tasks/` directory. |
| `isDeleted` / `deletedAt` | Soft delete; recoverable. |
| `blockedReason` / `completionBlockedReason` | UX and gating messaging. |
| `evidenceIds` / `evidenceCount` / `requiredEvidenceSatisfied` / `requiredFormsSatisfied` | **Rollups** computed in dataflow builder (not necessarily persisted per task in store). |

### 3.3 `EventFormInstance`

Generated form artifact for an event: `id`, `eventId`, `formId`, `policyIds`, `workflowId?`, `folderPath`, `createdAt`.

### 3.4 `EventExecutionAuditEvent`

Append-only style record (client calculates hash placeholders for future backend):

- `auditId`, `eventId`, `entityType`, `entityId`, `action`, `actorId`, `actorRole`, `timestamp`, `before`, `after`, `reason`, `recordVersion`, `prevHash`, `currentHash`.

---

## 4. Event instance ID generation (`eventInstanceId.ts`)

**Format:** `EVT-{DOMAIN}-{CATEGORY}-{YYYYMMDD}-{SEQ}`

Examples (conceptual): `EVT-QA-QAPI-20260731-001`, `EVT-GV-BOARD-20260731-001`.

**Rules:**

- **Domain** maps from `RegulatoryEvent.domain` to short codes (e.g. QAPI → `QA`, Governance → `GV`).
- **Category** normalized from `category` / `eventSubType` / `title` (uppercase, alphanumeric slice).
- **Date** from `event.date` as `YYYYMMDD`.
- **Sequence** per `(domain, category, date)` bucket; legacy ids may contribute parsed sequence via `parseSequenceFromLegacyId`.

`buildEventInstanceIndex(REGULATORY_EVENTS)` produces `bySourceEventId: Record<sourceEventId, eventId>` for deterministic default instance ids.

---

## 5. Logical folder layout (`eventFolders.ts`)

For `eventId`, `resolveEventFolder(eventId)` returns:

| Path key | Example pattern |
|----------|-----------------|
| `root` | `/events/{eventId}` |
| `metadata` | `…/metadata.json` |
| `tasksDir` | `…/tasks` |
| `formsRequiredDir` | `…/forms/required` |
| `formsCompletedDir` | `…/forms/completed` |
| `evidenceDir` | `…/evidence` |
| `approvalsDir` | `…/approvals` |
| `auditLog` | `…/audit/audit-log.jsonl` |

Helpers build JSON paths for tasks, forms, approvals, evidence metadata. **`buildS3EvidenceObjectPath`** aligns to:

`evidence/{policyId}/{workflowId}/{eventId}/{evidenceId}/{filename}` (sanitized segments).

---

## 6. Task derivation (`eventTaskAdapter.ts`)

`deriveDefaultEventTasks(event, eventId, options)` builds the **default** task set:

1. **Process flow steps** — One task per step; `taskSourceId = processFlow:{step.id}`; `taskSourceType = processFlow`; inherits `requiredFormIds` as `formIds`; status from step or `stepStatusById`.
2. **Required forms** — If not already covered by a process step’s `requiredFormIds`, add `taskSourceId = form:{formId}`; `source = requiredForm`.
3. **Minutes** — If `event.minutes`, add `taskSourceType = minutes`, `taskSourceId = minutes:{eventId}`, `source = generated`.
4. **Approvals** — Per approval rule: `taskSourceId = approval:{id or targetKind:targetLabel}`; `isRequired` from `approval.required`.

Default tasks are **`isRequired: true`** with `requirementSource` from workflow/regulation/policy as appropriate.

**Task id stability:** `buildDeterministicTaskId(eventId, taskSourceId)` ensures re-derivation does not create duplicate identities when merged by `taskSourceId`.

---

## 7. Operational store (`regulatoryExecutionStore.ts`)

### 7.1 Key slices

- `eventInstancesById`, `eventInstanceIdsBySourceEventId`
- `taskOverridesByEventId`
- `taskAuditByEventId` — `EventExecutionAuditEvent[]` per `eventId`
- `generatedFormInstancesByEventId`
- `evidence[eventId]` — `EvidenceDoc[]` with **mandatory** `taskId`, paths, integrity fields

### 7.2 Representative actions

- **Instance:** `ensureEventInstance`, `createManualEventInstance`, `updateEventInstance`, `cancelEventInstance`, `certifyEventInstance`
- **Tasks:** `createTask`, `updateTask`, `softDeleteTask`, `restoreTask`, `generateTaskFromForm`, `generateTaskFromWorkflowStep`
- **Forms:** `generateFormInstance`, `setFormStatus` (drives satisfaction)
- **Evidence:** `uploadEvidence`, `removeEvidence` (with audit)
- **Certification / completion:** `markEventComplete`, `certifyEventComplete`, `revokeCertification`, `reopenEvent`

Mutations typically:

1. Check **lock/certification** (and optional admin bypass helpers).
2. Apply **state machine** rules for tasks/events where applicable.
3. **Append audit** via hash-chaining helper.
4. Trigger **event state evaluation** (`evaluateAndApplyEventState`) after task/evidence/form-affecting changes.

### 7.3 Evidence model (`EvidenceDoc`)

Required linkage and integrity:

- `eventId`, `taskId`, `policyIds`, `workflowId`, `formIds`, `folderPath`, `objectPath`
- `checksum`, `fileSize`, `mimeType`, `uploadedAt` (+ display `sizeLabel`, `createdAt`, etc.)

Object path pattern in store follows:  
`evidence/{policy}/{workflow}/{eventId}/{evidenceId}/…` with fallbacks `UNASSIGNED-POLICY` / `UNASSIGNED-WORKFLOW` where needed.

### 7.4 Required task enforcement

- Required tasks are not hard-deleted; cancellation and sensitive transitions require **reason** (and/or admin override per implementation).
- Certification is blocked when required tasks/forms/evidence/approvals are not satisfied (see store validation paths referenced by `validate:event-dataflow`).

---

## 8. State machine (`stateMachine.ts`)

**EventInstance transitions:**

- `scheduled` → `in_progress` | `cancelled`
- `in_progress` → `completed` | `cancelled`
- `completed` → `certified`
- `certified` / `cancelled` — terminal

**Task status transitions:**

- `not_started` → `in_progress` | `cancelled`
- `in_progress` → `blocked` | `awaiting_signature` | `completed` | `cancelled`
- `blocked` → `in_progress`
- `awaiting_signature` → `completed`
- `completed` / `cancelled` — terminal from transition map (edits may require reopen flows in store)

`canTransitionEventInstance` / `canTransitionTaskStatus` enforce allowed edges.

---

## 9. Event state evaluator (`eventStateEvaluator.ts`)

`evaluateEventState(input)` inputs: `eventId`, `eventInstance`, `tasks`, `requiredFormsComplete`, `hasApprovals`.

Outputs:

- `blockers` — e.g. incomplete required tasks, forms, approvals
- `nextStatus` — e.g. moves toward `in_progress` / `completed` when gates clear
- `canCertify` — true when `blockers.length === 0` and status path allows certification

This is the **declarative** complement to imperative store updates.

---

## 10. Event execution dataflow (`useEventExecutionDataflow.ts`)

### 10.1 `buildEventExecutionDataflow(event, store)`

Pipeline (simplified):

1. `store.ensureEventInstance(event)` → `EventInstance`
2. Resolve `eventId` and `resolveEventFolder(eventId)`
3. Build `stepStatusById`, `formStatusById`, `approvalsById` from store + event
4. `deriveDefaultEventTasks` + merge **`taskOverridesByEventId[eventId]`** by `taskSourceId` then `taskId`
5. Attach **per-task rollups**: evidence ids/count, `requiredFormsSatisfied`, `requiredEvidenceSatisfied`, `completionBlockedReason`
6. Compute **`auditReadinessScore`** (0–100) from weighted: required tasks completion, required forms completion, evidence presence across tasks, approvals
7. Build **`cesExecutionUnits`**: `MergedExecutionUnit[]` with `sourceEventId`, `taskSourceId`, `sourceEvidenceIds`, `folderPath`, `auditReadinessScore`, `regulatoryRef`, etc.

### 10.2 `EventExecutionDataflow` shape

Exported fields include: `event`, `eventId`, `eventInstance`, `folder`, `policies`, `workflows`, `requiredForms`, `tasks`, `evidence`, `approvals`, `auditReadiness`, `auditReadinessScore`, `cesExecutionUnits`, `auditTrail`, `generatedFormInstances`, `sourceEventId`.

---

## 11. CES integration (`complianceExecutionStore.ts`)

When regulatory events exist:

- For each `RegulatoryEvent`, `buildEventExecutionDataflow(event, store)` runs.
- **`cesExecutionUnits`** from all packages are **flattened** into board `executionUnits` (strict projection path).
- If no regulatory events, onboarding engine units remain fallback (documented in store header comments).

**MergedExecutionUnit** extensions (`complianceExecutionTypes.ts`): `sourceEventId`, `taskSourceId`, `sourceEvidenceIds`, `folderPath`, `auditReadinessScore`, `regulatoryRef`, etc.

---

## 12. UI surfaces

### 12.1 `WorkflowExecutionPanel`

Tabs: **Overview**, **Tasks**, **Required Forms**, **Evidence**, **Approvals**, **Audit Trail**, **Technical Details**.

Header shows **instance `eventId`** and **`folderPath`**, plus **Audit Readiness** percentage from `auditReadinessScore`.

### 12.2 `ExecutionUnitCard` (CES)

Displays execution unit state; surfaces optional **`auditReadinessScore`** on the card when present on the unit object.

### 12.3 Evidence / workflow helpers

- `EvidencePanel` — uploads require task binding and pass policy/workflow/form metadata where applicable.
- `WorkflowDrawer` / `EventWorkspace` — may call `generateTaskFromForm` / `generateTaskFromWorkflowStep` with `adminOverride` where needed so evidence has a task anchor.

---

## 13. API adapter (future / dual mode)

`src/policy/services/complianceExecutionApi.ts`:

- **`demoLocal`** — delegates to `regulatoryExecutionStore` + dataflow selectors.
- **`awsRemote`** — HTTP client to `/api/compliance-execution/...` (backend to be implemented per `Builder/Documentations/AWS-CES/`).

UI continues to consume the **same** dataflow types; only persistence transport changes.

---

## 14. Validation

- **`npm run validate:event-dataflow`** — `scripts/validateEventDataflow.ts`: static + structural checks (ids, folders, taskSourceId, evidence paths, CES projection strings, certification snapshot, audit fields, etc.).
- **`npm run validate:aws-ces-mapping`** — Ensures AWS docs + adapter contract alignment.

---

## 15. Key file map

| Area | Path |
|------|------|
| Types | `src/policy/compliance-execution/types.ts` |
| Folders | `src/policy/compliance-execution/eventFolders.ts` |
| Instance IDs | `src/policy/compliance-execution/eventInstanceId.ts` |
| Task derivation | `src/policy/compliance-execution/eventTaskAdapter.ts` |
| State machine | `src/policy/compliance-execution/stateMachine.ts` |
| State evaluator | `src/policy/compliance-execution/eventStateEvaluator.ts` |
| Dataflow | `src/policy/compliance-execution/useEventExecutionDataflow.ts` |
| CES snapshot | `src/policy/compliance-execution/complianceExecutionStore.ts` |
| Store | `src/policy/stores/regulatoryExecutionStore.ts` |
| Event drawer | `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` |
| CES card | `src/policy/ces/components/board/ExecutionUnitCard.tsx` |
| Dual-mode API | `src/policy/services/complianceExecutionApi.ts` |

---

## 16. Security and compliance posture (client demo)

- Storage is **browser local persistence** unless AWS remote mode is enabled and backed by real APIs.
- **Immutability** is enforced in application logic (certification snapshot, evidence integrity fields); production WORM/Object Lock belongs in AWS design docs.

---

## 17. Extension points

- New task sources: extend `eventTaskAdapter` + types + validation script expectations.
- New CES fields: extend `MergedExecutionUnit` and mapping in `buildEventExecutionDataflow`.
- Backend: implement Lambdas per `AWS_CES_API_CONTRACT.md` and map DTOs 1:1 to types in this document.

## 18. Performance: sprint and month scoping (PM + CES views)

Task-heavy surfaces default to the **current PM sprint** (26 × 14-day calendar starting first Sunday of the year; display ids like `2026:01`). `useComplianceExecution` accepts an optional **scope** (`all` | `month` | `sprint`) so `buildEventExecutionDataflow` runs only for events in the active slice. `useProjectedTasks('sprint' | 'full')` defaults to **`'sprint'`**: it reads `pmViewSprintStore` and projects CES tasks only for regulatory events overlapping the selected sprint. Surfaces that must see the full backlog (dashboard, sprint plan/review, approvals, event lists, mobile execution, notification ticker) pass **`'full'`**.

See **[PERFORMANCE-AND-SPRINT-SCOPING.md](./PERFORMANCE-AND-SPRINT-SCOPING.md)** for file references and UI behavior.
