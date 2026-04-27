# CO — COMPLIANCE / BILLING AUDIT LAYER

> Hardened audit workflows that cover billing, claims, FWA, ADR, and revenue-cycle
> compliance. Aggregate evidence from operational FN-WF-* and CO-WF-* workflows.
> Findings feed QA-WF-03 (Quarterly QAPI Review), CO-WF-04 (Internal Compliance
> Audit Cycle), and FN-WF-15 (RCM Self-Audit & Revenue Integrity).

---

## CO-WF-23 — PRE-BILL CLAIMS AUDIT

### 1. POLICY REFERENCES
- CO-CB-001 Pre-Bill Claims; FN-RC-002 Claim Submission; 42 CFR § 484.205; SSA § 1862(a)(1)(A)

### 2. PROCESS OVERVIEW
Daily/weekly pre-bill claims audit verifying that every claim queued for submission has: physician orders, signed POC, F2F evidence, OASIS-derived HHRG/HIPPS, skilled-need narrative, and visit-note documentation. Aggregates evidence from CL-WF-06, CL-WF-07, CL-WF-03, CL-WF-05, CL-WF-09. Blocks FN-WF-04 (claim submission) on any defect.

### 3. TRIGGER(S)
- **Continuous:** Pre-bill queue evaluated daily
- **Time-based:** Weekly aggregate report
- Conditional: claim hold rate >5% → immediate root-cause sweep

### 4. RESPONSIBLE ROLES
- **Primary:** Billing Auditor
- **Supporting:** Coder, Clinical Manager
- **Approval:** Compliance Officer; Administrator for systemic holds

### 5. INPUTS
- Pre-bill claim queue (NOA, RAP, final claims)
- Sample: 100% pre-submission review for first-claim of episode; 25% sample for subsequent
- Source workflows: CL-WF-03, CL-WF-05, CL-WF-06, CL-WF-07, CL-WF-09, FN-WF-04

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull pre-bill queue from billing system | Billing Auditor | CO-FM-022 | Daily |
| 2 | Verify F2F encounter present per CL-WF-03 | Billing Auditor | CL-FM-010 | Daily |
| 3 | Verify signed POC + orders per CL-WF-06/07 | Billing Auditor | CL-FM-005 | Daily |
| 4 | Verify HHRG/HIPPS reconciled with OASIS per CL-WF-05 | Coder | CL-FM-002 | Daily |
| 5 | Verify visit notes support visit count and skilled need | Billing Auditor | CO-FM-021 | Daily |
| 6 | Apply hold or release per defect; log disposition | Billing Auditor | CO-FM-024 | Daily |
| 7 | Compile weekly audit report; feed to FN-WF-15 and QA-WF-03 | Billing Auditor | CO-FM-024 | Weekly |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, CL-FM-002, CL-FM-005, CL-FM-010, FN-FM-006

### 8. APPROVALS
Compliance Officer signs weekly report. Administrator co-signs systemic-hold determinations.

### 9. OUTPUTS
Daily pre-bill disposition log; weekly Pre-Bill Claims Audit Report; per-defect category trend; hold register.

### 10. SLA / DEADLINES
Daily evaluation. Weekly report by Tuesday for prior week. No claim released to FN-WF-04 without disposition.

### 11. ESCALATION LOGIC
Hold rate >5% → systemic CAP via CO-WF-04. Repeat clinician/coder defects → HR-WF-09 + CL-WF-25. Patterns suggesting upcoding → CO-WF-08 FWA. Findings feed QA-WF-03 and FN-WF-15.

### 12. FAILURE CONDITIONS
Skipped daily evaluation → False Claims Act exposure for any released defective claim. Bypass of hold gate is a structural compliance failure citable under 42 CFR § 484.205.

### 13. AUDIT REQUIREMENTS
Daily disposition log retained ≥10 years (FCA SOL). Weekly report linked to FN-WF-04, FN-WF-15, CO-WF-08. Sample-frame size, defect register, hold disposition, sign-off captured per cycle.

