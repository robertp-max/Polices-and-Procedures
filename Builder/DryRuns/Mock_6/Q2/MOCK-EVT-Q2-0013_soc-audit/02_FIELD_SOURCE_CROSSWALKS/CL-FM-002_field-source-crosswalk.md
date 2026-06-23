# Field-Source Crosswalk — CL-FM-002
Maps the filled fields of the form back to the synthetic source JSON records.

| Form Field ID | Form Label | Filled Value | Source File | Source Path | Verification Method |
|---|---|---|---|---|---|
| Client Name | Client / Patient Name | Ethel Blackwood | `clients.q2-2026.mock.json` | `[0].firstName` + `lastName` | Match text |
| Medical Record # | MRN | MOCK-MRN-900025 | `clients.q2-2026.mock.json` | `[0].mrn` | Match text |
| Diagnosis | Diagnoses / ICD-10 | post_surgical, CHF | `clients.q2-2026.mock.json` | `[0].primaryDiagnoses` | Match array |
| Clinician Name | Assigned Clinician | Mariana Thornfield | `clinicians.q2-2026.mock.json` | `[0].firstName` + `lastName` | Match text |
| Findings | Audit Discrepancies | PT-0025: OASIS functional scoring inconsistent with comprehensive assessment (mod assist vs min assist) | `q2-events.mock.json` | `[0].expectedFindings` | Match array |

---
*Brad Training Mock Test — Synthetic Data Only — No PHI*
