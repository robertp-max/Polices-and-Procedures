# Agent 01 — Glassmorphism & Layering Fidelity 4-Phase Implementation Plan

**Subagent Role:** Glassmorphism & Layering Fidelity Specialist  
**Primary Goal:** Restore and *lock* true glassmorphism fidelity across the entire product so that the strict 3-layer model + 4-sided constrained page view contract (explicitly designed "to magnify the glassmorphism effect") becomes the observable, non-negotiable reality on every operational surface in both light and dark modes.  
**Justification for Fresh 4-Phase Structure:** Existing phases (from UIUX_RECONSTRUCTION_MASTER_PLAN.md and MASTER_UIUX_IMPLEMENTATION.md) correctly sequence governance → shell → surfaces → maturity. This plan **re-uses the phase numbering** but narrows every deliverable, success criterion, and validation step through the glassmorphism lens. It treats the "magnified glass" visual signature (visible Layer 0 framing on all four sides of the Layer 1 composition, perceptible translucency + blur + luminous edges, zero decorative nesting >3 layers) as the *primary acceptance artifact*, not a side-effect of token or primitive work. This addresses the consistent finding across all reality reports that "code complete" has not yet produced "visible contract complete."

---

## Phase 1 — Glass Violation Audit, Primitive Hardening & Enforcement Foundation (1.5–2 weeks)

### Objectives
- Produce the first complete, machine + human verifiable **Glass Layering Violation Register** covering all 14+ operational surfaces.
- Update canonical primitives (`GlassPanel`, `SurfaceCard`, `ShellContentFrame`) and ESLint guardrails so that *nesting glass primitives inside glass primitives* or applying decorative `backdrop-blur` inside the main canvas is either forbidden or explicitly typed as "exception-only Layer 3."
- Establish the automated + manual screenshot comparison protocol that will be used for all subsequent phases.

### Measurable Success Criteria
- Glass Layering Violation Register documents ≥100% of current violations (double `ShellContentFrame`, `backdrop-blur-sm` + `ci-bg-overlay-*` inside Layer 1, legacy `.glass-morphism` usage, CES parallel surfaces, `ci-premium-*` decorative layers).
- All primitives in `src/policy/components/ui/` export only Layer-appropriate components; `GlassPanel` and `SurfaceCard` receive explicit `layer?: 1 | 2 | 3` props with runtime + lint warnings on misuse.
- New ESLint rule (or extension of existing `no-restricted-syntax`) flags any `backdrop-filter` / `backdrop-blur` or `ShellContentFrame` / `GlassPanel` nesting inside `src/policy/**` (WARN on full scope, ERROR on attested clean files).
- At least one reference surface (Dashboard) has a "before" capture set stored in `docs/UIUX/16_Agent_Reports/Agent_01_Glassmorphism_Baselines/` showing current state vs. `Top Picks/01_Dashboard_Mobile_v2.jpg` + `Desktop/v2/01_Dashboard_Desktop_v2.jpg`.
- Phase 1 exit sign-off includes Design Lead confirmation that the 4-sided framing contract language in `CANONICAL_UI_SYSTEM_SPEC.md §4` is now *enforceable* in code.

### Concrete Refactors (Order)
1. `src/policy/components/ui/ShellContentFrame.tsx` + `GlassPanel.tsx` + `SurfaceCard.tsx` — add `data-layer` attribute + prop validation + JSDoc forbidding nesting.
2. `eslint.config.js` — extend the design-system rule block (see `Phases_234_Catchup...` §5) with new selectors for `backdrop-filter|blur` and nested glass primitives.
3. Create `scripts/glass-layering-audit.ts` (or extend `verifyUiDesignSystem.ts`) that greps for the above + walks the component tree for `ShellContentFrame` depth.
4. `src/policy/pages/DashboardPage.tsx:413` — mark the inner `ShellContentFrame` with `data-layer-violation="scf-dup"` (temporary) and add TODO for Phase 2 removal.
5. Update `ui/index.ts` barrel and `primitives/CATALOG.md` (in docs/UIUX) with "Layering Rules" section.

