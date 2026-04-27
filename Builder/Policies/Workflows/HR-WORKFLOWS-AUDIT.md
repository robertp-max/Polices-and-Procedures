# HR — TRAINING & PERSONNEL AUDIT LAYER

> Hardened audit workflows covering training compliance, competency, license,
> exclusion screening (deep audit), and staff file integrity. Aggregate evidence
> from operational HR-WF-01..17 and CL-WF-25. Findings feed QA-WF-03.

---

## HR-WF-18 — TRAINING COMPLIANCE MONITORING

### 1. POLICY REFERENCES
- HR-TR-001 Training Program; HR-TR-101 Annual Mandatory Training; 42 CFR § 484.80; 42 CFR § 484.115

### 2. PROCESS OVERVIEW
Monthly monitoring workflow that validates every employee has completed all required training assignments by the assigned due date. Aggregates evidence from HR-WF-03 (orientation), HR-WF-05 (HHA training), HR-WF-07 (annual mandatory), CL-WF-11 (HHA in-service ≥12 hours), CO-WF-08 (FWA training), CO-WF-09 (HIPAA training). Feeds HR-WF-19 (competency validation), QA-WF-03, and CO-WF-22.

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: any new compliance training mandate; new-hire entry

### 4. RESPONSIBLE ROLES
- **Primary:** Training Coordinator
- **Supporting:** HR Manager, Department Heads
- **Approval:** HR Manager; Compliance Officer for systemic

### 5. INPUTS
- Active employee roster
- Training assignment matrix per role
- LMS completion data
- Source workflows: HR-WF-03, HR-WF-05, HR-WF-07, CL-WF-11, CO-WF-08, CO-WF-09

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull active roster + training assignments from LMS | Training Coord | HR-FM-017 | Day 1 |
| 2 | Compute per-employee compliance % and overdue list | Training Coord | HR-FM-017 | Day 2 |
| 3 | Validate HHA in-service ≥12 h per CL-WF-11 | Training Coord | HR-FM-017 | Day 3 |
| 4 | Validate FWA training per CO-WF-08 and HIPAA per CO-WF-09 | Training Coord | HR-FM-017 | Day 3 |
| 5 | Issue notice & escalate >30 days overdue per HR-WF-09 | HR Manager | HR-FM-009 | Day 4 |
| 6 | Compile compliance scorecard; feed QA-WF-03 | Training Coord | EN-FM-022 | Day 5 |

### 7. REQUIRED FORMS & DOCUMENTS
HR-FM-017, HR-FM-009, EN-FM-022, CO-FM-024

### 8. APPROVALS
HR Manager signs. Compliance Officer co-signs systemic <95% compliance.

### 9. OUTPUTS
Monthly Training Compliance Scorecard; per-employee status; overdue register; escalation queue.

### 10. SLA / DEADLINES
Monthly. Overdue >30 days → discipline path within 5 business days.

### 11. ESCALATION LOGIC
Per-employee overdue >30 days → HR-WF-09. Systemic <95% compliance → CAP via CO-WF-04. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03 closure. Untrained staff providing care → 42 CFR § 484.80/.115 deficiency citation.

### 13. AUDIT REQUIREMENTS
Per-cycle log: roster, assignments, completion data, overdue list, escalations, sign-off. Retention ≥6 years. Cross-referenced to HR-WF-03, HR-WF-05, HR-WF-07, CL-WF-11, CO-WF-08, CO-WF-09, QA-WF-03.

---

## HR-WF-19 — COMPETENCY VALIDATION & ANNUAL SKILLS REVALIDATION

### 1. POLICY REFERENCES
- HR-TD-003 Competency; CL-SD-007 Skilled Competency; 42 CFR § 484.80(d); 42 CFR § 484.115

