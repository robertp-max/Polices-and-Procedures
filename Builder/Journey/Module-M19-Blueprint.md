# Module M19 Blueprint

## 1. Module Overview
- Module ID: M19
- Module Name: HHA and CNA Role and Observation
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 18-22 minutes
- Training Type: Applied clinical awareness
- Target Roles: CNA, HHA, RN (supervising), LVN (supervising), DON, Compliance
- Policy Source: HHA Scope of Practice Policy, Observation and Reporting Policy, Vital Signs Policy

## 2. Learning Objectives
- Define the scope of practice for HHA and CNA in home health.
- Communicate observed patient changes to the supervising nurse promptly and accurately.
- Document vital signs with all required elements.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 4 min | Section C: 5 min | Section D: 3 min | Summary: 2 min | Assessment: 3 min
- Total: 24 minutes

---

## 4. Section A - HHA and CNA Role and Scope

**Lessons Covered:** 96

**Plain Language Content**
- HHA and CNA services are defined by the care plan and supervised by a licensed clinician.
- HHAs assist with personal care, ADLs, light housekeeping, and basic health observations.
- CNAs may take vital signs, assist with treatments, and observe clinical status per state scope and care plan.
- Neither HHAs nor CNAs make clinical judgments or perform skilled nursing tasks.

**Home Health Examples**
- HHA assists with bathing and grooming as listed in the care plan; does not perform wound care.
- CNA takes vital signs and documents them in the EMR per the care plan order.

---

## 5. Section B - Communication to Supervising Nurse

**Lessons Covered:** 97

**Plain Language Content**
- Clear, timely communication from HHA/CNA to the supervising nurse is a patient safety requirement.
- Use objective language: describe what you see, hear, smell, or measure.
- Use SBAR (Situation, Background, Assessment, Recommendation) or equivalent when reporting.
- Report immediately — do not wait until the next visit or shift.

**Home Health Examples**
- HHA calls the supervising RN mid-visit: "Mrs. Johnson is more confused than usual and refuses breakfast — this is different from yesterday."
- CNA texts the supervisor through the agency-approved channel: "Blood pressure 170/105 — patient says she has a headache. Requesting guidance."

---

## 6. Section C - Observation and Reporting Changes in Condition

**Lessons Covered:** 98

**Plain Language Content**
- Changes in condition include new or worsening symptoms, behavior changes, falls, medication non-compliance, and functional decline.
- HHAs and CNAs are often the first to observe changes because they visit most frequently.
- If in doubt, report — it is never wrong to escalate a concern.

**Home Health Examples**
- HHA notices the patient is more short of breath than usual and reports to the RN before leaving the home.
- CNA observes a bruise on the patient's arm and reports it per both mandatory reporting and clinical escalation protocols.

---

## 7. Section D - Vital Signs Documentation

**Lessons Covered:** 99

**Plain Language Content**
- Vital signs must include: date, time, values (temperature, pulse, respiration, blood pressure, O2 saturation, pain), and any patient symptoms or response.
- Do not round or estimate vital sign values.
- Document vital signs in the EMR immediately after measurement.

**Home Health Examples**
- CNA documents: "BP 138/86, Pulse 78, Resp 18, O2 98% on room air, Pain 2/10. Patient reports feeling well."
- HHA documents that she was unable to take temperature per the care plan order because the patient declined the measurement, and notifies the supervising nurse.

---

## 8. Summary
- HHA/CNA scope is defined by the care plan; do not exceed it.
- Report changes in condition immediately using objective, specific language.
- Vital signs documentation must be complete and contemporaneous.

---

## 9. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** The scope of services for an HHA primarily includes:
- A. Administering medications and skilled nursing tasks
- B. Personal care, ADL assistance, and basic observation per the care plan
- C. Completing OASIS assessments
- D. Making independent treatment decisions
- **Correct: B** | HHA scope is defined by the care plan and clinical supervision.

**Q2.** When an HHA or CNA observes a change in patient condition, the required action is:
- A. Manage the change independently
- B. Report to the supervising nurse promptly
- C. Document and wait until the next scheduled visit
- D. Ask the patient's family for guidance
- **Correct: B** | Changes in condition must be immediately escalated to the supervising nurse.

**Q3.** Effective communication from HHA to supervising nurse should be:
- A. Verbal reports only
- B. Clear, objective, timely, and specific using approved communication methods
- C. Only when the nurse specifically asks
- D. Informal text messages to personal phones
- **Correct: B** | Objective and timely reporting supports safe clinical oversight.

**Q4.** Vital sign documentation must include:
- A. Only the blood pressure
- B. All measured values, date, time, and any patient symptoms or response
- C. Only documentation when abnormal
- D. Rounded values for ease
- **Correct: B** | Complete vital sign documentation supports clinical trend analysis.

**Q5.** Which scenario requires immediate communication to the supervising nurse?
- A. The patient's favorite TV show is on during the visit
- B. The patient is more confused, has new shortness of breath, or shows other clinical changes
- C. The patient wants a schedule change
- D. The patient complains about the weather
- **Correct: B** | Clinical deterioration signs require immediate escalation.

---

## 10. LMS JSON

```json
{
  "module": { "id": "M19", "name": "HHA and CNA Role and Observation", "version": "1.0.0",
    "durationMinutes": { "min": 18, "target": 22, "max": 24 },
    "targetRoles": ["CNA","HHA","RN","LVN","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M19-S01", "title": "HHA and CNA Role and Scope", "durationMinutes": 5, "lessons": [96] },
    { "id": "M19-S02", "title": "Communication to Supervising Nurse", "durationMinutes": 4, "lessons": [97] },
    { "id": "M19-S03", "title": "Observation and Reporting Changes", "durationMinutes": 5, "lessons": [98] },
    { "id": "M19-S04", "title": "Vital Signs Documentation", "durationMinutes": 3, "lessons": [99] },
    { "id": "M19-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M19-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M19", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
