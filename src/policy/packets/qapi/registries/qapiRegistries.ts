/**
 * QAPI Durable Registries — Slice 1
 *
 * System-of-record shapes that replace dump-as-SoT.
 * Packet Studio generate path pulls these by reporting period
 * instead of requiring a fresh free-text dump every time.
 *
 * Target: src/policy/packets/qapi/registries/qapiRegistries.ts
 */

export type IsoDate = string;
export type IsoDateTime = string;
export type Sha256Hex = string;
export type SourceClassification = 'production' | 'synthetic' | 'uat';
export type PhiClass =
  | 'NONE' | 'INTERNAL' | 'PII' | 'PHI'
  | 'RESTRICTED_PERSONNEL' | 'LEGAL_PRIVILEGED' | 'SYNTHETIC';

/** Common stamp on every durable row */
export interface RecordStamp {
  agency_id: string;
  site_id?: string;
  reporting_period_id: string;
  period_start: IsoDate;
  period_end: IsoDate;
  source_artifact_id?: string;
  created_at: IsoDateTime;
  created_by: string;
  updated_at: IsoDateTime;
  updated_by?: string;
  record_version: number;
  integrity_sha256: string;
  source_classification: SourceClassification;
  deleted: false;
}

// ─── Complaint / Grievance (P0) ──────────────────────────────────────────────

export type CaseClass =
  | 'informal_complaint'
  | 'formal_grievance'
  | 'abuse_neglect_exploitation'
  | 'patient_rights_grievance'
  | 'compliance_hotline'
  | 'privacy_complaint'
  | 'billing_complaint'
  | 'clinical_incident'
  | 'patient_safety_event'
  | 'employee_grievance';

export type ComplaintCaseStatus =
  | 'RECEIVED' | 'TRIAGED' | 'ACKNOWLEDGED' | 'UNDER_REVIEW'
  | 'RESPONSE_PENDING' | 'RESOLVED' | 'CLOSED'
  | 'ESCALATED' | 'OVERDUE' | 'REOPENED' | 'REFERRED';

export interface ComplaintCase extends RecordStamp {
  complaint_id: string;
  case_class: CaseClass;
  category: string;
  subcategory?: string;
  received_at: IsoDateTime;
  occurrence_at?: IsoDateTime;
  intake_channel: string;
  received_by: string;
  complainant_relationship?: string;
  patient_id_restricted?: string;
  episode_id_restricted?: string;
  narrative_restricted: string;
  packet_summary_deid: string;
  allegation_safety_indicators: string[];
  immediate_risk: boolean;
  ane_screening: 'positive' | 'negative' | 'unknown';
  mandatory_reporting?: { required: boolean; report_ids?: string[] };
  assigned_owner?: string;
  status: ComplaintCaseStatus;
  resolution_at?: IsoDateTime;
  resolution_business_days?: number | null;
  disposition?: string;
  communications: Array<{ at: IsoDateTime; channel: string; summary_deid: string }>;
  linked_adverse_event_id?: string;
  linked_rca_id?: string;
  linked_cap_id?: string;
  linked_pip_trigger_id?: string;
  linked_pip_id?: string;
  linked_action_item_id?: string;
  classification_history: Array<{
    at: IsoDateTime;
    by: string;
    from?: CaseClass;
    to: CaseClass;
    reason: string;
  }>;
  phiClass: 'PHI' | 'RESTRICTED_PERSONNEL';
}

export interface ZeroComplaintAttestation {
  reporting_period_id: string;
  agency_id: string;
  queried_at: IsoDateTime;
  register_version: string;
  result: 'VERIFIED_ZERO';
  attested_by: string;
  integrity_sha256: Sha256Hex;
}

export interface MissingComplaintSourceFinding {
  reporting_period_id: string;
  code: 'MISSING_SOURCE';
  blocking: true;
  message: string;
}

// ─── Feeder Audit (B5) ───────────────────────────────────────────────────────

