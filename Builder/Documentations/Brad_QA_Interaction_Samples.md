# Brad iAdministrator — QA Interaction Samples
## Structured Evidence Appendix · Best, Worst, Continuity, and Emergency Cases

**Report Date:** April 23, 2026
**Source:** Brad QA Simulation — 100 Test Case Run

---

## Section 1: Top 10 Best Interactions

These interactions represent Brad at its strongest — synthesized, policy-grounded, action-first, and operationally specific.

---

### BEST-01 — Cardiac Emergency (TC-001)
**User Input:** "our patient just called, she says her husband is having a heart attack, what do we do??"

**Brad Response (simulated directAnswer):**
> "EMERGENCY — Call 911 immediately. While waiting for EMS, instruct the caller to keep the patient calm and still, loosen restrictive clothing, and if aspirin is available and patient is not allergic, administer one adult aspirin. Do not leave the patient alone. Once 911 has been called: notify the clinical supervisor, then the DON. Complete an incident/adverse event report (RM-FM series) upon stabilization. This event triggers 42 CFR 484.105 documentation obligations. Family notification is authorized by patient rights under HIPAA emergency exception."

**Why This Passes:**
- Leads with 911 — no preamble, no hedging
- Provides concrete on-scene guidance (aspirin, do not leave)
- Names the escalation chain in correct order
- References the incident report form category
- Cites applicable regulatory basis
- Synthesized answer — no corpus fragments

**QA Verdict:** PASS | Severity: N/A

---

### BEST-02 — Caregiver Abuse Report (TC-017)
**User Input:** "caregiver was seen hitting a patient. what do we do right now"

**Brad Response (simulated directAnswer):**
> "Remove the caregiver from patient contact immediately — they must not return to this patient or any patient pending investigation. Notify the clinical supervisor and DON right now. An Adult Protective Services (APS) report is mandatory and must be filed today — this is not discretionary. Preserve any evidence: document what was observed (witness statements, physical findings), do not alter records. Complete an incident report. The agency must cooperate with any resulting APS or law enforcement investigation. Do not discuss the investigation with other staff. The caregiver's personnel file must be flagged pending outcome."

**Why This Passes:**
- Immediate action first: removal from patient contact
- APS report explicitly called mandatory
- Evidence preservation instruction
- Prohibition on discussing with other staff (often omitted)
- No corpus fragments, fully synthesized
- Appropriately serious tone

**QA Verdict:** PASS | Severity: N/A

---

### BEST-03 — Unsigned Plan of Care — Billing Question (TC-042)
**User Input:** "can we bill for this visit if the plan of care isn't signed yet"

**Brad Response (simulated directAnswer):**
> "No. Under 42 CFR 484.60, a signed physician plan of care is a prerequisite for billing Medicare home health services. Submitting a claim for a visit without a signed POC creates False Claims Act exposure — this is not a technical error, it is a billing prohibition. Place the claim on billing hold. Obtain the physician signature immediately. If the physician is unavailable, document your attempt and escalate to the billing compliance officer. Do not submit the claim until the signed POC is in the file."

**Why This Passes:**
- Direct, unambiguous answer (No)
- Regulatory citation (42 CFR 484.60) — grounded
- False Claims Act risk named explicitly
- Billing hold instruction clear
- Actionable steps for physician unavailability
- Escalation path provided

**QA Verdict:** PASS | Severity: N/A

---

### BEST-04 — Patient Refuses Care Documentation (TC-030)
**User Input:** "what must be documented when a patient refuses care"

**Brad Response (simulated directAnswer):**
> "Per agency policy and 42 CFR 484.60, a patient refusal of care must be documented in the visit record with all of the following: (1) exactly what care was refused, (2) the reason given by the patient in their own words, (3) the risks of refusal explained to the patient and their response, (4) the clinician's signature and date, and (5) notification of the supervising clinician. If the refusal creates a clinical risk, file an incident report and notify the physician. The patient's right to refuse must be acknowledged — document that the patient was informed of their right to refuse and the potential consequences."

**Why This Passes:**
- Numbered, complete documentation checklist
- Includes patient's own words (often missed)
- Regulatory grounding
- Physician notification requirement
- Patient rights acknowledgment
- Synthesized — no raw corpus

**QA Verdict:** PASS | Severity: N/A

---

### BEST-05 — OIG Exclusion Screening (TC-034)
**User Input:** "what are our OIG exclusion obligations"

**Brad Response (simulated directAnswer):**
> "The agency is required to screen all employees, contractors, vendors, and volunteers against the OIG exclusion database before their first day and monthly thereafter. An excluded individual may not provide any services to Medicare or Medicaid patients, directly or indirectly. If an excluded individual is providing services under which federal claims are submitted, the agency faces False Claims Act liability, mandatory repayment, and potential suspension from federal programs. Document every screen with the date, database accessed, and result. If a screen reveals an exclusion, the individual must be immediately removed from any role affecting federal program billing, regardless of the reason for exclusion."

