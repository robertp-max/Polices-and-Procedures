# Agent 03 Report: Token System & Primitive Component Adoption — 4-Phase Systematic Migration Plan

**Subagent:** 03 — Token System & Primitive Component Adoption Specialist  
**Primary Lens:** Faithful application of canonical design tokens + approved `ui/*` primitives vs. ad-hoc patterns.  
**Date:** 2026-05-17  
**Companion:** Agent_03_Token_Primitive_Adoption_Analysis.md (baseline inventory, misuse examples, adoption metrics, root causes).  
**Governing References:** CANONICAL_UI_SYSTEM_SPEC.md (Sections 10–12, 20), primitives/CATALOG.md, Canonical_Primitive_Usage_Map.md, *Token_Application_Matrix*.md files, LEGACY_DEPRECATION_MATRIX.md, Phase2_No_Visible_Changes_Root_Cause_Report.md, TAILWIND_AND_TOKEN_INTEGRATION.md, DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md, tokens.json + generators, UI_TOKEN_CONTRACT_SPEC.md, DRIFT_REGISTER.md (to be populated).

---

## Executive Summary — The Plan

This is the **corrective migration program** to convert the current "spec-complete, adoption-zero" state into measurable, gated, high-fidelity canonical UI.

**Core Philosophy:** 
- Primitives replace local authoring (not coexist).
- All visual decisions resolve through `tokens.json` → generated `--ci-*`.
- Deprecation is explicit and wave-based (no "temporary" legacy allowed on target surfaces after wave close).
- Every phase ends with a **Primitive Adoption Percentage KPI** (measured via automated static analysis + PR delta) + token purity score + visual regression gate.
- Final output of Phase 4: permanent **token lint rule + visual regression gate** that prevents regression forever.

**Overall Targets (by end of Phase 4):**
- Primitive Adoption: ≥98% of operational surfaces (zero new local card/panel/button families).
- Token Purity: 0 raw hex/rgba/arbitrary spacing/typography on any `src/policy/` file (except grandfathered print/legal paths with explicit exception).
- Visual Parity: All major surfaces pass side-by-side against Top-Picks mocks + canonical glass "magnification" contract (4-sided framed, token-driven painted surfaces).
- Governance: Lint + CI visual regression + PR checklist + design-system ownership of `ui/` + `tokens/`.

**4-Phase Structure (6–9 weeks total, aggressive but realistic):**
- **Phase 1 (Foundation — 1.5 weeks):** Token pipeline live + lint skeleton + primitive hardening + Dashboard baseline. KPI: 25% adoption.
- **Phase 2 (Core Wave — 2 weeks):** Shell overrides removed + high-traffic surfaces (Dashboard full, Evidence, Calendar, MyTasks, Library) migrated. KPI: 55% adoption. First deprecation wave.
- **Phase 3 (Expansion Wave — 2.5 weeks):** CES, Onboarding V2, Forms, Policy detail, iAdmin, regulatory, pm surfaces. Deprecate remaining card families. KPI: 80% adoption.
- **Phase 4 (Enforcement Wave + Gate — 1.5–2 weeks):** Remaining long-tail (Journey remnants, demos, one-offs) + permanent lint + visual regression gate + 100% token sync. KPI: 98%+ adoption. Deprecation complete.

Each phase includes: objectives, concrete migration steps, deprecation actions, KPI definition/measurement, deliverables, risks, sign-off criteria.

---

## Phase 1: Token Pipeline Activation + Primitive Hardening + Lint Foundation (Target: 25% Primitive Adoption)

**Duration:** 1.5 weeks (parallel with any Phase 2/3 surface work freeze on new ad-hoc).

### Objectives
- Make the locked `tokens.json` the single runtime source of truth.
- Eliminate internal hard-coding inside the primitive layer itself.
- Establish baseline measurement + first lint guardrails.
- Deliver first fully token-pure + primitive-primary reference surface (Dashboard) as proof.

### Key Actions
1. **Token Pipeline Wiring (Critical Path)**
   - Copy/integrate `Implementation/tokens/generated/tokens.css` (or run generators against `tokens.json`) into `src/styles/tokens.css`.
   - Import `src/styles/tokens.css` early in `src/index.css` (before any other rules).
   - Update `tailwind.config.js` `theme.extend` to derive colors, spacing, fontSize, boxShadow, borderRadius, transitionTimingFunction directly from token values (use a small `tokens.ts` generated file for JS consumption).
   - Generate `src/design/tokens.ts` (or equivalent) exporting typed constants for any JS-side usage.
   - Update all theme blocks in `src/index.css` to be thin overrides + aliases only; remove duplicate rgba/hex for glass/surface where canonical equivalents exist.

