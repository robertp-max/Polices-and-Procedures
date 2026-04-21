# iAdministrator — Operator Mode Guide
## How to Trust the System: A Field Manual for Administrators, Compliance Officers, and Surveyors

**Version:** 2.0  
**Date:** April 2026  
**Classification:** Internal — Tier 2 Restricted  
**Audience:** Agency Administrators · Compliance Officers · QAPI Coordinators · Governing Body Members

---

## Preface

This guide answers the question administrators and auditors actually ask:

> **"How do I know when to trust what this system says?"**

iAdministrator is not an AI assistant. It is a **compliance decision engine** backed by the agency's own governed corpus — policies, procedures, forms, and appendices. Every answer it produces is traceable to a specific policy section. It cannot answer from general knowledge. When the corpus doesn't support an answer, it says so explicitly.

This guide teaches you to read the system's output the way a surveyor reads a Plan of Correction — looking for evidence, not interpretation.

---

## Part 1: Reading the System Confidence Score

Every response displays a **System Confidence Score (0–100%)** derived from three signals:

| Signal | Contribution | What It Means |
|---|---|---|
| Retrieval quality | Up to 40 pts | How closely the retrieved corpus passages match the query |
| Citation count | Up to 25 pts | How many specific policy sections were cited |
| Governing policy present | 20 pts | Whether a specific authoritative policy ID was identified |
| Embeddings active | 10 pts | Whether semantic search was used (vs. keyword-only) |

### Score Interpretation Table

| Score | What It Means | What to Do |
|---|---|---|
| **85–100%** | High-quality match. The corpus directly addresses this topic with specific citations. Trust and act. | Act on the answer. Open the governing policy to confirm. |
| **60–84%** | Good match. The answer is grounded but may lack a specific governing policy or have fewer direct citations. | Use as a starting point. Verify citations by opening the referenced policies. |
| **35–59%** | Moderate match. The corpus has related content but may not directly answer the specific question. | Use cautiously. Consider rephrasing the query with a specific policy ID. |
| **0–34%** | Weak match. The corpus may not cover this topic well, or the query is too broad. | Rephrase with a specific ID or narrow to a domain. Do not act without manual verification. |
| **0% (No Answer Found)** | The corpus explicitly does not support this answer. | Do not rely on this output. The closest references shown are for navigation only. |

---

## Part 2: Understanding the Governing Policy ID

The **Governing Policy ID** badge (⚖ XX-XX-NNN) identifies the single policy that establishes the primary authority for an answer. When present:

- The `directAnswer` opens with **"Per [ID], ..."** or **"Under [ID], ..."**
- Clicking the badge opens the governing policy in the right-panel workspace
- Every claim in the answer traces back to this policy's sections

### When There Is No Governing Policy ID

Absence of a governing policy ID means:
1. The answer was assembled from multiple policy sections with no single primary authority
2. The query matched a broad topic area rather than a specific policy
3. Confidence may be lower — verify the citation chips manually

**What to do:** Click individual citation chips to navigate directly to the source sections.

---

## Part 3: Reading the Enforcement Level

The **Enforcement Level** badge indicates the CMS regulatory tier:

| Badge | Level | What It Means | Typical Consequence |
|---|---|---|---|
| **Condition-Level Risk** | `condition_level` | The gap relates to a Condition of Participation (CoP) | Survey deficiency, Plan of Correction required, potential immediate jeopardy |
| **Standard-Level Risk** | `standard_level` | The gap relates to a standard (non-CoP) requirement | Citation on Form CMS-2567, corrective action plan |
| *(no badge)* | `none` | No regulatory enforcement flag identified | Administrative or internal compliance matter |

### When to Escalate Condition-Level Risk

Any response showing **Condition-Level Risk** with a risk level of `high` or `critical` should:

1. Be reviewed by the Administrator and Compliance Officer immediately
2. Result in a documented corrective action plan (use the "Generate action plan" button)
3. Be presented at the next Governing Body meeting
4. Be logged in the QAPI tracking system

---

## Part 4: Risk Level Decision Matrix

