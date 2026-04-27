# CL — CLINICAL QUALITY AUDIT LAYER

> Hardened audit workflows that consume evidence from the operational
> Clinical Operations workflows (CL-WF-01..25) and feed deficiencies into
> QA-WF-03 (Quarterly QAPI Committee Review), QA-WF-05 (Adverse Event RCA),
> and CO-WF-04 (Internal Compliance Audit Cycle). Each audit is multi-process
> (one audit covers many operational workflows) per CES design rule.

---

## CL-WF-26 — PLAN OF CARE AUDIT

### 1. POLICY REFERENCES
- CL-PA-005 Plan of Care; CL-PA-007 Care Coordination; 42 CFR § 484.60; 42 CFR § 484.55

### 2. PROCESS OVERVIEW
Monthly stratified-sample audit of active Plans of Care to verify physician signature timeliness, goal/intervention alignment, individualization, update cadence, and discipline coverage. Consumes evidence produced by CL-WF-04 (SOC), CL-WF-06 (POC establishment), CL-WF-07 (orders), and CL-WF-18 (recert/ROC). Findings feed QA-WF-03 and CO-WF-04.

### 3. TRIGGER(S)
- **Time-based:** Calendar monthly (first business week)
- Conditional: spike in claim denials referencing POC defects → audit triggered immediately

### 4. RESPONSIBLE ROLES
- **Primary:** QA Reviewer (RN)
- **Supporting:** Clinical Manager, Medical Records
- **Approval:** Clinical Manager (audit report); Compliance Officer (CAP if systemic)

### 5. INPUTS
- Active POC roster from EMR (population frame)
- Sample size: 10% of active episodes, minimum 10, oversample any episode flagged by CL-WF-04 or CL-WF-18
- Source workflows: CL-WF-04, CL-WF-06, CL-WF-07, CL-WF-18

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull active episode list and apply stratified sampling (cert/recert/ROC strata) | QA Reviewer | CO-FM-022 | Day 1 |
| 2 | Score each POC against checklist (signature ≤30 days, goals SMART, interventions discipline-specific) | QA Reviewer | CO-FM-021 | Day 1–3 |
| 3 | Verify physician signature timestamps from CL-WF-06 evidence packet | QA Reviewer | CL-FM-005 | Day 3 |
| 4 | Compute domain pass/fail rates and itemize defects | QA Reviewer | CO-FM-024 | Day 4 |
| 5 | Issue Corrective Action for any episode-level failure | Clinical Mgr | QA-FM-005 | Day 5 |
| 6 | File audit report; queue findings for QA-WF-03 packet | QA Reviewer | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, CL-FM-005, QA-FM-005, QA-FM-025

### 8. APPROVALS
Clinical Manager signs audit report. Compliance Officer co-signs if defect rate >10% (systemic).

### 9. OUTPUTS
Signed Plan of Care Audit Report (CO-FM-024) with defect rate, episode-level findings, CAPs issued, and trend chart vs. prior 3 audits. Filed to /audit/<YYYY>/CL/CL-WF-26/.

### 10. SLA / DEADLINES
Monthly cycle completes within 7 business days of trigger. Findings must reach QA-WF-03 packet ≥5 business days before quarterly meeting.

### 11. ESCALATION LOGIC
Defect rate >10% or any unsigned POC > 30 days → immediate escalation to Compliance Officer; CAP routed via CO-WF-04. Repeat failure of same clinician across 2 consecutive cycles → HR-WF-09 disciplinary path. Findings always feed QA-WF-03 and CO-WF-22.

### 12. FAILURE CONDITIONS
Missed monthly cycle → blocks QA-WF-03 closure (audit-readiness gate). Sample size below threshold → audit invalid; re-run required. Failure to escalate >10% defect rate → False Claims Act exposure via CL-WF-04/CL-WF-06.

### 13. AUDIT REQUIREMENTS
Append-only audit log per cycle: sampling frame size, sample IDs, scoring sheets, defect register, CAP register, sign-off. Sample evidence retained ≥6 years. Cross-referenced to CL-WF-06, CL-WF-18, CO-WF-04, QA-WF-03.

---

