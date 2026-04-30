# Page Documentation: src__auth__pages__CheckEmailPage

## Page Purpose
- Source file: src/auth/pages/CheckEmailPage.tsx
- Primary role: Authentication and identity lifecycle page.
- Exported symbols: CheckEmailPage

## UI Layout
- JSX elements detected: AuthCard, p, form, button, Link
- Core hooks: useMemo, useState
- Visual and interaction dependencies: react, react-router-dom, ../api, ../components/AuthCard

## Key Actions
- Form submission handling is implemented.

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

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
