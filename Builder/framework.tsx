import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Shield, Search, ChevronRight, ChevronDown, ChevronLeft, X,
  AlertTriangle, CheckCircle, Clock, FileText, Building2, Users,
  Activity, Lock, DollarSign, Monitor, Zap, BarChart3, Target,
  BookOpen, Scale, Heart, Cpu, Briefcase, ArrowUpRight,
  Filter, TrendingUp, TrendingDown, Eye, Layers, GitBranch,
  AlertCircle, CheckSquare, XCircle, RefreshCw, ExternalLink,
  ChevronUp, Minus
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════
// COMPLETE ENTERPRISE POLICY DATA — REAL PRODUCTION DATA
// ══════════════════════════════════════════════════════════════

interface PolicyRecord {
  id: string;
  policyId: string;
  title: string;
  domain: string;
  domainCode: string;
  subdomain: string;
  subdomainCode: string;
  classificationTier: 'REQUIRED' | 'ESSENTIAL' | 'OPERATIONAL' | 'REFERENCE';
  status: 'ACTIVE' | 'DRAFT' | 'UNDER_REVIEW' | 'DEPRECATED';
  version: string;
  effectiveDate: string;
  nextReviewDate: string;
  policyOwner: string;
  approvedBy: string;
  cfrMapping: string[];
  purpose: string;
  scope: string[];
  linkedPolicies: string[];
  enforcementRules: string[];
  appendices: string[];
  auditDefenseUse?: string;
  clinicalEnforcementLink?: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface Regulation {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: React.ElementType;
  domains: string[];
  policyCount: number;
  coverage: number;
}

interface DomainData {
  code: string;
  name: string;
  fullName: string;
  icon: React.ElementType;
  color: string;
  accentBg: string;
  subdomains: SubdomainData[];
  riskExposure: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface SubdomainData {
  code: string;
  name: string;
  fullName: string;
}

// ── REGULATORY LAYER (LEVEL 0) ──
const REGULATIONS: Regulation[] = [
  {
    id: 'cfr484',
    name: '42 CFR Part 484',
    shortName: '42 CFR §484',
    color: '#00e59b',
    icon: Scale,
    domains: ['GV', 'CL', 'QA', 'HR', 'CO', 'FN', 'OP', 'IT', 'RM', 'EN'],
    policyCount: 187,
    coverage: 94
  },
  {
    id: 'hipaa',
    name: 'HIPAA Privacy & Security',
    shortName: 'HIPAA',
    color: '#3b82f6',
    icon: Lock,
    domains: ['CO', 'IT', 'HR', 'CL', 'OP', 'EN'],
    policyCount: 42,
    coverage: 97
  },
  {
    id: 'osha',
    name: 'OSHA / Cal-OSHA',
    shortName: 'OSHA',
    color: '#f59e0b',
    icon: Shield,
    domains: ['RM', 'HR', 'OP', 'CL'],
    policyCount: 28,
    coverage: 91
  },
  {
    id: 'oig',
    name: 'OIG Compliance Guidance',
    shortName: 'OIG',
    color: '#a855f7',
    icon: Eye,
    domains: ['CO', 'GV', 'FN', 'QA'],
    policyCount: 19,
    coverage: 88
  }
];

// ── DOMAIN LAYER (LEVEL 1) — ALL 10 DOMAINS ──
const DOMAINS: DomainData[] = [
  {
    code: 'GV',
    name: 'Governance',
    fullName: 'GV — Governance & Administration',
    icon: Building2,
    color: '#00e59b',
    accentBg: 'rgba(0,229,155,0.08)',
    riskExposure: 'LOW',
    subdomains: [
      { code: 'GB', name: 'Governing Body', fullName: 'GB — Governing Body' },
      { code: 'OG', name: 'Organization', fullName: 'OG — Organizational Structure' },
      { code: 'PM', name: 'Policy Management', fullName: 'PM — Policy Management' },
      { code: 'EA', name: 'External Affairs', fullName: 'EA — External Affairs & Licensure' }
    ]
  },
  {
    code: 'CL',
    name: 'Clinical Operations',
    fullName: 'CL — Clinical Operations',
    icon: Heart,
    color: '#ef4444',
    accentBg: 'rgba(239,68,68,0.08)',
    riskExposure: 'MEDIUM',
    subdomains: [
      { code: 'PA', name: 'Patient Assessment', fullName: 'PA — Patient Assessment' },
      { code: 'CP', name: 'Care Planning', fullName: 'CP — Care Planning & Coordination' },
      { code: 'OA', name: 'OASIS', fullName: 'OA — OASIS Assessment & Transmission' },
      { code: 'SD', name: 'Service Delivery', fullName: 'SD — Skilled Service Delivery' },
      { code: 'IC', name: 'Infection Control', fullName: 'IC — Infection Prevention & Control' },
      { code: 'DC', name: 'Discharge', fullName: 'DC — Discharge & Transfer' }
    ]
  },
  {
    code: 'QA',
    name: 'QAPI',
    fullName: 'QA — Quality Assessment & Performance Improvement',
    icon: BarChart3,
    color: '#06b6d4',
    accentBg: 'rgba(6,182,212,0.08)',
    riskExposure: 'LOW',
    subdomains: [
      { code: 'PG', name: 'QAPI Program', fullName: 'PG — QAPI Program Governance' },
      { code: 'SM', name: 'Star Monitoring', fullName: 'SM — Star Rating & HH Compare' },
      { code: 'AE', name: 'Adverse Events', fullName: 'AE — Adverse Event & Corrective Action' },
      { code: 'PI', name: 'PIPs', fullName: 'PI — Performance Improvement Projects' }
    ]
  },
  {
    code: 'HR',
    name: 'Human Resources',
    fullName: 'HR — Human Resources',
    icon: Users,
    color: '#8b5cf6',
    accentBg: 'rgba(139,92,246,0.08)',
    riskExposure: 'MEDIUM',
    subdomains: [
      { code: 'TA', name: 'Talent Acquisition', fullName: 'TA — Talent Acquisition & Screening' },
      { code: 'TD', name: 'Training & Dev', fullName: 'TD — Training & Development' },
      { code: 'WM', name: 'Workforce Mgmt', fullName: 'WM — Workforce Management' },
      { code: 'ER', name: 'Employee Relations', fullName: 'ER — Employee Relations' }
    ]
  },
  {
    code: 'CO',
    name: 'Compliance',
    fullName: 'CO — Compliance & Regulatory',
    icon: Shield,
    color: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.08)',
    riskExposure: 'HIGH',
    subdomains: [
      { code: 'CP', name: 'Compliance Program', fullName: 'CP — Corporate Compliance Program' },
      { code: 'HP', name: 'HIPAA & Privacy', fullName: 'HP — HIPAA & Privacy' },
      { code: 'FA', name: 'Fraud & Abuse', fullName: 'FA — Fraud & Abuse Prevention' },
      { code: 'DC', name: 'Doc Compliance', fullName: 'DC — Documentation Compliance' }
    ]
  },
  {
    code: 'FN',
    name: 'Finance',
    fullName: 'FN — Finance & Revenue Cycle',
    icon: DollarSign,
    color: '#10b981',
    accentBg: 'rgba(16,185,129,0.08)',
    riskExposure: 'MEDIUM',
    subdomains: [
      { code: 'FP', name: 'Financial Planning', fullName: 'FP — Financial Planning & Budgeting' },
      { code: 'RC', name: 'Revenue Cycle', fullName: 'RC — Revenue Cycle Management' },
      { code: 'BL', name: 'Billing', fullName: 'BL — Billing & Claims' }
    ]
  },
  {
    code: 'OP',
    name: 'Operations',
    fullName: 'OP — Operations & Facilities',
    icon: Briefcase,
    color: '#f97316',
    accentBg: 'rgba(249,115,22,0.08)',
    riskExposure: 'LOW',
    subdomains: [
      { code: 'FM', name: 'Facilities', fullName: 'FM — Facilities & Emergency Preparedness' },
      { code: 'SM', name: 'Supply Mgmt', fullName: 'SM — Supply & Equipment Management' },
      { code: 'RC', name: 'Records', fullName: 'RC — Records Management' }
    ]
  },
  {
    code: 'IT',
    name: 'IT & Security',
    fullName: 'IT — Information Technology & Security',
    icon: Monitor,
    color: '#6366f1',
    accentBg: 'rgba(99,102,241,0.08)',
    riskExposure: 'HIGH',
    subdomains: [
      { code: 'SP', name: 'Security Program', fullName: 'SP — Security Program' },
      { code: 'AC', name: 'Access Control', fullName: 'AC — Access Control & Authentication' },
      { code: 'NW', name: 'Network', fullName: 'NW — Network & Infrastructure' },
      { code: 'BC', name: 'Backup/DR', fullName: 'BC — Backup & Disaster Recovery' }
    ]
  },
  {
    code: 'RM',
    name: 'Risk Management',
    fullName: 'RM — Risk Management & Safety',
    icon: AlertTriangle,
    color: '#eab308',
    accentBg: 'rgba(234,179,8,0.08)',
    riskExposure: 'MEDIUM',
    subdomains: [
      { code: 'RA', name: 'Risk Assessment', fullName: 'RA — Risk Assessment & Mitigation' },
      { code: 'SS', name: 'Staff Safety', fullName: 'SS — Staff Safety' },
      { code: 'PS', name: 'Patient Safety', fullName: 'PS — Patient Safety' },
      { code: 'LI', name: 'Liability', fullName: 'LI — Liability & Insurance' }
    ]
  },
  {
    code: 'EN',
    name: 'Enterprise Control',
    fullName: 'EN — Enterprise Governance & Control',
    icon: Cpu,
    color: '#ec4899',
    accentBg: 'rgba(236,72,153,0.08)',
    riskExposure: 'LOW',
    subdomains: [
      { code: 'TG', name: 'Taxonomy', fullName: 'TG — Taxonomy & Classification Governance' },
      { code: 'LC', name: 'Lifecycle', fullName: 'LC — Policy Lifecycle Management' },
      { code: 'AI', name: 'AI Governance', fullName: 'AI — AI & Automation Governance' }
    ]
  }
];

// ── COMPLETE POLICY DATABASE — 230+ POLICIES (Real production data) ──
const ALL_POLICIES: PolicyRecord[] = [
  // ══ GV — GOVERNANCE & ADMINISTRATION ══
  {
    id: 'gv-gb-001', policyId: 'GV-GB-001', title: 'Governing Body Authority & Responsibilities',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'GB — Governing Body', subdomainCode: 'GB',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '6.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Governing Body Chair', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105', '42 CFR § 484.105(a)', '42 CFR § 484.2'],
    purpose: 'Establishes the authority, composition, functions, and oversight responsibilities of the Governing Body.',
    scope: ['All Governing Body members', 'Agency Administrator', 'Director of Nursing / Clinical Manager', 'Compliance Officer', 'All senior leadership'],
    linkedPolicies: ['GV-OG-001', 'GV-OG-002', 'GV-OG-003', 'GV-PM-001', 'GV-PM-002', 'GV-GB-002', 'GV-GB-003', 'GV-GB-004', 'GV-EA-004', 'QA-PG-002', 'CO-CP-001', 'FN-FP-005', 'OP-FM-005'],
    enforcementRules: ['Governing Body must meet quarterly (min 4x/year)', 'Key personnel appointed within 30 days of vacancy', 'OIG/SAM screening at appointment and monthly', 'Conflict of interest disclosures at appointment and annually'],
    appendices: ['Appendix A: Membership Roster', 'Appendix B: Conflict of Interest Form', 'Appendix C: Policy Acknowledgment', 'Appendix D: Meeting Minutes Template', 'Appendix E: Quarterly Oversight Checklist', 'Appendix F: Annual Calendar', 'Appendix G: Org Chart'],
    auditDefenseUse: 'Primary survey defense for 42 CFR § 484.105 Condition-level requirements',
    clinicalEnforcementLink: 'Governs appointment of Clinical Manager per § 484.105(c)',
    riskLevel: 'HIGH'
  },
  {
    id: 'gv-gb-002', policyId: 'GV-GB-002', title: 'Board Meeting & Minutes Requirements',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'GB — Governing Body', subdomainCode: 'GB',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Governing Body Chair', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(a)'],
    purpose: 'Establishes documentation standards for all Governing Body meetings.',
    scope: ['Governing Body members', 'Designated Secretary', 'Administrator'],
    linkedPolicies: ['GV-GB-001', 'GV-GB-003'],
    enforcementRules: ['Draft minutes within 14 calendar days', 'Minutes retained minimum 7 years', 'Quorum documented at each meeting'],
    appendices: ['Meeting Minutes Template'],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'gv-gb-003', policyId: 'GV-GB-003', title: 'Conflict of Interest Disclosure',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'GB — Governing Body', subdomainCode: 'GB',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(a)', 'OIG Compliance Guidance'],
    purpose: 'Governs conflict of interest disclosure and management for Governing Body members.',
    scope: ['All Governing Body members'],
    linkedPolicies: ['GV-GB-001', 'CO-CP-001'],
    enforcementRules: ['Disclosure at appointment', 'Annual renewal', 'Within 7 days of change', 'Recusal from conflicted votes'],
    appendices: ['Conflict of Interest Disclosure Form'],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'gv-gb-004', policyId: 'GV-GB-004', title: 'Succession Planning for Key Leadership',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'GB — Governing Body', subdomainCode: 'GB',
    classificationTier: 'ESSENTIAL', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Governing Body Chair', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(b)'],
    purpose: 'Establishes succession planning for Administrator, Clinical Manager, and Compliance Officer.',
    scope: ['Governing Body', 'Administrator', 'Clinical Manager', 'Compliance Officer'],
    linkedPolicies: ['GV-GB-001', 'GV-OG-002'],
    enforcementRules: ['Reviewed annually at Q2 meeting', 'Updated within 14 days of vacancy'],
    appendices: [],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'gv-gb-005', policyId: 'GV-GB-005', title: 'Annual Governance Self-Assessment',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'GB — Governing Body', subdomainCode: 'GB',
    classificationTier: 'OPERATIONAL', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Governing Body Chair', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105'],
    purpose: 'Self-assessment tool for annual governance effectiveness review.',
    scope: ['Governing Body members'],
    linkedPolicies: ['GV-GB-001'],
    enforcementRules: ['Completed annually'],
    appendices: ['Self-Assessment Form'],
    riskLevel: 'LOW'
  },
  {
    id: 'gv-og-001', policyId: 'GV-OG-001', title: 'Organizational Structure & Reporting',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'OG — Organizational Structure', subdomainCode: 'OG',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105'],
    purpose: 'Defines the organizational structure and reporting relationships.',
    scope: ['All personnel'],
    linkedPolicies: ['GV-GB-001', 'GV-OG-002'],
    enforcementRules: ['Org chart approved annually by Governing Body', 'Updated within 30 days of structural changes'],
    appendices: ['Organizational Chart'],
    riskLevel: 'LOW'
  },
  {
    id: 'gv-og-002', policyId: 'GV-OG-002', title: 'Administrator Qualifications & Responsibilities',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'OG — Organizational Structure', subdomainCode: 'OG',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Governing Body Chair', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(b)'],
    purpose: 'Defines Administrator qualifications and responsibilities per CMS and California requirements.',
    scope: ['Administrator', 'Governing Body'],
    linkedPolicies: ['GV-GB-001', 'GV-OG-001'],
    enforcementRules: ['Qualifications verified at appointment', 'Annual performance evaluation'],
    appendices: [],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'gv-og-003', policyId: 'GV-OG-003', title: 'Scope of Services Definition',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'OG — Organizational Structure', subdomainCode: 'OG',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(a)'],
    purpose: 'Defines the approved scope of services the agency is licensed, staffed, and competent to deliver.',
    scope: ['All personnel'],
    linkedPolicies: ['GV-GB-001'],
    enforcementRules: ['Approved annually by Governing Body', 'No services beyond scope'],
    appendices: ['Scope of Services Matrix'],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'gv-og-004', policyId: 'GV-OG-004', title: 'Strategic Planning & Annual Goals',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'OG — Organizational Structure', subdomainCode: 'OG',
    classificationTier: 'ESSENTIAL', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105'],
    purpose: 'Governs strategic planning process and annual goal setting.',
    scope: ['Governing Body', 'Administrator', 'Senior Leadership'],
    linkedPolicies: ['GV-GB-001'],
    enforcementRules: ['Strategic plan reviewed annually'],
    appendices: [],
    riskLevel: 'LOW'
  },
  {
    id: 'gv-og-005', policyId: 'GV-OG-005', title: 'Delegation of Authority',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'OG — Organizational Structure', subdomainCode: 'OG',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(a)'],
    purpose: 'Governs limits of authority delegation from the Governing Body.',
    scope: ['Governing Body', 'Administrator', 'All delegated personnel'],
    linkedPolicies: ['GV-GB-001', 'GV-OG-001'],
    enforcementRules: ['Ultimate accountability cannot be delegated', 'All delegations documented'],
    appendices: ['Delegation Matrix'],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'gv-pm-001', policyId: 'GV-PM-001', title: 'Policy Development & Approval Process',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'PM — Policy Management', subdomainCode: 'PM',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(a)'],
    purpose: 'Defines the process for developing, reviewing, and approving agency policies.',
    scope: ['All policy authors', 'Governing Body', 'Administrator'],
    linkedPolicies: ['GV-GB-001', 'GV-PM-002', 'GV-PM-003', 'EN-TG-001'],
    enforcementRules: ['REQUIRED policies approved by Governing Body', 'Standard template required'],
    appendices: ['Policy Template'],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'gv-pm-002', policyId: 'GV-PM-002', title: 'Policy Review & Revision Cycle',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'PM — Policy Management', subdomainCode: 'PM',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(a)'],
    purpose: 'Establishes the mandatory policy review cycle and revision process.',
    scope: ['All policy owners', 'Administrator'],
    linkedPolicies: ['GV-GB-001', 'GV-PM-001'],
    enforcementRules: ['Annual review cycle minimum', 'REQUIRED policies reviewed by Governing Body'],
    appendices: [],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'gv-pm-003', policyId: 'GV-PM-003', title: 'Policy Acknowledgment & Staff Attestation',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'PM — Policy Management', subdomainCode: 'PM',
    classificationTier: 'ESSENTIAL', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105'],
    purpose: 'Governs staff acknowledgment and attestation requirements for all policies.',
    scope: ['All personnel'],
    linkedPolicies: ['GV-PM-001', 'HR-TR-101'],
    enforcementRules: ['Acknowledgment within 14 calendar days', '100% completion tracked'],
    appendices: ['Acknowledgment Form'],
    riskLevel: 'LOW'
  },
  {
    id: 'gv-ea-004', policyId: 'GV-EA-004', title: 'Agency Licensure & Certification Maintenance',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'EA — External Affairs & Licensure', subdomainCode: 'EA',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.100'],
    purpose: 'Ensures the agency maintains current licenses and certifications at all times.',
    scope: ['Administrator', 'Governing Body'],
    linkedPolicies: ['GV-GB-001'],
    enforcementRules: ['HCAI License No. 406412878 maintained', 'Medicare certification current', 'Verified at each quarterly meeting'],
    appendices: ['Licensure Tracking Matrix'],
    riskLevel: 'HIGH'
  },
  {
    id: 'gv-ea-005', policyId: 'GV-EA-005', title: 'Agency Closure or Change of Ownership',
    domain: 'GV — Governance & Administration', domainCode: 'GV',
    subdomain: 'EA — External Affairs & Licensure', subdomainCode: 'EA',
    classificationTier: 'ESSENTIAL', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.100'],
    purpose: 'Governs the process for agency closure or change of ownership (CHOW).',
    scope: ['Governing Body', 'Administrator'],
    linkedPolicies: ['GV-GB-001'],
    enforcementRules: ['CMS notification per requirements', 'Patient transfer plan required'],
    appendices: [],
    riskLevel: 'MEDIUM'
  },
  // ══ CL — CLINICAL OPERATIONS ══
  {
    id: 'cl-pa-001', policyId: 'CL-PA-001', title: 'Comprehensive Patient Assessment',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'PA — Patient Assessment', subdomainCode: 'PA',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.55'],
    purpose: 'Establishes comprehensive assessment requirements for all patients.',
    scope: ['All clinical staff', 'Clinical Manager'],
    linkedPolicies: ['CL-OA-001', 'CL-CP-001'],
    enforcementRules: ['Initial assessment within 48 hours of referral/transfer or SOC date', 'Reassessment per OASIS timepoints'],
    appendices: ['Assessment Checklist'],
    clinicalEnforcementLink: 'Enforced by Clinical Enforcement Engine — OASIS timepoint validation',
    riskLevel: 'HIGH'
  },
  {
    id: 'cl-pa-002', policyId: 'CL-PA-002', title: 'Patient Rights & Informed Consent',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'PA — Patient Assessment', subdomainCode: 'PA',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.50'],
    purpose: 'Ensures patients receive and understand their rights and provide informed consent.',
    scope: ['All clinical and intake staff'],
    linkedPolicies: ['CL-PA-001'],
    enforcementRules: ['Rights provided at SOC', 'Consent documented in clinical record', 'Patient/representative signs acknowledgment'],
    appendices: ['Patient Rights Document', 'Informed Consent Form'],
    riskLevel: 'HIGH'
  },
  {
    id: 'cl-cp-001', policyId: 'CL-CP-001', title: 'Plan of Care Development & Updates',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'CP — Care Planning & Coordination', subdomainCode: 'CP',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.60'],
    purpose: 'Establishes requirements for individualized plan of care development, physician review, and updates.',
    scope: ['All clinical staff', 'Physicians'],
    linkedPolicies: ['CL-PA-001', 'CL-OA-001', 'CL-SD-001'],
    enforcementRules: ['POC established within 5 days of SOC', 'Physician signature within 30 days', 'Updated at recertification and with significant change'],
    appendices: ['POC Template'],
    clinicalEnforcementLink: 'Triggers CL-OA-006 OASIS transmission logic on POC completion',
    riskLevel: 'HIGH'
  },
  {
    id: 'cl-cp-002', policyId: 'CL-CP-002', title: 'Care Coordination & Communication',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'CP — Care Planning & Coordination', subdomainCode: 'CP',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.60(b)', '42 CFR § 484.60(c)'],
    purpose: 'Ensures coordinated care delivery and communication among all providers.',
    scope: ['All clinical staff'],
    linkedPolicies: ['CL-CP-001', 'CL-DC-001'],
    enforcementRules: ['Written physician orders before service delivery', 'Verbal orders signed within required timeframes'],
    appendices: [],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'cl-oa-001', policyId: 'CL-OA-001', title: 'OASIS Data Collection & Accuracy',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'OA — OASIS Assessment & Transmission', subdomainCode: 'OA',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.55(b)', '42 CFR § 484.55(d)'],
    purpose: 'Ensures accurate and timely OASIS data collection at all required timepoints.',
    scope: ['RN assessors', 'Clinical Manager', 'QA Designee'],
    linkedPolicies: ['CL-PA-001', 'CL-OA-006', 'QA-SM-004'],
    enforcementRules: ['OASIS completed at all required timepoints', 'Data accuracy validated per QA process', 'Corrections through OASIS correction process only'],
    appendices: ['OASIS Timepoint Reference'],
    clinicalEnforcementLink: 'Core enforcement logic — triggers CL-OA-006 transmission',
    riskLevel: 'HIGH'
  },
  {
    id: 'cl-oa-006', policyId: 'CL-OA-006', title: 'OASIS Transmission & Compliance',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'OA — OASIS Assessment & Transmission', subdomainCode: 'OA',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.55(d)'],
    purpose: 'Governs OASIS data transmission within CMS-required timeframes.',
    scope: ['Clinical Manager', 'QA Designee', 'IT Administrator'],
    linkedPolicies: ['CL-OA-001', 'QA-SM-004'],
    enforcementRules: ['Transmission within 30 days of assessment completion', 'Rejection resolution within 7 business days', 'Monthly compliance monitoring'],
    appendices: [],
    clinicalEnforcementLink: 'Primary Clinical Enforcement Engine target — automated transmission monitoring',
    riskLevel: 'HIGH'
  },
  {
    id: 'cl-sd-001', policyId: 'CL-SD-001', title: 'Skilled Nursing Service Delivery',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'SD — Skilled Service Delivery', subdomainCode: 'SD',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.75'],
    purpose: 'Establishes standards for skilled nursing service delivery.',
    scope: ['All RN/LVN staff'],
    linkedPolicies: ['CL-CP-001', 'CL-PA-001'],
    enforcementRules: ['Services per physician orders and POC', 'Documentation within 24 hours', 'Supervision per California requirements'],
    appendices: [],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'cl-sd-002', policyId: 'CL-SD-002', title: 'Therapy Service Delivery (PT/OT/ST)',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'SD — Skilled Service Delivery', subdomainCode: 'SD',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.75'],
    purpose: 'Standards for physical therapy, occupational therapy, and speech-language pathology services.',
    scope: ['All therapy staff (PT, PTA, OT, COTA, SLP)'],
    linkedPolicies: ['CL-CP-001', 'CL-SD-001'],
    enforcementRules: ['Therapy services per POC', 'Reassessment at recertification', 'Supervision of assistants per state law'],
    appendices: [],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'cl-sd-003', policyId: 'CL-SD-003', title: 'Home Health Aide Services & Supervision',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'SD — Skilled Service Delivery', subdomainCode: 'SD',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.80'],
    purpose: 'Governs HHA service delivery, competency, and supervisory requirements.',
    scope: ['All HHAs', 'RN supervisors', 'Clinical Manager'],
    linkedPolicies: ['CL-CP-001', 'HR-TA-001'],
    enforcementRules: ['RN supervision every 14 days', 'Competency evaluation every 12 months', 'Written care plan for each patient'],
    appendices: ['HHA Supervisory Visit Form', 'Competency Checklist'],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'cl-sd-004', policyId: 'CL-SD-004', title: 'Medical Social Work Services',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'SD — Skilled Service Delivery', subdomainCode: 'SD',
    classificationTier: 'ESSENTIAL', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.75'],
    purpose: 'Standards for medical social work service delivery.',
    scope: ['MSW staff', 'Clinical Manager'],
    linkedPolicies: ['CL-CP-001'],
    enforcementRules: ['Services per POC and physician order'],
    appendices: [],
    riskLevel: 'LOW'
  },
  {
    id: 'cl-ic-001', policyId: 'CL-IC-001', title: 'Infection Prevention & Control Program',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'IC — Infection Prevention & Control', subdomainCode: 'IC',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.70'],
    purpose: 'Establishes the agency\'s infection prevention and control program.',
    scope: ['All clinical and administrative staff'],
    linkedPolicies: ['CL-IC-002', 'RM-OS-101'],
    enforcementRules: ['Standard precautions for all patient encounters', 'Hand hygiene compliance monitored', 'Infection surveillance tracking'],
    appendices: ['Infection Control Checklist'],
    riskLevel: 'HIGH'
  },
  {
    id: 'cl-ic-002', policyId: 'CL-IC-002', title: 'PPE & Standard Precautions',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'IC — Infection Prevention & Control', subdomainCode: 'IC',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.70'],
    purpose: 'Governs PPE use and standard precautions for all clinical encounters.',
    scope: ['All clinical staff'],
    linkedPolicies: ['CL-IC-001', 'RM-OS-101'],
    enforcementRules: ['PPE available for all field staff', 'Selection per transmission type'],
    appendices: ['PPE Selection Guide'],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'cl-dc-001', policyId: 'CL-DC-001', title: 'Patient Discharge & Transfer Planning',
    domain: 'CL — Clinical Operations', domainCode: 'CL',
    subdomain: 'DC — Discharge & Transfer', subdomainCode: 'DC',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.58'],
    purpose: 'Establishes discharge and transfer planning requirements.',
    scope: ['All clinical staff'],
    linkedPolicies: ['CL-CP-001', 'CL-OA-001'],
    enforcementRules: ['Discharge planning begins at admission', 'Discharge OASIS completed', 'Transfer summary to receiving facility'],
    appendices: ['Discharge Summary Template'],
    riskLevel: 'MEDIUM'
  },
  // ══ QA — QUALITY ASSESSMENT & PERFORMANCE IMPROVEMENT ══
  {
    id: 'qa-pg-001', policyId: 'QA-PG-001', title: 'QAPI Program Establishment & Governance',
    domain: 'QA — Quality Assessment & Performance Improvement', domainCode: 'QA',
    subdomain: 'PG — QAPI Program Governance', subdomainCode: 'PG',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.65'],
    purpose: 'Establishes the agency\'s QAPI program structure and governance.',
    scope: ['Governing Body', 'Administrator', 'Clinical Manager', 'QA Designee', 'All staff'],
    linkedPolicies: ['GV-GB-001', 'QA-PG-002', 'QA-AE-003'],
    enforcementRules: ['QAPI program operational at all times', 'Governing Body oversight required'],
    appendices: ['QAPI Program Charter'],
    riskLevel: 'HIGH'
  },
  {
    id: 'qa-pg-002', policyId: 'QA-PG-002', title: 'QAPI Plan Development & Annual Review',
    domain: 'QA — Quality Assessment & Performance Improvement', domainCode: 'QA',
    subdomain: 'PG — QAPI Program Governance', subdomainCode: 'PG',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.65'],
    purpose: 'Governs annual QAPI plan development and Governing Body approval.',
    scope: ['Clinical Manager', 'QA Designee', 'Governing Body'],
    linkedPolicies: ['GV-GB-001', 'QA-PG-001'],
    enforcementRules: ['Annual plan approved at Q1 Governing Body meeting', 'Measurable quality indicators required'],
    appendices: ['QAPI Plan Template'],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'qa-sm-004', policyId: 'QA-SM-004', title: 'Home Health Compare & Star Rating Monitoring',
    domain: 'QA — Quality Assessment & Performance Improvement', domainCode: 'QA',
    subdomain: 'SM — Star Rating & HH Compare', subdomainCode: 'SM',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.65'],
    purpose: 'Monitors Home Health Compare and Star Rating data for quality improvement.',
    scope: ['Clinical Manager', 'QA Designee', 'Governing Body'],
    linkedPolicies: ['QA-PG-001', 'CL-OA-001', 'GV-GB-001'],
    enforcementRules: ['Quarterly reporting to Governing Body', 'Action required if Star Rating drops below 3.5'],
    appendices: [],
    auditDefenseUse: 'Used in Audit Defense — Star Rating trending evidence',
    riskLevel: 'MEDIUM'
  },
  {
    id: 'qa-ae-003', policyId: 'QA-AE-003', title: 'Corrective Action Plan Development & Tracking',
    domain: 'QA — Quality Assessment & Performance Improvement', domainCode: 'QA',
    subdomain: 'AE — Adverse Event & Corrective Action', subdomainCode: 'AE',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.65'],
    purpose: 'Governs development, implementation, and tracking of corrective action plans.',
    scope: ['All department heads', 'Clinical Manager', 'Administrator'],
    linkedPolicies: ['QA-PG-001', 'GV-GB-001'],
    enforcementRules: ['CAP required for all deficiencies', 'Tracking until resolution', 'Governing Body notified of high-risk items'],
    appendices: ['CAP Template', 'Tracking Log'],
    riskLevel: 'MEDIUM'
  },
  // ══ CO — COMPLIANCE & REGULATORY (from CMS data) ══
  {
    id: 'co-cp-001', policyId: 'CO-CP-001', title: 'Corporate Compliance Program',
    domain: 'CO — Compliance & Regulatory', domainCode: 'CO',
    subdomain: 'CP — Corporate Compliance Program', subdomainCode: 'CP',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.100', 'OIG Compliance Guidance'],
    purpose: 'Establishes the agency\'s corporate compliance program.',
    scope: ['All personnel', 'Governing Body'],
    linkedPolicies: ['GV-GB-001', 'CO-CP-002', 'CO-CP-005', 'CO-CP-007'],
    enforcementRules: ['Compliance program operational at all times', 'Governing Body oversight required', 'Annual compliance risk assessment'],
    appendices: ['Compliance Program Charter'],
    riskLevel: 'HIGH'
  },
  {
    id: 'co-cp-002', policyId: 'CO-CP-002', title: 'Compliance Officer Designation & Authority',
    domain: 'CO — Compliance & Regulatory', domainCode: 'CO',
    subdomain: 'CP — Corporate Compliance Program', subdomainCode: 'CP',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Governing Body Chair', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['OIG Compliance Guidance'],
    purpose: 'Defines Compliance Officer designation, authority, and independence.',
    scope: ['Compliance Officer', 'Governing Body'],
    linkedPolicies: ['GV-GB-001', 'CO-CP-001'],
    enforcementRules: ['Direct access to Governing Body', 'Independence from management interference'],
    appendices: [],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'co-cp-005', policyId: 'CO-CP-005', title: 'Whistleblower Protection & Non-Retaliation',
    domain: 'CO — Compliance & Regulatory', domainCode: 'CO',
    subdomain: 'CP — Corporate Compliance Program', subdomainCode: 'CP',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['OIG Compliance Guidance'],
    purpose: 'Ensures non-retaliation protections for compliance reporters.',
    scope: ['All personnel'],
    linkedPolicies: ['CO-CP-001', 'CO-CP-007'],
    enforcementRules: ['Zero tolerance for retaliation', 'Anonymous reporting channel available'],
    appendices: [],
    riskLevel: 'HIGH'
  },
  {
    id: 'co-cp-007', policyId: 'CO-CP-007', title: 'Compliance Investigation Process',
    domain: 'CO — Compliance & Regulatory', domainCode: 'CO',
    subdomain: 'CP — Corporate Compliance Program', subdomainCode: 'CP',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['OIG Compliance Guidance'],
    purpose: 'Governs internal compliance investigation procedures.',
    scope: ['Compliance Officer', 'Governing Body', 'All personnel'],
    linkedPolicies: ['CO-CP-001', 'CO-CP-005', 'GV-GB-001'],
    enforcementRules: ['Investigation within 7 calendar days', 'Governing Body status updates at each meeting'],
    appendices: ['Investigation Checklist'],
    riskLevel: 'HIGH'
  },
  {
    id: 'co-hp-101', policyId: 'CO-HP-101', title: 'HIPAA, CMIA & Sensitive Data Privacy Management',
    domain: 'CO — Compliance & Regulatory', domainCode: 'CO',
    subdomain: 'HP — HIPAA & Privacy', subdomainCode: 'HP',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['HIPAA Privacy Rule', 'CA Civil Code § 56 (CMIA)'],
    purpose: 'Comprehensive HIPAA Privacy Rule and CMIA compliance.',
    scope: ['All personnel'],
    linkedPolicies: ['CO-BA-101', 'CO-IR-101', 'CO-DG-101'],
    enforcementRules: ['Minimum necessary standard enforced', 'NPP distributed at first contact', 'Patient rights honored within required timeframes'],
    appendices: ['NPP Template', 'Authorization Form', 'Patient Rights Acknowledgment'],
    riskLevel: 'HIGH'
  },
  {
    id: 'co-ba-101', policyId: 'CO-BA-101', title: 'Business Associate & Vendor PHI Management',
    domain: 'CO — Compliance & Regulatory', domainCode: 'CO',
    subdomain: 'HP — HIPAA & Privacy', subdomainCode: 'HP',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['HIPAA Privacy Rule', 'HIPAA Security Rule'],
    purpose: 'Governs BAA requirements and vendor PHI management.',
    scope: ['Compliance Officer', 'Administrator', 'All department heads'],
    linkedPolicies: ['CO-HP-101'],
    enforcementRules: ['BAA before any PHI access', 'Vendor risk classification (Tier 1/2/3)', 'Annual BAA audit'],
    appendices: ['BAA Template', 'Vendor Risk Matrix'],
    riskLevel: 'HIGH'
  },
  {
    id: 'co-ir-101', policyId: 'CO-IR-101', title: 'Security Incident Response & Breach Notification',
    domain: 'CO — Compliance & Regulatory', domainCode: 'CO',
    subdomain: 'HP — HIPAA & Privacy', subdomainCode: 'HP',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['HIPAA Breach Notification Rule', 'CA Civil Code § 1798.82'],
    purpose: 'Governs incident classification, investigation, and breach notification.',
    scope: ['All personnel', 'IT Administrator', 'Compliance Officer'],
    linkedPolicies: ['CO-HP-101', 'IT-SP-001'],
    enforcementRules: ['Incident classification within 24 hours', 'HIPAA 4-factor analysis', 'CA notification within statutory timeframes'],
    appendices: ['Incident Report Form', 'Breach Assessment Worksheet'],
    riskLevel: 'HIGH'
  },
  {
    id: 'co-dg-101', policyId: 'CO-DG-101', title: 'Data Governance & Minimum Necessary Enforcement',
    domain: 'CO — Compliance & Regulatory', domainCode: 'CO',
    subdomain: 'HP — HIPAA & Privacy', subdomainCode: 'HP',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['HIPAA Privacy Rule'],
    purpose: 'PHI lifecycle management and minimum necessary enforcement.',
    scope: ['All personnel'],
    linkedPolicies: ['CO-HP-101'],
    enforcementRules: ['Role-based access profiles', 'Export/download controls', 'Shadow system prevention'],
    appendices: [],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'co-fw-101', policyId: 'CO-FW-101', title: 'Fraud, Waste & Abuse Prevention (Comprehensive)',
    domain: 'CO — Compliance & Regulatory', domainCode: 'CO',
    subdomain: 'FA — Fraud & Abuse Prevention', subdomainCode: 'FA',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['False Claims Act', 'Anti-Kickback Statute', 'Stark Law', 'OIG Guidance'],
    purpose: 'Comprehensive FWA prevention, detection, and response.',
    scope: ['All personnel'],
    linkedPolicies: ['CO-CP-001', 'CO-CP-005', 'CO-CP-007'],
    enforcementRules: ['FCA alignment', '60-day repayment rule', 'Self-disclosure protocol'],
    appendices: ['FWA Reporting Form'],
    riskLevel: 'HIGH'
  },
  {
    id: 'co-ai-101', policyId: 'CO-AI-101', title: 'AI & Automated Systems Governance',
    domain: 'CO — Compliance & Regulatory', domainCode: 'CO',
    subdomain: 'DC — Documentation Compliance', subdomainCode: 'DC',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['HIPAA Security Rule'],
    purpose: 'Governs AI and automated systems use in the agency.',
    scope: ['All personnel', 'IT Administrator'],
    linkedPolicies: ['CO-HP-101', 'IT-SP-001', 'EN-AI-001'],
    enforcementRules: ['No autonomous clinical decisions', 'Human validation required', 'No fabricated documentation', 'AI Systems Registry maintained'],
    appendices: ['AI Systems Registry Template'],
    riskLevel: 'HIGH'
  },
  {
    id: 'co-hp-007', policyId: 'CO-HP-007', title: 'Record Retention & Destruction',
    domain: 'CO — Compliance & Regulatory', domainCode: 'CO',
    subdomain: 'DC — Documentation Compliance', subdomainCode: 'DC',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Compliance Officer', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.110'],
    purpose: 'Governs record retention schedules and secure destruction.',
    scope: ['All personnel', 'IT Administrator'],
    linkedPolicies: ['GV-GB-001'],
    enforcementRules: ['Minimum 7-year retention for governance records', 'Secure destruction methods', 'Destruction log maintained'],
    appendices: ['Retention Schedule'],
    riskLevel: 'MEDIUM'
  },
  // ══ HR — HUMAN RESOURCES ══
  {
    id: 'hr-ta-001', policyId: 'HR-TA-001', title: 'Personnel Qualifications & Credentialing',
    domain: 'HR — Human Resources', domainCode: 'HR',
    subdomain: 'TA — Talent Acquisition & Screening', subdomainCode: 'TA',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'HR Director', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.115'],
    purpose: 'Ensures all personnel meet qualification and credentialing requirements.',
    scope: ['All clinical and non-clinical staff', 'HR Department'],
    linkedPolicies: ['HR-TA-003', 'CL-SD-003'],
    enforcementRules: ['Credentials verified before patient contact', 'License renewal tracked', 'Background checks per CA law'],
    appendices: ['Credentialing Checklist'],
    riskLevel: 'HIGH'
  },
  {
    id: 'hr-ta-003', policyId: 'HR-TA-003', title: 'OIG/SAM Exclusion Screening',
    domain: 'HR — Human Resources', domainCode: 'HR',
    subdomain: 'TA — Talent Acquisition & Screening', subdomainCode: 'TA',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'HR Director', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.100', 'OIG Guidance'],
    purpose: 'Governs OIG LEIE and SAM exclusion screening for all personnel and Governing Body members.',
    scope: ['All personnel', 'Governing Body members', 'Contractors'],
    linkedPolicies: ['GV-GB-001', 'HR-TA-001'],
    enforcementRules: ['Pre-hire screening required', 'Monthly rescreening for all active personnel', 'Immediate removal upon exclusion finding'],
    appendices: ['Screening Log Template'],
    riskLevel: 'HIGH'
  },
  {
    id: 'hr-tr-101', policyId: 'HR-TR-101', title: 'Workforce Training, Competency & Policy Acknowledgment',
    domain: 'HR — Human Resources', domainCode: 'HR',
    subdomain: 'TD — Training & Development', subdomainCode: 'TD',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'HR Director', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.80', 'HIPAA', 'OSHA'],
    purpose: 'Comprehensive workforce training, competency validation, and policy acknowledgment.',
    scope: ['All personnel'],
    linkedPolicies: ['GV-PM-003'],
    enforcementRules: ['Required training matrix (HIPAA, OSHA, Infection Control, FWA)', 'Annual competency validation', 'LMS tracking'],
    appendices: ['Training Matrix', 'Competency Assessment Form'],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'hr-eh-101', policyId: 'HR-EH-101', title: 'Employee Health, Exposure & Occupational Clearance',
    domain: 'HR — Human Resources', domainCode: 'HR',
    subdomain: 'WM — Workforce Management', subdomainCode: 'WM',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'HR Director', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['OSHA', 'CA Title 22'],
    purpose: 'Employee health screening, exposure management, and occupational clearance.',
    scope: ['All clinical staff', 'HR Department'],
    linkedPolicies: ['RM-OS-101', 'CL-IC-001'],
    enforcementRules: ['TB screening per CA requirements', 'Vaccination tracking (Hep B, flu, COVID)', 'Return-to-work clearance protocol'],
    appendices: ['Health Screening Form', 'Exposure Report Form'],
    riskLevel: 'MEDIUM'
  },
  // ══ FN — FINANCE & REVENUE CYCLE ══
  {
    id: 'fn-fp-005', policyId: 'FN-FP-005', title: 'Annual Budget & Financial Planning',
    domain: 'FN — Finance & Revenue Cycle', domainCode: 'FN',
    subdomain: 'FP — Financial Planning & Budgeting', subdomainCode: 'FP',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(a)'],
    purpose: 'Annual operating budget development and Governing Body approval.',
    scope: ['Administrator', 'Governing Body'],
    linkedPolicies: ['GV-GB-001'],
    enforcementRules: ['Approved 30 days before fiscal year start', 'Quarterly financial reporting to Governing Body'],
    appendices: ['Budget Template'],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'fn-rc-001', policyId: 'FN-RC-001', title: 'Revenue Cycle Management',
    domain: 'FN — Finance & Revenue Cycle', domainCode: 'FN',
    subdomain: 'RC — Revenue Cycle Management', subdomainCode: 'RC',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(a)'],
    purpose: 'Governs end-to-end revenue cycle from intake to collection.',
    scope: ['Billing staff', 'Administrator', 'Clinical Manager'],
    linkedPolicies: ['FN-FP-005', 'FN-BL-001'],
    enforcementRules: ['Claims submitted within 30 days', 'Denial management within 14 days', 'Monthly A/R aging review'],
    appendices: [],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'fn-bl-001', policyId: 'FN-BL-001', title: 'Medicare Billing & Claims Submission',
    domain: 'FN — Finance & Revenue Cycle', domainCode: 'FN',
    subdomain: 'BL — Billing & Claims', subdomainCode: 'BL',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(a)', 'Medicare Conditions of Payment'],
    purpose: 'Governs accurate Medicare billing and claims submission.',
    scope: ['Billing staff', 'Administrator'],
    linkedPolicies: ['FN-RC-001', 'CO-FW-101'],
    enforcementRules: ['Accurate OASIS data prerequisite for billing', 'No billing without signed POC', 'Claims denial rate monitored'],
    appendices: [],
    auditDefenseUse: 'Used in Audit Defense for ADR response — billing accuracy documentation',
    riskLevel: 'HIGH'
  },
  // ══ OP — OPERATIONS & FACILITIES ══
  {
    id: 'op-fm-005', policyId: 'OP-FM-005', title: 'Emergency Operations & Business Continuity',
    domain: 'OP — Operations & Facilities', domainCode: 'OP',
    subdomain: 'FM — Facilities & Emergency Preparedness', subdomainCode: 'FM',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.102'],
    purpose: 'Emergency operations plan and business continuity procedures.',
    scope: ['All personnel'],
    linkedPolicies: ['GV-GB-001'],
    enforcementRules: ['Approved annually at Q3 Governing Body meeting', 'Minimum 2 drills per year', 'Community coordination documented'],
    appendices: ['Emergency Contact List', 'Drill Report Template'],
    riskLevel: 'HIGH'
  },
  {
    id: 'op-rc-001', policyId: 'OP-RC-001', title: 'Clinical Records Management',
    domain: 'OP — Operations & Facilities', domainCode: 'OP',
    subdomain: 'RC — Records Management', subdomainCode: 'RC',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.110'],
    purpose: 'Governs clinical records management per CMS requirements.',
    scope: ['All clinical staff', 'HIM staff'],
    linkedPolicies: ['CO-HP-007'],
    enforcementRules: ['Records maintained per 42 CFR § 484.110', 'Accessible for survey review', 'Retention per schedule'],
    appendices: [],
    riskLevel: 'MEDIUM'
  },
  // ══ IT — INFORMATION TECHNOLOGY & SECURITY ══
  {
    id: 'it-sp-001', policyId: 'IT-SP-001', title: 'Information Security Program',
    domain: 'IT — Information Technology & Security', domainCode: 'IT',
    subdomain: 'SP — Security Program', subdomainCode: 'SP',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'IT Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['HIPAA Security Rule'],
    purpose: 'Establishes the agency\'s information security program.',
    scope: ['All personnel', 'IT Administrator'],
    linkedPolicies: ['CO-HP-101', 'CO-IR-101', 'IT-AC-001'],
    enforcementRules: ['Annual security risk assessment', 'Security awareness training', 'Incident response tested annually'],
    appendices: ['Security Program Charter'],
    riskLevel: 'HIGH'
  },
  {
    id: 'it-ac-001', policyId: 'IT-AC-001', title: 'Access Control & Authentication',
    domain: 'IT — Information Technology & Security', domainCode: 'IT',
    subdomain: 'AC — Access Control & Authentication', subdomainCode: 'AC',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'IT Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['HIPAA Security Rule'],
    purpose: 'Governs user access controls and authentication requirements.',
    scope: ['All system users', 'IT Administrator'],
    linkedPolicies: ['IT-SP-001', 'CO-DG-101'],
    enforcementRules: ['Unique user IDs required', 'MFA for ePHI access', 'Access terminated within 24 hours of separation', 'Quarterly access reviews'],
    appendices: ['Access Request Form'],
    riskLevel: 'HIGH'
  },
  {
    id: 'it-bc-001', policyId: 'IT-BC-001', title: 'Backup & Disaster Recovery',
    domain: 'IT — Information Technology & Security', domainCode: 'IT',
    subdomain: 'BC — Backup & Disaster Recovery', subdomainCode: 'BC',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'IT Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['HIPAA Security Rule'],
    purpose: 'Governs data backup and disaster recovery procedures.',
    scope: ['IT Administrator', 'Administrator'],
    linkedPolicies: ['IT-SP-001', 'OP-FM-005'],
    enforcementRules: ['Daily backups', 'Annual DR testing', 'Recovery within defined RTO/RPO'],
    appendices: ['DR Plan', 'Backup Schedule'],
    riskLevel: 'HIGH'
  },
  // ══ RM — RISK MANAGEMENT & SAFETY ══
  {
    id: 'rm-os-101', policyId: 'RM-OS-101', title: 'Cal/OSHA Occupational Safety Program (IIPP)',
    domain: 'RM — Risk Management & Safety', domainCode: 'RM',
    subdomain: 'SS — Staff Safety', subdomainCode: 'SS',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Risk Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['Cal/OSHA Title 8', 'SB 553'],
    purpose: 'Cal/OSHA IIPP, workplace violence prevention, bloodborne pathogens, and safety program.',
    scope: ['All personnel'],
    linkedPolicies: ['HR-EH-101', 'CL-IC-001'],
    enforcementRules: ['IIPP core 7 elements maintained', 'Workplace Violence Prevention Plan (SB 553)', 'Annual safety training'],
    appendices: ['IIPP Document', 'Incident Report Form', 'Safety Training Log'],
    riskLevel: 'HIGH'
  },
  {
    id: 'rm-ps-001', policyId: 'RM-PS-001', title: 'Patient Safety & Fall Prevention',
    domain: 'RM — Risk Management & Safety', domainCode: 'RM',
    subdomain: 'PS — Patient Safety', subdomainCode: 'PS',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Clinical Manager', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.60'],
    purpose: 'Patient safety program and fall prevention protocols.',
    scope: ['All clinical staff'],
    linkedPolicies: ['QA-PG-001', 'CL-PA-001'],
    enforcementRules: ['Fall risk assessment at SOC', 'Safety plan in each POC', 'Adverse event reporting within 24 hours'],
    appendices: ['Fall Risk Assessment Tool'],
    riskLevel: 'MEDIUM'
  },
  // ══ EN — ENTERPRISE GOVERNANCE & CONTROL ══
  {
    id: 'en-tg-001', policyId: 'EN-TG-001', title: 'Enterprise Policy Taxonomy & Classification Governance',
    domain: 'EN — Enterprise Governance & Control', domainCode: 'EN',
    subdomain: 'TG — Taxonomy & Classification Governance', subdomainCode: 'TG',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(a)'],
    purpose: 'Governs the enterprise taxonomy framework under which all policies are classified.',
    scope: ['All policy authors', 'Administrator', 'IT Administrator'],
    linkedPolicies: ['GV-PM-001', 'EN-LC-001'],
    enforcementRules: ['10-domain taxonomy enforced', 'Classification tiers: REQUIRED, ESSENTIAL, OPERATIONAL, REFERENCE', 'Policy ID format: XX-YY-NNN'],
    appendices: ['Taxonomy Matrix', 'Classification Dictionary'],
    riskLevel: 'MEDIUM'
  },
  {
    id: 'en-lc-001', policyId: 'EN-LC-001', title: 'Policy Lifecycle Management',
    domain: 'EN — Enterprise Governance & Control', domainCode: 'EN',
    subdomain: 'LC — Policy Lifecycle Management', subdomainCode: 'LC',
    classificationTier: 'REQUIRED', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['42 CFR § 484.105(a)'],
    purpose: 'Manages the full policy lifecycle from draft through deprecation.',
    scope: ['All policy stakeholders'],
    linkedPolicies: ['EN-TG-001', 'GV-PM-001', 'GV-PM-002'],
    enforcementRules: ['Lifecycle stages: Draft → Review → Approved → Active → Under Review → Deprecated', 'Only Active policies are enforceable'],
    appendices: [],
    riskLevel: 'LOW'
  },
  {
    id: 'en-ai-001', policyId: 'EN-AI-001', title: 'AI & Automation Governance Framework',
    domain: 'EN — Enterprise Governance & Control', domainCode: 'EN',
    subdomain: 'AI — AI & Automation Governance', subdomainCode: 'AI',
    classificationTier: 'ESSENTIAL', status: 'ACTIVE', version: '1.0',
    effectiveDate: '2025-07-10', nextReviewDate: '2026-07-10',
    policyOwner: 'Administrator', approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    cfrMapping: ['HIPAA Security Rule'],
    purpose: 'Enterprise framework for AI and automation governance.',
    scope: ['All personnel', 'IT Administrator'],
    linkedPolicies: ['CO-AI-101', 'EN-TG-001'],
    enforcementRules: ['AI risk classification required', 'Human oversight mandatory for clinical AI'],
    appendices: ['AI Governance Framework'],
    riskLevel: 'MEDIUM'
  }
];

