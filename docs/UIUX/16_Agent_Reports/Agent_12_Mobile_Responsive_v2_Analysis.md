# Agent 12: Mobile & Responsive v2 Parity Specialist — Analysis Report

**Subagent:** 12  
**Lens:** Complete mobile experience fidelity — bottom sheets, one-handed workflows, 44px touch targets, safe-area handling, and exact visual match to the Mobile/v2 mockups and Top Picks mobile images.  
**Date:** 2026-05-17  
**Status:** Diagnostic complete; mobile-first claim is aspirational but not realized in code.

---

## Executive Summary

The product claims "mobile-first" design (see `RESPONSIVE_BEHAVIOR_MATRIX.md`, `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md`, and multiple WAVE mobile reports). In practice, the implementation is **desktop-first with reactive patches**. 

**Current Mobile Fidelity Score: 4.5/10** (improved from ~3-5/10 in prior `UIUX_MOBILE_RESPONSIVE_AUDIT.md` thanks to shell primitives, but core operational surfaces remain shrunken-desktop experiences).

**Strengths (shell layer):**
- Bottom tab bar (5 slots) + `ShellMobileDrawer` wrapping `BottomSheetDrawer` for "More".
- `BottomSheetDrawer` primitive exists with swipe, safe-area-inset-bottom, drag handle, Escape/overlay close.
- Some `ci-touch-target` (min-height:44px) and `max-width:100vw; overflow-x:hidden` guards in `index.css`.
- Dashboard has partial responsive stacking at 768px.

**Critical Failures (field surfaces used daily by clinicians/surveyors):**
- CES Board renders as 6-column Kanban with `min-width:1700px` + `overflow-x-auto` (violates matrix: "Mobile: Vertical list (agenda style). No Kanban columns").
- Multiple high-frequency drawers hard-code right-side panels (`w-[560px]`, `max-w-[760px]`, `w-[min(100vw,420px)]`): `WorkflowDrawer.tsx` (CES), `UnitDrawer.tsx` (Onboarding V2), `DetailDrawer` (EvidenceCenterPage), many `TaskDetailRightPanel` + `RightDrawer` usages without conditional.
- Onboarding V2 lists use `<table>` + 12-col grids; UnitDrawer leaks 760px desktop drawer.
- Policy metadata grids remain `grid-cols-2` on phones (e.g. `SharedPolicyDetailView.tsx`).
- Inconsistent breakpoints (shell `MOBILE_BP=1024`, content `768`, calendar `1280`).
- Touch targets, safe areas, and thumb-reach incomplete beyond shell tabbar.
- Visual language on mobile is "shrunken desktop glass" rather than the calm, native-feeling, portrait-optimized glassmorphic cards shown in `Mobile/v2/` mocks (stacked sections, generous single-column rhythm, prominent bottom-up actions, exact teal/orange accent hierarchy on deep glass).

**v2 Mock Visual Contract (from Top-Picks + Mobile/v2/):**
- iPhone frame, deep atmospheric Layer 0 bg, single premium glass Layer 1 surface with rounded 2rem corners, subtle inner borders, soft shadows.
- Vertical stacking only; cards with large tap areas, progress bars, status chips (teal approved / orange action-needed).
- Top bar: back + title + minimal actions (no hamburger on primary surfaces).
- Bottom tab or contextual bottom action bars for primary CTAs (Capture Evidence, etc.).
- One-handed: everything reachable without stretch; 48px+ targets preferred.
- Exact examples:
  - `01_Dashboard_Mobile_v2.jpg`: KPI hero stats, stacked premium cards, clean typography.
  - `02_CES_Board_Mobile_v2.jpg`: Vertical agenda-style cards with filters, urgent badges, no columns.
  - `03_PolicyDetail_Mobile_v2.jpg`: Sectioned vertical cards (Overview, Coverage, Compliance), teal progress, rounded glass panels.
  - `06_EvidenceCapture_Mobile_v2.jpg`, `13_PolicySearch_Mobile_v2.jpg`: Full-bleed capture + search optimized for thumb + safe areas.

Dashboard is the only surface close to benchmark per `Responsive_Parity_Validation.md`. All others require redesign of presentation layer, not just wrappers.

---

## Key References (Absolute Paths)

