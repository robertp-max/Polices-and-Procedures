# Module M40 Blueprint

## 1. Module Overview
- Module ID: M40
- Module Name: Incident Oversight and Vendor/BA Management
- Track: G (Leadership and Governance)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 12-15 minutes
- Training Type: Leadership and compliance awareness
- Target Roles: RN, LVN, Admin, DON, Compliance, HR (L169); Admin, DON, Compliance, HR, IT (L170)
- Policy Source: Incident Management and Oversight Policy, Business Associate Agreement Policy, Vendor Management Policy

## 2. Learning Objectives
- Apply incident oversight procedures from report through corrective action.
- Manage Business Associate relationships per HIPAA and agency vendor policy.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 17 minutes

---

## 4. Section A - Incident Oversight

**Lessons Covered:** 169

**Plain Language Content**
- Leadership is accountable for the full incident lifecycle: report receipt → investigation → root cause analysis → corrective action → closure → trend analysis.
- Incidents must be reported promptly; delays in reporting impair the investigation and corrective response.
- All incidents are tracked in the agency's incident log; aggregate trend data is presented to QAPI.

**Home Health Examples**
- DON receives an incident report from a field RN, initiates an investigation within 24 hours, and documents findings.
- Compliance tracks incident trends monthly and flags any recurrence to the DON for escalation.
- Administrator reviews the quarterly incident summary and monitors corrective action completion rates.

---

## 5. Section B - Vendor and Business Associate Oversight

**Lessons Covered:** 170

**Plain Language Content**
- Any vendor who creates, receives, maintains, or transmits PHI on behalf of the agency is a Business Associate (BA) and must execute a Business Associate Agreement (BAA) before receiving PHI.
- Vendor oversight requires: BAA execution, periodic vendor risk assessment, and monitoring for vendor security incidents.
- If a vendor experiences a breach involving the agency's PHI, the vendor must notify the agency and the agency must follow HIPAA breach notification requirements.

**Home Health Examples**
- Admin confirms that every software vendor with access to PHI has a current BAA on file.
- IT conducts an annual vendor risk assessment and reviews vendor security posture for all high-risk BAs.
- Compliance is notified immediately when a BA reports a security incident; breach risk assessment is initiated.

---

## 6. Summary
- Incident oversight is a lifecycle function — from report to closure to trend analysis.
- Every BA with access to PHI must have a current BAA; vendor risk must be actively monitored.
- BA security incidents trigger agency breach assessment obligations.

---

## 7. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Incident oversight requires leadership to:
- A. File the incident report and close the record
- B. Manage the full incident lifecycle from report through corrective action and trend monitoring
- C. Only notify the payer
- D. Forward all incidents to HR without investigation
- **Correct: B** | Leadership owns the complete incident lifecycle.

**Q2.** A Business Associate Agreement (BAA) is required:
- A. Only for vendors who bill insurance
- B. For any vendor who creates, receives, maintains, or transmits PHI on behalf of the agency
- C. Only for IT vendors
- D. Only for vendors with direct patient contact
- **Correct: B** | HIPAA requires BAAs for all vendors handling PHI.

**Q3.** Vendor risk assessment is conducted to:
- A. Review vendor pricing annually
- B. Evaluate each vendor's ability to safeguard PHI and identify risks before they become incidents
- C. Identify new vendor opportunities
- D. Satisfy accreditation only
- **Correct: B** | Vendor risk assessment is a proactive PHI security control.

**Q4.** When a Business Associate reports a security incident involving the agency's PHI:
- A. Wait for the BA to resolve it without agency involvement
- B. Immediately notify Compliance and initiate a breach risk assessment per HIPAA policy
- C. Only log the notification
- D. Notify patients immediately without investigation
- **Correct: B** | BA security incidents require immediate compliance notification and breach risk assessment.

**Q5.** Incident trend data must be:
- A. Kept confidential from leadership
- B. Aggregated, analyzed, and presented to the QAPI committee as part of systematic quality oversight
- C. Reported only to regulators
- D. Shared only on request
- **Correct: B** | Incident trend analysis is a core QAPI input.

---

## 8. LMS JSON

```json
{
  "module": { "id": "M40", "name": "Incident Oversight and Vendor/BA Management", "version": "1.0.0",
    "durationMinutes": { "min": 12, "target": 15, "max": 17 },
    "targetRoles": ["RN","LVN","Admin","DON","Compliance","HR","IT"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M40-S01", "title": "Incident Oversight", "durationMinutes": 5, "lessons": [169] },
    { "id": "M40-S02", "title": "Vendor and Business Associate Oversight", "durationMinutes": 5, "lessons": [170] },
    { "id": "M40-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M40-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M40", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
