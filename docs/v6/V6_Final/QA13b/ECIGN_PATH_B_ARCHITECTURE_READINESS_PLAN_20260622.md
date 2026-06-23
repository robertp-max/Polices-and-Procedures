# eCIgn Path B -- Architecture & Readiness Plan

Documentation-only architecture/readiness plan for **eCIgn Path B**, built around the
signed-PDF artifact evidence rule. **No code was written or modified to produce this plan.**
Date: 2026-06-22. Baseline branch: `v2/designless-baseline` (current tip 9f0a698; Path A eCIgn checkpoint at `6bd906f` per `V2_BASELINE_CHECKPOINT_AFTER_ECIGN_PATH_A_20260622.md`).

> **GATE:** Path B implementation MUST NOT begin until this architecture is reviewed and approved.
> Path A (source-grounded static eCIgn screen) is checkpointed and remains the current baseline
> behavior. See `V2_BASELINE_CHECKPOINT_AFTER_ECIGN_PATH_A_20260622.md` and
> `ECIGN_STAGE_B_READINESS_PLAN.md` (HARD REQUIREMENT section).

---

## 1. Executive summary

Path B is the **live runtime/API reconnection** of the eCIgn Workspace plus the **signing/write
pipeline** that produces auditable signed artifacts. Unlike Path A (pure client-static structure,
zero runtime dependency, LOW risk), Path B introduces: a runtime server dependency (`server/ecign`
store + API), multi-signer write flows, immutable artifact storage, Google Drive publishing, and
Evidence Center linkage. It is **MED-HIGH** effort/risk: it spans client, server, storage, and
external integration, and it is **not exercised by the static `verify:designless`/build gate**.

Because Path B touches evidence-of-record and compliance surfaces, **it must not begin until the
architecture below is approved.** A premature implementation risks fabricating or corrupting signed
evidence -- the exact failure the signed-PDF artifact rule (§2) exists to prevent.

---

## 2. Non-negotiable signed-PDF artifact rule

The following rules are NON-NEGOTIABLE and apply to all Path B work:

- The canonical signed PDF/artifact is created FIRST. The exact bytes presented to the signer become the permanent record. The exact bytes presented to the signer (or their sha256) MUST be captured from the canonical source and durably persisted to the immutable store at presentation time or upon entering prepared_for_signature, before the sign action is permitted on that version.
- The signed artifact is IMMUTABLE after signature (write-once; no overwrite, no replace, no regeneration). Signature application causes the presented bytes + computed hash to become immutable in the canonical store immediately (bytes + hash persisted before state advances to signed_by_tier_N); lockedAt and full parity are subsequent for certification only. The canonical bytes storage MUST be infrastructure-enforced write-once (e.g., object lock, WORM bucket, DB constraint or ACL that prevents any UPDATE/overwrite of artifact bytes by any code path). Application-level 'never rewrite' is insufficient.
- Evidence records MUST point to the real canonical signed artifact (not a regenerated copy, not metadata alone).
- Google Drive links MUST point to the same canonical artifact.
- Evidence Center links MUST point to the same canonical artifact.
- Multi-signer flows MUST append or advance versions (A->B->C) without regenerating or replacing prior signed artifacts.
- No post-signature regeneration or re-derivation of canonical artifact bytes is allowed. The exact bytes at signing time are the permanent record and are preserved as-is.
- Metadata may update, but the signed artifact bytes MUST never be silently rewritten.
- The canonical signed artifact bytes are the SOURCE OF TRUTH.
- Metadata is an index layer only.
- Google Drive and Evidence Center are references/replicas only. They MUST never hold independent canonical artifacts.
- Hash comparison is REQUIRED on every read, before certification, and before export to prove immutability. All hash comparisons and verifications MUST recompute sha256 server-side over the bytes retrieved from the primary canonical immutable store and compare to the recorded sha256 for the artifactVersionId. Hashes supplied by client, Drive, Evidence Center, or metadata rows alone MUST NOT be accepted.
- Any hash mismatch BLOCKS certification.
- Any missing canonical artifact BLOCKS certification.
- Any Drive/Evidence mismatch BLOCKS certification. 'same' and 'mismatch' are determined exclusively by byte-for-byte identity or sha256 match against the primary canonical store bytes for that artifactVersionId. Presence of a link or metadata record alone is insufficient.
- Any unsigned regenerated packet is NON-COMPLIANT.
- Post-signature regeneration or re-derivation of canonical artifact bytes is FORBIDDEN.

