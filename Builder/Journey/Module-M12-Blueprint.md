# Module M12 Blueprint

## 1. Module Overview
- Module ID: M12
- Module Name: Emergency Drills
- Track: D (Safety and OSHA)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 12-15 minutes
- Training Type: Awareness-level
- Target Roles: RN, LVN, CNA, HHA, Admin, DON, Compliance, HR
- Policy Source: Emergency Preparedness Plan, Drill Evaluation Policy

## 2. Learning Objectives
- Explain the purpose and expectations for emergency drill participation.
- Describe how drill results drive improvement to the emergency plan.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 3 min | Section B: 3 min | Section C: 3 min | Summary: 2 min | Assessment: 3 min
- Total: 16 minutes

---

## 4. Section A - Emergency Drill 1 Participation

**Lessons Covered:** 69

**Plain Language Content**
- Drill 1 simulates a specific emergency scenario (e.g., natural disaster or prolonged power outage).
- All assigned staff must participate as directed by the emergency plan.
- Drills build muscle memory for emergency response before a real event occurs.

**Home Health Examples**
- Admin activates the patient notification call tree during Drill 1.
- RN attempts contact with assigned high-risk patients and documents outcomes.
- DON evaluates clinical response and patient contact completion rates.

---

## 5. Section B - Emergency Drill 2 Participation

**Lessons Covered:** 70

**Plain Language Content**
- Drill 2 tests a different emergency scenario than Drill 1 (e.g., public health emergency or active threat).
- Staff who missed Drill 1 may not substitute Drill 1 participation for Drill 2.
- Drills are documented; participation is tracked per CMS requirements.

**Home Health Examples**
- HHA completes a drill scenario simulating a public health order requiring patient contact decisions.
- IT tests backup communication systems during Drill 2.
- HR confirms all staff completed participation documentation.

---

## 6. Section C - Post-Drill Evaluation and After-Action Review

**Lessons Covered:** 71

**Plain Language Content**
- After every drill, the agency conducts an after-action review to identify what worked and what did not.
- Improvement items from the after-action review update the emergency plan.
- Drill results are presented to leadership and documented in the compliance record.

**Home Health Examples**
- DON leads the after-action review and identifies that patient contact timing exceeded targets.
- Compliance documents the drill evaluation and tracks improvement items.
- Admin updates the emergency contact list based on drill gaps identified.

---

## 7. Summary
- Participate in all scheduled drills; participation is mandatory and tracked.
- Two drills annually at minimum — one per scenario type.
- After-action review turns drill findings into plan improvements.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** The purpose of emergency drill participation is:
- A. Satisfying a paperwork requirement
- B. Practicing emergency roles and identifying gaps before a real emergency
- C. Only relevant for new staff
- D. Required only once per career
- **Correct: B** | Drills build preparedness and expose plan gaps.

**Q2.** The agency conducts a minimum of how many emergency drills per year?
- A. One
- B. Two (two different scenarios)
- C. None unless required
- D. Monthly
- **Correct: B** | Two annual drills are standard for home health.

**Q3.** Post-drill evaluation serves to:
- A. Create disciplinary records
- B. Identify what worked and what failed, and drive improvement to the emergency plan
- C. Satisfy CMS documentation only
- D. Replace the drill report
- **Correct: B** | After-action review drives plan improvement.

**Q4.** Who is responsible for participating in emergency drills?
- A. Leadership only
- B. All staff assigned under the emergency plan
- C. Clinical staff only
- D. New employees in their first 90 days only
- **Correct: B** | Emergency drills require participation by all assigned staff.

**Q5.** Drill results must be:
- A. Communicated verbally only
- B. Documented and used to update emergency plans and training
- C. Filed and never reviewed
- D. Shared with patients
- **Correct: B** | Documentation of results drives the improvement cycle.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M12", "name": "Emergency Drills", "version": "1.0.0",
    "durationMinutes": { "min": 12, "target": 15, "max": 16 },
    "targetRoles": ["RN","LVN","CNA","HHA","Admin","DON","Compliance","HR"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M12-S01", "title": "Emergency Drill 1", "durationMinutes": 3, "lessons": [69] },
    { "id": "M12-S02", "title": "Emergency Drill 2", "durationMinutes": 3, "lessons": [70] },
    { "id": "M12-S03", "title": "Post-Drill Evaluation", "durationMinutes": 3, "lessons": [71] },
    { "id": "M12-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M12-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M12", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
