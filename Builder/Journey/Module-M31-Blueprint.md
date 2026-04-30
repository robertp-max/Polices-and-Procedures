# Module M31 Blueprint

## 1. Module Overview
- Module ID: M31
- Module Name: QAPI Program and Committee
- Track: F (Quality and Performance Improvement)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 18-22 minutes
- Training Type: Quality improvement awareness
- Target Roles: RN, LVN, Admin, DON, Compliance, HR
- Policy Source: QAPI Program Policy, PIP Policy, QAPI Committee Charter

## 2. Learning Objectives
- Describe the purpose and structure of the QAPI program.
- Explain the role of the QAPI committee and multi-disciplinary participation.
- Identify how a Performance Improvement Project (PIP) is initiated and managed.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 5 min | Section C: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 22 minutes

---

## 4. Section A - QAPI Program Overview

**Lessons Covered:** 144

**Plain Language Content**
- QAPI (Quality Assessment and Performance Improvement) is a CMS-required systematic process for measuring, analyzing, and improving care quality and patient outcomes.
- QAPI uses data from multiple sources: OASIS outcomes, incident reports, patient complaints, and clinical audits.
- All staff play a role in QAPI; it is not a leadership-only function.

**Home Health Examples**
- DON presents quarterly OASIS outcome data to the QAPI committee showing a trend in fall-related hospitalizations.
- RN completes incident reports that feed into QAPI trend analysis.

---

## 5. Section B - QAPI Committee Structure and Participation

**Lessons Covered:** 145

**Plain Language Content**
- The QAPI committee meets at defined intervals (typically quarterly or monthly) to review data and drive improvement.
- Multi-disciplinary participation ensures diverse clinical and administrative perspectives.
- Meeting documentation includes: attendance, data reviewed, decisions made, and improvement activities assigned.

**Home Health Examples**
- RN participates in the QAPI committee meeting and presents a case review of a recent adverse event.
- Admin presents authorization and scheduling compliance data to the committee.

---

## 6. Section C - Performance Improvement Projects (PIPs)

**Lessons Covered:** 146

**Plain Language Content**
- A PIP is initiated when QAPI data identifies a gap or opportunity for systematic improvement.
- PIPs use a structured methodology (Plan-Do-Study-Act) with defined measures, timelines, and accountability.
- PIPs are tracked through implementation and outcome monitoring to confirm improvement was achieved.

**Home Health Examples**
- QAPI committee identifies that fall-related hospitalization rates exceed national benchmarks and initiates a PIP on fall prevention.
- Compliance leads the PIP tracking and presents results at each quarterly meeting.

---

## 7. Summary
- QAPI is a systematic, data-driven program required by CMS; all staff contribute.
- The QAPI committee reviews data across all quality domains with multi-disciplinary input.
- PIPs address data-identified gaps with structured improvement methodology and outcome tracking.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** The QAPI program exists to:
- A. Satisfy accreditation paperwork
- B. Systematically measure, analyze, and improve care quality and patient outcomes
- C. Track employee attendance
- D. Replace clinical oversight
- **Correct: B** | QAPI drives systematic quality improvement through data-driven analysis.

**Q2.** QAPI committee participation is important because:
- A. Only leadership opinions matter
- B. Multi-disciplinary input ensures diverse perspectives and shared accountability for improvement
- C. Meetings satisfy compliance calendars only
- D. Participation is optional for most staff
- **Correct: B** | QAPI effectiveness requires multi-disciplinary engagement.

**Q3.** A PIP is initiated when:
- A. A staff member requests training
- B. Data identifies a quality gap or opportunity for systematic improvement
- C. A patient complains
- D. An accreditor requires it
- **Correct: B** | PIPs are data-triggered structured improvement efforts.

**Q4.** Which data source would most likely trigger a PIP?
- A. A single staff complaint
- B. A trend showing increased hospitalization or care plan failures over multiple data periods
- C. One missed visit
- D. An informal staff suggestion
- **Correct: B** | PIPs are triggered by data trends, not isolated events.

**Q5.** What is expected of frontline staff in the QAPI program?
- A. Only attending optional meetings
- B. Contributing clinical observations, participating in improvement activities, and following updated processes
- C. No expectation of active participation
- D. Only reporting to the QAPI coordinator
- **Correct: B** | Frontline staff are essential contributors to QAPI effectiveness.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M31", "name": "QAPI Program and Committee", "version": "1.0.0",
    "durationMinutes": { "min": 18, "target": 22, "max": 24 },
    "targetRoles": ["RN","LVN","Admin","DON","Compliance","HR"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M31-S01", "title": "QAPI Program Overview", "durationMinutes": 5, "lessons": [144] },
    { "id": "M31-S02", "title": "QAPI Committee", "durationMinutes": 5, "lessons": [145] },
    { "id": "M31-S03", "title": "Performance Improvement Projects", "durationMinutes": 5, "lessons": [146] },
    { "id": "M31-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M31-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M31", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
