# Agent 08: Policy Library, Detail, Search & Appendices Specialist — 4-Phase Canonicalization Plan

**Subagent:** 08  
**Primary Lens:** Policy consumption surfaces (Library, Detail, Search, Appendices, Taxonomy, acknowledgment flows)  
**Guiding Principle:** Policy surfaces are the "content heart" and most common end-user view. They must receive the **full canonical treatment early**. Poor typography + full-bleed or solid internal content inside the shell glass destroys the intended premium constrained-glass reading experience (per GLASS_LAYERING_CHEAT_SHEET.md "Desktop Container Rule", ShellFrame inset contract, TYPOGRAPHY_SCALE.md, and reference mocks 03/06/09/13/16/24).  

**Non-Negotiable Outcome:** Every policy reading surface must live strictly inside the single Layer-1 glass canvas with visible Layer-0 breathing room on desktop, use only canonical primitives (ShellContentFrame, GlassPanel/SurfaceCard variants, shared typography tokens), and deliver calm, high-legibility long-form editorial content that feels expensive rather than overwhelming.

**Scope:** `LibraryPage.tsx`, `PolicyDetailPage.tsx`, `TaxonomyPage.tsx`, `PolicyLibraryDocumentView.tsx`, `SharedPolicyDetailView.tsx`, `PolicyAppendicesPanel.tsx`, `FormViewer.tsx`, `FormsPage.tsx`, related print/acknowledgment paths, and any embedded usage (lifecycle, CES, journey, surveyor).

---

## Phase 0 — Immediate Stabilization (Pre-Kickoff, 1-2 days)

**Goal:** Prevent regression and establish measurement baseline.

**Actions:**
1. Freeze all new custom `.glass-interactive-*` or `bg-white` / `h-full w-full bg-*` patterns in policy files.
2. Add temporary data attributes or console warnings in `SharedPolicyDetailView` and `LibraryPage` when internal backgrounds override shell tokens.
3. Capture current visual regression baselines for the 6 key policy mocks (Desktop + Mobile v2) using existing playwright or tmp-ui-verify-screenshots infrastructure.
4. Document exact token usage matrix for the 4 surfaces (Library grid, Detail content, Appendices, Taxonomy) against `UI_PRIMITIVE_OWNERSHIP_MAP.md` and `UI_TOKEN_CONTRACT_SPEC.md`.
5. Tag all policy-related open issues in the UIUX audit backlog with "AGENT-08-POLICY-HEART".

**Exit Criteria:** No new policy surface code merges without Agent 08 review. Baseline screenshots + token matrix checked into repo.

---

## Phase 1 — Shell Contract Enforcement & Surface Unification (Week 1-2, Highest Priority)

**Goal:** Make every policy surface a pure consumer of the canonical shell glass + constrained frame. Eliminate the "full-bleed inside glass" anti-pattern that kills premium depth.

**Key Deliverables:**
- All policy pages (Library, Detail, Forms, Taxonomy) render children that **never** set root `bg-white`, `bg-[#FAFBF8]`, or `h-full w-full` that masks the ShellContentFrame.
- Introduction of a single `PolicyContentFrame` (or strict usage of `ShellContentFrame detail={true}` + inner editorial container) that all long-form views mount into.
- Library grid cards and detail sections become true `GlassPanel` or `ci-glass-panel` + `SurfaceCard` variants with proper elevation hierarchy (no stacking).
- Light-mode solid surfaces use only the documented `--ci-surface` / shadow + border tokens; remove all `!important` overrides and per-page `<style>` blocks.

**Detailed Work Items:**
1. **LibraryPage & FormsPage**
   - Refactor `glass-interactive-lib` / `glass-interactive-forms` into reusable `<GlassPanel padding="md">` + `SurfaceCard` compositions.
   - Remove the massive inline `<style>` block (lines 419-441 in LibraryPage); move shared behaviors to `index.css` under `.policy-lib-*` or canonical tokens.
   - Ensure the entire library lives inside the shell scroll container without re-declaring full-height bg.
