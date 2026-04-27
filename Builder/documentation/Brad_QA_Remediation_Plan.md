# Brad iAdministrator — QA Remediation Plan
## Post-QA Simulation · Prioritized Issue Resolution

**Report Date:** April 23, 2026
**Source:** Brad QA Simulation Report — 100 Test Case Run
**Status:** Awaiting Implementation

---

## Executive Overview

This remediation plan addresses all findings from the Brad iAdministrator QA Simulation. Items are organized by priority tier (Critical → High → Moderate → Low), with specific root causes, recommended fixes, implementation guidance, owner suggestions, and implementation ordering.

The plan is structured for sequential execution within each priority tier. No Moderate or Low items should be started until all Critical items are resolved and re-validated.

---

## Priority Tier 1: CRITICAL — Blocking Deployment

### REM-001: Legal Escalation Detection
**QA Test(s):** TC-100
**Severity:** Critical
**Failure:** Brad continued providing standard grievance process guidance after a user stated "the patient is threatening to sue." No litigation hold instruction, no legal counsel notification, no ex parte prohibition was issued.

**Root Cause:**
The session envelope does not classify "threatening to sue" / "threatening legal action" as a session escalation trigger. The QAPI/grievance mode remained active without upgrading to a legal risk mode. The scenario classifier (`scenarioClassifier.ts`) does not include legal threat patterns in its high-stakes scenario taxonomy.

**Recommended Fix:**

1. Add legal threat detection to `server/ia/scenarioClassifier.ts`:
   - Pattern: `/threaten(ing)?\s+(to\s+)?(sue|legal|attorney|lawsuit|lawyer)/i`
   - Scenario category: `LEGAL_THREAT`
   - Risk level: `critical`
   - Headline: "Legal counsel must be notified immediately. A litigation hold must be placed on all records."

2. Add legal threat handling to the system prompt `SYSTEM_BASE` in `server/ia/prompt.ts`:
   ```
   LEGAL THREAT RULE: If the user's input indicates the patient, family, or any party has threatened legal action, Brad MUST:
   1. Instruct immediate notification of legal counsel / Administrator
   2. Instruct placement of a litigation hold on all relevant records
   3. Instruct cessation of direct patient/party communication without legal guidance
   4. Continue the underlying compliance process in parallel
   This rule overrides all other guidance when active.
   ```

3. In `server/ia/service.ts` `answerInThread()`, add litigation hold enforcement similar to the existing `EMERGENCY_LEAD` override — prepend the legal escalation instruction to `directAnswer` when a legal threat scenario is detected.

**Owner:** Backend/Prompt Engineer
**Estimated Effort:** 2–4 hours
**Blocks Pilot:** YES — Do not proceed to Controlled Pilot until this is implemented and validated.
**Implementation Order:** 1 (first)

---

### REM-002: Clinical Emergency Under-Escalation — Injury Severity and Cardiac Indicators
**QA Test(s):** TC-004 (fall/fracture), TC-008 (chest pain), TC-014 (head injury)
**Severity:** Critical (patient safety implications)
**Failure:** Three clinical scenarios involving possible fracture, cardiac event, and head injury received under-escalated responses. "Cannot move their leg," "chest pain," and "head injury (alert and oriented)" should all trigger 911-priority escalation regardless of current patient status.

**Root Cause:**
The life-safety detection in `server/ia/session/manager.ts` (or wherever `lifeSafetyFlag` is set) relies on keyword patterns that capture the most overt emergencies (unresponsive, not breathing, bleeding, overdose) but miss injury-severity indicators and partial cardiac symptoms.

Additionally, the system prompt's surveyor directive says to "assume non-compliance" but does not have an analogous instruction to "assume emergency" for injury/cardiac queries where the clinical picture is ambiguous.

**Recommended Fix:**

1. Expand the life-safety keyword patterns to include:
   - `cannot move (their|the|a) (leg|arm|limb|hip|neck)`
   - `chest pain`
   - `head injury` / `hit (their|the|his|her) head`
   - `possible fracture` / `broken` (in combination with injury context)
   - `won't wake up` / `not waking up` / `eyes rolled back`

