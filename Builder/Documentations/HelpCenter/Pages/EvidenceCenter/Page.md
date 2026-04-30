# Page: Evidence Center

**Route:** `/evidence`  
**File:** `src/policy/pages/EvidenceCenterPage.tsx`  
**Access:** `coordinator`, `manager`, `admin`, `super_admin`, `auditor` (read-only)

---

## Page Purpose

The Evidence Center is the centralized repository for all compliance evidence documents. It provides a searchable, filterable view of all uploaded evidence across all events, with upload functionality and review/acceptance controls for managers.

---

## UI Layout

| Region | Description |
|---|---|
| Upload Zone | Drag-and-drop file upload area at the top |
| Evidence Kind Selector | Dropdown to classify the evidence type |
| Event Selector | Links the uploaded evidence to a specific event (`event_id`) |
| Evidence Filter Bar | Filter by event, kind, status (staged/submitted/accepted/rejected), date range |
| Evidence Table | Rows showing all evidence with metadata |
| Review Panel | Right-side panel for reviewing and accepting/rejecting staged evidence |

---

## Key Actions

- Upload evidence documents and link them to a specific event
- Filter the evidence list by event, type, or status
- Accept or reject pending (submitted) evidence (Manager/Admin role)
- Download any accepted evidence document
- View the full chain of evidence for a specific event

---

## Linked Workflows

Evidence is linked to events via `event_id`. Each event's `workflow_id` specifies what evidence kinds are required.

---

## Data Used

| Data | Source |
|---|---|
| Evidence documents | `regulatoryExecutionStore` + `/api/ecign/evidence` |
| Event list (for selector) | `autogenStore` |
| Acceptance state | `regulatoryExecutionStore` |
| Audit log | `enforcementStore` |

---

## Permissions

| Action | Required Role |
|---|---|
| Upload evidence | `coordinator`, `manager`, `admin` |
| Submit evidence for review | `coordinator`, `manager`, `admin` |
| Accept/reject evidence | `manager`, `admin`, `super_admin` |
| View all evidence | `manager`, `admin`, `super_admin`, `auditor` |
| Download evidence | All authenticated users |

---

## Audit Impact

All evidence operations generate audit log entries. Evidence once accepted is immutable and cannot be deleted.
