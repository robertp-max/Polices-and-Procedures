# Phase 1 Tonight — Realistic 32-Agent Plan

**Replaces:** `_Stabilization(SuperGrokHeavy)/STABILIZATION_PHASE_1_TONIGHT_PLAN.md`
**Constraint:** Same task IDs only — no new work invented. The original plan's "Apply New Care Indeed Design System on Main Shell" has been re-mapped to the existing MVP work (Lead 13 + §C1–C3 + L74 + L613–L646) since it is not a Stabilization-listed task.
**Window:** ~90 minutes from kickoff.
**Available agents:** 32 (16 Grok 4.3 + 16 Claude Sonnet 4.6 or lower).

---

## Honest Framing First

Before allocation, three corrections to the original tonight plan:

1. **The original "Phase 1 Tonight" was MVP Wave 0 work mislabeled.** Tasks 1–4 in the SuperGrokHeavy tonight plan (remove navigation handlers, reduce `replace: true`, apply CI design system, basic form draft persistence) are all in MVP plan PART II §1, §4, §6 — not in the Stabilization-unique set. Re-labeling this as "Stabilization" inflated the apparent scope of the Stabilization phase.

2. **A 60–90 minute window is realistic for the items below — but only because most are MVP Wave 0 items, not because Stabilization fits in 90 minutes.** Be clear with the team about what is actually being labeled.

3. **Real merge-conflict risk on `CommandCenterLayout.tsx` and `App.tsx`:** Both files are touched by multiple proposed tasks. Sequencing matters. The plan below serializes those edits behind a single "shell agent" and parallelizes everything else.

---

## Tonight's Executable Plan (32 Agents)

### Track A — MVP Wave 0 Navigation + Input Safety (Lead Frontend, MVP §6)
**6 agents.** **Single-file serialization on `CommandCenterLayout.tsx`.** All edits go through one lead agent; reviewers + smoke-testers run in parallel.

| # | Agent role | Task ID | Estimated time | Notes |
|---|---|---|---|---|
| A1 | Shell editor (Claude) | **N-01** + **N-02** | 15 min | Single PR, two changes batched. Other agents wait. |
| A2 | Route auditor (Grok) | **N-03** | 20 min | Greps `App.tsx` for all `replace: true` Navigate components. Produces audit list. Runs in parallel with A1. |
| A3 | Route cleaner (Claude) | **N-04** | 25 min | Acts on A2's list. Removes `replace: true` from CES/Evidence/eCign/OnboardingV2/Calendar normal routes. Keeps for true legacy aliases. **Sequential after A2.** |
| A4 | Follow-up list writer (Grok) | **N-05** 🟩 | 10 min | Documents ambiguous cases A3 deferred. **Stabilization-unique.** |
| A5 | Smoke validator (Grok) | Run `scripts/checkEcignRouteHealth.ts`, `scripts/verifyEventDataflow.ts`, `scripts/verify:task-identity` | 20 min | After A1+A3 merge. Reports pass/fail. |
| A6 | Browser back/forward smoke (Claude) | Manual flow check on 8 surfaces (CES Board, Evidence, eCign, Onboarding V2, Calendar, My Tasks, Library, Dashboard) | 30 min | Cannot fully automate; produces written report. |

**Track A output:** Navigation hijack removed. `replace: true` cleaned. Browser back/forward verified on 8 flows. One Stabilization-unique deliverable (N-05) complete.

---

### Track B — MVP Wave 0 Design-System Token Enforcement (Lead Engineering + Design Systems, MVP §4)
**5 agents.**

| # | Agent role | Task ID | Estimated time | Notes |
|---|---|---|---|---|
| B1 | Lint-rule author (Claude) | **D-01** | 35 min | Extend `scripts/verifyUiDesignSystem.ts` (MVP L646) **or** add ESLint plugin. Block raw hex/rgb, enforce `--ci-*`. **Use the MVP-arbitrated max-3 glass rule from §C1, not Stabilization's max-2.** |
| B2 | PR template editor (Grok) | **D-02** | 20 min | Add visual regression checkbox to `.github/PULL_REQUEST_TEMPLATE.md` (or repo equivalent). |
| B3 | Glass-stack rule (Grok) | **D-03** | 25 min | Lint or review-checklist rule for max 3 layers, Layer 3 portal-only. |
| B4 | Design system contrib guidelines (Claude) | **D-06** 🟩 | 30 min | New doc. **Stabilization-unique.** |
| B5 | Lint smoke runner (Grok) | Run lint on 5 sample files; confirm B1's rule fails as expected | 15 min | After B1 merge. |