2. Add an explicit directive to the system prompt:
   ```
   INJURY SEVERITY RULE: For any query involving injury to a patient (fall, fracture, head injury, cardiac symptoms including chest pain), Brad MUST default to emergency escalation (911 or ED evaluation) unless the passage corpus explicitly establishes that the symptom can be safely managed at home without emergency services. The burden is on the corpus to prove safety — Brad must not assume safety by default.
   ```

3. Specifically for chest pain: Add "chest pain" as a `lifeSafetyFlag` trigger in the session manager.

**Owner:** Backend Engineer + Clinical Advisor
**Estimated Effort:** 3–5 hours
**Blocks Pilot:** YES — clinical under-escalation is a patient safety risk
**Implementation Order:** 2

---

### REM-003: California Regulatory Corpus Augmentation
**QA Test(s):** TC-035, TC-041, TC-060, TC-062, TC-087, and 4 others
**Severity:** Critical (regulatory compliance)
**Failure:** Brad consistently provides federal-level regulatory guidance without California-specific requirements. For a CA-licensed home health agency, this gap is material across licensing, mandatory reporting, records retention, HR law, and incident reporting.

**Root Cause:**
The corpus does not contain California CDPH-specific home health agency regulatory requirements, California state mandatory reporting thresholds, or California-specific HR law (AB 1008, etc.). The retrieval engine correctly surfaces what is indexed — the gap is in indexing, not in retrieval or reasoning.

**Recommended Fix:**

1. Create and ingest the following California-specific policy documents into the corpus:
   - `CA-REG-001`: CDPH Home Health Agency Licensure Requirements (CA HSC §1726-1742)
   - `CA-REG-002`: California Mandatory Reporting Requirements for Home Health Agencies (CDPH reportable incidents)
   - `CA-REG-003`: California Records Retention Requirements (CDPH 10-year retention rule)
   - `CA-REG-004`: California HR Law for Healthcare Workers (AB 1008, CHHA requirements, background check law)
   - `CA-REG-005`: CDPH DON Vacancy Notification Requirements

2. Tag these documents with `regulatoryTags: ['California', 'CDPH', 'CA State']` so the retrieval engine prioritizes them for CA-specific queries.

3. Add a California regulatory context note to the system prompt:
   ```
   JURISDICTION: This agency is licensed in California. All answers must reflect California law as the controlling standard, with federal law as the floor. When California state requirements are more stringent than federal requirements, California law governs.
   ```

**Owner:** Compliance Officer + Corpus Developer
**Estimated Effort:** 8–16 hours (document creation and indexing)
**Blocks Pilot:** YES — compliance gaps from missing state-specific content are systematic and widespread
**Implementation Order:** 3 (can run in parallel with REM-002 after REM-001 is complete)

---

## Priority Tier 2: HIGH — Required Before Pilot

### REM-004: Follow-up Depth Advancement
**QA Test(s):** TC-092, TC-094, TC-096, TC-098
**Severity:** High
**Failure:** Follow-up questions that requested increased operational specificity ("what's the specific form?", "what exactly do I say?", "what specific documentation?") received responses that repeated the prior turn's content rather than advancing to deeper operational detail.

**Root Cause:**
The system prompt's chat continuity rules instruct the model to "continue the active case" but do not distinguish between a new case query and a depth-seeking follow-up. The LLM treats all turns equivalently and generates responses at first-turn summary depth.

**Recommended Fix:**

1. Add follow-up depth detection to the chat system prompt:
   ```
   FOLLOW-UP DEPTH RULE: When the user asks a follow-up question that contains specificity signals ("specific," "exactly," "which form," "what do I say," "step by step," "what next," "what exactly"), Brad MUST:
   - NOT repeat the prior turn's summary
   - ADVANCE to the next level of operational specificity
   - For form questions: provide the exact form ID from the corpus
   - For notification questions: provide specific talking points, not just the role to notify
   - For documentation questions: provide a specific document checklist with IDs
   - For step questions: provide ordered, numbered steps with role assignments
   ```

2. In `server/ia/session/manager.ts` or `envelope.ts`, detect follow-up specificity signals in the user input and add a `followUpDepth: 'detail'` flag to the turn context, which can be injected into the session context envelope.

3. When `followUpDepth: 'detail'` is set, the envelope should include an explicit directive:
   ```
   [SESSION DIRECTIVE] User is requesting operational detail beyond the summary already provided. Provide specific, numbered steps, exact form IDs, and concrete talking points. Do not repeat prior guidance.
   ```

