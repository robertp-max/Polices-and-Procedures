# Corridor ACHC HH P&P (12-2025) — Strengths Analysis & Implementation Strategy

**Source reviewed:** `Bin-(thrash)/CA ACHC HH PP 12-2025.docx.pdf` (extracted markdown: 1,216 lines, Sections 1–7 + Attachments).
**Author lens:** Senior healthcare compliance architect.
**Target framework:** Care Indeed Home Health P&P (existing IDs: `GV-`, `OP-`, `CL-`, `QA-`, `RM-EP-`, `RM-OS-`, `CO-`, `FN-`, `HR-`, `EN-`).
**Regulatory scope:** ACHC HH standards · Medicare CoP 42 CFR Part 484 · California Title 22 Div 5 Ch 6.

---

## PART 1 — CORRIDOR ANALYSIS

### 1.1 Document architecture

| Layer | Corridor convention | Why it matters |
|---|---|---|
| **Section** | 7 numbered sections (Org/Admin, Program Ops, HR, Clinical, QAPI, Risk/IC/Safety, Records) | Maps cleanly to ACHC chapter buckets (HH1–HH7). |
| **Policy** | `PURPOSE → POLICY → PROCEDURE` (numbered steps with A/B/C sub-letters) | Every policy is operationally executable in one read. |
| **Numbering** | `Section-Policy.Page` (e.g., `1-002.3`) | Stable cross-references survive revisions; pagination is a survey-trail anchor. |
| **Addendum** | `<PolicyNo>.A`, `.B`, `.C` (e.g., `1-002.A Governing Body Members`, `1-002.B Orientation Checklist`) | Forms/registers attached to — never separated from — the parent policy. |
| **Cross-reference** | Inline bracketed pointers (e.g., *“See ‘Conflict of Interest’ Policy No. 1-003”*) | Forces traceable links between dependent policies. |
| **Attestations** | Embedded signature block at end of policy text | Single artifact = policy + acknowledgement record. |

### 1.2 The crosswalk matrix (Corridor’s strongest survey-readiness asset)

Corridor opens each manual with a four-column matrix in front-of-book form:

| POLICY/PROCEDURE | EVIDENCE | CALIFORNIA TITLE 22 | ACHC STANDARD | MEDICARE COP |

- **Evidence codes** are explicit per policy: **P**olicy, **D**ocument, **I**nterview, **O**bservation, **S**urvey.
- Title 22 citations are at the section level (`74717`, `74721`, `74742`, plus HSC `1725`–`1728.1`, `SB 188`).
- ACHC standards are mapped at the sub-tag level (`HH1-1A`, `HH1-5A.01`, `HH7-2A.01`, `HH7-3A`–`E`, etc.).
- Medicare CoPs cite the precise §484.x reference (e.g., `484.105(a)`, `484.65(e)`, `484.70`, `484.102`).

**Why this is defensible:** A surveyor can pick *any* citation and reach a specific policy in one hop, with the evidence type pre-declared.

### 1.3 Domain organization (Corridor’s 7 sections)

1. Organization & Administration (1-001 → 1-030)
2. Program/Service Operations (Patient Bill of Rights, Admission, Grievance, Communication)
3. Human Resources / Personnel
4. Clinical / Provision of Care (Plan of Care, Assessments, Coordination)
5. Performance Improvement (QAPI)
6. **Risk Management: Infection and Safety Control** (39 sub-policies — the densest, most surveyable section: Bag Technique 6-013, Fire Safety 6-020/6-024, Equipment Mgmt 6-022/6-026, IC Plan 6-027, TB 6-028, BBP 6-029, Emergency Mgmt Plan 6-037, Waived Testing 6-038, Glucose 6-039)
7. Records / Information Management

### 1.4 What makes it survey-ready, complete, and defensible

- **Survey-ready:** Evidence code per policy tells staff exactly what to produce in a tracer (Document binder, Interview script, walk-through Observation, periodic Survey).
- **Complete:** Every standard on the ACHC checklist resolves to either a policy or an addendum form — no orphans.
- **Defensible:** Numbered procedure steps + signed addendums create a “policy-as-evidence” package; the Title 22 + CoP + ACHC triple citation removes single-regulator risk.

### 1.5 Limitations to *not* inherit

- Heavy use of `Organization’s Name` placeholders (manual customization risk).
- No native digital traceability — paper/Word workflow assumes surveyor-led discovery.
- Numbering (`1-002.3`) is page-bound; breaks when policies are restructured.
- No linkage to workflows, tasks, evidence packets, or events (which our framework already provides via `EN-WF-101`).

---

## PART 2 — IMPLEMENTATION STRATEGY

### 2.1 Guiding principles

1. **Adopt Corridor’s rigor; keep our IDs.** Our `GV-GB-001` style stays canonical; Corridor `1-002` becomes a *crosswalk attribute*, not a rename.
2. **No duplication.** Where a Corridor policy already maps 1:1 to ours, we *enrich* the existing policy with crosswalk metadata + addendum slots — we do not create a parallel doc.
3. **Forms become Addendums.** Existing `*-FM-###` forms attach to parent policies as Corridor-style `.A`, `.B` addendums in metadata; render path stays the same.
4. **Evidence codes become first-class.** Each policy gains a `evidenceTypes: ['P','D','I','O','S']` field driving the Evidence Packet system already wired through `regulatoryEvents.ts`.

### 2.2 Six-step rollout

