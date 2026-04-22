# 12 — Liability & Failure Analysis (SaaS Architectures)

**Companion to:** [11 — SaaS Architecture Alternatives](./11-SaaS-Architecture-Alternatives.md)
**Theme reminder:**
> **HIPAA-eligibility ≠ HIPAA compliance.** A BAA covers only the vendor's platform controls. Misconfiguration, custom integrations, or off-pattern use **transfers full liability back to the organization**.

---

## 12.1 Failure Mode Taxonomy (applies to all SaaS)

Six classes of failure repeatedly cause real-world HIPAA breaches in SaaS deployments:

1. **Misconfiguration** — wrong sharing model, over-permissive role, public bucket, missing MFA
2. **Improper access control** — over-provisioned users, stale accounts, shared logins
3. **Incorrect data flow** — PHI sent to non-eligible service, exported to unmanaged endpoint
4. **Integration mistakes** — connector to non-BAA vendor, webhook to public URL
5. **Off-pattern customization** — custom code that bypasses platform safeguards
6. **Lifecycle gaps** — sandboxes with real PHI, deprovisioning failures, vendor sub-processor change unnoticed

In every case below the pattern is the same: **the vendor stays compliant; the organization is the breaching party.**

---

## 12.2 Architecture A — Salesforce / Agentforce: Failure Scenarios

### A-F1 — Org-wide default set to "Public Read/Write" on a PHI object
- **Vendor responsible?** No. Salesforce platform behaved as configured.
- **Organization responsible?** **Yes — fully.**
- **Outcome:** Every authenticated user sees PHI for every patient.
- **HIPAA failure:** §164.308(a)(4); §164.312(a)(1).
- > **If this happens, the organization is fully liable despite the platform being HIPAA-eligible.**

### A-F2 — Custom Apex with `WITHOUT SHARING` returns PHI ignoring sharing model
- **Vendor responsible?** No.
- **Organization responsible?** **Yes — fully.**
- **Outcome:** Custom controller returns charts the user shouldn't see; LWC renders them.
- > **If this happens, the organization is fully liable despite the platform being HIPAA-eligible.**

### A-F3 — Sandbox refresh seeded with production PHI; no Data Mask applied
- **Vendor responsible?** No. Sandbox refresh is a customer action.
- **Outcome:** Developers and consultants — possibly without BAAs — touch real PHI.
- > **The BAA does not cover unauthorized exposure to people you didn't bring under BAA.**

### A-F4 — AppExchange package installed by admin, ingests PHI to vendor without their own BAA
- **Vendor responsible?** No (Salesforce did not vet the AppExchange BAA chain on your behalf).
- > **You inherited a sub-processor relationship without contractual protection. Full liability.**

### A-F5 — Marketing Cloud edition without HIPAA-eligibility receives PHI via flow
- **Vendor responsible?** No — that SKU is not HIPAA-eligible.
- > **HIPAA-eligibility boundary explicitly broken. BAA does not apply to Marketing Cloud usage.**

### A-F6 — Prompt template in Agentforce grounds on more PHI than user can see
- **Vendor responsible?** No. Trust Layer respects what you tell it to ground on.
- > **You designed the leak. Full liability.**

### A-F7 — Connected App with broad OAuth scopes used by integration; token leaked
- **Vendor responsible?** No.
- > **Org-controlled credential management failure. Full liability.**

### A-F8 — Reports & Dashboards expose PHI to a community / experience site
- **Vendor responsible?** No.
- > **Misconfiguration of a customer-controlled feature. Full liability.**

### A-F9 — Use of a non-eligible LLM connector through Einstein Studio "bring your own LLM"
- **Vendor responsible?** No. ZDR claim does not apply to non-eligible models.
- > **Architecture moved outside HIPAA-eligible boundary. BAA voided for that data path.**

### A-F10 — Field Audit Trail not enabled / retention misconfigured
- **Vendor responsible?** No.
- > **§164.312(b) audit controls failure. Full liability.**

---

## 12.3 Architecture B — Azure HIPAA Stack: Failure Scenarios

