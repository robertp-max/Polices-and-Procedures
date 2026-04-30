# Component Documentation: src__policy__components__regulatory__EvidencePanel

## Overview
- Source file: src/policy/components/regulatory/EvidencePanel.tsx
- Exported symbols: EvidencePanel
- Component classification: Application component

## UI Breakdown
- JSX elements detected: div, span, button, UploadCloud, FilePlus2, EvidenceEmpty, ul, EvidenceRow, UploadModal, li, p, Download, Trash2, Paperclip, ClipboardCheck
- Store hooks detected: useRegulatoryExecutionStore, useToastStore
- React/router hooks detected: useState

## User Actions
- Click actions are implemented.
- Input change handling is implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/components/regulatory/EvidencePanel.tsx.
- Dependency imports (first 15): react, @/policy/data/regulatoryEvents, ./Toast, ./ModalShell
- State and side-effect surfaces: useState

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: Observed 1 token reference(s) in source.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- GAP: No explicit permission gate is directly defined in this file.

## Error Handling
- GAP: No explicit local error-handling branch is visible in this file.

## Audit & Compliance Impact
- Audit/evidence semantics are present in source tokens.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react, @/policy/data/regulatoryEvents, ./Toast, ./ModalShell
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