| Step | Action | Artifact | Owner |
|---|---|---|---|
| 1 | **Map** Corridor `Section-Policy.Page` → our domain ID. Build a single cross-walk CSV. | `Builder/Policies/corridor_crosswalk.csv` | Compliance Architect |
| 2 | **Gap-flag** every Corridor policy with no equivalent → categorize as `MISSING / PARTIAL / COVERED / SUPERSEDED`. | Gap report (extends `Builder/Policies/diagnose_coverage.py`) | QA |
| 3 | **Enrich** each existing policy in `allPoliciesContent.generated.ts` with three new fields: `evidenceTypes`, `crosswalk: { title22, achc, cop }`, `addendums: [{id,label,formId}]`. Source-of-truth: per-policy markdown in `Builder/Policies/extracted_full/`. | Generator update in `generate_from_extracted.py` | Eng |
| 4 | **Author-fill** only the `MISSING / PARTIAL` entries — write *new sections* into existing policy markdown files (do not create new policy IDs unless the gap is a true new topic, e.g., Bag Technique, Waived Testing). | Per-policy `.md` patches | Clinical SMEs |
| 5 | **Bind addendums.** Forms in `*-FM-*` get an `parentPolicyId` and Corridor letter (`addendumKey: 'A' | 'B' | …`); rendered as a sub-tab under the policy. | Forms registry update | Eng |
| 6 | **Verify** with a survey rehearsal: pick 10 random ACHC tags, confirm one-hop traversal from tag → policy → addendum → evidence record. | Audit log | Compliance |

### 2.3 Anti-patterns we will not commit

- ❌ Renaming `GV-GB-001` to `1-002` to “match Corridor.”
- ❌ Splitting a single policy across multiple new IDs to mirror Corridor pagination.
- ❌ Creating standalone “crosswalk policies” — the crosswalk lives as metadata on each policy.
- ❌ Rewriting policies that already meet ACHC; we patch only deltas.
- ❌ Detaching forms from policies; every form must declare a `parentPolicyId`.

### 2.4 Audit defensibility preservation

- All edits flow through `EN-WF-101 Policy Execution, Workflow Enforcement & Evidence Traceability` — change events are auto-logged.
- `regulatoryEvents.ts` already drives Evidence Packets; new `crosswalk` metadata feeds the surveyor view at `/compliance/master-controls`.
- Every `MISSING → COVERED` transition produces an `EVT-POL-CHG` event with a before/after diff persisted to the evidence ledger.

---

## PART 3 — DOMAIN FRAMEWORK (10 domains)

| # | Domain | Our prefix | ACHC chapter | Title 22 anchor | Medicare CoP anchor |
|---|---|---|---|---|---|
| 1 | Governance / Administration | `GV-` | HH1 | 74717, 74721, 74742, SB 188 | 484.105(a)(b)(h), 484.65(e), 484.100 |
| 2 | Program Operations | `OP-` | HH2 | 74693, 74695, 74701 | 484.50, 484.55, 484.75 |
| 3 | Clinical / Provision of Care | `CL-` | HH5 | 74723, 74731 | 484.55, 484.60, 484.80 |
| 4 | QAPI | `QA-` | HH6 | 74721, 74743 | 484.65 |
| 5 | Infection Control | `RM-IC-` | HH7-1, HH7-2 | 74723, 74725 | 484.70, 29 CFR 1910.1030 |
| 6 | Safety / Environment of Care | `RM-OS-` | HH7-2, HH7-5, HH7-6 | 74693 | 484.70, USP 800 |
| 7 | Emergency Preparedness | `RM-EP-` | HH7-3 (A–E) | 74721 | 484.102 |
| 8 | Medication Management | `RM-MM-` *(new)* | HH4-2, HH4-6 | 74693 | 484.60(a)(2)(iii), 484.55(c)(5) |
| 9 | Patient Rights / Compliance | `CO-PR-` | HH2-2, HH2-5 | 74701, 74743 | 484.50, 484.110 |
| 10 | Financial / Billing | `FN-` | HH1-9, HH2-2 | 74743, HSC 1727.5 | 484.50(c)(7), 42 CFR Part 420 Subpart C |

### 3.1 What “full alignment” looks like, by domain

| Domain | Alignment criteria | Common gaps to expect |
|---|---|---|
| **GV** | Governing Body charter, COI signed annually, PAC quarterly minutes, organizational chart current | Missing PAC minutes; no annual COI re-attestation |
| **OP** | Patient Bill of Rights given pre-care, signed receipt; admission criteria objective; complaint log with closure dates | Verbal-only intake; grievance closure SLA undefined |
| **CL** | Initial assessment ≤48h post-SOC; comprehensive ≤5d; care plan reviewed q60d or per visit per §484.60 | Coordination notes scattered; missing physician verbal-order readback |
| **QAPI** | Written QAPI plan, board-approved indicators, PIP charter, quarterly dashboard | Indicators tracked but no PIP closed-loop |
| **IC** | IC plan, TB exposure plan, BBP plan, Bag Technique, infection log (patient + personnel) | Bag Technique not observed; personnel infection log missing |
| **Safety** | Office + patient fire/equipment/utilities mgmt, Safe Medical Device Act log, vehicle accident reports | Extinguisher inspection log absent; SMDA log not maintained |
| **EP** | All-hazards plan w/ HVA, communication plan, training, 2 exercises/yr (1 full-scale or community-integrated) | Tabletop substitution not justified; after-action reports missing |
| **MM** | Med profile reconciliation each visit, high-alert med list, narcotic disposal log, self-admin teach-back | No teach-back documentation; PRN reassessment intervals undefined |
| **PR** | Posted rights, advance directive offer, grievance, non-discrimination, language access | Notice-of-rights signature missing; grievance acknowledgement >5d |
| **FN** | Annual Medicare cost report, ABN/HHCCN/expedited notices issued correctly, billing audit | ABN form version outdated; HHCCN not issued for plan changes |

---

## PART 4 — SAMPLE ALIGNED POLICIES (10)

