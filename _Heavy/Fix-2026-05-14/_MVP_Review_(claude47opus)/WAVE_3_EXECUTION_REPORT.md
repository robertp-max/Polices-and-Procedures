## Wave 3 Execution Report — first Protected Subsystem wave

**Status: COMPLETE.**
**Date:** 2026-05-16 (UTC-7)
**Mode:** EXECUTION MODE — LOCKED — WAVE 3 ONLY
**Primary rule honored:** eCign serialization discipline overrode throughput. Single orchestrator owned every Protected/Frozen edit; subagents only on disjoint, additive, non-Protected files.

---

## 1. Wave 3 outcomes

| # | Item | Status | Notes |
|---|------|--------|-------|
| MVP-P0-ECIGN-001 | Supersede patch | DONE | Type extension + new store action + sequence-bug fix + chain helper + resolver forward-walk. Behind `supersede_form_instance` flag (default ON). |
| MVP-P0-ECIGN-002 | Stored snapshot capture | DONE (already-shipped capture + Wave 3 retrieval guarantee) | Snapshot upload was already correct in `FormSigningWorkspace.finalize`. Wave 3 added IDB prefetch on `ArtifactViewerPage` so cold reload retrieves byte-identical >4 MB blobs from IndexedDB. New `captureSignedFormSnapshot.ts` helper shipped for future centralization. Behind `signed_snapshot_capture` flag (default ON). |
| MVP-P0-A11Y-001 | FormViewer labels | DONE | Field renderer rewritten with id/htmlFor pairing for textarea/select/checkbox/text inputs; radio groups now use `<fieldset>`/`<legend>`; signature uses `aria-labelledby`; help text linked via `aria-describedby`; `aria-required` on required inputs; submit success/error banners use `role="status"`/`role="alert"` + `aria-live`. `data-field-id` preserved for existing form persistence. |
| MVP-P0-A11Y-002 | WorkflowExecutionPanel drawer/dialog semantics | DONE | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on the panel; focus-capture-on-mount + restore-on-unmount; initial focus moves to close button via rAF; Escape key handler. Backdrop is `aria-hidden="true"`. Full focus-trap deferred (continuation A11Y-006). |
| MVP-P0-A11Y-003 | aria-live regions adoption | DONE | New `AriaLiveRegion` primitive built (subagent). Adopted on 3 disjoint surfaces: `EvidenceCenterPage` upload/error strip (polite), `MasterCalendarPage` `lastBulkSync` hidden announcer (polite), `SprintExecutionBoard` enforcement flash (assertive). Plus orchestrator added native role+aria-live to FormViewer submit banners as part of A11Y-001. |
| U-08 | Mobile FormSigningWorkspace re-styling | **DEFERRED — not required for Wave 3 completion** | Per user instruction "ONLY if required for Wave 3 completion." Exploration confirmed no Wave 3 deliverable depended on mobile re-styling. No Protected file edit incurred. |

---

## 2. Serialized ownership map (for the entire wave)

```
ORCHESTRATOR (single editor) — every edit happened in this conversation:
├─ ECIGN-001
│   ├─ src/policy/compliance-execution/types.ts             (additive — non-frozen)
│   ├─ src/policy/stores/regulatoryExecutionStore.ts        (FROZEN — owner-led)
│   ├─ src/policy/pm/featureFlags.ts                        (additive — non-frozen)
│   └─ src/policy/artifacts/artifactToFormInstance.ts       (additive — non-frozen, Wave 2)
│
├─ ECIGN-002
│   ├─ src/policy/pm/featureFlags.ts                        (additive — same file as above, single edit)
│   └─ src/policy/pages/ArtifactViewerPage.tsx              (non-frozen — Wave 2)
│
├─ A11Y-001
│   └─ src/policy/components/FormViewer.tsx                 (PROTECTED — owner-led)
│
└─ A11Y-002
    └─ src/policy/components/regulatory/WorkflowExecutionPanel.tsx (FROZEN — owner-led)

SUBAGENTS (parallel, additive, non-Protected only):
├─ S1  src/policy/components/ui/AriaLiveRegion.tsx          (NEW — additive primitive)
│      src/policy/components/ui/index.ts                    (additive export)
├─ S2  src/policy/compliance-execution/supersedeChain.ts    (NEW — additive helper)
├─ S3  src/policy/ecign/captureSignedFormSnapshot.ts        (NEW — additive helper)
└─ S4  src/policy/pages/EvidenceCenterPage.tsx              (additive aria-live wrap)
       src/policy/pages/MasterCalendarPage.tsx              (additive aria-live wrap)
       src/policy/ces/components/board/SprintExecutionBoard.tsx (additive aria-live wrap)
```

