# API: Calendar (`/api/calendar`)

**Mount Path:** `/api/calendar`  
**File:** `server/routes/calendar.ts`  
**Auth Required:** Yes (all endpoints)

---

## Overview

The Calendar API manages regulatory compliance calendar events — their creation, retrieval, modification, and audit logging. It is the server-side persistence layer for the `calendarStore` and `autogenStore`.

---

## Endpoints

---

### GET `/api/calendar/events`

**Purpose:** Retrieve all calendar events.  
**Auth Required:** Yes  

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `year` | number | Filter by year |
| `month` | number | Filter by month (1-12) |
| `domain` | string | Filter by domain code |
| `status` | string | Filter by audit state |

**Response (200):**
```json
[
  {
    "id": "string",
    "event_id": "governing_body_meeting-20260514-01",
    "title": "string",
    "domain": "GV",
    "scheduledDate": "2026-05-14T10:00:00Z",
    "dueDate": "2026-06-13T23:59:59Z",
    "workflow_id": "GV-GB-001-WF",
    "policy_id": "GV-GB-001",
    "auditState": "scheduled",
    "cadenceKind": "time_based"
  }
]
```

**Where Used in UI:** Master Calendar page (`/calendar`), Dashboard urgent events panel.

---

### GET `/api/calendar/events/by-app/:eventId`

**Purpose:** Retrieve a specific event by its application-level `event_id`.  
**Auth Required:** Yes  

**Path Parameters:**
| Parameter | Description |
|---|---|
| `eventId` | Application-level event ID (e.g., `governing_body_meeting-20260514-01`) |

**Response (200):** Single event object (same schema as above).

**Error Cases:**
| Code | Reason |
|---|---|
| 404 | Event not found |

**Where Used in UI:** Event Workspace when opening a specific event.

---

### POST `/api/calendar/events`

**Purpose:** Create a new calendar event.  
**Auth Required:** Yes (`admin`, `super_admin` only)  

**Request Body:**
```json
{
  "title": "string",
  "domain": "GV",
  "scheduledDate": "2026-05-14T10:00:00Z",
  "dueDate": "2026-06-13T23:59:59Z",
  "workflow_id": "GV-GB-001-WF",
  "policy_id": "GV-GB-001",
  "cadenceKind": "time_based",
  "cadenceInterval": "quarterly"
}
```

**Response (201):** Created event object with assigned `id` and `event_id`.

**Error Cases:**
| Code | Reason |
|---|---|
| 400 | Missing required fields |
| 403 | Insufficient role |
| 409 | Duplicate event (same type and date) |

**Audit:** Logged as `EVENT_CREATED` with actor and timestamp.  
**Where Used in UI:** Admin event creation controls.

---

### PUT `/api/calendar/events/:id`

**Purpose:** Update a calendar event (schedule override).  
**Auth Required:** Yes (`admin`, `super_admin` only)  

**Path Parameters:** `id` — event database ID

**Request Body:** Partial event fields to update (e.g., `scheduledDate`, `dueDate`).

**Response (200):** Updated event object.

**Error Cases:**
| Code | Reason |
|---|---|
| 403 | Insufficient role |
| 404 | Event not found |
| 409 | Event is certified_locked — cannot be modified |

**Audit:** Logged as `SCHEDULE_OVERRIDE` with actor, old values, new values.  
**Where Used in UI:** Schedule override controls in Event Workspace.

---

### DELETE `/api/calendar/events/:id`

**Purpose:** Cancel/delete a calendar event.  
**Auth Required:** Yes (`super_admin` only)  

**Path Parameters:** `id` — event database ID

**Response (200):**
```json
{ "message": "Event deleted" }
```

**Error Cases:**
| Code | Reason |
|---|---|
| 403 | Insufficient role |
| 404 | Event not found |
| 409 | Cannot delete a certified_locked event |

**Audit:** Logged as `EVENT_DELETED` with actor and reason.

---

### GET `/api/calendar/audit`

**Purpose:** Retrieve audit log entries for calendar events.  
**Auth Required:** Yes (`admin`, `super_admin`, `auditor`)  

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `event_id` | string | Filter by specific event |
| `from` | ISO date | Start date |
| `to` | ISO date | End date |

**Response (200):** Array of audit log entries for calendar events.

**Where Used in UI:** Audit Mode page event detail view.

---

### GET `/api/calendar/notifications`

**Purpose:** Retrieve upcoming event notifications for the current user.  
**Auth Required:** Yes  

**Response (200):**
```json
[
  {
    "event_id": "string",
    "title": "string",
    "dueDate": "string",
    "urgency": "warning | urgent | overdue",
    "message": "string"
  }
]
```

**Where Used in UI:** Notification bell in `CommandCenterLayout`.