## CL-WF-27 — OASIS ACCURACY AUDIT

### 1. POLICY REFERENCES
- CL-PA-003 OASIS; 42 CFR § 484.45; 42 CFR § 484.55

### 2. PROCESS OVERVIEW
Monthly stratified audit of OASIS submissions for accuracy (M-item logic, ICD-10 alignment, response consistency, transmission timeliness). Audits work product of CL-WF-05 (OASIS completion/transmission). Findings feed CL-WF-25 (clinician competency), QA-WF-03, and FN-WF-15 (RCM revenue integrity).

### 3. TRIGGER(S)
- **Time-based:** Monthly, anchored to OASIS submission cutoff
- Conditional: HHRG/HIPPS revenue variance >5% vs. prior month → audit triggered

### 4. RESPONSIBLE ROLES
- **Primary:** OASIS QA Specialist
- **Supporting:** Clinical Manager, Coder
- **Approval:** Clinical Manager; Compliance Officer for systemic

### 5. INPUTS
- All OASIS-D assessments transmitted that month (population frame)
- Sample: 10% per clinician, minimum 5 per clinician, all clinicians whose error rate in prior month was >5%
- Source workflow: CL-WF-05

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull transmitted OASIS dataset; apply stratified sampling (per-clinician strata) | OASIS QA | CO-FM-022 | Day 1 |
| 2 | Re-score each sampled OASIS against source documentation | OASIS QA | CL-FM-002 | Day 1–4 |
| 3 | Validate M0090 transmission timing and accepted/rejected status | OASIS QA | CL-FM-031 | Day 3 |
| 4 | Reconcile HHRG/HIPPS impact for any item changes | Coder | FN-FM-006 | Day 4 |
| 5 | Issue clinician-level remediation requirement → CL-WF-25 | Clinical Mgr | HR-FM-016 | Day 5 |
| 6 | Compile audit report with per-clinician scorecard and aggregate defect rate | OASIS QA | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, CL-FM-002, CL-FM-031, HR-FM-016, QA-FM-005

### 8. APPROVALS
Clinical Manager signs report; OASIS QA attests scoring; Compliance Officer reviews if defect rate >7% or revenue impact material.

### 9. OUTPUTS
Per-clinician OASIS Accuracy Scorecard, aggregate defect register, HHRG impact analysis, remediation queue for CL-WF-25.

### 10. SLA / DEADLINES
Cycle completes within 7 business days. Corrected OASIS resubmissions filed within 30 days of detection per CMS.

### 11. ESCALATION LOGIC
Per-clinician error rate >7% → mandatory CL-WF-25 competency revalidation. Any pattern of upcoding → CO-WF-08 (FWA) investigation. Material HHRG impact → FN-WF-15 RCM self-audit.

### 12. FAILURE CONDITIONS
Skipped audit cycle blocks QA-WF-03 quarterly closure. Failure to file corrected OASIS within 30 days → CMS payment integrity exposure. Failure to remediate clinician >7% error → CL-WF-05 quality regression.

### 13. AUDIT REQUIREMENTS
Per-cycle log: sampling frame size, sample IDs, per-clinician scoring, defect register, HHRG impact, CAP register. Cross-referenced to CL-WF-05, CL-WF-25, FN-WF-15, QA-WF-03. Retention ≥6 years.

---

## CL-WF-28 — VISIT DOCUMENTATION AUDIT

### 1. POLICY REFERENCES
- CL-PA-008 Documentation; 42 CFR § 484.110; 42 CFR § 484.60(b)

### 2. PROCESS OVERVIEW
Monthly audit of skilled visit notes for timeliness (≤24h), POC alignment, skilled-need narrative, and supervisor-signature presence. Covers all visit disciplines documented through CL-WF-09. Feeds QA-WF-03 and CO-WF-14 (Documentation Alignment Audit).

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: claim denial rate referencing missing notes >2% → immediate audit

### 4. RESPONSIBLE ROLES
- **Primary:** QA Reviewer
- **Supporting:** Clinical Manager
- **Approval:** Clinical Manager

