/**
 * WP-1.2 policy registry unit tests.
 * Assertions use hard-coded PRD expected values (not only re-exported constants)
 * so broken registry data fails the suite.
 */
import { describe, expect, it } from 'vitest';

import {
  ADMINISTRATOR_DON_DUAL_CAPACITY_RULE,
  DUAL_CAPACITY_DEFAULT,
  getSignaturePolicy,
  isDualCapacityRuleEnabled,
  QAPI_QUARTERLY_SIGNATURE_POLICY,
  QAPI_QUARTERLY_SIGNATURE_POLICY_ID,
  resolveDualCapacityDecision,
  SIGNATURE_POLICIES,
  type DualCapacityAttestationRecord,
  type SignatureDualCapacityRule,
  type SignaturePolicy,
} from './signaturePolicies';

import {
  APPROVAL_POLICIES,
  APPROVAL_READINESS_ACTIONS,
  canApproveWithDocumentedException,
  FR025_APPROVAL_ACTIONS,
  QAPI_QUARTERLY_APPROVAL_POLICY,
} from './approvalPolicies';

import {
  FR032_POST_LOCK_EFFECTS,
  FR032_VERIFICATION_CHECKLIST,
  listLockChecklistItemIds,
  listLockChecklistLabels,
  LOCK_POLICIES,
  QAPI_QUARTERLY_LOCK_POLICY,
  RETENTION_RULE_PLACEHOLDERS,
} from './lockPolicies';

import {
  assertNoConfidentialLeak,
  ConfidentialLeakError,
  PERSONNEL_ADDENDUM_ALLOWED_GENERAL_PACKET_FIELDS,
  PERSONNEL_ADDENDUM_CONFIDENTIALITY_RULE,
  PERSONNEL_CONFIDENTIALITY_POLICY,
} from './confidentialityPolicies';

import {
  COMPLIANCE_PACKETS_DRIVE_TEMPLATE,
  MissingDriveBindingError,
  resolveDriveDestination,
} from './driveDestinations';

/** PRD §24 exact capacity set — hard-coded so wrong registry strings fail. */
const PRD_SECTION_24_CAPACITIES = [
  'Administrator',
  'Clinical Manager',
  'QAPI Chair',
] as const;

/** PRD §20.2 exact allowlist — hard-coded so wrong registry strings fail. */
const PRD_SECTION_20_2_ALLOWLIST = [
  'addendum id',
  'sha256',
  'classification',
  'custodian',
  'authorized reviewer',
  'review status',
  'related finding ids',
  'restricted workflow-instance ids',
] as const;

/** FR-032 exact checklist item ids — hard-coded so broken ids fail. */
const PRD_FR032_CHECKLIST_ITEM_IDS = [
  'fr032-packet-identity',
  'fr032-reporting-period',
  'fr032-workflow',
  'fr032-version',
  'fr032-forms',
  'fr032-evidence',
  'fr032-approvals',
  'fr032-signatures',
  'fr032-authority',
  'fr032-confidentiality',
  'fr032-hashes',
  'fr032-drive-publication',
  'fr032-retention',
  'fr032-zero-unresolved-blockers',
] as const;

/** FR-032 exact checklist labels — hard-coded from the PRD sentence. */
const PRD_FR032_CHECKLIST_LABELS = [
  'packet identity',
  'reporting period',
  'workflow',
  'version',
  'forms',
  'evidence',
  'approvals',
  'signatures',
  'authority',
  'confidentiality',
  'hashes',
  'Drive publication',
  'retention',
  'zero unresolved blockers',
] as const;

