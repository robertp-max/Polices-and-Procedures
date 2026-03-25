import type { Policy } from '../types/policy';

// ──────────────────────────────────────────────────────────────
// Helper to generate placeholder policy body blocks
// ──────────────────────────────────────────────────────────────
const placeholder = {
  body: 'Policy content pending final approved body. This record has been pre-seeded from the approved enterprise taxonomy framework. Full policy language will be inserted during the content population phase.',
  procedure: 'Procedure content pending. Step-by-step procedural instructions, role assignments, and required timeframes will be documented here upon completion of the policy writing phase.',
  revision: 'Revision notes pending. Initial version — no prior revisions.',
  training: 'Training content pending. Upon policy approval, associated training modules, competency checks, and attestation requirements will be linked here.',
};

let _id = 1;
const mkId = () => String(_id++).padStart(4, '0');

function make(
  policyId: string,
  title: string,
  domainCode: string,
  domain: string,
  subdomainCode: string,
  subdomain: string,
  tier: Policy['tier'],
  briefDescription: string
): Policy {
  return {
    id: mkId(),
    policyId,
    title,
    domain,
    domainCode,
    subdomain,
    subdomainCode,
    tier,
    version: '1.0',
    status: 'Draft',
    briefDescription,
    policyBody: placeholder.body,
    procedureBody: placeholder.procedure,
    revisionNotes: placeholder.revision,
    trainingContent: placeholder.training,
    reviewerComments: [],
    lastUpdated: '2026-03-24',
    reviewedBy: '',
    reviewedAt: '',
    approvedBy: '',
    approvedAt: '',
    publishToScorm: false,
    publishToMasterFile: false,
  };
}

// ──────────────────────────────────────────────────────────────
// DOMAIN: GV — Governance & Administration
// ──────────────────────────────────────────────────────────────
const GV: Policy[] = [
  make('GV-GA-001','Governing Body Authority & Responsibilities','GV','Governance & Administration','GA','Governance & Administration','REQUIRED','Defines the authority, composition, and oversight responsibilities of the agency\'s governing body in compliance with 42 CFR 484.105.'),
  make('GV-GA-002','Organizational Structure & Reporting','GV','Governance & Administration','GA','Governance & Administration','REQUIRED','Establishes the formal organizational hierarchy, reporting relationships, and lines of authority for all agency operations.'),
  make('GV-GA-003','Administrator Qualifications & Responsibilities','GV','Governance & Administration','GA','Governance & Administration','REQUIRED','Defines minimum qualifications, duties, and accountability requirements for the agency administrator per CMS CoP.'),
  make('GV-GA-004','Scope of Services Definition','GV','Governance & Administration','GA','Governance & Administration','REQUIRED','Formally defines the range of home health services the agency is authorized and staffed to provide.'),
  make('GV-GA-005','Strategic Planning & Annual Goals','GV','Governance & Administration','GA','Governance & Administration','ESSENTIAL','Requires the governing body to establish, document, and review annual strategic goals and operational objectives.'),
  make('GV-GA-006','Policy Development & Approval Process','GV','Governance & Administration','GA','Governance & Administration','REQUIRED','Establishes the standardized process for developing, reviewing, approving, and disseminating agency policies.'),
  make('GV-GA-007','Policy Review & Revision Cycle','GV','Governance & Administration','GA','Governance & Administration','REQUIRED','Mandates periodic review of all policies on a defined cycle with documented evidence of review and revision.'),
  make('GV-GA-008','Delegation of Authority','GV','Governance & Administration','GA','Governance & Administration','REQUIRED','Defines the conditions, limitations, and documentation requirements for delegating administrative and clinical authority.'),
  make('GV-GA-009','Board Meeting & Minutes Requirements','GV','Governance & Administration','GA','Governance & Administration','ESSENTIAL','Establishes frequency, quorum, documentation, and retention requirements for governing body meetings.'),
  make('GV-GA-010','Interagency Agreements & Contracts','GV','Governance & Administration','GA','Governance & Administration','REQUIRED','Governs the establishment, review, and compliance monitoring of contracts with third-party service providers.'),
  make('GV-GA-011','Community Liaison & Public Relations','GV','Governance & Administration','GA','Governance & Administration','GOOD TO HAVE','Defines the agency\'s approach to community engagement, referral source relationships, and public communications.'),
  make('GV-GA-012','Legal Counsel Engagement & Oversight','GV','Governance & Administration','GA','Governance & Administration','RECOMMENDED','Establishes requirements for engaging legal counsel on regulatory, contractual, and compliance matters.'),
  make('GV-GA-013','Agency Licensure & Certification Maintenance','GV','Governance & Administration','GA','Governance & Administration','REQUIRED','Ensures continuous maintenance of all required state licenses, Medicare certification, and accreditation credentials.'),
  make('GV-GA-014','Conflict of Interest Disclosure','GV','Governance & Administration','GA','Governance & Administration','REQUIRED','Requires all governing body members, leadership, and key personnel to disclose and manage conflicts of interest.'),
  make('GV-GA-015','Succession Planning for Key Leadership','GV','Governance & Administration','GA','Governance & Administration','ESSENTIAL','Establishes succession planning requirements for the administrator, clinical manager, and other critical leadership roles.'),
  make('GV-GA-016','Policy Acknowledgment & Staff Attestation','GV','Governance & Administration','GA','Governance & Administration','REQUIRED','Requires documented acknowledgment and attestation by all staff upon policy issuance, revision, or reassignment.'),
  make('GV-GA-017','Communication & Notification Standards','GV','Governance & Administration','GA','Governance & Administration','ESSENTIAL','Defines standards for internal and external communication including timeliness, documentation, and escalation protocols.'),
  make('GV-GA-018','Agency Closure or Change of Ownership','GV','Governance & Administration','GA','Governance & Administration','REQUIRED','Establishes procedures and notification requirements for planned agency closure, merger, or change of ownership per CMS requirements.'),
  make('GV-GA-019','Stakeholder Grievance & Feedback Management','GV','Governance & Administration','GA','Governance & Administration','ESSENTIAL','Defines the process for receiving, tracking, and resolving grievances and feedback from patients, families, staff, and referral sources.'),
  make('GV-GA-020','Annual Governance Self-Assessment','GV','Governance & Administration','GA','Governance & Administration','RECOMMENDED','Requires the governing body to conduct an annual self-assessment of governance effectiveness and regulatory compliance.'),
];

