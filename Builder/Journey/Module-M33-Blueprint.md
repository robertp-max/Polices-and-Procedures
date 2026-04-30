# Module M33 Blueprint

## 1. Module Overview
- Module ID: M33
- Module Name: Chart Review, OASIS, and Patient Satisfaction Data
- Track: F (Quality and Performance Improvement)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 18-22 minutes
- Training Type: Quality improvement awareness
- Target Roles: RN, LVN, Admin, DON, Compliance, HR
- Policy Source: Chart Audit Policy, OASIS Review and Submission Policy, HHCAHPS/Patient Satisfaction Policy

## 2. Learning Objectives
- Conduct and use chart audit findings for quality improvement.
- Verify OASIS accuracy and manage submission timelines.
- Interpret and apply patient satisfaction data to care improvement.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 6 min | Section C: 4 min | Summary: 2 min | Assessment: 3 min
- Total: 22 minutes

---

## 4. Section A - Chart Audits

**Lessons Covered:** 150

**Plain Language Content**
- Chart audits verify documentation accuracy, completeness, and compliance with clinical and billing standards.
- Audits cover: visit note timeliness, medication documentation, care plan currency, supervisory visit frequency, and physician order completeness.
- Audit findings are reported to the QAPI committee and used to drive corrective action.

**Home Health Examples**
- Compliance conducts monthly chart audits on a random sample of 10% of active patients.
- DON reviews audit findings showing 15% of visit notes were late and initiates a corrective action.

---

## 5. Section B - OASIS Review and Submission

**Lessons Covered:** 151

**Plain Language Content**
- OASIS assessments must be reviewed for clinical accuracy by the DON or designated supervisor before submission.
- CMS requires OASIS submission within 30 days of the assessment date.
- Late or inaccurate OASIS submissions affect quality star ratings and may trigger compliance findings.

**Home Health Examples**
- RN completes the OASIS and submits for DON review; DON approves within 7 days.
- Compliance tracks OASIS submission dates monthly and reports compliance rate to QAPI.

---

## 6. Section C - Patient Satisfaction Data

**Lessons Covered:** 152

**Plain Language Content**
- Home health patient satisfaction is measured through HHCAHPS (Home Health Care Consumer Assessment of Healthcare Providers and Systems).
- HHCAHPS results are publicly reported on Medicare's Home Health Compare website.
- Satisfaction data identifies care experience gaps and informs QAPI priorities.

**Home Health Examples**
- DON presents HHCAHPS communication scores to the QAPI committee; team identifies a need to improve care plan communication with patients.
- Compliance includes HHCAHPS results in the quarterly quality report.

---

## 7. Summary
- Chart audits verify documentation compliance and feed QAPI corrective action.
- OASIS must be reviewed and submitted within 30 days; accuracy affects star ratings and reimbursement.
- HHCAHPS satisfaction data is publicly reported and drives care experience improvement.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Chart audits are used to:
- A. Monitor employee performance only
- B. Verify documentation accuracy, compliance, and completeness for quality and billing purposes
- C. Satisfy accreditation only
- D. Replace supervisory visits
- **Correct: B** | Audits serve quality, compliance, and billing functions.

**Q2.** OASIS review before submission ensures:
- A. Billing accuracy only
- B. Clinical accuracy, completeness, and CMS compliance before entering the national database
- C. Administrative approval only
- D. Only the DON has reviewed
- **Correct: B** | Pre-submission review catches errors affecting outcomes and reimbursement.

**Q3.** Patient satisfaction (HHCAHPS) data is used to:
- A. Assign staff performance bonuses
- B. Identify care experience gaps, inform improvement priorities, and meet CMS reporting requirements
- C. Marketing purposes only
- D. Replace clinical quality measures
- **Correct: B** | Satisfaction data is a quality indicator and publicly reported CMS metric.

**Q4.** OASIS submission deadlines require:
- A. Submission whenever convenient
- B. Submission within 30 days of the assessment date per CMS requirements
- C. Annual submission only
- D. Submission at discharge only
- **Correct: B** | CMS OASIS submission timeframes are regulatory requirements.

**Q5.** Chart audit findings must be:
- A. Filed without action
- B. Communicated to the care team, used for corrective action, and tracked for improvement
- C. Reviewed by compliance only
- D. Shared with patients automatically
- **Correct: B** | Audit findings drive improvement and must be acted upon.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M33", "name": "Chart Review, OASIS, and Patient Satisfaction Data", "version": "1.0.0",
    "durationMinutes": { "min": 18, "target": 22, "max": 24 },
    "targetRoles": ["RN","LVN","Admin","DON","Compliance","HR"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M33-S01", "title": "Chart Audits", "durationMinutes": 5, "lessons": [150] },
    { "id": "M33-S02", "title": "OASIS Review and Submission", "durationMinutes": 6, "lessons": [151] },
    { "id": "M33-S03", "title": "Patient Satisfaction Data", "durationMinutes": 4, "lessons": [152] },
    { "id": "M33-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M33-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M33", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