2. **SharedPolicyDetailView & PolicyLibraryDocumentView**
   - Strip `demo-view-enter ... bg-white` and inner `bg-[#FAFBF8]` from the root div and main element.
   - Replace every `SCard` usage with a new `PolicySectionCard` that composes `GlassPanel` (or `SurfaceCard` for light editorial) with generous internal padding, max-w enforcement, and prose-friendly spacing.
   - Wrap the tab bar + carousel content area inside a constrained editorial sub-frame that respects the shell's 4-sided inset.
   - Ensure the action bar and tab bar are part of the shell chrome or use `ci-sticky-operational` / subtle glass variants.
3. **PolicyAppendicesPanel**
   - Convert sidebar + main panel to `GlassPanel` + `SurfaceCard` pair with proper elevation (sidebar lower, content surface slightly elevated).
   - Host FormViewer inside the canonical editorial container.
4. **Taxonomy / FrameworkShowcase**
   - Unify with canonical light-glass surfaces or provide explicit dark-mode glass tokens. Route `/taxonomy` and `/framework` through the same ShellContentFrame contract.
5. **Acknowledgment flows**
   - Ensure any attestation UI (inside FormViewer, SigningWorkspace, Journey) mounts its signature/confirmation cards using the same glass primitives and constrained widths.
6. **Shell integration verification**
   - In `CommandCenterLayout`, confirm policy routes receive `detail={true}` or appropriate glass variant when inside detail views.
   - Validate `--ci-glass-layer1-inset-desktop` breathing room is visible around policy content on ≥1024px viewports (per cheat sheet).

**Dependencies:** ShellFrame / ShellContentFrame tokens stable (already strong per Phase 2 work).

**Exit Criteria:**
- Visual diff against 03_PolicyDetail_Desktop_v2 / 06_PoliciesLibrary / 24_Policy_Detail_SoftGlass shows glass depth and breathing room present during detail reading.
- Zero root-level background overrides in policy source.
- Light + dark + high-contrast parity passes manual + automated checks.
- All embedded consumers (lifecycle view, CES task detail, surveyor) render identical chrome.

**Policy Lens Payoff:** The moment a user opens a 40-page policy, they immediately feel the expensive single-glass canvas + inset framing instead of a flat document.

---

## Phase 2 — Canonical Editorial Typography & Long-Form Reading Experience (Week 2-3)

**Goal:** Turn the constrained glass frame into a world-class reading instrument for dense regulatory content. Eliminate visual fatigue.

**Key Deliverables:**
- A `PolicyProse` / long-form component library (or extension of existing) aligned 100% to `TYPOGRAPHY_SCALE.md` + new policy-specific tokens (comfortable line length, generous leading, table styling, checklist density).
- Consistent section header treatment, table chrome, callout styles, reference links inside the glass.
- Reading affordances: focus/immersion mode, density slider (compact / comfortable / spacious), sticky progress, anchor navigation parity with mocks.
- Print parity: the already-good print surfaces become the gold standard for on-screen editorial containment.

**Detailed Work Items:**
1. **Typography Unification**
   - Audit and replace all `text-[15px]`, `text-[28px]`, `tracking-[0.22em]` etc. with design-system tokens or `className` utilities that map to the scale (desktop body 16px / 1.55, headings per spec).
   - Create `.policy-prose`, `.policy-table`, `.policy-checklist`, `.policy-metadata-grid` classes in `index.css` with proper contrast, spacing, and glass-friendly colors.
2. **SCard / Section Container Upgrade**
   - `PolicySectionCard` must enforce `max-w-prose` (or ~65-75ch) for body text, generous vertical rhythm (mb-8 etc.), and internal glass or surface elevation that does not fight the parent shell.
3. **Navigation & Density**
   - Enhance the existing carousel / tab / prev-next with keyboard roving, progress indicator, and "Focus mode" that temporarily maximizes the editorial panel inside the glass while still showing subtle shell frame.
   - Add subtle density controls (especially useful for appendices tables and long procedure lists).
4. **Appendices & Form Integration**
   - FormViewer sections inside appendices receive the same prose treatment + glass elevation.
5. **Search Results Polish**
   - Dedicated search results view (or enhanced library grid) matches 13_Policies_Search mock with glass cards, rich snippets, and smooth transitions into detail.
6. **Acknowledgment Surface**
   - Dedicated acknowledgment step (matching 16 mock) uses a premium constrained glass panel with signature + attestation text in editorial typography.

**Dependencies:** Phase 1 shell contract locked; TYPOGRAPHY_SCALE + COLOR_TOKENS + GLASS tokens finalized.

