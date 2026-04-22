# CL — CLINICAL OPERATIONS — WORKFLOWS

**Domain Code:** CL
**Regulatory Anchors:** 42 CFR § 484.45 (OASIS submission); § 484.50 (Patient Rights); § 484.55 (Comprehensive Assessment); § 484.60 (Plan of Care & coordination); § 484.65 (QAPI); § 484.70 (Infection Prevention); § 484.75 (Home Health Aide Services); § 484.80 (Aide Training/Competency/Supervision); § 484.110 (Clinical Records); § 484.115 (Personnel Qualifications); § 484.245 (HH QRP); Social Security Act § 1814(a)(2)(C) & § 1835(a)(2)(A) (Face-to-Face); CA H&S Code §1726 et seq.
**Primary Subdomains:** PA (Patient Assessment), CP (Care Planning & Coordination), OA (OASIS), SD (Service Delivery), IC (Infection Control), DC (Discharge)
**Form Prefix:** CL-FM-xxx (57 forms)

---

## DOMAIN OVERVIEW

Clinical workflows execute the day-to-day delivery of home health care. Every workflow is tied to a Medicare Condition of Participation and directly drives claim payability, quality outcomes, and patient safety. OASIS, POC, orders, face-to-face, and supervision workflows are simultaneously clinical, billing-compliance, and survey-defensibility processes. Any failure cascades into denials, False Claims Act exposure, and CoP deficiencies.

---

## WORKFLOWS IN THIS DOMAIN

1. CL-WF-01 — Intake & Referral Qualification
2. CL-WF-02 — Homebound Status Determination
3. CL-WF-03 — Face-to-Face Encounter Capture & Verification
4. CL-WF-04 — Start of Care (SOC) Comprehensive Assessment
5. CL-WF-05 — OASIS Completion, QA, Transmission & Correction
6. CL-WF-06 — Plan of Care (POC / CMS-485) Establishment & Physician Signature
7. CL-WF-07 — Physician Orders & Verbal Order Authentication
8. CL-WF-08 — Coordination of Care & Multidisciplinary Communication
9. CL-WF-09 — Skilled Visit Documentation (RN / PT / OT / SLP / MSW)
10. CL-WF-10 — Home Health Aide Services & Supervision (Skilled-Patient Annual; Aide-Only Semiannual)
11. CL-WF-11 — Annual Aide In-Service Training (≥12 hours)
12. CL-WF-12 — Medication Management & Reconciliation
13. CL-WF-13 — Wound Care & Specialty Clinical Protocols
14. CL-WF-14 — Infection Control at Point of Care
15. CL-WF-15 — Telehealth Service Delivery
16. CL-WF-16 — Patient Rights, Admission Consent & Advance Directives
17. CL-WF-17 — Patient / Family Education
18. CL-WF-18 — Recertification / Resumption of Care (ROC)
19. CL-WF-19 — Transfer / Discharge Planning & Execution
20. CL-WF-20 — Missed Visit Management
21. CL-WF-21 — Clinical Record Completion & Amendment
22. CL-WF-22 — Abuse / Neglect / Exploitation Reporting
23. CL-WF-23 — Patient Complaint / Grievance Handling
24. CL-WF-24 — Pediatric / Palliative / High-Risk Specialty Pathways
25. CL-WF-25 — Clinician Competency Validation (Incl. OASIS)

---

## CL-WF-01 — INTAKE & REFERRAL QUALIFICATION

### 1. POLICY REFERENCES
- CL-PA-001 Comprehensive Patient Assessment; OP-IN-001 Intake; GV-GB-001 (acceptance-to-service); 42 CFR § 484.60(a); § 484.105(i)(1)

### 2. PROCESS OVERVIEW
Receives referrals; verifies eligibility (physician order, homebound, skilled need, Medicare/insurance, geographic service area, clinical scope); accepts or declines; schedules SOC.

### 3. TRIGGER(S)
- Incoming referral (hospital, physician, community, patient, insurer)

### 4. RESPONSIBLE ROLES
- **Primary:** Intake Coordinator / Admissions Nurse
- **Supporting:** Clinical Manager, Insurance Verifier, Physician liaison
- **Approval:** Clinical Manager (acceptance decisions; non-admits)

### 5. INPUTS
- Referral form; H&P; hospital discharge summary; physician order to initiate; demographics; insurance

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | System Action | Form | Deadline |
|---|--------|------|---------------|------|----------|
| 1 | Log referral | Intake Coord | Referral log | CL-FM-050 Documentation Source Evidence Matrix (source log) | Within 4 business hours |
| 2 | Capture referral demographics & clinical summary | Intake Coord | Intake entry | CL-FM-050; OP-FM-014 Patient Intake Information Sheet | Same day |
| 3 | Verify Medicare/insurance, homebound, skilled need | Insurance Verifier + Admissions RN | Eligibility check | CL-FM-009 Homebound Status Determination Checklist | Same day |
| 4 | Verify physician order exists & is compliant | Intake Coord | Order verification | CL-FM-006 Physician Orders Sheet | Same day |
| 5 | Confirm scope against agency Acceptance-to-Service | Clinical Mgr | Scope check | GV-FM-016 Scope of Services Definition Matrix | Same day |
| 6 | Accept or decline | Clinical Mgr | Decision | OP-FM-015 Non-Admit / Referral Rejection Log (if declined) | Within 24h of referral |
| 7 | Schedule SOC | Scheduler | Visit scheduled | — | SOC within 48h of referral (or per physician order) |
| 8 | Notify referral source of acceptance/decline | Intake Coord | Notification | — | Within 24h of decision |
| 9 | Send intake packet to patient | Intake Coord | Packet delivery | CL-FM-027 Patient Rights & Responsibilities; CL-FM-029 Informed Consent | Prior to first visit |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-050, CL-FM-009, CL-FM-006, CL-FM-027, CL-FM-029, OP-FM-014, OP-FM-015, GV-FM-016. Linguistics: CL-FM-025 Telehealth Consent (if applicable); OP-FM-018 Interpreter Service Utilization Log (if LEP).

### 8. APPROVALS
Clinical Manager approves acceptance decisions and all non-admits. Insurance Verifier certifies benefits.

### 9. OUTPUTS
Referral log, intake packet delivered, eligibility verification evidence, acceptance/decline record, scheduled SOC.

### 10. SLA / DEADLINES
SOC within 48 hours of referral (internal standard — unless ordered later by physician). Decline logged within 24h.

### 11. ESCALATION LOGIC
Incomplete referral → Intake Coord requests missing items; if not resolved within 24h, escalate to Clinical Manager. Out-of-scope referral → formal decline with referral back to appropriate provider; patient continuity of care documented.

### 12. FAILURE CONDITIONS
Accepting patient outside scope → adverse event, malpractice. Accepting without physician order → non-payable claim + False Claims Act exposure. Missing homebound/skilled need documentation at intake → claim denial.

### 13. AUDIT REQUIREMENTS
Per-referral file with: referral, eligibility checks, scope assessment, accept/decline decision, physician order. Non-admit log complete with rationale.

---

## CL-WF-02 — HOMEBOUND STATUS DETERMINATION

### 1. POLICY REFERENCES
- CL-PA-002 Homebound Eligibility; 42 CFR § 409.42; SSA § 1835(a)(2)(F)

### 2. PROCESS OVERVIEW
Establishes and re-establishes homebound status at SOC, at each recert, and when clinical status changes materially.

### 3. TRIGGER(S)
- SOC
- Recertification
- Significant clinical change
- Audit signal

### 4. RESPONSIBLE ROLES
- **Primary:** Admitting RN; Case Manager
- **Supporting:** Physician, Clinical Mgr
- **Approval:** Clinical Manager (quarterly spot-audit)

### 5. INPUTS
- Clinical findings; caregiver reports; physician orders

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Complete homebound checklist at SOC | Admitting RN | CL-FM-009 Homebound Status Determination Checklist | At SOC |
| 2 | Document specific narrative (taxing effort, medical restriction) | Admitting RN | Chart note | At SOC |
| 3 | Re-verify at every recert | Recertifying clinician | CL-FM-009 | At recert |
| 4 | Escalate change in status (no longer homebound) → DC planning | Clinician | DC note | Same day |
| 5 | Quarterly audit sample | Clinical Mgr | Audit notes; CO-FM-021 Documentation Alignment Audit Tool | Quarterly |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-009; CO-FM-021.

### 8. APPROVALS
Clinician attests; Clinical Manager audits.

### 9. OUTPUTS
Completed checklist in chart; narrative evidence; audit results.

### 10. SLA / DEADLINES
Every SOC, recert, material change.

### 11. ESCALATION LOGIC
No longer homebound → discharge planning initiated; billing stops until discharge; physician notified.

### 12. FAILURE CONDITIONS
Missing/weak homebound evidence = claim denial, False Claims Act signal for pattern.

