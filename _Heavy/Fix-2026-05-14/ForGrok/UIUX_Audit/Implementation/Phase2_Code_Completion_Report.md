# Phase 2 — Code Completion Report

**Phase:** 2 — Core Shell and Command Center Rebuild
**Date:** 2026-05-16
**Scope:** Code-level integration of canonical shell primitives into `CommandCenterLayout`.
**Status:** ✅ Code complete. Awaiting formal exit gates (axe scan, Playwright captures, Design Lead sign-off — see `Phase2_Exit_Criteria_Checklist.md`).

---

## 1. Summary

The `CommandCenterLayout` was rebuilt from a broken "incremental migration" state (where `ShellNavRail` / `ShellTopbar` were rendered outside the legacy `fixed inset-0` glass overlay and therefore non-functional) to the canonical Phase 2 composition:

```
ShellFrame                                     // backdrop + 4-sided inset
  └─ ShellContentFrame                         // in-flow glass canvas
       ├─ ShellTopbar                          // logo · search · account · ThemeModeToggle
       └─ Body (flex row)
            ├─ ShellNavRail                    // desktop, ShellCommandGroup grouping
            └─ Main content region
                 ├─ Sub-nav strip (ci-shell-subnav)
                 ├─ Splash / Full-screen modal menu (conditional)
                 ├─ <main data-shell-main> → {children}
                 └─ Mobile bottom nav (mobile only)
```

---

## 2. Files Modified

