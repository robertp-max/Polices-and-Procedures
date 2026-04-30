# Page Documentation: src__policy__onboarding-v2__pages__AuditReadinessPage

## Page Purpose
- Source file: src/policy/onboarding-v2/pages/AuditReadinessPage.tsx
- Primary role: Application operational page/view.
- Exported symbols: AuditReadinessPage

## UI Layout
- JSX elements detected: string, Tab, div, header, h1, p, button, Download, section, select, optgroup, option, FileSearch2, strong, span
- Core hooks: useMemo, useState
- Visual and interaction dependencies: react, lucide-react, ../store/onboardingV2Store, ../components/GateTile, ../components/StatusPill, ../components/PolicyVersionLink, ../components/AuditTimeline, ../engine/audit, ../engine/gates, ../types

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
- Role or permission logic detected in source.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