### 13. AUDIT REQUIREMENTS
Each episode chart shows homebound documentation; audit log current.

---

## CL-WF-03 — FACE-TO-FACE ENCOUNTER CAPTURE & VERIFICATION

### 1. POLICY REFERENCES
- CL-PA-005 Face-to-Face Encounter; 42 CFR § 424.22(a)(1)(v); SSA § 1814(a)(2)(C); § 1835(a)(2)(A)

### 2. PROCESS OVERVIEW
Obtains and verifies the physician or allowed NPP face-to-face encounter documentation supporting Medicare HH eligibility.

### 3. TRIGGER(S)
- New Medicare SOC
- Episode with required F2F
- Audit / denial signal

### 4. RESPONSIBLE ROLES
- **Primary:** Intake/Clinical Liaison; Clinical Mgr
- **Supporting:** Physician, Billing

### 5. INPUTS
- F2F encounter note; physician certification; encounter date

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Confirm F2F encounter within 90 days prior or 30 days after SOC | Intake/Liaison | CL-FM-010 Face-to-Face Encounter Documentation | Before billing |
| 2 | Validate content (date, clinical findings supporting HH, signed by physician/NPP) | Clinical Mgr | CL-FM-010 | Before billing |
| 3 | Obtain if missing (request from physician) | Liaison | Outreach log | Before billing |
| 4 | If unavailable/non-compliant: halt billing; evaluate non-billable / patient-responsibility | Billing/Compliance | CO-FM-021 | Before claim |
| 5 | Record in chart | Clinical Mgr | Chart | Before billing |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-010; CO-FM-021.

### 8. APPROVALS
Clinical Manager attests completeness before billing release.

### 9. OUTPUTS
F2F encounter in chart; billing release signal.

### 10. SLA / DEADLINES
Completion before claim submission; no retroactive fabrication.

### 11. ESCALATION LOGIC
Non-compliant F2F → claim held; Compliance Officer informed; refund/denial process triggered if claim already submitted.

### 12. FAILURE CONDITIONS
Missing F2F = automatic Medicare denial + potential False Claims Act exposure if submitted.

### 13. AUDIT REQUIREMENTS
F2F in every Medicare-billed chart; pre-bill edit evidence.

---

## CL-WF-04 — START OF CARE (SOC) COMPREHENSIVE ASSESSMENT

### 1. POLICY REFERENCES
- CL-PA-001; CL-OA-001 OASIS; 42 CFR § 484.55, § 484.60(a); § 484.45

### 2. PROCESS OVERVIEW
Completes the comprehensive assessment (incl. OASIS) at SOC within 48 hours of referral (or as ordered by physician).

### 3. TRIGGER(S)
- Scheduled SOC visit

### 4. RESPONSIBLE ROLES
- **Primary:** Admitting RN (or PT for therapy-only case under state scope)
- **Supporting:** Disciplines for specialty components
- **Approval:** Clinical Manager

### 5. INPUTS
- Referral packet; F2F encounter; prior records; medications

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Perform SOC visit; complete assessment | Admitting RN | CL-FM-001 Start of Care (SOC) Comprehensive Assessment | Within 48h of referral (or per order) |
| 2 | Complete OASIS-E1 | Admitting RN | CL-FM-002 OASIS-E1 Assessment Form | Day of SOC |
| 3 | Complete Homebound Determination (CL-WF-02) | RN | CL-FM-009 | Day of SOC |
| 4 | Capture fall risk, pain, cognitive, behavioral, functional | RN | CL-FM-020 Fall Risk Assessment Tool; CL-FM-026 Pain Assessment Scale; CL-FM-038 Behavioral Health Screening Tool | Day of SOC |
| 5 | Medication reconciliation (CL-WF-12) | RN | CL-FM-019 | Day of SOC |
| 6 | Obtain consents & patient rights acknowledgment (CL-WF-16) | RN | CL-FM-027 Patient Rights; CL-FM-029 Informed Consent | Day of SOC |
| 7 | Develop initial POC (CL-WF-06) | RN | CL-FM-005 Plan of Care (485) | Within 5 days of SOC (CoP) |
| 8 | Submit assessment for QA (CL-WF-05) | QA Reviewer | CL-FM-031 OASIS Pre-Submission QA Checklist | Within 7 days of SOC |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-001, CL-FM-002, CL-FM-009, CL-FM-019, CL-FM-020, CL-FM-026, CL-FM-027, CL-FM-029, CL-FM-038, CL-FM-005, CL-FM-031. Specialty: CL-FM-039 Pediatric; CL-FM-041 MSW; CL-FM-047 High-Risk.

### 8. APPROVALS
Clinical Manager reviews; QA reviewer signs OASIS QA; Physician signs POC.

### 9. OUTPUTS
Complete SOC assessment packet; OASIS; initial POC; signed consents.

### 10. SLA / DEADLINES
SOC within 48h of referral (best practice) or per physician order. OASIS within 5 days of SOC (CoP). POC within 5 days; physician signature within 30 days.

### 11. ESCALATION LOGIC
SOC delay → Scheduler + Clinical Mgr notified immediately; new scheduled date; documented rationale in chart.

### 12. FAILURE CONDITIONS
Missing/late SOC = CoP deficiency; claim payment risk. OASIS errors → claim denial, quality measure impact.

### 13. AUDIT REQUIREMENTS
Per-chart: SOC note, OASIS, POC, consents, F2F, homebound, meds — all timestamped.

---

## CL-WF-05 — OASIS COMPLETION, QA, TRANSMISSION & CORRECTION

### 1. POLICY REFERENCES
- CL-OA-001 OASIS; CL-OA-006 Documentation Hierarchy & Evidence Source Prioritization
- 42 CFR § 484.45; CMS OASIS Guidance Manual

### 2. PROCESS OVERVIEW
Ensures OASIS is accurate, QA'd, transmitted within 30 days of assessment completion, and corrections submitted per CMS rules.

### 3. TRIGGER(S)
- OASIS time point: SOC, ROC, Recert, Transfer, Discharge, Death
- QA review gate
- Correction identified post-submission

### 4. RESPONSIBLE ROLES
- **Primary:** Assessing clinician
- **Supporting:** OASIS QA Reviewer; OASIS Coordinator
- **Approval:** Clinical Manager

### 5. INPUTS
- Assessment; supporting chart documentation (CL-OA-006 hierarchy)

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Assessing clinician completes OASIS | Clinician | CL-FM-002 | Per time point |
| 2 | OASIS QA Review with scoring worksheet | QA Reviewer | CL-FM-031 OASIS Pre-Submission QA Checklist; CL-FM-032 OASIS Coding Decision Worksheet | Within 7 days |
| 3 | Return for clinician edit if needed (no coercion; evidence-based) | QA + Clinician | Evidence memo | Within 7 days |
| 4 | Lock OASIS | Clinician | System lock | Per CMS: M0090 date |
| 5 | Transmit to CMS (through HHA or vendor) within 30 days | OASIS Coord | CMS submission | Within 30 days of M0090 |
| 6 | Confirm acceptance | OASIS Coord | CL-FM-045 OASIS Transmission Confirmation Log | Upon CMS response |
| 7 | Address rejections; retransmit | OASIS Coord | Correction record | Per CMS |
| 8 | Post-submission corrections (if needed) | OASIS Coord | CMS correction submission | Per CMS inactivation/correction rules |
| 9 | Clinician competency validation (annual) | Clinical Mgr | CL-FM-051 Clinician Competency Validation — OASIS | Annual |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-002, CL-FM-031, CL-FM-032, CL-FM-045, CL-FM-051, CL-OA-006 source evidence matrix (CL-FM-050).

### 8. APPROVALS
QA Reviewer signs pre-submission; Clinical Manager signs competency annually.

### 9. OUTPUTS
QA'd OASIS; transmission confirmation; correction records; competency attestations.

### 10. SLA / DEADLINES
Transmission within 30 days of M0090 assessment completion (42 CFR § 484.45). Correction per CMS rules.

### 11. ESCALATION LOGIC
Transmission failure → OASIS Coord + IT within 24h; escalate to CMS QIES help if system issue. Pattern of coding errors → PIP and retraining.

### 12. FAILURE CONDITIONS
Missed 30-day transmission = § 484.45 deficiency + APU penalty. OASIS fabrication/manipulation = False Claims Act.

### 13. AUDIT REQUIREMENTS
QA checklist per OASIS; transmission log complete; clinician competency file current.

---

## CL-WF-06 — PLAN OF CARE (POC / CMS-485) ESTABLISHMENT & PHYSICIAN SIGNATURE

### 1. POLICY REFERENCES
- CL-CP-001 POC Development; CL-CP-002 POC Coordination; 42 CFR § 484.60

### 2. PROCESS OVERVIEW
Develops individualized POC at SOC; obtains physician signature within 30 days of SOC; reviews/revises at least every 60 days.

### 3. TRIGGER(S)
- SOC
- Recertification (every 60 days)
- Material change requiring revision

