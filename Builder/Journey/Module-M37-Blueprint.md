# Module M37 Blueprint

## 1. Module Overview
- Module ID: M37
- Module Name: Survey Readiness, Policy Lifecycle, and Risk Management
- Track: G (Leadership and Governance)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 18-22 minutes
- Training Type: Leadership and compliance awareness
- Target Roles: RN, LVN, Admin, DON, Compliance, HR, CNA, HHA
- Policy Source: Survey Readiness Policy, Policy and Procedure Management Policy, Risk Management Program Policy

## 2. Learning Objectives
- Maintain continuous survey readiness across clinical and compliance domains.
- Apply the policy lifecycle process for policy development, review, and revision.
- Describe the agency's risk management program structure.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 6 min | Section B: 5 min | Section C: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 23 minutes

---

## 4. Section A - Survey Readiness

**Lessons Covered:** 161

**Plain Language Content**
- A CMS survey may happen at any time without advance notice — "survey ready = always ready."
- Survey readiness includes: current, accurate documentation; accessible records; staff who can demonstrate competency; and operational compliance with all CoPs.
- All staff must know who to notify and what to do when a surveyor arrives.

**Home Health Examples**
- DON maintains a survey readiness binder with current policies, staff training records, and QAPI reports organized for instant access.
- Admin knows to contact the DON and Administrator immediately upon a surveyor's arrival.
- RN can articulate the infection control protocol and locate the relevant policy on request.

---

## 5. Section B - Policy Lifecycle

**Lessons Covered:** 162

**Plain Language Content**
- Policies must be reviewed at least annually (or when regulations change) and updated to reflect current practice.
- Policy development requires: drafting, clinical/compliance review, approval by governing body or designee, implementation with staff training, and version control.
- Outdated or unapproved policies are a compliance risk; superseded versions must be removed from active use.

**Home Health Examples**
- Compliance leads the annual policy review cycle and tracks policy expiration dates.
- Admin removes a superseded policy from the shared folder and replaces it with the current approved version.
- New policy is approved; staff training is completed before the policy becomes effective.

---

## 6. Section C - Risk Management Program

**Lessons Covered:** 163

**Plain Language Content**
- The risk management program identifies, assesses, mitigates, and monitors organizational risks.
- Risk domains include: clinical risk (patient harm), compliance risk (regulatory violations), financial risk, and operational risk.
- Risk management intersects with QAPI, compliance, and emergency preparedness programs.

**Home Health Examples**
- Compliance documents agency risks in a risk register with ratings, mitigation actions, and owners.
- DON identifies wound care as a high-risk clinical domain and initiates a focused audit.
- Administrator reviews the risk register quarterly and reports to the governing body.

---

## 7. Summary
- Survey readiness is a continuous state, not an event — all staff must be ready at all times.
- Policies require annual review, version control, and training before implementation.
- Risk management identifies and mitigates organizational risks across all domains.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Survey readiness in home health means:
- A. Preparing materials only when a survey is scheduled
- B. Maintaining continuous compliance so the agency is ready for unannounced surveys at any time
- C. Only ensuring billing documentation is accurate
- D. Survey preparation is the compliance officer's responsibility only
- **Correct: B** | Surveys are unannounced; readiness must be continuous.

**Q2.** When a CMS surveyor arrives at the office, staff must:
- A. Ask the surveyor to reschedule
- B. Notify the DON and Administrator immediately per the survey readiness protocol
- C. Direct the surveyor to the billing department
- D. Continue working without notifying anyone
- **Correct: B** | Immediate leadership notification is required per survey readiness protocol.

**Q3.** Policy review requirements include:
- A. No formal review cycle
- B. At minimum annual review with updates when regulations or practices change
- C. Review only when an issue arises
- D. Physician review without agency input
- **Correct: B** | Policies require at minimum annual review to maintain compliance.

**Q4.** A risk register is used to:
- A. Track employee complaints
- B. Document identified risks with ratings, mitigation actions, and owners for ongoing monitoring
- C. Record patient incidents only
- D. Satisfy accreditation requirements only
- **Correct: B** | Risk registers support proactive risk monitoring and mitigation.

**Q5.** Policy training must occur:
- A. After the policy takes effect
- B. Before the policy becomes effective so staff can comply from day one
- C. Only at annual training
- D. Only for new employees
- **Correct: B** | Staff must be trained before policies become effective.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M37", "name": "Survey Readiness, Policy Lifecycle, and Risk Management", "version": "1.0.0",
    "durationMinutes": { "min": 18, "target": 22, "max": 23 },
    "targetRoles": ["RN","LVN","Admin","DON","Compliance","HR","CNA","HHA"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M37-S01", "title": "Survey Readiness", "durationMinutes": 6, "lessons": [161] },
    { "id": "M37-S02", "title": "Policy Lifecycle", "durationMinutes": 5, "lessons": [162] },
    { "id": "M37-S03", "title": "Risk Management Program", "durationMinutes": 5, "lessons": [163] },
    { "id": "M37-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M37-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M37", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
