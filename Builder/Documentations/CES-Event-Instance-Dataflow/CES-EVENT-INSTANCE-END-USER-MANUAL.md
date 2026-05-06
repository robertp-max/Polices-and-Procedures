# CES Event Instance Dataflow — End User Manual

**Purpose:** This manual explains how to **execute compliance events** in the application: what you see in the event drawer, how **tasks**, **forms**, **evidence**, and **approvals** fit together, how **certification** works, and how the same work appears on the **CES board**. It is written for operators and leaders, not for developers.

**Important:** In the current demo deployment, your work is saved in **local browser storage** on your device unless your organization has enabled a remote API mode. Treat the app as the working system of record for the demo; for production, your administrator will confirm where data is persisted.

---

## 1. Concepts you need once

### 1.1 Source event vs event instance

- The **calendar / regulatory event** is the obligation your organization must satisfy (title, date, policies, workflow). Think of it as the **“what.”**
- The **event instance** is the **executable container** for that obligation on a specific occurrence: it has its own **Event ID** (often starting with `EVT-`) and a **folder path** (where the app logically groups files, tasks, and audit). Think of it as the **“execution folder.”**

You will see **both** the original calendar identifier and the **instance Event ID** in technical areas. For most day-to-day work, follow titles and dates; use the Event ID when matching records to exports or IT tickets.

### 1.2 Tasks

**Tasks** are the actionable checklist for the instance. They may come from:

- Workflow **process steps**
- **Required forms** not already covered by a step
- **Approvals** or signatures
- **Minutes** (when the event requires them)
- **Manual or generated** items added during execution

Each task has a **status** (for example Not started, In progress, Blocked, Awaiting signature, Completed). **Required** tasks must be satisfied (or properly cancelled with a reason, where your role allows) before the event can be certified.

### 1.3 Evidence

**Evidence** is any file or generated report that proves work was done. In this system, evidence is **always tied to a task** as well as to the event. If you upload evidence, you will select or confirm a **task** so auditors know **what requirement** the file satisfies.

### 1.4 Audit readiness score

The header shows an **Audit Readiness** percentage (0–100). It is a **composite indicator**: required tasks, required forms, evidence presence, and approvals. It helps you prioritize work before survey or internal audit; it is not a substitute for your organization’s formal compliance sign-off.

### 1.5 CES (Compliance Execution System) board

The **CES board** shows **execution units** — essentially **tasks** projected as cards for sprint-style management. Cards should trace back to the same event and task you see in the drawer. If you update a task or evidence in the drawer, the board view reflects that shared dataflow.

---

## 2. Opening an event

1. Go to the **Calendar** (or the surface your organization uses to open regulatory events).
2. Select an event to open the **event drawer** / **Workflow execution panel** on the side.
3. At the top of the panel, note:
   - **State** (for example On track, Blocked, Certified)
   - **Audit** badge
   - **Step** progress (current step vs total)
   - **SLA** and **Risk** indicators where shown

Below the title you should see a **line with the Event ID and folder path** (monospace text). Use this when you need an unambiguous reference for the instance.

---

## 3. Tab guide

### 3.1 Overview

Use **Overview** for the big picture: status, SLA, risk, and **Audit Readiness** percentage. Start here when triaging what to do next.

### 3.2 Tasks

The **Tasks** tab lists **all tasks** (derived from the event definition **plus** any your team added).

**What you can typically do** (subject to your role and whether the event is locked or certified):

- **Edit** task fields or status where permitted.
- **Complete** work by moving tasks through valid statuses (the app may block completion if required forms or evidence are missing — see messages on the task).
- **Soft delete** a task to hide it from default views; **restore** if it was removed in error.
- **Generate** tasks from a required form or workflow step when prompted (for example so evidence has a clear home task).

**Messages to watch for**

- **Blocked** — The task explains why (for example waiting on another team). Add a clear **blocked reason** if you are the one blocking it.
- **Completion blocked** — Often means a **required form** is not complete or **required evidence** is missing for that task type. Fix the underlying item, then retry.

**Required tasks**

Required tasks exist for compliance reasons. You generally **cannot remove** them without a documented reason, and you **cannot certify** the event while required work is incomplete.

### 3.3 Required Forms

The **Required Forms** tab lists forms mandated for this event.

- Open forms from here (your organization may open a **form viewer** in the same window or a new tab).
- **Generate a form instance** when you need an official instance tied to this event; the instance carries event id, policies, workflow, and folder metadata.
- The UI may show **which task** a form satisfies when that mapping exists.

### 3.4 Evidence

The **Evidence** tab groups uploads and generated documents **by task**.

