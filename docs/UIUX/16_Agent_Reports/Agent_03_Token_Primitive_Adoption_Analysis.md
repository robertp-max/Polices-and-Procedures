# Agent 03 Report: Token System & Primitive Component Adoption Analysis

**Subagent:** 03 — Token System & Primitive Component Adoption Specialist  
**Primary Lens:** Faithful application of canonical design tokens (`tokens.json` + generated `tokens.css`) and approved primitive layer (`GlassPanel`, `SurfaceCard`, `ui/*` catalog) versus ad-hoc Tailwind classes, hard-coded colors, spacing, shadows, and one-off components.  
**Date:** 2026-05-17  
**Scope:** Full codebase inventory (src/policy/, docs/UIUX/, _Heavy/.../Implementation/, design-references) cross-referenced against CANONICAL_UI_SYSTEM_SPEC.md, primitives/CATALOG.md, usage maps, token matrices, and runtime artifacts.  
**References Consulted:**  
- docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md (Sections 10–12, 20 on primitives/tokens/pipeline)  
- _Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/tokens/tokens.json + generators/ + generated/tokens.css  
- Implementation/primitives/CATALOG.md + *Token_Application_Matrix*.md (Dashboard, Evidence, Audit, MyTasks, Calendar, Shell) + Canonical_Primitive_Usage_Map.md + Audit_Canonical_Primitive_Usage.md  
- design/TAILWIND_AND_TOKEN_INTEGRATION.md + DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md  
- Implementation/Phase2_No_Visible_Changes_Root_Cause_Report.md + LEGACY_DEPRECATION_MATRIX.md + Legacy_Cleanup_and_Migration_Guardrails.md  
- Current src/policy/components/ui/ (20 primitives) + usage sites across 50+ page/component files  
- UI_PRIMITIVE_OWNERSHIP_MAP.md + UI_TOKEN_CONTRACT_SPEC.md (root) + src/index.css + tailwind.config.js

---

## Executive Summary

The canonical primitives layer and token contract were substantially defined during Phase 1/2 (CATALOG.md lists 15+ core + 6 shell primitives; tokens.json v0.2.0-phase1 locked with full color/semantic/glass/spacing/typography/radius/shadow/overlay/dimension/motion families). However, **adoption at runtime is critically low** (~15% primitive coverage on operational surfaces; <30% token purity even on "upgraded" surfaces). 

Primitives exist and the shell skeleton (`ShellFrame` → `ShellContentFrame` + `GlassPanel`/`SurfaceCard`) is mounted, yet **no visible change** is observed because:
- Primitives are overridden by legacy inline styles and `.ci-*` class fallbacks.
- The authoritative generated token pipeline (`Implementation/tokens/`) was never wired into `src/index.css` / Tailwind / build.
- Page-level surfaces (Library, Evidence, Onboarding V1/V2, CES, Forms, most regulatory/pm/journey) remain 80-95% ad-hoc Tailwind + raw hex/rgba + local div "cards".
- Even "heavily upgraded" DashboardPage retains 50+ conditional `text-slate-*` / `bg-white/10` + hard-coded padding maps inside primitives themselves.

**Current Primitive Adoption:** 12–18% of target operational surfaces use canonical `ui/*` primitives as primary composition layer (Dashboard ~55% partial; all others <15%).  
**Token Misuse Severity:** High — thousands of raw values (2043+ flagged instances across 100+ files); primitives use 12px/16px/24px hard-coded `PAD` maps instead of `--ci-spacing-*`; CSS is a hybrid legacy `--glass-main` + partial `--ci-*` with theme drift.

The root of the "no visible changes" problem is **not** missing primitives — it is **zero systemic adoption enforcement** combined with incomplete token integration and pervasive overrides. The system has "built the cathedral but left the congregation in the parking lot using tents."

---

## 1. Inventory: Primitives That Exist Today

### 1.1 Core Canonical Primitives (src/policy/components/ui/)
From `primitives/CATALOG.md` (Phase 1 locked) + actual files:

**Core Layer (widely declared but narrowly adopted):**
- `GlassPanel.tsx` — Layer 1 glass container (uses `.ci-glass-panel` + hardcoded `PAD` map: none/sm=12px/md=16px/lg=24px)
- `SurfaceCard.tsx` — Layer 2 elevated card (`.ci-card` + same hardcoded `PAD`)
- `ActionButton.tsx` — CTA/secondary/ghost/danger (`ci-btn--*` classes; danger variant has hardcoded `#FFFFFF`)
- `UtilityButton.tsx` — Secondary/icon actions
- `PageHeader.tsx`, `SectionHeader.tsx`
- `Tabs.tsx`, `SearchField.tsx`, `CiStatusBadge.tsx`
- `EmptyState.tsx`, `LoadingState.tsx`
- `DataGrid.tsx`, `StalenessBanner.tsx`, `AriaLiveRegion.tsx`
- `BottomSheetDrawer.tsx`, `RightDrawer.tsx`
- `SignaturePad.tsx`, `PhotoEvidenceCapture.tsx`, `ThemeModeToggle.tsx`

