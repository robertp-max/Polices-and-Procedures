import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShellStore } from '../stores/uiStore';
import {
  Shield, Search, FileText, Building2, Users,
  DollarSign, Monitor, BarChart3, Scale, Heart, Cpu, Briefcase,
  Landmark, ShieldCheck, Gavel, ChevronLeft,
  Lock, FileCheck, Layers, Library,
  Activity, FileDigit, TrendingUp,
  AlertOctagon, Eye, UserPlus, GraduationCap, HeartHandshake,
  Clock, FileBadge, Receipt, Tags, PieChart, LogIn, Truck,
  MessageSquare, Key, DatabaseBackup, MonitorCog, Smartphone,
  BarChart2, UserCheck, Home, Siren, FolderTree, RefreshCw,
  BarChart, Network, ClipboardList
} from 'lucide-react';
import { AlertTriangle } from 'lucide-react';

import { frameworkPolicies } from '../data/frameworkSeed.generated';
import { achcSurveyByPolicyId, type AchcMappingType, type AchcSurveyMetadata } from '@/policy/data/achcSurveyProjection.generated';
import { EmptyState, SearchField } from '@/policy/components/ui';



// ══════════════════════════════════════════════════════════════
// ENTERPRISE POLICY TAXONOMY DATASET
// ══════════════════════════════════════════════════════════════

const REGULATORY_ITEMS = [
  { id: 'title22', name: 'Title 22 (California)', shortName: 'Title 22', color: 'var(--ci-reg-title22)', icon: Landmark },
  { id: '42cfr', name: '42 CFR Part 484', shortName: '42 CFR §484', color: 'var(--ci-reg-42cfr)', icon: Scale },
  { id: 'cms', name: 'CMS State Operations', shortName: 'CMS State Ops', color: 'var(--ci-reg-cms)', icon: FileCheck },
  { id: 'hipaa', name: 'HIPAA Privacy & Security', shortName: 'HIPAA', color: 'var(--ci-reg-hipaa)', icon: Lock },
  { id: 'osha', name: 'OSHA / Cal-OSHA', shortName: 'OSHA', color: 'var(--ci-reg-osha)', icon: Shield },
  { id: 'oig', name: 'OIG Compliance Guidance', shortName: 'OIG', color: 'var(--ci-reg-oig)', icon: ShieldCheck },
  { id: 'fca', name: 'False Claims Act', shortName: 'FCA', color: 'var(--ci-reg-fca)', icon: Gavel },
];

