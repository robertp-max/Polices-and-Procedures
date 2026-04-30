# Component Documentation: src__policy__components__regulatory__WorkflowDrawer

## Overview
- Source file: src/policy/components/regulatory/WorkflowDrawer.tsx
- Exported symbols: WorkflowDrawer, WorkflowBody, FormExecutionRow
- Component classification: Application component

## UI Breakdown
- JSX elements detected: DrawerShell, Workflow, WorkflowFooter, WorkflowBody, div, EventHeadline, ProgressBar, section, h4, span, p, ol, StepRow, li, ul
- Store hooks detected: useRegulatoryExecutionStore, useToastStore
- React/router hooks detected: useMemo, useState

## User Actions
- Click actions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/components/regulatory/WorkflowDrawer.tsx.
- Dependency imports (first 15): react, @/policy/data/eventDisplayModel, @/policy/data/formsCatalog, ./Toast, ./ModalShell, ./Primitives
- State and side-effect surfaces: useMemo, useState

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: Observed 6 token reference(s) in source.
- event_id trace: Observed 5 token reference(s) in source.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- Authentication checks detected in source.
- Role or permission logic detected in source.

## Error Handling
- Error state or error UI indicators are present.

## Audit & Compliance Impact
- Audit/evidence semantics are present in source tokens.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react, @/policy/data/eventDisplayModel, @/policy/data/formsCatalog, ./Toast, ./ModalShell, ./Primitives
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
