# Care Indeed Home Health Care, Inc. Onboarding LMS Architecture

## Build 1.1 - Validation and Hardening

Version: 1.1
Date: July 6, 2026
Status: Draft validation artifact - architecture only
Baseline: `ONBOARDING_ARCHITECTURE_BUILD1.md`
Supporting context: preflight / validation notes only

This document creates Build 1.1 from the Build 1 architecture baseline. It does
not overwrite Build 1. It does not implement the LMS, create CMS schema, generate
module content, wire routes, or alter live TSX.

Annual ACHC renewal and Advanced Training remain separate products and are not
modified by this architecture validation.

---

## 1. Corrected Product Boundary

| Boundary | Included in Build 1.1 | Excluded / Separate Product |
|---|---|---|
| Onboarding Core | On-hire required training for direct care employees, including the 12 ACHC packet topics and Care Indeed compliance / policy acknowledgments | Annual ACHC renewal product |
| ACHC packet content | Incorporated into onboarding because the packet is completed on hire | The annual renewal workflow and annual ACHC player |
| Role-specific onboarding | Role-based modules assigned at hire using `ROLE-*` IDs | Advanced/simulator/specialty modules |
| HHA competency pathway | CMS-required competency domains, agency-added competencies, supervised visits, RN/DON signoff | Annual in-service tracking beyond the onboarding clearance package |
| Advanced Training | Not included | Separate advanced product; no `ADV-*` IDs in onboarding |
| Annual retraining | A renewal timer can be created after onboarding completion | Actual annual renewal content and annual ACHC completion workflow |

Source authority preserved from Build 1:

- ACHC packet instruction: training is completed on hire and annually for direct care employees.
- HR-TA-001 section 6.9: orientation includes compliance training, policy acknowledgments, role-specific clinical orientation, and supervisor clearance.
- CO-CP-001 section 6.1.1: all new hires are enrolled in compliance orientation within 5 business days of start date.

---

## 2. Corrected Naming Model

Build 1.1 removes confusing "ACHC Track" language from onboarding.

| Name | Meaning | Allowed ID Pattern |
|---|---|---|
| Onboarding Core | On-hire required core training, including ACHC packet topics plus Care Indeed requirements | `CORE-01` through `CORE-14` |
| Role-Specific Onboarding | Discipline or job-function onboarding assigned at hire | `ROLE-RN-*`, `ROLE-LVN-*`, `ROLE-PT-*`, `ROLE-OT-*`, `ROLE-SLP-*`, `ROLE-MSW-*`, `ROLE-HHA-*`, `ROLE-ADM-*` |
| HHA Competency Pathway | HHA-only competency evaluation, agency-added skills, supervised visits, and clearance | `COMP-HHA-*`, `VISIT-HHA-*`, `CLEAR-HHA-*` |
| ACHC Annual Training | Annual renewal product and source annual module identifiers | `ACHC-ART-M01` through `ACHC-ART-M12` |
| Advanced Training | Separate advanced/simulator/specialty training | `ADV-*` only outside onboarding |

Rules:

- Do not label onboarding as an ACHC track.
- Do not use `ADV-*` for role-specific onboarding.
- Do not use `ACHC-ART-*` as the onboarding product module ID. If ACHC annual/on-hire source content is referenced, store it as source metadata on `CORE-*` records.
- Role modules are onboarding modules only when they use `ROLE-*`.

---

## 3. Corrected Module ID Strategy

### 3.1 Onboarding Core Modules

