# API: eCIgn (Electronic Compliance Ignition) (`/api/ecign`)

**Mount Path:** `/api/ecign`  
**File:** `server/routes/ecign.ts`  
**Auth Required:** Yes (all endpoints)

---

## Overview

The eCIgn API manages the full electronic signature lifecycle — form instance creation, signature collection, evidence upload, audit chain management, PDF generation, and form voiding. All signature operations are hash-chained on the server side.

---

## Endpoints

---

### POST `/api/ecign/instances`

**Purpose:** Create a new form instance for signing.  
**Auth Required:** Yes  

**Request Body:**
```json
{
  "form_id": "EN-FM-002",
  "event_id": "governing_body_meeting-20260514-01",
  "workflow_id": "GV-GB-001-WF",
  "initiatedBy": "user-id-string"
}
```

**Response (201):**
```json
{
  "instance_id": "uuid-v4-string",
  "form_id": "EN-FM-002",
  "status": "pending_first_signature",
  "createdAt": "2026-04-29T10:00:00Z"
}
```

**Audit:** Logs `ECIGN_CREATE` with `instance_id`, `form_id`, initiator, timestamp.  
**Where Used in UI:** When a form signing workspace is opened.

---

### GET `/api/ecign/instances/:instanceId`

**Purpose:** Retrieve a form instance with its current signature state.  
**Auth Required:** Yes  

**Response (200):**
```json
{
  "instance_id": "string",
  "form_id": "string",
  "status": "pending_first_signature | pending_second_signature | complete | voided",
  "signatures": [
    {
      "signerUserId": "string",
      "signerName": "string",
      "signerRole": "string",
      "signedAt": "2026-04-29T10:05:00Z",
      "documentHash": "sha256-hex-string",
      "stage": 1
    }
  ],
  "event_id": "string",
  "workflow_id": "string"
}
```

**Error Cases:**
| Code | Reason |
|---|---|
| 404 | Instance not found |
| 403 | Not authorized to view this instance |

**Where Used in UI:** Form Signing Workspace on load.

---

### POST `/api/ecign/instances/:instanceId/sign`

**Purpose:** Apply a signature to the current stage of a form instance.  
**Auth Required:** Yes  

**Path Parameters:** `instanceId` — the form instance UUID

**Request Body:**
```json
{
  "signatureData": "base64-encoded-image-or-typed-name",
  "signatureType": "drawn | typed",
  "documentHash": "sha256-hex-string",
  "stage": 1
}
```

**Response (200):**
```json
{
  "instance_id": "string",
  "stage": 1,
  "status": "pending_second_signature | complete",
  "auditEntryHash": "sha256-hex-string"
}
```

**Error Cases:**
| Code | Reason |
|---|---|
| 400 | Wrong stage (not signer's turn) |
| 400 | Document hash mismatch (content tampered) |
| 403 | User role does not match required signer role |
| 409 | Stage already signed |
| 409 | Instance is voided |

**Audit:** Logs `ECIGN_SIGN` with signer identity, document hash, stage, prevHash chain entry.  
**Where Used in UI:** "Sign and Submit" button in `FormSigningWorkspace`.

---

### POST `/api/ecign/instances/:instanceId/void`

**Purpose:** Void a signed form instance.  
**Auth Required:** Yes (`admin`, `super_admin`)  

**Request Body:**
```json
{
  "reason": "string"
}
```

**Response (200):**
```json
{
  "instance_id": "string",
  "status": "voided",
  "voidedAt": "2026-04-29T10:15:00Z"
}
```

**Audit:** Logs `ECIGN_VOID` with administrator identity, reason, and timestamp. Prior signatures remain in the audit chain, marked as voided.  
**Where Used in UI:** Admin void control in form instance management.

---

### POST `/api/ecign/evidence`

**Purpose:** Upload an evidence document linked to an event.  
**Auth Required:** Yes  

**Request Body (multipart/form-data):**
| Field | Type | Description |
|---|---|---|
| `file` | File | The evidence document |
| `event_id` | string | The compliance event this evidence supports |
| `kind` | string | Evidence kind (see evidence types) |
| `workflow_id` | string | Optional — the workflow being evidenced |

**Response (201):**
```json
{
  "doc_id": "string",
  "event_id": "string",
  "kind": "meeting_minutes",
  "status": "submitted",
  "uploadedAt": "2026-04-29T10:20:00Z",
  "fileName": "string"
}
```

**Error Cases:**
| Code | Reason |
|---|---|
| 400 | No file provided |
| 400 | Invalid evidence kind |
| 413 | File exceeds 25MB limit |
| 415 | File type not allowed |

**Audit:** Logs `EVIDENCE_UPLOAD` with uploader identity, `event_id`, `doc_id`.  
**Where Used in UI:** Evidence Panel upload zone.

---

### PATCH `/api/ecign/evidence/:docId/accept`

**Purpose:** Accept a submitted evidence document.  
**Auth Required:** Yes (`manager`, `admin`, `super_admin`)  

**Response (200):**
```json
{
  "doc_id": "string",
  "status": "accepted",
  "acceptedBy": "user-id",
  "acceptedAt": "2026-04-29T10:25:00Z"
}
```

**Audit:** Logs `EVIDENCE_ACCEPTED` with reviewer identity, `doc_id`, `event_id`.

---

### PATCH `/api/ecign/evidence/:docId/reject`

**Purpose:** Reject a submitted evidence document.  
**Auth Required:** Yes (`manager`, `admin`, `super_admin`)  

**Request Body:**
```json
{
  "reason": "string"
}
```

**Response (200):**
```json
{
  "doc_id": "string",
  "status": "rejected",
  "rejectedBy": "user-id",
  "reason": "string",
  "rejectedAt": "2026-04-29T10:30:00Z"
}
```

**Audit:** Logs `EVIDENCE_REJECTED` with reason.

---

### GET `/api/ecign/instances/:instanceId/pdf`

**Purpose:** Generate and download a PDF of the signed form instance.  
**Auth Required:** Yes  

**Response:** PDF file download (Content-Type: application/pdf)

**Error Cases:**
| Code | Reason |
|---|---|
| 404 | Instance not found |
| 409 | Instance not complete (not all signatures collected) |

**Where Used in UI:** "Download PDF" button in signed form view.