> Format mirrors Corridor (`PURPOSE / POLICY / PROCEDURE`) but uses our IDs and embeds **Crosswalk** + **Evidence** + **Addendums** as Corridor does. Every step is real, specific, and survey-defensible. Each ends with the cross-references and form bindings our generator can ingest.

---

### Sample 1 · `GV-GB-001` Governing Body Authority & Responsibilities  *(Domain 1 — Governance/Administration)*

**Crosswalk:** ACHC HH1-1A, HH1-1B, HH1-2A, HH1-2A.03, HH1-5A.01 · CoP §484.105(a)(h), §484.65(e) · Title 22 §74717, §74721, §74742, SB 188
**Evidence:** **P, D, I**

**PURPOSE**
To define the legal authority, composition, and accountability of the Governing Body (GB) for Care Indeed Home Health Care, Inc., and to ensure ongoing oversight of QAPI, fiscal solvency, regulatory compliance, and the patient-safety program.

**POLICY**
The GB holds full and non-delegable legal authority for the operation of the agency. The GB approves the annual budget, the QAPI plan, the Compliance Program, and the appointment of the Administrator and the Clinical Manager. The GB meets at least quarterly and reviews its bylaws every 36 months.

**PROCEDURE**
1. **Composition.** No fewer than five voting members, at least one of whom is independent (no financial interest in the agency). Members are seated for staggered 3-year terms documented on Addendum `GV-GB-001.A` (*Governing Body Roster*).
2. **Officer appointments.** Within 30 days of seating, the GB appoints an Administrator (§484.105(b)) and a Clinical Manager (§484.105(c)). Successors are pre-designated to ensure no operational gap exceeds 24 hours.
3. **Quarterly oversight cycle.** Each meeting agenda includes: (a) QAPI dashboard, (b) compliance/HIPAA report, (c) financial statements, (d) personnel changes, (e) PI/PIP status, (f) incident & infection trends. Minutes are retained ≥5 years.
4. **QAPI accountability.** Per §484.65(e), the GB ensures the QAPI program is data-driven, addresses all services, and that performance-improvement projects are chartered, resourced, and closed with measurable results. The Q-dashboard is reviewed against thresholds documented in `QA-FM-020`.
5. **Annual reaffirmations.** Each member signs the COI attestation (`CO-FM-003`) and the HIPAA confidentiality agreement annually; orientation completion is recorded on `GV-GB-001.B` (*Governing Body Orientation Checklist*).
6. **Bylaws & legal documents** are reviewed at least every 36 months; the review date and motion are recorded in minutes.
7. **Patient-safety oversight.** The GB receives a quarterly incident summary, root-cause findings, and remediation status (see `RM-OS-002 Incident Reporting & RCA`).
8. **Closure / branch contingency.** Per §484.100(b), the GB pre-approves the contingency plan if the agency closes (`RM-EP-001` Addendum C) and reviews it annually.

**Cross-references:** `CO-CA-001` Corporate Compliance · `QA-VBP-101` HHVBP · `RM-EP-001` Emergency Preparedness · `EN-WF-101` Policy Execution Workflow.
**Addendums:** `GV-GB-001.A` Roster · `GV-GB-001.B` Orientation Checklist · `GV-GB-001.C` Annual Performance Review of Administrator.

---

### Sample 2 · `OP-AD-001` Admission Criteria, Patient Rights Notice & Informed Consent  *(Domain 2 — Program Operations)*

**Crosswalk:** ACHC HH2-1A.01, HH2-2A, HH2-5A · CoP §484.50(a)–(c), §484.55(a), §484.60(a) · Title 22 §74693, §74701
**Evidence:** **P, D, I, O**

**PURPOSE**
To ensure every admission is clinically appropriate, payer-verified, consented, and accompanied by the federally required Notice of Patient Rights and Home Health Notice prior to the start of care.

**POLICY**
The agency admits only patients whose care needs can be safely met in the home setting and who reside within the licensed service area. The Notice of Rights, Privacy Notice (HIPAA), and the OASIS Privacy Notice are delivered, explained, and signed prior to or at the initial assessment visit. Informed consent for treatment is obtained and re-obtained whenever the plan of care materially changes.

**PROCEDURE**
1. **Referral intake.** RN intake coordinator verifies: physician/allowed-practitioner order, face-to-face encounter ≤90d prior or ≤30d after SOC (§484.55(a)(2)), homebound status, payer authorization. Documented on `OP-FM-002`.
2. **Service-area & safety screen.** Address geocoded against licensed branch service area; environmental hazards screened (firearms, animals, hostile occupants) per `RM-OS-003`. If unsafe, intake is escalated to Clinical Manager before SOC.
3. **Notice of Rights delivery.** Prior to the initial assessment, the admitting clinician delivers — verbally and in writing, in the patient’s primary language — the Patient Rights Notice (`OP-FM-005`), the OASIS Privacy Notice, and the agency contact card with the State Hotline 1-800-228-1363 and the ACHC complaint line. Receipt signed on `OP-FM-005-A`.
4. **Informed consent.** Patient or legal representative signs `OP-FM-006`. The consent specifically authorizes: (a) provision of skilled services, (b) photographing wounds for the chart, (c) coordination with physician and DME, (d) transfer of PHI to payer.
5. **Advance directives.** Patient asked at admission and on each recertification; preference and any AD documents scanned into chart. Triggers `CL-AD-002`.
6. **Financial responsibility.** ABN (`FN-FM-010`), HHCCN (`FN-FM-011`), and payer cost-share notice issued and signed at SOC; re-issued whenever the POC reduces or terminates services.
7. **Acceptance / non-acceptance decision.** Documented within 48h with rationale; non-accepted patients receive written referral options (no “patient dumping”).
8. **Audit.** QAPI samples 10% of admissions monthly for chart audit (`QA-FM-025`); deficiencies feed PI dashboard.

