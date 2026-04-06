import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Search, X, Building2, Users, AlertTriangle,
  DollarSign, Monitor, BarChart3, Heart, Cpu, Briefcase,
  GitBranch, Printer, Layers, Database, Download, Eye,
  FileSignature, ClipboardCheck, FileText, Share2, Flame, Copy,
  FileCheck, LayoutList
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════
// ENTERPRISE FORMS LIBRARY – 281 ARTIFACTS ACROSS 10 DOMAINS
// ══════════════════════════════════════════════════════════════

const DOMAINS = [
  { code: 'GV', name: 'GOVERNANCE', icon: Building2, color: '#00c2b4' },
  { code: 'CL', name: 'CLINICAL OPS', icon: Heart, color: '#ef4444' },
  { code: 'QA', name: 'QAPI', icon: BarChart3, color: '#06b6d4' },
  { code: 'HR', name: 'HUMAN RESOURCES', icon: Users, color: '#8b5cf6' },
  { code: 'CO', name: 'COMPLIANCE', icon: Shield, color: '#3b82f6' },
  { code: 'FN', name: 'FINANCE', icon: DollarSign, color: '#10b981' },
  { code: 'OP', name: 'OPERATIONS', icon: Briefcase, color: '#f97316' },
  { code: 'IT', name: 'IT & SECURITY', icon: Monitor, color: '#6366f1' },
  { code: 'RM', name: 'RISK MGMT', icon: AlertTriangle, color: '#eab308' },
  { code: 'EN', name: 'ENTERPRISE CTRL', icon: Cpu, color: '#ec4899' },
];

const CLASSIFICATION_FILTERS = [
  { id: 'master_template', name: 'Master Template', color: '#3b82f6', icon: Copy },
  { id: 'audit_critical', name: 'Audit Critical', color: '#ef4444', icon: FileCheck },
  { id: 'shared_enterprise', name: 'Shared Enterprise', color: '#10b981', icon: Share2 },
  { id: 'high_risk', name: 'High Risk', color: '#f97316', icon: Flame },
  { id: 'digital_candidate', name: 'Digital Candidate', color: '#a855f7', icon: Monitor },
];

interface FormRecord {
  id: string; name: string; type: string; policies: string[];
  domainCode: string; usage: string; frequency: string; classifications: string[];
}