const DOMAINS = [
  {
    code: 'GV', name: 'GOVERNANCE', fullName: 'GV — Governance & Administration', icon: Building2, color: 'var(--ci-domain-gv)',
    subdomains: [
      { code: 'GB', name: 'Governing Body', icon: Users },
      { code: 'OG', name: 'Organization', icon: Network },
      { code: 'PM', name: 'Policy Management', icon: FileText },
      { code: 'EA', name: 'External Affairs', icon: Briefcase }
    ]
  },
  {
    code: 'CL', name: 'CLINICAL OPS', fullName: 'CL — Clinical Operations', icon: Heart, color: 'var(--ci-domain-cl)',
    subdomains: [
      { code: 'CP', name: 'Care Planning', icon: ClipboardList },
      { code: 'OA', name: 'OASIS', icon: FileDigit },
      { code: 'SD', name: 'Service Delivery', icon: Activity },
      { code: 'CA', name: 'Clinical Assessment', icon: Search },
      { code: 'CD', name: 'Clinical Documentation', icon: FileText },
      { code: 'PR', name: 'Patient Rights', icon: Shield }
    ]
  },
  {
    code: 'QA', name: 'QAPI', fullName: 'QA — Quality Assessment & Performance Improvement', icon: BarChart3, color: 'var(--ci-domain-qa)',
    subdomains: [
      { code: 'PG', name: 'QAPI Program', icon: Scale },
      { code: 'SM', name: 'Star Monitoring', icon: Eye },
      { code: 'AE', name: 'Adverse Events', icon: AlertOctagon },
      { code: 'PI', name: 'PIPs', icon: TrendingUp }
    ]
  },
  {
    code: 'HR', name: 'HUMAN RES.', fullName: 'HR — Human Resources', icon: Users, color: 'var(--ci-domain-hr)',
    subdomains: [
      { code: 'TA', name: 'Talent Acquisition', icon: UserPlus },
      { code: 'TD', name: 'Training & Dev', icon: GraduationCap },
      { code: 'WM', name: 'Workforce Mgmt', icon: Clock },
      { code: 'ER', name: 'Employee Relations', icon: HeartHandshake },
      { code: 'JD', name: 'Job Descriptions', icon: FileBadge }
    ]
  },
  {
    code: 'CO', name: 'COMPLIANCE', fullName: 'CO — Compliance & Regulatory', icon: Shield, color: 'var(--ci-domain-co)',
    subdomains: [
      { code: 'CP', name: 'Compliance Program', icon: ShieldCheck },
      { code: 'HP', name: 'HIPAA & Privacy', icon: Lock },
      { code: 'CA', name: 'California Privacy', icon: Landmark },
      { code: 'FA', name: 'Fraud & Abuse', icon: Search },
      { code: 'RA', name: 'Regulatory Affairs', icon: Scale },
      { code: 'DC', name: 'Doc Compliance', icon: FileCheck }
    ]
  },
  {
    code: 'FN', name: 'FINANCE', fullName: 'FN — Finance & Revenue Cycle', icon: DollarSign, color: 'var(--ci-domain-fn)',
    subdomains: [
      { code: 'FP', name: 'Financial Planning', icon: PieChart },
      { code: 'BC', name: 'Billing & Claims', icon: Receipt },
      { code: 'CM', name: 'Coding & Classification', icon: Tags }
    ]
  },
  {
    code: 'OP', name: 'OPERATIONS', fullName: 'OP — Operations & Facilities', icon: Briefcase, color: 'var(--ci-domain-op)',
    subdomains: [
      { code: 'IM', name: 'Intake Mgmt', icon: LogIn },
      { code: 'SL', name: 'Service Logistics', icon: Truck },
      { code: 'PA', name: 'Patient Access', icon: MessageSquare },
      { code: 'FM', name: 'Facility Admin', icon: Building2 }
    ]
  },
  {
    code: 'IT', name: 'IT & SECURITY', fullName: 'IT — Information Technology & Security', icon: Monitor, color: 'var(--ci-domain-it)',
    subdomains: [
      { code: 'SC', name: 'Security Controls', icon: Key },
      { code: 'DR', name: 'Data & Recovery', icon: DatabaseBackup },
      { code: 'SA', name: 'Systems Admin', icon: MonitorCog },
      { code: 'UP', name: 'Use Policies', icon: Smartphone }
    ]
  },
  {
    code: 'RM', name: 'RISK MGMT', fullName: 'RM — Risk Management & Safety', icon: AlertTriangle, color: 'var(--ci-domain-rm)',
    subdomains: [
      { code: 'ER', name: 'Enterprise Risk', icon: BarChart2 },
      { code: 'SS', name: 'Staff Safety', icon: UserCheck },
      { code: 'OS', name: 'Occupational Safety', icon: Shield },
      { code: 'PS', name: 'Patient Safety', icon: Home },
      { code: 'EP', name: 'Emergency Plan', icon: Siren }
    ]
  },
  {
    code: 'EN', name: 'ENTERPRISE', fullName: 'EN — Enterprise Governance & Control', icon: Cpu, color: 'var(--ci-domain-en)',
    subdomains: [
      { code: 'TG', name: 'Taxonomy Gov', icon: FolderTree },
      { code: 'LC', name: 'Lifecycle Control', icon: RefreshCw },
      { code: 'CM', name: 'Compliance Metrics', icon: BarChart }
    ]
  }
];

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
  'CO-CA': ['001: California Confidentiality of Medical Information Act (CMIA) Compliance'],
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
  'RM-OS': ['001: Cal/OSHA Injury & Illness Prevention Program (IIPP)', '002: Aerosol Transmissible Disease (ATD) Exposure Control Plan', '003: Bloodborne Pathogen (BBP) Exposure Control Plan', '004: Heat Illness Prevention Program'],
  'RM-EP': ['001: Emergency Preparedness Program', '002: Emergency Preparedness Training & Testing Program', '003: Patient Emergency Communication Plan'],
  'EN-TG': ['001: Enterprise Policy Taxonomy & Classification Governance', '002: Regulatory Cross-Reference & Mapping'],
  'EN-LC': ['001: Policy Lifecycle Control & Version Management', '002: Policy Exception & Waiver Management', '003: Policy Assignment and Role-Based Applicability Governance', '004: Policy Retirement and Obsolescence Management'],
  'EN-CM': ['001: Enterprise Compliance Metrics Program', '002: Inter-Domain Policy Coordination & Conflict Resolution'],
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

function matchesPattern(policyId: string, patterns: string[]): boolean {
  return patterns.some(p => p.endsWith('*') ? policyId.startsWith(p.slice(0, -1)) : policyId === p);
}

function getTagsForPolicy(id: string): string[] {
  const tags: string[] = [];
  const u = id.toUpperCase();
  // GV-GB-001 canonical full tag set (cross-referenced with DemoPage specimen)
  if (u === 'GV-GB-001') return ['42cfr', 'title22', 'cms', 'hipaa', 'oig', 'fca'];
  if (matchesPattern(u, ['GV-EA-004','GV-OG-002','GV-OG-003','HR-TA-001','HR-TA-004','HR-EH-101','RM-OS-101','RM-EP-001','RM-EP-002','FN-BC-001','FN-FP-005'])) tags.push('title22');
  if (matchesPattern(u, ['CO-HP-*','CO-BA-101','CO-IR-101','CO-DG-101','CO-DC-001'])) {
    if (!matchesPattern(u, ['CO-FW-101','CO-AI-101','HR-TR-101','HR-EH-101'])) tags.push('hipaa');
  }
  if (matchesPattern(u, ['FN-BC-001','FN-CM-003','CL-CD-001','QA-PI-002','CO-CP-005','CO-FW-101'])) tags.push('fca');
  if (matchesPattern(u, ['CL-SD-001','CL-SD-002','CL-SD-012','CL-SD-016','CL-SD-017','CL-CD-001','QA-*','HR-TR-101'])) tags.push('cms');
  if (matchesPattern(u, ['CO-*','FN-BC-001','FN-CM-003','CL-CD-001','CL-SD-001','CL-SD-002','QA-*','HR-TA-002','HR-TA-003'])) tags.push('oig');
  if (matchesPattern(u, ['RM-SS-*','RM-OS-101','HR-EH-101'])) tags.push('osha');
  if (matchesPattern(u, ['GV-*','CL-*','QA-*','OP-*'])) tags.push('42cfr');
  return [...new Set(tags)];
}

