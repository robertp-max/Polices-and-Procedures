# Agent 04: Shell & Navigation Architecture Analysis

**Subagent:** Command Center Shell & Navigation Architecture Specialist  
**Primary Lens:** Top-level shell (PolicyCommandCenterApp / CommandCenterLayout + UniversalNavControls + sidebar/top nav/mobile bottom nav) orchestration of constrained frame, theme switching, and consistent glass shell treatment.  
**Date:** 2026-05-17  
**Scope:** src/policy/PolicyCommandCenterApp.tsx, CommandCenterLayout.tsx, UniversalNavControls.tsx, stores/navStore.ts + uiStore.ts, ui/ shell primitives (ShellFrame, ShellContentFrame, ShellNavRail, ShellTopbar, ShellMobileDrawer, BottomSheetDrawer), mobile drawer/hamburger logic, 4-sided inset + Layer 0 backdrop application on desktop vs mobile, and whether child pages respect or fight the contract.

---

## 1. Shell Architecture Map (Single Source of Truth?)

### Core Hierarchy (as rendered for all authenticated routes via App.tsx catch-all)
```
AppShell > BrowserRouter > ProtectedRoute > CommandCenterLayout (for *)
  └─ ShellFrame (Layer 0 backdrop + 4-sided padding)
       └─ ShellContentFrame (glass canvas, rounded on desktop, scrollable=false)
            ├─ ShellTopbar (hamburger + logo/theme toggle + search + account + ContextualKnowledgeBulb)
            └─ Body flex
                 ├─ ShellNavRail (desktop >=1024px only, grouped via ShellCommandGroup)
                 └─ Main content region
                      ├─ Sub-nav strip (desktop dropdowns)
                      ├─ <main data-shell-main>
                      │    └─ <div data-shell-scroll absolute inset-0>  ← children live here
                      │         └─ {children} (wrapped by App.tsx in <div className="min-h-full w-full...">)
                      └─ Mobile bottom tab bar (5 slots) + GlobalTaskDrawer
  + ShellMobileDrawer (BottomSheetDrawer) for hamburger
  + Guided* widgets
```

**Shell as contract owner:**
- **Layer 0 (Backdrop):** Fixed `inset-0 z-0` TravelightBG (canvas animation) + light-mode overlay gradient. Always full viewport. Theme via `useCiModeStore` + `data-ci-mode`.
- **4-sided Inset:** Inline style on ShellFrame's z-10 wrapper: `padding: var(--ci-glass-layer1-inset-desktop, clamp(16px, 1.6vw, 28px))`. **Unconditional** — no `@media` or `isMobile` guard despite docstring claiming "desktop/laptop (>=1024px)".
- **Glass Surface (Layer 1):** Owned exclusively by `ShellContentFrame` via `--ci-color-glass-*` tokens (background, backdrop-filter, border, box-shadow). `scrollable={false}` in CCL + delegated absolute scroller. `rounded-[2rem]` on desktop, `rounded-none` on mobile via CCL prop.
- **Theme switching:** `useShellStore` (detailMode + theme: 'ci-ion-dark' | 'care-indeed-light'). Sets `document.documentElement.dataset.theme` + `data-ciMode`. `toggleTheme` on logo click. View Transition + fallback.
- **Nav orchestration:** `useNavStore` only for route push (history stack). No longer drives keyboard/swipe (removed in Stabilization). `UniversalNavControls` exists but **never mounted** in current CCL.
- **Mobile primitives:** `useIsMobile` (1024px hard BP in CCL), hamburger → `ShellMobileDrawer` (wraps `BottomSheetDrawer` with role=dialog, swipe, escape, scrim), 5-slot bottom tab bar with safe-area padding.

**Files audited:**
- `src/policy/PolicyCommandCenterApp.tsx` (legacy wrapper around CCL + limited Routes; superseded by App.tsx catch-all).
- `src/policy/components/CommandCenterLayout.tsx` (the real orchestrator; 900+ LOC, heavy logic for nav items, detail/hideChrome, mobile detection, account menu, CesRoleReviewSwitcher, splash).
- `src/policy/components/UniversalNavControls.tsx` (back/forward pills; dead code).
- `src/policy/stores/navStore.ts` (Zustand stack with _skipNext guard; still fed by CCL route tracker).
- `src/policy/stores/uiStore.ts` (ShellState: detailMode + theme + runThemeSwap).
- `src/policy/components/ui/Shell*.tsx` + `BottomSheetDrawer.tsx` (primitives; excellent token discipline, forbid-dom-props comments).
- `src/index.css` (root tokens + data-theme/data-ci-mode blocks for glass, navrail, topbar, mobile tabbar, ces-* fallbacks).

---

## 2. Does the Shell Enforce the Visual Contract? (Desktop vs Mobile)

**Desktop (≥1024px):**
- 4-sided padding + rounded glass frame + Layer 0 backdrop = "constrained page view contract" for glassmorphism magnification. Works.
- NavRail + subnav strip + topbar chrome all live inside the glass.
- DetailMode + pathIsDetail (`/library/:id`, `/forms/:id`, etc.) hides chrome so content can use full glass.

**Mobile (<1024px):**
- `isMobile` drives: no NavRail, rounded-none on ShellContentFrame, `pb-16` + mobile tabbar, `pb-[calc(96px+env(safe-area-inset-bottom))]` on content.
- **Inset problem:** Outer padding still applies the full clamp(16px...) on all 4 sides. Mobile content never reaches true viewport edges. Bottom tabbar uses safe-area only for its own padding.
- Drawer: correct BottomSheetDrawer semantics.
- Hamburger in ShellTopbar (lg:hidden).

