# eCIgn Path B — Phase 1 Contract Checkpoint

Contracts-and-tests only. **No runtime wiring exists. Phase 2 is NOT authorized.**
Date: 2026-06-22.

## Provenance
- **Approved plan commit (hardened):** `8367c4a` — `docs(v6): final qa13c supporting artifacts and plan polish (complete 64-agent hardening)` (original approved draft `cc5d13b`, hardened on top). `8367c4a` is **both** the hardened tip of `docs/ecign-path-b-readiness-plan` **and** the resulting baseline tip — it was landed by a **fast-forward** merge (`9f0a698..8367c4a`), so there is no separate merge commit.
- **Approved plan file:** `docs/v6/V6_Final/QA13b/ECIGN_PATH_B_ARCHITECTURE_READINESS_PLAN_20260622.md` (on baseline `v2/designless-baseline` @ `8367c4a`).
- **Phase 1 branch:** `phase17/ecign-path-b-phase1-contracts-tests` (from baseline `8367c4a`).

## Plan cross-reference map (for line-by-line audit)
This Phase 1 is an *implementation* of the approved plan; below maps the main contracts to the plan constraints they encode:
- **Plan §2 (canonical PDF created FIRST; bytes+hash persisted before `signed`; immutable after signature):** `PresentedArtifactVersion` vs `SignedArtifactVersion` split; `validatePresentedSignedPair`/`validateVersionLinkage`; `CANONICAL_ARTIFACT_KIND='care_indeed_form_pdf'` + `CANONICAL_ARTIFACT_MIME='application/pdf'`.
- **Plan §2 (canonical is source of truth; Drive/Evidence are replicas only; parity by recomputed sha, not link):** `CanonicalStorageLocator` (opaque, public-URL-rejected) + `ReplicaParityRecord`/`validateReplicaParityRecord`.
- **Plan §7 (data model: 1-based sequence, formInstance immutability, lock only after full parity):** `validateSignatureSequence`, `validateVersionLinkage` (form-instance stability), `validateLockEligibilityMetadata`.
- **Plan §8/§9 (state machine + failure/recovery):** `ArtifactState`, `ALLOWED_TRANSITIONS` (locked terminal), `StateFailureReason`; recovery transitions back to prior valid signed state.
- **Plan §10 (append-only audit, no PHI):** `AuditEnvelope` + `AUDIT_ENVELOPE_ALLOWED_KEYS`/`AUDIT_FORBIDDEN_KEY_PATTERNS`; `validateAuditEnvelope`.

## Files created (all under `src/policy/ecign/pathB/` + one checkpoint doc)
- `ids.ts` — branded identifier types + canonical primitives/guards.
- `artifactContracts.ts` — artifact family, presented/signed/final/locked union, locator, parity, retention.
- `hierarchySnapshot.ts` — immutable signer-hierarchy snapshot contract.
- `stateMachine.ts` — states, failure reason codes, allowed-transition map.
- `auditContracts.ts` — allowlist-shaped audit envelope + idempotency contract.
- `validators.ts` — pure invariant validators (structured issue codes).
- `index.ts` — contract namespace barrel.
- `__fixtures__/syntheticFixtures.ts` — synthetic non-PHI TRAINING/TEST fixtures.
- `contracts.test.ts` — 30 required green contract tests.
- `runtimeSpecs.todo.test.ts` — 10 Phase 2+ expected-red `it.todo` specs.
- `docs/v6/V6_Final/QA13b/ECIGN_PATH_B_PHASE1_CONTRACT_CHECKPOINT.md` — this checkpoint.

## Exact contracts created
- **Branded ids:** `ArtifactId`, `ArtifactVersionId`, `FormInstanceId`, `FormId`, `EventId`, `WorkflowId`, `PolicyId`, `SignerId`, `EvidenceRecordId`, `AuditChainId`, `RetentionPolicyId`, `DriveFileId`, `HierarchySnapshotId`, `IdempotencyKey`, `IsoTimestamp`.
- **Canonical primitives:** `CANONICAL_ARTIFACT_MIME = 'application/pdf'`, `CANONICAL_ARTIFACT_KIND = 'care_indeed_form_pdf'`, guards `isValidSha256`, `isCanonicalMimeType`, `isIsoTimestamp`, `isNonEmptyString`.
- **Artifact:** `ArtifactFamily`, `ArtifactKind` (canonical vs rejected `markdown|html|plain_text|metadata_only|generic_template|regenerated_pdf|summary`), `CanonicalStorageLocator`, `PresentedArtifactVersion`, `SignedArtifactVersion`, `FinalValidatedArtifactVersion`, `LockEligibilityMetadata`, `ArtifactVersion` (discriminated union), `ReplicaParityRecord`, `RetentionContract`.
- **Hierarchy:** `HierarchySnapshot`, `TierSignerAssignment`.
- **State machine:** `ArtifactState`, `StateFailureReason`, `ALLOWED_TRANSITIONS`, `isAllowedTransition`, `isTerminalState`.
- **Audit/idempotency:** `AuditEnvelope` + `AUDIT_ENVELOPE_ALLOWED_KEYS` + `AUDIT_FORBIDDEN_KEY_PATTERNS`, `IdempotencyEnvelope`, `IdempotentOperation`.

## Presented-vs-signed artifact decision
> Interpretation note: "presented vs signed" and the term "signed-only fields" are *our*
> contract-level reading of the plan's §2 requirements ("canonical PDF created FIRST", "bytes +
> hash persisted before state advances to `signed`", "immutable after signature"). The plan does
> not use the literal phrase "signed-only fields"; it is how we enforce the presented↔signed
> separation at compile time (discriminated union) and runtime (validators).

