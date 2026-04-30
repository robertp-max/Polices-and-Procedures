# Module M18 Blueprint

## 1. Module Overview
- Module ID: M18
- Module Name: Patient Education, Nutrition, and Home Risk Assessment
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 15-18 minutes
- Training Type: Clinical awareness
- Target Roles: RN, LVN, CNA, HHA, DON, Compliance
- Policy Source: Patient Education Policy, Nutrition Monitoring Policy, DME Safety Policy, Home Environment Safety Policy

## 2. Learning Objectives
- Document patient and caregiver education with evidence of comprehension.
- Monitor nutrition status and report changes.
- Conduct and document a home environment risk assessment.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 4 min | Section B: 5 min | Section C: 4 min | Summary: 2 min | Assessment: 3 min
- Total: 20 minutes

---

## 4. Section A - Patient and Caregiver Education

**Lessons Covered:** 92

**Plain Language Content**
- Education must be provided to the patient and/or caregiver on disease management, medications, and care plan goals.
- Documentation must show: topic, method of teaching, barriers addressed, and learner's demonstrated comprehension.
- Teach-back is the gold standard for verifying understanding.

**Home Health Examples**
- RN teaches a patient's daughter how to monitor blood glucose, uses teach-back to confirm understanding, and documents the session.
- LVN provides written materials in the patient's primary language and documents receipt.
- DON reviews education documentation in audits to verify completeness.

---

## 5. Section B - Nutrition Awareness and DME Safety

**Lessons Covered:** 93, 94

**Plain Language Content**
- Monitor for nutritional risk at every visit: changes in weight, appetite, food intake, or functional ability to prepare food.
- Any nutrition concern should be escalated to the RN for assessment and possible referral.
- DME (Durable Medical Equipment) requires patient/caregiver education on safe use and maintenance before first use.

**Home Health Examples**
- HHA notices the patient has barely touched food all week and reports to the supervising RN.
- RN teaches a patient how to use the new walker, confirms safe technique, and documents equipment education.
- CNA documents that the patient reported decreased appetite and that the RN was notified.

---

## 6. Section C - Home Environment Risk Assessment

**Lessons Covered:** 95

**Plain Language Content**
- At SOC and at each visit, identify physical and environmental hazards that could harm the patient or caregiver.
- Common hazards: fall hazards (rugs, cords), emergency exit access, unsafe storage of medications or chemicals.
- Document identified hazards, educate patient/caregiver, and escalate if unresolved.

**Home Health Examples**
- RN identifies a loose bathroom rug and educates the family about fall risk; documents recommendation for removal.
- LVN notices unsecured medications in reach of children and counsels the patient on safe storage.
- HHA reports poor lighting in a hallway as a safety concern to the supervising nurse.

---

## 7. Summary
- Teach-back verifies education comprehension; document topic, method, barriers, and outcome.
- Report nutrition changes early; escalate to RN for assessment.
- Home risk assessment is an ongoing responsibility; document hazards and educate patients.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Patient education documentation must show:
- A. That education was attempted only
- B. Topic, method, barriers addressed, and the learner's demonstrated comprehension
- C. Only date and time
- D. Patient's verbal agreement
- **Correct: B** | Education documentation must demonstrate content, method, and comprehension.

**Q2.** Nutrition monitoring in home health focuses on:
- A. Food preferences only
- B. Changes in intake, weight, or function that may indicate nutritional risk
- C. Preparing meals for the patient
- D. Recommending supplements independently
- **Correct: B** | Nutrition monitoring identifies risk for clinical escalation.

**Q3.** DME safety education must include:
- A. Equipment brand preferences
- B. Correct use, maintenance, and safety precautions for the specific equipment
- C. General handouts only
- D. Verbal instructions without documentation
- **Correct: B** | DME education requires device-specific instruction and documentation.

**Q4.** A home environment risk assessment identifies:
- A. Patient furniture preferences
- B. Physical, safety, and environmental hazards affecting patient or caregiver safety
- C. Whether the home has adequate storage
- D. Only structural defects
- **Correct: B** | Home risk assessment targets all hazards affecting care safety.

**Q5.** A home safety hazard identified during a visit requires:
- A. Ignoring minor hazards
- B. Documentation, patient/caregiver education, and escalation if unresolved
- C. Correcting the hazard personally during the visit
- D. Discontinuing care until the hazard is resolved
- **Correct: B** | Hazard identification requires documentation, education, and escalation.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M18", "name": "Patient Education, Nutrition, and Home Risk Assessment", "version": "1.0.0",
    "durationMinutes": { "min": 15, "target": 18, "max": 20 },
    "targetRoles": ["RN","LVN","CNA","HHA","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M18-S01", "title": "Patient and Caregiver Education", "durationMinutes": 4, "lessons": [92] },
    { "id": "M18-S02", "title": "Nutrition Awareness and DME Safety", "durationMinutes": 5, "lessons": [93,94] },
    { "id": "M18-S03", "title": "Home Environment Risk Assessment", "durationMinutes": 4, "lessons": [95] },
    { "id": "M18-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M18-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M18", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
