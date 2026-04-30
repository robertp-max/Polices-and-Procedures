# Module M07 Blueprint

## 1. Module Overview
- Module ID: M7
- Module Name: Infection Prevention and Bag Technique
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 15-18 minutes
- Training Type: Awareness-level with applied competency
- Target Roles: RN, LVN, CNA, HHA, DON, Compliance
- Policy Source: Infection Prevention Policy, Bag Technique Policy, PPE Policy

### Detailed Overview
Preventing infections in home health requires consistent application of infection control principles in an uncontrolled environment. This module covers foundational infection prevention, hand hygiene and PPE selection, and correct bag technique for maintaining a clean supply zone during home visits.

## 2. Learning Objectives
- Apply infection prevention principles in home health settings.
- Select and use hand hygiene and PPE correctly.
- Demonstrate bag technique to maintain a clean zone during visits.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 4 min | Section B: 4 min | Section C: 4 min | Summary: 2 min | Assessment: 3 min
- Total: 19 minutes

---

## 4. Section A - Infection Prevention Principles

**Lessons Covered:** 40

**Plain Language Content**
- Home environments are not controlled clinical settings; infection risks are present in every visit.
- Standard precautions treat every patient interaction as a potential exposure risk.
- Chain of infection must be broken at every possible point: source, transmission, and host.

**Home Health Examples**
- RN identifies that a household member is symptomatic and adjusts PPE before entering the patient area.
- CNA performs hand hygiene immediately upon entering and before any patient contact.

**Role Awareness Cues**
- All clinical roles: apply standard precautions consistently regardless of the patient's known status.
- DON: monitor and reinforce infection prevention compliance during supervisory visits.

---

## 5. Section B - Hand Hygiene and PPE

**Lessons Covered:** 41

**Plain Language Content**
- Perform hand hygiene: before patient contact, before procedures, after patient contact, after touching potentially contaminated surfaces.
- PPE selection matches the task: gloves for any contact with body fluids, mask for respiratory risk, gown for splash risk.
- Improper PPE donning or doffing sequence can cause self-contamination.

**Home Health Examples**
- HHA dons gloves before personal care and removes them using the correct technique before leaving the patient area.
- RN selects a mask and gown when performing wound care on an infected wound.

**Role Awareness Cues**
- All clinical roles: know the five moments of hand hygiene and apply them consistently.
- DON/Compliance: observe and document hand hygiene compliance during supervisory visits.

---

## 6. Section C - Bag Technique

**Lessons Covered:** 42

**Plain Language Content**
- The clinical bag is the clean zone; supplies removed from it must not be returned after contact with the patient environment.
- Place a barrier (paper towel or pad) under the bag when setting it down in the patient home.
- Clean and disinfect the bag exterior regularly per agency policy.

**Home Health Examples**
- LVN places a barrier barrier before setting the bag on the kitchen table, removes supplies, and does not return used items to the bag.
- CNA disinfects stethoscope before returning it to the bag after patient use.

**Role Awareness Cues**
- All clinical roles: follow bag technique protocol on every visit without exception.
- DON: include bag technique observation in supervisory visit documentation.

---

## 7. Summary
- Apply standard precautions on every visit regardless of patient diagnosis.
- Perform hand hygiene at all five moments; select PPE to match task exposure.
- Maintain the clinical bag as a clean zone at all times.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Standard precautions in infection control apply:
- A. Only to patients with known infections
- B. To all patient interactions regardless of infection status
- C. Only to clinical staff
- D. Only during wound care procedures
- **Correct: B** | Standard precautions are universal.

**Q2.** Hand hygiene must be performed:
- A. Only at the start and end of a visit
- B. Before patient contact, before procedures, after patient contact, and after touching contaminated surfaces
- C. Only when gloves are not available
- D. Only when hands are visibly soiled
- **Correct: B** | The five moments of hand hygiene define when it must occur.

**Q3.** Correct PPE selection depends on:
- A. Staff preference
- B. The anticipated level of exposure and type of task
- C. Patient diagnosis only
- D. Glove size availability
- **Correct: B** | PPE must be matched to the specific task and exposure risk.

**Q4.** Bag technique requires:
- A. Keeping personal items in the work bag
- B. Using the bag as a clean zone with a barrier under it and not returning used items to the bag
- C. Carrying all medications in the clinical bag
- D. Using disposable bags for each visit
- **Correct: B** | The bag is a controlled clean supply zone.

**Q5.** After completing a wound care procedure using gloves, the correct action is:
- A. Remove gloves at the front door when leaving
- B. Remove gloves using correct doffing technique, perform hand hygiene immediately
- C. Keep gloves on until returning to the car
- D. Rinse gloves with water and reuse
- **Correct: B** | Correct doffing sequence and immediate hand hygiene prevent self-contamination.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M7", "name": "Infection Prevention and Bag Technique", "version": "1.0.0",
    "durationMinutes": { "min": 15, "target": 18, "max": 20 },
    "targetRoles": ["RN","LVN","CNA","HHA","DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M7-S01", "title": "Infection Prevention Principles", "durationMinutes": 4, "lessons": [40] },
    { "id": "M7-S02", "title": "Hand Hygiene and PPE", "durationMinutes": 4, "lessons": [41] },
    { "id": "M7-S03", "title": "Bag Technique", "durationMinutes": 4, "lessons": [42] },
    { "id": "M7-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M7-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M7", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
