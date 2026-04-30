# Module M36 Blueprint

## 1. Module Overview
- Module ID: M36
- Module Name: DON, Compliance, and Privacy Officer Roles
- Track: G (Leadership and Governance)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 15-18 minutes
- Training Type: Leadership and compliance awareness
- Target Roles: RN, LVN, Admin, DON, Compliance, HR, IT (varies by lesson)
- Policy Source: DON Role Policy, Compliance Program Policy, Privacy Officer Policy

## 2. Learning Objectives
- Describe the Director of Nursing's clinical oversight responsibilities.
- Explain the Compliance Officer's role in the compliance program.
- Define the Privacy Officer's HIPAA oversight responsibilities.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 4 min | Section C: 4 min | Summary: 2 min | Assessment: 3 min
- Total: 20 minutes

---

## 4. Section A - Director of Nursing Responsibilities

**Lessons Covered:** 158

**Plain Language Content**
- The DON oversees all clinical operations, supervises clinical staff, and ensures care quality meets CMS and agency standards.
- The DON is responsible for clinical supervision frequency compliance, OASIS accuracy oversight, and staff competency management.
- The DON serves as the liaison between clinical staff and administrative/compliance leadership.

**Home Health Examples**
- DON reviews supervisory visit documentation weekly to ensure 14-day frequency compliance.
- DON leads clinical staff meetings and communicates QAPI findings and updates.
- DON approves OASIS assessments before submission.

---

## 5. Section B - Compliance Officer Role

**Lessons Covered:** 159

**Plain Language Content**
- The Compliance Officer designs, implements, and oversees the agency's compliance program.
- Core compliance program elements: policies and procedures, training, monitoring, auditing, non-retaliation, and response to violations.
- The Compliance Officer is the designated resource for all compliance concerns; staff may report without fear of retaliation.

**Home Health Examples**
- Compliance Officer leads annual FWA training and updates the compliance calendar.
- Compliance Officer investigates a hotline report and documents the investigation per policy.
- Compliance Officer presents the annual compliance report to the governing body.

---

## 6. Section C - Privacy Officer Role

**Lessons Covered:** 160

**Plain Language Content**
- The Privacy Officer is responsible for HIPAA privacy compliance, privacy incident management, and privacy training.
- The Privacy Officer manages breach investigations and required notifications under HIPAA.
- Staff must report privacy incidents to the Privacy Officer immediately; the Privacy Officer determines breach status.

**Home Health Examples**
- Privacy Officer receives a report of a lost tablet containing PHI and initiates breach risk assessment.
- Privacy Officer updates privacy policies following a regulatory change.
- Privacy Officer trains new staff on HIPAA privacy at onboarding.

---

## 7. Summary
- DON leads clinical oversight, supervision, and staff competency management.
- Compliance Officer runs the structured compliance program; report concerns without fear of retaliation.
- Privacy Officer oversees HIPAA privacy; report all privacy incidents immediately.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** The DON is responsible for:
- A. Financial management only
- B. Clinical operations oversight, staff supervision, care quality, and CoP compliance in clinical domains
- C. Only completing OASIS reviews
- D. Only managing admissions
- **Correct: B** | The DON leads all clinical oversight.

**Q2.** The Compliance Officer's primary function is to:
- A. Investigate only external complaints
- B. Design, implement, and oversee the compliance program to prevent, detect, and respond to violations
- C. Handle billing only
- D. Serve as legal counsel
- **Correct: B** | The Compliance Officer leads the structured compliance program.

**Q3.** The Privacy Officer is responsible for:
- A. Only IT security
- B. HIPAA privacy compliance, breach management, and privacy training for all staff
- C. Only patient complaint management
- D. Only reviewing business associate agreements
- **Correct: B** | The Privacy Officer leads the agency's HIPAA privacy program.

**Q4.** When a staff member has a compliance concern:
- A. Resolve it informally with a coworker
- B. Contact the Compliance Officer directly or through the compliance hotline
- C. Only raise it at annual reviews
- D. Submit to external regulators first
- **Correct: B** | The Compliance Officer is the designated resource for compliance concerns.

**Q5.** Coordination between DON, Compliance Officer, and Privacy Officer is essential because:
- A. It reduces individual workloads
- B. Clinical, compliance, and privacy functions are interdependent and require coordinated oversight
- C. Regulators require joint meetings
- D. Only during external surveys
- **Correct: B** | Effective compliance requires integration across clinical, regulatory, and privacy functions.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M36", "name": "DON, Compliance, and Privacy Officer Roles", "version": "1.0.0",
    "durationMinutes": { "min": 15, "target": 18, "max": 20 },
    "targetRoles": ["RN","LVN","Admin","DON","Compliance","HR","IT"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M36-S01", "title": "DON Responsibilities", "durationMinutes": 5, "lessons": [158] },
    { "id": "M36-S02", "title": "Compliance Officer Role", "durationMinutes": 4, "lessons": [159] },
    { "id": "M36-S03", "title": "Privacy Officer Role", "durationMinutes": 4, "lessons": [160] },
    { "id": "M36-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M36-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M36", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
