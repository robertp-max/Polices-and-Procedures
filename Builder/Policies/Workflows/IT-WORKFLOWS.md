# IT — INFORMATION SECURITY & TECHNOLOGY — WORKFLOWS

**Domain Code:** IT
**Regulatory Anchors:**
- HIPAA Security Rule — 45 CFR §§ 164.308 (Admin), 164.310 (Physical), 164.312 (Technical), 164.314 (Organizational), 164.316 (Documentation)
- HIPAA Privacy / Breach Notification — 45 CFR § 164.400-414
- CA CMIA (Civil Code § 56 et seq.); CA CCPA/CPRA (Civil Code § 1798.100 et seq.)
- NIST 800-66 Rev 2, NIST 800-53/171, SP 800-61 (IR), CSF 2.0
- CMS SRA expectation (pre-condition of EHR meaningful use / quality incentives)
**Primary Subdomains:** SP (Security & Privacy Program), AC (Access Control), IR (Incident Response), BC (Backup & Continuity), DM (Data Management), AM (Asset Management), NE (Network / Endpoint)
**Form Prefix:** IT-FM-xxx (32 forms)

---

## DOMAIN OVERVIEW

IT workflows operationalize the HIPAA Security Rule and CMIA for protecting ePHI across the agency's systems, devices, and cloud services. They cover access provisioning/termination, risk analysis, encryption, backups, incident response (tied to CO-WF-10 breach workflow), vendor/BAA tech controls, device management, and change management.

---

## WORKFLOWS IN THIS DOMAIN

1. IT-WF-01 — Annual Security Risk Analysis (SRA) & Risk Management Plan
2. IT-WF-02 — User Access Provisioning (New Hire / Role Change)
3. IT-WF-03 — User Access Termination (Separation)
4. IT-WF-04 — Quarterly Access Review / Least-Privilege
5. IT-WF-05 — Password / MFA Management
6. IT-WF-06 — System Activity Audit Logging & Monitoring (§ 164.312(b))
7. IT-WF-07 — Backup, Data Restoration & Tabletop Test
8. IT-WF-08 — Disaster Recovery & Business Continuity Exercise
9. IT-WF-09 — IT Security Incident Response (Detection → Contain → Eradicate → Recover)
10. IT-WF-10 — Device & Endpoint Management (Encryption, MDM, Loss)
11. IT-WF-11 — Mobile Device / BYOD Management
12. IT-WF-12 — Removable Media / USB Restrictions
13. IT-WF-13 — Patch & Vulnerability Management
14. IT-WF-14 — Change Management
15. IT-WF-15 — Vendor / Cloud SaaS Security Review & BAA
16. IT-WF-16 — Email Security (Phishing, Encryption, DLP)
17. IT-WF-17 — Data Backup Media Disposal / Sanitization
18. IT-WF-18 — Remote Access / VPN
19. IT-WF-19 — Facility Physical Access Controls (§ 164.310)
20. IT-WF-20 — Data Subject Rights (CMIA / CCPA Access, Delete, Correct)

---

## IT-WF-01 — ANNUAL SECURITY RISK ANALYSIS (SRA)

### 1. POLICY REFERENCES
- IT-SP-001 HIPAA Security Management; 45 CFR § 164.308(a)(1)(ii)(A)-(B)

### 2. PROCESS OVERVIEW
Annual accurate & thorough risk analysis of all ePHI (C-I-A); followed by risk management plan addressing each identified risk.

### 3. TRIGGER(S)
- Annual cycle
- Material system change
- Post-incident

### 4. RESPONSIBLE ROLES
- **Primary:** Security Officer (may coincide with Privacy Officer)
- **Supporting:** IT team, Compliance, external assessor (optional)
- **Approval:** Administrator; Governing Body briefed

### 5. INPUTS
- Asset/data inventory; network diagrams; prior year SRA; incident data

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Update asset & ePHI inventory | IT | IT-FM-001 Asset & ePHI Inventory | Annual (continuous maintenance) |
| 2 | Conduct SRA per NIST 800-66 R2 | Security Officer | IT-FM-002 Security Risk Analysis Report | Annual |
| 3 | Develop risk management plan (remediation register) | Security Officer | IT-FM-003 Risk Management Plan & Remediation Register | Within 30 days of SRA |
| 4 | Board briefing & approval (recorded in meeting minutes) | Administrator | GV-FM-023 Annual Compliance Report to Governing Body; GV-FM-005 Governing Body Meeting Minutes Template | Annual |
| 5 | Execute remediation | IT + Security Officer | IT-FM-003 updates | Per plan |
| 6 | Monitor & reassess | Security Officer | IT-FM-003 | Continuous |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-001, IT-FM-002, IT-FM-003, GV-FM-023, GV-FM-005 Governing Body Meeting Minutes Template.

### 8. APPROVALS
Administrator approves; Governing Body accepts plan.

### 9. OUTPUTS
Completed SRA; remediation register; Governing Body Meeting Minutes (GV-FM-005) recording approval.

### 10. SLA / DEADLINES
Annual SRA; remediation per risk priority.

### 11. ESCALATION LOGIC
Critical risk (e.g., unencrypted ePHI) → emergency remediation within 30 days; Administrator + Board notified.

### 12. FAILURE CONDITIONS
Missing SRA = HIPAA § 164.308 violation; OCR penalty foundation; often listed #1 enforcement failure.

### 13. AUDIT REQUIREMENTS
SRA & remediation register retained 6 years (HIPAA). Surveyors verify: SRA date current, methodology, remediation evidence.

---

## IT-WF-02 — USER ACCESS PROVISIONING

### 1. POLICY REFERENCES
- IT-AC-001 Access Management; 45 CFR § 164.308(a)(3)(ii)(B) (authorization/clearance) & § 164.308(a)(4)

