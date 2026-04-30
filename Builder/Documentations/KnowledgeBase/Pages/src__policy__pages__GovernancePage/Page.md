# Page Documentation: src__policy__pages__GovernancePage

## Page Purpose
- Source file: src/policy/pages/GovernancePage.tsx
- Primary role: Application operational page/view.
- Exported symbols: GovernancePage

## UI Layout
- JSX elements detected: div, h1, p, button, Icon, section, h3, h4, span, table, thead, tr, th, tbody, td
- Core hooks: useState
- Visual and interaction dependencies: react, @/policy/stores/frameworkStore, @/policy/stores/policyStore, @/policy/utils/selectors, lucide-react

## Key Actions
- Click actions are implemented.
- Task or selection state transitions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: GAP: No direct workflow token in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: useFrameworkStore, usePolicyStore
- ID trace summary:
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- Authentication checks detected in source.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
