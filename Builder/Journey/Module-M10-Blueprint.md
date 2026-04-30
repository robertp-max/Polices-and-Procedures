# Module M10 Blueprint

## 1. Module Overview
- Module ID: M10
- Module Name: Field and Visit Safety
- Track: D (Safety and OSHA)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 25-28 minutes
- Training Type: Awareness-level
- Target Roles: RN, LVN, CNA, HHA, Admin, DON, Compliance, HR
- Policy Source: Field Safety Policy, Safe Patient Handling Policy, Heat Illness Prevention Policy, Injury Reporting Policy

## 2. Learning Objectives
- Apply safe patient handling and fall prevention techniques.
- Follow driving and personal safety protocols during field visits.
- Recognize and prevent heat illness in field conditions.
- Report workplace injuries immediately per agency policy.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 6 min | Section B: 6 min | Section C: 6 min | Section D: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 30 minutes

---

## 4. Section A - Safe Patient Handling and Fall Prevention

**Lessons Covered:** 55, 56

**Plain Language Content**
- Safe patient handling prevents musculoskeletal injuries to staff and fall injuries to patients.
- Always assess fall risk and follow the care plan before assisting with mobility or transfers.
- Use assistive devices as prescribed; never lift a patient manually without proper training or equipment.

**Home Health Examples**
- CNA assesses fall risk and confirms which transfer technique the care plan specifies before assisting with ambulation.
- HHA uses the prescribed gait belt and reports that the patient's strength has decreased to the supervising nurse.
- RN updates the fall risk assessment after the patient reports a recent fall at home.

**Role Awareness Cues**
- Clinical roles: reassess fall risk regularly and update the care plan when risk changes.
- DON: ensure care plans reflect current fall risk level and interventions.

---

## 5. Section B - Driving, Field Safety, and Personal Safety

**Lessons Covered:** 57, 58

**Plain Language Content**
- Driving to visits is work; traffic laws and agency vehicle safety policy apply at all times.
- Never use a mobile phone while driving unless hands-free and in compliance with agency policy.
- Before entering a patient home, assess the environment for safety risks; trust instincts and leave if immediate risk is present.

**Home Health Examples**
- RN notices aggressive pets and an unclear pathway to the door; contacts the supervisor before proceeding.
- LVN activates agency field safety check-in protocol at the start and end of each visit.
- HHA avoids discussing visit schedules with unknown callers.

**Role Awareness Cues**
- All field roles: follow driving safety and personal safety protocols on every visit.
- Admin: maintain field check-in/check-out tracking.
- DON: respond promptly to missed field check-ins.

---

## 6. Section C - Heat Illness Prevention and Injury Reporting

**Lessons Covered:** 59, 60

**Plain Language Content**
- Heat illness progresses rapidly: heat cramps → heat exhaustion → heat stroke.
- Staff working in warm environments must hydrate, take rest breaks, and recognize early symptoms.
- Any workplace injury — however minor — must be reported to the agency the same day it occurs.

**Home Health Examples**
- HHA working in a home without air conditioning during summer notices dizziness and reports to supervisor immediately.
- CNA trips on a patient's rug and reports the incident even though no injury is apparent.
- Admin processes same-day injury reports and initiates OSHA documentation.

**Role Awareness Cues**
- All field roles: report any injury or near-miss immediately — do not wait.
- Admin/HR: coordinate OSHA documentation and workers' compensation reporting.
- DON: investigate injury patterns for QAPI and prevention.

---

## 7. Section D - Emergency Response and Fire Safety

**Lessons Covered:** 61, 62

**Plain Language Content**
- Be prepared to call 911 during visits; know the patient's address before entering.
- If a patient experiences acute distress, initiate emergency response immediately per clinical protocol.
- Identify fire hazards at the patient home; educate patients on basic fire safety.

**Home Health Examples**
- RN calls 911 after a patient loses consciousness; initiates basic life support while waiting for EMS.
- HHA identifies a blocked exit at a patient's home and educates the patient/family about fire safety.

**Role Awareness Cues**
- All clinical roles: know the emergency response sequence and carry emergency contact information.
- DON: ensure all staff are trained in field emergency response annually.

---

## 8. Summary
- Safe patient handling requires care plan compliance and fall risk assessment.
- Follow driving and personal safety protocols; leave if immediate risk is present.
- Report all injuries and heat illness symptoms immediately.
- Be prepared to activate emergency response at any patient visit.

---

## 9. Assessment

**Format:** 7 MCQ | Pass: 80% (6/7)

**Q1.** Before assisting a patient with mobility, what must be assessed first?
- A. The patient's mood
- B. The patient's fall risk and the appropriate technique per the care plan
- C. Room temperature
- D. Whether family is present
- **Correct: B** | Mobility assistance must follow assessed risk and care plan instructions.

**Q2.** Agency driving safety policy during visits requires:
- A. Use of personal GPS only
- B. Following traffic laws, maintaining vehicle safety, and reporting accidents per agency policy
- C. Speeding only when late to a visit
- D. Using a mobile phone freely while driving
- **Correct: B** | Driving to patient visits is covered by agency driving safety policy.

**Q3.** Early symptoms of heat illness include:
- A. Only severe sunburn
- B. Heavy sweating, weakness, nausea, dizziness, or confusion
- C. Mild fatigue only
- D. Cold skin and shivering
- **Correct: B** | Early recognition allows prompt intervention before escalation.

**Q4.** A workplace injury during a home visit must be:
- A. Addressed personally without agency involvement
- B. Reported to the agency immediately and documented per OSHA and agency requirements
- C. Reported only if hospitalization is required
- D. Mentioned at the next team meeting
- **Correct: B** | All injuries require same-day reporting and documentation.

**Q5.** If a home visit environment poses an immediate personal safety risk, the correct action is:
- A. Proceed with the visit and document concerns afterward
- B. Leave the premises and report to the supervisor immediately
- C. Ask the patient to resolve the risk first
- D. Call the family
- **Correct: B** | Personal safety is the priority; do not enter an unsafe environment.

**Q6.** Fire hazards identified at a patient home require:
- A. Ignoring minor hazards
- B. Documenting, educating the patient/caregiver, and escalating per agency policy if unresolved
- C. Removing hazards personally during the visit
- D. Ending all care immediately
- **Correct: B** | Hazard identification requires documentation, education, and escalation.

**Q7.** A patient becomes unresponsive during a home visit. The immediate response is:
- A. Wait for family before calling 911
- B. Call 911 if indicated, initiate basic life support if trained, and notify the agency per protocol
- C. Complete the visit first
- D. Call the DON before calling 911
- **Correct: B** | Life safety emergencies require immediate 911 activation.

---

## 10. LMS JSON

```json
{
  "module": { "id": "M10", "name": "Field and Visit Safety", "version": "1.0.0",
    "durationMinutes": { "min": 25, "target": 28, "max": 30 },
    "targetRoles": ["RN","LVN","CNA","HHA","Admin","DON","Compliance","HR"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M10-S01", "title": "Safe Patient Handling and Fall Prevention", "durationMinutes": 6, "lessons": [55,56] },
    { "id": "M10-S02", "title": "Driving and Personal Safety", "durationMinutes": 6, "lessons": [57,58] },
    { "id": "M10-S03", "title": "Heat Illness and Injury Reporting", "durationMinutes": 6, "lessons": [59,60] },
    { "id": "M10-S04", "title": "Emergency Response and Fire Safety", "durationMinutes": 5, "lessons": [61,62] },
    { "id": "M10-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M10-QZ", "questionCount": 7, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M10", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