// ──────────────────────────────────────────────────────────────
// DOMAIN: CL — Clinical Operations / Subdomain: CP
// ──────────────────────────────────────────────────────────────
const CL_CP: Policy[] = [
  make('CL-CP-001','Plan of Care Development & Approval','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes requirements for individualized plan of care development, physician approval, and timely implementation per 42 CFR 484.60.'),
  make('CL-CP-002','Plan of Care Review & Update','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Mandates periodic review and update of the plan of care at each recertification period and as patient condition changes.'),
  make('CL-CP-003','Physician Orders & Order Management','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines requirements for obtaining, documenting, and managing verbal and written physician orders.'),
  make('CL-CP-004','Verbal Order Receipt & Authentication','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes protocols for receiving, reading back, documenting, and authenticating verbal orders within required timeframes.'),
  make('CL-CP-005','Skilled Nursing Assessment & Services','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines the scope, frequency, and documentation requirements for skilled nursing visits and assessments.'),
  make('CL-CP-006','Physical Therapy Services','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes clinical standards, documentation requirements, and discharge criteria for physical therapy services.'),
  make('CL-CP-007','Occupational Therapy Services','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes clinical standards, documentation requirements, and discharge criteria for occupational therapy services.'),
  make('CL-CP-008','Speech-Language Pathology Services','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes clinical standards, documentation requirements, and discharge criteria for speech-language pathology services.'),
  make('CL-CP-009','Medical Social Work Services','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines the scope, referral criteria, and documentation requirements for medical social work services.'),
  make('CL-CP-010','Home Health Aide Services & Supervision','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes service delivery standards, supervision requirements, and competency validation for home health aides per 42 CFR 484.80.'),
  make('CL-CP-011','Home Health Aide Competency Evaluation','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines initial and ongoing competency evaluation requirements for home health aides including skills validation and documentation.'),
  make('CL-CP-012','Patient Assessment — Comprehensive','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Mandates completion of a comprehensive patient assessment including all required OASIS data elements at applicable time points.'),
  make('CL-CP-013','OASIS Data Collection & Accuracy','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes standards for accurate, timely, and complete OASIS data collection in compliance with CMS requirements.'),
  make('CL-CP-014','OASIS Transmission & Correction','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines requirements and timeframes for OASIS data transmission to CMS and procedures for error correction.'),
  make('CL-CP-015','Clinical Documentation Standards','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes minimum standards for clinical documentation content, timeliness, accuracy, and authentication.'),
  make('CL-CP-016','Wound Care Assessment & Management','CL','Clinical Operations','CP','Clinical Practice','ESSENTIAL','Defines assessment, classification, treatment, and documentation standards for wound care services.'),
  make('CL-CP-017','Medication Management & Administration','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes standards for medication administration, storage, reconciliation, and adverse reaction reporting.'),
  make('CL-CP-018','Medication Reconciliation at Transitions','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Mandates medication reconciliation at every transition of care including SOC, transfer, resumption, and discharge.'),
  make('CL-CP-019','Pain Assessment & Management','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines requirements for pain screening, assessment, reassessment, and individualized pain management planning.'),
  make('CL-CP-020','Fall Risk Assessment & Prevention','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes fall risk screening, assessment, intervention planning, and documentation requirements.'),
  make('CL-CP-021','Infection Prevention & Control','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines the agency\'s infection prevention and control program including surveillance, standard precautions, and reporting per 42 CFR 484.70.'),
  make('CL-CP-022','Patient Education & Self-Management','CL','Clinical Operations','CP','Clinical Practice','ESSENTIAL','Requires individualized patient and caregiver education with documented learning assessments and outcomes.'),
  make('CL-CP-023','Discharge Planning & Criteria','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes criteria, processes, and documentation requirements for patient discharge from home health services.'),
  make('CL-CP-024','Transfer & Referral Procedures','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines procedures for transferring patients to other providers or facilities including documentation and communication requirements.'),
  make('CL-CP-025','Coordination of Care','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Mandates coordination of services among all disciplines and with external providers involved in the patient\'s care.'),
  make('CL-CP-026','Clinical Supervision & Oversight','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines requirements for clinical supervision of professional staff and oversight of all clinical services.'),
  make('CL-CP-027','Telehealth & Remote Monitoring Services','CL','Clinical Operations','CP','Clinical Practice','RECOMMENDED','Establishes standards for the delivery, documentation, and oversight of telehealth and remote patient monitoring services.'),
  make('CL-CP-028','IV Therapy & Infusion Services','CL','Clinical Operations','CP','Clinical Practice','ESSENTIAL','Defines clinical standards, competency requirements, and documentation for intravenous therapy and infusion services.'),
  make('CL-CP-029','Diabetic Management & Monitoring','CL','Clinical Operations','CP','Clinical Practice','ESSENTIAL','Establishes assessment, education, monitoring, and documentation standards for diabetic patient management.'),
  make('CL-CP-030','Cardiac Care & Monitoring','CL','Clinical Operations','CP','Clinical Practice','ESSENTIAL','Defines assessment, intervention, and monitoring standards for patients with cardiac conditions.'),
  make('CL-CP-031','Respiratory Care & Management','CL','Clinical Operations','CP','Clinical Practice','ESSENTIAL','Establishes standards for respiratory assessment, oxygen therapy management, and pulmonary care documentation.'),
  make('CL-CP-032','Pediatric Home Health Services','CL','Clinical Operations','CP','Clinical Practice','RECOMMENDED','Defines age-appropriate assessment, service delivery, and family engagement standards for pediatric patients.'),
  make('CL-CP-033','Behavioral Health Screening & Referral','CL','Clinical Operations','CP','Clinical Practice','ESSENTIAL','Mandates behavioral health screening at SOC and as indicated, with defined referral pathways and documentation requirements.'),
  make('CL-CP-034','Palliative & End-of-Life Care','CL','Clinical Operations','CP','Clinical Practice','ESSENTIAL','Establishes standards for palliative care delivery, advance directive discussions, and hospice referral coordination.'),
  make('CL-CP-035','Patient Rights & Responsibilities','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Ensures patient rights are communicated, documented, and protected per 42 CFR 484.50 including notice requirements.'),
  make('CL-CP-036','Advance Directive Compliance','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines requirements for identifying, documenting, and honoring patient advance directives per federal and state law.'),
  make('CL-CP-037','Informed Consent','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes requirements for obtaining and documenting informed consent for all home health services.'),
  make('CL-CP-038','Restraint & Seclusion Prohibition','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Prohibits the use of restraints or seclusion in home health and defines protocols for managing unsafe patient situations.'),
  make('CL-CP-039','Clinical Record Content & Organization','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines minimum required content, organization standards, and retention requirements for patient clinical records.'),
  make('CL-CP-040','Missed Visit & Rescheduling','CL','Clinical Operations','CP','Clinical Practice','ESSENTIAL','Establishes protocols for managing, documenting, and reporting missed visits and rescheduling requirements.'),
  make('CL-CP-041','Recertification Assessment & Process','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines the assessment, documentation, and physician approval process for recertification of home health eligibility.'),
  make('CL-CP-042','Homebound Status Determination & Documentation','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes criteria and documentation requirements for determining and verifying patient homebound status per CMS guidelines.'),
  make('CL-CP-043','Face-to-Face Encounter Compliance','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Defines requirements for physician or allowed practitioner face-to-face encounters per 42 CFR 484.55.'),
  make('CL-CP-044','Emergency Preparedness — Clinical','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Establishes clinical protocols for patient care continuity during declared emergencies and disasters per 42 CFR 484.102.'),
  make('CL-CP-045','Abuse, Neglect & Exploitation Reporting','CL','Clinical Operations','CP','Clinical Practice','REQUIRED','Mandates identification, reporting, and documentation of suspected abuse, neglect, or exploitation per state and federal requirements.'),
];

