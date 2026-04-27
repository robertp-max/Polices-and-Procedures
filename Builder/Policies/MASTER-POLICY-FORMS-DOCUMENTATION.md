# CI-ION Home Health — Master Policy Forms Documentation

> **Auto-compiled:** 2026-04-26 18:38
> **Total source files:** 363

---

## SOURCE: Builder\Forns\CL-FM-001.txt

FORM ID: CL-FM-001
TITLE: Start of Care (SOC) Comprehensive Assessment
TYPE: Assessment
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CL-CA-001
- CL-OA-009

PURPOSE:
Comprehensive Start-of-Care (SOC) assessment required within 48 hours of referral or as ordered by physician, per 42 CFR Â§ 484.55.

INSTRUCTIONS:
Performed by an RN (or qualified discipline for therapy-only) in the patient's home. All required OASIS items completed concurrently (CL-FM-002).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Patient Full Legal Name (type=text, required=true, col=2)
- MRN (type=text, required=true, col=1)
- DOB (type=date, required=true, col=1)
- Referral Date (type=date, required=true, col=2)
- SOC Date (type=date, required=true, col=2)
- Physician (type=text, col=4)
- Primary Dx (ICD-10) (type=text, col=2)
- Secondary Dx (type=text, col=2)
- Chief Complaint (type=textarea, col=4)
- History of Present Illness (type=textarea, col=4)
- Past Medical / Surgical History (type=textarea, col=4)
- Current Medications (reconciliation required) (type=textarea, col=4)
- Allergies (meds, environmental, food) (type=text, col=4)
- Functional Status (ADL / IADL) (type=textarea, col=4)
- Cognitive Status (type=textarea, col=4)
- Mental / Behavioral Status (type=textarea, col=4)
- Home Environment & Safety Assessment (type=textarea, col=4)
- Fall Risk Assessment Score (type=text, col=2)
- Pain Assessment (0-10 + character) (type=text, col=2)
- Skin Assessment (wounds, pressure injury) (type=textarea, col=4)
- Cardiopulmonary Exam (type=textarea, col=4)
- Neuro Exam (type=textarea, col=4)
- GU / GI Exam (type=textarea, col=4)
- Support System / Caregiver (type=textarea, col=4)
- Homebound Status Rationale (type=textarea, required=true, col=4)
- Patient Goals (type=textarea, col=4)
- Plan of Care Summary (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Assessing Clinician (RN) â€” Printed Name (type=text, col=2)
- Assessing Clinician (RN) â€” Signature (type=signature, col=1)
- Assessing Clinician (RN) â€” Date (type=date, col=1)
- Patient / Representative â€” Printed Name (type=text, col=2)
- Patient / Representative â€” Signature (type=signature, col=1)
- Patient / Representative â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-001 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CA-001, CL-OA-009

---

## SOURCE: Builder\Forns\CL-FM-002.txt

FORM ID: CL-FM-002
TITLE: OASIS-E1 Assessment Form
TYPE: Assessment
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CA-002
- CL-OA-001

PURPOSE:
CMS OASIS-E1 comprehensive assessment capturing all required data elements for payment, quality measurement, and CoP compliance.

INSTRUCTIONS:
Completed at SOC, ROC, Recert, Transfer, and Discharge time points per 42 CFR Â§ 484.55. Transmitted to iQIES within 30 days via CL-FM-045.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Patient MRN (type=text, required=true, col=2)
- Assessment Reason (M0100) (type=select, required=true, col=2, options=[Start of Care | Resumption of Care | Recertification | Other Follow-up | Transfer â€” Discharge | Transfer â€” Not Discharge | Death at Home | Discharge from Agency])
- M0090 Date Assessment Completed (type=date, required=true, col=2)
- M0030 SOC Date (type=date, col=2)
- M0040 Patient Name (type=text, col=4)
- M0050 Patient State of Residence (type=text, col=1)
- M0060 ZIP Code (type=text, col=1)
- M0069 Gender (type=select, col=1, options=[Male | Female])
- M0080 Discipline (type=select, col=1, options=[RN | PT | SLP | OT])
- M1021 Primary Dx (ICD-10) (type=text, col=4)
- M1023 Other Dx (type=textarea, col=4)
- M1800-M1900 Functional Items (summary) (type=textarea, col=4)
- GG Section (Self-Care / Mobility) (type=textarea, col=4)
- M2001-M2401 Medications & Care Plan (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Assessing Clinician â€” Printed Name (type=text, col=2)
- Assessing Clinician â€” Signature (type=signature, col=1)
- Assessing Clinician â€” Date (type=date, col=1)
- Clinical Reviewer â€” Printed Name (type=text, col=2)
- Clinical Reviewer â€” Signature (type=signature, col=1)
- Clinical Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-002 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CA-002, CL-OA-001

---

## SOURCE: Builder\Forns\CL-FM-003.txt

FORM ID: CL-FM-003
TITLE: Recertification / ROC Assessment
TYPE: Assessment
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CA-004
- CL-OA-004

PURPOSE:
Recertification or Resumption of Care (ROC) OASIS assessment performed at the end of each 60-day certification period or upon return from inpatient stay.

INSTRUCTIONS:
Recert: completed during the last 5 days of the certification period (days 56-60). ROC: within 2 calendar days of return home. Transmission required.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Patient MRN (type=text, required=true, col=2)
- Assessment Type (Recert / ROC) (type=select, required=true, col=2, options=[Recertification | Resumption of Care])
- Assessment Date (type=date, required=true, col=2)
- Current Episode # (1 / 2 / 3+) (type=text, col=2)
- Updated Homebound Rationale (type=textarea, required=true, col=4)
- Functional / Cognitive Changes (type=textarea, col=4)
- Medication Changes (type=textarea, col=4)
- New / Resolved Dx (type=textarea, col=4)
- Revised Plan of Care Summary (type=textarea, col=4)
- Patient / Caregiver Education Updates (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Assessing Clinician â€” Printed Name (type=text, col=2)
- Assessing Clinician â€” Signature (type=signature, col=1)
- Assessing Clinician â€” Date (type=date, col=1)
- Physician (for POC revisions) â€” Printed Name (type=text, col=2)
- Physician (for POC revisions) â€” Signature (type=signature, col=1)
- Physician (for POC revisions) â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-003 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CA-004, CL-OA-004

---

## SOURCE: Builder\Forns\CL-FM-004.txt

FORM ID: CL-FM-004
TITLE: Discharge / Transfer Assessment
TYPE: Assessment
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CP-006
- CL-CA-001

PURPOSE:
Discharge or Transfer OASIS assessment completed at the end of home-health services, capturing outcomes and disposition.

INSTRUCTIONS:
Completed within 2 calendar days of the last visit (discharge) or hospital admission (transfer). Transmitted via CL-FM-045.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Patient MRN (type=text, required=true, col=2)
- Discharge / Transfer Type (type=select, required=true, col=2, options=[Discharge â€” goals met | Discharge â€” to community | Discharge â€” to SNF | Transfer â€” inpatient (w/o discharge) | Transfer â€” inpatient (w/ discharge) | Death at home])
- Date of Discharge / Transfer (type=date, required=true, col=2)
- Final Disposition / Setting (type=text, col=2)
- Summary of Services Provided (type=textarea, col=4)
- Goals Achieved / Not Achieved (type=textarea, col=4)
- Functional / Cognitive Status at Discharge (type=textarea, col=4)
- Recommendations / Follow-Up Provider (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Assessing Clinician â€” Printed Name (type=text, col=2)
- Assessing Clinician â€” Signature (type=signature, col=1)
- Assessing Clinician â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-004 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CP-006, CL-CA-001

---

## SOURCE: Builder\Forns\CL-FM-005.txt

FORM ID: CL-FM-005
TITLE: Plan of Care (485 Form)
TYPE: Template
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CL-CP-001

PURPOSE:
Home Health Plan of Care (CMS Form 485) documenting physician orders, diagnoses, services, frequency, duration, and goals per 42 CFR Â§ 484.60.

INSTRUCTIONS:
Signed by the attending physician within 30 days of SOC and prior to billing. Updated at each recertification.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Patient Name (type=text, required=true, col=2)
- MRN (type=text, required=true, col=1)
- SOC Date (type=date, col=1)
- Certification Period (From / To) (type=text, required=true, col=2)
- Primary Dx (ICD-10) (type=text, required=true, col=2)
- Secondary Dx (type=textarea, col=4)
- DME / Supplies (type=textarea, col=4)
- Safety Measures (type=textarea, col=4)
- Nutritional Requirements (type=textarea, col=4)
- Allergies (type=text, col=4)
- Functional Limitations (type=text, col=4)
- Activities Permitted (type=text, col=4)
- Mental Status (type=text, col=2)
- Prognosis (type=select, col=2, options=[Poor | Guarded | Fair | Good | Excellent])
- SN Orders / Frequency / Duration (type=textarea, col=4)
- PT Orders / Frequency / Duration (type=textarea, col=4)
- OT Orders / Frequency / Duration (type=textarea, col=4)
- SLP Orders / Frequency / Duration (type=textarea, col=4)
- MSW Orders / Frequency / Duration (type=textarea, col=4)
- HHA Orders / Frequency / Duration (type=textarea, col=4)
- Goals / Rehab Potential / Discharge Plans (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- RN Case Manager â€” Printed Name (type=text, col=2)
- RN Case Manager â€” Signature (type=signature, col=1)
- RN Case Manager â€” Date (type=date, col=1)
- Attending Physician â€” Printed Name (type=text, col=2)
- Attending Physician â€” Signature (type=signature, col=1)
- Attending Physician â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-005 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CP-001

---

## SOURCE: Builder\Forns\CL-FM-006.txt

FORM ID: CL-FM-006
TITLE: Physician Orders Sheet
TYPE: Template
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CL-CP-003

PURPOSE:
Capture of additional physician orders (new, changed, or discontinued) beyond those on the original 485 Plan of Care.

INSTRUCTIONS:
Documented at time of order. Verbal/telephone orders must be signed by physician within the timeframe required by state law (CA: within 7 days).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Patient MRN (type=text, required=true, col=1)
- Patient Name (type=text, required=true, col=3)
- Order Date / Time (type=text, required=true, col=2)
- Order Type (type=select, col=2, options=[Telephone | Verbal | Written | Secure Message | Fax])
- Ordering Physician (type=text, required=true, col=2)
- NPI (type=text, col=2)
- Order Detail (verbatim) (type=textarea, required=true, col=4)
- Clinical Indication (type=textarea, col=4)
- Received By (Clinician) (type=text, col=2)
- Physician Signature Due Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Receiving Clinician â€” Printed Name (type=text, col=2)
- Receiving Clinician â€” Signature (type=signature, col=1)
- Receiving Clinician â€” Date (type=date, col=1)
- Attending Physician â€” Printed Name (type=text, col=2)
- Attending Physician â€” Signature (type=signature, col=1)
- Attending Physician â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-006 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CP-003

---

## SOURCE: Builder\Forns\CL-FM-007.txt

FORM ID: CL-FM-007
TITLE: Verbal Order Log
TYPE: Log
DOMAIN: CL
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CP-004

PURPOSE:
Log of every verbal / telephone order received from a physician, tracked through signature and filing.

INSTRUCTIONS:
Updated within 1 business day of order receipt. Overdue physician signatures (>7 days in CA) escalated to Clinical Manager and Compliance Officer.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date Received
- Patient MRN
- Physician
- Order Summary
- Received By
- Date Signed by MD
- Days to Sign
- Status
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-007 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CP-004

---

## SOURCE: Builder\Forns\CL-FM-008.txt

FORM ID: CL-FM-008
TITLE: Physician Order Signature Tracking Log
TYPE: Tracking Tool
DOMAIN: CL
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CP-009

PURPOSE:
Log of all POC and physician orders pending physician signature, ordered by age to drive follow-up.

INSTRUCTIONS:
Reviewed weekly by Clinical Manager. Orders unsigned > 30 days escalated and billing suspended for the episode until resolved.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Order / POC ID
- Patient MRN
- Physician
- Date Sent
- Days Pending
- Follow-Up Attempts
- Next Action
- Status
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-008 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CP-009

---

## SOURCE: Builder\Forns\CL-FM-009.txt

FORM ID: CL-FM-009
TITLE: Homebound Status Determination Checklist
TYPE: Checklist
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CA-005

PURPOSE:
Documents the clinical rationale supporting Medicare's homebound eligibility requirements per 42 CFR Â§ 409.42(a).

INSTRUCTIONS:
Completed at SOC and each recertification. Must address both criteria of homebound status (needing assistance and leaving home is a considerable effort).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Homebound Status Determination Checklist Checklist
layout: checklist

checklist_items:
- Patient needs assistance of another person OR an assistive device to leave home
- Leaving home is medically contraindicated
- Leaving home requires considerable and taxing effort
- Absences from home are infrequent, of relatively short duration, or for medical purposes
- Specific functional limitations documented (gait, endurance, cognition)
- Clinical conditions contributing to homebound status
- Re-validated at each certification
- Rationale explicitly documented in narrative (not just checkbox)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Assessing Clinician â€” Printed Name (type=text, col=2)
- Assessing Clinician â€” Signature (type=signature, col=1)
- Assessing Clinician â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-009 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CA-005

---

## SOURCE: Builder\Forns\CL-FM-010.txt

FORM ID: CL-FM-010
TITLE: Face-to-Face Encounter Documentation
TYPE: Template
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CL-CA-006
- CL-CA-007

PURPOSE:
Face-to-face encounter documentation supporting Medicare eligibility per 42 CFR Â§ 424.22, including date, provider, and clinical rationale.

INSTRUCTIONS:
Must occur within 90 days prior to or 30 days after SOC, and be documented by the certifying physician.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Patient Name / MRN (type=text, required=true, col=4)
- F2F Encounter Date (type=date, required=true, col=2)
- Provider Type (type=select, col=2, options=[Certifying Physician | Allowed NPP])
- Provider Name / NPI (type=text, required=true, col=4)
- Primary Reason for HH Services (type=textarea, required=true, col=4)
- Clinical Findings Supporting Homebound (type=textarea, required=true, col=4)
- Clinical Findings Supporting Need for Skilled Care (type=textarea, required=true, col=4)
- Encounter Type (Office / Inpatient / Telehealth) (type=select, col=2, options=[Office | Inpatient | Telehealth | Home])
- Date of Physician Certification (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Certifying Physician â€” Printed Name (type=text, col=2)
- Certifying Physician â€” Signature (type=signature, col=1)
- Certifying Physician â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-010 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CA-006, CL-CA-007

---

## SOURCE: Builder\Forns\CL-FM-011.txt

FORM ID: CL-FM-011
TITLE: Missed Visit Documentation Form
TYPE: Form
DOMAIN: CL
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-SD-024

PURPOSE:
Standardized form capturing the required data elements for Missed Visit Documentation Form, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (triggered). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Subject of Form (type=text, col=4)
- Related Reference / ID (type=text, col=2)
- Date of Event (type=date, col=2)
- Description / Narrative (type=textarea, col=4)
- Outcome / Decision (type=textarea, col=4)
- Follow-Up Required (Y/N) (type=select, col=2, options=[Yes | No])
- Follow-Up Owner (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-011 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-024

---

## SOURCE: Builder\Forns\CL-FM-012.txt

FORM ID: CL-FM-012
TITLE: Visit Frequency Compliance Tracking Log
TYPE: Log
DOMAIN: CL
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-SD-025

PURPOSE:
Standardized log capturing the required data elements for Visit Frequency Compliance Tracking Log, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (ongoing). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Visit Frequency Compliance Tracking Log Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-012 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-025

---

## SOURCE: Builder\Forns\CL-FM-013.txt

FORM ID: CL-FM-013
TITLE: Clinical Skilled Note â€” RN
TYPE: Template
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Visit
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CL-SD-001
- CL-CD-001

PURPOSE:
Standardized template capturing the required data elements for Clinical Skilled Note â€” RN, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per visit). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Title / Subject (type=text, col=4)
- Date (type=date, col=2)
- Prepared By (type=text, col=2)
- Body / Narrative (type=textarea, col=4)
- Attachments / References (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-013 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-001, CL-CD-001

---

## SOURCE: Builder\Forns\CL-FM-014.txt

FORM ID: CL-FM-014
TITLE: Clinical Skilled Note â€” PT/OT/SLP
TYPE: Template
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Visit
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CL-SD-002
- CL-SD-003
- CL-SD-004
- CL-CD-001

PURPOSE:
Standardized template capturing the required data elements for Clinical Skilled Note â€” PT/OT/SLP, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per visit). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Title / Subject (type=text, col=4)
- Date (type=date, col=2)
- Prepared By (type=text, col=2)
- Body / Narrative (type=textarea, col=4)
- Attachments / References (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-014 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-002, CL-SD-003, CL-SD-004, CL-CD-001

---

## SOURCE: Builder\Forns\CL-FM-015.txt

FORM ID: CL-FM-015
TITLE: Home Health Aide Visit Record
TYPE: Template
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Visit
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CL-SD-006

PURPOSE:
Standardized template capturing the required data elements for Home Health Aide Visit Record, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per visit). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Title / Subject (type=text, col=4)
- Date (type=date, col=2)
- Prepared By (type=text, col=2)
- Body / Narrative (type=textarea, col=4)
- Attachments / References (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-015 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-006

---

## SOURCE: Builder\Forns\CL-FM-016.txt

FORM ID: CL-FM-016
TITLE: HHA Competency Evaluation Checklist
TYPE: Checklist
DOMAIN: CL
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-SD-007

PURPOSE:
Standardized checklist capturing the required data elements for HHA Competency Evaluation Checklist, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (annual). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” HHA Competency Evaluation Checklist Checklist
layout: checklist

checklist_items:
- HHA Competency Evaluation Checklist â€” Regulatory requirement reviewed and understood
- HHA Competency Evaluation Checklist â€” Applicable policy section located and re-read
- HHA Competency Evaluation Checklist â€” Required documentation identified and accessible
- HHA Competency Evaluation Checklist â€” All data fields confirmed complete and accurate
- HHA Competency Evaluation Checklist â€” Signatures / attestations obtained from required parties
- HHA Competency Evaluation Checklist â€” Copy filed in the appropriate record per retention schedule
- HHA Competency Evaluation Checklist â€” Completion entered in tracking log / dashboard
- HHA Competency Evaluation Checklist â€” Any deficiencies escalated to supervisor / Compliance Officer
- HHA Competency Evaluation Checklist â€” Corrective action documented and tracked to closure
- HHA Competency Evaluation Checklist â€” Annual review date set and added to calendar

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-016 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-007

---

## SOURCE: Builder\Forns\CL-FM-017.txt

FORM ID: CL-FM-017
TITLE: Wound Assessment & Care Flow Sheet
TYPE: Tracking Tool
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Visit
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-SD-011

PURPOSE:
Standardized tracking tool capturing the required data elements for Wound Assessment & Care Flow Sheet, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per visit). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Wound Assessment & Care Flow Sheet Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-017 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-011

---

## SOURCE: Builder\Forns\CL-FM-018.txt

FORM ID: CL-FM-018
TITLE: Medication Administration Record (MAR)
TYPE: Log
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Visit
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- CL-SD-012

PURPOSE:
Medication Administration Record (MAR) documenting every medication dose scheduled, given, or missed, including PRNs, with double-checks on high-alert medications.

INSTRUCTIONS:
Completed at each visit. Late entries marked per CL-FM-033. High-alert meds (insulin, anticoagulants, opioids) require independent double-check (RM-FM-012).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date
- Time
- Drug / Dose / Route
- Scheduled?
- Administered Y/N
- Site
- PRN Reason
- Effect / Response
- Initial
- Witness (if high-alert)
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-018 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-012

---

## SOURCE: Builder\Forns\CL-FM-019.txt

FORM ID: CL-FM-019
TITLE: Medication Reconciliation Worksheet
TYPE: Worksheet
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- CL-SD-013

PURPOSE:
Medication reconciliation worksheet documenting every medication the patient is taking across all prescribers, with indication, dose, and any discrepancies.

INSTRUCTIONS:
Completed at SOC, Recert, ROC, and any care-transition event. Discrepancies communicated to prescriber and tracked to resolution.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Situation / Scope (type=textarea, col=4)
- Data / Evidence Reviewed (type=textarea, col=4)
- Analysis (type=textarea, col=4)
- Findings (type=textarea, col=4)
- Recommendations (type=textarea, col=4)
- Next Steps / Owner / Due Date (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-019 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-013

---

## SOURCE: Builder\Forns\CL-FM-020.txt

FORM ID: CL-FM-020
TITLE: Fall Risk Assessment Tool
TYPE: Assessment
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- CL-SD-015

PURPOSE:
Multifactor Fall Risk Assessment using a validated tool (Morse / Tinetti / MAHC-10), re-assessed at SOC, Recert, and any significant change.

INSTRUCTIONS:
Score determines fall-prevention interventions. High-risk patients receive documented home-safety counseling and PT referral if indicated.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Patient MRN (type=text, required=true, col=2)
- Assessment Date (type=date, required=true, col=2)
- Tool Used (type=select, col=2, options=[Morse Fall Scale | Tinetti | MAHC-10 | STEADI])
- Score (type=number, col=2)
- Risk Category (type=select, col=2, options=[Low | Moderate | High])
- History of Falls (12 months) (type=text, col=2)
- Fall Contributing Factors (type=textarea, col=4)
- Preventive Interventions Implemented (type=textarea, col=4)
- Patient / Caregiver Education Documented (type=textarea, col=4)
- PT / OT Referral Made (type=select, col=2, options=[Yes | No | N/A])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Assessing Clinician â€” Printed Name (type=text, col=2)
- Assessing Clinician â€” Signature (type=signature, col=1)
- Assessing Clinician â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-020 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-015

---

## SOURCE: Builder\Forns\CL-FM-021.txt

FORM ID: CL-FM-021
TITLE: Infection Control Precautions Checklist
TYPE: Checklist
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Visit
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-SD-016

PURPOSE:
Standardized checklist capturing the required data elements for Infection Control Precautions Checklist, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per visit). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Infection Control Precautions Checklist Checklist
layout: checklist

checklist_items:
- Infection Control Precautions Checklist â€” Regulatory requirement reviewed and understood
- Infection Control Precautions Checklist â€” Applicable policy section located and re-read
- Infection Control Precautions Checklist â€” Required documentation identified and accessible
- Infection Control Precautions Checklist â€” All data fields confirmed complete and accurate
- Infection Control Precautions Checklist â€” Signatures / attestations obtained from required parties
- Infection Control Precautions Checklist â€” Copy filed in the appropriate record per retention schedule
- Infection Control Precautions Checklist â€” Completion entered in tracking log / dashboard
- Infection Control Precautions Checklist â€” Any deficiencies escalated to supervisor / Compliance Officer
- Infection Control Precautions Checklist â€” Corrective action documented and tracked to closure
- Infection Control Precautions Checklist â€” Annual review date set and added to calendar

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-021 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-016

---

## SOURCE: Builder\Forns\CL-FM-022.txt

FORM ID: CL-FM-022
TITLE: Patient Education Documentation Record
TYPE: Tracking Tool
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Visit
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-SD-017

PURPOSE:
Standardized tracking tool capturing the required data elements for Patient Education Documentation Record, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per visit). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Patient Education Documentation Record Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-022 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-017

---

## SOURCE: Builder\Forns\CL-FM-023.txt

FORM ID: CL-FM-023
TITLE: Diabetic Management Flow Sheet
TYPE: Tracking Tool
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Visit
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- CL-SD-018

PURPOSE:
Standardized tracking tool capturing the required data elements for Diabetic Management Flow Sheet, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per visit). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Diabetic Management Flow Sheet Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-023 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-018

---

## SOURCE: Builder\Forns\CL-FM-024.txt

FORM ID: CL-FM-024
TITLE: Cardiac & Respiratory Monitoring Log
TYPE: Log
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Visit
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- CL-SD-019
- CL-SD-020

PURPOSE:
Standardized log capturing the required data elements for Cardiac & Respiratory Monitoring Log, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per visit). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Cardiac & Respiratory Monitoring Log Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-024 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-019, CL-SD-020

---

## SOURCE: Builder\Forns\CL-FM-025.txt

FORM ID: CL-FM-025
TITLE: Telehealth Service Consent & Documentation
TYPE: Attestation
DOMAIN: CL
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- CL-SD-009

PURPOSE:
Standardized attestation capturing the required data elements for Telehealth Service Consent & Documentation, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (triggered). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
By signing below, I hereby certify and attest that:

acknowledgments:
- I have read, reviewed, and understood the requirements of this form.
- The information I have provided is accurate, complete, and truthful to the best of my knowledge.
- I understand my obligation to report any changes in the information provided within 7 calendar days.
- I understand that false statements may result in corrective action up to and including termination.
- I agree to comply with all applicable Care Indeed policies, procedures, and regulatory requirements.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-025 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-009

---

## SOURCE: Builder\Forns\CL-FM-026.txt

FORM ID: CL-FM-026
TITLE: Pain Assessment Scale & Management Log
TYPE: Log
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Visit
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- CL-SD-014

PURPOSE:
Standardized log capturing the required data elements for Pain Assessment Scale & Management Log, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per visit). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Pain Assessment Scale & Management Log Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-026 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-014

---

## SOURCE: Builder\Forns\CL-FM-027.txt

FORM ID: CL-FM-027
TITLE: Patient Rights & Responsibilities Acknowledgment
TYPE: Attestation
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, digital_candidate

LINKED POLICIES:
- CL-PR-001

PURPOSE:
Written acknowledgment by the patient (or legal representative) that the patient has received and reviewed the Home Health Patient Rights and Responsibilities notice per 42 CFR Â§ 484.50.

INSTRUCTIONS:
Provided at SOC and reviewed at each recertification. Signed copy retained in clinical record; unsigned copy left in the home.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I acknowledge that:

acknowledgments:
- I have received and reviewed the Home Health Patient Rights and Responsibilities.
- I have been informed of my right to receive appropriate and professional care without discrimination.
- I have been informed of the agency's grievance process and the CDPH hotline (1-800-228-1363) and CMS Beneficiary Hotline.
- I have received the OIG Advance Beneficiary Notice (if applicable).
- I have been informed of my right to advance directives and end-of-life decisions.
- I have been informed of the agency's services, payment sources, charges, and my financial responsibilities.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Patient / Representative â€” Printed Name (type=text, col=2)
- Patient / Representative â€” Signature (type=signature, col=1)
- Patient / Representative â€” Date (type=date, col=1)
- Clinician â€” Printed Name (type=text, col=2)
- Clinician â€” Signature (type=signature, col=1)
- Clinician â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-027 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-PR-001

---

## SOURCE: Builder\Forns\CL-FM-028.txt

FORM ID: CL-FM-028
TITLE: Advance Directive Documentation & Review
TYPE: Checklist
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-PR-002

PURPOSE:
Standardized checklist capturing the required data elements for Advance Directive Documentation & Review, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per episode). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Advance Directive Documentation & Review Checklist
layout: checklist

checklist_items:
- Advance Directive Documentation & Review â€” Regulatory requirement reviewed and understood
- Advance Directive Documentation & Review â€” Applicable policy section located and re-read
- Advance Directive Documentation & Review â€” Required documentation identified and accessible
- Advance Directive Documentation & Review â€” All data fields confirmed complete and accurate
- Advance Directive Documentation & Review â€” Signatures / attestations obtained from required parties
- Advance Directive Documentation & Review â€” Copy filed in the appropriate record per retention schedule
- Advance Directive Documentation & Review â€” Completion entered in tracking log / dashboard
- Advance Directive Documentation & Review â€” Any deficiencies escalated to supervisor / Compliance Officer
- Advance Directive Documentation & Review â€” Corrective action documented and tracked to closure
- Advance Directive Documentation & Review â€” Annual review date set and added to calendar

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-028 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-PR-002

---

## SOURCE: Builder\Forns\CL-FM-029.txt

FORM ID: CL-FM-029
TITLE: Informed Consent Form
TYPE: Attestation
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, digital_candidate

LINKED POLICIES:
- CL-PR-003

PURPOSE:
Informed consent documenting the patient's voluntary agreement to receive home health services after explanation of scope, risks, alternatives, and costs.

INSTRUCTIONS:
Obtained at SOC prior to any service delivery. Witnessed by the clinician. Signed copy retained; patient receives a duplicate.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I consent to receive the home health services described above. I understand that:

acknowledgments:
- I may refuse any treatment at any time without penalty.
- I have been informed of risks, benefits, and alternatives.
- I may be financially responsible for services not covered by insurance.
- I may receive services from different disciplines (RN, PT, OT, SLP, MSW, HHA) as ordered.
- My clinical record may be reviewed by surveyors, auditors, and payers for quality and compliance.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Patient / Representative â€” Printed Name (type=text, col=2)
- Patient / Representative â€” Signature (type=signature, col=1)
- Patient / Representative â€” Date (type=date, col=1)
- Witness (Clinician) â€” Printed Name (type=text, col=2)
- Witness (Clinician) â€” Signature (type=signature, col=1)
- Witness (Clinician) â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-029 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-PR-003

---

## SOURCE: Builder\Forns\CL-FM-030.txt

FORM ID: CL-FM-030
TITLE: Abuse / Neglect Incident Report
TYPE: Form
DOMAIN: CL
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, audit_critical

LINKED POLICIES:
- CL-PR-006

PURPOSE:
Report of suspected or observed abuse, neglect, or exploitation of a patient, with immediate notification to APS, law enforcement, and agency leadership per California WIC Â§ 15630.

INSTRUCTIONS:
Reported by phone to APS within 2 hours and followed by written report within 2 business days. All mandated-reporter obligations apply.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Patient Name / MRN (type=text, required=true, col=4)
- Reporter Name / Role (type=text, required=true, col=2)
- Date / Time Discovered (type=text, required=true, col=2)
- Type of Abuse (type=select, required=true, col=2, options=[Physical | Sexual | Emotional | Neglect | Financial | Abandonment | Isolation | Other])
- Alleged Perpetrator (if known) (type=text, col=2)
- Observations / Physical Findings (type=textarea, required=true, col=4)
- Patient / Reporter Statements (type=textarea, col=4)
- Immediate Safety Actions Taken (type=textarea, required=true, col=4)
- APS Report Date / Time (type=text, required=true, col=2)
- Law Enforcement Report (if any) (type=text, col=2)
- Written Follow-Up Report Sent (type=date, col=2)
- Clinical Manager / Compliance Notified (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Reporting Clinician â€” Printed Name (type=text, col=2)
- Reporting Clinician â€” Signature (type=signature, col=1)
- Reporting Clinician â€” Date (type=date, col=1)
- Clinical Manager â€” Printed Name (type=text, col=2)
- Clinical Manager â€” Signature (type=signature, col=1)
- Clinical Manager â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-030 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-PR-006

---

## SOURCE: Builder\Forns\CL-FM-031.txt

FORM ID: CL-FM-031
TITLE: OASIS Pre-Submission QA Checklist
TYPE: Checklist
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-OA-002
- CL-OA-019

PURPOSE:
Standardized checklist capturing the required data elements for OASIS Pre-Submission QA Checklist, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per episode). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” OASIS Pre-Submission QA Checklist Checklist
layout: checklist

checklist_items:
- OASIS Pre-Submission QA Checklist â€” Regulatory requirement reviewed and understood
- OASIS Pre-Submission QA Checklist â€” Applicable policy section located and re-read
- OASIS Pre-Submission QA Checklist â€” Required documentation identified and accessible
- OASIS Pre-Submission QA Checklist â€” All data fields confirmed complete and accurate
- OASIS Pre-Submission QA Checklist â€” Signatures / attestations obtained from required parties
- OASIS Pre-Submission QA Checklist â€” Copy filed in the appropriate record per retention schedule
- OASIS Pre-Submission QA Checklist â€” Completion entered in tracking log / dashboard
- OASIS Pre-Submission QA Checklist â€” Any deficiencies escalated to supervisor / Compliance Officer
- OASIS Pre-Submission QA Checklist â€” Corrective action documented and tracked to closure
- OASIS Pre-Submission QA Checklist â€” Annual review date set and added to calendar

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-031 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-OA-002, CL-OA-019

---

## SOURCE: Builder\Forns\CL-FM-032.txt

FORM ID: CL-FM-032
TITLE: OASIS Coding Decision Worksheet
TYPE: Worksheet
DOMAIN: CL
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-OA-007
- CL-OA-012

PURPOSE:
Standardized worksheet capturing the required data elements for OASIS Coding Decision Worksheet, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (triggered). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Situation / Scope (type=textarea, col=4)
- Data / Evidence Reviewed (type=textarea, col=4)
- Analysis (type=textarea, col=4)
- Findings (type=textarea, col=4)
- Recommendations (type=textarea, col=4)
- Next Steps / Owner / Due Date (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-032 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-OA-007, CL-OA-012

---

## SOURCE: Builder\Forns\CL-FM-033.txt

FORM ID: CL-FM-033
TITLE: Late Entry / Amendment Documentation Form
TYPE: Form
DOMAIN: CL
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CD-003

PURPOSE:
Standardized form capturing the required data elements for Late Entry / Amendment Documentation Form, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (triggered). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Subject of Form (type=text, col=4)
- Related Reference / ID (type=text, col=2)
- Date of Event (type=date, col=2)
- Description / Narrative (type=textarea, col=4)
- Outcome / Decision (type=textarea, col=4)
- Follow-Up Required (Y/N) (type=select, col=2, options=[Yes | No])
- Follow-Up Owner (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-033 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CD-003

---

## SOURCE: Builder\Forns\CL-FM-034.txt

FORM ID: CL-FM-034
TITLE: Clinical Record Completion Audit Checklist
TYPE: Checklist
DOMAIN: CL
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CD-004

PURPOSE:
Standardized checklist capturing the required data elements for Clinical Record Completion Audit Checklist, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (ongoing). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Clinical Record Completion Audit Checklist Checklist
layout: checklist

checklist_items:
- Clinical Record Completion Audit Checklist â€” Regulatory requirement reviewed and understood
- Clinical Record Completion Audit Checklist â€” Applicable policy section located and re-read
- Clinical Record Completion Audit Checklist â€” Required documentation identified and accessible
- Clinical Record Completion Audit Checklist â€” All data fields confirmed complete and accurate
- Clinical Record Completion Audit Checklist â€” Signatures / attestations obtained from required parties
- Clinical Record Completion Audit Checklist â€” Copy filed in the appropriate record per retention schedule
- Clinical Record Completion Audit Checklist â€” Completion entered in tracking log / dashboard
- Clinical Record Completion Audit Checklist â€” Any deficiencies escalated to supervisor / Compliance Officer
- Clinical Record Completion Audit Checklist â€” Corrective action documented and tracked to closure
- Clinical Record Completion Audit Checklist â€” Annual review date set and added to calendar

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-034 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CD-004

---

## SOURCE: Builder\Forns\CL-FM-035.txt

FORM ID: CL-FM-035
TITLE: Coordination of Care Communication Log
TYPE: Log
DOMAIN: CL
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CP-005

PURPOSE:
Standardized log capturing the required data elements for Coordination of Care Communication Log, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (ongoing). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Coordination of Care Communication Log Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-035 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CP-005

---

## SOURCE: Builder\Forns\CL-FM-036.txt

FORM ID: CL-FM-036
TITLE: Transfer / Discharge Summary
TYPE: Template
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CL-CP-006
- CL-CP-007

PURPOSE:
Standardized template capturing the required data elements for Transfer / Discharge Summary, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per episode). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Title / Subject (type=text, col=4)
- Date (type=date, col=2)
- Prepared By (type=text, col=2)
- Body / Narrative (type=textarea, col=4)
- Attachments / References (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-036 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CP-006, CL-CP-007

---

## SOURCE: Builder\Forns\CL-FM-037.txt

FORM ID: CL-FM-037
TITLE: Palliative / End-of-Life Care Plan
TYPE: Template
DOMAIN: CL
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- CL-SD-023

PURPOSE:
Standardized template capturing the required data elements for Palliative / End-of-Life Care Plan, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (triggered). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Title / Subject (type=text, col=4)
- Date (type=date, col=2)
- Prepared By (type=text, col=2)
- Body / Narrative (type=textarea, col=4)
- Attachments / References (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-037 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-023

---

## SOURCE: Builder\Forns\CL-FM-038.txt

FORM ID: CL-FM-038
TITLE: Behavioral Health Screening Tool
TYPE: Assessment
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- CL-SD-022

PURPOSE:
Standardized assessment capturing the required data elements for Behavioral Health Screening Tool, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per episode). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Subject / Patient / Area Assessed (type=text, col=4)
- Assessment Date (type=date, col=2)
- Overall Risk Rating (type=select, col=2, options=[Low | Moderate | High])
- Findings Summary (type=textarea, col=4)
- Strengths Identified (type=textarea, col=4)
- Opportunities for Improvement (type=textarea, col=4)
- Recommended Action Plan (type=textarea, col=4)
- Follow-Up Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-038 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-022

---

## SOURCE: Builder\Forns\CL-FM-039.txt

FORM ID: CL-FM-039
TITLE: Pediatric Clinical Assessment Form
TYPE: Assessment
DOMAIN: CL
USAGE: Conditional
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- CL-SD-021

PURPOSE:
Standardized assessment capturing the required data elements for Pediatric Clinical Assessment Form, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per episode). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Subject / Patient / Area Assessed (type=text, col=4)
- Assessment Date (type=date, col=2)
- Overall Risk Rating (type=select, col=2, options=[Low | Moderate | High])
- Findings Summary (type=textarea, col=4)
- Strengths Identified (type=textarea, col=4)
- Opportunities for Improvement (type=textarea, col=4)
- Recommended Action Plan (type=textarea, col=4)
- Follow-Up Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-039 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-021

---

## SOURCE: Builder\Forns\CL-FM-040.txt

FORM ID: CL-FM-040
TITLE: IV / Infusion Therapy Monitoring Log
TYPE: Log
DOMAIN: CL
USAGE: Conditional
FREQUENCY: Per Visit
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: high_risk, audit_critical

LINKED POLICIES:
- CL-SD-010

PURPOSE:
Standardized log capturing the required data elements for IV / Infusion Therapy Monitoring Log, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per visit). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- IV / Infusion Therapy Monitoring Log Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-040 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-010

---

## SOURCE: Builder\Forns\CL-FM-041.txt

FORM ID: CL-FM-041
TITLE: Medical Social Work Assessment & Plan
TYPE: Assessment
DOMAIN: CL
USAGE: Conditional
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- CL-SD-005

PURPOSE:
Standardized assessment capturing the required data elements for Medical Social Work Assessment & Plan, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per episode). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Subject / Patient / Area Assessed (type=text, col=4)
- Assessment Date (type=date, col=2)
- Overall Risk Rating (type=select, col=2, options=[Low | Moderate | High])
- Findings Summary (type=textarea, col=4)
- Strengths Identified (type=textarea, col=4)
- Opportunities for Improvement (type=textarea, col=4)
- Recommended Action Plan (type=textarea, col=4)
- Follow-Up Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-041 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-005

---

## SOURCE: Builder\Forns\CL-FM-042.txt

FORM ID: CL-FM-042
TITLE: Supervisory Visit Documentation (RN)
TYPE: Template
DOMAIN: CL
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-SD-008

PURPOSE:
Standardized template capturing the required data elements for Supervisory Visit Documentation (RN), aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (triggered). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Title / Subject (type=text, col=4)
- Date (type=date, col=2)
- Prepared By (type=text, col=2)
- Body / Narrative (type=textarea, col=4)
- Attachments / References (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-042 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-008

---

## SOURCE: Builder\Forns\CL-FM-043.txt

FORM ID: CL-FM-043
TITLE: Emergency Preparedness Clinical Protocol
TYPE: Reference
DOMAIN: CL
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- CL-PR-005

PURPOSE:
Standardized reference capturing the required data elements for Emergency Preparedness Clinical Protocol, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (annual). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Reference Content
layout: grid

fields:
- Reference Title (type=text, col=4)
- Version / Date (type=text, col=2)
- Owner (type=text, col=2)
- Reference Body (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-043 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-PR-005

---

## SOURCE: Builder\Forns\CL-FM-044.txt

FORM ID: CL-FM-044
TITLE: Physician Recertification Tracking Log
TYPE: Log
DOMAIN: CL
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CP-008

PURPOSE:
Standardized log capturing the required data elements for Physician Recertification Tracking Log, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (ongoing). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Physician Recertification Tracking Log Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-044 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CP-008

---

## SOURCE: Builder\Forns\CL-FM-045.txt

FORM ID: CL-FM-045
TITLE: OASIS Transmission Confirmation Log
TYPE: Log
DOMAIN: CL
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CA-003
- CL-OA-003

PURPOSE:
Standardized log capturing the required data elements for OASIS Transmission Confirmation Log, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (ongoing). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- OASIS Transmission Confirmation Log Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-045 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CA-003, CL-OA-003

---

## SOURCE: Builder\Forns\CL-FM-046.txt

FORM ID: CL-FM-046
TITLE: Patient / Family Caregiver Training Record
TYPE: Tracking Tool
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- CL-SD-017

PURPOSE:
Standardized tracking tool capturing the required data elements for Patient / Family Caregiver Training Record, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per episode). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Patient / Family Caregiver Training Record Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-046 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-017

---

## SOURCE: Builder\Forns\CL-FM-047.txt

FORM ID: CL-FM-047
TITLE: High-Risk Patient Monitoring Protocol
TYPE: Checklist
DOMAIN: CL
USAGE: Conditional
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- CL-SD-019
- CL-SD-020

PURPOSE:
Standardized checklist capturing the required data elements for High-Risk Patient Monitoring Protocol, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (ongoing). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” High-Risk Patient Monitoring Protocol Checklist
layout: checklist

checklist_items:
- High-Risk Patient Monitoring Protocol â€” Regulatory requirement reviewed and understood
- High-Risk Patient Monitoring Protocol â€” Applicable policy section located and re-read
- High-Risk Patient Monitoring Protocol â€” Required documentation identified and accessible
- High-Risk Patient Monitoring Protocol â€” All data fields confirmed complete and accurate
- High-Risk Patient Monitoring Protocol â€” Signatures / attestations obtained from required parties
- High-Risk Patient Monitoring Protocol â€” Copy filed in the appropriate record per retention schedule
- High-Risk Patient Monitoring Protocol â€” Completion entered in tracking log / dashboard
- High-Risk Patient Monitoring Protocol â€” Any deficiencies escalated to supervisor / Compliance Officer
- High-Risk Patient Monitoring Protocol â€” Corrective action documented and tracked to closure
- High-Risk Patient Monitoring Protocol â€” Annual review date set and added to calendar

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-047 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-019, CL-SD-020

---

## SOURCE: Builder\Forns\CL-FM-048.txt

FORM ID: CL-FM-048
TITLE: Inclement Weather Service Delay Documentation
TYPE: Form
DOMAIN: CL
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- CL-SD-024

PURPOSE:
Standardized form capturing the required data elements for Inclement Weather Service Delay Documentation, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (triggered). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Subject of Form (type=text, col=4)
- Related Reference / ID (type=text, col=2)
- Date of Event (type=date, col=2)
- Description / Narrative (type=textarea, col=4)
- Outcome / Decision (type=textarea, col=4)
- Follow-Up Required (Y/N) (type=select, col=2, options=[Yes | No])
- Follow-Up Owner (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-048 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-SD-024

---

## SOURCE: Builder\Forns\CL-FM-049.txt

FORM ID: CL-FM-049
TITLE: Patient Complaint / Grievance Documentation
TYPE: Form
DOMAIN: CL
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, audit_critical

LINKED POLICIES:
- CL-PR-001

PURPOSE:
Standardized form capturing the required data elements for Patient Complaint / Grievance Documentation, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (triggered). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Subject of Form (type=text, col=4)
- Related Reference / ID (type=text, col=2)
- Date of Event (type=date, col=2)
- Description / Narrative (type=textarea, col=4)
- Outcome / Decision (type=textarea, col=4)
- Follow-Up Required (Y/N) (type=select, col=2, options=[Yes | No])
- Follow-Up Owner (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-049 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-PR-001

---

## SOURCE: Builder\Forns\CL-FM-050.txt

FORM ID: CL-FM-050
TITLE: Documentation Source Evidence Matrix
TYPE: Matrix
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-OA-006
- CL-OA-008

PURPOSE:
Standardized matrix capturing the required data elements for Documentation Source Evidence Matrix, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per episode). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Matrix
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Documentation Source Evidence Matrix Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-050 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-OA-006, CL-OA-008

---

## SOURCE: Builder\Forns\CL-FM-051.txt

FORM ID: CL-FM-051
TITLE: Clinician Competency Validation â€” OASIS
TYPE: Checklist
DOMAIN: CL
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-OA-003
- CL-OA-018

PURPOSE:
Standardized checklist capturing the required data elements for Clinician Competency Validation â€” OASIS, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (annual). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Clinician Competency Validation â€” OASIS Checklist
layout: checklist

checklist_items:
- Clinician Competency Validation â€” OASIS â€” Regulatory requirement reviewed and understood
- Clinician Competency Validation â€” OASIS â€” Applicable policy section located and re-read
- Clinician Competency Validation â€” OASIS â€” Required documentation identified and accessible
- Clinician Competency Validation â€” OASIS â€” All data fields confirmed complete and accurate
- Clinician Competency Validation â€” OASIS â€” Signatures / attestations obtained from required parties
- Clinician Competency Validation â€” OASIS â€” Copy filed in the appropriate record per retention schedule
- Clinician Competency Validation â€” OASIS â€” Completion entered in tracking log / dashboard
- Clinician Competency Validation â€” OASIS â€” Any deficiencies escalated to supervisor / Compliance Officer
- Clinician Competency Validation â€” OASIS â€” Corrective action documented and tracked to closure
- Clinician Competency Validation â€” OASIS â€” Annual review date set and added to calendar

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-051 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-OA-003, CL-OA-018

---

## SOURCE: Builder\Forns\CL-FM-052.txt

FORM ID: CL-FM-052
TITLE: Restraint-Free Environment Attestation
TYPE: Attestation
DOMAIN: CL
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-PR-004

PURPOSE:
Standardized attestation capturing the required data elements for Restraint-Free Environment Attestation, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (annual). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
By signing below, I hereby certify and attest that:

acknowledgments:
- I have read, reviewed, and understood the requirements of this form.
- The information I have provided is accurate, complete, and truthful to the best of my knowledge.
- I understand my obligation to report any changes in the information provided within 7 calendar days.
- I understand that false statements may result in corrective action up to and including termination.
- I agree to comply with all applicable Care Indeed policies, procedures, and regulatory requirements.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-052 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-PR-004

---

## SOURCE: Builder\Forns\CL-FM-053.txt

FORM ID: CL-FM-053
TITLE: Multi-Disciplinary Care Conference Notes
TYPE: Template
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CL-CP-005

PURPOSE:
Standardized template capturing the required data elements for Multi-Disciplinary Care Conference Notes, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per episode). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Title / Subject (type=text, col=4)
- Date (type=date, col=2)
- Prepared By (type=text, col=2)
- Body / Narrative (type=textarea, col=4)
- Attachments / References (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-053 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CP-005

---

## SOURCE: Builder\Forns\CL-FM-054.txt

FORM ID: CL-FM-054
TITLE: Episode Management Milestone Tracker
TYPE: Tracking Tool
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CP-002
- FN-CM-004

PURPOSE:
Standardized tracking tool capturing the required data elements for Episode Management Milestone Tracker, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per episode). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Episode Management Milestone Tracker Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-054 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CP-002, FN-CM-004

---

## SOURCE: Builder\Forns\CL-FM-055.txt

FORM ID: CL-FM-055
TITLE: Prior Authorization Request Log
TYPE: Log
DOMAIN: CL
USAGE: Conditional
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- CL-CP-001
- FN-CM-004

PURPOSE:
Standardized log capturing the required data elements for Prior Authorization Request Log, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (ongoing). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Prior Authorization Request Log Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-055 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CP-001, FN-CM-004

---

## SOURCE: Builder\Forns\CL-FM-056.txt

FORM ID: CL-FM-056
TITLE: Standardized Assessment Tool Administration Checklist
TYPE: Checklist
DOMAIN: CL
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-OA-011
- CL-CA-001

PURPOSE:
Standardized checklist capturing the required data elements for Standardized Assessment Tool Administration Checklist, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (per episode). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Standardized Assessment Tool Administration Checklist Checklist
layout: checklist

checklist_items:
- Standardized Assessment Tool Administration Checklist â€” Regulatory requirement reviewed and understood
- Standardized Assessment Tool Administration Checklist â€” Applicable policy section located and re-read
- Standardized Assessment Tool Administration Checklist â€” Required documentation identified and accessible
- Standardized Assessment Tool Administration Checklist â€” All data fields confirmed complete and accurate
- Standardized Assessment Tool Administration Checklist â€” Signatures / attestations obtained from required parties
- Standardized Assessment Tool Administration Checklist â€” Copy filed in the appropriate record per retention schedule
- Standardized Assessment Tool Administration Checklist â€” Completion entered in tracking log / dashboard
- Standardized Assessment Tool Administration Checklist â€” Any deficiencies escalated to supervisor / Compliance Officer
- Standardized Assessment Tool Administration Checklist â€” Corrective action documented and tracked to closure
- Standardized Assessment Tool Administration Checklist â€” Annual review date set and added to calendar

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-056 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-OA-011, CL-CA-001

---

## SOURCE: Builder\Forns\CL-FM-057.txt

FORM ID: CL-FM-057
TITLE: Active POC Change Notification Log
TYPE: Log
DOMAIN: CL
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CL-CP-003
- CL-CP-004

PURPOSE:
Standardized log capturing the required data elements for Active POC Change Notification Log, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).

INSTRUCTIONS:
Completed by the responsible workforce member (ongoing). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- #
- Date
- Entry / Subject
- Active POC Change Notification Log Details
- Responsible Person
- Status
- Follow-Up Action
- Verified By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CL-FM-057 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CL-CP-003, CL-CP-004

---

## SOURCE: Builder\Forns\CO-FM-001.txt

FORM ID: CO-FM-001
TITLE: Annual Compliance Program Attestation
TYPE: Attestation
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CO-CP-001

PURPOSE:
Annual attestation by every workforce member that the Care Indeed Compliance Program has been reviewed and the individual agrees to comply with the Code of Conduct and all policies.

INSTRUCTIONS:
Required annually for every employee, contractor, and volunteer. Non-completion escalated to the Compliance Officer for follow-up and potential corrective action.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I hereby attest that:

acknowledgments:
- I have received, read, and reviewed the Care Indeed Compliance Program and Code of Conduct in its current version.
- I agree to comply with all federal and state laws, CMS Conditions of Participation, and agency policies applicable to my role.
- I know how to report compliance concerns without retaliation via my supervisor, the Compliance Officer, the Compliance Hotline, or anonymously.
- I have not been, and am not currently, excluded from participation in federal or state healthcare programs.
- I will promptly disclose any actual or potential conflict of interest.
- I will promptly report any known or suspected violations of law or policy.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Workforce Member â€” Printed Name (type=text, col=2)
- Workforce Member â€” Signature (type=signature, col=1)
- Workforce Member â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-001 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-CP-001

---

## SOURCE: Builder\Forns\CO-FM-002.txt

FORM ID: CO-FM-002
TITLE: Code of Conduct Acknowledgment Form
TYPE: Attestation
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, digital_candidate

LINKED POLICIES:
- CO-CP-004

PURPOSE:
Signed acknowledgment that the workforce member has received and agrees to comply with Care Indeed's Code of Business Conduct and Ethics.

INSTRUCTIONS:
Signed at hire and annually thereafter. Retained in personnel file.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I acknowledge that:

acknowledgments:
- I have received, read, and understood the Care Indeed Code of Business Conduct and Ethics.
- I will conduct agency business with honesty, integrity, and in the best interest of our patients.
- I will avoid conflicts of interest and report any that arise.
- I will not offer, accept, or solicit bribes, kickbacks, or improper inducements.
- I will protect Protected Health Information (PHI) and confidential business information.
- I will report any known or suspected violation of the Code without fear of retaliation.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Workforce Member â€” Printed Name (type=text, col=2)
- Workforce Member â€” Signature (type=signature, col=1)
- Workforce Member â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-002 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-CP-004

---

## SOURCE: Builder\Forns\CO-FM-003.txt

FORM ID: CO-FM-003
TITLE: Compliance Hotline Submission Form
TYPE: Form
DOMAIN: CO
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- CO-CP-006

PURPOSE:
Confidential submission form (available online, by mail, and via 24/7 hotline) for reporting compliance concerns, including anonymous submissions.

INSTRUCTIONS:
Reports reviewed by the Compliance Officer within one business day. Confidentiality protected to the extent permitted by law. Retaliation strictly prohibited.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Reporter Name (Optional â€” may remain anonymous) (type=text, col=2)
- Contact (Optional) (type=text, col=2)
- Role / Affiliation (Optional) (type=text, col=4)
- Date of Submission (type=date, required=true, col=2)
- Nature of Concern (type=select, required=true, col=2, options=[Fraud / Waste / Abuse | HIPAA / Privacy | Patient Safety | Documentation Accuracy | Conflict of Interest | Retaliation | Workplace Conduct | Other])
- People Involved (Name / Role) (type=textarea, col=4)
- Date(s) and Location(s) (type=textarea, col=4)
- Detailed Description (type=textarea, required=true, col=4)
- Witnesses / Evidence (type=textarea, col=4)
- Prior Reporting Attempts (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-003 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-CP-006

---

## SOURCE: Builder\Forns\CO-FM-004.txt

FORM ID: CO-FM-004
TITLE: Compliance Concern / Allegation Log
TYPE: Log
DOMAIN: CO
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-CP-006
- CO-CP-007

PURPOSE:
Master log of every compliance concern, allegation, or investigation opened, tracked through disposition and corrective action.

INSTRUCTIONS:
Updated within 1 business day of receipt. Reviewed at each Compliance Committee meeting. Privileged â€” restricted access.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Case ID
- Date Received
- Source
- Category
- Severity
- Assigned To
- Status
- Open Days
- Resolution
- Reported to Board
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-004 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-CP-006, CO-CP-007

---

## SOURCE: Builder\Forns\CO-FM-005.txt

FORM ID: CO-FM-005
TITLE: Internal Compliance Audit Work Program
TYPE: Template
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CO-RA-002

PURPOSE:
Internal compliance audit work program defining scope, procedures, sample size, testing criteria, and documentation requirements for each audit cycle.

INSTRUCTIONS:
Developed annually by the Compliance Officer; individual audit work programs adapted per subject area. Findings reported to the Compliance Committee.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Audit Title / Subject Area (type=text, required=true, col=4)
- Audit Period (type=text, col=2)
- Audit Lead (type=text, col=2)
- Audit Objectives (type=textarea, col=4)
- Scope / Sample (type=textarea, col=4)
- Procedures to Perform (type=textarea, col=4)
- Testing Criteria / Threshold (type=textarea, col=4)
- Reporting Deliverable (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Audit Lead â€” Printed Name (type=text, col=2)
- Audit Lead â€” Signature (type=signature, col=1)
- Audit Lead â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-005 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-RA-002

---

## SOURCE: Builder\Forns\CO-FM-006.txt

FORM ID: CO-FM-006
TITLE: Survey / Inspection Readiness Self-Assessment
TYPE: Checklist
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-RA-003

PURPOSE:
Mock-survey self-assessment tool to verify survey readiness across all Conditions of Participation, operated annually and prior to any announced survey.

INSTRUCTIONS:
Executed by the Compliance Officer with leadership team. Identified deficiencies drive an immediate corrective action plan (CO-FM-008).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Survey / Inspection Readiness Self-Assessment Checklist
layout: checklist

checklist_items:
- CoP Governance â€” 42 CFR Â§ 484.105 â€” records current
- CoP Patient Rights â€” 42 CFR Â§ 484.50 â€” all acknowledgments on file
- CoP QAPI â€” 42 CFR Â§ 484.65 â€” committee and minutes current
- CoP Personnel Qualifications â€” 42 CFR Â§ 484.115 â€” licenses, PSV current
- CoP Clinical Records â€” 42 CFR Â§ 484.110 â€” sample chart review passed
- CoP Home Health Aide â€” 42 CFR Â§ 484.80 â€” supervision and competencies
- CoP Skilled Services â€” 42 CFR Â§ 484.75 â€” POC / assessments current
- CoP Emergency Prep â€” 42 CFR Â§ 484.102 â€” plan, drills, training current
- CoP Infection Control â€” 42 CFR Â§ 484.70 â€” surveillance current
- OASIS transmission timeliness verified
- Face-to-face encounter documentation complete for active patients
- Workforce OIG / SAM screens current
- HIPAA Workforce training current
- Plan of Care signatures current
- Physician orders signed within required window

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)
- Clinical Manager â€” Printed Name (type=text, col=2)
- Clinical Manager â€” Signature (type=signature, col=1)
- Clinical Manager â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-006 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-RA-003

---

## SOURCE: Builder\Forns\CO-FM-007.txt

FORM ID: CO-FM-007
TITLE: Survey / Inspection Findings Tracking Log
TYPE: Log
DOMAIN: CO
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- CO-RA-003
- CO-RA-007

PURPOSE:
Tracking log of every external survey or inspection finding (CMS, CDPH, OIG, accreditation, DOL, OSHA) with corrective actions and closure status.

INSTRUCTIONS:
Updated as findings are received, mitigated, and closed. Reviewed at each Compliance Committee meeting.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Survey Date
- Survey Type
- Finding #
- CFR / Standard
- Finding Summary
- Severity
- Owner
- Corrective Action
- Target Close
- Closed Date
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-007 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-RA-003, CO-RA-007

---

## SOURCE: Builder\Forns\CO-FM-008.txt

FORM ID: CO-FM-008
TITLE: Plan of Correction (PoC) Template
TYPE: Template
DOMAIN: CO
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CO-RA-007

PURPOSE:
Standardized Plan of Correction template used to respond to any regulatory finding, with root cause, corrective actions, responsible parties, and ongoing monitoring.

INSTRUCTIONS:
Completed and submitted within required timeframe (typically 10 business days of CMS Form 2567 receipt). Monitoring continues for at least one review cycle.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Survey Agency (type=text, required=true, col=2)
- Survey Date (type=date, required=true, col=2)
- Finding / Citation (type=textarea, required=true, col=4)
- CFR / Standard (type=text, col=2)
- Severity / Scope (type=text, col=2)
- Root Cause Analysis (type=textarea, required=true, col=4)
- Corrective Actions (type=textarea, required=true, col=4)
- Responsible Parties (type=textarea, col=4)
- Completion Date (type=date, col=2)
- Monitoring Method / Frequency (type=textarea, col=4)
- Evidence of Sustained Compliance (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-008 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-RA-007

---

## SOURCE: Builder\Forns\CO-FM-009.txt

FORM ID: CO-FM-009
TITLE: Regulatory Change Impact Assessment
TYPE: Worksheet
DOMAIN: CO
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-RA-001

PURPOSE:
Assessment of the operational and compliance impact of a new federal, state, CMS, or accrediting body regulation, driving any needed policy or process changes.

INSTRUCTIONS:
Completed within 30 days of regulatory change. Action items tracked to completion.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Regulation / Change Name (type=text, required=true, col=4)
- Effective Date (type=date, required=true, col=2)
- Issuing Authority (type=text, col=2)
- Summary of Change (type=textarea, required=true, col=4)
- Policies / Procedures Impacted (type=textarea, col=4)
- Operational Impact (type=textarea, col=4)
- Training / Communication Needed (type=textarea, col=4)
- System / Technology Changes (type=textarea, col=4)
- Financial Impact Estimate (type=text, col=2)
- Action Plan (Owner / Due Date) (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-009 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-RA-001

---

## SOURCE: Builder\Forns\CO-FM-010.txt

FORM ID: CO-FM-010
TITLE: Anti-Kickback Attestation Form
TYPE: Attestation
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-FA-001

PURPOSE:
Annual attestation by workforce members in positions of authority that they have not offered, received, or participated in any prohibited remuneration arrangements prohibited by the Anti-Kickback Statute (42 USC Â§ 1320a-7b).

INSTRUCTIONS:
Required of all executives, managers, clinical leaders, marketers, and financial personnel annually.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I certify that during the past 12 months I have not:

acknowledgments:
- Offered, paid, solicited, or received any remuneration in exchange for patient referrals or services reimbursable by a federal health care program.
- Participated in any financial arrangement with a physician, vendor, or referral source that was not reviewed and approved in writing by Compliance and Legal.
- Accepted any gift, hospitality, meal, or entertainment valued > $50 from any vendor, contractor, or referral source.
- Used my position at Care Indeed to obtain personal benefit from any outside party.
- Been convicted of, pleaded guilty/no contest to, or entered into a settlement of a health care offense.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Attesting Individual â€” Printed Name (type=text, col=2)
- Attesting Individual â€” Signature (type=signature, col=1)
- Attesting Individual â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-010 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-FA-001

---

## SOURCE: Builder\Forns\CO-FM-011.txt

FORM ID: CO-FM-011
TITLE: Physician Relationship / Referral Disclosure
TYPE: Attestation
DOMAIN: CO
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- CO-FA-001
- CO-CP-004

PURPOSE:
Disclosure of any physician, prescriber, or referral-source relationship (ownership, compensation, professional, personal) that could implicate Stark Law or the Anti-Kickback Statute.

INSTRUCTIONS:
Completed by any workforce member with marketing, intake, contracting, or financial responsibilities at hire, annually, and within 7 days of any new arrangement.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
By signing below, I hereby certify and attest that:

acknowledgments:
- I have read, reviewed, and understood the requirements of this form.
- The information I have provided is accurate, complete, and truthful to the best of my knowledge.
- I understand my obligation to report any changes in the information provided within 7 calendar days.
- I understand that false statements may result in corrective action up to and including termination.
- I agree to comply with all applicable Care Indeed policies, procedures, and regulatory requirements.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Workforce Member â€” Printed Name (type=text, col=2)
- Workforce Member â€” Signature (type=signature, col=1)
- Workforce Member â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-011 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-FA-001, CO-CP-004

---

## SOURCE: Builder\Forns\CO-FM-012.txt

FORM ID: CO-FM-012
TITLE: FWA Training Completion Log
TYPE: Log
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, shared_enterprise

LINKED POLICIES:
- CO-FW-101

PURPOSE:
Training completion log for the annual Fraud, Waste, and Abuse (FWA) and General Compliance training required by the Affordable Care Act / CMS regulations.

INSTRUCTIONS:
Required within 90 days of hire and annually. Records retained for 10 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Employee Name
- Role
- Training Module
- Date Completed
- Score %
- CEU / Hours
- Next Due
- Status
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-012 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-FW-101

---

## SOURCE: Builder\Forns\CO-FM-013.txt

FORM ID: CO-FM-013
TITLE: HIPAA Workforce Training Log
TYPE: Log
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, shared_enterprise

LINKED POLICIES:
- CO-HP-001
- CO-HP-002

PURPOSE:
HIPAA Privacy and Security workforce training completion log per 45 CFR Â§ 164.530(b)(1).

INSTRUCTIONS:
Initial training within 30 days of hire; annual refresh; and within 60 days of any material policy change.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Employee Name
- Role
- Training Module
- Delivery Method
- Date
- Score
- Pass / Fail
- Next Due
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-013 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-HP-001, CO-HP-002

---

## SOURCE: Builder\Forns\CO-FM-014.txt

FORM ID: CO-FM-014
TITLE: Breach Risk Assessment Worksheet
TYPE: Worksheet
DOMAIN: CO
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- CO-HP-003
- CO-IR-101

PURPOSE:
Four-factor breach risk assessment per 45 CFR Â§ 164.402 to determine whether an impermissible use/disclosure of PHI constitutes a reportable breach.

INSTRUCTIONS:
Completed by the Privacy Officer within 5 business days of incident discovery. All four factors must be addressed.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Incident ID / Date (type=text, required=true, col=2)
- Assessor / Privacy Officer (type=text, required=true, col=2)
- Factor 1 â€” Nature and Extent of PHI Involved (type=textarea, required=true, col=4)
- Factor 2 â€” Unauthorized Person Who Used or Received the PHI (type=textarea, required=true, col=4)
- Factor 3 â€” Whether PHI Was Actually Acquired or Viewed (type=textarea, required=true, col=4)
- Factor 4 â€” Extent to Which Risk Has Been Mitigated (type=textarea, required=true, col=4)
- Conclusion â€” Reportable Breach? (Y/N) (type=select, required=true, col=2, options=[Yes â€” Reportable | No â€” Low probability of compromise])
- Basis for Determination (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Privacy Officer â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-014 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-HP-003, CO-IR-101

---

## SOURCE: Builder\Forns\CO-FM-015.txt

FORM ID: CO-FM-015
TITLE: HIPAA Breach Notification Letter Template
TYPE: Template
DOMAIN: CO
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, master_template

LINKED POLICIES:
- CO-HP-003
- CO-IR-101

PURPOSE:
Template breach-notification letter meeting the content requirements of 45 CFR Â§ 164.404 for patient notification of a reportable breach.

INSTRUCTIONS:
Issued within 60 calendar days of breach discovery. Sent by first-class mail (or email with patient authorization).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Patient Name / Address (type=textarea, required=true, col=4)
- Date of Breach Discovery (type=date, required=true, col=2)
- Date(s) of the Breach (type=text, col=2)
- Description of PHI Involved (type=textarea, required=true, col=4)
- Description of What Happened (type=textarea, required=true, col=4)
- Steps Patient Should Take to Protect Self (type=textarea, col=4)
- What the Agency is Doing (type=textarea, col=4)
- Contact Information for Further Info (type=text, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Privacy Officer â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-015 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-HP-003, CO-IR-101

---

## SOURCE: Builder\Forns\CO-FM-016.txt

FORM ID: CO-FM-016
TITLE: Business Associate Agreement Template
TYPE: Template
DOMAIN: CO
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CO-HP-005
- CO-BA-101

PURPOSE:
Template Business Associate Agreement satisfying 45 CFR Â§ 164.504(e) required provisions for any vendor / BA with access to PHI.

INSTRUCTIONS:
Executed before any PHI is shared. Retained in the BAA Register (CO-FM-017).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Business Associate Legal Name (type=text, required=true, col=4)
- Services / Functions Involving PHI (type=textarea, required=true, col=4)
- Effective Date (type=date, required=true, col=2)
- Termination / Renewal Terms (type=text, col=2)
- Permitted Uses and Disclosures of PHI (type=textarea, col=4)
- Subcontractor Provisions (type=textarea, col=4)
- Breach Notification Timeframe (type=text, col=2)
- Indemnification Provisions (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Business Associate Executive â€” Printed Name (type=text, col=2)
- Business Associate Executive â€” Signature (type=signature, col=1)
- Business Associate Executive â€” Date (type=date, col=1)
- Care Indeed Administrator â€” Printed Name (type=text, col=2)
- Care Indeed Administrator â€” Signature (type=signature, col=1)
- Care Indeed Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-016 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-HP-005, CO-BA-101

---

## SOURCE: Builder\Forns\CO-FM-017.txt

FORM ID: CO-FM-017
TITLE: BAA Tracking Register
TYPE: Tracking Tool
DOMAIN: CO
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, shared_enterprise

LINKED POLICIES:
- CO-BA-101

PURPOSE:
Master register of every Business Associate Agreement in effect, tracking vendor, scope, dates, and renewal.

INSTRUCTIONS:
Updated within 5 business days of any execution, renewal, or termination.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- BA Legal Name
- Services Covered
- Effective Date
- Expiry Date
- Renewal Owner
- HIPAA Security Assessment Done
- Status
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-017 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-BA-101

---

## SOURCE: Builder\Forns\CO-FM-018.txt

FORM ID: CO-FM-018
TITLE: Patient Authorization to Release PHI
TYPE: Form
DOMAIN: CO
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- CO-HP-006

PURPOSE:
HIPAA-compliant patient authorization for release of PHI to a third party beyond treatment / payment / operations use cases.

INSTRUCTIONS:
Required for disclosures not otherwise permitted by HIPAA. Valid for the period specified or until revoked in writing.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Patient Name / DOB / MRN (type=text, required=true, col=4)
- Recipient of Information (type=text, required=true, col=4)
- Specific PHI to be Released (type=textarea, required=true, col=4)
- Purpose of Disclosure (type=textarea, required=true, col=4)
- Expiration Date / Event (type=text, required=true, col=2)
- Right to Revoke Acknowledged (Y/N) (type=select, required=true, col=2, options=[Yes | No])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Patient / Representative â€” Printed Name (type=text, col=2)
- Patient / Representative â€” Signature (type=signature, col=1)
- Patient / Representative â€” Date (type=date, col=1)
- Witness â€” Printed Name (type=text, col=2)
- Witness â€” Signature (type=signature, col=1)
- Witness â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-018 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-HP-006

---

## SOURCE: Builder\Forns\CO-FM-019.txt

FORM ID: CO-FM-019
TITLE: Notice of Privacy Practices (NPP) Delivery Log
TYPE: Log
DOMAIN: CO
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-HP-001

PURPOSE:
Log documenting delivery of the Notice of Privacy Practices (NPP) to each patient per 45 CFR Â§ 164.520.

INSTRUCTIONS:
Delivered at SOC. Acknowledgment obtained when possible; if refused, documented in the log with good-faith-effort notation.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Patient MRN
- Patient Name
- SOC Date
- NPP Version
- NPP Delivered Date
- Acknowledgment Signed? (Y/N/Refused)
- Clinician
- Good-Faith Effort Note
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-019 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-HP-001

---

## SOURCE: Builder\Forns\CO-FM-020.txt

FORM ID: CO-FM-020
TITLE: Records Retention & Destruction Schedule
TYPE: Tracking Tool
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, shared_enterprise

LINKED POLICIES:
- CO-HP-007

PURPOSE:
Records retention and destruction schedule specifying required retention periods for every category of agency record per HIPAA, CMS, OSHA, DOL, and California law.

INSTRUCTIONS:
Followed by all Records Custodians. Destruction certified on form CO-FM-038. Retention schedule reviewed annually.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Record Category
- Retention Period
- Regulatory Basis
- Storage Location
- Custodian
- Destruction Method
- Review Date
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-020 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-HP-007

---

## SOURCE: Builder\Forns\CO-FM-021.txt

FORM ID: CO-FM-021
TITLE: Documentation Alignment Audit Tool
TYPE: Checklist
DOMAIN: CO
USAGE: Required
FREQUENCY: Quarterly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-DC-004

PURPOSE:
Tool for auditing the alignment of clinical documentation (assessments, POC, orders, notes) against billing and OASIS assertions.

INSTRUCTIONS:
Performed quarterly on a random sample (minimum 10 episodes). Discrepancies corrected and tracked to closure.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Documentation Alignment Audit Tool Checklist
layout: checklist

checklist_items:
- OASIS responses supported by assessment narrative
- Plan of Care consistent with OASIS and orders
- Physician orders signed within required timeframe
- Visit notes match ordered frequency
- Skilled services justified in every note
- Homebound status documented at each certification
- F2F encounter present and timely
- Medication reconciliation complete
- ICD-10 coding supported by documentation
- Supplies / DME orders match POC
- Patient rights and informed consent signed
- OASIS transmission within 30 days
- Billing claim matches services rendered
- No evidence of upcoding or unsupported services

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Auditor â€” Printed Name (type=text, col=2)
- Auditor â€” Signature (type=signature, col=1)
- Auditor â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-021 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-DC-004

---

## SOURCE: Builder\Forns\CO-FM-022.txt

FORM ID: CO-FM-022
TITLE: Audit Trail Review Report
TYPE: Assessment
DOMAIN: CO
USAGE: Required
FREQUENCY: Quarterly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-DC-001

PURPOSE:
Quarterly EHR audit-trail review report evidencing ongoing monitoring of user access to PHI per 45 CFR Â§ 164.312(b).

INSTRUCTIONS:
Performed by Privacy Officer / IT Security. Anomalous access patterns investigated and documented.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Audit Period (type=text, required=true, col=2)
- Systems Reviewed (type=textarea, col=4)
- Total User Sessions (type=number, col=2)
- Patient Records Accessed (type=number, col=2)
- Unusual Access Patterns Identified (type=textarea, col=4)
- Investigations Opened (type=textarea, col=4)
- Findings / Root Cause (type=textarea, col=4)
- Corrective Actions (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Privacy Officer â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)
- IT Security Lead â€” Printed Name (type=text, col=2)
- IT Security Lead â€” Signature (type=signature, col=1)
- IT Security Lead â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-022 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-DC-001

---

## SOURCE: Builder\Forns\CO-FM-023.txt

FORM ID: CO-FM-023
TITLE: Documentation Deficiency Tracking Log
TYPE: Log
DOMAIN: CO
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-DC-002

PURPOSE:
Log of documentation deficiencies identified through internal audits, peer review, or pre-billing QA.

INSTRUCTIONS:
Updated as deficiencies are identified. Addressed within 10 business days. Repeat-offender patterns drive education (HR-FM-038).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date
- Patient MRN / Episode
- Clinician
- Deficiency Type
- Description
- Corrective Action
- Closed Date
- Repeat? (Y/N)
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-023 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-DC-002

---

## SOURCE: Builder\Forns\CO-FM-024.txt

FORM ID: CO-FM-024
TITLE: Compliance Committee Meeting Minutes
TYPE: Template
DOMAIN: CO
USAGE: Required
FREQUENCY: Quarterly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CO-CP-003

PURPOSE:
Quarterly Compliance Committee meeting minutes template capturing attendees, KPI review, findings, decisions, and action items.

INSTRUCTIONS:
Prepared by Compliance Officer within 5 business days of meeting. Archived permanently in Governance record.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Meeting Date (type=date, required=true, col=2)
- Chair (Compliance Officer) (type=text, col=2)
- Attendees (type=textarea, col=4)
- KPI Dashboard Review (type=textarea, col=4)
- Audit Findings Discussed (type=textarea, col=4)
- Survey / Regulatory Activity (type=textarea, col=4)
- HIPAA / Privacy Matters (type=textarea, col=4)
- Fraud / Waste / Abuse Cases (type=textarea, col=4)
- Action Items (Owner / Due) (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Recorder â€” Printed Name (type=text, col=2)
- Recorder â€” Signature (type=signature, col=1)
- Recorder â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-024 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-CP-003

---

## SOURCE: Builder\Forns\CO-FM-025.txt

FORM ID: CO-FM-025
TITLE: Workforce Exclusion Screening Log
TYPE: Log
DOMAIN: CO
USAGE: Required
FREQUENCY: Monthly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- CO-CP-001
- HR-TA-003

PURPOSE:
Workforce exclusion screening log (monthly OIG LEIE / SAM.gov / state Medicaid) documenting screening of all workforce.

INSTRUCTIONS:
Performed monthly for every active workforce member. Any hit triggers immediate suspension and 60-day OIG self-disclosure.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Month / Year
- Employee ID
- Name
- Role
- OIG Result
- SAM Result
- State Result
- Screener
- Screenshot Ref
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-025 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-CP-001, HR-TA-003

---

## SOURCE: Builder\Forns\CO-FM-026.txt

FORM ID: CO-FM-026
TITLE: HIPAA Security Risk Analysis Template
TYPE: Template
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- CO-HP-002
- IT-SC-001

PURPOSE:
HIPAA Security Rule risk analysis template per 45 CFR Â§ 164.308(a)(1)(ii)(A), identifying vulnerabilities and threats to ePHI.

INSTRUCTIONS:
Performed annually and after any significant change in operations, workforce, or technology.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Analysis Period (type=text, required=true, col=2)
- Analyst (type=text, required=true, col=2)
- Systems / Applications Handling ePHI (inventory) (type=textarea, col=4)
- Identified Threats (type=textarea, col=4)
- Identified Vulnerabilities (type=textarea, col=4)
- Existing Safeguards (type=textarea, col=4)
- Likelihood / Impact Scoring (type=textarea, col=4)
- Risk Rating (Critical / High / Medium / Low) (type=textarea, col=4)
- Risk Management Plan (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)
- Privacy Officer â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-026 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-HP-002, IT-SC-001

---

## SOURCE: Builder\Forns\CO-FM-027.txt

FORM ID: CO-FM-027
TITLE: Vendor PHI Risk Assessment Worksheet
TYPE: Worksheet
DOMAIN: CO
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-BA-101

PURPOSE:
PHI risk assessment of each vendor/Business Associate with access to ePHI or physical PHI.

INSTRUCTIONS:
Performed at contract execution and annually. Results inform BAA terms and monitoring plan.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Situation / Scope (type=textarea, col=4)
- Data / Evidence Reviewed (type=textarea, col=4)
- Analysis (type=textarea, col=4)
- Findings (type=textarea, col=4)
- Recommendations (type=textarea, col=4)
- Next Steps / Owner / Due Date (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Privacy / Security Officer â€” Printed Name (type=text, col=2)
- Privacy / Security Officer â€” Signature (type=signature, col=1)
- Privacy / Security Officer â€” Date (type=date, col=1)
- Vendor Manager â€” Printed Name (type=text, col=2)
- Vendor Manager â€” Signature (type=signature, col=1)
- Vendor Manager â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-027 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-BA-101

---

## SOURCE: Builder\Forns\CO-FM-028.txt

FORM ID: CO-FM-028
TITLE: Incident Containment & Eradication Log
TYPE: Log
DOMAIN: CO
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: high_risk, audit_critical

LINKED POLICIES:
- CO-IR-101

PURPOSE:
Log documenting containment, eradication, and recovery actions taken for every information-security or privacy incident.

INSTRUCTIONS:
Begun at incident detection. Updated through resolution. Closed with lessons-learned entry.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Incident ID
- Detected
- Category
- Containment Action
- Eradication Action
- Recovery Action
- Owner
- Closed
- Lessons Learned
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-028 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-IR-101

---

## SOURCE: Builder\Forns\CO-FM-029.txt

FORM ID: CO-FM-029
TITLE: Minimum Necessary Exception Request
TYPE: Form
DOMAIN: CO
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- CO-DG-101

PURPOSE:
Request for an exception to the HIPAA minimum-necessary rule when a broader use/disclosure of PHI is required for a legitimate purpose.

INSTRUCTIONS:
Submitted to the Privacy Officer for written approval prior to use/disclosure.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Requester Name / Role (type=text, required=true, col=2)
- Date Requested (type=date, required=true, col=2)
- PHI Scope Requested (type=textarea, required=true, col=4)
- Purpose / Legitimate Need (type=textarea, required=true, col=4)
- Why Minimum Necessary is Insufficient (type=textarea, col=4)
- Duration of Use (type=text, col=2)
- Safeguards Applied (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Requester â€” Printed Name (type=text, col=2)
- Requester â€” Signature (type=signature, col=1)
- Requester â€” Date (type=date, col=1)
- Privacy Officer â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-029 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-DG-101

---

## SOURCE: Builder\Forns\CO-FM-030.txt

FORM ID: CO-FM-030
TITLE: OIG Self-Disclosure Protocol Checklist
TYPE: Checklist
DOMAIN: CO
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- CO-FW-101

PURPOSE:
OIG Self-Disclosure Protocol checklist for voluntary disclosure of potential fraud or violations to the Office of Inspector General.

INSTRUCTIONS:
Completed under Legal Counsel direction when OIG disclosure is recommended based on investigation findings.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” OIG Self-Disclosure Protocol Checklist Checklist
layout: checklist

checklist_items:
- Matter investigated and substantiated
- Legal counsel engaged and privileged analysis completed
- Internal remediation actions initiated
- Financial impact quantified (claim-level)
- Disclosure package drafted per OIG template
- Preliminary restitution calculation prepared
- Governing Body notified and approval obtained
- Disclosure submitted via SDP portal
- Settlement negotiation strategy defined
- Compliance program enhancements documented

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Legal Counsel â€” Printed Name (type=text, col=2)
- Legal Counsel â€” Signature (type=signature, col=1)
- Legal Counsel â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-030 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-FW-101

---

## SOURCE: Builder\Forns\CO-FM-031.txt

FORM ID: CO-FM-031
TITLE: AI Tool Use Request & Approval Form
TYPE: Form
DOMAIN: CO
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- CO-AI-101

PURPOSE:
Request and approval form for the use of any AI tool, model, or automation that processes agency data or influences patient care decisions.

INSTRUCTIONS:
Submitted by the workforce sponsor; reviewed by Privacy, Security, Legal, and Clinical leadership before activation.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- AI Tool / Vendor Name (type=text, required=true, col=4)
- Sponsor Name / Role (type=text, required=true, col=2)
- Intended Use Case (type=textarea, required=true, col=4)
- Data Types Processed (type=textarea, col=4)
- Contains PHI? (Y/N) (type=select, col=2, options=[Yes | No])
- Clinical Decision Influence? (Y/N) (type=select, col=2, options=[Yes | No])
- Vendor BAA Status (type=text, col=4)
- Bias / Fairness Considerations (type=textarea, col=4)
- Validation / Oversight Plan (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Sponsor â€” Printed Name (type=text, col=2)
- Sponsor â€” Signature (type=signature, col=1)
- Sponsor â€” Date (type=date, col=1)
- Privacy Officer â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)
- Clinical Manager â€” Printed Name (type=text, col=2)
- Clinical Manager â€” Signature (type=signature, col=1)
- Clinical Manager â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-031 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-AI-101

---

## SOURCE: Builder\Forns\CO-FM-032.txt

FORM ID: CO-FM-032
TITLE: Annual Internal Audit Calendar
TYPE: Template
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: shared_enterprise, master_template

LINKED POLICIES:
- CO-RA-002

PURPOSE:
Annual calendar of internal compliance audits spanning all domains, with schedule, auditor, and scope.

INSTRUCTIONS:
Maintained by Compliance Officer. Actuals tracked against plan; reported at each Compliance Committee meeting.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Title / Subject (type=text, col=4)
- Date (type=date, col=2)
- Prepared By (type=text, col=2)
- Body / Narrative (type=textarea, col=4)
- Attachments / References (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-032 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-RA-002

---

## SOURCE: Builder\Forns\CO-FM-033.txt

FORM ID: CO-FM-033
TITLE: Sanctions & Enforcement Response Tracker
TYPE: Tracking Tool
DOMAIN: CO
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- CO-RA-007

PURPOSE:
Tracking tool for regulatory sanctions, enforcement actions, civil monetary penalties, or subpoenas, with response status.

INSTRUCTIONS:
Updated within 24 hours of any notice. Legal counsel engaged per agency policy.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Date Received
- Agency
- Action Type
- Subject
- Response Deadline
- Responsible Team
- Status
- Closed Date
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-033 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-RA-007

---

## SOURCE: Builder\Forns\CO-FM-034.txt

FORM ID: CO-FM-034
TITLE: Medicare CoP Compliance Verification Checklist
TYPE: Checklist
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-RA-004

PURPOSE:
Medicare Conditions of Participation compliance verification checklist covering all CoPs applicable to home health.

INSTRUCTIONS:
Performed annually and prior to any CMS survey. Covers each CoP with evidentiary references.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Medicare CoP Compliance Verification Checklist Checklist
layout: checklist

checklist_items:
- 484.100 â€” Basis and Scope
- 484.102 â€” Emergency Preparedness
- 484.105 â€” Organization and Administration of Services
- 484.110 â€” Clinical Records
- 484.115 â€” Personnel Qualifications
- 484.40 â€” Release of Patient Identifiable OASIS Info
- 484.45 â€” Reporting OASIS Information
- 484.50 â€” Patient Rights
- 484.55 â€” Comprehensive Assessment of Patients
- 484.60 â€” Care Planning, Coordination, and Quality of Care
- 484.65 â€” Quality Assessment and Performance Improvement (QAPI)
- 484.70 â€” Infection Prevention and Control
- 484.75 â€” Skilled Professional Services
- 484.80 â€” Home Health Aide Services

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-034 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-RA-004

---

## SOURCE: Builder\Forns\CO-FM-035.txt

FORM ID: CO-FM-035
TITLE: State Licensure Renewal Tracking Log
TYPE: Log
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-RA-005

PURPOSE:
Log of state licensure renewals for the agency and all required personnel credentials.

INSTRUCTIONS:
Renewals initiated 120 days before expiration. Overdue items block credentialed practice.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- License Type
- Holder
- Number
- Issue Date
- Expiration
- Renewal Status
- Days Remaining
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-035 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-RA-005

---

## SOURCE: Builder\Forns\CO-FM-036.txt

FORM ID: CO-FM-036
TITLE: Accreditation Standards Gap Analysis Tool
TYPE: Worksheet
DOMAIN: CO
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-RA-006

PURPOSE:
Gap analysis against accreditation standards (CHAP/ACHC/Joint Commission) prior to survey.

INSTRUCTIONS:
Performed by accreditation lead annually. Gaps prioritized into corrective action plans.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Situation / Scope (type=textarea, col=4)
- Data / Evidence Reviewed (type=textarea, col=4)
- Analysis (type=textarea, col=4)
- Findings (type=textarea, col=4)
- Recommendations (type=textarea, col=4)
- Next Steps / Owner / Due Date (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-036 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-RA-006

---

## SOURCE: Builder\Forns\CO-FM-037.txt

FORM ID: CO-FM-037
TITLE: FWA Risk Stratification Matrix
TYPE: Matrix
DOMAIN: CO
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- CO-FW-101
- CO-FA-003

PURPOSE:
Risk-stratification matrix categorizing fraud, waste, and abuse vulnerabilities by likelihood and impact to drive audit prioritization.

INSTRUCTIONS:
Updated annually and at regulatory change events. Drives the annual audit calendar (CO-FM-032).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Matrix
layout: table

table_columns:
- FWA Risk Area
- Likelihood (1-5)
- Impact (1-5)
- Composite Score
- Current Controls
- Residual Risk
- Audit Priority
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-037 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-FW-101, CO-FA-003

---

## SOURCE: Builder\Forns\CO-FM-038.txt

FORM ID: CO-FM-038
TITLE: Documentation Correction & Amendment Audit Log
TYPE: Log
DOMAIN: CO
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-DC-003

PURPOSE:
Log of late-entry / documentation correction / amendment actions to ensure integrity and traceability of the clinical record.

INSTRUCTIONS:
Completed at each amendment. Reviewed by Compliance monthly for patterns; excessive amendments drive documentation education.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date of Entry
- Author
- Patient MRN
- Type (Late / Amend / Correction)
- Original Entry Date
- Reason
- Change Summary
- Reviewer
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-038 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-DC-003

---

## SOURCE: Builder\Forns\CO-FM-039.txt

FORM ID: CO-FM-039
TITLE: AI System Impact Assessment Template
TYPE: Template
DOMAIN: CO
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, master_template

LINKED POLICIES:
- CO-AI-101

PURPOSE:
Impact assessment for any new AI system deployed in agency operations, covering safety, fairness, privacy, and clinical implications.

INSTRUCTIONS:
Completed prior to go-live. Reviewed annually thereafter.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- AI System Name (type=text, required=true, col=4)
- Go-Live Target Date (type=date, col=2)
- Business Problem Addressed (type=textarea, col=4)
- Training Data Source / Provenance (type=textarea, col=4)
- Model Performance / Accuracy Metrics (type=textarea, col=4)
- Known Bias / Fairness Concerns (type=textarea, col=4)
- Clinical Validation / Human-in-the-Loop (type=textarea, col=4)
- Privacy / HIPAA Impact (type=textarea, col=4)
- Monitoring Plan (type=textarea, col=4)
- Escalation / Override Procedure (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Sponsor â€” Printed Name (type=text, col=2)
- Sponsor â€” Signature (type=signature, col=1)
- Sponsor â€” Date (type=date, col=1)
- Privacy Officer â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)
- Clinical Manager â€” Printed Name (type=text, col=2)
- Clinical Manager â€” Signature (type=signature, col=1)
- Clinical Manager â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form CO-FM-039 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: CO-AI-101

---

## SOURCE: Builder\Forns\EN-FM-001.txt

FORM ID: EN-FM-001
TITLE: Universal Policy Acknowledgment Form
TYPE: Attestation
DOMAIN: EN
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: master_template, shared_enterprise, digital_candidate

LINKED POLICIES:
- ALL (270 Policies)

PURPOSE:
Establishes a single enterprise-wide record that every workforce member has received, read, understood, and agreed to abide by an assigned policy, in satisfaction of 42 CFR Â§ 484.105 and the agency Compliance Program.

INSTRUCTIONS:
The assigned workforce member shall complete this form within 30 calendar days of policy issuance or revision. Submitted acknowledgments are retained in the personnel file for seven (7) years. A monthly exception report is generated for any workforce member with outstanding acknowledgments.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I, the undersigned, hereby certify that:

acknowledgments:
- I have received, read, and reviewed the policy identified below in its entirety.
- I understand the content, obligations, and expected behaviors described in the policy as they apply to my role.
- I have had the opportunity to ask questions and received satisfactory clarification on any items I did not understand.
- I agree to comply with this policy, related procedures, and all referenced regulations at all times during my engagement with Care Indeed Home Health Care, Inc.
- I understand that failure to comply may result in corrective or disciplinary action up to and including termination.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Workforce Member â€” Printed Name (type=text, col=2)
- Workforce Member â€” Signature (type=signature, col=1)
- Workforce Member â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-001 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: ALL (270 Policies)

---

## SOURCE: Builder\Forns\EN-FM-002.txt

FORM ID: EN-FM-002
TITLE: Master Policy Index / Taxonomy Register
TYPE: Tracking Tool
DOMAIN: EN
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: master_template, shared_enterprise

LINKED POLICIES:
- EN-TG-001

PURPOSE:
Canonical master index of every policy in the enterprise taxonomy, including policy ID, title, domain, subdomain, owner, version, effective/revision dates, status, and CoP/regulatory crosswalk.

INSTRUCTIONS:
Maintained by the Policy Administrator on an ongoing basis. Updated at every policy lifecycle event (create, revise, retire). Verified quarterly against the live Policy Library and Compliance Dashboard.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Policy ID
- Title
- Domain
- Subdomain
- Owner
- Version
- Effective Date
- Next Review
- Status
- Regulatory Ref
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-002 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-TG-001

---

## SOURCE: Builder\Forns\EN-FM-003.txt

FORM ID: EN-FM-003
TITLE: Policy Classification Tier Matrix
TYPE: Matrix
DOMAIN: EN
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: master_template

LINKED POLICIES:
- EN-TG-001

PURPOSE:
Three-tier classification matrix (Tier 1 Enterprise Critical / Tier 2 Operational Standard / Tier 3 Supporting) assigned to every policy to drive review cadence, approval routing, and acknowledgment frequency.

INSTRUCTIONS:
Completed during initial policy authoring and re-validated annually or upon any change in regulatory exposure, patient-safety impact, or financial risk of the subject policy.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Matrix
layout: table

table_columns:
- Policy ID
- Current Tier
- Proposed Tier
- Regulatory Driver
- Patient-Safety Driver
- Financial Driver
- Approver
- Decision Date
table_row_count: 12

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-003 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-TG-001

---

## SOURCE: Builder\Forns\EN-FM-004.txt

FORM ID: EN-FM-004
TITLE: Domain Owner Assignment Roster
TYPE: Tracking Tool
DOMAIN: EN
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- EN-TG-001

PURPOSE:
Documents the assigned Domain Owner (executive accountable) and Domain Steward (operational lead) for each of the ten enterprise domains; drives escalation paths and policy authoring ownership.

INSTRUCTIONS:
Reviewed by the Compliance Officer at each quarterly Compliance Committee meeting and updated within 5 business days of any personnel change.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Domain Code
- Domain Name
- Executive Owner (Name/Title)
- Operational Steward (Name/Title)
- Effective Date
- Backup Designee
- Last Verified
table_row_count: 10

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-004 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-TG-001

---

## SOURCE: Builder\Forns\EN-FM-005.txt

FORM ID: EN-FM-005
TITLE: Regulatory Crosswalk Template
TYPE: Template
DOMAIN: EN
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- EN-TG-002

PURPOSE:
Standardized crosswalk template mapping Care Indeed policies to federal (42 CFR Â§ 484, HIPAA, OIG), state (Title 22, California HSC), and accreditation standards (CHAP/ACHC).

INSTRUCTIONS:
Completed during initial authoring of every policy and re-verified annually or whenever a regulatory change alert is issued.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Title / Subject (type=text, col=4)
- Date (type=date, col=2)
- Prepared By (type=text, col=2)
- Body / Narrative (type=textarea, col=4)
- Attachments / References (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-005 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-TG-002

---

## SOURCE: Builder\Forns\EN-FM-006.txt

FORM ID: EN-FM-006
TITLE: Compliance Gap Analysis Worksheet
TYPE: Worksheet
DOMAIN: EN
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- EN-TG-002

PURPOSE:
Captures identified gaps between current Care Indeed policy/practice and federal or state regulatory requirements, with owner, corrective action, target date, and verification evidence.

INSTRUCTIONS:
Completed during annual Compliance Risk Assessment and at any regulatory change event. Open gaps are tracked to closure by the Compliance Officer and reported to the Governing Body.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Situation / Scope (type=textarea, col=4)
- Data / Evidence Reviewed (type=textarea, col=4)
- Analysis (type=textarea, col=4)
- Findings (type=textarea, col=4)
- Recommendations (type=textarea, col=4)
- Next Steps / Owner / Due Date (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-006 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-TG-002

---

## SOURCE: Builder\Forns\EN-FM-007.txt

FORM ID: EN-FM-007
TITLE: Policy Development & Revision Template
TYPE: Template
DOMAIN: EN
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: master_template

LINKED POLICIES:
- EN-LC-001

PURPOSE:
Standardized authoring template ensuring every new or revised policy follows the gold-standard ten-section structure (Purpose, Scope, Definitions, Policy Statements, Procedures, Roles, Documentation, Compliance, References, Appendices).

INSTRUCTIONS:
Used by any workforce member developing or revising a policy. Draft is routed via the Policy Approval Routing Form (EN-FM-008) for formal review and approval prior to publication.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Proposed Policy ID (type=text, required=true, col=2)
- Proposed Title (type=text, required=true, col=2)
- Policy Tier (1/2/3) (type=select, col=2, options=[Tier 1 â€” Enterprise Critical | Tier 2 â€” Operational Standard | Tier 3 â€” Supporting])
- Domain / Subdomain (type=text, col=2)
- Policy Owner (type=text, col=2)
- Target Effective Date (type=date, col=2)
- Purpose Statement (type=textarea, col=4)
- Scope (type=textarea, col=4)
- Regulatory References (type=textarea, col=4)
- Summary of Changes (if revision) (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Author â€” Printed Name (type=text, col=2)
- Author â€” Signature (type=signature, col=1)
- Author â€” Date (type=date, col=1)
- Domain Steward â€” Printed Name (type=text, col=2)
- Domain Steward â€” Signature (type=signature, col=1)
- Domain Steward â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-007 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-001

---

## SOURCE: Builder\Forns\EN-FM-008.txt

FORM ID: EN-FM-008
TITLE: Policy Approval Routing Form
TYPE: Form
DOMAIN: EN
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- EN-LC-001

PURPOSE:
Controls the formal review, approval, and publication of every policy draft through the mandatory approval chain (Author â†’ Domain Steward â†’ Compliance Officer â†’ Administrator â†’ Governing Body as required).

INSTRUCTIONS:
Initiated upon completion of EN-FM-007. Each approver shall document review date, decision (Approve / Approve with Revisions / Reject), and signature within 10 business days.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Subject of Form (type=text, col=4)
- Related Reference / ID (type=text, col=2)
- Date of Event (type=date, col=2)
- Description / Narrative (type=textarea, col=4)
- Outcome / Decision (type=textarea, col=4)
- Follow-Up Required (Y/N) (type=select, col=2, options=[Yes | No])
- Follow-Up Owner (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-008 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-001

---

## SOURCE: Builder\Forns\EN-FM-009.txt

FORM ID: EN-FM-009
TITLE: Version Control Change Log
TYPE: Log
DOMAIN: EN
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- EN-LC-001

PURPOSE:
Immutable version-control log for every published policy â€” records each version, effective date, approver, and summary of changes for permanent audit retention.

INSTRUCTIONS:
Automatically appended by the Policy Administrator at each approved revision. Entries are never deleted; superseded entries are marked as "Archived."

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Policy ID
- Version
- Revision Type (Major/Minor)
- Effective Date
- Summary of Changes
- Approved By
- Archive Reference
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-009 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-001

---

## SOURCE: Builder\Forns\EN-FM-010.txt

FORM ID: EN-FM-010
TITLE: Annual Policy Review Schedule
TYPE: Tracking Tool
DOMAIN: EN
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- EN-LC-001

PURPOSE:
Master schedule documenting the mandatory annual review cycle for every policy in the taxonomy, including lookahead triggers and escalation on overdue items.

INSTRUCTIONS:
Maintained by the Policy Administrator. Overdue reviews (>30 days past target date) are escalated to the Compliance Committee and reported on the Compliance Dashboard.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Policy ID
- Title
- Last Reviewed
- Review Cycle
- Next Review Due
- Owner
- Status
- Days Overdue
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-010 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-001

---

## SOURCE: Builder\Forns\EN-FM-011.txt

FORM ID: EN-FM-011
TITLE: Policy Exception / Waiver Request Form
TYPE: Form
DOMAIN: EN
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate, high_risk

LINKED POLICIES:
- EN-LC-002

PURPOSE:
Documents a request for a temporary, documented, time-limited exception or waiver from full compliance with a policy where business or clinical circumstances warrant.

INSTRUCTIONS:
Submitted by the requester to the Domain Owner and Compliance Officer. Exceptions may not exceed 180 calendar days without re-approval. All exceptions are logged on EN-FM-012.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Requester Name / Title (type=text, required=true, col=2)
- Policy ID Subject to Waiver (type=text, required=true, col=2)
- Specific Provision(s) Affected (type=textarea, col=4)
- Business / Clinical Justification (type=textarea, required=true, col=4)
- Compensating Controls (type=textarea, col=4)
- Requested Start Date (type=date, col=2)
- Requested End Date (type=date, col=2)
- Risk Level (High/Medium/Low) (type=select, col=2, options=[High | Medium | Low])
- Regulatory Impact Assessment (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Requester â€” Printed Name (type=text, col=2)
- Requester â€” Signature (type=signature, col=1)
- Requester â€” Date (type=date, col=1)
- Domain Owner â€” Printed Name (type=text, col=2)
- Domain Owner â€” Signature (type=signature, col=1)
- Domain Owner â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-011 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-002

---

## SOURCE: Builder\Forns\EN-FM-012.txt

FORM ID: EN-FM-012
TITLE: Exception & Waiver Tracking Log
TYPE: Log
DOMAIN: EN
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- EN-LC-002

PURPOSE:
Running log of every policy exception and waiver granted, active, expired, or rescinded, for audit traceability and trend analysis.

INSTRUCTIONS:
Updated within one business day of any approval, renewal, or rescission. Reviewed quarterly by the Compliance Committee for pattern analysis.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Waiver ID
- Policy ID
- Requester
- Justification Summary
- Start Date
- End Date
- Risk Level
- Status
- Reviewer
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-012 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-002

---

## SOURCE: Builder\Forns\EN-FM-013.txt

FORM ID: EN-FM-013
TITLE: Role-Based Policy Assignment Matrix
TYPE: Matrix
DOMAIN: EN
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- EN-LC-003

PURPOSE:
Cross-reference matrix identifying which policies apply to each workforce role (Governing Body, Admin, Clinical, HHA, HR, IT, Contractor, Volunteer) to drive role-based acknowledgment assignment.

INSTRUCTIONS:
Completed at policy issuance and re-validated at annual policy review. Policy Administrator generates per-role acknowledgment packets from this matrix.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Matrix
layout: table

table_columns:
- Policy ID
- Governing Body
- Admin/Leadership
- Clinical (RN/PT/OT/SLP/MSW)
- HHA
- HR
- IT
- Contractor
- Volunteer
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-013 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-003

---

## SOURCE: Builder\Forns\EN-FM-014.txt

FORM ID: EN-FM-014
TITLE: Policy Acknowledgment Tracking Log
TYPE: Log
DOMAIN: EN
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, shared_enterprise

LINKED POLICIES:
- EN-LC-003

PURPOSE:
Tracks which workforce members have completed the Universal Policy Acknowledgment (EN-FM-001) for each assigned policy, with date, outstanding list, and escalation triggers.

INSTRUCTIONS:
Updated in real time as acknowledgments are submitted. Individuals with outstanding acknowledgments beyond 30 days are reported to their supervisor and the Compliance Officer.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Workforce ID
- Employee Name
- Role
- Policy ID
- Policy Version
- Assigned Date
- Acknowledged Date
- Status
- Days Outstanding
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-014 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-003

---

## SOURCE: Builder\Forns\EN-FM-015.txt

FORM ID: EN-FM-015
TITLE: Policy Retirement Request Form
TYPE: Form
DOMAIN: EN
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- EN-LC-004

PURPOSE:
Requests the formal retirement, sunset, or consolidation of an obsolete or superseded policy.

INSTRUCTIONS:
Completed by the policy owner; routed through Domain Owner, Compliance Officer, and Administrator. Retired policies remain in the Archive for seven (7) years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Policy ID to Retire (type=text, required=true, col=2)
- Policy Title (type=text, required=true, col=2)
- Reason for Retirement (type=textarea, required=true, col=4)
- Replacement Policy (if any) (type=text, col=2)
- Effective Retirement Date (type=date, required=true, col=2)
- Communication Plan to Affected Workforce (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Policy Owner â€” Printed Name (type=text, col=2)
- Policy Owner â€” Signature (type=signature, col=1)
- Policy Owner â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-015 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-004

---

## SOURCE: Builder\Forns\EN-FM-016.txt

FORM ID: EN-FM-016
TITLE: Policy Obsolescence Impact Assessment
TYPE: Assessment
DOMAIN: EN
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- EN-LC-004

PURPOSE:
Evaluates the regulatory, operational, clinical, and workforce impact of retiring, consolidating, or replacing a policy.

INSTRUCTIONS:
Completed in parallel with EN-FM-015. Findings drive the final go/no-go retirement decision and inform mitigation planning.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Policy Being Retired (type=text, required=true, col=2)
- Assessor Name / Role (type=text, required=true, col=2)
- Regulatory Impact Summary (type=textarea, col=4)
- Clinical Impact Summary (type=textarea, col=4)
- Workforce Impact Summary (type=textarea, col=4)
- Financial Impact Summary (type=textarea, col=4)
- Recommended Go/No-Go Decision (type=select, col=4, options=[Proceed with Retirement | Defer â€” Mitigation Required | Do Not Retire])
- Required Mitigation Actions (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Assessor â€” Printed Name (type=text, col=2)
- Assessor â€” Signature (type=signature, col=1)
- Assessor â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-016 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-004

---

## SOURCE: Builder\Forns\EN-FM-017.txt

FORM ID: EN-FM-017
TITLE: Enterprise Compliance Dashboard Template
TYPE: Template
DOMAIN: EN
USAGE: Required
FREQUENCY: Monthly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: master_template, audit_critical

LINKED POLICIES:
- EN-CM-001

PURPOSE:
Canonical dashboard template consolidating enterprise compliance KPIs (policy coverage, acknowledgment %, audit findings, training completion, incident trend).

INSTRUCTIONS:
Generated monthly by the Compliance Officer and presented to the Administrator, QAPI Committee, and Governing Body.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Title / Subject (type=text, col=4)
- Date (type=date, col=2)
- Prepared By (type=text, col=2)
- Body / Narrative (type=textarea, col=4)
- Attachments / References (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-017 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-CM-001

---

## SOURCE: Builder\Forns\EN-FM-018.txt

FORM ID: EN-FM-018
TITLE: Departmental KPI Reporting Form
TYPE: Form
DOMAIN: EN
USAGE: Required
FREQUENCY: Quarterly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- EN-CM-001

PURPOSE:
Standardized reporting form used by each department to submit quarterly KPI data to the Compliance Officer for enterprise roll-up.

INSTRUCTIONS:
Due within 10 business days after quarter-end. Late submissions are reported on the Compliance Dashboard.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Department / Domain (type=text, required=true, col=2)
- Reporting Quarter (e.g., Q2 2026) (type=text, required=true, col=2)
- Submitted By (type=text, required=true, col=2)
- KPI 1 â€” Name / Value / Target (type=textarea, col=4)
- KPI 2 â€” Name / Value / Target (type=textarea, col=4)
- KPI 3 â€” Name / Value / Target (type=textarea, col=4)
- Narrative / Highlights / Risks (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Department Lead â€” Printed Name (type=text, col=2)
- Department Lead â€” Signature (type=signature, col=1)
- Department Lead â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-018 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-CM-001

---

## SOURCE: Builder\Forns\EN-FM-019.txt

FORM ID: EN-FM-019
TITLE: Non-Compliance Remediation Plan
TYPE: Worksheet
DOMAIN: EN
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, audit_critical

LINKED POLICIES:
- EN-CM-001

PURPOSE:
Documents remediation actions and timelines for any identified non-compliance finding from internal audit, survey, or self-assessment.

INSTRUCTIONS:
Completed within 10 business days of finding. Open actions are tracked weekly until verified closure by the Compliance Officer.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Finding ID / Source (type=text, required=true, col=2)
- Date Identified (type=date, required=true, col=2)
- Finding Description (type=textarea, required=true, col=4)
- Root Cause (type=textarea, col=4)
- Corrective Action Plan (type=textarea, required=true, col=4)
- Responsible Owner (type=text, col=2)
- Target Closure Date (type=date, col=2)
- Verification Evidence (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Owner â€” Printed Name (type=text, col=2)
- Owner â€” Signature (type=signature, col=1)
- Owner â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-019 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-CM-001

---

## SOURCE: Builder\Forns\EN-FM-020.txt

FORM ID: EN-FM-020
TITLE: Policy Conflict Resolution Request Form
TYPE: Form
DOMAIN: EN
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- EN-CM-002

PURPOSE:
Submitted when two or more policies appear to conflict with each other in obligation, timing, or scope; used to request formal resolution.

INSTRUCTIONS:
Filed by any workforce member to the Compliance Officer. Resolution is tracked on EN-FM-023 and typically completed within 30 days.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Submitter Name / Role (type=text, required=true, col=2)
- Policy ID A (type=text, required=true, col=1)
- Policy ID B (type=text, required=true, col=1)
- Conflict Description (type=textarea, required=true, col=4)
- Operational Impact (type=textarea, col=4)
- Proposed Resolution (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Submitter â€” Printed Name (type=text, col=2)
- Submitter â€” Signature (type=signature, col=1)
- Submitter â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-020 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-CM-002

---

## SOURCE: Builder\Forns\EN-FM-021.txt

FORM ID: EN-FM-021
TITLE: Inter-Domain Coordination Meeting Minutes
TYPE: Template
DOMAIN: EN
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: master_template

LINKED POLICIES:
- EN-CM-002

PURPOSE:
Standardized template for Inter-Domain Coordination meeting minutes, documenting attendees, decisions, action items, and cross-domain commitments.

INSTRUCTIONS:
Used at every inter-domain coordination session. Minutes finalized within 5 business days and filed in the Governance record.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Meeting Date / Time (type=text, required=true, col=2)
- Location / Modality (type=text, col=2)
- Facilitator (type=text, col=2)
- Recorder (type=text, col=2)
- Attendees (Name / Domain) (type=textarea, col=4)
- Agenda Items Reviewed (type=textarea, col=4)
- Decisions Made (type=textarea, col=4)
- Action Items (Owner / Due Date) (type=textarea, col=4)
- Next Meeting Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Facilitator â€” Printed Name (type=text, col=2)
- Facilitator â€” Signature (type=signature, col=1)
- Facilitator â€” Date (type=date, col=1)
- Recorder â€” Printed Name (type=text, col=2)
- Recorder â€” Signature (type=signature, col=1)
- Recorder â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-021 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-CM-002

---

## SOURCE: Builder\Forns\EN-FM-022.txt

FORM ID: EN-FM-022
TITLE: Enterprise Policy Compliance Scorecard
TYPE: Tracking Tool
DOMAIN: EN
USAGE: Required
FREQUENCY: Quarterly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- EN-CM-001

PURPOSE:
Enterprise policy compliance scorecard aggregating each domain's adherence metrics into a single quarterly board-level view.

INSTRUCTIONS:
Prepared by the Compliance Officer at quarter-end for presentation to the QAPI Committee and Governing Body.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Domain
- # Policies
- % Current Review
- % Acknowledgment
- % Audit Findings Closed
- Composite Score
- Trend
table_row_count: 10

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-022 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-CM-001

---

## SOURCE: Builder\Forns\EN-FM-023.txt

FORM ID: EN-FM-023
TITLE: Cross-Domain Conflict Resolution Log
TYPE: Log
DOMAIN: EN
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- EN-CM-002

PURPOSE:
Tracks all submitted cross-domain policy conflicts from identification through resolution.

INSTRUCTIONS:
Updated by the Compliance Officer upon receipt of any EN-FM-020. Entries remain open until resolution is signed off and policy revisions (if any) are published.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Conflict ID
- Policy A
- Policy B
- Identified By
- Opened
- Resolution
- Closed Date
table_row_count: 10

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-023 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-CM-002

---

## SOURCE: Builder\Forns\EN-FM-024.txt

FORM ID: EN-FM-024
TITLE: Policy Exception & Waiver Request Form
TYPE: Form
DOMAIN: EN
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- EN-LC-002

PURPOSE:
Alternate exception/waiver form used when a policy-level exception also triggers a compensating regulatory disclosure.

INSTRUCTIONS:
Routed simultaneously to Compliance Officer and Legal Counsel. Maintained in the waiver register alongside EN-FM-011.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Waiver ID (auto) (type=text, col=2)
- Originating Policy (type=text, required=true, col=2)
- Nature of Exception (type=textarea, col=4)
- Regulatory Disclosure Needed? (Y/N) (type=select, col=2, options=[Yes | No])
- Disclosure Agency / Date (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Requester â€” Printed Name (type=text, col=2)
- Requester â€” Signature (type=signature, col=1)
- Requester â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Legal Counsel â€” Printed Name (type=text, col=2)
- Legal Counsel â€” Signature (type=signature, col=1)
- Legal Counsel â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-024 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-002

---

## SOURCE: Builder\Forns\EN-FM-025.txt

FORM ID: EN-FM-025
TITLE: Policy Retirement & Obsolescence Checklist
TYPE: Checklist
DOMAIN: EN
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- EN-LC-004

PURPOSE:
Checklist confirming that every retirement/obsolescence step was completed prior to final policy sunset (archival, communication, replacement mapping, training update).

INSTRUCTIONS:
Completed by the Policy Administrator concurrent with EN-FM-015 and signed off by the Compliance Officer.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Policy Retirement & Obsolescence Checklist Checklist
layout: checklist

checklist_items:
- Superseding or consolidating policy identified (if applicable)
- Impact assessment (EN-FM-016) completed and approved
- Final version of retiring policy archived with metadata
- Communication issued to all affected workforce
- Training module updated or retired
- Acknowledgment registry retired for the policy
- References to the retired policy audited and updated across all policies
- Retirement entry appended to EN-FM-009 Version Control Log
- Regulatory mapping / crosswalk updated
- Retirement date confirmed with Governing Body

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-025 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-004

---

## SOURCE: Builder\Forns\EN-FM-026.txt

FORM ID: EN-FM-026
TITLE: Role-Based Applicability Matrix
TYPE: Matrix
DOMAIN: EN
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- EN-LC-003

PURPOSE:
Matrix indicating applicability of each policy by role grouping for recruiting, onboarding, and role-change workflows.

INSTRUCTIONS:
Reviewed annually by HR, Compliance, and Domain Owners. Used to auto-provision onboarding policy packets.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Matrix
layout: table

table_columns:
- Policy ID
- Title
- Executive
- Admin
- RN/Clinician
- HHA
- Intake
- Billing
- IT
- HR
- Contractor
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-026 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-LC-003

---

## SOURCE: Builder\Forns\EN-FM-027.txt

FORM ID: EN-FM-027
TITLE: Annual Policy Acknowledgment Tracking Report
TYPE: Tracking Tool
DOMAIN: EN
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, shared_enterprise

LINKED POLICIES:
- EN-TG-001

PURPOSE:
Annual tracking report summarizing workforce policy acknowledgment completion rates by role and domain.

INSTRUCTIONS:
Generated by the Compliance Officer each January for the prior calendar year. Presented to the Governing Body.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Role Group
- # Policies Assigned
- # Acknowledged
- % Completion
- Outstanding > 30 Days
- Action Plan
table_row_count: 10

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-027 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-TG-001

---

## SOURCE: Builder\Forns\EN-FM-028.txt

FORM ID: EN-FM-028
TITLE: Regulatory Mapping Accuracy Audit Worksheet
TYPE: Worksheet
DOMAIN: EN
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- EN-TG-002

PURPOSE:
Audit worksheet evaluating the accuracy and completeness of policy-to-regulation mappings in the enterprise crosswalk.

INSTRUCTIONS:
Performed annually by the Compliance Officer or designee. Findings feed EN-FM-006 Gap Analysis.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Situation / Scope (type=textarea, col=4)
- Data / Evidence Reviewed (type=textarea, col=4)
- Analysis (type=textarea, col=4)
- Findings (type=textarea, col=4)
- Recommendations (type=textarea, col=4)
- Next Steps / Owner / Due Date (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-028 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-TG-002

---

## SOURCE: Builder\Forns\EN-FM-029.txt

FORM ID: EN-FM-029
TITLE: Enterprise Taxonomy Version Release Notes
TYPE: Template
DOMAIN: EN
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: master_template

LINKED POLICIES:
- EN-TG-001

PURPOSE:
Release-notes template documenting each published version of the enterprise policy taxonomy.

INSTRUCTIONS:
Issued with every taxonomy version release. Distributed to all Domain Owners and published in the Policy Library.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Taxonomy Version (type=text, required=true, col=2)
- Release Date (type=date, required=true, col=2)
- Summary of Changes (type=textarea, col=4)
- New Policies Added (type=textarea, col=4)
- Policies Revised (type=textarea, col=4)
- Policies Retired (type=textarea, col=4)
- Impact to Workforce (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Policy Administrator â€” Printed Name (type=text, col=2)
- Policy Administrator â€” Signature (type=signature, col=1)
- Policy Administrator â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-029 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: EN-TG-001

---

## SOURCE: Builder\Forns\EN-FM-030.txt

FORM ID: EN-FM-030
TITLE: Legal Hold Notice
TYPE: Notice
DOMAIN: EN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, legal_privilege

LINKED POLICIES:
- EN-LC-001
- CO-CP-001
- RM-RM-003

PURPOSE:
Formal written notice to custodians of documents, records, and ESI (electronically stored information) to preserve and suspend destruction of any material that may be relevant to anticipated or pending litigation, government investigation, subpoena, or regulatory action. Required for FRCP Rule 37(e) spoliation-safe harbor.

INSTRUCTIONS:
Legal Counsel (or Compliance Officer in absence) issues to all custodians within 24 hours of becoming aware of a reasonably anticipated legal matter. Acknowledgment required from each custodian within 5 business days. Retained for the duration of the hold plus 7 years after release.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Issuing Attorney / Compliance Officer (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Date Issued (type=date, required=true, col=2)
- Legal Hold ID (type=text, required=true, col=2)

SECTION 2: Section 2 â€” Matter & Scope
layout: grid

fields:
- Matter / Case Caption (type=text, required=true, col=4)
- Nature of Matter (Litigation / Investigation / Subpoena / Audit / Other) (type=select, col=2, options=[Litigation | Government Investigation | Subpoena | Regulatory Audit | Internal Investigation | Other])
- Date Matter Became Reasonably Anticipated (type=date, col=2)
- Custodian(s) (Names / Roles) (type=textarea, col=4)
- Categories of Documents / ESI to Preserve (type=textarea, col=4)
- Relevant Date Range (type=text, col=2)
- Systems / Repositories Implicated (EHR, email, cloud, paper) (type=textarea, col=4)
- Routine Destruction Suspension Effective Date (type=date, col=2)

SECTION 3: Section 3 â€” Custodian Acknowledgment
layout: signature

fields:
- Custodian â€” Printed Name (type=text, col=2)
- Custodian â€” Signature (type=signature, col=1)
- Custodian â€” Date Acknowledged (type=date, col=1)
- Custodian Statement (I acknowledge receipt of this Legal Hold, understand my preservation duties, and will not destroy, modify, or delete any covered material) (type=textarea, col=4)

SECTION 4: Section 4 â€” Issuer Signature
layout: signature

fields:
- Issuer â€” Printed Name (type=text, col=2)
- Issuer â€” Signature (type=signature, col=1)
- Issuer â€” Date (type=date, col=1)
- Release Date (when hold lifted) (type=date, col=2)
- Release Approver â€” Printed Name (type=text, col=2)
- Release Approver â€” Signature (type=signature, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-030 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: EN-LC-001, CO-CP-001, RM-RM-003
- ATTORNEY-CLIENT PRIVILEGED / WORK PRODUCT â€” handle accordingly

---

## SOURCE: Builder\Forns\EN-FM-031.txt

FORM ID: EN-FM-031
TITLE: Records Destruction Authorization
TYPE: Authorization
DOMAIN: EN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- EN-CM-001
- CO-HP-001
- CO-HP-004

PURPOSE:
Formal authorization form executed before destruction of any record (physical or electronic) that has reached the end of its retention period. Confirms no active legal hold applies and documents method, date, witness, and certification of destruction. Supports HIPAA Â§ 164.530(j) and 42 CFR Â§ 484.110 records-retention compliance.

INSTRUCTIONS:
Requestor (Records Custodian) completes Sections 1â€“2 and routes to Compliance Officer and Legal Counsel for clearance (Section 3). Destruction is performed under witness and certified in Section 4. Destroyed per approved method (NIST 800-88 for media; HIPAA-compliant shredding for paper). Retain authorization 10 years post-destruction.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Requestor (Records Custodian) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Requested (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Records Description
layout: grid

fields:
- Record Type / Category (type=text, required=true, col=2)
- Record Series / Form IDs (if applicable) (type=textarea, col=4)
- Date Range Covered (type=text, col=2)
- Volume (boxes / GB / record count) (type=text, col=2)
- Format (Paper / Electronic / Mixed / Portable Media) (type=select, col=2, options=[Paper | Electronic | Mixed | Portable Media])
- Retention Schedule Reference (CO-FM-020) (type=text, required=true, col=2)
- Retention Period Satisfied? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Contains PHI? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Storage Location (type=text, col=4)

SECTION 3: Section 3 â€” Legal & Compliance Clearance
layout: grid

fields:
- Active Legal Hold Check Completed? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Legal Hold Register Reviewed By (type=text, col=2)
- Date Checked (type=date, col=2)
- Compliance Officer Clearance (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Legal Counsel Clearance (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Clearance Notes (type=textarea, col=4)

SECTION 4: Section 4 â€” Destruction Method & Certification
layout: grid

fields:
- Destruction Method (Cross-cut shred / NIST 800-88 Purge / Physical destruction / Certified vendor) (type=select, required=true, col=2, options=[Cross-cut shred | NIST 800-88 Clear | NIST 800-88 Purge | NIST 800-88 Destroy | Certified vendor | Other])
- Vendor Name (if applicable) (type=text, col=2)
- Certificate of Destruction # (type=text, col=2)
- Destruction Date (type=date, required=true, col=2)
- Witness Name (type=text, col=2)
- Location of Destruction (type=text, col=2)
- Notes / Exceptions (type=textarea, col=4)

SECTION 5: Section â€” Signatures & Attestation
layout: signature

fields:
- Requestor â€” Printed Name (type=text, col=2)
- Requestor â€” Signature (type=signature, col=1)
- Requestor â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Legal Counsel â€” Printed Name (type=text, col=2)
- Legal Counsel â€” Signature (type=signature, col=1)
- Legal Counsel â€” Date (type=date, col=1)
- Witness â€” Printed Name (type=text, col=2)
- Witness â€” Signature (type=signature, col=1)
- Witness â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-031 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: EN-CM-001, CO-HP-001, CO-HP-004

---

## SOURCE: Builder\Forns\EN-FM-032.txt

FORM ID: EN-FM-032
TITLE: Enterprise Mandatory Events Calendar
TYPE: Calendar
DOMAIN: EN
USAGE: Required
FREQUENCY: Annual
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- EN-CM-001
- CO-CP-001

PURPOSE:
Master annual calendar consolidating every mandatory event across all domains (surveys, audits, training, drills, attestations, policy review, reports to Governing Body, regulatory submissions). Feeds EN-FM-033 Completion Report.

INSTRUCTIONS:
Compliance Officer builds for the upcoming calendar year during Q4 of the prior year, approved by Administrator. Updated quarterly and reviewed at Compliance Committee.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Date Completed (type=date, required=true, col=2)
- Calendar Year (type=text, required=true, col=2)

SECTION 2: Section 2 â€” Calendar Entries
layout: grid

fields:
- Event ID (type=text, required=true, col=2)
- Event Name (type=text, required=true, col=2)
- Domain (GV/CO/QA/RM/CL/OP/FN/HR/IT/EN) (type=select, col=2, options=[GV | CO | QA | RM | CL | OP | FN | HR | IT | EN])
- Regulatory Driver (CFR / Statute / CoP) (type=text, col=2)
- Owner / Accountable Role (type=text, col=2)
- Frequency (Annual / Quarterly / Monthly / Weekly / On-event) (type=select, col=2, options=[Annual | Semi-Annual | Quarterly | Monthly | Weekly | On-event])
- Scheduled Date / Window (type=text, col=2)
- Linked Form / Output (type=text, col=2)
- Completion Status (Planned / In Progress / Complete / Missed) (type=select, col=2, options=[Planned | In Progress | Complete | Missed])
- Evidence Location (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-032 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: EN-CM-001, CO-CP-001

---

## SOURCE: Builder\Forns\EN-FM-033.txt

FORM ID: EN-FM-033
TITLE: Mandatory Events Completion Report
TYPE: Report
DOMAIN: EN
USAGE: Required
FREQUENCY: Monthly
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- EN-CM-001
- CO-CP-001

PURPOSE:
Monthly status report tracking completion of every mandatory event on EN-FM-032 Calendar. Flags missed/late events and drives escalation to leadership and Governing Body.

INSTRUCTIONS:
Compliance Officer issues monthly. Any "Missed" or "Late" event triggers CAP (QA-FM-005). Reviewed at monthly leadership and quarterly Compliance Committee (CO-FM-024).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Report Period (Month/Year) (type=text, required=true, col=2)
- Report Owner (Compliance Officer) (type=text, required=true, col=2)
- Report Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Status Summary
layout: grid

fields:
- Total Events Due (this period) (type=text, col=2)
- Completed On-Time (type=text, col=2)
- Completed Late (type=text, col=2)
- Missed (type=text, col=2)
- Completion % (on-time) (type=text, col=2)
- Trend vs Prior Period (type=text, col=2)

SECTION 3: Section 3 â€” Missed / Late Detail
layout: grid

fields:
- Event ID / Name (type=textarea, col=4)
- Owner (type=textarea, col=2)
- Reason for Missed / Late (type=textarea, col=4)
- CAP Reference (QA-FM-005) (type=textarea, col=2)
- New Target Date (type=textarea, col=2)
- Escalated To (type=textarea, col=2)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-033 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: EN-CM-001, CO-CP-001

---

## SOURCE: Builder\Forns\EN-FM-034.txt

FORM ID: EN-FM-034
TITLE: Enterprise KPI Dashboard
TYPE: Dashboard
DOMAIN: EN
USAGE: Required
FREQUENCY: Monthly
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- EN-CM-001
- GV-GB-001

PURPOSE:
Consolidated monthly enterprise KPI dashboard across all domains (clinical quality/HHVBP, compliance, finance, HR/workforce, IT/security, operations, QAPI). Primary input to quarterly Governing Body report and management review.

INSTRUCTIONS:
CFO + Compliance Officer co-consolidate monthly. Reviewed at leadership meeting (EN-FM-035). Reported quarterly to Governing Body (GV-FM-005 minutes + GV-FM-023 report).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Report Period (Month/Year) (type=text, required=true, col=2)
- CFO Attestation (type=text, col=2)
- Compliance Officer Attestation (type=text, col=2)
- Date Published (type=date, required=true, col=2)

SECTION 2: Section 2 â€” KPI Rollup
layout: grid

fields:
- Clinical / HHVBP Metrics (TNC-M, TNC-S, DC Community, ED use, 30-day readmit) (type=textarea, col=4)
- Quality / QAPI Metrics (OASIS accuracy, HHCAHPS, ACHs, infection, falls) (type=textarea, col=4)
- Compliance Metrics (hotline intake, disclosures, survey findings, POC on-time) (type=textarea, col=4)
- Financial Metrics (DSO, denial %, cash, AR aging, budget variance) (type=textarea, col=4)
- HR / Workforce Metrics (turnover, vacancy, OIG/SAM, training comp %) (type=textarea, col=4)
- IT / Security Metrics (incidents, patch compliance, access review, BCP test) (type=textarea, col=4)
- Operations Metrics (scheduling fill rate, mileage, intake conversion) (type=textarea, col=4)
- Risk Metrics (enterprise risk score, top-5 risk deltas, insurance claims) (type=textarea, col=4)
- Overall Enterprise Risk Level (Low/Moderate/High/Critical) (type=select, col=2, options=[Low | Moderate | High | Critical])
- Items Requiring Governing Body Attention (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-034 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: EN-CM-001, GV-GB-001

---

## SOURCE: Builder\Forns\EN-FM-035.txt

FORM ID: EN-FM-035
TITLE: Quarterly Management Review Minutes
TYPE: Template
DOMAIN: EN
USAGE: Required
FREQUENCY: Quarterly
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- EN-CM-001
- GV-GB-001

PURPOSE:
Quarterly executive management review minutes capturing leadership review of the full enterprise (KPIs, risks, compliance, projects, strategic initiatives). Formal input to Governing Body.

INSTRUCTIONS:
Administrator chairs; Compliance Officer records. Minutes drafted â‰¤ 5 business days post-meeting; approved at next review. Retained permanently in Governance record.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Meeting Date (type=date, required=true, col=2)
- Chair (Administrator) (type=text, col=2)
- Members Present (executive team) (type=textarea, col=4)
- Enterprise KPI Dashboard Review (EN-FM-034) (type=textarea, col=4)
- Top Enterprise Risks (type=textarea, col=4)
- Compliance / Survey Status (type=textarea, col=4)
- Financial Status (budget / cash / capital) (type=textarea, col=4)
- Strategic Initiative Progress (type=textarea, col=4)
- Cross-Domain Conflicts / Escalations (type=textarea, col=4)
- Motions / Decisions (type=textarea, col=4)
- Action Items (Owner / Due) (type=textarea, col=4)
- Items Forwarded to Governing Body (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-035 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: EN-CM-001, GV-GB-001

---

## SOURCE: Builder\Forns\EN-FM-036.txt

FORM ID: EN-FM-036
TITLE: Annual Department Compliance Attestation
TYPE: Attestation
DOMAIN: EN
USAGE: Required
FREQUENCY: Annual
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- EN-CM-001
- CO-CP-001

PURPOSE:
Annual attestation by each department director certifying compliance with applicable policies, completed training, unreported concerns, and status of open findings. Rolls up to EN-FM-037 Enterprise Management Certification.

INSTRUCTIONS:
Issued by Compliance Officer in Q4; due within 30 days. Escalation to Administrator for non-attestation; certified deficiencies enter CAP (QA-FM-005).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Department (type=text, required=true, col=2)
- Department Director (Full Name) (type=text, required=true, col=2)
- Attestation Year (type=text, required=true, col=2)
- Date Submitted (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestations
layout: grid

fields:
- All applicable policies reviewed (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- All assigned staff completed required training (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- All required forms/logs maintained current (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Any unreported compliance concerns? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- All known open findings/CAPs disclosed below (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- List of Open Findings / CAPs (type=textarea, col=4)
- Exceptions / Non-Compliance Noted (type=textarea, col=4)
- Corrective Actions Committed (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Department Director â€” Printed Name (type=text, col=2)
- Department Director â€” Signature (type=signature, col=1)
- Department Director â€” Date (type=date, col=1)
- Compliance Officer (Receipt) â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-036 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: EN-CM-001, CO-CP-001

---

## SOURCE: Builder\Forns\EN-FM-037.txt

FORM ID: EN-FM-037
TITLE: Enterprise Management Certification (Administrator + CFO)
TYPE: Certification
DOMAIN: EN
USAGE: Required
FREQUENCY: Annual
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- EN-CM-001
- GV-GB-001
- CO-CP-001

PURPOSE:
Annual enterprise-level certification signed by the Administrator and CFO affirming, based on department attestations (EN-FM-036), internal audit activity, external audits, and compliance program oversight, that the agency is operating in substantial compliance. Presented to the Governing Body for acceptance.

INSTRUCTIONS:
Prepared in Q1 for prior year; Administrator + CFO certify; Governing Body acceptance recorded in GV-FM-005 minutes. Retained permanently.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Certification Year (type=text, required=true, col=2)
- Administrator (Full Name) (type=text, required=true, col=2)
- CFO (Full Name) (type=text, required=true, col=2)
- Date Prepared (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Basis of Certification
layout: grid

fields:
- Department Attestations Received (count / expected) (type=text, col=2)
- Internal Audit Cycles Completed (CO-FM-032) (type=text, col=2)
- External Audits Completed (FN-FM-015 minutes) (type=text, col=2)
- Enterprise Risk Register Reviewed (RM-FM-008) (type=text, col=2)
- Known Material Weaknesses (type=textarea, col=4)
- Known Material Compliance Findings (type=textarea, col=4)
- Remediation Status (type=textarea, col=4)

SECTION 3: Section 3 â€” Certification Language
layout: grid

fields:
- Administrator certification statement (I certify that, based on the foregoing, and to the best of my knowledge, Care Indeed Home Health Care, Inc. is operating in substantial compliance with applicable federal and state laws, CMS Conditions of Participation, and the organization's policies and procedures. Exceptions, if any, are fully disclosed in this form.) (type=textarea, col=4)
- CFO certification statement (I certify that the financial records and internal controls over financial reporting are, to the best of my knowledge, materially accurate and effective.) (type=textarea, col=4)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)
- Compliance Officer (Witness) â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Governing Body Chair (Accepted) â€” Printed Name (type=text, col=2)
- Governing Body Chair â€” Signature (type=signature, col=1)
- Governing Body Chair â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form EN-FM-037 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: EN-CM-001, GV-GB-001, CO-CP-001

---

## SOURCE: Builder\Forns\FN-FM-001.txt

FORM ID: FN-FM-001
TITLE: Daily Claims Submission & Acceptance Log
TYPE: Log
DOMAIN: FN
USAGE: Required
FREQUENCY: Daily
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- FN-BC-001

PURPOSE:
Daily log of Medicare, Medicaid, and commercial claims submitted, accepted, rejected, or pended, with dollar values.

INSTRUCTIONS:
Reconciled daily by Revenue Cycle. Rejections are re-worked within 48 hours.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Submission Date
- Claim #
- Patient MRN
- Payer
- Billed $
- Accepted $
- Rejected / Pended
- Reason
- Re-work Owner
- Status
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-001 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: FN-BC-001

---

## SOURCE: Builder\Forns\FN-FM-002.txt

FORM ID: FN-FM-002
TITLE: Claim Denial & Appeal Tracking Log
TYPE: Tracking Tool
DOMAIN: FN
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- FN-BC-002

PURPOSE:
Log tracking denied claims through appeal levels (redetermination â†’ reconsideration â†’ ALJ â†’ Council â†’ federal court) with timelines and outcomes.

INSTRUCTIONS:
Opened for every denial. Appeals filed within required timeframes. Outcomes inform targeted training and process changes.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Claim #
- Patient MRN
- Denial Date
- Denial Reason
- Appeal Level
- Filed Date
- Response Date
- Outcome
- $ Recovered
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-002 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: FN-BC-002

---

## SOURCE: Builder\Forns\FN-FM-003.txt

FORM ID: FN-FM-003
TITLE: Request for Anticipated Payment (RAP) Tracking Log
TYPE: Log
DOMAIN: FN
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- FN-BC-006

PURPOSE:
Tracking log of Requests for Anticipated Payment (if applicable) including submission, receipt, and reconciliation.

INSTRUCTIONS:
Maintained by Revenue Cycle. Reconciled with final claim payment.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Episode / MRN
- RAP Filed
- Amount
- Payment Received
- Final Claim Date
- Reconciled? (Y/N)
- Issue / Note
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-003 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: FN-BC-006

---

## SOURCE: Builder\Forns\FN-FM-004.txt

FORM ID: FN-FM-004
TITLE: Patient Financial Responsibility Agreement
TYPE: Attestation
DOMAIN: FN
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- FN-BC-003

PURPOSE:
Agreement between patient/representative and agency defining financial responsibilities, payment terms, and payer information.

INSTRUCTIONS:
Signed at SOC. Updated upon any change in payer or financial responsibility.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I acknowledge:

acknowledgments:
- I understand my insurance coverage and estimated patient responsibility.
- I agree to promptly pay amounts not covered by insurance.
- I will notify the agency of any change in insurance or financial status.
- I understand the agency will bill my insurance directly; I am responsible for any balance.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Patient / Representative â€” Printed Name (type=text, col=2)
- Patient / Representative â€” Signature (type=signature, col=1)
- Patient / Representative â€” Date (type=date, col=1)
- Intake / Billing â€” Printed Name (type=text, col=2)
- Intake / Billing â€” Signature (type=signature, col=1)
- Intake / Billing â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-004 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: FN-BC-003

---

## SOURCE: Builder\Forns\FN-FM-005.txt

FORM ID: FN-FM-005
TITLE: Credit Card / Auto-Pay Authorization Form
TYPE: Form
DOMAIN: FN
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- FN-BC-003

PURPOSE:
Authorization for automated credit-card or ACH payment of patient financial obligations.

INSTRUCTIONS:
Voluntary; may be revoked in writing. Processed per PCI-DSS requirements.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Patient Name / Account # (type=text, required=true, col=4)
- Payment Method (CC / ACH) (type=select, col=2, options=[Credit Card | ACH / Bank Account])
- Name on Account (type=text, col=2)
- Amount / Recurrence (type=text, col=2)
- Start Date (type=date, col=2)
- End Date / Until Paid (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Patient / Authorized Payer â€” Printed Name (type=text, col=2)
- Patient / Authorized Payer â€” Signature (type=signature, col=1)
- Patient / Authorized Payer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-005 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: FN-BC-003

---

## SOURCE: Builder\Forns\FN-FM-006.txt

FORM ID: FN-FM-006
TITLE: Overpayment Identification & Refund Log
TYPE: Log
DOMAIN: FN
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- FN-BC-004

PURPOSE:
Log of Medicare, Medicaid, or commercial overpayments identified, including source, amount, investigation, and refund.

INSTRUCTIONS:
Refunds processed within 60 days of identification per CMS 60-day rule.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date Identified
- Payer
- Claim #
- Amount
- Source (Internal / External)
- Investigation Summary
- Refund Date
- Refund Method
- Status
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-006 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: FN-BC-004

---

## SOURCE: Builder\Forns\FN-FM-007.txt

FORM ID: FN-FM-007
TITLE: Bad Debt & Charity Care Application
TYPE: Form
DOMAIN: FN
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- FN-FP-004

PURPOSE:
Application for bad debt adjustment or charity care consideration for uncollectible patient balances.

INSTRUCTIONS:
Reviewed by Finance Committee. Decisions documented; writeoffs posted per policy.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Patient Name / Account # (type=text, required=true, col=4)
- Balance Owed (type=text, required=true, col=2)
- Days Past Due (type=number, col=2)
- Collection Attempts (summary) (type=textarea, col=4)
- Financial Hardship Documentation (type=textarea, col=4)
- Recommendation (Charity / Bad Debt / Continue Collection) (type=select, col=2, options=[Charity Care | Bad Debt Writeoff | Continue Collection])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Finance Manager â€” Printed Name (type=text, col=2)
- Finance Manager â€” Signature (type=signature, col=1)
- Finance Manager â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-007 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: FN-FP-004

---

## SOURCE: Builder\Forns\FN-FM-008.txt

FORM ID: FN-FM-008
TITLE: Pre-Claim Review (PCR) Checklist
TYPE: Checklist
DOMAIN: FN
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-BC-005

PURPOSE:
Pre-Claim Review checklist for the limited Medicare demonstrations and review programs where applicable.

INSTRUCTIONS:
Completed before claim submission when PCR applies. Documentation gaps resolved pre-submission.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Pre-Claim Review (PCR) Checklist Checklist
layout: checklist

checklist_items:
- Face-to-face encounter documented and compliant
- Certification & recertification of medical necessity current
- Plan of Care signed by physician
- Documentation supports homebound status
- Documentation supports need for skilled services
- OASIS completed and transmitted
- Visits documented at frequency matching POC
- Supply / DME orders documented
- Billing codes match documented services
- Claim form fields verified

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Pre-Claim Reviewer â€” Printed Name (type=text, col=2)
- Pre-Claim Reviewer â€” Signature (type=signature, col=1)
- Pre-Claim Reviewer â€” Date (type=date, col=1)
- Clinical Manager â€” Printed Name (type=text, col=2)
- Clinical Manager â€” Signature (type=signature, col=1)
- Clinical Manager â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-008 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: FN-BC-005

---

## SOURCE: Builder\Forns\FN-FM-009.txt

FORM ID: FN-FM-009
TITLE: Episode Financial Performance Analysis
TYPE: Worksheet
DOMAIN: FN
USAGE: Required
FREQUENCY: Quarterly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- FN-CM-001
- FN-FP-003

PURPOSE:
Episode-level financial analysis comparing revenue to direct cost (visits, supplies, overhead) to identify margin trends.

INSTRUCTIONS:
Performed quarterly on sample of episodes. Findings inform visit utilization and staffing decisions.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Situation / Scope (type=textarea, col=4)
- Data / Evidence Reviewed (type=textarea, col=4)
- Analysis (type=textarea, col=4)
- Findings (type=textarea, col=4)
- Recommendations (type=textarea, col=4)
- Next Steps / Owner / Due Date (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-009 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: FN-CM-001, FN-FP-003

---

## SOURCE: Builder\Forns\FN-FM-010.txt

FORM ID: FN-FM-010
TITLE: PDGM LUPA Mitigation Tracker
TYPE: Tracking Tool
DOMAIN: FN
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- QA-PI-006
- FN-CM-005

PURPOSE:
Tracker identifying LUPA-risk episodes with mitigation actions (added visits, care coordination) to avoid payment reduction.

INSTRUCTIONS:
Updated daily. Escalation triggers at day 25, 40, and 55 of certification period.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Episode
- Day of Cert
- Visits Done
- LUPA Threshold
- Gap
- Mitigation Action
- Owner
- Result
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-010 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-PI-006, FN-CM-005

---

## SOURCE: Builder\Forns\FN-FM-011.txt

FORM ID: FN-FM-011
TITLE: Revenue Cycle KPI Dashboard
TYPE: Tracking Tool
DOMAIN: FN
USAGE: Required
FREQUENCY: Monthly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- FN-FP-003

PURPOSE:
Monthly revenue cycle KPI dashboard (DSO, denial rate, clean claim rate, AR aging, collection rate).

INSTRUCTIONS:
Prepared by Revenue Cycle Director; presented at Finance and Administrator meetings.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- KPI
- Target
- Current Month
- Prior Month
- YTD
- Trend
- Commentary
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-011 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: FN-FP-003

---

## SOURCE: Builder\Forns\FN-FM-012.txt

FORM ID: FN-FM-012
TITLE: Supply & Equipment Purchase Request Log
TYPE: Log
DOMAIN: FN
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- FN-FP-006

PURPOSE:
Log of all supply and equipment purchase requests, approvals, and deliveries for budget and inventory tracking.

INSTRUCTIONS:
Maintained by Operations. Matched against vendor invoices.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Request Date
- Requester
- Item
- Qty
- Unit Cost
- Total
- Vendor
- Approver
- Delivered Date
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-012 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: FN-FP-006

---

## SOURCE: Builder\Forns\FN-FM-013.txt

FORM ID: FN-FM-013
TITLE: Charge Capture Audit & Fee Schedule Review
TYPE: Checklist
DOMAIN: FN
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-FP-002

PURPOSE:
Annual audit of charge-capture completeness and fee schedule accuracy against payer contracts and CMS fee schedules.

INSTRUCTIONS:
Performed by Finance / Compliance. Deficiencies corrected and tracked.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Charge Capture Audit & Fee Schedule Review Checklist
layout: checklist

checklist_items:
- All service lines present in charge master
- CPT / HCPCS codes current for fiscal year
- Modifiers applied correctly
- Payer contract rates matched in system
- Physician orders cross-checked against billed services
- Non-billable items identified and excluded
- Bundled-service logic validated
- Denial patterns analyzed for charge-capture gaps
- Annual fee-schedule update approved by leadership

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Finance Manager â€” Printed Name (type=text, col=2)
- Finance Manager â€” Signature (type=signature, col=1)
- Finance Manager â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-013 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: FN-FP-002

---

## SOURCE: Builder\Forns\FN-FM-014.txt

FORM ID: FN-FM-014
TITLE: Finance Committee Meeting Minutes
TYPE: Template
DOMAIN: FN
USAGE: Required
FREQUENCY: Quarterly
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- FN-FP-001
- FN-FP-005
- GV-GB-001

PURPOSE:
Quarterly (or more frequent) Finance Committee meeting minutes template capturing attendees, fiscal review, budget variance, revenue-cycle KPIs, material write-offs, treasury/investment decisions, and recommendations to the Governing Body.

INSTRUCTIONS:
Prepared by CFO/Finance Director (or designee) within 5 business days of meeting. Approved at next Finance Committee meeting. Supplies the Governing Body minutes (GV-FM-005) with underlying detail. Archived in Governance/Finance record minimum 7 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Meeting Date (type=date, required=true, col=2)
- Meeting Location / Platform (type=text, col=2)
- Finance Committee Chair (type=text, col=2)
- Members Present (type=textarea, col=4)
- Members Absent (type=textarea, col=4)
- Quorum Confirmed? (Y/N) (type=select, col=2, options=[Yes | No])
- Approval of Prior Minutes (type=textarea, col=4)
- Monthly/Quarterly Financial Report Review (type=textarea, col=4)
- Budget-to-Actual Variance Review (>10% items) (type=textarea, col=4)
- Revenue Cycle KPIs (denials, DSO, cash, AR aging) (type=textarea, col=4)
- Material Write-Offs / Bad Debt Review (type=textarea, col=4)
- Capital Expenditures / Investments (type=textarea, col=4)
- Banking / Treasury Matters (type=textarea, col=4)
- Motions / Votes (with dissents, recusals) (type=textarea, col=4)
- Recommendations to Governing Body (type=textarea, col=4)
- Action Items (Owner / Due) (type=textarea, col=4)
- Adjournment Time (type=text, col=2)
- Next Meeting Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Finance Committee Chair â€” Printed Name (type=text, col=2)
- Finance Committee Chair â€” Signature (type=signature, col=1)
- Finance Committee Chair â€” Date (type=date, col=1)
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)
- Recorder â€” Printed Name (type=text, col=2)
- Recorder â€” Signature (type=signature, col=1)
- Recorder â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-014 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-FP-001, FN-FP-005, GV-GB-001

---

## SOURCE: Builder\Forns\FN-FM-015.txt

FORM ID: FN-FM-015
TITLE: Audit Committee Meeting Minutes
TYPE: Template
DOMAIN: FN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- FN-FP-010
- GV-GB-001
- CO-CP-001

PURPOSE:
Audit Committee meeting minutes template capturing oversight of external financial audits (GAAP), internal audit activity, management letter responses, material weaknesses, and fraud-risk assessments. Supports SAS 114 / AU-C 260 communications to governance.

INSTRUCTIONS:
Prepared by Audit Committee Secretary (or designee) within 5 business days of meeting. Approved at next Audit Committee meeting. Executive-session portions recorded separately per GV-WF-14. Archived in Governance record minimum 7 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Meeting Date (type=date, required=true, col=2)
- Meeting Location / Platform (type=text, col=2)
- Audit Committee Chair (type=text, col=2)
- Members Present (type=textarea, col=4)
- Members Absent (type=textarea, col=4)
- Quorum Confirmed? (Y/N) (type=select, col=2, options=[Yes | No])
- External Auditor Attendance (firm / individuals) (type=textarea, col=4)
- Approval of Prior Minutes (type=textarea, col=4)
- External Audit Planning / Scope / Fees (type=textarea, col=4)
- External Audit Findings / Management Letter (type=textarea, col=4)
- Internal Audit Report Review (type=textarea, col=4)
- Material Weaknesses / Significant Deficiencies (type=textarea, col=4)
- Fraud Risk Assessment (type=textarea, col=4)
- Whistleblower / Hotline Activity (from Compliance) (type=textarea, col=4)
- Executive Session Held? (Y/N) (type=select, col=2, options=[Yes | No])
- Motions / Votes (with dissents, recusals) (type=textarea, col=4)
- Recommendations to Governing Body (type=textarea, col=4)
- Action Items (Owner / Due) (type=textarea, col=4)
- Adjournment Time (type=text, col=2)
- Next Meeting Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Audit Committee Chair â€” Printed Name (type=text, col=2)
- Audit Committee Chair â€” Signature (type=signature, col=1)
- Audit Committee Chair â€” Date (type=date, col=1)
- External Auditor (if present) â€” Printed Name (type=text, col=2)
- External Auditor â€” Signature (type=signature, col=1)
- External Auditor â€” Date (type=date, col=1)
- Recorder â€” Printed Name (type=text, col=2)
- Recorder â€” Signature (type=signature, col=1)
- Recorder â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-015 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-FP-010, GV-GB-001, CO-CP-001

---

## SOURCE: Builder\Forns\FN-FM-016.txt

FORM ID: FN-FM-016
TITLE: ADR (Additional Documentation Request) Response Tracker
TYPE: Log
DOMAIN: FN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-BC-001
- CO-CP-001

PURPOSE:
Tracks every Medicare Additional Documentation Request (ADR) from MAC, RAC, UPIC, SMRC, or CERT, including receipt date, due date (typically 45 days), assembly, submission, and outcome. Critical for denial/appeal lifecycle.

INSTRUCTIONS:
Revenue Cycle logs each ADR within 24 hours of receipt. Clinical Manager compiles documentation. Submitted electronically (esMD or per contractor). Outcome updated on disposition.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” ADR Log Entries
layout: grid

fields:
- ADR ID / Control # (type=text, required=true, col=2)
- Contractor (MAC / RAC / UPIC / SMRC / CERT) (type=select, col=2, options=[MAC | RAC | UPIC | SMRC | CERT | Other])
- Patient / Claim # (type=text, col=2)
- DOS / Episode (type=text, col=2)
- Date Received (type=date, required=true, col=2)
- Response Due Date (type=date, required=true, col=2)
- Assigned To (type=text, col=2)
- Documentation Assembled Date (type=date, col=2)
- Submission Date / Method (type=text, col=2)
- Outcome (Paid / Denied / Partial / Pending) (type=select, col=2, options=[Paid | Denied | Partial | Pending | Withdrawn])
- Appeal Filed? (Y/N) (type=select, col=2, options=[Yes | No])
- Notes (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Revenue Cycle Manager â€” Printed Name (type=text, col=2)
- Revenue Cycle Manager â€” Signature (type=signature, col=1)
- Revenue Cycle Manager â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-016 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-BC-001, CO-CP-001

---

## SOURCE: Builder\Forns\FN-FM-017.txt

FORM ID: FN-FM-017
TITLE: ADR Review Checklist (Clinical Documentation QA)
TYPE: Checklist
DOMAIN: FN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-BC-001
- CO-CP-001

PURPOSE:
Clinical QA review checklist applied to ADR response packages before submission, verifying completeness, legibility, physician signatures, OASIS alignment, face-to-face encounter, homebound justification, and medical necessity.

INSTRUCTIONS:
Clinical Manager completes before each ADR submission (see FN-FM-016 ADR Tracker). Any "No" answer blocks submission until remediated.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Reviewer (Clinical Manager) (type=text, required=true, col=2)
- ADR ID (FN-FM-016) (type=text, required=true, col=2)
- Patient / Claim # (type=text, col=2)
- Review Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” QA Checklist
layout: grid

fields:
- CMS-485 / plan of care present and signed? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Face-to-face encounter documentation present? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Homebound status justified in record? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Medical necessity documented by physician? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- OASIS submission aligns with claim HIPPS? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- All visit notes signed & dated? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Therapy reassessment timely (if applicable)? (Y/N) (type=select, col=2, options=[Yes | No | NA])
- Legibility acceptable? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Discharge summary (if applicable)? (Y/N) (type=select, col=2, options=[Yes | No | NA])
- Issues / Remediation Required (type=textarea, col=4)
- Cleared for Submission? (Y/N) (type=select, required=true, col=2, options=[Yes | No])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Clinical Manager â€” Printed Name (type=text, col=2)
- Clinical Manager â€” Signature (type=signature, col=1)
- Clinical Manager â€” Date (type=date, col=1)
- Revenue Cycle Manager â€” Printed Name (type=text, col=2)
- Revenue Cycle Manager â€” Signature (type=signature, col=1)
- Revenue Cycle Manager â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-017 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-BC-001, CO-CP-001

---

## SOURCE: Builder\Forns\FN-FM-018.txt

FORM ID: FN-FM-018
TITLE: Quarterly Credit Balance Report (CMS-838)
TYPE: Report
DOMAIN: FN
USAGE: Required
FREQUENCY: Quarterly
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-BC-001
- CO-CP-001

PURPOSE:
Quarterly credit-balance identification & disposition report aligned with CMS-838 filing requirements (Medicare/Medicaid credit balances). Feeds FN-WF-08 Overpayment and FN-WF-07 Refund workflows.

INSTRUCTIONS:
AR Supervisor produces within 30 days of quarter-end; CFO approves. CMS-838 is filed where required. Retain 10 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Reporting Quarter (type=text, required=true, col=2)
- AR Supervisor (type=text, required=true, col=2)
- CFO Attestation (type=text, col=2)
- Report Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Credit Balance Entries
layout: grid

fields:
- Account / Claim # (type=text, col=2)
- Payer (Medicare / Medicaid / Commercial / Patient) (type=select, col=2, options=[Medicare | Medicaid | Commercial | Patient | Other])
- Credit Amount (type=text, col=2)
- Date Identified (type=date, col=2)
- Root Cause (type=textarea, col=4)
- Disposition (Refund / Offset / Transfer / Other) (type=select, col=2, options=[Refund | Offset | Transfer | Other])
- Disposition Date (type=date, col=2)
- CMS-838 Included? (Y/N) (type=select, col=2, options=[Yes | No | NA])
- 60-Day Rule Clock Started? (Y/N) (type=select, col=2, options=[Yes | No])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- AR Supervisor â€” Printed Name (type=text, col=2)
- AR Supervisor â€” Signature (type=signature, col=1)
- AR Supervisor â€” Date (type=date, col=1)
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-018 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-BC-001, CO-CP-001

---

## SOURCE: Builder\Forns\FN-FM-019.txt

FORM ID: FN-FM-019
TITLE: Refund Transmittal
TYPE: Form
DOMAIN: FN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-BC-001
- CO-CP-001

PURPOSE:
Formal transmittal accompanying each refund (Medicare, Medicaid, commercial, patient) documenting the claim, root cause, amount, payment method, and 60-day-rule compliance basis. Paired with CMS-838 where applicable.

INSTRUCTIONS:
Billing completes; Compliance Officer concurs where 60-day rule applies; CFO authorizes payment. Retain 10 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Claim / Account # (type=text, required=true, col=2)
- Payer (type=text, required=true, col=2)
- Patient / Member (type=text, col=2)
- Date of Service / Episode (type=text, col=2)

SECTION 2: Section 2 â€” Refund Detail
layout: grid

fields:
- Original Payment Amount (type=text, col=2)
- Refund Amount (type=text, required=true, col=2)
- Root Cause / Reason (type=textarea, col=4)
- 60-Day Rule Triggered? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Date Identified (type=date, required=true, col=2)
- Date Refund Due (â‰¤ 60 days if triggered) (type=date, col=2)
- Payment Method (check / EFT / offset) (type=select, col=2, options=[Check | EFT | Offset | Other])
- Transaction / Check # (type=text, col=2)
- Refund Date (type=date, col=2)
- CMS-838 Entry (if applicable) (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Billing â€” Printed Name (type=text, col=2)
- Billing â€” Signature (type=signature, col=1)
- Billing â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-019 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-BC-001, CO-CP-001

---

## SOURCE: Builder\Forns\FN-FM-020.txt

FORM ID: FN-FM-020
TITLE: Overpayment Identification Worksheet (60-Day Rule)
TYPE: Worksheet
DOMAIN: FN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-BC-001
- CO-CP-001

PURPOSE:
Worksheet to capture the point at which a potential overpayment is identified for ACA Â§ 6402/42 CFR Â§ 401.305 60-day-rule tracking, including diligence timeline, scope (single vs systemic), quantification approach, and return method.

INSTRUCTIONS:
Compliance / CFO initiates within 1 business day of identification. Reasonable-diligence investigation must conclude within 6 months; refund due within 60 days of confirmed quantification. All decisions documented.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Case ID (type=text, required=true, col=2)
- Initiator (type=text, required=true, col=2)
- Date Identified (start of 60-day clock) (type=date, required=true, col=2)
- Source of Identification (internal audit / hotline / RAC / MAC / self-review) (type=select, col=2, options=[Internal audit | Hotline | RAC | MAC | UPIC | Self-review | Other])

SECTION 2: Section 2 â€” Scope & Analysis
layout: grid

fields:
- Single Occurrence or Systemic? (type=select, required=true, col=2, options=[Single | Systemic])
- Claims Affected (count / dollars) (type=textarea, col=4)
- Root Cause (preliminary) (type=textarea, col=4)
- Extrapolation Required? (Y/N) (type=select, col=2, options=[Yes | No])
- Diligence Plan (owners / milestones) (type=textarea, col=4)
- Expected Diligence Close Date (type=date, col=2)

SECTION 3: Section 3 â€” Disposition Path
layout: grid

fields:
- Self-Disclosure Considered? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Self-Disclosure Pathway (OIG / CMS SRDP / MAC voluntary refund / N/A) (type=select, col=2, options=[OIG SDP | CMS SRDP | MAC Voluntary Refund | NA])
- Legal Counsel Engaged? (Y/N) (type=select, col=2, options=[Yes | No])
- Target Refund/Disclosure Date (type=date, col=2)
- Notes (type=textarea, col=4)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-020 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-BC-001, CO-CP-001

---

## SOURCE: Builder\Forns\FN-FM-021.txt

FORM ID: FN-FM-021
TITLE: Statistical Extrapolation Worksheet
TYPE: Worksheet
DOMAIN: FN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-BC-001
- CO-CP-001

PURPOSE:
Documents statistical-sampling methodology and extrapolation computations when systemic overpayment is identified (aligned with MPIM Ch. 8 / PIM Ch. 3). Ensures defensibility in government-audit, RAC, UPIC, and self-disclosure scenarios.

INSTRUCTIONS:
Qualified statistician (internal or external) completes. Compliance & CFO review and sign. Supports FN-FM-020 Overpayment Identification and FN-FM-022 Quantification.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Case ID (link to FN-FM-020) (type=text, required=true, col=2)
- Statistician Name / Credentials (type=text, required=true, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Sampling Methodology
layout: grid

fields:
- Universe / Sampling Frame (claims population) (type=textarea, col=4)
- Sampling Unit (claim / episode / beneficiary) (type=select, col=2, options=[Claim | Episode | Beneficiary | Other])
- Sampling Method (simple random / stratified / cluster) (type=select, col=2, options=[Simple Random | Stratified | Cluster | Other])
- Sample Size (type=text, col=2)
- Confidence Level (90/95/99) (type=select, col=2, options=[90 | 95 | 99])
- Precision (type=text, col=2)
- RAT-STATS or Software Used (type=text, col=2)
- Seed / Reproducibility Info (type=text, col=2)

SECTION 3: Section 3 â€” Extrapolation Results
layout: grid

fields:
- Sample Error Rate (type=text, col=2)
- Point Estimate (type=text, col=2)
- Lower Bound (one-sided 90%) (type=text, col=2)
- Recommended Extrapolated Overpayment (most favorable to provider per MPIM) (type=text, col=2)
- Methodology Narrative (type=textarea, col=4)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Statistician â€” Printed Name (type=text, col=2)
- Statistician â€” Signature (type=signature, col=1)
- Statistician â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-021 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-BC-001, CO-CP-001

---

## SOURCE: Builder\Forns\FN-FM-022.txt

FORM ID: FN-FM-022
TITLE: Overpayment Quantification Summary
TYPE: Summary
DOMAIN: FN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-BC-001
- CO-CP-001

PURPOSE:
Final quantification summary of an identified overpayment, consolidating claim-level review, extrapolation (if any), and net amount owed. Triggers 60-day refund/disclosure clock.

INSTRUCTIONS:
CFO prepares; Compliance Officer concurs; Legal Counsel approves. Final package attached to FN-FM-019 Refund Transmittal or self-disclosure submission.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Case ID (link to FN-FM-020) (type=text, required=true, col=2)
- Date Quantified (type=date, required=true, col=2)
- Preparer (CFO or designee) (type=text, col=2)

SECTION 2: Section 2 â€” Quantification Breakdown
layout: grid

fields:
- Method (claim-by-claim / extrapolation) (type=select, required=true, col=2, options=[Claim-by-claim | Extrapolation | Hybrid])
- Number of Affected Claims (type=text, col=2)
- Total Paid Amount (type=text, col=2)
- Gross Overpayment Amount (type=text, col=2)
- Interest / Prompt-Pay Amount (if applicable) (type=text, col=2)
- Net Amount Owed (type=text, col=2)
- Breakdown by Payer (type=textarea, col=4)
- Supporting Documents List (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Legal Counsel â€” Printed Name (type=text, col=2)
- Legal Counsel â€” Signature (type=signature, col=1)
- Legal Counsel â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-022 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-BC-001, CO-CP-001

---

## SOURCE: Builder\Forns\FN-FM-023.txt

FORM ID: FN-FM-023
TITLE: Self-Disclosure Decision Memo
TYPE: Memo
DOMAIN: FN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, legal_privilege

LINKED POLICIES:
- FN-BC-001
- CO-CP-001

PURPOSE:
Privileged decision memorandum documenting the analysis and rationale for pursuing or declining self-disclosure (OIG SDP, CMS SRDP, MAC voluntary refund) for an identified overpayment or compliance matter.

INSTRUCTIONS:
Legal Counsel drafts with Compliance Officer. Approved by Administrator and reviewed with Governing Body in executive session (GV-FM-022). Privileged/attorney-client â€” handle accordingly.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Case ID (type=text, required=true, col=2)
- Memo Date (type=date, required=true, col=2)
- Prepared By (Legal Counsel) (type=text, col=2)
- Reviewed By (Compliance Officer) (type=text, col=2)

SECTION 2: Section 2 â€” Matter Summary
layout: grid

fields:
- Nature of Matter (type=textarea, col=4)
- Affected Program (Medicare / Medicaid / Stark / AKS / FCA / Other) (type=select, col=2, options=[Medicare | Medicaid | Stark | AKS | FCA | Other])
- Gross Amount at Issue (type=text, col=2)
- Potential Liability Exposure (type=textarea, col=4)

SECTION 3: Section 3 â€” Disposition Analysis
layout: grid

fields:
- Disclosure Pathways Considered (type=textarea, col=4)
- Recommended Path (OIG SDP / CMS SRDP / MAC refund / No disclosure) (type=select, required=true, col=2, options=[OIG SDP | CMS SRDP | MAC Voluntary Refund | No Disclosure | Deferred])
- Rationale (type=textarea, col=4)
- Board / Executive Session Reference (GV-FM-022) (type=text, col=2)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Legal Counsel â€” Printed Name (type=text, col=2)
- Legal Counsel â€” Signature (type=signature, col=1)
- Legal Counsel â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-023 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- ATTORNEY-CLIENT PRIVILEGED / WORK PRODUCT
- Linked Policies: FN-BC-001, CO-CP-001

---

## SOURCE: Builder\Forns\FN-FM-024.txt

FORM ID: FN-FM-024
TITLE: Finance Corrective Action Plan (Post-Audit / Post-Overpayment)
TYPE: Plan
DOMAIN: FN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-BC-001
- CO-CP-001

PURPOSE:
Corrective action plan specific to finance / billing compliance findings (overpayment, audit findings, credit-balance gaps). Parallel to QA-FM-005 but scoped to finance controls.

INSTRUCTIONS:
CFO & Compliance Officer initiate within 30 days of finding. Monthly progress to Finance Committee (FN-FM-014). Closure requires independent verification.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- CAP ID (type=text, required=true, col=2)
- Source Finding (audit / overpayment / RAC / internal) (type=text, required=true, col=2)
- Initiated By (type=text, col=2)
- Date Initiated (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Root Cause & Actions
layout: grid

fields:
- Root Cause (type=textarea, col=4)
- Short-Term Actions (â‰¤ 30 days) (type=textarea, col=4)
- Long-Term Actions (> 30 days) (type=textarea, col=4)
- Control Changes (type=textarea, col=4)
- Training Actions (type=textarea, col=4)
- Monitoring Plan (type=textarea, col=4)

SECTION 3: Section 3 â€” Verification & Closure
layout: grid

fields:
- Verifier (independent) (type=text, col=2)
- Verification Date (type=date, col=2)
- Residual Risk Acceptable? (Y/N) (type=select, col=2, options=[Yes | No])
- Closure Date (type=date, col=2)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-024 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-BC-001, CO-CP-001

---

## SOURCE: Builder\Forns\FN-FM-025.txt

FORM ID: FN-FM-025
TITLE: AR Aging Report
TYPE: Report
DOMAIN: FN
USAGE: Required
FREQUENCY: Monthly
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-BC-001

PURPOSE:
Monthly accounts-receivable aging by payer and bucket (0-30, 31-60, 61-90, 91-120, 120+) used to manage denial trends, DSO, collection prioritization, and bad-debt review.

INSTRUCTIONS:
AR team produces monthly within 5 business days of month-end. Reviewed by CFO at monthly close and Finance Committee (FN-FM-014) quarterly.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Report Period (Month/Year) (type=text, required=true, col=2)
- AR Lead (type=text, required=true, col=2)
- Report Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Aging Summary
layout: grid

fields:
- Payer (type=text, col=2)
- 0-30 days (type=text, col=2)
- 31-60 days (type=text, col=2)
- 61-90 days (type=text, col=2)
- 91-120 days (type=text, col=2)
- 120+ days (type=text, col=2)
- Total Open AR (type=text, col=2)
- DSO (type=text, col=2)
- Month-over-Month Change (type=textarea, col=4)
- Accounts Flagged for Bad-Debt Review (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- AR Lead â€” Printed Name (type=text, col=2)
- AR Lead â€” Signature (type=signature, col=1)
- AR Lead â€” Date (type=date, col=1)
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-025 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-BC-001

---

## SOURCE: Builder\Forns\FN-FM-026.txt

FORM ID: FN-FM-026
TITLE: Bad Debt Review & Write-Off Form
TYPE: Form
DOMAIN: FN
USAGE: Required
FREQUENCY: Monthly
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-BC-001

PURPOSE:
Documents the review, approval, and write-off of uncollectible accounts, including evidence of reasonable collection effort for Medicare bad-debt claim (CMS Pub. 15 Ch. 3), charity determination, and authorization.

INSTRUCTIONS:
AR Supervisor reviews monthly; CFO approves write-offs > $X (per FN-FP-005); write-off bundles â‰¥ $Y escalated to Finance Committee (FN-FM-014) and Governing Body (GV-FM-005). Retain 10 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Account / Patient # (type=text, required=true, col=2)
- Payer (type=text, col=2)
- Write-Off Amount (type=text, required=true, col=2)
- Review Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Collection History
layout: grid

fields:
- Date of First Bill (type=date, col=2)
- Number of Statements Sent (type=text, col=2)
- Collection Agency Engaged? (Y/N) (type=select, col=2, options=[Yes | No])
- Payment Plan Offered? (Y/N) (type=select, col=2, options=[Yes | No])
- Patient Financial Hardship Considered? (Y/N) (type=select, col=2, options=[Yes | No])
- Charity Care Referral (FN-FM-027)? (Y/N) (type=select, col=2, options=[Yes | No])

SECTION 3: Section 3 â€” Approval
layout: grid

fields:
- Write-Off Category (Medicare bad debt / Medicaid crossover / Contractual / Charity / Small balance) (type=select, required=true, col=2, options=[Medicare Bad Debt | Medicaid Crossover | Contractual | Charity | Small Balance | Other])
- Approval Level Required (Supervisor / CFO / Finance Committee / Board) (type=select, required=true, col=2, options=[Supervisor | CFO | Finance Committee | Board])
- Finance Committee Reference (FN-FM-014) (type=text, col=2)
- Governing Body Reference (GV-FM-005) (type=text, col=2)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- AR Supervisor â€” Printed Name (type=text, col=2)
- AR Supervisor â€” Signature (type=signature, col=1)
- AR Supervisor â€” Date (type=date, col=1)
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-026 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-BC-001

---

## SOURCE: Builder\Forns\FN-FM-027.txt

FORM ID: FN-FM-027
TITLE: Financial Assistance / Charity Care Application
TYPE: Application
DOMAIN: FN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-FP-003
- CO-CP-001

PURPOSE:
Patient-facing application for financial assistance / charity care consistent with the agency's Financial Assistance Policy. Captures household income, assets, expenses, family size, and supporting documentation.

INSTRUCTIONS:
Financial Counselor / Social Worker provides to patient at signs of hardship; patient (or representative) returns within 30 days; determination within 14 days of complete application (FN-FM-028).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Patient Name (type=text, required=true, col=2)
- Patient ID / Account # (type=text, required=true, col=2)
- Application Date (type=date, required=true, col=2)
- Preparer / Assistor (type=text, col=2)

SECTION 2: Section 2 â€” Household & Income
layout: grid

fields:
- Household Size (type=text, required=true, col=2)
- Annual Household Income (type=text, required=true, col=2)
- Sources of Income (type=textarea, col=4)
- Monthly Expenses (type=text, col=2)
- Liquid Assets (type=text, col=2)
- Medical Expenses (past 12 mo) (type=text, col=2)

SECTION 3: Section 3 â€” Documentation
layout: grid

fields:
- Tax Return Provided? (Y/N) (type=select, col=2, options=[Yes | No])
- Pay Stubs / Unemployment Docs? (Y/N) (type=select, col=2, options=[Yes | No])
- Bank Statements? (Y/N) (type=select, col=2, options=[Yes | No])
- Government Assistance Benefits? (type=textarea, col=4)
- Other Hardship Notes (type=textarea, col=4)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Patient / Representative â€” Printed Name (type=text, col=2)
- Patient â€” Signature (type=signature, col=1)
- Patient â€” Date (type=date, col=1)
- Preparer (if other than patient) â€” Printed Name (type=text, col=2)
- Preparer â€” Signature (type=signature, col=1)
- Preparer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-027 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- CONFIDENTIAL â€” handle per financial privacy controls
- Linked Policies: FN-FP-003, CO-CP-001

---

## SOURCE: Builder\Forns\FN-FM-028.txt

FORM ID: FN-FM-028
TITLE: Charity Determination & Notification
TYPE: Determination
DOMAIN: FN
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- FN-FP-003

PURPOSE:
Formal determination notice issued to patient following review of FN-FM-027 Charity Application, documenting eligibility, sliding-scale or full-write-off calculation, effective dates, and patient appeal rights.

INSTRUCTIONS:
CFO (or designee) determines within 14 days of complete application; letter mailed to patient; account adjusted (FN-FM-026). Retain 10 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Patient Name (type=text, required=true, col=2)
- Account # (type=text, required=true, col=2)
- Application Date (FN-FM-027) (type=date, col=2)
- Determination Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Determination
layout: grid

fields:
- Eligibility (Full / Partial / Denied) (type=select, required=true, col=2, options=[Full | Partial | Denied])
- Sliding Scale % Applied (if partial) (type=text, col=2)
- Original Balance (type=text, col=2)
- Adjusted / Discounted Balance (type=text, col=2)
- Write-Off Amount (type=text, col=2)
- Effective Date (type=date, col=2)
- Coverage Period (type=text, col=2)
- Rationale / Policy Reference (type=textarea, col=4)
- Appeal Rights Notice Provided? (Y/N) (type=select, required=true, col=2, options=[Yes | No])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- CFO â€” Printed Name (type=text, col=2)
- CFO â€” Signature (type=signature, col=1)
- CFO â€” Date (type=date, col=1)
- Patient Notified Via (mail / email / portal) (type=text, col=2)
- Notification Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form FN-FM-028 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: FN-FP-003

---

## SOURCE: Builder\Forns\FORMS_EXPORT_INDEX.txt

FORMS EXPORT INDEX
total_forms: 361
last_updated: 2026-04-21 (Full System Audit Expansion â€” added 68 forms across FN, HR, IT, RM, EN domains to resolve all workflow FORM REQUIRED flags)

EN-FM-001 | Universal Policy Acknowledgment Form | EN-FM-001.txt
EN-FM-002 | Master Policy Index / Taxonomy Register | EN-FM-002.txt
EN-FM-003 | Policy Classification Tier Matrix | EN-FM-003.txt
EN-FM-004 | Domain Owner Assignment Roster | EN-FM-004.txt
EN-FM-005 | Regulatory Crosswalk Template | EN-FM-005.txt
EN-FM-006 | Compliance Gap Analysis Worksheet | EN-FM-006.txt
EN-FM-007 | Policy Development & Revision Template | EN-FM-007.txt
EN-FM-008 | Policy Approval Routing Form | EN-FM-008.txt
EN-FM-009 | Version Control Change Log | EN-FM-009.txt
EN-FM-010 | Annual Policy Review Schedule | EN-FM-010.txt
EN-FM-011 | Policy Exception / Waiver Request Form | EN-FM-011.txt
EN-FM-012 | Exception & Waiver Tracking Log | EN-FM-012.txt
EN-FM-013 | Role-Based Policy Assignment Matrix | EN-FM-013.txt
EN-FM-014 | Policy Acknowledgment Tracking Log | EN-FM-014.txt
EN-FM-015 | Policy Retirement Request Form | EN-FM-015.txt
EN-FM-016 | Policy Obsolescence Impact Assessment | EN-FM-016.txt
EN-FM-017 | Enterprise Compliance Dashboard Template | EN-FM-017.txt
EN-FM-018 | Departmental KPI Reporting Form | EN-FM-018.txt
EN-FM-019 | Non-Compliance Remediation Plan | EN-FM-019.txt
EN-FM-020 | Policy Conflict Resolution Request Form | EN-FM-020.txt
EN-FM-021 | Inter-Domain Coordination Meeting Minutes | EN-FM-021.txt
EN-FM-022 | Enterprise Policy Compliance Scorecard | EN-FM-022.txt
EN-FM-023 | Cross-Domain Conflict Resolution Log | EN-FM-023.txt
EN-FM-024 | Policy Exception & Waiver Request Form | EN-FM-024.txt
EN-FM-025 | Policy Retirement & Obsolescence Checklist | EN-FM-025.txt
EN-FM-026 | Role-Based Applicability Matrix | EN-FM-026.txt
EN-FM-027 | Annual Policy Acknowledgment Tracking Report | EN-FM-027.txt
EN-FM-028 | Regulatory Mapping Accuracy Audit Worksheet | EN-FM-028.txt
EN-FM-029 | Enterprise Taxonomy Version Release Notes | EN-FM-029.txt
EN-FM-030 | Legal Hold Notice | EN-FM-030.txt
EN-FM-031 | Records Destruction Authorization | EN-FM-031.txt
EN-FM-032 | Enterprise Mandatory Events Calendar | EN-FM-032.txt
EN-FM-033 | Mandatory Events Completion Report | EN-FM-033.txt
EN-FM-034 | Enterprise KPI Dashboard | EN-FM-034.txt
EN-FM-035 | Quarterly Management Review Minutes | EN-FM-035.txt
EN-FM-036 | Annual Department Compliance Attestation | EN-FM-036.txt
EN-FM-037 | Enterprise Management Certification (Administrator + CFO) | EN-FM-037.txt
GV-FM-001 | Agency Closure / Change of Ownership Checklist | GV-FM-001.txt
GV-FM-002 | Agency Credential & Licensure Register | GV-FM-002.txt
GV-FM-003 | Official Agency Organizational Chart | GV-FM-003.txt
GV-FM-004 | Governing Body Meeting Agenda Template | GV-FM-004.txt
GV-FM-005 | Governing Body Meeting Minutes Template | GV-FM-005.txt
GV-FM-006 | Conflict of Interest Disclosure Form | GV-FM-006.txt
GV-FM-007 | Administrator Delegation of Authority Agreement | GV-FM-007.txt
GV-FM-008 | Governing Body Annual Self-Assessment Tool | GV-FM-008.txt
GV-FM-009 | Annual Strategic Planning Worksheet | GV-FM-009.txt
GV-FM-010 | Legal Counsel Engagement Authorization | GV-FM-010.txt
GV-FM-011 | Governing Body Roster & Contact Matrix | GV-FM-011.txt
GV-FM-012 | Executive Session Confidentiality Agreement | GV-FM-012.txt
GV-FM-013 | Administrator Succession Plan Template | GV-FM-013.txt
GV-FM-014 | Administrator Qualification Verification Checklist | GV-FM-014.txt
GV-FM-015 | Clinical Manager Qualification Checklist | GV-FM-015.txt
GV-FM-016 | Scope of Services Definition Matrix | GV-FM-016.txt
GV-FM-017 | Delegation of Authority (DOA) Log | GV-FM-017.txt
GV-FM-018 | Interagency Agreement / Contract Register | GV-FM-018.txt
GV-FM-019 | Agency Licensure & Certification Tracking Log | GV-FM-019.txt
GV-FM-020 | Media/PR External Communication Request | GV-FM-020.txt
GV-FM-021 | Board Member Appointment & Resignation Record | GV-FM-021.txt
GV-FM-022 | Executive Session Minutes Template | GV-FM-022.txt
GV-FM-023 | Annual Compliance Report to Governing Body | GV-FM-023.txt
GV-FM-024 | Governing Body Training & Education Log | GV-FM-024.txt
GV-FM-025 | Stakeholder Grievance & Feedback Tracking Log | GV-FM-025.txt
HR-FM-001 | Reasonable Suspicion Observation Checklist | HR-FM-001.txt
HR-FM-002 | Drug/Alcohol Test Result Action Form | HR-FM-002.txt
HR-FM-003 | Interview & Applicant Evaluation Form | HR-FM-003.txt
HR-FM-004 | Employee Reference Check Log | HR-FM-004.txt
HR-FM-005 | OIG/SAM Monthly Exclusion Verification Log | HR-FM-005.txt
HR-FM-006 | License & Cert Primary Source Verification | HR-FM-006.txt
HR-FM-007 | New Hire Onboarding & Orientation Checklist | HR-FM-007.txt
HR-FM-008 | Annual Performance Evaluation Form | HR-FM-008.txt
HR-FM-009 | Progressive Disciplinary Action Form | HR-FM-009.txt
HR-FM-010 | Employee Grievance / Complaint Form | HR-FM-010.txt
HR-FM-011 | Employee Exit Interview Form | HR-FM-011.txt
HR-FM-012 | TB Screening & Questionnaire | HR-FM-012.txt
HR-FM-013 | Hepatitis B Vaccine Declination Form | HR-FM-013.txt
HR-FM-014 | Employee Health & Occupational Injury Report | HR-FM-014.txt
HR-FM-015 | Personnel File Content Audit Checklist | HR-FM-015.txt
HR-FM-016 | Clinical Staff Competency Validation Checklist | HR-FM-016.txt
HR-FM-017 | Training Attendance & Completion Roster | HR-FM-017.txt
HR-FM-018 | Background Check Authorization & Summary | HR-FM-018.txt
HR-FM-019 | Staff Scheduling & Availability Form | HR-FM-019.txt
HR-FM-020 | Contractor / Per Diem Onboarding Checklist | HR-FM-020.txt
HR-FM-021 | Annual Immunization & Health Screening Log | HR-FM-021.txt
HR-FM-022 | OSHA 300 Injury & Illness Log | HR-FM-022.txt
HR-FM-023 | Workplace Safety Incident Report | HR-FM-023.txt
HR-FM-024 | CEU / Training Exception Request | HR-FM-024.txt
HR-FM-025 | Student / Intern Supervision Agreement | HR-FM-025.txt
HR-FM-026 | Volunteer Service Agreement | HR-FM-026.txt
HR-FM-027 | Expense Reimbursement Request | HR-FM-027.txt
HR-FM-028 | Remote Work / Telehealth Agreement | HR-FM-028.txt
HR-FM-029 | Anti-Harassment Policy Acknowledgment | HR-FM-029.txt
HR-FM-030 | Emergency Preparedness Drill Participation Log | HR-FM-030.txt
HR-FM-031 | Job Description Acknowledgment Form | HR-FM-031.txt
HR-FM-032 | Corrective Action Plan (Employee) | HR-FM-032.txt
HR-FM-033 | Mandatory Reporter Attestation | HR-FM-033.txt
HR-FM-034 | HR Audit Readiness Checklist | HR-FM-034.txt
HR-FM-035 | Workforce Diversity & Inclusion Action Plan | HR-FM-035.txt
HR-FM-036 | Post-Incident Psychological Support Referral | HR-FM-036.txt
HR-FM-037 | Confidentiality & Non-Disclosure Agreement | HR-FM-037.txt
HR-FM-038 | Competency Remediation Plan | HR-FM-038.txt
HR-FM-039 | Staff Recognition & Performance Excellence Log | HR-FM-039.txt
HR-FM-040 | Leave of Absence Request (FMLA / CFRA / PDL / ADA) | HR-FM-040.txt
HR-FM-041 | Return-to-Work Clearance | HR-FM-041.txt
HR-FM-042 | Reasonable Accommodation Request (ADA / FEHA) | HR-FM-042.txt
HR-FM-043 | ADA / FEHA Interactive Process Log | HR-FM-043.txt
HR-FM-044 | Fitness-for-Duty / Functional Capacity Review | HR-FM-044.txt
HR-FM-045 | Accommodation Determination | HR-FM-045.txt
HR-FM-046 | HR Complaint Intake Form (Harassment / Discrimination / Retaliation) | HR-FM-046.txt
HR-FM-047 | Interim Measures Notice | HR-FM-047.txt
HR-FM-048 | HR Investigation Plan | HR-FM-048.txt
HR-FM-049 | Witness Interview Notes Template | HR-FM-049.txt
HR-FM-050 | HR Investigation Report | HR-FM-050.txt
HR-FM-051 | Investigation Closure Letter (to Complainant & Respondent) | HR-FM-051.txt
HR-FM-052 | Employee WC Claim Intake (DWC-1 Support) | HR-FM-052.txt
HR-FM-053 | Employer's Report of Occupational Injury (Form 5020 / State) | HR-FM-053.txt
HR-FM-054 | OSHA 300 / 300A Internal Tracker | HR-FM-054.txt
HR-FM-055 | Separation Intake | HR-FM-055.txt
HR-FM-056 | Asset Return Checklist (Separation) | HR-FM-056.txt
HR-FM-057 | Benefits Exit Packet (COBRA / HIPP / Retirement) | HR-FM-057.txt
HR-FM-058 | Exit Interview | HR-FM-058.txt
HR-FM-059 | Worker Classification Determination (Employee vs 1099) | HR-FM-059.txt
HR-FM-060 | Reclassification Action | HR-FM-060.txt
HR-FM-061 | Meal Period Attestation (CA Non-Exempt) | HR-FM-061.txt
HR-FM-062 | Overtime Authorization | HR-FM-062.txt
HR-FM-063 | Wage Complaint Intake | HR-FM-063.txt
HR-JD-000 | Job Description â€” Governing Body Structure & Responsibilities | HR-JD-000.txt
HR-JD-001 | Job Description â€” Administrator | HR-JD-001.txt
HR-JD-002 | Job Description â€” Administrator Designee | HR-JD-002.txt
HR-JD-003 | Job Description â€” Director of Nursing / Clinical Manager | HR-JD-003.txt
HR-JD-004 | Job Description â€” Clinical Designee | HR-JD-004.txt
HR-JD-005 | Job Description â€” Registered Nurse (RN) | HR-JD-005.txt
HR-JD-006 | Job Description â€” Licensed Vocational Nurse (LVN) | HR-JD-006.txt
HR-JD-007 | Job Description â€” Home Health Aide (HHA) | HR-JD-007.txt
HR-JD-008 | Job Description â€” Medical Social Worker (MSW) | HR-JD-008.txt
HR-JD-009 | Job Description â€” Physical Therapist (PT) | HR-JD-009.txt
HR-JD-010 | Job Description â€” Occupational Therapist (OT) | HR-JD-010.txt
HR-JD-011 | Job Description â€” Speech-Language Pathologist (SLP) | HR-JD-011.txt
CL-FM-001 | Start of Care (SOC) Comprehensive Assessment | CL-FM-001.txt
CL-FM-002 | OASIS-E1 Assessment Form | CL-FM-002.txt
CL-FM-003 | Recertification / ROC Assessment | CL-FM-003.txt
CL-FM-004 | Discharge / Transfer Assessment | CL-FM-004.txt
CL-FM-005 | Plan of Care (485 Form) | CL-FM-005.txt
CL-FM-006 | Physician Orders Sheet | CL-FM-006.txt
CL-FM-007 | Verbal Order Log | CL-FM-007.txt
CL-FM-008 | Physician Order Signature Tracking Log | CL-FM-008.txt
CL-FM-009 | Homebound Status Determination Checklist | CL-FM-009.txt
CL-FM-010 | Face-to-Face Encounter Documentation | CL-FM-010.txt
CL-FM-011 | Missed Visit Documentation Form | CL-FM-011.txt
CL-FM-012 | Visit Frequency Compliance Tracking Log | CL-FM-012.txt
CL-FM-013 | Clinical Skilled Note â€” RN | CL-FM-013.txt
CL-FM-014 | Clinical Skilled Note â€” PT/OT/SLP | CL-FM-014.txt
CL-FM-015 | Home Health Aide Visit Record | CL-FM-015.txt
CL-FM-016 | HHA Competency Evaluation Checklist | CL-FM-016.txt
CL-FM-017 | Wound Assessment & Care Flow Sheet | CL-FM-017.txt
CL-FM-018 | Medication Administration Record (MAR) | CL-FM-018.txt
CL-FM-019 | Medication Reconciliation Worksheet | CL-FM-019.txt
CL-FM-020 | Fall Risk Assessment Tool | CL-FM-020.txt
CL-FM-021 | Infection Control Precautions Checklist | CL-FM-021.txt
CL-FM-022 | Patient Education Documentation Record | CL-FM-022.txt
CL-FM-023 | Diabetic Management Flow Sheet | CL-FM-023.txt
CL-FM-024 | Cardiac & Respiratory Monitoring Log | CL-FM-024.txt
CL-FM-025 | Telehealth Service Consent & Documentation | CL-FM-025.txt
CL-FM-026 | Pain Assessment Scale & Management Log | CL-FM-026.txt
CL-FM-027 | Patient Rights & Responsibilities Acknowledgment | CL-FM-027.txt
CL-FM-028 | Advance Directive Documentation & Review | CL-FM-028.txt
CL-FM-029 | Informed Consent Form | CL-FM-029.txt
CL-FM-030 | Abuse / Neglect Incident Report | CL-FM-030.txt
CL-FM-031 | OASIS Pre-Submission QA Checklist | CL-FM-031.txt
CL-FM-032 | OASIS Coding Decision Worksheet | CL-FM-032.txt
CL-FM-033 | Late Entry / Amendment Documentation Form | CL-FM-033.txt
CL-FM-034 | Clinical Record Completion Audit Checklist | CL-FM-034.txt
CL-FM-035 | Coordination of Care Communication Log | CL-FM-035.txt
CL-FM-036 | Transfer / Discharge Summary | CL-FM-036.txt
CL-FM-037 | Palliative / End-of-Life Care Plan | CL-FM-037.txt
CL-FM-038 | Behavioral Health Screening Tool | CL-FM-038.txt
CL-FM-039 | Pediatric Clinical Assessment Form | CL-FM-039.txt
CL-FM-040 | IV / Infusion Therapy Monitoring Log | CL-FM-040.txt
CL-FM-041 | Medical Social Work Assessment & Plan | CL-FM-041.txt
CL-FM-042 | Supervisory Visit Documentation (RN) | CL-FM-042.txt
CL-FM-043 | Emergency Preparedness Clinical Protocol | CL-FM-043.txt
CL-FM-044 | Physician Recertification Tracking Log | CL-FM-044.txt
CL-FM-045 | OASIS Transmission Confirmation Log | CL-FM-045.txt
CL-FM-046 | Patient / Family Caregiver Training Record | CL-FM-046.txt
CL-FM-047 | High-Risk Patient Monitoring Protocol | CL-FM-047.txt
CL-FM-048 | Inclement Weather Service Delay Documentation | CL-FM-048.txt
CL-FM-049 | Patient Complaint / Grievance Documentation | CL-FM-049.txt
CL-FM-050 | Documentation Source Evidence Matrix | CL-FM-050.txt
CL-FM-051 | Clinician Competency Validation â€” OASIS | CL-FM-051.txt
CL-FM-052 | Restraint-Free Environment Attestation | CL-FM-052.txt
CL-FM-053 | Multi-Disciplinary Care Conference Notes | CL-FM-053.txt
CL-FM-054 | Episode Management Milestone Tracker | CL-FM-054.txt
CL-FM-055 | Prior Authorization Request Log | CL-FM-055.txt
CL-FM-056 | Standardized Assessment Tool Administration Checklist | CL-FM-056.txt
CL-FM-057 | Active POC Change Notification Log | CL-FM-057.txt
CO-FM-001 | Annual Compliance Program Attestation | CO-FM-001.txt
CO-FM-002 | Code of Conduct Acknowledgment Form | CO-FM-002.txt
CO-FM-003 | Compliance Hotline Submission Form | CO-FM-003.txt
CO-FM-004 | Compliance Concern / Allegation Log | CO-FM-004.txt
CO-FM-005 | Internal Compliance Audit Work Program | CO-FM-005.txt
CO-FM-006 | Survey / Inspection Readiness Self-Assessment | CO-FM-006.txt
CO-FM-007 | Survey / Inspection Findings Tracking Log | CO-FM-007.txt
CO-FM-008 | Plan of Correction (PoC) Template | CO-FM-008.txt
CO-FM-009 | Regulatory Change Impact Assessment | CO-FM-009.txt
CO-FM-010 | Anti-Kickback Attestation Form | CO-FM-010.txt
CO-FM-011 | Physician Relationship / Referral Disclosure | CO-FM-011.txt
CO-FM-012 | FWA Training Completion Log | CO-FM-012.txt
CO-FM-013 | HIPAA Workforce Training Log | CO-FM-013.txt
CO-FM-014 | Breach Risk Assessment Worksheet | CO-FM-014.txt
CO-FM-015 | HIPAA Breach Notification Letter Template | CO-FM-015.txt
CO-FM-016 | Business Associate Agreement Template | CO-FM-016.txt
CO-FM-017 | BAA Tracking Register | CO-FM-017.txt
CO-FM-018 | Patient Authorization to Release PHI | CO-FM-018.txt
CO-FM-019 | Notice of Privacy Practices (NPP) Delivery Log | CO-FM-019.txt
CO-FM-020 | Records Retention & Destruction Schedule | CO-FM-020.txt
CO-FM-021 | Documentation Alignment Audit Tool | CO-FM-021.txt
CO-FM-022 | Audit Trail Review Report | CO-FM-022.txt
CO-FM-023 | Documentation Deficiency Tracking Log | CO-FM-023.txt
CO-FM-024 | Compliance Committee Meeting Minutes | CO-FM-024.txt
CO-FM-025 | Workforce Exclusion Screening Log | CO-FM-025.txt
CO-FM-026 | HIPAA Security Risk Analysis Template | CO-FM-026.txt
CO-FM-027 | Vendor PHI Risk Assessment Worksheet | CO-FM-027.txt
CO-FM-028 | Incident Containment & Eradication Log | CO-FM-028.txt
CO-FM-029 | Minimum Necessary Exception Request | CO-FM-029.txt
CO-FM-030 | OIG Self-Disclosure Protocol Checklist | CO-FM-030.txt
CO-FM-031 | AI Tool Use Request & Approval Form | CO-FM-031.txt
CO-FM-032 | Annual Internal Audit Calendar | CO-FM-032.txt
CO-FM-033 | Sanctions & Enforcement Response Tracker | CO-FM-033.txt
CO-FM-034 | Medicare CoP Compliance Verification Checklist | CO-FM-034.txt
CO-FM-035 | State Licensure Renewal Tracking Log | CO-FM-035.txt
CO-FM-036 | Accreditation Standards Gap Analysis Tool | CO-FM-036.txt
CO-FM-037 | FWA Risk Stratification Matrix | CO-FM-037.txt
CO-FM-038 | Documentation Correction & Amendment Audit Log | CO-FM-038.txt
CO-FM-039 | AI System Impact Assessment Template | CO-FM-039.txt
QA-FM-001 | QAPI Committee Meeting Minutes Template | QA-FM-001.txt
QA-FM-002 | Performance Improvement Project (PIP) Charter | QA-FM-002.txt
QA-FM-003 | Quality Indicator Monthly Dashboard | QA-FM-003.txt
QA-FM-004 | Adverse Event Root Cause Analysis (RCA) Worksheet | QA-FM-004.txt
QA-FM-005 | Corrective Action Plan (CAP) Tracking Tool | QA-FM-005.txt
QA-FM-006 | Infection Control Line List & Surveillance Log | QA-FM-006.txt
QA-FM-007 | LUPA Prevention & Visit Utilization Log | QA-FM-007.txt
QA-FM-008 | Patient Satisfaction Survey (HHCAHPS) Proxy | QA-FM-008.txt
QA-FM-009 | Star Rating Improvement Action Plan | QA-FM-009.txt
QA-FM-010 | QAPI Self-Assessment Annual Checklist | QA-FM-010.txt
QA-FM-011 | Outcome Benchmarking Comparison Report | QA-FM-011.txt
QA-FM-012 | Policy Effectiveness Monitoring Worksheet | QA-FM-012.txt
QA-FM-013 | Patient Safety Event Communication Log | QA-FM-013.txt
FN-FM-001 | Daily Claims Submission & Acceptance Log | FN-FM-001.txt
FN-FM-002 | Claim Denial & Appeal Tracking Log | FN-FM-002.txt
FN-FM-003 | Request for Anticipated Payment (RAP) Tracking Log | FN-FM-003.txt
FN-FM-004 | Patient Financial Responsibility Agreement | FN-FM-004.txt
FN-FM-005 | Credit Card / Auto-Pay Authorization Form | FN-FM-005.txt
FN-FM-006 | Overpayment Identification & Refund Log | FN-FM-006.txt
FN-FM-007 | Bad Debt & Charity Care Application | FN-FM-007.txt
FN-FM-008 | Pre-Claim Review (PCR) Checklist | FN-FM-008.txt
FN-FM-009 | Episode Financial Performance Analysis | FN-FM-009.txt
FN-FM-010 | PDGM LUPA Mitigation Tracker | FN-FM-010.txt
FN-FM-011 | Revenue Cycle KPI Dashboard | FN-FM-011.txt
FN-FM-012 | Supply & Equipment Purchase Request Log | FN-FM-012.txt
FN-FM-013 | Charge Capture Audit & Fee Schedule Review | FN-FM-013.txt
FN-FM-014 | Finance Committee Meeting Minutes | FN-FM-014.txt
FN-FM-015 | Audit Committee Meeting Minutes | FN-FM-015.txt
FN-FM-016 | ADR (Additional Documentation Request) Response Tracker | FN-FM-016.txt
FN-FM-017 | ADR Review Checklist (Clinical Documentation QA) | FN-FM-017.txt
FN-FM-018 | Quarterly Credit Balance Report (CMS-838) | FN-FM-018.txt
FN-FM-019 | Refund Transmittal | FN-FM-019.txt
FN-FM-020 | Overpayment Identification Worksheet (60-Day Rule) | FN-FM-020.txt
FN-FM-021 | Statistical Extrapolation Worksheet | FN-FM-021.txt
FN-FM-022 | Overpayment Quantification Summary | FN-FM-022.txt
FN-FM-023 | Self-Disclosure Decision Memo | FN-FM-023.txt
FN-FM-024 | Finance Corrective Action Plan (Post-Audit / Post-Overpayment) | FN-FM-024.txt
FN-FM-025 | AR Aging Report | FN-FM-025.txt
FN-FM-026 | Bad Debt Review & Write-Off Form | FN-FM-026.txt
FN-FM-027 | Financial Assistance / Charity Care Application | FN-FM-027.txt
FN-FM-028 | Charity Determination & Notification | FN-FM-028.txt
IT-FM-001 | User Access Request & Authorization Form | IT-FM-001.txt
IT-FM-002 | System Access Revocation Checklist | IT-FM-002.txt
IT-FM-003 | IT Hardware Asset & Disposal Log | IT-FM-003.txt
IT-FM-004 | Software & Application License Register | IT-FM-004.txt
IT-FM-005 | BYOD (Bring Your Own Device) Agreement | IT-FM-005.txt
IT-FM-006 | Internet & Email Acceptable Use Agreement | IT-FM-006.txt
IT-FM-007 | Social Media Policy Acknowledgment | IT-FM-007.txt
IT-FM-008 | Data Backup & Restore Testing Log | IT-FM-008.txt
IT-FM-009 | IT Security Incident Report Form | IT-FM-009.txt
IT-FM-010 | System Change Management Request (CMR) Form | IT-FM-010.txt
IT-FM-011 | Information Security Risk Assessment (SRA) Template | IT-FM-011.txt
IT-FM-012 | Privileged Access User (PAU) Agreement | IT-FM-012.txt
IT-FM-013 | Encryption Exception Request Form | IT-FM-013.txt
IT-FM-014 | Firewall Rule Change Authorization Form | IT-FM-014.txt
IT-FM-015 | VPN / Remote Access Request Form | IT-FM-015.txt
IT-FM-016 | Endpoint Malware Infection Log | IT-FM-016.txt
IT-FM-017 | Data Classification & Handling Matrix | IT-FM-017.txt
IT-FM-018 | Disaster Recovery Tabletop Exercise Report | IT-FM-018.txt
IT-FM-019 | Audit Log Review Checklist | IT-FM-019.txt
IT-FM-020 | Cloud Service Provider Security Questionnaire | IT-FM-020.txt
IT-FM-021 | EHR Downtime Communication Protocol Checklist | IT-FM-021.txt
IT-FM-022 | EHR Access Audit Log | IT-FM-022.txt
IT-FM-023 | Server Room / MDF Physical Access Log | IT-FM-023.txt
IT-FM-024 | IT Media & Storage Device Destruction Certificate | IT-FM-024.txt
IT-FM-025 | Remote Device Wipe Authorization Form | IT-FM-025.txt
IT-FM-026 | Phishing Simulation Campaign Report | IT-FM-026.txt
IT-FM-027 | Security Awareness Training Completion Roster | IT-FM-027.txt
IT-FM-028 | IT Vendor Due Diligence Checklist | IT-FM-028.txt
IT-FM-029 | Penetration Testing & Vulnerability Report | IT-FM-029.txt
IT-FM-030 | Cloud Data Sovereignty & Compliance Declaration | IT-FM-030.txt
IT-FM-031 | IT / Security Committee Meeting Minutes | IT-FM-031.txt
IT-FM-032 | Post-Incident Corrective Action Plan (IT/Security) | IT-FM-032.txt
IT-FM-033 | Mobile Access Request & BYOD Agreement | IT-FM-033.txt
IT-FM-034 | Removable Media Exception & Tracking | IT-FM-034.txt
IT-FM-035 | Vulnerability Scan Report | IT-FM-035.txt
IT-FM-036 | Device Sanitization & Patch Exception Record (NIST 800-88) | IT-FM-036.txt
IT-FM-037 | Change Request Form | IT-FM-037.txt
IT-FM-038 | Change Advisory Board (CAB) Meeting Minutes | IT-FM-038.txt
IT-FM-039 | Post-Implementation Review (Change) | IT-FM-039.txt
IT-FM-040 | Vendor Security Assessment Questionnaire | IT-FM-040.txt
IT-FM-041 | Vendor Attestation Review (SOC 2 / HITRUST / ISO / Pen Test) | IT-FM-041.txt
IT-FM-042 | Email Security Configuration Register (Anti-Phishing / DMARC / DLP / Encryption) | IT-FM-042.txt
IT-FM-043 | Phishing Simulation Report | IT-FM-043.txt
IT-FM-044 | Paper PHI Shredding Log | IT-FM-044.txt
IT-FM-045 | Badge Assignment & Facility Access Log | IT-FM-045.txt
IT-FM-046 | Visitor Log | IT-FM-046.txt
IT-FM-047 | Data Subject Request Intake (HIPAA / CMIA / CCPA / CPRA) | IT-FM-047.txt
IT-FM-048 | Data Extract Log | IT-FM-048.txt
IT-FM-049 | CCPA / CPRA Response Letter | IT-FM-049.txt
OP-FM-001 | Branch Registration Tracker | OP-FM-001.txt
OP-FM-002 | Quarterly Facility Inspection Report | OP-FM-002.txt
OP-FM-003 | Vendor Request Form | OP-FM-003.txt
OP-FM-004 | Vendor Qualification Checklist | OP-FM-004.txt
OP-FM-005 | Approved Vendor List | OP-FM-005.txt
OP-FM-006 | Vendor Performance Issue Log | OP-FM-006.txt
OP-FM-007 | Vendor Performance Evaluation Form | OP-FM-007.txt
OP-FM-008 | Vendor Corrective Action Notice | OP-FM-008.txt
OP-FM-009 | Emergency Procurement Authorization | OP-FM-009.txt
OP-FM-010 | Incoming Mail Log | OP-FM-010.txt
OP-FM-011 | Time-Sensitive Tracking Log | OP-FM-011.txt
OP-FM-012 | Outgoing Mail Log | OP-FM-012.txt
OP-FM-013 | Standard Fax Cover Sheet | OP-FM-013.txt
OP-FM-014 | Patient Intake Information Sheet | OP-FM-014.txt
OP-FM-015 | Non-Admit / Referral Rejection Log | OP-FM-015.txt
OP-FM-016 | Vehicle Mileage & Safety Inspection Log | OP-FM-016.txt
OP-FM-017 | Patient Property & Belongings Inventory | OP-FM-017.txt
OP-FM-018 | Interpreter Service Utilization Log | OP-FM-018.txt
OP-FM-019 | Scheduling Conflict & Resolution Log | OP-FM-019.txt
OP-FM-020 | After-Hours On-Call Activity Log | OP-FM-020.txt
RM-FM-001 | Hazard Vulnerability Analysis (HVA) Worksheet | RM-FM-001.txt
RM-FM-002 | EMT Emergency Contact Card | RM-FM-002.txt
RM-FM-003 | Emergency Quick Reference Guide | RM-FM-003.txt
RM-FM-004 | EP Exercise Documentation Form | RM-FM-004.txt
RM-FM-005 | After-Action Review (AAR) Form | RM-FM-005.txt
RM-FM-006 | Pandemic Plan Readiness Checklist | RM-FM-006.txt
RM-FM-007 | Patient Priority Classification Matrix | RM-FM-007.txt
RM-FM-008 | Enterprise Risk Register | RM-FM-008.txt
RM-FM-009 | Workplace Violence Incident Report | RM-FM-009.txt
RM-FM-010 | Hazardous Materials (SDS) Inventory | RM-FM-010.txt
RM-FM-011 | Equipment Safety Recall Log | RM-FM-011.txt
RM-FM-012 | High-Risk Medication Double-Check Log | RM-FM-012.txt
RM-FM-013 | Cal/OSHA IIPP Hazard Identification Checklist | RM-FM-013.txt
RM-FM-014 | Cal/OSHA Hazard Correction Record | RM-FM-014.txt
RM-FM-015 | Litigation & Claims Register | RM-FM-015.txt
RM-FM-016 | Annual Risk Reassessment Report | RM-FM-016.txt
RM-FM-017 | Risk Committee Meeting Minutes | RM-FM-017.txt
RM-FM-018 | Safety Committee Meeting Minutes (IIPP / SB 553) | RM-FM-018.txt

---

## SOURCE: Builder\Forns\FORMS_SOURCE_MAP.txt

Forms Library taxonomy and documents source files:
- src/policy/data/formsLibraryDataset.ts (all form records used by FormsPage taxonomy)
- src/policy/data/formsLibraryContent.ts (core content builder and EN/GV overrides)
- src/policy/data/formsLibraryContentHR_CL.ts (HR + CL overrides)
- src/policy/data/formsLibraryContentCO_More.ts (CO + QA + FN + IT + OP + RM overrides)
- src/policy/components/FormViewer.tsx (renders detailed form documents from buildFormContent)

Total records exported: 281

---

## SOURCE: Builder\Forns\GV-FM-001.txt

FORM ID: GV-FM-001
TITLE: Agency Closure / Change of Ownership Checklist
TYPE: Checklist
DOMAIN: GV
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, audit_critical

LINKED POLICIES:
- GV-EA-005

PURPOSE:
Control checklist governing the orderly closure, sale, merger, or change of ownership of Care Indeed Home Health Care, Inc., ensuring patient continuity-of-care, record retention, and regulatory notifications.

INSTRUCTIONS:
Initiated at least 90 calendar days prior to any closure or change-of-ownership event. Each task shall be dated and initialed by the responsible leader.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Agency Closure / Change of Ownership Checklist Checklist
layout: checklist

checklist_items:
- Governing Body resolution approving closure / CHOW
- Notice filed with CDPH Licensing & Certification â‰¥ 30 days in advance
- CMS Form 855A/855R submitted to MAC
- State Medicaid agency notified in writing
- All active patients given â‰¥ 15 day written notice and continuity-of-care plan
- Transferring agency identified for all active episodes
- Medical records transfer / retention plan executed
- OASIS transmission final run completed
- Final claim submission cycle closed
- Workforce separation notices issued per WARN Act if applicable
- IRS / SSA / state tax filings finalized
- Business Associate Agreements terminated or transferred
- Bank accounts, credit lines, and vendor contracts closed
- Physical records secured; electronic records archived for 7 years (HIPAA)
- Final report submitted to Governing Body and filed in Governance record

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Governing Body Chair â€” Printed Name (type=text, col=2)
- Governing Body Chair â€” Signature (type=signature, col=1)
- Governing Body Chair â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-001 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-EA-005

---

## SOURCE: Builder\Forns\GV-FM-002.txt

FORM ID: GV-FM-002
TITLE: Agency Credential & Licensure Register
TYPE: Tracking Tool
DOMAIN: GV
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise, audit_critical

LINKED POLICIES:
- GV-EA-005
- GV-EA-004

PURPOSE:
Master register of every agency-level credential and licensure (CMS certification, CDPH license, state business licenses, DEA, accreditation, NPI, tax IDs) with number, issue/expiry dates, and renewal ownership.

INSTRUCTIONS:
Maintained by the Administrator. Expirations within 120 days trigger a renewal work order. Verified at each quarterly Compliance Committee meeting.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Credential Type
- Issuing Authority
- Number
- Issue Date
- Expiry Date
- Renewal Owner
- Status
- Evidence File
table_row_count: 12

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-002 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-EA-005, GV-EA-004

---

## SOURCE: Builder\Forns\GV-FM-003.txt

FORM ID: GV-FM-003
TITLE: Official Agency Organizational Chart
TYPE: Worksheet
DOMAIN: GV
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: master_template, audit_critical

LINKED POLICIES:
- GV-GB-001
- GV-OG-001

PURPOSE:
Official agency organizational chart establishing reporting relationships from the Governing Body through senior clinical and administrative leadership as required by 42 CFR Â§ 484.105.

INSTRUCTIONS:
Updated within 7 calendar days of any reorganization or leadership change. Posted in the Administrator's office and included in every surveyor packet.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Organizational Chart Version (type=text, required=true, col=2)
- Effective Date (type=date, required=true, col=2)
- Governing Body Chair (type=text, col=2)
- Administrator (type=text, col=2)
- Clinical Manager / DON (type=text, col=2)
- Compliance Officer (type=text, col=2)
- Reporting Lines Narrative (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)
- Governing Body Chair â€” Printed Name (type=text, col=2)
- Governing Body Chair â€” Signature (type=signature, col=1)
- Governing Body Chair â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-003 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-001, GV-OG-001

---

## SOURCE: Builder\Forns\GV-FM-004.txt

FORM ID: GV-FM-004
TITLE: Governing Body Meeting Agenda Template
TYPE: Template
DOMAIN: GV
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: master_template

LINKED POLICIES:
- GV-GB-001
- GV-GB-002

PURPOSE:
Standardized agenda template for all Governing Body meetings ensuring coverage of statutory topics (QAPI report, compliance report, clinical outcomes, finances, risk, administrator report).

INSTRUCTIONS:
Distributed to all Governing Body members at least 5 business days in advance of each meeting. Final agenda archived with meeting minutes.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Meeting Date / Time / Location (type=text, required=true, col=4)
- Meeting Type (Regular / Special / Executive) (type=select, col=2, options=[Regular | Special | Executive Session])
- Chair (type=text, col=2)
- Invited Attendees (type=textarea, col=4)
- Agenda Item 1 (type=text, col=4)
- Agenda Item 2 (type=text, col=4)
- Agenda Item 3 (type=text, col=4)
- Agenda Item 4 (type=text, col=4)
- Agenda Item 5 (type=text, col=4)
- Additional Items (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Chair â€” Printed Name (type=text, col=2)
- Chair â€” Signature (type=signature, col=1)
- Chair â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-004 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-001, GV-GB-002

---

## SOURCE: Builder\Forns\GV-FM-005.txt

FORM ID: GV-FM-005
TITLE: Governing Body Meeting Minutes Template
TYPE: Template
DOMAIN: GV
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- GV-GB-001
- GV-GB-002

PURPOSE:
Meeting minutes template capturing attendees, discussions, decisions, motions, votes, and action items for every Governing Body meeting, retained permanently.

INSTRUCTIONS:
Recorder produces a draft within 5 business days; approved at the next meeting. Minutes are maintained in the Governance record.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Meeting Date (type=date, required=true, col=2)
- Recorder (type=text, required=true, col=2)
- Members Present (type=textarea, col=4)
- Members Absent (type=textarea, col=4)
- Quorum Confirmed? (Y/N) (type=select, col=2, options=[Yes | No])
- Approval of Prior Minutes (type=textarea, col=4)
- Discussion Summary (type=textarea, col=4)
- Motions / Votes (type=textarea, col=4)
- Action Items (Owner / Due) (type=textarea, col=4)
- Adjournment Time (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Chair â€” Printed Name (type=text, col=2)
- Chair â€” Signature (type=signature, col=1)
- Chair â€” Date (type=date, col=1)
- Recorder â€” Printed Name (type=text, col=2)
- Recorder â€” Signature (type=signature, col=1)
- Recorder â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-005 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-001, GV-GB-002

---

## SOURCE: Builder\Forns\GV-FM-006.txt

FORM ID: GV-FM-006
TITLE: Conflict of Interest Disclosure Form
TYPE: Attestation
DOMAIN: GV
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, digital_candidate

LINKED POLICIES:
- GV-GB-001
- GV-GB-003

PURPOSE:
Conflict of interest disclosure completed by every Governing Body member, officer, and senior leader to identify and manage actual, potential, or perceived conflicts.

INSTRUCTIONS:
Completed at appointment, annually, and within 7 days of any change in circumstances. Disclosed conflicts are reviewed by the Governance & Audit Committee.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I hereby certify that:

acknowledgments:
- The information provided is true, complete, and accurate to the best of my knowledge.
- I understand my ongoing obligation to disclose any new conflict within 7 calendar days of becoming aware.
- I will recuse myself from any deliberation or vote on matters in which I have a disclosed conflict.
- I have read and agree to abide by the Code of Conduct and Conflict of Interest Policy.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Disclosing Party â€” Printed Name (type=text, col=2)
- Disclosing Party â€” Signature (type=signature, col=1)
- Disclosing Party â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-006 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-001, GV-GB-003

---

## SOURCE: Builder\Forns\GV-FM-007.txt

FORM ID: GV-FM-007
TITLE: Administrator Delegation of Authority Agreement
TYPE: Form
DOMAIN: GV
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, audit_critical

LINKED POLICIES:
- GV-GB-001
- GV-OG-005

PURPOSE:
Formal written delegation of specific operational authorities from the Governing Body or Administrator to a designated individual, with effective date, scope, duration, and revocation provisions.

INSTRUCTIONS:
Executed for any delegation lasting more than 10 business days. Retained in the Governance record and referenced on GV-FM-017 Delegation Log.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Delegating Authority (Role) (type=text, required=true, col=2)
- Delegate (Name / Role) (type=text, required=true, col=2)
- Effective Start Date (type=date, required=true, col=2)
- Effective End Date (type=date, col=2)
- Specific Authorities Delegated (type=textarea, required=true, col=4)
- Limitations on Delegated Authority (type=textarea, col=4)
- Reporting Expectations (type=textarea, col=4)
- Revocation Conditions (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Delegating Authority â€” Printed Name (type=text, col=2)
- Delegating Authority â€” Signature (type=signature, col=1)
- Delegating Authority â€” Date (type=date, col=1)
- Delegate â€” Printed Name (type=text, col=2)
- Delegate â€” Signature (type=signature, col=1)
- Delegate â€” Date (type=date, col=1)
- Witness â€” Printed Name (type=text, col=2)
- Witness â€” Signature (type=signature, col=1)
- Witness â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-007 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-001, GV-OG-005

---

## SOURCE: Builder\Forns\GV-FM-008.txt

FORM ID: GV-FM-008
TITLE: Governing Body Annual Self-Assessment Tool
TYPE: Assessment
DOMAIN: GV
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- GV-GB-001
- GV-GB-005

PURPOSE:
Annual self-assessment tool used by the Governing Body to evaluate its own effectiveness, composition, knowledge, and statutory performance.

INSTRUCTIONS:
Administered to each member at least annually. Results are aggregated by the Chair and reviewed in a dedicated session; action plan documented.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Subject / Patient / Area Assessed (type=text, col=4)
- Assessment Date (type=date, col=2)
- Overall Risk Rating (type=select, col=2, options=[Low | Moderate | High])
- Findings Summary (type=textarea, col=4)
- Strengths Identified (type=textarea, col=4)
- Opportunities for Improvement (type=textarea, col=4)
- Recommended Action Plan (type=textarea, col=4)
- Follow-Up Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-008 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-001, GV-GB-005

---

## SOURCE: Builder\Forns\GV-FM-009.txt

FORM ID: GV-FM-009
TITLE: Annual Strategic Planning Worksheet
TYPE: Worksheet
DOMAIN: GV
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- GV-OG-004

PURPOSE:
Documentation of the agency's annual strategic planning process, including mission/vision review, SWOT analysis, goals, KPIs, and resource allocation.

INSTRUCTIONS:
Completed annually by the Governing Body with input from senior leadership. Approved goals cascade to QAPI and operational plans.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Planning Year (type=text, required=true, col=2)
- Facilitator (type=text, col=2)
- Mission / Vision Review Notes (type=textarea, col=4)
- Strengths (type=textarea, col=4)
- Weaknesses (type=textarea, col=4)
- Opportunities (type=textarea, col=4)
- Threats (type=textarea, col=4)
- Top 3-5 Strategic Goals (type=textarea, col=4)
- Key KPIs & Targets (type=textarea, col=4)
- Resource / Budget Commitments (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Chair â€” Printed Name (type=text, col=2)
- Chair â€” Signature (type=signature, col=1)
- Chair â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-009 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-OG-004

---

## SOURCE: Builder\Forns\GV-FM-010.txt

FORM ID: GV-FM-010
TITLE: Legal Counsel Engagement Authorization
TYPE: Form
DOMAIN: GV
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- GV-EA-003

PURPOSE:
Authorizes the engagement of external legal counsel for a specific matter, documenting scope, budget, and conflict check.

INSTRUCTIONS:
Completed by the Administrator for any non-routine legal engagement. Approved by the Governing Body for engagements > $25,000.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Matter / Engagement Title (type=text, required=true, col=4)
- Law Firm / Attorney (type=text, required=true, col=2)
- Proposed Fee Structure (type=text, col=2)
- Scope of Work (type=textarea, col=4)
- Conflict Check Completed? (Y/N) (type=select, col=2, options=[Yes | No])
- Estimated Budget (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)
- Governing Body Chair â€” Printed Name (type=text, col=2)
- Governing Body Chair â€” Signature (type=signature, col=1)
- Governing Body Chair â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-010 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-EA-003

---

## SOURCE: Builder\Forns\GV-FM-011.txt

FORM ID: GV-FM-011
TITLE: Governing Body Roster & Contact Matrix
TYPE: Tracking Tool
DOMAIN: GV
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- GV-GB-001

PURPOSE:
Contact matrix and roster of every current Governing Body member, including preferred contact information, emergency contact, and competency areas.

INSTRUCTIONS:
Maintained by the Chair's office. Used for emergency convening, voting actions, and surveyor reference. Updated within 3 business days of any change.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Member Name
- Role
- Voting Status
- Primary Phone
- Email
- Emergency Contact
- Competency Area
table_row_count: 10

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-011 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-001

---

## SOURCE: Builder\Forns\GV-FM-012.txt

FORM ID: GV-FM-012
TITLE: Executive Session Confidentiality Agreement
TYPE: Attestation
DOMAIN: GV
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- GV-GB-002

PURPOSE:
Confidentiality acknowledgment executed prior to any Executive Session of the Governing Body, binding attendees to non-disclosure of executive-session deliberations.

INSTRUCTIONS:
Signed by each attendee at the start of every Executive Session. Retained with the Executive Session minutes.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
Prior to participating in this Executive Session, I acknowledge and agree that:

acknowledgments:
- The matters discussed in this Executive Session are confidential and privileged.
- I shall not disclose the substance of the discussion to any person who is not an authorized participant, except as required by law.
- I shall not use any information obtained in this Session for personal benefit or to the detriment of the Agency.
- My obligation of confidentiality continues after my term, role, or relationship with the Agency ends.
- A breach of this agreement may result in removal, legal action, and/or termination of my relationship with the Agency.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Executive Session Attendee â€” Printed Name (type=text, col=2)
- Executive Session Attendee â€” Signature (type=signature, col=1)
- Executive Session Attendee â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-012 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-002

---

## SOURCE: Builder\Forns\GV-FM-013.txt

FORM ID: GV-FM-013
TITLE: Administrator Succession Plan Template
TYPE: Template
DOMAIN: GV
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, audit_critical

LINKED POLICIES:
- GV-GB-004

PURPOSE:
Documented Administrator succession plan ensuring continuity of leadership in the event of planned or unplanned Administrator absence or departure.

INSTRUCTIONS:
Reviewed and updated annually by the Governing Body. Primary and secondary successors identified with readiness assessment.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Current Administrator (type=text, required=true, col=2)
- Plan Version / Date (type=text, required=true, col=2)
- Primary Successor (Name / Role) (type=text, col=2)
- Secondary Successor (type=text, col=2)
- Readiness Assessment (Primary) (type=textarea, col=4)
- Development Plan for Primary Successor (type=textarea, col=4)
- Trigger Events Activating Plan (type=textarea, col=4)
- Communication Plan (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Governing Body Chair â€” Printed Name (type=text, col=2)
- Governing Body Chair â€” Signature (type=signature, col=1)
- Governing Body Chair â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-013 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-004

---

## SOURCE: Builder\Forns\GV-FM-014.txt

FORM ID: GV-FM-014
TITLE: Administrator Qualification Verification Checklist
TYPE: Checklist
DOMAIN: GV
USAGE: Required
FREQUENCY: Upon Hire
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- GV-OG-002

PURPOSE:
Checklist verifying that the Administrator candidate meets every qualification mandated by 42 CFR Â§ 484.105(b) and California state regulation prior to appointment.

INSTRUCTIONS:
Completed by the Governing Body or designee at time of appointment. Original retained in personnel file.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Administrator Qualification Verification Checklist Checklist
layout: checklist

checklist_items:
- Bachelor's degree or higher from accredited institution (verified)
- Minimum 1 year of health service administration experience (verified)
- Knowledge of Medicare Conditions of Participation demonstrated
- Prior operational management experience documented
- OIG / SAM / GSA exclusion check completed â€” not excluded
- State-level administrator or HHA licensure (if applicable)
- Professional references verified (minimum 3)
- Background check completed and acceptable
- Letters of appointment issued and signed by Governing Body
- Orientation to agency policies and procedures completed within 30 days

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Governing Body Chair â€” Printed Name (type=text, col=2)
- Governing Body Chair â€” Signature (type=signature, col=1)
- Governing Body Chair â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-014 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-OG-002

---

## SOURCE: Builder\Forns\GV-FM-015.txt

FORM ID: GV-FM-015
TITLE: Clinical Manager Qualification Checklist
TYPE: Checklist
DOMAIN: GV
USAGE: Required
FREQUENCY: Upon Hire
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- GV-OG-002

PURPOSE:
Checklist verifying Clinical Manager / DON qualifications per 42 CFR Â§ 484.105(c) and California Title 22 requirements prior to designation.

INSTRUCTIONS:
Completed by the Administrator at time of appointment. Original retained in personnel file. Re-verified at each Clinical Manager change.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Clinical Manager Qualification Checklist Checklist
layout: checklist

checklist_items:
- Current, unrestricted California RN license (verified via primary source)
- Minimum 1 year supervisory experience in home health or related setting
- Knowledge of Medicare home health CoPs demonstrated
- Documented clinical competency in home health scope
- OIG / SAM / GSA exclusion check completed â€” not excluded
- Current CPR/BLS certification
- Professional references verified (minimum 3)
- Background check completed and acceptable
- Letter of designation signed by Administrator and Governing Body
- Orientation to clinical policies completed within 30 days

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)
- Governing Body Chair â€” Printed Name (type=text, col=2)
- Governing Body Chair â€” Signature (type=signature, col=1)
- Governing Body Chair â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-015 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-OG-002

---

## SOURCE: Builder\Forns\GV-FM-016.txt

FORM ID: GV-FM-016
TITLE: Scope of Services Definition Matrix
TYPE: Matrix
DOMAIN: GV
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- GV-OG-003

PURPOSE:
Definition matrix describing the scope of services provided by the agency, including disciplines, geographic coverage, payer mix, and any excluded populations or conditions.

INSTRUCTIONS:
Reviewed annually by the Governing Body and updated immediately upon any service-line change. Filed with CDPH as required.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Matrix
layout: table

table_columns:
- Service Line
- Included? (Y/N)
- Discipline
- Geographic Area
- Payer Sources
- Age Range
- Exclusions / Limitations
table_row_count: 12

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-016 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-OG-003

---

## SOURCE: Builder\Forns\GV-FM-017.txt

FORM ID: GV-FM-017
TITLE: Delegation of Authority (DOA) Log
TYPE: Log
DOMAIN: GV
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- GV-OG-005

PURPOSE:
Running log of every delegation of authority (DOA) executed, amended, or rescinded, for audit traceability.

INSTRUCTIONS:
Updated by the Chair's office within 1 business day of any change. Referenced during every internal audit and CMS survey.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- DOA ID
- Delegator
- Delegate
- Authority Delegated
- Effective Date
- End Date
- Status
- Reference Document
table_row_count: 12

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-017 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-OG-005

---

## SOURCE: Builder\Forns\GV-FM-018.txt

FORM ID: GV-FM-018
TITLE: Interagency Agreement / Contract Register
TYPE: Tracking Tool
DOMAIN: GV
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- GV-EA-001

PURPOSE:
Register of every active interagency agreement, service contract, and transfer agreement entered into by Care Indeed.

INSTRUCTIONS:
Maintained by the Administrator. Contracts expiring within 120 days trigger renewal workflow. Quarterly compliance check against BAA and payer requirements.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Contract #
- Counterparty
- Contract Type
- Start Date
- End Date
- Value / Term
- Owner
- BAA Attached?
- Status
table_row_count: 12

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-018 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-EA-001

---

## SOURCE: Builder\Forns\GV-FM-019.txt

FORM ID: GV-FM-019
TITLE: Agency Licensure & Certification Tracking Log
TYPE: Log
DOMAIN: GV
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- GV-EA-004

PURPOSE:
Tracking log for every agency-level license, certification, accreditation, and registration with expiration date and renewal ownership.

INSTRUCTIONS:
Updated as renewals occur. Items within 90 days of expiration are flagged Red on the Compliance Dashboard.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- License / Certification
- Authority
- Number
- Issue Date
- Expiry Date
- Owner
- Status
- Renewal Started
table_row_count: 12

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-019 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-EA-004

---

## SOURCE: Builder\Forns\GV-FM-020.txt

FORM ID: GV-FM-020
TITLE: Media/PR External Communication Request
TYPE: Form
DOMAIN: GV
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- GV-EA-002

PURPOSE:
Controls the review and approval of any external communication (media, PR, social, public statement) representing Care Indeed.

INSTRUCTIONS:
Submitted by the requester to the Administrator at least 5 business days before intended release; legal review required for statements touching regulatory or litigation matters.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Requester Name / Role (type=text, required=true, col=2)
- Intended Release Date (type=date, required=true, col=2)
- Media / Channel (type=text, col=2)
- Topic (type=text, col=2)
- Proposed Content (attach if long) (type=textarea, col=4)
- Involves Patient Info? (Y/N) (type=select, col=2, options=[Yes | No])
- Legal Review Needed? (Y/N) (type=select, col=2, options=[Yes | No])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Requester â€” Printed Name (type=text, col=2)
- Requester â€” Signature (type=signature, col=1)
- Requester â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)
- Legal (if required) â€” Printed Name (type=text, col=2)
- Legal (if required) â€” Signature (type=signature, col=1)
- Legal (if required) â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-020 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-EA-002

---

## SOURCE: Builder\Forns\GV-FM-021.txt

FORM ID: GV-FM-021
TITLE: Board Member Appointment & Resignation Record
TYPE: Form
DOMAIN: GV
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- GV-GB-001

PURPOSE:
Official record of every Governing Body member appointment, reappointment, and resignation, for permanent retention.

INSTRUCTIONS:
Completed at each appointment or resignation event. Filed with the Governance Record; referenced in GV-FM-011 Roster.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Member Name (type=text, required=true, col=2)
- Action (type=select, required=true, col=2, options=[Appointment | Reappointment | Resignation | Removal])
- Effective Date (type=date, required=true, col=2)
- Term End Date (if applicable) (type=date, col=2)
- Reason (for resignation / removal) (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Governing Body Chair â€” Printed Name (type=text, col=2)
- Governing Body Chair â€” Signature (type=signature, col=1)
- Governing Body Chair â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-021 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-001

---

## SOURCE: Builder\Forns\GV-FM-022.txt

FORM ID: GV-FM-022
TITLE: Executive Session Minutes Template
TYPE: Template
DOMAIN: GV
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, master_template

LINKED POLICIES:
- GV-GB-002

PURPOSE:
Specialized minutes template for Executive Sessions of the Governing Body, with enhanced confidentiality and restricted distribution.

INSTRUCTIONS:
Used exclusively for Executive Sessions. Stored separately from regular minutes. Accessible only to attendees, Legal Counsel, and authorized regulators.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Executive Session Date (type=date, required=true, col=2)
- Recorder (type=text, required=true, col=2)
- Attendees (type=textarea, col=4)
- Purpose of Executive Session (type=textarea, required=true, col=4)
- Confidentiality Agreements Signed? (Y/N) (type=select, col=2, options=[Yes | No])
- Discussion Summary (type=textarea, col=4)
- Decisions / Motions (type=textarea, col=4)
- Action Items (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Chair â€” Printed Name (type=text, col=2)
- Chair â€” Signature (type=signature, col=1)
- Chair â€” Date (type=date, col=1)
- Recorder â€” Printed Name (type=text, col=2)
- Recorder â€” Signature (type=signature, col=1)
- Recorder â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-022 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-002

---

## SOURCE: Builder\Forns\GV-FM-023.txt

FORM ID: GV-FM-023
TITLE: Annual Compliance Report to Governing Body
TYPE: Template
DOMAIN: GV
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- GV-GB-001
- CO-CP-001

PURPOSE:
Annual compliance report prepared by the Compliance Officer for the Governing Body, covering compliance program effectiveness, findings, corrective actions, and risk outlook.

INSTRUCTIONS:
Presented at the first Governing Body meeting of each calendar year covering the prior year; archived in the Governance Record permanently.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Reporting Year (type=text, required=true, col=2)
- Submitted By (Compliance Officer) (type=text, required=true, col=2)
- Compliance Program Summary (type=textarea, col=4)
- Key Findings & Trends (type=textarea, col=4)
- Corrective Actions Taken (type=textarea, col=4)
- Outstanding Risks (type=textarea, col=4)
- Regulatory / Survey Activity (type=textarea, col=4)
- Recommendations for Coming Year (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-023 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-001, CO-CP-001

---

## SOURCE: Builder\Forns\GV-FM-024.txt

FORM ID: GV-FM-024
TITLE: Governing Body Training & Education Log
TYPE: Log
DOMAIN: GV
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- GV-GB-001

PURPOSE:
Training and education completion log for Governing Body members, documenting regulatory, fiduciary, and role-specific education.

INSTRUCTIONS:
Updated as trainings are completed. Reviewed at annual self-assessment. Minimum 4 training hours per member per year.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Member Name
- Training Title
- Provider
- Date Completed
- Hours
- Evidence
table_row_count: 12

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-024 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-GB-001

---

## SOURCE: Builder\Forns\GV-FM-025.txt

FORM ID: GV-FM-025
TITLE: Stakeholder Grievance & Feedback Tracking Log
TYPE: Log
DOMAIN: GV
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- GV-PM-005

PURPOSE:
Log capturing every stakeholder grievance or feedback item (patients, families, staff, partners, payers) received by the Administrator or Compliance Hotline, with disposition.

INSTRUCTIONS:
Updated within 1 business day of receipt. Disposition completed within 30 days. Aggregate trends reviewed quarterly by QAPI.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date Received
- Source
- Nature of Feedback
- Severity
- Owner
- Target Resolution
- Actual Resolution
- Status
table_row_count: 12

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form GV-FM-025 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: GV-PM-005

---

## SOURCE: Builder\Forns\HR-FM-001.txt

FORM ID: HR-FM-001
TITLE: Reasonable Suspicion Observation Checklist
TYPE: Checklist
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, digital_candidate

LINKED POLICIES:
- HR-ER-005

PURPOSE:
Structured observation checklist used by a supervisor when there is reasonable suspicion that an employee is impaired while performing job duties, per 42 CFR Â§ 484.70 and the agency Drug-Free Workplace Policy.

INSTRUCTIONS:
Completed by a trained supervisor (not the employee). All observations must be documented contemporaneously. If reasonable suspicion is confirmed, employee is immediately removed from duty and referred for testing.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Reasonable Suspicion Observation Checklist Checklist
layout: checklist

checklist_items:
- Slurred, rapid, or incoherent speech observed
- Unsteady gait, swaying, stumbling, or difficulty with balance
- Bloodshot, glassy, or dilated eyes observed
- Odor of alcohol, marijuana, or other substance detected
- Inappropriate behavior (aggression, confusion, euphoria, drowsiness)
- Impaired coordination or fine motor control observed
- Deterioration in work performance, judgment, or decision making
- Physical signs (tremor, sweating, flushed appearance)
- Possession of paraphernalia or containers on premises
- Credible report from a patient, family member, or colleague

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Observing Supervisor â€” Printed Name (type=text, col=2)
- Observing Supervisor â€” Signature (type=signature, col=1)
- Observing Supervisor â€” Date (type=date, col=1)
- Second Witness â€” Printed Name (type=text, col=2)
- Second Witness â€” Signature (type=signature, col=1)
- Second Witness â€” Date (type=date, col=1)
- HR / Administrator â€” Printed Name (type=text, col=2)
- HR / Administrator â€” Signature (type=signature, col=1)
- HR / Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-001 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-005

---

## SOURCE: Builder\Forns\HR-FM-002.txt

FORM ID: HR-FM-002
TITLE: Drug/Alcohol Test Result Action Form
TYPE: Form
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- HR-ER-005

PURPOSE:
Documents the actions taken in response to a positive, negative-dilute, refusal, or adulterated drug/alcohol test result, in compliance with the agency Drug-Free Workplace Policy.

INSTRUCTIONS:
Completed by HR within 24 hours of test result receipt. Privileged and confidential â€” stored separately from the personnel file.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Employee Name (type=text, required=true, col=2)
- Test Date / Time (type=text, required=true, col=2)
- Test Type (Pre-employment / Post-Incident / Random / Reasonable Suspicion) (type=select, col=4, options=[Pre-employment | Post-Incident | Random | Reasonable Suspicion | Return-to-Duty])
- Test Facility / MRO (type=text, col=4)
- Result (type=select, required=true, col=2, options=[Negative | Positive | Negative-Dilute | Refusal | Adulterated | Substituted])
- Substance(s) Detected (type=text, col=2)
- Action Taken (type=textarea, required=true, col=4)
- Return-to-Work Requirements (type=textarea, col=4)
- Employee Assistance Program Referred? (Y/N) (type=select, col=4, options=[Yes | No])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- HR Representative â€” Printed Name (type=text, col=2)
- HR Representative â€” Signature (type=signature, col=1)
- HR Representative â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-002 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-005

---

## SOURCE: Builder\Forns\HR-FM-003.txt

FORM ID: HR-FM-003
TITLE: Interview & Applicant Evaluation Form
TYPE: Assessment
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- HR-TA-001

PURPOSE:
Structured evaluation tool completed by the hiring panel for each candidate interviewed, ensuring consistent, documented, defensible selection decisions.

INSTRUCTIONS:
Completed immediately after each interview by every panel member. Originals retained for 3 years (EEOC) and cross-referenced to the hiring decision.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Position Applied For (type=text, required=true, col=2)
- Candidate Name (type=text, required=true, col=2)
- Interview Date (type=date, col=2)
- Interviewer Name / Role (type=text, col=2)
- Knowledge / Technical Skills (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Professional Experience (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Communication / Interpersonal (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Judgment / Problem Solving (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Cultural Fit / Mission Alignment (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Strengths (type=textarea, col=4)
- Concerns (type=textarea, col=4)
- Recommendation (type=select, required=true, col=4, options=[Strong Hire | Hire | No Hire | Defer])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Interviewer â€” Printed Name (type=text, col=2)
- Interviewer â€” Signature (type=signature, col=1)
- Interviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-003 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TA-001

---

## SOURCE: Builder\Forns\HR-FM-004.txt

FORM ID: HR-FM-004
TITLE: Employee Reference Check Log
TYPE: Log
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- HR-TA-001

PURPOSE:
Log of every professional reference checked for candidates, including questions asked, responses, and verifier signature.

INSTRUCTIONS:
Minimum three professional references required before any offer. Results reviewed by HR and hiring manager. Retained for 3 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Candidate
- Reference Name
- Title / Relationship
- Company
- Phone / Email
- Dates Known
- Rating
- Key Comments
- Verifier
- Date
table_row_count: 12

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-004 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TA-001

---

## SOURCE: Builder\Forns\HR-FM-005.txt

FORM ID: HR-FM-005
TITLE: OIG/SAM Monthly Exclusion Verification Log
TYPE: Log
DOMAIN: HR
USAGE: Required
FREQUENCY: Monthly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- HR-TA-003

PURPOSE:
Monthly exclusion verification log documenting search of OIG LEIE, SAM.gov, and state Medicaid exclusion lists for every workforce member per 42 CFR Â§ 1001.1901.

INSTRUCTIONS:
Performed monthly by HR/Compliance for ALL active workforce members (employees, contractors, volunteers, students). Screenshots retained for 7 years. Any exclusion hit triggers immediate suspension and 60-day notification to OIG.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Month / Year
- Workforce Member
- NPI / SSN (last 4)
- OIG LEIE Result
- SAM.gov Result
- State Exclusion Result
- Verifier
- Evidence File
- Action (if Hit)
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-005 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TA-003

---

## SOURCE: Builder\Forns\HR-FM-006.txt

FORM ID: HR-FM-006
TITLE: License & Cert Primary Source Verification
TYPE: Checklist
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-TA-004

PURPOSE:
Primary Source Verification (PSV) checklist confirming the authenticity of every clinical license, certification, or credential required for the role, via the issuing authority.

INSTRUCTIONS:
Completed before the first patient visit and at each renewal. PSV screenshots / printouts stored in personnel file. Expiration dates added to HR-FM-021.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” License & Cert Primary Source Verification Checklist
layout: checklist

checklist_items:
- License / credential type identified and required for role
- Verification source confirmed (state board, DEA, AHA, ANA, etc.)
- Direct primary-source query executed (not third-party copy)
- Licensee identity matched (full name + DOB + license number)
- License active and unrestricted â€” no disciplinary action
- Expiration date recorded and added to tracking log
- Screenshot / confirmation saved to personnel file
- OIG / SAM exclusion check completed on same date
- Verification signed and dated by HR
- Employee notified of next renewal deadline

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- HR Verifier â€” Printed Name (type=text, col=2)
- HR Verifier â€” Signature (type=signature, col=1)
- HR Verifier â€” Date (type=date, col=1)
- Clinical Manager â€” Printed Name (type=text, col=2)
- Clinical Manager â€” Signature (type=signature, col=1)
- Clinical Manager â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-006 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TA-004

---

## SOURCE: Builder\Forns\HR-FM-007.txt

FORM ID: HR-FM-007
TITLE: New Hire Onboarding & Orientation Checklist
TYPE: Checklist
DOMAIN: HR
USAGE: Required
FREQUENCY: Upon Hire
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- HR-TA-005

PURPOSE:
Comprehensive checklist of mandatory orientation topics, documents, trainings, and attestations required before a new hire independently performs patient-facing duties.

INSTRUCTIONS:
Completed jointly by HR and supervisor within the first 30 days of employment. No independent patient care until checklist is 100% signed off.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” New Hire Onboarding & Orientation Checklist Checklist
layout: checklist

checklist_items:
- I-9, W-4, and direct-deposit forms completed
- Background check clear / OIG-SAM clear
- Required license(s) verified via Primary Source
- HIPAA training completed
- Bloodborne Pathogens & OSHA training completed
- Infection Control & Hand Hygiene training completed
- TB screening and HepB declination / vaccine
- Emergency Preparedness orientation
- Patient Rights & Ethics orientation
- Policy Acknowledgments (Code of Conduct, Anti-Harassment, FWA, Privacy) signed
- Job description acknowledged and signed
- System access & badge issued
- Skills competency assessment completed and passed
- Supervised field visit(s) completed and documented
- Orientation sign-off by supervisor and new hire

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- New Hire â€” Printed Name (type=text, col=2)
- New Hire â€” Signature (type=signature, col=1)
- New Hire â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- HR Representative â€” Printed Name (type=text, col=2)
- HR Representative â€” Signature (type=signature, col=1)
- HR Representative â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-007 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TA-005

---

## SOURCE: Builder\Forns\HR-FM-008.txt

FORM ID: HR-FM-008
TITLE: Annual Performance Evaluation Form
TYPE: Assessment
DOMAIN: HR
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: master_template

LINKED POLICIES:
- HR-ER-001

PURPOSE:
Standardized annual performance evaluation capturing objective metrics, competency ratings, goal achievement, and development plan for every employee.

INSTRUCTIONS:
Conducted annually on the employee's anniversary date. Discussed in a formal meeting, signed by employee and supervisor, and retained in the personnel file.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Employee Name / Role (type=text, required=true, col=2)
- Review Period (type=text, required=true, col=2)
- Technical Competency (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Quality of Work (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Productivity (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Teamwork / Communication (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Compliance / Policy Adherence (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Patient-Centered Care (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Goals Achieved (Prior Year) (type=textarea, col=4)
- Goals for Coming Year (type=textarea, col=4)
- Development Plan (type=textarea, col=4)
- Overall Rating (type=select, required=true, col=4, options=[Exceeds Expectations | Meets Expectations | Needs Improvement | Unsatisfactory])
- Employee Comments (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- HR Representative â€” Printed Name (type=text, col=2)
- HR Representative â€” Signature (type=signature, col=1)
- HR Representative â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-008 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-001

---

## SOURCE: Builder\Forns\HR-FM-009.txt

FORM ID: HR-FM-009
TITLE: Progressive Disciplinary Action Form
TYPE: Form
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- HR-ER-002

PURPOSE:
Documents each step of progressive discipline (verbal warning â†’ written warning â†’ final warning â†’ termination) per the agency Employee Discipline Policy.

INSTRUCTIONS:
Completed by the supervisor with HR concurrence at each disciplinary step. Employee acknowledgment captured; refusal to sign documented with witness.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Employee Name (type=text, required=true, col=2)
- Employee Role (type=text, required=true, col=2)
- Date of Incident (type=date, col=2)
- Disciplinary Step (type=select, required=true, col=2, options=[Verbal Warning | Written Warning | Final Warning | Suspension | Termination])
- Policy / Rule Violated (type=text, required=true, col=4)
- Description of Conduct / Performance Issue (type=textarea, required=true, col=4)
- Prior Corrective Actions Taken (type=textarea, col=4)
- Expected Corrective Behavior (type=textarea, col=4)
- Consequences of Continued Non-Compliance (type=textarea, col=4)
- Employee Response (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- HR Representative â€” Printed Name (type=text, col=2)
- HR Representative â€” Signature (type=signature, col=1)
- HR Representative â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-009 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-002

---

## SOURCE: Builder\Forns\HR-FM-010.txt

FORM ID: HR-FM-010
TITLE: Employee Grievance / Complaint Form
TYPE: Form
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- HR-ER-003

PURPOSE:
Confidential form by which an employee reports a work-related grievance, complaint, harassment, or retaliation concern for HR investigation.

INSTRUCTIONS:
Submitted to HR or the Compliance Officer. Kept confidential to the maximum extent possible. Retaliation for submission is strictly prohibited.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Complainant Name (may be anonymous) (type=text, col=2)
- Date Submitted (type=date, required=true, col=2)
- Nature of Concern (type=select, required=true, col=4, options=[Working Conditions | Harassment / Discrimination | Retaliation | Wage / Hour | Safety | Policy Violation | Other])
- Individuals Involved (type=text, col=4)
- Date(s) and Location(s) of Events (type=textarea, col=4)
- Detailed Description (type=textarea, required=true, col=4)
- Witnesses (type=textarea, col=4)
- Evidence / Supporting Documents (type=textarea, col=4)
- Preferred Resolution (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Complainant (if not anonymous) â€” Printed Name (type=text, col=2)
- Complainant (if not anonymous) â€” Signature (type=signature, col=1)
- Complainant (if not anonymous) â€” Date (type=date, col=1)
- HR Receiver â€” Printed Name (type=text, col=2)
- HR Receiver â€” Signature (type=signature, col=1)
- HR Receiver â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-010 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-003

---

## SOURCE: Builder\Forns\HR-FM-011.txt

FORM ID: HR-FM-011
TITLE: Employee Exit Interview Form
TYPE: Assessment
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- HR-ER-006

PURPOSE:
Exit interview questionnaire conducted with departing employees to capture feedback on engagement, management, and operational experience for continuous improvement.

INSTRUCTIONS:
Offered to every separating employee within their final week. Responses confidential and aggregated for trend analysis; shared anonymously with leadership.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Employee Name / Role (optional) (type=text, col=2)
- Last Day Worked (type=date, required=true, col=2)
- Reason for Departure (type=select, required=true, col=4, options=[Voluntary â€” Better Opportunity | Voluntary â€” Relocation | Voluntary â€” Personal | Retirement | Involuntary | Other])
- What did you most enjoy about working here? (type=textarea, col=4)
- What improvements would you suggest? (type=textarea, col=4)
- Rate overall experience (1-5) (type=select, col=2, options=[1 | 2 | 3 | 4 | 5])
- Would you recommend Care Indeed? (Y/N/Maybe) (type=select, col=2, options=[Yes | No | Maybe])
- Additional Comments (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee (optional) â€” Printed Name (type=text, col=2)
- Employee (optional) â€” Signature (type=signature, col=1)
- Employee (optional) â€” Date (type=date, col=1)
- HR Interviewer â€” Printed Name (type=text, col=2)
- HR Interviewer â€” Signature (type=signature, col=1)
- HR Interviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-011 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-006

---

## SOURCE: Builder\Forns\HR-FM-012.txt

FORM ID: HR-FM-012
TITLE: TB Screening & Questionnaire
TYPE: Assessment
DOMAIN: HR
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-WM-003

PURPOSE:
Tuberculosis screening questionnaire administered to every workforce member per CDC guidelines and California Title 22 Â§ 74731, prior to any patient contact and annually thereafter.

INSTRUCTIONS:
Completed at hire and annually. Symptomatic or exposure-positive individuals are referred for chest X-ray and evaluation. Records retained for duration of employment + 30 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Employee Full Name (type=text, required=true, col=2)
- Date of Screening (type=date, required=true, col=2)
- Prior TB Test Date / Result (type=text, col=4)
- Do you have a persistent cough > 3 weeks? (Y/N) (type=select, col=2, options=[Yes | No])
- Unexplained fever, night sweats, or weight loss? (Y/N) (type=select, col=2, options=[Yes | No])
- Known exposure to active TB in past 12 months? (Y/N) (type=select, col=2, options=[Yes | No])
- Immunocompromised condition? (Y/N) (type=select, col=2, options=[Yes | No])
- TB Test Required? (Y/N) â€” Method (type=select, col=4, options=[Yes â€” IGRA | Yes â€” TST | No â€” Cleared by history])
- Test Result (type=text, col=4)
- Action Required (if positive) (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- Screener â€” Printed Name (type=text, col=2)
- Screener â€” Signature (type=signature, col=1)
- Screener â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-012 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-WM-003

---

## SOURCE: Builder\Forns\HR-FM-013.txt

FORM ID: HR-FM-013
TITLE: Hepatitis B Vaccine Declination Form
TYPE: Attestation
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Upon Hire
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-WM-003
- HR-EH-101

PURPOSE:
Written declination of the Hepatitis B vaccine series, as required by OSHA 29 CFR Â§ 1910.1030(f)(2)(iv) for workers with occupational exposure to bloodborne pathogens.

INSTRUCTIONS:
Offered to every clinical and HHA employee at hire. Employees who decline sign this declination; employees may later request the vaccine at no cost.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I understand that due to my occupational exposure to blood or other potentially infectious materials, I may be at risk of acquiring Hepatitis B virus (HBV) infection. I have been given the opportunity to be vaccinated at no charge to myself. However, I DECLINE HBV vaccination at this time. I acknowledge that:

acknowledgments:
- I understand that by declining this vaccine, I continue to be at risk of acquiring Hepatitis B, a serious disease.
- If in the future I continue to have occupational exposure and I want to be vaccinated, I can receive the vaccine series at no charge to me.
- I have received information about the Hepatitis B virus and the vaccine.
- My decision to decline this vaccine is voluntary.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Declining Employee â€” Printed Name (type=text, col=2)
- Declining Employee â€” Signature (type=signature, col=1)
- Declining Employee â€” Date (type=date, col=1)
- HR Witness â€” Printed Name (type=text, col=2)
- HR Witness â€” Signature (type=signature, col=1)
- HR Witness â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-013 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-WM-003, HR-EH-101

---

## SOURCE: Builder\Forns\HR-FM-014.txt

FORM ID: HR-FM-014
TITLE: Employee Health & Occupational Injury Report
TYPE: Form
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- HR-WM-004
- RM-OS-101

PURPOSE:
Reports a work-related employee injury, illness, or exposure incident, triggering OSHA, Workers' Compensation, and internal safety workflows.

INSTRUCTIONS:
Completed within 24 hours of the incident by the employee and supervisor. Filed with HR and the Workers' Compensation carrier. Added to OSHA 300 Log (HR-FM-022) per 29 CFR Â§ 1904.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Employee Name (type=text, required=true, col=2)
- Date / Time of Incident (type=text, required=true, col=2)
- Location of Incident (type=text, col=2)
- Body Part(s) Affected (type=text, col=2)
- Nature of Injury / Illness / Exposure (type=textarea, required=true, col=4)
- Description of What Happened (type=textarea, required=true, col=4)
- Contributing Factors (environmental, equipment, PPE) (type=textarea, col=4)
- Witnesses (Name / Contact) (type=textarea, col=4)
- First Aid / Medical Treatment Given (type=textarea, col=4)
- Medical Provider / Facility (type=text, col=4)
- Work Days Lost (type=number, col=2)
- Worker's Comp Claim Filed? (Y/N) (type=select, col=2, options=[Yes | No])
- Bloodborne Pathogen Exposure? (Y/N) (type=select, col=2, options=[Yes | No])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Injured Employee â€” Printed Name (type=text, col=2)
- Injured Employee â€” Signature (type=signature, col=1)
- Injured Employee â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- HR Representative â€” Printed Name (type=text, col=2)
- HR Representative â€” Signature (type=signature, col=1)
- HR Representative â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-014 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-WM-004, RM-OS-101

---

## SOURCE: Builder\Forns\HR-FM-015.txt

FORM ID: HR-FM-015
TITLE: Personnel File Content Audit Checklist
TYPE: Checklist
DOMAIN: HR
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-WM-007

PURPOSE:
Audit checklist verifying each personnel file contains all required documents per CDPH, CMS, and OIG requirements.

INSTRUCTIONS:
Performed annually (at minimum) and during every survey readiness exercise. Deficiencies resolved within 10 business days.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Personnel File Content Audit Checklist Checklist
layout: checklist

checklist_items:
- Completed employment application / rÃ©sumÃ©
- Signed job description acknowledgment
- I-9 with acceptable documentation
- W-4 and direct-deposit authorization
- Reference check forms (minimum 3)
- Background check result (clear)
- OIG / SAM exclusion screenshots (current month)
- Primary Source Verified license / certification
- TB screening / X-ray (if required)
- HepB vaccine record or declination
- New-hire orientation sign-off
- Skills competency assessment results
- Annual performance evaluation
- Annual training / CEU records
- Policy acknowledgments (current versions)
- Disciplinary actions (if any)
- Current license / certification (not expired)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- HR Auditor â€” Printed Name (type=text, col=2)
- HR Auditor â€” Signature (type=signature, col=1)
- HR Auditor â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-015 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-WM-007

---

## SOURCE: Builder\Forns\HR-FM-016.txt

FORM ID: HR-FM-016
TITLE: Clinical Staff Competency Validation Checklist
TYPE: Checklist
DOMAIN: HR
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, shared_enterprise

LINKED POLICIES:
- HR-TD-003
- CL-SD-007

PURPOSE:
Documents initial and annual clinical competency validation for every clinical staff member (RN, LVN, PT, OT, SLP, MSW, HHA).

INSTRUCTIONS:
Initial validation within 90 days of hire; annual thereafter. Competency gaps trigger remediation plan (HR-FM-038). Records retained in personnel file.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Clinical Staff Competency Validation Checklist Checklist
layout: checklist

checklist_items:
- Clinical Staff Competency Validation Checklist â€” Regulatory requirement reviewed and understood
- Clinical Staff Competency Validation Checklist â€” Applicable policy section located and re-read
- Clinical Staff Competency Validation Checklist â€” Required documentation identified and accessible
- Clinical Staff Competency Validation Checklist â€” All data fields confirmed complete and accurate
- Clinical Staff Competency Validation Checklist â€” Signatures / attestations obtained from required parties
- Clinical Staff Competency Validation Checklist â€” Copy filed in the appropriate record per retention schedule
- Clinical Staff Competency Validation Checklist â€” Completion entered in tracking log / dashboard
- Clinical Staff Competency Validation Checklist â€” Any deficiencies escalated to supervisor / Compliance Officer
- Clinical Staff Competency Validation Checklist â€” Corrective action documented and tracked to closure
- Clinical Staff Competency Validation Checklist â€” Annual review date set and added to calendar

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-016 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TD-003, CL-SD-007

---

## SOURCE: Builder\Forns\HR-FM-017.txt

FORM ID: HR-FM-017
TITLE: Training Attendance & Completion Roster
TYPE: Tracking Tool
DOMAIN: HR
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, shared_enterprise

LINKED POLICIES:
- HR-TR-101

PURPOSE:
Attendance roster for every formal training session, documenting topic, instructor, duration, participants, and CEU credits where applicable.

INSTRUCTIONS:
Completed during each training session. Originals scanned to HR and attendee personnel files. Used for CEU credit and mandatory-training compliance reporting.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Training Title
- Date
- Instructor
- Duration (hrs)
- Employee Name
- Employee ID
- Signature
- Pass / Fail
- CEU Awarded
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-017 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TR-101

---

## SOURCE: Builder\Forns\HR-FM-018.txt

FORM ID: HR-FM-018
TITLE: Background Check Authorization & Summary
TYPE: Form
DOMAIN: HR
USAGE: Required
FREQUENCY: Upon Hire
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- HR-TA-002

PURPOSE:
Authorizes the agency to obtain a criminal-background check, fingerprint screening, driving record, and credit check where role-appropriate.

INSTRUCTIONS:
Signed prior to any background check. FCRA-compliant disclosures provided. Results retained separately from the personnel file.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Applicant Full Legal Name (incl. former names) (type=text, required=true, col=4)
- Date of Birth (type=date, required=true, col=2)
- SSN (last 4) (type=text, col=2)
- Current Address (type=text, col=4)
- Prior Addresses (7 years) (type=textarea, col=4)
- Driver's License # / State (type=text, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Applicant â€” Printed Name (type=text, col=2)
- Applicant â€” Signature (type=signature, col=1)
- Applicant â€” Date (type=date, col=1)
- HR Representative â€” Printed Name (type=text, col=2)
- HR Representative â€” Signature (type=signature, col=1)
- HR Representative â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-018 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TA-002

---

## SOURCE: Builder\Forns\HR-FM-019.txt

FORM ID: HR-FM-019
TITLE: Staff Scheduling & Availability Form
TYPE: Form
DOMAIN: HR
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- HR-WM-001

PURPOSE:
Captures staff scheduling availability, preferences, and constraints used by scheduling to assign visits, cases, and on-call rotations.

INSTRUCTIONS:
Updated at hire and whenever availability changes. Used together with caseload and geographic assignment algorithms.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Employee Name / Role (type=text, required=true, col=2)
- Effective Date (type=date, required=true, col=2)
- Weekly Hours Desired (type=number, col=2)
- FT / PT / Per Diem (type=select, col=2, options=[Full-Time | Part-Time | Per Diem])
- Days Available (M-Su + hours) (type=textarea, col=4)
- Willing to take on-call? (Y/N) (type=select, col=2, options=[Yes | No])
- Weekend availability? (Y/N) (type=select, col=2, options=[Yes | No])
- Geographic Service Area (type=text, col=4)
- Transportation (Own / Public) (type=text, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- Scheduler â€” Printed Name (type=text, col=2)
- Scheduler â€” Signature (type=signature, col=1)
- Scheduler â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-019 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-WM-001

---

## SOURCE: Builder\Forns\HR-FM-020.txt

FORM ID: HR-FM-020
TITLE: Contractor / Per Diem Onboarding Checklist
TYPE: Checklist
DOMAIN: HR
USAGE: Required
FREQUENCY: Upon Hire
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-WM-002

PURPOSE:
Onboarding checklist for contract, agency, or per-diem staff verifying credentialing, exclusion, orientation, and initial skills competency prior to patient assignment.

INSTRUCTIONS:
Completed before first patient visit. Same credentialing standards as employees â€” NO exceptions. Revalidated at contract renewal.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Contractor / Per Diem Onboarding Checklist Checklist
layout: checklist

checklist_items:
- Staffing agency contract / BAA executed
- Individual contractor background check on file
- OIG / SAM exclusion clear (current month)
- Primary Source license verification completed
- Evidence of malpractice or agency coverage
- HIPAA training completed within last 12 months
- Bloodborne pathogens training within 12 months
- TB screening current
- Orientation to agency policies completed
- Skills competency validated for assigned scope
- Scheduling system access provisioned
- Expiration tracking loaded to HR-FM-021

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Contractor â€” Printed Name (type=text, col=2)
- Contractor â€” Signature (type=signature, col=1)
- Contractor â€” Date (type=date, col=1)
- HR Representative â€” Printed Name (type=text, col=2)
- HR Representative â€” Signature (type=signature, col=1)
- HR Representative â€” Date (type=date, col=1)
- Clinical Manager â€” Printed Name (type=text, col=2)
- Clinical Manager â€” Signature (type=signature, col=1)
- Clinical Manager â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-020 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-WM-002

---

## SOURCE: Builder\Forns\HR-FM-021.txt

FORM ID: HR-FM-021
TITLE: Annual Immunization & Health Screening Log
TYPE: Log
DOMAIN: HR
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-WM-003
- HR-EH-101

PURPOSE:
Annual tracking log of every required immunization, health screening, and fitness-for-duty requirement for each workforce member.

INSTRUCTIONS:
Updated as immunizations / screenings are completed. Items expiring within 60 days trigger renewal workflow.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Employee Name
- TB Status
- HepB Status
- MMR
- Varicella
- Tdap
- Influenza (Season)
- COVID-19
- N95 Fit-Test
- Renewal Due
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-021 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-WM-003, HR-EH-101

---

## SOURCE: Builder\Forns\HR-FM-022.txt

FORM ID: HR-FM-022
TITLE: OSHA 300 Injury & Illness Log
TYPE: Log
DOMAIN: HR
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-WM-004
- RM-OS-101

PURPOSE:
OSHA Form 300 Log of Work-Related Injuries and Illnesses, per 29 CFR Â§ 1904, covering all recordable events during the calendar year.

INSTRUCTIONS:
Maintained continuously; posted February 1 through April 30 of the following year (OSHA 300A summary). Retained for 5 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Case #
- Employee Name
- Job Title
- Date of Event
- Location
- Injury / Illness Description
- Body Part
- Classification (Death/Days Away/Job Transfer/Other)
- Days Away
- Days on Restricted/Transfer
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-022 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-WM-004, RM-OS-101

---

## SOURCE: Builder\Forns\HR-FM-023.txt

FORM ID: HR-FM-023
TITLE: Workplace Safety Incident Report
TYPE: Form
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- HR-WM-004
- RM-OS-101

PURPOSE:
Reports any workplace or field-based safety incident (injury, exposure, property damage, near-miss) to trigger investigation and corrective action.

INSTRUCTIONS:
Completed within 24 hours of incident. Feeds the OSHA 300 Log (HR-FM-022) and the QAPI Adverse Event process if clinical implications.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Reporter Name / Role (type=text, required=true, col=2)
- Date / Time of Incident (type=text, required=true, col=2)
- Type of Incident (type=select, required=true, col=2, options=[Injury | Exposure | Near-Miss | Property Damage | Ergonomic | Violence / Aggression | Other])
- Location (type=text, col=2)
- Narrative Description (type=textarea, required=true, col=4)
- Contributing Factors (type=textarea, col=4)
- Immediate Corrective Action Taken (type=textarea, col=4)
- Follow-Up Action Required (type=textarea, col=4)
- Witnesses (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Reporter â€” Printed Name (type=text, col=2)
- Reporter â€” Signature (type=signature, col=1)
- Reporter â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- Safety / HR â€” Printed Name (type=text, col=2)
- Safety / HR â€” Signature (type=signature, col=1)
- Safety / HR â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-023 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-WM-004, RM-OS-101

---

## SOURCE: Builder\Forns\HR-FM-024.txt

FORM ID: HR-FM-024
TITLE: CEU / Training Exception Request
TYPE: Form
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- HR-TD-002

PURPOSE:
Requests an exception or extension to a mandatory training, CEU, or licensure requirement for documented good cause.

INSTRUCTIONS:
Submitted by the employee to HR at least 30 days before the deadline. Reviewed by HR and Clinical Manager. Not granted for core safety/compliance modules.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Employee Name (type=text, required=true, col=2)
- Role (type=text, required=true, col=2)
- Requirement Subject to Exception (type=text, required=true, col=4)
- Original Due Date (type=date, col=2)
- Requested Extension Date (type=date, col=2)
- Reason for Request (type=textarea, required=true, col=4)
- Compensating Plan (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- HR Representative â€” Printed Name (type=text, col=2)
- HR Representative â€” Signature (type=signature, col=1)
- HR Representative â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-024 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TD-002

---

## SOURCE: Builder\Forns\HR-FM-025.txt

FORM ID: HR-FM-025
TITLE: Student / Intern Supervision Agreement
TYPE: Attestation
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- HR-TD-004

PURPOSE:
Supervision agreement defining roles, expectations, and sign-off authority for student / intern clinical rotations at Care Indeed.

INSTRUCTIONS:
Signed at the start of every rotation. Students may not perform skilled care independently or sign clinical documentation as provider of record.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
Student acknowledges:

acknowledgments:
- I will not perform skilled clinical care independently; all care will be supervised by my preceptor.
- I will not sign clinical documentation as the provider of record.
- I will complete all required Care Indeed orientation and HIPAA training before the first patient interaction.
- I will abide by all Care Indeed policies, including confidentiality, code of conduct, and infection control.
- I understand that non-compliance may result in termination of my rotation and notification to my school.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Student â€” Printed Name (type=text, col=2)
- Student â€” Signature (type=signature, col=1)
- Student â€” Date (type=date, col=1)
- Preceptor â€” Printed Name (type=text, col=2)
- Preceptor â€” Signature (type=signature, col=1)
- Preceptor â€” Date (type=date, col=1)
- Clinical Manager â€” Printed Name (type=text, col=2)
- Clinical Manager â€” Signature (type=signature, col=1)
- Clinical Manager â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-025 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TD-004

---

## SOURCE: Builder\Forns\HR-FM-026.txt

FORM ID: HR-FM-026
TITLE: Volunteer Service Agreement
TYPE: Attestation
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- HR-WM-006

PURPOSE:
Service agreement with a volunteer performing non-clinical tasks for Care Indeed, defining scope, hours, training, and acknowledgments.

INSTRUCTIONS:
Signed prior to any on-site or patient-facing volunteer activity. Volunteers do not perform skilled care or sign clinical records.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I acknowledge:

acknowledgments:
- I have completed HIPAA awareness and Code of Conduct training.
- I will not access, view, or share Protected Health Information beyond what is necessary for my role.
- I am not providing skilled clinical care and will not sign clinical records.
- I understand the agency may terminate my volunteer engagement at any time.
- I am a volunteer, not an employee, and receive no compensation or benefits.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Volunteer â€” Printed Name (type=text, col=2)
- Volunteer â€” Signature (type=signature, col=1)
- Volunteer â€” Date (type=date, col=1)
- Administrator / Designee â€” Printed Name (type=text, col=2)
- Administrator / Designee â€” Signature (type=signature, col=1)
- Administrator / Designee â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-026 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-WM-006

---

## SOURCE: Builder\Forns\HR-FM-027.txt

FORM ID: HR-FM-027
TITLE: Expense Reimbursement Request
TYPE: Form
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- HR-WM-001

PURPOSE:
Employee reimbursement request for business-related expenses (mileage, supplies, training) with receipts.

INSTRUCTIONS:
Submitted within 30 days of expense. Approved by supervisor before processing by Finance. Mileage reimbursed at current IRS rate.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Employee Name (type=text, required=true, col=2)
- Pay Period (type=text, required=true, col=2)
- Expense Type (Mileage, Supplies, Other) (type=text, col=2)
- Total Amount (type=text, col=2)
- Detail (Date / Description / Amount) (type=textarea, required=true, col=4)
- Business Purpose (type=textarea, col=4)
- Receipts Attached? (Y/N) (type=select, col=2, options=[Yes | No])
- Mileage (miles Ã— rate) (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- Finance â€” Printed Name (type=text, col=2)
- Finance â€” Signature (type=signature, col=1)
- Finance â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-027 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-WM-001

---

## SOURCE: Builder\Forns\HR-FM-028.txt

FORM ID: HR-FM-028
TITLE: Remote Work / Telehealth Agreement
TYPE: Attestation
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- HR-ER-008

PURPOSE:
Agreement authorizing an employee to perform telehealth or remote work functions, defining expectations for privacy, equipment, and connectivity.

INSTRUCTIONS:
Required prior to any regular remote work. Annual re-review. Remote workstation must meet HIPAA and ergonomic standards.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I acknowledge and agree to the following:

acknowledgments:
- I will ensure my remote workspace is private, secure, and free from unauthorized observation.
- I will use only agency-approved devices and software for PHI or business operations.
- I will encrypt all endpoints and use the VPN for any system access.
- I will not print PHI at home; if printing is required, I will follow agency retention and destruction policies.
- I will promptly report any security incident, loss, or theft.
- The agency may revoke remote-work privileges at any time.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- IT â€” Printed Name (type=text, col=2)
- IT â€” Signature (type=signature, col=1)
- IT â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-028 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-008

---

## SOURCE: Builder\Forns\HR-FM-029.txt

FORM ID: HR-FM-029
TITLE: Anti-Harassment Policy Acknowledgment
TYPE: Attestation
DOMAIN: HR
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, digital_candidate

LINKED POLICIES:
- HR-ER-004

PURPOSE:
Annual acknowledgment of Care Indeed's Anti-Harassment, Anti-Retaliation, and EEO Policy per federal and California law.

INSTRUCTIONS:
Signed at hire and annually. Training completion (CA SB 1343, 2 hrs supervisors / 1 hr non-supervisors) evidenced on HR-FM-017.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I acknowledge and agree that:

acknowledgments:
- I have received and read the Anti-Harassment, Anti-Retaliation, and EEO Policy.
- I understand harassment based on protected characteristics is prohibited and subject to discipline up to termination.
- I understand retaliation against anyone reporting a concern in good faith is strictly prohibited.
- I know how to report harassment, discrimination, or retaliation concerns (HR, Compliance Officer, Hotline).
- I have completed the state-required Harassment Prevention Training.
- I agree to abide by this policy in all work activities.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-029 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-004

---

## SOURCE: Builder\Forns\HR-FM-030.txt

FORM ID: HR-FM-030
TITLE: Emergency Preparedness Drill Participation Log
TYPE: Log
DOMAIN: HR
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-TD-005

PURPOSE:
Log documenting participation in annual emergency preparedness training and at least one drill per year per 42 CFR Â§ 484.102.

INSTRUCTIONS:
Every workforce member must participate annually. Deficiencies reported on the Compliance Dashboard and escalated.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Employee Name
- Role
- Training / Drill Topic
- Date
- Duration
- Instructor
- Pass / Fail
- Next Due
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-030 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TD-005

---

## SOURCE: Builder\Forns\HR-FM-031.txt

FORM ID: HR-FM-031
TITLE: Job Description Acknowledgment Form
TYPE: Attestation
DOMAIN: HR
USAGE: Required
FREQUENCY: Upon Hire
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- HR-TA-006

PURPOSE:
Signed acknowledgment that the employee has received, read, and understood the job description for their position.

INSTRUCTIONS:
Signed at hire and whenever the job description is materially revised. Retained in the personnel file.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I acknowledge that:

acknowledgments:
- I have received and reviewed the job description for my position.
- I understand the essential functions, physical requirements, and qualifications.
- I agree to perform the duties outlined in the job description.
- I will notify my supervisor if my role materially changes or if I cannot perform essential functions with or without accommodation.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-031 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TA-006

---

## SOURCE: Builder\Forns\HR-FM-032.txt

FORM ID: HR-FM-032
TITLE: Corrective Action Plan (Employee)
TYPE: Form
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- HR-ER-002

PURPOSE:
Structured corrective action plan specifying measurable performance or conduct expectations and a defined review period.

INSTRUCTIONS:
Issued when performance deficiencies are identified. Employee signs acknowledging receipt; refusal documented. Progress reviewed at 30/60/90-day checkpoints.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Employee Name / Role (type=text, required=true, col=2)
- Effective Date (type=date, required=true, col=2)
- Performance / Conduct Deficiency (type=textarea, required=true, col=4)
- Specific Expectations (Measurable) (type=textarea, required=true, col=4)
- Resources / Support Offered (type=textarea, col=4)
- Review Checkpoints (30/60/90 day) (type=textarea, col=4)
- Consequences of Failure to Meet (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- HR Representative â€” Printed Name (type=text, col=2)
- HR Representative â€” Signature (type=signature, col=1)
- HR Representative â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-032 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-002

---

## SOURCE: Builder\Forns\HR-FM-033.txt

FORM ID: HR-FM-033
TITLE: Mandatory Reporter Attestation
TYPE: Attestation
DOMAIN: HR
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-009

PURPOSE:
Annual attestation that employees in mandated-reporter roles understand their legal duty under California Welfare & Institutions Code Â§Â§ 15630-15637 (elder and dependent-adult abuse) and will comply.

INSTRUCTIONS:
Signed at hire and annually. Reports must be made within 2 hours / 2 business days per statute.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I acknowledge that as a mandated reporter:

acknowledgments:
- I understand California law requires me to report known or suspected physical abuse, neglect, financial abuse, isolation, or abandonment of elders and dependent adults.
- I will report to Adult Protective Services and local law enforcement as required by WIC Â§ 15630.
- Reports will be made within 2 hours by phone and within 2 business days by written report.
- Confidentiality of the reporter is protected by law.
- Failure to report is a misdemeanor and may result in employment discipline up to termination.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-033 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-009

---

## SOURCE: Builder\Forns\HR-FM-034.txt

FORM ID: HR-FM-034
TITLE: HR Audit Readiness Checklist
TYPE: Checklist
DOMAIN: HR
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, shared_enterprise

LINKED POLICIES:
- HR-WM-007

PURPOSE:
Annual survey readiness checklist for all HR records, credentialing, training, and personnel documentation.

INSTRUCTIONS:
Executed by HR in Q1 of each year and within 60 days prior to any scheduled survey. Findings reported on HR Compliance Dashboard.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” HR Audit Readiness Checklist Checklist
layout: checklist

checklist_items:
- Active employee roster matches HRIS and scheduling
- Every employee has a complete personnel file (HR-FM-015)
- OIG / SAM exclusion screening current for all employees and contractors
- Licenses / certifications current with Primary Source Verification
- TB screening and HepB records current
- New-hire orientation checklists complete for all hires in past 12 months
- Annual performance evaluations current
- Annual mandatory trainings complete (HIPAA, BBP, Harassment, FWA, EP)
- Disciplinary actions properly documented
- Terminated employees' access revoked (IT-FM-002) within 24 hours
- Contract / agency staff files match employee standard
- OSHA 300 Log maintained and summary posted (Feb 1 â€“ Apr 30)
- Personnel file retention schedule followed
- No gaps > 30 days in any tracking log

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- HR Director â€” Printed Name (type=text, col=2)
- HR Director â€” Signature (type=signature, col=1)
- HR Director â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-034 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-WM-007

---

## SOURCE: Builder\Forns\HR-FM-035.txt

FORM ID: HR-FM-035
TITLE: Workforce Diversity & Inclusion Action Plan
TYPE: Template
DOMAIN: HR
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- HR-ER-007

PURPOSE:
Annual Diversity, Equity, & Inclusion action plan including workforce demographics, goals, and initiatives.

INSTRUCTIONS:
Developed annually by HR with input from leadership. Shared with Governing Body at Q1 meeting.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Plan Year (type=text, required=true, col=2)
- Plan Author (type=text, required=true, col=2)
- Workforce Demographics Summary (type=textarea, col=4)
- DEI Strengths (type=textarea, col=4)
- DEI Opportunities (type=textarea, col=4)
- Specific Goals (Measurable) (type=textarea, col=4)
- Initiatives & Budget (type=textarea, col=4)
- KPIs for Tracking Progress (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- HR Director â€” Printed Name (type=text, col=2)
- HR Director â€” Signature (type=signature, col=1)
- HR Director â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-035 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-007

---

## SOURCE: Builder\Forns\HR-FM-036.txt

FORM ID: HR-FM-036
TITLE: Post-Incident Psychological Support Referral
TYPE: Form
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- HR-ER-001
- RM-SS-002

PURPOSE:
Referral to psychological support / EAP following serious incidents (patient death, workplace violence, traumatic event).

INSTRUCTIONS:
Offered within 48 hours of qualifying event. Participation voluntary and confidential. Documented in HR file without clinical detail.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Employee Name / Role (type=text, required=true, col=2)
- Date of Qualifying Event (type=date, required=true, col=2)
- Nature of Event (summary only) (type=textarea, col=4)
- EAP Provider (type=text, col=2)
- Referral Date (type=date, col=2)
- Follow-Up Check-In Date (type=date, col=2)
- Paid Time Off Offered? (Y/N) (type=select, col=2, options=[Yes | No])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- HR â€” Printed Name (type=text, col=2)
- HR â€” Signature (type=signature, col=1)
- HR â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-036 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-001, RM-SS-002

---

## SOURCE: Builder\Forns\HR-FM-037.txt

FORM ID: HR-FM-037
TITLE: Confidentiality & Non-Disclosure Agreement
TYPE: Attestation
DOMAIN: HR
USAGE: Required
FREQUENCY: Upon Hire
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- HR-TA-001
- CO-HP-001

PURPOSE:
Confidentiality and non-disclosure agreement binding all workforce members to protect PHI and agency proprietary information.

INSTRUCTIONS:
Signed at hire and upon role change with expanded access. Remains in effect after termination.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I understand and agree that:

acknowledgments:
- I will access PHI only for legitimate business purposes and on a minimum-necessary basis.
- I will not disclose PHI or proprietary information to any unauthorized person or entity.
- My obligation continues after my role or employment ends.
- Violation may result in immediate termination, civil liability, and criminal penalty under HIPAA.
- I will immediately report any suspected breach to the Privacy Officer.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-037 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TA-001, CO-HP-001

---

## SOURCE: Builder\Forns\HR-FM-038.txt

FORM ID: HR-FM-038
TITLE: Competency Remediation Plan
TYPE: Form
DOMAIN: HR
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-TD-003

PURPOSE:
Remediation plan for an employee failing a clinical competency validation, specifying training, supervised practice, and re-validation.

INSTRUCTIONS:
Issued within 5 business days of failed validation. Maximum remediation period 60 days; failure to achieve competency may result in reassignment or termination.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Employee Name / Role (type=text, required=true, col=2)
- Failed Competency (type=text, required=true, col=2)
- Date of Initial Validation (type=date, col=2)
- Remediation Period (type=text, col=2)
- Required Training / Study (type=textarea, col=4)
- Supervised Practice (# visits / hours) (type=text, col=2)
- Preceptor Assigned (type=text, col=2)
- Re-validation Date / Method (type=text, col=4)
- Consequences of Continued Failure (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- Preceptor â€” Printed Name (type=text, col=2)
- Preceptor â€” Signature (type=signature, col=1)
- Preceptor â€” Date (type=date, col=1)
- Clinical Manager â€” Printed Name (type=text, col=2)
- Clinical Manager â€” Signature (type=signature, col=1)
- Clinical Manager â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-038 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-TD-003

---

## SOURCE: Builder\Forns\HR-FM-039.txt

FORM ID: HR-FM-039
TITLE: Staff Recognition & Performance Excellence Log
TYPE: Log
DOMAIN: HR
USAGE: Optional
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- HR-ER-001

PURPOSE:
Log capturing staff recognition, performance excellence awards, and peer kudos for trend analysis and retention strategy.

INSTRUCTIONS:
Entries may be submitted by any staff member. Reviewed quarterly by HR for celebration and pattern analysis.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date
- Recognized Employee
- Role
- Recognition Category
- Submitted By
- Narrative
- Award Given
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-039 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: HR-ER-001

---

## SOURCE: Builder\Forns\HR-FM-040.txt

FORM ID: HR-FM-040
TITLE: Leave of Absence Request (FMLA / CFRA / PDL / ADA)
TYPE: Request
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-003
- HR-ER-004
- HR-HS-003

PURPOSE:
Standardized leave-of-absence request capturing the leave category (FMLA, CFRA, PDL, ADA, paid sick, personal), dates, medical certification referral, intermittent/continuous schedule, and employer designation notice workflow.

INSTRUCTIONS:
Employee submits to HR; HR issues Notice of Eligibility/Rights within 5 business days of FMLA/CFRA request per 29 CFR Â§ 825.300. Medical certification issued separately. HR completes Designation Notice within 5 business days of sufficient certification.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee (Full Name) (type=text, required=true, col=2)
- Employee ID (type=text, required=true, col=2)
- Department / Supervisor (type=text, col=2)
- Date Submitted (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Leave Details
layout: grid

fields:
- Leave Category (type=select, required=true, col=2, options=[FMLA | CFRA | PDL | ADA | Paid Sick Leave | Workers Comp | Personal Unpaid | Bereavement | Jury Duty | Other])
- Reason (type=textarea, col=4)
- Anticipated Start Date (type=date, required=true, col=2)
- Anticipated End Date (type=date, col=2)
- Continuous or Intermittent (type=select, col=2, options=[Continuous | Intermittent | Reduced Schedule])
- Relationship to Family Member (if applicable) (type=text, col=2)
- Prior FMLA/CFRA used (hours) (type=text, col=2)

SECTION 3: Section 3 â€” Medical Certification
layout: grid

fields:
- Medical Certification Required? (Y/N) (type=select, col=2, options=[Yes | No])
- Certification Due Date (15 days) (type=date, col=2)
- Certification Received Date (type=date, col=2)
- Second/Third Opinion Required? (Y/N) (type=select, col=2, options=[Yes | No])

SECTION 4: Section 4 â€” Employer Designation
layout: grid

fields:
- Notice of Eligibility Issued Date (5 business days) (type=date, col=2)
- Designation Notice Issued Date (type=date, col=2)
- Leave Designated As (type=select, col=2, options=[FMLA-qualifying | CFRA-qualifying | Both | Not-qualifying])
- Pay Status During Leave (type=select, col=2, options=[Unpaid | PTO substitution | Partial paid])
- Benefit Continuation Plan (type=textarea, col=4)
- Return-to-Work Requirements (type=textarea, col=4)

SECTION 5: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- HR Representative â€” Printed Name (type=text, col=2)
- HR Representative â€” Signature (type=signature, col=1)
- HR Representative â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-040 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-ER-003, HR-ER-004, HR-HS-003

---

## SOURCE: Builder\Forns\HR-FM-041.txt

FORM ID: HR-FM-041
TITLE: Return-to-Work Clearance
TYPE: Clearance
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-003
- HR-HS-001
- HR-HS-003

PURPOSE:
Medical clearance and accommodation documentation for employees returning from medical leave, workers' comp injury, or extended ADA accommodation.

INSTRUCTIONS:
Employee provides medical release; HR/Occupational Health reviews fitness-for-duty and identifies any reasonable accommodation needs. Signed by employee, HR, and supervisor prior to first shift back.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee (Full Name) (type=text, required=true, col=2)
- Employee ID (type=text, required=true, col=2)
- Job Title / Role (type=text, col=2)
- Department / Supervisor (type=text, col=2)

SECTION 2: Section 2 â€” Leave / Injury Context
layout: grid

fields:
- Leave Start Date (type=date, required=true, col=2)
- Original Expected Return Date (type=date, col=2)
- Actual Return Date (type=date, required=true, col=2)
- Leave Type (type=select, col=2, options=[FMLA/CFRA | Workers Comp | PDL | Personal | Other])
- Related Incident ID (if WC) (type=text, col=2)

SECTION 3: Section 3 â€” Medical Release
layout: grid

fields:
- Provider Name (type=text, required=true, col=2)
- Provider License # / NPI (type=text, col=2)
- Release Date (type=date, required=true, col=2)
- Restrictions? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Restrictions Detail (duration, activity, lifting, hours) (type=textarea, col=4)
- Reasonable Accommodation Needed? (Y/N) (type=select, col=2, options=[Yes | No])
- Accommodation Detail (type=textarea, col=4)

SECTION 4: Section 4 â€” Fitness-for-Duty Review
layout: grid

fields:
- HR Reviewer (type=text, col=2)
- Occupational Health Reviewer (if applicable) (type=text, col=2)
- Essential Job Functions Reviewed? (Y/N) (type=select, col=2, options=[Yes | No])
- Clearance Granted (Full / Modified / Denied) (type=select, required=true, col=2, options=[Full | Modified | Denied])
- Modified Duty Plan (type=textarea, col=4)

SECTION 5: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- HR â€” Printed Name (type=text, col=2)
- HR â€” Signature (type=signature, col=1)
- HR â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-041 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-ER-003, HR-HS-001, HR-HS-003

---

## SOURCE: Builder\Forns\HR-FM-042.txt

FORM ID: HR-FM-042
TITLE: Reasonable Accommodation Request (ADA / FEHA)
TYPE: Request
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-004
- HR-HS-003

PURPOSE:
Documents the interactive-process request, evaluation, and determination for workplace accommodations under ADA and California FEHA, including pregnancy-related and religious accommodations.

INSTRUCTIONS:
Employee initiates or supervisor recognizes need; HR facilitates the interactive process within 10 business days. Final determination documented and retained confidentially in a separate medical file.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee (Full Name) (type=text, required=true, col=2)
- Employee ID (type=text, required=true, col=2)
- Job Title (type=text, col=2)
- Department / Supervisor (type=text, col=2)
- Date Submitted (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Request Details
layout: grid

fields:
- Basis (type=select, required=true, col=2, options=[ADA Disability | FEHA Disability | Pregnancy (PDL) | Religion | Other])
- Impairment / Circumstance (type=textarea, col=4)
- Requested Accommodation(s) (type=textarea, col=4)
- Essential Functions Affected (type=textarea, col=4)
- Medical Documentation Provided? (Y/N) (type=select, col=2, options=[Yes | No | NA])

SECTION 3: Section 3 â€” Interactive Process
layout: grid

fields:
- Interactive Meeting Date (type=date, col=2)
- Attendees (type=textarea, col=4)
- Alternatives Considered (type=textarea, col=4)
- Undue Hardship Analysis (if denial considered) (type=textarea, col=4)

SECTION 4: Section 4 â€” Determination
layout: grid

fields:
- Determination (Approved / Modified / Denied / Deferred pending info) (type=select, required=true, col=2, options=[Approved | Modified | Denied | Deferred])
- Accommodation Provided (type=textarea, col=4)
- Effective Date (type=date, col=2)
- Review Date (type=date, col=2)
- Rationale (type=textarea, col=4)

SECTION 5: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- HR Director â€” Printed Name (type=text, col=2)
- HR Director â€” Signature (type=signature, col=1)
- HR Director â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-042 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-ER-004, HR-HS-003
- CONFIDENTIAL â€” retained in separate medical file per ADA Â§ 12112(d)

---

## SOURCE: Builder\Forns\HR-FM-043.txt

FORM ID: HR-FM-043
TITLE: ADA / FEHA Interactive Process Log
TYPE: Log
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-004
- HR-HS-003

PURPOSE:
Chronological log of each interactive-process interaction (meeting, call, email, correspondence) between employee, supervisor, HR, and medical provider during a reasonable-accommodation review. Supports EEOC/DFEH inquiries.

INSTRUCTIONS:
HR Director maintains; each communication entered within 1 business day. Retained confidentially per ADA Â§ 12112(d) in separate medical file.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee (Name) (type=text, required=true, col=2)
- Employee ID (type=text, required=true, col=2)
- Case ID (link to HR-FM-042) (type=text, col=2)
- HR Owner (type=text, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: grid

fields:
- Date (type=date, col=2)
- Participants (type=textarea, col=4)
- Mode (meeting / call / email / letter) (type=select, col=2, options=[Meeting | Call | Email | Letter | Other])
- Topics Discussed (type=textarea, col=4)
- Agreements / Decisions (type=textarea, col=4)
- Next Steps / Owner / Due (type=textarea, col=4)
- Supporting Documents (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- HR Director â€” Printed Name (type=text, col=2)
- HR Director â€” Signature (type=signature, col=1)
- HR Director â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-043 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- CONFIDENTIAL â€” ADA/FEHA separate medical file
- Linked Policies: HR-ER-004, HR-HS-003

---

## SOURCE: Builder\Forns\HR-FM-044.txt

FORM ID: HR-FM-044
TITLE: Fitness-for-Duty / Functional Capacity Review
TYPE: Review
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-HS-001
- HR-ER-004

PURPOSE:
Occupational-health review comparing job essential functions to a clinician's functional-capacity evaluation. Supports accommodation determination and safe return-to-work.

INSTRUCTIONS:
Occupational Health clinician completes with HR input; essential functions pulled from job description; determination fed to HR-FM-045 Accommodation Determination or HR-FM-041 Return-to-Work Clearance.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee (Name) (type=text, required=true, col=2)
- Employee ID (type=text, required=true, col=2)
- Job Title (type=text, col=2)
- Review Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Essential Functions vs Capacity
layout: grid

fields:
- Essential Functions (from JD) (type=textarea, col=4)
- Functional Capacity Findings (type=textarea, col=4)
- Identified Limitations (type=textarea, col=4)
- Recommended Restrictions (duration / activity) (type=textarea, col=4)
- Accommodation Options Feasible? (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Occupational Health Clinician â€” Printed Name (type=text, col=2)
- Clinician â€” Signature (type=signature, col=1)
- Clinician â€” Date (type=date, col=1)
- HR Director â€” Printed Name (type=text, col=2)
- HR Director â€” Signature (type=signature, col=1)
- HR Director â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-044 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- CONFIDENTIAL MEDICAL â€” ADA Â§ 12112(d) separate file
- Linked Policies: HR-HS-001, HR-ER-004

---

## SOURCE: Builder\Forns\HR-FM-045.txt

FORM ID: HR-FM-045
TITLE: Accommodation Determination
TYPE: Determination
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-004

PURPOSE:
Final written determination of reasonable accommodation or denial based on interactive process, functional capacity, undue hardship analysis, and policy.

INSTRUCTIONS:
HR Director issues within 30 days of complete information (ADA best practice). Employee receives copy; confidential in separate medical file.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee (Name) (type=text, required=true, col=2)
- Employee ID (type=text, required=true, col=2)
- Case ID (link to HR-FM-042) (type=text, col=2)
- Determination Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Determination
layout: grid

fields:
- Outcome (Granted / Modified / Denied / Deferred) (type=select, required=true, col=2, options=[Granted | Modified | Denied | Deferred])
- Accommodation Provided (specifics) (type=textarea, col=4)
- Effective Date (type=date, col=2)
- Review Date (type=date, col=2)
- Essential Functions Addressed? (Y/N) (type=select, col=2, options=[Yes | No])
- Undue Hardship Rationale (if denial) (type=textarea, col=4)
- Alternatives Considered (type=textarea, col=4)
- Employee Notified Method (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- HR Director â€” Printed Name (type=text, col=2)
- HR Director â€” Signature (type=signature, col=1)
- HR Director â€” Date (type=date, col=1)
- Employee Acknowledgment â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-045 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- CONFIDENTIAL â€” ADA separate medical file
- Linked Policies: HR-ER-004

---

## SOURCE: Builder\Forns\HR-FM-046.txt

FORM ID: HR-FM-046
TITLE: HR Complaint Intake Form (Harassment / Discrimination / Retaliation)
TYPE: Form
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-001
- HR-ER-005
- CO-CP-001

PURPOSE:
Intake of employee complaints regarding harassment, discrimination, retaliation, or hostile work environment. Triggers investigation per Title VII / FEHA / ADA / ADEA.

INSTRUCTIONS:
HR receives; complaints may be anonymous via CO-FM-003 Hotline. Logged same-day; investigation plan within 5 business days (HR-FM-048).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Complainant Name (or Anonymous) (type=text, col=2)
- Contact Info (type=text, col=2)
- Complaint ID (type=text, required=true, col=2)
- Date Received (type=date, required=true, col=2)
- Intake Owner (HR) (type=text, col=2)

SECTION 2: Section 2 â€” Complaint Detail
layout: grid

fields:
- Nature (harassment / discrimination / retaliation / hostile environment / other) (type=select, col=2, options=[Harassment | Discrimination | Retaliation | Hostile Environment | Other])
- Protected Class Alleged (race / sex / age / disability / religion / other) (type=select, col=2, options=[Race | Sex | Age | Disability | Religion | Ethnicity | Other | Not Specified])
- Respondent(s) (type=textarea, col=4)
- Date(s) of Incident(s) (type=text, col=2)
- Location(s) (type=text, col=2)
- Narrative of Events (type=textarea, col=4)
- Witnesses (type=textarea, col=4)
- Prior Report / Same Matter? (Y/N) (type=select, col=2, options=[Yes | No])
- Retaliation Concern? (Y/N) (type=select, col=2, options=[Yes | No])
- Requested Outcome (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Complainant â€” Printed Name (type=text, col=2)
- Complainant â€” Signature (type=signature, col=1)
- Complainant â€” Date (type=date, col=1)
- HR Intake â€” Printed Name (type=text, col=2)
- HR Intake â€” Signature (type=signature, col=1)
- HR Intake â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-046 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- CONFIDENTIAL â€” handle per HR investigation protocols
- Linked Policies: HR-ER-001, HR-ER-005, CO-CP-001

---

## SOURCE: Builder\Forns\HR-FM-047.txt

FORM ID: HR-FM-047
TITLE: Interim Measures Notice
TYPE: Notice
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-001
- HR-ER-005

PURPOSE:
Documents interim protective measures (separation of parties, no-contact order, temporary reassignment, paid administrative leave) put in place pending investigation to prevent further harm and protect from retaliation.

INSTRUCTIONS:
HR Director issues within 24 hours where warranted; reviewed by Legal Counsel. Re-evaluated weekly.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Complaint ID (link to HR-FM-046) (type=text, required=true, col=2)
- Date of Notice (type=date, required=true, col=2)
- Issuing HR Director (type=text, col=2)

SECTION 2: Section 2 â€” Measures
layout: grid

fields:
- Parties Covered (type=textarea, col=4)
- Interim Measure (separation / no-contact / reassignment / admin leave / other) (type=textarea, col=4)
- Effective Date (type=date, col=2)
- Expected Duration (type=text, col=2)
- Rationale (type=textarea, col=4)
- Legal Counsel Reviewed? (Y/N) (type=select, col=2, options=[Yes | No])
- Re-evaluation Cadence (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- HR Director â€” Printed Name (type=text, col=2)
- HR Director â€” Signature (type=signature, col=1)
- HR Director â€” Date (type=date, col=1)
- Legal Counsel â€” Printed Name (type=text, col=2)
- Legal Counsel â€” Signature (type=signature, col=1)
- Legal Counsel â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-047 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- CONFIDENTIAL
- Linked Policies: HR-ER-001, HR-ER-005

---

## SOURCE: Builder\Forns\HR-FM-048.txt

FORM ID: HR-FM-048
TITLE: HR Investigation Plan
TYPE: Plan
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-001
- HR-ER-005

PURPOSE:
Structured plan for investigating an HR complaint, including scope, allegations, witness list, documents to collect, timeline, investigator qualifications, and confidentiality protocols.

INSTRUCTIONS:
HR Director or outside investigator prepares within 5 business days of intake; Legal Counsel reviews; maintained privileged.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Complaint ID (type=text, required=true, col=2)
- Investigator (Name / Role / External?) (type=text, col=2)
- Plan Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Plan
layout: grid

fields:
- Allegations (bullet list) (type=textarea, col=4)
- Legal Frameworks Involved (Title VII / FEHA / ADA / ADEA / NLRA / Other) (type=textarea, col=4)
- Witnesses to Interview (type=textarea, col=4)
- Documents to Collect (type=textarea, col=4)
- Preservation / Legal Hold Triggered? (Y/N â€” see EN-FM-030) (type=select, col=2, options=[Yes | No])
- Privilege Strategy (type=textarea, col=4)
- Estimated Completion Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Investigator â€” Printed Name (type=text, col=2)
- Investigator â€” Signature (type=signature, col=1)
- Investigator â€” Date (type=date, col=1)
- Legal Counsel â€” Printed Name (type=text, col=2)
- Legal Counsel â€” Signature (type=signature, col=1)
- Legal Counsel â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-048 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- ATTORNEY-CLIENT PRIVILEGED / WORK PRODUCT
- Linked Policies: HR-ER-001, HR-ER-005

---

## SOURCE: Builder\Forns\HR-FM-049.txt

FORM ID: HR-FM-049
TITLE: Witness Interview Notes Template
TYPE: Template
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-001
- HR-ER-005

PURPOSE:
Standardized template for capturing HR investigation interview content, including Upjohn warnings where attorney is present, confidentiality advisements, and retaliation protections.

INSTRUCTIONS:
Investigator uses for each interview; witness reviews & initials for accuracy where possible; privileged.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Witness Name (type=text, required=true, col=2)
- Relationship to Matter (type=text, col=2)
- Interview Date (type=date, required=true, col=2)
- Interview Location / Mode (type=text, col=2)
- Investigator (type=text, col=2)
- Others Present (type=textarea, col=4)

SECTION 2: Section 2 â€” Advisements
layout: grid

fields:
- Confidentiality Advisement Given? (Y/N) (type=select, col=2, options=[Yes | No])
- Non-Retaliation Advisement Given? (Y/N) (type=select, col=2, options=[Yes | No])
- Upjohn Warning (if counsel present)? (Y/N) (type=select, col=2, options=[Yes | No | NA])

SECTION 3: Section 3 â€” Substance
layout: grid

fields:
- Topics Covered (type=textarea, col=4)
- Key Statements (paraphrased or quoted) (type=textarea, col=4)
- Documents Reviewed (type=textarea, col=4)
- Additional Witnesses / Leads (type=textarea, col=4)
- Investigator Observations (type=textarea, col=4)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Investigator â€” Printed Name (type=text, col=2)
- Investigator â€” Signature (type=signature, col=1)
- Investigator â€” Date (type=date, col=1)
- Witness Acknowledgment (optional) â€” Printed Name (type=text, col=2)
- Witness â€” Signature (type=signature, col=1)
- Witness â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-049 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- ATTORNEY-CLIENT PRIVILEGED / WORK PRODUCT
- Linked Policies: HR-ER-001, HR-ER-005

---

## SOURCE: Builder\Forns\HR-FM-050.txt

FORM ID: HR-FM-050
TITLE: HR Investigation Report
TYPE: Report
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-001
- HR-ER-005

PURPOSE:
Comprehensive investigation report summarizing allegations, evidence, credibility assessment, findings (substantiated / not substantiated / inconclusive), applicable law/policy, and recommended corrective action.

INSTRUCTIONS:
Investigator prepares within 45 days of intake; Legal reviews; HR Director and Administrator approve; employment action taken per HR-ER-002.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Complaint ID (type=text, required=true, col=2)
- Investigator (type=text, required=true, col=2)
- Report Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Executive Summary
layout: grid

fields:
- Allegations (type=textarea, col=4)
- Standard of Proof Used (preponderance) (type=text, col=2)
- Findings per Allegation (substantiated / not / inconclusive) (type=textarea, col=4)

SECTION 3: Section 3 â€” Evidence & Analysis
layout: grid

fields:
- Witnesses Interviewed (type=textarea, col=4)
- Documents Reviewed (type=textarea, col=4)
- Credibility Assessment Narrative (type=textarea, col=4)
- Policy / Law Analysis (type=textarea, col=4)

SECTION 4: Section 4 â€” Recommendations
layout: grid

fields:
- Corrective / Disciplinary Action (recommended) (type=textarea, col=4)
- Systemic Remediation (training, policy, process) (type=textarea, col=4)
- Monitoring Plan (type=textarea, col=4)
- Referrals (CO-CP-001, QAPI, IT) (type=textarea, col=4)

SECTION 5: Section â€” Signatures & Attestation
layout: signature

fields:
- Investigator â€” Printed Name (type=text, col=2)
- Investigator â€” Signature (type=signature, col=1)
- Investigator â€” Date (type=date, col=1)
- Legal Counsel â€” Printed Name (type=text, col=2)
- Legal Counsel â€” Signature (type=signature, col=1)
- Legal Counsel â€” Date (type=date, col=1)
- HR Director â€” Printed Name (type=text, col=2)
- HR Director â€” Signature (type=signature, col=1)
- HR Director â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-050 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- ATTORNEY-CLIENT PRIVILEGED / WORK PRODUCT
- Linked Policies: HR-ER-001, HR-ER-005

---

## SOURCE: Builder\Forns\HR-FM-051.txt

FORM ID: HR-FM-051
TITLE: Investigation Closure Letter (to Complainant & Respondent)
TYPE: Letter
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-001
- HR-ER-005

PURPOSE:
Formal closure letter notifying complainant and respondent that the investigation has concluded, outcomes (at high level respecting privacy), non-retaliation protections, and appeal / external reporting rights.

INSTRUCTIONS:
HR Director issues within 10 business days of approved report (HR-FM-050). Same letter text to both parties (with outcome-appropriate variations).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Recipient (type=text, required=true, col=2)
- Role (Complainant / Respondent) (type=select, required=true, col=2, options=[Complainant | Respondent])
- Complaint ID (type=text, required=true, col=2)
- Letter Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Summary of Investigation (type=textarea, col=4)
- Outcome (substantiated / not / inconclusive â€” in generally-worded terms) (type=textarea, col=4)
- Action Taken (to extent disclosable) (type=textarea, col=4)
- Non-Retaliation Protections Reminder (type=textarea, col=4)
- External Filing Rights (EEOC / DFEH / NLRB) (type=textarea, col=4)
- Contact for Concerns (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- HR Director â€” Printed Name (type=text, col=2)
- HR Director â€” Signature (type=signature, col=1)
- HR Director â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-051 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- CONFIDENTIAL
- Linked Policies: HR-ER-001, HR-ER-005

---

## SOURCE: Builder\Forns\HR-FM-052.txt

FORM ID: HR-FM-052
TITLE: Employee WC Claim Intake (DWC-1 Support)
TYPE: Form
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-HS-001
- HR-HS-002
- RM-OS-001

PURPOSE:
Internal intake accompanying California DWC-1 Workers' Comp claim form â€” captures incident detail, body parts affected, treatment received, first-aid vs medical, and witness information.

INSTRUCTIONS:
HR provides DWC-1 to employee â‰¤ 1 business day of knowledge (CA Labor Code Â§ 5401). Returned DWC-1 forwarded to insurer within 5 days (Â§ 5402). This intake retained in confidential WC file.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee Name (type=text, required=true, col=2)
- Employee ID (type=text, required=true, col=2)
- Date of Injury (type=date, required=true, col=2)
- Date Reported to Employer (type=date, required=true, col=2)
- DWC-1 Provided Date (type=date, col=2)
- DWC-1 Returned Date (type=date, col=2)

SECTION 2: Section 2 â€” Injury Detail
layout: grid

fields:
- Location of Injury (type=text, col=2)
- Activity at Time (type=textarea, col=4)
- Body Part(s) Affected (type=textarea, col=4)
- Mechanism (type=textarea, col=4)
- Witnesses (type=textarea, col=4)
- Initial Treatment (first-aid / clinic / ER / none) (type=select, col=2, options=[First Aid | Clinic | ER | None | Other])
- Treating Provider (type=text, col=2)
- Lost Time Expected? (Y/N) (type=select, col=2, options=[Yes | No])

SECTION 3: Section 3 â€” Employer Reporting
layout: grid

fields:
- 5020 Report Filed? (Y/N) (type=select, col=2, options=[Yes | No])
- 5020 Filing Date (type=date, col=2)
- OSHA 300 Entry Required? (Y/N) (type=select, col=2, options=[Yes | No])
- Incident Report ID (RM-FM-006) (type=text, col=2)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- HR / WC Coordinator â€” Printed Name (type=text, col=2)
- HR â€” Signature (type=signature, col=1)
- HR â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-052 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- CONFIDENTIAL WC FILE
- Linked Policies: HR-HS-001, HR-HS-002, RM-OS-001

---

## SOURCE: Builder\Forns\HR-FM-053.txt

FORM ID: HR-FM-053
TITLE: Employer's Report of Occupational Injury (Form 5020 / State)
TYPE: Report
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-HS-001
- HR-HS-002
- RM-OS-001

PURPOSE:
Employer report of injury filed with WC carrier and state (California Form 5020 or equivalent). Required within 5 days of knowledge under CA Labor Code Â§ 6409.1 et seq.

INSTRUCTIONS:
HR/WC Coordinator completes and transmits to carrier. Copies retained in confidential file.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employer Name (type=text, required=true, col=2)
- Employer Address (type=text, col=2)
- WC Policy # (type=text, col=2)
- Date of Report (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Employee & Injury
layout: grid

fields:
- Employee Name / DOB / SSN (partial) (type=textarea, col=4)
- Date / Time of Injury (type=text, col=2)
- Location of Injury (type=text, col=2)
- Occupation (type=text, col=2)
- Part of Body Injured (type=textarea, col=4)
- Nature of Injury (type=textarea, col=4)
- Source / Mechanism (type=textarea, col=4)
- First Treated By (type=text, col=2)
- Date Returned to Work (if applicable) (type=date, col=2)

SECTION 3: Section 3 â€” Filing
layout: grid

fields:
- Carrier Submission Date (type=date, col=2)
- State Form Submission Date (type=date, col=2)
- OSHA 300 Entry Posted? (Y/N) (type=select, col=2, options=[Yes | No])

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- HR / WC Coordinator â€” Printed Name (type=text, col=2)
- HR â€” Signature (type=signature, col=1)
- HR â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-053 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-HS-001, HR-HS-002, RM-OS-001

---

## SOURCE: Builder\Forns\HR-FM-054.txt

FORM ID: HR-FM-054
TITLE: OSHA 300 / 300A Internal Tracker
TYPE: Log
DOMAIN: HR
USAGE: Required
FREQUENCY: Continuous
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-HS-001
- RM-OS-001

PURPOSE:
Internal tracker supporting OSHA Form 300 (Log of Work-Related Injuries and Illnesses), 300A Annual Summary, and 301 Incident Report. Supports Cal/OSHA posting (Feb 1â€“Apr 30) and ITA electronic submission.

INSTRUCTIONS:
Risk Manager / Safety Officer maintains continuously. 300A posted Feb 1â€“Apr 30. 300/300A ITA electronically submitted by March 2 each year.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Establishment Name (type=text, required=true, col=2)
- NAICS Code (type=text, col=2)
- Reporting Year (type=text, required=true, col=2)
- Preparer (type=text, col=2)

SECTION 2: Section 2 â€” 300 Log Entries
layout: grid

fields:
- Case # (type=text, col=2)
- Employee Name (type=text, col=2)
- Job Title (type=text, col=2)
- Date of Injury/Illness (type=date, col=2)
- Where Occurred (type=text, col=2)
- Injury / Illness Description (type=textarea, col=4)
- Classification (Death / Days Away / Job Transfer / Other Recordable) (type=select, col=2, options=[Death | Days Away | Job Transfer | Other Recordable])
- Days Away (type=text, col=2)
- Restricted Days (type=text, col=2)
- Type (Injury / Skin / Respiratory / Poison / Hearing / Other illness) (type=select, col=2, options=[Injury | Skin | Respiratory | Poison | Hearing | Other])

SECTION 3: Section 3 â€” 300A Summary
layout: grid

fields:
- Total Cases with Days Away (type=text, col=2)
- Total Cases with Job Transfer/Restriction (type=text, col=2)
- Total Other Recordable (type=text, col=2)
- Total Days Away (type=text, col=2)
- Total Restricted Days (type=text, col=2)
- Annual Average # Employees (type=text, col=2)
- Total Hours Worked (type=text, col=2)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Risk Manager â€” Printed Name (type=text, col=2)
- Risk Manager â€” Signature (type=signature, col=1)
- Risk Manager â€” Date (type=date, col=1)
- Company Executive (for 300A) â€” Printed Name (type=text, col=2)
- Executive â€” Signature (type=signature, col=1)
- Executive â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-054 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-HS-001, RM-OS-001

---

## SOURCE: Builder\Forns\HR-FM-055.txt

FORM ID: HR-FM-055
TITLE: Separation Intake
TYPE: Form
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-002
- HR-ER-006

PURPOSE:
Intake for employee separations (voluntary / involuntary / retirement / death / layoff). Triggers offboarding workflow: final pay, benefits, COBRA, equipment return, access termination, references policy.

INSTRUCTIONS:
HR initiates upon notice of separation. Final pay in CA due on last day (involuntary) or within 72 hours (voluntary without notice).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee Name (type=text, required=true, col=2)
- Employee ID (type=text, required=true, col=2)
- Department / Supervisor (type=text, col=2)
- Separation Date (type=date, required=true, col=2)
- Separation Type (Voluntary / Involuntary / Retirement / Layoff / Death / Other) (type=select, required=true, col=2, options=[Voluntary | Involuntary | Retirement | Layoff | Death | Other])
- Reason / Rehire Eligibility (type=textarea, col=4)

SECTION 2: Section 2 â€” Process Checklist
layout: grid

fields:
- IT Access Termination Ticket (IT-FM-002) (type=text, col=2)
- Equipment Return Checklist (HR-FM-056) (type=text, col=2)
- Final Pay Calculation Date (type=date, col=2)
- PTO Payout Amount (type=text, col=2)
- Benefits Exit Packet Issued (HR-FM-057) (type=text, col=2)
- COBRA Notice Sent (HR-FM-057) (type=text, col=2)
- Exit Interview Scheduled (HR-FM-058) (type=text, col=2)
- References / Verification Process Reminder (type=textarea, col=4)
- Unemployment Insurance (EDD) Notice (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee (if available) â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- HR â€” Printed Name (type=text, col=2)
- HR â€” Signature (type=signature, col=1)
- HR â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-055 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-ER-002, HR-ER-006

---

## SOURCE: Builder\Forns\HR-FM-056.txt

FORM ID: HR-FM-056
TITLE: Asset Return Checklist (Separation)
TYPE: Checklist
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-002
- IT-SP-001

PURPOSE:
Controls return of all company-issued assets upon separation (laptop, phone, badge, keys, vehicle, credit card, VPN tokens, PHI-containing documents). Coordinates with IT de-provisioning and facilities badge revocation.

INSTRUCTIONS:
Supervisor and HR complete by separation date; physical access revoked same-day; IT-FM-002 submitted in parallel.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee Name (type=text, required=true, col=2)
- Employee ID (type=text, required=true, col=2)
- Separation Date (type=date, required=true, col=2)
- Supervisor (type=text, col=2)

SECTION 2: Section 2 â€” Assets
layout: grid

fields:
- Laptop / Tablet (serial #) (type=text, col=2)
- Mobile Phone (type=text, col=2)
- Badge (ID) (type=text, col=2)
- Keys (description) (type=text, col=2)
- Vehicle (if assigned) (type=text, col=2)
- Credit Card / P-Card (type=text, col=2)
- VPN Token / MFA Device (type=text, col=2)
- Uniform / PPE (type=text, col=2)
- Hard-copy PHI / Records Returned (type=textarea, col=4)
- Intellectual Property / Data Returned (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- IT (for tech) â€” Printed Name (type=text, col=2)
- IT â€” Signature (type=signature, col=1)
- IT â€” Date (type=date, col=1)
- Facilities (badge) â€” Printed Name (type=text, col=2)
- Facilities â€” Signature (type=signature, col=1)
- Facilities â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-056 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-ER-002, IT-SP-001

---

## SOURCE: Builder\Forns\HR-FM-057.txt

FORM ID: HR-FM-057
TITLE: Benefits Exit Packet (COBRA / HIPP / Retirement)
TYPE: Packet
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-ER-002
- HR-TC-001

PURPOSE:
Consolidates all benefit termination and continuation notices required at separation: COBRA election notice (29 CFR Â§ 2590.606-4, 14-day rule), HIPP notices, retirement-plan distribution notices, CA HIPP Notice of Plan Coverage, life-insurance conversion options.

INSTRUCTIONS:
HR issues within 14 days of separation (COBRA). Retirement distributions per plan. Retained 7+ years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee Name (type=text, required=true, col=2)
- Employee ID (type=text, required=true, col=2)
- Separation Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Notices Issued
layout: grid

fields:
- COBRA Election Notice (date issued) (type=date, col=2)
- HIPP / Qualifying Event Notice (date) (type=date, col=2)
- Retirement Plan Distribution Notice (401k / 403b) (type=date, col=2)
- Life Insurance Conversion Notice (type=date, col=2)
- HSA / FSA Termination Notice (type=date, col=2)
- Unemployment (EDD) Notice (CA Pam 2320) (type=date, col=2)
- Final Paystub Info (Labor Code Â§ 226) (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- HR â€” Printed Name (type=text, col=2)
- HR â€” Signature (type=signature, col=1)
- HR â€” Date (type=date, col=1)
- Employee Acknowledgment (receipt) â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-057 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-ER-002, HR-TC-001

---

## SOURCE: Builder\Forns\HR-FM-058.txt

FORM ID: HR-FM-058
TITLE: Exit Interview
TYPE: Form
DOMAIN: HR
USAGE: Optional
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: hr

LINKED POLICIES:
- HR-ER-002
- HR-ER-006

PURPOSE:
Captures departing employee feedback on role, manager, culture, safety, ethics hotline awareness, unreported concerns, and overall engagement. Trends feed QAPI and HR analytics.

INSTRUCTIONS:
Offered by HR; voluntary; anonymized quarterly trends reported to leadership.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee Name (optional if anonymized) (type=text, col=2)
- Department (type=text, col=2)
- Separation Date (type=date, col=2)
- Interview Date (type=date, col=2)

SECTION 2: Section 2 â€” Feedback
layout: grid

fields:
- Reason for Leaving (type=textarea, col=4)
- Role & Workload Feedback (type=textarea, col=4)
- Manager Feedback (type=textarea, col=4)
- Training & Development (type=textarea, col=4)
- Compensation & Benefits (type=textarea, col=4)
- Safety Concerns? (type=textarea, col=4)
- Ethics / Compliance Concerns (any unreported)? (type=textarea, col=4)
- Hotline (CO-FM-003) Awareness (Y/N) (type=select, col=2, options=[Yes | No])
- Would you recommend Care Indeed? (Y/N) (type=select, col=2, options=[Yes | No])
- Suggestions (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- HR Interviewer â€” Printed Name (type=text, col=2)
- HR â€” Signature (type=signature, col=1)
- HR â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-058 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-ER-002, HR-ER-006

---

## SOURCE: Builder\Forns\HR-FM-059.txt

FORM ID: HR-FM-059
TITLE: Worker Classification Determination (Employee vs 1099)
TYPE: Determination
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-TC-002
- FN-BC-001

PURPOSE:
Documented analysis of worker classification (employee vs independent contractor) applying California AB 5 / ABC test, IRS 20-factor test, and applicable Labor Code exemptions. Mitigates misclassification risk.

INSTRUCTIONS:
HR + Legal complete before engagement and at annual review. Supports FN (1099 / W-2 / payroll) and tax reporting.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Worker Name / Entity (type=text, required=true, col=2)
- Engagement Description (type=textarea, col=4)
- Determination Date (type=date, required=true, col=2)
- Reviewer(s) (type=text, col=2)

SECTION 2: Section 2 â€” ABC Test (AB 5)
layout: grid

fields:
- A. Free from control and direction? (Y/N) (type=select, col=2, options=[Yes | No])
- B. Work outside the usual course of the hiring entity's business? (Y/N) (type=select, col=2, options=[Yes | No])
- C. Customarily engaged in independently established trade? (Y/N) (type=select, col=2, options=[Yes | No])
- Applicable AB 5 Exemption (business-to-business / professional services / etc.)? (type=textarea, col=4)

SECTION 3: Section 3 â€” IRS 20-Factor Summary
layout: grid

fields:
- Behavioral Control (type=textarea, col=4)
- Financial Control (type=textarea, col=4)
- Relationship of the Parties (type=textarea, col=4)

SECTION 4: Section 4 â€” Determination
layout: grid

fields:
- Classification (W-2 Employee / 1099 Independent Contractor / Agency / Other) (type=select, required=true, col=2, options=[W-2 Employee | 1099 Independent Contractor | Agency | Other])
- Rationale (type=textarea, col=4)
- Annual Re-Review Date (type=date, col=2)

SECTION 5: Section â€” Signatures & Attestation
layout: signature

fields:
- HR Director â€” Printed Name (type=text, col=2)
- HR Director â€” Signature (type=signature, col=1)
- HR Director â€” Date (type=date, col=1)
- Legal Counsel â€” Printed Name (type=text, col=2)
- Legal Counsel â€” Signature (type=signature, col=1)
- Legal Counsel â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-059 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-TC-002, FN-BC-001

---

## SOURCE: Builder\Forns\HR-FM-060.txt

FORM ID: HR-FM-060
TITLE: Reclassification Action
TYPE: Form
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-TC-002
- FN-BC-001

PURPOSE:
Executes a reclassification of a worker's status (e.g., 1099 â†’ W-2) based on HR-FM-059 review, including payroll setup, back-wage analysis, tax remediation (941-X), and benefits eligibility.

INSTRUCTIONS:
HR + Payroll + Legal. Any back-wage or tax exposure reported to CFO and Compliance Officer.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Worker Name (type=text, required=true, col=2)
- Prior Classification (type=text, required=true, col=2)
- New Classification (type=text, required=true, col=2)
- Effective Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Remediation
layout: grid

fields:
- Back Wages Owed? (Y/N) (type=select, col=2, options=[Yes | No])
- Back-Wage Calculation (type=textarea, col=4)
- 941-X / State Tax Amendment Required? (Y/N) (type=select, col=2, options=[Yes | No])
- Benefits Retroactive Eligibility? (type=textarea, col=4)
- Communication to Worker (type=textarea, col=4)
- Compliance Officer Notified? (Y/N) (type=select, col=2, options=[Yes | No])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- HR Director â€” Printed Name (type=text, col=2)
- HR Director â€” Signature (type=signature, col=1)
- HR Director â€” Date (type=date, col=1)
- Payroll â€” Printed Name (type=text, col=2)
- Payroll â€” Signature (type=signature, col=1)
- Payroll â€” Date (type=date, col=1)
- Legal Counsel â€” Printed Name (type=text, col=2)
- Legal Counsel â€” Signature (type=signature, col=1)
- Legal Counsel â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-060 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-TC-002, FN-BC-001

---

## SOURCE: Builder\Forns\HR-FM-061.txt

FORM ID: HR-FM-061
TITLE: Meal Period Attestation (CA Non-Exempt)
TYPE: Attestation
DOMAIN: HR
USAGE: Required
FREQUENCY: Daily
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-TC-003

PURPOSE:
Daily (or per-shift) attestation by non-exempt employees confirming compliance with California Labor Code Â§Â§ 226.7 and 512 meal-period and IWC Wage Order rest-break provisions.

INSTRUCTIONS:
Time-tracking system auto-generates daily prompt when shift â‰¥ 5 hours. Exceptions logged with premium-pay trigger.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee Name (type=text, required=true, col=2)
- Date of Shift (type=date, required=true, col=2)
- Shift Hours (type=text, col=2)

SECTION 2: Section 2 â€” Attestation
layout: grid

fields:
- Did you take a duty-free, uninterrupted 30-minute meal period before the end of your 5th hour? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- If No, reason (type=textarea, col=4)
- Did you take rest breaks (10 min per 4 hours)? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Waiver used (if applicable â€” shift â‰¤ 6 hrs)? (Y/N) (type=select, col=2, options=[Yes | No | NA])
- Premium-Pay Trigger Required? (Y/N) (type=select, col=2, options=[Yes | No])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Employee â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-061 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-TC-003

---

## SOURCE: Builder\Forns\HR-FM-062.txt

FORM ID: HR-FM-062
TITLE: Overtime Authorization
TYPE: Authorization
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-TC-003

PURPOSE:
Pre-approval of overtime for non-exempt staff (FLSA / CA daily & weekly OT rules). Mitigates unauthorized OT and off-the-clock work risk; feeds payroll and budget variance reviews.

INSTRUCTIONS:
Supervisor pre-approves where possible; retroactive only with HR review. All hours worked are paid regardless of authorization per FLSA.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Employee Name (type=text, required=true, col=2)
- Supervisor (type=text, required=true, col=2)
- Request Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Authorization
layout: grid

fields:
- Date(s) of OT (type=text, col=2)
- Anticipated Hours (type=text, col=2)
- Reason / Justification (type=textarea, col=4)
- OT Rate Applicable (1.5x daily > 8 / weekly > 40 / 2x > 12 hrs per CA) (type=select, col=2, options=[1.5x | 2x | Other])
- Budget / Cost Center (type=text, col=2)
- Approved / Denied (type=select, required=true, col=2, options=[Approved | Denied])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- Employee Acknowledgment â€” Printed Name (type=text, col=2)
- Employee â€” Signature (type=signature, col=1)
- Employee â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-062 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-TC-003

---

## SOURCE: Builder\Forns\HR-FM-063.txt

FORM ID: HR-FM-063
TITLE: Wage Complaint Intake
TYPE: Form
DOMAIN: HR
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- HR-TC-003
- HR-ER-005

PURPOSE:
Intake of wage / hour / meal & rest / pay-stub complaints. Triggers HR investigation (HR-FM-048/050), legal review, and remediation (back wages, waiting-time penalties, 226 pay-stub correction). Anti-retaliation protections apply.

INSTRUCTIONS:
HR logs within same day of receipt; legal reviews within 5 business days; remediation within 30 days where substantiated.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Complainant (or Anonymous) (type=text, col=2)
- Employee ID (type=text, col=2)
- Complaint ID (type=text, required=true, col=2)
- Date Received (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Complaint
layout: grid

fields:
- Nature (unpaid OT / off-the-clock / meal premium / rest premium / pay-stub / final-pay / minimum wage / other) (type=select, required=true, col=2, options=[Unpaid OT | Off-the-clock | Meal Premium | Rest Premium | Pay-stub (Labor Code 226) | Final Pay | Minimum Wage | Other])
- Period Covered (type=text, col=2)
- Amount in Dispute (type=text, col=2)
- Narrative (type=textarea, col=4)
- Documentation Provided (time records, pay stubs) (type=textarea, col=4)

SECTION 3: Section 3 â€” Disposition
layout: grid

fields:
- Investigation Opened (Y/N) (type=select, col=2, options=[Yes | No])
- Finding (substantiated / not / partial) (type=select, col=2, options=[Substantiated | Not Substantiated | Partial | Pending])
- Remediation (back wages / corrected pay stubs / training / control change) (type=textarea, col=4)
- Waiting-Time Penalty (CA Labor Code Â§ 203) assessed? (Y/N) (type=select, col=2, options=[Yes | No | NA])
- Closure Date (type=date, col=2)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- HR â€” Printed Name (type=text, col=2)
- HR â€” Signature (type=signature, col=1)
- HR â€” Date (type=date, col=1)
- Legal Counsel â€” Printed Name (type=text, col=2)
- Legal Counsel â€” Signature (type=signature, col=1)
- Legal Counsel â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form HR-FM-063 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: HR-TC-003, HR-ER-005

---

## SOURCE: Builder\Forns\HR-JD-000.txt

DOCUMENT ID: HR-JD-000
TITLE: Governing Body â€” Structure & Responsibilities
TYPE: Job Description
DOMAIN: HR
SUBDOMAIN: JD
USAGE: Required
FREQUENCY: Biennial Review
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2027-07-10
ORIENTATION: portrait
CLASSIFICATIONS: governance, leadership, regulatory_critical

LINKED POLICIES:
- HR-TA-006 (Job Description & Role Definition)
- GV-GB-001 (Governing Body Authority & Responsibilities)
- GV-GB-002 (Board Meeting & Minutes Requirements)
- GV-GB-003 (Conflict of Interest Disclosure)

POSITION SUMMARY:
The Governing Body constitutes the legal authority responsible for the overall operation and management of Care Indeed Home Health Care, Inc., as required under 42 CFR Â§ 484.105(a). The Governing Body assumes full legal accountability for the agency's compliance with all applicable Medicare Conditions of Participation, state licensure requirements, and organizational policies. This document defines the collective structure, composition requirements, authority, and responsibilities of the Governing Body.

---

SECTION 1: Core Responsibilities
layout: list

responsibilities:
- Assume full legal responsibility for the operation and management of the agency, including all patient care and organizational functions.
- Appoint and oversee the Administrator, ensuring qualifications meet 42 CFR Â§ 484.115 and state licensure requirements.
- Appoint and oversee the Clinical Manager (Director of Nursing), ensuring qualifications meet 42 CFR Â§ 484.115.
- Review and approve the Annual Institutional Plan and Budget as required under 42 CFR Â§ 484.105(h).
- Review and approve the agency's Acceptance-to-Service policies and public information disclosures annually (42 CFR Â§ 484.105(i)).
- Receive and review Quarterly Compliance Reports, QAPI program reports, and quality outcome data.
- Approve all major organizational policies and significant policy revisions.
- Ensure the agency maintains all required Medicare and state certifications/licenses.
- Convene at minimum quarterly meetings; conduct emergency sessions when required (Immediate Jeopardy, sentinel event, ownership change).
- Ensure an effective QAPI program is implemented and maintained (42 CFR Â§ 484.65).
- Authorize conflict-of-interest disclosures and manage recusals (42 CFR Â§ 484.105).
- Approve any change of ownership, merger, acquisition, or agency closure.

SECTION 2: Composition & Qualifications
layout: list

requirements:
- Minimum of two (2) members constituting a legal entity under applicable state law (California).
- Members may include owners, directors, officers, or designated representatives as authorized by organizational documents.
- At least one member must be capable of executing legal documents on behalf of the agency.
- All members subject to OIG/SAM exclusion screening at appointment and monthly thereafter.
- Members must not appear on any state or federal healthcare exclusion lists.
- Completion of Governing Body Orientation within 90 days of appointment.
- Annual training on CMS CoP requirements, QAPI, and compliance obligations.
- Disclosure of all potential conflicts of interest at appointment and annually.

SECTION 3: Required Competencies
layout: list

competencies:
- Understanding of 42 CFR Part 484 Medicare Home Health Conditions of Participation.
- Understanding of fiduciary duty and legal accountability in healthcare governance.
- Financial literacy sufficient to review and approve annual budgets and institutional plans.
- Knowledge of QAPI program requirements and quality outcome interpretation.
- Awareness of HIPAA, state licensing requirements, and applicable employment law.
- Ability to review compliance reports and direct corrective action when warranted.

SECTION 4: Regulatory Responsibilities
layout: list

regulations:
- 42 CFR Â§ 484.105(a) â€” Full legal accountability for agency operations and patient care.
- 42 CFR Â§ 484.105(b) â€” Appointment and oversight of Administrator.
- 42 CFR Â§ 484.105(c) â€” Appointment and oversight of Clinical Manager.
- 42 CFR Â§ 484.105(h) â€” Annual Institutional Plan & Budget approval.
- 42 CFR Â§ 484.105(i) â€” Acceptance-to-service and public information review.
- 42 CFR Â§ 484.65 â€” QAPI program governance and oversight.
- 42 USC Â§ 1320a-7 â€” OIG/SAM exclusion screening compliance for all members.
- CA Health & Safety Code Â§ 1726 et seq. â€” State home health agency licensure.

SECTION 5: Documentation Responsibilities
layout: list

documentation:
- Approve meeting minutes within 30 days of each Governing Body meeting.
- Maintain signed conflict-of-interest disclosure forms for each member (GV-FM-009).
- Document Administrator and Clinical Manager appointment actions with supporting credentials.
- Retain signed institutional plan and budget approval records.
- Maintain OIG/SAM exclusion screening records for all members (GV-FM-008).
- Preserve all Governing Body meeting minutes, attendance rosters, and resolution records per Medicare retention requirements (5 years minimum).

SECTION 6: Supervision Responsibilities
layout: list

supervision:
- Directly oversees: Administrator (HR-JD-001)
- Indirectly oversees (through Administrator): All agency personnel and clinical operations.
- Authority to appoint, evaluate, and terminate the Administrator.
- Authority to appoint and oversee the Clinical Manager (HR-JD-003) in coordination with Administrator.

SECTION 7: Physical Requirements
layout: list

physical:
- Primarily sedentary function; capacity to attend in-person, virtual, or hybrid meetings.
- No clinical physical requirements.

SECTION 8: Working Conditions
layout: list

conditions:
- Meetings conducted quarterly minimum; additional sessions as required.
- May include in-person, telephonic, or virtual participation as authorized by organizational documents.
- Subject to survey observation by CMS and state surveyors.

SECTION 9: Performance Expectations
layout: list

expectations:
- 100% attendance at required quarterly meetings or documented proxy/written consent.
- Timely review and approval of all submitted compliance, QAPI, and financial reports.
- Zero outstanding unapproved conflict-of-interest disclosures.
- Current OIG/SAM screening status for all members â€” no exclusions.
- Timely approval of institutional plan and budget (prior to fiscal year start).
- All Governing Body orientations and annual trainings completed and documented.

SECTION 10: Policy Cross-References
layout: list

policies:
- HR-TA-006 â€” Job Description & Role Definition (controls this document)
- GV-GB-001 â€” Governing Body Authority & Responsibilities (primary operational policy)
- GV-GB-002 â€” Board Meeting & Minutes Requirements (meeting cadence, quorum, minutes approval)
- GV-GB-003 â€” Conflict of Interest Disclosure (annual COI obligations for all members)
- GV-GB-004 â€” Succession Planning for Key Leadership (Administrator and Clinical Manager succession)
- GV-GB-005 â€” Annual Governance Self-Assessment (annual review cycle)
- CO-CP-001 â€” Corporate Compliance Program (quarterly Compliance Report recipient)
- QA-PG-001 â€” QAPI Program Governance (quarterly QAPI Report recipient; approves QAPI program)
- EN-PM-001 â€” Policy Management (approves major agency policy revisions)

SECTION 11: Measurable Performance Standards
layout: list

standards:
- Meeting frequency: â‰¥ 4 Governing Body meetings per calendar year; maximum interval 120 days between meetings â€” per GV-GB-002; 0 missed quarters without documented emergency cause.
- Emergency session response: convened within 72 hours of Immediate Jeopardy citation, sentinel event, or material ownership change â€” per GV-GB-002; 100% compliance.
- Conflict-of-interest disclosures: 100% of members with current signed disclosure on file at all times; 0 overdue disclosures at any point in the calendar year â€” per GV-GB-003.
- Meeting minutes: approved at the immediate subsequent meeting â€” 100% completion rate; no more than one session lapsed unapproved â€” per GV-GB-002.
- OIG/SAM screening: all Governing Body members screened monthly; 0 excluded members participating in governance activities â€” per 42 USC Â§ 1320a-7.
- Annual Institutional Plan & Budget: approved by Governing Body before the start of the fiscal year â€” 0 years where approval occurs after fiscal year start â€” per 42 CFR Â§ 484.105(h).
- Annual Governance Self-Assessment (GV-GB-005): completed and documented every 12 months â€” 0 missed cycles.
- Member orientation: 100% of new members complete orientation within 90 days of appointment â€” per GV-GB-001.
- Annual training: 100% of members complete required annual CMS CoP/QAPI/compliance training â€” documented in GV-FM-024.

SECTION 12: Documentation Ownership
layout: list

owned_records:
- GV-FM-005 â€” Governing Body Meeting Minutes: Chair approves; Secretary prepares; Administrator retains. Primary CoP survey artifact.
- GV-FM-006 â€” Annual Governance Self-Assessment: Chair owns; completed annually; retained with GV-FM-005.
- GV-FM-008 â€” OIG/SAM Exclusion Screening Log (Governing Body Members): Administrator maintains on behalf of Board; Chair accountable.
- GV-FM-009 â€” Conflict of Interest Disclosure Forms: Chair owns collection and retention; one form per member per year.
- GV-FM-021 â€” Board Member Appointment & Resignation Record: Chair authorizes; Administrator retains.
- GV-FM-022 â€” Executive Session Minutes: Chair owns; restricted access; separate from regular meeting minutes.
- GV-FM-024 â€” Governing Body Training & Education Log: Chair accountable; Administrator maintains.
- Annual Institutional Plan & Budget approval record: Chair signs; co-signed by Administrator; retained in governance file.
- Administrator and Clinical Manager appointment documentation (credentialing): Governing Body Chair authorizes; Administrator retains.

SECTION 13: Escalation Responsibilities
layout: list

escalation:
- Immediate Jeopardy (IJ) citation by CMS or state surveyor â†’ Administrator notifies Governing Body Chair within 24 hours; emergency Board session convened within 72 hours; Legal Counsel engaged; corrective action authorized by Board.
- Unplanned Administrator vacancy or incapacity â†’ Governing Body Chair activates succession plan (GV-GB-004) within 24 hours; Administrator Designee (HR-JD-002) formally activated; Governing Body notified.
- Unplanned Clinical Manager vacancy â†’ Governing Body Chair + Administrator activate Clinical Designee (HR-JD-004); appointment process initiated within 30 days.
- Sentinel event (patient death or serious injury attributable to agency error) â†’ Administrator briefs Governing Body Chair within 24 hours; Board briefed at emergency session within 72 hours; all mandatory reporting completed.
- Agency licensure or Medicare certification lapse, denial, or suspension â†’ Administrator notifies Chair immediately; emergency Board authorization required for any regulatory response or operational change.
- Federal exclusion finding for any Governing Body member â†’ Chair immediately removes member from all governance activities; Administrator and Legal Counsel notified same business day.
- Material financial variance (>10% budget deviation or financial fraud allegation) â†’ Chair convenes emergency session; Compliance Officer and Legal Counsel engaged.

SECTION 14: Required Forms
layout: list

forms:
- GV-FM-005 â€” Governing Body Meeting Minutes (required at every regular and special meeting)
- GV-FM-006 â€” Annual Governance Self-Assessment (annual; filed with meeting record)
- GV-FM-008 â€” OIG/SAM Exclusion Screening Log â€” Governing Body Members (monthly)
- GV-FM-009 â€” Conflict of Interest Disclosure Form (at appointment; annually thereafter)
- GV-FM-021 â€” Board Member Appointment & Resignation Record (upon each appointment or resignation)
- GV-FM-022 â€” Executive Session Minutes Template (when executive session is convened)
- GV-FM-023 â€” Annual Compliance Report to Governing Body (received and approved annually)
- GV-FM-024 â€” Governing Body Training & Education Log (ongoing; updated after each training event)

SECTION 15: Onboarding & Competency Requirements
layout: list

This role is governed by the Role-Based Onboarding & Competency Journey.

Required Training Path:
- General Orientation (GAO Series)

Competency Requirements:
- Initial competency validation (HR-TD-003 Appendix A)
- Supervised experience (if applicable)
- Clearance required prior to independent duties

Ongoing Compliance:
- Annual training (HR-TD-001)
- Annual competency evaluation
- Monthly compliance screening (OIG/SAM)

Refer to:
Role-Based Onboarding & Competency Journey (Master Framework)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Document HR-JD-000 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2027-07-10
- Linked Policies: HR-TA-006, GV-GB-001, GV-GB-002, GV-GB-003
- Regulatory Authority: 42 CFR Â§ 484.105(a)-(i); 42 CFR Â§ 484.65; 42 USC Â§ 1320a-7

---

## SOURCE: Builder\Forns\HR-JD-001.txt

DOCUMENT ID: HR-JD-001
TITLE: Administrator
TYPE: Job Description
DOMAIN: HR
SUBDOMAIN: JD
USAGE: Required
FREQUENCY: Biennial Review
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2027-07-10
ORIENTATION: portrait
CLASSIFICATIONS: leadership, executive, regulatory_critical

LINKED POLICIES:
- HR-TA-006 (Job Description & Role Definition)
- HR-TA-001 (Recruitment & Hiring Standards)
- HR-TA-004 (Licensure & Certification Verification)
- GV-GB-001 (Governing Body Authority & Responsibilities)
- GV-GB-004 (Succession Planning for Key Leadership)

POSITION SUMMARY:
The Administrator is the individual appointed by the Governing Body who is responsible for the day-to-day management and operations of Care Indeed Home Health Care, Inc., as required under 42 CFR Â§ 484.105(b). The Administrator serves as the single accountable executive for operational, financial, compliance, and clinical oversight functions of the agency and acts as the primary liaison between the Governing Body and all agency operations. The Administrator must meet minimum qualifications as specified under 42 CFR Â§ 484.115 and applicable California licensure requirements.

---

SECTION 1: Core Responsibilities
layout: list

responsibilities:
- Direct and supervise all agency operations in compliance with Medicare Conditions of Participation (42 CFR Part 484) and applicable state law.
- Appoint and oversee the Administrator Designee (HR-JD-002) to ensure continuity during absences.
- Work collaboratively with the Director of Nursing / Clinical Manager (HR-JD-003) to ensure clinical quality, compliance, and patient safety.
- Serve as primary liaison to the Governing Body; prepare and present quarterly reports including compliance, QAPI, and financial performance.
- Ensure the agency maintains all required Medicare certifications, state licenses, and accreditations.
- Oversee implementation and ongoing management of the Compliance Program (CO domain).
- Review and approve agency policies and procedures; ensure annual review cycles are maintained.
- Maintain and submit the Annual Institutional Plan and Budget for Governing Body approval (42 CFR Â§ 484.105(h)).
- Ensure annual Acceptance-to-Service policy and Public Information disclosures are reviewed and updated (42 CFR Â§ 484.105(i)).
- Oversee all HR functions including hiring, credentialing, training, performance management, and disciplinary processes.
- Respond to CMS/state survey findings; develop and implement Plans of Correction within required timeframes.
- Ensure timely reporting of all required reportable events to CMS, state agencies, and Governing Body.
- Maintain a current and operational QAPI program in coordination with the QAPI Lead.
- Ensure all staff meet OIG/SAM exclusion screening requirements and that excluded individuals are not employed.
- Authorize contracts, business associate agreements, and vendor arrangements as designated by Governing Body authority.

SECTION 2: Minimum Qualifications
layout: list

qualifications:
- Required: Meets at least one of the following â€” Licensed physician; Licensed registered nurse (RN); Hold a baccalaureate degree in health administration, public health, business administration, or related field with a minimum of 1 year supervisory or administrative experience in health services (42 CFR Â§ 484.115).
- Required: No current exclusion from federal or state healthcare programs (OIG/SAM).
- Required: Meets California CDPH Administrator qualification requirements for licensed home health agencies.
- Preferred: Master's degree in health administration (MHA), public health (MPH), nursing (MSN), or business administration (MBA).
- Preferred: Minimum 3 years of progressive leadership experience in a Medicare-certified home health agency.
- Required: No history of healthcare fraud, program integrity violations, or unresolved compliance sanctions.

SECTION 3: Required Competencies
layout: list

competencies:
- Comprehensive knowledge of 42 CFR Part 484 Medicare Home Health Conditions of Participation.
- Financial management: budget development, variance analysis, revenue cycle oversight.
- Human resources leadership: workforce planning, hiring, performance management, employment law.
- Compliance program management: HIPAA, OIG, False Claims Act, anti-kickback statute.
- QAPI program oversight and quality outcome interpretation (OASIS-based measures, HHCAHPS).
- Strategic planning, organizational development, and change management.
- Survey readiness and response: CMS Certification and Survey Provider Enhanced Reporting (CASPER), Plans of Correction.
- Strong written and verbal communication; ability to represent the agency to external stakeholders.
- Proficiency with EHR systems and agency management software.
- Crisis management and emergency operations decision-making.

SECTION 4: Regulatory Responsibilities
layout: list

regulations:
- 42 CFR Â§ 484.105(b) â€” Appointment and operational accountability as Administrator.
- 42 CFR Â§ 484.115 â€” Meets personnel qualifications for Administrator role.
- 42 CFR Â§ 484.105(h) â€” Annual Institutional Plan & Budget submission.
- 42 CFR Â§ 484.105(i) â€” Annual Acceptance-to-Service and public information review.
- 42 CFR Â§ 484.65 â€” QAPI program executive accountability.
- 42 USC Â§ 1320a-7 â€” OIG/SAM exclusion compliance (self and all agency employees).
- HIPAA 45 CFR Parts 160 & 164 â€” Privacy/Security Officer designation (or oversight of designated officers).
- CA Health & Safety Code Â§ 1726 et seq. â€” State licensure compliance and reporting.
- 29 CFR Â§ 1910 / Cal/OSHA IIPP â€” Workplace safety program oversight.
- False Claims Act (31 USC Â§ 3729 et seq.) â€” Revenue integrity and claims accuracy accountability.

SECTION 5: Documentation Responsibilities
layout: list

documentation:
- Execute Administrator Appointment/Delegation documentation at hire and when designating Administrator Designee.
- Sign and submit Plans of Correction to CMS/state following survey findings.
- Co-sign Annual Institutional Plan and Budget approval records.
- Review and approve all agency policies prior to Governing Body ratification.
- Maintain current employment and credential documentation in personnel file.
- Document all reportable event notifications to regulatory bodies.
- Approve and retain Compliance Program review records.

SECTION 6: Supervision Responsibilities
layout: list

supervision:
- Direct reports typically include: Administrator Designee (HR-JD-002), Director of Nursing/Clinical Manager (HR-JD-003), Compliance Officer/Coordinator, Finance Director/Manager, HR Director, Operations Director.
- Authority to hire, evaluate, discipline, and terminate all agency personnel (except Governing Body members).
- Responsible for annual performance evaluations of all direct reports.

SECTION 7: Physical Requirements
layout: list

physical:
- Sedentary to light work: prolonged periods of sitting, computer use, and administrative tasks.
- Ability to attend meetings, conduct facility walkthroughs, and represent agency externally.
- Valid California driver's license and reliable transportation for any multi-site oversight responsibilities.

SECTION 8: Working Conditions
layout: list

conditions:
- Full-time, exempt position; hours extend beyond standard business hours as agency needs require.
- Primary work location: agency office; may include field visits, regulatory meetings, and external engagements.
- Subject to 24/7 accountability for agency operations and emergency response.
- On-call availability required for reportable events, sentinel events, and survey activity.

SECTION 9: Performance Expectations
layout: list

expectations:
- Zero CoP-level (Condition of Participation) deficiencies left uncorrected beyond Plan of Correction due date.
- Annual Institutional Plan and Budget submitted and approved before fiscal year start.
- 100% OIG/SAM screening compliance for all agency personnel.
- QAPI program operational with documented quarterly reviews and measurable improvement projects.
- All licensures, certifications, and accreditations current â€” no lapses.
- All direct-report performance evaluations completed on schedule.
- Agency patient satisfaction scores (HHCAHPS) at or above applicable benchmarks.
- Governing Body meeting materials prepared and distributed â‰¥7 days in advance of each meeting.

SECTION 10: Policy Cross-References
layout: list

policies:
- HR-TA-006 â€” Job Description & Role Definition (controls this document)
- HR-TA-001 â€” Recruitment & Hiring Standards (owns agency-wide hiring compliance)
- HR-TA-004 â€” Licensure & Certification Verification (owns credential verification program)
- HR-TA-005 â€” Employee Orientation & Onboarding (owns program)
- GV-GB-001 â€” Governing Body Authority & Responsibilities (accountable to Board under this policy)
- GV-GB-004 â€” Succession Planning for Key Leadership (designates Administrator Designee)
- CO-CP-001 â€” Corporate Compliance Program (executive accountable; presents quarterly to Board)
- QA-PG-001 â€” QAPI Program Governance (executive accountable; ensures program is operational)
- EN-PM-001 â€” Policy Management (approves all agency policies pre-Board ratification)
- CO-RA-001 â€” Regulatory Licensure & Certification Management (owner: ensures zero licensure lapses)
- HR-TA-003 â€” OIG/SAM Exclusion Screening (accountable for 100% screening of all personnel)

SECTION 11: Measurable Performance Standards
layout: list

standards:
- Plans of Correction: submitted to CMS/state within mandated deadline (typically 10 calendar days of survey exit) â€” 0 late submissions; 0 CoP deficiencies left unresolved past POC due date â€” per 42 CFR Â§ 488.28.
- OIG/SAM screening compliance: 100% of employees and contractors screened at hire and monthly â€” 0 excluded individuals in active service â€” per HR-TA-003 and 42 USC Â§ 1320a-7.
- Annual Institutional Plan & Budget: submitted to Governing Body â‰¥ 30 days before fiscal year start â€” 0 late submissions â€” per GV-GB-001 and 42 CFR Â§ 484.105(h).
- Policy review cycle: 100% of policies with annual review requirement completed within fiscal year â€” 0 overdue reviews â€” per EN-PM-001.
- Reportable events: notification to applicable regulatory body within regulatory deadline (event-type specific) â€” 0 late mandatory reports.
- QAPI program: â‰¥ 1 active documented Performance Improvement Project (PIP) at all times; quarterly review documented in writing â€” per QA-PG-001.
- Agency licensure/certification renewals: applications submitted â‰¥ 90 days before expiration â€” 0 lapses â€” per CO-RA-001.
- Direct-report performance evaluations: 100% completed within 30 days of scheduled due date â€” per HR-PM-001.
- Governing Body meeting packets: distributed â‰¥ 7 days prior to each meeting â€” 100% compliance â€” per GV-GB-002.
- HIPAA training for all personnel: 100% completion within required timeframe â€” per HIPAA 45 CFR Â§ 164.530(b).

SECTION 12: Documentation Ownership
layout: list

owned_records:
- Plans of Correction (all survey deficiencies): primary author and regulatory signatory; retained in compliance file.
- Annual Institutional Plan and Budget submission: primary author; co-signed by Governing Body Chair.
- Administrator Designee Designation Form: owner and signatory; filed in governance record.
- Quarterly Governing Body Report (Compliance + QAPI + Financial): author and presenter; retained with Board minutes.
- All agency policy approval records (pre-Board ratification): review and approval signatory on each policy.
- Regulatory event notification records (CMS/state/APS/law enforcement filings): owner and custodian.
- Compliance Program Annual Review documentation: oversight signatory; filed with CO domain records.
- Agency-level contracts and Business Associate Agreements: authorized signatory; retained in legal/vendor file.
- Administrator Appointment documentation (own): retained in personnel file.
- GV-FM-019 â€” Agency Licensure & Certification Tracking Log: oversight owner; reviewed quarterly.

SECTION 13: Escalation Responsibilities
layout: list

escalation:
- Immediate Jeopardy (IJ) citation from CMS or state surveyor â†’ Notify Governing Body Chair within 24 hours; engage Legal Counsel same day; suspend deficient practice immediately; initiate POC.
- Patient death, serious injury, or sentinel event attributable to agency action or inaction â†’ Notify Governing Body Chair within 24 hours; file all mandatory reports within regulatory deadline; RCA initiated within 72 hours.
- OIG/SAM exclusion found for any employee or contractor â†’ Remove from patient care immediately; Compliance Officer + Governing Body Chair + Legal Counsel notified same business day.
- Clinical Manager or Administrator Designee sudden vacancy â†’ Activate succession plan (GV-GB-004); activate Designee (HR-JD-002) or Clinical Designee (HR-JD-004); Governing Body notified within 48 hours.
- HIPAA breach determination (per breach risk assessment) â†’ Privacy Officer activates breach notification protocol; Administrator notified; Governing Body briefed if material breach within 72 hours; HHS notification per 45 CFR Â§ 164.408 deadline.
- Agency licensure lapse, denial, or suspension â†’ Governing Body Chair notified immediately; patient care continuity plan activated; legal response initiated.
- Employee or patient complaint directly naming the Administrator â†’ Escalate to Governing Body Chair for independent review; no self-investigation.
- Financial fraud allegation or embezzlement discovery â†’ Governing Body Chair + Legal Counsel + Compliance Officer notified immediately; forensic review initiated.

SECTION 14: Required Forms
layout: list

forms:
- HR-FM-031 â€” Job Description Acknowledgment Form (signed at hire and upon material JD revision)
- HR-FM-001 â€” Reasonable Suspicion Observation Checklist (oversight; approves suspension orders)
- GV-FM-005 â€” Governing Body Meeting Minutes (presents quarterly reports)
- GV-FM-019 â€” Agency Licensure & Certification Tracking Log (oversight owner)
- CO-FM-016 â€” Reportable Event Notification Log (owner and signatory)
- QA-FM-001 â€” QAPI Committee Meeting Minutes (executive reviewer)
- EN-FM-002 â€” Master Policy Index / Taxonomy Register (approves)
- Administrator Designee Designation Form (signatory; GV-FM or HR file equivalent)
- Plans of Correction document (CMS/state format; Administrator is required signatory)

SECTION 15: Onboarding & Competency Requirements
layout: list

This role is governed by the Role-Based Onboarding & Competency Journey.

Required Training Path:
- General Orientation (GAO Series)
- Role-Specific LMS Track (ADM-000 Series)

Competency Requirements:
- Initial competency validation (HR-TD-003 Appendix A)
- Supervised experience (if applicable)
- Clearance required prior to independent duties

Ongoing Compliance:
- Annual training (HR-TD-001)
- Annual competency evaluation
- Monthly compliance screening (OIG/SAM)

Refer to:
Role-Based Onboarding & Competency Journey (Master Framework)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Document HR-JD-001 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2027-07-10
- Linked Policies: HR-TA-006, HR-TA-001, HR-TA-004, GV-GB-001, GV-GB-004
- Regulatory Authority: 42 CFR Â§ 484.105(b); Â§ 484.115
- Reports To: Governing Body (HR-JD-000)

---

## SOURCE: Builder\Forns\HR-JD-002.txt

DOCUMENT ID: HR-JD-002
TITLE: Administrator Designee
TYPE: Job Description
DOMAIN: HR
SUBDOMAIN: JD
USAGE: Required
FREQUENCY: Biennial Review
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2027-07-10
ORIENTATION: portrait
CLASSIFICATIONS: leadership, administrative, succession

LINKED POLICIES:
- HR-TA-006 (Job Description & Role Definition)
- HR-TA-001 (Recruitment & Hiring Standards)
- GV-GB-004 (Succession Planning for Key Leadership)
- GV-GB-001 (Governing Body Authority & Responsibilities)

POSITION SUMMARY:
The Administrator Designee is the individual formally designated by the Administrator to exercise all administrative authority and fulfill all regulatory obligations of the Administrator role during any period when the Administrator is absent, unavailable, or unable to perform their duties. The Administrator Designee must meet the same minimum qualifications required of the Administrator under 42 CFR Â§ 484.115. The designation must be documented in writing and retained on file. This is not a standalone hired position in all agencies; the designee may hold a concurrent role (e.g., Director of Nursing, Operations Manager) and is formally designated by written action of the Administrator and Governing Body.

---

SECTION 1: Core Responsibilities
layout: list

responsibilities:
- Exercise full administrative authority and responsibility for agency operations during the Administrator's absence.
- Ensure uninterrupted compliance with all 42 CFR Part 484 Conditions of Participation during Administrator unavailability.
- Serve as the regulatory contact for CMS, state agency, and accreditation body communications when required.
- Maintain agency operations, staffing decisions, and patient care oversight continuity.
- Execute urgent administrative and compliance actions that cannot be deferred during Administrator absence.
- Notify the Governing Body and relevant stakeholders when assuming Administrator responsibilities for extended periods.
- Maintain currency on all operational, compliance, and regulatory matters to enable immediate assumption of Administrator role.
- Document the scope and dates of any activation of the Administrator Designee authority.
- Participate in succession planning activities and cross-training with the Administrator.

SECTION 2: Minimum Qualifications
layout: list

qualifications:
- Must meet the same minimum qualifications as the Administrator per 42 CFR Â§ 484.115: Licensed physician; OR Licensed registered nurse (RN); OR Baccalaureate degree in health administration, public health, business administration, or related field with minimum 1 year supervisory or administrative experience in health services.
- No current exclusion from federal or state healthcare programs (OIG/SAM).
- Meets California CDPH qualification requirements for Administrator designee designation.
- Minimum 2 years of supervisory or administrative experience in a healthcare setting, preferably home health.
- Demonstrated knowledge of agency operations and Medicare home health regulations.
- Written designation by Administrator on file with Governing Body notification.

SECTION 3: Required Competencies
layout: list

competencies:
- Working knowledge of 42 CFR Part 484 Medicare Home Health Conditions of Participation.
- Ability to manage day-to-day agency operations including staffing, compliance, and clinical oversight.
- Understanding of QAPI program structure and quality reporting obligations.
- Knowledge of HR functions: hiring, credentialing, performance management, and disciplinary processes.
- Familiarity with financial operations: payroll authorization, vendor management, and accounts approval (as authorized).
- Survey readiness and CMS notification requirements.
- Decision-making under time pressure; escalation judgment.
- Strong communication: staff, Governing Body, regulatory agencies.

SECTION 4: Regulatory Responsibilities
layout: list

regulations:
- 42 CFR Â§ 484.105(b) â€” Assumes Administrator obligations in the Administrator's absence.
- 42 CFR Â§ 484.115 â€” Meets personnel qualifications equivalent to Administrator.
- 42 USC Â§ 1320a-7 â€” OIG/SAM exclusion-free status required.
- CA Health & Safety Code Â§ 1726 â€” State designation compliance.
- All regulatory obligations that activate upon assumption of Administrator role.

SECTION 5: Documentation Responsibilities
layout: list

documentation:
- Maintain a current written Administrator Designee Designation Form on file (GV-FM or HR file).
- Document all periods of Administrator Designee activation (dates, scope, actions taken).
- Counter-sign critical documents requiring Administrator authorization when activated.
- Ensure currency of own credentials, licensure (if applicable), and OIG/SAM screening.

SECTION 6: Supervision Responsibilities
layout: list

supervision:
- When activated: assumes all supervisory authority of the Administrator over agency personnel.
- In primary role (if serving a concurrent position): supervision as defined by primary job description.

SECTION 7: Physical Requirements
layout: list

physical:
- Sedentary to light work: office-based administrative functions during activation.
- Valid California driver's license and transportation if site visits or external representation is required.

SECTION 8: Working Conditions
layout: list

conditions:
- This designation may be concurrent with another defined position at the agency.
- Availability required to assume Administrator role with minimal notice.
- Subject to 24/7 accountability during Administrator Designee activation.

SECTION 9: Performance Expectations
layout: list

expectations:
- Written designation current and renewed as required (upon each role change or annually).
- OIG/SAM screening current and documented.
- Demonstrates readiness to assume Administrator role within one business day of activation.
- All credentials and qualifications maintained equivalent to Administrator requirements.
- No lapses in administrative coverage â€” every absence of the Administrator has a documented designee on file.

SECTION 10: Policy Cross-References
layout: list

policies:
- HR-TA-006 â€” Job Description & Role Definition (controls this document)
- GV-GB-001 â€” Governing Body Authority & Responsibilities (authority basis for designation)
- GV-GB-004 â€” Succession Planning for Key Leadership (designation mechanism)
- HR-TA-004 â€” Licensure & Certification Verification (if licensed professional; own credentials)
- HR-TA-003 â€” OIG/SAM Exclusion Screening (self-screening compliance)
- All policies under HR-JD-001 activate in full upon assumption of Administrator role.

SECTION 11: Measurable Performance Standards
layout: list

standards:
- Written designation form on file: 100% current at all times; renewed within 30 days of any role change or lapse â€” per GV-GB-004; 0 coverage gaps.
- OIG/SAM screening (self): current monthly; 0 lapses in exclusion-free status â€” per HR-TA-003.
- Administrator qualifications (42 CFR Â§ 484.115): maintained continuously; credentials verified and documented in personnel file â€” 0 expired credentials.
- Activation documentation: completed within 24 hours of each activation event (start date, scope, end date) â€” 100% of activations logged.
- Administrative coverage: 0 hours where Administrator is absent without a documented designee on file â€” per GV-GB-004.
- Readiness: able to assume full Administrator authority within 1 business day of any activation â€” verified through annual cross-training with Administrator.

SECTION 12: Documentation Ownership
layout: list

owned_records:
- Administrator Designee Designation Form: co-signed by Administrator and filed in governance record; Designee retains personal copy.
- Activation Log: records each activation period â€” start date, end date, scope of authority exercised, significant actions taken; retained in governance file.
- Own credential and licensure records (if applicable): maintained in personal personnel file.
- OIG/SAM screening records (self): monthly; retained in personnel file.
- During activation: owns all documentation responsibilities listed under HR-JD-001 for the duration of the activation period.

SECTION 13: Escalation Responsibilities
layout: list

escalation:
- Unplanned Administrator absence extends beyond 1 business day with no documented handoff â†’ Immediately activate designation; notify Governing Body Chair and all Administrator direct reports.
- CMS or state survey, enforcement visit, or Immediate Jeopardy citation received during activation â†’ Immediately notify Governing Body Chair and Legal Counsel; do not independently commit to survey responses without Board awareness.
- Compliance or patient safety issue requiring Administrator-level regulatory notification discovered during activation â†’ Notify Governing Body Chair within 24 hours; file required reports; document all actions taken.
- Scope of required action exceeds Designee authority or expertise during activation â†’ Notify Governing Body Chair immediately for direction; document consultation.
- Return of Administrator after extended absence â†’ Formal deactivation documented with transition summary provided to Administrator.

SECTION 14: Required Forms
layout: list

forms:
- Administrator Designee Designation Form (GV-FM or HR-equivalent): maintains own copy; reviewed and updated annually.
- HR-FM-031 â€” Job Description Acknowledgment Form (signed at designation and upon any material change).
- OIG/SAM Screening Log (self): monthly entry; retained in personnel file.
- Activation Log (agency-standard format): completed for each activation event.
- During activation: all forms required under HR-JD-001 become the Designee's responsibility for the duration.

SECTION 15: Onboarding & Competency Requirements
layout: list

This role is governed by the Role-Based Onboarding & Competency Journey.

Required Training Path:
- General Orientation (GAO Series)
- Role-Specific LMS Track (ADM-000 Series)

Competency Requirements:
- Initial competency validation (HR-TD-003 Appendix A)
- Supervised experience (if applicable)
- Clearance required prior to independent duties

Ongoing Compliance:
- Annual training (HR-TD-001)
- Annual competency evaluation
- Monthly compliance screening (OIG/SAM)

Refer to:
Role-Based Onboarding & Competency Journey (Master Framework)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Document HR-JD-002 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2027-07-10
- Linked Policies: HR-TA-006, GV-GB-001, GV-GB-004
- Regulatory Authority: 42 CFR Â§ 484.105(b); Â§ 484.115
- Reports To: Administrator (HR-JD-001)

---

## SOURCE: Builder\Forns\HR-JD-003.txt

DOCUMENT ID: HR-JD-003
TITLE: Director of Nursing / Clinical Manager
TYPE: Job Description
DOMAIN: HR
SUBDOMAIN: JD
USAGE: Required
FREQUENCY: Biennial Review
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2027-07-10
ORIENTATION: portrait
CLASSIFICATIONS: clinical_leadership, regulatory_critical, licensed_professional

LINKED POLICIES:
- HR-TA-006 (Job Description & Role Definition)
- HR-TA-004 (Licensure & Certification Verification)
- HR-TA-001 (Recruitment & Hiring Standards)
- GV-GB-001 (Governing Body Authority & Responsibilities)
- GV-GB-004 (Succession Planning for Key Leadership)

POSITION SUMMARY:
The Director of Nursing (DON) / Clinical Manager is the individual appointed by the Administrator and approved by the Governing Body who is responsible for the direction and ongoing management of all clinical operations at Care Indeed Home Health Care, Inc. This role is required under 42 CFR Â§ 484.105(c) and must meet the personnel qualifications specified in 42 CFR Â§ 484.115. The Clinical Manager ensures all patient care is delivered safely, in accordance with physician orders, the plan of care, and all applicable Medicare Conditions of Participation. The DON/Clinical Manager directly oversees all clinical personnel and serves as the agency's primary clinical authority.

---

SECTION 1: Core Responsibilities
layout: list

responsibilities:
- Direct, manage, and supervise all clinical operations including nursing, therapy, and social work services.
- Ensure all patient care is delivered in compliance with Medicare CoPs (42 CFR Part 484), physician orders, and the individualized plan of care.
- Appoint and oversee the Clinical Designee (HR-JD-004) to ensure clinical coverage during absences.
- Oversee and ensure the accuracy, completeness, and timeliness of all OASIS assessments (SOC, ROC, FU, D/C).
- Direct clinical supervision of all skilled professionals: RNs (HR-JD-005), LVNs (HR-JD-006), PTs (HR-JD-009), OTs (HR-JD-010), SLPs (HR-JD-011), MSWs (HR-JD-008).
- Ensure Home Health Aide (HR-JD-007) supervisory visits comply with 42 CFR Â§ 484.80 requirements (every 14 days by an RN for patients receiving skilled nursing; biannually for aide-only cases).
- Direct and manage the HHA training and competency evaluation program (42 CFR Â§ 484.75).
- Oversee care coordination across all disciplines and with attending physicians, specialists, and community providers.
- Lead clinical QAPI activities including outcome monitoring, clinical record reviews, and performance improvement projects.
- Manage clinical staff competency evaluation, annual performance reviews, and credentialing oversight.
- Review and approve all clinical policies and procedures; participate in annual policy review cycle.
- Respond to clinical complaints, adverse events, and reportable incidents; conduct clinical root cause analysis.
- Ensure timely and accurate clinical documentation; conduct clinical record audits.
- Maintain and implement the agency's Infection Prevention and Control program.
- Participate in survey readiness activities; serve as primary clinical contact during CMS/state surveys.
- Ensure agency compliance with 42 CFR Â§ 484.115 personnel qualification requirements for all clinical staff.
- Oversee on-call clinical coverage and after-hours nursing response.

SECTION 2: Minimum Qualifications
layout: list

qualifications:
- Required: Current, unrestricted Registered Nurse (RN) license in the state of California (CA BRN).
- Required: Minimum one (1) year of supervisory or administrative experience in home health or a related healthcare setting (42 CFR Â§ 484.115).
- Required: Minimum two (2) years of clinical nursing experience, preferably in home health, skilled nursing, or acute care.
- Required: No current exclusion from federal or state healthcare programs (OIG/SAM).
- Required: Current BLS/CPR certification.
- Preferred: Bachelor of Science in Nursing (BSN) or higher.
- Preferred: OASIS certification (COS-C) or equivalent home health clinical management certification.
- Preferred: Experience with EHR systems (e.g., Homecare Homebase, MatrixCare, Kinnser).

SECTION 3: Required Competencies
layout: list

competencies:
- Expert knowledge of 42 CFR Part 484 Medicare Home Health Conditions of Participation.
- OASIS-E1 data collection, accuracy, and transmission requirements (42 CFR Â§ 484.45).
- Home Health Aide training, competency, and supervision requirements (42 CFR Â§ 484.75 / Â§ 484.80).
- Medicare eligibility criteria: homebound status, face-to-face, skilled need determination.
- Clinical documentation standards: timeliness, authentication, and medical necessity support.
- QAPI program participation: outcome monitoring, clinical indicator trending, PIP facilitation.
- Infection prevention and control protocols including Standard Precautions.
- Emergency preparedness clinical planning.
- Performance management and clinical staff development.
- Clinical risk management: adverse event identification, reporting, and root cause analysis.
- Survey management: clinical record production, surveyor accompaniment, citation response.
- Knowledge of HHCAHPS survey domains and clinical drivers of patient experience.

SECTION 4: Regulatory Responsibilities
layout: list

regulations:
- 42 CFR Â§ 484.105(c) â€” Appointment and accountability as Clinical Manager.
- 42 CFR Â§ 484.115 â€” Meets and maintains RN licensure and supervisory experience qualifications.
- 42 CFR Â§ 484.55 â€” Comprehensive assessment management and authorization.
- 42 CFR Â§ 484.60 â€” Plan of care oversight and physician coordination.
- 42 CFR Â§ 484.65 â€” QAPI program clinical leadership.
- 42 CFR Â§ 484.70 â€” Infection prevention and control program oversight.
- 42 CFR Â§ 484.75 â€” Home Health Aide services direction and supervision.
- 42 CFR Â§ 484.80 â€” Home Health Aide training and competency program management.
- 42 CFR Â§ 484.110 â€” Clinical record content, completeness, and retention compliance.
- CA BRN â€” Active unrestricted RN license; compliance with California Nurse Practice Act.
- HIPAA 45 CFR Â§ 164.530(b) â€” Clinical workforce training and privacy obligations oversight.

SECTION 5: Documentation Responsibilities
layout: list

documentation:
- Authorize and co-sign OASIS assessments as required.
- Sign Plans of Correction for clinical deficiencies identified in survey.
- Document Clinical Designee designation with dates and authority scope.
- Review and sign clinical record audits, competency evaluations, and supervisory visit records.
- Maintain own RN license and continuing education documentation in personnel file.
- Document all adverse event investigations and root cause analyses.
- Sign HHA supervisory visit documentation for aide-only cases (biannual minimum).

SECTION 6: Supervision Responsibilities
layout: list

supervision:
- Direct oversight of all clinical staff: RNs (HR-JD-005), LVNs (HR-JD-006), HHAs (HR-JD-007), MSWs (HR-JD-008), PTs (HR-JD-009), OTs (HR-JD-010), SLPs (HR-JD-011).
- Direct oversight of Clinical Designee (HR-JD-004).
- Conducts or delegates field supervisory visits for clinical staff as required.
- Accountable for all clinical personnel performance evaluations.

SECTION 7: Physical Requirements
layout: list

physical:
- Light to medium work: office-based management combined with field supervision visits.
- Ability to conduct home visits in varied residential environments.
- Valid California driver's license and reliable, insured vehicle for field supervision.
- Physical capacity to perform or observe clinical assessments during supervision.

SECTION 8: Working Conditions
layout: list

conditions:
- Full-time, exempt position; hours extend beyond standard business hours as clinical operations require.
- On-call availability for clinical emergencies, adverse events, and regulatory notifications.
- Exposure to community home environments; may include exposure to infectious disease risk, managed per agency Infection Control policy.
- Primary location: agency office with regular field presence.

SECTION 9: Performance Expectations
layout: list

expectations:
- 100% OASIS transmission compliance within CMS mandated timeframes; error rate < 2%.
- HHA supervisory visits completed on schedule per 42 CFR Â§ 484.80 â€” zero overdue.
- Clinical record audit completion on schedule per agency QAPI plan.
- All clinical staff credentialing and licensure verifications current â€” zero expired.
- Clinical staff competency evaluations completed within 90 days of hire and annually thereafter.
- Adverse events reported and documented within agency-required timeframes.
- Patient satisfaction (HHCAHPS) clinical domain scores at or above national benchmark.
- Zero substantiated clinical staff supervision deficiencies in CMS/state surveys.

SECTION 10: Policy Cross-References
layout: list

policies:
- HR-TA-006 â€” Job Description & Role Definition (controls this document)
- HR-TA-004 â€” Licensure & Certification Verification (own credentials; oversees all clinical staff credentials)
- HR-TA-001 â€” Recruitment & Hiring Standards (clinical hiring input and approval)
- HR-TA-005 â€” Employee Orientation & Onboarding (owns clinical staff orientation and competency validation)
- GV-GB-001 â€” Governing Body Authority & Responsibilities (appointed under this policy; accountable to Administrator)
- GV-GB-004 â€” Succession Planning for Key Leadership (designates Clinical Designee)
- CL-CA-001 â€” Patient Assessment â€” Comprehensive (OASIS assessment oversight and authorization)
- CL-CA-002 â€” OASIS Data Collection & Accuracy (quality and accuracy accountability)
- CL-OA-001 â€” OASIS Completion Timeliness & Accountability (program owner)
- CL-SD-006 â€” Home Health Aide Services & Supervision (program oversight per Â§ 484.80)
- CL-SD-007 â€” Home Health Aide Competency Evaluation (program owner per Â§ 484.75)
- CL-SD-008 â€” Clinical Supervision & Oversight (primary accountable role)
- QA-PG-001 â€” QAPI Program Governance (clinical QAPI co-lead)
- CO-CP-001 â€” Corporate Compliance Program (clinical compliance accountability)

SECTION 11: Measurable Performance Standards
layout: list

standards:
- OASIS transmission timeliness: â‰¥ 98% of all OASIS assessments submitted within 5 calendar days of applicable M0030/M0090 date â€” per CL-OA-001 and 42 CFR Â§ 484.45.
- OASIS error/rejection rate: < 2% per iQIES rejection report â€” per CL-CA-002; corrective action initiated within 48 hours of any rejection.
- HHA supervisory visits â€” skilled nursing cases: 100% completed within every 14-day window â€” 0 overdue â€” per 42 CFR Â§ 484.80 and CL-SD-006.
- HHA supervisory visits â€” aide-only cases: 100% completed biannually (every 6 months) â€” 0 overdue â€” per 42 CFR Â§ 484.80.
- Clinical staff competency evaluations: 100% completed within 90 days of hire; annually by hire anniversary â€” 0 overdue â€” per HR-TA-005 and CL-SD-008.
- Clinical licensure verifications: 100% of active clinical staff with current unexpired licenses on file â€” 0 expired at any time â€” per HR-TA-004.
- Clinical record audit: completed â‰¥ monthly per QAPI plan; findings documented and trended; deficiency rate â‰¥ 10% triggers immediate corrective action â€” per QA-PG-001.
- Adverse event RCA: initial root cause analysis initiated within 72 hours of event identification; completed within 10 business days â€” 100% compliance.
- Clinical Designee designation form: 100% current on file; renewed within 30 days of any change â€” per GV-GB-004.
- All clinical staff annual performance evaluations: 100% completed within 30 days of scheduled due date â€” per HR-PM-001.

SECTION 12: Documentation Ownership
layout: list

owned_records:
- OASIS Authorization Records: DON signature on OASIS assessments requiring Clinical Manager authorization; log maintained in EHR.
- Clinical Designee Designation Form: owner and signatory; filed in governance record and DON personnel file.
- HHA Supervisory Visit Log: oversight owner; signs all aide-only case supervisory visit records; quarterly audit.
- HHA Competency Evaluation Master Log: program owner; updated after each competency event; retained 3 years post-separation.
- Clinical Staff Competency Evaluation Records: primary custodian for all clinical disciplines; retained per Medicare retention requirements.
- Clinical Record Audit Reports: author or co-author; monthly; retained in QAPI file with trending data.
- Adverse Event Investigation / Root Cause Analysis Reports: author or co-author; retained in compliance file.
- Plans of Correction â€” clinical deficiencies: co-signatory with Administrator; drafted by DON for clinical domain.
- Clinical On-Call Activity Log: oversight owner; reviewed weekly; retained 2 years.
- Personnel file â€” clinical credentialing section: oversight custodian for all active clinical staff.

SECTION 13: Escalation Responsibilities
layout: list

escalation:
- Patient safety event (wrong medication, fall with serious injury, elopement, unexpected death) â†’ Administrator notified immediately; reportable event process per CO-CP-001 activated; mandatory regulatory report within applicable deadline; RCA initiated within 72 hours.
- Clinical staff scope-of-practice violation or falsified documentation discovered â†’ Suspend staff from patient care immediately; Administrator notified within 4 hours; HR-TA-001 and compliance investigation initiated.
- Active license expiration for any clinical staff member â†’ Immediately removed from all patient-facing duties; Administrator notified within 2 hours; HR-TA-004 corrective process initiated; no patient visits until reinstatement confirmed.
- OASIS transmission failure or iQIES rejection rate > 5% in any month â†’ IT and Administrator notified within 24 hours; corrective action plan with root cause submitted within 5 business days.
- HHA supervisory visit overdue beyond 48 hours past window â†’ Clinical Designee or DON schedules same-day makeup visit; Administrator notified; reason documented.
- Patient or family complaint alleging clinical abuse, neglect, or exploitation â†’ Mandatory reporting obligations activated per CL-PR-006 within 24 hours; Administrator and Compliance Officer notified; patient protected from further exposure.
- Immediate Jeopardy or Condition-Level deficiency (clinical) during CMS/state survey â†’ Administrator and Governing Body Chair notified immediately; clinical operations suspension or corrective action per surveyor direction.

SECTION 14: Required Forms
layout: list

forms:
- HR-FM-031 â€” Job Description Acknowledgment Form (own; and oversees completion for all clinical staff at hire)
- CL-FM-001 â€” SOC Comprehensive Assessment (authorization oversight)
- CL-FM-002 â€” OASIS-E1 Assessment Form (authorization oversight)
- HHA Supervisory Visit Record (HR-FM series; completed by RNs; DON reviews and co-signs aide-only cases)
- HHA Competency Evaluation Form (HR-FM series; annual; DON is program owner)
- HHA In-Service Training Attendance Record (HR-FM series; annual; DON is program owner)
- Clinical Staff Annual Competency Evaluation Form (HR-FM series; DON is signatory for clinical staff)
- Clinical Staff Annual Performance Evaluation Form (HR-FM series; DON is primary evaluator)
- Clinical Record Audit Tool (agency-standard form; monthly; DON is author)
- Adverse Event / Incident Report Form (CO-FM series; DON is co-author and escalation signatory)
- Clinical Designee Designation Form (GV-FM or HR-equivalent; DON is owner and signatory)

SECTION 15: Onboarding & Competency Requirements
layout: list

This role is governed by the Role-Based Onboarding & Competency Journey.

Required Training Path:
- General Orientation (GAO Series)
- Role-Specific LMS Track (DON-000 Series)

Competency Requirements:
- Initial competency validation (HR-TD-003 Appendix A)
- Supervised experience (if applicable)
- Clearance required prior to independent duties

Ongoing Compliance:
- Annual training (HR-TD-001)
- Annual competency evaluation
- Monthly compliance screening (OIG/SAM)

Refer to:
Role-Based Onboarding & Competency Journey (Master Framework)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Document HR-JD-003 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2027-07-10
- Linked Policies: HR-JD-003, HR-TA-006, HR-TA-004, GV-GB-001
- Regulatory Authority: 42 CFR Â§ 484.105(c); Â§ 484.115
- Reports To: Administrator (HR-JD-001)

---

## SOURCE: Builder\Forns\HR-JD-004.txt

DOCUMENT ID: HR-JD-004
TITLE: Clinical Designee
TYPE: Job Description
DOMAIN: HR
SUBDOMAIN: JD
USAGE: Required
FREQUENCY: Biennial Review
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2027-07-10
ORIENTATION: portrait
CLASSIFICATIONS: clinical_leadership, succession, licensed_professional

LINKED POLICIES:
- HR-TA-006 (Job Description & Role Definition)
- HR-TA-004 (Licensure & Certification Verification)
- GV-GB-004 (Succession Planning for Key Leadership)

POSITION SUMMARY:
The Clinical Designee is the individual formally designated by the Director of Nursing / Clinical Manager (HR-JD-003) to assume clinical management authority and responsibilities during any period of the Clinical Manager's absence. The Clinical Designee must hold an active, unrestricted Registered Nurse (RN) license and must meet the same qualifications required under 42 CFR Â§ 484.115 for the Clinical Manager role. The designation must be documented in writing. This is not always a standalone hired position; the designee may hold a concurrent clinical role and is formally designated in writing by the Director of Nursing and Administrator.

---

SECTION 1: Core Responsibilities
layout: list

responsibilities:
- Assume all clinical management authority and regulatory obligations of the Director of Nursing / Clinical Manager during absences.
- Ensure continuous clinical operations compliance with 42 CFR Part 484 during Clinical Manager unavailability.
- Authorize and oversee OASIS assessments requiring Clinical Manager authorization when activated.
- Manage urgent clinical personnel and patient care decisions that cannot be deferred.
- Serve as clinical regulatory contact for CMS, state agency, and accreditation communications when activated.
- Notify the Administrator and relevant stakeholders when assuming Clinical Manager responsibilities for extended periods.
- Document all periods of Clinical Designee activation with dates, scope, and significant actions taken.
- Maintain currency in all clinical regulatory requirements to enable immediate assumption of Clinical Manager role.
- Participate in cross-training and succession planning with the Director of Nursing.

SECTION 2: Minimum Qualifications
layout: list

qualifications:
- Required: Current, unrestricted Registered Nurse (RN) license in the state of California (CA BRN).
- Required: Minimum one (1) year of supervisory or administrative experience in home health or a related healthcare setting (meets 42 CFR Â§ 484.115 qualifications for Clinical Manager).
- Required: No current exclusion from federal or state healthcare programs (OIG/SAM).
- Required: Current BLS/CPR certification.
- Required: Demonstrated competency in OASIS assessment and home health clinical operations.
- Preferred: OASIS certification (COS-C).
- Written designation by Director of Nursing and countersigned by Administrator on file.

SECTION 3: Required Competencies
layout: list

competencies:
- Working knowledge of 42 CFR Part 484 Medicare Home Health Conditions of Participation.
- OASIS-E1 competency: data collection, accuracy, and submission requirements.
- Home Health Aide supervisory visit requirements and scheduling.
- Clinical documentation standards and medical necessity criteria.
- Emergency and after-hours clinical escalation protocols.
- Clinical staff oversight and supervision skills.
- Survey readiness and CMS notification protocols.

SECTION 4: Regulatory Responsibilities
layout: list

regulations:
- 42 CFR Â§ 484.105(c) â€” Assumes Clinical Manager obligations during the DON's absence.
- 42 CFR Â§ 484.115 â€” Meets RN licensure and supervisory experience qualifications.
- 42 CFR Â§ 484.55 â€” Comprehensive assessment oversight when activated.
- 42 CFR Â§ 484.80 â€” HHA supervision obligations when activated.
- CA BRN â€” Active unrestricted RN license maintained.
- 42 USC Â§ 1320a-7 â€” OIG/SAM exclusion-free status.

SECTION 5: Documentation Responsibilities
layout: list

documentation:
- Maintain current written Clinical Designee Designation Form on file.
- Document all activation periods with start date, end date, and significant decisions made.
- Ensure own RN license, BLS/CPR, and OIG/SAM screening are current.
- Counter-sign clinical records and authorizations requiring Clinical Manager signature when activated.

SECTION 6: Supervision Responsibilities
layout: list

supervision:
- When activated: assumes all supervisory authority of the Director of Nursing over clinical staff.
- In primary role (if serving concurrently): supervision as defined in primary clinical job description.

SECTION 7: Physical Requirements
layout: list

physical:
- Light to medium work; office-based clinical management functions combined with potential field presence during activation.
- Valid California driver's license and reliable transportation for field supervision if required.

SECTION 8: Working Conditions
layout: list

conditions:
- Designation concurrent with another clinical position at the agency.
- Availability required to assume Clinical Manager role with minimal notice.
- Subject to 24/7 clinical accountability during activation.

SECTION 9: Performance Expectations
layout: list

expectations:
- Written designation current; renewed at any role change or annually.
- RN license, BLS/CPR, and OIG/SAM screening current without lapse.
- Demonstrates readiness to assume Clinical Manager role within one business day of activation.
- No clinical oversight coverage gaps during Director of Nursing absences.
- All designation activation periods fully documented.

SECTION 10: Policy Cross-References
layout: list

policies:
- HR-TA-006 â€” Job Description & Role Definition (controls this document)
- HR-TA-004 â€” Licensure & Certification Verification (own RN credentials)
- GV-GB-004 â€” Succession Planning for Key Leadership (designation mechanism)
- GV-GB-001 â€” Governing Body Authority & Responsibilities (authority basis for designation)
- HR-TA-003 â€” OIG/SAM Exclusion Screening (self-screening compliance)
- CL-CA-001 â€” Patient Assessment â€” Comprehensive (OASIS oversight when activated)
- CL-SD-006 â€” Home Health Aide Services & Supervision (HHA supervisory obligations when activated)
- CL-OA-001 â€” OASIS Completion Timeliness & Accountability (compliance accountability when activated)
- All policies under HR-JD-003 activate in full upon assumption of Clinical Manager role.

SECTION 11: Measurable Performance Standards
layout: list

standards:
- Written designation form on file: 100% current at all times; renewed within 30 days of any role change or lapse â€” per GV-GB-004; 0 clinical coverage gaps.
- RN license: active and unrestricted at all times; CA BRN renewal completed before expiration â€” 0 lapses â€” per HR-TA-004.
- BLS/CPR certification: current at all times; renewed before expiration â€” 0 lapses.
- OIG/SAM screening (self): monthly; 0 lapses in exclusion-free status â€” per HR-TA-003.
- OASIS competency validation: current per agency competency program; re-validated annually â€” 0 expired.
- Activation documentation: completed within 24 hours of each activation (start date, scope, key actions, end date) â€” 100% compliance.
- Clinical coverage: 0 periods where Clinical Manager is absent without a documented designee in place â€” per GV-GB-004.
- Readiness: able to assume full Clinical Manager authority within 1 business day of activation â€” verified through annual cross-training.

SECTION 12: Documentation Ownership
layout: list

owned_records:
- Clinical Designee Designation Form: co-signed by DON and Administrator; Designee retains personal copy; retained in governance and HR files.
- Activation Log: records each activation period â€” start date, end date, scope of authority, OASIS authorizations, HHA supervisory decisions, and any escalation actions; retained in clinical management file.
- Own RN license, BLS/CPR, and OIG/SAM screening records: retained in personal personnel file.
- OASIS competency validation documentation: retained in personnel file.
- During activation: owns all documentation responsibilities listed under HR-JD-003 for the duration of the activation period.

SECTION 13: Escalation Responsibilities
layout: list

escalation:
- Unplanned Clinical Manager absence without documented designee coverage â†’ Immediately assume designation; notify Administrator and clinical staff.
- Patient safety event (fall with injury, wrong medication, unexpected death) discovered during activation â†’ Immediately notify Administrator; activate reportable event protocol per CO-CP-001; do not defer to return of DON.
- Active license expiration for any clinical staff discovered during activation â†’ Immediately remove staff from patient care; notify Administrator within 2 hours; document action.
- Clinical or regulatory matter requiring DON-level authority or external regulatory response during activation â†’ Notify Administrator immediately; consult before taking unilateral action on unprecedented decisions.
- Return of Director of Nursing after absence â†’ Provide formal transition summary; deactivate designation in writing; deliver Activation Log to DON.

SECTION 14: Required Forms
layout: list

forms:
- Clinical Designee Designation Form (GV-FM or HR-equivalent): maintains own copy; reviewed and renewed annually.
- HR-FM-031 â€” Job Description Acknowledgment Form (signed at designation and upon any material change).
- OIG/SAM Screening Log (self): monthly entry; retained in personnel file.
- Activation Log (agency-standard format): completed for each activation event.
- During activation: all forms required under HR-JD-003 become the Clinical Designee's responsibility for the duration.

SECTION 15: Onboarding & Competency Requirements
layout: list

This role is governed by the Role-Based Onboarding & Competency Journey.

Required Training Path:
- General Orientation (GAO Series)
- Role-Specific LMS Track (DON-000 Series)

Competency Requirements:
- Initial competency validation (HR-TD-003 Appendix A)
- Supervised experience (if applicable)
- Clearance required prior to independent duties

Ongoing Compliance:
- Annual training (HR-TD-001)
- Annual competency evaluation
- Monthly compliance screening (OIG/SAM)

Refer to:
Role-Based Onboarding & Competency Journey (Master Framework)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Document HR-JD-004 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2027-07-10
- Linked Policies: HR-TA-006, HR-TA-004, GV-GB-004
- Regulatory Authority: 42 CFR Â§ 484.105(c); Â§ 484.115
- Reports To: Director of Nursing / Clinical Manager (HR-JD-003)

---

## SOURCE: Builder\Forns\HR-JD-005.txt

DOCUMENT ID: HR-JD-005
TITLE: Registered Nurse (RN)
TYPE: Job Description
DOMAIN: HR
SUBDOMAIN: JD
USAGE: Required
FREQUENCY: Biennial Review
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2027-07-10
ORIENTATION: portrait
CLASSIFICATIONS: clinical, licensed_professional, skilled_care

LINKED POLICIES:
- HR-TA-006 (Job Description & Role Definition)
- HR-TA-004 (Licensure & Certification Verification)
- HR-TA-005 (Employee Orientation & Onboarding)

POSITION SUMMARY:
The Registered Nurse (RN) is a licensed clinical professional who provides skilled nursing services to home health patients under physician orders and in accordance with the individualized plan of care. The RN serves as the primary skilled clinician responsible for patient assessment, care planning, care coordination, clinical documentation, and patient/family education. In home health, the RN is the principal clinical professional authorized to complete OASIS assessments and to supervise Home Health Aides providing personal care. This role is governed by 42 CFR Â§ 484.115, the California Nurse Practice Act (BPC Â§ 2700 et seq.), and all applicable Medicare Conditions of Participation.

---

SECTION 1: Core Responsibilities
layout: list

responsibilities:
- Conduct comprehensive patient assessments at Start of Care (SOC), Resumption of Care (ROC), Recertification, and Follow-Up as required by 42 CFR Â§ 484.55.
- Complete OASIS-E1 assessments accurately and submit within CMS-mandated timeframes (42 CFR Â§ 484.45).
- Develop, implement, and update individualized Plans of Care in collaboration with the physician and interdisciplinary team.
- Provide skilled nursing services as ordered: wound care, medication management and administration, IV therapy, catheter care, disease management, and other medically necessary interventions.
- Perform and document medication reconciliation at transitions of care and during ongoing care.
- Conduct supervisory visits for Home Health Aide patients: every 14 days when the patient is receiving skilled nursing; document supervisory findings and HHA performance.
- Provide patient and caregiver education regarding disease management, medication, safety, and self-care.
- Coordinate care with the physician, therapists, MSW, and other community providers.
- Identify and report adverse changes in patient condition to the physician and Director of Nursing.
- Ensure homebound status is established and documented at SOC and monitored throughout the episode.
- Document all services provided within agency-required timeframes and in accordance with clinical documentation standards.
- Maintain compliance with HIPAA and agency privacy policies in all patient communications and documentation.
- Participate in QAPI activities: completion of quality audits, outcome monitoring, and performance improvement projects.
- Maintain current licensure, BLS/CPR certification, and all required competency validations.
- Participate in mandatory and compliance training as required by agency policy and 42 CFR Â§ 484.36(b).

SECTION 2: Minimum Qualifications
layout: list

qualifications:
- Required: Current, unrestricted Registered Nurse (RN) license in the state of California (CA BRN).
- Required: Minimum one (1) year of clinical nursing experience; home health experience preferred.
- Required: No current exclusion from federal or state healthcare programs (OIG/SAM).
- Required: Current BLS/CPR certification (American Heart Association preferred).
- Required: Valid California driver's license and personal vehicle with current insurance.
- Required: Completion of agency new-hire orientation and OASIS competency training prior to independent practice.
- Required: TB screening current per agency policy and California requirements.
- Preferred: Bachelor of Science in Nursing (BSN).
- Preferred: Home health clinical experience; OASIS competency certification (COS-C).
- Preferred: Specialty certifications relevant to patient population (wound care, diabetic educator, IV therapy).

SECTION 3: Required Competencies
layout: list

competencies:
- OASIS-E1 completion: item-level accuracy, look-back periods, time-point rules, and transmission requirements.
- Medicare homebound status criteria and face-to-face documentation requirements.
- Skilled nursing clinical skills: wound assessment/care, IV therapy, catheter management, medication administration.
- Disease management: cardiac, diabetic, pulmonary, neurological, and oncology conditions common to home health.
- Medication reconciliation and high-alert medication safety protocols.
- Patient and family education techniques for diverse populations.
- Clinical documentation: SOAP/DAR formats, timeliness, authentication, and amendment procedures.
- Infection prevention: Standard Precautions, hand hygiene, and PPE use in the home environment.
- Emergency recognition: falls, acute decompensation, respiratory distress â€” escalation protocols.
- HHA supervision competency: supervisory visit documentation and evaluation of aide performance.
- EHR proficiency: clinical documentation, plan of care management, order tracking.
- Cultural competency and health literacy approaches for diverse patient populations.

SECTION 4: Regulatory Responsibilities
layout: list

regulations:
- 42 CFR Â§ 484.115 â€” Meets and maintains RN licensure qualifications.
- 42 CFR Â§ 484.55 â€” Responsible for comprehensive patient assessment and OASIS completion.
- 42 CFR Â§ 484.45 â€” OASIS transmission timeliness compliance.
- 42 CFR Â§ 484.60 â€” Plan of care development, update, and physician coordination.
- 42 CFR Â§ 484.80 â€” HHA supervisory visit requirements and documentation.
- 42 CFR Â§ 484.70 â€” Infection prevention practices at point of care.
- 42 CFR Â§ 484.110 â€” Clinical record documentation, completeness, and authentication.
- CA Nurse Practice Act (BPC Â§ 2700) â€” Practice within RN scope; delegation compliance.
- HIPAA 45 CFR Parts 160 & 164 â€” PHI privacy and security in all clinical activities.
- Mandatory Reporter (CA Penal Code Â§ 11166) â€” Elder/dependent adult and child abuse reporting.

SECTION 5: Documentation Responsibilities
layout: list

documentation:
- Complete OASIS assessment at all required time points within mandated timeframes.
- Document all skilled visits on agency-approved visit notes within 24 hours of service (or as required by agency policy).
- Authenticate (sign/date/time) all clinical documentation per agency and Medicare standards.
- Document medication reconciliation, teaching, and patient response at each visit.
- Document HHA supervisory visit findings, aide performance, and any corrective instructions.
- Complete clinical orders per physician authorization and document verbal order receipt within required timeframe.
- Document reportable changes in patient condition and actions taken.
- Maintain own licensure, BLS/CPR, OIG/SAM screening, and competency documentation.

SECTION 6: Supervision Responsibilities
layout: list

supervision:
- Supervises Home Health Aides (HR-JD-007) providing personal care services under the plan of care: supervisory visit every 14 days when skilled nursing is being provided (42 CFR Â§ 484.80).
- Reports to: Director of Nursing / Clinical Manager (HR-JD-003) or Clinical Designee (HR-JD-004).

SECTION 7: Physical Requirements
layout: list

physical:
- Medium to heavy work: walking, standing, bending, kneeling, reaching, and lifting up to 50 lbs (patient transfers with mechanical lift assist when available).
- Fine motor skills for clinical procedures (IV insertion, wound care, catheter management).
- Valid California driver's license and reliable, insured personal vehicle for home visits.
- Ability to navigate varied residential environments including stairs, narrow spaces, and non-clinical settings.
- Adequate hearing and visual acuity to perform clinical assessments.

SECTION 8: Working Conditions
layout: list

conditions:
- Field-based work: community home visits in residential settings throughout the service area.
- Variable schedule; may include evenings, weekends, and on-call rotation depending on patient needs and agency staffing model.
- Exposure to infectious disease risk: managed per Infection Prevention and Control policy and Standard Precautions.
- Potential exposure to environmental hazards in patient homes (pets, allergens, smoke).
- Use of personal vehicle for patient visits; mileage reimbursed per agency policy.

SECTION 9: Performance Expectations
layout: list

expectations:
- OASIS submission within CMS-mandated timeframes: â‰¥ 98% on-time rate.
- Visit note completion within 24 hours (or agency-required timeframe): â‰¥ 95% compliance.
- HHA supervisory visits completed per 42 CFR Â§ 484.80 schedule â€” zero overdue.
- Clinical documentation audit scores: meets or exceeds agency quality threshold.
- No substantiated HIPAA violations, documentation falsification findings, or scope-of-practice violations.
- Mandatory training completion: 100% on schedule.
- Participate in at least one QAPI performance improvement project per fiscal year.

SECTION 10: Policy Cross-References
layout: list

policies:
- HR-TA-006 â€” Job Description & Role Definition (controls this document)
- HR-TA-004 â€” Licensure & Certification Verification (own RN credentials)
- HR-TA-005 â€” Employee Orientation & Onboarding (initial competency validation requirements)
- CL-CA-001 â€” Patient Assessment â€” Comprehensive (OASIS completion and comprehensive assessment)
- CL-CA-002 â€” OASIS Data Collection & Accuracy (item-level accuracy standards)
- CL-OA-001 â€” OASIS Completion Timeliness & Accountability (submission deadlines)
- CL-SD-001 â€” Skilled Nursing Assessment & Services (skilled visit delivery standards)
- CL-SD-006 â€” Home Health Aide Services & Supervision (RN supervisory visit responsibility)
- CL-CD-001 â€” Clinical Documentation Standards (visit note requirements)
- CL-CD-003 â€” Clinical Record Authentication & Signature Requirements (authentication standards)
- CL-PR-006 â€” Abuse, Neglect & Exploitation Reporting (mandatory reporter obligations)
- CL-SD-016 â€” Infection Prevention & Control (Standard Precautions at point of care)

SECTION 11: Measurable Performance Standards
layout: list

standards:
- OASIS submission timeliness: â‰¥ 98% submitted within 5 calendar days of applicable assessment date â€” per CL-OA-001 and 42 CFR Â§ 484.45; any rejection corrected and resubmitted within 2 business days.
- Visit note completion: â‰¥ 95% of visit notes completed within 24 hours of service â€” per CL-CD-001; no note > 5 business days past service date.
- HHA supervisory visits (skilled nursing cases): 100% completed within every 14-day window â€” 0 overdue â€” per 42 CFR Â§ 484.80 and CL-SD-006.
- Clinical documentation audit compliance: pass rate â‰¥ agency threshold (typically 90%) on monthly clinical record audits â€” per QA-PG-001.
- Mandatory training completion: 100% of required annual and compliance trainings completed by due date â€” 0 overdue â€” per HR-TA-005 and HIPAA Â§ 164.530(b).
- RN license and BLS/CPR: current without lapse at all times â€” 0 expired credentials in active service period â€” per HR-TA-004.
- Mandatory reporter obligations: abuse/neglect reports filed within 24 hours (Penal Code Â§ 11166) of reasonable suspicion â€” 0 lapses.
- QAPI participation: â‰¥ 1 performance improvement project contribution per fiscal year â€” per QA-PG-001.
- OIG/SAM screening (self): monthly; 0 lapses in exclusion-free status â€” per HR-TA-003.

SECTION 12: Documentation Ownership
layout: list

owned_records:
- OASIS Assessments (SOC, ROC, FU, D/C): author and authenticated owner; retained in patient EHR record.
- Skilled Visit Notes: author and authenticated owner for each visit; retained in patient clinical record.
- HHA Supervisory Visit Records (for assigned patients): author; documents aide performance findings, corrective instructions, and supervisory conclusions; retained in patient record.
- Medication Reconciliation Records: author; documents discrepancies, physician notifications, and actions taken.
- Patient/Caregiver Education Records: author; documents content, method, learner response, and follow-up plan at each visit.
- Verbal Order Receipt Documentation: author; documents verbal order, authentication deadline, and physician confirmation.
- Own credential file entries: RN license, BLS/CPR, OIG/SAM, TB screening, competency evaluations â€” maintained in personnel file.

SECTION 13: Escalation Responsibilities
layout: list

escalation:
- Acute change in patient condition (respiratory distress, unresponsiveness, suspected stroke/MI, severe pain) â†’ Activate 911 if life-threatening; notify physician and DON/Clinical Manager within 1 hour; document all actions and notifications in visit note.
- Suspected patient abuse, neglect, or exploitation â†’ Mandatory report to APS/CPS/law enforcement within 24 hours per CA Penal Code Â§ 11166; notify DON same business day; document report submission without identifying detail in medical record.
- Medication error (wrong drug, wrong dose, wrong patient, wrong route) â†’ Notify physician immediately; notify DON within 2 hours; complete incident report per CO-FM procedures; do not alter original documentation.
- HHA delivering care outside plan of care scope or performing tasks outside HHA scope â†’ Remove HHA from patient assignment immediately; notify DON; complete documentation of observed deviation.
- OASIS transmission rejection for a specific assessment â†’ Notify DON within 24 hours; correct and resubmit within 2 business days; document correction rationale.
- RN license lapse (own) â†’ Immediately cease patient care activities; notify DON same business day; do not return to patient care until active license restored and confirmed.
- Patient refusal of care creating safety risk â†’ Document in visit note; notify DON and physician within 24 hours; activate patient rights procedure per CL-PR-001.

SECTION 14: Required Forms
layout: list

forms:
- CL-FM-001 â€” SOC Comprehensive Assessment (completed at SOC)
- CL-FM-002 â€” OASIS-E1 Assessment Form (completed at all required time points)
- CL-FM-003 â€” Recertification / ROC Assessment (completed at applicable time points)
- CL-FM-004 â€” Discharge / Transfer Assessment (completed at episode end)
- CL-FM-005 â€” Plan of Care / CMS-485 (develops and implements)
- CL-FM-007 â€” Verbal Order Log (documents all verbal order receipts)
- CL-FM-009 â€” Homebound Status Determination Checklist (completed at SOC; re-evaluated each visit)
- CL-FM-010 â€” Face-to-Face Encounter Documentation (verifies and tracks)
- HHA Supervisory Visit Record (HR-FM series): completed every 14 days per patient receiving skilled nursing.
- HR-FM-031 â€” Job Description Acknowledgment Form (signed at hire and upon JD revision)

SECTION 15: Onboarding & Competency Requirements
layout: list

This role is governed by the Role-Based Onboarding & Competency Journey.

Required Training Path:
- General Orientation (GAO Series)
- Role-Specific LMS Track (RN-000 Series)

Competency Requirements:
- Initial competency validation (HR-TD-003 Appendix A)
- Supervised experience (if applicable)
- Clearance required prior to independent duties

Ongoing Compliance:
- Annual training (HR-TD-001)
- Annual competency evaluation
- Monthly compliance screening (OIG/SAM)

Refer to:
Role-Based Onboarding & Competency Journey (Master Framework)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Document HR-JD-005 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2027-07-10
- Linked Policies: HR-TA-006, HR-TA-004, HR-TA-005
- Regulatory Authority: 42 CFR Â§ 484.115; Â§ 484.55; Â§ 484.80; CA BPN Â§ 2700
- Reports To: Director of Nursing / Clinical Manager (HR-JD-003)

---

## SOURCE: Builder\Forns\HR-JD-006.txt

DOCUMENT ID: HR-JD-006
TITLE: Licensed Vocational Nurse (LVN)
TYPE: Job Description
DOMAIN: HR
SUBDOMAIN: JD
USAGE: Required
FREQUENCY: Biennial Review
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2027-07-10
ORIENTATION: portrait
CLASSIFICATIONS: clinical, licensed_professional, skilled_care

LINKED POLICIES:
- HR-TA-006 (Job Description & Role Definition)
- HR-TA-004 (Licensure & Certification Verification)
- HR-TA-005 (Employee Orientation & Onboarding)

POSITION SUMMARY:
The Licensed Vocational Nurse (LVN) provides skilled nursing services to home health patients under physician orders, the plan of care, and the supervision and direction of a Registered Nurse (RN), in accordance with 42 CFR Â§ 484.115 and the California Vocational Nursing Practice Act (BPC Â§ 2840 et seq.). The LVN provides direct patient care including wound care, medication administration, specimen collection, catheter care, and patient education within the LVN scope of practice. The LVN does not independently complete OASIS assessments but works in direct coordination with the supervising RN. All LVN services in home health are provided under the supervision of an RN as required by California law and Medicare policy.

---

SECTION 1: Core Responsibilities
layout: list

responsibilities:
- Provide skilled nursing services as ordered within LVN scope of practice: wound care, dressing changes, catheter management, specimen collection, vital signs monitoring, and medication administration.
- Follow the physician-ordered Plan of Care and implement nursing interventions as directed by the supervising RN.
- Report changes in patient condition promptly to the supervising RN and/or Director of Nursing.
- Document all visit services accurately in the EHR within agency-required timeframes.
- Provide patient and family education on disease management, medication compliance, wound care techniques, and safety measures.
- Coordinate directly with the supervising RN on clinical decisions and patient status changes.
- Participate in care coordination meetings and report patient clinical status as requested.
- Ensure compliance with agency infection prevention and Standard Precautions protocols at every visit.
- Maintain current LVN license, BLS/CPR, and required competency validations.
- Complete mandatory and compliance training per agency policy and schedule.
- Participate in QAPI activities as directed.

SECTION 2: Minimum Qualifications
layout: list

qualifications:
- Required: Current, unrestricted Licensed Vocational Nurse (LVN) license in the state of California (CA BVnE).
- Required: No current exclusion from federal or state healthcare programs (OIG/SAM).
- Required: Current BLS/CPR certification (American Heart Association preferred).
- Required: Valid California driver's license and personal vehicle with current insurance.
- Required: Minimum one (1) year of clinical nursing experience; home health experience preferred.
- Required: Completion of agency new-hire orientation and skills competency validation prior to independent patient visits.
- Required: TB screening current per agency policy and California requirements.
- Preferred: Home health or post-acute care experience.
- Preferred: IV therapy certification (California LVN IV Therapy Certification Board).

SECTION 3: Required Competencies
layout: list

competencies:
- LVN scope of practice: clinical skills within California Vocational Nursing Practice Act.
- Wound assessment and wound care techniques as delegated by the supervising RN.
- Medication administration: oral, topical, injectable â€” within LVN scope.
- Vital signs monitoring, documentation, and interpretation for escalation.
- Catheter care and urinary drainage management.
- Patient and family education within scope.
- Clinical documentation: visit notes, timeliness, and authentication.
- Infection prevention: Standard Precautions and PPE use in home environments.
- Emergency recognition and escalation protocols.
- EHR proficiency for clinical documentation.
- Cultural competency and health literacy communication.

SECTION 4: Regulatory Responsibilities
layout: list

regulations:
- 42 CFR Â§ 484.115 â€” Meets LVN licensure qualifications for home health personnel.
- 42 CFR Â§ 484.110 â€” Clinical record documentation requirements.
- 42 CFR Â§ 484.70 â€” Infection prevention practices at point of care.
- CA Vocational Nursing Practice Act (BPC Â§ 2840) â€” Practice within LVN scope; supervision by RN.
- HIPAA 45 CFR Parts 160 & 164 â€” PHI privacy and security in all clinical activities.
- Mandatory Reporter (CA Penal Code Â§ 11166) â€” Elder/dependent adult and child abuse reporting.
- 42 USC Â§ 1320a-7 â€” OIG/SAM exclusion-free status.

SECTION 5: Documentation Responsibilities
layout: list

documentation:
- Document all clinical visits in the EHR within 24 hours of service (or agency-required timeframe).
- Authenticate all entries with signature, credential, date, and time per clinical documentation standards.
- Report and document changes in patient condition, actions taken, and RN/physician notifications.
- Document patient and family education provided at each visit.
- Maintain own LVN license, BLS/CPR, OIG/SAM screening, and competency validation records.

SECTION 6: Supervision Responsibilities
layout: list

supervision:
- Does not supervise Home Health Aides independently; HHA supervision is the responsibility of the RN.
- Works under supervision of: RN (HR-JD-005) per California Vocational Nursing Practice Act.
- Reports to: Director of Nursing / Clinical Manager (HR-JD-003) or Clinical Designee (HR-JD-004).

SECTION 7: Physical Requirements
layout: list

physical:
- Medium to heavy work: walking, standing, bending, kneeling, reaching, and lifting up to 50 lbs (with mechanical lift assist when available).
- Fine motor skills for clinical procedures (wound care, specimen collection, injections).
- Valid California driver's license and reliable, insured personal vehicle for home visits.
- Ability to navigate varied residential environments.
- Adequate hearing and visual acuity for clinical assessments.

SECTION 8: Working Conditions
layout: list

conditions:
- Field-based work: community home visits in residential settings throughout the service area.
- Variable schedule; may include evenings, weekends, and on-call rotation.
- Exposure to infectious disease risk managed per Infection Prevention policy and Standard Precautions.
- Potential exposure to environmental hazards in patient homes.
- Mileage reimbursed per agency policy.

SECTION 9: Performance Expectations
layout: list

expectations:
- Visit note completion within agency-required timeframe: â‰¥ 95% compliance.
- Zero scope-of-practice violations; all clinical activities within LVN authorized scope.
- Clinical documentation audit scores meet or exceed agency threshold.
- No substantiated HIPAA or documentation integrity violations.
- Mandatory training completion: 100% on schedule.
- All licensure, BLS/CPR, and competency validations current without lapse.

SECTION 10: Policy Cross-References
layout: list

policies:
- HR-TA-006 â€” Job Description & Role Definition (controls this document)
- HR-TA-004 â€” Licensure & Certification Verification (own LVN credentials)
- HR-TA-005 â€” Employee Orientation & Onboarding (initial competency validation requirements)
- CL-SD-001 â€” Skilled Nursing Assessment & Services (skilled visit delivery standards within LVN scope)
- CL-CD-001 â€” Clinical Documentation Standards (visit note requirements)
- CL-CD-003 â€” Clinical Record Authentication & Signature Requirements (authentication standards)
- CL-SD-016 â€” Infection Prevention & Control (Standard Precautions at point of care)
- CL-PR-006 â€” Abuse, Neglect & Exploitation Reporting (mandatory reporter obligations)
- CL-SD-012 â€” Medication Management & Administration (medication administration within LVN scope)

SECTION 11: Measurable Performance Standards
layout: list

standards:
- Visit note completion: â‰¥ 95% of visit notes completed within 24 hours of service â€” per CL-CD-001; no note > 5 business days past service date.
- Scope-of-practice compliance: 0 substantiated violations of LVN scope per CA BPC Â§ 2840 â€” verified through clinical record audits.
- Clinical documentation audit compliance: pass rate â‰¥ agency threshold on monthly audits â€” per QA-PG-001.
- LVN license and BLS/CPR: current without lapse at all times â€” 0 expired credentials in active service â€” per HR-TA-004.
- Mandatory training completion: 100% of required annual and compliance trainings completed by due date â€” per HR-TA-005.
- OIG/SAM screening (self): monthly; 0 lapses â€” per HR-TA-003.
- Condition changes reported to supervising RN: same visit or within 1 hour of observation â€” per CL-SD-001.
- Mandatory reporter obligations: abuse/neglect reports filed within 24 hours of reasonable suspicion â€” 0 lapses â€” per CL-PR-006.

SECTION 12: Documentation Ownership
layout: list

owned_records:
- Skilled Visit Notes: author and authenticated owner for each LVN-delivered visit; retained in patient clinical record.
- Medication Administration Records (where applicable within LVN scope): author; documents drug, dose, route, time, patient response, and any adverse reactions.
- Patient/Caregiver Education Records: author; documents content and patient/caregiver response at each visit.
- Condition Change Notification Records: documents what was observed, time of notification, RN/physician notified, and instructions received.
- Own credential file entries: LVN license, BLS/CPR, OIG/SAM, TB screening â€” maintained in personnel file.

SECTION 13: Escalation Responsibilities
layout: list

escalation:
- Acute change in patient condition (respiratory distress, chest pain, acute confusion, unresponsiveness) â†’ Activate 911 if life-threatening; notify supervising RN immediately; notify physician as directed by RN; document all actions.
- Suspected patient abuse, neglect, or exploitation â†’ Mandatory report to APS/CPS/law enforcement within 24 hours per CA Penal Code Â§ 11166; notify supervising RN same business day; do not confront suspected abuser.
- Medication error or adverse drug reaction observed â†’ Notify supervising RN immediately; RN notifies physician; do not alter original documentation; complete incident report.
- Task or clinical situation identified as outside LVN scope â†’ Stop; notify supervising RN immediately; do not proceed without RN direction.
- LVN license lapse (own) â†’ Immediately cease patient care activities; notify DON/supervising RN same business day; do not return to patient care until reinstatement confirmed.
- Patient refuses care â†’ Document refusal in visit note; notify supervising RN within same business day.

SECTION 14: Required Forms
layout: list

forms:
- LVN Skilled Visit Note (agency EHR format): completed at each visit within 24 hours.
- Medication Administration Record (agency standard): completed at each visit involving medication administration within LVN scope.
- Patient/Caregiver Education Record (agency EHR or CL-FM series): completed at each visit with education component.
- Condition Change Communication Log (agency standard or EHR entry): completed whenever condition change is observed and reported.
- HR-FM-031 â€” Job Description Acknowledgment Form (signed at hire and upon JD revision).

SECTION 15: Onboarding & Competency Requirements
layout: list

This role is governed by the Role-Based Onboarding & Competency Journey.

Required Training Path:
- General Orientation (GAO Series)
- Role-Specific LMS Track (LVN-000 Series)

Competency Requirements:
- Initial competency validation (HR-TD-003 Appendix A)
- Supervised experience (if applicable)
- Clearance required prior to independent duties

Ongoing Compliance:
- Annual training (HR-TD-001)
- Annual competency evaluation
- Monthly compliance screening (OIG/SAM)

Refer to:
Role-Based Onboarding & Competency Journey (Master Framework)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Document HR-JD-006 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2027-07-10
- Linked Policies: HR-TA-006, HR-TA-004, HR-TA-005
- Regulatory Authority: 42 CFR Â§ 484.115; CA BPC Â§ 2840
- Reports To: Director of Nursing / Clinical Manager (HR-JD-003); supervised in practice by RN (HR-JD-005)

---

## SOURCE: Builder\Forns\HR-JD-007.txt

DOCUMENT ID: HR-JD-007
TITLE: Home Health Aide (HHA)
TYPE: Job Description
DOMAIN: HR
SUBDOMAIN: JD
USAGE: Required
FREQUENCY: Biennial Review
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2027-07-10
ORIENTATION: portrait
CLASSIFICATIONS: clinical, paraprofessional, aide_services, regulatory_critical

LINKED POLICIES:
- HR-TA-006 (Job Description & Role Definition)
- HR-TA-004 (Licensure & Certification Verification)
- HR-TA-005 (Employee Orientation & Onboarding)

POSITION SUMMARY:
The Home Health Aide (HHA) is a paraprofessional who provides personal care, homemaker, and basic health maintenance services to home health patients under the direction and supervision of a Registered Nurse (RN), as authorized by the physician-ordered plan of care. The HHA role is one of the most heavily regulated positions in Medicare home health, governed by 42 CFR Â§ 484.80 (HHA training and competency), Â§ 484.75 (aide services and supervision), and CA Health & Safety Code Â§ 1726.5. The HHA does not provide skilled nursing care and must operate strictly within the HHA-authorized scope as defined in the plan of care and per California law.

---

SECTION 1: Core Responsibilities
layout: list

responsibilities:
- Provide personal care services as authorized in the physician-ordered plan of care: bathing, dressing, grooming, oral hygiene, toileting, and ambulation assistance.
- Provide homemaker services as ordered: light housekeeping, meal preparation, and laundry directly related to the patient's care needs.
- Perform basic health-related tasks as specifically trained, demonstrated competent, and authorized in the plan of care: simple range-of-motion exercises, vital signs (if trained and designated), medication reminders (not administration).
- Observe and report changes in patient condition, behavior, or safety concerns promptly to the supervising RN.
- Provide compassionate, culturally sensitive care that respects patient dignity, rights, and preferences.
- Follow Standard Precautions and infection prevention protocols at every visit.
- Accurately document all services provided on the HHA Activity Record within agency-required timeframes.
- Participate in all required HHA training, in-service education, and competency evaluations per 42 CFR Â§ 484.75.
- Cooperate with RN supervisory visits; demonstrate aide skill competency and care adherence.
- Report any safety concerns, abuse/neglect suspicions, or patient rights concerns to the supervising RN immediately.
- Maintain compliance with all HIPAA requirements; protect patient privacy in all communications and documentation.
- Maintain required certifications, health screenings, and OIG/SAM screening currency.

SECTION 2: Minimum Qualifications
layout: list

qualifications:
- Required: Successful completion of a state-approved Home Health Aide training program meeting minimum 75 hours (or equivalent state requirements), with a minimum 16 hours supervised practical/clinical training (42 CFR Â§ 484.75(b)).
- Required: Demonstration of competency in all 12 required HHA competency areas per 42 CFR Â§ 484.75(d) prior to independent patient care.
- Required: Active California HHA certification (CA CDPH HHA Registry) preferred; CNA license accepted as meeting HHA qualification requirements.
- Required: No current exclusion from federal or state healthcare programs (OIG/SAM).
- Required: TB screening current per agency policy and California requirements.
- Required: Current CPR/First Aid certification.
- Required: Valid California driver's license and reliable, insured transportation (if providing transport or if required by agency operations).
- Required: Completion of agency new-hire orientation and skills competency validation prior to unsupervised patient visits.
- Required: Annual competency evaluation of each required HHA service task (42 CFR Â§ 484.75(d)).

SECTION 3: Required Competencies
layout: list

competencies:
- Personal care skills: bathing (full bed bath, tub, shower), dressing, grooming, oral hygiene, skin care, and toileting.
- Ambulation and transfer assistance: gait belt technique, fall prevention, and mechanical lift operation (if required).
- Basic health maintenance tasks as authorized in plan of care (range-of-motion, vital signs per training).
- Meal preparation: adherence to dietary restrictions and therapeutic diets as prescribed.
- Observation and reporting: identifying and reporting changes in patient condition, skin integrity, behavior, and safety.
- Documentation: accurate, timely completion of HHA activity records and EVV compliance.
- Infection prevention: hand hygiene, Standard Precautions, and PPE in the home setting.
- Professionalism and patient rights: maintaining dignity, respecting boundaries, and upholding patient rights.
- Basic emergency response: recognition of emergency symptoms and activation of 911; contacting RN supervisor.
- Cultural competency: provision of person-centered care across diverse populations.

SECTION 4: Regulatory Responsibilities
layout: list

regulations:
- 42 CFR Â§ 484.75 â€” HHA qualification, training, competency, and in-service education requirements.
- 42 CFR Â§ 484.80 â€” HHA services provision and RN supervisory visit requirements.
- 42 CFR Â§ 484.115 â€” Meets HHA personnel qualifications for Medicare home health.
- 42 CFR Â§ 484.70 â€” Infection prevention practices at point of care.
- CA Health & Safety Code Â§ 1726.5 â€” California HHA certification and qualification requirements.
- Electronic Visit Verification (EVV): 21st Century Cures Act â€” compliance with EVV system requirements.
- HIPAA 45 CFR Parts 160 & 164 â€” PHI privacy and security.
- Mandatory Reporter (CA Penal Code Â§ 11166 / CA W&I Code Â§ 15630) â€” Elder/dependent adult and child abuse reporting.
- 42 USC Â§ 1320a-7 â€” OIG/SAM exclusion-free status.

SECTION 5: Documentation Responsibilities
layout: list

documentation:
- Complete HHA Activity Record / Visit Note documenting services rendered per plan of care at each visit, within agency-required timeframe.
- Use EVV system per agency protocol for visit verification (start/end time, GPS, services rendered).
- Document and report any patient condition changes, incidents, or safety concerns to supervising RN.
- Maintain current certification (where required), CPR/First Aid, OIG/SAM screening, TB screening, and competency evaluation records in personnel file.
- Sign annual in-service training attendance and competency evaluation records.

SECTION 6: Supervision Responsibilities
layout: list

supervision:
- Does not supervise other staff.
- Supervised by: Registered Nurse (HR-JD-005) â€” supervisory visit every 14 days when patient receiving skilled nursing; biannually (every 6 months) for aide-only cases (42 CFR Â§ 484.80).
- Reports to: Director of Nursing / Clinical Manager (HR-JD-003); direct clinical oversight by supervising RN (HR-JD-005).

SECTION 7: Physical Requirements
layout: list

physical:
- Heavy work: standing, walking, bending, lifting, transferring patients (up to 50 lbs with mechanical assist); sustained physical activity throughout shift.
- Manual dexterity for personal care procedures.
- Sufficient physical strength and endurance to provide full personal care safely.
- Valid California driver's license and reliable, insured vehicle if transportation is part of the role.
- Ability to navigate stairs, tight spaces, and non-clinical residential environments.

SECTION 8: Working Conditions
layout: list

conditions:
- Field-based work: patient home environments throughout the service area.
- Variable hours; may include evenings, weekends, and holidays per patient needs.
- Exposure to infectious disease risk managed per agency Infection Prevention policy and Standard Precautions.
- Potential exposure to environmental hazards in patient homes (pets, smoke, allergens, hoarding conditions).
- Mileage/transportation reimbursement per agency policy (if applicable).

SECTION 9: Performance Expectations
layout: list

expectations:
- Annual competency evaluation completed for all required HHA service tasks (42 CFR Â§ 484.75(d)) â€” zero overdue.
- EVV compliance: 100% of visits verified per EVV protocol.
- HHA Activity Records completed within agency-required timeframe: â‰¥ 95% compliance.
- Cooperates with all RN supervisory visits â€” zero refusals or obstructions.
- Annual in-service training (â‰¥ 12 hours per year per 42 CFR Â§ 484.75(e)) completed on schedule.
- Zero substantiated patient rights violations, abuse/neglect findings, or scope-of-practice violations.
- Current certifications, health screenings, and OIG/SAM screening â€” zero lapses.

SECTION 10: Policy Cross-References
layout: list

policies:
- HR-TA-006 â€” Job Description & Role Definition (controls this document)
- HR-TA-004 â€” Licensure & Certification Verification (HHA certification/CNA license verification)
- HR-TA-005 â€” Employee Orientation & Onboarding (pre-service competency validation; 75-hour training requirement)
- CL-SD-006 â€” Home Health Aide Services & Supervision (scope of services; supervisory visit requirements)
- CL-SD-007 â€” Home Health Aide Competency Evaluation (annual competency evaluation requirements)
- CL-CD-001 â€” Clinical Documentation Standards (HHA Activity Record documentation standards)
- CL-SD-016 â€” Infection Prevention & Control (Standard Precautions at every visit)
- CL-PR-001 â€” Patient Rights & Responsibilities (patient dignity, rights, and privacy)
- CL-PR-006 â€” Abuse, Neglect & Exploitation Reporting (mandatory reporter obligations)

SECTION 11: Measurable Performance Standards
layout: list

standards:
- EVV compliance: 100% of visits verified via EVV system (start/end time, GPS check-in, services recorded) â€” per 21st Century Cures Act EVV requirement; 0 unverified visits accepted.
- HHA Activity Record completion: â‰¥ 95% completed within 24 hours of visit â€” per CL-CD-001; no record > 2 business days past service date.
- Annual competency evaluation: 100% of required competency areas evaluated annually by hire anniversary â€” 0 overdue â€” per 42 CFR Â§ 484.75(d).
- Annual in-service training: â‰¥ 12 hours completed per calendar year â€” 0 HHAs active in patient care with fewer than 12 in-service hours â€” per 42 CFR Â§ 484.75(e).
- RN supervisory visit cooperation: 100% cooperation with scheduled supervisory visits â€” 0 refusals or deliberate avoidance.
- Scope-of-practice compliance: 0 substantiated violations (performing skilled or non-authorized tasks); verified through supervisory visit and audit findings.
- CPR/First Aid certification: current without lapse â€” 0 expired certifications in active service â€” per HR-TA-004.
- OIG/SAM screening (self): monthly; 0 lapses â€” per HR-TA-003.
- Mandatory reporter obligations: suspected abuse/neglect reported to RN within the same visit; RN-level report filed within 24 hours â€” per CL-PR-006.

SECTION 12: Documentation Ownership
layout: list

owned_records:
- HHA Activity Record / Visit Note: author and authenticated owner for each visit; documents services rendered per plan of care, observations, patient response; retained in patient record.
- EVV Visit Record: author (check-in/check-out entry); retained in EVV system and linked to patient visit record.
- Condition Change Report: documents observation, time reported to RN, and instructions received; retained in patient record or EHR.
- Own credential file entries: HHA certification/CNA license, CPR/First Aid, OIG/SAM, TB screening, competency evaluation sign-offs â€” maintained in personnel file.
- In-service training attendance records: signed by HHA at each in-service; retained in personnel training file.
- Annual competency evaluation signatures: signed by HHA confirming competency demonstration; retained in personnel file.

SECTION 13: Escalation Responsibilities
layout: list

escalation:
- Patient emergency (unresponsiveness, suspected fall with injury, chest pain, difficulty breathing) â†’ Call 911 immediately if life-threatening; call supervising RN within 5 minutes; remain with patient until emergency services or RN instruction to leave; document all actions.
- Suspected patient abuse, neglect, exploitation, or unsafe home situation â†’ Report to supervising RN immediately (same visit); do not confront the suspected abuser; do not remove patient from home without RN instruction.
- Patient requests a service outside the plan of care â†’ Do not perform; explain limitations; notify RN at conclusion of visit or sooner if urgent.
- Observation of skin breakdown, wound, significant bruising, or acute change in patient appearance â†’ Document observations; report to supervising RN before leaving patient home or within 1 hour.
- Any task that the HHA has not been trained for or is uncomfortable performing â†’ Do not perform; notify supervising RN immediately; never improvise outside training.
- HHA certification or CPR/First Aid lapses â†’ Immediately notify DON/HR; cease patient care until reinstatement is confirmed.

SECTION 14: Required Forms
layout: list

forms:
- HHA Activity Record / Visit Note (agency-approved form or EHR HHA entry): completed at each visit.
- EVV System Entry (agency EVV platform): check-in and check-out at each visit â€” mandatory per 21st Century Cures Act.
- Annual HHA Competency Evaluation Form (HR-FM series; per 42 CFR Â§ 484.75(d)): signed by HHA annually.
- HHA In-Service Training Attendance Record (HR-FM series): signed by HHA at each in-service event.
- RN Supervisory Visit Cooperation Record (RN-completed form): HHA cooperates; reviewed at supervisory visit.
- HR-FM-031 â€” Job Description Acknowledgment Form (signed at hire and upon JD revision).

SECTION 15: Onboarding & Competency Requirements
layout: list

This role is governed by the Role-Based Onboarding & Competency Journey.

Required Training Path:
- General Orientation (GAO Series)
- Role-Specific LMS Track (HHA-000 Series)

Competency Requirements:
- Initial competency validation (HR-TD-003 Appendix A)
- Supervised experience (if applicable)
- Clearance required prior to independent duties

Ongoing Compliance:
- Annual training (HR-TD-001)
- Annual competency evaluation
- Monthly compliance screening (OIG/SAM)

Refer to:
Role-Based Onboarding & Competency Journey (Master Framework)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Document HR-JD-007 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2027-07-10
- Linked Policies: HR-TA-006, HR-TA-004, HR-TA-005
- Regulatory Authority: 42 CFR Â§ 484.75; Â§ 484.80; Â§ 484.115; CA H&S Code Â§ 1726.5
- Reports To: Director of Nursing / Clinical Manager (HR-JD-003); supervised by RN (HR-JD-005)

---

## SOURCE: Builder\Forns\HR-JD-008.txt

DOCUMENT ID: HR-JD-008
TITLE: Medical Social Worker (MSW)
TYPE: Job Description
DOMAIN: HR
SUBDOMAIN: JD
USAGE: Required
FREQUENCY: Biennial Review
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2027-07-10
ORIENTATION: portrait
CLASSIFICATIONS: clinical, licensed_professional, skilled_care, ancillary

LINKED POLICIES:
- HR-TA-006 (Job Description & Role Definition)
- HR-TA-004 (Licensure & Certification Verification)
- HR-TA-005 (Employee Orientation & Onboarding)

POSITION SUMMARY:
The Medical Social Worker (MSW) provides skilled medical social work services to home health patients when ordered by the attending physician and included in the patient's plan of care. Medical social work in Medicare home health is a skilled service that requires clinical licensure and advanced training. The MSW assesses the social, emotional, psychological, and environmental factors affecting the patient's health outcomes, and intervenes to connect patients and families with appropriate community resources, financial assistance, mental health support, and care transition planning. This role is governed by 42 CFR Â§ 484.115, the California LCSW/LMSW licensure requirements, and applicable Medicare skilled service criteria.

---

SECTION 1: Core Responsibilities
layout: list

responsibilities:
- Conduct comprehensive psychosocial assessments identifying social, economic, and emotional factors affecting patient health outcomes and the ability to benefit from medical treatment.
- Develop and implement the social work component of the patient's interdisciplinary plan of care.
- Provide therapeutic counseling and supportive interventions to patients and families addressing adjustment to illness, caregiver burden, grief, and mental health concerns.
- Identify and connect patients with community resources: financial assistance programs (Medicare/Medi-Cal, SSI, SNAP), housing support, transportation, caregiver respite, and community health services.
- Facilitate and document care transitions, discharge planning, and post-discharge resource connections.
- Participate in interdisciplinary care team conferences and contribute to care coordination.
- Screen for and report elder abuse, domestic violence, neglect, and financial exploitation as a mandated reporter.
- Provide advance directive counseling and facilitate documentation as requested.
- Conduct crisis intervention for patients at risk of self-harm, substance use, or unsafe living situations.
- Document all social work services provided within agency-required timeframes and per clinical documentation standards.
- Participate in QAPI activities including outcome monitoring and performance improvement.
- Maintain compliance with HIPAA, NASW Code of Ethics, and all applicable licensure requirements.
- Complete mandatory training per agency policy and schedule.

SECTION 2: Minimum Qualifications
layout: list

qualifications:
- Required: Licensed Clinical Social Worker (LCSW) in the state of California (CA BBS); OR Licensed Master Social Worker (LMSW) with supervised clinical hours under an LCSW as permitted by California law.
- Required: Master of Social Work (MSW) degree from an accredited program.
- Required: Minimum one (1) year of social work experience; healthcare or home health experience preferred.
- Required: No current exclusion from federal or state healthcare programs (OIG/SAM).
- Required: Valid California driver's license and personal vehicle with current insurance.
- Required: Completion of agency new-hire orientation prior to independent patient visits.
- Required: TB screening current per agency policy.
- Preferred: Home health or post-acute care social work experience.
- Preferred: Experience with Medicare/Medi-Cal eligibility and community resource navigation.

SECTION 3: Required Competencies
layout: list

competencies:
- Psychosocial assessment: biopsychosocial-spiritual model applied to home health population.
- Medicare skilled social work criteria: understanding of covered services and medical necessity documentation.
- Community resource navigation: California benefits programs, community health, housing, and support services.
- Crisis intervention: suicide risk assessment, domestic violence, elder abuse, and unsafe home situations.
- Motivational interviewing and therapeutic communication techniques.
- Cultural competency: knowledge of diverse populations, LGBTQ+ considerations, health disparities.
- Advance directive and end-of-life planning support.
- Care coordination documentation: SOAP/DAR formats, timeliness, and authentication.
- Interdisciplinary team communication and collaboration.
- Mandatory reporting obligations and documentation requirements.
- EHR proficiency for clinical documentation.

SECTION 4: Regulatory Responsibilities
layout: list

regulations:
- 42 CFR Â§ 484.115 â€” Meets medical social worker personnel qualifications.
- 42 CFR Â§ 484.60 â€” Plan of care social work component contributions.
- 42 CFR Â§ 484.110 â€” Clinical record documentation completeness.
- CA BBS â€” Active LCSW/LMSW license; compliance with California Social Work Practice Act.
- HIPAA 45 CFR Parts 160 & 164 â€” PHI privacy and security.
- Mandatory Reporter (CA Penal Code Â§ 11166; CA W&I Code Â§ 15630) â€” Elder/dependent adult and child abuse reporting.
- NASW Code of Ethics â€” Professional standards and ethical practice obligations.
- 42 USC Â§ 1320a-7 â€” OIG/SAM exclusion-free status.

SECTION 5: Documentation Responsibilities
layout: list

documentation:
- Complete social work visit notes within 24 hours of service (or agency-required timeframe).
- Authenticate all entries with signature, credential (LCSW/LMSW), date, and time.
- Document psychosocial assessment, interventions, resources provided, and patient/family response.
- Document advance directive discussions, referrals made, and follow-up plans.
- Document mandated report submissions (without identifying detail in the medical record where required by law).
- Maintain own LCSW/LMSW license, OIG/SAM screening, and CEU documentation in personnel file.

SECTION 6: Supervision Responsibilities
layout: list

supervision:
- Does not supervise other clinical staff independently.
- LMSW-level social workers work under LCSW supervision per California BBS requirements.
- Reports to: Director of Nursing / Clinical Manager (HR-JD-003).

SECTION 7: Physical Requirements
layout: list

physical:
- Light to medium work: driving to home visits, prolonged sitting for documentation, home environment navigation.
- Valid California driver's license and reliable, insured personal vehicle.
- Ability to navigate varied residential environments.

SECTION 8: Working Conditions
layout: list

conditions:
- Field-based: community home visits throughout the service area.
- Variable schedule; some evening or weekend availability may be required.
- Potential exposure to emotionally difficult situations: crisis, grief, severe mental health presentations.
- Managed occupational exposure risk per OSHA and agency safety policies.
- Mileage reimbursed per agency policy.

SECTION 9: Performance Expectations
layout: list

expectations:
- Social work visit notes completed within agency-required timeframe: â‰¥ 95% compliance.
- Mandatory reporting obligations fulfilled within legally required timeframes â€” zero lapses.
- Clinical documentation audit scores meet or exceed agency threshold.
- Community resource referrals documented for all applicable cases.
- No substantiated HIPAA, scope-of-practice, or professional ethics violations.
- Licensure, OIG/SAM screening, and CEU requirements current without lapse.
- Mandatory training completion: 100% on schedule.

SECTION 10: Policy Cross-References
layout: list

policies:
- HR-TA-006 â€” Job Description & Role Definition (controls this document)
- HR-TA-004 â€” Licensure & Certification Verification (own LCSW/LMSW credentials)
- HR-TA-005 â€” Employee Orientation & Onboarding (initial competency validation requirements)
- CL-SD-005 â€” Medical Social Work Services (skilled MSW service delivery standards)
- CL-CD-001 â€” Clinical Documentation Standards (visit note requirements)
- CL-CD-003 â€” Clinical Record Authentication & Signature Requirements (authentication standards)
- CL-PR-006 â€” Abuse, Neglect & Exploitation Reporting (mandatory reporter obligations)
- CL-PR-001 â€” Patient Rights & Responsibilities (patient dignity and rights in social work interactions)
- CL-CP-006 â€” Discharge Planning & Criteria (MSW role in care transitions and resource planning)

SECTION 11: Measurable Performance Standards
layout: list

standards:
- Social work visit note completion: â‰¥ 95% completed within 24 hours of service â€” per CL-CD-001; no note > 5 business days past service date.
- Mandatory reporting obligations: suspected abuse/neglect/exploitation reports filed within 24 hours of reasonable suspicion â€” 0 lapses â€” per CA Penal Code Â§ 11166 and W&I Code Â§ 15630.
- Community resource referral documentation: 100% of cases requiring community resource intervention include documented referral and follow-up plan â€” per CL-SD-005.
- Clinical documentation audit compliance: pass rate â‰¥ agency threshold on monthly audits â€” per QA-PG-001.
- LCSW/LMSW license and CEU requirements: current without lapse at all times â€” 0 expired credentials in active service â€” per HR-TA-004 and CA BBS.
- Mandatory training completion: 100% of required annual and compliance trainings completed by due date â€” per HR-TA-005.
- OIG/SAM screening (self): monthly; 0 lapses â€” per HR-TA-003.
- Crisis intervention response: documented crisis assessment and safety plan completed same visit for any patient identified at acute risk â€” per NASW Code of Ethics.

SECTION 12: Documentation Ownership
layout: list

owned_records:
- Psychosocial Assessment: author and authenticated owner; completed at SOC and updated as clinically indicated; retained in patient clinical record.
- Social Work Visit Notes: author and authenticated owner for each MSW-delivered visit; retained in patient record.
- Community Resource Referral Records: author; documents resource identified, referral made, contact information, and patient/family response.
- Advance Directive Counseling Records: documents discussion content, patient/family decision, and next steps.
- Mandated Report Submission Record: documents that report was made (date, agency contacted, reference number) without identifying detail in medical record where required by law.
- Care Transition Plan / Discharge Resource Plan: author; documents post-discharge resources, referrals, and follow-up plan.
- Own credential file entries: LCSW/LMSW license, OIG/SAM, TB screening, CEU documentation â€” maintained in personnel file.

SECTION 13: Escalation Responsibilities
layout: list

escalation:
- Patient expresses suicidal ideation, homicidal ideation, or intent to harm self or others â†’ Activate crisis intervention protocol; contact physician and DON immediately; do not leave patient alone if safety risk; call 911 if imminent danger; document full safety assessment.
- Suspected elder abuse, neglect, financial exploitation, or domestic violence â†’ Mandatory report to APS/law enforcement within 24 hours per CA W&I Code Â§ 15630; notify DON same business day; ensure patient's immediate safety is addressed.
- Unsafe home environment (no food, no heat, active domestic violence, unsafe caregiver) â†’ Notify DON and physician within same visit or within 2 hours; document findings; do not leave patient in immediately life-threatening environment without protective action.
- LCSW license lapse or CA BBS action (own) â†’ Immediately cease patient care; notify DON same business day; do not return until reinstatement confirmed.
- Situation encountered beyond LCSW/LMSW scope or training â†’ Notify DON; consult with supervisor before acting; document consultation.
- Patient refuses MSW services â†’ Document refusal; notify DON and physician; ensure plan of care is updated to reflect current status.

SECTION 14: Required Forms
layout: list

forms:
- Psychosocial Assessment Form (agency EHR or CL-FM series): completed at SOC and updated as indicated.
- Social Work Visit Note (agency EHR format): completed at each visit within 24 hours.
- Community Resource Referral Record (agency standard form): completed whenever referral is made.
- Advance Directive Discussion Record (CL-FM series or agency standard): completed when advance directive counseling is provided.
- Mandated Report Submission Log (agency standard; internal record only â€” not part of medical record): documents each report made.
- Discharge / Care Transition Plan (CL-FM series): co-authored with interdisciplinary team; MSW owns social/community resource section.
- HR-FM-031 â€” Job Description Acknowledgment Form (signed at hire and upon JD revision).

SECTION 15: Onboarding & Competency Requirements
layout: list

This role is governed by the Role-Based Onboarding & Competency Journey.

Required Training Path:
- General Orientation (GAO Series)
- Role-Specific LMS Track (MSW-000 Series)

Competency Requirements:
- Initial competency validation (HR-TD-003 Appendix A)
- Supervised experience (if applicable)
- Clearance required prior to independent duties

Ongoing Compliance:
- Annual training (HR-TD-001)
- Annual competency evaluation
- Monthly compliance screening (OIG/SAM)

Refer to:
Role-Based Onboarding & Competency Journey (Master Framework)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Document HR-JD-008 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2027-07-10
- Linked Policies: HR-TA-006, HR-TA-004, HR-TA-005
- Regulatory Authority: 42 CFR Â§ 484.115; CA BBS LCSW/LMSW Practice Act; NASW Code of Ethics
- Reports To: Director of Nursing / Clinical Manager (HR-JD-003)

---

## SOURCE: Builder\Forns\HR-JD-009.txt

DOCUMENT ID: HR-JD-009
TITLE: Physical Therapist (PT)
TYPE: Job Description
DOMAIN: HR
SUBDOMAIN: JD
USAGE: Required
FREQUENCY: Biennial Review
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2027-07-10
ORIENTATION: portrait
CLASSIFICATIONS: clinical, licensed_professional, skilled_care, therapy

LINKED POLICIES:
- HR-TA-006 (Job Description & Role Definition)
- HR-TA-004 (Licensure & Certification Verification)
- HR-TA-005 (Employee Orientation & Onboarding)

POSITION SUMMARY:
The Physical Therapist (PT) provides skilled physical therapy services to home health patients when ordered by the attending physician and included in the plan of care. Physical therapy in Medicare home health is a skilled service that may independently establish eligibility when a skilled therapy need exists. The PT evaluates patients' physical function, mobility, strength, balance, and pain, and develops and implements individualized therapeutic programs to restore function, prevent deterioration, and maximize independence. The PT may supervise Physical Therapist Assistants (PTAs) as authorized by law. This role is governed by 42 CFR Â§ 484.115, the California Physical Therapy Practice Act (BPC Â§ 2600 et seq.), and Medicare skilled service criteria.

---

SECTION 1: Core Responsibilities
layout: list

responsibilities:
- Conduct comprehensive physical therapy evaluations at Start of Care, when clinically indicated, and at discharge.
- Develop individualized physical therapy plans including measurable goals, frequency, and duration in coordination with the physician.
- Provide skilled physical therapy interventions: therapeutic exercise, gait training, balance and fall prevention, neuromuscular re-education, manual therapy, pain management modalities, and functional mobility training.
- Assess and establish Medicare homebound status criteria when physical therapy is the qualifying skilled service.
- Complete OASIS assessments at required time points when physical therapy is the primary qualifying service (or when RN is unavailable and PT is the assessing clinician).
- Provide patient and caregiver education: home exercise programs, safety techniques, assistive device training, and fall prevention strategies.
- Supervise Physical Therapist Assistants (PTAs): co-sign PTA notes per California PT Practice Act requirements; conduct supervisory visits as required.
- Participate in interdisciplinary care coordination with RN, OT, SLP, MSW, and physician.
- Document all evaluations, treatment notes, and discharge summaries within agency-required timeframes.
- Participate in QAPI activities including outcome monitoring and performance improvement.
- Maintain compliance with HIPAA and applicable licensure requirements.
- Complete mandatory training per agency policy and schedule.

SECTION 2: Minimum Qualifications
layout: list

qualifications:
- Required: Current, unrestricted Physical Therapist (PT) license in the state of California (CA Physical Therapy Board).
- Required: Graduate of an accredited professional physical therapy program (Bachelor's, Master's, or DPT).
- Required: Minimum one (1) year of physical therapy clinical experience; home health experience preferred.
- Required: No current exclusion from federal or state healthcare programs (OIG/SAM).
- Required: Current BLS/CPR certification.
- Required: Valid California driver's license and personal vehicle with current insurance.
- Required: Completion of agency new-hire orientation and OASIS competency training (if assessing clinician).
- Required: TB screening current per agency policy.
- Preferred: Doctor of Physical Therapy (DPT) degree.
- Preferred: OASIS competency in home health assessments.
- Preferred: Specialty certifications (geriatrics, orthopedics, neurology, vestibular rehabilitation).

SECTION 3: Required Competencies
layout: list

competencies:
- Physical therapy evaluation: musculoskeletal, neurological, cardiovascular-pulmonary, and integumentary systems.
- Gait analysis, assistive device fitting, and mobility training.
- Balance assessment and fall risk reduction programs (including standardized tools: Berg Balance Scale, TUG).
- Therapeutic exercise prescription and progression.
- Home safety assessment: identification of fall hazards and environmental modification recommendations.
- OASIS assessment competency (if serving as primary assessing clinician per Medicare policy).
- Medicare skilled PT criteria: documenting medical necessity, skilled intervention need, and measurable progress.
- PTA supervision: co-signature, direction, and supervisory visit requirements.
- Clinical documentation: evaluation, progress notes, discharge summary, timeliness, and authentication.
- Infection prevention: Standard Precautions in home environments.
- EHR proficiency for clinical documentation and care coordination.

SECTION 4: Regulatory Responsibilities
layout: list

regulations:
- 42 CFR Â§ 484.115 â€” Meets PT personnel qualifications for home health.
- 42 CFR Â§ 484.55 â€” Authorized to complete OASIS assessments when the primary skilled service.
- 42 CFR Â§ 484.60 â€” Plan of care development and physician coordination for therapy episodes.
- 42 CFR Â§ 484.110 â€” Clinical record documentation requirements.
- 42 CFR Â§ 484.70 â€” Infection prevention at point of care.
- CA Physical Therapy Practice Act (BPC Â§ 2600) â€” Practice within PT scope; PTA supervision compliance.
- HIPAA 45 CFR Parts 160 & 164 â€” PHI privacy and security.
- Mandatory Reporter (CA Penal Code Â§ 11166; CA W&I Code Â§ 15630) â€” Elder/dependent adult and child abuse reporting.
- 42 USC Â§ 1320a-7 â€” OIG/SAM exclusion-free status.

SECTION 5: Documentation Responsibilities
layout: list

documentation:
- Complete initial evaluation within required timeframe; document measurable goals, prognosis, and plan.
- Complete treatment notes for each visit within 24 hours (or agency-required timeframe).
- Authenticate all documentation with PT signature, license number, date, and time.
- Complete and co-sign PTA visit notes within required timeframe if supervising a PTA.
- Document patient progress toward goals, skilled need justification, and any status changes.
- Complete discharge summary at episode end with functional outcomes documented.
- Maintain own PT license, BLS/CPR, OIG/SAM, and CEU documentation in personnel file.

SECTION 6: Supervision Responsibilities
layout: list

supervision:
- Supervises Physical Therapist Assistants (PTAs) per California PT Practice Act (minimum supervisory visit every 30 calendar days; co-signature of PTA notes).
- Reports to: Director of Nursing / Clinical Manager (HR-JD-003).

SECTION 7: Physical Requirements
layout: list

physical:
- Medium to heavy work: hands-on therapeutic interventions, patient transfers, gait training, and physical assistance.
- Lifting and support of patients during mobility tasks (up to 50 lbs with mechanical assist).
- Fine motor skills for manual therapy and therapeutic modalities.
- Valid California driver's license and reliable, insured personal vehicle.
- Ability to navigate varied residential environments including stairs and confined spaces.

SECTION 8: Working Conditions
layout: list

conditions:
- Field-based: patient home visits throughout service area.
- Variable schedule; some evening or weekend availability may be required.
- Exposure to infectious disease risk managed per Standard Precautions.
- Physical demands associated with hands-on therapeutic interventions.
- Mileage reimbursed per agency policy.

SECTION 9: Performance Expectations
layout: list

expectations:
- PT evaluation and visit notes completed within agency-required timeframes: â‰¥ 95% compliance.
- Measurable functional goals documented at SOC; progress documented at each visit.
- PTA co-signature compliance: 100% within required timeframe.
- Clinical documentation audit scores meet or exceed agency threshold.
- OASIS accuracy (when completing assessments): â‰¥ 98% submission timeliness.
- Mandatory training completion: 100% on schedule.
- Licensure, CEU, BLS/CPR, and OIG/SAM current without lapse.
- No substantiated scope-of-practice or clinical documentation integrity violations.

SECTION 10: Policy Cross-References
layout: list

policies:
- HR-TA-006 â€” Job Description & Role Definition (controls this document)
- HR-TA-004 â€” Licensure & Certification Verification (own PT license and CEU credentials)
- HR-TA-005 â€” Employee Orientation & Onboarding (initial competency validation requirements)
- CL-SD-002 â€” Physical Therapy Services (skilled PT service delivery standards)
- CL-CA-001 â€” Patient Assessment â€” Comprehensive (OASIS completion when PT is primary skilled service)
- CL-OA-001 â€” OASIS Completion Timeliness & Accountability (submission deadlines when PT is assessing clinician)
- CL-CD-001 â€” Clinical Documentation Standards (evaluation, progress note, and discharge summary requirements)
- CL-CD-003 â€” Clinical Record Authentication & Signature Requirements (PT signature and PTA co-signature standards)
- CL-SD-016 â€” Infection Prevention & Control (Standard Precautions at point of care)
- CL-PR-006 â€” Abuse, Neglect & Exploitation Reporting (mandatory reporter obligations)

SECTION 11: Measurable Performance Standards
layout: list

standards:
- PT evaluation and visit note completion: â‰¥ 95% of notes completed within 24 hours of service â€” per CL-CD-001; no note > 5 business days past service date.
- PTA co-signature compliance: 100% of PTA visit notes co-signed by PT within required timeframe (per CA PT Practice Act and agency policy) â€” 0 unsigned PTA notes.
- OASIS submission timeliness (when PT is assessing clinician): â‰¥ 98% submitted within 5 calendar days of applicable date â€” per CL-OA-001 and 42 CFR Â§ 484.45.
- Measurable goal documentation: 100% of PT evaluations include at least 2 measurable, time-bound functional goals â€” per CL-SD-002 and Medicare skilled PT criteria.
- Clinical documentation audit compliance: pass rate â‰¥ agency threshold on monthly audits â€” per QA-PG-001.
- PT license and BLS/CPR: current without lapse at all times â€” 0 expired credentials in active service â€” per HR-TA-004.
- CEU requirements (CA PT Board): completed per licensure renewal cycle â€” 0 CEU-deficient license renewals.
- Mandatory training completion: 100% of required annual and compliance trainings completed by due date â€” per HR-TA-005.
- OIG/SAM screening (self): monthly; 0 lapses â€” per HR-TA-003.
- Mandatory reporter obligations: abuse/neglect reports filed within 24 hours â€” 0 lapses â€” per CL-PR-006.

SECTION 12: Documentation Ownership
layout: list

owned_records:
- PT Initial Evaluation: author and authenticated owner; completed at SOC or PT-qualifying episode start; retained in patient record.
- PT Visit / Treatment Notes (Progress Notes): author and authenticated owner for each PT-delivered visit; retained in patient record.
- PTA Co-Signature Records: PT is co-signatory on all PTA visit notes; retained in patient record.
- PT Discharge Summary: author; documents functional outcomes, goal attainment, and recommendations; completed at episode end.
- OASIS Assessments (when PT is primary assessing clinician): author and authenticated owner; retained in patient EHR.
- Home Safety Assessment documentation: author; documents hazards identified and modifications recommended; part of PT evaluation or visit note.
- Own credential file entries: PT license, BLS/CPR, OIG/SAM, TB screening, CEU documentation â€” maintained in personnel file.

SECTION 13: Escalation Responsibilities
layout: list

escalation:
- Patient medical emergency during PT session (cardiac event, fall with injury, acute pain, sudden neurological change) â†’ Call 911 if life-threatening; notify physician and DON within 1 hour; document all actions and notifications.
- Suspected patient abuse, neglect, or exploitation â†’ Mandatory report to APS/law enforcement within 24 hours per CA Penal Code Â§ 11166; notify DON same business day.
- Patient condition deterioration indicating skilled PT is no longer safe to deliver independently â†’ Notify physician and DON immediately; do not proceed with treatment until medically cleared.
- PTA practicing outside PT-authorized plan or refusing supervision â†’ Notify DON immediately; do not co-sign unauthorized PTA notes; document findings.
- PT license lapse (own) â†’ Immediately cease patient care; notify DON same business day; do not return to patient care until reinstatement confirmed.
- OASIS rejection or transmission failure (when PT is assessing clinician) â†’ Notify DON within 24 hours; correct and resubmit within 2 business days.
- Patient refuses PT services â†’ Document refusal; notify DON and physician within same business day.

SECTION 14: Required Forms
layout: list

forms:
- PT Initial Evaluation Form (agency EHR or agency-standard): completed at episode start; includes measurable goals.
- PT Visit / Progress Note (agency EHR format): completed at each visit within 24 hours.
- PT Discharge Summary (agency EHR or CL-FM series): completed at episode end.
- CL-FM-002 â€” OASIS-E1 Assessment Form (completed when PT is primary assessing clinician).
- PTA Co-Signature Form or EHR co-signature entry: completed for each PTA visit note within required timeframe.
- Home Safety Assessment Form (CL-FM or agency standard): completed when home safety hazards are identified.
- HR-FM-031 â€” Job Description Acknowledgment Form (signed at hire and upon JD revision).

SECTION 15: Onboarding & Competency Requirements
layout: list

This role is governed by the Role-Based Onboarding & Competency Journey.

Required Training Path:
- General Orientation (GAO Series)
- Role-Specific LMS Track (PT-000 Series)

Competency Requirements:
- Initial competency validation (HR-TD-003 Appendix A)
- Supervised experience (if applicable)
- Clearance required prior to independent duties

Ongoing Compliance:
- Annual training (HR-TD-001)
- Annual competency evaluation
- Monthly compliance screening (OIG/SAM)

Refer to:
Role-Based Onboarding & Competency Journey (Master Framework)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Document HR-JD-009 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2027-07-10
- Linked Policies: HR-TA-006, HR-TA-004, HR-TA-005
- Regulatory Authority: 42 CFR Â§ 484.115; Â§ 484.55; CA BPC Â§ 2600
- Reports To: Director of Nursing / Clinical Manager (HR-JD-003)

---

## SOURCE: Builder\Forns\HR-JD-010.txt

DOCUMENT ID: HR-JD-010
TITLE: Occupational Therapist (OT)
TYPE: Job Description
DOMAIN: HR
SUBDOMAIN: JD
USAGE: Required
FREQUENCY: Biennial Review
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2027-07-10
ORIENTATION: portrait
CLASSIFICATIONS: clinical, licensed_professional, skilled_care, therapy

LINKED POLICIES:
- HR-TA-006 (Job Description & Role Definition)
- HR-TA-004 (Licensure & Certification Verification)
- HR-TA-005 (Employee Orientation & Onboarding)

POSITION SUMMARY:
The Occupational Therapist (OT) provides skilled occupational therapy services to home health patients when ordered by the attending physician and included in the plan of care. Occupational therapy in Medicare home health focuses on restoring and maintaining a patient's functional independence in activities of daily living (ADLs) and instrumental activities of daily living (IADLs). The OT evaluates functional deficits, develops individualized treatment programs, recommends adaptive equipment and home modifications, and educates patients and caregivers. Note: Under Medicare policy, occupational therapy alone does not independently establish Medicare home health eligibility at start of care but may be the continuing qualifying service. The OT may supervise Certified Occupational Therapy Assistants (COTAs) as authorized by law. This role is governed by 42 CFR Â§ 484.115 and the California Occupational Therapy Practice Act (BPC Â§ 2570 et seq.).

---

SECTION 1: Core Responsibilities
layout: list

responsibilities:
- Conduct comprehensive occupational therapy evaluations of patient ADL/IADL function, cognitive status, sensorimotor abilities, and home environment.
- Develop individualized occupational therapy plans including measurable functional goals, frequency, and duration in coordination with the physician.
- Provide skilled OT interventions: ADL retraining (bathing, dressing, grooming, toileting, feeding), IADL skill training, energy conservation techniques, cognitive-perceptual rehabilitation, fine motor and upper extremity rehabilitation, and splinting/orthotic fabrication.
- Assess the home environment for safety hazards and recommend adaptive equipment, assistive technology, and structural modifications to promote functional independence.
- Provide patient and caregiver education: adaptive techniques, equipment use, energy conservation, safety, and fall prevention.
- Supervise Certified Occupational Therapy Assistants (COTAs): co-sign COTA notes per California OT Practice Act; conduct supervisory visits as required.
- Participate in interdisciplinary care coordination with RN, PT, SLP, MSW, and physician.
- Complete OASIS assessments at required time points when OT is the primary continuing skilled service (per Medicare policy).
- Document all evaluations, treatment notes, and discharge summaries within agency-required timeframes.
- Participate in QAPI activities including outcome monitoring and performance improvement.
- Maintain compliance with HIPAA and all applicable licensure requirements.
- Complete mandatory training per agency policy and schedule.

SECTION 2: Minimum Qualifications
layout: list

qualifications:
- Required: Current, unrestricted Occupational Therapist (OT) license in the state of California (CA Board of OT).
- Required: Bachelor's, Master's, or Doctoral degree in Occupational Therapy from an ACOTE-accredited program.
- Required: Successful completion of national certification examination (NBCOT).
- Required: Minimum one (1) year of OT clinical experience; home health experience preferred.
- Required: No current exclusion from federal or state healthcare programs (OIG/SAM).
- Required: Current BLS/CPR certification.
- Required: Valid California driver's license and personal vehicle with current insurance.
- Required: Completion of agency new-hire orientation and competency training prior to independent practice.
- Required: TB screening current per agency policy.
- Preferred: Master of Occupational Therapy (MOT) or Occupational Therapy Doctorate (OTD).
- Preferred: Specialty certifications relevant to home health patient population (low vision, driver rehabilitation, dementia care).

SECTION 3: Required Competencies
layout: list

competencies:
- OT evaluation: functional assessment of ADLs/IADLs, cognition, perception, fine motor, and upper extremity function.
- Activity analysis and graded ADL retraining techniques.
- Home safety evaluation and adaptive equipment recommendation.
- Cognitive-perceptual rehabilitation for neurological conditions (stroke, TBI, dementia).
- Upper extremity rehabilitation: ROM, strength, splinting, and functional grasp.
- Energy conservation and work simplification techniques.
- COTA supervision: co-signature, direction, and supervisory visit requirements.
- Medicare skilled OT criteria: documenting medical necessity, skilled intervention need, and measurable progress.
- Clinical documentation: evaluation, progress notes, discharge summary, timeliness, and authentication.
- Infection prevention: Standard Precautions in home environments.
- EHR proficiency for clinical documentation and care coordination.
- Cultural competency and patient-centered care principles.

SECTION 4: Regulatory Responsibilities
layout: list

regulations:
- 42 CFR Â§ 484.115 â€” Meets OT personnel qualifications for home health.
- 42 CFR Â§ 484.55 â€” May complete OASIS assessments in qualifying continuing service situations per Medicare policy.
- 42 CFR Â§ 484.60 â€” Plan of care development and physician coordination for OT episodes.
- 42 CFR Â§ 484.110 â€” Clinical record documentation requirements.
- 42 CFR Â§ 484.70 â€” Infection prevention at point of care.
- CA Occupational Therapy Practice Act (BPC Â§ 2570) â€” Practice within OT scope; COTA supervision compliance.
- HIPAA 45 CFR Parts 160 & 164 â€” PHI privacy and security.
- Mandatory Reporter (CA Penal Code Â§ 11166; CA W&I Code Â§ 15630) â€” Elder/dependent adult and child abuse reporting.
- 42 USC Â§ 1320a-7 â€” OIG/SAM exclusion-free status.

SECTION 5: Documentation Responsibilities
layout: list

documentation:
- Complete initial OT evaluation within required timeframe; document measurable functional goals and prognosis.
- Complete treatment notes for each visit within 24 hours (or agency-required timeframe).
- Authenticate all documentation with OT signature, license number, date, and time.
- Co-sign COTA visit notes within required timeframe if supervising a COTA.
- Document patient functional progress, skilled intervention justification, and status changes.
- Complete discharge summary at episode end with measurable functional outcomes.
- Maintain own OT license, NBCOT certification, BLS/CPR, OIG/SAM, and CEU documentation.

SECTION 6: Supervision Responsibilities
layout: list

supervision:
- Supervises Certified Occupational Therapy Assistants (COTAs) per California OT Practice Act (co-signature of COTA notes; supervisory visit requirements per state law).
- Reports to: Director of Nursing / Clinical Manager (HR-JD-003).

SECTION 7: Physical Requirements
layout: list

physical:
- Medium work: hands-on therapeutic interventions, ADL training assistance, and patient positioning.
- Ability to assist patients with mobility and transfers as needed.
- Fine motor skills for splinting, equipment fitting, and therapeutic activities.
- Valid California driver's license and reliable, insured personal vehicle.
- Ability to navigate varied residential environments.

SECTION 8: Working Conditions
layout: list

conditions:
- Field-based: patient home visits throughout service area.
- Variable schedule; some evening or weekend availability may be required.
- Exposure to infectious disease risk managed per Standard Precautions.
- Physically demanding therapeutic interventions.
- Mileage reimbursed per agency policy.

SECTION 9: Performance Expectations
layout: list

expectations:
- OT evaluation and visit notes completed within agency-required timeframes: â‰¥ 95% compliance.
- Measurable functional goals (ADL-based) documented at SOC; progress documented at each visit.
- COTA co-signature compliance: 100% within required timeframe.
- Clinical documentation audit scores meet or exceed agency threshold.
- Mandatory training completion: 100% on schedule.
- Licensure, NBCOT, BLS/CPR, and OIG/SAM current without lapse.
- No substantiated scope-of-practice or documentation integrity violations.

SECTION 10: Policy Cross-References
layout: list

policies:
- HR-TA-006 â€” Job Description & Role Definition (controls this document)
- HR-TA-004 â€” Licensure & Certification Verification (own OT license, NBCOT, and CEU credentials)
- HR-TA-005 â€” Employee Orientation & Onboarding (initial competency validation requirements)
- CL-SD-003 â€” Occupational Therapy Services (skilled OT service delivery standards)
- CL-CA-001 â€” Patient Assessment â€” Comprehensive (OASIS completion in qualifying continuing service situations)
- CL-OA-001 â€” OASIS Completion Timeliness & Accountability (submission deadlines when OT is assessing clinician)
- CL-CD-001 â€” Clinical Documentation Standards (evaluation, progress note, and discharge summary requirements)
- CL-CD-003 â€” Clinical Record Authentication & Signature Requirements (OT signature and COTA co-signature standards)
- CL-SD-016 â€” Infection Prevention & Control (Standard Precautions at point of care)
- CL-PR-006 â€” Abuse, Neglect & Exploitation Reporting (mandatory reporter obligations)

SECTION 11: Measurable Performance Standards
layout: list

standards:
- OT evaluation and visit note completion: â‰¥ 95% of notes completed within 24 hours of service â€” per CL-CD-001; no note > 5 business days past service date.
- COTA co-signature compliance: 100% of COTA visit notes co-signed by OT within required timeframe (per CA OT Practice Act and agency policy) â€” 0 unsigned COTA notes.
- OASIS submission timeliness (when OT is assessing clinician per Medicare policy): â‰¥ 98% submitted within 5 calendar days â€” per CL-OA-001 and 42 CFR Â§ 484.45.
- Measurable functional goal documentation (ADL-based): 100% of OT evaluations include at least 2 measurable, ADL-focused, time-bound goals â€” per CL-SD-003 and Medicare skilled OT criteria.
- Clinical documentation audit compliance: pass rate â‰¥ agency threshold on monthly audits â€” per QA-PG-001.
- OT license, NBCOT, and BLS/CPR: current without lapse â€” 0 expired credentials in active service â€” per HR-TA-004.
- CEU requirements (CA OT Board): completed per licensure renewal cycle â€” 0 CEU-deficient renewals.
- Mandatory training completion: 100% by due date â€” per HR-TA-005.
- OIG/SAM screening (self): monthly; 0 lapses â€” per HR-TA-003.
- Mandatory reporter obligations: abuse/neglect reports filed within 24 hours â€” 0 lapses â€” per CL-PR-006.

SECTION 12: Documentation Ownership
layout: list

owned_records:
- OT Initial Evaluation: author and authenticated owner; includes functional baseline, measurable ADL-based goals, and plan; retained in patient record.
- OT Visit / Progress Notes: author and authenticated owner for each OT-delivered visit; retained in patient record.
- COTA Co-Signature Records: OT is co-signatory on all COTA visit notes; retained in patient record.
- OT Discharge Summary: author; documents ADL functional outcomes, goal attainment, equipment recommendations, and home program; completed at episode end.
- OASIS Assessments (when OT is assessing clinician per Medicare policy): author and authenticated owner; retained in patient EHR.
- Adaptive Equipment and Home Modification Recommendations: author; documents equipment ordered, supplier contact, and installation/training plan; part of OT evaluation or visit note.
- Own credential file entries: OT license, NBCOT, BLS/CPR, OIG/SAM, TB screening, CEU documentation â€” maintained in personnel file.

SECTION 13: Escalation Responsibilities
layout: list

escalation:
- Patient medical emergency during OT session â†’ Call 911 if life-threatening; notify physician and DON within 1 hour; document all actions and notifications.
- Suspected patient abuse, neglect, or exploitation â†’ Mandatory report to APS/law enforcement within 24 hours per CA Penal Code Â§ 11166; notify DON same business day.
- Cognitive or safety decline indicating patient cannot safely participate in OT or is unsafe at home â†’ Notify physician and DON same visit; document findings; do not discharge or change plan unilaterally.
- COTA practicing outside OT-authorized plan or refusing supervision â†’ Notify DON immediately; do not co-sign unauthorized COTA notes.
- OT license or NBCOT lapse (own) â†’ Immediately cease patient care; notify DON same business day.
- OASIS rejection or transmission failure (when OT is assessing clinician) â†’ Notify DON within 24 hours; correct and resubmit within 2 business days.
- Patient refuses OT services â†’ Document refusal; notify DON and physician within same business day.

SECTION 14: Required Forms
layout: list

forms:
- OT Initial Evaluation Form (agency EHR or agency-standard): completed at episode start; includes measurable ADL goals.
- OT Visit / Progress Note (agency EHR format): completed at each visit within 24 hours.
- OT Discharge Summary (agency EHR or CL-FM series): completed at episode end.
- CL-FM-002 â€” OASIS-E1 Assessment Form (completed when OT is assessing clinician per Medicare policy).
- COTA Co-Signature Form or EHR co-signature entry: completed for each COTA visit note within required timeframe.
- Adaptive Equipment / Durable Medical Equipment Recommendation Form (agency standard or physician order form): completed when equipment is recommended.
- HR-FM-031 â€” Job Description Acknowledgment Form (signed at hire and upon JD revision).

SECTION 15: Onboarding & Competency Requirements
layout: list

This role is governed by the Role-Based Onboarding & Competency Journey.

Required Training Path:
- General Orientation (GAO Series)
- Role-Specific LMS Track (OT-000 Series)

Competency Requirements:
- Initial competency validation (HR-TD-003 Appendix A)
- Supervised experience (if applicable)
- Clearance required prior to independent duties

Ongoing Compliance:
- Annual training (HR-TD-001)
- Annual competency evaluation
- Monthly compliance screening (OIG/SAM)

Refer to:
Role-Based Onboarding & Competency Journey (Master Framework)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Document HR-JD-010 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2027-07-10
- Linked Policies: HR-TA-006, HR-TA-004, HR-TA-005
- Regulatory Authority: 42 CFR Â§ 484.115; CA BPC Â§ 2570
- Reports To: Director of Nursing / Clinical Manager (HR-JD-003)

---

## SOURCE: Builder\Forns\HR-JD-011.txt

DOCUMENT ID: HR-JD-011
TITLE: Speech-Language Pathologist (SLP)
TYPE: Job Description
DOMAIN: HR
SUBDOMAIN: JD
USAGE: Required
FREQUENCY: Biennial Review
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2027-07-10
ORIENTATION: portrait
CLASSIFICATIONS: clinical, licensed_professional, skilled_care, therapy

LINKED POLICIES:
- HR-TA-006 (Job Description & Role Definition)
- HR-TA-004 (Licensure & Certification Verification)
- HR-TA-005 (Employee Orientation & Onboarding)

POSITION SUMMARY:
The Speech-Language Pathologist (SLP) provides skilled speech-language pathology services to home health patients when ordered by the attending physician and included in the plan of care. Speech-language pathology in Medicare home health is a skilled service that may independently establish Medicare eligibility. The SLP evaluates and treats disorders of communication (speech, language, voice, fluency, and cognitive-linguistic function) and swallowing (dysphagia), and develops individualized treatment programs to restore, maintain, or improve functional communication and safe oral intake. This role is governed by 42 CFR Â§ 484.115 and the California Speech-Language Pathology and Audiology and Hearing Aid Dispensers Act (BPC Â§ 2530 et seq.).

---

SECTION 1: Core Responsibilities
layout: list

responsibilities:
- Conduct comprehensive speech-language pathology evaluations of communication disorders, voice disorders, fluency disorders, cognitive-linguistic deficits, and dysphagia/swallowing disorders.
- Develop individualized SLP treatment plans with measurable functional goals, frequency, and duration in coordination with the physician.
- Provide skilled SLP interventions: articulation and speech production therapy, language processing and expression therapy, voice therapy, fluency treatment, cognitive-linguistic rehabilitation, and dysphagia therapy (oral motor exercise, safe swallowing strategies, diet texture modification recommendations).
- Assess swallowing safety and make clinical recommendations for diet modifications, feeding strategies, and physician referral for instrumental swallowing studies (MBSS, FEES) when indicated.
- Provide Augmentative and Alternative Communication (AAC) assessment and training as appropriate.
- Provide patient, family, and caregiver education on communication strategies, dysphagia management, and compensatory techniques.
- Coordinate with dietitian, RN, physician, and OT on dysphagia management and nutritional safety.
- Participate in interdisciplinary care coordination and team conferences.
- Complete OASIS assessments at required time points when SLP is the primary qualifying skilled service.
- Document all evaluations, treatment notes, and discharge summaries within agency-required timeframes.
- Participate in QAPI activities.
- Maintain compliance with HIPAA and all applicable licensure requirements.
- Complete mandatory training per agency policy and schedule.

SECTION 2: Minimum Qualifications
layout: list

qualifications:
- Required: Current, unrestricted Speech-Language Pathologist (SLP/CCC-SLP) license in the state of California (CA SLP&A Board).
- Required: Master's degree or higher in Speech-Language Pathology from an ASHA-accredited program.
- Required: Certificate of Clinical Competence in Speech-Language Pathology (ASHA CCC-SLP) or enrolled in the Clinical Fellowship Year (CFY) per applicable law.
- Required: Minimum one (1) year of SLP clinical experience; home health experience preferred.
- Required: No current exclusion from federal or state healthcare programs (OIG/SAM).
- Required: Current BLS/CPR certification.
- Required: Valid California driver's license and personal vehicle with current insurance.
- Required: Completion of agency new-hire orientation and competency validation prior to independent patient care.
- Required: TB screening current per agency policy.
- Preferred: Dysphagia specialty experience (BRS-S certification or equivalent).
- Preferred: AAC experience and cognitive-linguistic rehabilitation competency.

SECTION 3: Required Competencies
layout: list

competencies:
- Speech-language pathology evaluation: standardized assessment tools for communication disorders, cognitive-linguistic function, and dysphagia.
- Clinical dysphagia evaluation: oral mechanism examination, bedside swallowing assessment, aspiration risk recognition.
- Diet texture and fluid consistency modification recommendations per IDDSI framework.
- Language rehabilitation: aphasia, dysarthria, cognitive-linguistic deficits post-neurological event.
- Voice and fluency therapy techniques.
- AAC assessment and basic device training.
- Medicare skilled SLP criteria: documenting medical necessity, skilled intervention need, and functional progress.
- Patient/family education: safe swallowing strategies, communication aids, and compensatory techniques.
- OASIS competency (items applicable to communication, cognition, and swallowing).
- Clinical documentation: evaluation, progress notes, discharge summary, timeliness, authentication.
- Infection prevention: Standard Precautions in home environments.
- Interdisciplinary communication and care coordination.
- EHR proficiency.

SECTION 4: Regulatory Responsibilities
layout: list

regulations:
- 42 CFR Â§ 484.115 â€” Meets SLP personnel qualifications for home health.
- 42 CFR Â§ 484.55 â€” Authorized to complete OASIS assessments when the primary qualifying skilled service.
- 42 CFR Â§ 484.60 â€” Plan of care development and physician coordination.
- 42 CFR Â§ 484.110 â€” Clinical record documentation requirements.
- 42 CFR Â§ 484.70 â€” Infection prevention at point of care.
- CA SLP&A Practice Act (BPC Â§ 2530) â€” Practice within SLP scope; licensure compliance.
- ASHA Code of Ethics â€” Professional standards and ethical practice.
- HIPAA 45 CFR Parts 160 & 164 â€” PHI privacy and security.
- Mandatory Reporter (CA Penal Code Â§ 11166; CA W&I Code Â§ 15630) â€” Elder/dependent adult and child abuse reporting.
- 42 USC Â§ 1320a-7 â€” OIG/SAM exclusion-free status.

SECTION 5: Documentation Responsibilities
layout: list

documentation:
- Complete initial SLP evaluation within required timeframe; document measurable functional goals and clinical findings.
- Complete treatment notes for each visit within 24 hours (or agency-required timeframe).
- Authenticate all documentation with SLP/CCC-SLP signature, license number, date, and time.
- Document dysphagia findings, dietary recommendations, and physician notification.
- Document patient/family education provided and response.
- Complete discharge summary at episode end with measurable functional communication/swallowing outcomes.
- Maintain own SLP license, ASHA CCC-SLP, BLS/CPR, OIG/SAM, and ASHA CEU records.

SECTION 6: Supervision Responsibilities
layout: list

supervision:
- May supervise Speech-Language Pathology Assistants (SLPAs) per California BPC requirements and ASHA guidelines, if utilized by agency.
- Reports to: Director of Nursing / Clinical Manager (HR-JD-003).

SECTION 7: Physical Requirements
layout: list

physical:
- Light to medium work: home visits, patient positioning for dysphagia evaluations, and therapeutic activities.
- Fine motor skills for clinical procedures and AAC device operation.
- Valid California driver's license and reliable, insured personal vehicle.
- Ability to navigate varied residential environments.

SECTION 8: Working Conditions
layout: list

conditions:
- Field-based: patient home visits throughout the service area.
- Variable schedule; some evening or weekend availability may be required.
- Exposure to infectious disease risk managed per Standard Precautions.
- Exposure to situations involving patient communication impairment, cognitive decline, and end-of-life contexts.
- Mileage reimbursed per agency policy.

SECTION 9: Performance Expectations
layout: list

expectations:
- SLP evaluation and visit notes completed within agency-required timeframes: â‰¥ 95% compliance.
- Measurable functional communication/swallowing goals documented at SOC; progress documented each visit.
- Clinical documentation audit scores meet or exceed agency threshold.
- Dysphagia dietary recommendations documented and communicated to care team within 24 hours of assessment.
- Mandatory training completion: 100% on schedule.
- Licensure, CCC-SLP, BLS/CPR, OIG/SAM current without lapse.
- No substantiated scope-of-practice or documentation integrity violations.

SECTION 10: Policy Cross-References
layout: list

policies:
- HR-TA-006 â€” Job Description & Role Definition (controls this document)
- HR-TA-004 â€” Licensure & Certification Verification (own SLP license and ASHA CCC-SLP credentials)
- HR-TA-005 â€” Employee Orientation & Onboarding (initial competency validation requirements)
- CL-SD-004 â€” Speech-Language Pathology Services (skilled SLP service delivery standards)
- CL-CA-001 â€” Patient Assessment â€” Comprehensive (OASIS completion when SLP is primary skilled service)
- CL-OA-001 â€” OASIS Completion Timeliness & Accountability (submission deadlines when SLP is assessing clinician)
- CL-CD-001 â€” Clinical Documentation Standards (evaluation, progress note, and discharge summary requirements)
- CL-CD-003 â€” Clinical Record Authentication & Signature Requirements (SLP signature and SLPA co-signature standards)
- CL-SD-016 â€” Infection Prevention & Control (Standard Precautions at point of care)
- CL-PR-006 â€” Abuse, Neglect & Exploitation Reporting (mandatory reporter obligations)

SECTION 11: Measurable Performance Standards
layout: list

standards:
- SLP evaluation and visit note completion: â‰¥ 95% of notes completed within 24 hours of service â€” per CL-CD-001; no note > 5 business days past service date.
- OASIS submission timeliness (when SLP is primary assessing clinician): â‰¥ 98% submitted within 5 calendar days â€” per CL-OA-001 and 42 CFR Â§ 484.45.
- Measurable functional goal documentation: 100% of SLP evaluations include at least 2 measurable, function-based goals (communication or swallowing) â€” per CL-SD-004 and Medicare skilled SLP criteria.
- Dysphagia dietary recommendation communication: documented and communicated to care team (RN, physician, DON) within 24 hours of any dysphagia assessment â€” 100% compliance.
- Clinical documentation audit compliance: pass rate â‰¥ agency threshold on monthly audits â€” per QA-PG-001.
- SLP license and ASHA CCC-SLP: current without lapse â€” 0 expired credentials in active service â€” per HR-TA-004.
- ASHA CEU requirements: completed per ASHA renewal cycle (30 CEUs per 3-year certification maintenance period) â€” 0 lapsed CCC-SLP status.
- Mandatory training completion: 100% by due date â€” per HR-TA-005.
- OIG/SAM screening (self): monthly; 0 lapses â€” per HR-TA-003.
- Mandatory reporter obligations: abuse/neglect reports filed within 24 hours â€” 0 lapses â€” per CL-PR-006.

SECTION 12: Documentation Ownership
layout: list

owned_records:
- SLP Initial Evaluation: author and authenticated owner; includes communication/swallowing baseline, measurable goals, and plan; retained in patient record.
- SLP Visit / Progress Notes: author and authenticated owner for each SLP-delivered visit; retained in patient record.
- SLPA Co-Signature Records (if SLPA is employed): SLP is co-signatory per CA BPC and ASHA requirements; retained in patient record.
- SLP Discharge Summary: author; documents functional communication and swallowing outcomes, goal attainment, and post-discharge recommendations; completed at episode end.
- OASIS Assessments (when SLP is primary assessing clinician): author and authenticated owner; retained in patient EHR.
- Dysphagia Evaluation Report: author; documents oral mechanism findings, swallowing assessment results, aspiration risk level, dietary modification recommendations, and physician notification; retained in patient record.
- Own credential file entries: SLP license, ASHA CCC-SLP, BLS/CPR, OIG/SAM, TB screening, ASHA CEU records â€” maintained in personnel file.

SECTION 13: Escalation Responsibilities
layout: list

escalation:
- Acute aspiration event or respiratory distress during dysphagia evaluation or feeding session â†’ Stop feeding immediately; call 911 if life-threatening; notify physician and DON within 1 hour; document all actions.
- Patient identified at high aspiration risk with unsafe oral intake continued by family/caregiver against SLP recommendation â†’ Notify physician and DON same visit; document clinical findings, recommendation, family response, and physician notification; activate patient education protocol.
- Suspected patient abuse, neglect, or exploitation â†’ Mandatory report to APS/law enforcement within 24 hours per CA Penal Code Â§ 11166; notify DON same business day.
- SLPA practicing outside SLP-authorized plan or refusing supervision â†’ Notify DON immediately; do not co-sign unauthorized SLPA notes.
- SLP license or ASHA CCC-SLP lapse (own) â†’ Immediately cease patient care; notify DON same business day; do not return until reinstatement confirmed.
- OASIS rejection or transmission failure (when SLP is assessing clinician) â†’ Notify DON within 24 hours; correct and resubmit within 2 business days.
- Patient refuses SLP services or declines recommended diet modification â†’ Document refusal with date and content; notify DON and physician same business day; patient rights protocol per CL-PR-001 applies.

SECTION 14: Required Forms
layout: list

forms:
- SLP Initial Evaluation Form (agency EHR or agency-standard): completed at episode start; includes measurable functional goals.
- SLP Visit / Progress Note (agency EHR format): completed at each visit within 24 hours.
- SLP Discharge Summary (agency EHR or CL-FM series): completed at episode end.
- CL-FM-002 â€” OASIS-E1 Assessment Form (completed when SLP is primary assessing clinician).
- Dysphagia Evaluation Report (agency-standard): completed following any clinical swallowing evaluation; documents aspiration risk and dietary recommendations.
- SLPA Co-Signature Form or EHR co-signature entry (if SLPA employed): completed for each SLPA session note within required timeframe.
- HR-FM-031 â€” Job Description Acknowledgment Form (signed at hire and upon JD revision).

SECTION 15: Onboarding & Competency Requirements
layout: list

This role is governed by the Role-Based Onboarding & Competency Journey.

Required Training Path:
- General Orientation (GAO Series)
- Role-Specific LMS Track (SLP-000 Series)

Competency Requirements:
- Initial competency validation (HR-TD-003 Appendix A)
- Supervised experience (if applicable)
- Clearance required prior to independent duties

Ongoing Compliance:
- Annual training (HR-TD-001)
- Annual competency evaluation
- Monthly compliance screening (OIG/SAM)

Refer to:
Role-Based Onboarding & Competency Journey (Master Framework)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Document HR-JD-011 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2027-07-10
- Linked Policies: HR-TA-006, HR-TA-004, HR-TA-005
- Regulatory Authority: 42 CFR Â§ 484.115; Â§ 484.55; CA BPC Â§ 2530; ASHA Code of Ethics
- Reports To: Director of Nursing / Clinical Manager (HR-JD-003)

---

## SOURCE: Builder\Forns\IT-FM-001.txt

FORM ID: IT-FM-001
TITLE: User Access Request & Authorization Form
TYPE: Form
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- IT-SC-002

PURPOSE:
Request for user access to specific agency information systems, specifying role, access level, and business justification.

INSTRUCTIONS:
Submitted by hiring manager; reviewed by IT and Privacy/Security. Access provisioned within 2 business days of approval.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- User Full Name (type=text, required=true, col=2)
- Employee ID (type=text, col=2)
- Role / Title (type=text, col=2)
- Manager (type=text, col=2)
- Systems Requested (EHR, HRIS, Billing, etc.) (type=textarea, required=true, col=4)
- Access Level (Read / Modify / Admin) (type=textarea, col=4)
- Business Justification (type=textarea, required=true, col=4)
- Effective Date (type=date, col=2)
- Expiration / Termination Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Requesting Manager â€” Printed Name (type=text, col=2)
- Requesting Manager â€” Signature (type=signature, col=1)
- Requesting Manager â€” Date (type=date, col=1)
- IT Security â€” Printed Name (type=text, col=2)
- IT Security â€” Signature (type=signature, col=1)
- IT Security â€” Date (type=date, col=1)
- User â€” Printed Name (type=text, col=2)
- User â€” Signature (type=signature, col=1)
- User â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-001 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SC-002

---

## SOURCE: Builder\Forns\IT-FM-002.txt

FORM ID: IT-FM-002
TITLE: System Access Revocation Checklist
TYPE: Checklist
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- IT-SC-002
- HR-ER-006

PURPOSE:
Checklist confirming that user system access has been revoked within 24 hours of separation or role change, per 45 CFR Â§ 164.308(a)(3)(ii)(C).

INSTRUCTIONS:
Triggered by HR separation/role-change event. Completed within 24 hours. Evidence retained for 6 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” System Access Revocation Checklist Checklist
layout: checklist

checklist_items:
- EHR / Clinical system access disabled
- Email account disabled
- HRIS access disabled
- Billing / Finance system access disabled
- VPN / Remote access disabled
- SaaS application accounts disabled (SSO & direct)
- Administrative / Privileged accounts revoked
- Mobile device remotely wiped (if agency-owned or BYOD with MDM)
- Badge / physical access deactivated
- Forwarded email address established (if approved)
- Voicemail message updated
- Keys / equipment returned and documented
- Data export requests (if any) reviewed and fulfilled
- Final access log review completed

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- IT Security â€” Printed Name (type=text, col=2)
- IT Security â€” Signature (type=signature, col=1)
- IT Security â€” Date (type=date, col=1)
- HR â€” Printed Name (type=text, col=2)
- HR â€” Signature (type=signature, col=1)
- HR â€” Date (type=date, col=1)
- Departing User (if available) â€” Printed Name (type=text, col=2)
- Departing User (if available) â€” Signature (type=signature, col=1)
- Departing User (if available) â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-002 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SC-002, HR-ER-006

---

## SOURCE: Builder\Forns\IT-FM-003.txt

FORM ID: IT-FM-003
TITLE: IT Hardware Asset & Disposal Log
TYPE: Log
DOMAIN: IT
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- IT-SA-005

PURPOSE:
Log of IT hardware asset assignments, transfers, and disposal with asset tag, serial number, and chain-of-custody.

INSTRUCTIONS:
Maintained continuously by IT. Disposal must include secure media sanitization (IT-FM-024).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Asset Tag
- Device Type
- Serial #
- Assigned To
- Assignment Date
- Return Date
- Disposal Date
- Sanitization Method
- Disposition
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-003 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SA-005

---

## SOURCE: Builder\Forns\IT-FM-004.txt

FORM ID: IT-FM-004
TITLE: Software & Application License Register
TYPE: Tracking Tool
DOMAIN: IT
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- IT-SA-002

PURPOSE:
Register of all software and application licenses, seats, renewal dates, and compliance status.

INSTRUCTIONS:
Updated at every purchase, renewal, or termination. Reviewed quarterly to avoid over/under-licensing.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Software / App
- Vendor
- License Type
- Seats Licensed
- Seats In Use
- Renewal Date
- Cost
- Owner
- BAA? (Y/N)
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-004 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SA-002

---

## SOURCE: Builder\Forns\IT-FM-005.txt

FORM ID: IT-FM-005
TITLE: BYOD (Bring Your Own Device) Agreement
TYPE: Attestation
DOMAIN: IT
USAGE: Required
FREQUENCY: Upon Hire
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- IT-UP-001

PURPOSE:
Bring-Your-Own-Device agreement governing use of personal devices to access agency systems or PHI.

INSTRUCTIONS:
Signed at hire or upon BYOD enrollment. MDM software must be installed before access granted.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I acknowledge that:

acknowledgments:
- I will install and maintain agency-required Mobile Device Management (MDM) software on my personal device.
- The agency may remotely wipe agency data from my device at any time, including upon separation.
- I will report loss, theft, or compromise of my device within 1 hour.
- I will use only approved applications to access agency data.
- I will maintain strong passcode, biometric lock, and encryption on the device.
- I will not share device access with family or others.
- I understand the agency is not responsible for data loss affecting personal data on my device.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- User â€” Printed Name (type=text, col=2)
- User â€” Signature (type=signature, col=1)
- User â€” Date (type=date, col=1)
- IT Security â€” Printed Name (type=text, col=2)
- IT Security â€” Signature (type=signature, col=1)
- IT Security â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-005 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-UP-001

---

## SOURCE: Builder\Forns\IT-FM-006.txt

FORM ID: IT-FM-006
TITLE: Internet & Email Acceptable Use Agreement
TYPE: Attestation
DOMAIN: IT
USAGE: Required
FREQUENCY: Upon Hire
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- IT-UP-002

PURPOSE:
Acceptable Use Policy acknowledgment for agency internet, email, and electronic communications.

INSTRUCTIONS:
Signed at hire and annually.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I acknowledge and agree that:

acknowledgments:
- Internet and email resources are for business purposes; incidental personal use is allowed if it does not interfere with work.
- I will not send PHI via unencrypted email or public channels.
- I will not access offensive, illegal, or malicious content from agency networks.
- All communications may be monitored, logged, and audited.
- I will not use agency email for personal business activities, solicitation, or political advocacy.
- Violations may result in discipline up to termination and legal action.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- User â€” Printed Name (type=text, col=2)
- User â€” Signature (type=signature, col=1)
- User â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-006 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-UP-002

---

## SOURCE: Builder\Forns\IT-FM-007.txt

FORM ID: IT-FM-007
TITLE: Social Media Policy Acknowledgment
TYPE: Attestation
DOMAIN: IT
USAGE: Required
FREQUENCY: Upon Hire
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- IT-UP-003

PURPOSE:
Acknowledgment of agency social media policy governing personal and professional social media use as it relates to Care Indeed, patients, and colleagues.

INSTRUCTIONS:
Signed at hire and annually.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
I acknowledge that:

acknowledgments:
- I will not post, share, or reference any PHI on social media â€” ever.
- I will not speak on behalf of the agency without authorization.
- I will not disparage patients, colleagues, or the agency on public channels.
- Any personal opinions I post are mine alone, and I will disclose my agency affiliation if relevant.
- Violations may result in discipline up to termination.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- User â€” Printed Name (type=text, col=2)
- User â€” Signature (type=signature, col=1)
- User â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-007 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-UP-003

---

## SOURCE: Builder\Forns\IT-FM-008.txt

FORM ID: IT-FM-008
TITLE: Data Backup & Restore Testing Log
TYPE: Log
DOMAIN: IT
USAGE: Required
FREQUENCY: Monthly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-DR-001

PURPOSE:
Monthly log of data backup verification and periodic restore testing per 45 CFR Â§ 164.308(a)(7)(ii)(A).

INSTRUCTIONS:
Backups verified daily; full restore test performed monthly. Results retained for 6 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- System / Dataset
- Backup Date
- Success/Fail
- Backup Size
- Restore Test Date
- Restore Result
- Performed By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-008 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-DR-001

---

## SOURCE: Builder\Forns\IT-FM-009.txt

FORM ID: IT-FM-009
TITLE: IT Security Incident Report Form
TYPE: Form
DOMAIN: IT
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- IT-DR-005

PURPOSE:
Report form for any suspected or confirmed information-security incident (malware, unauthorized access, data exposure, phishing).

INSTRUCTIONS:
Submitted within 1 hour of discovery. Response activated per incident-response plan.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Reporter Name / Role (type=text, required=true, col=2)
- Report Date / Time (type=text, required=true, col=2)
- Incident Type (type=select, required=true, col=2, options=[Malware | Unauthorized Access | Phishing | Data Loss | Lost / Stolen Device | Ransomware | Other])
- Severity (1-4) (type=select, col=2, options=[1 Critical | 2 High | 3 Medium | 4 Low])
- Systems / Data Affected (type=textarea, col=4)
- How Incident was Discovered (type=textarea, col=4)
- Immediate Actions Taken (type=textarea, col=4)
- PHI Involved? (Y/N) (type=select, col=2, options=[Yes | No | Unknown])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Reporter â€” Printed Name (type=text, col=2)
- Reporter â€” Signature (type=signature, col=1)
- Reporter â€” Date (type=date, col=1)
- IT Security â€” Printed Name (type=text, col=2)
- IT Security â€” Signature (type=signature, col=1)
- IT Security â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-009 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-DR-005

---

## SOURCE: Builder\Forns\IT-FM-010.txt

FORM ID: IT-FM-010
TITLE: System Change Management Request (CMR) Form
TYPE: Form
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- IT-SA-003

PURPOSE:
Change Management Request documenting any proposed change to systems (applications, configurations, integrations) with risk and rollback plan.

INSTRUCTIONS:
Submitted at least 5 business days before planned change. Approved by CAB. Emergency changes documented within 24 hours.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Change # (type=text, col=2)
- Change Type (type=select, col=2, options=[Standard | Normal | Emergency])
- Requester (type=text, col=2)
- Proposed Start / End (type=text, col=2)
- System(s) Affected (type=textarea, col=4)
- Change Description (type=textarea, required=true, col=4)
- Business Justification (type=textarea, col=4)
- Risk Assessment (type=textarea, required=true, col=4)
- Test Plan (type=textarea, col=4)
- Rollback Plan (type=textarea, required=true, col=4)
- Communications Plan (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Requester â€” Printed Name (type=text, col=2)
- Requester â€” Signature (type=signature, col=1)
- Requester â€” Date (type=date, col=1)
- CAB Chair â€” Printed Name (type=text, col=2)
- CAB Chair â€” Signature (type=signature, col=1)
- CAB Chair â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-010 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SA-003

---

## SOURCE: Builder\Forns\IT-FM-011.txt

FORM ID: IT-FM-011
TITLE: Information Security Risk Assessment (SRA) Template
TYPE: Template
DOMAIN: IT
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- IT-SC-001

PURPOSE:
HIPAA Security Risk Analysis template covering Administrative, Physical, and Technical safeguards across all systems handling ePHI.

INSTRUCTIONS:
Performed annually and after any significant change. Feeds the security risk register.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Title / Subject (type=text, col=4)
- Date (type=date, col=2)
- Prepared By (type=text, col=2)
- Body / Narrative (type=textarea, col=4)
- Attachments / References (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)
- Privacy Officer â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-011 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SC-001

---

## SOURCE: Builder\Forns\IT-FM-012.txt

FORM ID: IT-FM-012
TITLE: Privileged Access User (PAU) Agreement
TYPE: Attestation
DOMAIN: IT
USAGE: Required
FREQUENCY: Upon Hire
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, digital_candidate

LINKED POLICIES:
- IT-SC-002

PURPOSE:
Privileged Access User agreement for any user with administrative access to systems containing ePHI.

INSTRUCTIONS:
Executed before privileges granted and annually thereafter.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
As a privileged user I agree that:

acknowledgments:
- I will use my privileged account ONLY for administrative tasks; regular work uses my standard account.
- I will not share my privileged credentials or bypass access controls.
- I will promptly document privileged actions in the audit log as required.
- I understand that all privileged activity is logged, monitored, and audited.
- I will report any suspected misuse or compromise immediately.
- Violations may result in revocation, discipline, and legal action.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Privileged User â€” Printed Name (type=text, col=2)
- Privileged User â€” Signature (type=signature, col=1)
- Privileged User â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-012 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SC-002

---

## SOURCE: Builder\Forns\IT-FM-013.txt

FORM ID: IT-FM-013
TITLE: Encryption Exception Request Form
TYPE: Form
DOMAIN: IT
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- IT-SC-003

PURPOSE:
Request for a documented, time-limited exception to data encryption requirements (e.g., legacy system, specific workflow).

INSTRUCTIONS:
Reviewed by Security Officer. Compensating controls required. Maximum duration 180 days.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- System / Data Involved (type=text, required=true, col=4)
- Reason Encryption Not Feasible (type=textarea, required=true, col=4)
- Compensating Controls Proposed (type=textarea, required=true, col=4)
- Exception Duration (type=text, col=2)
- Risk Assessment Summary (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Requester â€” Printed Name (type=text, col=2)
- Requester â€” Signature (type=signature, col=1)
- Requester â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-013 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SC-003

---

## SOURCE: Builder\Forns\IT-FM-014.txt

FORM ID: IT-FM-014
TITLE: Firewall Rule Change Authorization Form
TYPE: Form
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SC-004

PURPOSE:
Firewall rule change request documenting requested rule, business justification, risk, and approval.

INSTRUCTIONS:
Reviewed by Network / Security team. Emergency changes documented within 24 hours.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Requester (type=text, required=true, col=2)
- Date Needed (type=date, col=2)
- Proposed Rule (source / dest / port / proto) (type=textarea, required=true, col=4)
- Business Justification (type=textarea, required=true, col=4)
- Duration (Permanent / Temp) (type=text, col=2)
- Risk Assessment (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Requester â€” Printed Name (type=text, col=2)
- Requester â€” Signature (type=signature, col=1)
- Requester â€” Date (type=date, col=1)
- Network Admin â€” Printed Name (type=text, col=2)
- Network Admin â€” Signature (type=signature, col=1)
- Network Admin â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-014 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SC-004

---

## SOURCE: Builder\Forns\IT-FM-015.txt

FORM ID: IT-FM-015
TITLE: VPN / Remote Access Request Form
TYPE: Form
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- IT-SC-004

PURPOSE:
Request for VPN / remote-access account for remote workers accessing agency systems securely.

INSTRUCTIONS:
Required for any remote access. MFA mandatory. Access reviewed quarterly.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- User Name / Role (type=text, required=true, col=2)
- Manager (type=text, col=2)
- Remote Work Start Date (type=date, col=2)
- End Date (if temporary) (type=date, col=2)
- Business Justification (type=textarea, col=4)
- Systems / Applications Needed (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- User â€” Printed Name (type=text, col=2)
- User â€” Signature (type=signature, col=1)
- User â€” Date (type=date, col=1)
- Manager â€” Printed Name (type=text, col=2)
- Manager â€” Signature (type=signature, col=1)
- Manager â€” Date (type=date, col=1)
- IT Security â€” Printed Name (type=text, col=2)
- IT Security â€” Signature (type=signature, col=1)
- IT Security â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-015 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SC-004

---

## SOURCE: Builder\Forns\IT-FM-016.txt

FORM ID: IT-FM-016
TITLE: Endpoint Malware Infection Log
TYPE: Log
DOMAIN: IT
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- IT-SC-005

PURPOSE:
Log of every endpoint malware infection detected, contained, eradicated, and validated.

INSTRUCTIONS:
Updated within 1 hour of detection. Closed with evidence of eradication and return-to-service.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date/Time
- Endpoint
- User
- Malware Type
- Source Suspected
- Containment Action
- Eradication Action
- Closed
- PHI Exposure?
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-016 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SC-005

---

## SOURCE: Builder\Forns\IT-FM-017.txt

FORM ID: IT-FM-017
TITLE: Data Classification & Handling Matrix
TYPE: Matrix
DOMAIN: IT
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise, audit_critical

LINKED POLICIES:
- IT-SC-006

PURPOSE:
Matrix classifying agency data (Public, Internal, Confidential, Restricted/PHI) and the required handling controls at each level.

INSTRUCTIONS:
Reviewed annually by Privacy and Security Officers. All new data types classified at creation.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Matrix
layout: table

table_columns:
- Classification
- Examples
- Storage
- Transmission
- Sharing
- Retention
- Destruction
table_row_count: 6

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-017 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SC-006

---

## SOURCE: Builder\Forns\IT-FM-018.txt

FORM ID: IT-FM-018
TITLE: Disaster Recovery Tabletop Exercise Report
TYPE: Assessment
DOMAIN: IT
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-DR-002

PURPOSE:
Report of annual disaster-recovery tabletop exercise covering scenario, participants, findings, and corrective actions.

INSTRUCTIONS:
Performed at least annually per 45 CFR Â§ 164.308(a)(7)(ii)(D). Findings feed DR plan updates.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Exercise Date (type=date, required=true, col=2)
- Facilitator (type=text, col=2)
- Scenario Simulated (type=textarea, required=true, col=4)
- Participants (type=textarea, col=4)
- Observations / Findings (type=textarea, col=4)
- Gaps in Plan or Execution (type=textarea, col=4)
- Corrective Actions (type=textarea, col=4)
- Plan Updates Required (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-018 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-DR-002

---

## SOURCE: Builder\Forns\IT-FM-019.txt

FORM ID: IT-FM-019
TITLE: Audit Log Review Checklist
TYPE: Checklist
DOMAIN: IT
USAGE: Required
FREQUENCY: Monthly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-DR-003

PURPOSE:
Monthly checklist of audit-log reviews across critical systems to detect inappropriate access or activity.

INSTRUCTIONS:
Performed monthly. Anomalies investigated and documented.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Audit Log Review Checklist Checklist
layout: checklist

checklist_items:
- EHR audit logs reviewed for unusual patient access patterns
- Privileged account activity reviewed
- Failed login attempts review
- After-hours access review
- Mass export / print events review
- Remote access sessions review
- Firewall logs review for alerts
- DLP alerts reviewed
- MDM alerts reviewed
- Findings documented in audit log register
- Incidents created for any actionable finding

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Security Analyst â€” Printed Name (type=text, col=2)
- Security Analyst â€” Signature (type=signature, col=1)
- Security Analyst â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-019 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-DR-003

---

## SOURCE: Builder\Forns\IT-FM-020.txt

FORM ID: IT-FM-020
TITLE: Cloud Service Provider Security Questionnaire
TYPE: Assessment
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: shared_enterprise, high_risk

LINKED POLICIES:
- IT-DR-004
- IT-SA-004

PURPOSE:
Security questionnaire completed by cloud service providers (CSPs) handling ePHI, including SOC 2, HIPAA, encryption, and subcontractors.

INSTRUCTIONS:
Completed before vendor onboarding and refreshed annually.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Subject / Patient / Area Assessed (type=text, col=4)
- Assessment Date (type=date, col=2)
- Overall Risk Rating (type=select, col=2, options=[Low | Moderate | High])
- Findings Summary (type=textarea, col=4)
- Strengths Identified (type=textarea, col=4)
- Opportunities for Improvement (type=textarea, col=4)
- Recommended Action Plan (type=textarea, col=4)
- Follow-Up Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Vendor Contact â€” Printed Name (type=text, col=2)
- Vendor Contact â€” Signature (type=signature, col=1)
- Vendor Contact â€” Date (type=date, col=1)
- Care Indeed Security Officer â€” Printed Name (type=text, col=2)
- Care Indeed Security Officer â€” Signature (type=signature, col=1)
- Care Indeed Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-020 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-DR-004, IT-SA-004

---

## SOURCE: Builder\Forns\IT-FM-021.txt

FORM ID: IT-FM-021
TITLE: EHR Downtime Communication Protocol Checklist
TYPE: Checklist
DOMAIN: IT
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- IT-SA-001

PURPOSE:
Checklist for managing EHR downtime (planned or unplanned), including communication, paper workflows, and recovery reconciliation.

INSTRUCTIONS:
Followed whenever EHR is unavailable > 30 minutes. Post-downtime data reconciliation required.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” EHR Downtime Communication Protocol Checklist Checklist
layout: checklist

checklist_items:
- Downtime declared and logged
- All staff notified via agency communication channels
- Paper downtime forms activated for documentation
- Scheduling manual mode activated
- Priority patients identified and contacted
- Vendor / IT engaged for resolution
- Periodic status updates issued
- EHR recovery validated before return
- Paper data back-entered into EHR
- Post-downtime review and RCA completed

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- IT â€” Printed Name (type=text, col=2)
- IT â€” Signature (type=signature, col=1)
- IT â€” Date (type=date, col=1)
- Clinical Manager â€” Printed Name (type=text, col=2)
- Clinical Manager â€” Signature (type=signature, col=1)
- Clinical Manager â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-021 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SA-001

---

## SOURCE: Builder\Forns\IT-FM-022.txt

FORM ID: IT-FM-022
TITLE: EHR Access Audit Log
TYPE: Log
DOMAIN: IT
USAGE: Required
FREQUENCY: Quarterly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SA-001

PURPOSE:
Quarterly EHR access audit log review, with focus on high-risk access patterns (celebrity/VIP, employee as patient, mass exports).

INSTRUCTIONS:
Conducted by Privacy Officer + IT Security. Findings investigated and closed.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Audit Period
- Users Reviewed
- Records Accessed
- Flags
- Anomalies Investigated
- Findings
- Corrective Action
table_row_count: 10

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-022 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SA-001

---

## SOURCE: Builder\Forns\IT-FM-023.txt

FORM ID: IT-FM-023
TITLE: Server Room / MDF Physical Access Log
TYPE: Log
DOMAIN: IT
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- IT-SA-005

PURPOSE:
Log of physical access to server rooms, MDF/IDF closets, and other restricted IT spaces.

INSTRUCTIONS:
Maintained continuously. Reviewed monthly for unauthorized or after-hours access.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date/Time In
- Date/Time Out
- Name
- Role
- Purpose
- Escort
- Areas Accessed
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-023 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SA-005

---

## SOURCE: Builder\Forns\IT-FM-024.txt

FORM ID: IT-FM-024
TITLE: IT Media & Storage Device Destruction Certificate
TYPE: Attestation
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SA-005

PURPOSE:
Certificate of destruction/sanitization for any media containing ePHI, per NIST 800-88 and 45 CFR Â§ 164.310(d)(2)(i).

INSTRUCTIONS:
Signed for every sanitized asset. Retained for 6 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
By signing below, I hereby certify and attest that:

acknowledgments:
- I have read, reviewed, and understood the requirements of this form.
- The information I have provided is accurate, complete, and truthful to the best of my knowledge.
- I understand my obligation to report any changes in the information provided within 7 calendar days.
- I understand that false statements may result in corrective action up to and including termination.
- I agree to comply with all applicable Care Indeed policies, procedures, and regulatory requirements.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Sanitizer â€” Printed Name (type=text, col=2)
- Sanitizer â€” Signature (type=signature, col=1)
- Sanitizer â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-024 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SA-005

---

## SOURCE: Builder\Forns\IT-FM-025.txt

FORM ID: IT-FM-025
TITLE: Remote Device Wipe Authorization Form
TYPE: Form
DOMAIN: IT
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- IT-UP-001

PURPOSE:
Authorization to remotely wipe an agency-managed or BYOD device due to loss, theft, or separation.

INSTRUCTIONS:
Executed within 1 hour of qualifying event. Retained in asset record.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Device Owner / User (type=text, required=true, col=2)
- Device Type / Serial (type=text, col=2)
- Reason for Wipe (type=select, required=true, col=2, options=[Lost | Stolen | Termination | Compromise Suspected | Other])
- Date/Time Wiped (type=text, col=2)
- Wipe Confirmed (Method) (type=text, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)
- HR (if separation) â€” Printed Name (type=text, col=2)
- HR (if separation) â€” Signature (type=signature, col=1)
- HR (if separation) â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-025 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-UP-001

---

## SOURCE: Builder\Forns\IT-FM-026.txt

FORM ID: IT-FM-026
TITLE: Phishing Simulation Campaign Report
TYPE: Assessment
DOMAIN: IT
USAGE: Required
FREQUENCY: Quarterly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- IT-UP-004

PURPOSE:
Quarterly phishing simulation campaign report capturing click-through, reporting, and remediation training actions.

INSTRUCTIONS:
Results inform targeted security training.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Subject / Patient / Area Assessed (type=text, col=4)
- Assessment Date (type=date, col=2)
- Overall Risk Rating (type=select, col=2, options=[Low | Moderate | High])
- Findings Summary (type=textarea, col=4)
- Strengths Identified (type=textarea, col=4)
- Opportunities for Improvement (type=textarea, col=4)
- Recommended Action Plan (type=textarea, col=4)
- Follow-Up Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-026 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-UP-004

---

## SOURCE: Builder\Forns\IT-FM-027.txt

FORM ID: IT-FM-027
TITLE: Security Awareness Training Completion Roster
TYPE: Tracking Tool
DOMAIN: IT
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, shared_enterprise

LINKED POLICIES:
- IT-UP-004

PURPOSE:
Annual security-awareness training completion roster for all workforce per 45 CFR Â§ 164.308(a)(5).

INSTRUCTIONS:
Training within 60 days of hire and annually. Completion rate reported on Compliance Dashboard.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Employee Name
- Role
- Module
- Date
- Score
- Pass/Fail
- Next Due
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-027 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-UP-004

---

## SOURCE: Builder\Forns\IT-FM-028.txt

FORM ID: IT-FM-028
TITLE: IT Vendor Due Diligence Checklist
TYPE: Checklist
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- IT-SA-004
- CO-BA-101

PURPOSE:
Due-diligence checklist for any IT vendor with access to agency systems or data.

INSTRUCTIONS:
Completed before contracting and refreshed annually.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” IT Vendor Due Diligence Checklist Checklist
layout: checklist

checklist_items:
- BAA executed (if PHI involved)
- SOC 2 Type II report on file (< 12 months)
- Cybersecurity insurance evidence
- Incident history reviewed
- Subcontractor list reviewed
- Data residency confirmed
- Encryption standards confirmed
- Access control and MFA confirmed
- Breach notification terms acceptable
- Data return / destruction terms acceptable

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- IT Vendor Manager â€” Printed Name (type=text, col=2)
- IT Vendor Manager â€” Signature (type=signature, col=1)
- IT Vendor Manager â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-028 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SA-004, CO-BA-101

---

## SOURCE: Builder\Forns\IT-FM-029.txt

FORM ID: IT-FM-029
TITLE: Penetration Testing & Vulnerability Report
TYPE: Assessment
DOMAIN: IT
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SC-001
- IT-DR-003

PURPOSE:
Summary report of annual penetration test and vulnerability assessment, with findings and remediation.

INSTRUCTIONS:
Performed annually by qualified external firm. Critical findings remediated within 30 days.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Test Period (type=text, required=true, col=2)
- Testing Firm (type=text, col=2)
- Scope (Systems / Networks) (type=textarea, col=4)
- Methodology (type=textarea, col=4)
- # Critical Findings (type=number, col=1)
- # High Findings (type=number, col=1)
- # Medium Findings (type=number, col=1)
- # Low Findings (type=number, col=1)
- Summary of Major Findings (type=textarea, col=4)
- Remediation Plan (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-029 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-SC-001, IT-DR-003

---

## SOURCE: Builder\Forns\IT-FM-030.txt

FORM ID: IT-FM-030
TITLE: Cloud Data Sovereignty & Compliance Declaration
TYPE: Attestation
DOMAIN: IT
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, digital_candidate

LINKED POLICIES:
- IT-DR-004

PURPOSE:
Declaration by a cloud service provider of data sovereignty, residency, and regulatory compliance for data handled on behalf of Care Indeed.

INSTRUCTIONS:
Obtained at vendor onboarding and annually.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Attestation
layout: attestation

body:
The undersigned provider attests that:

acknowledgments:
- All Care Indeed data (including ePHI) is stored and processed within the United States, unless explicitly authorized.
- Data is encrypted at rest and in transit per HIPAA Security Rule standards.
- Subprocessors are disclosed, contractually bound, and within the same jurisdictional protections.
- Breach notification will be provided within contractually defined timeframes.
- Data will be securely returned or destroyed upon contract termination.

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- CSP Executive â€” Printed Name (type=text, col=2)
- CSP Executive â€” Signature (type=signature, col=1)
- CSP Executive â€” Date (type=date, col=1)
- Care Indeed Security Officer â€” Printed Name (type=text, col=2)
- Care Indeed Security Officer â€” Signature (type=signature, col=1)
- Care Indeed Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-030 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: IT-DR-004

---

## SOURCE: Builder\Forns\IT-FM-031.txt

FORM ID: IT-FM-031
TITLE: IT / Security Committee Meeting Minutes
TYPE: Template
DOMAIN: IT
USAGE: Required
FREQUENCY: Quarterly
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- IT-SP-001
- IT-SP-002
- CO-HP-004

PURPOSE:
Quarterly IT / Security Committee meeting minutes template capturing SRA progress, security incident metrics, access-review results, vendor/BAA tech controls, vulnerability management, DR/BC exercise status, and HIPAA Security Rule implementation oversight.

INSTRUCTIONS:
Prepared by Security Officer (or designee) within 5 business days of meeting. Approved at next IT/Security Committee meeting. Feeds Compliance Committee (CO-FM-024) and Governing Body (GV-FM-005). Archived per HIPAA Â§ 164.316(b) â€” minimum 6 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Meeting Date (type=date, required=true, col=2)
- Meeting Location / Platform (type=text, col=2)
- IT/Security Committee Chair (type=text, col=2)
- Members Present (Security Officer, Privacy Officer, CIO, Compliance, Clinical, Ops) (type=textarea, col=4)
- Members Absent (type=textarea, col=4)
- Quorum Confirmed? (Y/N) (type=select, col=2, options=[Yes | No])
- Approval of Prior Minutes (type=textarea, col=4)
- SRA / Risk Register Status (IT-FM-011) (type=textarea, col=4)
- Security Incidents (IT-FM-009) â€” quarter summary (type=textarea, col=4)
- Access Review Results (IT-FM-022) (type=textarea, col=4)
- Vulnerability / Patch Status (IT-FM-029) (type=textarea, col=4)
- Vendor / BAA Tech Controls (IT-FM-020, IT-FM-028, CO-FM-017) (type=textarea, col=4)
- DR/BC / Backup Test Results (IT-FM-008, IT-FM-018) (type=textarea, col=4)
- Training & Phishing Sim Results (IT-FM-026, IT-FM-027) (type=textarea, col=4)
- Change Advisory Board (CAB) Escalations (IT-FM-038) (type=textarea, col=4)
- Motions / Votes (type=textarea, col=4)
- Recommendations to Compliance Committee / Governing Body (type=textarea, col=4)
- Action Items (Owner / Due) (type=textarea, col=4)
- Adjournment Time (type=text, col=2)
- Next Meeting Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- IT/Security Committee Chair â€” Printed Name (type=text, col=2)
- IT/Security Committee Chair â€” Signature (type=signature, col=1)
- IT/Security Committee Chair â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)
- Privacy Officer â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)
- Recorder â€” Printed Name (type=text, col=2)
- Recorder â€” Signature (type=signature, col=1)
- Recorder â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-031 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-SP-001, IT-SP-002, CO-HP-004

---

## SOURCE: Builder\Forns\IT-FM-032.txt

FORM ID: IT-FM-032
TITLE: Post-Incident Corrective Action Plan (IT/Security)
TYPE: Plan
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SP-005
- CO-HP-004
- CO-CP-001

PURPOSE:
Structured corrective-action plan following a security incident, near-miss, or breach (IT-FM-009). Documents root cause, short- and long-term remediations, owners, milestones, verification, and closure. Supports HIPAA Â§ 164.308(a)(6) security incident procedures and Â§ 164.530 administrative safeguards.

INSTRUCTIONS:
Security Officer initiates within 72 hours of incident containment. Approved by CIO + Compliance Officer. Progress reported to IT/Security Committee (IT-FM-031) and Compliance Committee (CO-FM-024) monthly until closed. Closure requires independent verification.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- CAP ID (type=text, required=true, col=2)
- Incident ID (IT-FM-009) (type=text, required=true, col=2)
- Initiator (Security Officer) (type=text, required=true, col=2)
- Date Initiated (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Incident Summary
layout: grid

fields:
- Incident Date (type=date, col=2)
- Detection Date (type=date, col=2)
- Containment Date (type=date, col=2)
- Severity (type=select, col=2, options=[Low | Moderate | High | Critical])
- Systems / Data Affected (incl. PHI/ePHI?) (type=textarea, col=4)
- Root Cause (5-Why / RCA summary) (type=textarea, col=4)
- Breach Determination (Y/N/Pending) (type=select, col=2, options=[Yes | No | Pending])

SECTION 3: Section 3 â€” Corrective Actions
layout: grid

fields:
- Short-Term Actions (â‰¤ 30 days) â€” Description / Owner / Due (type=textarea, col=4)
- Long-Term Actions (> 30 days) â€” Description / Owner / Due (type=textarea, col=4)
- Control Changes (policy / procedure / technical) (type=textarea, col=4)
- Training / Awareness Actions (type=textarea, col=4)
- Third-Party / Vendor Actions (type=textarea, col=4)

SECTION 4: Section 4 â€” Verification & Closure
layout: grid

fields:
- Verification Method (re-test / audit / walkthrough / tabletop) (type=textarea, col=4)
- Verifier (independent of Owner) (type=text, col=2)
- Verification Date (type=date, col=2)
- Residual Risk Acceptable? (Y/N) (type=select, col=2, options=[Yes | No])
- Lessons Learned Captured in QAPI? (Y/N) (type=select, col=2, options=[Yes | No])
- Closure Date (type=date, col=2)

SECTION 5: Section â€” Signatures & Attestation
layout: signature

fields:
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)
- CIO â€” Printed Name (type=text, col=2)
- CIO â€” Signature (type=signature, col=1)
- CIO â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-032 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-SP-005, CO-HP-004, CO-CP-001

---

## SOURCE: Builder\Forns\IT-FM-033.txt

FORM ID: IT-FM-033
TITLE: Mobile Access Request & BYOD Agreement
TYPE: Agreement
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SP-003

PURPOSE:
Request, approval, and user agreement covering mobile / BYOD access to organizational resources including MDM/MAM enrollment, encryption, remote wipe consent, PHI handling, and acceptable use.

INSTRUCTIONS:
User submits; manager endorses; Security Officer approves; MDM enrollment completes before access. Reviewed annually.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- User Name (type=text, required=true, col=2)
- Employee ID (type=text, required=true, col=2)
- Role (type=text, col=2)
- Request Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Device & Controls
layout: grid

fields:
- Personal / Corporate Device (type=select, col=2, options=[Personal | Corporate])
- Device Type / Model (type=text, col=2)
- OS / Version (type=text, col=2)
- MDM/MAM Enrolled? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Encryption Enabled? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Remote Wipe Consent? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- PHI Access Granted? (Y/N) (type=select, col=2, options=[Yes | No])
- Access Scope (apps / email / VPN) (type=textarea, col=4)
- Annual Review Date (type=date, col=2)

SECTION 3: Section 3 â€” User Acknowledgments
layout: grid

fields:
- Acceptable Use Acknowledgment (type=textarea, col=4)
- Security Incident Reporting Commitment (type=textarea, col=4)
- HIPAA PHI Handling Acknowledgment (type=textarea, col=4)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- User â€” Printed Name (type=text, col=2)
- User â€” Signature (type=signature, col=1)
- User â€” Date (type=date, col=1)
- Manager â€” Printed Name (type=text, col=2)
- Manager â€” Signature (type=signature, col=1)
- Manager â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-033 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-SP-003

---

## SOURCE: Builder\Forns\IT-FM-034.txt

FORM ID: IT-FM-034
TITLE: Removable Media Exception & Tracking
TYPE: Form
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SP-003

PURPOSE:
Controls authorized use of removable media (USB, external drives, SD cards) where general policy prohibits. Tracks encryption, chain-of-custody, PHI content, and return/sanitization.

INSTRUCTIONS:
Security Officer reviews exception request; devices provisioned encrypted; post-use sanitization per IT-FM-036.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Requestor (type=text, required=true, col=2)
- Role (type=text, col=2)
- Exception Request ID (type=text, required=true, col=2)
- Request Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Exception Detail
layout: grid

fields:
- Business Justification (type=textarea, col=4)
- Media Type / Serial # (type=text, col=2)
- Encryption Method (FIPS 140-2) (type=text, col=2)
- PHI/ePHI Included? (Y/N) (type=select, col=2, options=[Yes | No])
- Destination / Recipient (type=text, col=2)
- Use Start Date (type=date, col=2)
- Use End Date (type=date, col=2)
- Post-Use Plan (sanitize / destroy / return) (type=select, col=2, options=[Sanitize | Destroy | Return])

SECTION 3: Section 3 â€” Approval & Closure
layout: grid

fields:
- Security Officer Approval (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- CIO / Privacy Officer Approval (if PHI) (Y/N) (type=select, col=2, options=[Yes | No | NA])
- Chain-of-Custody Log (type=textarea, col=4)
- Post-Use Sanitization Record (IT-FM-036) (type=text, col=2)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Requestor â€” Printed Name (type=text, col=2)
- Requestor â€” Signature (type=signature, col=1)
- Requestor â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-034 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-SP-003

---

## SOURCE: Builder\Forns\IT-FM-035.txt

FORM ID: IT-FM-035
TITLE: Vulnerability Scan Report
TYPE: Report
DOMAIN: IT
USAGE: Required
FREQUENCY: Weekly
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SP-002

PURPOSE:
Periodic vulnerability scan report (external weekly, internal monthly) summarizing findings by severity (Critical / High / Medium / Low), affected assets, CVE references, and remediation SLAs aligned with IT-FM-029 Vulnerability Management & Patch Compliance Log.

INSTRUCTIONS:
Security Officer (or designee) produces; reviewed at IT/Security Committee (IT-FM-031); HIGH/CRITICAL escalated per SLA.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Scan ID (type=text, required=true, col=2)
- Scan Tool / Vendor (type=text, col=2)
- Scan Scope (external / internal / authenticated / targeted) (type=select, col=2, options=[External | Internal | Authenticated | Targeted])
- Scan Date (type=date, required=true, col=2)
- Report Owner (type=text, col=2)

SECTION 2: Section 2 â€” Findings Summary
layout: grid

fields:
- # Critical (type=text, col=2)
- # High (type=text, col=2)
- # Medium (type=text, col=2)
- # Low (type=text, col=2)
- New vs Recurring (type=textarea, col=4)
- Top Affected Assets (type=textarea, col=4)
- CVE Highlights (type=textarea, col=4)
- Remediation SLAs Applied (type=textarea, col=4)
- Exceptions Requested (IT-FM-036 Patch Exception) (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-035 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-SP-002

---

## SOURCE: Builder\Forns\IT-FM-036.txt

FORM ID: IT-FM-036
TITLE: Device Sanitization & Patch Exception Record (NIST 800-88)
TYPE: Record
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SP-002
- IT-SP-003
- CO-HP-004

PURPOSE:
Dual-use record: (a) documents NIST 800-88 compliant sanitization / destruction of media (Clear, Purge, Destroy) prior to disposal, reuse, or return; (b) documents approved patch exceptions with compensating controls and expiration.

INSTRUCTIONS:
Security Officer approves. Section A completed for sanitization events; Section B for patch exceptions. Retained minimum 6 years (HIPAA Â§ 164.316(b)).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Record ID (type=text, required=true, col=2)
- Record Type (Sanitization / Patch Exception) (type=select, required=true, col=2, options=[Sanitization | Patch Exception])
- Owner (IT / Security Officer) (type=text, col=2)
- Date (type=date, required=true, col=2)

SECTION 2: Section A â€” Sanitization (if applicable)
layout: grid

fields:
- Media Type (HDD / SSD / tape / USB / phone / paper) (type=select, col=2, options=[HDD | SSD | Tape | USB | Mobile | Paper | Other])
- Serial # / Asset Tag (type=text, col=2)
- Data Classification (PHI / PII / Confidential / Public) (type=select, col=2, options=[PHI | PII | Confidential | Public])
- Sanitization Method (Clear / Purge / Destroy) (type=select, col=2, options=[Clear | Purge | Destroy])
- Technique (overwrite / cryptographic erase / degauss / shred) (type=select, col=2, options=[Overwrite | Cryptographic Erase | Degauss | Shred | Incinerate | Vendor Certified])
- Vendor / Operator (type=text, col=2)
- Certificate of Destruction # (type=text, col=2)
- Witness (type=text, col=2)

SECTION 3: Section B â€” Patch Exception (if applicable)
layout: grid

fields:
- Vulnerability / Patch ID (type=text, col=2)
- Affected Asset(s) (type=textarea, col=4)
- Reason for Exception (vendor dependency / business continuity / etc.) (type=textarea, col=4)
- Compensating Controls (type=textarea, col=4)
- Risk Accepted By (type=text, col=2)
- Exception Expiration Date (type=date, col=2)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- IT / Operator â€” Printed Name (type=text, col=2)
- IT â€” Signature (type=signature, col=1)
- IT â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-036 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-SP-002, IT-SP-003, CO-HP-004

---

## SOURCE: Builder\Forns\IT-FM-037.txt

FORM ID: IT-FM-037
TITLE: Change Request Form
TYPE: Form
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-CM-001

PURPOSE:
Standardized change request capturing scope, risk, impact, rollback plan, security review (PHI impact), affected systems, test evidence, and schedule. Feeds CAB (IT-FM-038).

INSTRUCTIONS:
Requestor submits; Security Officer reviews for HIPAA/PHI impact; CAB approves normal changes; Standard changes pre-approved catalog.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Change # (CR) (type=text, required=true, col=2)
- Requestor (type=text, required=true, col=2)
- Category (Standard / Normal / Emergency) (type=select, required=true, col=2, options=[Standard | Normal | Emergency])
- Submission Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Change Detail
layout: grid

fields:
- Title / Description (type=textarea, col=4)
- Affected Systems / Services (type=textarea, col=4)
- Business Justification (type=textarea, col=4)
- Risk Level (Low / Medium / High) (type=select, col=2, options=[Low | Medium | High])
- PHI / ePHI Impact Assessed? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- HIPAA Security Rule Impact (type=textarea, col=4)
- Planned Implementation Window (type=text, col=2)
- Downtime Expected? (Y/N) (type=select, col=2, options=[Yes | No])
- Test Evidence (type=textarea, col=4)
- Rollback Plan (type=textarea, col=4)
- Communication Plan (type=textarea, col=4)

SECTION 3: Section 3 â€” Review & Approval
layout: grid

fields:
- Security Officer Review Result (type=textarea, col=4)
- CAB Decision (approved / rejected / deferred) (type=select, col=2, options=[Approved | Rejected | Deferred])
- CAB Minutes Reference (IT-FM-038) (type=text, col=2)
- Implementation Date (type=date, col=2)
- Post-Implementation Review Ref (IT-FM-039) (type=text, col=2)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Requestor â€” Printed Name (type=text, col=2)
- Requestor â€” Signature (type=signature, col=1)
- Requestor â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)
- CAB Chair â€” Printed Name (type=text, col=2)
- CAB Chair â€” Signature (type=signature, col=1)
- CAB Chair â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-037 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-CM-001

---

## SOURCE: Builder\Forns\IT-FM-038.txt

FORM ID: IT-FM-038
TITLE: Change Advisory Board (CAB) Meeting Minutes
TYPE: Template
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- IT-CM-001
- IT-SP-001

PURPOSE:
Change Advisory Board (CAB) meeting minutes template capturing review, risk-assessment, and approval/rejection of all in-scope IT changes (EHR, network, clinical systems, cloud services, integrations). Supports HIPAA Â§ 164.312 and ITIL Change Management.

INSTRUCTIONS:
Prepared by CAB Secretary (or designee) within 2 business days of CAB meeting. Links each change request (IT-FM-010 System Change Management Request) to approval/rejection decision. Archived per HIPAA Â§ 164.316(b) â€” minimum 6 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Meeting Date (type=date, required=true, col=2)
- Meeting Location / Platform (type=text, col=2)
- CAB Chair (type=text, col=2)
- Members Present (Security Officer, IT Lead, Clinical Rep, Ops Rep, Compliance) (type=textarea, col=4)
- Members Absent (type=textarea, col=4)
- Quorum Confirmed? (Y/N) (type=select, col=2, options=[Yes | No])
- Standard Changes Reviewed (pre-approved) (type=textarea, col=4)
- Normal Changes Reviewed (CMR # / title / risk / approval) (type=textarea, col=4)
- Emergency Changes Ratified (type=textarea, col=4)
- Rejected / Deferred Changes (with rationale) (type=textarea, col=4)
- Post-Implementation Review Issues (type=textarea, col=4)
- HIPAA Security Rule Impact Assessed? (Y/N) (type=select, col=2, options=[Yes | No])
- PHI Data-Flow Change Assessed? (Y/N) (type=select, col=2, options=[Yes | No])
- Motions / Votes (with dissents) (type=textarea, col=4)
- Action Items (Owner / Due) (type=textarea, col=4)
- Adjournment Time (type=text, col=2)
- Next CAB Meeting Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- CAB Chair â€” Printed Name (type=text, col=2)
- CAB Chair â€” Signature (type=signature, col=1)
- CAB Chair â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)
- Recorder â€” Printed Name (type=text, col=2)
- Recorder â€” Signature (type=signature, col=1)
- Recorder â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-038 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-CM-001, IT-SP-001

---

## SOURCE: Builder\Forns\IT-FM-039.txt

FORM ID: IT-FM-039
TITLE: Post-Implementation Review (Change)
TYPE: Review
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-CM-001

PURPOSE:
Captures the outcome of a deployed change within 5 business days: success / partial / rolled-back, incidents generated, user/clinical impact, KPI effect, and lessons learned.

INSTRUCTIONS:
Change owner files within 5 business days. Reviewed at CAB; recurring themes fed to QAPI.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Change # (CR) (type=text, required=true, col=2)
- Change Owner (type=text, required=true, col=2)
- Implementation Date (type=date, required=true, col=2)
- PIR Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Outcome
layout: grid

fields:
- Outcome (Success / Partial / Rolled Back) (type=select, required=true, col=2, options=[Success | Partial | Rolled Back])
- Incidents Generated (# / IDs) (type=textarea, col=4)
- User / Clinical Impact (type=textarea, col=4)
- KPI Effect (type=textarea, col=4)
- Lessons Learned (type=textarea, col=4)
- Corrective Actions (if any) (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Change Owner â€” Printed Name (type=text, col=2)
- Change Owner â€” Signature (type=signature, col=1)
- Change Owner â€” Date (type=date, col=1)
- CAB Chair â€” Printed Name (type=text, col=2)
- CAB Chair â€” Signature (type=signature, col=1)
- CAB Chair â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-039 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-CM-001

---

## SOURCE: Builder\Forns\IT-FM-040.txt

FORM ID: IT-FM-040
TITLE: Vendor Security Assessment Questionnaire
TYPE: Questionnaire
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SP-004
- CO-HP-004

PURPOSE:
Pre-contract security due-diligence questionnaire for vendors with access to PHI, critical systems, or sensitive data. Covers governance, HIPAA Security Rule controls, SOC 2 / HITRUST / ISO, breach history, subcontractor management, and business continuity.

INSTRUCTIONS:
Completed by vendor; Security Officer reviews; findings feed to BAA (CO-FM-017) and vendor attestation (IT-FM-041).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Vendor Name (type=text, required=true, col=2)
- Vendor Contact (type=text, col=2)
- Service / System (type=text, col=2)
- Data Access (PHI / PII / Credentials / Other) (type=select, col=2, options=[PHI | PII | Credentials | Other])
- Assessment Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Control Domains
layout: grid

fields:
- Governance & Risk Program (type=textarea, col=4)
- HIPAA Security Rule Implementation Status (type=textarea, col=4)
- Certifications (SOC 2 / HITRUST / ISO 27001) (type=textarea, col=4)
- Last Pen Test / Vulnerability Scan (type=textarea, col=4)
- Encryption (at rest / in transit) (type=textarea, col=4)
- Access Management / MFA (type=textarea, col=4)
- Incident Response Program / Breach History (type=textarea, col=4)
- Subcontractor Management (type=textarea, col=4)
- Business Continuity / DR / RTO-RPO (type=textarea, col=4)
- Insurance (Cyber / E&O) (type=textarea, col=4)
- Data Residency / Cloud Sovereignty (type=textarea, col=4)

SECTION 3: Section 3 â€” Reviewer Finding
layout: grid

fields:
- Overall Rating (Pass / Conditional / Fail) (type=select, required=true, col=2, options=[Pass | Conditional | Fail])
- Remediation Requirements (type=textarea, col=4)
- Re-Assessment Due Date (type=date, col=2)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Vendor Representative â€” Printed Name (type=text, col=2)
- Vendor â€” Signature (type=signature, col=1)
- Vendor â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-040 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-SP-004, CO-HP-004

---

## SOURCE: Builder\Forns\IT-FM-041.txt

FORM ID: IT-FM-041
TITLE: Vendor Attestation Review (SOC 2 / HITRUST / ISO / Pen Test)
TYPE: Review
DOMAIN: IT
USAGE: Required
FREQUENCY: Annual
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SP-004
- CO-HP-004

PURPOSE:
Security Officer's documented review of vendor third-party attestations (SOC 2 Type II, HITRUST r2, ISO 27001, pen-test reports) including user-control-considerations (UCC) acceptance and exception tracking.

INSTRUCTIONS:
Annual cadence or per vendor engagement. Exceptions â†’ remediation tracked via IT-FM-029 or BAA addendum.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Vendor (type=text, required=true, col=2)
- Attestation Type (SOC 2 Type II / HITRUST / ISO 27001 / Pen Test / Other) (type=select, col=2, options=[SOC 2 Type II | HITRUST | ISO 27001 | Pen Test | Other])
- Report Period (type=text, col=2)
- Review Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Review
layout: grid

fields:
- Auditor / Firm (type=text, col=2)
- Scope Coverage Adequate? (Y/N) (type=select, col=2, options=[Yes | No])
- Exceptions / Qualifications Noted (type=textarea, col=4)
- UCC / Complementary User Controls (accepted and implemented?) (type=textarea, col=4)
- Remediation Plan (type=textarea, col=4)
- Next Report Due (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-041 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-SP-004, CO-HP-004

---

## SOURCE: Builder\Forns\IT-FM-042.txt

FORM ID: IT-FM-042
TITLE: Email Security Configuration Register (Anti-Phishing / DMARC / DLP / Encryption)
TYPE: Register
DOMAIN: IT
USAGE: Required
FREQUENCY: Continuous
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SP-002
- CO-HP-004

PURPOSE:
Configuration register documenting anti-phishing posture (SPF, DKIM, DMARC), DLP rules, encryption rules for PHI (e.g., automatic TLS, portal), sandboxing, malware/AV, and banner-warning policies for the email platform.

INSTRUCTIONS:
Security Officer maintains; reviewed quarterly; changes routed via IT-FM-037. Configuration evidence exported at each review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Platform (M365 / Google Workspace / Other) (type=text, required=true, col=2)
- Tenant / Domain (type=text, col=2)
- Review Period (type=text, required=true, col=2)
- Review Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Configuration
layout: grid

fields:
- SPF Policy Status (type=text, col=2)
- DKIM Status (type=text, col=2)
- DMARC Policy (none / quarantine / reject) (type=select, col=2, options=[none | quarantine | reject])
- TLS Enforcement (inbound / outbound) (type=textarea, col=4)
- PHI DLP Rules (type=textarea, col=4)
- Credential DLP Rules (type=textarea, col=4)
- Anti-Phishing / ATP Policies (type=textarea, col=4)
- Sandbox / Attachment Detonation (type=textarea, col=4)
- External-Sender Banner? (Y/N) (type=select, col=2, options=[Yes | No])
- Auto-Forward Externally Blocked? (Y/N) (type=select, col=2, options=[Yes | No])
- Portal / Secure Mail for PHI (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-042 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-SP-002, CO-HP-004

---

## SOURCE: Builder\Forns\IT-FM-043.txt

FORM ID: IT-FM-043
TITLE: Phishing Simulation Report
TYPE: Report
DOMAIN: IT
USAGE: Required
FREQUENCY: Quarterly
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SP-002

PURPOSE:
Quarterly phishing simulation report â€” sent volume, click rate, credential-entry rate, report rate, training assignment for failures, and trend over quarters.

INSTRUCTIONS:
IT SecOps runs; HR coordinates training for repeat clickers; trend reported to IT/Security Committee (IT-FM-031).

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Simulation ID (type=text, required=true, col=2)
- Platform / Vendor (type=text, col=2)
- Campaign Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Metrics
layout: grid

fields:
- Total Sent (type=text, col=2)
- Clicked (# / %) (type=text, col=2)
- Credential-Entered (# / %) (type=text, col=2)
- Reported (# / %) (type=text, col=2)
- Target Population (type=textarea, col=4)
- Repeat Clickers (type=textarea, col=4)
- Remediation Training Assigned (type=textarea, col=4)
- Quarter-over-Quarter Trend (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-043 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-SP-002

---

## SOURCE: Builder\Forns\IT-FM-044.txt

FORM ID: IT-FM-044
TITLE: Paper PHI Shredding Log
TYPE: Log
DOMAIN: IT
USAGE: Required
FREQUENCY: Continuous
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-HP-004
- EN-CM-001

PURPOSE:
Continuous log tracking paper PHI destruction events â€” cross-cut shredding or certified vendor (Iron Mountain, Shred-it) including date, volume (bins / pounds), certificate #, witness, and retention-policy basis.

INSTRUCTIONS:
Office Administrator maintains. Each destruction cycle accompanied by EN-FM-031 Records Destruction Authorization. Retain log 10 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Location (office / clinic) (type=text, required=true, col=2)
- Custodian (Office Admin) (type=text, required=true, col=2)
- Reporting Year (type=text, required=true, col=2)

SECTION 2: Section 2 â€” Destruction Events
layout: grid

fields:
- Event Date (type=date, col=2)
- Method (internal shredder / certified vendor) (type=select, col=2, options=[Internal Shredder | Certified Vendor])
- Vendor Name (if applicable) (type=text, col=2)
- Volume (bins / lbs) (type=text, col=2)
- Certificate of Destruction # (type=text, col=2)
- Witness (type=text, col=2)
- EN-FM-031 Reference (type=text, col=2)
- Records Series / Retention Basis (CO-FM-020) (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Custodian â€” Printed Name (type=text, col=2)
- Custodian â€” Signature (type=signature, col=1)
- Custodian â€” Date (type=date, col=1)
- Privacy Officer (periodic review) â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-044 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: CO-HP-004, EN-CM-001

---

## SOURCE: Builder\Forns\IT-FM-045.txt

FORM ID: IT-FM-045
TITLE: Badge Assignment & Facility Access Log
TYPE: Log
DOMAIN: IT
USAGE: Required
FREQUENCY: Continuous
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SP-001
- CO-HP-004

PURPOSE:
Physical-access control log for badge assignment, zone authorization (general / clinical / server / records), issuance, return, deactivation, and quarterly review. Supports HIPAA Â§ 164.310(a).

INSTRUCTIONS:
Facilities maintains. Quarterly review by Facilities + Security Officer. Deactivation within 1 business day of separation.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Badge Custodian (type=text, required=true, col=2)
- Review Period (type=text, col=2)

SECTION 2: Section 2 â€” Assignments
layout: grid

fields:
- Badge # (type=text, col=2)
- Name (type=text, col=2)
- Role (type=text, col=2)
- Zones Authorized (general / clinical / server / records / other) (type=textarea, col=4)
- Issue Date (type=date, col=2)
- Return / Deactivation Date (type=date, col=2)
- Reason (separation / lost / replacement) (type=text, col=2)

SECTION 3: Section 3 â€” Quarterly Review
layout: grid

fields:
- Review Date (type=date, col=2)
- Anomalies Identified (type=textarea, col=4)
- Remediation (type=textarea, col=4)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Facilities â€” Printed Name (type=text, col=2)
- Facilities â€” Signature (type=signature, col=1)
- Facilities â€” Date (type=date, col=1)
- Security Officer â€” Printed Name (type=text, col=2)
- Security Officer â€” Signature (type=signature, col=1)
- Security Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-045 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-SP-001, CO-HP-004

---

## SOURCE: Builder\Forns\IT-FM-046.txt

FORM ID: IT-FM-046
TITLE: Visitor Log
TYPE: Log
DOMAIN: IT
USAGE: Required
FREQUENCY: Continuous
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- IT-SP-001
- CO-HP-004

PURPOSE:
Continuous log of visitors, contractors, surveyors, and vendors on-site. Required for HIPAA Â§ 164.310 physical safeguards and survey preparedness. Captures sign-in, escort, purpose, and sign-out.

INSTRUCTIONS:
Reception maintains in paper or electronic log. Each entry escorted where PHI areas are involved. Retain 6 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Site / Location (type=text, required=true, col=2)
- Log Period (type=text, required=true, col=2)

SECTION 2: Section 2 â€” Entries
layout: grid

fields:
- Date (type=date, col=2)
- Arrival Time (type=text, col=2)
- Visitor Name (type=text, col=2)
- Company / Affiliation (type=text, col=2)
- Purpose of Visit (type=textarea, col=4)
- Host / Escort (type=text, col=2)
- Badge # Issued (type=text, col=2)
- Departure Time (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Reception / Custodian â€” Printed Name (type=text, col=2)
- Custodian â€” Signature (type=signature, col=1)
- Custodian â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-046 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: IT-SP-001, CO-HP-004

---

## SOURCE: Builder\Forns\IT-FM-047.txt

FORM ID: IT-FM-047
TITLE: Data Subject Request Intake (HIPAA / CMIA / CCPA / CPRA)
TYPE: Form
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-HP-001
- CO-HP-002

PURPOSE:
Intake of individual-rights requests (access, amendment, accounting of disclosures, restriction, confidential communications, right-to-know, deletion, opt-out, correction) under HIPAA, CMIA, CCPA/CPRA, and other applicable privacy laws.

INSTRUCTIONS:
Privacy Officer receives; identity verified within 3 business days; routed to applicable legal framework; response per statutory deadlines.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Request ID (type=text, required=true, col=2)
- Requestor Name (type=text, required=true, col=2)
- Relationship (self / personal representative / legal guardian) (type=select, col=2, options=[Self | Personal Rep | Legal Guardian | Other])
- Contact Info (type=text, col=2)
- Date Received (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Request Detail
layout: grid

fields:
- Request Type (access / amendment / accounting / restriction / confidential comms / right-to-know / deletion / opt-out / correction / other) (type=select, required=true, col=2, options=[Access | Amendment | Accounting of Disclosures | Restriction | Confidential Communications | Right-to-Know | Deletion | Opt-Out | Correction | Other])
- Applicable Framework (HIPAA / CMIA / CCPA/CPRA / Other) (type=select, col=2, options=[HIPAA | CMIA | CCPA/CPRA | Other])
- Data Scope (type=textarea, col=4)
- Format Requested (paper / electronic / portable) (type=select, col=2, options=[Paper | Electronic | Portable])
- Identity Verification Method (type=textarea, col=4)
- Identity Verified? (Y/N) (type=select, required=true, col=2, options=[Yes | No])
- Statutory Response Due Date (type=date, col=2)

SECTION 3: Section 3 â€” Routing & Fulfillment
layout: grid

fields:
- Routed To (type=text, col=2)
- Extract Request Ref (IT-FM-048) (type=text, col=2)
- Response Issued (type=date, col=2)
- Fulfillment Method (type=text, col=2)
- Fees Charged (if applicable) (type=text, col=2)
- Denial / Partial (rationale) (type=textarea, col=4)

SECTION 4: Section â€” Signatures & Attestation
layout: signature

fields:
- Privacy Officer â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-047 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- CONFIDENTIAL
- Linked Policies: CO-HP-001, CO-HP-002

---

## SOURCE: Builder\Forns\IT-FM-048.txt

FORM ID: IT-FM-048
TITLE: Data Extract Log
TYPE: Log
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-HP-001
- IT-SP-001

PURPOSE:
Records each data extract performed to fulfill a subject-rights request (IT-FM-047), litigation hold (EN-FM-030), regulatory request, or business need â€” capturing source system, date-range, format, volume, transfer method, encryption, and delivery evidence.

INSTRUCTIONS:
IT performs extract; Privacy Officer verifies scope; transfer via secure method (encrypted portal, SFTP). Retained 6 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Extract ID (type=text, required=true, col=2)
- Triggering Request / Matter (type=text, col=2)
- Owner (IT) (type=text, col=2)
- Date of Extract (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Extract Detail
layout: grid

fields:
- Source System(s) (type=textarea, col=4)
- Data Category (PHI / PII / Financial / Other) (type=select, col=2, options=[PHI | PII | Financial | Other])
- Date Range Covered (type=text, col=2)
- Record Count / Size (type=text, col=2)
- Format (PDF / CSV / HL7 / FHIR / DICOM / Other) (type=select, col=2, options=[PDF | CSV | HL7 | FHIR | DICOM | Other])
- Transfer Method (Portal / SFTP / Encrypted USB / Other) (type=select, col=2, options=[Portal | SFTP | Encrypted USB | Other])
- Encryption Used (algo / standard) (type=text, col=2)
- Recipient (type=text, col=2)
- Delivery Confirmation (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- IT â€” Printed Name (type=text, col=2)
- IT â€” Signature (type=signature, col=1)
- IT â€” Date (type=date, col=1)
- Privacy Officer â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-048 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: CO-HP-001, IT-SP-001

---

## SOURCE: Builder\Forns\IT-FM-049.txt

FORM ID: IT-FM-049
TITLE: CCPA / CPRA Response Letter
TYPE: Letter
DOMAIN: IT
USAGE: Required
FREQUENCY: Triggered
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- CO-HP-002

PURPOSE:
Formal response letter for CCPA/CPRA right-to-know, deletion, opt-out, and correction requests. Includes statutory findings, categories of data, sources, sharing, retention, and appeal / Attorney General referral rights.

INSTRUCTIONS:
Privacy Officer issues within 45 days of verified request (one 45-day extension permitted with notice). Retains per CCPA minimum 24 months.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Request ID (link to IT-FM-047) (type=text, required=true, col=2)
- Consumer Name (type=text, required=true, col=2)
- Letter Date (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Response Content
layout: grid

fields:
- Request Type (right-to-know / deletion / opt-out / correction) (type=select, required=true, col=2, options=[Right-to-Know | Deletion | Opt-Out | Correction])
- Categories of PI Collected (past 12 mo) (type=textarea, col=4)
- Sources of Collection (type=textarea, col=4)
- Business / Commercial Purposes (type=textarea, col=4)
- Categories of Third Parties Shared (type=textarea, col=4)
- Categories Sold / Shared (type=textarea, col=4)
- Retention Periods (type=textarea, col=4)
- Action Taken (provide / delete / opt-out confirmed / denial) (type=select, col=2, options=[Provide | Delete | Opt-Out Confirmed | Denial | Partial])
- Denial Rationale (if any) (type=textarea, col=4)
- Right to Appeal / Submit Complaint (AG / CPPA) (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Privacy Officer â€” Printed Name (type=text, col=2)
- Privacy Officer â€” Signature (type=signature, col=1)
- Privacy Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form IT-FM-049 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: CO-HP-002

---

## SOURCE: Builder\Forns\OP-FM-001.txt

FORM ID: OP-FM-001
TITLE: Branch Registration Tracker
TYPE: Tracking Tool
DOMAIN: OP
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-FM-002
- GV-EA-004

PURPOSE:
Tracker documenting every branch office registration and change with CDPH / CMS / local authorities.

INSTRUCTIONS:
Updated within 5 business days of any change. Reviewed quarterly.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Branch Name
- Address
- CDPH License #
- CCN
- Registered Date
- Status
- Owner
table_row_count: 10

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-001 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-002, GV-EA-004

---

## SOURCE: Builder\Forns\OP-FM-002.txt

FORM ID: OP-FM-002
TITLE: Quarterly Facility Inspection Report
TYPE: Assessment
DOMAIN: OP
USAGE: Required
FREQUENCY: Quarterly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- OP-FM-002
- RM-PS-001

PURPOSE:
Quarterly inspection report documenting physical-facility condition and safety status at each branch.

INSTRUCTIONS:
Performed by Facilities Manager. Deficiencies resolved; documented in log.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Subject / Patient / Area Assessed (type=text, col=4)
- Assessment Date (type=date, col=2)
- Overall Risk Rating (type=select, col=2, options=[Low | Moderate | High])
- Findings Summary (type=textarea, col=4)
- Strengths Identified (type=textarea, col=4)
- Opportunities for Improvement (type=textarea, col=4)
- Recommended Action Plan (type=textarea, col=4)
- Follow-Up Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Inspector â€” Printed Name (type=text, col=2)
- Inspector â€” Signature (type=signature, col=1)
- Inspector â€” Date (type=date, col=1)
- Branch Manager â€” Printed Name (type=text, col=2)
- Branch Manager â€” Signature (type=signature, col=1)
- Branch Manager â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-002 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-002, RM-PS-001

---

## SOURCE: Builder\Forns\OP-FM-003.txt

FORM ID: OP-FM-003
TITLE: Vendor Request Form
TYPE: Form
DOMAIN: OP
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- OP-FM-003
- FN-FP-006

PURPOSE:
Request to initiate vendor relationship with approvals required before any contracting.

INSTRUCTIONS:
Submitted by sponsor. Reviewed by Procurement, Legal, Compliance, and Security.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Vendor Legal Name (type=text, required=true, col=4)
- Services / Products Proposed (type=textarea, required=true, col=4)
- Estimated Annual Spend (type=text, col=2)
- PHI Access Expected (Y/N) (type=select, col=2, options=[Yes | No])
- Alternatives Considered (type=textarea, col=4)
- Business Sponsor (type=text, col=2)
- Target Start Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Sponsor â€” Printed Name (type=text, col=2)
- Sponsor â€” Signature (type=signature, col=1)
- Sponsor â€” Date (type=date, col=1)
- Procurement â€” Printed Name (type=text, col=2)
- Procurement â€” Signature (type=signature, col=1)
- Procurement â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-003 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-003, FN-FP-006

---

## SOURCE: Builder\Forns\OP-FM-004.txt

FORM ID: OP-FM-004
TITLE: Vendor Qualification Checklist
TYPE: Checklist
DOMAIN: OP
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- OP-FM-003
- CO-FA-001

PURPOSE:
Qualification checklist ensuring each prospective vendor passes regulatory, financial, and operational reviews before contracting.

INSTRUCTIONS:
Performed prior to every new vendor contract and renewal.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Vendor Qualification Checklist Checklist
layout: checklist

checklist_items:
- Legal entity and licensure verified
- Tax ID (W-9) on file
- OIG / SAM / state exclusion clear
- Certificate of insurance current
- References verified
- Financial stability acceptable
- Prior performance / incidents reviewed
- BAA executed (if PHI)
- Security assessment (if applicable)
- Pricing competitive

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Procurement â€” Printed Name (type=text, col=2)
- Procurement â€” Signature (type=signature, col=1)
- Procurement â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-004 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-003, CO-FA-001

---

## SOURCE: Builder\Forns\OP-FM-005.txt

FORM ID: OP-FM-005
TITLE: Approved Vendor List
TYPE: Tracking Tool
DOMAIN: OP
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- OP-FM-003

PURPOSE:
Approved Vendor List â€” master roster of vendors authorized for agency use with contract dates and category.

INSTRUCTIONS:
Maintained by Procurement. Expired vendors removed; renewal triggers new OP-FM-003/004.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Vendor
- Category
- Contract Start
- Contract End
- PHI Access
- Status
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-005 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-003

---

## SOURCE: Builder\Forns\OP-FM-006.txt

FORM ID: OP-FM-006
TITLE: Vendor Performance Issue Log
TYPE: Log
DOMAIN: OP
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-FM-003
- QA-AE-001

PURPOSE:
Log of vendor performance issues (SLA breach, quality, billing disputes, security events) for trend analysis.

INSTRUCTIONS:
Updated as issues occur. Reviewed quarterly.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date
- Vendor
- Issue Category
- Description
- Severity
- Action Taken
- Closed
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-006 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-003, QA-AE-001

---

## SOURCE: Builder\Forns\OP-FM-007.txt

FORM ID: OP-FM-007
TITLE: Vendor Performance Evaluation Form
TYPE: Assessment
DOMAIN: OP
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-FM-003
- QA-PI-001

PURPOSE:
Annual vendor performance evaluation measuring quality, reliability, responsiveness, cost, and compliance.

INSTRUCTIONS:
Completed annually for vendors with > $10K annual spend. Informs renewal decisions.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Vendor Name (type=text, required=true, col=2)
- Evaluation Year (type=text, col=2)
- Quality (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Reliability (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Responsiveness (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Cost / Value (1-5) (type=select, col=1, options=[1 | 2 | 3 | 4 | 5])
- Compliance Posture (1-5) (type=select, col=2, options=[1 | 2 | 3 | 4 | 5])
- Comments (type=textarea, col=4)
- Renewal Recommendation (type=select, col=4, options=[Renew | Renew with Conditions | Do Not Renew])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Evaluator â€” Printed Name (type=text, col=2)
- Evaluator â€” Signature (type=signature, col=1)
- Evaluator â€” Date (type=date, col=1)
- Procurement â€” Printed Name (type=text, col=2)
- Procurement â€” Signature (type=signature, col=1)
- Procurement â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-007 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-003, QA-PI-001

---

## SOURCE: Builder\Forns\OP-FM-008.txt

FORM ID: OP-FM-008
TITLE: Vendor Corrective Action Notice
TYPE: Form
DOMAIN: OP
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-FM-003
- GV-EA-001

PURPOSE:
Written notice to a vendor identifying performance deficiencies and requiring corrective action.

INSTRUCTIONS:
Issued following significant or repeated performance issues. Response required within 10 business days.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Vendor Name / Contact (type=text, required=true, col=4)
- Notice Date (type=date, required=true, col=2)
- Contract / SOW # (type=text, col=2)
- Deficiency Description (type=textarea, required=true, col=4)
- Required Corrective Action (type=textarea, required=true, col=4)
- Deadline for Response (type=date, col=2)
- Consequences if Not Addressed (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Procurement â€” Printed Name (type=text, col=2)
- Procurement â€” Signature (type=signature, col=1)
- Procurement â€” Date (type=date, col=1)
- Sponsor â€” Printed Name (type=text, col=2)
- Sponsor â€” Signature (type=signature, col=1)
- Sponsor â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-008 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-003, GV-EA-001

---

## SOURCE: Builder\Forns\OP-FM-009.txt

FORM ID: OP-FM-009
TITLE: Emergency Procurement Authorization
TYPE: Form
DOMAIN: OP
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- OP-FM-003
- RM-EP-001
- FN-FP-006

PURPOSE:
Emergency procurement authorization for time-critical purchases outside normal procurement channels.

INSTRUCTIONS:
Used only when delay would harm patient care or safety. Post-event review within 5 business days.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Requester (type=text, required=true, col=2)
- Date / Time of Need (type=text, required=true, col=2)
- Items / Services Needed (type=textarea, required=true, col=4)
- Emergency Justification (type=textarea, required=true, col=4)
- Proposed Vendor (type=text, col=2)
- Estimated Cost (type=text, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Requester â€” Printed Name (type=text, col=2)
- Requester â€” Signature (type=signature, col=1)
- Requester â€” Date (type=date, col=1)
- Administrator / Designee â€” Printed Name (type=text, col=2)
- Administrator / Designee â€” Signature (type=signature, col=1)
- Administrator / Designee â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-009 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-003, RM-EP-001, FN-FP-006

---

## SOURCE: Builder\Forns\OP-FM-010.txt

FORM ID: OP-FM-010
TITLE: Incoming Mail Log
TYPE: Log
DOMAIN: OP
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-FM-004

PURPOSE:
Daily log of incoming mail, couriers, and deliveries at each branch.

INSTRUCTIONS:
Maintained at reception. Time-sensitive items escalated immediately.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date
- Sender
- Recipient
- Item Description
- Category
- Time-Sensitive (Y/N)
- Signed By
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-010 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-004

---

## SOURCE: Builder\Forns\OP-FM-011.txt

FORM ID: OP-FM-011
TITLE: Time-Sensitive Tracking Log
TYPE: Log
DOMAIN: OP
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-FM-004
- FN-BC-002
- CL-CP-009

PURPOSE:
Log of all time-sensitive items requiring action within a set timeframe (regulatory, claims, patient communications).

INSTRUCTIONS:
Updated as items arrive. Escalation triggers at 25%, 50%, and 75% of deadline.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Receipt Date
- Item
- Category
- Deadline
- Owner
- Action Taken
- Completed Date
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-011 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-004, FN-BC-002, CL-CP-009

---

## SOURCE: Builder\Forns\OP-FM-012.txt

FORM ID: OP-FM-012
TITLE: Outgoing Mail Log
TYPE: Log
DOMAIN: OP
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-FM-004

PURPOSE:
Log of all outgoing mail and couriers, for tracking and audit of time-sensitive outbound items.

INSTRUCTIONS:
Maintained at reception. Certified-mail receipts archived.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date
- Sender
- Recipient
- Item
- Mode (USPS/UPS/FedEx/Courier)
- Tracking #
- Certified (Y/N)
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-012 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-004

---

## SOURCE: Builder\Forns\OP-FM-013.txt

FORM ID: OP-FM-013
TITLE: Standard Fax Cover Sheet
TYPE: Template
DOMAIN: OP
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: master_template, shared_enterprise

LINKED POLICIES:
- OP-FM-004
- CL-CP-003

PURPOSE:
Standardized fax cover sheet with HIPAA confidentiality notice and routing details.

INSTRUCTIONS:
Used for every outbound fax. Wrong-number events reported per breach protocol.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- To (Name / Organization) (type=text, required=true, col=2)
- Fax Number (type=tel, required=true, col=2)
- From (Name / Dept) (type=text, required=true, col=2)
- Phone (type=tel, col=2)
- Date / Time (type=text, col=2)
- # Pages (incl. cover) (type=number, col=2)
- Subject (type=text, col=4)
- Notes (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Sender â€” Printed Name (type=text, col=2)
- Sender â€” Signature (type=signature, col=1)
- Sender â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-013 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-004, CL-CP-003

---

## SOURCE: Builder\Forns\OP-FM-014.txt

FORM ID: OP-FM-014
TITLE: Patient Intake Information Sheet
TYPE: Form
DOMAIN: OP
USAGE: Required
FREQUENCY: Per Episode
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: digital_candidate

LINKED POLICIES:
- OP-IM-001

PURPOSE:
Intake information sheet capturing referral, demographics, insurance, physician, and initial clinical information at referral.

INSTRUCTIONS:
Completed by Intake at referral receipt. Triggers insurance verification, scheduling, and SOC assignment.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Patient Full Name (type=text, required=true, col=2)
- DOB / Age (type=text, required=true, col=2)
- Address / Phone (type=textarea, col=4)
- Primary Language (type=text, col=2)
- Interpreter Needed? (type=select, col=2, options=[No | Yes])
- Referral Source (type=text, col=2)
- Referring Physician / NPI (type=text, col=2)
- Primary Diagnosis (type=text, col=2)
- Services Requested (type=textarea, col=4)
- Primary Payer (type=text, col=2)
- Medicare # (type=text, col=2)
- Medicaid # (type=text, col=2)
- Secondary Payer (type=text, col=2)
- Homebound Rationale Provided? (Y/N) (type=select, col=2, options=[Yes | No])

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Intake Coordinator â€” Printed Name (type=text, col=2)
- Intake Coordinator â€” Signature (type=signature, col=1)
- Intake Coordinator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-014 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-IM-001

---

## SOURCE: Builder\Forns\OP-FM-015.txt

FORM ID: OP-FM-015
TITLE: Non-Admit / Referral Rejection Log
TYPE: Log
DOMAIN: OP
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-IM-002

PURPOSE:
Log of all referrals not admitted, with reason, alternatives offered, and trend analysis.

INSTRUCTIONS:
Reviewed monthly by Admissions Committee to identify patterns and capacity.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date
- Referral Source
- Patient (Initials)
- Reason Not Admitted
- Alternative Referral
- Owner
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-015 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-IM-002

---

## SOURCE: Builder\Forns\OP-FM-016.txt

FORM ID: OP-FM-016
TITLE: Vehicle Mileage & Safety Inspection Log
TYPE: Log
DOMAIN: OP
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-SL-003

PURPOSE:
Vehicle mileage and safety inspection log for all agency-owned/leased vehicles used for visits.

INSTRUCTIONS:
Completed monthly by assigned drivers.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Vehicle ID
- Period
- Starting Mileage
- Ending Mileage
- Inspection Date
- Tires OK
- Lights OK
- Brakes OK
- Fluids OK
- Issues
- Driver
table_row_count: 12

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-016 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-SL-003

---

## SOURCE: Builder\Forns\OP-FM-017.txt

FORM ID: OP-FM-017
TITLE: Patient Property & Belongings Inventory
TYPE: Checklist
DOMAIN: OP
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-PA-005

PURPOSE:
Inventory of patient property/belongings brought to agency possession (DME, supplies, documents).

INSTRUCTIONS:
Completed when agency takes temporary possession. Returned with signature.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Patient Property & Belongings Inventory Checklist
layout: checklist

checklist_items:
- Patient Property & Belongings Inventory â€” Regulatory requirement reviewed and understood
- Patient Property & Belongings Inventory â€” Applicable policy section located and re-read
- Patient Property & Belongings Inventory â€” Required documentation identified and accessible
- Patient Property & Belongings Inventory â€” All data fields confirmed complete and accurate
- Patient Property & Belongings Inventory â€” Signatures / attestations obtained from required parties
- Patient Property & Belongings Inventory â€” Copy filed in the appropriate record per retention schedule
- Patient Property & Belongings Inventory â€” Completion entered in tracking log / dashboard
- Patient Property & Belongings Inventory â€” Any deficiencies escalated to supervisor / Compliance Officer
- Patient Property & Belongings Inventory â€” Corrective action documented and tracked to closure
- Patient Property & Belongings Inventory â€” Annual review date set and added to calendar

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-017 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-PA-005

---

## SOURCE: Builder\Forns\OP-FM-018.txt

FORM ID: OP-FM-018
TITLE: Interpreter Service Utilization Log
TYPE: Log
DOMAIN: OP
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-PA-003

PURPOSE:
Interpreter service utilization log tracking LEP patient encounters requiring interpretation per Title VI and Â§ 1557.

INSTRUCTIONS:
Maintained per encounter. Reviewed monthly for access and cost.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date
- Patient MRN
- Language
- Modality (In-Person / Phone / Video)
- Vendor
- Duration
- Clinician
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-018 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-PA-003

---

## SOURCE: Builder\Forns\OP-FM-019.txt

FORM ID: OP-FM-019
TITLE: Scheduling Conflict & Resolution Log
TYPE: Log
DOMAIN: OP
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-SL-001

PURPOSE:
Log of scheduling conflicts and resolutions (missed visits, double-bookings, staff unavailability).

INSTRUCTIONS:
Updated daily. Repeat patterns drive scheduling process improvements.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date
- Conflict Type
- Patient / Episode
- Original Clinician
- Resolution
- Impact
- Prevention
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-019 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-SL-001

---

## SOURCE: Builder\Forns\OP-FM-020.txt

FORM ID: OP-FM-020
TITLE: After-Hours On-Call Activity Log
TYPE: Log
DOMAIN: OP
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- OP-SL-002

PURPOSE:
Log of after-hours on-call clinical activity documenting calls, interventions, and hand-off to primary care team.

INSTRUCTIONS:
Maintained nightly. Reviewed by Clinical Manager each morning.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date/Time
- On-Call Clinician
- Patient MRN
- Reason for Call
- Action Taken
- Outcome
- Hand-Off
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form OP-FM-020 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-SL-002

---

## SOURCE: Builder\Forns\QA-FM-001.txt

FORM ID: QA-FM-001
TITLE: QAPI Committee Meeting Minutes Template
TYPE: Template
DOMAIN: QA
USAGE: Required
FREQUENCY: Quarterly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- QA-PG-003

PURPOSE:
Quarterly QAPI Committee meeting minutes template per 42 CFR Â§ 484.65(b), documenting data review, improvement projects, and board reporting.

INSTRUCTIONS:
Minutes finalized within 5 business days. Aggregate report provided to Governing Body.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Meeting Date (type=date, required=true, col=2)
- Chair (type=text, col=2)
- Attendees (type=textarea, col=4)
- Data Reviewed (Outcomes, Incidents, HHCAHPS) (type=textarea, col=4)
- Active PIPs Status (type=textarea, col=4)
- New PIPs Chartered (type=textarea, col=4)
- Adverse Events / Sentinel Review (type=textarea, col=4)
- Decisions / Motions (type=textarea, col=4)
- Action Items (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- QAPI Chair â€” Printed Name (type=text, col=2)
- QAPI Chair â€” Signature (type=signature, col=1)
- QAPI Chair â€” Date (type=date, col=1)
- Recorder â€” Printed Name (type=text, col=2)
- Recorder â€” Signature (type=signature, col=1)
- Recorder â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-001 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-PG-003

---

## SOURCE: Builder\Forns\QA-FM-002.txt

FORM ID: QA-FM-002
TITLE: Performance Improvement Project (PIP) Charter
TYPE: Template
DOMAIN: QA
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- QA-PI-001

PURPOSE:
Charter for a Performance Improvement Project defining problem statement, aim, team, measures, timeline, and sponsor per QAPI requirements.

INSTRUCTIONS:
Developed at PIP initiation. Approved by QAPI Committee. Progress reported at each meeting.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- PIP Title (type=text, required=true, col=4)
- Sponsor (type=text, col=2)
- Team Lead (type=text, col=2)
- Team Members (type=textarea, col=4)
- Problem Statement (type=textarea, required=true, col=4)
- Aim Statement (SMART) (type=textarea, required=true, col=4)
- Measures (Outcome / Process / Balancing) (type=textarea, col=4)
- Target Improvement (type=text, col=2)
- Timeline / Milestones (type=textarea, col=4)
- Resources Required (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Team Lead â€” Printed Name (type=text, col=2)
- Team Lead â€” Signature (type=signature, col=1)
- Team Lead â€” Date (type=date, col=1)
- Sponsor â€” Printed Name (type=text, col=2)
- Sponsor â€” Signature (type=signature, col=1)
- Sponsor â€” Date (type=date, col=1)
- QAPI Chair â€” Printed Name (type=text, col=2)
- QAPI Chair â€” Signature (type=signature, col=1)
- QAPI Chair â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-002 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-PI-001

---

## SOURCE: Builder\Forns\QA-FM-003.txt

FORM ID: QA-FM-003
TITLE: Quality Indicator Monthly Dashboard
TYPE: Tracking Tool
DOMAIN: QA
USAGE: Required
FREQUENCY: Monthly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- QA-PI-002

PURPOSE:
Monthly dashboard of quality indicators (acute-care hospitalization, emergency department use, functional improvement, HHCAHPS, star ratings, infection rates).

INSTRUCTIONS:
Compiled by QAPI Data Analyst. Reviewed at QAPI Committee and key operational meetings.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- KPI
- Target
- Current
- Prior Month
- YTD
- Benchmark
- Trend
- Owner
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-003 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-PI-002

---

## SOURCE: Builder\Forns\QA-FM-004.txt

FORM ID: QA-FM-004
TITLE: Adverse Event Root Cause Analysis (RCA) Worksheet
TYPE: Worksheet
DOMAIN: QA
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, high_risk

LINKED POLICIES:
- QA-AE-002

PURPOSE:
Root Cause Analysis (RCA) worksheet used to examine adverse events, sentinel events, and near misses using a structured framework.

INSTRUCTIONS:
Initiated within 5 business days of event. Completed within 30 days. Chaired by QAPI; action items tracked to closure.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Event ID / Description (type=textarea, required=true, col=4)
- Event Date (type=date, col=2)
- RCA Team Members (type=textarea, col=4)
- Timeline of Events (type=textarea, col=4)
- 5 Whys Analysis (type=textarea, col=4)
- Contributing Factors (People, Process, Equipment, Environment) (type=textarea, col=4)
- Root Cause(s) Identified (type=textarea, required=true, col=4)
- Corrective / Preventive Actions (type=textarea, required=true, col=4)
- Responsible Parties / Timeline (type=textarea, col=4)
- Effectiveness Measurement Plan (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- RCA Facilitator â€” Printed Name (type=text, col=2)
- RCA Facilitator â€” Signature (type=signature, col=1)
- RCA Facilitator â€” Date (type=date, col=1)
- QAPI Chair â€” Printed Name (type=text, col=2)
- QAPI Chair â€” Signature (type=signature, col=1)
- QAPI Chair â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-004 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-AE-002

---

## SOURCE: Builder\Forns\QA-FM-005.txt

FORM ID: QA-FM-005
TITLE: Corrective Action Plan (CAP) Tracking Tool
TYPE: Tracking Tool
DOMAIN: QA
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- QA-AE-003

PURPOSE:
Tracking tool for all Corrective Action Plans (CAPs) from any source (surveys, audits, PIPs, RCAs) to ensure closure.

INSTRUCTIONS:
Updated weekly. Open CAPs > 30 days past due escalated. Effectiveness verified after closure.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- CAP ID
- Source
- Action Description
- Owner
- Due Date
- Status
- Effectiveness Check
- Closed Date
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-005 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-AE-003

---

## SOURCE: Builder\Forns\QA-FM-006.txt

FORM ID: QA-FM-006
TITLE: Infection Control Line List & Surveillance Log
TYPE: Log
DOMAIN: QA
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- QA-SM-002
- CL-SD-016

PURPOSE:
Infection surveillance log tracking all patient infections, outbreaks, and exposures per 42 CFR Â§ 484.70.

INSTRUCTIONS:
Updated as cases identified. Reviewed weekly; trend reports monthly at QAPI.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date
- Patient MRN
- Infection Type
- Pathogen (if known)
- Source Suspected
- Symptoms
- Treatment
- Outbreak Related (Y/N)
- Reportable (Y/N)
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-006 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-SM-002, CL-SD-016

---

## SOURCE: Builder\Forns\QA-FM-007.txt

FORM ID: QA-FM-007
TITLE: LUPA Prevention & Visit Utilization Log
TYPE: Log
DOMAIN: QA
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- QA-PI-006
- FN-CM-005

PURPOSE:
Log tracking episodes at risk of Low Utilization Payment Adjustment (LUPA) per PDGM thresholds, with mitigation interventions.

INSTRUCTIONS:
Updated daily. Trigger interventions: re-visit scheduling, care-coordination calls, clinical review.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Episode / MRN
- Day of Episode
- Visits Rendered
- LUPA Threshold
- Gap
- Intervention
- Owner
- Outcome
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-007 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-PI-006, FN-CM-005

---

## SOURCE: Builder\Forns\QA-FM-008.txt

FORM ID: QA-FM-008
TITLE: Patient Satisfaction Survey (HHCAHPS) Proxy
TYPE: Assessment
DOMAIN: QA
USAGE: Optional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- QA-SM-003

PURPOSE:
Patient satisfaction survey (HHCAHPS proxy) capturing feedback on clinician professionalism, communication, care quality, and overall rating.

INSTRUCTIONS:
Offered to patients upon discharge via mail, phone, or electronic. Aggregate results reported quarterly.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Patient ID (anonymized) (type=text, col=2)
- Survey Date (type=date, col=2)
- Overall Rating (0-10) (type=number, col=2)
- Recommend Agency (1-4) (type=select, col=2, options=[1 Definitely No | 2 Probably No | 3 Probably Yes | 4 Definitely Yes])
- Clinician Communication Rating (type=select, col=2, options=[Poor | Fair | Good | Very Good | Excellent])
- Care Coordination Rating (type=select, col=2, options=[Poor | Fair | Good | Very Good | Excellent])
- Timeliness of Care (type=select, col=2, options=[Poor | Fair | Good | Very Good | Excellent])
- Respect / Dignity (type=select, col=2, options=[Poor | Fair | Good | Very Good | Excellent])
- Pain Management (type=select, col=2, options=[Poor | Fair | Good | Very Good | Excellent | N/A])
- Comments (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-008 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-SM-003

---

## SOURCE: Builder\Forns\QA-FM-009.txt

FORM ID: QA-FM-009
TITLE: Star Rating Improvement Action Plan
TYPE: Template
DOMAIN: QA
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- QA-SM-004

PURPOSE:
Action plan to improve CMS Home Health Star Rating, addressing specific measure deficiencies with tactics, timeline, and expected impact.

INSTRUCTIONS:
Developed quarterly based on public star ratings. Executed by clinical operations with QAPI oversight.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Current Star Rating (type=text, col=2)
- Target Star Rating (type=text, col=2)
- Measures Below Benchmark (type=textarea, col=4)
- Tactics for Improvement (type=textarea, col=4)
- Owner / Timeline (type=textarea, col=4)
- Expected Impact / Measurement (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- QAPI Chair â€” Printed Name (type=text, col=2)
- QAPI Chair â€” Signature (type=signature, col=1)
- QAPI Chair â€” Date (type=date, col=1)
- Clinical Manager â€” Printed Name (type=text, col=2)
- Clinical Manager â€” Signature (type=signature, col=1)
- Clinical Manager â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-009 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-SM-004

---

## SOURCE: Builder\Forns\QA-FM-010.txt

FORM ID: QA-FM-010
TITLE: QAPI Self-Assessment Annual Checklist
TYPE: Checklist
DOMAIN: QA
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- QA-PG-002

PURPOSE:
Annual self-assessment of the QAPI program against 42 CFR Â§ 484.65 elements (design/scope, data, performance improvement, governance, and QAPI activities).

INSTRUCTIONS:
Performed by QAPI Chair. Findings drive next-year QAPI plan.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” QAPI Self-Assessment Annual Checklist Checklist
layout: checklist

checklist_items:
- QAPI program is ongoing, data-driven, and agency-wide
- Quality indicators aligned with high-volume, high-risk, problem-prone areas
- Performance improvement activities address high-priority concerns
- PIPs are chartered, measured, and effective
- Data collection systems are valid and reliable
- Adverse events reviewed via RCA within 30 days
- QAPI activities reported to Governing Body quarterly
- Governing Body approves QAPI plan annually
- QAPI activities are documented and evidence is retained
- Staff trained on QAPI principles and their role

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- QAPI Chair â€” Printed Name (type=text, col=2)
- QAPI Chair â€” Signature (type=signature, col=1)
- QAPI Chair â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-010 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-PG-002

---

## SOURCE: Builder\Forns\QA-FM-011.txt

FORM ID: QA-FM-011
TITLE: Outcome Benchmarking Comparison Report
TYPE: Assessment
DOMAIN: QA
USAGE: Required
FREQUENCY: Quarterly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- QA-PI-003
- QA-SM-004

PURPOSE:
Quarterly outcome benchmarking comparison report against CMS national benchmarks, CASPER reports, and peer agencies.

INSTRUCTIONS:
Prepared by QAPI Data Analyst. Published to leadership and QAPI Committee.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Subject / Patient / Area Assessed (type=text, col=4)
- Assessment Date (type=date, col=2)
- Overall Risk Rating (type=select, col=2, options=[Low | Moderate | High])
- Findings Summary (type=textarea, col=4)
- Strengths Identified (type=textarea, col=4)
- Opportunities for Improvement (type=textarea, col=4)
- Recommended Action Plan (type=textarea, col=4)
- Follow-Up Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-011 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-PI-003, QA-SM-004

---

## SOURCE: Builder\Forns\QA-FM-012.txt

FORM ID: QA-FM-012
TITLE: Policy Effectiveness Monitoring Worksheet
TYPE: Worksheet
DOMAIN: QA
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- QA-SM-005

PURPOSE:
Worksheet measuring policy effectiveness through KPI review, staff compliance audit, and outcome linkage.

INSTRUCTIONS:
Performed annually per policy. Policies with ineffective outcomes are revised or retired.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Policy ID / Title (type=text, required=true, col=4)
- Measurement Period (type=text, col=2)
- Intended Outcome (type=textarea, col=4)
- Measurement Method (type=textarea, col=4)
- Compliance Rate (%) (type=text, col=2)
- Outcome Trend (type=textarea, col=4)
- Effectiveness Conclusion (type=select, col=2, options=[Effective | Partially Effective | Not Effective])
- Recommended Policy Changes (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Policy Owner â€” Printed Name (type=text, col=2)
- Policy Owner â€” Signature (type=signature, col=1)
- Policy Owner â€” Date (type=date, col=1)
- QAPI Chair â€” Printed Name (type=text, col=2)
- QAPI Chair â€” Signature (type=signature, col=1)
- QAPI Chair â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-012 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-SM-005

---

## SOURCE: Builder\Forns\QA-FM-013.txt

FORM ID: QA-FM-013
TITLE: Patient Safety Event Communication Log
TYPE: Log
DOMAIN: QA
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: high_risk, audit_critical

LINKED POLICIES:
- QA-AE-001
- QA-AE-004

PURPOSE:
Log of internal communications and notifications related to patient-safety events (sentinel, near-miss, adverse).

INSTRUCTIONS:
Updated at each event. Reviewed by QAPI Committee for learning and trend analysis.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date
- Event Type
- Patient MRN
- Notification Sent To
- Channel
- Response / Acknowledgment
- Follow-Up
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form QA-FM-013 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: QA-AE-001, QA-AE-004

---

## SOURCE: Builder\Forns\RM-FM-001.txt

FORM ID: RM-FM-001
TITLE: Hazard Vulnerability Analysis (HVA) Worksheet
TYPE: Worksheet
DOMAIN: RM
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical, shared_enterprise

LINKED POLICIES:
- OP-FM-005
- RM-EP-001
- RM-EP-002

PURPOSE:
Annual Hazard Vulnerability Analysis (HVA) per 42 CFR Â§ 484.102, identifying and scoring natural, human, and technological hazards with mitigation priorities.

INSTRUCTIONS:
Updated annually and after any event that reveals new vulnerability. Feeds the Emergency Preparedness plan.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Worksheet
layout: grid

fields:
- Situation / Scope (type=textarea, col=4)
- Data / Evidence Reviewed (type=textarea, col=4)
- Analysis (type=textarea, col=4)
- Findings (type=textarea, col=4)
- Recommendations (type=textarea, col=4)
- Next Steps / Owner / Due Date (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-001 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-005, RM-EP-001, RM-EP-002

---

## SOURCE: Builder\Forns\RM-FM-002.txt

FORM ID: RM-FM-002
TITLE: EMT Emergency Contact Card
TYPE: Reference
DOMAIN: RM
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: none

LINKED POLICIES:
- OP-FM-005
- HR-TD-005

PURPOSE:
Emergency contact card for EMT and first responders entering the home with a Care Indeed patient.

INSTRUCTIONS:
Left in the home at SOC. Updated at significant change. Contains critical information to guide emergency response.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Reference Content
layout: grid

fields:
- Patient Name (type=text, required=true, col=4)
- DOB / Age (type=text, col=2)
- Address (type=text, col=4)
- Allergies (type=text, col=4)
- Medications (high-alert) (type=textarea, col=4)
- Primary Dx (type=text, col=4)
- Advance Directive / DNR? (type=select, col=2, options=[Full Code | DNR | POLST])
- Preferred Hospital (type=text, col=2)
- Primary Physician (type=text, col=2)
- Emergency Contact / Next of Kin (type=text, col=2)
- Agency 24/7 Number (type=tel, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-002 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-005, HR-TD-005

---

## SOURCE: Builder\Forns\RM-FM-003.txt

FORM ID: RM-FM-003
TITLE: Emergency Quick Reference Guide
TYPE: Reference
DOMAIN: RM
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: shared_enterprise

LINKED POLICIES:
- OP-FM-005
- CL-PR-005

PURPOSE:
Quick-reference emergency guide distributed to all workforce and left in all patient homes.

INSTRUCTIONS:
Updated annually and with each EP plan revision.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Reference Content
layout: grid

fields:
- Reference Title (type=text, col=4)
- Version / Date (type=text, col=2)
- Owner (type=text, col=2)
- Reference Body (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-003 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-005, CL-PR-005

---

## SOURCE: Builder\Forns\RM-FM-004.txt

FORM ID: RM-FM-004
TITLE: EP Exercise Documentation Form
TYPE: Assessment
DOMAIN: RM
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- OP-FM-005
- RM-EP-002

PURPOSE:
Documentation of emergency preparedness exercise (tabletop, functional, full-scale) per 42 CFR Â§ 484.102.

INSTRUCTIONS:
Minimum one exercise per year. Findings feed plan updates.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Exercise Date (type=date, required=true, col=2)
- Exercise Type (type=select, col=2, options=[Tabletop | Functional | Full-Scale | Community])
- Scenario (type=textarea, col=4)
- Participants (type=textarea, col=4)
- Objectives / Capabilities Tested (type=textarea, col=4)
- Observations (type=textarea, col=4)
- Identified Gaps (type=textarea, col=4)
- Improvements Planned (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Facilitator â€” Printed Name (type=text, col=2)
- Facilitator â€” Signature (type=signature, col=1)
- Facilitator â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-004 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-005, RM-EP-002

---

## SOURCE: Builder\Forns\RM-FM-005.txt

FORM ID: RM-FM-005
TITLE: After-Action Review (AAR) Form
TYPE: Assessment
DOMAIN: RM
USAGE: Required
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- OP-FM-005
- RM-EP-002
- QA-AE-002

PURPOSE:
After-Action Review (AAR) of an actual incident or activation of the EP plan, capturing lessons learned.

INSTRUCTIONS:
Completed within 5 business days of event.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Event / Incident (type=text, required=true, col=4)
- Event Date (type=date, col=2)
- AAR Facilitator (type=text, col=2)
- Summary of Event (type=textarea, col=4)
- What Went Well (type=textarea, col=4)
- What Did Not Go Well (type=textarea, col=4)
- Why â€” Root Causes (type=textarea, col=4)
- Corrective / Preventive Actions (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Facilitator â€” Printed Name (type=text, col=2)
- Facilitator â€” Signature (type=signature, col=1)
- Facilitator â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-005 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: OP-FM-005, RM-EP-002, QA-AE-002

---

## SOURCE: Builder\Forns\RM-FM-006.txt

FORM ID: RM-FM-006
TITLE: Pandemic Plan Readiness Checklist
TYPE: Checklist
DOMAIN: RM
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk, audit_critical

LINKED POLICIES:
- RM-EP-001

PURPOSE:
Annual pandemic-readiness checklist verifying stockpile, protocols, and staff preparedness for infectious-disease outbreaks.

INSTRUCTIONS:
Executed annually; verified at each Infection Control Committee meeting.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Pandemic Plan Readiness Checklist Checklist
layout: checklist

checklist_items:
- N95 / PPE stockpile sufficient for 90 days
- Hand-hygiene supplies stocked across branches
- Triage scripts / fever screening available
- Isolation and cohorting protocol current
- Visitor restriction protocol ready
- Telehealth capability tested
- Surge staffing plan current
- Community partners identified
- Communication templates (staff, patients, MDs, media) prepared
- Exercise conducted in past 12 months

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Infection Preventionist â€” Printed Name (type=text, col=2)
- Infection Preventionist â€” Signature (type=signature, col=1)
- Infection Preventionist â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-006 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: RM-EP-001

---

## SOURCE: Builder\Forns\RM-FM-007.txt

FORM ID: RM-FM-007
TITLE: Patient Priority Classification Matrix
TYPE: Matrix
DOMAIN: RM
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: shared_enterprise, audit_critical

LINKED POLICIES:
- RM-EP-001

PURPOSE:
Priority classification matrix ranking active patients by acuity / criticality for continuity-of-care during emergency.

INSTRUCTIONS:
Updated monthly. Used during EP activation to target outreach and resource allocation.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Matrix
layout: table

table_columns:
- Patient MRN
- Name (initials)
- Priority (Red/Yellow/Green)
- Rationale
- Dependencies (O2, IV, etc.)
- Alternate Plan
- Primary Clinician
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-007 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: RM-EP-001

---

## SOURCE: Builder\Forns\RM-FM-008.txt

FORM ID: RM-FM-008
TITLE: Enterprise Risk Register
TYPE: Tracking Tool
DOMAIN: RM
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- RM-ER-001

PURPOSE:
Enterprise Risk Register capturing identified strategic, operational, clinical, financial, regulatory, and cyber risks.

INSTRUCTIONS:
Updated quarterly by the Risk Management Committee; reviewed annually by the Governing Body.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Risk ID
- Category
- Description
- Inherent Likelihood
- Inherent Impact
- Controls
- Residual Likelihood
- Residual Impact
- Owner
- Status
table_row_count: 20

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-008 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: RM-ER-001

---

## SOURCE: Builder\Forns\RM-FM-009.txt

FORM ID: RM-FM-009
TITLE: Workplace Violence Incident Report
TYPE: Form
DOMAIN: RM
USAGE: Conditional
FREQUENCY: Triggered
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- RM-SS-002

PURPOSE:
Workplace violence incident report documenting threats, assaults, or verbal aggression encountered by staff.

INSTRUCTIONS:
Filed within 24 hours. Feeds safety program (SB 553 in California) and HR-FM-023.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Data Capture
layout: grid

fields:
- Reporter Name / Role (type=text, required=true, col=2)
- Date / Time (type=text, required=true, col=2)
- Location (type=text, col=2)
- Incident Type (type=select, required=true, col=2, options=[Verbal Aggression | Threat | Physical Assault | Sexual | Property Damage | Other])
- Aggressor (Patient / Family / Stranger) (type=text, col=2)
- Injury Sustained? (Y/N) (type=select, col=2, options=[Yes | No])
- Narrative (type=textarea, required=true, col=4)
- Immediate Safety Action (type=textarea, col=4)
- Law-Enforcement Notified? (Y/N) (type=select, col=2, options=[Yes | No])
- Support Offered (EAP, time off) (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Reporter â€” Printed Name (type=text, col=2)
- Reporter â€” Signature (type=signature, col=1)
- Reporter â€” Date (type=date, col=1)
- Supervisor â€” Printed Name (type=text, col=2)
- Supervisor â€” Signature (type=signature, col=1)
- Supervisor â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-009 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: RM-SS-002

---

## SOURCE: Builder\Forns\RM-FM-010.txt

FORM ID: RM-FM-010
TITLE: Hazardous Materials (SDS) Inventory
TYPE: Log
DOMAIN: RM
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- RM-PS-002

PURPOSE:
Hazardous materials (Safety Data Sheet) inventory for each branch and field location, per OSHA Hazard Communication Standard.

INSTRUCTIONS:
Maintained by Safety Officer. SDS accessible to all workforce within 10 seconds.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Product Name
- Manufacturer
- Location
- SDS Date
- Quantity
- Storage
- Disposal Method
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-010 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: RM-PS-002

---

## SOURCE: Builder\Forns\RM-FM-011.txt

FORM ID: RM-FM-011
TITLE: Equipment Safety Recall Log
TYPE: Log
DOMAIN: RM
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: none

LINKED POLICIES:
- RM-PS-003

PURPOSE:
Log of equipment safety recalls (FDA, MAUDE, vendor) and agency response.

INSTRUCTIONS:
Updated when recall received. Impacted equipment quarantined and replaced.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Recall Date
- Equipment / Device
- Source
- Severity
- Units Affected
- Action Taken
- Closed
table_row_count: 12

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-011 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: RM-PS-003

---

## SOURCE: Builder\Forns\RM-FM-012.txt

FORM ID: RM-FM-012
TITLE: High-Risk Medication Double-Check Log
TYPE: Log
DOMAIN: RM
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- RM-PS-005

PURPOSE:
Independent double-check log for high-alert medication administration (insulin, anticoagulants, opioids).

INSTRUCTIONS:
Required at every high-alert medication administration. Both clinicians sign.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Date/Time
- Patient MRN
- Medication / Dose
- Verified By RN 1
- Verified By RN 2
- Double-Check Passed (Y/N)
- Notes
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-012 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: RM-PS-005

---

## SOURCE: Builder\Forns\RM-FM-013.txt

FORM ID: RM-FM-013
TITLE: Cal/OSHA IIPP Hazard Identification Checklist
TYPE: Checklist
DOMAIN: RM
USAGE: Required
FREQUENCY: Quarterly
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- RM-OS-101

PURPOSE:
Cal/OSHA Injury & Illness Prevention Program (IIPP) hazard identification checklist per 8 CCR Â§ 3203.

INSTRUCTIONS:
Conducted quarterly and after any reported incident. Hazards corrected and documented.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Cal/OSHA IIPP Hazard Identification Checklist Checklist
layout: checklist

checklist_items:
- Workplace lighting adequate
- Walking/working surfaces free of trip hazards
- Electrical cords and outlets safe
- PPE available and used
- Ergonomic workstation setup
- Biohazard containers present and managed
- Sharps handling safe
- Vehicle safety supplies present
- Emergency exits unobstructed
- Fire / smoke / CO detectors operating
- First-aid kits stocked
- SDS accessible

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Safety Officer â€” Printed Name (type=text, col=2)
- Safety Officer â€” Signature (type=signature, col=1)
- Safety Officer â€” Date (type=date, col=1)
- Branch Manager â€” Printed Name (type=text, col=2)
- Branch Manager â€” Signature (type=signature, col=1)
- Branch Manager â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-013 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: RM-OS-101

---

## SOURCE: Builder\Forns\RM-FM-014.txt

FORM ID: RM-FM-014
TITLE: Cal/OSHA Hazard Correction Record
TYPE: Log
DOMAIN: RM
USAGE: Required
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: audit_critical

LINKED POLICIES:
- RM-OS-101

PURPOSE:
Cal/OSHA hazard correction record documenting the correction of identified safety hazards.

INSTRUCTIONS:
Completed for every Cal/OSHA finding or internal identification. Retained for 3 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Log Entries
layout: table

table_columns:
- Hazard Identified
- Date Identified
- Corrective Action
- Responsible Person
- Completion Date
- Verification
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-014 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: RM-OS-101

---

## SOURCE: Builder\Forns\RM-FM-015.txt

FORM ID: RM-FM-015
TITLE: Litigation & Claims Register
TYPE: Tracking Tool
DOMAIN: RM
USAGE: Conditional
FREQUENCY: Ongoing
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: landscape
CLASSIFICATIONS: high_risk

LINKED POLICIES:
- RM-ER-004
- RM-ER-006

PURPOSE:
Litigation and claims register capturing every claim, demand letter, lawsuit, or regulatory action against the agency.

INSTRUCTIONS:
Updated within 24 hours of receipt. Legal counsel engaged per policy; privileged.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Tracking Tool Entries
layout: table

table_columns:
- Case ID
- Claimant
- Nature
- Amount Demanded
- Date Received
- Counsel
- Status
- Reserve
- Closed
table_row_count: 15

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Completed By â€” Printed Name (type=text, col=2)
- Completed By â€” Signature (type=signature, col=1)
- Completed By â€” Date (type=date, col=1)
- Supervisor / Reviewer â€” Printed Name (type=text, col=2)
- Supervisor / Reviewer â€” Signature (type=signature, col=1)
- Supervisor / Reviewer â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-015 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: RM-ER-004, RM-ER-006

---

## SOURCE: Builder\Forns\RM-FM-016.txt

FORM ID: RM-FM-016
TITLE: Annual Risk Reassessment Report
TYPE: Assessment
DOMAIN: RM
USAGE: Required
FREQUENCY: Annual
VERSION: 6.0
EFFECTIVE DATE: 2025-07-10
NEXT REVIEW DATE: 2026-07-10
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, shared_enterprise

LINKED POLICIES:
- RM-ER-001
- RM-ER-003

PURPOSE:
Annual risk reassessment report summarizing enterprise risk posture for presentation to the Governing Body.

INSTRUCTIONS:
Prepared by Risk Management Committee and Compliance Officer.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Assessment Responses
layout: grid

fields:
- Reporting Year (type=text, required=true, col=2)
- Prepared By (type=text, col=2)
- Overview of Risk Posture (type=textarea, col=4)
- Top 5 Residual Risks (type=textarea, col=4)
- Changes since Last Year (type=textarea, col=4)
- Mitigation Effectiveness (type=textarea, col=4)
- Resource / Budget Requests (type=textarea, col=4)
- Recommendations to Governing Body (type=textarea, col=4)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Risk Committee Chair â€” Printed Name (type=text, col=2)
- Risk Committee Chair â€” Signature (type=signature, col=1)
- Risk Committee Chair â€” Date (type=date, col=1)
- Compliance Officer â€” Printed Name (type=text, col=2)
- Compliance Officer â€” Signature (type=signature, col=1)
- Compliance Officer â€” Date (type=date, col=1)
- Administrator â€” Printed Name (type=text, col=2)
- Administrator â€” Signature (type=signature, col=1)
- Administrator â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-016 Â· Version 6.0 Â· Effective 2025-07-10 Â· Next Review 2026-07-10
- Linked Policies: RM-ER-001, RM-ER-003

---

## SOURCE: Builder\Forns\RM-FM-017.txt

FORM ID: RM-FM-017
TITLE: Risk Committee Meeting Minutes
TYPE: Template
DOMAIN: RM
USAGE: Required
FREQUENCY: Quarterly
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- RM-EP-001
- RM-RM-001
- GV-GB-001

PURPOSE:
Quarterly Risk Committee meeting minutes template capturing enterprise risk register review, top-risk scoring updates, mitigation-plan progress, emergency preparedness oversight, and cross-domain risk-integration decisions (clinical, operational, financial, cyber, regulatory, safety, strategic).

INSTRUCTIONS:
Prepared by Risk Manager (or designee) within 5 business days of meeting. Approved at next Risk Committee meeting. Feeds Governing Body minutes (GV-FM-005) quarterly. Archived minimum 7 years.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Meeting Date (type=date, required=true, col=2)
- Meeting Location / Platform (type=text, col=2)
- Risk Committee Chair (type=text, col=2)
- Members Present (incl. dept reps: Clinical, Ops, IT, Finance, Compliance, HR) (type=textarea, col=4)
- Members Absent (type=textarea, col=4)
- Quorum Confirmed? (Y/N) (type=select, col=2, options=[Yes | No])
- Approval of Prior Minutes (type=textarea, col=4)
- Enterprise Risk Register Review (RM-FM-008) (type=textarea, col=4)
- Top-5 Risks / Changes This Cycle (type=textarea, col=4)
- HIGH Risks Without Mitigation â€” Escalation Decisions (type=textarea, col=4)
- Emergency Preparedness / HVA Status (RM-FM-001) (type=textarea, col=4)
- Litigation & Claims Register Review (RM-FM-015) (type=textarea, col=4)
- Insurance Coverage / Broker Updates (type=textarea, col=4)
- Cross-Domain Integration Items (CO, QA, IT, HR, CL) (type=textarea, col=4)
- Motions / Votes (with dissents, recusals) (type=textarea, col=4)
- Recommendations to Governing Body (type=textarea, col=4)
- Action Items (Owner / Due) (type=textarea, col=4)
- Adjournment Time (type=text, col=2)
- Next Meeting Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Risk Committee Chair â€” Printed Name (type=text, col=2)
- Risk Committee Chair â€” Signature (type=signature, col=1)
- Risk Committee Chair â€” Date (type=date, col=1)
- Risk Manager â€” Printed Name (type=text, col=2)
- Risk Manager â€” Signature (type=signature, col=1)
- Risk Manager â€” Date (type=date, col=1)
- Recorder â€” Printed Name (type=text, col=2)
- Recorder â€” Signature (type=signature, col=1)
- Recorder â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-017 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: RM-EP-001, RM-RM-001, GV-GB-001

---

## SOURCE: Builder\Forns\RM-FM-018.txt

FORM ID: RM-FM-018
TITLE: Safety Committee Meeting Minutes (IIPP / SB 553)
TYPE: Template
DOMAIN: RM
USAGE: Required
FREQUENCY: Quarterly
VERSION: 1.0
EFFECTIVE DATE: 2026-04-21
NEXT REVIEW DATE: 2027-04-21
ORIENTATION: portrait
CLASSIFICATIONS: audit_critical, master_template

LINKED POLICIES:
- RM-OS-001
- RM-OS-002
- RM-OS-003

PURPOSE:
Quarterly Safety Committee meeting minutes template capturing IIPP review (Cal/OSHA Â§ 3203), SB 553 Workplace Violence Prevention Plan activity, injury/illness trends, hazard identification and correction, safety training, and OSHA 300/300A review. Evidences seven IIPP elements.

INSTRUCTIONS:
Prepared by Risk Manager / Safety Officer within 5 business days of meeting. Approved at next Safety Committee meeting. Retained minimum 5 years (Cal/OSHA). Feeds Governing Body and Risk Committee quarterly.

SECTION 1: Section 1 â€” Identification
layout: grid

fields:
- Form Completed By (Full Name) (type=text, required=true, col=2)
- Title / Role (type=text, required=true, col=2)
- Department / Branch (type=text, col=2)
- Date Completed (type=date, required=true, col=2)

SECTION 2: Section 2 â€” Content
layout: grid

fields:
- Meeting Date (type=date, required=true, col=2)
- Meeting Location / Platform (type=text, col=2)
- Safety Committee Chair (type=text, col=2)
- Members Present (management + front-line per Cal/OSHA) (type=textarea, col=4)
- Members Absent (type=textarea, col=4)
- Quorum Confirmed? (Y/N) (type=select, col=2, options=[Yes | No])
- Approval of Prior Minutes (type=textarea, col=4)
- Injury / Illness Log Review (OSHA 300) (type=textarea, col=4)
- Hazard Identification (RM-FM-013) / Corrections (RM-FM-014) (type=textarea, col=4)
- Workplace Violence Incidents (RM-FM-009) â€” SB 553 (type=textarea, col=4)
- Near-Miss Trends (type=textarea, col=4)
- Safety Training Completion (HR-FM-017 / HR-FM-030) (type=textarea, col=4)
- Emergency Preparedness / Drill Feedback (type=textarea, col=4)
- PPE / Ergonomics / Vehicle Safety (type=textarea, col=4)
- Employee Safety Concerns Raised (type=textarea, col=4)
- Motions / Votes (type=textarea, col=4)
- Action Items (Owner / Due) (type=textarea, col=4)
- Adjournment Time (type=text, col=2)
- Next Meeting Date (type=date, col=2)

SECTION 3: Section â€” Signatures & Attestation
layout: signature

fields:
- Safety Committee Chair â€” Printed Name (type=text, col=2)
- Safety Committee Chair â€” Signature (type=signature, col=1)
- Safety Committee Chair â€” Date (type=date, col=1)
- Risk Manager / Safety Officer â€” Printed Name (type=text, col=2)
- Risk Manager â€” Signature (type=signature, col=1)
- Risk Manager â€” Date (type=date, col=1)
- Employee Representative â€” Printed Name (type=text, col=2)
- Employee Representative â€” Signature (type=signature, col=1)
- Employee Representative â€” Date (type=date, col=1)

FOOTER NOTES:
- Care Indeed Home Health Care, Inc. Â· Form RM-FM-018 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21
- Linked Policies: RM-OS-001, RM-OS-002, RM-OS-003

---



