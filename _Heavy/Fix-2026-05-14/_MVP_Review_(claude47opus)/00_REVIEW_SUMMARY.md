# MVP Plan Review — Summary of Findings

**Reviewer:** Claude Opus 4.7 (single orchestrator; no subagents spawned for this review)
**Source under review:** `_Heavy/Fix-2026-05-14/UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md` (1,287 lines, 16-Grok-lead synthesis)
**Cross-references:**
- Completed Stabilization Phase 1 + Phase 2 work (`_Stabilzation_(claude47opus)/PHASE_1_EXECUTION_REPORT.md`, `PHASE_2_EXECUTION_REPORT.md`)
- Actual source tree (targeted code-grounding checks)
**Date:** 2026-05-16
**Mode:** Review only. No source code changes. No commits. No pushes.

---

## 1. Headline Verdict

The MVP plan is **directionally correct, technically detailed, and well-arbitrated** — but its **timeline is optimistic by 2–3×**, **two sections are duplicated** (apparent editing artifact), and **~30% of its "Wave 0 hardening" scope is already complete** as a side-effect of Stabilization Phase 1 + Phase 2.

Three independent confidence findings:

1. **Identity / verification layer is solid.** All cited `npm run verify:*` scripts pass at unit level. Lead 4 confirms `verify:task-identity` PASS, alignment 100%, eCign routes 18/18. This is real.

2. **Integration gaps are real and concentrated.** Six P0 items (CES-001, ECIGN-001/002, A11Y-001/002/003, TASK-001) plus eight P1 items are the actual MVP risk. The plan correctly identifies all of them.

3. **The "Wave 0 reality check"** of the 9 browser tests has **never been executed** (Lead 11 + Lead 12 both state zero records). This is the single most important blocker the plan honestly flags.

Two issues this review surfaced that the plan does not flag:

- **PART II is duplicated** in the source document (lines ~753–880 and ~882–1023 are nearly identical "Actionable Implementation Hardening" sections). A third "PART II — 19 MANDATED DELIVERABLES" begins at line 1105. This is an editing artifact; the third PART II is the authoritative one.
- **`signerTaskFactory.ts` does not exist** in `src/policy/compliance-execution/`. Lead 4 flagged this as an open glob conflict; my grep confirms the file is referenced in 5 leads' ownership maps but the source is not present (likely renamed, inlined, or never built).

---

## 2. What Is Already Done (by Stabilization Phase 1 + Phase 2)

A direct cross-walk between the MVP plan's PART II "Actionable Implementation Hardening" and the completed Phase 1 + Phase 2 work shows roughly 30% of MVP Wave 0 hardening is done:

| MVP PART II § | Description | Done by Stab? | Source |
|---|---|---|---|
| §1 Runtime Survivability — draft persistence | useFormDraft + ActivationPage + visibilitychange/pagehide/beforeunload | **YES** | Phase 1 R-01/R-03/R-04 |
| §1 Runtime Survivability — staleness detection | useDataFreshness + StalenessBanner on CES + Evidence | **YES** | Phase 2 R-05 |
| §1 Runtime Survivability — long-idle TTL | useFormDraft staleAfterMs + isStale UI | **YES** | Phase 2 R-06 |
| §1 Runtime Survivability — partial-save checkpoints | useFormDraft markStep + lastStep | **YES** | Phase 2 R-08 |
| §1 Runtime Survivability — eCign integration | — | **NO** (deferred, Protected) | n/a |
| §1 Runtime Survivability — IndexedDB blob queue | — | **NO** | MVP-P1-EVIDENCE-001 |
| §2 Mobile Operational UAT | — | **NO** (human-bound) | MVP Wave 7 |
| §3 eCign + Evidence Protection — formal designation | Protected Subsystem treatment lived through Stab; PR template enforces | **PARTIAL** | Phase 1 D-02 PR template |
| §3 eCign + Evidence Protection — integrity tests | — | **NO** | MVP-P0-ECIGN-001/002 |
| §4 Design-System Enforcement — hex/rgb lint | tokens.hex-literal + tokens.rgb-literal rules in verifyUiDesignSystem.ts | **YES** | Phase 1 D-01 |
| §4 Design-System Enforcement — glass-stack | glass.stack-budget rule | **YES** | Phase 1 D-03 |
| §4 Design-System Enforcement — PR template | PR template with subsystem approval + visual regression | **YES** | Phase 1 D-02 |
| §4 Design-System Enforcement — contribution guidelines | D-06 doc | **YES** | Phase 1 D-06 |
| §4 Design-System Enforcement — deprecation plan | D-04 doc (inventory + recipes + migration order) | **YES** | Phase 2 D-04 |
| §4 Design-System Enforcement — deep token migration | — | **NO** (3,348 WARNs remain) | MVP Wave 1+ |
| §5 Rollback Governance — trigger matrix | — | **NO** (owner-template only; needs human assignment) | Phase 1 P-03 deferred |
| §5 Rollback Governance — communication plan | P-08 doc | **YES** | Phase 1 P-08 |
| §5 Rollback Governance — validation checklist | P-07 doc | **YES** | Phase 1 P-07 |
| §5 Rollback Governance — drill | — | **NO** (human event) | Phase 1 P-05 deferred |
| §6 Navigation + Input Safety — swipe removal | CommandCenterLayout swipe + arrow handlers removed | **YES** | Phase 1 N-01/N-02 |
| §6 Navigation + Input Safety — replace:true audit | N-05 audit doc, zero changes needed | **YES** | Phase 1 N-05 |
| §6 Navigation + Input Safety — deep-link audit | N-07 audit + 3 fixes (MyTasks `?filter=`, Mobile task-not-found, Evidence `?view=`) | **YES** | Phase 2 N-07 |
| §6 Navigation + Input Safety — behavior doc | N-08 doc | **YES** | Phase 2 N-08 |
| §6 Navigation + Input Safety — Esc/Back drawer audit | — | **NO** (originally N-06 / MVP §6 L843; Esc behavior validation across all drawers) | MVP-owned |
| §7 Go/No-Go Governance — gate definition | — | **NO** (V-07 metrics doc is sub-track scope only) | MVP-owned |
| §7 Go/No-Go Governance — UAT feedback process | V-06 doc | **YES** | Phase 1 V-06 |
| §7 Go/No-Go Governance — success metrics | V-07 doc (Stab sub-track only) | **PARTIAL** | Phase 1 V-07 |

**Net:** 14 of ~26 PART II hardening items are completed by the Stabilization sub-track. See `01_OVERLAP_WITH_COMPLETED_STABILIZATION.md` for line-by-line citations.

---

## 3. Honest Re-Estimate of Wave Durations

The plan describes 8 waves but does not put concrete hours/days on each wave. Below is my honest single-agent estimate, holding the plan's scope constant (no scope creep, no scope cuts), and assuming all frozen-file owner-approval gates resolve in normal time (not best-case).