### 4. RESPONSIBLE ROLES
- **Primary:** Assessing clinician (RN / PT)
- **Supporting:** All disciplines (for discipline-specific orders); Physician; Clinical Mgr
- **Approval:** Physician signature

### 5. INPUTS
- Comprehensive assessment; OASIS; physician orders; specialty input

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Draft POC (diagnoses, goals, interventions, visit frequency, DME, safety measures) | Clinician | CL-FM-005 Plan of Care (485 Form) | Within 5 days of SOC (CoP) |
| 2 | Coordinate with all disciplines | Clinical Mgr | CL-FM-035 Coordination of Care Communication Log | Within 5 days |
| 3 | Transmit to physician for signature | Clinical Mgr / Office | Transmittal log | Within 5 days |
| 4 | Track receipt of signature | Billing/Office | CL-FM-008 Physician Order Signature Tracking Log | Within 30 days of SOC |
| 5 | Update POC upon change | Clinician | Updated CL-FM-005 + CL-FM-057 Active POC Change Notification Log | Within 24h of change |
| 6 | Review at recert (every 60 days) | Recert clinician | Updated CL-FM-005 | Each recert |
| 7 | Escalate signature delays | Office | Escalation log | Day 21 post-SOC |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-005, CL-FM-008, CL-FM-035, CL-FM-057, CL-FM-044 Physician Recertification Tracking Log.

### 8. APPROVALS
Physician signature required; Clinical Manager reviews POC completeness.

### 9. OUTPUTS
Signed POC in chart; signature tracking log current; coordination log.

### 10. SLA / DEADLINES
- POC draft within 5 days of SOC.
- Physician signature within 30 days of SOC (CMS requirement).
- Review/revise every 60 days.

### 11. ESCALATION LOGIC
Day 21 post-SOC: Clinical Manager contacts physician. Day 30: escalate to Administrator. Day 45: billing held; documented physician noncooperation.

### 12. FAILURE CONDITIONS
POC unsigned >30 days = claim denial risk + CoP deficiency. Visits outside POC orders = non-payable.

### 13. AUDIT REQUIREMENTS
Every active episode has signed POC; tracking log current.

---

## CL-WF-07 — PHYSICIAN ORDERS & VERBAL ORDER AUTHENTICATION

### 1. POLICY REFERENCES
- CL-CP-003 Orders Management; 42 CFR § 484.60(b)

### 2. PROCESS OVERVIEW
Governs all physician orders: new orders, verbal orders, clarifications, and timely authentication.

### 3. TRIGGER(S)
- New clinical need identified at visit
- POC change
- Medication change
- Supply/DME need

### 4. RESPONSIBLE ROLES
- **Primary:** Clinician receiving order
- **Supporting:** Clinical Manager, Physician, Office
- **Approval:** Physician signature

### 5. INPUTS
- Clinical rationale; patient condition

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Obtain order (verbal, written, electronic) | Clinician | CL-FM-006 Physician Orders Sheet; CL-FM-007 Verbal Order Log | At time of order |
| 2 | Read-back / repeat-back verbal order | Clinician | CL-FM-007 | At receipt |
| 3 | Enter order in EHR with rationale | Clinician | EHR entry | Same day |
| 4 | Obtain physician signature (electronic or wet) | Office | CL-FM-008 Physician Order Signature Tracking Log | Within 30 days (CoP) |
| 5 | Clarify questionable orders before implementation | Clinician/Clinical Mgr | Clarification note | Before execution |
| 6 | Escalate delinquent signatures | Office/Clinical Mgr | Escalation log | Day 21 |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-006, CL-FM-007, CL-FM-008.

### 8. APPROVALS
Physician signature required for each order. Clinical Manager enforces signature tracking.

### 9. OUTPUTS
Signed orders in chart; verbal order log current; signature tracking log.

### 10. SLA / DEADLINES
Physician signature within 30 days (CoP). Verbal order entered same day.

### 11. ESCALATION LOGIC
Day 21: Clinical Manager outreach; Day 30: Administrator-level outreach; Day 45: billing suspended for non-signed.

### 12. FAILURE CONDITIONS
Unsigned orders = claim denial + CoP deficiency. Executing unauthorized orders = patient safety risk + liability.

### 13. AUDIT REQUIREMENTS
Each order traceable: chart → verbal log → signature tracking → signed order.

---

## CL-WF-08 — COORDINATION OF CARE & MULTIDISCIPLINARY COMMUNICATION

### 1. POLICY REFERENCES
- CL-CP-002; 42 CFR § 484.60(d); § 484.75

### 2. PROCESS OVERVIEW
Ensures all disciplines communicate, share findings, and integrate care with physician and other providers (hospital, SNF, hospice, community).

### 3. TRIGGER(S)
- Any discipline visit
- Physician/provider change
- Hospitalization / ED visit
- Transition event

### 4. RESPONSIBLE ROLES
- **Primary:** Case Manager (RN)
- **Supporting:** All disciplines
- **Approval:** Clinical Manager

### 5. INPUTS
- Visit findings; POC; provider contact info

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Each discipline communicates material findings to Case Manager and physician | Clinician | CL-FM-035 Coordination of Care Communication Log | Within 24h of visit |
| 2 | Multi-disciplinary case conference (complex cases) | Case Mgr | CL-FM-053 Multi-Disciplinary Care Conference Notes | Monthly / PRN |
| 3 | Notify physician of significant changes | Case Mgr/Clinician | Order / communication note | Same day |
| 4 | Coordinate with external providers (PCP, specialist, hospital) | Case Mgr | Communication log | PRN |
| 5 | Episode milestone tracking | Case Mgr | CL-FM-054 Episode Management Milestone Tracker | Per episode |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-035, CL-FM-053, CL-FM-054.

### 8. APPROVALS
Clinical Manager reviews complex-case conferences; approves deviations from POC.

### 9. OUTPUTS
Coordination log; conference notes; milestone tracker; physician communications.

### 10. SLA / DEADLINES
Same-day notification of significant changes; weekly or monthly case conferences for complex patients.

### 11. ESCALATION LOGIC
Unreachable physician for urgent change → supervising physician / cover / ED referral. Lack of response → documented and escalated to Clinical Manager.

### 12. FAILURE CONDITIONS
No coordination evidence = § 484.60(d) / § 484.75 deficiency; poor outcomes.

### 13. AUDIT REQUIREMENTS
Each chart shows coordination entries; case conferences for complex cases documented.

---

## CL-WF-09 — SKILLED VISIT DOCUMENTATION (RN / PT / OT / SLP / MSW)

### 1. POLICY REFERENCES
- CL-SD-001 Service Delivery; CL-SD-002 Documentation
- 42 CFR § 484.60(b), (c); § 484.110

### 2. POLICY SUMMARY / PROCESS OVERVIEW
Defines content, timing, authentication, and completion of skilled visit notes supporting POC and billing.

### 3. TRIGGER(S)
- Each scheduled visit

### 4. RESPONSIBLE ROLES
- **Primary:** Visiting clinician
- **Supporting:** Clinical Manager (QA)
- **Approval:** Clinical Manager (periodic QA)

### 5. INPUTS
- POC; physician orders; prior notes

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Perform visit per POC; document in real-time / point-of-care | Clinician | CL-FM-013 Clinical Skilled Note — RN; CL-FM-014 Clinical Skilled Note — PT/OT/SLP | At visit |
| 2 | Capture vitals, assessment, interventions, teaching, response, plan | Clinician | CL-FM-013/014 | At visit |
| 3 | Specialty add-ons (wound, cardiac, diabetic, pain, IV, pediatrics, MSW) | Clinician | CL-FM-017 Wound; CL-FM-023 Diabetic; CL-FM-024 Cardiac/Respiratory; CL-FM-040 IV Therapy; CL-FM-041 MSW; CL-FM-026 Pain; CL-FM-039 Pediatric | Per visit type |
| 4 | Sign/authenticate note | Clinician | EHR signature | Within 24h |
| 5 | Flag needed amendments (late entry) | Clinician | CL-FM-033 Late Entry / Amendment Documentation Form | Per policy |
| 6 | Clinical Mgr periodic QA of notes | Clinical Mgr | CL-FM-034 Clinical Record Completion Audit Checklist | Sample monthly |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-013, CL-FM-014, CL-FM-017, CL-FM-023, CL-FM-024, CL-FM-026, CL-FM-033, CL-FM-034, CL-FM-039, CL-FM-040, CL-FM-041.

### 8. APPROVALS
Clinician signs; Clinical Manager audits; physician signs orders/POC related to findings.

### 9. OUTPUTS
Completed, authenticated visit notes; amendment log; QA audit results.

### 10. SLA / DEADLINES
Note signed within 24 hours of visit (internal standard); physician order changes same day.

### 11. ESCALATION LOGIC
Unsigned notes >48h → Clinical Manager; pattern → clinician retraining + performance action.

