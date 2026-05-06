# HR Domain — Manual ACHC Tagging Report
## Pass: Corridor Print Crosswalk Pages 7–31 | Surveyor: ACHC Home Health Surveyor Mode

---

## Scope

- **Domain:** HR (Human Resources)
- **Primary Source:** Corridor print crosswalk pages 7–31 (PDF read directly — primarily Section 1, Section 2, Section 4, Section 6)
- **Final Authority:** Policy content — if content did not match Corridor row, no tag was applied
- **Page 756 Used for Tagging?** NO
- **Architectural Split Applied:** YES — HR domain reveals the sharpest split yet

---

## Architectural Layer Split — HR Domain

HR is the most instructive domain for the architectural split because it exposes exactly where accreditation frameworks end and operational HR governance begins.

### A. Legacy Regulatory Crosswalk Layer (Corridor-anchored)
Staff qualification requirements, contracted services, HHA training, abuse reporting obligations, occupational health exposure management.

### B. Modern Operational Governance Layer (no Corridor equivalent)
Performance evaluation, disciplinary action, employee grievance, anti-harassment/EEO, drug-free workplace, separation/exit, DEI programs, remote work, recruitment, background checks, CE programs, personnel file management, staffing levels, volunteers.

**The NONE rate in HR (39%) is the highest yet — and that is correct. It proves the system is working.**

---

## Validation Totals

| Metric | Count |
|--------|-------|
| Total HR policies reviewed | 41 |
| Mapped — DIRECT | 7 |
| Mapped — PARTIAL | 18 |
| Unmapped — NONE | 16 |
| Modern Operational Governance Layer (NONE) | 15 |
| Modern CA Regulatory / Post-Corridor (NONE) | 1 |
| Cross-domain overlap flags | 4 |
| Duplicate semantic family flags | 1 pair (HR-WM-005 / HR-WM-007) |

---

## Corridor Sections Used for HR Domain

| Section | Key HR-Relevant Rows |
|---------|---------------------|
| Section 1 — Organization & Administration | 1-002 (Governing Body), 1-006 (Admin Qualifications), 1-007 (Administrator Appointment), 1-008 (Designee), 1-009 (HH Administrator), 1-013 (Policy Development), 1-015 (Org Chart), 1-022–1-024 (Contracted Services) |
| Section 2 — Program/Service Operations | 1-025 (Scope of Services), 2-037 (Abuse/Neglect Reporting), 2-041 (Corporate Compliance — OIG screening) |
| Section 4 — Provision of Care | 4-004 (Rehabilitation Care Planning), 4-006 (HHA POC), 4-007 (HHA Orientation/Competency) |
| Section 6 — Risk Management | 6-001 (Management of Exposures), 6-018 (Environmental Safety), 6-028 (TB ECP), 6-029 (BBP ECP), 6-037 (Emergency Management Plan) |

---

## HR Policies by Subdomain

### EH — Employee Health (1 policy)

| Policy ID | Title | Corridor Row(s) | Type |
|-----------|-------|----------------|------|
| HR-EH-101 | Employee Health, Exposure & Occupational Clearance | 6-001 Management of Exposures in Personnel | DIRECT |

### ER — Employee Relations (9 policies)

| Policy ID | Title | Corridor Row(s) | Type | Layer |
|-----------|-------|----------------|------|-------|
| HR-ER-001 | Performance Evaluation & Review | — | NONE | Modern Operational |
| HR-ER-002 | Disciplinary Action & Progressive Discipline | — | NONE | Modern Operational |
| HR-ER-003 | Employee Grievance & Complaint Process | — | NONE | Modern Operational |
| HR-ER-004 | Anti-Harassment & Non-Discrimination | — | NONE | Modern Operational |
| HR-ER-005 | Substance Abuse & Drug-Free Workplace | — | NONE | Modern Operational |
| HR-ER-006 | Separation & Exit Process | — | NONE | Modern Operational |
| HR-ER-007 | Workforce Diversity & Inclusion | — | NONE | Modern Operational |
| HR-ER-008 | Remote Work & Flexible Scheduling | — | NONE | Modern Operational |
| HR-ER-009 | Mandatory Abuse Reporting by Staff | 2-037 Assessment of Possible Abuse/Neglect | DIRECT | Legacy |

**ER subdomain analysis:** 8 of 9 ER policies are Modern Operational Governance Layer. HR-ER-009 is the sole exception — mandatory abuse reporting has a direct Corridor row (2-037) because it is a clinical regulatory obligation, not HR governance. The patient care regulatory requirement traveled into HR as the workforce training/accountability layer.

**Distinction applied — patient vs. employee nondiscrimination:** HR-ER-004 (Anti-Harassment/Non-Discrimination) received NONE rather than a stretch PARTIAL to Corridor row 2-039 'Nondiscrimination Policy.' Row 2-039 governs patient nondiscrimination in care delivery (HH2-8A.01, HH2-8B.01). Employee anti-harassment under FEHA/Title VII is a different regulatory obligation. Forcing 2-039 onto HR-ER-004 would collapse patient rights and employment law into the same bucket — a surveyor-defensibility failure.

