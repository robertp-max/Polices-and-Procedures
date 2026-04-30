# System Traceability Model

**Classification:** Internal Compliance Documentation  
**Version:** 1.0  
**Effective Date:** 2025-01-01  
**Owner:** Compliance Director

---

## Overview

The Care Indeed system implements a hierarchical traceability chain that allows a compliance officer or CMS surveyor to reconstruct the complete proof of any compliance activity — from the governing policy down to the individual audit record.

Every compliant action in the system can be traced through the following chain:

```
Policy  →  Workflow  →  Event  →  Task  →  Form  →  Evidence  →  Audit Record
```

---

## The Traceability Chain

### 1. Policy (`policy_id`)
The root of all traceability. Every compliance action must be traceable back to a published policy.

- **Format:** `{DOMAIN}-{ABBREV}-{SEQ}` (e.g., `QA-QI-001`)
- **Status requirement:** Must be in `Published` status to be considered an active control.
- **Stored in:** DynamoDB `PolicyTable` / PostgreSQL `policy_lifecycle.policies`
- **Lifecycle events logged:** `POLICY_CREATED`, `POLICY_PUBLISHED`, `POLICY_ARCHIVED`

### 2. Workflow (`workflow_id`)
Each policy may specify one or more required workflows. A workflow defines the series of steps required to execute the policy's compliance mandate.

- **Format:** Typically `{policy_id}-WF` or a named slug (e.g., `qapi-monthly-meeting`)
- **Linked to policy_id at creation**
- **Current implementation:** Modeled as calendar events with structured `policyRefs` arrays

### 3. Calendar Event (`event_id`)
The instantiation of a workflow as a scheduled compliance activity. Events appear on the Master Calendar and are assigned to owners.

- **Format:** UUID or structured ID (e.g., `QAPI-MONTHLY-2025-01`)
- **Fields:** `cadence`, `urgency`, `ownerRole`, `policyRefs[]`, `status`
- **Lifecycle states:** `scheduled → in_progress → complete` or `missed`
- **Logged to:** `enforcementStore` audit chain

### 4. Task (`task_id`)
Discrete action items within an event. Tasks may require form completion, evidence upload, or acknowledgment.

- **Current status:** Partially modeled — tasks are embedded within event records
- **Gap:** Dedicated `task_id` unique identifiers not yet fully implemented
- **Planned:** Task-level audit records in Phase 2

### 5. Form (`form_id`)
A structured data collection artifact tied to a specific task or event. Forms capture the actual compliance work performed.

- **Format:** UUID (e.g., `frm_01JXXXX`)
- **Signed forms generate:** `signature_id`, `signed_at`, `signer_role`, `form_type`
- **Stored in:** DynamoDB `FormsTable` → S3 (signed PDF) → Evidence Center
- **Form types:** `QAPI_MEETING_MINUTES`, `SUPERVISORY_VISIT`, `INCIDENT_REPORT`, `EMPLOYEE_ACKNOWLEDGMENT`, etc.

### 6. Evidence (`evidence_id`)
A piece of documentation that proves a compliance activity occurred. Evidence items are linked to forms, events, and the originating policy.

- **Format:** UUID (e.g., `ev_01JXXXX`)
- **Lifecycle states:** `PENDING → VALIDATED → PROMOTED → LOCKED`
- **Rejection states:** `REJECTED` (with rejection reason logged)
- **Immutability:** Once `LOCKED`, evidence records are append-only
- **Stored in:** DynamoDB `EvidenceTable` + S3

### 7. Audit Record (`audit_id`)
An immutable log entry recording that a compliance action occurred, who performed it, and the system state at the time.

- **Format:** UUID (e.g., `aud_01JXXXX`)
- **Fields:** `event_type`, `actor_id`, `actor_role`, `timestamp`, `policy_id`, `workflow_id`, `event_id`, `form_id`, `evidence_id`, `system_state_snapshot`
- **Append-only:** Audit records cannot be modified or deleted
- **Current implementation:** `enforcementStore` audit chain (in-memory + planned DynamoDB write)

---

## Example: QAPI Monthly Meeting

The following demonstrates a complete traceability chain for a QAPI Monthly Meeting:

| Chain Link | Value | Notes |
|---|---|---|
| `policy_id` | `QA-QI-001` | QAPI Program policy — Published |
| `workflow_id` | `qapi-monthly-meeting` | Linked to QA-QI-001 |
| `event_id` | `QAPI-MONTHLY-2025-01` | January 2025 meeting — Calendar |
| `task_id` | *(embedded in event)* | "Complete QAPI meeting minutes form" |
| `form_id` | `frm_01JXX1234ABCD` | QAPI Meeting Minutes form |
| `evidence_id` | `ev_01JXX5678EFGH` | Uploaded meeting minutes PDF |
| `audit_id` | `aud_01JXX9012IJKL` | Logged on evidence promotion |

**Reconstruction path for surveyor:**
1. Surveyor asks: "Show me evidence that you conducted QAPI meetings in Q1 2025."
2. Compliance officer opens Evidence Center → filters by `policy_id = QA-QI-001`
3. Evidence records for Jan, Feb, Mar 2025 appear — each with `LOCKED` status
4. Each record links to the signed QAPI meeting minutes PDF in S3
5. Each PDF contains: date, attendees, quality indicators reviewed, action items
6. Audit records confirm: who uploaded, when, what form was used, what event triggered it

---

## How an Auditor Reconstructs Proof

1. **Start at the policy:** Confirm the policy is Published and was Published at the time of the activity.
2. **Find the workflow/event:** Locate the calendar event(s) associated with that policy in the reporting period.
3. **Check event completion:** Confirm event status = `complete` in the calendar.
4. **Locate forms:** Find forms submitted for that event (linked by `event_id`).
5. **Verify signatures:** Confirm form was signed by an authorized role at the appropriate time.
6. **Check evidence promotion:** Confirm the evidence item was promoted from `PENDING` to `VALIDATED` to `PROMOTED` to `LOCKED`.
7. **Review audit log:** Confirm the audit record shows no gaps in the chain.

---

## Current Gaps

| Gap | Impact | Planned Resolution |
|---|---|---|
| Dedicated `task_id` not fully implemented | Cannot trace individual tasks within events | Phase 2 task management module |
| Audit records not yet persisted to DynamoDB | Audit chain is in-memory only; does not survive server restart | AWS Phase 1 — DynamoDB write-through |
| `workflow_id` not always a discrete entity | Some workflows are implicit in calendar event structure | Phase 2 explicit workflow registry |
| Evidence immutability is policy, not technical enforcement | A database admin could theoretically modify evidence records | AWS Phase 1 — DynamoDB `LOCKED` condition expressions |

---

## Related Documentation

- [EvidenceModel.md](../DataFlow/EvidenceModel.md) — Evidence lifecycle and metadata
- [SystemGuarantees.md](SystemGuarantees.md) — What the system currently guarantees vs. aspirational
- [Audit Mode](../Pages/AuditMode/) — How to use the Audit Mode interface
