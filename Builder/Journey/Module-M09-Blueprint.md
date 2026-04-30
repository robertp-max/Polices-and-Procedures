# Module M09 Blueprint

## 1. Module Overview
- Module ID: M9
- Module Name: OSHA and Workplace Safety
- Track: D (Safety and OSHA)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 15-18 minutes
- Training Type: Awareness-level
- Target Roles: RN, LVN, CNA, HHA, Admin, DON, Compliance, HR
- Policy Source: IIPP Policy, Workplace Violence Prevention Plan (SB 553), HazCom Policy

## 2. Learning Objectives
- Describe Cal/OSHA IIPP requirements and agency safety program.
- Explain the Workplace Violence Prevention Plan obligations under SB 553.
- Apply hazard communication standards and Safety Data Sheets (SDS).

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 5 min | Section C: 4 min | Summary: 2 min | Assessment: 3 min
- Total: 21 minutes

---

## 4. Section A - Workplace Safety Overview and IIPP

**Lessons Covered:** 51, 52

**Plain Language Content**
- Cal/OSHA requires every employer to have an Injury and Illness Prevention Program (IIPP).
- The IIPP includes hazard identification, corrective action, employee training, and periodic workplace inspections.
- All staff are responsible for reporting unsafe conditions immediately.

**Home Health Examples**
- HHA notices a frayed electrical cord at a patient's home and reports it to the supervisor for documentation.
- RN attends the annual IIPP training update and participates in the workplace safety inspection process.

**Role Awareness Cues**
- All roles: report hazards immediately; do not work around them.
- DON/Compliance: lead IIPP documentation and hazard correction tracking.

---

## 5. Section B - Workplace Violence Prevention (SB 553)

**Lessons Covered:** 53

**Plain Language Content**
- California SB 553 requires all employers to develop and implement a Workplace Violence Prevention Plan (WVPP).
- The plan must include hazard identification, incident reporting, employee training, and prohibition of retaliation.
- Home health staff face field-specific violence risks; each staff member must know the response protocol.

**Home Health Examples**
- An HHA feels unsafe at a patient's home due to aggressive behavior from a household member; leaves the premises and reports per the WVPP protocol.
- Admin reviews the WVPP annually and logs the review per SB 553 requirements.

**Role Awareness Cues**
- All roles: know the WVPP and report all incidents of threats or violence.
- Admin/HR: maintain WVPP documentation and training records.
- DON: review field safety concerns as part of supervisory oversight.

---

## 6. Section C - Hazard Communication and SDS

**Lessons Covered:** 54

**Plain Language Content**
- Hazard communication (HazCom) ensures staff know the risks of chemicals they encounter at work.
- Safety Data Sheets (SDS) provide hazard information, safe handling guidance, and emergency response for each chemical.
- All staff who may be exposed to chemicals must be trained on HazCom and know where SDS are located.

**Home Health Examples**
- CNA uses a cleaning product at a patient home and consults the SDS before mixing it with another product.
- RN identifies an unlabeled container at a patient's home and reports per safety protocol without using the substance.

**Role Awareness Cues**
- All roles: know where SDS are accessible (agency portal and field reference).
- Clinical roles: report unknown chemical hazards at patient homes.
- Admin: maintain current SDS library.

---

## 7. Summary
- IIPP requires systematic hazard identification, training, and correction.
- SB 553 mandates a WVPP with training and incident reporting for all California employers.
- HazCom/SDS knowledge is required for any staff with potential chemical exposure.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** The IIPP requires employers to:
- A. Post safety posters only
- B. Identify hazards, train staff, and implement controls to prevent workplace injuries
- C. Provide first aid kits only
- D. Conduct annual safety meetings only
- **Correct: B** | IIPP is a comprehensive hazard prevention program.

**Q2.** Under California SB 553, employers must:
- A. Install cameras in patient homes
- B. Develop and implement a Workplace Violence Prevention Plan with staff participation
- C. Only address physical violence after it occurs
- D. Report violence annually only
- **Correct: B** | SB 553 requires a documented WVPP and training for all California employers.

**Q3.** A Safety Data Sheet (SDS) provides:
- A. Patient medication information
- B. Hazard information for chemicals including safety precautions and emergency response
- C. Staff scheduling details
- D. Equipment maintenance records
- **Correct: B** | SDS is required for all hazardous chemicals used in the workplace.

**Q4.** When should a workplace hazard be reported?
- A. Only after it causes an injury
- B. As soon as it is identified, before an injury occurs
- C. At the weekly team meeting
- D. Only after it occurs three times
- **Correct: B** | Hazard reporting is preventive and must be immediate.

**Q5.** An HHA feels threatened by a family member's behavior at a patient home. The correct action is:
- A. Attempt to resolve the situation independently
- B. Leave the premises if immediate safety is at risk and report per the WVPP protocol
- C. Complete the visit and report later
- D. Ask the patient to intervene
- **Correct: B** | Personal safety is the priority; WVPP protocol governs response.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M9", "name": "OSHA and Workplace Safety", "version": "1.0.0",
    "durationMinutes": { "min": 15, "target": 18, "max": 21 },
    "targetRoles": ["RN","LVN","CNA","HHA","Admin","DON","Compliance","HR"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M9-S01", "title": "Workplace Safety and IIPP", "durationMinutes": 5, "lessons": [51,52] },
    { "id": "M9-S02", "title": "Workplace Violence Prevention SB 553", "durationMinutes": 5, "lessons": [53] },
    { "id": "M9-S03", "title": "Hazard Communication and SDS", "durationMinutes": 4, "lessons": [54] },
    { "id": "M9-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M9-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M9", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
