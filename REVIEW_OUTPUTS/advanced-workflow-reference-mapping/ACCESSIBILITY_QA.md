# Accessibility QA — Advanced Training + Workflow References

## Semantics confirmed in source
From `apps/employee-journey/app/journey/_components/WorkflowsWorkspace.tsx`:
- Reference-type filter uses `role="tablist"` with `aria-label="Reference type"`, and each option is a `role="tab"` button with `aria-selected` reflecting the active filter.
- Domain filter uses the same `role="tablist"` / `role="tab"` / `aria-selected` pattern, with `aria-label="Workflow domain"`.
- The pager is a `role="navigation"` region with `aria-label="Workflow pages"`.
- The duty-overlay picker uses a native `<details>`/`<summary>` disclosure, which is keyboard-operable and exposes state to assistive tech by default (no custom JS-only toggle).

These are real ARIA roles/labels present in the component, not assumed — confirmed by reading the source directly.

## Live spot-check performed
A scripted desktop-viewport pass confirmed the typed reference tags, duty overlays, and prototype banner render with visible text (not icon-only) and that the tablist controls are present in the accessibility tree at desktop width.

## Honest gap — NOT RUN
The full assistive-technology sweep for this workstream was **not executed**. Specifically not run:
- Screen-reader pass (NVDA/JAWS/VoiceOver) across `/journey/training/advanced`, `/journey/training/annual`, `/journey/workflows`, and `/journey/workflows/:id` — confirming tab/tablist announcement, live-region behavior on filter changes, and detail-page heading structure.
- Full keyboard-only navigation sweep — confirming that every control (search box, tablist buttons, duty `<details>`, pager buttons, workflow-row links) is reachable and operable via Tab/Shift+Tab/Enter/Space alone, with visible focus indicators, and that focus lands sensibly after a filter change resets pagination to page 1.
- Color-contrast audit of the reference-type tag colors and the prototype-banner styling against WCAG AA.

## Recommendation
Run a keyboard-only pass and at least one screen-reader pass (NVDA on Chrome is the usual baseline for this project) against the four routes above before treating this surface as accessibility-complete.
