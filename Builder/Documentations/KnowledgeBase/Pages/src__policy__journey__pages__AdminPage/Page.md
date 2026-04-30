# Page Documentation: src__policy__journey__pages__AdminPage

## Page Purpose
- Source file: src/policy/journey/pages/AdminPage.tsx
- Primary role: Application operational page/view.
- Exported symbols: AdminPage

## UI Layout
- JSX elements detected: div, h1, Kpi, Users, ShieldCheck, AlertTriangle, FileText, Clock, table, thead, tr, th, tbody, td, span
- Core hooks: useMemo
- Visual and interaction dependencies: react, @/policy/journey/stores/journeyStore, @/policy/journey/utils/gating, @/policy/journey/utils/escalation

## Key Actions
- Click actions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: GAP: No direct workflow token in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: useJourneyStore
- ID trace summary:
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- GAP: No explicit permission gate is directly defined in this file.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