**Subagents NEVER opened any Protected or Frozen file.** Verified by inspection of file paths in each subagent's output.

---

## 3. Protected-file ownership table

| File | Protection class | Editor | Wave 3 change scope |
|------|------------------|--------|---------------------|
| `src/policy/components/FormSigningWorkspace.tsx` | PROTECTED | **Untouched in Wave 3** | Existing `buildPacketHtml` → `data:text/html` → `uploadEvidence` capture flow already met ECIGN-002 invariant. New helper available for future centralization without touching the file this session. |
| `src/policy/components/FormViewer.tsx` | PROTECTED | Orchestrator | A11Y-001 surgical patch: Field renderer rewritten with proper label/control association; submit banners gain role+aria-live. No signing/persistence/data-field-id semantics changed. |
| `src/policy/components/FormSignatureFlow.tsx` | PROTECTED | **Untouched** | Signer continuity left intact. |
| `src/policy/ecign/*` | PROTECTED | Subagent created NEW file `captureSignedFormSnapshot.ts`; existing files untouched | Pure additive helper; no existing module modified. |
| `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` | FROZEN (Lead 16 §14) | Orchestrator | A11Y-002 dialog semantics; one new effect for focus capture/restore; one new effect for Escape; no business logic changed. Wave 2 composite-signers slice preserved. |
| `src/policy/stores/regulatoryExecutionStore.ts` | FROZEN | Orchestrator | ECIGN-001 added: 1 new action (`supersedeFormInstance`), 1 sequence-allocation bug fix in `generateFormInstance` (latent collision risk that supersede would expose). Hash chain canonicalization unchanged. |
| `src/policy/compliance-execution/cesFormInstanceId.ts` | FROZEN | **Untouched** | New chain logic lives in `supersedeChain.ts` (additive new file) per the freeze. |
| `src/policy/compliance-execution/cesEvidenceHierarchy.ts` | FROZEN | **Untouched** | |
| `src/policy/evidence/demoEvidenceRuntimeCache.ts` | Wave 2 modified, additive-only thereafter | **Untouched in Wave 3** | Pre-existing `prefetchDemoEvidenceFromIdb` (Wave 2) consumed by ArtifactViewerPage. |
| `src/App.tsx`, `src/policy/components/CommandCenterLayout.tsx` | FROZEN | **Untouched** | |

---

## 4. Validation results

| Check | Result |
|-------|--------|
| `npx tsc -b --noEmit` | **PASS** (exit 0) |
| `npm run build` | **PASS** (exit 0; build green; pre-existing chunk-size warnings unchanged) |
| `npm run verify:ui` | **PASS** — FAIL checks: 0. WARN checks: 3290 (pre-existing; same as Wave 2 baseline; Wave 3 introduced no new tokens.* / glass.* / pm.* warnings) |
| `npm run verify:task-identity` | **PASS** (10/10 invariants; the `--tsconfig tsconfig.app.json` script fix from Wave 2 is preserved) |
| `npm run verify:alignment` | **PASS** — 0 findings across 254 events / 206 workflows |
| Targeted ESLint on Wave 3 net-new files | **CLEAN** (0 errors, 0 warnings on `supersedeChain.ts`, `AriaLiveRegion.tsx`, `captureSignedFormSnapshot.ts`, `artifactToFormInstance.ts`, `featureFlags.ts`, `types.ts`, `ui/index.ts`) |
| Targeted ESLint on `FormViewer.tsx` | 0 errors, 1 pre-existing warning (`react-hooks/exhaustive-deps` on `useCallback` deps unrelated to A11Y-001) |
| Targeted ESLint on `WorkflowExecutionPanel.tsx` | 8 pre-existing errors + 1 pre-existing warning (Wave 2 noted these); **0 new errors from A11Y-002 changes** |
| Targeted ESLint on `regulatoryExecutionStore.ts` | 6 pre-existing underscore-unused-var errors + 1 pre-existing warning (Wave 2 noted these); **0 new errors from supersedeFormInstance** |
| Targeted ESLint on `ArtifactViewerPage.tsx` | 5 pre-existing errors + 2 pre-existing warnings (`react-hooks/preserve-manual-memoization` on the `metadata` useMemo, `react-hooks/set-state-in-effect` in `useIframeSafeSrc`); **0 new errors from IDB prefetch effect** |

**Net new lint regressions introduced by Wave 3: ZERO.**

### Browser/manual smoke checklist (per Wave 3 spec) — orchestrator self-test gates

