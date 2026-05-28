# Swimlane Modal Centering and Canonical Behavior Report

Generated: 2026-05-28

## Files Changed

- `src/policy/workflows/swimlanes/useSwimlaneModalPosition.ts`
- `src/policy/workflows/swimlanes/SwimlaneWorkspaceOverlay.tsx`
- `src/policy/workflows/swimlanes/buildFallbackSwimlane.ts`
- `src/policy/workflows/swimlanes/swimlaneRegistry.ts`
- `src/policy/workflows/swimlanes/SwimlaneRoutePage.tsx`
- `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx`
- `src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx`

## Root Cause

The modal overlay was measured from the swimlane route/container bounding box without clipping that box to the visible browser viewport. In the app shell, some swimlane containers can be taller than the visible workspace, so a mathematically centered modal could still appear too high/low or extend off-screen.

The QA custom route and generated renderer also had duplicated overlay logic, which made behavior drift more likely.

## Fix

- Added a shared `useSwimlaneModalPosition()` hook.
- Added a shared `SwimlaneWorkspaceOverlay` portal.
- The overlay is rendered outside the transformed/panning canvas with `position: fixed`.
- The overlay is aligned to the measured swimlane workspace rect, clipped to the visible viewport.
- The overlay exposes workspace width/height CSS variables so modal shells cannot exceed the visible workspace.
- QA-WF-03 and generated swimlanes now use the same fixed workspace overlay behavior.

## Panning / Transform Behavior

- Modal is not rendered inside the canvas.
- Modal is not positioned from clicked-node coordinates.
- Canvas pointer panning is inactive while modal zoom is open.
- Level 1 and level 2 modals both use the same workspace-centered overlay.

## Fallback Route Behavior

`/events/cost_report_filing-20260531-01/swimlane` now renders an honest minimal fallback swimlane instead of an unavailable/blank page when the event ID is not present in `REGULATORY_EVENTS`.

Fallback mode does not create forms, evidence, signatures, signer tasks, or completion records.

## Browser Verification

Playwright smoke test:

- Open route.
- Click first `.swimlane-card`.
- Measure visible workspace center.
- Measure modal center.
- Assert `dx <= 32`, `dy <= 32`, no console errors, and modal fully inside visible workspace.

| Route | Cards | dx | dy | Onscreen | Console Errors | Result |
| --- | ---: | ---: | ---: | --- | --- | --- |
| `/workflows/QA-WF-03-swimlane` | 13 | 0 | 0 | yes | 0 | PASS |
| `/workflows/CL-WF-26/swimlane?eventId=plan_of_care_audit-20260507-01&taskId=CL-WF-26-STEP-01` | 7 | 0 | 0 | yes | 0 | PASS |
| `/events/qapi_meeting-20260507-08/swimlane` | 15 | 0 | 0 | yes | 0 | PASS |
| `/events/cost_report_filing-20260531-01/swimlane` | 4 | 0 | 0 | yes | 0 | PASS |
| `/events/compliance_report_weekly-20260511-01/swimlane` | 5 | 0 | 0 | yes | 0 | PASS |

Level-two verification:

| Route | Workspace | dx | dy | Onscreen | Result |
| --- | --- | ---: | ---: | --- | --- |
| `/workflows/QA-WF-03-swimlane` artifact workspace | level 2 | 0 | 0 | yes | PASS |

## Build Result

`npm run build`: PASS.

Build warnings only:

- Plugin timing warning.
- Large chunk warning for existing bundle size.

## Remaining Limitations

- QA-WF-03 still owns its rich custom content layout; the shared work here unifies the modal overlay behavior without redesigning the canonical QA-WF-03 page.
- The generated swimlane node/card design remains the existing shared renderer design; no unrelated visual redesign was performed.
- The cost report URL is a fallback because that exact event ID does not currently exist in `REGULATORY_EVENTS`.