### Validation Against Reference Mocks
- **Protocol (mandatory for all later phases):** 
  1. Capture full-page + cropped "glass composition" screenshots at 375px (mobile), 1024px, 1440px, 1600px using Playwright (extend existing `phase2-shell-visual.spec.mjs`).
  2. Store in timestamped folders under `tmp-ui-verify-screenshots/glass-fidelity/`.
  3. Side-by-side comparison (manual + perceptual diff) against reference crops from the v2 mockup set (`Desktop/v2/01_*.jpg`, `02_*.jpg`, `04_*.jpg`, Top Picks mobile equivalents).
  4. Checklist items: "Visible Layer 0 on all 4 sides of the outermost glass", "No decorative blur layers inside the main glass", "Luminous edge highlights legible", "Translucency reads against backdrop (dark) or soft shadow separation (light)".
- Human Design Lead + one engineer perform the first side-by-side for Dashboard and Evidence Center; record pass/fail + annotated screenshots.

### Risks Specific to Layering
- Overly aggressive lint rule may flag intentional mobile bottom sheets or signature canvases (mitigate with `data-layer-exception` allow-list).
- Dashboard double-frame removal may affect scroll/animation timing (pair with layout engineer).

### Estimated Effort & Team Split
- 1 UI Systems Engineer (primitive + lint) + 1 Design Systems Specialist (violation register + mock protocol) + 0.5 QA for capture harness.
- Total: 8–10 person-days.

---

## Phase 2 — Shell & Constrained Frame Enforcement + Dashboard Reference Surface (2–2.5 weeks)

### Objectives
- Eliminate the SCF-DUP architectural violation and guarantee that *every* routed page renders exactly one `ShellContentFrame` (the shell one) as its Layer 1.
- Make the 4-sided breathing room *around the entire content composition* (not just the shell padding) a runtime-enforced property on all major surfaces.
- Deliver the first fully compliant reference surface (Dashboard) that visually matches the Top Picks v2 contract in both modes.

### Measurable Success Criteria
- **Zero** instances of `ShellContentFrame`, `GlassPanel`, or equivalent glass primitives nested inside another (verified by the new audit script + grep).
- Dashboard (single source of truth) demonstrates **visible 4-sided Layer 0 framing** of the *entire KPI + board + action composition* as one logical Layer 1 unit in 1440px and 375px captures, matching `Desktop/v2/01_Dashboard_Desktop_v2.jpg` and mobile counterpart.
- All 14 operational surfaces now pass a new `glass-fidelity.spec.ts` that asserts:
  - Computed `padding` on the outer frame container ≥ `clamp(16px, 1.6vw, 28px)`.
  - `backdrop-filter` value on the painted glass layer matches the token (or `none` in light).
  - No child of the main glass has `backdrop-filter` unless explicitly marked Layer 2 card.
- Light + dark mode side-by-side pairs approved by Design Lead against the reference mocks.

### Concrete Refactors (Order)
1. **DashboardPage.tsx** — Remove the inner `<ShellContentFrame>` wrapper (line 413). Promote the outer content group into a single `GlassPanel` or keep flat on the shell glass, using only `SurfaceCard` for elevated L2 items. Add internal breathing margin (e.g., `mx-auto max-w-[min(100%,1480px)] px-6`) around the KPI grid + boards so the *collection* reads as one framed glass surface.
2. `CommandCenterLayout.tsx` — Remove or update the outdated "one glass — no stacked sub-cards" comment block (lines 45-48). Add `data-glass-layer="1"` to the shell `ShellContentFrame`.
3. Introduce `GlassComposition` wrapper primitive (new in `ui/`) that enforces the "outer margin around the entire group" rule for multi-card pages and applies the correct `data-layer="1"` semantics.
4. Update `EvidenceCenterPage.tsx`, `MasterCalendarPage.tsx`, `AuditModePage.tsx` (the attested clean files) to use the new `GlassComposition` + `SurfaceCard` pattern for any internal elevated surfaces.
5. Add Playwright visual regression test `glass-fidelity.spec.ts` that fails the build if any captured glass edge does not show measurable backdrop contrast (simple pixel sampling at the four corners of the main glass rect).

### Validation Protocol (Identical Structure to Phase 1, Now Applied to All Surfaces)
- Full regression capture suite at the four breakpoints.
- Side-by-side + annotated diff vs. `Desktop/v2/` and Top Picks.
- Explicit checklist sign-off: "All 14 operational surfaces demonstrate visible 4-sided backdrop framing in both light and dark mode per Top Picks v2 mocks."

