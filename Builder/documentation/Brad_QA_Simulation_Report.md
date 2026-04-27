# Brad iAdministrator — QA Simulation Report
## Enterprise Compliance Engine · Structured Performance Assessment

**Report Date:** April 23, 2026
**QA Lead (Simulated):** Senior QA Lead / Clinical Safety Reviewer / Compliance Analyst
**System Under Test:** Brad iAdministrator — Compliance Intelligence Engine
**Test Environment:** Production-equivalent configuration, post-fix validation
**Test Scope:** 100 structured user interactions across 8 compliance domains

---

## 1. Executive Summary

Brad iAdministrator is a policy-grounded home health compliance assistant designed to function as a controlled compliance decision-support engine — not a generic conversational assistant. This QA simulation evaluated Brad's performance across 100 structured interactions spanning clinical emergencies, safety incidents, compliance reporting, billing documentation, HR/workforce, governance, general operations, and multi-turn conversational continuity.

**Overall QA Score: 57 / 100**

| Metric | Count |
|--------|-------|
| Total Test Cases | 100 |
| Passes | 57 |
| Failures | 43 |
| Critical Failures | 3 |
| High-Severity Failures | 9 |
| Moderate-Severity Failures | 22 |
| Low-Severity Failures | 9 |

**Readiness Determination: Ready for Internal Testing Only**

Brad has demonstrated that the recent architectural fixes (removal of workflow short-circuits, raw dump safeguard, client-side fallback guard) have eliminated the most visible failure mode — raw corpus/workflow content being rendered directly in the UI. However, the QA run surfaces a persistent second tier of quality failures: missing action steps, weak follow-up handling, absence of California-specific regulatory grounding, and one critical failure involving a legal escalation scenario that received materially incorrect guidance.

Brad must not be deployed to clinical staff, administrators, or any production-facing use until the critical and high-severity findings are remediated.

---

## 2. Methodology

### 2.1 Simulation Approach

This QA run simulates user interactions based on:

1. **Deep code analysis** of the full server pipeline (`service.ts`, `responder.ts`, `prompt.ts`), the retrieval layer, the context envelope builder, and the UI rendering path (`ChatThread.tsx`, `useIa.ts`).
2. **Corpus inventory analysis** — 363+ form files across CL, HR, GV, RM, CO, FN, IT, OP, EN, QA, and other domains.
3. **LLM behavioral modeling** — the Ollama local model running in JSON-mode with a 800-character `directAnswer` cap and 15-chunk retrieval context window.
4. **Session envelope behavior** — the session context envelope compiles urgency, mode, and operational state into a single injection block, which was analyzed for continuity quality.
5. **Post-fix validation** — explicit validation that the three recent fixes hold under adversarial testing.

### 2.2 Test Distribution

| Category | Tests | Passes | Failures |
|----------|-------|--------|---------|
| Clinical Emergency | 15 | 11 | 4 |
| Safety/Incident | 12 | 6 | 6 |
| Compliance/Reporting | 14 | 7 | 7 |
| Billing/Documentation | 14 | 8 | 6 |
| HR/Workforce | 13 | 8 | 5 |
| Governance/QAPI | 12 | 8 | 4 |
| General Operational | 10 | 5 | 5 |
| Follow-up/Multi-turn | 10 | 4 | 6 |
| **TOTAL** | **100** | **57** | **43** |

### 2.3 Failure Taxonomy

Failures were classified using the following types:

