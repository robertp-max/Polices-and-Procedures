# Component Documentation: src__auth__components__AuthCard

## Overview
- Source file: src/auth/components/AuthCard.tsx
- Exported symbols: AuthCard, useAuthTheme
- Component classification: Application component

## UI Breakdown
- JSX elements detected: AuthCardProps, div, button, img, p, h1
- Store hooks detected: useShellStore
- React/router hooks detected: GAP: No tracked hook token detected.

## User Actions
- Click actions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/auth/components/AuthCard.tsx.
- Dependency imports (first 15): react, @/assets/ci-ion-logo.png, @/assets/ci-logo-gray.png, @/policy/stores/uiStore
- State and side-effect surfaces: GAP: No direct hook surfaces detected.

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- Authentication checks detected in source.

## Error Handling
- Error state or error UI indicators are present.

## Audit & Compliance Impact
- Audit/evidence semantics are present in source tokens.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react, @/assets/ci-ion-logo.png, @/assets/ci-logo-gray.png, @/policy/stores/uiStore
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
