# UI/UX Reconstruction Master Plan

**Canonical Location:** `docs/UIUX/UIUX_RECONSTRUCTION_MASTER_PLAN.md`

## Planning Scope (No Implementation)

This document is a reconstruction roadmap only.  
No UI implementation changes are defined here beyond planning direction.

All UI/UX governance documents now live under `docs/UIUX/`. The previous scattered location under `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/` is considered archival source material.

---

## 1) Diagnosis: Why Refinement Drift Happened

### What the original `UIUX_Audit` vision intended

From the original UIUX_Audit design artifacts (now consolidated in `docs/UIUX/design-references/`), the canonical intent was:

- **Single canonical brand** (Care Indeed only; no production dual-brand drift)
- **Strict glass architecture** (Layer 0/1/2 default, Layer 3 by exception)
- **Mobile-first operational UX** (one-handed workflows, bottom-sheet-first on mobile, 44px+ targets)
- **Token-first implementation** (no raw values, semantic tokens, governed primitives)
- **Canonical component system** (`ui/*` primitives first, local one-off UI discouraged)
- **Phased rollout strategy** (strangler migration, high-frequency workflows first)
- **Governed design system lifecycle** (handoff package, visual regression strategy, governance/release process)

### What was implemented (partial)

- High-visibility surfaces gained stronger shell/dashboard composition.
- Some reusable classes were introduced (`ci-*` utility/premium/maturity classes).
- Playwright screenshot validation discipline improved significantly.
- Mobile usability constraints (touch targets, bottom sheet usage in some flows) improved.

### What was skipped or never fully reintegrated

- **Canonical single-brand lock**: CI-ION legacy semantics and dual-brand framing still present in shell/tokens.
- **Canonical primitives-first adoption**: major operational surfaces remain mostly handcrafted with local styles.
- **Token pipeline enforcement**: `tokens.json -> generated CSS/TS` workflow and lint enforcement were not fully activated.
- **Governance stack**: no active Storybook-style canonical component governance flow in practice.
- **UIUX_Audit rollout discipline**: phased migration model was replaced by visual wave-based interpretation.

### What drifted

- Repeated wave-specific class layers (`ci-premium-*`, `ci-executive-*`, `ci-maturity-*`) created a parallel styling system.
- Shell and surface identity became interpretation-driven rather than system-driven.
- Typography and spacing cadence evolved per-wave instead of from a locked tokenized scale.

### What became over-refined without strategic value

- Incremental top-layer polish cycles without full primitive/token/system reconstruction.
- Repeated atmosphere tuning before canonical system lock.
- High screenshot output quality, but incomplete design-system substrate beneath it.

---

## 2) Canonical Target (Reconstruction End State)

The target is a **single enterprise UI operating system**, not a sequence of polish waves:

- One canonical brand language and mode policy
- One shell architecture and navigation contract
- One primitive/component hierarchy
- One token/elevation/typography/spacing system
- One responsive philosophy across desktop/laptop/tablet/mobile
- One operational UX architecture for Dashboard, Evidence, Audit, Calendar, My Tasks, onboarding/UAT
- **Constrained page view contract** (to magnify glassmorphism): No page view may render its primary content (single main glass card or multiple card glasses) full-bleed. Every surface MUST maintain a consistent 4-sided border/margin from the frame so the backdrop remains visible around the glass edges — this is the mechanism that makes translucency, blur, edge glow, and depth legible. Matches the Top Picks mockups exactly. The shell inset is the foundation; inner surfaces must respect it.

This ends interpretive premiumization and replaces it with governed product architecture.

---

## 3) Freeze / Rebuild / Refine Boundaries

## Must remain frozen

- CES architecture
- Workflow engine
- Evidence architecture
- Task identity and canonical artifact flow
- PM synchronization
- Backend/eCign architecture
- Protected/frozen systems

## Must be rebuilt (UI architecture layer)

