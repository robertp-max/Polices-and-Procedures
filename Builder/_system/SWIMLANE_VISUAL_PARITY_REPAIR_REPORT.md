# Swimlane Visual Parity Repair Report

Generated: 2026-05-28

## Prior Report Limitation

The prior `SWIMLANE_MODAL_CENTERING_AND_CANONICAL_BEHAVIOR_REPORT.md` correctly proved modal centering and build health, but it did **not** prove visual parity.

That was the gap. Centered modals alone did not mean generated swimlanes looked like `QA-WF-03`.

## Root Cause Of Visual Drift

Generated swimlanes had drifted away from the canonical `QA-WF-03` visual system in three concrete ways:

1. The shared renderer still used a flatter, cheaper visual treatment than the authored QA route.
2. Generated routes were being polluted by onboarding/UAT overlays that visually degraded the swimlane workspace.
3. Generated cards/status chips/copy density were more cramped, which made routes like `GV-WF-01` read as a generic system diagram instead of the same premium workflow surface family.

## Files Changed

- `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx`
- `src/policy/components/onboarding/GuidedTourGate.tsx`
- `src/policy/components/onboarding/GuidedUatWidget.tsx`

## QA-WF-03 Pieces Reused Or Matched

The repair did not introduce a third design. It pulled generated swimlanes closer to the existing `QA-WF-03` system by reusing or matching the same family cues:

- Same route header language style: execution-surface subtitle instead of generic source-type copy
- Same phase-header and lane-label typography treatment
- Same rounded dark glass card shell family
- Same centered modal overlay behavior
- Same level-one zoom shell language, including the `Zoom Level 1: Step Focus` header treatment
- Same dark V3.2 canvas shell and subtle orthogonal connector approach
- Same grab/grabbing interaction model with modal-open freeze

## Generated Swimlane Visual Changes

- Removed onboarding/UAT overlays from swimlane routes so the workspace is no longer visually polluted.
- Increased generated node footprint from `260x110` to `288x116` to stop long workflow/event steps from looking cramped.
- Replaced long noisy status pills with compact QA-style badges such as `Req`, `Review`, and `Sign`.
- Strengthened the shared card chrome so generated cards carry the same family feel as QA instead of a dull gray board look.
- Reduced connector dominance by softening default connector weight and opacity while preserving orthogonal routing.
- Standardized generated route header copy to the same execution-surface tone used by the QA route.
- Matched the generated modal header shell more closely to QA.

## Drag-To-Pan

Drag-to-pan remains enabled on QA and generated swimlanes:

- Double-tap-and-hold / mouse-hold activation logic remains in the swimlane workspace.
- Verification also confirmed pointer-driven pan changes the workspace scroll position.
- Panning is blocked while modal zoom is open.
- Verification confirmed no modal remained open after drag.

## Screenshots Saved

Saved under `Builder/_system/screenshots/swimlane-visual-parity/`:

- `qa-overview.png`
- `qa-modal.png`
- `gv-overview.png`
- `gv-modal.png`
- `cl-overview.png`
- `cl-modal.png`
- `event-overview.png`
- `event-modal.png`
- `fallback-overview.png`
- `fallback-modal.png`
- `verification-results.json`

## Routes Tested

- `/workflows/QA-WF-03-swimlane`
- `/workflows/GV-WF-01-swimlane`
- `/workflows/CL-WF-26/swimlane?eventId=plan_of_care_audit-20260507-01&taskId=CL-WF-26-STEP-01`
- `/events/qapi_meeting-20260507-08/swimlane`
- `/events/cost_report_filing-20260531-01/swimlane`

## Programmatic Comparison

Source: `Builder/_system/screenshots/swimlane-visual-parity/verification-results.json`

| Route | Card Size | Radius | Phase Header | Lane Label | Modal dx/dy | Drag | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `QA-WF-03` | `260x110` | `18px` | `11px / 1.98px` | `11px / 1.54px` | `0 / 0` | yes | PASS |
| `GV-WF-01` | `288x116` | `18px` | `11px / 1.98px` | `11px / 1.54px` | `0 / 0` | yes | PASS |
| `CL-WF-26` | `288x116` | `18px` | `11px / 1.98px` | `11px / 1.54px` | `0 / 0` | yes | PASS |
| `qapi_meeting-20260507-08` | `288x116` | `18px` | `11px / 1.98px` | `11px / 1.54px` | `0 / 0` | yes | PASS |
| `cost_report_filing-20260531-01` | `288x116` | `18px` | `11px / 1.98px` | `11px / 1.54px` | `0 / 0` | yes | PASS |

## Visual Parity Result Per Route

### QA-WF-03
PASS.

The canonical route remains visually strong and continues to define the target system.

### GV-WF-01
PASS.

This route no longer presents as a cheap grid/board. The shared renderer now gives it the same family shell, readable node scale, calmer connectors, and centered modal behavior expected from the QA baseline.

### CL-WF-26
PASS.

The event-execution route now reads as the same component family as QA, with matching canvas shell, typography treatment, centered modal behavior, and preserved drag interaction.

### qapi_meeting-20260507-08
PASS.

The event-first swimlane now visually aligns with the QA family and no longer carries unrelated overlay noise.

### cost_report_filing-20260531-01
PASS.

The fallback swimlane still honestly shows unresolved content, but it now uses the same visual shell instead of presenting as a downgraded alternate UI.

## Build Result

`npm run build`: PASS

Build warnings remained limited to existing bundle/plugin timing warnings.

## Remaining Limitations

- Generated cards are slightly wider than the authored QA cards (`288x116` vs `260x110`) so longer generated workflow/event titles remain readable at desktop zoom. This was an intentional readability choice inside the same visual family, not a new design system.
- `cost_report_filing-20260531-01` is still a fallback route because the requested event ID is unresolved in the source event dataset.
- QA still has authored content density advantages in certain node narratives; this repair aligned the visual system and interaction shell, not the authored business content itself.
