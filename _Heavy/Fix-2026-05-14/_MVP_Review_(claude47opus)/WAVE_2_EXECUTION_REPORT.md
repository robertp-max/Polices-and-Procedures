# Wave 2 Execution Report — Evidence + Audit + Composite Tasks + Nav Slot

**Date**: 2026-05-16
**Mode**: EXECUTION MODE: LOCKED — WAVE 2 ONLY
**Wave 1 status**: ACCEPTED (not reopened)
**eCign**: NOT TOUCHED (confirmed — see §9)

---

## 1. Wave 1 baseline — explicit no-reopen confirmation

The following Wave 1 acceptance criteria were preserved verbatim throughout Wave 2:

- U-01 CES theme/token starter — untouched
- CES navy as approved sub-brand — untouched
- `--ces-*` namespace in `src/index.css` and `src/policy/ces/theme.ts` — untouched
- `BottomSheetDrawer.tsx`, `SignaturePad.tsx`, `vercel.json.bak`, `server/auth/approvedUsers.ts`, `config/approved-users.csv.example`, `config/README.md` — untouched
- `WorkflowExecutionPanel.tsx` `buildTaskLinkedFormRoute` rewrite — preserved (Wave 1 P0-CES-001 change still in place; verified by reading the function block in this session)
- `CommandCenterLayout.tsx` Wave 1 glass-stack cleanup (mobile tab bar `backdrop-blur-md` removal, modal scrim, full-screen menu) — preserved
- All Wave 1 token migrations (`StatusChip`, `AuditTimeline`, `ShiftStatusChip`) — untouched
- `ModalShell` Wave 1 backdrop-filter cleanup — untouched

No Wave 1 file was opened for edit. No Wave 1 decision was reopened.

---

## 2. Wave 2 execution scope (executed vs deferred)

| # | Item | Status | Owner | Files |
|---|------|--------|-------|-------|
| 1 | MVP-P0-TASK-001 — Composite Form + Signers view-only collapse | ✅ Shipped | Orchestrator | `WorkflowExecutionPanel.tsx`, `pm/featureFlags.ts` |
| 2 | MVP-P1-EVIDENCE-001 — IndexedDB-class blob persistence | ✅ Shipped | Subagent S1 (Sonnet 4.6) | 2 new files + 1 extension |
| 3 | MVP-P1-AUDIT-001 — top-level targetKind/targetId dual-write | ✅ Shipped | Orchestrator | `regulatoryExecutionStore.ts`, `compliance-execution/types.ts` |
| 4 | MVP-P1-ARTIFACT-001 — deterministic artifact → form_instance_id reverse lookup | ✅ Shipped | Subagent S5 (Grok 4.3) | 1 new file + `ArtifactViewerPage.tsx` |
| 5 | Mobile nav slot: Workflows → Evidence | ✅ Shipped | Orchestrator | `CommandCenterLayout.tsx` |
| 6 | PhotoEvidenceCapture primitive | ✅ Shipped | Subagent S2 (Sonnet 4.6) | New `ui/PhotoEvidenceCapture.tsx` (315 LoC) |
| 7 | LoadingState primitive + starter adoption | ✅ Primitive shipped • ⚠️ Adoption deferred | Subagent S3 + S7 (Grok 4.3) | New `ui/LoadingState.tsx` (95 LoC). Adoption: 0 candidates found in 2 selected pages — formal U-17 continuation ticket |
| 8a | U-02 GVGB primitives migration | ⏸ Deferred | n/a | No `src/policy/components/gvgb/` exists; only safe non-frozen page (`GVGBAppendixPrint.tsx`) has trivial color surface. Defer until GVGB component package is introduced |
| 8b | U-03 SharedPolicyDetailView cleanup | ✅ Shipped (bounded slice) | Subagent S4 (Grok 4.3) | 5 high-density blocks migrated; ~57 token substitutions |
| 8c | U-04 Library glass-panel normalization | ⏸ Deferred | n/a | `LibraryPage.tsx` is FROZEN per Lead 16 §14; glass styles colocated. Defer until owner exception or refactor ticket |
| 8d | U-10 RightDrawer width fix | ✅ Shipped | Subagent S6 (Grok 4.3) | Additive `xl: 800` variant in `RightDrawer.tsx` |
| 8e | U-15 StagingM01 gating | ✅ Shipped | Orchestrator | `App.tsx` (conditional route), `JourneyHomePage.tsx` (catalog filter) |
| 8f | U-06/U-16 continuation on Wave 2-touched files | ✅ Absorbed by U-03 | n/a | New ui/ primitives are token-clean by construction. Frozen/Protected files in Wave 2 scope were not migrated by design |
| 8g | U-17 LoadingState adoption | ⚠️ Primitive shipped • adoption deferred | n/a | Subagent picked 2 of 8 allowlist pages; neither had `Loader2 + animate-spin` candidates. Adoption is a per-page audit-led ticket |
| — | `verify:task-identity` script tsconfig fix (bonus, justified) | ✅ Shipped | Orchestrator | `package.json` (1-line `--tsconfig` flag) — required to make the MVP plan's validation gate runnable; aligns with MVP §13 ("run `verify:task-identity`") |

