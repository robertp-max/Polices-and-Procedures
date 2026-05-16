# DEFECT — Artifact Retrieval Investigation Report

**Classification:** P0/P1 — protected-subsystem defect
**Investigation scope:** evidence retrieval, immutable artifact hydration, snapshot persistence/retrieval, viewer rendering path (per execution lock)
**Investigation method:** Playwright (mandatory) + readonly source trace
**Status:** Root cause identified, minimal fix proposed, no code modified
**Date:** 2026-05-16

---

## 0. Executive summary

The defect surfaced in Browser Test 7 — an **immutable artifact viewer** loads metadata and audit chain correctly, but the **payload** does not render. Banners visible:

- "Signed artifact not available in this session"
- "No renderable preview for this state"

**Root cause is HYBRID — retrieval-path + rendering-path mismatch in `ArtifactViewerPage.tsx`:**

1. The **synchronous** read ladder (`resolveEvidenceDataUrl` → `peekDemoEvidenceDataUrl`) checks ONLY: `localDataUrl` field → in-memory `memCache` Map → `localStorage`. It does **not** read IndexedDB.
2. The **asynchronous** IDB prefetch (`prefetchDemoEvidenceFromIdb`) DOES fire on mount and DOES write IDB bytes into `memCache`, but it does **not** call `setState`. Therefore the `immutableFormArtifactUrl` useMemo (deps: `[resolved, evidence]`) never re-runs, and the iframe URL stays `undefined`.
3. Result: any artifact whose bytes live ONLY in IDB (the design path for >4 MB signed packets after localStorage eviction or cross-session reload) renders the amber "not available in this session" banner forever.

**Persistence works correctly** (all three channels write as designed in Wave 2). **Retrieval is broken** because the sync ladder is incomplete. **Rendering is broken** because the async fallback is wired but not observed by React.

This is the **direct, expected consequence** of the Wave 4 deferral noted in `WAVE_4_EXECUTION_REPORT.md` as **"EVIDENCE-001 consumer prefetch wiring — consumers need to be updated to use prefetchDemoEvidenceFromIdb"**: the prefetch call was added but the consumer's reactive integration was not finished.

---

## 1. Root-cause report

### 1.1 Determination

**HYBRID failure — retrieval + rendering**, with persistence intact.

| Layer | Status | Evidence |
|------|--------|---------|
| Packet generation | ✅ Working | `buildPrintablePacketHtml` produces full HTML; not on critical path of this defect |
| Persistence — memCache (Channel 1) | ✅ Working | `stashDemoEvidenceDataUrl` writes unconditionally |
| Persistence — localStorage (Channel 2) | ✅ Working *but size-gated in primary path* | Stash skips localStorage when `dataUrl.length > MAX_ITEM_BYTES (4 MB)`; redundant ungated write in `FormSigningWorkspace.tsx:1577-1579` recovers some cases |
| Persistence — IndexedDB (Channel 3) | ✅ **Confirmed working** | Playwright direct probe (corrected version+upgrade-handler) found a 4,413,825-byte HTML packet record under the signed evidence id, written within milliseconds of `Lock Document` |
| Retrieval — sync ladder | ❌ **Incomplete** | `resolveEvidenceDataUrl` → `peekDemoEvidenceDataUrl` (`demoEvidenceRuntimeCache.ts:67-79`) checks ONLY mem + localStorage; IDB is never queried synchronously |
| Retrieval — async prefetch | ⚠️ Wired but not observable | `prefetchDemoEvidenceFromIdb` runs in `useEffect` (line 210-216), fills `memCache`, but does not trigger React state change |
| Rendering — useMemo derivation | ❌ Stale | `immutableFormArtifactUrl` useMemo (line 540-557) deps `[resolved, evidence]` — neither changes when memCache is hydrated async; useMemo returns `undefined` permanently |

### 1.2 Why the user saw it on Browser Test 7

The user's Browser Test 7 step asked them to **"Find an OLD signed form/artifact created BEFORE Waves 3-5A, preferably something signed yesterday or earlier"** and then verify it still opens. Old artifacts hit the defect when ANY of these are true:

