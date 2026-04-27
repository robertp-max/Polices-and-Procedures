# eCIgn-Centered Submission — Developer Guide

**Audience:** engineers maintaining the CES, PM, and eCIgn surfaces.
**Status:** authoritative for the modules created in this initiative.
**Cross-refs:** [Builder/eCIgn-Centered-Submission/00-README.md](../../Builder/eCIgn-Centered-Submission/00-README.md), [Builder/Compliance-Execution-Sprints/PM-Panel-Synchronization.md](../../Builder/Compliance-Execution-Sprints/PM-Panel-Synchronization.md).

---

## A1. Architecture overview
- Backend evidence engine: `server/ecign/**` (state machine, hash chain, compliance rules, S3/DynamoDB writes). **Untouched.**
- Backend HTTP routes: `server/routes/ecign.ts`. **Untouched.**
- Frontend eCIgn workspace: `src/policy/components/FormSigningWorkspace.tsx`, `FormSignatureFlow.tsx`, `FormViewer.tsx`. **Untouched.**
- Frontend CES store (compliance source of truth): [src/policy/stores/regulatoryExecutionStore.ts](../../src/policy/stores/regulatoryExecutionStore.ts). **Untouched.**
- New PM layer (this initiative):
  - [src/policy/pm/types.ts](../../src/policy/pm/types.ts) — Task contract.
  - [src/policy/pm/ecignStatusMap.ts](../../src/policy/pm/ecignStatusMap.ts) — single status mapper.
  - [src/policy/pm/weekendRule.ts](../../src/policy/pm/weekendRule.ts) — schedule guard.
  - [src/policy/pm/pmOverlayStore.ts](../../src/policy/pm/pmOverlayStore.ts) — additive overlay (no CES writes).
  - [src/policy/pm/pmOverlayStore.types.ts](../../src/policy/pm/pmOverlayStore.types.ts) — overlay shape.
  - [src/policy/pm/taskProjectionCore.ts](../../src/policy/pm/taskProjectionCore.ts) — pure projector.
  - [src/policy/pm/taskProjection.ts](../../src/policy/pm/taskProjection.ts) — React hooks (`useProjectedTasks`, `useProjectedTaskById`).
  - [src/policy/components/pm/TaskDetailRightPanel.tsx](../../src/policy/components/pm/TaskDetailRightPanel.tsx) — unified Right Panel.
- Verification script: [scripts/verifyEcignFlow.ts](../../scripts/verifyEcignFlow.ts).

## A2. Data model
- `Task = EcignSubmissionTask | NonFormCesTask | PersonalTask` (see [types.ts](../../src/policy/pm/types.ts)).
- `task_id` format:
  - CES: `"{event.id}-{NN}"` (e.g. `qapi_meeting-20260507-08`).
  - Personal: `"personal:{uuid}"`.
- Status layers (all derived from a single `PacketSnapshot`):
  - eCIgn internal — backend state machine.
  - eCIgn UX (`EcignPacketStatus`) — Right Panel chips.
  - CES `FormStatus` — preserved unchanged.
  - PM `PmTaskStatus` — Kanban columns / Sprint board chips.

## A3. Routes / components touched
- New: `src/policy/components/pm/TaskDetailRightPanel.tsx` (mountable from any view; not yet wired into legacy Event/Workflow drawers — Phase B work).
- No backend routes changed.
- No CES UI components changed.

## A4. Stores / services used
- Read-only inputs to projector: `useRegulatoryExecutionStore.formStates`, `REGULATORY_EVENTS`.
- Additive overlay: `usePmOverlayStore` (Zustand + localStorage persist key `pm-overlay-v1`).
- Right Panel reads: `useProjectedTaskById(task_id)` and `usePmOverlayStore.audit`.

## A5. eCIgn packet lifecycle
See [03-eCIgn-Evidence-Lifecycle.md](../../Builder/eCIgn-Centered-Submission/03-eCIgn-Evidence-Lifecycle.md). Internal: `created → disclosed → verified → reviewed → attested → signed_locked` (+ voided/expired). Mapped to UX in [05](../../Builder/eCIgn-Centered-Submission/05-eCIgn-Form-Status-Model.md).

## A6. Evidence lifecycle
`pending → generated → stored → linked → validated → archived`. See [03](../../Builder/eCIgn-Centered-Submission/03-eCIgn-Evidence-Lifecycle.md) and [11](../../Builder/eCIgn-Centered-Submission/11-eCIgn-Integration-with-Evidence-Storage.md).

## A7. Task projection rules
- `projectTasks` is the **only** Task constructor; never instantiate Task elsewhere.
- One eCIgn submission task per `event.requiredForms[i]`.
- One non-form CES task per `event.processFlow[i]` whose `requiredFormIds` is empty.
- Ordinal counter restarts at `01` per event.
- Dev-mode guard `assertNoDuplicateTaskIds` runs after every projection.

## A8. Validation rules
- **Status:** never compute outside `ecignStatusMap.ts`.
- **Schedule:** every PM write of a due date routes through `pmOverlayStore.setDueDate(...)`, which calls `assertSchedulable` and throws `WeekendNotAllowedError` for compliance tasks on Sat/Sun without `{ weekendOverride: true, reason }`.
- **Completion:** PM never marks a CES/eCIgn task complete; completion derives from CES + eCIgn signals.

## A9. Permissions
- Sign / approve / return / lock / void: enforced by `server/ecign/**` backend (unchanged).
- PM overlay edits (assign / sprint / dueDate / labels): no special role today; keyed by `actor` argument and recorded in PM audit log.

## A10. Testing instructions
- No test runner is installed. Verify behavior with the tsx script:
  ```powershell
  npx tsx scripts/verifyEcignFlow.ts
  ```
  Should print `33 passed, 0 failed`.
- Build: `npm run build` (must complete with zero TypeScript errors).
- Manual smoke in dev: open a CES form, sign + lock, confirm Right Panel reflects packet status.

## A11. Troubleshooting
| Symptom | Likely cause | Fix |
|---|---|---|
| `WeekendNotAllowedError` on save | due date is Sat/Sun, no override | Provide `{ weekendOverride: true, reason }` or pick a weekday. |
| Right Panel shows "Task not found" | `task_id` not in projector output | Confirm event still exists in `REGULATORY_EVENTS`; check ordinal counter. |
| `Duplicate task_ids detected` thrown in dev | Caller built a Task manually | Replace with `useProjectedTasks()`/`useProjectedTaskById()`. |
| Status chip mismatch between views | A view is computing status locally | Replace with `ECIGN_PACKET_STATUS_LABEL[task.packet_status]` or `PM_TASK_STATUS_LABEL[task.status]`. |
| Overlay not persisting | Running outside browser | Persist key `pm-overlay-v1` requires `window.localStorage`. |

## A12. Maintenance guide
- All status-mapping changes go in [ecignStatusMap.ts](../../src/policy/pm/ecignStatusMap.ts).
- New PM views: depend on `useProjectedTasks()` and reuse `TaskDetailRightPanel`.
- Adding a new overlay field: extend `PmOverlay` in [pmOverlayStore.types.ts](../../src/policy/pm/pmOverlayStore.types.ts), add an action that appends a `PmAuditEntry`, surface in `applyOverlay()` if it should affect the projected task.
- Keep `taskProjectionCore.ts` free of React/store imports — it is the testable kernel.