### 5. INPUTS
- All visit notes filed in audit window (population frame)
- Sample: 10% per discipline, minimum 5 per discipline, oversample any visit flagged by CL-WF-20 (missed visits) or CL-WF-21 (record completion)
- Source workflows: CL-WF-09, CL-WF-20, CL-WF-21

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull visit population; stratify by discipline | QA Reviewer | CO-FM-022 | Day 1 |
| 2 | Score each note: filed ≤24h, signed, POC-aligned, skilled-need narrative | QA Reviewer | CO-FM-021 | Day 2–4 |
| 3 | Cross-check supervisor counter-signature for HHA per CL-WF-10 | QA Reviewer | CL-FM-015 | Day 3 |
| 4 | Compile per-clinician scorecard | QA Reviewer | CO-FM-024 | Day 5 |
| 5 | Issue CAPs; route systemic findings to CO-WF-14 | Clinical Mgr | QA-FM-005 | Day 6 |
| 6 | File report; feed packet to QA-WF-03 | QA Reviewer | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, CL-FM-015, QA-FM-005

### 8. APPROVALS
Clinical Manager signs audit report. Compliance Officer co-signs if late-filing rate >5%.

### 9. OUTPUTS
Visit Documentation Audit Report with timeliness/skilled-need/alignment scores, per-clinician scorecard, CAP register.

### 10. SLA / DEADLINES
Monthly cycle completes within 7 business days. CAPs assigned within 5 business days of finding.

### 11. ESCALATION LOGIC
Late-filing rate >5% → systemic CAP via CO-WF-14. Repeat clinician failure → HR-WF-09 + CL-WF-25. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03 closure. Late-filed notes pattern → claim denial / CMS PEPPER outlier risk. Unsigned HHA notes → 42 CFR § 484.80 deficiency.

### 13. AUDIT REQUIREMENTS
Per-cycle log: sampling frame, per-discipline scoring, CAP register. Retention ≥6 years. Cross-referenced to CL-WF-09, CL-WF-10, CL-WF-21, CO-WF-14, QA-WF-03.

---

## CL-WF-29 — CLINICAL RECORD COMPLETENESS AUDIT

### 1. POLICY REFERENCES
- CL-PA-010 Clinical Record; 42 CFR § 484.110; 42 CFR § 484.60

### 2. PROCESS OVERVIEW
Quarterly audit of closed and active clinical records for completeness against the 22-element record checklist (consent, advance directive, POC, orders, OASIS, visit notes, discharge summary, etc.). Aggregates findings across CL-WF-01 (intake), CL-WF-04 (SOC), CL-WF-19 (DC), CL-WF-21 (record completion). Feeds QA-WF-03 and CO-WF-14.

### 3. TRIGGER(S)
- **Time-based:** Quarterly
- Conditional: ADR (FN-WF-06) requesting missing record element

### 4. RESPONSIBLE ROLES
- **Primary:** Medical Records Auditor
- **Supporting:** QA Reviewer, Clinical Manager
- **Approval:** Clinical Manager; Compliance Officer for systemic

### 5. INPUTS
- All discharged records in quarter + 5% of active records (sample)
- Sample size: 10% of discharges minimum 15
- Source workflows: CL-WF-01, CL-WF-04, CL-WF-19, CL-WF-21, CL-WF-16

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Build sampling frame from EMR; apply discharge stratification | MR Auditor | CO-FM-022 | Day 1 |
| 2 | Score each record against 22-element completeness checklist | MR Auditor | CO-FM-021 | Day 2–6 |
| 3 | Verify advance directive captured per CL-WF-16 | MR Auditor | CL-FM-029 | Day 3 |
| 4 | Confirm DC summary filed per CL-WF-19 | MR Auditor | CL-FM-036 | Day 4 |
| 5 | Issue CAPs; route systemic findings to CO-WF-14 | Clinical Mgr | QA-FM-005 | Day 8 |
| 6 | Compile report; feed packet to QA-WF-03 | MR Auditor | CO-FM-024 | Day 10 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, CL-FM-029, CL-FM-036, QA-FM-005

### 8. APPROVALS
Clinical Manager signs; Compliance Officer co-signs if any record fails >3 elements.

