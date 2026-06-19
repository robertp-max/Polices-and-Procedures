# January 2026 Mock Clinical Universe Summary

This registry is dry-run seed data only. It contains synthetic patients, synthetic workforce records, and deterministic January event readiness mappings. No PHI, real patients, real clinicians, real phone numbers, or real street addresses are included.

## Source Review

OASIS source folder:

`Builder/final-oasis-e2-all-item-04-01-2026`

Reviewed source files include the final all-item OASIS-E2 PDF plus SOC, ROC, FU, DC, DAH, TRN, Patient Tracking, and CMS-484.3 PDFs. The patient profiles include facts for tracking identifiers, SOC/ROC/recert timing, payer, language, transportation, sensory status, health literacy, BIMS/CAM, mood, behavior, living situation, assistance sources, ADL/GG function, elimination, diagnoses, hospitalization risk, pain, falls, dyspnea, nutrition, skin/wounds, high-risk drugs, medication reconciliation, special treatments, vaccination/intervention synopsis, and transfer/discharge medication-list fields when needed.

## Patient Table

| Patient | MRN | Acuity | Setting | Zone | ACCM | Defect posture |
|---|---|---|---|---|---|---|
| Soren Eriksson | MOCK-MRN-0001 | Level 1 Routine | Home | North Bay | Marcus Vasquez | Clean control |
| Minh Nguyen | MOCK-MRN-0002 | Level 1 Routine | Home | North Bay | Marcus Vasquez | Minor documentation gap |
| Adaeze Chowdhury | MOCK-MRN-0003 | Level 2 Moderate | Facility | Peninsula | Yemi Mwangi | Fall-risk / care coordination |
| Tobias Johansson | MOCK-MRN-0004 | Level 2 Moderate | Home | East Bay | Yemi Mwangi | Therapy recert frequency review |
| Blessing Adeyemi | MOCK-MRN-0005 | Level 3 High | Home | North Bay | Marcus Vasquez | Med reconciliation + wound order inconsistency |
| Fumiko Nakamura | MOCK-MRN-0006 | Level 4 Critical / Complex | Facility | Peninsula | Yemi Mwangi | Complex OASIS/POC mismatch |

## Clinician Table

| Staff ID | Name | Role | Status | Employment | Valid performer? | Sign/approve scope |
|---|---|---|---|---|---|---|
| MOCK-STF-0001 | Amara Okonkwo | RN | Active | W2 | Yes | OASIS, POC clinical |
| MOCK-STF-0002 | Takeshi Nakamura | RN | Active | Contractor | Yes | OASIS, POC clinical |
| MOCK-STF-0003 | Valentina Ramirez-Cruz | LVN | Active | W2 | Yes, delegated | No independent OASIS/POC signature |
| MOCK-STF-0004 | Priya Patel | LVN | Pending | W2 | No | Exception only |
| MOCK-STF-0005 | Erik Johansson | PT | Active | Contractor | Yes | Therapy documentation only |
| MOCK-STF-0006 | Fatima Adekoya | OT | Active | W2 | Yes | OT documentation only |
| MOCK-STF-0007 | Marcus Vasquez | HHA | Active | W2 | Yes | HHA / ACCM support only |
| MOCK-STF-0008 | Lena Quiñones | HHA | On Leave | W2 | No | Exception only |
| MOCK-STF-0009 | Yemi Mwangi | CNA | Active | W2 | Yes | CNA / ACCM support only |
| MOCK-STF-0010 | Pierre Lemoine | Caregiver | Inactive | Contractor | No | Exception only |
| MOCK-STF-0011 | Helena Brooks | Administrator | Active | W2 | Non-visit | Event closeout / admin approval |
| MOCK-STF-0012 | Nadia Mercer | DON / Clinical Manager | Active | W2 | Non-visit | OASIS QA, POC supervisory, QAPI clinical |
| MOCK-STF-0013 | Caleb Stone | QAPI Chair | Active | W2 | Non-visit | QAPI minutes and closeout |
| MOCK-STF-0014 | Imani Reed | Compliance Officer | Active | W2 | Non-visit | Audit/CAPA validation |
| MOCK-STF-0015 | Owen Park | Policy Admin | Active | W2 | Non-visit | Policy evidence and attestations |
| MOCK-STF-0016 | Marta Silva | Governing Body Chair | Active | W2 | Non-visit | GB approval / final governance |
| MOCK-STF-0017 | Maya Hart, MD | Ordering Provider | Active | Contractor | Non-agency visit | POC/order signature |
| MOCK-STF-0018 | Noah Singh, MD | Ordering Provider | Active | Contractor | Non-agency visit | POC/order signature |
| MOCK-STF-0019 | Rhea Chen | Medical Records / OASIS Coordinator | Active | W2 | Non-visit | OASIS submission QA/indexing |
| MOCK-STF-0020 | Jules Carter | HR / Credentialing Reviewer | Active | W2 | Non-visit | Credential/training validation |
| MOCK-STF-0021 | Samira Holt | Risk Manager | Active | W2 | Non-visit | Risk/CAPA follow-up |
| MOCK-STF-0022 | Devon Ibarra | IT/Security Owner | Active | W2 | Non-visit | Access/security evidence |

