# Wave 8 — Evidence Integrity Report

**Date:** 2026-05-16
**Mode:** READ-ONLY audit. No code changes.
**Sources:** Code-level reads of `cesEvidenceHierarchy.ts` (FROZEN), `demoEvidenceRuntimeCache.ts`, `storage/indexedDbEvidenceBlobStore.ts`, `CesEvidenceHierarchyPanel.tsx`, `EvidenceCenterPage.tsx`, `AuditModePage.tsx`, `regulatoryExecutionStore.ts` (FROZEN), plus signer-flow audit findings.

---

## 1. Path correction

`indexedDbEvidenceBlobStore.ts` lives at `src/policy/evidence/storage/indexedDbEvidenceBlobStore.ts` (under `storage/`), not at `src/policy/evidence/` root.

---

## 2. Hierarchy walk — Year → Quarter → Month → Event → Task → Evidence

| Layer | Derivation function | Source-of-truth (file:line) |
|--------|---------------------|-----------------------------|
| **Year / Quarter / Month** | `dateFromEvent` from `event?.date` → fallback `tasks[0]?.due_date` → fallback `now`; then `getFullYear()`, `getMonth()`, `quarterForMonth(month)` | `cesEvidenceHierarchy.ts:587–590, 165–169, 636–640` |
| **Event node** | One node per `event_id` in `eventTaskMap` and additional nodes from `evidenceByEvent` when there are no CES tasks | `cesEvidenceHierarchy.ts:585–629, 631–670` |
| **Task / requirement** | Tasks grouped by `task.event_id`; requirement id `` `${task.task_id}::${suffix}` `` | `cesEvidenceHierarchy.ts:308–310` |
| **Evidence** | Per task: `eventEvidence.filter(doc => doc.taskId === task.task_id)` | `cesEvidenceHierarchy.ts:599–600` |
| **Orphan evidence** | `taskId` missing or not in `taskIds` | `cesEvidenceHierarchy.ts:592–596` |
| **Evidence-only events** | Events with no CES tasks but `evidence.length > 0` | `cesEvidenceHierarchy.ts:631–671` |
| **Panel render** | `CesEvidenceHierarchyPanel` recomputes `buildCesEvidenceHierarchy` in `useMemo` | `CesEvidenceHierarchyPanel.tsx:84–90` |

**Determinism:** Placement is deterministic from **stored dates and IDs**, not from time encoded inside evidence IDs (evidence IDs are minted as random `EV-…` per `regulatoryExecutionStore.ts:927`).

---

## 3. Findings table

