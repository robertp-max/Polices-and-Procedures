# Administrator Guide

**Audience:** Agency Administrators, Compliance Officers, IT Admins  
**Scope:** Managing users, roles, workflows, policy lifecycle, audit oversight

---

## Table of Contents

1. [Administrator Roles Reference](#1-administrator-roles-reference)
2. [User Management](#2-user-management)
3. [Managing Policy Lifecycle](#3-managing-policy-lifecycle)
4. [Managing Compliance Events](#4-managing-compliance-events)
5. [Managing Evidence and Approvals](#5-managing-evidence-and-approvals)
6. [Managing Form Instances and Signatures](#6-managing-form-instances-and-signatures)
7. [Audit Mode and Risk Monitoring](#7-audit-mode-and-risk-monitoring)
8. [Escalation Handling](#8-escalation-handling)
9. [iAdministrator: AI Compliance Queries](#9-iadministrator-ai-compliance-queries)
10. [Compliance Execution Sprints (CES)](#10-compliance-execution-sprints-ces)
11. [Hubstaff Integration](#11-hubstaff-integration)
12. [CEU Management](#12-ceu-management)
13. [System Health and Chain Integrity](#13-system-health-and-chain-integrity)

---

## 1. Administrator Roles Reference

| Role | Key Capabilities |
|---|---|
| `staff` | View assigned events, complete tasks, upload evidence, sign forms |
| `coordinator` | All staff + submit events for approval, create evidence, view clinical events |
| `manager` | All coordinator + approve/reject evidence, approve events, view all events |
| `admin` | All manager + manage users, void forms, manage policy lifecycle, access audit mode |
| `super_admin` | All admin + system configuration, force-unlock events, chain verification |
| `auditor` | Read-only access to all audit logs, chain verification, risk scores |

> **Note:** Role assignments are set in the `AdminIdentity` page (`/admin`) and stored in user records.

---

## 2. User Management

**Accessing User Management:**  
Navigate to **Admin** in the sidebar → **Identity Management** tab.

### Inviting a New User

1. Click **Add User**
2. Enter the user's email, first name, last name, and role
3. Click **Send Setup Link**
4. The user receives an email with an account setup link (expires in 72 hours)
5. If the link expires: find the user in the user list and click **Resend Setup Link**

### Changing a User's Role

1. Find the user in the user list
2. Click the user's row to open their profile
3. Select the new role from the **Role** dropdown
4. Click **Save** — the change takes effect immediately on the user's next page load

### Deactivating a User

1. Find the user and open their profile
2. Click **Deactivate Account**
3. Confirm the action
4. The user's session is invalidated immediately and they cannot log in

> Deactivated users' audit records are preserved — audit history is never deleted.

### Resetting a User's Password

1. Find the user in the user list
2. Click **Send Password Reset**
3. An email is sent to the user with a reset link

---

## 3. Managing Policy Lifecycle

**Accessing Policy Management:**  
Navigate to **Policy Library** → click a policy → **Lifecycle** tab.

### Lifecycle States

```
DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED
```

| Transition | Who Can Trigger | Notes |
|---|---|---|
| DRAFT → REVIEW | Policy author | Submits for review |
| REVIEW → APPROVED | `admin`, `super_admin` | Approval of content |
| REVIEW → DRAFT | `admin`, `super_admin` | Returns for revision |
| APPROVED → PUBLISHED | `admin`, `super_admin` | Makes policy effective |
| PUBLISHED → ARCHIVED | `admin`, `super_admin` | Supersede with new version |

### Publishing a Policy

1. Find the policy in `APPROVED` state
2. Click **Publish Policy**
3. Set the **Effective Date** (defaults to today)
4. Click **Confirm Publish**
5. The policy is now visible to all staff in the Policy Library

### Archiving a Policy

1. Navigate to the policy in `PUBLISHED` state
2. Click **Archive**
3. Provide a reason (required)
4. If a new version exists, select the replacement policy
5. Click **Confirm Archive**

### All lifecycle transitions are logged to the audit chain — they cannot be reversed without creating an audit record.

---

## 4. Managing Compliance Events

**Accessing Events:**  
Navigate to **Calendar** → select an event.

### Creating an Event Manually

1. Click **+ Add Event** on the Calendar page
2. Fill in: Event Type, Scheduled Date, Assigned Staff, Workflow
3. Click **Save** — the event appears on the calendar

### Reassigning an Event

1. Open the event's Event Workspace
2. Click **Reassign** (admin/manager only)
3. Select the new assignee
4. The previous assignee is notified and loses task access

### Blocking and Unblocking Events

Events can become **blocked** when:
- A dependency event is not completed
- A required approval is outstanding
- The event is manually placed on hold by an admin

**To manually unblock an event:**
1. Open the event workspace
2. Click **Override Block** (requires `super_admin`)
3. Provide a justification (required — logged to audit)
4. The event unblocks and audit log records the override

### Certifying a Completed Event

1. Verify all steps are complete (progress bar = 100%)
2. Verify all evidence is accepted
3. Verify approval has been granted
4. Click **Certify Event**
5. Event status changes to `certified_locked` — no further changes permitted

---

## 5. Managing Evidence and Approvals

### Reviewing Submitted Evidence

1. Open an event's Event Workspace → **Evidence Panel**
2. Submitted evidence appears in the **Pending Review** queue
3. Click a document to preview
4. Click **Accept** or **Reject**
5. If rejecting: enter a rejection reason (required — shown to submitter)

### Batch Evidence Review

On the **Evidence Center** page (`/evidence`):
1. Use filters to find submitted, pending evidence
2. Select multiple documents using checkboxes
3. Click **Bulk Accept** or **Bulk Reject**

### Approving a Submitted Event

When all steps and evidence are complete:
1. The coordinator submits the event for approval
2. You receive a notification: "Approval Required"
3. Navigate to the event workspace
4. Review the completion summary
5. Click **Approve** or **Return for Revision**

---

## 6. Managing Form Instances and Signatures

### Viewing Form Instances

Navigate to **Forms** → **Instances** tab to see all active form signing instances with their status.

### Voiding a Form Instance

If a form was signed incorrectly or must be redone:

1. Find the form instance
2. Click **Void Instance**
3. Enter a void reason (required)
4. Click **Confirm Void**

> **Important:** Voiding does not delete the original signatures — they remain in the audit chain permanently, marked as voided. A new instance must be created if a corrected signature is needed.

### Downloading a Signed Form PDF

1. Find the completed form instance
2. Click **Download PDF**
3. The PDF includes signature data, timestamps, and document hash

---

## 7. Audit Mode and Risk Monitoring

**Accessing Audit Mode:**  
Navigate to **Audit Mode** in the sidebar (requires `admin`, `super_admin`, or `auditor` role).

### Understanding the Risk Score

The system computes a risk score (0-100) for the overall compliance posture:

| Risk Driver | Weight |
|---|---|
| Overdue events | 30% |
| Evidence gaps | 25% |
| SLA warnings (7-day) | 20% |
| Blocked events | 15% |
| Uncertified events | 10% |

**Score interpretation:**
- 0-20: Low risk (Green)
- 21-40: Moderate risk (Yellow)
- 41-60: Elevated risk (Orange)
- 61-100: Critical risk (Red)

### Audit State Machine

Each event progresses through these states:

```
scheduled → in_progress → sla_warning (7d) → sla_urgent (3d) → overdue
                       ↓
                   blocked (if dependency not met)
                       ↓
               certified_locked (final state)
                       ↓
               grace_period (post-overdue certification window, 3d)
```

### Using the Audit Event Log

1. Click **View Audit Log** in Audit Mode
2. Filter by: event_id, policy_id, workflow_id, actor, date range, action type
3. Each entry shows: action, actor, timestamp, hash
4. Click **Verify Chain** to confirm hash chain integrity for a specific event

---

## 8. Escalation Handling

Escalated events appear in the **Escalation Queue** on the Audit Mode page.

### When Events Escalate

Events automatically escalate when:
- They reach `overdue` state with no certification in sight
- An evidence item has been rejected multiple times
- A form void occurs on a certified workflow

### Handling an Escalation

1. Click the escalation item to open it
2. Review the escalation details and history
3. Take action: assign to a new person, extend deadline (if policy allows), or manually certify with justification
4. Record your escalation response (required — logged to audit)
5. Mark the escalation as **Resolved** once addressed

---

## 9. iAdministrator: AI Compliance Queries

The iAdministrator page (`/iadministrator`) provides AI-assisted compliance query support using a local RAG (Retrieval-Augmented Generation) pipeline.

### Using iAdministrator

1. Navigate to **iAdministrator** in the sidebar
2. Type your compliance question in natural language (e.g., "What are the OSHA review requirements for home health?")
3. The AI returns an answer grounded in your agency's loaded policy content
4. Sources shown at the bottom reference the exact policy sections used

### What iAdministrator Can Do

- Answer questions about policy requirements
- Look up which events are required for a given domain
- Explain specific compliance obligations
- Retrieve regulatory citations

### What iAdministrator Cannot Do

- Make binding compliance decisions on your agency's behalf
- Update or create policy records
- Access real-time event statuses

> iAdministrator responses are advisory only. Always verify critical compliance decisions against the primary source.

---

## 10. Compliance Execution Sprints (CES)

Compliance Execution Sprints provide a sprint-based project management overlay for compliance work.

**Accessing CES:**  
Navigate to **Compliance Sprints** in the sidebar.

### Creating a Sprint

1. Click **New Sprint**
2. Enter a sprint name, start date, end date, and scope (select events/tasks to include)
3. Click **Create Sprint**

### Sprint Board

The sprint board shows tasks in Kanban columns: **Backlog → In Progress → Done**

- Drag tasks between columns
- Click a task for details and assignment
- Monitor sprint progress on the sprint summary bar

### Sprint Review

At the end of a sprint, navigate to **Sprint Review** to:
- See completed vs. incomplete tasks
- Document notes
- Mark the sprint as closed

---

## 11. Hubstaff Integration

The Hubstaff integration allows time-tracking data from Hubstaff to be associated with compliance activities.

**Accessing:** Navigate to **Admin → Hubstaff** (or via the API at `/api/hubstaff`).

### What It Tracks

- Time entries associated with specific compliance events
- Staff hours logged against workflow tasks

### Configuration

Hubstaff integration requires an API key configured in the server environment. Contact your IT admin to configure the `HUBSTAFF_API_KEY` server environment variable.

---

## 12. CEU Management

CEU (Continuing Education Unit) management is accessible via the `/api/ceu` endpoints and the CEU UI.

### Assigning CEUs

1. Navigate to **Admin → CEU Assignments**
2. Click **Assign CEU**
3. Select the staff member, CEU course, and completion deadline
4. Click **Save Assignment**

### Tracking Completion

The CEU dashboard shows:
- Assigned CEUs per staff member
- Completion status (Assigned, In Progress, Completed, Overdue)
- Completion dates and certificates

### Marking Completion

Staff self-report completion; admins can also manually mark completion:
1. Find the assignment
2. Click **Mark Complete**
3. Optionally attach a completion certificate
4. Click **Save**

---

## 13. System Health and Chain Integrity

### Verifying Audit Chain Integrity

1. Navigate to **Audit Mode** → **Chain Verification**
2. Select the entity type and entity ID to verify
3. Click **Verify**
4. A valid chain returns: `{ isValid: true, chainLength: N }`
5. A broken chain returns the exact sequence number where the break was detected

> **A broken chain indicates tampering or data corruption** — escalate immediately to your system administrator and compliance officer.

### Environment Configuration

Key environment variables (configured by IT Admin):

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Signs access tokens — must be at least 64 characters, random |
| `DATABASE_URL` | PostgreSQL/SQLite connection string |
| `DYNAMODB_TABLE` | DynamoDB table name for audit records |
| `S3_BUCKET` | S3 bucket for evidence file uploads |
| `COGNITO_USER_POOL_ID` | AWS Cognito user pool for authentication |
| `COGNITO_CLIENT_ID` | AWS Cognito app client ID |
| `HUBSTAFF_API_KEY` | Hubstaff integration API key |

### Session and Token Management

- Access tokens expire after 15 minutes
- Refresh tokens extend sessions silently in the background
- Users are logged out after 60 minutes of inactivity (configurable)
- HTTP-only, Secure, SameSite=Strict cookies — XSS-protected

### Backup and Recovery

- DynamoDB audit tables: Point-in-time recovery enabled (recommended)
- S3 evidence bucket: Versioning enabled (recommended)
- Application state (Zustand/localStorage): Not backed up — client-local only
