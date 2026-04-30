# Module M38 Blueprint

## 1. Module Overview
- Module ID: M38
- Module Name: QAPI Leadership and Clinical Supervision Program
- Track: G (Leadership and Governance)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 12-15 minutes
- Training Type: Leadership awareness
- Target Roles: RN, LVN, Admin, DON, Compliance
- Policy Source: QAPI Leadership Policy, Clinical Supervision Program Policy

## 2. Learning Objectives
- Describe the leader's role in driving QAPI as a performance culture.
- Explain the structure and expectations of the clinical supervision program for direct care staff.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 17 minutes

---

## 4. Section A - QAPI Leadership Responsibilities

**Lessons Covered:** 164

**Plain Language Content**
- Leaders set the tone for quality: when leadership prioritizes QAPI data, teams engage.
- Leadership responsibilities in QAPI: designate committee membership, review data, approve PIPs, drive accountability, and communicate outcomes to staff.
- QAPI is not a paperwork exercise — it is a leadership accountability system.

**Home Health Examples**
- Administrator presents QAPI outcome data at the all-staff meeting each quarter to build a shared quality culture.
- DON holds care coordinators accountable for QAPI action items with defined deadlines.
- Compliance tracks PIP outcomes and reports to the governing body on improvement progress.

---

## 5. Section B - Clinical Supervision Program

**Lessons Covered:** 165

**Plain Language Content**
- The clinical supervision program ensures all direct care staff receive supervisory oversight at defined intervals.
- For HHA/CNA: supervision is completed by RN/LVN, on-site or in-home, per CMS frequency requirements.
- Supervision includes: direct observation, competency verification, care coordination review, and documentation feedback.

**Home Health Examples**
- RN conducts a supervisory visit with a HHA and documents the observation, feedback provided, and care coordination discussion.
- DON reviews supervisory visit logs weekly to verify frequency compliance.
- Any competency concern identified during supervision is documented and escalated per agency policy.

---

## 6. Summary
- Leaders drive QAPI as a culture, not a compliance exercise; ownership starts at the top.
- Clinical supervision ensures safe care delivery for direct care staff through structured, documented oversight.

---

## 7. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Leadership's role in QAPI includes:
- A. Delegating all QAPI activities to the compliance officer
- B. Setting quality expectations, reviewing data, approving PIPs, and holding the team accountable
- C. Attending meetings only
- D. Reviewing data only at year-end
- **Correct: B** | Effective QAPI requires active, accountable leadership.

**Q2.** A clinical supervision program in home health is required to:
- A. Replace the plan of care
- B. Provide structured, documented oversight of direct care staff at CMS-required intervals
- C. Only satisfy billing requirements
- D. Be completed only when a complaint is received
- **Correct: B** | Clinical supervision is a CoP requirement with defined frequency and documentation.

**Q3.** During a supervisory visit, the supervisor should:
- A. Only sign the form
- B. Observe care delivery, verify competency, address care coordination, and provide documentation feedback
- C. Only interview the patient
- D. Conduct supervisory visits only at discharge
- **Correct: B** | Supervisory visits serve multiple clinical and compliance functions.

**Q4.** When a competency concern is identified during supervision:
- A. Ignore minor issues
- B. Document the concern and escalate per agency policy
- C. Ask the aide to self-correct without documentation
- D. Notify the patient only
- **Correct: B** | Identified competency concerns require documentation and escalation.

**Q5.** QAPI effectiveness requires leaders to:
- A. Share results only with compliance
- B. Communicate improvement priorities and outcomes transparently to all staff
- C. Keep QAPI data confidential from frontline teams
- D. Present results only to the governing body
- **Correct: B** | Transparent QAPI communication builds quality culture across the organization.

---

## 8. LMS JSON

```json
{
  "module": { "id": "M38", "name": "QAPI Leadership and Clinical Supervision Program", "version": "1.0.0",
    "durationMinutes": { "min": 12, "target": 15, "max": 17 },
    "targetRoles": ["RN","LVN","Admin","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M38-S01", "title": "QAPI Leadership Responsibilities", "durationMinutes": 5, "lessons": [164] },
    { "id": "M38-S02", "title": "Clinical Supervision Program", "durationMinutes": 5, "lessons": [165] },
    { "id": "M38-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M38-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M38", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
