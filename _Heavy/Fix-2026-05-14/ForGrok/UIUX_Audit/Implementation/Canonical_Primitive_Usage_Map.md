# Canonical Primitive Usage Map — Phase 2 Shell

**Phase 2 — Core Shell and Command Center Rebuild**  
**Version:** 1.0  
**Date:** 2026-05-17  
**Traceability:** `primitives/CATALOG.md` + `Shell_Architecture_Reconstruction_Plan.md` + `MASTER_UIUX_IMPLEMENTATION.md` + `CANONICAL_UI_SYSTEM_SPEC.md`

---

## Purpose

This document defines the **only allowed primitives** for every element of the reconstructed shell. 

**Rule:** All shell code must be built exclusively from primitives exported in `src/policy/components/ui/index.ts`. Creation of local one-off components inside the shell is forbidden.

---

## 1. Approved Shell Primitive Set (Phase 2)

| Primitive              | Status       | Layer | Must Be Used For                              | Notes |
|------------------------|--------------|-------|-----------------------------------------------|-------|
| `GlassPanel`           | Existing     | 1     | Main shell surface container                  | Primary Layer 1 element |
| `SurfaceCard`          | Existing     | 2     | Elevated cards, panels, and focused content inside shell | Default for Layer 2 |
| `ShellFrame`           | **New**      | 0/1   | Root layout container + 4-sided constraint    | Replaces current CommandCenterLayout root |
| `ShellTopbar`          | **New**      | 1     | Global top identity + action bar              | Must replace all inline topbar JSX |
| `ShellNavRail`         | **New**      | 1     | Desktop/laptop vertical navigation            | Primary navigation surface |
| `ShellContentFrame`    | **New**      | 1     | Constrained inner page container              | Enforces 4-sided breathing room |
| `ShellCommandGroup`    | **New**      | 1     | Semantic grouping of nav items or actions     | Replaces ad-hoc dividers and headings |
| `ShellMobileDrawer`    | **New**      | 1     | Mobile navigation (uses BottomSheetDrawer)    | Mobile nav surface |
| `BottomSheetDrawer`    | Existing     | 2     | Mobile navigation and contextual drawers      | Required for mobile shell |
| `ActionButton`         | Existing     | 2     | Primary CTAs in topbar or nav                 | Only for high-priority actions |
| `UtilityButton`        | Existing     | 2     | Secondary / icon actions in shell             | Default for most shell buttons |
| `PageHeader`           | Existing     | 2     | Page titles inside `ShellContentFrame`        | When a page needs a header |
| `SectionHeader`        | Existing     | 2     | Section titles inside shell content           | — |
| `SearchField`          | Existing     | 2     | Global search entry in `ShellTopbar`          | — |
| `ThemeModeToggle`      | Existing     | 2     | Theme switcher in topbar                      | — |
| `CiStatusBadge`        | Existing     | 2     | Status indicators in topbar or rail           | Rollout phase, environment, etc. |
| `LoadingState`         | Existing     | 2     | Shell-level loading states                    | Rare — usually page level |
| `EmptyState`           | Existing     | 2     | Shell-level empty states                      | Rare — usually page level |
| `AriaLiveRegion`       | Existing     | —     | Accessibility announcements                   | Required for nav changes |

---

## 2. Shell Element → Primitive Mapping

### 2.1 Root Layout

| Current Element                  | Must Use                          | Implementation Rule |
|----------------------------------|-----------------------------------|-----------------------|
| Outermost container + backdrop   | `ShellFrame`                      | Mandatory. Owns `TravelightBG` mounting and 4-sided inset logic. |
| Main content wrapper             | `ShellContentFrame`               | Must wrap all `<Outlet/>` content. Enforces final inset. |

### 2.2 Topbar Zone