2. **Primitive Hardening (Self-Consistency)**
   - **GlassPanel.tsx + SurfaceCard.tsx:** Replace hardcoded `PAD` map with `var(--ci-spacing-xs)` / `sm` / `md` / `lg` / `xl` (or `padding` prop that maps to tokens). Add `data-layer` prop support per CATALOG.
   - **ActionButton.tsx + UtilityButton.tsx:** Remove hardcoded `#FFFFFF`; use semantic `--ci-color-text-primary-light` etc. or token-driven variants only. Convert `ci-btn--*` classes to pure token + Tailwind layout where possible.
   - Audit all other `ui/*` for raw values (CiStatusBadge colors, etc.) and migrate to tokens.
   - Update primitive JSDoc / CATALOG.md with "consumes only --ci-* " contract.

3. **Measurement & Lint Skeleton**
   - Create `scripts/measure-primitive-adoption.mjs` (or TS) that:
     - Scans `src/policy/` for imports of `@/policy/components/ui`.
     - Counts `SurfaceCard|GlassPanel|ActionButton|...` usage vs. regex for legacy patterns (`rounded.*(bg-white|shadow|border).*` + local card divs).
     - Outputs JSON: overall %, per-surface, raw-value count (hex + arbitrary Tailwind).
   - Add ESLint rule (or stylelint) stub: flag `#[0-9a-f]{3,6}`, `rgb(`, `rgba(`, `p-\[\d`, `text-\[\d`, `bg-\[#` inside `src/policy/` (with --fix guidance and grandfather list).
   - Populate initial `DRIFT_REGISTER.md` + link LEGACY_DEPRECATION_MATRIX entries for cards/buttons.
   - Update PR template + design QA checklist with "Primitive % delta + raw value delta" item.

4. **Reference Surface (Dashboard)**
   - Finish DashboardPage.tsx to 100% primitive composition for main surfaces (wrap KPI/operational cards in `SurfaceCard` + `GlassPanel(data-layer="1")` where appropriate; replace all conditional slate/white with semantic token classes or `--ci-color-*`).
   - Remove all raw conditionals inside Dashboard using new token-driven theme.
   - Capture baseline Playwright visuals + primitive-adoption report for KPI.

### Deprecation Wave 1 (Phase 1)
- Mark `ci-premium-panel`, `glass-interactive` (non-lib variants), direct "KPI card" divs, and Framework `fw-glass-btn` as **Deprecated — Do Not Use on New/Target Surfaces**.
- Add console warnings (dev only) or eslint-disable comments on first 5 occurrences.
- No new local card/panel components in any page folder.

### Primitive Adoption KPI — Phase 1 Exit
- **Target:** ≥25% overall operational surfaces using canonical primitives as primary composition (measured by script; Dashboard must hit ≥80%).
- **Token Purity:** ≤40% of changed files in Phase 1 contain raw hex/rgba/arbitrary values (baseline established; Dashboard target ≤15%).
- **Measurement Method:** Run `measure-primitive-adoption` + grep raw-value count on `git diff` of Phase 1 PRs. Report published to `docs/UIUX/16_Agent_Reports/Phase1_Adoption_Dashboard.md`.

### Deliverables & Sign-off
- `src/styles/tokens.css` live + imported; generators runnable from src/ copy of tokens.json.
- All core primitives (GlassPanel, SurfaceCard, ActionButton family) 100% token-internal.
- Lint skeleton + measurement script committed + passing on CI (non-blocking initially).
- Dashboard fully migrated + visual regression baseline updated.
- Updated CATALOG.md + Token_Application_Matrix_Dashboard.md reflecting reality.
- Phase 1 exit checklist signed (Design System owner + Frontend Platform + one Surface owner).

**Risks:** HMR / Vite cache issues on CSS change (document nuclear-restart procedure); resistance from teams used to "just add a div".

---

## Phase 2: Core Operational Wave + First Deprecation Enforcement (Target: 55% Primitive Adoption)

**Duration:** 2 weeks.

