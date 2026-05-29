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
