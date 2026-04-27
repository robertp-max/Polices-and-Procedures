# 04 — Audit Trail Architecture

**Layer:** Audit / Event (AEL)
**Property:** Append-only, hash-chained, replayable, defensible.

---

## 1. AuditEvent Schema

```
AuditEvent {
  id: EventId                      // UUIDv7 (time-ordered)
  sequence: number                 // monotonic per partition
  timestamp: ISODateTime           // server time (UTC)

  actor: {
    kind: 'user' | 'system' | 'integration'
    userId?: UserId
    integrationId?: string         // when kind='integration'
    onBehalfOf?: UserId            // delegated/system-as-user
  }

  action: ActionCode               // see catalog §3
  category: 'access' | 'ceu' | 'policy' | 'form' | 'signature'
          | 'phi' | 'admin' | 'security' | 'system'

  target: {
    kind: 'ceu' | 'policy' | 'form' | 'user' | 'group' | 'assignment'
        | 'signature' | 'evidence' | 'session' | 'override' | 'system'
    id: string
    parentId?: string
  }

  before?: JsonValue               // pre-image (or null for create)
  after?: JsonValue                // post-image (or null for delete-attempt)
  diff?: JsonPatch                 // computed RFC6902 patch (optional convenience)

  context: {
    sessionId?: string
    requestId: string
    correlationId: string          // ties multi-event flows
    causationId?: EventId          // event that caused this event
    ipAddress?: string             // hashed if PHI flow
    userAgent?: string
    geo?: { country?: string; region?: string }
    phi: boolean                   // touched PHI?
    reasonCode?: string
    reasonText?: string            // present for overrides, denies, manual ops
  }

  integrity: {
    payloadHash: string            // sha256(canonical JSON of event minus integrity)
    previousHash: string           // hash of the prior event in chain (or genesis)
    chainHash: string              // sha256(previousHash || payloadHash)
    signature?: string             // optional KMS-signed chainHash for export
  }
}
```

`before`/`after` for PHI-tagged targets store **structured PHI references** (id + content hash), not raw PHI payloads, unless the action is itself a PHI write where the post-image is required for legal record (in which case the field is encrypted-at-rest with envelope encryption).

---

## 2. Append-Only Guarantees

- Storage table has **no UPDATE or DELETE grants** for application roles.
- Schema enforces immutability (DB triggers reject UPDATE/DELETE; or use a WORM-style store).
- "Edit" of a prior record is impossible. Corrections are **new** events:
  - `CORRECTION_RECORDED` references the original `EventId` and `causationId`.
- Deletes anywhere in the system are events, never row removal:
  - `*_DELETE_REQUESTED`, `*_DELETE_APPROVED`, `*_TOMBSTONED`.

---

## 3. Action Code Catalog (initial)