**Owner:** Backend Engineer + Prompt Engineer
**Estimated Effort:** 4–6 hours
**Blocks Pilot:** YES — follow-up quality is the primary use case for Chat Mode
**Implementation Order:** 4

---

### REM-005: Action Sequencing in Safety and Misconduct Scenarios
**QA Test(s):** TC-018, TC-020, TC-023
**Severity:** High
**Failure:** In theft allegation (TC-018), the action sequence led with "document the allegation" rather than "immediately remove aide from patient contact." In medication error (TC-020), physician notification was ordered after administrative steps. In welfare check (TC-023), staff entry was suggested before law enforcement clearance.

**Root Cause:**
The system prompt specifies an internal evaluation order (Survey Result → Deficiencies → Current State → Gap Analysis → Compliance Impact → Corrective Action → Ownership → References) that is appropriate for compliance analysis but not for safety-critical action sequencing. Patient safety actions must occur before compliance documentation.

**Recommended Fix:**

1. Add an explicit action sequencing rule to the system prompt:
   ```
   ACTION SEQUENCING RULE (MANDATORY): When the query involves patient safety, caregiver misconduct, or active harm, the directAnswer MUST sequence actions in this order:
   1. IMMEDIATE PATIENT PROTECTION — remove source of harm, call for help
   2. CLINICAL RESPONSE — if patient needs medical attention
   3. ESCALATION — supervisor, DON, administrator
   4. EXTERNAL NOTIFICATION — APS, law enforcement, state agency (if required)
   5. DOCUMENTATION — incident report, record of actions taken
   Patient protection ALWAYS precedes documentation. NEVER lead with documentation in a patient safety context.
   ```

2. Add to the scenario classifier: a `CAREGIVER_MISCONDUCT` category that forces `forceScenarioAnswer: true` with a headline that leads with "Remove [caregiver] from patient contact immediately."

3. For medication errors, add a specific action template:
   ```
   MEDICATION ERROR TEMPLATE:
   1. Assess patient status (call 911 if patient is in distress)
   2. Notify prescribing physician IMMEDIATELY (first external contact)
   3. Notify clinical supervisor
   4. Document the error
   5. File incident report
   6. Pharmacy notification if applicable
   ```

**Owner:** Prompt Engineer + Clinical Advisor
**Estimated Effort:** 3–4 hours
**Blocks Pilot:** YES — incorrect action sequencing in patient safety scenarios creates patient harm risk
**Implementation Order:** 5

---

### REM-006: OIG Voluntary Self-Disclosure Protocol in Billing Guidance
**QA Test(s):** TC-050, TC-051, TC-098
**Severity:** High
**Failure:** Billing discrepancy correction guidance omitted the OIG Voluntary Self-Disclosure Protocol (VSD) and the False Claims Act obligation to refund identified overpayments.

**Root Cause:**
The corpus likely contains billing hold and claims correction guidance but may not contain a specific policy document on voluntary self-disclosure and overpayment obligations under 42 USC §1320a-7k (the 60-day overpayment rule).

**Recommended Fix:**

1. Add a policy document to the corpus: `FN-POL-VSD: OIG Voluntary Self-Disclosure and Overpayment Identification Policy` covering:
   - The 60-day rule to identify and report overpayments
   - When VSD is appropriate vs. standard corrected claim
   - False Claims Act exposure for delayed disclosure
   - Steps for submitting a VSD to OIG

2. Add a billing integrity rule to the system prompt:
   ```
   BILLING INTEGRITY RULE: When answering billing correction or discrepancy questions, Brad MUST:
   - Acknowledge that overpayments must be returned within 60 days of identification (42 USC §1320a-7k)
   - Reference the OIG Voluntary Self-Disclosure Protocol if the discrepancy may involve potential fraud
   - Note that delayed correction creates False Claims Act exposure
   ```

**Owner:** Compliance Officer + Corpus Developer
**Estimated Effort:** 3–5 hours (document creation + system prompt addition)
**Implementation Order:** 6

---