describe('signature policies (FR-026, §24, §28 #4)', () => {
  it('registers qapi-quarterly-signatures with the exact §24 capacity set', () => {
    const policy = getSignaturePolicy(QAPI_QUARTERLY_SIGNATURE_POLICY_ID);
    expect(policy).toBeDefined();
    expect(policy!.policyId).toBe('qapi-quarterly-signatures');

    const capacities = policy!.requiredCapacities.map((c) => c.capacity);
    // Hard-coded PRD §24 expectation — not a circular constant compare.
    expect(capacities).toEqual([
      'Administrator',
      'Clinical Manager',
      'QAPI Chair',
    ]);
    expect(capacities).toEqual([...PRD_SECTION_24_CAPACITIES]);
    expect(capacities).toHaveLength(3);
    // Reject the pre-fix non-PRD vocabulary if it reappears.
    expect(capacities).not.toContain('Clinical Manager/DON');
    expect(capacities).not.toContain('QAPI Committee Chair');
  });

  it('defaults dual-capacity to deny and never allows without attestation', () => {
    expect(DUAL_CAPACITY_DEFAULT).toBe('deny');
    for (const policy of SIGNATURE_POLICIES) {
      expect(policy.dualCapacityDefault).toBe('deny');
    }

    // Missing record → deny.
    expect(
      resolveDualCapacityDecision(
        QAPI_QUARTERLY_SIGNATURE_POLICY,
        'Administrator',
        'Clinical Manager',
      ),
    ).toBe('deny');

    // Record without attestation evidence → deny.
    const noAttestation: DualCapacityAttestationRecord = {
      dualCapacities: ['Administrator', 'Clinical Manager'],
      attestationEvidencePresent: false,
    };
    expect(
      resolveDualCapacityDecision(
        QAPI_QUARTERLY_SIGNATURE_POLICY,
        'Administrator',
        'Clinical Manager',
        noAttestation,
      ),
    ).toBe('deny');

    // Full attestation still deny while §28 #4 is needs-product-approval.
    const withAttestation: DualCapacityAttestationRecord = {
      dualCapacities: ['Administrator', 'Clinical Manager'],
      attestationEvidencePresent: true,
      dualCapacityRuleId: ADMINISTRATOR_DON_DUAL_CAPACITY_RULE.ruleId,
    };
    expect(
      resolveDualCapacityDecision(
        QAPI_QUARTERLY_SIGNATURE_POLICY,
        'Administrator',
        'Clinical Manager',
        withAttestation,
      ),
    ).toBe('deny');

    expect(isDualCapacityRuleEnabled(ADMINISTRATOR_DON_DUAL_CAPACITY_RULE)).toBe(
      false,
    );
  });

  it('flags Administrator/DON dual-capacity as needs-product-approval and always denies it (§28 #4)', () => {
    expect(ADMINISTRATOR_DON_DUAL_CAPACITY_RULE.approvalStatus).toBe(
      'needs-product-approval',
    );
    expect(ADMINISTRATOR_DON_DUAL_CAPACITY_RULE.primaryCapacity).toBe(
      'Administrator',
    );
    expect(ADMINISTRATOR_DON_DUAL_CAPACITY_RULE.secondaryCapacity).toBe(
      'Clinical Manager',
    );
    expect(ADMINISTRATOR_DON_DUAL_CAPACITY_RULE.requiresExplicitAttestation).toBe(
      true,
    );

    const embedded =
      QAPI_QUARTERLY_SIGNATURE_POLICY.allowedDualCapacitySignatures.find(
        (r) => r.ruleId === ADMINISTRATOR_DON_DUAL_CAPACITY_RULE.ruleId,
      );
    expect(embedded?.approvalStatus).toBe('needs-product-approval');

    // Even a synthetic approved-looking call path cannot allow needs-product-approval.
    const hypotheticallyApproved: SignatureDualCapacityRule = {
      ...ADMINISTRATOR_DON_DUAL_CAPACITY_RULE,
      // Keep approvalStatus as needs-product-approval — product has not approved.
      approvalStatus: 'needs-product-approval',
    };
    const syntheticPolicy: SignaturePolicy = {
      ...QAPI_QUARTERLY_SIGNATURE_POLICY,
      allowedDualCapacitySignatures: [hypotheticallyApproved],
    };
    expect(
      resolveDualCapacityDecision(
        syntheticPolicy,
        'Administrator',
        'Clinical Manager',
        {
          dualCapacities: ['Administrator', 'Clinical Manager'],
          attestationEvidencePresent: true,
          dualCapacityRuleId: hypotheticallyApproved.ruleId,
        },
      ),
    ).toBe('deny');
  });

  it('allows dual-capacity only when rule is approved AND record shows both capacities with attestation', () => {
    const approvedRule: SignatureDualCapacityRule = {
      ruleId: 'dual-capacity-approved-test-only',
      primaryCapacity: 'Administrator',
      secondaryCapacity: 'Clinical Manager',
      allowedWhen: 'Test-only approved pairing with explicit attestation.',
      requiresExplicitAttestation: true,
      authorizingRoles: ['Governing Body'],
      approvalStatus: 'approved',
    };
    const policyWithApproved: SignaturePolicy = {
      ...QAPI_QUARTERLY_SIGNATURE_POLICY,
      allowedDualCapacitySignatures: [approvedRule],
    };

    // Approved but no attestation → deny.
    expect(
      resolveDualCapacityDecision(
        policyWithApproved,
        'Administrator',
        'Clinical Manager',
        {
          dualCapacities: ['Administrator', 'Clinical Manager'],
          attestationEvidencePresent: false,
        },
      ),
    ).toBe('deny');

    // Approved but record missing a capacity → deny.
    expect(
      resolveDualCapacityDecision(
        policyWithApproved,
        'Administrator',
        'Clinical Manager',
        {
          dualCapacities: ['Administrator', 'QAPI Chair'],
          attestationEvidencePresent: true,
        },
      ),
    ).toBe('deny');

    // Approved + both capacities + attestation → allow.
    expect(
      resolveDualCapacityDecision(
        policyWithApproved,
        'Administrator',
        'Clinical Manager',
        {
          dualCapacities: ['Administrator', 'Clinical Manager'],
          attestationEvidencePresent: true,
          dualCapacityRuleId: approvedRule.ruleId,
        },
      ),
    ).toBe('allow');
  });
});

