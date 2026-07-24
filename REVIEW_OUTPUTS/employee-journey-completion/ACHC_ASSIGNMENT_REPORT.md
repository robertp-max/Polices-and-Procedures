# ACHC Assignment Report

_Master Correction Prompt §6. Source: `annualAssignmentMap.generated.ts` (`ACHC_CLINICAL_AUDIENCE`) + `annualAdvancedCatalog.ts` (`getAchcBundle`). Status: **IMPLEMENTED / VERIFIED**._

## All 12 ACHC modules mapped

`ACHC-ART-M01` Cultural Awareness · `M02` Emergency & Disaster Preparedness · `M03` Complaints
& Grievances · `M04` HIPAA Privacy & Security · `M05` Infection Control · `M06` Communication
Barriers · `M07` Workplace & Patient Safety (OSHA) · `M08` Patient Rights & Responsibilities ·
`M09` Corporate Compliance · `M10` Ethics in Healthcare · `M11` TB & Blood Borne Pathogens ·
`M12` Medical Device Act.

Verified live (persona taylor-rn): all 12 render Q1–Q4 with **"Launch module"** (canonical
STANDALONE player) — **zero "Unavailable" badges**.

## Audience

`ACHC_CLINICAL_AUDIENCE = [DON, RN, LVN, HHA, PT, PTA, OT, COTA, SLP, MSW]` is applied
explicitly to **all 12** modules, overriding the raw `modules.ts` `roles` field. This fixes
the confirmed `roles: 'ALL'` leak on **M04 / M07 / M09** (which otherwise surfaced for every
role including office/leadership) and adds **DON**, which the raw field-worker set omitted.

Excluded from the bundle: general office, HR-only, finance-only, driver-only employees.
**ADM** is not a primary audience member (`admSecondaryOnly: true`) — ADM oversees/approves
the bundle but only takes it when the same user holds a verified clinical secondary role.

## Page design

`getAchcBundle` surfaces per module: title, quarter grouping (Q1–Q4), method, duration, pass
threshold, policy basis chips, dedup "Also satisfies" chips, and a certificate-gate banner
(all 12 within the plan year). Every module launches the canonical ACHC standalone player
(`/journey/module/ACHC-ART-Mnn`, same-tab).
