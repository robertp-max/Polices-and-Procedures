# Component: EvidencePanel

**File:** `src/policy/components/regulatory/EvidencePanel.tsx`  
**Type:** Feature Sub-component  
**Used On:** EventWorkspace, EvidenceCenterPage (`/evidence`)

---

## Overview

`EvidencePanel` manages the upload, review, and display of compliance evidence documents for a specific regulatory event. It enforces the evidence lifecycle: `staged → submitted → accepted → immutable`.

---

## UI Breakdown

| Region | Description |
|---|---|
| Upload Zone | Drag-and-drop or click-to-browse file input |
| Evidence Kind Selector | Dropdown: `meeting_minutes`, `attendance_roster`, `signed_form`, `incident_report`, `training_record`, `policy_attestation`, `other` |
| Staged Queue | Documents uploaded but not yet accepted, with a "Submit for Review" button |
| Accepted Evidence List | Immutable list of accepted evidence with download links |
| Evidence Metadata | For each document: file name, upload date, uploader, kind, linked `event_id` |

---

## User Actions

- Upload one or more documents via drag-and-drop or file browser
- Select the evidence kind from the dropdown
- Submit staged documents for review
- Download any previously accepted evidence document
- (Admin/Manager) Accept or reject staged evidence

---

## System Behavior

1. **Upload:** File is stored in the staged queue in `regulatoryExecutionStore`. It is associated with the current `event_id`.
2. **Submit:** Staged evidence is submitted to the server (`POST /api/ecign/evidence`) and transitions to `pending_acceptance`.
3. **Accept:** A manager or administrator accepts the evidence. It transitions to `accepted` and becomes immutable. Acceptance is logged to `enforcementStore`.
4. **Reject:** Evidence can be rejected with a reason. The uploader is notified. The event remains incomplete until replacement evidence is accepted.
5. **Immutability:** Once accepted, evidence cannot be deleted. New evidence can supersede it but the original remains in the record.

---

## Data Flow

| Data Element | ID Type | Store / API |
|---|---|---|
| Evidence documents | `event_id` | `regulatoryExecutionStore` |
| Upload | `event_id`, `user_id` | `POST /api/ecign/evidence` |
| Acceptance | `event_id`, `doc_id` | `PATCH /api/ecign/evidence/:id/accept` |
| Audit entry | `event_id`, `doc_id`, actor | `enforcementStore` |

---

## Permissions & Roles

| Action | Required Role |
|---|---|
| Upload evidence | `coordinator`, `manager`, `admin` |
| Accept evidence | `manager`, `admin`, `super_admin` |
| Reject evidence | `manager`, `admin`, `super_admin` |
| View evidence | All authenticated users |
| Download evidence | All authenticated users |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| File type not allowed | Upload rejected; allowed types shown in error |
| File exceeds 25MB size limit | Upload rejected with size error |
| Server unavailable on submit | Document remains in local staged queue; retry prompt shown |
| Evidence accepted then found invalid | Admin must contact compliance officer — no system reversal path |

---

## Audit & Compliance Impact

| Event | Audit Action | Notes |
|---|---|---|
| Evidence uploaded | `EVIDENCE_UPLOAD` | File name, kind, actor, `event_id` |
| Evidence submitted | `EVIDENCE_SUBMITTED` | Actor, `event_id` |
| Evidence accepted | `EVIDENCE_ACCEPTED` | Reviewer, `event_id`, `doc_id` |
| Evidence rejected | `EVIDENCE_REJECTED` | Reason, reviewer, `event_id` |

---

## Dependencies

- `regulatoryExecutionStore` — evidence state
- `enforcementStore` — audit logging
- `/api/ecign/evidence` — server persistence
- `EventWorkspace` — parent context providing `event_id`

---

## Known Issues / Gaps

- **GAP:** No virus/malware scanning on uploaded files. Documents are accepted based on MIME type only.
- **GAP:** Evidence download links do not expire — any authenticated user can download any evidence document indefinitely.
