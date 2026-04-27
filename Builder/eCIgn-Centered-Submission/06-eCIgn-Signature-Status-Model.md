# 06 — eCIgn Signature Status Model

## Purpose
Define the per-signer status model used by eCIgn packets and surfaced in the Right Panel and PM views.

## Per-signer states
```
not_invited → invited → pending → signed → countersigned (optional)
                            │
                            ├─ declined
                            └─ revoked
```

| State | Meaning |
|---|---|
| `not_invited` | Required signer slot exists; no invite sent yet |
| `invited` | Invite/notification sent; awaiting signer to open |
| `pending` | Signer opened packet, has not signed |
| `signed` | Signature applied successfully |
| `countersigned` | Optional second signer signed (e.g. supervisor) |
| `declined` | Signer explicitly declined; packet enters `returned_for_correction` |
| `revoked` | Signer's signature revoked (admin action; rare; pre-lock only) |

## Per-signer record
Maps to existing `RequiredSigner` in [server/ecign/store.ts](../../server/ecign/store.ts):

```ts
RequiredSigner {
  signer_id:        string;
  display_name:     string;
  role:             string;
  status:           SignerStatus;     // see above
  invited_at?:      string;
  signed_at?:       string;
  signature_id?:    string;           // id of SignatureRow
  decline_reason?:  string;
  mfa_verified:     boolean;
  network_meta?:    NetworkMetadata;
}
```

## Aggregation rules
- **Packet enters `awaiting_signature`** when `signedCount < requiredSignersCount` and at least one signer has been invited.
- **Packet enters `attested`** when `signedCount === requiredSignersCount`.
- **Lock allowed** only when all required signers have `signed` and disclosure/identity/review steps satisfied (existing `assertTransition`).

## Audit
Every signer state transition appends an `AuditRow` of kind `signer_<state>` with timestamp + network metadata. Hash-chained via [hashChain.ts](../../server/ecign/hashChain.ts).

## UI behavior (Right Panel "Signatures" subsection)
- One row per required signer with avatar, role, status chip.
- "Send reminder" button for `pending` signers (admin/assignee only).
- "Re-invite" button for `declined` signers (admin only).
- Decline reason shown inline when status is `declined`.

## Backend contract impact
- No new endpoints.
- Existing endpoints used:
  - `POST /api/ecign/forms/:id/signature` (signer applies signature).
  - Decline routed through `POST /api/ecign/forms/:id/void` with reason or a future `decline` endpoint (see [15](15-eCIgn-Developer-Implementation-Notes.md) for note).

## Risks
| # | Risk | Mitigation |
|---|---|---|
| G1 | Stale `pending` signers block packet | Reminder cadence + escalation to manager via PM notifications |
| G2 | Decline misclassified as completion | Aggregator only counts `signed`; declines downgrade packet to `returned_for_correction` |
| G3 | Revoke after lock | Disallowed; only voiding (pre-lock) supported |

## Acceptance criteria
- Per-signer state machine defined and enforced.
- Aggregation rules consistent with existing `allRequiredSigned()`.
- Decline path documented end-to-end.

## Verification checklist
- [ ] All states observable in `RequiredSigner.status` field.
- [ ] Decline produces `returned_for_correction` packet status.
- [ ] Reminder action audit-logged.
- [ ] No state mutations after `signed_locked`.