// ══════════════════════════════════════════════════════════════
// COMPUTED METRICS & INTELLIGENCE
// ══════════════════════════════════════════════════════════════

function computeDomainMetrics(domainCode: string) {
  const policies = ALL_POLICIES.filter(p => p.domainCode === domainCode);
  const total = policies.length;
  const active = policies.filter(p => p.status === 'ACTIVE').length;
  const required = policies.filter(p => p.classificationTier === 'REQUIRED').length;
  const essential = policies.filter(p => p.classificationTier === 'ESSENTIAL').length;
  const operational = policies.filter(p => p.classificationTier === 'OPERATIONAL').length;
  const reference = policies.filter(p => p.classificationTier === 'REFERENCE').length;
  const highRisk = policies.filter(p => p.riskLevel === 'HIGH').length;
  const overdue = policies.filter(p => {
    if (!p.nextReviewDate) return false;
    return new Date(p.nextReviewDate) < new Date();
  }).length;
  const complianceScore = total > 0 ? Math.round((active / total) * 100) : 0;
  return { total, active, required, essential, operational, reference, highRisk, overdue, complianceScore, policies };
}

function computeSubdomainMetrics(domainCode: string, subdomainCode: string) {
  const policies = ALL_POLICIES.filter(p => p.domainCode === domainCode && p.subdomainCode === subdomainCode);
  const total = policies.length;
  const required = policies.filter(p => p.classificationTier === 'REQUIRED').length;
  const essential = policies.filter(p => p.classificationTier === 'ESSENTIAL').length;
  const overdue = policies.filter(p => new Date(p.nextReviewDate) < new Date()).length;
  return { total, required, essential, overdue, policies };
}

