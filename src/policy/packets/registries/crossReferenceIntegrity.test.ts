/**
 * Cross-registry integrity tests for packet archetypes, policies, templates,
 * and selector-boundary status normalization.
 */
import { describe, expect, it } from 'vitest';

import type { PacketLifecycleStatus } from '@/policy/packets/contracts';
import { projectEventCardModel } from '@/v6/screens/packets/eventSelector/eventCardModel';
import { ALL_ARCHETYPES, getArchetype, hasArchetype } from './archetypeRegistry';
import {
  getApprovalPolicy,
  QAPI_QUARTERLY_APPROVAL_POLICY_ID,
} from './approvalPolicies';
import { getLockPolicy, QAPI_QUARTERLY_LOCK_POLICY_ID } from './lockPolicies';
import { getSignaturePolicy, QAPI_QUARTERLY_SIGNATURE_POLICY_ID } from './signaturePolicies';
import { PACKET_TEMPLATES } from './templateRegistry';

const QAPI_POLICY_ROLES = [
  'Administrator',
  'Clinical Manager',
  'QAPI Chair',
] as const;

function expectSubset(
  actual: readonly string[],
  allowed: ReadonlySet<string>,
  context: string,
): void {
  const unknown = actual.filter((role) => !allowed.has(role));
  expect(unknown, context).toEqual([]);
}

describe('packet registry cross-reference integrity', () => {
  it('resolves every archetype policy reference through its policy registry', () => {
    for (const archetype of ALL_ARCHETYPES) {
      expect(
        getSignaturePolicy(archetype.signaturePolicyId),
        `${archetype.archetypeId} signaturePolicyId=${archetype.signaturePolicyId}`,
      ).toBeDefined();
      expect(
        getApprovalPolicy(archetype.approvalPolicyId),
        `${archetype.archetypeId} approvalPolicyId=${archetype.approvalPolicyId}`,
      ).toBeDefined();
      expect(
        getLockPolicy(archetype.lockPolicyId),
        `${archetype.archetypeId} lockPolicyId=${archetype.lockPolicyId}`,
      ).toBeDefined();
    }
  });

  it('keeps every template aligned to its archetype and governed policy roles', () => {
    for (const template of PACKET_TEMPLATES) {
      expect(hasArchetype(template.packet_archetype_id)).toBe(true);
      const archetype = getArchetype(template.packet_archetype_id);
      const approvalPolicy = getApprovalPolicy(archetype.approvalPolicyId);
      const signaturePolicy = getSignaturePolicy(archetype.signaturePolicyId);

      expect(approvalPolicy).toBeDefined();
      expect(signaturePolicy).toBeDefined();

      const approverRoles = new Set(approvalPolicy!.requiredApproverRoles);
      const signerRoles = new Set(
        signaturePolicy!.requiredCapacities.map((row) => row.capacity),
      );

      expectSubset(
        template.required_approvers,
        approverRoles,
        `${template.packet_template_id} required_approvers`,
      );
      expectSubset(
        template.required_signers,
        signerRoles,
        `${template.packet_template_id} required_signers`,
      );
    }
  });

  it('keeps QAPI templates, archetype policy ids, and policy roles in agreement', () => {
    const archetype = getArchetype('analytical-report');
    expect(archetype.signaturePolicyId).toBe(QAPI_QUARTERLY_SIGNATURE_POLICY_ID);
    expect(archetype.approvalPolicyId).toBe(QAPI_QUARTERLY_APPROVAL_POLICY_ID);
    expect(archetype.lockPolicyId).toBe(QAPI_QUARTERLY_LOCK_POLICY_ID);

    const approvalPolicy = getApprovalPolicy(archetype.approvalPolicyId);
    const signaturePolicy = getSignaturePolicy(archetype.signaturePolicyId);
    expect(approvalPolicy!.requiredApproverRoles).toEqual([...QAPI_POLICY_ROLES]);
    expect(signaturePolicy!.requiredCapacities.map((row) => row.capacity)).toEqual(
      [...QAPI_POLICY_ROLES],
    );

    const qapiTemplates = PACKET_TEMPLATES.filter(
      (template) => template.packet_archetype_id === 'analytical-report',
    );
    expect(qapiTemplates.length).toBeGreaterThan(0);
    for (const template of qapiTemplates) {
      expect(template.required_approvers).toEqual([...QAPI_POLICY_ROLES]);
      expect(template.required_signers).toEqual([...QAPI_POLICY_ROLES]);
    }
  });
});

describe('event selector packet-status boundary', () => {
  it('drops provider packet statuses outside the closed lifecycle vocabulary', () => {
    const card = projectEventCardModel({
      calendarEvent: {
        id: 'evt-unknown-status',
        label: 'Unknown status event',
        day: 1,
        month: 1,
        owner: 'Compliance',
        progress: 0,
        tone: 'teal',
        sourceDate: '2026-01-01',
      },
      packetStatus: {
        packetStatus: 'NOT_A_PACKET_STATUS' as unknown as PacketLifecycleStatus,
      },
    });

    expect(card.packetStatus).toBe('unknown');
  });
});
