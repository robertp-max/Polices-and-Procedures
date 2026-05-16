# CES Operational Stabilization Report

Date: 2026-05-07
Mode: LOCKED - STABILIZATION ONLY

## 1) Root cause of QA-FM-021 not rendering

- `QA-FM-021` was referenced by CES task requirements and workflow templates, but the canonical forms source (`FORMS_DATASET`) did not include that form ID.
- `FormViewer` correctly returned "Form Not Found" when a form ID is absent from `FORMS_DATASET`, so task-linked routes to `/forms/QA-FM-021?...` failed to render body content.
- A secondary mismatch existed in URL parsing: task flow passed `form_instance_id`, while `FormViewer` only read `instance`, causing form-instance continuity breaks.

## 2) Files changed

- `src/policy/data/formsLibraryDataset.ts`
- `src/policy/components/FormViewer.tsx`
- `src/policy/compliance-execution/types.ts`
- `src/policy/stores/regulatoryExecutionStore.ts`
- `src/policy/compliance-execution/useEventExecutionDataflow.ts`
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- `src/policy/pages/EvidenceCenterPage.tsx`
- `src/policy/audit/auditState.ts`
- `src/policy/audit/workflowInstance.ts`
- `src/policy/pages/AuditModePage.tsx`
- `scripts/checkEvidencePhase235.ts`

## 3) QA-FM-021 handling (added vs remapped)

- `QA-FM-021` was added to the canonical forms library source (`FORMS_DATASET`) rather than remapped.
- Additional referenced QA forms (`QA-FM-020` through `QA-FM-027`) were added to remove the same class of task->form-template resolution failures.
- `validateEvent(...)` now treats missing form templates as validation blockers so a required form cannot silently pass when template metadata is absent.

## 4) Form instance model implemented

- Stable `form_instance_id` format now uses:
  - `{event_id}-{form_id}-{sequence}`
  - Example: `EVT-QA-QAPIQUARTERL-20260507-008-QA-FM-021-001`
- `getOrCreateFormInstance(...)` remains idempotent and now matches task/requirement context strictly:
  - same event/task/requirement/form => reuses same instance
  - repeat clicks do not create duplicates
- `FORM_INSTANCE_CREATED` audit action is written on creation.
- `FORM_COMPLETED` audit action is written on completion status transition.
- `FormViewer` now accepts `form_instance_id` from URL and from embedded prop wiring so inline and new-tab flows share the same instance key.

## 5) Evidence persistence path fix

- Evidence Center `DEMO_LOCAL` flow now writes to canonical `regulatoryExecutionStore.uploadEvidence(...)` instead of an isolated `evidence-center-demo-store-v1`.
- Success message is only shown after persistence verification confirms the uploaded `evidence_id` is queryable from canonical store aliases.
- Evidence bindings are preserved on upload:
  - `event_id`
  - `task_id`
  - `form_id`
  - `linkedFormInstanceId` (`form_instance_id`) when available
  - `policy_id`
  - `workflow_id`
- Evidence Center loading now reads canonical alias keys (source + instance IDs) so ledger and hierarchy panels reflect the same state as task/event flows.

## 6) Audit Mode synchronization fix

- Audit and workflow-instance projections now consume alias-resolved event state for:
  - evidence
  - approvals
  - notes
  - certification
  - completion
- Audit checklist evidence/approval counts now aggregate across source + instance event aliases.
- Workflow-instance audit trail now merges execution audit rows (including `FORM_INSTANCE_CREATED`, `FORM_COMPLETED`, `FILE_UPLOADED`, `FILE_VALIDATED`, `EVIDENCE_PROMOTED`, `EVIDENCE_LOCKED`) with enforcement audit entries.
- Audit Mode timeline and audit-trail label maps were extended to render these actions explicitly.

## 7) UI stabilization notes

- `FormViewer` now enables shell `detailMode` only for standalone form pages.
- Embedded form rendering inside the Complete Form drawer no longer forces shell chrome into standalone detail mode, preventing page blanking/collision side effects while drawer is open.

## 8) Validation/reporting of missing template links

- Tasks tab now scans active CES tasks for referenced form IDs that are missing from canonical forms and displays a visible "Missing form templates detected" report block with task/form pairs.
- Event validation now blocks completion when required form templates are missing from `FORMS_DATASET`.

## 9) Tests performed

- Ran: `node scripts/checkEvidencePhase235.ts` (after updating expected form-instance ID pattern)
  - Result: PASS
- Verified code paths in updated modules for:
  - task drawer -> form template resolution
  - task drawer -> stable form_instance_id creation/reopen
  - evidence upload -> canonical store write path
  - audit/timeline views -> canonical alias reads

## 10) Remaining known gaps

- Backend-live (`BACKEND_LIVE`) evidence API mode still depends on upstream API contract behavior for list/index freshness; this stabilization explicitly fixed canonical local/store-mode consistency.
- Existing historical records persisted under mixed legacy keys remain supported via alias reads; no destructive migration was performed in stabilization mode.

## 11) Final State Propagation Fix (2026-05-07)

Scope constrained to two propagation/display defects:

1. Form completion did not propagate into task/event/audit rollups.
2. Uploaded evidence file/image was not visible/reviewable despite audit events.

### 11.1 Form completion propagation updates

- `Mark as Complete` now updates both:
  - template key (`form_id`) and
  - matching event-required form keys (`requiredForms[].id`) in canonical store.
- `FORM_COMPLETED` audit `after` payload now carries:
  - `formId`
  - `formInstanceId`
  - `requiredFormIds`
  - `requirementId`
- Task requirement projector now carries `form_instance_id` and computes FORM completion from canonical instance state (`COMPLETED`/`LOCKED`/`SIGNED`) instead of raw task status only.
- Task form links now reopen with `form_instance_id` when present, so the completed instance is directly viewable/reopenable from the task row.
- Required-form satisfaction now requires completed instance state (not merely instance existence), preventing false-positive completion.

### 11.2 Evidence review visibility updates

- Inline task evidence upload now persists `localDataUrl` (demo-local object reference) into canonical evidence record.
- Event drawer task row now shows latest evidence and exposes:
  - `Open`
  - `Download`
- Event drawer evidence-by-task section now shows evidence status and exposes:
  - `Open`
  - `Download`
- Audit Mode Evidence tab now includes per-file review actions:
  - `Open`
  - `Download`
- Evidence Center file ledger/hierarchy continue reading canonical store and now reflect inline-uploaded artifacts with reviewable local object refs in demo-local mode.

### 11.3 Queue/state visibility behavior

- Immediately locked evidence shows as `EVIDENCE_LOCKED` and is reviewable where local object ref exists.
- If a non-locked state is used upstream later, the same surfaces render the status row and continue to show the artifact metadata.

### 11.4 Validation for this propagation pass

- Lint checks: no new linter errors in modified propagation files.
- Smoke script run: `node scripts/smokeAchcSurveyor.mjs`
  - unrelated failures remain in print/download checks for ACHC surveyor page
  - not in scope of this propagation-only fix
