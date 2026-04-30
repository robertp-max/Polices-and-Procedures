# Module M05 Blueprint

## 1. Module Overview
- Module ID: M5
- Module Name: Data Governance and PHI Controls
- Track: A (Core Compliance Foundation)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 18-22 minutes
- Training Type: Awareness-level
- Target Roles: Admin, DON, Compliance, HR, IT (L29 excludes clinical); ALL for L30-32
- Policy Source: Data Governance Policy, Records Retention Policy, AI Use Policy

### Detailed Overview
Beyond HIPAA basics, this module addresses the specific controls governing how data is stored, retained, destroyed, and managed in agency systems. It covers business associate obligations, records lifecycle management, shadow system prohibition, and AI tool governance.

### Detailed Description
Four content sections address the responsibilities of staff who manage, store, or transmit agency data. Home health examples illustrate common misuse patterns and correct behavior. A 5-question assessment validates key controls.

## 2. Learning Objectives
- Explain business associate PHI obligations under HIPAA.
- Apply records retention and destruction policies.
- Identify and avoid prohibited shadow systems.
- Follow agency AI and automated tool governance policy.

## 3. Screen Flow and Time Budget
- Intro: 2 min
- Section A - Business Associate PHI Handling: 4 min
- Section B - Records Retention and Destruction: 4 min
- Section C - Shadow Systems Prohibition: 5 min
- Section D - AI and Automated Tools Governance: 4 min
- Summary: 2 min
- Assessment: 3 min
- Total: 24 minutes

---

## 4. Section A - Business Associate PHI Handling

**Lessons Covered:** 29

**Plain Language Content**
- A Business Associate (BA) is a vendor or contractor that handles PHI on behalf of the agency.
- A Business Associate Agreement (BAA) must be signed before any PHI is shared with a BA.
- BAs must handle PHI under HIPAA-compliant controls; the agency is responsible for monitoring compliance.

**Home Health Examples**
- Admin verifies a BAA is on file before sending patient records to a billing vendor.
- Compliance reviews BA incident reports as part of quarterly oversight.
- IT ensures BA system integrations use encrypted data transfers.

**Role Awareness Cues**
- Admin: verify BAA before sharing PHI with vendors.
- IT: enforce technical BA controls.
- Compliance: maintain BA agreements and monitor compliance.

---

## 5. Section B - Records Retention and Destruction

**Lessons Covered:** 30

**Plain Language Content**
- Records must be retained for the period required by state and federal law (minimum 6 years for Medicare, 7 years for California).
- Records must not be destroyed before the required retention period ends.
- Destruction must use approved methods: shredding for paper, certified electronic deletion for digital records.

**Home Health Examples**
- Admin checks the retention schedule before purging a file.
- IT runs certified data wiping on a decommissioned device before disposal.
- Compliance documents destruction events per agency policy.

**Role Awareness Cues**
- Admin/HR: follow retention schedule before purging.
- IT: use certified destruction for electronic records and devices.
- Compliance: maintain destruction logs and audit annually.

---

## 6. Section C - Shadow Systems Prohibition

**Lessons Covered:** 31

**Plain Language Content**
- A shadow system is any unauthorized tool, spreadsheet, database, or storage location used to maintain patient or agency data outside approved systems.
- Shadow systems create uncontrolled PHI repositories that cannot be audited, backed up, or secured.
- Shadow systems are prohibited; use only agency-approved systems.

**Home Health Examples**
- A staff member creates a personal spreadsheet of patient names and contacts; this is a shadow system and must be deleted.
- An admin stores patient records in a personal Dropbox folder; this violates shadow system policy.
- IT discovers an unauthorized database on a workstation and initiates a data governance review.

**Role Awareness Cues**
- All roles: do not create or maintain personal data repositories.
- IT: scan for unauthorized data storage.
- Compliance: include shadow system checks in audits.

---

## 7. Section D - AI and Automated Tools Governance

**Lessons Covered:** 32

**Plain Language Content**
- AI tools and automated systems are governed by agency policy; not all tools are approved for agency work.
- Staff must not enter PHI or confidential agency data into unauthorized AI tools.
- Use of approved AI tools must comply with the agency AI governance policy.

**Home Health Examples**
- A clinician wants to use a public AI chatbot to help write a care note; this is prohibited if PHI would be entered.
- IT evaluates and approves AI tools before agency-wide deployment.
- Compliance monitors AI use logs for policy compliance.

**Role Awareness Cues**
- All roles: confirm tool is agency-approved before entering any work-related data.
- IT: maintain a list of approved tools and enforce use policies.
- Compliance: include AI governance in compliance monitoring.

---

## 8. Summary
- BA agreements are required before PHI is shared with any vendor.
- Records must be retained per schedule and destroyed only through approved methods.
- Shadow systems are prohibited; use only authorized systems.
- PHI must not be entered into unauthorized AI tools.

---

## 9. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** What is required before sharing PHI with a vendor?
- A. Verbal agreement with the vendor
- B. A signed Business Associate Agreement (BAA)
- C. IT approval only
- D. No requirement if vendor is known to the agency
- **Correct: B** | HIPAA requires a BAA before any PHI is shared with a BA.

**Q2.** Records destruction must occur:
- A. Whenever storage becomes full
- B. Per the retention schedule using approved destruction methods
- C. After each calendar year
- D. When the patient is discharged
- **Correct: B** | Destruction requires schedule compliance and approved methods.

**Q3.** A shadow system is prohibited because:
- A. It is too expensive
- B. It creates uncontrolled PHI storage outside approved governance controls
- C. Only IT systems are allowed
- D. It slows workflows
- **Correct: B** | Shadow systems bypass security, audit, and governance controls.

**Q4.** Before using an AI tool for work tasks, staff must:
- A. Use any tool they find helpful
- B. Confirm the tool is agency-approved and avoid entering PHI into unauthorized tools
- C. Ask a coworker if it is acceptable
- D. Use only tools over 5 years old
- **Correct: B** | AI governance policy governs tool selection and data handling.

**Q5.** The California records retention minimum for home health is:
- A. 1 year
- B. 7 years (stricter California requirement governs over federal 6-year minimum)
- C. 3 years
- D. Indefinite
- **Correct: B** | California requires 7-year retention; the stricter standard applies.

---

## 10. Evidence Model
- Required fields: training_module_id, module_version, user_id, completion_status, score, completion_timestamp, evidence_type=TRAINING_COMPLETION

---

## 11. LMS JSON

```json
{
  "module": {
    "id": "M5",
    "name": "Data Governance and PHI Controls",
    "version": "1.0.0",
    "durationMinutes": { "min": 18, "target": 22, "max": 24 },
    "targetRoles": ["Admin","DON","Compliance","HR","IT","RN","LVN","CNA","HHA"],
    "passThresholdPercent": 80,
    "maxAttempts": 3
  },
  "sections": [
    { "id": "M5-S01", "type": "content", "title": "Business Associate PHI Handling", "durationMinutes": 4, "lessons": [29] },
    { "id": "M5-S02", "type": "content", "title": "Records Retention and Destruction", "durationMinutes": 4, "lessons": [30] },
    { "id": "M5-S03", "type": "content", "title": "Shadow Systems Prohibition", "durationMinutes": 5, "lessons": [31] },
    { "id": "M5-S04", "type": "content", "title": "AI and Automated Tools Governance", "durationMinutes": 4, "lessons": [32] },
    { "id": "M5-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M5-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": {
    "requiredFields": ["training_module_id","module_version","user_id","completion_status","score","completion_timestamp","evidence_type"],
    "recordTemplate": { "training_module_id": "M5", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" }
  }
}
```