| # | Build 1.1 Module ID | Title | Source Basis | Policy Source Status |
|---|---|---|---|---|
| 1 | CORE-01 | Cultural Awareness and Competence | ACHC packet pp. 3-10 | verified / needs_review mix |
| 2 | CORE-02 | Emergency / Disaster Preparedness | ACHC packet | verified |
| 3 | CORE-03 | Complaints and Grievances | ACHC packet | verified |
| 4 | CORE-04 | HIPAA and Privacy | ACHC packet | verified |
| 5 | CORE-05 | Infection Control | ACHC packet | corrected from invalid legacy ID |
| 6 | CORE-06 | Communication Barriers | ACHC packet | verified |
| 7 | CORE-07 | Workplace and Patient Safety (OSHA) | ACHC packet | verified |
| 8 | CORE-08 | Patient Rights and Responsibilities | ACHC packet | corrected from invalid legacy ID |
| 9 | CORE-09 | Corporate Compliance | ACHC packet | verified |
| 10 | CORE-10 | Ethics / Code of Conduct | ACHC packet | verified |
| 11 | CORE-11 | TB and Bloodborne Pathogens | ACHC packet | corrected from invalid legacy ID |
| 12 | CORE-12 | Medical Device Act / Safe Medical Devices | ACHC packet | verified |
| 13 | CORE-13 | Care Indeed Compliance Orientation | CO-CP-001 section 6.1.1 | verified |
| 14 | CORE-14 | Hiring Policy Acknowledgments / Appendix F | HR-TA-001 Appendix F | verified |

### 3.2 Role-Specific Onboarding Modules

| Role | Build 1.1 Module ID | Title | Status |
|---|---|---|---|
| RN | ROLE-RN-01 | Clinical Protocols and Standards of Care | needs_review: source policy specificity |
| RN | ROLE-RN-02 | OASIS and Assessment Documentation | verified / source-specific crosswalk required |
| RN | ROLE-RN-03 | Care Plan Development and Coordination | verified |
| RN | ROLE-RN-04 | Supervision of HHAs | verified |
| LVN | ROLE-LVN-01 | LVN Scope of Practice and Supervision Requirements | regulatory source plus needs_review Care Indeed policy source |
| PT | ROLE-PT-01 | PT Evaluation and Documentation | needs_review: replace legacy rehab ref with canonical clinical documentation / care planning source |
| OT | ROLE-OT-01 | OT Evaluation and Documentation | needs_review: replace legacy rehab ref with canonical clinical documentation / care planning source |
| SLP | ROLE-SLP-01 | SLP Evaluation and Documentation | needs_review: replace legacy rehab ref with canonical clinical documentation / care planning source |
| MSW | ROLE-MSW-01 | MSW Psychosocial Assessment and Resources | needs_review: replace legacy psychosocial ref with canonical source |
| HHA | ROLE-HHA-01 | HHA Duties, Limitations and Documentation | verified regulatory source; agency policy source to be confirmed |
| HHA | ROLE-HHA-02 | HHA Competency Evaluation Prep | verified regulatory source; agency policy source to be confirmed |
| Admin | ROLE-ADM-01 | Administrative Systems and Workflows | needs_review: legacy HR workflow ref not verified |

---

## 4. Validated Policy Reference Table

Status definitions:

- `verified`: present in Build 1 source authority, master inventory snapshot, or the supplied canonical policy list.
- `needs_review`: plausible but must be confirmed against the final policy corpus before Build 2 records are created.
- `invalid`: Build 1 legacy/non-canonical ID. Do not carry into Build 2 source records.

