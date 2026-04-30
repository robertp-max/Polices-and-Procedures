# Component Documentation: src__policy__components__pm__TaskDetailRightPanel

## Overview
- Source file: src/policy/components/pm/TaskDetailRightPanel.tsx
- Exported symbols: TaskDetailRightPanel
- Component classification: Application component

## UI Breakdown
- JSX elements detected: dl, PmTaskStatus, RightDrawer, PanelHeader, div, code, SectionOverview, SectionAssignment, SectionTimeline, SectionEcign, SectionEvidence, SectionAudit, header, p, h2
- Store hooks detected: usePmOverlayStore, useSelectedTaskStore
- React/router hooks detected: useMemo

## User Actions
- Click actions are implemented.
- Task or selection state transitions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/components/pm/TaskDetailRightPanel.tsx.
- Dependency imports (first 15): react, lucide-react, @/policy/pm/taskProjection, @/policy/pm/pmOverlayStore, @/policy/pm/currentUser, @/policy/pm/formInstances, ./EntityLink, @/policy/pm/selectedTaskStore, @/policy/data/policyCorpus, @/policy/components/ui
- State and side-effect surfaces: useMemo

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: Observed 2 token reference(s) in source.
- workflow_id trace: Observed 6 token reference(s) in source.
- event_id trace: Observed 5 token reference(s) in source.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- Role or permission logic detected in source.

## Error Handling
- GAP: No explicit local error-handling branch is visible in this file.

## Audit & Compliance Impact
- Audit/evidence semantics are present in source tokens.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react, lucide-react, @/policy/pm/taskProjection, @/policy/pm/pmOverlayStore, @/policy/pm/currentUser, @/policy/pm/formInstances, ./EntityLink, @/policy/pm/selectedTaskStore, @/policy/data/policyCorpus, @/policy/components/ui
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: Complete (all three IDs directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