| Wave | Scope | Plan's implied timing | Honest single-agent estimate | Honest "32 agents available" estimate |
|---|---|---|---|---|
| Wave 0 | 9 browser tests against `main` + baseline screenshots + simulated cohort charter | "~30 min" (L1257) | **4–6 hours** (real screenshot capture + console scrubbing + log artifact per test) | 1–2 hours (parallel test execution) |
| Wave 1 | P0-CES-001 + CES theme unification + BottomSheetDrawer + SignaturePad 320px | implicit ~1 sprint | **3–5 working days** (each P0 needs owner gate + browser test + regression suite) | 1–2 working days |
| Wave 2 | EVIDENCE-001 (IndexedDB) + AUDIT-001 + ARTIFACT-001 + TASK-001 + nav slot | implicit ~1 sprint | **5–8 working days** (IndexedDB is real architecture work; TASK-001 is view-only but spans 5 surfaces) | 2–3 working days |
| Wave 3 | ECIGN-001 (patch ready) + ECIGN-002 (PDF capture) + A11Y-001/002/003 | implicit ~1 sprint | **4–6 working days** (PDF capture is non-trivial; Compliance Lock regression on every change) | 2–3 working days |
| Wave 4 | CALENDAR-001 (selectCanonicalTasksForEvent) + PERMS-001 + A11Y-004/005/006 + ECIGN-003/004 | implicit ~1 sprint | **3–5 working days** | 1–2 working days |
| Wave 5 | PRINT-001 (shared print utils) | implicit ~3 days | **2–3 working days** | 1 working day |
| Wave 6 | Visual regression baselines + full 9-test re-run | implicit ~1 day | **2 working days** | 1 working day |
| Wave 7 | Real-agency cohort sign-off | "gated on executive sponsor" | **NOT AGENT-DOABLE** — calendar-bound; 2–4 weeks lead time | Same |
| Wave 8 | Post-MVP DEFER (orphans, full mobile reconstruction, StagingM01 removal) | "post-MVP" | **NOT IN SCOPE** for this review | Same |

**Aggregate to "Production broad release: NO-GO → GO":**
- Single agent: **~3–5 working weeks** for Waves 1–6 (excluding Wave 0 reality-check time and Wave 7 calendar wait)
- 32-agent allocation (theoretical): **~10–15 working days** for Waves 1–6 (real parallelism limited by serialization on frozen files + browser test gating + Compliance Lock regression on every PR)
- **Wave 7 real-agency cohort: 2–6 weeks calendar time regardless of agent count**

**The plan's "Waves 1–7" framing is reasonable as a schedule, but the implication that all of this can be compressed into one or two operator-driven sessions is not.**

See `03_REALISTIC_MVP_TIMELINE.md` for the wave-by-wave breakdown.

---

## 4. Top 5 Risks Surfaced By This Review

### Risk 1 — Wave 0 has never executed
Lead 11 and Lead 12 both confirm zero of the 9 browser tests have ever been run. The plan correctly gates Wave 1 on Wave 0 passing. But Wave 0 itself takes 4–6 hours of careful manual work (per-test artifact capture in `QA_UAT_AUDIT/execution-logs/`) and **cannot be skipped**. If a user wants to "start executing the MVP," Wave 0 IS the first thing.

### Risk 2 — Frozen-file serialization is the real throughput limit
The plan freezes 14+ files (Lead 16 C6/C7) and mandates "owner-led patches only" with Architecture/Compliance approval. In practice this means:
- Even with 32 agents available, only 1 agent at a time can edit any frozen file.
- Each frozen-file change requires owner sign-off before merge.
- Compliance Lock regression must run on every PR touching forms/ecign/ces/evidence/onboarding-v2/policy-detail/mobile-shell (Lead 11).

This means agent parallelism is **architecturally capped**, not capped by agent budget. The same lesson Phase 1/Phase 2 demonstrated holds.

### Risk 3 — IndexedDB blob persistence (P1-EVIDENCE-001) is real architecture work
This is not a one-session task. It involves:
- New `IndexedDBAdapter` replacing `localDemoAdapter`
- Dual-write window for one release transition (per Lead 6)
- Migration path for existing localStorage blobs
- Refresh / session-restart tests (Test 4)
- Coordination with `cesEvidenceHierarchy.ts` (frozen file)
- Browser support gates for IndexedDB API edge cases (Safari iOS limits)

Honest estimate: **2–3 working days for a single agent**, plus owner review.

### Risk 4 — Mobile primitives are unbuilt
`BottomSheetDrawer.tsx`, `SignaturePad.tsx`, `PhotoEvidenceCapture.tsx`, and `LoadingState.tsx` are all referenced in Wave 1 / Wave 2 / mobile rules as if they exist; none of them are in `src/policy/components/ui/`. These are net-new primitives.

