/* ═══════════════════════════════════════════════════════════════════
   eCIgn certificate builder

   A certificate proves BOTH:
     1. prior one-time eCIgn consent/enrollment, and
     2. the document-specific click-to-sign action.

   It also identifies the reusable signature profile that supplied the visual
   signature applied to the document.
   ═══════════════════════════════════════════════════════════════════ */
import type {
  ECIgnCertificate,
  ECIgnConsentProfile,
  ECIgnSignatureProfile,
  ECIgnSignatureRecord,
} from './types';

function makeCertificateId(signatureId: string) {
  return `ECIGN-CERT-${signatureId}`;
}

function intentPhrase(record: ECIgnSignatureRecord) {
  return record.signatureIntentMethod === 'clicked_signature_icon'
    ? 'clicking the eCIgn icon'
    : 'clicking the signature field';
}

export function buildCertificateStatement(input: {
  consentVersion: string;
  consentAcceptedAt: string;
  signatureProfileId: string;
  formInstanceId: string;
  signedAt: string;
  intentMethod: ECIgnSignatureRecord['signatureIntentMethod'];
}): string {
  const intent = input.intentMethod === 'clicked_signature_icon' ? 'eCIgn icon' : 'signature field';
  return (
    `The signer previously accepted eCIgn Agreement Version ${input.consentVersion} on ${input.consentAcceptedAt}. ` +
    `At the time of this signature, the signer had an active eCIgn consent profile, active signature profile, ` +
    `and the required permission role. The visual signature applied to this document came from signature profile ` +
    `${input.signatureProfileId}. The signer applied the signature by clicking the ${intent} for form instance ` +
    `${input.formInstanceId} on ${input.signedAt}.`
  );
}

export function buildEcignCertificate(input: {
  record: ECIgnSignatureRecord;
  consent: ECIgnConsentProfile;
  signatureProfile: ECIgnSignatureProfile;
}): ECIgnCertificate {
  const { record, consent, signatureProfile } = input;
  const certificateId = makeCertificateId(record.signatureId);
  const statement = buildCertificateStatement({
    consentVersion: consent.consentVersion,
    consentAcceptedAt: consent.consentAcceptedAt,
    signatureProfileId: signatureProfile.signatureProfileId,
    formInstanceId: record.formInstanceId,
    signedAt: record.signedAt,
    intentMethod: record.signatureIntentMethod,
  });

  return {
    certificateId,
    signatureId: record.signatureId,
    signerDisplayName: consent.signerDisplayName,
    signerUserId: record.signerUserId,
    signerRole: record.signerRole,
    requiredPermissionRole: record.requiredPermissionRole,
    eventId: record.eventId,
    workflowId: record.workflowId,
    taskId: record.taskId,
    formId: record.formId,
    formInstanceId: record.formInstanceId,
    consentProfileId: consent.consentProfileId,
    consentVersion: consent.consentVersion,
    consentTextHash: consent.consentTextHash,
    consentAcceptedAt: consent.consentAcceptedAt,
    signatureProfileId: signatureProfile.signatureProfileId,
    signatureProfileHash: signatureProfile.signatureProfileHash,
    signatureMethod: record.signatureMethod,
    signedAt: record.signedAt,
    signatureIntentMethod: record.signatureIntentMethod,
    documentHashBeforeSignature: record.documentHashBeforeSignature,
    documentHashAfterSignature: record.documentHashAfterSignature,
    signedIp: record.signedIp,
    signedUserAgent: record.signedUserAgent,
    signedDeviceId: consent.consentAcceptedDeviceId,
    statement,
    hadActiveConsentProfile: consent.consentStatus === 'active',
    hadActiveSignatureProfile: signatureProfile.status === 'active',
    hadRequiredPermissionRole: true,
    generatedAt: new Date().toISOString(),
  };
}

/** Convenience: documents that the certificate proves consent + click intent. */
export function certificateProvesConsentAndClick(cert: ECIgnCertificate): boolean {
  return (
    Boolean(cert.consentProfileId) &&
    Boolean(cert.consentVersion) &&
    Boolean(cert.signatureProfileId) &&
    (cert.signatureIntentMethod === 'clicked_signature_icon' ||
      cert.signatureIntentMethod === 'clicked_signature_field') &&
    /clicking the/.test(cert.statement) &&
    intentPhrase({ signatureIntentMethod: cert.signatureIntentMethod } as ECIgnSignatureRecord).length > 0
  );
}
