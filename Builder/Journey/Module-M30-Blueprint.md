# Module M30 Blueprint

## 1. Module Overview
- Module ID: M30
- Module Name: Office Operations and Evidence Handling
- Track: E (Operations and Administrative Compliance)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 20-24 minutes
- Training Type: Administrative awareness
- Target Roles: Admin, DON, Compliance, HR, IT
- Policy Source: Scheduling Policy, Complaint Routing Policy, PHI Handling Policy, Document Control Policy

## 2. Learning Objectives
- Manage scheduling and authorization within care plan and payer requirements.
- Route patient complaints through the formal complaint and grievance process.
- Apply PHI handling standards in the office environment.
- Maintain document control and evidence handling per policy.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 4 min | Section C: 6 min | Section D: 4 min | Summary: 2 min | Assessment: 3 min
- Total: 26 minutes

---

## 4. Section A - Scheduling and Authorization

**Lessons Covered:** 138, 139

**Plain Language Content**
- Visit scheduling must align with: the care plan frequency/duration, payer authorization, and patient availability.
- Any scheduling deviation from the authorized care plan requires documentation and, if clinically significant, a clinical review.
- Authorization expiration must be tracked; visits cannot be scheduled beyond authorization limits.

**Home Health Examples**
- Admin tracks authorization expiration dates and triggers renewal requests at least 5 days before expiration.
- Scheduler identifies a conflict between care plan frequency and authorization limits and escalates to the DON.

---

## 5. Section B - Complaint Routing and Escalation

**Lessons Covered:** 140

**Plain Language Content**
- Every complaint from a patient, family member, or representative must be formally captured, acknowledged in writing, and routed for investigation.
- Grievances require a written response within CMS-defined timeframes (typically 30 days).
- Complaint trends are tracked and reported to QAPI.

**Home Health Examples**
- Admin receives a telephone complaint, logs it in the complaint tracker, and issues an acknowledgment letter.
- Compliance investigates a formal grievance, documents findings, and issues the written response within 30 days.

---

## 6. Section C - PHI Handling in the Office

**Lessons Covered:** 141, 142

**Plain Language Content**
- Office staff encounter PHI in all formats: paper, electronic, verbal, and fax.
- Apply minimum necessary; do not access patient records beyond what is required for the specific task.
- Secure all PHI: lock file cabinets, log off workstations, and use secure fax and email for PHI transmission.

**Home Health Examples**
- Admin logs off the workstation whenever leaving the desk unattended.
- HR faxes documents containing PHI only to verified, secure fax numbers and documents the transmission.
- IT configures auto-lock on workstations after 5 minutes of inactivity.

---

## 7. Section D - Document Control and Evidence Handling

**Lessons Covered:** 143

**Plain Language Content**
- Document control ensures only current, approved versions of policies and forms are in use.
- Evidence handling requires records to be accurate, contemporaneous, secure from alteration, and accessible for authorized audit.
- Retention periods govern how long documents must be kept; destruction requires approved methods.

**Home Health Examples**
- Admin removes superseded policy versions from shared drives and replaces with the current version.
- Compliance maintains an evidence binder with audit-ready documentation organized by domain.
- IT controls version access in the document management system to prevent use of outdated forms.

---

## 8. Summary
- Scheduling must stay within authorization limits; track expirations proactively.
- All complaints are formally logged, investigated, and resolved per CMS-defined timelines.
- Office PHI handling applies the same standards as clinical settings.
- Document control prevents use of outdated policies; evidence must be audit-ready.

---

## 9. Assessment

**Format:** 6 MCQ | Pass: 80% (5/6)

**Q1.** Scheduling compliance requires:
- A. Scheduling at staff convenience
- B. Aligning visit frequency with care plan orders and payer authorization at all times
- C. Scheduling as many visits as possible
- D. Scheduling only when patients call to request
- **Correct: B** | Scheduling must comply with the care plan and authorization parameters.

**Q2.** Complaint routing requires:
- A. Keeping complaints informal
- B. Formally capturing, acknowledging, routing, and tracking all complaints to resolution
- C. Resolving only escalated complaints
- D. Routing all complaints only to the administrator
- **Correct: B** | All complaints require formal capture, routing, and tracking.

**Q3.** PHI handling in the office requires:
- A. Discussing patient information in open areas
- B. Applying minimum necessary, securing records, and following agency PHI policy
- C. Sharing PHI freely among all office staff
- D. Printing all PHI for easier access
- **Correct: B** | Office PHI handling requires the same HIPAA controls as clinical settings.

**Q4.** Document control ensures:
- A. All documents are kept indefinitely
- B. Only current, approved versions are available; outdated versions are removed
- C. Staff can modify documents freely
- D. Electronic records are always printed as backup
- **Correct: B** | Document control prevents use of outdated versions.

**Q5.** Authorization tracking must verify:
- A. Patient satisfaction levels
- B. Service authorization limits before each visit is scheduled or delivered
- C. Only initial episode authorization
- D. Only Medicare authorizations
- **Correct: B** | Authorization must be verified for every service cycle.

**Q6.** Evidence handling procedures ensure records are:
- A. Stored wherever convenient
- B. Accurate, secure, accessible for authorized audit, and protected from alteration
- C. Shared freely with external parties
- D. Retained only in paper format
- **Correct: B** | Evidence integrity supports audit readiness and compliance defense.

---

## 10. LMS JSON

```json
{
  "module": { "id": "M30", "name": "Office Operations and Evidence Handling", "version": "1.0.0",
    "durationMinutes": { "min": 20, "target": 24, "max": 26 },
    "targetRoles": ["Admin","DON","Compliance","HR","IT"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M30-S01", "title": "Scheduling and Authorization", "durationMinutes": 5, "lessons": [138,139] },
    { "id": "M30-S02", "title": "Complaint Routing and Escalation", "durationMinutes": 4, "lessons": [140] },
    { "id": "M30-S03", "title": "PHI Handling in the Office", "durationMinutes": 6, "lessons": [141,142] },
    { "id": "M30-S04", "title": "Document Control and Evidence Handling", "durationMinutes": 4, "lessons": [143] },
    { "id": "M30-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M30-QZ", "questionCount": 6, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M30", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
