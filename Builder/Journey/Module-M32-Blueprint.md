# Module M32 Blueprint

## 1. Module Overview
- Module ID: M32
- Module Name: RCA, Corrective Action, and Trend Monitoring
- Track: F (Quality and Performance Improvement)
- Version: 1.0.0
- Status: Drafted
- Estimated Duration: 18-22 minutes
- Training Type: Quality improvement awareness
- Target Roles: RN, LVN, Admin, DON, Compliance, HR
- Policy Source: Root Cause Analysis Policy, Corrective Action Policy, Trend Monitoring Policy

## 2. Learning Objectives
- Apply root cause analysis (RCA) methodology to identify systemic causes of adverse events.
- Develop corrective action plans with specific, measurable, accountable interventions.
- Use trend analysis to identify systemic improvement opportunities.

## 3. Screen Flow and Time Budget
- Intro: 2 min | Section A: 6 min | Section B: 6 min | Section C: 5 min | Summary: 2 min | Assessment: 3 min
- Total: 24 minutes

---

## 4. Section A - Root Cause Analysis

**Lessons Covered:** 147

**Plain Language Content**
- RCA identifies the underlying systemic factors — not the individual — contributing to an adverse event or near miss.
- Common RCA tools: 5 Whys, fishbone/Ishikawa diagram.
- RCA findings must lead to actionable system changes, not individual blame.

**Home Health Examples**
- DON leads RCA after a fall-related hospitalization, using the 5 Whys to trace the event to a gap in fall risk assessment timing.
- Compliance documents RCA findings and assigns corrective action to the appropriate team.

---

## 5. Section B - Corrective Action Planning

**Lessons Covered:** 148

**Plain Language Content**
- A corrective action plan (CAP) must include: specific interventions, responsible parties, timelines, and measurable success criteria.
- Vague or general corrective actions do not change systems and will fail.
- CAPs are tracked through completion with evidence of implementation.

**Home Health Examples**
- RCA identifies a fall risk assessment protocol gap; CAP includes: update the protocol, retrain staff, and audit compliance in 30 days.
- DON reviews CAP progress at each QAPI committee meeting.

---

## 6. Section C - Trend Analysis and Outcome Monitoring

**Lessons Covered:** 149

**Plain Language Content**
- Trend analysis reviews aggregated data over time to identify patterns that indicate systemic risk or opportunity.
- Single incidents are not trends; look for patterns across patients, time periods, or staff groups.
- Outcome monitoring after corrective action confirms whether the improvement was achieved and sustained.

**Home Health Examples**
- Compliance reviews six months of fall incident data and identifies that 70% occurred in patients with cognitive impairment; initiates a targeted PIP.
- DON confirms at the 90-day review that fall rates decreased after the corrective action was implemented.

---

## 7. Summary
- RCA finds root causes in systems, not individuals; use structured tools.
- Corrective action must be specific, accountable, and measurable.
- Trend analysis drives PIP initiation; outcome monitoring confirms improvement sustainability.

---

## 8. Assessment

**Format:** 5 MCQ | Pass: 80% (4/5)

**Q1.** Root cause analysis (RCA) is used to:
- A. Assign individual blame for an incident
- B. Identify the underlying systemic factors contributing to an adverse event
- C. Create disciplinary records
- D. Satisfy a single reporting requirement
- **Correct: B** | RCA identifies root causes to prevent recurrence, not to blame individuals.

**Q2.** Corrective action planning must include:
- A. General, non-specific guidance
- B. Specific interventions, responsible parties, timelines, and measurable outcomes
- C. Informal verbal agreements only
- D. Policy revision only
- **Correct: B** | Effective corrective actions are specific, accountable, and measurable.

**Q3.** Trend analysis in QAPI involves:
- A. Reviewing isolated incidents only
- B. Reviewing aggregated data over time to identify systemic patterns
- C. Individual performance reviews
- D. Monthly patient satisfaction surveys only
- **Correct: B** | Trend analysis requires longitudinal data to distinguish patterns from random variation.

**Q4.** Outcome monitoring after a corrective action is required to:
- A. Document that the action was completed
- B. Verify the corrective action achieved the intended improvement and sustain the change
- C. Satisfy regulatory documentation
- D. Close the incident record only
- **Correct: B** | Outcome monitoring verifies effectiveness and sustains improvements.

**Q5.** Who is responsible for implementing corrective actions?
- A. Only the compliance officer
- B. The assigned responsible party in the CAP, with leadership oversight
- C. Frontline staff only
- D. An external auditor
- **Correct: B** | Corrective action accountability requires assigned ownership and leadership oversight.

---

## 9. LMS JSON

```json
{
  "module": { "id": "M32", "name": "RCA, Corrective Action, and Trend Monitoring", "version": "1.0.0",
    "durationMinutes": { "min": 18, "target": 22, "max": 24 },
    "targetRoles": ["RN","LVN","Admin","DON","Compliance","HR"], "passThresholdPercent": 80, "maxAttempts": 3 },
  "sections": [
    { "id": "M32-S01", "title": "Root Cause Analysis", "durationMinutes": 6, "lessons": [147] },
    { "id": "M32-S02", "title": "Corrective Action Planning", "durationMinutes": 6, "lessons": [148] },
    { "id": "M32-S03", "title": "Trend Analysis and Outcome Monitoring", "durationMinutes": 5, "lessons": [149] },
    { "id": "M32-S05", "type": "summary", "durationMinutes": 2 }
  ],
  "assessment": { "id": "M32-QZ", "questionCount": 5, "passThresholdPercent": 80 },
  "evidence": { "recordTemplate": { "training_module_id": "M32", "module_version": "1.0.0", "evidence_type": "TRAINING_COMPLETION" } }
}
```
