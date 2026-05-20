# Agent 13: Accessibility, Keyboard, Focus & Contrast Analysis

**Subagent:** 13 — Accessibility, Keyboard, Focus & Contrast Specialist  
**Primary Lens:** WCAG 2.2 AA compliance, focus management, keyboard navigation, color contrast (light + dark + glass states), ARIA, screen-reader experience, glassmorphism-specific risks (blur, low-contrast edges, focus rings on translucent/animated backdrops).  
**Date:** 2026-05-17  
**Workspace:** C:\AI\Git\training\HomeHealth\Policies_and_Procedures  
**References Audited:**
- `design/ACCESSIBILITY_GUIDELINES.md` (glassmorphism section, contrast 4.5:1, 44px targets, reduced-motion, ARIA)
- `design/ACCESSIBILITY_COMPONENT_CHECKLIST.md` (per-component rules for buttons, cards, forms, modals, status, etc.)
- `Implementation/ACCESSIBILITY_GAP_LIST.md` (high-risk surfaces: FormViewer/Signing, CES Board, Evidence Hierarchy, Dashboard KPIs, Journey)
- All `*Accessibility_Validation_Report.md` (Dashboard, Evidence, Audit, Calendar, MyTasks — mostly templates with risk lists)
- `UIUX_ACCESSIBILITY_AUDIT.md` (2026-05-15 core findings)
- `UIUX_ACCESSIBILITY_AUDIT.md` + Phase docs, CANONICAL_UI_SYSTEM_SPEC.md, index.css tokens, Shell* primitives
- Live code: `src/index.css`, `src/policy/components/ui/*` (ShellFrame, ShellContentFrame, GlassPanel, DataGrid, Tabs, RightDrawer, BottomSheetDrawer, SignaturePad, CiStatusBadge, AriaLiveRegion), `src/policy/components/CommandCenterLayout.tsx`, `src/policy/components/Form*`, `src/components/TravelightBG.tsx`, major pages (DashboardPage, EvidenceCenterPage, CES boards, FormViewer, FormSigningWorkspace)

---

## Executive Summary — Unique A11y Lens Insight

The **premium CI-ION "one-glass" design** (single translucent maroon/teal glass canvas over an **animated TravelightBG canvas** of glowing streaks, enforced by a **4-sided constrained inset frame** on desktop via `--ci-glass-layer1-inset-desktop`) creates a visually striking "magnified glassmorphism" aesthetic. 

**Core A11y Risk Introduced by Glass Language (not present in flat designs):**  
Variable, time-varying contrast and edge definition caused by:
1. Semi-transparent glass (`rgba(66,8,8,0.30–0.78)`) + `backdrop-filter: blur(14–22px) saturate(...)` layered over **moving light streaks** (TravelightBG RAF canvas + CSS animations).
2. Hairline borders (`--ci-color-glass-border: rgba(255,255,255,0.06–0.18)`) that become imperceptible or low-contrast when streaks pass underneath or on light-mode remaps.
3. Focus rings (`2px solid gold/#C74601` + `box-shadow` halo) rendered on top of blurred, animated content — the ring itself can "swim" or lose definition due to blur softening pixel boundaries.
4. Text tokens (`--ci-text-on-surface-*` at 0.30–0.85 opacity whites) must fight both the glass tint + the dynamic backdrop luminance.

**The 4-sided frame's double-edged impact on reachability:**
- **Helps:** Provides 16–28px breathing room (clamp) around the rounded glass canvas. This prevents focus rings from being clipped at viewport edges and gives spatial "frame" consistency that aids keyboard users' mental model of tab order (content always lives inside predictable margins). On desktop it magnifies the premium effect without sacrificing minimal padding for 44px targets.
- **Hurts (or risks):** (a) The inset is applied unconditionally to the outer flex container; inner scroll containers (`[data-shell-scroll]`) and modals/drawers must explicitly account for it or risk focusable elements near edges having insufficient visual clearance or horizontal overflow on focus. (b) On narrow viewports the clamp still applies small padding, but mobile drawers bypass it — inconsistency can confuse tab order expectations. (c) If any `overflow: hidden` on ShellContentFrame clips outlines (currently `overflow-y-auto` on scrollable variant), keyboard focus can visually disappear at scroll boundaries.