**Track B output:** Design tokens enforced in CI. Glass-stack rule live. PR template includes visual regression check. One Stabilization-unique deliverable (D-06) complete.

**Skipped on purpose:**
- D-04 (deprecation plan) — too long for tonight; Day 1.
- D-05 (audit parallel styling) — already done in MVP plan (L63, L629). Don't re-do.
- "Apply CI design system to CommandCenterLayout shell" from original tonight plan — **not a listed Stabilization task**. Belongs to MVP visual sprint. Defer to MVP Wave 0–1.

---

### Track C — MVP Wave 0 Runtime Survivability (Lead Frontend, MVP §1)
**6 agents.** **High coordination risk** — `FormStateManager` is shared infrastructure; eCign integration touches a Protected Subsystem (MVP §C6).

| # | Agent role | Task ID | Estimated time | Notes |
|---|---|---|---|---|
| C1 | FormStateManager designer + author (Claude) | **R-01** | 60 min | Core utility: localStorage adapter, version key, `visibilitychange`/`pagehide`/`beforeunload` plumbing. Single PR. |
| C2 | visibilitychange wiring (Grok) | **R-04** | 25 min | Hooks into C1's utility. Sequential. |
| C3 | Onboarding V2 integration (Grok) | **R-03** | 40 min | After C1 lands. Non-protected, safer first integration. |
| C4 | eCign integration (Claude) | **R-02** | 50 min | **Protected Subsystem (MVP §C6) — owner-led.** Coordinate with Architecture Lead. May spill past 90-min window. |
| C5 | Refresh smoke tester (Grok) | Manual refresh test at 30/60/90% on 1 eCign + 1 OnboardingV2 form | 20 min | After C3+C4 land. |
| C6 | Smoke + reporter (Claude) | Aggregate Track C results, post status | 10 min | At end of window. |

**Track C output:** Form draft persistence + interruption recovery live on eCign + Onboarding V2. **Realistic risk: C4 (eCign) may not finish in 90 min due to Protected Subsystem review gates.** Plan to leave C4 mid-flight if needed.

---

### Track D — Stabilization-Unique Documentation (Stabilization Lead)
**4 agents.** Pure markdown deliverables. No file conflicts. Highest confidence to ship in 90 min.

| # | Agent role | Task ID | Estimated time | Notes |
|---|---|---|---|---|
| D1 | Doc writer (Claude) | **V-06** 🟩 | 35 min | UAT feedback collection process for the ~100 internal users. Channels, template, triage owner. |
| D2 | Doc writer (Grok) | **V-07** 🟩 | 25 min | Stabilization phase success metrics (only useful if Stabilization remains a separate track; otherwise skip). |
| D3 | Doc writer (Grok) | **P-08** 🟩 | 25 min | Communication plan for rollback events. **Note:** A draft already exists in `_Stabilization(SuperGrokHeavy)/STABILIZATION_ROLLBACK_PLAYBOOK.md` §6 — this agent's job is to confirm and expand, not start fresh. |
| D4 | Doc writer (Claude) | **P-07** 🟩 | 25 min | Post-rollback validation checklist. **Note:** Already drafted in `STABILIZATION_GO_NO_GO_CHECKLIST.md` and rollback playbook §5 — confirm and consolidate. |

**Track D output:** 4 of the 12 Stabilization-unique tasks complete tonight (V-06, V-07, P-07, P-08).

---

### Track E — Coordination, Rework Buffer, Stand-By
**11 agents.** This is honest: with the above 21 agents on real work, the remaining 11 should be:

- **2 agents** as dedicated reviewers for Track A and Track C (highest merge-conflict risk).
- **2 agents** standing by for rework if any of the above smoke checks fail.
- **2 agents** running existing verify scripts continuously (`tsc -b --noEmit`, `npm run build`, `verify:alignment`, `verify:pm-unified`, MVP §1066 tier 1) so regressions surface fast.
- **1 agent** as the night's status-poster: 30-min interval pulse with what's merged, what's blocked, what's at risk.
- **4 agents idle / standing down.** Better than assigning busywork that creates noise.

