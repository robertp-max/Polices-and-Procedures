# MVP Package Breakdown — Honest Per-Package Estimates

**Purpose:** For each P0 and P1 package in the MVP plan, provide:
- Honest single-agent time estimate
- Agent-doable vs human-bound classification
- Frozen-file touch + owner-gate count
- Current code-grounding status (does the required infra exist?)
- Dependencies + serialization risks

**Time estimate unit:** **working-day** = ~6 hours of focused agent execution including validation gates (tsc, build, verify scripts, browser test gate, Compliance Lock if applicable). Excludes owner-review wait time and human sign-off events.

**Authority source:** MVP plan §5 Unified Priority Matrix (L1157–L1175), §16 Canonical Ownership Map, §17 Unified Execution Waves.

---

## A. P0 Packages (Critical Path To MVP Cut)

### MVP-P0-AUTH-001 — Vercel auth/deploy alignment
**Wave:** 0–1 | **Leads:** L11, L12 | **Browser Test:** Test 1
**Touches frozen files:** `vercel.json` (Lead 16 §14 frozen list)
**Code grounding:** `vercel.json.bak` exists (per L1208 regression matrix)

| Aspect | Estimate |
|---|---|
| Implementation | 0.5 day |
| Browser Test 1 execution + artifact capture | 0.5 day |
| Compliance Lock regression | 0.5 day |
| **Total single agent** | **~1.5 working days** |

**Agent-doable:** Yes (config + smoke test). **Risk:** Low (`.bak` rollback path).

---

### MVP-P0-AUTH-002 — CSV approved-users registration enforcement
**Wave:** 0–1 | **Leads:** L12 | **Browser Test:** none (config)
**Touches frozen files:** `src/auth/AuthProvider.tsx` (frozen), `server/auth/approvedUsers.ts`
**Code grounding:** Files exist.

| Aspect | Estimate |
|---|---|
| Implementation | 0.5 day |
| Verify existing users against CSV (no auto-disable — L1208) | 0.5 day |
| **Total single agent** | **~1 working day** |

**Agent-doable:** Yes. **Risk:** Low (audit-only mode first).

---

### MVP-P0-CES-001 — `form_instance_id` propagation
**Wave:** 1 | **Leads:** L4, L14 | **Browser Test:** Test 6
**Touches frozen files:** `cesFormInstanceId.ts` (Lead 16 §14 owner-led only), `useEventExecutionDataflow.ts`, `WorkflowExecutionPanel.tsx`
**Code grounding:** All 3 files exist. `cesFormInstanceId.ts` is sole ID builder (Lead 14 L689); needs to be called BEFORE navigation in `WorkflowExecutionPanel`.

| Aspect | Estimate |
|---|---|
| Read existing code paths + identify navigation seam | 0.5 day |
| Implement: thread `form_instance_id` from store → URL → FormViewer | 1 day |
| Update `useEventExecutionDataflow.ts` threading | 0.5 day |
| Run `verify:task-identity` + `verify:pm-unified` + `verify:alignment` | 0.5 day |
| Browser Test 6 execution + artifact (`?form_instance_id=` deep-link hydration) | 0.5 day |
| Compliance Lock regression | 1 day |
| **Total single agent** | **~4 working days** |

**Agent-doable:** Yes, but **requires CES architecture sign-off** (frozen file rule). **Risk:** Medium. **Single most important P0 — unblocks Wave 1 entirely.**

---

### MVP-P0-ECIGN-001 — Single canonical artifact via supersede chain
**Wave:** 3 | **Leads:** L5, L1, L13 | **Browser Test:** Test 2
**Touches frozen files:** `FormSigningWorkspace.tsx` (Protected — Lead 16 C6), `ecign/api.ts`
**Code grounding:** **Patch file is ready:** `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/patches/2026-05-14-P0-01-MultiSigner-Artifact-Supersede.patch` — replaces remove+upload loop with `supersedeEvidence` call.

