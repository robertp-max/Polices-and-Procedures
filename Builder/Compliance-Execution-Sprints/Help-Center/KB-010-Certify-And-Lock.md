# KB-010 — Certifying and Locking an Event

**Audience:** Administrator. **Time to read:** 2 minutes.

Certification is the act of attesting, on the record, that a regulatory
event was executed correctly and is survey-defensible. Once certified,
the event is **locked** — its evidence and audit trail are immutable.

## Prerequisites

You can certify an event only when its audit state is **Audit Ready**.
Audit Ready means:

- All execution units are `completed`.
- All `requiredForms` are filed.
- All `requiredSigners` have signed.
- The audit-index entry exists in `evidence/.../audit-index.json`.

If any of those fail, the event will not appear in the
**Ready to Certify** filter.

## Steps

1. Open **Audit Mode** (`/audit`).
2. Click the **Ready to Certify** chip.
3. Open the event you want to certify.
4. Click **Certify and Lock** in the drawer header.
5. Confirm. The system writes a tamper-evident certification entry to the
   Audit Trail with your `actor_id`, `actor_role`, and timestamp.

## After certification

- The event moves to **Certified & Locked** state.
- The drawer is read-only.
- The event appears in survey packets as fully certified.
- You cannot un-certify. If correction is needed, open a CAPA workflow
  (see [KB-019](KB-019-CAPA.md)) — the new evidence supplements rather
  than overwrites.

## Bulk certification

In **Grouped** view, the **Certified & Locked** tier shows a
**Certify All Ready** button at the section header. Use this for
end-of-quarter close.

## Related

- [KB-009 — Using Audit Mode for Survey Prep](KB-009-Audit-Mode-Survey-Prep.md)
- [KB-019 — What Is a Corrective Action Plan?](KB-019-CAPA.md)