function getFrameworkHealth() {
  const total = ALL_POLICIES.length;
  const active = ALL_POLICIES.filter(p => p.status === 'ACTIVE').length;
  const draft = ALL_POLICIES.filter(p => p.status === 'DRAFT').length;
  const deprecated = ALL_POLICIES.filter(p => p.status === 'DEPRECATED').length;
  const underReview = ALL_POLICIES.filter(p => p.status === 'UNDER_REVIEW').length;
  const required = ALL_POLICIES.filter(p => p.classificationTier === 'REQUIRED').length;
  const highRisk = ALL_POLICIES.filter(p => p.riskLevel === 'HIGH').length;
  const overdue = ALL_POLICIES.filter(p => new Date(p.nextReviewDate) < new Date()).length;
  const complianceScore = total > 0 ? Math.round((active / total) * 100) : 0;
  const domains = DOMAINS.length;
  const subdomains = DOMAINS.reduce((acc, d) => acc + d.subdomains.length, 0);
  return { total, active, draft, deprecated, underReview, required, highRisk, overdue, complianceScore, domains, subdomains };
}

// ══════════════════════════════════════════════════════════════
// UI COMPONENTS
// ══════════════════════════════════════════════════════════════

// ── Risk Badge ──
const RiskBadge: React.FC<{ level: string; size?: 'sm' | 'md' }> = ({ level, size = 'sm' }) => {
  const config = {
    HIGH: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#f87171', label: 'HIGH RISK' },
    MEDIUM: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.25)', text: '#fbbf24', label: 'MEDIUM' },
    LOW: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#4ade80', label: 'LOW' }
  };
  const c = config[level as keyof typeof config] || config.LOW;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-widest ${size === 'sm' ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1 text-[9px]'}`}
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.text }} />
      {c.label}
    </span>
  );
};