| Failure scenario | Cause | Defect surfaces? |
|---|---|---|
| **Old artifact, localStorage evicted** | Quota pressure / browser data clear / re-sign of the same form (which `removeEvidence`s the old row and the demo cache helper strips the localStorage key) | **YES — defect surfaces** |
| **Old artifact, signed before Wave 2 IDB seam landed** | `idbPutEvidenceBlob` did not exist at sign-time, so IDB has no record | **YES — defect surfaces (and is unrecoverable)** |
| **New artifact, same tab, immediate view** | memCache still warm | NO — works |
| **New artifact, hard refresh in same browser** | localStorage still has the bytes (via the ungated `FormSigningWorkspace.tsx:1577` write) | NO — works |
| **New artifact, cross-session, localStorage intact** | localStorage hit | NO — works |
| **New artifact, cross-session, localStorage evicted** | IDB hit needed; sync ladder misses it | **YES — defect surfaces** |

The user's screenshot (item 13/14) shows the metadata pane fully populated, ten audit events listed (TASK_CERTIFIED, FORM_SIGNED, FORM_LOCKED, ARTIFACT_LOCKED, ARTIFACT_REGISTERED, SIGNED_PACKAGE_CREATED, SUPPORTING_EVIDENCE_UPLOADED, SIGNATURE_FINALIZED, etc.), and the centre pane showing **"No renderable preview for this state"** with the amber DEMO-LOCAL banner above it. This is exactly the symptom signature reproduced in Playwright stage `s8a` below.

### 1.3 Reproduction summary (Playwright)

Full flow + storage snapshot at each stage, signed artifact `EV-mp8nj19c-gvc8` linked to `qapi_meeting-20260205-04-QA-FM-021-001`:

| Stage | Description | Amber banner | iframe count | localStorage `ces_ev_*` | IDB record |
|------|-------------|--------------|--------------|--------------------------|-----------|
| s0 | Clean slate (all storage wiped) | n/a | n/a | 0 | DB exists, 0 records |
| s1 | Form loaded + 8 fields filled | n/a | n/a | 0 | DB exists, 0 records |
| s2 | eCign flow walked → `Lock Document` clicked → 8 s wait | n/a | n/a | 1 entry, 4,413,825 bytes (HTML data URL) | **1 record, 4,413,825 bytes** |
| s3 | Viewer opened immediately after lock (no refresh) | **false** | 1 (`blob:...`) | 1 | 1 |
| s4 | Hard refresh on viewer | **false** | 1 (`blob:...`) | 1 | 1 |
| s5a | Evidence Center opened | n/a | 0 | 1 | 1 |
| s5b | Click first artifact link | n/a | iframe rendered | 1 | 1 |
| s7 | Re-open viewer + 6 s wait | **false** | 1 (`blob:...`) | 1 | 1 |
| **s8a** | **Wipe localStorage only (IDB intact) → re-open viewer → 5 s wait** | **TRUE (initial AND after 5 s)** | **0** | 0 | **1 (bytes still present)** |
| s8b | Wipe localStorage + IDB → re-open viewer → 4 s wait | TRUE | 0 | 0 | 0 |

**The s8a row is the diagnostic smoking gun.** IDB still contains the 4.4 MB signed packet, but the viewer renders the amber banner and zero iframes — both initially AND after 5 s of waiting for async hydration. The async prefetch loads the bytes into `memCache` but the React tree has no signal to re-render, so the useMemo returns `undefined` permanently and the amber/no-renderable state persists.

The exhaustive per-stage JSON snapshots (with flag state, localStorage keys + sizes + content prefixes, IDB record metadata) are saved to:

```
Builder/_system/reports/artifact-retrieval-defect.json
```

Diagnostic check `idbInfrastructureDiagnostic` confirmed `canOpen:true, canPut:true, canGet:true, recordCount:1` on a sentinel test DB — IndexedDB is fully functional in the test browser; the defect is in application code, not environment.