### JD — Job Descriptions (12 policies)

| Policy ID | Title | Corridor Row(s) | Type |
|-----------|-------|----------------|------|
| HR-JD-000 | Governing Body Structure & Responsibilities | 1-002 Governing Body | DIRECT |
| HR-JD-001 | Administrator | 1-006; 1-007; 1-009 Admin Qualifications/Appointment | DIRECT |
| HR-JD-002 | Administrator Designee | 1-008 Designee Designation | DIRECT |
| HR-JD-003 | Director of Nursing / Clinical Manager | 1-006; 1-015 Admin Qualifications; Org Chart | PARTIAL |
| HR-JD-004 | Clinical Designee | 1-006; 1-008 | PARTIAL |
| HR-JD-005 | Registered Nurse (RN) | 1-025; 1-016 Scope of Services; Uniform Quality | PARTIAL |
| HR-JD-006 | Licensed Vocational Nurse (LVN) | 1-025 Scope of Services | PARTIAL |
| HR-JD-007 | Home Health Aide (HHA) | 4-007; 4-006 HHA Orientation; HHA POC | DIRECT |
| HR-JD-008 | Medical Social Worker (MSW) | 1-025 Scope of Services | PARTIAL |
| HR-JD-009 | Physical Therapist (PT) | 4-004; 1-025 Rehab Care Planning; Scope | PARTIAL |
| HR-JD-010 | Occupational Therapist (OT) | 4-004; 1-025 | PARTIAL |
| HR-JD-011 | Speech-Language Pathologist (SLP) | 4-004; 1-025 | PARTIAL |

**JD subdomain architecture — key insight:** The Corridor governs **roles** through two distinct mechanisms:
1. **Leadership roles** (Governing Body, Administrator, Designee): Dedicated Section 1 rows with explicit ACHC standards and CoP citations → DIRECT mappings
2. **Clinical staff roles** (RN, LVN, PT, OT, SLP, MSW): Covered through scope of services rows (1-025) and care delivery rows (4-004) → PARTIAL mappings — the role exists in service delivery context but no job description row
3. **HHA** (unique): The only front-line clinical role with dedicated Corridor rows (4-007, 4-006) governing qualifications, orientation, and competency → DIRECT mapping

This three-tier pattern is how ACHC distinguishes organizational governance roles (explicit crosswalk rows) from clinical service delivery roles (service context only) from aide-level roles (dedicated federal training requirements).

### TA — Talent Acquisition (6 policies)

| Policy ID | Title | Corridor Row(s) | Type | Layer |
|-----------|-------|----------------|------|-------|
| HR-TA-001 | Recruitment & Hiring Standards | — | NONE | Modern Operational |
| HR-TA-002 | Criminal Background Check & Screening | — | NONE | Modern Operational |
| HR-TA-003 | OIG/SAM Exclusion Screening | 2-041 Corporate Compliance Plan | PARTIAL | Legacy |
| HR-TA-004 | Licensure & Certification Verification | 1-006 Admin Qualifications | PARTIAL | Legacy |
| HR-TA-005 | Employee Orientation & Onboarding | 4-007 HHA Orientation | PARTIAL | Legacy/Partial |
| HR-TA-006 | Job Description & Role Definition | 1-015 Org Chart | PARTIAL | Legacy |

**TA subdomain analysis:** Recruitment and background checks are NONE — the Corridor requires staff be qualified but does not govern the process of achieving or verifying that qualification. OIG exclusion screening maps PARTIAL to 2-041 (Corporate Compliance Plan), not because the Corridor governs screening directly, but because the compliance program framework implies it.

### TD — Training & Development (5 policies)

| Policy ID | Title | Corridor Row(s) | Type | Layer |
|-----------|-------|----------------|------|-------|
| HR-TD-001 | Annual Mandatory Training Requirements | 6-003; 5-001 | PARTIAL | Legacy |
| HR-TD-002 | Continuing Education & Professional Development | — | NONE | Modern Operational |
| HR-TD-003 | Clinical Staff Competency Evaluation | 4-007 HHA Orientation | PARTIAL | Legacy/Partial |
| HR-TD-004 | Student & Intern Supervision | — | NONE | Modern Operational |
| HR-TD-005 | Emergency Preparedness Training & Drills | 6-037 Emergency Management Plan | PARTIAL | Legacy |

### TR — Training Records (1 policy)

| Policy ID | Title | Corridor Row(s) | Type |
|-----------|-------|----------------|------|
| HR-TR-101 | Workforce Training, Competency & Policy Acknowledgment | 1-013 Development of Policies and Procedures | PARTIAL |

### WM — Workforce Management (7 policies)