### 9. OUTPUTS
Quarterly Record Completeness Report; per-record defect register; CAP register; trend vs prior quarter.

### 10. SLA / DEADLINES
Quarterly cycle completes within 10 business days; before QA-WF-03 packet deadline.

### 11. ESCALATION LOGIC
Defect rate >5% → CO-WF-14 systemic CAP. Missing record elements that block billing → FN-WF-15. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Missing 22-element items → 42 CFR § 484.110 citation risk. Systemic missing DC summaries → readmission rate inflation.

### 13. AUDIT REQUIREMENTS
Per-cycle log: frame, sample IDs, scoring, CAP register. Retention ≥6 years. Cross-referenced to CL-WF-01, CL-WF-04, CL-WF-19, CL-WF-21, CO-WF-14, QA-WF-03.

---

## CL-WF-30 — SKILLED NEED / MEDICAL NECESSITY REVIEW

### 1. POLICY REFERENCES
- CL-PA-002 Homebound; CL-PA-005 Plan of Care; 42 CFR § 409.42; 42 CFR § 409.44

### 2. PROCESS OVERVIEW
Monthly audit verifying that every active episode has documented skilled need, homebound justification, and medical necessity narrative supporting current visit frequency. Consumes evidence from CL-WF-02 (homebound), CL-WF-04 (SOC assessment), CL-WF-09 (visit notes). Feeds FN-WF-04 (claim submission) and FN-WF-15 (RCM self-audit).

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: ADR receipt (FN-WF-06); visit frequency increase >25%

### 4. RESPONSIBLE ROLES
- **Primary:** Clinical Manager
- **Supporting:** UR Nurse, Coder
- **Approval:** Clinical Manager; Compliance Officer for billing-impactful patterns

### 5. INPUTS
- Active episode list with current visit frequency
- Sample: 15% of active episodes, all episodes with frequency change in window
- Source workflows: CL-WF-02, CL-WF-04, CL-WF-09

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull active episode list with frequencies | Clinical Mgr | CO-FM-022 | Day 1 |
| 2 | Verify homebound documentation per CL-WF-02 | UR Nurse | CL-FM-009 | Day 2 |
| 3 | Verify skilled-need narrative in chart | UR Nurse | CO-FM-021 | Day 3 |
| 4 | Validate visit frequency vs. POC and acuity | UR Nurse | CL-FM-005 | Day 4 |
| 5 | Issue holds on any episode lacking justification | Clinical Mgr | CO-FM-021 | Day 5 |
| 6 | Compile report; feed billing exception list to FN-WF-15 | Clinical Mgr | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, CL-FM-005, CL-FM-009

### 8. APPROVALS
Clinical Manager signs report. Compliance Officer co-signs any pattern affecting >5% of episodes.

### 9. OUTPUTS
Skilled Need Audit Report; episode-level disposition (justified / hold / discharge); billing exception queue.

### 10. SLA / DEADLINES
Monthly. Holds applied within 24h of detection.

### 11. ESCALATION LOGIC
Pattern of insufficient skilled-need documentation → CO-WF-08 FWA review. Material findings → FN-WF-15. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missing skilled-need documentation → claim denial, False Claims Act exposure. Skipped cycle blocks QA-WF-03 closure.

### 13. AUDIT REQUIREMENTS
Per-cycle log: frame, sample IDs, dispositions, hold/discharge log. Retention ≥6 years. Cross-referenced to CL-WF-02, CL-WF-09, FN-WF-04, FN-WF-15, QA-WF-03.

---

## CL-WF-31 — MEDICATION MANAGEMENT AUDIT

### 1. POLICY REFERENCES
- CL-PA-012 Medication Management; 42 CFR § 484.60(b)

### 2. PROCESS OVERVIEW
Monthly audit of medication reconciliation, high-risk medication double-checks, and patient-education documentation. Aggregates evidence from CL-WF-12 (med management) and RM-WF-13 (high-risk med double-check). Feeds QA-WF-03 and QA-WF-05 (RCA when error pattern).

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: any medication-error incident report → immediate targeted audit

### 4. RESPONSIBLE ROLES
- **Primary:** Pharmacist Reviewer / RN auditor
- **Supporting:** Clinical Manager
- **Approval:** Clinical Manager; Medical Director for systemic