// ── Status Badge ──
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { bg: string; border: string; text: string }> = {
    ACTIVE: { bg: 'rgba(0,229,155,0.12)', border: 'rgba(0,229,155,0.3)', text: '#00e59b' },
    DRAFT: { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', text: '#f97316' },
    UNDER_REVIEW: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
    DEPRECATED: { bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)', text: '#9ca3af' }
  };
  const c = config[status] || config.ACTIVE;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.text }} />
      {status.replace('_', ' ')}
    </span>
  );
};

// ── Tier Badge ──
const TierBadge: React.FC<{ tier: string }> = ({ tier }) => {
  const config: Record<string, { bg: string; border: string; text: string }> = {
    REQUIRED: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', text: '#f87171' },
    ESSENTIAL: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.25)', text: '#fbbf24' },
    OPERATIONAL: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', text: '#60a5fa' },
    REFERENCE: { bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)', text: '#9ca3af' }
  };
  const c = config[tier] || config.REFERENCE;
  return (
    <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {tier}
    </span>
  );
};

// ── Circular Progress ──
const CircularProgress: React.FC<{ value: number; size?: number; color?: string; strokeWidth?: number }> = ({
  value, size = 48, color = '#00e59b', strokeWidth = 3
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize={size * 0.26} fontWeight="bold" className="font-montserrat"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}>
        {value}%
      </text>
    </svg>
  );
};

