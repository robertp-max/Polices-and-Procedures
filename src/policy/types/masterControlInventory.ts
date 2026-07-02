export type ControlRisk = 'HIGH' | 'MATERIAL' | 'LOW';

export type ControlStatus = 'active' | 'deficient' | 'unknown';
export type MasterControlSourceStatus = 'COMPLIANT' | 'AT_RISK' | 'DEFICIENT' | 'UNKNOWN' | 'NOT_CONFIGURED';
export type MasterControlReadinessStatus = 'OK' | 'NEEDS_ATTENTION' | 'BLOCKED' | 'DOCUMENTATION_MISSING' | 'NOT_CONFIGURED';
export type MasterControlCadence = 'per_admission' | 'monthly' | 'quarterly' | 'annual' | 'biennial' | 'triggered' | 'ongoing';
export type MasterControlDocumentType =
  | 'admission_packet'
  | 'admission_packet_section'
  | 'notice'
  | 'policy'
  | 'form'
  | 'log'
  | 'contract'
  | 'certificate'
  | 'inspection_record'
  | 'training_record'
  | 'other';

export type MasterControlDocumentationType =
  | 'admission_packet_section'
  | 'policy'
  | 'form'
  | 'notice'
  | 'log'
  | 'inspection_record'
  | 'inventory'
  | 'training_record'
  | 'contract'
  | 'attestation'
  | 'checklist'
  | 'other';

export type MasterControlCategory =
  | 'Patient Rights & Access'
  | 'Clinical Operations'
  | 'Safety & Risk Management'
  | 'Compliance & Regulatory'
  | 'Governance'
  | 'Workforce & HR'
  | 'IT & Security'
  | 'Financial / Billing'
  | 'Enterprise Policy & Records'
  | 'QAPI Program'
  | 'Emergency Preparedness / Infection Control'
  | 'Patient & Environmental Safety'
  | 'Staff Safety'
  | 'Facility & Administration'
  | 'Clinical Operations / Operations'
  | 'Clinical Operations / Safety'
  | 'Clinical Operations / Vendor Management';

export type MasterControlDocumentRef = {
  documentId: string;
  title: string;
  documentType: MasterControlDocumentType;
  sourceLocation: string;
  version?: string;
  effectiveDate?: string;
  ownerRole: string;
  required: boolean;
  templateOnly: boolean;
  evidenceUse: string;
};

export type MasterControlEvidenceRequirement = {
  evidenceId: string;
  label: string;
  description: string;
  acceptableEvidence: string[];
  unacceptableEvidence: string[];
  cadence: MasterControlCadence;
  requiredForReadiness: boolean;
  responsibleRole: string;
  dueRule: string;
  retentionRule: string;
};

export type MasterControlSignoffRequirement = {
  signoffId: string;
  role: string;
  signerLabel: string;
  cadence: MasterControlCadence;
  requiredForReadiness: boolean;
  attestationText: string;
};

export type MasterControlVerification = {
  frequency: string;
  triggerCondition: string;
  lastVerifiedDate?: string;
  nextVerificationDate?: string;
  escalationOwner: string;
  overdueRule: string;
  readinessFormula: string;
};

export type MasterControlAuditTrailEntry = {
  id: string;
  eventType: 'evidence_added' | 'signoff_completed' | 'status_changed' | 'verification_completed' | 'export_generated';
  summary: string;
  actorRole: string;
  occurredAt?: string;
};

export type MasterControlDocumentationSection = {
  sectionId: string;
  heading: string;
  body: string;
  bullets?: string[];
  table?: Array<Record<string, string>>;
};

export type MasterControlDocumentationRecord = {
  documentId: string;
  controlId: string;
  title: string;
  documentType: MasterControlDocumentationType;
  sourceLocation: string;
  templateOnly: boolean;
  version: string;
  effectiveDate: string;
  lastReviewedDate?: string;
  nextReviewDate?: string;
  ownerRole: string;
  approverRole?: string;
  linkedPolicyIds: string[];
  linkedWorkflowIds: string[];
  linkedControlIds: string[];
  body: MasterControlDocumentationSection[];
  requiredSignoffIds: string[];
  evidenceRequirementIds: string[];
  tags: string[];
};

export type MasterControlVerificationLogEntry = {
  logId: string;
  controlId: string;
  verificationPeriodStart: string;
  verificationPeriodEnd: string;
  performedByUserId?: string;
  performedByName: string;
  performedByRole: string;
  performedAt: string;
  verificationMethod:
    | 'document_review'
    | 'evidence_review'
    | 'sample_audit'
    | 'physical_inspection'
    | 'system_check'
    | 'interview'
    | 'combined';
  evidenceReviewed: Array<{
    evidenceId: string;
    title: string;
    status: 'accepted' | 'rejected' | 'missing' | 'expired' | 'needs_correction';
    notes?: string;
  }>;
  findingsSummary: string;
  deficienciesFound: Array<{
    deficiencyId: string;
    severity: 'low' | 'material' | 'high' | 'critical';
    description: string;
    correctiveActionRequired: boolean;
    correctiveActionId?: string;
    dueDate?: string;
  }>;
  readinessBefore: string;
  readinessAfter: string;
  nextDueDate: string;
  attestationText: string;
  signatureStatus: 'not_required' | 'pending' | 'signed' | 'rejected';
  signedByName?: string;
  signedByRole?: string;
  signedAt?: string;
  auditTrailId: string;
  immutableHash?: string;
};

export interface MasterControlItem {
  id: string;
  controlNumber: number;
  name: string;
  category: MasterControlCategory | string;
  domain: string;
  riskTier: ControlRisk;
  sourceStatus: MasterControlSourceStatus;
  readinessStatus: MasterControlReadinessStatus;
  sourcePolicyIds: string[];
  linkedWorkflowIds: string[];
  requiredFormIds: string[];
  documentRefs: MasterControlDocumentRef[];
  documentationRecords: MasterControlDocumentationRecord[];
  evidenceRequirements: MasterControlEvidenceRequirement[];
  signoffRequirements: MasterControlSignoffRequirement[];
  verification: MasterControlVerification;
  failureRisk: string;
  surveyorPrompt: string;
  operatorInstructions: string;
  modalSummary: string;
  tags: string[];
  auditTrail: MasterControlAuditTrailEntry[];
  verificationLogs: MasterControlVerificationLogEntry[];
  regulatoryBasis: string;
  requiredOwner: string;
  dataSource: MasterControlDataSource;
  systemModule: string;
  triggerCondition: string;
  escalationOwner: string;
  description: string;
  evidenceRequired: string;
  highRiskIfMissing: boolean;

  /** Compatibility aliases for existing CES projections. */
  numericId: number;
  controlName: string;
  riskLevel: ControlRisk;
  status: ControlStatus;
  notes?: string;
}

export interface MasterControlDataSource {
  system: string;
  forms_logs: string[];
}

export interface MasterControlSourceRecord {
  id: string;
  control_name: string;
  description: string;
  category: MasterControlCategory;
  domain: string;
  source_policy_ids: string[];
  regulatory_basis: string;
  required_owner: string;
  evidence_required: string;
  failure_risk: string;
  risk_level: 'H' | 'M' | 'L';
  status: 'UNKNOWN' | 'COMPLIANT' | 'AT_RISK' | 'NON_COMPLIANT' | 'UNDER_REVIEW';
  last_verified_date: string | null;
  next_verification_date: string | null;
  data_source: MasterControlDataSource;
  trigger_condition: string;
  escalation_owner: string;
  system_module: string;
}

export interface MasterControlSourcePayload {
  controls: MasterControlSourceRecord[];
}

