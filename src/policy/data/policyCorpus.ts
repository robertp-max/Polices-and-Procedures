/* ═══════════════════════════════════════════════════════════════
   policyCorpus.ts — Authoritative Policy Corpus
   Single source of truth for the 278-policy Care Indeed corpus.
   Used by the Policy Lifecycle workspace. LibraryPage.tsx maintains
   its own local copy for historical reasons; both derive from the
   same rawPolicies table and should be kept in sync.

   DO NOT add demo / test / specimen / placeholder entries here.
   This list defines what appears in the Policy Lifecycle workspace.
   ═══════════════════════════════════════════════════════════════ */

export interface CorpusPolicy {
  /** Full policy ID — e.g. "GV-GB-001" */
  id: string;
  title: string;
  domainCode: string;
  subdomainCode: string;
  /** Priority tier for regulatory compliance */
  tier: string;
  /** Role accountable for maintenance */
  ownerSteward: string;
}

// ─── Domain owner map ────────────────────────────────────────────
const DOMAIN_OWNER: Record<string, string> = {
  GV: 'Administrator / Governing Body',
  CL: 'Director of Nursing / Clinical Manager',
  QA: 'QAPI Coordinator',
  HR: 'HR Director',
  CO: 'Compliance Officer',
  FN: 'Finance Director',
  OP: 'Operations Manager',
  IT: 'IT Director',
  RM: 'Risk Manager',
  EN: 'Enterprise Governance',
};

