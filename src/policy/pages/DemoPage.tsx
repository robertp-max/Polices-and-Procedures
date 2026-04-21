import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Search, ChevronRight, X, CheckCircle,
  AlertTriangle, FileText, Building2, Users, Target,
  DollarSign, Monitor, BarChart3, Scale, Heart, Cpu, Briefcase,
  GitBranch, Landmark, ShieldCheck, Gavel, ChevronLeft, Printer, LayoutList, Lock, FileCheck, Layers,
  Settings, RefreshCw, CheckCircle2, Play, BookOpen, List, CheckSquare, Archive, ExternalLink,
  Bell, HelpCircle, Clock, Sparkles
} from 'lucide-react';
import ciLogoWhite from '@/assets/ci-logo-white.png';
import { ExecutivePresentation } from './DemoPhase2';

// ══════════════════════════════════════════════════════════════
// SHARED DATA
// ══════════════════════════════════════════════════════════════

const REGULATORY_ITEMS = [
  { id: 'title22', name: 'Title 22 (California)', shortName: 'Title 22', color: '#facc15', icon: Landmark },
  { id: '42cfr', name: '42 CFR Part 484', shortName: '42 CFR §484', color: '#00e59b', icon: Scale },
  { id: 'cms', name: 'CMS State Operations', shortName: 'CMS State Ops', color: '#ec4899', icon: FileCheck },
  { id: 'hipaa', name: 'HIPAA Privacy & Security', shortName: 'HIPAA', color: '#3b82f6', icon: Lock },
  { id: 'osha', name: 'OSHA / Cal-OSHA', shortName: 'OSHA', color: '#f59e0b', icon: Shield },
  { id: 'oig', name: 'OIG Compliance Guidance', shortName: 'OIG', color: '#8b5cf6', icon: ShieldCheck },
  { id: 'fca', name: 'False Claims Act', shortName: 'FCA', color: '#a855f7', icon: Gavel },
];

const DOMAINS = [
  { code: 'GV', name: 'GOVERNANCE', fullName: 'GV — Governance & Administration', icon: Building2, color: '#00e59b', subdomains: [{ code: 'GB', name: 'Governing Body' }, { code: 'OG', name: 'Organization' }, { code: 'PM', name: 'Policy Management' }, { code: 'EA', name: 'External Affairs' }] },
  { code: 'CL', name: 'CLINICAL OPERATIONS', fullName: 'CL — Clinical Operations', icon: Heart, color: '#ef4444', subdomains: [{ code: 'PA', name: 'Patient Assessment' }, { code: 'CP', name: 'Care Planning' }, { code: 'OA', name: 'OASIS' }, { code: 'SD', name: 'Service Delivery' }, { code: 'IC', name: 'Infection Control' }, { code: 'DC', name: 'Discharge' }, { code: 'CA', name: 'Clinical Assessment' }, { code: 'CD', name: 'Clinical Documentation' }, { code: 'PR', name: 'Patient Rights' }] },
  { code: 'QA', name: 'QAPI', fullName: 'QA — Quality Assessment & Performance Improvement', icon: BarChart3, color: '#06b6d4', subdomains: [{ code: 'PG', name: 'QAPI Program' }, { code: 'SM', name: 'Star Monitoring' }, { code: 'AE', name: 'Adverse Events' }, { code: 'PI', name: 'PIPs' }] },
  { code: 'HR', name: 'HUMAN RESOURCES', fullName: 'HR — Human Resources', icon: Users, color: '#8b5cf6', subdomains: [{ code: 'TA', name: 'Talent Acquisition' }, { code: 'TD', name: 'Training & Dev' }, { code: 'WM', name: 'Workforce Mgmt' }, { code: 'ER', name: 'Employee Relations' }, { code: 'JD', name: 'Job Descriptions' }] },
  { code: 'CO', name: 'COMPLIANCE', fullName: 'CO — Compliance & Regulatory', icon: Shield, color: '#3b82f6', subdomains: [{ code: 'CP', name: 'Compliance Program' }, { code: 'HP', name: 'HIPAA & Privacy' }, { code: 'FA', name: 'Fraud & Abuse' }, { code: 'RA', name: 'Regulatory Affairs' }, { code: 'DC', name: 'Doc Compliance' }] },
  { code: 'FN', name: 'FINANCE', fullName: 'FN — Finance & Revenue Cycle', icon: DollarSign, color: '#10b981', subdomains: [{ code: 'FP', name: 'Financial Planning' }, { code: 'RC', name: 'Revenue Cycle' }, { code: 'BL', name: 'Billing' }, { code: 'CM', name: 'Coding & Classification' }] },
  { code: 'OP', name: 'OPERATIONS', fullName: 'OP — Operations & Facilities', icon: Briefcase, color: '#f97316', subdomains: [{ code: 'IM', name: 'Intake Mgmt' }, { code: 'SL', name: 'Service Logistics' }, { code: 'PA', name: 'Patient Access' }, { code: 'FM', name: 'Facility Admin' }] },
  { code: 'IT', name: 'IT & SECURITY', fullName: 'IT — Information Technology & Security', icon: Monitor, color: '#6366f1', subdomains: [{ code: 'SC', name: 'Security Controls' }, { code: 'DR', name: 'Data & Recovery' }, { code: 'SA', name: 'Systems Admin' }, { code: 'UP', name: 'Use Policies' }] },
  { code: 'RM', name: 'RISK MANAGEMENT', fullName: 'RM — Risk Management & Safety', icon: AlertTriangle, color: '#eab308', subdomains: [{ code: 'ER', name: 'Enterprise Risk' }, { code: 'SS', name: 'Staff Safety' }, { code: 'PS', name: 'Patient Safety' }, { code: 'EP', name: 'Emergency Plan' }] },
  { code: 'EN', name: 'ENTERPRISE CONTROL', fullName: 'EN — Enterprise Governance & Control', icon: Cpu, color: '#ec4899', subdomains: [{ code: 'TG', name: 'Taxonomy Gov' }, { code: 'LC', name: 'Lifecycle Control' }, { code: 'CM', name: 'Compliance Metrics' }] },
];

// ══════════════════════════════════════════════════════════════
// POLICY DATA
// ══════════════════════════════════════════════════════════════

const rawPolicies: Record<string, string[]> = {
  'GV-GB': ['001: Governing Body Authority & Responsibilities', '002: Board Meeting & Minutes Requirements', '003: Conflict of Interest Disclosure', '004: Succession Planning for Key Leadership', '005: Annual Governance Self-Assessment'],
  'GV-OG': ['001: Organizational Structure & Reporting', '002: Administrator Qualifications & Responsibilities', '003: Scope of Services Definition', '004: Strategic Planning & Annual Goals', '005: Delegation of Authority'],
  'GV-PM': ['001: Policy Development & Approval Process', '002: Policy Review & Revision Cycle', '003: Policy Acknowledgment & Staff Attestation', '004: Communication & Notification Standards', '005: Stakeholder Grievance & Feedback Management'],
  'GV-EA': ['001: Interagency Agreements & Contracts', '002: Community Liaison & Public Relations', '003: Legal Counsel Engagement & Oversight', '004: Agency Licensure & Certification Maintenance', '005: Agency Closure or Change of Ownership'],
  'CL-CP': ['001: Plan of Care Development & Approval', '002: Plan of Care Review & Update', '003: Physician Orders & Order Management', '004: Verbal Order Receipt & Authentication', '005: Coordination of Care', '006: Discharge Planning & Criteria', '007: Transfer & Referral Procedures', '008: Physician Recertification Timing Compliance', '009: Physician Order Signature Tracking & Escalation'],
  'CL-SD': ['001: Skilled Nursing Assessment & Services', '002: Physical Therapy Services', '003: Occupational Therapy Services', '004: Speech-Language Pathology Services', '005: Medical Social Work Services', '006: Home Health Aide Services & Supervision', '007: Home Health Aide Competency Evaluation', '008: Clinical Supervision & Oversight', '009: Telehealth & Remote Monitoring Services', '010: IV Therapy & Infusion Services', '011: Wound Care Assessment & Management', '012: Medication Management & Administration', '013: Medication Reconciliation at Transitions', '014: Pain Assessment & Management', '015: Fall Risk Assessment & Prevention', '016: Infection Prevention & Control', '017: Patient Education & Self-Management', '018: Diabetic Management & Monitoring', '019: Cardiac Care & Monitoring', '020: Respiratory Care & Management', '021: Pediatric Home Health Services', '022: Behavioral Health Screening & Referral', '023: Palliative & End-of-Life Care', '024: Missed Visit & Rescheduling', '025: Ordered Visit Frequency Compliance & Monitoring'],
  'CL-CA': ['001: Patient Assessment — Comprehensive', '002: OASIS Data Collection & Accuracy', '003: OASIS Transmission & Correction', '004: Recertification Assessment & Process', '005: Homebound Status Determination & Documentation', '006: Face-to-Face Encounter Compliance', '007: Face-to-Face Encounter Tracking & Expiration Monitoring'],
  'CL-CD': ['001: Clinical Documentation Standards', '002: Clinical Record Content & Organization', '003: Clinical Record Authentication & Signature Requirements', '004: Timely Documentation Completion & Lock Requirements'],
  'CL-PR': ['001: Patient Rights & Responsibilities', '002: Advance Directive Compliance', '003: Informed Consent', '004: Restraint & Seclusion Prohibition', '005: Emergency Preparedness — Clinical', '006: Abuse, Neglect & Exploitation Reporting'],
  'CL-OA': ['001: OASIS Completion Timeliness & Accountability', '002: OASIS Quality Review & Error Correction', '003: OASIS Clinician Authorization & Competency', '004: OASIS Item-Level Guidance Compliance', '005: OASIS Data Integrity & Security', '006: Documentation Hierarchy and Evidence Source Prioritization', '007: Evidence-Based OASIS Coding Substantiation', '008: Conflicting Documentation Source Resolution', '009: Point-in-Time Assessment at Start of Care', '010: CMS Look-Back Period Compliance for Assessment Items', '011: Standardized Assessment Tool Administration and Validity', '012: Clinical Reasoning Documentation for Coding Decisions', '013: Cross-Document Verification Prior to Assessment Finalization', '014: Medication Reconciliation — Prescribed Regimen vs. Actual Patient Behavior', '015: Assessment Completion Timeframe Compliance', '016: Scoring Methodology Integrity for Multi-Item Assessments', '017: Contemporaneous Documentation Requirement', '018: Clinician Competency Validation for OASIS Assessment', '019: Pre-Submission Quality Review for Comprehensive Assessments'],
  'QA-PG': ['001: QAPI Program Establishment & Governance', '002: QAPI Plan Development & Annual Review', '003: QAPI Committee Structure & Meeting Requirements'],
  'QA-PI': ['001: Performance Improvement Project Management', '002: Quality Indicator Monitoring & Reporting', '003: Clinical Outcome Benchmarking', '004: Data-Driven Decision Making', '005: Staff Competency Integration with QAPI', '006: Visit Utilization & LUPA Risk Management Program', '007: Staff Competency Impact on Patient Outcomes'],
  'QA-AE': ['001: Adverse Event Identification & Reporting', '002: Root Cause Analysis Process', '003: Corrective Action Plan Development & Tracking', '004: Patient Safety Program'],
  'QA-SM': ['001: Utilization Review & Management', '002: Infection Surveillance & Trending', '003: Patient Satisfaction Survey & Analysis', '004: Home Health Compare & Star Rating Monitoring', '005: Policy Effectiveness Monitoring and Outcome Validation'],
  'HR-TA': ['001: Recruitment & Hiring Standards', '002: Criminal Background Check & Screening', '003: OIG/SAM Exclusion Screening', '004: Licensure & Certification Verification', '005: Employee Orientation & Onboarding', '006: Job Description & Role Definition'],
  'HR-TD': ['001: Annual Mandatory Training Requirements', '002: Continuing Education & Professional Development', '003: Clinical Staff Competency Evaluation', '004: Student & Intern Supervision', '005: Emergency Preparedness Training & Drills'],
  'HR-ER': ['001: Performance Evaluation & Review', '002: Disciplinary Action & Progressive Discipline', '003: Employee Grievance & Complaint Process', '004: Anti-Harassment & Non-Discrimination', '005: Substance Abuse & Drug-Free Workplace', '006: Separation & Exit Process', '007: Workforce Diversity & Inclusion', '008: Remote Work & Flexible Scheduling', '009: Mandatory Abuse Reporting by Staff'],
  'HR-WM': ['001: Staffing Levels & Workload Management', '002: Contractor & Per Diem Staff Management', '003: Employee Health & Immunization Requirements', '004: Workplace Safety & Injury Prevention', '005: Employee Personnel File Management', '006: Volunteer Management & Oversight', '007: Personnel File Content & Compliance Requirements'],
  'HR-JD': ['000: Governing Body Structure & Responsibilities', '001: Administrator', '002: Administrator Designee', '003: Director of Nursing / Clinical Manager', '004: Clinical Designee', '005: Registered Nurse (RN)', '006: Licensed Vocational Nurse (LVN)', '007: Home Health Aide (HHA)', '008: Medical Social Worker (MSW)', '009: Physical Therapist (PT)', '010: Occupational Therapist (OT)'],
  'CO-CP': ['001: Corporate Compliance Program', '002: Compliance Officer Designation & Authority', '003: Compliance Committee Structure & Function', '004: Code of Conduct & Ethics', '005: Whistleblower Protection & Non-Retaliation', '006: Compliance Hotline & Reporting Mechanisms', '007: Compliance Investigation Process'],
  'CO-RA': ['001: Regulatory Change Monitoring & Implementation', '002: Internal Compliance Auditing Program', '003: External Audit & Survey Readiness', '004: Medicare Conditions of Participation Compliance', '005: State Licensure & Regulatory Compliance', '006: Accreditation Standards Compliance', '007: Sanctions & Enforcement Response'],
  'CO-FA': ['001: Anti-Kickback & Stark Law Compliance', '002: False Claims Act Awareness & Prevention', '003: Fraud, Waste & Abuse Prevention'],
  'CO-HP': ['001: HIPAA Privacy Program', '002: HIPAA Security Program', '003: HIPAA Breach Notification', '004: Minimum Necessary Standard', '005: Business Associate Agreement Management', '006: Patient Access to Records', '007: Record Retention & Destruction'],
  'CO-DC': ['001: Assessment Audit Trail and Data Integrity', '002: Documentation Audit & Monitoring Program', '003: Late Entry, Correction & Amendment Standards', '004: Clinical, Documentation, and Billing Alignment Audit'],
  'FN-BC': ['001: Medicare Billing & Claims Submission', '002: Claims Denial Management & Appeals', '003: Patient Billing & Financial Responsibility', '004: Overpayment Identification & Refund', '005: Pre-Claim Review Compliance', '006: Request for Anticipated Payment (RAP) Management', '007: Payment & Reimbursement Reconciliation'],
  'FN-CM': ['001: PDGM Classification & Coding Accuracy', '002: ICD-10 Coding Standards & Accuracy', '003: Medical Necessity Documentation', '004: Episode Management & Authorization', '005: LUPA Prevention & Monitoring'],
  'FN-FP': ['001: Payer Contract Management', '002: Charge Capture & Fee Schedule Management', '003: Revenue Cycle Performance Monitoring', '004: Bad Debt & Charity Care', '005: Annual Budget & Financial Planning', '006: Supply & Equipment Cost Management', '007: Financial Compliance & Fraud Monitoring Controls'],
  'OP-IM': ['001: Referral & Intake Management', '002: Patient Acceptance & Admission Criteria', '003: Service Area Definition & Coverage'],
  'OP-SL': ['001: Scheduling & Visit Management', '002: After-Hours & On-Call Services', '003: Vehicle & Transportation Safety', '004: Equipment & Supply Management', '005: Communication & Documentation Systems', '006: Service Delivery During Public Health Emergencies', '007: Inclement Weather & Hazardous Conditions'],
  'OP-PA': ['001: Patient Complaint & Grievance Resolution', '002: Patient Identification & Verification', '003: Interpreter & Language Access Services', '004: Cultural Competency in Service Delivery', '005: Patient Property & Belongings'],
  'OP-FM': ['001: Office Operations & Facility Management', '002: Branch Office & Satellite Operations', '003: Vendor & Supplier Management', '004: Mail & Correspondence Management', '005: Emergency Operations & Business Continuity'],
  'IT-SC': ['001: Information Security Program', '002: Access Control & User Authentication', '003: Data Encryption Standards', '004: Network Security & Firewall Management', '005: Endpoint Security & Malware Protection', '006: Data Classification & Handling'],
  'IT-DR': ['001: Data Backup & Recovery', '002: Disaster Recovery & IT Continuity', '003: Audit Log Management & Monitoring', '004: Cloud Services & Data Storage', '005: Security Incident Response'],
  'IT-SA': ['001: Electronic Health Record System Management', '002: Software Acquisition & License Management', '003: System Change Management', '004: Vendor & Third-Party Security Assessment', '005: Physical Security of IT Assets'],
  'IT-UP': ['001: Mobile Device & BYOD Security', '002: Internet & Email Acceptable Use', '003: Social Media & Public Communications', '004: Security Awareness Training'],
  'RM-ER': ['001: Enterprise Risk Management Program', '002: Incident Reporting & Investigation', '003: Risk Assessment & Prioritization', '004: Liability & Insurance Management', '005: Risk Trending & Pattern Analysis', '006: Claims Management & Litigation Support'],
  'RM-SS': ['001: Staff Safety & Personal Security', '002: Workplace Violence Prevention', '003: Motor Vehicle Safety & Accident Reporting'],
  'RM-PS': ['001: Environmental Safety Assessment', '002: Hazardous Materials & Waste Management', '003: Product & Equipment Safety Recall Management', '004: Patient Elopement & Wandering Risk', '005: High-Risk Medication Safety'],
  'RM-EP': ['001: Pandemic & Infectious Disease Response', '002: Emergency Preparedness Training & Testing Program', '003: Patient Emergency Communication Plan'],
  'EN-TG': ['001: Enterprise Policy Taxonomy & Classification Governance', '002: Regulatory Cross-Reference & Mapping'],
  'EN-LC': ['001: Policy Lifecycle Management & Version Control', '002: Policy Exception & Waiver Management', '003: Policy Assignment and Role-Based Applicability Governance', '004: Policy Retirement and Obsolescence Management'],
  'EN-CM': ['001: Policy Compliance Metrics & Dashboard Reporting', '002: Inter-Domain Policy Coordination & Conflict Resolution'],
};

