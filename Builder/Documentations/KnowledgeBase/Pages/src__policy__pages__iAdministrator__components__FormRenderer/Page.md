# Page Documentation: src__policy__pages__iAdministrator__components__FormRenderer

## Page Purpose
- Source file: src/policy/pages/iAdministrator/components/FormRenderer.tsx
- Primary role: Application operational page/view.
- Exported symbols: FormRenderer

## UI Layout
- JSX elements detected: Record, string, div, span, button, Download, Printer, h2, GridSection, ChecklistSection, TableSection, FieldControl, textarea, select, option
- Core hooks: useState
- Visual and interaction dependencies: react, lucide-react, ../lib/responseTypes

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
- GAP: No explicit permission gate is directly defined in this file.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