**Exit Criteria:**
- Long GV-GB-001 and generic generated sections render with measured line length, 1.55+ leading, comfortable table density, and pass "10-minute continuous reading" internal review.
- Visual parity with TYPOGRAPHY_SCALE desktop recommendations.
- Focus mode + density controls implemented and A/B tested with 3-5 internal users.
- All policy content (specimen + generated from `policyContentMap` / `allPoliciesContent.generated`) uses the new prose layer.

**Policy Lens Payoff:** Users describe policy reading as "calming and premium" rather than "dense and tiring." This is what separates a compliance tool from a world-class product.

---

## Phase 3 — Cross-Surface Consistency, Search, Taxonomy & Flow Polish (Week 3-4)

**Goal:** Eliminate fragmentation so every entry point (library browse → search → detail → appendices → acknowledgment → print) feels like one continuous premium experience.

**Key Deliverables:**
- Unified `PolicySurface` primitive or composition rules used by Library, Detail, Taxonomy, Forms, and all embeds.
- Search and filter surfaces (ACHC multi-select, regulatory chips, domain taxonomy) upgraded to canonical glass + motion.
- Taxonomy/Framework views fully aligned or explicitly themed.
- Acknowledgment + signing flows inside policy context use glass panels and editorial typography.
- Mobile responsive parity for all policy surfaces (reference mobile v2 mocks).
- Performance: virtualized long lists in library, lazy section rendering in detail.

**Detailed Work Items:**
1. **Shared Primitives**
   - Extract `PolicyLibraryCard`, `PolicySection`, `PolicyTabBar`, `PolicyAppendixShell`, `PolicySearchField` into `src/policy/components/ui/policy/` or shared ui.
   - All surfaces import and compose these; no more duplicate glass-interactive classes.
2. **Search & Discovery**
   - Enhance `SearchField` results and add a `/library/search` or in-place results pane that matches mock polish (rich metadata, instant glass-card preview on hover/selection).
3. **Taxonomy Unification**
   - Decide: either deprecate FrameworkShowcase specimen in favor of canonical surfaces, or make it a "preview" mode that still respects shell glass.
4. **Acknowledgment & Attestation**
   - Create or refine a `PolicyAcknowledgmentPanel` component that can be embedded in FormViewer, Journey, or standalone. Uses glass + constrained prose + signature.
5. **Mobile & Responsive**
   - Ensure Library grid collapses gracefully, detail carousel + tabs work on small viewports, appendices sidebar becomes bottom sheet or accordion — all while preserving glass feel (reference mobile mocks 03/07/13/14).
6. **Motion & Polish**
   - Apply canonical motion tokens (from MOTION_IMPLEMENTATION_EXAMPLES) to card hover, section transitions, filter changes, and acknowledgment success states.

**Dependencies:** Phase 1+2 primitives and typography stable.

**Exit Criteria:**
- Side-by-side review against all listed reference mocks (desktop + mobile) passes with ≤5 minor pixel deviations.
- Zero custom glass or typography code duplication across the 6+ policy surfaces.
- End-to-end user journey (browse → search → open policy → read 3 sections → view appendix → acknowledge) feels seamless and premium.
- All embeds (CES, lifecycle, surveyor, journey) inherit the same treatment.

---

## Phase 4 — Hardening, Measurement & Handover (Week 4+)

**Goal:** Make the canonical policy surfaces the reference implementation for the rest of the product. Institutionalize the Policy Lens.

**Key Deliverables:**
- Policy Consumption Surface becomes the "canonical content surface" example in DESIGN_SYSTEM docs and COMPONENT_USAGE_EXAMPLES.
- Full accessibility, performance, and visual regression coverage specific to long-form policy content.
- Style guide + handoff package for future policy content authors (how to structure generated sections so they render beautifully inside the glass frame).
- Metrics dashboard: time-on-policy, scroll depth, acknowledgment completion rate, "felt premium" qualitative scores.
- Deprecation of all legacy per-page glass hacks and old TaxonomyPage.old.tsx.
- Final audit against COMPLETE_V2_DESIGN_SYSTEM_DOCUMENTATION, GLASS_LAYERING, TYPOGRAPHY_SCALE, and PRINT_PDF_CONSISTENCY.

