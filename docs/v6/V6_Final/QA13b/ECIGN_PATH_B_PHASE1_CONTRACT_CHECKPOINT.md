# eCIgn Path B — Phase 1 Contract Checkpoint

Contracts-and-tests only. **No runtime wiring exists. Phase 2 is NOT authorized.**
Date: 2026-06-22.

## Provenance
- **Approved plan commit (hardened):** `8367c4a` — `docs(v6): final qa13c supporting artifacts and plan polish (complete 64-agent hardening)` (original approved draft `cc5d13b`, hardened on top).
- **Approved plan file:** `docs/v6/V6_Final/QA13b/ECIGN_PATH_B_ARCHITECTURE_READINESS_PLAN_20260622.md` (landed on baseline `v2/designless-baseline` @ `8367c4a` via ff-only).
- **Phase 1 branch:** `phase17/ecign-path-b-phase1-contracts-tests` (from baseline `8367c4a`).

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
Two distinct, separately-identified immutable concepts (never collapsed into one id):
- **Presented** (`PresentedArtifactVersion`): the exact PDF bytes shown to signer N before signing — `presentationArtifactVersionId`, `derivedFromSignedVersionId` (null for signer 1, else prior signed tip), `canonicalStorageLocator`, `sha256`, `byteLength`, `mimeType=application/pdf`, `presentedAt`, `presentedToSignerId`, `signerTier`. Carries NO signed-only fields.
- **Signed** (`SignedArtifactVersion`): the exact PDF bytes after signature — `artifactVersionId`, `presentedArtifactVersionId` (exact input link), `previousSignedArtifactVersionId` (prior chain tip; null only for first), `signerId/Role/Tier`, `signatureSequence`, `sha256`, `signedAt`, `immutableAt`. Validators enforce: distinct presented/signed ids, exact presentation link, prior-tip linkage, no self-reference, formInstance stability.

## Canonical storage abstraction
`CanonicalStorageLocator { store: 'canonical'; ref: string }` — opaque, vendor-agnostic; **no storage vendor selected in Phase 1**. `validateCanonicalLocator` rejects public Drive/HTTP URLs. Drive `driveFileId` and `EvidenceRecordId` are **replica/index references only**; `ReplicaParityRecord` proves parity by independently-recomputed `replicaSha256 === canonicalSha256` (a link alone never means parity).

## Timestamp distinctions (not overloaded)
`createdAt`, `presentedAt`, `signedAt`, `immutableAt`, `finalValidatedAt`, `lockedAt` are distinct fields. `lockedAt`/`locked` requires canonical persistence + Drive parity + Evidence parity + metadata attach + audit append (enforced by `validateLockEligibilityMetadata`).

## Invariants implemented (pure validators)
`validateArtifactIdentity`, `validateCanonicalMimeType`, `validatePresentedArtifactVersion`, `validateSignedArtifactVersion`, `validatePresentedSignedPair`, `validateVersionLinkage`, `validateSignatureSequence`, `validateTierProgression`, `validatePermissionSatisfiesTier` (reuses `permissionSatisfies`), `validateNoSelfApproval`, `validateLockEligibilityMetadata`, `validateReplicaParityRecord` + `parityRequiresRecovery`, `validateCanonicalLocator`, `validateAuditEnvelope`, `validateRetentionContract`, `validateIdempotency`, `validateRetryPreservesVersion`, `validateHierarchySnapshot`. All side-effect-free; return structured issue codes (no free text/PHI).

## Tests
- **Green contract tests: 30/30 passing** (`contracts.test.ts`), covering the full required matrix (canonical-only artifact, presented≠signed, exact links, chain tip, sequence rules, instance stability, tier no-skip, permission ladder, self-approval, lock eligibility, replica parity, canonical-locator URL ban, audit allowlist, retention, idempotency, retry version preservation, lock terminality).
- **Runtime specs left TODO / expected-red: 10** (`runtimeSpecs.todo.test.ts`, via `it.todo`) — write-once enforcement, byte-freeze, PDF signature application, multi-signer byte lineage, server-side hash recompute, Drive/Evidence byte parity, recovery, restart reconstruction, survey packet export. Reported as pending; never masquerading as passing; default test command stays green.
- Run with: `npx tsx --test src/policy/ecign/pathB/contracts.test.ts src/policy/ecign/pathB/runtimeSpecs.todo.test.ts` (repo convention: `node:test` + `node:assert` via `tsx`; no new deps).

## Unresolved Phase 2 storage decisions (deferred)
- Canonical immutable store vendor/technology (object-lock / WORM bucket / DB WORM constraint) — locator is opaque pending this.
- Server-side byte-freeze + hash-recompute implementation and where presentation capture persists.
- Drive replica publish + parity verification mechanism; Evidence Center record write + linkage.
- Recovery/idempotency runtime store; retention policy source + disposition workflow integration.
- Reconciliation of pre-existing `server/ecign/` signing/lock/bundle paths to the §2 artifact rule.

## Explicit statements
- **No runtime wiring exists** — no UI/screen edits, no server route/store, no API/fetch, no Google Drive/Evidence writes, no PDF generation, no signature application, no filesystem/JSONL writes, no Zustand/store wiring. Contracts, pure validators, fixtures, and tests only.
- **Phase 2 remains UNAUTHORIZED.** No Phase 2 implementation has begun.