Two distinct, separately-identified immutable concepts (never collapsed into one id):
- **Presented** (`PresentedArtifactVersion`): the exact PDF bytes shown to signer N before signing — `presentationArtifactVersionId`, `derivedFromSignedVersionId` (null for signer 1, else prior signed tip), `canonicalStorageLocator`, `sha256`, `byteLength`, `mimeType=application/pdf`, `presentedAt`, `presentedToSignerId`, `signerTier`. Carries NO signed-only fields.
- **Signed** (`SignedArtifactVersion`): the exact PDF bytes after signature — `artifactVersionId`, `presentedArtifactVersionId` (exact input link), `previousSignedArtifactVersionId` (prior chain tip; null only for first), `signerId/Role/Tier`, `signatureSequence`, `sha256`, `signedAt`, `immutableAt`. Validators enforce: distinct presented/signed ids, exact presentation link, prior-tip linkage, no self-reference, formInstance stability.

## Canonical storage abstraction
`CanonicalStorageLocator { store: 'canonical'; ref: string }` — opaque, vendor-agnostic; **no storage vendor selected in Phase 1**. `validateCanonicalLocator` rejects public Drive/HTTP URLs. Drive `driveFileId` and `EvidenceRecordId` are **replica/index references only**; `ReplicaParityRecord` proves parity by independently-recomputed `replicaSha256 === canonicalSha256` (a link alone never means parity). Explicitly: the **presence of a `driveFileId` or an `evidenceRecordId` alone is never sufficient** for parity or for lock eligibility — `validateReplicaParityRecord` returns `parity_link_without_sha` when `status:'verified'` lacks a recomputed `replicaSha256`, and `parity_sha_mismatch` when the recomputed hash differs.

## Timestamp distinctions (not overloaded)
`createdAt`, `presentedAt`, `signedAt`, `immutableAt`, `finalValidatedAt`, `lockedAt` are distinct fields. `lockedAt`/`locked` requires canonical persistence + Drive parity + Evidence parity + metadata attach + audit append (enforced by `validateLockEligibilityMetadata`).

## Invariants implemented (pure validators)
`validateArtifactIdentity`, `validateCanonicalMimeType`, `validatePresentedArtifactVersion`, `validateSignedArtifactVersion`, `validatePresentedSignedPair`, `validateVersionLinkage`, `validateSignatureSequence`, `validateTierProgression`, `validatePermissionSatisfiesTier` (reuses `permissionSatisfies`), `validateNoSelfApproval`, `validateLockEligibilityMetadata`, `validateReplicaParityRecord` + `parityRequiresRecovery`, `validateCanonicalLocator`, `validateAuditEnvelope`, `validateRetentionContract`, `validateIdempotency`, `validateRetryPreservesVersion`, `validateHierarchySnapshot`. All side-effect-free; return structured issue codes (no free text/PHI).

## Tests
- **Green contract tests: 30/30 passing** (`contracts.test.ts`). Counts are brittle, so the durable measure is the **invariant categories covered**:
  - Canonical-artifact identity (PDF-only; markdown/html/text/template/metadata/summary/regenerated rejected).
  - Presented↔signed separation (distinct ids, exact presentation link, no signed-only fields on presented, required fields on signed).
  - Chain integrity (prior-tip linkage, no self-reference, first-version presentation link, formInstance immutability).
  - Sequence rules (1-based, strictly increasing, gap-free, unique).
  - Authorization (tier no-skip, permission ladder via `permissionSatisfies`, self-approval block).
  - Lock eligibility (canonical persist + Drive parity + Evidence parity + metadata + audit).
  - Replica parity (recomputed-sha equality; link-alone insufficient; mismatch→recovery).
  - Canonical locator (opaque; public Drive/HTTP URL rejected).
  - Audit envelope (allowlist-only keys; PHI/free-text/signature-byte keys rejected).
  - Retention (required; no hardcoded-duration substitute) · Idempotency (key per write) · Retry (same `artifactVersionId`) · Lock terminality.
- **Runtime specs left TODO / expected-red: 10** (`runtimeSpecs.todo.test.ts`, via `it.todo`) — write-once enforcement, byte-freeze, PDF signature application, multi-signer byte lineage, server-side hash recompute, Drive/Evidence byte parity, recovery, restart reconstruction, survey packet export. Reported as pending; never masquerading as passing; default test command stays green.
- Run with: `npx tsx --test src/policy/ecign/pathB/contracts.test.ts src/policy/ecign/pathB/runtimeSpecs.todo.test.ts` (repo convention: `node:test` + `node:assert` via `tsx`; no new deps).

## Unresolved Phase 2 decisions (deferred), grouped for scoping

**A. Storage & freeze**
- Canonical immutable store vendor/technology (object-lock / WORM bucket / DB WORM constraint) — locator is opaque pending this.
- Server-side byte-freeze + hash-recompute implementation; where/when presentation capture persists.

**B. Replicas & parity**
- Drive replica publish + byte-parity verification mechanism.
- Evidence Center record write + linkage to the canonical artifact.
- Recovery/idempotency runtime store; retention policy source + disposition workflow integration.

**C. Reconciliation with pre-existing paths**
- Reconcile pre-existing `server/ecign/` signing/lock/bundle paths to the §2 artifact rule (canonical-first, immutable, hash-verified, replicas-only).

## Explicit statements
- **No runtime wiring exists** — no UI/screen edits, no server route/store, no API/fetch, no Google Drive/Evidence writes, no PDF generation, no signature application, no filesystem/JSONL writes, no Zustand/store wiring. Contracts, pure validators, fixtures, and tests only.
- **Phase 2 remains UNAUTHORIZED.** No Phase 2 implementation has begun.
