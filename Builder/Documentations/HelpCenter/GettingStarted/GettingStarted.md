# Getting Started — Care Indeed Policy Command Center

**Version:** 1.0  
**Audience:** All Users (Field Staff, Clinical Managers, Administrators, Compliance Officers)  
**Last Updated:** 2026-04-29  

---

## System Overview

The **Care Indeed Policy Command Center** (CI-ION) is the central platform used by Care Indeed Home Health Care, Inc. to manage all compliance policies, regulatory calendar events, evidence submissions, employee onboarding, and audit documentation.

The system is built around one governing principle: **every compliance action must be traceable, time-stamped, and verifiable**. This means that everything you do inside the platform — completing a task, uploading evidence, signing a form, approving a policy — is permanently recorded.

**What you can do in this system:**

| Capability | Who Uses It |
|---|---|
| Read and attest to policies | All staff |
| Complete compliance calendar tasks | Coordinators, Managers |
| Submit and review evidence | Field Staff, Clinical Managers |
| Sign electronic forms (eCIgn) | All staff requiring signatures |
| Track employee onboarding progress | HR, Supervisors |
| Manage policy lifecycle (Draft → Published) | Compliance Officers, Administrators |
| Review audit-ready compliance state | Administrators, Auditors |
| Manage users and roles | System Administrators |

---

## Key Concepts

### Tasks

A **Task** is a specific action that must be completed to fulfill a compliance requirement. Tasks are:

- Assigned to specific roles or individuals
- Tied to a regulatory event or policy
- Tracked with a status: `Not Started`, `In Progress`, `Completed`, `Overdue`
- Logged when completed — the record cannot be altered after the fact

Tasks appear in:
- Your personal task list (`/ces/my-tasks`)
- The Sprint Board (`/pm/sprint-plan`)
- The Global Task Drawer (accessible from any page via the task icon in the navigation)

---

### Events

An **Event** is a scheduled regulatory or compliance activity. Events are defined on the **Master Calendar** (`/calendar`) and include:

- **Governing Body Meetings** — quarterly or as-needed meetings of the agency's governing board
- **Quality Improvement (QAPI) Reviews** — monthly or quarterly structured quality reviews
- **Policy Review Cycles** — annual reviews of all active policies
- **Audit Preparation Windows** — pre-survey compliance readiness reviews
- **Incident Reviews** — triggered events following reportable incidents

Each event has:
- A unique `event_id` (e.g., `governing_body_meeting-20260514-01`)
- An associated `workflow_id` defining the steps to complete
- A due date and SLA (Service Level Agreement) window
- Required evidence that must be uploaded before the event can be certified

Events can be in the following states:
- `scheduled` — upcoming, no action started
- `in_progress` — work has begun
- `sla_warning` — approaching deadline
- `overdue` — past due date without completion
- `completed` — all steps done, evidence uploaded
- `certified_locked` — certified by the administrator, locked from further edits
- `blocked` — cannot proceed due to unresolved dependencies

---

### Workflows

A **Workflow** is a structured sequence of steps that defines how a compliance requirement is fulfilled. Each workflow:

- Has a unique `workflow_id`
- Is linked to one or more regulatory events
- Contains ordered steps with role assignments
- References the forms that must be completed
- Generates evidence artifacts upon completion

Example: The **Governing Body Meeting Workflow** (`GV-GB-001-WF`) includes steps such as:
1. Schedule the meeting and notify members
2. Prepare and distribute the agenda
3. Conduct the meeting and record attendance
4. Complete and sign meeting minutes
5. File minutes in the document system
6. Upload evidence and certify completion

Workflows enforce the **Upload → Validate → Promote → Evidence** lifecycle, ensuring evidence is reviewed before a task is considered complete.

---

### Evidence

**Evidence** is any document, record, or artifact that proves a compliance activity occurred. Evidence is:

- Uploaded through the Evidence Center (`/evidence`) or within an Event Workspace
- Tagged with the `event_id`, `workflow_id`, and `policy_id` it supports
- Immutable after upload — it cannot be deleted, only superseded
- Visible to auditors in Auditor Mode

Evidence types include:
- Meeting minutes (PDF, Word)
- Attendance rosters
- Signed acknowledgment forms
- Incident reports
- Training completion records
- Policy attestation logs

> **Important:** Evidence upload is the final step before certifying an event. You cannot lock an event without at least one accepted evidence document.

---

## Navigation Overview

The application uses a **sidebar navigation** that is always visible on the left side of the screen. Key navigation sections:

| Icon | Label | Route | Purpose |
|---|---|---|---|
| Grid | Dashboard | `/dashboard` | Overview of compliance status and urgent tasks |
| Book | Policy Library | `/library` | Browse all policies |
| Calendar | Master Calendar | `/calendar` | View and manage regulatory events |
| Shield | Audit Mode | `/audit` | Read-only auditor view |
| Upload | Evidence Center | `/evidence` | Upload and review evidence |
| List | Compliance Sprints | `/ces` | Sprint-based compliance execution |
| Tasks | My Tasks | `/ces/my-tasks` | Your assigned tasks |
| Users | Administration | `/admin/users` | User management (Admins only) |
| Brain | iAdministrator | `/iadministrator` | AI compliance assistant |

