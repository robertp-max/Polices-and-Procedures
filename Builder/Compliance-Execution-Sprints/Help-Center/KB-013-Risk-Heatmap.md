# KB-013 — Reading the Risk Heatmap

**Audience:** Compliance Officer, Administrator. **Time to read:** 2 minutes.

The **Risk Heatmap** on the Dashboard shows one tile per compliance
domain: Clinical, Compliance, HR, Governance.

## What each tile shows

| Field | Meaning |
|---|---|
| Domain | The compliance domain. |
| Level | Green = Healthy · Yellow = Watch · Red = Overloaded. |
| Open units | Non-completed execution units in this domain. |
| Blocked | Units in `blocked` state. |
| Reason | Short narrative explaining the current level. |

## Color thresholds (default)

| Level | Trigger |
|---|---|
| Green | < 5 open and 0 blocked |
| Yellow | 5–10 open or 1–2 blocked |
| Red | > 10 open or > 2 blocked |

These thresholds are set per domain in `domainRisks.ts`.

## Triage flow

1. Click a Yellow or Red tile → drills into the Sprint Board filtered to
   that domain.
2. Sort by **Due Date** ascending.
3. Resolve the oldest blockers first. The R3 (Overdue Resolution Sweep)
   recurring unit is your tool here.

## Related

- [KB-008 — Audit Readiness Score](KB-008-Audit-Readiness-Score.md)
- [KB-012 — Recurring Units (R1–R8)](KB-012-Recurring-Units.md)
