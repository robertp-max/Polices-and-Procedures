# Component Documentation: src__policy__components__pm__EntityLink

## Overview
- Source file: src/policy/components/pm/EntityLink.tsx
- Exported symbols: EntityLink
- Component classification: Application component

## UI Breakdown
- JSX elements detected: span, button, Link
- Store hooks detected: GAP: No Zustand-style store hook detected.
- React/router hooks detected: GAP: No tracked hook token detected.

## User Actions
- Click actions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/components/pm/EntityLink.tsx.
- Dependency imports (first 15): react, react-router-dom
- State and side-effect surfaces: GAP: No direct hook surfaces detected.

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: Observed 2 token reference(s) in source.
- workflow_id trace: Observed 3 token reference(s) in source.
- event_id trace: Observed 3 token reference(s) in source.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- GAP: No explicit permission gate is directly defined in this file.

## Error Handling
- GAP: No explicit local error-handling branch is visible in this file.

## Audit & Compliance Impact
- GAP: This file does not directly emit audit terminology; audit linkage may occur in upstream orchestration.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react, react-router-dom
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: Complete (all three IDs directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