### 2. PROCESS OVERVIEW
Provisions new-hire or role-change system access based on minimum necessary, least-privilege principles tied to job role.

### 3. TRIGGER(S)
- New hire (HR-WF-03)
- Role change
- Temporary access need

### 4. RESPONSIBLE ROLES
- **Primary:** IT Access Admin
- **Supporting:** HR (role), Security Officer
- **Approval:** Department Manager; Security Officer for elevated access

### 5. INPUTS
- Role definition; HR hire data

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Submit access request | Hiring Mgr/HR | IT-FM-004 User Access Request Form | Before start |
| 2 | Assign role-based entitlements | IT | IT-FM-005 Role-Based Access Matrix | Same day |
| 3 | Elevated/privileged access approval | Security Officer | IT-FM-006 Privileged Access Approval | Before granting |
| 4 | Create accounts; issue credentials securely | IT | IT-FM-007 New Account Provisioning Record | Before start |
| 5 | User acknowledges Acceptable Use | User | IT-FM-008 Acceptable Use Policy Acknowledgment | Day 1 |
| 6 | Confirm MFA enrollment | IT | IT-FM-009 MFA Enrollment Log | Day 1 |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-004, IT-FM-005, IT-FM-006, IT-FM-007, IT-FM-008, IT-FM-009.

### 8. APPROVALS
Department Manager; Security Officer for privileged.

### 9. OUTPUTS
Access request; provisioning record; AUP acknowledgment; MFA evidence.

### 10. SLA / DEADLINES
Before start date / role effective date.

### 11. ESCALATION LOGIC
Requests exceeding role matrix → Security Officer review + documented exception.

### 12. FAILURE CONDITIONS
Over-privileged access → HIPAA minimum-necessary violation.

### 13. AUDIT REQUIREMENTS
Per-user provisioning record; AUP; role matrix history.

---

## IT-WF-03 — USER ACCESS TERMINATION

### 1. POLICY REFERENCES
- IT-AC-002 Access Termination; 45 CFR § 164.308(a)(3)(ii)(C)
- HR-ER-005 Separation

### 2. PROCESS OVERVIEW
Disables or removes system access at separation, role change, or extended absence — effective on separation date / end of business day.

### 3. TRIGGER(S)
- Separation (HR-WF-14)
- Role change
- Extended leave / suspension
- Contractor end-date

### 4. RESPONSIBLE ROLES
- **Primary:** IT Access Admin
- **Supporting:** HR; Security Officer
- **Approval:** HR Director / Security Officer

### 5. INPUTS
- HR separation notice; access list

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | HR sends termination notice | HR | IT-FM-010 Access Termination Request | ≤ 1 business day; same day for involuntary |
| 2 | Disable accounts across all systems (EHR, email, VPN, SaaS) | IT | IT-FM-011 Account Disablement Checklist | Effective separation date |
| 3 | Revoke physical access (badge) | Facilities + IT | HR-FM-056 Asset Return Checklist | Same day |
| 4 | Transfer data ownership (email, files) | IT + Supervisor | IT-FM-012 Data Ownership Transfer | ≤ 5 business days |
| 5 | Log termination evidence | IT | IT-FM-011 | Day of |
| 6 | Quarterly reconciliation w/ HR roster | IT + HR | IT-FM-013 HR-IT Roster Reconciliation | Quarterly |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-010, IT-FM-011, IT-FM-012, IT-FM-013, HR-FM-056.

### 8. APPROVALS
HR Director signs; Security Officer monitors.

### 9. OUTPUTS
Termination checklist; disabled account evidence; reconciliation.

### 10. SLA / DEADLINES
Separation date; involuntary same day.

### 11. ESCALATION LOGIC
Active account found post-separation → immediate Security Officer incident review; Privacy/security incident assessment (IT-WF-09).

### 12. FAILURE CONDITIONS
Access retained → unauthorized PHI access risk; HIPAA breach exposure.

### 13. AUDIT REQUIREMENTS
Checklist per separation; quarterly reconciliation reports.

---

## IT-WF-04 — QUARTERLY ACCESS REVIEW

### 1. POLICY REFERENCES
- IT-AC-003 Access Review; 45 CFR § 164.308(a)(4)(ii)(C)

### 2. PROCESS OVERVIEW
Quarterly review of user entitlements for continued appropriateness (least privilege, minimum necessary).

### 3. TRIGGER(S)
- Quarterly schedule
- Post-role change

### 4. RESPONSIBLE ROLES
- **Primary:** Security Officer
- **Supporting:** IT, Dept Managers (attestation)
- **Approval:** Security Officer; Administrator

### 5. INPUTS
- Role matrix; entitlement reports per system

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Generate entitlement report per system | IT | IT-FM-014 Entitlement Review Report | Quarterly |
| 2 | Route to manager attestation | Security Officer | IT-FM-015 Manager Entitlement Attestation | Quarterly |
| 3 | Remove inappropriate entitlements | IT | IT-FM-016 Entitlement Change Ticket | ≤ 10 business days of attestation |
| 4 | Summary report to Admin & Board (logged in meeting minutes) | Security Officer | GV-FM-023; GV-FM-005 Governing Body Meeting Minutes Template | Quarterly/annual |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-014, IT-FM-015, IT-FM-016, GV-FM-023, GV-FM-005 Governing Body Meeting Minutes Template.

### 8. APPROVALS
Managers attest; Security Officer signs summary.

### 9. OUTPUTS
Review; attestations; change tickets; summary.

### 10. SLA / DEADLINES
Quarterly; changes ≤10 days.

### 11. ESCALATION LOGIC
Unapproved or excess privileges → immediate revocation; potential incident.

### 12. FAILURE CONDITIONS
No quarterly review → HIPAA admin safeguards failure.

### 13. AUDIT REQUIREMENTS
Review artifacts retained 6 years.

