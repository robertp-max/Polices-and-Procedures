# Page Documentation: src__policy__pages__GVPolicyDetailView

## Page Purpose
- Source file: src/policy/pages/GVPolicyDetailView.tsx
- Primary role: Application operational page/view.
- Exported symbols: GVPolicyDetailView, GV_POLICY_IDS

## UI Layout
- JSX elements detected: div, h2, Icon, table, thead, tr, th, tbody, td, img, h3, p, label, span, string
- Core hooks: useEffect, useState, useNavigate, useParams
- Visual and interaction dependencies: react, react-router-dom, @/policy/stores/uiStore, @/policy/components/PolicyAppendicesPanel

## Key Actions
- Click actions are implemented.
- Route navigation actions are implemented.
- Task or selection state transitions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: GAP: No direct workflow token in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: useShellStore
- ID trace summary:
- policy_id trace: Observed 46 token reference(s) in source.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- Authentication checks detected in source.
- Role or permission logic detected in source.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