### Risks Specific to Layering
- Removing the Dashboard inner frame may shift layout metrics and require KpiCard / BoardColumn spacing adjustments.
- Mobile battery impact of `backdrop-filter` on complex pages (profile with will-change: transform on the glass layer; test on low-end Android).
- CES pages routed inside the global shell may still paint their own navy canvases that visually "punch through" the canonical glass (requires Phase 3 decision).

### Estimated Effort & Team Split
- 2 Frontend Engineers (1 shell/primitive owner, 1 Dashboard + first 3 surfaces) + 1 Designer (visual QA) + QA automation support.
- Total: 12–14 person-days.

---

## Phase 3 — Operational Surface Layering Reconstruction & Legacy Elimination (3–4 weeks)

### Objectives
- Rebuild every high-frequency surface (Dashboard already done in P2, then Evidence, Audit, Calendar, My Tasks / CES pages, iAdministrator, Onboarding V2, Policy Library/Detail, Workflow drawers, etc.) so that they use **only** the canonical Layer 0 (shell) → Layer 1 (single `ShellContentFrame` or `GlassComposition`) → Layer 2 (`SurfaceCard` or `GlassPanel` with stronger shadow) model.
- Completely excise legacy wave-era decorative glass (`ci-premium-*`, `.glass-morphism`, ad-hoc `backdrop-blur-sm` inside the canvas, raw `bg-white/10` translucency hacks).
- Achieve zero raw visual values and zero layering violations on the full attested surface set.

### Measurable Success Criteria
- 14 operational surfaces pass the glass-fidelity checklist and visual regression against the full v2 mockup corpus (`Desktop/v2/` + `Mobile/v2/` + Top Picks).
- All `ci-premium-hero/panel/maturity-section` and similar classes removed or mapped to `SurfaceCard` + semantic tokens.
- CES surfaces either (a) fully migrated to canonical glass primitives + Care Indeed tokens (preferred) or (b) granted a governed exception with documented Layering Contract (per CANONICAL spec §16) that still respects 4-sided outer framing.
- `Glass Layering Violation Register` shows 0 open items in the "decorative nesting / >3 layers" category.
- Light-mode surfaces now use only shadow + soft hairline elevation per `LIGHT_MODE_ELEVATION_SYSTEM.md` (no competing translucency).

