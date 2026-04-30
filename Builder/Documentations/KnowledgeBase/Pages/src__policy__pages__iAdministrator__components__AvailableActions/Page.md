# Page Documentation: src__policy__pages__iAdministrator__components__AvailableActions

## Page Purpose
- Source file: src/policy/pages/iAdministrator/components/AvailableActions.tsx
- Primary role: Application operational page/view.
- Exported symbols: AvailableActions

## UI Layout
- JSX elements detected: section, div, Sparkles, span, ActionButton, button, Icon, ArrowUpRight
- Core hooks: GAP: No tracked hook token detected.
- Visual and interaction dependencies: ../lib/responseTypes

## Key Actions
- Click actions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: Detected workflow token(s) in this page source.
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
