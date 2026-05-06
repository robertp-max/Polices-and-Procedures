# OP Domain — Manual ACHC Tagging Report
## Pass: Corridor Print Crosswalk Pages 7–31 | Surveyor: ACHC Home Health Surveyor Mode

---

## Scope

- **Domain:** OP (Operations)
- **Primary Source:** Corridor print crosswalk pages 7–31 (PDF read directly — primarily Sections 1 and 2)
- **Final Authority:** Policy content — if content did not match Corridor row, no tag was applied
- **Page 756 Used for Tagging?** NO
- **Architectural Split Applied:** YES
- **Over-tagging Discipline Maintained:** YES — NONE applied where no confirmed Corridor row exists, including where a CoP reference is real but the specific Corridor print row could not be confirmed

---

## Key Architectural Finding — OP Straddles the Regulatory Boundary Most Sharply

Operations is the domain where over-tagging pressure is highest. Every OP policy *feels* like it should map somewhere — it's all about patient care delivery, scheduling, intake, facility management. The temptation is to force everything into Section 1 general rows (1-014 Clinical Policies, 1-010 Regulatory Compliance).

The discipline applied here:

> **If the regulatory obligation is real but the specific Corridor print row cannot be confirmed, it maps PARTIAL. If there is no regulatory anchor at all, it maps NONE. Operational workflow governance maps NONE regardless of how survey-relevant it is.**

This preserves the "survey relevance ≠ Corridor row existence" principle established in the HR and IT passes.

---

## Validation Totals

| Metric | Count |
|--------|-------|
| Total OP policies reviewed | 20 |
| Mapped — DIRECT | 4 |
| Mapped — PARTIAL | 11 |
| Unmapped — NONE | 5 |
| Emergency Management Semantic Cluster | 3 policies (OP-FM-005, OP-SL-006, OP-SL-007) |
| Cross-domain overlap flags | 3 |
| Modern operational governance flags | 4 |

---

## OP Policies by Subdomain

### FM — Facility Management (5 policies)

| Policy ID | Title | Corridor Row(s) | Type | Notes |
|-----------|-------|----------------|------|-------|
| OP-FM-001 | Office Operations & Facility Management | 1-021 (Staff Safety) | PARTIAL | Safety component only |
| OP-FM-002 | Branch Office & Satellite Operations | 1-001 (Organizational Structure) | PARTIAL | Structure documented; ops governance beyond |
| OP-FM-003 | Vendor & Supplier Management | — | NONE | Procurement governance — no Corridor row |
| OP-FM-004 | Mail & Correspondence Management | — | NONE | Administrative — no Corridor row |
| OP-FM-005 | Emergency Operations & Business Continuity | 1-011 (Emergency Management) | DIRECT | 42 CFR §484.102 — exact match |

### IM — Intake Management (3 policies)

| Policy ID | Title | Corridor Row(s) | Type | Notes |
|-----------|-------|----------------|------|-------|
| OP-IM-001 | Referral & Intake Management | 1-004 (Referral Disclosure) | PARTIAL | Referral disclosure = row; intake workflow = operational |
| OP-IM-002 | Patient Acceptance & Admission Criteria | 1-007; 2-007 (Access/Nondiscrimination) | PARTIAL | Non-discrimination = row; clinical criteria = operational |
| OP-IM-003 | Service Area Definition & Coverage | 1-005 (Service Area) | DIRECT | Geographic service area — exact match to row |

### PA — Patient Access (5 policies)

| Policy ID | Title | Corridor Row(s) | Type | Notes |
|-----------|-------|----------------|------|-------|
| OP-PA-001 | Patient Complaint & Grievance Resolution | 1-023 (Complaint Management) | DIRECT | HH1-6A, 42 CFR §484.110(e) — exact match |
| OP-PA-002 | Patient Identification & Verification | — | NONE | Visit-level safety protocol — no Corridor row |
| OP-PA-003 | Interpreter & Language Access Services | 2-031 (Interpreter Services) | DIRECT | HH2-3A.01 — exact match |
| OP-PA-004 | Cultural Competency in Service Delivery | 2-031; 2-007 | PARTIAL | Language/non-discrimination covered; program governance beyond |
| OP-PA-005 | Patient Property & Belongings | 2-006 (Patient Rights) | PARTIAL | Right to property respect implied; visit protocols beyond |

### SL — Service Logistics (7 policies)

| Policy ID | Title | Corridor Row(s) | Type | Notes |
|-----------|-------|----------------|------|-------|
| OP-SL-001 | Scheduling & Visit Management | — | NONE | Visit scheduling ops — no Corridor row |
| OP-SL-002 | After-Hours & On-Call Services | 1-014 (Clinical P&P) | PARTIAL | CoP real; specific Corridor row unconfirmed |
| OP-SL-003 | Vehicle & Transportation Safety | — | NONE | Driver/vehicle safety — no Corridor row |
| OP-SL-004 | Equipment & Supply Management | 1-013 (Hazardous Materials) | PARTIAL | Disposal element covered; procurement/calibration beyond |
| OP-SL-005 | Communication & Documentation Systems | 2-010; 2-009 | PARTIAL | EMR/comm covered; system governance beyond |
| OP-SL-006 | Service Delivery During Public Health Emergencies | 1-011; 1-012 | PARTIAL | EP framework covers PHE; pandemic protocols beyond |
| OP-SL-007 | Inclement Weather & Hazardous Conditions | 1-011 | PARTIAL | EP framework covers weather events; visit ops beyond |