---

## IT-WF-05 — PASSWORD / MFA MANAGEMENT

### 1. POLICY REFERENCES
- IT-AC-004 Authentication; 45 CFR § 164.308(a)(5)(ii)(D); 164.312(d)

### 2. PROCESS OVERVIEW
Enforces strong authentication: complexity, rotation (or passphrase/MFA in lieu of rotation per NIST 800-63B), MFA for all remote and admin access.

### 3. TRIGGER(S)
- Continuous
- Incident (forced reset)

### 4. RESPONSIBLE ROLES
- **Primary:** IT Security
- **Supporting:** Users
- **Approval:** Security Officer

### 5. INPUTS
- Identity provider policies; MFA enrollment

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Enforce password policy (IdP) | IT | IT-FM-017 Authentication Policy Configuration Log | Ongoing |
| 2 | MFA enrollment | Users | IT-FM-009 MFA Enrollment Log | At hire / within 30 days |
| 3 | Annual password/MFA attestation | Users | IT-FM-018 Annual User Attestation | Annual |
| 4 | Incident-driven reset | IT | IT-FM-019 Forced Reset Record | Per incident |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-009, IT-FM-017, IT-FM-018, IT-FM-019.

### 8. APPROVALS
Security Officer policy; Admin receives annual attestation.

### 9. OUTPUTS
Policy enforcement evidence; MFA enrollment list; attestations; reset records.

### 10. SLA / DEADLINES
Enrollment within 30 days; annual attestation.

### 11. ESCALATION LOGIC
Non-enrollment after 30 days → access suspension until compliant.

### 12. FAILURE CONDITIONS
Weak authentication → HIPAA § 164.312(d) violation; incident risk.

### 13. AUDIT REQUIREMENTS
Policy config snapshots; MFA coverage reports.

---

## IT-WF-06 — AUDIT LOGGING & MONITORING

### 1. POLICY REFERENCES
- IT-SP-002 Audit Controls; 45 CFR § 164.312(b); § 164.308(a)(1)(ii)(D) (information system activity review)

### 2. PROCESS OVERVIEW
Ensures systems with ePHI generate audit logs; logs are centralized, monitored, and reviewed for suspicious activity.

### 3. TRIGGER(S)
- Continuous
- Security alert
- Incident investigation

### 4. RESPONSIBLE ROLES
- **Primary:** Security Officer / IT SecOps
- **Supporting:** System owners
- **Approval:** Administrator (periodic review)

### 5. INPUTS
- System logs; SIEM; alert rules

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Confirm logging enabled on all ePHI systems | IT | IT-FM-020 Audit Logging Inventory | Quarterly |
| 2 | Centralize logs (SIEM) | IT SecOps | Config records | Continuous |
| 3 | Define alerts (failed logins, mass downloads, after-hours ePHI access) | Security Officer | IT-FM-021 Alert Configuration Register | Reviewed quarterly |
| 4 | Monthly activity review | Security Officer | IT-FM-022 Monthly Information System Activity Review | Monthly |
| 5 | Alert → Incident path | SecOps | IT-WF-09 | Real-time |
| 6 | Retention: ≥ 6 years | IT | Retention config | Ongoing |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-020, IT-FM-021, IT-FM-022.

### 8. APPROVALS
Security Officer certifies monthly review; Admin briefed quarterly.

### 9. OUTPUTS
Logging inventory; alert rules; monthly review report; incidents.

### 10. SLA / DEADLINES
Monthly review; log retention 6 years.

### 11. ESCALATION LOGIC
High-severity alert → IT-WF-09 within minutes; Security Officer + Administrator notified.

### 12. FAILURE CONDITIONS
No logging = § 164.312(b) violation; no activity review = § 164.308(a)(1)(ii)(D) violation.

### 13. AUDIT REQUIREMENTS
Review evidence, alert configs, retention proof.

---

## IT-WF-07 — BACKUP, DATA RESTORATION & TEST

### 1. POLICY REFERENCES
- IT-BC-001 Backup; 45 CFR § 164.308(a)(7)(ii)(A)-(B) & (D)

### 2. PROCESS OVERVIEW
Performs backups with encryption, offsite/cloud copy, and tests restoration capability at least annually.

### 3. TRIGGER(S)
- Continuous (backup)
- Annual restoration test
- Post-incident restoration

### 4. RESPONSIBLE ROLES
- **Primary:** IT Infrastructure Lead
- **Supporting:** Security Officer
- **Approval:** Administrator

### 5. INPUTS
- Backup config; RPO/RTO; test plan

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Maintain backup schedule for all ePHI systems | IT | IT-FM-023 Backup Schedule & Log | Continuous |
| 2 | Encrypt backups; offsite/cloud | IT | IT-FM-024 Backup Encryption & Storage Register | Continuous |
| 3 | Annual restore test | IT + Security Officer | IT-FM-025 Annual Restore Test Report | Annual (min) |
| 4 | Remediate failures | IT | IT-FM-003 | Within 30 days |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-023, IT-FM-024, IT-FM-025, IT-FM-003.

### 8. APPROVALS
Security Officer signs test results; Admin accepts.

### 9. OUTPUTS
Backup logs; restore test report; remediation.

### 10. SLA / DEADLINES
Continuous backups; annual restore test.

### 11. ESCALATION LOGIC
Failed restore → Security Officer + Admin + Governing Body; CAP and re-test.

### 12. FAILURE CONDITIONS
No backup or unverified restore = § 164.308(a)(7) CP/DR failure.

### 13. AUDIT REQUIREMENTS
Backup logs; encryption evidence; restore-test reports.

---

## IT-WF-08 — DISASTER RECOVERY & BUSINESS CONTINUITY

