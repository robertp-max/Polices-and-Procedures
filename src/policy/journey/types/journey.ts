/* ═══════════════════════════════════════════════════════════════
   ROLE-BASED ONBOARDING & COMPETENCY JOURNEY — type model
   Directly aligned with:
     • 42 CFR Part 484 (CMS CoPs for HHAs)
     • HR-TA-001 through HR-TA-006, HR-TD-001..005, HR-ER-*, CO-HP-*
     • HR-TA-005 Appendices A/B/D/E and HR-TD-003 Appendices A-E
   All identifiers and fields are audit-defensible and SCORM-trackable.
   ═══════════════════════════════════════════════════════════════ */

/** The 11 CMS-required / operationally mandated positions per 42 CFR Part 484. */
export type JourneyRole =
  | 'ADM'   // Administrator              § 484.105(b)
  | 'DON'   // Director of Nursing        § 484.105(c)
  | 'RN'    // Registered Nurse           § 484.115(a)
  | 'LVN'   // Licensed Vocational Nurse  § 484.115(c)
  | 'PT'    // Physical Therapist         § 484.115(d)
  | 'PTA'   // Physical Therapist Asst.   § 484.115(e)
  | 'OT'    // Occupational Therapist     § 484.115(f)
  | 'COTA'  // Certified OT Assistant     § 484.115(g)
  | 'SLP'   // Speech-Language Path.      § 484.115(h)
  | 'MSW'   // Medical Social Worker      § 484.115(i)
  | 'HHA';  // Home Health Aide           § 484.80

/** Life-cycle phase. Gating is enforced in this order. */
export type JourneyPhase =
  | 'PRE_DAY_1'   // Phase 0  — HR-TA-001 §§ 6.4-6.5
  | 'GAO'         // Phase 1  — General Agency Orientation, Days 1-5
  | 'ROLE'        // Phase 2  — Role-specific, Days 1-30
  | 'SUPERVISED'  // Phase 3  — Direct-supervision visits
  | 'CLEARED'     // Phase 4  — Cleared for independent practice
  | 'ANN'         // Ongoing  — Annual mandatory training
  | 'DRILL';      // Ongoing  — Emergency preparedness exercises

export type ModuleGroup = 'GAO' | 'ROLE' | 'ANN' | 'COMP' | 'DRILL';

export type CompetencyMethod =
  | 'None'
  | 'Quiz'
  | 'CodingExercise'
  | 'CaseStudy'
  | 'Scenario'
  | 'ReturnDemo'
  | 'SkillsCheckoff'
  | 'RecordReview'
  | 'Tabletop'
  | 'PhishingSim'
  | 'Observation'
  | 'MockSurvey'
  | 'SupervisedVisit';

/** Evidence appendix references (HR-TA-001/004/005 + HR-TD-003). */
export type EvidenceAppendix =
  | 'F'   // HR-TA-001 Appendix F  — Pre-Employment Screening Checklist
  | 'A'   // HR-TA-003 Appendix A  — OIG/SAM Screening Result Form
  | 'B'   // HR-TA-004 Appendix B  — Licensure Verification Record
  | 'HRTA005_A' // HR-TA-005 Appendix A — General Orientation sign-off
  | 'HRTA005_B' // HR-TA-005 Appendix B — Role-specific sign-off / clearance
  | 'HRTA005_D' // HR-TA-005 Appendix D — General Orientation Quiz
  | 'HRTA005_E' // HR-TA-005 Appendix E — Supervised Visit Form
  | 'HRTD003_A' // HR-TD-003 Appendix A — Annual Competency Evaluation
  | 'HRTD003_C' // HR-TD-003 Appendix C — Remediation Plan
  | 'HRTD003_D' // HR-TD-003 Appendix D — HHA-specific competency
  | 'HRTD003_E' // HR-TD-003 Appendix E — HHA Supervisory Visit (14/60-day)
  | 'HRER001_C' // HR-ER-001 Appendix C — 90-day introductory eval
  | 'HRTD001_B' // HR-TD-001 Appendix B — Annual training dashboard
  | 'HRTD005_B' // HR-TD-005 Appendix B — Emergency drill AAR
  | 'NONE';

