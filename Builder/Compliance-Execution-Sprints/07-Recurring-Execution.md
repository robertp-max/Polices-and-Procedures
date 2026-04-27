# 07 — Recurring Execution

## 1. Mandate

Every sprint contains a **fixed set of recurring execution units** that are auto-generated, auto-assigned, and **non-optional**. These exist to keep the compliance fabric continuously verified.

These units do **not** require an event in the calendar — they are themselves a standing event class anchored to the sprint cadence.

---

## 2. Mandatory Recurring Units (Per Sprint)

| # | Recurring Unit | Default Owner Role | Workflow Anchor | Phase Distribution |
|---|---|---|---|---|
| R1 | **Weekly compliance review** ×2 | Compliance Officer | `QA-WF-11` Policy Effectiveness Monitoring | Days 5 and 12 |
| R2 | **Signature follow-up sweep** | Compliance Officer | eCIgn lifecycle | Days 10, 12, 13 |
| R3 | **Overdue resolution pass** | Compliance Officer | `complianceEngine.ts` overdue queue | Day 7 and Day 14 |
| R4 | **Audit chain verification** | QAPI Lead + Compliance Officer | `auditAggregate.ts` rollup | Day 12 |
| R5 | **Risk flag review** | Compliance Officer | `RM-WF-01` ERM quarterly review (sprint-level slice) | Day 6 |
| R6 | **OIG/SAM screening confirmation** (if sprint contains a calendar month-end) | HR Lead + Compliance Officer | `CO-WF-15` | Last day of month within sprint |
| R7 | **Roster currency check** | HR Lead | (Operating Roster maintenance) | Day 1 |
| R8 | **Carry-over reconciliation** | Compliance Officer | (sprint snapshot review) | Day 1 |

---

## 3. Recurring Unit Specifications

### R1 — Weekly Compliance Review

| Field | Value |
|---|---|
| Frequency | Twice per sprint (Day 5, Day 12) |
| Inputs | Open events, board state, blocked queue |
| Output | Compliance Review Note (filed under `/audit/<YYYY>/Compliance/Recurring/`) |
| Closure criteria | Note signed by Compliance Officer; any newly blocked items have escalation routes assigned. |

### R2 — Signature Follow-Up Sweep

| Field | Value |
|---|---|
| Frequency | Days 10, 12, 13 |
| Inputs | All `awaiting-signature` items |
| Output | Targeted reminder routed via eCIgn; escalation if past `escalationDays` |
| Closure criteria | All open signatures either captured, escalated, or documented as legitimately delayed (pre-approved). |

### R3 — Overdue Resolution Pass

| Field | Value |
|---|---|
| Frequency | Day 7 and Day 14 |
| Inputs | Items with `urgency: 'overdue'` or past `overdueAfterDays` |
| Output | Resolution log: each item closed, escalated, or carried with reason |
| Closure criteria | Zero unresolved overdue items at sprint close, OR every remaining item carries a documented carry-over reason. |

### R4 — Audit Chain Verification

| Field | Value |
|---|---|
| Frequency | Day 12 |
| Inputs | Completed items in this sprint |
| Output | Audit Chain Verification Report (per-event traceability check) |
| Closure criteria | For each completed event: forms present, signatures present, audit index entry present, sprint+event IDs stamped on artifacts. |

### R5 — Risk Flag Review

| Field | Value |
|---|---|
| Frequency | Day 6 |
| Inputs | Risk Register `RM-FM-008`, blocked items, `complianceFlags.auditRisk: 'critical'` items |
| Output | Risk Flag Note with any new register entries proposed |
| Closure criteria | Any new risk added to register or explicitly rejected with rationale. |

### R6 — OIG/SAM Screening Confirmation

| Field | Value |
|---|---|
| Frequency | Sprint containing a calendar month-end |
| Inputs | `HR-FM-005` OIG/SAM Monthly Exclusion Verification Log |
| Output | Confirmed monthly screen filed; cross-reference with new hires and active contractors |
| Closure criteria | Zero excluded individuals confirmed for the month, screen log signed. |

### R7 — Roster Currency Check

| Field | Value |
|---|---|
| Frequency | Day 1 of sprint |
| Inputs | Agency Operating Roster, HR records |
| Output | Roster confirmed current; any new roles assigned default backups |
| Closure criteria | Every workflow role required by this sprint resolves to a named individual with current credentials. |

### R8 — Carry-Over Reconciliation

| Field | Value |
|---|---|
| Frequency | Day 1 of sprint |
| Inputs | Prior sprint snapshot |
| Output | Carry-over items loaded into this sprint with phase-correct columns and explicit carry-over flags |
| Closure criteria | Every prior-sprint open item is either loaded here or formally closed (with reason). |

---

## 4. Auto-Generation Rules

| Rule | Statement |
|---|---|
| AG1 | Recurring units are generated **at sprint open** (Day 1, 00:00). |
| AG2 | Owner Role is resolved to a named individual via the Operating Roster at generation time. |
| AG3 | If a recurring unit cannot be assigned (role unfilled, missing roster entry), it is **immediately Blocked** and escalated to the Administrator. |
| AG4 | Recurring units are **never** suppressed by sprint workload. They have priority equal to calendar-driven critical events. |
| AG5 | A sprint **cannot close** if R1–R5 are not completed. R6 is conditional on month-end presence. R7 and R8 are gating for sprint open. |

---

## 5. Forbidden Patterns

| Pattern | Why Forbidden |
|---|---|
| Skipping a weekly compliance review because "nothing changed" | Review itself is the evidence of operating control. |
| Combining R1 and R3 into a single unit | Loses independent evidence of each function. |
| Allowing the Compliance Officer to self-close R4 without independent verification | Audit chain requires a second-set-of-eyes attestation. |
| Treating R6 as a "calendar event" that drifts | Monthly OIG/SAM screening is a regulatory expectation; sprint cadence does not change the monthly rule. |

---

## 6. Output Filing

All recurring-unit outputs file under:

```
/audit/<YYYY>/Compliance/Recurring/<SprintID>/<UnitID>/
```

with the standard audit index entry. Surveyors can reconstruct the full operating-control rhythm from this directory alone.