**Cross-references:** `CL-OA-101` OASIS · `FN-BC-001` Billing · `CO-PR-001` Patient Rights · `RM-OS-003` Personnel Safety on Visits.
**Addendums:** `OP-AD-001.A` Admission Decision Worksheet · `OP-AD-001.B` Notice of Rights Acknowledgment · `OP-AD-001.C` Non-Acceptance Letter Template.

---

### Sample 3 · `CL-PC-001` Plan of Care, Coordination & Care Conference  *(Domain 3 — Clinical/Provision of Care)*

**Crosswalk:** ACHC HH5-2C.01, HH5-2C.02, HH5-11A, HH5-11F · CoP §484.60(a)(b)(c), §484.55(c) · Title 22 §74723, §74731
**Evidence:** **P, D, I, O**

**PURPOSE**
To establish the development, communication, execution, and revision of the individualized, physician-ordered Plan of Care (POC) and to ensure continuous interdisciplinary care coordination.

**POLICY**
A POC is established by the Clinical Manager (or qualified RN designee) in consultation with the certifying practitioner before services begin. The POC is reviewed and signed by the certifying practitioner at least every 60 days, after every hospitalization, and whenever the patient’s condition warrants change.

**PROCEDURE**
1. **Comprehensive assessment** completed within 5 calendar days of SOC and within 48h for skilled visits (§484.55). RN documents OASIS, fall risk (Morse), pressure-injury risk (Braden), depression (PHQ-2), pain (0–10), nutrition, immunization status, and medication reconciliation.
2. **POC content** (§484.60(a)) minimally includes: all pertinent diagnoses, mental/cognitive status, services & disciplines, frequency/duration, prognosis, functional limitations, activities permitted, nutritional/medication orders, treatments, safety measures, discharge plan, identification of patient-specific risks and interventions to address each.
3. **Verbal orders** received by RN are read back, dated, timed, signed, and faxed/sent for practitioner counter-signature within 72h. Logged in `CL-FM-002`.
4. **Care coordination.** Inter-disciplinary case conference at least every 14 days for active patients with ≥2 disciplines, and after every transition (hospital → home, ED visit). Coordination note in chart per `CL-CC-101`.
5. **POC revision** is required whenever (a) measurable goals are met or modified, (b) new diagnosis appears, (c) hospitalization, (d) DME change, (e) medication change. Re-signed by certifying practitioner.
6. **Patient/caregiver involvement.** Patient written copy of the POC at SOC and at each material revision; teach-back documented.
7. **Recertification.** Within the last 5 days of each 60-day episode, the case manager completes the comprehensive update, OASIS reassessment, and the practitioner-signed recertification.
8. **Discharge/transfer.** Summary sent to receiving provider within 2 business days of discharge, including last set of vitals, medications, pending labs, advance directives, and outstanding orders.

**Cross-references:** `CL-OA-101` OASIS · `CL-DC-101` Documentation Integrity · `CL-CC-101` Care Coordination & SDOH · `RM-MM-001` Medication Management.
**Addendums:** `CL-PC-001.A` POC Template (485-equivalent) · `CL-PC-001.B` Verbal Order Log · `CL-PC-001.C` Inter-disciplinary Case Conference Note.

---

### Sample 4 · `QA-PI-001` QAPI Program — Indicators, PIPs & Governance Reporting  *(Domain 4 — QAPI)*

**Crosswalk:** ACHC HH6-1A, HH6-2A, HH6-3A · CoP §484.65(a)–(e) · Title 22 §74721, §74743
**Evidence:** **P, D, I, S**

**PURPOSE**
To define a data-driven, agency-wide Quality Assessment & Performance Improvement program that measures, analyzes, and improves outcomes, reduces adverse events, and demonstrates board-level accountability.

**POLICY**
The agency maintains an ongoing, comprehensive, written QAPI program approved annually by the Governing Body. The program addresses the full range of services and uses indicators that include — at minimum — the CMS Star measures, HHVBP cohort measures, infection rates, hospitalization rates, complaint rates, and medication-error rates.

**PROCEDURE**
1. **Indicator panel.** Approved annually; minimum panel: Acute Care Hospitalization, ED Use, Improvement in Ambulation, Improvement in Bathing, TNC-M (Total Normalized Composite), HHCAHPS top-box, infection rate (per 1,000 visit-days), medication-error rate, complaint rate, fall rate.
2. **Data collection** via the EHR/OASIS export, incident system (`RM-OS-002`), HHCAHPS vendor, and chart audits (`QA-FM-025`). Frequency: monthly minimum.
3. **Threshold setting.** Each indicator has an internal benchmark (rolling 4-quarter mean) and an external benchmark (state median or HHVBP cohort).
4. **PIP charters** (§484.65(d)) — at least one PIP active at all times, focused on a high-volume/high-risk problem. Charter on `QA-FM-021` includes: problem statement, baseline, aim, interventions (PDSA), measure, owner, board sponsor, end-date.
5. **Monthly QAPI Committee** reviews dashboard; minutes on `QA-FM-024`. Standing membership: Administrator, Clinical Manager, QAPI Lead, IPC Lead, two field clinicians, one PAC member.
6. **Quarterly Governing Body report** (`QA-FM-023`) — status of each PIP, indicator trends, sentinel events, infection trends, complaints with closure status. Board action recorded.
7. **Sentinel-event response.** Within 24h of identification, an RCA is initiated (`RM-OS-002.B`); 30-day action plan presented to QAPI; closure verified at 90 days.
8. **Annual program evaluation** of the QAPI plan itself: were aims met, were resources adequate, what is next year’s focus. Approved by GB and dated.