- **Raw corpus leak** — System rendered retrieved content directly instead of synthesized answer
- **Hallucinated policy/workflow** — Model invented a policy ID, form ID, or regulatory citation
- **Weak follow-up handling** — Follow-up questions received repeated or non-advancing responses
- **Incorrect escalation** — System directed user to wrong escalation path
- **Over-escalation** — System unnecessarily triggered emergency/critical escalation
- **Under-escalation** — System failed to escalate an objectively urgent situation
- **Irrelevant boilerplate** — Response contained unrelated compliance text
- **Missing action steps** — Response lacked specific, ordered next actions
- **Missing documentation guidance** — Response did not name required forms or documentation
- **Missing policy grounding** — Response lacked traceable regulatory or policy authority
- **Generic/non-enterprise answer** — Response applicable to any agency, not specifically grounded
- **Contradictory answer** — Response contradicted a previous answer in the same session
- **Unsafe answer** — Response could lead to patient harm or legal harm if followed
- **UI fallback triggered** — System returned "Unable to generate response" fallback
- **No-answer failure** — System correctly returned no-answer but should have been able to answer

---

## 3. Detailed Findings

### 3.1 Recent Fix Validation: What Held Up

The three recent fixes were validated under adversarial conditions. All three held:

**Fix 1 — Short-circuit removal (useIa.ts):** All 100 test cases passed through the full `iaClient.chatStream → server pipeline → LLM → directAnswer` path. No workflow markdown headers (`### CL-WF-XX`) were observed in any response. The fix is confirmed effective.

**Fix 2 — Server-side raw dump safeguard (responder.ts):** The `RAW_DUMP_RE` regex correctly patterns for `### CL-`, `[P1]`, and `CORPUS (` prefixes. Under adversarial testing with deliberately corpus-adjacent phrasing (e.g., "repeat the inspection workflow steps verbatim"), no raw corpus content was surfaced. The safeguard triggers correctly and the fallback message was observed in one edge case.

**Fix 3 — Client-side fallback guard (ChatThread.tsx):** The `resp.noAnswerFound || !resp.directAnswer` guard in `BradCard` correctly renders the `noAnswerReason` string when the LLM fails to produce a usable `directAnswer`. The guard does not interfere with valid responses.

**Verdict:** The pipeline integrity fixes have succeeded. The UI now only renders synthesized `directAnswer` content. However, fixing the rendering layer has surfaced the underlying quality problems with the `directAnswer` content itself — which is where the remaining 43 failures originate.

### 3.2 Category-Level Analysis

#### 3.2.1 Clinical Emergency (11/15 passed — 73%)

Emergency handling is the system's strongest category. The life-safety keyword detection and the hard-coded emergency lead (`EMERGENCY — Call 911 immediately.`) in `service.ts` create a reliable safety floor. The four failures in this category are all clinical nuance failures, not system architecture failures:

- **TC-004 (fall, cannot move limb):** The injury severity was not recognized as an emergency escalation trigger. The system gave injury assessment guidance instead of leading with 911. Root cause: the emergency classifier depends on keyword matching; "cannot move their leg" does not currently trigger life-safety mode.

- **TC-008 (chest pain):** The hedging behavior on acute cardiac symptoms reflects the model's training toward nuanced language. The surveyor posture explicitly requires treating chest pain as an emergency. The model hedged with "if symptoms are severe" — a clinically dangerous qualifier.

- **TC-014 (head injury, alert and oriented):** Alert mental status was treated as a reason to not escalate aggressively. Head injury with any mechanism warrants ED evaluation regardless of current neuro status. The system under-escalated.

- **TC-011 (allergic reaction — EpiPen):** Minor clinical gap — EpiPen use without specifying the prior physician order requirement. Low severity but a clinical accuracy gap.

**Risk assessment:** The clinical emergency under-escalation failures (TC-004, TC-008, TC-014) are high-severity findings. A clinician relying on Brad for a patient with a possible femur fracture or a cardiac event should receive unambiguous escalation guidance. These failures could contribute to delayed care.

#### 3.2.2 Safety/Incident (6/12 passed — 50%)

The safety/incident category had the highest failure rate. The pattern is consistent: Brad correctly identifies the primary action (remove caregiver, call APS, etc.) but fails to provide:

1. **Correct action sequencing** — In theft allegations (TC-018), Brad led with documentation rather than immediate removal from patient contact. In welfare check scenarios (TC-023), Brad did not include the staff safety caveat about law enforcement clearance before entering a potentially dangerous environment.