---

## 2. Playwright screenshots (full list)

Saved to `Builder/_system/screenshots/artifact-retrieval-defect/`:

| File | Stage |
|------|-------|
| `s0-clean.png` | Storage wiped |
| `s1-form-loaded.png` | Form QA-FM-021 loaded |
| `s2-ecign-opened.png` | eCign workspace open |
| `s2a-consent-done.png` | Consent step |
| `s2b-identity-done.png` | Identity step |
| `s2c-review-done.png` | Review step |
| `s2d-signature-applied.png` | Signature captured |
| `s2e-locked.png` | Lock Document clicked |
| `s3-viewer-before-refresh.png` | Viewer right after sign — payload renders |
| `s4-viewer-after-hard-refresh.png` | Viewer after hard refresh — payload renders (via localStorage) |
| `s5a-evidence-center.png` | Evidence Center |
| `s7-viewer-after-extended-wait.png` | Viewer + 6 s — payload still renders |
| `s8a-viewer-ls-evicted-idb-intact-initial.png` | **DEFECT: amber banner with IDB bytes available** |
| `s8a-viewer-ls-evicted-idb-intact-after-wait.png` | **DEFECT: amber banner persists after 5 s of async wait** |
| `s8b-viewer-all-storage-gone.png` | Control: amber banner when bytes truly absent (correct UI for this state) |

Spec file: `Builder/_system/uat/artifact-retrieval-defect.spec.mjs`
Run: `npx playwright test artifact-retrieval-defect --config=playwright.config.ts`
Console + page errors during full run: **zero**. The IDB write failed *silently* per design (the try/catch in `idbPutEvidenceBlob` swallows errors), confirming a key diagnosis: the system never surfaces persistence-failure or hydration-failure signals to operator or telemetry.

---

## 3. Exact failing subsystem

**Subsystem:** Immutable artifact viewer payload hydration in `ArtifactViewerPage`, specifically the read-path that resolves a `signed_package` / `signed_form_instance` evidence row into the `<iframe src>`.

**Sub-subsystem:** the boundary between

- `src/policy/evidence/demoEvidenceRuntimeCache.ts` (sync `peekDemoEvidenceDataUrl` excludes IDB) and
- `src/policy/pages/ArtifactViewerPage.tsx` (`useEffect` warms cache but does not signal React; `useMemo` deps do not include cache version)

The defect is **on the read side only**. Neither the eCign packet generator (`FormSigningWorkspace.tsx` → `buildPrintablePacketHtml`) nor the byte-stable snapshot capture nor the IDB write store contains the bug.

---

## 4. Exact failing code path

### 4.1 Effect that warms IDB but does not signal React

```210:216:src/policy/pages/ArtifactViewerPage.tsx
  useEffect(() => {
    if (!getPmFlag('signed_snapshot_capture')) return;
    if (!evidenceIdsKey) return;
    const ids = evidenceIdsKey.split('|').filter(Boolean);
    if (ids.length === 0) return;
    void prefetchDemoEvidenceFromIdb(ids).catch(() => { /* IDB best-effort; sync layer still works */ });
  }, [evidenceIdsKey]);
```

- `void prefetchDemoEvidenceFromIdb(ids).catch(...)` discards the promise.
- No `setState` is called when the prefetch resolves.
- The comment "sync layer still works" is **false** for >4 MB packets after localStorage eviction — the sync layer in fact does not work, because peek does not check IDB.

### 4.2 Synchronous useMemo with stale deps

