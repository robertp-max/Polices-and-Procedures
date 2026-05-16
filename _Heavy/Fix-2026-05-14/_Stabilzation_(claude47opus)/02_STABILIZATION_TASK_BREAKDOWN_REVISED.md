# Stabilization Detailed Task Breakdown — REVISED

**Source:** `_Stabilization(SuperGrokHeavy)/STABILIZATION_DETAILED_TASK_BREAKDOWN.md`
**Revision rules (per user instruction):**
- **Same 46 task IDs.** No additions. No removals. No re-scoping.
- **Each task tagged** with overlap status from `01_OVERLAP_ANALYSIS_WITH_UNIFIED_MVP.md`.
- **Time estimates are honest single-agent minutes** (no inflation, no "with 32 agents in parallel" math). For parallelization, see `03_REALISTIC_TIMELINE.md`.
- **Codebase grounding:** estimates assume the actual repo (~660 TS/TSX files, real CommandCenterLayout, real eCign Protected Subsystem rules from MVP §C6).

**Time legend:**
- All times are **single agent, focused, no rework**. Add 30–50% for first-attempt rework.
- "Human-bound" = no agent can complete this; the value is human time gated by calendar/availability.
- "Doc" = pure markdown deliverable; agent can complete reliably.

**Overlap legend:**
- 🟥 **OWNED-BY-MVP** — already specified in the Unified MVP plan; doing it here is double-work. Recommendation: **defer to MVP execution**, do not run a parallel Stabilization track for it.
- 🟨 **PARTIAL** — MVP specifies the goal; Stabilization owns a discrete artifact (audit, list, checklist). Keep, but coordinate with MVP track.
- 🟩 **STABILIZATION-UNIQUE** — not in MVP plan. Do here.

---

## Workstream 1 — Navigation & History Stability

| ID | Task | Overlap | Single-agent time | Notes |
|----|---|---|---|---|
| N-01 | Remove global touch swipe from `CommandCenterLayout.tsx` | 🟥 OWNED-BY-MVP (L840) | **10 min** | Single file, well-bounded. MVP Wave 0 should own this. |
| N-02 | Remove global ArrowLeft/ArrowRight from `CommandCenterLayout.tsx` | 🟥 OWNED-BY-MVP (L841) | **5 min** | Same file, batch with N-01. |
| N-03 | Audit `replace: true` in `App.tsx` | 🟨 PARTIAL | **15–25 min** | Audit + write findings. Codebase has many `Navigate replace` patterns — needs careful read. |
| N-04 | Remove `replace: true` from CES, Evidence, eCign, Onboarding V2, Calendar routes | 🟨 PARTIAL | **20–35 min** | Depends on N-03. Risk: breaking legacy aliases — need test of each removal. |
| N-05 | Create follow-up list of ambiguous `replace: true` cases | 🟩 UNIQUE | **10 min (doc)** | Trivial deferral artifact. |
| N-06 | Standardize modal + drawer Esc + browser-back behavior | 🟥 OWNED-BY-MVP (L843) | **45–90 min** | Repo has many drawer/modal patterns. **Real time is dominated by audit count, not edit complexity.** MVP Wave should own. |
| N-07 | Audit + fix deep-link restoration on CES/Evidence/eCign | 🟩 UNIQUE | **45–75 min** | Genuine work. Two phases: audit (30 min) + fixes (15–45 min depending on findings). |
| N-08 | Document new navigation behavior | 🟩 UNIQUE | **20–30 min (doc)** | Depends on N-01 through N-04 being merged. |

**Workstream total honest single-agent time:** ~170–280 min (~3–4.5 hours).
**Of which Stabilization-unique:** N-05 + N-07 + N-08 = ~75–115 min (~1.5–2 hours).

---

## Workstream 2 — Runtime & Session Resilience

| ID | Task | Overlap | Single-agent time | Notes |
|----|---|---|---|---|
| R-01 | Design `FormStateManager` utility | 🟥 OWNED-BY-MVP (L762) | **60–90 min** | Real implementation. MVP plan also calls for IndexedDB-class for evidence (L329) — coordinate. |
| R-02 | Integrate persistence into eCign `FormSigningWorkspace.tsx` | 🟥 OWNED-BY-MVP (L762) | **45–75 min** | **Protected Subsystem (MVP §C6).** Owner-led patches only. Don't do this without MVP coordination. |
| R-03 | Integrate persistence into Onboarding V2 forms | 🟥 OWNED-BY-MVP (L762) | **45–60 min** | After R-01. |
| R-04 | Add `visibilitychange` + `beforeunload` listeners | 🟥 OWNED-BY-MVP (L763) | **20–30 min** | Lightweight; can ride on R-01. |
| R-05 | State staleness detection on CES + Evidence | 🟩 UNIQUE | **60–90 min** | Real design + impl. Lightweight check + UI affordance. |
| R-06 | Long-idle session recovery (overnight draft) | 🟩 UNIQUE | **30–45 min** | Mostly extends R-01 with TTL + staleness check. |
| R-07 | Modal/drawer re-entry after back/escape | 🟥 OWNED-BY-MVP (overlaps N-06) | **30–45 min** | Folds into N-06; do once. |
| R-08 | Partial-save at logical step boundaries (Onboarding V2) | 🟨 PARTIAL | **60–90 min** | Step-boundary checkpoint logic on top of R-01. |

