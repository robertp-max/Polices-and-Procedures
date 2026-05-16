# Realistic Stabilization Timeline (De-Duplicated)

**Replaces:** `_Stabilization(SuperGrokHeavy)/STABILIZATION_EXECUTION_PLAN.md` and `_Stabilization(SuperGrokHeavy)/STABILIZATION_32_AGENT_ALLOCATION_PLAN.md`
**Constraint:** No new tasks — only the same 46 IDs from `STABILIZATION_DETAILED_TASK_BREAKDOWN.md`, with overlap removal applied per `01_OVERLAP_ANALYSIS_WITH_UNIFIED_MVP.md`.

---

## Why The Original 3-Week Timeline Is Wrong

The original `STABILIZATION_EXECUTION_PLAN.md` proposed:

> **Week 1** — Foundation & High-Impact Fixes (20–24 agents)
> **Week 2** — Mobile, Protected Systems & Rollback (16–20 agents)
> **Week 3** — Advanced Hardening & Final Governance (10–16 agents)

This sizing assumes Stabilization is a real 46-task program. After deduplication (28 tasks owned by MVP, 5 partial, 13 unique with 1 internal redundancy), the **net Stabilization-unique work is ~12 tasks**. Most are documentation deliverables of 15–45 minutes each.

**Honest sizing:** Stabilization-unique work fits in **3 working days** with **6 agents in parallel**, plus a calendar-bound rollback drill (1 human-led session) and Mobile UAT (which is its own MVP-owned cohort program).

The remaining 33 tasks belong to MVP plan execution (Wave 0 through pre-MVP-cut). They should appear on the MVP timeline, not a parallel Stabilization timeline.

---

## Revised Schedule

### Day 0 — Tonight (60–90 min, 32 agents available)

See `04_PHASE_1_TONIGHT_REALISTIC.md` for the agent-by-agent plan. Headline: **6 agents on Stabilization-unique docs, 18 agents on MVP Wave 0 navigation + design-token enforcement (correctly labeled as MVP work)**, 8 agents on standby for coordination + rework.

Tonight's Stabilization-unique deliverables:
- **N-05** Follow-up list of ambiguous `replace: true` cases — depends on MVP Wave 0 N-03/N-04 audit output
- **N-08** Document new navigation behavior (deferred to Day 1; depends on Day 0 merges)
- **D-06** Design system contribution guidelines doc
- **V-06** UAT feedback collection process for ~100 users
- **V-07** Stabilization success metrics doc (only if Stabilization remains a separate track)

### Day 1 — Tomorrow (4–6 hours, 6 agents)

Stabilization-unique work that doesn't depend on humans:

