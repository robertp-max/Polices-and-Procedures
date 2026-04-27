# KB-006 — Sending a Unit for Signature (eCIgn)

**Audience:** Workflow owners. **Time to read:** 2 minutes.

## When you can route for signature

Only when the unit is in the **Signature** phase. The drawer's
**Send for Signature** button is greyed out otherwise.

## Steps

1. Open the unit drawer.
2. Click **Send for Signature**.
3. The signer roster is prefilled from the workflow definition. Review it:
   - Add a delegate if a signer is unavailable (must hold the same role).
   - Remove a duplicate.
4. Click **Confirm and Send**.
5. The unit moves to **Awaiting Signature** column.
6. The SLA clock starts (default escalation hours per workflow).

## What signers see

- Email notification with the unit summary and a link to sign.
- In-app notification on their Dashboard.
- The unit appears in their **My Signatures** queue.

## Tracking

The drawer shows each signer's status: `pending`, `signed`, `overdue`.
Click **Resend** next to a signer who is delayed.

## Escalation

If a signer's `hoursToEscalation` reaches 0, the unit's
`escalationTimer` goes negative and:

- The unit appears red on the Dashboard's Critical Risk banner.
- The signer's manager is notified.
- The unit increments **Signature SLAs Missed** for the sprint.

## After all signatures captured

The unit auto-advances to the **Audit** phase. File the final artifact
in the Evidence Center per [KB-004](KB-004-Upload-Evidence.md).

## Related

- [KB-003 — Why Can't I Mark My Unit Complete?](KB-003-Cannot-Mark-Complete.md)
- [KB-007 — Blocking and Unblocking Work](KB-007-Block-Unblock.md)