### 12. FAILURE CONDITIONS
Untimely/unauthenticated note = CoP deficiency + claim denial risk. Back-dating = fraud (False Claims Act).

### 13. AUDIT REQUIREMENTS
Monthly QA sample; notes timestamped with authentication; amendment log.

---

## CL-WF-10 — HOME HEALTH AIDE SERVICES & SUPERVISION

### 1. POLICY REFERENCES
- CL-SD-003 HHA Services; 42 CFR § 484.75; § 484.80(h)(1)(iv); § 484.80(h)(2)(ii); § 484.80(h)(3)-(4); Appendix B § 484.80

### 2. PROCESS OVERVIEW
Assigns aide services per written instructions, documents care, and supervises: (a) every 14 days by RN when receiving skilled service, with direct onsite observation at least annually; (b) every 60 days by RN for aide-only patients, with semiannual direct onsite observation.

### 3. TRIGGER(S)
- Aide added to POC
- Skilled/aide-only status change
- Supervision due date

### 4. RESPONSIBLE ROLES
- **Primary:** RN Supervisor
- **Supporting:** HHA, Clinical Mgr
- **Approval:** Clinical Manager

### 5. INPUTS
- Written aide instructions (from POC); patient status; prior supervision records

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Written aide instructions derived from POC | RN | Aide instructions sheet (in chart) | At aide assignment |
| 2 | Aide documents every visit | HHA | CL-FM-015 Home Health Aide Visit Record | Each visit |
| 3 | Classify patient: skilled-patient vs aide-only | Case Mgr | Flag in chart | At SOC and change |
| 4 | For skilled-patient: RN supervisory visit with/without aide ≥ every 14 days | RN | CL-FM-042 Supervisory Visit Documentation (RN) | ≥ every 14 days |
| 5 | For skilled-patient: annual direct onsite observation while aide providing care | RN | CL-FM-042 (direct observation) | ≥ annually |
| 6 | For aide-only: RN visit ≥ every 60 days | RN | CL-FM-042 | ≥ every 60 days |
| 7 | For aide-only: semiannual direct onsite observation | RN | CL-FM-042 | ≥ every 6 months |
| 8 | If deficiency observed: retraining + competency evaluation | RN + Staff Dev | CL-FM-016 HHA Competency Evaluation Checklist; HR-FM-038 Competency Remediation Plan | Within 30 days |
| 9 | Annual aide competency review (CL-WF-11) | Staff Dev RN | CL-FM-016 | Annual |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-015, CL-FM-042, CL-FM-016, HR-FM-038, HR-FM-017, HR-FM-031 Job Description Acknowledgment.

### 8. APPROVALS
RN signs each supervisory visit; Clinical Manager signs annual direct observations.

### 9. OUTPUTS
Aide visit records; RN supervisory notes; direct observation forms; remediation records.

### 10. SLA / DEADLINES
- Skilled-patient: 14-day supervision; annual direct observation.
- Aide-only: 60-day RN visit; semiannual direct observation.

### 11. ESCALATION LOGIC
Missed supervision window → Clinical Manager alerted; visit scheduled within 7 days; variance documented. Deficiency → retraining mandatory; aide removed from patient until re-evaluated.

### 12. FAILURE CONDITIONS
Missed supervision = § 484.80 Condition-Level deficiency. Unsafe aide retained → patient harm + liability.

### 13. AUDIT REQUIREMENTS
Per-aide file with written instructions, supervisory records for each window, direct observation forms, competency evidence.

---

## CL-WF-11 — ANNUAL AIDE IN-SERVICE TRAINING (≥12 HOURS)

### 1. POLICY REFERENCES
- CL-SD-003; HR-TD-001; 42 CFR § 484.80(d)

### 2. PROCESS OVERVIEW
Each aide completes at least 12 hours of in-service training in each 12-month period under RN supervision.

### 3. TRIGGER(S)
- Aide anniversary / training window
- Deficiency identified (supplemental)

### 4. RESPONSIBLE ROLES
- **Primary:** Staff Development RN
- **Supporting:** HR, Clinical Mgr
- **Approval:** Staff Dev RN

### 5. INPUTS
- Aide roster; last completion date; curriculum

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Identify aides with training due in next 60 days | Staff Dev RN | Roster report | Quarterly |
| 2 | Assign curriculum | Staff Dev RN | Assignment log | Within 30 days of due |
| 3 | Deliver modules (RN-supervised) | Staff Dev RN | Session records | Per window |
| 4 | Document hours & topics | Staff Dev RN | HR-FM-017 Training Attendance; Training hour log | Per session |
| 5 | Competency check-offs | Staff Dev RN | CL-FM-016 HHA Competency Evaluation Checklist | At milestones |
| 6 | Certificate/attestation | Staff Dev RN | Aide file | At completion |
| 7 | Report completion status to Clinical Mgr | Staff Dev RN | Monthly report | Monthly |

### 7. REQUIRED FORMS & DOCUMENTS
HR-FM-017, CL-FM-016, HR-FM-024 CEU/Training Exception Request (if applicable).

### 8. APPROVALS
Staff Dev RN signs each module; Clinical Manager reviews completion.

### 9. OUTPUTS
Completion records per aide; hour log ≥12 in window; competency records.

### 10. SLA / DEADLINES
12 hours every 12 months per aide; no lapse allowed (no grace for CoP).

### 11. ESCALATION LOGIC
Aide approaching lapse → mandatory training scheduled; if not complete by due date → remove from patient assignments until completion.

### 12. FAILURE CONDITIONS
Missed 12-hour requirement = § 484.80(d) deficiency; potential CoP-level finding if systemic.

### 13. AUDIT REQUIREMENTS
Per-aide training record with hours, topics, RN supervisor, dates.

---

## CL-WF-12 — MEDICATION MANAGEMENT & RECONCILIATION

### 1. POLICY REFERENCES
- CL-SD-007 Medication Management; 42 CFR § 484.60(b); HH QRP Drug Regimen Review measure

### 2. PROCESS OVERVIEW
Reconciles medications at SOC, recert, any transition; reports and follows up on identified issues per HH QRP measure.

### 3. TRIGGER(S)
- SOC, ROC, Recert, Discharge, Hospitalization return, Medication change

### 4. RESPONSIBLE ROLES
- **Primary:** RN
- **Supporting:** Physician, Pharmacy consultant
- **Approval:** Clinical Manager

### 5. INPUTS
- Patient med list; hospital discharge meds; physician orders; OTC/supplements

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Full reconciliation at SOC/ROC | RN | CL-FM-019 Medication Reconciliation Worksheet | Day of visit |
| 2 | Identify issues (interactions, duplication, wrong dose/route, compliance) | RN | Issue log in CL-FM-019 | Day of visit |
| 3 | Contact physician for resolution | RN | CL-FM-006; CL-FM-007 | Same day |
| 4 | Follow up on resolution within 2 calendar days | RN | Follow-up note | Within 2 days |
| 5 | Patient/caregiver education on changes | RN | CL-FM-022 Patient Education Documentation Record | At visit |
| 6 | Maintain MAR for self-administration / admin visits | RN | CL-FM-018 MAR | Continuous |
| 7 | High-alert meds: double-check (RM-WF-13) | RN + 2nd | RM-FM-012 | Per administration |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-019, CL-FM-018, CL-FM-022, RM-FM-012, CL-FM-006, CL-FM-007.

### 8. APPROVALS
Clinical Manager audits reconciliation completeness monthly.

### 9. OUTPUTS
Reconciliation worksheets; issue resolution records; education records; MARs.

### 10. SLA / DEADLINES
Same-day physician contact for issues; 2-day follow-up; MAR current.

### 11. ESCALATION LOGIC
Unresolved issues ≥48h → Clinical Manager + physician escalation. Adverse drug event → QA-WF-05 RCA.

### 12. FAILURE CONDITIONS
Missed reconciliation = HH QRP measure failure + patient safety risk. Med errors = adverse events, malpractice.

### 13. AUDIT REQUIREMENTS
Reconciliation on every SOC/ROC/Recert; physician contact log; resolution evidence.

---

## CL-WF-13 — WOUND CARE & SPECIALTY CLINICAL PROTOCOLS

### 1. POLICY REFERENCES
- CL-SD-004 Wound Care; CL-SD-005 Specialty Protocols; 42 CFR § 484.60

### 2. PROCESS OVERVIEW
Standardized wound assessment, treatment per physician order, measurement, photography (if consented), and outcome monitoring. Also covers cardiac/respiratory, diabetic, pain, IV/infusion, and palliative pathways.

### 3. TRIGGER(S)
- Wound present at SOC or new during episode
- Specialty diagnosis requiring pathway

### 4. RESPONSIBLE ROLES
- **Primary:** Visiting RN (wound certified preferred); PT/OT for functional
- **Supporting:** Physician, wound consultant, Clinical Mgr
- **Approval:** Clinical Manager / Wound Expert

