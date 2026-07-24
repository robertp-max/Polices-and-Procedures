// Thin projection over the CANONICAL Forms Library for the Governing Body
// policy player. This file creates NO new form records, no second form
// corpus, and no duplicated schema — it only shapes the real
// getFormsForPolicy() result for the reading-room UI (route targets, an
// honest e-sign applicability flag, and a plain-language link reason).

import { getFormsForPolicy, POLICY_ACK_FORM_ID } from '@/policy/utils/policyFormLinks';
import { buildFormContent } from '@/policy/data/formsLibraryContent';
import type { FormRecord } from '@/policy/data/formsLibraryDataset';
import type { FormContent } from '@/policy/data/formsLibraryContent';

export interface PolicyFormProjection {
  record: FormRecord;
  content: FormContent;
  /** True when this form is on the policy's own canonical `policies` list. */
  directlyLinked: boolean;
  /** True only for the enterprise-wide acknowledgment form injected for every policy. */
  isUniversalAcknowledgment: boolean;
  /** Plain-language reason this form appears here — never fabricated, always derived from the canonical record. */
  linkReason: string;
  viewRoute: string;
  /** Non-null only when the form is a signed/attested record (e-sign applies). */
  esignRoute: string | null;
}

function deriveLinkReason(policyId: string, record: FormRecord): { directlyLinked: boolean; isUniversalAcknowledgment: boolean; reason: string } {
  const isAck = record.id === POLICY_ACK_FORM_ID;
  const directlyLinked = record.policies.includes(policyId);
  if (isAck && !directlyLinked) {
    return {
      directlyLinked: false,
      isUniversalAcknowledgment: true,
      reason: 'Required whenever any policy is assigned to your role — this is the enterprise Universal Policy Acknowledgment.',
    };
  }
  if (directlyLinked) {
    return {
      directlyLinked: true,
      isUniversalAcknowledgment: isAck,
      reason: `Listed against ${policyId} in the Forms Library.`,
    };
  }
  const sharedPolicies = record.policies.filter((p) => p !== policyId);
  return {
    directlyLinked: false,
    isUniversalAcknowledgment: false,
    reason: sharedPolicies.length
      ? `Linked to this policy's governance family (also filed under ${sharedPolicies.slice(0, 2).join(', ')}).`
      : 'Linked to this policy in the Forms Library.',
  };
}

/** A record counts as e-signable when it carries defined signer slots or is an attestation-type record. */
function deriveEsignRoute(record: FormRecord, content: FormContent): string | null {
  const hasSignerSlots = Boolean(content.signerSlots && content.signerSlots.length > 0);
  const isAttestationType = record.type === 'Attestation';
  return hasSignerSlots || isAttestationType ? `/forms/${record.id}/esign` : null;
}

export function getRelatedFormsForPolicy(policyId: string): PolicyFormProjection[] {
  return getFormsForPolicy(policyId).map((record) => {
    const content = buildFormContent(record);
    const { directlyLinked, isUniversalAcknowledgment, reason } = deriveLinkReason(policyId, record);
    return {
      record,
      content,
      directlyLinked,
      isUniversalAcknowledgment,
      linkReason: reason,
      viewRoute: `/forms/${record.id}`,
      esignRoute: deriveEsignRoute(record, content),
    };
  });
}
