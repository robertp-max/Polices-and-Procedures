# eCIgn Path B — Phase 2-live Sandbox Plan (planning only)

Documentation/planning ONLY. **No live code, no Google uploads, no Evidence Center writes, no
`server/ecign/**` edits, no dependencies, no package/lock changes.** Date: 2026-06-22.
Worktree: `Policies_and_Procedures_V2_worktrees/ecign-phase2-live-sandbox` · branch `phase21/ecign-path-b-live-sandbox-plan`.

## 1. Executive decision
- Phase 2-live is **not implementation yet** — this is a plan.
- **Live writes require explicit user approval** (per gate, §13).
- The sandbox must be **non-PHI and fully reversible**; every artifact labeled TRAINING/SANDBOX.
- The reference stack (Phase 1–2) stays the source of truth for contracts/invariants; live adapters must conform to it, not replace it.

## 2. Current baseline
- Branch `v2/designless-baseline` @ `94a6dbb`; reference stack landed (tag `backup/phase20-ecign-path-b-reference-stack-20260622-195402`).
- **69 green tests / 0 fail / 0 todo**; `verify:designless`/`build`/`tsc`/`eslint pathB` all clean.
- Reference modules on baseline: contracts+validators, write-once store (in-mem) + byte-freeze, retention/lifecycle, eager parity + lock (fake replicas), signature application (reference), reconstruction (journal), survey export.

## 3. Live workstreams (each behind a fake↔live switch)
1. **Live Google Drive adapter** — implement `ReplicaPublisher` against Drive (sandbox folder only).
2. **Evidence Center write/link integration** — implement the Evidence replica `ReplicaPublisher` + record linkage.
3. **Production canonical immutable store** — durable WORM/object-lock impl behind `CanonicalArtifactStore`.
4. **Real PDF/crypto signature application** — replace the reference applicator (`signatureApplication.ts`).
5. **`server/ecign` signing/lock/bundle reconciliation** — map legacy paths to the signed-PDF artifact rule (read-only inspection in planning; edits gated).

