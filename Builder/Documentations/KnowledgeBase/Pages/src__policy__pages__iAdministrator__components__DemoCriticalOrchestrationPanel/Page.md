# Page Documentation: src__policy__pages__iAdministrator__components__DemoCriticalOrchestrationPanel

## Page Purpose
- Source file: src/policy/pages/iAdministrator/components/DemoCriticalOrchestrationPanel.tsx
- Primary role: Application operational page/view.
- Exported symbols: DemoCriticalOrchestrationPanel

## UI Layout
- JSX elements detected: aside, div, p, ShieldAlert, h3, MetaRow, section, h4, CheckCircle2, Clock3, button, span
- Core hooks: GAP: No tracked hook token detected.
- Visual and interaction dependencies: lucide-react, ../lib/demoCriticalEmergency

## Key Actions
- Click actions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: Detected workflow token(s) in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: GAP: No store hook token detected.
- ID trace summary:
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: Observed 2 token reference(s) in source.
- event_id trace: Observed 4 token reference(s) in source.

## Permissions
- GAP: No explicit permission gate is directly defined in this file.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
