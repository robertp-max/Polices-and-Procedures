# 03 — Board Operation in Use

This document walks through the actual operating behavior of
[`SprintExecutionBoard`](../../../src/policy/ces/components/board/SprintExecutionBoard.tsx)
during a typical sprint day.

## 1. Initial Render

On mount, the board:

1. Seeds local state from `EXECUTION_UNITS` (production: from a hook
   that subscribes to the unit service).
2. Computes the `byEvent` grouping via `useMemo` — Events are the
   horizontal swimlanes; only events with at least one unit appear.
3. Renders 6 columns horizontally with a minimum column width of
   `280px` and a board minimum width of `1700px` (forcing horizontal
   scroll on narrow viewports rather than column collapse).

## 2. The Drag Lifecycle

CES uses native HTML5 drag-and-drop (no DnD library) because every
interaction must call into `useExecutionEnforcement` synchronously
before mutation. Adding a library here would obscure that requirement.

### 2.1 onDragStart

```ts
handleDragStart(event, unit) {
  setDrag({ unit });
  event.dataTransfer.effectAllowed = 'move';
}
```

The board records the in-flight unit in local state. The Card itself
has `draggable={true}` only when its state is not `completed` — the
Completed column is structurally read-only.

### 2.2 onDragOver

```ts
handleDragOver(event, columnState) {
  event.preventDefault();
  setOverCol(columnState);
}
```

Columns highlight (background flips to `navySoft`, border to `navy`)
when the drag enters them. This happens for **any** column — including
ones that will deny the drop. The deny is shown after release, not
predictively, because the operator deserves to see *why* a target is
illegal.

### 2.3 onDrop

This is the moment the rule engine speaks:

```ts
handleDrop(targetState) {
  const verdict = canTransitionState(drag.unit, targetState);

  if (!verdict.allowed) {
    flashWarn(verdict.reason);     // inline red banner above board
    setDrag(null);
    setOverCol(null);
    return;                        // ← snap back: state is NOT mutated
  }

  setUnits(curr =>
    curr.map(u => u.id === drag.unit.id
      ? { ...u, complianceState: targetState }
      : u));
}
```

Critical property: **the unit only moves if the verdict allows it**.
There is no optimistic update with rollback; the board is the source of
truth for what the engine permitted.

## 3. Snap-Back Visualization

When a drop is denied, the unit visually "snaps back" because nothing
was mutated. The user simultaneously sees:

- The unit still in its original column
- The destination column un-highlighted
- A red `AlertOctagon` warning bar at the top of the board with the
  full `verdict.reason`

The warning auto-clears after ~3s. There is no dismiss button — the
warning is informational only and never blocks subsequent actions.

## 4. Swimlanes (Event Grouping)

Inside each column, units are grouped by their parent Compliance Event
via `SwimlaneHeader`. The grouping rules:

- An Event swimlane appears in a column only if at least one of its
  units is in that column.
- Swimlane headers show event title + domain pill.
- Swimlanes have no drag/drop targets themselves — drops resolve to the
  whole column.

The swimlane structure is what makes the board scannable as a
**compliance landscape** rather than a generic flat Kanban. An auditor
can immediately read: "The QAPI Monthly Review event has 2 units in
Documentation, 1 in Awaiting Signature, 0 blocked."

## 5. Card Click → Drawer Open

A click anywhere on a card (that does not begin a drag) opens the
`WorkflowDrawer` for that unit. The drawer mounts as a fixed
right-anchored panel with a backdrop blur, and is dismissable by:

- Clicking the backdrop
- Pressing Escape (`useEffect` keydown handler)
- Clicking the X button in the drawer header

The board passes an `onUpdate` callback to the drawer; when the drawer
mutates the unit (via Close, Mark Blocked, Request Signatures), the
board's local `units` state is patched and the drawer's `unit` prop is
re-bound to the updated record.

## 6. Empty Column Handling

A column with zero units renders a centered italic placeholder:

> *No execution units in Awaiting Signature*

This is intentional — collapsed empty columns would lose the spatial
predictability of the 6-column layout. Operators learn the column
positions; they should not have to re-find them.

## 7. Header Counts

The board header summarizes:

> `9 open · 4 closed`

These are computed live from the current unit set. The right-side count
is filtered to `complianceState === 'completed'`. The "open" count is
the complement.

## 8. Concurrency Considerations (Production Wiring)

The current implementation is single-user local state. Production
wiring must add:

| Concern | Implementation |
|---------|---------------|
| Stale state on race | Optimistic update + server-authoritative rollback |
| Drop while server thinking | Visual loading on the unit until ack |
| Two operators move same unit | Server returns 409; UI snaps back with engine-style warning |
| Audit logging | Every allowed transition writes a log entry; every denied transition also logs (provenance trail of attempted shortcuts) |

The local enforcement still runs first — server enforcement is
defense-in-depth, not the primary gate.

## 9. What The Board Deliberately Does Not Do

- **No multi-select drag** — every transition is one unit, one decision.
- **No keyboard drag** — accessibility for the board is via the Drawer's
  buttons, not keyboard DnD.
- **No filter chips above the board** — filtering would conflict with
  the swimlane affordance and create ambiguity about whether absent
  units are filtered out or actually empty.
- **No card editing inline** — all edits are drawer-mediated.

These constraints preserve the surveyor-defensible property: every
action on the board is a single, audited, enforcement-validated state
transition.
