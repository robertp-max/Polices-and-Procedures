# Realistic MVP Timeline

**Purpose:** Convert the MVP plan's 8 abstract "Waves" into a calendar-grounded execution plan with honest agent-day costs, sequencing constraints, and human-bound milestones.

**Authority:** Estimates from `02_MVP_PACKAGE_BREAKDOWN_HONEST.md`. Sequencing from Lead 16 §17 and Lead 11 §11 (validation discipline).

**Assumption:** "Working day" = ~6 focused agent-hours including validation gates. Owner review wait + human-bound events are reported as calendar days separately.

---

## 1. Wave-By-Wave Calendar Map

### Wave 0 — Reality Check (gates everything else)

| Item | Agent-days | Calendar | Who |
|---|---|---|---|
| Execute 9 browser tests against `main` + capture artifacts | 1.5 | 1–2 days | 1 agent + 1 human reviewer for pass/fail confirmation |
| Charter simulated cohort (Lead 12 — nursing lab + actor patient + interruption + weak-signal protocols) | 0 (doc) | 2–5 days | Human (Engineering Lead + QA Lead) |
| Confirm `signerTaskFactory.ts` status (open Lead 4 conflict) | 0.25 | 1 day | 1 agent |
| Resolve duplicate PART II in MVP plan document | 0 (edit) | 0.5 day | Human (Primary Orchestration Lead) |

**Wave 0 total: ~2 agent-days + 3–7 calendar days waiting on human coordination.**

**Gate to Wave 1:** All 9 browser tests pass against `main` with logged artifacts. If any test fails, that failure is itself a Wave 1 P0 input.

---

### Wave 1 — CES Identity + Theme + Mobile Primitives

**Critical-path packages (must complete in order):**
1. `BottomSheetDrawer.tsx` primitive (0.5 days) — blocks any consumer that needs <1024 px drawer
2. `SignaturePad.tsx` primitive 320 px (1.5 days) — blocks eCign mobile work in Wave 3
3. MVP-P0-CES-001 form_instance_id propagation (4 days, requires CES architecture sign-off)
4. CES theme.ts → --ci-* unification (~2 days, touches `ces/theme.ts`, `CesCard`, ~20 consumer files; serializes on `ces/components/primitives.tsx`)
5. MVP-P0-AUTH-001 Vercel alignment (1.5 days)
6. MVP-P0-AUTH-002 CSV enforcement (1 day)
7. Browser Test 6 execution (P0-CES-001 gate)

| Allocation | Agent-days | Calendar |
|---|---|---|
| Single agent | 10.5 | 3 working weeks (with owner waits) |
| 4 agents (CES architecture sign-off bottleneck on CES-001) | ~6 effective agent-days | ~1.5 working weeks |
| 8 agents (no further speedup; serialization on `theme.ts` + `CommandCenterLayout.tsx` + Compliance Lock) | ~5 effective | ~1.5 weeks |

**Realistic calendar (4-agent allocation): ~7–10 working days, depending on architecture-review responsiveness.**

**Gate to Wave 2:** Browser Test 6 PASS + CES theme verifier check + Compliance Lock regression PASS.

---

### Wave 2 — Evidence + Audit + Composite Tasks + Nav Slot

**Critical-path packages:**
1. MVP-P0-TASK-001 composite collapse (7 days) — spans `taskProjectionCore.ts` + 5 consumer surfaces; **feature-flagged** (flag.composite-form-signers per L1208)
2. MVP-P1-EVIDENCE-001 IndexedDB adapter (6.5 days) — net-new
3. MVP-P1-AUDIT-001 top-level fields + dual-write (3.5 days)
4. MVP-P1-ARTIFACT-001 deterministic reverse lookup (2 days)
5. CommandCenterLayout MOBILE_PRIMARY_TABS "Workflows" → "Evidence" (Lead 16 C11) (~0.5 day)
6. `PhotoEvidenceCapture.tsx` primitive (1 day)
7. `LoadingState.tsx` primitive (0.5 day)
8. Browser Tests 4 + 5