**Detailed Work Items:**
1. **Documentation & Governance**
   - Update `UIUX_SURFACE_INVENTORY.md`, `COMPONENT_ANATOMY_AND_CODE_EXAMPLES.md`, and add "Policy Detail & Library" section to `MASTER_IMPLEMENTATION_READINESS_CHECKLIST.md`.
   - Produce "Policy Authoring for Glass" micro-guide (markdown structure, heading levels, table guidelines that map to the prose renderer).
2. **Testing & Quality**
   - Add dedicated playwright suites for policy detail long-scroll, appendix signing, search filter combinations, mobile carousel.
   - Visual regression on every key mock viewport + theme.
   - Accessibility: WCAG 2.2 AA for long-form (contrast in tables, focus management in carousel, ARIA for tabs/sections).
3. **Performance**
   - Ensure 100+ policy corpus + generated sections render without jank (virtual sections or progressive hydration where needed).
4. **Measurement**
   - Instrument usage analytics on detail surfaces (section dwell time, nav usage, print vs. screen).
   - Run 5-user "premium reading" qualitative study; iterate on any remaining friction.
5. **Handover**
   - Agent 08 delivers ownership map update, token matrix, and "how to add a new policy surface" playbook.
   - All future surfaces (new CES views, additional journey modules) must route policy content through the Phase 1-2 primitives.

**Exit Criteria:**
- Policy surfaces achieve "canonical primitive usage" green status in `Audit_Canonical_Primitive_Usage.md` style reports.
- Zero open "glass contract violation" or "typography drift" tickets on policy files.
- Design system team + product accept the surfaces as the reference implementation for all long-form content in the product.
- 4-phase completion report signed off; subagent 08 transitions to advisory role.

---

## Success Metrics (Policy Lens Specific)

- **Visual:** 100% of detail reading surfaces show visible Layer-0 breathing room + single-glass canvas per cheat sheet on desktop.
- **Readability:** Average time to first meaningful section interaction < 8s; qualitative "calm premium" score ≥ 4.5/5.
- **Consistency:** Zero duplicated glass/typography code; all surfaces use shared `Policy*` primitives.
- **Adoption:** 100% of embedded policy viewers (lifecycle, CES, surveyor, journey) upgraded by end of Phase 3.
- **Print Parity:** On-screen and print versions indistinguishable in typography/spacing hierarchy.

---

## Risk Register & Mitigations

- **Risk:** Large GV-GB-001 specimen and generated content make typography changes high-churn. → Mit: Phase 2 works on renderer + tokens first; specimen data untouched.
- **Risk:** Light-mode solid surfaces look "flat" after glass enforcement. → Mit: Phase 1 explicitly uses documented light-mode shadow/border treatment from cheat sheet.
- **Risk:** Mobile carousel + appendices UX regression. → Mit: Mobile-specific review gate at end of each phase using mobile v2 mocks.
- **Risk:** Over-constraining content causes horizontal scroll or cramped tables. → Mit: Phase 2 includes table overflow patterns and density controls.
- **Dependency Risk:** Shell tokens or primitives shift mid-plan. → Mit: Phase 0 baseline + Agent 08 participates in any shell changes.

---

## Recommended Sequencing & Resource Notes

- **Owner:** Subagent 08 (Policy Lens) + 1-2 FE engineers familiar with shell primitives.
- **Parallelization:** Phase 1 Library grid refactor can run in parallel with Detail SCard replacement (different files).
- **Early Wins:** LibraryPage cleanup (visible on /library immediately) + removal of bg overrides in SharedPolicyDetailView (biggest perceptual jump for detail readers).
- **Testing Cadence:** Visual review against reference mocks after every phase gate.
- **Documentation:** All changes cross-referenced back to this plan and the Analysis report.

**Final Policy Lens Statement:** By giving the policy library, detail, search, appendices, taxonomy, and acknowledgment surfaces the full canonical glass-constrained editorial treatment in the first four phases, we protect the single most important user experience in the product. Everything else (CES boards, dashboards, onboarding) can follow the same pattern; policy content is the hardest and highest-leverage case. When staff open a policy and feel the calm, expensive, readable surface instead of an overwhelming document, the entire v2 glassmorphic promise is validated.

---

*Plan complete. Execute Phase 0 immediately. Reference companion Agent_08_Policy_Library_Detail_Analysis.md for detailed code findings and mock alignment.*