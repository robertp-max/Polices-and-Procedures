/// <reference types="node" />
/**
 * eCIgn Path B — Phase 1 contract tests (REQUIRED GREEN).
 *
 * Pure contract/invariant checks only. No runtime, no I/O, synthetic non-PHI
 * fixtures. Run with: npx tsx --test src/policy/ecign/pathB/contracts.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'vitest';

import { ALLOWED_TRANSITIONS, isAllowedTransition, isTerminalState } from './stateMachine';
import {
  parityRequiresRecovery,
  validateArtifactIdentity,
  validateAuditEnvelope,
  validateCanonicalLocator,
  validateIdempotency,
  validateLockEligibilityMetadata,
  validateNoSelfApproval,
  validatePermissionSatisfiesTier,
  validatePresentedArtifactVersion,
  validatePresentedSignedPair,
  validateReplicaParityRecord,
  validateRetentionContract,
  validateRetryPreservesVersion,
  validateSignatureSequence,
  validateSignedArtifactVersion,
  validateTierProgression,
  validateVersionLinkage,
} from './validators';
import {
  makeArtifactFamily,
  makeAuditEnvelope,
  makeLockEligibility,
  makePresented,
  makeReplicaParity,
  makeRetention,
  makeSigned,
  makeSignedChain,
} from './__fixtures__/syntheticFixtures';

const TS = '2026-06-22T13:31:29.000Z';
const SHA_OTHER = 'd'.repeat(64);

describe('eCIgn Path B Phase 1 — canonical artifact identity', () => {
  it('1. accepts only the actual Care Indeed form PDF as canonical signable artifact', () => {
    assert.equal(validateArtifactIdentity(makeArtifactFamily()).ok, true);
  });

  it('2. rejects markdown/html/text/generic-template artifact kinds', () => {
    for (const kind of ['markdown', 'html', 'plain_text', 'generic_template', 'metadata_only', 'summary', 'regenerated_pdf']) {
      const res = validateArtifactIdentity(makeArtifactFamily({ artifactKind: kind as never }));
      assert.equal(res.ok, false, `kind ${kind} must be rejected`);
      assert.ok(res.issues.includes('non_canonical_artifact_kind'));
    }
  });
});

describe('eCIgn Path B Phase 1 — presented vs signed distinction', () => {
  it('3. presented and signed require different version IDs', () => {
    const collision = validatePresentedSignedPair(
      makePresented(),
      makeSigned({ artifactVersionId: 'AVP-1' as never, presentedArtifactVersionId: 'AVP-1' as never }),
    );
    assert.equal(collision.ok, false);
    assert.ok(collision.issues.includes('presented_signed_id_collision'));
    assert.equal(validatePresentedSignedPair(makePresented(), makeSigned()).ok, true);
  });

  it('4. signed version must reference the exact presentedArtifactVersionId', () => {
    const mismatch = validatePresentedSignedPair(makePresented(), makeSigned({ presentedArtifactVersionId: 'WRONG' as never }));
    assert.ok(mismatch.issues.includes('presented_link_mismatch'));
    const missing = validatePresentedSignedPair(makePresented(), makeSigned({ presentedArtifactVersionId: undefined as never }));
    assert.ok(missing.issues.includes('signed_missing_presented_link'));
  });

  it('5. subsequent signed version must reference the prior signed chain tip', () => {
    assert.equal(validateVersionLinkage(makeSignedChain()).ok, true);
    const chain = makeSignedChain();
    const broken = [chain[0], { ...chain[1], previousSignedArtifactVersionId: 'WRONG' }];
    assert.ok(validateVersionLinkage(broken).issues.includes('chain_tip_mismatch'));
  });

  it('6. first signed version still preserves its presentation-snapshot link', () => {
    const res = validateVersionLinkage([makeSigned({ presentedArtifactVersionId: '' as never })]);
    assert.ok(res.issues.includes('first_version_missing_presentation_link'));
  });

  it('27. presented version cannot contain signed-only fields', () => {
    const res = validatePresentedArtifactVersion({ ...makePresented(), signedAt: TS });
    assert.equal(res.ok, false);
    assert.ok(res.issues.includes('presented_has_signed_only_field'));
  });

  it('28. signed version cannot omit signer/sequence/immutableAt', () => {
    const res = validateSignedArtifactVersion({
      ...makeSigned(),
      signerId: undefined,
      signerRole: undefined,
      signatureSequence: undefined,
      immutableAt: undefined,
    });
    assert.ok(res.issues.includes('signed_missing_signer'));
    assert.ok(res.issues.includes('signed_missing_sequence'));
    assert.ok(res.issues.includes('signed_missing_immutable_at'));
  });

  it('29. previous-version chain cannot point to itself', () => {
    const res = validateVersionLinkage([makeSigned({ previousSignedArtifactVersionId: 'AVS-1' as never })]);
    assert.ok(res.issues.includes('self_referential_previous'));
  });
});

describe('eCIgn Path B Phase 1 — hashes, byte length, sequence', () => {
  it('7. sha256 format is strict and byteLength must be positive', () => {
    assert.ok(validateSignedArtifactVersion({ ...makeSigned(), sha256: 'not-a-hash' }).issues.includes('invalid_sha256'));
    assert.ok(validateSignedArtifactVersion({ ...makeSigned(), byteLength: 0 }).issues.includes('non_positive_byte_length'));
    assert.equal(validateSignedArtifactVersion(makeSigned()).ok, true);
  });

  it('8. signatureSequence is 1-based, strictly increasing, gap-free, unique', () => {
    assert.equal(validateSignatureSequence(makeSignedChain()).ok, true);
    const gap = [makeSigned(), makeSigned({ artifactVersionId: 'AVS-3' as never, signatureSequence: 3 })];
    assert.ok(validateSignatureSequence(gap).issues.includes('sequence_gap'));
  });

  it('9. sequence zero and duplicate sequence values are rejected', () => {
    assert.ok(validateSignatureSequence([makeSigned({ signatureSequence: 0 })]).issues.includes('sequence_not_one_based'));
    const dup = [makeSigned(), makeSigned({ artifactVersionId: 'AVS-2' as never, signatureSequence: 1 })];
    assert.ok(validateSignatureSequence(dup).issues.includes('sequence_duplicate'));
  });

  it('10. formInstanceId cannot change after the first signature', () => {
    const chain = [
      makeSigned(),
      makeSigned({
        artifactVersionId: 'AVS-2' as never,
        previousSignedArtifactVersionId: 'AVS-1' as never,
        formInstanceId: 'FI-OTHER' as never,
        signatureSequence: 2,
      }),
    ];
    assert.ok(validateVersionLinkage(chain).issues.includes('form_instance_changed'));
  });

  it('11. stale chain-tip input is rejected by pure contract validation', () => {
    const chain = [
      makeSigned(),
      makeSigned({ artifactVersionId: 'AVS-2' as never, previousSignedArtifactVersionId: 'STALE' as never, signatureSequence: 2 }),
    ];
    assert.ok(validateVersionLinkage(chain).issues.includes('chain_tip_mismatch'));
  });
});

describe('eCIgn Path B Phase 1 — tiers, permissions, self-approval', () => {
  it('12. required signer tier cannot be skipped', () => {
    assert.equal(validateTierProgression([1, 2, 3], [1, 2]).ok, true);
    assert.ok(validateTierProgression([1, 2, 3], [1, 3]).issues.includes('tier_skipped'));
  });

  it('13. lower permission tier cannot satisfy a higher required tier', () => {
    assert.ok(validatePermissionSatisfiesTier(['eCIgner'], 'eCIgn Final Approver').issues.includes('permission_insufficient'));
    assert.equal(validatePermissionSatisfiesTier(['eCIgn Final Approver'], 'eCIgner').ok, true);
  });

  it('14. self-approval is rejected when the hierarchy snapshot forbids it', () => {
    const res = validateNoSelfApproval(true, [
      { signerTier: 1, signerId: 'USER-X' },
      { signerTier: 2, signerId: 'USER-X' },
    ]);
    assert.ok(res.issues.includes('self_approval_forbidden'));
    assert.equal(validateNoSelfApproval(true, [{ signerTier: 1, signerId: 'A' }, { signerTier: 2, signerId: 'B' }]).ok, true);
  });
});

describe('eCIgn Path B Phase 1 — lock eligibility & replica parity', () => {
  it('15. locked is rejected without canonical persistence metadata', () => {
    assert.ok(validateLockEligibilityMetadata(makeLockEligibility({ canonicalPersistVerified: false })).issues.includes('lock_missing_canonical_persist'));
    assert.equal(validateLockEligibilityMetadata(makeLockEligibility()).ok, true);
  });

  it('16. locked is rejected without Drive parity', () => {
    assert.ok(validateLockEligibilityMetadata(makeLockEligibility({ driveParity: makeReplicaParity({ status: 'pending' }) })).issues.includes('lock_missing_drive_parity'));
  });

  it('17. locked is rejected without Evidence Center parity', () => {
    assert.ok(validateLockEligibilityMetadata(makeLockEligibility({ evidenceParity: makeReplicaParity({ replicaKind: 'evidence_center', status: 'failed' }) })).issues.includes('lock_missing_evidence_parity'));
  });

  it('18. locked is rejected without metadata/audit completion', () => {
    const res = validateLockEligibilityMetadata(makeLockEligibility({ metadataAttachComplete: false, auditAppendComplete: false }));
    assert.ok(res.issues.includes('lock_missing_metadata_attach'));
    assert.ok(res.issues.includes('lock_missing_audit_append'));
  });

  it('19. Drive/Evidence links alone do not satisfy parity', () => {
    const res = validateReplicaParityRecord({ ...makeReplicaParity(), replicaSha256: undefined, status: 'verified' });
    assert.ok(res.issues.includes('parity_link_without_sha'));
  });

  it('20. replica sha mismatch produces mismatch / recovery-required eligibility', () => {
    const rec = { ...makeReplicaParity(), replicaSha256: SHA_OTHER, status: 'mismatch' };
    assert.ok(validateReplicaParityRecord(rec).issues.includes('parity_sha_mismatch'));
    assert.equal(parityRequiresRecovery(rec), true);
  });

  it('21. canonical locator cannot be a public Drive URL', () => {
    assert.ok(validateCanonicalLocator({ store: 'canonical', ref: 'https://drive.google.com/file/d/123' }).issues.includes('canonical_locator_public_url'));
  });
});

describe('eCIgn Path B Phase 1 — audit, retention, idempotency, lock terminality', () => {
  it('22. audit envelope rejects arbitrary/free-text/PHI-shaped properties', () => {
    assert.ok(validateAuditEnvelope({ ...makeAuditEnvelope(), arbitraryNote: 'hello' }).issues.includes('audit_unknown_key'));
    assert.equal(validateAuditEnvelope(makeAuditEnvelope()).ok, true);
  });

  it('23. audit envelope excludes signature image / form bytes', () => {
    assert.ok(validateAuditEnvelope({ ...makeAuditEnvelope(), signature_png: 'x' }).issues.includes('audit_forbidden_key'));
    assert.ok(validateAuditEnvelope({ ...makeAuditEnvelope(), formData: {} }).issues.includes('audit_forbidden_key'));
  });

  it('24. retention policy is required and cannot be a hardcoded-duration substitute', () => {
    assert.ok(validateRetentionContract(makeRetention({ retentionPolicyId: '' as never })).issues.includes('retention_policy_missing'));
    assert.ok(validateRetentionContract(makeRetention({ retentionPolicyId: '7-years' as never })).issues.includes('retention_hardcoded_duration'));
    assert.equal(validateRetentionContract(makeRetention()).ok, true);
  });

  it('25. idempotency keys are required per write operation', () => {
    assert.ok(validateIdempotency({ operation: 'drive_publish' }).issues.includes('idempotency_key_missing'));
    assert.equal(validateIdempotency({ operation: 'drive_publish', idempotencyKey: 'IDK-1' }).ok, true);
  });

  it('26. failure/retry contract preserves the same artifactVersionId', () => {
    assert.equal(validateRetryPreservesVersion({ artifactVersionId: 'AVS-1' }, { artifactVersionId: 'AVS-1' }).ok, true);
    assert.ok(validateRetryPreservesVersion({ artifactVersionId: 'AVS-1' }, { artifactVersionId: 'AVS-2' }).issues.includes('retry_version_changed'));
  });

  it('30. locked is terminal except an append-only approved disposition record', () => {
    assert.equal(ALLOWED_TRANSITIONS.locked.length, 0);
    assert.equal(isTerminalState('locked'), true);
    assert.equal(isAllowedTransition('locked', 'draft'), false);
  });
});
