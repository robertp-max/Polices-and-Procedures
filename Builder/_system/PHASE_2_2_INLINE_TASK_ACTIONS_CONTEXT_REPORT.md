# Phase 2.2 — Inline Task Actions + Context-Preserved Form/Evidence Drawer

## Files changed
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- `src/policy/pages/EvidenceCenterPage.tsx`
- `src/policy/components/FormViewer.tsx`
- `scripts/checkEvidencePhase21.ts` (compatibility update for simplified tabs)
- `scripts/checkEvidencePhase22.ts` (new)
- `package.json`

## Inline upload behavior
- Added inline task action panel in `WorkflowExecutionPanel` so `Upload Supporting Evidence` runs inside the event workspace.
- Upload panel now shows explicit bound context:
  - `event_id`
  - `task_id`
  - `form_id`
  - `policy_id`
  - `workflow_id`
  - `requirement_id`
- Upload action writes through existing `regulatoryExecutionStore.uploadEvidence(...)`, preserving existing canonical evidence engine behavior and task linkage.
- Added inline success/error messaging and context-blocking if requirement/task/event mismatch is detected.

## Inline form behavior
- Added task-context inline form drawer (left-aligned) for `Complete Form`.
- Drawer embeds existing `FormViewer` in embedded mode with task-bound context (`formSource="task"`, `parentTaskId`, `hhcEventId`, `hhcWorkflowId`).
- Context header is displayed in the inline panel with all bound IDs.
- Secondary action `Open in new tab` remains available and preserves query params.

## Form route context behavior
- `FormViewer` now reads task-context query params:
  - `event_id`, `task_id`, `form_id`, `policy_id`, `workflow_id`, `requirement_id`
- Added top context banner: `Task-linked form context detected.`
- Banner keeps task linkage visible and provides `Return to Event Task Workspace` navigation.
- `Save as Evidence` now uses the task-context `event_id/workflow_id` when provided.

## Evidence route deep-link behavior
- `EvidenceCenterPage` now reads `requirement_id` query parameter and displays task-linked upload guidance banner:
  - `You are uploading evidence for this task requirement.`
- Deep-link context is displayed prominently at top of the page.
- Added event/task context mismatch blocking for deep-link upload attempts.
- Existing upload binding continues to use task/form/policy/workflow params so evidence remains non-orphan and linked.

## Validation/context mismatch behavior
- Added explicit inline task-context validator for event/task/requirement/form/policy/workflow coherence in task actions.
- Added clear user-facing error messages for blocked mismatches.
- Added evidence-route mismatch validation for `event_id` and task-bound requirement flow.

## Checks run
- `npm run check:evidence-phase01`
- `npm run check:evidence-phase15`
- `npm run check:evidence-phase2`
- `npm run check:evidence-phase21`
- `npm run check:evidence-phase22`

All checks passed.

## Remaining gaps
- Inline form completion currently opens the embedded form context and generates/marks form progress, but full granular "save-complete back-propagation" still depends on existing form submission architecture.
- Summary-tab components remain in file for compatibility reference but are no longer primary entry points (Phase 2.3 simplification).
