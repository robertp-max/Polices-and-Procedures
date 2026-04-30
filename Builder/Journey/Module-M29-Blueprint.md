# Module M29 Blueprint

## 1. Module Overview
- Module ID: M29
- Module Name: Intake, Eligibility, and Admission Packet
- Track: E (Operations and Administrative Compliance)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 15-18 minutes
- Training Type: Administrative awareness
- Target Roles: Admin, DON, Compliance, HR, IT
- Policy Source: Intake Policy, Eligibility Verification Policy, Admission Packet Policy

## 2. Learning Objectives
- Process referrals through the intake workflow with complete documentation.
- Verify insurance eligibility and authorization before services begin.
- Compile the required admission packet per CMS and agency standards.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 4 min | Section B: 4 min | Section C: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 20 minutes

---

## 4. Section A - Referral Intake Process

**Lessons Covered:** 135

**Plain Language Content**
- The intake process captures: patient demographics, referring physician, diagnosis, payer information, and clinical summary.
- All intake information must be documented in the agency system before care is initiated.
- Intake staff must verify completeness of the referral before routing to the clinical team.

**Home Health Examples**
- Admin intake coordinator receives a referral from a hospital discharge planner and enters all required fields in the EMR.
- Admin flags an incomplete referral and contacts the referral source for missing clinical documentation.

---

## 5. Section B - Eligibility Verification

**Lessons Covered:** 136

**Plain Language Content**
- Eligibility verification confirms active insurance coverage, authorized services, and available benefits before care begins.
- Authorization for home health services must be obtained from the payer before the first visit.
- Unverified eligibility = unverifiable billing = non-reimbursable claims.

**Home Health Examples**
- Admin verifies Medicare Part A coverage and homebound status prior to scheduling the SOC visit.
- IT configures eligibility check integrations to run automatically at intake for primary payers.

---

## 6. Section C - Admission Packet Requirements

**Lessons Covered:** 137

**Plain Language Content**
- The admission packet includes all CMS- and agency-required documents signed at or before the start of care.
- Required elements: patient rights document (NPP), financial agreement, advance directive inquiry, consent to treat, and agency disclosures.
- Incomplete admission packets create compliance and billing risk.

**Home Health Examples**
- Admin prepares the admission packet and ensures all required signatures are obtained at the SOC visit.
- Compliance audits admission packet completeness as part of the monthly chart audit.

---

## 7. Summary
- Complete intake documentation before routing referrals to the clinical team.
- Verify eligibility and authorization before the first visit — no exceptions.
- The admission packet must be complete and signed per CMS and agency requirements.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** The referral intake process requires:
- A. Only verbal confirmation from the referring party
- B. Complete patient information, payer details, and clinical summary documented in the agency system per protocol
- C. Starting care before documentation is complete
- D. Clinical staff intake only
- **Correct: B** | Complete intake documentation is essential for care initiation.

**Q2.** Eligibility verification must confirm:
- A. That the patient has a telephone
- B. Active insurance coverage, authorized services, and benefit availability before care begins
- C. Only Medicare Part A enrollment
- D. That the family can pay privately
- **Correct: B** | Eligibility verification protects against billing errors and unauthorized services.

**Q3.** The admission packet must include:
- A. Only the care plan
- B. All required consents, patient rights documents, financial agreement, and regulatory disclosures per CMS
- C. Insurance cards only
- D. The physician's contact information
- **Correct: B** | The admission packet is a regulatory requirement for starting care.

**Q4.** What happens if eligibility is not verified before starting services?
- A. Care proceeds normally
- B. The agency risks delivering non-reimbursable services and creating compliance exposure
- C. Only minor documentation correction is needed
- D. The patient automatically becomes self-pay
- **Correct: B** | Unverified eligibility creates billing and compliance risk.

**Q5.** Authorization tracking during intake ensures:
- A. Unlimited visits can be scheduled
- B. Services are billed and delivered only within approved authorization limits
- C. The scheduler determines visit limits independently
- D. Physicians approve all scheduling decisions
- **Correct: B** | Authorization tracking protects against unauthorized claims.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M29", "name": "Intake, Eligibility, and Admission Packet", "version": "1.0.0",
    "durationMinutes": { "min": 15, "target": 18, "max": 20 },
    "targetRoles": ["Admin","DON","Compliance","HR","IT"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M29-S01", "title": "Referral Intake Process", "durationMinutes": 4, "lessons": [135] },
    { "id": "M29-S02", "title": "Eligibility Verification", "durationMinutes": 4, "lessons": [136] },
    { "id": "M29-S03", "title": "Admission Packet Requirements", "durationMinutes": 5, "lessons": [137] },
    { "id": "M29-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M29-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M29", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