// ──────────────────────────────────────────────────────────────
// DOMAIN: CL — Clinical Operations / Subdomain: OA
// ──────────────────────────────────────────────────────────────
const CL_OA: Policy[] = [
  make('CL-OA-001','OASIS Completion Timeliness & Accountability','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','Defines required timeframes for OASIS completion at each assessment time point and establishes accountability for late or incomplete assessments.'),
  make('CL-OA-002','OASIS Quality Review & Error Correction','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','Establishes a structured quality review process for completed OASIS assessments and defines the error correction and resubmission process.'),
  make('CL-OA-003','OASIS Clinician Authorization & Competency','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','Restricts OASIS completion to clinicians who have demonstrated competency through validated assessment and maintains a current authorization roster.'),
  make('CL-OA-004','OASIS Item-Level Guidance Compliance','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','Requires all OASIS responses to align with the current CMS OASIS Guidance Manual and prohibits agency-created coding interpretations that conflict with CMS guidance.'),
  make('CL-OA-005','OASIS Data Integrity & Security','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','Establishes controls to ensure OASIS data is accurate, complete, securely transmitted, and protected from unauthorized access or modification.'),
  make('CL-OA-006','Documentation Hierarchy and Evidence Source Prioritization','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','Establishes the priority ranking of evidence sources for all clinical coding and assessment decisions.'),
  make('CL-OA-007','Evidence-Based OASIS Coding Substantiation','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','All OASIS item responses must be supported by verifiable, contemporaneous clinical documentation within the medical record.'),
  make('CL-OA-008','Conflicting Documentation Source Resolution','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','When documentation contains conflicting clinical information, clinicians must follow a standardized reconciliation process.'),
  make('CL-OA-009','Point-in-Time Assessment at Start of Care','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','All SOC and ROC assessments must reflect the patient\'s status at the time of the assessment encounter.'),
  make('CL-OA-010','CMS Look-Back Period Compliance for Assessment Items','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','All OASIS items with CMS-defined look-back periods must be coded using only information falling within the specified timeframe.'),
  make('CL-OA-011','Standardized Assessment Tool Administration and Validity','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','CMS-required standardized tools including BIMS, PHQ-2/PHQ-9, and MAHC-10 must be administered according to validated protocols.'),
  make('CL-OA-012','Clinical Reasoning Documentation for Coding Decisions','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','When a coding decision involves clinical judgment beyond direct observation, the clinician must document the reasoning supporting the selected response.'),
  make('CL-OA-013','Cross-Document Verification Prior to Assessment Finalization','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','Prior to finalizing any comprehensive assessment, the assessing clinician must reconcile findings against all available documentation sources.'),
  make('CL-OA-014','Medication Reconciliation — Prescribed Regimen vs. Actual Patient Behavior','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','Medication-related assessment items must distinguish between the prescribed regimen and actual medication-taking behavior.'),
  make('CL-OA-015','Assessment Completion Timeframe Compliance','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','All comprehensive assessments must be completed and locked within CMS-defined timeframes including the five-day SOC window.'),
  make('CL-OA-016','Scoring Methodology Integrity for Multi-Item Assessments','CL','Clinical Operations','OA','OASIS & Assessment Governance','ESSENTIAL','For OASIS items derived from multi-component standardized tools, individual item scores must be correctly calculated.'),
  make('CL-OA-017','Contemporaneous Documentation Requirement','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','All clinical findings, observations, and assessment data must be documented at or near the time of encounter.'),
  make('CL-OA-018','Clinician Competency Validation for OASIS Assessment','CL','Clinical Operations','OA','OASIS & Assessment Governance','REQUIRED','The agency must maintain a validated competency assessment process for all clinicians authorized to complete OASIS assessments.'),
  make('CL-OA-019','Pre-Submission Quality Review for Comprehensive Assessments','CL','Clinical Operations','OA','OASIS & Assessment Governance','ESSENTIAL','A structured quality review process must verify internal consistency across related OASIS items prior to submission.'),
];

