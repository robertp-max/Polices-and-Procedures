# CORRIDOR PATCHES — Additive Procedure Content for Existing Policy IDs

> **Source-of-truth file.** This file holds Corridor-level procedure additions that map directly onto our existing policy IDs. Each section below **augments** (does not replace) the corresponding policy in `Builder/Policies/extracted_full/<DOMAIN>...md`. Run `python Builder/Policies/generate_from_extracted.py` to merge into `src/policy/data/allPoliciesContent.generated.ts` on the next regeneration cycle. Until then, this file is the authoritative reference and the metadata sidecar `src/policy/data/corridorAlignment.generated.ts` already exposes the crosswalk and addendum bindings to the application.
>
> Format: each H1 = a policy ID. Each H2 = a Corridor-aligned PROCEDURE STEP block. All content is real, specific, audit-defensible — written for ACHC HH, Medicare CoP 42 CFR Part 484, and California Title 22.

---

# RM-ER-002 — Bag Technique (Corridor §6-013)

**Crosswalk:** ACHC HH7-1A, HH7-2A.01, HH7-2B.01 · CoP §484.70 · Title 22 §74723, §74725 · CDC Standard Precautions
**Evidence:** P, D, I, O

## PURPOSE
To prevent transmission of infectious agents into and out of the patient home via the nursing/clinician bag and its contents.

## POLICY
Every clinician who carries a bag into a patient home shall observe Bag Technique on every visit. Bag Technique is observable; competency is verified by direct field observation at hire and annually.

## PROCEDURE
1. **Surface preparation.** Place the bag on a clean, dry, hard surface — never on the floor, bed, or upholstered furniture. Place a barrier (paper towel/chux) under the bag.
2. **Pre-opening hand hygiene.** Perform hand hygiene (alcohol-based rub ≥20s or soap/water ≥20s) before opening the bag and before retrieving any item.
3. **Anticipate supplies.** Remove all anticipated supplies before patient contact; close the bag during patient care so the interior is not re-entered with contaminated hands.
4. **Item-return rule.** Disinfect any reusable item that contacted the patient with a hospital-grade EPA-registered disinfectant per manufacturer contact-time before returning it to the bag. Single-use items are **not** returned to the bag — they are bagged for disposal in the home.
5. **Pre-closure hand hygiene.** Perform hand hygiene before closing the bag.
6. **Bag exterior decontamination.** Decontaminate the bag exterior at least weekly and any time of visible soil. Log on `RM-OS-001.B`-equivalent *Bag Cleaning Log* (Addendum RM-ER-002.A).
7. **Shared instruments.** Stethoscope, BP cuff, pulse-ox, and thermometer disinfected between patients with alcohol-based wipe ≥30s contact.
8. **High-risk visits.** When entering an isolation/precaution home, leave the bag in the vehicle; carry only what is needed in a disposable plastic bag.
9. **Annual competency.** Direct field observation by Clinical Manager (or designee) recorded on Addendum RM-ER-002.B *Bag Technique Competency Checklist*. Failed observations trigger immediate retraining and re-observation within 7 days.

## ADDENDUMS
- RM-ER-002.A — Bag Cleaning Log
- RM-ER-002.B — Bag Technique Competency Checklist

## CROSS-REFERENCES
RM-ER-001 (IPC Plan) · RM-ER-003 (BBP) · RM-ER-004 (TB) · QA-PG-001 (QAPI surveillance) · HR-TD-001 (Annual Training).

---

# RM-OS-001 — Fire Safety & Extinguisher Inspection (Corridor §6-020/§6-024)

## PROCEDURE — Office Fire Safety (additive)
1. **Portable fire extinguisher monthly visual inspection** by the Safety Officer or designee:
   - Pressure gauge needle in the green operating range
   - Pull pin and tamper seal intact
   - Hose, nozzle, and discharge horn unobstructed and undamaged
   - Mounting bracket secure; signage visible from ≥30 ft
   - Service tag legible
   - Initialed on the back of the extinguisher tag **and** on Addendum RM-OS-001.B *Extinguisher Monthly Inspection Log* (form `RM-F-010`)