**Saying out loud: 32 agents is too many for this window.** The work surface is bounded by file-edit serialization on `CommandCenterLayout.tsx` + `App.tsx` + the FormStateManager utility, plus the Protected Subsystem review gate on eCign. Throwing more agents at a serialized critical path doesn't help; it generates merge conflicts and review load.

---

## What Tonight Will Realistically Produce

**High confidence (will ship):**
- N-01, N-02 — global swipe + arrow key navigation removed (Track A)
- N-03, N-04 — `replace: true` cleaned on 5 route areas (Track A)
- N-05 — follow-up list of ambiguous cases (Stabilization-unique)
- D-01, D-02, D-03 — design-token lint, PR template, glass-stack rule (Track B)
- D-06 — design system contribution guidelines (Stabilization-unique)
- V-06, V-07, P-07, P-08 — four Stabilization-unique governance docs (Track D)
- R-01, R-04 — FormStateManager utility + visibilitychange wiring (Track C)
- R-03 — Onboarding V2 form persistence integration (Track C, if C1 finishes on time)

**Medium confidence:**
- R-02 — eCign form persistence integration (Protected Subsystem, may need owner approval)
- A6 manual browser back/forward smoke on 8 surfaces (depends on agent ability + environment access)

**Will not happen tonight (don't promise):**
- "Apply CI design system to CommandCenterLayout shell" — not a Stabilization task and is its own visual sprint. Schedule for MVP Wave 0 Day 1.
- Mobile UAT (M-01..M-07) — human-bound; needs real devices.
- Rollback drill (P-05) — needs DevOps + scheduling.
- Owner sign-offs (P-03, V-04) — needs leadership.
- Smoke test "pass" in any complete sense — agents can run existing verify scripts and read outputs but cannot replace clinician click-through.

---

## Compared To The Original Tonight Plan

| Original `STABILIZATION_PHASE_1_TONIGHT_PLAN.md` | This plan |
|---|---|
| 4 tasks, all labeled "Stabilization Phase 1" | 13 tasks, correctly labeled (9 MVP Wave 0 + 5 Stabilization-unique with proper IDs) |
| "Apply CI design system to shell" listed as task | Removed — not in the 46-task Stabilization breakdown; it's MVP visual work |
| 32 agents on 4 tasks (8 per task) | 21 agents on 13 tasks + 11 buffer/coordination/stand-down |
| Estimated 60–90 min total | 90 min critical path; eCign R-02 may slip; explicitly stated |
| No mention of merge conflict risk | Explicit serialization on `CommandCenterLayout.tsx` and `App.tsx` |
| No mention of Protected Subsystem review for R-02 | Explicit; Architecture Lead coordination required |

---

## After Tonight (Day 1 morning)

Pickup list (what to start tomorrow with the same agent pool):

- **Track A leftover:** None expected if A1–A6 land tonight.
- **Track B leftover:** D-04 (deprecation plan, Day 1, ~60 min).
- **Track C leftover:** R-02 if not finished + R-08 (partial-save at step boundaries) + R-05 (state staleness) + R-06 (long-idle).
- **Track D leftover:** N-08 (document navigation behavior — depends on Track A merges) + V-03 refinement.
- **Human-bound:** P-03 (owner sign-off), P-05 (rollback drill schedule), M-01..M-07 (mobile UAT cohort).

See `03_REALISTIC_TIMELINE.md` for the Day 1–3 plan.

---

## Single Question Before Kicking Off

**Does the team agree to label tonight's work correctly?** If yes (Track A = MVP Wave 0 Navigation, Track B = MVP Wave 0 Design-System, Track C = MVP Wave 0 Runtime, Track D = Stabilization-unique governance docs), this plan executes cleanly.

If the team insists on calling everything "Stabilization Phase 1," the work still happens, but the Stabilization tracker will continue to show inflated progress and double-counted tasks. That's the same hole the SuperGrokHeavy plan dug. Up to you.
