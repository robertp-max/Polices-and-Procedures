# Page Documentation: src__policy__onboarding-v2__pages__BatchListPage

## Page Purpose
- Source file: src/policy/onboarding-v2/pages/BatchListPage.tsx
- Primary role: Application operational page/view.
- Exported symbols: BatchListPage

## UI Layout
- JSX elements detected: BatchStatus, div, header, h1, p, Search, input, select, option, table, thead, tr, th, tbody, td
- Core hooks: useMemo, useState
- Visual and interaction dependencies: react, react-router-dom, lucide-react, ../store/onboardingV2Store, ../components/StatusPill, ../types, ./batchHelpers

## Key Actions
- Input change handling is implemented.

## Linked Workflows
- Workflow-linked tokens in source: GAP: No direct workflow token in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: useOnboardingV2Store
- ID trace summary:
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- Role or permission logic detected in source.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