Added leadership/staff count: 12.

## Assignment Matrix

| Patient | RN | LVN | HHA/CNA | PT | OT | Physician | OASIS signer |
|---|---|---|---|---|---|---|---|
| Soren Eriksson | Amara Okonkwo | Valentina Ramirez-Cruz | Marcus Vasquez | N/A | N/A | Maya Hart, MD | Amara Okonkwo |
| Minh Nguyen | Takeshi Nakamura | Valentina Ramirez-Cruz | Marcus Vasquez | N/A | N/A | Maya Hart, MD | Takeshi Nakamura |
| Adaeze Chowdhury | Amara Okonkwo | Valentina Ramirez-Cruz | Yemi Mwangi | Erik Johansson | Fatima Adekoya | Noah Singh, MD | Amara Okonkwo |
| Tobias Johansson | Takeshi Nakamura | Valentina Ramirez-Cruz | Yemi Mwangi | Erik Johansson | Fatima Adekoya | Noah Singh, MD | Takeshi Nakamura |
| Blessing Adeyemi | Amara Okonkwo | Valentina Ramirez-Cruz | Marcus Vasquez | N/A | Fatima Adekoya | Maya Hart, MD | Amara Okonkwo |
| Fumiko Nakamura | Takeshi Nakamura | Valentina Ramirez-Cruz | Yemi Mwangi | Erik Johansson | Fatima Adekoya | Noah Singh, MD | Takeshi Nakamura |

## Defect Map

| Defect | Patient | Issue | Expected detecting event | Blocks completion? |
|---|---|---|---|---|
| DEF-JAN2026-0001 | Soren Eriksson | Clean control | Routine chart audit control sample | No |
| DEF-JAN2026-0002 | Minh Nguyen | Missing translated education attestation | OASIS/clinical documentation audit | No |
| DEF-JAN2026-0003 | Adaeze Chowdhury | Facility fall precautions not mirrored on POC | Fall-risk audit and QAPI trend review | No, if corrected/tracked |
| DEF-JAN2026-0004 | Tobias Johansson | PT frequency mismatch | Therapy recertification audit | No, if order clarification is generated |
| DEF-JAN2026-0005 | Blessing Adeyemi | High-risk med teaching and wound frequency inconsistency | Medication reconciliation, wound-care audit, CAPA review | Yes |
| DEF-JAN2026-0006 | Fumiko Nakamura | OASIS/POC wound mismatch and anticoagulant coordination gap | High-priority clinical audit and QAPI CAPA | Yes |

## January Event Support