### Concrete Refactors (Priority Order)
1. Dashboard (already cleaned in Phase 2) — template + checklist published.
2. EvidenceCenterPage + Evidence hierarchy panels.
3. MasterCalendarPage + AuditModePage + WorkflowExecutionPanel (the heavy raw-value offenders).
4. CES pages (CesBoardPage, MyTasksPage, etc.) — either consolidate or exception.
5. iAdministrator/* (highest violation count per catch-up report), journey/onboarding-v2, Framework/Library/PolicyDetail.
6. Drawers, modals, bottom sheets — standardize on `RightDrawer` / `BottomSheetDrawer` that declare themselves Layer 2 or 3.
7. Global cleanup pass on the 326-violation debt (P4-DEBT-01) with focus on glass-related raw rgba / Tailwind opacity.

### Validation Protocol
- Per-surface before/after + side-by-side with reference mocks.
- Automated `glass-fidelity.spec.ts` run on every PR touching `src/policy/pages/**` or `src/policy/ces/**`.
- Final human gallery review: all 14 surfaces in a single design-crit deck, each with 4-breakpoint captures vs. mocks.

### Risks Specific to Layering
- Performance: Heavy `backdrop-filter` on 7+ simultaneous elevated cards on complex dashboards (mitigation: promote only the *outermost* composition to true blur glass; inner cards use solid + shadow).
- Mobile battery & scroll jank on low-end devices.
- Political / scope risk on CES (already a known parallel system) — may require executive decision recorded in Drift Register.
- Onboarding V2 cinematic remnants vs. strict 3-layer rule.

### Estimated Effort & Team Split
- 3–4 Frontend Engineers (surface squads of 2) + 1 Designer + 1 QA.
- Total: 18–24 person-days across 3–4 sprints. Parallelizable by surface cluster (Regulatory, CES, iAdmin, Core Pages).

---

## Phase 4 — Fidelity Lock, Performance Hardening & Final Cross-Surface Sign-off (2 weeks)

### Objectives
- Lock the glassmorphism system so that future work cannot regress the 3-layer + 4-sided contract without an explicit spec change + recorded approval.
- Deliver final human + automated proof that the "magnified glassmorphism" signature (visible backdrop framing, perceptible translucency, edge definition, luminous highlights) is present and consistent on every surface in light/dark, desktop/mobile.
- Resolve remaining performance, mobile, and CES governance items.

### Measurable Success Criteria
- 100% of the 14 operational surfaces have approved side-by-side visual regression packs stored and linked from `PHASE4_FINAL_GLASS_FIDELITY_REPORT.md`.
- All surfaces pass a new "Glassmorphism Magnification Audit" (4-sided backdrop contrast sampling + blur presence in dark + shadow-only elevation in light).
- Zero open items in the Glass Layering Violation Register.
- Performance budget: `backdrop-filter` surfaces pass Lighthouse + real-device battery drain test (≤8% extra on 60s complex dashboard scroll).
- CES decision (consolidation or governed exception) recorded and implemented.
- PR template + pre-commit hook now block any commit that introduces new glass nesting or raw backdrop values (enforcement gate live).

### Concrete Refactors (Order)
1. Final lint/CI hardening: Promote the glass-specific selectors to hard ERROR on the full `src/policy/**` scope.
2. Add `data-glass-fidelity="locked"` attribute on the canonical `ShellContentFrame` and a corresponding runtime guard (console warning in dev if violated).
3. Produce `PHASE4_FINAL_GLASS_FIDELITY_REPORT.md` containing the complete gallery + sign-off table.
4. Mobile-specific insets + safe-area glass edge treatments validated against Mobile v2 mocks.
5. Reduced-motion variants (glass without heavy blur) audited.
6. Close SCF-DUP, P4-DEBT-01, and all glass-related drift items.

### Validation Protocol (Highest Rigor)
- Automated + manual comparison against the *entire* approved mock corpus (not just Top Picks).
- Cross-surface consistency matrix (every surface must look like it belongs to the same 3-layer system).
- Executive demo flow executed end-to-end with real device captures in both modes.
- Design Lead + Engineering Lead + Compliance Owner sign the final fidelity report.

### Risks Specific to Layering
- Last-mile visual polish requests that re-introduce "just one more subtle blur layer" (mitigate with strict "no new decorative glass" policy + exception process).
- CI cost of full visual regression matrix (4 breakpoints × 14 surfaces × 2 modes).

### Estimated Effort & Team Split
- 2 Engineers (enforcement + perf) + 1 Designer (final gallery + sign-off) + QA.
- Total: 8–10 person-days.

---

## Overall Program Metrics & Governance

- **Primary Success Metric:** "All 14 operational surfaces must demonstrate visible 4-sided backdrop framing in both light and dark mode per Top Picks v2 mocks" (verbatim acceptance gate for Phase 4).
- **Anti-Regression:** Any PR touching shell or page surfaces must attach glass-fidelity captures or receive explicit waiver.
- **Team Split Recommendation:** UI Primitives owner (1), Surface Reconstruction Squads (parallel), Design Systems (visual QA owner), one dedicated "Glassmorphism Auditor" rotating role per sprint.

---

## Unique Insight from Glassmorphism Lens

> **Glassmorphism fidelity is not a styling problem — it is an architectural containment problem.** The single most powerful lever is not "make the blur stronger" or "add more gold inset." It is enforcing that the *entire logical content composition* of a page (KPI row + boards + actions on Dashboard; hierarchy + list + detail on Evidence) must live inside one outer glass frame that itself breathes against the Layer 0 backdrop on all four sides. Every current violation (Dashboard double-frame, inner `backdrop-blur-sm` headers, negative-margin panels, CES navy slabs) is a symptom of treating the shell glass as "the page background" instead of as the *elevated, framed, translucent working surface*. Once the product internalizes that the 4-sided rule exists to let the eye see the glass *against* something richer, all the luminous edges, perceptible translucency, and premium depth described in the original cheat sheet and visible in every v2 mock will appear for free — and stay locked.

---

*End of Agent 01 Glassmorphism & Layering Fidelity 4-Phase Plan.*  
*This plan is ready for parallel review by the other 15 subagents and integration into the master reconstruction program.*