# IT — INFORMATION TECHNOLOGY & SECURITY AUDIT LAYER

> Hardened audit workflows covering user access, HIPAA security controls, PHI
> access monitoring, audit-log review, and overall system security posture.
> Aggregate evidence from operational IT-WF-01..20. Findings feed QA-WF-03 and
> EN-WF-12.

---

## IT-WF-21 — USER ACCESS REVIEW AUDIT

### 1. POLICY REFERENCES
- IT-AC-001 Access Control; IT-AC-002 Identity Lifecycle; HIPAA § 164.308(a)(4); 45 CFR § 164.312(a)(1)

### 2. PROCESS OVERVIEW
Quarterly deep-audit workflow validating that every active user account corresponds to a current authorized employee/contractor with role-appropriate access. Hardens IT-WF-04 (quarterly access review) by sampling proof-of-evidence per system. Aggregates and validates evidence from HR-WF-08 (termination), HR-WF-15 (OIG/SAM), IT-WF-02 (provisioning), IT-WF-03 (deprovisioning), IT-WF-04 (access review). Feeds QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Quarterly
- Conditional: any termination not deprovisioned within SLA; HIPAA risk-analysis update

### 4. RESPONSIBLE ROLES
- **Primary:** IT Security Officer
- **Supporting:** HR, Application Owners
- **Approval:** Compliance Officer / Privacy Officer

### 5. INPUTS
- Active user list per system (EMR, billing, LMS, file shares, email)
- HR active roster
- Termination log
- Source workflows: IT-WF-02, IT-WF-03, IT-WF-04, HR-WF-08, HR-WF-15

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull active user list per system | IT Sec Officer | IT-FM-009 | Day 1 |
| 2 | Reconcile against HR active roster + terminations | IT Sec Officer | IT-FM-009 | Day 2 |
| 3 | Sample 10% of accounts; verify role appropriateness with manager attestation | IT Sec Officer | IT-FM-009 | Day 3–5 |
| 4 | Disable orphan / over-privileged accounts immediately | IT Sec Officer | IT-FM-009 | Same day |
| 5 | Compile access review report; feed QA-WF-03 | IT Sec Officer | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-009, CO-FM-024, CO-FM-022

### 8. APPROVALS
Privacy Officer signs. Compliance Officer co-signs material gaps.

### 9. OUTPUTS
Quarterly Access Review Report; orphan-account log with disable evidence; manager attestation pack.

### 10. SLA / DEADLINES
Quarterly. Orphan disable: same day. Termination deprovision: ≤24h.

### 11. ESCALATION LOGIC
Termination not deprovisioned in 24h → CAP via CO-WF-04 + HR-WF-08 escalation. Repeat findings → IT-WF-22 HIPAA monitoring escalation. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Orphan / over-privileged accounts → HIPAA Security Rule violation; OCR penalties; data-breach exposure.

### 13. AUDIT REQUIREMENTS
Per-cycle log: user lists, reconciliation evidence, attestations, disable evidence, sign-off. Retention ≥6 years (HIPAA). Cross-referenced to IT-WF-02, IT-WF-03, IT-WF-04, HR-WF-08, HR-WF-15, IT-WF-22, QA-WF-03.

---

## IT-WF-22 — HIPAA SECURITY MONITORING AUDIT

### 1. POLICY REFERENCES
- IT-IS-001 Information Security Program; HIPAA Security Rule (45 CFR § 164.308–.316)

### 2. PROCESS OVERVIEW
Quarterly audit verifying ongoing HIPAA Security Rule technical, physical, and administrative safeguards remain operational. Hardens IT-WF-01 (Security Risk Analysis), IT-WF-05 (encryption), IT-WF-07 (BAA inventory), IT-WF-08 (vulnerability mgmt). Validates evidence and tests controls. Feeds QA-WF-03 and EN-WF-12.

### 3. TRIGGER(S)
- **Time-based:** Quarterly
- Conditional: change to ePHI environment; OCR alert; new tech control

### 4. RESPONSIBLE ROLES
- **Primary:** IT Security Officer
- **Supporting:** Privacy Officer, Compliance Officer
- **Approval:** Privacy Officer; Administrator for material findings

### 5. INPUTS
- Security risk analysis (IT-WF-01)
- Vulnerability scan results (IT-WF-08)
- Encryption inventory (IT-WF-05)
- BAA register (IT-WF-07)
- Source workflows: IT-WF-01, IT-WF-05, IT-WF-07, IT-WF-08, CO-WF-09

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Verify SRA currency and gap remediation per IT-WF-01 | IT Sec Officer | IT-FM-009 | Day 1 |
| 2 | Test sample technical safeguards (encryption at-rest, in-transit, MFA, automatic logoff) | IT Sec Officer | IT-FM-009 | Day 2–3 |
| 3 | Verify vulnerability remediation SLA per IT-WF-08 | IT Sec Officer | IT-FM-009 | Day 4 |
| 4 | Reconcile BAA register vs. actual vendors with PHI access | Privacy Officer | IT-FM-009 | Day 5 |
| 5 | Compile HIPAA security monitoring report; feed QA-WF-03 | IT Sec Officer | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-009, CO-FM-024, CO-FM-022