**Cross-references:** `RM-OS-002` Incident/RCA · `QA-VBP-101` HHVBP · `GV-GB-001` Governing Body.
**Addendums:** `QA-PI-001.A` QAPI Plan (current year) · `QA-PI-001.B` Indicator Definitions & Numerator/Denominator · `QA-PI-001.C` PIP Charter Template.

---

### Sample 5 · `RM-IC-001` Infection Prevention & Control Program (incl. Bag Technique)  *(Domain 5 — Infection Control)*

**Crosswalk:** ACHC HH7-1A, HH7-1D.01, HH7-2A.01, HH7-2B.01 · CoP §484.70(a)(b)(c) · Title 22 §74723, §74725 · 29 CFR 1910.1030 · CDC Standard & Transmission-based Precautions
**Evidence:** **P, D, I, O**

**PURPOSE**
To establish an active, agency-wide infection prevention and control (IPC) program that protects patients, personnel, and the community from health-care-associated infections in the home setting.

**POLICY**
The agency maintains a written IPC program directed by a designated qualified IPC Lead. The program adheres to CDC standard precautions, transmission-based precautions, and the **bag technique** for any nursing bag taken into a patient home. Surveillance covers patients and personnel; outbreaks are reported to the local health department and ACHC.

**PROCEDURE**
1. **IPC Plan & annual risk assessment** documented on `RM-IC-001.A`. Risk assessment uses local epidemiology (e.g., respiratory virus season, county TB rate), patient acuity mix, and aggregated incident data.
2. **Standard precautions.** Hand hygiene (alcohol-based rub or soap/water) at the **5 WHO Moments**, PPE selection per task, sharps safety per BBP plan (`RM-IC-002`), respiratory hygiene.
3. **Bag Technique** (HH7-1A — observable on visit):
   a. Place bag on a clean, dry, hard surface — never on the floor, bed, or upholstered furniture; use a barrier (paper towel/chux) under the bag.
   b. Perform hand hygiene **before** opening the bag and **before** retrieving any item.
   c. Remove all anticipated supplies before patient contact; close the bag during patient care.
   d. Disinfect any item that contacted the patient with hospital-grade disinfectant before returning it to the bag; single-use items are not returned.
   e. Perform hand hygiene before closing the bag.
   f. Decontaminate the exterior of the bag at least weekly and any time of visible soil. Logged on `RM-IC-001.B` *Bag Technique Cleaning Log*.
   g. Stethoscopes and BP cuffs are disinfected between patients (alcohol-based wipe ≥30s contact).
4. **Transmission-based precautions.** Patient-specific signage at the home entry is not required; clinician dons PPE per pathogen — N95 + eye protection for suspected/confirmed airborne; surgical mask + gloves + gown for droplet/contact.
5. **TB exposure plan** (`RM-IC-003`) — annual baseline TB risk assessment for all personnel; symptom screen + IGRA per role-based risk; conversion → 30-day clinical evaluation.
6. **BBP exposure plan** (`RM-IC-002`) — Hep B vaccine offered free to at-risk personnel, declination signed; post-exposure source/exposed testing within 2h of incident.
7. **Surveillance.** Patient infection log (`RM-IC-001.C`) and personnel infection log (`RM-IC-001.D`) maintained; numerator/denominator computed monthly; trends reviewed by QAPI.
8. **Reportable diseases** reported to the local health department per CDPH list within mandated timeframe; ACHC notified for outbreaks per accreditation manual.
9. **Education.** All personnel complete IPC + bag technique training at hire and annually; competency verified by direct observation on a home visit (`RM-IC-001.E`).

**Cross-references:** `RM-IC-002` BBP · `RM-IC-003` TB · `QA-PI-001` QAPI · `HR-OR-001` Personnel Health.
**Addendums:** `RM-IC-001.A` IPC Plan & Annual Risk Assessment · `.B` Bag Cleaning Log · `.C` Patient Infection Log · `.D` Personnel Infection Log · `.E` Bag Technique Competency Checklist.

---

### Sample 6 · `RM-OS-001` Environment of Care, Fire Safety & Equipment Management  *(Domain 6 — Safety/EOC)*

**Crosswalk:** ACHC HH7-2A.01, HH7-2B.01, HH7-5A.01, HH7-6A.01, HH7-6B.01 · CoP §484.70 · NFPA 10 (extinguishers) · NFPA 101 Life Safety Code (office occupancy) · 21 USC 360i Safe Medical Device Act
**Evidence:** **P, D, I, O**

**PURPOSE**
To maintain a safe environment in agency offices, vehicles, and patient homes, with active controls for fire, utilities, and medical equipment.

**POLICY**
The agency maintains a written Environment of Care plan covering office and field operations. Fire-safety equipment is inspected on a documented schedule. Patient-use medical equipment is verified for safe operation, and equipment-related events are tracked through QAPI and reported under SMDA when criteria are met.

**PROCEDURE**
1. **Office EOC plan** (`RM-OS-001.A`) — addresses building access, fire response, utilities outage, severe weather, workplace violence, and active threat. Reviewed annually.
2. **Fire safety — office** (HH7-5A.01):
   a. **Portable fire extinguisher inspection** monthly *visual* check by the Safety Officer (gauge in green, pin/seal intact, no obstruction, signage visible) — initialed on the extinguisher tag and on `RM-OS-001.B` *Extinguisher Inspection Log*.
   b. **Annual maintenance** by a state-licensed servicer per NFPA 10 — service tag attached.
   c. **6-year internal maintenance** and **12-year hydrostatic test** scheduled on `RM-OS-001.C` *Extinguisher Lifecycle Log*.
   d. Egress paths kept clear; exit signs illuminated; emergency lighting tested monthly (≥30s) and annually (≥90 min).
   e. Fire drills in the office performed at least annually; after-action recorded on `RM-OS-001.D`.
