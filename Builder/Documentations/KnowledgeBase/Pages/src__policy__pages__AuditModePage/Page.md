# Page Documentation: src__policy__pages__AuditModePage

## Page Purpose
- Source file: src/policy/pages/AuditModePage.tsx
- Primary role: Application operational page/view.
- Exported symbols: AuditModePage

## UI Layout
- JSX elements detected: QuickFilter, string, AuditDateRange, QueueView, DetailTab, div, header, span, h1, HelpContextLink, CommandSearch, DateRangeFilter, button, ShieldCheck, Download
- Core hooks: useMemo, useState, useEffect, useNavigate
- Visual and interaction dependencies: react, react-router-dom, @/policy/stores/autogenStore, @/policy/stores/enforcementStore, @/policy/enforcement/useEnforcement, @/policy/help/HelpContextLink, @/policy/audit/riskScoring, @/policy/audit/exportReport, @/policy/components/regulatory/timelineState, @/policy/components/regulatory/Toast

## Key Actions
- Click actions are implemented.
- Input change handling is implemented.
- Route navigation actions are implemented.
- Task or selection state transitions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: Detected workflow token(s) in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: useAutogenStore, useRegulatoryExecutionStore, useEnforcementStore, useToastStore
- ID trace summary:
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: Observed 11 token reference(s) in source.

## Permissions
- Role or permission logic detected in source.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