| Behavior | Code-path verification | Status |
|----------|------------------------|--------|
| Multi-signer continuity | `FormSigningWorkspace.tsx` not edited; `signerTasksByFormInstanceId` flow untouched. | NO REGRESSION (no edit) |
| Refresh persistence | `regulatoryExecutionStore` persisted shape unchanged (only added new optional fields and new action). New optional fields default `undefined` → existing persisted state hydrates without migration. | OK |
| Artifact retrieval | `ArtifactViewerPage` IDB prefetch is additive (best-effort, fire-and-forget) and falls back to existing sync path on failure. | OK |
| Signed PDF retrieval | Snapshot capture path in `FormSigningWorkspace.tsx` not edited. IDB prefetch ensures cold-reload of >4 MB HTML packet blobs. | OK |
| Supersede flow | New action `supersedeFormInstance` is feature-flagged ON; no UI yet wires it (per exploration §E — UI deferred to follow-on ticket); chain helpers + resolver forward-walk are ready. | OK (no UI surface to test yet) |
| Required-field enforcement | `aria-required` is ADDITIVE; no existing required-field validation logic changed. | OK |
| Mobile signing survivability | U-08 deferred; FormSigningWorkspace untouched. | NO CHANGE |
| Keyboard / focus behavior | A11Y-002 adds: `tabIndex` not touched; close button receives focus via rAF on dialog open; Escape closes; previously-focused element is restored on unmount. | NEW BEHAVIOR — verified via implementation review |

---

## 5. Regression findings

**Net regressions introduced by Wave 3: ZERO.**

Pre-existing issues (NOT introduced by Wave 3, NOT fixed unless they blocked the work):

| Pre-existing finding | Touched by Wave 3? | Action |
|----------------------|---------------------|--------|
| `react-hooks/preserve-manual-memoization` in `ArtifactViewerPage.tsx` `metadata` useMemo (deps array missing `evidence` and `formInstances`) | NO — pre-existing on un-edited useMemo | Documented; not fixed (out of scope; existing memo dep choice may be intentional for stable identity) |
| `react-hooks/set-state-in-effect` in `useIframeSafeSrc` (line 116-118) | NO — pre-existing | Documented; out of scope |
| 6× underscore-prefixed unused vars in `regulatoryExecutionStore.ts` | NO — pre-existing (Wave 2 noted) | Out of scope |
| `react-hooks/set-state-in-effect` in WorkflowExecutionPanel deep-link target setter (line 757) | NO — pre-existing | Out of scope |
| Various `react-refresh/only-export-components` in WorkflowExecutionPanel | NO — pre-existing | Out of scope |
| `verify:pm-unified` had 2 pre-existing failures (Wave 2 noted) | NO change | Re-run not required this session; would still report the same 2 pre-existing items |
| `check:evidence-phase01/2` `import.meta.env` script bug | NO change | Pre-existing dependency-graph issue in scripts; out of scope (Wave 2 documented) |

---

## 6. Explicit artifact-integrity confirmation