This rule set is a MERGE GATE. Any Path B deliverable that violates any of the above (stores only metadata, regenerates a signed PDF after signature, replaces a prior signed version, or fails parity) MUST be rejected.

The canonical artifact bytes are the only acceptable evidence record for survey defensibility.

---

## 3. Current Path A baseline assumptions

From the Path A checkpoint (`6bd906f`), the currently accepted behavior for the V6 eCIgn Workspace screen:

- **V6 eCIgn screen (client):** pure client-static source-grounded model render only. No live runtime/API signing or write wired into the V6 eCIgn Workspace (/forms/:id/esign or equivalent).
- **Canonical artifact creation for V6 eCIgn:** Path A does **not** create artifacts. The signed-PDF artifact bytes model (per §2) with `artifactVersionId` append-only chain is Path B responsibility.
- **Server signing infrastructure note:** Pre-existing general eCIgn signing/locking/bundling paths exist in `server/ecign/` (store, routes/ecign signatures/lock/bundle/second-signature, pdf.ts, integrity, hashChain). These pre-date this plan and support other flows; they are **not wired to the V6 eCIgn static screen**. The architecture in this plan (canonical bytes captured FIRST, immutable, hash-verified, replicas-only) applies to Path B reconnection of the V6 screen. Reconciliation or migration of pre-existing derivation/lock paths to the §2 signed-PDF artifact rule is required during phased work.
- **Artifact metadata:** the canonical metadata SHAPE is known (from `types.ts`: `ECIgnSignatureRecord`, `ECIgnCertificate`) but no per-instance values are shown; they are marked *source-unavailable*.
- **Google-secured retrieval/write integration:** exists server-side (`server/ecign`, `server/googleEvidence.ts`, `googleDrive`) but is **not wired into the V6 eCIgn screen** in Path A.
- **Drive / Evidence Center linkage:** the Evidence/Drive metadata model is preserved (`regulatoryExecutionStore.ts` -- `attachDriveMetadata`, `folderPath`, `webViewLink`, `driveFileId`) per `EVIDENCE-DRIVE-FINDINGS.md`, but eCIgn-screen linkage is deferred to Path B.
- **No jsonl drift committed:** running V2 Vite can append to `server/ecign/data/*.jsonl`; this runtime drift is never staged/committed.
- **No Path B work started for V6 eCIgn screen:** confirmed -- only the static Path A screen is on baseline for the V6 eCIgn Workspace. No multi-signer tiered state machine, no canonical signed bytes persisted at presentation for this screen, no artifactVersionId A->B->C chain wired.

---

## 4. Path B scope

Path B MUST include the following (all items are mandatory; no exceptions):

- Multi-signer sequencing: ordered, no-skip signer flow driven by the canonical signer hierarchy.
- Signer role hierarchy: reuse SIGNER_HIERARCHY_RULES (owner -> reviewer -> signer -> final approver, governing-body flag) and ECIgnPermissionRole ladder for authorization.
- Second signer support.
- Third signer support.
- Fourth signer support.
- Tier 5 final validation.
- Append-only artifact/version chain: each signature advances the lineage (A->B->C...) without mutating prior versions.
- Immutable signed-artifact retention: write-once storage with retrievable history.
- Evidence Center visibility: each signed artifact/version surfaces as an evidence record linking to the real file.
- Google Drive metadata parity: Drive fileId/webUrl/upload status recorded and consistent with the evidence record and the stored artifact.
- Audit trail traceability.
- Certification traceability.
- Configurable retention policy: policy-confirmed duration (no hardcoded 5/7 years).
- Recovery/retry behavior: idempotent recovery from partial failures (artifact saved but Drive or metadata step failed).
- Idempotency for all write operations.
- Role mismatch handling.
- Duplicate signer prevention.
- Stale formInstanceId handling.
- Stale artifactVersionId handling.
- Hash mismatch handling.

---

## 5. Out of scope

Path B must **not**:

- **No redesign** -- keep the V6 visual system; no restyling beyond wiring real data.
- **No light-mode / theming work.**
- **No CES/QAPI mock work** -- CES/QAPI swimlanes are out of bounds.
- **No old Mock 5 repo activity** -- work only in `Policies_and_Procedures_V2`.
- **No unrelated V6 design work.**
- **No replacement of Path A** -- Path B builds on the static model; the source-grounded structure stays.
- **No local/demo fallback reintroduction** -- no fabricated signer/status/hash/IP/audit data, no
  `demoLocalApi` shortcuts that masquerade as real evidence.