- When **uploading**, you must associate the file with a **task** (the app may suggest one based on context).
- Evidence records carry technical metadata (size, type, checksum) used for integrity. You do not edit those after upload.

If you cannot upload, check: **Is the event certified?** Certified events block changes unless an administrator uses an override path.

### 3.5 Approvals

Use **Approvals** to see approval requests tied to the event (for example event-level or form-level). Complete your **approver** actions in line with policy. Missing approvals reduce **audit readiness** and can block certification.

### 3.6 Audit Trail

The **Audit Trail** tab shows **chronological** records of important actions: task changes, evidence, forms, certification, and so on.

Each entry is designed for **audit defensibility**: who/when/what changed, optional reason, and hash-chain fields for future backend verification. **Do not expect to delete audit rows** — no role should remove audit history.

### 3.7 Technical Details

**Technical Details** is for administrators and IT:

- **Event instance** metadata (ids, lock state, certification state)
- **Task source ids** (internal stable keys — use for support tickets, not for end-user labels)
- Generated form instances
- Raw audit data

If you are not comfortable with technical identifiers, you can ignore this tab for daily work.

---

## 4. Certification workflow

**Certification** means your organization formally attests that the event instance met requirements **as of that moment**.

**Before certifying**

1. Complete **required tasks** (or cancel with reason only where policy allows).
2. Complete **required forms** (or approved exceptions per policy).
3. Attach **evidence** where required (especially for approvals or generated task types that require proof).
4. Resolve **approvals** that the event marks as required.

**What happens when you certify**

- The instance becomes **locked** / **certified** in the execution model.
- The system captures a **certification snapshot**: tasks, form statuses, and key evidence fingerprints **at certification time**. That snapshot is meant to be **immutable** afterward.
- Further edits to tasks, forms, or evidence are **blocked** in normal operation to preserve audit integrity.

**If something was wrong after certification**

- Your organization’s policy governs **reopen** or **revoke certification** flows. Some environments allow only administrators to reopen with a **documented reason**. Follow your local policy, not only the software affordance.

---

## 5. Using the CES board and My Tasks

- **CES board cards** correspond to **tasks / execution units** for regulatory events. They should show the same underlying status as the **Tasks** tab for that event.
- **Audit readiness** may appear on cards as a shared score for the event context — use it to compare relative preparedness across units in a sprint.

When a card looks **blocked**, open the **same event** in the calendar drawer and read the **blocked** or **completion blocked** message on the task.

---

## 6. Roles (typical patterns)

Your organization maps application roles to job functions. Typical patterns:

| Role | Common actions |
|------|----------------|
| Clinician / staff | Complete assigned tasks, upload evidence, complete forms. |
| QAPI / committee lead | Drive meetings, minutes tasks, evidence for committee work. |
| DON / clinical leader | Approvals and certification for clinical/QAPI events (where permitted). |
| Compliance officer | Certify compliance events, review audit trail, coordinate remediation. |
| Administrator | Overrides for locked events **only with reason** where implemented; user assignments. |
| Auditor | Read-only review of tasks, evidence, and audit trail. |

**SuperAdmin / break-glass** behavior (if enabled) still requires **reasons** for overrides; it never deletes audit history.

---

## 7. Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Cannot complete a task | Read **completion blocked** text; complete linked **forms** or **evidence**. |
| Upload fails or is disabled | Event may be **certified** or **locked**; ask an admin if a legitimate correction is needed. |
| Task missing | Check **soft-deleted** tasks and **restore**; or generate from form/step. |
| Audit readiness stuck below 100% | Incomplete **required tasks**, **forms**, **evidence**, or **approvals** — use Overview + Tasks + Forms tabs to locate blockers. |
| CES card does not match drawer | Refresh; if persistent, report **source event id**, **EVT id**, and **task id** from Technical Details. |

---

## 8. Glossary (short)

| Term | Meaning |
|------|---------|
| **Regulatory event** | Source obligation from the calendar dataset. |
| **Event instance** | Executable occurrence with its own id and folder. |
| **Task** | Unit of work under the instance. |
| **Soft delete** | Hide task without destroying audit history; restorable. |
| **Certification snapshot** | Frozen picture of compliance state at certification. |
| **Audit trail** | Append-only style log of significant changes. |
| **Dataflow** | The merged “package” the UI and CES read for one event. |

---

## 9. Where to read more

- **Technical depth:** [CES-EVENT-INSTANCE-SYSTEM-DOCUMENTATION.md](./CES-EVENT-INSTANCE-SYSTEM-DOCUMENTATION.md)
- **Topic articles:** [knowledge-base/KB-INDEX.md](./knowledge-base/KB-INDEX.md)
- **AWS / production persistence:** `Builder/Documentations/AWS-CES/`
