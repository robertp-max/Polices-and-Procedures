# API: CEU (Continuing Education Units) (`/api/ceu`)

**Mount Path:** `/api/ceu`  
**File:** `server/ceu/routes.ts`  
**Auth Required:** Yes

---

## Overview

The CEU API manages continuing education unit assignments, tracking, and completion records for agency staff.

---

## Endpoints

---

### GET `/api/ceu/assignments`

**Purpose:** Retrieve CEU assignments for the current user (or all users for admins).  
**Auth Required:** Yes  

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `userId` | string | Admin-only: filter by a specific user ID |
| `status` | string | `assigned \| in_progress \| completed \| overdue` |

**Response (200):**
```json
[
  {
    "assignmentId": "string",
    "userId": "string",
    "userName": "string",
    "courseId": "string",
    "courseTitle": "HIPAA Privacy and Security Training",
    "requiredCredits": 2,
    "dueDate": "2026-12-31",
    "status": "assigned",
    "assignedAt": "2026-01-01T00:00:00Z",
    "completedAt": null
  }
]
```

---

### POST `/api/ceu/assignments`

**Purpose:** Create a new CEU assignment.  
**Auth Required:** Yes (`admin`, `super_admin`)  

**Request Body:**
```json
{
  "userId": "string",
  "courseId": "string",
  "dueDate": "2026-12-31"
}
```

**Response (201):** Created assignment object.

---

### PATCH `/api/ceu/assignments/:assignmentId/complete`

**Purpose:** Mark a CEU assignment as completed.  
**Auth Required:** Yes (own assignments for staff, any assignment for admin)  

**Request Body:**
```json
{
  "completedAt": "2026-04-29T10:00:00Z",
  "certificateUrl": "string (optional)"
}
```

**Response (200):** Updated assignment object with `status: "completed"`.

---

### DELETE `/api/ceu/assignments/:assignmentId`

**Purpose:** Remove a CEU assignment.  
**Auth Required:** Yes (`admin`, `super_admin`)  

**Response (200):** `{ "message": "Assignment removed" }`

---

### GET `/api/ceu/courses`

**Purpose:** Retrieve the list of available CEU courses.  
**Auth Required:** Yes  

**Response (200):**
```json
[
  {
    "courseId": "string",
    "title": "HIPAA Privacy and Security Training",
    "description": "string",
    "credits": 2,
    "category": "Compliance",
    "externalUrl": "https://example.com/course"
  }
]
```

---

### GET `/api/ceu/summary`

**Purpose:** Retrieve a compliance summary of CEU completion rates.  
**Auth Required:** Yes (`admin`, `super_admin`, `auditor`)  

**Response (200):**
```json
{
  "totalAssignments": 156,
  "completedOnTime": 132,
  "overdue": 8,
  "inProgress": 16,
  "completionRate": 0.85
}
```

---

## Notes

- CEU completion records are retained indefinitely for regulatory compliance
- The `completedAt` field is set by the staff member or admin — it is not automatically computed
- Certificate URLs (if provided) are stored as links to externally-hosted documents