// ─── Authoritative policy table ──────────────────────────────────
// Mirrors rawPolicies in LibraryPage.tsx exactly.
// Format: "NNN: Title of Policy"
const RAW_POLICIES: Record<string, string[]> = {
  'GV-GB': [
    '001: Governing Body Authority & Responsibilities',
    '002: Board Meeting & Minutes Requirements',
    '003: Conflict of Interest Disclosure',
    '004: Succession Planning for Key Leadership',
    '005: Annual Governance Self-Assessment',
  ],
  'GV-OG': [
    '001: Organizational Structure & Reporting',
    '002: Administrator Qualifications & Responsibilities',
    '003: Scope of Services Definition',
    '004: Strategic Planning & Annual Goals',
    '005: Delegation of Authority',
  ],
  'GV-PM': [
    '001: Policy Development & Approval Process',
    '002: Policy Review & Revision Cycle',
    '003: Policy Acknowledgment & Staff Attestation',
    '004: Communication & Notification Standards',
    '005: Stakeholder Grievance & Feedback Management',
  ],
  'GV-EA': [
    '001: Interagency Agreements & Contracts',
    '002: Community Liaison & Public Relations',
    '003: Legal Counsel Engagement & Oversight',
    '004: Agency Licensure & Certification Maintenance',
    '005: Agency Closure or Change of Ownership',
  ],
  'CL-CP': [
    '001: Plan of Care Development & Approval',
    '002: Plan of Care Review & Update',
    '003: Physician Orders & Order Management',
    '004: Verbal Order Receipt & Authentication',
    '005: Coordination of Care',
    '006: Discharge Planning & Criteria',
    '007: Transfer & Referral Procedures',
    '008: Physician Recertification Timing Compliance',
    '009: Physician Order Signature Tracking & Escalation',
  ],
  'CL-SD': [
    '001: Skilled Nursing Assessment & Services',
    '002: Physical Therapy Services',
    '003: Occupational Therapy Services',
    '004: Speech-Language Pathology Services',
    '005: Medical Social Work Services',
    '006: Home Health Aide Services & Supervision',
    '007: Home Health Aide Competency Evaluation',
    '008: Clinical Supervision & Oversight',
    '009: Telehealth & Remote Monitoring Services',
    '010: IV Therapy & Infusion Services',
    '011: Wound Care Assessment & Management',
    '012: Medication Management & Administration',
    '013: Medication Reconciliation at Transitions',
    '014: Pain Assessment & Management',
    '015: Fall Risk Assessment & Prevention',
    '016: Infection Prevention & Control',
    '017: Patient Education & Self-Management',
    '018: Diabetic Management & Monitoring',
    '019: Cardiac Care & Monitoring',
    '020: Respiratory Care & Management',
    '021: Pediatric Home Health Services',
    '022: Behavioral Health Screening & Referral',
    '023: Palliative & End-of-Life Care',
    '024: Missed Visit & Rescheduling',
    '025: Ordered Visit Frequency Compliance & Monitoring',
  ],
  'CL-CA': [
    '001: Patient Assessment — Comprehensive',
    '002: OASIS Data Collection & Accuracy',
    '003: OASIS Transmission & Correction',
    '004: Recertification Assessment & Process',
    '005: Homebound Status Determination & Documentation',
    '006: Face-to-Face Encounter Compliance',
    '007: Face-to-Face Encounter Tracking & Expiration Monitoring',
  ],
  'CL-CD': [
    '001: Clinical Documentation Standards',
    '002: Clinical Record Content & Organization',
    '003: Clinical Record Authentication & Signature Requirements',
    '004: Timely Documentation Completion & Lock Requirements',
  ],
  'CL-PR': [
    '001: Patient Rights & Responsibilities',
    '002: Advance Directive Compliance',
    '003: Informed Consent',
    '004: Restraint & Seclusion Prohibition',
    '005: Emergency Preparedness — Clinical',
    '006: Abuse, Neglect & Exploitation Reporting',
  ],
  'CL-OA': [
    '001: OASIS Completion Timeliness & Accountability',
    '002: OASIS Quality Review & Error Correction',
    '003: OASIS Clinician Authorization & Competency',
    '004: OASIS Item-Level Guidance Compliance',
    '005: OASIS Data Integrity & Security',
    '006: Documentation Hierarchy and Evidence Source Prioritization',
    '007: Evidence-Based OASIS Coding Substantiation',
    '008: Conflicting Documentation Source Resolution',
    '009: Point-in-Time Assessment at Start of Care',
    '010: CMS Look-Back Period Compliance for Assessment Items',
    '011: Standardized Assessment Tool Administration and Validity',
    '012: Clinical Reasoning Documentation for Coding Decisions',
    '013: Cross-Document Verification Prior to Assessment Finalization',
    '014: Medication Reconciliation — Prescribed Regimen vs. Actual Patient Behavior',
    '015: Assessment Completion Timeframe Compliance',
    '016: Scoring Methodology Integrity for Multi-Item Assessments',
    '017: Contemporaneous Documentation Requirement',
    '018: Clinician Competency Validation for OASIS Assessment',
    '019: Pre-Submission Quality Review for Comprehensive Assessments',
  ],
  'QA-PG': [
    '001: QAPI Program Establishment & Governance',
    '002: QAPI Plan Development & Annual Review',
    '003: QAPI Committee Structure & Meeting Requirements',
  ],
  'QA-PI': [
    '001: Performance Improvement Project Management',
    '002: Quality Indicator Monitoring & Reporting',
    '003: Clinical Outcome Benchmarking',
    '004: Data-Driven Decision Making',
    '005: Staff Competency Integration with QAPI',
    '006: Visit Utilization & LUPA Risk Management Program',
    '007: Staff Competency Impact on Patient Outcomes',
  ],
  'QA-AE': [
    '001: Adverse Event Identification & Reporting',
    '002: Root Cause Analysis Process',
    '003: Corrective Action Plan Development & Tracking',
    '004: Patient Safety Program',
  ],
  'QA-SM': [
    '001: Utilization Review & Management',
    '002: Infection Surveillance & Trending',
    '003: Patient Satisfaction Survey & Analysis',
    '004: Home Health Compare & Star Rating Monitoring',
    '005: Policy Effectiveness Monitoring and Outcome Validation',
  ],
  'HR-TA': [
    '001: Recruitment & Hiring Standards',
    '002: Criminal Background Check & Screening',
    '003: OIG/SAM Exclusion Screening',
    '004: Licensure & Certification Verification',
    '005: Employee Orientation & Onboarding',
    '006: Job Description & Role Definition',
  ],
  'HR-TD': [
    '001: Annual Mandatory Training Requirements',
    '002: Continuing Education & Professional Development',
    '003: Clinical Staff Competency Evaluation',
    '004: Student & Intern Supervision',
    '005: Emergency Preparedness Training & Drills',
  ],
  'HR-ER': [
    '001: Performance Evaluation & Review',
    '002: Disciplinary Action & Progressive Discipline',
    '003: Employee Grievance & Complaint Process',
    '004: Anti-Harassment & Non-Discrimination',
    '005: Substance Abuse & Drug-Free Workplace',
    '006: Separation & Exit Process',
    '007: Workforce Diversity & Inclusion',
    '008: Remote Work & Flexible Scheduling',
    '009: Mandatory Abuse Reporting by Staff',
  ],
  'HR-WM': [
    '001: Staffing Levels & Workload Management',
    '002: Contractor & Per Diem Staff Management',
    '003: Employee Health & Immunization Requirements',
    '004: Workplace Safety & Injury Prevention',
    '005: Employee Personnel File Management',
    '006: Volunteer Management & Oversight',
    '007: Personnel File Content & Compliance Requirements',
  ],
  'HR-JD': [
    '000: Governing Body Structure & Responsibilities',
    '001: Administrator',
    '002: Administrator Designee',
    '003: Director of Nursing / Clinical Manager',
    '004: Clinical Designee',
    '005: Registered Nurse (RN)',
    '006: Licensed Vocational Nurse (LVN)',
    '007: Home Health Aide (HHA)',
    '008: Medical Social Worker (MSW)',
    '009: Physical Therapist (PT)',
    '010: Occupational Therapist (OT)',
  ],
  'CO-CP': [
    '001: Corporate Compliance Program',
    '002: Compliance Officer Designation & Authority',
    '003: Compliance Committee Structure & Function',
    '004: Code of Conduct & Ethics',
    '005: Whistleblower Protection & Non-Retaliation',
    '006: Compliance Hotline & Reporting Mechanisms',
    '007: Compliance Investigation Process',
  ],
  'CO-RA': [
    '001: Regulatory Change Monitoring & Implementation',
    '002: Internal Compliance Auditing Program',
    '003: External Audit & Survey Readiness',
    '004: Medicare Conditions of Participation Compliance',
    '005: State Licensure & Regulatory Compliance',
    '006: Accreditation Standards Compliance',
    '007: Sanctions & Enforcement Response',
  ],
  'CO-FA': [
    '001: Anti-Kickback & Stark Law Compliance',
    '002: False Claims Act Awareness & Prevention',
    '003: Fraud, Waste & Abuse Prevention',
  ],
  'CO-HP': [
    '001: HIPAA Privacy Program',
    '002: HIPAA Security Program',
    '003: HIPAA Breach Notification',
    '004: Minimum Necessary Standard',
    '005: Business Associate Agreement Management',
    '006: Patient Access to Records',
    '007: Record Retention & Destruction',
  ],
  'CO-CA': [
    '001: California Confidentiality of Medical Information Act (CMIA) Compliance',
  ],
  'CO-DC': [
    '001: Assessment Audit Trail and Data Integrity',
    '002: Documentation Audit & Monitoring Program',
    '003: Late Entry, Correction & Amendment Standards',
    '004: Clinical, Documentation, and Billing Alignment Audit',
  ],
  'FN-BC': [
    '001: Medicare Billing & Claims Submission',
    '002: Claims Denial Management & Appeals',
    '003: Patient Billing & Financial Responsibility',
    '004: Overpayment Identification & Refund',
    '005: Pre-Claim Review Compliance',
    '006: Request for Anticipated Payment (RAP) Management',
    '007: Payment & Reimbursement Reconciliation',
  ],
  'FN-CM': [
    '001: PDGM Classification & Coding Accuracy',
    '002: ICD-10 Coding Standards & Accuracy',
    '003: Medical Necessity Documentation',
    '004: Episode Management & Authorization',
    '005: LUPA Prevention & Monitoring',
  ],
  'FN-FP': [
    '001: Payer Contract Management',
    '002: Charge Capture & Fee Schedule Management',
    '003: Revenue Cycle Performance Monitoring',
    '004: Bad Debt & Charity Care',
    '005: Annual Budget & Financial Planning',
    '006: Supply & Equipment Cost Management',
    '007: Financial Compliance & Fraud Monitoring Controls',
  ],
  'OP-IM': [
    '001: Referral & Intake Management',
    '002: Patient Acceptance & Admission Criteria',
    '003: Service Area Definition & Coverage',
  ],
  'OP-SL': [
    '001: Scheduling & Visit Management',
    '002: After-Hours & On-Call Services',
    '003: Vehicle & Transportation Safety',
    '004: Equipment & Supply Management',
    '005: Communication & Documentation Systems',
    '006: Service Delivery During Public Health Emergencies',
    '007: Inclement Weather & Hazardous Conditions',
  ],
  'OP-PA': [
    '001: Patient Complaint & Grievance Resolution',
    '002: Patient Identification & Verification',
    '003: Interpreter & Language Access Services',
    '004: Cultural Competency in Service Delivery',
    '005: Patient Property & Belongings',
  ],
  'OP-FM': [
    '001: Office Operations & Facility Management',
    '002: Branch Office & Satellite Operations',
    '003: Vendor & Supplier Management',
    '004: Mail & Correspondence Management',
    '005: Emergency Operations & Business Continuity',
  ],
  'IT-SC': [
    '001: Information Security Program',
    '002: Access Control & User Authentication',
    '003: Data Encryption Standards',
    '004: Network Security & Firewall Management',
    '005: Endpoint Security & Malware Protection',
    '006: Data Classification & Handling',
  ],
  'IT-DR': [
    '001: Data Backup & Recovery',
    '002: Disaster Recovery & IT Continuity',
    '003: Audit Log Management & Monitoring',
    '004: Cloud Services & Data Storage',
    '005: Security Incident Response',
  ],
  'IT-SA': [
    '001: Electronic Health Record System Management',
    '002: Software Acquisition & License Management',
    '003: System Change Management',
    '004: Vendor & Third-Party Security Assessment',
    '005: Physical Security of IT Assets',
  ],
  'IT-UP': [
    '001: Mobile Device & BYOD Security',
    '002: Internet & Email Acceptable Use',
    '003: Social Media & Public Communications',
    '004: Security Awareness Training',
  ],
  'RM-ER': [
    '001: Enterprise Risk Management Program',
    '002: Incident Reporting & Investigation',
    '003: Risk Assessment & Prioritization',
    '004: Liability & Insurance Management',
    '005: Risk Trending & Pattern Analysis',
    '006: Claims Management & Litigation Support',
  ],
  'RM-SS': [
    '001: Staff Safety & Personal Security',
    '002: Workplace Violence Prevention',
    '003: Motor Vehicle Safety & Accident Reporting',
  ],
  'RM-PS': [
    '001: Environmental Safety Assessment',
    '002: Hazardous Materials & Waste Management',
    '003: Product & Equipment Safety Recall Management',
    '004: Patient Elopement & Wandering Risk',
    '005: High-Risk Medication Safety',
  ],
  'RM-OS': [
    '001: Cal/OSHA Injury & Illness Prevention Program (IIPP)',
    '002: Aerosol Transmissible Disease (ATD) Exposure Control Plan',
    '003: Bloodborne Pathogen (BBP) Exposure Control Plan',
    '004: Heat Illness Prevention Program',
  ],
  'RM-EP': [
    '001: Emergency Preparedness Program',
    '002: Emergency Preparedness Training & Testing Program',
    '003: Patient Emergency Communication Plan',
  ],
  'EN-TG': [
    '001: Enterprise Policy Taxonomy & Classification Governance',
    '002: Regulatory Cross-Reference & Mapping',
  ],
  'EN-LC': [
    '001: Policy Lifecycle Control & Version Management',
    '002: Policy Exception & Waiver Management',
    '003: Policy Assignment and Role-Based Applicability Governance',
    '004: Policy Retirement and Obsolescence Management',
  ],
  'EN-CM': [
    '001: Enterprise Compliance Metrics Program',
    '002: Inter-Domain Policy Coordination & Conflict Resolution',
  ],
};

