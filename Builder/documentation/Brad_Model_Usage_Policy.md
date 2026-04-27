# Brad iAdministrator — Model Usage Policy
## AI Model Strategy Validation · Guardrails · Enforceable Team Standard

**Document Version:** 1.0
**Date:** April 23, 2026
**Status:** Approved for Internal Use
**Owner:** Engineering Lead / Compliance Officer

---

## 1. Architecture Context — Two Distinct Model Layers

Before any model assignment can be validated, the system's two-layer model architecture must be clearly understood. These layers are **completely separate** and must never be conflated in policy, conversation, or implementation:

| Layer | Purpose | Model | Where in Code |
|-------|---------|-------|---------------|
| **Runtime Engine** | Generates compliance answers at request time | Ollama (local LLM, e.g., Mistral/Llama family) | `server/ia/responder.ts` → `ollama.chat()` |
| **Development Layer** | Team uses these to build, design, test, and maintain Brad | Claude Sonnet / Claude Opus / Gemini Premium | Cursor IDE, prompting, QA, design tooling |

**The runtime Ollama model is NOT interchangeable with any cloud model.** The corpus retrieval pipeline, JSON-mode enforcement, `temperature: 0.15` setting, and all structural guardrails in the system prompt are tuned for Ollama's output characteristics. Swapping the runtime model — even to a more capable cloud model — is an architectural change requiring full re-validation.

All guidance in this policy refers to the **development layer** unless explicitly stated otherwise.

---

## 2. Validated Model Allocation

The proposed allocation is **partially correct but requires corrections** in scope definition and missing prohibition rules.

### 2.1 Claude Sonnet — PRIMARY DEVELOPMENT MODEL ✓ Confirmed with Scope Refinements

**Approved for:**
- System prompt engineering (`server/ia/prompt.ts` — `SYSTEM_BASE`, `INTENT_DIRECTIVES`, `JSON_SCHEMA_BLOCK`, `buildChatSystemPrompt`)
- Compliance logic implementation — scenario classifier taxonomy, escalation rules, session envelope design
- QA simulation and test case generation
- Workflow data alignment — verifying that authored workflow content is consistent with policy corpus
- Code review for compliance-logic-adjacent code (responder, retrieval, session manager)
- Follow-up context envelope design (`server/ia/session/envelope.ts`)
- Documentation of compliance logic, remediation plans, test cases

**Scope refinement — Sonnet is ALSO approved for:**
- Corpus document authoring (policy text, form structure, regulatory summaries)
- Prompt testing and iteration cycles (run simulated prompts through Sonnet before deploying to Ollama)
- First-pass review of any new scenario classifier rules before Opus review

**Approved rationale:** Claude Sonnet provides the best combination of clinical compliance reasoning, instruction-following, and anti-hallucination behavior for development-time tasks. Its output is close enough in character to what the Ollama runtime should produce that prompt testing on Sonnet is a valid proxy before deploying to the local model.

---

### 2.2 Claude Opus — STRATEGIC AND CRITICAL REASONING MODEL ✓ Confirmed with Expanded Scope

**Approved for:**
- System architecture decisions with compliance implications (session state design, retrieval strategy, context envelope architecture)
- Complex multi-step compliance reasoning where Sonnet produces inconsistent output (edge cases in escalation logic, multi-regulation intersection)
- **Emergency and legal escalation template design** — the exact wording of `EMERGENCY — Call 911 immediately`, the litigation hold template, the abuse reporting action sequence. These templates are life-safety-critical and warrant Opus's superior instruction coherence.
- **Initial design of any new scenario category** in `scenarioClassifier.ts` (high-stakes scenarios must be Opus-designed, Sonnet-validated, human-reviewed before merge)
- Adversarial prompt red-teaming — using Opus to attempt to break Brad's guardrails and identify failure modes before QA simulation
- Final review of the system prompt before any version release

**Scope clarification:** Opus is intentionally **not** used for routine development tasks due to cost. The "limited use" constraint is correct and should be enforced through tooling (configure team Cursor settings to require explicit confirmation before Opus calls).

**Approved rationale:** Opus handles long, multi-constraint reasoning problems with higher coherence than Sonnet. For compliance logic where a single missed condition (e.g., "reasonable suspicion triggers mandatory reporting, not confirmed evidence") has legal consequences, Opus's higher-quality output justifies the cost premium.

---

### 2.3 Gemini Premium — UI/UX AND RENDERING LAYER ONLY ⚠️ Confirmed with Hard Boundary Enforcement