// ──────────────────────────────────────────────────────────────
// DOMAIN: QA — Quality Assurance & Performance Improvement
// ──────────────────────────────────────────────────────────────
const QA: Policy[] = [
  make('QA-QP-001','QAPI Program Establishment & Governance','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','REQUIRED','Establishes the agency\'s QAPI program structure, leadership accountability, and governing body oversight per 42 CFR 484.65.'),
  make('QA-QP-002','QAPI Plan Development & Annual Review','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','REQUIRED','Mandates development of a written QAPI plan with defined goals, measurable indicators, and annual review by the governing body.'),
  make('QA-QP-003','Performance Improvement Project Management','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','REQUIRED','Defines requirements for selecting, implementing, monitoring, and documenting performance improvement projects.'),
  make('QA-QP-004','Quality Indicator Monitoring & Reporting','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','REQUIRED','Establishes the agency\'s quality indicator dashboard, monitoring frequency, and escalation thresholds for adverse trends.'),
  make('QA-QP-005','Adverse Event Identification & Reporting','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','REQUIRED','Defines what constitutes an adverse event, reporting requirements, investigation procedures, and corrective action expectations.'),
  make('QA-QP-006','Root Cause Analysis Process','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','REQUIRED','Establishes the methodology and documentation requirements for conducting root cause analysis of significant adverse events.'),
  make('QA-QP-007','Corrective Action Plan Development & Tracking','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','REQUIRED','Defines requirements for developing, implementing, and tracking corrective action plans with measurable outcomes and defined timelines.'),
  make('QA-QP-008','Patient Satisfaction Survey & Analysis','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','ESSENTIAL','Mandates systematic collection, analysis, and response to patient satisfaction data including HHCAHPS results.'),
  make('QA-QP-009','Clinical Outcome Benchmarking','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','ESSENTIAL','Requires comparison of agency clinical outcomes against national benchmarks and CMS quality measures.'),
  make('QA-QP-010','Utilization Review & Management','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','REQUIRED','Establishes the utilization review process for monitoring appropriateness and efficiency of service delivery.'),
  make('QA-QP-011','Infection Surveillance & Trending','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','REQUIRED','Defines the infection surveillance program including data collection, trending, reporting, and response to identified patterns.'),
  make('QA-QP-012','Staff Competency Integration with QAPI','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','ESSENTIAL','Links competency evaluation results to the QAPI program for identification of training needs and system improvement opportunities.'),
  make('QA-QP-013','Patient Safety Program','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','REQUIRED','Establishes a formal patient safety program integrated with QAPI including hazard identification, reporting, and mitigation.'),
  make('QA-QP-014','Data-Driven Decision Making','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','ESSENTIAL','Requires that all quality improvement initiatives and operational decisions be supported by documented data analysis.'),
  make('QA-QP-015','QAPI Committee Structure & Meeting Requirements','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','REQUIRED','Defines QAPI committee composition, meeting frequency, documentation requirements, and escalation to the governing body.'),
  make('QA-QP-016','Home Health Compare & Star Rating Monitoring','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','ESSENTIAL','Establishes ongoing monitoring of the agency\'s Home Health Compare data and Star Ratings with documented response plans.'),
  make('QA-QP-017','Policy Effectiveness Monitoring and Outcome Validation','QA','Quality Assurance & Performance Improvement','QP','Quality & Performance','REQUIRED','Requires measurement of policy effectiveness through defined outcome indicators, compliance metrics, and incident correlation analysis.'),
];

// ──────────────────────────────────────────────────────────────
// DOMAIN: HR — Human Resources
// ──────────────────────────────────────────────────────────────
const HR: Policy[] = [
  make('HR-HR-001','Recruitment & Hiring Standards','HR','Human Resources','HR','Human Resources','REQUIRED','Establishes minimum standards for recruitment, screening, and hiring processes to ensure qualified and eligible workforce.'),
  make('HR-HR-002','Criminal Background Check & Screening','HR','Human Resources','HR','Human Resources','REQUIRED','Mandates pre-employment and periodic criminal background checks, OIG/SAM exclusion screening, and documentation requirements.'),
  make('HR-HR-003','OIG/SAM Exclusion Screening','HR','Human Resources','HR','Human Resources','REQUIRED','Requires monthly screening of all employees and contractors against the OIG exclusion list and SAM database with documented results.'),
  make('HR-HR-004','Licensure & Certification Verification','HR','Human Resources','HR','Human Resources','REQUIRED','Defines requirements for verifying and maintaining current professional licenses and certifications for all clinical staff.'),
  make('HR-HR-005','Employee Orientation & Onboarding','HR','Human Resources','HR','Human Resources','REQUIRED','Establishes mandatory orientation content, timeframes, and documentation requirements for all new employees.'),
  make('HR-HR-006','Annual Mandatory Training Requirements','HR','Human Resources','HR','Human Resources','REQUIRED','Defines the agency\'s annual training requirements including compliance, safety, infection control, and clinical competency topics.'),
  make('HR-HR-007','Continuing Education & Professional Development','HR','Human Resources','HR','Human Resources','ESSENTIAL','Establishes standards for ongoing continuing education tracking, support, and documentation for professional staff.'),
  make('HR-HR-008','Clinical Staff Competency Evaluation','HR','Human Resources','HR','Human Resources','REQUIRED','Mandates initial and ongoing competency evaluation for all clinical staff with documented assessment tools and remediation processes.'),
  make('HR-HR-009','Job Description & Role Definition','HR','Human Resources','HR','Human Resources','REQUIRED','Requires written job descriptions with defined qualifications, responsibilities, and reporting relationships for all positions.'),
  make('HR-HR-010','Performance Evaluation & Review','HR','Human Resources','HR','Human Resources','ESSENTIAL','Establishes the process, frequency, and documentation requirements for employee performance evaluations.'),
  make('HR-HR-011','Disciplinary Action & Progressive Discipline','HR','Human Resources','HR','Human Resources','REQUIRED','Defines the progressive discipline process including documentation requirements, appeal rights, and termination criteria.'),
  make('HR-HR-012','Employee Grievance & Complaint Process','HR','Human Resources','HR','Human Resources','REQUIRED','Establishes a formal process for employees to file grievances without retaliation, including investigation and resolution procedures.'),
  make('HR-HR-013','Staffing Levels & Workload Management','HR','Human Resources','HR','Human Resources','ESSENTIAL','Defines minimum staffing requirements, caseload limits, and workload monitoring to ensure adequate service delivery capacity.'),
  make('HR-HR-014','Contractor & Per Diem Staff Management','HR','Human Resources','HR','Human Resources','REQUIRED','Establishes requirements for qualifying, onboarding, supervising, and monitoring contracted and per diem clinical staff.'),
  make('HR-HR-015','Employee Health & Immunization Requirements','HR','Human Resources','HR','Human Resources','REQUIRED','Defines pre-employment and ongoing health screening, immunization requirements, and fitness-for-duty standards.'),
  make('HR-HR-016','Workplace Safety & Injury Prevention','HR','Human Resources','HR','Human Resources','REQUIRED','Establishes workplace safety standards, injury prevention protocols, and workers\' compensation reporting requirements.'),
  make('HR-HR-017','Anti-Harassment & Non-Discrimination','HR','Human Resources','HR','Human Resources','REQUIRED','Defines the agency\'s zero-tolerance policy for harassment and discrimination with reporting and investigation procedures.'),
  make('HR-HR-018','Substance Abuse & Drug-Free Workplace','HR','Human Resources','HR','Human Resources','REQUIRED','Establishes the drug-free workplace policy including testing protocols, prohibited conduct, and consequences.'),
  make('HR-HR-019','Employee Personnel File Management','HR','Human Resources','HR','Human Resources','REQUIRED','Defines content requirements, access controls, and retention standards for employee personnel files.'),
  make('HR-HR-020','Separation & Exit Process','HR','Human Resources','HR','Human Resources','ESSENTIAL','Establishes procedures for voluntary and involuntary separation including final documentation, property return, and access revocation.'),
  make('HR-HR-021','Volunteer Management & Oversight','HR','Human Resources','HR','Human Resources','RECOMMENDED','Defines standards for recruiting, training, supervising, and documenting volunteer activities within the agency.'),
  make('HR-HR-022','Student & Intern Supervision','HR','Human Resources','HR','Human Resources','RECOMMENDED','Establishes requirements for supervising students and interns including preceptor qualifications and evaluation processes.'),
  make('HR-HR-023','Workforce Diversity & Inclusion','HR','Human Resources','HR','Human Resources','RECOMMENDED','Defines the agency\'s commitment to workforce diversity and establishes related recruitment and retention strategies.'),
  make('HR-HR-024','Remote Work & Flexible Scheduling','HR','Human Resources','HR','Human Resources','RECOMMENDED','Establishes standards for remote work eligibility, expectations, security requirements, and performance monitoring.'),
];

