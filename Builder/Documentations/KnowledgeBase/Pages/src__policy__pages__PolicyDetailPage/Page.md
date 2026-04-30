# Page Documentation: src__policy__pages__PolicyDetailPage

## Page Purpose
- Source file: src/policy/pages/PolicyDetailPage.tsx
- Primary role: Application operational page/view.
- Exported symbols: PolicyDetailPage

## UI Layout
- JSX elements detected: div, table, thead, tr, th, tbody, td, GfmTable, h4, ul, li, p, h2, span, h3
- Core hooks: useEffect, useState, useParams, useMemo
- Visual and interaction dependencies: react, react-router-dom, @/policy/components/DraftBanner, @/policy/components/PolicyAppendicesPanel, @/policy/data/policyContentMap, @/policy/stores/policyStore, @/policy/stores/uiStore, @/policy/types, @/policy/pages/GVGBDetailView, @/policy/components/ui

## Key Actions
- Input change handling is implemented.
- Task or selection state transitions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: GAP: No direct workflow token in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: usePolicyStore, useShellStore
- ID trace summary:
- policy_id trace: Observed 3 token reference(s) in source.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- GAP: No explicit permission gate is directly defined in this file.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