| Risk Level | Color | Meaning | Required Action |
|---|---|---|---|
| `critical` | Red | Immediate regulatory deficiency — potential survey finding today | Stop. Escalate. Correct immediately. |
| `high` | Orange | Survey exposure — likely finding if not addressed before next survey | Address within 30 days. Document in QAPI. |
| `moderate` | Yellow | Documented gap — not survey-critical today but requires attention | Address within 60–90 days. Track in action plan. |
| `low` | Blue | Minor gap — compliant with room for improvement | Schedule for next policy review cycle. |
| `none` | Green | Fully compliant per corpus evidence | No immediate action required. |

### Risk Level Auto-Elevation Rules

The system automatically elevates risk levels when retrieved policies carry CoP-level regulatory tags:

- **42 CFR 484** (Home Health CoP) → elevates to at least `moderate`
- **42 CFR 484.105** (Governing Body CoP) → elevates to `high`
- **HIPAA** → elevates to at least `moderate`
- **False Claims Act** → elevates to `high`

If you see a higher risk level than expected, check the citations — the corpus passage likely cites a federal regulatory basis.

---

## Part 5: What Surveyors Look For

Every compliance answer now includes a **"What Surveyors Look For"** section listing 2–4 specific inspection points. These are derived directly from the corpus (audit sections, compliance indicators, and CoP-aligned requirements).

### How to Use This Section

Before a CMS survey:
1. Print or export the relevant pre-survey audit
2. Use the "What Surveyors Look For" items as your **pre-survey document checklist**
3. Cross-reference each item against your documentation
4. Any item you cannot confirm with a physical document = survey risk

Example output for billing compliance:
```
• Evidence of physician certification on file
• Review of signed Plan of Care with valid certification period
• Confirmation of face-to-face encounter documentation
• Training records for billing personnel (initial + annual)
```

**If you cannot produce evidence for any of these items, the gap is real.**

---

## Part 6: Common Failure Points

The **Common Failure Points** section surfaces documented failure patterns from the corpus — the specific gaps that cause deficiency citations, claim denials, or CoP violations.

These are NOT generic observations. They come from audit procedures, compliance checklists, and regulatory guidance embedded in the agency's own policies.

### How to Read Common Failure Points

Each item starts with a specific failure verb:
- **Missing** — a required document or record does not exist
- **Unsigned** — a document exists but lacks required signature/authorization
- **Inconsistent** — documentation exists but doesn't match another required record
- **Undocumented** — a process occurred but was not recorded
- **Expired** — a certification, credential, or agreement is no longer current
- **Templated** — documentation exists but is not individualized to the patient

**If any failure point describes your current situation, treat it as a confirmed gap** and generate an action plan immediately.

---

## Part 7: When to Question the System's Output

### Red Flags — Verify Before Acting

| Signal | What to Do |
|---|---|
| `noAnswerFound: true` | The corpus does not cover this topic. Do not act. Navigate manually using the linked references. |
| Confidence score < 45% | Retrieval is weak. Rephrase the query with a specific policy ID. |
| `directAnswer` says "various policies" or is vague | The system retrieved general content. Click citations to navigate to specific sections. |
| No governing policy ID badge | The answer has no single authority. Cross-check multiple citation chips. |
| Risk level is `none` for a clinical query | Verify manually — this may mean the corpus doesn't have strong evidence, not that there's no risk. |
| Survey focus section is empty | The passages retrieved don't contain audit content. Try a more specific query. |

### Green Flags — High-Trust Output

| Signal | Meaning |
|---|---|
| Confidence score ≥ 75% | Strong corpus match |
| Governing policy ID badge present | Answer is anchored to a specific authority |
| `directAnswer` opens with "Per [ID], ..." | Policy-first response |
| 3+ citations | Multiple corpus sections corroborate the answer |
| Survey Focus has 3–4 items | Audit-quality output |
| Common Failure Points match known agency gaps | Corpus is aligned with your reality |

---

## Part 8: How to Validate Citations

Citations are the most important output — they connect the answer to the actual policy text. Here's how to validate them:

### Step-by-Step Citation Validation

