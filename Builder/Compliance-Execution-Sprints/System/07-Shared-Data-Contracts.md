# 07 — Shared Data Contracts

> Status: ACTIVE · Owner: Platform Architecture
> Companion to: [06-Command-Center-CES-Merge-Architecture.md](06-Command-Center-CES-Merge-Architecture.md)

This document is the public contract for the merged compliance platform. All shared types, the merged dataset hook, the selectors, the adapters, and the cross-component event bus live in:

```
src/policy/compliance-execution/
   complianceExecutionTypes.ts
   complianceExecutionAdapters.ts
   complianceExecutionStore.ts
   complianceExecutionSelectors.ts
   complianceExecutionEvents.ts
   index.ts                       ← single import surface
```

---

## 1. Hard Rules

1. Components **outside** `src/policy/ces/data/` and `src/policy/data/` MUST NOT import `mockSprint.ts` or `regulatoryEvents.ts` directly when crossing the Command Center ↔ CES boundary. Import from `@/policy/compliance-execution` instead.
2. The shared layer is **read-only** for consumers. Mutations still go through the existing stores (`regulatoryExecutionStore`, `enforcementStore`, `autogenStore`, `useExecutionEnforcement`).
3. Selectors are **pure functions** of `ComplianceExecutionSnapshot`. They take a snapshot in, return a derived view out. No hooks inside selectors.
4. New cross-system signals (focus, open, highlight) MUST go through `complianceExecutionEvents.ts` — not new globals or window events.

## 2. The Snapshot

```ts
import { useComplianceExecution } from '@/policy/compliance-execution';

const snap = useComplianceExecution();
//   { activeSprint, sprintHistory, today,
//     events, executionUnits, workflows,
//     auditEvaluations,
//     sprintMetrics, sprintTrends, domainRisks, ownerAssignments }
```

The snapshot is recomputed when any of the following change:
- `useAutogenStore` generated/triggered events
- `useRegulatoryExecutionStore` form/step/minutes/approvals/completions/certifications

It merges:
- `REGULATORY_EVENTS` (Command Center seed)
- `EVENTS` from `mockSprint.ts` (CES seed sprint)
- `EXECUTION_UNITS` from `mockSprint.ts` (CES seed units)
- Operational state from `regulatoryExecutionStore`
- Audit classification from `evaluateAudit`

Conflicts on `id` are resolved deterministically: **projected (RegulatoryEvent-derived) wins over CES seed**.

## 3. Selectors

| Selector | Returns |
| --- | --- |
| `selectAllEvents(s)` | All `MergedComplianceEvent[]` |
| `selectEventById(s, id)` | One event or `undefined` |
| `selectEventsInRange(s, startISO, endISO)` | Events in date range |
| `selectAllExecutionUnits(s)` | All units |
| `selectUnitsForEvent(s, eventId)` | Units anchored to an event |
| `selectUnitsByState(s, state)` | Units in a `ComplianceState` |
| `selectUnitsByPhase(s, phase)` | Units in a `WorkflowPhase` |
| `selectUnitsByDomain(s, domain)` | Units in a `ComplianceDomain` |
| `selectCriticalUnits(s)` | Overdue signatures + audit-phase blockers + not-ready blockers |
| `selectBlockedUnits(s)` | All blocked units |
| `selectOverdueUnits(s)` | Past-due open units |
| `selectAwaitingSignatureUnits(s)` | All `awaiting_signature` units |
| `selectUpcomingDeadlines(s, withinDays?, limit?)` | Sorted upcoming due units |
| `selectAuditReadinessRollup(s)` | `{ notReady, partial, ready, certified, totalOpen }` |
| `selectUnitsForControl(s, controlId, match?)` | Units linked to a Master Control |
| `selectUnitsForWorkflow(s, workflowId)` | Units in a workflow |
| `selectSprintMetrics(s)` | CES sprint metrics |
| `selectSprintTrends(s)` | Last 6 sprints |
| `selectDomainRisks(s)` | Domain risk heatmap |
| `selectOwnerAssignments(s)` | Workload distribution |

## 4. Adapters

| Function | Purpose |
| --- | --- |
| `mapDomain(d: RegulatoryDomain)` | → `ComplianceDomain` |
| `mapCategory(ev: RegulatoryEvent)` | → `EventCategory` |
| `auditStateToReadiness(state)` | `AuditState` → `AuditReadiness` |
| `auditStateToComplianceState(state)` | `AuditState` → `ComplianceState` |
| `auditStateToWorkflowPhase(state)` | `AuditState` → `WorkflowPhase` |
| `regulatoryOwner(ev)` | `RegulatoryEvent.owner` → `Owner` |
| `projectEvidence(ev, snap)` | → `EvidenceStatus` |
| `projectSigners(ev, snap)` | → `RequiredSigner[]` |
| `regulatoryEventToComplianceEvent(ev)` | → `MergedComplianceEvent` |
| `deriveExecutionUnit(ev, evaluation, snap)` | → `MergedExecutionUnit` |

The mapping table from `AuditState` to CES surfaces:

| AuditState | ComplianceState | WorkflowPhase | AuditReadiness |
| --- | --- | --- | --- |
| `certified-locked` | `completed` | `audit` | `ready` |
| `audit-ready` | `awaiting_signature` | `signature` | `ready` |
| `complete-pending-approval` | `awaiting_signature` | `review` | `partial` |
| `complete-missing-evidence` | `blocked` | `documentation` | `partial` |
| `not-certifiable` | `blocked` | `review` | `not_ready` |
| `blocked` | `blocked` | `documentation` | `not_ready` |
| `overdue` | `blocked` | `documentation` | `not_ready` |
| `at-risk` | `in_progress` | `documentation` | `partial` |
| `in-progress` | `in_progress` | `documentation` | `not_ready` |

## 5. Event Bus

```ts
import { COMPLIANCE_EVENT, emitCompliance, subscribeCompliance }
  from '@/policy/compliance-execution';

emitCompliance(COMPLIANCE_EVENT.OPEN_EXECUTION_UNIT, { unitId: 'eu-007' });

const off = subscribeCompliance(COMPLIANCE_EVENT.CALENDAR_VIEW, ({ view }) => { /* … */ });
```

| Event | Payload | When to use |
| --- | --- | --- |
| `OPEN_EVENT` | `{ eventId }` | Cross-page: focus the workflow execution panel |
| `OPEN_EXECUTION_UNIT` | `{ unitId }` | Open the CES workflow drawer |
| `CALENDAR_VIEW` | `{ view: 'calendar' \| 'sprint' }` | Sync calendar mode across surfaces |
| `FOCUS_CONTROL` | `{ controlId }` | Highlight a master control + its linked units |

## 6. What's NOT in the contract (yet)

These remain on the existing direct surfaces and are intentionally not duplicated by the shared layer:
- Per-event mutation API → use `useRegulatoryExecutionStore` directly.
- Drag/drop transition rules → use `useExecutionEnforcement` from `src/policy/ces/hooks/`.
- eCIgn signature session UI → use `useEcignSession` directly. Signer status is only **read** through the adapter.
