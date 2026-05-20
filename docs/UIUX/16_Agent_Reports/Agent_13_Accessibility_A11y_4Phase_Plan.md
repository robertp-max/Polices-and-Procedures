# Agent 13: Accessibility A11y 4-Phase Hardening Plan

**Subagent:** 13 — Accessibility, Keyboard, Focus & Contrast Specialist  
**Date:** 2026-05-17  
**Core Directive:** A dedicated **A11y Hardening Wave** (cannot be last). Every surface must pass automated + manual test gates **before** it is considered Phase-complete. Glass-specific concerns (blur readability, animated TravelightBG contrast variance, focus rings on glass, low-contrast hairlines/edges, reduced-motion for backdrop + blur) are called out explicitly in every phase. The 4-sided frame contract is treated as an accessibility primitive.

**Philosophy (from ACCESSIBILITY_GUIDELINES.md + CHECKLIST):** Accessibility is non-negotiable for a regulated compliance platform. Glassmorphism must not introduce new barriers; the premium aesthetic is secondary to perceivable, operable, understandable, robust experiences for clinicians, surveyors, and administrators.

**Alignment:** Closes all items in `ACCESSIBILITY_GAP_LIST.md`, satisfies the per-surface `*_Accessibility_Validation_Report.md` templates (Dashboard as reference), enforces `ACCESSIBILITY_COMPONENT_CHECKLIST.md` on every primitive and surface, and adds glass/4-sided specific gates missing from prior plans.

---

## Phase Structure Overview

| Phase | Name | Focus | A11y Hardening Role | Gate Before Exit | Glass/Frame Explicit |
|-------|------|-------|---------------------|------------------|----------------------|
| 1 | Token & Shell Foundation Hardening | Contrast tokens, focus ring system, reduced-motion contract, 4-sided frame a11y spec | **Preparation** | All tokens pass glass contrast matrix + reduced-motion tests | Yes — define glass states, static backdrop mode |
| 2 | Canonical Primitive Hardening | All `ui/` + shell components pass full checklist | **Foundation** | Every primitive has axe-clean + manual keyboard/SR evidence | Yes — focus rings on glass, drawer trap baseline, blur opt-out |
| 3 | **Dedicated A11y Hardening Wave** (NOT LAST) | Systemic fixes: focus traps, roving adoption, live regions, Travelight static, glass contrast remediation, form labeling, DataGrid keyboard | **THE WAVE** | Full regression on shell + 2 priority surfaces (Dashboard + Signing) with glass-specific manual tests | **Primary** — all glass risks closed here |
| 4 | Surface-by-Surface Execution + Permanent Gates | Reconstruct/audit every high-risk surface (FormSigning, CES, Evidence, etc.) with gates | **Closure & Automation** | Each surface produces signed Validation Report + axe/SR/keyboard/contrast/reduced-motion bundle before any "Phase-complete" claim | Enforcement — 4-sided frame verified per surface |

**Rule:** No surface may claim "Phase X complete" (per Phase3_Exit_Criteria_Checklist.md or equivalent) until its dedicated accessibility validation report + evidence bundle is approved by A11y Lead. Phase 3 Wave must be substantially complete before Phase 4 surfaces begin final sign-off.

---

## Phase 1: Token & Shell Foundation Hardening (Preparation)

**Goal:** Make the design system incapable of producing low-contrast or motion-unsafe glass surfaces. Fix the 4-sided frame as an explicit a11y contract.

**Deliverables:**
1. **Glass Contrast Matrix (new artifact)**
   - Measure WCAG ratios for all `--ci-text-on-surface-*`, `--ci-overlay-*`, status tones, focus halos against:
     - Dark glass + TravelightBG (multiple streak positions / luminance samples)
     - Dark glass + static fallback
     - Light solid glass (remapped)
     - Glass + blur on / off
   - Tooling: Playwright + canvas snapshot + color contrast library (or manual + Colour Contrast Analyser). Target: all ≥4.5:1 (body), 3:1 (large), 7:1 preferred light.
   - Update `--ci-text-on-surface-faint` etc. or add stronger variants if needed. Add `--ci-glass-focus-ring` token with higher opacity/offset for blur.

2. **Focus Ring Hardening for Glass**
   - Enhance global `*:focus-visible` rules:
     - Minimum 3px outline + 4–6px offset (to survive blur softening).
     - Optional inner solid ring or background tint behind ring when on glass (`[data-shell-main] :focus-visible`).
     - Theme-aware stronger halo on dark glass.
   - Add `.glass-focus-ring` utility class for manual use on interactive glass cards.
   - Ensure rings never clipped by `overflow-hidden` on ShellContentFrame or rounded glass (use `outline-offset` + padding buffer).