### REM-007: Mandatory Reporting Suspicion Standard
**QA Test(s):** TC-027, TC-041
**Severity:** High
**Failure:** Brad did not explicitly state that mandatory abuse reporting is triggered by "reasonable suspicion" — not confirmed evidence. This is a legally critical distinction.

**Root Cause:**
The corpus likely contains abuse reporting policy that describes the reporting obligation, but the system prompt does not include an instruction to explicitly flag the suspicion standard when responding to abuse/neglect queries.

**Recommended Fix:**

1. Add to the system prompt:
   ```
   MANDATORY REPORTING STANDARD: When answering questions about suspected abuse, neglect, or exploitation, Brad MUST explicitly state: "Mandatory reporting is triggered by reasonable suspicion of abuse — not confirmed evidence. Report first; investigate after."
   ```

2. Verify that the corpus abuse reporting policy explicitly states the suspicion standard and reference it in answers.

**Owner:** Prompt Engineer + Compliance Officer
**Estimated Effort:** 1–2 hours
**Implementation Order:** 7

---

## Priority Tier 3: MODERATE — Required Before Production

### REM-008: Specific Form ID Retrieval in Incident/Safety Responses
**QA Test(s):** TC-022, TC-092, TC-096
**Severity:** Moderate
**Failure:** Brad consistently names the category of form needed ("file an incident report") without retrieving and naming the specific form ID (e.g., "RM-FM-001 — Incident/Adverse Event Report").

**Root Cause:**
The `requiredArtifacts` field in the `StructuredResponse` is populated by the LLM's output, which in turn depends on whether the corpus passages explicitly reference form IDs in context. For incident reports, the form ID should always be named.

**Recommended Fix:**

1. Add a targeted retrieval enhancement: for queries classified as `incident_report` or `safety_event`, perform a direct lookup of the incident report form ID from the corpus index and inject it into the context envelope.

2. Add to the system prompt:
   ```
   FORM ID RULE: When any answer involves completing a form, Brad MUST name the specific form ID (XX-FM-NNN format) from the corpus. Never say "complete the incident report" — say "complete [RM-FM-XXX] — [form title]." If no specific form ID can be confirmed from the passages, state that and provide the category.
   ```

3. Ensure the incident report form(s) in the corpus (`RM-FM-*` series) are indexed with keywords `incident`, `adverse event`, `safety report` so they surface in every incident-type query.

**Owner:** Backend Engineer + Corpus Developer
**Estimated Effort:** 4–6 hours
**Implementation Order:** 8

---

### REM-009: Regulatory Timeframe Completeness
**QA Test(s):** TC-032, TC-039, TC-029
**Severity:** Moderate
**Failure:** Several compliance responses cited the obligation without the associated regulatory timeframe (CoP grievance response window, HIPAA 60-day breach notification, near-miss documentation timeline).

**Root Cause:**
The model correctly identifies the obligation from the corpus but may not extract or surface the associated timeframe when it appears in a different section of the same document.

**Recommended Fix:**

1. Add a regulatory timeframe extraction rule to the system prompt:
   ```
   TIMEFRAME RULE: When answering compliance or reporting questions, Brad MUST include the applicable regulatory timeframe if one exists (e.g., "within 60 days," "within 24 hours," "within the survey cycle"). If no timeframe is specified in the passages, state "no specific timeframe is defined in the available passages."
   ```

2. Audit the corpus documents for HIPAA breach notification (60-day), CoP grievance response, and OASIS submission deadlines to ensure these timeframes are present in the indexed text.

**Owner:** Prompt Engineer + Corpus Developer
**Estimated Effort:** 2–3 hours
**Implementation Order:** 9

---

### REM-010: HIPAA Scope Clarification
**QA Test(s):** TC-065
**Severity:** Moderate
**Failure:** When asked about "HIPAA implications" for an employment decision, Brad did not clearly distinguish HIPAA (patient PHI law) from ADA/FMLA (employee privacy law).

**Root Cause:**
The model may not have strong enough disambiguating training data to distinguish patient privacy law from employee privacy law. The system prompt does not include a scope clarification for HIPAA vs. ADA/FMLA.

**Recommended Fix:**

