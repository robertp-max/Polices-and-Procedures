# KB-005 — Understanding the Sprint Board Columns

**Audience:** Everyone. **Time to read:** 2 minutes.

The Sprint Board has six columns. Each represents a **compliance state** —
not a workflow phase.

| Column | What lives here | Who can move it |
|---|---|---|
| **Upcoming** | Units not yet in scope for this sprint. | System only. |
| **Ready** | All prerequisites met, you can start. | Owner pulls into In Progress. |
| **In Progress** | Active execution. | Owner. |
| **Awaiting Signature** | Routed to signers; SLA clock running. | System (advances when signed). |
| **Blocked** | Halted with a reason. | Anyone with a valid reason. |
| **Completed** | Done, signed, filed. Read-only. | Locked. |

## Legal moves (drag and drop)

- Ready ↔ In Progress
- In Progress → Awaiting Signature (auto when sig phase reached)
- In Progress → Blocked
- Awaiting Signature → Blocked
- Blocked → In Progress (when reason resolved)
- Awaiting Signature → Completed (auto when all signed)

Illegal moves snap back with a brief warning.

## Swimlanes

By default the board groups by **parent event**, so you see
"Plan of Care Audit — May" with its 5 phase units beneath it. Toggle the
view selector to flatten if you prefer a single list.

## Filters

- **My Work** — only units owned by you.
- **Domain** — Clinical / Compliance / HR / Risk.
- **Phase** — preparation / documentation / review / signature / audit.
- **Risk** — show only red/amber units.

## Related

- [KB-007 — Blocking and Unblocking Work](KB-007-Block-Unblock.md)
- [KB-002 — How to Complete an Execution Unit](KB-002-Complete-Execution-Unit.md)
