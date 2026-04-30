# Module M24 Blueprint

## 1. Module Overview
- Module ID: M24
- Module Name: Supervisory Visits, Documentation, and Competency
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 15-18 minutes
- Training Type: Applied clinical awareness
- Target Roles: RN, LVN, DON, Compliance
- Policy Source: Supervisory Visit Policy, Skilled Nursing Documentation Policy, Competency Verification Policy

## 2. Learning Objectives
- Conduct and document supervisory visits per CMS requirements.
- Produce skilled nursing documentation that supports medical necessity.
- Apply competency check-off standards for staff skill verification.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 5 min | Section C: 4 min | Summary: 2 min | Assessment: 3 min
- Total: 21 minutes

---

## 4. Section A - Supervisory Visits

**Lessons Covered:** 115

**Plain Language Content**
- CMS requires the RN to supervise HHAs at least every 14 days when the patient is under a skilled nursing plan.
- The supervisory visit must be documented and must include observation of care delivery.
- Findings from the supervisory visit (including corrective guidance) must be documented in the patient's record.

**Home Health Examples**
- RN co-visits with an HHA, observes personal care technique, provides feedback, and documents the supervisory visit.
- DON reviews supervisory visit documentation to confirm compliance with 14-day frequency requirement.

---

## 5. Section B - Skilled Nursing Documentation

**Lessons Covered:** 116

**Plain Language Content**
- Skilled nursing documentation must demonstrate why the visit required professional skill.
- Generic or copy-paste documentation does not support medical necessity.
- Every visit note must show: skilled assessment findings, clinical decision-making, interventions, patient response, and plan.

**Home Health Examples**
- RN documents: "Patient's wound assessment shows 2x3cm Stage III with 5mm increase in width since last visit. Dressing change performed with wound irrigation as ordered. Patient tolerated well. MD notified of deterioration."
- Compliance identifies a visit note that is identical to the prior visit note; flags for review and re-training.

---

## 6. Section C - Competency Check-Offs

**Lessons Covered:** 117

**Plain Language Content**
- Competency check-offs verify that a staff member can correctly perform a specific skill.
- Check-offs require direct observation of the skill performance — not self-attestation.
- Document: skill observed, date, evaluator name, and outcome (pass/remediation required).

**Home Health Examples**
- DON observes HHA performing gait belt transfer technique and documents the competency check-off result.
- RN completes annual competency check-off for IV catheter care and documents the evaluator's observation.

---

## 7. Summary
- Supervisory visits must occur per CMS frequency, be observed, and be documented with any corrective guidance.
- Skilled nursing documentation must tell a clinical story that justifies professional skill on every visit.
- Competency check-offs require direct observation and documentation.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** CMS supervisory visit frequency for HHAs under a skilled nursing plan requires:
- A. Only at admission
- B. At least every 14 days
- C. Quarterly
- D. Only when there is a complaint
- **Correct: B** | CMS CoP mandates 14-day supervisory visit frequency.

**Q2.** Skilled nursing documentation must:
- A. Be brief to save time
- B. Demonstrate medical necessity through skilled assessment, clinical reasoning, interventions, and patient response
- C. Match the prior visit note for consistency
- D. Focus only on the physician's orders
- **Correct: B** | Documentation must independently support skilled need on every visit.

**Q3.** Competency check-offs require:
- A. Employee self-attestation
- B. Direct observation of skill performance by a qualified evaluator with documented results
- C. Online training module completion
- D. Attendance at the orientation session
- **Correct: B** | Competency requires observed skill demonstration.

**Q4.** A supervisory visit finding of incorrect care technique requires:
- A. Documentation only
- B. Immediate corrective instruction, documentation, and escalation per agency policy if repeated
- C. Waiting for annual performance review
- D. Notifying HR first
- **Correct: B** | Supervisory visits require real-time correction and documentation.

**Q5.** Skilled nursing documentation that does not support medical necessity risks:
- A. Automatic recertification
- B. Claim denial, Medicare recoupment, and compliance findings
- C. Minor administrative correction
- D. No material consequences
- **Correct: B** | Documentation that fails to support necessity creates significant billing risk.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M24", "name": "Supervisory Visits, Documentation, and Competency", "version": "1.0.0",
    "durationMinutes": { "min": 15, "target": 18, "max": 21 },
    "targetRoles": ["RN","LVN","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M24-S01", "title": "Supervisory Visits", "durationMinutes": 5, "lessons": [115] },
    { "id": "M24-S02", "title": "Skilled Nursing Documentation", "durationMinutes": 5, "lessons": [116] },
    { "id": "M24-S03", "title": "Competency Check-Offs", "durationMinutes": 4, "lessons": [117] },
    { "id": "M24-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M24-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M24", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
