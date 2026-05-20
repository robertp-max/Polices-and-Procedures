# Agent 02 — Four-Sided Border Contract Analysis

**Subagent:** 02 — 4-Sided Border Contract Specialist  
**Lens:** Constrained Page View Contract (CANONICAL_UI_SYSTEM_SPEC.md §4)  
**Date:** 2026-05-17  
**Scope:** Independent audit of all operational surfaces (src/policy/pages/, src/policy/ces/pages/, onboarding-v2, shared detail views) against the non-negotiable 4-sided breathing room rule.  
**Primary References Read:**  
- docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md (full §4 + "Why This Rule Exists")  
- docs/UIUX/UIUX_RECONSTRUCTION_MASTER_PLAN.md (§4.5 Cross-Cutting Layout Rule)  
- docs/UIUX/16_POINT_ALIGNMENT_REVIEW.md (Review 02 section)  
- _Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/Review_02_Analysis_PostCompletion_4Sided_Contract_Violations.md (and all *Reconstruction_Plan.md + *Canonical_Primitive_Usage.md)  
- Visual contracts: Top Picks/ (11_OnboardingActivation_Desktop_v2.jpg, 12_EvidenceCapture_Desktop_v2.jpg, 01_Dashboard_Mobile_v2.jpg and peers) + mockup/Desktop/v2/ + mockup/Mobile/v2/ (multiple Desktop/Mobile v2 JPGs)  

---

## Part 1 — Independent Current State Analysis

### Executive Finding (4-Sided Lens)
The shell (`CommandCenterLayout` + `ShellFrame` + `ShellContentFrame`) **partially** implements the outer viewport inset (desktop `clamp(16px, 1.6vw, 28px)` via `ShellFrame.tsx:51` and `--ci-glass-layer1-inset-desktop` in `src/index.css:60`), producing a visible Layer 0 backdrop frame around the primary glass canvas on desktop. However, **page-level root containers systematically violate the contract** by filling the interior of that glass edge-to-edge (`h-full w-full`), self-nesting additional `ShellContentFrame` instances, applying `-mx-*` edge-cancellation hacks, and using variable `mx-3/6/10` or bespoke `p-*` that destroy uniform breathing room around the primary content composition.  

**The problem has NOT been fixed in code.** The existing `Review_02_Analysis_PostCompletion_4Sided_Contract_Violations.md` (2026-05-17) is an accurate, line-by-line documentation of the exact violations still present today. Sign-off packages (`PHASE1_COMPLETION_SIGNOFF_PACKAGE.md`, `PHASE1_EXIT_CHECKLIST.md`, Validation Rounds) claimed "4-sided verified" and "reference surface demonstrated" for Dashboard without code remediation or screenshot proof against Top Picks.

### Visual Contract Internalization (from Mockups)
- **Top Picks 11_OnboardingActivation_Desktop_v2.jpg** & **12_EvidenceCapture_Desktop_v2.jpg**: Primary glass panel (rounded-3xl or 2rem) is distinctly inset from the macOS/browser viewport frame on all four sides (~30-60 px effective visible Layer 0 gutter). Backdrop (dark atmospheric or light gutter) continuously frames the entire glass rectangle. Multi-card/KPI compositions sit inside the glass with generous internal margins; no content touches the painted glass edge. The glass reads as a single floating Layer 1 object.
- **Desktop/v2/01_Dashboard_Desktop_v2.jpg**, **02_EvidenceCenter_Desktop_v2.jpg**, **04_CESBoard_Desktop_v2.jpg**, **03_PolicyDetail_Desktop_v2.jpg**: Consistent 4-sided breathing. The operational glass surface never kisses viewport/shell edges; inner cards/panels maintain outer margin around the group.
- **Mobile counterparts (Top Picks 01_Dashboard_Mobile_v2.jpg, 02_CES_Board_Mobile_v2.jpg, 03_PolicyDetail_Mobile_v2.jpg + Mobile/v2/)**: Inside device bezel, glass panels have clear internal margins (never kiss screen edges). Safe-area + bezel breathing room is visible; rounded corners preserved where appropriate; content never full-bleed to phone frame.
- **Gap in implementation**: Current rendered output shows the outer glass inset (good), but operational content (KPIs, boards, tables, headers) hugs or cancels the inner glass perimeter, collapsing the magnification effect the spec explicitly exists to protect.