| # | Issue | Severity | File:line | Description | Recommended action (audit-only) |
|---|-------|----------|-----------|-------------|----------------------------------|
| 1 | **P0-01 multi-signer `signed_package` identity** | **P1** (mitigated, edge cases remain) | `FormSigningWorkspace.tsx:1458–1466, 1522–1569`; `regulatoryExecutionStore.ts:877–890, 1068–1087` | Finalize checks for an existing usable `signed_package`; subsequent path calls `removeEvidence` on prior rows, but `removeEvidence` **does not change `EVIDENCE_LOCKED` rows** (immutable guard). Convergence now relies on `uploadEvidence` dedup (same `linkedFormInstanceId` + `artifactType` + session key) returning the existing id and re-stashing bytes (`regulatoryExecutionStore:877–890, 888–889, 979`). | Validate multi-signer UAT with attention to `ecignSessionId` / `signatureSessionId` stability; treat the remove loop as non-guaranteed for locked rows. |
| 2 | **Evidence Center: cold IDB-only blobs** | **P1** | `EvidenceCenterPage.tsx:267–289`; `demoEvidenceRuntimeCache.ts:56–61, 145–148` | File rows use **sync** `resolveEvidenceDataUrl` (memory → localStorage). Payloads `> ~4 MB` skip localStorage; after reload, bytes may live **only in IDB** until warmed. Wave 5A fixed this on `ArtifactViewerPage`; **Evidence Center has the same shape but no `prefetchDemoEvidenceFromIdb` warm-up**. | Mirror Wave 5A pattern: add `prefetchDemoEvidenceFromIdb(ids)` + `memCacheVersion` re-render trigger to Evidence Center. ~15 LOC. Non-protected file. **Recommended quick-win for next wave.** |
| 3 | **Audit Mode hidden bytes** | **P1** | `regulatoryExecutionStore.ts:492–498`; `AuditModePage.tsx:1310, 1414–1431` | zustand persistence **strips `localDataUrl`** from store rows. Audit lists `useEventEvidence` but "Open File" only when `d.localDataUrl` is present — **no bytes in row ≠ no artifact** if IDB still holds them. | Treat "View Artifact" (canonical viewer) as the compliance preview path; or add async resolve + explicit loading state. |
| 4 | **IDB write race** | **P2** | `demoEvidenceRuntimeCache.ts:19, 63–64` | `idbPutEvidenceBlob` is **fire-and-forget**; navigation/tab close can complete before the write. | Artifact-route prefetch mitigates the read side; extend to other routes if instant access is required. |
| 5 | **Global LS clear vs IDB asymmetry** | **P2** | `demoEvidenceRuntimeCache.ts:98–110` vs `:82–91` | `clearAllDemoEvidenceDataUrls` clears mem + LS, **not IDB**; per-id `clearDemoEvidenceDataUrl` clears all three channels. | Ensure mass resets use per-doc paths like `resetAllSandboxQ1Q2` (`regulatoryExecutionStore.ts:3035–3039`). |
| 6 | **Audit "Required Forms" Files count divergence** | **P2** | `AuditModePage.tsx:1333–1352` | Files count uses `f.documents` on the **workflow instance**, not `useEventEvidence` — can diverge from CES evidence list. | Align models if a single CES evidence source of truth is required across audit + evidence center. |

---

## 4. Yes/no answers to mission questions