1. **Locate the citation chip** in the CitationChips section (e.g., `[FN-BC-001 · 6.1.2]`)
2. **Click the chip** → the right panel opens to that policy at that section
3. **Read the section text** in the right panel
4. **Confirm the excerpt** matches what the chip shows
5. **Check the section title** — does it match the topic of your query?

### What a Strong Citation Looks Like

```
[FN-BC-001 · 6.1.2 Pre-Billing Verification]
"The pre-billing verification shall confirm all of the following: 
physician certification on file, signed Plan of Care with valid 
certification period..."
```

- Specific section number (6.1.2)
- Section title matches the query topic
- Excerpt is a direct quote from the policy
- Policy ID follows XX-XX-NNN format

### What a Weak Citation Looks Like

```
[CO-CP-001 · General Provisions]
"All staff must comply with applicable regulations."
```

- Generic section title
- Vague excerpt that doesn't directly support the answer
- If this is the primary citation, treat the response with caution

---

## Part 9: When the Corpus Does Not Support an Answer

When `noAnswerFound: true` is displayed:

```
╔═════════════════════════════════════════════════════╗
║  No Answer Found                                     ║
║                                                      ║
║  The internal corpus does not support an answer     ║
║  to this command.                                   ║
║                                                      ║
║  Try citing a specific policy or form ID...         ║
╚═════════════════════════════════════════════════════╝
```

**This does NOT mean the topic is unimportant.** It means:
- The agency corpus doesn't have a policy covering this specific topic, OR
- The query needs to be more specific, OR
- A new policy needs to be created and added to the corpus

### What to Do

1. **Check the reference cards** below the no-answer message — these are the closest corpus matches retrieved
2. **Use the linked references** to navigate to related policies
3. **Issue a specific query** referencing an ID you know exists: `Open GV-GB-001`
4. **If the gap is real**: escalate to the Compliance Officer for policy development

### How to Escalate a Corpus Gap

If iAdministrator cannot answer a question that your agency SHOULD have a policy for:

1. Document the unanswered query
2. Escalate to the Compliance Officer or Policy Steward
3. Request a new policy be drafted and added to the corpus
4. Rebuild the index after the policy is added: `npm run ia:index`

---

## Part 10: Generating Outputs for the Governing Body

For Governing Body meetings, use these two commands:

**Executive Brief:**
```
Generate governing body brief for [topic]
```

**Pre-Survey Readiness:**
```
Run pre-survey audit
```

### What Counts as Governing Body-Ready Output

A response is ready to present to the Governing Body when:
- Confidence score ≥ 70%
- Governing policy ID is present
- At least one citation from the GV domain
- Risk level is clearly stated
- Required artifacts are identified
- Survey Focus is populated

### Generating a Governing Body Action Item

From any response, click **"Generate governing body brief"** in the Available Actions strip. This re-runs the same query with the `governing_body_brief` intent, which:
- Reframes the answer as an executive summary
- Emphasizes fiduciary and oversight implications
- Lists required approvals and documentation
- Is suitable for board minutes

---

## Part 11: Pre-Survey Protocol

Use this protocol before every CMS survey:

### Step 1: Run the Pre-Survey Audit

```
Run pre-survey audit
```

Review:
- `riskLevel` (target: none or low)
- `requirementsSnapshot` items with `status: warning`
- `surveyFocus` items (these are your documentation checklist)
- `commonFailurePoints` (these are your known vulnerabilities)

### Step 2: Resolve Each Warning Item

For each `status: warning` item in the Requirements Snapshot:
1. Click the source policy ID to verify what's required
2. Locate the physical documentation
3. If missing → generate an action plan for that specific item
4. Document remediation in QAPI

### Step 3: Verify All Required Artifacts

For each ID in `requiredArtifacts`:
1. Click the ID chip to preview the form/policy
2. Confirm a current, signed, completed version exists in the clinical record or administrative files
3. If any form is missing or expired → flag immediately

### Step 4: Generate Domain-Specific Audits

After the general audit, run domain-specific commands:

```
Run pre-survey audit for clinical operations
Run pre-survey audit for governing body requirements  
Run pre-survey audit for billing compliance
Run pre-survey audit for QAPI requirements
```

