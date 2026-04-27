# CES End-User Manual

> **Audience:** Compliance Officer, Administrator, Clinical Manager, HR
> Director, Privacy Officer, and any role assigned execution units in the
> Compliance Execution Sprint System (CES).
> **Version:** 2026.04 — aligned with the Audit Workflow Catalog (32 audits)
> and the canonical event ID format.

---

## 1. What CES Is (and Is Not)

**CES is your daily compliance work surface.** It tells you what you owe,
when, with what evidence, and routes it for signature when you are done.

**CES is not** a project tracker, a to-do list, or an inbox. You cannot add
arbitrary items to a sprint. Every item on your board comes from a
regulatory event on the calendar.

| You can | You cannot |
|---|---|
| Pick up a unit assigned to you and complete its phase | Skip a phase |
| Reassign your unit to another qualified owner | Mark a unit complete without evidence |
| Mark a unit blocked with a reason | Add a unit not tied to a regulatory event |
| Sign units routed to you in eCIgn | Approve your own signature requirement |

---

## 2. Logging In and Landing

After login the **CES Dashboard** opens at `/ces/dashboard`. From the left
rail you can move to:

| Menu | What it does |
|---|---|
| **Dashboard** | Sprint health: completion %, audit readiness score, blockers, deadlines. |
| **Calendar** | Month-grid view of every regulatory event. |
| **Sprint Board** | The 6-column board of all execution units in the active sprint. |
| **Workflows** | Library of all defined workflows (browse-only). |
| **Master Controls** | The CTRL-NNN inventory — your control register. |
| **Audit Mode** | Survey-readiness review of every event. |
| **Evidence Center** | Upload, view, and download evidence files. |
| **Reports** | Sprint-over-sprint KPI charts. |

---

## 3. Your Day in CES (Recommended Routine)

### 3.1 Morning (5 minutes)

1. Open **Dashboard**. Confirm the **Audit Readiness Score** is ≥ 85. If
   not, scroll to the Risk Heatmap and identify the contributing domain.
2. Click **Upcoming Deadlines**. Anything due in the next 48 hours that
   you own is your first priority.

### 3.2 Working a Unit (Sprint Board)

1. Open **Sprint Board** (`/ces/board`).
2. Use the swimlane view (grouped by parent event) to find your work.
3. Click your unit. The detail drawer opens.
4. Review the **Workflow Phase** badge. The phase determines what you do:
   - **Preparation** → assemble inputs (sample list, prior audit, data pull).
   - **Documentation** → complete the form(s) listed under "Required Forms."
   - **Review** → confirm the prior phase output is correct, mark reviewed.
   - **Signature** → route to eCIgn (button at top of drawer).
   - **Audit** → file evidence in the Evidence Center.
5. When all required forms are complete and (if required) signatures
   captured, click **Mark Complete**. The system validates and either
   advances state or shows you what is missing.

### 3.3 End of Day

- If anything is blocked, set the **Blocked Reason** before you log off.
  Unflagged blockers count against your sprint metrics on Day 14.

---

## 4. The 5 Workflow Phases (What Each Means to You)

Every unit moves through these phases in order. You **cannot skip**.

| Phase | What you do | When the system advances you |
|---|---|---|
| Preparation | Pull source data; complete prep checklist. | When the prep form is saved. |
| Documentation | Fill in the substantive forms (audit scoring, minutes, report). | When all `requiredForms` are saved. |
| Review | Confirm the documentation is accurate; flag for revision if not. | When you mark "Reviewed." |
| Signature | Route to eCIgn; signers receive email + in-app notice. | When all required signers have signed. |
| Audit | File the final artifact in the Evidence Center. | When the file is uploaded and tagged with `event_id`, `policy_id`, `workflow_id`. |

If a phase tries to advance and is missing something, the drawer shows a
red "Cannot advance" banner listing exactly what is missing.

---

## 5. The 6 Sprint Board Columns

| Column | Meaning |
|---|---|
| **Upcoming** | Not yet in scope for this sprint. Read-only. |
| **Ready** | In scope, all prerequisites met, you can start. |
| **In Progress** | Active execution. Forms are being filled. |
| **Awaiting Signature** | Documentation done; routed to signers. SLA clock is running. |
| **Blocked** | Halted. The blocked reason is shown on the card. |
| **Completed** | Done, signed, filed. Read-only. |

You can **drag a card** between columns only along legal transitions. The
system snaps illegal moves back and shows a brief warning.

---

## 6. Calendar (`/calendar?view=sprint`)

The calendar is your month-by-month view of every regulatory event.

- **Color = state**, not category. Red = critical/overdue. Amber = due
  soon. Teal = scheduled.
- Click any event chip → the right-hand **Execution Panel** opens for that
  event.
- The execution panel lists: required forms, required signatures,
  upstream dependencies, downstream "feeds" events, and the current
  compliance state.
- Use the chevron buttons to move between months. The active sprint
  window is highlighted in the date header.

---

## 7. Audit Mode (`/audit`) — Survey Readiness

Audit Mode is where you prove the agency is ready for survey.

### 7.1 Quick Filters (12 chips)

| Chip | Use it when |
|---|---|
| All | Browsing everything. |
| July Readiness | Preparing for the July survey window. |
| Not Certifiable | Triaging items that cannot be certified yet. |
| Missing Evidence | Process complete, paperwork missing. |
| Pending Approval | Waiting on an approval decision. |
| Overdue | Past due, not yet certified. |
| Ready to Certify | All evidence present — your certify-and-lock list. |
| Certified | Locked records (read-only). |
| Governance | Governance domain only. |
| QAPI | QAPI domain only. |
| Billing Critical | Billing-related items with high audit risk. |
| Survey Critical | Items a surveyor will look at first. |