### 2. PROCESS OVERVIEW
Annual (with quarterly verification cycle) audit confirming each clinical employee has documented competency validation appropriate to their role and any specialty assignments. Aggregates and hardens evidence from CL-WF-25 (clinician competency), HR-WF-05 (HHA competency), HR-WF-06 (skilled professional competency). Triggers retraining via HR-WF-07. Feeds QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Annual revalidation cycle + quarterly verification audit
- Conditional: any clinician error pattern from CL-WF-26..32 or CL-WF-37; new specialty assignment

### 4. RESPONSIBLE ROLES
- **Primary:** Clinical Manager
- **Supporting:** Staff Development RN, HR
- **Approval:** Clinical Manager; Director of Nursing for specialty competencies

### 5. INPUTS
- Clinical employee roster
- Competency matrices per role/specialty
- Annual skills lab attendance
- Source workflows: CL-WF-25, HR-WF-05, HR-WF-06, HR-WF-07

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull roster + competency status | Clinical Mgr | HR-FM-016 | Day 1 |
| 2 | Verify annual skills lab attendance & passing score | Staff Dev RN | HR-FM-016 | Day 2 |
| 3 | Verify role/specialty competencies per CL-WF-25 | Clinical Mgr | CL-FM-051 | Day 3 |
| 4 | Issue retraining requirement for any gap → HR-WF-07 | Clinical Mgr | HR-FM-016 | Day 4 |
| 5 | Compile competency scorecard; feed QA-WF-03 | Clinical Mgr | EN-FM-022 | Day 5 |

### 7. REQUIRED FORMS & DOCUMENTS
HR-FM-016, CL-FM-051, EN-FM-022, CO-FM-024

### 8. APPROVALS
Clinical Manager signs. DON signs specialty.

### 9. OUTPUTS
Annual Competency Scorecard; gap register; retraining queue.

### 10. SLA / DEADLINES
Annual full revalidation; quarterly verification by 5th business day of new quarter.

### 11. ESCALATION LOGIC
Failed competency → mandatory retraining (HR-WF-07) and removal from independent practice until revalidated. Repeat failure → HR-WF-09. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03 closure. Uncompetent clinician providing care → patient safety risk; survey deficiency.

### 13. AUDIT REQUIREMENTS
Per-cycle log: roster, competency evidence per employee, retraining queue, sign-off. Retention ≥6 years. Cross-referenced to CL-WF-25, HR-WF-05, HR-WF-06, HR-WF-07, QA-WF-03.

---

## HR-WF-20 — LICENSE & EXCLUSION MONITORING (DEEP AUDIT)

### 1. POLICY REFERENCES
- HR-TA-003 OIG/SAM Screening; HR-TA-004 Primary Source Verification; 42 USC § 1320a-7; SAM.gov requirement

### 2. PROCESS OVERVIEW
Monthly deep-audit workflow validating: (a) every clinician license is current and primary-source verified, (b) every employee/contractor was screened against OIG LEIE and SAM exclusion lists. Hardens HR-WF-04 (license tracking) and HR-WF-15 (monthly OIG/SAM rescreen). Captures hits, dispositions, and removal evidence. Feeds CO-WF-27 FWA monitoring and QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Monthly (matches HR-WF-15 cadence)
- Conditional: new hire; license expiration approaching <60 days; OIG/SAM release of new exclusions

### 4. RESPONSIBLE ROLES
- **Primary:** HR Compliance Specialist
- **Supporting:** Compliance Officer
- **Approval:** Compliance Officer; Administrator for any hit

### 5. INPUTS
- Active workforce roster (employees + contractors + vendors with PHI access)
- License registry
- OIG LEIE + SAM exclusion list extracts
- Source workflows: HR-WF-04, HR-WF-15, HR-WF-02

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull current workforce roster | HR Comp Spec | HR-FM-005 | Day 1 |
| 2 | Run roster against OIG LEIE + SAM | HR Comp Spec | HR-FM-005 | Day 1 |
| 3 | Validate per-clinician license currency via primary source | HR Comp Spec | HR-FM-006 | Day 2–3 |
| 4 | On any hit: immediate suspension; investigation per HR-WF-09 + CO-WF-27 | Compliance Officer | HR-FM-009 | Same day |
| 5 | File monthly evidence pack; feed QA-WF-03 | HR Comp Spec | CO-FM-024 | Day 5 |