```540:557:src/policy/pages/ArtifactViewerPage.tsx
  const { immutableFormArtifactUrl, fullPacketUrl } = useMemo(() => {
    if (resolved.kind !== 'form_instance') return { immutableFormArtifactUrl: undefined, fullPacketUrl: undefined };
    const linkAliases = new Set(formInstanceLinkAliases(resolved.formInstance));
    const linked = evidence.filter(doc => doc.linkedFormInstanceId && linkAliases.has(doc.linkedFormInstanceId));
    const ts = (d: EvidenceDoc) => new Date(d.finalizedAt || d.uploadedAt || d.createdAt).getTime();
    const latest = (docs: EvidenceDoc[]) => [...docs].sort((a, b) => ts(b) - ts(a))[0];
    const formOnly = linked.filter(d => d.artifactType === 'signed_form_instance' || d.kind === 'signed_form_instance');
    const packets = linked.filter(d => d.artifactType === 'signed_package' || d.kind === 'signed_package');
    const packetsLocked = packets.filter(d => d.status === 'EVIDENCE_LOCKED');
    const bestPacket = latest(packetsLocked.length ? packetsLocked : packets);
    const bestFormOnly = latest(formOnly);
    const packetUrl = bestPacket ? resolveEvidenceDataUrl(bestPacket) : undefined;
    const formOnlyUrl = bestFormOnly ? resolveEvidenceDataUrl(bestFormOnly) : undefined;
    return {
      immutableFormArtifactUrl: packetUrl || formOnlyUrl,
      fullPacketUrl: packetUrl,
    };
  }, [resolved, evidence]);
```

- Dep array `[resolved, evidence]` does not change when memCache is hydrated async.
- `resolveEvidenceDataUrl(bestPacket)` returns `undefined` because the sync ladder misses IDB.

### 4.3 The sync ladder that excludes IDB

```67:79:src/policy/evidence/demoEvidenceRuntimeCache.ts
export function peekDemoEvidenceDataUrl(evidenceId: string): string | undefined {
  const mem = memCache.get(evidenceId);
  if (mem) return mem;
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + evidenceId);
    if (stored) {
      memCache.set(evidenceId, stored);
      return stored;
    }
  } catch {
    // localStorage unavailable
  }
  return undefined;
}
```

### 4.4 The amber banner that fires

```685:701:src/policy/pages/ArtifactViewerPage.tsx
                {formInstanceIsTerminal && !immutableFormArtifactUrl && (
                  <div className="mb-2 rounded border border-amber-300/40 bg-amber-500/10 p-2 text-[11px] text-amber-100 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="rounded bg-amber-500/30 px-1 py-0.5 text-[9px] uppercase tracking-widest">DEMO-LOCAL</span>
                      Signed artifact not available in this session
                    </div>
                    ...
```

### 4.5 The empty preview slot

```703:722:src/policy/pages/ArtifactViewerPage.tsx
                {iframeDisplaySrc ? (
                  ...iframe...
                ) : (
                  <div className="flex h-[200px] items-center justify-center rounded border border-white/10 bg-black/40 text-xs text-white/60">
                    No renderable preview for this state.
                  </div>
                )}
```

---

## 5. Proposed minimal fix

**Scope:** READ-only path inside `src/policy/pages/ArtifactViewerPage.tsx` (the file IS classified frozen per Lead 16 §14; this is an orchestrator-only edit, but it is the exact site of the bug and cannot be patched elsewhere).

**No protected files touched. No packet generation changed. No byte-stability assumptions altered. No `form_instance_id` semantics touched.**

### Option A (preferred, minimal — ~3 lines)

Bump a hydration version after `prefetchDemoEvidenceFromIdb` resolves; include it in the immutable URL useMemo dep array:

```tsx
// after existing imports
const [memCacheVersion, setMemCacheVersion] = useState(0);

useEffect(() => {
  if (!getPmFlag('signed_snapshot_capture')) return;
  if (!evidenceIdsKey) return;
  const ids = evidenceIdsKey.split('|').filter(Boolean);
  if (ids.length === 0) return;
  let cancelled = false;
  prefetchDemoEvidenceFromIdb(ids)
    .then(() => { if (!cancelled) setMemCacheVersion(v => v + 1); })
    .catch(() => { /* IDB best-effort */ });
  return () => { cancelled = true; };
}, [evidenceIdsKey]);

// existing useMemo: add memCacheVersion to deps
const { immutableFormArtifactUrl, fullPacketUrl } = useMemo(() => {
  ...
}, [resolved, evidence, memCacheVersion]);
```

