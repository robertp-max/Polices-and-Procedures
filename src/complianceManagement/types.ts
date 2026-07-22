export type GateState = 'not_applicable' | 'not_started' | 'pending' | 'needs_review' | 'approved' | 'expired' | 'failed' | 'blocked' | 'waived_with_authority';

export interface VendorRequirement {
  key: string;
  label: string;
  status: 'required_missing' | 'pending_review' | 'current' | 'not_applicable';
  blocker: 'none' | 'activation' | 'critical';
  basis: string;
  policyRefs: string[];
  formRefs: string[];
}

export interface VendorRecord {
  id: string;
  legalName: string;
  dba?: string;
  category: string;
  serviceDescription: string;
  businessOwner: string;
  complianceOwner: string;
  lifecycleStatus: string;
  classification: Record<string, boolean>;
  decision: {
    businessAssociateStatus: 'required' | 'not_required' | 'review_required';
    serviceUnderArrangement: boolean | 'review_required';
    riskTier: 'low' | 'moderate' | 'high' | 'critical';
    requirements: VendorRequirement[];
    blockers: string[];
    rationale: string[];
  };
  nextReviewDate?: string;
  agreementExpirationDate?: string;
  openIncidents: number;
  openCorrectiveActions: number;
  version: number;
  updatedAt: string;
}

export interface ContractorRecord {
  id: string;
  legalName: string;
  preferredName?: string;
  email: string;
  engagementType: string;
  vendorId?: string;
  roleCode: string;
  discipline?: string;
  patientFacing: boolean;
  licensedRole: boolean;
  phiAccessRequired: boolean;
  drivingRequired: boolean;
  supervisorUserId?: string;
  startDate?: string;
  endDate?: string;
  renewalDate?: string;
  lifecycleStatus: string;
  classificationStatus: GateState;
  clearance: Record<string, GateState> & { overall: GateState };
  assignmentStatus: string;
  accessStatus: string;
  version: number;
  updatedAt: string;
}

export interface ContractorVendorStatus {
  vendorId: string;
  displayName: string;
  status: 'active' | 'restricted' | 'suspended' | 'terminated';
  masterAgreementStatus: 'active' | 'expiring' | 'expired' | 'not_required';
  baaStatus: 'active' | 'expiring' | 'expired' | 'not_required';
  insuranceStatus: 'current' | 'expiring' | 'expired' | 'not_required';
  eligibility: 'eligible' | 'blocked';
}
