# Overlap Analysis — SuperGrokHeavy Stabilization vs Unified MVP Plan

**Method:** Each of the 46 detailed Stabilization tasks (from `STABILIZATION_DETAILED_TASK_BREAKDOWN.md`) was checked against the Unified MVP plan with line-level grep. A task is marked:

- **OWNED-BY-MVP** — the MVP plan already specifies this task with the same intent and scope. Doing it twice is double-counting.
- **PARTIAL** — the MVP plan specifies the substance but leaves a documentation/spec/owner-assignment artifact unspecified. The artifact is what Stabilization should produce.
- **STABILIZATION-UNIQUE** — the MVP plan does not specify this task. Genuinely new work.

All MVP line citations are from `_Heavy/Fix-2026-05-14/UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md`.

---

## Workstream 1 — Navigation & History Stability (8 tasks)

| ID | Stabilization Task | Status | MVP Plan Citation | Notes |
|----|---|---|---|---|
| N-01 | Remove global touch swipe from `CommandCenterLayout.tsx` | **OWNED-BY-MVP** | L840: "Remove global swipe navigation (touch handlers) outside explicitly scoped contexts" | Identical scope. |
| N-02 | Remove global ArrowLeft/ArrowRight from `CommandCenterLayout.tsx` | **OWNED-BY-MVP** | L841: "Remove global left/right arrow key navigation from `CommandCenterLayout.tsx`" | Word-for-word identical. |
| N-03 | Audit `Navigate` components using `replace: true` in `App.tsx` | **PARTIAL** | L842: "Restore predictable browser history behavior (no more random jumps on Back button)" | MVP names the goal; Stabilization owns the audit artifact. |
| N-04 | Remove `replace: true` from normal internal routes (CES, Evidence, eCign, Onboarding V2, Calendar) | **PARTIAL** | L842, L847: "Browser Back/Forward tested and passing on 8+ key flows" | Goal is MVP-owned; specific cleanup is Stabilization. |
| N-05 | Create follow-up list of ambiguous `replace: true` cases | **STABILIZATION-UNIQUE** | (none) | Pure deferral artifact. |
| N-06 | Standardize modal + drawer Esc + browser-back behavior | **OWNED-BY-MVP** | L843: "Validate modal/drawer escape behavior (Esc key + browser back) across all major surfaces" | Identical. |
| N-07 | Audit + fix deep-link restoration on CES/Evidence/eCign | **STABILIZATION-UNIQUE** | (no explicit deep-link audit in MVP) | Genuine gap. |
| N-08 | Document new navigation behavior | **STABILIZATION-UNIQUE** | (none) | Documentation artifact. |

**Summary:** 3 OWNED-BY-MVP, 2 PARTIAL, 3 STABILIZATION-UNIQUE.

---

## Workstream 2 — Runtime & Session Resilience (8 tasks)

