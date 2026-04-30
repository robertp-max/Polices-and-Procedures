# Evidence Model

**Classification:** Internal Compliance Documentation  
**Version:** 1.0  
**Effective Date:** 2025-01-01  
**Owner:** Compliance Director

---

## Overview

The Evidence Model describes how compliance evidence is created, validated, promoted through lifecycle states, and ultimately locked as an immutable audit artifact. Evidence is the core proof mechanism in the Care Indeed compliance system.

---

## What Is Evidence?

Evidence is any document, record, or data artifact that demonstrates a compliance activity occurred. In the Care Indeed system, evidence items are discrete records that link:

- A **policy** (the regulatory requirement)
- A **calendar event** (the execution of that requirement)
- A **form** (the structured data capture)
- An **upload** (the raw document — PDF, image, or structured data)

---

## Evidence Lifecycle

Evidence moves through four states. Each transition is logged with actor, role, and timestamp.

```
PENDING → VALIDATED → PROMOTED → LOCKED
              ↓
           REJECTED
```

### State Definitions

| State | Meaning | Who Can Advance |
|---|---|---|
| `PENDING` | Uploaded but not yet reviewed | System (auto on upload) |
| `VALIDATED` | Reviewed and confirmed complete and accurate | Compliance Officer, Administrator |
| `PROMOTED` | Approved for use as formal compliance evidence | Compliance Director |
| `LOCKED` | Immutable — cannot be modified | System (auto on promotion with lock condition) |
| `REJECTED` | Failed validation; rejection reason required | Compliance Officer, Administrator |

### State Transition Rules

- `PENDING → VALIDATED`: Reviewer confirms evidence is complete, legible, and matches the linked event.
- `PENDING → REJECTED`: Reviewer identifies deficiency — missing signature, wrong date, incomplete form.
- `VALIDATED → PROMOTED`: Compliance Director approves evidence for the official compliance record.
- `PROMOTED → LOCKED`: System automatically locks the record to prevent modification.
- A `LOCKED` record can only be superseded by uploading a new version (which creates a new evidence record in `PENDING`).
- `REJECTED` evidence cannot be re-submitted in place — a new evidence record must be created.

---

## Evidence Metadata Fields

Each evidence record contains the following fields:

| Field | Type | Description |
|---|---|---|
| `evidence_id` | UUID | Unique identifier (e.g., `ev_01JXXXX`) |
| `policy_id` | String | Linked policy (e.g., `QA-QI-001`) |
| `event_id` | String | Linked calendar event |
| `form_id` | String | Linked form submission |
| `uploader_id` | UUID | User who uploaded the evidence |
| `uploader_role` | Enum | `CLINICAL_DIRECTOR`, `COMPLIANCE_OFFICER`, etc. |
| `upload_timestamp` | ISO 8601 | When the evidence was uploaded |
| `document_type` | Enum | `MEETING_MINUTES`, `SUPERVISORY_VISIT_RECORD`, `INCIDENT_REPORT`, etc. |
| `storage_uri` | S3 URI | Location of the document in S3 |
| `status` | Enum | `PENDING`, `VALIDATED`, `PROMOTED`, `LOCKED`, `REJECTED` |
| `validated_by` | UUID | User who validated |
| `validated_at` | ISO 8601 | When validated |
| `promoted_by` | UUID | User who promoted |
| `promoted_at` | ISO 8601 | When promoted |
| `locked_at` | ISO 8601 | When locked (system-set) |
| `rejection_reason` | String | Required when status = `REJECTED` |
| `checksum` | SHA-256 | Document integrity hash |
| `version` | Integer | Version number (1 for initial, incremented on replacement) |

---

## Immutability Rules

Once an evidence record reaches `LOCKED` status:

1. **No field modifications are permitted.** The record is read-only.
2. **The S3 object is versioned.** The original upload is preserved regardless of any subsequent S3 operations.
3. **Audit records reference the locked `evidence_id`.** Any attempt to modify the record would create a new audit event detectable in the chain.
4. **Checksums are stored.** On retrieval, the system can verify document integrity against the stored SHA-256 hash.

> **Current limitation:** Immutability is enforced by application policy, not by DynamoDB condition expressions. Until AWS Phase 1 writes are implemented, a database administrator could theoretically modify records directly. See [SystemGuarantees.md](../Audit/SystemGuarantees.md) for current vs. target guarantees.

---

## Rejection Scenarios

Evidence may be rejected for the following reasons:

| Scenario | Required Action |
|---|---|
| Missing required signature | Re-submit the form with all required signatures |
| Form date does not match the event date | Upload the correct version of the form |
| Document is illegible or corrupted | Re-upload a legible scan |
| Wrong document type uploaded | Upload the correct document |
| Evidence linked to incorrect policy/event | Create a new evidence record with correct links |
| Form is incomplete (missing required fields) | Complete the form and re-submit |

When evidence is rejected:
- The `rejection_reason` field is required and must be descriptive.
- The rejection is logged in the audit chain.
- A notification is sent to the uploader.
- The `REJECTED` record is retained for audit purposes — it cannot be deleted.

---

## Evidence Generation Sources

Evidence records are generated by the following system actions:

| Source | Document Type | Evidence trigger |
|---|---|---|
| Form signing (eCIgn) | Any form type | Automatic on `FORM_SIGNED` event |
| Manual upload (Evidence Center) | Any document | User-initiated upload |
| Calendar event closure | Event summary | System auto-generates on `EVENT_COMPLETE` |
| Policy acknowledgment | Acknowledgment record | On user signature of policy |
| Training completion | Training certificate | On completion of Journey module |

---

## Current Gaps

| Gap | Impact | Planned Resolution |
|---|---|---|
| Evidence records not yet persisted to DynamoDB | Evidence is in-memory only | AWS Phase 1 — DynamoDB write |
| S3 integration not yet active | Documents stored locally or not yet stored | AWS Phase 1 — S3 bucket + presigned URLs |
| Checksum verification not implemented | Cannot verify document integrity | Phase 2 — SHA-256 on upload |
| Version history UI not implemented | Users cannot see previous versions of an evidence record | Phase 2 |
| Automated evidence generation on event close | Manual upload required | Phase 2 — calendar event closure automation |

---

## Related Documentation

- [SystemTraceability.md](../Audit/SystemTraceability.md) — Full traceability chain
- [SystemGuarantees.md](../Audit/SystemGuarantees.md) — Current vs. target system guarantees
- [Evidence Center](../Pages/EvidenceCenter/) — How to use the Evidence Center interface
