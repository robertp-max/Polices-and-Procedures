# Module M21 Blueprint

## 1. Module Overview
- Module ID: M21
- Module Name: HHA and CNA Documentation and Supervision
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 18-22 minutes
- Training Type: Applied clinical awareness
- Target Roles: RN, LVN, CNA, HHA, DON, Compliance
- Policy Source: HHA Documentation Policy, Care Plan Competency Policy, Supervision Policy

## 2. Learning Objectives
- Provide emotionally and culturally sensitive care to patients and caregivers.
- Demonstrate care plan competencies required for assigned patients.
- Complete HHA/CNA documentation accurately and on time.
- Meet supervision expectations per CMS and agency policy.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 4 min | Section B: 4 min | Section C: 6 min | Section D: 4 min | Summary: 2 min | Assessment: 3 min
- Total: 25 minutes

---

## 4. Section A - Emotional and Cultural Support

**Lessons Covered:** 104

**Plain Language Content**
- Emotional and cultural sensitivity is an active skill, not a passive attitude.
- Ask patients about their preferences, background, and concerns; do not assume.
- Provide a supportive, non-judgmental presence — especially during personal care.

**Home Health Examples**
- HHA recognizes a patient is distressed after a family visit and offers to pause care to check in.
- CNA learns that a patient observes specific dietary restrictions and relays this to the supervising RN.

---

## 5. Section B - Care Plan Competency

**Lessons Covered:** 105

**Plain Language Content**
- Competency means you can safely perform every task listed in the care plan.
- If you are assigned a task you have not been trained to perform, notify the supervising nurse before attempting it.
- Annual competency verification ensures skills match current patient assignments.

**Home Health Examples**
- HHA is assigned to a new patient with a feeding tube; notifies the RN that she needs orientation to this care before providing it.
- CNA demonstrates correct ROM technique during supervisory visit competency check-off.

---

## 6. Section C - HHA/CNA Documentation

**Lessons Covered:** 106

**Plain Language Content**
- HHA/CNA documentation must accurately reflect the care delivered during the visit.
- Complete the visit note in the EMR before leaving the patient's home.
- Document: tasks performed, time spent, patient response, and any observations reported to the nurse.

**Home Health Examples**
- HHA completes the EVV (Electronic Visit Verification) clock-in at the start and clock-out at the end of the visit.
- CNA documents all tasks performed, notes that the patient was agreeable, and records the blood pressure per care plan.

---

## 7. Section D - Supervision Expectations

**Lessons Covered:** 107

**Plain Language Content**
- CMS requires supervisory visits by an RN at least every 14 days when an HHA is providing care under a skilled nursing plan.
- During supervisory visits, the RN observes care delivery, addresses concerns, and ensures competency.
- HHA/CNA should treat supervisory visits as collaborative learning, not disciplinary events.

**Home Health Examples**
- RN schedules a supervisory visit to co-visit with an HHA and observes personal care technique.
- HHA asks the RN during the supervisory visit about a patient's new behavior to get clinical guidance.

---

## 8. Summary
- Emotional and cultural sensitivity enhances trust and care quality.
- If you are not competent for a care plan task, notify the nurse before attempting it.
- Complete documentation in the EMR before leaving the patient's home.
- Supervisory visits are for learning and compliance — participate actively.

---

## 9. Assessment

**Format:** 6 MCQ | Pass: 80% (5/6)

**Q1.** Emotional and cultural support in home care requires:
- A. Imposing caregiver values on the patient
- B. Providing compassionate, culturally sensitive care that respects the patient's background and needs
- C. Avoiding all emotional conversations
- D. Standardized care regardless of patient background
- **Correct: B** | Emotional and cultural sensitivity is integral to person-centered care.

**Q2.** Care plan competency means that HHAs and CNAs must:
- A. Develop their own care approaches independently
- B. Demonstrate the skills required to safely implement all care plan tasks for the assigned patient
- C. Only complete tasks they are personally comfortable with
- D. Ignore unfamiliar care plan tasks
- **Correct: B** | Competency must match care plan requirements.

**Q3.** HHA/CNA documentation must be:
- A. Completed by the supervising nurse on their behalf
- B. Accurate, timely, and reflect all care delivered during the visit
- C. Informal notes only
- D. Completed weekly
- **Correct: B** | Documentation must accurately reflect care delivered.

**Q4.** Supervisory visits of HHAs must occur at a minimum:
- A. Only at hire
- B. At least every 14 days per CMS requirements when the HHA is under a skilled nursing plan
- C. Once per year
- D. Only when the patient requests it
- **Correct: B** | CMS defines supervisory visit frequency requirements.

**Q5.** If an HHA is asked to perform a task outside their care plan scope:
- A. Perform the task if they feel qualified
- B. Decline, document, and notify the supervising nurse
- C. Ask a coworker for permission
- D. Complete the task and report at week's end
- **Correct: B** | Out-of-scope requests must be declined and escalated.

**Q6.** The primary purpose of care plan competency assessment is:
- A. Creating disciplinary records
- B. Ensuring HHA/CNA skills match the patient's specific care plan needs
- C. Reducing care plan complexity
- D. Administrative requirement only
- **Correct: B** | Competency assessment directly links staff skills to patient-specific needs.

---

## 10. LMS JSON

```json
{
  "module": { "id": "M21", "name": "HHA and CNA Documentation and Supervision", "version": "1.0.0",
    "durationMinutes": { "min": 18, "target": 22, "max": 25 },
    "targetRoles": ["RN","LVN","CNA","HHA","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M21-S01", "title": "Emotional and Cultural Support", "durationMinutes": 4, "lessons": [104] },
    { "id": "M21-S02", "title": "Care Plan Competencies", "durationMinutes": 4, "lessons": [105] },
    { "id": "M21-S03", "title": "HHA/CNA Documentation", "durationMinutes": 6, "lessons": [106] },
    { "id": "M21-S04", "title": "Supervision Expectations", "durationMinutes": 4, "lessons": [107] },
    { "id": "M21-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M21-QZ", "questionCount": 6, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M21", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
