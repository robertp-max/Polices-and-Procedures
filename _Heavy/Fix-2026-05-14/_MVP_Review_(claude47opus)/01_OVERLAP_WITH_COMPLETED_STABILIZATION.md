# MVP Plan ↔ Stabilization Phase 1 + Phase 2 Overlap Analysis

**Purpose:** Identify exactly which MVP plan items are already complete as a side-effect of the Stabilization sub-track (Phase 1 + Phase 2), so the next execution session does not redo them.

**Method:** Each PART II "Actionable Implementation Hardening" item and each PART II "19 Mandated Deliverables" item is cross-checked against:
- `_Stabilzation_(claude47opus)/PHASE_1_EXECUTION_REPORT.md`
- `_Stabilzation_(claude47opus)/PHASE_2_EXECUTION_REPORT.md`
- Actual source artifacts under `src/`, `scripts/`, `.github/`

**Status legend:**
- **DONE-BY-STAB** — Phase 1 or Phase 2 completed the work; do not redo.
- **PARTIAL** — Some part is done; remaining piece is MVP-owned.
- **MVP-OWNED** — Not done by Stabilization; remains in MVP scope.
- **HUMAN-BOUND** — Cannot be done by an agent (real users, real devices, executive sign-off).

All MVP line citations are from `_Heavy/Fix-2026-05-14/UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md`.

---

## A. PART II — "Actionable Implementation Hardening" (Cross-Walk)

> NB: The source document contains the same PART II twice (lines 753–880 and 882–1023). Both blocks have identical scope. The third "PART II — 19 Mandated Deliverables" (line 1105+) is the authoritative one for waves/priority/owners. This cross-walk uses the first appearance of each PART II item.

### §1 — Runtime Survivability Hardening (MVP L759–L773)

| MVP Item | Status | Citation |
|---|---|---|
| "form draft persistence with automatic rehydration on browser refresh" (L762) | **DONE-BY-STAB** | Phase 1 R-01: `src/policy/utils/useFormDraft.ts` (190 lines). Phase 1 R-03: wired into `ActivationPage.tsx`. |
| "`visibilitychange` + `beforeunload` listeners" (L763) | **DONE-BY-STAB** | Phase 1 R-04: hook listens to visibilitychange + pagehide + beforeunload (covers all three browsers). |
| "offline queue + retry logic for evidence uploads (IndexedDB preferred)" (L764) | **MVP-OWNED** | Phase 1 explicitly scoped IndexedDB to MVP-P1-EVIDENCE-001 (out of Stabilization scope). |
| "session recovery UI for users returning after app backgrounding or tab reload" (L765) | **DONE-BY-STAB** | Phase 2 R-06: `staleAfterMs` (24h) + `isStale` notice on ActivationPage. Phase 2 R-08: `markStep` + `lastStep` resume banner. |
| Validation gates: "Refresh test at 30%, 60%, 90% completion on 5 major forms" (L768) | **MVP-OWNED** | Currently wired only on ActivationPage (1 of 5 forms). Other 4 are eCign-Protected and Onboarding V2 forms that don't exist yet as multi-step. |
| Validation gates: "Interruption test … on eCign signing and evidence capture" (L769) | **MVP-OWNED** (R-02 deferred; Protected) | eCign integration was the explicit Phase 1 R-02 deferral per MVP §C6. |
| Validation gates: "Weak network simulation during evidence upload" (L770) | **HUMAN-BOUND** | Requires real device + throttled-network browser test (Mobile Field UAT). |

**Net for §1:** 3 of 7 items done; 3 remain MVP-owned; 1 human-bound.

### §1 (second appearance — L888-L902, near-identical content) — same status as above.

### §2 — Mobile Operational UAT (L775–L789)

| MVP Item | Status |
|---|---|
| Real-device UAT on iOS Safari + Android Chrome (L778) | **HUMAN-BOUND** |
| Throttled / intermittent network tests (L779) | **HUMAN-BOUND** |
| One-handed usability + 48 px target validation (L780) | **HUMAN-BOUND** |
| Interruption/resume behavior (call, background, low battery, screen lock) (L781) | **HUMAN-BOUND** |
| 80 % pass rate with documented test cases + real clinician participation (L784–L786) | **HUMAN-BOUND** |

**Net for §2:** 0 of 5 done; all human-bound. This is the entire Stabilization M-01…M-08 series the Stabilization plan also deferred.

### §3 — eCign + Evidence Center Protection Layer (L791–L805)

