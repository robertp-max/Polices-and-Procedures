export type ControlRisk = 'HIGH' | 'MATERIAL' | 'LOW';

export type ControlStatus = 'active' | 'deficient' | 'unknown';

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
  | 'QAPI Program';

export interface MasterControlItem {
  id: number;
  controlName: string;
  description: string;
  category: MasterControlCategory;
  domain: string;
  sourcePolicyIds: string[];
  regulatoryBasis: string;
  requiredOwner: string;
  evidenceRequired: string;
  failureRisk: string;
  riskLevel: ControlRisk;
  highRiskIfMissing: boolean;
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

