# Page Documentation: src__policy__journey__pages__UserGuidePage

## Page Purpose
- Source file: src/policy/journey/pages/UserGuidePage.tsx
- Primary role: Application operational page/view.
- Exported symbols: UserGuidePage

## UI Layout
- JSX elements detected: Persona, div, BookOpen, h1, Tab, User, Users, ShieldCheck, NewHireGuide, SupervisorGuide, AdminGuide, button, Section, Step, b
- Core hooks: useState
- Visual and interaction dependencies: react, lucide-react

## Key Actions
- Click actions are implemented.

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
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