**Approved for:**
- Frontend component design and visual layout (React component structure, CSS, responsive design)
- Print/PDF rendering optimization (`PolicyViewerPrintDownloadDesignLight.html` and similar)
- Design system decisions (color palette, typography, spacing, component library choices)
- Static HTML report generation (org charts, policy viewer templates)
- UX flow design and prototype iteration
- Non-clinical copywriting (marketing text, help center text, onboarding UI text)

**Hard boundary — Gemini is PROHIBITED from:**
- Any input into system prompts (`prompt.ts`, `SYSTEM_BASE`, `JSON_SCHEMA_BLOCK`, `INTENT_DIRECTIVES`)
- Any input into scenario classifier rules or escalation logic
- Any input into corpus policy documents or regulatory text
- Any input into session management or context envelope design
- Any review, editing, or generation of clinical safety guidance or compliance answers
- Any role in QA simulation, test case generation, or compliance outcome evaluation
- Any role in defining what Brad should or should not say

**The Gemini boundary is the single most important rule in this policy.** See Section 4 for risk details.

---

## 3. Risk Analysis — Gemini in Compliance-Adjacent Roles

The following risks are **not theoretical** — they are grounded in documented characteristics of large language models optimized for general-purpose and creative tasks.

### RISK-001: Regulatory Citation Hallucination — CRITICAL
**Description:** Gemini Premium produces confident, well-formatted regulatory citations that may be structurally correct but factually wrong. In compliance contexts, a hallucinated CFR section (e.g., "42 CFR 484.110" vs. the correct "42 CFR 484.105") cited authoritatively in a Brad answer creates an audit defense liability. The downstream consumer (a clinician or administrator) cannot be expected to verify every citation — they will rely on Brad's authority.

**Specific risk:** If Gemini is used to draft a corpus document, a system prompt addendum, or a compliance response template, its hallucinated citations will be ingested into the retrieval index and will resurface in future Brad answers — laundering the hallucination through the corpus.

**Severity:** Critical. Once a hallucinated citation enters the corpus, it propagates forward into all answers that retrieve that passage.

---

### RISK-002: Inconsistent Escalation Behavior — HIGH
**Description:** Gemini's safety alignment is optimized for general-purpose helpfulness, not clinical escalation fidelity. When Gemini generates language that touches compliance logic (e.g., "this may require 911 if conditions warrant"), its hedging patterns differ from Claude's. If any Gemini output enters Brad's system prompt or scenario classifier, it will introduce conditional language that conflicts with the surveyor posture ("assume non-compliance, assume emergency").

**Specific risk:** The system prompt explicitly prohibits hedging phrases ("might", "perhaps", "possibly", "generally"). Gemini's natural tone is advisory and hedged. Any Gemini text introduced into Brad's instruction layer would directly undermine the anti-hedging rule.

**Severity:** High. Hedge-contaminated emergency instructions are a patient safety risk.

---

### RISK-003: Determinism Loss in Multi-Turn Compliance Chains — HIGH
**Description:** The Brad session envelope is designed so that session state (urgency, mode, life-safety flag) is preserved deterministically across turns. If Gemini is used to generate or revise any session management logic, its output may introduce probabilistic branching ("if the user seems concerned") rather than deterministic state transitions ("if lifeSafetyFlag === true, enforce EMERGENCY lead").

**Specific risk:** Session managers with probabilistic language conditions produce inconsistent emergency escalation behavior — critical cases may not escalate consistently across different sessions or conversation lengths.

**Severity:** High. Inconsistent emergency escalation is a patient safety risk.

---

### RISK-004: Corpus Contamination via UI-Adjacent Content — MODERATE
**Description:** The boundary between "UI text" and "compliance content" is not always obvious. Help center text, onboarding instructions, and "how to use Brad" guidance may contain incidental compliance statements. If Gemini writes these, the statements may contradict or undermine the corpus's authoritative content.

**Specific risk:** A Gemini-written help tooltip that says "Brad can help you decide if something is an emergency" overpromises Brad's capabilities and creates a liability if a user defers a 911 call based on that UI text.

**Severity:** Moderate. Requires careful review of any UI text that touches clinical or compliance concepts.

---

### RISK-005: Model Blending in Iterative Editing — MODERATE
**Description:** In an iterative development workflow, a developer may start a prompt in Claude Sonnet, ask Gemini to "clean up the language," then finalize in Opus. Each model has different implicit priors about appropriate clinical language. Mixing model outputs in a single artifact produces internal inconsistencies that no individual model review will catch.

