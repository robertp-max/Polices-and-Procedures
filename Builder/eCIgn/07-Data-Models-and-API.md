# 07 · Data Models & API Specification

---

## A. TypeScript data models

These extend the existing types in
[FormSignatureContext.tsx](../../src/policy/components/FormSignatureContext.tsx).
Names already in use are reused verbatim.

```ts
// Existing — do not duplicate
export interface DemoUser {            id; name; role; email; tier }
export interface SignatureRecord {     fieldId; signerName; signerRole; signerEmail; signedAt; signatureDataUrl }
export interface SecondSigTask {       taskId; type; formInstanceId; assignedTo; assignedBy; status; createdAt; dueDate? }
export interface GeoInfo {             ip; city; region; country; postal; org?; loading; error? }
export interface FieldEdit {           seq; fieldLabel; oldValue; newValue; changedAt; changedBy }

// New — required by this spec
export interface ConsentRecord {
  consent_id:           string;        // ULID
  user_id:              string;
  disclosure_version:   string;        // semver of the disclosure text
  disclosure_text_hash: string;        // sha256 of exact text shown
  accepted_at_utc:      string;
  ip:                   string;
  user_agent:           string;
}

export interface DocumentVersion {
  version_id:        string;           // ULID
  form_id:           string;           // 'EN-FM-033'
  semver:            string;           // 'v6.0'
  effective_at_utc:  string;
  next_review_utc:   string;
  governing_policies: string[];        // ['EN-CM-001', 'CO-CP-001']
  canonical_bytes:    number;
  hash_sha256:        string;
  template_snapshot:  string;          // hash of the rendered DOM snapshot used by integrity gate
}

export interface FormInstance {
  instance_id:         string;         // ULID
  form_id:             string;
  document_version_id: string;
  state: 'created' | 'disclosed' | 'verified' | 'reviewed' | 'attested' | 'signed_locked' | 'voided' | 'expired';
  required_signers:    Array<{ role: string; tier: number; user_id?: string }>;
  signatures:          SignatureRecord[];
  field_edits:         FieldEdit[];
  workflow_instance_id: string;
  event_id?:            string;        // QAPI event, etc.
  retention_until_utc:  string;        // lock_at + 7 years (configurable)
  document_hash?:       string;        // sha256 at lock
  manifest_hash?:       string;
}

export interface ComplianceTransition {
  transition_id:    string;
  object: { kind: 'plan_of_care' | 'physician_order' | 'verbal_order' | 'policy_ack' | 'qapi_minutes' | 'hr_doc'; id: string };
  state_before:     string;
  state_after:      string;
  trigger:          { signature_id; signer_user_id; signed_at_utc };
  governing:        { policy_id; workflow_instance_id; event_id?; document_version_id };
  dependencies_verified: Array<{ kind: string; ref: string; ok: boolean }>;
  occurred_at_utc:  string;
}

export interface AuditEvent {
  event_id:        string;
  prev_hash:       string;
  hash:            string;
  occurred_at_utc: string;
  actor:           { user_id; name; role; email; auth_method; mfa_verified_at? };
  network:         { ip; user_agent; geo?; device? };
  subject:         { kind; id; document_version_id?; document_hash? };
  action:
    | 'consent.accepted'      | 'identity.verified'        | 'document.opened'
    | 'document.reviewed'     | 'field.edited'             | 'signature.applied'
    | 'attestation.confirmed' | 'document.locked'          | 'compliance.transitioned'
    | 'second_signature.requested' | 'second_signature.completed'
    | 'export.generated'      | 'access.denied'            | 'integrity.mismatch'
    | 'risk.late_signature';
  payload: Record<string, unknown>;
}
```

---

## B. REST API surface

All endpoints require an authenticated session. Mutating endpoints require a
CSRF token. High-impact endpoints require an MFA step-up token (`X-MFA-Token`).

