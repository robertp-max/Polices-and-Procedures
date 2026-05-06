# KB-010 — CES board and execution units

## Summary

The **CES board** displays **execution units** (`MergedExecutionUnit`). When the app has **regulatory events**, those units are built from **`buildEventExecutionDataflow`** output (`cesExecutionUnits`) — a **strict projection**: CES does not invent parallel tasks.

## Fallback behavior

If **no regulatory events** exist in the environment, the compliance execution snapshot may fall back to **onboarding engine** units so the board is never empty in demo mode. In production datasets with real regulatory events, the regulatory path dominates.

## Traceability fields

Execution units derived from regulatory dataflow typically carry:

- **`sourceEventId`** — RegulatoryEvent id
- **`taskSourceId`** — Stable merge key from the task model
- **`sourceEvidenceIds`** — Evidence ids rolled up to the task
- **`folderPath`** — Task folder root for deep links / exports
- **`auditReadinessScore`** — Event-level readiness surfaced on cards
- **`regulatoryRef`** — Pointer back to full RegulatoryEvent for drill-down UIs

## Interaction model

- **Read-first:** Drag/drop and visual affordances operate on projection data; mutations go back through **store actions** (task updates, evidence uploads, etc.) that keep audit parity.
- **Click-through:** Selecting a card should open the same underlying **event drawer** context for detailed work.

## See also

- [KB-001](./KB-001-Introduction-and-Glossary.md)
- `src/policy/compliance-execution/complianceExecutionStore.ts` (flatten `eventPackages`)
