# Module M26 Blueprint

## 1. Module Overview
- Module ID: M26
- Module Name: Therapy Supervision, Reassessment, and Documentation
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 18-22 minutes
- Training Type: Administrative and oversight awareness
- Target Roles: DON, Compliance
- Policy Source: Therapy Assistant Supervision Policy, Functional Assessment Policy, Adaptive Equipment Policy

## 2. Learning Objectives
- Explain therapy assistant supervision requirements.
- Describe functional assessment tools and reassessment requirements.
- Verify adaptive equipment and therapy documentation standards.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 6 min | Section C: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 23 minutes

---

## 4. Section A - Therapy Assistant Supervision

**Lessons Covered:** 123

**Plain Language Content**
- PTAs (Physical Therapist Assistants) work under the supervision of a Physical Therapist.
- COTAs (Certified Occupational Therapy Assistants) work under the supervision of an Occupational Therapist.
- CMS and California licensing requirements define supervision ratios and visit type restrictions for assistants.

**Home Health Examples**
- DON verifies that the supervising therapist maintains CMS-required contact and oversight of assistant visits.
- Compliance audits assistant visit notes for proper references to the supervising therapist's plan.

---

## 5. Section B - Functional Assessment Tools and Reassessment

**Lessons Covered:** 124, 125

**Plain Language Content**
- Standardized functional assessments (e.g., Berg Balance Scale, FIM) objectively measure patient function and document progress.
- Reassessment is required at recertification and when there is a significant change in the patient's functional status.
- Reassessment determines whether skilled therapy services remain medically necessary.

**Home Health Examples**
- PT completes a Berg Balance Scale assessment at SOC and at recertification to document functional change.
- DON reviews reassessment documentation during chart audits for completeness and clinical reasoning.

---

## 6. Section C - Adaptive Equipment, Home Modification, and Therapy Documentation

**Lessons Covered:** 126, 127

**Plain Language Content**
- Adaptive equipment recommendations (grab bars, raised toilet seats, reachers) must be clinically justified and documented.
- Education on safe equipment use is required and must be documented with comprehension verification.
- Therapy visit notes must document skilled interventions, patient response, and progress toward goals.

**Home Health Examples**
- OT recommends a bathtub bench based on fall risk assessment and documents clinical rationale and patient education.
- PT documents: "Patient performed 3x10 hip abductor exercises at 30% BW resistance, demonstrating improved balance from 45s to 60s single-leg stand. Goals on track."

---

## 7. Summary
- Therapy assistants require therapist supervision per CMS and California licensing standards.
- Functional assessments measure progress objectively; reassessment is required at recertification and with status changes.
- Adaptive equipment requires clinical justification, education, and documentation.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Therapy assistants (PTAs, COTAs) must:
- A. Practice fully independently in home health
- B. Work under supervision of the supervising therapist per licensure and CMS requirements
- C. Have separate care plans from the supervising therapist
- D. Obtain independent physician orders
- **Correct: B** | Therapy assistants require therapist supervision.

**Q2.** Functional assessment tools are used to:
- A. Satisfy documentation requirements only
- B. Objectively measure patient function, track progress, and guide clinical decision-making
- C. Replace clinical observation
- D. Determine billing codes
- **Correct: B** | Standardized tools provide objective functional measurement.

**Q3.** Therapy reassessment at recertification requires:
- A. A new physician referral
- B. Evaluation of current functional status, progress toward goals, and continued skilled need
- C. Only documentation of prior assessment
- D. Administrative approval
- **Correct: B** | Recertification reassessment determines ongoing skilled need.

**Q4.** Adaptive equipment recommendations must be:
- A. Based on equipment availability only
- B. Clinically justified, documented, and supported by patient/family education
- C. Selected by the patient independently
- D. Ordered by nursing only
- **Correct: B** | Equipment recommendations require clinical justification and education.

**Q5.** Therapy documentation standards require visit notes to:
- A. Show only session attendance
- B. Document skilled interventions, patient response, and measurable progress toward goals
- C. Be weekly summaries only
- D. Require physician co-signature on each note
- **Correct: B** | Therapy notes must demonstrate skilled necessity and functional progress.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M26", "name": "Therapy Supervision, Reassessment, and Documentation", "version": "1.0.0",
    "durationMinutes": { "min": 18, "target": 22, "max": 23 },
    "targetRoles": ["DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M26-S01", "title": "Therapy Assistant Supervision", "durationMinutes": 5, "lessons": [123] },
    { "id": "M26-S02", "title": "Functional Assessment and Reassessment", "durationMinutes": 6, "lessons": [124,125] },
    { "id": "M26-S03", "title": "Adaptive Equipment and Documentation", "durationMinutes": 5, "lessons": [126,127] },
    { "id": "M26-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M26-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M26", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
