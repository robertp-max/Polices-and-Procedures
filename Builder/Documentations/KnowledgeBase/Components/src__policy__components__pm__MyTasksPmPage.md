# Component Documentation: src__policy__components__pm__MyTasksPmPage

## Overview
- Source file: src/policy/components/pm/MyTasksPmPage.tsx
- Exported symbols: MyTasksPmPage
- Component classification: Application component

## UI Breakdown
- JSX elements detected: string, TabKey, PmFilterState, div, header, span, a, NotificationCenter, nav, button, form, input, PmFilterBar, PmTaskCard, TaskDetailRightPanel
- Store hooks detected: usePmPersonalStore, usePmOverlayStore, useSelectedTaskStore
- React/router hooks detected: useEffect, useMemo, useState

## User Actions
- Click actions are implemented.
- Input change handling is implemented.
- Form submission handling is implemented.
- Task or selection state transitions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/components/pm/MyTasksPmPage.tsx.
- Dependency imports (first 15): react, @/policy/pm/taskProjection, @/policy/pm/personalStore, @/policy/pm/pmOverlayStore, @/policy/pm/sprintWindows, @/policy/pm/types, @/policy/pm/currentUser, ./PmTaskCard, ./PmFilterBar, ./TaskDetailRightPanel, @/policy/pm/selectedTaskStore, ./NotificationCenter, @/policy/pm/notificationTicker
- State and side-effect surfaces: useEffect, useMemo, useState

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- GAP: No explicit permission gate is directly defined in this file.

## Error Handling
- GAP: No explicit local error-handling branch is visible in this file.

## Audit & Compliance Impact
- Audit/evidence semantics are present in source tokens.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react, @/policy/pm/taskProjection, @/policy/pm/personalStore, @/policy/pm/pmOverlayStore, @/policy/pm/sprintWindows, @/policy/pm/types, @/policy/pm/currentUser, ./PmTaskCard, ./PmFilterBar, ./TaskDetailRightPanel, @/policy/pm/selectedTaskStore, ./NotificationCenter, @/policy/pm/notificationTicker
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
