# Module M04 Blueprint

## 1. Module Overview
- Module ID: M4
- Module Name: HIPAA and Privacy Basics
- Track: A (Core Compliance Foundation)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 25-28 minutes
- Training Type: Awareness-level
- Target Roles: ALL (RN, LVN, CNA, HHA, Admin, DON, Compliance, HR, IT)
- Policy Source: HIPAA Privacy Policy, HIPAA Security Policy, CMIA Policy, Breach Response Policy

### Detailed Overview
HIPAA and California privacy law establish the baseline for protecting patient health information in all forms. This module ensures every workforce member understands privacy fundamentals, data handling expectations, and breach response obligations before accessing agency systems or patient information.

### Detailed Description
Learners complete four content sections covering HIPAA privacy, HIPAA security and CMIA, sensitive data and minimum necessary, and Notice of Privacy Practices and breach identification. A 7-question assessment validates awareness-level understanding.

## 2. Learning Objectives
- Describe HIPAA privacy and security requirements as applied in home health.
- Identify California-specific privacy obligations under CMIA.
- Apply the minimum necessary standard when handling PHI.
- Recognize and report a potential breach.

## 3. Screen Flow and Time Budget
- Intro: 2 min
- Section A - HIPAA Privacy Basics: 5 min
- Section B - HIPAA Security and CMIA: 6 min
- Section C - Sensitive Data and Minimum Necessary: 5 min
- Section D - Notice of Privacy Practices and Breach: 7 min
- Summary: 2 min
- Assessment: 3 min
- Total: 30 minutes

---

## 4. Section A - HIPAA Privacy Basics

**Lessons Covered:** 22

**Plain Language Content**
- PHI (Protected Health Information) is any individually identifiable health information in any format — paper, electronic, or verbal.
- PHI may only be used or disclosed for treatment, payment, operations, or with patient authorization.
- Every employee handles PHI and must protect it in all interactions.

**Home Health Examples**
- RN does not discuss patient diagnoses in a public coffee shop.
- HHA does not share patient information with a neighbor who asks.
- Admin shreds documents with patient information instead of using a regular trash bin.

**Role Awareness Cues**
- All roles: treat all patient information as private.
- Clinical roles: limit verbal PHI to care-necessary conversations.
- IT: enforce technical access controls.

---

## 5. Section B - HIPAA Security and CMIA

**Lessons Covered:** 23, 24

**Plain Language Content**
- HIPAA Security applies to electronic PHI (ePHI): it must be protected from unauthorized access, alteration, or destruction.
- California's CMIA (Confidentiality of Medical Information Act) extends additional protections specific to California, including stricter consent requirements.
- Both federal and California law apply simultaneously; the stricter standard governs.

**Home Health Examples**
- IT staff configure role-based access so staff can only view records for patients they are assigned to care for.
- Admin logs off workstations when leaving the desk to prevent unauthorized ePHI access.
- Compliance ensures CMIA-specific consent language is in the admission packet.

**Role Awareness Cues**
- All roles: follow password, access, and device security policies.
- IT: implement and maintain technical safeguards.
- Compliance: verify CMIA compliance in policies and practices.

---

## 6. Section C - Sensitive Data and Minimum Necessary

**Lessons Covered:** 25, 26

**Plain Language Content**
- Some PHI categories require heightened protection: mental health, substance use disorders (SUD), HIV status, and records of minors.
- These require additional consent before disclosure, even within the care team.
- The minimum necessary rule means only access or share the amount of PHI required for the specific task.

**Home Health Examples**
- RN does not share SUD history with a specialist who is not treating the substance use issue.
- Admin does not pull a full patient record when only the insurance information is needed.
- Compliance reviews access logs for patterns of over-access.

**Role Awareness Cues**
- All roles: only access PHI you need for your assigned task.
- Clinical roles: be aware of sensitive categories before disclosing.
- Compliance/DON: audit access for minimum necessary compliance.

---

## 7. Section D - Notice of Privacy Practices and Breach Identification

**Lessons Covered:** 27, 28

**Plain Language Content**
- The Notice of Privacy Practices (NPP) must be provided to patients at or before the first service delivery.
- A breach is any unauthorized access, use, or disclosure of unsecured PHI.
- Suspected breaches must be reported immediately to the supervisor or privacy officer; do not wait for confirmation.

**Home Health Examples**
- Admin provides the NPP as part of the admission packet and documents receipt.
- RN sends an email with patient information to the wrong recipient and reports it as a potential breach immediately.
- IT detects unauthorized access to patient records and activates the breach response protocol.