3. **Reduced-Motion Contract Enforcement (Glass-Specific)**
   - Modify `TravelightBG.tsx`:
     - Detect `prefers-reduced-motion: reduce` (via `matchMedia` + listener).
     - When reduced: stop RAF, render static subtle gradient or single low-opacity streak set (no movement). Expose `static` prop or data attr for testing.
     - Kill or freeze all `tlRotate` / `tlFloat` CSS animations under the media query or via JS.
   - In `index.css` and ShellContentFrame: when reduced-motion, force `--ci-color-glass-blur: none` (or very light) to eliminate softening.
   - Add `data-reduced-motion` to `<html>` and gate all glass hover lifts / keyframe enters.
   - Document: "Glass aesthetic degrades gracefully to static elegant panel under reduced motion."

4. **4-Sided Frame A11y Contract**
   - Formal spec in `ShellFrame.tsx` / new `FRAME_ACCESSIBILITY_CONTRACT.md`:
     - Minimum inset guarantees 8px clearance beyond focus ring offset.
     - All scrollable descendants must preserve logical tab order without gutter jumps.
     - Drawers/modals that break the frame must restore focus to trigger and document the exception.
     - Mobile vs desktop parity table (mobile uses minimal padding; drawers full-bleed OK).
   - Add `data-frame-inset` attribute + CSS var guard so components can query effective padding.
   - Verify no `position:fixed` children inside content frame steal focus without accounting for the visual frame.

5. **Token & CSS Audit**
   - Remove or remap any remaining hardcoded low-contrast values in FormViewer, GVGB, etc. via the existing light-mode cascade pattern.
   - Enforce `--ci-dimension-touch-target-min: 44px` on all `button, [role=button], a, input, .glass-interactive, .ci-btn` (raise from 36px baseline; use media query or pointer:coarse for mobile).
   - Add `.ci-touch-target` enforcement utility and linter rule (or ESLint jsx-a11y).

**Automated + Manual Gates for Phase 1 Exit:**
- Axe + Lighthouse on ShellFrame + empty Dashboard shell in light/dark + reduced-motion.
- Manual: Keyboard tab through shell (nav, theme toggle, account menu) with visible rings on glass.
- Reduced-motion test (OS setting + devtools emulation): Travelight fully static, no blur softening, no spinning loaders.
- Glass contrast matrix report (signed by A11y Lead) showing pass on representative streak positions.
- 4-sided frame visual + keyboard test on 1024px–1920px viewports + mobile emulation.

**Glass/Frame Callout:** Phase 1 directly neutralizes the "animated textured backdrop + blur" root cause of variable contrast and motion risk.

---

## Phase 2: Canonical Primitive Hardening (Foundation)

**Goal:** Every component in `src/policy/components/ui/` and shell primitives fully satisfies `ACCESSIBILITY_COMPONENT_CHECKLIST.md` + guidelines. No new surface can be built on broken primitives.

**Deliverables (per primitive + consumers):**
- **Shell Primitives (ShellFrame, ShellContentFrame, GlassPanel, CommandCenterLayout):**
  - Landmarks verified (`<main>`, nav, header, complementary).
  - Focus management at frame boundaries.
  - Glass backdrop blur opt-in only when safe (reduced-motion + contrast OK).

- **Interactive Primitives:**
  - `Tabs`: Adopt `useRovingTabIndex` (horizontal) + arrow keys + Home/End. Update all consumers (Dashboard filters, CES, Policy detail, etc.).
  - `DataGrid`: Add optional `keyboardNav`, `selectableRows`, ARIA (`aria-multiselectable`, columnheader roles, `aria-sort`). Provide roving or cell navigation model. All existing table usages upgraded or wrapped.
  - `RightDrawer` / `BottomSheetDrawer` / `ShellMobileDrawer` / `ModalShell`: **Implement baseline focus trap** (manual trap or lightweight hook; return focus to trigger). Add `initialFocusRef`. Document as MVP-A11Y-006 completion.
  - `SignaturePad`: Keyboard instructions + focusable controls around canvas; `aria-describedby` for "draw with mouse or stylus; external keyboard tablets supported".
  - `CiStatusBadge`, `EmptyState`, `LoadingState`, `PageHeader`, `SearchField`, `UtilityButton`, `ActionButton`, `SectionHeader`: Full checklist pass (labels, focus, contrast, reduced-motion, 44px where interactive).
  - `AriaLiveRegion`: Full adoption campaign — replace all raw `aria-live` with primitive. Add to KPI updates, status changes, form saves, board mutations.

