# Workflow: Employee Onboarding (HR-OB-001-WF)

**Workflow ID:** `HR-OB-001-WF`  
**Domain:** Human Resources (HR)  
**Linked Policy:** `HR-OT-001` — Employee Orientation and Onboarding Policy  
**Risk Band:** `moderate`  
**Cadence Kind:** `event_based`  
**Cadence Interval:** `on_demand`

---

## Trigger

This workflow is triggered **on-demand** when a new employee is hired or when an existing employee requires re-onboarding (e.g., role change, extended leave). An HR coordinator or Administrator creates the onboarding event via the Journey system (`/journey`).

The `event_id` format: `employee_onboarding-{employee_id}-{YYYYMMDD}-01`

---

## Steps

| # | Step | Role | Required |
|---|---|---|---|
| 1 | HR creates employee profile in the system | HR Coordinator | Yes |
| 2 | Assign onboarding journey to employee | HR Coordinator | Yes |
| 3 | Employee completes orientation module (SCORM) | Employee | Yes |
| 4 | Employee reads and acknowledges all required policies | Employee | Yes |
| 5 | Employee completes and signs orientation acknowledgment form | Employee | Yes |
| 6 | Supervisor completes first supervisory visit (if field staff) | Supervisor | Conditional |
| 7 | Supervisor signs supervisory visit form | Supervisor | Conditional |
| 8 | Employee completes Appendix F requirements (if applicable) | Employee | Conditional |
| 9 | HR reviews completion and verifies all attestations | HR Coordinator | Yes |
| 10 | HR marks onboarding complete | HR Coordinator | Yes |
| 11 | Upload completion evidence | HR Coordinator | Yes |
| 12 | Administrator certifies the onboarding event | Administrator | Yes |

---

## Dependencies

- Employee must have an active user account in the system
- Onboarding journey modules must be published
- Required policies must be in `PUBLISHED` state

---

## Inputs

| Input | Description | Required |
|---|---|---|
| Employee ID | New employee's system ID | Yes |
| Hire date | Effective date of employment | Yes |
| Role assignment | Position and access role | Yes |
| Branch assignment | Which office location | Yes |

---

## Outputs

| Output | Type | Where Stored |
|---|---|---|
| Orientation completion record | Journey progress record | `journeyStore` |
| Policy attestation records | Signed acknowledgments | `regulatoryExecutionStore` |
| Supervisory visit form | Signed form instance | eCIgn system |
| Onboarding completion certificate | Evidence document | Evidence under `event_id` |

---

## Linked Forms

| Form ID | Form Name | Required Stage |
|---|---|---|
| `HR-FM-001` | New Employee Orientation Acknowledgment | Step 5 |
| `HR-FM-002` | First Supervisory Visit Record | Steps 6-7 |
| `HR-FM-003` | Appendix F Compliance Form | Step 8 |

---

## Linked Tasks

- Employee task: Complete orientation modules
- Employee task: Sign policy acknowledgment forms
- Supervisor task: Complete first supervisory visit
- HR task: Verify and certify completion

---

## Evidence Generated

| Evidence Kind | Description | `event_id` |
|---|---|---|
| `signed_form` | Orientation acknowledgment form | `employee_onboarding-{emp_id}-{date}-01` |
| `training_record` | Orientation module completion | Same `event_id` |
| `signed_form` | First supervisory visit form | Same `event_id` |

---

## Approval Body

| Stage | Role | Basis |
|---|---|---|
| Completion verification | HR Coordinator | `HR-OT-001` policy |
| Certification | `admin` | CMS CoP §484.80 |

---

## Timeline & SLA

| Milestone | Timing |
|---|---|
| Onboarding event created | Day 1 of employment |
| Orientation module deadline | Within 5 business days |
| Policy acknowledgments deadline | Within 5 business days |
| First supervisory visit deadline | Within 30 days (CMS requirement for HHAs) |
| Full onboarding certification | Within 45 days of hire |
| SLA warning | 7 days before certification deadline |

---

## Exception Handling

| Exception | Required Action |
|---|---|
| Employee unable to complete online modules | Arrange in-person session; document completion method |
| Supervisor unavailable for first visit | Assign backup supervisor; document in visit record |
| Employee does not complete on time | HR escalates to manager; document in employee file |

---

## Quality Indicators

- 100% of new employees complete orientation within 5 business days
- 100% of field staff receive first supervisory visit within 30 days
- Zero uncertified onboarding events older than 45 days

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-01-01 | Initial workflow definition | HR Director |