### 1. POLICY REFERENCES
- IT-BC-002 DR/BC; 45 CFR § 164.308(a)(7); 42 CFR § 484.102 (EP) overlap

### 2. PROCESS OVERVIEW
Maintains DR plan, BC plan, conducts annual tabletop/ functional exercise (coordinated with RM-WF-02).

### 3. TRIGGER(S)
- Annual exercise
- Actual outage
- Post-incident

### 4. RESPONSIBLE ROLES
- **Primary:** Security Officer / IT Lead
- **Supporting:** EP Coordinator, Clinical Manager
- **Approval:** Administrator; Governing Body

### 5. INPUTS
- DR plan; BIA; RTO/RPO; vendor support contracts

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Maintain BIA & DR/BC plan | Security Officer | IT-FM-026 Business Impact Analysis; IT-FM-027 DR/BC Plan | Annual review |
| 2 | Tabletop exercise | Security Officer + Admin | IT-FM-028 DR/BC Exercise Report | Annual |
| 3 | Capture AARs & update plans | Security Officer | IT-FM-028 | ≤ 30 days |
| 4 | Integrate w/ EP (RM-WF-02) | EP Coord + Security Officer | RM-FM-002 / RM-FM-003 | Annual |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-026, IT-FM-027, IT-FM-028, RM-FM-002, RM-FM-003.

### 8. APPROVALS
Administrator approves plan; Governing Body acknowledges.

### 9. OUTPUTS
BIA, DR/BC plan, exercise report, AAR.

### 10. SLA / DEADLINES
Annual exercise; plan update annual.

### 11. ESCALATION LOGIC
Actual DR event → IT-WF-09 + RM-WF-02; leadership activation within 1 hour.

### 12. FAILURE CONDITIONS
No DR plan = HIPAA contingency plan failure; EP CoP risk.

### 13. AUDIT REQUIREMENTS
Plans, exercise records, AARs retained 6 years.

---

## IT-WF-09 — IT SECURITY INCIDENT RESPONSE

### 1. POLICY REFERENCES
- IT-IR-001 IR Plan; 45 CFR § 164.308(a)(6); NIST SP 800-61
- CA data-breach statute (Civil Code § 1798.82); CMIA § 56.101; HIPAA Breach Notification

### 2. PROCESS OVERVIEW
Detects, contains, eradicates, recovers, and documents security incidents; integrates with CO-WF-10 HIPAA breach workflow when PHI is involved.

### 3. TRIGGER(S)
- SIEM alert / user report / vendor notice
- Ransomware / malware
- Lost/stolen device
- Unauthorized access

### 4. RESPONSIBLE ROLES
- **Primary:** Security Officer / CISO (or equivalent)
- **Supporting:** IT SecOps, Privacy Officer, Legal, External DFIR
- **Approval:** Administrator; Governing Body (material incidents)

### 5. INPUTS
- Alert/report; logs; forensics

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Detect & log incident | SecOps | IT-FM-029 Security Incident Ticket | Immediate |
| 2 | Classify severity (S1-S4) | Security Officer | IT-FM-030 Incident Severity Classification | ≤ 1 hour |
| 3 | Contain (isolate system, block IP) | IT SecOps | IT-FM-029 | Per severity SLA (S1 ≤ 1h) |
| 4 | Eradicate (remove malware, disable accounts) | IT SecOps | IT-FM-029 | Per severity |
| 5 | Recover (restore clean data, validate) | IT | IT-FM-029 | Per RTO |
| 6 | Forensics & root cause | DFIR / Security Officer | IT-FM-031 Incident Forensics Report | ≤ 30 days |
| 7 | If PHI involved → trigger CO-WF-10 (breach risk assessment) | Privacy Officer | CO-FM-029 Breach Risk Assessment | ≤ 5 business days |
| 8 | Report to Admin & Board (decision/acceptance captured in meeting minutes) | Security Officer | GV-FM-023; GV-FM-005 Governing Body Meeting Minutes Template; CO-FM-024 Compliance Committee Meeting Minutes | Per severity |
| 9 | CAP & tabletop update | Security Officer | IT-FM-032 Post-Incident CAP | ≤ 30 days |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-029, IT-FM-030, IT-FM-031, IT-FM-032, CO-FM-029, GV-FM-023, GV-FM-005, CO-FM-024 Compliance Committee Meeting Minutes.

### 8. APPROVALS
Security Officer/CISO manages; Administrator approves disclosures; Legal approves regulator notifications.

### 9. OUTPUTS
Incident ticket, forensics, CAP, breach risk assessment (if applicable), Governing Body Meeting Minutes (GV-FM-005) and Compliance Committee Meeting Minutes (CO-FM-024) evidencing escalation/acceptance.

### 10. SLA / DEADLINES
S1 container ≤1h; forensics ≤30d; HIPAA breach notifications 60d (≥500 individuals: OCR + media immediately); CMIA 15 business days for clearinghouse medical info breaches.

### 11. ESCALATION LOGIC
Confirmed PHI breach → CO-WF-10; ransomware with exfiltration → Legal + Exec + external counsel + law enforcement evaluation.

### 12. FAILURE CONDITIONS
Missed containment → expanded harm & penalties; late notifications → per-day CMPs.

### 13. AUDIT REQUIREMENTS
Full incident file 6+ years; OCR retains enforcement authority.

---

## IT-WF-10 — DEVICE & ENDPOINT MANAGEMENT

### 1. POLICY REFERENCES
- IT-AM-001 Endpoint Security; 45 CFR §§ 164.310(d), 164.312(a)(2)(iv) (encryption)

### 2. PROCESS OVERVIEW
Manages agency-issued laptops/desktops: encryption, MDM, antivirus, patching, loss reporting.

### 3. TRIGGER(S)
- Device issue / transfer / retirement
- Loss / theft

