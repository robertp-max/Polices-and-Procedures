# Agent 02 — Four-Sided Border Contract 4-Phase Implementation Plan

**Subagent:** 02 — 4-Sided Border Contract Specialist  
**Primary Success Metric:** 100% of operational surfaces (single-card and multi-card compositions) pass the 4-sided border contract in both desktop and mobile viewports, verified by side-by-side screenshot comparison to the strongest Top Picks / Desktop v2 / Mobile v2 mockups.  
**Definition of Pass:** Visible, consistent Layer 0 backdrop frame (minimum effective 16 px, target clamp(16px,1.6vw,28px) or greater) around the outermost edge of the primary glass/content group on all four sides; no content or sub-glass touching the painted perimeter of the primary Layer 1 surface; uniform breathing around the entire composition; mobile respects device bezel + safe-area equivalents with internal margins matching mocks.  
**Non-Negotiable:** Full-bleed or edge-hugging glass/content is forbidden on operational pages. Only formally documented full-canvas tool exceptions (print, signature canvas, large media viewers) permitted.

**References:** CANONICAL_UI_SYSTEM_SPEC.md §4, UIUX_RECONSTRUCTION_MASTER_PLAN.md §4.5, Review_02_Analysis_PostCompletion..., Top Picks & v2 mockup folders.

---

## Phase 1 — Shell Hardening, Primitive Lock & Contract Enforcement (Foundation — 1–2 days)

**Priority Surfaces:** Shell itself (CommandCenterLayout, ShellFrame, ShellContentFrame) + documentation + any shared wrappers.  
**Goal:** Make the shell the single source of truth for both outer inset and inner content breathing; prevent future nesting and fill violations at the architectural level.

### Exact CSS/Layout Changes (Shared Shell)
- **ShellFrame.tsx:46-55**: Keep outer padding. Add comment + export of a new CSS var `--ci-glass-content-inset: clamp(12px, 1.2vw, 24px)` (or 16px base) for inner content breathing. Consider moving final content padding responsibility here or to a new primitive.
- **CommandCenterLayout.tsx:859-862** (the scroll wrapper):
  ```tsx
  <div className={`${isMobile ? 'pb-[calc(96px+env(safe-area-inset-bottom))]' : 'pb-4'} px-4 sm:px-6 md:px-8`} style={{ paddingTop: 'var(--ci-glass-content-inset, 16px)' }}>
    {children}
  </div>
  ```
  (Provides baseline uniform 4-sided breathing inside the glass for all pages without requiring every page to remember padding.)
- **ShellContentFrame.tsx**: 
  - Add `data-constrained="true"` and strict warning in JSDoc: "Pages MUST NOT return their own ShellContentFrame or ShellFrame. They render plain content only."
  - On mobile (`isMobile` branch already present in layout): keep `rounded-none` but ensure the new px/padding above still applies inside the bezel.
- **App.tsx:211**: Change the route wrapper to `<div className="min-h-full w-full opacity-100" data-page-root>` (marker only; no layout semantics).
- **New Primitive (src/policy/components/ui/ConstrainedPageContent.tsx)**: 
  ```tsx
  export const ConstrainedPageContent: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className = '' }) => (
    <div className={`flex flex-col gap-4 sm:gap-5 ${className}`} data-constrained-page-content>
      {children}
    </div>
  );
  ```
  Optional: pages may use it for multi-card grouping to guarantee outer margin.
- **CesLayout.tsx & OnboardingV2Layout.tsx**: Remove or conditionalize `h-full w-full` on their outer divs (make them `w-full flex-1 min-h-0` transparent containers that compose inside the parent glass). Preserve their internal `mx-auto max-w-[1440px] px-6...` only as content constraints, not as a replacement for shell breathing.
- **index.css**: Add the new `--ci-glass-content-inset` token + comments referencing §4.

### Documentation & Guardrails
- Update CANONICAL_UI_SYSTEM_SPEC.md §4 and MASTER_PLAN §4.5 with "Implementation Rule: Pages return content only. Never import or render ShellContentFrame/ShellFrame."
- Add to PR template / PHASE3 checklist: "4-sided border contract — no h-full/w-full at page root, no self Shell*Frame, uniform breathing verified."
- (Optional) Add simple ESLint rule or grep-based CI check forbidding `ShellContentFrame` import inside `/pages/` and `onboarding-v2/pages/`.

### Border Contract Acceptance Test (Phase 1 Gate)
- Desktop (≥1280 px) + Mobile (390 px) full-viewport screenshots of a minimal "hello" route using only the shell + plain `<div>Content</div>`.
- Side-by-side comparison to closest Top Picks / v2 mock (e.g. 11_Onboarding or 01_Dashboard).
- Pass criteria: ≥16 px visible Layer 0 frame around the ShellContentFrame glass on all sides; inner content has ≥12 px padding from glass painted edge; no touching; mobile respects notch/safe-area without content kissing bezel.
- Record in `tmp-ui-verify-screenshots/` with filename `Agent02_Phase1_Shell_Baseline_<date>.png`.