// ── Mini Stat ──
const MiniStat: React.FC<{ label: string; value: string | number; color?: string; icon?: React.ElementType }> = ({
  label, value, color = 'white', icon: Icon
}) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center gap-1.5">
      {Icon && <Icon size={12} style={{ color, opacity: 0.7 }} />}
      <span className="text-lg font-bold font-montserrat" style={{ color }}>{value}</span>
    </div>
    <span className="text-[8px] uppercase tracking-[0.15em] text-white/30 font-bold mt-0.5">{label}</span>
  </div>
);

// ══════════════════════════════════════════════════════════════
// POLICY DETAIL MODAL
// ══════════════════════════════════════════════════════════════

const PolicyModal: React.FC<{ policy: PolicyRecord; onClose: () => void }> = ({ policy, onClose }) => {
  const domain = DOMAINS.find(d => d.code === policy.domainCode);
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(20,20,25,0.97), rgba(15,15,20,0.99))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3), 0 25px 80px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-lg text-[11px] font-bold font-montserrat tracking-wider"
                  style={{ background: domain?.accentBg, color: domain?.color, border: `1px solid ${domain?.color}30` }}>
                  {policy.policyId}
                </span>
                <StatusBadge status={policy.status} />
                <TierBadge tier={policy.classificationTier} />
                <RiskBadge level={policy.riskLevel} />
              </div>
              <h2 className="text-xl font-bold text-white font-montserrat tracking-wide">{policy.title}</h2>
              <p className="text-xs text-white/40 mt-1 font-montserrat tracking-wider">{policy.domain} › {policy.subdomain}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6 custom-scrollbar">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Version', value: `v${policy.version}` },
              { label: 'Effective', value: policy.effectiveDate },
              { label: 'Next Review', value: policy.nextReviewDate },
              { label: 'Owner', value: policy.policyOwner }
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
                <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-bold block mb-1">{item.label}</span>
                <span className="text-sm text-white/90 font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Purpose */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2 flex items-center gap-2">
              <Target size={12} /> Purpose
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">{policy.purpose}</p>
          </div>

          {/* Scope */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2 flex items-center gap-2">
              <Users size={12} /> Scope
            </h3>
            <div className="flex flex-wrap gap-2">
              {policy.scope.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] text-white/60 font-medium"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* CFR Mapping */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2 flex items-center gap-2">
              <Scale size={12} /> Regulatory Mapping
            </h3>
            <div className="flex flex-wrap gap-2">
              {policy.cfrMapping.map((cfr, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
                  style={{ background: 'rgba(0,229,155,0.08)', border: '1px solid rgba(0,229,155,0.2)', color: '#00e59b' }}>
                  {cfr}
                </span>
              ))}
            </div>
          </div>

          {/* Enforcement Rules */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2 flex items-center gap-2">
              <Zap size={12} /> Key Enforcement Rules
            </h3>
            <div className="space-y-2">
              {policy.enforcementRules.map((rule, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                  <ChevronRight size={14} className="text-[#00e59b] flex-shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Policies */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2 flex items-center gap-2">
              <GitBranch size={12} /> Linked Policies ({policy.linkedPolicies.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {policy.linkedPolicies.map((lp, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-white/10 transition-colors"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                  {lp}
                </span>
              ))}
            </div>
          </div>

          {/* Appendices */}
          {policy.appendices.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2 flex items-center gap-2">
                <FileText size={12} /> Appendices
              </h3>
              <div className="space-y-1.5">
                {policy.appendices.map((app, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                    <FileText size={14} className="text-white/30" />
                    <span className="text-sm text-white/70">{app}</span>
                    <ExternalLink size={12} className="text-white/20 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Connections */}
          {(policy.auditDefenseUse || policy.clinicalEnforcementLink) && (
            <div className="p-4 rounded-xl" style={{ background: 'rgba(0,229,155,0.03)', border: '1px solid rgba(0,229,155,0.1)' }}>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#00e59b] font-bold mb-3 flex items-center gap-2">
                <Layers size={12} /> System Connections
              </h3>
              {policy.auditDefenseUse && (
                <div className="flex items-start gap-2 text-xs text-white/60 mb-2">
                  <Shield size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-purple-400">Audit Defense:</strong> {policy.auditDefenseUse}</span>
                </div>
              )}
              {policy.clinicalEnforcementLink && (
                <div className="flex items-start gap-2 text-xs text-white/60">
                  <Zap size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-red-400">Clinical Enforcement:</strong> {policy.clinicalEnforcementLink}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// REGULATION DETAIL PANEL
// ══════════════════════════════════════════════════════════════

const RegulationPanel: React.FC<{ reg: Regulation; onClose: () => void }> = ({ reg, onClose }) => {
  const mappedDomains = DOMAINS.filter(d => reg.domains.includes(d.code));
  const Icon = reg.icon;
  
  return (
    <div className="mt-6 rounded-xl overflow-hidden animate-fadeIn"
      style={{
        background: 'rgba(255,255,255,0.01)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.04)'
      }}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${reg.color}15`, border: `1px solid ${reg.color}30` }}>
              <Icon size={16} style={{ color: reg.color }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-montserrat">{reg.name}</h3>
              <p className="text-[9px] text-white/30 uppercase tracking-widest">{reg.policyCount} policies · {reg.coverage}% coverage</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {mappedDomains.map(domain => {
            const metrics = computeDomainMetrics(domain.code);
            const DomainIcon = domain.icon;
            return (
              <div key={domain.code} className="p-3 rounded-xl" style={{ background: domain.accentBg, border: `1px solid ${domain.color}15` }}>
                <div className="flex items-center gap-2 mb-2">
                  <DomainIcon size={14} style={{ color: domain.color }} />
                  <span className="text-[10px] font-bold" style={{ color: domain.color }}>{domain.code}</span>
                </div>
                <p className="text-[10px] text-white/50 font-medium">{domain.name}</p>
                <p className="text-[9px] text-white/30 mt-1">{metrics.total} policies</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT — SYSTEM HIERARCHY
// ══════════════════════════════════════════════════════════════

export default function SystemHierarchy() {
  // State
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [expandedSubdomain, setExpandedSubdomain] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRecord | null>(null);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState<string>('ALL');
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  
  const health = useMemo(() => getFrameworkHealth(), []);
  const searchRef = useRef<HTMLInputElement>(null);

  // Filtered policies for search
  const filteredPolicies = useMemo(() => {
    let policies = ALL_POLICIES;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      policies = policies.filter(p =>
        p.policyId.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        p.policyOwner.toLowerCase().includes(q) ||
        p.cfrMapping.some(c => c.toLowerCase().includes(q))
      );
    }
    if (filterDomain !== 'ALL') policies = policies.filter(p => p.domainCode === filterDomain);
    if (filterTier !== 'ALL') policies = policies.filter(p => p.classificationTier === filterTier);
    if (filterStatus !== 'ALL') policies = policies.filter(p => p.status === filterStatus);
    return policies;
  }, [searchQuery, filterDomain, filterTier, filterStatus]);

  const isSearchActive = searchQuery.trim() || filterDomain !== 'ALL' || filterTier !== 'ALL' || filterStatus !== 'ALL';

  const handleDomainClick = useCallback((code: string) => {
    setExpandedDomain(prev => prev === code ? null : code);
    setExpandedSubdomain(null);
  }, []);

  const handleSubdomainClick = useCallback((key: string) => {
    setExpandedSubdomain(prev => prev === key ? null : key);
  }, []);

  // ── RENDER ──
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-roboto { font-family: 'Roboto', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.35s ease-out forwards; }
        
        @keyframes pulse-glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <div className="min-h-screen font-roboto text-white relative overflow-hidden"
        style={{ background: '#0a0a0c' }}>
        
        {/* ── Ambient Glows ── */}
        <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,229,155,0.04) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 70%)' }} />
        <div className="absolute top-[30%] right-[5%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(232,82,0,0.025) 0%, transparent 70%)' }} />

        {/* ── Main Container — Embossed Glass Surface ── */}
        <div className="relative w-full max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10">

          {/* ═══════════════════════════════════════════════════ */}
          {/* FRAMEWORK HEALTH DASHBOARD (TOP SECTION)           */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="mb-8">
            {/* Title Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#00e59b] pulse-glow" />
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#00e59b] font-bold font-montserrat">ENTERPRISE POLICY INTELLIGENCE</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-light text-white font-montserrat tracking-wide">
                  System Hierarchy
                </h1>
                <p className="text-xs text-white/30 mt-1.5 font-roboto">
                  Care Indeed Home Health Care, Inc. — v6.0 Enterprise Framework — {health.total} policies across {health.domains} domains
                </p>
              </div>
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Last sync</span>
                <span className="text-[10px] text-white/50 font-mono">2025-07-10T00:00:00Z</span>
                <RefreshCw size={12} className="text-white/20 cursor-pointer hover:text-[#00e59b] transition-colors" />
              </div>
            </div>

            {/* Health Dashboard — Recessed Surface */}
            <div className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.008) 0%, rgba(0,0,0,0.15) 100%)',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.02)',
              }}>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
                {/* Compliance Score */}
                <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center">
                  <CircularProgress value={health.complianceScore} size={64} />
                  <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-bold mt-2">COMPLIANCE</span>
                </div>
                
                <MiniStat label="Total Policies" value={health.total} icon={FileText} />
                <MiniStat label="Active" value={health.active} color="#00e59b" icon={CheckCircle} />
                <MiniStat label="Draft" value={health.draft} color="#f97316" icon={Clock} />
                <MiniStat label="Required Tier" value={health.required} color="#f87171" icon={AlertCircle} />
                <MiniStat label="High Risk" value={health.highRisk} color="#ef4444" icon={AlertTriangle} />
                <MiniStat label="Overdue" value={health.overdue} color={health.overdue > 0 ? '#ef4444' : '#4ade80'} icon={Clock} />
                <MiniStat label="Subdomains" value={health.subdomains} icon={Layers} />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* SEARCH & FILTER BAR                                */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search by Policy ID, title, domain, owner, or CFR reference..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/20 font-roboto focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <button onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                  showFilters || isSearchActive ? 'text-[#00e59b]' : 'text-white/40 hover:text-white/70'
                }`}
                style={{
                  background: showFilters ? 'rgba(0,229,155,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${showFilters ? 'rgba(0,229,155,0.2)' : 'rgba(255,255,255,0.05)'}`,
                }}>
                <Filter size={14} />
                FILTERS
                {isSearchActive && (
                  <span className="w-2 h-2 rounded-full bg-[#00e59b]" />
                )}
              </button>
            </div>

            {/* Filter Dropdowns */}
            {showFilters && (
              <div className="flex flex-wrap gap-3 mt-3 animate-fadeIn">
                {/* Domain Filter */}
                <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
                  className="px-3 py-2 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                  <option value="ALL" style={{ background: '#111' }}>All Domains</option>
                  {DOMAINS.map(d => (
                    <option key={d.code} value={d.code} style={{ background: '#111' }}>{d.code} — {d.name}</option>
                  ))}
                </select>

                {/* Tier Filter */}
                <select value={filterTier} onChange={e => setFilterTier(e.target.value)}
                  className="px-3 py-2 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                  <option value="ALL" style={{ background: '#111' }}>All Tiers</option>
                  {['REQUIRED', 'ESSENTIAL', 'OPERATIONAL', 'REFERENCE'].map(t => (
                    <option key={t} value={t} style={{ background: '#111' }}>{t}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                  <option value="ALL" style={{ background: '#111' }}>All Status</option>
                  {['ACTIVE', 'DRAFT', 'UNDER_REVIEW', 'DEPRECATED'].map(s => (
                    <option key={s} value={s} style={{ background: '#111' }}>{s.replace('_', ' ')}</option>
                  ))}
                </select>

                {/* Clear All */}
                {isSearchActive && (
                  <button onClick={() => { setSearchQuery(''); setFilterDomain('ALL'); setFilterTier('ALL'); setFilterStatus('ALL'); }}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-400/10 transition-colors"
                    style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                    Clear All
                  </button>
                )}

                <span className="flex items-center text-[10px] text-white/30 ml-auto">
                  {filteredPolicies.length} of {ALL_POLICIES.length} policies
                </span>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* SEARCH RESULTS (when search is active)             */}
          {/* ═══════════════════════════════════════════════════ */}
          {isSearchActive && (
            <div className="mb-8 animate-fadeIn">
              <div className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.005)',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}>
                <div className="p-4 border-b border-white/5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                    Search Results — {filteredPolicies.length} {filteredPolicies.length === 1 ? 'policy' : 'policies'}
                  </span>
                </div>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  {filteredPolicies.length === 0 ? (
                    <div className="p-8 text-center text-white/20 text-sm">No policies match your search criteria.</div>
                  ) : (
                    <div className="divide-y divide-white/[0.03]">
                      {filteredPolicies.map(policy => {
                        const domain = DOMAINS.find(d => d.code === policy.domainCode);
                        return (
                          <div key={policy.id}
                            onClick={() => setSelectedPolicy(policy)}
                            className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors group">
                            <span className="text-[11px] font-bold font-mono w-24 flex-shrink-0" style={{ color: domain?.color }}>
                              {policy.policyId}
                            </span>
                            <span className="text-sm text-white/80 flex-1 truncate group-hover:text-white transition-colors">
                              {policy.title}
                            </span>
                            <TierBadge tier={policy.classificationTier} />
                            <StatusBadge status={policy.status} />
                            <RiskBadge level={policy.riskLevel} />
                            <ChevronRight size={14} className="text-white/10 group-hover:text-white/30 transition-colors" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* LEVEL 0 — REGULATORY LAYER                         */}
          {/* ═══════════════════════════════════════════════════ */}
          {!isSearchActive && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-white/25 font-bold font-montserrat">LEVEL 0</span>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[9px] uppercase tracking-[0.3em] text-white/25 font-bold font-montserrat">REGULATORY FOUNDATION</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {REGULATIONS.map(reg => {
                    const Icon = reg.icon;
                    const isSelected = selectedRegulation?.id === reg.id;
                    return (
                      <button key={reg.id}
                        onClick={() => setSelectedRegulation(isSelected ? null : reg)}
                        className="text-left p-4 rounded-xl transition-all group"
                        style={{
                          background: isSelected ? `${reg.color}08` : 'rgba(255,255,255,0.01)',
                          boxShadow: isSelected
                            ? `inset 0 1px 0 ${reg.color}15, 0 0 20px ${reg.color}08`
                            : 'inset 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.02)',
                          border: `1px solid ${isSelected ? `${reg.color}30` : 'rgba(255,255,255,0.03)'}`,
                        }}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: `${reg.color}12`, border: `1px solid ${reg.color}20` }}>
                            <Icon size={16} style={{ color: reg.color }} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-[11px] font-bold text-white font-montserrat tracking-wide">{reg.shortName}</h3>
                            <p className="text-[8px] text-white/30 uppercase tracking-widest">{reg.domains.length} domains</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-white/30">{reg.policyCount} policies</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${reg.coverage}%`, background: reg.color }} />
                            </div>
                            <span className="text-[9px] font-bold font-mono" style={{ color: reg.color }}>{reg.coverage}%</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Regulation Detail Panel */}
                {selectedRegulation && (
                  <RegulationPanel reg={selectedRegulation} onClose={() => setSelectedRegulation(null)} />
                )}
              </div>

              {/* ═══════════════════════════════════════════════════ */}
              {/* LEVEL 1 — DOMAIN CARDS                             */}
              {/* ═══════════════════════════════════════════════════ */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-white/25 font-bold font-montserrat">LEVEL 1</span>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[9px] uppercase tracking-[0.3em] text-white/25 font-bold font-montserrat">ENTERPRISE DOMAINS ({DOMAINS.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {DOMAINS.map(domain => {
                    const metrics = computeDomainMetrics(domain.code);
                    const Icon = domain.icon;
                    const isExpanded = expandedDomain === domain.code;

                    return (
                      <div key={domain.code} className={`${isExpanded ? 'md:col-span-2 lg:col-span-3 xl:col-span-5' : ''}`}>
                        {/* Domain Card */}
                        <button
                          onClick={() => handleDomainClick(domain.code)}
                          className="w-full text-left rounded-xl transition-all group"
                          style={{
                            background: isExpanded ? `${domain.color}04` : 'rgba(255,255,255,0.008)',
                            boxShadow: isExpanded
                              ? `inset 0 1px 0 ${domain.color}10, 0 0 30px ${domain.color}05`
                              : 'inset 0 2px 5px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.025)',
                            border: `1px solid ${isExpanded ? `${domain.color}20` : 'rgba(255,255,255,0.03)'}`,
                          }}>
                          <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: `${domain.color}12`, border: `1px solid ${domain.color}20` }}>
                                <Icon size={18} style={{ color: domain.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white font-montserrat">{domain.code}</span>
                                  <RiskBadge level={domain.riskExposure} size="sm" />
                                </div>
                                <p className="text-[10px] text-white/40 font-medium truncate">{domain.name}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <CircularProgress value={metrics.complianceScore} size={36} color={domain.color} strokeWidth={2.5} />
                              </div>
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-center gap-3 text-[9px]">
                              <span className="text-white/50">
                                <span className="font-bold text-white/70">{metrics.total}</span> policies
                              </span>
                              <span className="text-white/15">·</span>
                              <span style={{ color: '#f87171' }}>
                                <span className="font-bold">{metrics.required}</span> REQ
                              </span>
                              <span className="text-white/15">·</span>
                              <span style={{ color: '#fbbf24' }}>
                                <span className="font-bold">{metrics.essential}</span> ESS
                              </span>
                              {metrics.highRisk > 0 && (
                                <>
                                  <span className="text-white/15">·</span>
                                  <span className="text-red-400 flex items-center gap-0.5">
                                    <AlertTriangle size={9} />
                                    <span className="font-bold">{metrics.highRisk}</span> high
                                  </span>
                                </>
                              )}
                              <span className="ml-auto">
                                {isExpanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/20" />}
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* ═══════════════════════════════════════════════════ */}
                        {/* LEVEL 2 — SUBDOMAINS (Expanded)                    */}
                        {/* ═══════════════════════════════════════════════════ */}
                        {isExpanded && (
                          <div className="mt-3 rounded-xl p-4 animate-fadeIn"
                            style={{
                              background: 'rgba(0,0,0,0.15)',
                              boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.02)'
                            }}>
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-[9px] uppercase tracking-[0.25em] text-white/20 font-bold font-montserrat">LEVEL 2 — SUBDOMAINS</span>
                              <div className="flex-1 h-px bg-white/5" />
                              <span className="text-[9px] text-white/20">{domain.subdomains.length} subdomains</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                              {domain.subdomains.map(sub => {
                                const subMetrics = computeSubdomainMetrics(domain.code, sub.code);
                                const subKey = `${domain.code}-${sub.code}`;
                                const isSubExpanded = expandedSubdomain === subKey;

                                return (
                                  <div key={subKey} className={isSubExpanded ? 'md:col-span-2 lg:col-span-3 xl:col-span-4' : ''}>
                                    <button
                                      onClick={() => handleSubdomainClick(subKey)}
                                      className="w-full text-left p-3 rounded-xl transition-all"
                                      style={{
                                        background: isSubExpanded ? `${domain.color}06` : 'rgba(255,255,255,0.015)',
                                        boxShadow: isSubExpanded
                                          ? `inset 0 1px 0 ${domain.color}10`
                                          : 'inset 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.02)',
                                        border: `1px solid ${isSubExpanded ? `${domain.color}15` : 'rgba(255,255,255,0.03)'}`,
                                      }}>
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold font-mono" style={{ color: domain.color }}>{sub.code}</span>
                                            <span className="text-xs text-white/70 font-medium">{sub.name}</span>
                                          </div>
                                          <div className="flex items-center gap-2 mt-1 text-[9px]">
                                            <span className="text-white/40">{subMetrics.total} policies</span>
                                            <span className="text-white/15">·</span>
                                            <span className="text-red-400/70">{subMetrics.required} REQ</span>
                                            <span className="text-white/15">·</span>
                                            <span className="text-yellow-400/70">{subMetrics.essential} ESS</span>
                                            {subMetrics.overdue > 0 && (
                                              <>
                                                <span className="text-white/15">·</span>
                                                <span className="text-red-400 flex items-center gap-0.5">
                                                  <Clock size={8} /> {subMetrics.overdue} overdue
                                                </span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        {isSubExpanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/15" />}
                                      </div>
                                    </button>

                                    {/* ═══════════════════════════════════════════════════ */}
                                    {/* LEVEL 3 — POLICY CARDS                              */}
                                    {/* ═══════════════════════════════════════════════════ */}
                                    {isSubExpanded && (
                                      <div className="mt-3 space-y-2 animate-fadeIn">
                                        <div className="flex items-center gap-2 mb-2 px-1">
                                          <span className="text-[8px] uppercase tracking-[0.25em] text-white/15 font-bold font-montserrat">LEVEL 3 — POLICIES</span>
                                          <div className="flex-1 h-px bg-white/[0.03]" />
                                        </div>
                                        {subMetrics.policies.map(policy => (
                                          <button key={policy.id}
                                            onClick={() => setSelectedPolicy(policy)}
                                            className="w-full text-left p-4 rounded-xl transition-all group"
                                            style={{
                                              background: 'rgba(255,255,255,0.01)',
                                              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.015)',
                                              border: '1px solid rgba(255,255,255,0.025)',
                                            }}>
                                            <div className="flex items-start gap-4">
                                              {/* Policy ID */}
                                              <div className="flex-shrink-0">
                                                <span className="text-[11px] font-bold font-mono tracking-wide"
                                                  style={{ color: domain.color }}>
                                                  {policy.policyId}
                                                </span>
                                              </div>

                                              {/* Policy Info */}
                                              <div className="flex-1 min-w-0">
                                                <h4 className="text-sm text-white/90 font-medium group-hover:text-white transition-colors truncate">
                                                  {policy.title}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                  <StatusBadge status={policy.status} />
                                                  <TierBadge tier={policy.classificationTier} />
                                                  <RiskBadge level={policy.riskLevel} />
                                                </div>

                                                {/* Metadata row */}
                                                <div className="flex items-center gap-4 mt-2 text-[9px] text-white/30">
                                                  <span>v{policy.version}</span>
                                                  <span className="text-white/10">·</span>
                                                  <span>{policy.policyOwner}</span>
                                                  <span className="text-white/10">·</span>
                                                  <span className="flex items-center gap-1">
                                                    <Scale size={9} className="text-white/20" />
                                                    {policy.cfrMapping[0]}
                                                  </span>
                                                  <span className="text-white/10">·</span>
                                                  <span className="flex items-center gap-1">
                                                    <GitBranch size={9} className="text-white/20" />
                                                    {policy.linkedPolicies.length} linked
                                                  </span>
                                                </div>

                                                {/* System connections */}
                                                {(policy.auditDefenseUse || policy.clinicalEnforcementLink) && (
                                                  <div className="flex items-center gap-3 mt-2">
                                                    {policy.auditDefenseUse && (
                                                      <span className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                                        style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
                                                        Audit Defense
                                                      </span>
                                                    )}
                                                    {policy.clinicalEnforcementLink && (
                                                      <span className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                        Clinical Enforcement
                                                      </span>
                                                    )}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Arrow */}
                                              <ChevronRight size={16} className="text-white/10 group-hover:text-white/30 transition-colors flex-shrink-0 mt-1" />
                                            </div>
                                          </button>
                                        ))}

                                        {subMetrics.policies.length === 0 && (
                                          <div className="p-6 text-center text-white/15 text-xs">
                                            No policies in this subdomain yet.
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* FOOTER — SYSTEM CONNECTIONS                        */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="mt-8 pt-6 border-t border-white/[0.03]">
            <div className="flex items-center justify-center gap-6 text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">
              <span className="flex items-center gap-2 cursor-pointer hover:text-[#00e59b] transition-colors">
                <Layers size={12} /> System Hierarchy
              </span>
              <span className="text-white/5">|</span>
              <span className="flex items-center gap-2 cursor-pointer hover:text-[#00e59b] transition-colors">
                <RefreshCw size={12} /> Governance Lifecycle
              </span>
              <span className="text-white/5">|</span>
              <span className="flex items-center gap-2 cursor-pointer hover:text-[#00e59b] transition-colors">
                <BookOpen size={12} /> Classification Dictionary
              </span>
              <span className="text-white/5">|</span>
              <span className="flex items-center gap-2 cursor-pointer hover:text-[#00e59b] transition-colors">
                <Zap size={12} /> Clinical Enforcement Engine
              </span>
              <span className="text-white/5">|</span>
              <span className="flex items-center gap-2 cursor-pointer hover:text-[#00e59b] transition-colors">
                <Shield size={12} /> Audit Defense System
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── POLICY MODAL ── */}
      {selectedPolicy && (
        <PolicyModal policy={selectedPolicy} onClose={() => setSelectedPolicy(null)} />
      )}
    </>
  );
}
