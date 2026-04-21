import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShellStore } from '../stores/uiStore';
import { remapForLight } from '../utils/lightColorRemap';
import {
  Shield, Search, FileText, Building2, Users,
  DollarSign, Monitor, BarChart3, Scale, Heart, Cpu, Briefcase,
  Landmark, ShieldCheck, Gavel, ChevronLeft, Printer,
  Lock, FileCheck, Layers, Library,
  Activity, FileDigit, TrendingUp,
  AlertOctagon, Eye, UserPlus, GraduationCap, HeartHandshake,
  Clock, FileBadge, Receipt, Tags, PieChart, LogIn, Truck,
  MessageSquare, Key, DatabaseBackup, MonitorCog, Smartphone,
  BarChart2, UserCheck, Home, Siren, FolderTree, RefreshCw,
  BarChart, Network, ClipboardList, X
} from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { SharedPolicyDetailView, type SharedPolicy } from '../components/SharedPolicyDetailView';

// ══════════════════════════════════════════════════════════════
// ENTERPRISE POLICY TAXONOMY – FULL 269-POLICY DATASET
// ══════════════════════════════════════════════════════════════

const REGULATORY_ITEMS = [
  { id: 'title22', name: 'Title 22 (California)', shortName: 'Title 22', color: '#facc15', icon: Landmark },
  { id: '42cfr', name: '42 CFR Part 484', shortName: '42 CFR §484', color: '#FFC107', icon: Scale },
  { id: 'cms', name: 'CMS State Operations', shortName: 'CMS State Ops', color: '#ec4899', icon: FileCheck },
  { id: 'hipaa', name: 'HIPAA Privacy & Security', shortName: 'HIPAA', color: '#3b82f6', icon: Lock },
  { id: 'osha', name: 'OSHA / Cal-OSHA', shortName: 'OSHA', color: '#f59e0b', icon: Shield },
  { id: 'oig', name: 'OIG Compliance Guidance', shortName: 'OIG', color: '#8b5cf6', icon: ShieldCheck },
  { id: 'fca', name: 'False Claims Act', shortName: 'FCA', color: '#a855f7', icon: Gavel },
];

