/* ═══════════════════════════════════════════════════════════════════
   eCIgn one-click signing orchestration

   `evaluateSignReadiness` performs every gate check (auth, signer task,
   permission, consent, consent version, signature profile, form instance,
   event context, template mode) WITHOUT side effects.

   `applyOneClickSignature` re-runs the gates and, only when every gate passes,
   creates a document-specific signature record + certificate. It never creates
   form instances or signer tasks, and never auto-consents.
   ═══════════════════════════════════════════════════════════════════ */
import type {
  ECIgnPermissionRole,
  ECIgnSignReadiness,
  ECIgnSignatureIntentMethod,
  ECIgnSignatureRecord,
  SignerRole,
} from './types';
import { ECIGN_AGREEMENT_VERSION } from './ecignAgreement';
import { permissionSatisfies } from './permissionRoles';
import { useEcignConsentStore } from './ecignConsentStore';
import { useEcignSignatureProfileStore } from './ecignSignatureProfileStore';
import { buildSignatureRecordId, useEcignSignatureRecordStore } from './ecignSignatureRecordStore';
import { buildEcignCertificate } from './ecignCertificateBuilder';

export interface SigningSigner {
  userId: string;
  displayName: string;
  /** eCIgn permission roles the user currently holds. */
  permissionRoles: ECIgnPermissionRole[];
}

export interface SigningContext {
  /** false ⇒ not authenticated. */
  authenticated: boolean;
  signer: SigningSigner | null;
  /** A signer task / requirement must already exist before signing. */
  hasSignerTask: boolean;
  signerRole: SignerRole;
  requiredPermissionRole: ECIgnPermissionRole;
  taskId: string;
  formId: string;
  formInstanceId?: string;
  eventId?: string;
  workflowId?: string;
  signatureSlot?: string;
  signatureRequirementId?: string;
  /** template mode is preview-only; signing is never allowed. */
  mode: 'template' | 'event_execution';
}

export function evaluateSignReadiness(ctx: SigningContext): ECIgnSignReadiness {
  if (ctx.mode === 'template') {
    return { canSign: false, needsSetup: false, blockReason: 'template_mode', message: 'Template signatures are preview-only. Signing is available only on event form instances.' };
  }
  if (!ctx.authenticated || !ctx.signer) {
    return { canSign: false, needsSetup: false, blockReason: 'not_authenticated', message: 'Sign in is required before signing.' };
  }
  if (!ctx.hasSignerTask) {
    return { canSign: false, needsSetup: false, blockReason: 'no_signer_task', message: 'No assigned signer task exists for this signature requirement.' };
  }
  if (!permissionSatisfies(ctx.signer.permissionRoles, ctx.requiredPermissionRole)) {
    return {
      canSign: false,
      needsSetup: false,
      blockReason: 'missing_permission',
      message: `Missing ${ctx.requiredPermissionRole} permission role. This user cannot sign this signature requirement.`,
    };
  }

  const userId = ctx.signer.userId;
  const consent = useEcignConsentStore.getState().getActiveConsent(userId);
  if (!consent) {
    return { canSign: false, needsSetup: true, blockReason: 'no_consent_profile', message: 'eCIgn setup required before signing.' };
  }
  if (consent.consentVersion !== ECIGN_AGREEMENT_VERSION) {
    return { canSign: false, needsSetup: true, blockReason: 'consent_version_changed', message: 'Updated eCIgn agreement requires review before signing.' };
  }
  const signatureProfile = useEcignSignatureProfileStore.getState().getActiveProfile(userId);
  if (!signatureProfile) {
    return { canSign: false, needsSetup: true, blockReason: 'no_signature_profile', message: 'eCIgn signature profile required before signing.' };
  }
  if (!ctx.formInstanceId) {
    return { canSign: false, needsSetup: false, blockReason: 'missing_form_instance', message: 'Form instance must exist before signing. eCIgn never creates a form instance from a signature click.' };
  }
  if (!ctx.eventId) {
    return { canSign: false, needsSetup: false, blockReason: 'missing_event_context', message: 'Event/task context is required to sign in event execution mode.' };
  }
  return { canSign: true, needsSetup: false, message: 'Ready to sign.' };
}

export interface ApplySignatureInput extends SigningContext {
  intentMethod: ECIgnSignatureIntentMethod;
  documentHashBeforeSignature?: string;
  documentHashAfterSignature?: string;
  signedIp?: string;
  signedUserAgent?: string;
}

export interface ApplySignatureResult {
  ok: boolean;
  readiness: ECIgnSignReadiness;
  signatureId?: string;
  certificateId?: string;
}

/**
 * Applies the stored signature to a specific form instance after an explicit
 * user click. Returns the created record + certificate ids on success.
 */
export function applyOneClickSignature(input: ApplySignatureInput): ApplySignatureResult {
  const readiness = evaluateSignReadiness(input);
  if (!readiness.canSign || !input.signer || !input.formInstanceId) {
    return { ok: false, readiness };
  }

  const userId = input.signer.userId;
  const consent = useEcignConsentStore.getState().getActiveConsent(userId);
  const signatureProfile = useEcignSignatureProfileStore.getState().getActiveProfile(userId);
  if (!consent || !signatureProfile) {
    return { ok: false, readiness: { canSign: false, needsSetup: true, blockReason: 'no_consent_profile', message: 'eCIgn setup required before signing.' } };
  }

  const signatureId = buildSignatureRecordId({
    taskId: input.taskId,
    formInstanceId: input.formInstanceId,
    signatureSlot: input.signatureSlot,
    signerUserId: userId,
  });

  const record: ECIgnSignatureRecord = {
    signatureId,
    eventId: input.eventId,
    workflowId: input.workflowId,
    taskId: input.taskId,
    formId: input.formId,
    formInstanceId: input.formInstanceId,
    signatureRequirementId: input.signatureRequirementId,
    signatureSlot: input.signatureSlot,
    signerUserId: userId,
    signerRole: input.signerRole,
    requiredPermissionRole: input.requiredPermissionRole,
    consentProfileId: consent.consentProfileId,
    consentVersion: consent.consentVersion,
    consentTextHash: consent.consentTextHash,
    signatureProfileId: signatureProfile.signatureProfileId,
    signatureProfileHash: signatureProfile.signatureProfileHash,
    signatureMethod: signatureProfile.signatureMethod,
    signedAt: new Date().toISOString(),
    signedIp: input.signedIp,
    signedUserAgent: input.signedUserAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
    signatureIntentMethod: input.intentMethod,
    documentHashBeforeSignature: input.documentHashBeforeSignature,
    documentHashAfterSignature: input.documentHashAfterSignature,
    status: 'signed',
  };

  const certificate = buildEcignCertificate({ record, consent, signatureProfile });
  record.certificateId = certificate.certificateId;

  useEcignSignatureRecordStore.getState().upsertSignature(record, certificate);

  return { ok: true, readiness, signatureId: record.signatureId, certificateId: certificate.certificateId };
}
