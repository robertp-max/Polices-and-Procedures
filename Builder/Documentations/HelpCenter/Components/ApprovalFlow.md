# Component: ApprovalFlow

**File:** `src/policy/components/regulatory/ApprovalFlow.tsx`  
**Type:** Feature Sub-component  
**Used On:** EventWorkspace, PolicyLifecyclePage

---

## Overview

`ApprovalFlow` manages the multi-stage approval process for both regulatory events and policy lifecycle transitions. It enforces role-based approval authority and maintains a complete audit log of all approval decisions.

---

## UI Breakdown

| Region | Description |
|---|---|
| Current Stage Indicator | Shows which approval stage is active (e.g., "Clinical Manager Approval") |
| Approver Role Label | Identifies who must approve at this stage |
| Approve Button | Green — available only to the user holding the required role |
| Reject Button | Red — requires entering a rejection reason |
| Approval History | Timeline of past approval stages with decision, approver name, and timestamp |
| Pending Indicator | Spinner shown while approval is awaiting action |

---

## User Actions

- Approve the current stage (if you hold the required role)
- Reject the current stage with a mandatory reason
- View the full approval history

---

## System Behavior

1. On approval: Stage transitions to `approved`, approval decision is logged, and the next stage (if any) is activated
2. On rejection: Object (event or policy) is returned to `in_progress`, rejection reason is logged, submitter is notified
3. Final approval: When all stages are complete, the object transitions to its final state (event → `pending_certification`; policy → `APPROVED`)
4. Approval decisions are written to `regulatoryExecutionStore` (events) or `lifecycleStore` (policies)

---

## Data Flow

| Data Element | ID Type | Source / Destination |
|---|---|---|
| Event approval state | `event_id` | `regulatoryExecutionStore` |
| Policy approval state | `policy_id` | `lifecycleStore` |
| Approval decision | `event_id` or `policy_id`, actor | `enforcementStore` audit log |
| Approver notification | `user_id` | `notificationStore` |

---

## Permissions & Roles

| Approval Body | Required Role |
|---|---|
| Clinical Manager Approval | `clinical_manager`, `manager` |
| Administrator Approval | `admin`, `super_admin` |
| Governing Body Approval | `super_admin` |
| QA Officer Approval | `qa_officer`, `admin` |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Approval submitted by wrong role | Button disabled and tooltip shows required role |
| Double-approval attempt | Second submission rejected; "Already approved" message shown |
| Rejection without reason | Form validation prevents submission |

---

## Audit & Compliance Impact

| Event | Audit Code | Notes |
|---|---|---|
| Approval granted | `APPROVAL_GRANTED` | Stage, approver, `event_id` or `policy_id`, timestamp |
| Approval rejected | `APPROVAL_REJECTED` | Reason, stage, approver, timestamp |
| Approval stage escalated | `APPROVAL_ESCALATED` | Escalation reason, timestamp |

---

## Dependencies

- `regulatoryExecutionStore` — event approval state
- `lifecycleStore` — policy approval state
- `enforcementStore` — audit logging
- `notificationStore` — approver and submitter notifications

---

## Known Issues / Gaps

- **GAP:** There is no escalation timer — if an approver does not respond, the event stays in `pending_approval` indefinitely without automatic escalation.
- **GAP:** The approval history timeline does not display the rejection reason for staff-level users, only for managers and above.
