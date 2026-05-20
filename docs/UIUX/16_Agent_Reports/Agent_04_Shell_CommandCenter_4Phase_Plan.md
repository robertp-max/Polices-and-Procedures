# Agent 04: Shell & Navigation Architecture — 4-Phase Remediation Plan

**Subagent:** Command Center Shell & Navigation Architecture Specialist  
**Goal:** Make the shell the **uncontested single source of truth** for the 4-sided constrained frame, Layer 0 backdrop, glass surface contract, theme, and chrome orchestration.  
**Strategy:** Phase 1 hardens/locks the shell (no behavior change for users). Phases 2–4 systematically force every page to compose as pure content inside the locked shell without overriding margins, backgrounds, frames, or nav.

**Non-negotiables (from analysis):**
- ShellFrame owns Layer 0 + inset.
- ShellContentFrame owns the single painted glass (never nested by pages).
- No page may emit `bg-white`, `background: solid`, outer `ShellContentFrame`/`ShellFrame`, or competing side rails.
- Mobile inset contract must be explicit (desktop breathing room vs mobile near-edge).
- UniversalNavControls fate decided in Phase 1 (remove or integrate).

---

## Phase 1: Harden & Lock the Shell (Shell is Immutable Contract)

**Duration:** Shortest path to "shell frozen."  
**Outcome:** Shell cannot be violated from outside; violations become obvious compile/runtime errors or lint failures. Zero visual change for existing pages (they will simply look "wrong" until Phase 2).

### 1.1 Inset Contract Fix (Desktop vs Mobile)
- **ShellFrame.tsx**
  - Make padding conditional:
    ```tsx
    const desktopInset = 'var(--ci-glass-layer1-inset-desktop, clamp(16px, 1.6vw, 28px))';
    const mobileInset = 'var(--ci-glass-layer1-inset-mobile, 8px)'; // or 0 + safe-area only
    style={{ padding: isMobile ? mobileInset : desktopInset }}
    ```
  - Add token in `:root` + data-theme overrides:
    ```css
    --ci-glass-layer1-inset-mobile: 0px; /* or 4px with safe-area */
    ```
  - Update docstring and CCL `useIsMobile` sharing (pass or derive once).
- **ShellContentFrame.tsx** — accept `mobile` prop or read from context; force `rounded-none` + edge borders on mobile regardless of caller.

### 1.2 Kill Nested Shell Primitives (Enforcement)
- Add runtime guard + dev warning in `ShellContentFrame` and `ShellFrame`:
  ```tsx
  if (process.env.NODE_ENV !== 'production') {
    if (useContext(ShellContext)) console.error('ShellContentFrame nested inside another shell frame. Pages must render pure content only.');
  }
  ```
- Export a `ShellContext` from ui/index that CCL sets; pages importing primitives get lint or TS error in future.
- Add ESLint rule or codemod comment: "Pages must never import ShellContentFrame / ShellFrame".

### 1.3 UniversalNavControls & NavStore Cleanup
- Decision: **Remove** (per Stabilization N-01/N-02 comments that already deleted keyboard/swipe).
  - Delete `UniversalNavControls.tsx` (or archive).
  - Remove `initiateBack/Forward` usage if any remaining.
  - Keep `navStore` only for the push() route tracker (or slim it if breadcrumb history is the only consumer).
- If product wants back/forward buttons later → re-introduce behind feature flag after shell is locked.

### 1.4 Mobile Drawer / Bottom Nav / Hamburger Hardening
- Move `MOBILE_PRIMARY_TABS` and `useIsMobile` (1024px BP) into a shared `useShellViewport` hook exported from ui/.
- `ShellMobileDrawer` + `BottomSheetDrawer` — add `data-shell-mobile-drawer` and guarantee it never leaks background overrides.
- Bottom tab bar: extract to `ShellMobileTabBar` component (still rendered by CCL).
- Add safe-area tokens consistently:
  ```css
  padding-bottom: calc( var(--ci-shell-mobile-tabbar-height) + env(safe-area-inset-bottom) );
  ```