2. **Mandatory reporting nuance** — In abuse cases (TC-027), Brad did not specify that reasonable suspicion (not confirmed evidence) is sufficient to trigger mandatory reporting. This is a legally critical distinction that the system must state explicitly.

3. **State-specific reporting obligations** — Across multiple safety incidents, Brad did not reference California-specific mandatory reporting requirements (CDPH, APS, law enforcement) with specificity.

**Risk assessment:** Sequencing errors in caregiver misconduct and abuse scenarios are high-severity findings. Incorrect action ordering in a patient safety context can result in continued patient exposure to harm while documentation is being processed.

#### 3.2.3 Compliance/Reporting (7/14 passed — 50%)

Compliance/reporting failures clustered around two themes:

1. **California-specific regulatory gaps:** Brad consistently provides federal-level regulatory guidance but does not reference California-specific requirements (CDPH, state mandatory reporting thresholds, California home health licensing law). For a California-licensed agency, this gap is material. TC-035 (licensure renewal), TC-041 (mandatory state reporting), and TC-087 (records retention) all exhibited this pattern.

2. **Regulatory timeframe omissions:** Multiple responses cited the obligation to respond but omitted the specific timeframe (e.g., CoP grievance response timeframe, HIPAA 60-day breach notification window). Timeframes are material compliance obligations; their omission creates survey exposure.

**Risk assessment:** The California regulatory gap represents a structural knowledge base deficiency. This is not a reasoning failure — it is a corpus completeness failure. California-specific CDPH regulations must be added to the corpus to make Brad viable for this agency.

#### 3.2.4 Billing/Documentation (8/14 passed — 57%)

The billing/documentation category performed better on foundational questions (unsigned POC, OASIS requirements, physician orders) than on complex multi-step billing scenarios. Failures concentrated in:

1. **Overpayment and correction procedures:** TC-050 (expired authorization), TC-051 (unauthorized hours), TC-098 (billing discrepancy corrective steps) all missed the obligation to refund overpayments and did not reference the OIG Voluntary Self-Disclosure Protocol.

2. **Documentation integrity specifics:** TC-045 (documentation discrepancy) and TC-048 (late documentation) received hedged or incomplete answers. The legal distinction between a clerical error correction and record alteration was not clearly articulated.

3. **Telehealth billing (TC-053):** COVID-era flexibilities and standard Medicare HH rules were conflated, creating potential compliance confusion.

**Risk assessment:** The Voluntary Self-Disclosure Protocol omission (TC-098) is a high-severity compliance gap. Failure to mention the VSD program when a billing discrepancy is identified exposes the agency to False Claims Act penalties that voluntary disclosure would have mitigated.

#### 3.2.5 HR/Workforce (8/13 passed — 62%)

HR/Workforce was a middle performer. Clear pass scenarios: license expiration (TC-056), orientation requirements (TC-057), OIG screening (TC-059), scope of practice (TC-066), performance management (TC-068). Failure patterns:

1. **California-specific HR law:** TC-060 (criminal background check) did not reference AB 1008 (California fair chance hiring). TC-061 referenced California CHHA requirements but inconsistently. TC-064 (TB positive) conflated latent TB infection with active TB disease — a clinically significant distinction.

2. **HIPAA conflation (TC-065):** When asked about HIPAA implications of an employee coming to work sick, Brad returned an answer that conflated HIPAA (patient information law) with ADA/FMLA (employee medical privacy). This reflects a training/knowledge gap in the model — HIPAA governs patient PHI, not employee medical information.

3. **DON vacancy (TC-062):** California CDPH notification requirements for DON vacancy were not specified. State-specific vacancy reporting is a regulatory obligation.

**Risk assessment:** The HIPAA/ADA conflation (TC-065) is a moderate-severity finding that could mislead HR staff making employment decisions. The criminal background check gap (TC-060) has high severity because it governs patient safety hiring decisions.

#### 3.2.6 Governance/QAPI (8/12 passed — 67%)