function hasPrefix(values: string[], prefix: string): boolean {
  if (prefix === 'ALL') return true;
  return values.some((value) => value.startsWith(prefix));
}

interface PolicyRecord {
  id: string; policyId: string; title: string; domain: string; domainCode: string;
  subdomain: string; subdomainCode: string; classificationTier: string; status: string;
  version: string; effectiveDate: string; nextReviewDate: string; policyOwner: string;
  approvedBy: string; purpose: string; scope: string[]; regulatoryTags: string[];
  achc: AchcSurveyMetadata | null;
}

const FULL_POLICY_DATASET: PolicyRecord[] = [];

Object.entries(rawPolicies).forEach(([prefix, items]) => {
  const [domainCode, subdomainCode] = prefix.split('-');
  const domain = DOMAINS.find(d => d.code === domainCode);
  const subdomain = domain?.subdomains.find(s => s.code === subdomainCode);
  items.forEach(item => {
    const ci = item.indexOf(': ');
    const idNum = item.substring(0, ci);
    const title = item.substring(ci + 2);
    const fullId = `${domainCode}-${subdomainCode}-${idNum}`;
    FULL_POLICY_DATASET.push({
      id: fullId.toLowerCase(), policyId: fullId, title,
      domain: domain?.fullName || 'Unknown Domain', domainCode,
      subdomain: subdomain ? `${subdomain.code} — ${subdomain.name}` : subdomainCode,
      subdomainCode, classificationTier: 'REQUIRED', status: 'ACTIVE', version: '6.0',
      effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
      policyOwner: 'Administrator', approvedBy: 'Governing Body Chair',
      purpose: `This policy establishes standards for ${title} to ensure compliance with enterprise and regulatory requirements.`,
      scope: ['All applicable personnel', 'Management'], regulatoryTags: getTagsForPolicy(fullId), achc: null,
    });
  });
});

newPoliciesData.forEach(p => {
  const domain = DOMAINS.find(d => d.code === p.domainCode);
  const subdomain = domain?.subdomains.find(s => s.code === p.subCode);
  FULL_POLICY_DATASET.push({
    id: p.id.toLowerCase(), policyId: p.id, title: p.title,
    domain: domain?.fullName || 'Unknown Domain', domainCode: p.domainCode,
    subdomain: subdomain ? `${subdomain.code} — ${subdomain.name}` : p.subCode,
    subdomainCode: p.subCode, classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair',
    purpose: `This policy establishes standards for ${p.title}.`,
    scope: ['All applicable personnel'], regulatoryTags: getTagsForPolicy(p.id), achc: null,
  });
});

const LIBRARY_ENRICHMENT_BY_ID = new Map(FULL_POLICY_DATASET.map(policy => [policy.policyId, policy]));

const FRAMEWORK_RENDER_DATASET: PolicyRecord[] = frameworkPolicies.map((frameworkPolicy) => {
  const enriched = LIBRARY_ENRICHMENT_BY_ID.get(frameworkPolicy.id);
  const domain = DOMAINS.find(d => d.code === frameworkPolicy.domainCode);
  const subdomain = domain?.subdomains.find(s => s.code === frameworkPolicy.subdomainCode);
  const fallbackEffectiveDate = frameworkPolicy.createdAt?.slice(0, 10) ?? '';
  const fallbackNextReviewDate = frameworkPolicy.updatedAt?.slice(0, 10) ?? '';

  return {
    id: frameworkPolicy.id.toLowerCase(),
    policyId: frameworkPolicy.id,
    title: enriched?.title ?? frameworkPolicy.title,
    domain: domain?.fullName ?? frameworkPolicy.domainCode,
    domainCode: frameworkPolicy.domainCode,
    subdomain: enriched?.subdomain ?? (subdomain ? `${subdomain.code} — ${subdomain.name}` : frameworkPolicy.subdomainCode),
    subdomainCode: frameworkPolicy.subdomainCode,
    classificationTier: enriched?.classificationTier ?? frameworkPolicy.tier,
    status: enriched?.status ?? frameworkPolicy.lifecycleStatus,
    version: enriched?.version ?? frameworkPolicy.currentVersion.replace(/^v/i, ''),
    effectiveDate: enriched?.effectiveDate ?? fallbackEffectiveDate,
    nextReviewDate: enriched?.nextReviewDate ?? fallbackNextReviewDate,
    policyOwner: enriched?.policyOwner ?? frameworkPolicy.ownerSteward,
    approvedBy: enriched?.approvedBy ?? 'Governing Body Chair',
    purpose: enriched?.purpose ?? frameworkPolicy.description,
    scope: enriched?.scope ?? ['All applicable personnel'],
    regulatoryTags: enriched?.regulatoryTags ?? getTagsForPolicy(frameworkPolicy.id),
    achc: achcSurveyByPolicyId[frameworkPolicy.id] ?? null,
  };
});