| ID | Stabilization Task | Status | MVP Plan Citation | Notes |
|----|---|---|---|---|
| R-01 | Design `FormStateManager` utility (localStorage + draft) | **OWNED-BY-MVP** | L762: "Implement robust form draft persistence with automatic rehydration on browser refresh for all major forms"; L122: "auto-save on every change + `visibilitychange`/`pagehide`/`beforeunload`" | MVP plan mandates the capability; building a `FormStateManager` is the implementation. |
| R-02 | Integrate persistence into eCign `FormSigningWorkspace.tsx` | **OWNED-BY-MVP** | L762 (lists "eCign" explicitly); L730: "Zero `visibilitychange` + IndexedDB serialization for form fields + partial signatures" | Identical. Note Protected Subsystem rules in MVP §C6 (L905). |
| R-03 | Integrate persistence into Onboarding V2 forms | **OWNED-BY-MVP** | L762 (lists "Onboarding V2 gates" explicitly) | Identical. |
| R-04 | Add `visibilitychange` + `beforeunload` listeners | **OWNED-BY-MVP** | L763: "Add `visibilitychange` + `beforeunload` listeners to save in-progress work on interruption" | Word-for-word. |
| R-05 | State staleness detection on CES + Evidence fetches | **STABILIZATION-UNIQUE** | (none — MVP doesn't specify staleness detection) | Genuine gap. |
| R-06 | Long-idle session recovery (overnight draft) | **STABILIZATION-UNIQUE** | (none) | Genuine gap. MVP focuses on refresh/interruption, not long-idle. |
| R-07 | Standardize modal/drawer re-entry after back/escape | **OWNED-BY-MVP** | L843 (covered with N-06) | Same scope as N-06. |
| R-08 | Partial-save at logical step boundaries (Onboarding V2) | **PARTIAL** | L122: "auto-save on every change" — covers continuous, not step-boundary | Step-boundary explicit checkpoints are uncovered. |

**Summary:** 4 OWNED-BY-MVP, 1 PARTIAL, 3 STABILIZATION-UNIQUE.

---

## Workstream 3 — Mobile & Field Survivability (8 tasks)

| ID | Stabilization Task | Status | MVP Plan Citation | Notes |
|----|---|---|---|---|
| M-01 | Real-device UAT on iOS Safari + Android Chrome, normal + throttled | **OWNED-BY-MVP** | L778–L779: "Execute dedicated real-device UAT on iOS Safari and Android Chrome for core flows…Test under throttled (3G/LTE) and intermittent network conditions"; L1066 "5-tier strategy" tier 3 | Identical. |
| M-02 | One-handed usability + 48px touch targets | **OWNED-BY-MVP** | L780: "Validate one-handed usability, 48px+ touch targets, and thumb-zone placement"; L96 mission statement | Identical. |
| M-03 | Evidence capture/upload under throttled + intermittent network | **OWNED-BY-MVP** | L770: "Weak network simulation during evidence upload"; L329: blob persistence under refresh | Identical. |
| M-04 | eCign signing under interruption (call, background, low battery) | **OWNED-BY-MVP** | L781: "Test interruption/resume behavior (call, background, low battery, screen lock)" | Word-for-word. |
| M-05 | CES task completion mobile only, one-handed | **OWNED-BY-MVP** | L778, L96 | Covered. |
| M-06 | Onboarding V2 gate progression on mobile | **OWNED-BY-MVP** | L778 (Onboarding V2 listed) | Covered. |
| M-07 | Mobile rotation survivability on signature pads | **PARTIAL** | L96: "rotation" mentioned in mission; not in PART II tests | MVP mission lists rotation but PART II UAT spec doesn't enumerate it. |
| M-08 | Document mobile issues + create follow-up list | **STABILIZATION-UNIQUE** | (none) | Documentation artifact. |

**Summary:** 6 OWNED-BY-MVP, 1 PARTIAL, 1 STABILIZATION-UNIQUE.

---

## Workstream 4 — Protected Systems & Rollback Readiness (8 tasks)

| ID | Stabilization Task | Status | MVP Plan Citation | Notes |
|----|---|---|---|---|
| P-01 | Formally define eCign + Evidence + CES identity as Protected Subsystems | **OWNED-BY-MVP** | L794–L795: "Formally designate eCign signing + print pipeline as Protected Subsystem…Formally designate Evidence Center…as Protected Subsystem"; §C6 (L905) frozen-files rule | Identical. CES identity protection is enforced via `verify:task-identity` (L1066). |
| P-02 | Create Rollback Trigger Matrix | **OWNED-BY-MVP** | L825: "Create and document explicit Rollback Trigger Matrix" | Word-for-word. |
| P-03 | Assign named rollback owners per subsystem | **OWNED-BY-MVP** | L826: "Assign named rollback owners for each major subsystem (eCign, Evidence, CES, Navigation, Design System)" | Word-for-word. |
| P-04 | Create Rollback Execution Checklist | **PARTIAL** | L1131–1132 ("Per-package…rollback = `git revert` of merge commit") | MVP defines mechanism; Stabilization adds the human checklist artifact. |
| P-05 | Execute one rollback drill on non-critical surface | **OWNED-BY-MVP** | L827: "Execute at least one full rollback drill on a non-critical surface before any protected system is touched" | Identical. |
| P-06 | Document subsystem isolation boundaries | **OWNED-BY-MVP** | L828: "Define clear subsystem isolation boundaries so a rollback in one area does not cascade" | Identical. |
| P-07 | Post-rollback validation checklist | **STABILIZATION-UNIQUE** | (not explicit) | Genuine artifact gap. |
| P-08 | Communication plan for rollback events | **STABILIZATION-UNIQUE** | (not explicit) | Genuine artifact gap. |

**Summary:** 5 OWNED-BY-MVP, 1 PARTIAL, 2 STABILIZATION-UNIQUE.

---

## Workstream 5 — Design System Enforcement (6 tasks)

| ID | Stabilization Task | Status | MVP Plan Citation | Notes |
|----|---|---|---|---|
| D-01 | ESLint rules block raw hex/rgb + enforce `--ci-*` | **OWNED-BY-MVP** | L810: "Implement ESLint rules to block raw hex/rgb values and non-`--ci-*` tokens in new or modified code"; L646: "Extend `scripts/verifyUiDesignSystem.ts` with hex/inline-style drift scan"; L1092 | Word-for-word. MVP also names the existing tool to extend (`scripts/verifyUiDesignSystem.ts`). |
| D-02 | Visual regression PR requirement for `ui/` components | **OWNED-BY-MVP** | L811: "Add visual regression requirement (Playwright or manual baseline) to PR checklist for any change touching `ui/` components"; L548 visual regression tier | Identical. |
| D-03 | Glass-layer max-2 enforcement | **OWNED-BY-MVP** | L812: "Enforce max-2 glass layers (Layer 3 only for elevated modals in portal) via lint rule or review checklist"; §C1 (L900) — note conflict resolved as **max 3 with Layer 3 portal-only** | MVP arbitrated this; Stabilization needs to use the MVP-arbitrated rule, not the original max-2. |
| D-04 | Deprecation plan for parallel components (CesCard, local TabButton, etc.) | **OWNED-BY-MVP** | L813: "Begin deprecation of parallel component families (CesCard, local TabButton, etc.) in favor of `ui/` primitives"; L74 enforces `ui/` primitives | Word-for-word. |
| D-05 | Audit remaining parallel styling on high-traffic surfaces | **OWNED-BY-MVP** | L63–L64: "2313+ inline styles + parallel palettes…dominate"; L629 quantified inventory; Lead 13 audit reports referenced throughout | The audit was already performed by Leads 1, 13, 16. Re-doing it is waste. |
| D-06 | Update internal design system contribution guidelines | **STABILIZATION-UNIQUE** | (none) | Documentation artifact. |

**Summary:** 5 OWNED-BY-MVP, 0 PARTIAL, 1 STABILIZATION-UNIQUE.

---

## Workstream 6 — Validation, UAT & Governance Infrastructure (8 tasks)

| ID | Stabilization Task | Status | MVP Plan Citation | Notes |
|----|---|---|---|---|
| V-01 | Define explicit Go/No-Go gates (P0 runtime, mobile, integrity, navigation) | **OWNED-BY-MVP** | L857–L860: "Define explicit P0 runtime gates…P0 mobile survivability gates…P0 eCign and Evidence integrity gates…deployment hold conditions"; Lead 16 §943 + §1142 + §1144 | MVP plan has the binding Lead 16 Go/No-Go assessment. |
| V-02 | Runtime Validation Matrix per workstream | **OWNED-BY-MVP** | L1066: "5-tier strategy" — covers automated, manual browser, mobile UAT, compliance lock regression, visual regression | Already exists. |
| V-03 | Mobile Field UAT test cases (real device + degraded network) | **OWNED-BY-MVP** | L1066 tier 3: "Mobile Field UAT Cohort (12–15 clinicians + 4–6 DONs + 3–5 surveyors on real devices under one-handed/gloved/weak-signal/interrupted conditions)" | More specific than the Stabilization version. |
| V-04 | Define rollback authority owners + escalation path | **OWNED-BY-MVP** | L826 (overlaps P-03) | Same as P-03. |
| V-05 | Build post-rollback validation checklist | **STABILIZATION-UNIQUE** | (overlaps P-07) | Same as P-07; redundant within Stabilization itself. |
| V-06 | UAT feedback collection process for the 100 users | **STABILIZATION-UNIQUE** | (none — MVP focuses on field cohort, not 100-user feedback intake) | Genuine gap. |
| V-07 | Define success metrics for Stabilization phase | **STABILIZATION-UNIQUE** | (MVP defines its own success metrics in Lead 16) | Only meaningful if Stabilization continues as a separate track. |
| V-08 | Schedule + run final Go/No-Go review | **OWNED-BY-MVP** | Lead 16 §943: "Go/No-Go MVP Readiness Assessment"; §1142–1144 final checklist | Identical. |

**Summary:** 5 OWNED-BY-MVP, 0 PARTIAL, 3 STABILIZATION-UNIQUE (one is internally redundant).

---

## Aggregate Result

| Workstream | Total | OWNED-BY-MVP | PARTIAL | STABILIZATION-UNIQUE |
|---|---|---|---|---|
| WS1 Navigation | 8 | 3 | 2 | 3 |
| WS2 Runtime | 8 | 4 | 1 | 3 |
| WS3 Mobile | 8 | 6 | 1 | 1 |
| WS4 Protected + Rollback | 8 | 5 | 1 | 2 |
| WS5 Design System | 6 | 5 | 0 | 1 |
| WS6 Validation | 8 | 5 | 0 | 3 (1 internally redundant) |
| **Total** | **46** | **28 (61%)** | **5 (11%)** | **13 (28%, of which 1 redundant = 12 net)** |

**Net truly Stabilization-unique tasks: 12** (out of 46 originally claimed).

---

## Cross-document overlaps within SuperGrokHeavy itself

The folder also contains internal duplication that inflated apparent scope:

- `STABILIZATION_PRECURSOR_ACTION_ITEMS.md` (16 items) ≡ `STABILIZATION_PLAN_AND_ACTION_ITEMS.md` (same 7 categories) ≡ `STABILIZATION_ACTION_ITEMS_FROM_16_AGENT_REVIEW.md` (same 7 categories with IDs N-01 etc.). **Three docs, one task list.**
- `STABILIZATION_GO_NO_GO_CHECKLIST.md` re-states V-01..V-04 + V-08 in checklist form. **Same content, different format.**
- `STABILIZATION_ROLLBACK_PLAYBOOK.md` re-states P-02..P-06 + adds the (also unique-only) communication template. **Mostly restated.**
- `STABILIZATION_VALIDATION_AND_TESTING_MATRIX.md` re-states the per-task validation columns from `STABILIZATION_DETAILED_TASK_BREAKDOWN.md`. **Restated.**

After collapsing internal duplication, the SuperGrokHeavy folder really has the equivalent of: 1 task list + 1 context doc + 1 master prompt + 1 Phase 1 plan = ~4 documents of new content. The other 8 are restatements.

---

## What This Implies

1. **The MVP plan is the source of truth** for almost all of the work the Stabilization folder claims as its own.
2. **The "3-week Stabilization timeline" is fiction.** Once you remove duplicated work, ~12 tasks remain — most are documentation artifacts that take 15–30 minutes each. ~3–5 working days of real work, parallelizable.
3. **The "32 agents on Stabilization" plan is also fiction.** Once you remove duplicated work, you can saturate ~6–8 agents with Stabilization-unique work; the remaining 24 should be working on the MVP plan directly (which is what they'd be doing anyway).
4. **Calling MVP Wave 0 work "Stabilization Phase 1 Tonight" is mislabeling.** It's MVP Wave 0. Tonight's plan (`04_PHASE_1_TONIGHT_REALISTIC.md`) re-labels it correctly.

See `02_STABILIZATION_TASK_BREAKDOWN_REVISED.md` for the same 46 tasks with realistic minute estimates and overlap status applied.
