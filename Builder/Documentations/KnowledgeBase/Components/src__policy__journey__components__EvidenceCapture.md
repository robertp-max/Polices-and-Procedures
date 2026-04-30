# Component Documentation: src__policy__journey__components__EvidenceCapture

## Overview
- Source file: src/policy/journey/components/EvidenceCapture.tsx
- Exported symbols: EvidenceCapture
- Component classification: Application component

## UI Breakdown
- JSX elements detected: SignatureRecord, div, ClipboardSignature, h2, span, button, textarea, SignaturePad, CheckCircle2, XCircle
- Store hooks detected: useJourneyStore
- React/router hooks detected: useState

## User Actions
- Click actions are implemented.
- Input change handling is implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/journey/components/EvidenceCapture.tsx.
- Dependency imports (first 15): react, lucide-react, ./SignaturePad, @/policy/journey/types/journey, @/policy/journey/stores/journeyStore
- State and side-effect surfaces: useState

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
- Internal and external imports: react, lucide-react, ./SignaturePad, @/policy/journey/types/journey, @/policy/journey/stores/journeyStore
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
