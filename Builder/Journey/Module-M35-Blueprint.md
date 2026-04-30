# Module M35 Blueprint

## 1. Module Overview
- Module ID: M35
- Module Name: Governing Body and Administrator Accountability
- Track: G (Leadership and Governance)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 12-15 minutes
- Training Type: Leadership awareness
- Target Roles: Admin, DON, Compliance, HR
- Policy Source: Governing Body Policy, Administrator Accountability Policy, CMS CoP Governance Standards

## 2. Learning Objectives
- Describe governing body responsibilities for home health agency oversight.
- Explain the Administrator's authority and accountability for regulatory compliance.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 17 minutes

---

## 4. Section A - Governing Body Responsibilities

**Lessons Covered:** 156

**Plain Language Content**
- The governing body bears ultimate organizational accountability for the agency's compliance with CMS Conditions of Participation.
- Governing body responsibilities: approve policies, oversee quality outcomes, ensure financial integrity, and hold leadership accountable.
- CMS requires the governing body to ensure the agency is compliant with all applicable regulations.

**Home Health Examples**
- Board of directors reviews the annual QAPI report and approves the quality improvement priorities.
- Governing body reviews and approves the agency's policy manual on an annual cycle.

---

## 5. Section B - Administrator Authority and Accountability

**Lessons Covered:** 157

**Plain Language Content**
- The Administrator has day-to-day operational accountability for the agency's compliance with all applicable laws and regulations.
- The Administrator is the governing body's designated representative for operational management.
- When a conflict exists between internal policy and regulatory requirements, regulatory requirements govern.

**Home Health Examples**
- Administrator approves the agency's compliance work plan and holds all department heads accountable for their compliance domains.
- Administrator reviews QAPI reports quarterly and drives corrective action across all operational areas.

---

## 6. Summary
- The governing body holds ultimate accountability for agency compliance and quality.
- The Administrator leads day-to-day operational compliance.
- Regulatory requirements always supersede internal preferences.

---

## 7. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** The governing body of a home health agency is responsible for:
- A. Day-to-day clinical operations only
- B. Overall organizational accountability, policy approval, and compliance oversight
- C. Financial decisions only
- D. Emergency planning only
- **Correct: B** | The governing body bears ultimate accountability for agency operations.

**Q2.** CMS requires governing bodies to ensure:
- A. Only billing accuracy
- B. The agency meets all Conditions of Participation and delivers quality care
- C. Only staff satisfaction
- D. Only marketing goals are achieved
- **Correct: B** | CMS holds governing bodies accountable for CoP compliance.

**Q3.** The Administrator's authority includes:
- A. Only human resources decisions
- B. Day-to-day operational management and accountability for all regulatory compliance
- C. Only financial management
- D. Only marketing and referral relationships
- **Correct: B** | The Administrator is operationally accountable for all regulatory compliance.

**Q4.** When a conflict exists between governing body policy and regulatory requirements:
- A. Resolve in favor of governing body preferences
- B. Regulatory requirements govern; governing body policy must be updated accordingly
- C. Ignore unless an auditor identifies it
- D. Delegate to compliance without board involvement
- **Correct: B** | Regulatory requirements supersede internal policy.

**Q5.** The governing body's role in QAPI includes:
- A. No role beyond approving the budget
- B. Reviewing QAPI data, approving improvement priorities, and holding leadership accountable
- C. Conducting chart audits
- D. Only attending annual reviews
- **Correct: B** | The governing body provides oversight and accountability for QAPI.

---

## 8. LMS JSON

```json
{
  "module": { "id": "M35", "name": "Governing Body and Administrator Accountability", "version": "1.0.0",
    "durationMinutes": { "min": 12, "target": 15, "max": 17 },
    "targetRoles": ["Admin","DON","Compliance","HR"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M35-S01", "title": "Governing Body Responsibilities", "durationMinutes": 5, "lessons": [156] },
    { "id": "M35-S02", "title": "Administrator Accountability", "durationMinutes": 5, "lessons": [157] },
    { "id": "M35-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M35-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M35", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