---

## CO-WF-24 — POST-BILL CLAIMS AUDIT

### 1. POLICY REFERENCES
- CO-CB-002 Post-Bill Audit; 42 CFR § 484.205; OIG Compliance Program Guidance

### 2. PROCESS OVERVIEW
Quarterly statistical sample audit of submitted/paid claims to validate documentation supports billed services. Detects overpayment exposure that triggers FN-WF-08 (60-Day Overpayment Return). Aggregates evidence from FN-WF-04 (claim submission) and CL-WF-09 (visits). Feeds CO-WF-16 (OIG Self-Disclosure) when material.

### 3. TRIGGER(S)
- **Time-based:** Quarterly
- Conditional: any external audit signal (TPE, RAC, UPIC, ZPIC); CO-WF-23 hold rate >5%

### 4. RESPONSIBLE ROLES
- **Primary:** Compliance Auditor
- **Supporting:** Coder, Clinical Manager
- **Approval:** Compliance Officer; Governing Body informed for material findings

### 5. INPUTS
- Submitted/paid claims dataset for quarter
- Sample: probe sample minimum 30 claims per CMS guidance; expand to statistically valid sample if error rate >5%
- Source workflows: FN-WF-04, CL-WF-09, CO-WF-23

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Build sampling frame from submitted claims | Compliance Auditor | CO-FM-022 | Day 1 |
| 2 | Pull source documentation for each sampled claim | Compliance Auditor | CO-FM-021 | Day 2–4 |
| 3 | Re-score claim against documentation; calculate paid vs. supported | Compliance Auditor | FN-FM-006 | Day 4–6 |
| 4 | Quantify overpayment exposure; route material to FN-WF-08 | Compliance Auditor | FN-FM-006 | Day 7 |
| 5 | Issue CAPs; expand sample if >5% error | Compliance Officer | QA-FM-005 | Day 8 |
| 6 | File audit report; route to QA-WF-03 + Governing Body via GV-WF-01 if material | Compliance Officer | CO-FM-024 | Day 10 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, CL-FM-002, FN-FM-006, QA-FM-005

### 8. APPROVALS
Compliance Officer signs report. Governing Body acknowledges material findings via GV-WF-01.

### 9. OUTPUTS
Quarterly Post-Bill Audit Report; sample disposition; overpayment register; OIG self-disclosure trigger memo (if applicable).

### 10. SLA / DEADLINES
Quarterly. Overpayment refund initiated within 60 days of identification per FN-WF-08.

### 11. ESCALATION LOGIC
Error rate >5% → expanded sample; systemic CAP via CO-WF-04. Material overpayment → FN-WF-08 + CO-WF-16 (OIG self-disclosure). Pattern of upcoding → CO-WF-08. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03 closure. Unidentified overpayment past 60 days → False Claims Act liability. Failure to expand sample on >5% error → audit invalid.

### 13. AUDIT REQUIREMENTS
Per-cycle log: frame, sample IDs, scoring sheets, overpayment register, refund evidence, sign-offs. Retention ≥10 years. Cross-referenced to FN-WF-04, FN-WF-08, CO-WF-16, CO-WF-23, QA-WF-03.

---

## CO-WF-25 — DOCUMENTATION VS BILLING RECONCILIATION

### 1. POLICY REFERENCES
- CO-CB-003 Documentation/Billing Alignment; 42 CFR § 484.110; OIG HHA Compliance Guidance

### 2. PROCESS OVERVIEW
Monthly reconciliation of billed visit codes/HCPCS against documented visits and discipline. Cross-checks units billed against visit notes. Aggregates evidence from FN-WF-04, CL-WF-09, CL-WF-21. Findings feed CO-WF-14 and QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: variance >2% between billed and documented units