| Build 1 Ref | Build 1.1 Ref | Status | Use / Notes |
|---|---|---|---|
| HR-TA-001 | HR-TA-001 | verified | Recruitment, hiring, Appendix F, orientation and supervisor clearance source. |
| CO-CP-001 | CO-CP-001 | verified | Corporate compliance program; compliance orientation within 5 business days. |
| CO-CP-004 | CO-CP-004 | verified | Code of Conduct / ethics source. |
| CO-HP-101 | CO-HP-101 | verified | HIPAA, CMIA and sensitive data privacy management source named in Build 1. |
| CO-HP-007 | CO-HP-007 | verified | Retention schedule for evidence durability rules. |
| RM-OS-101 | RM-OS-101 | verified | Emergency preparedness, OSHA / workplace safety, medical-device safety source family. |
| QA-PI-001 | QA-PI-001 | verified | Complaints, grievances, and performance improvement linkage. |
| CL-CP-001 | CL-CP-001 | verified | Care planning / coordination source. |
| CL-CA-001 | CL-CA-001 | verified | Assessment documentation source named as canonical in preflight instructions; crosswalk to CL-OA policies in Build 2. |
| CL-OA-001 through CL-OA-019 | CL-OA-* | verified | OASIS / assessment support series; exact module mapping required in Build 2. |
| CL-CD-001 | CL-CD-001 | verified | Clinical documentation replacement source for role documentation modules. |
| CL-PR-001 through CL-PR-006 | CL-PR-* | verified | Patient rights / advance directives / abuse reporting family; exact mapping required by module. |
| HR-TA-006 | HR-TA-006 | verified | HHA / supervised orientation support where applicable. |
| EN-TG-001 | EN-TG-001 | verified | Enterprise taxonomy and governance support for admin workflow module. |
| IC-IC-001 | CL-IC-001 | invalid -> corrected | Legacy infection-control ID. Use canonical clinical infection control source. |
| CL-PR-041 | CL-PR-001 | invalid -> corrected | Legacy patient-rights ID. Use canonical patient rights family. |
| CL-RE-001 | CL-CD-001 + CL-CP-001 | invalid -> corrected with needs_review | Legacy rehabilitation ID not accepted for Build 2. Use clinical documentation / care planning until discipline-specific source is confirmed. |
| CL-PS-001 | CL-CD-001 + CL-CP-001 | invalid -> corrected with needs_review | Legacy psychosocial ID not accepted for Build 2. Confirm MSW-specific canonical source before Build 2. |
| HR-WM-005 | HR-TA-001 + EN-TG-001 | invalid -> corrected with needs_review | Legacy admin workflow ID not accepted for Build 2. Confirm final admin workflow policy source before Build 2. |

---

## 5. Invalid / Needs-Review Ledger

### 5.1 Invalid Policy References Found

Invalid policy references found in Build 1: 5.

| Invalid Ref | Location | Build 1.1 Action |
|---|---|---|
| IC-IC-001 | CORE-05, CORE-11 | Replace with CL-IC-001. |
| CL-PR-041 | CORE-08 | Replace with CL-PR-001 and, where advance directives are included, CL-PR-002. |
| CL-RE-001 | ROLE-PT-01, ROLE-OT-01, ROLE-SLP-01 | Do not use. Temporarily map to CL-CD-001 + CL-CP-001; confirm discipline-specific source before Build 2. |
| CL-PS-001 | ROLE-MSW-01 | Do not use. Temporarily map to CL-CD-001 + CL-CP-001; confirm MSW source before Build 2. |
| HR-WM-005 | ROLE-ADM-01 | Do not use. Temporarily map to HR-TA-001 + EN-TG-001; confirm admin workflow source before Build 2. |

### 5.2 Needs-Review Items

Needs-review items found in Build 1.1: 6.

| Item | Why Review Is Required | Required Resolution Before Build 2 |
|---|---|---|
| ROLE-RN-01 source policy | Build 1 used generic "Clinical P&Ps (CL domain)" instead of a precise policy ID. | Select exact canonical clinical protocol source IDs. |
| ROLE-LVN-01 agency policy source | Regulatory reference is present, but Care Indeed policy source is not precise. | Confirm LVN supervision / scope policy ID. |
| ROLE-PT-01 / ROLE-OT-01 / ROLE-SLP-01 therapy source | CL-RE-001 is invalid. Replacement refs are generic documentation / care planning placeholders. | Confirm discipline-specific therapy policy IDs or approve CL-CD-001 + CL-CP-001 as the source pair. |
| ROLE-MSW-01 source | CL-PS-001 is invalid. Replacement refs are generic placeholders. | Confirm MSW-specific policy source or approve CL-CD-001 + CL-CP-001. |
| ROLE-ADM-01 source | HR-WM-005 is invalid and admin workflow source is not final. | Confirm admin systems / workflow policy source. |
| HHA agency-added competencies | Build 1 mixed CMS-required competency domains and agency-added skills. | DON / compliance owner must approve which extra skills are agency-added and the source policy. |

---

## 6. Corrected HHA Competency Model

Build 1 referenced "12 skill areas." Build 1.1 separates CMS-required competency
domains from agency-added competencies.