1. Add a HIPAA scope rule to the system prompt:
   ```
   HIPAA SCOPE RULE: HIPAA governs the privacy of patient Protected Health Information (PHI). It does NOT govern employee medical information. Employee medical information is governed by ADA (Americans with Disabilities Act), FMLA (Family and Medical Leave Act), and California state law (CMIA). When a question involves employee health or employment decisions, do NOT apply HIPAA — identify the correct legal framework (ADA, FMLA, CMIA).
   ```

**Owner:** Prompt Engineer
**Estimated Effort:** 1 hour
**Implementation Order:** 10

---

### REM-011: Follow-up Quality for Pre-Survey Audit Mode
**QA Test(s):** TC-096
**Severity:** Moderate (High impact on use case value)
**Failure:** When asked to specify documentation for a CMS survey after a survey readiness overview, Brad returned a vague reference rather than a concrete document list.

**Root Cause:**
The `pre_survey_audit` intent was correctly set but the follow-up specificity signal was not recognized. This is related to REM-004 but specific enough to warrant its own item.

**Recommended Fix:**

1. For pre-survey audit sessions, add a dedicated follow-up handler that provides a structured document pull list. The session envelope should carry a "survey prep" state that, when detected on a follow-up query, triggers a document retrieval sweep across credential files, care plans, OASIS records, QAPI reports, incident logs, and emergency preparedness documents.

2. Add a survey document list template to the system prompt:
   ```
   PRE-SURVEY DOCUMENT LIST: When in pre-survey audit mode and the user asks about documentation, provide a numbered checklist:
   1. Employee credential files (license, CHHA certification, CPR, TB, background check)
   2. Current signed care plans with physician certification
   3. OASIS assessments (Start of Care, recertification, discharge)
   4. QAPI committee meeting minutes (last 12 months)
   5. Incident/adverse event log
   6. Emergency preparedness plan with staff training records
   7. Patient rights notices and signed acknowledgments
   8. Infection control logs
   9. Most recent survey report and plan of correction (if applicable)
   10. Agency license and administrator qualification documentation
   ```

**Owner:** Prompt Engineer
**Estimated Effort:** 2–3 hours
**Implementation Order:** 11

---

### REM-012: TB Infection vs Active TB Disease Distinction
**QA Test(s):** TC-064
**Severity:** Moderate
**Failure:** Response conflated latent TB infection with active TB disease. Active TB requires mandatory public health reporting; latent TB does not (without active disease). The clinical and regulatory obligations differ significantly.

**Root Cause:**
The corpus likely contains TB policy but may not distinguish latent vs active disease with sufficient clarity for the model to surface the distinction consistently.

**Recommended Fix:**

1. Add a TB clarification to the clinical HR corpus documents:
   - Latent TB infection (LTBI): monitor, treat if indicated, no removal from patient contact required unless symptomatic
   - Active TB disease: immediate removal from patient contact, mandatory public health notification, contact tracing

2. Add to the system prompt:
   ```
   TB RULE: When answering TB-related HR questions, distinguish between Latent TB Infection (LTBI) and Active TB Disease. LTBI does not require immediate removal from patient contact. Active TB disease requires immediate removal AND mandatory public health reporting.
   ```

**Owner:** Prompt Engineer + Clinical Advisor
**Estimated Effort:** 1–2 hours
**Implementation Order:** 12

---

### REM-013: EpiPen Authorization Caveat
**QA Test(s):** TC-011
**Severity:** Low (edge case, clinical accuracy)
**Failure:** EpiPen administration guidance did not specify the prior authorization requirement.

**Root Cause:**
The model provided correct general guidance (use EpiPen if available) without the clinical nuance that EpiPen use by a home health aide requires a standing physician order or emergency protocol authorization.

**Recommended Fix:**

Add to the clinical emergency handling passages: a note that EpiPen administration by non-RN staff requires prior physician authorization via standing order or emergency protocol.

**Owner:** Clinical Advisor + Corpus Developer
**Estimated Effort:** 1 hour
**Implementation Order:** 13 (Low priority — implement after all Moderate items)

---

## Priority Tier 4: LOW — Quality Improvements

### REM-014: Generic QAPI Process Descriptions
**QA Test(s):** TC-074, TC-076, TC-078
**Severity:** Low
**Failure:** QAPI process descriptions were generic (applicable to any agency) rather than agency-specific.

