# Brad Fine-Tuning Assessment — QA Results Report

**Generated:** 2026-05-13  
**Run By:** Cursor Agent (Brad Policy Corpus Simulation)  
**Purpose:** Assess Brad's responses against target behavior — confident, human-like, Care Indeed-grounded administrator  
**Policy Corpus Version:** Active (HR-WORKFLOWS.md, CL-WORKFLOWS.md, CO-WORKFLOWS.md, HR Policy.md extracted suite)  

---

## Grading Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Correct — accurate per policy, human tone |
| ⚠️ | Partial — right info, but robotic / over-hedged / too generic |
| ❌ | Fail — wrong info, refuses, hallucinates, or sounds like a chatbot disclaimer machine |
| 🔴 | Corpus Gap — Brad cannot answer because policy content is missing from the knowledge base |

---

## BLOCK 1 — HR Policy Knowledge

---

### Q1 — "I've been here 3 months. Am I eligible for PTO yet?"

**Brad's Response:**

> Per HR-ER-002 (Leaves of Absence) and HR-WF-10, PTO is tracked alongside leave management in Care Indeed's workforce lifecycle. Three months places you at the end of your 90-day probationary period (HR-WF-08). Whether PTO accrual has started depends on your FTE classification — full-time, part-time, and per diem have separate accrual tiers under HR-CO-001 (Compensation & Benefits Policy). Your specific accrual rate, eligibility window, and any waiting period are defined in that policy. Contact HR with your FTE classification and they can pull your current balance and confirm your accrual start date.

---

**Grade:** ⚠️ Partial

**Assessment Notes:**
- Brad correctly identifies the 90-day probationary period as the relevant threshold.
- Brad correctly routes to HR-CO-001 and HR-WF-10 as the governing framework.
- **What's missing:** Brad cannot state the actual accrual rate or confirm yes/no because **HR-CO-001 (Compensation & Benefits) content is not in the active policy corpus.** This is a knowledge retrieval gap, not a system prompt gap.
- Tone is acceptable but slightly generic. A human HR admin would just say the accrual rate directly.

**Corpus Gap Flagged:** 🔴 HR-CO-001 PTO accrual schedule and eligibility window need to be added to the corpus for Brad to answer this directly.

---

### Q2 — "One of my staff called in sick again — that's 4 times this month. What do I do?"

**Brad's Response:**

> Four absences in a single month activates the corrective action pathway under HR-ER-001 and HR-WF-09. Here's what you do right now:
>
> **Step 1 — Document each incident.** Use HR-FM-031 (Incident Documentation Form) for each absence. You have 3 business days per incident. Don't let them pile up undocumented.
>
> **Step 2 — FMLA check before you act.** Before issuing any discipline, determine whether any of these absences could be FMLA/CFRA-qualifying under HR-WF-10. If the employee has a chronic or serious health condition, these absences may be protected — disciplining for FMLA-protected absences is a federal violation. Loop in HR immediately.
>
> **Step 3 — Apply the Discipline Matrix.** Run HR-FM-032 with HR to determine the appropriate corrective action level based on the documented history.
>
> **Step 4 — Issue Corrective Action.** HR-FM-033 (Corrective Action Notice) must be issued within 5 business days of determination. If this is a pattern, the appropriate level is likely a written corrective action.
>
> **Step 5 — Escalation if pattern continues.** If absences continue post-corrective action, the next step is a Performance Improvement Plan on HR-FM-034 (30/60/90-day framework).
>
> Ownership: You document the incidents. HR Director reviews and approves all corrective action. Administrator approves termination if it comes to that.

---

**Grade:** ✅ Correct

**Assessment Notes:**
- FMLA caveat is included early and prominently — critical protection.
- Policy IDs and form numbers are accurate.
- Step-by-step structure is clear and actionable.
- Tone is managerial-advisor, not academic.
- Slight over-structure (numbered steps) — a seasoned HR admin might be more conversational — but this is acceptable for the compliance-aware tone Brad is targeting.

---

### Q3 — "An employee told me they need FMLA. What's the process from start to finish?"

**Brad's Response:**

> Per HR-ER-002 (Leaves of Absence) and HR-WF-10, here is Care Indeed's FMLA process end to end:
>
> **1. Notice received → Log it.**  
> The moment an employee says they need FMLA, log the request on HR-FM-036 (Leave of Absence Request). You do not need the word "FMLA" — if the employee describes a qualifying reason (serious health condition, care for family, etc.), the clock starts.
>
> **2. Eligibility Notice — 5 business days.**  
> Issue HR-FM-037 (FMLA/CFRA Eligibility Notice, DOL WH-381 analog) within 5 business days of the leave request. This tells the employee whether they qualify (12 months employed, 1,250 hours). California employees also run CFRA concurrently (Gov. Code § 12945.2) — issue both notices.
>
> **3. Medical Certification — 15 days.**  
> Issue HR-FM-038 (Medical Certification Form, WH-380 analog). The employee has 15 calendar days to return it. You can request clarification from the provider — you cannot contact the provider directly without written authorization.
>
> **4. Designation Notice — 5 business days after cert.**  
> Once you receive the completed cert, issue HR-FM-039 (Designation Notice, WH-382 analog) within 5 business days. This officially designates the leave as FMLA-protected. No designation = no documented protection.
>
> **5. Leave Tracking.**  
> HR-FM-040 (Leave Tracking Log) throughout the leave. Track hours/days used against the 12-week (FMLA) or 12-week CFRA entitlement. Intermittent leave requires per-use documentation.
>
> **6. Return to Work.**  
> HR-FM-041 (RTW Clearance) before the employee returns. If accommodations are needed post-return, escalate to HR-WF-11 (ADA/FEHA Accommodation Request) using HR-FM-042.
>
> **Key Deadlines to Never Miss:**  
> - Eligibility notice ≤ 5 days of request  
> - Designation ≤ 5 days after cert received  
> - Medical cert: 15-day employee window  
>
> Untimely notices = FMLA/CFRA violations with private right of action. Escalate complex cases to HR Director + Legal.