3. **Fire safety — patient home.** During the initial environmental assessment, the clinician asks about and documents (i) presence of working smoke alarms, (ii) escape plan, (iii) oxygen-in-use signage and no-smoking, (iv) extension-cord/overload risks. Education provided and documented; deficiencies escalated to the Clinical Manager.
4. **Utilities management.** Office HVAC, electrical, and water systems inspected per vendor schedule; logs in `RM-OS-001.E`. Power-loss contingency: agency operates ≤4h on UPS for critical IT; >4h triggers branch failover per `RM-EP-001`.
5. **Equipment management — agency-owned** (BP cuffs, glucometers, pulse-ox, scales): inventoried, calibrated per manufacturer (glucometers daily QC when in use; scales annually), tagged with cycle date.
6. **Equipment in the home — DME from contracted vendor.** Vendor agreement (`RM-OS-001.F`) specifies vendor responsibility for delivery, set-up, patient training, and 24/7 service. Clinician verifies safe operation each visit.
7. **Medical equipment malfunction & SMDA.** Any device-related death, serious injury, or serious illness is reported to the manufacturer within 10 working days and to the FDA via MedWatch (Form 3500A) when criteria are met. Logged on `RM-OS-001.G` *SMDA Reportable Events Log*.
8. **Vehicle accidents** reported within 24h on `RM-OS-001.H`; risk-managed by HR + Safety Officer.

**Cross-references:** `RM-EP-001` Emergency Preparedness · `RM-OS-002` Incident Reporting/RCA · `RM-OS-003` Personnel Safety.
**Addendums:** `.A` EOC Plan · `.B` Extinguisher Monthly Log · `.C` Extinguisher Lifecycle Log · `.D` Fire Drill After-Action · `.E` Utilities Log · `.F` DME Vendor Agreement · `.G` SMDA Log · `.H` Vehicle Incident Report.

---

### Sample 7 · `RM-EP-001` Emergency Preparedness — All-Hazards Plan, Training & Exercises  *(Domain 7 — Emergency Preparedness)*

**Crosswalk:** ACHC HH7-3A through HH7-3E · CoP §484.102(a)–(d) · Title 22 §74721 · 42 CFR §403.748 (testing exercises)
**Evidence:** **P, D, I, S**

**PURPOSE**
To establish a comprehensive, all-hazards emergency preparedness (EP) program that protects patients and personnel and ensures continuity of care during emergencies.

**POLICY**
The agency maintains a four-element EP program: (1) a risk-based Emergency Plan, (2) Policies & Procedures, (3) a Communication Plan, and (4) a Training & Testing Program — all reviewed at least every 2 years (annually for the HVA), and after any actual activation.

**PROCEDURE**
1. **Hazard Vulnerability Analysis (HVA)** completed annually using the Kaiser HVA tool against natural, technological, human, and hazardous-material categories. Top 5 hazards drive plan focus. Documented on `RM-EP-001.A`.
2. **Patient acuity tiering.** Every active patient is assigned an EP tier at SOC and at recert: **Tier 1** (life-sustaining equipment / dialysis / oxygen), **Tier 2** (insulin-dependent or daily skilled need), **Tier 3** (stable). Tier list refreshed weekly; staged on `RM-EP-001.B`.
3. **Communication plan** (§484.102(c)) — primary, secondary, and tertiary contact methods for: each patient and emergency contact, each employee, the certifying practitioner, the local emergency management agency, the State Department of Public Health, ACHC, contracted vendors (DME, IT, payroll). Tested quarterly via a roll-call cascade; results on `RM-EP-001.C`.
4. **Training** at hire and annually for all personnel on: agency EP plan, role-specific responsibilities, sheltering and evacuation guidance for patients, and PPE for relevant hazards. Roster on `OP-FM-040`; curriculum on `OP-FM-041`.
5. **Exercises — minimum two per year:**
   a. **One full-scale or community-integrated exercise.** Where one is unavailable (documented exemption per §484.102(d)), the agency conducts an **individual facility-based functional exercise.**
   b. **One additional exercise**: tabletop, drill, or another full-scale.
   c. **After-Action Report (AAR) & Improvement Plan** completed within 30 days of every exercise and every actual activation; deficiencies fed into QAPI (`QA-PI-001`).
6. **Activation procedures.** Administrator (or designee) declares activation; staff use the “EP-ACTIVATE” cascade on `RM-EP-001.D`. Tier-1 patients contacted within 4h, Tier-2 within 12h, Tier-3 within 24h.
7. **Continuity of operations** — alternate work sites, cloud-based EHR access, paper visit packets, mobile-hotspot kits in each branch.
8. **Patient education.** At SOC and at recert, patient/caregiver receives the EP Education Sheet (`RM-EP-001.E`) covering preparedness checklist, evacuation considerations, and how to contact the agency during an emergency.
9. **Closure / cease-operations contingency** — addresses patient transfer to other providers within 5 business days of declared closure, retention of records per `EN-RM-001`, and notification of CDPH and ACHC.

**Cross-references:** `RM-OS-001` EOC · `QA-PI-001` QAPI · `EN-WF-101` Workflow enforcement.
**Addendums:** `.A` HVA · `.B` Patient EP Tier Roster · `.C` Communication Cascade Test Log · `.D` Activation Cascade Worksheet · `.E` Patient EP Education Sheet · `.F` AAR Template.

---

### Sample 8 · `RM-MM-001` Medication Management & High-Alert Medications  *(Domain 8 — Medication Management)*