// ─── Additional policies not in rawPolicies ──────────────────────
const NEW_POLICIES: Array<{ id: string; title: string; domainCode: string; subdomainCode: string }> = [
  { id: 'CO-HP-101', title: 'HIPAA, CMIA & Sensitive Data Privacy Management',          domainCode: 'CO', subdomainCode: 'HP' },
  { id: 'CO-BA-101', title: 'Business Associate & Vendor PHI Management',               domainCode: 'CO', subdomainCode: 'HP' },
  { id: 'CO-IR-101', title: 'Security Incident Response & Breach Notification',         domainCode: 'CO', subdomainCode: 'HP' },
  { id: 'CO-DG-101', title: 'Data Governance & Minimum Necessary Enforcement',          domainCode: 'CO', subdomainCode: 'DC' },
  { id: 'CO-FW-101', title: 'Fraud, Waste & Abuse Prevention (Comprehensive)',          domainCode: 'CO', subdomainCode: 'FA' },
  { id: 'CO-AI-101', title: 'AI & Automated Systems Governance',                        domainCode: 'CO', subdomainCode: 'DC' },
  { id: 'HR-TR-101', title: 'Workforce Training, Competency & Policy Acknowledgment',   domainCode: 'HR', subdomainCode: 'TD' },
  { id: 'HR-EH-101', title: 'Employee Health, Exposure & Occupational Clearance',       domainCode: 'HR', subdomainCode: 'WM' },
  { id: 'RM-OS-101', title: 'Cal/OSHA Occupational Safety Program (IIPP)',               domainCode: 'RM', subdomainCode: 'SS' },
  { id: 'RM-EP-004', title: 'Public Health Emergency Integration',                      domainCode: 'RM', subdomainCode: 'EP' },
  // ── 2026-04-29 — CMS workflow-enforcement & evidence pack (see EN-WF-101) ──
  { id: 'CL-OA-101', title: 'OASIS Data Accuracy, Validation & Submission Integrity',   domainCode: 'CL', subdomainCode: 'OA' },
  { id: 'CL-DC-101', title: 'Clinical Documentation Integrity & Authenticity',          domainCode: 'CL', subdomainCode: 'CD' },
  { id: 'CL-CC-101', title: 'Care Coordination & SDOH Management',                      domainCode: 'CL', subdomainCode: 'PR' },
  { id: 'QA-VBP-101', title: 'HHVBP Performance & Outcomes Management',                 domainCode: 'QA', subdomainCode: 'SM' },
  { id: 'EN-WF-101', title: 'Policy Execution, Workflow Enforcement & Evidence Traceability', domainCode: 'EN', subdomainCode: 'LC' },
];