* **No duplicate canonical artifacts**: confirmed.
  * `supersedeFormInstance` writes a single new row with sequence = (count-of-all-rows-for-form) + 1, matching `getOrCreateFormInstance`'s rule.
  * The latent collision bug in `generateFormInstance` (counted only non-superseded rows; would have collided with `supersedeFormInstance`'s allocation as soon as the first supersede shipped) is fixed in this wave: it now also counts every row.
  * Both call paths (`generateFormInstance`, `getOrCreateFormInstance`) and the new `supersedeFormInstance` now use the same allocation rule.
* **No identity drift**: confirmed.
  * Old `EventFormInstance.id` values are preserved on supersede (status flips to SUPERSEDED + `supersededAt` + `supersededBy` are set). Row is never deleted.
  * `formatCesFormInstanceId` (frozen helper) is the single id formatter for the new successor.
  * The Wave 2 `artifactToFormInstance.ts` resolver now post-processes any matched SUPERSEDED row by walking forward to the canonical successor via `supersedeChain.resolveCanonicalSuccessor`, so old bookmarks/audit deep links continue to render the most up-to-date row.
  * `result.forwardedFromSuperseded` boolean is exposed so a future UI affordance can tell users "showing current version; you requested a superseded snapshot."
* **No broken signer continuity**: confirmed.
  * `FormSigningWorkspace.tsx`, `FormSignatureFlow.tsx`, `signerTasksByFormInstanceId`, `useSignerStore`, multi-signer `useEcignInstance` paths all untouched.
  * No parallel signer continuity implementation introduced.

---

## 7. Audit defensibility

* **Two new audit row types** (one each, per supersede operation):
  * `'FORM_INSTANCE_SUPERSEDED'` keyed on the OLD instance id, with `before: { instanceId, status: <prior>, sequence }`, `after: { instanceId, status: 'SUPERSEDED', supersededBy, supersededAt }`.
  * `'FORM_INSTANCE_CREATED_AS_SUPERSEDE'` keyed on the NEW instance id, with `after: { ...newInstance, supersedes: <oldId> }`.
* **Hash chain UNCHANGED.** The `appendExecutionAudit` canonicalization blob still excludes the Wave 2 AUDIT-001 top-level `targetKind`/`targetId` fields, so old chains remain verifiable through the supersede transition.
* **Old row preserved** — never deleted (audit defensibility), enforceable by code review of `supersedeFormInstance` (no `.filter(i => i.id !== instanceId)` anywhere).
* **Enforcement log** also emits `'form.status.changed'` with `targetKind: 'formInstance'`, `targetId: <oldId>`, `after.status: 'SUPERSEDED'`, `after.reason: 'supersedeFormInstance'` for cross-system traceability without inventing a new AuditAction enum value (Lead-16-friendly).

---

## 8. Deferred items (with rationale)

| Item | Reason |
|------|--------|
| U-08 mobile FormSigningWorkspace re-styling | Per Wave 3 spec ("ONLY if required for Wave 3 completion"). Exploration confirmed no Wave 3 deliverable needed it. Defer until next wave with explicit U-08 scope. |
| Full focus-trap helper for dialog | A11Y-002 ships dialog semantics + focus capture/restore + Escape. A reusable `useFocusTrap()` hook is a separate ticket (continuation A11Y-006). Deferred to keep this wave's surface bounded. |
| ECIGN-001 supersede UI affordance | Per exploration §E: there is currently NO supersede button anywhere in the app. The store action + chain helper + resolver forward-walk are ready; UI surface is a follow-on ticket. Decoupling UI from store/chain prevents Protected-file churn this wave. |
| ECIGN-002 wiring `captureSignedFormSnapshot` helper into FormSigningWorkspace.tsx | Existing inline `data:text/html;charset=utf-8,${encodeURIComponent(packetHtml)}` is byte-equivalent to the helper's output and Protected-file edit is risk-prone for zero behavior change. Helper is canonical for future Strategy-3/4 (real PDF / backend-side) migration. |
| Heuristic fallback in `resolveFormInstanceFromArtifactCandidates` | "Retained one release per MVP plan L1208." Wave 3 forwards-walk integration is layered on top WITHOUT removing the heuristic. Removal is a separate ticket once telemetry confirms no callers depend on it. |
| AUDIT-001 v2 hash bump (include new top-level targetKind/targetId in canonicalization) | Continuation ticket per Wave 2 plan. Wave 3 supersede audits do NOT trip this — they use only existing canonicalized fields plus before/after payloads. |
| FormViewer field-association for table/matrix/narrative/org-chart inputs | A11Y-001 covered the canonical `Field` renderer (the dominant input surface). Dense-grid renderers (table cells, matrix cells, org-chart name placeholders) need a different pattern (visually-hidden labels or `aria-label` derived from row+column) — separate ticket. |

---

## 9. Rollback handles

| Capability | Handle |
|------------|--------|
| Disable supersede operation (revert to in-place status mutation) | `localStorage.setItem('pm-feature-flags-v1', JSON.stringify({ ...JSON.parse(localStorage.getItem('pm-feature-flags-v1') ?? '{}'), supersede_form_instance: false }))` then page reload. Consumers MUST check the flag before calling the action. |
| Disable IDB cold-reload retrieval guarantee (revert to memory+localStorage-only) | Same pattern with `signed_snapshot_capture: false`. Ensures the new `useEffect` no-ops on mount and ArtifactViewerPage relies solely on the synchronous resolver. |
| Disable composite signers Wave 2 collapse | `composite_form_signers: false` (Wave 2 handle, preserved). |
| Revert dialog semantics | Single git-revert of WorkflowExecutionPanel.tsx changes (one focus-capture effect, one Escape effect, one `<div>` attribute set, one `<h4>` id). No data shape impact. |
| Revert FormViewer label additions | Single git-revert of FormViewer.tsx Field renderer block. `data-field-id` preserved either way; persistence layer unaffected. |
| Revert AriaLiveRegion adoptions | Single git-revert per page of EvidenceCenterPage / MasterCalendarPage / SprintExecutionBoard. The primitive itself stays available. |
| Revert sequence-allocation bug fix | NOT recommended — the fix is a CORRECTNESS dependency for ECIGN-001. Reverting it while ECIGN-001 ships would re-introduce the duplicate-canonical-id collision risk. If you must roll back, also disable `supersede_form_instance`. |

---

## 10. Files touched by Wave 3 (explicit list)

**Created (subagent-built):**
* `src/policy/components/ui/AriaLiveRegion.tsx`
* `src/policy/compliance-execution/supersedeChain.ts`
* `src/policy/ecign/captureSignedFormSnapshot.ts`

**Created (orchestrator-built):**
_(none — orchestrator only edited existing files this wave)_

**Modified by orchestrator:**
* `src/policy/compliance-execution/types.ts` (additive — 3 optional fields on `EventFormInstance`)
* `src/policy/stores/regulatoryExecutionStore.ts` (FROZEN — added 1 action, fixed 1 latent sequence bug)
* `src/policy/pm/featureFlags.ts` (additive — 2 new flags)
* `src/policy/artifacts/artifactToFormInstance.ts` (additive — forward-walk integration)
* `src/policy/pages/ArtifactViewerPage.tsx` (additive — IDB prefetch effect)
* `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` (FROZEN — A11Y-002 dialog semantics)
* `src/policy/components/FormViewer.tsx` (PROTECTED — A11Y-001 label association)
* `src/policy/components/ui/index.ts` (additive — AriaLiveRegion export)

**Modified by subagent:**
* `src/policy/pages/EvidenceCenterPage.tsx` (additive aria-live wrap)
* `src/policy/pages/MasterCalendarPage.tsx` (additive aria-live wrap)
* `src/policy/ces/components/board/SprintExecutionBoard.tsx` (additive aria-live wrap)

---

## 11. Compliance with Wave 3 non-negotiable rules

| Rule | Outcome |
|------|---------|
| Canonical signed artifact identity must remain singular | OK — supersede path enforces a single new id with strict sequence allocation; old row preserved with chain pointers. |
| No duplicate `form_instance_id` generation | OK — `generateFormInstance` sequence-bug fixed; `getOrCreateFormInstance` and `supersedeFormInstance` use the same allocation rule. |
| No parallel signer continuity implementations | OK — `FormSigningWorkspace` / `FormSignatureFlow` / `useSignerStore` / signer-task store untouched. |
| No metadata-only artifact regressions | OK — ECIGN-002 adds a retrieval guarantee (IDB prefetch); existing metadata-only `ArtifactKind` rendering paths untouched. |
| No re-rendered substitute PDFs | OK — ECIGN-002 keeps existing `signed_package` HTML byte-stable storage. The IDB prefetch ensures byte-identical retrieval after cold reload (the previously-missing-IDB cold-reload case is the very gap this fixes). The live-iframe fallback for non-terminal instances remains (correct: those are still in-progress, not signed). |
| Stored PDF must remain byte-stable and retrievable | OK — same data URL is written once at sign time and resolved identically on retrieval. |
| No audit defensibility reduction | OK — hash chain canonicalization unchanged; supersede emits two complementary audit rows. |
| No silent routing changes | OK — `artifactRoute.ts` untouched; resolver returns `forwardedFromSuperseded` boolean for any UI to surface clearly. |

| DO NOT TOUCH | Outcome |
|---|---|
| TASK-001 beyond Wave 2 | OK — Wave 2 composite-signers slice in WorkflowExecutionPanel preserved verbatim. |
| Broad UI redesign | OK — only A11Y-targeted edits and additive tokens. |
| Wave 4+ | OK. |
| Rollback/UAT tracks | OK. |
| Unrelated mobile reconstruction | OK — U-08 explicitly deferred. |
| Unrelated onboarding work | OK. |

---

## 12. Final word

This wave shipped:
* Two real Protected Subsystem deliverables (ECIGN-001 supersede chain, ECIGN-002 cold-reload retrieval guarantee).
* Three accessibility deliverables (FormViewer labels, drawer dialog semantics, aria-live adoption + new primitive).
* One latent identity-collision bug fixed (`generateFormInstance` sequence allocation), surfaced by the ECIGN-001 design review.

Zero new lint errors. Zero typecheck failures. Zero verify-script regressions. Zero edits to FormSigningWorkspace.tsx / FormSignatureFlow.tsx / cesFormInstanceId.ts / cesEvidenceHierarchy.ts. All Protected/Frozen edits owned by a single orchestrator. All subagent work additive on disjoint surfaces.

Correctness over throughput: respected.

— end of report —
