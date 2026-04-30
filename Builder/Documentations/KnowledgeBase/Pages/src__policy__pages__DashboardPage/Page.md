# Page Documentation: src__policy__pages__DashboardPage

## Page Purpose
- Source file: src/policy/pages/DashboardPage.tsx
- Primary role: Application operational page/view.
- Exported symbols: DashboardPage

## UI Layout
- JSX elements detected: string, AwaitingBoardItem, div, DashboardHero, section, KpiCard, AgencyReadinessBanner, h2, p, ToolbarButton, Filter, BoardColumn, ToastHost, span, h1
- Core hooks: useMemo, useNavigate
- Visual and interaction dependencies: react, react-router-dom, @/policy/stores/uiStore, @/policy/data/formTitles.generated, @/policy/stores/autogenStore, @/policy/stores/regulatoryExecutionStore, @/policy/components/regulatory/Toast, @/policy/audit/auditState, @/policy/compliance-execution

## Key Actions
- Click actions are implemented.
- Route navigation actions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: Detected workflow token(s) in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: useShellStore, useAutogenStore, useRegulatoryExecutionStore
- ID trace summary:
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: Observed 1 token reference(s) in source.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- GAP: No explicit permission gate is directly defined in this file.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