**Overall Compliance State:** Partial WCAG 2.2 AA. Strong foundation in tokens (focus rings, reduced-motion CSS skeleton, semantic Shell `<main>` + nav, proper tab roles in `Tabs`, `CiStatusBadge` + text, `AriaLiveRegion` primitive, 44px nav targets). **High-risk functional gaps remain** (no focus traps in any dialog/drawer — explicitly noted as "future A11Y-006", incomplete roving tabindex adoption outside PolicyLinkSelector, sparse live-region usage, DataGrid lacks keyboard/ARIA row nav, FormViewer/Signing has dynamic labeling risks from prior audits, TravelightBG ignores `prefers-reduced-motion`). 

**Glass amplifies every gap:** A missing `aria-label` on an icon button is worse when the button sits on a low-contrast blurred glass edge. A focusable card without visible ring is invisible over animated streaks.

**Live surfaces audited (via code inspection + cross-reference to validation reports/gaps):** Command Center/Dashboard (KPI cards, boards), Evidence Center (capture + hierarchy), CES/MyTasks boards & execution, FormViewer + FormSigningWorkspace + SignaturePad (highest legal risk), Policy Detail/GVGB, Onboarding V2, Calendar, Audit Mode, Shell primitives, drawers/modals, Journey remnants.

No surface currently meets "Phase-complete" gates per the validation report templates (no published clean axe + manual SR + reduced-motion + glass-contrast evidence bundles).

---

## 1. Color & Contrast Audit (Light / Dark / Glass States)

**Guidelines (ACCESSIBILITY_GUIDELINES.md):** 4.5:1 normal text, 3:1 large; 7:1 preferred light body; never color-alone; status (teal/orange/red) must pass on backgrounds. Glass: "text remains readable over glass panels... maintain sufficient contrast even when glass layers overlap."

**Live Implementation Strengths:**
- Dedicated glass text tokens in `src/index.css`:
  - Dark (CI-ION): `--ci-text-on-surface-strong: rgba(255,255,255,0.85)`, soft 0.65, muted 0.55, faint 0.40 — calibrated for the ~33% maroon glass.
  - Light (Care Indeed): Full remap cascade (hundreds of lines) converts `bg-white/`, `text-white/`, `border-white/` → solid enterprise surfaces (`#FFFFFF`, `#E5E4E3` borders, dark text). `.glass-*` utilities forced to solid white + hairline. Blur explicitly `none`.
  - `--ci-color-glass-main` and overlay tints (`--ci-overlay-faint` etc.) centralized.
- `CiStatusBadge` + icon+text pattern used in Dashboard (KPI trends), CES cards.
- Focus ring tokens (`--ci-focus-ring`) and explicit `*:focus-visible` rules with gold (dark) / #C74601 orange (light) + 4px halo — high visibility even on glass.
- `--ci-dimension-touch-target-min: 44px` token + `.ci-touch-target`, 44px nav rail icons (`.ci-shell-nav-icon-btn`).

**Failures & Risks (Glass + Textured Backdrop Specific):**
- **Animated Backdrop Amplifies Contrast Variability:** TravelightBG draws moving semi-opaque glowing streaks (opacity ~0.077, speed variants) on deep maroon. Under 0.30–0.78 glass + blur, local luminance shifts continuously. Small text (10px uppercase in headers, 9–11px in FormSigning tables/badges per UIUX_ACCESSIBILITY_AUDIT.md) and faint metadata (`0.40` opacity) drop below 4.5:1 in some streak positions/angles. No per-frame contrast testing exists.
- **Hairline/Edge Contrast:** `--ci-color-glass-border: rgba(255,255,255,0.09)` (dark) or `#E5E4E3` (light remap) is often too subtle against the gradient glass + moving content. "Low-contrast edges" exactly as flagged in task lens.
- **Blur Softens Readability:** `backdrop-filter: blur(14–22px)` on ShellContentFrame and `.ci-glass-panel` (dark/CI modes) softens glyph edges. Combined with animated BG, body text can appear "frosted." Light mode correctly disables this.
- **Mixed Theme / Legacy Hardcodes:** Some pages (GVGB/SharedPolicyDetailView, FormViewer inputs) still have hardcoded colors (`#1F1C1B`, gray-700 on gray-50, eCign NAVY/ORANGE on paper) that fail on glass remaps. Legacy StatusBadge (pre-CiStatusBadge) dark-assuming.
- **Small Targets + Contrast:** Form inputs in signing (border-b-2 with low-opacity colors), badges, table cells (DataGrid padding 10–12px but font 10–13px) frequently violate on glass.
- **Evidence from Reports:** UIUX_ACCESSIBILITY_AUDIT.md explicitly calls out "mixed theme (shell dark glass vs light policy detail)", "small text (9px... in FormSigning tables, badges) fails", "GVGB/Shared hardcoded". ACCESSIBILITY_GAP_LIST and Dashboard/Evidence validation reports list "insufficient contrast in light mode on some cards", "color-only status".

