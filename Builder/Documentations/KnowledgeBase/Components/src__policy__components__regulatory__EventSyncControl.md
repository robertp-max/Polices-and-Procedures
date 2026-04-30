# Component Documentation: src__policy__components__regulatory__EventSyncControl

## Overview
- Source file: src/policy/components/regulatory/EventSyncControl.tsx
- Exported symbols: MandateBadge, EventSyncBadge, EventSyncControl
- Component classification: Application component

## UI Breakdown
- JSX elements detected: MandateType, span, EventSyncStatus, Icon, div, EventSyncBadge, MandateBadge, AlertTriangle, button, RotateCcw, Cloud
- Store hooks detected: useCalendarSyncStore, useToastStore
- React/router hooks detected: useEffect, useMemo, useState

## User Actions
- Click actions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/components/regulatory/EventSyncControl.tsx.
- Dependency imports (first 15): react, lucide-react, @/policy/data/regulatoryEvents, @/policy/stores/calendarSyncStore, @/policy/components/regulatory/Toast, @/policy/utils/complianceClassification, @/policy/data/regulatoryEvents
- State and side-effect surfaces: useEffect, useMemo, useState

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- GAP: No explicit permission gate is directly defined in this file.

## Error Handling
- Error state or error UI indicators are present.

## Audit & Compliance Impact
- GAP: This file does not directly emit audit terminology; audit linkage may occur in upstream orchestration.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react, lucide-react, @/policy/data/regulatoryEvents, @/policy/stores/calendarSyncStore, @/policy/components/regulatory/Toast, @/policy/utils/complianceClassification, @/policy/data/regulatoryEvents
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
