# Page Documentation: src__policy__journey__pages__OnboardingV1JourneyPage

## Page Purpose
- Source file: src/policy/journey/pages/OnboardingV1JourneyPage.tsx
- Primary role: Application operational page/view.
- Exported symbols: OnboardingV1JourneyPage

## UI Layout
- JSX elements detected: string, div, button, Pause, Play, span, Volume2, h1, p, h2, h3, FileText, CheckSquare, img, ChevronLeft
- Core hooks: useEffect, useMemo, useState
- Visual and interaction dependencies: react, @/policy/journey/data/modules, @/policy/journey/types/journey

## Key Actions
- Click actions are implemented.
- Input change handling is implemented.
- Route navigation actions are implemented.

## Linked Workflows
- Workflow-linked tokens in source: Detected workflow token(s) in this page source.
- Linked workflow context should preserve workflow_id and event_id lineage for any execution transitions.

## Data Used
- Store hooks: GAP: No store hook token detected.
- ID trace summary:
- policy_id trace: GAP: No direct policy_id/policyId token in this file.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Permissions
- Role or permission logic detected in source.

## Audit Impact
- Audit/evidence semantics are present in source tokens.
- Audit requirement: page-level user actions that update regulated state must remain traceable by policy_id, workflow_id, and event_id in downstream logs/evidence.