### 8. APPROVALS
Privacy Officer signs. Administrator co-signs material gaps.

### 9. OUTPUTS
Quarterly HIPAA Security Monitoring Report; control-test evidence; remediation queue.

### 10. SLA / DEADLINES
Quarterly. Control failure remediation per HIPAA risk tier.

### 11. ESCALATION LOGIC
Control failure → IT-WF-09 incident if exploited; CO-WF-10 breach assessment. Material gap → EN-WF-12 enterprise risk + Governing Body via GV-WF-01. Findings feed QA-WF-03 and CO-WF-22.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Untested safeguards → OCR penalty; potential corrective-action plan + multi-million-dollar settlement.

### 13. AUDIT REQUIREMENTS
Per-cycle log: SRA snapshot, control-test evidence, remediation status, sign-off. Retention ≥6 years (HIPAA). Cross-referenced to IT-WF-01, IT-WF-05, IT-WF-07, IT-WF-08, IT-WF-09, CO-WF-09, CO-WF-10, EN-WF-12, QA-WF-03.

---

## IT-WF-23 — PHI ACCESS MONITORING AUDIT

### 1. POLICY REFERENCES
- IT-AU-001 Audit Controls; HIPAA § 164.312(b); 45 CFR § 164.530(c)

### 2. PROCESS OVERVIEW
Monthly audit of PHI access patterns to detect unauthorized or inappropriate access (snooping, bulk export, after-hours, terminated user). Hardens IT-WF-06 (audit log mgmt). Generates per-user and per-record access reports; investigates anomalies. Feeds CO-WF-10 (breach), CO-WF-22, QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: access anomaly alert; patient request for accounting of disclosures

### 4. RESPONSIBLE ROLES
- **Primary:** Privacy Officer
- **Supporting:** IT Security Officer, Compliance Officer
- **Approval:** Privacy Officer; Compliance Officer for breach determination

### 5. INPUTS
- EMR audit-log extract
- Anomaly-detection alerts
- Termination log (HR-WF-08)
- Source workflows: IT-WF-06, HR-WF-08, IT-WF-21

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull monthly PHI access logs | IT Sec Officer | IT-FM-009 | Day 1 |
| 2 | Run anomaly rules (after-hours, bulk, no-relationship, terminated user) | IT Sec Officer | IT-FM-009 | Day 2 |
| 3 | Triage flagged events with manager attestation | Privacy Officer | IT-FM-009 | Day 3–4 |
| 4 | If unauthorized → CO-WF-10 breach assessment; HR-WF-09 discipline | Privacy Officer | HR-FM-009 | Same day |
| 5 | Compile PHI access report; feed QA-WF-03 | Privacy Officer | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-009, HR-FM-009, CO-FM-024

### 8. APPROVALS
Privacy Officer signs. Compliance Officer signs breach determinations.

### 9. OUTPUTS
Monthly PHI Access Report; anomaly triage register; breach decisions; discipline actions.

### 10. SLA / DEADLINES
Monthly. Anomaly triage ≤5 business days. Breach assessment per CO-WF-10 SLA.

### 11. ESCALATION LOGIC
Confirmed unauthorized access → CO-WF-10 breach + HR-WF-09 + HHS reporting per § 164.408. Pattern → IT-WF-22 + EN-WF-12. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Undetected unauthorized access → unreported breach; HHS / OCR enforcement; willful-neglect tier penalties.

### 13. AUDIT REQUIREMENTS
Append-only access logs retained ≥6 years (HIPAA). Per-cycle: log hash, anomaly list, triage evidence, breach decisions, sign-off. Cross-referenced to IT-WF-06, IT-WF-21, IT-WF-22, CO-WF-10, HR-WF-08, HR-WF-09, QA-WF-03.

---

## IT-WF-24 — AUDIT LOG REVIEW AUDIT

### 1. POLICY REFERENCES
- IT-AU-001 Audit Controls; HIPAA § 164.312(b)

### 2. PROCESS OVERVIEW
Monthly audit verifying that audit logging is enabled, complete, integrity-protected, and reviewed for every system handling ePHI. Hardens IT-WF-06 (audit log management). Validates that no system has logging disabled, that retention meets 6-year HIPAA requirement, and that integrity controls (append-only, hash chain, off-system shipment) are operational. Feeds QA-WF-03.

### 3. TRIGGER(S)
- **Time-based:** Monthly
- Conditional: any system change; logging-platform change

### 4. RESPONSIBLE ROLES
- **Primary:** IT Security Officer
- **Supporting:** Privacy Officer, Application Owners
- **Approval:** Privacy Officer