**Touch Targets:** General buttons min-height 36px (index.css line ~367); only specific classes (nav, `.ci-btn--lg`) hit 44px. Mobile coarse-pointer rule exists but insufficient. Dashboard cards and table actions frequently <44px. Violates checklist and guidelines.

**4-Sided Frame Interaction:** The `padding: var(--ci-glass-layer1-inset-desktop)` on ShellFrame + rounded glass inside gives visual margin, but does not automatically enlarge interactive targets near frame edges. Focusable elements flush to inner glass border can still be cramped.

---

## 2. Keyboard Navigation, Focus Management & Tab Order

**Guidelines:** Visible teal/gold ring, logical tab order, no traps, all functionality reachable, Escape for modals.

**Live Strengths:**
- Global `*:focus-visible` + button/input overrides with outline + halo (theme-aware gold/orange). Rings visible on glass-interactive and cards (Dashboard KPI/board cards explicitly add `focus-visible:ring-2 focus-visible:ring-orange-400/60`).
- `<main data-shell-main>`, proper `<nav>` semantics in ShellNavRail/CommandCenterLayout (roles on menus, aria-labels on account/theme toggles).
- `Tabs` primitive: `role=tablist` + `role=tab` + `aria-selected`. Good base.
- `useRovingTabIndex` hook implemented (horizontal/vertical, home/end, loop) — used in PolicyLinkSelector.
- Shell drawers: Escape handler, `role="dialog" aria-modal`, `aria-label`.
- FormSigningWorkspace: Some aria-required scanning, labels, role=dialog on workspace.
- SignaturePad: Canvas has `role="img" aria-label`, undo/clear have `aria-label`.

**Critical Gaps (All Surfaces):**
- **No Focus Traps Anywhere (Systemic):** RightDrawer, BottomSheetDrawer, ModalShell, FormSigningWorkspace dialog, WorkflowExecutionPanel dialogs, SprintTaskPanel, etc. all declare `aria-modal` but comments explicitly state "deliberately does NOT introduce a full focus trap. A trap helper is a separate ticket (continuation A11Y-006)". Keyboard users can tab out into background content. Direct violation of checklist ("Focus is trapped inside when open") and guidelines ("No keyboard traps").
- **Incomplete Roving / Arrow Key Navigation:** Tabs do not use the roving hook (still click-only). DataGrid rows/cells not focusable/keyboard navigable. CES Kanban/board cards rely on generic focus-visible but no arrow-key roving between cards or columns. Evidence hierarchy trees lack tree roles + keyboard nav. Journey carousel remnants fragile.
- **Tab Order / Logical Issues:** Dynamic FormViewer sections (conditional OrgChart, multi-signer) produce uncontrolled inputs with poor tab sequence. Dense tables in reports/audit lack row navigation. 4-sided frame padding can make first/last focusables feel offset from visual edges.
- **Icon-Only Buttons:** Widespread (nav toggles, table actions, signing tools, CES, iAdmin CommandBar, help bulbs). Many pair `aria-hidden` SVG with parent `aria-label` (good in CommandCenterLayout, drawers), but not universal. Dashboard more actions, filter buttons, etc. risk unlabeled.
- **Form Signing (Highest Risk per GAP_LIST + UIUX_AUDIT):** Multi-signer flows, signature canvas (inherently pointer-only; no keyboard fallback beyond external devices), review steps. Prior deep audits flagged "limited keyboard in dynamic forms, labeling gaps in multi-signer".
- **Modals/Drawers Return Focus:** No `returnFocus` or trigger-element ref tracking implemented.
- **4-Sided Frame Specific:** The outer padding container + inner rounded glass means focus rings on content near the visual "frame edge" have good clearance, but if a drawer or full-bleed element inside ShellContentFrame uses `position: fixed` or negative margins, rings can be clipped or tab order jumps the gutter unexpectedly.

**Evidence:** UIUX_ACCESSIBILITY_AUDIT.md: "FormViewer/FormSigningWorkspace: ... dialog focus trap not always robust", "CES boards/kanban + ... Tab order through cards", "Dense tables ... Column headers, row navigation", "Modals/Drawers ... Focus trap, return focus", "Journey ... breaks tab order". Validation reports require "Full keyboard access to KPI actions, board cards", "arrow-key navigation" for audit checklists.

---

## 3. ARIA, Labels, Live Regions, Screen Reader Experience

