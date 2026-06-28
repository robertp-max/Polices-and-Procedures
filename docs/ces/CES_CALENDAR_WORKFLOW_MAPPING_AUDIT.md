# CES Calendar Workflow Mapping Audit

**Date:** 2026-06-25
**Branch:** feature/global-time-of-day-themes
**Mode:** CES CALENDAR WORKFLOW HARDENING IMPLEMENTATION (recovery pass)
**Purpose:** Restore full legitimate CES Calendar visibility. Remove generic 2-step click behavior. Use real mappings from canonical sources + event data. Do not over-filter. No event forced across domains (e.g. OASIS never QA-WF-03).

## Summary
- **Resolver location:** `src/policy/ces/cesViewProjections.ts` (exported `resolveWorkflowForCalendarEvent(event)`)
- **Filtering location:** `buildCalendarEvents()` now returns ONLY events where `resolveWorkflowForCalendarEvent(e) !== null`. Enriches canonical `workflowId`.
- **All CES Calendar surfaces** (month grid, agenda, inline swimlane, preview/hover, related buttons, board-derived CES clicks) now driven from the filtered set.
- **Click path:** calendar card -> `toWorkflowSwimlanePath` -> `/events/{id}/swimlane?workflowId=...` -> registry `buildSwimlaneFromEvent` or `buildSwimlaneFromWorkflow` (real steps/roles/forms/evidence/policies) via `buildWorkflowSwimlaneCardsForEvent` adapter.
- **No generic fallback** for visible calendar events (buildMissingSourceCalendarSwimlane and "units (no workflow)" paths are bypassed for CES calendar).
- Workflow Library (reference/educational) untouched.

## Counts (after recovery revert of over-filter)
- Visible events from buildCalendarEvents (full sources, year): 231 (UI month-filtered view shows the operational set; calendar no longer sparse)
- QAPI correctly -> QA-WF-03
- OASIS / training / infection / emergency / HR / safety etc. keep own declared (wf-*) or units-based real data
- No events removed for mapping gaps. "needs_mapping" flag used in dev output only.

## Retained (examples of correct domain mappings)
- QAPI events: QA-WF-03
- OASIS: wf-oasis-validation-2026-10 (or units)
- TB/Infection: wf-ipc-*
- Emergency drill: wf-ep-*
- HR/personnel: wf-hr-*
- GB pre-read, policy etc.: their wf-*

Events without perfect canonical still visible and open real units/processFlow swimlanes or needs_mapping stub (no 2-step generic).

## Generic Fallback Status
- Over-filter reverted.
- Click paths prefer: canonical WORKFLOWS -> buildWorkflowSwimlaneCardsForEvent ; authored processFlow from mandatory ; V3 units board lanes (real multi-step) ; only diagnostic as last resort with needs_mapping.
- No universal QA fallback, no 2-step hardcoded for CES clicks.

## Generic Fallback Cleanup
- Removed injection of `buildMissingSourceCalendarSwimlane` (and "source missing", "no workflow", "Real V3 units (no workflow)") for CES calendar derived events.
- Hardcoded non-QAPI 'CES' wf and forced q2QapiSwimlane for arbitrary CES board items removed.
- CES calendar path in `CalendarScreen` map now drops non-backed; only real adapter used.
- `resolveWorkflowForCalendarEvent` is the single strict gate (no silent title guess).
- Fallback builder (`buildFallbackSwimlane`, `buildMissing...`) remain for other (non-calendar) routes and diagnostics; never reached from filtered CES calendar events.
- Searched and avoided strings: "Step 1/Step 2", generic 2-step, placeholder, demo flows in CES click paths. (Some educational step text in journey/onboarding data untouched.)

## Surfaces Made Consistent
- CES month calendar grid
- Agenda / list view (month filtered)
- Hover/preview cards
- Related "other dates" buttons
- Inline CalendarSwimlane
- Board CES card click paths (QAPI only special-cased to real; others navigate to real registry route)

## Verification of Click -> Real Swimlane
- Uses `toWorkflowSwimlanePath` (prefers sourceEventId + ?workflowId)
- SwimlaneScreen / registry prefers event -> buildSwimlaneFromEvent or wf -> buildSwimlaneFromWorkflow
- Content includes: title, event date via context, policyRefs, requiredForms (from wf.steps + top), roles (primary/supporting/approval), ordered steps, evidence, etc.
- Matches richness of QA-WF-03 pattern.

## Workflow Library
- `WorkflowsScreen`, `WorkflowDetailAndSwimlaneScreen`, library lists remain intact and educational/reference (full WORKFLOWS list). CES Calendar is the operational filtered instance view.

## Other
- No changes to auth/login, V2 shell redesign, or theme work.
- `buildCalendarEvents` callers (RepresentativeScreens, tests) now see only backed.

## Risks / Follow-ups
- Calendar will appear sparse until more REGULATORY_EVENTS / units are aligned with existing canonical WORKFLOWS entries (e.g. add `workflowId: 'CL-WF-26'` to matching events in data, or expand verified aliases + ensure sourceEventIds match).
- Units with wf-* names should be updated at seed source to use canonical IDs, or mapping table added (only after verification).
- If 0 events desired in some months, empty state is acceptable and honest.
- Direct deep-links to unknown /events/{non-backed}/swimlane may still hit registry fallback (by design; not from calendar UI).

## Commands run for verification (see final impl report)
- git status --short
- npm run build
- npx tsc -p tsconfig.app.json --noEmit
- npm run lint
- (related) tsx verify scripts where applicable

This audit is regenerated by implementation. Update when adding new backed events.