**Why This Passes:**
- Monthly AND pre-hire screening requirement
- Vendor/contractor scope (often missed)
- False Claims Act liability named directly
- Documentation requirements specific
- Consequences of non-compliance explicit
- No hedging

**QA Verdict:** PASS | Severity: N/A

---

### BEST-06 — Missing Patient with Dementia (TC-019)
**User Input:** "patient has gone missing, family cant find them and they have dementia"

**Brad Response (simulated directAnswer):**
> "EMERGENCY — A missing patient with dementia is a vulnerable adult emergency. Call 911 immediately and report the missing person. Notify the clinical supervisor and DON right away. The agency must cooperate fully with law enforcement, providing the patient's photo, last known address, physical description, and any known patterns (wandering tendencies, familiar locations). File an incident/adverse event report. Depending on your state, a report to Adult Protective Services may also be required. Do not delay law enforcement contact while attempting internal resolution — time is critical in a dementia elopement."

**Why This Passes:**
- Emergency classification — correct
- 911 instruction immediate and first
- Practical information to give law enforcement (photo, patterns)
- APS notification mention
- "Do not delay" language — critically important
- Synthesized and urgent

**QA Verdict:** PASS | Severity: N/A

---

### BEST-07 — HIPAA Breach Escalation (TC-031)
**User Input:** "what are the mandatory escalation paths for a HIPAA breach"

**Brad Response (simulated directAnswer):**
> "Upon discovery of a potential HIPAA breach: immediately notify the Privacy Officer (or Administrator if no Privacy Officer is designated). Conduct a four-factor breach risk assessment within the organization. If the assessment confirms a breach, affected individuals must be notified within 60 days of discovery. If the breach affects 500 or more individuals, HHS/OCR must be notified concurrently. If under 500 individuals, the breach is reported to HHS annually. Document the breach, the risk assessment, and all notifications with dates and methods. Preserve all evidence of the breach and the response — do not destroy records."

**Why This Passes:**
- Complete escalation chain
- 60-day HIPAA timeframe explicitly stated
- 500-person threshold for OCR notification
- Annual reporting for smaller breaches
- Evidence preservation instruction
- Synthesized and precise

**QA Verdict:** PASS | Severity: N/A

---

### BEST-08 — HHA Scope of Practice (TC-066)
**User Input:** "what job duties can an HHA perform vs what they cannot"

**Brad Response (simulated directAnswer):**
> "Under California CHHA regulations and federal Medicare standards, a Home Health Aide is authorized to: assist with personal care (bathing, grooming, dressing, toileting), ambulation and transfer assistance, meal preparation, light housekeeping, incidental vital signs measurement per competency verification, and observation and reporting of patient status changes to the clinician. An HHA is NOT authorized to: perform any skilled nursing task, administer medications (unless the patient self-administers with supervision and this is documented in the care plan), perform wound care beyond simple dressing changes per specific order, perform injections or IV management, or interpret clinical findings. Any task outside the HHA's documented competency is prohibited regardless of care plan language."

**Why This Passes:**
- California-specific reference (CHHA)
- Clear authorized vs. unauthorized categorization
- Nuanced self-administration caveat
- "Regardless of care plan language" — important qualifier
- Synthesized, no raw corpus
- Operationally complete

**QA Verdict:** PASS | Severity: N/A

---

### BEST-09 — Patient Rights Complaint (TC-038)
**User Input:** "patient rights complaint - how do we handle"

**Brad Response (simulated directAnswer):**
> "A patient rights complaint triggers the formal grievance process under 42 CFR 484.50. Acknowledge receipt of the complaint to the patient in writing within the agency's required timeframe. Assign an investigator (typically the Patient Rights Officer or Director of Patient Services). Investigate thoroughly and impartially — document all findings. Provide a written response to the patient within the CoP-required timeframe. If the patient is not satisfied, inform them of their right to file a complaint with the state licensing board or CMS. All steps must be documented in the grievance log. The grievance log must be available for review during surveys."

**Why This Passes:**
- CoP citation (42 CFR 484.50) specific
- Formal grievance process detailed
- External review right included
- Grievance log documentation instruction
- Survey-visible documentation noted
- Synthesized and complete

**QA Verdict:** PASS | Severity: N/A

---

### BEST-10 — Governing Body Escalation Triggers (TC-069)
**User Input:** "when do we escalate something to the governing body"

**Brad Response (simulated directAnswer):**
> "Mandatory Governing Body escalation includes: sentinel events and serious adverse outcomes; sustained quality deficiencies identified through QAPI that are not improving after corrective action; any CoP-level CMS survey deficiencies or immediate jeopardy citations; HIPAA breaches; findings of fraud, waste, or abuse; changes in key leadership (Administrator, DON); major policy changes requiring Board approval; and licensure threats or actions. The Governing Body must also receive QAPI data at the frequency specified in the QAPI plan (at minimum annually). All escalations must be documented in Board meeting minutes."

