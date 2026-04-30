# Module M11 Blueprint

## 1. Module Overview
- Module ID: M11
- Module Name: Emergency Preparedness Core
- Track: D (Safety and OSHA)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 22-25 minutes
- Training Type: Awareness-level
- Target Roles: RN, LVN, CNA, HHA, Admin, DON, Compliance, HR, IT (L65, L67)
- Policy Source: Emergency Preparedness Plan, Continuity of Operations Plan, Communication Policy

## 2. Learning Objectives
- Describe employee roles during agency emergencies.
- Explain the emergency communication plan structure.
- Apply patient risk stratification for emergency prioritization.
- Identify continuity of operations and disaster documentation requirements.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 5 min | Section C: 5 min | Section D: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 27 minutes

---

## 4. Section A - Emergency Preparedness Overview and Employee Role

**Lessons Covered:** 63, 64

**Plain Language Content**
- Emergency preparedness ensures the agency can continue providing care during natural disasters, power outages, or public health emergencies.
- Every employee has a defined role in the emergency plan; know your assignment before an emergency occurs.
- Staff must know how to activate the emergency plan and who to contact.

**Home Health Examples**
- RN reviews the emergency plan annually and knows who their emergency supervisor contact is.
- HHA knows to attempt patient contact and report to the agency within 2 hours of a declared emergency.
- Admin maintains emergency contact lists and activates notification calls.

**Role Awareness Cues**
- All roles: review your emergency role assignment annually.
- Admin: maintain and test emergency contact lists.
- DON: ensure clinical staff know emergency prioritization procedures.

---

## 5. Section B - Emergency Communication Plan

**Lessons Covered:** 65

**Plain Language Content**
- The emergency communication plan defines how leadership, staff, patients, and families communicate during an emergency.
- Staff must use designated communication channels — not personal social media.
- Communication continues until all at-risk patients are accounted for.

**Home Health Examples**
- A natural disaster occurs; staff check in via the designated emergency hotline rather than calling individual coworkers.
- IT maintains the communication platform and tests it annually.
- Admin activates the robo-call system to contact all active patients.

**Role Awareness Cues**
- All roles: know the emergency communication channel and use it.
- IT: maintain and test communication systems for emergency readiness.
- Admin: activate patient notification per the communication plan.

---

## 6. Section C - Patient Risk Stratification for Emergencies

**Lessons Covered:** 66

**Plain Language Content**
- Not all patients can self-evacuate or access emergency services equally.
- High-risk patients (ventilator-dependent, insulin-dependent, cognitively impaired) are prioritized for contact during emergencies.
- The agency maintains a risk-stratified patient list updated at each episode and recertification.

**Home Health Examples**
- DON reviews the high-risk patient list during emergency drill preparation.
- RN flags a new patient as high-risk at SOC based on ventilator dependency.
- Admin updates the emergency contact list when a patient's condition changes.

**Role Awareness Cues**
- Clinical roles: flag and update risk stratification at each assessment.
- DON/Admin: maintain and act on the risk-stratified emergency list.
- Compliance: audit list accuracy as part of emergency program review.

---

## 7. Section D - Continuity of Operations and Disaster Documentation

**Lessons Covered:** 67, 68

**Plain Language Content**
- Continuity of operations (COOP) ensures critical agency functions continue during an emergency.
- Key functions include patient care delivery, communication, and billing/payroll.
- Disaster documentation captures events, decisions, and patient status for post-event review and regulatory reporting.

**Home Health Examples**
- Admin activates the COOP plan when the primary office is inaccessible and routes to the alternate site.
- RN documents all emergency-related care decisions and patient contacts in real time.
- IT activates backup systems per the COOP plan during a prolonged power outage.

**Role Awareness Cues**
- All roles: maintain documentation even during emergencies.
- IT: ensure backup systems are tested and activated per COOP plan.
- DON: preserve clinical care continuity and document gaps.

---

## 8. Summary
- All staff have a defined emergency role; know it before an emergency occurs.
- Use designated communication channels only during emergencies.
- High-risk patients are prioritized for contact and care continuity.
- Continuity plans and real-time documentation are required during emergencies.

---

## 9. Assessment

**Format:** 6 MCQ | Pass: 80% (5/6)

**Q1.** The primary purpose of emergency preparedness in home health is:
- A. Compliance paperwork only
- B. Ensuring care continuity and safety for patients and staff during emergencies
- C. Only relevant for hurricanes
- D. A leadership responsibility only
- **Correct: B** | Emergency preparedness protects patients and maintains care.

**Q2.** During an emergency, all staff must:
- A. Wait for supervisor instructions before any action
- B. Follow the assigned role in the agency emergency plan
- C. Immediately evacuate all patients
- D. Contact the media
- **Correct: B** | Assigned emergency roles ensure coordinated response.

**Q3.** Patient risk stratification identifies:
- A. Patients by insurance status
- B. Patients with high medical needs who require priority contact during emergencies
- C. Only clinical supervisors' priorities
- D. All patients alphabetically
- **Correct: B** | Risk stratification prioritizes the most vulnerable patients.

**Q4.** Continuity of operations planning ensures:
- A. Normal business hours continue
- B. Critical agency functions continue during and after an emergency
- C. Only IT systems are protected
- D. Patients are auto-transferred to hospitals
- **Correct: B** | COOP maintains care delivery when normal operations are disrupted.

**Q5.** Disaster documentation must be:
- A. Optional during emergencies
- B. Completed in real time and retained for regulatory review and post-event analysis
- C. Only completed by managers
- D. Deferred until after the emergency ends
- **Correct: B** | Documentation during emergencies is both a regulatory and operational requirement.

**Q6.** The emergency communication plan specifies:
- A. Personal social media channels
- B. How staff, patients, and leadership communicate before, during, and after an emergency
- C. Only patient family contact information
- D. The IT department's recovery timeline only
- **Correct: B** | The plan ensures coordinated information flow during emergencies.

---

## 10. LMS JSON

```json
{
  "module": { "id": "M11", "name": "Emergency Preparedness Core", "version": "1.0.0",
    "durationMinutes": { "min": 22, "target": 25, "max": 27 },
    "targetRoles": ["RN","LVN","CNA","HHA","Admin","DON","Compliance","HR","IT"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M11-S01", "title": "Preparedness Overview and Employee Role", "durationMinutes": 5, "lessons": [63,64] },
    { "id": "M11-S02", "title": "Emergency Communication Plan", "durationMinutes": 5, "lessons": [65] },
    { "id": "M11-S03", "title": "Patient Risk Stratification", "durationMinutes": 5, "lessons": [66] },
    { "id": "M11-S04", "title": "Continuity and Disaster Documentation", "durationMinutes": 5, "lessons": [67,68] },
    { "id": "M11-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M11-QZ", "questionCount": 6, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M11", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