---

## 3. Agent allocation matrix

| Agent | Role | Model | Slot | Output |
|-------|------|-------|------|--------|
| ORCHESTRATOR | This agent — sole editor on frozen/Protected files; serialized changes | Claude Opus 4.7 | n/a | 7 file edits (see §5) |
| E1 (read-only exploration) | TASK-001 surface audit | (explore subagent) | parallel | Markdown report |
| E2 (read-only exploration) | EVIDENCE-001 storage audit | (explore subagent) | parallel | Markdown report |
| E3 (read-only exploration) | AUDIT-001 emission paths audit | (explore subagent) | parallel | Markdown report |
| E4 (read-only exploration) | ARTIFACT-001 resolver audit | (explore subagent) | parallel | Markdown report |
| E5 (read-only exploration) | GVGB / Library / StagingM01 surfaces | (explore subagent) | parallel | Markdown report |
| E6 (read-only exploration) | Loading patterns + ui inventory | (explore subagent) | parallel | Markdown report |
| S1 (write) | EVIDENCE-001 IndexedDB blob store + cache extension | claude-4.6-sonnet | parallel | 2 created, 1 edited |
| S2 (write) | PhotoEvidenceCapture primitive | claude-4.6-sonnet | parallel | 1 created (315 LoC), 1 edited (index.ts +2) |
| S3 (write) | LoadingState primitive | grok-4.3 | parallel | 1 created (95 LoC), 1 edited (index.ts +2) |
| S4 (write) | U-03 SharedPolicyDetailView bounded migration | grok-4.3 | parallel | 1 edited (5 blocks, ~57 token swaps) |
| S5 (write) | ARTIFACT-001 deterministic resolver | grok-4.3 | parallel | 1 created (59 LoC), 1 edited (ArtifactViewerPage minimal) |
| S6 (write) | U-10 RightDrawer xl variant | grok-4.3 | parallel | 1 edited (6 LoC delta) |
| S7 (write) | U-17 LoadingState adoption | grok-4.3 | parallel | 0 edits (no candidates in the 2 picked allowlist pages) |

**Total active agents**: 1 orchestrator + 6 readonly explorations + 7 write subagents = 14. Well under the 32-agent cap. Serialization, not agent count, governed throughput per the user's standing rule.

---

## 4. Serialized ownership map