**Role Awareness Cues**
- All roles: report suspicious activity or potential breaches immediately.
- Admin: ensure NPP is included in all admission packets.
- IT/Compliance: lead breach investigation and notification.

---

## 8. Summary
- PHI includes all identifiable health information and must be protected at all times.
- CMIA adds California-specific requirements on top of federal HIPAA.
- Apply minimum necessary; access only what you need.
- Report all suspected breaches immediately.

---

## 9. Assessment

**Format:** 7 MCQ | Pass: 80% (6/7)

**Q1.** PHI includes:
- A. Only paper medical records
- B. Any individually identifiable health information in any format
- C. Only electronic records
- D. Only billing information
- **Correct: B** | PHI includes verbal, paper, and electronic formats.

**Q2.** The minimum necessary rule requires:
- A. Sharing all available information for efficiency
- B. Limiting PHI access and disclosure to what is needed for the specific task
- C. IT approval for all PHI access
- D. Patient consent for every access
- **Correct: B** | Minimum necessary limits exposure to what the task requires.

**Q3.** CMIA differs from HIPAA in that:
- A. It replaces HIPAA in California
- B. It provides stronger, California-specific protections including stricter consent requirements
- C. It only applies to mental health records
- D. It only applies to state employees
- **Correct: B** | CMIA layers California-specific requirements on top of HIPAA.

**Q4.** A potential PHI breach occurs when:
- A. A clinician accesses a record for an assigned patient
- B. PHI is accessed, used, or disclosed without proper authorization
- C. An NPP is provided to a patient
- D. A record is accessed for treatment purposes
- **Correct: B** | Unauthorized access triggers breach obligations.

**Q5.** When is the NPP provided to patients?
- A. Only if requested
- B. At or before the first service delivery
- C. Annually to all active patients
- D. Only at discharge
- **Correct: B** | NPP delivery timing is a regulatory requirement.

**Q6.** Sensitive data categories requiring additional consent include:
- A. All billing information
- B. Mental health, SUD, HIV status, and minor patient records
- C. Any record over 5 years old
- D. Emergency contact information
- **Correct: B** | These categories have heightened consent and protection requirements.

**Q7.** After accidentally emailing PHI to the wrong recipient, the correct action is:
- A. Recall the email and do nothing further
- B. Report the incident immediately to supervisor or privacy officer and follow breach protocol
- C. Wait to see if the recipient contacts the agency
- D. Delete the email chain
- **Correct: B** | Potential breaches require immediate reporting for proper investigation.

---

## 10. Enforcement Logic
- M4 completion required before any system access to patient records.
- Gate checkpoint: IAM provisioning verifies M4 completion status.

## 11. Evidence Model
- Required fields: training_module_id, module_version, user_id, completion_status, score, completion_timestamp, evidence_type=TRAINING_COMPLETION

---

## 12. LMS JSON

```json
{
  "module": {
    "id": "M4",
    "name": "HIPAA and Privacy Basics",
    "version": "1.0.0",
    "durationMinutes": { "min": 24, "target": 28, "max": 30 },
    "targetRoles": ["RN","LVN","CNA","HHA","Admin","DON","Compliance","HR","IT"],
    "passThresholdPercent": 80,
    "maxAttempts": 3
  },
  "sections": [
    { "id": "M4-S00", "type": "intro", "durationMinutes": 2 },
    { "id": "M4-S01", "type": "content", "title": "HIPAA Privacy Basics", "durationMinutes": 5, "lessons": [22] },
    { "id": "M4-S02", "type": "content", "title": "HIPAA Security and CMIA", "durationMinutes": 6, "lessons": [23,24] },
    { "id": "M4-S03", "type": "content", "title": "Sensitive Data and Minimum Necessary", "durationMinutes": 5, "lessons": [25,26] },
    { "id": "M4-S04", "type": "content", "title": "Notice of Privacy Practices and Breach", "durationMinutes": 7, "lessons": [27,28] },
    { "id": "M4-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M4-QZ", "questionCount": 7, "passThresholdPercent": 80 },
  "enforcement": {
    "rules": [{ "id": "M4-GATE-RECORDS", "if": "moduleStatus != CompletedPass", "then": "blockPatientRecordAccess" }],
    "checkpoints": ["iamProvisioning"]
  },
  "evidence": {
    "requiredFields": ["training_module_id","module_version","user_id","completion_status","score","completion_timestamp","evidence_type"],
    "recordTemplate": { "training_module_id": "M4", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" }
  }
}
```
