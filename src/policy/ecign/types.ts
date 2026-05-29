export type SignerRole =
  | 'Assigned Owner'
  | 'Scribe'
  | 'Data Analyst / Quality Source'
  | 'Clinical Manager'
  | 'Clinical Reviewer'
  | 'Director of Nursing'
  | 'QAPI Lead / Chair'
  | 'Compliance Officer'
  | 'Infection Preventionist'
  | 'Committee / Voting Members'
  | 'Administrator'
  | 'Administrator Designee'
  | 'Governing Body'
  | 'Governing Body Chair'
  | 'Board Chair'
  | 'HR'
  | 'Supervisor'
  | 'Employee'
  | 'Workforce Member'
  | 'Finance'
  | 'Finance / CFO'
  | 'Operations'
  | 'Operations Director'
  | 'IT / Security'
  | 'IT Director / CISO'
  | 'Risk Manager'
  | 'Domain Owner'
  | 'Requester'
  | 'Evidence / eCIgn System';

/**
 * eCIgn permission roles authorize a user to actually perform a signing /
 * review / approval action in the system. This is intentionally distinct from
 * the business/workflow `SignerRole`. A user may be assigned to a signer role
 * but must also hold the required permission role before they may execute.
 */
export type ECIgnPermissionRole =
  | 'eCIgner'
  | 'eCIgn Reviewer'
  | 'eCIgn Final Approver'
  | 'eCIgn Administrator'
  | 'eCIgn Witness'
  | 'eCIgn System';

export type SignatureRequirementStatus =
  | 'pending'
  | 'ready'
  | 'signed'
  | 'reviewed'
  | 'rejected'
  | 'not_required'
  | 'blocked';

export type SignatureRequirementSource =
  | 'form_signature'
  | 'workflow_approval'
  | 'event_approval'
  | 'generated';

export interface SignatureRequirement {
  signatureRequirementId: string;
  eventId: string;
  workflowId?: string;
  parentTaskId: string;
  formId?: string;
  formInstanceId?: string;
  signatureSlot: string;
  signerRole: SignerRole;
  /** System permission required before this requirement is actionable. */
  requiredPermissionRole: ECIgnPermissionRole;
  reviewerRole?: SignerRole;
  order: number;
  required: boolean;
  status: SignatureRequirementStatus;
  evidenceArtifactId?: string;
  source: SignatureRequirementSource;
}

export interface SignerHierarchyRule {
  domain: string;
  workflowIdPattern?: string;
  formIdPattern?: string;
  taskPurposePattern?: string;
  ownerRole: SignerRole;
  reviewerRoles: SignerRole[];
  signerRoles: SignerRole[];
  finalApproverRoles: SignerRole[];
  governingBodyRequired?: boolean;
}

export interface SignatureTaskRecord {
  taskId: string;
  parentTaskId: string;
  eventId: string;
  workflowId?: string;
  formId?: string;
  formInstanceId?: string;
  signatureSlot: string;
  signerRole: SignerRole;
  requiredPermissionRole: ECIgnPermissionRole;
  reviewerRole?: SignerRole;
  order: number;
  status: SignatureRequirementStatus;
  required: boolean;
}

export interface ResolvedSignaturePath {
  ownerRole: SignerRole;
  reviewerRoles: SignerRole[];
  signerRoles: SignerRole[];
  finalApproverRoles: SignerRole[];
  governingBodyRequired: boolean;
  signatureRequirements: SignatureRequirement[];
  signatureTasks: SignatureTaskRecord[];
  noSignatureRequired: boolean;
}

export interface SignatureResolverFormContext {
  formId: string;
  formInstanceId?: string;
}

export interface SignatureResolverApprovalContext {
  id: string;
  targetKind: 'event' | 'minutes' | 'report' | 'form';
  targetLabel: string;
  approverRole: string;
  required: boolean;
}

export interface SignatureResolverContext {
  domain?: string;
  workflowId?: string;
  eventId: string;
  parentTaskId: string;
  title: string;
  description?: string;
  ownerRole?: string;
  taskPurpose?: string;
  forms: SignatureResolverFormContext[];
  approvals?: SignatureResolverApprovalContext[];
  minutesSignOffRoles?: string[];
}

