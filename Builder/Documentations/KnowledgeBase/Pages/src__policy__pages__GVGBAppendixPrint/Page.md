# Page Documentation: src__policy__pages__GVGBAppendixPrint

## Page Purpose
- Source file: src/policy/pages/GVGBAppendixPrint.tsx
- Primary role: Application operational page/view.
- Exported symbols: GVGBAppendixPrint

## UI Layout
- JSX elements detected: string, div, img, h1, p, th, td, input, InfoBox, strong, table, colgroup, col, thead, tr
- Core hooks: useEffect, useState, useParams
- Visual and interaction dependencies: react, react-router-dom

## Key Actions
- Click actions are implemented.
- Input change handling is implemented.

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
- Authentication checks detected in source.
- Role or permission logic detected in source.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
