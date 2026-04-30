# Module M20 Blueprint

## 1. Module Overview
- Module ID: M20
- Module Name: Personal Care and Safe Assistance
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 18-22 minutes
- Training Type: Applied clinical awareness
- Target Roles: CNA, HHA, DON, Compliance (limited clinical oversight)
- Policy Source: Personal Care Policy, Nutrition Support Policy, Safe Home Environment Policy, ROM/Ambulation Policy

## 2. Learning Objectives
- Provide personal care in compliance with the care plan and patient preferences.
- Follow nutritional support guidelines during meal preparation and feeding assistance.
- Apply safe ambulation, ROM, and home environment safety techniques.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 4 min | Section C: 6 min | Summary: 2 min | Assessment: 3 min
- Total: 22 minutes

---

## 4. Section A - Personal Care Procedures

**Lessons Covered:** 100

**Plain Language Content**
- Personal care includes bathing, grooming, oral hygiene, and dressing — delivered per the care plan and patient preferences.
- Dignity, privacy, and patient autonomy are required in every personal care interaction.
- Always obtain consent before starting and accommodate patient preferences within the care plan.

**Home Health Examples**
- HHA asks the patient whether they prefer a bed bath or shower before starting personal care.
- CNA closes the door and provides a cover during bathing to preserve patient privacy.
- HHA accommodates a patient's request to dress in specific clothing as noted in the care plan.

---

## 5. Section B - Nutrition Support and Meal Preparation

**Lessons Covered:** 101

**Plain Language Content**
- Meal preparation and feeding assistance must follow dietary instructions in the care plan (e.g., soft diet, no concentrated sweets).
- Assist with feeding for patients who cannot self-feed; observe for swallowing difficulties.
- Report changes in intake or swallowing to the supervising nurse.

**Home Health Examples**
- HHA prepares a soft diet meal per the care plan, documents the meal, and notes the patient ate half the portion.
- CNA observes the patient coughing during eating and reports to the supervising RN.

---

## 6. Section C - Safe Home Environment, ROM, and Ambulation

**Lessons Covered:** 102, 103

**Plain Language Content**
- ROM (range of motion) exercises must be performed per therapist instructions in the care plan.
- Ambulation assistance requires gait belt use as specified in the care plan, proper guarding technique, and use of prescribed assistive devices.
- Identify and report home safety hazards at each visit.

**Home Health Examples**
- HHA performs passive ROM per PT's instructions in the care plan and documents completion.
- CNA ambulates patient using a gait belt and hemi-walker as specified, guarding the weaker side.
- HHA notices a new area rug blocking the hallway and reports it to the supervising nurse.

---

## 7. Summary
- Personal care follows the care plan and patient preferences; privacy and dignity are non-negotiable.
- Follow dietary orders during meal preparation; report swallowing concerns immediately.
- ROM and ambulation must comply with therapist instructions; report home safety hazards promptly.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Personal care must be provided:
- A. Based on the HHA's judgment
- B. Per the care plan, respecting patient dignity and preferences
- C. As quickly as possible to complete more visits
- D. Only when family is present
- **Correct: B** | Personal care follows the care plan and patient autonomy.

**Q2.** When assisting a patient with meals, the HHA/CNA should:
- A. Choose foods based on personal preference
- B. Follow dietary care plan instructions and report intake concerns to the supervising nurse
- C. Prepare any food the patient requests regardless of dietary orders
- D. Only assist with food preparation, not feeding
- **Correct: B** | Meal assistance must comply with care plan dietary instructions.

**Q3.** Range of motion and ambulation assistance must:
- A. Follow the HHA's training background independently
- B. Follow the care plan, therapist instructions, and safe handling techniques
- C. Only be performed during physical therapy visits
- D. Be skipped if the patient says they are tired
- **Correct: B** | ROM and ambulation require care plan compliance and safe technique.

**Q4.** During personal care, patient refusal must be:
- A. Overridden for the patient's health
- B. Respected, documented, and reported to the supervising nurse
- C. Managed by the family
- D. Escalated immediately to the administrator
- **Correct: B** | Patient refusals require respect, documentation, and clinical notification.

**Q5.** Safe home environment responsibilities for HHA/CNA include:
- A. Performing structural repairs
- B. Identifying and reporting hazards at each visit
- C. Purchasing safety equipment
- D. Rearranging furniture permanently
- **Correct: B** | HHA/CNA role includes hazard identification and reporting.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M20", "name": "Personal Care and Safe Assistance", "version": "1.0.0",
    "durationMinutes": { "min": 18, "target": 22, "max": 24 },
    "targetRoles": ["CNA","HHA","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M20-S01", "title": "Personal Care Procedures", "durationMinutes": 5, "lessons": [100] },
    { "id": "M20-S02", "title": "Nutrition Support and Meal Preparation", "durationMinutes": 4, "lessons": [101] },
    { "id": "M20-S03", "title": "Safe Home Environment, ROM, and Ambulation", "durationMinutes": 6, "lessons": [102,103] },
    { "id": "M20-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M20-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M20", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
