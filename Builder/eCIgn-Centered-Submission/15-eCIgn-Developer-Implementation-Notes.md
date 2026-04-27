# 15 — eCIgn Developer Implementation Notes

## Purpose
Concrete instructions to implement the eCIgn-centered submission model on top of the existing codebase, **preserving working components** and avoiding duplication.

## Scope: WHAT this initiative changes

### New files (additive)
- [src/policy/pm/ecignStatusMap.ts](../../src/policy/pm/ecignStatusMap.ts) — single status mapper.
- [src/policy/pm/weekendRule.ts](../../src/policy/pm/weekendRule.ts) — schedule guard.
- [src/policy/pm/taskProjection.ts](../../src/policy/pm/taskProjection.ts) — canonical projector.
- [src/policy/pm/pmOverlayStore.ts](../../src/policy/pm/pmOverlayStore.ts) — Zustand additive overlay store.
- [src/policy/pm/types.ts](../../src/policy/pm/types.ts) — Task, EcignSubmissionTask, EcignPacket, EcignPacketSigner, EcignPacketApproval, EcignEvidence, EcignAuditEntry, PmAuditEntry, etc.
- [src/policy/components/pm/TaskDetailRightPanel.tsx](../../src/policy/components/pm/TaskDetailRightPanel.tsx) — unified panel.
- [scripts/verifyEcignFlow.ts](../../scripts/verifyEcignFlow.ts) — verification script (no test runner; consistent with existing `scripts/*.ts`).

### Touched files (small, focused)
- [src/policy/components/FormSignatureFlow.tsx](../../src/policy/components/FormSignatureFlow.tsx) — confirm post-lock CES sync invocation and add a small comment marker noting this is the only path.
  - **Decision:** if the existing implementation already calls `addEvidenceDoc` in all paths, leave untouched and document so. If a path exists where lock occurs without sync (audit gap C-1), patch with a single sync call. We will keep the change minimal and behind a code review.

### NOT touched (preserve)
- `server/ecign/**` — backend engine.
- `server/routes/ecign.ts` — endpoints.
- `src/policy/ecign/api.ts`, `hhcEvidence.ts` — API client.
- `src/policy/components/FormSigningWorkspace.tsx`, `FormViewer.tsx` — the eCIgn workspace UI.
- `src/policy/stores/regulatoryExecutionStore.ts` — CES store (no schema changes).
- `src/policy/components/regulatory/**` — Event/Workflow/Approval UI.

## Type contracts (new — to be created in `src/policy/pm/types.ts`)

```ts
export type TaskSource = 'ces' | 'personal';

export type EcignInternal =
  | 'none' | 'created' | 'disclosed' | 'verified'
  | 'reviewed' | 'attested' | 'signed_locked' | 'voided' | 'expired';

export type EcignPacketStatus =
  | 'not_started' | 'draft' | 'submitted' | 'awaiting_signature'
  | 'awaiting_approval' | 'returned_for_correction' | 'rejected'
  | 'completed' | 'archived';

export type SignerStatus =
  | 'not_invited' | 'invited' | 'pending'
  | 'signed' | 'countersigned' | 'declined' | 'revoked';

export type PmTaskStatus = 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done';

export interface EcignPacketSigner {
  signer_id: string;
  display_name: string;
  role: string;
  status: SignerStatus;
  invited_at?: string;
  signed_at?: string;
  decline_reason?: string;
  mfa_verified: boolean;
}

export interface EcignPacketApproval {
  approval_id: string;
  approver_id: string;
  decision?: 'approved' | 'returned' | 'rejected';
  decision_at?: string;
  reason?: string;
}

export interface EcignEvidence {
  evidence_id: string;
  s3_bucket: string;
  s3_key: string;
  sha256: string;
  status: 'pending' | 'generated' | 'stored' | 'linked' | 'validated' | 'archived';
  created_at: string;
}

export interface EcignAuditEntry {
  audit_id: string;
  ts: string;
  actor_user_id: string;
  action: string;
  subject_id: string;
}

export interface PmAuditEntry {
  id: string;
  actor_user_id: string;
  task_id: string;
  action: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  ts: string;
}

export interface EcignPacket {
  packet_id: string;             // == FormInstance.instance_id
  form_id: string;
  internal: EcignInternal;
  packet_status: EcignPacketStatus;
  signers: EcignPacketSigner[];
  approvals: EcignPacketApproval[];
  evidence?: EcignEvidence;
  recent_audit_refs: string[];
}

export interface EcignSubmissionTask {
  task_id: string;
  source: 'ces';
  event_id: string;
  workflow_id: string;
  policy_id?: string;
  step_id?: string;
  form_id: string;
  ecign_packet_id?: string;
  packet?: EcignPacket;
  title: string;
  description?: string;
  status: PmTaskStatus;
  assigned_user_id?: string;
  required_signers: EcignPacketSigner[];
  approvers: { user_id: string; display_name: string }[];
  due_date?: string;
  sprint_id?: string;
  story_points?: number;
  dependencies: string[];
  evidence_id?: string;
  audit_log_refs: string[];
  blocker_reason?: 'returned' | 'rejected' | 'dependency' | 'missing_signer' | 'expired';
  weekend_override?: boolean;
}

export type Task = EcignSubmissionTask | PersonalTask | NonFormCesTask;
```

