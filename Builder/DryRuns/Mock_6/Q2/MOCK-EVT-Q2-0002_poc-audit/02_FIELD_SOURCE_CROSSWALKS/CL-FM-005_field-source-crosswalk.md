# Field-Source Crosswalk — CL-FM-005
Maps the filled fields of the form back to the synthetic source JSON records.

| Form Field ID | Form Label | Filled Value | Source File | Source Path | Verification Method |
|---|---|---|---|---|---|
| Client Name | Client / Patient Name | Edna Brickwell | `clients.q2-2026.mock.json` | `[0].firstName` + `lastName` | Match text |
| Medical Record # | MRN | MOCK-MRN-900001 | `clients.q2-2026.mock.json` | `[0].mrn` | Match text |
| Diagnosis | Diagnoses / ICD-10 | CHF, diabetes | `clients.q2-2026.mock.json` | `[0].primaryDiagnoses` | Match array |
| Clinician Name | Assigned Clinician | Mariana Thornfield | `clinicians.q2-2026.mock.json` | `[0].firstName` + `lastName` | Match text |
| Findings | Audit Discrepancies | PT-0002: POC MISSING PHYSICIAN SIGNATURE; PT-0023: POC not updated after status change to therapy re-eval pending; PT-0033: Duplicate/conflicting POC versions (v1.0 and v2.0 both active, different SN frequencies); PT-0001: Clean POC | `q2-events.mock.json` | `[0].expectedFindings` | Match array |

---
*Brad Training Mock Test — Synthetic Data Only — No PHI*