### 4. RESPONSIBLE ROLES
- **Primary:** Billing Auditor
- **Supporting:** Coder, Clinical Manager
- **Approval:** Compliance Officer

### 5. INPUTS
- Monthly billed visit dataset
- Visit-note dataset
- Source workflows: FN-WF-04, CL-WF-09, CL-WF-21

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull billed visit dataset and visit-note dataset | Billing Auditor | CO-FM-022 | Day 1 |
| 2 | Reconcile per episode: discipline, unit count, code | Billing Auditor | FN-FM-006 | Day 2–4 |
| 3 | Investigate variances; classify root cause | Billing Auditor | CO-FM-021 | Day 5 |
| 4 | Issue CAPs; refund any overbilled units via FN-WF-08 | Compliance Officer | QA-FM-005 | Day 6 |
| 5 | File report; feed to QA-WF-03 and CO-WF-14 | Billing Auditor | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, FN-FM-006, QA-FM-005

### 8. APPROVALS
Compliance Officer signs.

### 9. OUTPUTS
Monthly Reconciliation Report; variance register; refund queue.

### 10. SLA / DEADLINES
Monthly. Refund initiated within 60 days per FN-WF-08.

### 11. ESCALATION LOGIC
Variance >2% → systemic CAP via CO-WF-04. Pattern → CO-WF-08 FWA review. Findings feed QA-WF-03 and CO-WF-14.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unreconciled overbilled units past 60 days → FCA exposure.

### 13. AUDIT REQUIREMENTS
Per-cycle log: dataset hashes, variance register, refund evidence. Retention ≥10 years. Cross-referenced to FN-WF-04, FN-WF-08, CO-WF-14, QA-WF-03.

---

## CO-WF-26 — CODING ACCURACY REVIEW

### 1. POLICY REFERENCES
- CO-CB-004 Coding Accuracy; ICD-10-CM Official Guidelines; 42 CFR § 484.65

### 2. PROCESS OVERVIEW
Monthly coder accuracy review on principal/secondary diagnoses, sequencing, OASIS-coding alignment, and HHRG/HIPPS impact. Aggregates evidence from CL-WF-05 and CO-WF-23. Feeds clinician/coder retraining via HR-WF-07 and findings to QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: HIPPS revenue variance >5%

### 4. RESPONSIBLE ROLES
- **Primary:** Coder Auditor (HCS-D / BCHH-C)
- **Supporting:** Clinical Manager
- **Approval:** Compliance Officer for systemic

### 5. INPUTS
- Coded episodes for the month
- Sample: 10% per coder, minimum 5 per coder
- Source workflows: CL-WF-05, CO-WF-23

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull coded episode sample | Coder Auditor | CO-FM-022 | Day 1 |
| 2 | Re-code each from source documentation | Coder Auditor | FN-FM-006 | Day 2–4 |
| 3 | Score primary/secondary/sequencing accuracy and HIPPS impact | Coder Auditor | CO-FM-021 | Day 5 |
| 4 | Issue per-coder remediation; route to HR-WF-07 | Compliance Officer | HR-FM-016 | Day 6 |
| 5 | File report; feed to QA-WF-03 and FN-WF-15 | Coder Auditor | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, FN-FM-006, HR-FM-016, QA-FM-005

### 8. APPROVALS
Compliance Officer signs systemic findings.

### 9. OUTPUTS
Per-Coder Accuracy Scorecard; aggregate defect register; remediation queue.

### 10. SLA / DEADLINES
Monthly. Per-coder remediation initiated within 5 business days.

### 11. ESCALATION LOGIC
Per-coder accuracy <90% → mandatory retraining via HR-WF-07. Material HIPPS impact → FN-WF-15. Pattern of upcoding → CO-WF-08 FWA. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03 closure. Sustained low coder accuracy → systemic upcoding/downcoding exposure.

