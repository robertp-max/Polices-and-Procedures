# MASTER CONTROL INVENTORY — "REQUIRED AT ALL TIMES"
**Home Health Agency — Continuous Compliance Obligations**

**Generated:** 2026-04-23
**Source Scope:** All domain workflow files in `Builder/Policies/Workflows/` (CL, CO, GV, RM, OP, QA, HR, IT, FN, EN) plus `AUDIT_REPORT.md` and `ChatGPTmandatedEvents.md`
**Extraction Rule:** Only continuous, always-on programs, systems, registers, or enforced safeguards. Event-driven workflows, one-time actions, and meeting cadences are excluded unless the underlying program itself is required to exist continuously.
**Risk Tag:** **H** = High risk if missing (Condition-Level deficiency, FCA/OCR enforcement, or patient-harm exposure). **M** = Material risk. **L** = Low/administrative risk.

---

## TABLE OF CONTENTS

1. [Patient Rights & Access](#1-patient-rights--access) — 6 controls
2. [Clinical Operations](#2-clinical-operations) — 12 controls
3. [Safety & Risk Management](#3-safety--risk-management) — 10 controls
4. [Compliance & Regulatory](#4-compliance--regulatory) — 16 controls
5. [Governance](#5-governance) — 11 controls
6. [Workforce & HR](#6-workforce--hr) — 10 controls
7. [IT & Security](#7-it--security) — 19 controls
8. [Financial / Billing](#8-financial--billing) — 10 controls
9. [Enterprise Policy & Records](#9-enterprise-policy--records) — 6 controls
10. [QAPI Program](#qapi-program) — 4 controls

**Total: 104 controls | 76 High-Risk | 26 Material | 2 Low**

---

## 1. Patient Rights & Access

| # | CONTROL NAME | DESCRIPTION | DOMAIN | SOURCE POLICY ID(s) | REGULATORY BASIS | REQUIRED OWNER | EVIDENCE REQUIRED | FAILURE RISK | RISK |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Patient Rights Notice & Admission Consent Program | Standing capability to deliver Patient Rights Notice, Admission Consent, HIPAA NPP, and Advance Directive information at or before first visit to every admitted patient. | CL / CO | CL-PA-001, CL-PA-004, CO-HP-001 | 42 CFR § 484.50; § 164.520 | Clinical Manager / Privacy Officer | Signed CL-FM-001/002/003 per patient; NPP log | Condition-level § 484.50 deficiency; HIPAA violation | H |
| 2 | Interpreter / Language Access Services | Continuously available qualified interpreter and translated-materials capability for LEP patients across all service hours. | OP | OP-LA-001 | 42 CFR § 484.50(a)(3); Title VI; § 1557 | Operations Director | Vendor contract, interpreter utilization log, translated NPP/consent stock | Discrimination finding; patient rights deficiency | H |
| 3 | Patient Complaint / Grievance Intake Mechanism | Always-on intake channel (phone, written, verbal) for patient complaints with logging and acknowledgement. | CL / QA | CL-PA-003, QA-AE-001 | 42 CFR § 484.50(e) | Clinical Manager / QAPI Lead | Grievance log (CL-FM-049), acknowledgement letters | § 484.50(e) deficiency | H |
| 4 | State Home Health Hotline Notice | Posted/provided notice of state HH hotline and patient rights contact info on all admissions. | CL / OP | CL-PA-001 | 42 CFR § 484.50(a)(1)(iv) | Intake / Clinical Manager | Admission packet sample, posted notice | Patient rights survey deficiency | M |
| 5 | Data Subject Rights (HIPAA Access/Amendment + CMIA/CCPA) Mechanism | Continuously operational process to receive, verify, route, and fulfill access/amendment/deletion requests within statutory windows. | IT / CO | IT-WF-20, CO-HP-005, CO-CA-001 | 45 CFR § 164.524, § 164.526; CMIA § 56; CCPA § 1798.100 | Privacy Officer | IT-FM-047 intake log, fulfilled requests | Private right of action; HIPAA CMP | H |
| 6 | Financial Counseling & Charity Care Program | Standing program offering good-faith estimates, financial counseling, and charity-care determinations to any patient at admission or on request. | FN | FN-BL-004, FN-BL-005 | CA H&S § 127400 analog; agency policy | CFO / Patient Financial Counselor | FN-FM-004, FN-FM-027, FN-FM-028 | Collections/reputational risk; state enforcement | M |

---

## 2. Clinical Operations

| # | CONTROL NAME | DESCRIPTION | DOMAIN | SOURCE POLICY ID(s) | REGULATORY BASIS | REQUIRED OWNER | EVIDENCE REQUIRED | FAILURE RISK | RISK |
|---|---|---|---|---|---|---|---|---|---|
| 7 | 24/7 After-Hours Clinical On-Call | Continuous 24/7/365 licensed-clinician availability for patient calls, with logging, triage, and next-business-day reconciliation. | OP / CL | OP-AH-001, CL-SD-004 | 42 CFR § 484.105; § 484.60 | Clinical Manager | On-call schedule, OP-FM-010 call log, CM daily review | Patient harm; CoP § 484.105 deficiency | H |
| 8 | OASIS Assessment, QA & Transmission Capability | Standing capability to complete, QA, lock, and transmit OASIS within 30 days; correct and retransmit as required. | CL / QA | CL-OA-001, QA-SM-001 | 42 CFR § 484.55, § 484.245 | Clinical Manager / OASIS QA | CL-FM-045 Transmission Log, CMS confirmations | APU penalty; § 484.55 deficiency | H |
| 9 | Physician Order Management System (Verbal & Written) | Continuously operational intake, routing, authentication, and tracking of physician orders; verbal orders same-day, signature within agency SLA. | CL | CL-CP-001, CL-OA-002 | 42 CFR § 484.60(b) | Clinical Manager | Order audit log, signed orders file | § 484.60 deficiency; billing/FCA exposure | H |
| 10 | Plan of Care (CMS-485) Establishment & 60-Day Review Program | Program ensuring every patient has an active, physician-signed POC and recert/review at least every 60 days. | CL | CL-CP-001 | 42 CFR § 484.60(a)-(c) | Clinical Manager | POC register, signed 485s, recert evidence | Condition-level billing & clinical deficiency | H |
| 11 | Coordination of Care & Communication Program | Standing requirement for clinician-to-clinician/physician communication within 24h of visit and documented interdisciplinary coordination. | CL | CL-CC-001 | 42 CFR § 484.60(d), § 484.75 | Clinical Manager | Care coordination notes, CL-FM-053 | § 484.75 deficiency | H |
| 12 | Home Health Aide Supervision Program (14/60-Day) | Continuous supervision cadence: RN supervisory visit every 14 days; direct on-site observation every 60 days; annual re-competency. | CL / HR | CL-SD-005, HR-TR-001 | 42 CFR § 484.80(h) | Clinical Manager / RN Instructor | CL-FM-014, CL-FM-014A, HR-FM-017 | Condition-level § 484.80 deficiency | H |
| 13 | Clinician Competency Validation Program (All Disciplines) | Ongoing initial + annual competency validation for RN, LVN/LPN, PT/PTA, OT/COTA, SLP, MSW, HHA, plus OASIS-specific. | HR / CL | HR-TR-002, CL-OA-003 | 42 CFR § 484.75, § 484.80, § 484.115 | Clinical Manager | HR-FM-020, HR-FM-017, HR-FM-021/022 | § 484.75 deficiency; billing risk | H |
| 14 | Medication Management & MAR Program | Continuous MAR maintenance; medication reconciliation at SOC/ROC/Recert; always-available med review capability. | CL | CL-SD-008 | 42 CFR § 484.60(a)(2)(v) | Clinical Manager | MAR entries, reconciliation notes | Patient harm; § 484.60 deficiency | H |
| 15 | Infection Prevention & Control Program | Agency-wide, always-active infection prevention program with standard precautions on every visit, line list surveillance, outbreak protocol. | CL / QA | CL-IC-001, QA-WF-06 | 42 CFR § 484.70 | Infection Preventionist | CL-FM-021, QA-FM-006 line list, outbreak SOP | Condition-level § 484.70 deficiency | H |
| 16 | High-Risk Patient Monitoring Capability | Continuous capability to flag and manage high-risk patients (fall, wound, sepsis, rehospitalization risk) per protocol. | CL / QA | CL-SD-009, QA-WF-06 | 42 CFR § 484.65; § 484.60 | Clinical Manager | CL-FM-047 monitoring protocol, QA dashboard | Quality/safety failure | M |
| 17 | Missed-Visit Documentation Mechanism | Continuous process to log and clinically justify any missed visit the day it occurs. | CL / QA | CL-SD-011, QA-WF-07 | 42 CFR § 484.60(c) | Clinical Manager | CL-FM-011 log | LUPA/FCA exposure | M |
| 18 | Clinical Records System (Active + Retention) | Always-maintained clinical record system supporting integrity, retrievability, and statutory retention (≥5 yrs federal; state may extend). | CL / EN / IT | CL-OA-006, EN-WF-08 | 42 CFR § 484.110; CA H&S § 123145 | Clinical Manager / Records Officer | Retention schedule, record pulls | § 484.110 deficiency | H |

---

## 3. Safety & Risk Management

| # | CONTROL NAME | DESCRIPTION | DOMAIN | SOURCE POLICY ID(s) | REGULATORY BASIS | REQUIRED OWNER | EVIDENCE REQUIRED | FAILURE RISK | RISK |
|---|---|---|---|---|---|---|---|---|---|
| 19 | Emergency Preparedness Program (EPP) | Continuously maintained all-hazards EPP: plan, policies, communication plan, training, and exercises per CMS EP rule. | RM | RM-EP-001 | 42 CFR § 484.102; § 418 EP rule | EP Coordinator / Administrator | RM-FM-001 plan, HVA, training/exercise logs | Condition-level EP deficiency | H |
| 20 | Hazard Vulnerability Analysis (HVA) Register | Continuously maintained, annually re-reviewed HVA used to scope EP plan. | RM | RM-EP-002 | 42 CFR § 484.102(a) | EP Coordinator | Annual HVA report | EP deficiency | M |
| 21 | Enterprise Risk Register | Continuously updated cross-domain risk register with quarterly consolidation. | RM / EN | RM-WF-01, EN-WF-12 | OIG CPG; CoP oversight | Risk Manager | RM-FM-012 register; quarterly reviews | Weakness in Governing Body oversight | M |
| 22 | Workplace Violence Prevention Program (SB 553 / IIPP) | Always-on written WVP program with violent-incident log, annual review, hazard assessments. | RM / HR | RM-OS-101, HR-HS-001 | Cal/OSHA § 3342 SB 553; IIPP § 3203 | Risk Manager / Safety Officer | Violent Incident Log (continuous), plan document | Cal/OSHA citations; worker harm | H |
| 23 | Injury & Illness Prevention Program (IIPP) | Written IIPP continuously maintained with hazard identification, correction, training, recordkeeping. | RM / HR | RM-OS-101 | 8 CCR § 3203 | Safety Officer | IIPP document, training records | Cal/OSHA penalties | H |
| 24 | OSHA 300/300A Recordkeeping | Continuous maintenance of OSHA 300 Log; annual 300A post Feb 1–Apr 30. | HR / RM | HR-WF-13, RM-OS-102 | 29 CFR § 1904; Cal/OSHA § 14300 | Risk Manager | OSHA 300/300A logs | OSHA citation | M |
| 25 | Bloodborne Pathogens / Exposure Control Plan | Continuously maintained ECP with PPE availability, training, and post-exposure procedures. | RM / CL | RM-OS-002, CL-IC-001 | 29 CFR § 1910.1030 | Infection Preventionist / Safety | Written plan, training logs | OSHA citation; staff harm | H |
| 26 | Incident / Near-Miss Reporting Mechanism | Always-on intake, logging, triage, and RCA-routing for patient, staff, and operational incidents. | RM / QA | RM-OS-003, QA-AE-001 | 42 CFR § 484.65(b)(1)(ii); OIG CPG | Risk Manager / QAPI Lead | RM-FM-009, QA-FM-004 | § 484.65 deficiency; liability | H |
| 27 | Mandatory Abuse/Neglect Reporting Capability | Continuous capability to detect, report, and escalate suspected abuse/neglect to authorities per statute. | CL / RM | CL-PA-002, RM-OS-004 | 42 CFR § 484.50(e)(2); CA WIC § 15630 | Clinical Manager | CL-FM-030 report log | Statutory penalty; patient harm | H |
| 28 | Pandemic / Outbreak Response Capability | Continuously maintained pandemic/outbreak plan and activation readiness. | RM / CL | RM-EP-003, CL-IC-001 | 42 CFR § 484.102; § 484.70 | EP Coordinator / IP | RM-FM-006, activation SOP | Public-health failure | H |

---

## 4. Compliance & Regulatory

| # | CONTROL NAME | DESCRIPTION | DOMAIN | SOURCE POLICY ID(s) | REGULATORY BASIS | REQUIRED OWNER | EVIDENCE REQUIRED | FAILURE RISK | RISK |
|---|---|---|---|---|---|---|---|---|---|
| 29 | Corporate Compliance Program (OIG 7 Elements) | Continuously operating compliance program with written standards, Compliance Officer, Committee, training, communication, monitoring, enforcement, and response. | CO | CO-CP-001 | OIG CPG for Home Health; § 6032 DRA | Compliance Officer | Program charter, Committee minutes (CO-FM-024), annual work plan | OIG enforcement; FCA exposure | H |
| 30 | Designated Compliance Officer | Named, qualified Compliance Officer in place at all times with direct Board access. | CO / GV | CO-CP-001, GV-EA-002 | OIG CPG Element #2 | Governing Body | Appointment record, reporting lines | Program failure | H |
| 31 | Code of Conduct & Acknowledgment Program | Code of Conduct issued to all workforce members at onboarding and annually acknowledged. | CO / HR | CO-CP-002, EN-AK-001 | OIG CPG Element #1 | Compliance Officer / HR | EN-FM-001 signed acks, LMS records | OIG CPG failure | M |
| 32 | Compliance Hotline / Non-Retaliation Channel | 24/7 anonymous reporting channel with documented non-retaliation policy. | CO | CO-CP-007 | OIG CPG Element #4; FCA § 3730(h) | Compliance Officer | Hotline log (CO-FM-020), policy | OIG CPG / FCA retaliation claims | H |
| 33 | OIG/SAM/State Medicaid Exclusion Screening Program | Monthly screening of all employees, contractors, vendors, BOD, against OIG-LEIE, SAM, and state exclusion lists. | CO / HR | CO-CP-003, HR-TA-003, HR-WF-15 | 42 USC § 1320a-7; OIG CPG | Compliance Officer | HR-FM-005 monthly log, monthly attestation | Per-claim CMPs; FCA | H |
| 34 | Anti-Kickback / Stark Relationship Monitoring | Continuous tracking of referral-source, vendor, and physician relationships against AKS/Stark. | CO / FN | CO-FW-001, FN-WF-11 | 42 USC § 1320a-7b; 42 USC § 1395nn | Compliance Officer | Relationship register, FMV reviews | FCA; CMPs | H |
| 35 | FWA Training & Monitoring Program | Ongoing fraud/waste/abuse training and claim-risk monitoring. | CO / HR | CO-FW-002, HR-TR-003 | DRA § 6032; OIG CPG | Compliance Officer | CO-FM-008/009, training records | DRA penalty; FCA exposure | H |
| 36 | Annual Auditing & Monitoring Work Plan | Continuously executed annual risk-based internal audit plan with monthly pre/post-bill sampling. | CO / FN | CO-CP-006, FN-WF-15 | OIG CPG Element #5 | Compliance Officer | CO-FM-018 work plan, audit reports | OIG CPG failure | H |
| 37 | Regulatory Change Management / Horizon Scanning | Continuous monitoring of CMS/OIG/OCR/CDPH/DIR changes with impact analysis and policy updates. | EN / CO | EN-CM-001, EN-WF-05 | OIG CPG; HIPAA § 164.316 | Compliance Officer | EN-FM-014 scan log, impact analyses | Stale policies; survey findings | M |
| 38 | HIPAA Privacy Program | Continuously maintained Privacy Policies, Privacy Officer, NPP, minimum-necessary, authorizations. | CO / IT | CO-HP-001..005 | 45 CFR § 164.500–534 | Privacy Officer | Privacy policies, NPP, authorization logs | OCR enforcement | H |
| 39 | HIPAA Security Program (Admin/Physical/Technical Safeguards) | Continuously enforced Administrative, Physical, and Technical Safeguards per Security Rule. | IT / CO | IT-SP-001, CO-HP-004 | 45 CFR §§ 164.308–316 | Security Officer | Policies, configs, SRA, audit logs | OCR enforcement; breach | H |
| 40 | Designated HIPAA Privacy Officer & Security Officer | Named officers in place at all times (may be same person in small agency). | CO / IT | CO-HP-001, IT-SP-001 | 45 CFR § 164.530(a); § 164.308(a)(2) | Governing Body | Appointment records | OCR enforcement | H |
| 41 | Breach Notification Mechanism | Continuous capability to assess, investigate, and notify on suspected HIPAA/CMIA breaches within statutory windows. | CO / IT | CO-HP-007, IT-WF-09 | 45 CFR § 164.400–414; CMIA § 56.101; Civil Code § 1798.82 | Privacy Officer | CO-FM-029 breach risk assessments, notification templates | Per-day CMPs; OCR enforcement | H |
| 42 | Business Associate Agreement (BAA) Inventory & Lifecycle | Continuously current BAA inventory for every vendor with PHI access; annual refresh. | CO / IT | CO-HP-006, IT-WF-15 | 45 CFR § 164.308(b), § 164.314 | Compliance Officer | CO-FM-016 BAA register | HIPAA deficiency | H |
| 43 | Medicare Condition of Participation Self-Verification | Continuous self-verification that every HHA CoP is met; evidence maintained and surveyor-ready. | CO / QA | CO-CP-001, QA-WF-10 | 42 CFR Part 484 | Compliance Officer / QAPI Lead | QA-FM-010 self-assessment | Survey failure; termination | H |
| 44 | Mandatory Training Program (HIPAA/FWA/OSHA/WVP/Harassment/EP/Cultural) | Continuously operating annual + new-hire compliance training curriculum with completion tracking. | HR / CO | HR-TR-003, CO-CP-002, RM-OS-101 | 45 CFR § 164.530(b); 8 CCR § 3203; OIG CPG; AB 1825/SB 1343 | Training Coordinator / Compliance Officer | CO-FM-008/009, HR-FM-025 matrix | Multi-statute deficiencies | H |

---

## 5. Governance

| # | CONTROL NAME | DESCRIPTION | DOMAIN | SOURCE POLICY ID(s) | REGULATORY BASIS | REQUIRED OWNER | EVIDENCE REQUIRED | FAILURE RISK | RISK |
|---|---|---|---|---|---|---|---|---|---|
| 45 | Governing Body in Place | Legally constituted Governing Body with documented authority for agency operations at all times. | GV | GV-GB-001 | 42 CFR § 484.105(a) | Chair / Administrator | Bylaws, GB roster, GV-FM-005 minutes | Condition-level § 484.105 deficiency | H |
| 46 | Qualified Administrator Designation (Continuous) | Qualified Administrator in place at all times; Administrator Designee named for any absence; replacement within 30 days of vacancy. | GV | GV-EA-001, HR-JD-001/002 | 42 CFR § 484.105(b), § 484.115 | Governing Body | Appointment letter, designee letter | Condition-level deficiency | H |
| 47 | Qualified Clinical Manager Designation (Continuous) | Qualified Clinical Manager designated at all times with Clinical Designee for absence coverage. | GV / CL | GV-EA-003, HR-JD-003/004 | 42 CFR § 484.105(c), § 484.115 | Administrator | Appointment, designee letters | Condition-level deficiency | H |
| 48 | Organizational Chart & Reporting Lines | Current, approved org chart reflecting actual reporting and delegation. | GV | GV-EA-005 | 42 CFR § 484.105 | Administrator | Current org chart | Governance weakness | M |
| 49 | Agency Licensure & Certification Register | Continuously maintained register of all agency-level licenses/certifications with expiration tracking (90/60/30-day alerts). | GV / CO | GV-EA-004, CO-RA-001 | State HHA licensure; Medicare § 424; state Medicaid | Compliance Officer / Administrator | GV-FM-019 register, renewal evidence | Operating illegally; billing stop | H |
| 50 | Acceptance-to-Service / Scope-of-Service Statement | Current, approved written policy defining accepted geography, payer mix, diagnoses, and service scope. | GV / OP | GV-GB-004 | 42 CFR § 484.105(a)(2) | Administrator | Approved policy; public posting | § 484.105 deficiency | M |
| 51 | Institutional Plan & Annual Budget | Current Board-approved institutional plan and operating budget in place for each fiscal year. | GV / FN | GV-GB-003, FN-FP-001 | 42 CFR § 484.105(h)(4) | CFO / Governing Body | Signed budget, GV-FM-005 minutes | CoP deficiency | H |
| 52 | Conflict of Interest Disclosure Program | Continuously enforced COI program with onboarding + annual disclosures for Board, officers, and key staff. | GV / CO | GV-GB-005, CO-CP-004 | OIG CPG; state nonprofit law | Compliance Officer | Signed disclosure forms, COI log | OIG CPG failure | M |
| 53 | Delegation of Authority Matrix | Current written delegation matrix showing who signs what, including Administrator/Clinical Manager absence coverage. | GV | GV-EA-002 | 42 CFR § 484.105(b)-(c) | Administrator | DOA matrix, signed delegations | Governance deficiency | M |
| 54 | Public Service Information (Scope, Hours, Contacts) | Publicly available, current information about services, hours, and contacts; updated within 30 days of scope change. | GV / OP | GV-GB-006 | 42 CFR § 484.105(a) | Administrator | Website snapshot, printed notice | Patient access deficiency | L |
| 55 | Stakeholder Grievance Register (Governance Level) | Continuous log of stakeholder grievances escalated to governance for tracking and closure. | GV | GV-GB-007 | OIG CPG; 42 CFR § 484.50(e) | Administrator | Grievance register | Governance weakness | M |

---

## 6. Workforce & HR

| # | CONTROL NAME | DESCRIPTION | DOMAIN | SOURCE POLICY ID(s) | REGULATORY BASIS | REQUIRED OWNER | EVIDENCE REQUIRED | FAILURE RISK | RISK |
|---|---|---|---|---|---|---|---|---|---|
| 56 | Personnel File System (Credentialed + Current) | Continuously maintained personnel file for every worker: I-9, screenings, licenses, training, acknowledgments, evaluations. | HR | HR-TA-004, HR-WF-03 | 42 CFR § 484.115; IRCA; EEOC | HR Director | HR-FM-015 audit checklist | CoP + IRCA deficiencies | H |
| 57 | Primary Source License Verification Register | Continuous register of all licensed staff with PSV at hire and prior to every renewal; same-day suspension on lapse. | HR | HR-TA-005, HR-WF-04 | 42 CFR § 484.115; state practice acts | HR Director | HR-FM-006 PSV, HR-FM-015 register | Unlicensed practice; billing fraud | H |
| 58 | Job Descriptions Library (HR-JD Series) | Current approved job descriptions for every role (Administrator, DON, RN, LVN, HHA, PT, OT, SLP, MSW, Governing Body); signed at hire and material change. | HR | HR-TA-006 | 42 CFR § 484.105, § 484.115 | HR Director | HR-JD-000..011, HR-FM-031 acks | Governance/billing deficiencies | M |
| 59 | HHA 12-Hour Annual In-Service Program | Continuously operating training program ensuring every HHA receives ≥12 hrs in-service per 12-month period. | HR / CL | HR-TR-001 | 42 CFR § 484.80(d) | Clinical Manager / Training Coord | HR-FM-018 attendance log | § 484.80 deficiency | H |
| 60 | Skilled Professional Supervision Program (RN→LPN, PT→PTA, OT→COTA) | Continuous supervision of assistant-level disciplines per state law. | HR / CL | HR-TR-002, CL-SD-006 | 42 CFR § 484.75; state practice acts | Clinical Manager | HR-FM-021, HR-FM-022 | Billing deficiency; state board action | H |
| 61 | Wage & Hour Compliance Program (Timekeeping, Meal/Rest, OT) | Continuous timekeeping, meal/rest attestation, overtime approval, itemized wage statements. | HR / FN | HR-TA-004, FN-PR-001 | FLSA; CA Labor Code §§ 226, 510, 512; Wage Orders | Payroll Manager / CFO | HR-FM-024 timesheets, pay stubs | PAGA/class-action exposure | H |
| 62 | EEO / Non-Discrimination & Harassment Prevention Program | Continuously enforced policies, complaint intake, mandated training (AB 1825/SB 1343). | HR | HR-TA-002, HR-ER-004 | Title VII; FEHA; EEOC | HR Director | Policy, training records, complaint log | Title VII/FEHA liability | H |
| 63 | Worker Classification (Employee vs 1099) Controls | Continuous application of ABC test + IRS factors to every engagement; annual reviews. | HR / FN | HR-CO-001, HR-WF-16 | CA Labor Code § 2775; IRS | HR Director / CFO | HR-FM-059 determinations | Misclassification/PAGA exposure | M |
| 64 | Workers' Compensation Program | Continuously maintained WC insurance and employer reporting machinery (DWC-1, 5020, OSHA 300). | HR / RM | HR-HS-001 | CA Labor Code § 3550; 29 CFR § 1904 | Risk Manager / HR | Policy declarations, claim files | State penalties | H |
| 65 | Health Clearance / TB / Immunization Records | Standing requirement for pre-start and ongoing health clearance per role. | HR / CL | HR-TA-003, CL-IC-001 | CDPH/CDC guidance; CCR Title 17 | HR / Occ Health | HR-FM-008 records | Infection control deficiency | M |

---

## 7. IT & Security

| # | CONTROL NAME | DESCRIPTION | DOMAIN | SOURCE POLICY ID(s) | REGULATORY BASIS | REQUIRED OWNER | EVIDENCE REQUIRED | FAILURE RISK | RISK |
|---|---|---|---|---|---|---|---|---|---|
| 66 | Asset & ePHI Inventory (Always Current) | Continuously maintained inventory of all ePHI-containing systems, devices, and data flows. | IT | IT-SP-001, IT-AM-001 | 45 CFR § 164.308(a)(1); NIST 800-66 | Security Officer | IT-FM-001 inventory | Foundational HIPAA failure | H |
| 67 | Annual Security Risk Analysis & Risk Management Plan | Current SRA on file at all times with active remediation register. | IT | IT-SP-001, IT-WF-01 | 45 CFR § 164.308(a)(1)(ii)(A)-(B) | Security Officer | IT-FM-002 SRA, IT-FM-003 remediation | #1 OCR enforcement finding | H |
| 68 | Role-Based Access Control & Least Privilege | Continuously enforced RBAC with role matrix, provisioning, and quarterly reviews. | IT | IT-AC-001..003 | 45 CFR § 164.308(a)(3)-(4) | Security Officer | IT-FM-005 matrix; IT-FM-014 reviews | HIPAA minimum-necessary violation | H |
| 69 | Access Termination SLA (Same-Day / Separation-Date) | Continuous capability to disable all access effective separation date (same-day for involuntary). | IT / HR | IT-AC-002, IT-WF-03 | 45 CFR § 164.308(a)(3)(ii)(C) | IT Access Admin | IT-FM-010/011 checklists | PHI breach risk | H |
| 70 | MFA / Strong Authentication Enforcement | Continuous enforcement of MFA on all remote, admin, and EHR access. | IT | IT-AC-004 | 45 CFR § 164.312(d); NIST 800-63B | Security Officer | IT-FM-009 MFA enrollment log | HIPAA § 164.312(d) violation | H |
| 71 | Audit Logging & Information System Activity Review | Continuous logging of ePHI systems, centralized (SIEM), monthly activity review, 6-year retention. | IT | IT-SP-002, IT-WF-06 | 45 CFR § 164.312(b); § 164.308(a)(1)(ii)(D) | Security Officer | IT-FM-020/021/022 | HIPAA violation; breach detection failure | H |
| 72 | Encryption at Rest & In Transit | Continuous enforcement of encryption for ePHI on endpoints, backups, email, and transmissions. | IT | IT-AM-001, IT-NE-003 | 45 CFR § 164.312(a)(2)(iv), § 164.312(e) | Security Officer | IT-FM-024 encryption register | Breach = presumed HIPAA violation | H |
| 73 | Backup & Restoration Capability | Continuous encrypted backups with offsite/cloud copy; annual verified restore test. | IT | IT-BC-001, IT-WF-07 | 45 CFR § 164.308(a)(7)(ii)(A)-(B) | IT Infrastructure Lead | IT-FM-023/024/025 | HIPAA contingency failure | H |
| 74 | Disaster Recovery / Business Continuity Plan | Continuously maintained DR/BC plan aligned with EP program; annual exercise. | IT / RM | IT-BC-002, IT-WF-08 | 45 CFR § 164.308(a)(7); 42 CFR § 484.102 | Security Officer / EP Coord | IT-FM-026/027/028 | HIPAA + EP CoP failure | H |
| 75 | Incident Response Capability (24/7 Detection & Containment) | Always-on IR capability with documented plan, severity matrix, and containment SLAs. | IT / CO | IT-IR-001, IT-WF-09 | 45 CFR § 164.308(a)(6); NIST 800-61 | Security Officer | IR plan, IT-FM-029/030/031 | HIPAA violation; breach penalties | H |
| 76 | Endpoint/MDM Management (Encryption, AV/EDR, Patching) | Continuous endpoint management: full-disk encryption, EDR/AV, MDM enrollment, patching per SLA. | IT | IT-AM-001, IT-WF-10 | 45 CFR § 164.310(d), § 164.312(a) | IT Endpoint Admin | MDM console, encryption report | Lost-device breach risk | H |
| 77 | Patch & Vulnerability Management Program | Continuous vulnerability scanning and patching per severity SLA (crit ≤7d, high ≤30d). | IT | IT-NE-001, IT-WF-13 | 45 CFR § 164.308(a)(1)(ii)(B) | Security Officer | IT-FM-035 scans, patch records | Breach / HIPAA violation | H |
| 78 | Email Security Controls (Anti-Phishing, TLS, DLP) | Continuously maintained email gateway with SPF/DKIM/DMARC, TLS, DLP, encryption for ePHI. | IT | IT-NE-003, IT-WF-16 | 45 CFR § 164.312(e) | IT SecOps | IT-FM-042 config register | Transmission violation; BEC fraud | H |
| 79 | Removable Media / USB Restriction | DLP-enforced default block of removable media; tracked exceptions only. | IT | IT-AM-003, IT-WF-12 | 45 CFR § 164.310(d)(2) | Security Officer | DLP config, IT-FM-034 exceptions | PHI breach via USB | M |
| 80 | Secure Media Disposal / Sanitization Program | Continuous sanitization per NIST 800-88 before retirement; paper PHI shredding log. | IT | IT-DM-001, IT-WF-17 | 45 CFR § 164.310(d)(2)(i)-(ii); NIST SP 800-88 | IT Asset Mgmt | IT-FM-036/044 | Classic HIPAA enforcement case | H |
| 81 | Facility Physical Security Controls | Continuous badge access, visitor logs, restricted zones (server, records), camera coverage. | IT / OP | IT-SP-004, IT-WF-19 | 45 CFR § 164.310(a)-(c) | Facilities Mgr / Security Officer | IT-FM-045/046 logs | § 164.310 violation | H |
| 82 | Remote Access / VPN Security | Continuous VPN/ZTNA with MFA and device-posture enforcement; session logging. | IT | IT-NE-004, IT-WF-18 | 45 CFR § 164.312(e) | IT NetOps | Session logs; config | Lateral movement/breach | H |
| 83 | Change Advisory Board (CAB) Control | Continuous change management with pre-approval, test, rollback, and retrospective on emergency changes. | IT | IT-NE-002, IT-WF-14 | HIPAA admin safeguards | IT Change Manager | IT-FM-037/038/039 | Outage/integrity risk | M |
| 84 | Vendor/Cloud Security Posture Program | Continuous vendor security review, SOC2/HITRUST validation, and annual re-review for all PHI/critical vendors. | IT / CO | IT-SP-003, IT-WF-15 | 45 CFR §§ 164.308(b), 164.314(a) | Security Officer | IT-FM-040/041; BAA register | HIPAA + breach exposure | H |

---

## 8. Financial / Billing

| # | CONTROL NAME | DESCRIPTION | DOMAIN | SOURCE POLICY ID(s) | REGULATORY BASIS | REQUIRED OWNER | EVIDENCE REQUIRED | FAILURE RISK | RISK |
|---|---|---|---|---|---|---|---|---|---|
| 85 | PPS Claims Submission System (NOA within 5 Days / Final Claim) | Continuously operational claims pipeline: eligibility verification, NOA submission ≤5 days of SOC, pre-bill audit, final claim, RA reconciliation. | FN / CL | FN-BL-001, FN-WF-04 | 42 CFR § 484.205; § 409.43 | Billing Manager / CFO | FN-FM-009/010/011/012 | NOA penalties; FCA | H |
| 86 | Pre-Billing Audit Control (F2F / POC / OASIS Lock) | Continuous pre-billing verification that F2F, signed POC, and locked OASIS are in place before any final claim. | FN / CO | FN-BL-001, FN-WF-15 | 42 CFR § 409.43; 31 USC § 3729 | Billing Manager / Coder | FN-FM-010 checklist | FCA exposure | H |
| 87 | Revenue Integrity / RCM Self-Audit Program | Continuous pre-bill and post-bill coding/documentation sampling feeding denial mgmt and overpayment workflow. | FN / CO | FN-BL-008, FN-WF-15 | OIG CPG Element #5; § 6032 DRA | Compliance Officer / CFO | CO-FM-018 plan; monthly audit reports | OIG CPG failure; FCA | H |
| 88 | 60-Day Overpayment Identification & Return Program | Always-on mechanism to identify, quantify, and return overpayments within 60 days of identification. | FN / CO | FN-AR-002, CO-FW-002 | 42 USC § 1320a-7k(d); 42 CFR § 401.305 | Compliance Officer / CFO | FN-FM-020/022, refund transmittals | FCA "reverse false claim" per-claim exposure | H |
| 89 | Credit Balance (CMS-838) Reporting System | Continuous AR monitoring with quarterly CMS-838 filing (even if zero). | FN | FN-AR-001, FN-WF-07 | 42 CFR § 401.605–607 | AR Supervisor / Administrator | FN-FM-018, CMS-838 filings | CMP + payment suspension | H |
| 90 | Denial Management & Appeals Pipeline | Continuous denial logging, RCA, and appeals within statutory windows (Levels 1–5). | FN | FN-BL-002, FN-WF-05 | 42 CFR § 405.940 | Denial Mgmt Specialist / CFO | FN-FM-013/014/015 | Revenue loss; systemic risk | M |
| 91 | ADR Response Capability | Standing capability to respond to MAC/UPIC/RAC ADRs within required timeframes with complete record packages. | FN | FN-BL-003, FN-WF-06 | CMS/MAC ADR rules | ADR Coordinator | FN-FM-016/017 | Automatic denial; TPE/UPIC escalation | H |
| 92 | Accounts Payable Vendor-Exclusion Check at Payment | Continuous verification that every vendor payee is on approved list and not OIG/SAM excluded at payment. | FN / CO | FN-AP-001, HR-WF-15 | 42 USC § 1320a-7; OIG CPG | AP Clerk / Compliance | OP-FM-005 list, HR-FM-005 | Paying excluded vendor = FCA | H |
| 93 | Cost Report Financial Records Program | Continuously maintained cost-report-grade financial records and reconciliations supporting annual 1728-20 filing. | FN | FN-AU-001 | 42 CFR § 413.20, § 413.24 | CFO / Controller | GL, trial balance, PBC files | Medicare payment suspension | H |
| 94 | Payroll & Tax Filing Program | Continuously operational payroll with accurate time, OT, deductions, and federal/state tax filings (941, DE-9, W-2). | FN / HR | FN-PR-001, FN-WF-12 | FLSA; CA Labor Code; IRS | CFO / Payroll Mgr | Payroll registers, tax filings | Penalties; labor enforcement | H |

---

## 9. Enterprise Policy & Records

| # | CONTROL NAME | DESCRIPTION | DOMAIN | SOURCE POLICY ID(s) | REGULATORY BASIS | REQUIRED OWNER | EVIDENCE REQUIRED | FAILURE RISK | RISK |
|---|---|---|---|---|---|---|---|---|---|
| 95 | Master Policy Index / Taxonomy Register | Continuously current, authoritative register of every P&P with metadata, owner, tier, version, and next-review date. | EN | EN-TG-001, EN-WF-04 | HIPAA § 164.316; OIG CPG #1 | Policy Administrator | EN-FM-002 register | Cannot demonstrate P&P management | H |
| 96 | Policy Lifecycle Control (Draft→Approve→Publish→Retire) | Continuously operating policy lifecycle with approvals, version control, and retirement. | EN | EN-PM-001, EN-WF-01 | HIPAA § 164.316(a)-(b) | Policy Owner / Compliance | EN-FM-004/005/006/009 | OIG + HIPAA P&P failure | H |
| 97 | Universal Policy Acknowledgment Program | All workforce, contractors, and BAs acknowledge relevant policies at hire, at material update, and annually. | EN / HR | EN-AK-001, EN-WF-03 | 45 CFR § 164.530(b) | HR / Compliance | EN-FM-001 acks, EN-FM-012 completion | HIPAA training defense weakness | M |
| 98 | Records Retention & Destruction Schedule | Continuously enforced retention schedule across clinical, HR, financial, HIPAA records with approved destruction. | EN / IT / CL | EN-RM-001, EN-WF-08 | 42 CFR § 484.110; 45 CFR § 164.316(b); CA H&S § 123145 | Records Officer | Retention schedule, destruction logs | Multi-statute violations | H |
| 99 | Enterprise Mandated-Events Calendar | Continuously maintained calendar of all mandatory recurring events (annual/quarterly/monthly/continuous) with assigned owners. | EN / CO | EN-MT-001, EN-WF-09 | 42 CFR Part 484; OIG CPG | Compliance Officer | EN mandated-events register | Missed regulatory deadlines | H |
| 100 | Enterprise KPI / Compliance Dashboard | Continuously updated enterprise compliance/quality KPI reporting to leadership and Board. | EN / QA | EN-MT-002, EN-WF-10 | 42 CFR § 484.65; OIG CPG | Compliance Officer / QAPI Lead | Monthly dashboards, quarterly Board pack | Governance/QAPI weakness | M |

---

## QAPI Program

| # | CONTROL NAME | DESCRIPTION | DOMAIN | SOURCE POLICY ID(s) | REGULATORY BASIS | REQUIRED OWNER | EVIDENCE REQUIRED | FAILURE RISK | RISK |
|---|---|---|---|---|---|---|---|---|---|
| 101 | QAPI Program (Ongoing, Agency-Wide, Data-Driven) | Effective, ongoing, agency-wide, data-driven QAPI program with continuous data collection, trending, PIPs, and Board oversight. | QA | QA-PG-001/002 | 42 CFR § 484.65 | QAPI Lead / Clinical Manager | Charter, dashboards, PIPs, committee + Board minutes | Condition-level § 484.65 deficiency | H |
| 102 | At-Least-One Active PIP (Continuous) | At all times, at least one Performance Improvement Project is active and documented. | QA | QA-PI-001, QA-WF-04 | 42 CFR § 484.65(d) | QAPI Lead | QA-FM-002 charter, remeasurements | § 484.65(d) deficiency | H |
| 103 | Quality Indicator Dashboard (Monthly Production) | Always-on monthly dashboard combining OASIS, claims, HHCAHPS, infection, and adverse event data. | QA | QA-SM-001, QA-WF-02 | 42 CFR § 484.65(b); § 484.245 | QAPI Data Analyst | QA-FM-003 monthly dashboard | § 484.65 deficiency | H |
| 104 | HHCAHPS Submission or PER Maintenance | Continuous HHCAHPS vendor submission OR current CMS Participation Exemption Request (PER) depending on volume. | QA / FN | QA-SM-002, QA-WF-08 | 42 CFR § 484.245 | HHCAHPS Coordinator | Vendor submissions or PER confirmation | 2% APU reduction | H |

---

## SUMMARY

| Category | Count |
|---|---|
| Patient Rights & Access | 6 |
| Clinical Operations | 12 |
| Safety & Risk Management | 10 |
| Compliance & Regulatory | 16 |
| Governance | 11 |
| Workforce & HR | 10 |
| IT & Security | 19 |
| Financial / Billing | 10 |
| Enterprise Policy & Records | 6 |
| QAPI Program | 4 |
| **TOTAL** | **104** |

**High-Risk if Missing (H): 76**
**Material Risk (M): 26**
**Low/Administrative Risk (L): 2**

---

## Ambiguous / Flagged for Review

1. **Finance Committee & Audit Committee minute templates** — `FN-WORKFLOWS.md` flags a gap (FN-FM-014 / FN-FM-015 to be added via EN-WF-07). Until added, the continuous requirement to produce signed minutes is partially reliant on interim `EN-FM-021`. *Confirm these forms exist before relying on them as audit evidence.*
2. **High-Risk Patient Monitoring Capability (#16)** — worded as continuous in workflows but operationalized per-patient on enrollment. Kept as continuous because the *capability* must exist at all times; individual monitoring is triggered.
3. **Branch Register Maintenance (OP)** — listed "Continuous" in OP-WORKFLOWS but only becomes "Required At All Times" if the agency operates multiple branches. *Flag if single-branch.*
4. **Public Service Information Update (#54)** — continuously available but updated only upon scope change. Retained because the information itself must be continuously accessible.
5. **Governing Body Training & Education Log** — listed "continuous" in GV-WORKFLOWS; treated as a continuous *log* covered under #45 rather than a separate control. Confirm whether the training *program* warrants a separate dashboard row.
6. **Cal/OSHA Heat Illness Prevention / Aerosol Transmissible Diseases (ATD)** — not explicitly called out in workflows. Likely required for field staff in CA. *Flag for gap assessment.*
7. **COBRA Administration Continuity** — captured indirectly under HR-WF-14 separation; confirm whether a standalone continuous control is warranted.

---

## Normalization Decisions

- "Language access," "interpreter services," and "translation services" were merged into **#2 Interpreter / Language Access Services**.
- Scattered HIPAA Administrative, Physical, and Technical Safeguards were consolidated into **#39 HIPAA Security Program** with separate continuous controls for specific implementation specs (logging, encryption, MFA, access control) where independently auditable.
- HHA supervisory visits (every 14 / every 60 days) were merged under **#12 HHA Supervision Program** rather than split by cadence.
- OIG/SAM screening (pre-hire + monthly) was split: **#33** covers the continuous screening *program*; pre-hire screening alone is event-driven and excluded.
- "Compliance Committee Meetings (Monthly)" excluded as a meeting cadence; the underlying **Compliance Program (#29)** and **Compliance Officer (#30)** are retained as the required-at-all-times items.
- All "Annual X Review" workflows excluded UNLESS the program being reviewed is itself required continuously (e.g., QAPI, EP, IIPP, HIPAA, compliance program).

---

## How to Use This Inventory

- Each row is actionable as a dashboard KPI: the **EVIDENCE REQUIRED** column maps 1:1 to the artifact a CMS surveyor, OCR investigator, or external auditor will request first.
- High-risk (H) controls should feed the **red-amber-green (RAG)** tier of a compliance dashboard; an H control in red = potential Condition-Level finding.
- Controls numbered 1–100 plus QAPI rows 101–104 constitute the complete continuous-obligation control set derivable from the current P&P library.