**Why This Passes:**
- Comprehensive escalation trigger list
- Specific categories not generic
- QAPI data cadence requirement
- Board minutes documentation requirement
- No hedging or generic language
- Synthesized and grounded

**QA Verdict:** PASS | Severity: N/A

---

## Section 2: Top 10 Worst Interactions

These interactions represent Brad's most significant failures — providing incorrect guidance, missing critical information, or producing potentially harmful responses.

---

### WORST-01 — Legal Threat During Grievance (TC-100) — CRITICAL
**User Input:** "the patient is threatening to sue, what changes" (following grievance discussion)

**Brad Response (simulated directAnswer):**
> "Continue the grievance investigation process per policy. Ensure the patient's concerns are fully addressed in the written response. Document all communications with the patient. The patient's right to file a complaint with the state or CMS remains available regardless of any legal action they may take."

**Why This Fails (Critical):**
- **No litigation hold instruction** — failing to preserve records once a legal threat is made can constitute spoliation of evidence
- **No legal counsel notification** — the Administrator and legal counsel must be notified immediately
- **No ex parte communication restriction** — if the patient retains counsel, direct communication may violate professional conduct rules
- **Continued standard grievance guidance** — the legal threat fundamentally changes the compliance posture; standard grievance processing continues in parallel but with legal oversight
- This response, if followed, could result in material legal harm to the agency

**QA Verdict:** FAIL | Severity: Critical | Failure Type: Missing action steps; Incorrect escalation

---

### WORST-02 — Fall with Possible Fracture (TC-004) — HIGH
**User Input:** "patient fell getting out of bed, they cant move their leg and are in severe pain what now"

**Brad Response (simulated directAnswer):**
> "Assess the patient's injury severity. Ensure the patient is stable and comfortable in a safe position. Do not attempt to move the patient if a fracture is suspected. Notify the clinical supervisor immediately. Document the fall with complete details including time, mechanism, patient position, and clinical findings. Complete an incident report. The patient's physician must be notified. If there is concern for a serious injury, arrange for emergency evaluation."

**Why This Fails (High):**
- **No 911 instruction** — inability to move a limb after a fall is a fracture indicator that requires emergency services, not "arrange for emergency evaluation"
- **Assessment before 911** — the response sequences assessment before emergency notification
- **"If there is concern for serious injury"** — this qualifier is dangerous; inability to move a limb IS a serious injury indicator
- **"Arrange for emergency evaluation"** is not the same as "call 911" — this could result in a 30-minute delay while someone arranges transport for a patient who may have a femur fracture

**QA Verdict:** FAIL | Severity: High | Failure Type: Under-escalation

---

### WORST-03 — Chest Pain (TC-008) — HIGH
**User Input:** "patient having chest pain, is this an emergency"

**Brad Response (simulated directAnswer):**
> "Chest pain in a home health patient is a potential emergency and should be treated seriously. If symptoms are severe or the patient has difficulty breathing, call 911. Notify the clinical supervisor. Document the complaint and clinical assessment. Monitor vital signs. If symptoms resolve, ensure physician follow-up is scheduled."

**Why This Fails (High):**
- **"If symptoms are severe"** — this hedge creates a dangerous decision threshold. A clinician reading this may decide to monitor rather than call 911 because symptoms don't seem "severe enough"
- **"Potential emergency"** — chest pain should be treated as an emergency until ruled out by clinical evaluation, not as a "potential" emergency
- **"Monitor vital signs"** — this instruction, combined with the hedged 911 guidance, creates a scenario where a clinician might try to manage the patient at home
- The surveyor posture ("assume non-compliance") should equally mean "assume emergency" for cardiac symptoms

**QA Verdict:** FAIL | Severity: High | Failure Type: Under-escalation

---

### WORST-04 — Caregiver Theft — Wrong Sequencing (TC-018)
**User Input:** "i think our aide might be stealing from this patient. what steps do we take"

**Brad Response (simulated directAnswer):**
> "Document the allegation in detail, including the source of the information, specific items reportedly taken, and dates if known. Notify the clinical supervisor and HR. Remove the aide from this patient's case pending investigation. Interview the patient, family members, and any available witnesses. If theft is confirmed, consider law enforcement notification and prepare a formal termination action."

**Why This Fails (Moderate):**
- **Sequence error** — "document the allegation" is listed BEFORE "remove the aide from patient contact"
- **"Remove the aide from this patient's case"** — if theft is suspected, the aide should be removed from ALL patient cases, not just this patient
- **"If theft is confirmed"** — law enforcement should be notified when theft is reasonably suspected, not only after internal confirmation
- **Patient safety logic failure:** In any misconduct scenario, the first action is patient protection. Documenting while the aide continues to work other patients is operationally unsafe

**QA Verdict:** FAIL | Severity: Moderate | Failure Type: Missing action steps; Action sequencing error

---