| Event | Patients | Staff / signers |
|---|---|---|
| January OASIS Readiness Review | All six patients | Amara Okonkwo, Takeshi Nakamura, Nadia Mercer, Rhea Chen |
| January POC / Physician Signature Tracking | All six patients | Amara Okonkwo, Takeshi Nakamura, Nadia Mercer, Maya Hart, Noah Singh, Rhea Chen |
| January Clinical Record Audit | All six patients | Nadia Mercer, Imani Reed, Rhea Chen, Samira Holt |
| January QAPI Committee Evidence Package | Minh, Adaeze, Tobias, Blessing, Fumiko | Helena Brooks, Nadia Mercer, Caleb Stone, Imani Reed, Marta Silva, Samira Holt |
| January CAPA / PIP Follow-up | Adaeze, Tobias, Blessing, Fumiko | Nadia Mercer, Caleb Stone, Imani Reed, Samira Holt |
| January Staffing / Training / Credentialing | All six patients for coverage; staff registry for credentialing | Jules Carter, Nadia Mercer, Helena Brooks |
| January Incident / Risk Review | Adaeze, Tobias, Blessing, Fumiko | Nadia Mercer, Imani Reed, Samira Holt |
| January Policy / Access / Security Review | No patient records required | Owen Park, Jules Carter, Devon Ibarra |

## Documents Each Patient Can Generate

| Patient | Documents |
|---|---|
| Soren Eriksson | OASIS SOC, Plan of Care, med reconciliation note, routine chart audit sample, physician order signature tracker |
| Minh Nguyen | OASIS SOC, Plan of Care, COPD teaching note, medication education addendum, documentation gap audit |
| Adaeze Chowdhury | OASIS SOC, Plan of Care, PT evaluation, OT evaluation, fall-risk audit, care coordination note |
| Tobias Johansson | OASIS recertification, Plan of Care recert, PT reassessment, visit-frequency audit, physician order clarification |
| Blessing Adeyemi | OASIS SOC, Plan of Care, wound flow sheet, high-risk medication education, medication reconciliation CAPA, wound-order clarification |
| Fumiko Nakamura | OASIS SOC, Plan of Care, wound audit, medication reconciliation audit, high-priority QAPI sample, CAPA package, physician order correction |

## Signature / Approval Capability

| Capability | Qualified staff |
|---|---|
| OASIS completion/signature | Amara Okonkwo, Takeshi Nakamura, Nadia Mercer as QA/supervisory backup |
| Agency clinical POC signature | Amara Okonkwo, Takeshi Nakamura, Nadia Mercer |
| Physician POC/order signature | Maya Hart, MD; Noah Singh, MD |
| QAPI minutes signature | Caleb Stone; Nadia Mercer; Marta Silva when governance-level review is required |
| QAPI event closeout | Caleb Stone; Helena Brooks; Nadia Mercer |
| CAPA validation | Imani Reed; Samira Holt; Caleb Stone |
| Governing Body approval | Marta Silva |
| Credential/training validation | Jules Carter |
| Security/access evidence | Devon Ibarra |

## Workforce Warnings

- Priya Patel is pending and cannot perform independent patient care, sign OASIS, sign POC, or approve events.
- Lena Quiñones is on leave and cannot be assigned visits or counted as available staffing.
- Pierre Lemoine is inactive and cannot be assigned care or counted as available staffing.
- Valentina Ramirez-Cruz is active LVN and may perform delegated LVN work, but cannot independently complete OASIS or sign POC.
- HHA/CNA staff can support care delivery and coordination, but cannot perform RN-only signatures.

## Readiness Result

- Patient count: 6.
- Clinician/staff count: 22.
- Added leadership/staff count: 12.
- Every patient has a mock MRN, assigned RN, ACCM, physician, OASIS facts, POC facts, and audit/QAPI relevance.
- Every active visit assignment has a qualified clinician.
- Known blockers before a full January dry run: DEF-JAN2026-0005 and DEF-JAN2026-0006 require correction evidence or CAPA tracking before clean final closeout.

No PHI confirmation: all patient IDs, MRNs, addresses, phone numbers, emails, provider IDs, staff IDs, licenses, and names are mock dry-run values.