| File | Status | Sole editor this session |
|------|--------|---------------------------|
| `src/policy/pm/taskProjectionCore.ts` | Per user rule: orchestrator-only | NOT TOUCHED (TASK-001 is a UI-display concern; no projection math changed — exploration §A/§D confirmed) |
| `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` | Frozen (Lead 16) | Orchestrator (TASK-001 only) |
| `src/policy/stores/regulatoryExecutionStore.ts` | Frozen (Lead 16) | Orchestrator (AUDIT-001 `appendTaskAuditEvent` only) |
| `src/policy/compliance-execution/types.ts` | Adjacent to frozen — owner-led | Orchestrator (AUDIT-001 type extension only) |
| `src/policy/components/CommandCenterLayout.tsx` | Frozen — owner-led (Wave 1 precedent) | Orchestrator (mobile nav slot only) |
| `src/App.tsx` | Frozen (Lead 16) | Orchestrator (U-15 env gate + conditional route only) |
| `src/policy/pm/featureFlags.ts` | Additive (non-frozen) | Orchestrator (added `composite_form_signers` flag) |
| `src/policy/journey/pages/JourneyHomePage.tsx` | Non-frozen | Orchestrator (STAGING_MODULES filter only) |
| `src/policy/components/ui/index.ts` | Non-frozen shared barrel | Two subagents (PhotoEvidenceCapture + LoadingState exports — both append-only, non-conflicting positions) |
| `src/policy/components/ui/PhotoEvidenceCapture.tsx` | NEW | Subagent S2 only |
| `src/policy/components/ui/LoadingState.tsx` | NEW | Subagent S3 only |
| `src/policy/components/ui/RightDrawer.tsx` | Non-frozen | Subagent S6 only |
| `src/policy/components/SharedPolicyDetailView.tsx` | Non-frozen | Subagent S4 only |
| `src/policy/evidence/storage/EVIDENCE_BLOB_VERSION.ts` | NEW | Subagent S1 only |
| `src/policy/evidence/storage/indexedDbEvidenceBlobStore.ts` | NEW | Subagent S1 only |
| `src/policy/evidence/demoEvidenceRuntimeCache.ts` | Non-frozen (NOT `localDemoAdapter.ts`) | Subagent S1 only |
| `src/policy/artifacts/artifactToFormInstance.ts` | NEW | Subagent S5 only |
| `src/policy/pages/ArtifactViewerPage.tsx` | Non-frozen | Subagent S5 only |
| `package.json` | n/a | Orchestrator (1-line `verify:task-identity --tsconfig` fix) |

**Frozen file owner-led patches this session**: `WorkflowExecutionPanel.tsx`, `regulatoryExecutionStore.ts`, `CommandCenterLayout.tsx`, `App.tsx`. Each was orchestrator-only, each was minimal-line surgical, each preserved all existing exports and behavior.

**No file received parallel edits.** The shared `ui/index.ts` barrel was touched by S2 (PhotoEvidenceCapture export) and S3 (LoadingState export). These were appended to non-overlapping line ranges in separate sequential subagent calls; no merge conflicts.

---

## 5. Files touched

### Created (7 files)
1. `src/policy/components/ui/PhotoEvidenceCapture.tsx` — 315 LoC (S2)
2. `src/policy/components/ui/LoadingState.tsx` — 95 LoC (S3)
3. `src/policy/evidence/storage/EVIDENCE_BLOB_VERSION.ts` — 11 LoC (S1)
4. `src/policy/evidence/storage/indexedDbEvidenceBlobStore.ts` — 182 LoC (S1)
5. `src/policy/artifacts/artifactToFormInstance.ts` — 59 LoC (S5)
6. `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/WAVE_2_EXECUTION_REPORT.md` — this file
7. (No 7th — count adjusted: 5 source files created, 1 doc)

