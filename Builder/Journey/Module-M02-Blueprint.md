# Module M02 Blueprint

## 1. Module Overview
- Module ID: M2
- Module Name: Patient Rights and Responsibilities
- Track: A (Core Compliance Foundation)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 15-18 minutes
- Training Type: Awareness-level
- Target Roles: RN, LVN, CNA, HHA, Admin, DON, Compliance, HR
- Policy Source: Patient Rights Policy, Advance Directive Policy, Grievance Policy

### Detailed Overview
Every patient receiving home health services has legally protected rights. This module ensures all workforce members understand those rights, know how to honor them in daily practice, and follow the correct process when patients raise concerns or file complaints.

### Detailed Description
Learners complete three focused content sections covering patient rights and responsibilities, advance directives, and patient complaints and grievances. Practical home health examples illustrate how each concept applies in the field. The module ends with a 5-question assessment.

## 2. Learning Objectives
- Identify the core patient rights in home health.
- Explain the agency's obligations regarding advance directives.
- Describe the complaint and grievance process.
- Apply patient rights principles in daily patient interactions.

## 3. Screen Flow and Time Budget
- Intro screen: 2 min
- Section A - Patient Rights and Responsibilities: 5 min
- Section B - Advance Directives: 4 min
- Section C - Patient Complaints and Grievances: 4 min
- Summary: 2 min
- Assessment: 3 min
- Total: 20 minutes

---

## 4. Section A - Patient Rights and Responsibilities

**Lessons Covered:** 14

**Plain Language Content**
- All patients have the right to receive care with dignity, respect, and without discrimination.
- Patients have the right to be informed about their care and to make decisions, including the right to refuse.
- Patients have responsibilities too: providing accurate health information and cooperating with the care plan.

**Home Health Examples**
- A CNA ensures the patient is informed before starting personal care and obtains verbal consent.
- An Admin staff member provides the patient rights document at first contact.
- An RN explains treatment options and documents the patient's informed decision.

**Role Awareness Cues**
- Clinical roles: honor patient rights in every interaction and document consent.
- Admin/HR: ensure rights documents are included in the admission packet.
- DON/Compliance: monitor for rights violations and act on complaints.

**Section Completion Check (non-graded)**
- Learner confirms: "I understand patient rights and my responsibility to honor them."

---

## 5. Section B - Advance Directives

**Lessons Covered:** 15

**Plain Language Content**
- An advance directive is a legal document expressing a patient's wishes for medical care if they cannot communicate.
- The agency must ask about advance directives at admission and document the patient's status.
- Staff cannot override a valid advance directive.

**Home Health Examples**
- RN asks the patient about advance directives at admission and documents the response per agency policy.
- HHA knows not to perform resuscitation if a DNR is on file and the patient arrests; they call 911 and follow the plan.
- Admin ensures the advance directive is scanned and accessible in the patient record.

**Role Awareness Cues**
- Clinical roles: ask, document, and comply with advance directive status.
- Admin: ensure documentation is complete and accessible.
- DON: ensure staff are trained and compliance is monitored.

**Section Completion Check (non-graded)**
- Learner confirms: "I know what an advance directive is and how to respond to one."

---

## 6. Section C - Patient Complaints and Grievances

**Lessons Covered:** 16

**Plain Language Content**
- Any patient or family member may file a complaint or grievance at any time.
- All complaints must be acknowledged, documented, and routed per agency policy.
- CMS requires a written response to formal grievances.

**Home Health Examples**
- Admin receives a patient complaint about visit timing, documents it, and routes it to the supervisor for follow-up.
- RN documents a patient's expressed dissatisfaction and escalates to the DON per grievance policy.
- Compliance tracks complaint trends and identifies patterns for QAPI.

**Role Awareness Cues**
- All roles: accept and route complaints; do not dismiss or discourage them.
- Admin: formal intake and tracking.
- DON/Compliance: investigation, resolution, and written response within required timeframes.

**Section Completion Check (non-graded)**
- Learner confirms: "I know how to accept and route a patient complaint or grievance."

---

## 7. Summary
- All patients have protected rights that must be honored in every interaction.
- Advance directives must be documented and followed.
- All complaints must be taken seriously, documented, and resolved per policy.

---

## 8. Assessment

**Format:** 5 MCQ and scenario-MCQ | Pass: 80% (4/5)