### 13. AUDIT REQUIREMENTS
Per-cycle log: sample IDs, per-coder scores, HIPPS impact, retraining evidence. Retention ≥10 years. Cross-referenced to CL-WF-05, CO-WF-23, FN-WF-15, HR-WF-07, QA-WF-03.

---

## CO-WF-27 — FWA MONITORING

### 1. POLICY REFERENCES
- CO-CP-005 FWA Program; 42 CFR § 422.503(b)(4)(vi); SSA § 1128, § 1128A; 31 USC § 3729 (FCA)

### 2. PROCESS OVERVIEW
Continuous FWA monitoring program: hotline triage (CO-WF-03), data-analytic risk indicators (upcoding, unbundling, billing for non-rendered services, kickback patterns), exclusion screening (CO-WF-15, HR-WF-15), and OIG/CMS alert ingestion. Hardens and aggregates CO-WF-08 (FWA training/monitoring). Feeds CO-WF-16 (OIG self-disclosure) and QA-WF-03.

### 3. TRIGGER(S)
- **Continuous:** Risk indicator dashboard refreshed weekly
- **Time-based:** Quarterly aggregate review
- Conditional: hotline tip; OIG/CMS alert; external audit signal

### 4. RESPONSIBLE ROLES
- **Primary:** Compliance Officer
- **Supporting:** Compliance Auditor, Legal
- **Approval:** Governing Body for material; Compliance Officer for routine

### 5. INPUTS
- Risk indicator dataset (visit/billing patterns)
- Hotline log (CO-WF-03)
- Exclusion screening results (CO-WF-15, HR-WF-15)
- Source workflows: CO-WF-03, CO-WF-08, CO-WF-15, HR-WF-15, CO-WF-23, CO-WF-24

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Refresh risk indicator dashboard | Compliance Auditor | EN-FM-034 | Weekly |
| 2 | Triage hotline tips per CO-WF-03 | Compliance Officer | CO-FM-003 | Continuous |
| 3 | Investigate any indicator above threshold | Compliance Officer | CO-FM-004 | Per case |
| 4 | Verify monthly exclusion screening completion via CO-WF-15 / HR-WF-15 | Compliance Officer | HR-FM-005 | Monthly |
| 5 | Compile quarterly FWA report; route material findings to CO-WF-16 | Compliance Officer | CO-FM-024 | Quarterly |
| 6 | Brief Governing Body via GV-WF-01 | Compliance Officer | GV-FM-023 | Quarterly |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-003, CO-FM-004, CO-FM-024, HR-FM-005, EN-FM-034, GV-FM-023, QA-FM-005

### 8. APPROVALS
Compliance Officer signs quarterly. Governing Body accepts via formal vote for material matters.

### 9. OUTPUTS
Weekly risk indicator dashboard; quarterly FWA monitoring report; investigation register; OIG self-disclosure triggers.

### 10. SLA / DEADLINES
Continuous. Quarterly report ≥7 days before quarterly Governing Body meeting (GV-WF-01).

### 11. ESCALATION LOGIC
Material finding → CO-WF-16 OIG self-disclosure within 60 days of identification. Excluded individual found → HR-WF-09 + immediate removal. Findings feed QA-WF-03, CO-WF-22, GV-WF-01.

### 12. FAILURE CONDITIONS
Missed quarterly review or skipped exclusion screening → FCA, AKS, exclusion-list violation exposure. Failure to self-disclose past 60 days → loss of OIG self-disclosure protection.

### 13. AUDIT REQUIREMENTS
Continuous log: risk indicators, investigations, dispositions, self-disclosures, exclusion screening evidence. Retention ≥10 years. Cross-referenced to CO-WF-03, CO-WF-08, CO-WF-15, CO-WF-16, HR-WF-15, GV-WF-01, QA-WF-03.

---

## CO-WF-28 — AUTHORIZATION / ELIGIBILITY AUDIT

### 1. POLICY REFERENCES
- FN-RC-001 Insurance Verification; 42 CFR § 424.22; CMIA / California Welfare Code

