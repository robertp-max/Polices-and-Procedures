# Module M23 Blueprint

## 1. Module Overview
- Module ID: M23
- Module Name: Skilled Nursing Procedures
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 15-18 minutes
- Training Type: Applied clinical awareness
- Target Roles: RN, LVN, DON, Compliance
- Policy Source: Wound Care Protocol, Clinical Escalation Policy, Patient/Family Teaching Documentation Policy

## 2. Learning Objectives
- Perform and document wound care and dressing changes per care plan.
- Recognize triggers for clinical escalation and apply structured communication.
- Document patient and family teaching with required elements.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 5 min | Section C: 4 min | Summary: 2 min | Assessment: 3 min
- Total: 21 minutes

---

## 4. Section A - Wound Care and Dressing Changes

**Lessons Covered:** 112

**Plain Language Content**
- Wound care requires a written physician order specifying the dressing type, frequency, and wound care approach.
- Assess the wound at each dressing change: measure dimensions, describe the wound bed, drainage, and surrounding skin.
- Document changes from the prior visit and escalate deterioration or infection signs immediately.

**Home Health Examples**
- RN measures and photographs the wound, documents findings with wound staging, and compares to the prior note.
- LVN identifies purulent drainage and discoloration not present at the prior visit and contacts the supervising RN immediately.

---

## 5. Section B - Clinical Escalation and Emergency Response

**Lessons Covered:** 113

**Plain Language Content**
- Clinical escalation is required when: a patient's condition changes unexpectedly, vitals are significantly abnormal, or safety is at risk.
- Use SBAR when communicating with the physician or receiving clinician.
- Document all escalation calls: time, person contacted, information provided, and orders received.

**Home Health Examples**
- RN uses SBAR to report a patient's acute onset of respiratory distress to the physician.
- LVN calls 911 for a patient who loses consciousness, begins CPR, and activates agency emergency protocol.

---

## 6. Section C - Patient and Family Teaching Documentation

**Lessons Covered:** 114

**Plain Language Content**
- Every teaching session must be documented with: topic, teaching method, barriers, learner's comprehension level, and plan for re-teaching if needed.
- Teaching is documented in the clinical visit note and referenced in the care plan.
- Deficits in understanding require follow-up documentation in subsequent visits.

**Home Health Examples**
- RN documents: "Taught patient self-injection technique using demonstration and return demonstration. Patient demonstrated correctly ×2. Written materials provided in English."
- LVN identifies language barrier and documents referral to interpreter service for next visit.

---

## 7. Summary
- Wound care requires physician order, aseptic technique, complete assessment, and escalation of deterioration.
- Clinical escalation uses SBAR; document all calls with time, content, and outcomes.
- Teaching documentation must show method, barriers, comprehension, and follow-up plan.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Wound care documentation must include:
- A. Dressing type only
- B. Assessment findings, treatment performed, patient response, and changes from prior visit
- C. A photograph only
- D. Verbal supervisor report
- **Correct: B** | Comprehensive wound documentation supports continuity and compliance.

**Q2.** Clinical escalation to the physician is triggered by:
- A. Patient preference for a different clinician
- B. Significant condition changes, abnormal vitals, or safety concerns requiring clinical guidance
- C. Scheduling inconvenience
- D. Minor patient discomfort
- **Correct: B** | Clinical escalation addresses genuine clinical concerns.

**Q3.** SBAR communication when escalating a clinical concern should include:
- A. Only the patient's name
- B. Situation, background, assessment, and recommendation — followed by documentation of the call
- C. Informal summary without documentation
- D. Only the vital signs
- **Correct: B** | SBAR ensures complete, structured clinical communication.

**Q4.** Patient and family teaching documentation must include:
- A. Only a pamphlet receipt
- B. Topic, method, barriers, learner comprehension, and re-teaching plan if needed
- C. Only the clinician's teaching time
- D. Content from CMS-approved materials only
- **Correct: B** | Teaching documentation must demonstrate effectiveness and continuity.

**Q5.** A patient becomes unresponsive during a home visit. The immediate action is:
- A. Wait for family to arrive
- B. Call 911 if indicated, initiate BLS if trained, and notify the agency per protocol
- C. Complete the visit before calling
- D. Call the DON before calling 911
- **Correct: B** | Life-threatening emergencies require immediate 911 activation.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M23", "name": "Skilled Nursing Procedures", "version": "1.0.0",
    "durationMinutes": { "min": 15, "target": 18, "max": 21 },
    "targetRoles": ["RN","LVN","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M23-S01", "title": "Wound Care and Dressing Changes", "durationMinutes": 5, "lessons": [112] },
    { "id": "M23-S02", "title": "Clinical Escalation and Emergency Response", "durationMinutes": 5, "lessons": [113] },
    { "id": "M23-S03", "title": "Patient and Family Teaching Documentation", "durationMinutes": 4, "lessons": [114] },
    { "id": "M23-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M23-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M23", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
