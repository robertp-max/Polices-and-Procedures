# CES — System Layer
## How the Implemented System Actually Works

This directory documents CES **as built**, not as conceived. Where the
[`Documentation/`](../Documentation/) layer answers "what is CES and why",
the System layer answers "what does the running code actually do, surface
by surface, action by action".

If you are debugging an enforcement decision, tracing why a card looks the
way it does, or wiring a new external integration — start here.

| # | Document | Focus |
|---|----------|-------|
| 00 | [README](./00-README.md) | This file |
| 01 | [UI to Execution Mapping](./01-UI-to-Execution-Mapping.md) | How types render as cards, columns, drawers |
| 02 | [Enforcement Implementation](./02-Enforcement-Implementation.md) | Walkthrough of `useExecutionEnforcement` |
| 03 | [Board Operation in Use](./03-Board-Operation-In-Use.md) | DnD flow, snap-back, swimlanes, warnings |
| 04 | [eCIgn Integration](./04-eCIgn-Integration.md) | Signature handoff, roster updates, closure trigger |
| 05 | [Audit and Evidence Generation](./05-Audit-and-Evidence-Generation.md) | How `auditIndexCreated` flips, completed-column filter |

## Relationship to the `Documentation/` Layer

| Documentation/ | System/ |
|----------------|---------|
| Specifies the model | Describes the running implementation |
| Audience: executives, surveyors, engineers | Audience: engineers, on-call operators |
| Stable across UI rewrites | Tracks the current code |
| Changes via governance | Changes when code changes |

## Pointers

| Concept | Implementation |
|---------|---------------|
| Type system | [`src/policy/ces/types.ts`](../../../src/policy/ces/types.ts) |
| Enforcement | [`src/policy/ces/hooks/useExecutionEnforcement.ts`](../../../src/policy/ces/hooks/useExecutionEnforcement.ts) |
| Evidence | [`src/policy/ces/hooks/useEvidenceTracker.ts`](../../../src/policy/ces/hooks/useEvidenceTracker.ts) |
| Mock dataset | [`src/policy/ces/data/mockSprint.ts`](../../../src/policy/ces/data/mockSprint.ts) |
| Layout shell | [`src/policy/ces/layouts/CesLayout.tsx`](../../../src/policy/ces/layouts/CesLayout.tsx) |
| Dashboard | [`src/policy/ces/components/dashboard/CesExecutiveDashboard.tsx`](../../../src/policy/ces/components/dashboard/CesExecutiveDashboard.tsx) |
| Board | [`src/policy/ces/components/board/SprintExecutionBoard.tsx`](../../../src/policy/ces/components/board/SprintExecutionBoard.tsx) |
| Card | [`src/policy/ces/components/board/ExecutionUnitCard.tsx`](../../../src/policy/ces/components/board/ExecutionUnitCard.tsx) |
| Drawer | [`src/policy/ces/components/details/WorkflowDrawer.tsx`](../../../src/policy/ces/components/details/WorkflowDrawer.tsx) |
| Calendar | [`src/policy/ces/components/calendar/ComplianceCalendar.tsx`](../../../src/policy/ces/components/calendar/ComplianceCalendar.tsx) |
| Workloads | [`src/policy/ces/components/workloads/WorkloadDistribution.tsx`](../../../src/policy/ces/components/workloads/WorkloadDistribution.tsx) |
| Reports | [`src/policy/ces/components/reports/ExecutiveReports.tsx`](../../../src/policy/ces/components/reports/ExecutiveReports.tsx) |
