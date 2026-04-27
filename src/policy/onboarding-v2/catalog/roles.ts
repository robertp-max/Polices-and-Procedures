import type { Role } from '../types';

export const ROLES: Role[] = [
  { id: 'ADMIN',              name: 'Administrator',                domain: 'EN', description: 'Agency administrator; governing body delegate; ultimate operational authority.' },
  { id: 'CLINICAL_MANAGER',   name: 'Clinical Manager (DON)',       domain: 'CL', description: 'Director of patient care services; clinical operations oversight per CoP §484.105.' },
  { id: 'RN',                 name: 'Registered Nurse',             domain: 'CL', description: 'Licensed RN providing skilled nursing visits and supervisory oversight.' },
  { id: 'LVN',                name: 'LVN / LPN',                    domain: 'CL', description: 'Licensed vocational/practical nurse practicing within scope under RN supervision.' },
  { id: 'HHA',                name: 'Home Health Aide',             domain: 'CL', description: 'CoP §484.80-qualified aide delivering personal care and supportive services.' },
  { id: 'THERAPIST',          name: 'Therapist (PT/OT/SLP)',        domain: 'CL', description: 'Discipline-licensed therapist with discipline-specific scope.' },
  { id: 'QAPI_MEMBER',        name: 'QAPI Committee Participant',   domain: 'QA', description: 'Member of the QAPI committee per agency QAPI charter.' },
  { id: 'COMPLIANCE_OFFICER', name: 'Compliance Officer',           domain: 'CO', description: 'Owner of CO-CP-001 Compliance Program; chairs compliance escalations.' },
  { id: 'PRIVACY_OFFICER',    name: 'Privacy Officer',              domain: 'IT', description: 'HIPAA Privacy rule officer; breach response co-lead.' },
  { id: 'SECURITY_OFFICER',   name: 'Security Officer',             domain: 'IT', description: 'HIPAA Security rule officer; risk analysis owner.' },
  { id: 'OFFICE_STAFF',       name: 'Office / Admin Staff',         domain: 'OP', description: 'General workforce member with workforce-tier compliance obligations.' },
  { id: 'INTAKE',             name: 'Intake / Scheduling',          domain: 'OP', description: 'Intake specialist managing referrals and scheduling.' },
  { id: 'BILLING',            name: 'Billing / Coding',             domain: 'FN', description: 'Billing or coding specialist subject to FN-BC-001 Billing Compliance.' },
  { id: 'GOVERNING_BODY',     name: 'Governing Body Member',        domain: 'EN', description: 'Member of the agency governing body with fiduciary responsibility.' },
  { id: 'MEDICAL_DIRECTOR',   name: 'Medical Director',             domain: 'EN', description: 'Advisory physician providing clinical oversight and QAPI participation.' },
  { id: 'VENDOR',             name: 'Vendor / Contractor',          domain: 'CO', description: 'External vendor or contractor; BA where PHI access applies.' },
  { id: 'VOLUNTEER',          name: 'Volunteer / Student',          domain: 'HR', description: 'Volunteer or student in a supervised, scope-limited role.' },
];