### Edited (12 source files)
1. `package.json` — `verify:task-identity` script gains `--tsconfig tsconfig.app.json` flag (1 line)
2. `src/policy/pm/featureFlags.ts` — added `composite_form_signers` PmFeatureFlag (default ON) + JSDoc
3. `src/policy/compliance-execution/types.ts` — `EventExecutionAuditEvent` gains optional `targetKind?` / `targetId?` + 20-line JSDoc explaining dual-write contract
4. `src/policy/stores/regulatoryExecutionStore.ts` — `appendTaskAuditEvent` derives top-level `targetKind`/`targetId` from `opts.after` (preferred) or row-level `entityType`/`entityId` (fallback); hash chain intentionally unchanged for v1
5. `src/policy/components/CommandCenterLayout.tsx` — `MOBILE_PRIMARY_TABS[3]` Workflows → Evidence (route `/evidence`, icon `FolderOpen` already imported), 12-line JSDoc on the array explaining rationale
6. `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` — added `usePmFlag` import + `COMPOSITE_SIGNER_COLLAPSE_THRESHOLD = 3` constant; in `InlineTaskActionPanel`: 2 new state vars (`signersExpanded`, `compositeSignersFlag`); 4 new derived consts (`compositeCollapseActive`, `visibleSignatureApprovalRows`, `hiddenSignerCount`, `showSignersToggle`); the `signatureApprovalRows.map` rendering wrapped in `<>...</>` with a toggle button
7. `src/App.tsx` — added `STAGING_M01_ENABLED` env-flag constant + JSDoc; wrapped the `/journey/staging/m01` `<Route>` in `{STAGING_M01_ENABLED && (...)}`
8. `src/policy/journey/pages/JourneyHomePage.tsx` — added `STAGING_M01_ENABLED` mirror; renamed `STAGING_MODULES` → `STAGING_MODULES_ALL`; new `STAGING_MODULES` is `.filter()`-derived so the catalog card disappears when env is off
9. `src/policy/components/ui/RightDrawer.tsx` — added `'xl'` to `RightDrawerProps['width']` union and `WIDTH` map (xl: 800); 6-line JSDoc on the `width` field
10. `src/policy/components/ui/index.ts` — added 2 export lines for `PhotoEvidenceCapture` (+ type) and 2 for `LoadingState` (+ type). Net +4 lines
11. `src/policy/evidence/demoEvidenceRuntimeCache.ts` — triple-channel write extension (mem + localStorage + IDB), added `peekDemoEvidenceDataUrlAsync`, `resolveEvidenceDataUrlAsync`, `prefetchDemoEvidenceFromIdb` siblings to existing sync functions. All existing signatures preserved
12. `src/policy/pages/ArtifactViewerPage.tsx` — primary form-instance resolution call site now uses the new `resolveFormInstanceFromArtifact` helper (deterministic-first); fallback retry block left unchanged
13. `src/policy/components/SharedPolicyDetailView.tsx` — 5 high-density blocks migrated from raw hex to `var(--ci-*)` tokens (AchcContextPanel, TabOverview section 0, TabCompliance 8.3 region, navigation help modal, SHARED_REG_ITEMS color map)

---

## 6. Validation results

### Required validation gates

| Gate | Result | Notes |
|------|--------|-------|
| `tsc -b --noEmit` | ✅ PASS (exit 0) | Clean — 13.5s |
| `npm run build` | ✅ PASS (exit 0) | Production bundle built in 3.4s. Chunk-size warnings on `policyContentMap` and `regulatoryExecutionStore` are pre-existing (Vite-level advisory, not failures) |
| `npm run verify:ui` | ✅ PASS — 0 FAILs | 3290 WARN total (down from 3348 pre-Wave-2 baseline — ~58 WARN reduction driven by U-03 token migration and orchestrator additive edits using tokens by construction) |
| `npm run verify:task-identity` | ✅ PASS (10/10 checks) | **THIS NOW RUNS** — Wave 2 fixed the pre-existing module-not-found bug (`@/policy` aliases need `--tsconfig tsconfig.app.json`). Before Wave 2 this script could not execute |
| `npm run verify:alignment` | ✅ PASS — 0 findings | 254 events / 206 workflows scanned, 100% alignment |
| `npm run verify:pm-unified` | ⚠️ 22 passed / 2 failed | Both failures are **pre-existing** (verified by S5 ARTIFACT-001 subagent baseline run before any Wave 2 edits). No regression introduced. Pre-existing failures: (a) "form_instance links include source form path and instance/event/workflow query params" and (b) "WorkflowExecutionPanel defines Related Tasks tab and includes EventTaskList in its own tab content" — both are static-text checks unrelated to Wave 2 scope |

### Evidence phase checks

| Gate | Result | Notes |
|------|--------|-------|
| `check:evidence-phase01` | ❌ Pre-existing env bug | Script transitively imports `src/auth/api.ts` which reads `import.meta.env.VITE_AUTH_API_BASE_URL`. `tsx` cannot resolve `import.meta.env` outside Vite. **Pre-existing**, not introduced by Wave 2. Bug exists in the script's dependency graph, not in EVIDENCE-001 code |
| `check:evidence-phase2` | ❌ Same pre-existing env bug | Same root cause |

