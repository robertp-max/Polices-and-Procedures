# Reviewer Checklist — QA-FM-001
Auditor compliance verification checklist:

- [ ] **Patient Demographics verified**: Patient name, MRN, and DOB matches synthetic record `MOCK-PT-Q2-0009` exactly.
- [ ] **Clinician details verified**: License expiration and credentials verified against `MOCK-CLIN-Q2-0001`.
- [ ] **Defect detection confirmed**: Seeded discrepancy was successfully populated into the form findings block.
- [ ] **Downstream compliance action triggered**: Proper triggered action documents generated and placed under `05_TRIGGERED_ACTIONS/`.
- [ ] **No PHI**: Checked that no real identifiers exist.

---
*Brad Training Mock Test — Synthetic Data Only — No PHI*