| Aspect | Estimate |
|---|---|
| Apply patch | 0.25 day |
| Implement `supersedeEvidence` in `ecign/api.ts` if not already there | 1 day |
| Legacy artifact migration path (per L1208 fallback resolver one release) | 1 day |
| Run `check:ecign-routes` + `check:evidence-phase*` | 0.5 day |
| Browser Test 2 (DON Asst → DON multi-signer) + artifact capture | 0.5 day |
| Compliance Lock regression | 1 day |
| **Total single agent** | **~4.25 working days** |

**Agent-doable:** Yes (patch exists), BUT **mandatory eCign Architecture + Compliance sign-off** (Protected Subsystem rule, MVP §C6, Phase 1 R-02 deferral precedent). **Risk:** HIGH — legal-defensibility chain. **Do not apply unsupervised.**

---

### MVP-P0-ECIGN-002 — Byte-identical stored PDF retrieval
**Wave:** 3 | **Leads:** L5, L13 | **Browser Test:** Test 3
**Touches frozen files:** `FormSigningWorkspace.tsx` (Protected), `FormViewer.tsx` (Protected), `localDemoAdapter.ts` (owner-led)
**Code grounding:** No existing PDF-capture-at-lock pipeline; will be net-new code.

| Aspect | Estimate |
|---|---|
| Design: where in lock flow to capture PDF bytes | 0.5 day |
| Implement: HTML → PDF rasterizer or capture (`html2pdf.js` / `jsPDF` / `chrome.runtime.print`) | 2 days |
| Store bytes in IndexedDB (depends on P1-EVIDENCE-001 ordering) OR localStorage with size warning | 1 day |
| Replace Download/Print/Open re-render path with stored-byte retrieval | 1 day |
| Browser Test 3 (byte-identical retrieval across 3 surfaces) + artifact | 0.5 day |
| Compliance Lock regression | 1 day |
| **Total single agent** | **~6 working days** |

**Agent-doable:** Yes (technical), but **eCign sign-off required** + likely **dependency on P1-EVIDENCE-001 IndexedDB ordering** (otherwise PDFs hit localStorage 4 MB cliff). **Risk:** HIGH — touches print + storage + Protected Subsystem.

---

### MVP-P0-A11Y-001 — FormViewer form-label ARIA
**Wave:** 3 | **Leads:** L7 | **Browser Test:** Manual SR + keyboard
**Touches frozen files:** `FormViewer.tsx` (Protected — Lead 16 C6)
**Code grounding:** Field component lines ~499–626 (per Lead 7 L362).

| Aspect | Estimate |
|---|---|
| Audit every Field for `<label htmlFor>` + `aria-describedby` for help text | 0.5 day |
| Implement label + id + aria-* across all field types | 1.5 days |
| Manual VoiceOver + NVDA pass | 1 day |
| Visual diff (sr-only additions; per L1208 sr-only only) | 0.5 day |
| Compliance Lock regression | 0.5 day |
| **Total single agent** | **~4 working days** |

**Agent-doable:** Yes (additive sr-only changes are low-risk per L1208 mitigation). **eCign sign-off advisable** but lower-stakes than supersede.

---

### MVP-P0-A11Y-002 — WorkflowExecutionPanel drawer dialog semantics + focus trap
**Wave:** 3 | **Leads:** L7 | **Browser Test:** Manual SR + keyboard
**Touches frozen files:** `WorkflowExecutionPanel.tsx` (per Lead 7 owner — also P0-CES-001 consumer)
**Code grounding:** Drawer at line 1757 (per Lead 7 L363); no `role="dialog"` yet.

| Aspect | Estimate |
|---|---|
| Add `role="dialog"` + `aria-modal` + `aria-labelledby` | 0.5 day |
| Implement focus trap primitive (or reuse existing — depends on RightDrawer trap quality) | 1 day |
| Focus return on close + Esc handler | 0.5 day |
| Manual SR + keyboard pass | 0.5 day |
| **Total single agent** | **~2.5 working days** |