### 5. INPUTS
- POC orders; wound measurements; photos; risk assessment

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Wound assessment & flow sheet | RN | CL-FM-017 Wound Assessment & Care Flow Sheet | Each wound visit |
| 2 | Obtain consent for photographs (if used) | RN | CL-FM-029 Informed Consent (photo-specific) | Before photography |
| 3 | Apply evidence-based protocol per physician orders | RN | Protocol doc in chart | Per visit |
| 4 | Escalate non-healing / deterioration | RN/Clinical Mgr | Physician contact log | Immediately |
| 5 | Cardiac/respiratory monitoring | RN | CL-FM-024 Cardiac & Respiratory Monitoring Log | Per visit |
| 6 | Diabetic flow sheet | RN | CL-FM-023 Diabetic Management Flow Sheet | Per visit |
| 7 | Pain assessment & management | RN | CL-FM-026 Pain Assessment Scale & Management Log | Per visit |
| 8 | IV/Infusion monitoring | RN | CL-FM-040 IV / Infusion Therapy Monitoring Log | Per visit |
| 9 | Palliative / End-of-life plan | RN/MSW | CL-FM-037 Palliative/End-of-Life Care Plan | At appropriate stage |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-017, CL-FM-023, CL-FM-024, CL-FM-026, CL-FM-040, CL-FM-037, CL-FM-029.

### 8. APPROVALS
Physician orders all wound care; Clinical Manager audits; wound expert for complex.

### 9. OUTPUTS
Wound flow sheets; photos (if consented); specialty logs; physician communications.

### 10. SLA / DEADLINES
Per visit; escalation same day for deterioration.

### 11. ESCALATION LOGIC
Non-healing >2 weeks or deterioration → physician + wound specialist within 24h.

### 12. FAILURE CONDITIONS
Poor wound outcomes / pressure injuries = adverse events (QA-WF-05), potential avoidable hospitalization.

### 13. AUDIT REQUIREMENTS
Per-wound trend data; photos (with consent); physician contacts; outcomes tracked.

---

## CL-WF-14 — INFECTION CONTROL AT POINT OF CARE

### 1. POLICY REFERENCES
- CL-IC-001 Infection Prevention; 42 CFR § 484.70

### 2. PROCESS OVERVIEW
Standard precautions, bag technique, hand hygiene, PPE, patient-specific precautions (contact, droplet, airborne), and surveillance integration.

### 3. TRIGGER(S)
- Every visit
- Known infection
- Outbreak activation

### 4. RESPONSIBLE ROLES
- **Primary:** Visiting clinician
- **Supporting:** Infection Preventionist, Clinical Mgr

### 5. INPUTS
- Precautions status; PPE supply; hand hygiene materials

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Apply standard precautions at every visit | Clinician | CL-FM-021 Infection Control Precautions Checklist | Each visit |
| 2 | Bag technique: clean surface, only needed items, cleaned between visits | Clinician | CL-FM-021 | Each visit |
| 3 | Patient-specific precautions per condition (MRSA, C. diff, droplet) | Clinician | CL-FM-021 | Each visit |
| 4 | Report suspected infection to Infection Preventionist | Clinician | QA-FM-006 Infection Line List | Within 24h |
| 5 | Exposure incident management (BBP) | Clinician | HR-FM-014; HR-FM-021 | Immediate |
| 6 | Annual infection control training | Staff Dev/IP | HR-FM-017 | Annual |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-021, QA-FM-006, HR-FM-014, HR-FM-017, HR-FM-021.

### 8. APPROVALS
Infection Preventionist signs surveillance; Clinical Manager audits.

### 9. OUTPUTS
Precautions checklist per visit (sampled); surveillance reports; exposure management records; training records.

### 10. SLA / DEADLINES
Every visit; reportable disease per statute; outbreak per IP protocol.

### 11. ESCALATION LOGIC
Outbreak / cluster → RM-WF-06 activation; public health notification.

### 12. FAILURE CONDITIONS
Non-compliance = § 484.70 deficiency + patient harm + staff exposure.

### 13. AUDIT REQUIREMENTS
Audit sample of infection control compliance; surveillance logs; exposures.

---

## CL-WF-15 — TELEHEALTH SERVICE DELIVERY

### 1. POLICY REFERENCES
- CL-SD-006 Telehealth; 42 CFR § 409.46; 45 CFR § 164.312 (HIPAA)

### 2. PROCESS OVERVIEW
Delivers telehealth visits (adjunct to POC, or allowed billable modalities) with consent, documentation, technology security.

### 3. TRIGGER(S)
- Telehealth included in POC
- Patient requests / agrees

### 4. RESPONSIBLE ROLES
- **Primary:** Clinician
- **Supporting:** Patient/caregiver, IT
- **Approval:** Physician (order); Clinical Mgr (operations)

### 5. INPUTS
- Physician order; platform; patient consent

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Obtain physician order for telehealth as part of POC | Clinician | CL-FM-005; CL-FM-006 | Before first encounter |
| 2 | Patient consent to telehealth; technical readiness check | Clinician | CL-FM-025 Telehealth Service Consent & Documentation | Before first encounter |
| 3 | Verify HIPAA-secure platform | IT/Compliance | IT-FM-020 Cloud Service Provider Security Questionnaire; CO-FM-016 BAA | Pre-deployment / annual |
| 4 | Conduct visit; document | Clinician | Visit note + CL-FM-025 | Each encounter |
| 5 | Follow missed-visit / alternative in-person if telehealth fails | Clinician | CL-FM-011 | As needed |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-025, CL-FM-005, CL-FM-006, CO-FM-016, IT-FM-020.

### 8. APPROVALS
Physician orders; Clinical Manager operational oversight; Compliance for platform.

### 9. OUTPUTS
Consent, visit notes, platform audit.

### 10. SLA / DEADLINES
Consent before first encounter; note same day.

### 11. ESCALATION LOGIC
Technology failure → fall back to in-person within POC-frequency constraints.

### 12. FAILURE CONDITIONS
Telehealth without consent = patient rights violation. Non-secure platform = HIPAA breach.

### 13. AUDIT REQUIREMENTS
Per-patient telehealth consent; BAA for platform; visit notes.

---

## CL-WF-16 — PATIENT RIGHTS, ADMISSION CONSENT & ADVANCE DIRECTIVES

### 1. POLICY REFERENCES
- CL-PA-004 Patient Rights; 42 CFR § 484.50

### 2. PROCESS OVERVIEW
Delivers required patient rights notice at/before first visit; obtains informed consent; captures advance directives.

### 3. TRIGGER(S)
- Admission / SOC

### 4. RESPONSIBLE ROLES
- **Primary:** Admitting RN
- **Supporting:** Intake, Social Work
- **Approval:** Admitting RN attests

### 5. INPUTS
- Rights notice; consent forms; advance directive documentation

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Provide Patient Rights Notice orally & in writing | RN | CL-FM-027 Patient Rights & Responsibilities Acknowledgment | At or before first visit |
| 2 | Obtain informed consent | RN | CL-FM-029 Informed Consent Form | At/before first visit |
| 3 | Collect advance directives; document; educate | RN/MSW | CL-FM-028 Advance Directive Documentation & Review | At SOC and at change |
| 4 | Deliver HIPAA NPP (CO-WF-12) | RN/Intake | CO-FM-019 | At/before first visit |
| 5 | Deliver CMIA Confidentiality Statement (CA) | RN/Intake | Per CO-CA-001 | At/before first visit |
| 6 | Obtain Restraint-Free Environment attestation | RN | CL-FM-052 Restraint-Free Environment Attestation | At SOC |
| 7 | Document property inventory if taking possession | Field staff | CL-FM-017 Patient Property & Belongings Inventory (OP-FM-017 equivalent) | If applicable |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-027, CL-FM-028, CL-FM-029, CL-FM-052, CO-FM-019, OP-FM-017.

### 8. APPROVALS
Admitting RN attests; Clinical Manager audits.

### 9. OUTPUTS
Signed rights, consent, advance directive, NPP, attestations in chart.

### 10. SLA / DEADLINES
At/before first visit.

### 11. ESCALATION LOGIC
Refusal / incapacity → Social Work / Surrogate decision-maker; documented in chart; physician notified.

### 12. FAILURE CONDITIONS
Missing rights/consent = § 484.50 deficiency + patient autonomy violation.

### 13. AUDIT REQUIREMENTS
Every chart shows all admission documents signed/dated.

---

## CL-WF-17 — PATIENT / FAMILY EDUCATION

### 1. POLICY REFERENCES
- CL-PA-004; CL-SD-008 Education
- 42 CFR § 484.60(c)

### 2. PROCESS OVERVIEW
Structured patient/caregiver teaching and documentation with measurable learning outcomes.

### 3. TRIGGER(S)
- New diagnosis/treatment
- Medication change
- Skill transition (self-care)