### WORST-05 — Survey Documentation Follow-up (TC-096) — HIGH
**User Input:** "what specific documentation should I pull together for the surveyor" (following survey readiness discussion)

**Brad Response (simulated directAnswer):**
> "Pull together documentation related to each of the areas we discussed: staff credentials, patient care plans, QAPI reports, and emergency preparedness. Make sure everything is current and organized for quick retrieval during the survey."

**Why This Fails (High):**
- **No specific document names** — "pull together documentation related to each area" is the definition of a non-answer
- **No form IDs** — a compliance engine with 363+ indexed forms should be able to name specific document types
- **"Current and organized"** — this is advice a business consultant would give, not a compliance intelligence engine
- **Session context was present** — the prior turn established pre-survey audit mode. The follow-up should have triggered a structured document checklist
- This represents the worst possible response type: the user needed operational specificity and received strategic generality

**QA Verdict:** FAIL | Severity: High | Failure Type: Weak follow-up handling; Missing documentation guidance

---

### WORST-06 — HIPAA Conflation with Employment Law (TC-065)
**User Input:** "employee reported to work after calling in sick - HIPAA implications?"

**Brad Response (simulated directAnswer):**
> "HIPAA protects the privacy of patient health information. For employee-related health matters, agencies must be careful about how they handle and disclose employee medical information to ensure compliance with applicable privacy laws. The employee's health information should be treated confidentially, and managers should not share details about the employee's health with others in the workplace."

**Why This Fails (Moderate):**
- **HIPAA misapplication** — HIPAA governs patient PHI, not employee medical information
- **The actual applicable law** is ADA (disability-related information), FMLA (leave-related medical information), and California's CMIA (Confidentiality of Medical Information Act) — none were mentioned
- **The actual concern** (infection control — should a sick employee be at work?) was never addressed
- **"HIPAA protects the privacy of patient health information"** — this statement is correct but irrelevant to an employment question
- A clinician or HR staff relying on this answer may make an employment decision based on the wrong legal framework

**QA Verdict:** FAIL | Severity: Moderate | Failure Type: Generic/non-enterprise answer; HIPAA conflation

---

### WORST-07 — Mandatory State Reporting (TC-041) — HIGH
**User Input:** "when does an incident require mandatory state reporting"

**Brad Response (simulated directAnswer):**
> "Mandatory state reporting requirements vary by state but generally include: patient deaths under unexpected circumstances, serious injuries to patients, suspected abuse or neglect, and significant medication errors. The agency's incident reporting policy outlines the specific thresholds. Ensure you consult your state-specific regulations for current reporting requirements."

**Why This Fails (High):**
- **"Vary by state"** — the agency is in California; this is a California question. The answer must be California-specific.
- **"Consult your state-specific regulations"** — this instructs the user to do research that Brad should have already done
- **No CDPH reference** — California CDPH has specific mandatory reporting requirements that Brad should know
- **"Generally include"** — a compliance engine must be definitive, not approximate, on mandatory reporting thresholds
- This is a compliance failure that could result in failure to make a mandatory report

**QA Verdict:** FAIL | Severity: High | Failure Type: Missing policy grounding

---

### WORST-08 — Documentation Discrepancy (TC-045) — HIGH
**User Input:** "we have a documentation discrepancy in the visit notes - different times on different entries"

**Brad Response (simulated directAnswer):**
> "Documentation discrepancies should be addressed promptly. Do not alter the original entries. Prepare an addendum noting the correct information and the reason for the discrepancy. Review the billing status of the associated claims to determine if any corrective action is needed on the claim side."

**Why This Fails (Moderate):**
- **Does not distinguish between clerical error and record alteration** — correcting a typo in a time entry via addendum is permissible; changing documented clinical findings is potentially fraudulent. The legal distinction is critical.
- **No compliance officer notification** — a documentation discrepancy that could affect billing must be reported to the compliance officer
- **"Review the billing status"** is too passive — if the claim has been submitted with a discrepant record, that is an active compliance issue requiring immediate assessment
- **No legal risk framing** — the False Claims Act implications of submitting a claim with known documentation discrepancies are not addressed

**QA Verdict:** FAIL | Severity: Moderate (approaches High) | Failure Type: Missing policy grounding

---

### WORST-09 — Welfare Check Safety Gap (TC-023)
**User Input:** "i got a call from a neighbor saying they hear screaming from our patient's house"

**Brad Response (simulated directAnswer):**
> "This warrants a welfare check. Notify your supervisor immediately. If a clinician is available, consider sending them for an immediate welfare check visit. If you believe there is an imminent threat, call 911. Document the neighbor's call and all actions taken."

**Why This Fails (Moderate):**
- **Staff safety gap** — "send a clinician for an immediate welfare check" without specifying that staff should NOT enter a potentially dangerous environment without law enforcement clearance first
- **"If you believe there is an imminent threat, call 911"** — the description of screaming from a house IS an imminent threat indicator; this should not be conditional
- **Sequencing error** — the response should lead with law enforcement contact, not "notify your supervisor"
- **A clinician entering a scene where screaming was reported without law enforcement clearance is exposed to potential harm**

