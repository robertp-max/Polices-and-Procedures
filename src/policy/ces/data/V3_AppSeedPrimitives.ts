/**
 * V3_AppSeedPrimitives.ts
 * Single source of truth for all seeded data across the V3 staging app.
 * Every page imports from here to ensure cross-surface consistency.
 *
 * V3_SYNTHETIC_FALLBACK: these are preview seed primitives only. They are
 * registry/list seeded data and do not prove full content or workflow parity.
 */

/* ── Date Anchors ── */
export const V3_TODAY = '2026-05-21';
export const V3_CURRENT_SPRINT = { id: '2026-10', number: 10, start: '2026-05-10', end: '2026-05-23' };
export const V3_AGENCY = { name: 'CareIndeed Home Health', state: 'CA', accreditation: 'ACHC', clinicianCount: 42, patientCensus: 67 };

/* ── Types ── */
export interface V3Person {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  email: string;
  status: 'Active' | 'On Leave' | 'Pending' | 'Inactive';
  complianceStatus: 'Compliant' | 'Pending Review' | 'Non-Compliant' | 'Provisional';
  activeCases: number;
  zone: 'A' | 'B' | 'C' | 'D';
  hireDate: string;
  lastAudit: 'Passed' | 'Under Review' | 'Conditional' | 'Failed';
}

export interface V3Patient {
  id: string;
  mrn: string;
  name: string;
  acuity: string;
  setting: 'Home' | 'Facility' | 'Assisted Living';
  zone: 'A' | 'B' | 'C' | 'D';
  primaryClinician: string;
  physician: string;
  startOfCare: string;
  certPeriodEnd: string;
  disciplines: string[];
}

export interface V3Visit {
  id: string;
  patientName: string;
  clinicianName: string;
  date: string;
  time: string;
  type: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Missed' | 'Cancelled';
  duration: string;
  zone: 'A' | 'B' | 'C' | 'D';
  notes?: string;
}

export interface V3Policy {
  id: string;
  title: string;
  domain: string;
  lifecycle: 'Published' | 'Draft' | 'Review' | 'Archived' | 'Pending Approval';
  achcMapping: 'Mapped' | 'Pending' | 'N/A' | 'In Progress';
  owner: string;
  lastReviewed: string;
  nextReview: string;
  version: string;
}

export interface V3Form {
  id: string;
  title: string;
  domain: string;
  status: 'Active' | 'Draft' | 'Archived' | 'Under Review';
  lastUpdated: string;
  completionRate: number;
  requiredBy: string;
}

export interface V3Physician {
  id: string;
  name: string;
  specialty: string;
  npi: string;
  activePatients: number;
  lastReferral: string;
  status: 'Active' | 'Inactive' | 'Pending Credentialing';
  phone: string;
  fax: string;
}

export interface V3AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  severity: 'info' | 'warning' | 'critical';
  details?: string;
}