- **Form & Signing Primitives:**
  - `FormViewer`, inputs in dynamic sections: Enforce controlled components + explicit `<label for>` or `aria-labelledby` associations. Error states with `role=alert` + `aria-describedby`.
  - Add `useFormA11y` helper if needed.

- **Checklist Enforcement:**
  - Create executable checklist (Markdown + or automated via storybook/playwright tags).
  - All primitives must pass before any Phase 3/4 surface work.

**Glass-Specific in Phase 2:**
- All glass-interactive elements (`.glass-interactive`, cards on ShellContentFrame) must demonstrate focus ring visibility in both blur-on (dark) and solid (light) states.
- Add glass-specific stories/tests for contrast under Travelight (or static fallback).

**Automated + Manual Gates for Phase 2 Exit (Primitives Gate):**
- Full axe-core scan (desktop + mobile) on a "Primitive Gallery" page or isolated stories covering every ui/ export — zero critical/serious.
- Manual keyboard-only navigation of every primitive in isolation (light + dark + reduced-motion).
- Screen reader (VoiceOver + NVDA) transcript for Tabs (roving), Drawers (trap + return + Escape), DataGrid (if keyboard), SignaturePad, LiveRegion announcements.
- Touch target measurement report (44px minimum on all interactive).
- Signed "Primitives Pass `ACCESSIBILITY_COMPONENT_CHECKLIST.md`" matrix.
- Glass focus ring screenshots on actual rendered glass + animated vs static backdrop.

**Rule:** No surface reconstruction may begin in Phase 4 until Phase 2 primitives gate is green. This prevents re-introducing gaps.

---

## Phase 3: Dedicated A11y Hardening Wave (The Core Wave — NOT LAST)

**Goal (Cannot be last):** Systemic remediation of all high-severity functional and glass-perceptual gaps before surface-by-surface work locks in the design. This is the "a11y hardening" that prior plans deferred.

**Explicit Scope (from GAP_LIST + UIUX_AUDIT + this analysis):**
1. **Focus Trap Rollout (A11Y-006)**
   - Implement reusable `useFocusTrap` (or adopt tiny library) across **all** current and future dialogs: RightDrawer, BottomSheetDrawer, FormSigningWorkspace, WorkflowExecutionPanel, ModalShell, SprintTaskPanel, Help modals, BradHelpCenter, etc.
   - Test: Tab cycles only inside; Escape closes + returns focus; Shift+Tab works; no escape hatch to background.

2. **Roving TabIndex & Keyboard Navigation Wave**
   - Apply `useRovingTabIndex` to all tab strips, segmented controls, board card lists (CES Kanban horizontal/vertical), evidence tree (new tree-roving), audit checklists, PolicyLinkSelector (already partial).
   - DataGrid keyboard model (row focus + activation).
   - Arrow-key navigation patterns documented in `KEYBOARD_PATTERNS.md`.

3. **Live Region & Status Announcement Hardening**
   - Mandate `AriaLiveRegion` (or direct primitive) for:
     - Dashboard KPI / board count / alert changes
     - CES task status / phase / urgency updates
     - Evidence attach / capture complete / review actions
     - Signing step progress / multi-signer state / errors
     - Form save / validation / gate results
     - Onboarding gate / batch progress
   - Add `role=alert` for critical errors.

4. **Glass + Backdrop + Motion Remediation (Glass Lens Core)**
   - TravelightBG static mode complete + tested (Phase 1 carry-over).
   - Glass contrast matrix findings implemented (opacity boosts, text weight increases, or additional glass tint layer for low-luminance streaks).
   - Hairline borders strengthened on glass (`--ci-color-glass-border` or per-surface stronger variant) or paired with subtle inset shadow for definition.
   - Focus ring + glass: double-ring or solid pill background behind ring when on `[data-shell-main]`.
   - Blur graceful degradation documented and enforced.
   - 4-sided frame: Add focus-visible padding guard and resize/focus restoration utilities. Audit all surfaces for frame-clipping.

5. **Form / Signing / Dynamic Content Labeling**
   - Full audit + fix of FormViewer + FormSigningWorkspace: controlled inputs, explicit labels for every field (including generated), multi-signer ARIA, review-before-sign step SR-friendly.
   - SignaturePad: clearer instructions + alternative input note.

