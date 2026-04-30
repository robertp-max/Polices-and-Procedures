# Component Documentation: src__policy__components__SharedPolicyDetailView

## Overview
- Source file: src/policy/components/SharedPolicyDetailView.tsx
- Exported symbols: SharedGlassTable, SharedPolicyDetailView
- Component classification: Application component

## UI Breakdown
- JSX elements detected: div, table, thead, tr, th, tbody, td, h2, Icon, span, GenericGfmTable, h4, ul, li, p
- Store hooks detected: useShellStore
- React/router hooks detected: useEffect, useState, useRef

## User Actions
- Click actions are implemented.
- Input change handling is implemented.
- Task or selection state transitions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/components/SharedPolicyDetailView.tsx.
- Dependency imports (first 15): react, @/assets/ci-logo-gray.png, @/policy/stores/uiStore, @/policy/components/FormViewer, @/policy/components/PolicyAppendicesPanel, @/policy/utils/printForm, @/policy/types
- State and side-effect surfaces: useEffect, useState, useRef

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: Observed 25 token reference(s) in source.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- Authentication checks detected in source.
- Role or permission logic detected in source.

## Error Handling
- GAP: No explicit local error-handling branch is visible in this file.

## Audit & Compliance Impact
- Audit/evidence semantics are present in source tokens.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react, @/assets/ci-logo-gray.png, @/policy/stores/uiStore, @/policy/components/FormViewer, @/policy/components/PolicyAppendicesPanel, @/policy/utils/printForm, @/policy/types
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