const DOMAINS = [
  {
    code: 'GV', name: 'GOVERNANCE', fullName: 'GV — Governance & Administration', icon: Building2, color: '#FFC107',
    subdomains: [
      { code: 'GB', name: 'Governing Body', icon: Users },
      { code: 'OG', name: 'Organization', icon: Network },
      { code: 'PM', name: 'Policy Management', icon: FileText },
      { code: 'EA', name: 'External Affairs', icon: Briefcase }
    ]
  },
  {
    code: 'CL', name: 'CLINICAL OPS', fullName: 'CL — Clinical Operations', icon: Heart, color: '#ef4444',
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
    code: 'QA', name: 'QAPI', fullName: 'QA — Quality Assessment & Performance Improvement', icon: BarChart3, color: '#06b6d4',
    subdomains: [
      { code: 'PG', name: 'QAPI Program', icon: Scale },
      { code: 'SM', name: 'Star Monitoring', icon: Eye },
      { code: 'AE', name: 'Adverse Events', icon: AlertOctagon },
      { code: 'PI', name: 'PIPs', icon: TrendingUp }
    ]
  },
  {
    code: 'HR', name: 'HUMAN RES.', fullName: 'HR — Human Resources', icon: Users, color: '#8b5cf6',
    subdomains: [
      { code: 'TA', name: 'Talent Acquisition', icon: UserPlus },
      { code: 'TD', name: 'Training & Dev', icon: GraduationCap },
      { code: 'WM', name: 'Workforce Mgmt', icon: Clock },
      { code: 'ER', name: 'Employee Relations', icon: HeartHandshake },
      { code: 'JD', name: 'Job Descriptions', icon: FileBadge }
    ]
  },
  {
    code: 'CO', name: 'COMPLIANCE', fullName: 'CO — Compliance & Regulatory', icon: Shield, color: '#3b82f6',
    subdomains: [
      { code: 'CP', name: 'Compliance Program', icon: ShieldCheck },
      { code: 'HP', name: 'HIPAA & Privacy', icon: Lock },
      { code: 'FA', name: 'Fraud & Abuse', icon: Search },
      { code: 'RA', name: 'Regulatory Affairs', icon: Scale },
      { code: 'DC', name: 'Doc Compliance', icon: FileCheck }
    ]
  },
  {
    code: 'FN', name: 'FINANCE', fullName: 'FN — Finance & Revenue Cycle', icon: DollarSign, color: '#10b981',
    subdomains: [
      { code: 'FP', name: 'Financial Planning', icon: PieChart },
      { code: 'BC', name: 'Billing & Claims', icon: Receipt },
      { code: 'CM', name: 'Coding & Classification', icon: Tags }
    ]
  },
  {
    code: 'OP', name: 'OPERATIONS', fullName: 'OP — Operations & Facilities', icon: Briefcase, color: '#f97316',
    subdomains: [
      { code: 'IM', name: 'Intake Mgmt', icon: LogIn },
      { code: 'SL', name: 'Service Logistics', icon: Truck },
      { code: 'PA', name: 'Patient Access', icon: MessageSquare },
      { code: 'FM', name: 'Facility Admin', icon: Building2 }
    ]
  },
  {
    code: 'IT', name: 'IT & SECURITY', fullName: 'IT — Information Technology & Security', icon: Monitor, color: '#6366f1',
    subdomains: [
      { code: 'SC', name: 'Security Controls', icon: Key },
      { code: 'DR', name: 'Data & Recovery', icon: DatabaseBackup },
      { code: 'SA', name: 'Systems Admin', icon: MonitorCog },
      { code: 'UP', name: 'Use Policies', icon: Smartphone }
    ]
  },
  {
    code: 'RM', name: 'RISK MGMT', fullName: 'RM — Risk Management & Safety', icon: AlertTriangle, color: '#eab308',
    subdomains: [
      { code: 'ER', name: 'Enterprise Risk', icon: BarChart2 },
      { code: 'SS', name: 'Staff Safety', icon: UserCheck },
      { code: 'PS', name: 'Patient Safety', icon: Home },
      { code: 'EP', name: 'Emergency Plan', icon: Siren }
    ]
  },
  {
    code: 'EN', name: 'ENTERPRISE', fullName: 'EN — Enterprise Governance & Control', icon: Cpu, color: '#ec4899',
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

function matchesPattern(policyId: string, patterns: string[]): boolean {
  return patterns.some(p => p.endsWith('*') ? policyId.startsWith(p.slice(0, -1)) : policyId === p);
}

function getTagsForPolicy(id: string): string[] {
  const tags: string[] = [];
  const u = id.toUpperCase();
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

interface PolicyRecord {
  id: string; policyId: string; title: string; domain: string; domainCode: string;
  subdomain: string; subdomainCode: string; classificationTier: string; status: string;
  version: string; effectiveDate: string; nextReviewDate: string; policyOwner: string;
  approvedBy: string; purpose: string; scope: string[]; regulatoryTags: string[];
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
      scope: ['All applicable personnel', 'Management'], regulatoryTags: getTagsForPolicy(fullId),
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
    scope: ['All applicable personnel'], regulatoryTags: getTagsForPolicy(p.id),
  });
});

// ══════════════════════════════════════════════════════════════
// LIBRARY PAGE — GLASS-INTERACTIVE DESIGN
// ══════════════════════════════════════════════════════════════