/* ── Staff (canonical roster — includes CES personas) ── */
export const V3_STAFF: V3Person[] = [
  { id: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', department: 'Clinical', email: 'mgonzalez@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 0, zone: 'A', hireDate: '2019-03-15', lastAudit: 'Passed' },
  { id: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', department: 'Administration', email: 'rchen@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 0, zone: 'A', hireDate: '2018-01-10', lastAudit: 'Passed' },
  { id: 'u-gb-01', name: 'Patricia Hale', initials: 'PH', role: 'Governing Body', department: 'Governance', email: 'phale@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 0, zone: 'A', hireDate: '2017-06-01', lastAudit: 'Passed' },
  { id: 'u-acc-01', name: 'David Kim, CPA', initials: 'DK', role: 'Accounting', department: 'Finance', email: 'dkim@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 0, zone: 'A', hireDate: '2020-02-20', lastAudit: 'Passed' },
  { id: 'u-sys-01', name: 'Elena Vargas', initials: 'EV', role: 'Systems', department: 'IT', email: 'evargas@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 0, zone: 'A', hireDate: '2021-07-12', lastAudit: 'Passed' },
  { id: 'u-admdes-01', name: 'James Torres', initials: 'JT', role: 'Admin Designee', department: 'Administration', email: 'jtorres@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 0, zone: 'A', hireDate: '2022-01-05', lastAudit: 'Passed' },
  { id: 'u-rn-02', name: 'Dr. Evelyn Vance', initials: 'EV', role: 'Clinical Lead', department: 'Clinical', email: 'evance@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 14, zone: 'A', hireDate: '2020-04-01', lastAudit: 'Passed' },
  { id: 'u-rn-03', name: 'Marcus Sterling', initials: 'MS', role: 'RN', department: 'Clinical', email: 'msterling@careindeed.com', status: 'Active', complianceStatus: 'Pending Review', activeCases: 9, zone: 'B', hireDate: '2022-09-15', lastAudit: 'Under Review' },
  { id: 'u-pt-01', name: 'Sophia Caldwell', initials: 'SC', role: 'PT', department: 'Clinical', email: 'scaldwell@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 11, zone: 'B', hireDate: '2021-03-20', lastAudit: 'Passed' },
  { id: 'u-ot-01', name: 'Sarah Jenkins', initials: 'SJ', role: 'OT', department: 'Clinical', email: 'sjenkins@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 8, zone: 'C', hireDate: '2021-11-01', lastAudit: 'Passed' },
  { id: 'u-ci-01', name: 'David Cho', initials: 'DC', role: 'Clinical Informatics', department: 'IT', email: 'dcho@careindeed.com', status: 'Active', complianceStatus: 'Pending Review', activeCases: 0, zone: 'A', hireDate: '2023-01-15', lastAudit: 'Under Review' },
  { id: 'u-lpn-01', name: 'Angela Martinez', initials: 'AM', role: 'LPN', department: 'Clinical', email: 'amartinez@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 12, zone: 'C', hireDate: '2022-05-10', lastAudit: 'Passed' },
  { id: 'u-hha-01', name: 'Tamika Johnson', initials: 'TJ', role: 'HHA', department: 'Clinical', email: 'tjohnson@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 7, zone: 'D', hireDate: '2023-03-01', lastAudit: 'Passed' },
  { id: 'u-slp-01', name: 'Rachel Kim', initials: 'RK', role: 'SLP', department: 'Clinical', email: 'rkim@careindeed.com', status: 'Active', complianceStatus: 'Provisional', activeCases: 5, zone: 'B', hireDate: '2024-01-20', lastAudit: 'Conditional' },
  { id: 'u-msw-01', name: 'Carlos Rivera', initials: 'CR', role: 'MSW', department: 'Clinical', email: 'crivera@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 6, zone: 'A', hireDate: '2022-08-15', lastAudit: 'Passed' },
  { id: 'u-rn-04', name: 'Linda Patel', initials: 'LP', role: 'RN', department: 'Clinical', email: 'lpatel@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 10, zone: 'D', hireDate: '2021-06-01', lastAudit: 'Passed' },
  { id: 'u-pt-02', name: 'Kevin Wu', initials: 'KW', role: 'PT', department: 'Clinical', email: 'kwu@careindeed.com', status: 'Active', complianceStatus: 'Non-Compliant', activeCases: 13, zone: 'C', hireDate: '2023-04-10', lastAudit: 'Failed' },
  { id: 'u-hha-02', name: 'Destiny Brown', initials: 'DB', role: 'HHA', department: 'Clinical', email: 'dbrown@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 6, zone: 'B', hireDate: '2024-02-01', lastAudit: 'Passed' },
  { id: 'u-rn-05', name: 'Priya Sharma', initials: 'PS', role: 'Wound Care RN', department: 'Clinical', email: 'psharma@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 8, zone: 'A', hireDate: '2020-11-15', lastAudit: 'Passed' },
  { id: 'u-qa-01', name: 'Nicole Foster', initials: 'NF', role: 'QA Specialist', department: 'Quality', email: 'nfoster@careindeed.com', status: 'Active', complianceStatus: 'Compliant', activeCases: 0, zone: 'A', hireDate: '2022-10-01', lastAudit: 'Passed' },
  { id: 'u-diet-01', name: 'Amanda Chen', initials: 'AC', role: 'Dietitian', department: 'Clinical', email: 'achen@careindeed.com', status: 'On Leave', complianceStatus: 'Compliant', activeCases: 0, zone: 'B', hireDate: '2023-06-15', lastAudit: 'Passed' },
  { id: 'u-rn-06', name: 'Jasmine Howard', initials: 'JH', role: 'RN', department: 'Clinical', email: 'jhoward@careindeed.com', status: 'Pending', complianceStatus: 'Pending Review', activeCases: 0, zone: 'D', hireDate: '2026-05-01', lastAudit: 'Under Review' },
];

/* ── Patients ── */
export const V3_PATIENTS: V3Patient[] = [
  { id: 'p-01', mrn: 'MRN-001', name: 'Margaret Wilson', acuity: 'Level 2 — Moderate', setting: 'Home', zone: 'A', primaryClinician: 'Dr. Evelyn Vance', physician: 'Dr. James Harrison', startOfCare: '2026-03-10', certPeriodEnd: '2026-05-08', disciplines: ['SN', 'PT'] },
  { id: 'p-02', mrn: 'MRN-002', name: 'Robert Thompson', acuity: 'Level 1 — Routine', setting: 'Home', zone: 'B', primaryClinician: 'Sophia Caldwell', physician: 'Dr. Maria Santos', startOfCare: '2026-04-15', certPeriodEnd: '2026-06-13', disciplines: ['PT'] },
  { id: 'p-03', mrn: 'MRN-003', name: 'Helen Garcia', acuity: 'Level 3 — High', setting: 'Home', zone: 'A', primaryClinician: 'Marcus Sterling', physician: 'Dr. Robert Chang', startOfCare: '2026-02-20', certPeriodEnd: '2026-04-20', disciplines: ['SN', 'OT', 'MSW'] },
  { id: 'p-04', mrn: 'MRN-004', name: 'James Lee', acuity: 'Level 2 — Moderate', setting: 'Facility', zone: 'C', primaryClinician: 'Angela Martinez', physician: 'Dr. Susan Patel', startOfCare: '2026-04-01', certPeriodEnd: '2026-05-30', disciplines: ['SN', 'PT'] },
  { id: 'p-05', mrn: 'MRN-005', name: 'Dorothy Adams', acuity: 'Level 4 — Critical', setting: 'Home', zone: 'B', primaryClinician: 'Dr. Evelyn Vance', physician: 'Dr. James Harrison', startOfCare: '2026-05-01', certPeriodEnd: '2026-06-29', disciplines: ['SN', 'PT', 'OT', 'HHA'] },
  { id: 'p-06', mrn: 'MRN-006', name: 'William Brown', acuity: 'Level 1 — Routine', setting: 'Home', zone: 'A', primaryClinician: 'Linda Patel', physician: 'Dr. David Nguyen', startOfCare: '2026-03-25', certPeriodEnd: '2026-05-23', disciplines: ['SN'] },
  { id: 'p-07', mrn: 'MRN-007', name: 'Patricia Davis', acuity: 'Level 3 — High', setting: 'Assisted Living', zone: 'D', primaryClinician: 'Priya Sharma', physician: 'Dr. Karen Mitchell', startOfCare: '2026-04-10', certPeriodEnd: '2026-06-08', disciplines: ['SN', 'OT'] },
  { id: 'p-08', mrn: 'MRN-008', name: 'Charles Miller', acuity: 'Level 2 — Moderate', setting: 'Home', zone: 'C', primaryClinician: 'Kevin Wu', physician: 'Dr. Michael Torres', startOfCare: '2026-05-05', certPeriodEnd: '2026-07-03', disciplines: ['PT', 'OT'] },
  { id: 'p-09', mrn: 'MRN-009', name: 'Barbara Anderson', acuity: 'Level 2 — Moderate', setting: 'Home', zone: 'B', primaryClinician: 'Sarah Jenkins', physician: 'Dr. Susan Patel', startOfCare: '2026-04-20', certPeriodEnd: '2026-06-18', disciplines: ['OT', 'SLP'] },
  { id: 'p-10', mrn: 'MRN-010', name: 'Richard Taylor', acuity: 'Level 1 — Routine', setting: 'Home', zone: 'A', primaryClinician: 'Tamika Johnson', physician: 'Dr. David Nguyen', startOfCare: '2026-03-01', certPeriodEnd: '2026-04-29', disciplines: ['HHA'] },
  { id: 'p-11', mrn: 'MRN-011', name: 'Susan Martinez', acuity: 'Level 3 — High', setting: 'Home', zone: 'D', primaryClinician: 'Marcus Sterling', physician: 'Dr. Robert Chang', startOfCare: '2026-05-10', certPeriodEnd: '2026-07-08', disciplines: ['SN', 'PT', 'MSW'] },
  { id: 'p-12', mrn: 'MRN-012', name: 'Joseph White', acuity: 'Level 4 — Critical', setting: 'Home', zone: 'A', primaryClinician: 'Dr. Evelyn Vance', physician: 'Dr. James Harrison', startOfCare: '2026-05-15', certPeriodEnd: '2026-07-13', disciplines: ['SN', 'PT', 'OT', 'HHA', 'MSW'] },
  { id: 'p-13', mrn: 'MRN-013', name: 'Nancy Clark', acuity: 'Level 2 — Moderate', setting: 'Assisted Living', zone: 'C', primaryClinician: 'Angela Martinez', physician: 'Dr. Karen Mitchell', startOfCare: '2026-04-05', certPeriodEnd: '2026-06-03', disciplines: ['SN'] },
  { id: 'p-14', mrn: 'MRN-014', name: 'Thomas Robinson', acuity: 'Level 1 — Routine', setting: 'Home', zone: 'B', primaryClinician: 'Destiny Brown', physician: 'Dr. Maria Santos', startOfCare: '2026-05-12', certPeriodEnd: '2026-07-10', disciplines: ['HHA'] },
  { id: 'p-15', mrn: 'MRN-015', name: 'Karen Lewis', acuity: 'Level 3 — High', setting: 'Home', zone: 'D', primaryClinician: 'Linda Patel', physician: 'Dr. Michael Torres', startOfCare: '2026-03-18', certPeriodEnd: '2026-05-16', disciplines: ['SN', 'ST'] },
  { id: 'p-16', mrn: 'MRN-016', name: 'Daniel Walker', acuity: 'Level 2 — Moderate', setting: 'Facility', zone: 'A', primaryClinician: 'Sophia Caldwell', physician: 'Dr. Susan Patel', startOfCare: '2026-04-28', certPeriodEnd: '2026-06-26', disciplines: ['PT', 'OT'] },
  { id: 'p-17', mrn: 'MRN-017', name: 'Betty Hall', acuity: 'Level 2 — Moderate', setting: 'Home', zone: 'C', primaryClinician: 'Carlos Rivera', physician: 'Dr. David Nguyen', startOfCare: '2026-05-08', certPeriodEnd: '2026-07-06', disciplines: ['SN', 'MSW'] },
  { id: 'p-18', mrn: 'MRN-018', name: 'George Young', acuity: 'Level 1 — Routine', setting: 'Home', zone: 'B', primaryClinician: 'Kevin Wu', physician: 'Dr. Robert Chang', startOfCare: '2026-05-18', certPeriodEnd: '2026-07-16', disciplines: ['PT'] },
  { id: 'p-19', mrn: 'MRN-019', name: 'Sandra King', acuity: 'Level 4 — Critical', setting: 'Home', zone: 'A', primaryClinician: 'Dr. Evelyn Vance', physician: 'Dr. James Harrison', startOfCare: '2026-05-20', certPeriodEnd: '2026-07-18', disciplines: ['SN', 'PT', 'OT', 'ST', 'HHA'] },
  { id: 'p-20', mrn: 'MRN-020', name: 'Edward Wright', acuity: 'Level 2 — Moderate', setting: 'Home', zone: 'D', primaryClinician: 'Priya Sharma', physician: 'Dr. Karen Mitchell', startOfCare: '2026-04-22', certPeriodEnd: '2026-06-20', disciplines: ['SN'] },
];

export const V3_VISITS: V3Visit[] = [
  { id: 'v-01', patientName: 'Margaret Wilson', clinicianName: 'Dr. Evelyn Vance', date: '2026-05-20', time: '09:00', type: 'Skilled Nursing', status: 'Missed', duration: '60 min', zone: 'A', notes: 'Patient not home' },
  { id: 'v-02', patientName: 'Robert Thompson', clinicianName: 'Sophia Caldwell', date: '2026-05-19', time: '10:30', type: 'Physical Therapy', status: 'Cancelled', duration: '45 min', zone: 'B', notes: 'Patient refused' },
  { id: 'v-03', patientName: 'Helen Garcia', clinicianName: 'Marcus Sterling', date: '2026-05-18', time: '14:00', type: 'Occupational Therapy', status: 'Missed', duration: '60 min', zone: 'A', notes: 'Clinician sick' },
  { id: 'v-04', patientName: 'James Lee', clinicianName: 'Angela Martinez', date: '2026-05-17', time: '08:45', type: 'Skilled Nursing', status: 'Cancelled', duration: '30 min', zone: 'C', notes: 'Hospitalization' },
  { id: 'v-05', patientName: 'Dorothy Adams', clinicianName: 'Dr. Evelyn Vance', date: '2026-05-16', time: '11:15', type: 'Physical Therapy', status: 'Missed', duration: '45 min', zone: 'B', notes: 'Weather delay' },
  { id: 'v-06', patientName: 'William Brown', clinicianName: 'Linda Patel', date: '2026-05-15', time: '13:00', type: 'Skilled Nursing', status: 'Missed', duration: '60 min', zone: 'A', notes: 'Transportation issue' },
  { id: 'v-07', patientName: 'Patricia Davis', clinicianName: 'Priya Sharma', date: '2026-05-14', time: '09:30', type: 'Social Work', status: 'Cancelled', duration: '30 min', zone: 'D', notes: 'Scheduling error' },
  { id: 'v-08', patientName: 'Charles Miller', clinicianName: 'Kevin Wu', date: '2026-05-13', time: '16:00', type: 'Physical Therapy', status: 'Missed', duration: '45 min', zone: 'C', notes: 'Patient not home' },
  { id: 'V-1001', patientName: 'Maria Ramirez', clinicianName: 'J. Torres, RN', date: '2026-05-18', time: '09:00', type: 'RN Visit', status: 'Completed', duration: '45m', zone: 'A' },
  { id: 'V-1002', patientName: 'Robert Thompson', clinicianName: 'S. Patel, PT', date: '2026-05-19', time: '10:30', type: 'PT Eval', status: 'Completed', duration: '60m', zone: 'B' },
  { id: 'V-1003', patientName: 'Elena Vargas', clinicianName: 'M. Gonzalez, RN', date: '2026-05-20', time: '14:00', type: 'Admission', status: 'Scheduled', duration: '90m', zone: 'A' },
  { id: 'V-1004', patientName: 'James Kim', clinicianName: 'L. Chen, OT', date: '2026-05-21', time: '08:45', type: 'OT Home Assessment', status: 'Scheduled', duration: '50m', zone: 'C' },
  { id: 'V-1005', patientName: 'Priya Sharma', clinicianName: 'J. Torres, RN', date: '2026-05-21', time: '11:15', type: 'Wound Care', status: 'Scheduled', duration: '30m', zone: 'D' },
  { id: 'V-1006', patientName: 'David Lee', clinicianName: 'S. Patel, PT', date: '2026-05-22', time: '09:30', type: 'PT Follow-up', status: 'Scheduled', duration: '45m', zone: 'B' },
  { id: 'V-1007', patientName: 'Anna Morales', clinicianName: 'M. Gonzalez, RN', date: '2026-05-22', time: '13:00', type: 'RN Visit', status: 'Scheduled', duration: '40m', zone: 'A' },
  { id: 'V-1008', patientName: 'Carlos Rivera', clinicianName: 'L. Chen, OT', date: '2026-05-23', time: '10:00', type: 'Supervisory Visit', status: 'Scheduled', duration: '35m', zone: 'C' },
];

/* ── Referring Physicians ── */
export const V3_PHYSICIANS: V3Physician[] = [
  { id: 'phys-01', name: 'Dr. James Harrison', specialty: 'Internal Medicine', npi: '1234567890', activePatients: 8, lastReferral: '2026-05-19', status: 'Active', phone: '(415) 555-0101', fax: '(415) 555-0102' },
  { id: 'phys-02', name: 'Dr. Maria Santos', specialty: 'Family Medicine', npi: '2345678901', activePatients: 5, lastReferral: '2026-05-15', status: 'Active', phone: '(415) 555-0201', fax: '(415) 555-0202' },
  { id: 'phys-03', name: 'Dr. Robert Chang', specialty: 'Cardiology', npi: '3456789012', activePatients: 6, lastReferral: '2026-05-20', status: 'Active', phone: '(415) 555-0301', fax: '(415) 555-0302' },
  { id: 'phys-04', name: 'Dr. Susan Patel', specialty: 'Pulmonology', npi: '4567890123', activePatients: 4, lastReferral: '2026-05-12', status: 'Active', phone: '(415) 555-0401', fax: '(415) 555-0402' },
  { id: 'phys-05', name: 'Dr. David Nguyen', specialty: 'Geriatrics', npi: '5678901234', activePatients: 7, lastReferral: '2026-05-18', status: 'Active', phone: '(415) 555-0501', fax: '(415) 555-0502' },
  { id: 'phys-06', name: 'Dr. Karen Mitchell', specialty: 'Neurology', npi: '6789012345', activePatients: 3, lastReferral: '2026-05-10', status: 'Active', phone: '(415) 555-0601', fax: '(415) 555-0602' },
  { id: 'phys-07', name: 'Dr. Michael Torres', specialty: 'Orthopedics', npi: '7890123456', activePatients: 5, lastReferral: '2026-05-16', status: 'Active', phone: '(415) 555-0701', fax: '(415) 555-0702' },
  { id: 'phys-08', name: 'Dr. Lisa Park', specialty: 'Oncology', npi: '8901234567', activePatients: 2, lastReferral: '2026-04-28', status: 'Active', phone: '(415) 555-0801', fax: '(415) 555-0802' },
  { id: 'phys-09', name: 'Dr. William Foster', specialty: 'Nephrology', npi: '9012345678', activePatients: 3, lastReferral: '2026-05-05', status: 'Active', phone: '(415) 555-0901', fax: '(415) 555-0902' },
  { id: 'phys-10', name: 'Dr. Jennifer Adams', specialty: 'Wound Care', npi: '0123456789', activePatients: 4, lastReferral: '2026-05-21', status: 'Active', phone: '(415) 555-1001', fax: '(415) 555-1002' },
  { id: 'phys-11', name: 'Dr. Andrew Lopez', specialty: 'Family Medicine', npi: '1122334455', activePatients: 6, lastReferral: '2026-05-14', status: 'Active', phone: '(415) 555-1101', fax: '(415) 555-1102' },
  { id: 'phys-12', name: 'Dr. Catherine Wu', specialty: 'Endocrinology', npi: '2233445566', activePatients: 2, lastReferral: '2026-04-20', status: 'Inactive', phone: '(415) 555-1201', fax: '(415) 555-1202' },
  { id: 'phys-13', name: 'Dr. Richard Okafor', specialty: 'Psychiatry', npi: '3344556677', activePatients: 1, lastReferral: '2026-03-15', status: 'Pending Credentialing', phone: '(415) 555-1301', fax: '(415) 555-1302' },
];

/* ── Audit Log ── */
export const V3_AUDIT_LOG: V3AuditEntry[] = [
  { id: 'aud-01', timestamp: '2026-05-21T15:42:00Z', user: 'Maria Gonzalez, RN', action: 'Signed document', resource: 'Supervisory Visit Report — LPN Oversight', severity: 'info' },
  { id: 'aud-02', timestamp: '2026-05-21T14:30:00Z', user: 'Robert Chen', action: 'Approved workflow', resource: 'Incident Reporting Procedure v2.1', severity: 'info' },
  { id: 'aud-03', timestamp: '2026-05-21T13:15:00Z', user: 'James Torres', action: 'Uploaded evidence', resource: 'FRM-ORI-007 — New Hire Orientation Checklist', severity: 'info' },
  { id: 'aud-04', timestamp: '2026-05-21T11:00:00Z', user: 'System', action: 'Escalated task', resource: 'ceu-polapp-2026-10-018 — GB Policy Approval (overdue)', severity: 'warning' },
  { id: 'aud-05', timestamp: '2026-05-21T09:45:00Z', user: 'Elena Vargas', action: 'Exported data', resource: 'Sprint 10 Compliance Report', severity: 'info' },
  { id: 'aud-06', timestamp: '2026-05-20T17:00:00Z', user: 'Robert Chen', action: 'Signed document', resource: 'Compliance Committee Minutes — May', severity: 'info' },
  { id: 'aud-07', timestamp: '2026-05-20T16:12:00Z', user: 'Robert Chen', action: 'Signed document', resource: 'Q2 Governing Body Pre-Read Packet', severity: 'info' },
  { id: 'aud-08', timestamp: '2026-05-20T14:20:00Z', user: 'Patricia Hale', action: 'Viewed report', resource: 'Financial Oversight Q2 Draft', severity: 'info' },
  { id: 'aud-09', timestamp: '2026-05-20T10:30:00Z', user: 'David Kim, CPA', action: 'Uploaded evidence', resource: 'AR Aging Analysis — May 2026', severity: 'info' },
  { id: 'aud-10', timestamp: '2026-05-20T09:15:00Z', user: 'Robert Chen', action: 'Signed document', resource: 'Supervisory Visit Compliance Report', severity: 'info' },
  { id: 'aud-11', timestamp: '2026-05-19T16:30:00Z', user: 'Robert Chen', action: 'Signed document', resource: 'Incident Reporting & Grievance Procedure', severity: 'info' },
  { id: 'aud-12', timestamp: '2026-05-19T14:00:00Z', user: 'Maria Gonzalez, RN', action: 'Signed document', resource: 'Wound Care Assessment Protocol v3.0', severity: 'info' },
  { id: 'aud-13', timestamp: '2026-05-19T11:15:00Z', user: 'Maria Gonzalez, RN', action: 'Signed document', resource: 'Incident Reporting Procedure', severity: 'info' },
  { id: 'aud-14', timestamp: '2026-05-19T09:00:00Z', user: 'System', action: 'Escalated task', resource: 'Background check vendor delay — 2 pending hires', severity: 'critical' },
  { id: 'aud-15', timestamp: '2026-05-18T15:45:00Z', user: 'James Torres', action: 'Changed status', resource: 'Orientation Checklist — May New Hires (6/9 forms)', severity: 'info' },
  { id: 'aud-16', timestamp: '2026-05-18T14:30:00Z', user: 'Maria Gonzalez, RN', action: 'Signed document', resource: '2026 Policy Manual Approval', severity: 'info' },
  { id: 'aud-17', timestamp: '2026-05-18T10:00:00Z', user: 'Robert Chen', action: 'Signed document', resource: '2026 Policy Manual Approval', severity: 'info' },
  { id: 'aud-18', timestamp: '2026-05-17T16:00:00Z', user: 'System', action: 'Created unit', resource: 'ceu-abuse-2026-10-025 — Abuse/Neglect Attestations', severity: 'info' },
  { id: 'aud-19', timestamp: '2026-05-17T11:30:00Z', user: 'Nicole Foster', action: 'Completed form', resource: 'FRM-QAPI-020 — PIP Progress Tracker', severity: 'info' },
  { id: 'aud-20', timestamp: '2026-05-16T14:00:00Z', user: 'Kevin Wu', action: 'Rejected submission', resource: 'PT Competency Self-Assessment (incomplete)', severity: 'warning' },
  { id: 'aud-21', timestamp: '2026-05-16T09:30:00Z', user: 'Elena Vargas', action: 'Modified policy', resource: 'IT-HIPAA-001 — ePHI Access Control', severity: 'info' },
  { id: 'aud-22', timestamp: '2026-05-15T15:30:00Z', user: 'Robert Chen', action: 'Signed document', resource: 'Annual In-Service Training Completion', severity: 'info' },
  { id: 'aud-23', timestamp: '2026-05-15T14:45:00Z', user: 'Robert Chen', action: 'Signed document', resource: 'Medication Reconciliation Audit', severity: 'info' },
  { id: 'aud-24', timestamp: '2026-05-15T10:30:00Z', user: 'Maria Gonzalez, RN', action: 'Signed document', resource: 'Medication Reconciliation Audit', severity: 'info' },
  { id: 'aud-25', timestamp: '2026-05-14T15:30:00Z', user: 'Robert Chen', action: 'Signed document', resource: 'Annual In-Service Training Documentation', severity: 'info' },
  { id: 'aud-26', timestamp: '2026-05-14T13:15:00Z', user: 'Maria Gonzalez, RN', action: 'Signed document', resource: 'Annual In-Service Training Documentation', severity: 'info' },
  { id: 'aud-27', timestamp: '2026-05-13T09:00:00Z', user: 'Robert Chen', action: 'Signed document', resource: 'Fire Safety Corrective Actions — April', severity: 'info' },
  { id: 'aud-28', timestamp: '2026-05-12T16:00:00Z', user: 'Patricia Hale', action: 'Signed document', resource: 'Board Resolution — Q1 Strategic Plan', severity: 'info' },
  { id: 'aud-29', timestamp: '2026-05-12T11:45:00Z', user: 'Robert Chen', action: 'Signed document', resource: 'Board Resolution — Q1 Strategic Plan', severity: 'info' },
  { id: 'aud-30', timestamp: '2026-05-11T10:00:00Z', user: 'System', action: 'Reassigned task', resource: 'TB Screening Doc — reassigned to James Torres', severity: 'warning' },
];

/* ── Policies ── */
export const V3_POLICIES: V3Policy[] = [
  { id: 'CL-SD-016', title: 'Infection Prevention & Control Program', domain: 'Clinical', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Maria Gonzalez, RN', lastReviewed: '2026-04-15', nextReview: '2027-04-15', version: '4.2' },
  { id: 'CL-SD-017', title: 'TB Screening & Documentation', domain: 'Clinical', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Maria Gonzalez, RN', lastReviewed: '2026-03-01', nextReview: '2027-03-01', version: '3.0' },
  { id: 'GV-GB-001', title: 'Governing Body Oversight & Meetings', domain: 'Governance', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Patricia Hale', lastReviewed: '2026-05-12', nextReview: '2027-05-12', version: '5.1' },
  { id: 'GV-GB-002', title: 'Financial Oversight Committee Charter', domain: 'Governance', lifecycle: 'Review', achcMapping: 'In Progress', owner: 'Patricia Hale', lastReviewed: '2026-01-20', nextReview: '2026-07-20', version: '2.3' },
  { id: 'QA-PG-001', title: 'QAPI Program Framework', domain: 'QAPI', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Nicole Foster', lastReviewed: '2026-04-01', nextReview: '2027-04-01', version: '3.1' },
  { id: 'QA-PI-001', title: 'Quality Data Collection & Reporting', domain: 'QAPI', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Nicole Foster', lastReviewed: '2026-03-15', nextReview: '2027-03-15', version: '2.0' },
  { id: 'EP-001', title: 'Emergency Preparedness Plan', domain: 'Compliance', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Elena Vargas', lastReviewed: '2026-05-10', nextReview: '2027-05-10', version: '6.0' },
  { id: 'EP-002', title: 'Fire Safety & Evacuation Procedures', domain: 'Safety', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'James Torres', lastReviewed: '2026-04-20', nextReview: '2027-04-20', version: '3.2' },
  { id: 'HR-WM-005', title: 'Personnel File Requirements', domain: 'HR', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Robert Chen', lastReviewed: '2026-02-15', nextReview: '2027-02-15', version: '4.0' },
  { id: 'HR-TA-005', title: 'Staff Competency Assessment Program', domain: 'HR', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Maria Gonzalez, RN', lastReviewed: '2026-04-05', nextReview: '2027-04-05', version: '2.1' },
  { id: 'IT-HIPAA-001', title: 'ePHI Access Control & Security', domain: 'IT', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Elena Vargas', lastReviewed: '2026-05-16', nextReview: '2027-05-16', version: '5.0' },
  { id: 'IT-HIPAA-003', title: 'HIPAA Breach Notification Procedure', domain: 'IT', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Elena Vargas', lastReviewed: '2026-05-01', nextReview: '2027-05-01', version: '3.1' },
  { id: 'CL-SD-011', title: 'Wound Care Assessment Protocol', domain: 'Clinical', lifecycle: 'Review', achcMapping: 'Mapped', owner: 'Priya Sharma', lastReviewed: '2026-05-19', nextReview: '2026-11-19', version: '3.0' },
  { id: 'CL-SD-013', title: 'Medication Reconciliation Procedures', domain: 'Clinical', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Maria Gonzalez, RN', lastReviewed: '2026-05-15', nextReview: '2027-05-15', version: '2.4' },
  { id: 'OP-SAFETY-001', title: 'Workplace Safety Program', domain: 'Operations', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'James Torres', lastReviewed: '2026-03-20', nextReview: '2027-03-20', version: '2.0' },
  { id: 'GV-PM-001', title: 'Policy & Procedure Management', domain: 'Governance', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Robert Chen', lastReviewed: '2026-04-28', nextReview: '2027-04-28', version: '4.0' },
  { id: 'HR-TRAIN-002', title: 'Annual Training Requirements', domain: 'HR', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'James Torres', lastReviewed: '2026-01-10', nextReview: '2027-01-10', version: '3.2' },
  { id: 'CL-CP-006', title: 'Supervisory Visit Requirements', domain: 'Clinical', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Maria Gonzalez, RN', lastReviewed: '2026-05-20', nextReview: '2027-05-20', version: '2.1' },
  { id: 'FN-FP-001', title: 'Revenue Cycle Management', domain: 'Finance', lifecycle: 'Published', achcMapping: 'N/A', owner: 'David Kim, CPA', lastReviewed: '2026-04-10', nextReview: '2027-04-10', version: '1.3' },
  { id: 'CL-OASIS-001', title: 'OASIS Assessment Accuracy Program', domain: 'Clinical', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Maria Gonzalez, RN', lastReviewed: '2026-05-01', nextReview: '2027-05-01', version: '2.0' },
  { id: 'HR-TA-002', title: 'Background Check & Exclusion Screening', domain: 'HR', lifecycle: 'Draft', achcMapping: 'Pending', owner: 'James Torres', lastReviewed: '2026-05-10', nextReview: '2026-08-10', version: '1.0' },
  { id: 'CL-CP-001', title: 'Care Plan Development & Recertification', domain: 'Clinical', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Dr. Evelyn Vance', lastReviewed: '2026-03-30', nextReview: '2027-03-30', version: '3.5' },
  { id: 'GV-GB-003', title: 'Conflict of Interest Disclosure', domain: 'Governance', lifecycle: 'Pending Approval', achcMapping: 'In Progress', owner: 'Patricia Hale', lastReviewed: '2026-05-18', nextReview: '2027-05-18', version: '2.0' },
  { id: 'CL-PR-006', title: 'Abuse & Neglect Reporting', domain: 'Clinical', lifecycle: 'Published', achcMapping: 'Mapped', owner: 'Robert Chen', lastReviewed: '2026-04-17', nextReview: '2027-04-17', version: '4.1' },
];

/* ── Forms ── */
export const V3_FORMS: V3Form[] = [
  { id: 'FRM-GB-001', title: 'Board Meeting Minutes Template', domain: 'Governance', status: 'Active', lastUpdated: '2026-05-12', completionRate: 75, requiredBy: 'GV-GB-001' },
  { id: 'FRM-GB-002', title: 'Financial Oversight Attestation', domain: 'Governance', status: 'Active', lastUpdated: '2026-04-20', completionRate: 0, requiredBy: 'GV-GB-002' },
  { id: 'QA-FM-020', title: 'QAPI Data Aggregate Summary', domain: 'QAPI', status: 'Active', lastUpdated: '2026-05-18', completionRate: 60, requiredBy: 'QA-PG-001' },
  { id: 'FRM-QAPI-020', title: 'PIP Progress Tracker', domain: 'QAPI', status: 'Active', lastUpdated: '2026-05-17', completionRate: 100, requiredBy: 'QA-PG-001' },
  { id: 'FRM-IPC-003', title: 'Contract Staff TB Log', domain: 'Clinical', status: 'Active', lastUpdated: '2026-05-09', completionRate: 40, requiredBy: 'CL-SD-017' },
  { id: 'FRM-IPC-004', title: 'Screening Gap Remediation Plan', domain: 'Clinical', status: 'Active', lastUpdated: '2026-05-09', completionRate: 0, requiredBy: 'CL-SD-017' },
  { id: 'FRM-EP-001', title: 'After-Action Report Template', domain: 'Compliance', status: 'Active', lastUpdated: '2026-05-10', completionRate: 100, requiredBy: 'EP-001' },
  { id: 'FRM-HR-001', title: 'Personnel File Audit Checklist', domain: 'HR', status: 'Active', lastUpdated: '2026-05-08', completionRate: 100, requiredBy: 'HR-WM-005' },
  { id: 'FRM-HIPAA-001', title: 'HIPAA Training Completion Roster', domain: 'IT', status: 'Active', lastUpdated: '2026-05-20', completionRate: 72, requiredBy: 'IT-HIPAA-001' },
  { id: 'FRM-HIPAA-002', title: 'Annual HIPAA Attestation — Workforce', domain: 'IT', status: 'Active', lastUpdated: '2026-04-15', completionRate: 0, requiredBy: 'IT-HIPAA-001' },
  { id: 'FRM-COMP-001', title: 'Clinical Competency Evaluation Tool', domain: 'HR', status: 'Active', lastUpdated: '2026-05-19', completionRate: 55, requiredBy: 'HR-TA-005' },
  { id: 'FRM-COMP-002', title: 'Supervisory Observation Checklist', domain: 'HR', status: 'Active', lastUpdated: '2026-05-14', completionRate: 30, requiredBy: 'HR-TA-005' },
  { id: 'FRM-ORI-007', title: 'New Hire Orientation Checklist', domain: 'HR', status: 'Active', lastUpdated: '2026-05-20', completionRate: 67, requiredBy: 'HR-WM-005' },
  { id: 'FRM-POL-001', title: 'Policy Review Tracking Matrix', domain: 'Governance', status: 'Active', lastUpdated: '2026-05-18', completionRate: 80, requiredBy: 'GV-PM-001' },
  { id: 'FRM-FIN-001', title: 'Quarterly Financial Summary Report', domain: 'Finance', status: 'Active', lastUpdated: '2026-05-15', completionRate: 50, requiredBy: 'FN-FP-001' },
  { id: 'FRM-SAFETY-001', title: 'Fire Drill Participation Log', domain: 'Safety', status: 'Active', lastUpdated: '2026-05-08', completionRate: 0, requiredBy: 'EP-002' },
  { id: 'FRM-ABN-008', title: 'Abuse/Neglect Reporting Attestation', domain: 'Clinical', status: 'Active', lastUpdated: '2026-05-17', completionRate: 70, requiredBy: 'CL-PR-006' },
  { id: 'FRM-CP-011', title: '60-Day Care Plan Recert Review', domain: 'Clinical', status: 'Active', lastUpdated: '2026-05-20', completionRate: 63, requiredBy: 'CL-CP-001' },
  { id: 'FRM-INF-001', title: 'Monthly Infection Surveillance Log', domain: 'Clinical', status: 'Active', lastUpdated: '2026-05-10', completionRate: 33, requiredBy: 'CL-SD-016' },
  { id: 'FRM-COI-001', title: 'Conflict of Interest Disclosure Form', domain: 'Governance', status: 'Draft', lastUpdated: '2026-05-18', completionRate: 0, requiredBy: 'GV-GB-003' },
];