**QA Verdict:** FAIL | Severity: Moderate | Failure Type: Missing action steps

---

### WORST-10 — Generic Emergency Protocol (TC-007)
**User Input:** "what's the emergency response protocol for home health"

**Brad Response (simulated directAnswer):**
> "The agency maintains emergency response protocols aligned with 42 CFR 484.105 requirements. Emergency situations include life-threatening conditions, patient safety incidents, environmental hazards, and natural disasters. Clinicians must be trained in emergency response and able to access on-call supervision at all times. The agency maintains documentation of emergency procedures and staff training records."

**Why This Fails (Moderate):**
- **No actionable content** — this is a description of what a protocol contains, not the protocol itself
- **No escalation chain** — does not provide the 911 → supervisor → DON → administrator sequence
- **No incident report instruction**
- **"Aligned with 42 CFR 484.105 requirements"** — regulatory citation without content is useless
- **"Documentation of emergency procedures"** — circular: describes the existence of the protocol without providing it
- This response would leave a staff member in an actual emergency without guidance

**QA Verdict:** FAIL | Severity: Moderate | Failure Type: Irrelevant boilerplate; Missing action steps

---

## Section 3: Multi-turn Continuity Examples (10 Cases)

These examples demonstrate Brad's follow-up handling — both successes and failures.

---

### CONTINUITY-01 — Head Injury Follow-up (TC-091 / TC-092)

**Turn 1:**
> "our patient fell and hit their head - she's alert and oriented, what do we do"

**Brad (Turn 1):**
> "With any head injury, even if the patient appears alert and oriented, ED evaluation is recommended due to the risk of delayed intracranial injury. Notify your clinical supervisor immediately. Instruct the patient not to be left alone. Keep the patient still and calm. Document the fall: time, mechanism, patient's current status, and neurological findings. An incident report is required. If any new symptoms develop (confusion, vomiting, unequal pupils, worsening headache), call 911 immediately."

**Turn 2:**
> "ok what's the specific form we need to complete for this"

**Brad (Turn 2):**
> "Complete the incident report form per agency policy. Document the fall circumstances, injury findings, interventions taken, and clinical status."

**Analysis:** Turn 1 is correct and detailed. Turn 2 fails — "the incident report form" should have been named with its specific form ID from the corpus (RM-FM series). The session context was preserved but the specificity request was not satisfied. This is the most common follow-up failure pattern: correct content category, missing operational specificity.

**Verdict:** Turn 1 PASS | Turn 2 FAIL | Pattern: Generic category given instead of specific form ID

---

### CONTINUITY-02 — Abuse Investigation Follow-up (TC-093 / TC-094)

**Turn 1:**
> "we just found out a caregiver is being investigated for abuse"

**Brad (Turn 1):**
> "Immediately remove the caregiver from all patient contact — they must not provide any care while under investigation for abuse. Notify the DON and Administrator now. An APS report is required. If law enforcement is involved, cooperate fully and do not destroy records. File an incident report. Document all steps. The caregiver's personnel file must be noted with the status. Do not discuss the investigation details with other staff."

**Turn 2:**
> "who exactly do I call first and what do I say to them"

**Brad (Turn 2):**
> "Call the DON or clinical supervisor first. Let them know there is an active caregiver abuse investigation. They will guide next steps including APS notification and HR involvement."

**Analysis:** Turn 2 partially advances the answer (correctly identifies DON first) but does not provide the talking points the user asked for. The user asked "what do I say" — Brad should have provided specific information to communicate: caregiver name, nature of allegation, patient involved, actions already taken, and that an APS report needs to be filed. This is a follow-up depth failure.

**Verdict:** Turn 1 PASS | Turn 2 PARTIAL FAIL | Pattern: Session context preserved but "what to say" content missing

---

### CONTINUITY-03 — Survey Prep Documentation Follow-up (TC-095 / TC-096)

**Turn 1:**
> "I'm preparing for a CMS survey - what should I focus on"

**Brad (Turn 1):**
> "For a CMS home health survey, prioritize these domains: (1) Staff credentials — verify all licenses, certifications, CPR, TB, background checks are current. (2) Care plans — all must be signed by physician and current. (3) OASIS — all start-of-care, recertification, and discharge assessments must be complete and signed. (4) QAPI — committee minutes, incident logs, and corrective action documentation must be ready. (5) Patient rights — all patients must have signed rights acknowledgments. (6) Infection control — policy must be current and training documented. (7) Emergency preparedness — plan must be current with staff training records."

**Turn 2:**
> "what specific documentation should I pull together for the surveyor"

**Brad (Turn 2):**
> "Pull together documentation related to each of the areas we discussed: staff credentials, patient care plans, QAPI reports, and emergency preparedness. Make sure everything is current and organized for quick retrieval during the survey."

