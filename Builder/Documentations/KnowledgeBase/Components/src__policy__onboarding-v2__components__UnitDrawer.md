# Component Documentation: src__policy__onboarding-v2__components__UnitDrawer

## Overview
- Source file: src/policy/onboarding-v2/components/UnitDrawer.tsx
- Exported symbols: UnitDrawer
- Component classification: Application component

## UI Breakdown
- JSX elements detected: Tab, div, StatusPill, span, Calendar, PolicyVersionLink, button, X, Section, p, ShieldCheck, strong, ul, li, EvidencePanel
- Store hooks detected: useOnboardingV2Store
- React/router hooks detected: useState

## User Actions
- Click actions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/onboarding-v2/components/UnitDrawer.tsx.
- Dependency imports (first 15): react, lucide-react, ../types, ./StatusPill, ./PolicyVersionLink, ./SignerStrip, ./EvidencePanel, ./AuditTimeline, ../store/onboardingV2Store, ../types
- State and side-effect surfaces: useState

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: Observed 1 token reference(s) in source.
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
- Internal and external imports: react, lucide-react, ../types, ./StatusPill, ./PolicyVersionLink, ./SignerStrip, ./EvidencePanel, ./AuditTimeline, ../store/onboardingV2Store, ../types
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
