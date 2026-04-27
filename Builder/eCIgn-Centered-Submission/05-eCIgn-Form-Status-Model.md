# 05 — eCIgn Form Status Model

## Purpose
Establish a **single canonical mapping** between:
- **eCIgn packet state** (existing internal state machine)
- **CES form status** (existing FormStatus enum)
- **PM task status** (canonical Task.status used in projections)

All three layers must be reconciled by **one** module: `src/policy/pm/ecignStatusMap.ts`.

## Source enums

### eCIgn packet state (server [stateMachine.ts](../../server/ecign/stateMachine.ts))
```
created → disclosed → verified → reviewed → attested → signed_locked
                                                     ├─ voided
                                                     └─ expired
```
Plus pseudo-states layered on top by [compliance.ts](../../server/ecign/compliance.ts) and approval flow:
- `awaiting_approval` — locked but pending approver decision.
- `returned_for_correction` — approver requested changes; new draft started.
- `rejected` — approver denied; not completed.
- `archived` — completed and moved out of active queue.

### CES form status ([regulatoryExecutionStore.ts](../../src/policy/stores/regulatoryExecutionStore.ts))
`'missing' | 'pending' | 'in-progress' | 'requires-review' | 'complete'`

### PM task status (canonical)
`'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done'`

## Public façade (PM-friendly aliases)
For UX clarity, the unified packet status surfaced in the Right Panel uses the user-friendly set requested in the spec:
`not_started | draft | submitted | awaiting_signature | awaiting_approval | returned_for_correction | rejected | completed | archived`

This is a **display-only projection** — internal storage remains the existing eCIgn state plus the layered pseudo-states above.

## Canonical mapping

| eCIgn (internal) | UX packet status | CES form status | PM task status |
|---|---|---|---|
| (no instance) | `not_started` | `missing` or `pending` | `todo` |
| `created` | `draft` | `pending` | `todo` |
| `disclosed` / `verified` / `reviewed` / `attested` | `submitted` (in-flight signing steps) | `in-progress` | `in_progress` |
| `attested`, awaiting required signers | `awaiting_signature` | `in-progress` | `in_progress` |
| `signed_locked`, awaiting approver | `awaiting_approval` | `requires-review` | `in_review` |
| `signed_locked` + approval `returned` | `returned_for_correction` | `in-progress` | `blocked` (with reason `returned`) |
| `signed_locked` + approval `rejected` | `rejected` | `in-progress` | `blocked` (with reason `rejected`) |
| `signed_locked` + approval `approved` (or no approval required) + evidence validated | `completed` | `complete` | `done` |
| `voided` | `archived` (void variant) | `pending` (re-issued) | `todo` (new instance) |
| `expired` | `archived` (expired variant) | `missing` | `blocked` |
| Completed and beyond audit retention window | `archived` | `complete` | `done` |

## Mapping module contract
```ts
// src/policy/pm/ecignStatusMap.ts (new — see code phase)
export type EcignInternal =
  | 'none' | 'created' | 'disclosed' | 'verified' | 'reviewed'
  | 'attested' | 'signed_locked' | 'voided' | 'expired';

export type EcignPacketStatus =
  | 'not_started' | 'draft' | 'submitted' | 'awaiting_signature'
  | 'awaiting_approval' | 'returned_for_correction' | 'rejected'
  | 'completed' | 'archived';

export type CesFormStatus =
  | 'missing' | 'pending' | 'in-progress' | 'requires-review' | 'complete';

export type PmTaskStatus =
  | 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done';

export interface PacketSnapshot {
  internal: EcignInternal;
  requiredSignersCount: number;
  signedCount: number;
  approvalRequired: boolean;
  approvalDecision?: 'approved' | 'rejected' | 'returned';
  hasValidatedEvidence: boolean;
}

export function deriveEcignPacketStatus(s: PacketSnapshot): EcignPacketStatus;
export function deriveCesFormStatus(s: PacketSnapshot): CesFormStatus;
export function derivePmTaskStatus(s: PacketSnapshot, blocked: boolean): PmTaskStatus;
```

## Rules
1. **`done` (PM) requires `complete` (CES) requires `completed` (UX) requires `signed_locked` + (no approval OR `approved`) + `hasValidatedEvidence`.**
2. **PM cannot publish `done` directly** — only the projector emits `done`, and only when CES says `complete`.
3. **`blocked` has a reason** carried in `Task.blocker_reason`; possible values: `returned`, `rejected`, `dependency`, `missing_signer`, `expired`.
4. **`archived` does not collapse into `done`** — they're distinguishable for reports/filters.

## Backend contract impact
None. Mapping is a pure client-side function over existing fields.

## UI behavior
- Right Panel displays the UX packet status with a tooltip that includes the eCIgn internal state for support diagnostics.
- Kanban lanes use PM task status.
- Reports filter by any of the three depending on audience (Operators: PM; Compliance: CES; Auditors: eCIgn internal).

## Risks
| # | Risk | Mitigation |
|---|---|---|
| S1 | Mapping drift across codebase | Single module + lint rule banning string literals from the enums outside the module |
| S2 | Approval pseudo-state lost across reloads | Persist approval decision in CES store ([regulatoryExecutionStore.decideApproval](../../src/policy/stores/regulatoryExecutionStore.ts)) |
| S3 | Evidence validation not yet complete at render | Default to `awaiting_approval` until evidence row arrives |

## Acceptance criteria
- One module owns the mapping.
- All three enums covered without ambiguity.
- PM `done` impossible without CES `complete`.

## Verification checklist
- [ ] `ecignStatusMap.ts` exists.
- [ ] No status string literal used outside the module (grep check).
- [ ] Right Panel uses derived UX status, not raw internal state.
- [ ] tsx verification proves: locking + approval + evidence sets all three to terminal states.
