# Field-Source Crosswalk — HR-FM-016
Maps the filled fields of the form back to the synthetic source JSON records.

| Form Field ID | Form Label | Filled Value | Source File | Source Path | Verification Method |
|---|---|---|---|---|---|
| Client Name | Client / Patient Name | Agnes Whitford | `clients.q2-2026.mock.json` | `[0].firstName` + `lastName` | Match text |
| Medical Record # | MRN | MOCK-MRN-900017 | `clients.q2-2026.mock.json` | `[0].mrn` | Match text |
| Diagnosis | Diagnoses / ICD-10 | diabetes | `clients.q2-2026.mock.json` | `[0].primaryDiagnoses` | Match array |
| Clinician Name | Assigned Clinician | Derek Mulholland | `clinicians.q2-2026.mock.json` | `[0].firstName` + `lastName` | Match text |
| Findings | Audit Discrepancies | CLIN-0002: Expired CPR (11/2025) — actively providing care to multiple clients; CLIN-0005: Annual competency expired (08/2025) — 10 months overdue; CLIN-0014: LVN license pending renewal since 04/2026 — actively providing visits (PT-0017); CLIN-0015: Expired CPR (12/2025); CLIN-0020: QAPI Coordinator assigned to direct care visits (PT-0054) — role mismatch | `q2-events.mock.json` | `[0].expectedFindings` | Match array |

---
*Brad Training Mock Test — Synthetic Data Only — No PHI*