- Canonical design token contract and enforcement
- Canonical shell and navigation primitives
- Core reusable component primitives for operational surfaces
- Responsive behavior contract and breakpoint orchestration
- **Constrained page view + consistent 4-sided border contract** (single-card and multi-card surfaces alike must respect the frame shown in Top Picks mocks) — the constraint exists specifically **to magnify the glassmorphism effect** by ensuring the backdrop remains visible around all glass edges
- Canonical dashboard orchestration model

## Must be refined (not rebuilt)

- Existing functional workflows and route structure
- Existing successful mobile ergonomics
- Existing Playwright validation harness pattern

---

## 4) Gap Matrix (Implemented vs Missing)

- **Shell systems:** Partially upgraded; missing canonical primitive contract and legacy-brand purge.
- **Operational hierarchy:** Improved visually; missing cross-surface system lock.
- **Dashboard philosophy:** Elevated; missing canonical data-story composition template.
- **Command-center philosophy:** Present; still class-layered instead of primitive-layered.
- **Evidence workflows:** Better framing; missing evidence-capture canonical UX spec integration.
- **Mobile UX:** Better than baseline; missing complete responsive matrix conformance.
- **Navigation architecture:** Improved; missing finalized canonical nav model by breakpoint/role.
- **Spacing/typography/card/elevation systems:** partially tuned; not fully token-locked.
- **Guided UAT/onboarding philosophy:** improved captures; missing canonical narrative architecture.

---

## 4.5) Cross-Cutting Layout Rule — Constrained Page Views (Non-Negotiable)

**Rule (derived from canonical mocks):**  
No page view in the product may ever render its primary content area as full-bleed across the entire viewport or the shell's inner boundary. Every surface — whether built from **a single main glass card** or from **a composition of multiple card glasses** — MUST preserve a consistent, visible border/margin on **all four sides**.

**Design rationale — magnify the glassmorphism effect**  
The 4-sided inset is not decorative padding. It is a deliberate architectural decision **to magnify the glassmorphism effect**. When the glass card(s) are inset from the viewport/shell edges, the backdrop layer (TravelightBG in dark mode, the subtle light gutter in Care Indeed light mode) remains visible as a continuous frame around the entire composition. This allows the eye to perceive:
- True translucency and blur (the glass is seen *against* a distinct background instead of disappearing at the edges)
- Luminous edge highlights, inner glows, and depth shadows that only read when the glass has breathing room
- Layer separation between the background, the outer shell glass, and any inner cards
- Stronger "floating premium panel" presence — exactly as rendered in the Top Picks mockups

Full-bleed glass surfaces kill this effect: the blur becomes invisible at the edges, the borders lose contrast, and the whole surface collapses visually into the background. The constrained frame is therefore a core part of the glassmorphism language, not an afterthought.

This is the defining visual signature shown in the reference mocks:
- `Top Picks/11_OnboardingActivation_Desktop_v2.jpg`
- `Top Picks/12_EvidenceCapture_Desktop_v2.jpg`
  (original mockups remain in `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/mockup/Top Picks/`; the visual contract is now locked in `CANONICAL_UI_SYSTEM_SPEC.md` Section 4)
- (and the mobile counterparts)

**Implementation implications**
- The outer `CommandCenterLayout` shell already provides the base 4-sided inset on desktop (clamp 16–28px). Inner surfaces must compose **inside** that frame **specifically to preserve the backdrop framing that magnifies glassmorphism**.
- Page-level root containers may never use `h-full w-full` + zero padding in a way that pushes glass edges to the shell boundary on all sides — doing so destroys the depth and blur that the glassmorphism system is designed to deliver.
- Multi-card layouts must still maintain outer breathing room around the entire group (the "page view" as a whole is framed) so the collective glass composition reads as a single elevated layer against the backdrop.
- Mobile follows the same principle inside the phone bezel / safe area; the content never kisses the device edges without the intended internal margin shown in the mocks, again to keep the glass effect legible.
- Exceptions (rare): true full-canvas tools such as dedicated print-preview or signature canvas modes must be explicitly flagged and use a different visual treatment (they are not "page views" in the operational surface sense and do not need the glassmorphism magnification treatment).

