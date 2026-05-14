// ============================================================
// PHASE 1 — CLINICIAN PROFILE & PATIENT PROFILE TYPES
// Terminology: Discipline (primary), Competency (secondary),
//              Credential (documents). NEVER use "Skill".
//              The person receiving care is "Patient" — never
//              "Client" — in user-facing labels and internal
//              names.
// ADS NOTE:    Phase 1 is read-only synthetic data. Future
//              AI-assisted staffing may be ADS decision-support
//              under CA FEHA. Phase 1 preserves the data
//              shape required for future compliance but does
//              NOT perform active matching, autonomous
//              scheduling, or production decisions.
// ============================================================

// --- Shared Enums ---

export type Discipline =
  | 'RN' | 'LVN' | 'LPN'
  | 'PT' | 'PTA'
  | 'OT' | 'COTA'
  | 'ST' | 'SLP'
  | 'MSW'
  | 'HHA' | 'CNA'
  | 'Caregiver';

export type AcuityLevel =
  | 'a1_routine'
  | 'a2_moderate'
  | 'a3_high'
  | 'a4_critical_complex';

export type DiagnosisCategory =
  | 'post_surgical'
  | 'cardiac'
  | 'neurological'
  | 'wound_care'
  | 'respiratory'
  | 'pediatric'
  | 'palliative'
  | 'general';

export type ClinicianStatus =
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'pending'
  | 'suspended'
  | 'terminated';

export type PatientStatus =
  | 'active'
  | 'inactive'
  | 'discharged'
  | 'pending'
  | 'on_hold';

export type ConnectionStatus =
  | 'eligible'
  | 'preferred'
  | 'restricted'
  | 'blocked'
  | 'assigned'
  | 'pending_approval'
  | 'inactive';

export type ConnectionSource =
  | 'system_recommendation'
  | 'manual_assignment'
  | 'manual_override'
  | 'patient_request'
  | 'clinician_request'
  | 'historical_continuity';

export type CredentialStatus =
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'pending_verification'
  | 'revoked';

export type ShiftNeedStatus =
  | 'open'
  | 'filled'
  | 'cancelled';

export type ShiftType =
  | 'recurring'
  | 'prn'
  | 'soc'
  | 'discharge'
  | 'supervisory'
  | 'respite';

export type Priority =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export type AssignmentRole =
  | 'primary'
  | 'secondary'
  | 'prn'
  | 'supervisory';

// --- Embedded Types ---

export interface Competency {
  name: string;
  level?: 'basic' | 'intermediate' | 'advanced';
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Credential {
  type: string;
  credentialName: string;
  issuingBody?: string;
  licenseNumber?: string;
  state?: string;
  issuedAt: string;
  expiresAt?: string;
  daysUntilExpiry?: number;
  verifiedAt?: string;
  verifiedBy?: string;
  status: CredentialStatus;
  evidenceRef?: string;
}

export interface ReligiousRestriction {
  day: string;
  timeRange?: string;
  description?: string;
  recurring?: boolean;
}

export interface AdaAccommodation {
  type: string;
  description: string;
  effectiveDate: string;
  reviewDate?: string;
}

export interface PregnancyAccommodation {
  active: boolean;
  details?: string;
  expectedEndDate?: string;
}

export interface FmlaLeave {
  active: boolean;
  startDate?: string;
  endDate?: string;
  leaveType?: string;
  intermittent?: boolean;
}

export interface SchedulingLimitation {
  type: string;
  description?: string;
}

export interface ShiftBlocker {
  type: string;
  description: string;
  clinicianId?: string;
}

// --- Core Entities ---

export interface Clinician {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  email?: string;
  phone?: string;

  primaryDiscipline: Discipline;
  secondaryDisciplines?: Discipline[];
  competencies: Competency[];
  credentials: Credential[];

  employmentType: 'W2' | 'contractor';
  hireDate?: string;
  status: ClinicianStatus;

  orgRole?: 'field_clinician' | 'supervisor' | 'accm' | 'ccm' | 'vcc' | 'admin';
  supervisorId?: string;
  cgssId?: string;

  serviceAreas?: string[];
  maxHoursPerWeek?: number;

  religiousRestrictions?: ReligiousRestriction[];
  adaAccommodations?: AdaAccommodation[];
  pregnancyAccommodation?: PregnancyAccommodation;
  fmlaLeave?: FmlaLeave;
  schedulingLimitations?: SchedulingLimitation[];

  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;

  serviceSetting: 'home' | 'facility';
  serviceEntity: 'home_care';
  acuityLevel: AcuityLevel;
  diagnosisCategory?: DiagnosisCategory;
  weightedCaseloadPoints: number;
  status: PatientStatus;

  accmOwnerId: string;
  ccmId?: string;

  serviceZone?: string;
  facilityId?: string;
  facilityName?: string;

  admissionDate?: string;
  dischargeDate?: string;

  requiredDisciplines: Discipline[];
  requiredCompetencies?: string[];
  continuityPriority?: 'low' | 'medium' | 'high';

  createdAt: string;
  updatedAt: string;
}

export interface ClinicianPatientConnection {
  id: string;
  clinicianId: string;
  patientId: string;
  connectionStatus: ConnectionStatus;
  source: ConnectionSource;
  discipline: Discipline;
  assignmentRole: AssignmentRole;
  startDate: string;
  endDate?: string;

  assignedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalRationale?: string;
  overrideReason?: string;

  priorAssignmentCount?: number;
  lastWorkedDate?: string;
  continuityFlag?: boolean;

  lastSupervisoryVisit?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftNeed {
  id: string;
  patientId: string;
  requiredDiscipline: Discipline;
  requiredCompetencies?: string[];
  isHardRequirement: boolean;
  visitDate: string;
  visitWindow?: { startTime: string; endTime: string };
  shiftType?: ShiftType;
  priority?: Priority;
  acuityLevel?: AcuityLevel;
  frequency?: string;
  preferredDays?: string[];
  durationHours?: number;
  startDate: string;
  endDate?: string;
  status: ShiftNeedStatus;
  assignedConnectionId?: string;
  blockers?: ShiftBlocker[];
  notes?: string;
  createdAt: string;
}

// --- Type Stubs (define only — no store, no UI, no logic) ---

export interface AuditLogEntry {
  id: string;
  entityType: 'clinician' | 'patient' | 'connection' | 'credential' | 'competency' | 'shift_need';
  entityId: string;
  action: 'created' | 'updated' | 'status_changed' | 'approved' | 'rejected' | 'overridden';
  fieldChanged?: string;
  previousValue?: unknown;
  newValue?: unknown;
  performedBy: string;
  performedByRole?: string;
  rationale?: string;
  timestamp: string;
}

export interface AdsDecisionLog {
  id: string;
  decisionType: 'eligibility_check' | 'ranking' | 'recommendation';
  shiftNeedId: string;
  inputFactors: Record<string, unknown>;
  outputResult: Record<string, unknown>;
  biasCheckResult?: Record<string, unknown>;
  retentionExpiresAt: string;
  timestamp: string;
}