**Access:** `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `SESSION_EXPIRED`, `REAUTH_REQUIRED`, `REAUTH_SUCCESS`, `ACCESS_DECISION` (allow/deny), `SOD_VIOLATION`.
**Identity:** `USER_CREATED`, `USER_UPDATED`, `USER_SUSPENDED`, `USER_REINSTATED`, `ASSIGNMENT_CREATED`, `ASSIGNMENT_REVOKED`, `ASSIGNMENT_EXPIRED`, `PERMISSION_GRANTED`, `PERMISSION_REVOKED`.
**CEU:** `CEU_CREATED`, `CEU_ASSIGNED`, `CEU_REASSIGNED`, `CEU_STARTED`, `CEU_STATE_CHANGED`, `CEU_BLOCKED`, `CEU_UNBLOCKED`, `CEU_AT_RISK`, `CEU_COMPLETED`, `CEU_FAILED`, `CEU_OVERRIDDEN`, `CEU_BLOCKED_ATTEMPT`, `CEU_REASSIGN_DENIED`.
**Evidence:** `EVIDENCE_SUBMITTED`, `EVIDENCE_VALIDATED`, `EVIDENCE_REJECTED`.
**Signature:** `SIGNATURE_REQUESTED`, `SIGNATURE_COLLECTED`, `SIGNATURE_DECLINED`, `SIGNATURE_BYPASS_ATTEMPT`.
**Policy:** `POLICY_DRAFTED`, `POLICY_APPROVED`, `POLICY_PUBLISHED`, `POLICY_RETIRED`, `POLICY_ACK_RECORDED`.
**Form:** `FORM_OPENED`, `FORM_SUBMITTED`, `FORM_AMENDED`.
**PHI:** `PHI_VIEWED`, `PHI_EXPORTED`, `PHI_PRINTED`, `PHI_WRITE`, `PHI_REDACTION_TRIGGERED`.
**Override:** `OVERRIDE_REQUESTED`, `OVERRIDE_APPROVED`, `OVERRIDE_DENIED`, `OVERRIDE_EXPIRED`.
**Admin:** `EXPORT_GENERATED`, `REPORT_VIEWED`, `CONFIG_CHANGED`, `INTEGRATION_INVOKED`.
**System:** `JOB_RAN`, `INTEGRITY_CHECK`, `CHAIN_VERIFIED`, `CHAIN_BROKEN_DETECTED`.

Codes are **stable** identifiers. New codes append to the catalog; existing codes never change meaning.

---

## 4. Hash Chain

Genesis event has `previousHash = '0'.repeat(64)`.
For every subsequent event:
```
payloadHash  = sha256(canonicalJSON(event excluding integrity))
chainHash    = sha256(previousHash || payloadHash)
```
Verification job (`INTEGRITY_CHECK`) recomputes the chain across a window:
- Reads events ordered by `sequence`.
- Recomputes `payloadHash` and `chainHash`.
- On mismatch, emits `CHAIN_BROKEN_DETECTED` with the offending sequence range and freezes write access pending Compliance review.

For external attestation, `chainHash` may be signed periodically (KMS) and the signature included in exports.

---

## 5. Immutability & Storage

- Logical store: `audit_events` (append-only).
- Physical options (any one acceptable):
  - DB table with INSERT-only grants and UPDATE/DELETE triggers that RAISE.
  - Object storage WORM bucket (S3 Object Lock / equivalent) for periodic batches.
  - For local/dev: file-based ND-JSON with `O_APPEND` and rollover, plus periodic chain verification.
- Backups are **not** the audit trail; they protect it. Restoring backups must verify the chain end-to-end.

---

## 6. Retention

- Minimum **7 years** retention for all categories. PHI access events and signatures retained per HIPAA + state law (whichever is longer).
- Retention is **floor**, not ceiling. No automatic deletion before legal hold release.
- Legal holds (`LEGAL_HOLD_APPLIED` / `LEGAL_HOLD_RELEASED`) are themselves audit events.

---

## 7. Replay Capability

Given the event log, the system can reconstruct:
- CEU state at any time T (apply `CEU_*` events with `timestamp <= T`).
- User permissions at time T (apply identity events).
- Policy version state at time T.

A `system.replay` operation:
- Is permitted only to the `system` role (offline/admin context).
- Rebuilds materialized views into a **separate** verification database.
- Does **not** touch the audit log itself (read-only).
- Emits a `REPLAY_EXECUTED` event with parameters.

---

## 8. Correlation & Causation

- `correlationId` is set at the inbound boundary (HTTP request, scheduled job, integration callback) and propagated through every emitted event for that flow.
- `causationId` references the immediate prior event that triggered this one (e.g., a `SIGNATURE_COLLECTED` causing a `CEU_STATE_CHANGED`).
- These two ids enable end-to-end forensic traces.

---

## 9. Performance & Partitioning

- Partition by month (`audit_events_YYYY_MM`) for query performance.
- Indexes: `(actor.userId, timestamp)`, `(target.kind, target.id, timestamp)`, `(correlationId)`, `(action, timestamp)`.
- Hot path writer is asynchronous-safe but **synchronous-write for security-critical events** (`ACCESS_DECISION`, `SIGNATURE_*`, `OVERRIDE_*`, `PHI_*`).

---

## 10. Export & Defensibility

- Exports are themselves events (`EXPORT_GENERATED`) and include:
  - The query parameters.
  - The set of `EventId`s included.
  - The chain root (last `chainHash`).
  - Optional KMS signature.
- Exported bundles are watermarked with the requesting actor and timestamp.
- Auditors verify by recomputing the chain over the included events.
