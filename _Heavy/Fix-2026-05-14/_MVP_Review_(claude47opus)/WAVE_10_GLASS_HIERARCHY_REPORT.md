# Wave 10 — Glass Hierarchy Report

## Objective

Increase glass-depth coherence and operational readability without introducing new design systems or shell rewrites.

## Changes applied

- Added `ci-operational-card` in `src/index.css` to normalize panel/card depth and border contrast.
- Added `ci-sticky-operational` to keep command rails readable while scrolling.
- Added `ci-subtle-hover` to maintain restrained interaction polish.
- Applied these patterns to:
  - `DashboardPage`
  - `AuditModePage`
  - `EvidenceCenterPage`
  - `PmDashboardPage`
  - `MyTasksPage`
  - `GuidedUatWidget`

## Hierarchy behavior outcomes

- **Layering clarity:** command surfaces now read as first-class operational layers.
- **Contrast discipline:** cards and command bars use token-driven borders/surfaces instead of ad-hoc opacity combinations.
- **Readability-first blur:** only restrained backdrop effect on sticky operational rails.
- **Dark/light parity:** no token-system replacement; parity improved through consistent primitives.

## Before/after references

Before:
- `Builder/_system/screenshots/wave-9-uiux-convergence/*`

After:
- `Builder/_system/screenshots/wave-10-uiux-premiumization/*`

Notable comparisons:
- `*_dashboard.png`
- `*_audit.png`
- `*_evidence.png`
- `*_calendar_view_sprint.png`

## Protected systems avoided

No changes to protected/frozen architecture surfaces, workflow engine internals, evidence architecture, or backend/eCign paths.

## Remaining glass debt

- Legacy deep-opacity surfaces still exist on older non-priority pages.
- Global shell background strategy remains intentionally unchanged in this wave.

## Rollback safety

All hierarchy changes are CSS/class-level and file-local; they can be reverted without affecting data/state flows.