### B-F1 — Azure OpenAI deployed in non-eligible region
- **Vendor responsible?** No — Microsoft documents the eligible region list.
- > **Outside BAA scope. Organization fully liable.**

### B-F2 — Default content filter / abuse-monitoring leaves human review enabled
- **Vendor responsible?** Microsoft is contractually permitted to do limited review under abuse-monitoring; not a breach by them.
- **Organization responsible?** Yes — must request opt-out for PHI workloads to avoid Microsoft personnel viewing PHI under flagged-content review.
- > **Failure to request opt-out = potentially exposing PHI to Microsoft personnel beyond BAA scope. Liability ambiguous and risky.**

### B-F3 — App Service exposed publicly without WAF / Front Door
- **Vendor responsible?** No.
- > **Self-inflicted attack surface. Full liability.**

### B-F4 — Storage account enabled public blob access
- **Vendor responsible?** No.
- > **The classic HIPAA breach pattern in Azure/AWS. Full liability.**

### B-F5 — Diagnostic logs / OpenAI request logs sent to a workspace shared with non-BAA tenant
- **Vendor responsible?** No.
- > **PHI leaked into uncovered logging plane. Full liability.**

### B-F6 — Use of preview / GA-pending Azure feature on PHI workload
- **Vendor responsible?** No — preview features are explicitly outside BAA scope.
- > **HIPAA-eligibility boundary broken by feature choice.**

### B-F7 — Conditional Access not enforced for service accounts; OAuth token theft
- **Vendor responsible?** No.
- > **Identity design failure. Full liability.**

### B-F8 — CMK rotation unmanaged; ex-admin retains key access
- **Vendor responsible?** No.
- > **Key custody failure. Full liability.**

### B-F9 — Azure OpenAI deployment uses default shared capacity (PTU not provisioned); peak-time noisy-neighbor latency causes timeouts handled by retries that double-log PHI
- **Vendor responsible?** No.
- > **Application design failure causing audit/PHI duplication. Full liability.**

### B-F10 — Logic App connector to a non-BAA SaaS (e.g., Slack free tier) for "alerts" includes PHI snippets
- **Vendor responsible?** No — Slack free tier is not HIPAA-eligible.
- > **PHI sent outside BAA umbrella. Full liability and reportable breach.**

### B-F11 — Power BI workspace shares PHI report externally via "Publish to web"
- **Vendor responsible?** No.
- > **Self-publication of PHI. Full liability.**

### B-F12 — Microsoft Copilot for M365 enabled tenant-wide; Copilot indexes SharePoint folders containing PHI; users unaware Copilot answers will surface PHI
- **Vendor responsible?** No — Copilot for M365 has its own eligibility rules and you are responsible for tenant configuration.
- > **PHI surfaced to non-need-to-know users via AI. Full liability.**

---

## 12.4 Architecture C — Vertical Healthcare AI SaaS: Failure Scenarios

### C-F1 — Customer over-provisions EHR scope; vendor receives entire patient population when only one site is needed
- **Vendor responsible?** No.
- > **Excessive PHI sharing. Liability internal even though vendor has BAA.**

### C-F2 — Customer admin grants vendor support engineer "production access" via shared account
- **Vendor responsible?** No.
- > **Shared identity = no individual accountability under §164.312(a)(2)(i). Full liability.**

### C-F3 — Vendor changes sub-processor list (e.g., adds new LLM provider). Customer fails to re-evaluate.
- **Vendor responsible?** No (assuming vendor sent the required change notice).
- > **Vendor management failure. Liability internal.**

### C-F4 — Default ToS allows vendor to use customer PHI for "service improvement" / model training; customer never negotiated carve-out
- **Vendor responsible?** No — they are operating per signed agreement.
- > **PHI used outside customer's intent. Internal failure of contract review. Liability fully internal.**

### C-F5 — Clinician downloads CSV export of AI findings to local laptop (unmanaged) and emails to a colleague
- **Vendor responsible?** No.
- > **Endpoint/AUP failure. Full liability.**

### C-F6 — Customer enables a vendor "lab feature" (preview) with PHI; preview features outside BAA
- **Vendor responsible?** No.
- > **Boundary violation. Full liability.**