export type FeederAuditDomain =
  | 'clinical' | 'compliance' | 'qapi' | 'hr' | 'risk' | 'it';

export interface FeederAudit extends RecordStamp {
  audit_id: string;
  workflow_id: string;
  domain: FeederAuditDomain;
  audit_name: string;
  sample_size?: number;
  sample_unit?: string;
  result?: string | number;
  findings_count: number;
  status: 'COMPLETE' | 'COMPLETE_TARGET_MET' | 'COMPLETE_CAP_PIP' | 'COMPLETE_FOLLOW_UP' | 'OPEN';
  signed_by: string;
  signed_at: IsoDateTime;
  source_pointer: string;
  findings_summary_deid?: string;
  phiClass: 'INTERNAL' | 'PHI';
}

// ─── Adverse Event + RCA ─────────────────────────────────────────────────────

export interface AdverseEvent extends RecordStamp {
  event_id: string;
  patient_id_restricted?: string;
  event_type: string;
  event_date: IsoDate;
  severity?: string;
  disposition?: string;
  rca_required: boolean;
  rca_id?: string;
  rca_status?: 'Open' | 'Completed' | 'Not Required';
  unreported: boolean;
  notes_deid?: string;
  clinician_id?: string;
  phiClass: 'PHI';
}

export interface RootCauseAnalysis extends RecordStamp {
  rca_id: string;
  event_id: string;
  status: 'Open' | 'Completed' | 'Pending Owner';
  findings_deid?: string;
  preventive_actions?: string[];
  owner?: string;
  completed_at?: IsoDateTime;
  phiClass: 'PHI';
}

// ─── Infection ───────────────────────────────────────────────────────────────

export interface InfectionCase extends RecordStamp {
  infection_id: string;
  patient_id_restricted?: string;
  infection_type: string;
  classification: 'Healthcare-associated (HAI)' | 'Community-acquired' | 'Suspected';
  onset_date: IsoDate;
  resolution_date?: IsoDate;
  reported_to_state: boolean;
  cluster_flag?: string;
  notes_deid?: string;
  clinician_id?: string;
  status: 'Open' | 'Resolved' | 'Ongoing';
  phiClass: 'PHI';
}

// ─── PIP / Trigger / CAP / Action ────────────────────────────────────────────

export interface PipTrigger extends RecordStamp {
  trigger_id: string;
  trigger_type: string;
  source_indicator: string;
  state:
    | 'PENDING_AUTHORIZED_REVIEW'
    | 'TRIGGERED'
    | 'MONITOR'
    | 'CLOSED'
    | 'REJECTED';
  observed_value?: number | string | null;
  threshold?: number | string | null;
  linked_pip_id?: string;
  dependency?: string;
  source_record_ids: string[];
  determination?: string;
  phiClass: 'INTERNAL';
}

export interface PipMaster extends RecordStamp {
  pip_id: string;
  trigger_source?: string;
  trigger_indicator: string;
  trigger_date: IsoDate;
  status: string;
  owner: string;
  remeasurement_date?: IsoDate;
  baseline?: number | string | null;
  current?: number | string | null;
  goal?: number | string | null;
  interventions?: string[];
  phiClass: 'INTERNAL';
}

export interface CorrectiveActionPlan extends RecordStamp {
  cap_id: string;
  finding: string;
  corrective_actions: string[];
  owner: string;
  opened_at: IsoDate;
  due_at: IsoDate;
  status: 'OPEN' | 'OPEN_ON_TRACK' | 'OPEN_EFFECTIVE' | 'CLOSED';
  linked_record_ids?: string[];
  evidence?: string;
  phiClass: 'INTERNAL';
}

export interface CommitteeActionItem extends RecordStamp {
  action_id: string;
  action: string;
  owner: string;
  due?: IsoDate;
  status: 'OPEN' | 'RESOLVED' | 'OVERDUE';
  closure_evidence?: string;
  linked_record?: string;
  source_basis?: string;
  phiClass: 'INTERNAL';
}