const FORMS_DATASET: FormRecord[] = [
  // ── ENTERPRISE CONTROL (EN) ── 21 forms
  { id: 'EN-FM-001', name: 'Universal Policy Acknowledgment Form', type: 'Attestation', policies: ['ALL (270 Policies)'], domainCode: 'EN', usage: 'Required', frequency: 'Triggered', classifications: ['master_template', 'shared_enterprise', 'digital_candidate'] },
  { id: 'EN-FM-002', name: 'Master Policy Index / Taxonomy Register', type: 'Tracking Tool', policies: ['EN-TG-001'], domainCode: 'EN', usage: 'Required', frequency: 'Ongoing', classifications: ['master_template', 'shared_enterprise'] },
  { id: 'EN-FM-003', name: 'Policy Classification Tier Matrix', type: 'Matrix', policies: ['EN-TG-001'], domainCode: 'EN', usage: 'Required', frequency: 'Annual', classifications: ['master_template'] },
  { id: 'EN-FM-004', name: 'Domain Owner Assignment Roster', type: 'Tracking Tool', policies: ['EN-TG-001'], domainCode: 'EN', usage: 'Required', frequency: 'Ongoing', classifications: ['shared_enterprise'] },
  { id: 'EN-FM-005', name: 'Regulatory Crosswalk Template', type: 'Template', policies: ['EN-TG-002'], domainCode: 'EN', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical', 'master_template'] },
  { id: 'EN-FM-006', name: 'Compliance Gap Analysis Worksheet', type: 'Worksheet', policies: ['EN-TG-002'], domainCode: 'EN', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'EN-FM-007', name: 'Policy Development & Revision Template', type: 'Template', policies: ['EN-LC-001'], domainCode: 'EN', usage: 'Required', frequency: 'Triggered', classifications: ['master_template'] },
  { id: 'EN-FM-008', name: 'Policy Approval Routing Form', type: 'Form', policies: ['EN-LC-001'], domainCode: 'EN', usage: 'Required', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'EN-FM-009', name: 'Version Control Change Log', type: 'Log', policies: ['EN-LC-001'], domainCode: 'EN', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'EN-FM-010', name: 'Annual Policy Review Schedule', type: 'Tracking Tool', policies: ['EN-LC-001'], domainCode: 'EN', usage: 'Required', frequency: 'Annual', classifications: ['shared_enterprise'] },
  { id: 'EN-FM-011', name: 'Policy Exception / Waiver Request Form', type: 'Form', policies: ['EN-LC-002'], domainCode: 'EN', usage: 'Conditional', frequency: 'Triggered', classifications: ['digital_candidate', 'high_risk'] },
  { id: 'EN-FM-012', name: 'Exception & Waiver Tracking Log', type: 'Log', policies: ['EN-LC-002'], domainCode: 'EN', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'EN-FM-013', name: 'Role-Based Policy Assignment Matrix', type: 'Matrix', policies: ['EN-LC-003'], domainCode: 'EN', usage: 'Required', frequency: 'Annual', classifications: ['shared_enterprise'] },
  { id: 'EN-FM-014', name: 'Policy Acknowledgment Tracking Log', type: 'Log', policies: ['EN-LC-003'], domainCode: 'EN', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical', 'shared_enterprise'] },
  { id: 'EN-FM-015', name: 'Policy Retirement Request Form', type: 'Form', policies: ['EN-LC-004'], domainCode: 'EN', usage: 'Conditional', frequency: 'Triggered', classifications: [] },
  { id: 'EN-FM-016', name: 'Policy Obsolescence Impact Assessment', type: 'Assessment', policies: ['EN-LC-004'], domainCode: 'EN', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'EN-FM-017', name: 'Enterprise Compliance Dashboard Template', type: 'Template', policies: ['EN-CM-001'], domainCode: 'EN', usage: 'Required', frequency: 'Monthly', classifications: ['master_template', 'audit_critical'] },
  { id: 'EN-FM-018', name: 'Departmental KPI Reporting Form', type: 'Form', policies: ['EN-CM-001'], domainCode: 'EN', usage: 'Required', frequency: 'Quarterly', classifications: ['shared_enterprise'] },
  { id: 'EN-FM-019', name: 'Non-Compliance Remediation Plan', type: 'Worksheet', policies: ['EN-CM-001'], domainCode: 'EN', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk', 'audit_critical'] },
  { id: 'EN-FM-020', name: 'Policy Conflict Resolution Request Form', type: 'Form', policies: ['EN-CM-002'], domainCode: 'EN', usage: 'Conditional', frequency: 'Triggered', classifications: [] },
  { id: 'EN-FM-021', name: 'Inter-Domain Coordination Meeting Minutes', type: 'Template', policies: ['EN-CM-002'], domainCode: 'EN', usage: 'Required', frequency: 'Triggered', classifications: ['master_template'] },
  { id: 'EN-FM-022', name: 'Enterprise Policy Compliance Scorecard', type: 'Tracking Tool', policies: ['EN-CM-001'], domainCode: 'EN', usage: 'Required', frequency: 'Quarterly', classifications: ['shared_enterprise'] },
  { id: 'EN-FM-023', name: 'Cross-Domain Conflict Resolution Log', type: 'Log', policies: ['EN-CM-002'], domainCode: 'EN', usage: 'Conditional', frequency: 'Triggered', classifications: [] },
  { id: 'EN-FM-024', name: 'Policy Exception & Waiver Request Form', type: 'Form', policies: ['EN-LC-002'], domainCode: 'EN', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'EN-FM-025', name: 'Policy Retirement & Obsolescence Checklist', type: 'Checklist', policies: ['EN-LC-004'], domainCode: 'EN', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'EN-FM-026', name: 'Role-Based Applicability Matrix', type: 'Matrix', policies: ['EN-LC-003'], domainCode: 'EN', usage: 'Required', frequency: 'Annual', classifications: ['shared_enterprise'] },
  { id: 'EN-FM-027', name: 'Annual Policy Acknowledgment Tracking Report', type: 'Tracking Tool', policies: ['EN-TG-001'], domainCode: 'EN', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'shared_enterprise'] },
  { id: 'EN-FM-028', name: 'Regulatory Mapping Accuracy Audit Worksheet', type: 'Worksheet', policies: ['EN-TG-002'], domainCode: 'EN', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'EN-FM-029', name: 'Enterprise Taxonomy Version Release Notes', type: 'Template', policies: ['EN-TG-001'], domainCode: 'EN', usage: 'Required', frequency: 'Triggered', classifications: ['master_template'] },

  // ── GOVERNANCE (GV) ── 25 forms
  { id: 'GV-FM-001', name: 'Agency Closure / Change of Ownership Checklist', type: 'Checklist', policies: ['GV-EA-005'], domainCode: 'GV', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk', 'audit_critical'] },
  { id: 'GV-FM-002', name: 'Agency Credential & Licensure Register', type: 'Tracking Tool', policies: ['GV-EA-005', 'GV-EA-004'], domainCode: 'GV', usage: 'Required', frequency: 'Ongoing', classifications: ['shared_enterprise', 'audit_critical'] },
  { id: 'GV-FM-003', name: 'Official Agency Organizational Chart', type: 'Worksheet', policies: ['GV-GB-001', 'GV-OG-001'], domainCode: 'GV', usage: 'Required', frequency: 'Annual', classifications: ['master_template', 'audit_critical'] },
  { id: 'GV-FM-004', name: 'Governing Body Meeting Agenda Template', type: 'Template', policies: ['GV-GB-001', 'GV-GB-002'], domainCode: 'GV', usage: 'Required', frequency: 'Triggered', classifications: ['master_template'] },
  { id: 'GV-FM-005', name: 'Governing Body Meeting Minutes Template', type: 'Template', policies: ['GV-GB-001', 'GV-GB-002'], domainCode: 'GV', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'GV-FM-006', name: 'Conflict of Interest Disclosure Form', type: 'Attestation', policies: ['GV-GB-001', 'GV-GB-003'], domainCode: 'GV', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'digital_candidate'] },
  { id: 'GV-FM-007', name: 'Administrator Delegation of Authority Agreement', type: 'Form', policies: ['GV-GB-001', 'GV-OG-005'], domainCode: 'GV', usage: 'Required', frequency: 'Triggered', classifications: ['high_risk', 'audit_critical'] },
  { id: 'GV-FM-008', name: 'Governing Body Annual Self-Assessment Tool', type: 'Assessment', policies: ['GV-GB-001', 'GV-GB-005'], domainCode: 'GV', usage: 'Required', frequency: 'Annual', classifications: [] },
  { id: 'GV-FM-009', name: 'Annual Strategic Planning Worksheet', type: 'Worksheet', policies: ['GV-OG-004'], domainCode: 'GV', usage: 'Required', frequency: 'Annual', classifications: [] },
  { id: 'GV-FM-010', name: 'Legal Counsel Engagement Authorization', type: 'Form', policies: ['GV-EA-003'], domainCode: 'GV', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'GV-FM-011', name: 'Governing Body Roster & Contact Matrix', type: 'Tracking Tool', policies: ['GV-GB-001'], domainCode: 'GV', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'GV-FM-012', name: 'Executive Session Confidentiality Agreement', type: 'Attestation', policies: ['GV-GB-002'], domainCode: 'GV', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'GV-FM-013', name: 'Administrator Succession Plan Template', type: 'Template', policies: ['GV-GB-004'], domainCode: 'GV', usage: 'Required', frequency: 'Annual', classifications: ['high_risk', 'audit_critical'] },
  { id: 'GV-FM-014', name: 'Administrator Qualification Verification Checklist', type: 'Checklist', policies: ['GV-OG-002'], domainCode: 'GV', usage: 'Required', frequency: 'Upon Hire', classifications: ['audit_critical'] },
  { id: 'GV-FM-015', name: 'Clinical Manager Qualification Checklist', type: 'Checklist', policies: ['GV-OG-002'], domainCode: 'GV', usage: 'Required', frequency: 'Upon Hire', classifications: ['audit_critical'] },
  { id: 'GV-FM-016', name: 'Scope of Services Definition Matrix', type: 'Matrix', policies: ['GV-OG-003'], domainCode: 'GV', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'master_template'] },
  { id: 'GV-FM-017', name: 'Delegation of Authority (DOA) Log', type: 'Log', policies: ['GV-OG-005'], domainCode: 'GV', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'GV-FM-018', name: 'Interagency Agreement / Contract Register', type: 'Tracking Tool', policies: ['GV-EA-001'], domainCode: 'GV', usage: 'Required', frequency: 'Ongoing', classifications: ['shared_enterprise'] },
  { id: 'GV-FM-019', name: 'Agency Licensure & Certification Tracking Log', type: 'Log', policies: ['GV-EA-004'], domainCode: 'GV', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical', 'high_risk'] },
  { id: 'GV-FM-020', name: 'Media/PR External Communication Request', type: 'Form', policies: ['GV-EA-002'], domainCode: 'GV', usage: 'Conditional', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'GV-FM-021', name: 'Board Member Appointment & Resignation Record', type: 'Form', policies: ['GV-GB-001'], domainCode: 'GV', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'GV-FM-022', name: 'Executive Session Minutes Template', type: 'Template', policies: ['GV-GB-002'], domainCode: 'GV', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk', 'master_template'] },
  { id: 'GV-FM-023', name: 'Annual Compliance Report to Governing Body', type: 'Template', policies: ['GV-GB-001', 'CO-CP-001'], domainCode: 'GV', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'master_template'] },
  { id: 'GV-FM-024', name: 'Governing Body Training & Education Log', type: 'Log', policies: ['GV-GB-001'], domainCode: 'GV', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'GV-FM-025', name: 'Stakeholder Grievance & Feedback Tracking Log', type: 'Log', policies: ['GV-PM-005'], domainCode: 'GV', usage: 'Required', frequency: 'Ongoing', classifications: [] },

  // ── HUMAN RESOURCES (HR) ── 39 forms
  { id: 'HR-FM-001', name: 'Reasonable Suspicion Observation Checklist', type: 'Checklist', policies: ['HR-ER-005'], domainCode: 'HR', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk', 'digital_candidate'] },
  { id: 'HR-FM-002', name: 'Drug/Alcohol Test Result Action Form', type: 'Form', policies: ['HR-ER-005'], domainCode: 'HR', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'HR-FM-003', name: 'Interview & Applicant Evaluation Form', type: 'Assessment', policies: ['HR-TA-001'], domainCode: 'HR', usage: 'Required', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'HR-FM-004', name: 'Employee Reference Check Log', type: 'Log', policies: ['HR-TA-001'], domainCode: 'HR', usage: 'Required', frequency: 'Triggered', classifications: [] },
  { id: 'HR-FM-005', name: 'OIG/SAM Monthly Exclusion Verification Log', type: 'Log', policies: ['HR-TA-003'], domainCode: 'HR', usage: 'Required', frequency: 'Monthly', classifications: ['audit_critical', 'high_risk'] },
  { id: 'HR-FM-006', name: 'License & Cert Primary Source Verification', type: 'Checklist', policies: ['HR-TA-004'], domainCode: 'HR', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'HR-FM-007', name: 'New Hire Onboarding & Orientation Checklist', type: 'Checklist', policies: ['HR-TA-005'], domainCode: 'HR', usage: 'Required', frequency: 'Upon Hire', classifications: ['digital_candidate'] },
  { id: 'HR-FM-008', name: 'Annual Performance Evaluation Form', type: 'Assessment', policies: ['HR-ER-001'], domainCode: 'HR', usage: 'Required', frequency: 'Annual', classifications: ['master_template'] },
  { id: 'HR-FM-009', name: 'Progressive Disciplinary Action Form', type: 'Form', policies: ['HR-ER-002'], domainCode: 'HR', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'HR-FM-010', name: 'Employee Grievance / Complaint Form', type: 'Form', policies: ['HR-ER-003'], domainCode: 'HR', usage: 'Conditional', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'HR-FM-011', name: 'Employee Exit Interview Form', type: 'Assessment', policies: ['HR-ER-006'], domainCode: 'HR', usage: 'Required', frequency: 'Triggered', classifications: [] },
  { id: 'HR-FM-012', name: 'TB Screening & Questionnaire', type: 'Assessment', policies: ['HR-WM-003'], domainCode: 'HR', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'HR-FM-013', name: 'Hepatitis B Vaccine Declination Form', type: 'Attestation', policies: ['HR-WM-003', 'HR-EH-101'], domainCode: 'HR', usage: 'Conditional', frequency: 'Upon Hire', classifications: ['audit_critical'] },
  { id: 'HR-FM-014', name: 'Employee Health & Occupational Injury Report', type: 'Form', policies: ['HR-WM-004', 'RM-OS-101'], domainCode: 'HR', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'HR-FM-015', name: 'Personnel File Content Audit Checklist', type: 'Checklist', policies: ['HR-WM-007'], domainCode: 'HR', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'HR-FM-016', name: 'Clinical Staff Competency Validation Checklist', type: 'Checklist', policies: ['HR-TD-003', 'CL-SD-007'], domainCode: 'HR', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'shared_enterprise'] },
  { id: 'HR-FM-017', name: 'Training Attendance & Completion Roster', type: 'Tracking Tool', policies: ['HR-TR-101'], domainCode: 'HR', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical', 'shared_enterprise'] },
  { id: 'HR-FM-018', name: 'Background Check Authorization & Summary', type: 'Form', policies: ['HR-TA-002'], domainCode: 'HR', usage: 'Required', frequency: 'Upon Hire', classifications: ['audit_critical', 'high_risk'] },
  { id: 'HR-FM-019', name: 'Staff Scheduling & Availability Form', type: 'Form', policies: ['HR-WM-001'], domainCode: 'HR', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'HR-FM-020', name: 'Contractor / Per Diem Onboarding Checklist', type: 'Checklist', policies: ['HR-WM-002'], domainCode: 'HR', usage: 'Required', frequency: 'Upon Hire', classifications: ['audit_critical'] },
  { id: 'HR-FM-021', name: 'Annual Immunization & Health Screening Log', type: 'Log', policies: ['HR-WM-003', 'HR-EH-101'], domainCode: 'HR', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'HR-FM-022', name: 'OSHA 300 Injury & Illness Log', type: 'Log', policies: ['HR-WM-004', 'RM-OS-101'], domainCode: 'HR', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'HR-FM-023', name: 'Workplace Safety Incident Report', type: 'Form', policies: ['HR-WM-004', 'RM-OS-101'], domainCode: 'HR', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'HR-FM-024', name: 'CEU / Training Exception Request', type: 'Form', policies: ['HR-TD-002'], domainCode: 'HR', usage: 'Conditional', frequency: 'Triggered', classifications: [] },
  { id: 'HR-FM-025', name: 'Student / Intern Supervision Agreement', type: 'Attestation', policies: ['HR-TD-004'], domainCode: 'HR', usage: 'Required', frequency: 'Triggered', classifications: [] },
  { id: 'HR-FM-026', name: 'Volunteer Service Agreement', type: 'Attestation', policies: ['HR-WM-006'], domainCode: 'HR', usage: 'Required', frequency: 'Triggered', classifications: [] },
  { id: 'HR-FM-027', name: 'Expense Reimbursement Request', type: 'Form', policies: ['HR-WM-001'], domainCode: 'HR', usage: 'Conditional', frequency: 'Triggered', classifications: [] },
  { id: 'HR-FM-028', name: 'Remote Work / Telehealth Agreement', type: 'Attestation', policies: ['HR-ER-008'], domainCode: 'HR', usage: 'Conditional', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'HR-FM-029', name: 'Anti-Harassment Policy Acknowledgment', type: 'Attestation', policies: ['HR-ER-004'], domainCode: 'HR', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'digital_candidate'] },
  { id: 'HR-FM-030', name: 'Emergency Preparedness Drill Participation Log', type: 'Log', policies: ['HR-TD-005'], domainCode: 'HR', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'HR-FM-031', name: 'Job Description Acknowledgment Form', type: 'Attestation', policies: ['HR-TA-006'], domainCode: 'HR', usage: 'Required', frequency: 'Upon Hire', classifications: ['digital_candidate'] },
  { id: 'HR-FM-032', name: 'Corrective Action Plan (Employee)', type: 'Form', policies: ['HR-ER-002'], domainCode: 'HR', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'HR-FM-033', name: 'Mandatory Reporter Attestation', type: 'Attestation', policies: ['HR-ER-009'], domainCode: 'HR', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'HR-FM-034', name: 'HR Audit Readiness Checklist', type: 'Checklist', policies: ['HR-WM-007'], domainCode: 'HR', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'shared_enterprise'] },
  { id: 'HR-FM-035', name: 'Workforce Diversity & Inclusion Action Plan', type: 'Template', policies: ['HR-ER-007'], domainCode: 'HR', usage: 'Required', frequency: 'Annual', classifications: [] },
  { id: 'HR-FM-036', name: 'Post-Incident Psychological Support Referral', type: 'Form', policies: ['HR-ER-001', 'RM-SS-002'], domainCode: 'HR', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'HR-FM-037', name: 'Confidentiality & Non-Disclosure Agreement', type: 'Attestation', policies: ['HR-TA-001', 'CO-HP-001'], domainCode: 'HR', usage: 'Required', frequency: 'Upon Hire', classifications: ['digital_candidate'] },
  { id: 'HR-FM-038', name: 'Competency Remediation Plan', type: 'Form', policies: ['HR-TD-003'], domainCode: 'HR', usage: 'Conditional', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'HR-FM-039', name: 'Staff Recognition & Performance Excellence Log', type: 'Log', policies: ['HR-ER-001'], domainCode: 'HR', usage: 'Optional', frequency: 'Ongoing', classifications: [] },

  // ── CLINICAL OPERATIONS (CL) ── 57 forms
  { id: 'CL-FM-001', name: 'Start of Care (SOC) Comprehensive Assessment', type: 'Assessment', policies: ['CL-CA-001', 'CL-OA-009'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical', 'master_template'] },
  { id: 'CL-FM-002', name: 'OASIS-E1 Assessment Form', type: 'Assessment', policies: ['CL-CA-002', 'CL-OA-001'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical'] },
  { id: 'CL-FM-003', name: 'Recertification / ROC Assessment', type: 'Assessment', policies: ['CL-CA-004', 'CL-OA-004'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical'] },
  { id: 'CL-FM-004', name: 'Discharge / Transfer Assessment', type: 'Assessment', policies: ['CL-CP-006', 'CL-CA-001'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical'] },
  { id: 'CL-FM-005', name: 'Plan of Care (485 Form)', type: 'Template', policies: ['CL-CP-001'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical', 'master_template'] },
  { id: 'CL-FM-006', name: 'Physician Orders Sheet', type: 'Template', policies: ['CL-CP-003'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical', 'master_template'] },
  { id: 'CL-FM-007', name: 'Verbal Order Log', type: 'Log', policies: ['CL-CP-004'], domainCode: 'CL', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'CL-FM-008', name: 'Physician Order Signature Tracking Log', type: 'Tracking Tool', policies: ['CL-CP-009'], domainCode: 'CL', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'CL-FM-009', name: 'Homebound Status Determination Checklist', type: 'Checklist', policies: ['CL-CA-005'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical'] },
  { id: 'CL-FM-010', name: 'Face-to-Face Encounter Documentation', type: 'Template', policies: ['CL-CA-006', 'CL-CA-007'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical', 'master_template'] },
  { id: 'CL-FM-011', name: 'Missed Visit Documentation Form', type: 'Form', policies: ['CL-SD-024'], domainCode: 'CL', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'CL-FM-012', name: 'Visit Frequency Compliance Tracking Log', type: 'Log', policies: ['CL-SD-025'], domainCode: 'CL', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'CL-FM-013', name: 'Clinical Skilled Note — RN', type: 'Template', policies: ['CL-SD-001', 'CL-CD-001'], domainCode: 'CL', usage: 'Required', frequency: 'Per Visit', classifications: ['audit_critical', 'master_template'] },
  { id: 'CL-FM-014', name: 'Clinical Skilled Note — PT/OT/SLP', type: 'Template', policies: ['CL-SD-002', 'CL-SD-003', 'CL-SD-004', 'CL-CD-001'], domainCode: 'CL', usage: 'Required', frequency: 'Per Visit', classifications: ['audit_critical', 'master_template'] },
  { id: 'CL-FM-015', name: 'Home Health Aide Visit Record', type: 'Template', policies: ['CL-SD-006'], domainCode: 'CL', usage: 'Required', frequency: 'Per Visit', classifications: ['audit_critical', 'master_template'] },
  { id: 'CL-FM-016', name: 'HHA Competency Evaluation Checklist', type: 'Checklist', policies: ['CL-SD-007'], domainCode: 'CL', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'CL-FM-017', name: 'Wound Assessment & Care Flow Sheet', type: 'Tracking Tool', policies: ['CL-SD-011'], domainCode: 'CL', usage: 'Required', frequency: 'Per Visit', classifications: ['audit_critical'] },
  { id: 'CL-FM-018', name: 'Medication Administration Record (MAR)', type: 'Log', policies: ['CL-SD-012'], domainCode: 'CL', usage: 'Required', frequency: 'Per Visit', classifications: ['audit_critical', 'high_risk'] },
  { id: 'CL-FM-019', name: 'Medication Reconciliation Worksheet', type: 'Worksheet', policies: ['CL-SD-013'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical', 'high_risk'] },
  { id: 'CL-FM-020', name: 'Fall Risk Assessment Tool', type: 'Assessment', policies: ['CL-SD-015'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical', 'high_risk'] },
  { id: 'CL-FM-021', name: 'Infection Control Precautions Checklist', type: 'Checklist', policies: ['CL-SD-016'], domainCode: 'CL', usage: 'Required', frequency: 'Per Visit', classifications: ['audit_critical'] },
  { id: 'CL-FM-022', name: 'Patient Education Documentation Record', type: 'Tracking Tool', policies: ['CL-SD-017'], domainCode: 'CL', usage: 'Required', frequency: 'Per Visit', classifications: ['audit_critical'] },
  { id: 'CL-FM-023', name: 'Diabetic Management Flow Sheet', type: 'Tracking Tool', policies: ['CL-SD-018'], domainCode: 'CL', usage: 'Required', frequency: 'Per Visit', classifications: ['high_risk'] },
  { id: 'CL-FM-024', name: 'Cardiac & Respiratory Monitoring Log', type: 'Log', policies: ['CL-SD-019', 'CL-SD-020'], domainCode: 'CL', usage: 'Required', frequency: 'Per Visit', classifications: ['high_risk'] },
  { id: 'CL-FM-025', name: 'Telehealth Service Consent & Documentation', type: 'Attestation', policies: ['CL-SD-009'], domainCode: 'CL', usage: 'Conditional', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'CL-FM-026', name: 'Pain Assessment Scale & Management Log', type: 'Log', policies: ['CL-SD-014'], domainCode: 'CL', usage: 'Required', frequency: 'Per Visit', classifications: ['high_risk'] },
  { id: 'CL-FM-027', name: 'Patient Rights & Responsibilities Acknowledgment', type: 'Attestation', policies: ['CL-PR-001'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical', 'digital_candidate'] },
  { id: 'CL-FM-028', name: 'Advance Directive Documentation & Review', type: 'Checklist', policies: ['CL-PR-002'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical'] },
  { id: 'CL-FM-029', name: 'Informed Consent Form', type: 'Attestation', policies: ['CL-PR-003'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical', 'digital_candidate'] },
  { id: 'CL-FM-030', name: 'Abuse / Neglect Incident Report', type: 'Form', policies: ['CL-PR-006'], domainCode: 'CL', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk', 'audit_critical'] },
  { id: 'CL-FM-031', name: 'OASIS Pre-Submission QA Checklist', type: 'Checklist', policies: ['CL-OA-002', 'CL-OA-019'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical'] },
  { id: 'CL-FM-032', name: 'OASIS Coding Decision Worksheet', type: 'Worksheet', policies: ['CL-OA-007', 'CL-OA-012'], domainCode: 'CL', usage: 'Conditional', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'CL-FM-033', name: 'Late Entry / Amendment Documentation Form', type: 'Form', policies: ['CL-CD-003'], domainCode: 'CL', usage: 'Conditional', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'CL-FM-034', name: 'Clinical Record Completion Audit Checklist', type: 'Checklist', policies: ['CL-CD-004'], domainCode: 'CL', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'CL-FM-035', name: 'Coordination of Care Communication Log', type: 'Log', policies: ['CL-CP-005'], domainCode: 'CL', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'CL-FM-036', name: 'Transfer / Discharge Summary', type: 'Template', policies: ['CL-CP-006', 'CL-CP-007'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical', 'master_template'] },
  { id: 'CL-FM-037', name: 'Palliative / End-of-Life Care Plan', type: 'Template', policies: ['CL-SD-023'], domainCode: 'CL', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'CL-FM-038', name: 'Behavioral Health Screening Tool', type: 'Assessment', policies: ['CL-SD-022'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: [] },
  { id: 'CL-FM-039', name: 'Pediatric Clinical Assessment Form', type: 'Assessment', policies: ['CL-SD-021'], domainCode: 'CL', usage: 'Conditional', frequency: 'Per Episode', classifications: [] },
  { id: 'CL-FM-040', name: 'IV / Infusion Therapy Monitoring Log', type: 'Log', policies: ['CL-SD-010'], domainCode: 'CL', usage: 'Conditional', frequency: 'Per Visit', classifications: ['high_risk', 'audit_critical'] },
  { id: 'CL-FM-041', name: 'Medical Social Work Assessment & Plan', type: 'Assessment', policies: ['CL-SD-005'], domainCode: 'CL', usage: 'Conditional', frequency: 'Per Episode', classifications: [] },
  { id: 'CL-FM-042', name: 'Supervisory Visit Documentation (RN)', type: 'Template', policies: ['CL-SD-008'], domainCode: 'CL', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'CL-FM-043', name: 'Emergency Preparedness Clinical Protocol', type: 'Reference', policies: ['CL-PR-005'], domainCode: 'CL', usage: 'Required', frequency: 'Annual', classifications: ['shared_enterprise'] },
  { id: 'CL-FM-044', name: 'Physician Recertification Tracking Log', type: 'Log', policies: ['CL-CP-008'], domainCode: 'CL', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'CL-FM-045', name: 'OASIS Transmission Confirmation Log', type: 'Log', policies: ['CL-CA-003', 'CL-OA-003'], domainCode: 'CL', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'CL-FM-046', name: 'Patient / Family Caregiver Training Record', type: 'Tracking Tool', policies: ['CL-SD-017'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['digital_candidate'] },
  { id: 'CL-FM-047', name: 'High-Risk Patient Monitoring Protocol', type: 'Checklist', policies: ['CL-SD-019', 'CL-SD-020'], domainCode: 'CL', usage: 'Conditional', frequency: 'Ongoing', classifications: ['high_risk'] },
  { id: 'CL-FM-048', name: 'Inclement Weather Service Delay Documentation', type: 'Form', policies: ['CL-SD-024'], domainCode: 'CL', usage: 'Conditional', frequency: 'Triggered', classifications: [] },
  { id: 'CL-FM-049', name: 'Patient Complaint / Grievance Documentation', type: 'Form', policies: ['CL-PR-001'], domainCode: 'CL', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk', 'audit_critical'] },
  { id: 'CL-FM-050', name: 'Documentation Source Evidence Matrix', type: 'Matrix', policies: ['CL-OA-006', 'CL-OA-008'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical'] },
  { id: 'CL-FM-051', name: 'Clinician Competency Validation — OASIS', type: 'Checklist', policies: ['CL-OA-003', 'CL-OA-018'], domainCode: 'CL', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'CL-FM-052', name: 'Restraint-Free Environment Attestation', type: 'Attestation', policies: ['CL-PR-004'], domainCode: 'CL', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'CL-FM-053', name: 'Multi-Disciplinary Care Conference Notes', type: 'Template', policies: ['CL-CP-005'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical', 'master_template'] },
  { id: 'CL-FM-054', name: 'Episode Management Milestone Tracker', type: 'Tracking Tool', policies: ['CL-CP-002', 'FN-CM-004'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical'] },
  { id: 'CL-FM-055', name: 'Prior Authorization Request Log', type: 'Log', policies: ['CL-CP-001', 'FN-CM-004'], domainCode: 'CL', usage: 'Conditional', frequency: 'Ongoing', classifications: ['high_risk'] },
  { id: 'CL-FM-056', name: 'Standardized Assessment Tool Administration Checklist', type: 'Checklist', policies: ['CL-OA-011', 'CL-CA-001'], domainCode: 'CL', usage: 'Required', frequency: 'Per Episode', classifications: ['audit_critical'] },
  { id: 'CL-FM-057', name: 'Active POC Change Notification Log', type: 'Log', policies: ['CL-CP-003', 'CL-CP-004'], domainCode: 'CL', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },

  // ── COMPLIANCE (CO) ── 39 forms
  { id: 'CO-FM-001', name: 'Annual Compliance Program Attestation', type: 'Attestation', policies: ['CO-CP-001'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'master_template'] },
  { id: 'CO-FM-002', name: 'Code of Conduct Acknowledgment Form', type: 'Attestation', policies: ['CO-CP-004'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'digital_candidate'] },
  { id: 'CO-FM-003', name: 'Compliance Hotline Submission Form', type: 'Form', policies: ['CO-CP-006'], domainCode: 'CO', usage: 'Conditional', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'CO-FM-004', name: 'Compliance Concern / Allegation Log', type: 'Log', policies: ['CO-CP-006', 'CO-CP-007'], domainCode: 'CO', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'CO-FM-005', name: 'Internal Compliance Audit Work Program', type: 'Template', policies: ['CO-RA-002'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'master_template'] },
  { id: 'CO-FM-006', name: 'Survey / Inspection Readiness Self-Assessment', type: 'Checklist', policies: ['CO-RA-003'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'CO-FM-007', name: 'Survey / Inspection Findings Tracking Log', type: 'Log', policies: ['CO-RA-003', 'CO-RA-007'], domainCode: 'CO', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical', 'high_risk'] },
  { id: 'CO-FM-008', name: 'Plan of Correction (PoC) Template', type: 'Template', policies: ['CO-RA-007'], domainCode: 'CO', usage: 'Conditional', frequency: 'Triggered', classifications: ['audit_critical', 'master_template'] },
  { id: 'CO-FM-009', name: 'Regulatory Change Impact Assessment', type: 'Worksheet', policies: ['CO-RA-001'], domainCode: 'CO', usage: 'Conditional', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'CO-FM-010', name: 'Anti-Kickback Attestation Form', type: 'Attestation', policies: ['CO-FA-001'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'CO-FM-011', name: 'Physician Relationship / Referral Disclosure', type: 'Attestation', policies: ['CO-FA-001', 'CO-CP-004'], domainCode: 'CO', usage: 'Conditional', frequency: 'Triggered', classifications: ['audit_critical', 'high_risk'] },
  { id: 'CO-FM-012', name: 'FWA Training Completion Log', type: 'Log', policies: ['CO-FW-101'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'shared_enterprise'] },
  { id: 'CO-FM-013', name: 'HIPAA Workforce Training Log', type: 'Log', policies: ['CO-HP-001', 'CO-HP-002'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'shared_enterprise'] },
  { id: 'CO-FM-014', name: 'Breach Risk Assessment Worksheet', type: 'Worksheet', policies: ['CO-HP-003', 'CO-IR-101'], domainCode: 'CO', usage: 'Conditional', frequency: 'Triggered', classifications: ['audit_critical', 'high_risk'] },
  { id: 'CO-FM-015', name: 'HIPAA Breach Notification Letter Template', type: 'Template', policies: ['CO-HP-003', 'CO-IR-101'], domainCode: 'CO', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk', 'master_template'] },
  { id: 'CO-FM-016', name: 'Business Associate Agreement Template', type: 'Template', policies: ['CO-HP-005', 'CO-BA-101'], domainCode: 'CO', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical', 'master_template'] },
  { id: 'CO-FM-017', name: 'BAA Tracking Register', type: 'Tracking Tool', policies: ['CO-BA-101'], domainCode: 'CO', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical', 'shared_enterprise'] },
  { id: 'CO-FM-018', name: 'Patient Authorization to Release PHI', type: 'Form', policies: ['CO-HP-006'], domainCode: 'CO', usage: 'Required', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'CO-FM-019', name: 'Notice of Privacy Practices (NPP) Delivery Log', type: 'Log', policies: ['CO-HP-001'], domainCode: 'CO', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'CO-FM-020', name: 'Records Retention & Destruction Schedule', type: 'Tracking Tool', policies: ['CO-HP-007'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'shared_enterprise'] },
  { id: 'CO-FM-021', name: 'Documentation Alignment Audit Tool', type: 'Checklist', policies: ['CO-DC-004'], domainCode: 'CO', usage: 'Required', frequency: 'Quarterly', classifications: ['audit_critical'] },
  { id: 'CO-FM-022', name: 'Audit Trail Review Report', type: 'Assessment', policies: ['CO-DC-001'], domainCode: 'CO', usage: 'Required', frequency: 'Quarterly', classifications: ['audit_critical'] },
  { id: 'CO-FM-023', name: 'Documentation Deficiency Tracking Log', type: 'Log', policies: ['CO-DC-002'], domainCode: 'CO', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'CO-FM-024', name: 'Compliance Committee Meeting Minutes', type: 'Template', policies: ['CO-CP-003'], domainCode: 'CO', usage: 'Required', frequency: 'Quarterly', classifications: ['audit_critical', 'master_template'] },
  { id: 'CO-FM-025', name: 'Workforce Exclusion Screening Log', type: 'Log', policies: ['CO-CP-001', 'HR-TA-003'], domainCode: 'CO', usage: 'Required', frequency: 'Monthly', classifications: ['audit_critical', 'high_risk'] },
  { id: 'CO-FM-026', name: 'HIPAA Security Risk Analysis Template', type: 'Template', policies: ['CO-HP-002', 'IT-SC-001'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'master_template'] },
  { id: 'CO-FM-027', name: 'Vendor PHI Risk Assessment Worksheet', type: 'Worksheet', policies: ['CO-BA-101'], domainCode: 'CO', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'CO-FM-028', name: 'Incident Containment & Eradication Log', type: 'Log', policies: ['CO-IR-101'], domainCode: 'CO', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk', 'audit_critical'] },
  { id: 'CO-FM-029', name: 'Minimum Necessary Exception Request', type: 'Form', policies: ['CO-DG-101'], domainCode: 'CO', usage: 'Conditional', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'CO-FM-030', name: 'OIG Self-Disclosure Protocol Checklist', type: 'Checklist', policies: ['CO-FW-101'], domainCode: 'CO', usage: 'Conditional', frequency: 'Triggered', classifications: ['audit_critical', 'high_risk'] },
  { id: 'CO-FM-031', name: 'AI Tool Use Request & Approval Form', type: 'Form', policies: ['CO-AI-101'], domainCode: 'CO', usage: 'Conditional', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'CO-FM-032', name: 'Annual Internal Audit Calendar', type: 'Template', policies: ['CO-RA-002'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['shared_enterprise', 'master_template'] },
  { id: 'CO-FM-033', name: 'Sanctions & Enforcement Response Tracker', type: 'Tracking Tool', policies: ['CO-RA-007'], domainCode: 'CO', usage: 'Conditional', frequency: 'Triggered', classifications: ['audit_critical', 'high_risk'] },
  { id: 'CO-FM-034', name: 'Medicare CoP Compliance Verification Checklist', type: 'Checklist', policies: ['CO-RA-004'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'CO-FM-035', name: 'State Licensure Renewal Tracking Log', type: 'Log', policies: ['CO-RA-005'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'CO-FM-036', name: 'Accreditation Standards Gap Analysis Tool', type: 'Worksheet', policies: ['CO-RA-006'], domainCode: 'CO', usage: 'Conditional', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'CO-FM-037', name: 'FWA Risk Stratification Matrix', type: 'Matrix', policies: ['CO-FW-101', 'CO-FA-003'], domainCode: 'CO', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'high_risk'] },
  { id: 'CO-FM-038', name: 'Documentation Correction & Amendment Audit Log', type: 'Log', policies: ['CO-DC-003'], domainCode: 'CO', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'CO-FM-039', name: 'AI System Impact Assessment Template', type: 'Template', policies: ['CO-AI-101'], domainCode: 'CO', usage: 'Required', frequency: 'Triggered', classifications: ['high_risk', 'master_template'] },

  // ── QAPI (QA) ── 13 forms
  { id: 'QA-FM-001', name: 'QAPI Committee Meeting Minutes Template', type: 'Template', policies: ['QA-PG-003'], domainCode: 'QA', usage: 'Required', frequency: 'Quarterly', classifications: ['audit_critical', 'master_template'] },
  { id: 'QA-FM-002', name: 'Performance Improvement Project (PIP) Charter', type: 'Template', policies: ['QA-PI-001'], domainCode: 'QA', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'QA-FM-003', name: 'Quality Indicator Monthly Dashboard', type: 'Tracking Tool', policies: ['QA-PI-002'], domainCode: 'QA', usage: 'Required', frequency: 'Monthly', classifications: ['shared_enterprise'] },
  { id: 'QA-FM-004', name: 'Adverse Event Root Cause Analysis (RCA) Worksheet', type: 'Worksheet', policies: ['QA-AE-002'], domainCode: 'QA', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical', 'high_risk'] },
  { id: 'QA-FM-005', name: 'Corrective Action Plan (CAP) Tracking Tool', type: 'Tracking Tool', policies: ['QA-AE-003'], domainCode: 'QA', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'QA-FM-006', name: 'Infection Control Line List & Surveillance Log', type: 'Log', policies: ['QA-SM-002', 'CL-SD-016'], domainCode: 'QA', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'QA-FM-007', name: 'LUPA Prevention & Visit Utilization Log', type: 'Log', policies: ['QA-PI-006', 'FN-CM-005'], domainCode: 'QA', usage: 'Required', frequency: 'Ongoing', classifications: ['shared_enterprise'] },
  { id: 'QA-FM-008', name: 'Patient Satisfaction Survey (HHCAHPS) Proxy', type: 'Assessment', policies: ['QA-SM-003'], domainCode: 'QA', usage: 'Optional', frequency: 'Triggered', classifications: [] },
  { id: 'QA-FM-009', name: 'Star Rating Improvement Action Plan', type: 'Template', policies: ['QA-SM-004'], domainCode: 'QA', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical', 'master_template'] },
  { id: 'QA-FM-010', name: 'QAPI Self-Assessment Annual Checklist', type: 'Checklist', policies: ['QA-PG-002'], domainCode: 'QA', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'QA-FM-011', name: 'Outcome Benchmarking Comparison Report', type: 'Assessment', policies: ['QA-PI-003', 'QA-SM-004'], domainCode: 'QA', usage: 'Required', frequency: 'Quarterly', classifications: ['shared_enterprise'] },
  { id: 'QA-FM-012', name: 'Policy Effectiveness Monitoring Worksheet', type: 'Worksheet', policies: ['QA-SM-005'], domainCode: 'QA', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'QA-FM-013', name: 'Patient Safety Event Communication Log', type: 'Log', policies: ['QA-AE-001', 'QA-AE-004'], domainCode: 'QA', usage: 'Required', frequency: 'Ongoing', classifications: ['high_risk', 'audit_critical'] },

  // ── FINANCE (FN) ── 13 forms
  { id: 'FN-FM-001', name: 'Daily Claims Submission & Acceptance Log', type: 'Log', policies: ['FN-BC-001'], domainCode: 'FN', usage: 'Required', frequency: 'Daily', classifications: [] },
  { id: 'FN-FM-002', name: 'Claim Denial & Appeal Tracking Log', type: 'Tracking Tool', policies: ['FN-BC-002'], domainCode: 'FN', usage: 'Required', frequency: 'Ongoing', classifications: ['high_risk'] },
  { id: 'FN-FM-003', name: 'Request for Anticipated Payment (RAP) Tracking Log', type: 'Log', policies: ['FN-BC-006'], domainCode: 'FN', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'FN-FM-004', name: 'Patient Financial Responsibility Agreement', type: 'Attestation', policies: ['FN-BC-003'], domainCode: 'FN', usage: 'Required', frequency: 'Per Episode', classifications: ['digital_candidate'] },
  { id: 'FN-FM-005', name: 'Credit Card / Auto-Pay Authorization Form', type: 'Form', policies: ['FN-BC-003'], domainCode: 'FN', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'FN-FM-006', name: 'Overpayment Identification & Refund Log', type: 'Log', policies: ['FN-BC-004'], domainCode: 'FN', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical', 'high_risk'] },
  { id: 'FN-FM-007', name: 'Bad Debt & Charity Care Application', type: 'Form', policies: ['FN-FP-004'], domainCode: 'FN', usage: 'Conditional', frequency: 'Triggered', classifications: [] },
  { id: 'FN-FM-008', name: 'Pre-Claim Review (PCR) Checklist', type: 'Checklist', policies: ['FN-BC-005'], domainCode: 'FN', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'FN-FM-009', name: 'Episode Financial Performance Analysis', type: 'Worksheet', policies: ['FN-CM-001', 'FN-FP-003'], domainCode: 'FN', usage: 'Required', frequency: 'Quarterly', classifications: ['shared_enterprise'] },
  { id: 'FN-FM-010', name: 'PDGM LUPA Mitigation Tracker', type: 'Tracking Tool', policies: ['QA-PI-006', 'FN-CM-005'], domainCode: 'FN', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'FN-FM-011', name: 'Revenue Cycle KPI Dashboard', type: 'Tracking Tool', policies: ['FN-FP-003'], domainCode: 'FN', usage: 'Required', frequency: 'Monthly', classifications: ['shared_enterprise'] },
  { id: 'FN-FM-012', name: 'Supply & Equipment Purchase Request Log', type: 'Log', policies: ['FN-FP-006'], domainCode: 'FN', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'FN-FM-013', name: 'Charge Capture Audit & Fee Schedule Review', type: 'Checklist', policies: ['FN-FP-002'], domainCode: 'FN', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },

  // ── IT & SECURITY (IT) ── 30 forms
  { id: 'IT-FM-001', name: 'User Access Request & Authorization Form', type: 'Form', policies: ['IT-SC-002'], domainCode: 'IT', usage: 'Required', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'IT-FM-002', name: 'System Access Revocation Checklist', type: 'Checklist', policies: ['IT-SC-002', 'HR-ER-006'], domainCode: 'IT', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical', 'high_risk'] },
  { id: 'IT-FM-003', name: 'IT Hardware Asset & Disposal Log', type: 'Log', policies: ['IT-SA-005'], domainCode: 'IT', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'IT-FM-004', name: 'Software & Application License Register', type: 'Tracking Tool', policies: ['IT-SA-002'], domainCode: 'IT', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'IT-FM-005', name: 'BYOD (Bring Your Own Device) Agreement', type: 'Attestation', policies: ['IT-UP-001'], domainCode: 'IT', usage: 'Required', frequency: 'Upon Hire', classifications: ['digital_candidate'] },
  { id: 'IT-FM-006', name: 'Internet & Email Acceptable Use Agreement', type: 'Attestation', policies: ['IT-UP-002'], domainCode: 'IT', usage: 'Required', frequency: 'Upon Hire', classifications: ['digital_candidate'] },
  { id: 'IT-FM-007', name: 'Social Media Policy Acknowledgment', type: 'Attestation', policies: ['IT-UP-003'], domainCode: 'IT', usage: 'Required', frequency: 'Upon Hire', classifications: ['digital_candidate'] },
  { id: 'IT-FM-008', name: 'Data Backup & Restore Testing Log', type: 'Log', policies: ['IT-DR-001'], domainCode: 'IT', usage: 'Required', frequency: 'Monthly', classifications: ['audit_critical'] },
  { id: 'IT-FM-009', name: 'IT Security Incident Report Form', type: 'Form', policies: ['IT-DR-005'], domainCode: 'IT', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'IT-FM-010', name: 'System Change Management Request (CMR) Form', type: 'Form', policies: ['IT-SA-003'], domainCode: 'IT', usage: 'Required', frequency: 'Triggered', classifications: [] },
  { id: 'IT-FM-011', name: 'Information Security Risk Assessment (SRA) Template', type: 'Template', policies: ['IT-SC-001'], domainCode: 'IT', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'master_template'] },
  { id: 'IT-FM-012', name: 'Privileged Access User (PAU) Agreement', type: 'Attestation', policies: ['IT-SC-002'], domainCode: 'IT', usage: 'Required', frequency: 'Upon Hire', classifications: ['high_risk', 'digital_candidate'] },
  { id: 'IT-FM-013', name: 'Encryption Exception Request Form', type: 'Form', policies: ['IT-SC-003'], domainCode: 'IT', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'IT-FM-014', name: 'Firewall Rule Change Authorization Form', type: 'Form', policies: ['IT-SC-004'], domainCode: 'IT', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'IT-FM-015', name: 'VPN / Remote Access Request Form', type: 'Form', policies: ['IT-SC-004'], domainCode: 'IT', usage: 'Required', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'IT-FM-016', name: 'Endpoint Malware Infection Log', type: 'Log', policies: ['IT-SC-005'], domainCode: 'IT', usage: 'Required', frequency: 'Ongoing', classifications: ['high_risk'] },
  { id: 'IT-FM-017', name: 'Data Classification & Handling Matrix', type: 'Matrix', policies: ['IT-SC-006'], domainCode: 'IT', usage: 'Required', frequency: 'Annual', classifications: ['shared_enterprise', 'audit_critical'] },
  { id: 'IT-FM-018', name: 'Disaster Recovery Tabletop Exercise Report', type: 'Assessment', policies: ['IT-DR-002'], domainCode: 'IT', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'IT-FM-019', name: 'Audit Log Review Checklist', type: 'Checklist', policies: ['IT-DR-003'], domainCode: 'IT', usage: 'Required', frequency: 'Monthly', classifications: ['audit_critical'] },
  { id: 'IT-FM-020', name: 'Cloud Service Provider Security Questionnaire', type: 'Assessment', policies: ['IT-DR-004', 'IT-SA-004'], domainCode: 'IT', usage: 'Required', frequency: 'Triggered', classifications: ['shared_enterprise', 'high_risk'] },
  { id: 'IT-FM-021', name: 'EHR Downtime Communication Protocol Checklist', type: 'Checklist', policies: ['IT-SA-001'], domainCode: 'IT', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'IT-FM-022', name: 'EHR Access Audit Log', type: 'Log', policies: ['IT-SA-001'], domainCode: 'IT', usage: 'Required', frequency: 'Quarterly', classifications: ['audit_critical'] },
  { id: 'IT-FM-023', name: 'Server Room / MDF Physical Access Log', type: 'Log', policies: ['IT-SA-005'], domainCode: 'IT', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'IT-FM-024', name: 'IT Media & Storage Device Destruction Certificate', type: 'Attestation', policies: ['IT-SA-005'], domainCode: 'IT', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'IT-FM-025', name: 'Remote Device Wipe Authorization Form', type: 'Form', policies: ['IT-UP-001'], domainCode: 'IT', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'IT-FM-026', name: 'Phishing Simulation Campaign Report', type: 'Assessment', policies: ['IT-UP-004'], domainCode: 'IT', usage: 'Required', frequency: 'Quarterly', classifications: [] },
  { id: 'IT-FM-027', name: 'Security Awareness Training Completion Roster', type: 'Tracking Tool', policies: ['IT-UP-004'], domainCode: 'IT', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'shared_enterprise'] },
  { id: 'IT-FM-028', name: 'IT Vendor Due Diligence Checklist', type: 'Checklist', policies: ['IT-SA-004', 'CO-BA-101'], domainCode: 'IT', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical', 'high_risk'] },
  { id: 'IT-FM-029', name: 'Penetration Testing & Vulnerability Report', type: 'Assessment', policies: ['IT-SC-001', 'IT-DR-003'], domainCode: 'IT', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'IT-FM-030', name: 'Cloud Data Sovereignty & Compliance Declaration', type: 'Attestation', policies: ['IT-DR-004'], domainCode: 'IT', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk', 'digital_candidate'] },

  // ── OPERATIONS (OP) ── 20 forms
  { id: 'OP-FM-001', name: 'Branch Registration Tracker', type: 'Tracking Tool', policies: ['OP-FM-002', 'GV-EA-004'], domainCode: 'OP', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'OP-FM-002', name: 'Quarterly Facility Inspection Report', type: 'Assessment', policies: ['OP-FM-002', 'RM-PS-001'], domainCode: 'OP', usage: 'Required', frequency: 'Quarterly', classifications: ['audit_critical'] },
  { id: 'OP-FM-003', name: 'Vendor Request Form', type: 'Form', policies: ['OP-FM-003', 'FN-FP-006'], domainCode: 'OP', usage: 'Required', frequency: 'Triggered', classifications: ['digital_candidate'] },
  { id: 'OP-FM-004', name: 'Vendor Qualification Checklist', type: 'Checklist', policies: ['OP-FM-003', 'CO-FA-001'], domainCode: 'OP', usage: 'Required', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'OP-FM-005', name: 'Approved Vendor List', type: 'Tracking Tool', policies: ['OP-FM-003'], domainCode: 'OP', usage: 'Required', frequency: 'Ongoing', classifications: ['shared_enterprise'] },
  { id: 'OP-FM-006', name: 'Vendor Performance Issue Log', type: 'Log', policies: ['OP-FM-003', 'QA-AE-001'], domainCode: 'OP', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'OP-FM-007', name: 'Vendor Performance Evaluation Form', type: 'Assessment', policies: ['OP-FM-003', 'QA-PI-001'], domainCode: 'OP', usage: 'Required', frequency: 'Annual', classifications: [] },
  { id: 'OP-FM-008', name: 'Vendor Corrective Action Notice', type: 'Form', policies: ['OP-FM-003', 'GV-EA-001'], domainCode: 'OP', usage: 'Conditional', frequency: 'Triggered', classifications: [] },
  { id: 'OP-FM-009', name: 'Emergency Procurement Authorization', type: 'Form', policies: ['OP-FM-003', 'RM-EP-001', 'FN-FP-006'], domainCode: 'OP', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'OP-FM-010', name: 'Incoming Mail Log', type: 'Log', policies: ['OP-FM-004'], domainCode: 'OP', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'OP-FM-011', name: 'Time-Sensitive Tracking Log', type: 'Log', policies: ['OP-FM-004', 'FN-BC-002', 'CL-CP-009'], domainCode: 'OP', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'OP-FM-012', name: 'Outgoing Mail Log', type: 'Log', policies: ['OP-FM-004'], domainCode: 'OP', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'OP-FM-013', name: 'Standard Fax Cover Sheet', type: 'Template', policies: ['OP-FM-004', 'CL-CP-003'], domainCode: 'OP', usage: 'Required', frequency: 'Ongoing', classifications: ['master_template', 'shared_enterprise'] },
  { id: 'OP-FM-014', name: 'Patient Intake Information Sheet', type: 'Form', policies: ['OP-IM-001'], domainCode: 'OP', usage: 'Required', frequency: 'Per Episode', classifications: ['digital_candidate'] },
  { id: 'OP-FM-015', name: 'Non-Admit / Referral Rejection Log', type: 'Log', policies: ['OP-IM-002'], domainCode: 'OP', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'OP-FM-016', name: 'Vehicle Mileage & Safety Inspection Log', type: 'Log', policies: ['OP-SL-003'], domainCode: 'OP', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'OP-FM-017', name: 'Patient Property & Belongings Inventory', type: 'Checklist', policies: ['OP-PA-005'], domainCode: 'OP', usage: 'Conditional', frequency: 'Triggered', classifications: [] },
  { id: 'OP-FM-018', name: 'Interpreter Service Utilization Log', type: 'Log', policies: ['OP-PA-003'], domainCode: 'OP', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'OP-FM-019', name: 'Scheduling Conflict & Resolution Log', type: 'Log', policies: ['OP-SL-001'], domainCode: 'OP', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'OP-FM-020', name: 'After-Hours On-Call Activity Log', type: 'Log', policies: ['OP-SL-002'], domainCode: 'OP', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },

  // ── RISK MANAGEMENT (RM) ── 16 forms
  { id: 'RM-FM-001', name: 'Hazard Vulnerability Analysis (HVA) Worksheet', type: 'Worksheet', policies: ['OP-FM-005', 'RM-EP-001', 'RM-EP-002'], domainCode: 'RM', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'shared_enterprise'] },
  { id: 'RM-FM-002', name: 'EMT Emergency Contact Card', type: 'Reference', policies: ['OP-FM-005', 'HR-TD-005'], domainCode: 'RM', usage: 'Required', frequency: 'Annual', classifications: [] },
  { id: 'RM-FM-003', name: 'Emergency Quick Reference Guide', type: 'Reference', policies: ['OP-FM-005', 'CL-PR-005'], domainCode: 'RM', usage: 'Required', frequency: 'Ongoing', classifications: ['shared_enterprise'] },
  { id: 'RM-FM-004', name: 'EP Exercise Documentation Form', type: 'Assessment', policies: ['OP-FM-005', 'RM-EP-002'], domainCode: 'RM', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'RM-FM-005', name: 'After-Action Review (AAR) Form', type: 'Assessment', policies: ['OP-FM-005', 'RM-EP-002', 'QA-AE-002'], domainCode: 'RM', usage: 'Required', frequency: 'Triggered', classifications: ['audit_critical'] },
  { id: 'RM-FM-006', name: 'Pandemic Plan Readiness Checklist', type: 'Checklist', policies: ['RM-EP-001'], domainCode: 'RM', usage: 'Required', frequency: 'Annual', classifications: ['high_risk', 'audit_critical'] },
  { id: 'RM-FM-007', name: 'Patient Priority Classification Matrix', type: 'Matrix', policies: ['RM-EP-001'], domainCode: 'RM', usage: 'Required', frequency: 'Ongoing', classifications: ['shared_enterprise', 'audit_critical'] },
  { id: 'RM-FM-008', name: 'Enterprise Risk Register', type: 'Tracking Tool', policies: ['RM-ER-001'], domainCode: 'RM', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'RM-FM-009', name: 'Workplace Violence Incident Report', type: 'Form', policies: ['RM-SS-002'], domainCode: 'RM', usage: 'Conditional', frequency: 'Triggered', classifications: ['high_risk'] },
  { id: 'RM-FM-010', name: 'Hazardous Materials (SDS) Inventory', type: 'Log', policies: ['RM-PS-002'], domainCode: 'RM', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical'] },
  { id: 'RM-FM-011', name: 'Equipment Safety Recall Log', type: 'Log', policies: ['RM-PS-003'], domainCode: 'RM', usage: 'Required', frequency: 'Ongoing', classifications: [] },
  { id: 'RM-FM-012', name: 'High-Risk Medication Double-Check Log', type: 'Log', policies: ['RM-PS-005'], domainCode: 'RM', usage: 'Required', frequency: 'Ongoing', classifications: ['high_risk'] },
  { id: 'RM-FM-013', name: 'Cal/OSHA IIPP Hazard Identification Checklist', type: 'Checklist', policies: ['RM-OS-101'], domainCode: 'RM', usage: 'Required', frequency: 'Quarterly', classifications: ['audit_critical'] },
  { id: 'RM-FM-014', name: 'Cal/OSHA Hazard Correction Record', type: 'Log', policies: ['RM-OS-101'], domainCode: 'RM', usage: 'Required', frequency: 'Ongoing', classifications: ['audit_critical'] },
  { id: 'RM-FM-015', name: 'Litigation & Claims Register', type: 'Tracking Tool', policies: ['RM-ER-004', 'RM-ER-006'], domainCode: 'RM', usage: 'Conditional', frequency: 'Ongoing', classifications: ['high_risk'] },
  { id: 'RM-FM-016', name: 'Annual Risk Reassessment Report', type: 'Assessment', policies: ['RM-ER-001', 'RM-ER-003'], domainCode: 'RM', usage: 'Required', frequency: 'Annual', classifications: ['audit_critical', 'shared_enterprise'] },
];

// ══════════════════════════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════════════════════════

const getFormIcon = (type: string, size = 16) => {
  switch (type.toLowerCase()) {
    case 'attestation': return <FileSignature size={size}/>;
    case 'checklist': return <ClipboardCheck size={size}/>;
    case 'log': return <Database size={size}/>;
    case 'assessment': return <BarChart3 size={size}/>;
    case 'worksheet': return <LayoutList size={size}/>;
    case 'template': return <Layers size={size}/>;
    case 'tracking tool': return <BarChart3 size={size}/>;
    default: return <FileText size={size}/>;
  }
};

const getFormTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'attestation': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    case 'checklist': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'log': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'assessment': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'template': return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
    case 'tracking tool': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    case 'matrix': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    default: return 'text-gray-300 bg-gray-400/10 border-gray-400/20';
  }
};

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════

export function FormsPage() {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [activeClassifications, setActiveClassifications] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const visibleForms = useMemo(() => {
    let f = FORMS_DATASET;
    if (selectedDomain !== 'ALL') f = f.filter(x => x.domainCode === selectedDomain);
    if (activeClassifications.size > 0) {
      f = f.filter(x => { for (const cls of activeClassifications) { if (!x.classifications.includes(cls)) return false; } return true; });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      f = f.filter(x => x.id.toLowerCase().includes(q) || x.name.toLowerCase().includes(q) || x.type.toLowerCase().includes(q) || x.policies.some(p => p.toLowerCase().includes(q)));
    }
    return f;
  }, [selectedDomain, activeClassifications, searchQuery]);

  const toggleClassification = useCallback((id: string) => {
    setActiveClassifications(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);

  return (
    <>
      <style>{`
        .forms-custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .forms-custom-scrollbar::-webkit-scrollbar { display: none; }
        .glass-interactive-forms { background-color: transparent !important; transition: border-color 300ms ease, box-shadow 300ms ease; }
        .glass-interactive-forms:hover { box-shadow: 0 0 15px rgba(255,255,255,0.05); }
        @keyframes shimmerForms { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
        @keyframes fadeUpForms { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeUpForms { animation: fadeUpForms 0.4s ease-out forwards; }
        .forms-grid-7{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:1.25rem}
        @media(max-width:2200px){.forms-grid-7{grid-template-columns:repeat(6,minmax(0,1fr))}}
        @media(max-width:1800px){.forms-grid-7{grid-template-columns:repeat(5,minmax(0,1fr))}}
        @media(max-width:1500px){.forms-grid-7{grid-template-columns:repeat(4,minmax(0,1fr))}}
        @media(max-width:1200px){.forms-grid-7{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media(max-width:850px){.forms-grid-7{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:550px){.forms-grid-7{grid-template-columns:repeat(1,minmax(0,1fr))}}
      `}</style>

      <div className="h-full w-full font-roboto text-white flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="px-10 pt-10 pb-4 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h1 className="font-montserrat text-3xl font-light text-white flex items-center gap-4">
              <Layers className="text-[#a855f7]" size={36} strokeWidth={1.5}/> Enterprise Forms Library
            </h1>
            <div className="flex items-center gap-3 mt-4 ml-1">
              <div className="glass-interactive-forms px-3 py-1.5 rounded-full border-[0.77px] border-[#00c2b4]/40 flex items-center gap-2 relative overflow-hidden cursor-pointer"
                onClick={() => navigate('/library')}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00c2b4]/20 to-transparent -translate-x-full"
                  style={{animation:'shimmerForms 2.5s infinite'}}/>
                <FileText size={12} className="text-[#00c2b4] animate-pulse"/>
                <span className="text-[9px] font-bold font-montserrat tracking-[0.2em] text-white">269 POLICIES</span>
              </div>
              <div className="glass-interactive-forms px-3 py-1.5 rounded-full border-[0.77px] border-[#a855f7]/40 flex items-center gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#a855f7]/20 to-transparent -translate-x-full"
                  style={{animation:'shimmerForms 3s infinite 0.5s'}}/>
                <Layers size={12} className="text-[#a855f7] animate-pulse"/>
                <span className="text-[9px] font-bold font-montserrat tracking-[0.2em] text-white">281 FORMS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="glass-interactive-forms flex items-center gap-3 px-4 py-2.5 rounded-full border-[0.77px] border-white/20 w-[280px]">
              <Search size={14} className="text-white/40 shrink-0"/>
              <input
                type="text"
                placeholder="Search forms..."
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
              <button onClick={() => navigate('/library')}
                className="px-6 py-2 rounded-full text-[9px] font-bold tracking-widest uppercase border-[0.77px] border-transparent text-white/40 hover:text-white transition-colors font-montserrat">
                Policies
              </button>
              <button className="px-6 py-2 rounded-full text-[9px] font-bold tracking-widest uppercase border-[0.77px] border-[#a855f7] text-[#a855f7] font-montserrat">
                Forms
              </button>
            </div>

            {/* Export */}
            <button className="glass-interactive-forms flex items-center gap-2 px-5 py-2.5 rounded-full border-[0.77px] border-white/20 text-[9px] font-bold tracking-widest uppercase text-white/60 hover:text-white transition-colors font-montserrat">
              <Printer size={13}/> Export
            </button>
          </div>
        </div>

        {/* DOMAIN PILLS */}
        <div className="px-10 py-3 shrink-0 border-b border-white/[0.06]">
          <div className="flex gap-2 overflow-x-auto forms-custom-scrollbar pb-1">
            <button onClick={() => setSelectedDomain('ALL')}
              className={`flex-shrink-0 glass-interactive-forms px-5 py-2 rounded-full font-montserrat text-[9px] font-bold tracking-widest uppercase transition-colors border-[0.77px] ${
                selectedDomain === 'ALL' ? 'border-white/30 text-white' : 'border-transparent text-white/40 hover:text-white'
              }`}>
              ALL DOMAINS
            </button>
            {DOMAINS.map(d => {
              const isActive = selectedDomain === d.code;
              const Icon = d.icon;
              return (
                <button key={d.code} onClick={() => setSelectedDomain(d.code)}
                  className="flex-shrink-0 glass-interactive-forms px-5 py-2 rounded-full font-montserrat text-[9px] font-bold tracking-widest uppercase flex items-center gap-2 transition-colors border-[0.77px]"
                  style={isActive
                    ? { borderColor: `${d.color}60`, color: d.color, backgroundColor: `${d.color}10` }
                    : { borderColor: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
                  <Icon size={13} style={{ color: isActive ? d.color : undefined }}/> {d.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* CLASSIFICATION FILTERS */}
        <div className="px-10 py-3 shrink-0 flex items-center gap-3 border-b border-white/[0.06]">
          <button onClick={() => setActiveClassifications(new Set())}
            className={`flex-shrink-0 glass-interactive-forms px-3 py-1.5 rounded-full font-montserrat font-bold text-[8px] uppercase tracking-widest transition-colors border-[0.77px] ${
              activeClassifications.size === 0 ? 'border-white/30 text-white' : 'border-transparent text-white/40 hover:text-white'
            }`}>
            ALL
          </button>
          {CLASSIFICATION_FILTERS.map(c => {
            const isActive = activeClassifications.has(c.id);
            const Icon = c.icon;
            return (
              <button key={c.id} onClick={() => toggleClassification(c.id)}
                className="flex-shrink-0 glass-interactive-forms flex items-center gap-1.5 px-3 py-1.5 rounded-full font-montserrat font-bold text-[8px] uppercase tracking-widest transition-colors border-[0.77px]"
                style={isActive
                  ? { borderColor: c.color, color: c.color }
                  : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
                <Icon size={10}/> {c.name}
              </button>
            );
          })}
          <div className="ml-auto text-[9px] font-mono text-white/40">
            {visibleForms.length} ARTIFACTS
          </div>
        </div>

        {/* FORMS GRID */}
        <div className="flex-1 overflow-y-auto forms-custom-scrollbar p-8">
          <div className="forms-grid-7 animate-fadeUpForms">
            {visibleForms.map(form => {
              const domain = DOMAINS.find(d => d.code === form.domainCode);
              const color = domain?.color || '#ffffff';
              const typeColorClass = getFormTypeColor(form.type);
              return (
                <div key={form.id}
                  className="glass-interactive-forms flex flex-col justify-between p-4 rounded-xl border-[0.77px] border-white/10 hover:border-white/25 transition-all duration-300 group h-full relative">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-[11px] font-bold font-mono tracking-wider px-1.5 py-0.5 rounded border border-white/10" style={{color}}>
                        {form.id}
                      </div>
                      <div className={`p-1.5 rounded-md border ${typeColorClass}`} title={form.type}>
                        {getFormIcon(form.type, 14)}
                      </div>
                    </div>
                    <h3 className="text-[13px] text-white/95 font-medium leading-snug mb-3 line-clamp-3 group-hover:text-white transition-colors">
                      {form.name}
                    </h3>
                    {form.classifications?.length > 0 && (
                      <div className="flex flex-col gap-1.5 mb-4">
                        {form.classifications.map(cId => {
                          const cls = CLASSIFICATION_FILTERS.find(c => c.id === cId);
                          if (!cls) return null;
                          const Icon = cls.icon;
                          return (
                            <div key={cId} className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border w-max"
                              style={{borderColor:`${cls.color}30`,backgroundColor:`${cls.color}10`,color:cls.color}}>
                              <Icon size={10}/> {cls.name}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${typeColorClass}`}>{form.type}</span>
                      {form.usage === 'Required' && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border border-red-500/20 text-red-400">Required</span>}
                      {form.frequency !== 'Ongoing' && form.frequency !== 'Triggered' && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border border-white/10 text-white/60">{form.frequency}</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-auto pt-3 border-t border-white/10 relative">
                    <div className="text-[8px] uppercase tracking-widest text-white/40 mb-2 font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><GitBranch size={10}/> Mapped Policies</span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 right-0 border border-white/10 bg-black/60 backdrop-blur p-1 rounded-lg shadow-xl">
                        <button className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white" title="Preview Form"><Eye size={14}/></button>
                        <button className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white" title="Download Source"><Download size={14}/></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {form.policies.map(pp => (
                        <span key={pp} className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-white/10 text-white/60 hover:text-white transition-colors cursor-default">{pp}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {visibleForms.length === 0 && (
            <div className="text-center py-20 text-white/20 w-full mt-10">
              <Search size={40} className="mx-auto mb-4 text-white/10"/>
              <p className="text-lg font-light font-montserrat">No canonical forms match your search criteria.</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
