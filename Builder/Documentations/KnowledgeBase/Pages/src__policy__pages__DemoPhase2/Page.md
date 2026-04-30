# Page Documentation: src__policy__pages__DemoPhase2

## Page Purpose
- Source file: src/policy/pages/DemoPhase2.tsx
- Primary role: Application operational page/view.
- Exported symbols: ExecutivePresentation

## UI Layout
- JSX elements detected: span, div, Tag, h1, typeof, button, ExternalLink, Icon, Dot, ChapterHead, p, Metric, h3, Play, Link
- Core hooks: useState, useNavigate
- Visual and interaction dependencies: react, react-router-dom

## Key Actions
- Click actions are implemented.
- Route navigation actions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: Detected workflow token(s) in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: useShellStore
- ID trace summary:
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- Authentication checks detected in source.
- Role or permission logic detected in source.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