// ──────────────────────────────────────────────────────────────
// DOMAIN: CO — Compliance & Regulatory
// ──────────────────────────────────────────────────────────────
const CO: Policy[] = [
  make('CO-CR-001','Corporate Compliance Program','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Establishes the agency\'s comprehensive compliance program per OIG guidance including structure, oversight, and enforcement mechanisms.'),
  make('CO-CR-002','Compliance Officer Designation & Authority','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Defines the role, authority, qualifications, and reporting structure of the designated compliance officer.'),
  make('CO-CR-003','Compliance Committee Structure & Function','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Establishes the compliance committee composition, meeting requirements, and relationship to the governing body.'),
  make('CO-CR-004','Code of Conduct & Ethics','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Defines the agency\'s standards of conduct, ethical expectations, and consequences for violations applicable to all workforce members.'),
  make('CO-CR-005','Whistleblower Protection & Non-Retaliation','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Establishes protections for individuals who report suspected compliance violations in good faith, prohibiting retaliation.'),
  make('CO-CR-006','Compliance Hotline & Reporting Mechanisms','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Defines multiple accessible mechanisms for anonymous and non-anonymous reporting of suspected compliance violations.'),
  make('CO-CR-007','Compliance Investigation Process','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Establishes the process for investigating compliance reports including documentation, confidentiality, and resolution requirements.'),
  make('CO-CR-008','Regulatory Change Monitoring & Implementation','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Mandates systematic monitoring of federal, state, and local regulatory changes with defined processes for impact assessment.'),
  make('CO-CR-009','Internal Compliance Auditing Program','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Establishes the internal audit program including scope, frequency, methodology, reporting, and corrective action requirements.'),
  make('CO-CR-010','External Audit & Survey Readiness','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Defines the agency\'s continuous survey readiness program including mock surveys, staff preparation, and documentation standards.'),
  make('CO-CR-011','Anti-Kickback & Stark Law Compliance','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Establishes safeguards against violations of the Anti-Kickback Statute and Stark Law including referral relationship monitoring.'),
  make('CO-CR-012','False Claims Act Awareness & Prevention','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Defines the agency\'s education and prevention program for False Claims Act compliance including the 60-day repayment rule.'),
  make('CO-CR-013','HIPAA Privacy Program','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Establishes the agency\'s privacy program per HIPAA Privacy Rule including PHI use, disclosure, and patient rights.'),
  make('CO-CR-014','HIPAA Security Program','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Defines administrative, physical, and technical safeguards for electronic protected health information per HIPAA Security Rule.'),
  make('CO-CR-015','HIPAA Breach Notification','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Establishes breach identification, risk assessment, notification, and documentation procedures per HIPAA Breach Notification Rule.'),
  make('CO-CR-016','Minimum Necessary Standard','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Defines the minimum necessary standard for PHI access, use, and disclosure across all agency operations.'),
  make('CO-CR-017','Business Associate Agreement Management','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Mandates BAA execution, content requirements, and monitoring for all entities accessing PHI on the agency\'s behalf.'),
  make('CO-CR-018','Patient Access to Records','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Defines procedures for fulfilling patient requests to access, amend, or receive an accounting of disclosures of their health information.'),
  make('CO-CR-019','Record Retention & Destruction','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Establishes retention periods, storage requirements, and secure destruction procedures for all agency records.'),
  make('CO-CR-020','Fraud, Waste & Abuse Prevention','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Defines the agency\'s FWA prevention, detection, and reporting program per CMS and OIG requirements.'),
  make('CO-CR-021','Medicare Conditions of Participation Compliance','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Mandates continuous compliance with all applicable CMS Conditions of Participation with defined monitoring and accountability mechanisms.'),
  make('CO-CR-022','State Licensure & Regulatory Compliance','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Establishes processes for maintaining compliance with all applicable state home health licensure requirements and regulations.'),
  make('CO-CR-023','Accreditation Standards Compliance','CO','Compliance & Regulatory','CR','Compliance & Regulatory','ESSENTIAL','Defines processes for maintaining compliance with applicable accreditation body standards and requirements.'),
  make('CO-CR-024','Sanctions & Enforcement Response','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Establishes the agency\'s response protocol for regulatory sanctions, citations, or enforcement actions including remediation timelines.'),
  make('CO-CR-025','Compliance Training & Education','CO','Compliance & Regulatory','CR','Compliance & Regulatory','REQUIRED','Mandates initial and ongoing compliance training for all workforce members with documented completion and competency validation.'),
  make('CO-DC-001','Assessment Audit Trail and Data Integrity','CO','Compliance & Regulatory','DC','Documentation Compliance','REQUIRED','Requires all assessment entries, modifications, and coding decisions to be captured in a timestamped, version-controlled audit trail.'),
];