### 4. RESPONSIBLE ROLES
- **Primary:** Clinician (discipline-appropriate)
- **Supporting:** MSW, Staff Dev
- **Approval:** Clinical Manager

### 5. INPUTS
- POC teaching goals; literacy; language; caregiver availability

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Identify learning needs | Clinician | Assessment | SOC and ongoing |
| 2 | Teach with teach-back | Clinician | CL-FM-022 Patient Education Documentation Record | Each teaching visit |
| 3 | Capture caregiver training (skills) | Clinician | CL-FM-046 Patient/Family Caregiver Training Record | Each teaching visit |
| 4 | Provide interpreter services if needed | Clinician/Intake | OP-FM-018 Interpreter Service Utilization Log | Per visit |
| 5 | Evaluate mastery; document outcomes | Clinician | CL-FM-022 | Ongoing |
| 6 | Escalate non-mastery risk (high-risk meds, wound care) → add visits / engage caregiver | Clinical Mgr | POC update | Per assessment |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-022, CL-FM-046, OP-FM-018.

### 8. APPROVALS
Clinician signs; Clinical Manager audits.

### 9. OUTPUTS
Education records; caregiver training records; interpreter usage log.

### 10. SLA / DEADLINES
Each teaching event documented at visit.

### 11. ESCALATION LOGIC
High-risk non-mastery → added teaching visits; MSW/caregiver engagement; potential safety plan.

### 12. FAILURE CONDITIONS
Poor education = avoidable readmission, quality measure impact.

### 13. AUDIT REQUIREMENTS
Education/caregiver records traceable; interpreter log.

---

## CL-WF-18 — RECERTIFICATION / RESUMPTION OF CARE (ROC)

### 1. POLICY REFERENCES
- CL-OA-001; 42 CFR § 484.55; § 484.60
- OASIS time points

### 2. PROCESS OVERVIEW
Completes required OASIS and POC review at 60-day recert and ROC after qualifying hospital/IRF/SNF stay.

### 3. TRIGGER(S)
- Day 56–60 of episode (recert)
- Return from qualifying inpatient stay (ROC)

### 4. RESPONSIBLE ROLES
- **Primary:** Recert clinician
- **Supporting:** Case Manager, Clinical Mgr, physician
- **Approval:** Physician (new orders), Clinical Mgr

### 5. INPUTS
- Current episode data; hospital records (for ROC); updated physician orders

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Identify due recerts on report | Case Mgr | Recert due report | Ongoing |
| 2 | Complete OASIS at required time point | Clinician | CL-FM-002; CL-FM-003 Recert / ROC Assessment | Last 5 days of 60-day episode |
| 3 | Review & revise POC | Clinician | CL-FM-005; CL-FM-057 POC Change Notification | Per visit |
| 4 | Physician recertification order & new F2F if required | Liaison | CL-FM-044 Physician Recertification Tracking Log | Per CMS |
| 5 | Transmit OASIS (CL-WF-05) | OASIS Coord | CL-FM-045 | Within 30 days |
| 6 | If ROC: complete within 48 hours of knowledge of return | Clinician | CL-FM-003 | 48h of knowledge |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-002, CL-FM-003, CL-FM-005, CL-FM-044, CL-FM-045, CL-FM-057.

### 8. APPROVALS
Clinical Manager reviews; physician signs recert and new orders.

### 9. OUTPUTS
Completed recert/ROC OASIS; updated POC; physician recert confirmation.

### 10. SLA / DEADLINES
Recert in last 5 days of episode; ROC within 48h of return knowledge.

### 11. ESCALATION LOGIC
Missed window → Clinical Manager; document rationale; may impact billing.

### 12. FAILURE CONDITIONS
Late recert = episode lapses → billing loss; CoP deficiency.

### 13. AUDIT REQUIREMENTS
Timing of OASIS and POC signatures visible per episode.

---

## CL-WF-19 — TRANSFER / DISCHARGE PLANNING & EXECUTION

### 1. POLICY REFERENCES
- CL-DC-001 Discharge; 42 CFR § 484.50(d); § 484.55; § 484.60

### 2. PROCESS OVERVIEW
Plans transitions from the earliest clinically appropriate time; delivers required notice; coordinates handoffs; completes discharge assessments; transmits OASIS.

### 3. TRIGGER(S)
- Goals met; patient no longer needs services
- Hospitalization/transfer
- Patient/physician request
- Refusal of services; moved; deceased

### 4. RESPONSIBLE ROLES
- **Primary:** Case Manager
- **Supporting:** All disciplines; MSW; Clinical Mgr; physician
- **Approval:** Clinical Manager; physician

### 5. INPUTS
- Goals attainment; continuing care needs; physician order (if appropriate)

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Begin discharge planning at SOC | Case Mgr | DC plan section of POC | SOC |
| 2 | Notify patient/representative of planned DC | Case Mgr | Patient notice | ≥ 2 days pre-DC (per § 484.50(d)) |
| 3 | Conduct discharge visit & assessment | Clinician | CL-FM-004 Discharge / Transfer Assessment | On DC |
| 4 | Physician notification/agreement (if applicable) | Case Mgr | Physician communication | Per situation |
| 5 | Transfer/DC summary to next provider | Case Mgr | CL-FM-036 Transfer / Discharge Summary | At transition |
| 6 | Transmit discharge OASIS | OASIS Coord | CL-FM-002 (DC); CL-FM-045 | Within 30 days |
| 7 | Offer community resources / MSW handoff | MSW | Resource list | Per need |
| 8 | Close chart administratively | Records | Record closure | Within 14 days of DC |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-002 (DC), CL-FM-004, CL-FM-036, CL-FM-045.

### 8. APPROVALS
Clinical Manager signs DC; physician concurrence for appropriate transitions.

### 9. OUTPUTS
DC notice, DC assessment, summary, OASIS, chart closure.

### 10. SLA / DEADLINES
2-day notice; DC assessment at DC; OASIS transmission 30 days; chart closure 14 days.

### 11. ESCALATION LOGIC
Patient objects → Social Work; discharge appeal information provided; process documented.

### 12. FAILURE CONDITIONS
Improper DC = § 484.50(d) violation; harm; readmission. No handoff = care continuity failure.

### 13. AUDIT REQUIREMENTS
DC documents, OASIS, summary, physician communication per chart.

---

## CL-WF-20 — MISSED VISIT MANAGEMENT

### 1. POLICY REFERENCES
- CL-SD-009 Visit Frequency; 42 CFR § 484.60

### 2. PROCESS OVERVIEW
Handles missed visits (patient refusal, not home, clinical reason), documents, notifies, reschedules, and monitors frequency compliance.

### 3. TRIGGER(S)
- Missed visit event

### 4. RESPONSIBLE ROLES
- **Primary:** Visiting clinician; Scheduler
- **Supporting:** Case Manager, Clinical Mgr
- **Approval:** Clinical Manager

### 5. INPUTS
- Visit schedule; missed reason; POC frequency

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Document missed visit with reason | Clinician | CL-FM-011 Missed Visit Documentation Form | Same day |
| 2 | Notify Case Manager & physician (if clinically material) | Clinician | Communication log | Same day |
| 3 | Reschedule per POC | Scheduler | Updated schedule | Within 24h |
| 4 | Track frequency compliance | Case Mgr | CL-FM-012 Visit Frequency Compliance Tracking Log | Weekly |
| 5 | Weather / inclement event documentation | Clinician | CL-FM-048 Inclement Weather Service Delay Documentation | Per event |
| 6 | Patterns / patient non-cooperation → multidisciplinary / physician review | Case Mgr | CL-FM-053 | As triggered |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-011, CL-FM-012, CL-FM-048, CL-FM-053.

### 8. APPROVALS
Clinical Manager reviews patterns; physician involved in clinical decisions.

### 9. OUTPUTS
Missed visit log; rescheduling evidence; frequency tracker; weather log.

### 10. SLA / DEADLINES
Same-day documentation; 24-hour rescheduling.

### 11. ESCALATION LOGIC
Three consecutive missed visits / patient refusal → Clinical Manager + physician; discharge consideration if appropriate.

### 12. FAILURE CONDITIONS
Unjustified missed visits = billing risk (LUPA), quality risk. Undocumented missed visits = audit finding.

### 13. AUDIT REQUIREMENTS
Missed visit log complete; reasons documented; reschedule evidence.

---

## CL-WF-21 — CLINICAL RECORD COMPLETION & AMENDMENT

### 1. POLICY REFERENCES
- CL-OA-006 Documentation Hierarchy; CO-DC-001 Documentation Compliance
- 42 CFR § 484.110

### 2. PROCESS OVERVIEW
Ensures each chart is complete, legible, authenticated, dated, timed, and amendments are made per rules (no back-dating, no alteration of original).

### 3. TRIGGER(S)
- Episode close / recert
- QA audit
- Amendment need

### 4. RESPONSIBLE ROLES
- **Primary:** Clinician (author)
- **Supporting:** Clinical Manager (QA), Records
- **Approval:** Clinical Manager