const newPoliciesData = [
  { id: 'CO-HP-101', title: 'HIPAA, CMIA & Sensitive Data Privacy Management', domainCode: 'CO', subCode: 'HP' },
  { id: 'CO-BA-101', title: 'Business Associate & Vendor PHI Management', domainCode: 'CO', subCode: 'HP' },
  { id: 'CO-IR-101', title: 'Security Incident Response & Breach Notification', domainCode: 'CO', subCode: 'HP' },
  { id: 'CO-DG-101', title: 'Data Governance & Minimum Necessary Enforcement', domainCode: 'CO', subCode: 'DC' },
  { id: 'CO-FW-101', title: 'Fraud, Waste & Abuse Prevention (Comprehensive)', domainCode: 'CO', subCode: 'FA' },
  { id: 'CO-AI-101', title: 'AI & Automated Systems Governance', domainCode: 'CO', subCode: 'DC' },
  { id: 'HR-TR-101', title: 'Workforce Training, Competency & Policy Acknowledgment', domainCode: 'HR', subCode: 'TD' },
  { id: 'HR-EH-101', title: 'Employee Health, Exposure & Occupational Clearance', domainCode: 'HR', subCode: 'WM' },
  { id: 'RM-OS-101', title: 'Cal/OSHA Occupational Safety Program (IIPP)', domainCode: 'RM', subCode: 'SS' },
  { id: 'RM-EP-004', title: 'Public Health Emergency Integration', domainCode: 'RM', subCode: 'EP' },
];

function matches(policyId: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.endsWith('*')) return policyId.startsWith(pattern.replace('*', ''));
    return policyId === pattern;
  });
}

function getTagsForPolicy(id: string) {
  const tags: string[] = [];
  const u = id.toUpperCase();
  if (u === 'GV-GB-001') {
    tags.push('42cfr', 'title22', 'hipaa', 'oig', 'fca', 'cms');
  }
  if (matches(u, ['GV-EA-004','GV-OG-002','GV-OG-003','HR-TA-001','HR-TA-004','HR-EH-101','RM-OS-101','RM-EP-001','RM-EP-002','FN-BC-001','FN-FP-005'])) tags.push('title22');
  if (matches(u, ['CO-HP-*','CO-BA-101','CO-IR-101','CO-DG-101','CO-DC-001']) && !matches(u, ['CO-FW-101','CO-AI-101','HR-TR-101','HR-EH-101'])) tags.push('hipaa');
  if (matches(u, ['FN-BC-001','FN-CM-003','CL-CD-001','QA-PI-002','CO-CP-005','CO-FW-101'])) tags.push('fca');
  if (matches(u, ['CL-SD-001','CL-SD-002','CL-SD-012','CL-SD-016','CL-SD-017','CL-CD-001','QA-*','HR-TR-101'])) tags.push('cms');
  if (matches(u, ['CO-*','FN-BC-001','FN-CM-003','CL-CD-001','CL-SD-001','CL-SD-002','QA-*','HR-TA-002','HR-TA-003'])) tags.push('oig');
  if (matches(u, ['RM-SS-*','RM-OS-101','HR-EH-101'])) tags.push('osha');
  if (matches(u, ['RM-OS-101'])) tags.push('ca');
  if (matches(u, ['GV-*','CL-*','QA-*','OP-*'])) tags.push('42cfr');
  return [...new Set(tags)];
}

interface DemoPolicy {
  id: string; policyId: string; title: string; domain: string; domainCode: string;
  subdomain: string; subdomainCode: string; classificationTier: string; status: string;
  version: string; effectiveDate: string; nextReviewDate: string; policyOwner: string;
  approvedBy: string; purpose: string; scope: string[]; regulatoryTags: string[];
}

const FULL_POLICY_DATASET: DemoPolicy[] = [];

Object.entries(rawPolicies).forEach(([prefix, items]) => {
  const [domainCode, subdomainCode] = prefix.split('-');
  const domain = DOMAINS.find(d => d.code === domainCode);
  const subdomain = domain?.subdomains.find(s => s.code === subdomainCode);
  items.forEach(item => {
    const [idNum, ...titleParts] = item.split(': ');
    const title = titleParts.join(': ');
    const fullId = `${domainCode}-${subdomainCode}-${idNum}`;
    FULL_POLICY_DATASET.push({
      id: fullId.toLowerCase(), policyId: fullId, title, domain: domain?.fullName || 'Unknown', domainCode, subdomain: `${subdomain?.code} — ${subdomain?.name}`, subdomainCode,
      classificationTier: 'REQUIRED', status: 'ACTIVE', version: '6.0', effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10', policyOwner: 'Administrator', approvedBy: 'Governing Body Chair',
      purpose: `This policy establishes standards for ${title} to ensure compliance with enterprise and regulatory requirements.`, scope: ['All applicable personnel', 'Management'], regulatoryTags: getTagsForPolicy(fullId),
    });
  });
});

newPoliciesData.forEach(p => {
  const domain = DOMAINS.find(d => d.code === p.domainCode);
  const subdomain = domain?.subdomains.find(s => s.code === p.subCode);
  FULL_POLICY_DATASET.push({
    id: p.id.toLowerCase(), policyId: p.id, title: p.title, domain: domain?.fullName || 'Unknown', domainCode: p.domainCode, subdomain: `${subdomain?.code} — ${subdomain?.name}`, subdomainCode: p.subCode,
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0', effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10', policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair',
    purpose: `This policy establishes standards for ${p.title}.`, scope: ['All applicable personnel'], regulatoryTags: getTagsForPolicy(p.id),
  });
});


// ══════════════════════════════════════════════════════════════
// GV-GB-001 SPECIMEN DATA — 100% QA Audited
// ══════════════════════════════════════════════════════════════

const GV_DEFINITIONS = [
  { term: 'Governing Body', definition: 'The individual(s), board of directors, trustees, partnership, corporation, or other legally constituted authority that has ultimate responsibility for the management and operation of Care Indeed Home Health Care, Inc., as defined by 42 CFR § 484.2 and § 484.105.' },
  { term: 'Administrator', definition: "The individual appointed by the Governing Body who is responsible for managing the agency's day-to-day operations and who meets all qualifications specified in agency policy GV-OG-002 and applicable California state law." },
  { term: 'Clinical Manager', definition: 'The registered nurse (or qualified individual per California state law) designated by the Governing Body to oversee clinical services including patient care delivery, clinical staff supervision, and OASIS compliance. Also referred to as Director of Nursing (DON).' },
  { term: 'Fiduciary Duty', definition: 'The legal obligation of Governing Body members to act in good faith, with due diligence, and in the best interest of the agency and the patients it serves.' },
  { term: 'Quorum', definition: "The minimum number of Governing Body members required to be present (physically or via approved teleconference) to conduct official business, as defined in the agency's bylaws or operating agreement." },
  { term: 'QAPI', definition: 'Quality Assessment and Performance Improvement — the structured program required by 42 CFR § 484.65 for ongoing quality monitoring and improvement.' },
];

const GV_STATEMENTS = [
  'Care Indeed Home Health Care, Inc. shall maintain a designated Governing Body that holds full legal authority and responsibility for the overall operation, management, and regulatory compliance of the home health agency, as required by 42 CFR § 484.105(a).',
  'The Governing Body shall be responsible for ensuring that Care Indeed Home Health Care, Inc. operates in compliance with all applicable federal, state, and local laws, regulations, and licensure requirements at all times.',
  "The Governing Body shall appoint a qualified Administrator who is authorized to act on behalf of the Governing Body in the day-to-day management of the agency and who meets the qualifications defined in agency policy GV-OG-002 and applicable California state requirements.",
  'The Governing Body shall ensure the appointment and ongoing oversight of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services, in compliance with 42 CFR § 484.105(c).',
  "The Governing Body shall approve and oversee the agency's:\n• Scope of services (GV-OG-003)\n• Organizational structure and reporting lines (GV-OG-001)\n• Annual strategic plan and operational goals (GV-OG-004)\n• Policy framework and all REQUIRED-tier policies (GV-PM-001, GV-PM-002)\n• QAPI program (QA-PG-001, QA-PG-002)\n• Corporate compliance program (CO-CP-001)\n• Annual operating budget (FN-FP-005)\n• Emergency preparedness plan (OP-FM-005)",
  'The Governing Body shall meet at a frequency sufficient to fulfill its oversight responsibilities, but not less than quarterly, with meetings documented in formal minutes per policy GV-GB-002.',
  'The Governing Body shall not delegate its ultimate accountability for regulatory compliance, patient safety, or fiscal integrity. Delegation of specific authority shall comply with policy GV-OG-005.',
  'All members of the Governing Body shall disclose and manage conflicts of interest in accordance with policy GV-GB-003.',
  'Only the most current approved version of this policy shall be considered valid. Superseded versions must not be used for any operational or compliance purpose. Any revision to this policy requires re-acknowledgment by all Governing Body members and senior leadership within 14 calendar days of the revised effective date.',
];

const GV_PROC_61: string[][] = [
  ['6.1.1', 'Agency Owner / Corporate Entity', 'Formally establish the Governing Body through articles of incorporation, operating agreement, partnership agreement, or equivalent legal instrument for Care Indeed Home Health Care, Inc. The establishing document must identify: (a) the legal form of the Governing Body; (b) the minimum and maximum number of members; (c) the quorum requirement; (d) the terms of appointment or election.', 'Prior to initial Medicare certification and maintained continuously thereafter.'],
  ['6.1.2', 'Governing Body Chair', 'Maintain a current roster of all Governing Body members including: full legal name, title/role, date of appointment, term expiration date, voting status, and contact information.', 'Updated within 7 calendar days of any membership change.'],
  ['6.1.3', 'Governing Body', 'Ensure composition includes, at minimum, individuals with competency in: (a) healthcare operations or clinical services; (b) financial management; (c) regulatory compliance. If any competency area is not represented, retain qualified advisory counsel within 30 calendar days of identifying the gap.', 'Ongoing; reviewed annually at the first quarterly meeting.'],
  ['6.1.4', 'Compliance Officer', 'Verify that no Governing Body member appears on the OIG List of Excluded Individuals/Entities (LEIE) or the System for Award Management (SAM) exclusion database at the time of appointment and monthly thereafter, per policy HR-TA-003.', 'At appointment and monthly thereafter.'],
];

const GV_PROC_62: { title: string; rows: string[][] }[] = [
  { title: '6.2.1 — Legal Authority and Agency Operations', rows: [
    ['6.2.1.1', 'Governing Body', 'Assume and maintain full legal authority for the overall operation, management, and fiscal viability of Care Indeed Home Health Care, Inc.', 'Continuous.'],
    ['6.2.1.2', 'Governing Body', 'Ensure the agency maintains current and valid: (a) California home health license — HCAI License No. 406412878; (b) Medicare certification; (c) Medicaid enrollment (if applicable); (d) accreditation (if applicable) — per policy GV-EA-004.', 'Continuous; verified at each quarterly meeting.'],
    ['6.2.1.3', 'Governing Body', "Review and approve the agency's defined scope of services (policy GV-OG-003) at least annually. Ensure the agency does not provide services beyond those for which it is licensed, staffed, and competent to deliver.", 'Annually, within 30 calendar days of the start of the fiscal year.'],
  ]},
  { title: '6.2.2 — Appointment and Oversight of Key Personnel', rows: [
    ['6.2.2.1', 'Governing Body', 'Appoint a qualified Administrator and document the appointment in Governing Body minutes. The Administrator must meet all qualifications defined in policy GV-OG-002 and applicable California state law.', 'Prior to agency operation and within 30 calendar days of any vacancy.'],
    ['6.2.2.2', 'Governing Body', 'Appoint or confirm the appointment of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services, per 42 CFR § 484.105(c).', 'Prior to agency operation and within 30 calendar days of any vacancy.'],
    ['6.2.2.3', 'Governing Body', 'Appoint or confirm the designation of a Compliance Officer with authority and independence to operate the corporate compliance program, per policy CO-CP-002.', 'Prior to agency operation and within 30 calendar days of any vacancy.'],
    ['6.2.2.4', 'Governing Body', 'Conduct or commission an annual performance evaluation of the Administrator. Results and any corrective directives shall be documented in executive session minutes.', 'Annually; completed within 60 calendar days of the end of each fiscal year.'],
    ['6.2.2.5', 'Governing Body', "Review and approve the agency's succession plan for the Administrator, Clinical Manager, and Compliance Officer, per policy GV-GB-004.", 'Annually at the second quarterly meeting; updated within 14 calendar days of any key leadership vacancy.'],
  ]},
  { title: '6.2.3 — Policy and Compliance Oversight', rows: [
    ['6.2.3.1', 'Governing Body', 'Approve all REQUIRED-tier policies prior to implementation and ensure a defined policy review cycle exists per policies GV-PM-001 and GV-PM-002.', 'Prior to implementation of each REQUIRED policy; review cycle approved annually.'],
    ['6.2.3.2', 'Governing Body', 'Receive and review a compliance status report from the Compliance Officer at each quarterly meeting. The report must address: (a) active compliance investigations; (b) audit findings; (c) regulatory changes affecting the agency; (d) training completion rates.', 'Quarterly.'],
    ['6.2.3.3', 'Compliance Officer', 'Prepare and submit the quarterly compliance report to the Governing Body no fewer than 7 calendar days before each scheduled quarterly meeting.', '7 calendar days before each quarterly meeting.'],
    ['6.2.3.4', 'Governing Body', 'Review and act upon any compliance deficiency identified as high-risk within 14 calendar days of receiving the compliance report. Action must be documented in meeting minutes or a special resolution.', 'Within 14 calendar days of report receipt.'],
  ]},
  { title: '6.2.4 — Quality Assessment and Performance Improvement (QAPI) Oversight', rows: [
    ['6.2.4.1', 'Governing Body', 'Approve the agency QAPI plan per policy QA-PG-002. Ensure the plan includes measurable quality indicators, performance improvement projects, and patient safety initiatives.', 'Annually; approved at the first quarterly meeting.'],
    ['6.2.4.2', 'Clinical Manager / QA Designee', 'Present a QAPI performance report to the Governing Body at each quarterly meeting including: (a) quality indicator trends; (b) status of active PIPs; (c) adverse event summary; (d) patient satisfaction data; (e) Star Rating / Home Health Compare trends.', 'Quarterly.'],
    ['6.2.4.3', 'Governing Body', 'Review, discuss, and document response to the QAPI report. If any quality indicator falls below the defined threshold for 2 consecutive reporting periods, direct corrective action with a defined resolution deadline.', 'At each quarterly meeting; corrective action directive within 14 calendar days if thresholds are breached.'],
  ]},
  { title: '6.2.5 — Financial Oversight', rows: [
    ['6.2.5.1', 'Governing Body', 'Review and approve the annual operating budget per policy FN-FP-005.', 'Annually; approved no later than 30 calendar days before the start of each fiscal year.'],
    ['6.2.5.2', 'Administrator', 'Present a financial performance report at each quarterly meeting including: (a) revenue vs. budget variance; (b) accounts receivable aging; (c) claims denial rate and trending; (d) cash flow position.', 'Quarterly.'],
    ['6.2.5.3', 'Governing Body', 'Review financial reports and direct corrective action if: (a) actual revenue deviates more than 10% below budget for 2 consecutive months; (b) claims denial rate exceeds 5%; (c) days in accounts receivable exceed 60.', 'At each quarterly meeting.'],
  ]},
  { title: '6.2.6 — Emergency Preparedness', rows: [
    ['6.2.6.1', 'Governing Body', 'Approve the Emergency Operations and Business Continuity Plan per policy OP-FM-005 and 42 CFR § 484.102.', 'Annually; approved at the third quarterly meeting.'],
    ['6.2.6.2', 'Administrator', 'Report the results of the most recent emergency preparedness drill or exercise to the Governing Body, including identified gaps and corrective actions.', 'At the quarterly meeting following each drill (minimum 2 drills per year).'],
  ]},
];

const GV_PROC_63: string[][] = [
  ['6.3.1', 'Governing Body Chair', 'Schedule and convene regular Governing Body meetings no fewer than 4 times per calendar year. The meeting schedule for the upcoming year must be established and distributed to all members by December 15 of the preceding year.', 'Quarterly; schedule distributed by December 15.'],
  ['6.3.2', 'Governing Body Chair', 'Convene special meetings when urgent matters arise, including: (a) CMS survey findings requiring immediate corrective action; (b) serious adverse events; (c) regulatory enforcement actions; (d) key leadership vacancies. Notice must be provided to all members at least 48 hours in advance.', 'As needed; notice within 48 hours or shorter for imminent patient safety threats.'],
  ['6.3.3', 'Designated Secretary / Administrator', 'Prepare and distribute the meeting agenda to all members no fewer than 7 calendar days before each scheduled meeting. Standing items: (a) approval of prior minutes; (b) Administrator report; (c) compliance report; (d) QAPI report; (e) financial report; (f) old business; (g) new business.', '7 calendar days before each meeting.'],
  ['6.3.4', 'Designated Secretary', 'Record formal minutes for each meeting per policy GV-GB-002. Minutes must document: (a) date, time, and location; (b) members present and absent; (c) quorum determination; (d) all motions, seconds, and voting outcomes; (e) all directives issued with assigned responsible parties and deadlines.', 'Draft minutes completed within 14 calendar days; approved at the next regular meeting.'],
  ['6.3.5', 'Governing Body Chair', 'Ensure a quorum is present before conducting any official business. If quorum is not achieved, the meeting shall be rescheduled within 14 calendar days.', 'At the start of each meeting.'],
];

