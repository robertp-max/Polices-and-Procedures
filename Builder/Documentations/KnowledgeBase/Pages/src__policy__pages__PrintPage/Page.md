# Page Documentation: src__policy__pages__PrintPage

## Page Purpose
- Source file: src/policy/pages/PrintPage.tsx
- Primary role: Application operational page/view.
- Exported symbols: PrintPage

## UI Layout
- JSX elements detected: table, thead, tr, th, tbody, td, div, GfmTable, ul, li, p, h3, PrintMarkdownBody, style, AlertTriangle
- Core hooks: useEffect, useParams
- Visual and interaction dependencies: react, react-router-dom, lucide-react, @/policy/data/policyContentMap, @/policy/stores/policyStore, @/policy/types

## Key Actions
- Click actions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: GAP: No direct workflow token in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: usePolicyStore
- ID trace summary:
- policy_id trace: Observed 2 token reference(s) in source.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- GAP: No explicit permission gate is directly defined in this file.

## Audit Impact
- GAP: This file does not directly emit audit terminology; audit linkage may occur in upstream orchestration.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
