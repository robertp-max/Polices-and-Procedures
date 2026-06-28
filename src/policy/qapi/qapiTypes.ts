/* ════════════════════════════════════════════════════════════════
   QAPI hardening — shared types for the source dump, extraction,
   validation, and the confidential personnel-action addendum.
   The source dump shape mirrors scripts/generateMockClinicalDump.mjs
   (and, in production, an OASIS/POC export — see qapiExtraction.ts).
   ════════════════════════════════════════════════════════════════ */

export type Severity = 'blocker' | 'high' | 'medium' | 'low';
export type PacketType = 'interim' | 'final';

export interface OasisItems {
  assessment_type?: string;
  M0090_info_completed_date?: string;
  M0090_timeliness?: string;
  M1021_primary_dx?: string;
  M1311_stage2plus_pu?: number | string;
  M1860_ambulation?: number | string;
  M2001_med_reconciliation?: string;
  med_count_reviewed?: number;
  M2200_therapy_need_visits?: number | string;
  signed_by_clinician?: boolean;
  locked_in_emr?: boolean;
  [k: string]: unknown;
}
export interface PlanOfCare {
  form?: string;
  physician?: string;
  physician_npi?: string;
  cert_period?: string;
  orders?: string[];
  goals?: string[];
  homebound_justification?: string;
  f2f_encounter_date?: string;
  f2f_documented?: boolean;
  physician_signature_status?: 'signed' | 'pending' | 'missing' | string;
  medication_count?: number;
  verbal_orders_unsigned?: number;
  [k: string]: unknown;
}
export interface SourcePatient {
  client_id?: string;
  mrn?: string;
  name?: string;
  age?: number;
  gender?: string;
  dob?: string;
  primary_dx?: string;
  acuity?: string;
  admission_status?: string;
  active_visits_this_period?: number;
  soc_date?: string;
  cert_period_end?: string;
  payer?: string;
  high_risk_flags?: string[];
  assigned_clinician_id?: string;
  hospitalized_q2?: boolean;
  ed_visit_q2?: boolean;
  oasis?: OasisItems;
  poc?: PlanOfCare;
  data_quality_issues?: string[];
  [k: string]: unknown;
}
export interface ClinicianTrigger {
  category: string;
  risk_level: Severity | string;
  detail: string;
  client_id?: string;
  occurred_on?: string;
  reported?: boolean;
}
export interface SourceClinician {
  clinician_id: string;
  name?: string;
  role?: string;
  license_number?: string;
  license_expiration?: string;
  cpr_expiration?: string;
  competencies_on_file?: string[];
  pip_status?: string;
  supervision_status?: string;
  late_documentation_count_q2?: number;
  assigned_high_risk_patients?: number;
  triggers?: ClinicianTrigger[];
}
export interface SourceIncident { incident_id: string; client_id?: string; category?: string; severity?: string; date_of_incident?: string; reported?: boolean; rca_completed?: boolean; reported_to_physician?: boolean; assigned_clinician_id?: string }
export interface SourceInfection { infection_id: string; client_id?: string; infection_type?: string; healthcare_associated?: boolean; community_acquired?: boolean; date_onset?: string; reported_to_state?: boolean }
export interface SourceLab { lab_id: string; client_id?: string; test?: string; critical?: boolean; value?: string; reported_to_physician_within_policy?: boolean; drawn_on?: string }

export interface ClinicalDump {
  meta?: { quarter?: string; reporting_period?: { start?: string; end?: string } };
  patients: SourcePatient[];
  clinicians: SourceClinician[];
  incidents?: SourceIncident[];
  infections?: SourceInfection[];
  labs?: SourceLab[];
}

/** A single validation finding (Phase 2 / Phase 3 exceptions). */
export interface ValidationFinding {
  pass: boolean;
  severity: Severity;
  path: string;          // field / json path
  reason: string;
  remediation: string;
  sourceArtifactId?: string;
}
export interface ValidationResult {
  pass: boolean;
  findings: ValidationFinding[];
}
