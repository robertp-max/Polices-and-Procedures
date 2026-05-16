# Wave 8 — Platform Stabilization Report

**Date:** 2026-05-16
**Wave name:** Platform Stabilization + Canonical Source-of-Truth Enforcement
**Mode:** AUDIT-only for §1 (canonical artifact enforcement, per user authorization E) + bounded surgical fixes elsewhere.
**Authorization in effect:** Option B + Option E (use provided architecture references; interpret §1 as audit + consistency enforcement only — do **not** reopen Wave 5B, do **not** introduce backend PDF generation, do **not** redesign the artifact architecture).

---

## 1. Mission scope

| Objective | Mode | Outcome |
|-----------|------|---------|
| §1 Canonical artifact enforcement | **AUDIT-ONLY + consistency enforcement** | Map produced; 4-schema `form_instance_id` lifecycle documented; no protected files modified |
| §2 Mobile operational UX hardening | Audit + 3 surgical className fixes | Drawer width, header padding, sprint nav touch targets fixed; quick-win + medium-effort backlogs documented |
| §3 CES state synchronization audit | AUDIT-ONLY | Cross-surface task/completion/assignee/evidence/workflow-state map produced; 2 `verify:pm-unified` baseline failures rooted-caused |
| §4 Evidence Center hardening | AUDIT-ONLY | Hierarchy walk produced; P0-01 status documented; 6 findings (1 P1 mitigated, 2 P1, 3 P2) |
| §5 Role + signature flow validation | AUDIT-ONLY | Requirements matrix produced; 5 known gaps re-confirmed status; negative checks documented |
| §6 Source-of-truth validation | AUDIT-ONLY (no automatic deletion) | 6 categories mapped; deprecation candidates listed with safe-to-delete flags |

---

## 2. Reference document handling

The 8 documents named in the directive (MASTER-SYSTEM-DOCUMENTATION, Workflow_and_Events_System, Data_Model_and_Files, Print_System_Architecture, Integration_Map, FINAL_DEFENSIBILITY_HARDENING_REPORT, POLICY_HH_SECTION_MAP_REPORT, current_state_2026-05-14_090235_part1-5) were **not present in the repository** at the time of this wave. Per user authorization Option B, the audit grounded in:

| Used as authoritative substitute | What it covered |
|-----------------------------------|------------------|
| `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/eCIgn_Legal_Defensibility_Gap_Analysis.md` | eCign architecture, P0/P1 gap baseline |
| `_Heavy/Fix-2026-05-14/CANONICAL_POLICY_VIEW_CONSOLIDATION_REPORT.md` | Policy viewer canonical owner (GVGBDetailView for GV-GB-001) |
| `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_CANONICAL_COMPONENTS_MAP.md` | UI/UX canonical owners (corrected against current code in §1 map) |
| `docs/context-for-grok/cursor-forensics/components/print/PRINT_AND_SIGNED_PDF_ROUTE_DRIFT.md` | Print route divergence |
| `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/WAVE_5A_EXECUTION_REPORT.md` | Wave 5A deferral inventory |
| Code-level reading of all 6 mission areas (Glob/Grep + targeted Read) | Source of truth for actual current behavior |

Where any prior report disagrees with current code, this wave defers to **code truth** and notes the correction in the relevant report (notably: `GVPolicyDetailView`/`CLPolicyDetailView`/`PolicyDetailModal` are **already deleted** from `src/`; `PolicyDetailPage` branches GV-GB-001 → `GVGBDetailView` otherwise → `PolicyLibraryDocumentView`).

---

## 3. Files touched this wave