const GV_PROC_64: string[][] = [
  ['6.4.1', 'All Governing Body Members', 'Complete and submit the Conflict of Interest Disclosure Form (Appendix B) at the time of appointment, annually thereafter, and within 7 calendar days of any change in circumstances that could create a new conflict, per policy GV-GB-003.', 'At appointment; annually; within 7 days of change.'],
  ['6.4.2', 'Compliance Officer', 'Review all submitted conflict of interest disclosures within 14 calendar days of receipt and present a summary to the Governing Body with recommendations for management or recusal.', 'Within 14 calendar days of receipt.'],
  ['6.4.3', 'Governing Body', 'Act on conflict of interest recommendations. Any member with a disclosed conflict shall recuse from discussion and voting on the affected matter. Recusals must be documented in meeting minutes.', 'At the meeting where the affected matter is addressed.'],
];

const GV_PROC_65: string[][] = [
  ['Governing Body fails to meet quarterly', 'Administrator notifies all members and the Compliance Officer in writing.', 'Administrator schedules a make-up meeting. If Governing Body does not convene within 30 calendar days, the Compliance Officer documents the deficiency and initiates corrective action per QA-AE-003.', 'Make-up meeting within 30 calendar days of the missed quarter.'],
  ['Quorum not achieved for 2 consecutive scheduled meetings', 'Governing Body Chair escalates to the full membership in writing.', "Chair initiates membership recruitment or replacement per the agency's bylaws. Issue must be resolved before the next scheduled meeting.", 'Within 30 calendar days.'],
  ['Key leadership vacancy exceeds 30 days unfilled', 'Governing Body Chair', 'Governing Body must appoint an interim designee within 14 calendar days of vacancy and document the appointment. Permanent appointment must occur within 90 calendar days.', 'Interim: 14 days. Permanent: 90 days.'],
  ['CMS survey results in Condition-level deficiency', 'Administrator convenes a special Governing Body meeting.', 'Governing Body directs development of a Plan of Correction within CMS-required timeframes (typically 10 calendar days). Governing Body receives weekly status updates until resolution is confirmed.', 'Special meeting within 48 hours of receipt of findings; Plan of Correction per CMS deadline.'],
  ['Compliance Officer reports fraud, waste, or abuse concern to Governing Body', 'Governing Body Chair', 'Governing Body directs investigation per CO-CP-007 and ensures non-retaliation per CO-CP-005. Investigation status updates at each meeting until resolution.', 'Investigation initiated within 7 calendar days; updates at each meeting.'],
];

const GV_DOCS_REQ: string[][] = [
  ['Governing Body establishment', 'Articles of incorporation, operating agreement, bylaws, or equivalent legal instrument establishing the Governing Body of Care Indeed Home Health Care, Inc.', 'Agency Owner / Corporate Entity', 'Corporate records repository (physical or electronic).', 'Maintained permanently; updated within 14 calendar days of any amendment.'],
  ['Governing Body membership roster', 'Current roster including member name, role, appointment date, term, voting status, and contact information (Appendix A).', 'Governing Body Chair', 'Agency governance file; copy maintained by Administrator.', 'Updated within 7 calendar days of any change.'],
  ['Meeting minutes', 'Formal minutes for all regular and special meetings, per policy GV-GB-002 (Appendix D template).', 'Designated Secretary', 'Agency governance file; copy provided to each member.', 'Draft within 14 calendar days of meeting; approved at next regular meeting. Retained minimum 7 years.'],
  ['Meeting agendas', 'Agenda for each regular and special meeting.', 'Administrator / Designated Secretary', 'Agency governance file.', 'Distributed 7 calendar days before each meeting; retained minimum 7 years.'],
  ['Administrator appointment', "Written documentation of the Governing Body's appointment of the Administrator, including qualifications verified.", 'Governing Body Chair', 'Governing Body minutes; Administrator personnel file.', 'At time of appointment.'],
  ['Clinical Manager appointment', 'Written documentation of the appointment or confirmation of the Clinical Manager.', 'Governing Body Chair', 'Governing Body minutes; Clinical Manager personnel file.', 'At time of appointment.'],
  ['Compliance Officer designation', 'Written documentation of the designation and authority granted to the Compliance Officer.', 'Governing Body Chair', 'Governing Body minutes; Compliance Officer personnel file.', 'At time of designation.'],
  ['Conflict of Interest disclosures', 'Completed Conflict of Interest Disclosure Forms (Appendix B) for each Governing Body member.', 'Compliance Officer (collection); each member (completion)', 'Compliance file; copy in governance file.', 'At appointment; annually; within 7 days of change. Retained minimum 7 years.'],
  ['Quarterly compliance reports', "Compliance Officer's written report to the Governing Body.", 'Compliance Officer', 'Agency governance file; compliance records.', 'Submitted 7 days before each quarterly meeting; retained minimum 7 years.'],
  ['Quarterly QAPI reports', "Clinical Manager / QA Designee's written report to the Governing Body.", 'Clinical Manager / QA Designee', 'Agency governance file; QAPI records.', 'Presented at each quarterly meeting; retained minimum 7 years.'],
  ['Financial reports', 'Quarterly financial performance report presented to the Governing Body.', 'Administrator', 'Agency governance file; financial records.', 'Presented at each quarterly meeting; retained per CO-HP-007.'],
  ['Annual budget approval', 'Documented Governing Body approval of the annual operating budget.', 'Administrator (preparation); Governing Body (approval)', 'Governing Body minutes; financial records.', 'Annually; approved 30 days before fiscal year start.'],
  ['QAPI plan approval', 'Documented Governing Body approval of the annual QAPI plan.', 'Clinical Manager / QA Designee (preparation); Governing Body (approval)', 'Governing Body minutes; QAPI records.', 'Annually at first quarterly meeting.'],
  ['Emergency preparedness plan approval', 'Documented Governing Body approval of the emergency plan.', 'Administrator (preparation); Governing Body (approval)', 'Governing Body minutes; emergency preparedness file.', 'Annually at third quarterly meeting.'],
  ['Exclusion screening results', 'Documentation of OIG/SAM screening for each Governing Body member.', 'Compliance Officer', 'Compliance file.', 'At appointment; monthly thereafter.'],
  ['Policy acknowledgment', 'Signed acknowledgment of this policy by all Governing Body members and senior leadership (Appendix C).', 'Each member / leader (completion); Administrator (collection)', 'Policy acknowledgment file.', 'Within 14 calendar days of policy effective date or revision; within 14 calendar days of new appointment.'],
  ['Annual Governance Self-Assessment', 'Completed self-assessment per policy GV-GB-005 (if adopted).', 'Governing Body Chair', 'Governance file.', 'Annually.'],
];

const GV_COMPLIANCE_81: string[][] = [
  ['Governing Body is legally established and documented.', 'Review of establishing documents (articles, bylaws, operating agreement).', 'Current, complete, and on file at all times.'],
  ['Governing Body meets at least quarterly.', 'Review of meeting minutes with dates and attendance.', '4 or more meetings per calendar year with quorum present at each.'],
  ['Key personnel (Administrator, Clinical Manager, Compliance Officer) are appointed and documented.', 'Review of Governing Body minutes; personnel files; appointment letters.', 'Current appointments documented; no vacancy exceeds 30 days without interim designee.'],
  ['QAPI plan is reviewed and approved annually.', 'Review of Governing Body minutes for documented approval.', 'Annual approval documented at first quarterly meeting.'],
  ['Compliance reports are presented quarterly.', 'Review of Governing Body agendas and minutes; compliance report files.', 'Reports submitted 7 days before each meeting; discussion documented in minutes.'],
  ['Conflict of Interest disclosures are current.', 'Review of Appendix B forms for each member; annual renewal dates.', '100% completion rate; no lapsed disclosures.'],
  ['Budget is approved annually.', 'Review of Governing Body minutes; budget document.', 'Approved no later than 30 days before fiscal year start.'],
  ['Governing Body members are screened for exclusion.', 'Review of OIG/SAM screening logs.', 'Initial screening at appointment; monthly screening documented.'],
  ['Policy acknowledgments are current.', 'Review of signed Appendix C forms.', '100% acknowledgment within 14 calendar days of effective date or new appointment.'],
];

const GV_COMPLIANCE_82: string[] = [
  '1. Evidence that a Governing Body exists and is functioning. Surveyors will request establishing documents and a current membership roster.',
  '2. Evidence that the Governing Body has appointed a qualified Administrator. Surveyors will review Governing Body minutes for appointment documentation and verify qualifications.',
  '3. Evidence of Clinical Manager oversight. Surveyors will look for Governing Body minutes documenting appointment, reporting, and oversight of clinical services leadership.',
  '4. Evidence that the Governing Body oversees QAPI. Passive receipt of reports without documented action is a common deficiency.',
  "5. Evidence of policy oversight. Surveyors will verify that the Governing Body has approved the agency's policies and that a review cycle exists.",
  "6. Evidence of fiscal oversight. Surveyors will review whether the Governing Body monitors the agency's financial viability and acts on adverse trends.",
  '7. Meeting frequency and documentation quality. Surveyors will request all meeting minutes for the look-back period and assess completeness including attendance, quorum, and documented decisions.',
];

const GV_COMPLIANCE_83: string[][] = [
  ['No documented evidence that a Governing Body exists or functions.', 'Condition-level deficiency under 42 CFR § 484.105. Potential termination of Medicare certification.', 'Maintain establishing documents, current roster, and quarterly minutes on file and readily accessible.'],
  ['Governing Body meetings are held but not documented.', 'Surveyor will treat undocumented meetings as not having occurred.', 'Use Appendix D template; complete draft minutes within 14 calendar days.'],
  ['Governing Body \'rubber stamps\' reports without documented discussion or action.', 'Surveyors will cite passive governance as failure to exercise oversight.', 'Minutes must document specific discussion points, questions, directives, and assigned follow-up.'],
  ['Key leadership vacancies are unfilled for extended periods.', 'Surveyor will cite failure to ensure adequate management.', 'Fill or designate interim within 14 calendar days per Section 6.5.'],
  ['No documented conflict of interest disclosures.', 'OIG compliance program requirement; potential survey finding.', 'Enforce annual disclosure per Appendix B; Compliance Officer tracks compliance.'],
  ['QAPI plan approved but no evidence of Governing Body review of quality data.', 'Surveyor will cite failure of governing body oversight of QAPI (42 CFR § 484.65 cross-reference).', 'Require quarterly QAPI report presentation and document Governing Body response.'],
];

const GV_FEDERAL_REFS: string[][] = [
  ['42 CFR § 484.2', 'Definitions', "Defines 'governing body' and key terms for home health agencies."],
  ['42 CFR § 484.105', 'CoP: Organization and Administration of Services', 'Primary regulatory basis for this policy. Requires a governing body with full legal authority for agency operation and management.'],
  ['42 CFR § 484.105(a)', 'Standard: Governing body', 'Mandates governing body responsibility for agency operations, appointment of administrator, and oversight of services.'],
  ['42 CFR § 484.105(b)', 'Standard: Administrator', 'Requires appointment of a qualified administrator responsible to the governing body.'],
  ['42 CFR § 484.105(c)', 'Standard: Clinical manager', 'Requires designation of a qualified clinical manager for oversight of clinical services.'],
  ['42 CFR § 484.60', 'CoP: Care planning, coordination, and quality of care', 'Governing body accountability for ensuring care planning and quality.'],
  ['42 CFR § 484.65', 'CoP: Quality assessment and performance improvement (QAPI)', 'Governing body must ensure an effective QAPI program.'],
  ['42 CFR § 484.70', 'CoP: Infection prevention and control', 'Governing body oversight of infection prevention.'],
  ['42 CFR § 484.100', 'CoP: Compliance with Federal, State, and local laws', 'Governing body must ensure full legal compliance.'],
  ['42 CFR § 484.102', 'CoP: Emergency preparedness', 'Governing body must approve emergency preparedness plan.'],
  ['42 CFR § 484.110', 'CoP: Clinical records', 'Governing body oversight of clinical records policies.'],
];

const GV_CROSS_REFS: string[][] = [
  ['GV-OG-001', 'Organizational Structure & Reporting', 'Governing Body approves organizational structure.'],
  ['GV-OG-002', 'Administrator Qualifications & Responsibilities', 'Governing Body appoints and evaluates Administrator.'],
  ['GV-OG-003', 'Scope of Services Definition', 'Governing Body approves scope of services.'],
  ['GV-OG-004', 'Strategic Planning & Annual Goals', 'Governing Body approves strategic plan.'],
  ['GV-OG-005', 'Delegation of Authority', 'Governs limits of Governing Body delegation.'],
  ['GV-PM-001', 'Policy Development & Approval Process', 'Governing Body approves REQUIRED-tier policies.'],
  ['GV-PM-002', 'Policy Review & Revision Cycle', 'Governing Body ensures policy review cycle.'],
  ['GV-PM-003', 'Policy Acknowledgment & Staff Attestation', 'Staff acknowledgment of this and all policies.'],
  ['GV-GB-002', 'Board Meeting & Minutes Requirements', 'Details meeting documentation standards.'],
  ['GV-GB-003', 'Conflict of Interest Disclosure', 'Governs member conflict disclosures.'],
  ['GV-GB-004', 'Succession Planning for Key Leadership', 'Governing Body reviews succession plan.'],
  ['GV-GB-005', 'Annual Governance Self-Assessment', 'Governing Body self-assessment tool.'],
  ['GV-EA-004', 'Agency Licensure & Certification Maintenance', 'Governing Body ensures licensure/certification currency.'],
  ['GV-EA-005', 'Agency Closure or Change of Ownership', 'Governing Body directs CHOW process.'],
  ['QA-PG-001', 'QAPI Program Establishment & Governance', 'Governing Body oversees QAPI program.'],
  ['QA-PG-002', 'QAPI Plan Development & Annual Review', 'Governing Body approves QAPI plan.'],
  ['QA-AE-003', 'Corrective Action Plan Development & Tracking', 'Escalation path for governance deficiencies.'],
  ['QA-SM-004', 'Home Health Compare & Star Rating Monitoring', 'Data reported to Governing Body quarterly.'],
  ['CO-CP-001', 'Corporate Compliance Program', 'Governing Body oversees compliance program.'],
  ['CO-CP-002', 'Compliance Officer Designation & Authority', 'Governing Body appoints Compliance Officer.'],
  ['CO-CP-005', 'Whistleblower Protection & Non-Retaliation', 'Governing Body ensures non-retaliation.'],
  ['CO-CP-007', 'Compliance Investigation Process', 'Governing Body directs investigations.'],
  ['CO-HP-007', 'Record Retention & Destruction', 'Retention standards for governance records.'],
  ['FN-FP-005', 'Annual Budget & Financial Planning', 'Governing Body approves budget.'],
  ['HR-TA-003', 'OIG/SAM Exclusion Screening', 'Screening of Governing Body members.'],
  ['OP-FM-005', 'Emergency Operations & Business Continuity', 'Governing Body approves emergency plan.'],
  ['EN-TG-001', 'Enterprise Policy Taxonomy & Classification Governance', 'Framework under which this policy is classified.'],
];

// ══════════════════════════════════════════════════════════════
// STEP 1 — TAXONOMY COVER PAGE (Hero / Intro)
// ══════════════════════════════════════════════════════════════