### 5. INPUTS
- System inventory of ePHI systems
- Log-management configuration
- Source workflows: IT-WF-01, IT-WF-06, IT-WF-23

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull ePHI system inventory; verify logging on each | IT Sec Officer | IT-FM-009 | Day 1 |
| 2 | Verify retention configuration meets 6-year minimum | IT Sec Officer | IT-FM-009 | Day 2 |
| 3 | Verify integrity controls (hash, append-only, off-host shipment) | IT Sec Officer | IT-FM-009 | Day 3 |
| 4 | Spot-restore prior-month logs from archive | IT Sec Officer | IT-FM-009 | Day 4 |
| 5 | Issue CAP for any gap → CO-WF-04 | IT Sec Officer | QA-FM-005 | Day 5 |
| 6 | Compile audit-log review report; feed QA-WF-03 | IT Sec Officer | CO-FM-024 | Day 6 |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-009, CO-FM-024, QA-FM-005

### 8. APPROVALS
Privacy Officer signs.

### 9. OUTPUTS
Monthly Audit Log Review Report; per-system status; restore-test evidence; CAP register.

### 10. SLA / DEADLINES
Monthly. CAPs within 5 business days; logging-disabled gap = same-day fix.

### 11. ESCALATION LOGIC
Logging disabled → IT-WF-09 incident (control failure) + IT-WF-22 risk update. Repeat → EN-WF-12 + Governing Body via GV-WF-01. Findings feed QA-WF-03.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Disabled or non-retained logs → HIPAA Security Rule citation; cannot substantiate accounting of disclosures.

### 13. AUDIT REQUIREMENTS
Per-cycle log: inventory, configuration evidence, restore tests, CAPs, sign-off. Retention ≥6 years. Cross-referenced to IT-WF-01, IT-WF-06, IT-WF-09, IT-WF-22, IT-WF-23, EN-WF-12, QA-WF-03.

---

## IT-WF-25 — SYSTEM SECURITY AUDIT

### 1. POLICY REFERENCES
- IT-IS-001 Information Security Program; IT-VM-001 Vulnerability Management; HIPAA § 164.308(a)(1)

### 2. PROCESS OVERVIEW
Quarterly comprehensive system-security audit covering vulnerability management posture, patch compliance, endpoint protection, backup integrity, and security incident handling. Hardens IT-WF-08 (vulnerability), IT-WF-09 (security incident response), IT-WF-10 (backup), IT-WF-11 (DRP). Aggregates and tests controls. Feeds QA-WF-03 and EN-WF-12.

### 3. TRIGGER(S)
- **Time-based:** Quarterly
- Conditional: significant security incident; new threat advisory (CISA, HHS-405d)

### 4. RESPONSIBLE ROLES
- **Primary:** IT Security Officer
- **Supporting:** IT Operations, Privacy Officer
- **Approval:** IT Director; Administrator for material findings

### 5. INPUTS
- Vulnerability scan results
- Patch compliance reports
- Endpoint EDR posture
- Backup test results
- Source workflows: IT-WF-08, IT-WF-09, IT-WF-10, IT-WF-11

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Pull vulnerability scan & remediation evidence | IT Sec Officer | IT-FM-009 | Day 1 |
| 2 | Verify patch compliance % (target ≥95% within SLA) | IT Sec Officer | IT-FM-009 | Day 2 |
| 3 | Verify endpoint protection coverage 100% | IT Sec Officer | IT-FM-009 | Day 3 |
| 4 | Test backup restore (sample); verify offsite + immutable | IT Sec Officer | IT-FM-009 | Day 4 |
| 5 | Audit security incident handling time-to-detect/contain/remediate | IT Sec Officer | IT-FM-009 | Day 5 |
| 6 | Compile system security audit; feed QA-WF-03 + EN-WF-12 | IT Sec Officer | CO-FM-024 | Day 7 |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-009, CO-FM-024

### 8. APPROVALS
IT Director signs. Administrator co-signs material findings.

### 9. OUTPUTS
Quarterly System Security Audit Report; control posture scorecard; restore-test evidence; remediation queue.

### 10. SLA / DEADLINES
Quarterly. Critical vulnerability SLA per IT-WF-08; backup test fail = same-day escalation.

### 11. ESCALATION LOGIC
Material gap → IT-WF-22 + EN-WF-12 + Governing Body via GV-WF-01. Active threat → IT-WF-09 incident response. Findings feed QA-WF-03 and CO-WF-22.

### 12. FAILURE CONDITIONS
Missed cycle blocks QA-WF-03. Unpatched vulnerability or failed backup → ransomware / data loss; reportable HIPAA breach; business interruption.

### 13. AUDIT REQUIREMENTS
Per-cycle log: scan data, patch evidence, restore evidence, incident scoring, sign-off. Retention ≥6 years. Cross-referenced to IT-WF-08, IT-WF-09, IT-WF-10, IT-WF-11, IT-WF-22, EN-WF-12, QA-WF-03.

---
