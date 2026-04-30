# Module M17 Blueprint

## 1. Module Overview
- Module ID: M17
- Module Name: Falls, Wounds, and Infection Control Practices
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 15-18 minutes
- Training Type: Applied clinical awareness
- Target Roles: RN, LVN, CNA, HHA, DON, Compliance
- Policy Source: Fall Prevention Policy, Wound Care Policy, Standard Precautions Policy

## 2. Learning Objectives
- Conduct and document fall risk assessments using a validated tool.
- Deliver and document wound care per care plan and aseptic technique.
- Apply infection control practices in all home care interactions.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 4 min | Section C: 4 min | Summary: 2 min | Assessment: 3 min
- Total: 20 minutes

---

## 4. Section A - Fall Risk Assessment and Intervention

**Lessons Covered:** 89

**Plain Language Content**
- Fall risk is dynamic; assess at SOC, each visit, and after any fall or change in condition.
- Use an agency-validated fall risk tool (e.g., Morse Fall Scale or equivalent).
- The care plan must reflect fall risk level and specific interventions.

**Home Health Examples**
- RN reassesses fall risk at each visit when the patient is on a diuretic with orthostatic hypotension risk.
- CNA places non-slip mat and confirms the patient's walking path is clear before ambulation assistance.
- DON reviews fall risk documentation during supervisory visits to ensure interventions match assessed risk.

---

## 5. Section B - Wound Care Basics

**Lessons Covered:** 90

**Plain Language Content**
- Wound care requires a current physician order and aseptic technique.
- Document wound assessment findings: location, dimensions, wound bed, drainage, surrounding skin, and patient's response.
- Any change in wound status — signs of infection, deterioration, or healing stall — requires immediate clinical escalation.

**Home Health Examples**
- LVN performs wound dressing change per the care plan, documents findings, and photographs the wound per agency policy.
- RN identifies wound infection signs and contacts the physician same day for an order change.
- CNA observes wound drainage through the dressing and reports to the supervising nurse immediately.

---

## 6. Section C - Infection Control Practices at Home

**Lessons Covered:** 91

**Plain Language Content**
- Standard precautions apply to all home care interactions — treat every patient as potentially infectious.
- Consistent hand hygiene, PPE selection, and proper disposal are required at every visit.
- Home environments are challenging; carry your own supplies and do not rely on patient supplies for clinical procedures.

**Home Health Examples**
- HHA carries her own gloves and hand sanitizer on every visit.
- RN disposes of soiled dressing material in appropriate bags, not patient's household trash.
- CNA performs hand hygiene before and after every patient contact.

---

## 7. Summary
- Reassess fall risk continuously; update the care plan when risk changes.
- Wound care requires aseptic technique, complete documentation, and same-day escalation of infection signs.
- Apply standard precautions to every patient interaction; carry your own clinical supplies.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Fall risk assessment should occur:
- A. Only at admission
- B. At SOC, each visit, and after any fall or condition change using a validated tool
- C. Only for patients over 80
- D. Based on family's report only
- **Correct: B** | Fall risk is dynamic and requires ongoing assessment.

**Q2.** Wound care documentation must include:
- A. Dressing type only
- B. Wound characteristics, treatment performed, patient response, and changes from prior visits
- C. A photograph only
- D. A verbal summary to the supervisor
- **Correct: B** | Comprehensive documentation tracks healing and supports compliance.

**Q3.** Which wound care practice prevents contamination?
- A. Using the same supplies for multiple wounds
- B. Following aseptic technique with sterile supplies per care plan and proper disposal
- C. Rinsing wounds with tap water only
- D. Keeping the dressing until the next visit regardless of condition
- **Correct: B** | Aseptic technique is required for home wound care.

**Q4.** Standard precautions apply:
- A. Only when a patient has a known infection
- B. To all patient interactions regardless of infection status
- C. Only to licensed clinical staff
- D. Only during invasive procedures
- **Correct: B** | Standard precautions are universal.

**Q5.** A patient's wound shows signs of infection between visits. The correct action is:
- A. Wait for the next scheduled visit
- B. Notify the supervising nurse immediately for clinical assessment and care plan review
- C. Advise the family to apply OTC treatments
- D. Document and address at the weekly team meeting
- **Correct: B** | New infection signs require immediate clinical escalation.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M17", "name": "Falls, Wounds, and Infection Control Practices", "version": "1.0.0",
    "durationMinutes": { "min": 15, "target": 18, "max": 20 },
    "targetRoles": ["RN","LVN","CNA","HHA","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M17-S01", "title": "Fall Risk Assessment", "durationMinutes": 5, "lessons": [89] },
    { "id": "M17-S02", "title": "Wound Care Basics", "durationMinutes": 4, "lessons": [90] },
    { "id": "M17-S03", "title": "Infection Control Practices", "durationMinutes": 4, "lessons": [91] },
    { "id": "M17-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M17-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M17", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