| Current Element                  | Must Use                          | Implementation Rule |
|----------------------------------|-----------------------------------|-----------------------|
| Logo / Brand area                | `ShellTopbar` + `UtilityButton` (for logo link) | Care Indeed logo only. No CI-ION. |
| Global Search                      | `SearchField` inside `ShellTopbar` | Trigger-only in topbar; full experience via command palette or route. |
| Theme toggle                       | `ThemeModeToggle`                 | Must live in `ShellTopbar`. |
| User menu / Account actions        | `UtilityButton` + `ShellCommandGroup` | Grouped under user avatar. |
| Help / Knowledge bulb              | `ContextualKnowledgeBulb` (existing) + `UtilityButton` | — |
| Notifications / Global actions     | `UtilityButton`                   | Icon-only where appropriate. |

### 2.3 Navigation Rail (Desktop/Laptop)

| Current Element                  | Must Use                          | Implementation Rule |
|----------------------------------|-----------------------------------|-----------------------|
| Primary navigation list          | `ShellNavRail`                    | Vertical rail component. |
| Nav item groups                  | `ShellCommandGroup`               | Three groups: Primary Operations, Compliance Execution (CES), Administration. |
| Individual nav links             | `UtilityButton` (variant="nav")   | Or a dedicated `NavItem` sub-primitive if promoted. |
| Active / Hover states            | Token-driven only (`--ci-*`)      | No raw colors. |
| Sub-items / Flyouts              | `ShellCommandGroup` + `UtilityButton` | Collapse on smaller viewports. |
| Brad / Special icons             | Inline SVG moved into primitive   | `BradRobotIcon` should become part of `ShellNavRail` or a small icon primitive. |

### 2.4 Mobile Navigation

| Current Element                  | Must Use                          | Implementation Rule |
|----------------------------------|-----------------------------------|-----------------------|
| Hamburger / Mobile menu trigger  | `UtilityButton`                   | Inside `ShellTopbar`. |
| Mobile drawer content            | `ShellMobileDrawer` (wraps `BottomSheetDrawer`) | Full navigation tree inside drawer. |
| Mobile nav items                 | `UtilityButton`                   | Large touch targets (≥44px). |

### 2.5 Content Area Inside Shell

| Current Element                  | Must Use                          | Implementation Rule |
|----------------------------------|-----------------------------------|-----------------------|
| Page-level glass surface         | `GlassPanel` (data-layer="1")     | Primary container for page content. |
| Elevated cards / panels          | `SurfaceCard`                     | All Layer 2 content. |
| Page titles                      | `PageHeader`                      | Preferred. |
| Section titles                   | `SectionHeader`                   | — |
| Data tables / grids              | `DataGrid`                        | When applicable. |
| Status indicators                | `CiStatusBadge`                   | — |
| Loading / Empty states           | `LoadingState` / `EmptyState`     | — |

---

## 3. Forbidden Patterns (Shell Scope)

- No inline `<div className="...">` that mimics `GlassPanel` or `SurfaceCard`.
- No direct use of `bg-white`, `shadow-[...]`, `border-[#...]`, or arbitrary Tailwind values inside shell files.
- No route-specific topbar or nav variants.
- No direct mounting of `TravelightBG` outside `ShellFrame`.
- No creation of new local components named `Topbar`, `NavRail`, `Sidebar`, etc.

---

## 4. Promotion Path for New Primitives

All new shell primitives (`ShellFrame`, `ShellTopbar`, `ShellNavRail`, `ShellContentFrame`, `ShellCommandGroup`, `ShellMobileDrawer`) must:

1. Be added to `primitives/CATALOG.md` with status "Core — Shell".
2. Be exported from `src/policy/components/ui/index.ts`.
3. Consume only `--ci-*` tokens (no hard-coded values).
4. Support `data-layer` attribute for glassmorphism debugging.
5. Include built-in accessibility (ARIA landmarks, focus management, keyboard navigation).

---

## 5. Validation Checklist for This Map

- [ ] Every JSX element in the final shell files maps to one row above.
- [ ] No local components created under `src/policy/components/` that duplicate shell primitives.
- [ ] All new primitives appear in both `ui/index.ts` and `primitives/CATALOG.md`.
- [ ] `CommandCenterLayout.tsx` is reduced to a thin composer of the above primitives.

---

**End of Canonical Primitive Usage Map**

Next artifact will be produced immediately.