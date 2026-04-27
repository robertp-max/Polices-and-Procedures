# 10 — Enforcement and Rules

## 1. Enforcement Posture

The CES system enforces compliance discipline **automatically**. Discretion exists only where the data model explicitly delegates it (e.g., a Compliance Officer manual-block override with logged reason).

The default behavior of the system is to **block, not warn**. Warnings without blocks have already been tried in regulated environments — they fail.

---

## 2. Hard Enforcement Rules (System-Enforced)

| ID | Rule | Mechanism |
|---|---|---|
| E1 | **No completion without evidence.** A unit cannot transition to Completed unless every required form has status `complete`, every required signature has timestamp, and the audit index entry exists. | `auditAggregate.ts` + closure gate |
| E2 | **No phase progression out of order.** Documentation cannot start before Preparation is complete; Signature cannot start before Review is complete; Audit cannot file before Signature is complete. | Workflow state machine |
| E3 | **Auto-block missing signatures.** When a signature is past its `escalationDays`, the unit moves to Blocked and the unit's `escalateToRole` is notified via eCIgn + dashboard. | Signature daemon |
| E4 | **Auto-flag late items.** Any unit past its computed due date moves to `urgency: 'overdue'` and is surfaced in the executive view. Non-completion past `overdueAfterDays` triggers Critical-severity escalation. | Compliance engine |
| E5 | **Sprint cannot close with incomplete critical items.** A sprint's closure gate (Day 14, 23:59) refuses to close if any item with `complianceFlags.auditRisk: 'critical'` is not Completed and lacks a documented carry-over reason. | Closure gate |
| E6 | **Sprint cannot open with unassigned units.** At sprint open (Day 1, 00:00), any unit without resolved Owner / Approver / Signature owner is auto-Blocked and flagged to the Administrator before any other work begins. | Sprint open gate |
| E7 | **No retroactive sprint edits.** Closed sprints are immutable; late evidence files against the originating event in the next sprint with explicit "late filing" annotation. | Snapshot immutability |
| E8 | **Recurring units cannot be skipped.** If R1–R5 (PHASE 7) are not completed, the sprint cannot close. R7 / R8 are gating for sprint open. | Closure + open gates |
| E9 | **Workflow definition immutable in-sprint.** A sprint cannot edit `workflows.generated.ts`. Workflow changes flow only through `EN-LC-001` Policy Lifecycle and regeneration. | Source-of-truth enforcement |
| E10 | **Calendar deadlines immutable in-sprint.** Sprint loading is deterministic; manual ad-hoc additions/removals at sprint open are blocked unless the data layer changed. | Calendar primacy |

---

## 3. Soft Enforcement (Notify and Track)

| ID | Rule | Mechanism |
|---|---|---|
| S1 | **Capacity overrun warnings.** If an Owner exceeds published per-sprint capacity, notify Compliance Officer for reassignment. Does not auto-block. | Capacity monitor |
| S2 | **Backup activation log.** When a unit auto-shifts to a backup Owner, log the activation; surfaced in monthly retrospective. | Roster monitor |
| S3 | **Carry-over aging.** Items carried > 1 sprint trigger High-severity attention; > 2 sprints triggers Critical. | Carry-over tracker |
| S4 | **Signature timing patterns.** If a particular signer consistently triggers `escalationDays`, the pattern is surfaced in the monthly retrospective. | eCIgn analytics |

Soft enforcement never blocks closure; it surfaces patterns for governance attention.

---

## 4. The Sprint-Open Gate (Day 1, 00:00)

```text
1. Run R7 (roster currency check). If any required role is unfilled → BLOCK and escalate to Administrator. STOP.
2. Run R8 (carry-over reconciliation). Load prior-sprint open items into this sprint with phase-correct columns.
3. Execute calendar-loading algorithm (PHASE 8). Load all qualifying events / steps / forms / follow-ups.
4. For every loaded unit, resolve assignments. Any unassigned → auto-Block with escalation. Continue loading; do not abort.
5. Materialize recurring units R1–R6. R6 only if month-end is within the sprint window.
6. Stamp every artifact slot with Sprint ID.
7. Notify all Owners (single consolidated open-day brief).
8. Sprint state → OPEN.
```

---

## 5. The Sprint-Close Gate (Day 14, 23:59)

```text
1. Verify R1–R5 complete (R6 if month-end within sprint).
2. For every unit:
   a. If state = Completed → require audit index entry exists.
   b. If state = Blocked or In Progress or Awaiting Signature:
      - Critical risk? → REFUSE close. Escalate to Administrator. Sprint stays OPEN until resolved.
      - Otherwise → require documented carry-over reason. Mark for next-sprint reconciliation.
3. Verify monthly retrospective is closed (only on last sprint of the month). If not → REFUSE close.
4. Compute and freeze sprint snapshot (PHASE 5).
5. Require Compliance Officer signature on snapshot.
6. Require Administrator signature on snapshot.
7. Sprint state → CLOSED.
```

---

## 6. Override Rules

| Override | Allowed? | Conditions |
|---|---|---|
| Manual block | Yes | Compliance Officer only. Logged reason mandatory. |
| Manual unblock | Yes | Compliance Officer only, with documented resolution. |
| Manual close of an in-progress unit | **No.** A unit closes only by completing all phases. |
| Manual close of a sprint with a Critical risk open | **No.** Requires Administrator + Board Chair joint signature and a written exception under `GV-GB-001`. |
| Bypass an `EN-LC-001` workflow change for "urgency" | **No.** Urgency is handled by manual block + Compliance Officer documented exception, never by bypassing source-of-truth governance. |

Every override is recorded in the sprint snapshot and surfaces in the next monthly retrospective for review.

---

## 7. Evidence Integrity

| Rule | Statement |
|---|---|
| Single source | Only one canonical version of each artifact exists in the audit repository. |
| Stamp | Every artifact carries originating Sprint ID, Event ID, Workflow ID, Owner, and Signature timestamps. |
| No silent edits | An artifact cannot be edited after Audit-phase filing. Any correction is a new versioned artifact with a documented superseding link. |
| Hash chain | Each sprint snapshot includes a hash of the audit index for that sprint, providing tamper detection. |

---

## 8. Surveyor-Ready Posture

The enforcement rules above are designed so that, on any given day:

- The Compliance Officer can show **today's sprint board** with no Blocked critical items, all assignments resolved, and the recurring-units progress for the sprint.
- The Administrator can show the **last 12 sprint snapshots** as a continuous operating-control record.
- The Board can show the **monthly retrospectives** as their evidence of governance oversight.

If any of those three views is missing or incomplete, the system has failed its core purpose.