Realistic build cost (per primitive):
- `BottomSheetDrawer.tsx`: 0.5 day (touch gestures + snap points + iOS keyboard handling)
- `SignaturePad.tsx`: 1.5 days (canvas + finger smoothing + IndexedDB partial-stroke persistence + 320 px minimum + redraw on rotate)
- `PhotoEvidenceCapture.tsx`: 1 day (native camera + preview + metadata)
- `LoadingState.tsx`: 0.5 day (skeleton variants + spinner + aria-live)

**Total: ~3.5 working days for one agent** before they can be consumed by other waves.

### Risk 5 — Multi-signer artifact supersede (P0-ECIGN-001) has a patch but is Protected
A pre-built patch exists: `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/patches/2026-05-14-P0-01-MultiSigner-Artifact-Supersede.patch`. It's ready to apply. BUT:
- Touches `FormSigningWorkspace.tsx` (Protected — Lead 16 C6)
- Requires eCign architecture sign-off
- Requires Test 2 + Test 3 + Compliance Lock regression before merge
- Phase 1 explicitly deferred R-02 (eCign integration of `useFormDraft`) under the same Protected rule

This is the single most legally-risky item in the MVP plan. It is **not safe to apply unsupervised**.

---

## 5. What This Review Recommends For The Next Session

In priority order (see `04_NEXT_EXECUTION_PROPOSAL.md` for full detail):

1. **Resolve the duplicate PART II** in the source document (1-line confirmation that PART II at lines 1105+ is authoritative; archive or delete the two preceding draft PART II blocks).
2. **Execute Wave 0** (the 9 browser tests against `main`) — this is the single most important unblocker. ~4–6 hours of disciplined manual testing with artifact capture.
3. **Build the four missing mobile primitives** as a single subagent campaign — they unblock Waves 1–2 and have no Protected Subsystem touch. ~3.5 agent-days.
4. **Apply MVP-P0-ECIGN-001 patch** only after eCign architecture sign-off and only with Test 2 + Test 3 gating ready.
5. **Confirm `signerTaskFactory.ts` status** — is the file renamed, inlined, or genuinely missing? If missing, the canonical ownership map needs a one-line correction.

The remaining waves are then a multi-week program of owner-led patches under Compliance Lock regression — exactly as the plan describes, just with honest weeks-not-days durations.

---

## 6. What This Review Does NOT Recommend

- Compressing Waves 1–7 into "tonight" or "this weekend." The Compliance Lock regression alone makes this impossible.
- Spinning up 32 agents at once. The serialization limits + Compliance Lock + owner-gate already constrain throughput. 4–6 agents per wave is the realistic sweet spot, matching the Stabilization Phase 1/Phase 2 pattern.
- Re-opening any of the Stabilization Phase 1 / Phase 2 completed items. They're done and validated (tsc clean, build green, verify:ui 0 FAILs).
- Touching Protected Subsystems without owner sign-off. This rule held through Phase 1 and Phase 2 and must hold through every MVP wave.

---

## 7. Index Of This Review

- **00_REVIEW_SUMMARY.md** — this document
- **01_OVERLAP_WITH_COMPLETED_STABILIZATION.md** — line-by-line cross-walk of MVP PART II items vs Phase 1 + Phase 2 artifacts
- **02_MVP_PACKAGE_BREAKDOWN_HONEST.md** — per-P0/P1 package honest estimates + agent-doable vs human-bound classification
- **03_REALISTIC_MVP_TIMELINE.md** — wave-by-wave realistic timeline with grounding rationale
- **04_NEXT_EXECUTION_PROPOSAL.md** — concrete "what to do next" with options ranked by safety + value

**Status:** Review complete. No source changes made. Ready for operator decision on which option in `04_NEXT_EXECUTION_PROPOSAL.md` to execute.
