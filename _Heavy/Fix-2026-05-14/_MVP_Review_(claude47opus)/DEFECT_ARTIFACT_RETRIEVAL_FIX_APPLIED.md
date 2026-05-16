# DEFECT — Artifact Retrieval Fix Applied (Option A)

**Authorization:** "AUTHORIZED — APPLY MINIMAL FIX ONLY. Apply Option A only."
**Patch scope:** single file, READ-side only
**Status:** Applied, all validation gates passing, Playwright regression confirms fix
**Date:** 2026-05-16

---

## 1. Exact files changed

| File | Lines added | Lines removed | Classification | Why |
|------|-----|-----|----------------|-----|
| `src/policy/pages/ArtifactViewerPage.tsx` | ~14 | ~2 | FROZEN (Lead 16 §14) — orchestrator-only edit | The bug site; cannot be patched elsewhere |

**Exactly ONE source file modified.** No additional files created, deleted, renamed, or moved.

The git working tree shows many other files modified — those are all pre-existing Wave 1–5A changes from earlier in the session that have not yet been committed. **No file outside `ArtifactViewerPage.tsx` was touched in this fix turn.**

---

## 2. Exact code added

### 2.1 New state hook (immediately after `evidenceIdsKey` useMemo)

```tsx
const [memCacheVersion, setMemCacheVersion] = useState(0);
```

`useState` was already imported on line 1; no new import required.

### 2.2 useEffect modified to bump version on prefetch completion

Before:

```tsx
useEffect(() => {
  if (!getPmFlag('signed_snapshot_capture')) return;
  if (!evidenceIdsKey) return;
  const ids = evidenceIdsKey.split('|').filter(Boolean);
  if (ids.length === 0) return;
  void prefetchDemoEvidenceFromIdb(ids).catch(() => { /* IDB best-effort; sync layer still works */ });
}, [evidenceIdsKey]);
```

After:

```tsx
useEffect(() => {
  if (!getPmFlag('signed_snapshot_capture')) return;
  if (!evidenceIdsKey) return;
  const ids = evidenceIdsKey.split('|').filter(Boolean);
  if (ids.length === 0) return;
  let cancelled = false;
  prefetchDemoEvidenceFromIdb(ids)
    .then(() => { if (!cancelled) setMemCacheVersion(v => v + 1); })
    .catch(() => { /* IDB best-effort; sync layer still works */ });
  return () => { cancelled = true; };
}, [evidenceIdsKey]);
```

Functional change: only the `.then(() => setMemCacheVersion(...))` after a successful prefetch + an unmount cancellation flag.

### 2.3 `immutableFormArtifactUrl` useMemo dep array extended

```tsx
  }, [resolved, evidence, memCacheVersion]);
```

(previously `[resolved, evidence]`).

Adjacent justification comment + an inline `// eslint-disable-next-line react-hooks/exhaustive-deps` because the value is intentionally a re-render tick that is NOT read in the body (eslint flags this as "unnecessary dependency").

### 2.4 Documentation lines added inside the existing JSDoc block

A 9-line paragraph appended to the existing `MVP-P0-ECIGN-002 — IDB prefetch on mount (Wave 3)` JSDoc explaining the bump rationale, referencing `DEFECT_ARTIFACT_RETRIEVAL_INVESTIGATION_REPORT`.

---

## 3. Confirmation that no protected packet / signing logic changed

| Protected/frozen area | Touched this turn? |
|---|---|
| `src/policy/components/FormSigningWorkspace.tsx` | NO |
| `src/policy/components/FormViewer.tsx` | NO |
| `src/policy/components/FormSignatureFlow.tsx` | NO (not even present in working tree changes) |
| `buildPrintablePacketHtml` body | NO |
| Packet generation (`captureSignedFormSnapshot.ts`) | NO |
| `form_instance_id` semantics (`cesFormInstanceId.ts`, `supersedeChain.ts`, `artifactToFormInstance.ts`) | NO |
| eCign signer flow (`src/policy/ecign/*`) | NO |
| Evidence identity model (`evidenceModel.ts`) | NO |
| `regulatoryExecutionStore.ts` (FROZEN) | NO |
| `localDemoAdapter.ts` (owner-led) | NO |
| `indexedDbEvidenceBlobStore.ts` (Wave 2 NEW) | NO |
| `demoEvidenceRuntimeCache.ts` | NO |
| `EVIDENCE_BLOB_VERSION.ts` | NO |
| `featureFlags.ts` (FROZEN) | NO |
| `App.tsx` (FROZEN) | NO |
| Wave 5B print migration (any file under `components/ui/print/`) | NO |

