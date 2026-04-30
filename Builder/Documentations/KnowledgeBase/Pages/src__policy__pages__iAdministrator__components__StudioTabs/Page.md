# Page Documentation: src__policy__pages__iAdministrator__components__StudioTabs

## Page Purpose
- Source file: src/policy/pages/iAdministrator/components/StudioTabs.tsx
- Primary role: Application operational page/view.
- Exported symbols: STUDIO_TABS, StudioTabs

## UI Layout
- JSX elements detected: Tabs, span, tab
- Core hooks: GAP: No tracked hook token detected.
- Visual and interaction dependencies: lucide-react, ../lib/responseTypes, @/policy/components/ui

## Key Actions
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
- GAP: No explicit permission gate is directly defined in this file.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
