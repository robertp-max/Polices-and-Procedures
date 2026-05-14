/* ═══════════════════════════════════════════════════════════════
   FORMS LIBRARY — HR-JD JOB DESCRIPTIONS (12 artifacts)
   ─────────────────────────────────────────────────────────────────
   Regulatory-grade Job Descriptions for a Medicare-certified
   California Home Health Agency (Care Indeed Home Health Care, Inc.)

   Sources of truth:
     • 42 CFR Part 484 — Conditions of Participation
     • California Title 22 — Home Health Agencies
     • OIG Compliance Program Guidance for Home Health
     • OSHA General Industry Standards (29 CFR 1910)
     • ACHC Home Health Standards (where applicable)

   Each JD uses the FormOverride + extra sections architecture.
   ═══════════════════════════════════════════════════════════════ */

import type { FormField, FormSection } from './formsLibraryContent';

interface FormOverride {
  p: string;
  i: string;
  orient?: 'portrait' | 'landscape';
  fields?: FormField[];
  signers?: string[];
  extra?: FormSection[];
}

// ────────────────────────────────────────────────────────────────
// HELPER: standard JD header fields
// ────────────────────────────────────────────────────────────────
function jdHeader(opts: {
  title: string;
  department: string;
  reportsTo: string;
  supervises: string;
  flsa: string;
}): FormField[] {
  return [
    { label: 'Position Title', type: 'text', required: true, col: 2, placeholder: opts.title },
    { label: 'Department', type: 'text', required: true, col: 2, placeholder: opts.department },
    { label: 'Reports To', type: 'text', required: true, col: 2, placeholder: opts.reportsTo },
    { label: 'Supervises', type: 'text', col: 2, placeholder: opts.supervises },
    { label: 'FLSA Classification', type: 'text', col: 2, placeholder: opts.flsa },
    { label: 'Review Cycle', type: 'text', col: 2, placeholder: 'Biennial (every 2 years) or upon regulatory change' },
  ];
}