2. **Annual maintenance** by a state-licensed fire-protection servicer per **NFPA 10 §7.3** — service tag affixed.
3. **6-year internal maintenance** of stored-pressure dry chemical extinguishers (NFPA 10 §7.3.3).
4. **12-year hydrostatic test** of dry chemical extinguishers (NFPA 10 §8.3). Tracked on Addendum RM-OS-001.C *Extinguisher Lifecycle Log*.
5. **Egress.** Egress paths kept clear at all times; exit signs illuminated; emergency lighting tested **monthly (≥30 sec)** and **annually (≥90 min)** per NFPA 101 §7.9.
6. **Office fire drill** at least annually; after-action notes captured on Addendum RM-OS-001.D *Fire Drill After-Action Report* (form `RM-F-011`); deficiencies fed to QAPI (`QA-PG-001`).

## PROCEDURE — Patient-Home Fire Safety (additive)
At the initial environmental assessment (and on any change in equipment/layout), the clinician documents:
- Working smoke alarms on each level / outside each sleeping area
- Patient/caregiver knowledge of escape plan and meeting place
- Oxygen-in-use signage and "no smoking within 10 ft" reinforcement
- Extension cord / overload risks; absence of multi-tap power strips on heat sources
- Education delivered and documented on the visit note; deficiencies escalated to the Clinical Manager within 24 h.

## PROCEDURE — Equipment Management & SMDA (additive)
- Agency-owned equipment (BP cuff, glucometer, pulse-ox, scale): inventoried, calibrated per manufacturer, tagged with cycle date.
- DME from contracted vendor: vendor agreement (Addendum `.F`) defines delivery, set-up, patient training, 24/7 service. Clinician verifies safe operation at every visit.
- **Safe Medical Device Act** reportable events: device-related death, serious injury, or serious illness reported to the **manufacturer within 10 working days**, and to **FDA via MedWatch (Form 3500A)** when criteria are met. Logged on Addendum `.G` *SMDA Reportable Events Log*.

## ADDENDUMS (full set)
A: Office EOC Plan · B: Extinguisher Monthly Log (RM-F-010) · C: Extinguisher Lifecycle Log · D: Fire Drill AAR (RM-F-011) · E: Utilities Log · F: DME Vendor Agreement · G: SMDA Log · H: Vehicle Incident Report.

---

# RM-EP-001 — Emergency Preparedness Exercises & After-Action (Corridor §6-037)

## PROCEDURE — Exercises (additive, ACHC HH7-3D / CoP §484.102(d))
1. **Annual minimum:** two exercises per year.
   - **Exercise A:** one full-scale community-integrated exercise. If a community-integrated exercise is not accessible (documented in the AAR), the agency conducts an **individual facility-based functional exercise**.
   - **Exercise B:** one additional exercise: tabletop, drill, or another full-scale.
2. **HVA-driven scenarios:** scenarios drawn from the top-5 hazards on the current Hazard Vulnerability Analysis (Addendum A).
3. **Patient acuity tiers exercised:** every exercise must include a Tier-1 (life-sustaining) patient scenario.
4. **After-Action Report (AAR):** completed within **30 days** of the exercise on Addendum F. AAR captures:
   - Objectives, participants, scenario, timeline
   - Strengths
   - Areas for improvement
   - Corrective Action Items (each with owner, due date, success criteria)
5. **AAR routing:** to QAPI Committee (`QA-PG-001`), Governing Body (`GV-GB-001`), and into the IT DR/BCP review (`IT-DR-001`).
6. **Activation parity:** every actual EP activation also produces an AAR within 30 days.
7. **Tier-1 patient outreach:** during activation, Tier-1 patients are contacted within **4 h**, Tier-2 within **12 h**, Tier-3 within **24 h** — recorded on Addendum D.

## ADDENDUMS (full set)
A: HVA · B: Patient EP Tier Roster · C: Communication Cascade Test Log · D: Activation Cascade Worksheet · E: Patient EP Education Sheet · F: AAR Template · G: Cease-Operations Contingency Plan.

---

# QA-AE-001 — Incident Reporting → RCA → QAPI (Corridor §6-002)

## PROCEDURE — Sentinel-Event Loop (additive)
1. **Intake.** Any incident (patient harm, near-miss, complaint, equipment failure, exposure, vehicle accident, unsafe-visit) is logged within **24 h** of identification on the agency Incident Report (form referenced by `RM-OS-002`).
2. **Triage.** Compliance Officer or QAPI Coordinator categorizes:
   - **Sentinel** (death, permanent harm, major permanent loss of function unrelated to natural course of illness): RCA within 24 h.
   - **Serious adverse event:** RCA within 5 business days.
   - **Other:** trended, no individual RCA unless cluster identified.