### Objectives
- Deliver the "visible change" moment: remove overrides, achieve framed glassmorphism magnification on high-traffic routes.
- Migrate next 4–5 major surfaces.
- Enforce first deprecation wave (no new legacy cards on migrated surfaces).
- Prove the model at scale.

### Key Actions
1. **Shell Visual Contract Fix (Highest Impact)**
   - In CommandCenterLayout.tsx: remove or strictly gate the overriding inline `style` block on `ShellContentFrame`. Move any remaining layout-only props inside `ShellContentFrame` as explicit props (never glass contract props).
   - Align `ShellContentFrame` + primitives glass treatment (blur, saturate, border, shadow, gradients) 100% to tokens from `tokens.json`.
   - Resolve dual theme stores (single canonical `useThemeMode` or equivalent; deprecate one).
   - Verify 4-sided constrained view + backdrop visibility on desktop 1200/1440/1600 and mobile against Top-Picks mocks (11_OnboardingActivation, 12_EvidenceCapture, 01_Dashboard).

2. **Surface Migration Wave 2 (Evidence, Calendar, MyTasks, Library, Forms)**
   - Apply identical pattern as hardened Dashboard: `ShellContentFrame` → `GlassPanel(data-layer="1")` for page root → `SurfaceCard` for all elevated content, `SectionHeader`/`PageHeader`, `ActionButton`/`UtilityButton`, `EmptyState`/`LoadingState`, `DataGrid` where lists, `CiStatusBadge`.
   - Replace every local card/panel with `SurfaceCard` or `GlassPanel`.
   - Convert all color/spacing/typography decisions to token classes or `var(--ci-*)`.
   - Update per-surface Token_Application_Matrix + Canonical_Primitive_Usage docs.

3. **Lint & Measurement Hardening**
   - Make raw-value ESLint rule **warning** on all new `src/policy/` changes (fail on >5 new raws per file).
   - Run adoption script on every PR; require ≥30% raw-value reduction on touched surfaces.
   - Add visual regression test that asserts computed style of main glass surface uses `--ci-color-glass-*` variables (not inline overrides) and presence of at least one `SurfaceCard` / `GlassPanel` per major route.

4. **Deprecation Wave 1 Enforcement**
   - Full removal or wrapper migration of `ci-premium-panel`, `glass-interactive`, `fw-glass-btn`, local CesCard patterns on all Phase 2 surfaces.
   - Update LEGACY_DEPRECATION_MATRIX with "Closed — Migrated" or "Exception — Print/Legal only".
   - Announce in team channels + add to onboarding docs for new contributors.

### Deprecation Wave 2 (Phase 2)
- Legacy tabs families (GVGB TabButton, WorkflowExecutionPanel tabs, DemoPage duplicates) → `ui/Tabs`.
- Legacy StatusBadge (root) → `CiStatusBadge`.
- Custom empty/loading states → primitives.
- Begin CES board migration (governed by Section 16 decision — prefer consolidation).

### Primitive Adoption KPI — Phase 2 Exit
- **Target:** ≥55% overall (Dashboard 100%, Evidence/Calendar/MyTasks/Library/Forms ≥70%, Shell 100%).
- **Token Purity:** 0 new raw values on any migrated surface; ≤25% raw remaining on untouched files in scope.
- **Visual Gate:** Side-by-side human + automated comparison vs. Top-Picks mocks for at least 5 routes; 4-sided framing + token-driven glass observable and documented.
- **Deprecation:** 40% of entries in LEGACY_DEPRECATION_MATRIX marked Closed for card/panel/button families.

### Deliverables
- 5+ surfaces fully canonical + passing visual + accessibility regression.
- Overrides removed; single theme system.
- Adoption measurement in CI (non-blocking but trending).
- Updated DRIFT_REGISTER.md with Phase 1–2 items closed.
- Phase 2 exit report with before/after adoption % and raw-value delta.

**Risks:** Scope creep on "core" surfaces; theme unification may surface hidden conditional logic.

---

## Phase 3: Expansion + Complex Surface Wave (Target: 80% Primitive Adoption)

**Duration:** 2.5 weeks.

### Objectives
- Tackle the long tail and high-complexity surfaces (CES full, Onboarding V2, Policy lifecycle/detail, Forms signing, iAdministrator, regulatory execution, pm tools).
- Resolve outstanding policy decisions (CES exception vs. consolidation, Journey V1 deprecation).
- Achieve majority adoption so legacy becomes the visible exception.