**Specific risk:** A system prompt section that has been through multiple model hands will have inconsistent instruction strength — some rules will be firm, others will have been softened by a model that "thought" the instruction was too strong.

**Severity:** Moderate. Enforced through the single-model-per-artifact rule in Section 5.

---

## 4. Guardrails for Compliance Safety and Determinism

These guardrails address the four core risks: creative hallucination, inconsistent escalation, multi-turn determinism loss, and model contamination.

### GUARDRAIL-001: Runtime Temperature Lock
**Rule:** The Ollama runtime MUST be called with `temperature: 0.15` and `format: 'json'`. These values must not be parameterized, environment-variable-driven, or overridable at request time.

**Current status:** Already implemented in `server/ia/responder.ts` line 120. This line must be treated as a protected constant — any PR that modifies this value requires explicit approval from the Engineering Lead and a justification in the PR description.

**Rationale:** Temperature above 0.2 measurably increases JSON schema drift and hallucinated citations in local models. `format: 'json'` enforces Ollama's constrained decoding, which is the primary technical defense against free-text leakage into the compliance response.

---

### GUARDRAIL-002: System Prompt Version Control
**Rule:** The system prompt (`SYSTEM_BASE` in `prompt.ts`) is a regulated artifact. Every change to `SYSTEM_BASE`, `JSON_SCHEMA_BLOCK`, `INTENT_DIRECTIVES`, or `buildChatSystemPrompt` must:
1. Be made in a named branch (not directly to main)
2. Be reviewed by at least one team member with compliance knowledge before merge
3. Include a regression test against the 10 most critical test cases from `Brad_QA_100_Test_Cases.csv` (specifically: TC-001, TC-004, TC-008, TC-017, TC-028, TC-042, TC-056, TC-069, TC-091, TC-100)
4. Be tagged in git with `prompt-v{N}` on merge

**Rationale:** The system prompt is the single artifact with the highest leverage over Brad's compliance behavior. An unreviewed change that softens the anti-hedging rule or removes the emergency lead instruction would degrade safety across all sessions without any code-level indication.

---