// ──────────────────────────────────────────────────────────────
// DOMAIN: FN — Finance & Revenue Cycle
// ──────────────────────────────────────────────────────────────
const FN: Policy[] = [
  make('FN-RC-001','Medicare Billing & Claims Submission','FN','Finance & Revenue Cycle','RC','Revenue Cycle','REQUIRED','Establishes standards for accurate, timely, and compliant Medicare claims submission per CMS billing requirements.'),
  make('FN-RC-002','PDGM Classification & Coding Accuracy','FN','Finance & Revenue Cycle','RC','Revenue Cycle','REQUIRED','Defines requirements for accurate PDGM classification including clinical grouping, functional level, and comorbidity adjustment verification.'),
  make('FN-RC-003','ICD-10 Coding Standards & Accuracy','FN','Finance & Revenue Cycle','RC','Revenue Cycle','REQUIRED','Establishes coding standards requiring diagnosis codes to be supported by clinical documentation and assigned by qualified personnel.'),
  make('FN-RC-004','Request for Anticipated Payment (RAP) Management','FN','Finance & Revenue Cycle','RC','Revenue Cycle','ESSENTIAL','Defines procedures for RAP submission, monitoring, and reconciliation per current CMS payment rules.'),
  make('FN-RC-005','Claims Denial Management & Appeals','FN','Finance & Revenue Cycle','RC','Revenue Cycle','REQUIRED','Establishes the process for tracking, analyzing, appealing, and preventing claims denials.'),
  make('FN-RC-006','Medical Necessity Documentation','FN','Finance & Revenue Cycle','RC','Revenue Cycle','REQUIRED','Defines documentation requirements to support medical necessity for all services billed to Medicare and other payers.'),
  make('FN-RC-007','Episode Management & Authorization','FN','Finance & Revenue Cycle','RC','Revenue Cycle','REQUIRED','Establishes procedures for managing certification periods, authorizations, and episode transitions.'),
  make('FN-RC-008','LUPA Prevention & Monitoring','FN','Finance & Revenue Cycle','RC','Revenue Cycle','ESSENTIAL','Defines monitoring and intervention protocols to minimize Low Utilization Payment Adjustments through visit management.'),
  make('FN-RC-009','Payment & Reimbursement Reconciliation','FN','Finance & Revenue Cycle','RC','Revenue Cycle','REQUIRED','Mandates regular reconciliation of expected versus actual payments with investigation of discrepancies.'),
  make('FN-RC-010','Patient Billing & Financial Responsibility','FN','Finance & Revenue Cycle','RC','Revenue Cycle','REQUIRED','Establishes standards for patient billing, advance beneficiary notices, and collection of patient financial responsibilities.'),
  make('FN-RC-011','Overpayment Identification & Refund','FN','Finance & Revenue Cycle','RC','Revenue Cycle','REQUIRED','Defines the process for identifying, reporting, and refunding overpayments within the CMS 60-day repayment requirement.'),
  make('FN-RC-012','Payer Contract Management','FN','Finance & Revenue Cycle','RC','Revenue Cycle','ESSENTIAL','Establishes standards for negotiating, monitoring, and managing contracts with Medicare Advantage and commercial payers.'),
  make('FN-RC-013','Charge Capture & Fee Schedule Management','FN','Finance & Revenue Cycle','RC','Revenue Cycle','ESSENTIAL','Defines processes for maintaining accurate charge descriptions, fee schedules, and charge capture procedures.'),
  make('FN-RC-014','Revenue Cycle Performance Monitoring','FN','Finance & Revenue Cycle','RC','Revenue Cycle','ESSENTIAL','Establishes key revenue cycle metrics, monitoring frequency, and escalation thresholds for financial performance management.'),
  make('FN-RC-015','Pre-Claim Review Compliance','FN','Finance & Revenue Cycle','RC','Revenue Cycle','REQUIRED','Defines procedures for complying with CMS Pre-Claim Review demonstration programs when applicable.'),
  make('FN-RC-016','Bad Debt & Charity Care','FN','Finance & Revenue Cycle','RC','Revenue Cycle','RECOMMENDED','Establishes criteria and procedures for classifying and managing bad debt and charity care write-offs.'),
  make('FN-RC-017','Annual Budget & Financial Planning','FN','Finance & Revenue Cycle','RC','Revenue Cycle','ESSENTIAL','Mandates annual budget development, governing body approval, and ongoing variance monitoring.'),
  make('FN-RC-018','Supply & Equipment Cost Management','FN','Finance & Revenue Cycle','RC','Revenue Cycle','RECOMMENDED','Defines procurement standards, cost controls, and inventory management for medical supplies and equipment.'),
];

// ──────────────────────────────────────────────────────────────
// DOMAIN: OP — Operations
// ──────────────────────────────────────────────────────────────
const OP: Policy[] = [
  make('OP-OP-001','Referral & Intake Management','OP','Operations','OP','Operations','REQUIRED','Establishes standards for referral receipt, screening, eligibility determination, and timely intake processing.'),
  make('OP-OP-002','Scheduling & Visit Management','OP','Operations','OP','Operations','REQUIRED','Defines scheduling standards including timeliness, frequency compliance, and patient notification requirements.'),
  make('OP-OP-003','Service Area Definition & Coverage','OP','Operations','OP','Operations','REQUIRED','Defines the agency\'s geographic service area boundaries and standards for ensuring coverage throughout the defined area.'),
  make('OP-OP-004','After-Hours & On-Call Services','OP','Operations','OP','Operations','REQUIRED','Establishes 24/7 availability requirements, on-call staffing, and after-hours clinical response protocols per CMS CoP.'),
  make('OP-OP-005','Patient Acceptance & Admission Criteria','OP','Operations','OP','Operations','REQUIRED','Defines clinical and operational criteria for patient acceptance including non-discrimination requirements and service capability assessment.'),
  make('OP-OP-006','Vehicle & Transportation Safety','OP','Operations','OP','Operations','ESSENTIAL','Establishes standards for staff vehicle use, mileage documentation, insurance requirements, and transportation safety.'),
  make('OP-OP-007','Equipment & Supply Management','OP','Operations','OP','Operations','ESSENTIAL','Defines procedures for procurement, maintenance, calibration, and replacement of medical equipment and supplies.'),
  make('OP-OP-008','Office Operations & Facility Management','OP','Operations','OP','Operations','RECOMMENDED','Establishes standards for office operations, facility maintenance, and workspace safety.'),
  make('OP-OP-009','Communication & Documentation Systems','OP','Operations','OP','Operations','REQUIRED','Defines requirements for communication systems supporting clinical operations including EMR, telephony, and secure messaging.'),
  make('OP-OP-010','Branch Office & Satellite Operations','OP','Operations','OP','Operations','RECOMMENDED','Establishes standards for operating and overseeing branch offices or satellite locations.'),
  make('OP-OP-011','Patient Complaint & Grievance Resolution','OP','Operations','OP','Operations','REQUIRED','Defines the process for receiving, investigating, and resolving patient complaints with documentation and trending requirements.'),
  make('OP-OP-012','Emergency Operations & Business Continuity','OP','Operations','OP','Operations','REQUIRED','Establishes the agency\'s emergency preparedness, response, and business continuity plan per 42 CFR 484.102.'),
  make('OP-OP-013','Inclement Weather & Hazardous Conditions','OP','Operations','OP','Operations','ESSENTIAL','Defines protocols for managing service delivery during inclement weather, natural disasters, and hazardous conditions.'),
  make('OP-OP-014','Mail & Correspondence Management','OP','Operations','OP','Operations','GOOD TO HAVE','Establishes standards for handling agency mail, correspondence, and official communications.'),
  make('OP-OP-015','Vendor & Supplier Management','OP','Operations','OP','Operations','ESSENTIAL','Defines standards for vendor selection, qualification, monitoring, and performance evaluation.'),
  make('OP-OP-016','Patient Property & Belongings','OP','Operations','OP','Operations','ESSENTIAL','Establishes protocols for respecting and safeguarding patient property during home health visits.'),
  make('OP-OP-017','Service Delivery During Public Health Emergencies','OP','Operations','OP','Operations','REQUIRED','Defines clinical and operational protocols for maintaining services during public health emergencies including pandemic response.'),
  make('OP-OP-018','Patient Identification & Verification','OP','Operations','OP','Operations','REQUIRED','Establishes standards for verifying patient identity at each visit to prevent service delivery errors.'),
  make('OP-OP-019','Interpreter & Language Access Services','OP','Operations','OP','Operations','REQUIRED','Defines standards for providing language access services to patients with limited English proficiency.'),
  make('OP-OP-020','Cultural Competency in Service Delivery','OP','Operations','OP','Operations','ESSENTIAL','Establishes standards for culturally sensitive and respectful service delivery across diverse patient populations.'),
];

