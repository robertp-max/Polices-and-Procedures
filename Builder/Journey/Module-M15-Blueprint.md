# Module M15 Blueprint

## 1. Module Overview
- Module ID: M15
- Module Name: Care Coordination, Documentation, and Discharge
- Track: C (CMS CoP and Clinical Compliance)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 25-28 minutes
- Training Type: Awareness-level with clinical application
- Target Roles: RN, LVN, CNA, HHA, Admin, DON, Compliance, HR
- Policy Source: Care Coordination Policy, Documentation Policy, Discharge/Transfer Policy, Adverse Event Policy

## 2. Learning Objectives
- Apply interdisciplinary team (IDT) care coordination practices.
- Meet clinical documentation timeliness and accuracy standards.
- Follow discharge and transfer planning procedures.
- Report patient safety events through the agency incident system.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 6 min | Section B: 6 min | Section C: 5 min | Section D: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 29 minutes

---

## 4. Section A - Care Coordination and Visit Management

**Lessons Covered:** 80, 81

**Plain Language Content**
- IDT care coordination means all treating disciplines share information and align on patient goals.
- Missed visits must be documented, rescheduled where clinically indicated, and the patient must be notified.
- Visit frequency must match the ordered care plan; unauthorized frequency changes are not permitted.

**Home Health Examples**
- RN communicates a change in patient wound status to the PT and DON via the interdisciplinary note.
- Admin documents a missed visit as a no-access and reschedules per policy.
- LVN contacts the supervising RN when a patient visit finds unexpected clinical changes.

**Role Awareness Cues**
- Clinical roles: communicate actively with all treating disciplines; do not work in isolation.
- Admin: track and document all missed visits with reason codes.
- DON: oversee IDT coordination and address communication gaps.

---

## 5. Section B - Clinical Documentation Standards and Timeliness

**Lessons Covered:** 82, 83

**Plain Language Content**
- Clinical documentation must be completed within 24 hours of the visit per CMS and agency policy.
- Documentation must accurately reflect the care delivered — no late entries, alterations, or omissions.
- Late documentation creates clinical, legal, and billing risk.

**Home Health Examples**
- RN completes visit notes before leaving the patient's home.
- LVN submits documentation the same day through the EMR mobile app.
- Compliance flags late visit notes for supervisor follow-up.

**Role Awareness Cues**
- All clinical roles: document same day; build it into visit workflow.
- DON: monitor documentation timeliness via EMR reports.
- Compliance: include documentation timelines in monthly audit scope.

---

## 6. Section C - Discharge and Transfer

**Lessons Covered:** 84

**Plain Language Content**
- Discharge planning begins at or near the start of care; it is not a last-minute task.
- Planned discharge requires documentation of goals achieved, functional status, and patient/caregiver education.
- Transfer to another level of care requires a clinical summary and coordination with the receiving provider.

**Home Health Examples**
- RN documents the discharge summary with all required elements when a patient achieves established goals.
- Admin coordinates transfer documentation when a patient is hospitalized.
- LVN documents the patient's functional status and education completed at planned discharge.

**Role Awareness Cues**
- Clinical roles: begin discharge education early and document progress.
- Admin: coordinate transfer documentation for hospital or hospice transitions.
- DON: review discharge summaries for completeness.

---

## 7. Section D - Patient Safety and Adverse Event Reporting

**Lessons Covered:** 85

**Plain Language Content**
- Any safety event, near miss, or adverse outcome must be reported through the agency incident reporting system.
- Patient safety events are not disciplinary triggers — they are data for QAPI improvement.
- Timely reporting enables investigation, corrective action, and prevention of recurrence.

**Home Health Examples**
- HHA witnesses a patient fall during ambulation and reports immediately to the supervising nurse.
- RN activates incident reporting after discovering a medication error during a visit.
- Compliance reviews incident reports to identify trends and trigger QAPI review.

**Role Awareness Cues**
- All roles: report immediately; do not wait to see if harm results.
- Compliance/DON: conduct timely incident investigation and corrective action.
- Leadership: maintain a culture of safety and non-punitive reporting.

---

## 8. Summary
- IDT coordination ensures aligned care goals across all disciplines.
- Document visits same-day; late and inaccurate documentation creates legal and billing risk.
- Discharge planning is a continuous process, not a last-day task.
- Report all safety events immediately — reporting protects patients and improves care.

---

## 9. Assessment

**Format:** 7 MCQ | Pass: 80% (6/7)

**Q1.** IDT care coordination requires:
- A. Separate documentation by each discipline with no shared communication
- B. Active communication among all treating clinicians to align care goals
- C. Only the RN communicates across disciplines
- D. Coordination only when the patient requests it
- **Correct: B** | IDT coordination ensures consistent, goal-aligned care delivery.

**Q2.** Clinical visit documentation must be completed:
- A. At the end of each week
- B. Within 24 hours of the visit per CMS and agency policy
- C. When convenient for the clinician
- D. Only at start and end of care
- **Correct: B** | Documentation timeliness is a regulatory and legal requirement.

**Q3.** A missed visit must be:
- A. Rescheduled without documentation
- B. Documented with reason, patient notified, and rescheduled per agency missed visit policy
- C. Only tracked in the scheduler
- D. Reported only if it happens three times
- **Correct: B** | Missed visits require formal documentation and follow-up.

**Q4.** Discharge planning should begin:
- A. On the day of discharge
- B. At or near the start of care as early as possible during the episode
- C. Only when the physician requests it
- D. After the final visit is completed
- **Correct: B** | Early discharge planning supports smooth transitions.

**Q5.** A patient safety event must be:
- A. Addressed quietly without formal reporting
- B. Reported immediately through the agency incident reporting system
- C. Only reported to the physician
- D. Discussed at the weekly team meeting only
- **Correct: B** | Safety events require formal reporting and systematic review.

**Q6.** Late documentation creates risk in which area?
- A. Only staff satisfaction
- B. Clinical continuity, legal liability, and billing accuracy
- C. Minor administrative inconvenience only
- D. No material risk
- **Correct: B** | Documentation integrity is foundational across clinical, legal, and billing dimensions.

**Q7.** Who is responsible for care coordination in home health?
- A. Only the RN
- B. All members of the care team guided by the Plan of Care
- C. The patient's family
- D. The intake coordinator only
- **Correct: B** | Care coordination is a shared team responsibility.

---

## 10. LMS JSON

```json
{
  "module": { "id": "M15", "name": "Care Coordination, Documentation, and Discharge", "version": "1.0.0",
    "durationMinutes": { "min": 25, "target": 28, "max": 30 },
    "targetRoles": ["RN","LVN","CNA","HHA","Admin","DON","Compliance","HR"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M15-S01", "title": "Care Coordination and Visit Management", "durationMinutes": 6, "lessons": [80,81] },
    { "id": "M15-S02", "title": "Documentation Standards and Timeliness", "durationMinutes": 6, "lessons": [82,83] },
    { "id": "M15-S03", "title": "Discharge and Transfer", "durationMinutes": 5, "lessons": [84] },
    { "id": "M15-S04", "title": "Patient Safety and Adverse Event Reporting", "durationMinutes": 5, "lessons": [85] },
    { "id": "M15-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M15-QZ", "questionCount": 7, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M15", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