### 5. INPUTS
- Chart contents

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Complete required content per policy | Clinician | CL-FM-013/014/015 etc. | Per visit |
| 2 | Authenticate (signature, date, time) | Clinician | EHR | Within 24h |
| 3 | QA completion audit (sample) | Clinical Mgr | CL-FM-034 Clinical Record Completion Audit Checklist | Monthly sample |
| 4 | Evidence-source prioritization for discrepancies | QA Reviewer | CL-FM-050 Documentation Source Evidence Matrix | Per review |
| 5 | Amendments via proper process (addendum, dated, explained) | Clinician | CL-FM-033 Late Entry/Amendment Documentation Form | Per need |
| 6 | Record completeness certification at episode close | Records | Completeness attestation | Within 30 days of DC |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-033, CL-FM-034, CL-FM-050, CO-FM-038 Documentation Correction & Amendment Audit Log (cross-domain).

### 8. APPROVALS
Clinical Manager approves; Records certifies closure.

### 9. OUTPUTS
Completed charts; QA audit results; amendment records.

### 10. SLA / DEADLINES
Notes within 24h; episode closure within 30 days of DC.

### 11. ESCALATION LOGIC
Pattern of incomplete records → clinician retraining / performance action; systemic → PIP.

### 12. FAILURE CONDITIONS
Incomplete/late documentation = CoP + claim denial + False Claims Act risk.

### 13. AUDIT REQUIREMENTS
Audit sample monthly; amendment logs; full chart retrievable within 4 business days (§ 484.110).

---

## CL-WF-22 — ABUSE / NEGLECT / EXPLOITATION REPORTING

### 1. POLICY REFERENCES
- CL-PA-004; CA W&I Code (elder abuse); Adult Protective Services; 42 CFR § 484.50(e)
- HR-FM-033 Mandatory Reporter Attestation

### 2. PROCESS OVERVIEW
Mandatory recognition, intervention, and reporting of suspected abuse, neglect, exploitation, or self-neglect.

### 3. TRIGGER(S)
- Observed or disclosed abuse/neglect/exploitation
- Unexplained injuries, deterioration
- Patient/caregiver behavior indicating harm

### 4. RESPONSIBLE ROLES
- **Primary:** Any clinician (mandatory reporter)
- **Supporting:** MSW, Clinical Mgr, Compliance, Legal
- **Approval:** Administrator briefed

### 5. INPUTS
- Observations; patient statement; caregiver statement

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Immediate safety assessment | Clinician | Chart note | At observation |
| 2 | Report to supervisor / Clinical Mgr | Clinician | Incident report | Same day |
| 3 | Complete abuse/neglect report form | Clinician | CL-FM-030 Abuse / Neglect Incident Report | Same day |
| 4 | Report to APS/CPS/law enforcement per state law | Clinical Mgr/MSW | Submission records | Per statute (often ≤24h; telephonic immediately, written ≤2 days) |
| 5 | Notify physician | Case Mgr | Communication | Same day |
| 6 | Safety plan with patient/caregiver/agencies | MSW | Safety plan doc | Same day / 24h |
| 7 | Document all actions, contacts, receipts | Compliance | Case file | Continuous |
| 8 | QA RCA for patterns | QAPI Lead | QA-FM-004 | Per pattern |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-030, HR-FM-033, QA-FM-004, CL-FM-053.

### 8. APPROVALS
Clinical Manager / MSW coordinate; Administrator briefed for material cases; Legal if complex.

### 9. OUTPUTS
Incident report, agency submission confirmation, safety plan, follow-up evidence.

### 10. SLA / DEADLINES
Reporting per state law (typically telephonic immediately; written ≤2 working days).

### 11. ESCALATION LOGIC
Life-threat → 911 immediately; Administrator + Legal within 4h. Staff perpetrator → HR + Compliance + law enforcement.

### 12. FAILURE CONDITIONS
Failure to report = criminal liability + license revocation + patient harm.

### 13. AUDIT REQUIREMENTS
Per-case file with all reports, agency confirmations, safety plans; mandatory reporter attestations on file (HR-FM-033).

---

## CL-WF-23 — PATIENT COMPLAINT / GRIEVANCE HANDLING

### 1. POLICY REFERENCES
- CL-PA-004; 42 CFR § 484.50(e)

### 2. PROCESS OVERVIEW
Receives, investigates, resolves, and documents patient/caregiver complaints with defined timelines.

### 3. TRIGGER(S)
- Any expression of dissatisfaction (oral or written)

### 4. RESPONSIBLE ROLES
- **Primary:** Clinical Manager / Designated Grievance Officer
- **Supporting:** Clinicians, Compliance Officer, MSW

### 5. INPUTS
- Complaint details; patient record; staff statements

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Log complaint upon receipt | Any staff | CL-FM-049 Patient Complaint / Grievance Documentation | Within 24h |
| 2 | Acknowledge to patient in writing | Grievance Officer | Acknowledgment letter | Within 5 days (or state law tighter) |
| 3 | Investigate | Grievance Officer | Investigation file | Per timeline |
| 4 | Determine findings & corrective action | Grievance Officer + Clinical Mgr | QA-FM-005 | Per timeline |
| 5 | Written resolution to patient | Grievance Officer | Resolution letter | Within 30 days (or state law tighter) |
| 6 | Integrate trends into QAPI | QAPI Lead | QA-FM-003 | Monthly |
| 7 | Report aggregates to QAPI Committee (minutes), Compliance Committee (minutes) and Governing Body (minutes) | Administrator | **QA-FM-001 QAPI Committee Meeting Minutes**; **CO-FM-024 Compliance Committee Meeting Minutes**; **GV-FM-005 Governing Body Meeting Minutes Template**; GV-FM-023 Annual Compliance Report to Governing Body | Quarterly |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-049, QA-FM-005, QA-FM-003, GV-FM-023.

### 8. APPROVALS
Clinical Manager approves resolution; Compliance Officer reviews for systemic/regulatory issues.

### 9. OUTPUTS
Grievance log, investigation file, resolution letter, trend reports.

### 10. SLA / DEADLINES
Ack ≤5 days; resolution ≤30 days (or per state law if tighter).

### 11. ESCALATION LOGIC
Allegation of abuse/neglect → CL-WF-22. Allegation of HIPAA → CO-WF-10. Regulator complaint → CO-WF-05.

### 12. FAILURE CONDITIONS
Unresolved/unsystematic complaints = § 484.50(e) deficiency + OCR/CMS exposure.

### 13. AUDIT REQUIREMENTS
Per-complaint file; aggregate trend evidence; QAPI Committee Meeting Minutes (QA-FM-001), Compliance Committee Meeting Minutes (CO-FM-024), and Governing Body Meeting Minutes (GV-FM-005) evidencing quarterly aggregate reporting.

---

## CL-WF-24 — PEDIATRIC / PALLIATIVE / HIGH-RISK SPECIALTY PATHWAYS

### 1. POLICY REFERENCES
- CL-SD-005 Specialty Protocols; CL-PA-007 High-Risk Patient Monitoring

### 2. PROCESS OVERVIEW
Defined enhanced pathways for pediatrics, palliative/end-of-life, and high-risk (e.g., LVAD, ventilator, complex wound, infusion, frequent ED) patients.

### 3. TRIGGER(S)
- Patient meets pediatric/palliative/high-risk criteria

### 4. RESPONSIBLE ROLES
- **Primary:** Specialty-trained clinician; Case Manager
- **Supporting:** MSW, physician, specialty consultant, Clinical Mgr
- **Approval:** Clinical Manager

### 5. INPUTS
- POC; specialty assessment; risk stratification

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Specialty assessment | Clinician | CL-FM-039 Pediatric; CL-FM-037 Palliative/End-of-Life; CL-FM-047 High-Risk Patient Monitoring Protocol | At SOC / trigger |
| 2 | Customize POC with specialty orders | Clinician + physician | CL-FM-005 | Within 5 days |
| 3 | Enhanced monitoring / frequency | Case Mgr | CL-FM-054 Episode Milestone Tracker | Per protocol |
| 4 | Prior authorization if needed | Billing/Admissions | CL-FM-055 Prior Authorization Request Log | Per payer |
| 5 | Multi-disciplinary conference | Case Mgr | CL-FM-053 | Monthly / PRN |
| 6 | Safety and caregiver training enhanced | Clinician | CL-FM-046 | Ongoing |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-037, CL-FM-039, CL-FM-047, CL-FM-053, CL-FM-054, CL-FM-055, CL-FM-046.

### 8. APPROVALS
Clinical Manager signs specialty POC; physician orders; specialty consultant (if involved).

### 9. OUTPUTS
Specialty assessment, customized POC, enhanced monitoring records, caregiver training.

### 10. SLA / DEADLINES
Per specialty protocol; prior auth per payer.

