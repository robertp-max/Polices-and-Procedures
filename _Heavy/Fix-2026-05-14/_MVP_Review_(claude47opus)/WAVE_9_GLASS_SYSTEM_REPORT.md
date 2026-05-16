# Wave 9 — Glass System Report

**Date:** 2026-05-16  
**Objective:** Improve glass/panel consistency and readability without introducing a new design system.

---

## 1) Glass hierarchy decisions in this wave

Wave 9 kept the existing canonical shell and improved consistency by normalizing behavior at interaction edges:

- Preserved existing shell hierarchy in `CommandCenterLayout` (single dominant glass canvas).
- Improved compact/mobile panel behavior with `BottomSheetDrawer` in `MasterCalendarPage` to avoid edge-overdraw and cramped right-edge drawers on phones.
- Improved drawer/card ergonomics by upgrading control sizing and action discoverability, not by adding new visual layers.
- Preserved existing brand tokens and typography.

---

## 2) Surfaces where glass/readability improved

- `MasterCalendarPage` compact/mobile detail panels
  - right-edge compact drawer on mobile replaced by bottom-sheet pattern
  - improves contrast/readability and lowers modal friction on narrow viewports
- `TaskDetailRightPanel`
  - control affordances now physically operable without precision tapping
- `EvidenceCenterPage`
  - sticky action/filter rail reduces repeated vertical search and keeps command controls visible
- `AuditModePage`
  - chip/tile arrangement adjusted for narrow widths to reduce visual crowding

---

## 3) Dark/light parity

Playwright captured both dark and light for core operational surfaces:

- Dashboard
- My Tasks
- Evidence Center
- Calendar
- Forms
- Audit
- PM Dashboard

Reference files are listed in `WAVE_9_PLAYWRIGHT_SCREENSHOT_INDEX.md`.

No theme token or palette replacement was introduced; parity is refinement-only.

---

## 4) What was intentionally not changed

- No redesign of `TravelightBG` or shell-level global background strategy.
- No replacement of canonical `RightDrawer`/`BottomSheetDrawer` primitives.
- No typography family changes.
- No new motion/animation framework.
- No protected/frozen subsystem edits.

---

## 5) Visual consistency findings

1. **Improved consistency**
   - Mobile command surfaces now share stronger touch-target and panel interaction behavior.
2. **Remaining drift**
   - Some legacy pages still contain dense, desktop-first spacing and older transparency usage.
3. **No regressions observed**
   - Wave 6 regression and artifact retrieval suites remain green.

---

## 6) Rollback notes

Glass-related behavior changes are limited to:
- `MasterCalendarPage.tsx` drawer selection logic
- touch-target classes in `TaskDetailRightPanel.tsx`
- spacing/chip refinements in `AuditModePage.tsx`, `DashboardPage.tsx`, `CesEvidenceHierarchyPanel.tsx`

No global theming architecture changed; rollback is file-local and low risk.