| MVP Item | Status | Citation |
|---|---|---|
| Formally designate eCign signing + print as Protected Subsystem (L794) | **PARTIAL** | Phase 1 D-02 PR template enforces "Protected Subsystem approval required" gate for `src/policy/components/FormSigningWorkspace.tsx`, `FormViewer.tsx`, `FormSignatureFlow.tsx`, `ecign/api.ts`, `server/ecign/*`. The treatment is in place but the formal "Architecture + Compliance approval workflow" assigning humans is unassigned. |
| Formally designate Evidence Center as Protected Subsystem (L795) | **PARTIAL** | Same PR template + same gap: humans unassigned. |
| Mandatory post-sign / post-upload integrity verification (hash + metadata check) (L796) | **MVP-OWNED** | This is MVP-P0-ECIGN-001 (supersede chain) + P1-AUDIT-001 (top-level targetKind/Id). Not Stabilization-owned. |
| Automated audit artifact retrieval test in every release gate (L797) | **MVP-OWNED** | Maps to Compliance Lock regression. Not yet wired in CI. |
| Signer-chain integrity test (L800) | **MVP-OWNED** | This is browser Test 2; never executed (Lead 11/12). |
| Evidence retrieval test (>4 MB blobs) (L801) | **MVP-OWNED** | This is browser Test 4; depends on P1-EVIDENCE-001 IndexedDB work; never executed. |

**Net for §3:** 0 done; 2 partial; 4 MVP-owned. The Protected Subsystem **treatment** is in place; the **enforcement and verification** is not.

### §4 — Design-System Enforcement (L807–L820)

| MVP Item | Status | Citation |
|---|---|---|
| "ESLint rules to block raw hex/rgb values and non-`--ci-*` tokens" (L810) | **PARTIAL** | Phase 1 D-01/D-03 added rules to `scripts/verifyUiDesignSystem.ts` (`tokens.hex-literal`, `tokens.rgb-literal`, `glass.stack-budget`). These are WARN-level, not blocking. True PR-blocking ESLint integration is still MVP-owned. |
| "Visual regression requirement to PR checklist" (L811) | **DONE-BY-STAB** | Phase 1 D-02 PR template includes "Visual regression artifact attached" + "verify:ui must not introduce new FAILs" gates. |
| "Enforce max-2 glass layers (Layer 3 only for elevated modals in portal)" (L812) | **PARTIAL** | Phase 1 D-03 added `glass.stack-budget` rule (currently set to >3 WARN per Lead 16 C1 arbitration, not max-2 from L812 — the plan's L812 wording differs from Lead 16's binding arbitration). Three pre-existing files exceed: `CommandCenterLayout.tsx` (5), `ModalShell.tsx` (4), `TaxonomyPage.old.tsx` (13). |
| "Begin deprecation of parallel component families (CesCard, local TabButton)" (L813) | **DONE-BY-STAB (planning)** | Phase 2 D-04: `D-04_COMPONENT_DEPRECATION_PLAN.md` — full inventory of 13 parallel components, migration recipes, owner assignment, validation gates. **The plan is written; the actual migration is MVP Wave 1 territory.** |
| "Lint rule active in CI before any new wave" (L816) | **MVP-OWNED** | Current rules are WARN-only in the verify script, not blocking in CI. |
| "100 % of new PRs touching design system pass visual regression gate" (L817) | **PARTIAL** | PR template demands it; CI enforcement of visual regression artifact upload is not wired. |

**Net for §4:** 1 done; 4 partial; 1 MVP-owned. **The deep token migration sweep (3,348 WARNs across `src/`) is the bulk of MVP-owned work here.**

### §5 — Rollback + Blast Radius Governance (L822–L835)

| MVP Item | Status | Citation |
|---|---|---|
| "Rollback Trigger Matrix" (L825) | **PARTIAL** | Phase 1 P-08 communication plan references trigger matrix; P-07 validation checklist enumerates per-subsystem checks. Full trigger matrix as a standalone artifact is folded into P-07/P-08; owner assignment (P-03) human-bound. |
| "Named rollback owners for each major subsystem" (L826) | **HUMAN-BOUND** | Phase 1 P-03 explicitly deferred (director input required). |
| "Execute at least one full rollback drill on a non-critical surface" (L827) | **HUMAN-BOUND** | Phase 1 P-05 explicitly deferred (live tabletop / restore event). |
| "Subsystem isolation boundaries documented" (L828) | **DONE-BY-STAB** | Phase 1 D-02 PR template + P-08 communication plan enumerate the 7 protected subsystems with isolation rules. |
| "Rollback drill completed and documented" (L831) | **HUMAN-BOUND** | P-05 deferred. |
| "Rollback playbook reviewed and signed off" (L832) | **HUMAN-BOUND** | Awaiting Engineering Lead + Compliance sign-off. |