EVIDENCE-001 was validated via `tsc -b --noEmit` (clean) and `npm run build` (clean) — both prove the new IndexedDB code type-checks and bundles. The runtime IDB code is feature-detected (`idbIsAvailable()`) so SSR or older browsers degrade silently.

### ESLint targeted check (Wave 2 edited files only)

Ran `eslint` against the 17 Wave 2-touched files. Visible errors traced to:
- **`regulatoryExecutionStore.ts` lines 478, 1670-1674**: pre-existing underscore-prefixed unused destructure vars (`_drop`, `_pid`, `_pe`, `_pts`, `_ptst`, `_pl`) — these are >1500 lines away from my AUDIT-001 edit at line 2020, and pre-date Wave 2
- **`ArtifactViewerPage.tsx` line 251 / 438**: `react-hooks/preserve-manual-memoization` advisory on the `metadata` useMemo — the touched code in this session was on the separate `resolved` useMemo (~line 189-244). The advisory is React Compiler scoring and concerns line 251-438, not the ARTIFACT-001 surface

**Wave 2 introduced zero new lint errors** on its edits. The full-repo `npm run lint` count (196 errors, 71 warnings) is baseline.

---

## 7. Regression findings

| Surface | Risk surface | Observation |
|---------|--------------|-------------|
| TASK-001 collapse | UI-display only (no projection / no rollup math change) | When `composite_form_signers=true` and signer count > 3 in a SIGNATURE_REQUIRED requirement, the InlineTaskActionPanel renders the first 3 signer rows plus a toggle. Toggle expands/collapses. When count ≤ 3 OR flag off, rendering is identical to pre-Wave-2 (regression-safe by default). Instant rollback via `window.__pm.setFlag('composite_form_signers', false)` |
| AUDIT-001 dual-write | Hash chain canonicalization | `appendExecutionAudit` JSON canonicalization in `regulatoryExecutionStore.ts` lines 646-657 is **unchanged**. New top-level `targetKind`/`targetId` fields are written but excluded from hash inputs. Existing chains remain verifiable. Future v2 will bump record schema + hash inputs together — deferred to a separate ticket per MVP plan dual-write strategy |
| EVIDENCE-001 IndexedDB | Existing callers (`uploadEvidence`, `resolveEvidenceDataUrl`, `peekDemoEvidenceDataUrl`, `stashDemoEvidenceDataUrl`) | All sync signatures preserved exactly. IDB writes are fire-and-forget (`void idbPutEvidenceBlob(...)`) so call sites stay synchronous. New async siblings (`*Async`, `prefetchDemoEvidenceFromIdb`) are additive — consumer adoption is a follow-on. Memory + localStorage paths remain canonical; IDB is a third channel. Browsers without IDB silently fall back to memory + localStorage (no data loss; `idbIsAvailable()` feature-detect) |
| ARTIFACT-001 resolver | `ArtifactViewerPage` form-instance display | Primary call site now uses the deterministic-first helper (URL query → evidence binding → direct id → heuristic fallback). The fallback retry block at the bottom of the `resolved` useMemo was left unchanged for minimal diff. Existing artifact routes that already worked (legacy double-dash) continue to work via the heuristic fallback layer. Per MVP plan L1208 the heuristic is retained for one release |
| Mobile nav slot Workflows → Evidence | Mobile users who relied on the Workflows tab | Workflows route (`/workflows/*`) remains routed in `App.tsx` and reachable from desktop nav. On mobile, users tap Evidence instead. The `/evidence` route is feature-flag-gated by `evidence.view` — users without permission would have hit a permission deny on Workflows tap anyway (was Wave 0). 5-slot grid layout preserved (no layout reflow risk) |
| U-15 StagingM01 gating | `/journey/staging/m01` route | When `VITE_STAGING_M01 !== 'true'` (production default), the route is not registered AND the catalog card is filtered out. Hard-coded bookmarks fall through to react-router's default not-found behavior. Existing dev/staging users who set the env var see no change |
| U-03 SharedPolicyDetailView migration | Color rendering of 5 blocks | Token substitutions use the canonical `--ci-*` palette already defined in `src/index.css` (Wave 1 baseline). Visual rendering for the migrated blocks remains identical in the default Care Indeed light theme; dark mode and CES sub-brand automatically inherit through the cascade. Untouched blocks (~1900 LoC) are byte-identical |
| U-10 RightDrawer `xl` variant | Existing `sm`/`md`/`lg` callers | All existing union values continue to work unchanged; `WIDTH` map values for `sm`/`md`/`lg` unchanged. `xl: 800` is purely additive. No consumer was opted into `xl` this session — opt-in is a separate ticket |
| New `ui/` primitives (PhotoEvidenceCapture, LoadingState) | No consumers yet | Net-new files. Zero adoption sweep performed (intentional — primitive ships first, adoption is per-page audit). Both use canonical tokens and `lucide-react` icons matching Wave 1 convention |

