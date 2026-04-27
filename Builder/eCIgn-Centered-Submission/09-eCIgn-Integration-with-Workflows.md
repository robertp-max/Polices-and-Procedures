# 09 — eCIgn Integration with Workflows

## Purpose
Define how eCIgn participates in CES Workflows (sequences of phases: preparation → documentation → review → signature → audit) without owning workflow orchestration.

## Workflow phases (existing — [src/policy/ces/types.ts](../../src/policy/ces/types.ts))
`preparation | documentation | review | signature | audit`

## Phase ↔ packet mapping
| Workflow phase | eCIgn role |
|---|---|
| `preparation` | None — no packet expected |
| `documentation` | Packet created in `created`/`disclosed`/`verified`/`reviewed` |
| `review` | Packet at `reviewed`/`attested`; awaiting signers |
| `signature` | Packet `attested` → `signed_locked` |
| `audit` | Packet `signed_locked` + evidence validated; approvals decided |

## Phase advance rules
- A workflow may advance to `signature` only when all required forms have packets at least at `reviewed`.
- A workflow may advance to `audit` only when all required packets are `signed_locked` AND approvals (if any) decided AND evidence validated.
- The advance check is computed by CES selector, not eCIgn.

## Workflow-level evidence rollup
- `EvidenceStatus.requiredFormsTotal` = count of `requiredForms` on event.
- `EvidenceStatus.requiredFormsComplete` = count whose `effectiveFormStatus === 'complete'`.
- `EvidenceStatus.signaturesRequired/Complete` = sum across all packets.
- `EvidenceStatus.auditIndexCreated` = true when survey packet builder has indexed the event.

## Step-level packet ownership
- Each `ProcessStep` may declare `requiredForms` (subset of event's required forms). Step is `complete` only when all its required form packets are complete.

## Backend contract impact
- No schema change. Workflow phase advance remains a CES selector + UI gate.

## UI behavior
- WorkflowExecutionPanel surfaces phase-by-phase progress with per-form packet chips.
- "Advance to next phase" disabled with tooltip listing missing packets/signatures.

## Risks
| # | Risk | Mitigation |
|---|---|---|
| W1 | Workflow auto-advances without all packets | CES selector gates the action; UI honors gate |
| W2 | Step requires forms event-level doesn't list | Validator on event publish checks consistency |
| W3 | Long-lived packets across workflow phases | Packets tied to event, not phase; advance does not invalidate packets |

## Acceptance criteria
- Workflow advance gates documented and selector-driven.
- Step-level packet rollup reflects truth.
- No phase advances bypass evidence requirements.

## Verification checklist
- [ ] Cannot advance to `signature` with any required form `pending`.
- [ ] Cannot advance to `audit` with any required form `requires-review`.
- [ ] tsx script demonstrates both gates.