This rule is elevated to the same priority as token discipline and primitive adoption. Any Phase 3 surface delivery that violates the 4-sided border contract is considered incomplete.

---

## PHASE 1 — CANONICAL DESIGN SYSTEM LOCK

### Goal
Lock one unambiguous visual/interaction system before any further surface rebuilds.

### Scope

- Lock canonical visual language (brand/mode policy, no dual-brand semantics)
- Lock shell philosophy and max layer policy
- Lock typography hierarchy and spacing framework
- Lock density framework by surface type (command, list, detail, form)
- Lock card/elevation philosophy and motion philosophy
- Lock mobile-first and responsive behavior matrix as release criteria

### Required outputs

- `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md` (single source of truth)
- Token contract (`tokens.json` + generated CSS/TS outputs)
- Primitive map (`ui/*` ownership + allowed usage)
- Mode policy contract (dark/light usage by workflow class)
- Enforcement rules (lint + PR checklist + design QA checklist)

### Measurable exit criteria (Hardened v2 — Target ≥9/10 alignment)

- Zero unresolved ambiguity on brand/mode/layer policy
- Token pipeline active and documented
- New UI code rule: no raw values on canonical surfaces
- Design governance gate active for target surfaces
- Hardened Phase 1 Exit Checklist v2 fully satisfied (including Print & Legal Evidence Contract, CES policy decision, Onboarding/Journey resolution, and living `DRIFT_REGISTER.md` with top 25 items from the original audit)
- 16-point alignment review re-run and average score across all perspectives ≥ 9.0
- At least one reference surface demonstrates the full constrained glassmorphism + primitive + token stack against the original Top Picks mocks and audit findings

---

## PHASE 2 — CORE SHELL + COMMAND CENTER REBUILD

### Goal
Rebuild shell/navigation as canonical product infrastructure (not visual tuning).

### Scope

- Rebuild `CommandCenterLayout` against locked primitives/tokens
- Reconstruct nav architecture by breakpoint (desktop/laptop/tablet/mobile)
- Rebuild command hierarchy zones (identity, navigation, actions, context)
- Implement responsive shell orchestration contract (including constrained desktop container policy) **and enforce the page view border contract on every surface** (the rule exists **to magnify the glassmorphism effect**): every operational page (single-card or multi-card) must preserve consistent 4-sided margins so the backdrop frames the glass edges, making blur, translucency, and depth visible. Full-bleed is forbidden except for rare exempted full-canvas tools. Directly derived from the Top Picks mockups.
- Normalize topbar/subnav/command rail rhythm across all operational routes

### Required outputs

- `SHELL_ARCHITECTURE_V2.md`
- Canonical shell primitives (`ShellTopbar`, `ShellNav`, `ShellContextRail`, `ShellSurface`)
- Breakpoint-specific shell behavior table
- Shell regression capture baseline set

### Measurable exit criteria

- No route-specific shell hacks on target surfaces
- No legacy CI-ION shell semantics on production shell
- Responsive shell passes matrix at desktop/laptop/tablet/mobile
- Every target surface (Dashboard, Evidence, Audit, Calendar, etc.) demonstrates consistent 4-sided breathing room / border from shell frame in both single-card and multi-card compositions **so that glassmorphism (backdrop framing, blur, edge definition) is maximized** (verified against Top Picks mockups)

---

## PHASE 3 — OPERATIONAL SURFACE RECONSTRUCTION

### Goal
Rebuild high-frequency operational surfaces on canonical primitives and UX patterns.

### Scope (priority order)

1. Dashboard (hero orchestration + KPI narrative template)
2. Evidence Center (capture/list/detail system + density contract)
3. Audit Mode (readiness hierarchy + status architecture)
4. Calendar (view orchestration + responsive command model)
5. My Tasks (execution-first list architecture)
6. Workflow execution/policy/artifact presentation layers
7. Onboarding/UAT narrative surfaces