### 5. INPUTS
- Active episodes with medication regimens
- Sample: 10% of active episodes, all episodes with high-risk meds
- Source workflows: CL-WF-12, RM-WF-13, CL-WF-04

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull med-regimen sample frame | Pharm Reviewer | CO-FM-022 | Day 1 |
| 2 | Audit reconciliation completeness at SOC and recert | Pharm Reviewer | CL-FM-018 | Day 2–3 |
| 3 | Verify high-risk med double-check evidence per RM-WF-13 | Pharm Reviewer | RM-FM-012 | Day 3 |
| 4 | Audit patient education documentation | Pharm Reviewer | CL-FM-022 | Day 4 |
| 5 | Compile defect register; route any error to QA-WF-05 | Clinical Mgr | QA-FM-005 | Day 5 |
| 6 | File report; feed packet to QA-WF-03 | Pharm Reviewer | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, CL-FM-018, CL-FM-022, RM-FM-012, QA-FM-005

### 8. APPROVALS
Clinical Manager signs. Medical Director signs if pattern of error.

### 9. OUTPUTS
Medication Management Audit Report; reconciliation/double-check/education scorecards; CAP register; RCA queue.

### 10. SLA / DEADLINES
Monthly. RCA initiated within 24h of detected medication error.

### 11. ESCALATION LOGIC
Any medication error → QA-WF-05 RCA. Pattern → policy update via EN-WF-01. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03 closure. Undetected reconciliation gaps → adverse drug events; potential survey deficiency.

### 13. AUDIT REQUIREMENTS
Per-cycle log: frame, sample IDs, reconciliation/double-check status, error log, RCA links. Retention ≥6 years. Cross-referenced to CL-WF-12, RM-WF-13, QA-WF-05, QA-WF-03.

---

## CL-WF-32 — INFECTION CONTROL COMPLIANCE AUDIT

### 1. POLICY REFERENCES
- CL-PA-014 Infection Control; 42 CFR § 484.70

### 2. PROCESS OVERVIEW
Monthly audit of point-of-care infection-control practices: PPE compliance (observation), bag technique, hand hygiene, exposure response, surveillance log completeness. Aggregates evidence from CL-WF-14 (point-of-care IC) and QA-WF-06 (IC surveillance). Feeds QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: HAI cluster, exposure incident, regulatory IC alert

### 4. RESPONSIBLE ROLES
- **Primary:** Infection Preventionist
- **Supporting:** Clinical Manager
- **Approval:** Clinical Manager; Medical Director for cluster events

### 5. INPUTS
- IC surveillance log (QA-WF-06 output)
- Visit observation records
- Sample: 20 random visit observations + full surveillance log
- Source workflows: CL-WF-14, QA-WF-06

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Schedule and execute 20 visit observations | IP | CL-FM-021 | Day 1–4 |
| 2 | Score PPE / hand hygiene / bag technique compliance | IP | CO-FM-021 | Day 4 |
| 3 | Reconcile surveillance log completeness with QA-WF-06 | IP | QA-FM-027 | Day 5 |
| 4 | Audit exposure response evidence (HR-FM-014) | IP | HR-FM-014 | Day 5 |
| 5 | Issue CAPs; cluster events → QA-WF-05 RCA | Clinical Mgr | QA-FM-005 | Day 6 |
| 6 | Compile report; feed packet to QA-WF-03 | IP | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-024, CL-FM-021, QA-FM-027, HR-FM-014, QA-FM-005

### 8. APPROVALS
Clinical Manager + Infection Preventionist sign. Medical Director signs cluster-event reports.

### 9. OUTPUTS
IC Compliance Audit Report; observation scorecard; surveillance reconciliation; cluster log.

### 10. SLA / DEADLINES
Monthly. Cluster RCA initiated within 24h.

### 11. ESCALATION LOGIC
HAI cluster → QA-WF-05 + RM-WF-06 surge readiness check. PPE compliance <95% → systemic CAP via HR-WF-07 retraining. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unaddressed cluster → outbreak; survey deficiency; reportable to public health.

