# MASTER UI/UX IMPLEMENTATION PLAN
**Care Indeed Home Health - UI/UX Reconstruction Program**

**Location:** `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/`  
**Version:** 1.5  
**Last Updated:** 2026-05-16

---

## Purpose

This is the execution control document for reconstruction work. It defines the implementation sequence as a strict 4-phase plan, links each phase to authoritative artifacts, and sets measurable exit criteria before proceeding.

This file does not duplicate checklist details. Detailed requirements remain in their source files.

---

## Non-Negotiable Rules

1. Preserve the constrained page-view contract on desktop/laptop to magnify glassmorphism.
2. Use canonical primitives from `src/policy/components/ui/index.ts`.
3. No new raw visual values on target surfaces (colors, spacing, typography, motion).
4. Mobile/tablet must pass responsive matrix rules and avoid horizontal scroll.
5. Accessibility gates must pass per surface before phase exit.

---

## Authoritative Artifact Map

- **Program plan and sequencing:** `docs/UIUX/UIUX_RECONSTRUCTION_MASTER_PLAN.md`
- **Canonical system rules:** `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md`
- **Dashboard kickoff package:** `DASHBOARD_RECONSTRUCTION_KICKOFF.md`
- **Dashboard acceptance checklist (single source):** `SURFACE_CHECKLISTS/Dashboard.md`
- **Responsive acceptance matrix:** `RESPONSIVE_ACCEPTANCE_MATRIX.md`
- **Accessibility risk register:** `ACCESSIBILITY_GAP_LIST.md`
- **Reference capture protocol:** `REFERENCE_CAPTURE_PROTOCOL.md`
- **Phase 1 baseline audit:** `PHASE_1_BASELINE_AUDIT.md`
- **Phase 1 dashboard inventory:** `PHASE_1_DASHBOARD_RAW_VALUE_INVENTORY.md`
- **Legacy migration map:** `LEGACY_DEPRECATION_MATRIX.md`
- **Primitive inventory:** `primitives/CATALOG.md`
- **Token contract and artifacts:** `tokens/README.md`, `tokens/tokens.json`, `tokens/generated/tokens.css`

---

## 4-Phase Implementation Plan

### Phase 1 - Canonical Design System Lock
**Goal:** Lock governance and remove interpretation drift before shell/surface rebuild starts.

**Primary scope**
- Finalize canonical visual and interaction rules.
- Lock token contract, naming, and allowed usage.
- Lock primitive ownership and adoption boundaries.
- Prepare baseline audits and assignments for Dashboard reference surface.

**Inputs**
- `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md`
- `tokens/README.md`
- `primitives/CATALOG.md`
- `LEGACY_DEPRECATION_MATRIX.md`

**Required outputs**
- Canonical rules are link-complete and non-contradictory.
- Token source of truth exists and is referenced consistently.
- Dashboard kickoff package is assignment-ready.

**Exit criteria**
- All Phase 1 governance docs contain no unresolved contradictions.
- Dashboard checklist exists and is designated as single source for acceptance.
- Token artifacts and intended production paths are documented consistently.

---

### Phase 2 - Core Shell and Command Center Rebuild
**Goal:** Rebuild shell architecture to enforce consistent framing, command hierarchy, and mode behavior.

**Primary scope**
- Reconstruct shell frame, topbar, nav rails, and content frame behavior.
- Enforce 4-sided framed page-view behavior at >=1024px.
- Normalize command-group structure across primary shell surfaces.
- Validate responsive behavior against matrix and reduced-motion requirements.

**Inputs**
- `docs/UIUX/UIUX_RECONSTRUCTION_MASTER_PLAN.md` (Phase 2 section)
- `RESPONSIVE_ACCEPTANCE_MATRIX.md`
- `primitives/CATALOG.md`
- `tokens/tokens.json`

**Required outputs**
- Shell architecture implementation spec/checklist for engineering use.
- Measurable acceptance tests for constrained framing and command hierarchy.
- Regression captures for desktop/laptop/tablet/mobile shell states.

**Exit criteria**
- Shell routes consistently preserve framed glass composition on desktop/laptop.
- Core command groups use canonical primitives and tokenized values.
- Responsive and accessibility checks pass on shell interactions.

---

### Phase 3 - Operational Surface Reconstruction
**Goal:** Rebuild high-frequency operational surfaces using the hardened shell + primitives + token contract.

**Primary scope**
- Dashboard first (reference surface), then Evidence, Audit, Calendar, My Tasks.
- Remove legacy surface families listed in deprecation matrix for targeted scope.
- Standardize accessibility and responsive behavior per surface checklist.
- Produce before/after proof and regression evidence per reconstructed surface.

**Inputs**
- `DASHBOARD_RECONSTRUCTION_KICKOFF.md`
- `SURFACE_CHECKLISTS/Dashboard.md`
- `ACCESSIBILITY_GAP_LIST.md`
- `LEGACY_DEPRECATION_MATRIX.md`

**Required outputs**
- Surface-specific checklists for each reconstructed page.
- Drift-register progress updates and closure status by item.
- Playwright visual regression evidence for each reconstructed surface.

**Exit criteria**
- Dashboard passes all checklist gates and serves as template surface.
- Each reconstructed surface shows no new raw values and no duplicate local primitives.
- Surface-level accessibility risks are closed or explicitly waived with owner and date.

---

### Phase 4 - Experience Maturity and Finalization
**Goal:** Finish cross-surface quality, consistency, and launch readiness.

**Primary scope**
- Resolve remaining accessibility and responsive edge cases.
- Validate motion/reduced-motion parity and light/dark parity.
- Remove remaining legacy aliases and finalize migration guardrails.
- Complete final readiness package and sign-off workflow.

**Inputs**
- Phase 1-3 outputs
- `ACCESSIBILITY_GAP_LIST.md`
- `RESPONSIVE_ACCEPTANCE_MATRIX.md`
- `docs/UIUX/PHASE1_EXIT_CHECKLIST.md` (and successor phase checklists)

**Required outputs**
- Final acceptance report covering shell + all reconstructed surfaces.
- Closed/open risk register with owners and target dates.
- Final sign-off package linking evidence, screenshots, and validations.

**Exit criteria**
- Cross-surface behavior is consistent in desktop/mobile and dark/light.
- High-severity accessibility issues are closed.
- Program sign-off granted by Design + Engineering leads.

---

## Readiness Status (Phase 1 Token Lock - 2026-05-16)

1. Reference-capture requirements normalized (PR-attached approved captures).
2. Owner assignment workflow in `PHASE_1_READINESS_GATE.md` (pending kickoff).
3. Token contract v0.2.0-phase1 locked with full typography/shadow/overlay/dimension sets; generators + generated/ updated; all Dashboard inventory gaps closed.
4. First migration PR scope (50 replacements) ready per `PHASE_1_DASHBOARD_RAW_VALUE_INVENTORY.md`.

---

## Phase 1 Active Status

- Phase 1 token contract locked (v0.2.0-phase1) — all 5 gap categories from Dashboard inventory resolved in `tokens/tokens.json` + generated CSS.
- Week 1 baseline complete; raw-value inventory + mapping finalized.
- Owner assignment pending formal kickoff; first migration PR ready (50+ --ci-* replacements).
- Current baseline metrics tracked in `PHASE_1_BASELINE_AUDIT.md`; gate in `PHASE_1_READINESS_GATE.md`.

---

## Execution Order

Work must proceed Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 with explicit exit confirmation at each phase boundary.

No phase may start if the prior phase has unresolved high-severity blockers.

---

**End of Master Implementation Plan**