// ─── Validation guard ─────────────────────────────────────────────
const PLACEHOLDER_RE = /\b(demo|test|specimen|placeholder|mock|fake|stub)\b/i;

function isRealPolicy(id: string, title: string): boolean {
  return !PLACEHOLDER_RE.test(id) && !PLACEHOLDER_RE.test(title);
}

// ─── Build corpus ─────────────────────────────────────────────────
const _corpus: CorpusPolicy[] = [];

Object.entries(RAW_POLICIES).forEach(([prefix, items]) => {
  const [domainCode, subdomainCode] = prefix.split('-');
  items.forEach(item => {
    const ci = item.indexOf(': ');
    const idNum = item.substring(0, ci);
    const title = item.substring(ci + 2);
    const id = `${domainCode}-${subdomainCode}-${idNum}`;
    if (isRealPolicy(id, title)) {
      _corpus.push({
        id,
        title,
        domainCode,
        subdomainCode,
        tier: 'REQUIRED',
        ownerSteward: DOMAIN_OWNER[domainCode] ?? 'Administrator',
      });
    }
  });
});

NEW_POLICIES.forEach(p => {
  if (isRealPolicy(p.id, p.title)) {
    _corpus.push({
      id: p.id,
      title: p.title,
      domainCode: p.domainCode,
      subdomainCode: p.subdomainCode,
      tier: 'REQUIRED',
      ownerSteward: DOMAIN_OWNER[p.domainCode] ?? 'Compliance Officer',
    });
  }
});