**Agent-doable:** Yes. **Risk:** Low (additive). **Serializes with MVP-P0-CES-001** (same file).

---

### MVP-P0-A11Y-003 — aria-live regions for signing / evidence / section transitions
**Wave:** 3 | **Leads:** L7 | **Browser Test:** Manual SR
**Touches frozen files:** `FormViewer.tsx`, `FormSigningWorkspace.tsx`, `EvidenceCenterPage.tsx`, `WorkflowExecutionPanel.tsx`

| Aspect | Estimate |
|---|---|
| Add polite live regions to 4 surfaces | 1 day |
| Add assertive live regions for critical errors | 0.5 day |
| Manual SR test on each surface | 1 day |
| **Total single agent** | **~2.5 working days** |

**Agent-doable:** Yes. **Risk:** Low. **Touches 4 frozen files in series** (serialization).

---

### MVP-P0-TASK-001 — Composite "Form + Signers" view-only collapse
**Wave:** 2 (elevated from P2 per Lead 16 C8) | **Leads:** L8, L1 | **Browser Test:** Manual review
**Touches frozen files:** `taskIdentity.ts` is **architecturally frozen** (Lead 16 §14) — but TASK-001 says "view-only collapse, backend untouched" so the frozen file should NOT be touched. **Real targets:** `taskProjectionCore.ts`, `taskProjection.ts`, `WorkflowExecutionPanel.tsx`, `MyTasksPage.tsx`, `EvidenceCenterPage.tsx`, Sprint/Kanban/Gantt views.
**Code grounding:** All consumer surfaces exist. Note: `signerTaskFactory.ts` referenced in plan does NOT exist in `src/policy/compliance-execution/` (Lead 4 open conflict; confirmed by grep). Either it was renamed/inlined or the plan documentation is stale.

| Aspect | Estimate |
|---|---|
| Audit current projection paths across 5 surfaces | 1 day |
| Implement composite projector in `taskProjectionCore.ts` (view-only, behind `flag.composite-form-signers` per L1208) | 1.5 days |
| Wire into WorkflowExecutionPanel + MyTasksPage + Sprint/Kanban/Gantt + EvidenceCenter | 2 days |
| Run all `verify:*` scripts (counts must remain stable for audit) | 0.5 day |
| Manual review per surface | 1 day |
| Compliance Lock regression | 1 day |
| **Total single agent** | **~7 working days** |

**Agent-doable:** Yes, but spans 5 surfaces with serialization risk on `taskProjectionCore.ts`. **Largest P0 package by surface area.**

---

## B. P1 Packages

### MVP-P1-EVIDENCE-001 — IndexedDB-class blob persistence
**Wave:** 2 | **Leads:** L6 | **Browser Test:** Test 4
**Touches frozen files:** `localDemoAdapter.ts` (owner-led — Lead 16 C7), `cesEvidenceHierarchy.ts` (frozen — but should not need changes)
**Code grounding:** No existing IndexedDB adapter (grep confirms only `storageMode.ts` references the term). Net-new.

| Aspect | Estimate |
|---|---|
| Design new `IndexedDBEvidenceAdapter` API (mirror `localDemoAdapter` surface) | 0.5 day |
| Implement adapter with versioned schema + cleanup + quota handling | 2 days |
| Dual-write window: write to both old + new path for one release (per Lead 6) | 1 day |
| Migrate existing localStorage blobs (one-shot) | 0.5 day |
| Browser Test 4 (refresh persistence) + artifact | 0.5 day |
| Test on Safari iOS (IndexedDB quirks) | 1 day |
| Compliance Lock regression | 1 day |
| **Total single agent** | **~6.5 working days** |

**Agent-doable:** Yes (technical), but **owner sign-off** + browser matrix testing make it the **largest P1 by complexity**.