**Why this is minimal-risk:**

- **Idempotent:** the bump only fires after a successful prefetch; the useMemo re-runs once and the sync `resolveEvidenceDataUrl` now hits the warm `memCache` and returns the URL.
- **No new I/O calls:** the existing `prefetchDemoEvidenceFromIdb` already runs; we just observe its completion.
- **Backwards compatible:** when prefetch was already complete (or unnecessary), behaviour is unchanged.
- **Flag-aligned:** still gated on `signed_snapshot_capture`. If that flag is OFF, no behaviour change.
- **No store mutation, no eCign code, no packet HTML changes.** Cannot affect byte stability of stored snapshots.

### Option B (also valid — slightly larger surface)

Replace the synchronous `resolveEvidenceDataUrl(bestPacket)` calls inside the useMemo with state populated by `resolveEvidenceDataUrlAsync` (which already exists, lines 159-170 of `demoEvidenceRuntimeCache.ts`). This makes the read fully async-aware but requires moving the URL derivation out of a useMemo and into a useEffect+useState pair. ~10-15 lines. Recommended **only** if Option A is rejected for any reason; Option A has narrower blast radius.

### Option C (additional, separate small change — RECOMMENDED alongside A)

Also surface IDB write failures so this entire class of silent-failure defect cannot recur unnoticed.

```ts
// src/policy/evidence/storage/indexedDbEvidenceBlobStore.ts (NOT frozen)
} catch (err) {
  if (typeof console !== 'undefined') {
    console.warn('[idbPutEvidenceBlob] silent failure', evidenceId, err);
  }
}
```

(Currently both put/get/delete silently swallow all errors. Adding a single `console.warn` makes future write/read failures visible in DevTools without changing behaviour.)

**Estimated patch size:** Option A alone = ~6 lines added in 1 file. Option A + C = ~9 lines added in 2 files.

---

## 6. Protected-risk analysis

### 6.1 Files this fix touches

| File | Classification (per Lead 16 + WAVE reports) | Why touched |
|------|--------------------------------------------|-------------|
| `src/policy/pages/ArtifactViewerPage.tsx` | **FROZEN** (Lead 16 §14) | The amber-banner trigger + the broken useMemo live here; cannot be patched in any other file |
| `src/policy/evidence/storage/indexedDbEvidenceBlobStore.ts` | Not classified frozen (Wave 2 NEW additive seam) | Optional Option C only — `console.warn` in existing catch |

### 6.2 Files this fix DOES NOT touch (explicitly preserved)

- `src/policy/components/FormSigningWorkspace.tsx` (PROTECTED)
- `src/policy/components/FormViewer.tsx` (PROTECTED)
- `src/policy/ecign/captureSignedFormSnapshot.ts` (eCign packet contract)
- `buildPrintablePacketHtml` (eCign packet generator)
- `src/policy/stores/regulatoryExecutionStore.ts` (FROZEN, Lead 16 §14)
- `src/policy/evidence/storage/localDemoAdapter.ts` (owner-led)
- `src/policy/evidence/demoEvidenceRuntimeCache.ts` (no API surface change)
- `src/policy/artifacts/artifactToFormInstance.ts` (no change to resolver semantics)
- `src/App.tsx` (FROZEN)
- `src/policy/pm/featureFlags.ts` (FROZEN, only touched in Wave 5A; not touched here)

### 6.3 Byte-stability invariant

**Preserved.** The fix is read-only — it neither mutates nor re-serializes any signed bytes. The stored `data:text/html;charset=utf-8,...` URL is read verbatim from IDB and handed to the existing `useHtmlToPdfBlobUrl` / `dataUrlToBlobUrlForHtml` consumers exactly as today. SHA hashes computed at sign-time remain valid.

### 6.4 `form_instance_id` semantics

**Preserved.** The fix does not alter how artifact ids resolve to form_instance ids; `resolveFormInstanceFromArtifact` (Wave 4) and its fallback chain are not touched.

### 6.5 eCign architecture

