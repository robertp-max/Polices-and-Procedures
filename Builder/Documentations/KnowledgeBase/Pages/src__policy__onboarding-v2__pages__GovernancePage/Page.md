# Page Documentation: src__policy__onboarding-v2__pages__GovernancePage

## Page Purpose
- Source file: src/policy/onboarding-v2/pages/GovernancePage.tsx
- Primary role: Application operational page/view.
- Exported symbols: GovernancePage

## UI Layout
- JSX elements detected: string, div, header, h1, p, em, section, ShieldOff, h2, label, span, select, optgroup, option, textarea
- Core hooks: useState
- Visual and interaction dependencies: react, lucide-react, ../store/onboardingV2Store, ../components/StatusPill, ../catalog/policies, ../components/PolicyVersionLink

## Key Actions
- Click actions are implemented.
- Input change handling is implemented.

## Linked Workflows
- Workflow-linked tokens in source: GAP: No direct workflow token in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: useOnboardingV2Store
- ID trace summary:
- policy_id trace: Observed 1 token reference(s) in source.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- GAP: No explicit permission gate is directly defined in this file.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