/* ═══════════════════════════════════════════════════════════════════
   Canonical one-time consent / reusable signature profile / document
   signature record / certificate models.

   These power one-time eCIgn enrollment, reusable signature profiles,
   one-click document signing, and certificate generation. They are
   intentionally decoupled from the per-document server signing lifecycle
   (see `api.ts` / `useEcignSession.ts`) so that consent + profile are
   captured ONCE and reused across documents.
   ═══════════════════════════════════════════════════════════════════ */

export type ECIgnConsentStatus = 'active' | 'revoked' | 'expired' | 'superseded';

export interface ECIgnConsentProfile {
  consentProfileId: string;
  userId: string;
  signerDisplayName: string;
  signerLegalName?: string;
  requiredPermissionRoles: ECIgnPermissionRole[];
  consentVersion: string;
  consentTextHash: string;
  consentAcceptedAt: string;
  consentAcceptedIp?: string;
  consentAcceptedUserAgent?: string;
  consentAcceptedDeviceId?: string;
  consentStatus: ECIgnConsentStatus;
  createdAt: string;
  updatedAt: string;
}

export type ECIgnSignatureMethod = 'drawn' | 'typed' | 'uploaded';
export type ECIgnSignatureProfileStatus = 'active' | 'revoked' | 'superseded';

export interface ECIgnSignatureProfile {
  signatureProfileId: string;
  userId: string;
  signerDisplayName: string;
  signerLegalName?: string;
  signatureImageDataUrl?: string;
  typedSignatureText?: string;
  initialsImageDataUrl?: string;
  typedInitialsText?: string;
  signatureProfileHash: string;
  signatureMethod: ECIgnSignatureMethod;
  initialsMethod?: ECIgnSignatureMethod;
  consentProfileId: string;
  consentVersion: string;
  status: ECIgnSignatureProfileStatus;
  createdAt: string;
  updatedAt: string;
}

export type ECIgnSignatureIntentMethod = 'clicked_signature_icon' | 'clicked_signature_field';
export type ECIgnSignatureRecordStatus = 'signed' | 'rejected' | 'voided';

export interface ECIgnSignatureRecord {
  signatureId: string;
  eventId?: string;
  workflowId?: string;
  taskId: string;
  formId: string;
  formInstanceId: string;
  signatureRequirementId?: string;
  signatureSlot?: string;
  signerUserId: string;
  signerRole: SignerRole;
  requiredPermissionRole: ECIgnPermissionRole;
  consentProfileId: string;
  consentVersion: string;
  consentTextHash: string;
  signatureProfileId: string;
  signatureProfileHash: string;
  signatureMethod: ECIgnSignatureMethod;
  signedAt: string;
  signedIp?: string;
  signedUserAgent?: string;
  signatureIntentMethod: ECIgnSignatureIntentMethod;
  documentHashBeforeSignature?: string;
  documentHashAfterSignature?: string;
  certificateId?: string;
  status: ECIgnSignatureRecordStatus;
}

export interface ECIgnCertificate {
  certificateId: string;
  signatureId: string;
  signerDisplayName: string;
  signerUserId: string;
  signerRole: SignerRole;
  requiredPermissionRole: ECIgnPermissionRole;
  eventId?: string;
  workflowId?: string;
  taskId: string;
  formId: string;
  formInstanceId: string;
  consentProfileId: string;
  consentVersion: string;
  consentTextHash: string;
  consentAcceptedAt: string;
  signatureProfileId: string;
  signatureProfileHash: string;
  signatureMethod: ECIgnSignatureMethod;
  signedAt: string;
  signatureIntentMethod: ECIgnSignatureIntentMethod;
  documentHashBeforeSignature?: string;
  documentHashAfterSignature?: string;
  signedIp?: string;
  signedUserAgent?: string;
  signedDeviceId?: string;
  /** Human-readable canonical certificate statement. */
  statement: string;
  hadActiveConsentProfile: boolean;
  hadActiveSignatureProfile: boolean;
  hadRequiredPermissionRole: boolean;
  generatedAt: string;
}

/** Reason codes returned when a signature action is blocked. */
export type ECIgnSignBlockReason =
  | 'not_authenticated'
  | 'no_signer_task'
  | 'missing_permission'
  | 'no_consent_profile'
  | 'consent_version_changed'
  | 'no_signature_profile'
  | 'missing_form_instance'
  | 'missing_event_context'
  | 'template_mode'
  | 'not_required';

export interface ECIgnSignReadiness {
  canSign: boolean;
  /** True when first-time setup (or re-enrollment) is required. */
  needsSetup: boolean;
  blockReason?: ECIgnSignBlockReason;
  message: string;
}