### 13. AUDIT REQUIREMENTS
Per-cycle log: observation roster, scoring, surveillance reconciliation, cluster log, CAPs. Retention ≥6 years. Cross-referenced to CL-WF-14, QA-WF-06, QA-WF-05, RM-WF-06, QA-WF-03.

---

## CL-WF-33 — CARE COORDINATION AUDIT

### 1. POLICY REFERENCES
- CL-PA-007 Care Coordination; 42 CFR § 484.60(d)

### 2. PROCESS OVERVIEW
Quarterly audit of multidisciplinary case-conference documentation, physician communication logs, and inter-discipline care-plan alignment. Aggregates evidence from CL-WF-08 (coordination of care) and CL-WF-09 (visit notes). Feeds QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Quarterly
- Conditional: complex case (>3 disciplines) → targeted episode audit

### 4. RESPONSIBLE ROLES
- **Primary:** Clinical Manager
- **Supporting:** QA Reviewer
- **Approval:** Clinical Manager

### 5. INPUTS
- Active multi-discipline episodes
- Sample: 15% of multi-discipline episodes
- Source workflows: CL-WF-08, CL-WF-09

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Identify multi-discipline episode population | Clinical Mgr | CO-FM-022 | Day 1 |
| 2 | Audit case-conference documentation cadence | Clinical Mgr | CL-FM-053 | Day 2–4 |
| 3 | Audit physician communication log evidence | Clinical Mgr | CL-FM-054 | Day 4 |
| 4 | Verify cross-discipline goal alignment in POC | QA Reviewer | CL-FM-005 | Day 5 |
| 5 | Issue CAPs; report to QA-WF-03 | Clinical Mgr | QA-FM-005 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, CL-FM-005, CL-FM-053, CL-FM-054, QA-FM-005

### 8. APPROVALS
Clinical Manager signs.

### 9. OUTPUTS
Quarterly Care Coordination Audit Report; episode-level scorecard; CAP register.

### 10. SLA / DEADLINES
Quarterly cycle ≤7 business days; before QA-WF-03 packet deadline.

### 11. ESCALATION LOGIC
Coordination gap pattern → policy update via EN-WF-01. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Coordination gaps → re-hospitalization risk, survey deficiency.

### 13. AUDIT REQUIREMENTS
Per-cycle log: frame, sample IDs, scorecards, CAPs. Retention ≥6 years. Cross-referenced to CL-WF-08, CL-WF-22, QA-WF-03.

---

## CL-WF-34 — REHOSPITALIZATION REVIEW

### 1. POLICY REFERENCES
- CL-PA-007 Care Coordination; 42 CFR § 484.65 (QAPI outcome)

### 2. PROCESS OVERVIEW
Monthly review of all unplanned acute-care hospitalizations (ACH) and emergency-department use during home-health episodes. Performs root-cause analysis pattern detection across CL-WF-09 (visit care), CL-WF-12 (med mgmt), CL-WF-08 (coordination). Feeds QA-WF-03 and QA-WF-04 (PIP lifecycle).

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: any ACH event → individual review within 5 business days

### 4. RESPONSIBLE ROLES
- **Primary:** Clinical Manager
- **Supporting:** QA Reviewer
- **Approval:** Clinical Manager; Medical Director if pattern

### 5. INPUTS
- All ACH/ED events for the month (from EMR / discharge notifications)
- Source workflows: CL-WF-09, CL-WF-12, CL-WF-08, CL-WF-19

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull ACH/ED event list | Clinical Mgr | CO-FM-022 | Day 1 |
| 2 | Per-event root-cause review (preventability assessment) | Clinical Mgr | QA-FM-026 | Day 2–4 |
| 3 | Compile rate per 100 episodes; trend analysis | QA Reviewer | EN-FM-034 | Day 5 |
| 4 | Identify systemic patterns; route to QA-WF-04 PIP if rate >threshold | Clinical Mgr | QA-FM-021 | Day 6 |
| 5 | Compile report; feed to QA-WF-03 | Clinical Mgr | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, QA-FM-026, QA-FM-021, EN-FM-034