### C-F7 — Vendor outage; customer has no offline workflow → care delayed → safety event
- **Vendor responsible?** Limited (per SLA). Customer responsible for clinical continuity.
- > **§164.308(a)(7) Contingency Plan failure. Liability internal.**

### C-F8 — Vendor breach affecting customer's PHI
- **Vendor responsible?** Yes — for their breach. Customer still responsible for breach notification to affected individuals as Covered Entity.
- > **The Covered Entity always notifies. Vendor reimburses but does not absolve.**

### C-F9 — Termination: customer cancels contract; PHI deletion not verified
- **Vendor responsible?** Per BAA, must return/destroy. Customer responsible for verification.
- > **Without verification certificate, customer cannot prove §164.504(e)(2)(ii)(J). Liability internal.**

### C-F10 — Vendor's AI emits a recommendation that leads to clinical harm; clinician acted on it without review
- **Vendor responsible?** Disclaim AI as decision support; clinician is the practitioner of record.
- > **Clinical liability internal. AI does not absolve human judgment.**

---

## 12.5 Misconfiguration → Liability Matrix (cross-cut)

| Misconfiguration | Architecture | Who's liable? |
|---|---|---|
| Public storage / public report / public community | A, B, C | **Organization** |
| Sandbox/dev with real PHI | A, B, C | **Organization** |
| Non-eligible service / region / SKU used for PHI | A, B, C | **Organization** |
| Custom code / integration sends PHI to non-BAA endpoint | A, B, C | **Organization** |
| Over-provisioned roles / sharing | A, B, C | **Organization** |
| MFA not enforced | A, B, C | **Organization** |
| Audit logs disabled / under-retained | A, B, C | **Organization** |
| Vendor sub-processor change ignored | A, C | **Organization** |
| Vendor's actual platform breach | A, B, C | Vendor (but org still notifies) |
| Vendor outage causing care disruption | A, B, C | **Organization** (continuity) |
| Default ToS allowing model training on PHI without carve-out | A, C | **Organization** |
| AI hallucination acted upon without review | A, B, C | **Organization** (clinical) |

---

## 12.6 Where Each Architecture Falls Outside HIPAA-Eligibility

### Architecture A (Salesforce)
Falls outside when:
- Non-eligible Salesforce SKU receives PHI (some Marketing Cloud editions, Pardot legacy, some Slack tiers)
- Non-eligible Einstein feature / non-eligible LLM via "BYO LLM"
- AppExchange package without independent BAA
- Sandbox with unmasked PHI
- Connected App callout to non-BAA endpoint
- "Communities" / Experience Cloud sites with PHI exposure to guest users

### Architecture B (Azure)
Falls outside when:
- Preview / GA-pending services used for PHI
- Non-eligible region
- Logic Apps / Power Automate connectors to non-BAA SaaS
- Power BI "Publish to web" / Power BI Embedded outside BAA scope
- Copilot for M365 indexing PHI without proper licensing/eligibility
- GitHub Copilot indexing repos containing PHI samples
- Microsoft Fabric / preview analytics services for PHI

### Architecture C (Vertical SaaS)
Falls outside when:
- Vendor's "lab" or "preview" features used for PHI
- Sub-processor without BAA (vendor's responsibility but customer must verify)
- Custom integration the vendor warned was unsupported
- Use of vendor's general-purpose AI features outside the healthcare-eligible scope
- Default ToS not amended to exclude training/model improvement on PHI

---

## 12.7 The Liability Reality (Restated)

> Across **all three** SaaS architectures and the self-hosted baseline, the **Covered Entity (Care Indeed) carries the breach notification obligation, the OCR enforcement risk, the patient harm exposure, and the reputational damage**.
>
> SaaS reduces:
> - Operational labor for infrastructure
> - Some platform-level technical liability
>
> SaaS does **not** reduce:
> - HIPAA accountability
> - Liability for design, configuration, integration, or use
> - Liability for clinical outcomes from AI recommendations
> - Obligation to notify and report breaches
>
> **A BAA is a floor, not a ceiling. Misconfiguration above the floor is yours alone.**