### 6.1 CMS-Required HHA Competency Domains

These domains are based on 42 CFR section 484.80 and must be treated as required
for the HHA competency pathway:

| Domain | Build 1.1 Classification |
|---|---|
| Communication skills | CMS-required competency domain |
| Observation, reporting, and documentation of patient status and care or services furnished | CMS-required competency domain |
| Reading and recording temperature, pulse, and respiration | CMS-required competency domain |
| Basic infection prevention and control procedures | CMS-required competency domain |
| Basic elements of body functioning and changes in body function that must be reported | CMS-required competency domain |
| Maintenance of a clean, safe, and healthy environment | CMS-required competency domain |
| Recognizing emergencies and knowledge of emergency procedures | CMS-required competency domain |
| Physical, emotional, and developmental needs of and ways to work with the populations served | CMS-required competency domain |
| Respect for patient privacy and property | CMS-required competency domain |
| Appropriate and safe techniques in personal hygiene and grooming | CMS-required competency domain |
| Safe transfer techniques and ambulation | CMS-required competency domain |
| Normal range of motion and positioning | CMS-required competency domain |
| Nutrition and fluid intake | CMS-required competency domain |
| Any task the HHA is expected to perform for the patient | Patient-specific CMS-required competency |

### 6.2 Agency-Added Competencies

The following may be included, but must be labeled `agency-added competency`
unless the final policy source explicitly makes them mandatory:

| Agency-Added Competency | Notes |
|---|---|
| Visit-note practice | Agency documentation standard; not itself a CMS competency domain. |
| EMR navigation drill | Agency workflow skill. |
| Care Indeed bag technique demonstration | May support infection control; label source precisely. |
| Expanded personal care checklist beyond CMS wording | Agency-added unless directly mapped to CMS required task. |
| Mock supervised visit worksheet | Agency-added evidence artifact. |

### 6.3 HHA Pathway Gate

HHA clearance requires:

1. All applicable `CORE-*` modules passed.
2. `ROLE-HHA-01` and `ROLE-HHA-02` passed.
3. CMS-required competency domains evaluated by RN or qualified supervisor.
4. Agency-added competencies evaluated and labeled as agency-added.
5. Supervised visits completed according to DON-approved onboarding plan.
6. RN supervisor and DON clearance recorded.
7. First supervisory visit timer created for the post-clearance requirement.

---

## 7. Pass Score Model

Build 1.1 stores source, agency, and effective pass thresholds separately.

| Field | Value | Meaning |
|---|---|---|
| sourceMinimumPassScore | 75 | ACHC packet minimum passing score for the 12 ACHC packet topics incorporated into onboarding core. |
| agencyPassScore | 80 | Care Indeed internal standard unless leadership grants a documented override. |
| effectivePassScore | 80 | Actual enforced score for Build 1.1 architecture, because agency standard exceeds the source minimum. |

Rule:

`effectivePassScore = max(sourceMinimumPassScore, agencyPassScore)` unless a
documented leadership override exists and is attached to the module source
record.

The evidence packet must store all three values so a reviewer can see that Care
Indeed exceeded the ACHC source minimum.

---

## 8. Module Readiness Architecture

No onboarding module can be marked `ready` for Build 2 source records unless it
has all of the following:

| Requirement | Minimum |
|---|---|
| durationMinutes | At least 30 minutes unless source explicitly requires less and leadership approval is attached |
| quiz questions | At least 5 |
| scenario challenge | Required |
| debrief / rationale | Required |
| documentation expectation | Required |
| escalation expectation | Required |
| policy refs | Every ref is `verified` or explicitly `needs_review`; no `invalid` refs |
| evidence requirements | Defined at module level |
| active-time requirement | Defined at module level |
| pass score fields | sourceMinimumPassScore, agencyPassScore, effectivePassScore |
| source version | ACHC packet / policy source version captured |

Any module missing one of these requirements must remain `draft` or
`needs_review` and must not be wired into a production LMS path.

---

## 9. Updated Data Model Fields

Build 1 data entities remain valid, with these Build 1.1 additions.

### 9.1 ModuleSource Additions

