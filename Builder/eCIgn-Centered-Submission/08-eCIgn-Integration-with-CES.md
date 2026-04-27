# 08 — eCIgn Integration with CES

## Purpose
Define the precise contract between eCIgn and CES so compliance status is always derived from authoritative data and never duplicated.

## Direction of truth
- **CES → eCIgn:** CES tells eCIgn which forms are required for which event/step/workflow (via `requiredForms[]` on the regulatory event).
- **eCIgn → CES:** eCIgn reports packet/signature/evidence outcomes; CES recomputes form/step/event status from those facts.
- **PM ↔ either:** PM is read-only on CES + eCIgn; writes only to overlay.

## Trigger map
| eCIgn event | CES action |
|---|---|
| Packet created | No-op (form remains `pending`) |
| Packet enters `attested` (all required signed) | No-op until lock |
| Packet `signed_locked` | `effectiveFormStatus(form_id)` recomputes; if approval not required → mark `complete` once evidence row arrives |
| Approval `approved` | `decideApproval()` records receipt evidence + propagates to step completion |
| Approval `returned` / `rejected` | Form remains `in-progress`; CES surfaces blocker `returned`/`rejected` |
| Evidence `validated` (Lambda OK) | `addEvidenceDoc(eventId, ...)` invoked; CES reconciles form status to `complete` |
| Packet `voided` | No-op for compliance until a new packet is created |
| Packet `expired` | Form returns to `missing` |

## Existing wiring (preserved)
- [src/policy/stores/regulatoryExecutionStore.ts](../../src/policy/stores/regulatoryExecutionStore.ts):
  - `effectiveFormStatus(eventId, formId)` — derives status from evidence + approvals.
  - `decideApproval(eventId, formId, decision, note)` — already records receipt evidence on approve.
  - `addEvidenceDoc(eventId, doc)` — accepts evidence rows.
- [src/policy/components/regulatory/EventWorkspace.tsx](../../src/policy/components/regulatory/EventWorkspace.tsx) and [WorkflowDrawer.tsx](../../src/policy/components/regulatory/WorkflowDrawer.tsx) consume those selectors.

## Gap closure (small change introduced by this initiative)
- On **every successful lock**, the eCIgn lock pipeline must call back into CES with `addEvidenceDoc` (for offline survey packet completeness) and propagate through `decideApproval` when approval is implicit. The audit identified this happens for the approval path but should be unconditional on lock when no approval is required. Implementation note in [15](15-eCIgn-Developer-Implementation-Notes.md).

## Form-required-but-no-eCIgn-instance handling
- CES treats the form as `missing` (existing).
- Right Panel "Open Form" button creates the eCIgn instance on first click.
- The instance ID is recorded as `Task.ecign_packet_id` on the projected Task.

## Multi-instance per form
- Some events legitimately produce multiple instances of the same form (e.g. monthly QAPI minutes). CES tracks them per event; eCIgn instance IDs are unique per submission. Task IDs use the execution-unit ordinal (`{event.id}-{NN}`), not the instance ID.

## Backend contract impact
- No schema change.
- One small functional change: lock pipeline must always call CES sync (already the case for approval path; extend to non-approval paths).

## UI behavior
- Right Panel "CES" subsection shows: linked event, workflow, policy; required forms; per-form packet status; per-form evidence status; CES-validated `complete` badge.
- Action "Take action in CES" routes to `/forms/:formId` for the eCIgn workspace (existing route).

## Risks
| # | Risk | Mitigation |
|---|---|---|
| I1 | Lock without CES sync leaves stale `requires-review` | Reconciler runs on packet status change; verification script asserts post-lock CES state |
| I2 | Approval recorded twice | `decideApproval` idempotent on `(eventId, formId, decision)` |
| I3 | Multi-instance confusion | UI shows instance count chip per form |

## Acceptance criteria
- CES never owns packet state; only derived form status.
- eCIgn never writes step/event status directly.
- Lock unconditionally syncs CES.

## Verification checklist
- [ ] tsx script: lock without approval still flips CES form status to `complete` after evidence arrives.
- [ ] tsx script: returned/rejected approval keeps form in-progress.
- [ ] No code path writes step/event status from eCIgn handlers.