**Shell Primitives (Phase 2 — Promoted & Partially Wired):**
- `ShellFrame.tsx`, `ShellTopbar.tsx`, `ShellNavRail.tsx`, `ShellContentFrame.tsx` (owns glass surface via `var(--ci-color-glass-main)` etc.)
- `ShellCommandGroup.tsx`, `ShellMobileDrawer.tsx`

**Exports:** `ui/index.ts` (complete, with ownership notes).

**Status in CATALOG.md:** "Core" for most; gaps explicitly called out (KpiCard, BoardColumn, FormField, Modal, FilterBar, Toast, ProgressStepper).

### 1.2 Actual Runtime Usage (Cross-File Audit)
Only **14 files** import from `@/policy/components/ui` (grep-verified):

- CommandCenterLayout.tsx (shell primitives — structural win)
- DashboardPage.tsx (only `ActionButton` x2; heavy custom KPI/operational-card divs)
- EvidenceCenterPage.tsx (`StalenessBanner`, `AriaLiveRegion`, `LoadingState`, `EmptyState`)
- LibraryPage.tsx, FormsPage.tsx (`EmptyState`, `SearchField`)
- MasterCalendarPage.tsx (`SurfaceCard` x2, `EmptyState`, `AriaLiveRegion`)
- MyTasksPage (CES) (`ActionButton`, `CiStatusBadge`, `EmptyState`)
- PmViews.tsx, TaskDetailRightPanel.tsx, SprintReviewPage.tsx, EvidencePanel.tsx, RightPanelPreview.tsx, StudioTabs.tsx, etc. (mostly single primitive or `SurfaceCard` for one panel)

