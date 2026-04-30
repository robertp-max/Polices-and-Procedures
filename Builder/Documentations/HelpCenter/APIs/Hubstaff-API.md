# API: Hubstaff (`/api/hubstaff`)

**Mount Path:** `/api/hubstaff`  
**File:** `server/routes/hubstaff.ts`  
**Auth Required:** Yes (`admin`, `super_admin`)

---

## Overview

The Hubstaff API integrates with the Hubstaff time-tracking platform, pulling time entries and associating them with compliance activities.

---

## Endpoints

---

### GET `/api/hubstaff/time-entries`

**Purpose:** Retrieve time tracking entries from Hubstaff for a given date range.  
**Auth Required:** Yes (`admin`, `super_admin`)  

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `from` | ISO date | Start date (e.g., `2026-04-01`) |
| `to` | ISO date | End date (e.g., `2026-04-30`) |
| `userId` | string | Optional — filter by Hubstaff user ID |

**Response (200):**
```json
{
  "timeEntries": [
    {
      "id": "string",
      "userId": "string",
      "date": "2026-04-15",
      "duration": 3600,
      "project": "Compliance Events",
      "task": "Governing Body Meeting Prep",
      "trackedAt": "2026-04-15T09:00:00Z"
    }
  ],
  "total": 42
}
```

---

### POST `/api/hubstaff/associate`

**Purpose:** Associate a Hubstaff time entry with a compliance event.  
**Auth Required:** Yes (`admin`, `super_admin`)  

**Request Body:**
```json
{
  "hubstaffEntryId": "string",
  "event_id": "governing_body_meeting-20260514-01"
}
```

**Response (200):**
```json
{
  "association": {
    "hubstaffEntryId": "string",
    "event_id": "string",
    "associatedAt": "2026-04-29T10:00:00Z"
  }
}
```

---

### GET `/api/hubstaff/users`

**Purpose:** Retrieve the list of Hubstaff users synced with the system.  
**Auth Required:** Yes (`admin`, `super_admin`)  

**Response (200):**
```json
{
  "users": [
    {
      "hubstaffUserId": "string",
      "name": "string",
      "email": "string",
      "mappedSystemUserId": "string | null"
    }
  ]
}
```

---

### POST `/api/hubstaff/map-user`

**Purpose:** Map a Hubstaff user ID to a system user ID.  
**Auth Required:** Yes (`super_admin`)  

**Request Body:**
```json
{
  "hubstaffUserId": "string",
  "systemUserId": "string"
}
```

**Response (200):** Updated user mapping object.

---

## Configuration

The Hubstaff integration requires the following environment variable:

```
HUBSTAFF_API_KEY=<your-hubstaff-personal-access-token>
```

If not configured, all `/api/hubstaff` endpoints return `503 Service Unavailable`.