describe('approval policies (FR-025)', () => {
  it('exposes FR-025 five actions and supports approve-with-documented-exception', () => {
    expect(FR025_APPROVAL_ACTIONS).toEqual([
      'Return for correction',
      'Approve content',
      'Approve with documented exception',
      'Reject',
      'Proceed to signer confirmation',
    ]);
    expect(APPROVAL_READINESS_ACTIONS).toEqual([
      'Return for correction',
      'Approve content',
      'Approve with documented exception',
      'Reject',
      'Proceed to signer confirmation',
    ]);

    for (const policy of APPROVAL_POLICIES) {
      expect(policy.allowedActions).toEqual([
        'Return for correction',
        'Approve content',
        'Approve with documented exception',
        'Reject',
        'Proceed to signer confirmation',
      ]);
      expect(canApproveWithDocumentedException(policy)).toBe(true);
    }

    expect(QAPI_QUARTERLY_APPROVAL_POLICY.supportsDocumentedException).toBe(true);
    expect(QAPI_QUARTERLY_APPROVAL_POLICY.requiredApproverRoles).toEqual([
      'Administrator',
      'Clinical Manager',
      'QAPI Chair',
    ]);
  });
});

describe('lock policies (FR-032, §28 #7)', () => {
  it('contains every FR-032 checklist item by exact id list and exact labels', () => {
    const ids = listLockChecklistItemIds(QAPI_QUARTERLY_LOCK_POLICY);
    const labels = listLockChecklistLabels(QAPI_QUARTERLY_LOCK_POLICY);

    // Hard-coded exact id list — fails if any id drifts.
    expect(ids).toEqual([...PRD_FR032_CHECKLIST_ITEM_IDS]);
    expect(ids).toEqual([
      'fr032-packet-identity',
      'fr032-reporting-period',
      'fr032-workflow',
      'fr032-version',
      'fr032-forms',
      'fr032-evidence',
      'fr032-approvals',
      'fr032-signatures',
      'fr032-authority',
      'fr032-confidentiality',
      'fr032-hashes',
      'fr032-drive-publication',
      'fr032-retention',
      'fr032-zero-unresolved-blockers',
    ]);

    expect(labels).toEqual([...PRD_FR032_CHECKLIST_LABELS]);
    expect(FR032_VERIFICATION_CHECKLIST.map((i) => i.itemId)).toEqual([
      ...PRD_FR032_CHECKLIST_ITEM_IDS,
    ]);
    expect(FR032_VERIFICATION_CHECKLIST).toHaveLength(14);

    for (const policy of LOCK_POLICIES) {
      expect(listLockChecklistItemIds(policy)).toEqual([
        ...PRD_FR032_CHECKLIST_ITEM_IDS,
      ]);
      expect(listLockChecklistLabels(policy)).toEqual([
        ...PRD_FR032_CHECKLIST_LABELS,
      ]);
      expect(policy.postLockEffects).toEqual([
        'Lock packet.',
        'Lock final form instances.',
        'Lock evidence manifest.',
        'Lock signature record.',
        'Prevent silent changes.',
        'Permit only amendment or supersession.',
      ]);
      expect(policy.requiresZeroUnresolvedBlockers).toBe(true);
      // Sanity: post-lock constant stays aligned with PRD bullets.
      expect(FR032_POST_LOCK_EFFECTS).toHaveLength(6);
    }
  });

  it('flags retention-rule placeholders as needs-product-approval (§28 #7)', () => {
    expect(RETENTION_RULE_PLACEHOLDERS.length).toBeGreaterThan(0);
    for (const placeholder of RETENTION_RULE_PLACEHOLDERS) {
      expect(placeholder.approvalStatus).toBe('needs-product-approval');
      expect(placeholder.retentionRule).toBeNull();
      expect(placeholder.openDecisionRef).toBe('§28 #7');
    }

    for (const policy of LOCK_POLICIES) {
      expect(policy.retentionRulePlaceholders.length).toBeGreaterThan(0);
      for (const placeholder of policy.retentionRulePlaceholders) {
        expect(placeholder.approvalStatus).toBe('needs-product-approval');
        expect(placeholder.retentionRule).toBeNull();
      }
    }
  });
});