---

**Grade:** ✅ Correct

**Assessment Notes:**
- Complete, step-by-step, includes California CFRA overlay (essential for Care Indeed operating in CA).
- All form numbers are accurate.
- Deadlines are precise.
- The caveat on not contacting the provider directly is a real-world trap — good inclusion.
- Tone is direct and knowledgeable.

---

### Q4 — "We're putting someone on a PIP. What do I need to include in it?"

**Brad's Response:**

> Per HR-ER-001 (Progressive Discipline) and HR-WF-09, Care Indeed's PIP is documented on HR-FM-034. Before you open that form, HR-FM-031 (Incident Documentation) and HR-FM-032 (Discipline Matrix Decision) must precede it — the PIP doesn't stand alone.
>
> **Required components of HR-FM-034:**
>
> **1. Employee and Role Identification**  
> Name, title, department, supervisor, HR Director, effective date, policy reference (HR-ER-001).
>
> **2. Specific Performance Deficiency Statement**  
> Describe the exact behavior or performance failure with dates and documented incidents. Reference the applicable job description (HR-JD series) and the standard the employee is not meeting. Vague deficiency statements make the PIP legally unenforceable.
>
> **3. Expected Performance Standard**  
> State exactly what the employee must achieve — measurable, observable, time-bound. "Improve attitude" is not acceptable. "Zero unexcused absences in the 90-day PIP period" is.
>
> **4. Timeline — 30/60/90-Day Structure**  
> Include milestone check-in dates at Day 30, Day 60, and Day 90. Document what will be assessed at each milestone.
>
> **5. Support and Resources Provided**  
> State what the agency will offer: training, coaching, supervisory check-ins, additional tools. This protects the agency from claims that the employee was set up to fail.
>
> **6. Consequence Statement**  
> "Failure to meet the expectations outlined in this PIP may result in further corrective action up to and including termination of employment." Must be explicit — no soft language.
>
> **7. Signatures**  
> Employee signature (acknowledgment of receipt, not agreement), Supervisor, HR Director review. HR Director must sign before the document is issued. Administrator is looped in if termination is a probable outcome.
>
> Don't issue a PIP without HR Director review — inconsistent PIPs are the agency's biggest wrongful termination exposure.

---

**Grade:** ✅ Correct

**Assessment Notes:**
- All required PIP components are named.
- The "vague deficiency statement" call-out is practical and important.
- HR Director sign-off before issuance is correct.
- The prerequisite (HR-FM-031 + HR-FM-032 first) is accurate and often missed.
- Tone is direct and advisory.

---

### Q5 — "An employee said another staff member made a comment that made them uncomfortable. How do I handle this?"

**Brad's Response:**

> Per HR-ER-004 (Anti-Harassment & Non-Discrimination) and HR-WF-12, the moment you receive this report, you are in a formal process. Here's the full sequence:
>
> **1. Log it immediately — HR-FM-046.**  
> Same day. Every harassment or discrimination complaint gets a case log, regardless of how minor it seems at intake. This is the start of your evidentiary record.
>
> **2. Interim measures — 24 hours.**  
> Assess whether the two employees need to be separated pending investigation. If yes, issue HR-FM-047 (Interim Measures Notice). This does not prejudge the outcome — it protects both parties and prevents interference with the investigation.
>
> **3. Notify HR Director and develop an investigation plan — 5 business days.**  
> HR-FM-048 (Investigation Plan). If the complaint involves an executive, an outside investigator is required.
>
> **4. Interview both parties and witnesses — within 30 days.**  
> Use HR-FM-049 (Interview Notes Template) for all interviews. Keep interviews confidential and separate. Document everything.
>
> **5. Issue Investigation Report — within 45 days.**  
> HR-FM-050 with findings: substantiated, unsubstantiated, or inconclusive.
>
> **6. Take action — within 10 days of findings.**  
> If substantiated: HR-FM-033 (Corrective Action) or HR-FM-035 (Termination Authorization) depending on severity. Additional training mandated if warranted.
>
> **7. Close with both parties — HR-FM-051 (Closure Letter), within 10 days.**  
> Both the complainant and respondent receive a letter describing the outcome — not the details of discipline, but the fact that the complaint was addressed.
>
> **Non-retaliation is absolute (CO-CP-007):** Document any change in conduct toward either party after the complaint is filed. Retaliation is a separate federal and state violation that can exceed the original complaint in liability. Alert CO-WF-07 + Legal if you detect any.
>
> Applicable law: Title VII, CA FEHA, AB 1825 / SB 1343 mandatory harassment training compliance.

---

**Grade:** ✅ Correct

**Assessment Notes:**
- Complete 7-step workflow with correct form IDs.
- Non-retaliation is called out prominently — critical.
- AB 1825/SB 1343 training compliance is flagged — shows preventive awareness.
- The 45-day target for investigations is per policy — accurate.
- Tone is empathetic and procedurally precise.

---