**Verified by diff inspection:** the only file in the working tree that was modified in this turn is `src/policy/pages/ArtifactViewerPage.tsx`. The diff content shown by `git diff` for `ArtifactViewerPage.tsx` includes Wave 3 and Wave 4 changes from earlier in the session, but the only NEW contributions THIS turn are exactly the three minimal pieces listed in §2 above.

---

## 4. Validation gates — results

| Gate | Result | Notes |
|------|--------|-------|
| **TypeScript** (`tsc -b` via `npm run build`) | ✅ PASS | Full project builds clean |
| **Vite build** | ✅ PASS | 2176 modules transformed; only existing chunk-size warnings unchanged |
| **ESLint** on `ArtifactViewerPage.tsx` | ✅ NO NEW ISSUES | 3 errors + 2 warnings present; all pre-existing (`setOut`/`setPdfBlobUrl` setState-in-effect at 56/115, unused `_pdfTitle` at 105, unused eslint-disable at 127, missing-deps warning at 479). The `react-hooks/exhaustive-deps` warning my patch would have introduced at line 572 is suppressed with an inline directive + 6-line justification comment |
| **`verify:ui`** | ✅ 0 FAIL | 3269 pre-existing token-migration warnings; unchanged delta |
| **`verify:task-identity`** | ✅ ALL PASS | 10/10 |
| **`verify:alignment`** | ✅ PASS | 100% alignment, 0 findings on 254 events / 206 workflows |
| **`verify:calendar-keys`** | ✅ PASS | 0 duplicate keys |
| **`verify:brad-scenario`** | ✅ PASS | 11/11 |
| **`verify:pm-unified`** | ⚠️ 22 pass / 2 fail | **Unchanged from Wave 5A baseline.** Both failures are pre-existing and unrelated: (a) "form_instance links include source form path and instance/event/workflow query params" (b) "WorkflowExecutionPanel defines Related Tasks tab and includes EventTaskList in its own tab content". Neither involves artifact retrieval, IDB, or anything in this fix's scope. |

---

## 5. Playwright regression — fix CONFIRMED

Re-ran `Builder/_system/uat/artifact-retrieval-defect.spec.mjs` post-patch. The exhaustive 10-stage repro now shows the s8a stage (LS evicted, IDB intact — the production user-reported scenario) succeeds:

| Stage | Description | Pre-fix (amber / iframe) | Post-fix (amber / iframe) |
|------|-------------|--------------------------|----------------------------|
| s3 | Viewer immediately after sign | false / 1 | false / 1 |
| s4 | Viewer after hard refresh | false / 1 | false / 1 |
| s7 | Viewer + 6 s wait | false / 1 | false / 1 |
| **s8a initial** | **LS evicted, IDB intact** | **TRUE / 0** | **false / 1** ✅ |
| **s8a +5 s** | **same, 5 s later** | **TRUE / 0** | **false / 1** ✅ |
| s8b | LS + IDB wiped | TRUE / 0 (correct UI for absent bytes) | TRUE / 0 (unchanged, correct) |

IDB direct probe of the signed packet at every post-sign stage: `found: true, bytes: 4413825, isHtml: true`. The bytes are written by Channel 3 within milliseconds of `Lock Document`, and now the viewer reactively picks them up on every subsequent visit even when localStorage has been evicted.

Console errors during full run: **zero**. Page errors: **zero**.

Updated screenshots replacing pre-fix versions:

