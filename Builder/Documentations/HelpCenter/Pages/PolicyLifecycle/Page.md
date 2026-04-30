# Page: Policy Lifecycle

**Route:** `/policy-lifecycle`, `/policy-lifecycle/:policyId`  
**File:** `src/policy/pages/PolicyLifecyclePage.tsx`  
**Access:** `manager`, `admin`, `super_admin`, `compliance_officer`

---

## Page Purpose

The Policy Lifecycle page is the workspace for managing a policy through its formal DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED state machine. It provides lifecycle tracking, review comment management, approval controls, and publication actions.

---

## UI Layout

| Region | Description |
|---|---|
| Policy Selector | Search and select a policy to manage |
| Lifecycle Status Bar | Visual state machine showing current state and allowed transitions |
| Policy Content Panel | Full policy text (editable in DRAFT state, read-only otherwise) |
| Review Comments Panel | Threaded review comments with resolution status |
| Approval Controls | Submit for Review, Approve, Reject, Publish buttons |
| History Timeline | Chronological history of all lifecycle transitions |

---

## Key Actions

- Submit a DRAFT policy for Review
- Add review comments on a policy under review
- Approve or reject a policy under review
- Publish an approved policy
- Archive a published policy
- View the full transition history

---

## Lifecycle State Machine

```
DRAFT → REVIEW → APPROVED → PUBLISHED
                    ↓
            REVISION_REQUESTED → DRAFT
                    ↓
               REJECTED → DRAFT
PUBLISHED → ARCHIVED
```

---

## Data Used

| Data | Source |
|---|---|
| Policy lifecycle envelope | `lifecycleStore` |
| Review comments | `reviewStore` |
| Approval decisions | `lifecycleStore` |
| Transition history | `lifecycleStore.history[]` |

---

## Permissions

| Action | Required Role |
|---|---|
| Submit for Review | `manager`, `admin` |
| Add review comments | `reviewer`, `manager`, `admin` |
| Approve policy | `admin`, `super_admin` |
| Publish policy | `admin`, `super_admin` |
| Archive policy | `super_admin` only |

---

## Audit Impact

Every lifecycle transition is logged to `enforcementStore` with `policy_id`, actor, from-state, to-state, and timestamp. Transitions cannot be reversed through normal UI — only `super_admin` override is possible.