### Step 5: Archive Survey Readiness Evidence

Use the **Print Form** or **Download PDF** actions (coming in Phase 2) to archive your pre-survey documentation.

---

## Part 12: QAPI Integration

iAdministrator integrates directly with QAPI oversight through the QAPI Digest studio mode.

### Generating a QAPI Digest

```
Generate QAPI digest
```

or for specific topics:

```
Generate QAPI digest for infection control
Generate QAPI quality digest for clinical operations
QAPI report for plan of care documentation
```

The QAPI Digest returns:
- Quality issue summary
- Oversight implications for the QAPI committee
- Required forms and records
- Performance indicators from the corpus

### QAPI Committee Use

Present the QAPI Digest output directly at committee meetings:
- `directAnswer` = meeting agenda item summary
- `requirementsSnapshot` = the PI tracking checklist
- `linkedReferences` = policies and forms to review
- `availableActions` = follow-up steps to assign

---

## Part 13: Action Plan Workflow

When a gap is identified, generate a structured action plan:

```
Create corrective action plan for [identified gap]
```

or from any response, click **"Generate action plan"** in the Available Actions strip.

### Reading the Action Plan

| Section | Use For |
|---|---|
| `directAnswer` | Executive summary for the Administrator |
| `requirementsSnapshot` | Ordered action items with deadlines |
| `requiredArtifacts` | Forms and policies to pull/complete |
| `surveyFocus` | Success criteria — what completed looks like |
| `commonFailurePoints` | Pitfalls to avoid during remediation |

### Assigning Action Plan Items

For each `status: required` item in the Requirements Snapshot:
1. Assign to a responsible staff member
2. Set a deadline based on risk level (critical → 24h, high → 7 days, moderate → 30 days)
3. Track completion in QAPI
4. Re-run the query after remediation to confirm the answer improves

---

## Part 14: Building Operator Confidence Over Time

### How to Test the System Against Known Facts

Before relying on iAdministrator for critical decisions, run these known-answer queries and verify them against your physical policies:

```
What is the governing body meeting frequency requirement?
→ Expected: Reference to governing body policy with specific frequency

What forms are required at start of care?
→ Expected: OASIS forms, Plan of Care, CL domain forms

What is required before billing a Medicare claim?
→ Expected: FN-BC-001, physician certification, signed 485, face-to-face

What is the employee orientation requirement?
→ Expected: HR domain policies, specific day requirements
```

If the system returns accurate, policy-anchored answers to these queries, it is operating correctly for your corpus.

### Monthly Operator Verification Checklist

- [ ] Run `npm run ia:health` and confirm index is ready + Ollama is reachable
- [ ] Run "What is required before billing?" and verify FN-BC-001 is cited
- [ ] Run "Run pre-survey audit" and review for new warnings
- [ ] Run "Generate governing body brief" and confirm GV domain policies appear
- [ ] Rebuild index if any corpus policies were updated this month

---

## Part 15: Understanding System Limitations

### What iAdministrator Cannot Do

| Limitation | Workaround |
|---|---|
| Cannot access policies not in the corpus | Add the policy to `Builder/` and rebuild the index |
| Cannot browse the internet or external databases | This is by design — local-only MVP |
| Cannot access patient records or EHR data | Clinical data is never in the corpus |
| Cannot guarantee hospice/DME/other line-of-business answers | The corpus covers home health only |
| Response time is 10–20 seconds | The right panel loads within 1–2 seconds; the full answer follows |
| Cannot produce forms for signature | Form preview is in the right panel; print/export is coming in Phase 2 |

### What the System Will Never Do

- **Hallucinate a policy ID** that doesn't exist in the corpus
- **Name a document** in linkedReferences that hasn't been indexed
- **Cite a passage** that wasn't retrieved and supplied to the model
- **Answer without saying so** when the corpus doesn't support the answer
- **Call outside services** — all inference is local

---

## Part 16: Escalation Paths