**Analysis:** The contrast between Turn 1 and Turn 2 is stark. Turn 1 is excellent — structured, domain-by-domain, specific. Turn 2 is the exact opposite — it references Turn 1 without adding any value. The user's follow-up was asking for a concrete document list for the surveyor's review table, not a summary of what was already discussed. This is the most consequential continuity failure in the test set — a survey preparation context is high-stakes and the user needed a pull list.

**Verdict:** Turn 1 PASS | Turn 2 FAIL | Pattern: Circular reference to prior turn instead of advancing to specific document list

---

### CONTINUITY-04 — Billing Discrepancy Correction (TC-097 / TC-098)

**Turn 1:**
> "we have a billing discrepancy on a Medicare claim"

**Brad (Turn 1):**
> "Identify the specific nature of the discrepancy: is it a coding error, documentation gap, unauthorized service, or potential overbilling? Determine whether the claim has already been submitted. If submitted and an overpayment occurred, notify the billing compliance officer immediately — this is a time-sensitive issue. Document the discovery and all investigative steps taken."

**Turn 2:**
> "what exact steps do I take to correct it and what are the risks"

**Brad (Turn 2):**
> "To correct a billing discrepancy: contact the payer to submit a corrected claim or void the original. Work with billing compliance to verify the corrected information. Risks include claim denial, request for additional documentation, and potential recoupment audit if the payer reviews the correction."

**Analysis:** Turn 2 advances the answer (corrected claim process, recoupment audit risk) but misses critical items: (1) the 60-day overpayment return obligation, (2) the OIG Voluntary Self-Disclosure Protocol if fraud may be involved, and (3) False Claims Act exposure for delayed correction. These omissions are High severity in a billing compliance context.

**Verdict:** Turn 1 PASS | Turn 2 PARTIAL FAIL | Pattern: Correct general steps, missing legal risk framework

---

### CONTINUITY-05 — Grievance to Legal Threat (TC-099 / TC-100)

**Turn 1:**
> "i need to know what the process is for handling a patient grievance"

**Brad (Turn 1):**
> "Under 42 CFR 484.50, patient grievances must be handled through a formal process: (1) Acknowledge receipt of the grievance in writing within the agency's required timeframe. (2) Assign an investigator — typically the Director of Patient Services or Patient Rights Officer. (3) Investigate thoroughly and document all findings. (4) Provide a written response within the CoP-required timeframe. (5) Inform the patient of their right to file a complaint with the state licensing board or CMS if dissatisfied. (6) Log the grievance and outcome in the grievance log, which must be available for survey review."

**Turn 2:**
> "the patient is threatening to sue, what changes"

**Brad (Turn 2):**
> "Continue the grievance investigation process per policy. Ensure the patient's concerns are fully addressed in the written response. Document all communications with the patient. The patient's right to file a complaint with the state or CMS remains available regardless of any legal action they may take."

**Analysis:** This is the most serious continuity failure in the test set. Turn 1 is excellent — complete, grounded, and correctly sequenced. Turn 2 is critically wrong. "Threatening to sue" is a legal escalation trigger that should immediately suspend normal grievance process and add: legal counsel notification, litigation hold on all records, cessation of direct patient communication without legal guidance. Brad's response essentially tells the user to continue as normal — which, if followed, could result in spoilated evidence and ex parte violations.

**Verdict:** Turn 1 PASS | Turn 2 CRITICAL FAIL | Pattern: Legal escalation trigger not recognized; standard process continuation when legal hold should have been initiated

---

### CONTINUITY-06 — Good Example: Overdose Session Continuity

**Turn 1:**
> "possible overdose - patient not responsive, family present"

**Brad (Turn 1):**
> "EMERGENCY — Call 911 immediately. Do not leave the patient. Instruct the family to stay with the patient and not move them. If narcan/naloxone is available and you are trained in its use, administer per protocol while waiting for EMS. When 911 arrives, provide all information about medications in the home. Notify clinical supervisor immediately after 911 is called. Complete an incident report. Document everything after EMS arrives — medication found, family members present, time of discovery, time 911 was called."

**Turn 2 (hypothetical follow-up):**
> "EMS has arrived and the patient is stable. what do we do next"

**Brad (Turn 2):**
> "Now that the patient is stable and EMS is on scene: provide EMS with the complete medication list, patient's physician name and contact, and care plan if available. Remain on scene until EMS clears you to leave. Document your entire response timeline. Notify the DON and Administrator. File the incident report today — do not delay. The physician must be notified. A QAPI review of this incident will likely be required. Ensure the patient's care plan is updated to reflect the incident and any new orders from the treating physician after stabilization."

**Analysis:** Both turns are excellent — the session context correctly escalated to emergency in Turn 1 and correctly transitioned to post-emergency documentation and notification protocol in Turn 2. This is the model of how Brad should handle emergency continuity.

**Verdict:** Turn 1 PASS | Turn 2 PASS | Pattern: Emergency escalation preserved, graceful transition to post-emergency protocol

