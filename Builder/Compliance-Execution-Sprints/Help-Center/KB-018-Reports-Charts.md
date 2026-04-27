# KB-018 — Reading the Reports Charts

**Audience:** Administrator, Compliance Officer. **Time to read:** 3 minutes.

The Reports page (`/ces/reports`) shows six sprint-over-sprint KPI
charts. All use `SprintTrendPoint` data — one point per closed sprint.

## The 6 charts

| Chart | Type | Target | What good looks like |
|---|---|---|---|
| Compliance Completion Rate (%) | Bar | ≥ 85 | Bar at or above the green dashed line every sprint. |
| On-Time Completion (%) | Bar | ≥ 80 | Trending up. |
| Audit Readiness Score (0–100) | Line | ≥ 85 | Flat at 85+, no dips below. |
| Signature SLA Compliance (%) | Line | ≥ 90 | At/above 90, no spikes downward. |
| Blocked Resolution Time (hours) | Bar (inverted) | Lower is better | Bars getting shorter. |
| Carry-Over Units | Bar (inverted) | Lower is better | Bars trending down. |

## Reading the trend arrow

Each chart has a trend chip showing the latest sprint vs the prior
sprint:

- Green ▲ on a normal chart = improvement.
- Red ▼ on a normal chart = regression.
- For inverted charts (Blocked Resolution, Carry-Over), the colors flip
  — green ▼ means improving (less time, fewer carry-overs).

## Common patterns

| Pattern | Likely cause | First action |
|---|---|---|
| Audit Readiness drops, Carry-Over up | Sprint closed with too many incomplete units | Run R3 sweep next sprint, set hard Day-12 review |
| Signature SLA dropping, Awaiting Signature growing | Signers are unreachable | R4 sweep + check eCIgn delegation roster |
| Completion % flat, Blocked Resolution Time up | Same units stuck blocked sprint after sprint | Open Audit Mode → Blocked filter, escalate |

## Exporting

Each chart has a **⋯ menu** → **Export PNG / CSV** for board reports.

## Related

- [KB-008 — Audit Readiness Score](KB-008-Audit-Readiness-Score.md)
- [KB-015 — Carry-Over](KB-015-Carry-Over.md)
