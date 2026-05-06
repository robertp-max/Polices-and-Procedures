# FN Domain — Manual ACHC Tagging Report
## Pass: Corridor Print Crosswalk Pages 7–31 | Surveyor: ACHC Home Health Surveyor Mode

---

## Scope

- **Domain:** FN (Finance)
- **Primary Source:** Corridor print crosswalk pages 7–31 (PDF — Section 3 financial/billing rows, Section 2 compliance rows, Section 1 administrative rows)
- **Final Authority:** Policy content
- **Page 756 Used for Tagging?** NO
- **Architectural Split Applied:** YES — includes a newly identified temporal split layer

---

## Key Architectural Finding — FN Has Three Distinct Layers

FN is structurally unlike any domain processed so far. The finance/billing domain doesn't just split between **Legacy Regulatory** and **Modern Operational Governance** — it has a third layer:

| Layer | Policies | Description |
|-------|---------|-------------|
| Legacy Regulatory Crosswalk | FN-BC-001, FN-BC-003, FN-BC-004, FN-CM-003 | Core Medicare billing compliance — explicit Corridor rows with CoP citations |
| Post-Corridor Payment Model | FN-BC-005, FN-BC-006, FN-CM-001, FN-CM-004, FN-CM-005 | PDGM, LUPA, RAP, PCR — CMS payment model reforms 2019–2020+ |
| Modern Operational Finance | FN-BC-002, FN-BC-007, FN-FP-001–007 | Revenue cycle governance, financial planning, charge management |

**The Post-Corridor Payment Model layer is new.** Unlike the "Modern Operational Governance" tag used in previous domains (which describes internal governance without regulatory anchoring), post-Corridor payment model policies **have real regulatory anchors** but those regulations were promulgated after or simultaneously with the Corridor crosswalk's print date. This is a **temporal gap** in the Corridor, not an ontological gap.

This distinction matters for survey defensibility: PDGM policies are surveyed under Medicare CoP, but the Corridor's billing rows were written for a pre-PDGM world. The agency's policies are regulatory-compliant; the Corridor tagging is incomplete because the Corridor hasn't caught up.

---

## Validation Totals

| Metric | Count |
|--------|-------|
| Total FN policies reviewed | 19 |
| Mapped — DIRECT | 4 |
| Mapped — PARTIAL | 11 |
| Unmapped — NONE | 4 |
| Post-Corridor PDGM flags | 5 policies |
| Cross-domain overlap flags | 3 |
| Duplicate semantic family flags | 1 (FN-FP-006 / OP-SL-004) |

---

## FN Policies by Subdomain

### BC — Billing & Claims (7 policies)

| Policy ID | Title | Corridor Row(s) | Type | Notes |
|-----------|-------|----------------|------|-------|
| FN-BC-001 | Medicare Billing & Claims Submission | 3-002 (Billing/Claims) | DIRECT | Core billing compliance row |
| FN-BC-002 | Claims Denial Management & Appeals | 3-002 | PARTIAL | Billing row is parent; denial analytics operational |
| FN-BC-003 | Patient Billing & Financial Responsibility | 3-001 (Financial Assessment) | DIRECT | ABN, patient financial responsibility — exact match |
| FN-BC-004 | Overpayment Identification & Refund | 2-041 (Compliance Plan) | DIRECT | 60-day rule under compliance program |
| FN-BC-005 | Pre-Claim Review Compliance | 3-002 | PARTIAL | PCR is demonstration program — post-Corridor/jurisdictional |
| FN-BC-006 | RAP Management | 3-002 | PARTIAL | RAP/PDGM phase-in — post-Corridor payment model |
| FN-BC-007 | Payment & Reimbursement Reconciliation | 3-002 | PARTIAL | Billing accuracy implied; reconciliation ops beyond |

### CM — Coding Management (5 policies)

| Policy ID | Title | Corridor Row(s) | Type | Notes |
|-----------|-------|----------------|------|-------|
| FN-CM-001 | PDGM Classification & Coding Accuracy | 3-002 | PARTIAL | PDGM post-2019 — temporal Corridor gap |
| FN-CM-002 | ICD-10 Coding Standards & Accuracy | 3-002; 4-047 | PARTIAL | Coding accuracy covered; coding program ops beyond |
| FN-CM-003 | Medical Necessity Documentation | 3-002; 4-047 | DIRECT | Core CoP requirement — exact match |
| FN-CM-004 | Episode Management & Authorization | 3-002 | PARTIAL | Certification obligation covered; PDGM episode ops beyond |
| FN-CM-005 | LUPA Prevention & Monitoring | — | NONE | Pure PDGM metric — no Corridor row, no pre-2020 equivalent |

### FP — Financial Planning (7 policies)

