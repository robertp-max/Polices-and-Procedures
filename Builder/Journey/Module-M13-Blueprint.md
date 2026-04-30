# Module M13 Blueprint

## 1. Module Overview
- Module ID: M13
- Module Name: CMS Conditions of Participation and Assessment
- Track: C (CMS CoP and Clinical Compliance)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 20-23 minutes
- Training Type: Awareness-level with clinical application
- Target Roles: RN, LVN, Admin, DON, Compliance
- Policy Source: CMS CoP Policy, Comprehensive Assessment Policy, OASIS Policy

## 2. Learning Objectives
- Describe CMS Conditions of Participation for home health.
- Explain comprehensive assessment requirements and timeframes.
- Apply OASIS accuracy standards and update requirements.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 5 min | Section C: 8 min | Summary: 2 min | Assessment: 3 min
- Total: 25 minutes

---

## 4. Section A - CMS Conditions of Participation Overview

**Lessons Covered:** 72

**Plain Language Content**
- CMS Conditions of Participation (CoPs) are the federal standards a home health agency must meet to participate in Medicare and Medicaid.
- Key CoP domains: patient rights, comprehensive assessment, care planning, quality and performance improvement, infection control, and emergency preparedness.
- Failure to meet CoPs can result in termination of Medicare participation.

**Home Health Examples**
- DON reviews the agency's CoP compliance calendar to ensure all required processes are current.
- Compliance conducts a mock survey using CoP standards annually.
- Admin ensures admission packet documentation aligns with CoP patient rights requirements.

**Role Awareness Cues**
- DON/Compliance: lead CoP compliance monitoring and gap remediation.
- Clinical roles: understand how your daily work connects to CoP requirements.

---

## 5. Section B - Comprehensive Assessment Requirements

**Lessons Covered:** 73

**Plain Language Content**
- A comprehensive assessment must be completed at start of care (SOC) and at defined intervals: recertification, resumption of care, significant change, and discharge.
- The assessment must cover clinical, functional, psychological, and social dimensions.
- Only a qualified clinician (RN or therapist) may complete the comprehensive assessment.

**Home Health Examples**
- RN completes the SOC comprehensive assessment within the CMS-required timeframe (within 5 days for most patients).
- LVN participates in data gathering for the comprehensive assessment under RN oversight.
- DON audits assessment completion dates for CoP compliance.

**Role Awareness Cues**
- RN: lead and complete comprehensive assessments on time.
- DON: monitor assessment timing compliance.
- Compliance: include assessment timeliness in audit scope.

---

## 6. Section C - OASIS Accuracy and Updates

**Lessons Covered:** 74, 75

**Plain Language Content**
- OASIS (Outcome and Assessment Information Set) is required at SOC, recertification, significant change, and discharge.
- Accuracy is critical: OASIS drives care planning, quality star ratings, and Medicare reimbursement.
- OASIS must reflect the patient's status on the specific assessment date — not the best or worst day.

**Home Health Examples**
- RN completes an OASIS significant change assessment after a patient falls and is hospitalized, then returns to care.
- Compliance performs a OASIS accuracy audit and identifies coding errors for correction.
- DON reviews OASIS submission deadlines and ensures compliance with 30-day submission requirement.

**Role Awareness Cues**
- RN/LVN: complete OASIS accurately and on time; escalate accuracy questions to the DON.
- DON: conduct OASIS accuracy reviews.
- Compliance: track submission timelines and audit findings.

---

## 7. Summary
- CoPs are mandatory federal standards for Medicare/Medicaid participation.
- Comprehensive assessments must be completed by a qualified clinician within CMS timeframes.
- OASIS accuracy affects care quality, star ratings, and reimbursement — get it right every time.

---

## 8. Assessment

**Format:** 6 MCQ | Pass: 80% (5/6)

**Q1.** CMS Conditions of Participation define:
- A. State licensing requirements only
- B. The minimum standards agencies must meet to participate in Medicare and Medicaid
- C. Billing rates for Medicare services
- D. Staffing ratios for hospital settings
- **Correct: B** | CoPs are the federal framework for Medicare/Medicaid participation.

**Q2.** The comprehensive assessment must be completed:
- A. Only at discharge
- B. At SOC and at CMS-defined intervals throughout the care episode
- C. Quarterly by the agency
- D. Only when requested
- **Correct: B** | CMS defines specific assessment timepoints.

**Q3.** OASIS data accuracy is critical because:
- A. It only affects agency reputation
- B. OASIS drives care planning, quality outcomes, and Medicare reimbursement
- C. It is reviewed only during state surveys
- D. Inaccuracies are corrected automatically
- **Correct: B** | OASIS accuracy is central to clinical, compliance, and financial outcomes.

**Q4.** A recertification OASIS is required:
- A. When any staff requests it
- B. At the end of each 60-day certification period or at significant change in condition
- C. At discharge only
- D. When billing exceeds normal parameters
- **Correct: B** | Recertification OASIS is a CMS episode management requirement.

**Q5.** Who may complete the OASIS assessment?
- A. The HHA
- B. A qualified clinician — RN or therapist — as required by CMS
- C. The administrator
- D. The patient's physician
- **Correct: B** | OASIS completion requires a CMS-qualified clinician.

**Q6.** Inaccurate OASIS data can result in:
- A. No significant consequences
- B. Poor quality outcomes, compliance findings, and reimbursement errors
- C. Only billing adjustment
- D. Patient notification only
- **Correct: B** | Inaccurate OASIS creates cascading clinical and financial risk.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M13", "name": "CMS Conditions of Participation and Assessment", "version": "1.0.0",
    "durationMinutes": { "min": 20, "target": 23, "max": 25 },
    "targetRoles": ["RN","LVN","Admin","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M13-S01", "title": "CMS CoP Overview", "durationMinutes": 5, "lessons": [72] },
    { "id": "M13-S02", "title": "Comprehensive Assessment", "durationMinutes": 5, "lessons": [73] },
    { "id": "M13-S03", "title": "OASIS Accuracy and Updates", "durationMinutes": 8, "lessons": [74,75] },
    { "id": "M13-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M13-QZ", "questionCount": 6, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M13", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