### 1.5 Token & Glass Surface Lock
- In `index.css`, mark `--ci-color-glass-*` as **page-forbidden** (comment + perhaps PostCSS guard later).
- Add `.ci-shell-locked` class on ShellContentFrame; any descendant that sets `background` not using `var(--ci-*)` triggers a dev overlay or test.
- Freeze `CommandCenterLayout.tsx` header comment as the visual contract spec.

### 1.6 Deliverables Phase 1
- Updated ShellFrame / ShellContentFrame / CCL with responsive inset + guards.
- New `useShellViewport()` hook.
- Linting / dev-time violation detector.
- `Agent_04_Phase1_Shell_Lock_Checklist.md` (internal).
- **No page files touched.** Visuals unchanged (but now violations are visible in DOM as extra frames).

**Exit criteria:** `npm run build` + `tsc --noEmit` clean. Opening any page in dev tools shows exactly one `data-shell-content-frame` and one Layer 0. Mobile gutter is intentional (documented).

---

## Phase 2: Force Clean Composition — Core Pages (No Overrides)

**Goal:** Every direct child of the shell scroll container renders **only content** (no frame, no bg solid, no margin cancellation).

### 2.1 DashboardPage (highest priority — currently worst offender)
- Remove import + outer `<ShellContentFrame>` wrapper (lines ~413–506).
- Root becomes a plain `<div className="flex flex-col gap-4 ...">` or better, a new `PageContent` primitive (Phase 3).
- Replace `-mx-3` / `px-3` hacks with shell-aware padding utilities (or remove — shell inset + scroll padding now owns spacing).
- Keep internal `ci-premium-panel`, `BoardColumn` etc. — they are content, not frames.

### 2.2 AchcSurveyAlignmentPage
- Strip `bg-white text-[#1f2937]` from root.
- Adopt shell tokens or `ci-*` utilities for text color (theme already provides via inheritance).
- Replace hard palette with CSS var equivalents (or CES tokens if appropriate, but scoped).

### 2.3 OnboardingV2Layout
- Convert from "parallel shell" to **nested content only**.
- Remove own rail + white panels; use existing `ShellNavRail` sub-items or a lightweight vertical `SectionHeader` + `Tabs` inside the main glass.
- If a distinct sub-rail is required long-term, render it as an **internal** column inside the provided content area (max 220px, glass-friendly border only).

### 2.4 CES Surfaces (CesLayout + pages)
- **Option A (preferred for consistency):** Deprecate CesLayout. Move sprint header into page-level `PageHeader` + `Toolbar` primitives that live inside glass.
- **Option B:** Keep CesLayout but force it to be **transparent** (`background: transparent`) and only supply layout grid + max-width. All solid fills become inner cards using `--ci-color-glass-*` or `ci-premium-panel`.
- Update `ci-bg-ces-*` to be **overlay tints** only (e.g. `background: color-mix(...)` over the glass) rather than opaque replacements.

### 2.5 WorkflowLibraryApp + BrandRail
- Strip `bg-ci-bg` and outer flex frame.
- BrandRail becomes a content-level vertical nav (use `ShellCommandGroup` pattern).
- Content area fills 100% of provided scroll container.

### 2.6 MasterCalendarPage + .ci-page-container users
- Remove `.ci-page-container` (or make it a no-op inside shell context).
- Gutter/padding now comes from shell inset + deliberate internal spacing only.
- Update `--ci-desktop-baseline` usage to be advisory, not layout-enforcing.

### 2.7 Remaining pages (quick sweep)
- FrameworkPage, EvidenceCenterPage, LibraryPage, FormsPage, PolicyLifecyclePage, GovernancePage, SystemDocumentationPage, HelpCenterPage, Staffing pages, Journey pages, iAdministrator, DemoPage, etc.
- Audit script: grep for `bg-white|bg-\[#|backgroundColor.*#|ShellContentFrame|ShellFrame` inside `src/policy/pages/**` and `src/policy/ces/**` (excluding components/ui).
- Fix pattern: replace top-level solid bg with nothing (inherit glass); replace custom sidebars with composition of existing primitives.

**Exit criteria Phase 2:** No page imports ShellContentFrame/ShellFrame. Zero top-level `bg-white` or inline solid backgrounds on page roots. Visual regression pass (screenshots) shows glass surface visible and unbroken on all routes.

---

## Phase 3: Introduce Composition Primitives & Enforcement

