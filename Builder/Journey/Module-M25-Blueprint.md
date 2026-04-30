# Module M25 Blueprint

## 1. Module Overview
- Module ID: M25
- Module Name: Therapy Scope and Roles
- Track: B (Clinical and Patient Care)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 18-22 minutes
- Training Type: Administrative and oversight awareness
- Target Roles: DON, Compliance
- Policy Source: Therapy Services Policy, PT/OT/SLP Scope of Practice Policy

## 2. Learning Objectives
- Identify coverage criteria for therapy services in home health.
- Describe the roles and scope of PT, OT, and SLP in home health.
- Verify that therapy care plans meet CMS physician order requirements.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 5 min | Section B: 6 min | Section C: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 23 minutes

---

## 4. Section A - Therapy Coverage Criteria and Care Planning

**Lessons Covered:** 118, 119

**Plain Language Content**
- Therapy services are covered under Medicare home health when: the patient is homebound, skilled therapy is medically necessary, and services are ordered by a physician.
- The therapy care plan must reflect physician-ordered goals, interventions, frequency, and duration.
- Therapy services may qualify a patient for home health even without a skilled nursing need.

**Home Health Examples**
- DON verifies physician order for PT services and confirms homebound status documentation at SOC.
- Compliance reviews therapy care plans for completeness of physician-ordered elements during chart audit.

---

## 5. Section B - Physical Therapy and Occupational Therapy Roles

**Lessons Covered:** 120, 121

**Plain Language Content**
- PT: assessment of mobility, strength, balance, and gait; development and implementation of exercise programs; fall prevention.
- OT: assessment and training in activities of daily living (ADLs) and instrumental ADLs (IADLs); home modification; adaptive equipment recommendation.
- Both PT and OT may evaluate for and establish the home health plan of care independently under CMS rules.

**Home Health Examples**
- PT develops a home exercise program for a post-fracture patient and establishes visit frequency per the physician's PT order.
- OT trains a stroke patient in adaptive techniques for dressing and evaluates the home for modification needs.

---

## 6. Section C - Speech-Language Pathology Role

**Lessons Covered:** 122

**Plain Language Content**
- SLP addresses communication disorders (aphasia, dysarthria), cognitive-communication impairments, and dysphagia (swallowing disorders).
- Dysphagia evaluation and treatment are common SLP services in home health; diet modification recommendations require physician order.
- SLP may also qualify a patient for home health under CMS rules.

**Home Health Examples**
- SLP evaluates a post-stroke patient for dysphagia and recommends a pureed diet; obtains physician order.
- Compliance verifies SLP documentation of skilled need and homebound status in the chart.

---

## 7. Summary
- Therapy services require homebound status, skilled need, and physician orders.
- PT targets mobility and strength; OT targets functional independence; SLP addresses communication and swallowing.
- Each therapy discipline may independently establish home health eligibility under CMS.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Therapy services in home health are covered when:
- A. The patient requests them
- B. Skilled therapy is medically necessary, patient is homebound, and services are physician-ordered
- C. The patient has a Medicare card
- D. The physician recommends any therapy
- **Correct: B** | Coverage requires medical necessity, homebound status, and physician order.

**Q2.** The therapy care plan must:
- A. Be developed without physician input
- B. Reflect physician-ordered goals, interventions, frequency, and duration
- C. Be completed by the DON
- D. Address mobility only
- **Correct: B** | Therapy care plans require physician orders and goal-directed documentation.

**Q3.** PT services in home health primarily focus on:
- A. Communication and swallowing
- B. Restoring and maintaining movement, strength, balance, and functional mobility
- C. ADL training only
- D. Dietary planning
- **Correct: B** | PT addresses movement, strength, and functional mobility.

**Q4.** OT services primarily address:
- A. Respiratory function
- B. Functional independence in ADLs and home management, including adaptive equipment
- C. Medication management only
- D. Communication disorders
- **Correct: B** | OT targets ADL function and home adaptation.

**Q5.** SLP services in home health address:
- A. Physical therapy goals
- B. Communication disorders, cognitive-communication impairments, and dysphagia
- C. Hearing loss only
- D. Mobility and transfer training
- **Correct: B** | SLP addresses communication, cognition, and swallowing.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M25", "name": "Therapy Scope and Roles", "version": "1.0.0",
    "durationMinutes": { "min": 18, "target": 22, "max": 23 },
    "targetRoles": ["DON","Compliance"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M25-S01", "title": "Therapy Coverage and Care Planning", "durationMinutes": 5, "lessons": [118,119] },
    { "id": "M25-S02", "title": "PT and OT Roles", "durationMinutes": 6, "lessons": [120,121] },
    { "id": "M25-S03", "title": "SLP Role", "durationMinutes": 5, "lessons": [122] },
    { "id": "M25-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M25-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M25", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