| Field | Purpose |
|---|---|
| productBoundary | `onboarding_core`, `role_specific_onboarding`, `hha_competency`, `annual_achc`, or `advanced_training` |
| onboardingModuleId | `CORE-*`, `ROLE-*`, `COMP-HHA-*`, or `VISIT-HHA-*` |
| sourceModuleId | Optional source ID such as `ACHC-ART-M01` when a CORE module derives from ACHC packet content |
| sourceMinimumPassScore | Stores ACHC or other source minimum |
| agencyPassScore | Stores Care Indeed internal threshold |
| effectivePassScore | Stores enforced threshold |
| policyRefStatus | Per-policy status: verified, needs_review, invalid |
| evidenceRequirements | Required evidence artifacts for completion packet |
| scenarioRequired | Boolean |
| debriefRequired | Boolean |
| documentationExpectationRequired | Boolean |
| escalationExpectationRequired | Boolean |
| moduleReadinessStatus | draft, needs_review, ready |

### 9.2 CompetencyCheckoff Additions

| Field | Purpose |
|---|---|
| competencyOrigin | `cms_required` or `agency_added` |
| cmsDomain | Required when competencyOrigin is `cms_required` |
| agencyPolicySourceId | Required when competencyOrigin is `agency_added` |
| evaluatorQualification | RN, DON, supervisor, or other approved evaluator role |
| patientSpecific | Boolean for patient-specific competencies |

### 9.3 AuditEvent Additions

| Field | Purpose |
|---|---|
| previousEventHash | Required for hash-linked audit chain |
| eventHash | SHA-256 hash of canonical event payload plus previous hash |
| serverRecordedAt | Server timestamp; browser timestamp may be included only as supplemental metadata |

---

## 10. Evidence Requirements

Build 1 evidence requirements are retained and hardened:

- No browser-local-only completion evidence.
- All completion evidence must be persisted server-side.
- Lesson start, lesson end, active time, quiz score, pass score thresholds, attestations, competency checkoffs, supervisor clearance, certificate, and audit event hashes must be exportable.
- Evidence packet must include the source policy IDs and policy ref status used at time of completion.
- Personnel-file packet export must be generated as PDF.
- Records retained per CO-HP-007 retention schedule, minimum 7 years unless a stricter rule applies.

---

## 11. Build 2 Readiness Checklist

| Check | Status |
|---|---|
| Product boundary corrected | complete |
| ACHC annual separated from onboarding | complete |
| Advanced Training excluded from onboarding | complete |
| Naming model corrected | complete |
| `CORE-*` / `ROLE-*` ID strategy defined | complete |
| Invalid Build 1 policy refs identified | complete |
| Invalid refs replaced in Build 1.1 architecture | complete |
| Needs-review policy items closed | not complete |
| HHA CMS-required vs agency-added model corrected | complete |
| Pass-score model standardized | complete |
| Module readiness gates defined | complete |
| Data model additions defined | complete |
| Source records can be created without unresolved policy gaps | not complete |

## 12. Readiness Status

NOT READY FOR BUILD 2

Build 2 must not start until these items are fixed:

1. Close the 6 needs-review items in section 5.2.
2. Confirm exact canonical policy sources for role-specific RN, LVN, PT, OT, SLP, MSW, HHA, and Admin onboarding modules.
3. Confirm whether CL-CD-001 + CL-CP-001 are acceptable replacement sources for therapy/MSW documentation modules or provide discipline-specific canonical policy IDs.
4. Confirm HHA agency-added competencies and their source policy IDs with DON / compliance owner.
5. Approve Build 1.1 pass-score model: sourceMinimumPassScore 75, agencyPassScore 80, effectivePassScore 80.

Summary counts:

- Invalid policy references found: 5.
- Needs-review items found: 6.
- Unresolved invalid policy references after Build 1.1 correction: 0.
- Build 2 can start: no.

---

## 13. Non-Modification Statement

Build 1.1 is an architecture validation artifact only.

No live TSX should be modified for this build. Annual ACHC Training and Advanced
Training are explicitly out of scope and remain separate products.