3. **Root Cause Analysis.** RCA worksheet (Addendum QA-AE-001.A) documents: chronology, contributing factors, root cause(s), system vs. human factors, corrective actions with owner/due-date.
4. **30-day action plan** presented to QAPI Committee.
5. **90-day closure verification** by QAPI Coordinator with measurable evidence the corrective action was effective.
6. **Governing Body reporting** of all sentinel events at the next quarterly meeting (`GV-GB-001`).
7. **External reporting:** notify ACHC for sentinel events per accreditation manual; CDPH for any reportable event under Title 22 §74725.

## ADDENDUMS
A: RCA Worksheet · B: Sentinel Event Notification Template.

---

# CL-CP-001 — Plan of Care Verbal-Order Readback & 72-Hour Cosign (Corridor §4-002 / §4-003)

## PROCEDURE — Verbal Orders (additive)
1. **Receipt.** Only an RN may accept a verbal/telephone order from a certifying practitioner.
2. **Readback.** The RN repeats back the full order — drug, dose, route, frequency, duration, indication — and the practitioner confirms verbatim.
3. **Documentation.** RN dates, times, and signs the order in the EHR; logs it on Addendum B *Verbal Order Log*.
4. **Practitioner cosign.** The order is sent for practitioner signature and **counter-signed within 72 hours** (CoP §484.60(b)).
5. **Tracking.** Outstanding verbal orders >72 h appear on the Clinical Manager's daily exception report; trended in QAPI dashboard.

---

# OP-IM-002 — Grievance Process Timeliness (Corridor §2-008)

## PROCEDURE — Grievance Lifecycle (additive)
1. **Intake within 1 business day** of complaint receipt — verbal or written, from any source — logged on Addendum B *Grievance Log*.
2. **Patient acknowledgment within 5 business days** with: investigator name, expected timeline, escalation path (State Hotline 1-800-228-1363, ACHC complaint line 855-937-2242).
3. **Investigation** by Compliance Officer or designee independent of involved staff.
4. **Closure within 30 calendar days**; if delayed, written interim update with reason and revised closure date.
5. **Abuse / neglect / exploitation / misappropriation:** reported to **Adult Protective Services** and **CDPH** immediately; involved personnel removed from patient assignment pending investigation per `HR-ER-001` / `HR-ER-002`.
6. **QAPI trending:** monthly volume, type, time-to-close, substantiation rate.

---

# RM-ER-003 — Bloodborne Pathogens & Hep B Exposure Control (Corridor §6-029)

## PROCEDURE — Exposure & Hep B (additive)
1. **Exposure Control Plan** reviewed annually (29 CFR §1910.1030(c)).
2. **Hepatitis B vaccine** offered free to every at-risk employee within **10 working days of assignment**; declination signed and retained.
3. **Post-exposure response:** source patient and exposed worker tested within **2 hours**; PEP started per CDC guidance when indicated.
4. **Sharps log** maintained per OSHA Needlestick Safety Act; reviewed by IPC quarterly.
5. **Annual BBP training** documented on `HR-TD-001`.

---

# RM-ER-004 — TB Exposure Control (Corridor §6-028)

## PROCEDURE — TB (additive)
1. **Annual TB risk assessment** of patient population and personnel exposure.
2. **Baseline two-step TST or single IGRA** at hire for all clinical personnel (CDC 2019 update).
3. **Annual symptom screen** for all clinical personnel; serial testing only when annual risk assessment classifies the agency as medium/high risk.
4. **Conversion** triggers 30-day clinical evaluation, contact investigation, and reporting per CDPH.

---

# CO-HP-004 — HIPAA Breach Notification Timeline (Corridor §2-016)

## PROCEDURE — Breach Notification (additive, 45 CFR §164.404–§164.408)
1. **Discovery → risk assessment** completed within **5 business days**.
2. **Patient notification:** without unreasonable delay and **no later than 60 calendar days** from discovery; written, by first-class mail (or email if patient consented).
3. **HHS OCR notification:**
   - Breach affecting **≥500 individuals**: report **within 60 calendar days** of discovery and notify prominent local media.
   - Breach affecting **<500 individuals**: log internally and submit to OCR **within 60 days of the end of the calendar year**.
4. **Business Associate breach** triggers BA notice obligations within the BAA.
5. **Sanctions:** Disciplinary action per `HR-ER-001` policy; mandatory retraining.

---

*End of patches. The metadata sidecar `src/policy/data/corridorAlignment.generated.ts` exposes these crosswalks and addendums to the application now; merging the procedure text into `allPoliciesContent.generated.ts` happens on the next `generate_from_extracted.py` run.*