| Question | Answer | Detail |
|----------|--------|--------|
| **Orphan evidence possible?** | **Yes** | Explicit orphan buckets for bad/missing `taskId` (`cesEvidenceHierarchy:592–596`); evidence-only events with no CES tasks (`:631–671`). Orphans are surfaced in the UI (not silently lost). |
| **Duplicate uploads possible?** | **Partially** | Dedup keys: `linkedFormInstanceId` + `artifactType` + session key (`regulatoryExecutionStore:877–890`); triplet supersession for same-name locked uploads (`:933–1008`). **P0-01 is largely mitigated** by dedup + finalize checks, **not** by `removeEvidence` on locked rows. Residual risk if session keys or artifact types differ between attempts. Content-level dedup (hash-based) is **NOT** implemented client-side. |
| **Broken refs possible?** | **Yes** | `taskId` on an evidence row is a soft reference; invalid ids become orphan evidence (visible), not a hard error. |
| **Missing signed artifacts possible?** | **Yes** | Failure modes: quota exceeded, IDB errors swallowed (`idbPutEvidenceBlob:119–121`), LS errors swallowed (`:59–61`). **Protections:** triple-channel stash (`:51–65`), `stashDemoEvidenceDataUrl` on upload (`:979`), Artifact viewer IDB prefetch (`:191–229`). **No** separate post-lock blob probe in the reviewed code. |
| **Hidden attachment states possible?** | **Yes** | Stripped store payloads (`:492–498`), sync resolve missing IDB-only bytes (Finding #2), UI keying off `localDataUrl` only (e.g. `AuditModePage:1414–1431` — Finding #3). |

---

## 5. P0-01 status (from signer-flow audit cross-reference)

P0-01 ("multi-signer artifact identity") was the highest-risk item in `eCIgn_Legal_Defensibility_Gap_Analysis.md`. Current state (Wave 8 read):

| Aspect | Status | Evidence |
|--------|--------|----------|
| Deterministic `canonicalFormInstanceId` shape | ✅ Canonical | `cesFormInstanceId.ts:8–10` (`{eventId}-{formId}-{seq}`) |
| `uploadEvidence` dedup | ✅ Active | `regulatoryExecutionStore:877–890` keys on `linkedFormInstanceId` + `artifactType` + session key |
| `removeEvidence` on prior `signed_package` rows | ⚠️ Soft | `:1068–1087` skips `EVIDENCE_LOCKED` rows by design |
| Bytes re-stash on dedup hit | ✅ Active | `:888–889, 979` |
| End-to-end multi-signer UAT validating chain-of-custody | **❌ Unverified** | No automated multi-signer Playwright spec exists in `Builder/_system/uat/` |

**Verdict:** P0-01 is **largely addressed in product code** via deduplicating `uploadEvidence` + finalize guards. The `removeEvidence + uploadEvidence` pattern still exists in `FormSigningWorkspace.tsx:1524–1538` but no longer drives convergence. Remaining risk is **operational** — needs multi-signer Playwright validation to lock in the behavior.

---

## 6. Persona impact

| Persona | Impact |
|---------|--------|
| DON / Compliance Officer | Evidence Center may show "no bytes available" for large packets after reload until they navigate to Artifact Viewer (Finding #2). Confusing in audit/survey-prep context. |
| Clinician | Mobile evidence upload flow unchanged; risk is the same downstream. |
| Accounting | Audit Mode Files count may differ from Evidence Center Files count (Finding #6) — risk of "where's the source of truth?" support tickets. |
| Auditor / Survey prep | Should use Artifact Viewer for compliance preview (Finding #3 recommendation). |

---

## 7. Unresolved blockers (audit could not answer from code alone)

- Whether `ecignSessionId` / `signatureSessionId` are **identical** for every signer on one form instance (required for dedup at `regulatoryExecutionStore:878–883`). Requires multi-signer UAT.
- **BACKEND_LIVE** evidence API vs **DEMO_LOCAL** store-backed hierarchy — different pipelines; end-to-end row identity across modes not specified in the files reviewed.
- Whether to introduce **content-level** (hash-based) duplicate detection client-side (not currently implemented).
- Whether `EvidenceCenterPage` should adopt the Wave 5A IDB-prefetch pattern (recommended quick win in §3 Finding #2; ~15 LOC, non-protected, ~Wave 9 candidate).

---

## 8. Files touched in this audit

**None** in `src/`. Read-only.

## 9. Protected files confirmed not modified

`regulatoryExecutionStore.ts`, `cesEvidenceHierarchy.ts`, `cesFormInstanceId.ts`, `taskIdentity.ts` (under `compliance-execution/`), `ArtifactViewerPage.tsx`, `FormSigningWorkspace.tsx`, `FormViewer.tsx`, `server/ecign/*`, `src/policy/ecign/*` — all read-only inspections.

## 10. Validation results

| Gate | Result |
|------|--------|
| `wave-6-regression` Playwright | ✅ 9/9 |
| `artifact-retrieval-defect` Playwright | ✅ 1/1 — s8a (IDB intact): `amber:false, iframe:1`; s8b (LS+IDB wiped): `amber:true, iframe:0` (correct expected behavior; Wave 5A `memCacheVersion` fix holds) |

## 11. Bottom line

`cesEvidenceHierarchy.ts` is a **pure, deterministic rollup** from events, CES tasks, and `evidenceByEvent`, with **first-class orphan handling**. P0-01 is **addressed in product code** via deduplicating `uploadEvidence` + finalize guards; the older `removeEvidence + uploadEvidence` pattern persists but no longer drives convergence (and does **not** delete locked prior rows). **Hidden attachment state** remains wherever the UI relies on **sync** resolution or inline `localDataUrl` without IDB warm-up — primarily Evidence Center file rows and Audit Mode file links. Both are non-protected and admit a Wave 5A–pattern fix in a future bounded change.