| Time | Task | Agent |
|---|---|---|
| 9:00–9:45 | **N-07** Deep-link restoration audit (CES, Evidence, eCign) | Agent 1 |
| 9:45–10:30 | **N-07** Fix top 3 deep-link issues found | Agent 1 |
| 9:00–10:30 | **R-05** State staleness detection design + impl on CES list + Evidence list | Agent 2 |
| 9:00–10:00 | **R-06** Long-idle session recovery (extends FormStateManager from MVP R-01) | Agent 3 — gated on MVP R-01 being merged |
| 9:00–10:30 | **R-08** Partial-save at logical step boundaries on Onboarding V2 | Agent 4 — gated on MVP R-01 |
| 9:00–9:30 | **N-08** Document navigation behavior changes | Agent 5 (depends on tonight's N-01..N-04 merges) |
| 9:00–9:45 | **M-08** Compile mobile follow-up list (gated on M-01..M-07 having any output) | Agent 6 — likely deferred until Day 3+ |

End of Day 1: ~9 of the 12 unique tasks complete.

### Day 2 — Coordination + human-bound items

| Time | Task | Owner |
|---|---|---|
| Morning | **P-03** Confirm rollback owner assignments (template ready in `STABILIZATION_ROLLBACK_PLAYBOOK.md`) | Engineering Leads (humans) |
| Afternoon | **P-05** Execute rollback drill on a non-critical surface (~2–3 hrs) | DevOps + 1 Engineer (humans) |
| Anytime | **V-08** Schedule Lead 16 Go/No-Go review meeting | Stabilization Lead (human) |

### Day 3 — Wrap-up

| Time | Task | Agent |
|---|---|---|
| 1 hr | Post-rollback validation run (P-07 checklist already exists) | 1 agent + DevOps |
| 1 hr | Final governance package: cross-link all Stabilization-unique outputs into MVP plan handoff | 1 agent |

**Total Stabilization-unique program: 3 working days + 1 calendar-bound human session.**

---

## What Belongs To The MVP Timeline (NOT a separate Stabilization track)

The 28 OWNED-BY-MVP tasks should appear on the MVP plan's existing wave timeline, not be tracked twice. Recommended mapping:

| Stabilization ID | Where it actually belongs in MVP plan |
|---|---|
| N-01, N-02, N-03, N-04, N-06 | MVP Wave 0 — "Navigation + Input Safety" §6 (L837–L852) |
| R-01, R-02, R-03, R-04, R-07 | MVP Wave 0 — "Runtime Survivability Hardening" §1 (L759–L773); coordinate with §C6 frozen-files rule for eCign |
| M-01..M-06 | MVP Mobile Field UAT Cohort §1066 tier 3 |
| P-01, P-02, P-04, P-05, P-06 | MVP Wave 0 — "eCign + Evidence Protection Layer" §3 (L791–L805) + "Rollback + Blast Radius Governance" §5 (L822–L835) + Lead 16 §1131–1132 |
| D-01, D-02, D-03, D-04, D-05 | MVP Wave 0 — "Design-System Enforcement" §4 (L807–L820); use MVP-arbitrated max-3 glass rule (§C1) |
| V-01, V-02, V-03, V-04, V-08 | MVP Lead 16 §943 + §1142 + §1144 — "Go/No-Go MVP Readiness Assessment" |

Tracking the same task in two plans causes:
1. Double effort estimates (the source of the unrealistic Stabilization sizing)
2. Owner ambiguity (who's actually doing N-01, the MVP Wave 0 team or the Stabilization Navigation team?)
3. Validation duplication (two checklists for the same merge)
4. Communication noise (which plan is canonical?)

**Recommendation:** Move OWNED-BY-MVP tasks off the Stabilization tracker entirely. Stabilization tracker holds only the 12 unique tasks listed above.

---

## Revised Agent Allocation

The original `STABILIZATION_32_AGENT_ALLOCATION_PLAN.md` allocated 32 agents across 6 workstreams. After dedup, that's massively oversized. Realistic allocation:

| Track | Agent count | Source |
|---|---|---|
| Stabilization-unique (12 tasks, 3 days) | **6 agents** | This document |
| MVP Wave 0 Navigation + Input Safety | **4–6 agents** | MVP plan §6 + Lead 11 wave structure |
| MVP Wave 0 Runtime Survivability + FormStateManager | **6–8 agents** | MVP plan §1 |
| MVP Wave 0 Design-System enforcement (lint + token migration) | **4 agents** | MVP plan §4 |
| MVP Wave 0 Protected Subsystems + Rollback | **2–4 agents** + **1 DevOps human** | MVP plan §3 + §5 |
| MVP Mobile UAT prep (Playwright scripts, test cases) | **2 agents** + **clinician cohort** | MVP §1066 tier 3 |
| Coordination + rework buffer | **2–4 agents** | — |

That's **26–34 agents** distributed across **MVP Wave 0** and a **small Stabilization sub-track**. The "32 agents on Stabilization" framing was double-counting.

---

## Why This Matters For Monday

The original SuperGrokHeavy plan claimed a 3-week timeline that "runs in parallel with the MVP." In practice, agents would attempt the same tasks twice (once labeled "Stabilization Phase 1," once labeled "MVP Wave 0"), causing merge conflicts on `CommandCenterLayout.tsx`, double validation cycles, and confusion about which task list is authoritative.

After dedup:
- **Tonight (Day 0):** MVP Wave 0 navigation + token enforcement gets done with the labels straight. App visibly moves toward v2 by morning.
- **Day 1–3:** Small Stabilization governance sub-track produces the 12 unique artifacts.
- **Days 4–7:** MVP Wave 0 finishes the runtime + protected-subsystem work that needs Stabilization governance artifacts (rollback owners, integrity verification spec) as inputs.
- **Monday:** Training begins with v2 design visible, navigation hijack gone, basic runtime survivability in place, governance documented. **Same outcome the original 3-week plan claimed**, achieved without the duplication tax.

---

## Cross-References

- `00_SUMMARY_OF_CHANGES.md` — what changed and why
- `01_OVERLAP_ANALYSIS_WITH_UNIFIED_MVP.md` — line-cited overlap audit
- `02_STABILIZATION_TASK_BREAKDOWN_REVISED.md` — 46 tasks with realistic per-task minutes
- `04_PHASE_1_TONIGHT_REALISTIC.md` — tonight's executable plan
- `_Heavy/Fix-2026-05-14/UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md` — the canonical plan that owns most of this work
