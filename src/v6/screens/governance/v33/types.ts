export type RoleCode =
  | 'GEN'
  | 'LVN'
  | 'RN'
  | 'HHA'
  | 'PT'
  | 'PTA'
  | 'OT'
  | 'COTA'
  | 'SLP'
  | 'MSW'
  | 'ADM'
  | 'DON'
  | 'GB';

export type ViewKey = 'today' | 'plan' | 'learning' | 'policies' | 'annual' | 'certificates' | 'record';

export type CertificateStatus = 'locked' | 'eligible' | 'issued' | 'revoked' | 'import_pending' | 'specimen';

export interface CertificateProgram {
  id: string;
  title: string;
  shortTitle: string;
  track: 'ONBOARDING' | 'ROLE' | 'ANNUAL' | 'ADVANCED';
  status: CertificateStatus;
  completionLabel: string;
  evidenceDestination: 'Personnel file' | 'Governance file';
  requiredEvidence: string[];
  blockers: string[];
}

export type RequirementState = 'complete' | 'in_progress' | 'ready' | 'locked' | 'blocked' | 'not_connected';

export type VerificationState = 'verified' | 'needs_review' | 'not_found';

export interface RoleProfile {
  code: RoleCode;
  label: string;
  shortLabel: string;
  reportsTo: string;
  moduleCount: number;
  connectedCount: number;
  supervisedPractice: boolean;
  evidenceDestination: 'personnel_file' | 'governance_file';
  accent: string;
  accentStrong: string;
  accentSoft: string;
}

export interface Learner {
  id: string;
  name: string;
  preferredName: string;
  title: string;
  role: RoleCode;
  hireDate: string;
  supervisor: string;
  location: string;
  hoursAvailableToday: number;
}

export interface LearningItem {
  id: string;
  title: string;
  track: 'PRE' | 'GAO' | 'ROLE' | 'PP' | 'ANN' | 'DRILL' | 'COMP';
  kind: 'module' | 'exam' | 'policy_reading' | 'attestation' | 'competency' | 'supervisor_signoff';
  state: RequirementState;
  dueLabel: string;
  durationMinutes: number;
  progress?: number;
  score?: number;
  sourceAdapter: string;
  requiredFor: string;
  policyIds?: string[];
  gate?: string;
  note?: string;
}

export interface PolicyActivity {
  activityId: string;
  moduleId: string;
  policyId: string;
  title: string;
  dueDay: number;
  dueDate?: string;
  lifecycle?: 'onboarding_and_ongoing';
  scope: 'all_staff' | 'patient_facing' | 'clinical' | 'role_specific';
  verification: VerificationState;
  fullTextAvailable: boolean;
  state: RequirementState;
  quizBankConnected: boolean;
  quizQuestions: number;
  passScore: number;
  maxAttempts: number;
  attempts: number;
  attestationRequired: boolean;
  certificateGate: boolean;
  authorityLabel: string;
  courseTitle?: string;
  assignmentKind?: 'core' | 'conditional' | 'hold';
  releaseState?: 'ready' | 'conditional' | 'partial_hold' | 'hold';
  triggerLabel?: string;
  recurrenceLabel?: string;
  policyVersion?: string | null;
  policyEffectiveDate?: string | null;
  validationLabel?: string;
  quizProvenance?: 'source_derived_preview' | 'approved_bank' | 'not_supplied';
}

export interface TimelinePhase {
  id: string;
  label: string;
  range: string;
  state: RequirementState;
  completion: number;
  description: string;
  requirements: string[];
}

export interface AnnualRequirement {
  id: string;
  title: string;
  cadence: string;
  due: string;
  state: RequirementState;
  evidence: string;
  authorityLabel: string;
  role: 'all' | RoleCode;
}

export interface EvidenceRecord {
  id: string;
  label: string;
  type: string;
  completedAt: string;
  score?: string;
  destination: string;
  integrity: 'recorded' | 'pending';
}

export interface PolicyContentSection {
  id: string;
  title: string;
  level: number;
  order: number;
  body: string;
  scormChunkHint?: string;
}

export interface PolicyContent {
  policyId: string;
  sourceType: string;
  sourceRef: string;
  sections: PolicyContentSection[];
}