### Key Actions
1. **Complex Surface Migration**
   - **CES:** Full adoption of canonical primitives + tokens (or governed "CES" semantic namespace per spec Section 16 Option A). Replace ces/theme.ts palette with registered tokens.
   - **Onboarding V2:** Standardize on V2 as canonical; migrate all batch/activation/audit-readiness/governance to `SurfaceCard` + `GlassPanel` + token typography. Deprecate Journey V1 cinematic patterns (or isolate as explicit non-operational exception).
   - **Forms / Evidence / Policy Detail:** `FormSigningWorkspace`, `FormViewer`, `SharedPolicyDetailView`, `EvidenceCenterPage` main surfaces, `PolicyLibraryDocumentView`.
   - **Regulatory / PM / iAdmin:** Migrate `Primitives.tsx` usage to `CiStatusBadge` + semantic tokens; replace local KpiTile / panels with canonical or new promoted primitives (`KpiCard` candidate added to CATALOG).
   - Add any missing high-priority primitives identified in CATALOG gaps (KpiCard, BoardColumn, FilterBar, Modal) using the promotion path (update CATALOG + ui/index.ts + visual regression).

2. **Deprecation Wave 3**
   - Remaining card families (eCign, Journey, Staffing, one-offs in pm/regulatory).
   - All local tab/button/status implementations.
   - Hard-coded palettes (DOMAIN_PALETTE, URGENCY_PALETTE, etc.) registered as semantic tokens or removed.
   - Announce end-of-life for any grandfathered wave-based utilities (`ci-premium-*`, `ci-executive-*`).

3. **Enforcement Ramp**
   - Raw-value lint rule becomes **error** on new code in `src/policy/` (grandfather list for print paths only, reviewed quarterly).
   - Primitive coverage script run as required check on PRs for target surfaces (threshold rises to 60% raw reduction).
   - Visual regression suite expanded to cover 80% of routes with "glass contract" assertions.

4. **Governance**
   - Design System team owns approval for any new primitive or token addition.
   - All surface teams trained on "Primitives First" workflow (template + examples in BUILDING_V2_SCREEN_PLAYBOOK.md style doc).

### Deprecation Wave 3 (Phase 3)
- Full closure of LEGACY_DEPRECATION_MATRIX card/panel/button/tabs rows for all operational surfaces.
- CES parallel system decision executed (consolidation preferred).

### Primitive Adoption KPI — Phase 3 Exit
- **Target:** ≥80% overall (CES/Onboarding/Forms/Policy/Regulatory/PM ≥70%; only long-tail demos, Journey remnants, and explicitly excepted paths remain legacy).
- **Token Purity:** 0 raw values on any new or reconstructed surface; legacy grandfather list <10 files.
- **Deprecation:** 85%+ of deprecation matrix entries Closed.
- **New Primitives:** 2–3 gaps promoted (documented in CATALOG with usage matrices).

### Deliverables
- Majority of production routes (Dashboard, Evidence, Audit, Calendar, MyTasks, Library, Onboarding V2, CES, Forms signing, Policy detail) fully on canonical stack.
- CES policy decision recorded + executed.
- Journey V1 migration or isolation decision executed.
- Expanded visual regression + adoption metrics in CI.
- Phase 3 adoption dashboard published.

**Risks:** CES fragmentation politics; Journey cinematic vs. compliance tension; large surface files (FormViewer) may require careful incremental refactor.

---

## Phase 4: Enforcement, Cleanup, and Permanent Gate (Target: 98%+ Primitive Adoption)

**Duration:** 1.5–2 weeks.

### Objectives
- Zero-tolerance cleanup of remaining pockets.
- Institutionalize the gates so regression is impossible.
- Hand off a living, self-enforcing system.

### Key Actions
1. **Final Migration Sweep**
   - Remaining surfaces: Journey remnants (if any operational), all demo/staging pages (mark as non-canonical or migrate), iAdministrator deep components, any pm/regulatory stragglers, print-adjacent views (with explicit exception handling).
   - Promote final missing primitives from backlog (Toast system, ContextualHelp, etc.).
   - Delete or archive all deprecated local components (with git history preserved).

