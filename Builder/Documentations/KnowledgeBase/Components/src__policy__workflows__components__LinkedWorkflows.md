# Component Documentation: src__policy__workflows__components__LinkedWorkflows

## Overview
- Source file: src/policy/workflows/components/LinkedWorkflows.tsx
- Exported symbols: LinkedWorkflows
- Component classification: Application component

## UI Breakdown
- JSX elements detected: string, section, div, button, span
- Store hooks detected: GAP: No Zustand-style store hook detected.
- React/router hooks detected: useNavigate

## User Actions
- Click actions are implemented.
- Route navigation actions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/workflows/components/LinkedWorkflows.tsx.
- Dependency imports (first 15): react-router-dom, @/policy/data/workflowGraph.generated, @/policy/data/workflows.generated, ../brand
- State and side-effect surfaces: useNavigate

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: Observed 5 token reference(s) in source.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- Role or permission logic detected in source.

## Error Handling
- GAP: No explicit local error-handling branch is visible in this file.

## Audit & Compliance Impact
- GAP: This file does not directly emit audit terminology; audit linkage may occur in upstream orchestration.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react-router-dom, @/policy/data/workflowGraph.generated, @/policy/data/workflows.generated, ../brand
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