// ──────────────────────────────────────────────────────────────
// DOMAIN: IT — Technology & Information Security
// ──────────────────────────────────────────────────────────────
const IT: Policy[] = [
  make('IT-IS-001','Information Security Program','IT','Technology & Information Security','IS','Information Security','REQUIRED','Establishes the agency\'s comprehensive information security program including governance, risk management, and security controls.'),
  make('IT-IS-002','Access Control & User Authentication','IT','Technology & Information Security','IS','Information Security','REQUIRED','Defines access control standards including role-based access, password requirements, and multi-factor authentication.'),
  make('IT-IS-003','Data Encryption Standards','IT','Technology & Information Security','IS','Information Security','REQUIRED','Mandates encryption standards for PHI at rest and in transit per HIPAA Security Rule requirements.'),
  make('IT-IS-004','Network Security & Firewall Management','IT','Technology & Information Security','IS','Information Security','REQUIRED','Establishes network security controls including firewall configuration, intrusion detection, and network segmentation.'),
  make('IT-IS-005','Mobile Device & BYOD Security','IT','Technology & Information Security','IS','Information Security','REQUIRED','Defines security requirements for mobile devices, personal devices, and remote access to agency systems.'),
  make('IT-IS-006','Endpoint Security & Malware Protection','IT','Technology & Information Security','IS','Information Security','REQUIRED','Establishes standards for endpoint protection including antivirus, anti-malware, and patch management requirements.'),
  make('IT-IS-007','Data Backup & Recovery','IT','Technology & Information Security','IS','Information Security','REQUIRED','Defines data backup frequency, storage requirements, testing procedures, and recovery time objectives.'),
  make('IT-IS-008','Disaster Recovery & IT Continuity','IT','Technology & Information Security','IS','Information Security','REQUIRED','Establishes the IT disaster recovery plan including recovery procedures, testing frequency, and communication protocols.'),
  make('IT-IS-009','Security Incident Response','IT','Technology & Information Security','IS','Information Security','REQUIRED','Defines the process for detecting, reporting, investigating, and responding to information security incidents.'),
  make('IT-IS-010','Audit Log Management & Monitoring','IT','Technology & Information Security','IS','Information Security','REQUIRED','Mandates system audit logging standards including retention periods, review frequency, and alert thresholds.'),
  make('IT-IS-011','Vendor & Third-Party Security Assessment','IT','Technology & Information Security','IS','Information Security','REQUIRED','Establishes security assessment requirements for technology vendors and third parties with access to agency systems or data.'),
  make('IT-IS-012','Electronic Health Record System Management','IT','Technology & Information Security','IS','Information Security','REQUIRED','Defines EHR system administration standards including configuration management, update procedures, and data integrity controls.'),
  make('IT-IS-013','Internet & Email Acceptable Use','IT','Technology & Information Security','IS','Information Security','ESSENTIAL','Establishes acceptable use standards for agency internet, email, and communication systems.'),
  make('IT-IS-014','Social Media & Public Communications','IT','Technology & Information Security','IS','Information Security','ESSENTIAL','Defines standards for agency and employee social media use to protect patient privacy and agency reputation.'),
  make('IT-IS-015','Software Acquisition & License Management','IT','Technology & Information Security','IS','Information Security','ESSENTIAL','Establishes standards for software procurement, licensing compliance, and shadow IT prevention.'),
  make('IT-IS-016','Physical Security of IT Assets','IT','Technology & Information Security','IS','Information Security','ESSENTIAL','Defines physical security requirements for servers, workstations, and devices containing PHI.'),
  make('IT-IS-017','Security Awareness Training','IT','Technology & Information Security','IS','Information Security','REQUIRED','Mandates initial and ongoing security awareness training for all workforce members with documented completion.'),
  make('IT-IS-018','Cloud Services & Data Storage','IT','Technology & Information Security','IS','Information Security','ESSENTIAL','Establishes security and compliance requirements for cloud-based services and off-premises data storage.'),
  make('IT-IS-019','System Change Management','IT','Technology & Information Security','IS','Information Security','ESSENTIAL','Defines change management procedures for IT systems including testing, approval, and rollback requirements.'),
  make('IT-IS-020','Data Classification & Handling','IT','Technology & Information Security','IS','Information Security','REQUIRED','Establishes data classification levels and corresponding handling, storage, transmission, and destruction requirements.'),
];