/** One canonical training module / competency unit. */
export interface JourneyModule {
  /** Canonical LMS id (GAO-001, RN-002, HHA-003, ANN-014, ADM-013, …). */
  id: string;
  group: ModuleGroup;
  phase: JourneyPhase;
  week?: number;
  title: string;
  /** Roles eligible for this module. 'ALL' = every JourneyRole. */
  roles: JourneyRole[] | 'ALL';
  /** Internal CI policy refs (e.g. "HR-TA-001 §6.4"). */
  policyRefs: string[];
  /** External regulatory refs (e.g. "42 CFR 484.80(h)(3)"). */
  cmsRefs: string[];
  method: CompetencyMethod;
  /** Pass threshold 0..1 (e.g. 0.80). 1.00 for HHA vital-signs 100% rule. */
  passThreshold?: number;
  /** Modules that must be completed before this one is unlocked. */
  prerequisites?: string[];
  /** Appendix captured as evidence upon completion. */
  evidenceAppendix?: EvidenceAppendix;
  /** Requires supervisor/preceptor signature in addition to employee. */
  supervisorSignature?: boolean;
  durationMinutes?: number;
  /** Delivery method note for display ("Classroom + e-learning"). */
  deliveryMethod?: string;
  /** SCORM package identifier (stub). Module runs as SCORM 1.2 when set. */
  scormCourseId?: string | null;
  /** Minimum supervised visits required (role-specific). */
  supervisedVisitsRequired?: number;
  /** Annual cadence for ANN modules. */
  annualQuarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

/** Employee (learner) record. */
export interface JourneyEmployee {
  id: string;
  name: string;
  role: JourneyRole;
  email: string;
  hireDate: string;        // ISO
  startDate: string | null;
  supervisorId: string | null;
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiry?: string;
  /** Flag flipped true once Appendix F PASS/NA complete & signed by HR. */
  appendixFCleared: boolean;
  /** Flag flipped true by DON/supervisor when fully cleared. */
  clearedForIndependentWork: boolean;
  terminated?: boolean;
}

/** A single learner's attempt at a module (SCORM-aligned). */
export interface ModuleAttempt {
  id: string;
  employeeId: string;
  moduleId: string;
  attemptNumber: number;
  startedAt: string;
  completedAt: string | null;
  /** SCORM 1.2 cmi.core.lesson_status. */
  lessonStatus:
    | 'not attempted'
    | 'browsed'
    | 'incomplete'
    | 'completed'
    | 'passed'
    | 'failed';
  /** 0..100. */
  scoreRaw: number | null;
  scoreMin: number;
  scoreMax: number;
  /** Seconds of learner time (sum of session_time). */
  timeSpentSec: number;
  /** SCORM suspend_data payload (opaque, used for resume). */
  suspendData: string;
  /** SCORM cmi.core.lesson_location bookmark. */
  lessonLocation: string;
  /** SCORM cmi.core.exit ('suspend', 'logout', 'normal'). */
  exit: string;
  /** Aggregate terminal status (app-level). */
  status: 'not-started' | 'in-progress' | 'completed' | 'failed';
  /** Remediation linkage. */
  remediationPlanId?: string;
}

/** Electronic signature capture. */
export interface SignatureRecord {
  role:
    | 'Employee'
    | 'Supervisor'
    | 'Preceptor'
    | 'HRDirector'
    | 'DON'
    | 'ComplianceOfficer'
    | 'Administrator';
  name: string;
  /** Base64-encoded PNG of drawn signature. */
  pngDataUrl: string;
  signedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

/** Appendix F line-item (Pre-Employment Screening). */
export interface AppendixFItem {
  id: number;
  label: string;
  policyRef: string;
  status: 'PENDING' | 'PASS' | 'FAIL' | 'NA';
  notes?: string;
  completedAt?: string;
}

/** Persisted evidence record (Appendix A/B/C/D/E/F and all sign-offs). */
export interface JourneyEvidence {
  id: string;
  employeeId: string;
  moduleId?: string;
  appendix: EvidenceAppendix;
  /** Free-form data payload, schema defined per appendix. */
  data: Record<string, unknown>;
  signatures: SignatureRecord[];
  attachments: { name: string; mime: string; dataUrl: string }[];
  createdAt: string;
  updatedAt: string;
}

/** Supervised home-visit log (HR-TA-005 Appendix E, HR-TD-003 Appendix E). */
export interface SupervisedVisit {
  id: string;
  employeeId: string;
  supervisorId: string;
  visitDate: string;
  visitType: 'INITIAL' | 'HHA_14_DAY' | 'HHA_60_DAY' | 'COMPETENCY_VALIDATION';
  patientInitials?: string;
  rating: 'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'UNSATISFACTORY';
  comments: string;
  signatures: SignatureRecord[];
  createdAt: string;
}

/** Escalation ticket (auto-fired by engine; acknowledged/resolved by admins). */
export interface JourneyEscalation {
  id: string;
  employeeId: string;
  type:
    | 'APPENDIX_F_INCOMPLETE'
    | 'GAO_INCOMPLETE'
    | 'OVERDUE_30'
    | 'OVERDUE_45'
    | 'OVERDUE_60'
    | 'COMPETENCY_FAIL'
    | 'REMEDIATION_OVERDUE'
    | 'LICENSE_EXPIRING_120'
    | 'LICENSE_EXPIRED'
    | 'OIG_SAM_FAIL'
    | 'MISSING_SUPERVISED_VISIT';
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  triggerAt: string;
  moduleId?: string;
  /** Human-readable action mandated by policy (HR-TD-001 §4.6, HR-TA-003 §6.3,…). */
  action: string;
  policyRef: string;
  status: 'Open' | 'Acknowledged' | 'Resolved';
  resolvedAt?: string;
  resolvedBy?: string;
}

/** Remediation plan (HR-TD-003 Appendix C). 60-day max resolution. */
export interface RemediationPlan {
  id: string;
  employeeId: string;
  moduleId: string;
  reason: string;
  createdAt: string;
  dueBy: string;        // createdAt + 60d
  actions: string[];
  status: 'Open' | 'Completed' | 'Failed';
  supervisorSignature?: SignatureRecord;
  employeeSignature?: SignatureRecord;
  resolvedAt?: string;
}

/** Aggregate view model used by dashboards/gates. */
export interface JourneyProgress {
  employeeId: string;
  role: JourneyRole;
  appendixFCleared: boolean;
  gaoCompletePct: number;     // 0..1
  gaoExamPassed: boolean;
  roleCompletePct: number;
  supervisedVisitsCompleted: number;
  supervisedVisitsRequired: number;
  annualCompletePct: number;
  competencyAnnualCompleted: boolean;
  /** DON has signed HR-TA-005 Appendix B = SATISFACTORY. Authoritative. */
  clearedForIndependentWork: boolean;
  /** All gating gaps closed; DON sign-off is the remaining step. */
  eligibleForClearance: boolean;
  openEscalations: number;
}