### Disclosure & consent

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/ecign/disclosures/current` | — | `{ disclosure_version, text, text_hash }` |
| POST | `/api/ecign/consents` | `{ disclosure_version }` | `ConsentRecord` |

### Identity

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/ecign/identity/step-up` | `{ method: 'otp' \| 'sso' }` | `{ mfa_token, expires_at }` |
| GET | `/api/ecign/identity/me` | — | `DemoUser + session info` |

### Form instances

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| GET | `/api/ecign/forms/:formId/versions/current` | — | `DocumentVersion` | |
| POST | `/api/ecign/instances` | `{ form_id, workflow_instance_id, event_id? }` | `FormInstance` | |
| GET | `/api/ecign/instances/:id` | — | `FormInstance` | |
| PATCH | `/api/ecign/instances/:id/fields` | `{ updates: FieldEdit[] }` | `FormInstance` | Rejected with `409 DOCUMENT_LOCKED` after sign |
| POST | `/api/ecign/instances/:id/review-ack` | `{}` | `{ acknowledged_at_utc }` | |

### Signature lifecycle

| Method | Path | Body | Returns | Failure codes |
|---|---|---|---|---|
| POST | `/api/ecign/instances/:id/signatures` | `{ field_id, signature_png_b64, attestation_text_hash }` | `SignatureRecord` | `409 CONSENT_REQUIRED`, `403 STEP_UP_REQUIRED`, `409 INVALID_STATE_TRANSITION`, `409 DUPLICATE_SIGNATURE` |
| POST | `/api/ecign/instances/:id/lock` | `{}` | `{ document_hash, manifest_hash, locked_at_utc }` | `409 SIGNATURES_INCOMPLETE` |
| POST | `/api/ecign/instances/:id/second-signature` | `{ assigned_to, due_date? }` | `SecondSigTask` | |
| POST | `/api/ecign/instances/:id/void` | `{ reason }` | `FormInstance` | tier-restricted |

### Outputs

| Method | Path | Returns |
|---|---|---|
| GET | `/api/ecign/instances/:id/pdf` | Signed PDF (template + watermark + appended pages) |
| GET | `/api/ecign/instances/:id/certificate.pdf` | Certificate pages only |
| GET | `/api/ecign/instances/:id/audit.pdf` | Audit trail PDF |
| GET | `/api/ecign/instances/:id/audit.json` | JSON evidence bundle |
| GET | `/api/ecign/instances/:id/survey-packet.zip` | Full surveyor packet |

### Audit

| Method | Path | Returns |
|---|---|---|
| GET | `/api/audit/events?subject_id=…` | `AuditEvent[]` ordered ascending |
| POST | `/api/audit/verify-chain?subject_id=…` | `{ ok: boolean, first_break?: event_id }` |

### Compliance

| Method | Path | Returns |
|---|---|---|
| GET | `/api/compliance/objects/:kind/:id` | Current state + history |
| GET | `/api/compliance/blocked` | Items where transitions failed dependency checks |

---

## C. Error contract

All errors return:

```json
{ "error_code": "DOCUMENT_LOCKED", "message": "Form instance is signed_locked.",
  "instance_id": "fi_…", "audit_event_id": "evt_…" }
```

No internal stack traces are returned. Every 4xx/5xx that touches a signed
object emits an `access.denied` or `integrity.mismatch` audit event.

---

## D. Storage & retention defaults

| Class | Retention | Encryption | Notes |
|---|---|---|---|
| Form instances + signatures | ≥ 7 years from lock | At rest (AES-256), in transit (TLS 1.2+) | HIPAA-eligible BAA storage |
| Audit events | ≥ 7 years | Same | Append-only, hash-chained |
| Consents | ≥ 7 years | Same | Append-only |
| Document versions | Indefinite (frozen) | Same | Required to re-render any historical signed PDF |
| Survey packets (cached) | 90 days | Same | Regenerable on demand |