// ────────────────────────────────────────────────────────────────
// HR-JD-000: GOVERNING BODY
// ────────────────────────────────────────────────────────────────
const JD_000: FormOverride = {
  p: 'Defines the structure, composition, and regulatory responsibilities of the Governing Body of Care Indeed Home Health Care, Inc. as required by 42 CFR § 484.105(a), California Health & Safety Code § 1725 et seq., and ACHC Home Health Standards.',
  i: 'This document is reviewed biennially or upon any change in governing body composition, CMS regulatory guidance, or California licensing requirements. All governing body members must acknowledge receipt.',
  fields: jdHeader({
    title: 'Governing Body Member',
    department: 'Governance & Administration',
    reportsTo: 'N/A — Ultimate Legal Authority',
    supervises: 'Administrator, Compliance Officer (oversight)',
    flsa: 'Not Applicable (Fiduciary/Board)',
  }),
  signers: ['Governing Body Chair', 'Member (Printed Name / Signature)', 'Witness / Administrator'],
  extra: [
    {
      title: 'Position Summary',
      layout: 'narrative',
      body: 'The Governing Body of Care Indeed Home Health Care, Inc. is the legally constituted authority that assumes full legal responsibility for the overall management, operation, and fiscal viability of the home health agency. The Governing Body exercises fiduciary oversight, appoints key personnel, approves all required-tier policies, and ensures ongoing compliance with federal, state, and accreditation requirements. Per 42 CFR § 484.105(a), the Governing Body must ensure that an administrator is appointed who is responsible for the day-to-day management of the agency and that clinical services are supervised by a qualified clinical manager.',
    },
    {
      title: 'Regulatory Authority',
      layout: 'checklist',
      items: [
        '42 CFR § 484.105(a) — Standard: Governing body; full legal authority for agency operation',
        '42 CFR § 484.105(b) — Standard: Administrator appointment and oversight',
        '42 CFR § 484.105(c) — Standard: Clinical manager designation',
        '42 CFR § 484.65 — Condition: Quality Assessment and Performance Improvement (QAPI)',
        '42 CFR § 484.100 — Condition: Compliance with Federal, State, and local laws',
        '42 CFR § 484.102 — Condition: Emergency preparedness',
        'California Health & Safety Code § 1725–1796.6 — Home Health Agency licensure',
        'California Code of Regulations Title 22, Division 5, Chapter 8 — Home Health Agencies',
        'OIG Compliance Program Guidance for Home Health Agencies (2024)',
        'ACHC Home Health Standards — Section I: Organization and Administration',
      ],
    },
    {
      title: 'Minimum Qualifications & Composition',
      layout: 'checklist',
      items: [
        'Legally established through articles of incorporation, operating agreement, or equivalent legal instrument',
        'Composition includes competency in: (a) healthcare operations; (b) financial management; (c) regulatory compliance',
        'Members must not appear on OIG LEIE or SAM exclusion databases',
        'Members must demonstrate fiduciary competence and absence of disqualifying conflicts of interest',
        'Quorum requirements established per bylaws or operating agreement',
      ],
    },
    {
      title: 'Essential Duties & Responsibilities',
      layout: 'checklist',
      items: [
        'Assume and maintain full legal authority for the operation, management, and fiscal viability of the agency [42 CFR § 484.105(a)]',
        'Appoint a qualified Administrator who meets all qualifications in GV-OG-002 and California state law [42 CFR § 484.105(b)]',
        'Appoint or confirm a qualified Clinical Manager/Director of Nursing [42 CFR § 484.105(c)]',
        'Designate a Compliance Officer with authority and independence to operate the compliance program',
        'Approve all REQUIRED-tier policies prior to implementation [42 CFR § 484.105(a)]',
        'Ensure the agency does not provide services beyond those for which it is licensed, staffed, and competent to deliver',
        'Maintain current California home health license (HCAI), Medicare certification, and Medicaid enrollment',
        'Review and approve the annual operating budget and monitor fiscal performance quarterly',
        'Approve the agency QAPI plan annually and direct corrective action when quality indicators fall below threshold [42 CFR § 484.65]',
        'Approve the Emergency Operations and Business Continuity Plan [42 CFR § 484.102]',
        'Convene no fewer than four (4) regular meetings per calendar year with documented minutes',
        'Conduct annual performance evaluation of the Administrator',
        'Review and approve the succession plan for key leadership positions',
      ],
    },
    {
      title: 'QAPI Oversight Responsibilities',
      layout: 'checklist',
      items: [
        'Review and approve the annual QAPI plan including measurable quality indicators and patient safety initiatives [42 CFR § 484.65]',
        'Receive and act upon quarterly QAPI performance reports including quality indicator trends, PIP status, and adverse events',
        'Direct corrective action when quality indicators breach defined thresholds for two consecutive reporting periods',
        'Ensure QAPI program addresses Home Health Compare / Star Rating performance',
      ],
    },
    {
      title: 'Compliance Oversight Responsibilities',
      layout: 'checklist',
      items: [
        'Receive quarterly compliance status reports addressing investigations, audit findings, regulatory changes, and training completion',
        'Act on high-risk compliance deficiencies within 14 calendar days of report receipt',
        'Ensure non-retaliation protections per OIG Compliance Program Guidance and agency policy CO-CP-005',
        'Direct investigation of credible fraud, waste, or abuse concerns per CO-CP-007',
        'Ensure monthly OIG/SAM exclusion screening of all governing body members and key personnel',
      ],
    },
    {
      title: 'Financial Oversight Responsibilities',
      layout: 'checklist',
      items: [
        'Review and approve the annual operating budget no later than 30 days before fiscal year start',
        'Review quarterly financial performance reports including revenue variance, A/R aging, and claims denial rate',
        'Direct corrective action when: revenue deviates >10% below budget, denial rate exceeds 5%, or A/R days exceed 60',
      ],
    },
    {
      title: 'Emergency Preparedness Responsibilities',
      layout: 'checklist',
      items: [
        'Approve the Emergency Operations and Business Continuity Plan annually [42 CFR § 484.102]',
        'Review results of emergency preparedness drills (minimum 2 per year)',
        'Ensure emergency plan addresses communication, continuity of operations, and patient tracking',
      ],
    },
    {
      title: 'Documentation Responsibilities',
      layout: 'checklist',
      items: [
        'Maintain formal minutes for all regular and special meetings documenting attendance, quorum, motions, votes, and directives',
        'Retain governing body records for a minimum of seven (7) years per CO-HP-007',
        'Ensure all appointments, resolutions, and policy approvals are documented in meeting minutes',
      ],
    },
    {
      title: 'Performance Expectations',
      layout: 'narrative',
      body: 'The Governing Body shall demonstrate active oversight — not passive receipt of reports. Meeting minutes must reflect substantive discussion, specific directives, assigned accountability, and defined deadlines. Surveyors under CMS State Operations Manual Appendix B will verify that the Governing Body functions as an active, engaged authority rather than a rubber-stamp entity.',
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// HR-JD-001: ADMINISTRATOR
// ────────────────────────────────────────────────────────────────
const JD_001: FormOverride = {
  p: 'Defines the qualifications, regulatory authority, and operational responsibilities of the Administrator of Care Indeed Home Health Care, Inc. as required by 42 CFR § 484.105(b), California Title 22, and ACHC standards.',
  i: 'Reviewed biennially, upon vacancy, or upon change in CMS/state requirements. The Administrator must meet all qualifications prior to appointment by the Governing Body.',
  fields: jdHeader({
    title: 'Administrator',
    department: 'Executive / Agency Operations',
    reportsTo: 'Governing Body',
    supervises: 'Clinical Manager/DON, Compliance Officer, Business Operations, All Departments',
    flsa: 'Exempt',
  }),
  signers: ['Employee (Administrator)', 'Governing Body Chair', 'Human Resources'],
  extra: [
    {
      title: 'Position Summary',
      layout: 'narrative',
      body: 'The Administrator is appointed by the Governing Body and is responsible for the day-to-day management and operation of Care Indeed Home Health Care, Inc. The Administrator serves as the principal executive officer, ensures regulatory compliance across all operational domains, implements policies approved by the Governing Body, and maintains the agency in a state of continuous survey readiness. Per 42 CFR § 484.105(b), the Administrator must be a licensed physician, a registered nurse, or hold a degree from an accredited educational program in a health-related field, with experience in health service administration and supervision of home health services.',
    },
    {
      title: 'Regulatory Authority',
      layout: 'checklist',
      items: [
        '42 CFR § 484.105(b) — Standard: Administrator qualifications and responsibilities',
        '42 CFR § 484.105(a) — Governing body delegates day-to-day management authority to Administrator',
        '42 CFR § 484.100 — Compliance with Federal, State, and local laws',
        '42 CFR § 484.102 — Emergency preparedness program administration',
        '42 CFR § 484.65 — QAPI program operational responsibility',
        'California Health & Safety Code § 1725–1796.6',
        'California Code of Regulations Title 22, § 74601–74733',
        'ACHC Home Health Standard I.2 — Administrator Qualifications',
      ],
    },
    {
      title: 'Minimum Qualifications',
      layout: 'checklist',
      items: [
        'Licensed physician; OR Registered Nurse; OR holder of a degree from an accredited educational program in a health-related field [42 CFR § 484.105(b)]',
        'Must have experience in health service administration with at least one (1) year of supervisory or administrative experience in home health care or a related health program',
        'Must meet all California Title 22 requirements for home health agency administrator qualification',
        'Must not appear on OIG LEIE or SAM exclusion databases',
        'Must demonstrate competency in Medicare home health regulations, California licensure requirements, and OASIS operational expectations',
      ],
    },
    {
      title: 'Required Licensure/Certification',
      layout: 'checklist',
      items: [
        'Current and active California professional license (if applicable to qualifying credential)',
        'No Medicare/Medicaid exclusion or debarment',
        'Current BLS/CPR certification (recommended)',
      ],
    },
    {
      title: 'Essential Duties & Responsibilities',
      layout: 'checklist',
      items: [
        'Organize and direct the agency\'s ongoing operations in accordance with 42 CFR Part 484 and California Title 22',
        'Implement and enforce all policies and procedures approved by the Governing Body',
        'Ensure the agency maintains valid California HHA license, Medicare certification, and Medicaid enrollment',
        'Ensure adequate staffing levels to meet patient needs and service commitments',
        'Oversee the development, implementation, and annual review of the agency\'s QAPI program [42 CFR § 484.65]',
        'Administer the agency budget, monitor financial performance, and report to the Governing Body quarterly',
        'Ensure all personnel meet qualifications and maintain required licensure and competencies',
        'Serve as the agency liaison to CMS, CDPH, ACHC, and other regulatory bodies',
        'Ensure the agency is in a state of continuous survey readiness',
        'Maintain a personnel structure that ensures adequate supervision of all services furnished',
        'Represent the agency at Governing Body meetings and present operational, financial, and compliance reports',
        'Ensure patient rights are upheld and grievances are investigated and resolved',
      ],
    },
    {
      title: 'QAPI Responsibilities',
      layout: 'checklist',
      items: [
        'Operational oversight of the QAPI program including performance improvement projects, data collection, and outcome monitoring [42 CFR § 484.65]',
        'Report quality indicator trends, adverse events, and Star Rating data to the Governing Body quarterly',
        'Ensure corrective actions are implemented for identified quality deficiencies within defined timeframes',
        'Participate in root cause analysis for serious adverse events or sentinel occurrences',
      ],
    },
    {
      title: 'Compliance Responsibilities',
      layout: 'checklist',
      items: [
        'Ensure the agency\'s corporate compliance program operates effectively per OIG Guidance',
        'Ensure monthly OIG/SAM exclusion screening is completed for all workforce members',
        'Report compliance concerns to the Governing Body and ensure corrective action',
        'Oversee policy acknowledgment and training completion rates across all personnel',
        'Ensure the agency responds to CMS survey findings within required timeframes',
      ],
    },
    {
      title: 'Emergency Preparedness Responsibilities',
      layout: 'checklist',
      items: [
        'Develop, maintain, and operationally test the Emergency Operations and Business Continuity Plan [42 CFR § 484.102]',
        'Conduct a minimum of two (2) emergency preparedness drills per year (one community-based)',
        'Maintain current memoranda of understanding with community partners',
        'Ensure patient tracking and communication systems are operable during emergencies',
        'Report drill results and corrective actions to the Governing Body',
      ],
    },
    {
      title: 'Infection Prevention Responsibilities',
      layout: 'checklist',
      items: [
        'Ensure the agency maintains an effective infection prevention and control program [42 CFR § 484.70]',
        'Allocate resources for infection surveillance, training, and PPE supply',
        'Ensure annual infection control risk assessment is completed and reported to the Governing Body',
      ],
    },
    {
      title: 'Documentation Responsibilities',
      layout: 'checklist',
      items: [
        'Ensure clinical records are maintained per 42 CFR § 484.110 and retained per state and federal requirements',
        'Ensure personnel records document qualifications, licensure, competency, and training',
        'Maintain governing body minutes, policy acknowledgments, and compliance records per retention policy',
      ],
    },
    {
      title: 'HIPAA/Confidentiality Responsibilities',
      layout: 'checklist',
      items: [
        'Serve as the senior official responsible for HIPAA compliance and Privacy/Security program implementation',
        'Ensure workforce HIPAA training is completed and documented annually',
        'Ensure breach notification procedures are followed within regulatory timeframes (45 CFR Part 164)',
      ],
    },
    {
      title: 'OSHA/Safety Responsibilities',
      layout: 'checklist',
      items: [
        'Ensure the agency complies with OSHA General Industry Standards (29 CFR 1910)',
        'Maintain Cal/OSHA Injury and Illness Prevention Program (IIPP) as required by CCR Title 8 § 3203',
        'Ensure bloodborne pathogen exposure control plan is current and accessible',
        'Investigate workplace injuries and near-miss events; implement corrective actions',
      ],
    },
    {
      title: 'Physical Requirements & Working Conditions',
      layout: 'checklist',
      items: [
        'Primarily office-based with occasional travel to patient homes, healthcare facilities, and regulatory agencies',
        'Must be able to operate standard office equipment and electronic health record systems',
        'Available for after-hours emergency contact as required by agency operations',
        'May be required to work extended hours during surveys, audits, or emergency events',
      ],
    },
    {
      title: 'Performance Expectations',
      layout: 'narrative',
      body: 'The Administrator will be evaluated annually by the Governing Body. Performance metrics include: survey readiness (no Condition-level deficiencies), financial performance (variance within 10% of budget), workforce stability (turnover below industry average), quality metrics (Star Rating at or above 3.5), compliance metrics (zero unresolved high-risk findings), and patient satisfaction (HHCAHPS above national average). Failure to maintain survey readiness or fiscal viability may result in corrective action up to and including removal by the Governing Body.',
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// HR-JD-002: ADMINISTRATOR DESIGNEE
// ────────────────────────────────────────────────────────────────
const JD_002: FormOverride = {
  p: 'Defines the qualifications and delegated authority of the Administrator Designee who acts in the Administrator\'s absence per the agency succession plan, 42 CFR § 484.105(b), and California Title 22.',
  i: 'Reviewed biennially or upon any change in succession plan. The designee must meet Administrator qualifications and be pre-approved by the Governing Body.',
  fields: jdHeader({
    title: 'Administrator Designee',
    department: 'Executive / Agency Operations',
    reportsTo: 'Administrator / Governing Body (when acting)',
    supervises: 'Per delegation — same scope as Administrator when activated',
    flsa: 'Exempt',
  }),
  signers: ['Employee (Administrator Designee)', 'Administrator', 'Governing Body Chair'],
  extra: [
    {
      title: 'Position Summary',
      layout: 'narrative',
      body: 'The Administrator Designee is a pre-qualified individual authorized by the Governing Body to assume the full duties and authority of the Administrator during planned or unplanned absences. This position ensures continuous compliance with 42 CFR § 484.105(b) which requires that a qualified administrator is responsible for the day-to-day management of the agency at all times. The designee must meet the same qualifications as the Administrator and be capable of immediate activation per the agency succession plan (GV-GB-004).',
    },
    {
      title: 'Regulatory Authority',
      layout: 'checklist',
      items: [
        '42 CFR § 484.105(b) — Administrator qualifications and responsibilities (applies when activated)',
        'GV-GB-004 — Succession Planning for Key Leadership',
        'California Title 22, § 74659 — Administrator qualifications for California home health agencies',
        'ACHC Standard I.2 — Administrator succession requirements',
      ],
    },
    {
      title: 'Minimum Qualifications',
      layout: 'checklist',
      items: [
        'Must meet ALL qualifications required of the Administrator per 42 CFR § 484.105(b)',
        'Licensed physician; OR Registered Nurse; OR holder of a degree from an accredited educational program in a health-related field',
        'Experience in health service administration with supervisory experience in home health or related program',
        'Must not appear on OIG LEIE or SAM exclusion databases',
        'Pre-approved by the Governing Body and documented in succession plan',
        'Must maintain current knowledge of Medicare CoPs, California Title 22, and agency operations',
      ],
    },
    {
      title: 'Essential Duties (When Activated)',
      layout: 'checklist',
      items: [
        'Assume full authority and accountability for day-to-day agency operations',
        'Maintain all regulatory compliance obligations of the Administrator role',
        'Communicate activation status to the Governing Body within 24 hours',
        'Ensure continuity of patient care services without interruption',
        'Serve as primary contact for regulatory agencies during the activation period',
        'Report to the Governing Body on operational status within 7 days of activation',
        'Manage staffing, scheduling, and resource allocation',
        'Execute all time-sensitive compliance obligations (survey responses, incident reports)',
      ],
    },
    {
      title: 'Activation Criteria',
      layout: 'checklist',
      items: [
        'Planned absence of Administrator exceeding 72 consecutive hours',
        'Unplanned absence (illness, emergency, incapacitation) exceeding 24 hours',
        'Administrator vacancy pending permanent appointment (maximum 90 calendar days per GV-GB-004)',
        'Governing Body removal or suspension of Administrator',
      ],
    },
    {
      title: 'Ongoing Readiness Responsibilities (When Not Activated)',
      layout: 'checklist',
      items: [
        'Maintain current knowledge of agency operations, staffing, and active regulatory matters',
        'Attend a minimum of two (2) Governing Body meetings per year',
        'Complete annual competency review covering Medicare CoPs, California Title 22, and emergency preparedness',
        'Participate in succession plan exercises/tabletop drills',
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// HR-JD-003: DIRECTOR OF NURSING / CLINICAL MANAGER
// ────────────────────────────────────────────────────────────────
const JD_003: FormOverride = {
  p: 'Defines the qualifications, clinical authority, and regulatory responsibilities of the Director of Nursing / Clinical Manager of Care Indeed Home Health Care, Inc. as required by 42 CFR § 484.115, California Title 22, and ACHC Home Health Standards.',
  i: 'Reviewed biennially or upon regulatory change. The Clinical Manager must be a licensed physician or registered nurse with experience appropriate to the services furnished.',
  fields: jdHeader({
    title: 'Director of Nursing / Clinical Manager',
    department: 'Clinical Operations',
    reportsTo: 'Administrator',
    supervises: 'All clinical staff (RN, LVN, PT, OT, SLP, MSW, HHA)',
    flsa: 'Exempt',
  }),
  signers: ['Employee (DON/Clinical Manager)', 'Administrator', 'Human Resources'],
  extra: [
    {
      title: 'Position Summary',
      layout: 'narrative',
      body: 'The Director of Nursing / Clinical Manager is designated by the Governing Body to oversee all clinical services delivered by Care Indeed Home Health Care, Inc. Per 42 CFR § 484.115, the clinical manager is responsible for ensuring the coordination, delivery, and quality of all patient care services. This position serves as the senior clinical authority, supervises all skilled and paraprofessional staff, ensures OASIS accuracy, implements infection prevention programs, and maintains clinical operations in compliance with the plan of care, physician orders, and applicable regulations.',
    },
    {
      title: 'Regulatory Authority',
      layout: 'checklist',
      items: [
        '42 CFR § 484.115 — Condition: Personnel qualifications (Clinical Manager)',
        '42 CFR § 484.105(c) — Standard: Clinical manager designated by the governing body',
        '42 CFR § 484.60 — Condition: Care planning, coordination, and quality of care',
        '42 CFR § 484.55 — Condition: Comprehensive assessment of patients (OASIS)',
        '42 CFR § 484.70 — Condition: Infection prevention and control',
        '42 CFR § 484.80 — Condition: Home health aide services',
        '42 CFR § 484.65 — Condition: QAPI',
        'California Code of Regulations Title 22, § 74651 — Nursing services',
        'California Business & Professions Code — Nursing Practice Act',
        'ACHC Home Health Standards — Section II: Clinical Services',
      ],
    },
    {
      title: 'Minimum Qualifications',
      layout: 'checklist',
      items: [
        'Current, active, unrestricted Registered Nurse (RN) license issued by the California Board of Registered Nursing',
        'Minimum of two (2) years of clinical nursing experience, with at least one (1) year in home health care',
        'Demonstrated knowledge of Medicare home health Conditions of Participation (42 CFR Part 484)',
        'Demonstrated knowledge of OASIS data set, assessment methodology, and CMS transmission requirements',
        'Current BLS/CPR certification',
        'Must not appear on OIG LEIE or SAM exclusion databases',
      ],
    },
    {
      title: 'Essential Duties & Responsibilities',
      layout: 'checklist',
      items: [
        'Coordinate and supervise all patient care services to ensure compliance with physician orders, plan of care, and regulatory requirements [42 CFR § 484.60]',
        'Ensure each patient receives a comprehensive assessment by a qualified clinician within required timeframes [42 CFR § 484.55]',
        'Assign clinical staff to patients based on patient acuity, staff qualifications, geographic efficiency, and continuity of care',
        'Conduct or oversee supervisory visits per federal and state requirements',
        'Review and approve all clinical documentation including assessments, visit notes, and discharge summaries',
        'Ensure physician orders are obtained, implemented, and authenticated within regulatory timeframes',
        'Manage patient caseload distribution to maintain quality and prevent staff burnout',
        'Participate in case conferences and ensure interdisciplinary care coordination [42 CFR § 484.60(b)]',
        'Ensure agency services conform to the written plan of care established for each patient',
        'Report clinical concerns, sentinel events, and adverse outcomes per agency policy and CMS requirements',
      ],
    },
    {
      title: 'OASIS Responsibilities',
      layout: 'checklist',
      items: [
        'Ensure all OASIS assessments (SOC, ROC, Recertification, Transfer, Discharge) are completed accurately and within CMS timeframes [42 CFR § 484.55(b)]',
        'Implement OASIS quality review process including targeted edit checks and inter-rater reliability monitoring',
        'Ensure timely OASIS transmission to CMS within 30 days of the M0090 date',
        'Monitor OASIS-based quality measures and implement corrective actions for negative trends',
        'Provide OASIS competency training and annual updates to all assessing clinicians',
        'Oversee accuracy of OASIS coding as it impacts Home Health Compare Star Ratings and payment (PDGM)',
      ],
    },
    {
      title: 'QAPI Responsibilities',
      layout: 'checklist',
      items: [
        'Lead clinical aspects of the QAPI program including quality indicator monitoring, performance improvement projects, and outcome analysis [42 CFR § 484.65]',
        'Present quarterly QAPI reports to the Governing Body including quality trends, PIP status, adverse events, and patient satisfaction data',
        'Conduct root cause analysis for sentinel events and implement systemic corrective actions',
        'Monitor Home Health Compare quality measures and HHCAHPS scores',
      ],
    },
    {
      title: 'Infection Prevention Responsibilities',
      layout: 'checklist',
      items: [
        'Implement and oversee the agency infection prevention and control program [42 CFR § 484.70]',
        'Conduct or direct the annual infection control risk assessment',
        'Monitor healthcare-associated infection (HAI) rates and implement intervention plans',
        'Ensure clinical staff competency in standard precautions, hand hygiene, and PPE use',
        'Report communicable diseases per California Title 17 mandatory reporting requirements',
        'Ensure influenza vaccination compliance or declination documentation for clinical staff',
      ],
    },
    {
      title: 'Home Health Aide Supervision',
      layout: 'checklist',
      items: [
        'Ensure each home health aide receives a supervisory visit by a registered nurse at least every 14 days [42 CFR § 484.80(h)]',
        'Ensure HHA care is provided in accordance with the individualized aide care plan',
        'Evaluate HHA competency and document observed skills per 42 CFR § 484.80(c)',
        'Ensure HHAs receive 12 hours of in-service training per 12-month period [42 CFR § 484.80(d)]',
      ],
    },
    {
      title: 'Compliance Responsibilities',
      layout: 'checklist',
      items: [
        'Ensure clinical documentation supports medical necessity and billed services (prevents FCA exposure)',
        'Report suspected fraud, waste, or abuse per the agency compliance program',
        'Ensure clinical staff licensure and certification verification upon hire and annually',
        'Ensure clinical operations align with the agency\'s approved scope of services [42 CFR § 484.105(a)]',
      ],
    },
    {
      title: 'Emergency Preparedness Responsibilities',
      layout: 'checklist',
      items: [
        'Ensure clinical continuity of care during emergency events per agency Emergency Operations Plan [42 CFR § 484.102]',
        'Maintain patient priority lists for emergency triage and service continuity',
        'Participate in emergency drills and ensure clinical staff competency in emergency procedures',
      ],
    },
    {
      title: 'Documentation Responsibilities',
      layout: 'checklist',
      items: [
        'Ensure clinical records are maintained per 42 CFR § 484.110',
        'Ensure all patient records contain required elements: plan of care, assessments, visit notes, orders, progress summaries',
        'Ensure clinical documentation is completed within agency-defined timeframes (typically 24–48 hours)',
        'Conduct periodic chart audits to ensure documentation quality and completeness',
      ],
    },
    {
      title: 'HIPAA/Confidentiality Responsibilities',
      layout: 'checklist',
      items: [
        'Ensure clinical staff handle PHI in compliance with HIPAA Privacy and Security Rules (45 CFR Parts 160, 164)',
        'Ensure mobile devices and EHR access follow minimum necessary standards',
        'Report potential breaches immediately per agency breach notification policy',
      ],
    },
    {
      title: 'Patient Rights Responsibilities',
      layout: 'checklist',
      items: [
        'Ensure patients receive written notice of rights per 42 CFR § 484.50',
        'Ensure patient/caregiver participation in care planning',
        'Investigate and resolve patient grievances within agency-defined timeframes',
        'Ensure advance directive documentation and patient choice are respected',
      ],
    },
    {
      title: 'Physical Requirements & Working Conditions',
      layout: 'checklist',
      items: [
        'Primarily office-based with periodic home visits for supervisory assessments',
        'Must maintain current California RN license and BLS certification',
        'Ability to travel to patient homes in the service area',
        'Available for after-hours on-call coverage rotation',
        'May require extended hours during surveys, emergencies, or peak census',
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// HR-JD-004: CLINICAL DESIGNEE
// ────────────────────────────────────────────────────────────────
const JD_004: FormOverride = {
  p: 'Defines the qualifications and delegated clinical authority of the Clinical Designee who acts in the DON/Clinical Manager\'s absence per the agency succession plan and 42 CFR § 484.105(c).',
  i: 'Reviewed biennially. Designee must meet Clinical Manager qualifications and be pre-approved by the Governing Body.',
  fields: jdHeader({
    title: 'Clinical Designee',
    department: 'Clinical Operations',
    reportsTo: 'DON/Clinical Manager / Administrator (when activated)',
    supervises: 'Per delegation — clinical staff when acting as Clinical Manager',
    flsa: 'Exempt',
  }),
  signers: ['Employee (Clinical Designee)', 'DON/Clinical Manager', 'Administrator'],
  extra: [
    {
      title: 'Position Summary',
      layout: 'narrative',
      body: 'The Clinical Designee is a pre-qualified Registered Nurse authorized to assume the full duties of the Director of Nursing / Clinical Manager during planned or unplanned absences. This ensures continuous compliance with 42 CFR § 484.105(c) and uninterrupted clinical oversight of all patient care services. The designee must meet the same qualifications as the DON/Clinical Manager and maintain readiness for immediate activation per GV-GB-004.',
    },
    {
      title: 'Regulatory Authority',
      layout: 'checklist',
      items: [
        '42 CFR § 484.105(c) — Clinical Manager qualifications (applies when activated)',
        '42 CFR § 484.115 — Personnel qualifications',
        'GV-GB-004 — Succession Planning for Key Leadership',
        'California Board of Registered Nursing — Scope of practice',
      ],
    },
    {
      title: 'Minimum Qualifications',
      layout: 'checklist',
      items: [
        'Current, active, unrestricted California RN license',
        'Minimum one (1) year home health clinical experience',
        'Demonstrated competency in OASIS, care coordination, and staff supervision',
        'Pre-approved by the Governing Body and documented in succession plan',
        'Must not appear on OIG LEIE or SAM exclusion databases',
      ],
    },
    {
      title: 'Essential Duties (When Activated)',
      layout: 'checklist',
      items: [
        'Assume full clinical oversight authority for all patient care services',
        'Maintain supervision schedules including HHA supervisory visits [42 CFR § 484.80(h)]',
        'Ensure OASIS assessment accuracy and timely transmission',
        'Manage clinical staffing assignments and patient caseloads',
        'Review and approve clinical documentation and physician orders',
        'Execute infection control program responsibilities [42 CFR § 484.70]',
        'Communicate clinical status to the Administrator and Governing Body',
      ],
    },
    {
      title: 'Ongoing Readiness (When Not Activated)',
      layout: 'checklist',
      items: [
        'Maintain current knowledge of agency patient census, clinical staff, and active quality concerns',
        'Complete annual competency review covering OASIS, care coordination, infection prevention, and emergency procedures',
        'Participate in succession plan exercises and case conference discussions',
        'Shadow DON/Clinical Manager for a minimum of 8 hours per quarter',
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// HR-JD-005: REGISTERED NURSE (RN)
// ────────────────────────────────────────────────────────────────
const JD_005: FormOverride = {
  p: 'Defines the qualifications, clinical duties, and regulatory responsibilities of the Registered Nurse providing skilled nursing services for Care Indeed Home Health Care, Inc. per 42 CFR § 484.115(b), California Title 22, and the California Nursing Practice Act.',
  i: 'Reviewed biennially or upon regulatory change. All RN staff must acknowledge this JD and meet stated qualifications.',
  fields: jdHeader({
    title: 'Registered Nurse (RN)',
    department: 'Clinical Operations — Nursing',
    reportsTo: 'Director of Nursing / Clinical Manager',
    supervises: 'LVNs (per delegation), Home Health Aides (supervisory visits)',
    flsa: 'Non-Exempt (hourly) or Exempt (salaried, per agreement)',
  }),
  signers: ['Employee (RN)', 'Director of Nursing / Clinical Manager', 'Human Resources'],
  extra: [
    {
      title: 'Position Summary',
      layout: 'narrative',
      body: 'The Registered Nurse provides skilled nursing services in the patient\'s home per the physician-ordered plan of care, 42 CFR § 484.60, and the California Nursing Practice Act. The RN performs comprehensive patient assessments (including OASIS), develops and revises individualized care plans, delivers skilled interventions, coordinates interdisciplinary care, supervises LVNs and Home Health Aides, and ensures all services meet standards of professional nursing practice. The RN is responsible for patient safety, clinical documentation, infection prevention, and communication with the attending physician.',
    },
    {
      title: 'Regulatory Authority',
      layout: 'checklist',
      items: [
        '42 CFR § 484.115(b) — Personnel qualifications: Registered Nurse',
        '42 CFR § 484.60 — Care planning, coordination, and quality of care',
        '42 CFR § 484.55 — Comprehensive assessment of patients',
        '42 CFR § 484.80(h) — Home Health Aide supervisory visits (every 14 days)',
        '42 CFR § 484.70 — Infection prevention and control',
        'California Business & Professions Code § 2725–2742 — Nursing Practice Act',
        'California Code of Regulations Title 22, § 74651–74669 — Nursing services',
      ],
    },
    {
      title: 'Minimum Qualifications',
      layout: 'checklist',
      items: [
        'Graduate of an accredited school of nursing (BSN preferred)',
        'Current, active, unrestricted California Registered Nurse license',
        'Minimum one (1) year clinical nursing experience (home health preferred)',
        'Current BLS/CPR certification',
        'Must not appear on OIG LEIE or SAM exclusion databases',
        'Valid California driver\'s license with acceptable driving record',
      ],
    },
    {
      title: 'Essential Duties & Responsibilities',
      layout: 'checklist',
      items: [
        'Perform initial and ongoing comprehensive assessments of patient health status including physical, psychosocial, environmental, and functional capacity [42 CFR § 484.55]',
        'Develop, implement, and revise individualized plans of care in collaboration with the physician, patient, and interdisciplinary team [42 CFR § 484.60]',
        'Provide skilled nursing interventions per physician orders including wound care, IV therapy, medication management, disease education, and assessment of response to treatment',
        'Communicate patient status changes to the attending physician and obtain updated orders within appropriate timeframes',
        'Coordinate care with other disciplines (PT, OT, SLP, MSW, HHA) to ensure integrated service delivery [42 CFR § 484.60(b)]',
        'Evaluate patient outcomes and modify the care plan based on clinical findings',
        'Perform discharge planning including patient/caregiver education for self-management',
        'Supervise LVNs per California Nursing Practice Act delegation requirements',
        'Conduct HHA supervisory visits at least every 14 days when HHA services are provided [42 CFR § 484.80(h)]',
      ],
    },
    {
      title: 'OASIS Responsibilities',
      layout: 'checklist',
      items: [
        'Complete OASIS assessments (SOC, ROC, Recertification, Transfer, Discharge) accurately and within CMS-defined timeframes',
        'Ensure clinical documentation supports OASIS item responses',
        'Maintain competency in current OASIS guidance manual and data set conventions',
        'Correct OASIS inactivation/rejection errors within 5 business days',
      ],
    },
    {
      title: 'Infection Prevention Responsibilities',
      layout: 'checklist',
      items: [
        'Implement standard precautions during all patient care encounters [42 CFR § 484.70]',
        'Assess patients for signs/symptoms of infection and implement appropriate interventions',
        'Educate patients/caregivers on infection prevention including hand hygiene and environmental safety',
        'Report communicable diseases per California Title 17 mandatory reporting',
        'Maintain compliance with agency influenza vaccination or documented declination',
      ],
    },
    {
      title: 'Documentation Responsibilities',
      layout: 'checklist',
      items: [
        'Complete all clinical documentation (visit notes, assessments, care plans) within 24 hours of the patient encounter',
        'Ensure documentation supports medical necessity, homebound status, and skilled need',
        'Maintain legible, factual, and professional clinical records per 42 CFR § 484.110',
        'Document patient/caregiver education including content, method, and comprehension validation',
      ],
    },
    {
      title: 'HIPAA/Confidentiality Responsibilities',
      layout: 'checklist',
      items: [
        'Protect patient PHI during transport, documentation, and communication per HIPAA Privacy Rule',
        'Secure mobile devices and clinical records in accordance with agency security policies',
        'Share PHI only on a minimum necessary basis and through approved communication channels',
      ],
    },
    {
      title: 'Patient Rights Responsibilities',
      layout: 'checklist',
      items: [
        'Provide verbal and written notice of patient rights per 42 CFR § 484.50 at start of care',
        'Respect patient choice, dignity, and self-determination in all care decisions',
        'Ensure informed consent is obtained before initiating new treatments or procedures',
        'Report suspected abuse, neglect, or exploitation per California mandatory reporting requirements',
      ],
    },
    {
      title: 'OSHA/Safety Responsibilities',
      layout: 'checklist',
      items: [
        'Comply with bloodborne pathogen exposure control plan (29 CFR 1910.1030)',
        'Use appropriate PPE for all patient care activities',
        'Report workplace injuries, needlestick exposures, or unsafe conditions immediately',
        'Perform patient home environmental safety assessments at each visit',
        'Comply with agency vehicle safety and driving policies',
      ],
    },
    {
      title: 'Physical Requirements',
      layout: 'checklist',
      items: [
        'Ability to travel independently to patient homes throughout the service area',
        'Ability to lift/carry up to 30 lbs (nursing bag, supplies)',
        'Ability to perform physical assessment skills (auscultation, palpation, inspection)',
        'Ability to bend, kneel, and reach in home environments with limited space',
        'Ability to operate portable medical equipment (BP cuff, glucometer, pulse oximeter, wound vac)',
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// HR-JD-006: LICENSED VOCATIONAL NURSE (LVN)
// ────────────────────────────────────────────────────────────────
const JD_006: FormOverride = {
  p: 'Defines the qualifications, delegated clinical duties, and regulatory responsibilities of the Licensed Vocational Nurse (LVN) providing skilled nursing services under RN supervision for Care Indeed Home Health Care, Inc. per 42 CFR § 484.115(c), California Title 22, and the LVN Practice Act.',
  i: 'Reviewed biennially. LVNs practice under RN direction/supervision per California Business & Professions Code § 2860.',
  fields: jdHeader({
    title: 'Licensed Vocational Nurse (LVN)',
    department: 'Clinical Operations — Nursing',
    reportsTo: 'Director of Nursing / Supervising Registered Nurse',
    supervises: 'None (may direct HHA tasks per care plan)',
    flsa: 'Non-Exempt (hourly)',
  }),
  signers: ['Employee (LVN)', 'Director of Nursing / Clinical Manager', 'Human Resources'],
  extra: [
    {
      title: 'Position Summary',
      layout: 'narrative',
      body: 'The Licensed Vocational Nurse provides skilled nursing services in the patient\'s home under the direction of a Registered Nurse, per the physician-ordered plan of care, 42 CFR § 484.60, and California Business & Professions Code § 2860. The LVN performs assigned skilled tasks within the LVN scope of practice, including medication administration, wound care, vital sign monitoring, patient education, and documentation of patient response to treatment. The LVN does not independently perform comprehensive assessments, OASIS data collection, or care plan development.',
    },
    {
      title: 'Regulatory Authority',
      layout: 'checklist',
      items: [
        '42 CFR § 484.115(c) — Personnel qualifications: Licensed Practical (Vocational) Nurse',
        '42 CFR § 484.60 — Care planning, coordination, and quality of care (within LVN scope)',
        'California Business & Professions Code § 2860–2895 — Vocational Nursing Practice Act',
        'California Code of Regulations Title 22 — Nursing services under RN supervision',
        'California Board of Vocational Nursing and Psychiatric Technicians (BVNPT) regulations',
      ],
    },
    {
      title: 'Minimum Qualifications',
      layout: 'checklist',
      items: [
        'Graduate of a California Board-approved vocational nursing program',
        'Current, active, unrestricted California LVN license (BVNPT)',
        'Current BLS/CPR certification',
        'Minimum six (6) months clinical nursing experience (home health preferred)',
        'Must not appear on OIG LEIE or SAM exclusion databases',
        'Valid California driver\'s license with acceptable driving record',
      ],
    },
    {
      title: 'Essential Duties & Responsibilities',
      layout: 'checklist',
      items: [
        'Provide skilled nursing care within LVN scope of practice per the physician-ordered plan of care [42 CFR § 484.60]',
        'Administer medications (oral, topical, subcutaneous, intramuscular) per physician orders and report adverse reactions',
        'Perform wound care, dressing changes, and assessment of wound healing progress',
        'Monitor and document vital signs, pain levels, and patient functional status',
        'Provide patient/caregiver education on disease management, medication regimen, and safety',
        'Report changes in patient condition to the supervising RN and/or physician promptly',
        'Assist with coordination of patient care among interdisciplinary team members',
        'Reinforce the established plan of care as developed by the RN',
        'Maintain clinical documentation per agency policy and 42 CFR § 484.110',
      ],
    },
    {
      title: 'Scope of Practice Limitations',
      layout: 'checklist',
      items: [
        'Does NOT independently perform comprehensive patient assessments (SOC/ROC/Recert)',
        'Does NOT complete OASIS data collection',
        'Does NOT independently develop or revise plans of care',
        'Does NOT supervise Home Health Aides (RN responsibility per 42 CFR § 484.80(h))',
        'Does NOT independently initiate IV therapy (California-specific IV certification required for IV therapy)',
        'Must practice under the direction of a licensed RN at all times',
      ],
    },
    {
      title: 'Infection Prevention Responsibilities',
      layout: 'checklist',
      items: [
        'Implement standard precautions during all patient care [42 CFR § 484.70]',
        'Report signs/symptoms of infection to the supervising RN',
        'Educate patients on infection prevention per the plan of care',
        'Maintain compliance with agency influenza vaccination or declination',
      ],
    },
    {
      title: 'Documentation Responsibilities',
      layout: 'checklist',
      items: [
        'Complete visit notes within 24 hours documenting interventions, patient response, and teaching provided',
        'Document medication administration including time, dose, route, and patient response',
        'Report abnormal findings and changes in patient status to the supervising RN immediately',
      ],
    },
    {
      title: 'Physical Requirements',
      layout: 'checklist',
      items: [
        'Ability to travel independently to patient homes throughout the service area',
        'Ability to lift/carry up to 30 lbs',
        'Ability to perform clinical procedures in varied home environments',
        'Ability to operate portable medical equipment within LVN scope',
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// HR-JD-007: HOME HEALTH AIDE (HHA)
// ────────────────────────────────────────────────────────────────
const JD_007: FormOverride = {
  p: 'Defines the qualifications, training requirements, and duties of the Home Health Aide (HHA) providing personal care and supportive services for Care Indeed Home Health Care, Inc. per 42 CFR § 484.80, California Title 22, and ACHC standards.',
  i: 'Reviewed biennially. HHAs must complete a minimum 75-hour training program and pass a competency evaluation per 42 CFR § 484.80(b).',
  fields: jdHeader({
    title: 'Home Health Aide (HHA) / Certified Nurse Assistant (CNA)',
    department: 'Clinical Operations — Aide Services',
    reportsTo: 'Director of Nursing / Supervising Registered Nurse',
    supervises: 'None',
    flsa: 'Non-Exempt (hourly)',
  }),
  signers: ['Employee (HHA/CNA)', 'Director of Nursing / Clinical Manager', 'Human Resources'],
  extra: [
    {
      title: 'Position Summary',
      layout: 'narrative',
      body: 'The Home Health Aide provides personal care and supportive services to patients in their homes as assigned by the registered nurse, per the individualized aide care plan. The HHA assists patients with activities of daily living (ADLs), basic health-related tasks, and environmental support under the supervision of a registered nurse. Per 42 CFR § 484.80, the HHA must have completed a minimum 75-hour training program (including 16 hours clinical practicum), passed a competency evaluation, and received supervisory visits from an RN at least every 14 days when providing services.',
    },
    {
      title: 'Regulatory Authority',
      layout: 'checklist',
      items: [
        '42 CFR § 484.80 — Condition: Home Health Aide services',
        '42 CFR § 484.80(b) — Training requirements (75 hours minimum)',
        '42 CFR § 484.80(c) — Competency evaluation',
        '42 CFR § 484.80(d) — In-service training (12 hours per 12-month period)',
        '42 CFR § 484.80(h) — RN supervisory visits (every 14 days)',
        'California Code of Regulations Title 22, § 74669 — Home health aide services',
        'California Health & Safety Code § 1736.5 — Aide training and certification',
        'ACHC Home Health Standards — Aide Services',
      ],
    },
    {
      title: 'Minimum Qualifications',
      layout: 'checklist',
      items: [
        'Completion of a state-approved 75-hour Home Health Aide training program (including 16 hours supervised clinical practicum) OR current California CNA certification [42 CFR § 484.80(b)]',
        'Successful completion of a competency evaluation demonstrating proficiency in all required subject areas [42 CFR § 484.80(c)]',
        'Current BLS/CPR certification',
        'Ability to read, write, and communicate in English sufficient to document care and follow the aide care plan',
        'Must not appear on OIG LEIE or SAM exclusion databases',
        'Valid California driver\'s license with acceptable driving record (if transporting patients or driving to assignments)',
        'Criminal background clearance per California DOJ and FBI Live Scan requirements',
      ],
    },
    {
      title: 'Essential Duties & Responsibilities',
      layout: 'checklist',
      items: [
        'Provide personal care assistance (bathing, grooming, oral hygiene, dressing, toileting) per the individualized aide care plan',
        'Assist with ambulation, transfers, positioning, and use of assistive devices',
        'Assist with prescribed exercises as delegated and instructed by the therapist or RN',
        'Measure and record vital signs (temperature, pulse, respiration, blood pressure) as assigned',
        'Assist with medication reminders (does NOT administer medications)',
        'Perform light housekeeping essential to the patient\'s health (bed making, laundry, meal preparation)',
        'Observe and report changes in patient condition to the supervising RN immediately',
        'Document all services provided, observations, and patient responses on each visit',
        'Maintain a safe, clean environment conducive to patient care',
        'Accompany patients to medical appointments when assigned',
      ],
    },
    {
      title: 'Scope of Practice Limitations',
      layout: 'checklist',
      items: [
        'Does NOT perform any skilled nursing procedures (medication administration, wound care, injections)',
        'Does NOT perform assessments or modify the plan of care',
        'Does NOT provide services not included in the written aide care plan',
        'Does NOT accept verbal orders from physicians',
        'Must report all changes in patient condition to the supervising RN before taking action outside the aide care plan',
      ],
    },
    {
      title: 'Supervision Requirements',
      layout: 'checklist',
      items: [
        'Receives RN supervisory visit at least every 14 days when actively providing services [42 CFR § 484.80(h)]',
        'RN supervises in the patient\'s home during HHA service delivery',
        'RN assesses whether aide services continue to meet patient needs and aide performance is satisfactory',
        'Completes 12 hours of in-service training per 12-month period [42 CFR § 484.80(d)]',
      ],
    },
    {
      title: 'Infection Prevention Responsibilities',
      layout: 'checklist',
      items: [
        'Practice hand hygiene before and after each patient contact per CDC and agency guidelines',
        'Use PPE as directed by the supervising RN',
        'Report suspected infection signs/symptoms to the supervising RN',
        'Maintain compliance with agency influenza vaccination or declination',
        'Follow standard precautions for all patient care activities [42 CFR § 484.70]',
      ],
    },
    {
      title: 'Patient Rights Responsibilities',
      layout: 'checklist',
      items: [
        'Respect patient dignity, privacy, and cultural preferences during all care',
        'Maintain patient confidentiality at all times',
        'Report suspected abuse, neglect, or exploitation per California mandatory reporting requirements',
        'Allow patient/caregiver participation in care decisions within the aide care plan',
      ],
    },
    {
      title: 'Physical Requirements',
      layout: 'checklist',
      items: [
        'Ability to lift/transfer patients up to 50 lbs with proper body mechanics',
        'Ability to bend, stoop, kneel, and reach in home environments',
        'Ability to stand and walk for extended periods during patient care',
        'Ability to travel independently to patient homes',
        'Ability to perform repetitive motions (cleaning, bathing assistance)',
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// HR-JD-008: MEDICAL SOCIAL WORKER (MSW)
// ────────────────────────────────────────────────────────────────
const JD_008: FormOverride = {
  p: 'Defines the qualifications and duties of the Medical Social Worker providing psychosocial services for Care Indeed Home Health Care, Inc. per 42 CFR § 484.115(e), California Title 22, and the California Board of Behavioral Sciences.',
  i: 'Reviewed biennially. MSW services must be ordered by the physician and provided per the plan of care.',
  fields: jdHeader({
    title: 'Medical Social Worker (MSW)',
    department: 'Clinical Operations — Social Services',
    reportsTo: 'Director of Nursing / Clinical Manager',
    supervises: 'None',
    flsa: 'Non-Exempt (hourly) or Exempt (salaried, per agreement)',
  }),
  signers: ['Employee (MSW)', 'Director of Nursing / Clinical Manager', 'Human Resources'],
  extra: [
    {
      title: 'Position Summary',
      layout: 'narrative',
      body: 'The Medical Social Worker provides psychosocial assessments, counseling, care coordination, and community resource linkage to patients and families receiving home health services. Per 42 CFR § 484.115(e), the MSW must hold a Master\'s degree in social work from an accredited program and have at least one year of social work experience in a health care setting. The MSW addresses social, emotional, and environmental factors that impact patient health outcomes, treatment adherence, and safe discharge from home health services.',
    },
    {
      title: 'Regulatory Authority',
      layout: 'checklist',
      items: [
        '42 CFR § 484.115(e) — Personnel qualifications: Medical Social Worker',
        '42 CFR § 484.60 — Care planning, coordination, and quality of care',
        '42 CFR § 484.75 — Skilled professional services (social work)',
        'California Business & Professions Code § 4996–4996.9 — LCSW Practice Act',
        'California Code of Regulations Title 22 — Social services in home health',
      ],
    },
    {
      title: 'Minimum Qualifications',
      layout: 'checklist',
      items: [
        'Master of Social Work (MSW) degree from a school of social work accredited by the Council on Social Work Education [42 CFR § 484.115(e)]',
        'One (1) year of social work experience in a health care setting',
        'California LCSW license or ASW registration under LCSW supervision (BBS)',
        'Must not appear on OIG LEIE or SAM exclusion databases',
        'Valid California driver\'s license with acceptable driving record',
      ],
    },
    {
      title: 'Essential Duties & Responsibilities',
      layout: 'checklist',
      items: [
        'Conduct comprehensive psychosocial assessments evaluating social, emotional, financial, and environmental factors affecting patient care',
        'Provide short-term counseling to patients and families on adjustment to illness, grief, caregiver stress, and end-of-life issues',
        'Identify and link patients/families to community resources (transportation, meals, financial assistance, support groups)',
        'Assist patients in understanding and navigating insurance benefits, advance directives, and health care system barriers',
        'Collaborate with the interdisciplinary team on care planning and discharge planning [42 CFR § 484.60(b)]',
        'Assess and intervene in situations involving abuse, neglect, or exploitation',
        'Provide crisis intervention services as needed',
        'Assess patient safety and ability to remain safely in the home environment',
        'Document all assessments, interventions, and care coordination activities per 42 CFR § 484.110',
      ],
    },
    {
      title: 'Documentation Responsibilities',
      layout: 'checklist',
      items: [
        'Complete psychosocial assessment and visit notes within 24–48 hours of patient encounter',
        'Document measurable goals, interventions, and patient response in clinical record',
        'Communicate findings and recommendations to the attending physician and care team',
      ],
    },
    {
      title: 'Patient Rights Responsibilities',
      layout: 'checklist',
      items: [
        'Ensure patient informed consent and self-determination in all social work interventions',
        'Assist patients with advance directive completion and POLST documentation when requested',
        'Report suspected abuse/neglect per California Welfare & Institutions Code mandatory reporting',
        'Advocate for patient rights within the healthcare system',
      ],
    },
    {
      title: 'Physical Requirements',
      layout: 'checklist',
      items: [
        'Ability to travel independently to patient homes',
        'Primarily sedentary with travel between locations',
        'Ability to operate standard technology (laptop, phone) for documentation',
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// HR-JD-009: PHYSICAL THERAPIST (PT)
// ────────────────────────────────────────────────────────────────
const JD_009: FormOverride = {
  p: 'Defines the qualifications and duties of the Physical Therapist providing skilled rehabilitation services for Care Indeed Home Health Care, Inc. per 42 CFR § 484.115(d), California Title 22, and the Physical Therapy Practice Act.',
  i: 'Reviewed biennially. PT services must be ordered by the physician and provided per the plan of care.',
  fields: jdHeader({
    title: 'Physical Therapist (PT)',
    department: 'Clinical Operations — Rehabilitation Services',
    reportsTo: 'Director of Nursing / Clinical Manager',
    supervises: 'Physical Therapist Assistant (PTA) when applicable',
    flsa: 'Non-Exempt (hourly) or Exempt (salaried, per agreement)',
  }),
  signers: ['Employee (PT)', 'Director of Nursing / Clinical Manager', 'Human Resources'],
  extra: [
    {
      title: 'Position Summary',
      layout: 'narrative',
      body: 'The Physical Therapist evaluates and treats patients with movement disorders, functional limitations, and impairments in the home setting per physician orders and the individualized plan of care. Per 42 CFR § 484.115(d), the PT must be licensed or registered by the state in which practicing. The PT performs evaluations, establishes treatment goals, implements therapeutic interventions, educates patients/caregivers on home exercise programs, and assesses the need for durable medical equipment and assistive devices. PT may serve as the case manager for therapy-only episodes per PDGM requirements.',
    },
    {
      title: 'Regulatory Authority',
      layout: 'checklist',
      items: [
        '42 CFR § 484.115(d) — Personnel qualifications: Physical Therapist',
        '42 CFR § 484.60 — Care planning, coordination, and quality of care',
        '42 CFR § 484.55 — Comprehensive assessment (PT may complete OASIS for therapy-only cases)',
        'California Business & Professions Code § 2600–2696 — Physical Therapy Practice Act',
        'California Code of Regulations Title 16, Division 13.2 — PT Board regulations',
      ],
    },
    {
      title: 'Minimum Qualifications',
      layout: 'checklist',
      items: [
        'Graduate of an accredited physical therapy program (DPT or equivalent)',
        'Current, active, unrestricted California Physical Therapist license (PT Board of California)',
        'Current BLS/CPR certification',
        'Minimum one (1) year clinical experience (home health preferred)',
        'Must not appear on OIG LEIE or SAM exclusion databases',
        'Valid California driver\'s license with acceptable driving record',
      ],
    },
    {
      title: 'Essential Duties & Responsibilities',
      layout: 'checklist',
      items: [
        'Perform comprehensive physical therapy evaluations including functional mobility, strength, balance, ROM, pain, and fall risk assessment',
        'Develop individualized treatment plans with measurable, functional goals per physician orders [42 CFR § 484.60]',
        'Provide skilled therapeutic interventions: therapeutic exercise, gait training, balance training, neuromuscular re-education, manual therapy',
        'Assess need for and recommend assistive devices, DME, and home modifications for patient safety',
        'Educate patients/caregivers on home exercise programs, fall prevention, and safe mobility techniques',
        'Reassess patient progress and modify treatment plan as indicated',
        'Coordinate with the interdisciplinary team on patient goals and discharge planning',
        'Supervise Physical Therapist Assistants per California PT Practice Act requirements',
        'Perform OASIS assessments for therapy-only cases when serving as case manager [42 CFR § 484.55]',
        'Discharge patient from PT services when goals are met or progress plateaus with appropriate documentation',
      ],
    },
    {
      title: 'OASIS Responsibilities (Therapy-Only Cases)',
      layout: 'checklist',
      items: [
        'Complete OASIS assessments (SOC, Recertification, Discharge) when PT is the sole discipline/case manager',
        'Ensure accurate coding of functional items (GG items) that drive PDGM payment and quality reporting',
        'Maintain competency in OASIS data set and CMS guidance manual',
      ],
    },
    {
      title: 'Documentation Responsibilities',
      layout: 'checklist',
      items: [
        'Complete evaluation and visit notes within 24 hours documenting interventions, patient response, and progress toward goals',
        'Document medical necessity for continued therapy including specific functional deficits and skilled interventions required',
        'Complete physician recertification documentation per CMS requirements for each 60-day episode',
      ],
    },
    {
      title: 'Infection Prevention & Safety Responsibilities',
      layout: 'checklist',
      items: [
        'Implement standard precautions and hand hygiene per agency protocol [42 CFR § 484.70]',
        'Assess home environment for fall hazards and safety barriers; recommend modifications',
        'Ensure patient safety during all therapeutic activities',
        'Report injuries and unsafe conditions per agency OSHA compliance policy',
      ],
    },
    {
      title: 'Physical Requirements',
      layout: 'checklist',
      items: [
        'Ability to travel independently to patient homes',
        'Ability to lift/assist patients up to 50 lbs during transfers and gait training',
        'Ability to demonstrate therapeutic exercises and physically guide patient movement',
        'Ability to kneel, bend, and work at floor level for mat exercises',
        'Ability to transport therapy equipment (gait belt, portable exercise equipment)',
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// HR-JD-010: OCCUPATIONAL THERAPIST (OT)
// ────────────────────────────────────────────────────────────────
const JD_010: FormOverride = {
  p: 'Defines the qualifications and duties of the Occupational Therapist providing skilled rehabilitation services for Care Indeed Home Health Care, Inc. per 42 CFR § 484.115(d), California Title 22, and the Occupational Therapy Practice Act.',
  i: 'Reviewed biennially. OT services must be ordered by the physician and provided per the plan of care.',
  fields: jdHeader({
    title: 'Occupational Therapist (OT)',
    department: 'Clinical Operations — Rehabilitation Services',
    reportsTo: 'Director of Nursing / Clinical Manager',
    supervises: 'Occupational Therapy Assistant (OTA/COTA) when applicable',
    flsa: 'Non-Exempt (hourly) or Exempt (salaried, per agreement)',
  }),
  signers: ['Employee (OT)', 'Director of Nursing / Clinical Manager', 'Human Resources'],
  extra: [
    {
      title: 'Position Summary',
      layout: 'narrative',
      body: 'The Occupational Therapist evaluates and treats patients with functional limitations affecting their ability to perform activities of daily living (ADLs), instrumental activities of daily living (IADLs), and meaningful occupations in the home setting. Per 42 CFR § 484.115(d), the OT must be licensed or registered by the state. The OT assesses self-care abilities, upper extremity function, cognition, home safety, and adaptive equipment needs. OT interventions focus on restoring functional independence through therapeutic activity, compensatory strategies, adaptive equipment training, and home/environmental modification recommendations.',
    },
    {
      title: 'Regulatory Authority',
      layout: 'checklist',
      items: [
        '42 CFR § 484.115(d) — Personnel qualifications: Occupational Therapist',
        '42 CFR § 484.60 — Care planning, coordination, and quality of care',
        '42 CFR § 484.55 — Comprehensive assessment (OT may complete OASIS for therapy-only cases)',
        'California Business & Professions Code § 2570–2571 — Occupational Therapy Practice Act',
        'California Board of Occupational Therapy regulations',
      ],
    },
    {
      title: 'Minimum Qualifications',
      layout: 'checklist',
      items: [
        'Graduate of an accredited occupational therapy program (MOT/OTD or equivalent)',
        'Current, active, unrestricted California Occupational Therapist license',
        'Registered with the National Board for Certification in Occupational Therapy (NBCOT)',
        'Current BLS/CPR certification',
        'Minimum one (1) year clinical experience (home health preferred)',
        'Must not appear on OIG LEIE or SAM exclusion databases',
        'Valid California driver\'s license with acceptable driving record',
      ],
    },
    {
      title: 'Essential Duties & Responsibilities',
      layout: 'checklist',
      items: [
        'Perform comprehensive OT evaluations including ADL/IADL function, UE strength/ROM, fine motor coordination, cognition, vision/perception, and home safety',
        'Develop individualized treatment plans with functional, measurable goals per physician orders [42 CFR § 484.60]',
        'Provide skilled interventions: therapeutic activity, ADL retraining, energy conservation, joint protection, cognitive strategies, splinting/orthotics',
        'Assess need for adaptive equipment (grab bars, shower bench, reacher, dressing aids) and train patient/caregiver in safe use',
        'Perform home safety assessments and recommend environmental modifications',
        'Educate patients/caregivers on compensatory strategies for functional independence',
        'Coordinate with interdisciplinary team and communicate progress toward discharge goals',
        'Supervise OTA/COTA per California Occupational Therapy Practice Act requirements',
        'Perform OASIS assessments for therapy-only cases when serving as case manager',
        'Discharge patient when goals are met or functional plateau is documented',
      ],
    },
    {
      title: 'OASIS Responsibilities (Therapy-Only Cases)',
      layout: 'checklist',
      items: [
        'Complete OASIS assessments when OT is the sole discipline/case manager',
        'Ensure accurate coding of self-care and functional items per CMS guidance',
        'Maintain competency in OASIS data set conventions',
      ],
    },
    {
      title: 'Documentation Responsibilities',
      layout: 'checklist',
      items: [
        'Complete evaluation and visit notes within 24 hours',
        'Document medical necessity with specific functional deficits and skilled interventions',
        'Complete physician recertification documentation per CMS requirements',
      ],
    },
    {
      title: 'Infection Prevention & Safety Responsibilities',
      layout: 'checklist',
      items: [
        'Implement standard precautions per agency protocol [42 CFR § 484.70]',
        'Assess and address home safety hazards affecting ADL performance',
        'Report injuries and unsafe conditions per agency OSHA compliance policy',
      ],
    },
    {
      title: 'Physical Requirements',
      layout: 'checklist',
      items: [
        'Ability to travel independently to patient homes',
        'Ability to lift/assist patients during ADL training (up to 35 lbs)',
        'Ability to demonstrate therapeutic activities and physically guide patient movement',
        'Ability to transport OT supplies and adaptive equipment',
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// HR-JD-011: SPEECH-LANGUAGE PATHOLOGIST (SLP)
// ────────────────────────────────────────────────────────────────
const JD_011: FormOverride = {
  p: 'Defines the qualifications and duties of the Speech-Language Pathologist providing skilled communication and swallowing services for Care Indeed Home Health Care, Inc. per 42 CFR § 484.115(d), California Title 22, and the Speech-Language Pathology Practice Act.',
  i: 'Reviewed biennially. SLP services must be ordered by the physician and provided per the plan of care.',
  fields: jdHeader({
    title: 'Speech-Language Pathologist (SLP)',
    department: 'Clinical Operations — Rehabilitation Services',
    reportsTo: 'Director of Nursing / Clinical Manager',
    supervises: 'Speech-Language Pathology Assistant (SLPA) when applicable',
    flsa: 'Non-Exempt (hourly) or Exempt (salaried, per agreement)',
  }),
  signers: ['Employee (SLP)', 'Director of Nursing / Clinical Manager', 'Human Resources'],
  extra: [
    {
      title: 'Position Summary',
      layout: 'narrative',
      body: 'The Speech-Language Pathologist evaluates and treats patients with communication disorders (speech, language, voice, fluency, cognition) and swallowing/dysphagia disorders in the home setting. Per 42 CFR § 484.115(d), the SLP must meet applicable state licensure requirements. The SLP performs standardized and functional assessments, establishes treatment plans, implements evidence-based interventions, educates patients/caregivers, and collaborates with the interdisciplinary team to optimize communication function and safe oral intake. SLP may serve as the case manager for speech-language therapy-only episodes.',
    },
    {
      title: 'Regulatory Authority',
      layout: 'checklist',
      items: [
        '42 CFR § 484.115(d) — Personnel qualifications: Speech-Language Pathologist',
        '42 CFR § 484.60 — Care planning, coordination, and quality of care',
        '42 CFR § 484.55 — Comprehensive assessment (SLP may complete OASIS for therapy-only cases)',
        'California Business & Professions Code § 2530–2537.5 — Speech-Language Pathology & Audiology Practice Act',
        'California Speech-Language Pathology & Audiology Board regulations',
      ],
    },
    {
      title: 'Minimum Qualifications',
      layout: 'checklist',
      items: [
        'Master\'s degree in Speech-Language Pathology from an accredited program',
        'Current, active, unrestricted California Speech-Language Pathologist license',
        'Certificate of Clinical Competence in Speech-Language Pathology (CCC-SLP) from ASHA (or CFY under supervision)',
        'Current BLS/CPR certification',
        'Minimum one (1) year clinical experience (home health preferred)',
        'Must not appear on OIG LEIE or SAM exclusion databases',
        'Valid California driver\'s license with acceptable driving record',
      ],
    },
    {
      title: 'Essential Duties & Responsibilities',
      layout: 'checklist',
      items: [
        'Perform comprehensive speech-language evaluations assessing speech, language, voice, fluency, cognition-communication, and swallowing function',
        'Conduct clinical swallowing assessments (bedside dysphagia evaluation) and recommend modified diet textures or further instrumental evaluation as indicated',
        'Develop individualized treatment plans with measurable functional communication and swallowing goals [42 CFR § 484.60]',
        'Provide skilled interventions: articulation therapy, language intervention, cognitive-linguistic strategies, voice therapy, dysphagia management, AAC training',
        'Educate patients/caregivers on communication strategies, safe swallowing techniques, aspiration precautions, and home practice programs',
        'Coordinate with dietary, nursing, and medical staff on dysphagia management and diet modifications',
        'Perform OASIS assessments for therapy-only cases when serving as case manager',
        'Supervise SLP Assistants per California Practice Act requirements',
        'Discharge patient when goals are met or progress plateaus with documented justification',
      ],
    },
    {
      title: 'OASIS Responsibilities (Therapy-Only Cases)',
      layout: 'checklist',
      items: [
        'Complete OASIS assessments when SLP is the sole discipline/case manager',
        'Maintain competency in OASIS data set and CMS guidance',
      ],
    },
    {
      title: 'Documentation Responsibilities',
      layout: 'checklist',
      items: [
        'Complete evaluation and visit notes within 24 hours',
        'Document medical necessity for continued therapy with specific communication/swallowing deficits and skilled interventions',
        'Complete physician recertification documentation per CMS requirements',
        'Document diet recommendations and aspiration risk per clinical findings',
      ],
    },
    {
      title: 'Infection Prevention & Safety Responsibilities',
      layout: 'checklist',
      items: [
        'Implement standard precautions during all patient care [42 CFR § 484.70]',
        'Follow proper disinfection protocols for shared therapy materials',
        'Monitor and report aspiration events or changes in swallowing safety',
      ],
    },
    {
      title: 'Physical Requirements',
      layout: 'checklist',
      items: [
        'Ability to travel independently to patient homes',
        'Ability to transport therapy materials and assessment tools',
        'Ability to position patients for swallowing assessment and treatment',
        'Ability to operate augmentative communication devices and therapy technology',
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// EXPORT MAP
// ────────────────────────────────────────────────────────────────
export const FORM_OVERRIDES_JD: Record<string, FormOverride> = {
  'HR-JD-000': JD_000,
  'HR-JD-001': JD_001,
  'HR-JD-002': JD_002,
  'HR-JD-003': JD_003,
  'HR-JD-004': JD_004,
  'HR-JD-005': JD_005,
  'HR-JD-006': JD_006,
  'HR-JD-007': JD_007,
  'HR-JD-008': JD_008,
  'HR-JD-009': JD_009,
  'HR-JD-010': JD_010,
  'HR-JD-011': JD_011,
};