## Module responsibilities

### `ecignStatusMap.ts`
- Pure functions: `deriveEcignPacketStatus`, `deriveCesFormStatus`, `derivePmTaskStatus`.
- No I/O.
- Tested via tsx script.

### `weekendRule.ts`
- `isWeekend(date): boolean`
- `assertSchedulable(date, opts: { source: TaskSource, weekendOverride?: boolean }): void` — throws `WeekendNotAllowedError` for compliance tasks without override.
- `requiresOverrideReason(date, source): boolean`

### `taskProjection.ts`
- Reads CES events + eCIgn packet snapshots + PM overlay.
- Emits deterministic `Task[]`.
- Exports `useProjectedTasks()` React hook (memoized) and `assertNoDuplicateTaskIds(tasks)` dev guard.

### `pmOverlayStore.ts`
- Zustand store with: `assign`, `unassign`, `pinToSprint`, `setStoryPoints`, `addLabel`, `removeLabel`, `addDependency`, `removeDependency`, `setDueDate`, `setWeekendOverride`.
- Each action appends a `PmAuditEntry`.
- No CES writes.

### `TaskDetailRightPanel.tsx`
- Receives `task_id`; reads via projector.
- Sections per [12](12-eCIgn-Integration-with-PM-Tasks.md).
- Action buttons route into existing eCIgn workspace via `/forms/:formId`.

## Wiring strategy
- **Phase A (this initiative):** create the new modules + Right Panel; mount Right Panel as opt-in alongside existing UI. Do not refactor `EventWorkspace`/`WorkflowDrawer` in this phase. The Right Panel is fully usable from My Tasks now and will be plugged into Kanban/Gantt/Sprint as those views land.
- **Phase B (future):** progressively replace local task-detail rendering in CES UI with the unified Right Panel.

## Why this minimizes risk
- No backend changes.
- No CES store schema changes.
- No removal/rewrite of existing components.
- Additive code in clearly namespaced `src/policy/pm/**` and `src/policy/components/pm/**`.
- A single status mapper means any future status change is one edit.

## Verification (no test runner — uses tsx pattern)
Add `scripts/verifyEcignFlow.ts` that:
1. Imports `ecignStatusMap` and asserts each row of the mapping table.
2. Imports `weekendRule` and asserts schedulable for weekday compliance, throws for Sat without override.
3. Imports `taskProjection` and projects tasks for a fixture event; asserts no duplicate IDs and stable IDs.
4. Imports `pmOverlayStore` and asserts overlay edits append PmAuditEntry without affecting CES.

Run: `npx tsx scripts/verifyEcignFlow.ts`.

## Acceptance criteria
- All new modules implemented as described.
- Right Panel renders for any `task_id` from projector.
- Verification script exits 0.
- `npm run build` passes.

## Verification checklist
- [ ] Files created in the listed paths.
- [ ] Verification script passes.
- [ ] Build clean.
- [ ] No CES/eCIgn backend touched.