**Net for §5:** 1 done; 1 partial; 4 human-bound. **The artifacts exist; the humans need to read, sign, and rehearse.**

### §6 — Navigation + Input Safety (L837–L852)

| MVP Item | Status | Citation |
|---|---|---|
| "Remove global swipe navigation" (L840) | **DONE-BY-STAB** | Phase 1 N-01: handlers removed from `CommandCenterLayout.tsx` (commit + diff in PHASE_1_EXECUTION_REPORT). |
| "Remove global left/right arrow key navigation from `CommandCenterLayout.tsx`" (L841) | **DONE-BY-STAB** | Phase 1 N-02: same commit. |
| "Restore predictable browser history behavior" (L842) | **DONE-BY-STAB** | Phase 1 N-03/N-04/N-05: `replace: true` audit, zero unsafe usages found, follow-ups documented. |
| "Validate modal/drawer escape behavior (Esc key + browser back) across all major surfaces" (L843) | **MVP-OWNED** | Not done. Originally Stabilization N-06; remained MVP-owned per overlap analysis. Requires per-surface Esc audit + browser back smoke. |
| "Audit and clean unsafe global keyboard bindings" (L844) | **PARTIAL** | Phase 1 N-01/N-02 handled the global shell ones; per-surface keyboard audit (e.g., LMS arrow keys) was scoped local-only in N-08. |
| "Browser Back/Forward tested and passing on 8+ key flows" (L847) | **MVP-OWNED** | Listed as required manual smoke in Phase 2 report §7 but never run by a human reviewer. |
| "No more global gesture hijacking in production code" (L848) | **DONE-BY-STAB** | Confirmed by code removal + verify:ui passing. |
| "Mobile gesture safety verified" (L849) | **HUMAN-BOUND** | Real device test. |

**PLUS the N-07/N-08 work added by Phase 2:**
- N-07 deep-link audit on CES + Evidence + eCign routes (15 surfaces audited; 3 safe non-protected fixes enacted): **DONE-BY-STAB (Phase 2)**
- N-08 navigation behavior documentation: **DONE-BY-STAB (Phase 2)**

**Net for §6:** 4 done; 1 partial; 2 MVP-owned; 1 human-bound. **Navigation hardening is the single most-complete area.**

### §7 — Go/No-Go Governance (L854–L867)

| MVP Item | Status | Citation |
|---|---|---|
| "Explicit P0 runtime gates that must pass before any wider UAT exposure" (L857) | **MVP-OWNED** | Phase 1 V-07 documented Stabilization sub-track success metrics only, **explicitly NOT MVP go/no-go**. The true MVP gate definition lives in Lead 16 §19 (Go/No-Go MVP Readiness Assessment) and requires operator confirmation per checklist L1087–L1100. |
| "Mobile survivability gates (real device + degraded network)" (L858) | **HUMAN-BOUND** | Mobile Field UAT cohort. |
| "eCign and Evidence integrity gates" (L859) | **MVP-OWNED** | These are MVP-P0-ECIGN-001/002 + MVP-P1-EVIDENCE-001 acceptance criteria. |
| "Deployment hold conditions if any P0 gate fails" (L860) | **PARTIAL** | Lead 16 §19 binds NO-GO conditions. Operational tripwire (auto-hold on CI failure) not implemented. |
| "P0 gates documented with pass/fail criteria" (L863) | **DONE-BY-PLAN** | Lead 12 §6 binary pass criteria per browser test, plus Lead 16 mandatory checklist L1087–L1100. |
| "Reviewed and approved by Engineering, QA, and Compliance" (L864) | **HUMAN-BOUND** | Sign-off event. |

**Net for §7:** 1 done (by the plan itself); 1 partial; 2 MVP-owned; 2 human-bound.

### §8 — Ownership + Validation (L869–L879)

| MVP Item | Status | Citation |
|---|---|---|
| "Assign named owner to every major actionable item" (L872) | **HUMAN-BOUND** | Director assignment. |
| "Define clear validation requirement and success criteria for each item" (L873) | **DONE-BY-PLAN** | Lead 12 + Lead 16 cover this. |
| "Document rollback implication if the item fails validation" (L874) | **DONE-BY-STAB** | Phase 1 P-08 communication plan + P-07 validation checklist. |
| "Add all items to a single tracked backlog" (L875) | **HUMAN-BOUND** | Notion/Linear/GitHub Project setup. |

