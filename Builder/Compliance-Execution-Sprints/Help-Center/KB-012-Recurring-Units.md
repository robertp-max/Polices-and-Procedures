# KB-012 — What Are Recurring Units (R1–R8)?

**Audience:** Everyone. **Time to read:** 2 minutes.

Every sprint, the system **automatically generates 8 recurring execution
units** that are not tied to any single calendar event. They keep the
program healthy across sprints.

| Code | Unit | Owner Role | Phase |
|---|---|---|---|
| **R1** | Weekly compliance review | Compliance Officer | Review |
| **R2** | Audit chain verification | Compliance Officer | Audit |
| **R3** | Overdue resolution sweep | Compliance Officer | Documentation |
| **R4** | Signature follow-up sweep | Compliance Officer | Signature |
| **R5** | Risk review | Administrator | Review |
| **R6** | Carry-over audit | Compliance Officer | Audit |
| **R7** | Evidence index sync | System | Audit |
| **R8** | Sprint metrics rollup | System | Audit |

## What you need to do

- **R1, R2, R3, R4, R6** — Compliance Officer touches these once per
  sprint. They are checklists, not full audits.
- **R5** — Administrator reviews the Risk Heatmap and signs off.
- **R7, R8** — fully automatic. They will appear pre-completed by sprint
  end. No human action required.

## Why they exist

Without R1–R8, drift accumulates between sprints:

- Overdue units get forgotten (R3).
- Signatures stall (R4).
- Carry-over piles up (R6).
- Metrics fall out of sync (R7, R8).

## Are they on my Sprint Board?

Yes. Filter by **Owner = me** to see which Rs land on you. They are
labeled `R1`–`R8` for quick recognition.

## Can I skip a recurring unit?

No. If a recurring unit is incomplete at sprint close, it carries over and
counts against the Carry-Over chart on Reports.

## Related

- [KB-008 — Audit Readiness Score](KB-008-Audit-Readiness-Score.md)
- [KB-018 — Reading the Reports Charts](KB-018-Reports-Charts.md)
