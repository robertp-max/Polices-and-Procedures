# IT Domain — Manual ACHC Tagging Report
## Pass: Corridor Print Crosswalk Pages 7–31 | Surveyor: ACHC Home Health Surveyor Mode

---

## Scope

- **Domain:** IT (Information Technology)
- **Primary Source:** Corridor print crosswalk pages 7–31 (PDF read directly — primarily Section 2, rows 44–63)
- **Final Authority:** Policy content — if content did not match Corridor row, no tag was applied
- **Page 756 Used for Tagging?** NO
- **Architectural Split Applied:** YES

---

## Key Architectural Finding — IT Is Unique

IT is the only operational domain that has **dedicated HIPAA Security Rule crosswalk rows in the Corridor** (Section 2, rows 2-045 through 2-062 — the HIPAA Security Rule administrative, physical, and technical safeguard rows). This makes IT fundamentally different from HR, RM, and CO: the legacy regulatory layer actually covers core IT security functions.

The result is IT's distinctively high DIRECT mapping rate (40%) relative to other operational domains.

**However:** Modern cybersecurity, cloud governance, network engineering, change management, and BYOD management have all evolved substantially beyond the 2025 Corridor's HIPAA-anchored framework, creating a clear boundary between:
- **Legacy HIPAA Security Rule crosswalk rows** (2-045 to 2-062) → DIRECT and PARTIAL
- **Modern IT operational governance** (cloud, change management, software licensing) → NONE

---

## Validation Totals

| Metric | Count |
|--------|-------|
| Total IT policies reviewed | 20 |
| Mapped — DIRECT | 8 |
| Mapped — PARTIAL | 10 |
| Unmapped — NONE | 2 |
| Duplicate semantic family flags | 1 pair (IT-DR-001 / IT-DR-002) |
| Modern operational overlay flags | 3 (IT-DR-004, IT-SA-002, IT-SA-003) |
| Novel corridor observation | 1 (IT-UP-003 → row with no ACHC standard cited) |
| HIPAA Security Rule gravity well (HH5-1B) | 17/20 policies — architecturally appropriate |

---

## HIPAA Security Rule Gravity Well — HH5-1B

**HH5-1B appears in 17 of 20 IT policies.** This is the most concentrated ACHC standard in any domain — and it is architecturally correct.

ACHC maps the entire HIPAA Security Rule to a single standard designation (HH5-1B), which spans:
- Administrative Safeguards (2-048 through 2-054)
- Physical Safeguards (2-055 through 2-057)
- Technical Safeguards (2-058 through 2-062)

Every HIPAA Security Rule row (2-045 to 2-062) carries HH5-1B. Unlike organizational gravity wells (2-041, 1-010) where a single row is reused across different policy categories, HH5-1B represents a monolithic regulatory standard that ACHC has chosen not to subdivide. The concentration is not a tagging error — it reflects the structure of the Corridor crosswalk itself.

**Mitigation available:** The specific Corridor row (2-048, 2-051, 2-052, etc.) provides the necessary differentiation even when the ACHC standard is identical across rows.

---

## Section 2 HIPAA Security Rule Row Index (Rows Used in IT Domain)