**Net for §8:** 1 done by plan; 1 done by Stab; 2 human-bound.

---

## B. Quantitative Roll-Up Of PART II "Hardening" Coverage

| Category | Total items | Done by Stab | Partial | MVP-owned | Human-bound |
|---|---|---|---|---|---|
| §1 Runtime Survivability | 7 | 3 | 0 | 3 | 1 |
| §2 Mobile UAT | 5 | 0 | 0 | 0 | 5 |
| §3 eCign+Evidence Protection | 6 | 0 | 2 | 4 | 0 |
| §4 Design-System Enforcement | 6 | 1 | 4 | 1 | 0 |
| §5 Rollback Governance | 6 | 1 | 1 | 0 | 4 |
| §6 Navigation+Input Safety | 8 (+2 added by P2) | 6 | 1 | 2 | 1 |
| §7 Go/No-Go Governance | 6 | 1 | 1 | 2 | 2 |
| §8 Ownership+Validation | 4 | 2 | 0 | 0 | 2 |
| **Totals** | **48** | **14** (29 %) | **9** (19 %) | **12** (25 %) | **15** (31 %) |

**Read:** Roughly 30 % of the MVP plan's PART II hardening scope is **already done** by Stabilization. Another 20 % is partial (documented, but enforcement / migration / sign-off remains). 25 % is genuinely MVP-owned new code/architecture work. 31 % is human-bound (real users, real devices, sign-off events) and cannot be completed by any agent.

---

## C. PART II "19 Mandated Deliverables" — What Stabilization Touched

| Deliverable | Status |
|---|---|
| 1. Executive Summary | Plan-owned; not a deliverable Stab built |
| 2. Unified Architecture Alignment Report | Plan-owned (Lead 1–14 synthesis) |
| 3. UI/UX + MVP QA/UAT Crosswalk | Plan-owned (Lead 1–13 synthesis) |
| 4. Conflict & Drift Analysis | Plan-owned (Lead 16 arbitration) |
| 5. Unified Priority Matrix | Plan-owned |
| 6. Mobile Operational Standards | Plan-owned (Lead 2) |
| 7. Desktop Operational Standards | Plan-owned (Lead 3) |
| 8. Accessibility Compliance Alignment | Plan-owned (Lead 7) |
| 9. Declutter & Simplification Alignment | Plan-owned (Lead 8) |
| 10. CES / eCign / Evidence Runtime Alignment | Plan-owned (Lead 14 + Lead 5 + Lead 6) |
| 11. Runtime Validation Strategy | Plan-owned (Lead 11) |
| 12. Browser Validation Gates | Plan-owned (Lead 12) |
| 13. Regression Risk Matrix | Plan-owned (Leads 5, 6, 11) |
| 14. Protected / Frozen Systems | Plan-owned; **Phase 1 D-02 PR template OPERATIONALIZES this list** |
| 15. Design System Enforcement Rules | Plan-owned; **Phase 1 D-01/D-02/D-03 + Phase 2 D-04 BUILD the enforcement tooling and deprecation plan** |
| 16. Canonical Ownership Map | Plan-owned; one open item (`signerTaskFactory.ts` not found in src) |
| 17. Unified Execution Waves | Plan-owned (Lead 16) |
| 18. Rollback Strategy | Plan-owned; **Phase 1 P-07 + P-08 EXTEND the strategy into operational artifacts** |
| 19. Final Go/No-Go MVP Readiness | Plan-owned (Lead 16) |

The 19 mandated deliverables are by design **planning artifacts**. Stabilization Phase 1 + Phase 2 did not redo them; instead, Phases 1 + 2 **operationalized** items 14, 15, and 18 into shipping tooling and PR-gating templates.

---

## D. Implications For The Next Execution Session

1. **Do not re-open** any "DONE-BY-STAB" item. They are validated (tsc clean, build green, verify:ui 0 FAILs) and live in the repo.
2. **"PARTIAL" items in §4 (Design System) and §3 (eCign Protection)** are the highest-leverage cleanup opportunities: the policy/contract layer is built; what's missing is the PR-blocking CI enforcement and the deep migration sweep.
3. **"MVP-OWNED" items** are the actual MVP development backlog (~12 items) and should drive Wave 1–6 prioritization.
4. **"HUMAN-BOUND" items (15)** — half of the entire PART II hardening list — explain why "MVP done tonight" is not achievable. Real users, real devices, executive sign-offs, sign-off events. These are calendar-bound, not agent-bound.

See `02_MVP_PACKAGE_BREAKDOWN_HONEST.md` for per-P0/P1 package estimates and agent-doable vs human-bound classification.
