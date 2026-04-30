# Component Documentation: src__policy__components__pm__PmViews

## Overview
- Source file: src/policy/components/pm/PmViews.tsx
- Exported symbols: KanbanView, GanttView, SprintBoardView
- Component classification: Application component

## UI Breakdown
- JSX elements detected: PmTaskStatus, SurfaceCard, UiEmptyState, div, PmTaskCard, header, span, DraggableTaskCard, string, EmptyState, DndContext, KanbanColumn, HTMLDivElement, select, option
- Store hooks detected: usePmOverlayStore, usePmPersonalStore, useShellStore
- React/router hooks detected: useMemo, useRef, useState

## User Actions
- Click actions are implemented.
- Input change handling is implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/components/pm/PmViews.tsx.
- Dependency imports (first 15): react, @dnd-kit/utilities, @/policy/pm/ecignStatusMap, @/policy/pm/taskProjection, @/policy/pm/pmOverlayStore, @/policy/pm/personalStore, @/policy/compliance-execution, ./PmTaskCard, ./EntityLink, @/policy/stores/uiStore, @/policy/components/ui
- State and side-effect surfaces: useMemo, useRef, useState

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: Observed 3 token reference(s) in source.
- event_id trace: Observed 8 token reference(s) in source.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- Role or permission logic detected in source.

## Error Handling
- Structured try/catch error handling is present.
- Error state or error UI indicators are present.

## Audit & Compliance Impact
- GAP: This file does not directly emit audit terminology; audit linkage may occur in upstream orchestration.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react, @dnd-kit/utilities, @/policy/pm/ecignStatusMap, @/policy/pm/taskProjection, @/policy/pm/pmOverlayStore, @/policy/pm/personalStore, @/policy/compliance-execution, ./PmTaskCard, ./EntityLink, @/policy/stores/uiStore, @/policy/components/ui
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