describe('confidentiality policies (§13.4, §20.2)', () => {
  it('personnel addendum allowlist matches exact PRD §20.2 set', () => {
    expect(PERSONNEL_ADDENDUM_CONFIDENTIALITY_RULE.separateAddendum).toBe(true);
    expect(PERSONNEL_ADDENDUM_CONFIDENTIALITY_RULE.redactFromGeneralPacket).toBe(
      true,
    );

    // Hard-coded PRD §20.2 allowlist — not a circular constant compare only.
    expect([...PERSONNEL_ADDENDUM_ALLOWED_GENERAL_PACKET_FIELDS]).toEqual([
      'addendum id',
      'sha256',
      'classification',
      'custodian',
      'authorized reviewer',
      'review status',
      'related finding ids',
      'restricted workflow-instance ids',
    ]);
    expect([...PERSONNEL_ADDENDUM_ALLOWED_GENERAL_PACKET_FIELDS]).toEqual([
      ...PRD_SECTION_20_2_ALLOWLIST,
    ]);
    expect(
      PERSONNEL_CONFIDENTIALITY_POLICY.personnelAddendumAllowedGeneralPacketFields,
    ).toEqual([...PRD_SECTION_20_2_ALLOWLIST]);
  });

  it('assertNoConfidentialLeak permits exact §20.2 fields and rejects everything else', () => {
    // Canonical allowlist ids — must pass.
    expect(() =>
      assertNoConfidentialLeak([...PRD_SECTION_20_2_ALLOWLIST]),
    ).not.toThrow();

    // PRD display labels — must also pass (exact §20.2 bullet vocabulary).
    expect(() =>
      assertNoConfidentialLeak([
        'Addendum ID',
        'SHA-256',
        'Classification',
        'Custodian',
        'Authorized reviewer',
        'Review status',
        'Related finding IDs',
        'Restricted workflow-instance IDs',
      ]),
    ).not.toThrow();

    // Disallowed PHI / personnel detail fields — must fail.
    expect(() =>
      assertNoConfidentialLeak(['employeeName', 'allegation']),
    ).toThrow(ConfidentialLeakError);

    expect(() =>
      assertNoConfidentialLeak(['addendumId', 'authorizedReviewer']),
    ).toThrow(ConfidentialLeakError);

    try {
      assertNoConfidentialLeak(['sha256', 'staffDiscipline']);
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ConfidentialLeakError);
      expect((err as ConfidentialLeakError).leakedFields).toEqual([
        'staffDiscipline',
      ]);
      expect((err as ConfidentialLeakError).code).toBe('CONFIDENTIAL_LEAK');
    }
  });

  it('rejects non-canonical §20.2 aliases (singular / no-hyphen)', () => {
    // These three strings must NEVER normalize into the allowlist.
    const nonCanonicalAliases = [
      'related finding id',
      'restricted workflow instance ids',
      'restricted workflow-instance id',
    ] as const;

    for (const alias of nonCanonicalAliases) {
      expect(() => assertNoConfidentialLeak([alias])).toThrow(
        ConfidentialLeakError,
      );
    }

    try {
      assertNoConfidentialLeak([...nonCanonicalAliases]);
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ConfidentialLeakError);
      expect((err as ConfidentialLeakError).leakedFields).toEqual([
        'related finding id',
        'restricted workflow instance ids',
        'restricted workflow-instance id',
      ]);
    }

    // Mixed with a permitted field: only the aliases leak.
    try {
      assertNoConfidentialLeak([
        'sha256',
        'related finding id',
        'restricted workflow instance ids',
        'restricted workflow-instance id',
      ]);
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ConfidentialLeakError);
      expect((err as ConfidentialLeakError).leakedFields).toEqual([
        'related finding id',
        'restricted workflow instance ids',
        'restricted workflow-instance id',
      ]);
    }
  });
});

