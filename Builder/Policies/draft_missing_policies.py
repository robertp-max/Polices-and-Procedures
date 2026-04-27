"""
Draft all 25 missing policies and append them to appropriate extracted_full source files.
- CL-CD-002/003/004 and CL-PR-001/002/003/004 → DOMAIN_ CL — Clinical Operations (6).md
- HR-ER-006/009, HR-JD-000–004/007/011, HR-WM-001–007 → HR Policy.md  
- RM-EP-002/003 → RM — RISK MANAGEMENT & SAFETY DOMAIN (2).md
"""

import os

EXTRACTED = 'Builder/Policies/extracted_full'
RM_FILE = os.path.join(EXTRACTED, 'RM \u2014 RISK MANAGEMENT & SAFETY DOMAIN (2).md')
HR_FILE = os.path.join(EXTRACTED, 'HR Policy.md')
CL_FILE = os.path.join(EXTRACTED, 'DOMAIN_ CL \u2014 Clinical Operations (6).md')

def find_cl_file():
    for f in os.listdir(EXTRACTED):
        if 'CL' in f and 'DOMAIN' in f:
            return os.path.join(EXTRACTED, f)
    raise FileNotFoundError('CL domain file not found')

def find_rm_file():
    for f in os.listdir(EXTRACTED):
        if 'RM' in f and 'RISK' in f:
            return os.path.join(EXTRACTED, f)
    raise FileNotFoundError('RM domain file not found')

CL_FILE = find_cl_file()
RM_FILE = find_rm_file()

# ===========================================================================
# CL DOMAIN POLICIES (format: ## ID — Title / ### 1. Policy Header / H3 sections)
# ===========================================================================

