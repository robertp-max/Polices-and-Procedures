# Phase 0 + Phase 1 Evidence Implementation Report

## Scope implemented

Implemented Phase 0 + Phase 1 stabilization for evidence chain-of-custody in demo mode and safe backend fallback mode, without folder reorganization or generated-file edits.

## Files changed

- `src/policy/evidence/evidenceModel.ts`
- `src/policy/stores/regulatoryExecutionStore.ts`
- `src/policy/compliance-execution/useEventExecutionDataflow.ts`
- `src/policy/services/complianceExecutionApi.ts`
- `src/policy/components/regulatory/EvidencePanel.tsx`
- `src/policy/components/regulatory/WorkflowDrawer.tsx`
- `src/policy/components/regulatory/EventWorkspace.tsx`
- `src/policy/pages/MobileIncidentExecutionPage.tsx`
- `src/policy/pages/EvidenceCenterPage.tsx`
- `scripts/checkEvidencePhase01.ts`
- `package.json`

## Evidence model chosen

- Canonical evidence status/type module introduced in `src/policy/evidence/evidenceModel.ts`.
- `EvidenceDoc.status` now uses canonical statuses, and includes lifecycle metadata (`version`, `policyId`, lock/supersede fields, optional local file data URL).
- Legacy persisted evidence statuses are migrated to canonical values through Zustand persist migration (`version: 2`).

## Statuses implemented

Canonical dictionary implemented:

- `PENDING_UPLOAD`
- `UPLOADED`
- `VALIDATING`
- `VALIDATED`
- `REJECTED`
- `PROMOTED`
- `EVIDENCE_LOCKED`
- `SUPERSEDED`
- `EXPORTED`
- `RETAINED`

## Validations implemented

- Strict pre-upload validation for:
  - required `policy_id`
  - required `workflow_id`
  - required `event_id`
  - event existence check
  - `form_id` when form binding is required
  - `task_id` when task binding is required
  - orphan evidence rejection (must bind to form and/or task)
- Validation failures emit user-facing errors and normalized `VALIDATION_FAILED` audit events.

## Runtime mode and backend fallback

- Added explicit evidence mode handling (`DEMO_LOCAL`, `BACKEND_LIVE`) in Evidence Center.
- If backend evidence endpoints fail, UI falls back cleanly to demo local mode with a professional message.
- Development-only console warnings are emitted for backend unavailability/fallback.
- `complianceExecutionApi` now safely returns local client when remote mode is disabled/unavailable.

## Local immutable behavior

- Locked evidence cannot be deleted.
- Delete attempt on immutable evidence emits `ACCESS_DENIED` audit entry.
- Supersede path creates a new record/version and marks prior locked evidence `SUPERSEDED`.
- Locked and superseded rows remain visible in evidence records.

## Audit event normalization

Evidence paths now emit normalized event names:

- `UPLOAD_INITIATED`
- `FILE_UPLOADED`
- `FILE_VALIDATED`
- `FILE_REJECTED`
- `EVIDENCE_PROMOTED`
- `EVIDENCE_LOCKED`
- `EVIDENCE_SUPERSEDED`
- `DOWNLOAD_URL_CREATED`
- `EXPORT_CREATED` (status dictionary support; backend export endpoint remains target)
- `VALIDATION_FAILED`
- `ACCESS_DENIED`

## Evidence Center updates

- Explicit mode banner and no cloud-immutability claims in demo mode.
- Added policy/workflow/event/form/task-aware filtering.
- Added strict upload validation and professional user error messages.
- Prevents duplicate locked-row collisions by superseding prior locked row when same bound artifact is re-uploaded.
- Demo download now works when local file bytes are available; otherwise shows accurate reason.
- Added ID links to viewer routes (policy/workflow/event/form/task) in new tab.
- Empty state exported for automated rendering check.

## Tests/checks run

Command:

- `npm run check:evidence-phase01`

Automated checks passed:

- valid triplet upload
- missing `policy_id` rejected
- invalid `event_id` rejected
- required form binding validation
- locked evidence cannot be deleted
- supersede creates new version
- audit log increments on status transitions
- backend-disabled mode does not crash
- Evidence Center empty state renders

## Known remaining gaps

- Backend `/api/compliance-execution` remains not mounted; fallback is implemented but live path is still environment-dependent.
- Evidence Center still uses its own demo local storage namespace for page-level evidence simulation and does not yet fully converge onto a single persisted source with `regulatoryExecutionStore`.
- Live backend endpoint contracts are still partially target behavior (upload validate/promote lifecycle depends on deployed services).
- Export workflow normalization (`EXPORT_CREATED`) is prepared in model/audit vocabulary but full backend export implementation remains future-phase.

## Next recommended phase

Proceed to **Phase 2 — Event/task/form binding enforcement**:

- enforce required form/task evidence gates before certification/close across all execution surfaces,
- complete unification so Evidence Center and event execution consume one local evidence source in demo mode,
- add integration checks for required-form rollup and task-level evidence completeness.
