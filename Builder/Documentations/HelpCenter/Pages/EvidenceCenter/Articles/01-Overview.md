# Evidence Center — Overview

**Article:** 01-Overview  
**Page:** Evidence Center (`/evidence`)

---

## What This Page Does

The Evidence Center is the single source of truth for all compliance documentation uploaded to the system. Every document that proves a compliance activity occurred — meeting minutes, signed forms, training records, audit reports — is stored and managed here.

---

## Why It Exists

Regulatory compliance cannot be claimed — it must be **proven**. Surveyors require documentary evidence that:
- Meetings occurred and were documented
- Staff were trained and acknowledged it
- Incidents were reviewed and corrective actions were taken
- Policies were reviewed and updated on schedule

Without a centralized, tamper-evident evidence repository, these documents can be lost, altered, or unlinked from the compliance events they support. The Evidence Center prevents this.

---

## Where It Fits in the System

```
Field Staff / Coordinators → Upload Evidence
                ↓
Evidence Center (stores, classifies, links to event_id)
                ↓
Event Workspace (shows evidence for certification)
                ↓
Audit Mode (displays accepted evidence, read-only)
                ↓
Surveyor Review
```

---

## Evidence Lifecycle

Every document uploaded goes through the following states:

| State | Description | Who Can Act |
|---|---|---|
| `staged` | Uploaded but not yet submitted | Uploader |
| `submitted` | Submitted for manager review | Manager, Admin |
| `accepted` | Approved by manager — immutable | Read-only for all |
| `rejected` | Rejected with reason — uploader must resubmit | Uploader |

Once in `accepted` state, an evidence document **cannot be deleted or altered**. It remains in the system indefinitely as part of the compliance record.

---

## Evidence Types

| Kind | Description | Common Format |
|---|---|---|
| `meeting_minutes` | Official minutes of a compliance meeting | PDF, Word |
| `attendance_roster` | List of participants with signatures | PDF, image |
| `signed_form` | Completed and signed compliance form | PDF |
| `incident_report` | Documentation of a reportable event | PDF |
| `training_record` | Proof of staff training completion | PDF, CSV |
| `policy_attestation` | Signed acknowledgment of policy receipt | PDF |
| `other` | Any other supporting document | Any |