**Preserved.** No eCign code is modified. The fix lives strictly in the artifact viewer's React reactive layer.

### 6.6 Persistence write contract

**Preserved.** No change to `stashDemoEvidenceDataUrl`, no change to `uploadEvidence`, no change to the redundant ungated `localStorage.setItem` in `FormSigningWorkspace.tsx:1577-1579`.

### 6.7 Audit-trail integrity

**Preserved.** The fix only changes what the viewer renders; it does not emit, suppress, or reorder any audit event.

### 6.8 New observable risks introduced

- **Re-render frequency:** the fix adds **at most one additional re-render** per artifact-viewer mount (the `setMemCacheVersion(v => v + 1)` after prefetch resolves). Bounded; not in a loop.
- **Race:** the `cancelled` flag pattern prevents stale `setState` calls on unmounted components.

---

## 7. Rollback strategy

### 7.1 Code-level rollback

The fix is a 6-line additive change. To roll back:

```bash
git revert <fix-commit-sha>
```

No data migration is required. No stored snapshot is changed. No localStorage key, IDB key, audit row, or feature flag default is altered by the fix itself.

### 7.2 Flag-level rollback (zero-deploy)

The existing `signed_snapshot_capture` PM flag already gates the prefetch effect. To suppress the new behaviour without redeploy:

```ts
// runtime, via DevTools console:
window.__pm.setFlag('signed_snapshot_capture', false);
```

This disables both the prefetch AND the new bump, returning the viewer to its current behaviour (which works for any artifact whose bytes are in localStorage and still misses IDB-only artifacts — i.e. the rollback restores the defect; only use rollback if the fix causes a new regression).

### 7.3 Recommended additional flag (optional)

If the team prefers a dedicated rollback switch independent of `signed_snapshot_capture`, add a flag `viewer_idb_rehydrate_signal` to `featureFlags.ts` (FROZEN — same orchestrator serialization rules as Wave 5A). Default ON; setting OFF disables the `setMemCacheVersion` bump without disabling prefetch. ~3 lines.

---

## 8. Historical artifacts — impact assessment

**Two cohorts:**

### Cohort A — signed BEFORE Wave 2 EVIDENCE-001 IDB store landed