### 2. PROCESS OVERVIEW
Monthly audit verifying that every active episode has current insurance verification, prior authorization (where required), eligibility on date of service, and benefits documentation. Aggregates evidence from CL-WF-01 (intake), FN-WF-04 (claims). Feeds FN-WF-15 and QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: claim denial due to authorization/eligibility >2%

### 4. RESPONSIBLE ROLES
- **Primary:** Insurance Verifier / Billing Auditor
- **Supporting:** Intake Coord
- **Approval:** Compliance Officer

### 5. INPUTS
- Active episode roster with payer + auth status
- Sample: 100% high-risk payers; 15% Medicare/MA
- Source workflows: CL-WF-01, FN-WF-04

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull active-episode auth/eligibility status | Verifier | CO-FM-022 | Day 1 |
| 2 | Verify auth coverage span vs. current visit dates | Verifier | OP-FM-014 | Day 2 |
| 3 | Re-verify eligibility for any approaching expiration | Verifier | OP-FM-014 | Day 3 |
| 4 | Apply hold on episodes lacking active auth | Verifier | CO-FM-021 | Day 4 |
| 5 | Compile report; feed denial trends to FN-WF-15 | Compliance Officer | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, OP-FM-014

### 8. APPROVALS
Compliance Officer signs.

### 9. OUTPUTS
Monthly Authorization/Eligibility Audit Report; hold register; denial trend.

### 10. SLA / DEADLINES
Monthly. Holds applied within 24h of detection.

### 11. ESCALATION LOGIC
Denial rate >2% → CAP; pattern → FN-WF-15. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Services rendered without active auth → uncollectable revenue and potential CMIA disclosure issues.

### 13. AUDIT REQUIREMENTS
Per-cycle log: roster, hold register, denial trend, sign-off. Retention ≥10 years. Cross-referenced to CL-WF-01, FN-WF-04, FN-WF-15, QA-WF-03.

---

## CO-WF-29 — REVENUE CYCLE EXCEPTION REVIEW

### 1. POLICY REFERENCES
- FN-RC-005 Revenue Cycle Integrity; 42 CFR § 484.205

### 2. PROCESS OVERVIEW
Monthly review of revenue-cycle exceptions: denied claims, ADRs, RAC/UPIC requests, credit balances, write-offs, contractual variances. Hardens FN-WF-15 (RCM Self-Audit). Aggregates outputs of FN-WF-05 (denial mgmt), FN-WF-06 (ADR), FN-WF-07 (credit balance), FN-WF-08 (overpayment). Feeds QA-WF-03 and CO-WF-22.

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: any RAC/UPIC/TPE letter; A/R aging breach

### 4. RESPONSIBLE ROLES
- **Primary:** Revenue Integrity Lead
- **Supporting:** Billing Auditor, CFO/Controller
- **Approval:** Compliance Officer

### 5. INPUTS
- Denial register; ADR log; credit-balance report; A/R aging
- Source workflows: FN-WF-05, FN-WF-06, FN-WF-07, FN-WF-08, FN-WF-15

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull all exception datasets | Rev Integrity Lead | CO-FM-022 | Day 1 |
| 2 | Reconcile denials by reason; trend MoM | Rev Integrity Lead | FN-FM-006 | Day 2–3 |
| 3 | Verify ADR responses on time per FN-WF-06 | Rev Integrity Lead | FN-FM-006 | Day 4 |
| 4 | Verify credit balances reported per FN-WF-07 | Rev Integrity Lead | FN-FM-006 | Day 5 |
| 5 | Verify overpayment refunds within 60 days per FN-WF-08 | Compliance Officer | FN-FM-006 | Day 5 |
| 6 | File report; feed to QA-WF-03 and CO-WF-22 | Rev Integrity Lead | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
CO-FM-021, CO-FM-022, CO-FM-024, FN-FM-006, QA-FM-005

