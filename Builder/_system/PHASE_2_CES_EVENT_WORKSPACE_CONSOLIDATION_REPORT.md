# Phase 2 CES Event Workspace Consolidation + Certification Gates Report

## Files changed

- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- `src/policy/stores/regulatoryExecutionStore.ts`
- `src/policy/compliance-execution/useEventExecutionDataflow.ts`
- `src/policy/evidence/cesEvidenceHierarchy.ts`
- `scripts/checkEvidencePhase2.ts`
- `package.json`

## Task consolidation behavior

- Consolidated primary execution actions under the `Tasks` tab in `WorkflowExecutionPanel`.
- Each task now supports expandable inline execution requirements and task-scoped actions.
- Requirement rows expose status, weight, completion percent, linked artifacts, and audit links.
- Requirement action flows now route through task context for:
  - form open/generate
  - evidence upload/view package
  - signature request
  - task/package certification attempt
  - package lock status action
  - audit trail navigation
- Completion gate enforcement added via store methods:
  - `evaluateTaskCertificationGate(eventId, taskId)`
  - `attemptCompleteTask(eventId, taskId)`

## Tabs converted to summary/alternate views

- `Required Forms` tab is now a summary surface with explicit messaging:
  - "Forms are completed from the Tasks tab so completion, evidence, signatures, and audit trail remain linked."
- `Evidence` tab is now a summary surface with explicit messaging:
  - "Evidence is uploaded from the linked task requirement so it remains tied to the correct task/form/workflow."
- `Approvals` tab is now a summary surface with explicit messaging:
  - "Signature requests are initiated from linked task requirements in the Tasks tab."
- Summary tabs retain read-only visibility and link operators back to task-linked execution context.

## Certification gates implemented

- Task completion can no longer bypass requirement gates.
- `attemptCompleteTask` blocks completion when required form, supporting evidence, signature, or package readiness requirements are missing.
- Blocked task completion returns the required blocker message:
  - "Cannot complete this task yet. Complete the required form, supporting evidence, and signature requirements first."
- When requirements pass, task completion advances through valid status transitions and appends certification audit events.
- Event drawer readiness scoring now derives from the same task requirement projection model used by Phase 1.5 hierarchy calculations (via `buildCesTaskRequirements`), preserving operational/audit separation.

## Audit events added

Added/normalized task-level audit events (without removing existing audit events):

- `FORM_INSTANCE_CREATED`
- `SUPPORTING_EVIDENCE_UPLOADED`
- `SIGNATURE_REQUESTED`
- `SIGNATURE_COMPLETED`
- `REQUIREMENT_COMPLETED`
- `TASK_CERTIFIED`
- `TASK_LOCKED`
- `TASK_COMPLETION_BLOCKED`

Implementation notes:

- Added `appendTaskAuditEvent(...)` in `regulatoryExecutionStore` to append normalized event actions into `taskAuditByEventId`.
- Existing historical events (e.g. `task.update`, `form.generate_instance`, evidence canonical lifecycle events) remain intact.

## Checks run

- `npm run check:evidence-phase2`
  - PASS: task cannot complete when required form missing
  - PASS: task cannot complete when supporting evidence/signature missing
  - PASS: task can complete/certify after all requirements complete
  - PASS: audit event created when task completion is blocked
  - PASS: Required Forms tab links back to task-first execution
  - PASS: Evidence tab uses task-linked grouping/messaging
  - PASS: Approvals tab links signature flow back to task context
  - PASS: event drawer readiness score remains task-requirement derived and bounded
- `npm run check:evidence-phase01` (regression)
  - PASS
- `npm run check:evidence-phase15` (regression)
  - PASS

## Remaining gaps

- Task requirement rows currently use compact task-level actions and link-outs; deeper in-row inline artifact viewers can be added in a later phase.
- `TASK_LOCKED` currently records lock action availability/status at task requirement flow level; full package-lock workflow orchestration can be expanded if backend lock semantics are introduced.
- Event-level "valid waiver" handling for certification gates is not yet formalized in this phase.

## Recommended Phase 3

Proceed with **Phase 3: audit packet convergence + backend certification handshake hardening**:

- persist requirement-level certification snapshots per task for longitudinal audit deltas,
- add explicit waiver model and waiver audit signatures,
- add backend-ready task/package lock/certification endpoint integration with immutable receipt IDs,
- add workspace-to-Evidence Center deep-link parity tests and route-level UX checks.
