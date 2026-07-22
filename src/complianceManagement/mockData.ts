/* ─────────────────────────────────────────────────────────────────────────────
   UI-PREVIEW MOCK DATA — synthetic vendor/contractor records.
   NOT real records and NOT wired to any backend. Exists only so the Vendor and
   Contractor Management screens render fully populated for design review. Replace
   with the server-backed client when the /api/vendors + /api/contractors routes
   are wired.
   ───────────────────────────────────────────────────────────────────────────── */
import type { ContractorRecord, ContractorVendorStatus, VendorRecord } from './types';

const inDays = (n: number): string => new Date(Date.now() + n * 86_400_000).toISOString();
const NOW = new Date().toISOString();

const req = (
  key: string, label: string,
  status: VendorRequirement['status'], blocker: VendorRequirement['blocker'],
  basis: string, policyRefs: string[] = [], formRefs: string[] = [],
): VendorRequirement => ({ key, label, status, blocker, basis, policyRefs, formRefs });
type VendorRequirement = VendorRecord['decision']['requirements'][number];

export const MOCK_VENDORS: VendorRecord[] = [
  {
    id: 'VEN-0001', legalName: 'Northbay Diagnostics LLC', dba: 'Northbay Labs', category: 'Clinical laboratory',
    serviceDescription: 'Reference lab processing patient specimens with results returned into the EHR; receives and maintains PHI.',
    businessOwner: 'D. Reyes', complianceOwner: 'M. Okafor', lifecycleStatus: 'active',
    classification: { phiAccess: true, clinicalService: true, systemAccess: true },
    decision: {
      businessAssociateStatus: 'required', serviceUnderArrangement: false, riskTier: 'high',
      requirements: [
        req('business_associate_agreement', 'Business Associate Agreement', 'pending_review', 'critical', 'Vendor creates, receives, maintains, or transmits PHI on the agency’s behalf.', ['HIPAA-PG-014'], ['CO-FM-021']),
        req('exclusion_screening', 'OIG/SAM exclusion screening', 'current', 'none', 'Clinical service vendor billing federal programs.', ['CO-PG-003']),
        req('insurance_verification', 'Insurance & liability verification', 'required_missing', 'activation', 'High-risk clinical dependency.', [], ['CO-FM-009']),
        req('privacy_security_review', 'Privacy & security review', 'pending_review', 'activation', 'System access + ePHI transmission.', ['SEC-PG-002']),
      ],
      blockers: ['BAA not executed', 'Insurance verification missing', 'Security review pending'],
      rationale: ['PHI access establishes a business-associate relationship.', 'Elevated to high risk by clinical dependency + system access.'],
    },
    nextReviewDate: inDays(38), agreementExpirationDate: inDays(74), openIncidents: 1, openCorrectiveActions: 1, version: 6, updatedAt: NOW,
  },
  {
    id: 'VEN-0002', legalName: 'Cascade Facilities Services', category: 'Janitorial / environmental',
    serviceDescription: 'After-hours office cleaning. No system access; incidental exposure to documents only.',
    businessOwner: 'T. Nguyen', complianceOwner: 'M. Okafor', lifecycleStatus: 'active',
    classification: { incidentalExposureOnly: true },
    decision: {
      businessAssociateStatus: 'not_required', serviceUnderArrangement: false, riskTier: 'low',
      requirements: [
        req('written_service_agreement', 'Written service agreement', 'current', 'none', 'Standard operational vendor.', ['CO-PG-001']),
        req('confidentiality_acknowledgment', 'Confidentiality acknowledgment', 'current', 'none', 'Incidental exposure only — BAA not triggered.', [], ['CO-FM-004']),
      ],
      blockers: [], rationale: ['Incidental exposure does not create a business-associate relationship, so no BAA is required.'],
    },
    nextReviewDate: inDays(210), agreementExpirationDate: inDays(300), openIncidents: 0, openCorrectiveActions: 0, version: 3, updatedAt: NOW,
  },
  {
    id: 'VEN-0003', legalName: 'Meridian Cloud EHR, Inc.', category: 'Cloud / SaaS',
    serviceDescription: 'Cloud-hosted EHR storing and transmitting ePHI for the agency; privileged administrative access.',
    businessOwner: 'A. Silva', complianceOwner: 'P. Grant', lifecycleStatus: 'active',
    classification: { phiAccess: true, ephiAccess: true, cloudService: true, privilegedAccess: true, criticalDependency: true },
    decision: {
      businessAssociateStatus: 'required', serviceUnderArrangement: false, riskTier: 'critical',
      requirements: [
        req('business_associate_agreement', 'Business Associate Agreement', 'current', 'none', 'Stores/transmits ePHI on the agency’s behalf.', ['HIPAA-PG-014'], ['CO-FM-021']),
        req('privacy_security_review', 'Privacy & security review (SOC 2)', 'current', 'none', 'ePHI + privileged access + critical dependency.', ['SEC-PG-002']),
        req('breach_notification_terms', 'Breach-notification terms', 'pending_review', 'activation', 'ePHI processor.', ['HIPAA-PG-019']),
      ],
      blockers: ['Breach-notification terms pending legal review'], rationale: ['Critical tier from ePHI + privileged access + operational dependency.'],
    },
    nextReviewDate: inDays(15), agreementExpirationDate: inDays(410), openIncidents: 0, openCorrectiveActions: 0, version: 11, updatedAt: NOW,
  },
  {
    id: 'VEN-0004', legalName: 'Harbor Staffing Partners', category: 'Staffing agency',
    serviceDescription: 'Supplies contract clinicians under an arrangement; individuals are patient-facing.',
    businessOwner: 'R. Padilla', complianceOwner: 'P. Grant', lifecycleStatus: 'classification_pending',
    classification: { clinicalService: true, serviceUnderArrangement: true, subcontractors: true },
    decision: {
      businessAssociateStatus: 'review_required', serviceUnderArrangement: true, riskTier: 'moderate',
      requirements: [
        req('services_under_arrangement_review', 'Services-under-arrangement review', 'pending_review', 'activation', 'Individuals deliver care under the agency’s authority.', ['CO-PG-007']),
        req('exclusion_screening', 'Roster exclusion screening', 'required_missing', 'activation', 'Contract clinicians bill under agency.', ['CO-PG-003']),
      ],
      blockers: ['Arrangement review incomplete', 'Roster screening not started'], rationale: ['Classification pending authorized determination.'],
    },
    nextReviewDate: inDays(9), agreementExpirationDate: inDays(52), openIncidents: 0, openCorrectiveActions: 0, version: 2, updatedAt: NOW,
  },
];