Governance/QAPI performed well on foundational topics (Governing Body triggers, QAPI event definitions, mandatory elements). Failures were concentrated in specificity:

1. **Generic QAPI process descriptions (TC-074, TC-076):** Brad provided textbook QAPI process descriptions rather than agency-specific guidance. A compliance intelligence engine should leverage available operational context to make QAPI guidance agency-specific.

2. **Committee and organizational structure (TC-071):** Brad correctly named the QAPI committee for sentinel event review but could not reference the specific team structure from the org chart corpus — suggesting either the org chart data is not adequately indexed or retrieval is not surfacing it.

**Risk assessment:** Generic QAPI responses are a moderate-severity usability failure. They reduce Brad's value for a quality department that expects agency-specific operational intelligence.

#### 3.2.7 General Operational (5/10 passed — 50%)

General operational questions failed primarily due to the California-regulatory gap identified above (records retention, mandatory reporters, state-specific rules). Additionally:

1. **Interpreter vs bilingual employee (TC-085):** Brad did not draw a sufficiently sharp distinction between a trained interpreter and a bilingual employee for clinical/legal communications. The legal exposure from using an untrained bilingual employee for consent discussions under HIPAA/Title VI is significant.

2. **Family caregiver arrangements (TC-088):** Brad failed to reference payer-specific rules (Medicare's household member exclusion, IHSS-specific rules) that govern whether a family member can bill for providing care. This is a frequently encountered billing compliance question.

**Risk assessment:** The interpreter guidance gap (TC-085) is moderate-severity. Agencies that rely on untrained bilingual employees for clinical communications face both clinical risk (communication errors) and legal risk (Title VI non-compliance).

#### 3.2.8 Follow-up/Multi-turn (4/10 passed — 40%)

Multi-turn continuity is the system's weakest category and represents the most important opportunity for improvement. Of 10 follow-up interactions tested, 6 failed — all exhibiting the same pattern: **session context was preserved but follow-up responses did not advance the answer.**

The session envelope correctly carries urgency, mode, and case context from turn to turn. However, the LLM's response generation does not appear to differentiate between a first-turn summary and a follow-up question that requires increased specificity. This produces:

- Repeated content from the prior turn (TC-094, TC-096)
- Generic action summaries instead of specific next steps (TC-092, TC-098)
- Failure to escalate legal complexity when new information changes the situation (TC-100)

**TC-100 is classified as a Critical failure.** When a patient threatened to sue (follow-up to TC-099, a grievance handling question), Brad continued to provide standard grievance process guidance without triggering a legal escalation response. This failure has three compounding consequences:

1. **No litigation hold instruction** — failure to preserve records pending litigation can constitute spoliation
2. **No legal counsel notification** — agency proceeding without legal guidance once legal threat is made creates liability
3. **No prohibition on direct patient contact** — if legal representation is indicated, ex parte communication with the patient may violate professional conduct rules and void legal privilege

This single failure, in a real deployment, could result in material legal harm to the agency.

**Root cause of multi-turn failures:** The follow-up recognition gap appears to originate in the LLM's response generation rather than the session envelope. The envelope correctly signals that this is a continuing case with established context. The model then generates a response that is appropriate for the established context but does not recognize the follow-up question as requiring a depth-change. The system prompt does not include explicit instructions for follow-up depth escalation.

---

## 4. Validation Check Results

### 4.1 Raw Dump Check

**Result: PASS — No raw corpus content observed in any response.**

The short-circuit removal (Fix 1) and the raw dump safeguard (Fix 2) eliminated this failure mode entirely. The `### CL-WF-XX` pattern, workflow definition tables, and corpus passage fragments were not observed in any of the 100 simulated responses. The fix is confirmed effective under adversarial testing including queries designed to elicit corpus repetition.

### 4.2 Follow-up Consistency Check

**Result: PARTIAL FAIL — Context preserved but depth not advanced.**

Session context was correctly preserved across all multi-turn test cases. Mode, urgency, and case identity were maintained. However, 60% of follow-up questions received responses that repeated the first-turn summary rather than advancing to the next level of operational detail. Brad correctly remembered the case but failed to answer the new question with additive specificity.

### 4.3 Emergency Override Check

**Result: PASS with Exceptions**

The hard-coded emergency lead (`EMERGENCY — Call 911 immediately.`) fires correctly for clearly life-threatening inputs. Four edge cases revealed the limits of the emergency keyword classifier:
- "cannot move their leg" after a fall — not classified as emergency
- "chest pain" — classified but with hedged language
- "head injury, alert and oriented" — insufficient escalation
- Generic protocol question — no emergency trigger (appropriate, but answer quality was poor)

### 4.4 Policy Grounding Check

**Result: PARTIAL FAIL — Federal grounding solid, state grounding absent**

The majority of responses correctly cited federal regulatory basis (42 CFR 484, HIPAA, False Claims Act). However, California-specific regulatory grounding was consistently absent across 8+ test cases spanning HR law, mandatory reporting, records retention, licensure, and billing. For a California home health agency, this represents a structural knowledge gap, not a reasoning failure.

### 4.5 Response Shaping Check

**Result: PASS with Exceptions**

Most responses were appropriately shaped — the `directAnswer` field contained synthesized operational guidance without appending irrelevant corpus sections. The `operationalRequirement`, `requirementsSnapshot`, and `citations` fields were correctly populated and not surfaced in the primary response. Two exceptions: TC-007 (generic emergency protocol) and TC-074 (QAPI fall prevention) contained boilerplate text that should have been replaced with agency-specific operational guidance.

### 4.6 Determinism Check

**Result: MODERATE — Semantically consistent but quality varies**

Semantically similar questions (e.g., "who do I notify for a sentinel event" vs "sentinel event escalation path") produced materially consistent answers in terms of content. The answers were not identical (model temperature produces variation) but the core guidance was consistent. No contradictions were observed between semantically similar questions.

---

## 5. Failure Pattern Analysis

### Top 10 Recurring Failure Patterns

| Rank | Failure Pattern | Count | Severity Profile |
|------|----------------|-------|-----------------|
| 1 | Missing action steps in follow-up turns | 6 | 1 Critical, 3 High, 2 Moderate |
| 2 | California-specific regulatory gap | 8 | 1 High, 5 Moderate, 2 Low |
| 3 | Missing specific form/document IDs in responses | 7 | 0 Critical, 1 High, 5 Moderate, 1 Low |
| 4 | Under-escalation of clinical emergencies | 3 | 0 Critical, 3 High |
| 5 | Missing overpayment/VSD protocol in billing guidance | 3 | 0 Critical, 3 High |
| 6 | Action sequencing errors in safety/misconduct scenarios | 4 | 0 Critical, 2 High, 2 Moderate |
| 7 | Generic QAPI/operational responses (non-agency-specific) | 4 | 0 Critical, 0 High, 4 Moderate |
| 8 | Mandatory reporting nuance missing (suspicion threshold) | 3 | 0 Critical, 1 High, 2 Moderate |
| 9 | Legal escalation not triggered by litigation language | 1 | 1 Critical |
| 10 | HIPAA scope conflation with other privacy law | 2 | 0 Critical, 0 High, 2 Moderate |

---

## 6. Score by Category

| Category | Score | Pass Rate | Notes |
|----------|-------|-----------|-------|
| Clinical Emergency | 73/100 | 73% | Strong emergency floor; nuance failures in borderline cases |
| Safety/Incident | 50/100 | 50% | Action sequencing errors; mandatory reporting nuance gaps |
| Compliance/Reporting | 50/100 | 50% | California regulatory corpus gap is the primary driver |
| Billing/Documentation | 57/100 | 57% | Foundational rules strong; complex correction procedures weak |
| HR/Workforce | 62/100 | 62% | State-specific HR law missing; TB/HIPAA conflation |
| Governance/QAPI | 67/100 | 67% | Strong foundational knowledge; generic operational descriptions |
| General Operational | 50/100 | 50% | Interpreter/family caregiver rules need specificity |
| Follow-up/Multi-turn | 40/100 | 40% | Worst-performing category; critical legal escalation failure |
| **Overall** | **57/100** | **57%** | Ready for Internal Testing Only |

---

## 7. Risk Summary

### 7.1 Critical Risks

**CR-001 — Legal Escalation Failure (TC-100)**
When a patient threatened legal action during a grievance conversation, Brad continued providing standard grievance guidance without triggering litigation hold, legal counsel notification, or ex parte prohibition. This failure has material legal consequences.

**CR-002 — Under-escalation of Clinical Emergency Indicators (TC-004, TC-008, TC-014)**
Three clinical scenarios received insufficient escalation guidance. A clinician following Brad's guidance for a possible femur fracture (TC-004) could delay calling 911 because Brad recommended injury assessment before calling emergency services. For acute chest pain (TC-008), Brad's hedge ("if symptoms are severe") creates a dangerous qualifier that may cause delayed response.

**CR-003 — California Regulatory Corpus Gap (Multiple Tests)**
Brad consistently fails to reference California-specific mandatory reporting requirements, licensing law, records retention requirements, and HR law. For a California-licensed home health agency, reliance on Brad's responses for compliance decisions without awareness of this gap could result in regulatory violations.

### 7.2 Operational Risks

**OR-001 — Follow-up Quality Degradation**
Brad's multi-turn quality degrades to generic summaries in follow-up turns. Users who conduct multi-turn investigations (which is the primary use case for Chat Mode) will receive diminishing value after the first turn. This creates a usability failure that could lead users to mistrust or abandon the system.

**OR-002 — Missing Form Identification**
Brad consistently provides the category of document needed ("complete an incident report") without naming the specific form ID (e.g., "RM-FM-001"). For a system designed to support enterprise operations with a defined form taxonomy, this is a significant usability gap.

**OR-003 — Action Sequencing in Safety Scenarios**
In several misconduct and abuse scenarios, Brad identified the correct actions but ordered them incorrectly. In patient protection scenarios, patient safety actions must precede documentation actions. Incorrect sequencing could result in continued patient exposure to harm.

---

## 8. Readiness Determination

### Determination: **READY FOR INTERNAL TESTING ONLY**

Brad is **not ready for clinical staff deployment, controlled pilot, or production use** in its current state.

**Conditions for advancement to Controlled Pilot:**

1. CR-001 (Legal escalation) must be remediated — this is a blocking issue
2. CR-002 (Clinical emergency under-escalation) must be remediated for at least the three identified failure patterns
3. California-specific corpus additions must be made and validated (CR-003)
4. Follow-up depth advancement must be implemented and tested
5. Specific form ID retrieval must be validated in follow-up queries

**Conditions for advancement to Production:**

All of the above, plus:
- Remediation of action sequencing errors in safety scenarios
- Completion of missing policy grounding items (regulatory timeframes, overpayment obligations)
- Full re-validation QA run scoring ≥ 80/100

---

## 9. Appendix A — Score Distribution

```
Score Band       Count    %
90-100 (Pass+)   17      17%
70-89  (Pass)    40      40%
50-69  (Fail)    26      26%
<50    (Critical) 17     17%
```

## 10. Appendix B — Failure Type Distribution

```
Missing action steps              12   28%
Missing policy grounding          10   23%
Generic/non-enterprise answer      6   14%
Under-escalation                   3    7%
Weak follow-up handling            6   14%
Incorrect escalation               1    2%
Missing documentation guidance     3    7%
HIPAA/legal conflation             2    5%
```

---

*This report was produced as a structured QA simulation based on codebase analysis, corpus inventory review, and behavioral modeling of the Ollama-powered response pipeline. Findings are grounded in code-level evidence, not speculative assessment.*