// ── ADAPTER: map PolicyRecord → SharedPolicy ──────────────────
function toSharedPolicy(p: PolicyRecord): SharedPolicy {
  return {
    id: p.id, policyId: p.policyId, title: p.title,
    domain: p.domain, domainCode: p.domainCode,
    subdomain: p.subdomain, subdomainCode: p.subdomainCode,
    classificationTier: p.classificationTier, status: p.status,
    version: p.version, effectiveDate: p.effectiveDate,
    nextReviewDate: p.nextReviewDate, policyOwner: p.policyOwner,
    approvedBy: p.approvedBy, purpose: p.purpose, scope: p.scope,
    regulatoryTags: p.regulatoryTags,
  };
}

export function LibraryPage() {
  const navigate = useNavigate();
  const theme = useShellStore(s => s.theme);
  const isLight = theme === 'care-indeed-light';
  const mapColor = (c: string) => remapForLight(c, isLight);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRecord | null>(null);
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>('ALL');
  const [activeRegFilter, setActiveRegFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubdomains = useMemo(() => {
    if (selectedDomain === 'ALL')
      return DOMAINS.flatMap(d => d.subdomains.map(s => ({ ...s, domainCode: d.code, domainColor: d.color })));
    const domain = DOMAINS.find(d => d.code === selectedDomain);
    return domain?.subdomains.map(s => ({ ...s, domainCode: domain.code, domainColor: domain.color })) || [];
  }, [selectedDomain]);

  const visiblePolicies = useMemo(() => {
    let p = FULL_POLICY_DATASET;
    if (selectedDomain !== 'ALL') p = p.filter(x => x.domainCode === selectedDomain);
    if (selectedSubdomain !== 'BROWSE' && selectedSubdomain !== 'ALL')
      p = p.filter(x => x.subdomainCode === selectedSubdomain);
    if (activeRegFilter !== 'ALL') p = p.filter(x => x.regulatoryTags.includes(activeRegFilter));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      p = p.filter(x => x.policyId.toLowerCase().includes(q) || x.title.toLowerCase().includes(q));
    }
    return p;
  }, [selectedDomain, selectedSubdomain, searchQuery, activeRegFilter]);

  const handleDomainSelect = (code: string) => {
    setSelectedDomain(code);
    setSelectedSubdomain('ALL');
  };

  const handleSubdomainSelect = (code: string) => {
    setSelectedSubdomain(code);
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

      {selectedPolicy ? (
        <SharedPolicyDetailView policy={toSharedPolicy(selectedPolicy)} onBack={() => setSelectedPolicy(null)} />
      ) : (
      <div className="h-full w-full font-roboto text-white flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="px-10 pt-10 pb-4 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h1 className="font-montserrat text-3xl font-light text-white flex items-center gap-4">
              <Library className="text-[#FFC107]" size={36} strokeWidth={1.5}/> Enterprise Policy Library
            </h1>
            <div className="flex items-center gap-3 mt-4 ml-1">
              <div className="glass-interactive-lib px-3 py-1.5 rounded-full border-[0.77px] border-[#FFC107]/40 flex items-center gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC107]/20 to-transparent -translate-x-full"
                  style={{animation:'shimmerLib 2.5s infinite'}}/>
                <FileText size={12} className="text-[#FFC107] animate-pulse"/>
                <span className="text-[9px] font-bold font-montserrat tracking-[0.2em] text-white">269 POLICIES</span>
              </div>
              <div className="glass-interactive-lib px-3 py-1.5 rounded-full border-[0.77px] border-[#a855f7]/40 flex items-center gap-2 relative overflow-hidden cursor-pointer"
                onClick={() => navigate('/forms')}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#a855f7]/20 to-transparent -translate-x-full"
                  style={{animation:'shimmerLib 3s infinite 0.5s'}}/>
                <Layers size={12} className="text-[#a855f7] animate-pulse"/>
                <span className="text-[9px] font-bold font-montserrat tracking-[0.2em] text-white">281 FORMS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="glass-interactive-lib flex items-center gap-3 px-4 py-2.5 rounded-full border-[0.77px] border-white/20 w-[280px]">
              <Search size={14} className="text-white/40 shrink-0"/>
              <input
                type="text"
                placeholder="Search policies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent w-full outline-none text-sm text-white placeholder:text-white/30 font-roboto"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-white/30 hover:text-white shrink-0">
                  <X size={13}/>
                </button>
              )}
            </div>

            {/* Policies / Forms toggle */}
            <div className="flex items-center p-1 rounded-full border-[0.77px] border-white/20">
              <button className="px-6 py-2 rounded-full text-[9px] font-bold tracking-widest uppercase border-[0.77px] border-[#FFC107] text-[#FFC107] font-montserrat">
                Policies
              </button>
              <button onClick={() => navigate('/forms')}
                className="px-6 py-2 rounded-full text-[9px] font-bold tracking-widest uppercase border-[0.77px] border-transparent text-white/40 hover:text-white transition-colors font-montserrat">
                Forms
              </button>
            </div>

            {/* Export */}
            <button className="glass-interactive-lib flex items-center gap-2 px-5 py-2.5 rounded-full border-[0.77px] border-white/20 text-[9px] font-bold tracking-widest uppercase text-white/60 hover:text-white transition-colors font-montserrat">
              <Printer size={13}/> Export
            </button>
          </div>
        </div>

        {/* MAIN BODY: sidebar + content */}
        <div className="flex-1 flex min-h-0">
          {/* SIDEBAR */}
          <aside className="w-[280px] px-6 py-4 shrink-0 overflow-y-auto lib-custom-scrollbar border-r border-white/[0.06]">
            {/* Regulatory Filters */}
            <h2 className="text-[8px] font-bold text-white/30 tracking-[0.2em] uppercase mb-4 pl-2 font-montserrat">Regulatory Filters</h2>
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
                      : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
                    <Icon size={10}/> {reg.shortName.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Domain Buttons */}
            <h2 className="text-[8px] font-bold text-white/30 tracking-[0.2em] uppercase mb-4 pl-2 font-montserrat">Strategic Domains</h2>
            <div className="space-y-1 pl-1">
              <button
                onClick={() => handleDomainSelect('ALL')}
                className={`glass-interactive-lib w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[9px] font-bold border-[0.77px] font-montserrat tracking-wider uppercase transition-colors text-left ${selectedDomain === 'ALL' ? 'border-white/30 text-white' : 'border-transparent text-white/40 hover:text-white hover:border-white/10'}`}>
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
                      ? { borderColor: `${dColor}60`, color: dColor, backgroundColor: `${dColor}10` }
                      : { borderColor: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
                    <Icon size={13} style={{ color: isActive ? dColor : undefined }}/> {d.name}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <section className="flex-1 flex flex-col overflow-hidden">
            {/* Top nav bar */}
            <div className="px-8 py-4 flex items-center gap-4 shrink-0 border-b border-white/[0.06]">
              {selectedSubdomain !== 'ALL' && (
                <button
                  onClick={() => setSelectedSubdomain('ALL')}
                  className="glass-interactive-lib flex items-center gap-2 px-3 py-1.5 rounded-full border-[0.77px] border-white/20 text-[9px] font-bold tracking-widest uppercase text-white/60 hover:text-white transition-colors font-montserrat">
                  <ChevronLeft size={13}/> Back
                </button>
              )}
              <div className="flex-1">
                <p className="text-[8px] text-white/30 tracking-[0.2em] uppercase font-montserrat font-bold">
                  {selectedSubdomain === 'BROWSE' || selectedSubdomain === 'ALL'
                    ? browseTitle
                    : `${selectedSubdomainObj ? `${selectedSubdomainObj.domainCode}-${selectedSubdomainObj.code} — ${selectedSubdomainObj.name}` : ''}`}
                </p>
              </div>
              {selectedSubdomain !== 'BROWSE' && (
                <button
                  onClick={() => setSelectedSubdomain('BROWSE')}
                  className="glass-interactive-lib flex items-center gap-2 px-3 py-1.5 rounded-full border-[0.77px] border-white/10 text-[9px] font-bold tracking-widest uppercase text-white/40 hover:text-white/60 transition-colors font-montserrat">
                  <FolderTree size={11}/> Categories
                </button>
              )}
              <span className="text-[9px] font-mono text-white/40">
                {selectedSubdomain === 'BROWSE'
                  ? `${filteredSubdomains.length} subdomains`
                  : `${visiblePolicies.length} policies`}
              </span>
            </div>

            {/* Grid area */}
            <div className="flex-1 overflow-y-auto lib-custom-scrollbar p-8">
              {selectedSubdomain === 'BROWSE' ? (
                /* SUBDOMAIN CARDS */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fadeUpLib">
                  {filteredSubdomains.map(sub => {
                    const SubIcon = sub.icon;
                    const count = FULL_POLICY_DATASET.filter(p => p.domainCode === sub.domainCode && p.subdomainCode === sub.code).length;
                    return (
                      <button key={`${sub.domainCode}-${sub.code}`}
                        onClick={() => {
                          if (selectedDomain === 'ALL') setSelectedDomain(sub.domainCode);
                          handleSubdomainSelect(sub.code);
                        }}
                        className="glass-interactive-lib glass-panel-lib border-[0.77px] border-white/10 p-6 rounded-2xl flex items-center gap-5 text-left hover:border-[#FFC107]/40 transition-colors group">
                        <div className="w-12 h-12 rounded-xl border-[0.77px] border-white/10 flex items-center justify-center shrink-0"
                          style={{ color: mapColor(sub.domainColor) }}>
                          <SubIcon size={20} strokeWidth={1.5}/>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-mono text-gray-500 mb-0.5">{sub.domainCode}-{sub.code}</p>
                          <p className="text-[13px] font-bold text-white uppercase font-montserrat group-hover:text-[#FFC107] transition-colors truncate">{sub.name}</p>
                          <p className="text-[9px] text-white/30 font-montserrat mt-1">{count} policies</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* POLICY CARDS */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fadeUpLib">
                  {visiblePolicies.map(policy => {
                    const domain = DOMAINS.find(d => d.code === policy.domainCode);
                    const color = mapColor(domain?.color || '#ffffff');
                    const regDots = REGULATORY_ITEMS.filter(r => policy.regulatoryTags.includes(r.id));
                    return (
                      <button key={policy.id}
                        onClick={() => setSelectedPolicy(policy)}
                        className="glass-interactive-lib glass-panel-lib border-[0.77px] border-white/10 p-6 rounded-2xl flex flex-col h-[180px] hover:border-[#FFC107]/40 transition-colors group cursor-pointer text-left">
                        <span className="inline-block text-[11px] font-mono font-bold tracking-widest border-[0.77px] px-2 py-1 rounded mb-3 w-max"
                          style={{ color, borderColor: `${color}40` }}>
                          {policy.policyId}
                        </span>
                        <h3 className="text-[15px] font-medium text-gray-200 line-clamp-3 mb-auto leading-snug group-hover:text-white transition-colors">
                          {policy.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-3">
                          {regDots.slice(0, 4).map(r => (
                            <span key={r.id} className="w-1.5 h-1.5 rounded-full" style={{ background: mapColor(r.color) }} title={r.shortName}/>
                          ))}
                          {regDots.length > 4 && <span className="text-[8px] text-white/30">+{regDots.length - 4}</span>}
                        </div>
                      </button>
                    );
                  })}
                  {visiblePolicies.length === 0 && (
                    <div className="col-span-4 text-center py-20 text-white/20">
                      <Search size={40} className="mx-auto mb-4 text-white/10"/>
                      <p className="text-lg font-light font-montserrat">No policies match criteria.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      )}
    </>
  );
}

