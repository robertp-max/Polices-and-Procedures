# Page Documentation: src__policy__pages__iAdministrator__components__ChatThread

## Page Purpose
- Source file: src/policy/pages/iAdministrator/components/ChatThread.tsx
- Primary role: Application operational page/view.
- Exported symbols: ChatThread

## UI Layout
- JSX elements detected: div, span, button, p, string, ChevronUp, ChevronDown, StructuredAnswer, RequirementsSnapshot, CitationChips, OperationalGaps, RegulatoryAlerts, HTMLDivElement, HTMLTextAreaElement, EmergencyBanner
- Core hooks: useEffect, useRef, useState
- Visual and interaction dependencies: react, lucide-react, ../lib/sessionTypes, ../lib/sessionTypes, ./StructuredAnswer, ./CitationChips, ./RequirementsSnapshot, ./OperationalGaps, ./RegulatoryAlerts, ./EmergencyBanner, ../lib/responseTypes

## Key Actions
- Click actions are implemented.
- Input change handling is implemented.

## Linked Workflows
- Workflow-linked tokens in source: GAP: No direct workflow token in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: GAP: No store hook token detected.
- ID trace summary:
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- Role or permission logic detected in source.

## Audit Impact
- GAP: This file does not directly emit audit terminology; audit linkage may occur in upstream orchestration.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