### 11. ESCALATION LOGIC
Material change or deterioration → physician + specialist + Clinical Manager within 24h.

### 12. FAILURE CONDITIONS
Inadequate specialty care = adverse events + liability.

### 13. AUDIT REQUIREMENTS
Specialty documentation in chart; conference records; outcomes tracked.

---

## CL-WF-25 — CLINICIAN COMPETENCY VALIDATION (INCL. OASIS)

### 1. POLICY REFERENCES
- HR-TA-001 Credentialing; CL-OA-001 OASIS; 42 CFR § 484.115; § 484.80

### 2. PROCESS OVERVIEW
Validates initial and ongoing competency for each discipline (RN, LVN/LPN, PT, OT, SLP, MSW, HHA) and OASIS-specific.

### 3. TRIGGER(S)
- Hire / orientation
- Annual competency review
- Post-event (error, deficiency)
- Role / task change

### 4. RESPONSIBLE ROLES
- **Primary:** Staff Development RN / Clinical Manager
- **Supporting:** HR, discipline leaders
- **Approval:** Clinical Manager

### 5. INPUTS
- Job description; competency checklists; observation records

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Initial competency at orientation | Staff Dev | HR-FM-007; CL-FM-051 (OASIS); CL-FM-016 (HHA) | Before independent practice |
| 2 | Clinical staff competency validation (annual) | Staff Dev | CL-FM-034 (records audit); CL-FM-051 (OASIS); HR-FM-016 Clinical Staff Competency Validation Checklist | Annual |
| 3 | Skills assessments, standardized tool check-offs | Staff Dev | CL-FM-056 Standardized Assessment Tool Administration Checklist | Annual |
| 4 | Remediation for deficiencies | Staff Dev / Manager | HR-FM-038 Competency Remediation Plan | Within 30 days |
| 5 | Retraining/skill validation | Staff Dev | CL-FM-016; CL-FM-051 | Post-event |

### 7. REQUIRED FORMS & DOCUMENTS
CL-FM-016, CL-FM-051, CL-FM-056, CL-FM-034, HR-FM-016, HR-FM-038, HR-FM-007.

### 8. APPROVALS
Clinical Manager signs competency; HR files.

### 9. OUTPUTS
Competency files per person; remediation records.

### 10. SLA / DEADLINES
Initial before independent practice; annual per anniversary; post-event within 30 days.

### 11. ESCALATION LOGIC
Competency failure → remove from related task; formal remediation; if not achievable → job change or termination.

### 12. FAILURE CONDITIONS
Uncredentialed/incompetent delivery = § 484.115 deficiency + patient harm.

### 13. AUDIT REQUIREMENTS
Per-person competency file; retention per HR policy (typically life of employment + 7 years).

---

## MEETING MINUTES MATRIX (CL DOMAIN)

Every clinical workflow that triggers aggregate QAPI reporting, adverse-event escalation, or Governing Body notice must generate committee/board minutes as the primary audit artifact.

| Workflow | Body Convened | Minutes Artifact | Retention |
|----------|---------------|------------------|-----------|
| CL-WF-04 Adverse Event / Sentinel | QAPI Committee (RCA review) + Compliance Committee (if breach/FCA) + Governing Body (material events) | **QA-FM-001 QAPI Committee Meeting Minutes**; **CO-FM-024 Compliance Committee Meeting Minutes**; **GV-FM-005 Governing Body Meeting Minutes** | 7 yrs / 10 yrs (FCA SOL) |
| CL-WF-05 Infection Control Surveillance | QAPI Committee (quarterly IP report) | **QA-FM-001** | 6 yrs |
| CL-WF-10 OASIS Coding QA | QAPI Committee (monthly) | **QA-FM-001** | 5 yrs post-discharge |
| CL-WF-17 Physician Order / F2F Compliance | Compliance Committee (if denial pattern) | **CO-FM-024** | 5 yrs post-discharge |
| CL-WF-19 Restraint-Free Environment Attestation | Governing Body (annual approval) | **GV-FM-005** | 7 yrs |
| CL-WF-21 Patient Complaint Aggregate Reporting | QAPI Committee + Compliance Committee + Governing Body | **QA-FM-001** + **CO-FM-024** + **GV-FM-005** | 5 yrs post-discharge |
| CL-WF-23 Clinical Record Completion Audit | QAPI Committee (monthly) | **QA-FM-001** | 5 yrs |
| CL-WF-24 Supervisory Visit Compliance | QAPI Committee (quarterly) | **QA-FM-001** | 5 yrs |
| CL-WF-25 Abuse/Neglect Reporting | Compliance Committee + Governing Body (executive session) | **CO-FM-024** + **GV-FM-005** + **GV-FM-022 Executive Session Minutes** | 10 yrs |

---

## DOMAIN-LEVEL VALIDATION CHECK

- [x] All CL subdomains (PA, CP, OA, SD, IC, DC) covered.
- [x] All 57 CL-FM forms (CL-FM-001..057) referenced.
- [x] Cross-domain forms (HR-FM-007, HR-FM-016, HR-FM-017, HR-FM-033, HR-FM-038, OP-FM-014, OP-FM-015, OP-FM-017, OP-FM-018, CO-FM-016, CO-FM-019, CO-FM-021, CO-FM-038, QA-FM-003, QA-FM-004, QA-FM-005, QA-FM-006, RM-FM-012, IT-FM-020, EN-FM-001, GV-FM-005, GV-FM-016, GV-FM-023) mapped.
- [x] Every workflow includes forms, deadlines, approvals, escalation, failure conditions, audit requirements.
- [x] Federal citations across § 484.45, .50, .55, .60, .65, .70, .75, .80, .110, .115, .245.
- [x] Clinical staff job descriptions cross-referenced — see Appendix below.

---

## APPENDIX — CLINICAL STAFF JOB DESCRIPTION REFERENCES

The following HR-JD series documents define the qualifications, scope of practice, and regulatory responsibilities for all clinical staff performing services in this domain. These are controlled documents maintained in the Forms Library under HR Domain, JD Subdomain. All clinical staff must meet the minimum qualifications specified in their respective JD per 42 CFR § 484.115.

| JD Code | Title | Primary CL Workflows | Scope Authority |
|---------|-------|----------------------|-----------------|
| HR-JD-003 | Director of Nursing / Clinical Manager | CL-WF-04, CL-WF-05, CL-WF-09, CL-WF-10, CL-WF-23, CL-WF-24 | OASIS authorization; clinical oversight; HHA supervision authority |
| HR-JD-004 | Clinical Designee (RN) | CL-WF-04, CL-WF-09, CL-WF-10 | DON authority during absence |
| HR-JD-005 | Registered Nurse (RN) | CL-WF-04, CL-WF-05, CL-WF-06, CL-WF-07, CL-WF-09, CL-WF-10, CL-WF-11, CL-WF-12, CL-WF-24 | OASIS completion; HHA supervisory visits (§ 484.80) |
| HR-JD-006 | Licensed Vocational Nurse (LVN) | CL-WF-09, CL-WF-12 | Skilled visits under RN supervision; no OASIS completion |
| HR-JD-007 | Home Health Aide (HHA) | CL-WF-10, CL-WF-11 | Personal care per plan of care; supervised by RN (§ 484.80) |
| HR-JD-008 | Medical Social Worker (MSW) | CL-WF-09, CL-WF-08 | Skilled social work services; care coordination |
| HR-JD-009 | Physical Therapist (PT) | CL-WF-09, CL-WF-05, CL-WF-08 | OASIS completion authorized when primary skilled service |
| HR-JD-010 | Occupational Therapist (OT) | CL-WF-09, CL-WF-08 | OASIS completion authorized (continuing service only per Medicare policy) |
| HR-JD-011 | Speech-Language Pathologist (SLP) | CL-WF-09, CL-WF-05, CL-WF-08 | OASIS completion authorized when primary skilled service |

**Clinical Workflow JD Integration Requirements:**

- **CL-WF-04 (SOC Assessment):** Assessing clinician must meet qualifications in HR-JD-005 (RN), HR-JD-009 (PT), or HR-JD-011 (SLP) per Medicare policy. Director of Nursing (HR-JD-003) authorizes OASIS.
- **CL-WF-10 (HHA Services & Supervision):** HHA must meet HR-JD-007 qualifications including 42 CFR § 484.75 competency. Supervisory visits conducted by RN (HR-JD-005) per § 484.80.
- **CL-WF-11 (HHA Annual In-Service Training):** HR-JD-007 specifies 12-hour/year minimum in-service requirement. Training content and documentation per § 484.75(e).
- **CL-WF-09 (Skilled Visit Documentation):** Each discipline's documentation responsibilities are defined in their respective JD (HR-JD-005 through HR-JD-011).
- **CL-WF-24 (Supervisory Visit Compliance):** HHA supervisory visit schedule and documentation requirements per HR-JD-005 (RN responsibility) and HR-JD-007 (HHA cooperation requirement).