**Strengths:**
- `AriaLiveRegion` canonical primitive (polite/assertive, atomic, sr-only) — properly documented.
- Some usage (`aria-live` inline in CommandCenterLayout status, FormSigning error handling, SharedPolicyDetailView).
- Good labeling on nav, account menu, theme toggle, SignaturePad actions, drawers.
- Semantic tables via DataGrid (th/td), headings in many places.
- `role="status"` on some banners.

**Gaps:**
- **Live Region Adoption Low:** Most dynamic updates (KPI refreshes, task status changes on CES board, evidence attach, signing complete, gate evaluations, form saves) use direct DOM mutations or toasts without `aria-live` or the primitive. Validation reports explicitly require "Live regions for dynamic KPI/board updates", "Scoring updates must be announced".
- **Evidence Hierarchy / Trees:** No `role=tree` / `aria-expanded` / keyboard tree nav (GAP_LIST high-risk).
- **Form Fields (FormViewer + dynamic sections):** Labeling via `aria-labelledby` or explicit `<label for>` incomplete for generated/conditional fields. Uncontrolled inputs flagged in prior audits.
- **Status / Errors:** Many use color + icon but lack `role=alert` + `aria-describedby`. Error messaging in signing relies on banners without robust announcement.
- **Empty/Loading States:** `EmptyState` / `LoadingState` primitives exist but adoption + SR announcements vary.
- **Icon + Image Alt:** Decorative SVGs correctly `aria-hidden`, but some informational icons or logomarks in TravelightBG / on-glass lack context.
- **Tables (DataGrid consumers):** No `aria-sort`, no caption/summary for complex boards, no keyboard selection model.

**SR Testing:** No published VoiceOver/TalkBack transcripts in the validation reports (they are planning templates). High-risk flows (eCign signing, evidence capture, CES execution, onboarding gates) unverified in current live code.

---

## 4. Motion & Reduced-Motion

**Guidelines:** Respect `prefers-reduced-motion`, static alternatives, no flashing.

**Live:**
- Global CSS rule (`@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation/transition-duration: 0.01ms !important; } }`) — kills most Tailwind/Framer transitions.
- FLAT design rules in light mode further suppress lifts.

**Glass/Motion Specific Failures:**
- **TravelightBG.tsx ignores reduced-motion entirely.** RAF animation loop + streak spawning always runs. CSS `animation: tlRotate 350s ...` and `tlFloat` on logo elements in light/dark variants continue. Global duration hack may throttle but does not stop canvas drawing or will-change transforms. Vestibular risk + contrast flicker over glass.
- Spinners, custom keyframes (gvgb-enter, demo-view), hover lifts on glass-interactive still present in code paths (some disabled by flat rules but not all).
- SignaturePad stroke animations / undo feedback not reduced-motion guarded.
- Validation reports + UIUX_AUDIT flag "StagingM01 complex transforms + auto-play", "loading spinners everywhere", "hover lifts".

**Result:** Glass aesthetic (blur + moving light under it) directly conflicts with motion sensitivity unless the backdrop is fully static-ized.

---

## 5. Form / Signing / Evidence / High-Risk Surfaces (Checklist Compliance)

