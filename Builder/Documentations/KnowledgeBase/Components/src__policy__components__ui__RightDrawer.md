# Component Documentation: src__policy__components__ui__RightDrawer

## Overview
- Source file: src/policy/components/ui/RightDrawer.tsx
- Exported symbols: RightDrawer
- Component classification: UI primitive/component

## UI Breakdown
- JSX elements detected: aside, header, div, UtilityButton, X, footer
- Store hooks detected: GAP: No Zustand-style store hook detected.
- React/router hooks detected: useEffect

## User Actions
- Click actions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/components/ui/RightDrawer.tsx.
- Dependency imports (first 15): react, lucide-react, ./UtilityButton
- State and side-effect surfaces: useEffect

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- Role or permission logic detected in source.

## Error Handling
- GAP: No explicit local error-handling branch is visible in this file.

## Audit & Compliance Impact
- Audit/evidence semantics are present in source tokens.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react, lucide-react, ./UtilityButton
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