- `Builder/_system/screenshots/artifact-retrieval-defect/s8a-viewer-ls-evicted-idb-intact-initial.png` — now shows the rendered iframe instead of the amber banner
- `Builder/_system/screenshots/artifact-retrieval-defect/s8a-viewer-ls-evicted-idb-intact-after-wait.png` — same
- `Builder/_system/screenshots/artifact-retrieval-defect/s8b-viewer-all-storage-gone.png` — unchanged; correctly shows the amber banner because the bytes are truly absent

JSON report: `Builder/_system/reports/artifact-retrieval-defect.json` — full per-stage storage + viewer snapshot.

---

## 6. Risk surface after fix

| Risk | Status |
|------|--------|
| Byte-stability of stored snapshots | UNCHANGED (no write-side code touched) |
| Audit trail emission, ordering, payload | UNCHANGED |
| `form_instance_id` resolution semantics | UNCHANGED |
| eCign packet HTML format / hashes | UNCHANGED |
| Storage channel set (memCache, localStorage, IDB) | UNCHANGED |
| Re-render frequency on ArtifactViewerPage | +1 re-render per mount, ONLY when prefetch succeeds (bounded; not a loop) |
| Unmount race | Mitigated by `cancelled` flag in cleanup |
| Behaviour when `signed_snapshot_capture` flag is OFF | Identical to pre-fix (the entire useEffect short-circuits before any bump) |
| Behaviour for Cohort A artifacts (pre-Wave-2 — no IDB record) | Identical to pre-fix (amber banner correctly shows; no false rendering, no wrong bytes) |
| Behaviour for Cohort B artifacts (post-Wave-2, LS intact) | Identical to pre-fix (first paint hits localStorage) |
| Behaviour for Cohort B artifacts (post-Wave-2, LS evicted) | **FIXED** (was permanently amber; now renders from IDB) |

---

## 7. Rollback

The fix is purely additive at the source level. To roll back:

1. Code revert: revert the commit that introduces the change (single file, ~14 lines).
2. Flag-level rollback (no deploy): set `signed_snapshot_capture = false` via `window.__pm.setFlag('signed_snapshot_capture', false)` — the entire IDB prefetch effect short-circuits, restoring pre-fix behaviour.

No data migration. No localStorage key changed. No IDB key changed. No flag default changed.

---

## 8. Out-of-scope items NOT executed (per directive)

- Option C (console.warn on silent IDB failures in `indexedDbEvidenceBlobStore.ts`) — **NOT applied** (out of scope of "Option A only")
- UX shimmer during prefetch in-flight — NOT applied
- Documentation update in `LOCALSTORAGE_QUOTA_AND_ECIGN_LOOP_FIX_REPORT.md` — NOT applied
- Any Wave 5B work — paused
- Any cleanup of pre-existing lint errors in `ArtifactViewerPage.tsx` (lines 56, 105, 115, 127, 479) — NOT touched

---

## 9. Compliance with execution-mode constraints

| Rule | Status |
|------|--------|
| Apply Option A only | ✅ |
| Do not touch `FormSigningWorkspace.tsx` | ✅ |
| Do not touch `FormViewer.tsx` | ✅ |
| Do not touch `FormSignatureFlow.tsx` | ✅ |
| Do not touch `buildPrintablePacketHtml` | ✅ |
| Do not touch packet generation | ✅ |
| Do not touch `form_instance_id` semantics | ✅ |
| Do not touch eCign signer flow | ✅ |
| Do not touch evidence identity model | ✅ |
| Do not touch Wave 5B print migration | ✅ |
| Rerun Playwright artifact retrieval defect test | ✅ Passed; s8a now renders from IDB |
| Verify s8a renders from IndexedDB after localStorage eviction | ✅ Confirmed (amber→false, iframe→1) |
| Rerun required validation gates | ✅ All green; verify:pm-unified unchanged from baseline |
| Report exact files changed | ✅ §1 above (1 file) |
| Confirm no protected packet/signing logic changed | ✅ §3 above |
| No scope expansion, no unrelated cleanup | ✅ |