**Crosswalk:** ACHC HH4-2C.01, HH4-2D.01, HH4-6C.01 · CoP §484.55(c)(5), §484.60(a)(2)(iii) · Title 22 §74693 · ISMP High-Alert Med List · 21 CFR Part 1300 (controlled substances disposal)
**Evidence:** **P, D, I, O**

**PURPOSE**
To prevent medication-related harm through accurate reconciliation, safe administration, patient self-administration teaching, high-alert and controlled-substance controls, and adverse-event reporting.

**POLICY**
A complete drug regimen review is performed by an RN at SOC, after every hospitalization, and at recertification. Medication errors and adverse drug reactions are reported, analyzed in QAPI, and used to drive improvement.

**PROCEDURE**
1. **Reconciliation (SOC, recert, post-acute).** RN compares prescribed, OTC, herbals, and PRN against the active POC; discrepancies reported to the practitioner within 24h and resolved with a written order. Logged on `RM-MM-001.A`.
2. **Drug regimen review.** RN screens for: significant interactions, omissions, duplications, ineffective therapy, side-effects, contraindications, dose/route errors. Findings on `RM-MM-001.B`.
3. **High-alert medications** (per ISMP list — anticoagulants, insulin, opioids, chemotherapy, hypertonic saline). For each: (a) independent double-check at first dose in the home where two clinicians are present; (b) patient-specific monitoring plan in the POC; (c) red-flag entry on the medication profile.
4. **Self-administration teaching.** Patient/caregiver receives written instructions in primary language; **teach-back** documented for each medication at SOC and after any change. Documented on `RM-MM-001.C`.
5. **Controlled substances** — agency does not store; supports patient/caregiver via mfr-supplied disposal pouch (DEA-compliant) at end of therapy/death. Disposal witnessed by 2 staff or 1 staff + 1 caregiver and recorded on `RM-MM-001.D`.
6. **PRN reassessment.** PRN doses assessed for effect within 60 minutes; reassessment documented in the visit note.
7. **Medication errors & ADRs.** Reported within 24h via incident system (`RM-OS-002`); practitioner notified immediately if patient harm; aggregated rate reported monthly to QAPI (`QA-FM-020`).
8. **Storage & disposal in the home** — patient educated on locked/inaccessible storage (especially opioids), expired-med disposal options, and child-resistant packaging. Documented at SOC and as risks change.

**Cross-references:** `CL-PC-001` POC · `RM-OS-002` Incident/RCA · `QA-PI-001` QAPI.
**Addendums:** `.A` Med Reconciliation Worksheet · `.B` Drug Regimen Review Note · `.C` Self-Admin Teach-Back Record · `.D` Controlled-Substance Disposal Witness Log.

---

### Sample 9 · `CO-PR-001` Patient Rights, Notice & Grievance Process  *(Domain 9 — Patient Rights/Compliance)*

**Crosswalk:** ACHC HH2-2A, HH2-5A · CoP §484.50(a)(b)(c)(e), §484.110(c) · Title 22 §74701, §74743
**Evidence:** **P, D, I**

**PURPOSE**
To define and protect the rights of patients and to provide a fair, timely, and documented grievance process.

**POLICY**
Each patient receives, in their primary language and in an accessible format, a written Notice of Rights at admission and on each recertification. The agency investigates and responds to every grievance, regardless of source, and tracks closure through QAPI.

**PROCEDURE**
1. **Notice of Rights** delivered before the start of care (or at the first home visit if telephonic SOC was not feasible) and includes: right to be informed in advance, right to participate in care planning, right to confidentiality, right to access records, right to be free of abuse/neglect, right to voice grievances without retaliation, right to receive contact info for the State Hotline 1-800-228-1363, ACHC complaint line 855-937-2242, the Office of the Medicare Beneficiary Ombudsman, and the agency Compliance Officer.
2. **Acknowledgment** signed by patient/representative on `CO-PR-001.A`.
3. **Translation/accommodation.** Notices are available in English, Spanish, Tagalog, Cantonese, and other prevalent languages; interpreters arranged for any patient with LEP within 24h. Sensory-impairment accommodations per §504/ADA documented in chart.
4. **Grievance intake.** Any verbal or written complaint, from any source, is logged on `CO-PR-001.B` within one business day with a unique ID.
5. **Acknowledgment.** Patient receives written acknowledgment within 5 business days, including the assigned investigator, expected timeline, and the patient’s right to escalate to the State Hotline / ACHC.
6. **Investigation.** Conducted by the Compliance Officer or designee independent of the involved staff; chart review, interviews, and field observation as needed.
7. **Closure.** Written response within 30 calendar days; if unable to close in 30 days, written interim update with reason and revised closure date.
8. **Allegations of abuse/neglect/exploitation/misappropriation** — immediately reported to Adult Protective Services, CDPH, and law enforcement when applicable; involved personnel removed from patient assignment pending investigation per `HR-DI-001`.
9. **Trends.** Grievance volume, type, time-to-close, and substantiation rate reported monthly to QAPI.

**Cross-references:** `CO-CA-001` Compliance · `RM-OS-002` Incident/RCA · `QA-PI-001` QAPI · `HR-DI-001` Discipline.
**Addendums:** `.A` Patient Rights Acknowledgment · `.B` Grievance Log & Investigation Worksheet · `.C` Abuse/Neglect Reporting Decision Tree.

---

### Sample 10 · `FN-BC-001` Medicare Billing, ABN/HHCCN & Disclosure  *(Domain 10 — Financial/Billing)*

**Crosswalk:** ACHC HH1-9A.01, HH2-2A · CoP §484.50(c)(7), §484.110, 42 CFR Part 420 Subpart C, 42 CFR §411.404 (ABN), §405.1200 (expedited determination) · Title 22 §74743, HSC §1727.5(d)–(f)
**Evidence:** **P, D, I**

