# Workflow Reference UI — QA

Source: `apps/employee-journey/app/journey/_components/WorkflowsWorkspace.tsx`.

## Framing
The Workflows surface is a **Reference Library**, not a training/assignment list. Per §10/§17 of the correction spec, workflows were removed from the Training assignment list entirely — there is no "Required now" state, no progress bar, and no completion/pass state anywhere in this component. `verifyJourneyCorrections.ts` asserts this directly: `getTrainingAssignments()` for both a clinical persona and an office persona never returns an item with `category === 'Workflows'`.

## Routes
- `/journey/workflows` — the searchable/filterable library list
- `/journey/workflows/:id` — real canonical detail page per workflow, rendering: overview, triggers, cadence/SLA, step table, forms, approvals, outputs, escalation path, and upstream dependencies. This is live canonical data (from the 206-workflow catalog), not placeholder text.

## Filters and controls (confirmed in component source)
- Free-text search (`query` state)
- Reference-type filter — `role="tablist"` labeled "Reference type" (core / conditional / awareness / leadership)
- Domain filter — `role="tablist"` labeled "Workflow domain" (the 10 domains)
- Duty-overlay filter — collapsible `<details>` panel (`wf-duty`) exposing the 11 duty flags
- Persona-aware reference map: each row is annotated using `getPersonaWorkflowReferences` for the active persona + selected duties, so the same library reflects a different "your relevance" tag per viewer

## Pagination
- `PAGE_SIZE = 25` — confirmed constant in source.
- Page resets to 1 automatically whenever the filter key (query/domain/refType/duties/persona) changes.
- Result count line reads `{filtered.length} of {WORKFLOW_LIBRARY_COUNT} workflows` and appends `· page {safePage}/{totalPages}` only when there's more than one page.

## Prototype simulation banner
- The featured CL-WF-26 simulation renders a banner reading `Prototype simulation preview · {FEATURED_WORKFLOW_SIMULATION.id}` (i.e., `TRAIN-CL-WF-26`), and component copy explicitly states workflows here "are not scored training and carry no completion, progress, or pass state." This matches §18 exactly.

## No fake progress — confirmed
Nothing in this component renders a completion percentage, a pass/fail badge, or a "required now" chip for any workflow reference row. The only stateful UI is the search/filter/duty/pagination controls described above.