### 8. APPROVALS
Clinical Manager signs. Medical Director signs if pattern PIP triggered.

### 9. OUTPUTS
Monthly Rehospitalization Review Report; per-event preventability disposition; rate trend chart; PIP trigger memo.

### 10. SLA / DEADLINES
Monthly. Per-event review ≤5 business days of event notification.

### 11. ESCALATION LOGIC
Rate above CMS Star Rating benchmark → mandatory PIP via QA-WF-04. Preventable pattern → policy update via EN-WF-01. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unreviewed preventable ACH → Star Rating decline; QAPI deficiency citation.

### 13. AUDIT REQUIREMENTS
Per-cycle log: event roster, preventability dispositions, rate calc, PIP triggers. Retention ≥6 years. Cross-referenced to CL-WF-19, QA-WF-04, QA-WF-08, QA-WF-03.

---

## CL-WF-35 — PATIENT OUTCOME MONITORING

### 1. POLICY REFERENCES
- CL-PA-005 Plan of Care; 42 CFR § 484.65 QAPI outcomes

### 2. PROCESS OVERVIEW
Monthly aggregation of OASIS-derived outcome measures (improvement in ambulation, bed transfer, bathing, pain interfering with activity, dyspnea; discharge to community; ED use without hospitalization). Validates outcome calculations against CL-WF-05 source data. Feeds QA-WF-02 (dashboard), QA-WF-03, QA-WF-04 (PIP lifecycle), and QA-WF-09 (Star Rating monitoring).

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: any outcome regression >5% MoM

### 4. RESPONSIBLE ROLES
- **Primary:** QA Analyst
- **Supporting:** Clinical Manager
- **Approval:** Clinical Manager; QAPI Lead

### 5. INPUTS
- OASIS dataset transmitted in window
- iQIES / CASPER reports
- Source workflows: CL-WF-05, CL-WF-27 (OASIS audit), QA-WF-02

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull OASIS outcome dataset | QA Analyst | CO-FM-022 | Day 1 |
| 2 | Reconcile with CASPER/iQIES outcome reports | QA Analyst | EN-FM-034 | Day 2 |
| 3 | Compute trend vs. prior 3 months and benchmark | QA Analyst | QA-FM-020 | Day 3 |
| 4 | Identify regressions; flag PIP candidates per QA-WF-04 | QA Analyst | QA-FM-021 | Day 4 |
| 5 | Compile dashboard; feed to QA-WF-02 and QA-WF-03 | QA Analyst | QA-FM-020 | Day 5 |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-020, QA-FM-021, EN-FM-034, CO-FM-024

### 8. APPROVALS
Clinical Manager + QAPI Lead sign.

### 9. OUTPUTS
Monthly Outcome Dashboard; trend charts; PIP candidate list.

### 10. SLA / DEADLINES
Monthly, by 10th business day; feeds QA-WF-02 publication.

### 11. ESCALATION LOGIC
Outcome regression >5% MoM → mandatory PIP via QA-WF-04. Star-Rating impacting trend → QA-WF-09. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03 closure and Star Rating monitoring. Unvalidated OASIS feed → invalid public outcome reporting.

### 13. AUDIT REQUIREMENTS
Per-cycle log: dataset hash, reconciliation evidence, trend charts, PIP triggers. Retention ≥6 years. Cross-referenced to CL-WF-05, CL-WF-27, QA-WF-02, QA-WF-04, QA-WF-09, QA-WF-03.

---

## CL-WF-36 — MISSED VISIT / UTILIZATION AUDIT

### 1. POLICY REFERENCES
- CL-PA-009 Missed Visits; 42 CFR § 484.60(c); LUPA rules

### 2. PROCESS OVERVIEW
Monthly audit of missed-visit documentation, makeup-visit completion, LUPA exposure, and utilization deviation from POC. Aggregates evidence from CL-WF-20 (missed visit management) and QA-WF-07 (LUPA prevention). Feeds QA-WF-03 and FN-WF-15.

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: LUPA rate >threshold; visit-frequency deviation >20%

### 4. RESPONSIBLE ROLES
- **Primary:** Clinical Manager
- **Supporting:** Scheduler, QA Reviewer
- **Approval:** Clinical Manager