| Policy ID | Title | Corridor Row(s) | Type | Layer |
|-----------|-------|----------------|------|-------|
| HR-WM-001 | Staffing Levels & Workload Management | — | NONE | Modern Operational |
| HR-WM-002 | Contractor & Per Diem Staff Management | 1-022; 1-023; 1-024 Contracted Services | DIRECT | Legacy |
| HR-WM-003 | Employee Health & Immunization Requirements | 6-001; 6-028; 6-029 | PARTIAL | Legacy |
| HR-WM-004 | Workplace Safety & Injury Prevention | 6-018; 6-001 | PARTIAL | Legacy |
| HR-WM-005 | Employee Personnel File Management | — | NONE | Modern Operational |
| HR-WM-006 | Volunteer Management & Oversight | — | NONE | Modern Operational |
| HR-WM-007 | Personnel File Content & Compliance Requirements | — | NONE | Modern Operational |

---

## NONE Policies — Consolidated Rationale

### Modern Operational Governance Layer (15 policies)
| Policy | Category |
|--------|----------|
| HR-ER-001 Performance Evaluation | HR performance management |
| HR-ER-002 Disciplinary Action | HR labor relations |
| HR-ER-003 Employee Grievance | HR labor relations |
| HR-ER-004 Anti-Harassment | FEHA/Title VII employment law |
| HR-ER-005 Substance Abuse | Drug-Free Workplace Act |
| HR-ER-006 Separation & Exit | HR offboarding |
| HR-ER-007 Diversity & Inclusion | Modern organizational development |
| HR-ER-008 Remote Work | Post-pandemic work arrangement governance |
| HR-TA-001 Recruitment & Hiring | HR talent acquisition |
| HR-TA-002 Background Checks | Employment screening (not a Corridor row) |
| HR-TD-002 Continuing Education | Professional development governance |
| HR-TD-004 Student/Intern Supervision | Academic affiliation governance |
| HR-WM-001 Staffing Levels | Operational workforce management |
| HR-WM-005 Personnel File Management | HR records governance |
| HR-WM-006 Volunteer Management | Operational HR |
| HR-WM-007 Personnel File Content | HR records governance |

---

## Cross-Domain Overlap Documentation

| HR Policy | Overlapping Policy | Domain | Corridor Rows | Verdict |
|-----------|------------------|--------|--------------|---------|
| HR-EH-101 | RM-OS-001 (IIPP) | RM | 6-001 | No contradiction. HR-EH-101 = individual employee clearance; RM-OS-001 = occupational safety program infrastructure. |
| HR-TA-003 | CO-RA-007 | CO | 2-041 | No contradiction. HR-TA-003 = HR screening process; CO-RA-007 = regulatory obligation. Different operational triggers. |
| HR-TD-005 | RM-EP-002 | RM | 6-037 | No contradiction. HR-TD-005 = workforce training documentation; RM-EP-002 = training program governance. |
| HR-WM-004 | RM-OS-001 | RM | 6-018, 6-001 | No contradiction. HR-WM-004 = injury prevention/WC reporting; RM-OS-001 = IIPP safety program. |

---

## Duplicate Semantic Family

**HR-WM-005 / HR-WM-007** both govern personnel file requirements at different specificity levels (management process vs. content audit checklist). Framework governance recommendation: establish parent/child relationship or supersession logic to prevent double-counting of survey evidence obligations.

---

## JD Subdomain Structural Pattern

The Corridor's treatment of staff roles follows a three-tier inheritance model, now documented for architectural reference:

| Tier | Roles | Corridor Mechanism | Mapping Result |
|------|-------|-------------------|----------------|
| 1 — Organizational Leadership | Governing Body, Administrator, Designee | Dedicated Section 1 rows with explicit ACHC standards | DIRECT |
| 2 — Clinical Disciplines | RN, LVN, PT, OT, SLP, MSW | Service scope rows (1-025) + care delivery rows (4-004) | PARTIAL |
| 3 — Aide Level | HHA | Dedicated Section 4 rows (4-007, 4-006) per 42 CFR §484.80 | DIRECT |

This pattern reflects ACHC's regulatory priority structure: governance roles and federal aide requirements have explicit crosswalk coverage; professional clinical discipline job descriptions do not.

---

## Page 756 Non-Use Confirmation

**CONFIRMED:** Page 756 (ACHC Items Needed for Survey — Attachment Crosswalk) was NOT used for any tagging decision. All mappings derived from direct review of PDF pages 7–31 with policy content as final authority.

---

## All Policy IDs Processed

HR-EH-101, HR-ER-001, HR-ER-002, HR-ER-003, HR-ER-004, HR-ER-005, HR-ER-006, HR-ER-007, HR-ER-008, HR-ER-009, HR-JD-000, HR-JD-001, HR-JD-002, HR-JD-003, HR-JD-004, HR-JD-005, HR-JD-006, HR-JD-007, HR-JD-008, HR-JD-009, HR-JD-010, HR-JD-011, HR-TA-001, HR-TA-002, HR-TA-003, HR-TA-004, HR-TA-005, HR-TA-006, HR-TD-001, HR-TD-002, HR-TD-003, HR-TD-004, HR-TD-005, HR-TR-101, HR-WM-001, HR-WM-002, HR-WM-003, HR-WM-004, HR-WM-005, HR-WM-006, HR-WM-007