2. **Permanent Token Lint Rule + Visual Regression Gate**
   - **Lint Rule (Blocking):** ESLint + stylelint (or custom plugin) that fails CI on:
     - Any `#[0-9a-fA-F]{3,6}` or `rgb(a)?(` in `src/policy/` (except token definition files + grandfather list reviewed by Design System owner).
     - Arbitrary Tailwind values for color/spacing/typography/shadow/radius (`p-\[`, `text-\[`, `bg-\[#`, `shadow-\[`, `rounded-\[`).
     - Creation of new components inside page folders that duplicate catalog primitives (naming heuristic + import scan).
   - **Visual Regression Gate (Blocking):** Expand Playwright suite (`Builder/_system/uat/`) to:
     - Assert for every major route: presence of `data-shell-content-frame`, `GlassPanel[data-layer]`, `SurfaceCard`, token-driven computed styles on main glass (background includes `--ci-color-glass-*`, no raw rgba overrides).
     - Side-by-side pixel or perceptual diff vs. committed reference screenshots from Top-Picks mocks + canonical "magnification" states (light/dark, desktop inset).
     - Reduced-motion + accessibility (axe) + responsive matrix on every gate run.
   - PR template mandatory items: "Conforms to CANONICAL_UI_SYSTEM_SPEC.md", "Primitive adoption delta ≥X%", "Raw value delta ≤Y", "Visual regression passed".
   - Design QA checklist tied to spec Sections 4, 10, 11, 12.

3. **Documentation & Handoff**
   - Final update to all matrices, CATALOG, DRIFT_REGISTER, LEGACY_DEPRECATION_MATRIX (100% closed or explicitly excepted).
   - Publish "Primitives & Tokens — Developer Onboarding" guide + "How to Add a New Primitive" process.
   - Freeze `tokens.json` v1.0; establish change-control process (Design System owner + review).
   - Archive audit/Implementation artifacts or move authoritative copies under `design/` or `src/design/`.
   - Update CANONICAL_UI_SYSTEM_SPEC.md with Phase 4 completion note.

4. **Deprecation Wave 4 (Final)**
   - All remaining entries closed.
   - Any permanent exceptions (e.g., print fidelity paths, certain demo surfaces) documented with owners and review dates.
   - Remove all dev-mode warnings for deprecated patterns.

### Primitive Adoption KPI — Phase 4 Exit (Program Exit Criteria)
- **Target:** ≥98% of all operational surfaces (100% of production user-facing routes) built exclusively from catalog primitives.
- **Token Purity:** 0 violations in lint on `src/policy/` (grandfather list empty or <3 files with quarterly review).
- **Visual/Contract:** 100% of gated routes pass constrained page view + painted glass + token fidelity regression.
- **Deprecation:** 100% matrix closed or excepted with governance.
- **Gate Live:** Lint rule + visual regression blocking all future PRs; adoption script runs on every build.

### Deliverables
- Living enforcement system (lint + visual gate + measurement).
- Complete, up-to-date canonical documentation set.
- Zero open drift items for token/primitive category.
- Signed Phase 4 / Program Exit package (references updated CANONICAL_UI_SYSTEM_SPEC, adoption dashboard, before/after metrics, handoff to ongoing ownership).

**Risks:** Over-aggressive lint breaking last legacy surfaces; need for careful grandfather + incremental rollout of rule strictness.

---

## Deprecation Wave Plan (Consolidated View)

**Wave 1 (Phase 1):** Shell utilities (`ci-premium-panel`, `glass-interactive`), Framework fw-* buttons, Dashboard local KPI cards.  
**Wave 2 (Phase 2):** Evidence/Calendar/Library/MyTasks local cards/panels, legacy tabs (GVGB, workflow), root StatusBadge, custom empties.  
**Wave 3 (Phase 3):** CES (CesCard + theme), Onboarding V1 cinematic, Forms/eCign panels, regulatory/Primitives.tsx palettes, pm cards, iAdmin one-offs.  
**Wave 4 (Phase 4):** Journey remnants, demo/staging, any stragglers + final deletion.

**Mechanics per Wave:**
- Announce + date in team + docs.
- Add eslint-disable + runtime warning (dev).
- Migrate in target surfaces.
- Mark Closed in LEGACY_DEPRECATION_MATRIX + DRIFT_REGISTER.
- Remove from new code after wave close (lint error).

---

## "Primitive Adoption Percentage" KPI Definition & Tracking (All Phases)

**Formula (via `measure-primitive-adoption` script):**
```
( Number of surfaces where ≥70% of card/panel/button/surface elements use canonical ui/ primitives )
/ Total operational surfaces
```
**Surfaces counted:** Dashboard, EvidenceCenter, Library, Forms, Calendar, MyTasks (CES), AuditMode, PolicyDetail, Onboarding V2, CES boards, etc. (defined list in script, updated quarterly).

