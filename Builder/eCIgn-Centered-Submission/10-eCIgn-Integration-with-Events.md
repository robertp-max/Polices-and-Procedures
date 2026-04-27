# 10 — eCIgn Integration with Events

## Purpose
Define how Regulatory Events ([src/policy/data/regulatoryEvents.ts](../../src/policy/data/regulatoryEvents.ts)) bind to eCIgn packets and how event completion derives from packet outcomes.

## Event ↔ packet relationship
- An event may declare `requiredForms[]`. Each entry represents a form that **must** have a `signed_locked` packet with valid evidence (and approval if applicable) for the event to be `complete`.
- An event may declare optional supporting evidence (kind `attachment`, `report`, `minutes`); these do not gate completion unless `complianceFlags.requireForCompletion === true`.

## Packet creation timing
- Packets are created lazily on first form open (Right Panel "Open Form" button).
- The created instance is bound to `event_id` and `workflow_instance_id` at creation (existing field on `FormInstanceRow`).

## Multi-occurrence events
- Recurring events (e.g. monthly QAPI minutes) produce one event instance per occurrence; each occurrence has its own required-form packets.
- Task IDs use the event-occurrence ID, ensuring uniqueness across occurrences (e.g. `qapi_meeting-20260507-08`).

## Event completion validation (existing — preserved)
[regulatoryExecutionStore.ts → validation](../../src/policy/stores/regulatoryExecutionStore.ts):
- All steps `complete`.
- All required forms `complete`.
- Minutes (if required) `finalized`.
- All approvals decided `approved`.
- No outstanding blockers.

## Event scheduling
- `anchorDate` and `dueOffsetDays` (per step) drive scheduling.
- The PM scheduler/allocator must respect the **weekend rule** (see [12](12-eCIgn-Integration-with-PM-Tasks.md) and `pm/weekendRule.ts`).

## Event lifecycle states (composite — derived)
| State | Condition |
|---|---|
| `upcoming` | `anchorDate > today` and no work started |
| `ready` | `anchorDate <= today` and no packets open |
| `in_progress` | At least one packet beyond `created` |
| `awaiting_signature` | All packets at `attested`, awaiting signers |
| `blocked` | Any blocker present |
| `completed` | Validation passes |

## Backend contract impact
- No new endpoints. Event data is static config; runtime status is derived per session by CES selectors.

## UI behavior
- EventWorkspace shows tabs (Steps, Forms, Approvals, Evidence, Notes) — preserved.
- Right Panel "Event context" shows event title, anchor date, due window, mandate, urgency.
- "Open event" action navigates to `/calendar/event/:eventId` or analogous existing route.

## Risks
| # | Risk | Mitigation |
|---|---|---|
| EV1 | Event marked complete before all packets validated | Validation function gates `recordCertification`; UI disables certify button until validation passes |
| EV2 | Required forms list drifts from packet expectations | Event publish validator |
| EV3 | Recurring event pollutes task lists | Filter by current sprint by default in PM views |

## Acceptance criteria
- Event ↔ packet binding explicit.
- Event completion strictly derived from packet outcomes + steps + approvals.
- Recurring events produce stable, distinct task IDs per occurrence.

## Verification checklist
- [ ] Event with one required form cannot complete until that form's packet is locked + evidence validated.
- [ ] Recurring monthly event produces N task IDs across N occurrences with no collisions.
- [ ] Event certification creates an immutable `CertificationRecord`.