CL_POLICIES = """\

## CL-CD-002 — Clinical Record Content & Organization
### 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | CL-CD-002 |
| Policy Title | Clinical Record Content & Organization |
| Domain | CL — Clinical Operations |
| Subdomain | CD — Clinical Documentation |
| Classification Tier | REQUIRED |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 2 — Restricted |
| Policy Owner / Steward | Director of Nursing |
| Effective Date | 2025-07-10 |
| Version | 6.0 |
| Approved By | Governing Body Chair — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Supersedes | N/A (Initial Version) |

### 2. Purpose
This policy establishes the required content elements and organizational structure of every patient clinical record maintained by Care Indeed Home Health Care, Inc. A complete, well-organized clinical record is the legal and clinical foundation of patient care, serves as the primary basis for reimbursement, supports continuity among care providers, and demonstrates compliance with Medicare Conditions of Participation under 42 CFR § 484.110 and California licensing requirements under Title 22 CCR § 74751. Incomplete or disorganized records constitute a major survey deficiency and expose the agency to payment denial, civil monetary penalties, and program exclusion.

### 3. Scope
This policy applies to all clinical staff responsible for creating or maintaining patient documentation, including Registered Nurses, Licensed Vocational Nurses, Physical Therapists, Occupational Therapists, Speech-Language Pathologists, Medical Social Workers, and Home Health Aides. It applies to all patient records whether maintained in the agency's Electronic Health Record (EHR) system or in paper format.

### 4. Policy Statements
4.1 Care Indeed Home Health Care, Inc. shall maintain a complete clinical record for every patient receiving home health services. The record shall be initiated at the time of referral and remain active throughout the episode of care and for the retention period defined in CO-HP-007.

4.2 Every patient clinical record shall contain at minimum the following required content elements:
(a) Referral source documentation and intake assessment;
(b) Physician orders — initial, verbal, written, and change orders — authenticated per CL-CD-003;
(c) Completed and certified OASIS assessment(s) per CL-OA-001;
(d) Current, physician-approved Plan of Care (CMS-485 or equivalent) per CL-CP-001;
(e) Individualized care plan with measurable goals, disciplines, frequencies, and functional objectives per CL-CP-001;
(f) All visit notes (skilled nursing, therapy, social work, HHA supervisory, and HHA activity notes) per CL-CD-001;
(g) Medication profile with current medications, dosages, routes, and frequencies;
(h) Physician communication records including verbal order logs and telephone encounter notes;
(i) Diagnostic test results, laboratory reports, and imaging studies relevant to the home health episode;
(j) Patient/caregiver education documentation including topics taught, methods used, and learner response;
(k) Advance Directive documentation per CL-PR-002 — inquiry, copy if provided, and notation of patient decision;
(l) Consent documents per CL-PR-003;
(m) Patient Rights acknowledgment per CL-PR-001;
(n) Coordination of care notes including referrals to other disciplines, hospital communications, and specialist consultations;
(o) Discharge summary or transfer documentation for every episode closure;
(p) Supervisory visit documentation for Home Health Aide cases per CL-SD-006;
(q) All QAPI-related incident reports referencing the patient per QA-AE-004.

4.3 Clinical records shall be organized in a consistent, standardized manner as defined in the agency's EHR configuration or paper record structure. The sequence of documents shall allow any authorized reviewer to quickly locate the Plan of Care, most recent visit note, physician orders, and medication profile within 60 seconds of accessing the record.

4.4 No clinical record shall be altered, backdated, or falsified. Corrections shall be made by drawing a single line through the incorrect entry, entering the correction, and initialing and dating the correction. In electronic records, audit trail/version history shall be maintained by the EHR system.

4.5 The Director of Nursing or designee shall conduct quarterly audits of a random sample of 10% of active patient records to verify completeness and organization per QA-PG-001.

### 5. Definitions

| Term | Definition |
| --- | --- |
| Clinical Record | The complete collection of documents related to a patient's care, whether electronic or paper, created and maintained by the agency during and after service provision. |
| Episode of Care | A 60-day period of Medicare home health services beginning with the first billable skilled visit and ending on day 60 or at discharge, whichever occurs first. |
| OASIS | Outcome and Assessment Information Set — the standardized patient assessment instrument required for Medicare home health. |
| Plan of Care (POC) | The physician-approved document that authorizes and defines all home health services for a patient during a certification period. |

### 6. Procedures

| Step | Responsible Party | Action | Timeframe |
| --- | --- | --- | --- |
| 6.1 | Intake Coordinator | Create patient record in EHR upon referral acceptance | Same business day as referral |
| 6.2 | Admitting RN | Complete all required SOC documentation including OASIS and initial POC | Within 5 business days of SOC |
| 6.3 | All Clinicians | Submit visit notes for each patient encounter | Within 24 hours of visit per CL-CD-004 |
| 6.4 | Physician Liaison | Obtain and file physician order signatures | Per CL-CP-002 timeframes |
| 6.5 | Medical Records | Audit record completeness at 30-day intervals | Ongoing |
| 6.6 | DON / Designee | Quarterly record content audit (10% sample) | Quarterly |
| 6.7 | Medical Records | Close and archive record within 30 days of discharge | Within 30 days of discharge |

### 7. Compliance & Regulatory References

| Regulation | Requirement | Agency Policy |
| --- | --- | --- |
| 42 CFR § 484.110 | Clinical record content, maintenance, and retention | CL-CD-002 |
| 42 CFR § 484.110(a) | Required record elements | CL-CD-002 § 4.2 |
| Title 22 CCR § 74751 | California clinical record requirements | CL-CD-002 |
| HIPAA 45 CFR Parts 160, 164 | Patient record privacy and security | CO-HP-001–CO-HP-004 |

### 8. Cross-Referenced Policies
CL-CD-001, CL-CD-003, CL-CD-004, CL-CP-001, CL-OA-001, CL-PR-002, CL-PR-003, CO-HP-001, CO-HP-007, QA-AE-004.

### 9. Training Requirements
All clinical staff shall complete orientation training on clinical record content requirements and annual competency on documentation standards per HR-TD-001.

### 10. Acknowledgment

| Field | Value |
| --- | --- |
| Full Name (Printed) | ________________________________ |
| Title / Role | ________________________________ |
| Signature | ________________________________ |
| Date Signed | //________ |

---

## CL-CD-003 — Clinical Record Authentication & Signature Requirements
### 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | CL-CD-003 |
| Policy Title | Clinical Record Authentication & Signature Requirements |
| Domain | CL — Clinical Operations |
| Subdomain | CD — Clinical Documentation |
| Classification Tier | REQUIRED |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 2 — Restricted |
| Policy Owner / Steward | Director of Nursing |
| Effective Date | 2025-07-10 |
| Version | 6.0 |
| Approved By | Governing Body Chair — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Supersedes | N/A (Initial Version) |

### 2. Purpose
This policy establishes requirements for the authentication, co-signature, and countersignature of all entries in the patient clinical record at Care Indeed Home Health Care, Inc. Authentication requirements ensure that all clinical documentation is traceable to a specific, identifiable, and authorized author, thereby protecting patient safety, legal accountability, and Medicare reimbursement. Unauthenticated clinical entries are not legally valid, may not support claims adjudication, and constitute a survey-level deficiency under 42 CFR § 484.110(b).

### 3. Scope
All employees and contractors who create or co-sign entries in patient clinical records, including all clinical disciplines, supervising clinicians, and agency administrators who countersign documentation.

### 4. Policy Statements
4.1 Every entry in a patient clinical record — including visit notes, assessments, care plan updates, physician orders, verbal order transcriptions, education notes, and supervisory notes — shall be authenticated (signed and dated) by the author at the time the entry is completed.

4.2 Authentication shall include: (a) the author's full name; (b) professional credentials/licensure (e.g., RN, LVN, PT, OT, SLP, MSW, HHA); (c) date and time of the entry; (d) handwritten signature (for paper records) or electronic signature with audit trail (for EHR).

4.3 Electronic signatures shall be unique to each individual user, not shared, and shall be protected by secure password per IT-AS-001. Electronic signatures carry the same legal weight as handwritten signatures.

4.4 Home Health Aide (HHA) visit notes shall be cosigned by the supervising Registered Nurse within 14 days of the visit, per 42 CFR § 484.80(d).

4.5 Verbal orders transcribed by a licensed nurse or therapist shall include: (a) the transcriber's name and credentials; (b) the prescribing physician's name; (c) date and time of the verbal order; (d) statement "V.O. received per telephone from Dr. [Name]." Verbal orders shall be authenticated by the ordering physician within 30 days per CL-OA-003.

4.6 Late entries shall be labeled as "Late Entry" with the current date and time. No entry shall be backdated.

4.7 Corrections to signed entries shall comply with CL-CD-002 § 4.4. Obliteration, use of correction fluid, or erasure of any signed entry is prohibited.

4.8 Students and volunteers shall not authenticate clinical documentation. All documentation by students shall be reviewed and countersigned by a licensed supervising clinician.

4.9 The Director of Nursing shall audit authentication compliance as part of the quarterly record review per QA-PG-001, reporting results to the QAPI committee.

### 5. Definitions

| Term | Definition |
| --- | --- |
| Authentication | The process of confirming the authorship of a clinical record entry by means of a dated signature (handwritten or electronic). |
| Countersignature | A second signature by a supervising clinician that acknowledges review of documentation authored by another staff member. |
| Verbal Order | A physician order communicated orally (in person or by telephone) and transcribed by an authorized clinical staff member. |

### 6. Procedures

| Step | Responsible Party | Action | Timeframe |
| --- | --- | --- | --- |
| 6.1 | All Clinicians | Sign and date all entries at time of completion | Immediately upon entry |
| 6.2 | HHA | Complete HHA activity notes for every visit | Within 24 hours |
| 6.3 | Supervising RN | Countersign HHA visit notes | Within 14 days of visit |
| 6.4 | Transcribing Clinician | Document and sign verbal orders per protocol | At time of order receipt |
| 6.5 | Physician Liaison | Route verbal orders to physician for co-signature | Within 5 business days |
| 6.6 | DON / Medical Records | Audit authentication compliance | Quarterly |

### 7. Compliance & Regulatory References

| Regulation | Requirement |
| --- | --- |
| 42 CFR § 484.110(b) | Record authentication requirements |
| 42 CFR § 484.80(d) | HHA documentation cosignature by supervising RN |
| Title 22 CCR § 74751 | California signature requirements |

### 8. Cross-Referenced Policies
CL-CD-001, CL-CD-002, CL-CD-004, CL-OA-003, IT-AS-001, QA-PG-001.

### 9. Acknowledgment

| Field | Value |
| --- | --- |
| Full Name (Printed) | ________________________________ |
| Signature | ________________________________ |
| Date Signed | //________ |

---

## CL-CD-004 — Timely Documentation Completion & Lock Requirements
### 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | CL-CD-004 |
| Policy Title | Timely Documentation Completion & Lock Requirements |
| Domain | CL — Clinical Operations |
| Subdomain | CD — Clinical Documentation |
| Classification Tier | REQUIRED |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 2 — Restricted |
| Policy Owner / Steward | Director of Nursing |
| Effective Date | 2025-07-10 |
| Version | 6.0 |
| Approved By | Governing Body Chair — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Supersedes | N/A (Initial Version) |

### 2. Purpose
This policy establishes mandatory timeframes for completion and locking of clinical documentation at Care Indeed Home Health Care, Inc. Timely documentation ensures continuity of care between providers, supports accurate and timely claims submission, facilitates agency quality assurance, and demonstrates compliance with 42 CFR § 484.110(c) and CMS operational standards. Late or unlocked documentation creates both clinical risk (gaps in care coordination) and billing risk (rejected claims).

### 3. Scope
All clinicians and clinical staff documenting patient care, including RNs, LVNs, PT, OT, SLP, MSW, and HHA. Also applies to supervisory and administrative staff with documentation responsibilities.

### 4. Policy Statements
4.1 All visit notes shall be completed and authenticated in the agency's EHR system within 24 hours of the patient visit. This includes skilled nursing notes, therapy notes, social work notes, and HHA activity notes.

4.2 OASIS assessments shall be completed within the following timeframes:
(a) Start of Care (SOC): within 5 calendar days of the SOC visit;
(b) Resumption of Care (ROC): within 2 calendar days of the ROC visit;
(c) Recertification (RECERT): at the RECERT assessment visit, prior to end of certification period;
(d) Transfer to Inpatient Facility: within 2 calendar days of transfer;
(e) Discharge: on the date of discharge or within 2 calendar days.

4.3 Care plan updates and physician order changes shall be documented and authenticated within 24 hours of the clinical decision or verbal order receipt.

4.4 Discharge summaries shall be completed within 5 business days of patient discharge from care.

4.5 Once a visit note is completed and authenticated, it shall be locked in the EHR system per the agency's IT policy (IT-DM-003). Locked records may not be edited; corrections shall be made via addendum with date, time, author, and reason for correction.

4.6 Supervisors shall review documentation compliance weekly. Clinicians with chronic late documentation (>20% of visits late in any 30-day period) shall receive progressive counseling per HR-ER-003.

4.7 Claims shall not be submitted for any episode or visit that has not been documented, authenticated, and locked in the EHR system per CL-OA-006.

4.8 The Director of Nursing shall report documentation timeliness metrics to the QAPI committee monthly and to the Governing Body quarterly.

### 5. Definitions

| Term | Definition |
| --- | --- |
| Document Lock | A system function that prevents further editing of a finalized and authenticated clinical record entry. |
| Late Documentation | Any clinical record entry not completed and authenticated within the timeframe specified in this policy. |
| Addendum | A supplemental entry added to a locked clinical record to provide additional information, corrections, or clarification, without altering the original entry. |

### 6. Documentation Timeliness Standards

| Document Type | Completion Deadline | Lock Deadline |
| --- | --- | --- |
| Skilled Visit Note (RN, PT, OT, SLP, MSW) | 24 hours post-visit | 48 hours post-visit |
| HHA Activity Note | 24 hours post-visit | 48 hours post-visit |
| OASIS — SOC | 5 calendar days | 7 calendar days |
| OASIS — ROC | 2 calendar days | 3 calendar days |
| OASIS — Discharge | Day of discharge + 2 days | +3 days |
| Care Plan Update | 24 hours | 48 hours |
| Verbal Order Transcription | At time of receipt | Same day |
| Discharge Summary | 5 business days | 7 business days |

### 7. Compliance & Regulatory References

| Regulation | Requirement |
| --- | --- |
| 42 CFR § 484.110(c) | Timely clinical record completion |
| 42 CFR § 484.55 | OASIS assessment timeframe requirements |
| CMS OASIS Guidance | OASIS submission timelines |

### 8. Cross-Referenced Policies
CL-CD-001, CL-CD-002, CL-CD-003, CL-OA-001, CL-OA-006, HR-ER-003, IT-DM-003, QA-PG-001.

### 9. Acknowledgment

| Field | Value |
| --- | --- |
| Full Name (Printed) | ________________________________ |
| Signature | ________________________________ |
| Date Signed | //________ |

---

## CL-PR-001 — Patient Rights & Responsibilities
### 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | CL-PR-001 |
| Policy Title | Patient Rights & Responsibilities |
| Domain | CL — Clinical Operations |
| Subdomain | PR — Patient Rights & Clinical Procedures |
| Classification Tier | REQUIRED |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 1 — Public |
| Policy Owner / Steward | Administrator |
| Effective Date | 2025-07-10 |
| Version | 6.0 |
| Approved By | Governing Body Chair — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Supersedes | N/A (Initial Version) |

### 2. Purpose
This policy establishes and protects the rights of every patient receiving home health services from Care Indeed Home Health Care, Inc. and defines the corresponding responsibilities of patients and their designated representatives. Patient rights are not aspirational — they are legally enforceable entitlements under 42 CFR § 484.50 (Condition of Participation: Patient Rights), the California Home Health Agency Licensing Law (Health & Safety Code §§ 1726–1727), and the Patient Self-Determination Act (42 U.S.C. § 1395cc(f)). Failure to provide, document, and honor patient rights constitutes a Condition-level deficiency that may result in immediate jeopardy findings, civil monetary penalties, and program termination.

### 3. Scope
This policy applies to all patients and their designated representatives, all clinical and administrative staff, all contracted providers, and anyone acting on behalf of the agency in patient interactions.

### 4. Patient Rights
4.1 Care Indeed Home Health Care, Inc. shall provide every patient, at or before the initiation of care, with a written notice of the following rights, in a language and manner the patient understands:

4.1.1 Right to be informed of rights: Every patient has the right to receive written notice of their rights and to have those rights explained verbally in understandable terms before care begins.

4.1.2 Right to exercise rights: Every patient has the right to exercise their rights as a patient of the agency and as a citizen of the United States without interference, coercion, discrimination, or reprisal.

4.1.3 Right to be informed of charges: Patients have the right to be informed of the services covered under their specific payer source, any limitations on coverage, and any services for which they will be personally responsible for payment, in advance of receiving those services.

4.1.4 Right to participate in care planning: Patients have the right to participate in the development and revision of their plan of care. This includes the right to request changes to the care plan, refuse specific treatments, and have their preferences documented.

4.1.5 Right to refuse care: Patients have the right to refuse all or any part of their care plan. When a patient refuses care, the clinician shall document the refusal, the information provided to the patient about the potential consequences of refusal, and the patient's decision per CL-CD-001.

4.1.6 Right to confidentiality: Patients have the right to have their clinical records and personal information kept confidential per HIPAA (CO-HP-001) and California law.

4.1.7 Right to access records: Patients have the right to access their clinical records per CO-HP-002 and 45 CFR § 164.524.

4.1.8 Right to be treated with dignity and respect: Patients have the right to be treated courteously, fairly, and without discrimination based on race, color, religion, sex, national origin, age, disability, sexual orientation, gender identity, or any other characteristic protected by federal or California law.

4.1.9 Right to voice grievances: Patients have the right to voice grievances about care or services without fear of discrimination or reprisal. Grievances shall be investigated and resolved per OP-PA-001.

4.1.10 Right to be informed of investigation outcomes: Patients have the right to be informed of the outcome of any investigation of a grievance filed per OP-PA-001.

4.1.11 Right to advance directives: Patients have the right to formulate an advance directive and to have the agency honor the directive to the extent permitted by law per CL-PR-002.

4.1.12 Right to be free from abuse and neglect: Patients have the right to be free from verbal, mental, sexual, and physical abuse, neglect, and exploitation by agency personnel, per HR-ER-009 and California Welfare and Institutions Code.

4.1.13 Right to have property respected: Patients have the right to have their property treated with respect. Agency staff shall not use patient property, borrow money, or accept gifts of more than nominal value from patients.

4.1.14 Right to know staff identity: Patients have the right to know the name and function of any person providing care to them, and to know the identity of the agency supervising their care.

4.2 The agency shall maintain documentation that the Patient Rights and Responsibilities notice was provided, explained, and acknowledged by the patient or representative at admission. A signed copy shall be filed in the patient clinical record per CL-CD-002.

4.3 If a patient lacks decision-making capacity, the rights specified in this policy extend to the patient's legally authorized representative (legal guardian, healthcare agent, or next of kin per California law).

### 5. Patient Responsibilities
5.1 Patients are expected to: (a) provide accurate and complete health information; (b) follow the agreed-upon plan of care to the best of their ability and notify the agency when they cannot; (c) treat agency staff with courtesy and respect; (d) keep scheduled appointments or notify the agency in advance of cancellations; (e) notify the agency of changes in their condition, payer status, or living situation; (f) inform the agency of any other healthcare services they are receiving; (g) accept responsibility for refusing care or for failing to follow their care plan.

### 6. Procedures

| Step | Responsible Party | Action | Timeframe |
| --- | --- | --- | --- |
| 6.1 | Admitting Clinician | Provide written Patient Rights notice to patient/representative | At or before SOC |
| 6.2 | Admitting Clinician | Review rights verbally with patient/representative | At SOC visit |
| 6.3 | Patient/Representative | Sign acknowledgment of receipt | At SOC visit |
| 6.4 | Admitting Clinician | File signed acknowledgment in EHR clinical record | Same day as SOC |
| 6.5 | Administrator / DON | Investigate any reported rights violations | Within 72 hours of report |
| 6.6 | Administrator | Notify patient of investigation outcome | Within 30 days per OP-PA-001 |

### 7. Compliance & Regulatory References

| Regulation | Requirement |
| --- | --- |
| 42 CFR § 484.50 | Home Health CoP: Patient Rights |
| California HSC §§ 1726–1727 | California Home Health Patient Rights |
| Patient Self-Determination Act (1990) | Advance Directive rights |
| 42 U.S.C. § 1395cc(f) | Medicare provider patient rights obligations |

### 8. Cross-Referenced Policies
CL-PR-002, CL-PR-003, CL-CD-001, CL-CD-002, CO-HP-001, CO-HP-002, HR-ER-009, OP-PA-001.

### 9. Acknowledgment

| Field | Value |
| --- | --- |
| Full Name (Printed) | ________________________________ |
| Signature | ________________________________ |
| Date Signed | //________ |

---

## CL-PR-002 — Advance Directive Compliance
### 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | CL-PR-002 |
| Policy Title | Advance Directive Compliance |
| Domain | CL — Clinical Operations |
| Subdomain | PR — Patient Rights & Clinical Procedures |
| Classification Tier | REQUIRED |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 1 — Public |
| Policy Owner / Steward | Administrator / Director of Nursing |
| Effective Date | 2025-07-10 |
| Version | 6.0 |
| Approved By | Governing Body Chair — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Supersedes | N/A (Initial Version) |

### 2. Purpose
This policy establishes requirements for identifying, documenting, honoring, and maintaining advance directives for all patients receiving home health services from Care Indeed Home Health Care, Inc. Compliance with the Patient Self-Determination Act (PSDA, 42 U.S.C. § 1395cc(f)) is a condition of participation in the Medicare and Medicaid programs. Every Medicare-participating home health agency must: (a) provide written information to patients about their rights under state law to make decisions about medical care including the right to accept or refuse treatment; (b) maintain written policies and procedures regarding advance directives; (c) document in the patient's record whether the patient has an advance directive; and (d) not discriminate against individuals based on whether they have an advance directive.

### 3. Scope
All patients admitted to home health services and all clinical and administrative staff involved in patient intake, admission, and ongoing care.

### 4. Policy Statements
4.1 At or before the initiation of home health services, Care Indeed Home Health Care, Inc. shall provide every adult patient (or the patient's authorized representative) with written information about the patient's rights under California law to make decisions about medical care, including the right to execute an Advance Directive.

4.2 The admitting clinician shall ask every patient at admission whether they have an existing Advance Directive. The patient's answer shall be documented in the clinical record per CL-CD-002. If the patient has an Advance Directive, a copy shall be requested for the clinical record.

4.3 If the patient has an Advance Directive, the agency shall: (a) place a copy or summary of the directive in the patient's clinical record; (b) flag the directive for visibility to all treating clinicians; (c) honor the directive to the extent permitted by law and consistent with the patient's wishes; (d) communicate the existence and content of the directive to treating clinicians and, as appropriate, to emergency services.

4.4 The agency shall NOT condition the provision of care, discriminate, or create barriers based on whether a patient has or does not have an Advance Directive.

4.5 If the agency's professional or religious convictions create a conflict with honoring a specific provision of an Advance Directive, the agency shall promptly notify the patient and, if necessary, assist in transferring the patient to another care provider that can honor the directive.

4.6 If a patient wishes to create, modify, or revoke an Advance Directive and requests assistance, the agency shall provide the patient with general information about California Advance Directives and refer the patient to appropriate resources (primary care provider, social worker, or a California Probate Code attorney). Agency staff shall not participate in drafting a patient's legal documents.

4.7 Types of Advance Directives recognized under California law and relevant to home health include:
(a) Healthcare Power of Attorney / AHCD (Prob. Code § 4600 et seq.);
(b) POLST (Physician Orders for Life-Sustaining Treatment) — a physician order, not just a directive;
(c) Natural Death Act Declaration (Living Will);
(d) Do Not Resuscitate (DNR) Order, if signed by a physician.

4.8 Home Health Aides and non-licensed staff shall NOT make clinical decisions regarding Advance Directives. Any question about a patient's wishes or an AD's applicability shall be escalated to the supervising RN immediately.

4.9 The agency shall provide annual staff education on Advance Directive requirements and patient rights per HR-TD-001.

### 5. Procedures

| Step | Responsible Party | Action | Timeframe |
| --- | --- | --- | --- |
| 5.1 | Admitting Clinician | Provide written Advance Directive information to patient | At or before SOC |
| 5.2 | Admitting Clinician | Inquire about existing Advance Directive; document answer | At SOC |
| 5.3 | Admitting Clinician | Request copy of AD if patient has one; file in record | At SOC |
| 5.4 | DON | Ensure AD is flagged in EHR for all treating clinicians | Within 24 hours of SOC |
| 5.5 | All Clinicians | Review AD at each visit if patient condition changes | Ongoing |
| 5.6 | Clinician | Escalate any AD conflict or uncertainty to DON/Administrator | Immediately |

### 6. Compliance & Regulatory References

| Regulation | Requirement |
| --- | --- |
| 42 U.S.C. § 1395cc(f) | Patient Self-Determination Act |
| 42 CFR § 484.50(d) | Home Health CoP: Patient Rights — Advance Directives |
| California Probate Code § 4600 et seq. | Advance Healthcare Directive |
| California Health & Safety Code § 443 et seq. | End of Life Option Act |

### 7. Cross-Referenced Policies
CL-PR-001, CL-PR-003, CL-CD-002, HR-TD-001, OP-PA-001.

### 8. Acknowledgment

| Field | Value |
| --- | --- |
| Full Name (Printed) | ________________________________ |
| Signature | ________________________________ |
| Date Signed | //________ |

---

## CL-PR-003 — Informed Consent
### 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | CL-PR-003 |
| Policy Title | Informed Consent |
| Domain | CL — Clinical Operations |
| Subdomain | PR — Patient Rights & Clinical Procedures |
| Classification Tier | REQUIRED |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 2 — Restricted |
| Policy Owner / Steward | Director of Nursing / Administrator |
| Effective Date | 2025-07-10 |
| Version | 6.0 |
| Approved By | Governing Body Chair — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Supersedes | N/A (Initial Version) |

### 2. Purpose
This policy establishes the requirements for obtaining, documenting, and maintaining valid informed consent from patients or their authorized representatives prior to initiating home health services and prior to specific procedures or treatments. Informed consent is a fundamental legal and ethical obligation grounded in the patient's right to self-determination (California Health & Safety Code § 1599.80) and the agency's duty to ensure patients understand the care being proposed before agreeing to receive it. Lack of proper informed consent exposes the agency to legal liability and constitutes a violation of patient rights under 42 CFR § 484.50.

### 3. Scope
All patients, their authorized representatives, and all clinical and administrative staff involved in obtaining and documenting consent.

### 4. Policy Statements
4.1 Care Indeed Home Health Care, Inc. shall obtain written, informed consent from every patient or authorized representative prior to initiating home health services. Consent shall be documented on the agency's standard Consent for Home Health Services form.

4.2 Informed consent requires that the patient be provided with: (a) a description of the proposed services, including disciplines involved, visit frequency, and anticipated duration; (b) the potential benefits of the services; (c) potential risks or burdens, if applicable; (d) available alternatives to the proposed services; (e) the consequences of refusing services; (f) the right to withdraw consent at any time without affecting other rights or access to care.

4.3 Consent shall be obtained in a language and manner the patient understands. If the patient requires language interpretation, a qualified interpreter (not a family member unless in emergency) shall be provided per CO-HP-003.

4.4 Consent shall be obtained by an authorized staff member (RN, Administrator, or trained intake coordinator). Home Health Aides shall not obtain informed consent.

4.5 For patients who lack decision-making capacity, consent shall be obtained from: (a) the legal guardian; (b) the agent named in a healthcare power of attorney (AHCD); (c) next of kin per California Probate Code § 4711, in the order specified by law.

4.6 Verbal consent in urgent or emergency situations is permitted provided it is: (a) witnessed by a second staff member; (b) documented immediately with the witness's name; (c) followed up with written consent at the earliest opportunity.

4.7 Consent shall be obtained separately for: (a) general home health services (signed at admission); (b) HIV/AIDS testing, if applicable (California HSC § 120990); (c) recording of communications, if applicable.

4.8 Consent forms shall be retained in the patient clinical record per CO-HP-007 and CL-CD-002.

### 5. Procedures

| Step | Responsible Party | Action | Timeframe |
| --- | --- | --- | --- |
| 5.1 | Admitting Clinician / Intake | Present consent form and explain in patient's language | At SOC or intake |
| 5.2 | Clinician | Allow patient time to ask questions; answer questions honestly | Before signing |
| 5.3 | Patient / Representative | Sign consent form | At SOC |
| 5.4 | Clinician | File signed consent in EHR record | Same day |
| 5.5 | DON | Audit consent completion as part of quarterly record review | Quarterly |

### 6. Compliance & Regulatory References

| Regulation | Requirement |
| --- | --- |
| 42 CFR § 484.50 | Patient Rights — right to participate in care decisions |
| California HSC § 1599.80 | Informed consent requirements |
| California Probate Code § 4711 | Surrogate decision-making hierarchy |

### 7. Cross-Referenced Policies
CL-PR-001, CL-PR-002, CL-CD-002, CO-HP-001, CO-HP-003, CO-HP-007.

### 8. Acknowledgment

| Field | Value |
| --- | --- |
| Full Name (Printed) | ________________________________ |
| Signature | ________________________________ |
| Date Signed | //________ |

---

## CL-PR-004 — Restraint & Seclusion Prohibition
### 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | CL-PR-004 |
| Policy Title | Restraint & Seclusion Prohibition |
| Domain | CL — Clinical Operations |
| Subdomain | PR — Patient Rights & Clinical Procedures |
| Classification Tier | REQUIRED |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 2 — Restricted |
| Policy Owner / Steward | Director of Nursing / Administrator |
| Effective Date | 2025-07-10 |
| Version | 6.0 |
| Approved By | Governing Body Chair — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Supersedes | N/A (Initial Version) |

### 2. Purpose
This policy establishes a clear, unequivocal prohibition on the use of physical restraint or seclusion by Care Indeed Home Health Care, Inc. personnel in any patient care situation. Physical restraint and seclusion constitute violations of patient rights under 42 CFR § 484.50(f) and constitute abuse under California law. The home health setting provides no clinical, safety, or emergency justification that would ever authorize an agency employee to physically restrain or seclude a patient. This policy protects patients from abuse and protects the agency from criminal liability, civil monetary penalties, and termination from the Medicare program.

### 3. Scope
All agency employees, contractors, volunteers, and any person acting on behalf of Care Indeed Home Health Care, Inc. in any patient care context.

### 4. Policy Statements
4.1 Care Indeed Home Health Care, Inc. PROHIBITS, in all circumstances, the use of:
(a) Physical restraint — any manual method, physical or mechanical device, material, or equipment that immobilizes or reduces the ability of a patient to move their arms, legs, body, or head freely;
(b) Chemical restraint — any drug used as a restriction to manage behavior or restrict freedom of movement that is not standard treatment for a patient's medical or psychiatric condition;
(c) Seclusion — the involuntary confinement of a patient alone in a room or area from which the patient is physically prevented from leaving.

4.2 No employee, contractor, or volunteer of Care Indeed Home Health Care, Inc. shall ever apply a physical restraint to a patient, regardless of the circumstances, including situations where the patient is physically aggressive, combative, or poses a perceived risk of harm.

4.3 In situations where a patient is agitated, aggressive, or poses a safety risk, agency staff shall:
(a) Maintain a safe distance and ensure their own safety;
(b) De-escalate verbally using calm, non-threatening communication;
(c) Contact the supervising RN and/or Administrator immediately;
(d) If there is an imminent threat to life, call 911;
(e) Document the incident per QA-AE-004.

4.4 The use of side rails as a restraint is prohibited. Side rails used as assistive mobility devices are not considered restraints, but any use that prevents a patient from leaving the bed constitutes a restraint and is prohibited.

4.5 Any observation of restraint or seclusion applied to a patient by a family member, caregiver, or other party shall be reported immediately to the supervising RN and documented as a potential abuse situation per HR-ER-009.

4.6 Agency staff who apply restraints or seclusion in violation of this policy are subject to immediate suspension and investigation per HR-ER-004 and may be subject to criminal referral under California Penal Code § 368 (elder abuse) or § 11166 (mandatory reporting).

### 5. Definitions

| Term | Definition |
| --- | --- |
| Physical Restraint | Any manual method or physical device that immobilizes or reduces ability to move freely, not including side rails used for mobility assistance. |
| Chemical Restraint | Drug used to restrict patient freedom of movement, not prescribed for a legitimate medical/psychiatric condition. |
| Seclusion | Involuntary confinement of a patient alone in a space from which they cannot leave. |
| De-escalation | A set of verbal and non-verbal communication techniques used to reduce the intensity of a crisis situation. |

### 6. Compliance & Regulatory References

| Regulation | Requirement |
| --- | --- |
| 42 CFR § 484.50(f) | Prohibition on restraint/seclusion as patient right |
| California Welfare & Institutions Code § 15610.63 | Elder/dependent adult physical abuse |
| California Penal Code § 368 | Elder abuse criminal statute |

### 7. Cross-Referenced Policies
CL-PR-001, HR-ER-009, QA-AE-004, RM-EP-001.

### 8. Acknowledgment

| Field | Value |
| --- | --- |
| Full Name (Printed) | ________________________________ |
| Signature | ________________________________ |
| Date Signed | //________ |

"""