| Allocation | Agent-days | Calendar |
|---|---|---|
| Single agent | 21 | 5+ working weeks |
| 4 agents (TASK-001 serializes on `taskProjectionCore.ts`; EVIDENCE-001 has its own track; AUDIT-001 + ARTIFACT-001 are smaller and can run in parallel) | ~7 effective | ~2 working weeks |
| 8 agents | ~6 effective | ~1.5 working weeks |

**Wave 2 has the most parallelism opportunity because the 4 main packages touch largely disjoint files. The bottleneck is EVIDENCE-001 (6.5 days) and TASK-001 (7 days) running in parallel — overall calendar is set by the longer of the two.**

**Realistic calendar (4-agent allocation): ~2–3 working weeks.**

**Gate to Wave 3:** Browser Tests 4 + 5 PASS + Compliance Lock regression PASS + TASK-001 feature flag flip-test passes.

---

### Wave 3 — eCign + Accessibility P0 (highest legal risk)

**Critical-path packages:**
1. MVP-P0-ECIGN-001 supersede patch (4.25 days, **eCign architecture sign-off required**)
2. MVP-P0-ECIGN-002 stored PDF capture (6 days, **depends on EVIDENCE-001 IndexedDB to handle >4 MB PDFs cleanly**)
3. MVP-P0-A11Y-001 FormViewer labels (4 days, Protected file)
4. MVP-P0-A11Y-002 WorkflowExecutionPanel drawer dialog (2.5 days)
5. MVP-P0-A11Y-003 aria-live regions across 4 surfaces (2.5 days)
6. Browser Tests 2 + 3 + manual SR/keyboard

**Serialization:** ECIGN-001 + ECIGN-002 + A11Y-001 all touch `FormSigningWorkspace.tsx` / `FormViewer.tsx`. **One lead editor only** (per Phase 1 serialization rule we already proved works). A11Y-002 touches WorkflowExecutionPanel which serializes with CES-001 (Wave 1 dependency). A11Y-003 touches 4 frozen files in sequence.

| Allocation | Agent-days | Calendar |
|---|---|---|
| Single agent | 19.25 | 5+ working weeks |
| 4 agents (serialization VERY tight on eCign files; effective parallelism ~2× max) | ~10 effective | ~3 working weeks |
| 8+ agents | no improvement past 2× | ~3 working weeks |

**Wave 3 has the LEAST parallelism. Almost every package touches a frozen/Protected file. eCign architecture sign-off is the dominant cost driver.**

**Realistic calendar: ~3–4 working weeks (mostly waiting on eCign architecture review + signed PDF design decision).**

**Gate to Wave 4:** Browser Tests 2 + 3 PASS (multi-signer single canonical artifact + byte-identical stored PDF retrieval) + manual SR/keyboard pass + Compliance Lock regression PASS. **This is the highest-risk gate in the entire MVP.**

---

### Wave 4 — Calendar Sync + Permissions + A11Y P1 + eCign P1

**Critical-path packages:**
1. MVP-P1-CALENDAR-001 `selectCanonicalTasksForEvent` (5.5 days, 5 consumers)
2. MVP-P1-A11Y-004 tree/grid ARIA (3.5 days)
3. MVP-P1-A11Y-005 snapshot ARIA preservation (3 days, Protected — depends on ECIGN-002 design)
4. MVP-P1-A11Y-006 roving tabIndex (1.5 days, serializes with A11Y-002/004)
5. MVP-P1-ECIGN-003 server role re-check (3.5 days post-decision, Architecture-decision dependent)
6. MVP-P1-ECIGN-004 required-fields gate (3 days)
7. MVP-P1-PERMS-001 Trainer (1.5 days)
8. Browser Tests 8 + 9 + manual SR/keyboard + Test 2 re-run

| Allocation | Agent-days | Calendar |
|---|---|---|
| Single agent | 21.5 | ~5 working weeks |
| 4 agents (CALENDAR-001 + PERMS-001 + ECIGN-003/004 can run truly parallel; A11Y-004/005/006 mostly serialize) | ~7 effective | ~2 working weeks |

**Realistic calendar: ~2–3 working weeks.**