### Root Architectural Cause
1. `CommandCenterLayout.tsx:858-862`: `{children}` placed inside `absolute inset-0` scroll container + `pb-4` wrapper inside `ShellContentFrame` (the painted glass). No enforced inner padding or content-boundary contract.
2. `App.tsx:211`: Every route wrapped in `<div className="min-h-full w-full opacity-100">`.
3. Page authors (post-Phase 1) used legacy self-contained layout patterns (`h-full w-full`, `ci-page-container`, self `<ShellContentFrame>` at `DashboardPage.tsx:413`, `-mx-3` at :463, `mx-3 sm:mx-6 md:mx-10` on Audit/Evidence headers).
4. `ShellContentFrame.tsx` docstring and `ShellFrame.tsx` comments declare "pages must render inside this" — but enforcement is purely social; no primitive wrapper, no lint, no runtime guard.
5. CES/Onboarding special layouts (`CesLayout.tsx:48`, `OnboardingV2Layout.tsx:33`) re-declare `w-full h-full` and their own chrome, assuming full control of the glass interior.
6. Surface reconstruction plans (Dashboard_Reconstruction_Plan.md, Evidence_Reconstruction_Plan.md, etc.) correctly called out the need for "strict 4-sided breathing room" and "remove full-bleed assumptions" but the executed code in `/pages/` retained the anti-patterns.

The shell is not the primary violator; **page components ignore the frame they are given**.

### Catalog of Surfaces — Current Compliance (Desktop + Mobile)

**Violating (High Severity — Primary Glass or Group Touches/Cancels Edges)**

| Surface                          | File / Key Lines                          | Desktop Violation                                                                 | Mobile Violation                                      | Measured Gap vs Spec / Mocks                          | Severity |
|----------------------------------|-------------------------------------------|-----------------------------------------------------------------------------------|-------------------------------------------------------|-------------------------------------------------------|----------|
| DashboardPage (reference)       | DashboardPage.tsx:413,463                | Self `<ShellContentFrame>` nested inside layout's; `-mx-3` on action board makes cards touch glass edge | `rounded-none` + edge patterns; content near bezel   | 0px inner breathing (vs 16-28px outer + generous mock internal); glass-on-glass collapse | Critical |
| EvidenceCenterPage              | EvidenceCenterPage.tsx:656,756           | `flex flex-col h-full`; sticky header uses `mx-3 sm:mx-6` (variable, not uniform) | h-full + minimal side padding                        | Content fills glass interior; panels hug edges (vs uniform frame in 12_Evidence mock) | High |
| AuditModePage                   | AuditModePage.tsx:322,327,430            | `h-full w-full ... gap-0`; header `mx-3 sm:mx-6 md:mx-10 mt-2` (inconsistent)    | Same + rounded removal                               | Variable mx creates jagged breathing; no consistent 4-sided group margin | High |
| MasterCalendarPage              | MasterCalendarPage.tsx:246               | `ci-page-container h-full w-full flex flex-col`                                   | Same                                                  | Full-fill; timeline/boards touch glass perimeter (vs v2 calendar mock) | High |
| LibraryPage                     | LibraryPage.tsx:443                      | `h-full w-full ... bg-ci-bg flex flex-col` (bg override + fill)                  | Same                                                  | Custom bg + zero outer margin for list grid; contradicts glass contract | High |
| FormsPage                       | FormsPage.tsx:129 (identical to Library) | `h-full w-full ... bg-ci-bg flex flex-col`                                        | Same                                                  | Same as Library                                       | High |
| FrameworkPage                   | FrameworkPage.tsx:206                    | `h-full w-full ... p-6 md:p-8`; inner `max-w-[1600px] mx-auto`                    | Same                                                  | Internal p- provides partial (~24px) but root fill + bg-transparent breaks uniform glass frame | Medium-High |
| PolicyLifecyclePage             | PolicyLifecyclePage.tsx:246              | `h-full w-full flex flex-col ... bg-[#FAFBFC]`                                    | Same                                                  | Light bg fill; no glass framing of primary composition | High |
| GovernancePage                  | GovernancePage.tsx:23                    | `h-full w-full ... p-6 md:p-10`                                                   | Same                                                  | Internal padding only; still fills glass edge         | Medium |
| OnboardingV2Layout + BatchView  | OnboardingV2Layout.tsx:33; BatchViewPage.tsx:46 | `flex h-full min-h-[calc...]` + sub-rail + `grid grid-cols-12 h-full` + inner p-6 | Same                                                  | Special layout chrome fills glass; sub-panels have local padding but no uniform outer group margin from shell glass | High |
| CesLayout + all CES pages (Board, Dashboard, Calendar, Workloads, Reports, MyTasks) | CesLayout.tsx:48,138; CesBoardPage etc. | `w-full h-full flex flex-col`; inner `mx-auto max-w-[1440px] px-6 md:px-8 py-6` | Safe-area only on tab bar; content can hug           | Inner max-w + px helps but outer Ces div fills the parent ShellContentFrame glass (no breathing around the CES composition as a whole) | Medium-High |
| PolicyDetail / SharedPolicyDetailView / GVGBDetailView | PolicyDetailPage + Shared... + GVGBDetailView | Delegated views often full-width tables/cards inside glass with local max-w/p-   | Mobile detail sheets/scrolls near edges               | Detail glass or cards frequently lack 4-sided group margin | Medium |
| iAdministrator, PM pages, Journey sub-routes, Staffing, HelpCenter | Multiple (HubstaffStaging, Pm*, etc.) | Widespread `flex flex-col h-full` patterns                                       | Same                                                  | Fill behavior inherited from layout + App wrapper     | Medium |

