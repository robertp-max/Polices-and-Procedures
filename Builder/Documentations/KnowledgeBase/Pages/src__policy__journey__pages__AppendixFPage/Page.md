# Page Documentation: src__policy__journey__pages__AppendixFPage

## Page Purpose
- Source file: src/policy/journey/pages/AppendixFPage.tsx
- Primary role: Application operational page/view.
- Exported symbols: AppendixFPage

## UI Layout
- JSX elements detected: Record, number, string, div, button, ArrowLeft, EmployeePicker, h1, span, input, AlertTriangle, b, SignaturePad, ShieldCheck, img
- Core hooks: useMemo, useState, useNavigate
- Visual and interaction dependencies: react, react-router-dom, @/policy/journey/stores/journeyStore, @/policy/journey/components/SignaturePad, @/policy/journey/components/EmployeePicker, lucide-react

## Key Actions
- Click actions are implemented.
- Route navigation actions are implemented.

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
- Role or permission logic detected in source.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