**Gate to Wave 5:** Browser Tests 8, 9 PASS + manual SR/keyboard pass + Test 2 re-run PASS (multi-signer with required-fields gate) + Compliance Lock regression PASS.

---

### Wave 5 — Print Fidelity

| Item | Estimate |
|---|---|
| MVP-P1-PRINT-001 (build shared utils + migrate 4 print systems) | 5.5 days |
| Browser Test 7 | included |
| Visual regression | included |

| Allocation | Agent-days | Calendar |
|---|---|---|
| Single agent | 5.5 | 1.5 working weeks |
| 2 agents | ~3 effective | ~1 working week |
| 4+ agents (4 consumers each take ~0.5–1 day; near-linear parallelism possible after shared utils built) | ~2.5 effective | ~3–5 working days |

**Realistic calendar: ~1 working week.**

**Gate to Wave 6:** Browser Test 7 PASS + visual regression snapshots updated.

---

### Wave 6 — Visual Regression + Full 9-Test Re-Run

| Item | Estimate |
|---|---|
| Update visual regression baselines for all major surfaces (Lead 11 L1202 enumerates 10 baselines) | 1 day |
| Full re-execution of 9 browser tests | 1.5 days |
| Document any regressions in `_Heavy/Fix-2026-05-14/wave-6/` | 0.5 day |

**Realistic calendar: ~3–5 working days.**

**Gate to Wave 7:** All 9 tests PASS + Compliance Lock regression PASS + zero P0/P1 open.

---

### Wave 7 — Real-Agency Cohort

**This wave is entirely human-bound.**

| Item | Calendar |
|---|---|
| Executive sponsor sign-off | 1–2 weeks |
| Recruit + brief 12–15 field clinicians + 4–6 DONs + 3–5 surveyors | 2–4 weeks |
| Conduct sessions on real devices in real conditions | 1–2 weeks |
| Synthesize findings + agree on rollback or proceed | 1 week |

**Realistic calendar: 6–10 weeks from "Wave 6 complete" to "real-agency sign-off."**

---

### Wave 8 — Post-MVP Defer Items

Explicitly excluded from MVP cut per Lead 16 L1077. Items: Builder/Bin hygiene, generic PrintPage alignment, StagingM01 removal, full mobile reconstruction per `MOBILE_FIRST_UX_RECONSTRUCTION_STRATEGY.md`. These are tracked but not gated.

---

## 2. Aggregate Calendar — Honest Three Scenarios

### Scenario A — Single Full-Time Agent

Sequential, no parallelism, normal owner-review waits.

| Wave | Calendar | Cumulative |
|---|---|---|
| Wave 0 | 1 week (test execution + human coordination) | 1 wk |
| Wave 1 | 3 working weeks | 4 wks |
| Wave 2 | 5 working weeks | 9 wks |
| Wave 3 | 5+ working weeks (eCign reviews) | 14+ wks |
| Wave 4 | 5 working weeks | 19+ wks |
| Wave 5 | 1.5 working weeks | 20.5 wks |
| Wave 6 | 1 working week | 21.5 wks |
| **Sub-total to "Production NO-GO → CONDITIONAL GO"** | | **~22 working weeks (~5–6 months)** |
| Wave 7 | 6–10 weeks human-bound | **30–32 calendar weeks (~7–8 months)** |

### Scenario B — 4 Agents (Phase-1-style allocation, current reality)

Parallel where possible; serialized on frozen files; respects Compliance Lock.

| Wave | Calendar |
|---|---|
| Wave 0 | 1 week |
| Wave 1 | 1.5 working weeks |
| Wave 2 | 2–3 working weeks |
| Wave 3 | 3–4 working weeks |
| Wave 4 | 2–3 working weeks |
| Wave 5 | 1 working week |
| Wave 6 | 3–5 days |
| **Sub-total Waves 0–6** | **~10–13 working weeks (~2.5–3 months)** |
| Wave 7 | 6–10 weeks human-bound | **~16–22 calendar weeks (~4–5 months)** |

### Scenario C — 8+ Agents (Aggressive Allocation)