**Partial / Better (Internal Padding Present but Root Fill Persists)**  
- Framework & Governance (p-6/8/10 on root div) — breathing exists internally but still violates "primary content composition must preserve 4-sided from shell frame."  
- Some detail cards use `max-w-[1100px]` etc. inside — local constraint, not page-view level.

**Fully Compliant Operational Surfaces**  
None observed among core single-card or multi-card operational pages. Exempted full-canvas tools (PrintPage, FormPrintView, SignaturePad in full mode) correctly bypass but are not documented as formal exceptions per spec §4.

**Mobile Safe-Area / Bezel Specifics**  
- Layout provides `pb-[calc(96px+env(safe-area-inset-bottom))]` and tab-bar padding only.  
- No consistent `env(safe-area-inset-left/right/top)` applied to page content. Content frequently approaches or touches the device frame on scrollable areas (exacerbated by `rounded-none` on ShellContentFrame for mobile).

### Evidence of "Post-Completion" State
Direct code inspection (2026-05-17) reproduces every citation in `Review_02_Analysis_PostCompletion_4Sided_Contract_Violations.md` §2 (Dashboard 413/463, Audit 322/327, Calendar 246, Library 443, Forms 129, Evidence 656/756, Framework 206, App 211, CommandCenterLayout 380/859, etc.). The "ball drop" between governance lock and surface execution remains unaddressed.

---

## Unique Insight from 4-Sided Border Lens

**The 4-sided contract is not an outer padding tax — it is the single mechanism that makes the entire glassmorphism investment legible.** When page roots fill or nest frames inside the shell-provided glass, the eye perceives either "glass against glass" (no perceptible blur/edge glow) or "content against glass edge" (the expensive Layer 1 surface ceases to read as a floating premium panel). The Top Picks and v2 mocks are unanimous: the *primary operational composition* (whether one card or a multi-card group) must itself sit inside a visible, continuous Layer 0 frame on all four sides. The current architecture delivers the outer frame reliably but then invites every surface to destroy the inner perceptual frame. Fixing the pages without touching the shell will instantly restore the canonical signature; continuing to treat the shell inset as "good enough" while pages hug the glass is the precise reason the rendered product still does not match the locked visual contract.

---

**End of Agent 02 Analysis Report**  
All claims are traceable to the listed files, lines, and image artifacts. No speculation beyond direct inspection.