**FormViewer / FormSigningWorkspace / SignaturePad (from GAP_LIST #1, UIUX_AUDIT deep dive):**
- Partial labels, some aria-required scanning in signing workspace.
- Canvas signature: 320px min height good (Lead 16 C5), aria on canvas + buttons, but no keyboard drawing path (acceptable if documented external device support + review step exists).
- Multi-signer review, conditional sections: dynamic DOM risks for SR and tab order.
- **Violates:** Checklist items for Form Field (label association, error messaging), Signature (keyboard alternative), Status (live announcements).

**CES Board / Kanban / MyTasks / Execution Panels:**
- Card focusable with rings in places (Dashboard example).
- Status via badges (good).
- **Violates:** Dense table/kanban keyboard (no roving), color reliance without badge in legacy spots, touch targets, live regions for updates, tree-like evidence if nested.

**Evidence Center (PhotoEvidenceCapture, lists, review):**
- Capture components (SignaturePad + photo) have some ARIA.
- Hierarchy: complex nested lists lack proper roles.
- **Violates per Evidence_Accessibility_Validation_Report:** "PhotoEvidenceCapture and SignaturePad must expose proper ARIA... Evidence lists must use semantic... or DataGrid with proper keyboard handling."

**Dashboard KPIs / Boards (reference surface):**
- Good use of focus rings on cards, some aria-labels.
- **Risks per Dashboard report:** Color-only (mitigated by CiStatusBadge in new code?), heading hierarchy, live regions, touch targets on actions.

**Other Primitives (per CHECKLIST):**
- Buttons: Visible focus yes, but size + disabled state communication mixed.
- Cards: Interactive ones have cursor + rings but not always explicit `role=button` or keyboard activation beyond click.
- Modals: aria-modal yes, trap + return focus no.
- Navigation: Good labels in shell, active states via color + ? (needs non-color indicator).

**Shell / Glass Primitives (4-sided frame central):**
- ShellFrame / ShellContentFrame / GlassPanel: Proper glass tokens, but no inherent a11y (they are containers). Backdrop blur only in dark.
- 4-sided helps visual separation but requires all children to inherit logical focus flow inside the padded rounded region.

---

## 6. Automated / Testing Gaps

- Tooling exists: `@axe-core/playwright`, Lighthouse target ≥95 in validation templates.
- No evidence of running gates in CI or per-surface reports (validation reports are aspirational templates, not executed outputs).
- Manual SR + keyboard + 200% zoom + high-contrast + reduced-motion + real-device glass contrast not documented as passed for any surface.
- No glass-specific contrast matrix (text tokens measured over actual rendered Travelight + glass + blur combinations).

---

## 7. 4-Sided Frame Reachability Verdict (Unique Lens)

**Positive:** The constrained inset + rounded glass creates a "porthole" effect that naturally contains focus rings and prevents them from bleeding into the raw animated backdrop or viewport chrome. This improves perceived focus visibility on glass. Consistent margins aid orientation for screen reader + keyboard users navigating the premium surface.

**Negative / Risk:** 
- Padding is layout-only; interactive density near the inner radius can still violate 44px if not padded internally.
- Drawers and modals that slide over/inside the frame must re-establish focus context or risk "jumping the gutter".
- On resize or orientation change, the dynamic clamp can shift tab stops unexpectedly without `ResizeObserver` + focus restoration.
- Mobile (where frame padding is minimal) vs desktop creates divergent tab orders for the same route.

**Recommendation embedded in plan:** Treat the frame as an a11y contract — document required padding for focusable descendants, add frame-aware focus utilities.

---

## 8. Violations Summary vs. Checklists & GAP_LIST

- **General (all components):** Touch target 44px not universal; reduced-motion not respected by TravelightBG + glass effects; some missing ARIA.
- **High-Risk Surfaces (GAP_LIST):** All still open (Form Signing, CES, Evidence, Dashboard, Journey). Validation reports exist as templates only — no closure evidence.
- **Glass New Risks:** Not explicitly called out in 2026-05 design docs beyond "ensure readable"; live implementation exposes animated backdrop + blur as unmitigated variables.
- **Focus/Keyboard:** Traps missing everywhere; roving partial.
- **Robust:** Landmarks good at shell; live regions & tree roles weak.

**Current State:** No surface can be considered Phase-complete under the "automated + manual test gates" required by the validation report templates and CANONICAL spec.

---

## Appendix: Key File Paths (Absolute)

- Design refs: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\design\ACCESSIBILITY_GUIDELINES.md`, `ACCESSIBILITY_COMPONENT_CHECKLIST.md`
- Gaps & Reports: `...\Implementation\ACCESSIBILITY_GAP_LIST.md`, `Dashboard_Accessibility_Validation_Report.md`, `Evidence_...`, `Audit_...`, `Calendar_...`, `MyTasks_...`, `UIUX_ACCESSIBILITY_AUDIT.md`
- Live CSS/Shell/Glass: `src/index.css` (focus rules ~650, glass tokens ~910, reduced-motion ~662, light remaps ~2300+, Travelight interaction), `src/policy/components/ui/ShellFrame.tsx`, `ShellContentFrame.tsx`, `GlassPanel.tsx`, `RightDrawer.tsx`, `DataGrid.tsx`, `Tabs.tsx`
- Backdrop: `src/components/TravelightBG.tsx`
- High-risk: `src/policy/components/FormSigningWorkspace.tsx`, `FormViewer.tsx`, `ui/SignaturePad.tsx`, `CommandCenterLayout.tsx`, DashboardPage.tsx, CES board components
- Hook: `src/policy/hooks/useRovingTabIndex.ts`
- Primitive: `src/policy/components/ui/AriaLiveRegion.tsx`

**End of Analysis.** Next deliverable: the 4-Phase Plan with dedicated hardening wave.

---
*Agent 13 A11y Lens: Glassmorphism is beautiful but turns every contrast, focus, and motion decision into a perceptual calculation over a dynamic textured layer. The 4-sided frame is the guardrail that makes it tenable for keyboard users — if we harden it explicitly.*