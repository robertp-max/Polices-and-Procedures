# Component Documentation: src__policy__journey__components__ModuleCard

## Overview
- Source file: src/policy/journey/components/ModuleCard.tsx
- Exported symbols: ModuleCard
- Component classification: Application component

## UI Breakdown
- JSX elements detected: string, button, div, StatusChip, ClipboardCheck, span, FileText, Shield, Fingerprint
- Store hooks detected: useJourneyStore
- React/router hooks detected: useNavigate

## User Actions
- Click actions are implemented.
- Route navigation actions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/journey/components/ModuleCard.tsx.
- Dependency imports (first 15): react-router-dom, lucide-react, ./StatusChip, ./StatusChip, @/policy/journey/types/journey, @/policy/journey/utils/gating, @/policy/journey/stores/journeyStore
- State and side-effect surfaces: useNavigate

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
- Internal and external imports: react-router-dom, lucide-react, ./StatusChip, ./StatusChip, @/policy/journey/types/journey, @/policy/journey/utils/gating, @/policy/journey/stores/journeyStore
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
