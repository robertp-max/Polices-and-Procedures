# Field-Source Crosswalk — QA-FM-001
Maps the filled fields of the form back to the synthetic source JSON records.

| Form Field ID | Form Label | Filled Value | Source File | Source Path | Verification Method |
|---|---|---|---|---|---|
| Client Name | Client / Patient Name | Dorothy Langford | `clients.q2-2026.mock.json` | `[0].firstName` + `lastName` | Match text |
| Medical Record # | MRN | MOCK-MRN-900009 | `clients.q2-2026.mock.json` | `[0].mrn` | Match text |
| Diagnosis | Diagnoses / ICD-10 | COPD, cognitive_impairment, fall_risk | `clients.q2-2026.mock.json` | `[0].primaryDiagnoses` | Match array |
| Clinician Name | Assigned Clinician | Mariana Thornfield | `clinicians.q2-2026.mock.json` | `[0].firstName` + `lastName` | Match text |
| Findings | Audit Discrepancies | PT-0009: QAPI monitoring — complex multi-discipline client, clean documentation; PT-0043: Evidence present but NOT audit-ready — supporting documents scanned but not indexed; PT-0037: MISSING PHYSICIAN ORDER — services ongoing 60+ days without signed orders | `q2-events.mock.json` | `[0].expectedFindings` | Match array |

---
*Brad Training Mock Test — Synthetic Data Only — No PHI*