// ══════════════════════════════════════════════════════════════
// LIBRARY PAGE — GLASS-INTERACTIVE DESIGN
// ══════════════════════════════════════════════════════════════



export function LibraryPage() {
  const navigate = useNavigate();
  const theme = useShellStore(s => s.theme);
  const isLight = theme === 'care-indeed-light';
  /* U-14 (Wave 5A): inline replacement for the deleted utils/lightColorRemap.ts.
   * Dark theme: returns the original hex unchanged (legacy behavior).
   * Light theme: substitutes the canonical `var(--ci-*)` token so the accent
   * surface picks up the Care Indeed light palette via CSS, mirroring the
   * LIGHT_COLOR_MAP table from the removed band-aid module.
   * mixAlpha translates the prior `${hex}40` alpha-concat pattern into
   * `color-mix()` when the resolved color is a CSS variable. */
  const LIGHT_TOKEN_FOR_LEGACY_HEX: Record<string, string> = {
    '#facc15': 'var(--ci-primary-500)',
    '#ffc107': 'var(--ci-primary-500)',
    '#f59e0b': 'var(--ci-primary-500)',
    '#10b981': 'var(--ci-success-300)',
    '#06b6d4': 'var(--ci-secondary-500)',
    '#ffffff': 'var(--ci-text-primary)',
  };
  const mapColor = (c: string): string => {
    if (!isLight) return c;
    return LIGHT_TOKEN_FOR_LEGACY_HEX[c.toLowerCase()] ?? c;
  };
  const mixAlpha = (color: string, pct: number): string => {
    if (color.startsWith('var(')) {
      return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
    }
    const a = Math.round((pct / 100) * 255).toString(16).padStart(2, '0').toUpperCase();
    return `${color}${a}`;
  };
  const [libraryView, setLibraryView] = useState<'IBM' | 'ACHC'>('IBM');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>('ALL');
  const [activeRegFilter, setActiveRegFilter] = useState('ALL');
  const [achcMappingFilter, setAchcMappingFilter] = useState<'ALL' | AchcMappingType>('ALL');
  const [achcEvidenceFilter, setAchcEvidenceFilter] = useState<'ALL' | 'P' | 'D' | 'I' | 'O' | 'S'>('ALL');
  const [achcTitle22Filter, setAchcTitle22Filter] = useState('ALL');
  const [achcStandardFilter, setAchcStandardFilter] = useState('ALL');
  const [achcCopFilter, setAchcCopFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubdomains = useMemo(() => {
    if (selectedDomain === 'ALL')
      return DOMAINS.flatMap(d => d.subdomains.map(s => ({ ...s, domainCode: d.code, domainColor: d.color })));
    const domain = DOMAINS.find(d => d.code === selectedDomain);
    return domain?.subdomains.map(s => ({ ...s, domainCode: domain.code, domainColor: domain.color })) || [];
  }, [selectedDomain]);

  const renderedPolicies = useMemo(() => {
    let p = FRAMEWORK_RENDER_DATASET;
    if (selectedDomain !== 'ALL') p = p.filter(x => x.domainCode === selectedDomain);
    if (selectedSubdomain !== 'BROWSE' && selectedSubdomain !== 'ALL')
      p = p.filter(x => x.subdomainCode === selectedSubdomain);
    if (libraryView === 'IBM' && activeRegFilter !== 'ALL') p = p.filter(x => x.regulatoryTags.includes(activeRegFilter));
    if (libraryView === 'ACHC') {
      p = p.filter((x) => {
        const achc = x.achc;
        if (!achc) return false;
        if (achcMappingFilter !== 'ALL' && achc.mappingType !== achcMappingFilter) return false;
        if (achcEvidenceFilter !== 'ALL' && !achc.evidenceCodes.includes(achcEvidenceFilter)) return false;
        if (achcTitle22Filter !== 'ALL' && !achc.title22.some((ref) => ref.includes(achcTitle22Filter))) return false;
        if (!hasPrefix(achc.achcStandards, achcStandardFilter)) return false;
        if (achcCopFilter !== 'ALL' && !achc.medicareCop.some((ref) => ref.includes(achcCopFilter))) return false;
        return true;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      p = p.filter(x => x.policyId.toLowerCase().includes(q) || x.title.toLowerCase().includes(q));
    }
    return p;
  }, [selectedDomain, selectedSubdomain, searchQuery, activeRegFilter, libraryView, achcMappingFilter, achcEvidenceFilter, achcTitle22Filter, achcStandardFilter, achcCopFilter]);

  const achcTitle22Prefixes = useMemo(() => {
    return [...new Set(FRAMEWORK_RENDER_DATASET.flatMap((p) =>
      (p.achc?.title22 ?? [])
        .map((ref) => {
          const m = ref.match(/(\d{3})/);
          return m ? m[1] : '';
        })
        .filter(Boolean)))].sort((a, b) => a.localeCompare(b));
  }, []);
  const achcStandardPrefixes = useMemo(() => {
    return [...new Set(FRAMEWORK_RENDER_DATASET.flatMap((p) => (p.achc?.achcStandards ?? []).map((s) => s.slice(0, 3)).filter(Boolean)))].sort((a, b) => a.localeCompare(b));
  }, []);
  const achcCopPrefixes = useMemo(() => {
    return [...new Set(FRAMEWORK_RENDER_DATASET.flatMap((p) =>
      (p.achc?.medicareCop ?? [])
        .map((ref) => {
          const m = ref.match(/(\d{3})/);
          return m ? m[1] : '';
        })
        .filter(Boolean)))].sort((a, b) => a.localeCompare(b));
  }, []);

  const handleDomainSelect = (code: string) => {
    setSelectedDomain(code);
    setSelectedSubdomain('ALL');
    setSearchQuery('');
  };

  const handleSubdomainSelect = (code: string) => {
    setSelectedSubdomain(code);
    setSearchQuery('');
  };

  const selectedSubdomainObj = filteredSubdomains.find(s => s.code === selectedSubdomain);
  const selectedDomainObj = DOMAINS.find(d => d.code === selectedDomain);
  const browseTitle = selectedDomain === 'ALL'
    ? 'ALL DOMAINS — Global Repository'
    : selectedDomainObj ? `${selectedDomainObj.code} — ${selectedDomainObj.fullName.replace(/^[A-Z]+ — /, '')}` : '';

  return (
    <>
      <style>{`
        .lib-custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .lib-custom-scrollbar::-webkit-scrollbar { display: none; }
        .glass-interactive-lib { background-color: transparent !important; transition: border-color 300ms ease, box-shadow 300ms ease; }
        .glass-interactive-lib:hover { box-shadow: 0 0 15px rgba(255,255,255,0.05); }
        .glass-panel-lib { background: transparent !important; backdrop-filter: blur(12px); }
        @keyframes fadeUpLib { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeUpLib { animation: fadeUpLib 0.4s ease-out forwards; }
        @keyframes shimmerLib { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
        /* Care Indeed light mode: solid brand surfaces for every lib panel */
        html[data-theme="care-indeed-light"] .glass-interactive-lib,
        html[data-theme="care-indeed-light"] .glass-panel-lib {
          background: #FAFBF8 !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          border-color: #E5E4E3 !important;
        }
        html[data-theme="care-indeed-light"] .glass-interactive-lib:hover {
          background: #FFFFFF !important;
          border-color: #C74601 !important;
          box-shadow: none !important;
        }
      `}</style>

      <div className="h-full w-full font-roboto text-ci-text-primary bg-ci-bg flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="px-10 pt-10 pb-4 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h1 className="font-montserrat text-3xl font-light text-ci-text-primary flex items-center gap-4">
              <Library className="ci-text-gold" size={36} strokeWidth={1.5}/> Enterprise Policy Library
            </h1>
            <div className="flex items-center gap-3 mt-4 ml-1">
              <div className="glass-interactive-lib px-3 py-1.5 rounded-full border-[0.77px] ci-border-gold-soft flex items-center gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC107]/20 to-transparent -translate-x-full"
                  style={{animation:'shimmerLib 2.5s infinite'}}/>
                <FileText size={12} className="ci-text-gold animate-pulse"/>
                <span className="text-[9px] font-bold font-montserrat tracking-[0.2em] text-ci-text-primary">{renderedPolicies.length} POLICIES</span>
              </div>
              <div className="glass-interactive-lib px-3 py-1.5 rounded-full border-[0.77px] ci-border-fca-soft flex items-center gap-2 relative overflow-hidden cursor-pointer"
                onClick={() => navigate('/forms')}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A855F7]/20 to-transparent -translate-x-full"
                  style={{animation:'shimmerLib 3s infinite 0.5s'}}/>
                <Layers size={12} className="ci-text-fca animate-pulse"/>
                <span className="text-[9px] font-bold font-montserrat tracking-[0.2em] text-ci-text-primary">361 FORMS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Policy Search */}
            <SearchField
              placeholder="Search policies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-[280px]"
            />

            {/* Policies / Forms toggle */}
            <div className="flex items-center p-1 rounded-full border border-ci-border">
              <button type="button" className="px-6 py-2 rounded-full text-[9px] font-bold tracking-widest uppercase border-[0.77px] border-ci-gold ci-text-gold font-montserrat">
                Policies
              </button>
              <button type="button" onClick={() => navigate('/forms')}
                className="px-6 py-2 rounded-full text-[9px] font-bold tracking-widest uppercase border-[0.77px] border-transparent text-ci-text-subtle hover:text-ci-text-primary transition-colors font-montserrat">
                Forms
              </button>
            </div>
          </div>
        </div>

        {/* PROMINENT VIEW MODE SWITCH */}
        <div className="px-10 pb-5 shrink-0">
          <div className="flex rounded-xl overflow-hidden border border-ci-border">
            <button
              type="button"
              onClick={() => setLibraryView('IBM')}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 text-[11px] font-bold tracking-widest uppercase font-montserrat transition-colors ${
                libraryView === 'IBM'
                  ? 'ci-bg-brand-teal text-white'
                  : isLight ? 'bg-white ci-text-brand-grey ci-hover-text-teal' : 'text-ci-text-subtle ci-hover-text-teal'
              }`}
            >
              <Library size={15} /> IBM Framework View
            </button>
            <button
              type="button"
              onClick={() => setLibraryView('ACHC')}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 text-[11px] font-bold tracking-widest uppercase font-montserrat transition-colors ${
                libraryView === 'ACHC'
                  ? 'ci-bg-brand-coral text-white'
                  : isLight ? 'bg-white ci-text-brand-grey ci-hover-text-coral' : 'text-ci-text-subtle ci-hover-text-coral'
              }`}
            >
              <ShieldCheck size={15} /> ACHC Survey View
            </button>
          </div>
        </div>

        {/* ACHC HORIZONTAL FILTER BAR */}
        {libraryView === 'ACHC' && (
          <div className="px-8 py-3 ci-bg-achc border-b ci-border-achc shrink-0">
            <div className="flex items-center gap-1.5 mb-2.5">
              <ShieldCheck size={12} className="ci-text-achc" />
              <span className="text-[9px] font-bold font-montserrat tracking-[0.2em] ci-text-achc uppercase">ACHC Survey Filters</span>
              <span className="ml-auto text-[9px] font-mono ci-text-achc">{renderedPolicies.length} policies</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedDomain}
                onChange={(e) => handleDomainSelect(e.target.value)}
                className="rounded-lg border ci-border-achc bg-white px-2.5 py-1.5 text-[10px] font-montserrat ci-text-achc ci-focus-achc"
              >
                <option value="ALL">Governance: ALL</option>
                {DOMAINS.map((d) => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
              </select>
              <select
                value={achcMappingFilter}
                onChange={(e) => setAchcMappingFilter(e.target.value as 'ALL' | AchcMappingType)}
                className="rounded-lg border ci-border-achc-soft bg-white px-2.5 py-1.5 text-[10px] font-montserrat ci-focus-achc"
              >
                <option value="ALL">Status: ALL</option>
                <option value="DIRECT">DIRECT</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="NONE">NONE</option>
                <option value="SME_REVIEW">SME_REVIEW</option>
              </select>
              <select
                value={achcEvidenceFilter}
                onChange={(e) => setAchcEvidenceFilter(e.target.value as 'ALL' | 'P' | 'D' | 'I' | 'O' | 'S')}
                className="rounded-lg border ci-border-achc-soft bg-white px-2.5 py-1.5 text-[10px] font-montserrat ci-focus-achc"
              >
                <option value="ALL">Evidence: ALL</option>
                <option value="P">P — Policy</option>
                <option value="D">D — Document</option>
                <option value="I">I — Interview</option>
                <option value="O">O — Observation</option>
                <option value="S">S — Simulation</option>
              </select>
              <select
                value={achcTitle22Filter}
                onChange={(e) => setAchcTitle22Filter(e.target.value)}
                className="rounded-lg border ci-border-achc-soft bg-white px-2.5 py-1.5 text-[10px] font-montserrat ci-focus-achc"
              >
                <option value="ALL">CA Title 22: ALL</option>
                {achcTitle22Prefixes.map((prefix) => <option key={prefix} value={prefix}>{prefix}</option>)}
              </select>
              <select
                value={achcStandardFilter}
                onChange={(e) => setAchcStandardFilter(e.target.value)}
                className="rounded-lg border ci-border-achc-soft bg-white px-2.5 py-1.5 text-[10px] font-montserrat ci-focus-achc"
              >
                <option value="ALL">ACHC HH Standards: ALL</option>
                {achcStandardPrefixes.map((prefix) => <option key={prefix} value={prefix}>{prefix}</option>)}
              </select>
              <select
                value={achcCopFilter}
                onChange={(e) => setAchcCopFilter(e.target.value)}
                className="rounded-lg border ci-border-achc-soft bg-white px-2.5 py-1.5 text-[10px] font-montserrat ci-focus-achc"
              >
                <option value="ALL">Medicare CoP: ALL</option>
                {achcCopPrefixes.map((prefix) => <option key={prefix} value={prefix}>{prefix}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* MAIN BODY: sidebar + content */}
        <div className="flex-1 flex min-h-0">
          {/* SIDEBAR — IBM View only */}
          {libraryView === 'IBM' && (
          <aside className="w-[280px] px-6 py-4 shrink-0 overflow-y-auto lib-custom-scrollbar border-r border-ci-border">
            <>
              {/* Regulatory Filters */}
              <h2 className="text-[8px] font-bold text-ci-text-subtle tracking-[0.2em] uppercase mb-4 pl-2 font-montserrat">Regulatory Filters</h2>
              <div className="flex flex-wrap gap-1.5 pl-2 mb-8">
                {[{ id: 'ALL', shortName: 'All', color: '#ffffff', icon: Layers }, ...REGULATORY_ITEMS].map(reg => {
                  const isActive = activeRegFilter === reg.id;
                  const Icon = reg.icon;
                  return (
                    <button key={reg.id}
                      onClick={() => setActiveRegFilter(isActive && reg.id !== 'ALL' ? 'ALL' : reg.id)}
                      className="glass-interactive-lib flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest border-[0.77px] font-montserrat transition-colors"
                      style={isActive
                        ? { borderColor: mapColor(reg.color), color: mapColor(reg.color) }
                        : isLight ? { borderColor: 'rgba(0,0,0,0.12)', color: '#747470' } : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
                      <Icon size={10}/> {reg.shortName.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </>

            {/* Domain Buttons */}
            <h2 className="text-[8px] font-bold text-ci-text-subtle tracking-[0.2em] uppercase mb-4 pl-2 font-montserrat">Strategic Domains</h2>
            <div className="space-y-1 pl-1">
              <button
                onClick={() => handleDomainSelect('ALL')}
                className={`glass-interactive-lib w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[9px] font-bold border-[0.77px] font-montserrat tracking-wider uppercase transition-colors text-left`}
                style={selectedDomain === 'ALL'
                  ? isLight ? { borderColor: 'rgba(0,0,0,0.2)', color: '#1F1C1B' } : { borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }
                  : isLight ? { borderColor: 'transparent', color: '#747470' } : { borderColor: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
                <Layers size={13}/> Global Repository
              </button>
              {DOMAINS.map(d => {
                const isActive = selectedDomain === d.code;
                const Icon = d.icon;
                const dColor = mapColor(d.color);
                return (
                  <button key={d.code}
                    onClick={() => handleDomainSelect(d.code)}
                    className="glass-interactive-lib w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[9px] font-bold border-[0.77px] font-montserrat tracking-wider uppercase transition-colors text-left"
                    style={isActive
                      ? { borderColor: mixAlpha(dColor, 38), color: dColor, backgroundColor: mixAlpha(dColor, 6) }
                      : isLight ? { borderColor: 'transparent', color: '#747470' } : { borderColor: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
                    <Icon size={13} style={{ color: isActive ? dColor : undefined }}/> {d.name}
                  </button>
                );
              })}
            </div>
          </aside>
          )}

          {/* MAIN CONTENT */}
          <section className="flex-1 flex flex-col overflow-hidden">
            {/* Top nav bar */}
            <div className="px-8 py-4 flex items-center gap-4 shrink-0 border-b border-ci-border">
              {selectedSubdomain !== 'ALL' && (
                <button
                  onClick={() => setSelectedSubdomain('ALL')}
                  className="glass-interactive-lib flex items-center gap-2 px-3 py-1.5 rounded-full border-[0.77px] border-ci-border text-[9px] font-bold tracking-widest uppercase text-ci-text-subtle hover:text-ci-text-primary transition-colors font-montserrat">
                  <ChevronLeft size={13}/> Back
                </button>
              )}
              <div className="flex-1">
                <p className="text-[8px] text-ci-text-subtle tracking-[0.2em] uppercase font-montserrat font-bold">
                  {selectedSubdomain === 'BROWSE' || selectedSubdomain === 'ALL'
                    ? browseTitle
                    : `${selectedSubdomainObj ? `${selectedSubdomainObj.domainCode}-${selectedSubdomainObj.code} — ${selectedSubdomainObj.name}` : ''}`}
                </p>
              </div>
              {selectedSubdomain !== 'BROWSE' && (
                <button
                  onClick={() => setSelectedSubdomain('BROWSE')}
                  className="glass-interactive-lib flex items-center gap-2 px-3 py-1.5 rounded-full border-[0.77px] border-ci-border text-[9px] font-bold tracking-widest uppercase text-ci-text-subtle hover:text-ci-text-primary transition-colors font-montserrat">
                  <FolderTree size={11}/> Categories
                </button>
              )}
              <span className="text-[9px] font-mono text-ci-text-subtle">
                {selectedSubdomain === 'BROWSE'
                  ? `${filteredSubdomains.length} subdomains`
                  : `${renderedPolicies.length} policies`}
              </span>
            </div>

            {/* Grid area */}
            <div className="flex-1 overflow-y-auto lib-custom-scrollbar p-8">
              {selectedSubdomain === 'BROWSE' ? (
                /* SUBDOMAIN CARDS */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fadeUpLib">
                  {filteredSubdomains.map(sub => {
                    const SubIcon = sub.icon;
                    const count = renderedPolicies.filter(p => p.domainCode === sub.domainCode && p.subdomainCode === sub.code).length;
                    return (
                      <button key={`${sub.domainCode}-${sub.code}`}
                        onClick={() => {
                          if (selectedDomain === 'ALL') setSelectedDomain(sub.domainCode);
                          handleSubdomainSelect(sub.code);
                        }}
                        className={`glass-interactive-lib glass-panel-lib border-[0.77px] p-6 rounded-2xl flex items-center gap-5 text-left hover:border-[#FFC107]/40 transition-colors group ${isLight ? 'border-[#E5E4E3]' : 'border-white/10'}`}>
                          <div className={`w-12 h-12 rounded-xl border-[0.77px] flex items-center justify-center shrink-0 ${isLight ? 'border-black/10' : 'border-white/10'}`}
                          style={{ color: mapColor(sub.domainColor) }}>
                          <SubIcon size={20} strokeWidth={1.5}/>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-mono text-gray-500 mb-0.5">{sub.domainCode}-{sub.code}</p>
                          <p className="text-[13px] font-bold text-ci-text-primary uppercase font-montserrat group-hover:text-[#FFC107] transition-colors truncate">{sub.name}</p>
                          <p className="text-[9px] text-ci-text-subtle font-montserrat mt-1">{count} policies</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* POLICY CARDS */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fadeUpLib">
                  {renderedPolicies.map(policy => {
                    const domain = DOMAINS.find(d => d.code === policy.domainCode);
                    const color = mapColor(domain?.color || '#ffffff');
                    const regDots = REGULATORY_ITEMS.filter(r => policy.regulatoryTags.includes(r.id));
                    const achc = policy.achc;
                    return (
                      <button key={policy.id}
                        onClick={() => navigate(`/library/${policy.policyId}`)}
                        className={`glass-interactive-lib glass-panel-lib border-[0.77px] p-5 rounded-2xl flex flex-col ${libraryView === 'ACHC' ? 'h-auto min-h-[220px]' : 'h-[210px]'} hover:border-[#FFC107]/40 transition-colors group cursor-pointer text-left ${isLight ? 'border-[#E5E4E3]' : 'border-white/10'}`}>
                        <span className="inline-block text-[11px] font-mono font-bold tracking-widest border-[0.77px] px-2 py-1 rounded mb-3 w-max"
                          style={{ color, borderColor: mixAlpha(color, 25) }}>
                          {policy.policyId}
                        </span>
                        <h3 className={`text-[15px] font-medium text-ci-text-primary ${libraryView === 'ACHC' ? 'line-clamp-2' : 'line-clamp-3'} mb-auto leading-snug group-hover:text-ci-text-primary transition-colors`}>
                          {policy.title}
                        </h3>
                        {libraryView === 'IBM' ? (
                          <div className="flex items-center gap-1.5 mt-3">
                            {regDots.slice(0, 4).map(r => (
                              <span key={r.id} className="w-1.5 h-1.5 rounded-full" style={{ background: mapColor(r.color) }} title={r.shortName}/>
                            ))}
                            {regDots.length > 4 && <span className="text-[8px] text-ci-text-subtle">+{regDots.length - 4}</span>}
                          </div>
                        ) : (
                          <div className="mt-3 pt-2.5 border-t border-[#99f6e4] space-y-1.5">
                            {/* Mapping badge + evidence codes */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {achc ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full border font-montserrat font-bold text-[9px] tracking-wider ${
                                  achc.mappingType === 'DIRECT' ? 'bg-[#0f766e]/10 text-[#0f766e] border-[#0f766e]/30' :
                                  achc.mappingType === 'PARTIAL' ? 'bg-[#ea580c]/10 text-[#ea580c] border-[#ea580c]/30' :
                                  achc.mappingType === 'SME_REVIEW' ? 'bg-amber-500/10 text-amber-700 border-amber-500/30' :
                                  'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                  {achc.mappingType}
                                </span>
                              ) : null}
                              {achc && achc.evidenceCodes.length > 0 && (
                                <span className="text-[9px] font-mono text-ci-text-subtle">{achc.evidenceCodes.join(' ')}</span>
                              )}
                            </div>
                            {/* ACHC standards list */}
                            {achc && achc.achcStandards.length > 0 ? (
                              <div className="text-[9px] text-[#0f766e] font-mono leading-snug truncate">
                                {achc.achcStandards.slice(0, 3).join(', ')}{achc.achcStandards.length > 3 ? ` +${achc.achcStandards.length - 3}` : ''}
                              </div>
                            ) : (
                              <div className="text-[9px] text-ci-text-subtle italic">No validated ACHC mapping</div>
                            )}
                            {/* Title 22 + Medicare CoP */}
                            {achc && (achc.title22.length > 0 || achc.medicareCop.length > 0) && (
                              <div className="flex gap-3 text-[8px] text-ci-text-subtle">
                                {achc.title22.length > 0 && (
                                  <span>T22: {achc.title22.slice(0, 2).join(', ')}{achc.title22.length > 2 ? ' …' : ''}</span>
                                )}
                                {achc.medicareCop.length > 0 && (
                                  <span>CoP: {achc.medicareCop.slice(0, 1).join(', ')}{achc.medicareCop.length > 1 ? ' …' : ''}</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {renderedPolicies.length === 0 && (
                    <div className="col-span-4">
                      <EmptyState
                        icon={<Search size={40} />}
                        title="No policies match criteria"
                        description="Try adjusting domain, category, regulatory filter, or search terms."
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