### 8. APPROVALS
Compliance Officer signs. Administrator co-signs material variance.

### 9. OUTPUTS
Monthly RCM Exception Report; denial trend; ADR/credit balance/refund register.

### 10. SLA / DEADLINES
Monthly. ADR responses within CMS deadline; refunds within 60 days.

### 11. ESCALATION LOGIC
Missed ADR deadline → automatic claim denial; CAP via FN-WF-06. Refund delay > 60 days → CO-WF-16. Findings feed QA-WF-03 and CO-WF-22.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unmonitored exceptions → audit findings, FCA exposure.

### 13. AUDIT REQUIREMENTS
Per-cycle log: exception register, dispositions, evidence of ADR/refund/credit-balance closure. Retention ≥10 years. Cross-referenced to FN-WF-05, FN-WF-06, FN-WF-07, FN-WF-08, FN-WF-15, CO-WF-16, QA-WF-03.

---

## CO-WF-30 — CORRECTIVE ACTION TRACKING

### 1. POLICY REFERENCES
- CO-CP-002 CAP Lifecycle; 42 CFR § 484.65 (QAPI corrective action requirement)

### 2. PROCESS OVERVIEW
Continuous tracking workflow for ALL Corrective Action Plans (CAPs) opened by any audit workflow. Maintains a single CAP register with owner, due date, success criteria, evidence, and closure attestation. Hardens and aggregates the CAP outputs of every CL-WF-26..37, CO-WF-23..29, QA-WF-13..18, HR-WF-18..21, RM-WF-16..20, IT-WF-21..25, plus CO-WF-04 and CO-WF-05. Feeds QA-WF-03.

### 3. TRIGGER(S)
- **Continuous:** CAP opened by any audit workflow
- **Time-based:** Weekly status review; monthly report
- Conditional: CAP overdue >30 days → executive escalation

### 4. RESPONSIBLE ROLES
- **Primary:** Compliance Officer
- **Supporting:** Domain Owners (CAP owners)
- **Approval:** Compliance Officer (closure attestation); Administrator for >30-day overdue

### 5. INPUTS
- CAP register entries from every audit workflow
- Evidence attachments for closure
- Source workflows: ALL audit workflows

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Receive CAP intake from upstream audit | Compliance Officer | QA-FM-022 | On open |
| 2 | Assign owner, due date, success criteria, evidence requirement | Compliance Officer | QA-FM-005 | Day 1 |
| 3 | Track weekly via dashboard | Compliance Officer | QA-FM-022 | Weekly |
| 4 | Validate evidence on submitted closure | Compliance Officer | QA-FM-005 | Per case |
| 5 | Escalate overdue >30 days to Administrator | Compliance Officer | EN-FM-019 | Per case |
| 6 | Compile monthly CAP report; feed to QA-WF-03 | Compliance Officer | CO-FM-024 | Monthly |

### 7. REQUIRED FORMS & DOCUMENTS
QA-FM-005, QA-FM-022, EN-FM-019, CO-FM-024

### 8. APPROVALS
Compliance Officer attests every closure. Administrator signs >30-day escalations.

### 9. OUTPUTS
CAP register (live); weekly status; monthly CAP report; overdue escalations.

### 10. SLA / DEADLINES
Continuous. Monthly report by 5th business day. Overdue escalations within 24h of breach.

### 11. ESCALATION LOGIC
Overdue >30 days → Administrator + Governing Body via GV-WF-01. Repeat overdue same owner → HR-WF-09. Findings feed QA-WF-03 and CO-WF-22.

### 12. FAILURE CONDITIONS
Missed monthly report blocks QA-WF-03. Unclosed CAPs → QAPI deficiency citation; survey risk.

### 13. AUDIT REQUIREMENTS
Append-only CAP register. Retention ≥10 years. Cross-referenced to every audit workflow plus CO-WF-04, CO-WF-22, QA-WF-03.

---