---

### CONTINUITY-07 — Good Example: Abuse Investigation Context Preservation

**Turn 1:**
> "caregiver was seen hitting a patient. what do we do right now"

(See BEST-02 above for full Turn 1 response)

**Turn 2 (hypothetical):**
> "the caregiver is saying it was accidental and wants to speak to the patient to apologize"

**Brad (Turn 2):**
> "Do not allow the caregiver to contact the patient under any circumstances pending the investigation. An accusation of patient abuse creates a mandatory barrier between the accused and the patient — regardless of the caregiver's stated intent. Any contact could be perceived as intimidation, could compromise the investigation, and could create additional liability for the agency. The caregiver must communicate only through HR or legal counsel at this stage. If the caregiver attempts to contact the patient directly, document it and report it to HR and the DON immediately."

**Analysis:** Turn 2 correctly maintains the safety posture from Turn 1, adds the legal framing (intimidation risk, investigation compromise), and provides clear instruction. The session context from Turn 1 (abuse investigation, caregiver removal) was correctly preserved and applied to the new situation.

**Verdict:** Turn 1 PASS | Turn 2 PASS | Pattern: Safety posture correctly maintained across turns

---

### CONTINUITY-08 — Partial Failure: HR Investigation Depth

**Turn 1:**
> "staff member hasn't done their annual training, what do we do"

**Brad (Turn 1):**
> "A staff member who has not completed required annual training must be placed on administrative hold from patient care assignments until training is completed. Notify the supervisor and HR immediately. Schedule the required training as soon as possible. Document the training gap and the remediation steps. This is a survey-visible compliance item — the gap must be closed before survey."

**Turn 2 (hypothetical):**
> "they're saying they did the training, they just lost the certificate"

**Brad (Turn 2):**
> "If the staff member completed the training but cannot produce the certificate, attempt to obtain verification from the training provider. If the training provider can verify completion and reissue documentation, the employee's file must be updated with the new documentation. Until verified documentation is on file, maintain the administrative hold on patient care assignments. The verbal claim of completion is not sufficient for compliance purposes — documentation is required."

**Analysis:** Turn 2 correctly handles the "I did it but lost proof" scenario: seek verification from provider, maintain hold until verified, establish that verbal claim is insufficient. Session context from Turn 1 (annual training gap, administrative hold) was correctly preserved and the new information was correctly processed. Minor gap: does not specify who contacts the training provider (HR, the employee, or the supervisor).

**Verdict:** Turn 1 PASS | Turn 2 PASS (minor gap) | Pattern: Good context preservation with correct application of documentation standard

---

### CONTINUITY-09 — Partial Failure: Survey Follow-up Specificity

**Turn 1:**
> "infection rate has gone up 3 months in a row - what do we do"

**Brad (Turn 1):**
> "A three-month adverse trend in infection rates is a QAPI escalation trigger. Convene the QAPI committee immediately. Conduct a root cause analysis: analyze infection types (UTI, wound, respiratory), identify patterns by clinician, patient population, or geographic cluster, and review infection control practices in the field. If the trend continues, escalate to the Governing Body. Implement targeted corrective actions and monitor outcomes. Consider an external infection control consultation if the root cause is not identified quickly."

**Turn 2 (hypothetical):**
> "what data do we need to present to the QAPI committee"

**Brad (Turn 2):**
> "For the QAPI committee presentation on infection trends, prepare: (1) a month-by-month infection rate table for the past 6-12 months, (2) breakdown by infection type, (3) patient case list (de-identified) with infection dates, (4) clinician assignment data for infected patients (identify if any clinician is overrepresented), (5) current infection control policy and most recent staff training dates, (6) any prior corrective actions and their outcomes."

**Analysis:** Both turns are strong. Turn 1 correctly escalates and initiates root cause analysis. Turn 2 correctly provides a structured data presentation list. The QAPI context from Turn 1 was preserved and the follow-up was answered with appropriate specificity. This is an example of the system performing well when the follow-up is analytical (list what data) rather than operational (what specific form).

**Verdict:** Turn 1 PASS | Turn 2 PASS | Pattern: Good data preparation guidance; context preserved

---

### CONTINUITY-10 — Mixed: Survey Readiness → Specific Domain Drill-down

**Turn 1:**
> "are we survey ready? what should we check"

(See multi-domain response in the main report)

**Turn 2 (hypothetical):**
> "what about our aide supervision requirements specifically - are there documentation requirements for that"

**Brad (Turn 2):**
> "Yes. Under 42 CFR 484.80, home health aide supervision requires an on-site supervisory visit by a Registered Nurse at least every 14 days when the patient requires skilled care. The supervisory visit must include direct observation of the aide's performance and must be documented in the patient record. The documentation must include: date of visit, aide being supervised, patient and aide performance observations, any deficiencies noted, and corrective action if needed. If deficiencies are identified, the supervising RN must re-evaluate within 14 days. These records are a survey focus area."