# ===========================================================================
# HR DOMAIN POLICIES (format: # POLICY HR-ER-006 / # Title / ## 1. Policy Header)
# ===========================================================================

HR_POLICIES = """

# POLICY HR-ER-006
# Separation & Exit Process
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-ER-006 |
| Title | Separation & Exit Process |
| Domain | HR — Human Resources |
| Subdomain | ER — Employee Relations |
| Classification Tier | ESSENTIAL |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Approved By | HR Director / Administrator — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director |
| Status | ACTIVE |
| Supersedes | N/A (Initial Version) |

## 2. Purpose
This policy establishes a standardized process for managing the separation of all employees from Care Indeed Home Health Care, Inc., whether the separation is voluntary (resignation, retirement), involuntary (termination, layoff, reduction in force), or due to death or incapacitation. A consistent separation process protects the agency from wrongful termination claims, ensures continuity of patient care, secures agency property and system access, meets California's specific final wage payment requirements under Labor Code §§ 201–203, and produces documentation required for unemployment benefit adjudication and potential litigation defense.

## 3. Scope
All employees separating from employment with Care Indeed Home Health Care, Inc., regardless of employment type, length of service, or reason for separation. Also applies to HR Director, Administrator, DON, and all managers who participate in the separation process.

## 4. Policy Statements
4.1 Types of Separation: The agency recognizes the following types of employee separation:
(a) Voluntary Resignation — employee-initiated, with or without notice;
(b) Voluntary Retirement — employee-initiated based on age/tenure;
(c) Involuntary Termination for Cause — agency-initiated due to misconduct, performance, or policy violation per HR-ER-003 and HR-ER-004;
(d) Involuntary Layoff / Reduction in Force — agency-initiated for business or economic reasons;
(e) End of Assignment — for temporary, per diem, or contract employees;
(f) Death or Incapacitation.

4.2 Notice Requirements: Employees in clinical or patient-facing roles are requested to provide a minimum of two (2) weeks written notice. The Administrator, DON, or department managers are requested to provide four (4) weeks notice. The agency may choose to accept or waive the notice period.

4.3 Final Wage Payment: California Labor Code requirements shall be strictly observed:
(a) Involuntary termination: Final wages including all accrued, unused vacation shall be paid on the last day of employment (Labor Code § 201);
(b) Voluntary resignation with 72+ hours notice: Final wages due on the employee's last day;
(c) Voluntary resignation with less than 72 hours notice: Final wages due within 72 hours of resignation;
(d) Failure to comply may result in waiting time penalties of up to 30 days of wages.

4.4 Separation Checklist: HR shall use a standardized Separation Checklist to ensure completion of:
(a) Return of all agency property: keys, access cards, uniforms, mobile devices, laptops, identification badges;
(b) Revocation of all system access: EHR, email, agency intranet, payroll system, telehealth platforms — within 24 hours of last day;
(c) Completion of COBRA/Cal-COBRA notification for benefits-eligible employees within the federal 14-day notice deadline;
(d) Provision of EDD Notice to Employee as to Change in Relationship (DE 2320) per California EDD requirements;
(e) Final timesheet review and processing;
(f) Collection of signed separation documentation.

4.5 Exit Interview: HR shall offer an exit interview to all voluntarily separating employees to gather constructive feedback about working conditions, management practices, and agency operations. Exit interview data shall be aggregated and reviewed by the Administrator quarterly.

4.6 Patient Care Continuity: The DON shall be notified of any clinical staff separation at least 1 business day before the last working day to arrange patient reassignment, ensure no patients are left without a case manager, and transfer care documentation. Abrupt clinical separations are a patient safety issue and shall be escalated immediately.

4.7 Reference Policy: The agency shall provide employment verification (dates of employment, positions held, and confirmation of eligibility for rehire) to authorized inquiries. Detailed reference information beyond employment verification requires a signed Release of Information from the former employee.

4.8 Rehire Eligibility: Employees separated in good standing (non-disciplinary) may be considered for rehire. Employees terminated for cause involving patient abuse, fraud, or OIG exclusion criteria are permanently ineligible for rehire and shall be flagged in the HR system.

4.9 Documentation: All separation documentation shall be retained in the personnel file per HR-WM-005 and CO-HP-007.

## 5. Separation Procedures

| Step | Responsible Party | Action | Timeframe |
| --- | --- | --- | --- |
| 5.1 | Employee / Manager | Notice given to HR (verbal or written) | Per notice requirement |
| 5.2 | HR Director | Initiate Separation Checklist; notify payroll and IT | Same day as notice |
| 5.3 | IT / EHR Admin | Revoke all system access | Within 24 hours of last day |
| 5.4 | HR Director | Calculate and process final pay per Labor Code | Per Labor Code §§ 201-203 |
| 5.5 | HR Director | Issue DE 2320; provide COBRA notice | Per state/federal deadlines |
| 5.6 | DON | Reassign patients; ensure care continuity | Before clinician's last day |
| 5.7 | HR Director | Conduct exit interview (voluntary separations) | On or before last day |
| 5.8 | HR Director | File all separation documents in personnel file | Within 5 business days |

## 6. Compliance & Regulatory References

| Regulation | Requirement |
| --- | --- |
| California Labor Code §§ 201–203 | Final wage payment requirements |
| COBRA (29 U.S.C. § 1161 et seq.) | Continuation coverage notice |
| Cal-COBRA (California H&S Code § 1366 et seq.) | Small employer continuation |
| WARN Act (29 U.S.C. § 2101 et seq.) | Mass layoff notice requirements (50+ employees) |
| California EDD | DE 2320 notice requirement |

## 7. Cross-Referenced Policies
HR-ER-001, HR-ER-003, HR-ER-004, HR-WM-005, HR-WM-007, IT-AS-001, CO-HP-007.

## 8. Training & Acknowledgment
HR staff shall complete annual training on California separation requirements.

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-ER-006

# POLICY HR-ER-009
# Mandatory Abuse Reporting by Staff
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-ER-009 |
| Title | Mandatory Abuse Reporting by Staff |
| Domain | HR — Human Resources |
| Subdomain | ER — Employee Relations |
| Classification Tier | REQUIRED |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Approved By | HR Director / Administrator — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director / Administrator |
| Status | ACTIVE |
| Supersedes | N/A (Initial Version) |

## 2. Purpose
This policy establishes mandatory reporting obligations for all Care Indeed Home Health Care, Inc. employees regarding suspected or known abuse, neglect, abandonment, or exploitation of patients (elder adults, dependent adults, and minors) receiving home health services. All employees of the agency are mandatory reporters under the California Elder Abuse and Dependent Adult Civil Protection Act (EADACPA, Welfare & Institutions Code § 15600 et seq.), the Child Abuse and Neglect Reporting Act (CANRA, Penal Code § 11164 et seq.), and the In-Home Supportive Services (IHSS) reporting requirements. Failure to report known or suspected abuse is a criminal misdemeanor under California law, punishable by up to 6 months imprisonment and/or a $1,000 fine. This policy is non-negotiable.

## 3. Scope
All employees, contractors, volunteers, and students of Care Indeed Home Health Care, Inc. without exception, including clinical staff, administrative staff, and management.

## 4. Who Must Report
4.1 Every employee of Care Indeed Home Health Care, Inc. is a mandatory reporter for suspected elder/dependent adult abuse and child abuse when they observe or have reasonable suspicion of abuse in their professional capacity.

4.2 The reporting obligation is personal — supervisors may NOT instruct employees to withhold or delay a report. Supervisors who interfere with mandatory reporting may be subject to criminal charges.

4.3 "Reasonable suspicion" does not require certainty or proof. If the reporter believes abuse might be occurring based on observed signs, symptoms, or disclosures, they are legally required to report.

## 5. Types of Reportable Abuse
5.1 Elder/Dependent Adult Abuse (WIC § 15610):
(a) Physical abuse — non-accidental injury, unreasonable restraint, sexual assault;
(b) Neglect — failure to provide food, shelter, health care, or protection from physical harm;
(c) Abandonment — desertion without arrangements for care;
(d) Financial abuse — taking or misappropriating money or property;
(e) Isolation — preventing contacts with others by threat or deception;
(f) Psychological/mental abuse — intimidation, humiliation, threatening behavior.

5.2 Child Abuse (PC § 11165):
(a) Physical abuse; (b) Sexual abuse; (c) Emotional abuse; (d) Neglect; (e) Willful cruelty or unjustifiable punishment.

## 6. Reporting Procedures
6.1 Immediate telephone report: Any employee who observes or suspects abuse shall make an immediate telephone report — within 2 hours of becoming aware — to:
(a) Adult Protective Services (APS): for elder/dependent adults not residing in a care facility;
(b) Long-Term Care Ombudsman: for residents of residential care or skilled nursing facilities;
(c) CDPH: for abuse in licensed healthcare facilities;
(d) Law enforcement (911 or local police): for any situation involving imminent danger, sexual assault, or criminal activity.

6.2 Written report: A written report on the appropriate standardized form (SOC 341 for elder/dependent adult abuse; SS 8572 for child abuse) shall be submitted within 2 business days of the oral report.

6.3 Internal notification: In addition to the legal report, the employee shall immediately notify their supervising clinician and the Administrator. The Administrator shall document the report and any agency action in the patient's clinical record and in the agency's incident log per QA-AE-004.

6.4 Confidentiality of the reporter: Reports made in good faith are confidential and protected from civil and criminal liability under California law. The identity of the reporter is protected per WIC § 15633.

6.5 Non-retaliation: Care Indeed Home Health Care, Inc. prohibits retaliation against any employee who makes a good-faith mandatory abuse report. Retaliation is a violation of California law and agency policy, and will result in disciplinary action up to and including termination.

6.6 Interaction with patients: When reporting abuse by a family member or caregiver, agency staff shall NOT confront the alleged abuser. Staff shall ensure patient safety (call 911 if imminent danger) and leave the interaction to APS and law enforcement.

## 7. Documentation
7.1 The reporter shall document in the clinical record: (a) observed signs/symptoms leading to suspicion; (b) patient statements, if any; (c) date, time, and agency contacted for oral report; (d) name of receiving official, if available; (e) follow-up actions taken.

7.2 A copy of the written report shall be filed in the patient's clinical record and in the agency's incident file. The report and clinical record are confidential and shall be protected per CO-HP-001.

## 8. Training
All employees shall complete mandatory abuse recognition and reporting training at hire and annually thereafter per HR-TD-001. Training shall cover: abuse definitions, signs and symptoms, reporting procedures, and protections for reporters.

## 9. Compliance & Regulatory References

| Regulation | Requirement |
| --- | --- |
| California WIC § 15600–15657.3 | Elder Abuse and Dependent Adult Civil Protection Act |
| California Penal Code §§ 11164–11174.3 | Child Abuse and Neglect Reporting Act (CANRA) |
| California WIC § 15633 | Reporter confidentiality |
| 42 CFR § 484.50(b)(1) | Patient right to be free from abuse |

## 10. Cross-Referenced Policies
CL-PR-001, CL-PR-004, HR-ER-004, HR-TD-001, QA-AE-004, RM-SS-001, CO-HP-001.

## 11. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-ER-009

# POLICY HR-JD-000
# Job Description Framework & Organizational Chart
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-JD-000 |
| Title | Job Description Framework & Organizational Chart |
| Domain | HR — Human Resources |
| Subdomain | JD — Job Descriptions |
| Classification Tier | ESSENTIAL |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Approved By | HR Director / Administrator — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director |
| Status | ACTIVE |

## 2. Purpose
This policy establishes the framework for developing, maintaining, and using job descriptions at Care Indeed Home Health Care, Inc. and defines the agency's organizational structure. Job descriptions are legally required documents under 42 CFR § 484.115 (Personnel Qualifications) and California Title 22 CCR § 74699. They serve as the authoritative reference for hiring decisions, competency assessment, performance evaluation, scope of practice enforcement, and regulatory survey compliance. An accurate, current organizational chart demonstrates clear lines of authority and accountability as required by the Medicare Conditions of Participation.

## 3. Scope
All positions at Care Indeed Home Health Care, Inc. This policy applies to the HR Director and Administrator for policy administration, and to all supervisors who use job descriptions in their management functions.

## 4. Policy Statements
4.1 Care Indeed Home Health Care, Inc. shall maintain a current, approved job description for every position at the agency, including all clinical, administrative, and support positions.

4.2 Each job description shall include at minimum: (a) Position title and policy ID (HR-JD-NNN); (b) Department/domain; (c) FLSA classification (exempt/non-exempt); (d) Employment classification (full-time/part-time/per diem/contract); (e) Reports to (supervisor title); (f) Positions supervised, if any; (g) Minimum education requirements; (h) Minimum experience requirements; (i) Required licensure, certification, or registration; (j) Essential job functions; (k) Physical/environmental requirements; (l) Competency requirements; (m) Regulatory references.

4.3 Job descriptions shall be reviewed and updated: (a) Annually, as part of the HR calendar; (b) Whenever the regulatory requirements for the position change; (c) When the essential functions of the role change materially; (d) Before posting any open position.

4.4 Updated job descriptions shall be approved by the HR Director and Administrator before use. All active employees shall acknowledge receipt of their current job description annually.

4.5 Organizational Chart: The agency shall maintain a current organizational chart that shows all positions, their reporting relationships, and which individuals currently fill each position. The organizational chart shall be updated within 30 days of any change in personnel, structure, or reporting relationships. The current organizational chart shall be available at all times for regulatory survey.

## 5. Agency Organizational Structure

| Position | Policy ID | Reports To | Direct Reports |
| --- | --- | --- | --- |
| Governing Body | GV-GB-001 | N/A | Administrator |
| Administrator | HR-JD-001 | Governing Body | DON, HR Director, Financial Director |
| Administrator Designee | HR-JD-002 | Administrator | As assigned |
| Director of Nursing | HR-JD-003 | Administrator | RNs, LVNs, Therapists, MSW, HHA Supervisors |
| Clinical Designee | HR-JD-004 | DON | As assigned |
| Registered Nurse | HR-JD-005 | DON / Clinical Designee | HHAs (supervisory) |
| Licensed Vocational Nurse | HR-JD-006 | RN / DON | N/A |
| Home Health Aide | HR-JD-007 | Supervising RN | N/A |
| Physical Therapist | HR-JD-008 | DON | PT Assistants |
| Occupational Therapist | HR-JD-009 | DON | OT Assistants |
| Speech-Language Pathologist | HR-JD-010 | DON | N/A |
| Medical Social Worker | HR-JD-011 | DON | N/A |
| HR Director | HR-WM-001 | Administrator | HR Staff |

## 6. Cross-Referenced Policies
HR-JD-001 through HR-JD-011, HR-TA-001, HR-TA-006, HR-WM-001.

## 7. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-JD-000

# POLICY HR-JD-001
# Administrator
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-JD-001 |
| Title | Administrator — Job Description |
| Domain | HR — Human Resources |
| Subdomain | JD — Job Descriptions |
| Classification Tier | ESSENTIAL |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Approved By | HR Director / Governing Body — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | Governing Body / HR Director |
| Status | ACTIVE |

## 2. Position Summary
The Administrator is the accountable executive leader of Care Indeed Home Health Care, Inc., responsible for the overall management and direction of all agency operations, clinical services, financial performance, regulatory compliance, and strategic planning. The Administrator serves as the primary liaison to the Governing Body, is ultimately accountable for all Medicare/Medi-Cal Conditions of Participation, and ensures the agency operates in full compliance with federal and California law.

## 3. Minimum Qualifications

| Requirement | Specification |
| --- | --- |
| Education | Bachelor's degree in healthcare administration, nursing, business, public health, or related field required. Master's degree preferred. |
| Experience | Minimum 2 years of supervisory or management experience in a Medicare-certified home health agency or comparable healthcare setting. |
| Licensure | California Home Health Agency Administrator designation or RN license preferred. No specific California license required beyond meeting competency standards. |
| Background | Successful clearance of criminal background check, OIG/SAM exclusion screening, and DMV check per HR-TA-002 and HR-TA-003. |

## 4. Essential Job Functions
4.1 Provides overall administrative and operational leadership for Care Indeed Home Health Care, Inc.
4.2 Ensures continuous compliance with 42 CFR Part 484 (Home Health Conditions of Participation), California Title 22 CCR regulations, HIPAA, and all applicable state and federal laws.
4.3 Develops and monitors the annual operating budget, financial forecasts, and capital expenditure plans in coordination with the Finance Director per FN-FP-001.
4.4 Hires, orients, supervises, and evaluates all department heads and direct reports per HR-ER-001 and HR-TA-001.
4.5 Reports to the Governing Body at least quarterly; prepares and presents operational, financial, quality, and compliance reports per GV-GB-001.
4.6 Ensures that all clinical, administrative, and support policies are current, approved, and implemented agency-wide.
4.7 Leads emergency preparedness planning and serves as the Incident Command System (ICS) lead per RM-EP-001.
4.8 Executes contracts and binds the agency in legal agreements per EN-LC-001.
4.9 Ensures patient rights are protected and grievances are resolved per CL-PR-001 and OP-PA-001.
4.10 Designates an Administrator Designee (HR-JD-002) in writing who can act with full authority during any absence.

## 5. Physical Requirements
Must be able to work in an office environment; occasional travel to patient homes and community/regulatory meetings may be required. No physical patient care functions.

## 6. Regulatory References
42 CFR § 484.115(a) — Administrator qualifications; 42 CFR § 484.105 — Organization and administration.

## 7. Cross-Referenced Policies
HR-JD-000, HR-JD-002, GV-GB-001, HR-TA-001, HR-TA-002, HR-TA-003, FN-FP-001, RM-EP-001.

## 8. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-JD-001

# POLICY HR-JD-002
# Administrator Designee
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-JD-002 |
| Title | Administrator Designee — Job Description |
| Domain | HR — Human Resources |
| Subdomain | JD — Job Descriptions |
| Classification Tier | ESSENTIAL |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Approved By | HR Director / Administrator — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director |
| Status | ACTIVE |

## 2. Position Summary
The Administrator Designee serves as the acting administrator of Care Indeed Home Health Care, Inc. in the absence of the Administrator. Per 42 CFR § 484.115(a), the agency must designate an Administrator Designee who meets the same qualifications as the Administrator and who can act with full administrative authority when the Administrator is unavailable.

## 3. Minimum Qualifications

| Requirement | Specification |
| --- | --- |
| Education | Bachelor's degree in healthcare administration, nursing, or related field. |
| Experience | Minimum 1 year in home health administrative or clinical management role. |
| Designation | Must be designated in writing by the Administrator; designation updated annually or upon change. |
| Background | OIG/SAM exclusion screening per HR-TA-003. |

## 4. Essential Job Functions
4.1 Assumes all administrative authority and responsibilities of the Administrator during planned or unplanned absences.
4.2 Maintains current knowledge of all agency policies, regulatory requirements, and operational procedures.
4.3 Ensures continuity of patient care services and regulatory compliance during Administrator absence.
4.4 Serves as primary contact for regulatory surveyors and emergency situations when the Administrator is unavailable.
4.5 Executes day-to-day operational decisions within the authority granted by the Administrator.

## 5. Regulatory References
42 CFR § 484.115(a) — Designee requirements.

## 6. Cross-Referenced Policies
HR-JD-000, HR-JD-001, HR-TA-002, HR-TA-003.

## 7. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-JD-002

# POLICY HR-JD-003
# Director of Nursing / Clinical Manager
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-JD-003 |
| Title | Director of Nursing / Clinical Manager — Job Description |
| Domain | HR — Human Resources |
| Subdomain | JD — Job Descriptions |
| Classification Tier | REQUIRED |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Approved By | HR Director / Administrator — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director |
| Status | ACTIVE |

## 2. Position Summary
The Director of Nursing (DON) / Clinical Manager is the licensed nurse executive responsible for the overall management, supervision, and quality of all clinical services provided by Care Indeed Home Health Care, Inc. The DON is directly accountable for clinical policy implementation, nursing staff competency, OASIS accuracy, patient safety, and compliance with all Medicare clinical Conditions of Participation. Per 42 CFR § 484.115(b), the DON must be a licensed physician, registered nurse, or other qualified health professional.

## 3. Minimum Qualifications

| Requirement | Specification |
| --- | --- |
| Education | Bachelor of Science in Nursing (BSN) required; Master of Science in Nursing (MSN) or MBA/MHA preferred. |
| Experience | Minimum 2 years clinical nursing experience in home health or similar setting; minimum 1 year in a supervisory or management capacity. |
| Licensure | Active, unencumbered California Registered Nurse (RN) license required. OASIS certification preferred (COQS). |
| Background | Background check, OIG/SAM, and NPI verification per HR-TA-002 and HR-TA-003. |

## 4. Essential Job Functions
4.1 Provides clinical leadership and direction to all nursing staff, therapists, Home Health Aides, and Medical Social Workers.
4.2 Oversees and is accountable for the accuracy of all OASIS assessments and plan of care development per CL-OA-001 and CL-CP-001.
4.3 Ensures clinical staff competency through orientation, ongoing education, and annual competency evaluations per HR-TA-005 and HR-TD-001.
4.4 Reviews and approves all clinical policies annually.
4.5 Supervises clinical staff; conducts or oversees clinical supervisory visits per CL-SD-006.
4.6 Investigates clinical complaints, adverse events, and near misses; implements corrective action per QA-AE-004 and QA-PG-001.
4.7 Serves as the QAPI clinical lead; reports clinical quality metrics to the Administrator and Governing Body quarterly.
4.8 Ensures 24/7 availability of skilled nursing services per 42 CFR § 484.30(c).
4.9 Reviews and approves admission, recertification, and discharge decisions.
4.10 Designates a Clinical Designee (HR-JD-004) to act in their absence.

## 5. Regulatory References
42 CFR § 484.115(b); Title 22 CCR § 74703; BRN requirements for California RNs.

## 6. Cross-Referenced Policies
HR-JD-000, HR-JD-004, HR-TA-005, HR-TD-001, CL-OA-001, CL-CP-001, QA-AE-004, QA-PG-001.

## 7. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-JD-003

# POLICY HR-JD-004
# Clinical Designee
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-JD-004 |
| Title | Clinical Designee — Job Description |
| Domain | HR — Human Resources |
| Subdomain | JD — Job Descriptions |
| Classification Tier | ESSENTIAL |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Approved By | HR Director / Administrator — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director |
| Status | ACTIVE |

## 2. Position Summary
The Clinical Designee is the licensed clinical staff member designated in writing by the Director of Nursing to act in the DON's absence. The Clinical Designee assumes clinical management authority and responsibilities, including clinical decision-making, staff supervision, and regulatory response during the DON's unavailability.

## 3. Minimum Qualifications

| Requirement | Specification |
| --- | --- |
| Education | Associate Degree in Nursing (ADN) minimum; BSN preferred. |
| Experience | Minimum 1 year home health clinical nursing experience. |
| Licensure | Active California RN license required. LVN may serve in a limited, defined designee capacity per agency scope. |
| Designation | Written designation by DON; updated annually or upon change. |

## 4. Essential Job Functions
4.1 Assumes clinical management authority in the DON's absence.
4.2 Provides clinical supervision and guidance to nursing staff, HHAs, and other clinicians.
4.3 Reviews and approves urgent clinical decisions during DON absence.
4.4 Serves as on-call clinical resource for after-hours clinical questions.

## 5. Cross-Referenced Policies
HR-JD-000, HR-JD-003, HR-TA-002, HR-TA-003.

## 6. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-JD-004

# POLICY HR-JD-007
# Home Health Aide
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-JD-007 |
| Title | Home Health Aide — Job Description |
| Domain | HR — Human Resources |
| Subdomain | JD — Job Descriptions |
| Classification Tier | REQUIRED |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Approved By | HR Director / Administrator — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director |
| Status | ACTIVE |

## 2. Position Summary
The Home Health Aide (HHA) provides personal care, homemaker assistance, and supportive services to patients in their homes under the supervision of a Registered Nurse, as authorized in the patient's plan of care. The HHA is NOT a licensed healthcare professional and may only perform tasks specifically delegated by and supervised by the RN within the plan of care. The HHA is the primary contact for many patients and plays a critical role in monitoring changes in patient condition and communicating them to the supervising nurse.

## 3. Minimum Qualifications

| Requirement | Specification |
| --- | --- |
| Education | High school diploma or GED preferred. |
| Certification | California HHA certification (minimum 75-hour training program per 42 CFR § 484.80(a)) required. CDPH-approved training program. |
| Competency | Must pass written and skills competency evaluation per CL-SD-006 prior to patient assignment. |
| Background | Fingerprinting, background check (DOJ/FBI), OIG/SAM, and TB test per HR-TA-002, HR-TA-003. |
| Physical | Ability to lift 25 lbs; stand/walk for extended periods; perform personal care tasks. |

## 4. Essential Job Functions
4.1 Provides personal care services as directed in the plan of care: bathing, grooming, oral hygiene, dressing, ambulation assistance, transferring, range of motion exercises (passive), bowel/bladder care.
4.2 Assists with light homemaker activities as authorized in the plan of care: light housekeeping, laundry, meal preparation, medication reminders (not administration).
4.3 Documents all services provided at each visit in the agency's EHR per CL-CD-001 and CL-CD-004.
4.4 Reports any changes in patient condition, environment, safety concerns, or behavioral changes to the supervising RN immediately. Does NOT make clinical assessments or judgments.
4.5 Participates in supervisory visits per CL-SD-006 and demonstrates ongoing competency.
4.6 Completes annual in-service training requirements per HR-TD-001 (minimum 12 hours/year per 42 CFR § 484.80(b)).
4.7 Maintains patient privacy and confidentiality per CO-HP-001.
4.8 Does NOT: administer medications, perform skilled nursing tasks, change sterile dressings, operate clinical equipment beyond patient-specific training, or make clinical decisions.

## 5. Scope of Practice Boundaries

| Permitted | Prohibited |
| --- | --- |
| Personal care, bathing, grooming | Medication administration (any route) |
| Range of motion exercises (passive) | Wound care/dressing changes (sterile) |
| Meal preparation, light housekeeping | IV line management |
| Medication reminders | Clinical assessment or documentation of clinical findings |
| Reporting observations to RN | Signing Plan of Care or physician orders |

## 6. Supervision Requirements
HHAs shall receive a supervisory visit by the RN at minimum every 14 days per CL-SD-006 and 42 CFR § 484.80(d).

## 7. Regulatory References
42 CFR § 484.80 — Home health aide requirements; Title 22 CCR § 74718; California BRN HHA certification standards.

## 8. Cross-Referenced Policies
HR-JD-000, CL-SD-006, CL-CD-001, HR-TD-001, CO-HP-001, HR-TA-002, RM-SS-001.

## 9. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-JD-007

# POLICY HR-JD-011
# Medical Social Worker
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-JD-011 |
| Title | Medical Social Worker — Job Description |
| Domain | HR — Human Resources |
| Subdomain | JD — Job Descriptions |
| Classification Tier | REQUIRED |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Approved By | HR Director / Administrator — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director |
| Status | ACTIVE |

## 2. Position Summary
The Medical Social Worker (MSW) provides medical social services to patients receiving home health care to assist in resolving social, emotional, and environmental factors that affect or impair the patient's ability to benefit from medical treatment. Per 42 CFR § 484.115(e), the MSW must have at minimum a baccalaureate degree in social work (BSW) or a related behavioral science field. Medical social services are a separately billable Medicare Part A skilled service when medically necessary.

## 3. Minimum Qualifications

| Requirement | Specification |
| --- | --- |
| Education | Bachelor of Social Work (BSW) from CSWE-accredited program required; Master of Social Work (MSW) preferred. |
| Licensure | California LCSW (Licensed Clinical Social Worker) or ACSW (Associate Clinical Social Worker) preferred; BSW acceptable per 42 CFR § 484.115(e). |
| Experience | Minimum 1 year in medical social work or community case management preferred. |
| Background | OIG/SAM, background check per HR-TA-002 and HR-TA-003. |

## 4. Essential Job Functions
4.1 Completes social work assessments for referred patients to identify social, emotional, financial, environmental, and cultural factors affecting the patient's health and recovery.
4.2 Develops individualized social service plans as part of the interdisciplinary care plan per CL-CP-003.
4.3 Assists patients and families in accessing community resources: housing, food assistance, transportation, home modification, caregiver support, financial assistance programs.
4.4 Provides counseling and supportive therapy to patients and families coping with chronic illness, disability, and end-of-life issues.
4.5 Facilitates advance directive discussions and assists patients in understanding their options per CL-PR-002.
4.6 Coordinates care transitions: discharge planning, facility placement, community referrals.
4.7 Identifies and reports suspected elder/dependent adult abuse per HR-ER-009.
4.8 Documents all patient contacts and interventions per CL-CD-001 within 24 hours per CL-CD-004.
4.9 Participates in interdisciplinary case conferences per CL-CP-003.

## 5. Scope of Practice
The MSW provides social, not medical, services. MSWs may not perform clinical nursing or therapy procedures. All recommendations for changes to the medical plan of care shall be communicated to the DON or treating physician.

## 6. Regulatory References
42 CFR § 484.115(e) — Medical Social Worker qualifications; 42 CFR § 484.60(b) — Social services in care planning; Title 22 CCR § 74715.

## 7. Cross-Referenced Policies
HR-JD-000, HR-JD-003, CL-CP-003, CL-CD-001, CL-PR-002, HR-ER-009, HR-TD-001.

## 8. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-JD-011

# POLICY HR-WM-001
# Staffing Levels & Workload Management
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-WM-001 |
| Title | Staffing Levels & Workload Management |
| Domain | HR — Human Resources |
| Subdomain | WM — Workforce Management |
| Classification Tier | REQUIRED |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Approved By | HR Director / Administrator — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director / DON |
| Status | ACTIVE |

## 2. Purpose
This policy establishes requirements for maintaining adequate staffing levels to provide safe, high-quality, continuous home health services to all patients of Care Indeed Home Health Care, Inc. in compliance with 42 CFR § 484.105 (Organization and Administration) and California Title 22 CCR § 74731. Unsafe staffing levels are a patient safety risk and a Conditions of Participation deficiency. The agency must demonstrate at all times that sufficient qualified staff are available to meet patient care needs.

## 3. Scope
All clinical and administrative positions. HR Director and DON are co-responsible for staffing management.

## 4. Policy Statements
4.1 The agency shall at all times maintain sufficient qualified staff to provide all services required by the plans of care of currently admitted patients.
4.2 Minimum staffing requirements:
(a) At least one RN shall be on-call 24 hours per day, 7 days per week per 42 CFR § 484.30(c);
(b) The DON position shall not remain vacant for more than 30 days without an approved interim designee plan;
(c) At least one Medicare-qualified RN shall be on the agency's payroll or under a written contractual arrangement at all times.
4.3 The DON shall maintain a staffing plan that projects patient census, visit volume, and required clinical FTE for 30, 60, and 90 days rolling.
4.4 When census or acuity increases require additional staff, the DON shall notify the Administrator and initiate recruitment per HR-TA-001 before the deficit becomes a patient care risk.
4.5 Per diem and contracted staff shall be used to supplement (not replace) regular staff. Contracted clinical staff shall meet the same qualifications and screening requirements as employees per HR-WM-002.
4.6 Clinician caseloads shall be monitored to ensure: (a) no RN carries more than a reasonably manageable caseload (typically 25-30 active patients per case manager, depending on acuity); (b) overtime shall not be regularly used to compensate for understaffing; (c) high-acuity patients receive priority scheduling.
4.7 Staffing data shall be reported to the QAPI committee and Governing Body quarterly as part of the operational report.

## 5. Cross-Referenced Policies
HR-JD-003, HR-TA-001, HR-WM-002, QA-PG-001, GV-GB-001.

## 6. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-WM-001

# POLICY HR-WM-002
# Contractor & Per Diem Staff Management
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-WM-002 |
| Title | Contractor & Per Diem Staff Management |
| Domain | HR — Human Resources |
| Subdomain | WM — Workforce Management |
| Classification Tier | REQUIRED |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director |
| Status | ACTIVE |

## 2. Purpose
This policy establishes requirements for managing independent contractors, per diem staff, and contracted agency personnel used by Care Indeed Home Health Care, Inc. Proper management of non-employee clinical staff ensures patient safety, regulatory compliance, and legal classification under California AB5 (California Labor Code § 2750.3).

## 3. Policy Statements
3.1 All contracted or per diem clinical staff shall meet the same qualification, credentialing, background check, and OIG/SAM exclusion screening requirements as full-time employees per HR-TA-001 through HR-TA-004.
3.2 Written contractual agreements shall be executed for all contracted staff and agencies, specifying: scope of services, qualifications required, compliance obligations, and insurance requirements per EN-LC-001.
3.3 The agency shall not use any contracted staff member who has been excluded from federal healthcare programs per OIG LEIE/SAM checks performed at least every 60 days per HR-TA-003.
3.4 Contracted staff working under Medicare certification shall comply with all CoP requirements applicable to their discipline.
3.5 Per diem staff shall receive agency-specific orientation and documentation training before beginning patient care assignments.
3.6 Worker classification (employee vs. independent contractor) shall comply with California Labor Code § 2750.3 (ABC Test). Misclassification is an administrative and criminal violation.

## 4. Cross-Referenced Policies
HR-TA-001, HR-TA-002, HR-TA-003, HR-WM-001, EN-LC-001.

## 5. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-WM-002

# POLICY HR-WM-003
# Employee Health & Immunization Requirements
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-WM-003 |
| Title | Employee Health & Immunization Requirements |
| Domain | HR — Human Resources |
| Subdomain | WM — Workforce Management |
| Classification Tier | REQUIRED |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director / DON |
| Status | ACTIVE |

## 2. Purpose
This policy establishes pre-employment and annual health and immunization requirements for all Care Indeed Home Health Care, Inc. employees who may have direct or indirect patient contact. These requirements protect patients, who are often immunocompromised, from communicable diseases transmitted by healthcare workers, and protect staff from occupational infectious disease exposure in compliance with Title 22 CCR § 74733 and Cal/OSHA bloodborne pathogen standards (8 CCR § 5193).

## 3. Required Health Screenings (Pre-Employment)

| Test/Screening | Requirement | Action if Positive/Non-Compliant |
| --- | --- | --- |
| Tuberculosis (TB) Screen | Two-step TB test (TST) or IGRA (QuantiFERON) within 90 days of hire | Chest X-ray required; clearance by physician before patient contact |
| Influenza Vaccine | Annual influenza vaccination (Sept–March) required OR signed declination form | Declination requires masking during influenza season per RM-SS-002 |
| COVID-19 Vaccination | Per current CDPH and CMS guidance | Declination per agency procedure and CMS waiver process |
| Hepatitis B Vaccine | Recommended; series offered per OSHA bloodborne pathogen standard | Offer and document acceptance or refusal |
| Physical Health Assessment | Attestation of ability to perform essential job functions | Medical clearance if condition identified |

## 4. Annual Requirements
4.1 Annual TB screening (TST or symptom review per CDC guidelines for tested-positive employees) for all staff.
4.2 Annual influenza vaccination or declination.
4.3 Review and update of immunization records at annual performance review.

## 5. Confidentiality
Employee health records are maintained separately from personnel files and are protected under HIPAA and California Confidentiality of Medical Information Act (CMIA). Access is limited to HR Director, DON, and medical personnel.

## 6. Cross-Referenced Policies
HR-TA-001, HR-WM-004, HR-WM-007, RM-SS-001, RM-SS-002, CL-SD-016.

## 7. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-WM-003

# POLICY HR-WM-004
# Workplace Safety & Injury Prevention
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-WM-004 |
| Title | Workplace Safety & Injury Prevention |
| Domain | HR — Human Resources |
| Subdomain | WM — Workforce Management |
| Classification Tier | REQUIRED |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director |
| Status | ACTIVE |

## 2. Purpose
This policy establishes the framework for workplace safety, injury prevention, and occupational health at Care Indeed Home Health Care, Inc. in compliance with Cal/OSHA requirements, specifically the Injury and Illness Prevention Program (IIPP) mandate under 8 CCR § 3203 and the corresponding policy RM-OS-101. This policy covers agency-specific HR obligations including incident reporting, workers' compensation management, and return-to-work programs.

## 3. Policy Statements
3.1 Care Indeed Home Health Care, Inc. shall maintain and implement a current Injury and Illness Prevention Program (IIPP) per RM-OS-101 and Cal/OSHA 8 CCR § 3203.
3.2 All work-related injuries and illnesses shall be reported immediately by the employee to their supervisor and HR. The supervisor shall complete a First Report of Injury (DWC-1) within 24 hours and submit to workers' compensation carrier.
3.3 The agency shall provide workers' compensation coverage for all employees per California Labor Code §§ 3200–4461.
3.4 Injured employees shall receive information about their rights under California workers' compensation law at hire and at the time of injury.
3.5 A return-to-work program shall be available for injured employees, including light-duty assignments when medically appropriate, to support recovery and maintain employment.
3.6 No employee shall be retaliated against for reporting a workplace injury in good faith.
3.7 Workplace safety hazard reports shall be investigated within 5 business days. Serious/imminent hazards shall be corrected immediately.
3.8 Annual workplace safety training shall be provided per HR-TD-001 and RM-OS-101.

## 4. Cross-Referenced Policies
RM-OS-101, RM-SS-001, RM-SS-002, HR-WM-003, HR-TD-001, HR-ER-003.

## 5. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-WM-004

# POLICY HR-WM-005
# Employee Personnel File Management
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-WM-005 |
| Title | Employee Personnel File Management |
| Domain | HR — Human Resources |
| Subdomain | WM — Workforce Management |
| Classification Tier | ESSENTIAL |
| Access Tier | Tier 3 — Confidential |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director |
| Status | ACTIVE |

## 2. Purpose
This policy establishes requirements for creating, maintaining, securing, and providing access to employee personnel files at Care Indeed Home Health Care, Inc. in compliance with California Labor Code § 1198.5, which grants employees the right to inspect and receive copies of their personnel file, and Title 22 CCR § 74733, which specifies personnel file requirements for licensed home health agencies.

## 3. Policy Statements
3.1 A personnel file shall be created for every employee on the first day of employment and maintained throughout employment and for the retention period specified in CO-HP-007 (minimum 3 years after separation for general records; 7 years for licensed staff).
3.2 Personnel files shall be stored securely, either as locked physical files or in an access-controlled electronic HR system. Personnel files are confidential.
3.3 Required content per HR-WM-007.
3.4 Medical information (physical exam, TB, immunization records) shall be stored in a SEPARATE medical file, not the personnel file, per ADA requirements and CMIA.
3.5 Employees have the right to inspect their personnel file and obtain one copy per year at no charge within 30 days of written request (Labor Code § 1198.5(b)).
3.6 Personnel files shall not be provided to third parties without: (a) employee written authorization; (b) court order or legal subpoena; or (c) as required by law for regulatory survey or audit.
3.7 The HR Director shall conduct an annual audit to verify completeness and security of all personnel files.

## 4. Cross-Referenced Policies
HR-WM-007, HR-TA-001–HR-TA-006, CO-HP-001, CO-HP-007.

## 5. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-WM-005

# POLICY HR-WM-006
# Volunteer Management & Oversight
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-WM-006 |
| Title | Volunteer Management & Oversight |
| Domain | HR — Human Resources |
| Subdomain | WM — Workforce Management |
| Classification Tier | SUPPLEMENTAL |
| Access Tier | Tier 2 — Restricted |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director |
| Status | ACTIVE |

## 2. Purpose
This policy establishes the framework for recruiting, screening, training, supervising, and managing volunteers at Care Indeed Home Health Care, Inc. in compliance with 42 CFR § 484.105(c), which requires that the agency maintain written policies and procedures governing the use of volunteers in agency operations.

## 3. Policy Statements
3.1 Care Indeed Home Health Care, Inc. may engage volunteers to support non-clinical administrative or community activities. Volunteers shall NOT provide direct patient care.
3.2 All volunteers shall complete: (a) a volunteer application; (b) a background check (DOJ/FBI) if they will have access to patient information or the agency office; (c) HIPAA training per CO-HP-001; (d) orientation to agency policies and expected conduct.
3.3 Volunteers shall NOT have access to patient clinical records, except as specifically authorized and with appropriate safeguards per HIPAA.
3.4 Volunteers are not employees and shall not receive compensation. Volunteer status shall be clearly documented.
3.5 The HR Director or designee shall supervise all volunteer activities and maintain a volunteer activity log.
3.6 Volunteers shall sign a confidentiality agreement before beginning any agency activities.

## 4. Cross-Referenced Policies
HR-TA-001, HR-TA-002, CO-HP-001.

## 5. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-WM-006

# POLICY HR-WM-007
# Personnel File Content & Compliance
## 1. Policy Header

| Field | Value |
| --- | --- |
| Policy ID | HR-WM-007 |
| Title | Personnel File Content & Compliance |
| Domain | HR — Human Resources |
| Subdomain | WM — Workforce Management |
| Classification Tier | REQUIRED |
| Access Tier | Tier 3 — Confidential |
| Version | 6.0 |
| Effective Date | 2025-07-10 |
| Review Cycle | Annual |
| Policy Owner/Steward | HR Director |
| Status | ACTIVE |

## 2. Purpose
This policy defines the specific content required in every employee personnel file and separates documents appropriately per legal and regulatory requirements. A complete, organized personnel file is the primary evidence presented during a Medicare regulatory survey to demonstrate compliance with 42 CFR § 484.115 (Personnel Qualifications) and Title 22 CCR § 74733.

## 3. Required Personnel File Content

| Document | Required For | Location |
| --- | --- | --- |
| Signed employment application / resume | All | Personnel File |
| Signed offer letter | All | Personnel File |
| Current, signed job description | All | Personnel File |
| Form I-9 (Employment Eligibility Verification) | All | Separate I-9 File |
| Form W-4 | All | Payroll File |
| Background check results | All | Personnel File (sealed) |
| OIG/SAM exclusion check results | All | Compliance File |
| License/certification verification (copy + primary source verification) | Licensed staff | Personnel File |
| National Practitioner Identifier (NPI) if applicable | Billing clinicians | Compliance File |
| CPR certification (if required) | Clinical staff | Personnel File |
| TB test results | Clinical/direct care | Medical File (separate) |
| Immunization records | Clinical/direct care | Medical File (separate) |
| Signed confidentiality/HIPAA agreement | All | Personnel File |
| Signed employee handbook acknowledgment | All | Personnel File |
| Signed policy acknowledgment forms | All | Personnel File |
| Orientation checklist, signed | All | Personnel File |
| Competency evaluation records | Clinical staff | Competency File |
| Annual performance evaluations | All | Personnel File |
| Training records (HR-TD-001 completion) | All | Training File |
| Any disciplinary documentation | If applicable | Personnel File (sealed) |
| Separation/resignation documentation | Upon separation | Personnel File |
| Reference check documentation | All | Personnel File |

## 4. Policy Statements
4.1 Personnel files shall be organized in the order specified above and audited annually for completeness by the HR Director.
4.2 Any missing required document shall be obtained from the employee within 10 business days of discovery. Failure to maintain complete personnel files constitutes a survey-level deficiency.
4.3 Documents in separate files (I-9, medical, competency) shall be referenced in the personnel file index.
4.4 All licensed or certified staff shall have primary-source verification of their license/certification performed: (a) at hire; (b) annually; (c) any time a license is due for renewal per HR-TA-004.

## 5. Cross-Referenced Policies
HR-WM-005, HR-TA-001–HR-TA-006, CO-HP-007.

## 6. Acknowledgment

| Full Name (Printed) | __________________ | Signature | __________________ | Date | ________ |
| --- | --- | --- | --- | --- | --- |

END OF POLICY HR-WM-007
"""

