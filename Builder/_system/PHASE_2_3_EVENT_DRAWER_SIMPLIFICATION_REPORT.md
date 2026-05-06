# Phase 2.3 — Event Drawer Tab Simplification + Task-Centric Workspace Cleanup

## Tabs removed
- Removed these top-level tabs from event drawer navigation:
  - `Forms Summary`
  - `Evidence Summary`
  - `Signatures Summary`
- Top-level tabs are now:
  - `Overview`
  - `Tasks`
  - `Audit Trail`
  - `Technical Details`

## Preserved functionality
- Forms/evidence/signature execution remains available through expanded task execution requirements in `Tasks`.
- Existing requirement-level actions remain available:
  - `Complete Form`
  - `Upload Supporting Evidence`
  - `Request Signature`
  - `Review Package`
  - `Certify Package`
  - `Lock Package`
- Evidence and signature logic/certification logic were not replaced.

## Task workspace improvements
- Added compact, inline task utilities in `Tasks`:
  - Search (`task title / form ID / evidence ID`)
  - Requirement type filter
  - `Missing only`
  - `Pending signatures`
  - `Blocked only`
  - `Expand all`
  - `Collapse all`
- Task deep-link focus behavior updated to work with multi-expand state.

## Responsive/layout improvements
- Removing summary tabs reduced top-nav compression and left more width for task execution content.
- Compact utility row avoids a heavy toolbar while improving operational filtering.
- Structure is more resilient for laptop/tablet widths by reducing tab clutter.

## Compatibility handling
- Added legacy tab query mapping in event workspace:
  - `tab=forms`
  - `tab=evidence`
  - `tab=approvals`
  - `tab=signatures`
- Legacy values resolve to `Tasks` instead of breaking navigation, preserving task-context flow.

## Checks run
- `npm run check:evidence-phase01`
- `npm run check:evidence-phase15`
- `npm run check:evidence-phase2`
- `npm run check:evidence-phase21`
- `npm run check:evidence-phase22`
- `npm run check:evidence-phase23`

All checks passed.

## Remaining gaps
- Summary tab components are still present in source for compatibility/reference but are not rendered in top-level navigation.
- Legacy deep-link handling currently remaps via query `tab` values; no additional route aliases were introduced in this phase.

## Recommended next phase
- Phase 2.4: tighten inline task drawers with requirement-specific completion telemetry (e.g., explicit requirement completion markers after inline form save/upload/signature), plus integration-level UI tests for drawer-only execution paths.
