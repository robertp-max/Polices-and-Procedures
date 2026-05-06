# KB-002 — Regulatory event vs event instance

## Summary

A **RegulatoryEvent** is the **definition** of an obligation on the master calendar dataset. An **EventInstance** is the **runtime container** for executing that obligation on a specific occurrence, with its own stable id, folder path, lock state, and certification snapshot.

## RegulatoryEvent (source)

Typical characteristics in this codebase:

- Human-facing **title**, **date**, **domain**, **category**
- **processFlow** steps (labels, optional required form ids, due offsets)
- **requiredForms** (labels, form ids, statuses in seed data)
- **approvals** array (required flags, target labels)
- **policyRefs**, **workflowId**, optional **minutes** configuration

The RegulatoryEvent id (`event.id`) remains the **anchor** for calendar navigation and many store keys that predate instance ids.

## EventInstance (occurrence)

Created or ensured via `ensureEventInstance` in the execution store:

- **`eventId`** — Often an `EVT-...` identifier from `buildEventInstanceIndex` / composition rules.
- **`sourceEventId`** — Points back to `RegulatoryEvent.id`.
- **Status / lock** — Drives whether mutations are allowed and whether certification snapshot exists.
- **`folderPath`** — Root logical folder `/events/{eventId}`.

## Multiple instances per source

The architecture supports **more than one** EventInstance per `sourceEventId` (for example manually created occurrences). The default seeded path still maps **one primary instance id** per source event via the index for deterministic demos.

## Practical guidance

| Question | Answer |
|----------|--------|
| Which id do I give IT for “this calendar row”? | Usually **`sourceEventId`** (RegulatoryEvent id). |
| Which id do I give IT for “this execution folder”? | **`eventId`** (`EVT-...`) and **`folderPath`**. |
| Where do I see both in the UI? | Event drawer header (instance id + folder) + Technical Details tab. |

## See also

- [KB-003](./KB-003-Event-IDs-and-Folder-Paths.md)
- [KB-011](./KB-011-State-Machine-and-Auto-Progression.md)