| Policy ID | Title | Corridor Row(s) | Type | Notes |
|-----------|-------|----------------|------|-------|
| FN-FP-001 | Payer Contract Management | 1-018 (Managed Care Contracting) | PARTIAL | Contracting governed; contract management ops beyond |
| FN-FP-002 | Charge Capture & Fee Schedule Management | 3-002 | PARTIAL | Billing accuracy implied; charge master ops beyond |
| FN-FP-003 | Revenue Cycle Performance Monitoring | — | NONE | Modern revenue cycle KPI governance |
| FN-FP-004 | Bad Debt & Charity Care | 3-001 | PARTIAL | Financial eligibility covered; write-off governance beyond |
| FN-FP-005 | Annual Budget & Financial Planning | — | NONE | Administrative governance — no Corridor row |
| FN-FP-006 | Supply & Equipment Cost Management | — | NONE | DUP FAMILY: OP-SL-004 (different governance lens) |
| FN-FP-007 | Financial Compliance & Fraud Monitoring Controls | 2-041 (Compliance Plan) | PARTIAL | CO-FW-001/101 cross-domain; financial control layer |

---

## The Post-Corridor PDGM Payment Model Gap

Five FN policies carry the `POST_CORRIDOR_PDGM_PAYMENT_MODEL` flag:

| Policy | PDGM Element | Survey Status |
|--------|-------------|---------------|
| FN-BC-006 | RAP submission and reconciliation | Surveyable under CoP billing compliance; no dedicated Corridor row |
| FN-CM-001 | Clinical grouping, functional level, comorbidity scoring | Surveyable under coding accuracy/billing compliance; PDGM-specific rows absent from Corridor |
| FN-CM-004 | 30-day episode period management under PDGM | Surveyable under certification CoP; PDGM period structure not in Corridor |
| FN-CM-005 | LUPA threshold monitoring and prevention | Surveyable as payment model compliance; no Corridor row at all |
| FN-BC-005 | Pre-Claim Review (demo program) | Conditionally surveyable; jurisdictionally variable |

**Architectural implication:** PDGM policies should be tagged with a **`TEMPORAL_CORRIDOR_GAP`** state — they are regulatory requirements (not operational governance) that arrived after the Corridor's print reference period. These are NOT `MODERN_OPERATIONAL_GOVERNANCE_LAYER` — they are modern regulatory requirements with real CoP anchors. The gap is in the crosswalk, not in the policy.

This creates a fourth canonical mapping state:

| State | Meaning |
|-------|---------|
| DIRECT | Corridor row explicitly covers the policy content |
| PARTIAL | Corridor row is structural parent; operational implementation extends beyond |
| NONE | No regulatory anchor in Corridor pages 7–31 |
| TEMPORAL_CORRIDOR_GAP | Real regulatory anchor exists; Corridor crosswalk pre-dates the regulation |

---

## Cross-Domain Overlap Documentation

| FN Policy | Overlapping Policy | Domain | Verdict |
|-----------|------------------|--------|---------|
| FN-BC-004 | CO-FW-001 (FWA Prevention) | CO | No contradiction. CO-FW-001 = FWA program governance; FN-BC-004 = billing overpayment operational compliance. Same compliance program, different obligation layers. |
| FN-FP-007 | CO-FW-001, CO-FW-101 (FWA program) | CO | No contradiction. CO = program governance; FN = financial control layer. Implementation vs. obligation distinction preserved. |
| FN-CM-002 | CL domain clinical documentation | CL | No contradiction. CL = clinical documentation accuracy; FN-CM-002 = coding support requirements. Clinical record content vs. billing code support governance. |

---

## FN-FP-006 — Cross-Domain Duplicate Semantic Family

`FN-FP-006` (Supply & Equipment Cost Management) and `OP-SL-004` (Equipment & Supply Management) govern the same physical assets from two different organizational lenses:

| Policy | Governance Layer | Focus |
|--------|----------------|-------|
| OP-SL-004 | Operations | Procurement, maintenance, calibration, replacement |
| FN-FP-006 | Finance | Cost controls, inventory valuation, financial procurement standards |

Neither maps to a specific Corridor row with HIGH confidence. Both receive NONE. **Recommend cross-domain parent metadata** to prevent duplicate evidence obligations for equipment governance.

---

## Section 3 Billing Row Gravity Note

The Corridor's billing rows (3-001, 3-002) are used for 7 of 19 FN policies. This is architecturally appropriate — Section 3 IS the Medicare billing compliance framework. However, five of those seven uses are PARTIAL, not DIRECT, confirming that the billing rows serve as structural anchors for a much more complex operational billing program than the Corridor anticipated.

**Section 1-010 (Regulatory Compliance) was not used** for any FN policy, maintaining the discipline against gravity well catch-all mappings.

---

## Page 756 Non-Use Confirmation

**CONFIRMED:** Page 756 not used for any tagging decision.

---

## All Policy IDs Processed

FN-BC-001, FN-BC-002, FN-BC-003, FN-BC-004, FN-BC-005, FN-BC-006, FN-BC-007, FN-CM-001, FN-CM-002, FN-CM-003, FN-CM-004, FN-CM-005, FN-FP-001, FN-FP-002, FN-FP-003, FN-FP-004, FN-FP-005, FN-FP-006, FN-FP-007