| File | Change | Rationale |
|------|--------|-----------|
| `src/policy/components/pm/GlobalTaskDrawer.tsx` | `w-[420px]` → `w-[min(100vw,420px)]` (+ doc comment) | Fixed phone overflow; desktop unchanged |
| `src/policy/pages/FormsPage.tsx` | header `px-10` → `px-4 sm:px-6 md:px-10` | Fixed phone overflow; `md:` and up unchanged |
| `src/policy/components/pm/PmDashboardPage.tsx` | sprint prev/next buttons gained `min-h-[44px] min-w-[44px] inline-flex items-center justify-center` + `aria-label` | WCAG AA touch targets + a11y |
| `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/WAVE_8_CANONICAL_SOURCE_OF_TRUTH_MAP.md` | new | Required output (§6) |
| `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/WAVE_8_CES_STATE_SYNC_REPORT.md` | new | Required output (§3) |
| `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/WAVE_8_EVIDENCE_INTEGRITY_REPORT.md` | new | Required output (§4) |
| `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/WAVE_8_MOBILE_OPERATIONAL_UX_REPORT.md` | new | Required output (§2) |
| `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/WAVE_8_PLATFORM_STABILIZATION_REPORT.md` | new (this file) | Required output (§1, top-level) |

**Total runtime LOC modified:** 3 files, ~14 lines (including documentation comments). All className-only.

---

## 4. Risks found (consolidated, ranked)

| # | Risk | Source report | Severity | Action this wave |
|---|------|---------------|----------|------------------|
| 1 | Dual task models — PM `Task[]` (canonical via `useProjectedTasks`) vs CES `MergedExecutionUnit` (canonical for `SprintTaskPanel`/`MyTasksPage`) | CES Sync §3 / SOT Map §3.4 | **P1** | Documented only; requires architectural decision |
| 2 | `isEventComplete` vs `validateEvent` semantic split | CES Sync §3 / SOT Map §3.6 | **P1** | Documented only; FROZEN-file (store) change |
| 3 | Evidence Center cold IDB-only blobs (sync resolve misses IDB-only payloads) | Evidence Integrity §3 Finding #2 | **P1** | Documented as ME-3 quick-win (~15 LOC, non-protected) |
| 4 | Audit Mode hidden bytes (stripped persist + UI keys off `localDataUrl`) | Evidence Integrity §3 Finding #3 | **P1** | Documented; canonical resolution = use Artifact Viewer |
| 5 | MyTasks rows non-interactive on mobile | Mobile UX §2.3 | **P0 (mobile)** | Documented as ME-1; needs canonical deep-link decision |
| 6 | P0-01 multi-signer artifact identity — addressed via `uploadEvidence` dedup; **no multi-signer UAT spec** | Evidence Integrity §5 | **P1 (verification gap)** | Documented; recommend multi-signer Playwright spec |
| 7 | Multiple print pipelines (policy routes, form route, iframe `printForm`, packet HTML, survey packet) | SOT Map §3.2 | **P1** | Documented; deferred Wave 5B work |
| 8 | DON Assistant restrictions client-side only — **no server-side equivalent** | Signer Flow audit | **P1** | Documented; backend work explicitly out of scope |
| 9 | `useProjectedTaskById` always queries `'sprint'` scope | CES Sync §3 / SOT Map §3.4 | **P2** | Documented; edge-case bug |
| 10 | `ownerOf` predicate copy-pasted in 3 files | CES Sync §3 / SOT Map §3.4 | **P2** | Documented; consolidation candidate |
| 11 | `signed_lock` finalize on demo-local API only checks `signatures.length === 0` (server-side Express checks N signers correctly) | Signer Flow audit | **P2** | Documented; demo API parity gap |
| 12 | `advanceStep` store API has no `src/` call sites | SOT Map §3.5 | **P2** | Documented; dead-API candidate |

**P0 count:** 1 (mobile-only, MyTasks row interactivity).
**P1 count:** 7.
**P2 count:** 4.

---

## 5. Duplicate systems found

See `WAVE_8_CANONICAL_SOURCE_OF_TRUTH_MAP.md` §3 for the full table. Headline drift items:

- **Two task truths** (PM projection vs CES obligations) — XL effort to consolidate
- **`isEventComplete` vs `validateEvent`** semantic split — M effort
- **Print CSS** — Wave 5A introduced `PrintFrame` / `printStyles.ts` as the canonical seam, but `GVGBPrintDocument`, `PrintPage`, `FormSigningWorkspace`, `audit/surveyPacket.ts` still own inline `@media print` blocks — gradual migration; deferred Wave 5B
- **`form_instance_id` 4 coexisting schemas** — managed by lifecycle (`fi_` bootstrap → canonical `{eventId}-{formId}-{seq}`); documentation gap only
- **`ownerOf` predicate** copy-pasted in `SprintReviewPage`, `SprintPlanPage`, `sprintAllocator.ts` — small consolidation target
- **Already deleted** (no action): `GVPolicyDetailView`, `CLPolicyDetailView`, `PolicyDetailModal` — only referenced in `_Heavy/` docs

