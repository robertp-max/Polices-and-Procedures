# Agent 12: Mobile & Responsive v2 Parity Specialist — 4-Phase Execution Plan

**Subagent:** 12  
**Primary Goal:** Elevate mobile from "reactive patch on desktop UI" to first-class native-feeling glassmorphic experience matching `Mobile/v2/` mockups (Top-Picks 01_Dashboard_Mobile_v2.jpg, 02_CES_Board_Mobile_v2.jpg, 03_PolicyDetail_Mobile_v2.jpg, etc.) and `RESPONSIVE_BEHAVIOR_MATRIX.md` / `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md`.  
**Success Definition:** Side-by-side visual + behavioral parity at 375px/390px/414px viewports (iPhone SE/14/15/16 Pro portrait) for all key surfaces. 44px+ touch targets, safe-area handling, bottom sheets, one-handed thumb zones, zero horizontal scroll.  
**Date:** 2026-05-17

---

## Phase Structure Overview

**Phase 1 (Foundations + Early Wins — 4-6 days):** Unified mobile primitives, breakpoint harmony, touch/safe-area enforcement. **Deliver exact parity on 4 key surfaces: Dashboard (polish), CES Board (verticalize + bottom sheet), Evidence Capture (native flows + detail), Policy Detail (stacked sections).** These must pass pixel-for-pixel + interaction comparison vs strongest Top-Picks + `mockup/Mobile/v2/` images.

**Phase 2 (High-Frequency Field Surfaces):** Complete Onboarding V2, Calendar/MyTasks, Forms/eCign signing, Evidence hierarchy per mobile patterns.

**Phase 3 (Full Coverage + Guardrails):** Remaining surfaces, full regression suite, one-handed UX audit, accessibility-on-mobile.

**Phase 4 (Maturity + Sustainability):** Team process, lint/visual regression automation, continuous parity enforcement.

All phases reference absolute paths to mocks, specs, and code. Use Playwright at fixed mobile viewports + manual device testing (iPhone + Android small).

**Core Acceptance for Every Phase Gate:**
- No horizontal overflow on mobile.
- All interactive elements ≥44×44px (measured).
- Primary CTAs thumb-reachable (<60% screen height from bottom on portrait).
- Exact visual match (glass radii, spacing rhythm, accent usage, card stacking) to v2 mocks when viewed at target size.
- BottomSheetDrawer or full-page for all drawers/details on <768px.
- `env(safe-area-inset-*)` respected on all full-view surfaces.

---

## Phase 1: Unified Foundations + 4-Surface v2 Parity (Priority: P0 — Ship These First)

**Duration:** 4-6 engineering days (parallelizable: 1 subagent per surface after foundations).