6. **Touch Target & Icon Labeling Sweep**
   - Global enforcement + fixes for 44px on all actionable elements (tables, badges, small CTAs in boards, signing tools).
   - aria-label audit on every icon-only (use grep + manual review).

7. **High-Risk Surface Mini-Audits (Preparation for Phase 4)**
   - Produce draft updated `ACCESSIBILITY_GAP_LIST.md` closure + preliminary Validation Reports for Dashboard (reference), Evidence, Signing, CES Board.

**Glass-Specific Explicit Items in Wave:**
- "Does the blur + streak combination ever drop any live text below 4.5:1?" — answer with data + fixes.
- "Can a keyboard user always see exactly where focus is on the glass canvas even while lights travel underneath?"
- "Under reduced-motion, does the glass surface remain premium yet perfectly static and high-contrast?"

**Automated + Manual Test Gates for Phase 3 Exit (Wave Gate — Blocking):**
- **Automated:** 
  - Axe + Lighthouse ≥95 on full CommandCenter shell + Dashboard + Evidence + Signing workspace (light + dark + reduced-motion + 200% zoom).
  - Playwright a11y test suite (new or expanded) that runs on every PR for shell + these 3 surfaces.
- **Manual (documented evidence required):**
  - Full keyboard walkthrough (tab, arrows, Escape, Enter, Space) of all major flows — no traps, logical order, visible rings on glass.
  - Screen reader sessions (VoiceOver macOS + TalkBack Android or emulator): transcripts/summaries for signing flow, CES board task move/status change, evidence tree navigation, dashboard updates, drawer open/close.
  - Reduced-motion + glass: Verify static backdrop, no motion, readable text, functional focus.
  - Contrast spot-checks on live glass (multiple scroll positions / streak phases) using tools.
  - 4-sided frame test: Focus never clipped, tab order matches visual hierarchy inside frame, mobile parity acceptable.
  - High-contrast mode (Windows) + Windows high-contrast theme test.
- Signed "A11y Hardening Wave Complete" memo from A11y Lead + at least one other reviewer. This memo is prerequisite for Phase 4 surface final sign-offs.

**Why Not Last:** Performing the Wave after surface work would require expensive retrofits on every reconstructed surface. Hardening the system first (tokens → primitives → systemic behaviors) makes subsequent surface work cheap and correct-by-construction.

---

## Phase 4: Surface-by-Surface Execution + Permanent Gates (Closure & Automation)

**Goal:** Rebuild/audit every surface using hardened primitives and Wave fixes. Each surface exits only after producing its Validation Report with evidence.

**Process per Surface (Dashboard reference, then Evidence, Audit, Calendar, MyTasks, CES Board/Kanban, FormSigningWorkspace, Policy Detail/GVGB, Onboarding V2, Journey remnants, etc.):**
1. Use Phase 2 primitives + Phase 3 behaviors.
2. Close relevant rows in updated `ACCESSIBILITY_GAP_LIST.md`.
3. Execute the exact protocol in its `*_Accessibility_Validation_Report.md` (Perceivable/Operable/Understandable/Robust tables + specific implementation requirements).
4. **Mandatory Evidence Bundle** (before "Phase-complete" or sign-off):
   - Clean axe report (desktop + mobile views).
   - Lighthouse Accessibility score + screenshot.
   - Manual keyboard navigation video or annotated screenshots (focus rings visible on glass).
   - Screen reader summary / transcript (key flows).
   - Glass-specific contrast + reduced-motion test notes.
   - 4-sided frame / responsive touch target verification.
   - 200% zoom + high-contrast pass.
   - Signed approval by Surface Owner + A11y Lead.
5. Update `Implementation/ACCESSIBILITY_GAP_LIST.md` status to Closed/Waived (with rationale).

**Permanent CI Gates (introduced in Phase 4, live forever):**
- Playwright + `@axe-core/playwright` on critical routes (Dashboard, Signing, Evidence, CES, Onboarding) — fail build on serious violations.
- Lighthouse CI or equivalent in deploy pipeline.
- New surfaces must include a stub Validation Report + checklist pass before merge.
- Quarterly full-app a11y regression (including glass contrast matrix re-run).

**Glass/4-Sided Enforcement in Phase 4:**
- Every surface Validation Report must contain a dedicated "Glass + Frame" subsection with the Phase 1 matrix results + live verification.
- 4-sided frame must not cause tab order or focus visibility regressions on that surface.