**Keyboard shortcut:** Press `?` anywhere in the app to open the keyboard shortcut reference.

---

## Completing Tasks

### Step 1: Find your task

Navigate to **My Tasks** (`/ces/my-tasks`) or open the **Global Task Drawer** by clicking the task icon in the top navigation bar.

### Step 2: Open the task

Click on a task card to open its detail view. The right-side panel will show:
- Task description and instructions
- Linked policy or event
- Required steps
- Any forms that need to be completed

### Step 3: Complete the required steps

Follow the instructions in the task. Steps may include:
- Reading and acknowledging a policy
- Completing a form (may require an electronic signature)
- Uploading a document as evidence
- Participating in a meeting and recording attendance

### Step 4: Mark as complete

Once all steps are finished, click **Mark Complete**. The system will:
1. Record your completion with a timestamp
2. Log the action to the audit trail
3. Notify any linked approvers if an approval is required
4. Update the event progress status

> **Note:** You cannot un-complete a task. If a task was completed in error, contact your supervisor or system administrator.

---

## Forms and eSign

### What is eCIgn?

**eCIgn** (Electronic Compliance Ignition) is the system's built-in electronic signature workflow. It is used to collect legally binding signatures on compliance documents such as:
- Employee acknowledgment forms
- Supervisor observation records
- OASIS assessment records
- Incident reports requiring dual signatures

### How to sign a form

1. Navigate to **Forms** (`/forms`) and locate the form you need to sign.
2. Click the form to open the **Form Signing Workspace**.
3. Review the document in full — you are legally attesting to its contents.
4. Type your name in the signature field or draw your signature.
5. Click **Sign and Submit**.
6. The system will:
   - Record your signature with a timestamp
   - Hash the document to ensure it cannot be altered after signing
   - Log the event to the audit trail
   - Notify the next signer if a multi-party signature is required

### Multi-party signatures

Some forms require signatures from multiple roles (e.g., Employee + Supervisor). The form will display the current signature stage and indicate who must sign next. You will receive a notification when it is your turn to sign.

---

## Compliance Tracking

### Dashboard Metrics

The **Dashboard** (`/dashboard`) provides a real-time view of your organization's compliance health:

- **Overdue Events** — events past their due date
- **SLA Warning** — events approaching their deadline (within 7 days)
- **Evidence Gaps** — events missing required evidence
- **Certified This Quarter** — count of events successfully certified

### Policy Lifecycle

Every policy moves through a defined lifecycle:

```
DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED
```

- **DRAFT:** Policy is being written or updated
- **REVIEW:** Policy is under review by designated reviewers
- **APPROVED:** Policy has been approved but not yet published
- **PUBLISHED:** Policy is live and enforceable
- **ARCHIVED:** Policy is no longer active (kept for audit history)

You can track policy lifecycle status in the **Policy Lifecycle** page (`/policy-lifecycle`).

---

## Common Mistakes

| Mistake | Impact | Prevention |
|---|---|---|
| Uploading evidence to the wrong event | Evidence cannot be moved — it will appear unlinked | Always verify the event name before uploading |
| Signing a form without reading it fully | Legally binding — signature is permanent | Read every section before signing |
| Marking a task complete before the form is signed | System may allow it but evidence will be flagged as incomplete | Complete forms before marking tasks done |
| Ignoring SLA warnings | Event becomes overdue, which creates a compliance gap | Set personal reminders when you see yellow SLA warnings |
| Logging in on a shared computer without logging out | Other users may act under your identity | Always click **Log Out** in the sidebar when finished |

---

## Security Best Practices

### Your Account

- Use a **strong, unique password** — at least 12 characters, mix of letters, numbers, and symbols.
- **Do not share your login credentials** with anyone, including supervisors.
- If you suspect your account has been compromised, contact your system administrator immediately.
- Your account session expires after a period of inactivity. You will be prompted to log in again.

### PHI (Protected Health Information)

- Do not enter or upload patient identifying information into task descriptions, form comments, or evidence notes.
- Evidence documents containing PHI must follow your organization's PHI handling procedures before upload.
- Every access to PHI-tagged resources is logged and monitored.

### Auditor Mode

- Auditor Mode (`/audit`) is a **read-only** view. No changes can be made while in Auditor Mode.
- If you accidentally enter Auditor Mode, toggle it off using the shield icon in the navigation bar.
- Toggling Auditor Mode on or off is itself logged in the audit trail.

### Reporting Security Issues

Contact your system administrator if you notice:
- Unexpected login activity
- Records that appear to have been altered
- Permissions granted that should not be accessible
- System errors that expose internal data

---

## Getting Help

- **In-app Help Center:** Click the `?` icon in the navigation sidebar to open the Help Center.
- **iAdministrator:** Navigate to `/iadministrator` for AI-assisted compliance guidance.
- **System Administrator:** Contact your designated system admin for account and permission issues.
- **Compliance Officer:** Contact your compliance officer for policy or regulatory questions.

---

*This document is part of the Care Indeed Policy Command Center Help Center. All system behavior described herein reflects the production system as of 2026-04-29.*