### 4. RESPONSIBLE ROLES
- **Primary:** IT Endpoint Admin
- **Supporting:** Security Officer
- **Approval:** Security Officer for exceptions

### 5. INPUTS
- Device inventory; config baselines

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Register device & enroll MDM | IT | IT-FM-001 Asset & ePHI Inventory | At issue |
| 2 | Full-disk encryption verified | IT | IT-FM-024 (encryption register) | At issue |
| 3 | Antivirus / EDR deployed | IT | IT-FM-020 | At issue |
| 4 | Lost/stolen device response (remote wipe, investigation) | IT + Security Officer | IT-FM-029 + CO-FM-029 | Immediate / within 1h |
| 5 | Retirement: sanitize per IT-WF-17 | IT | IT-FM-036 Device Sanitization Record | At retirement |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-001, IT-FM-020, IT-FM-024, IT-FM-029, CO-FM-029, IT-FM-036.

### 8. APPROVALS
Security Officer approves exception; HR confirms device return on separation.

### 9. OUTPUTS
Device records; encryption evidence; wipes; sanitization.

### 10. SLA / DEADLINES
Wipe lost/stolen ≤1h; retire with sanitization before disposal.

### 11. ESCALATION LOGIC
Unencrypted lost device → presumed breach; CO-WF-10 triggers.

### 12. FAILURE CONDITIONS
Unencrypted lost device = HIPAA breach; major enforcement risk.

### 13. AUDIT REQUIREMENTS
Encryption coverage report; lost-device IR tickets.

---

## IT-WF-11 — MOBILE DEVICE / BYOD MANAGEMENT

### 1. POLICY REFERENCES
- IT-AM-002 Mobile / BYOD; 45 CFR § 164.310(d)(1)

### 2. PROCESS OVERVIEW
Governs mobile devices (agency-owned or BYOD) accessing ePHI: MDM container, MAM, PIN/biometrics, remote wipe, user agreement.

### 3. TRIGGER(S)
- Mobile access request
- Device change / loss
- Separation

### 4. RESPONSIBLE ROLES
- **Primary:** IT Mobile Admin
- **Supporting:** Security Officer
- **Approval:** Security Officer

### 5. INPUTS
- User request; device type; use case

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Submit mobile access request | User | IT-FM-033 Mobile Access Request & BYOD Agreement | Before access |
| 2 | Enroll in MDM/MAM | IT | IT-FM-033 | Before access |
| 3 | Enforce config (encryption, PIN, auto-lock, remote wipe) | IT | MDM policy | Continuous |
| 4 | Loss → remote wipe | IT | IT-FM-029 | Immediate |
| 5 | Separation → unenroll/wipe corporate container | IT | IT-FM-011 | Separation date |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-033, IT-FM-029, IT-FM-011.

### 8. APPROVALS
Security Officer approves exceptions.

### 9. OUTPUTS
Enrollment evidence; BYOD agreements; wipes.

### 10. SLA / DEADLINES
Wipe ≤1h; separation unenroll same day.

### 11. ESCALATION LOGIC
MDM bypass detected → incident; possible disciplinary.

### 12. FAILURE CONDITIONS
Unmanaged mobile ePHI access → breach risk.

### 13. AUDIT REQUIREMENTS
MDM inventory; agreements; wipe logs.

---

## IT-WF-12 — REMOVABLE MEDIA / USB RESTRICTIONS

### 1. POLICY REFERENCES
- IT-AM-003 Removable Media; 45 CFR § 164.310(d)(2)(i) (disposal) & § 164.312(a)(2)(iv)

### 2. PROCESS OVERVIEW
Restricts USB/removable media; where permitted, enforces encryption, tracking, and disposal.

### 3. TRIGGER(S)
- Business need (rare)
- Incident

### 4. RESPONSIBLE ROLES
- **Primary:** IT Security
- **Approval:** Security Officer

### 5. INPUTS
- Policy; DLP configuration

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Default: USB blocked via DLP | IT | IT-FM-021 | Continuous |
| 2 | Exception request | Requestor | IT-FM-034 Removable Media Exception & Tracking | Before use |
| 3 | Encrypt & track media | IT | IT-FM-034 | On use |
| 4 | Return & sanitize post-use | IT | IT-FM-036 Device Sanitization Record | Post-use |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-021, IT-FM-034, IT-FM-036.

### 8. APPROVALS
Security Officer approves exceptions.

### 9. OUTPUTS
DLP evidence; exception tracking; sanitization.

### 10. SLA / DEADLINES
Exception use time-boxed; sanitize same day post-use.

### 11. ESCALATION LOGIC
DLP bypass attempts → incident + user HR action.

### 12. FAILURE CONDITIONS
PHI on unencrypted USB = breach.

### 13. AUDIT REQUIREMENTS
Exception logs; DLP config.

---

## IT-WF-13 — PATCH & VULNERABILITY MANAGEMENT

### 1. POLICY REFERENCES
- IT-NE-001 Patch & Vulnerability; 45 CFR § 164.308(a)(1)(ii)(B)

### 2. PROCESS OVERVIEW
Scans for vulnerabilities and patches on defined cadence (critical ≤7d, high ≤30d, med ≤60d, low ≤90d); tracks exceptions.

### 3. TRIGGER(S)
- Patch release
- Vulnerability scan
- Zero-day

### 4. RESPONSIBLE ROLES
- **Primary:** IT Security / SysAdmin
- **Approval:** Security Officer

### 5. INPUTS
- Scan reports; vendor advisories; CISA KEV

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Run vulnerability scans | IT Security | IT-FM-035 Vulnerability Scan Report | Monthly; external weekly |
| 2 | Classify & prioritize | Security Officer | IT-FM-035 | Within 5 days |
| 3 | Patch per SLA | IT SysAdmin | Change ticket (IT-WF-14) | Per criticality |
| 4 | Track exceptions | Security Officer | IT-FM-036 Patch Exception Register | Per exception |
| 5 | Report to Admin | Security Officer | GV-FM-023 | Quarterly |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-029 Vulnerability Management & Patch Compliance Log (used for patch exceptions), IT-FM-032 Post-Incident Corrective Action Plan, GV-FM-023 Annual Compliance Report to Governing Body.