- These artifacts have **no IDB record** (the write seam didn't exist).
- If their localStorage entry has been evicted, the bytes are **gone**. The fix recovers **nothing** for these artifacts; the amber banner is the correct UI for "bytes irrecoverable".
- The fix at least keeps these from being repeatedly mistaken for "transient hydration failure".
- **No silent data corruption.** No false rendering, no wrong bytes shown. Just an honest "unavailable" state.

### Cohort B — signed AFTER Wave 2 IDB store landed (i.e. within the last few days)

- These artifacts have an IDB record (confirmed by Playwright: a fresh sign in current code writes 4,413,825 bytes into IDB within milliseconds).
- If localStorage was evicted but IDB still has the bytes, the fix **fully recovers** them.
- The first viewer mount after the fix may show the amber banner for ~one render tick before the prefetch resolves and the bump triggers a re-render with the populated iframe. Acceptable UX; can be hidden behind a loading shimmer in a follow-up.

**Net:** the fix is a strict improvement for Cohort B and is neutral (no regression) for Cohort A.

---

## 9. NEW artifacts — impact assessment

Every artifact signed under current code goes through the **triple-channel write** (memCache + localStorage + IDB). All three channels are confirmed working by Playwright. After the fix:

- Same-tab view: unchanged (memCache hit; sync ladder returns).
- Cross-tab, same session: unchanged (localStorage hit when ≤ MAX_ITEM_BYTES OR via the redundant FormSigningWorkspace write).
- Cross-session, localStorage intact: unchanged (localStorage hit).
- Cross-session, localStorage evicted: **fixed** (was broken; now hits IDB via prefetch + bump → re-render → iframe).
- Hard refresh, immediately post-sign: unchanged (localStorage hit).

The fix prevents any new artifact from exhibiting the defect for the duration of its IDB-retention life (browser-managed quota).

---

## 10. Determination

**HYBRID failure: retrieval + rendering.**

- Persistence (the entire write side): **WORKING.**
- Retrieval (sync ladder in `peekDemoEvidenceDataUrl`): **INCOMPLETE — does not check IDB.**
- Retrieval (async prefetch): **WIRED but not observable to React.**
- Rendering (useMemo / useEffect coupling in ArtifactViewerPage): **STALE — never re-runs after async hydration.**

The two retrieval/rendering bugs combine to make any IDB-only artifact appear permanently unavailable, even when the bytes are present and accessible.

---

## 11. Suggested order of follow-up actions (NOT executed)

(Listed for the next execution mode; no code modified by this investigation.)

1. **Apply Option A fix** to `ArtifactViewerPage.tsx` (orchestrator serialized — file is FROZEN). ~6 lines.
2. **Apply Option C** to `indexedDbEvidenceBlobStore.ts` for silent-failure visibility. ~3 lines.
3. **Add a Playwright regression** based on the s8a stage of this investigation's spec: assert that after `wipe-LS + reload`, the viewer eventually renders an iframe rather than the amber banner. Pin to `signed_snapshot_capture: true`. (Independent of frozen files; spec already exists in this investigation.)
4. **Optional UX polish (separate change):** while `prefetchDemoEvidenceFromIdb` is in flight, render a "Loading immutable snapshot…" shimmer instead of either the amber banner or the empty preview. This eliminates the one-tick visual flash of the amber banner before re-render.
5. **Documentation update** in `LOCALSTORAGE_QUOTA_AND_ECIGN_LOOP_FIX_REPORT.md`: amend the "What was not done" note (currently "IndexedDB or S3-backed binary storage is not wired") to reflect that IDB is now the durable triple-channel destination and that the viewer side hydrates from it.

---

## 12. Files produced by this investigation

| Path | Purpose |
|------|---------|
| `Builder/_system/uat/artifact-retrieval-defect.spec.mjs` | Playwright repro spec (full flow + storage probe at every stage) |
| `Builder/_system/reports/artifact-retrieval-defect.json` | Per-stage storage + viewer snapshot JSON |
| `Builder/_system/screenshots/artifact-retrieval-defect/*.png` | 15 screenshots covering s0 → s8b |
| `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/DEFECT_ARTIFACT_RETRIEVAL_INVESTIGATION_REPORT.md` | This document |

**No source code was modified during this investigation.** Wave 5B work remains paused. No protected files were edited. The two readonly exploration subagents produced traces of the SIGN→PERSIST and VIEW→RETRIEVE pipelines that fed this analysis (their findings are inlined above and confirmed by Playwright).

---

## 13. Compliance with execution-mode constraints

| Rule | Status |
|------|--------|
| STOP all Wave 5B work | ✅ — no Wave 5B file touched after directive |
| Use Playwright (mandatory) | ✅ — full repro spec + 15 screenshots + 9-stage JSON report |
| Capture screenshots at EVERY stage | ✅ — s0, s1, s2, s2a-e, s3, s4, s5a, s7, s8a (×2), s8b |
| Capture console logs / network failures | ✅ — `report.consoleErrors` + `report.pageErrors` (both empty, which is itself diagnostic) |
| Inspect localStorage, IndexedDB, blob keys, artifact IDs, form_instance_id linkage, retrieval resolver paths | ✅ — all enumerated in `report.stages[*].storage` |
| Do NOT rewrite packet generation | ✅ |
| Do NOT touch `buildPrintablePacketHtml` | ✅ |
| Do NOT touch protected print migration | ✅ |
| Do NOT refactor eCign architecture broadly | ✅ |
| Do NOT alter `form_instance_id` semantics | ✅ |
| Do NOT weaken byte-stability guarantees | ✅ |
| Authorized scope: evidence retrieval / artifact hydration / snapshot persistence/retrieval / viewer rendering path | ✅ — all findings within authorized scope |
| No scope expansion, no unrelated cleanup | ✅ |