describe('drive destinations (§19.4)', () => {
  const fullBindings = {
    year: '2026',
    domain: 'QAPI',
    event_family_id: 'QA-WF-03',
    reporting_period: '2026-Q1',
    event_instance_id: 'evt-q1-001',
    packet_instance_id: 'pkt-q1-001',
    packet_version: '1',
  };

  it('throws a typed error on any missing binding (no silent substitution)', () => {
    expect(() =>
      resolveDriveDestination(COMPLIANCE_PACKETS_DRIVE_TEMPLATE, {
        ...fullBindings,
        domain: undefined,
      }),
    ).toThrow(MissingDriveBindingError);

    expect(() =>
      resolveDriveDestination(COMPLIANCE_PACKETS_DRIVE_TEMPLATE, {
        ...fullBindings,
        packet_version: '',
      }),
    ).toThrow(MissingDriveBindingError);

    expect(() =>
      resolveDriveDestination(COMPLIANCE_PACKETS_DRIVE_TEMPLATE, {
        ...fullBindings,
        year: '   ',
      }),
    ).toThrow(MissingDriveBindingError);

    try {
      resolveDriveDestination(COMPLIANCE_PACKETS_DRIVE_TEMPLATE, {
        year: '2026',
      });
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(MissingDriveBindingError);
      const missing = (err as MissingDriveBindingError).missingBindings;
      expect(missing).toContain('domain');
      expect(missing).toContain('event_family_id');
      expect(missing).toContain('packet_version');
      expect((err as MissingDriveBindingError).code).toBe('MISSING_DRIVE_BINDING');
    }
  });

  it('produces the exact §19.4 path for a full binding set', () => {
    const path = resolveDriveDestination(
      COMPLIANCE_PACKETS_DRIVE_TEMPLATE,
      fullBindings,
    );
    expect(path).toBe(
      'Care Indeed Home Health/Compliance Packets/2026/QAPI/QA-WF-03/2026-Q1/evt-q1-001/pkt-q1-001/v1',
    );
  });

  it('accepts numeric packet_version without inventing a default', () => {
    const path = resolveDriveDestination(COMPLIANCE_PACKETS_DRIVE_TEMPLATE, {
      ...fullBindings,
      packet_version: 3,
    });
    expect(path.endsWith('/v3')).toBe(true);
  });
});

describe('unresolved §28 items remain visible (not silently enabled)', () => {
  it('dual-capacity §28 #4 and retention §28 #7 carry needs-product-approval', () => {
    expect(ADMINISTRATOR_DON_DUAL_CAPACITY_RULE.approvalStatus).toBe(
      'needs-product-approval',
    );
    expect(
      RETENTION_RULE_PLACEHOLDERS.every(
        (r) => r.approvalStatus === 'needs-product-approval',
      ),
    ).toBe(true);
  });
});