**Inconsistencies found:**
- Docstring in ShellFrame promises desktop-only inset; implementation does not condition the padding.
- On mobile the "one glass" still has ~16-28px gutters + rounded-none, creating a framed-card feel instead of edge-to-edge app.

---

## 3. Pages Are Fighting the Shell (Core Finding)

The shell is **not** the unchallenged single source of truth. Multiple surfaces actively override, nest, or duplicate its responsibilities.

### Violations (direct evidence)

1. **DashboardPage.tsx (critical)**
   - Imports and renders its own `<ShellContentFrame scrollable ...>` as the page root.
   - Creates **nested glass layer** (duplicate background, border, shadow, blur, border-radius).
   - Uses `-mx-3` / compensatory padding hacks inside the inner frame.
   - Code: lines 20, 413 (`<ShellContentFrame data-surface="dashboard">` ... `</ShellContentFrame>`).

2. **AchcSurveyAlignmentPage.tsx**
   - Root: `<div className="relative flex h-full flex-col bg-white text-[#1f2937]">` — **solid white hard override** that paints over any dark glass. Hard-coded teal/orange palette.
   - Ignores `--ci-color-glass-*` entirely.

3. **OnboardingV2Layout.tsx** (used for /onboarding-v2/* subtree)
   - Own sub-rail (`w-[260px] bg-white/80`) + content panel (`bg-white rounded-r-[12px]`).
   - `min-h-[calc(100vh-100px)]` — fragile vh math that doesn't respect shell padding/insets.
   - Comment claims "does NOT touch CommandCenterLayout (FROZEN)" — explicit admission of parallel layout.

4. **CesLayout.tsx + CES pages** (CesBoard, Workloads, Reports, Calendar)
   - Applies `background: t.canvas` (solid via CES_TOKENS) + own header bar + `max-w-[1440px] px-6` content.
   - Creates a second "operational canvas" inside the canonical glass.
   - ci-bg-ces-* utilities + --ces-* tokens in CSS are parallel palette.

5. **WorkflowLibraryApp.tsx** (`/workflows/*`)
   - Own `BrandRail` + `bg-ci-bg` + `flex overflow-hidden`.
   - Acknowledges outer shell in comments but still duplicates framing.

6. **MasterCalendarPage.tsx** (and many others via .ci-page-container)
   - Root uses `.ci-page-container` → `width: min(100%, 1920px); margin-inline: auto; padding-inline: var(--ci-content-gutter-x)`.
   - Re-constrains the layout that the shell already inset/padded. Duplicates gutter responsibility.

7. **Other patterns**
   - FrameworkPage: `bg-transparent p-6 md:p-8` + heavy absolute positioning.
   - Multiple pages set explicit `style={{ background: ... }}` or Tailwind `bg-white` / `bg-slate-*` at top level.
   - SharedPolicyDetailView / FormViewer / GVGBDetailView correctly use `setDetailMode(true)` to hide chrome (good).
   - No widespread `m-0 -mx-` wars, but the above are sufficient to break the "single glass, flat content" ideal stated in CCL header comment.

**Root cause:** No enforcement. Shell provides the container; pages treat it as "just another wrapper" and bring their own surfaces for density. Phase 2/3 "one-glass" vision was never locked at the component boundary.

---

## 4. Navigation & Mobile Drawer Audit

- **Hamburger:** ShellTopbar (lg:hidden) → CCL `isMenuOpen` → ShellMobileDrawer (correct dialog + swipe + escape).
- **Bottom nav:** Hard-coded 5-slot grid (Dashboard, Calendar, Tasks, Evidence, More). Evidence slot per recent MVP note. Uses `isMobileTabActive` partial match.
- **UniversalNavControls:** Fully implemented (store + component) but **dead** — never rendered in CCL Topbar children. Keyboard/swipe removed. Only route-tracker push remains.
- **Nav items:** Feature-gated via `canViewNavItemFn` + admin injection. Sub-items flattened in mobile drawer.
- **Store health:** navStore is clean but under-utilized.

---

## 5. Token & Theme Discipline

- Excellent in shell primitives (all glass via CSS vars, `// eslint-disable-next-line react/forbid-dom-props` comments).
- Leaks in pages (hard hex in Achc, custom CES tokens, ci-page-container assumptions).
- Theme effect in CCL + splash special-cases for CareIndeed light to avoid flash.

---

## 6. Summary Verdict

**The shell is attempting to be the single source of truth but is losing.**  
It correctly owns Layer 0, the glass paint contract, chrome visibility, mobile primitives, and theme. However:

- Inset logic is not responsive to its own desktop contract.
- Dead code (UniversalNavControls) and removed features (swipe nav) show incomplete stabilization.
- Pages freely nest duplicate ShellContentFrames, force solid backgrounds, and build parallel rails/panels.

**Result:** The "consistent glass shell treatment that every child surface inherits" is aspirational, not enforced. Visual contract is fragmented.

**Files that must change for Phase 1 lock:**
- ShellFrame.tsx (make inset desktop-only or add mobile variant)
- CommandCenterLayout.tsx (stop rendering nested opportunities, remove dead nav wiring)
- DashboardPage.tsx (remove inner ShellContentFrame)
- All pages listed above + CesLayout, OnboardingV2Layout, WorkflowLibraryApp

---

**Next:** See the 4-Phase Plan (Agent_04_Shell_CommandCenter_4Phase_Plan.md) for the hardening sequence that first locks the shell before touching pages.