### 8. APPROVALS
Security Officer approves exceptions & prioritization.

### 9. OUTPUTS
Scan reports; patch evidence; exception register.

### 10. SLA / DEADLINES
Critical ≤7d; High ≤30d; Med ≤60d; Low ≤90d.

### 11. ESCALATION LOGIC
Critical unpatched at SLA → Security Officer + Admin emergency change.

### 12. FAILURE CONDITIONS
Unpatched critical vulnerabilities on ePHI systems = HIPAA violation + breach risk.

### 13. AUDIT REQUIREMENTS
Scan records; patch evidence; exception rationale.

---

## IT-WF-14 — CHANGE MANAGEMENT

### 1. POLICY REFERENCES
- IT-NE-002 Change Management; ITIL principles

### 2. PROCESS OVERVIEW
Controls IT changes (systems, network, configurations) with pre-approval, testing, and rollback plan.

### 3. TRIGGER(S)
- Standard change / normal / emergency change

### 4. RESPONSIBLE ROLES
- **Primary:** IT Change Manager
- **Supporting:** Dev/Ops teams; Security Officer
- **Approval:** Change Advisory Board (CAB)

### 5. INPUTS
- Change request; test plan; rollback plan

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Submit request | Requestor | IT-FM-037 Change Request Form | Per cadence |
| 2 | Risk & security review | Security Officer | IT-FM-037 | Pre-CAB |
| 3 | CAB approval | CAB | IT-FM-038 CAB Meeting Minutes | Per cycle |
| 4 | Test & implement | IT | Evidence | Per plan |
| 5 | Post-implementation review | IT | IT-FM-039 Post-Implementation Review | ≤ 5 days after deploy |
| 6 | Emergency change retrospective | CAB | IT-FM-038 | Next CAB |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-037, IT-FM-038, IT-FM-039.

### 8. APPROVALS
CAB for normal; Security Officer + Admin for emergency.

### 9. OUTPUTS
Change request, approvals, test evidence, PIR.

### 10. SLA / DEADLINES
Per CAB cadence; emergency retro ≤5 days.

### 11. ESCALATION LOGIC
Failed change causing outage → IT-WF-09 incident + CAB retrospective.

### 12. FAILURE CONDITIONS
Uncontrolled change → outage + ePHI integrity risk.

### 13. AUDIT REQUIREMENTS
Per-change record; CAB minutes; PIRs.

---

## IT-WF-15 — VENDOR / CLOUD SAAS SECURITY REVIEW & BAA

### 1. POLICY REFERENCES
- IT-SP-003 Vendor Security; 45 CFR §§ 164.308(b), 164.314(a); CO-HP-006

### 2. PROCESS OVERVIEW
Evaluates third-party systems that touch ePHI (or provide critical services) for security posture; ensures BAA and technical integrations are safe.

### 3. TRIGGER(S)
- New SaaS / vendor
- Annual review
- Vendor breach notice

### 4. RESPONSIBLE ROLES
- **Primary:** Security Officer
- **Supporting:** IT, Compliance, Procurement (OP-WF-03)
- **Approval:** Administrator

### 5. INPUTS
- Vendor questionnaire; SOC 2 / HITRUST; BAA; integration details

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Vendor tech security questionnaire | Security Officer | IT-FM-040 Vendor Security Assessment Questionnaire | Before contract |
| 2 | SOC 2 / HITRUST / ISO review | Security Officer | IT-FM-041 Vendor Attestation Review | Before contract |
| 3 | Pen test / integration review | IT | IT-FM-041 | Before go-live |
| 4 | BAA executed (CO-WF-09 / GV-WF-11) | Legal + Compliance | CO-FM-016 | Before data flow |
| 5 | Annual re-review | Security Officer | IT-FM-040 | Annual |
| 6 | Vendor breach → CO-WF-10 | Privacy Officer | CO-FM-029 | Per vendor notice |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-040, IT-FM-041, CO-FM-016, CO-FM-029.

### 8. APPROVALS
Security Officer approves posture; Administrator signs contract; Compliance on BAA.

### 9. OUTPUTS
Vendor security file; BAA; annual review.

### 10. SLA / DEADLINES
Pre-contract; annual re-review.

### 11. ESCALATION LOGIC
Failed security posture → reject vendor or compensating controls + executive acceptance.

### 12. FAILURE CONDITIONS
BA without BAA + secure controls → HIPAA + breach exposure.

### 13. AUDIT REQUIREMENTS
Per-vendor security file; BAA inventory current.

---

## IT-WF-16 — EMAIL SECURITY (PHISHING, ENCRYPTION, DLP)

### 1. POLICY REFERENCES
- IT-NE-003 Email Security; 45 CFR § 164.312(e) (transmission); HIPAA Omnibus

### 2. PROCESS OVERVIEW
Secures email: anti-phishing, SPF/DKIM/DMARC, TLS, encryption for ePHI, DLP, user training.

### 3. TRIGGER(S)
- Continuous
- Phishing report
- Suspected compromise

### 4. RESPONSIBLE ROLES
- **Primary:** IT SecOps
- **Supporting:** Security Officer, HR (training)
- **Approval:** Security Officer