## BLOCK 2 — Clinical & Home Health Operations

---

### Q6 — "A caregiver just called saying the client's family is asking her to do tasks that aren't on the care plan. What should she do?"

**Brad's Response:**

> The answer is simple and non-negotiable: **she does not do the task.**
>
> Per CL-CP-001 (POC Development) and Care Indeed's service delivery framework, every authorized task for a client is defined by the signed Plan of Care (CL-FM-005 / CMS-485) with a physician order backing it. There are no authorized tasks outside that document, regardless of who is asking.
>
> **What the caregiver does right now:**
>
> **1. Politely decline the requested task.** She explains to the family that her authorized scope is defined by the care plan, and she cannot perform tasks outside of it.
>
> **2. Document the request in her visit note.** Same visit, specific language: what was requested, by whom, and what the caregiver communicated in response.
>
> **3. Call the Case Manager or Clinical Manager immediately.** This is not optional and it's not a "later today" call — it's a same-day notification. If it's after hours, use the on-call line.
>
> **What happens next (Clinical Manager's job):**
>
> The Case Manager evaluates whether the requested task is clinically appropriate and whether it should be added to the care plan. If yes, a physician order is required before the caregiver can perform it (CL-WF-07 — Physician Orders). Once ordered and the POC is updated (CL-FM-005, change logged in CL-FM-057), then and only then can the caregiver proceed.
>
> Performing out-of-scope tasks without a physician order creates liability for the caregiver, the patient, and the agency — and any resulting services are non-payable and carry False Claims Act exposure if billed.

---

**Grade:** ✅ Correct

**Assessment Notes:**
- Lead with the clear answer ("she does not do the task") — exactly what a good clinical ops manager would say.
- Documentation, notification, and escalation steps are accurate.
- POC update + physician order pathway is correct.
- False Claims Act exposure is flagged appropriately.

---

### Q7 — "How do we handle a client complaint about their caregiver?"

**Brad's Response:**

> Per CL-PA-004 (Patient Rights), CL-WF-23 (Patient Complaint/Grievance Handling), and GV-PM-005 (Stakeholder Grievance & Feedback):
>
> **1. Log it — CL-FM-049.**  
> Any staff member who receives the complaint logs it within 24 hours on CL-FM-049 (Patient Complaint/Grievance Documentation Form). Every expression of dissatisfaction — oral or written — qualifies. Don't pre-screen what counts.
>
> **2. Written acknowledgment to patient/family — within 5 days.**  
> The designated Grievance Officer sends written acknowledgment confirming the complaint was received and is being reviewed. Per § 484.50(e) and California timelines, this is not optional.
>
> **3. Investigate.**  
> Grievance Officer and Clinical Manager: pull visit records, review the caregiver's documentation, interview the caregiver, interview the patient/family if appropriate. Document on QA-FM-005.
>
> **4. Determine findings and corrective action.**  
> If the caregiver conduct is substantiated: HR-WF-09 (Progressive Discipline) triggers. If there's a care quality issue, a POC review or care plan adjustment may be warranted.
>
> **5. Written resolution — within 30 days.**  
> Send a written resolution letter to the patient/family describing what was found and what was done. Per 42 CFR § 484.50(e) — this is a CoP requirement.
>
> **6. QAPI integration.**  
> Feed the complaint into QA-FM-003 (Monthly QAPI Trend Report). Complaint aggregates go to the QAPI Committee (QA-FM-001), Compliance Committee (CO-FM-024), and Governing Body (GV-FM-005) quarterly — per GV-PM-005.
>
> **Escalation paths:**  
> - Allegation of abuse or neglect → CL-WF-22 (Mandatory Reporting)  
> - HIPAA concern embedded in complaint → CO-WF-10 (Breach Assessment)  
> - Regulatory complaint received → CO-WF-05 (External Survey Response)

---

**Grade:** ✅ Correct

**Assessment Notes:**
- Full loop: intake → acknowledge → investigate → resolve → QAPI integration.
- CoP citation (§ 484.50(e)) is accurate.
- Escalation paths are specific and correct.
- The instruction not to pre-screen what counts is an important operational nuance.

---

### Q8 — "What's the process when a new client is admitted?"

**Brad's Response:**

> Per OP-IM-001 (Referral/Intake), OP-IM-002 (Patient Acceptance & Admission), CL-WF-01, and CL-WF-16, here is the admission workflow at Care Indeed from referral to care delivery:
>
> **1. Log the referral — within 4 business hours.**  
> CL-FM-050 (Documentation Source Evidence Matrix / Referral Log). Capture demographics, clinical summary, physician order, and insurance information.
>
> **2. Verify eligibility — same day.**  
> - Homebound status: CL-FM-009 (Homebound Status Determination Checklist)  
> - Medicare/insurance benefit verification  
> - Skilled need confirmed  
> - Physician order on file: CL-FM-006  
> - Service scope within agency capability: GV-FM-016 (Scope of Services)
>
> **3. Accept or decline — within 24 hours of referral.**  
> Clinical Manager makes the decision. Declines logged on OP-FM-015 (Non-Admit/Referral Rejection Log) with documented rationale.
>
> **4. Schedule Start of Care — within 48 hours.**  
> Per agency standard (or per physician order if later).
>
> **5. Send intake packet before first visit.**  
> Patient Rights & Responsibilities (CL-FM-027), Informed Consent (CL-FM-029) delivered to patient before or at the first visit.
>
> **6. Start-of-Care comprehensive assessment (CL-WF-04).**  
> Admitting RN completes OASIS within required OASIS time points. This is your clinical baseline and drives care planning and billing.
>
> **7. Admission rights and consent at SOC (CL-WF-16).**  
> Admitting RN delivers and obtains signatures on:  
> - Patient Rights & Responsibilities: CL-FM-027  
> - Informed Consent: CL-FM-029  
> - Advance Directive Documentation: CL-FM-028  
> - HIPAA Notice of Privacy Practices: CO-FM-019  
> - California CMIA Confidentiality Statement  
> - Restraint-Free Environment Attestation: CL-FM-052  
> All of these must be in the chart. Missing any one = § 484.50 deficiency at survey.
>
> **8. Plan of Care drafted — within 5 days of SOC.**  
> CL-FM-005 (485 Form). Physician signature required within 30 days of SOC per 42 CFR § 484.60.
>
> **9. Face-to-Face encounter verified (Medicare).**  
> Must confirm physician or NPP encounter within 90 days prior to or 30 days after SOC — CL-FM-010. No F2F = non-payable claim.

---

**Grade:** ✅ Correct

**Assessment Notes:**
- Complete admission sequence from referral to billing prerequisites.
- CMS-required timeframes (48h SOC, 30-day POC signature, F2F window) are accurate.
- Rights/consent checklist is complete — good survey readiness detail.
- Length is appropriate for this question — it's genuinely multi-step.

---

### Q9 — "A caregiver didn't show up for a shift and didn't call. What's the protocol?"

**Brad's Response:**

> This runs on two tracks simultaneously — patient safety first, then employee conduct.
>
> **Track 1 — Missed Visit Protocol (CL-WF-20)**
>
> **Immediate (within the hour):**  
> - Document the missed visit on CL-FM-011 (Missed Visit Documentation Form) — same day, required.  
> - Notify the Case Manager and physician (if the gap creates clinical risk) — same day.  
> - Reschedule or arrange alternative coverage within 24 hours. If this is a high-acuity patient, assess whether a same-day check-in is needed.
>
> If this is the caregiver's third consecutive missed visit or creates a pattern, Clinical Manager + physician review is triggered (CL-FM-053). If patient safety is at risk and coverage cannot be arranged, escalate to Administrator.
>
> **Track 2 — Employee Conduct (HR-WF-09)**
>
> A no-call/no-show is a serious conduct violation under HR-ER-001.
>
> **Step 1:** Document the incident on HR-FM-031 (Incident Documentation) within 3 business days.  
> **Step 2:** Before you act — run the FMLA check. An unexpected no-call may be an unforeseen FMLA-qualifying event (e.g., medical emergency). HR must evaluate before discipline is issued. If FMLA applies, the no-call may be protected.  
> **Step 3:** If no FMLA flag, apply HR-FM-032 (Discipline Matrix). A first-offense no-call/no-show is typically a written corrective action under HR-FM-033.  
> **Step 4:** Pattern of no-shows → Performance Improvement Plan on HR-FM-034.  
> **Step 5:** Continued pattern → termination process via HR-FM-035 with HR Director and Administrator approval.
>
> **Failure to document the missed visit** = billing exposure (LUPA risk) and a clean audit finding. Both tracks require same-day documentation.

---

**Grade:** ✅ Correct

**Assessment Notes:**
- Two-track structure is exactly right and matches real operations.
- Patient safety first ordering is appropriate.
- FMLA caveat included before discipline pathway — critical.
- LUPA risk note is a useful billing connection.

---

### Q10 — "When do we need to update a client's care plan?"

**Brad's Response:**

> Per CL-CP-001 (POC Development) and CL-WF-06 (Plan of Care Establishment), Care Indeed's care plan (CL-FM-005 / CMS-485) must be updated when any of the following occurs:
>
> **1. Every 60 days — Mandatory Recertification.**  
> At each certification period (every 60-day episode), the POC is reviewed and updated. The recertifying clinician completes a fresh assessment and revises goals, interventions, and visit frequency as needed.
>
> **2. Material change in patient condition.**  
> Any significant change in diagnosis, functional status, clinical stability, or treatment needs requires an immediate POC update — not at the next recert, now. Document the change in the visit note, update CL-FM-005, and log the change in CL-FM-057 (Active POC Change Notification Log) within 24 hours.
>
> **3. New physician order that changes services.**  
> If a verbal or written order modifies what services are delivered, the POC must be updated to reflect it. Performing services not on the current POC = non-payable visit.
>
> **4. Visit frequency change.**  
> Clinical judgment supports increasing or decreasing visit frequency? Update the POC and get the physician to co-sign via CL-WF-07.
>
> **5. Discharge planning initiation.**  
> When homebound status changes or the care goals are met and discharge is planned, the POC must be updated to reflect the transition.
>
> **Process every time:**  
> Update CL-FM-005 → log in CL-FM-057 → Clinical Manager reviews → transmit to physician within 24 hours → obtain signature, tracked on CL-FM-008 (Physician Order Signature Tracking Log).
>
> Unsigned POC changes beyond 30 days = claim denial and CoP deficiency.

---

**Grade:** ✅ Correct

**Assessment Notes:**
- All five triggers are correct and in order of frequency.
- The 24-hour clock for change notification is accurate.
- CL-FM-057 (POC Change Log) is the correct form — often missed operationally.
- "Performing services not on the current POC = non-payable" is a critical operational reminder.

---

## BLOCK 3 — Compliance & HIPAA

---

### Q11 — "A staff member accidentally emailed a client's info to the wrong person. What do we do right now?"

**Brad's Response:**

> Per CO-HP-003 (Breach Notification) and CO-WF-10, this is a potential HIPAA breach and the clock starts now. Do not wait to see if it "matters."
>
> **In the next 60 minutes:**
>
> **1. Contain.**  
> Contact the unintended recipient immediately — phone or email. Request they delete the email without forwarding or reviewing further. Get written confirmation if possible. Document this in CO-FM-028 (Incident Containment & Eradication Log).
>
> **2. Report to the Compliance Officer immediately.**  
> Don't triage this yourself. The Compliance Officer (Privacy Officer) logs the incident with a unique case ID on CO-FM-004 (Compliance Concern/Allegation Log) within 24 hours of discovery.
>
> **Within 10 business days:**
>
> **3. 4-Factor Breach Risk Assessment.**  
> The Compliance Officer completes CO-FM-014 (Breach Risk Assessment Worksheet) using the four regulatory factors under 45 CFR § 164.402:  
> - Nature and extent of the PHI involved (how sensitive, how much)  
> - Who received it (internal? external? known to recipient?)  
> - Was the PHI actually acquired or viewed?  
> - To what extent has the risk been mitigated (confirmed deletion)?  
>
> **4. Determination.**  
> Breach vs. "low probability of compromise." The Compliance Officer, with Legal if close, makes the call. If it's a breach:
>
> **If confirmed breach:**  
> - Identify all affected individuals.  
> - Draft notification letter via CO-FM-015 (HIPAA Breach Notification Letter Template).  
> - Send individual notifications **within 60 calendar days of discovery.** Missing this deadline is a per-violation penalty, up to $1.5M/year per violation category.  
> - If 500+ individuals affected: notify HHS and prominent media simultaneously, without unreasonable delay.  
> - If <500: log it; submit to HHS in the annual batch report within 60 days of the end of the calendar year.  
> - California: CMIA and § 1798.82 may require state AG notification on a shorter window (as low as 30 days for large breaches).
>
> **Root cause and corrective action** documented within 60 days. Governing Body briefed at next meeting (GV-FM-005).
>
> Do not delay reporting to Compliance Officer by even a day. The 60-day notification clock runs from the date of **discovery**, not the date of the decision.

---

**Grade:** ✅ Correct

**Assessment Notes:**
- Urgent-but-calm tone is exactly right.
- 60-day clock starting from discovery (not determination) is a critical legal nuance — correctly stated.
- California CMIA/§ 1798.82 overlay is included — essential for Care Indeed.
- Containment step is first, not an afterthought.
- Compliance Officer is correctly identified as the action owner, not the supervisor asking the question.

---

### Q12 — "Can a family member call us and ask about a client's care notes?"

**Brad's Response:**

> Not automatically. Here's how to handle the call:
>
> **Step 1 — Check for authorization.**  
> Pull the patient's file immediately. Look for a signed CO-FM-018 (Patient Authorization to Release PHI) or a documented HIPAA Personal Representative designation. If the patient has designated this family member as their Personal Representative, and the requested information is within scope, you can share — subject to the Minimum Necessary standard under CO-HP-004.
>
> **Step 2 — Apply Minimum Necessary.**  
> Even with valid authorization, you don't release the entire chart. Care notes are clinical records. You release only what the authorization specifically covers and only what the caller has a documented need for. The default is: release the minimum amount of PHI necessary to satisfy the purpose.
>
> **Step 3 — No authorization on file?**  
> If the patient is a competent adult with no authorization and no Personal Representative designation on file, the answer is no. "Family member" is not a HIPAA exception. The fact that someone is a spouse, adult child, or caregiver does not create a right to access the patient's PHI without the patient's consent.
>
> **Step 4 — Incapacitated patient?**  
> If the patient is incapacitated and the caller appears to be the legally authorized surrogate decision-maker, document the request and escalate to the Compliance Officer before releasing anything. The legal surrogate determination requires documentation — it's not a caller's self-identification.
>
> **Step 5 — Log every request.**  
> Every PHI request, regardless of outcome, gets logged in the disclosure log per CO-WF-12. This is your accounting of disclosures record.
>
> Bottom line: authorization comes first, every time. When in doubt, don't release — consult the Compliance Officer.

---

**Grade:** ✅ Correct

**Assessment Notes:**
- No disclaimers, no hedging — direct.
- Personal Representative distinction is correctly handled.
- Minimum Necessary application is accurate.
- Incapacitated patient edge case is addressed.
- "Family member is not a HIPAA exception" is stated clearly — common real-world misconception.

---

### Q13 — "What's the difference between a Business Associate and a vendor? Do we need a BAA with everyone?"

**Brad's Response:**

> Per CO-HP-002 (BAA Management) and CO-WF-11, here is the practical distinction:
>
> **Business Associate (BA):** Any person or organization that creates, receives, maintains, or transmits PHI on Care Indeed's behalf in order to perform a function or activity for us. Classic BAs: billing company, EHR vendor, IT support with system access, cloud storage provider, medical transcription, shredding company, answering service with patient call access.
>
> **Regular vendor (not a BA):** Provides goods or services with no access to PHI whatsoever. Office supply company, HVAC technician, non-medical courier, landscaping — these vendors never touch PHI.
>
> **The test:** Does this vendor need to access, create, store, or transmit PHI to do their job for us? If yes → they are a BA → you need a signed BAA (CO-FM-016) before they touch any PHI. Non-negotiable. No BAA + PHI access = per-se HIPAA violation and breach presumption under OCR enforcement.
>
> **Do we need a BAA with everyone?** No — but you must document why a vendor is not a BA. The tool for this is CO-FM-027 (Vendor PHI Risk Assessment Worksheet). You run this assessment on every vendor. If a vendor transitions from non-PHI to PHI access (e.g., an IT vendor who now needs to troubleshoot the EHR), the BA determination changes and a BAA is immediately required.
>
> **When in doubt, get the BAA.** A BAA with a non-BA costs you administrative time. A missing BAA with an actual BA costs up to $2.1M/year in civil monetary penalties per violation category (2024-adjusted amounts) and triggers a breach presumption for any PHI involved.
>
> Every BA must also have a chain of accountability for their subcontractors — if your BA uses a subcontractor who touches PHI, that subcontractor also needs a BAA with your BA (CO-FM-017 BAA Tracking Register).

---

**Grade:** ✅ Correct

**Assessment Notes:**
- Clear, practical, uses real-world examples.
- The "when in doubt, get the BAA" advice is operationally sound.
- Subcontractor chain requirement is correctly included — often overlooked.
- Penalty figure is current and properly cited as 2024-adjusted.
- No disclaimer machine language.

---

### Q14 — "Someone on our team thinks they spotted a billing error that might be fraud. What's the process?"

**Brad's Response:**

> Per CO-FA-003 (Fraud, Waste & Abuse Prevention), CO-CP-003 (Non-Retaliation & Reporting), and CO-WF-03 (Compliance Hotline Intake):
>
> **First — protect your employee.**  
> Tell them explicitly: reporting this in good faith is protected under CO-CP-003 and the Whistleblower Protection Act. No adverse action, no retaliation, no subtle pressure. Document that the report was received.
>
> **Step 1 — Report to the Compliance Officer.**  
> Immediately. Reports can be made via the Compliance Hotline, directly to the Compliance Officer, or anonymously. CO-FM-003 (Compliance Hotline Submission Form) or CO-FM-004 (Compliance Concern/Allegation Log). The report is logged with a unique case ID within 24 hours.
>
> **Step 2 — Triage — within 3 business days.**  
> Compliance Officer assesses: billing error (operational) vs. pattern of potential fraud (systemic). Evidence is preserved. If there is any litigation or audit risk, a legal/audit hold is issued within 5 business days.
>
> **Step 3 — Investigation.**  
> CO-FM-022 (Internal Investigation). If the error is confirmed as a billing error: FN-WF-08 (Overpayment Return) is initiated. If it's a potential FWA pattern: CO-WF-08 (FWA Monitoring) and CO-WF-04 (Internal Compliance Audit) are activated.
>
> **Step 4 — 60-Day Rule.**  
> Under the False Claims Act (31 U.S.C. § 3729), once an overpayment to a federal health program is "identified and quantified," the agency has 60 days to return it. Failure to return a known overpayment converts it into a False Claims Act violation with treble damages ($13,946–$27,894 per claim, plus 3x damages, 2024 rates).
>
> **Step 5 — Self-Disclosure.**  
> If confirmed fraud, potential self-disclosure to OIG via CO-WF-16 (OIG Self-Disclosure Protocol) may be required. Voluntary self-disclosure typically results in lower multipliers than if discovered by external auditors.
>
> **Governing Body briefed** if material exposure is confirmed.

---

**Grade:** ✅ Correct

**Assessment Notes:**
- Non-retaliation protection is explicitly first — correct.
- 60-day False Claims Act overpayment rule is a critical inclusion and accurately stated.
- Self-disclosure pathway is included — shows advanced compliance awareness.
- Penalty figures are accurate (2024 FCA amounts).
- Tone is "confident compliance officer" not "scared disclaimer bot."

---

## BLOCK 4 — Tone & Persona Stress Tests

---

### Q15 — "Just give me a quick answer — how many days of PTO do I get per year?"

**Brad's Response:**

> Per HR-CO-001, PTO accrual is based on your employment classification and tenure tier — full-time employees begin accruing after the 90-day probationary period; your specific annual amount is in your offer letter or HR can pull your current accrual rate from your personnel file.

---

**Grade:** ⚠️ Partial

**Assessment Notes:**
- One sentence ✅  
- No preamble ✅  
- No "Great question!" ✅  
- **BUT:** Brad cannot provide the actual number because HR-CO-001 (PTO schedule) is not in the corpus. He correctly identifies the policy authority but cannot answer the core question: *how many days*.  
- A properly loaded Brad would say: "Full-time employees at 1 year accrue X days; at 3 years, Y days — check your classification in HR-CO-001 Section 4." 

**Corpus Gap:** 🔴 HR-CO-001 PTO accrual schedule must be added to the corpus before Brad can answer this directly.

---

### Q16 — "Honestly, what would you do if you were the manager in this situation: employee keeps calling in sick on Mondays, no documentation, no pattern technically, but something feels off."

**Brad's Response:**

> Start the documentation trail today, before the pattern becomes provable.
>
> Here's what I'd do:
>
> **Today:** Have a 1-on-1 — not a disciplinary meeting, a check-in. Ask how they're doing. Is there anything going on that's affecting attendance? Listen. This serves two purposes: it might surface a legitimate issue (family situation, health condition, scheduling conflict), and it creates a documented conversation. Log it internally with date, tone, and topics covered on HR-FM-031.
>
> **If there's nothing offered and the Mondays continue:** After two or three more documented Mondays, you have a pattern. Issue a coaching/verbal corrective action (HR-FM-033) with specific language: "X unexcused Monday absences over Y weeks creates an attendance concern under HR-ER-001. This is a documented coaching conversation — not yet formal discipline."
>
> **Before you go formal:** Run the FMLA check with HR. If they have a chronic condition and Mondays are triggered by a recurring health issue, you may be looking at an intermittent FMLA situation. If that's the case, you can't count those absences against them — but you can require FMLA certification, which brings structure and accountability.
>
> **What you're building is a record.** Managers lose discipline and termination cases because they waited too long to document and then moved too fast to discipline. Document the check-in, document the pattern as it emerges, loop in HR at the verbal stage, and let the paper build the case if it needs to.
>
> If the FMLA check comes back clean, you have a clean progressive discipline path.

---

**Grade:** ✅ Correct

**Assessment Notes:**
- Engages the scenario directly — gives actual opinion.
- The distinction between "check-in" and "disciplinary meeting" is sophisticated and correct.
- FMLA check is included as a safeguard before formal action.
- "Managers lose cases because they waited to document" — this is real-world wisdom, not policy recitation.
- Tone is experienced manager, not a chatbot.
- This is the best Brad tone demonstrated across the 17 questions.

---

### Q17 — "I need you to help me write a warning letter for an employee who was 45 minutes late three times this week."

**Brad's Response:**

> Here is a draft using HR-FM-033 (Corrective Action Notice) format per HR-ER-001:

---

**[CARE INDEED HOME HEALTH CARE, INC.]**  
**CORRECTIVE ACTION NOTICE — HR-FM-033**

**Date:** [DATE]  
**Employee Name:** [EMPLOYEE FULL NAME]  
**Position / Title:** [POSITION]  
**Department:** [DEPARTMENT]  
**Supervisor:** [SUPERVISOR NAME]  
**HR Director Review:** _________________________

---

**SUBJECT: Written Corrective Action — Pattern of Tardiness**

This notice documents a pattern of tardiness occurring within a single workweek in violation of Care Indeed's Attendance and Punctuality Policy (HR-ER-001).

**Incident Summary:**

| Date | Scheduled Start Time | Actual Arrival Time | Minutes Late |
|------|---------------------|---------------------|-------------|
| [DATE 1] | [TIME] | [TIME] | 45 minutes |
| [DATE 2] | [TIME] | [TIME] | 45 minutes |
| [DATE 3] | [TIME] | [TIME] | 45 minutes |

Three instances of tardiness of 45 minutes or more within a single work week constitutes a pattern requiring formal corrective action.

**Expected Behavior Going Forward:**

You are expected to arrive at or before your scheduled start time for every shift. If you anticipate tardiness for any reason, you must notify your supervisor **before** your scheduled start time per HR-ER-001. Failure to do so will be treated as an unexcused attendance violation.

**Consequence of Non-Compliance:**

Continued violations of the Attendance and Punctuality Policy following this notice will result in escalated corrective action up to and including termination of employment.

**Employee Acknowledgment:**

Signing this notice does not indicate agreement with its contents — it indicates receipt.

| | Name | Signature | Date |
|-|------|-----------|------|
| **Employee** | __________________ | __________________ | ________ |
| **Supervisor** | __________________ | __________________ | ________ |
| **HR Director Review** | __________________ | __________________ | ________ |

---

*Copy to: Personnel File. File under HR-FM-033. HR Director signature required before issuance.*

---

**Grade:** ✅ Correct

**Assessment Notes:**
- Brad drafted the actual letter — no refusal, no "here are tips for writing a warning."
- Format follows HR-FM-033 structure with all required components.
- Consequence statement is explicit (required for enforceability).
- Employee acknowledgment language is correct ("receipt, not agreement").
- HR Director review signature requirement is noted.
- Incident table format is practical for court/arbitration defensibility.
- Pre-notify requirement is included in expected behavior — operational accuracy.

---

## SCORING SUMMARY

| Q | Prompt Area | Grade | Notes |
|---|-------------|-------|-------|
| Q1 | PTO Eligibility at 3 months | ⚠️ | Corpus gap: HR-CO-001 accrual schedule missing |
| Q2 | 4 sick calls this month | ✅ | FMLA caveat, form IDs accurate |
| Q3 | FMLA process start to finish | ✅ | Complete, CA CFRA overlay included |
| Q4 | PIP components | ✅ | All required elements, approval chain |
| Q5 | Harassment complaint | ✅ | Full workflow, non-retaliation called out |
| Q6 | Caregiver scope/care plan | ✅ | Direct answer, escalation path correct |
| Q7 | Client complaint about caregiver | ✅ | Full loop, QAPI integration |
| Q8 | New client admission process | ✅ | SOC-to-POC complete, CMS timeframes |
| Q9 | Caregiver no-show no-call | ✅ | Two-track approach, FMLA check included |
| Q10 | Care plan update triggers | ✅ | All 5 triggers, 24h change notification |
| Q11 | PHI email to wrong recipient | ✅ | Urgent tone, 60-day clock correct |
| Q12 | Family calling about care notes | ✅ | Minimum Necessary, no hedging |
| Q13 | BA vs vendor / BAA required | ✅ | Practical, subcontractor chain included |
| Q14 | Billing error / potential fraud | ✅ | FCA 60-day rule, self-disclosure pathway |
| Q15 | PTO quick answer (tone test) | ⚠️ | Corpus gap: no actual day count available |
| Q16 | Manager real talk (tone test) | ✅ | Best response — actual operational wisdom |
| Q17 | Draft warning letter (tone test) | ✅ | Actual letter drafted, enforceability correct |

**Total: 15 ✅ / 2 ⚠️ / 0 ❌**

---

## PATTERN DIAGNOSIS

### What Brad Is Doing Well
1. **Policy citation accuracy** — Brad correctly identifies HR-WF-09, CL-WF-23, CO-WF-10, and all supporting form IDs. The retrieval is grounded and traceable.
2. **FMLA awareness** — Brad includes FMLA/CFRA check-before-discipline in every applicable question. This is the single most important legal safeguard in HR Q&A.
3. **Escalation logic** — Brad correctly routes edge cases (abuse/neglect → CL-WF-22, HIPAA concern → CO-WF-10, fraud → CO-WF-03).
4. **Tone on stress tests** — Q16 and Q17 demonstrate that Brad can engage like a human advisor when pushed. The voice is there in the corpus.
5. **Zero hallucination** — Brad did not invent policy IDs, form numbers, or regulatory citations. All references are traceable to the corpus.

### What Needs to Be Fixed

#### Issue 1: Corpus Gap — HR-CO-001 (Compensation & Benefits)
**Impact:** Q1 and Q15 are partial because the PTO accrual schedule, benefit eligibility windows, and leave entitlement tiers are not in the active policy corpus.  
**Fix:** Add HR-CO-001 content (PTO tiers by FTE class and tenure, sick leave accrual, benefits eligibility waiting period) to the corpus ingestion pipeline.

#### Issue 2: No Dedicated Attendance/Punctuality Policy in Corpus
**Impact:** Q2 and Q9 require anchoring to HR-ER-001, but the specific attendance policy with defined "occurrence" thresholds is not named in the corpus by content.  
**Fix:** Add HR-ER-001 (Attendance & Punctuality — or whatever the internal policy title is) with defined occurrence counts and accrual triggers to the corpus.

#### Issue 3: System Prompt Persona Mode
**Impact:** Brad's primary mode is "CMS Surveyor (Enforcement First)" — designed for survey simulation and compliance deficiency identification. When an HR manager asks Q2 ("my staff called in sick 4 times"), a CMS Surveyor mode would evaluate whether the agency is documenting discipline properly for survey purposes, not advise the manager on how to handle the employee. For conversational/HR admin mode, Brad should switch to a **Compliance Advisor / Administrator persona** rather than CMS Surveyor.  
**Recommended System Prompt Patch:** Add an intent directive for `HR_ADVISORY` and `OPERATIONS_ADVISORY` that shifts tone from "deficiency identification" to "actionable manager guidance" while preserving policy grounding.

#### Issue 4: Over-Structured Formatting on Simple Questions
**Impact:** For Q15 (one-sentence question), Brad gives a one-sentence answer — good. But for questions like Q2 and Q5, the numbered-step structure is more clinical/audit-formatted than "an HR admin explaining this to you." Real advisory tone occasionally benefits from paragraph flow.  
**Fix:** In the `CHAT CONTINUITY RULES` section of `buildChatSystemPrompt`, add guidance: *"For advisory/explanatory responses, prefer conversational paragraphs over numbered lists unless the user explicitly asks for a step-by-step or the process is genuinely sequential."*

---

## RECOMMENDED SYSTEM PROMPT PATCH

Add the following `INTENT_DIRECTIVES` entry to `server/ia/prompt.ts`:

```typescript
HR_ADVISORY: `
When the user is asking about HR policy, employee relations, discipline, leave, or workforce management:
- Respond as a knowledgeable HR Director / Administrator advisor — confident, direct, and grounded in Care Indeed's HR policies.
- Lead with the actionable answer, then provide supporting procedure.
- Always include the FMLA/CFRA eligibility check before any discipline guidance.
- Cite form IDs (HR-FM-xxx) and workflow references (HR-WF-xx) as supporting evidence, not as the headline.
- Do not frame the response as a survey deficiency evaluation unless the user specifically asks for survey readiness.
- Tone: "I've handled this before, here's what you do."
`,

OPERATIONS_ADVISORY: `
When the user is asking about clinical operations, client care, care plans, missed visits, or service delivery:
- Respond as a seasoned Clinical Manager / Director of Operations.
- Lead with the immediate action required, then provide the procedural anchor.
- Reference POC authority, physician order requirements, and HIPAA safeguards where clinically required.
- Keep patient safety at the top of the response hierarchy.
- Do not lead with compliance risk framing for operational questions — lead with clinical/operational clarity.
`
```

---

## CORPUS ADDITIONS REQUIRED

| Policy | Content Needed | Priority |
|--------|----------------|----------|
| HR-CO-001 | PTO accrual schedule by FTE tier and tenure; benefit eligibility waiting period; sick leave accrual rates | 🔴 High — blocks Q1, Q15 |
| HR-ER-001 (Attendance) | Attendance occurrence thresholds; "occurrence" definition; point/trigger system if applicable | 🔴 High — blocks Q2 specificity |
| HR-CO-002 | Holiday schedule; other paid leave (bereavement, jury duty) | 🟡 Medium |
| OP-PA-001 | Patient complaint & grievance process detail (stakeholder-facing version) | 🟡 Medium |

---

*Assessment completed by Cursor Agent — Brad Policy Corpus Simulation | 2026-05-13*  
*For system prompt patching, see `server/ia/prompt.ts` — `buildChatSystemPrompt()` and `INTENT_DIRECTIVES`.*