---

## 6. Canonical systems identified

See `WAVE_8_CANONICAL_SOURCE_OF_TRUTH_MAP.md` §2 for the full table. Key declared/enforced SOT files:

- **`pm/ecignStatusMap.ts`** — declared SOT for eCign packet + PM task status mapping (header :4–7)
- **`pm/taskProjection.ts` + `taskProjectionCore.ts`** — declared SOT for PM `Task[]` projection (header :34–39)
- **`ces/obligations/useObligations.ts`** — declared SOT for CES obligation layer (header :2–5)
- **`compliance-execution/taskIdentity.ts`** — FROZEN canonical task identity helpers
- **`ces/cesFormInstanceId.ts`** — FROZEN canonical `form_instance_id` shape
- **`evidence/demoEvidenceRuntimeCache.ts` + `storage/indexedDbEvidenceBlobStore.ts`** — canonical demo evidence byte stack
- **`stores/regulatoryExecutionStore.ts`** — FROZEN single mutator for workflow state
- **`artifacts/artifactRoute.ts`** — canonical artifact URL builder

---

## 7. Intentional non-touches

| Why not touched | Files |
|-----------------|-------|
| FROZEN — protected subsystem | `FormSigningWorkspace.tsx`, `FormViewer.tsx`, `FormSignatureFlow.tsx`, `regulatoryExecutionStore.ts`, `ArtifactViewerPage.tsx`, `FormPrintView.tsx`, `LibraryPage.tsx`, `GVGBDetailView.tsx`, `PolicyDetailPage.tsx`, `WorkflowExecutionPanel.tsx`, `taskIdentity.ts` (under `compliance-execution/`), `cesFormInstanceId.ts`, `stateMachine.ts`, `localDemoAdapter.ts`, `cesEvidenceHierarchy.ts` |
| Backend — out of scope | `server/ecign/*`, `src/policy/ecign/*`, `routes/ecign.ts`, `demoLocalApi.ts` |
| Wave 5B deferred | All print-chrome unification candidates (`PrintPage.tsx`, `GVGBPrintDocument.tsx` inline CSS, backend canonical PDF) |
| Needs architectural decision | MyTasks row click target, dual task model consolidation, `isEventComplete` vs `validateEvent` semantics, `useProjectedTaskById` scope fix |
| Already deleted (no action needed) | `GVPolicyDetailView.tsx`, `CLPolicyDetailView.tsx`, `PolicyDetailModal.tsx` |
| Intentional light-pinning (Wave 7 T3 sign-off) | Hex literals in `SharedPolicyDetailView.tsx` — preserved for print-equivalence |

---

## 8. Regression results

| Gate | Result | Source |
|------|--------|--------|
| `tsc -b --noEmit` | ✅ PASS | post-fix |
| `npm run build` | ✅ PASS (3.80s) | post-fix |
| `verify:ui` | ✅ 0 FAIL · 3185 WARN (unchanged) | post-fix |
| `verify:task-identity` | ✅ PASS | post-fix |
| `verify:alignment` | ✅ 100% — 0 findings | post-fix |
| `verify:pm-unified` | ⚠️ 22 passed / 2 failed (baseline since Wave 4) | post-fix; root causes documented in CES Sync §5 |
| `wave-6-regression` Playwright (9 MVP browser tests) | ✅ 9/9 (54.1s) | post-fix |
| `artifact-retrieval-defect` Playwright | ✅ 1/1 (57.1s) — Wave 5A `memCacheVersion` fix holds | post-fix |
| Mobile-viewport Playwright | ❌ not authored | Coverage gap |
| Signer-role regression Playwright | ❌ not authored | Coverage gap |
| Evidence upload regression Playwright | ❌ not authored | Coverage gap |

---

## 9. Screenshot references

