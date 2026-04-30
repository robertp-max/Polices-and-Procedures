# Module M28 Blueprint

## 1. Module Overview
- Module ID: M28
- Module Name: Medical Social Work Care Planning
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 12-15 minutes
- Training Type: Administrative and oversight awareness
- Target Roles: DON, Compliance
- Policy Source: Discharge Planning Policy, Care Plan Contribution Policy, Social Work Confidentiality Policy

## 2. Learning Objectives
- Describe the MSW's role in discharge planning.
- Explain MSW contributions to the interdisciplinary plan of care.
- Apply confidentiality standards in social work services.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 4 min | Section B: 3 min | Section C: 3 min | Summary: 2 min | Assessment: 3 min
- Total: 17 minutes

---

## 4. Section A - Discharge Planning

**Lessons Covered:** 132

**Plain Language Content**
- MSW leads or contributes to discharge planning beginning early in the episode.
- Discharge planning identifies: the patient's transition destination, community resources needed, equipment, caregiver support, and follow-up care.
- Documentation of discharge planning must show patient/family involvement and timeline.

**Home Health Examples**
- MSW initiates discharge planning at the first visit by assessing the patient's living situation and support network.
- DON reviews MSW discharge planning notes for completeness and patient involvement.

---

## 5. Section B - Plan of Care Contribution

**Lessons Covered:** 133

**Plain Language Content**
- The MSW contributes psychosocial goals and community resource referrals to the interdisciplinary plan of care.
- MSW goals are documented in the POC and coordinated with clinical goals.
- The MSW participates in IDT case conferences to ensure the social dimension of care is represented.

**Home Health Examples**
- MSW adds a goal to the POC: "Patient will be connected to a senior social day program to reduce isolation."
- Compliance verifies MSW POC contributions are present during chart audits.

---

## 6. Section C - Confidentiality in Social Work Services

**Lessons Covered:** 134

**Plain Language Content**
- Social work confidentiality protects information shared by the patient in the therapeutic relationship.
- Information may only be shared within the care team to the extent needed for care coordination.
- Mandatory reporting exceptions exist: abuse, neglect, exploitation, and imminent safety risk override confidentiality.

**Home Health Examples**
- MSW documents psychosocial concerns in the EMR in a way that supports care but limits unnecessary disclosure.
- DON asks MSW to share a patient's financial situation for care planning; MSW shares relevant information per minimum necessary standard.

---

## 7. Summary
- MSW discharge planning begins early and involves patient and family throughout.
- MSW contributes psychosocial goals to the IDT plan of care and participates in case conferences.
- Confidentiality protects the therapeutic relationship while mandatory reporting overrides it when safety requires.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** MSW discharge planning should begin:
- A. On the day of discharge
- B. Early in the episode, involving patient, family, and IDT team to identify resources and transition needs
- C. Without patient involvement
- D. After the physician requests it
- **Correct: B** | Early discharge planning ensures smooth transitions.

**Q2.** The MSW's contribution to the plan of care includes:
- A. Clinical order management
- B. Psychosocial goals, community resources, and support for goal attainment
- C. Physical therapy scheduling
- D. Billing optimization
- **Correct: B** | MSW contributes the social and emotional care dimensions.

**Q3.** Social work confidentiality in home health means:
- A. Only disclosing information to family members
- B. Protecting client information within legal and ethical limits, with mandatory reporting exceptions
- C. Sharing all information freely with the care team
- D. Not documenting sensitive discussions
- **Correct: B** | Confidentiality protects the therapeutic relationship with defined exceptions.

**Q4.** Community resource identification by the MSW serves to:
- A. Replace formal clinical care
- B. Connect patients to services addressing unmet social needs and support care transitions
- C. Reduce agency costs
- D. Satisfy administrative requirements only
- **Correct: B** | Community resources extend care to address social and practical needs.

**Q5.** When a patient declines MSW services, the MSW must:
- A. Override the refusal for patient safety
- B. Respect the decision, document the refusal, and communicate to the care team
- C. Document informally and continue without telling the team
- D. Transfer the patient to another agency
- **Correct: B** | Service refusals require respect, documentation, and care team communication.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M28", "name": "Medical Social Work Care Planning", "version": "1.0.0",
    "durationMinutes": { "min": 12, "target": 15, "max": 17 },
    "targetRoles": ["DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M28-S01", "title": "Discharge Planning", "durationMinutes": 4, "lessons": [132] },
    { "id": "M28-S02", "title": "Plan of Care Contribution", "durationMinutes": 3, "lessons": [133] },
    { "id": "M28-S03", "title": "Confidentiality in Social Work Services", "durationMinutes": 3, "lessons": [134] },
    { "id": "M28-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M28-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M28", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
