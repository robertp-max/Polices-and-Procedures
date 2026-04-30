# API: Compliance (`/api/compliance`)

**Mount Path:** `/api/compliance`  
**File:** `server/routes/compliance.ts`  
**Auth Required:** Yes

---

## Overview

The Compliance API provides read access to compliance object states, blocked event lists, and available lifecycle transitions. It powers the enforcement and audit state engines.

---

## Endpoints

---

### GET `/api/compliance/objects/:kind/:id`

**Purpose:** Retrieve the compliance state of a specific object.  
**Auth Required:** Yes  

**Path Parameters:**
| Parameter | Values | Description |
|---|---|---|
| `kind` | `event`, `policy`, `form_instance` | The type of compliance object |
| `id` | string | The object's ID (`event_id`, `policy_id`, `instance_id`) |

**Response (200) — Example for event:**
```json
{
  "kind": "event",
  "id": "governing_body_meeting-20260514-01",
  "auditState": "in_progress",
  "riskScore": 15,
  "stepsCompleted": 7,
  "stepsTotal": 11,
  "evidenceAccepted": 1,
  "evidenceRequired": 2,
  "approvalState": "pending",
  "certifiedLocked": false,
  "blockers": []
}
```

**Error Cases:**
| Code | Reason |
|---|---|
| 404 | Object not found |
| 400 | Invalid `kind` value |

**Where Used in UI:** Event Workspace, Audit Mode page.

---

### GET `/api/compliance/blocked`

**Purpose:** Retrieve all currently blocked compliance objects.  
**Auth Required:** Yes (`manager`, `admin`, `super_admin`, `auditor`)  

**Response (200):**
```json
[
  {
    "kind": "event",
    "id": "qapi_review-20260401-01",
    "blockers": [
      {
        "type": "dependency",
        "description": "Prior quarter QAPI (qapi_review-20260101-01) is not certified",
        "dependsOn": "qapi_review-20260101-01"
      }
    ],
    "blockedSince": "2026-04-01T00:00:00Z"
  }
]
```

**Where Used in UI:** Dashboard blocked events panel, Audit Mode blocked events filter.

---

### GET `/api/compliance/transitions`

**Purpose:** Retrieve available state transitions for a specific compliance object.  
**Auth Required:** Yes  

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `kind` | string | `event`, `policy`, `form_instance` |
| `id` | string | Object ID |
| `actorRole` | string | The requesting user's role |

**Response (200):**
```json
{
  "currentState": "in_progress",
  "availableTransitions": [
    {
      "action": "SUBMIT_FOR_APPROVAL",
      "targetState": "pending_approval",
      "requiredRole": "coordinator",
      "conditions": ["all_steps_complete", "evidence_submitted"]
    }
  ],
  "blockedTransitions": [
    {
      "action": "CERTIFY",
      "reason": "Evidence not yet accepted",
      "requiredConditions": ["evidence_accepted", "approval_granted"]
    }
  ]
}
```

**Where Used in UI:** Event Workspace action bar, Policy Lifecycle controls.

---

## Notes

- The Compliance API is read-only — it does not create or modify objects
- All mutations go through the domain-specific APIs (eCIgn, Calendar, etc.)
- The `transitions` endpoint is used to determine which action buttons should be enabled/disabled in the UI
