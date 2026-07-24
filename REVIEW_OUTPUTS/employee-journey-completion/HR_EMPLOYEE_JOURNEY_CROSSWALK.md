# HR Employee-Journey Crosswalk

_Master Correction Prompt §14. Status: **DOCUMENTED (employee-safe status/action per HR-FM); dedicated lifecycle UI surfacing pending**._

Employee-safe view only — no HR-only details or privileged investigation content. HR forms are
defined canonically in `formsLibraryDataset.ts` / `formsLibraryContentHR_CL.ts` (63 `HR-FM-*`
records) and titled in `formTitles.generated.ts`.

| Form | Employee-safe status / action | Lifecycle phase |
|---|---|---|
| HR-FM-003 Interview & Applicant Evaluation | HR-owned; status only | Pre-hire |
| HR-FM-004 Reference Check | HR-owned; status only | Pre-hire |
| HR-FM-005 OIG/SAM Monthly Exclusion | Status tile (Cleared/Under review/Action required) | Pre-hire + monthly |
| HR-FM-006 License/Cert Primary Source Verification | Status; upload renewal via Documents | Pre-hire + ongoing |
| HR-FM-007 New Hire Onboarding & Orientation Checklist | Employee completes items | Day 1 / week 1 |
| HR-FM-008 Annual Performance Evaluation | Scheduled; Performance workspace | Ongoing |
| HR-FM-012 TB Screening & Questionnaire | Clearance status; submit via Documents | Pre-hire + annual |
| HR-FM-013 Hepatitis B Declination | Acknowledge/decline | Day 1 / week 1 |
| HR-FM-016 Clinical Staff Competency Validation | Supervisor checkoff (Competencies) | 30-day + annual |
| HR-FM-017 Training Attendance & Completion | Auto from training record | Ongoing |
| HR-FM-018 Background Check Authorization | Authorize; status | Pre-hire |
| HR-FM-021 Annual Health Screening Log | Submit; status | Annual |
| HR-FM-029 Anti-Harassment Acknowledgment | Acknowledge (biennial CA) | Onboarding + biennial |
| HR-FM-030 Emergency Drill Participation | Participate; AAR evidence | Drills |
| HR-FM-031 Job Description Acknowledgment | Acknowledge | Day 1 |
| HR-FM-033 Mandatory Reporter Attestation | Attest | Onboarding |
| HR-FM-037 Confidentiality / NDA | Acknowledge | Day 1 |
| HR-FM-038 Competency Remediation | Supervisor-owned; employee sees plan | Triggered |
| HR-FM-040 Leave Request | Employee submits | Leave |
| HR-FM-041 Return-to-Work Clearance | Status | Return |
| HR-FM-042 Accommodation Request | Employee submits | Leave/Return |
| HR-FM-052 Workers' Comp Intake | Employee submits | Triggered |
| HR-FM-055 Separation Intake | HR-owned; status | Separation |
| HR-FM-056 Asset Return | Employee checklist | Separation |
| HR-FM-057 Benefits Exit Packet | Employee receives | Separation |
| HR-FM-058 Exit Interview | Optional | Separation |

## Implementation status

The crosswalk is documented and the underlying forms render via `/journey/forms/:id`.
**Not yet built:** the full lifecycle UI (§12) that threads these into pre-hire → Day 1 →
30/60/90 → ongoing → leave/return → separation phases with per-item employee-safe status
tiles. This table is the build spec.
