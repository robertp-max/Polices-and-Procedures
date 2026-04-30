# Module M16 Blueprint

## 1. Module Overview
- Module ID: M16
- Module Name: Medication and Pain Management
- Track: C (CMS CoP and Clinical Compliance)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 15-18 minutes
- Training Type: Awareness-level with clinical application
- Target Roles: RN, LVN, CNA (limited), HHA (observation only), DON, Compliance
- Policy Source: Medication Management Policy, High-Risk Medication Policy, Pain Management Policy

## 2. Learning Objectives
- Apply medication management standards in home health.
- Identify high-risk medications requiring additional precautions.
- Conduct ongoing pain assessment and escalate changes.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 4 min | Section C: 4 min | Summary: 2 min | Assessment: 3 min
- Total: 20 minutes

---

## 4. Section A - Medication Management

**Lessons Covered:** 86

**Plain Language Content**
- Medication management in home health includes assessment, teaching, reconciliation, and monitoring.
- The RN reconciles medications at each visit; the care plan reflects all current medications.
- HHAs and CNAs observe medication taking behavior but do not administer medications.

**Home Health Examples**
- RN reconciles the medication list at SOC and identifies a potential interaction for physician review.
- CNA observes that a patient has not taken their morning medications and reports to the supervising RN.
- LVN teaches the patient's daughter how to administer insulin per the physician's orders.

**Role Awareness Cues**
- RN/LVN: lead medication reconciliation, teaching, and monitoring.
- CNA/HHA: observe and report only; do not administer.
- DON: audit medication documentation and escalation practices.

---

## 5. Section B - High-Risk Medications

**Lessons Covered:** 87

**Plain Language Content**
- High-risk medications (anticoagulants, insulin, opioids, digoxin, chemotherapy agents) require heightened clinical attention.
- These medications have narrow therapeutic windows; errors can cause serious harm or death.
- Each high-risk medication requires documented education, monitoring parameters, and sign/symptom teaching.

**Home Health Examples**
- RN teaches the patient on warfarin to watch for bleeding signs and documents the education.
- LVN monitors a patient on opioids for sedation and respiratory depression at each visit.
- DON ensures high-risk medication protocols are followed during supervisory observations.

**Role Awareness Cues**
- RN/LVN: apply heightened assessment and documentation for all high-risk medications.
- CNA/HHA: report any unusual patient appearance, behavior, or statements to the supervising nurse.
- DON: review high-risk medication cases in clinical supervision.

---

## 6. Section C - Pain Assessment and Management

**Lessons Covered:** 88

**Plain Language Content**
- Pain must be assessed at every visit using a validated scale (e.g., numeric rating scale 0-10, FACES scale for cognitively impaired).
- Document the pain score, quality, location, duration, and patient's functional impact.
- Changes in pain level or new pain require clinical escalation.

**Home Health Examples**
- RN assesses pain at each visit and documents using the numeric scale with functional descriptors.
- CNA observes a patient grimacing and reports to the supervising RN for pain reassessment.
- LVN escalates to the physician when a patient reports new, uncontrolled pain not addressed by the current regimen.

**Role Awareness Cues**
- RN/LVN: assess, document, and escalate pain per protocol.
- CNA/HHA: report behavioral pain indicators; do not dismiss patient complaints.
- DON: ensure pain management documentation is consistent and complete.

---

## 7. Summary
- Medication management requires active RN oversight; HHA/CNA observe and report.
- High-risk medications require education, monitoring parameters, and enhanced documentation.
- Assess pain at every visit; escalate changes or new pain immediately.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Medication management in home health requires:
- A. Patients to self-manage all medications
- B. Clinicians to assess, reconcile, and monitor medications per the care plan and physician orders
- C. HHAs to administer all medications
- D. Medication review at discharge only
- **Correct: B** | Medication management is an ongoing clinical responsibility.

**Q2.** High-risk medications require additional precautions because:
- A. They are more expensive
- B. They have narrow therapeutic windows with high potential for serious harm
- C. They are only used in hospitals
- D. They require patient purchase
- **Correct: B** | Narrow safety margins require heightened clinical attention.

**Q3.** Pain assessment requires:
- A. Asking patients once at admission
- B. Ongoing validated scale assessment with documentation and escalation of changes
- C. Only documenting severe pain
- D. Deferring to patient self-reporting without clinical evaluation
- **Correct: B** | Pain assessment is an ongoing clinical standard.

**Q4.** An HHA observes a patient has not taken their medications. The correct action is:
- A. Administer the medications
- B. Report the observation to the supervising nurse
- C. Document without reporting
- D. Call the physician directly
- **Correct: B** | HHAs observe and report; they do not administer medications.

**Q5.** A patient on an anticoagulant shows signs of unusual bruising. The clinical response is:
- A. Note and review at the next visit
- B. Escalate to the supervising RN or physician immediately for assessment and possible order change
- C. Advise the patient to rest
- D. Document and wait for the next scheduled visit
- **Correct: B** | High-risk medication adverse signs require immediate escalation.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M16", "name": "Medication and Pain Management", "version": "1.0.0",
    "durationMinutes": { "min": 15, "target": 18, "max": 20 },
    "targetRoles": ["RN","LVN","CNA","HHA","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M16-S01", "title": "Medication Management", "durationMinutes": 5, "lessons": [86] },
    { "id": "M16-S02", "title": "High-Risk Medications", "durationMinutes": 4, "lessons": [87] },
    { "id": "M16-S03", "title": "Pain Assessment and Management", "durationMinutes": 4, "lessons": [88] },
    { "id": "M16-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M16-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M16", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