### 7. REQUIRED FORMS & DOCUMENTS
HR-FM-005, HR-FM-006, HR-FM-009, CO-FM-024

### 8. APPROVALS
Compliance Officer signs monthly. Administrator signs any hit disposition.

### 9. OUTPUTS
Monthly screening evidence pack; license-currency register; hit log with dispositions.

### 10. SLA / DEADLINES
Monthly screening; same-day suspension on any hit; license renewal action 60 days before expiry.

### 11. ESCALATION LOGIC
Any exclusion hit → immediate removal + CO-WF-27 + CO-WF-16 self-disclosure if claims billed during exclusion. License lapse → HR-WF-09 + practice removal. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed monthly screening → claims paid for excluded provider = FCA + CMP exposure. Lapsed license practitioner → state board + survey citation.

### 13. AUDIT REQUIREMENTS
Append-only screening evidence retained ≥10 years (FCA SOL). Per-cycle log: roster hash, screening source, hits, dispositions, sign-off. Cross-referenced to HR-WF-02, HR-WF-04, HR-WF-15, CO-WF-15, CO-WF-16, CO-WF-27, QA-WF-03.

---

## HR-WF-21 — STAFF FILE AUDIT

### 1. POLICY REFERENCES
- HR-WM-007 Personnel File Management; 42 CFR § 484.115

### 2. PROCESS OVERVIEW
Annual (with quarterly sample) audit verifying every active personnel file contains the complete required content set: application, background check, license/certs, training records, competency evidence, evaluations, health (TB/Hep B), I-9. Hardens HR-WF-04 and validates outputs of HR-WF-02, HR-WF-03, HR-WF-08. Feeds QA-WF-03 and CO-WF-04.

### 3. TRIGGER(S)
- **Time-based:** Annual full audit + quarterly 10% sample
- Conditional: HR audit signal from licensing/state survey

### 4. RESPONSIBLE ROLES
- **Primary:** HR Compliance Specialist
- **Supporting:** HR Manager
- **Approval:** HR Manager; Compliance Officer for systemic gaps

### 5. INPUTS
- Active personnel roster
- File-content checklist (HR-FM-015)
- Source workflows: HR-WF-02, HR-WF-03, HR-WF-04, HR-WF-08

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Apply quarterly 10% sample / annual 100% pull | HR Comp Spec | CO-FM-022 | Day 1 |
| 2 | Score each file against 22-element personnel checklist | HR Comp Spec | HR-FM-015 | Day 2–4 |
| 3 | Verify TB / Hep B per HR-WM-003 | HR Comp Spec | HR-FM-012 | Day 3 |
| 4 | Issue gap remediation per file | HR Manager | QA-FM-005 | Day 5 |
| 5 | Compile staff-file audit report; feed QA-WF-03 | HR Comp Spec | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
HR-FM-012, HR-FM-015, CO-FM-022, CO-FM-024, QA-FM-005

### 8. APPROVALS
HR Manager signs. Compliance Officer co-signs systemic.

### 9. OUTPUTS
Quarterly/Annual Staff File Audit Report; per-file gap register; remediation queue.

### 10. SLA / DEADLINES
Quarterly sample within 7 business days; annual full audit within 30 calendar days.

### 11. ESCALATION LOGIC
Per-file material gap → remediation within 14 days. Systemic >5% gap → CAP via CO-WF-04. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Incomplete personnel files → 42 CFR § 484.115 citation; survey deficiency.

### 13. AUDIT REQUIREMENTS
Per-cycle log: roster, sample IDs, scoring, gap register, remediation, sign-off. Retention ≥6 years. Cross-referenced to HR-WF-02, HR-WF-03, HR-WF-04, HR-WF-08, HR-WF-18, HR-WF-19, HR-WF-20, QA-WF-03.

---