- Design Specs:
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\design\RESPONSIVE_BEHAVIOR_MATRIX.md`
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\design\ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md`
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\design\EVENICE_CAPTURE_SPECIFICATION.md` (referenced)
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\design\CES_BOARD_VISUAL_LANGUAGE.md`
- Implementation Reports & Validation:
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\Responsive_Parity_Validation.md`
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\RESPONSIVE_ACCEPTANCE_MATRIX.md`
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\UIUX_MOBILE_RESPONSIVE_AUDIT.md`
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\design-references\RESPONSIVE_BEHAVIOR_MATRIX.md` (copy)
  - Multiple WAVE_*_MOBILE_*_REPORT.md in `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/`
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\docs\UIUX\MASTER_FIX_EXECUTION_PLAN.md`, `16_POINT_ALIGNMENT_REVIEW.md`, `CANONICAL_UI_SYSTEM_SPEC.md`
- Mockups (visual contract):
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\mockup\Mobile\v2\` (01_Dashboard_Mobile_v2.jpg ... 13_PolicySearch_Mobile_v2.jpg + others)
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\mocks\Top-Picks\` (01-03, 13 key mobile v2)
  - Desktop counterparts for contrast in `mockup\Desktop\v2\`
- Code:
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\CommandCenterLayout.tsx` (MOBILE_BP=1024, tab bar, ShellMobileDrawer)
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\BottomSheetDrawer.tsx`, `RightDrawer.tsx`, `ShellMobileDrawer.tsx`, `ShellContentFrame.tsx`, `ShellFrame.tsx`
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\index.css` (touch targets, safe-area partial, overflow guards, media queries limited)
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\components\board\SprintExecutionBoard.tsx` (Kanban leak)
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\components\details\WorkflowDrawer.tsx` (hard 560px right)
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\onboarding-v2\components\UnitDrawer.tsx` (hard 760px)
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\EvidenceCenterPage.tsx` (side DetailDrawer)
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\DashboardPage.tsx`, `LibraryPage.tsx`, `PolicyDetailPage.tsx`, `SharedPolicyDetailView.tsx`
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\PhotoEvidenceCapture.tsx` (strong mobile primitive)
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\MasterCalendarPage.tsx` (good conditional example)

---

## Visual Contract from Mobile/v2 Mocks (Side-by-Side Lens)

**Dashboard (01_Dashboard_Mobile_v2.jpg + Top-Picks):** Premium dark glass cards stacked vertically under hero KPI row. Large numbers, subtle progress, teal/orange micro-badges. Bottom tab nav visible with generous safe-area padding. One continuous glass surface feeling expensive, not crammed. Thumb zone: all CTAs in lower 2/3.

**CES Board (02_CES_Board_Mobile_v2.jpg):** Strictly vertical scroll of large rounded cards (Event/Unit title, owner, due, status chip, progress). Top filter chips (Upcoming/Ready/In Progress/...). Orange for blockers/urgent. No columns, no drag visible on phone. Matches matrix exactly. Feels like native task app, not shrunken Jira.

**Policy Detail (03_PolicyDetail_Mobile_v2.jpg + 10_PoliciesLibrary_Mobile_v2.jpg):** iOS-native top bar (back, title, share). Then stacked glass sections ("Policy Overview", "Coverage Details", "Compliance Status") — each a self-contained rounded card with internal 1-col layout, teal progress bars, large legible body text, minimal metadata. Single-column always. Generous vertical rhythm (16-24px gaps). Action button prominent at section foot or bottom bar.

**Evidence Capture & Search (06_EvidenceCapture_Mobile_v2.jpg, 13_PolicySearch_Mobile_v2.jpg, 11_EvidenceList_Mobile_v2.jpg):** Full-bleed camera affordance or large photo grid. Bottom sheet or inline large capture button (44px+). Search bar fat and sticky. Results as tall cards. Safe area respected at notch + home indicator. Glass overlays for metadata without killing contrast.

**Common v2 DNA:** 
- Deep navy/maroon Layer 0 + single translucent glass Layer 1 (no white "paper" leaking).
- Consistent 14-18px body, 22px+ titles on phone.
- Rounded 16-24px card radii.
- Accent: teal for positive/ready, warm orange for action/urgent, never red except true blocked.
- No hover states; always visible pressed/active.
- Bottom-up flows (sheets rise for secondary).

Current code rarely matches this rhythm on phone; most surfaces retain desktop spacing, 2-col fragments, and side-slide chrome.

---

## Surface-by-Surface Current State (Mobile Mindset Audit)

### 1. Shell & Navigation (CommandCenterLayout + UI Primitives)
- **Good:** Bottom 5-tab bar with `env(safe-area-inset-bottom)`, `ShellMobileDrawer` → `BottomSheetDrawer` for full nav. `useIsMobile()` at 1024px collapses rail/subnav.
- **Leaks:** BP=1024 (per code) vs matrix/acceptance 767px mobile cutoff. Tablet (768-1023) treated as mobile for nav but content often not. Tab labels `text-[9px]` too small vs v2 premium feel. No global FAB or contextual bottom bars.
- **Files:** `src/policy/components/CommandCenterLayout.tsx:163` (MOBILE_BP), `866-904` (tabbar), `794` (ShellMobileDrawer), `src/policy/components/ui/BottomSheetDrawer.tsx:115` (safe-area), `src/index.css:448` (ci-touch-target only min-h), `1352+` (shell classes).
- **Parity vs Mock:** Tab bar close but typography/spacing not premium-glass enough.

### 2. Dashboard (Benchmark per Responsive_Parity_Validation)
- **State:** Uses local `viewportWidth < 768` for stacking (`grid-cols-1` on mobile), premium panels, hero. Closest to passing side-by-side with 01 mock.
- **Leaks:** BP mismatch with shell. Some inner boards still scroll-x on small viewports. Action buttons not always 44px in lists.
- **Files:** `src/policy/pages/DashboardPage.tsx:50,424,463-464`.
- **Verdict:** Strong reference surface; needs only polish + token alignment for exact v2 mock match.

### 3. CES Board & Execution (Highest Field Risk)
- **State:** `SprintExecutionBoard` always renders 6 fixed columns (`gridTemplateColumns: repeat(6, minmax(280px,1fr))`, `minWidth:1700`). `WorkflowDrawer` = fixed `w-[560px]` right panel + backdrop (no conditional, no BottomSheet).
- **Violations:** Direct contradiction to `RESPONSIVE_BEHAVIOR_MATRIX.md:69` ("Vertical list... No Kanban") and `02_CES_Board_Mobile_v2.jpg`.
- **Files:** `src/policy/ces/components/board/SprintExecutionBoard.tsx:138-139,211-220`, `src/policy/ces/components/details/WorkflowDrawer.tsx:57-68` (hardcoded aside).
- **Verdict:** Major fail. Desktop Kanban leaks completely; detail not one-handed.

### 4. Evidence Center & Capture
- **State:** `PhotoEvidenceCapture` primitive is excellent (capture="environment", downscale, JPEG). Hierarchy and list use cards.
- **Leaks:** `DetailDrawer` uses side `w-[min(100vw,420px)]` + `border-l` (right slide, not bottom). Long lists may overflow. No dedicated mobile evidence capture page matching 06 mock full-bleed.
- **Files:** `src/policy/pages/EvidenceCenterPage.tsx:1158-1162` (DetailDrawer), `src/policy/components/ui/PhotoEvidenceCapture.tsx`.
- **Verdict:** Capture primitive ready; surface chrome and detail not mobile-native.

### 5. Policy Library + Detail
- **State:** Library grid responsive (`grid-cols-1 md:...`). Shared detail has some `md:` prefixes.
- **Leaks:** Multiple `grid-cols-2` (no mobile prefix) or `grid-cols-2 md:grid-cols-4` → 2-col cramped on 375px phones (metadata, coverage). Long policy content/tables still need horiz scroll in places. No bottom-sheet actions or stacked v2 section cards.
- **Files:** `src/policy/pages/LibraryPage.tsx:679`, `src/policy/components/SharedPolicyDetailView.tsx:600,688,752,819,1003,...` (grids), `PolicyDetailPage.tsx`.
- **Verdict:** Partial collapse; does not match clean vertical card sections in `03_PolicyDetail_Mobile_v2.jpg`.

### 6. Onboarding V2 (Critical per Pattern Library)
- **State:** Batch list = table (desktop). BatchView = 12-col grid. Unit detail = `max-w-[760px]` right drawer (`UnitDrawer.tsx:34`).
- **Violations:** `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md` explicitly forbids wide drawer on mobile; demands vertical lists, bottom sheets, segmented tabs, FABs.
- **Files:** `src/policy/onboarding-v2/pages/BatchListPage.tsx:60` (table), `BatchViewPage.tsx:46` (grid-cols-12), `src/policy/onboarding-v2/components/UnitDrawer.tsx:32-34`.
- **Verdict:** Worst offender for new-user flows on phones.

### 7. Calendar, MyTasks, Forms/eCign, Others
- Calendar: Good conditional Bottom vs Right in `MasterCalendarPage.tsx:385-443` (uses <768), but inner panels (TaskDetailRightPanel) and grids not fully adapted.
- Forms/Signing: Cramped inputs, signature pad not large on phone, iframe previews problematic.
- Staffing: Better (uses DataGrid + SurfaceCard).
- Journey/StagingM01: Still has absolute vw transforms — breaks on mobile.

**Cross-Cutting:**
- No exported canonical `useIsMobile(breakpoint = 767)` — every page reinvents.
- `RightDrawer` and custom fixed panels used without `isMobile ? BottomSheetDrawer : RightDrawer` wrapper.
- Touch targets: many icon-only, table cells, small buttons <44×44 (audit confirmed).
- Safe-area: only shell tabbar + BottomSheet; missing on standalone pages, full modals, long content padding.
- Glass tokens applied but mobile-specific density/typography scaling weak (v2 mocks have tighter, calmer rhythm).

---

## Unique Mobile Lens Insight

**"The mobile claim is a shell-deep illusion."**

The CommandCenterLayout + BottomSheetDrawer + safe-area tabbar deliver a credible *navigation* mobile layer. But the product’s highest-value, highest-frequency surfaces for the actual mobile users (field clinicians capturing evidence during visits, surveyors running CES boards on phones, new hires completing Onboarding V2 activation in the car) were never migrated from the desktop mental model.

Result: users experience "desktop UI in a phone window" — horizontal swipe to see Kanban columns, right-drawer that eats 80% of screen and requires two hands, 2-column metadata that forces 9pt text, tables that overflow.

The v2 mocks (especially Top-Picks 01-03 and Mobile/v2/ set) depict the *opposite*: purpose-built portrait glassmorphic apps where the phone *is* the interface — every pixel serves one-handed thumb reach, every interaction rises from the bottom or stacks cleanly, and the glass premium feeling is *amplified* on small screens rather than diluted. 

Until the data-presentation layer itself (CES columns → vertical cards, drawers → bottom sheets or full pages, grids → single-col accordions, actions → thumb bars) is rebuilt per surface, "mobile-first" remains marketing. The primitives exist; the adoption and redesign discipline do not. Closing the gap is not a polish ticket — it is a Phase-level surface rewrite program.

Dashboard proves it *can* be done right. The other four must now follow exactly.

---

## Files & Components Requiring Immediate Mobile Attention (Prioritized)

1. `src/policy/ces/components/board/SprintExecutionBoard.tsx` + `WorkflowDrawer.tsx`
2. `src/policy/onboarding-v2/components/UnitDrawer.tsx` + Batch* pages
3. `src/policy/pages/EvidenceCenterPage.tsx` (DetailDrawer + hierarchy)
4. `src/policy/components/SharedPolicyDetailView.tsx` + Policy pages (grids + sections)
5. `src/policy/components/CommandCenterLayout.tsx` + ui/ (unify BP + hook)
6. `src/index.css` (global touch, safe-area utilities, mobile typography scale)
7. `src/policy/components/ui/RightDrawer.tsx` (add responsive variant or deprecate for mobile callers)
8. All `TaskDetailRightPanel.tsx`, `SprintTaskPanel.tsx` usages
9. Forms signing workspace and long content views

---

## Next Steps (Bridge to Plan)

This analysis feeds directly into the companion `Agent_12_Mobile_Responsive_v2_4Phase_Plan.md`. Early phase will deliver exact visual + behavioral parity on Dashboard, CES Board, Evidence Capture flows, and Policy Detail against the strongest Mobile/v2 + Top-Picks mocks at 375px viewport, using bottom sheets, vertical stacks, 44px+ targets, and safe-area everywhere.

All references, screenshots, and code paths above were inspected via direct file reads and content searches within the workspace boundary.

*If it doesn't feel excellent on a phone in one hand, per the matrix, it doesn't ship.*

---
*Agent 12 Analysis Complete — 2026-05-17*