| Row | Policy/Procedure | Evidence | ACHC | Used For |
|-----|-----------------|----------|------|---------|
| 2-045 | Security of PHI | P, D | HH5-1B | IT-SC-001 (PARTIAL), IT-SC-006 (PARTIAL) |
| 2-048 | Security Management Process | P, D | HH5-1B | IT-SC-001 (PARTIAL), IT-SC-004 (PARTIAL) |
| 2-050 | Information Access Management | P, D | HH5-1B | IT-SC-002 (DIRECT) |
| 2-051 | Security Awareness and Training | P, D | HH5-1B | IT-UP-004 (DIRECT) |
| 2-052 | Security Incident Procedures | P, D | HH5-1B | IT-DR-005 (DIRECT) |
| 2-053 | Contingency Plan | P, D | HH5-1B | IT-DR-001 (DIRECT), IT-DR-002 (DIRECT), IT-DR-004 (PARTIAL) |
| 2-055 | Facility Access Controls | P, D | HH5-1B | IT-SA-005 (DIRECT) |
| 2-056 | Workstation Use and Security | P, D | HH5-1B | IT-SA-005 (DIRECT), IT-SC-005 (PARTIAL), IT-UP-002 (PARTIAL) |
| 2-057 | Device and Media Controls | P, D | HH5-1B | IT-DR-004 (PARTIAL), IT-SC-006 (PARTIAL), IT-UP-001 (PARTIAL) |
| 2-058 | Access Controls: Technical Safeguards | P, D | HH5-1B | IT-SC-002 (DIRECT), IT-SC-004 (PARTIAL) |
| 2-059 | HIPAA Security Audit Controls | P, D | HH5-1B | IT-DR-003 (DIRECT) |
| 2-060 | Integrity Controls | P, D | HH5-1B | IT-DR-003 (DIRECT), IT-SC-003 (DIRECT), IT-SA-001 (PARTIAL) |
| 2-061 | Person or Entity Authentication | P, D | HH5-1B | IT-SC-002 (DIRECT) |
| 2-062 | Transmission Security | P, D | HH5-1B | IT-SC-003 (DIRECT) |

**Additional non-HIPAA rows used:**
- 2-010: Interface of Patient Data and Management Systems (HH2-5A) → IT-SA-001
- 2-033: Business Associates (HH2-5C.01) → IT-SA-004
- 2-044: Social Media (no ACHC standard) → IT-UP-003

---

## IT Policies by Subdomain

### DR — Disaster Recovery (5 policies)

| Policy ID | Title | Corridor Row(s) | Type | Notes |
|-----------|-------|----------------|------|-------|
| IT-DR-001 | Data Backup & Recovery | 2-053 Contingency Plan | DIRECT | DUP FAMILY: IT-DR-002 |
| IT-DR-002 | Disaster Recovery & IT Continuity | 2-053 Contingency Plan | DIRECT | DUP FAMILY: IT-DR-001 |
| IT-DR-003 | Audit Log Management & Monitoring | 2-059 HIPAA Security Audit Controls | DIRECT | — |
| IT-DR-004 | Cloud Services & Data Storage | 2-053; 2-057 | PARTIAL | MODERN overlay |
| IT-DR-005 | Security Incident Response | 2-052 Security Incident Procedures | DIRECT | — |

**IT-DR-001 / IT-DR-002 duplicate semantic family:** Both map to 2-053 (HIPAA Contingency Plan) as required sub-components (data backup plan + disaster recovery plan). ACHC surveyors evaluate these together. Framework governance should establish a parent HIPAA Contingency Plan relationship to prevent workflow double-counting.

### SA — System Administration (5 policies)

| Policy ID | Title | Corridor Row(s) | Type | Layer |
|-----------|-------|----------------|------|-------|
| IT-SA-001 | Electronic Health Record System Management | 2-010; 2-060 | PARTIAL | Legacy/Partial |
| IT-SA-002 | Software Acquisition & License Management | — | NONE | Modern Gov |
| IT-SA-003 | System Change Management | — | NONE | Modern Gov |
| IT-SA-004 | Vendor & Third-Party Security Assessment | 2-033 Business Associates | PARTIAL | Legacy/Partial |
| IT-SA-005 | Physical Security of IT Assets | 2-055; 2-056 | DIRECT | Legacy |

**IT-SA-003 rationale:** While the HIPAA Evaluation row (2-054) requires periodic security control evaluation, IT change management — change advisory boards, change request approvals, testing gates, and rollback procedures — is an ITIL governance discipline. Forcing this to 2-054 would collapse change management governance into security evaluation, which are categorically different processes.

### SC — Security Controls (6 policies)

| Policy ID | Title | Corridor Row(s) | Type |
|-----------|-------|----------------|------|
| IT-SC-001 | Information Security Program | 2-048; 2-045 | PARTIAL |
| IT-SC-002 | Access Control & User Authentication | 2-058; 2-050; 2-061 | DIRECT |
| IT-SC-003 | Data Encryption Standards | 2-062; 2-060 | DIRECT |
| IT-SC-004 | Network Security & Firewall Management | 2-048; 2-058 | PARTIAL |
| IT-SC-005 | Endpoint Security & Malware Protection | 2-056 | PARTIAL |
| IT-SC-006 | Data Classification & Handling | 2-045; 2-057 | PARTIAL |

