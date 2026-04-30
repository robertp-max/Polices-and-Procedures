# Module M27 Blueprint

## 1. Module Overview
- Module ID: M27
- Module Name: Medical Social Work Assessment
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 15-18 minutes
- Training Type: Administrative and oversight awareness
- Target Roles: DON, Compliance
- Policy Source: Medical Social Work Policy, SDOH Assessment Policy, Advance Directive Counseling Policy, Mandatory Reporting Policy

## 2. Learning Objectives
- Describe the psychosocial assessment conducted by the Medical Social Worker.
- Identify social determinants of health factors relevant to home health patients.
- Explain advance directive counseling and mandatory reporting obligations for MSWs.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 4 min | Section B: 4 min | Section C: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 20 minutes

---

## 4. Section A - Psychosocial Assessment

**Lessons Covered:** 128

**Plain Language Content**
- The Medical Social Worker (MSW) conducts a psychosocial assessment that evaluates social, emotional, environmental, and functional factors affecting the patient's health and ability to receive care.
- MSW assessment informs the interdisciplinary care plan with psychosocial and community resource dimensions.
- The psychosocial assessment must be documented as part of the comprehensive assessment.

**Home Health Examples**
- MSW identifies caregiver burnout during a psychosocial assessment and recommends respite resources.
- DON reviews MSW documentation during chart audits for completeness of psychosocial elements.

---

## 5. Section B - Social Determinants of Health (SDOH)

**Lessons Covered:** 129

**Plain Language Content**
- SDOH are the non-medical factors that influence health: housing, food security, income, transportation, social support, and literacy.
- MSWs assess and document SDOH, connect patients to community resources, and integrate findings into the care plan.
- SDOH findings must be communicated to the care team to support whole-person care.

**Home Health Examples**
- MSW identifies food insecurity and connects the patient to a meal delivery program; documents in the care plan.
- RN uses SDOH information to adjust discharge planning based on patient's housing instability.

---

## 6. Section C - Advance Directive Counseling and Mandatory Reporting

**Lessons Covered:** 130, 131

**Plain Language Content**
- MSWs provide advance directive counseling: educating patients on their rights and options without directing specific choices.
- MSWs are mandatory reporters; any suspicion of abuse, neglect, or exploitation must be reported to Adult Protective Services (APS) and the agency.
- MSW mandatory reporting obligations are identical to all other clinical staff.

**Home Health Examples**
- MSW educates a patient about healthcare proxy options and facilitates completion of an advance directive.
- MSW observes signs of financial exploitation by a family member and reports to APS and the DON.

---

## 7. Summary
- MSW psychosocial assessment addresses the full social and emotional context of care.
- SDOH findings are documented and integrated into the care team's shared plan.
- Advance directive counseling supports informed decision-making; mandatory reporting is non-negotiable.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** The MSW psychosocial assessment evaluates:
- A. Financial resources only
- B. Social, emotional, environmental, and functional factors affecting health and care
- C. Physical therapy needs
- D. Insurance eligibility
- **Correct: B** | Psychosocial assessment addresses the full range of social and emotional factors.

**Q2.** Social determinants of health include:
- A. Only medical diagnoses
- B. Housing, food access, income, social support, and other non-clinical factors affecting health
- C. Insurance coverage only
- D. Physical environment of the clinic
- **Correct: B** | SDOH are social and economic conditions that influence health outcomes.

**Q3.** MSW advance directive counseling involves:
- A. Completing legal documents on behalf of the patient
- B. Educating patients about their rights and options, facilitating their decision-making
- C. Directing the patient toward a specific directive
- D. Deferring all advance directive discussions to the physician
- **Correct: B** | MSW counseling supports informed, patient-directed advance planning.

**Q4.** If an MSW suspects patient exploitation, the required action is:
- A. Discuss informally with the family first
- B. Report immediately per agency mandatory reporting policy and California APS requirements
- C. Document and review at the next team meeting
- D. Inform only the compliance officer
- **Correct: B** | MSW mandatory reporting obligations are the same as all clinical staff.

**Q5.** SDOH findings must be:
- A. Kept separate from clinical documentation
- B. Documented in the care record and communicated to the interdisciplinary team
- C. Shared verbally only
- D. Reported to the patient's employer
- **Correct: B** | SDOH findings inform the integrated, person-centered care plan.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M27", "name": "Medical Social Work Assessment", "version": "1.0.0",
    "durationMinutes": { "min": 15, "target": 18, "max": 20 },
    "targetRoles": ["DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M27-S01", "title": "Psychosocial Assessment", "durationMinutes": 4, "lessons": [128] },
    { "id": "M27-S02", "title": "Social Determinants of Health", "durationMinutes": 4, "lessons": [129] },
    { "id": "M27-S03", "title": "Advance Directive Counseling and Mandatory Reporting", "durationMinutes": 5, "lessons": [130,131] },
    { "id": "M27-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M27-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M27", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
