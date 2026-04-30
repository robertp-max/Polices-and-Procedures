# Module M39 Blueprint

## 1. Module Overview
- Module ID: M39
- Module Name: Competency Program, Preceptor, and Emergency Leadership
- Track: G (Leadership and Governance)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 15-18 minutes
- Training Type: Leadership awareness
- Target Roles: RN, LVN, Admin, DON, Compliance, HR
- Policy Source: Competency Assessment Policy, Preceptor and Orientation Policy, Emergency Management Leadership Policy

## 2. Learning Objectives
- Manage the agency-wide competency assessment program.
- Apply preceptor principles to orientation of new clinical staff.
- Describe leadership responsibilities during emergency management activation.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 4 min | Section B: 4 min | Section C: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 20 minutes

---

## 4. Section A - Competency Assessment Program

**Lessons Covered:** 166

**Plain Language Content**
- All direct care staff must have documented competency in the skills they perform before providing independent patient care.
- Initial competency is assessed at hire; ongoing competency is reassessed annually and when deficiencies are identified.
- The competency assessment program identifies gaps and drives targeted training and supervision.

**Home Health Examples**
- DON ensures all new HHA hires complete a competency check-off before their first unaccompanied visit.
- HR tracks annual competency assessment completion across all clinical staff.
- When a supervisory visit identifies a care gap, competency reassessment is triggered.

---

## 5. Section B - Preceptor and Orientation Program

**Lessons Covered:** 167

**Plain Language Content**
- Preceptors are experienced staff assigned to orient new employees to the agency's clinical and operational processes.
- Preceptor responsibilities: demonstrate correct practice, supervise initial patient encounters, provide constructive feedback, and document orientation progress.
- Orientation must include: agency policies, EMR use, emergency procedures, HIPAA, patient rights, and role-specific clinical expectations.

**Home Health Examples**
- DON assigns a senior RN as preceptor for a new hire; preceptor accompanies the new RN on first 3 visits and documents observations.
- HR maintains the orientation checklist and ensures completion is documented before new staff work independently.

---

## 6. Section C - Emergency Management Leadership

**Lessons Covered:** 168

**Plain Language Content**
- During an emergency activation, the Administrator or designee assumes Incident Command responsibility.
- Leadership responsibilities: activate the Emergency Operations Plan (EOP), notify patients and staff, coordinate resources, and document all actions.
- Post-emergency, leadership leads the after-action review and updates the EOP based on findings.

**Home Health Examples**
- Administrator activates the EOP when a wildfire threat is declared in the service area; assigns staff roles per the Incident Command structure.
- DON coordinates with the clinical team to confirm patient contact and service continuation status.
- After the emergency, Administrator leads the AAR and documents at least three EOP improvement items.

---

## 7. Summary
- Competency assessment is required before independent care; reassess annually and when deficiencies arise.
- Preceptors ensure new staff are properly oriented before independent patient care.
- Leadership activates and commands the emergency response; AAR and EOP updates follow every activation.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Competency assessment is required:
- A. Only at hire
- B. At hire, annually, and when deficiencies are identified during supervision
- C. Only for CNA and HHA staff
- D. Only when a complaint is filed
- **Correct: B** | Competency must be verified initially and maintained continuously.

**Q2.** A preceptor's role during new employee orientation includes:
- A. Only paperwork review
- B. Demonstrating practice, supervising initial patient encounters, and providing documented feedback
- C. Billing system training only
- D. Accompanying new staff only once
- **Correct: B** | Preceptors provide structured, documented orientation to practice.

**Q3.** When a new staff member completes orientation, they may work independently when:
- A. They have completed the first day
- B. Orientation checklist is signed off, competency is verified, and supervision is confirmed complete
- C. The preceptor verbally approves
- D. The first paycheck is issued
- **Correct: B** | Independent work begins only after documented orientation and competency completion.

**Q4.** During an emergency activation, leadership responsibilities include:
- A. Monitoring social media for updates
- B. Activating the EOP, assigning Incident Command roles, coordinating patient and staff notifications, and documenting all actions
- C. Delegating everything to staff without personal oversight
- D. Only making phone calls
- **Correct: B** | Leadership commands the emergency response and documents all key decisions.

**Q5.** Following an emergency event, leadership must:
- A. File the incident report and close the record
- B. Lead an after-action review, document lessons learned, and update the EOP
- C. Only report to the governing body at year-end
- D. Wait for regulator feedback before updating plans
- **Correct: B** | AAR and EOP updates are required after every emergency activation.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M39", "name": "Competency Program, Preceptor, and Emergency Leadership", "version": "1.0.0",
    "durationMinutes": { "min": 15, "target": 18, "max": 20 },
    "targetRoles": ["RN","LVN","Admin","DON","Compliance","HR"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M39-S01", "title": "Competency Assessment Program", "durationMinutes": 4, "lessons": [166] },
    { "id": "M39-S02", "title": "Preceptor and Orientation Program", "durationMinutes": 4, "lessons": [167] },
    { "id": "M39-S03", "title": "Emergency Management Leadership", "durationMinutes": 5, "lessons": [168] },
    { "id": "M39-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M39-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M39", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
