# Page Documentation: src__policy__pages__iAdministrator__index

## Page Purpose
- Source file: src/policy/pages/iAdministrator/index.tsx
- Primary role: Application operational page/view.
- Exported symbols: IAdministratorPage

## UI Layout
- JSX elements detected: StudioTabId, string, DemoCriticalEmergencyState, ResolvedComplianceActionDefinition, div, h1, p, button, Search, MessageSquare, span, SlidersHorizontal, HelpCircle, HealthStrip, Loader2
- Core hooks: useCallback, useEffect, useMemo, useState, useNavigate
- Visual and interaction dependencies: react, react-router-dom, lucide-react, @/policy/stores/uiStore, ./components/CommandBar, ./components/StructuredAnswer, ./components/RequirementsSnapshot, ./components/CitationChips, ./components/ReferenceCards, ./components/AvailableActions, ./components/StudioTabs, ./components/RightPanelPreview, ./components/NoAnswer, ./components/ScenarioResponse, ./components/ScenarioActionSections

## Key Actions
- Click actions are implemented.
- Input change handling is implemented.
- Form submission handling is implemented.
- Route navigation actions are implemented.
- Task or selection state transitions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: Detected workflow token(s) in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: useShellStore
- ID trace summary:
- policy_id trace: Observed 1 token reference(s) in source.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- GAP: No explicit permission gate is directly defined in this file.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