---

### MVP-P1-AUDIT-001 — Top-level `targetKind`/`targetId` audit fields
**Wave:** 2 | **Leads:** L6, L14 | **Browser Test:** Test 5
**Touches frozen files:** `taskAuditEvent.ts`, server audit emitter (per Lead 14 L708 — `server/identity/...`)
**Code grounding:** Current audit emitter buries fields under `after.*` (per Lead 6 L321).

| Aspect | Estimate |
|---|---|
| Update audit emitter to populate top-level fields | 0.5 day |
| Dual-write `after.*` for one release (per Lead 14 L691) | 0.5 day |
| Update all read sites (AuditModePage, ArtifactViewerPage links, Evidence Center audit rows) | 1 day |
| Browser Test 5 (top-level + link resolution) + artifact | 0.5 day |
| Compliance Lock regression | 1 day |
| **Total single agent** | **~3.5 working days** |

**Agent-doable:** Yes. **Risk:** Low (dual-write rollback path).

---

### MVP-P1-ARTIFACT-001 — Deterministic artifact → form_instance reverse lookup
**Wave:** 2 | **Leads:** L6, L14 | **Browser Test:** Test 5
**Touches frozen files:** `cesFormInstanceId.ts` (Lead 16 C7 owner-led), `ArtifactViewerPage.tsx` (Lead 16 §14 frozen)
**Code grounding:** Current `resolveFormInstanceFromArtifactCandidates` heuristic + legacy `--` fallback exists in `ArtifactViewerPage.tsx` (per Lead 6 L322; confirmed in Phase 2 N-07 audit lines 189–245).

| Aspect | Estimate |
|---|---|
| Implement `cesFormInstanceId.fromArtifact(artifactId)` deterministic lookup | 0.5 day |
| Replace heuristic in ArtifactViewerPage (keep heuristic as fallback one release per L1208) | 0.5 day |
| Browser Test 5 link resolution + artifact | 0.5 day |
| Compliance Lock regression | 0.5 day |
| **Total single agent** | **~2 working days** |

**Agent-doable:** Yes. **Risk:** Low (fallback retained).

---

### MVP-P1-CALENDAR-001 — `selectCanonicalTasksForEvent` unification
**Wave:** 4 | **Leads:** L9 | **Browser Test:** Test 8
**Touches frozen files:** `taskProjectionCore.ts`, `obligationSelectors.ts`, `eventTaskAdapter.ts` (Lead 9 L470–L476)
**Code grounding:** **`selectCanonicalTasksForEvent` does not yet exist** (grep confirms zero hits in `src/`). Net-new selector.

| Aspect | Estimate |
|---|---|
| Build `selectCanonicalTasksForEvent` in `taskProjectionCore.ts` | 1 day |
| Migrate MasterCalendar to use selector | 0.5 day |
| Migrate Sprint / Kanban / Gantt / MyTasks to use selector | 1.5 days |
| Composite-event-ID dedup logic | 0.5 day |
| Browser Test 8 (4-view sync after CES action + refresh) + artifact | 0.5 day |
| All `verify:*` scripts | 0.5 day |
| Compliance Lock regression | 1 day |
| **Total single agent** | **~5.5 working days** |

**Agent-doable:** Yes. **Risk:** Medium (5 consumers; subtle reshape vs re-project distinction).

---