# ===========================================================================
# RM DOMAIN POLICIES (format: # POLICY: RM-EP-002 — Title / ## Policy Header H2)
# ===========================================================================

RM_POLICIES = """

# POLICY: RM-EP-002 — Emergency Preparedness Training & Testing Program
## Policy Header

| Field | Value |
| --- | --- |
| Policy ID | RM-EP-002 |
| Title | Emergency Preparedness Training & Testing Program |
| Domain | RM — Risk Management & Safety |
| Subdomain | EP — Emergency Preparedness |
| Classification Tier | REQUIRED |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 2 — Restricted |
| Policy Owner / Steward | Administrator / DON |
| Effective Date | 2025-07-10 |
| Version | 6.0 |
| Approved By | Governing Body Chair — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Supersedes | N/A (Initial Version) |

## 1. Purpose
This policy establishes requirements for emergency preparedness training, testing, and exercise activities for all Care Indeed Home Health Care, Inc. employees in compliance with 42 CFR § 484.102(d), the CMS Emergency Preparedness Rule (81 FR 63860), and California Department of Public Health emergency preparedness requirements. Training and testing ensure that all staff can effectively execute the agency's Emergency Operations Plan (RM-EP-001) during actual emergencies, protecting patients, staff, and the community.

## 2. Scope
All employees of Care Indeed Home Health Care, Inc. regardless of position or employment status (full-time, part-time, per diem). Contracted clinical staff shall receive equivalent training from the agency.

## 3. Policy Statements
3.1 Initial Training: All new employees shall complete emergency preparedness orientation training during the onboarding process before beginning independent patient care assignments per HR-TA-005. Initial training shall cover at minimum:
(a) The agency's Emergency Operations Plan (RM-EP-001) and each employee's specific role;
(b) Chain of command and communication procedures during emergencies;
(c) Incident Command System (ICS) basics;
(d) Patient population-specific emergency risks (electrical-dependent patients, mobility-limited patients);
(e) Personal protective equipment (PPE) use per RM-SS-002;
(f) Evacuation and shelter-in-place procedures.

3.2 Annual Training: All employees shall complete at minimum annual emergency preparedness training covering updates to the Emergency Operations Plan and any lessons learned from prior exercises.

3.3 Exercises: The agency shall conduct at least two (2) emergency preparedness exercises per year as required by 42 CFR § 484.102(d)(2):
(a) Exercise 1: A community-based full-scale exercise OR, if a community exercise is not available, a facility-based full-scale exercise.
(b) Exercise 2: If Exercise 1 was a full-scale exercise, Exercise 2 may be a tabletop exercise conducted at the executive/management level. If Exercise 1 was a community exercise, Exercise 2 must be a facility-based full-scale or functional exercise.

3.4 After-Action Review (AAR): Each exercise shall be followed by a formal AAR within 30 days. The AAR shall: (a) identify performance strengths; (b) identify gaps and deficiencies; (c) develop corrective action items with responsible parties and due dates; (d) be documented and retained per CO-HP-007; (e) be reported to the Governing Body.

3.5 Documentation: All training completions and exercise participation shall be documented by HR in the agency's training records system. Documentation shall include: employee name, date, training/exercise type, duration, and competency assessment result if applicable.

3.6 Corrective Actions: Deficiencies identified in exercises shall be incorporated into updates to the Emergency Operations Plan (RM-EP-001) within 60 days of the AAR.

## 4. Training & Exercise Schedule

| Training/Exercise | Frequency | Responsible Party | Documentation |
| --- | --- | --- | --- |
| New hire EP orientation | At hire | HR / DON | Orientation checklist |
| Annual EP training (all staff) | Annual | HR / Administrator | Training records system |
| Exercise 1 (full-scale or community) | Annual | Administrator | AAR report |
| Exercise 2 (tabletop or full-scale) | Annual | Administrator | AAR report |

## 5. Compliance & Regulatory References

| Regulation | Requirement |
| --- | --- |
| 42 CFR § 484.102(d) | Emergency Preparedness training and testing |
| CMS EP Final Rule (81 FR 63860) | Annual training and exercise requirements |
| California Title 22 | State EP requirements |
| NIMS / ICS | Federal incident command system |

## 6. Cross-Referenced Policies
RM-EP-001, RM-EP-003, HR-TA-005, HR-TD-001, QA-PG-001, GV-GB-001.

## 7. Acknowledgment

| Field | Value |
| --- | --- |
| Full Name (Printed) | ________________________________ |
| Title / Role | ________________________________ |
| Signature | ________________________________ |
| Date Signed | //________ |

---

# POLICY: RM-EP-003 — Patient Emergency Communication Plan
## Policy Header

| Field | Value |
| --- | --- |
| Policy ID | RM-EP-003 |
| Title | Patient Emergency Communication Plan |
| Domain | RM — Risk Management & Safety |
| Subdomain | EP — Emergency Preparedness |
| Classification Tier | REQUIRED |
| Status | ACTIVE |
| Review Cycle | Annual |
| Access Tier | Tier 2 — Restricted |
| Policy Owner / Steward | Administrator / DON |
| Effective Date | 2025-07-10 |
| Version | 6.0 |
| Approved By | Governing Body Chair — Care Indeed Home Health Care, Inc. |
| Last Reviewed | 2025-07-10 |
| Next Review Date | 2026-07-10 |
| Supersedes | N/A (Initial Version) |

## 1. Purpose
This policy establishes the agency's plan for communicating with and providing care to patients during and following emergencies, disasters, and other disruptions that affect the delivery of home health services. Per 42 CFR § 484.102(c), Care Indeed Home Health Care, Inc. must maintain an all-hazards communication plan that addresses patients' needs in the event of a disruption to normal operations. Patients who depend on home health services — particularly those with electrical-dependent equipment, mobility limitations, or limited social support — are among the most vulnerable populations during any emergency.

## 2. Scope
All patients currently receiving home health services from Care Indeed Home Health Care, Inc. and all clinical and administrative staff responsible for patient communication and care coordination.

## 3. Policy Statements
3.1 Patient Risk Assessment: At admission, the admitting RN shall complete a Patient Emergency Risk Assessment as part of the standard intake process. The assessment shall document:
(a) Electrical-dependent equipment in use (oxygen concentrator, ventilator, suction machine, hospital bed, lifts);
(b) Mobility status: ambulatory, wheelchair-dependent, bed-bound, ability to self-evacuate;
(c) Communication limitations: language, hearing, vision, cognitive impairment;
(d) Social support: emergency contact name, relationship, phone number; availability of caregiver;
(e) Geographic risk: location in flood zone, wildfire risk area, or mobile home/manufactured housing;
(f) Utility dependency: whether equipment or medications require refrigeration.

3.2 Patient Emergency Communication System: The agency shall maintain a current patient census in electronic format that enables rapid communication to all active patients during an emergency, including:
(a) A robocall/automated notification capability OR a manual call tree for all active patients;
(b) The ability to triage and prioritize outreach to the highest-risk patients (electrical-dependent, isolated, high-acuity) within the first 2 hours of an emergency.

3.3 Communication Procedures During Emergency:
(a) Within 2 hours of activating the Emergency Operations Plan (RM-EP-001), the Administrator or designee shall initiate patient notification to advise patients of any service disruption, estimated restoration, and emergency contact procedures.
(b) High-risk patients (electrical-dependent, bed-bound) shall receive direct personal contact (phone call) within the first 2 hours; remaining patients may be reached by automated notification.
(c) Patients who cannot be reached shall be flagged for emergency welfare check within 4 hours.

3.4 Utility-Dependent Patients: Patients using electrical medical equipment shall be: (a) registered with their local utility company as a Medical Baseline or Life Support customer; (b) advised to register with county/city emergency management for welfare check programs; (c) included in the highest-priority tier for emergency outreach.

3.5 Coordination with Local Emergency Management:
The agency shall maintain working relationships with: (a) Local Health Department emergency preparedness program; (b) County Office of Emergency Services; (c) Local utility companies' medical baseline programs; (d) Community Partners for Emergency Response (CPER) and local evacuation resources.

3.6 Continuity of Care: When a patient must be evacuated or cannot be reached during an emergency, the DON shall coordinate care continuity including: (a) transfer of care documentation to any receiving facility; (b) medication bridge supply arrangements; (c) coordination with treating physician regarding service interruption; (d) documentation of all emergency-related care actions in the clinical record per CL-CD-001.

3.7 Patients Who Relocate During Emergency: A patient who relocates during a declared emergency (e.g., evacuation to shelter or family home) shall be contacted within 24 hours. If the relocation places them outside the agency's service area, the agency shall assist in transferring their care to an appropriate local provider.

3.8 Post-Emergency Review: Within 30 days of any significant emergency event requiring activation of this plan, the Administrator shall conduct a post-event review documenting: patients contacted, patients unreachable, services disrupted, care continuity measures taken, and lessons learned.

## 4. Patient Risk Tier Classification

| Risk Tier | Criteria | Priority Contact |
| --- | --- | --- |
| TIER 1 — Critical | Electrical-dependent equipment; bed-bound; no caregiver; remote/at-risk location | Personal call within 2 hours |
| TIER 2 — High | Limited mobility; lives alone; language barrier; cognitively impaired | Personal call within 4 hours |
| TIER 3 — Standard | Ambulatory; has caregiver; no electrical equipment dependency | Automated notification; personal call within 8 hours |

## 5. Compliance & Regulatory References

| Regulation | Requirement |
| --- | --- |
| 42 CFR § 484.102(c) | Patient emergency communication plan |
| 42 CFR § 484.102(b)(3) | Patient population emergency needs assessment |
| HIPAA § 164.312 | Electronic PHI emergency access procedures |
| CMS EP Final Rule | All-hazards approach to patient communication |

## 6. Cross-Referenced Policies
RM-EP-001, RM-EP-002, CL-CA-001, CL-CD-001, OP-FM-005, IT-BCP-001.

## 7. Acknowledgment

| Field | Value |
| --- | --- |
| Full Name (Printed) | ________________________________ |
| Title / Role | ________________________________ |
| Signature | ________________________________ |
| Date Signed | //________ |

"""


def append_to_file(filepath, content, tag):
    with open(filepath, 'a', encoding='utf-8') as f:
        f.write('\n\n')
        f.write(content)
    print(f'Appended {tag} to {os.path.basename(filepath)}')


# Execute
append_to_file(CL_FILE, CL_POLICIES, '7 CL policies (CD-002/003/004 + PR-001/002/003/004)')
append_to_file(HR_FILE, HR_POLICIES, '16 HR policies (ER-006/009 + JD-000-004/007/011 + WM-001-007)')
append_to_file(RM_FILE, RM_POLICIES, '2 RM policies (EP-002/003)')

print('\nAll 25 missing policies appended to source files.')
print('Next: re-run generator then build.')