| Situation | Escalate To | Within |
|---|---|---|
| `critical` risk level response | Administrator + Compliance Officer | Immediately |
| `condition_level` enforcement flag | Administrator | Same business day |
| `noAnswerFound` on a critical compliance topic | Compliance Officer for policy development | 72 hours |
| System confidence < 35% on a required query | IT or system administrator to rebuild index | Before next use |
| Governing body brief shows unresolved `high` risk | Governing Body Chairperson | Next scheduled meeting |
| QAPI digest shows new quality indicator | QAPI Coordinator | Before next committee meeting |

---

## Quick Reference Card

### Trust This Output When...
```
✓ Confidence score ≥ 75%
✓ Governing policy ID badge is present (⚖ XX-XX-NNN)
✓ directAnswer opens with "Per [ID], ..." or "Under [ID], ..."
✓ 3+ citations from the relevant domain
✓ Survey Focus section has 3–4 specific items
✓ Common Failure Points match known agency vulnerabilities
✓ All citation IDs follow XX-XX-NNN format
```

### Question This Output When...
```
? Confidence score < 45%
? No governing policy ID badge
? directAnswer is vague or says "various policies"
? Citations are from an unrelated domain
? Survey Focus is empty
? Risk is "none" for a clinical or billing query
```

### Do Not Act On This Output When...
```
✗ noAnswerFound = true
✗ Confidence score = 0%
✗ No citations at all
✗ directAnswer hedges ("might be", "possibly", "generally")
```

---

---

## Part 14: Operational Compliance Monitoring — Phase 1/2/3

Brad has been upgraded from a pure policy intelligence engine into an **operational compliance monitoring platform**. Every response now includes structured intelligence from four layers:

---

### The Four Intelligence Layers

| Layer | Source | Phase | What It Shows |
|---|---|---|---|
| **Internal Corpus** | Governed policy/form library | Live (always) | What policy requires |
| **Operational App State** | Tasks, forms, events, approvals | Phase 1 (seed) | What is actually happening |
| **Regulatory Updates** | CMS, OIG, HHS external feed | Phase 2 (seed) | What is changing externally |
| **EHR-Derived Assessment** | EHR structured read endpoints | Phase 3 (pending) | Clinical compliance state |

---

### Phase 1 — Operational Assessment (Active)

Phase 1 is active. Brad detects and reports:

**Compliance Gaps (Operational)**
- Overdue tasks (e.g., OIG screening, competency validation)
- Unsigned forms (e.g., physician plan of care orders)
- Incomplete assessments (e.g., OASIS-E missing fields)
- Pending approvals blocking workflows
- Missing required artifacts
- Overdue events (e.g., governing body meeting not scheduled)

**Policy Lifecycle Gaps**
- Policies in draft (not yet finalized)
- Policies pending Governing Body approval
- Policies with overdue review cycles
- Approved policies not yet published
- Policies awaiting staff acknowledgment
- Policies with missing linked forms/appendices

**How to read gap cards:**
```
[CRITICAL] overdue_task — OIG Exclusion Screening
Owner: HR Director · Policy: HR-WM-001 · 21 days overdue
Compliance Impact: Employing excluded individual = False Claims Act liability
Next Action: Complete OIG/SAM screening for 3 flagged staff immediately
```

**Data Source:** Phase 1 uses curated seed data representing a realistic agency compliance snapshot as of April 2026. In production, this is replaced by live app adapter integrations.

---

### Phase 2 — Regulatory Update Awareness (Active)

Phase 2 is active with a curated CMS/OIG regulatory feed. Brad identifies:

- CMS Final Rules affecting billing, CoP, or documentation requirements
- OIG Work Plan priorities that create audit exposure
- HIPAA Security Rule updates with IT/data governance impact
- Emergency Preparedness CoP compliance guidance updates
- DOJ False Claims Act enforcement patterns in home health billing

**How to read regulatory alert cards:**
```
[HIGH] CMS Home Health Final Rule CY 2026
Source: CMS | Topic: Payment / CoP Updates | Status: Under Review
Impacts: FN-BC-001, CL-CA-001, QA-QM-001
Action: Finance Director to update billing policy before May 1
```

**Important:** Regulatory alerts are matched against the retrieved policies for your specific query. A general compliance query may surface fewer alerts than a billing-specific query.