## 4. Sandbox boundaries (hard)
- No PHI; no real patient/staff names; no real signature images.
- No production Drive folder; **dedicated sandbox Drive folder only**.
- No irreversible deletes; no public links (no `anyoneWithLink`); least-privilege only.
- All artifacts/records labeled **TRAINING / SANDBOX** (name prefix + metadata flag).
- Synthetic non-PHI PDFs only (reuse the fixtures' `%PDF-` synthetic bytes).

## 5. Required environment / secrets
- Anticipated env vars (names only — **never print/copy key material**): a Google service-account/OAuth credential path (e.g. the project's existing `GOOGLE_APPLICATION_CREDENTIALS` / configured Drive auth), a **sandbox Drive folder id** (e.g. `ECIGN_SANDBOX_DRIVE_FOLDER_ID`), and an explicit `ECIGN_LIVE_SANDBOX=1` enable flag.
- **Use the existing credential path only if already configured**; do not create or commit credentials.
- **No `.env` changes** unless explicitly approved; secrets never enter git, logs, or docs.

## 6. Google Drive sandbox design
- **Target:** a single dedicated sandbox root folder (id from env); per-artifact subfolders named `TRAINING-<artifactId>/` with versions `…-AVS-<n>.pdf`.
- **Idempotency:** key uploads by `artifactVersionId`; if a file for that version already exists, reuse it (no duplicate) — mirrors the reference `publish` idempotency.
- **Upload verification:** after upload, **read bytes back and recompute sha256** server-side; parity `verified` only when replica sha == canonical sha (the existing `publishAndVerify` contract).
- **Hash parity rules:** a Drive `fileId`/link **alone is never parity** (`parity_link_without_sha`); mismatch → `mismatch` + recovery-required.
- **Failure/retry:** publish failure → `failed` parity, idempotent retry preserves the same `artifactVersionId`/ref; permission failure surfaced as `permission_denied`.
- **Cleanup:** a sandbox-only teardown that lists `TRAINING-*` and removes test artifacts from the **sandbox** folder only (never touches non-sandbox content); guarded by the sandbox flag.

## 7. Evidence Center sandbox design
- Records **reference canonical artifact versions** by `artifactVersionId` + canonical sha + locator — never embed canonical bytes.
- **Allowed metadata:** artifact/version ids, canonical sha, Drive `fileId`, signer role/tier (no names), timestamps, TRAINING flag. **No PHI, no signature images, no free text.**
- **Parity representation:** an Evidence `ReplicaParityRecord` (independent sha recompute), same gate as Drive.
- **Survey packet export** stays **blocked unless `locked`/complete** (existing `buildSurveyPacketExport` returns `complete:false` otherwise) — incomplete = not valid evidence.

## 8. Canonical store decision matrix
| Option | Durability | Immutability | Sandbox effort | Verdict |
|---|---|---|---|---|
| In-memory reference (current) | none | process-only | n/a | keep for tests |
| **Local filesystem sandbox** | per-host | app-level WORM (write-once + read-only perms) | LOW | **recommended first live-sandbox** |
| S3 + Object Lock | high | infra-enforced WORM | MED (AWS) | future production candidate |
| DB / WORM table | high | constraint-enforced | MED | alternative production |
- **Recommended first live-sandbox option:** local filesystem write-once store implementing `CanonicalArtifactStore` (content-addressed, refuse overwrite, read-only after write) — durable enough to prove restart/reconstruction without cloud infra. Production WORM (S3 Object Lock) is a later, separately-approved step.

## 9. PDF / signature strategy
- **Reference applicator limitation:** appends a synthetic marker; not a real signature/cert and not a rendered signature appearance.
- **Acceptable sandbox representation:** a deterministic, clearly-synthetic signature block (typed name token + TRAINING watermark) appended to the real PDF — still **no re-render of the source** (bytes preserved as prefix).
- **Real options:** `pdf-lib` (append a signature appearance) and/or `node:crypto`/PKCS#7 for a cryptographic signature; or reuse the existing `server/ecign/pdf.ts` path.
- **Dependency implications:** real PDF appearance signing needs `pdf-lib` (a **new dependency**) or the server path. **No dependency is added without explicit approval** — sandbox can demonstrate the invariant with `node:crypto` (already available) producing a detached signature + appended block, deferring `pdf-lib` to approval.

## 10. Server reconciliation plan (inspection only here)
- Inspect (read-only) `server/ecign/**`: `store.ts`, signature/lock/bundle/second-signature routes, `pdf.ts`, `integrity`, `hashChain`.
- Identify legacy lock/bundle/signature paths and **map** each to the signed-PDF artifact rule (canonical-first, immutable, hash-verified, replicas-only).
- **Do NOT edit `server/ecign/**` in this planning phase**; the mapping output is a follow-up doc, and any edits are gated (§13 Gate F).

## 11. Test plan
- **Unit:** adapter helpers (folder naming, idempotency keys, label injection).
- **Adapter contract tests:** the live adapter satisfies the same `ReplicaPublisher` contract as the fake (shared test suite).
- **Fake↔live parity tests:** same inputs → same parity verdicts across fake and live (live gated behind the sandbox flag).
- **Sandbox Drive upload test** (flag-gated, sandbox folder): upload → read back → sha parity verified.
- **Evidence Center link test:** record resolves to the canonical version; parity represented.
- **Restart/reconstruction test:** filesystem store rebuilds from durable records (extends the journal test).
- **Survey packet export test:** locked → real artifacts + audit; incomplete → blocked.
- **Negative tests:** hash mismatch, stale artifact/tip, missing Drive file, missing Evidence record, permission denied.

## 12. Rollback / recovery
- **Partial Drive upload:** state `failed_drive_publish`; canonical bytes already persisted immutably; idempotent retry (same version/ref); never recreate the PDF.
- **Metadata attach failure:** state `failed_metadata_attach`; retry attach using the existing `driveFileId`; artifact unchanged.
- **Hash mismatch:** hard block → `recovery_required`; never overwrite; flag potential tamper.
- **Mark sandbox artifacts test-only:** TRAINING name prefix + metadata flag; sandbox teardown removes only `TRAINING-*` in the sandbox folder.
- **Never delete real evidence:** cleanup scoped to the sandbox folder + TRAINING flag; production paths out of scope and untouched.

## 13. Approval gates
- **Gate A:** this planning doc approved.
- **Gate B:** sandbox Drive folder id + credential path confirmed (no secrets in repo).
- **Gate C:** live adapter implemented **behind a feature flag** (default off; fake remains default).
- **Gate D:** sandbox-only Drive upload proof (TRAINING artifacts, parity verified).
- **Gate E:** Evidence Center sandbox proof (record + link + parity).
- **Gate F:** `server/ecign` reconciliation approval (before any server edit).
- **Gate G:** production implementation approval (real WORM store, production Drive/Evidence, real signing).

## 14. Recommended implementation sequence
- **2-live A:** adapter interfaces + sandbox config + feature flag (no live calls yet).
- **2-live B:** Drive sandbox upload behind the fake/live switch (sandbox folder only).
- **2-live C:** Evidence Center sandbox attach.
- **2-live D:** `server/ecign` reconciliation (gated).
- **2-live E:** real PDF/crypto signing (dependency decision at this point).
- **2-live F:** production WORM store plan.

## 15. Final recommendation
- **Proceed — to Gate A approval only.** Do not write live until Gate B (sandbox folder + creds confirmed).
- **First subphase: 2-live A** — adapter interfaces + sandbox config + feature flag (zero external effects; fully reversible; testable with the existing fake adapter as the default).
- **Hard stops:** any real Drive/Evidence write before Gate B/D/E; any `server/ecign/**` edit before Gate F; any new dependency (`pdf-lib`) before explicit approval; any production target before Gate G; any PHI or public link, ever.