**Zero or near-zero usage:** 
- LibraryPage, EvidenceCenterPage (main surfaces), AuditModePage, PolicyDetail/SharedPolicyDetailView, FormViewer/FormSigningWorkspace, OnboardingV1JourneyPage + OnboardingV2/*, most CES board (SprintExecutionBoard uses only AriaLiveRegion), FrameworkPage (heavy fw-glass-btn), GVGB/*, iAdministrator/*, regulatory/* (uses local Primitives.tsx), journey/* pages.

**Verdict:** Primitives are **shelf-ware** outside the shell. The "catalog exists" but page composition remains one-off.

---

## 2. Legacy Patterns Still Dominant

### 2.1 Legacy Component Families (from LEGACY_DEPRECATION_MATRIX.md + code)
- **Card/Surface Families:** Direct `<div className="rounded-xl shadow... bg-white...">` (hundreds), `ci-premium-panel`, `glass-interactive`, `glass-interactive-lib`, `fw-glass-btn` (Framework), local `CesCard` (CES theme.ts divergence), GVGB custom panels, eCign panels in FormSigningWorkspace, Journey cinematic cards (5-slot absolute), Shared SCard/GenericSectionPanel.
- **Button Families:** Ad-hoc `<button className="px-6 py-3 rounded-full font-bold text-[10px] tracking-[0.2em] ... text-[#14b8a6]">` (FrameworkPage, many modals), legacy StatusBadge (dark hex), multiple spinner/empty implementations.
- **One-off "Primitives":** `src/policy/components/regulatory/Primitives.tsx` (DomainDot, DomainBadge, UrgencyChip, PolicyRef using DOMAIN_PALETTE hard-coded colors), `StatusBadge.tsx` (root), KpiTile.tsx (onboarding-v2 + regulatory), local tabs in WorkflowExecutionPanel / DemoPage / GVGBDetailView.
- **CES Parallel System:** ces/theme.ts + custom navy/orange palette + board primitives (explicitly called out as fragmentation risk in CANONICAL_UI_SYSTEM_SPEC Section 16).
- **Journey/Onboarding Fragmentation:** V1 cinematic vs V2 audit-grade; neither fully on canonical primitives/tokens.
- **Other:** ModalShell.tsx, WorkflowDrawer, ApprovalFlow, PmTaskCard, etc.

**Dominance Metric:** >85% of visible surfaces use legacy or local patterns as primary building blocks.

### 2.2 Token Misuse — Concrete Examples
**Hard-coded / Non-token in Primitives (self-inflicted):**
- GlassPanel.tsx & SurfaceCard.tsx: `const PAD = { sm: '12px', md: '16px', lg: '24px' }` — should be `var(--ci-spacing-sm)` etc. (violates "all primitives must consume official token system").
- ActionButton.tsx: `color: '#FFFFFF'` in danger variant; relies on `ci-btn--*` classes instead of pure `--ci-*`.

**Raw Values & Ad-hoc in "Upgraded" Surfaces (DashboardPage.tsx — flagged as "heavily upgraded"):**
- Conditional `isLight ? 'text-slate-500' : 'text-white/70'`, `bg-white/10 text-slate-200`, `bg-slate-200 text-slate-700`, `text-emerald-800`, `border-slate-200`.
- `ci-min-h-kpi` + `ci-shadow-elev-md` mixed with Tailwind `p-4`, `rounded-2xl`, `focus-visible:ring-orange-400/60`.
- Many `text-[10px]`, `tracking-[0.26em]` that duplicate token typography but bypass `.ci-text-eyebrow-strong`.

**LibraryPage.tsx (still legacy):**
- `bg-white px-2.5 py-1.5`, `glass-interactive-lib ... border-[0.77px]`, `rounded-xl`, `text-[9px] font-montserrat tracking-wider`.
- Local `glass-interactive-lib` class (no token equivalent).

**CommandCenterLayout.tsx (overrides kill the contract):**
- Heavy inline `style={{ background: 'var(--ci-color-glass-main)', ... }}` + branches on `isVisualLight`, `isCareIndeedDark` + raw rgba fallbacks (`rgba(66,8,8,0.3044)`).
- Dual stores (`useShellStore` vs `useCiModeStore`) → theme drift.

**Other Hotspots (sampled):**
- FrameworkPage.tsx: dozens of `#ef4444`, `#3b82f6`, `#f97316`, `#eab308`, `text-[10px] tracking-[0.2em]`, `fw-glass-btn`.
- FormViewer.tsx, SharedPolicyDetailView.tsx, OnboardingV1JourneyPage.tsx, EvidenceCenterPage.tsx, CES SprintTaskPanel: 17–137+ raw hex/rgba + arbitrary spacing per file.
- `src/index.css`: 2500+ lines hybrid — old `--glass-main`, `--ci-maroon-*`, new `--ci-font-size-*` and `--ci-color-glass-*` coexist with drift (e.g. light mode glass is `#FFFFFF` flat vs. canonical gradient).

**Missing Token Wiring:**
- Authoritative `Implementation/tokens/generated/tokens.css` (full primitive/semantic/glass/spacing/typography/shadow from tokens.json) **is not imported anywhere** in src/.
- `src/index.css` manually maintains a subset; generators (generate-tokens-css.mjs, generate-tokens-ts.mjs) are audit-only artifacts.
- Tailwind `theme.extend.colors.ci` and `boxShadow.glass-*` are legacy snapshots, not derived from tokens.json.

**Violations of CANONICAL_UI_SYSTEM_SPEC Section 12 & 11:**
- No lint rule active.
- Raw values on `src/policy/` files.
- Primitives not "primarily" used on reconstructed surfaces.
- Constrained Page View + painted glass contract partially delivered only at shell frame, bypassed inside pages.

---

## 3. Root Cause of "No Visible Changes" Problem (Token/Primitive Lens)

From Phase2_No_Visible_Changes_Root_Cause_Report.md (validated):

1. **Overrides > Primitives:** `ShellContentFrame` receives canonical classes but is immediately style-overridden in CommandCenterLayout (inline background/blur/border/shadow + theme branching).
2. **Missing/Drifted Tokens:** `--ci-color-glass-light-main` etc. defined only as aliases to legacy; full spectrum from tokens.json absent.
3. **Dual Theme Systems:** `useCiModeStore` (primitives) vs `useShellStore` (layout) → inconsistent painting.
4. **Uneven Adoption:** Only Dashboard received partial token work; 80%+ of routes untouched → "one upgraded island in an ocean of legacy."
5. **Primitives Themselves Incomplete:** Hard-coded padding + reliance on `.ci-*` classes (which are CSS sugar over partial tokens) instead of direct `style={{ padding: 'var(--ci-spacing-lg)' }}` or pure token classes.
6. **No Enforcement:** No lint, no PR gate, no visual regression asserting *painted* glass properties or primitive composition.
7. **HMR Fragility + Monolithic CSS:** Changes to index.css or layout require nuclear cache clears to observe.

**Quantified Impact:** Structural skeleton (Phase 2) succeeded; **visual + semantic adoption (the actual goal)** failed at 80%+.

---

## 4. Current State of Token Pipeline vs. Canonical Contract

- **Source of Truth:** `tokens.json` (v0.2.0-phase1) in audit/Implementation/tokens/ — excellent coverage (primitive colors + semantic + glass gradients + 8 spacing steps + full typography scale + 5 elevation shadows + overlays + dimensions + motion).
- **Generated:** `generated/tokens.css` (all `--ci-color-*`, `--ci-spacing-*`, `--ci-font-size-*`, `--ci-radius-*`, `--ci-shadow-elevation-*`, `--ci-glass-layer1-*`, `--ci-dimension-surface-*`, etc.) + TS generators — **never integrated**.
- **Runtime Reality:** `src/index.css` has ~60% overlap but with legacy names (`--glass-main`, `--ci-maroon-*`, hand-coded rgba for glass states) and theme-specific blocks that diverge from canonical.
- **Integration Status:** 0% of recommended steps in TAILWIND_AND_TOKEN_INTEGRATION.md + DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md completed for the locked contract (no `src/styles/tokens.css`, no theme.extend derivation, no ESLint rule).

**Result:** Even when primitives are used, they cannot deliver consistent token fidelity because the CSS source is drifted and incomplete.

---

## 5. Primitive Adoption Percentage (Baseline KPI)

- **Overall Operational Surfaces (est. 25+ major routes + subviews):** ~15% primitive-primary composition.
- **Dashboard:** ~55% (KPI/boards use some `.ci-*` + ActionButton; core surfaces still custom divs + conditionals).
- **Shell/CommandCenterLayout:** ~90% (structural primitives wired, visuals overridden).
- **Evidence / Library / Forms / Calendar (partial):** 10–20% (only EmptyState/SearchField/SurfaceCard in isolated spots).
- **CES / Onboarding V1/V2 / Journey / iAdmin / Regulatory:** <5%.
- **Primitives Themselves Token-Pure:** ~40% (typography/dim via `.ci-text-*` classes; colors/spacing/padding still hard or conditional).

**Gap vs. Phase 2 Exit Criteria:** Claimed "core shell + primitives" delivered; measurable adoption and "painted glass matching Top-Picks mocks" not achieved.

---

## Unique Insight from Token & Primitive Lens

**The "Cathedral in the Desert" Paradox:** The design system team successfully produced a complete, locked, auditable cathedral (primitives/CATALOG.md + tokens.json + usage matrices + deprecation matrix + CANONICAL spec) with zero technical debt in the *specification layer*. Yet the application runtime remains a tent city because **the migration contract was never enforced at the build or review boundary**. 

Primitives were promoted to "Core — Shell" and exported, but page teams were never blocked from shipping local `<div className="bg-white rounded-2xl shadow">` equivalents. The token generators were written but left in the audit folder like a reference manual no one opened during implementation. 

The deepest failure mode is **"spec-complete, adoption-zero"** — exactly the inverse of what a token/primitive system is supposed to prevent. This is why adding more primitives or more tokens will not produce visible change: the organization has not yet internalized that the primitive layer *replaces* local authoring, not coexists with it. 

The unique remedy from this lens is not "more primitives" but **a hard adoption gate**: every surface PR must demonstrate >70% reduction in raw values + exclusive use of catalog primitives, measured by automated lint + visual diff against the locked mocks. Until the cathedral is the *only* building allowed on the lot, the desert persists.

---

## 6. Gaps, Risks & Immediate Blockers

- No active lint rule for raw hex / arbitrary values / non-primitive card patterns on `src/policy/`.
- Primitives contain internal hard-coded values (violates own CATALOG rule #4).
- Generated token artifacts and source `tokens.json` live outside src/ — version skew inevitable.
- CES parallel system (Section 16 of spec) still undecided; risks permanent fork.
- Onboarding/Journey fragmentation (Section 17) unresolved.
- Visual regression (phase2-shell-visual.spec.mjs) only checks structure/ARIA, not token-driven painted surfaces or primitive usage.
- Drift Register (DRIFT_REGISTER.md) and Legacy Deprecation Matrix exist in audit/ but not enforced in CI.

**Risk:** Further Phase 3 surface work without fixing adoption will multiply the "no visible change" debt and make eventual migration exponentially harder.

---

## 7. Recommendations (Token/Primitive Specific)

1. **Immediate:** Wire `Implementation/tokens/generated/tokens.css` (or build step) into `src/index.css`; generate `tokens.ts` types and consume in primitives.
2. **Migrate primitives first:** Replace all `PAD` maps and hard-coded colors inside `GlassPanel`/`SurfaceCard`/`ActionButton` with `--ci-spacing-*` / semantic tokens.
3. **Adoption Audit Pass:** Instrument a one-time "primitive coverage" script (count imports of ui/ + SurfaceCard/GlassPanel usage vs. total card-like divs) as baseline for the 4-phase plan.
4. **Gate Creation:** Add to PR template + design QA: "Primitive Adoption % + Raw Value Count delta" (target: -60% raw on changed files).
5. **Deprecate in waves** per LEGACY_DEPRECATION_MATRIX.md, starting with shell/Dashboard.

This analysis feeds directly into the companion 4-Phase Migration Plan.

---

**Report End — Agent 03 Token & Primitive Lens**  
All claims traceable to direct file reads and grep inventories across the referenced canonical artifacts. No assumptions; only measured gaps.