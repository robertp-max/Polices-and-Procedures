# Page Documentation: src__policy__pages__BradProposal__index

## Page Purpose
- Source file: src/policy/pages/BradProposal/index.tsx
- Primary role: Application operational page/view.
- Exported symbols: BradProposalPage

## UI Layout
- JSX elements detected: span, div, Label, Icon, Eyebrow, ul, li, button, Skull, Building2, ChevronRight, Tag, X, p, InfoCell
- Core hooks: useState, useMemo, useEffect, useNavigate
- Visual and interaction dependencies: react, react-router-dom

## Key Actions
- Click actions are implemented.
- Input change handling is implemented.
- Route navigation actions are implemented.
- Task or selection state transitions are implemented.

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
- Authentication checks detected in source.
- Role or permission logic detected in source.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
