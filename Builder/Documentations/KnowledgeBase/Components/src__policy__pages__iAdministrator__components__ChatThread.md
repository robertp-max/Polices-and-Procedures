# Component Documentation: src__policy__pages__iAdministrator__components__ChatThread

## Overview
- Source file: src/policy/pages/iAdministrator/components/ChatThread.tsx
- Exported symbols: ChatThread
- Component classification: Page-scoped component

## UI Breakdown
- JSX elements detected: div, span, button, p, string, ChevronUp, ChevronDown, StructuredAnswer, RequirementsSnapshot, CitationChips, OperationalGaps, RegulatoryAlerts, HTMLDivElement, HTMLTextAreaElement, EmergencyBanner
- Store hooks detected: GAP: No Zustand-style store hook detected.
- React/router hooks detected: useEffect, useRef, useState

## User Actions
- Click actions are implemented.
- Input change handling is implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/pages/iAdministrator/components/ChatThread.tsx.
- Dependency imports (first 15): react, lucide-react, ../lib/sessionTypes, ../lib/sessionTypes, ./StructuredAnswer, ./CitationChips, ./RequirementsSnapshot, ./OperationalGaps, ./RegulatoryAlerts, ./EmergencyBanner, ../lib/responseTypes
- State and side-effect surfaces: useEffect, useRef, useState

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- Role or permission logic detected in source.

## Error Handling
- Error state or error UI indicators are present.

## Audit & Compliance Impact
- GAP: This file does not directly emit audit terminology; audit linkage may occur in upstream orchestration.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react, lucide-react, ../lib/sessionTypes, ../lib/sessionTypes, ./StructuredAnswer, ./CitationChips, ./RequirementsSnapshot, ./OperationalGaps, ./RegulatoryAlerts, ./EmergencyBanner, ../lib/responseTypes
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