| File | Change |
|---|---|
| [src/policy/components/ui/ShellFrame.tsx](../../../../../src/policy/components/ui/ShellFrame.tsx) | `min-h-screen` → `h-screen`; `isLight` now passed to `<TravelightBG>` (was missing — dark canvas always rendered even in light mode). |
| [src/policy/components/ui/ShellContentFrame.tsx](../../../../../src/policy/components/ui/ShellContentFrame.tsx) | Added optional `style?: React.CSSProperties` prop so the layout can override the default glass background per mode (light / care-indeed-dark / ci-ion-dark). |
| [src/policy/components/ui/ShellNavRail.tsx](../../../../../src/policy/components/ui/ShellNavRail.tsx) | Added `strokeWidth?: number` to the exported `NavItem.icon` type so consumers passing icons with `strokeWidth` (incl. `CommandCenterLayout`'s local `NavItem`) type-check. |
| [src/policy/components/CommandCenterLayout.tsx](../../../../../src/policy/components/CommandCenterLayout.tsx) | Major restructure (see §3). |

---

## 3. `CommandCenterLayout.tsx` — Detailed Changes

### Removed
- `import TravelightBG from '@/components/TravelightBG'` (now owned by `ShellFrame`).
- `import { ThemeModeToggle }` (now rendered inside `ShellTopbar`).
- `Search`, `Menu` lucide icons (the old header that used them is gone).
- `<div data-shell-outer className="fixed inset-0 z-1">` wrapper.
- `<div data-shell-card className="absolute ... rounded-3xl backdrop-blur-...">` wrapper.
- Old `<header>` block (~270 lines) containing legacy logo button, horizontal nav-icon row, search input, and account menu — all of these are now expressed through `ShellTopbar` + `ShellNavRail`.
- `const hideGlobalSearch` (was only used by the removed `<header>`).
- `const isLight` (unused after the legacy header was removed).

### Added / Reworked
- `import { ShellFrame, ShellNavRail, ShellTopbar, ShellContentFrame } from '@/policy/components/ui'`
- `<ShellContentFrame scrollable={false} style={...}>` — in-flow glass canvas with mode-aware background (3 branches: `isVisualLight`, `isCareIndeedDark`, default CI-ION dark).
- `<ShellTopbar>` — logo slot wraps the brand-toggle button; children slot carries `<ContextualKnowledgeBulb />` and the account-menu dropdown.
- `<ShellNavRail items={VISIBLE_NAV} onItemClick={…}>` — gated on `!isMobile && !hideChrome && !showSplash`. The click handler sets `expandedNavId` (for the sub-nav strip) when the item has sub-items, then navigates.
- Sub-nav strip kept as a standalone `nav.ci-shell-subnav` row directly above `<main>` so existing UX for items like CES / Onboarding / System Documentation is preserved.
- `<main data-shell-main>` with `<div data-shell-scroll>` scroll container, mobile bottom nav, splash screen, and full-screen modal menu — all preserved.

### Kept (still needed)
- `currentNav` — used by the full-screen modal menu active state.
- `activeSubMenu` / `setActiveSubMenu` — full-screen modal menu drill-in.
- `expandedNavId` / `activeDropdownNavId` — sub-nav strip.
- Account menu state (`isAccountMenuOpen`, `accountMenuRef`, `handleMyTasksClick`, `handleLogoutClick`) — moved into `ShellTopbar` children.

---

## 4. Verification Performed

| Check | Result |
|---|---|
| `npx tsc --noEmit --project tsconfig.app.json` | ✅ 0 errors |
| `npm run build` | ✅ `built in 3.42s`, exit 0 |
| CSS class presence (`ci-shell-subnav`, `ci-shell-subnav-chip`, `ci-shell-command-group`, `ci-touch-target`) | ✅ all defined in `src/index.css` |
| Token presence (`--ci-glass-layer1-inset-desktop`) | ✅ defined in `src/index.css` line 60 |
| Imports audit — unused symbols | ✅ removed (`Search`, `Menu`, `TravelightBG`, `ThemeModeToggle`, `isLight`, `hideGlobalSearch`) |
| Lucide icon imports | ✅ all 19 remaining icons used |
| JSX bracket balance | ✅ closes correctly (`</ShellContentFrame>` → `</ShellFrame>`) |

---

## 5. Mapping to Phase 2 Required Outputs (per `MASTER_UIUX_IMPLEMENTATION.md`)

| Required Output | Status |
|---|---|
| Shell architecture implementation spec/checklist for engineering use | ✅ pre-existing: `Shell_Architecture_Reconstruction_Plan.md` + `Phase2_Exit_Criteria_Checklist.md`; this file documents the code-side delivery against them. |
| Measurable acceptance tests for constrained framing and command hierarchy | ⚠️ `Responsive_Accessibility_Validation_Plan_Shell.md` exists; **Playwright captures still pending** (formal gate). |
| Regression captures for desktop/laptop/tablet/mobile shell states | ⚠️ **Pending** — needs to be produced against the now-correct shell before Phase 3 starts. |

---

## 6. Mapping to Phase 2 Exit Criteria (per `MASTER_UIUX_IMPLEMENTATION.md` §Phase 2)

| Exit Criterion | Code-side status |
|---|---|
| Shell routes consistently preserve framed glass composition on desktop/laptop | ✅ `ShellFrame` applies `--ci-glass-layer1-inset-desktop` to its inner column; `ShellContentFrame` is in-flow and rounded so the inset is visible on all four sides. |
| Core command groups use canonical primitives and tokenized values | ✅ `ShellNavRail` exclusively renders `ShellCommandGroup` blocks; sub-nav uses `.ci-shell-subnav` token-driven CSS. |
| Responsive and accessibility checks pass on shell interactions | ⚠️ Code is responsive (`!isMobile` gate; `hidden lg:flex` inside `ShellNavRail`; mobile bottom nav unchanged). Formal axe + responsive matrix sign-off remains a gate. |

---

## 7. Known Limitations / Technical Debt

1. **Light-mode parity inside `ShellNavRail` & `ShellTopbar`** — both read `isLight` from `useCiModeStore` (the orthogonal CI mode), not from the brand toggle (`theme === 'care-indeed-light'`). When the user is on Care Indeed brand with `ciMode='dark'`, the rail/topbar will render in their dark variant while the rest of the shell uses brand-light styling. This is consistent with the orthogonal-toggle design but worth a Phase 4 review pass.
2. **`ShellNavRail` width (`w-64`)** is a raw Tailwind utility, not a token. Consider promoting to `--ci-shell-navrail-width` in a future token pass.
3. **Pre-existing lint warning ("CSS inline styles should not be used")** is reported on dozens of locations across `CommandCenterLayout.tsx`, `ShellFrame.tsx`, `ShellContentFrame.tsx`, `ShellNavRail.tsx`. These pre-date Phase 2 and use only `--ci-*` token references in their values — they are not blockers, but eventual migration to data-attribute-driven CSS classes is the long-term direction.
4. **Mobile drawer (`ShellMobileDrawer`)** referenced in the Exit Criteria does not exist yet; mobile navigation is currently the inline bottom-nav grid + the existing full-screen modal menu. If the Exit Checklist's requirement is strict, this primitive needs to be authored.
5. **Formal regression suite** — Playwright shell visual baselines need to be (re-)captured against this new composition before Phase 3 begins.

---

## 8. Phase 2 Code Sign-off

The canonical Phase 2 shell composition is **integrated, type-clean, and builds green**. The five non-negotiable code requirements from the prompt are met:

1. ✅ Shell primitives meaningfully integrated into `CommandCenterLayout`
2. ✅ `ShellTopbar` and `ShellNavRail` are functional and visible (no longer trapped underneath a `fixed inset-0` overlay)
3. ✅ 4-sided constrained view from `ShellFrame` is active at ≥1024px
4. ✅ Navigation grouping via `ShellCommandGroup` (Primary / Compliance / Other)
5. ✅ No broken JSX; layout stable; build succeeds

Phase 3 work remains explicitly blocked pending the formal exit gates (axe, Playwright, Design Lead sign-off) in `Phase2_Exit_Criteria_Checklist.md`.

---

**End of report.**