Marginal speedup over Scenario B because of serialization ceiling.

| Wave | Calendar |
|---|---|
| Wave 0 | 1 week (human-bound test review can't be parallelized) |
| Wave 1 | 1.5 weeks (CES architecture sign-off is the bottleneck) |
| Wave 2 | 1.5 weeks (EVIDENCE-001 and TASK-001 still set the pace) |
| Wave 3 | 3 weeks (eCign serialization is hard ceiling) |
| Wave 4 | 2 weeks |
| Wave 5 | 3 days |
| Wave 6 | 2 days |
| **Sub-total Waves 0–6** | **~9–10 working weeks (~2 months)** |
| Wave 7 | 6–10 weeks human-bound | **~15–20 calendar weeks (~4 months)** |

**Doubling agents from 4 to 8 saves ~1–2 working weeks total. Going beyond 8 produces near-zero additional gains because the serialization ceiling is set by frozen files + Compliance Lock regression + eCign architecture review responsiveness.**

---

## 3. The "Tonight" / "This Weekend" Reality Check

The Stabilization Phase 1 + Phase 2 work demonstrated that:
- 6 Stabilization-unique tasks + 4 deep documentation artifacts = ~90 minutes orchestrator + 3 parallel subagents.
- This was possible because the scope was small (~315 lines new TypeScript), the files were non-Protected, and validation gates were lightweight.

**The MVP plan is roughly 80–100× the size and complexity:**
- ~12 P0/P1 packages each touching 1–5 source files
- 4 new primitives totaling ~3.5 days of pure UI work
- 9 manual browser tests with binary pass criteria
- Compliance Lock regression on every PR
- Real-device UAT and real-agency cohort

**Conclusion: "MVP tonight" is not achievable. "MVP this weekend" is not achievable. "MVP this month" requires a 4-agent allocation, no architecture-review surprises, and no real-device failure modes. The honest framing is 2–4 months calendar time for Waves 0–6 plus another 1.5–2 months for Wave 7.**

---

## 4. What CAN Be Done In A Single Session

If the operator wants to make one focused agent-led session valuable without slipping into scope creep, the highest-leverage options (in priority order):

| Option | Duration | Output | Risk |
|---|---|---|---|
| **A. Build the 4 missing mobile primitives** (BottomSheetDrawer, SignaturePad, PhotoEvidenceCapture, LoadingState) | ~3.5 agent-days condensed to ~6 hours with 4 parallel subagents | 4 ready-to-consume primitives that unblock Waves 1–2 | Low (no Protected files, no behavior change to existing surfaces) |
| **B. Execute Wave 0 (9 browser tests against `main`)** | ~4–6 hours | Wave 1 gate cleared; baseline artifacts in `execution-logs/` | Low (test execution only; pass/fail confirmation by human reviewer) |
| **C. Build MVP-P1-ARTIFACT-001 (deterministic reverse lookup) and MVP-P1-AUDIT-001 (top-level fields dual-write)** | ~5.5 agent-days condensed to ~1–2 hours with 2 parallel sub-tracks | 2 Wave 2 packages shipped with fallback paths | Medium (touches `cesFormInstanceId.ts` + audit emitter; owner sign-off advisable) |
| **D. Build MVP-P1-PERMS-001 (Trainer permission boundary) + MVP-P1-CALENDAR-001 (selectCanonicalTasksForEvent unification)** | ~7 agent-days condensed to ~2–3 hours | 2 Wave 4 packages shipped (TRA gate + 4-view sync) | Medium (CALENDAR-001 touches 5 consumers, but each consumer change is small) |
| **E. Build the duplicate-PART-II cleanup proposal + signerTaskFactory.ts resolution memo + a 30-day MVP execution roadmap** | ~1 hour | Documentation cleanup that unblocks the plan itself | Zero |

The Phase 2 model (4–5 effective agents, 1 orchestrator + 3 subagents, ~70 minutes) is the right template for any of A, B, C, D individually. Combining more than one in a single session is feasible but starts to risk merge conflicts on shared files.

See `04_NEXT_EXECUTION_PROPOSAL.md` for the recommendation.