---

## Emergency Management Semantic Cluster

Three OP policies all reference Corridor rows 1-011 (Emergency Management) and 1-012 (Disaster Planning) under 42 CFR §484.102. This is a legitimate regulatory parent node, not a gravity well:

| Policy | Role in Cluster | Mapping |
|--------|----------------|---------|
| OP-FM-005 | Enterprise emergency operations and business continuity plan — the PRIMARY policy implementing 42 CFR §484.102 | DIRECT |
| OP-SL-006 | Pandemic/public health emergency clinical protocols — extends the EP framework with pathogen-specific operational requirements | PARTIAL |
| OP-SL-007 | Inclement weather and hazardous conditions protocols — extends the EP framework with visit-level weather decision criteria | PARTIAL |

**Architectural interpretation:** OP-FM-005 is the governance parent that implements the regulatory obligation (1-011/1-012). OP-SL-006 and OP-SL-007 are operational child policies — specific emergency scenario protocols that implement OP-FM-005's framework in defined circumstances. The Corridor row is the regulatory anchor; the three policies represent the enterprise EP governance hierarchy. This is inheritance behavior, not tagging drift.

**Risk:** Workflow generation may create triple-counted EP evidence obligations. Recommend: parent/child metadata linking OP-SL-006 and OP-SL-007 to OP-FM-005 as the primary EP program document.

---

## NONE Policies — Consolidated Rationale

| Policy ID | Title | Reason |
|-----------|-------|--------|
| OP-FM-003 | Vendor & Supplier Management | General procurement governance — no ACHC/CoP crosswalk row (2-033 Business Associates covers only PHI vendors, already mapped in CO and IT domains) |
| OP-FM-004 | Mail & Correspondence Management | Administrative operations — no regulatory anchor |
| OP-PA-002 | Patient Identification & Verification | Visit-level safety protocol — no Corridor row; distinct from HIPAA patient ID (privacy domain) |
| OP-SL-001 | Scheduling & Visit Management | Visit scheduling operations — no Corridor row; visit frequency requirements are embedded in clinical protocol rows, not scheduling governance |
| OP-SL-003 | Vehicle & Transportation Safety | Driver/vehicle safety — no ACHC or CoP crosswalk row; overlaps with general OSHA/RM governance |

---

## Important Discipline Applied — OP-SL-002 (After-Hours & On-Call)

This policy explicitly cites CMS CoP and the 24/7 availability requirement is a real regulatory obligation. However, a specific Corridor print row for on-call services could not be confirmed from reading pages 7–31. Rather than:
- Mapping to 1-010 (Regulatory Compliance) as a "catch-all" gravity well, OR
- Mapping to 1-014 (Clinical Policies) as a "clinical umbrella" gravity well

The decision was to tag PARTIAL to 1-014 with MEDIUM confidence, explicitly noting that the specific Corridor row was not confirmed. This preserves honesty about the mapping source rather than forcing alignment through gravity well rows.

**Survey defensibility note:** ACHC surveyors WILL evaluate on-call coverage. The absence of a confirmed Corridor row means the evidence artifacts are critical — the on-call schedule, call logs, and protocol documentation must be survey-ready regardless of crosswalk mapping.

---

## Cross-Domain Overlap Documentation

| OP Policy | Overlapping Policy | Domain | Verdict |
|-----------|------------------|--------|---------|
| OP-SL-005 | IT-SA-001 (EHR System Management) | IT | No contradiction. IT-SA-001 = IT system administration; OP-SL-005 = clinical communication requirements. Same systems, different governance layers (IT admin vs. clinical operations). |
| OP-PA-004 | HR-TD-001 / HR-TD-003 (workforce training) | HR | No contradiction. HR governs training delivery; OP-PA-004 governs cultural competency standards in service delivery. Training obligation vs. clinical practice standard. |
| OP-SL-006 | RM-EP-002 (EP Program) | RM | No contradiction. RM-EP-002 = enterprise risk governance of the EP program; OP-SL-006 = clinical service delivery during PHE. Same regulatory framework, different operational lenses. |

---

## Gravity Well — Section 1 Administrative Row Risk

Section 1 general rows attract high pressure in the OP domain:
- 1-014 (Clinical Policies) — used once (OP-SL-002 PARTIAL, with MEDIUM confidence caution)
- 1-010 (Regulatory Compliance) — NOT used for OP tagging
- 1-001 (Organizational Structure) — used once (OP-FM-002 PARTIAL, defensible)

The discipline of NOT defaulting to 1-010 for every operationally relevant policy is critical. In this domain, 1-010 would have been the easy choice for OP-FM-003 (vendors are "regulatory compliance"), OP-SL-001 (scheduling is "regulatory compliance"), and OP-SL-003 (vehicle safety is "regulatory compliance"). Each received NONE because the content does not match any specific 1-010 crosswalk row element.

---

## Page 756 Non-Use Confirmation

**CONFIRMED:** Page 756 not used for any tagging decision.

---

## All Policy IDs Processed

OP-FM-001, OP-FM-002, OP-FM-003, OP-FM-004, OP-FM-005, OP-IM-001, OP-IM-002, OP-IM-003, OP-PA-001, OP-PA-002, OP-PA-003, OP-PA-004, OP-PA-005, OP-SL-001, OP-SL-002, OP-SL-003, OP-SL-004, OP-SL-005, OP-SL-006, OP-SL-007