**PURPOSE**
To ensure billing integrity, beneficiary financial-liability transparency, and full disclosure of ownership and managerial relationships.

**POLICY**
The agency bills only for services rendered, ordered by an authorized practitioner, supported by documentation in the medical record, and within Medicare/Medi-Cal coverage rules. Beneficiary-liability notices (ABN, HHCCN, Expedited Determination) are issued in the federally specified form, language, and timing.

**PROCEDURE**
1. **Pre-bill chart audit.** Each claim cycle, the billing team confirms: signed POC, F2F encounter on file, OASIS submitted/accepted, visit notes match the visits billed, supplies documented, HIPPS code matches OASIS scoring.
2. **OASIS submission.** OASIS data submitted to iQIES within 30 days of completion; rejected records corrected and resubmitted within 31 days. Tracked on `FN-BC-001.A`.
3. **Notice of Medicare Non-Coverage (NOMNC).** Issued to all Medicare patients ≥2 calendar days before the planned termination of all covered services; signed receipt on `FN-BC-001.B`.
4. **Expedited Determination.** When patient appeals NOMNC, agency provides the **Detailed Explanation of Non-Coverage (DENC)** to the QIO and patient by COB the day the QIO requests it.
5. **Advance Beneficiary Notice (ABN — Form CMS-R-131).** Issued whenever covered services are expected to be denied (e.g., not medically reasonable & necessary), prior to delivering the item/service; patient selects Option 1, 2, or 3; agency retains a copy.
6. **Home Health Change of Care Notice (HHCCN — Form CMS-10280).** Issued whenever the agency reduces or terminates a service or supply for a non-coverage reason or per practitioner order that the patient may dispute.
7. **Annual public disclosure** (42 CFR §420 Subpart C) filed with CMS — names/addresses of owners ≥5%, controlling persons, managing employees, prior HH ownership, criminal-offense history, fiscal-intermediary employment in last 12 months. Signed by Administrator on `FN-BC-001.C`.
8. **Reportable events.** License suspension, civil penalties ≥$10,000, third-party recoveries ≥$10,000, ownership change, bankruptcy filings — reported to ACHC and CDPH within 30 days.
9. **Compliance audit.** Monthly random sample of 5% of paid claims audited for documentation support; overpayments returned within 60 days per §1128J(d) (60-day rule). Findings to QAPI and Compliance Committee.

**Cross-references:** `CO-CA-001` Compliance · `OP-AD-001` Admission · `CL-OA-101` OASIS · `GV-GB-001` Governing Body.
**Addendums:** `.A` OASIS Submission Tracker · `.B` NOMNC Issuance Log · `.C` Annual Disclosure Statement · `.D` ABN/HHCCN Issuance Log · `.E` 60-Day Overpayment Tracker.

---

## PART 5 — HIGH-RISK AREA TRACEABILITY

| High-risk area | Where addressed in samples | Survey artifact (Evidence type) |
|---|---|---|
| **Fire safety (incl. extinguisher inspection)** | `RM-OS-001` §2 (monthly visual + tag, annual NFPA-10 service, 6-yr internal, 12-yr hydrostatic) | Extinguisher tags, `RM-OS-001.B`/`.C` logs, fire-drill AAR (**D, O**) |
| **Emergency preparedness (incl. drills)** | `RM-EP-001` §5 (≥2 exercises/yr, full-scale OR community-integrated + AAR within 30d) | HVA, exercise AAR, training roster (**D, I, S**) |
| **Equipment management** | `RM-OS-001` §5–§7; SMDA reporting | Calibration logs, SMDA log `RM-OS-001.G`, MedWatch 3500A submissions (**D, O**) |
| **Infection control (incl. bag technique)** | `RM-IC-001` §3 (a–g) — observable on every home visit | Bag cleaning log `.B`, competency observation `.E`, infection logs `.C/.D` (**D, O, I**) |
| **Incident reporting → RCA → QAPI** | `RM-OS-002` invoked; sentinel-event 24h RCA initiation; 90-day closure | Incident log, RCA worksheet, PIP charter `QA-FM-021`, GB minutes (**D, I, S**) |
| **Medication safety** | `RM-MM-001` (reconciliation, high-alert independent double-check, teach-back, controlled-sub disposal witness) | Reconciliation worksheet `.A`, teach-back record `.C`, error rate trend (**D, O, I**) |
| **Patient rights & grievance** | `CO-PR-001` (NoR signed, 5-day acknowledgment, 30-day closure, abuse reporting) | Grievance log `.B`, NoR acknowledgment `.A`, APS report receipts (**D, I**) |

---

## EXECUTION CHECKLIST (next 30 days)

1. Generate `Builder/Policies/corridor_crosswalk.csv` mapping every Corridor `Section-Policy` ID to our `XX-YY-NNN` ID with status (COVERED / PARTIAL / MISSING).
2. Extend `generate_from_extracted.py` to emit `crosswalk`, `evidenceTypes`, `addendums[]` on each policy in `allPoliciesContent.generated.ts`.
3. Bind every existing `*-FM-*` form to a `parentPolicyId` + `addendumKey` (A/B/C…) in the forms registry.
4. Add a Crosswalk tab to `SharedPolicyDetailView` rendering the four-column matrix from the new metadata.
5. Run a 10-tag survey rehearsal; record results as the baseline KPI for the Corridor-alignment PIP.

---

*End of document. All ten sample policies are written to be ingestible into the existing pipeline (`Builder/Policies/extracted_full/<DOMAIN>/*.md`) without ID renumbering and without breaking the current generator contract.*
