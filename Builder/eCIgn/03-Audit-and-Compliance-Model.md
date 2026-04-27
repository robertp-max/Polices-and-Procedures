# 03 · Audit Trail & Compliance Event Model

Covers Phases 4 (Audit Trail), 5 (CoPs Alignment), and 11 (Compliance Event Model).

---

## A. Audit trail (Phase 4)

### Event schema

Every state-changing action — read access excluded — appends one row to
`audit_events`. The table is **append-only**; no UPDATE or DELETE grants exist
in production.

```ts
interface AuditEvent {
  event_id:        string;   // ULID
  prev_hash:       string;   // SHA-256 of preceding event payload
  hash:            string;   // SHA-256(prev_hash ‖ canonical(payload))
  occurred_at_utc: string;   // ISO 8601, server clock
  actor: {
    user_id:    string;
    name:       string;
    role:       string;
    email:      string;
    auth_method: 'session' | 'otp' | 'sso' | 'system';
    mfa_verified_at?: string;
  };
  network: {
    ip:         string;
    user_agent: string;
    geo?:       { city, region, country, postal, org };
    device?:    { name, manufacturer, model, processor, os, os_version };
  };
  subject: {
    kind:                 'form_instance' | 'policy_ack' | 'workflow_step' | 'compliance_object';
    id:                   string;
    document_version_id?: string;
    document_hash?:       string;     // sha256 at the moment of the event
  };
  action:
    | 'consent.accepted'
    | 'identity.verified'
    | 'document.opened'
    | 'document.reviewed'
    | 'field.edited'
    | 'signature.applied'
    | 'attestation.confirmed'
    | 'document.locked'
    | 'compliance.transitioned'
    | 'second_signature.requested'
    | 'second_signature.completed'
    | 'export.generated'
    | 'access.denied';
  payload: Record<string, unknown>;
}
```

### Integrity controls

| Control | How |
|---|---|
| Tamper detection | Hash chain: any modification breaks downstream hashes |
| Replay detection | Each event has a server-issued ULID and monotonic timestamp |
| Time integrity | Server uses NTP-disciplined UTC clock; client time is recorded but not authoritative |
| Export integrity | Every export embeds the head-hash of the chain at export time |

### Survey-ready exports

`src/policy/audit/exportReport.ts` produces:

1. **PDF audit report** — human-readable, paginated, branded.
2. **JSON evidence bundle** — full event chain + computed hashes for re-verification.
3. **Survey packet** (`surveyPacket.ts`) — bundles the signed form, certificate,
   audit report, governing policy snapshot, and dependency-check results into a
   single ZIP suitable for CMS submission.

---

## B. Compliance event model (Phase 11)

A signature is **never** just a UI action — it is a state transition on a
*compliance object*.

### Compliance object taxonomy

| Compliance object | State (before) | Signature triggers (after) | Downstream effect |
|---|---|---|---|
| Plan of Care (485) | `incomplete`, `not_billable` | `physician_signed` → `billable` | Billing module unlocked |
| Physician Order | `pending_authentication` | `authenticated` | Order executable |
| Verbal Order | `pending_countersign` | `countersigned` (≤ regulatory window) | Compliant; alert if late |
| Policy Acknowledgment | `pending_employee_ack` | `acknowledged` | Employee marked compliant for that policy |
| QAPI Minutes | `event_open` | `minutes_signed` | Event closed; audit-ready |
| HR Document | `incomplete_personnel_file` | `signed` | Employee personnel file complete |

### Transition record

Every signature emits a `compliance.transitioned` audit event:

```ts
{
  action: 'compliance.transitioned',
  payload: {
    compliance_object: { kind, id },
    state_before: 'incomplete',
    state_after:  'billable',
    trigger: { signature_id, signer_user_id, signed_at_utc },
    governing: {
      policy_id:           'CO-CP-001',          // Phase 6 linkage
      workflow_instance_id: 'wf_...',
      event_id:            'qapi_2026_q1',       // optional
      document_version_id: 'docv_...',
    },
    dependencies_verified: [
      { kind: 'consent',      ref: 'consent_...', ok: true },
      { kind: 'identity',     ref: 'session_...', ok: true },
      { kind: 'review_ack',   ref: 'evt_...',     ok: true },
      { kind: 'document_hash', expected: '...',   ok: true },
    ],
  }
}
```

The system can then answer the Phase 11 question:

> *"Why was this action allowed at this time, and what made it compliant?"*

…by replaying the chain `audit_events WHERE subject.id = X ORDER BY occurred_at_utc`.

---

## C. CMS CoPs alignment (Phase 5 — 42 CFR Part 484)

| Requirement | CFR | eCIgn control |
|---|---|---|
| Plan of Care signed by physician before services billed | § 484.60(b) | POC compliance object cannot enter `billable` without `physician_signed` event |
| Verbal orders countersigned within agency policy window | § 484.110(a)(3) | Workflow timer + late-signature audit flag (`risk: late_signature`) |
| Documentation integrity, no alteration after signing | § 484.110 | `signed_locked` state prevents field edits; void-and-reissue only |
| Record retention ≥ 5 years (POC), 10 years (Medicare cost report); operating standard adopted: **7 years minimum** | § 484.110(e), 42 CFR 422.504(d) | `documents.versions` and `audit_events` retained ≥ 7 years; `retention_until` stamped on lock |
| Surveyor reconstruction: who, when, what version | § 484 survey protocol | `surveyPacket.ts` produces full evidence bundle |
| Documentation alignment across POC ↔ OASIS ↔ visits | Survey expectation | `dependencyCheck.ts` validates cross-document consistency before allowing `billable` transition |
| Plan of Care timeliness (start of care + 5 days) | § 484.60 | Workflow due date drives surface-level alerts; late events flagged in audit trail |

---

## D. HIPAA controls

| Safeguard | Implementation |
|---|---|
| Access control (164.312(a)) | Authenticated session + role-based authorization on every endpoint |
| Audit controls (164.312(b)) | The append-only `audit_events` chain |
| Integrity (164.312(c)) | SHA-256 document hash + audit hash chain |
| Person/entity authentication (164.312(d)) | Session + step-up MFA for high-impact signatures |
| Transmission security (164.312(e)) | TLS 1.2+ enforced; HSTS; no PHI in URLs |
| Minimum necessary (164.502(b)) | Certificate page redacts PHI not required for attestation |
