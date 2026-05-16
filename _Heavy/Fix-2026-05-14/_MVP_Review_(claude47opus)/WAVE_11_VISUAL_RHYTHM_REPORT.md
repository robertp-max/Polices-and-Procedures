# Wave 11 — Visual Rhythm Report

## Canonical rhythm updates

Wave 11 strengthened visual rhythm around command clusters and shell cadence without introducing new typography families or token systems.

## Density and spacing improvements

- Added command-group framing (`ci-shell-command-group`) to stabilize control density.
- Introduced canonical shell chip/subnav rhythm (`ci-shell-subnav`, `ci-shell-subnav-chip`).
- Improved top command rhythm through sticky shell bar (`ci-shell-topbar`) and nav control normalization (`ci-shell-nav-icon-btn`).
- Added mobile-safe bottom content breathing room in shell scroll region to preserve readable density around persistent controls.

## Typography/icon rhythm

- Preserved existing type family and hierarchy.
- Improved icon/control rhythm via normalized nav icon button sizing.
- Reduced over-animated competition by consolidating to subtle hover transitions.

## Before/after references

Before:
- `Builder/_system/screenshots/wave-10-uiux-premiumization/*`

After:
- `Builder/_system/screenshots/wave-11-shell-convergence/*`

Recommended review pairs:
- `desktop-*-_dashboard.png`
- `desktop-*-_calendar_view_sprint.png`
- `desktop-*-_audit.png`
- `mobile-*-_dashboard.png`
- `mobile-*-_my-tasks.png`
- `mobile-*-_audit.png`

## Unresolved visual debt

- Long-tail legacy hex/rgb warning backlog remains unchanged (known baseline debt).
- Some low-priority pages still use older spacing density conventions.
- Global shell background strategy remains intentionally unchanged to stay bounded.