### MVP-P1-PRINT-001 — Print fidelity unification
**Wave:** 5 | **Leads:** L5, L13 | **Browser Test:** Test 7
**Touches frozen files:** `GVGBPrintDocument.tsx`, `PrintPage.tsx`, `FormPrintView.tsx` (all in Lead 16 §14 frozen), `FormSigningWorkspace.tsx` `buildPrintablePacketHtml` (Protected)
**Code grounding:** 5 print systems exist (Lead 13 L630). All need to converge on `ui/print/*` shared utils (which don't exist yet).

| Aspect | Estimate |
|---|---|
| Build shared `ui/print/*` (PrintableSection, PrintableTable, PrintableHeader) | 1.5 days |
| Migrate GV-GB-001 print → shared utils | 0.5 day |
| Migrate PrintPage → shared utils | 0.5 day |
| Migrate FormPrintView → shared utils | 0.5 day |
| Migrate eCign `buildPrintablePacketHtml` → shared utils (Protected — sign-off required) | 1 day |
| Browser Test 7 (GV-GB-001 print fidelity, no eCign bleed) + artifact | 0.5 day |
| Visual regression (per L1208 snapshot test on each path before+after) | 1 day |
| **Total single agent** | **~5.5 working days** |

**Agent-doable:** Yes. **eCign sign-off required for `buildPrintablePacketHtml` migration.**

---

### MVP-P1-ECIGN-003 — Server-side role re-check before lock
**Wave:** 4 | **Leads:** L5 | **Browser Test:** server/Postman
**Touches frozen files:** `server/ecign/stateMachine.ts` (architecturally frozen — Lead 5 L279, Lead 16 §14)
**Code grounding:** Frozen file; call-site edits only per Lead 5 rule. This package requires changing the call site (`ecign/api.ts` lock path) to assert role pre-call, OR modifying the frozen state machine (which is forbidden without architecture sign-off).

| Aspect | Estimate |
|---|---|
| Design: where to assert (call site vs state machine) — architecture decision | **HUMAN-BOUND decision** |
| Implement role re-check at chosen point | 1 day |
| Pre-flight check on existing form_instances (per L1208 mitigation) | 0.5 day |
| Postman/server test | 0.5 day |
| Test 2 re-run (multi-signer) + artifact | 0.5 day |
| Compliance Lock regression | 1 day |
| **Total single agent (post-decision)** | **~3.5 working days** |

**Agent-doable:** Post-decision only. **Risk:** HIGH if state machine edit chosen.

---

### MVP-P1-ECIGN-004 — Required-fields completeness gate before lock
**Wave:** 4 | **Leads:** L5, L7 | **Browser Test:** Test 2 re-run
**Touches frozen files:** `ecign/api.ts` (call site), `FormViewer.tsx` (Protected — for inline alerts)
**Code grounding:** No current completeness gate; current lock path proceeds regardless of unfilled required fields (per Lead 5 L268).

| Aspect | Estimate |
|---|---|
| Implement field-completeness check (allow explicit "N/A" per L1208) | 1 day |
| Add inline `role="alert"` validation in FormViewer | 0.5 day |
| Browser Test 2 re-run + artifact | 0.5 day |
| Compliance Lock regression | 1 day |
| **Total single agent** | **~3 working days** |

**Agent-doable:** Yes. **Risk:** Medium (gate semantics need care).

---

### MVP-P1-A11Y-004 — Tree/grid ARIA on hierarchy + keyboard arrow nav
**Wave:** 4 | **Leads:** L7, L6 | **Browser Test:** Manual SR + keyboard
**Touches frozen files:** `CesEvidenceHierarchyPanel.tsx` (per Lead 7 L388), `EvidenceCenterPage.tsx`

| Aspect | Estimate |
|---|---|
| Add `role="tree"` / `role="treeitem"` / `aria-expanded` / `aria-level` | 1 day |
| Implement keyboard Up/Down/Left/Right/Enter/Space nav | 1.5 days |
| Manual SR + keyboard pass | 1 day |
| **Total single agent** | **~3.5 working days** |

**Agent-doable:** Yes. **Risk:** Low (additive).

---

### MVP-P1-A11Y-005 — `getPrintableFormHtml` snapshot ARIA preservation
**Wave:** 4 | **Leads:** L7, L5 | **Browser Test:** Manual SR
**Touches frozen files:** `FormSigningWorkspace.tsx` (Protected — Lead 16 C6)
**Code grounding:** Current `getPrintableFormHtml` strips ARIA (per Lead 5 L269).

| Aspect | Estimate |
|---|---|
| Update `getPrintableFormHtml` to clone+preserve ARIA + dynamic + values | 1 day |
| Manual SR test on subsequent-signer review | 1 day |
| Browser Test 2 re-run for multi-signer SR equivalence | 0.5 day |
| Compliance Lock regression | 0.5 day |
| **Total single agent** | **~3 working days** |

**Agent-doable:** Yes. **Risk:** Medium (Protected file + legal-defensibility chain).

---

### MVP-P1-A11Y-006 — Roving tabIndex + arrow keys (WorkflowExecutionPanel + CesEvidenceHierarchyPanel)
**Wave:** 4 | **Leads:** L7 | **Browser Test:** Manual SR + keyboard

| Aspect | Estimate |
|---|---|
| Implement roving tabIndex pattern in both surfaces | 1 day |
| Manual keyboard pass | 0.5 day |
| **Total single agent** | **~1.5 working days** |

**Agent-doable:** Yes. **Risk:** Low. **Serializes with A11Y-002 and A11Y-004.**

---

### MVP-P1-PERMS-001 — Trainer permission boundary
**Wave:** 4 | **Leads:** L10, L12 | **Browser Test:** Test 9
**Touches frozen files:** `permissionCatalog.ts`, `userGroups.ts`

| Aspect | Estimate |
|---|---|
| Hide `user.provision` from Trainer | 0.25 day |
| URL-guard restricted routes | 0.5 day |
| Browser Test 9 (Trainer blocked from `/admin/users` etc.) + artifact | 0.5 day |
| Re-run `verify-feature-access.mjs` | 0.25 day |
| **Total single agent** | **~1.5 working days** |

**Agent-doable:** Yes. **Risk:** Low.

---

### MVP-P1-OPS-001 — Browser test discipline
**Wave:** 0+ | **Leads:** L11, L12 | **Browser Test:** all 9
**Touches frozen files:** none
**Code grounding:** Per Lead 12, zero of the 9 tests have ever been executed.

| Aspect | Estimate |
|---|---|
| Execute all 9 tests against `main` (Wave 0 baseline) | 1 day (4–6 hours focused) |
| Capture artifacts (screenshots, console, network) in `QA_UAT_AUDIT/execution-logs/` | 0.5 day |
| Re-execute after each subsequent Wave | recurring (~0.5 day per wave) |
| **Total single agent (Wave 0 alone)** | **~1.5 working days** |

**Agent-doable:** Yes for the test execution mechanics, BUT **a human reviewer should validate each test's binary pass criteria** (per Lead 12 L593–L602). **Realistic agent-led pace: 4–6 hours of disciplined manual testing with screenshot capture per test.**

---

## C. Net-New Primitives (Required Before Wave 1)

These are referenced as canonical in Wave 1/Wave 2 but **do not exist in `src/policy/components/ui/` today**:

| Primitive | Wave Use | Estimate (single agent) | Risk |
|---|---|---|---|
| `BottomSheetDrawer.tsx` | Wave 1 (`<1024 px` drawer mandate, Lead 16 C4) | 0.5 day | Low (touch + snap + iOS keyboard) |
| `SignaturePad.tsx` | Wave 1 (320 px min, Lead 16 C5) | 1.5 days | Medium (canvas + smoothing + IndexedDB partial-stroke per Lead 15) |
| `PhotoEvidenceCapture.tsx` | Wave 2 (≤2-tap evidence, Lead 2 L123) | 1 day | Medium (native camera capture + preview + metadata) |
| `LoadingState.tsx` | Cross-wave (skeleton + spinner, Lead 2 L131) | 0.5 day | Low |

**Subtotal: ~3.5 agent-days of pure primitive build before any consumer waves can ship.**

---

## D. Quantitative Roll-Up

### By Wave (single-agent honest estimate, including validation gates)

| Wave | P0+P1 packages | Net-new primitives | Compliance Lock | **Total agent-days** |
|---|---|---|---|---|
| Wave 0 | OPS-001 (9 tests) | — | — | **1.5 days** |
| Wave 1 | AUTH-001 (1.5) + AUTH-002 (1) + CES-001 (4) + CES theme unification (~2) | BottomSheetDrawer (0.5) + SignaturePad (1.5) | included in package totals | **10.5 days** |
| Wave 2 | TASK-001 (7) + EVIDENCE-001 (6.5) + AUDIT-001 (3.5) + ARTIFACT-001 (2) + nav slot update (~0.5) | PhotoEvidenceCapture (1) + LoadingState (0.5) | included | **21 days** |
| Wave 3 | ECIGN-001 (4.25) + ECIGN-002 (6) + A11Y-001 (4) + A11Y-002 (2.5) + A11Y-003 (2.5) | — | included | **19.25 days** |
| Wave 4 | CALENDAR-001 (5.5) + PERMS-001 (1.5) + A11Y-004 (3.5) + A11Y-005 (3) + A11Y-006 (1.5) + ECIGN-003 (3.5) + ECIGN-004 (3) | — | included | **21.5 days** |
| Wave 5 | PRINT-001 (5.5) | — | included | **5.5 days** |
| Wave 6 | Visual regression baselines + full 9-test re-run | — | — | **2 days** |
| Wave 7 | Real-agency cohort | — | — | **HUMAN-BOUND (calendar)** |
| **Totals (Wave 0–6)** | | | | **~81 agent-days** |

### Realism Adjustments

- **Owner-review wait time** (Protected file sign-offs) is NOT counted above. Each P0/P1 touching a frozen/Protected file likely adds 0.5–2 calendar days of wait per package. Across ~12 such packages, that's another 10–30 calendar days of wait time.
- **Browser test serialization:** Many tests must run against an integrated `main`; you can't parallelize Test 6 with Test 2 if they touch related state. Realistic browser-test throughput: ~1–2 tests per agent-day.
- **Compliance Lock regression:** Cumulative; each PR re-runs the full suite. Adds friction proportional to PR count.

### Realistic Calendar Conversion

| Allocation | Net agent throughput | Calendar duration for Waves 1–6 |
|---|---|---|
| 1 agent (full-time) | 1× | ~16 working weeks (~4 months) |
| 4 agents (parallel where possible, serialized on frozen files) | ~2.5× effective | ~6–7 working weeks (~6 weeks) |
| 8 agents (parallel where possible) | ~3× effective (diminishing returns from serialization) | ~5 working weeks |
| 32 agents (theoretical, mostly idle on serialized work) | ~4× effective (hard cap from frozen-file serialization) | ~4 working weeks |

**The frozen-file rule is the throughput ceiling — not the agent budget. Doubling agent count past ~8 produces diminishing returns because most P0/P1 packages serialize on the same 5–8 critical files.**

---

## E. Agent-Doable vs Human-Bound Classification Summary

| Category | Count | Notes |
|---|---|---|
| **Fully agent-doable** (with owner sign-off where Protected) | 14 packages | All P0/P1 except those listed below |
| **Agent-doable post-decision** | 1 package | ECIGN-003 (server vs call-site assertion choice) |
| **Human-bound** | Wave 7 + all mobile UAT + rollback drill + owner assignment | Calendar-bound |

**This is why the MVP plan is conditional on humans, not on agents.** Once the human-bound items are scheduled and owner sign-offs are in place, an agent can execute the ~81 agent-days of work. Until then, agents are bottlenecked.

See `03_REALISTIC_MVP_TIMELINE.md` for the calendar mapping and `04_NEXT_EXECUTION_PROPOSAL.md` for what to actually do next.
