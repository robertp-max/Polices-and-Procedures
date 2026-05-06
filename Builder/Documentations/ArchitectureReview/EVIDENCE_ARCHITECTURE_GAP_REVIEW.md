# Evidence Architecture Gap Review

Focused architecture review of evidence subsystem.

## 1) Current state (implemented now)

## 1.1 Current evidence data model

- Local execution model:
  - `EvidenceDoc` in `regulatoryExecutionStore.ts` with event/task/policy/workflow/form links.
- Evidence Center model:
  - `EvidenceFile` with cloud-style fields in `EvidenceCenterPage.tsx`.
- Gap:
  - model divergence and status mismatch between these paths.

## 1.2 Current evidence UI

- Event workflow UI:
  - `EvidencePanel` and workflow evidence tabs.
- Evidence Center:
  - dedicated list/filter/upload view with audit section.
- Observed behavior:
  - event panel uses simulated upload UX and toast download;
  - Evidence Center supports richer target lifecycle but defaults to demo-local mode.

## 1.3 Current evidence storage

- Primary implemented persistence:
  - browser localStorage (`reg-execution-v2`, `evidence-center-demo-store-v1`).
- Cloud/object storage:
  - target behavior in contracts/comments; local server implementation not confirmed.

## 1.4 Current evidence API behavior

- Local execution path:
  - no required backend API call for evidence metadata write.
- Target APIs (coded in frontend):
  - upload init/validate/promote/list/download endpoints.
- Local backend:
  - no `/api/compliance-execution` route mount in `server/index.ts`.

## 1.5 Current audit log behavior

- Local execution:
  - append-style chain with hash fields in task audit list.
- Evidence Center:
  - event-local audit entries in demo store.
- Backend:
  - separate audit subsystems in eCIGN and audit-v2.

## 1.6 Current download behavior

- EvidencePanel:
  - no file retrieval, toast only.
- Evidence Center:
  - target presigned GET in live mode; blocked message in demo mode.

## 1.7 Current AWS integration (evidence-specific)

- Frontend has target API base default and endpoint contracts.
- Evidence-related bridge modules are stubbed by default (`LAMBDA_DISABLED = true`).
- Auth AWS stack is implemented separately in `infra/demo-auth-cdk`.

## 1.8 Current relationship to policy/workflow/event/form/task

- Strongest in local execution model (`EvidenceDoc` fields).
- Evidence Center uses policy/workflow/event/form fields and client filters.
- Task binding is present in local model and task rollup tabs.

## 1.9 Current implemented vs displayed-only

- Implemented:
  - local metadata evidence records and event audit chain.
- Displayed/target-only:
  - full cloud upload-validation-promotion lifecycle and presigned downloads.

## 1.10 Missing controls

- Missing/partial fields:
  - validated/promotion/lock timestamps, version, retention, request IDs.
- Missing validation:
  - strict triplet fail-closed rules in all paths.
- Missing immutable lock behavior:
  - event-level lock exists, evidence-row lifecycle lock not unified.
- Missing audit events:
  - canonical evidence event list not consistently emitted across paths.
- Missing survey packet/export behavior:
  - frontend export exists, backend immutable export pipeline not confirmed.
- Missing required-form rollup behavior:
  - partial linkage, but duplicate/unlinked evidence possible.
- Missing task binding behavior:
  - some paths derive task context; empty context can fail silently.
- Missing failure handling:
  - dual-store conflicts and mode-specific behavior not centralized.

---

## 2) Target recommendation set

## 2.1 Target evidence model recommendation

- Define canonical `EvidenceRecord`:
  - ids: `evidence_id`, `event_id`, `policy_id`, `workflow_id`, optional `form_id`, optional `task_id`
  - file metadata: name/type/content-type/size/hash
  - storage metadata: bucket/key/version
  - lifecycle metadata: status + transition timestamps
  - chain metadata: audit event IDs/hash links/request IDs
  - retention/immutability metadata.

## 2.2 Target lifecycle recommendation

1. `UPLOAD_INITIATED`
2. object upload to sandbox raw
3. `FILE_VALIDATED` or `FILE_REJECTED`
4. `EVIDENCE_PROMOTED`
5. `EVIDENCE_LOCKED`
6. `DOWNLOAD_URL_CREATED` events per download issuance
7. export binding events for survey packet inclusion.

## 2.3 Target folder/key hierarchy recommendation

- Adopt requested hierarchy:
  - `sandbox/raw/...`
  - `sandbox/validated/...`
  - `production/evidence/...`
  - `production/forms/...`
  - `production/audit/...`
  - `production/exports/...`
- Ensure metadata always references final immutable key and hash.

## 2.4 Target API endpoint recommendation

- `POST /uploads/init`
- `POST /uploads/{upload_id}/validate`
- `POST /uploads/{upload_id}/promote`
- `GET /events/{event_id}/files`
- `GET /files/{evidence_id}/download`
- `POST /exports/survey-packet`
- optional:
  - `GET /evidence/{id}/audit`
  - `POST /evidence/{id}/supersede`.

## 2.5 Target DynamoDB schema recommendation

- PK/SK suggestion:
  - `PK = EVENT#{event_id}`
  - `SK = EVIDENCE#{evidence_id}`
- GSIs:
  - by `policy_id`,
  - by `workflow_id`,
  - by `form_id`,
  - by `task_id`,
  - by `status`,
  - by `uploaded_by`,
  - by export/survey packet id.

## 2.6 Target audit event list recommendation

- enforce canonical event set:
  - `UPLOAD_INITIATED`
  - `FILE_UPLOADED`
  - `FILE_VALIDATED`
  - `FILE_REJECTED`
  - `EVIDENCE_PROMOTED`
  - `EVIDENCE_LOCKED`
  - `DOWNLOAD_URL_CREATED`
  - `EXPORT_CREATED`
  - `EVIDENCE_SUPERSEDED`
  - `ACCESS_DENIED`
  - `VALIDATION_FAILED`

## 2.7 Target UI behavior recommendation

- show active mode banner (`demo-local` vs `backend-live`) globally in evidence views.
- disable unsupported actions in demo mode with explicit reason.
- unify status labels across all evidence-related pages.
- support click-through from policy/workflow/form/task IDs to detail pages.
- display immutable lock state and supersession history.

## 2.8 Target QA checklist recommendation

- enforce triplet and event existence checks.
- test all lifecycle transitions and rejection paths.
- verify hash and metadata consistency after promote.
- verify lock immutability.
- verify audit event emission completeness.
- verify survey packet includes only metadata-backed evidence.