### Rebuild model

- Replace handcrafted surface sections with canonical primitives
- Enforce state architecture consistency (loading/empty/error/success)
- Enforce responsive behavior matrix and mobile action ergonomics
- Apply canonical interaction states (hover/focus/active/reduced motion)

### Required outputs

- One surface spec + checklist per target surface
- Primitive adoption report per surface
- Before/after reconstruction captures tied to canonical acceptance criteria

### Measurable exit criteria

- Target surfaces built primarily from canonical primitives
- Visual debt categories closed for target surfaces
- Operational density/readability metrics pass
- No incremental wave-only styling dependencies required

---

## PHASE 4 — EXPERIENCE MATURITY + FINALIZATION

### Goal
Finalize release-grade continuity, onboarding narrative, accessibility, and demo reliability.

### Scope

- Guided UAT architecture normalization
- Onboarding narrative continuity (mobile-first flows)
- Transition/motion finalization using locked motion tokens
- Accessibility hardening (WCAG 2.2 AA on target flows)
- Final density tuning and QA stabilization
- Final production-readiness review package

### Required outputs

- `UX_RELEASE_READINESS_REPORT.md`
- Accessibility audit report (target flows)
- Guided UAT and executive demo storyboard pack
- Final visual regression baseline and acceptance set

### Measurable exit criteria

- Target flows pass accessibility, responsive, and visual regression gates
- Executive demo flow is deterministic and repeatable
- Remaining polish debt documented and intentionally deferred (not drifted)

---

## 5) Sequencing Rules (Non-Negotiable)

- No Phase 2 work before Phase 1 lock is approved.
- No Phase 3 surface reconstruction before shell primitives are stable.
- No Phase 4 polishing before Phase 3 primitive adoption thresholds are met.
- No additional "premiumization" waves outside this phase model.
- **Page view border contract is non-negotiable** (the contract exists **to magnify the glassmorphism effect**): During Phase 3, no surface may be delivered that allows its primary content (single main card glass or multiple card glasses) to eliminate the consistent 4-sided border/margin from the shell inner frame. Eliminating the backdrop frame around the glass destroys the intended depth, blur, and edge presence shown in the Top Picks mockups. This is a hard blocker for Phase 3 sign-off on any surface.

---

## 6) Highest-Priority Reconstruction Targets

1. `CommandCenterLayout` (system root)
2. Dashboard (primary narrative surface)
3. Evidence Center (highest operational/legal sensitivity)
4. Audit Mode (readiness and risk communication)
5. Calendar + My Tasks (daily execution loop)
6. Guided UAT + onboarding continuity

---

## 7) Systems to Leave Untouched

- Backend/data/eCign architecture
- CES/workflow/task identity internals
- Canonical artifact retrieval architecture
- PM synchronization architecture

Only presentation architecture and UX systemization are in scope.

---

## 8) Transformation Metrics (to prevent drift)

- Canonical primitive adoption % on target surfaces
- Raw value count on target surfaces (target: near-zero)
- Responsive matrix pass rate across 4 breakpoints
- Page view border contract compliance rate (all target surfaces maintain consistent 4-sided margins in both single-card and multi-card modes **specifically to magnify glassmorphism via visible backdrop framing**, matching Top Picks mockups)
- Accessibility pass rate on priority workflows
- Visual regression pass rate on canonical capture suite
- Demo/UAT run success rate (no manual recovery steps)

---

## 9) Final Directive

This plan replaces iterative premiumization waves with a single reconstruction program:

- **One canonical UI direction**
- **One implementation roadmap**
- **One visual/operational philosophy** (including the strict constrained page view + consistent 4-sided border contract on every surface — single-card or multi-card — whose explicit purpose is to magnify the glassmorphism effect by keeping the backdrop visible as a frame around the glass, per the Top Picks mockups)
- **One governance model**

No further interpretive polish cycles should proceed outside these four reconstruction phases.
