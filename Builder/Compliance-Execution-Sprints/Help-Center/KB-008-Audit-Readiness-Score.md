# KB-008 — Reading the Audit Readiness Score

**Audience:** Compliance Officer, Administrator. **Time to read:** 2 minutes.

The **Audit Readiness Score** is the headline number on the Dashboard. It
runs from 0 to 100. Target: **≥ 85**.

## What it measures

A weighted blend of:

- Evidence completeness across active execution units.
- Signature SLA compliance.
- Certification status of recently due events.
- Overdue-unit pressure.

## How to read it

| Score | Color | Meaning |
|---|---|---|
| 85–100 | Green | Survey-ready. |
| 70–84 | Amber | Recoverable; act on the Risk Heatmap before sprint end. |
| < 70 | Red | Material risk. Open Audit Mode and triage Not Certifiable + Missing Evidence chips immediately. |

## When the score drops

1. Open **Audit Mode** (`/audit`).
2. Click the **Not Certifiable** chip — that's the biggest driver of a
   low score.
3. For each event in that filter, open **Missing Items** tab to see
   exactly what is missing.
4. Resolve the highest `riskScore` items first.

## When the score is healthy

Maintain by:

- Keeping **Carry-Over Units** trending down (Reports chart).
- Keeping **Signature SLAs Missed** at 0.
- Closing the R3 (Overdue Resolution Sweep) recurring unit each sprint.

## Related

- [KB-009 — Using Audit Mode for Survey Prep](KB-009-Audit-Mode-Survey-Prep.md)
- [KB-013 — Reading the Risk Heatmap](KB-013-Risk-Heatmap.md)
