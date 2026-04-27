# 06 — Sprint Board and States

## 1. Board Columns

The sprint board has exactly **six columns**, in left-to-right order:

| # | Column | Meaning |
|---|---|---|
| 1 | **Upcoming** | Calendar-driven units loaded for this sprint that have not yet started. |
| 2 | **Ready** | Dependencies satisfied; assignments resolved; preparation can begin. |
| 3 | **In Progress** | Documentation/Review phases actively in motion. |
| 4 | **Awaiting Signature** | All review complete; eCIgn routing in flight. |
| 5 | **Blocked** | Compliance failure, missing dependency, missing assignment, or SLA breach. |
| 6 | **Completed** | Audit-ready: evidence filed, signatures captured, compliance state `complete`. |

These six columns are **not configurable**. Adding columns is forbidden.

---

## 2. Column → Workflow Phase → Compliance State Mapping

| Column | Workflow Phase | Compliance State (`complianceEngine.ts`) | Audit Readiness |
|---|---|---|---|
| Upcoming | (pre-Preparation queue) | `pending` | Not yet applicable |
| Ready | Preparation start | `pending` | Not ready |
| In Progress | Documentation + Review | `in-progress` | Not ready |
| Awaiting Signature | Signature | `awaiting-signature` | Not ready |
| Blocked | (any) | `blocked` or `overdue` | **Surveyor risk** |
| Completed | Audit | `complete` | **Audit-ready** |

The "Blocked" column is intentionally placed **before** "Completed" so it is impossible to ignore. Items in Blocked are surfaced in the dashboard at executive level (PHASE 10).

---

## 3. Transition Rules

| From → To | Required Conditions |
|---|---|
| Upcoming → Ready | All dependencies (`event.dependencies.dependsOn`) are `complete`; all assignments resolved; required forms present in workspace. |
| Ready → In Progress | Owner has begun Preparation; first form/document opened. |
| In Progress → Awaiting Signature | All Review-phase approvals captured; no open redlines. |
| Awaiting Signature → Completed | All required signatures captured per `event.approvals[]`; evidence filed in audit repo with sprint ID + event ID. |
| Any → Blocked | A blocking condition is detected (see Section 4). |
| Blocked → previous column | Block is resolved with a documented resolution note. |

Transitions are **system-enforced** (PHASE 10). Manual override is only available to the Compliance Officer with a logged reason.

---

## 4. Blocking Conditions

An item moves to **Blocked** when **any** of the following occurs:

| Condition | Source |
|---|---|
| A required form is `missing` past its `dueOffsetDays` | `event.requiredForms[]` |
| A required signature is not captured past its `escalationDays` | `event.approvals[].escalationDays` |
| A predecessor event is not `complete` and the current step needs it | `event.dependencies.dependsOn` |
| The Owner role is unfilled on the Operating Roster | Roster check |
| A `complianceFlags.missingEvidenceIf` condition is hit | `event.complianceFlags` |
| Manual block flag raised by Compliance Officer | Manual |

Blocked items appear in the sprint dashboard with their blocking condition. They escalate to the assigned `escalateToRole` automatically.

---

## 5. Audit Readiness Definition

A unit (and the parent workflow, and the parent event) is **audit-ready only when**:

1. All required forms have status `complete`.
2. All required signatures are captured in eCIgn with timestamps.
3. The artifact is filed in the audit repository at the canonical path:
   ```
   /audit/<YYYY>/<EventDomain>/<EventID>/<SprintID>/
   ```
4. The audit index entry exists with: event ID, sprint ID, workflow ID, owner, approvers, signers, file paths.

Anything short of all four is **not** audit-ready, regardless of column.

---

## 6. Board Views

The board is rendered in three views, all backed by the same data model:

| View | Audience | Grouping |
|---|---|---|
| **Lane view** | Sprint participants | Columns × Bundles (Event → Workflow) |
| **Owner view** | Individual contributors | Owner × Phase × Sprint |
| **Executive view** | Administrator, Compliance Officer, Board | Domain × State × Audit Readiness |

The Executive view always surfaces:

- Count of items in **Blocked**
- Count of items past `escalationDays`
- Count of events with `complianceFlags.auditRisk: 'critical'` not yet `complete`
- Audit-readiness % for the sprint

---

## 7. End-of-Sprint Snapshot

At sprint close (Day 14, 23:59), the board produces an immutable snapshot:

| Snapshot Field | Source |
|---|---|
| Sprint ID | sprint metadata |
| Total units | board count |
| Completed units | column 6 count |
| Blocked units (carry-over) | column 5 count |
| Audit-readiness % | computed |
| List of carry-over items with reason | board metadata |
| Signed-off by | Compliance Officer (mandatory), Administrator (mandatory) |

The snapshot is the input to the next sprint's planning and the monthly retrospective (`08-Monthly-Retrospective.md`).