### 5. INPUTS
- Missed-visit log; visit completion data; episode visit-frequency targets
- Source workflows: CL-WF-20, QA-WF-07, OP-WF-12

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull missed-visit log + episode utilization | Clinical Mgr | CO-FM-022 | Day 1 |
| 2 | Verify per-incident documentation per CL-WF-20 | Clinical Mgr | CL-FM-048 | Day 2 |
| 3 | Confirm makeup visits scheduled / executed | Scheduler | CL-FM-053 | Day 3 |
| 4 | Compute LUPA risk and utilization deviation | QA Reviewer | EN-FM-034 | Day 4 |
| 5 | Issue CAPs; route LUPA risk to FN-WF-15 | Clinical Mgr | QA-FM-005 | Day 5 |
| 6 | File report; feed to QA-WF-03 | Clinical Mgr | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-022, CO-FM-024, CL-FM-048, CL-FM-053, EN-FM-034, QA-FM-005

### 8. APPROVALS
Clinical Manager signs.

### 9. OUTPUTS
Missed Visit / Utilization Audit Report; LUPA risk register; utilization deviation list; CAPs.

### 10. SLA / DEADLINES
Monthly. CAPs ≤5 business days.

### 11. ESCALATION LOGIC
LUPA rate >threshold → FN-WF-15 + QA-WF-07. Frequent missed visits same clinician → HR-WF-09. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unaddressed LUPA pattern → revenue loss; payment-integrity risk.

### 13. AUDIT REQUIREMENTS
Per-cycle log: missed-visit roster, makeup status, LUPA register, CAPs. Retention ≥6 years. Cross-referenced to CL-WF-20, QA-WF-07, FN-WF-15, QA-WF-03.

---

## CL-WF-37 — ORDERS & CARE PLAN ALIGNMENT AUDIT

### 1. POLICY REFERENCES
- CL-PA-005 Plan of Care; 42 CFR § 484.60(b); 42 CFR § 409.43

### 2. PROCESS OVERVIEW
Monthly audit verifying that every order (including verbal orders) is reflected in the POC and executed in visits. Reconciles outputs of CL-WF-07 (orders) against CL-WF-06 (POC) and CL-WF-09 (visit notes). Feeds CO-WF-14 and QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: verbal-order signature backlog >7 days

### 4. RESPONSIBLE ROLES
- **Primary:** QA Reviewer
- **Supporting:** Clinical Manager, Medical Records
- **Approval:** Clinical Manager

### 5. INPUTS
- Orders register; POC; visit-note dataset
- Source workflows: CL-WF-06, CL-WF-07, CL-WF-09

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull orders register + POC + visits for sampled episodes | QA Reviewer | CO-FM-022 | Day 1 |
| 2 | Verify each order reflected in POC update | QA Reviewer | CL-FM-006 | Day 2–3 |
| 3 | Verify execution evidence in visit notes | QA Reviewer | CO-FM-021 | Day 3 |
| 4 | Audit verbal-order signature timeliness per CL-WF-07 | QA Reviewer | CL-FM-007 | Day 4 |
| 5 | Issue CAPs; pattern → CO-WF-14 | Clinical Mgr | QA-FM-005 | Day 5 |
| 6 | File report; feed to QA-WF-03 | QA Reviewer | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, CL-FM-006, CL-FM-007, QA-FM-005

### 8. APPROVALS
Clinical Manager signs.

### 9. OUTPUTS
Orders/POC Alignment Audit Report; defect register; CAP queue.

### 10. SLA / DEADLINES
Monthly. Verbal-order signature backlog cleared within audit cycle.

### 11. ESCALATION LOGIC
Verbal-order backlog >14 days → physician escalation, billing hold via FN-WF-15. Findings feed QA-WF-03 and CO-WF-14.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unsigned verbal orders → claim denial; CMS PEPPER outlier.

### 13. AUDIT REQUIREMENTS
Per-cycle log: sampled episodes, defect register, verbal-order backlog, CAPs. Retention ≥6 years. Cross-referenced to CL-WF-06, CL-WF-07, CO-WF-14, QA-WF-03.

---
