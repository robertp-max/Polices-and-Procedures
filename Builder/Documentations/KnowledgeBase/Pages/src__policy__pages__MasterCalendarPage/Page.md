# Page Documentation: src__policy__pages__MasterCalendarPage

## Page Purpose
- Source file: src/policy/pages/MasterCalendarPage.tsx
- Primary role: Application operational page/view.
- Exported symbols: MasterCalendarPage

## UI Layout
- JSX elements detected: string, BulkSyncSummary, div, TimelineHeader, JulyReadinessBanner, TimelineMonth, TaskDetailRightPanel, WorkflowExecutionPanel, SprintBoardView, SprintTaskPanel, KanbanView, EmptyRightPanel, GanttView, ToastHost, SurfaceCard
- Core hooks: useEffect, useMemo, useState
- Visual and interaction dependencies: react, react-router-dom, @/policy/stores/uiStore, @/policy/stores/regulatoryExecutionStore, @/policy/stores/autogenStore, @/policy/components/regulatory/Toast, @/policy/components/regulatory/Toast, @/policy/components/regulatory/TimelineMonth, @/policy/components/regulatory/WorkflowExecutionPanel, @/policy/ces/components/details/SprintTaskPanel, @/policy/compliance-execution, @/policy/components/pm/PmViews, @/policy/components/pm/TaskDetailRightPanel, @/policy/pm/selectedTaskStore, @/policy/stores/calendarSyncStore

## Key Actions
- Click actions are implemented.
- Task or selection state transitions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: Detected workflow token(s) in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: useShellStore, useRegulatoryExecutionStore, useAutogenStore, useToastStore, useSelectedTaskStore, useCalendarSyncStore
- ID trace summary:
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: Observed 1 token reference(s) in source.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- Role or permission logic detected in source.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
