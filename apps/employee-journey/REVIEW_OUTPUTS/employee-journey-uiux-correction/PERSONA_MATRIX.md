# Synthetic Persona Matrix

All records are deterministic UI fixtures. The preview toolbar always displays `SYNTHETIC PERSONA PREVIEW` and `No official employee record is shown.`

| Persona | Fixture ID | Role / secondary role | Current stage | Covered QA scenarios |
|---|---|---|---|---|
| Taylor Demo RN | `DEMO-RN-001` | Registered Nurse | First 30 days | RN new hire; Day 30 employee |
| Jordan Demo LVN | `DEMO-LVN-001` | Licensed Vocational Nurse | Ongoing / recurring | LVN active field worker; RN oversight |
| Morgan Demo HHA | `DEMO-HHA-001` | Home Health Aide | Ongoing / recurring | HHA 14-day visit due; annual hours due |
| Casey Demo PTA | `DEMO-PTA-001` | Physical Therapist Assistant | Day 90 evaluation | PTA awaiting PT supervision; Day 90 employee |
| Avery Demo DON | `DEMO-DON-001` | Director of Nursing / Registered Nurse | Annual | DON annual review; multiple-role employee |
| Riley Demo Administrator | `DEMO-ADM-001` | Administrator | Policy update | Administrator policy update |
| Jamie Demo Office Employee | `DEMO-OFFICE-001` | Office Employee | Day 60 check-in | General office employee; Day 60 employee |
| Skyler Demo Field Driver | `DEMO-DRIVER-001` | Field Driver | Document renewal | Expiring driver’s license; expiring auto insurance |
| Parker Demo Returning From Leave | `DEMO-RTW-001` | Returning Employee | Leave / return to work | Employee on leave; returning employee; waiting on HR clearance |
| Cameron Demo Separating Employee | `DEMO-SEP-001` | Office Employee | Separation / offboarding | Separating employee |

## Fixture behavior

- Persona selection updates the query string and all route links.
- No persona state is written to local storage, a cookie, an API, or a database.
- Role-applicable competency examples are selected by fixture.
- Morgan’s HHA visit language is explicitly tied to the synthetic skilled-patient assignment. It is not presented as a universal HHA cadence.
- Avery’s secondary RN role supplies the multiple-role test without adding an eleventh preview persona.
- Day 30, Day 60, and Day 90 behavior is represented by Taylor, Jamie, and Casey respectively.