**Objective:** Establish single source of truth for mobile behavior. Retrofit the 4 highest-claim surfaces (Dashboard, CES Board, Evidence Capture, Policy Detail) so they **pass side-by-side comparison** with:
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\mocks\Top-Picks\01_Dashboard_Mobile_v2.jpg`
- `...02_CES_Board_Mobile_v2.jpg`
- `...03_PolicyDetail_Mobile_v2.jpg`
- Supporting `mockup/Mobile/v2/06_EvidenceCapture_Mobile_v2.jpg`, `11_EvidenceList_Mobile_v2.jpg`, `13_PolicySearch_Mobile_v2.jpg`

**1.1 Unified Mobile Hook & Breakpoint Contract (1 day)**
- Create canonical hook: `src/policy/hooks/useIsMobile.ts` (or in ui/) exporting `useIsMobile(breakpoint = 767)` + `useBreakpoint()` returning 'mobile'|'tablet'|'desktop' per `RESPONSIVE_ACCEPTANCE_MATRIX.md` and `RESPONSIVE_BEHAVIOR_MATRIX.md` (Mobile 0-767, Tablet 768-1023, Desktop ≥1024).
- Update `CommandCenterLayout.tsx:163` (MOBILE_BP) to use the hook at 767 for content decisions; keep 1024 only for nav-rail collapse if desired (or align fully).
- Export and migrate all ad-hoc `viewportWidth < 768` / `innerWidth` checks in:
  - `DashboardPage.tsx`
  - `PmViews.tsx`
  - `MasterCalendarPage.tsx`
  - `LandingView.tsx`
  - Any others found via grep.
- Add `data-mobile`, `data-tablet` attrs to root for CSS targeting.
- **Files:** New hook, updates to `CommandCenterLayout.tsx`, `src/policy/pages/DashboardPage.tsx:50`, `MasterCalendarPage.tsx:67-71`, etc.
- **Test:** Resize tests + Playwright at 375/768/1024.

**1.2 Global Touch, Safe-Area & Glass Mobile Tokens (1 day)**
- In `src/index.css`:
  - Strengthen `.ci-touch-target` to `min-width:44px; min-height:44px; padding: max(8px, ...)` (or new `.ci-touch-target-lg` for 48px primaries).
  - Add utilities: `.safe-area-pb { padding-bottom: max(16px, env(safe-area-inset-bottom)); }`, `.mobile-px { padding-left/right: clamp(12px,4vw,20px); }`, `.mobile-stack { display:flex; flex-direction:column; gap: clamp(12px,3vh,20px); }`.
  - Mobile typography scale: `@media (max-width:767px) { .text-display { font-size: clamp(22px,6vw,28px); } ... }` matching v2 mock rhythm.
  - Enforce on buttons, cards, list rows, icon buttons globally via base rules or postcss.
- Update `ShellFrame.tsx` and `ShellContentFrame.tsx` to apply mobile insets + remove desktop-only padding on <768.
- Add `prefers-reduced-motion` fallbacks already present in BottomSheet — propagate.
- **Files:** `src/index.css` (multiple sections around 335-370, 448, 1352+), `src/policy/components/ui/Shell*.tsx`.
- **Test:** Lighthouse + manual on real devices; contrast in sunlight.

**1.3 Responsive Drawer Router Primitive (0.5-1 day)**
- New or enhanced `src/policy/components/ui/ResponsiveDrawer.tsx` (or update RightDrawer/BottomSheet):
  - Props: same as current + `forceMode?: 'auto'|'bottom'|'right'`.
  - Internally: `const isMobile = useIsMobile(767); return isMobile ? <BottomSheetDrawer ...> : <RightDrawer ...>`
  - Mirror API exactly so drop-in replacement.
- Provide migration guide + codemod hints.
- Update `BottomSheetDrawer` footer/padding for long content + keyboard avoidance (iOS).
- **Files:** New `ResponsiveDrawer.tsx`, updates to `BottomSheetDrawer.tsx`, `RightDrawer.tsx`.
- **Adoption in Phase 1.4+**

**1.4 Surface Rewrites — The 4 Deliverables (parallel, 3-4 days)**

**A. Dashboard (Polish to Exact v2 Mock Match)**
- Align spacing, card radii, KPI typography, accent usage, bottom padding to `01_Dashboard_Mobile_v2.jpg`.
- Ensure all inner cards use `.mobile-stack`, 44px targets, no x-scroll.
- Add contextual bottom actions if missing in mock.
- Use new ResponsiveDrawer for any details.
- **Acceptance:** Screenshot diff <2% at 375px vs Top-Picks mock; one-handed flow test.
- **Owner Surface:** DashboardPage + shared cards.

**B. CES Board — Vertical Mobile Transformation (Highest Impact)**
- Add mobile mode to `SprintExecutionBoard.tsx`: when `isMobile`, render vertical list of `ExecutionUnitCard` (agenda style, grouped by event/state filter chips at top like mock).
- Replace drag columns with tap-to-open + status change bottom sheet or segmented control.
- Convert `WorkflowDrawer` call to use `ResponsiveDrawer` (or BottomSheet on mobile) with full mobile-optimized content (large timeline, evidence capture inline, 48px action buttons at bottom of sheet).
- Update `ExecutionUnitCard` for mobile density (larger tap, thumb-friendly).
- Remove or hide `minWidth:1700` grid on mobile.
- **Files:** `src/policy/ces/components/board/SprintExecutionBoard.tsx:137-208`, `WorkflowDrawer.tsx:57+`, new mobile list renderer, `ces/theme.ts` tokens if needed.
- **Acceptance:** Vertical card stack exactly matches spirit + spacing of `02_CES_Board_Mobile_v2.jpg`; detail rises as bottom sheet; no horiz scroll; 44px everywhere. Side-by-side pass.

**C. Evidence Capture & Detail — Native Mobile Experience**
- Enhance `PhotoEvidenceCapture` usage in EvidenceCenter + CES flows with large prominent capture FAB or bottom bar (per 06 mock).
- Replace `DetailDrawer` with `ResponsiveDrawer` (bottom on mobile) or dedicated full mobile page for artifact review.
- Add mobile-optimized evidence list (tall cards, quick capture from list).
- Ensure capture flow is one-handed: camera launch → immediate preview + metadata sheet → save (large green/teal CTA).
- Integrate safe-area + keyboard handling.
- **Files:** `src/policy/pages/EvidenceCenterPage.tsx:1114-`, `PhotoEvidenceCapture.tsx`, new mobile evidence components if needed, hierarchy panel.
- **Acceptance:** Capture + list + detail match `06_EvidenceCapture_Mobile_v2.jpg` + `11_EvidenceList...`; bottom sheet for details; large targets.

**D. Policy Detail + Library — Stacked Glass Sections**
- In `SharedPolicyDetailView.tsx` + `PolicyDetailPage`: force single-column on mobile (`@media max-767 or isMobile`): collapse all `grid-cols-2` (and the ones that become 2-col on phone) to 1-col stacks.
- Refactor sections into self-contained rounded glass cards matching `03_PolicyDetail_Mobile_v2.jpg` (Policy Overview, Coverage Details, Compliance Status, etc.) with internal progress, large text, teal bars.
- Library search/results: ensure 1-col cards, fat search input, bottom action if needed. Use `ResponsiveDrawer` for any flyouts.
- Add mobile top-bar pattern (back + title + minimal icons) consistent with mock.
- **Files:** `src/policy/components/SharedPolicyDetailView.tsx` (grids at 600+), `PolicyDetailPage.tsx`, `LibraryPage.tsx:675+`, CSS mobile rules.
- **Acceptance:** Vertical stacked sections + typography + accents identical to `03_PolicyDetail_Mobile_v2.jpg` and PolicySearch mock at phone size; no 2-col leakage; scroll feels native.

**Phase 1 Exit Criteria:**
- All 4 surfaces pass manual + Playwright side-by-side review vs listed mocks at mobile viewports.
- New `useIsMobile` + ResponsiveDrawer adopted in the 4 surfaces.
- Global touch/safe-area rules in place and verified (no element <44px on mobile).
- Zero new horizontal scroll introduced.
- Build + tsc clean; responsive regression baseline updated in `tmp-ui-verify-screenshots/` or `Builder/_system/screenshots/`.
- Documented in updated `Responsive_Parity_Validation.md`.

**Risk Mitigation:** Surface owners pair with Agent 12 for the 4 rewrites. Use feature flag `VITE_MOBILE_V2_PARITY_PHASE1` during development.

---

## Phase 2: Remaining High-Frequency Surfaces (Onboarding V2, Calendar, Forms, MyTasks, etc.)

**Duration:** 5-7 days.

**Deliverables:**
- **Onboarding V2 Full Mobile Fidelity** (per `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md`):
  - BatchListPage: replace table with vertical `BatchCard` list (progress bars, counts, due dates, status).
  - BatchView: single-col or segmented tabs (Overview/Units/Gates/Evidence); Unit list as cards.
  - UnitDrawer → always `ResponsiveDrawer` (bottom sheet on mobile) or full mobile page with accordions + prominent "Capture Evidence" FAB.
  - Add long-press quick actions + pull-to-refresh + FABs as specified in pattern library.
  - **Files:** `src/policy/onboarding-v2/pages/BatchListPage.tsx`, `BatchViewPage.tsx`, `UnitDrawer.tsx`, `ActivationPage.tsx`, `AuditReadinessPage.tsx`, components in `onboarding-v2/components/`.
  - **Mock Alignment:** `mockup/Mobile/v2/05_OnboardingBatchView_Mobile_v2.jpg`, `07_OnboardingActivation_Mobile_v2.jpg`, `09_AuditReadiness_Mobile_v2.jpg`.

- **Calendar & MyTasks:** Extend MasterCalendar conditional pattern everywhere. Make SprintTaskPanel / TaskDetail content mobile-optimized (stacked timeline, large signature if needed). MyTasks list as tall cards.
  - **Files:** `MasterCalendarPage.tsx`, `src/policy/components/pm/TaskDetailRightPanel.tsx`, `MyTasksPage.tsx`, `src/policy/ces/components/details/SprintTaskPanel.tsx`.

- **Forms / eCign Signing / Evidence in Workflows:** Large signature pad (use/enhance `SignaturePad.tsx`), bottom action bars, 16px+ inputs (already guarded in css), mobile packet preview (avoid iframes or make zoomable).
  - `FormSigningWorkspace.tsx`, `FormViewer.tsx`, workflow panels.

- **Other:** Staffing lists (already decent), Help, Admin tables (collapse to cards), Journey module player (simplify or dedicated mobile player).

**Phase 2 Exit:** All high-traffic paths (CES execution, Onboarding activation, signing on-site, calendar drill-down) pass mobile UAT and mock parity checks.

---

## Phase 3: Complete Audit, Regression, One-Handed Polish & Edge Cases

**Duration:** 4-5 days + QA.

- Full surface inventory audit vs `UIUX_SURFACE_INVENTORY.md` + `SURFACE_CHECKLISTS/`.
- Playwright matrix: 375px, 414px, 768px, 1024px, 1440px, 1920px for every route + orientation (portrait primary).
- Real-device matrix: iPhone SE (smallest), iPhone 16 Pro, iPad mini (tablet), low-end Android, bright sunlight test, gloved-hand simulation.
- One-handed UX audit: thumb heatmaps on all primary flows; move any top-only actions to bottom bars or sheets.
- Safe-area completeness: notch, dynamic island, home indicator on all pages/modals/drawers (add global CSS + component wrappers).
- Accessibility on mobile: VoiceOver/TalkBack on bottom sheets, large text scaling, contrast.
- Reduced-motion + performance (jank on complex boards fixed in P1/P2).
- Update `Responsive_Parity_Validation.md`, `UIUX_MOBILE_RESPONSIVE_AUDIT.md`, add screenshots to `Implementation/mocks/` and `Builder/_system/screenshots/`.
- Visual regression baseline vs approved v2 mocks.
- **Files:** `playwright.config.ts` (add mobile projects), new test specs under `tests/mobile/`, all surface files for final tweaks.

**Phase 3 Exit:** 100% surfaces green on acceptance matrix; zero P0 mobile defects; documented "Mobile Excellence" sign-off.

---

## Phase 4: Guardrails, Process & Long-Term Parity

**Duration:** 2-3 days + ongoing.

- Add ESLint/TS rules or codemods: forbid raw `w-[560px]`, `grid-cols-2` without mobile prefix in components, require `useIsMobile` + ResponsiveDrawer for new drawers.
- Update `UI_PRIMITIVE_OWNERSHIP_MAP.md`, `CANONICAL_UI_SYSTEM_SPEC.md`, component docs to mandate mobile patterns first.
- Component guidelines: "Every new surface ships with mobile story in Storybook/Playwright + side-by-side mock comparison."
- Training: 30-min session for team on v2 mobile contract using the mocks.
- Automated CI: mobile viewport screenshots on PRs; fail on regression vs baseline.
- Future: dedicated mobile e2e suite + field user testing loop.
- Rollout: Dark launch behind flag, then 100%.
- **Artifacts:** Updated `MASTER_FIX_EXECUTION_PLAN.md`, new `MOBILE_PARITY_RUNBOOK.md`, PR templates.

**Ongoing Ownership:** Agent 12 or successor + mobile guild. Quarterly re-audit against new mocks.

---

## Resource & Sequencing Notes

- **Parallelism:** Phase 1.1-1.3 (1-2 devs) + 4 surface tracks (can be 4 parallel after hook + primitives ready).
- **Dependencies:** Requires `BottomSheetDrawer` / `SignaturePad` / `PhotoEvidenceCapture` already present (they are). May need minor enhancements to `SurfaceCard`, `EmptyState`, `Tabs` for mobile density.
- **References to Leverage:**
  - All prior WAVE mobile reports in `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/` (WAVE_8_MOBILE_*, WAVE_9_MOBILE_*, WAVE_10_MOBILE_*, WAVE_14_RESPONSIVE_HARMONY_REPORT.md).
  - `Implementation/SURFACE_CHECKLISTS/Dashboard.md` as template.
  - `docs/UIUX/16_POINT_ALIGNMENT_REVIEW.md` and `MASTER_FIX_EXECUTION_PLAN.md` for context.
- **Risks & Mitigations:** Scope creep on "exact visual" — freeze mock set at start of Phase 1. BP wars — enforce the 767/1024 matrix in code + docs. Legacy drawer usage — aggressive codemod + review gate.
- **Metrics:** 
  - % of interactive elements ≥44px on mobile (automated).
  - Mobile-specific Playwright pass rate.
  - Field user task completion time / error rate (post Phase 2).
  - Visual diff score vs v2 mocks.

---

## Immediate Next Actions (Start Today)

1. Read this plan + Analysis.md + the 4 key mocks + `RESPONSIVE_BEHAVIOR_MATRIX.md`.
2. Implement Phase 1.1 unified hook (smallest high-leverage change).
3. Stand up ResponsiveDrawer wrapper.
4. Kick off CES Board vertical rewrite (biggest user-visible win).
5. Parallel: Policy grid collapse + stacked cards.
6. Track in existing Jira/Linear + update `Responsive_Parity_Validation.md` live.

**This plan makes the mobile-first claim real.** Dashboard leads the way; the other three (CES, Evidence, Policy) follow immediately in Phase 1 so field users finally get the premium one-handed glass experience promised by the v2 mocks.

*End of Agent 12 4-Phase Plan. Unique lens applied: ruthless focus on "does it feel like the phone was the first target, not the last?"*

---
*Agent 12 Plan — Ready for Execution — 2026-05-17*