**Workstream total:** ~350–525 min (~6–9 hours).
**Of which Stabilization-unique:** R-05 + R-06 = ~90–135 min.

---

## Workstream 3 — Mobile & Field Survivability

| ID | Task | Overlap | Single-agent time | Notes |
|----|---|---|---|---|
| M-01 | Real-device UAT on iOS Safari + Android Chrome | 🟥 OWNED-BY-MVP (L778–L779) | **Human-bound: 4–8 hrs human time per device** | No agent can do this. Agents can only write the test scripts (~30 min). MVP §1066 already commits to a 12–15 clinician + DON cohort. |
| M-02 | One-handed usability + 48px target audit | 🟥 OWNED-BY-MVP (L780) | **Human-bound: 2–4 hrs** | Agents can produce a static touch-target audit (~45 min) but real one-handed validation needs hands. |
| M-03 | Evidence capture under throttled network | 🟥 OWNED-BY-MVP (L770) | **Human-bound: 2–3 hrs** | Agent can write Playwright network-throttle scripts (~60 min) for partial automated coverage. |
| M-04 | eCign signing under interruption | 🟥 OWNED-BY-MVP (L781) | **Human-bound: 2–3 hrs** | |
| M-05 | CES task completion mobile only | 🟥 OWNED-BY-MVP (L778) | **Human-bound: 1–2 hrs** | |
| M-06 | Onboarding V2 gate progression on mobile | 🟥 OWNED-BY-MVP (L778) | **Human-bound: 2–3 hrs** | |
| M-07 | Mobile rotation survivability on signature pads | 🟨 PARTIAL | **Human-bound: 1–2 hrs** | MVP mission mentions; PART II UAT spec doesn't enumerate — Stabilization adds the test case. |
| M-08 | Document mobile issues + follow-up list | 🟩 UNIQUE | **30–45 min (doc)** | Depends on M-01..M-07 outputs. Cannot run before. |

**Workstream total:** ~14–30 **human hours**, plus ~3 agent hours of script prep.
**Stabilization-unique agent work:** M-08 only, ~30–45 min, gated on humans completing M-01..M-07.

**Honest reality:** This entire workstream is mostly human-bound. The "32 agents in parallel" framing does not apply.

---

## Workstream 4 — Protected Systems & Rollback Readiness

| ID | Task | Overlap | Single-agent time | Notes |
|----|---|---|---|---|
| P-01 | Define eCign + Evidence + CES identity as Protected Subsystems | 🟥 OWNED-BY-MVP (L794–L795 + §C6) | **20–30 min (doc)** | MVP already designates these (L905). Stabilization version is a duplicate doc. |
| P-02 | Create Rollback Trigger Matrix | 🟥 OWNED-BY-MVP (L825) | **25–35 min (doc)** | SuperGrokHeavy folder already has `STABILIZATION_ROLLBACK_PLAYBOOK.md` with the matrix. Done. |
| P-03 | Assign named rollback owners | 🟥 OWNED-BY-MVP (L826) | **Human-bound: needs leadership input** | Agent can produce the template (~15 min); names need humans. |
| P-04 | Rollback Execution Checklist | 🟨 PARTIAL | **25–35 min (doc)** | Already exists in `STABILIZATION_ROLLBACK_PLAYBOOK.md` §4. Done. |
| P-05 | Execute rollback drill on non-critical surface | 🟥 OWNED-BY-MVP (L827) | **Human-bound: 2–3 hrs DevOps + Engineering** | Cannot be agent-executed. Calendar-bound. |
| P-06 | Document subsystem isolation boundaries | 🟥 OWNED-BY-MVP (L828) | **30–45 min (doc)** | |
| P-07 | Post-rollback validation checklist | 🟩 UNIQUE | **20–30 min (doc)** | Already drafted in `STABILIZATION_ROLLBACK_PLAYBOOK.md` §5 + `STABILIZATION_GO_NO_GO_CHECKLIST.md`. Effectively done. |
| P-08 | Communication plan for rollback events | 🟩 UNIQUE | **20–30 min (doc)** | Drafted in `STABILIZATION_ROLLBACK_PLAYBOOK.md` §6. Effectively done. |

**Workstream total:** ~140–205 min agent doc work + 1 human-bound drill (~3 hrs) + ~30 min human owner-assignment.
**Note:** Most of this work is **already drafted in the SuperGrokHeavy folder**. The remaining true work is the human drill (P-05) and human owner sign-off (P-03).

---

## Workstream 5 — Design System Enforcement

