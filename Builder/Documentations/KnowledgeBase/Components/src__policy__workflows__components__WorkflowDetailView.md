# Component Documentation: src__policy__workflows__components__WorkflowDetailView

## Overview
- Source file: src/policy/workflows/components/WorkflowDetailView.tsx
- Exported symbols: WorkflowDetailView
- Component classification: Application component

## UI Breakdown
- JSX elements detected: TabId, div, button, span, h1, FactGrid, ProcessTab, StepsTab, FormsTab, ApprovalsTab, EscalationTab, AuditTab, ComplianceTab, dl, dt
- Store hooks detected: GAP: No Zustand-style store hook detected.
- React/router hooks detected: useMemo, useState, useCallback, useEffect, useNavigate, useParams, useAuth

## User Actions
- Click actions are implemented.
- Input change handling is implemented.
- Route navigation actions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/workflows/components/WorkflowDetailView.tsx.
- Dependency imports (first 15): react, react-router-dom, @/policy/components/FormViewer, ../brand, @/policy/data/workflows.generated, @/policy/data/formTitles.generated, @/policy/types/workflow, @/auth/AuthProvider, @/policy/security/identity
- State and side-effect surfaces: useMemo, useState, useCallback, useEffect, useNavigate, useParams, useAuth

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: Observed 6 token reference(s) in source.
- event_id trace: Observed 2 token reference(s) in source.
- If one or more IDs are missing in this file, traceability is expected to occur in parent components, stores, route loaders, or service boundaries.

## Permissions & Roles
- Authentication checks detected in source.
- Role or permission logic detected in source.

## Error Handling
- Structured try/catch error handling is present.
- Error state or error UI indicators are present.

## Audit & Compliance Impact
- Audit/evidence semantics are present in source tokens.
- Compliance traceability requirement: when this component participates in execution flows, correlated policy_id, workflow_id, and event_id must remain queryable in downstream logs/evidence.

## Dependencies
- Internal and external imports: react, react-router-dom, @/policy/components/FormViewer, ../brand, @/policy/data/workflows.generated, @/policy/data/formTitles.generated, @/policy/types/workflow, @/auth/AuthProvider, @/policy/security/identity
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: GAP (one or more IDs are not directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