// ──────────────────────────────────────────────────────────────
// DOMAIN: RM — Risk Management & Safety
// ──────────────────────────────────────────────────────────────
const RM: Policy[] = [
  make('RM-RS-001','Enterprise Risk Management Program','RM','Risk Management & Safety','RS','Risk & Safety','REQUIRED','Establishes the agency\'s comprehensive risk management program including governance structure, risk identification, and mitigation strategies.'),
  make('RM-RS-002','Incident Reporting & Investigation','RM','Risk Management & Safety','RS','Risk & Safety','REQUIRED','Defines requirements for reporting, documenting, and investigating all incidents, near-misses, and adverse events.'),
  make('RM-RS-003','Risk Assessment & Prioritization','RM','Risk Management & Safety','RS','Risk & Safety','REQUIRED','Mandates regular risk assessments across all operational domains with documented risk scoring and prioritization.'),
  make('RM-RS-004','Liability & Insurance Management','RM','Risk Management & Safety','RS','Risk & Safety','REQUIRED','Establishes requirements for maintaining adequate professional liability, general liability, and workers\' compensation insurance.'),
  make('RM-RS-005','Staff Safety & Personal Security','RM','Risk Management & Safety','RS','Risk & Safety','REQUIRED','Defines protocols for staff safety during home visits including threat assessment, communication check-ins, and high-risk visit procedures.'),
  make('RM-RS-006','Environmental Safety Assessment','RM','Risk Management & Safety','RS','Risk & Safety','REQUIRED','Establishes requirements for assessing and documenting the home environment for safety hazards at each admission and as conditions change.'),
  make('RM-RS-007','Hazardous Materials & Waste Management','RM','Risk Management & Safety','RS','Risk & Safety','REQUIRED','Defines procedures for safe handling, storage, and disposal of biohazardous materials and medical waste per OSHA standards.'),
  make('RM-RS-008','Workplace Violence Prevention','RM','Risk Management & Safety','RS','Risk & Safety','REQUIRED','Establishes the agency\'s workplace violence prevention program including risk assessment, reporting, and response protocols.'),
  make('RM-RS-009','Motor Vehicle Safety & Accident Reporting','RM','Risk Management & Safety','RS','Risk & Safety','ESSENTIAL','Defines standards for driving safety, accident reporting, and investigation procedures for staff using vehicles for agency business.'),
  make('RM-RS-010','Risk Trending & Pattern Analysis','RM','Risk Management & Safety','RS','Risk & Safety','ESSENTIAL','Mandates systematic analysis of risk and incident data to identify trends, patterns, and systemic issues requiring intervention.'),
  make('RM-RS-011','Claims Management & Litigation Support','RM','Risk Management & Safety','RS','Risk & Safety','ESSENTIAL','Establishes procedures for managing liability claims, coordinating with legal counsel, and preserving evidence for litigation.'),
  make('RM-RS-012','Product & Equipment Safety Recall Management','RM','Risk Management & Safety','RS','Risk & Safety','ESSENTIAL','Defines procedures for monitoring, responding to, and documenting medical product and equipment safety recalls.'),
  make('RM-RS-013','Pandemic & Infectious Disease Response','RM','Risk Management & Safety','RS','Risk & Safety','REQUIRED','Establishes the agency\'s response framework for pandemic and infectious disease outbreaks including staff protection and patient triage.'),
  make('RM-RS-014','Patient Elopement & Wandering Risk','RM','Risk Management & Safety','RS','Risk & Safety','ESSENTIAL','Defines risk assessment and intervention protocols for patients at risk of elopement or unsafe wandering.'),
  make('RM-RS-015','High-Risk Medication Safety','RM','Risk Management & Safety','RS','Risk & Safety','REQUIRED','Establishes enhanced safety protocols for high-risk medications including anticoagulants, opioids, insulin, and chemotherapy agents.'),
];

// ──────────────────────────────────────────────────────────────
// DOMAIN: EN — Enterprise Control
// ──────────────────────────────────────────────────────────────
const EN: Policy[] = [
  make('EN-EC-001','Enterprise Policy Taxonomy & Classification Governance','EN','Enterprise Control','EC','Enterprise Control','REQUIRED','Establishes the authoritative policy taxonomy structure, domain classification system, and naming conventions governing all agency policies.'),
  make('EN-EC-002','Policy Lifecycle Management & Version Control','EN','Enterprise Control','EC','Enterprise Control','REQUIRED','Defines the complete policy lifecycle from creation through revision, approval, distribution, and archival with mandatory version control.'),
  make('EN-EC-003','Policy Exception & Waiver Management','EN','Enterprise Control','EC','Enterprise Control','REQUIRED','Establishes the formal process for requesting, approving, documenting, and time-limiting exceptions or waivers to established policies.'),
  make('EN-EC-004','Policy Assignment and Role-Based Applicability Governance','EN','Enterprise Control','EC','Enterprise Control','REQUIRED','Defines the formal process for assigning policies to specific workforce roles and managing reassignment when personnel change roles.'),
  make('EN-EC-005','Policy Retirement and Obsolescence Management','EN','Enterprise Control','EC','Enterprise Control','REQUIRED','Defines the formal criteria and process for retiring obsolete, superseded, or no longer applicable policies.'),
  make('EN-EC-006','Regulatory Cross-Reference & Mapping','EN','Enterprise Control','EC','Enterprise Control','ESSENTIAL','Mandates mapping of all policies to applicable regulatory requirements with documented cross-references maintained and updated.'),
  make('EN-EC-007','Policy Compliance Metrics & Dashboard Reporting','EN','Enterprise Control','EC','Enterprise Control','ESSENTIAL','Establishes standard metrics for measuring policy compliance across the enterprise with defined reporting formats and escalation thresholds.'),
  make('EN-EC-008','Inter-Domain Policy Coordination & Conflict Resolution','EN','Enterprise Control','EC','Enterprise Control','ESSENTIAL','Defines the process for identifying and resolving conflicts or inconsistencies between policies across different domains.'),
];

// ──────────────────────────────────────────────────────────────
// Master Export — all 232 policies
// ──────────────────────────────────────────────────────────────
export const ALL_POLICIES: Policy[] = [
  ...GV,
  ...CL_CP,
  ...CL_OA,
  ...QA,
  ...HR,
  ...CO,
  ...FN,
  ...OP,
  ...IT,
  ...RM,
  ...EN,
];

export const DOMAIN_LABELS: Record<string, string> = {
  GV: 'Governance & Administration',
  CL: 'Clinical Operations',
  QA: 'Quality Assurance & Performance Improvement',
  HR: 'Human Resources',
  CO: 'Compliance & Regulatory',
  FN: 'Finance & Revenue Cycle',
  OP: 'Operations',
  IT: 'Technology & Information Security',
  RM: 'Risk Management & Safety',
  EN: 'Enterprise Control',
};

export const ALL_STATUSES: Policy['status'][] = [
  'Draft','Under Review','Revision Requested','Approved','Rejected','Published','Archived',
];

export const ALL_TIERS: Policy['tier'][] = [
  'REQUIRED','ESSENTIAL','RECOMMENDED','GOOD TO HAVE',
];