/**
 * Authoritative policy corpus — same 278 + policies visible in /library.
 * All placeholder / demo / test / specimen entries are excluded at build time.
 */
export const POLICY_CORPUS: ReadonlyArray<CorpusPolicy> = _corpus;

/** Human-readable provenance label for the UI. */
export const CORPUS_PROVENANCE = `Real Policy Corpus · ${POLICY_CORPUS.length} policies`;

/** Message shown when no corpus is available. */
export const CORPUS_EMPTY_MESSAGE =
  'No lifecycle-ready policies found. Import real policy corpus to begin.';

/** Look up a single policy by its canonical ID. Returns undefined if not found. */
export function getCorpusPolicy(id: string): CorpusPolicy | undefined {
  return POLICY_CORPUS.find(p => p.id === id);
}

/**
 * Framework-ordered domain codes for left-rail sorting and filter UI.
 * This is the canonical display order — not alphabetical.
 */
export const LIFECYCLE_DOMAIN_ORDER = [
  'GV', 'CO', 'QA', 'RM', 'CL', 'OP', 'HR', 'IT', 'FN', 'EN',
] as const;

/** Human-readable label for each domain code, used in filter UI. */
export const DOMAIN_LABEL: Record<string, string> = {
  GV: 'Governance',
  CO: 'Compliance',
  QA: 'QAPI',
  RM: 'Risk Management',
  CL: 'Clinical',
  OP: 'Operations',
  HR: 'Human Resources',
  IT: 'IT / Security',
  FN: 'Finance',
  EN: 'Enterprise',
};