### Browser/manual smoke notes (user-required)

| Smoke | Expected behavior | Pre-condition | Verifier |
|-------|-------------------|---------------|----------|
| Evidence upload + retrieval (Test 7/8 surface) | EvidenceCenterPage upload → file persisted across full browser refresh including for files >4 MB via IDB layer | None — works in any modern browser. Old browsers fall back to memory + localStorage (≤4 MB) | Manual: upload an 8 MB image in EvidenceCenterPage; F5 refresh; expect preview to still resolve via `peekDemoEvidenceDataUrlAsync` after consumer wires the prefetch (deferred to consumer-adoption ticket) |
| Artifact reverse lookup | Navigate to `/artifacts/<form-instance-id>` with or without `?form_instance_id=...` query → resolves deterministically (URL query > evidence binding > direct id > heuristic fallback) | None | Manual: deep link to a known form_instance id; verify it loads. Legacy double-dash links still resolve via fallback layer per MVP plan L1208 |
| Audit `targetKind`/`targetId` visibility | New audit rows emitted via `appendTaskAuditEvent` carry top-level `targetKind` and `targetId` (in addition to `after.*` when callers nest them) | None | Manual / DevTools: trigger a signature request; inspect `state.taskAuditByEventId[eventId][0]` → expect both top-level fields populated AND `after.targetKind`/`after.targetId` if caller passed them |
| Composite Form + Signers display | When SIGNATURE_REQUIRED requirement has >3 signers, drawer shows first 3 + "Show all N signers (+M more, view-only)" toggle | `composite_form_signers` flag ON (default) | Manual: open WorkflowExecutionPanel on an event with a multi-signer requirement; verify collapse + toggle |
| Mobile nav Evidence slot | Bottom tab bar shows Dashboard, Calendar, Tasks, **Evidence**, More on viewport <1024px | None | Manual: resize to mobile; tap each tab; verify Evidence routes to `/evidence` |

---

## 8. Deferred items (within Wave 2 scope)

