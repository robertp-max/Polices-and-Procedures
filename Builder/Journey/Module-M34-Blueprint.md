# Module M34 Blueprint

## 1. Module Overview
- Module ID: M34
- Module Name: Surveillance, Drill Evaluation, and Audit Evidence
- Track: F (Quality and Performance Improvement)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 18-22 minutes
- Training Type: Quality improvement awareness
- Target Roles: RN, LVN, CNA, HHA, Admin, DON, Compliance, HR
- Policy Source: Infection Surveillance Policy, Drill Evaluation Policy, Audit Evidence Standards Policy

## 2. Learning Objectives
- Apply infection surveillance data collection and response procedures.
- Conduct and document post-drill evaluation and after-action review.
- Maintain records that meet audit evidence standards.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 5 min | Section C: 6 min | Summary: 2 min | Assessment: 3 min
- Total: 23 minutes

---

## 4. Section A - Infection Surveillance

**Lessons Covered:** 153

**Plain Language Content**
- Infection surveillance tracks infections across patients and staff to identify trends and prevent outbreaks.
- Staff must report any patient or staff infection to the designated surveillance coordinator.
- Surveillance data is analyzed quarterly and compared to national benchmarks.

**Home Health Examples**
- RN reports a patient with a new UTI to the infection surveillance coordinator per reporting protocol.
- Compliance reviews quarterly surveillance reports and triggers a QAPI PIP when infection rates exceed benchmarks.

---

## 5. Section B - Drill Evaluation and After-Action Review

**Lessons Covered:** 154

**Plain Language Content**
- After each emergency drill, conduct an after-action review (AAR) to evaluate: staff participation, communication effectiveness, patient contact completion, and documentation accuracy.
- AAR findings are documented and used to update the emergency plan.
- The AAR report is presented to leadership and filed in the compliance record.

**Home Health Examples**
- DON leads the post-drill AAR discussion and documents three improvement items.
- Compliance tracks AAR improvement items through implementation and verifies completion.

---

## 6. Section C - Audit Evidence Standards

**Lessons Covered:** 155

**Plain Language Content**
- Audit evidence must be: accurate (reflecting actual events), contemporaneous (created at time of the event), complete, legible, and tamper-evident.
- Records must be organized, labeled, and accessible for internal and external audit at any time.
- Access controls prevent unauthorized modification of audit evidence.

**Home Health Examples**
- Compliance organizes the audit evidence binder by domain (clinical, billing, HIPAA, emergency, QAPI).
- IT enables audit log tracking for all PHI access events.
- Admin documents all policy acknowledgments with date, staff name, and version number.

---

## 7. Summary
- Infection surveillance identifies trends; report all infections promptly.
- Drill after-action reviews drive emergency plan improvements; document and track findings.
- Audit evidence must be accurate, contemporaneous, and protected from alteration.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Infection surveillance in home health involves:
- A. Tracking only staff illnesses
- B. Systematically monitoring and recording infection data to identify trends and prevent outbreaks
- C. Reporting only hospital-acquired infections
- D. Running lab tests on all patients
- **Correct: B** | Surveillance enables prevention and outbreak control.

**Q2.** After-action review following an emergency drill evaluates:
- A. Individual blame for errors
- B. What worked, what failed, and what improvements the emergency plan needs
- C. Only whether the drill was completed
- D. Only the documentation
- **Correct: B** | After-action review converts drill experience into plan improvements.

**Q3.** Audit evidence standards require records to be:
- A. Stored on personal devices
- B. Accurate, contemporaneous, complete, legible, and protected from alteration
- C. Perfect without any corrections
- D. In printed format only
- **Correct: B** | Evidence standards ensure records are defensible in audits.

**Q4.** An infection cluster among agency patients requires:
- A. Waiting to confirm before acting
- B. Notifying DON/compliance, investigating, and initiating control measures per agency policy
- C. Quarterly reporting
- D. Only notifying affected patients
- **Correct: B** | Infection clusters require immediate investigation and response.

**Q5.** Proper document retention for audit readiness means:
- A. Keeping records only until the next audit
- B. Retaining records per agency and regulatory schedules in secure, organized systems with access controls
- C. Allowing any staff to modify records
- D. Using only portable storage devices
- **Correct: B** | Audit readiness requires proper retention with access controls.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M34", "name": "Surveillance, Drill Evaluation, and Audit Evidence", "version": "1.0.0",
    "durationMinutes": { "min": 18, "target": 22, "max": 23 },
    "targetRoles": ["RN","LVN","CNA","HHA","Admin","DON","Compliance","HR"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M34-S01", "title": "Infection Surveillance", "durationMinutes": 5, "lessons": [153] },
    { "id": "M34-S02", "title": "Drill Evaluation and After-Action Review", "durationMinutes": 5, "lessons": [154] },
    { "id": "M34-S03", "title": "Audit Evidence Standards", "durationMinutes": 6, "lessons": [155] },
    { "id": "M34-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M34-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M34", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