**Per-Phase Targets (cumulative):**
- Phase 1 Exit: 25%
- Phase 2 Exit: 55%
- Phase 3 Exit: 80%
- Phase 4 Exit: 98%+

**Supporting Metrics (reported every phase):**
- Raw value count (hex + arbitrary) delta on changed files.
- % of files importing from `ui/` exclusively for new composition.
- Visual regression pass rate on glass contract assertions.
- # of deprecated families still referenced in new code (target 0 after wave).

**Dashboard:** Published after each phase to `docs/UIUX/16_Agent_Reports/Agent03_Adoption_KPI_PhaseN.md` + living table in DRIFT_REGISTER or MASTER plan.

---

## Final "Token Lint Rule + Visual Regression Gate" Specification

**Implemented in Phase 4, live forever:**

1. **Static Lint (ESLint + optional stylelint):**
   - Rule: `no-raw-design-tokens` (custom or via `eslint-plugin-design-tokens`).
   - Blocks: hex colors, rgb/rgba (except in tokens files), arbitrary Tailwind for token domains, new local components mimicking `SurfaceCard`/`GlassPanel`/`ActionButton`/`Tabs`.
   - Auto-fix suggestions where possible.
   - Exception file: explicit grandfather list (reviewed by Design System owner, max 3 entries, quarterly expiration).

2. **Visual Regression Gate (Playwright):**
   - Runs on every PR touching `src/policy/` or `src/styles/`.
   - Assertions per route:
     - Main content frame uses `--ci-*` glass variables in computed style.
     - At least N canonical primitives present (configurable per route).
     - 4-sided inset visible (padding matches `--ci-glass-layer1-inset-desktop`).
     - No full-bleed glass on desktop (per Section 4 contract).
     - Perceptual or pixel diff ≤ threshold vs. baseline for light/dark + responsive breakpoints.
   - Failures block merge; require Design System + visual owner approval for baseline update.

3. **Process Gates:**
   - PR template + CI status checks.
   - Design-system review required for any primitive change or new token.
   - Quarterly audit of adoption % + raw-value trend.

This gate is the permanent safeguard that makes future "no visible changes despite work" impossible.

---

## Unique Insight from Token & Primitive Lens (Repeated for Plan Emphasis)

The specification cathedral was beautiful and complete. The migration plan must now treat **adoption as the product**, not the primitives themselves. By sequencing hard technical integration (Phase 1), visible wins + enforcement (Phase 2), breadth (Phase 3), and institutionalization of the gate (Phase 4), we convert the organization from "tents allowed anywhere" to "only the cathedral is permitted — and the lint + regression robot will burn down any new tents overnight."

The KPI per phase + explicit deprecation waves + final blocking gate ensure accountability that previous phases lacked. When this plan is executed, the "no visible changes" symptom disappears permanently because the primitives and tokens will be the *only* way to produce pixels.

---

## Phase-by-Phase Summary Table

| Phase | Duration | Adoption KPI | Deprecation Focus | Key Technical Deliverable | Gate Strength |
|-------|----------|--------------|-------------------|-----------------------------|---------------|
| 1     | 1.5w    | 25%         | Wave 1 (shell + Dashboard utilities) | Full token pipeline wired + primitives hardened | Lint skeleton + measurement |
| 2     | 2w      | 55%         | Wave 2 (core surfaces + tabs) | Overrides removed + 5 surfaces canonical | Warning→error ramp + glass assertions |
| 3     | 2.5w    | 80%         | Wave 3 (CES + Onboarding + regulatory) | CES decision + gap primitives promoted | Error on raws + expanded VR |
| 4     | 1.5–2w  | 98%+        | Wave 4 (final sweep + delete) | Permanent lint + VR gate live | Blocking on all future work |

---

**Plan End — Agent 03 Token & Primitive Adoption 4-Phase Plan**  
This plan is directly derived from the gaps identified in the companion Analysis report and all referenced canonical artifacts. Execution of this plan will resolve the adoption failure mode and deliver the locked visual contract promised in CANONICAL_UI_SYSTEM_SPEC.md.

**Next Immediate Step (post-review):** Create `scripts/measure-primitive-adoption.mjs` + wire the first token CSS import as Phase 1 kickoff.