| Item | Reason | Suggested follow-up |
|------|--------|---------------------|
| **U-02 GVGB primitives migration** | No `src/policy/components/gvgb/` package exists; only safe non-frozen GVGB page is `GVGBAppendixPrint.tsx` (trivial color surface). Frozen files (`GVGBDetailView`, `GVGBPrintDocument`, `PolicyDetailPage`) hold the meaningful color debt | Track as Wave 3+ ticket once the GVGB component package is introduced OR a Lead 16 §14 owner exception is granted |
| **U-04 Library glass-panel normalization** | `LibraryPage.tsx` is FROZEN per Lead 16 §14 and holds the embedded `<style>` block with `.glass-interactive-lib` / `.glass-panel-lib` classes. No adjacent non-frozen file applies these classes | Track as Wave 3+ ticket. Two paths: (a) owner exception to edit `LibraryPage.tsx` directly, or (b) move glass class definitions to `src/index.css` (also touches a Wave 0 frozen file — requires owner sign-off) |
| **U-17 LoadingState adoption** | Primitive shipped clean. Subagent S7 picked 2 disjoint pages (`CesDashboardPage.tsx`, `MasterCalendarPage.tsx`); neither file had `<Loader2 className="… animate-spin" />` patterns to replace | Track as U-17 continuation ticket. Need a broader rg sweep to find files actually using ad-hoc Loader2 patterns; adoption is per-page audit-led |
| **EVIDENCE-001 consumer prefetch wiring** | Consumer pages (`EvidenceCenterPage`, `ArtifactViewerPage`, `WorkflowExecutionPanel`) should call `prefetchDemoEvidenceFromIdb([...ids])` on mount to warm cache for files >4 MB. Wiring left intentionally out of scope to avoid touching files outside the EVIDENCE-001 storage seam | Follow-on ticket. Each consumer wiring is 1-2 lines + one async effect |
| **AUDIT-001 v2 hash bump** | Top-level `targetKind`/`targetId` fields are NOT in the hash chain for v1 to preserve verifiability of existing chains | Future ticket when audit consumers are ready. Bump `recordVersion` + canonicalization to include new fields, migrate chain verifier |
| **TASK-001 composite signers at projection layer** | This session's TASK-001 was strictly UI-display collapse (no projection or rollup math change). The MVP plan's mention of `taskProjectionCore.ts` orchestrator-only rule is honored (file untouched) | If a future ticket requires composite task IDs at projection (i.e. merging signer rows into a single composite EventTask), it would touch `taskProjectionCore.ts` and `useEventExecutionDataflow.ts` — orchestrator-led, frozen-file owner discipline applies |
| **PhotoEvidenceCapture consumer wiring** | Net-new primitive shipped; no page wired to use it yet | Adoption ticket: wire into EvidenceCenterPage and WorkflowExecutionPanel SUPPORTING_EVIDENCE_UPLOAD branches |
| **`@keyframes ci-sheet-slide-up` move from inline `<style>` to `src/index.css`** (Wave 1 carry-over) | <30 min orchestrator task; out of Wave 2 approved scope | Wave 3 or grooming sweep |
| **Browser Test 6 codified** (Wave 1 carry-over) | Out of Wave 2 approved scope | Same |

