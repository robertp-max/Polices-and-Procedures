# Module M22 Blueprint

## 1. Module Overview
- Module ID: M22
- Module Name: RN and LVN Scope and Supervision
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 18-22 minutes
- Training Type: Applied clinical awareness
- Target Roles: RN, LVN, DON, Compliance
- Policy Source: RN Scope of Practice Policy, LVN Scope Policy, Delegation Policy, Medication Administration Policy

## 2. Learning Objectives
- Describe the RN's assessment and care coordination role in home health.
- Apply LVN scope of practice limitations and supervision requirements.
- Follow delegation standards for licensed and unlicensed staff.
- Comply with medication administration requirements.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 4 min | Section C: 5 min | Section D: 4 min | Summary: 2 min | Assessment: 3 min
- Total: 25 minutes

---

## 4. Section A - RN Assessment Role

**Lessons Covered:** 108

**Plain Language Content**
- The RN's role in home health centers on comprehensive assessment, care planning, coordination, and oversight.
- Only an RN can perform and sign the comprehensive assessment and develop the Plan of Care.
- RNs supervise LVNs, HHAs, and CNAs and are accountable for care quality on their caseload.

**Home Health Examples**
- RN conducts the SOC comprehensive assessment and develops the Plan of Care within 5 days.
- RN reviews and co-signs LVN visit notes for assigned patients.
- RN is the clinical decision-maker when patient status changes require escalation.

---

## 5. Section B - LVN Scope of Practice in Home Health

**Lessons Covered:** 109

**Plain Language Content**
- California LVNs in home health practice under the supervision of an RN or physician.
- LVNs may implement the Plan of Care, provide skilled nursing care within their scope, and document visit findings.
- LVNs may not perform comprehensive assessments, independently develop or change care plans, or initiate emergency interventions beyond their scope.

**Home Health Examples**
- LVN implements wound care per the RN-developed care plan and documents findings.
- LVN identifies a patient change in condition, contacts the supervising RN, and follows RN guidance for escalation.

---

## 6. Section C - Supervision and Delegation

**Lessons Covered:** 110

**Plain Language Content**
- Delegation: the RN assigns a specific task to an HHA or CNA after assessing appropriateness.
- The delegated task must be within the UAP's scope, documented in the care plan, and supervised by the RN.
- The RN retains accountability for the delegated task; verbal delegation is insufficient without care plan documentation.

**Home Health Examples**
- RN delegates specific personal care tasks to an HHA through the care plan and confirms competency.
- RN observes HHA performing delegated tasks during a supervisory visit and documents findings.
- LVN is supervised by RN in home health; tasks outside LVN scope require RN or physician involvement.

---

## 7. Section D - Medication Administration

**Lessons Covered:** 111

**Plain Language Content**
- All medication administration requires a current written physician order.
- Use the five rights: right patient, right medication, right dose, right route, right time.
- Document administration immediately including patient response and any adverse effects observed.

**Home Health Examples**
- RN administers IV antibiotics per physician order and documents in the EMR immediately.
- LVN administers subcutaneous injection per care plan order and documents patient tolerance.
- RN identifies a patient allergic reaction after medication administration and activates emergency response.

---

## 8. Summary
- RN leads comprehensive assessment, care planning, and team supervision.
- LVN scope is defined by BVN&PT and requires RN/physician supervision in home health.
- Delegation requires care plan documentation and competency verification.
- Medication administration requires current orders, five rights, and immediate documentation.

---

## 9. Assessment

**Format:** 6 MCQ | Pass: 80% (5/6)

**Q1.** The RN's primary responsibilities in home health include:
- A. Completing only initial assessments
- B. Comprehensive assessment, care planning, team supervision, and ongoing clinical oversight
- C. Only documenting physician orders
- D. Delegating all assessments to LVNs
- **Correct: B** | The RN holds the primary clinical oversight role.

**Q2.** LVN scope in California home health permits:
- A. Independent comprehensive assessments
- B. Care implementation under RN or physician supervision within BVN&PT-defined scope
- C. Practice with no supervision requirement
- D. Independent care plan development
- **Correct: B** | LVN practice requires supervision and has defined scope limitations.

**Q3.** Delegation of tasks to HHA requires:
- A. Verbal agreement only
- B. Task appropriateness assessment, care plan documentation, and ongoing RN oversight
- C. Any task the HHA offers to perform
- D. Delegation only when the RN is unavailable
- **Correct: B** | Delegation requires assessment, documentation, and supervision.

**Q4.** Medication administration requires:
- A. Verbal physician authorization
- B. A current written physician order, correct administration technique, and immediate documentation
- C. Self-authorization by the nurse
- D. Only oral medication orders
- **Correct: B** | All medication administration requires current orders and full documentation.

**Q5.** When supervising an LVN, the RN must:
- A. Allow the LVN to practice fully independently
- B. Provide supervision to ensure patient safety and scope compliance
- C. Co-sign all documentation
- D. Make all LVN clinical decisions
- **Correct: B** | RN supervision of LVN must ensure safety and scope adherence.

**Q6.** An LVN performing a task outside their licensed scope requires:
- A. Completing the task if the patient needs it
- B. Immediate RN intervention to stop the task and address the scope issue
- C. Documentation only
- D. Supervisor notification at the next team meeting
- **Correct: B** | Scope violations require immediate RN intervention.

---

## 10. LMS JSON

```json
{
  "module": { "id": "M22", "name": "RN and LVN Scope and Supervision", "version": "1.0.0",
    "durationMinutes": { "min": 18, "target": 22, "max": 25 },
    "targetRoles": ["RN","LVN","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M22-S01", "title": "RN Assessment Role", "durationMinutes": 5, "lessons": [108] },
    { "id": "M22-S02", "title": "LVN Scope of Practice", "durationMinutes": 4, "lessons": [109] },
    { "id": "M22-S03", "title": "Supervision and Delegation", "durationMinutes": 5, "lessons": [110] },
    { "id": "M22-S04", "title": "Medication Administration", "durationMinutes": 4, "lessons": [111] },
    { "id": "M22-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M22-QZ", "questionCount": 6, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M22", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