### GUARDRAIL-003: Corpus Document Authoring Standard
**Rule:** All documents ingested into the Brad corpus (Builder/Forns/*.txt, Builder/Policies/*, Builder/Policies/Workflows/*) must:
1. Be authored or reviewed by a human compliance reviewer before indexing
2. Be authored using Claude Sonnet or Opus — never Gemini or other models
3. Include accurate regulatory citations that have been verified against source documents
4. Pass the `VALID_DOC_ID` pattern check (`/^[A-Z]{2}-[A-Z]{1,3}-\d{3,4}$/`) if they carry a document ID
5. Not contain hedging language that would contaminate retrieval passages

**Rationale:** The retrieval engine takes corpus passages verbatim and injects them into the LLM prompt as authoritative sources. A single hallucinated citation in a corpus document will propagate into every answer that retrieves that passage. Corpus documents are higher-stakes than code — they directly shape clinical guidance.

---

### GUARDRAIL-004: Emergency Template Protection
**Rule:** The following specific artifacts are designated as **protected emergency content** and require both Engineering Lead and a clinical or compliance reviewer sign-off before any change:
- The `EMERGENCY_LEAD` constant in `server/ia/service.ts`
- The `EMERGENCY_DIRECTIVE` block in `server/ia/prompt.ts`
- Any scenario category in `server/ia/scenarioClassifier.ts` with `riskLevel: 'critical'`
- The life-safety keyword detection logic in `server/ia/session/manager.ts`

**Prohibition:** No solo developer may modify these artifacts in a single PR. All changes require at least two reviewers, one of whom must have clinical or compliance authority.

**Rationale:** These are the artifacts that determine when Brad says "Call 911 immediately." A well-intentioned refactor that removes the hard-coded emergency lead, or a developer who "cleans up" the emergency directive language, could silently degrade life-safety behavior.

---

### GUARDRAIL-005: Follow-up Depth Consistency Rule
**Rule:** The session context envelope (`server/ia/session/envelope.ts`) must always produce a deterministic output given the same session state inputs. The envelope must not contain probabilistic conditionals or model-generated summaries. It is a state compiler, not a reasoning component.

**Implementation requirement:** Any new field added to `SessionState` that affects the compiled envelope must be typed as a discrete enum (not a free-text string) so that the envelope's behavior is predictable across all possible input states.

**Rationale:** Multi-turn determinism depends on the session state being a finite state machine, not a probabilistic summarizer. If the envelope starts generating narrative summaries of the conversation, those summaries will vary across sessions with the same logical state, breaking the determinism guarantee.

---

### GUARDRAIL-006: Scenario Classifier Immutability Rule
**Rule:** The scenario classifier (`server/ia/scenarioClassifier.ts`) must define all scenarios as static, authored objects — never dynamically generated or model-inferred at runtime. New scenarios must be added by a developer (not generated by a model during a request) and must include:
- `category` (unique identifier)
- `riskLevel` (strictly typed)
- `isHighStakes` flag (boolean — explicit)
- `headline` (reviewed by compliance reviewer)
- `complianceNotes` (regulatory basis)

**Prohibition:** The scenario classifier must never make an API call or use a model to classify inputs at runtime. Classification must be rule-based (keyword + pattern matching) only, to guarantee deterministic escalation behavior.

**Rationale:** A model-based runtime classifier for high-stakes scenarios would be non-deterministic by definition. The same query could escalate on one request and not on another — creating inconsistent life-safety behavior that is undetectable in testing.

---

### GUARDRAIL-007: Model Identity Audit Logging
**Rule:** Every compliance response generated by Brad must log the `modelName` returned by the Ollama API (already captured in `responder.ts` line 123) and include it in the `meta` field of `StructuredResponse`. When the runtime model changes (model upgrade, swap), the change must be reflected in a logged `model-version` tag and trigger a mandatory regression test run.

**Implementation:** The `meta.model` field is already populated. Add a server-side validation: if `modelName` does not match the configured expected model (`EXPECTED_OLLAMA_MODEL` env var), log a warning and mark the response with `meta.modelMismatch: true`. This ensures any accidental model swap is immediately visible in logs.

**Rationale:** Without model identity logging, a model swap (intentional or accidental) produces no observable signal in the application layer. An operator might not realize Brad has been running on a different model for weeks.

---

## 5. Final Model Usage Policy — Enforceable Team Standard

---

### BRAD IADMINISTRATOR — AI MODEL USAGE POLICY
**Version 1.0 | Effective Date: April 23, 2026**

---

#### 5.1 Scope

This policy governs the use of all AI models in the design, development, testing, maintenance, and deployment of the Brad iAdministrator system. It applies to all team members, contractors, and AI-assisted tools used in the development workflow.

---

#### 5.2 Model Registry

The following models are approved for use in the Brad system. **No other model may be used without explicit written approval from the Engineering Lead and Compliance Officer.**

| Model | Status | Approved Uses | Prohibited Uses |
|-------|--------|--------------|-----------------|
| **Ollama (local LLM)** | RUNTIME ONLY | Compliance answer generation at request time | Any use outside the server runtime pipeline |
| **Claude Sonnet** | PRIMARY DEV | Prompt engineering, corpus authoring, QA, code, documentation | Any runtime compliance answer generation |
| **Claude Opus** | STRATEGIC | Architecture decisions, critical compliance templates, emergency/legal escalation design, adversarial testing | Routine development tasks (cost control) |
| **Gemini Premium** | UI ONLY | Visual design, print rendering, layout, non-clinical UI copy | ANY compliance-adjacent task (see 5.4) |

---

#### 5.3 Task-to-Model Assignment Matrix

| Task | Permitted Model(s) | Minimum Review |
|------|--------------------|----------------|
| System prompt authoring | Sonnet → Opus review | Compliance reviewer sign-off |
| Emergency escalation templates | Opus only | Engineering Lead + Clinical reviewer |
| Legal escalation rules | Opus only | Engineering Lead + Compliance Officer |
| Scenario classifier additions | Opus design + Sonnet validation | Two reviewers |
| Corpus document creation | Sonnet or Opus | Human compliance reviewer |
| Retrieval + session logic | Sonnet | Engineering Lead code review |
| React UI components | Gemini or Sonnet | Standard code review |
| Print/PDF rendering | Gemini | Standard code review |
| Help center / onboarding text | Sonnet (Gemini if zero compliance content) | Compliance terminology check |
| QA simulation and test cases | Sonnet or Opus | Self-reviewed |
| Adversarial prompt testing | Opus | Document findings |
| Architecture decisions | Opus | Engineering Lead |
| Performance / non-compliance code | Any approved model | Standard code review |

---

#### 5.4 Hard Prohibitions

The following uses are **absolutely prohibited**, regardless of context, urgency, or individual judgment:

**P-001:** Gemini (or any model not in the approved registry) must NEVER be used to:
- Write, edit, review, or generate any text that will appear in `prompt.ts`, `responder.ts`, `scenarioClassifier.ts`, `service.ts`, or any session management file
- Author or edit any document in `Builder/Forns/`, `Builder/Policies/`, or `Builder/Policies/Workflows/`
- Generate clinical guidance, escalation instructions, emergency protocols, or regulatory summaries
- Review or validate compliance logic output

**P-002:** No model — including Claude — may generate runtime compliance answers outside the Ollama pipeline. Cloud model APIs (Anthropic API, Google API, OpenAI API) must NEVER be called from within the Brad server to serve user compliance queries. All runtime responses must go through the local Ollama model.

**P-003:** No developer may modify `temperature` or `format` parameters in the Ollama call without a two-reviewer PR approval and a logged justification.

**P-004:** No AI model output may be committed to the corpus (indexed as a policy, form, or workflow document) without human review by a team member with compliance knowledge. "AI-generated content" in the corpus is not inherently prohibited, but it must be reviewed before indexing — not after.

**P-005:** No model output — from any model — may be used to directly generate the `directAnswer` content that Brad returns to users, except through the designated Ollama runtime pipeline. Developers must not hardcode model-generated text into `scenarioClassifier.ts` headlines or scenario summaries without compliance review.

---

#### 5.5 Single-Model-Per-Artifact Rule

Each compliance-critical artifact must be associated with a single model in its creation/review history. Iteratively editing a system prompt section across multiple models (Sonnet → Gemini cleanup → Opus polish) is prohibited. This prevents tone and instruction-strength inconsistency.

**Enforcement:** PR descriptions for changes to compliance-critical files must include a "Model Used" field. Example:
```
Files Changed: server/ia/prompt.ts
Model Used: Claude Sonnet (Cursor Composer)
Review Required: Compliance reviewer
```

---

#### 5.6 Approval Gates

The following changes require explicit approval before merging to main:

| Change Type | Required Approvers | Blocking? |
|-------------|-------------------|-----------|
| `SYSTEM_BASE` modification | Engineering Lead + Compliance Reviewer | Yes |
| Emergency escalation content | Engineering Lead + Clinical Reviewer | Yes |
| Legal escalation content | Engineering Lead + Compliance Officer | Yes |
| New scenario classifier entry (high-stakes) | Two reviewers | Yes |
| Corpus document addition | Compliance Reviewer | Yes |
| `temperature` or `format` parameter change | Engineering Lead (written justification) | Yes |
| New model added to approved registry | Engineering Lead + Compliance Officer | Yes |
| Runtime model change (Ollama model swap) | Engineering Lead + full regression test | Yes |

---

#### 5.7 Incident Response — Model Policy Violation

If a prohibited model use is discovered (e.g., Gemini-generated text in the corpus, cloud API call in the server):

1. **Immediate:** Remove the affected content from the active codebase
2. **Within 24 hours:** Assess whether any user was served a response influenced by the violation
3. **Within 48 hours:** Document the violation, root cause, and corrective action
4. **Ongoing:** Add the violation pattern to the team onboarding checklist to prevent recurrence

---

#### 5.8 Rationale Summary

The architecture of Brad as a **local, corpus-grounded, deterministic compliance engine** requires model discipline that general-purpose AI development workflows do not. The core risks are:

1. **Hallucinated regulatory citations** propagating into the corpus and surfacing as authoritative guidance
2. **Hedged language** in emergency protocols creating ambiguity in life-safety decisions
3. **Non-deterministic escalation** from probabilistic classification logic
4. **Model identity loss** when an untracked model swap changes behavior invisibly

These risks are not mitigated by model capability alone — they require architectural boundaries, artifact ownership rules, and human review gates enforced through process, not trust.

---

#### 5.9 Policy Maintenance

This policy must be reviewed:
- After any change to the approved model registry
- After any compliance incident involving AI-generated content
- After any Ollama model upgrade or swap
- Annually, regardless of change activity

**Policy Owner:** Engineering Lead
**Compliance Co-Owner:** Compliance Officer
**Next Review Date:** October 23, 2026

---

*End of Brad iAdministrator Model Usage Policy v1.0*