The three applied fixes are pure className changes with **no logic or behavior change**; no new screenshot artifacts were captured because:
- `wave-6-regression` (9-test MVP regression) and `artifact-retrieval-defect` already capture canonical desktop screenshots that **did not change**.
- The fixes only materialize at sub-`md:` viewports; the Playwright suites run at default desktop viewport and were intentionally not extended to phone widths in this wave (a mobile-viewport spec is the documented coverage gap in §8).

Wave 5A / Wave 7 screenshot trees (Builder/_system/uat/*-after.spec.mjs outputs) are not invalidated.

---

## 10. Rollback safety notes

Every applied change is **className-only, one-line, fully reversible** by a single StrReplace. No persisted data shape changed. No store schema changed. No protected file changed. The three runtime files can be reverted as follows:

```
src/policy/components/pm/GlobalTaskDrawer.tsx
  : w-[min(100vw,420px)]            →  w-[420px]
src/policy/pages/FormsPage.tsx
  : px-4 sm:px-6 md:px-10           →  px-10
src/policy/components/pm/PmDashboardPage.tsx
  : remove min-h-[44px] min-w-[44px] inline-flex items-center justify-center and aria-label on both sprint nav <button>s
```

Reports are **additive documentation** under `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/`. Deleting any of them has zero runtime effect.

---

## 11. Unresolved blockers (require user direction)

| # | Blocker | Why blocked |
|---|---------|-------------|
| 1 | MyTasks row interactivity (P0 mobile) | Needs decision: `useSelectedTaskStore.openTask(task_id)` OR `navigate(buildTaskRoute(...))` |
| 2 | `EvidenceCenterPage` IDB prefetch (P1) | Mechanically simple (Wave 5A pattern), but ~15 LOC into a heavily branched mode-aware page — wants explicit sign-off |
| 3 | Multi-signer Playwright spec | Needed to lock in P0-01 mitigation behavior; ~1–2 hours of authoring |
| 4 | `useProjectedTaskById` scope fix | Frozen-adjacent; affects PM/CES interaction |
| 5 | `verify:pm-unified` 2 baseline failures | Verifier patterns are stale vs current `EntityLink` + `WorkflowExecutionPanel` shapes; need decision: update verifier OR change code (the latter touches FROZEN file) |
| 6 | `FormSigningWorkspace.tsx:1577–1580` direct `localStorage.setItem('ces_ev_data_*')` beside the canonical helper — possibly redundant safety net | Cannot inspect mutation safely without unfreezing the file |
| 7 | DON Assistant server-side restriction | Backend work explicitly excluded this wave |
| 8 | Dual task model (PM `Task[]` vs CES obligations) consolidation | Architectural decision — XL effort |
| 9 | `isEventComplete` vs `validateEvent` semantic merge | FROZEN store change |
| 10 | Mobile-viewport / signer-role / evidence-upload Playwright coverage | Specs not yet authored |

---

## 12. Final priority disposition

| Priority | Status |
|----------|--------|
| 1. Data integrity | ✅ No regressions; evidence hierarchy deterministic; P0-01 product code addresses dedup |
| 2. Evidence defensibility | ⚠️ Wave 5A fix holds; cold-blob risk remains in Evidence Center + Audit Mode (P1, documented) |
| 3. Workflow consistency | ⚠️ Dual task models + `isEventComplete`/`validateEvent` split persist (P1, documented) |
| 4. Mobile operational usability | ✅ 3 surgical fixes shipped; backlog of 5 quick wins + 4 medium-effort items documented; 1 P0 (MyTasks rows) blocked on canonical-deep-link decision |
| 5. UI consistency | ✅ No regressions; Wave 7 T3 token state preserved; verify:ui FAIL = 0 |
| 6. Visual polish | ✅ No regressions |

---

## 13. Companion reports (read alongside this file)

- `WAVE_8_CANONICAL_SOURCE_OF_TRUTH_MAP.md` — §6 in primary mission
- `WAVE_8_CES_STATE_SYNC_REPORT.md` — §3 in primary mission
- `WAVE_8_EVIDENCE_INTEGRITY_REPORT.md` — §4 in primary mission
- `WAVE_8_MOBILE_OPERATIONAL_UX_REPORT.md` — §2 in primary mission
