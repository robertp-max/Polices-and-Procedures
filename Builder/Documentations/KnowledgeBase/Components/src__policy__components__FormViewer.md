# Component Documentation: src__policy__components__FormViewer

## Overview
- Source file: src/policy/components/FormViewer.tsx
- Exported symbols: FormBody, FormViewer
- Component classification: Application component

## UI Breakdown
- JSX elements detected: string, div, Shield, span, h2, p, dl, dt, dd, h3, table, thead, tr, th, tbody
- Store hooks detected: useShellStore
- React/router hooks detected: useEffect, useMemo, useState, useCallback, useRef, useParams, useNavigate

## User Actions
- Click actions are implemented.
- Input change handling is implemented.
- Route navigation actions are implemented.
- Task or selection state transitions are implemented.

## System Behavior
- Behavior is derived from static source analysis of src/policy/components/FormViewer.tsx.
- Dependency imports (first 15): react, react-router-dom, lucide-react, @/assets/ci-logo-gray.png, @/policy/stores/uiStore, ../data/formsLibraryDataset, ../utils/printForm, @/policy/services/hhcFormEvidence, @/assets/eCIgn.png, ./FormSignatureFlow, ./FormSigningWorkspace, ./PolicyLinkSelector, @/policy/ecign/api, @/policy/ecign/signerIdentity
- State and side-effect surfaces: useEffect, useMemo, useState, useCallback, useRef, useParams, useNavigate

## Data Flow (policy_id, workflow_id, event_id)
- policy_id trace: Observed 1 token reference(s) in source.
- workflow_id trace: Observed 2 token reference(s) in source.
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
- Internal and external imports: react, react-router-dom, lucide-react, @/assets/ci-logo-gray.png, @/policy/stores/uiStore, ../data/formsLibraryDataset, ../utils/printForm, @/policy/services/hhcFormEvidence, @/assets/eCIgn.png, ./FormSignatureFlow, ./FormSigningWorkspace, ./PolicyLinkSelector, @/policy/ecign/api, @/policy/ecign/signerIdentity
- Upstream dependency risk: changes in imported stores/services can alter behavior even if this file remains unchanged.

## Known Issues / Gaps
- ID traceability completeness in this file: Complete (all three IDs directly referenced).
- Static analysis limitation: runtime-derived values and dynamic imports are not fully enumerable from this file alone.
