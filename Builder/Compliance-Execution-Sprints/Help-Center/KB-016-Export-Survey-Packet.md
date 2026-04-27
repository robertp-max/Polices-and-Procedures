# KB-016 — Exporting a Survey Packet

**Audience:** Compliance Officer. **Time to read:** 2 minutes.

A **Survey Packet** is a printable, single-event packet that documents
exactly what a CMS surveyor would ask to see for one regulatory event.

## What's in it

- Rollup header: event ID, date, owner, citation, audit state.
- Evidence checklist with status per required form.
- Signature roster with timestamps.
- Compliance flags (audit risk, surveyor note).
- Tamper-evident audit trail excerpt.
- Dependencies graph (upstream + downstream events).

## How to export

1. Open **Audit Mode** (`/audit`).
2. Find the event.
3. Open the event drawer.
4. Click **Export Survey Packet**.
5. Choose format:
   - **Markdown** — plain text, easy to email.
   - **HTML** — printable, with full styling.
6. The packet downloads to your machine.

## When to use

- A surveyor on-site requests evidence for a specific event.
- Internal pre-survey readiness review.
- Annual governance review.

## Bulk export (multiple events)

For a date-range or filtered list of events, use **Export Markdown** or
**Export JSON** at the page header — both produce a multi-event bundle.

## Where exports come from

The packet is generated server-side at request time, so it always
reflects the current state of the event. There is no stored "snapshot"
to go stale.

## Related

- [KB-009 — Using Audit Mode for Survey Prep](KB-009-Audit-Mode-Survey-Prep.md)
- [KB-010 — Certifying and Locking an Event](KB-010-Certify-And-Lock.md)
