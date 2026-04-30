# API: Audit (`/api/audit`)

**Mount Path:** `/api/audit`, `/api/audit/v2`  
**Files:** `server/routes/audit.ts`, `server/audit/routes.ts`  
**Auth Required:** Yes (`admin`, `super_admin`, `auditor` for most endpoints)

---

## Overview

The Audit API provides access to the server-side audit event log and chain verification. It supports both a v1 event query interface and a v2 projection interface for aggregate audit analytics.

---

## Endpoints

---

### GET `/api/audit/events`

**Purpose:** Retrieve audit log events with optional filtering.  
**Auth Required:** Yes (`admin`, `super_admin`, `auditor`)  

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `event_id` | string | Filter by compliance event ID |
| `workflow_id` | string | Filter by workflow ID |
| `policy_id` | string | Filter by policy ID |
| `actor` | string | Filter by actor user ID |
| `action` | string | Filter by audit action code |
| `from` | ISO datetime | Start of time range |
| `to` | ISO datetime | End of time range |
| `category` | string | `CRITICAL` \| `STANDARD` \| `INFO` |
| `limit` | number | Max results (default: 100) |
| `offset` | number | Pagination offset |

**Response (200):**
```json
{
  "events": [
    {
      "id": "string",
      "sequence": 1042,
      "action": "EVENT_CERTIFIED",
      "actor": "user-id",
      "actorName": "Jane Smith",
      "actorRole": "admin",
      "entityType": "compliance_event",
      "entityId": "governing_body_meeting-20260514-01",
      "event_id": "governing_body_meeting-20260514-01",
      "workflow_id": "GV-GB-001-WF",
      "policy_id": "GV-GB-001",
      "timestamp": "2026-05-14T15:30:00Z",
      "hash": "sha256-hex-string",
      "prevHash": "sha256-hex-string",
      "category": "CRITICAL",
      "payload": {}
    }
  ],
  "total": 1042,
  "hasMore": true
}
```

**Where Used in UI:** Audit Mode page, event detail history, iAdministrator queries.

---

### POST `/api/audit/verify-chain`

**Purpose:** Verify the integrity of the audit hash chain for a specific entity.  
**Auth Required:** Yes (`admin`, `super_admin`)  

**Request Body:**
```json
{
  "entityType": "compliance_event | form_instance | policy",
  "entityId": "string"
}
```

**Response (200):**
```json
{
  "entityId": "string",
  "chainLength": 42,
  "firstHash": "sha256-hex-string",
  "lastHash": "sha256-hex-string",
  "isValid": true,
  "firstEvent": "2026-01-01T00:00:00Z",
  "lastEvent": "2026-04-29T10:00:00Z",
  "brokenAt": null
}
```

**Error Response (if chain broken):**
```json
{
  "isValid": false,
  "brokenAt": {
    "sequence": 38,
    "expectedPrevHash": "sha256-hex",
    "actualPrevHash": "sha256-hex-different"
  }
}
```

**Where Used in UI:** Admin audit verification tool, compliance officer chain review.

---

### GET `/api/audit/v2/projection`

**Purpose:** Retrieve aggregate audit state projection across all events.  
**Auth Required:** Yes (`admin`, `super_admin`, `auditor`)  

**Response (200):**
```json
{
  "totalEvents": 156,
  "byState": {
    "audit_ready": 120,
    "overdue": 3,
    "sla_warning": 8,
    "certified_locked": 25
  },
  "riskScore": 22,
  "escalations": [],
  "generatedAt": "2026-04-29T10:00:00Z"
}
```

**Where Used in UI:** Audit Mode page risk score panel, Dashboard KPIs.

---

## Compliance Notes

- All audit log entries are append-only — no update or delete operations exist
- The hash chain (SHA-256) links each entry to the previous, providing cryptographic tamper detection
- `CRITICAL_ACTIONS` (login, PHI access, signature, override, certification) are synchronously persisted — they cannot be lost even if the system crashes
- Audit records are retained indefinitely (no TTL or archival policy currently configured)

---

## Security Notes

- All audit API endpoints require authentication
- `GET /api/audit/events` is restricted to admin/auditor roles to prevent data enumeration
- Chain verification results are themselves logged to prevent verification being used to cover up tampering