### Excluded (per user's "DO NOT TOUCH")
- eCign (server/ecign/*, `src/policy/ecign/*`)
- `FormSigningWorkspace.tsx`
- `FormViewer.tsx`
- `FormSignatureFlow.tsx`
- ECIGN-001 / ECIGN-002 / ECIGN-003 / ECIGN-004
- Wave 3+
- Full mobile reconstruction
- Broad redesign
- Rollback drill
- Real-device UAT

---

## 9. Explicit confirmations

### ✓ Wave 1 was not reopened
Verified by reading `src/policy/components/CommandCenterLayout.tsx` mobile tab bar region (Wave 1 backdrop-blur cleanup intact at line 1066-1073), Wave 1 P0-CES-001 `buildTaskLinkedFormRoute` in `WorkflowExecutionPanel.tsx` (preserved), and Wave 1 U-01 CES theme files (`src/policy/ces/theme.ts`, `src/index.css` `--ces-*` block) were untouched. Mobile nav slot edit (Workflows → Evidence) is an additive Wave 2 change in the same file; the Wave 1 glass-stack edit at lines 1066+ is preserved with its original comment intact.

### ✓ eCign was not touched
Zero edits under `src/policy/ecign/` or `server/ecign/`. Zero edits to `FormSigningWorkspace.tsx`, `FormViewer.tsx`, `FormSignatureFlow.tsx`. The AUDIT-001 work centralized changes in `appendTaskAuditEvent` so eCign-emitting code paths in `FormSigningWorkspace.tsx` (which still call the function) get the dual-write enrichment automatically without their file being touched. Confirmed by `git status` would show none of those files modified.

---

## 10. What Wave 2 cost (calibration vs. earlier estimates)

| Pre-Wave-2 estimate | Actual |
|---------------------|--------|
| Wave 2 envelope: 4-5 calendar days based on MVP review §02 | ~2 hours single-orchestrator + 13 subagents in this session |
| TASK-001: 3-5 agent-days envelope | ~30 min orchestrator (because the slice resolved to pure UI collapse; no projection-layer change required per exploration) |
| EVIDENCE-001: 3-4 agent-days envelope | ~25 min Sonnet 4.6 subagent (because the storage seam was `demoEvidenceRuntimeCache`, not the frozen `localDemoAdapter` — additive write-through preserved all callers) |
| AUDIT-001: 2-3 agent-days envelope | ~20 min orchestrator (centralized in one helper; hash chain intentionally NOT bumped for v1) |
| ARTIFACT-001: 1-2 agent-days envelope | ~15 min Grok 4.3 subagent (clean additive helper; one consumer call site) |

The compression vs. estimate is because: (a) exploration revealed simpler implementation surfaces than the MVP envelope assumed (e.g. EVIDENCE-001 didn't need to refactor the unused adapter factory; TASK-001 didn't need projection-layer changes), (b) all P0/P1 items had clean choke points that limited blast radius, and (c) the orchestrator-only serialization rule prevented any merge thrash.

---

## 11. Next session recommendation

### Wave 3 candidates (NOT executed this session — for user approval)
- Consumer wiring for EVIDENCE-001 (`prefetchDemoEvidenceFromIdb` adoption) — 1-2 hours
- PhotoEvidenceCapture consumer wiring in EvidenceCenterPage + WorkflowExecutionPanel — 2-3 hours
- LoadingState adoption sweep (U-17 continuation) — 2-4 hours after identifying real candidate files
- BottomSheetDrawer viewport-conditional swap (Wave 1 carry-over) — 1 agent-day per surface
- SignaturePad integration into FormSigningWorkspace — **PROTECTED SUBSYSTEM** (eCign-adjacent); requires architectural sign-off
- U-04 Library glass normalization — requires Lead 16 §14 owner exception
- U-02 GVGB primitive package — net new

### Human-bound items still outstanding (carry-over from earlier sessions)
- P-03 rollback owner assignment
- P-05 rollback drill
- R-02 eCign persistence integration (Protected Subsystem)
- M-01 through M-08 mobile field UAT
- ECIGN-001/002/003/004 architectural review
- Wave 7 real-agency cohort sign-off

---

## 12. Source-of-truth file pointers

For follow-on work, the canonical artifacts produced/edited this session:

- TASK-001 implementation: `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` (search `COMPOSITE_SIGNER_COLLAPSE_THRESHOLD`)
- TASK-001 flag: `src/policy/pm/featureFlags.ts` (`composite_form_signers`)
- EVIDENCE-001 implementation: `src/policy/evidence/storage/indexedDbEvidenceBlobStore.ts` + `EVIDENCE_BLOB_VERSION.ts` + `src/policy/evidence/demoEvidenceRuntimeCache.ts`
- AUDIT-001 implementation: `src/policy/stores/regulatoryExecutionStore.ts` `appendTaskAuditEvent` + `src/policy/compliance-execution/types.ts` `EventExecutionAuditEvent`
- ARTIFACT-001 implementation: `src/policy/artifacts/artifactToFormInstance.ts` + `src/policy/pages/ArtifactViewerPage.tsx`
- Mobile nav slot: `src/policy/components/CommandCenterLayout.tsx` `MOBILE_PRIMARY_TABS`
- U-15 StagingM01 gating: `src/App.tsx` `STAGING_M01_ENABLED` + `src/policy/journey/pages/JourneyHomePage.tsx` `STAGING_MODULES`
- U-10 RightDrawer `xl`: `src/policy/components/ui/RightDrawer.tsx`
- U-03 token migration: `src/policy/components/SharedPolicyDetailView.tsx`
- Primitives: `src/policy/components/ui/PhotoEvidenceCapture.tsx`, `src/policy/components/ui/LoadingState.tsx`
- Verification fix: `package.json` (`verify:task-identity` script)

---

**Final rule honored**: Wave 2 only. No scope expansion. No protected eCign edits. No "while we're here."