**Q1.** Which best describes a patient's right in home health?
- A. Rights apply only to Medicare patients
- B. All patients have the right to receive care with dignity and make informed decisions
- C. Rights replace policy requirements
- D. Rights apply only at admission
- **Correct: B** | Rights are universal across all patients and interactions.

**Q2.** An HHA is about to start personal care and the patient says they want to stop. What is the correct response?
- A. Continue care as scheduled
- B. Respect the refusal, document it, and notify the supervising nurse
- C. Ask the family to convince the patient
- D. Leave without documenting
- **Correct: B** | Patient autonomy requires respecting and documenting refusals.

**Q3.** At admission, the RN asks the patient about advance directives. The patient has none. What is the required action?
- A. Skip the documentation since there is no directive
- B. Document that no advance directive exists per agency policy
- C. Create an advance directive for the patient
- D. Defer the question to the physician
- **Correct: B** | Advance directive status must always be documented, even if none exists.

**Q4.** A family member calls to complain about the quality of care. The first action is to:
- A. Explain that the care was correct
- B. Listen, acknowledge, document, and route per the grievance process
- C. Tell them to call back when the DON is available
- D. Inform the billing department
- **Correct: B** | All complaints require formal acknowledgment and routing.

**Q5.** What is the agency's obligation when a valid DNR is on file for a patient?
- A. Confirm with the physician before following it
- B. Follow the documented directive and comply with the patient's wishes
- C. Notify the family before acting
- D. Defer to the most senior clinician on site
- **Correct: B** | Valid advance directives must be followed as documented.

---

## 9. Enforcement Logic
- Not applicable as a hard gate for M2 alone; M1 must be completed first.
- M2 completion required as prerequisite for Modules 12 (Patient Rights application) and clinical care assignment.

---

## 10. Evidence Model
Required fields: training_module_id, module_version, user_id, completion_status, score, completion_timestamp, policy_acknowledgment, evidence_type=TRAINING_COMPLETION

---

## 11. LMS JSON

```json
{
  "module": {
    "id": "M2",
    "name": "Patient Rights and Responsibilities",
    "version": "1.0.0",
    "type": "onboarding-awareness",
    "durationMinutes": { "min": 15, "target": 18, "max": 20 },
    "targetRoles": ["RN","LVN","CNA","HHA","Admin","DON","Compliance","HR"],
    "passThresholdPercent": 80,
    "maxAttempts": 3
  },
  "sections": [
    { "id": "M2-S00", "type": "intro", "title": "Why Patient Rights Matter", "durationMinutes": 2 },
    { "id": "M2-S01", "type": "content", "title": "Patient Rights and Responsibilities", "durationMinutes": 5, "lessons": [14] },
    { "id": "M2-S02", "type": "content", "title": "Advance Directives", "durationMinutes": 4, "lessons": [15] },
    { "id": "M2-S03", "type": "content", "title": "Patient Complaints and Grievances", "durationMinutes": 4, "lessons": [16] },
    { "id": "M2-S05", "type": "summary", "title": "Summary", "durationMinutes": 2 }
  ],
  "assessment": {
    "id": "M2-QZ",
    "questionCount": 5,
    "passThresholdPercent": 80,
    "questions": [
      { "id": "M2-Q1", "correctIndex": 1, "prompt": "Which best describes a patient right in home health?", "options": ["Only Medicare patients","Dignity and informed decisions for all","Replace policy","Only at admission"] },
      { "id": "M2-Q2", "correctIndex": 1, "prompt": "Patient refuses personal care mid-visit. Best response?", "options": ["Continue care","Respect, document, notify nurse","Ask family","Leave without documenting"] },
      { "id": "M2-Q3", "correctIndex": 1, "prompt": "Patient has no advance directive at admission. Required action?", "options": ["Skip documentation","Document no directive exists","Create one for patient","Defer to physician"] },
      { "id": "M2-Q4", "correctIndex": 1, "prompt": "Family calls to complain about care. First action?", "options": ["Explain care was correct","Acknowledge, document, route per process","Tell them to call back","Inform billing"] },
      { "id": "M2-Q5", "correctIndex": 1, "prompt": "Valid DNR on file. Agency obligation?", "options": ["Confirm with physician first","Follow directive as documented","Notify family first","Defer to senior clinician"] }
    ]
  },
  "evidence": {
    "requiredFields": ["training_module_id","module_version","user_id","completion_status","score","completion_timestamp","evidence_type"],
    "recordTemplate": { "training_module_id": "M2", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" }
  }
}
```
