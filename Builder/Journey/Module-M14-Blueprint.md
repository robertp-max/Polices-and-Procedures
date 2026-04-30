# Module M14 Blueprint

## 1. Module Overview
- Module ID: M14
- Module Name: Plan of Care, Orders, and Eligibility
- Track: C (CMS CoP and Clinical Compliance)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 20-23 minutes
- Training Type: Awareness-level with clinical application
- Target Roles: RN, LVN, Admin, DON, Compliance
- Policy Source: Plan of Care Policy, Physician Order Policy, Skilled Need Policy, Homebound Criteria Policy

## 2. Learning Objectives
- Explain Plan of Care requirements and the CMS-485 process.
- Apply verbal order documentation standards.
- Identify skilled need and homebound criteria for home health eligibility.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 6 min | Section B: 6 min | Section C: 6 min | Summary: 2 min | Assessment: 3 min
- Total: 25 minutes

---

## 4. Section A - Plan of Care and CMS-485

**Lessons Covered:** 76

**Plain Language Content**
- The Plan of Care (CMS-485) documents the physician-ordered services, interventions, and goals for the episode.
- It must be established and signed by the physician before or shortly after care begins.
- Any change to the care plan requires a new or updated physician order.

**Home Health Examples**
- RN develops the Plan of Care at SOC and sends it to the physician for signature within required timeframes.
- Admin tracks physician signature status and follows up on outstanding CMS-485s.
- DON reviews the Plan of Care accuracy during supervisory visits.

**Role Awareness Cues**
- RN: initiate and update the Plan of Care; ensure physician signature.
- Admin: track POC signatures and manage follow-up.
- DON/Compliance: audit POC accuracy and signature timeliness.

---

## 5. Section B - Physician Orders and Verbal Orders

**Lessons Covered:** 77

**Plain Language Content**
- All skilled nursing, therapy, and home health aide services require a physician order.
- Verbal orders must be documented immediately when received and signed off per agency policy and CMS requirements.
- Unsigned verbal orders create billing and compliance risk.

**Home Health Examples**
- RN receives a verbal order for a medication change during a patient visit; documents the order immediately in the clinical record.
- LVN receives verbal orders per agency protocol and notifies the physician to provide written confirmation.
- Admin tracks all outstanding verbal orders for timely physician sign-off.

**Role Awareness Cues**
- Clinical roles: document verbal orders immediately; never delay or paraphrase.
- Admin: maintain verbal order tracking for sign-off follow-up.
- Compliance: audit verbal order documentation accuracy.

---

## 6. Section C - Skilled Need and Homebound Criteria

**Lessons Covered:** 78, 79

**Plain Language Content**
- Skilled need means the patient requires services of a licensed clinician (RN, PT, OT, SLP) that cannot be safely provided without professional skill.
- Homebound status means leaving home requires considerable effort due to illness or injury.
- Both criteria must be documented and supported throughout the episode — they are not assumptions.

**Home Health Examples**
- RN documents specific skilled observations and interventions that justify continued skilled nursing services.
- LVN documents the patient's difficulty ambulating and inability to leave home without assistive devices.
- Compliance audits skilled need documentation for clarity and adequacy.

**Role Awareness Cues**
- Clinical roles: document skilled justification on every visit note; do not assume the criteria are obvious.
- DON: review documentation for adequacy of skilled need support.
- Compliance: include skilled need documentation in audit scope.

---

## 7. Summary
- The POC must be physician-ordered, signed, and updated with each care change.
- Verbal orders require immediate documentation and timely physician sign-off.
- Skilled need and homebound criteria must be actively documented throughout the episode.

---

## 8. Assessment

**Format:** 6 MCQ | Pass: 80% (5/6)

**Q1.** The Plan of Care (CMS-485) must be:
- A. Created informally by the clinical team
- B. Established by the physician and updated to reflect current patient needs
- C. Signed by the patient only
- D. Optional for short episodes
- **Correct: B** | CMS requires physician-ordered and approved Plans of Care.

**Q2.** Verbal orders must be:
- A. Documented at the end of the week
- B. Documented immediately when received and signed off per agency policy and CMS requirements
- C. Only used in clinical emergencies
- D. Confirmed by email
- **Correct: B** | Verbal orders require immediate documentation to ensure accuracy.

**Q3.** Skilled need criteria require that:
- A. Any patient can receive skilled home health services
- B. The patient requires services that can only be safely provided by a licensed professional
- C. Only physical therapy qualifies as skilled
- D. Skilled need is determined by patient request
- **Correct: B** | Skilled need is a specific clinical and regulatory determination.

**Q4.** Homebound status requires that:
- A. The patient is completely bedridden
- B. Leaving home requires considerable effort due to illness or injury
- C. The patient has no family support
- D. The patient lives alone
- **Correct: B** | CMS defines homebound criteria with specific functional requirements.

**Q5.** When a patient's condition changes significantly:
- A. Wait for the next certification period to update orders
- B. Notify the physician promptly and update the Plan of Care per CMS and agency requirements
- C. Update internally without physician notification
- D. Only update at the patient's request
- **Correct: B** | Changes in condition require prompt physician notification and plan updates.

**Q6.** Failure to document skilled need adequately results in:
- A. Minor administrative correction only
- B. Claim denial, potential recoupment, and compliance risk
- C. Automatic recertification
- D. No significant consequences
- **Correct: B** | Inadequate skilled need documentation creates significant billing and compliance liability.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M14", "name": "Plan of Care, Orders, and Eligibility", "version": "1.0.0",
    "durationMinutes": { "min": 20, "target": 23, "max": 25 },
    "targetRoles": ["RN","LVN","Admin","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M14-S01", "title": "Plan of Care and CMS-485", "durationMinutes": 6, "lessons": [76] },
    { "id": "M14-S02", "title": "Physician Orders and Verbal Orders", "durationMinutes": 6, "lessons": [77] },
    { "id": "M14-S03", "title": "Skilled Need and Homebound Criteria", "durationMinutes": 6, "lessons": [78,79] },
    { "id": "M14-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M14-QZ", "questionCount": 6, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M14", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
