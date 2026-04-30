# Evidence Center — Compliance Reference

**Article:** 03-Compliance  
**Page:** Evidence Center (`/evidence`)

---

## Compliance Purpose

The Evidence Center provides the **documentary proof layer** of the compliance system. Without accepted evidence, a compliance event cannot be certified, and a certified event without evidence cannot withstand surveyor scrutiny.

---

## What Compliance Requirements This Page Supports

| Regulatory Standard | Requirement | Evidence Center Role |
|---|---|---|
| CMS CoP §484.115 | Governing body must maintain meeting minutes | `meeting_minutes` evidence kind |
| CMS CoP §484.65 | QAPI program must produce written improvement plans | `meeting_minutes`, `signed_form` evidence kinds |
| CMS CoP §484.75 | Supervisory visits must be documented | `signed_form`, `attendance_roster` evidence kinds |
| HIPAA §164.308(a)(5) | Training completion must be documented | `training_record` evidence kind |
| CMS CoP §484.105 | Policy review must be documented | `policy_attestation`, `meeting_minutes` evidence kinds |
| 42 CFR §488.301 | Survey readiness — records must be retrievable | All evidence kinds, searchable by `event_id` |

---

## What Must Be Completed

For evidence to count toward compliance:

1. Document must be uploaded and linked to the correct `event_id`
2. Document must be submitted for review
3. Document must be **accepted** by a manager or administrator
4. The accepting manager must have the appropriate role

Evidence in any state other than `accepted` does **not** satisfy the compliance requirement.

---

## What Is Logged

| Action | Audit Code | Where Stored |
|---|---|---|
| Evidence uploaded | `EVIDENCE_UPLOAD` | `enforcementStore` + `/api/ecign` |
| Evidence submitted | `EVIDENCE_SUBMITTED` | `enforcementStore` |
| Evidence accepted | `EVIDENCE_ACCEPTED` | `enforcementStore` + server audit |
| Evidence rejected | `EVIDENCE_REJECTED` | `enforcementStore` + server audit |
| Evidence downloaded | `EVIDENCE_DOWNLOAD` | `enforcementStore` |
| Evidence chain verified | `EVIDENCE_CHAIN_VERIFY` | Server audit log |

---

## Immutability and Chain of Custody

Once evidence is in `accepted` state:
- The file cannot be replaced, edited, or deleted
- The acceptance record includes the reviewer's identity, role, and timestamp
- All accepted evidence records are included in the hash chain via `server/ecign/hashChain.ts`
- Chain integrity can be verified by an administrator via `POST /api/audit/verify-chain`

This provides a **cryptographically verifiable chain of custody** for all compliance evidence.

---

## Audit Traceability

To find evidence for a specific compliance obligation:

| Step | Action | Result |
|---|---|---|
| 1 | Know the `event_id` | e.g., `governing_body_meeting-20260514-01` |
| 2 | Open Evidence Center, filter by event | Shows all evidence for that event |
| 3 | Confirm at least one `accepted` document | Compliance requirement satisfied |
| 4 | Click to download | Retrieve the actual document |
| 5 | Review acceptance metadata | See who accepted it and when |

---

## Evidence Retention

Evidence is retained indefinitely in the system. There is no automatic deletion or archival. This ensures that historical survey evidence remains accessible for multi-year regulatory lookbacks.

> **Note:** Evidence deletion is not supported in the current system. If erroneous evidence must be removed, contact the system administrator. Any removal action is itself audit-logged.
