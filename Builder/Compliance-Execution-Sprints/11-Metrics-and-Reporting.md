# 11 — Metrics and Reporting

## 1. Metrics Mandate

Every sprint produces the same set of metrics. Metrics are not optional, decorative, or selective — they are the agency's operating-control evidence and they feed the monthly retrospective and Board reporting.

---

## 2. Core Metrics

| # | Metric | Definition | Target | Severity if Missed |
|---|---|---|---|---|
| M1 | **Compliance completion rate** | `Completed units / Total units in sprint` | ≥ 95% | <90% = Critical (escalate) |
| M2 | **On-time execution rate** | `Units closed by their computed due date / Total units due in sprint` | ≥ 90% | <85% = High |
| M3 | **Blocked item count (closing)** | Items in Blocked column at sprint close | 0 | >0 = High; Critical-flagged blocked = Critical |
| M4 | **Audit readiness score** | `Completed units with full audit index entry / Completed units` | 100% | <100% = Critical |
| M5 | **Critical-risk closure rate** | `Closed critical-risk units / Total critical-risk units in sprint` | 100% | <100% = Critical |
| M6 | **Recurring-unit completion** | R1–R5 (and R6 if applicable) all closed | 100% | <100% = Critical (sprint cannot close) |
| M7 | **Signature SLA compliance** | Signatures captured before `escalationDays` / total required signatures | ≥ 95% | <90% = High |
| M8 | **Carry-over rate** | Units carried to next sprint / total units in sprint | ≤ 10% | >15% = High |
| M9 | **Carry-over aging** | Units carried > 2 sprints | 0 | >0 = Critical |
| M10 | **Capacity overruns** | Owners exceeding published capacity | 0 | >0 = Soft (track only) |

---

## 3. Monthly & Quarterly Roll-Ups

| Roll-Up | Source | Audience |
|---|---|---|
| **Monthly Compliance Performance Report** | Sum / average of M1–M10 across the 2 sprints in the month | Compliance Committee, Administrator |
| **Quarterly Compliance Performance Pack** | 6 sprints rolled up + retrospective findings + CAPA aging | Governing Body (with QAPI quarterly report) |
| **Annual Compliance Performance Report** | 26 sprints rolled up + biennial / triennial event status | Governing Body annual review (with `CO-FM-012`) |

These roll-ups are computed automatically at month, quarter, and year close from the immutable sprint snapshots. There is no manual restatement.

---

## 4. Visibility Surfaces

The same metrics are rendered in three surfaces, each tuned to its audience:

| Surface | Audience | Granularity | Refresh |
|---|---|---|---|
| **Dashboard** | All staff | Sprint-level KPIs + per-domain rollup | Real-time |
| **Sprint view** | Sprint participants | Per-unit + per-bundle status | Real-time |
| **Executive view** | Administrator, Compliance Officer, Board | Trend lines, exceptions, audit-readiness % | Daily computed |

The Executive view always shows the four "non-negotiable" tiles:

1. Critical-risk units in non-Completed state
2. Audit-readiness score for the current and prior sprint
3. Open Blocked count + aging
4. Recurring-unit completion status for the current sprint

---

## 5. Metric Computation Rules

| Rule | Statement |
|---|---|
| C1 | Metrics are computed from the **immutable sprint snapshot** (PHASE 5), not from live board state, for all retrospective and reporting purposes. |
| C2 | Live dashboard tiles are computed from current board state and update at most every 60 seconds. |
| C3 | "Critical-risk" classification is taken directly from `event.complianceFlags.auditRisk: 'critical'` — not redefined. |
| C4 | "On-time" is computed against the unit's individual computed due date, not the sprint close date. A unit due Day 5 and closed Day 6 is late even if the sprint is still open. |
| C5 | Carry-over aging counts the **count of distinct sprints** the unit has been open, not days. |

---

## 6. Reporting Cadence

| Cadence | Report | Owner | Audience |
|---|---|---|---|
| Each sprint close | Sprint Snapshot Report | Compliance Officer | Sprint participants + Administrator |
| Monthly | Monthly Compliance Performance Report (paired with retrospective) | Compliance Officer | Compliance Committee, Administrator |
| Quarterly | Quarterly Compliance Performance Pack | Compliance Officer | Governing Body |
| Annually | Annual Compliance Performance Report | Compliance Officer + Administrator | Governing Body (`CO-FM-012`) |
| Biennially | Biennial Compliance Effectiveness Report | Compliance Officer | Governing Body (`EVT-CO-2026-EFFECTIVENESS-BIENNIAL` cycle) |
| Triennially | Triennial Comprehensive Evaluation + Independent Review | Compliance Officer + external | Governing Body (`EVT-CO-2026-COMPREHENSIVE-TRIENNIAL` + `EVT-CO-2026-EXTREVIEW-TRIENNIAL` cycles) |

Each report is filed in the audit repository under its respective path and signed per the assignment model.

---

## 7. Defensibility Statement

The CES metrics package is designed so that, in any audit or survey:

- **Continuous** sprint snapshots demonstrate **operating control** in the present.
- **Monthly** retrospectives demonstrate **active governance** of that control.
- **Quarterly / annual / biennial / triennial** roll-ups demonstrate **program effectiveness** over time.
- **Audit-readiness score** demonstrates that what was completed is **actually audit-ready**, not just marked done.

Together these constitute a defensible, evidence-based program record across the regulatory lifecycle.

---

## 8. Forbidden Patterns

| Pattern | Why Forbidden |
|---|---|
| Restating prior-sprint metrics after snapshot freeze | Breaks immutability and audit defense. |
| "Adjusting" critical-risk classification to lower a metric | Misrepresents compliance posture. |
| Reporting only favorable metrics to the Board | Violates governance disclosure expectations. |
| Computing on-time against sprint close instead of unit due date | Hides intra-sprint lateness. |
| Showing a green dashboard while Blocked critical items exist | Dashboard must always surface Blocked critical items. |