**Prevent regression forever.**

### 3.1 New Primitives (in ui/)
- `PageRoot` — thin wrapper: `className="flex flex-col gap-4 sm:gap-5 h-full w-full"` + data attr. Optional `fullBleed` for print-like or detail views.
- `PageHeader` (already exists) + `PageSection` / `PageGrid` that respect shell tokens.
- `ContentGutter` — explicit internal padding when pages need breathing room **inside** the glass (distinct from shell inset).
- `ShellAwareSurface` — card/panel that uses glass tokens or elevation only; never full-bleed bg.

### 3.2 TypeScript / Lint Contracts
- Create `src/policy/types/shell.ts`:
  ```ts
  export type ShellChild = ReactElement<typeof PageRoot | 'div' | ...>; // no Shell* allowed
  ```
- Or use a branded prop: pages that accept children from shell must be typed `ShellPageProps`.
- ESLint rule `no-restricted-imports` on `ShellContentFrame` for anything under `pages/` and `ces/`.

### 3.3 Migration Guide + Codemod
- Document: "Every page must start with `<PageRoot>` or a plain flex column. All visual framing is supplied by the shell."
- Provide codemod or find/replace patterns for common violations.

### 3.4 Test Harness
- Add Playwright or component test that mounts a page and asserts:
  - Exactly one `[data-shell-content-frame]` ancestor.
  - No descendant with `background-color` that is opaque white in dark mode.
  - Scroll container is the direct parent.

**Exit criteria:** New pages cannot be written that violate the contract. Existing pages from Phase 2 pass the harness.

---

## Phase 4: Polish, Mobile Parity, Documentation & Observability

- **Mobile inset finalization:** Decide on true 0-side-padding mobile or minimal safe-area-only. Update bottom tab bar + drawer to match.
- **Theme flash & splash:** Final audit of light/dark transitions (already good, but verify after inset changes).
- **Print & detail views:** Ensure `/print/*` and embedded viewers still correctly trigger `detailMode` and bypass mobile chrome.
- **Documentation:**
  - Update `UI_TOKEN_CONTRACT_SPEC.md` and `UI_PRIMITIVE_OWNERSHIP_MAP.md` with "Shell owns frame & glass; pages own content only."
  - Add Architecture Decision Record (ADR) for the one-glass contract.
- **Observability:** Optional dev-only `data-shell-violation` attributes or a tiny overlay panel listing any detected overrides.
- **Performance:** Confirm TravelightBG canvas still efficient on mobile (it is fixed, not re-parented).
- **Universal nav decision revisit (optional):** If back/forward buttons return, they must live **inside** ShellTopbar as a controlled primitive, never owned by pages.

**Exit criteria Phase 4:** Full visual + interaction parity on desktop + mobile. All routes pass automated shell-contract test. Zero open violations in codebase. Future developers have a one-paragraph rule: "The shell gives you the glass. You fill it with content."

---

## Rollout & Risk Mitigation

- **Branching:** `feat/shell-lock-phase-1` (shell only) → `feat/page-composition-phase-2` (bulk page fixes, can be many small PRs per domain).
- **Feature flags:** Gate new `PageRoot` / guards behind `shell_contract_v2` if needed for gradual rollout.
- **Visual regression:** Use existing playwright + tmp-ui-verify-screenshots/ before/after each phase.
- **Rollback:** Phase 1 changes are additive (new tokens + guards); easy to revert without touching pages.
- **Stakeholders:** Coordinate with CES owners (CesLayout is the largest sub-shell) and Onboarding V2 team early.

---

## Success Metrics (Shell Lens)

- 0 nested ShellContentFrame instances in production routes.
- 0 page roots with solid opaque backgrounds that obscure the glass.
- Mobile viewport utilization: content reaches ≥95% of available width (post-inset decision).
- Theme switch time < 300ms with no flash (already close).
- New page added in <5 min without accidental frame duplication.
- `data-shell-content-frame` count === 1 for every mounted page in dev tools.

**Phase 1 is the only phase that touches the shell files.** All subsequent phases are "pages adapt to the now-frozen contract."

This plan directly addresses the analysis finding: the shell must be locked first, then pages are forced to compose cleanly.
