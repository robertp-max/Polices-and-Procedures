# 02 — Sprint Structure

## 1. Cadence

| Parameter | Value |
|---|---|
| Sprint duration | **14 calendar days** (fixed) |
| Sprint start | Every other **Monday** at 00:00 (agency timezone, `America/Los_Angeles`) |
| Sprint end | The following **Sunday +13** at 23:59 |
| Cadence anchor | Aligned to the first Monday of each calendar quarter |
| Holiday handling | Sprint dates do **not** shift for holidays. Workload distribution shifts (PHASE 8 calendar integration). |

Cadence is **immutable**. Sprints do not extend.

---

## 2. Naming Convention

```
CES-<YYYY>-<MM>-S<N>
```

| Token | Meaning |
|---|---|
| `CES` | Compliance Execution Sprint (literal) |
| `YYYY` | Calendar year of sprint **start** |
| `MM` | Calendar month (zero-padded) of sprint **start** |
| `S<N>` | Sequence within the month (`S1` first sprint starting in that month, `S2` if a second starts in the same month) |

### Examples

| Sprint Window | Name |
|---|---|
| 2026-07-06 → 2026-07-19 | `CES-2026-07-S1` |
| 2026-07-20 → 2026-08-02 | `CES-2026-07-S2` |
| 2026-08-03 → 2026-08-16 | `CES-2026-08-S1` |
| 2026-12-28 → 2027-01-10 | `CES-2026-12-S2` (named by start month) |

---

## 3. How Events Enter A Sprint

An event is loaded into a sprint when **any** of the following is true:

1. The event `date` falls within the sprint window.
2. The event has `dueOffsetDays < 0` on a process step or required form, and `date + dueOffsetDays` falls within the sprint window (i.e., **prep work for a future-dated event**).
3. The event has a `followUps[].dueOffsetDays > 0` whose computed due date falls within the sprint window (i.e., **closure work from a past-dated event**).
4. The event is `Trigger-based` and was activated within the sprint window.

This is computed automatically from the calendar; the Compliance Officer **does not** decide what enters a sprint.

---

## 4. Workload Distribution Across the 14 Days

```
Day 1 (Mon)    Sprint open. Recurring items auto-load. Owners notified.
Days 2–4       Preparation phase work for events landing in this sprint.
Days 5–8       Documentation phase work; review windows open.
Days 9–11      Signature phase; eCIgn routing concentrated here.
Day 12 (Fri)   Audit-readiness check. Evidence-filing pass.
Day 13 (Sat)   Buffer day for late signatures and remediation.
Day 14 (Sun)   Sprint closure gate executes (PHASE 10).
```

This distribution is the **default schedule template**. Calendar-driven events with hard regulatory dates **override** this distribution if their `date` falls on a different day.

---

## 5. Sprint Boundaries

| Boundary Rule | Statement |
|---|---|
| Open | A sprint opens at 00:00 on the start Monday. The system auto-loads all qualifying events. |
| Close | A sprint closes at 23:59 on the end Sunday. The closure gate (`10-Enforcement-and-Rules.md`) executes. |
| Carry-over | Items not closed in-sprint **must** carry to the next sprint with a documented reason and an `escalation` flag. Quiet rollover is forbidden. |
| Re-open | A closed sprint **cannot be re-opened**. Late evidence is filed against the original event in the next sprint, not retroactively into the closed sprint. |

---

## 6. Sequence Within The Sprint

Within a single sprint, ordering is determined by:

1. **Regulatory date** — events with hard CFR dates have priority.
2. **Workflow phase** — within a workflow, phases execute in order (PHASE 1 model).
3. **Dependency graph** — events with `dependencies.dependsOn` cannot start until their predecessor is `complete`.
4. **Bundle proximity** — events that share approvers / signatures are scheduled adjacent to minimize context switching (PHASE 4).

The sprint board (PHASE 5) renders this ordering as the lane order.

---

## 7. Sprint Identifier Persistence

Every execution unit, evidence record, and minute artifact produced under CES carries the originating sprint ID (`CES-YYYY-MM-SN`). This is non-optional and is the audit anchor for "which sprint produced this evidence."
