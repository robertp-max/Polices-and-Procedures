# 07 — eCIgn Audit Trail Model

## Purpose
Specify the structure, scope, and immutability guarantees of the audit trail produced by eCIgn-centered form submission, plus how PM overlay actions extend (but do not pollute) it.

## Two distinct audit streams
| Stream | Owner | Storage | Purpose |
|---|---|---|---|
| **Compliance audit (eCIgn)** | [server/ecign/hashChain.ts](../../server/ecign/hashChain.ts) | Append-only JSONL with hash chain | Audit-defensible record of every packet/signature/evidence event |
| **PM overlay audit** | `pm_audit` (PM overlay store) | Append-only rows | Records assignment, sprint pin, story point, label, dependency, weekend override actions — **not** compliance state |

Compliance audit is canonical for surveyors. PM audit is canonical for project-management traceability. They are **never merged in storage**; they may be merged in a unified Activity tab in the Right Panel.

## Compliance AuditRow (existing)
```ts
AuditRow {
  audit_id:        string;        // ULID
  ts:              string;        // ISO
  actor_user_id:   string;
  actor_role:      string;
  actor_tier:      number;
  action:          AuditAction;   // 'packet_created' | 'consent_recorded' | 'identity_verified'
                                  // | 'review_acknowledged' | 'signature_applied'
                                  // | 'packet_locked' | 'evidence_emitted' | 'approval_decided'
                                  // | 'packet_voided' | 'packet_expired' | 'packet_returned'
                                  // | 'signer_invited' | 'signer_declined'
  subject_kind:    'form_instance' | 'signature' | 'evidence' | 'compliance_object';
  subject_id:      string;
  payload:         Record<string, unknown>;
  network_meta?:   NetworkMetadata;
  prev_hash:       string;        // chain
  hash:            string;        // sha256(canonical(this row) + prev_hash)
}
```

## PM AuditEntry
```ts
PmAuditEntry {
  id:              string;
  actor_user_id:   string;
  task_id:         string;
  action:          PmAuditAction;  // 'assign' | 'unassign' | 'pin_to_sprint'
                                   // | 'set_points' | 'add_label' | 'add_dependency'
                                   // | 'remove_dependency' | 'weekend_override'
                                   // | 'rename_personal' | 'snooze_notification'
  before:          unknown;
  after:           unknown;
  reason?:         string;         // required for weekend_override
  ts:              string;
}
```

## Hash-chain integrity
- New row's `prev_hash = previous row's hash`.
- `hash = sha256(canonical_json(row_minus_hash) || prev_hash)`.
- `verifyChain()` walks the file, recomputes hashes, returns `{ ok, firstBadIndex }`.
- Verification endpoint: `POST /api/audit/verify-chain` (existing).

## Visibility
- **Right Panel Activity tab** merges compliance + PM streams chronologically with clear iconography:
  - Compliance icon (CES badge) for eCIgn rows.
  - PM icon for PM rows.
- Only compliance rows are exported in survey packets ([surveyPacket.ts](../../src/policy/audit/surveyPacket.ts)).

## Retention
- Compliance: 10 years (per HHA regulatory standard) + indefinite for active patient records.
- PM: 2 years operational; archived after.

## Backend contract impact
- No new endpoints required for compliance audit (existing).
- New PM overlay audit endpoints introduced incrementally as PM features land.

## UI behavior
- Activity tab paginated (newest first).
- Filter chips: Compliance | PM | All.
- Click an entry → detail popover showing payload diff and network metadata.

## Risks
| # | Risk | Mitigation |
|---|---|---|
| AU1 | PM audit pollutes compliance stream | Separate storage; merged only at render time |
| AU2 | Hash chain truncation | Periodic verification job + S3 backup of JSONL |
| AU3 | Network metadata missing for some actions | Best-effort capture; absence audited as a flag, not a failure |

## Acceptance criteria
- Two streams clearly separated.
- All eCIgn state transitions produce a compliance row.
- All overlay mutations produce a PM row.
- Hash chain verification runnable on demand.

## Verification checklist
- [ ] Lock + evidence emit produces ≥3 compliance rows.
- [ ] Weekend override produces a PM row with non-empty reason.
- [ ] Survey packet contains only compliance rows.
- [ ] Verify-chain endpoint returns `{ ok: true }` after a clean run.
