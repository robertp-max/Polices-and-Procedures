# KB-011 — The 32 Audit Workflows Explained

**Audience:** Compliance Officer, Clinical Manager. **Time to read:** 4 minutes.

CES runs **32 audit workflows** — no more, no less. Adding a 33rd requires
a governance exception. The set is balanced across four domains.

## The breakdown

| Domain | Count | Cadence |
|---|---|---|
| Clinical | 18 | All monthly |
| Compliance | 7 | 1 monthly · 5 quarterly · 1 annual |
| HR | 4 | 3 monthly · 1 quarterly |
| Risk / Safety | 3 | 1 monthly · 1 quarterly · 1 annual |

## Clinical (18 — monthly)

| ID | Audit |
|---|---|
| `CL-WF-POC-AUDIT-001` | Plan of Care |
| `CL-WF-OASIS-AUDIT-001` | OASIS Accuracy |
| `CL-WF-VISIT-DOC-AUDIT-001` | Visit Documentation |
| `CL-WF-RECORD-COMPLETE-AUDIT-001` | Clinical Record Completeness |
| `CL-WF-MEDICAL-NECESSITY-AUDIT-001` | Medical Necessity |
| `CL-WF-MEDICATION-AUDIT-001` | Medication Management |
| `CL-WF-INFECTION-AUDIT-001` | Infection Control |
| `CL-WF-CARE-COORD-AUDIT-001` | Care Coordination |
| `CL-WF-REHOSPITALIZATION-AUDIT-001` | Rehospitalization Review |
| `CL-WF-HOMEBOUND-AUDIT-001` | Homebound Status |
| `CL-WF-ORDERS-AUDIT-001` | Orders & Physician Signature |
| `CL-WF-RECERT-AUDIT-001` | Recertification |
| `CL-WF-DISCHARGE-AUDIT-001` | Discharge Documentation |
| `CL-WF-SUPERVISORY-AUDIT-001` | Supervisory Visit |
| `CL-WF-MISSED-VISIT-AUDIT-001` | Missed Visit |
| `CL-WF-TIMELINESS-AUDIT-001` | Documentation Timeliness |
| `CL-WF-PATIENT-ED-AUDIT-001` | Patient Education Documentation |
| `CL-WF-PAIN-AUDIT-001` | Pain Assessment & Reassessment |

## Compliance (7)

| ID | Audit | Cadence |
|---|---|---|
| `CO-WF-HIPAA-AUDIT-001` | HIPAA Compliance | quarterly |
| `CO-WF-PATIENT-RIGHTS-AUDIT-001` | Patient Rights Compliance | quarterly |
| `CO-WF-INCIDENT-AUDIT-001` | Incident Response | monthly |
| `CO-WF-BREACH-AUDIT-001` | Breach Notification | quarterly |
| `CO-WF-FWA-AUDIT-001` | Fraud, Waste & Abuse | quarterly |
| `CO-WF-VENDOR-AUDIT-001` | Vendor / BA Compliance | quarterly |
| `CO-WF-POLICY-AUDIT-001` | Policy & Procedure Adherence | annual |

## HR (4)

| ID | Audit | Cadence |
|---|---|---|
| `HR-WF-TRAINING-AUDIT-001` | Training Compliance | monthly |
| `HR-WF-COMPETENCY-AUDIT-001` | Competency Validation | quarterly |
| `HR-WF-LICENSE-AUDIT-001` | License & Certification Verification | monthly |
| `HR-WF-EMP-HEALTH-AUDIT-001` | Employee Health & TB Compliance | monthly |

## Risk / Safety (3)

| ID | Audit | Cadence |
|---|---|---|
| `RM-WF-OSHA-AUDIT-001` | OSHA / Workplace Safety | quarterly |
| `RM-WF-EXPOSURE-AUDIT-001` | Infection Exposure Incident Review | monthly |
| `RM-WF-EMERGENCY-AUDIT-001` | Emergency Preparedness | annual |

## Why exactly 32

These cover every CMS Condition of Participation, HIPAA Privacy/Security
rule, OSHA general-duty clause, and OIG compliance program element
applicable to a home health agency. The set was capped to prevent QAPI
overload — only `audit`-type workflows feed QAPI, so the QAPI committee
can actually process the findings.

## Each audit is a workflow, not a single task

When a monthly audit fires, you'll see **5 execution units** for it on
the board (one per phase: preparation → documentation → review → signature
→ audit). That's normal.

## Related

- [KB-019 — Corrective Action Plans (CAPA)](KB-019-CAPA.md)
- Developer doc: `Documentation/12-Audit-Workflow-Catalog.md`