### 5. INPUTS
- Email gateway logs; DLP; user reports

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Maintain anti-phishing & DMARC | IT SecOps | IT-FM-042 Email Security Configuration Register | Continuous |
| 2 | Configure ePHI encryption rules (e.g., automatic TLS/portal) | IT SecOps | IT-FM-042 | Continuous |
| 3 | DLP policies (ePHI, credentials) | IT SecOps | IT-FM-042 | Continuous |
| 4 | Phishing simulations (quarterly) | IT SecOps + HR | IT-FM-043 Phishing Simulation Report | Quarterly |
| 5 | User-reported phishing handling | SecOps | IT-FM-029 | Per report |
| 6 | Incident → IT-WF-09 / CO-WF-10 if breach | SecOps + Privacy Officer | IT-FM-029, CO-FM-029 | Per IR SLA |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-042, IT-FM-043, IT-FM-029, CO-FM-029.

### 8. APPROVALS
Security Officer certifies configs; HR approves training results.

### 9. OUTPUTS
Config register; simulation reports; incident records.

### 10. SLA / DEADLINES
Quarterly simulations; real-time incident response.

### 11. ESCALATION LOGIC
BEC confirmed → full IR activation; wire-fraud assessment by Finance (FN-WF).

### 12. FAILURE CONDITIONS
Unencrypted PHI email = HIPAA transmission violation.

### 13. AUDIT REQUIREMENTS
Config snapshots; simulation results; training records.

---

## IT-WF-17 — DATA / MEDIA DISPOSAL & SANITIZATION

### 1. POLICY REFERENCES
- IT-DM-001 Media Disposal; 45 CFR § 164.310(d)(2)(i)-(ii); NIST SP 800-88

### 2. PROCESS OVERVIEW
Securely sanitizes or destroys media (disks, tapes, paper) per NIST 800-88; prevents PHI residual exposure.

### 3. TRIGGER(S)
- Device retirement
- Media replacement
- Vendor offboarding

### 4. RESPONSIBLE ROLES
- **Primary:** IT Asset Mgmt
- **Supporting:** Security Officer; certified destruction vendor
- **Approval:** Security Officer

### 5. INPUTS
- Device inventory; vendor certificates

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Classify media | IT | IT-FM-001 | At retirement |
| 2 | Sanitize per NIST 800-88 (Clear/Purge/Destroy) | IT / vendor | IT-FM-036 Device Sanitization Record | Before disposal |
| 3 | Vendor destruction certificate | Vendor | Cert of Destruction | On destruction |
| 4 | Update asset inventory | IT | IT-FM-001 | At disposal |
| 5 | Paper PHI shredding | Office Admin | IT-FM-044 Paper PHI Shredding Log | Continuous |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-001, IT-FM-036, IT-FM-044.

### 8. APPROVALS
Security Officer signs annual inventory reconciliation.

### 9. OUTPUTS
Sanitization record; destruction cert; inventory update.

### 10. SLA / DEADLINES
Before disposal.

### 11. ESCALATION LOGIC
Missing certificate / unsanitized device found → IT-WF-09 + CO-WF-10.

### 12. FAILURE CONDITIONS
Improper disposal = HIPAA breach (classic enforcement case).

### 13. AUDIT REQUIREMENTS
Sanitization & destruction records retained 6 years.

---

## IT-WF-18 — REMOTE ACCESS / VPN

### 1. POLICY REFERENCES
- IT-NE-004 Remote Access; 45 CFR § 164.312(e)

### 2. PROCESS OVERVIEW
Secures remote access via VPN or ZTNA with MFA, device posture, logging.

### 3. TRIGGER(S)
- Remote worker access
- Contractor access

### 4. RESPONSIBLE ROLES
- **Primary:** IT NetOps / Security Officer
- **Approval:** Security Officer

### 5. INPUTS
- User role; device posture

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Grant remote access post role approval | IT | IT-FM-004 | At entitlement |
| 2 | Enforce MFA + device posture | IT | IT-FM-017, IT-FM-009 | Continuous |
| 3 | Log sessions | IT SecOps | IT-FM-022 | Continuous |
| 4 | Revoke at separation / inactivity | IT | IT-FM-010 / IT-FM-011 | Per policy |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-004, IT-FM-009, IT-FM-010, IT-FM-011, IT-FM-017, IT-FM-022.

### 8. APPROVALS
Security Officer signs exceptions (split tunnel, legacy client).

### 9. OUTPUTS
Access records; session logs; revocations.

### 10. SLA / DEADLINES
Revocation aligned with HR-WF-14.

### 11. ESCALATION LOGIC
Suspicious session → IT-WF-09.

### 12. FAILURE CONDITIONS
Unmanaged device remote access → malware/lateral movement risk.

### 13. AUDIT REQUIREMENTS
Session logs; MFA coverage; revocation evidence.

---

## IT-WF-19 — FACILITY PHYSICAL ACCESS CONTROLS

### 1. POLICY REFERENCES
- IT-SP-004 Physical Safeguards; 45 CFR § 164.310(a)-(c)

### 2. PROCESS OVERVIEW
Maintains physical security of facility, server/IT closet, file rooms, workstations; badge access and visitor logs.

### 3. TRIGGER(S)
- Continuous
- Incident

### 4. RESPONSIBLE ROLES
- **Primary:** Facilities Mgr
- **Supporting:** IT, Security Officer
- **Approval:** Administrator

### 5. INPUTS
- Badge system; visitor log; camera

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Assign badges per role | Facilities | IT-FM-045 Badge Assignment Log | At hire |
| 2 | Maintain visitor log | Reception | IT-FM-046 Visitor Log | Continuous |
| 3 | Restrict sensitive areas (server, records) | Facilities + IT | IT-FM-045 zone list | Continuous |
| 4 | Quarterly badge review | Facilities + Security Officer | IT-FM-045 | Quarterly |
| 5 | Revoke badge on separation | Facilities | HR-FM-056 | Same day |
| 6 | Visitor escort & NDA for BA visitors | Reception + Compliance | CO-FM-016 if BAA | On visit |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-045, IT-FM-046, HR-FM-056, CO-FM-016.

