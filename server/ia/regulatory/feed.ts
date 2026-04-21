/**
 * Phase 2 Regulatory Update Feed — Seed Data
 *
 * In Phase 2 (production), this feed would be populated from structured
 * ingestion of CMS transmittals, Final Rules, and other authoritative
 * sources. For Phase 1 MVP, this file contains realistic curated entries
 * representative of 2025-2026 home health regulatory activity.
 *
 * IMPORTANT: These entries reflect the *types* of regulatory updates
 * a home health agency must track. They are illustrative seed records
 * for demonstration and testing — not verbatim regulatory text.
 *
 * Source attribution included for traceability.
 */

import type { RegulatoryAlert } from '../types.js';

export const SEED_REGULATORY_UPDATES: RegulatoryAlert[] = [
  {
    updateId: 'REG-2025-HH-001',
    title: 'CMS Home Health Final Rule CY 2026 — Payment & CoP Updates',
    source: 'Centers for Medicare & Medicaid Services',
    publishedDate: '2025-11-01',
    effectiveDate: '2026-01-01',
    topic: 'Payment Methodology / Conditions of Participation',
    severity: 'high',
    affectedArea: 'Billing, Clinical Care Standards, OASIS Documentation',
    impactedPolicies: ['FN-BC-001', 'CL-CA-001', 'QA-QM-001'],
    impactedForms: ['CL-FM-001', 'CO-FM-005', 'FN-FM-001'],
    impactedAreas: ['Billing & Claims', 'Clinical Care Delivery', 'Quality Management'],
    reviewRecommendation:
      'Review and update FN-BC-001 (Billing) and CL-CA-001 (Clinical Standards) to align with CY 2026 payment methodology changes. Verify OASIS-E data element alignment with updated payment model requirements.',
    nextAction:
      'Assign Finance Director (FN-BC-001) and Clinical Director (CL-CA-001) as owners of required policy reviews. Target completion: May 1, 2026.',
    status: 'under_review',
    sourceUrl: 'https://www.cms.gov/medicare/home-health-agency/home-health-final-rules',
  },
  {
    updateId: 'REG-2025-HIPAA-001',
    title: 'HIPAA Security Rule — Cybersecurity Requirements Proposed Update',
    source: 'HHS Office for Civil Rights',
    publishedDate: '2025-01-06',
    effectiveDate: '2026-03-01',
    topic: 'HIPAA Security Rule Cybersecurity Enhancements',
    severity: 'high',
    affectedArea: 'IT Security, Data Governance, Risk Management',
    impactedPolicies: ['IT-DS-001', 'IT-PR-001', 'GV-GB-001'],
    impactedForms: ['IT-FM-001', 'IT-FM-015'],
    impactedAreas: ['Information Technology', 'Data Security', 'Governance'],
    reviewRecommendation:
      'HIPAA Security Rule proposed changes introduce enhanced technical safeguard requirements including multi-factor authentication, encryption standards, and incident response timelines. IT-DS-001 must be reviewed and updated to comply with effective date.',
    nextAction:
      'IT Director to initiate IT-DS-001 review immediately (currently 80 days overdue). Include updated MFA requirements, encrypted communication standards, and 72-hour breach notification procedures.',
    status: 'new',
    sourceUrl: 'https://www.hhs.gov/hipaa/for-professionals/security/index.html',
  },
  {
    updateId: 'REG-2025-OIG-001',
    title: 'OIG Work Plan 2025 — Home Health Compliance Focus Areas',
    source: 'HHS Office of Inspector General',
    publishedDate: '2025-01-01',
    effectiveDate: '2025-01-01',
    topic: 'OIG Compliance Audit Priorities — Home Health',
    severity: 'high',
    affectedArea: 'Billing Compliance, OASIS Accuracy, Plan of Care Documentation',
    impactedPolicies: ['FN-BC-001', 'CL-CA-001', 'CO-QI-001'],
    impactedForms: ['CL-FM-001', 'CO-FM-005', 'FN-FM-003'],
    impactedAreas: ['Billing & Claims', 'Clinical Operations', 'Quality & Compliance'],
    reviewRecommendation:
      'OIG CY 2025 Work Plan flags home health agencies for OASIS accuracy audits, plan of care documentation reviews, and billing compliance. Pre-survey internal audit recommended.',
    nextAction:
      'Compliance Officer to conduct internal billing compliance audit using FN-FM-003. Run pre-survey OASIS accuracy review. Update training on documentation requirements.',
    status: 'under_review',
    sourceUrl: 'https://oig.hhs.gov/reports-and-publications/workplan/',
  },
  {
    updateId: 'REG-2026-EP-001',
    title: 'CMS Emergency Preparedness CoP Compliance Guidance Update',
    source: 'Centers for Medicare & Medicaid Services',
    publishedDate: '2026-01-15',
    effectiveDate: '2026-04-01',
    topic: 'Emergency Preparedness — Annual Training & Testing Requirements',
    severity: 'moderate',
    affectedArea: 'Emergency Preparedness, Staff Training, Documentation',
    impactedPolicies: ['EN-EP-001', 'HR-WM-001'],
    impactedForms: ['HR-FM-023', 'EN-FM-001'],
    impactedAreas: ['Environmental Safety', 'Human Resources', 'Staff Training'],
    reviewRecommendation:
      'CMS updated guidance clarifies annual exercise documentation requirements and training completion records under 42 CFR 484.102. Review EN-EP-001 and ensure HR-FM-023 captures all required training elements.',
    nextAction:
      'Training Coordinator to cross-reference EN-EP-001 against updated CMS guidance. Verify HR-FM-023 form captures all required documentation fields per updated CoP standards.',
    status: 'new',
    sourceUrl: 'https://www.cms.gov/medicare/provider-enrollment-and-certification/surveycertificationgeninfo/emergency-preparedness',
  },
  {
    updateId: 'REG-2025-OASIS-001',
    title: 'OASIS-E Data Submission and Item Clarification Guidance',
    source: 'Centers for Medicare & Medicaid Services',
    publishedDate: '2025-09-01',
    effectiveDate: '2025-10-01',
    topic: 'OASIS-E Assessment Guidance and Data Submission',
    severity: 'moderate',
    affectedArea: 'Clinical Documentation, Quality Reporting',
    impactedPolicies: ['CL-CA-001', 'CO-QI-001'],
    impactedForms: ['CO-FM-005', 'CL-FM-001'],
    impactedAreas: ['Clinical Operations', 'Quality Management'],
    reviewRecommendation:
      'Updated OASIS-E guidance clarifies completion requirements for several data items including functional assessment fields. Review CO-FM-005 for alignment and update CL-CA-001 assessment standards.',
    nextAction:
      'Clinical Director to review OASIS-E item clarification guidance. Update CO-FM-005 form and CL-CA-001 documentation standards. Provide updated training to all RN case managers.',
    status: 'reviewed',
    sourceUrl: 'https://www.cms.gov/medicare/quality/home-health/oasis/data-specifications',
  },
  {
    updateId: 'REG-2026-FCA-001',
    title: 'DOJ False Claims Act Settlement — Home Health Billing Patterns',
    source: 'Department of Justice',
    publishedDate: '2026-02-10',
    topic: 'False Claims Act Enforcement — Home Health Billing',
    severity: 'immediate',
    affectedArea: 'Billing Compliance, Physician Certification, Documentation',
    impactedPolicies: ['FN-BC-001', 'CL-CA-001'],
    impactedForms: ['CL-FM-001', 'FN-FM-001', 'FN-FM-003'],
    impactedAreas: ['Billing & Claims', 'Clinical Care Delivery', 'Compliance'],
    reviewRecommendation:
      'Recent DOJ enforcement highlights billing compliance risks related to physician certification timing, services exceeding plan of care, and OASIS inflating clinical scores. Self-audit strongly recommended.',
    nextAction:
      'Compliance Officer to conduct immediate self-audit using FN-FM-003 (Billing Compliance Audit). Focus: physician cert timing, OASIS accuracy, services vs. authorized plan of care. Escalate findings to Governing Body.',
    status: 'new',
  },
];