**Exit Criteria:** Shell cannot be violated by well-behaved content. All future pages inherit correct framing by default.

---

## Phase 2 — Highest-Visibility Core Surfaces (Dashboard, Evidence, Audit, Calendar) (2–3 days)

**Priority Order (by visibility + violation severity):**  
1. DashboardPage (reference surface, worst self-nesting)  
2. EvidenceCenterPage  
3. AuditModePage  
4. MasterCalendarPage  

### Exact Changes per Surface
- **DashboardPage.tsx**:
  - Remove import and wrapper `<ShellContentFrame ...>` (lines ~19-25, 413, 506).
  - Return the inner `<div className="flex flex-col gap-4 sm:gap-5"> ... </div>` directly (now receives shell padding + new inner px).
  - Remove the `-mx-3 sm:mx-0 px-3 sm:px-0` hack on the action board (line 463). Replace with consistent `mx-0` or rely on parent padding. Ensure the four BoardColumns sit inside a group container with outer margin.
- **EvidenceCenterPage.tsx**: Change root `<div className="flex flex-col h-full">` (656) to `<div className="flex flex-col">` (or use new ConstrainedPageContent). Standardize all header/panel `mx-*` to a single token-driven value or remove (rely on shell).
- **AuditModePage.tsx**: Change root `h-full w-full ...` (322) to content-only. Unify `mx-3/6/10` on header (327+) to `mx-4 sm:mx-6` (or remove if shell padding suffices).
- **MasterCalendarPage.tsx**: Change `ci-page-container h-full w-full ...` (246) to plain flex content container. Ensure timeline and sub-views maintain group-level margin.

**Additional for all Phase 2 surfaces:**
- Replace any `overflow-hidden relative z-10` fill patterns with `flex-1 min-h-0` where needed for scrolling children.
- Ensure multi-card sections are wrapped so the *entire group* has visible outer margin from the glass edge (matching mock "floating composition").
- Mobile: verify `isMobile` branches do not introduce edge-kissing after removing fill classes.

### Border Contract Acceptance Test (Per Surface)
For each of the 4 surfaces:
1. Capture desktop (1440×900+) and mobile (iPhone 14 / 390×844) screenshots in both light and dark/CI-ION modes.
2. Side-by-side comparison (or overlay) against the closest mock:
   - Dashboard → Desktop/v2/01_Dashboard_Desktop_v2.jpg + Top Picks mobile dashboard
   - Evidence → 12_EvidenceCapture_Desktop_v2.jpg + mobile evidence
   - Audit/Calendar → corresponding v2 mocks.
3. Quantitative check (or visual ruler): minimum 16 px Layer 0 from viewport to primary glass outer edge; minimum 12–16 px from glass inner painted edge to first content/card edge on all four sides; no `-mx` cancellation visible; uniform breathing around KPI groups / boards / tables.
4. Record pass/fail + annotated screenshots in `tmp-ui-verify-screenshots/Agent02_Phase2_<Surface>_<date>/`.
5. Update surface-specific *Reconstruction_Plan.md and *Canonical_Primitive_Usage.md with "4-sided contract: PASS (screenshot evidence attached)".

**Phase 2 Exit:** Dashboard + Evidence + Audit + Calendar all pass visual contract test. 4/4 surfaces green.

---

## Phase 3 — Remaining Policy, Library, Detail, Onboarding Batch & CES Surfaces (3–4 days)

**Priority:** Library/Forms → Framework → PolicyLifecycle/Governance → PolicyDetail/Shared views → OnboardingV2 batch/dashboard/activate views → All CES pages (via CesLayout) + MyTasks/Pm overlays.