| ID | Task | Overlap | Single-agent time | Notes |
|----|---|---|---|---|
| D-01 | ESLint rules: block raw hex/rgb, enforce `--ci-*` | 🟥 OWNED-BY-MVP (L810, L646, L1092) | **30–45 min** | MVP plan names `scripts/verifyUiDesignSystem.ts` to extend (L646) — that's the right anchor, not a fresh ESLint config. |
| D-02 | Visual regression PR requirement | 🟥 OWNED-BY-MVP (L811) | **15–25 min (doc + PR template)** | MVP already lists Playwright baselines (L548, L1066). |
| D-03 | Glass-layer max enforcement | 🟥 OWNED-BY-MVP (L812 — but **arbitrated as max 3** at §C1, not max 2) | **20–30 min** | **Use the MVP-arbitrated rule (max 3, Layer 3 portal-only), not the original Stabilization "max 2".** This is a real correction. |
| D-04 | Begin deprecation plan for parallel components | 🟥 OWNED-BY-MVP (L813) | **45–75 min (doc)** | MVP has the inventory (L74, L629). |
| D-05 | Audit remaining parallel styling | 🟥 OWNED-BY-MVP (L63–L64, L629) | **0 min — already done** | Lead 1 + Lead 13 + Lead 16 audits in MVP plan already enumerate this. **Skip.** |
| D-06 | Update internal design system contribution guidelines | 🟩 UNIQUE | **30–45 min (doc)** | Real artifact. |

**Workstream total:** ~140–220 min.
**Of which Stabilization-unique:** D-06 only, ~30–45 min.

---

## Workstream 6 — Validation, UAT & Governance Infrastructure

| ID | Task | Overlap | Single-agent time | Notes |
|----|---|---|---|---|
| V-01 | Define Go/No-Go gates | 🟥 OWNED-BY-MVP (L857–L860 + Lead 16 §943, §1142, §1144) | **0 min — already done** | MVP plan has the binding Lead 16 Go/No-Go assessment. SuperGrokHeavy folder also has `STABILIZATION_GO_NO_GO_CHECKLIST.md`. **Skip duplicate.** |
| V-02 | Runtime Validation Matrix | 🟥 OWNED-BY-MVP (L1066 5-tier strategy) | **0 min — already done** | |
| V-03 | Mobile Field UAT test cases | 🟥 OWNED-BY-MVP (L1066 tier 3) | **45–60 min** | MVP cohort spec is more concrete; refining test cases under that umbrella has value. |
| V-04 | Define rollback owners + escalation path | 🟥 OWNED-BY-MVP (L826, dup of P-03) | **0 min — see P-03** | Same task. |
| V-05 | Post-rollback validation checklist | 🟩 UNIQUE (dup of P-07) | **0 min — see P-07** | Same task. |
| V-06 | UAT feedback collection process for ~100 users | 🟩 UNIQUE | **30–45 min (doc)** | Real artifact. MVP focuses on field cohort, not 100-user intake. |
| V-07 | Define success metrics for Stabilization phase | 🟩 UNIQUE | **20–30 min (doc)** | Only meaningful if Stabilization remains a separate track. If folded into MVP, **skip** — MVP has its own metrics. |
| V-08 | Schedule + run final Go/No-Go review | 🟥 OWNED-BY-MVP (Lead 16 §943 + §1142–1144) | **Human-bound: 1–2 hr meeting** | |

**Workstream total:** ~95–135 min agent doc work + 1–2 hr human meeting (V-08).
**Of which Stabilization-unique:** V-06 + (V-07 if kept) = ~50–75 min.

---

## Aggregate honest totals

| Bucket | Tasks | Single-agent time |
|---|---|---|
| 🟥 OWNED-BY-MVP (defer to MVP track) | 28 | ~870–1,300 min agent + ~14–30 hr human field testing + governance meetings |
| 🟨 PARTIAL (coordinate with MVP) | 5 | ~135–220 min agent |
| 🟩 STABILIZATION-UNIQUE | 13 (1 redundant) | ~280–410 min agent + 1 human meeting |

**Net Stabilization-unique agent work after dedup: ~5–7 hours of single-agent time**, parallelizable to ~6–8 agents. **Not a 3-week, 32-agent program.**

---

## Recommendation per task category

1. **OWNED-BY-MVP tasks:** Stop tracking these in a separate Stabilization plan. They are MVP Wave 0 / pre-MVP-cut work. Move them to the MVP plan's existing wave assignments. The MVP plan already has owners, validation, and rollback for them.
2. **PARTIAL tasks:** Keep, but execute alongside the MVP task they depend on. Don't run them as a separate workstream.
3. **STABILIZATION-UNIQUE tasks:** Form a small "Stabilization Governance" sub-track of ~6 agents for ~3 days. Outputs are documents + audit artifacts, not code changes. After that, dissolve the Stabilization track.

See `03_REALISTIC_TIMELINE.md` for the corresponding schedule and `04_PHASE_1_TONIGHT_REALISTIC.md` for tonight's executable plan.