### 8. APPROVALS
Administrator approves zones; Security Officer reviews quarterly.

### 9. OUTPUTS
Badge log; visitor log; reviews.

### 10. SLA / DEADLINES
Same-day revocation; quarterly review.

### 11. ESCALATION LOGIC
Unauthorized physical access → IT-WF-09 + Facility + Police if warranted.

### 12. FAILURE CONDITIONS
Unsecured records/servers = § 164.310 violation.

### 13. AUDIT REQUIREMENTS
Badge + visitor logs retained 6 years.

---

## IT-WF-20 — DATA SUBJECT RIGHTS (CMIA / CCPA ACCESS, DELETE, CORRECT)

### 1. POLICY REFERENCES
- CO-CA-001 CMIA; CO-HP-005 Individual Rights (Access/Amendment)
- 45 CFR § 164.524 (access); § 164.526 (amendment); CCPA § 1798.100-1798.199

### 2. PROCESS OVERVIEW
Technical execution of data subject rights requests: patient access/amendment (HIPAA) and CCPA access/delete/correct (where applicable; medical records have HIPAA exemption but other agency data may be CCPA-scope).

### 3. TRIGGER(S)
- Patient request
- Consumer (employee/applicant) request under CCPA

### 4. RESPONSIBLE ROLES
- **Primary:** Privacy Officer / Medical Records
- **Supporting:** IT (data extraction)
- **Approval:** Privacy Officer

### 5. INPUTS
- Verified identity; request details

### 6. STEP-BY-STEP EXECUTION

| # | Action | Role | Form | Deadline |
|---|--------|------|------|----------|
| 1 | Intake request & verify identity | Privacy Officer | IT-FM-047 Data Subject Request Intake | Same day |
| 2 | Route: HIPAA (patient medical), CMIA, CCPA (non-HIPAA data) | Privacy Officer | IT-FM-047 | ≤ 3 business days |
| 3 | IT extracts/compiles data | IT | IT-FM-048 Data Extract Log | ≤ 10 days |
| 4 | Privacy review & fulfill | Privacy Officer | CL-FM-048 Patient Record Request (HIPAA); IT-FM-049 CCPA Response Letter | HIPAA 30 days (one 30-day extension); CCPA 45 days (one 45-day extension) |
| 5 | Document fulfillment | Privacy Officer | IT-FM-047 | Per request |

### 7. REQUIRED FORMS & DOCUMENTS
IT-FM-047, IT-FM-048, IT-FM-049, CL-FM-048.

### 8. APPROVALS
Privacy Officer signs; Legal for complex CCPA deletion.

### 9. OUTPUTS
Request file; data provided/actions taken.

### 10. SLA / DEADLINES
HIPAA 30d (+30); CCPA 45d (+45).

### 11. ESCALATION LOGIC
Denial path → appeal process; regulator inquiry → Legal.

### 12. FAILURE CONDITIONS
Late response = HIPAA / CMIA / CCPA violation; private right of action under CCPA.

### 13. AUDIT REQUIREMENTS
Full request file retained 6 years (HIPAA) / per CCPA.

---

## MEETING MINUTES MATRIX (IT DOMAIN)

Every IT workflow that involves a governance body, committee, or CAB action must generate signed minutes. Surveyors will request these minutes first.

| Workflow | Body Convened | Minutes Artifact | Retention |
|----------|---------------|------------------|-----------|
| IT-WF-01 Annual SRA | Governing Body (approval) | **GV-FM-005 Governing Body Meeting Minutes** | 6 yrs (HIPAA § 164.316(b)) |
| IT-WF-01 Annual SRA | Compliance Committee (pre-Board) | **CO-FM-024 Compliance Committee Meeting Minutes** | 6 yrs |
| IT-WF-04 Quarterly Access Review | Governing Body (summary acceptance) | **GV-FM-005** | 6 yrs |
| IT-WF-07 Backup/Restore | Governing Body (if failed restore) | **GV-FM-005** | 6 yrs |
| IT-WF-08 DR/BC Exercise | Governing Body (plan approval) | **GV-FM-005** | 6 yrs |
| IT-WF-09 Incident Response | Governing Body (material incidents) | **GV-FM-005** + **CO-FM-024** | 6 yrs |
| IT-WF-13 Patch Mgmt | Admin/Board briefing on exceptions | **GV-FM-005** | 6 yrs |
| IT-WF-14 Change Management | Change Advisory Board | **IT-FM-038 CAB Meeting Minutes** | 6 yrs |
| IT-WF-15 Vendor/BAA Review | Compliance Committee (BAA review) | **CO-FM-024** | 6 yrs |

---

## DOMAIN-LEVEL VALIDATION CHECK

- [x] All HIPAA Security Rule implementation specs mapped (Admin, Physical, Technical Safeguards).
- [x] SRA (annual), IR (24/7), Access (prov/term/review), Backup/DR/BC, Encryption, Logging, Media disposal covered.
- [x] Direct integration with CO-WF-10 breach workflow for ePHI incidents.
- [x] Vendor/cloud security tied to BAA (CO-WF-09) and Procurement (OP-WF-03).
- [x] Mobile/BYOD, USB/removable, patching, email, remote access, physical safeguards explicit.
- [x] Data subject rights (HIPAA/CMIA/CCPA) operationalized (IT-WF-20).
- [x] All IT-FM forms referenced (IT-FM-001..IT-FM-038 in library). 2026-04-21 audit expansion added IT-FM-031 IT/Security Committee Meeting Minutes, IT-FM-032 Post-Incident Corrective Action Plan, and IT-FM-038 Change Advisory Board (CAB) Meeting Minutes.
- [x] Every workflow has forms, deadlines, approvals, escalation, failure, audit.
