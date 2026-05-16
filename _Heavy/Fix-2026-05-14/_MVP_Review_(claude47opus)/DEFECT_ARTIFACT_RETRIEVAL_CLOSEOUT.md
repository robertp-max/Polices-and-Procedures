# DEFECT — Artifact Retrieval Closeout (MVP)

**Date:** 2026-05-16
**Decision authority:** Owner directive ("PASS on Wave 5B for now")
**Status:** Closed on minimal fix. No further work in this thread.

---

## 1. What was actually closed

Only the **artifact retrieval rendering defect** — the bug surfaced in Browser Test 7 where the immutable artifact viewer showed "Signed artifact not available in this session" / "No renderable preview for this state" for IDB-backed signed packets after a localStorage eviction.

The fix is documented in:

- `DEFECT_ARTIFACT_RETRIEVAL_INVESTIGATION_REPORT.md` — root cause, exact code paths, Playwright evidence
- `DEFECT_ARTIFACT_RETRIEVAL_FIX_APPLIED.md` — exact patch, validation gates, regression confirmation

One source file changed: `src/policy/pages/ArtifactViewerPage.tsx` (~14 lines added). Triple-channel persistence + read-side reactive hydration are now both working.

---

## 2. MVP signed-artifact model — ACCEPTED AS-IS for MVP

For MVP / demo / UAT the current artifact behaviour is the **explicitly accepted** model:

| Aspect | MVP behaviour |
|---|---|
| Artifact format at sign time | Frozen **signed HTML packet** (eCign `buildPrintablePacketHtml` output, wrapped as `data:text/html;charset=utf-8,...`) |
| Where it is stored | Triple-channel: in-memory `memCache`, `localStorage` (`ces_ev_data_<evidenceId>`), IndexedDB (`ci_evidence_blobs` / `evidence_blobs`, keyed by `evidenceId`) |
| What is served on view | The stored snapshot is read verbatim from the cache ladder (memory → localStorage → IDB) and handed to the iframe; **no template re-render in normal flow** |
| What is served on print/download | The same stored snapshot. Download invokes the browser's print pipeline against the stored HTML packet — the resulting PDF is the browser print of the immutable HTML the user signed |
| Refresh / re-open / cross-session retrieval | Recovers from localStorage when present; recovers from IDB when only IDB has it (now reactively wired in by today's fix); shows an honest "unavailable" amber banner only when bytes are truly absent in all three channels |
| Byte stability | Preserved bit-for-bit at the HTML packet layer. SHA hashes computed at sign-time remain valid for any retrieved copy |
| Audit trail | Emitted at sign time (`SIGNED_PACKAGE_CREATED`, `ARTIFACT_REGISTERED`, `ARTIFACT_LOCKED`, etc.) and stored in the Zustand persisted slice independently of the packet bytes |

This is **demo-local persistence** — the bytes live in the user's browser. There is no backend artifact store for the signed packet today. That is acceptable for MVP / UAT but is **explicitly not** the final production behaviour.

---

## 3. Deferred to production — NOT IN MVP SCOPE

The owner directive explicitly defers, for a later production phase:

1. **Durable backend-stored signed PDF/package** — the canonical immutable PDF rendered server-side at sign time, with the certificate + audit trail attached
2. **Certificate + audit trail attachment** — bound into the PDF itself, not just stored as adjacent metadata in the regulatory execution store
3. **S3 / DynamoDB artifact persistence** — server-side immutable object store with content-addressed retention policy
4. **DocuSign-style immutable PDF source of truth** — the rendered PDF (not HTML) is the legal artifact; viewers, downloads, and prints all stream from that same object
5. **Backend retrieval API** — `GET /api/artifacts/<id>` returning the canonical PDF stream + integrity headers; client never re-renders

None of those are attempted in this thread.

---

## 4. Wave 5B — PASSED

Wave 5B (broader print migration, additional protected-file work) is **not executed** in this thread. The decision is to ship MVP with:

- Wave 5A's print primitives (`PrintFrame`, `printStyles`, `usePrintTheme`) in place but only the non-protected `FormPrintView` migrated
- `buildPrintablePacketHtml` UNTOUCHED for eCign packet generation
- `FormSigningWorkspace`, `FormViewer`, eCign signer flow, `form_instance_id` semantics, evidence identity model — all untouched
- Today's minimal `ArtifactViewerPage` retrieval fix in place

---

## 5. What this means for browser test 7

- **The hydration bug (amber banner with IDB bytes available)**: ✅ FIXED
- **The "View completed form (read-only)" route**: routes to `ArtifactViewerPage` and benefits from the same fix
- **Historical artifacts signed before Wave 2 (no IDB record) with evicted localStorage**: bytes are truly absent — the amber banner is the correct UI for this state and is NOT a defect. This is part of the accepted MVP demo-local persistence model
- **All other view/print/download paths from Evidence Center, Artifact Viewer, Audit Mode, CES task, immutable execution record**: serve the stored snapshot, not a re-render

---

## 6. Open items NOT investigated (per directive)

These are out of scope for this thread and intentionally **not analysed, not patched, not validated**:

- Whether every single retrieval path in the app calls `resolveEvidenceDataUrl` vs. some other branch
- Whether any UI surface still falls back to a live template re-render under any edge case
- Whether the PDF download pipeline produces a byte-identical PDF across browsers / browser versions
- Whether the server-side `recordEsignEvidence` API persists anything useful beyond the metadata it already records
- Whether `signed_form_instance` rows (form-only, no certificate) need parity with `signed_package` rows
- All Wave 5B items

These all belong in the future production-grade canonical-PDF workstream and should be replanned there.

---

## 7. Final session state

- ✅ `src/policy/pages/ArtifactViewerPage.tsx` patched and validated
- ✅ Playwright regression spec lives at `Builder/_system/uat/artifact-retrieval-defect.spec.mjs` and passes
- ✅ Per-stage storage snapshot saved to `Builder/_system/reports/artifact-retrieval-defect.json`
- ✅ Screenshots saved to `Builder/_system/screenshots/artifact-retrieval-defect/`
- ✅ Investigation, fix, and closeout documents committed to `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/`
- ⏸ Wave 5B: **paused / passed**, not attempted
- ⏸ Canonical signed-PDF source-of-truth investigation: **deferred to production phase**, not started in this thread

No source code beyond `ArtifactViewerPage.tsx` was modified in this defect-investigation thread. The Vite dev server started for the Playwright run is still running in the background on `http://localhost:5174` — safe to leave running or stop at the operator's discretion.

Standing down.
