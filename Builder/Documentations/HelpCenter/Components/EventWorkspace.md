# Component: EventWorkspace

**File:** `src/policy/components/regulatory/EventWorkspace.tsx`  
**Type:** Feature Component (Full-page Panel)  
**Used On:** Master Calendar (`/calendar`), Audit Mode (`/audit`)

---

## Overview

`EventWorkspace` is the primary workspace for executing a single regulatory compliance event. It renders the event's full detail — workflow steps, evidence panel, approval flow, blockers, and lock state — in a single integrated view. It is the core execution surface for compliance coordinators.

---

## UI Breakdown

| Region | Description |
|---|---|
| Event Header | Event name, `event_id`, due date, current audit state badge |
| Workflow Steps Panel | Ordered list of steps with completion checkboxes and role labels |
| Evidence Panel | Upload zone plus list of previously submitted evidence documents |
| Approval Flow | Multi-stage approval controls (Submit for Approval → Approve / Reject) |
| Blocker Panel | Displays any unresolved blockers with descriptions and resolution paths |
| Lock Badge | Shown when the event is in `certified_locked` state — all editing is disabled |
| Action Bar | "Certify Event" button (enabled only when all steps complete and evidence accepted) |

---

## User Actions

- Check off individual workflow steps as complete
- Upload evidence documents (PDF, image, Word)
- Submit the event for approval
- Approve or reject pending approvals (requires Approver role)
- Resolve blockers
- Certify and lock the event (requires Administrator role)

---

## System Behavior

1. **Step completion:** Each step state is written to `regulatoryExecutionStore` under the event's `event_id`. Step completion is append-only — once marked complete, it cannot be undone.
2. **Evidence upload:** Files are staged to the evidence queue and linked to the event via `event_id`. Accepted evidence is immutable.
3. **Approval flow:** When submitted for approval, the event state transitions to `pending_approval`. Approvers receive a notification. Rejection returns the event to `in_progress` with a rejection reason logged.
4. **Certification:** When all steps are complete and all evidence is accepted, an Administrator can certify the event. This sets `certified_locked = true` in `enforcementStore` and writes an audit entry.
5. **Lock enforcement:** When `certified_locked = true`, all step checkboxes, evidence upload controls, and approval buttons are disabled. The Lock Badge is displayed.

---

## Data Flow

| Data Element | ID Type | Store / API |
|---|---|---|
| Event definition | `event_id` | `autogenStore` / `calendarStore` |
| Workflow steps | `workflow_id` | `regulatoryExecutionStore` |
| Step completion state | `event_id` + step index | `regulatoryExecutionStore` |
| Evidence documents | `event_id` | `regulatoryExecutionStore` + server `/api/ecign` |
| Approval state | `event_id` | `regulatoryExecutionStore` |
| Lock state | `event_id` | `enforcementStore` |
| Audit entries | `event_id`, `workflow_id`, actor | `enforcementStore` audit log |

---

## Permissions & Roles

| Action | Required Role |
|---|---|
| View event workspace | `coordinator`, `manager`, `admin`, `super_admin`, `auditor` |
| Complete workflow steps | `coordinator`, `manager`, `admin` |
| Upload evidence | `coordinator`, `manager`, `admin` |
| Approve / reject | `manager`, `admin`, `super_admin` |
| Certify and lock | `admin`, `super_admin` |
| View in Auditor Mode | All roles (read-only) |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Upload file exceeds size limit | Error message shown inline; file rejected |
| Attempting to certify with incomplete steps | "Certify" button is disabled; tooltip explains what is missing |
| Approval submitted but approver is unavailable | Event remains in `pending_approval`; escalation timer starts |
| Lock state mismatch (e.g., concurrent edit) | `enforcementStore` enforces lock; UI shows "Event is locked" message |

---

## Audit & Compliance Impact

Every action taken in the EventWorkspace generates an audit entry in `enforcementStore`:

| Action | Audit Action Code | Notes |
|---|---|---|
| Step marked complete | `STEP_COMPLETE` | Includes step index, actor, timestamp |
| Evidence uploaded | `EVIDENCE_UPLOAD` | Includes file name, kind, actor |
| Evidence accepted | `EVIDENCE_ACCEPTED` | Includes reviewer, timestamp |
| Approval submitted | `APPROVAL_SUBMITTED` | Includes actor, event state |
| Approval granted | `APPROVAL_GRANTED` | Includes approver, timestamp |
| Approval rejected | `APPROVAL_REJECTED` | Includes reason, approver |
| Event certified | `EVENT_CERTIFIED` | Includes actor, full event snapshot |
| Lock applied | `EVENT_LOCKED` | Includes `event_id`, timestamp |

All audit entries are hash-chained and append-only. They cannot be deleted or modified.

---

## Dependencies

- `regulatoryExecutionStore` — step and evidence state
- `enforcementStore` — audit log and lock state
- `autogenStore` / `calendarStore` — event definitions
- `auditorModeStore` — disables all controls in read-only mode
- `EvidencePanel` — evidence upload sub-component
- `ApprovalFlow` — approval sub-component
- `WorkflowExecutionPanel` — step list sub-component
- `BlockerPanel` — blocker display sub-component
- `LockBadge` — lock state indicator

---

## Known Issues / Gaps

- **GAP:** There is no email notification sent when an event approaches its SLA deadline — only in-app notifications are generated.
- **GAP:** Evidence upload does not validate file content (e.g., confirming it is a legitimate minutes document vs. a placeholder file). Content validation is a manual process.
- **GAP:** Rejection reason is logged but is not displayed in the event history for staff-level users — only admins can view the full rejection log.