**Exit Criteria for Overall Project:**
- All GAP_LIST items closed.
- All high-risk surfaces have approved Validation Reports with evidence.
- Phase 3 Wave memo + Phase 2 primitives gate green.
- Automation (axe in CI) + documented manual test process running.
- No new code introduces glass a11y regressions (enforced by tokens + primitives).

---

## Integration with Existing Plans & Risk Mitigation

- **Feeds into:** `Phase3_Exit_Criteria_Checklist.md`, `Phase4_Implementation_Spec.md`, `MASTER_UIUX_IMPLEMENTATION.md`, `CANONICAL_UI_SYSTEM_SPEC.md` Section 18 (A11y), `Responsive_Accessibility_Validation_Plan_Shell.md`.
- **Updates Required:** `ACCESSIBILITY_GAP_LIST.md` (add glass/Travelight/4-sided rows + Wave closure), all Validation Reports (add glass subsection), `UIUX_ACCESSIBILITY_AUDIT.md` (reference this plan).
- **Risks & Mitigations:**
  - Scope creep on signing (legal): Prioritize in Wave + Phase 4 early.
  - Glass aesthetic pushback: Phase 1/3 provide graceful static + high-contrast fallbacks that still look premium.
  - Test capacity: Pair A11y Lead with one dev per surface for manual SR/keyboard; automate what can be.
  - 4-sided frame changes: Any token tweak requires re-running frame a11y contract tests.

---

## Success Metrics (Measurable)

- 0 critical/serious axe violations on production surfaces.
- 100% of interactive elements ≥44px touch target (measured).
- All dialogs have working focus trap + return focus.
- Reduced-motion: Travelight static, blur off or minimal, zero unintended motion.
- Glass contrast: 100% of text tokens pass matrix on live rendered glass (documented).
- Every surface has signed Validation Report before Phase exit.
- Keyboard-only users can complete core flows (signing, evidence capture, task execution, dashboard nav) without assistance.

---

## Recommended Immediate Next Actions (Post Plan Approval)

1. A11y Lead + Design: Approve glass contrast matrix spec + 4-sided frame contract.
2. Implement Phase 1 Travelight static mode + token updates (1–2 days).
3. Phase 2: Upgrade Tabs + add focus trap skeleton to one drawer (proof).
4. Kick off Phase 3 Wave with focus trap + roving + live region sprint.
5. Parallel: Begin Phase 4 on Dashboard (reference surface) using new gates.

---

**Agent 13 Unique A11y Lens Summary + Insight**

The CI-ION premium glass language with its single constrained 4-sided canvas over an animated travelling-light backdrop is a deliberate aesthetic choice that **magnifies beauty but also magnifies every accessibility defect**. Blur + variable luminance under glass turns contrast from a static token problem into a dynamic perceptual one. Focus rings must fight optical softening. Motion sensitivity collides directly with the "travelling" effect. The 4-sided frame is the hero and the villain: it gives breathing room and spatial consistency (helping keyboard reachability and ring visibility) yet demands that every layout, modal, and scroll container respect the gutter or risk breaking the very tab order it protects.

**The plan's power is sequencing:** Harden the glass contract and system behaviors in Phases 1–3 (especially the dedicated Wave) so that Phase 4 surface work is not "retrofitting accessibility onto glass" but "building on an accessible glass foundation." Test gates are non-negotiable and must be **before** any surface is declared complete — exactly as the existing validation report templates intended but never executed.

When this plan is complete, clinicians and surveyors — sighted or not, motor-abled or keyboard-only, motion-sensitive or not — will experience the same trustworthy, professional compliance platform, with the glass aesthetic serving the content rather than fighting accessibility.

*Accessibility is the ultimate premium feature.*

---

**Files to Create / Update Alongside This Plan**
- `Implementation/GLASS_A11Y_CONTRAST_MATRIX.md` (Phase 1)
- `Implementation/FRAME_ACCESSIBILITY_CONTRACT.md` (Phase 1)
- `Implementation/USE_FOCUS_TRAP.md` + implementation (Phase 3)
- Updated `ACCESSIBILITY_GAP_LIST.md` with glass rows
- Expanded axe tests in `playwright/` or `tests/a11y/`
- Per-surface evidence bundles (screenshots, transcripts, reports)

**End of 4-Phase A11y Hardening Plan.**

---
*Prepared by Subagent 13 — Accessibility, Keyboard, Focus & Contrast Specialist*  
*Primary Lens Applied: Glass does not get a free pass.*