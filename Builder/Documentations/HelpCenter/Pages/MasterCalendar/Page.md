# Page: Master Calendar

**Route:** `/calendar`  
**File:** `src/policy/pages/MasterCalendarPage.tsx`  
**Access:** All authenticated users (mutations require coordinator/manager/admin)

---

## Page Purpose

The Master Calendar is the central scheduling and event-tracking interface for all regulatory compliance events. It displays every scheduled event on a monthly grid, allows users to view event status at a glance, and provides access to the Event Workspace for each event.

---

## UI Layout

| Region | Description |
|---|---|
| Month Grid | Calendar grid showing the current month with event chips on each date |
| Month Navigation | Previous/next month arrows and current month/year label |
| Timeline Strip | Horizontal timeline below the grid showing events in sequence |
| Event Filter Bar | Filter by domain, event type, or audit state |
| Event Workspace Drawer | Slide-over workspace opened when clicking an event |
| SLA Indicators | Color-coded urgency on each event chip |

---

## Key Actions

- Navigate months using arrow buttons
- Click an event chip to open the Event Workspace
- Filter events by domain or type
- Push an event to Google Calendar using the sync button within the Event Workspace
- View event history and locked certification status

---

## Linked Workflows

Every event on the calendar is linked to a `workflow_id`. The workflow defines all steps required to complete the event. The calendar displays the event's current completion status relative to its workflow requirements.

---

## Data Used

| Data | Source |
|---|---|
| Scheduled events | `autogenStore` (generated) + `calendarStore` (overrides) |
| Event audit states | `regulatoryExecutionStore` + `enforcementStore` |
| Google Calendar sync state | `calendarSyncStore` |

---

## Permissions

| Action | Required Role |
|---|---|
| View calendar | All authenticated users |
| Open Event Workspace | `coordinator`, `manager`, `admin` |
| Override event schedule | `admin`, `super_admin` |
| Delete/cancel an event | `admin`, `super_admin` |

---

## Audit Impact

- Schedule overrides are logged to `calendarStore` with the actor and reason
- All overrides are blocked when Auditor Mode is active
- Event certification generates an immutable `EVENT_CERTIFIED` audit entry