### Exact Changes
- **LibraryPage.tsx / FormsPage.tsx**: Replace `h-full w-full ... bg-ci-bg` root with plain content div (or ConstrainedPageContent). Remove or scope the custom bg so the canonical glass surface remains authoritative. Ensure list/grid has outer margin.
- **FrameworkPage.tsx / GovernancePage.tsx / PolicyLifecyclePage.tsx**: Strip `h-full w-full` from roots (206, 23, 246). Keep useful internal `p-6 md:p-8` + `max-w` only as content constraints inside the now-padded glass. Ensure Framework's architecture grid reads as a single composition with breathing.
- **PolicyDetailPage + SharedPolicyDetailView + GVGBDetailView**: Ensure delegated content uses consistent padding containers. Add `data-detail-surface` and verify the primary detail glass/panel group has 4-sided margin (use shell padding + avoid full-width tables that touch edges).
- **OnboardingV2/* (BatchViewPage, OnboardingV2Layout, dashboard/activate/audit/governance pages)**: In layout, change outer `flex h-full min-h-[calc...]` to `flex w-full flex-1 min-h-0`. Batch grid `h-full` → content sizing. All batch sub-views must inherit shell breathing; remove any local full-bleed assumptions. Note: keep scoped tokens per existing comment, but enforce layout contract.
- **CesLayout.tsx + Ces*Pages (Board, Reports, Workloads, Calendar, MyTasks, etc.)**: 
  - Outer div: `w-full flex-1 min-h-0 flex flex-col` (transparent).
  - Keep `mx-auto max-w-[1440px] px-6 md:px-8 py-6` on the inner main as a *content* max-width constraint only — the shell now supplies the primary 4-sided breathing around the CES composition as a whole.
  - Update CesBoardPage, CesWorkloadsPage etc. to remove any h-full fill on their direct children.
- **PM / iAdministrator / Journey / Staffing / HelpCenter pages**: Sweep for `flex flex-col h-full` patterns (HubstaffStaging, Pm*, etc.). Normalize to content-only or ConstrainedPageContent.

### Border Contract Acceptance Test (Per Surface or Logical Group)
- Same protocol as Phase 2 for every surface/group.
- Special focus on mobile bezel + safe-area for Onboarding batch views and CES (which have dense internal chrome).
- For detail views (PolicyDetail): compare to Desktop/v2/03_PolicyDetail_Desktop_v2.jpg and Mobile/v2 equivalents.
- CES Board: compare to Desktop/v2/04_CESBoard_Desktop_v2.jpg + Top Picks 02_CES_Board_Mobile_v2.jpg.
- Record per-surface evidence folders. Update every surface-specific Reconstruction_Plan.md with acceptance sign-off.

**Phase 3 Exit:** All listed surfaces + CES module pass. ≥12 surfaces green. No remaining self-ShellContentFrame or root `h-full w-full` in operational /pages/ or ces/.

---

## Phase 4 — Cross-Cut Audit, Remaining Surfaces, Enforcement & Final Sign-Off (2–3 days)

**Priority:** iAdministrator deep pages, PM full suite, Journey modules, Staffing calendar, any new or missed routes, full regression of Phases 2–3.

### Exact Changes
- Global sweep (grep for `h-full w-full`, `ShellContentFrame` imports in page folders, `-mx-`, `ci-page-container` at root level).
- Update any remaining special layouts.
- Add permanent guard: 
  - Lint rule or `scripts/check-4sided-contract.mjs` that fails CI on forbidden patterns.
  - Runtime dev-only console warning if a page root renders with `h-full` + `w-full` classes inside `[data-shell-content-frame]`.
- Formalize exceptions:
  - Document in CANONICAL_UI_SYSTEM_SPEC.md §4 (and new EXCEPTIONS.md): `FormPrintView`, `PrintPage`, `GVGBAppendixPrint`, full `SignaturePad` mode, large PDF/image viewers, and any dedicated full-canvas tool.
  - These must carry `data-full-canvas="true"` and visually distinct treatment (no glassmorphism claim).

### Border Contract Acceptance Test (Final Verification)
- Full matrix: every operational route (≥20 surfaces) + mobile/desktop + both modes.
- Automated or manual comparison script against reference mock set (Top Picks strongest + v2 per surface).
- Produce `Agent02_Final_4Sided_Verification_Report.md` containing:
  - Pass/fail table (100% pass required).
  - Representative annotated screenshots.
  - Mobile safe-area verification (notch, home indicator, dynamic island).
- Update:
  - `DRIFT_REGISTER.md` (close D19 / constrained container item).
  - All PHASE* checklists and PHASE1_COMPLETION_SIGNOFF_PACKAGE.md (retroactive correction note).
  - 16_POINT_* validation docs with new 10/10 score for Review 02.
- Final sign-off by Design Lead + Engineering Lead + Program Owner with screenshot evidence attached.

**Phase 4 Exit (Overall Program Exit for this contract):** 100% pass rate. Zero open violations. Enforcement in place. Visual parity with canonical mocks achieved on every surface.

---

## Cross-Cutting Requirements (All Phases)

- **Mobile Safe-Area + Bezel Equivalents**: Every content container must incorporate `env(safe-area-inset-*)` (top/left/right/bottom) via padding or the layout wrapper. Minimum 12–16 px + safe-area on all sides inside the device frame. Never allow content to kiss the visual bezel.
- **Exceptions Process**: Any surface requiring exemption must be proposed in writing, approved by the UI/UX Program Owner, added to the canonical exceptions list, and visually treated as "tool mode" (opaque, no glassmorphism magnification claim).
- **Measurement & Regression**: Use Playwright or manual captures at fixed viewports (1440w desktop, 390w mobile). Store in `tmp-ui-verify-screenshots/Agent02/`. Re-run full matrix on any shell or primitive change.
- **Token Usage**: All new padding/margin values must resolve through `--ci-*` tokens (extend the existing inset token family).
- **No New Violations**: Any Phase 3+ surface delivery that re-introduces a violation is automatically incomplete.

**Success Metric Achieved When:** Every screenshot in the final verification package shows the primary operational glass or card-group floating inside a clear, continuous Layer 0 frame on all four sides — exactly as rendered in the strongest Top Picks and v2 reference mocks. The glassmorphism magnification effect is perceptually restored across the entire platform.

---

**End of Agent 02 4-Phase Plan**  
This plan is evidence-driven, directly derived from the violations catalogued in the companion Analysis and the locked spec. Execution will deliver the non-negotiable 100% pass rate.