**IT-SC-001 rationale:** The enterprise information security program extends beyond HIPAA's PHI-specific scope to non-PHI systems, network security, third-party risk, and security engineering. 2-048 is the correct structural parent; the enterprise program exceeds it.

**IT-SC-002 note:** MFA is not in the original HIPAA Security Rule's required specifications (it was added as an addressable specification). Its inclusion in IT-SC-002 strengthens rather than contradicts the Corridor's authentication requirement — DIRECT mapping preserved.

### UP — User Policies (4 policies)

| Policy ID | Title | Corridor Row(s) | Type | Notes |
|-----------|-------|----------------|------|-------|
| IT-UP-001 | Mobile Device & BYOD Security | 2-057 Device and Media Controls | PARTIAL | BYOD is modern overlay |
| IT-UP-002 | Internet & Email Acceptable Use | 2-056 Workstation Use and Security | PARTIAL | AUP governance beyond workstation row |
| IT-UP-003 | Social Media & Public Communications | 2-044 Social Media | PARTIAL | Row has NO ACHC standard cited |
| IT-UP-004 | Security Awareness Training | 2-051 Security Awareness and Training | DIRECT | — |

---

## Novel Corridor Observation — IT-UP-003

**Corridor row 2-044 'Social Media' appears in the crosswalk without any ACHC standard, CoP, or Title 22 citation.** This is one of the only rows in pages 7–31 with no regulatory anchoring — the Corridor acknowledges social media as a required policy area without assigning a surveyable standard.

This means:
1. ACHC recognizes social media policy is required but has not mapped it to a specific standard
2. IT-UP-003 has a Corridor acknowledgment but no standard to be surveyed against
3. The mapping is flagged `NO_ACHC_STANDARD_IN_CORRIDOR_ROW`

**Implication for the platform:** This represents a fourth mapping state beyond DIRECT/PARTIAL/NONE — **ACKNOWLEDGED WITHOUT STANDARD**. The policy is recognized in the crosswalk but lacks a surveyable anchor. Future taxonomy may benefit from distinguishing this state.

---

## NONE Policies — Consolidated Rationale

| Policy ID | Title | Reason |
|-----------|-------|--------|
| IT-SA-002 | Software Acquisition & License Management | Software procurement and licensing governance is IT asset management — no ACHC/HIPAA crosswalk row |
| IT-SA-003 | System Change Management | IT change management (ITIL-based) is a governance discipline — forcing to HIPAA Evaluation row (2-054) would collapse categorically different processes |

---

## Cross-Domain Overlap Documentation

| IT Policy | Overlapping Policy | Domain | Rows | Verdict |
|-----------|------------------|--------|------|---------|
| IT-SC-001 | CO-HP-101 (HIPAA Security Rule — ePHI Safeguards) | CO | 2-045, 2-048 | No contradiction. CO-HP-101 governs HIPAA Security Rule compliance obligation; IT-SC-001 governs the enterprise security program that implements it. Same rows, different governance layers. |
| IT-SA-004 | CO-BA-101 (Business Associate & Vendor PHI Management) | CO | 2-033 | No contradiction. CO-BA-101 governs BA contractual controls; IT-SA-004 governs vendor security assessment program. Implementation layer vs. obligation layer distinction preserved. |
| IT-UP-004 | HR-TD-001 (Annual Mandatory Training) | HR | 2-051 (IT), 6-003 (HR) | No contradiction. IT-UP-004 = security-specific training; HR-TD-001 = enterprise mandatory training program. Different primary rows, overlapping workforce coverage. |

---

## Page 756 Non-Use Confirmation

**CONFIRMED:** Page 756 not used for any tagging decision.

---

## All Policy IDs Processed

IT-DR-001, IT-DR-002, IT-DR-003, IT-DR-004, IT-DR-005, IT-SA-001, IT-SA-002, IT-SA-003, IT-SA-004, IT-SA-005, IT-SC-001, IT-SC-002, IT-SC-003, IT-SC-004, IT-SC-005, IT-SC-006, IT-UP-001, IT-UP-002, IT-UP-003, IT-UP-004
