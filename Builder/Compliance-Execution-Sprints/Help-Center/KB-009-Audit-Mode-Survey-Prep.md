# KB-009 — Using Audit Mode for Survey Prep

**Audience:** Compliance Officer. **Time to read:** 4 minutes.

Audit Mode (`/audit`) is your survey-prep cockpit. Every regulatory event
is classified into one of seven audit states, and the page lets you
triage, certify, and export survey packets.

## The 7 audit states

| State | Meaning |
|---|---|
| Overdue | Past due, not complete. |
| Blocked | Halted by a `BlockedReason`. |
| Not Certifiable | Cannot certify due to gaps. |
| Complete — Missing Evidence | Process done, paperwork missing. |
| Complete — Pending Approval | Awaiting an approval decision. |
| Audit Ready | Eligible for Administrator certification. |
| Certified & Locked | Done, locked, immutable. |

## Workflow: Pre-survey sweep (recommended weekly)

1. Click **July Readiness** chip (or the survey window relevant to you).
2. Switch view to **Grouped**. The 5 risk tiers display top to bottom:
   - Needs Immediate Review
   - Missing Evidence
   - Pending Approval
   - Ready to Certify
   - Certified & Locked
3. Work top-down. For each event in the top tier:
   - Open **Missing Items** tab.
   - Resolve or assign each gap.
4. Move to **Ready to Certify**. Either certify yourself or hand off to
   the Administrator (see [KB-010](KB-010-Certify-And-Lock.md)).

## Filters and date ranges

- **Date Range** presets: Last 30 / Last 90 / QTD / YTD / Clear.
- **Regulation filter:** type a citation (e.g., `42 CFR §484.65`).
- **Search:** event title, domain, regulatory driver.

## Detail tabs (per event)

`Summary · Missing Items · Evidence · Approvals · Timeline · Dependencies · Audit Trail`

The **Audit Trail** tab is the surveyor-grade tamper-evident log.

## Exports

- **Markdown bundle** — full filtered set.
- **JSON bundle** — machine-readable.
- **Survey Packet** — single-event printable packet (Markdown + HTML).

## Related

- [KB-008 — Audit Readiness Score](KB-008-Audit-Readiness-Score.md)
- [KB-010 — Certifying and Locking an Event](KB-010-Certify-And-Lock.md)
- [KB-016 — Exporting a Survey Packet](KB-016-Export-Survey-Packet.md)