**Data Source:** Phase 2 uses a curated seed feed of representative CMS/OIG updates. In production, this is replaced by automated ingestion of structured CMS transmittals and Final Rules.

---

### Phase 3 — EHR-Derived Assessment (Pending Integration)

Phase 3 will provide clinical compliance intelligence derived from structured EHR data:

- Unsigned physician orders
- Missing required documentation
- Overdue OASIS assessments
- Plan-of-care mismatches (services delivered outside authorized plan)
- Episode artifacts missing before claim submission

**Status:** Phase 3 requires EHR adapter integration. Brad will display a clear disclaimer until this integration is active. **Do not assume compliance from Phase 3 absence** — treat EHR data as requiring manual review until Phase 3 is connected.

---

### How to Trust Phase 1/2 Operational Data

| Indicator | Meaning | Action |
|---|---|---|
| `Phase 1 — Seed Data` badge | Demonstrates Phase 1 capability. Not a live system integration yet. | Validate against actual task management system. |
| `Phase 2 — Curated Feed` badge | Representative regulatory updates. Not a live CMS ingestion feed. | Cross-reference with CMS.gov transmittals directly. |
| Gap with `overdueDays` | System detected time-sensitive compliance exposure. | Treat as actionable — verify in source system. |
| `CRITICAL` severity | Potential False Claims, CoP deficiency, or immediate survey risk. | Escalate to Compliance Officer within 24 hours. |
| `blocked_workflow` type | A process cannot be completed until a prerequisite is met. | Identify the blocker and assign immediate ownership. |

---

### Operational Gap Severity Scale

| Level | Meaning | Response Timeline |
|---|---|---|
| **Critical** | False Claims Act, CoP deficiency, immediate survey citation risk | Same day — escalate immediately |
| **High** | Survey exposure risk, CoP standard-level deficiency | Within 3 business days |
| **Moderate** | Documented compliance gap, policy non-conformance | Within 2 weeks |
| **Low** | Administrative non-compliance, minor documentation gap | Next scheduled review cycle |

---

### Policy Lifecycle State Guide

| State | Meaning | Who Acts |
|---|---|---|
| **Draft** | Policy not yet submitted for review | Policy Owner |
| **Under Review** | In reviewer's queue | Assigned Reviewer |
| **Pending Approval** | Ready for Governing Body or executive approval | Approver / Governing Body |
| **Overdue Review** | Annual review cycle has passed without initiation | Policy Owner / Compliance Officer |
| **Approved — Unpublished** | Approved by Governing Body but not distributed | Policy Owner / Administrator |
| **Awaiting Acknowledgment** | Published but staff have not signed acknowledgment | HR / Training |
| **Missing Linked Artifact** | Policy references a form/appendix that does not exist | Policy Owner |

---

### Who Sees What

Brad applies content sensitivity rules for operational data:

| Data Type | Who Can See | PHI Included? |
|---|---|---|
| Operational task gaps | Compliance Officer, Administrator, HR Director | No |
| Policy lifecycle alerts | All authorized users | No |
| Regulatory updates | All authorized users | No |
| EHR-derived gaps (Phase 3) | Clinical Director, Compliance Officer only | Role-filtered, minimal PHI |

**PHI Minimization:** Brad's Phase 3 EHR data uses broad summaries (e.g., "4 unsigned physician orders") and never exposes patient names, DOBs, or chart IDs in general compliance reporting.

---

### What Operational Data Brad Does NOT Have Authority Over

Brad **detects and reports** — it does NOT:

- Auto-approve policies
- Auto-complete tasks
- Auto-publish policy changes
- Auto-sign forms on behalf of anyone
- Auto-submit OASIS or EHR data

Every operational gap surfaced by Brad requires a human owner to act and close the gap. Brad's role is detection, prioritization, and escalation recommendation — not autonomous action.

---

*End of Operator Mode Guide — Care Indeed Home Health Care, Inc. | iAdministrator v2.0*

*For technical issues, contact the system administrator. For corpus gaps, contact the Compliance Officer or Policy Steward. For Phase 1/2/3 integration questions, contact the IT Director.*
