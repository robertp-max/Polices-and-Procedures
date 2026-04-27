# KB-007 — Blocking and Unblocking Work

**Audience:** Everyone. **Time to read:** 2 minutes.

## When to block a unit

Block a unit if you genuinely cannot proceed and need a system flag so
metrics and downstream owners see it. Do not block to defer work you
simply chose not to do — that hurts your sprint metrics.

## How to block

1. Open the unit drawer.
2. Click **Mark Blocked**.
3. Choose a **Blocked Reason**:
   - `missing_signature` — a signer is unreachable.
   - `missing_form` — a form not under your control is missing.
   - `dependency_incomplete` — an upstream event has not finished.
   - `awaiting_external_input` — waiting on a vendor, surveyor, or other
     external party.
4. (Optional) link the **Resource ID** causing the block (form ID, user
   ID, event ID).
5. Click **Confirm**.

## What happens next

- The unit moves to the **Blocked** column.
- The reason appears on the Dashboard's Risk Indicators panel.
- If the reason resolves automatically (form uploaded, dependency
  completes), the system auto-unblocks and returns the unit to its
  prior column.

## How to unblock manually

- Drag the card from **Blocked** back to **In Progress**, or
- Click **Resolve Block** in the drawer and pick **Resolved**.

## Avoid these patterns

- **Block + forget.** Set a follow-up reminder.
- **Vague block reasons.** Always pick the right kind and link a resource
  when possible.
- **Blocking your own dependency.** If you own both the audit and its
  upstream operational workflow, finish the upstream work instead of
  blocking the audit.

## Related

- [KB-005 — Sprint Board Columns](KB-005-Sprint-Board-Columns.md)
- [KB-003 — Why Can't I Mark My Unit Complete?](KB-003-Cannot-Mark-Complete.md)