**Recommended Fix:**
Enrich QAPI process documentation in the corpus with agency-specific committee names, meeting frequencies, reporting templates, and the specific QAPI forms used by Care Indeed. Inject the current operational state (if available) into QAPI responses.

**Owner:** Quality Director + Corpus Developer
**Estimated Effort:** 4–8 hours
**Implementation Order:** 14

---

### REM-015: Interpreter vs Bilingual Employee Distinction
**QA Test(s):** TC-085, TC-067
**Severity:** Low
**Failure:** The legal distinction between a trained interpreter and a bilingual employee was not drawn sharply enough.

**Recommended Fix:**
Add to the language services policy document: explicit statement that an untrained bilingual employee is NOT a qualified interpreter for clinical assessments, informed consent, or advance directive discussions. Reference the Title VI qualified interpreter standard.

**Owner:** Compliance Officer + Corpus Developer
**Estimated Effort:** 1–2 hours
**Implementation Order:** 15

---

### REM-016: Near-Miss Reporting Nuance
**QA Test(s):** TC-029
**Severity:** Low
**Failure:** Near-miss reporting was described as required without distinguishing mandatory vs. voluntary reporting contexts.

**Recommended Fix:**
Clarify in the near-miss reporting policy document: distinguish between agency-required internal near-miss reporting (which Brad should confirm is mandatory per agency policy) and voluntary external reporting programs. State which near-miss categories the agency has elected to mandate.

**Owner:** Quality Director + Corpus Developer
**Estimated Effort:** 1 hour
**Implementation Order:** 16

---

## Implementation Timeline Summary

| Order | Item | Priority | Effort | Owner |
|-------|------|----------|--------|-------|
| 1 | REM-001: Legal Escalation Detection | Critical | 2–4h | Backend/Prompt Eng |
| 2 | REM-002: Clinical Emergency Under-Escalation | Critical | 3–5h | Backend + Clinical |
| 3 | REM-003: California Regulatory Corpus | Critical | 8–16h | Compliance + Corpus |
| 4 | REM-004: Follow-up Depth Advancement | High | 4–6h | Backend + Prompt Eng |
| 5 | REM-005: Action Sequencing in Safety Scenarios | High | 3–4h | Prompt Eng + Clinical |
| 6 | REM-006: OIG VSD Protocol in Billing | High | 3–5h | Compliance + Corpus |
| 7 | REM-007: Mandatory Reporting Suspicion Standard | High | 1–2h | Prompt Eng + Compliance |
| 8 | REM-008: Specific Form ID Retrieval | Moderate | 4–6h | Backend + Corpus |
| 9 | REM-009: Regulatory Timeframe Completeness | Moderate | 2–3h | Prompt Eng + Corpus |
| 10 | REM-010: HIPAA Scope Clarification | Moderate | 1h | Prompt Eng |
| 11 | REM-011: Pre-Survey Audit Follow-up | Moderate | 2–3h | Prompt Eng |
| 12 | REM-012: TB Distinction | Moderate | 1–2h | Prompt Eng + Clinical |
| 13 | REM-013: EpiPen Authorization | Low | 1h | Clinical + Corpus |
| 14 | REM-014: Generic QAPI Descriptions | Low | 4–8h | Quality + Corpus |
| 15 | REM-015: Interpreter/Bilingual Distinction | Low | 1–2h | Compliance + Corpus |
| 16 | REM-016: Near-Miss Reporting Nuance | Low | 1h | Quality + Corpus |

**Total estimated remediation effort: 42–75 hours**
**Critical items only: 13–25 hours**

---

## Re-validation Requirements

After completing Critical items (REM-001 through REM-003), re-run the following test cases as a minimum regression set before advancing to Controlled Pilot:

- TC-004, TC-008, TC-014 (emergency escalation)
- TC-100 (legal escalation)
- TC-041, TC-060, TC-062, TC-087 (California regulatory)
- TC-092, TC-094, TC-096, TC-098 (follow-up depth)
- TC-017, TC-018, TC-020 (action sequencing)

Target re-validation score for Controlled Pilot advancement: **≥ 75/100**
Target re-validation score for Production: **≥ 85/100**

---

*This remediation plan was generated from the Brad QA Simulation Report (April 23, 2026). All items are grounded in specific test case failures and code-level analysis. Implementation should be prioritized strictly in the order presented within each tier.*