- **No post-signature regeneration or re-derivation of canonical artifact bytes** -- see §2.
- **No unapproved implementation** -- implementation remains blocked pending explicit approval of this architecture and Phase 1 data contract + failing tests.
- **No runtime changes before approval** -- no wiring, no server handlers, no UI updates, no store changes for Path B until Phase 0 approval + Phase 1 contracts/tests are complete and the signed-PDF artifact rule (§2) is accepted as the non-negotiable merge gate.

---

## 6. Proposed architecture

```
  Form signing workspace (V6 eCIgn screen, /forms/:id/esign)
      -- presents and captures EXACT PDF bytes
             |
             v
  Canonical signed artifact (bytes shown == bytes stored)
      -- created FIRST, hashed (sha256), NEVER re-rendered
             |
             | sign (signer N, role/tier validated)
             v
  Immutable storage / version record (write-once)
      -- artifactVersionId, previousArtifactVersionId (A->B->C)
             |
             v
  Metadata record (index/audit layer -- links only)
             +---------------------------------------+
             |                                       |
             v                                       v
      Evidence Center                           Google Drive secured file/link
          -- links to canonical                    -- same bytes
             |                                       |
             +-------------------+-------------------+
                                 |
                                 v
                          Audit trail (append-only)
          -- policy / workflow / event / formInstance / artifact / signer / version / certificate traceability
```
(ASCII diagram uses consistent 4-space indent for branches under v's and box; all characters 7-bit ASCII.)

The canonical signed artifact bytes are the SOURCE OF TRUTH.
Metadata, Evidence Center, and Google Drive are indexes/references/replicas ONLY.
Evidence Center and Google Drive MUST NEVER hold independent canonical artifacts.
All consumers reference the same canonical artifact bytes.
Metadata and audit rows index it and never substitute for it.

---

## 7. Data model readiness

Required metadata fields per signed artifact/version (index/audit layer -- the artifact **bytes**
themselves are stored separately and immutably):

| Field | Purpose |
|---|---|
| `artifactId` | Stable identity of the artifact family (the document being signed). |
| `formInstanceId` | The form instance this artifact belongs to. |
| `eventId` | Owning regulatory/execution event. |
| `workflowId` | Owning workflow (if any). |
| `policyId` | Linked policy. |
| `signerId` | User who applied this signature. |
| `signerRole` | Business/workflow role (`SignerRole`). |
| `signerTier` | Tier in the signer sequence (1..N). |
| `signatureSequence` | Ordinal position in the signing chain. |
| `previousArtifactVersionId` | Link to the prior signed version (null for first). |
| `artifactVersionId` | This version's unique id (append-only chain node). |
| `sha256` / `hash` | Content hash of the stored signed bytes (tamper-evidence). |
| `driveFileId` | Google Drive file id for this canonical artifact. |
| `driveWebUrl` | Drive web link to the same artifact. |
| `driveUploadStatus` | `pending` / `uploaded` / `failed`. |
| `evidenceRecordId` | Evidence Center record linking to this artifact. |
| `retentionPolicyId` | Configurable retention policy reference. |
| `lockedAt` | Timestamp the artifact became immutable. |
| `createdAt` | Creation timestamp. |
| `createdBy` | Actor/service that created the record. |
| `auditChainId` | Append-only audit chain identifier. |

Constraints:
- `signatureSequence` MUST be 1-based and strictly increasing within an artifact family.
- `formInstanceId` MUST be immutable after the first signature; it cannot change for the artifact chain.
- `artifactVersionId` is append-only; each advance creates a new immutable node.
- `previousArtifactVersionId` forms the strict append-only chain link (null only for first).
- `sha256` MUST be verified on every read, before certification, and before export by server-side recompute over primary canonical store bytes only.
- `lockedAt` MUST be set ONLY after the artifact bytes + hash are persisted in the primary canonical immutable store AND Drive + Evidence Center parity (byte-for-byte or sha256 match) AND metadata attach all succeed for that `artifactVersionId`.
- `formInstanceId` + `artifactVersionId` + `sha256` + `signatureSequence` together identify the exact immutable record for traceability.

---

## 8. Multi-signer state machine

States:

- `draft`
- `prepared_for_signature`
- `signed_by_tier_1`
- `signed_by_tier_2`
- `signed_by_tier_3`
- `signed_by_tier_4`
- `final_validated_by_tier_5`
- `locked`
- `failed_drive_publish`
- `failed_metadata_attach`
- `recovery_required`

**Allowed transitions (happy path, explicit):**
1. `draft -> prepared_for_signature` (only after canonical bytes + sha256 captured and persisted per §2).
2. `prepared_for_signature -> signed_by_tier_1` (after role/tier validation via SIGNER_HIERARCHY_RULES + ECIgnPermissionRole + permissionSatisfies; bytes frozen).
3. `signed_by_tier_1 -> signed_by_tier_2` (if required by hierarchy; new artifactVersionId with previous link).
4. `signed_by_tier_2 -> signed_by_tier_3` (if required).
5. `signed_by_tier_3 -> signed_by_tier_4` (if required).
6. `signed_by_tier_4 -> final_validated_by_tier_5` (Tier 5 final validation/signature per hierarchy).
7. `final_validated_by_tier_5 -> locked` (only after full Drive + Evidence Center + metadata parity + audit complete).

Tiers are skippable ONLY when the resolved SIGNER_HIERARCHY_RULE for the domain/event (including governingBodyRequired flag) does not require them. The sequence advances to the next required tier, never past a required one. SignatureSequence is 1-based and strictly increasing.

**Allowed transitions (failure/recovery):**
- any `signed_by_tier_n` -> `failed_drive_publish` -> (retry, same artifactVersionId) -> `signed_by_tier_n` (idempotent re-publish after parity re-verify).
- any `signed_by_tier_n` -> `failed_metadata_attach` -> (retry) -> `signed_by_tier_n`.
- `failed_*` -> `recovery_required` -> resume the last valid prior state actually achieved (prepared_for_signature or signed_by_tier_N); never fabricate or advance to a higher tier.
- Recovery MUST preserve prior signed tiers + full prior audit entries with no gaps.

**Forbidden transitions (explicit, zero-tolerance):**
- Any transition that mutates, replaces, overwrites, or regenerates an already-signed artifact version or its bytes (post-signature regeneration FORBIDDEN).
- Lower tier attempting to sign, validate, or advance over a higher-tier signature.
- Skipping a required signer tier (per active SIGNER_HIERARCHY_RULE snapshot).
- `locked -> any` (locked is terminal except approved retention/disposition workflow that appends a new disposition record only).
- Backward transitions that rewrite earlier signed versions or prior artifactVersionId.
- Advancing to a later tier before the current required tier is `signed`.
- Signing against a stale artifactVersionId (not the current tip of the A->B->C chain for the artifactId).
- Certifying without successful Drive + Evidence Center parity (bytes/hash match to canonical).
- Certifying with hash mismatch (server-side recomputed sha256 vs recorded).
- Certifying with missing or incomplete audit chain.
- Any transition or export that produces incomplete audit trail or breaks chain continuity.
- Lower tier validating higher tier.
- Stale artifact version signing.
- Post-signature PDF/bytes regeneration or re-derivation.
- Overwriting prior signed artifact.
- Certifying without Drive/Evidence parity.
- Certifying with hash mismatch.
- Certifying with missing audit chain.
- Duplicate signer attempt on same tier (idempotent reject).
- Role mismatch on any advance.

---

## 9. Failure handling

Idempotency for ALL write operations is REQUIRED (canonical artifact bytes creation/persist + hash, Drive publish, metadata attach, Evidence Center linkage, audit append, state transitions). All operations keyed by `artifactVersionId` (+ step/sub-operation); safe re-execution produces zero duplicate records, versions, or side effects. All partial failure states (failed_*, recovery_required) MUST preserve the canonical artifact bytes unchanged. Recovery from any failed_* or recovery_required state resumes only the prior valid signed tier and MUST NOT create a new artifactVersionId or regenerate bytes for the failed step. All failure paths and logs use only non-PHI identifiers. No PHI or signature images in any failure logs, states, or recovery traces.

| Scenario | Required behavior |
|---|---|
| Artifact created but Drive publish failed | State `failed_drive_publish`; artifact + hash already persisted immutably; retry publish idempotently (same `artifactVersionId`); never recreate, re-derive, regenerate, or alter the canonical artifact bytes (or any prior signed version). |
| Drive uploaded but metadata attach failed | State `failed_metadata_attach`; retry attach using stored `driveFileId`; artifact unchanged; never alter bytes. |
| Signer abandons flow | Remain at last completed signed tier (or `prepared_for_signature`); no partial/forged signature recorded; preserve bytes. |
| Role mismatch | Reject signature attempt; no state change; audit the denied attempt (non-PHI identifiers only). |
| Duplicate signer attempt | Idempotent: detect existing signature for (artifact, tier, signer); do not create a second version; reject before any immutable append. |
| Stale `formInstanceId` | Reject; surface "instance changed/expired"; do not sign against stale instance; no state change. |
| Stale `artifactVersionId` | Reject; do not allow signing against non-current tip of the append-only chain; no state change or new artifactVersionId created; surface error; full audit of denial; preserve current signed tip and bytes. |
| Hash mismatch (stored vs expected) | Hard fail; mark `recovery_required`; never overwrite; flag potential tampering; server-side recompute blocks. |
| Failure during canonical bytes persist step | Hard fail before any signature state advance; do not create partial version; audit; no bytes committed if incomplete. |
| Drive or Evidence Center replica diverges from canonical (bytes/hash mismatch detected post-upload) | Hard fail; mark `recovery_required`; never serve or treat replica bytes as authoritative; reconcile exclusively from primary canonical store; re-verify parity before any state advance or export. |
| Retry idempotency | All retries keyed by `artifactVersionId` + step; safe to re-run without duplicating artifacts/records. |
| Evidence Center missing link | Reconcile from artifact/metadata; backfill `evidenceRecordId`; never fabricate a link; re-verify against canonical. |
| Drive permission failure | Surface `failed_drive_publish`; do not silently store elsewhere or skip; retain artifact + retry after permission fix. |
| Concurrent signer race on same tier | Idempotent reject; first succeeds, subsequent denied with audit; no duplicate version. |
| Audit append or Evidence link failure after bytes+Drive success | Retry metadata/audit only; bytes and prior tiers untouched; append-only audit remains continuous. |
| Any partial failure / recovery | Prior signed tiers + full prior audit entries preserved with no gaps; new audit entries append only; traceability chain remains continuous and verifiable. |

---

## 10. Security and compliance rules

- Role-restricted signing is REQUIRED — only holders of the required `ECIgnPermissionRole` (or higher) MAY sign; unauthorized attempts MUST be rejected with append-only denial audit *before* any signature record or state advance.
- All role/tier validation MUST execute against SIGNER_HIERARCHY_RULES + ECIgnPermissionRole + permissionSatisfies (minTier, allowedRoles, blocksSelfApproval, etc. from the snapshotted hierarchy) server-side before canonical bytes + sha256 persist or any immutable append.
- Signer tier validation is REQUIRED — tier order enforced against the canonical signer hierarchy snapshot at prepared_for_signature (immutable for the artifact family). Role/tier validation MUST use permissionSatisfies; a lower tier CANNOT satisfy a higher-tier requirement. The canonical signer hierarchy snapshot at prepared_for_signature is immutable for the entire artifact family/chain.
- Immutable evidence is REQUIRED — signed artifacts are write-once; bytes never rewritten. The canonical bytes storage layer MUST be infrastructure-enforced write-once (WORM/object lock/DB constraint/ACL). Application logic alone is insufficient. Any code path that could UPDATE/overwrite canonical artifact bytes is PROHIBITED.
- Append-only audit is REQUIRED — audit chain entries are added, never edited or deleted. The append-only audit chain (with sha256/hash verification and artifactVersion lineage) MUST survive and be fully reconstructible/verifiable after full page refresh, server restart, Evidence Center refresh, Drive re-link, or any read path. Mismatch blocks certification/export.
- No PHI, signature images, or form content MUST NOT appear in any log, metric, failure state, jsonl append, or audit payload. All eCIgn write paths (including logger + store appends) MUST apply server-side PHI guard + redaction before persistence or emit. Signature images are NEVER logged. All failure paths use only non-PHI identifiers.
- Google-secured access is REQUIRED — Drive/evidence access via the secured server integration; no public links. All Drive and Evidence Center links MUST be resolved exclusively through authorized server paths (PDP/PEP + session); Drive files MUST use private/non-public sharing; direct unauthenticated links or bypass via webViewLink/driveWebUrl alone is FORBIDDEN.
- Retention policy is REQUIRED — configurable, policy-confirmed duration (`retentionPolicyId`); no hardcoded value. retentionPolicyId is resolved from the governing policy/workflow snapshot at certification time and is immutable for the artifact family.
- Deletion prohibition is REQUIRED — no deletion of any signed artifact bytes or prior version except via explicitly approved retention/disposition workflow that appends a new disposition record only; attempts outside approved workflow are FORBIDDEN and audited.
- Audit-ready traceability is REQUIRED — any signed artifact retrievable and provable by policy / workflow / event / formInstance / artifactVersionId / signer / signatureSequence / version / certificate / auditChainId / sha256. Metadata/Drive/Evidence links never substitute for or bypass the canonical artifact bytes or authorization gates.
- Drive links and Evidence Center links MUST NOT bypass authorization; every read/export of a link must re-validate role/tier/permission + recompute server-side sha256 against canonical store bytes; presence of link or metadata alone is never sufficient.
- All §10 rules are enforced by the same mechanisms that satisfy the signed-PDF artifact rule (hash comparison, server-side recompute, canonical store only).
- Role/tier/permissionSatisfies validation and snapshot rules are enforced by the same mechanisms that satisfy the signed-PDF artifact rule (§2) and state guards (§8).

---

## 11. QA gates before implementation

Concrete checklist. ALL GATES MUST PASS (mandatory, zero-tolerance, blocking with no exceptions) before Path B is considered done. All gates are negative-test oriented where applicable. Server-side recompute of sha256 from primary canonical immutable store ONLY is MANDATORY in ALL relevant gates (per §2 signed-PDF artifact rule):

- [ ] Unit-level artifact/version tests (create, hash, append-only chain integrity; including negative: tamper detection, out-of-order/duplicate append rejection, previousArtifactVersionId violation; canonical bytes + sha256 captured and persisted FIRST per §2.33 before any prepared_for_signature or sign permitted — negative test: sign action BLOCKED until canonical store has bytes).
- [ ] Signer sequence integration tests (tier order, no-skip, N-signer chains for 1-5; covers SIGNER_HIERARCHY_RULES + ECIgnPermissionRole + permissionSatisfies).
- [ ] Drive parity tests (Drive file bytes MUST be byte-for-byte identical to primary canonical store bytes for the `artifactVersionId`; sha256 recomputed server-side from canonical only and must match record; `driveFileId`/`driveWebUrl` correct and verified; mismatch blocks certification/export). Presence of Drive link or metadata alone is insufficient (per §2.47).
- [ ] Evidence Center parity tests (record MUST link to the real canonical artifact; sha256 and bytes verified server-side from primary immutable store; presence of link or metadata alone is insufficient; mismatch blocks).
- [ ] Refresh/persistence + verification test (state + artifacts + hash chain + append-only audit fully reconstructible and verifiable after reload/restart; mismatches block).
- [ ] Role restriction + tier validation negative tests for tiers 1-5 + permission ladder (unauthorized/lower-than-prior cannot sign or force higher; MUST use snapshotted hierarchy via permissionSatisfies (per §10.281-282; lower tier CANNOT satisfy higher); rejects before any immutable write).
- [ ] Failed-upload + idempotent recovery negative tests from ALL 16+ §9 partial failure scenarios (explicit coverage of signer abandons flow, role mismatch, concurrent signer race, replica diverge post-upload, Evidence missing link, Drive permission failure, audit append/Evidence link failure after bytes+Drive success, bytes persist failure, etc.; bytes persist through Drive/metadata/Evidence/audit) using artifactVersionId keys — no duplicate artifacts/records/side effects; consistent final state; stale artifactVersionId rejection.
- [ ] Duplicate-sign prevention test (same signer/tier cannot double-sign; idempotent reject).
- [ ] No-regeneration test using **hash comparison** (post-signature bytes/hash unchanged across reads; post-signature regeneration FORBIDDEN).
- [ ] Presentation-to-storage freeze test: bytes/hash at the moment of successful signature exactly match the bytes presented in the workspace (no post-presentation derivation or alteration).
- [ ] Hash mismatch failure test (server-side recomputed sha256 mismatch vs recorded for artifactVersionId blocks operation; marks `recovery_required`; never overwrite).
- [ ] Missing canonical artifact failure test (any read/certification/export without bytes in primary immutable store is hard-blocked).
- [ ] Stale formInstanceId and stale artifactVersionId rejection tests (MUST reject sign/advance against non-current tip or changed instance; no state change; surface error; enforces §7.187 formInstanceId immutability after first signature).
- [ ] Forbidden transition negative test suite (lower tier on higher required tier; advance before current required tier signed; stale version tip; any mutation/replace/regen of signed artifactVersion; locked terminal except approved retention; all §8 forbidden cases; covers all §8; relevant §9 failure scenarios via recovery).
- [ ] Audit trail completeness test (every state change + signer + version captured, append-only; zero-gap reconstruction post any recovery path; full traceability dimensions; verifiable after restart).
- [ ] Final survey packet export test (multi-signer packet exports ONLY the real canonical signed artifacts + full hash-verified append-only audit chain; MUST reject and block on hash mismatch, missing canonical, Drive/Evidence parity failure, regeneration, unsigned packet, or incomplete audit. Packet MUST be independently verifiable by external party from immutable store alone (enforces §2 signed-PDF rule + created FIRST + replicas only + BLOCKS, §7 constraints, §8 state machine + forbidden, §9 failure handling + zero-gap, §10 security)).
- [ ] Server-side hash recompute enforcement test (every read, parity check, certification, and export recomputes sha256 exclusively from primary canonical immutable store bytes; client/Drive/Evidence/metadata hashes are rejected).
- [ ] No-PHI / redaction enforcement test (logs, audit_events, failures, certs contain only non-PHI identifiers; signature images excluded).
- [ ] Retention policy resolution + deletion prohibition test (configurable only via retentionPolicyId; outside-workflow attempts rejected + audited).
- [ ] Google-secured + authorization bypass prevention test (all links via server paths only; client/unauth links rejected; PDP/PEP enforced).
- [ ] Infra-enforced write-once / append-only test (WORM/DB constraint equivalent; no UPDATE path succeeds for canonical bytes).
- [ ] lockedAt constraint enforcement negative test (per §7.191): `lockedAt` MUST be set ONLY after the artifact bytes + hash are persisted in the primary canonical immutable store AND full Drive + Evidence Center parity (byte-for-byte identity OR server-side sha256 match from canonical only) AND metadata attach all succeed for that `artifactVersionId`; negative tests MUST block/reject any state advance to locked, certification, or export if lockedAt set on partial/incomplete parity or prematurely; cross-refs §2.34, §8.219 (locked transition only after full parity), §11.302/303/315 parity gates.
- [ ] signatureSequence 1-based and strictly increasing negative test (per §7.186): `signatureSequence` MUST be 1-based and strictly increasing within an artifact family (no gaps, no zero, no duplicates, sequential per A->B->C chain); covers tiers 1-5; MUST reject invalid sequences before any immutable write or state advance; integrates with 301 signer sequence + 313 forbidden; cross-refs §8.221, §7.192 traceability.

---

## 12. Implementation phasing recommendation

- **Phase 0 -- architecture approval only** (this document). No code.
- **Phase 1 -- data contract and tests** -- define artifact/version/metadata contract + failing tests (TDD); NO runtime wiring, NO UI changes, NO server handlers. Phase 1 MUST NOT allow any runtime wiring.
- **Phase 2 -- artifact versioning** -- immutable write-once store + append-only A->B->C chain + hash verification.
- **Phase 3 -- signer sequencing** -- role/tier-validated multi-signer state machine over the artifact chain.
- **Phase 4 -- Drive/Evidence parity** -- publish canonical artifact to Drive + Evidence Center linkage; parity tests green.
- **Phase 5 -- recovery and retention** -- idempotent failure recovery + configurable retention policy.
- **Phase 6 -- full QA/UAT** -- all §11 gates + survey packet export; sign-off before any baseline merge.

Each phase is independently reviewable; no phase may regress the signed-artifact rule.

---

## 13. Final recommendation

**Implementation MUST remain BLOCKED pending explicit approval of this architecture.**

Path B is MED-HIGH, evidence-of-record work. Begin only after: (a) this plan is approved, (b) Phase 1 data contract + tests are agreed, and (c) the signed-PDF artifact rule (§2) is accepted as the non-negotiable gate. Until then, the baseline keeps Path A (source-grounded static model) and no live signing/write path is introduced. Recommended next step: review/approve this plan, then authorize **Phase 1 only** (data contract + tests, no runtime wiring). Merge of this document does not authorize any Path B implementation work or runtime wiring. It authorizes review/approval of Phase 1 (data contract + failing tests) only. No PR merge may be interpreted as authorization to begin Phase 2+.


