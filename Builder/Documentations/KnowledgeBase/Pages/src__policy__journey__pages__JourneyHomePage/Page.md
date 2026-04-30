# Page Documentation: src__policy__journey__pages__JourneyHomePage

## Page Purpose
- Source file: src/policy/journey/pages/JourneyHomePage.tsx
- Primary role: Application operational page/view.
- Exported symbols: JourneyHomePage

## UI Layout
- JSX elements detected: PhaseId, JourneyCategory, div, h1, span, EmployeePicker, button, BookOpen, GateBanner, aside, PhaseRail, GraduationCap, MiniStat, section, h3
- Core hooks: useEffect, useMemo, useState, useNavigate
- Visual and interaction dependencies: react, react-router-dom, @/policy/journey/stores/journeyStore, @/policy/journey/data/modules, @/policy/journey/utils/gating, @/policy/journey/utils/escalation, @/policy/journey/components/PhaseRail, @/policy/journey/components/ModuleCard, @/policy/journey/components/GateBanner, @/policy/journey/components/EmployeePicker, lucide-react, @/policy/journey/types/journey

## Key Actions
- Click actions are implemented.
- Route navigation actions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: Detected workflow token(s) in this page source.
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