const gate = (v: ContractorRecord['clearance'][string]) => v;

export const MOCK_CONTRACTORS: ContractorRecord[] = [
  {
    id: 'CON-0001', legalName: 'Priya Ananthakrishnan', preferredName: 'Priya', email: 'priya.a@example.test',
    engagementType: '1099 independent', vendorId: 'VEN-0004', roleCode: 'RN', discipline: 'Skilled Nursing',
    patientFacing: true, licensedRole: true, phiAccessRequired: true, drivingRequired: true, supervisorUserId: 'usr-don',
    startDate: inDays(-40), renewalDate: inDays(25), lifecycleStatus: 'active',
    classificationStatus: 'approved',
    clearance: { background_check: gate('approved'), license_verification: gate('approved'), health_clearance: gate('expired'), tb_screening: gate('needs_review'), competency: gate('approved'), training: gate('approved'), overall: 'blocked' },
    assignmentStatus: 'hold', accessStatus: 'provisioned', version: 8, updatedAt: NOW,
  },
  {
    id: 'CON-0002', legalName: 'Marcus Delgado', email: 'marcus.d@example.test',
    engagementType: 'Agency contract', vendorId: 'VEN-0004', roleCode: 'PT', discipline: 'Physical Therapy',
    patientFacing: true, licensedRole: true, phiAccessRequired: true, drivingRequired: true, supervisorUserId: 'usr-don',
    startDate: inDays(-8), renewalDate: inDays(300), lifecycleStatus: 'clearance_pending',
    classificationStatus: 'approved',
    clearance: { background_check: gate('pending'), license_verification: gate('approved'), health_clearance: gate('pending'), tb_screening: gate('not_started'), competency: gate('not_started'), training: gate('pending'), overall: 'pending' },
    assignmentStatus: 'blocked', accessStatus: 'not_provisioned', version: 2, updatedAt: NOW,
  },
  {
    id: 'CON-0003', legalName: 'Wei Chen', preferredName: 'Wei', email: 'wei.c@example.test',
    engagementType: '1099 independent', roleCode: 'ANALYST', discipline: 'Data / QA',
    patientFacing: false, licensedRole: false, phiAccessRequired: false, drivingRequired: false, supervisorUserId: 'usr-admin',
    startDate: inDays(-120), renewalDate: inDays(140), lifecycleStatus: 'active',
    classificationStatus: 'approved',
    clearance: { background_check: gate('approved'), confidentiality: gate('approved'), health_clearance: gate('not_applicable'), license_verification: gate('not_applicable'), competency: gate('approved'), training: gate('approved'), overall: 'approved' },
    assignmentStatus: 'assignable', accessStatus: 'provisioned', version: 5, updatedAt: NOW,
  },
  {
    id: 'CON-0004', legalName: 'Fatima Al-Rashid', email: 'fatima.r@example.test',
    engagementType: 'Agency contract', vendorId: 'VEN-0001', roleCode: 'HHA', discipline: 'Home Health Aide',
    patientFacing: true, licensedRole: false, phiAccessRequired: true, drivingRequired: true,
    startDate: inDays(-3), renewalDate: inDays(360), lifecycleStatus: 'clearance_pending',
    classificationStatus: 'needs_review',
    clearance: { background_check: gate('needs_review'), health_clearance: gate('not_started'), tb_screening: gate('not_started'), competency: gate('not_started'), training: gate('not_started'), overall: 'not_started' },
    assignmentStatus: 'blocked', accessStatus: 'not_provisioned', version: 1, updatedAt: NOW,
  },
];

export const MOCK_VENDOR_STATUS: ContractorVendorStatus = {
  vendorId: 'VEN-0004', displayName: 'Harbor Staffing Partners', status: 'active',
  masterAgreementStatus: 'active', baaStatus: 'not_required', insuranceStatus: 'expiring', eligibility: 'eligible',
};