function TaxonomyCoverView({ onViewPolicies }: { onViewPolicies: () => void }) {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'lifecycle'>('hierarchy');
  const allSubdomains = DOMAINS.flatMap(d => d.subdomains);

  const stats = [
    { label: 'TAXONOMY DOMAINS', value: '10', sub: 'Top-Level Categories', color: '#f97316', icon: Layers },
    { label: 'SUBDOMAINS', value: allSubdomains.length.toString(), sub: 'Structural Pillars', color: '#eab308', icon: GitBranch },
    { label: 'TOTAL POLICIES', value: '269', sub: 'Managed Artifacts', color: '#3b82f6', icon: FileText },
    { label: 'GOVERNANCE', value: '100%', sub: 'Framework Alignment', color: '#00e59b', icon: ShieldCheck },
  ];

  return (
    <div className="demo-fadeIn text-white p-6 md:p-8 font-roboto relative">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00e59b]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#3b82f6]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto flex flex-col demo-fadeIn relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
          <div>
            <h1 className="font-montserrat text-3xl md:text-[40px] leading-tight font-light text-white tracking-wide">
              Enterprise Policy Architecture <span className="text-white/30 text-2xl ml-2 font-mono align-middle">v6.0</span>
            </h1>
            <p className="text-white/50 mt-3 tracking-widest text-[11px] font-bold uppercase">
              HHA Framework &bull; Regulatory Alignment
            </p>
          </div>
          <div className="flex flex-col lg:flex-row gap-3 items-end lg:items-center">
            <div className="flex gap-2 bg-white/5 p-1.5 rounded-full border border-white/10">
              <button onClick={() => setActiveTab('hierarchy')}
                className={`px-5 py-2 rounded-full font-montserrat text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${activeTab === 'hierarchy' ? 'bg-white/15 text-white shadow-lg border border-white/10' : 'text-white/40 hover:text-white border border-transparent'}`}>
                System Hierarchy
              </button>
              <button onClick={() => setActiveTab('lifecycle')}
                className={`px-5 py-2 rounded-full font-montserrat text-[10px] font-bold tracking-[0.2em] uppercase transition-all ${activeTab === 'lifecycle' ? 'bg-white/15 text-white shadow-lg border border-white/10' : 'text-white/40 hover:text-white border border-transparent'}`}>
                Governance Lifecycle
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={onViewPolicies}
                className="demo-glass-card hover:bg-[#00e59b]/10 hover:border-[#00e59b]/40 px-6 py-3 rounded-full font-bold text-[10px] tracking-[0.2em] transition-colors flex items-center gap-2 text-[#00e59b] uppercase group">
                <Play size={14} className="group-hover:scale-110 transition-transform" /> VIEW POLICIES
              </button>
              <button
                className="demo-glass-card hover:bg-[#6366f1]/10 hover:border-[#6366f1]/40 px-6 py-3 rounded-full font-bold text-[10px] tracking-[0.2em] transition-colors flex items-center gap-2 text-[#6366f1] uppercase group">
                <FileText size={14} className="group-hover:scale-110 transition-transform" /> VIEW FORMS
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col text-left p-5 rounded-2xl demo-glass-card h-[130px] group relative overflow-hidden">
                <div className="flex justify-between items-start mb-auto">
                  <div>
                    <span className="text-[9px] font-bold font-montserrat tracking-[0.2em] text-white/40 uppercase block mb-1">{stat.label}</span>
                    <span className="text-[10px] text-white/30 font-medium uppercase tracking-widest">{stat.sub}</span>
                  </div>
                  <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                    <Icon size={16} style={{ color: stat.color }} className="opacity-80 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="text-3xl font-light font-montserrat mt-3 tracking-tight" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            );
          })}
        </div>

        {activeTab === 'hierarchy' ? (
          <div className="relative flex flex-col items-center demo-fadeIn">
            {/* Layer 0: Regulatory */}
            <div className="w-full max-w-4xl demo-glass-card rounded-3xl p-6 mb-8 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-5">
                <ShieldCheck className="text-[#00e59b]" size={20} />
                <h3 className="font-montserrat font-bold text-[11px] uppercase tracking-[0.2em] text-white">Layer 1: Regulatory Compliance Foundation</h3>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {REGULATORY_ITEMS.map(reg => {
                  const Icon = reg.icon;
                  return (
                    <span key={reg.id} className="demo-glass-card text-white/80 px-3.5 py-1.5 rounded-full text-[9px] font-bold font-montserrat tracking-widest uppercase flex items-center gap-2 hover:text-white">
                      <Icon size={11} style={{ color: reg.color }} /> {reg.shortName}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />

            {/* Layer 1: Domains */}
            <div className="w-full flex flex-col items-center">
              <div className="demo-glass-card text-white px-10 py-5 rounded-2xl flex flex-col items-center relative z-10">
                <span className="text-[#f97316] text-[9px] font-bold tracking-[0.2em] font-montserrat uppercase mb-1">Architecture Level 2</span>
                <div className="text-2xl font-light font-montserrat tracking-wide">10 STRATEGIC DOMAINS</div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 justify-center" style={{ maxWidth: '672px', width: '100%' }}>
                {DOMAINS.map(domain => {
                  const Icon = domain.icon;
                  return (
                    <div key={domain.code} className="demo-glass-card rounded-2xl p-4 text-center flex flex-col items-center group" style={{ width: '100px' }}>
                      <Icon size={22} style={{ color: domain.color }} className="mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                      <span className="font-mono font-bold text-lg mb-0.5" style={{ color: domain.color }}>{domain.code}</span>
                      <span className="text-[7px] text-white/50 font-bold uppercase tracking-[0.1em] px-1 line-clamp-1">{domain.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent mt-6" />

            {/* Layer 2: Subdomains */}
            <div className="w-full flex flex-col items-center mt-2">
              <div className="demo-glass-card text-white px-10 py-5 rounded-2xl flex flex-col items-center relative z-10 mb-6">
                <span className="text-[#eab308] text-[9px] font-bold tracking-[0.2em] font-montserrat uppercase mb-1">Architecture Level 3</span>
                <div className="text-2xl font-light font-montserrat tracking-wide">{allSubdomains.length} PILLAR SUBDOMAINS</div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-4xl mb-8">
                {allSubdomains.map((sub, i) => (
                  <span key={i} className="demo-glass-card px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold text-white/60 hover:text-white transition-colors" title={sub.name}>
                    {sub.code}
                  </span>
                ))}
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl demo-glass-card rounded-[28px] p-8 group">
                <div className="flex gap-4 items-start">
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-[#eab308] shrink-0"><Users size={18} /></div>
                  <div>
                    <h4 className="text-[10px] font-bold text-white uppercase font-montserrat tracking-[0.2em] mb-2">Stewardship</h4>
                    <p className="text-[12px] text-white/50 leading-relaxed">Named owners (DON, CFO, HR Director) assigned at subdomain level.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start md:border-x border-white/10 md:px-6">
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-[#eab308] shrink-0"><Lock size={18} /></div>
                  <div>
                    <h4 className="text-[10px] font-bold text-white uppercase font-montserrat tracking-[0.2em] mb-2">Access Tiers</h4>
                    <p className="text-[12px] text-white/50 leading-relaxed">Tiers 1-4 visibility logic inherited from subdomain parent.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start md:pl-2">
                  <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-[#eab308] shrink-0"><RefreshCw size={18} /></div>
                  <div>
                    <h4 className="text-[10px] font-bold text-white uppercase font-montserrat tracking-[0.2em] mb-2">Review Cycle</h4>
                    <p className="text-[12px] text-white/50 leading-relaxed">Annual/Biennial frequency determined by risk profile.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent mt-6" />

            {/* Layer 4: Policies */}
            <div className="w-full flex flex-col items-center mb-8 mt-2">
              <div className="demo-glass-card text-white px-10 py-5 rounded-2xl flex flex-col items-center relative z-10">
                <span className="text-[#3b82f6] text-[9px] font-bold tracking-[0.2em] font-montserrat uppercase mb-1">Architecture Level 4</span>
                <div className="text-2xl font-light font-montserrat tracking-wide">269 MANAGED POLICIES</div>
              </div>
            </div>

            <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />

            {/* Layer 5: Forms */}
            <div className="w-full flex flex-col items-center mb-16 mt-2">
              <div className="demo-glass-card text-white px-10 py-5 rounded-2xl flex flex-col items-center relative z-10 mb-6">
                <span className="text-[#ec4899] text-[9px] font-bold tracking-[0.2em] font-montserrat uppercase mb-1">Architecture Level 5</span>
                <div className="text-2xl font-light font-montserrat tracking-wide">FORMS &amp; APPENDICES</div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center" style={{ maxWidth: '680px' }}>
                {['Membership Roster (Appx A)', 'Conflict of Interest (Appx B)', 'Policy Acknowledgment (Appx C)', 'Meeting Minutes Template (Appx D)', 'Quarterly Oversight Checklist (Appx E)', 'Annual Governance Calendar (Appx F)', 'Agency Org Chart (Appx G)'].map((form, i) => (
                  <span key={i} className="demo-glass-card px-3.5 py-1.5 rounded-full text-[9px] font-bold font-montserrat tracking-widest uppercase text-white/60 hover:text-white transition-colors flex items-center gap-2 cursor-pointer">
                    <FileText size={10} className="text-[#ec4899]" /> {form}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Lifecycle Tab */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 demo-fadeIn">
            <div className="demo-glass-card p-10 rounded-[28px] relative group">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/5 text-[#00e59b] border border-white/10 rounded-xl"><RefreshCw size={22} /></div>
                <h3 className="text-[24px] font-light font-montserrat text-white tracking-wide">Governance Lifecycle</h3>
              </div>
              <div className="space-y-8 relative mt-4">
                <div className="absolute left-[11px] top-6 bottom-6 w-px bg-white/10" />
                {[
                  { state: 'DRAFT', desc: 'Policy initial creation and stakeholder development.', color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
                  { state: 'ACTIVE', desc: 'Policy is published, in force, and operationally enforced.', color: '#00e59b', bg: 'rgba(0,229,155,0.12)', border: 'rgba(0,229,155,0.3)' },
                  { state: 'UNDER REVIEW', desc: 'Active policy currently under scheduled or triggered revision.', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
                  { state: 'DEPRECATED', desc: 'Policy has been retired or superseded by new taxonomy.', color: '#9ca3af', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)' },
                ].map((item, idx) => (
                  <div key={idx} className="relative pl-14">
                    <div className="absolute left-[-2px] w-7 h-7 rounded-full border-[6px] border-black/60 shadow-sm top-0 z-10" style={{ backgroundColor: item.color }} />
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-2 rounded-full font-bold uppercase tracking-widest px-3 py-1 text-[9px]" style={{ background: item.bg, border: `1px solid ${item.border}`, color: item.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                        {item.state}
                      </span>
                    </div>
                    <p className="text-[13px] text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="demo-glass-card text-white p-10 rounded-[28px] relative overflow-hidden flex flex-col group">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03]"><ShieldCheck size={200} /></div>
              <h3 className="text-[24px] font-light font-montserrat mb-8 flex items-center gap-4 text-white tracking-wide">
                <Settings className="text-[#00e59b]" size={24} /> Metadata Validation
              </h3>
              <div className="space-y-4 flex-1 relative z-10">
                {['Every artifact must have Owner, Status, and Description', 'Namespace coding follows [XX]-[XX]-[NNN] format', 'Regulatory cross-reference mapping (42 CFR Part 484)', 'Role-based Access Visibility (Tiers 1-4)', 'Defined Review Cycle Management (Annual/Biennial)'].map((check, i) => (
                  <div key={i} className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <CheckCircle2 className="text-[#00e59b] shrink-0 mt-0.5" size={18} />
                    <span className="text-[13px] font-medium text-white/70 leading-relaxed">{check}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-8 border-t border-white/5 relative z-10">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] font-montserrat">Alignment Score</span>
                  <span className="text-3xl font-light font-mono text-[#00e59b] leading-none">100%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div className="w-full h-full bg-[#00e59b] rounded-full shadow-[0_0_15px_rgba(0,229,155,0.6)]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// GLASS TABLE COMPONENT
// ══════════════════════════════════════════════════════════════

function GlassTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar mt-4 mb-6 border border-white/10 rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/[0.03] border-b border-white/10">
            {headers.map((h, i) => (
              <th key={i} className="py-3 px-4 font-montserrat font-bold text-[10px] tracking-wider text-white/50 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-[#c0d6cf]">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="py-3 px-4 text-[12px] align-top leading-relaxed whitespace-pre-line break-words">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STEP 3 — FULL POLICY DETAIL VIEW (in-app page, NOT modal)
// ══════════════════════════════════════════════════════════════

function DemoPolicyDetailView({ policy, onBack }: { policy: DemoPolicy; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  const isSpecimen = policy.policyId === 'GV-GB-001';
  const navTabs = [
    { id: 'overview',       label: 'Overview & Definitions', icon: Target,       optional: false },
    { id: 'statements',     label: 'Policy Statements',      icon: List,         optional: false },
    { id: 'procedures',     label: 'Procedures',             icon: Settings,     optional: false },
    { id: 'documentation',  label: 'Documentation',          icon: FileText,     optional: false },
    { id: 'compliance',     label: 'Compliance & Audit',     icon: CheckSquare,  optional: false },
    { id: 'references',     label: 'References & Admin',     icon: Archive,      optional: false },
    { id: 'appendices',     label: 'Appendices (Forms)',     icon: LayoutList,   optional: false },
    ...(isSpecimen && GV_GB001_ALERTS.length     > 0 ? [{ id: 'alerts',     label: 'Policy Alerts',  icon: Bell,         optional: true }] : []),
    ...(isSpecimen && GV_GB001_FAQ.length        > 0 ? [{ id: 'faq',        label: 'FAQ',            icon: HelpCircle,   optional: true }] : []),
    ...(isSpecimen && GV_GB001_AMENDMENTS.length > 0 ? [{ id: 'amendments', label: 'Amendment Log',  icon: Clock,        optional: true }] : []),
  ];

  const domain = DOMAINS.find(d => d.code === policy.domainCode);
  const domainColor = domain?.color || '#00e59b';

  return (
    <div className="demo-view-enter text-white flex flex-col h-full">
      {/* Fixed header area */}
      <div className="shrink-0 p-6 md:p-8 pb-0">
        {/* Top nav */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-[#00e59b] font-montserrat text-[11px] font-bold tracking-[0.2em] flex items-center gap-2 hover:opacity-80 uppercase transition-opacity">
            <ChevronLeft size={16} /> BACK TO LIBRARY
          </button>
          <button className="border border-white/20 hover:bg-white/5 px-5 py-2.5 rounded-full font-bold text-[10px] tracking-[0.2em] transition-colors flex items-center gap-2 text-white uppercase">
            <Printer size={14} /> EXPORT
          </button>
        </div>

        {/* Policy badges */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <span className="border bg-transparent px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase" style={{ borderColor: `${domainColor}60`, color: domainColor }}>{policy.policyId}</span>
          <span className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase" style={{ backgroundColor: '#00e59b20', color: '#00e59b' }}>{policy.status.replace('_', ' ')}</span>
          <span className="border border-white/10 bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-bold text-white/80 tracking-widest uppercase">{policy.classificationTier}</span>
        </div>

        {/* Title */}
        <h1 className="font-montserrat text-3xl md:text-[36px] leading-tight font-light text-white mb-8 tracking-wide">{policy.title}</h1>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 border-b border-white/10 pb-6">
          <div><span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold block mb-1">Domain</span><span className="text-[12px] text-white/90 font-light">{policy.domain}</span></div>
          <div><span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold block mb-1">Tier</span><span className="text-[12px] text-white/90 font-light">{policy.classificationTier}</span></div>
          <div><span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold block mb-1">Approved By</span><span className="text-[12px] text-white/90 font-light">{policy.approvedBy}</span></div>
          <div><span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold block mb-1">Version</span><span className="text-[12px] text-white/90 font-light">v{policy.version}</span></div>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto scrollbar-none border-b border-white/10">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-4 font-montserrat text-[10px] font-bold tracking-[0.15em] uppercase whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'text-[#00e59b] border-b-2 border-[#00e59b]' : 'text-white/40 hover:text-white/80 border-b-2 border-transparent'}`}>
                <Icon size={13} /> {tab.label}
                {tab.optional && <span className="w-1.5 h-1.5 rounded-full bg-[#e85200] shrink-0" title="Optional section" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 md:px-8 pb-8">
        {activeTab === 'overview'       && <TabOverview policy={policy} />}
        {activeTab === 'statements'      && <TabStatements policy={policy} />}
        {activeTab === 'procedures'      && <TabProcedures policy={policy} />}
        {activeTab === 'documentation'   && <TabDocumentation policy={policy} />}
        {activeTab === 'compliance'      && <TabCompliance policy={policy} />}
        {activeTab === 'references'      && <TabReferences policy={policy} />}
        {activeTab === 'appendices'      && <TabAppendices policy={policy} />}
        {activeTab === 'alerts'          && <TabAlerts policy={policy} />}
        {activeTab === 'faq'             && <TabFAQ policy={policy} />}
        {activeTab === 'amendments'      && <TabAmendments policy={policy} />}
      </div>
    </div>
  );
}

const GV_GB001_PURPOSE = 'This policy establishes the authority, composition, functions, and oversight responsibilities of the Governing Body of Care Indeed Home Health Care, Inc. The Governing Body is the ultimate authority accountable for the operation, management, fiscal viability, and regulatory compliance of the home health agency. This policy ensures the agency satisfies the requirements set forth in 42 CFR § 484.105 — Condition of Participation: Organization and Administration of Services, which mandates that a home health agency must have a governing body that assumes full legal authority and responsibility for the agency\'s overall operation and management.';
const GV_GB001_SCOPE = [
  'All members of the Governing Body of Care Indeed Home Health Care, Inc. (including voting and non-voting members)',
  'The Agency Administrator',
  'The Director of Nursing / Clinical Manager',
  'The Compliance Officer',
  'All senior leadership personnel who report directly to the Governing Body or Administrator',
  'All contracted management entities performing governing body functions on behalf of the agency',
];

function TabOverview({ policy }: { policy: DemoPolicy }) {
  const isSpecimen = policy.policyId === 'GV-GB-001';
  const purposeText = isSpecimen ? GV_GB001_PURPOSE : policy.purpose;
  const scopeItems = isSpecimen ? GV_GB001_SCOPE : policy.scope;
  const defs = isSpecimen ? GV_DEFINITIONS : [
    { term: 'Classification Tier', definition: 'The policy priority level within the enterprise taxonomy: REQUIRED, ESSENTIAL, OPERATIONAL, or REFERENCE.' },
    { term: 'Policy Owner', definition: 'The designated individual or role responsible for maintaining, reviewing, and approving this policy artifact.' },
    { term: 'Lifecycle Status', definition: 'The current state of the policy in the governance lifecycle: DRAFT, ACTIVE, UNDER REVIEW, or DEPRECATED.' },
    { term: 'Review Cycle', definition: 'The scheduled frequency (annual or biennial) at which this policy must be formally reviewed for continued relevance and compliance.' },
    { term: 'Access Tier', definition: 'The visibility classification (Tiers 1–4) that determines which roles can view or edit this policy.' },
    { term: 'Regulatory Cross-Reference', definition: 'The specific federal, state, or accreditation standards to which this policy maps for compliance traceability.' },
  ];

  return (
    <div className="demo-view-enter mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="border-l-[3px] border-[#00e59b] pl-6">
          <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center mb-4 tracking-widest uppercase">
            <Target className="text-[#00e59b] mr-3" size={18} /> 2. Purpose
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">{purposeText}</p>
        </div>
        <div className="border-l-[3px] border-[#e85200] pl-6">
          <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center mb-4 tracking-widest uppercase">
            <Search className="text-[#e85200] mr-3" size={18} /> 3. Scope
          </h2>
          <ul className="space-y-3">
            {scopeItems.map((item, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle className="text-[#e85200] mr-3 mt-0.5 flex-shrink-0" size={14} />
                <span className="text-white/70 text-sm">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 p-4 bg-[#e85200]/10 border border-[#e85200]/20 text-[#e85200] rounded-xl text-xs font-medium leading-relaxed">
            {isSpecimen
              ? 'This policy does not apply to day-to-day clinical or operational staff except to the extent that Governing Body decisions establish requirements, standards, or directives that govern their work.'
              : 'This policy does not apply to day-to-day clinical or operational staff except to the extent that decisions establish requirements, standards, or directives that govern their work.'}
          </div>
        </div>
      </div>

      {/* Definitions */}
      <div className="mt-12 border-l-[3px] border-blue-400 pl-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center mb-5 tracking-widest uppercase">
          <BookOpen className="text-blue-400 mr-3" size={18} /> 5. Definitions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {defs.map((def, i) => (
            <div key={i} className="glass-card p-4 rounded-xl">
              <h4 className="font-montserrat font-bold text-blue-400 text-[12px] mb-2">{def.term}</h4>
              <p className="text-white/60 text-[11px] leading-relaxed">{def.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory Tags */}
      {policy.regulatoryTags.length > 0 && (
        <div className="mt-10 pt-8 border-t border-white/10">
          <h3 className="font-montserrat text-[12px] font-bold text-white uppercase tracking-[0.2em] mb-4">Regulatory Cross-References</h3>
          <div className="flex flex-wrap gap-2">
            {policy.regulatoryTags.map(tag => {
              const reg = REGULATORY_ITEMS.find(r => r.id === tag);
              if (!reg) return null;
              const Icon = reg.icon;
              return (
                <span key={tag} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-widest uppercase"
                  style={{ borderColor: `${reg.color}40`, background: `${reg.color}10`, color: reg.color }}>
                  <Icon size={12} /> {reg.shortName}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TabStatements({ policy }: { policy: DemoPolicy }) {
  const isSpecimen = policy.policyId === 'GV-GB-001';
  const stmts = isSpecimen ? GV_STATEMENTS : [
    `${policy.policyId} establishes the authority, composition, functions, and oversight responsibilities governing this domain within Care Indeed Home Health Care, Inc.`,
    'The organization shall maintain full legal authority and responsibility for overall operation, management, and regulatory compliance as required by applicable federal and state regulations.',
    'All personnel within scope shall comply with this policy. Non-compliance may result in corrective action up to and including termination.',
    'This policy shall be reviewed on the established review cycle and revised as needed to maintain compliance with applicable regulatory changes.',
    'Only the most current approved version of this policy shall be considered valid. Superseded versions must not be used for any operational or compliance purpose.',
  ];
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <List className="text-[#00e59b] mr-3" size={18} /> 4. Policy Statement
        </h2>
      </div>
      <div className="space-y-3 pl-6">
        {stmts.map((stmt, i) => (
          <div key={i} className="flex items-start glass-card p-4 rounded-xl">
            <div className="text-[#00e59b] font-bold font-montserrat flex-shrink-0 mr-4 w-8 text-[12px]">4.{i+1}</div>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{stmt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabProcedures({ policy }: { policy: DemoPolicy }) {
  const [activeSub, setActiveSub] = useState('6.1');
  const isSpecimen = policy.policyId === 'GV-GB-001';
  const subTabs = [
    { id: '6.1', label: '6.1 Establishment' },
    { id: '6.2', label: '6.2 Core Responsibilities' },
    { id: '6.3', label: '6.3 Meetings' },
    { id: '6.4', label: '6.4 Conflict of Interest' },
    { id: '6.5', label: '6.5 Escalation' },
  ];

  if (!isSpecimen) {
    return (
      <div className="demo-view-enter mt-8">
        <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
          <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
            <Settings className="text-[#00e59b] mr-3" size={18} /> 6. Procedures
          </h2>
        </div>
        <div className="pl-6">
          <div className="bg-[#e85200]/10 border border-[#e85200]/20 text-[#e85200] p-4 rounded-xl text-sm flex items-start mb-6">
            <AlertTriangle className="mr-3 flex-shrink-0 mt-0.5" size={16} />
            <p>Responsible parties shall fulfill the following procedures directly and shall <strong className="text-orange-300">not delegate ultimate accountability</strong> for any of these functions.</p>
          </div>
          <GlassTable
            headers={['Step', 'Responsible Party', 'Action', 'Timeframe']}
            rows={[
              ['6.1.1', 'Policy Owner', `Maintain and review ${policy.policyId} per the established review cycle. Ensure all content reflects current regulatory requirements.`, 'As per review cycle.'],
              ['6.1.2', 'Compliance Officer', 'Verify regulatory cross-references are current and accurate. Update mappings when regulatory changes occur.', 'Within 30 days of regulatory change.'],
              ['6.1.3', 'Administrator', 'Ensure all personnel within scope have acknowledged this policy and completed required training.', 'Within 14 calendar days of effective date.'],
              ['6.1.4', 'QA Designee', 'Monitor compliance indicators and report deviations through the QAPI program.', 'Quarterly.'],
              ['6.1.5', 'All Staff in Scope', 'Comply with all requirements of this policy. Report any observed non-compliance through established channels.', 'Continuous.'],
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="demo-view-enter mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-l-[3px] border-[#00e59b] pl-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <Settings className="text-[#00e59b] mr-3" size={18} /> 6. Procedures
        </h2>
        <div className="flex gap-2 flex-wrap mt-3 md:mt-0">
          {subTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveSub(tab.id)}
              className={`px-3 py-1.5 rounded-full font-montserrat font-bold text-[10px] uppercase tracking-wider transition-colors ${activeSub === tab.id ? 'bg-[#00e59b]/20 text-[#00e59b] border border-[#00e59b]/50' : 'text-white/50 border border-transparent hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSub === '6.1' && (
        <div>
          <h3 className="font-montserrat font-bold text-sm text-white mb-4 pl-6">6.1 Establishment and Composition</h3>
          <GlassTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={GV_PROC_61} />
        </div>
      )}
      {activeSub === '6.2' && (
        <div className="space-y-10">
          <div className="bg-[#e85200]/10 border border-[#e85200]/20 text-[#e85200] p-4 rounded-xl text-sm flex items-start">
            <AlertTriangle className="mr-3 flex-shrink-0 mt-0.5" size={16} />
            <p>The Governing Body of Care Indeed Home Health Care, Inc. shall fulfill the following responsibilities directly and shall <strong className="text-orange-300">not delegate ultimate accountability</strong> for any of these functions.</p>
          </div>
          {GV_PROC_62.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-montserrat font-bold text-sm text-[#00e59b] mb-3">{section.title}</h3>
              <GlassTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={section.rows} />
            </div>
          ))}
        </div>
      )}
      {activeSub === '6.3' && (
        <div>
          <h3 className="font-montserrat font-bold text-sm text-white mb-4 pl-6">6.3 Governing Body Meetings</h3>
          <GlassTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={GV_PROC_63} />
        </div>
      )}
      {activeSub === '6.4' && (
        <div>
          <h3 className="font-montserrat font-bold text-sm text-white mb-4 pl-6">6.4 Conflict of Interest Management</h3>
          <GlassTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={GV_PROC_64} />
        </div>
      )}
      {activeSub === '6.5' && (
        <div>
          <h3 className="font-montserrat font-bold text-sm text-[#e85200] mb-4 pl-6 flex items-center">
            <AlertTriangle className="mr-2" size={16} /> 6.5 Escalation and Exception Handling
          </h3>
          <GlassTable headers={['Condition', 'Escalation Path', 'Corrective Action', 'Timeframe']} rows={GV_PROC_65} />
        </div>
      )}
    </div>
  );
}

function TabDocumentation({ policy }: { policy: DemoPolicy }) {
  const isSpecimen = policy.policyId === 'GV-GB-001';
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <FileText className="text-[#00e59b] mr-3" size={18} /> 7. Documentation Requirements
        </h2>
      </div>
      <GlassTable
        headers={['Requirement', 'Document / Record', 'Responsible Party', 'Location', 'Timeframe']}
        rows={isSpecimen ? GV_DOCS_REQ : [
          ['Policy acknowledgment', 'Signed acknowledgment by all personnel within scope.', 'Administrator (collection)', 'Policy acknowledgment file', 'Within 14 calendar days of effective date.'],
          ['Version control record', 'Version history reflecting all substantive and non-substantive revisions.', 'Policy Owner', 'Policy management system', 'Updated with each revision.'],
          ['Regulatory cross-reference map', 'Current mapping of policy to applicable regulations.', 'Compliance Officer', 'Compliance records', 'Maintained continuously; verified quarterly.'],
          ['Training completion records', 'Documentation of required training for all in-scope personnel.', 'HR / Training Coordinator', 'Personnel files', 'Within 14 calendar days of policy effective date.'],
          ['Compliance audit results', 'Results of internal audits measuring compliance with this policy.', 'QA Designee', 'QAPI records', 'Quarterly; retained for minimum 7 years.'],
        ]}
      />
    </div>
  );
}

function TabCompliance({ policy }: { policy: DemoPolicy }) {
  const isSpecimen = policy.policyId === 'GV-GB-001';
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <CheckSquare className="text-[#00e59b] mr-3" size={18} /> 8. Compliance & Audit
        </h2>
      </div>
      <h3 className="font-montserrat text-[12px] font-bold text-white mb-4 uppercase tracking-widest">8.1 How Compliance Is Measured</h3>
      <GlassTable
        headers={['Compliance Indicator', 'Measurement Method', 'Acceptable Standard']}
        rows={isSpecimen ? GV_COMPLIANCE_81 : [
          ['Policy is current and approved.', 'Review of version control record and approval documentation.', 'Current version on file at all times.'],
          ['All personnel acknowledged.', 'Review of signed acknowledgment forms.', '100% acknowledgment within 14 calendar days.'],
          ['Regulatory mappings are current.', 'Review of cross-reference documentation.', 'Updated within 30 days of any regulatory change.'],
          ['Compliance monitoring active.', 'Review of QAPI reports and audit logs.', 'Quarterly monitoring with documented results.'],
        ]}
      />

      {isSpecimen && (
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h3 className="font-montserrat text-[12px] font-bold text-white mb-4 uppercase tracking-widest flex items-center">
              <Search className="text-white/50 mr-2" size={14} /> 8.2 Surveyor Expectations
            </h3>
            <p className="text-[11px] text-white/50 mb-4">CMS surveyors conducting a standard survey under SOM Appendix B will specifically verify:</p>
            <ul className="space-y-3">
              {GV_COMPLIANCE_82.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="text-[#00e59b] mt-0.5 shrink-0" size={14} />
                  <span className="text-[12px] text-white/70 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-montserrat text-[12px] font-bold text-[#e85200] mb-4 uppercase tracking-widest flex items-center">
              <AlertTriangle className="mr-2" size={14} /> 8.3 Common Failure Points
            </h3>
            <div className="space-y-3">
              {GV_COMPLIANCE_83.map((item, i) => (
                <div key={i} className="border border-red-500/20 p-4 rounded-xl bg-red-500/5">
                  <p className="font-bold text-red-400 text-[12px] mb-1">{item[0]}</p>
                  <p className="text-[11px] text-red-300/80 mb-1"><strong>Risk:</strong> {item[1]}</p>
                  <p className="text-[11px] text-white/70"><strong>Mitigation:</strong> {item[2]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isSpecimen && (
        <>
          <h3 className="font-montserrat text-[12px] font-bold text-[#e85200] mt-10 mb-4 uppercase tracking-widest flex items-center">
            <AlertTriangle className="mr-2" size={16} /> 8.2 Common Failure Points
          </h3>
          <div className="space-y-3">
            {[
              { finding: 'Policy has not been reviewed within required cycle.', risk: 'Surveyor may cite outdated policy as non-compliance.', mitigation: 'Set calendar reminders and track review dates in enterprise system.' },
              { finding: 'Staff acknowledgments are incomplete or missing.', risk: 'Surveyor will cite failure to ensure staff awareness.', mitigation: 'Automated tracking with escalation for non-compliance within 7 days of deadline.' },
              { finding: 'Regulatory cross-references are outdated.', risk: 'Policy may not reflect current regulatory requirements.', mitigation: 'Compliance Officer monitors regulatory changes and updates mappings proactively.' },
            ].map((item, i) => (
              <div key={i} className="border border-red-500/20 p-4 rounded-xl bg-red-500/5">
                <p className="font-bold text-red-400 text-[12px] mb-1">{item.finding}</p>
                <p className="text-[11px] text-red-300/80 mb-1"><strong>Risk:</strong> {item.risk}</p>
                <p className="text-[11px] text-white/70"><strong>Mitigation:</strong> {item.mitigation}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TabReferences({ policy }: { policy: DemoPolicy }) {
  const isSpecimen = policy.policyId === 'GV-GB-001';
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <Archive className="text-[#00e59b] mr-3" size={18} /> 9. References & Administration
        </h2>
      </div>
      <div className="pl-6">
        <h3 className="font-montserrat text-[12px] font-bold text-white/50 uppercase tracking-widest mb-3">9.1 Federal Regulatory References</h3>
        <GlassTable
          headers={['Citation', 'Title', 'Applicability']}
          rows={isSpecimen ? GV_FEDERAL_REFS : [
            ['42 CFR § 484.105', 'Organization and Administration of Services', 'Primary regulatory basis for governance policies.'],
            ['42 CFR § 484.65', 'QAPI', 'Quality assessment and performance improvement requirements.'],
            ['42 CFR § 484.100', 'Compliance with Laws', 'Federal, state, and local law compliance.'],
            ['42 CFR § 484.102', 'Emergency Preparedness', 'Emergency plan approval and oversight.'],
          ]}
        />

        {isSpecimen && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5 rounded-xl border border-white/10">
              <h3 className="font-montserrat text-[11px] font-bold text-[#00e59b] uppercase tracking-widest mb-3">CMS Survey &amp; Certification Guidance</h3>
              <ul className="space-y-2">
                {[
                  'SOM Appendix B — Home Health Agency Survey Protocol',
                  'CMS Interpretive Guidelines for 42 CFR Part 484',
                  'State Operations Manual (SOM) Chapter 2 — The Certification Process',
                  'CMS Quality Assurance & Performance Improvement Framework',
                  'CMS CoP Interpretive Guidelines — Governing Body Requirements',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="text-[#00e59b] mt-0.5 shrink-0" size={13} />
                    <span className="text-[11px] text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-5 rounded-xl border border-white/10">
              <h3 className="font-montserrat text-[11px] font-bold text-[#00e59b] uppercase tracking-widest mb-3">OIG Compliance Guidance</h3>
              <ul className="space-y-2">
                {[
                  'OIG Compliance Program Guidance for Home Health Agencies (1998)',
                  'OIG Work Plan — Annual Home Health Agency Audit Items',
                  'False Claims Act (31 U.S.C. §§ 3729–3733)',
                  'Anti-Kickback Statute (42 U.S.C. § 1320a-7b(b))',
                  'HHS-OIG Advisory Opinion Framework for HHA Compliance',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="text-[#00e59b] mt-0.5 shrink-0" size={13} />
                    <span className="text-[11px] text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <h3 className="font-montserrat text-[12px] font-bold text-white/50 mt-10 uppercase tracking-widest mb-3">9.2 Cross-Referenced Policies</h3>
        {isSpecimen ? (
          <GlassTable
            headers={['Policy ID', 'Policy Title', 'Cross-Reference Type']}
            rows={GV_CROSS_REFS}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'GV-PM-001', title: 'Policy Development & Approval Process' },
              { id: 'GV-PM-002', title: 'Policy Review & Revision Cycle' },
              { id: 'EN-TG-001', title: 'Enterprise Policy Taxonomy & Classification' },
              { id: 'EN-LC-001', title: 'Policy Lifecycle Management & Version Control' },
              { id: 'CO-CP-001', title: 'Corporate Compliance Program' },
              { id: 'QA-PG-001', title: 'QAPI Program Establishment & Governance' },
            ].map((ref, i) => (
              <div key={i} className="glass-card p-3 rounded-xl flex items-center gap-3">
                <span className="text-[#00e59b] font-mono font-bold text-[11px]">{ref.id}</span>
                <span className="text-white/70 text-[11px]">{ref.title}</span>
              </div>
            ))}
          </div>
        )}

        {isSpecimen && (
          <>
            {/* Section 10 — Training */}
            <div className="mt-12 border-l-[3px] border-[#00e59b] pl-6 mb-6">
              <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
                <BookOpen className="text-[#00e59b] mr-3" size={18} /> 10. Training & Education Requirements
              </h2>
            </div>
            <div className="pl-6">
              <GlassTable
                headers={['Role / Audience', 'Training Content', 'Frequency', 'Delivery Method']}
                rows={[
                  ['All Staff', 'Policy awareness: purpose, scope, and obligations', 'Upon hire; annually', 'LMS module + attestation'],
                  ['Governing Body Members', 'Board governance obligations, CMS CoP oversight, liability exposure', 'Upon appointment; triennially', 'In-person session + written brief'],
                  ['Administrators / Executives', 'Governing body structure, delegation of authority, compliance accountability', 'Annually', 'Leadership retreat + competency assessment'],
                  ['Compliance Officer', 'Regulatory updates (42 CFR Part 484), survey preparation, OIG guidance', 'Quarterly (regulatory); annually (full review)', 'External seminars + internal review sessions'],
                  ['Clinical Supervisors', 'Clinical governance, care standard oversight, policy enforcement obligations', 'Annually', 'Interdisciplinary training + competency check'],
                  ['HIM / Medical Records', 'Documentation standards for governing body decisions and minutes', 'Upon assignment; annually', 'Department training + audit review'],
                  ['QA/PI Coordinator', 'QAPI governance integration, data reporting to governing body', 'Semi-annually', 'QAPI workshop + peer review'],
                  ['Department Managers', 'Operational policy implementation, staff education responsibilities', 'Annually', 'Supervisory training program + attestation'],
                ]}
              />
            </div>

            {/* Section 11 — Version Control */}
            <div className="mt-12 border-l-[3px] border-[#00e59b] pl-6 mb-6">
              <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
                <GitBranch className="text-[#00e59b] mr-3" size={18} /> 11. Version Control & Revision History
              </h2>
            </div>
            <div className="pl-6">
              <GlassTable
                headers={['Version', 'Effective Date', 'Approved By', 'Summary of Changes']}
                rows={[
                  ['1.0', 'January 1, 2018', 'Board of Directors', 'Initial policy adoption — established governing body structure per 42 CFR § 484.105.'],
                  ['2.0', 'March 15, 2020', 'Board of Directors', 'Major revision — added QAPI oversight integration, Administrator delegation protocol, and emergency authority provisions.'],
                  ['2.1', 'September 1, 2021', 'Compliance Officer', 'Minor revision — updated CMS cross-reference citations; clarified committee quorum requirements.'],
                  ['3.0', 'January 1, 2023', 'Board of Directors', 'Comprehensive update — incorporated OIG compliance guidance, expanded training section, added digital governance provisions.'],
                  ['3.1', 'July 1, 2023', 'Compliance Officer', 'Administrative update — corrected regulatory citation formatting; updated policy owner title.'],
                  ['4.0', 'January 1, 2025', 'Board of Directors', 'Full triennial review — no substantive regulatory changes required; adopted enterprise policy management system integration.'],
                ]}
              />
            </div>
          </>
        )}

        {/* Document Metadata — all policies */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <h3 className="font-montserrat text-[12px] font-bold text-white uppercase tracking-[0.2em] mb-4">Document Metadata</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ['Effective Date', policy.effectiveDate],
              ['Next Review', policy.nextReviewDate],
              ['Policy Owner', policy.policyOwner],
              ['Subdomain', policy.subdomain],
              ['Domain Code', policy.domainCode],
              ['Status', policy.status],
            ].map(([label, val]) => (
              <div key={label} className="glass-card rounded-xl p-3">
                <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-1">{label}</span>
                <span className="text-[12px] text-white/80">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GV-GB-001 OPTIONAL SECTION DATA ────────────────────────────────────────
const GV_GB001_ALERTS: Array<{ level: 'critical' | 'warning' | 'info'; title: string; body: string; date: string; source?: string }> = [
  { level: 'critical', title: 'CMS Proposed Rule — HHA Governing Body Requirements', body: 'CMS has published a proposed rule (CMS-1802-P) that would expand documentation requirements for HHA Governing Bodies, including mandatory annual composition reviews and competency attestations. Comment period closes 2026-02-15. Review proposed changes against GV-GB-001 §6.1.', date: '2025-12-01', source: 'Federal Register Vol. 90' },
  { level: 'warning', title: 'California AB 2029 — HHA Board Composition', body: 'AB 2029 pending HCAI implementation guidance would require at least one independent clinical professional on the Governing Body of Medicare-certified HHAs in California. Monitor HCAI bulletins for implementation dates.', date: '2025-10-15', source: 'California HCAI Bulletin' },
  { level: 'info', title: 'OIG Work Plan — Governing Body Oversight Practices', body: 'The OIG FY2026 Work Plan includes a review of Governing Body documentation practices at Medicare-certified HHAs. Ensure GV-GB-001 Appendix A (Roster) and Appendix D (Minutes) are complete and current.', date: '2025-11-01', source: 'OIG Work Plan FY2026' },
];

const GV_GB001_FAQ: Array<{ q: string; a: string }> = [
  { q: 'Can a single individual serve as both the Administrator and a Governing Body voting member?', a: 'Yes — 42 CFR § 484.105(b) permits the Administrator to serve as a Governing Body member. However, the Administrator alone cannot constitute quorum, and any votes on Administrator compensation, performance, or termination must be handled by non-Administrator members. Conflicts of interest must be disclosed per GV-GB-003.' },
  { q: 'What is required if we cannot achieve quorum at a scheduled quarterly meeting?', a: 'The meeting cannot conduct official business. It must be rescheduled within 14 calendar days. The failed quorum attempt must be documented. Emergency matters may be handled via unanimous written consent of all voting members, subject to agency bylaws. See GV-GB-002 §6.3.1.' },
  { q: 'Does every Governing Body member need OIG/SAM exclusion screening?', a: 'Yes. Per 42 CFR § 484.105 and OIG guidance, all individuals with ownership or managerial authority — including all Governing Body members — must be screened against the OIG Exclusion Database and SAM.gov at least monthly. The Compliance Officer manages this. See GV-GB-001 §6.1.4 and HR-TA-003.' },
  { q: 'How many members are required on the Governing Body?', a: 'There is no federal minimum number specified in 42 CFR § 484.105. Agency bylaws define composition and quorum. A practical minimum of 3 voting members is recommended to avoid quorum issues. The Governing Body must include adequate competency to exercise genuine oversight. See §6.1.1–6.1.3.' },
];

const GV_GB001_AMENDMENTS: Array<{ version: string; date: string; author: string; summary: string; sections?: string }> = [
  { version: '6.0', date: '2025-07-10', author: 'Compliance Officer', summary: 'Major comprehensive revision — added §6.2.6 (Emergency Preparedness oversight), expanded §6.4 (Conflict of Interest to 3 sub-sections), restructured all appendices into interactive digital forms (Appendix A–G). Aligned with updated OIG HHA Compliance Program Guidance (Nov 2023) and CMS SOM Appendix B 2024 update.', sections: '§6.1.4, §6.2.6, §6.4, All Appendices A–G' },
  { version: '5.1', date: '2024-11-15', author: 'Governing Body Chair', summary: 'Minor update — clarified quorum requirements in §6.3 to align with revised agency bylaws; added GV-GB-005 (Annual Governance Self-Assessment) as a new cross-reference; updated Section 11 version control table.', sections: '§6.3, §9.4, §11' },
  { version: '5.0', date: '2024-07-01', author: 'Administrator', summary: 'Annual review — no substantive policy changes. Updated effective date, review dates, and regulatory citations to reflect current 42 CFR §484 regulations.', sections: 'Dates and citations only' },
  { version: '4.2', date: '2023-10-12', author: 'Compliance Officer', summary: 'Emergency update — added monthly OIG/SAM exclusion screening requirement for all Governing Body members per updated OIG Compliance Program Guidance for HHAs issued October 2023.', sections: '§6.1.4 (new), §7, Appendix A' },
];

// ─── OPTIONAL TAB FUNCTIONS ───────────────────────────────────────────────────
function TabAlerts({ policy }: { policy: DemoPolicy }) {
  const alerts = policy.policyId === 'GV-GB-001' ? GV_GB001_ALERTS : [];
  const levelConfig = {
    critical: { border: 'border-red-500/40',    bg: 'bg-red-500/10',    badge: 'bg-red-500/20 text-red-300',    dot: 'bg-red-400',    label: 'CRITICAL' },
    warning:  { border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', badge: 'bg-yellow-500/20 text-yellow-300', dot: 'bg-yellow-400', label: 'WARNING'  },
    info:     { border: 'border-blue-400/40',   bg: 'bg-blue-400/10',   badge: 'bg-blue-400/20 text-blue-300',   dot: 'bg-blue-400',   label: 'INFO'     },
  } as const;
  if (!alerts.length) return (
    <div className="demo-view-enter mt-8 flex flex-col items-center justify-center py-20">
      <Bell className="text-white/20 mb-4" size={40} />
      <p className="text-white/40 text-[13px] font-montserrat uppercase tracking-widest">No Active Alerts</p>
      <p className="text-white/30 text-[11px] mt-2">Policy alerts will appear here when issued</p>
    </div>
  );
  return (
    <div className="demo-view-enter mt-8 space-y-4">
      <h3 className="font-montserrat text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase mb-6">POLICY ALERTS — {alerts.length} ACTIVE</h3>
      {alerts.map((alert, i) => {
        const cfg = levelConfig[alert.level];
        return (
          <div key={i} className={`border rounded-xl p-5 ${cfg.border} ${cfg.bg}`}>
            <div className="flex items-start gap-4">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 animate-pulse ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase ${cfg.badge}`}>{cfg.label}</span>
                  <span className="text-white/30 text-[10px]">{alert.date}</span>
                  {alert.source && <span className="text-white/25 text-[10px] italic">{alert.source}</span>}
                </div>
                <p className="text-white font-montserrat text-[13px] font-semibold mb-2">{alert.title}</p>
                <p className="text-white/65 text-[12px] leading-relaxed">{alert.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TabFAQ({ policy }: { policy: DemoPolicy }) {
  const faqs = policy.policyId === 'GV-GB-001' ? GV_GB001_FAQ : [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (!faqs.length) return (
    <div className="demo-view-enter mt-8 flex flex-col items-center justify-center py-20">
      <HelpCircle className="text-white/20 mb-4" size={40} />
      <p className="text-white/40 text-[13px] font-montserrat uppercase tracking-widest">No FAQ Entries</p>
    </div>
  );
  return (
    <div className="demo-view-enter mt-8 space-y-3">
      <h3 className="font-montserrat text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase mb-6">FREQUENTLY ASKED QUESTIONS — {faqs.length} ENTRIES</h3>
      {faqs.map((item, i) => (
        <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
          <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.03] transition-colors">
            <div className="flex items-start gap-3 min-w-0">
              <span className="text-[#00e59b] font-montserrat text-[10px] font-bold tracking-widest shrink-0 mt-0.5">Q{i + 1}</span>
              <span className="text-white/85 text-[13px] leading-snug">{item.q}</span>
            </div>
            <ChevronRight size={14} className={`text-white/30 shrink-0 ml-3 transition-transform ${openIndex === i ? 'rotate-90' : ''}`} />
          </button>
          {openIndex === i && (
            <div className="px-4 pb-4 pt-0 border-t border-white/10 bg-white/[0.02]">
              <div className="flex gap-3 pt-4">
                <span className="text-[#e85200] font-montserrat text-[10px] font-bold tracking-widest shrink-0 mt-0.5">A{i + 1}</span>
                <p className="text-white/70 text-[12px] leading-relaxed">{item.a}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TabAmendments({ policy }: { policy: DemoPolicy }) {
  const amendments = policy.policyId === 'GV-GB-001' ? GV_GB001_AMENDMENTS : [];
  if (!amendments.length) return (
    <div className="demo-view-enter mt-8 flex flex-col items-center justify-center py-20">
      <Clock className="text-white/20 mb-4" size={40} />
      <p className="text-white/40 text-[13px] font-montserrat uppercase tracking-widest">No Amendment History</p>
    </div>
  );
  return (
    <div className="demo-view-enter mt-8">
      <h3 className="font-montserrat text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase mb-8">AMENDMENT LOG — {amendments.length} ENTRIES</h3>
      <div className="relative">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-white/10" />
        <div className="space-y-6">
          {amendments.map((entry, i) => (
            <div key={i} className={`relative pl-8 ${i > 0 ? 'opacity-70 hover:opacity-90 transition-opacity' : ''}`}>
              <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 ${i === 0 ? 'border-[#00e59b] bg-[#00e59b]' : 'border-white/20 bg-white/5'}`} />
              <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-montserrat text-[11px] font-bold text-white/90">v{entry.version}</span>
                  {i === 0 && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest bg-[#00e59b]/15 text-[#00e59b]">CURRENT</span>}
                  <span className="text-white/35 text-[10px]">{entry.date}</span>
                  <span className="text-white/35 text-[10px]">— {entry.author}</span>
                </div>
                <p className="text-white/70 text-[12px] leading-relaxed mb-2">{entry.summary}</p>
                {entry.sections && <p className="text-white/35 text-[10px]"><span className="text-white/50 font-bold">Sections: </span>{entry.sections}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabAppendices({ policy }: { policy: DemoPolicy }) {
  const isSpecimen = policy.policyId === 'GV-GB-001';
  const [activeApp, setActiveApp] = useState('A');

  const apps = [
    { id: 'A', label: 'Appx A: Roster',      title: 'Governing Body Membership Roster' },
    { id: 'B', label: 'Appx B: Conflicts',   title: 'Conflict of Interest Form' },
    { id: 'C', label: 'Appx C: Acknowledge', title: 'Policy Acknowledgment Form' },
    { id: 'D', label: 'Appx D: Minutes',     title: 'Meeting Minutes Template' },
    { id: 'E', label: 'Appx E: Checklist',   title: 'Quarterly Oversight Checklist' },
    { id: 'F', label: 'Appx F: Calendar',    title: 'Annual Calendar' },
    { id: 'G', label: 'Appx G: Org Chart',   title: 'Agency Organizational Chart' },
  ];

  if (!isSpecimen) {
    return (
      <div className="demo-view-enter mt-8 flex flex-col items-center justify-center py-20">
        <LayoutList className="text-white/20 mb-4" size={48} />
        <p className="text-white/40 text-[13px] font-montserrat uppercase tracking-widest">Appendices Available for Specimen Policy</p>
        <p className="text-white/30 text-[11px] mt-2">Select GV-GB-001 to view Forms &amp; Appendices</p>
      </div>
    );
  }

  const inputCls = 'border-b border-white/20 bg-transparent text-white text-xs focus:outline-none focus:border-[#00e59b] w-full pb-1';
  const selectCls = 'border border-white/20 rounded p-1 w-full bg-transparent text-white text-xs focus:outline-none focus:border-[#00e59b]';
  const dateCls = 'border border-white/10 rounded p-1 w-full bg-transparent text-white text-xs focus:outline-none focus:border-[#00e59b]';
  const taCls = 'w-full border border-white/10 p-3 h-20 rounded-xl bg-transparent text-white/70 text-xs focus:outline-none focus:border-[#00e59b]';
  const thCls = 'p-3 font-montserrat font-bold text-[10px] text-white/50 uppercase tracking-wider border-b border-white/10 text-left';

  return (
    <div className="demo-view-enter mt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-l-[3px] border-[#00e59b] pl-6">
        <div>
          <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
            <LayoutList className="text-[#00e59b] mr-3" size={18} /> Appendices (Forms &amp; Templates)
          </h2>
          <p className="text-[11px] text-white/50 mt-1">GV-GB-001 — Governing Body Authority &amp; Responsibilities · Version 6.0 · 2025-07-10</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors border border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
            <ExternalLink size={13} /> Sign on Dropbox
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors border border-white/20 text-white hover:bg-white/10">
            <Printer size={13} /> Print Form
          </button>
        </div>
      </div>

      {/* ── Appendix Cards — Care Indeed logo cards (large, survey-ready) ── */}
      <div className="grid grid-cols-7 gap-3 mb-8 px-6">
        {apps.map(app => {
          const isActive = activeApp === app.id;
          const subtitle = app.label.replace(/^Appx [A-G]:\s*/, '');
          return (
            <button
              key={app.id}
              onClick={() => setActiveApp(app.id)}
              className={`group relative flex flex-col items-center justify-center rounded-xl px-3 py-4 transition-all duration-300 border ${
                isActive
                  ? 'bg-[#00e59b]/15 border-[#00e59b] shadow-[0_10px_30px_-10px_rgba(0,229,155,0.45)]'
                  : 'bg-white/[0.02] border-white/10 hover:border-[#00e59b]/50 hover:bg-white/[0.05]'
              }`}
              style={{ minHeight: 108 }}
              title={app.title}
            >
              <img
                src={ciLogoWhite}
                alt="Care Indeed"
                className={`w-auto object-contain transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-95'}`}
                style={{ height: 26 }}
              />
              <span className={`mt-2 font-montserrat font-bold text-[10px] uppercase tracking-[0.18em] leading-tight text-center ${isActive ? 'text-[#00e59b]' : 'text-white/70 group-hover:text-white'}`}>
                {subtitle}
              </span>
              <span className={`mt-1 text-[8px] font-bold tracking-[0.3em] ${isActive ? 'text-[#00e59b]/80' : 'text-white/30'}`}>
                APPX · {app.id}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pl-6">
        {/* Title block */}
        <div className="text-center mb-8 pb-6 border-b border-white/10">
          <h3 className="font-montserrat text-2xl font-extrabold text-white mb-2">Appendix {activeApp}</h3>
          <p className="text-[#00e59b] font-montserrat uppercase tracking-widest text-[11px] font-bold">{apps.find(a => a.id === activeApp)!.title}</p>
        </div>

        {/* ── APPENDIX A: ROSTER ── */}
        {activeApp === 'A' && (
          <div className="text-white/80">
            <div className="text-[10px] text-white/30 mb-4 text-center italic tracking-wider">Care Indeed Home Health Care, Inc. · Policy GV-GB-001 · Version 6.0 · 2025-07-10</div>
            <p className="text-[11px] text-white/60 mb-6 border-l-2 border-white/20 pl-4 py-1 leading-relaxed"><strong className="text-white">Instructions:</strong> The Governing Body Chair (or designee) shall update this roster within 7 calendar days of any membership change. A copy shall be maintained in the agency governance file and provided to the Administrator. This roster must be readily accessible for CMS survey review.</p>
            <div className="overflow-x-auto border border-white/10 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    {['#','Full Legal Name','Title/Role','Voting Status','Appt Date','Term Exp','Competency Area','Email Address','OIG/SAM?'].map(h => <th key={h} className={thCls}>{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[1,2,3,4,5,6,7].map(i => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="p-3 text-white/30 text-center text-xs border-r border-white/10">{i}</td>
                      <td className="p-2 border-r border-white/10"><input className={inputCls} placeholder="Type here..." /></td>
                      <td className="p-2 border-r border-white/10"><input className={inputCls} /></td>
                      <td className="p-2 border-r border-white/10">
                        <select className={selectCls} style={{colorScheme:'dark'}}>
                          <option className="bg-[#111]">Voting</option>
                          <option className="bg-[#111]">Non-Voting</option>
                          <option className="bg-[#111]">Advisory</option>
                        </select>
                      </td>
                      <td className="p-2 border-r border-white/10"><input type="date" className={dateCls} style={{colorScheme:'dark'}} /></td>
                      <td className="p-2 border-r border-white/10"><input type="date" className={dateCls} style={{colorScheme:'dark'}} /></td>
                      <td className="p-2 border-r border-white/10"><input className={inputCls} /></td>
                      <td className="p-2 border-r border-white/10"><input type="email" className={inputCls} /></td>
                      <td className="p-2 text-center"><input type="checkbox" className="w-4 h-4 accent-[#00e59b]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-[11px] font-bold text-white/40 uppercase tracking-widest">
              <div>Roster Maintained By: <span className="border-b border-white/20 inline-block w-40 mx-2"></span> Title: <span className="border-b border-white/20 inline-block w-28 ml-2"></span></div>
              <div>Date Last Updated: <span className="border-b border-white/20 inline-block w-28 ml-2"></span></div>
              <div>Quorum Requirement: <span className="border-b border-white/20 inline-block w-10 text-center ml-2 text-white"></span> of <span className="border-b border-white/20 inline-block w-10 text-center mx-2 text-white"></span> voting members</div>
              <div>Total Voting: <span className="border-b border-white/20 inline-block w-10 text-center ml-2 text-white"></span> | Total Non-Voting: <span className="border-b border-white/20 inline-block w-10 text-center ml-2 text-white"></span></div>
            </div>
          </div>
        )}

        {/* ── APPENDIX B: CONFLICT OF INTEREST ── */}
        {activeApp === 'B' && (
          <div className="max-w-4xl mx-auto text-white/80">
            <div className="text-[10px] text-white/30 mb-4 text-center italic tracking-wider">Care Indeed Home Health Care, Inc. · Policy GV-GB-001 / GV-GB-003 · Version 6.0 · 2025-07-10</div>
            <p className="text-[11px] text-[#e85200] mb-8 border-l-2 border-[#e85200] pl-4 py-1 leading-relaxed"><strong>Instructions:</strong> Each Governing Body member shall complete this form: (1) at the time of initial appointment; (2) annually, at the first quarterly meeting; and (3) within 7 calendar days of any change in circumstances that could create a new actual or potential conflict. Submit to Compliance Officer.</p>
            <div className="space-y-8">
              <section>
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-white/50 mb-4">Section 1 — Member Information</h4>
                <div className="grid grid-cols-2 gap-6 border border-white/10 p-6 rounded-xl">
                  {[['Full Legal Name','text'],['Title / Role on Governing Body','text'],['Date of Appointment','date']].map(([label,type]) => (
                    <div key={label}>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">{label}</label>
                      <input type={type} className={inputCls} style={type==='date'?{colorScheme:'dark'}:{}} />
                    </div>
                  ))}
                  <div className="col-span-2 flex items-center gap-6 mt-3 pt-3 border-t border-white/5 text-[12px]">
                    <span className="font-bold text-white/70">Type of Disclosure:</span>
                    {['Initial','Annual Renewal','Change in Circumstances'].map(t => (
                      <label key={t} className="flex items-center gap-2 text-white/70"><input type="radio" name="discType" className="w-4 h-4 accent-[#e85200]" /> {t}</label>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-white/50 mb-2">Section 2 — Financial Interests</h4>
                <p className="text-[11px] text-white/40 mb-4 italic">Do you, or any immediate family member, hold any of the following interests related to the agency's operations, vendors, referral sources, or competitors?</p>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/5"><tr className="border-b border-white/10 text-white/50 text-[10px] uppercase tracking-widest">
                      <th className="p-3 border-r border-white/10">Question</th>
                      <th className="p-3 w-14 text-center border-r border-white/10">Yes</th>
                      <th className="p-3 w-14 text-center border-r border-white/10">No</th>
                      <th className="p-3 w-56">If Yes, Describe</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5 text-white/70">
                      {[
                        ['2.1','Ownership interest (equity, stock, partnership) in any entity that does business with, competes with, or provides referrals to Care Indeed Home Health Care, Inc.?'],
                        ['2.2','Employment, consulting, or advisory relationship with any entity that does business with, competes with, or provides referrals to this agency?'],
                        ['2.3','Financial interest in any vendor, supplier, or contractor used by the agency?'],
                        ['2.4','Receipt of compensation, gifts, or other benefits (exceeding $50 annually) from any entity that does business with or seeks to do business with the agency?'],
                      ].map(([n, q]) => (
                        <tr key={n}><td className="p-3 border-r border-white/10 leading-relaxed">{n} {q}</td>
                          <td className="p-2 text-center border-r border-white/10"><input type="radio" name={`q${n}`} className="w-4 h-4 accent-[#e85200]" /></td>
                          <td className="p-2 text-center border-r border-white/10"><input type="radio" name={`q${n}`} className="w-4 h-4 accent-[#e85200]" /></td>
                          <td className="p-2"><input className={inputCls} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-white/50 mb-2">Section 3 — Professional &amp; Organizational Relationships</h4>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/5"><tr className="border-b border-white/10 text-white/50 text-[10px] uppercase tracking-widest">
                      <th className="p-3 border-r border-white/10">Question</th>
                      <th className="p-3 w-14 text-center border-r border-white/10">Yes</th>
                      <th className="p-3 w-14 text-center border-r border-white/10">No</th>
                      <th className="p-3 w-56">If Yes, Describe</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5 text-white/70">
                      {[
                        ['3.1','Do you serve on the board or governing body of any other healthcare entity, referral source, or competitor?'],
                        ['3.2','Do you have any professional relationship with any physician group, hospital, SNF, or other provider that refers patients to or from Care Indeed Home Health Care, Inc.?'],
                        ['3.3','Do you have any other relationship or interest that could reasonably be perceived as creating a conflict of interest with your duties as a Governing Body member?'],
                      ].map(([n, q]) => (
                        <tr key={n}><td className="p-3 border-r border-white/10 leading-relaxed">{n} {q}</td>
                          <td className="p-2 text-center border-r border-white/10"><input type="radio" name={`q${n}`} className="w-4 h-4 accent-[#e85200]" /></td>
                          <td className="p-2 text-center border-r border-white/10"><input type="radio" name={`q${n}`} className="w-4 h-4 accent-[#e85200]" /></td>
                          <td className="p-2"><input className={inputCls} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="border border-[#00e59b]/30 p-6 rounded-xl">
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-[#00e59b] mb-4">Section 4 — Attestation</h4>
                <p className="text-[11px] text-white/70 mb-8 leading-relaxed">I hereby certify that the information provided above is true, complete, and accurate. I understand my ongoing obligation to disclose any new conflict within 7 calendar days, I must recuse from voting on conflicted matters, and failure to disclose may result in removal from the Governing Body of Care Indeed Home Health Care, Inc.</p>
                <div className="grid grid-cols-2 gap-8">
                  <div><label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Signature</label><div className="border-b border-dashed border-white/20 h-8 w-full"></div></div>
                  <div><label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Date Signed</label><input type="date" className={inputCls} style={{colorScheme:'dark'}} /></div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ── APPENDIX C: ACKNOWLEDGMENT ── */}
        {activeApp === 'C' && (
          <div className="max-w-2xl mx-auto text-white/80">
            <div className="text-[10px] text-white/30 mb-4 text-center italic tracking-wider">Care Indeed Home Health Care, Inc. · Policy GV-GB-001 · Version 6.0 · 2025-07-10</div>
            <div className="border border-white/10 p-8 rounded-xl mb-8">
              <p className="text-white font-bold mb-5 text-sm">I, the undersigned, acknowledge that:</p>
              <ol className="list-decimal list-outside space-y-4 text-sm ml-5 text-white/70">
                <li className="leading-relaxed pl-2">I have received and read Policy <strong className="text-white">GV-GB-001 — Governing Body Authority &amp; Responsibilities, Version 6.0</strong>, effective 2025-07-10.</li>
                <li className="leading-relaxed pl-2">I understand the responsibilities, requirements, and expectations described in this policy as they apply to my role at Care Indeed Home Health Care, Inc.</li>
                <li className="leading-relaxed pl-2">I understand that I am accountable for complying with this policy and that non-compliance may result in corrective action.</li>
                <li className="leading-relaxed pl-2">I have had the opportunity to ask questions and receive clarification regarding any aspect of this policy.</li>
              </ol>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
              {[['Full Name (Printed)','text'],['Title / Role','text']].map(([label,type]) => (
                <div key={label}><label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">{label}</label><input type={type} className={inputCls} /></div>
              ))}
              <div className="col-span-2 mt-2"><label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Signature</label><div className="border-b border-dashed border-white/20 h-12 w-full"></div></div>
              <div className="col-span-2 mt-2"><label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Date Signed</label><input type="date" className={`${inputCls} w-1/2`} style={{colorScheme:'dark'}} /></div>
            </div>
          </div>
        )}

        {/* ── APPENDIX D: MEETING MINUTES ── */}
        {activeApp === 'D' && (
          <div className="max-w-4xl mx-auto text-white/80">
            <div className="text-[10px] text-white/30 mb-4 text-center italic tracking-wider">Care Indeed Home Health Care, Inc. · Policy GV-GB-001 / GV-GB-002 · Version 6.0 · 2025-07-10</div>
            <p className="text-[11px] text-white/60 mb-6 border-l-2 border-white/20 pl-4 py-1 leading-relaxed"><strong className="text-white">Instructions:</strong> Use this template for all regular and special Governing Body meetings. Draft minutes shall be completed within 14 calendar days of the meeting and retained for a minimum of 7 years.</p>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6 border border-white/10 p-6 rounded-xl">
                <div><span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Meeting Type</span>
                  <select className={selectCls} style={{colorScheme:'dark'}}><option className="bg-[#111]">Regular Quarterly</option><option className="bg-[#111]">Special</option><option className="bg-[#111]">Annual</option></select></div>
                <div><span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Date</span><input type="date" className={dateCls} style={{colorScheme:'dark'}} /></div>
                <div><span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Time (Start/End)</span><input className={inputCls} placeholder="00:00 – 00:00" /></div>
                <div><span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Location</span><input className={inputCls} placeholder="In-Person / Remote" /></div>
              </div>

              <div>
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-[#00e59b] mb-4">Attendance &amp; Quorum</h4>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-white/5"><tr className="border-b border-white/10 text-white/50 text-[10px] uppercase tracking-widest">
                      <th className="p-3 border-r border-white/10 text-left">Member Name</th>
                      <th className="p-3 border-r border-white/10 w-20 text-center">Present?</th>
                      <th className="p-3 text-left">Attendance Method</th>
                    </tr></thead>
                    <tbody className="divide-y divide-white/5">
                      {[1,2,3,4,5].map(i => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="p-2 border-r border-white/10"><input className="w-full bg-transparent text-white focus:outline-none px-2 text-xs" /></td>
                          <td className="p-2 border-r border-white/10 text-center"><input type="checkbox" className="w-4 h-4 accent-[#00e59b]" /></td>
                          <td className="p-2"><input className="w-full bg-transparent text-white focus:outline-none px-2 text-xs" placeholder="In-person / Video" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex items-center gap-6 text-[11px] font-bold text-white/50 uppercase tracking-widest">
                  <span>Quorum Req: <input type="number" className="w-10 border-b border-white/20 bg-transparent text-center text-white focus:outline-none ml-2" /></span>
                  <span>Present: <input type="number" className="w-10 border-b border-white/20 bg-transparent text-center text-white focus:outline-none ml-2" /></span>
                  <span className="flex items-center gap-3">Achieved? <label className="flex items-center gap-1 text-white font-normal"><input type="radio" name="quorum" className="accent-[#00e59b]" />Yes</label> <label className="flex items-center gap-1 text-white font-normal"><input type="radio" name="quorum" className="accent-red-500" />No</label></span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-[#00e59b] mb-4">Standing Agenda Items (Summary)</h4>
                <div className="space-y-4">
                  {['3. Administrator Report:','4. Compliance Report:','5. QAPI Report:','6. Financial Report:'].map(label => (
                    <div key={label}>
                      <strong className="text-white text-xs block mb-1 font-montserrat">{label}</strong>
                      <textarea className={taCls} placeholder="Document summary, discussion, action required, responsible party, deadline..."></textarea>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── APPENDIX E: QUARTERLY CHECKLIST ── */}
        {activeApp === 'E' && (
          <div className="max-w-5xl mx-auto text-white/80">
            <div className="text-[10px] text-white/30 mb-4 text-center italic tracking-wider">Care Indeed Home Health Care, Inc. · Policy GV-GB-001 · Version 6.0 · 2025-07-10</div>
            <p className="text-[11px] text-[#00e59b] mb-6 border-l-2 border-[#00e59b] pl-4 py-1 leading-relaxed"><strong>Purpose:</strong> To provide a structured checklist to verify all required oversight activities are completed each quarter, supporting continuous survey readiness per 42 CFR § 484.105. Administrator must complete prior to each quarterly meeting.</p>
            <div className="flex items-center gap-6 mb-5 font-bold text-[12px] text-white/70 uppercase tracking-widest">
              <span className="flex items-center gap-3">Quarter:
                {['Q1','Q2','Q3','Q4'].map(q => <label key={q} className="flex items-center gap-1 font-normal text-white"><input type="radio" name="qtr" className="accent-[#00e59b]" /> {q}</label>)}
              </span>
              <span>Year: <input className="w-14 border-b border-white/20 bg-transparent text-center text-white focus:outline-none ml-2 text-xs" /></span>
            </div>
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/5"><tr className="border-b border-white/10 text-white/50 text-[10px] uppercase tracking-widest">
                  <th className="p-3 border-r border-white/10 w-10 text-center">#</th>
                  <th className="p-3 border-r border-white/10">Oversight Item</th>
                  <th className="p-3 border-r border-white/10 w-24 text-center">Y / N / N-A</th>
                  <th className="p-3 w-56">Notes / Corrective Action</th>
                </tr></thead>
                <tbody className="divide-y divide-white/5 text-white/70">
                  {[
                    'Governing Body meeting convened this quarter with quorum?',
                    'Meeting agenda distributed at least 7 days prior?',
                    'Prior meeting minutes approved?',
                    'Administrator report presented?',
                    'Compliance Officer report presented?',
                    'QAPI report presented?',
                    'Financial report presented?',
                    'All Governing Body member OIG/SAM screenings current (monthly)?',
                    'All Conflict of Interest disclosures current?',
                    'All key leadership positions filled (Administrator, Clinical Manager, Compliance Officer)?',
                    'Governing Body membership roster current?',
                    'Policy acknowledgments current for all members/leaders in scope?',
                    'Q1 Only: Annual QAPI plan reviewed and approved?',
                    'Q1 Only: Annual refresher training on governance responsibilities conducted?',
                    'Q1 Only: Governing Body composition reviewed for competency coverage?',
                    'Q2 Only: Succession plan reviewed and approved?',
                    'Q3 Only: Emergency preparedness plan reviewed and approved?',
                    'Pre-Fiscal Year: Annual operating budget reviewed and approved?',
                    'All directives from prior meeting assigned, tracked, and status reported?',
                    'Any Condition-level survey findings requiring Governing Body action?',
                  ].map((item, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="p-3 border-r border-white/10 font-bold text-white/30 text-center">{i+1}</td>
                      <td className="p-3 border-r border-white/10 font-medium text-white/90">{item}</td>
                      <td className="p-2 border-r border-white/10 text-center">
                        <select className={selectCls} style={{colorScheme:'dark'}}>
                          <option className="bg-[#111]"></option>
                          <option className="bg-[#111]">Y</option>
                          <option className="bg-[#111]">N</option>
                          <option className="bg-[#111]">N/A</option>
                        </select>
                      </td>
                      <td className="p-2"><input className="w-full bg-transparent border-b border-white/10 focus:outline-none focus:border-[#00e59b] text-white text-xs px-2" placeholder="..." /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-[11px] font-bold text-white/40 uppercase tracking-widest pt-5 border-t border-white/10">
              <div>Completed By: <span className="border-b border-white/20 inline-block w-40 mx-2"></span></div>
              <div>Title: <span className="border-b border-white/20 inline-block w-40 mx-2"></span></div>
              <div>Date: <span className="border-b border-white/20 inline-block w-40 mx-2"></span></div>
              <div>Presented to Chair? <label className="ml-2 font-normal text-white"><input type="checkbox" className="mr-1 accent-[#00e59b]" />Yes</label> — Date: <span className="border-b border-white/20 inline-block w-20 ml-2"></span></div>
            </div>
          </div>
        )}

        {/* ── APPENDIX F: ANNUAL CALENDAR ── */}
        {activeApp === 'F' && (
          <div className="max-w-5xl mx-auto text-white/80">
            <div className="text-[10px] text-white/30 mb-4 text-center italic tracking-wider">Care Indeed Home Health Care, Inc. · Policy GV-GB-001 · Version 6.0 · 2025-07-10</div>
            <p className="text-[11px] text-white/60 mb-6 border-l-2 border-white/20 pl-4 py-1 leading-relaxed"><strong className="text-white">Purpose:</strong> Consolidated annual calendar of all Governing Body actions required by this policy and cross-referenced policies. Administrator shall distribute to all members with the Q1 meeting agenda.</p>
            <GlassTable
              headers={['Quarter','Required Actions','Policy Reference','Responsible Party']}
              rows={[
                ['Q1','• Convene regular quarterly meeting.\n• Review and approve the annual QAPI plan.\n• Conduct annual Governing Body composition review.\n• Collect annual Conflict of Interest disclosures from all members.\n• Conduct annual refresher training on governance responsibilities.\n• Conduct annual Governance Self-Assessment (if adopted).','GV-GB-001 §6.3\nGV-GB-001 §6.2.4.1; QA-PG-002\nGV-GB-001 §6.1.3\nGV-GB-001 §6.4.1; GV-GB-003\nGV-GB-001 §10.4\nGV-GB-005','Governing Body Chair\nGoverning Body\nGoverning Body Chair\nCompliance Officer\nAdministrator\nGoverning Body Chair'],
                ['Q2','• Convene regular quarterly meeting.\n• Review and approve succession plan for key leadership.\n• Review scope of services (if fiscal year begins Q3).','GV-GB-001 §6.3\nGV-GB-001 §6.2.2.5; GV-GB-004\nGV-GB-001 §6.2.1.3; GV-OG-003','Governing Body Chair\nGoverning Body\nGoverning Body'],
                ['Q3','• Convene regular quarterly meeting.\n• Review and approve Emergency Preparedness Plan.\n• Review emergency drill results.','GV-GB-001 §6.3\nGV-GB-001 §6.2.6.1; OP-FM-005\nGV-GB-001 §6.2.6.2','Governing Body Chair\nGoverning Body\nAdministrator'],
                ['Q4','• Convene regular quarterly meeting.\n• Review and approve annual operating budget.\n• Complete annual Administrator performance evaluation.\n• Establish and distribute next year\'s meeting schedule by December 15.\n• Review and approve scope of services for upcoming year.','GV-GB-001 §6.3\nGV-GB-001 §6.2.5.1; FN-FP-005\nGV-GB-001 §6.2.2.4\nGV-GB-001 §6.3.1\nGV-GB-001 §6.2.1.3','Governing Body Chair\nGoverning Body\nGoverning Body\nGoverning Body Chair\nGoverning Body'],
                ['Every Meeting','• Review Administrator report.\n• Review Compliance Officer report.\n• Review QAPI report.\n• Review financial report.\n• Review status of prior meeting directives.\n• Verify OIG/SAM screening currency for all members.','GV-GB-001 §6.2.5.2\nGV-GB-001 §6.2.3.2\nGV-GB-001 §6.2.4.2\nGV-GB-001 §6.2.5.2\nGV-GB-001 §6.3.4\nGV-GB-001 §6.1.4; HR-TA-003','Administrator\nCompliance Officer\nClinical Manager\nAdministrator\nDesignated Secretary\nCompliance Officer'],
                ['Monthly','• OIG/SAM exclusion screening of all Governing Body members.','GV-GB-001 §6.1.4; HR-TA-003','Compliance Officer'],
              ]}
            />
          </div>
        )}

        {/* ── APPENDIX G: ORG CHART ── */}
        {activeApp === 'G' && (
          <div className="max-w-5xl mx-auto text-white/80 overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="text-[10px] text-white/30 mb-4 text-center italic tracking-wider">Care Indeed Home Health Care, Inc. · Policy GV-GB-001 · Version 6.0 · 2025-07-10</div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl max-w-3xl mx-auto mb-8 text-center">
                <p className="text-xs text-white/70 leading-relaxed"><strong className="text-white">Agency Organizational Structure:</strong> This chart illustrates the reporting relationships and accountability framework from the Governing Body through senior administrative and clinical leadership, as required by 42 CFR § 484.105.</p>
              </div>

              <div className="flex flex-col items-center w-full pb-10">
                {/* Governing Body */}
                <div className="bg-[#007b5f] p-5 rounded-xl w-72 text-center shadow-lg border border-[#009e7a]">
                  <h4 className="font-montserrat font-bold text-[14px] uppercase tracking-widest mb-2 text-white">Governing Body</h4>
                  <div className="bg-white text-[#007b5f] text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full inline-block">Ultimate Legal Authority</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="w-[440px] border-t border-white/20"></div>
                <div className="flex justify-between w-[440px]"><div className="w-px h-8 bg-white/20"></div><div className="w-px h-8 bg-white/20"></div></div>

                {/* Level 2 */}
                <div className="flex gap-8 justify-center">
                  <div className="flex flex-col items-center w-[240px]">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl w-full text-center shadow-lg">
                      <h4 className="font-montserrat font-bold text-[11px] uppercase tracking-wider mb-2 text-white">Compliance Officer</h4>
                      <input className="w-full bg-transparent text-[11px] text-center text-white/60 focus:outline-none border-b border-white/10 focus:border-[#00e59b]" placeholder="Enter Name..." />
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-[560px]">
                    <div className="bg-[#c2410c] border border-[#ea580c] p-4 rounded-xl w-64 text-center shadow-lg">
                      <h4 className="font-montserrat font-bold text-[11px] uppercase tracking-wider mb-2 text-white">Administrator</h4>
                      <input className="w-full bg-transparent text-[11px] text-center text-white/80 focus:outline-none border-b border-white/10 focus:border-white" placeholder="Enter Name..." />
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="w-[380px] border-t border-white/20"></div>
                    <div className="flex justify-between w-[380px]">
                      <div className="w-px h-8 bg-white/20"></div><div className="w-px h-8 bg-white/20"></div><div className="w-px h-8 bg-white/20"></div>
                    </div>

                    {/* Level 3 */}
                    <div className="flex justify-between w-full">
                      {[
                        { title: 'Clinical Manager', color: '#00e59b', sub: 'RN, PT, OT, ST, MSW, CHHA' },
                        { title: 'Medical Director', color: 'white', sub: '' },
                        { title: 'Business Ops', color: 'white', sub: 'HR, Finance, Intake, Scheduling' },
                      ].map(({ title, color, sub }) => (
                        <div key={title} className="flex flex-col items-center w-[178px]">
                          <div className="bg-white/5 border border-white/10 p-3 rounded-xl w-full text-center shadow-lg" style={{ borderColor: color === '#00e59b' ? '#00e59b60' : undefined }}>
                            <h4 className="font-montserrat font-bold text-[10px] uppercase tracking-wider mb-2" style={{ color }}>{title}</h4>
                            <input className="w-full bg-transparent text-[10px] text-center text-white/60 focus:outline-none border-b border-white/10 focus:border-[#00e59b]" placeholder="Enter Name..." />
                          </div>
                          {sub && <><div className="w-px h-5 bg-white/20"></div><div className="bg-white/5 border border-white/10 p-2 rounded-xl w-full text-center"><p className="text-[9px] text-white/50 leading-relaxed">{sub}</p></div></>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// STEP 2 — POLICY LIBRARY (Card Grid)
// ══════════════════════════════════════════════════════════════// ══════════════════════════════════════════════════════════════
// STEP 2 — POLICY LIBRARY (Card Grid)
// ══════════════════════════════════════════════════════════════

function DemoLibraryView({ onBack, onSelectPolicy }: { onBack: () => void; onSelectPolicy: (p: DemoPolicy) => void }) {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedSubdomain, setSelectedSubdomain] = useState('ALL');
  const [activeRegFilters, setActiveRegFilters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const allSubdomainsList = useMemo(() => DOMAINS.flatMap(d => d.subdomains.map(s => ({ ...s, domainCode: d.code, color: d.color }))), []);
  const currentDomain = DOMAINS.find(d => d.code === selectedDomain);
  const subdomainOptions = selectedDomain === 'ALL' ? allSubdomainsList : currentDomain?.subdomains || [];

  const scopedPolicies = useMemo(() => {
    let p = FULL_POLICY_DATASET;
    if (selectedDomain !== 'ALL') p = p.filter(x => x.domainCode === selectedDomain);
    if (selectedSubdomain !== 'ALL') p = p.filter(x => x.subdomainCode === selectedSubdomain);
    return p;
  }, [selectedDomain, selectedSubdomain]);

  const visiblePolicies = useMemo(() => {
    let p = scopedPolicies;
    if (activeRegFilters.size > 0) {
      p = p.filter(x => { for (const f of activeRegFilters) { if (!x.regulatoryTags.includes(f)) return false; } return true; });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      p = p.filter(x => x.policyId.toLowerCase().includes(q) || x.title.toLowerCase().includes(q));
    }
    return p;
  }, [scopedPolicies, activeRegFilters, searchQuery]);

  const statusCounts = useMemo(() => ({
    ACTIVE: visiblePolicies.filter(p => p.status === 'ACTIVE').length,
  }), [visiblePolicies]);

  const toggleRegFilter = useCallback((id: string) => {
    setActiveRegFilters(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);

  return (
    <div className="demo-fadeIn text-white flex flex-col h-full font-roboto">
      <div className="shrink-0 p-6 md:p-8 pb-0">
        {/* Top Nav */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={onBack} className="text-[#00e59b] font-montserrat text-[11px] font-bold tracking-[0.2em] flex items-center gap-2 hover:opacity-80 uppercase transition-opacity">
            <ChevronLeft size={16} /> TAXONOMY OVERVIEW
          </button>
        </div>

        <h1 className="font-montserrat text-3xl md:text-[36px] leading-tight font-light text-white mb-8 tracking-wide">
          Enterprise Framework <span className="text-white/30 text-2xl ml-2 font-mono align-middle">v6.0</span>
        </h1>

        {/* Regulatory */}
        <div className="mb-6">
          <h2 className="font-montserrat text-[12px] font-bold text-white flex items-center tracking-widest uppercase border-l-[3px] border-red-500 pl-4 mb-4">
            <ShieldCheck className="text-red-500 mr-3" size={16} /> Layer 1 — Regulatory Board
          </h2>
          <div className="flex flex-wrap items-center gap-2 pl-5">
            {REGULATORY_ITEMS.map(reg => {
              const isActive = activeRegFilters.has(reg.id);
              const Icon = reg.icon;
              return (
                <button key={reg.id} onClick={() => toggleRegFilter(reg.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border"
                  style={{ borderColor: isActive ? reg.color : 'rgba(255,255,255,0.15)', background: isActive ? `${reg.color}15` : 'rgba(255,255,255,0.02)', color: isActive ? reg.color : 'rgba(255,255,255,0.7)' }}>
                  <Icon size={12} /><span className="text-[10px] font-bold tracking-widest uppercase">{reg.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Domains */}
        <div className="mb-4">
          <h2 className="font-montserrat text-[12px] font-bold text-white flex items-center tracking-widest uppercase border-l-[3px] border-blue-400 pl-4 mb-4">
            <LayoutList className="text-blue-400 mr-3" size={16} /> Layer 2 — Domains
          </h2>
          <div className="flex flex-col gap-2 pl-5">
            <button onClick={() => { setSelectedDomain('ALL'); setSelectedSubdomain('ALL'); }}
              className={`w-fit px-4 py-2 rounded-full font-montserrat text-[10px] font-bold tracking-widest uppercase transition-colors border ${selectedDomain === 'ALL' ? 'border-white/20 bg-white/10 text-white' : 'border-transparent text-white/50 hover:text-white'}`}>
              ALL DOMAINS
            </button>
            <div className="grid grid-cols-5 gap-1.5">
              {DOMAINS.map(d => {
                const isActive = selectedDomain === d.code;
                const Icon = d.icon;
                return (
                  <button key={d.code} onClick={() => { setSelectedDomain(d.code); setSelectedSubdomain('ALL'); }}
                    className={`px-2 py-1.5 rounded-lg font-montserrat text-[9px] font-bold tracking-widest uppercase flex items-center justify-center gap-1 transition-colors ${isActive ? 'border text-white' : 'text-white/50 hover:text-white border border-transparent'}`}
                    style={isActive ? { borderColor: `${d.color}50`, backgroundColor: `${d.color}15`, color: d.color } : undefined}>
                    <Icon size={11} style={{ color: isActive ? d.color : undefined }} /> {d.code}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subdomains */}
        <div className="mb-4">
          <h2 className="font-montserrat text-[12px] font-bold text-white flex items-center tracking-widest uppercase border-l-[3px] border-orange-500 pl-4 mb-4">
            <GitBranch className="text-orange-500 mr-3" size={16} /> Layer 3 — Subdomains
          </h2>
          <div className="pl-5 pb-2">
            {selectedDomain === 'ALL' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '4px', maxWidth: '1200px' }}>
                {allSubdomainsList.map(s => {
                  const isActive = selectedSubdomain === s.code;
                  return (
                    <button key={`${s.domainCode}-${s.code}`} onClick={() => setSelectedSubdomain(selectedSubdomain === s.code ? 'ALL' : s.code)}
                      className={`py-1 rounded font-montserrat font-bold text-[8px] uppercase tracking-wider transition-colors text-center ${isActive ? 'bg-white/15 border border-white/30 text-white' : 'text-white/40 hover:text-white border border-transparent'}`}
                      style={isActive ? { color: s.color, borderColor: `${s.color}60`, backgroundColor: `${s.color}15` } : undefined}>
                      {s.domainCode}-{s.code}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button onClick={() => setSelectedSubdomain('ALL')}
                  className={`flex-shrink-0 px-3 py-1 rounded-full font-montserrat font-bold text-[9px] uppercase tracking-wider transition-colors ${selectedSubdomain === 'ALL' ? 'text-white bg-white/10 border border-white/20' : 'text-white/30 hover:text-white'}`}>
                  ALL SUBDOMAINS
                </button>
                {subdomainOptions.map(s => {
                  const isActive = selectedSubdomain === s.code;
                  return (
                    <button key={`${selectedDomain}-${s.code}`} onClick={() => setSelectedSubdomain(isActive ? 'ALL' : s.code)}
                      className={`flex-shrink-0 px-3 py-1 rounded-full font-montserrat font-bold text-[9px] uppercase tracking-wider transition-colors ${isActive ? 'text-[#00e59b] border border-[#00e59b]/30 bg-[#00e59b]/10' : 'text-white/40 hover:text-white border border-transparent'}`}>
                      {selectedDomain}-{s.code} - {s.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Search & Count */}
        <div className="mb-4">
          <h2 className="font-montserrat text-[12px] font-bold text-white flex items-center tracking-widest uppercase border-l-[3px] border-yellow-400 pl-4 mb-4">
            <FileText className="text-yellow-400 mr-3" size={16} /> Layer 4 — Policies
          </h2>
          <div className="flex justify-between items-end border-b border-white/10 pb-3 pl-5">
            <div className="w-[350px] flex items-center gap-3 border-b border-white/20 pb-2">
              <Search size={14} className="text-white/40" />
              <input type="text" placeholder="Search Title, ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent w-full outline-none text-sm text-white placeholder:text-white/30" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="text-white/30 hover:text-white"><X size={12} /></button>}
            </div>
            <div className="flex items-center gap-4 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">SCOPE:</span>
              <span className="text-[13px] font-mono text-white font-bold">{visiblePolicies.length} <span className="text-white/40 text-[11px] font-normal">Policies</span></span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00e59b]" /><span className="text-[13px] font-mono text-white font-bold">{statusCounts.ACTIVE}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar px-6 md:px-8 pb-8">
        <div className="demo-policy-grid demo-fadeIn pl-5 mt-2">
          {visiblePolicies.map(policy => {
            const domain = DOMAINS.find(d => d.code === policy.domainCode);
            const color = domain?.color || '#ffffff';
            const statusColor = policy.status === 'ACTIVE' ? '#00e59b' : policy.status === 'DRAFT' ? '#f97316' : '#3b82f6';
            return (
              <button key={policy.id} onClick={() => policy.domainCode === 'GV' && policy.policyId !== 'GV-GB-001' ? navigate(`/gv-policy/${policy.policyId}`) : onSelectPolicy(policy)}
                className="flex flex-col text-left p-4 rounded-xl border border-white/5 bg-transparent hover:bg-white/[0.03] hover:border-white/20 transition-all duration-300 h-[150px] group relative">
                <div className="flex items-start justify-between w-full mb-1.5">
                  <div className="text-[10px] font-bold font-mono tracking-wider" style={{ color }}>{policy.policyId}</div>
                  <button
                    onClick={e => { e.stopPropagation(); navigate('/library'); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-white/10 hover:bg-white/20 text-white/50 hover:text-[#FFC107] shrink-0"
                    title="View in Library">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  </button>
                </div>
                <h3 className="text-[12px] text-white/90 font-medium leading-snug line-clamp-3 mb-auto group-hover:text-white transition-colors">{policy.title}</h3>
                <div className="flex items-center justify-between w-full mt-3">
                  <span className="text-[8px] uppercase tracking-widest text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded group-hover:bg-white/10 transition-colors">{policy.classificationTier.substring(0, 3)}</span>
                  <span className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
                </div>
              </button>
            );
          })}
        </div>
        {visiblePolicies.length === 0 && (
          <div className="text-center py-20 text-white/20">
            <Search size={36} className="mx-auto mb-4 text-white/10" />
            <p className="text-lg font-light font-montserrat">No policies match criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// MAIN DEMO PAGE — Two-phase system
// ══════════════════════════════════════════════════════════════

type DemoView = 'cover' | 'library' | 'detail';
type DemoPhase = '1' | '2';

export function DemoPage() {
  const [phase, setPhase] = useState<DemoPhase>('1');
  const [view, setView] = useState<DemoView>('cover');
  const [detailPolicy, setDetailPolicy] = useState<DemoPolicy | null>(null);

  const goToLibrary = useCallback(() => setView('library'), []);
  const goToCover = useCallback(() => { setView('cover'); setDetailPolicy(null); }, []);
  const openDetail = useCallback((p: DemoPolicy) => { setDetailPolicy(p); setView('detail'); }, []);
  const backToLibrary = useCallback(() => { setView('library'); setDetailPolicy(null); }, []);

  const switchToPhase1 = useCallback(() => setPhase('1'), []);
  const switchToPhase2 = useCallback(() => setPhase('2'), []);

  return (
    <div className="h-full overflow-hidden flex flex-col">

      {/* ── Phase Selector Bar ── */}
      <div
        className="shrink-0 flex items-center gap-1 px-4 py-2 border-b"
        style={{ borderColor: 'var(--ci-hairline)', background: 'var(--glass-soft-bg)' }}
      >
        <button
          onClick={switchToPhase1}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-montserrat text-[10px] font-bold tracking-[0.18em] uppercase transition-all"
          style={{
            background: phase === '1' ? 'rgba(var(--ci-accent-rgb), 0.08)' : 'transparent',
            color: phase === '1' ? 'var(--ci-gold)' : 'var(--ci-text-muted)',
            border: phase === '1' ? '1px solid rgba(var(--ci-accent-rgb), 0.25)' : '1px solid transparent',
          }}
        >
          <Play size={11} />
          Phase 1 — Live System Demo
        </button>

        <div className="w-px h-4 mx-1" style={{ background: 'var(--ci-hairline)' }} />

        <button
          onClick={switchToPhase2}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg font-montserrat text-[10px] font-bold tracking-[0.18em] uppercase transition-all"
          style={{
            background: phase === '2' ? 'rgba(199,70,1,0.07)' : 'transparent',
            color: phase === '2' ? '#C74601' : 'var(--ci-text-muted)',
            border: phase === '2' ? '1px solid rgba(199,70,1,0.22)' : '1px solid transparent',
          }}
        >
          <Sparkles size={11} />
          Phase 2 — Executive Presentation
        </button>
      </div>

      {/* ── Phase 1: Live System Demo ── */}
      {phase === '1' && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {view === 'cover' && (
            <div className="h-full overflow-y-auto custom-scrollbar">
              <TaxonomyCoverView onViewPolicies={goToLibrary} />
            </div>
          )}
          {view === 'library' && (
            <DemoLibraryView onBack={goToCover} onSelectPolicy={openDetail} />
          )}
          {view === 'detail' && detailPolicy && (
            <DemoPolicyDetailView policy={detailPolicy} onBack={backToLibrary} />
          )}
        </div>
      )}

      {/* ── Phase 2: Executive Presentation ── */}
      {phase === '2' && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <ExecutivePresentation onBack={switchToPhase1} />
        </div>
      )}

    </div>
  );
}