// ─── Population / Visits ─────────────────────────────────────────────────────

export interface PopulationSnapshot extends RecordStamp {
  snapshot_id: string;
  patients_in_scope: number | null;
  active_census: number | null;
  high_acuity?: number | null;
  new_soc?: number | null;
  recertifications?: number | null;
  resumptions_of_care?: number | null;
  discharges?: number | null;
  transfers_to_inpatient?: number | null;
  payer_mix?: string;
  service_areas?: string[];
  oasis_cms485_records?: number | null;
  phiClass: 'INTERNAL';
}

export interface VisitUtilizationMonth extends RecordStamp {
  month: string;
  scheduled_visits: number | null;
  completed_visits: number | null;
  missed_visits: number | null;
  missed_visit_rate?: number | null;
  compliance?: number | null;
  phiClass: 'INTERNAL';
}

// ─── Meeting ─────────────────────────────────────────────────────────────────

export interface MeetingAttendance extends RecordStamp {
  meeting_id: string;
  meeting_date: IsoDate;
  role: string;
  name_or_clinician_id: string;
  capacity?: string;
  presence: 'Present' | 'Absent' | 'Excused';
  quorum_note?: string;
  phiClass: 'PII';
}

export interface MeetingMotion extends RecordStamp {
  motion_id: string;
  meeting_id: string;
  description: string;
  moved_by: string;
  seconded_by?: string;
  vote_for?: number;
  vote_against?: number;
  vote_abstain?: number;
  result: 'APPROVED' | 'REJECTED' | 'DEFERRED' | 'TABLED';
  decision_note?: string;
  phiClass: 'INTERNAL';
}

// ─── KPI Observation ─────────────────────────────────────────────────────────

export interface KpiObservation extends RecordStamp {
  metric_id: string;
  indicator: string;
  month: string;
  numerator: number | null;
  denominator: number | null;
  rate: number | null;
  target?: number | string | null;
  threshold?: string;
  status: 'MET' | 'NOT_MET' | 'WATCH' | 'UNKNOWN' | 'CRITICAL';
  trend?: string;
  confidence?: 'High' | 'Medium' | 'Low';
  source_record_ids?: string[];
  phiClass: 'INTERNAL';
}

// ─── Source Register ─────────────────────────────────────────────────────────

export interface SourceRegisterEntry extends RecordStamp {
  source_label: string;
  filename_or_ref: string;
  class: string;
  location: string;
  period: 'quarter' | 'post-period' | 'current-policy';
  use: string;
  purpose: string;
  disposition?: 'included' | 'excluded' | 'duplicate' | 'unreadable';
  sha256?: Sha256Hex;
  phiClass: 'INTERNAL';
}

// ─── Aggregate pull shape for Packet Studio ──────────────────────────────────

export interface QapiPeriodRegistries {
  reporting_period_id: string;
  period_start: IsoDate;
  period_end: IsoDate;
  agency_id: string;

  population?: PopulationSnapshot;
  visit_utilization: VisitUtilizationMonth[];
  kpi_observations: KpiObservation[];
  feeder_audits: FeederAudit[];
  adverse_events: AdverseEvent[];
  rcas: RootCauseAnalysis[];
  infections: InfectionCase[];
  complaints: ComplaintCase[];
  zero_complaint_attestation?: ZeroComplaintAttestation;
  pip_triggers: PipTrigger[];
  pips: PipMaster[];
  caps: CorrectiveActionPlan[];
  action_items: CommitteeActionItem[];
  attendance: MeetingAttendance[];
  motions: MeetingMotion[];
  source_register: SourceRegisterEntry[];

  completeness: {
    feeder_audits_complete: boolean;
    complaints_source_present: boolean;
    population_reconciled: boolean;
    required_signers_present: boolean;
    blocking_findings: string[];
  };
}
