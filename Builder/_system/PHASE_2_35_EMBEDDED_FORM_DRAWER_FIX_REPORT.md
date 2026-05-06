# Phase 2.35 — Embedded Form Drawer Rendering Fix

## Files changed
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` — rewrote `InlineTaskActionPanel`
- `src/policy/pages/EvidenceCenterPage.tsx` — readability fixes
- `scripts/checkEvidencePhase22.ts` — compatibility patch for context-strip format change
- `scripts/checkEvidencePhase235.ts` — new phase checks
- `package.json` — added `check:evidence-phase235` script

## Root cause

Three distinct issues were present in the Phase 2.2 implementation:

1. **Wrong drawer direction for forms.** `InlineTaskActionPanel` used a conditional `justify-start` class when `isFormDrawer` was true (FORM_COMPLETION + formId present). This made the form panel slide in from the **left** edge instead of the right, visually breaking the event workspace by pushing the main page content to the side.

2. **Embedded form hidden behind action button.** The FORM_COMPLETION branch rendered the FormViewer correctly inside the panel, but the "Complete Form" primary action button was still displayed at the bottom — the same label as the row action that opened the panel. This created a confusing loop: clicking "Complete Form" in the panel footer called `generateFormInstance` + toast + `return`, which kept the form visible but confused users who expected clicking the button to actually submit the form.

3. **Evidence Center text-selection highlight.** Table rows in the Evidence Center had no `select-none` guard, so clicking/dragging caused the browser to blue-highlight text across rows, making the table appear "selected" and unreadable. The task-linked guidance banner also used semi-transparent Tailwind teal classes that blended into the dark background and were hard to read.

## Embedded form rendering fix

`InlineTaskActionPanel` was fully rewritten with a clean `flex flex-col` layout:

- **Always right-side.** Removed all `justify-start` and `isFormDrawer` conditional direction logic. All action types now use `flex justify-end` so the panel slides from the right consistently.
- **Wider panel for forms.** Form type uses `w-[min(680px,92vw)]`; all other types use `w-[480px]`.
- **Three-zone layout**: fixed header → fixed context strip → scrollable body → fixed footer actions.
- **FormViewer fills the body.** For FORM_COMPLETION the scrollable body is a `flex flex-col h-full` container where the FormViewer takes all remaining space inside a `bg-white` scroll region, keeping the form fully visible without any clipping or blanking.
- **`generateFormInstance` fires on mount** (via `useEffect` with empty dependency array), not on button click, so the form context is already registered in the store before the user interacts with the form.

## Context preservation behavior

The context strip shows all six binding IDs compactly:
- `event:` — `dataflow.eventId`
- `task:` — `task.id`
- `form:` — `formId`
- `policy:` — `policyId`
- `workflow:` — `workflowId`
- `req:` — `requirement.requirement_id` (short suffix)

These are forwarded to `FormViewer` via `hhcEventId`, `parentTaskId`, and `hhcWorkflowId` props.

## Action button fix (FORM_COMPLETION)

The footer "Complete Form" button is replaced with **"Mark as Complete"** for FORM_COMPLETION type:
- "Mark as Complete" writes `setFormStatus(eventId, formId, 'complete')` and appends a `FORM_INSTANCE_CREATED` audit event.
- "Open in new tab" remains as secondary action, preserving all query params via `buildTaskLinkedFormRoute`.
- No duplicate "Complete Form" button appears.

## Evidence readability fix

- Added `select-none` to all Evidence Center table rows to prevent browser text-selection highlight on click.
- Replaced the task-linked guidance banner's semi-transparent Tailwind alpha classes with explicit hex colors (`bg-[#0F4A45] border-[#2D8C83] text-[#D1FAE5]`) that render consistently on the dark background without bleed or wash.
- Added `select-none` to the banner itself so clicking it does not trigger selection.

## Checks run

- `npm run check:evidence-phase01` — PASS
- `npm run check:evidence-phase15` — PASS
- `npm run check:evidence-phase2` — PASS
- `npm run check:evidence-phase21` — PASS
- `npm run check:evidence-phase22` — PASS (compatibility patch for context-strip text change)
- `npm run check:evidence-phase23` — PASS
- `npm run check:evidence-phase235` — PASS (8 assertions)

## Remaining gaps

- The embedded `FormViewer` renders in embedded mode which hides the top print/download/save action bar. Users who want to save form values as compliance evidence must use "Open in new tab" to access the full standalone form page with its "Save as Evidence" button.
- `hhcWorkflowId` and `hhcEventId` are passed to the embedded FormViewer but the eSign certificate block still reads `queryEventId` (the `?event=` param) rather than `event_id`. If the FormViewer is opened embedded, the certificate will use whatever was in the form's own URL params. This is a pre-existing limitation of the FormViewer eSign flow and is out of scope for this phase.
