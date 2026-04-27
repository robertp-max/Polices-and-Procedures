# KB-014 — Understanding Event IDs

**Audience:** Everyone uploading evidence or sharing links. **Time to read:** 2 minutes.

## The canonical format

```
{eventSubType}-{YYYYMMDD}-{NN}
```

Examples:

- `plan_of_care_audit-20260506-01`
- `qapi_meeting-20260315-01`
- `infection_control_review_quarterly-20260331-01`

## Anatomy

| Part | Meaning | Example |
|---|---|---|
| `{eventSubType}` | Stable, lowercase, underscore-separated category key. | `plan_of_care_audit` |
| `{YYYYMMDD}` | The date the event is anchored to. | `20260506` |
| `{NN}` | Two-digit sequence for events that fire more than once on the same date. | `01` |

## Where you'll see it

- The Sprint Board card (small grey label under the title).
- The Calendar event drawer.
- The Audit Mode detail panel.
- Every Evidence Center file (under `event_id`).
- Survey packet exports.

## Where you'll need it

When uploading evidence directly in the Evidence Center, you must paste
the canonical event ID into the **Event ID** field. Copy it from the
Sprint Board card to avoid typos.

## Why it matters

The event ID is the join key for:

- evidence files (`evidence/.../{event_id}/`)
- audit trail entries
- dependency resolution
- survey packet rollups

A typo breaks the join. Always copy/paste — never type by hand.

## Old EVT-* IDs

Legacy IDs that look like `EVT-QA-2026-Q3` were migrated in April 2026.
They no longer exist except in archived survey packets pre-dating the
migration. New work uses the canonical format above.

## Related

- [KB-004 — How to Upload Evidence](KB-004-Upload-Evidence.md)