### 7.2 Detail Tabs (per event)

`Summary · Missing Items · Evidence · Approvals · Timeline · Dependencies · Audit Trail`

The **Missing Items** tab is your fastest path to closing a gap.

### 7.3 Exports

- **Export Markdown** — full audit bundle.
- **Export JSON** — same data, machine-readable.
- **Export Survey Packet** — printable survey-ready packet for the
  selected event (Markdown + HTML).

---

## 8. Evidence Center (`/evidence`)

Every audit, signature, minutes file, training record — anything that
proves a control was executed — lives here.

### 8.1 Required Tagging (No Exceptions)

Every upload **must** carry three identifiers:

- `event_id` (canonical: `{eventSubType}-{YYYYMMDD}-{NN}`)
- `workflow_id`
- `policy_id`

Optionally, `form_id` for form-specific documents.

If you do not have these IDs, copy them from the Sprint Board card or the
event's Calendar entry.

### 8.2 Status Lifecycle

```
PENDING_UPLOAD → UPLOADED → VALIDATED → PROMOTED → APPROVED_EVIDENCE → SIGNED
                                                               ↓
                                                            FAILED (any step)
```

You generally upload through the **Upload** button on the Sprint Board
card. Manual uploads in Evidence Center are allowed but require you to
fill the three IDs by hand.

### 8.3 Deep Links

You can share a direct link to an evidence file:

```
/evidence?event_id=<id>&evidence_id=<uuid>
```

The page auto-loads, filters, and selects the file.

---

## 9. The 32 Audits — What You Will See on the Board

| Domain | Count | Frequency Mix |
|---|---|---|
| Clinical | 18 | All monthly |
| Compliance | 7 | 1 monthly · 5 quarterly · 1 annual |
| HR | 4 | 3 monthly · 1 quarterly |
| Risk / Safety | 3 | 1 monthly · 1 quarterly · 1 annual |

Each audit is a **workflow**, not a one-off task. Every month you will see
the clinical 18 plus the relevant compliance/HR/risk audits for that month.

If an audit fails, a **Corrective Action Plan** unit auto-appears in the
next sprint, linked to the failed audit.

---

## 10. The 8 Recurring Units (R1–R8)

Every sprint includes 8 system-generated recurring units. You don't
schedule these; they appear automatically.

| Code | What it covers |
|---|---|
| R1 | Weekly compliance review |
| R2 | Audit chain verification |
| R3 | Overdue resolution sweep |
| R4 | Signature follow-up sweep |
| R5 | Risk review |
| R6 | Carry-over audit |
| R7 | Evidence index sync (system) |
| R8 | Sprint metrics rollup (system) |

R7 and R8 require no human action; they will appear pre-completed by
sprint end.

---

## 11. Signatures (eCIgn)

When a unit reaches the **Signature** phase:

1. Click **Send for Signature** on the drawer.
2. Confirm the signer roster (preselected from the workflow definition).
3. Signers receive an email and an in-app notice.
4. The unit moves to **Awaiting Signature** column.
5. The SLA clock starts. If escalation hours expire, the
   **Signature SLA Missed** counter increments on the Dashboard.

You can **resend** a signature request from the unit drawer if a signer is
delayed.

---

## 12. Blocking and Unblocking

To block:

1. Open the unit drawer.
2. Click **Mark Blocked**.
3. Choose a reason: missing signature, missing form, dependency
   incomplete, or awaiting external input.
4. (Optional) link the resource ID causing the block.

To unblock:

- The system auto-unblocks when the reason resolves (e.g., the missing
  form is uploaded).
- You can also manually move the card back to **In Progress** if you
  resolved the issue outside the system.

---

## 13. Reports (`/ces/reports`)

Six executive charts, all sprint-over-sprint:

| Chart | Target |
|---|---|
| Compliance Completion Rate (%) | ≥ 85 |
| On-Time Completion (%) | ≥ 80 |
| Audit Readiness Score (0–100) | ≥ 85 |
| Signature SLA Compliance (%) | ≥ 90 |
| Blocked Resolution Time (hours) | Lower is better |
| Carry-Over Units | Lower is better |

A green dashed line on each chart shows the target. The trend arrow
compares the latest sprint to the prior sprint.

---

## 14. Common Errors and What They Mean

| Message | Meaning | Fix |
|---|---|---|
| "Cannot advance: required form missing" | A form in `requiredForms` has no submission. | Open the form, complete and save it. |
| "Dependency not met" | An upstream event is not complete. | Open the dependency from the drawer, complete it first. |
| "Signer not in roster" | The selected signer is not authorized for this workflow. | Pick a signer with the required role. |
| "Evidence missing event_id" | Upload was attempted without the three required IDs. | Re-upload from the Sprint Board card (auto-tags), or fill the IDs in Evidence Center. |
| "Phase out of order" | You attempted to advance from the wrong phase. | Complete the prior phase first; phases cannot be skipped. |

---

## 15. Where to Get Help

- In-app **Help (?)** icon — opens the help center.
- Help Center articles: see `Help-Center/` in this folder for the
  full topic index.
- Contact your **Compliance Officer** for governance questions.
- Contact your **Administrator** for role-assignment changes.

---

*End of CES End-User Manual.*