**Analysis:** Turn 2 correctly drills into the specific domain (aide supervision) with regulatory citation, frequency requirement, documentation requirements, and survey visibility note. The context transition from general survey readiness to aide supervision documentation was handled correctly. This is an example of Brad handling domain-specific follow-up questions well when the question is self-contained.

**Verdict:** Turn 1 PASS | Turn 2 PASS | Pattern: Strong domain-specific answer with regulatory grounding

---

## Section 4: Emergency Scenario Examples (5 Cases)

---

### EMERGENCY-01 — Cardiac Arrest (TC-001 Summary)
**User Input:** "our patient just called, she says her husband is having a heart attack, what do we do??"
**Brad Emergency Response:** Leads with "EMERGENCY — Call 911 immediately." Provides on-scene guidance, escalation chain, incident report instruction, regulatory reference. Life-safety mode triggered.
**Verdict:** PASS — Emergency override functioning correctly
**Key Behavior:** 911 instruction is the first sentence. No preamble. No qualifying language.

---

### EMERGENCY-02 — Unresponsive Patient (TC-003)
**User Input:** "found patient unresponsive when i arrived for visit. pulse present but not responding. HELP"
**Brad Emergency Response:** "EMERGENCY — Call 911 immediately. Stay with the patient — do not leave for any reason. Do not move the patient unless there is immediate physical danger. Call 911 first, then call your clinical supervisor. Tell 911: patient is unresponsive, address, pulse present but no verbal response. After 911 is called, continue to monitor breathing and circulation. Document the time you found the patient and their status. Complete an incident report after EMS arrives."
**Verdict:** PASS — Emergency mode activated by "unresponsive," tone is urgent and appropriately structured
**Key Behavior:** "HELP" in the user query was treated as urgency signal. Response tone matches urgency without becoming unhelpful.

---

### EMERGENCY-03 — Missing Vulnerable Adult (TC-019)
**User Input:** "patient has gone missing, family cant find them and they have dementia"
**Brad Emergency Response:** "EMERGENCY — A missing patient with dementia is a vulnerable adult emergency. Call 911 immediately and report the missing person — do not wait to exhaust internal options first. Provide law enforcement with: patient's full name, physical description, last known location, photo if available, and known wandering patterns. Notify the clinical supervisor and DON immediately. File an incident report. Depending on your state, APS notification may also be required. Do not delay — time is critical in dementia elopement situations."
**Verdict:** PASS — Correct emergency classification, "do not wait to exhaust internal options first" is critical guidance
**Key Behavior:** The instruction not to exhaust internal options before calling 911 is the single most important piece of guidance in this response — it prevents a common organizational mistake of "handling it internally first."

---

### EMERGENCY-04 — Sepsis Indicators (TC-010)
**User Input:** "patient has high fever confusion and rapid breathing - sepsis?"
**Brad Emergency Response:** "EMERGENCY — The symptom triad of high fever, altered mental status, and rapid breathing meets clinical criteria for suspected sepsis. Call 911 or direct the patient to the emergency department immediately — do not attempt to manage sepsis at home. While waiting for EMS: keep the patient still and calm, monitor vital signs if equipment is available, do not give anything by mouth. Notify clinical supervisor immediately. Document onset time, vital signs, and clinical appearance in detail — EMS and the ED team will need this information. File an incident report."
**Verdict:** PASS — Correctly identifies sepsis triad, mandates emergency escalation, provides practical on-scene guidance
**Key Behavior:** "Do not attempt to manage sepsis at home" is an explicit prohibition that prevents the most dangerous failure mode (home monitoring of a septic patient).

---

### EMERGENCY-05 — Possible Death (TC-006)
**User Input:** "Clinician called in - patient looks like they might be deceased. How do we handle this?"
**Brad Emergency Response:** "EMERGENCY — Call 911 immediately. Do NOT move or disturb the patient or surrounding area. Do NOT attempt to make a determination of death — only authorized medical personnel (MD, NP in most states) can legally pronounce death. Instruct the clinician to stay on scene until law enforcement arrives. Notify the DON and Administrator immediately. Preserve the scene completely — do not touch, move, or remove any items. Document the time the clinician arrived, initial observations, and the time 911 was called. An incident report is required. In the event law enforcement treats this as a suspicious death, the agency must cooperate fully and must not provide any documentation to external parties without legal guidance."
**Verdict:** PASS — Correct emergency classification, scene preservation instruction, authority to pronounce clarified, legal guidance caution at end is excellent
**Key Behavior:** The prohibition on making a death determination and the legal guidance caution at the end represent exactly the kind of compliance intelligence that distinguishes Brad from a generic chatbot. These are specific, policy-grounded, and operationally critical.

---

*End of Interaction Samples Document*

*All interaction samples are based on simulated behavior derived from codebase analysis, system prompt review, and LLM behavioral modeling. They represent the expected performance envelope of the Brad iAdministrator system as configured at the time of this QA run.*
