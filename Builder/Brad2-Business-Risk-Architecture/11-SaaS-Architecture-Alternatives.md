# 11 — SaaS Architecture Alternatives (Three Distinct Designs)

**Companion to:** [01–10 self-hosted Brad 2.0 deliverables](./README.md)
**Purpose:** Evaluate SaaS-based alternatives to the validated self-hosted Brad 2.0 architecture.
**Audience:** Executive sponsors, HIPAA Security Officer, Enterprise Architecture, Compliance.

---

## ⚠️ CORE PRINCIPLE — READ FIRST

> **HIPAA eligibility ≠ HIPAA compliance.**
>
> A signed BAA and a "HIPAA-eligible" service tier cover **only the vendor's infrastructure and platform-level controls**. They do **not** cover:
> - how the system is designed
> - how data flows
> - how access is configured
> - how PHI is used, exposed, logged, exported, or shown to AI models
> - how custom code, custom prompts, custom integrations, or custom storage behave
>
> If the system is misconfigured, built outside the vendor's documented supported architecture, or implemented incorrectly, **the organization assumes FULL liability** — even if every checkbox in the vendor's "HIPAA-eligible" feature matrix is ticked.
>
> **You are only eligible for vendor coverage and protection if you stay within the platform's supported architecture. The moment you deviate, you are on your own when things fail.**

This principle is repeated in every architecture below because it determines whether the BAA actually protects you.

---

## 11.1 Architecture A — Salesforce Health Cloud + Agentforce + Einstein Trust Layer

### A.1 System Overview

A managed CRM-anchored platform where PHI lives in Salesforce Health Cloud, AI agents are built on Agentforce, and LLM calls are mediated by the Einstein Trust Layer (zero data retention, dynamic grounding, prompt defense).

### A.2 Core Components

| Component | Vendor | Purpose |
|---|---|---|
| Salesforce Health Cloud | Salesforce | PHI system of record (patient records, care plans) |
| Agentforce | Salesforce | Agent runtime + actions |
| Einstein Trust Layer | Salesforce | Prompt grounding, masking, ZDR LLM brokering |
| Einstein Generative AI (Atlas reasoning + partner LLMs) | Salesforce + partners | LLM inference (HIPAA-eligible only on supported tiers) |
| Salesforce Shield | Salesforce | Platform encryption, event monitoring, field audit trail |
| Salesforce MuleSoft (optional) | Salesforce | Integration to EHR / billing |
| Identity / SSO | Customer IdP via SAML/OIDC | Authentication |
| Customer-managed: data classification, sharing rules, prompt templates, custom Apex/LWC | **Customer** | **All design and config decisions** |

### A.3 Data Flow (PHI)

```
Clinician (browser, MFA via SSO)
   → Salesforce Health Cloud (PHI at rest, Shield-encrypted)
   → Agent invocation
   → Einstein Trust Layer
       - dynamic grounding pulls only fields user has permission to see
       - PII/PHI masking before prompt leaves Trust Layer
       - prompt sent to approved LLM with ZDR
       - response defense + demasking
   → response surfaced in Health Cloud UI
   → audit captured in Field Audit Trail + Event Monitoring
```

### A.4 Where AI Runs
Inside Salesforce-managed LLM endpoints (Atlas reasoning engine + partner models contracted under Salesforce's BAA umbrella). The customer never controls the model host.

### A.5 Where PHI is Stored
Salesforce-managed multi-tenant cloud (US data residency, with Hyperforce region selection). Customer cannot see the underlying infrastructure.

### A.6 How Compliance is Achieved (claimed)
- Salesforce signs a BAA covering Health Cloud, Shield, Einstein Trust Layer on supported tiers.
- ZDR contractual term means model providers do not retain prompts/completions.
- Shield Platform Encryption + Field Audit Trail + Event Monitoring cover technical safeguards at the platform layer.

### A.7 Shared Responsibility — Architecture A

| Domain | Salesforce | Customer |
|---|---|---|
| Physical security of data centers | ✅ | — |
| Hypervisor / multi-tenant isolation | ✅ | — |
| Platform patching | ✅ | — |
| Encryption-at-rest infrastructure | ✅ | — |
| TLS termination | ✅ | — |
| Einstein Trust Layer masking engine | ✅ | — |
| LLM provider BAA chain | ✅ | — |
| **Org-wide sharing model** | — | ✅ |
| **Profile / permission set design** | — | ✅ |
| **Field-level security on PHI fields** | — | ✅ |
| **Sharing rules / role hierarchy** | — | ✅ |
| **Apex / LWC custom code (callouts, queries)** | — | ✅ |
| **Prompt templates & grounding scope** | — | ✅ |
| **Choice of LLM (some non-eligible)** | — | ✅ |
| **Connected Apps / OAuth scopes** | — | ✅ |
| **External integrations (MuleSoft, custom APIs)** | — | ✅ |
| **Data classification (which fields are PHI)** | — | ✅ |
| **Salesforce Reports / Dashboards exposing PHI** | — | ✅ |
| **Sandboxes containing real PHI** | — | ✅ |
| **MFA enforcement, IP allowlists** | — | ✅ |
| **AppExchange package risk** | — | ✅ |

### A.8 Where Liability Transfers vs Stays Internal

**Transferred to Salesforce (covered by BAA):**
- Datacenter, hypervisor, platform code defects in covered services on supported tiers.

**Stays internal — and this is most of the risk:**
- Sharing model misconfiguration
- Profile/permission/field-level security errors
- Custom Apex with insecure SOQL/queries
- Reports that expose PHI to wrong audience
- Sandboxes seeded with real PHI (extremely common audit finding)
- Prompt templates that ground on more PHI than the user role permits
- Use of an LLM not on the eligible list
- AppExchange packages with unvetted access

> ⚠️ **HIPAA-eligibility boundary breaks if:**
> - You enable a non-eligible Einstein feature or non-eligible LLM connector
> - You install AppExchange components that process PHI without their own BAA
> - You sync PHI to a non-eligible Salesforce service (e.g., legacy Marketing Cloud edition without BAA)
> - You use Sandboxes with real PHI without sandbox masking
> - You build custom callouts that send PHI to non-BAA endpoints
>
> **In all of these, the BAA does not protect you. You assume full liability.**

---

## 11.2 Architecture B — Microsoft Azure HIPAA Stack (Azure OpenAI + Azure Health Data Services + Azure AD)

### B.1 System Overview

A cloud-native, customer-built application using Azure HIPAA-eligible services. Customer designs the application; Azure provides the building blocks under a BAA.

### B.2 Core Components

| Component | Vendor | Purpose |
|---|---|---|
| Azure OpenAI Service | Microsoft | LLM inference (GPT-4o / Phi / o-series) — **eligible** |
| Azure Health Data Services (FHIR + DICOM + MedTech) | Microsoft | PHI storage in FHIR-compliant store |
| Azure AD / Entra ID | Microsoft | Identity + Conditional Access + MFA |
| Azure Key Vault (HSM tier) | Microsoft | Key custody |
| Azure SQL / Cosmos DB | Microsoft | Application data |
| Azure Storage (blob with CMK) | Microsoft | PHI documents |
| Azure Front Door + WAF + Private Link | Microsoft | Ingress + private connectivity |
| Microsoft Sentinel | Microsoft | SIEM |
| Microsoft Defender for Cloud | Microsoft | Posture management |
| Customer application (App Service / AKS / Functions) | **Customer** | **Brad-equivalent app code** |

### B.3 Data Flow (PHI)

```
Clinician → Entra ID (FIDO2) → Front Door + WAF
   → Private endpoint → Customer app (App Service / AKS)
   → FHIR Service (PHI read, RBAC + tenant scope)
   → Azure OpenAI deployment (regional, no-training opt, content-filter configured)
   → response → app → user
   → audit → Log Analytics → Sentinel → immutable storage account
```

### B.4 Where AI Runs
Azure OpenAI in a customer-selected region; **dedicated deployment** preferred to avoid shared capacity. Models do not train on prompts (per Azure OpenAI commitment).

### B.5 Where PHI is Stored
Customer's Azure tenant, FHIR Service + Storage with customer-managed keys (CMK) in Key Vault HSM.

### B.6 How Compliance is Achieved (claimed)
- Microsoft BAA covers HIPAA-eligible services list.
- Azure OpenAI is eligible; abuse-monitoring **opt-out** must be requested for additional PHI protection.
- HITRUST/SOC 2/ISO inheritance from Azure.

### B.7 Shared Responsibility — Architecture B

| Domain | Microsoft | Customer |
|---|---|---|
| Physical / hypervisor / OS for PaaS | ✅ | — |
| Platform patching for managed services | ✅ | — |
| Eligible service infrastructure | ✅ | — |
| Azure OpenAI service infrastructure | ✅ | — |
| Identity provider infrastructure | ✅ | — |
| Key custody infrastructure (HSM) | ✅ | — |
| **Subscription/RBAC design** | — | ✅ |
| **Conditional Access policies** | — | ✅ |
| **Network design (VNet, NSG, Private Endpoints)** | — | ✅ |
| **CMK rotation, Key Vault access policies** | — | ✅ |
| **Application code (auth checks, query scoping)** | — | ✅ |
| **Azure OpenAI deployment config (region, model, abuse-monitoring opt-out)** | — | ✅ |
| **Content filter + jailbreak protections** | — | ✅ |
| **Prompt design (PHI minimization)** | — | ✅ |
| **Logging configuration & retention** | — | ✅ |
| **Sentinel rules** | — | ✅ |
| **Backup + DR design** | — | ✅ |
| **Service eligibility — using only eligible SKUs** | — | ✅ |

### B.8 Where Liability Transfers vs Stays Internal

**Transferred to Microsoft:**
- Azure platform infrastructure for eligible services on supported SKUs.

**Stays internal:**
- Everything above the platform plane: identity policies, network design, app code, storage configuration, Azure OpenAI deployment options, content filter behavior, logging, prompts, retention.

> ⚠️ **HIPAA-eligibility boundary breaks if:**
> - You use a non-eligible Azure service (e.g., a preview feature, a non-HIPAA region, a Power Platform SKU not in scope) for PHI
> - You deploy Azure OpenAI in a region/SKU not covered by your BAA
> - You leave default abuse-monitoring on without understanding that human reviewers may see flagged content (acceptable with opt-out request)
> - You expose Azure OpenAI behind a public endpoint without WAF + auth
> - You connect to a non-BAA third-party (Power BI external sharing, Logic Apps connector to non-eligible SaaS)
> - You use Copilot integrations that ingest PHI when those Copilots are not on the eligible list
> - You enable diagnostic logs to a destination outside your BAA scope
> - You create cross-tenant guest access without honoring the same controls
>
> **In all of these, the Microsoft BAA does not protect you. You assume full liability.**

---

## 11.3 Architecture C — Fully Managed Healthcare AI SaaS (e.g., Abridge / Notable / Innovaccer / Hippocratic class)

### C.1 System Overview

A turnkey vertical SaaS purpose-built for healthcare AI workflows (chart review, ambient documentation, QAPI, care management). Customer integrates EHR/source data and consumes the platform; vendor owns the entire stack including AI.

### C.2 Core Components

| Component | Vendor | Purpose |
|---|---|---|
| Vertical Healthcare AI SaaS | Vendor | All — UI, AI, storage, workflows |
| Vendor's AI models | Vendor (often via partner LLMs under sub-BAA) | Inference |
| Vendor's data warehouse | Vendor | PHI store |
| EHR integrations (Epic / Cerner / etc.) | Vendor + customer | Source data |
| SSO | Customer IdP | Identity |
| Customer responsibilities | **Customer** | **Configuration, role assignment, EHR scope, output review** |

### C.3 Data Flow (PHI)
```
EHR → Vendor integration (HL7 / FHIR) → Vendor cloud (PHI at rest)
   → Vendor AI processing
   → Vendor UI → Clinician (SSO from customer IdP)
   → Audit captured by vendor; customer-accessible audit export
```

### C.4 Where AI Runs
Vendor-managed cloud or vendor's contracted hyperscaler. Customer typically has no model selection.

### C.5 Where PHI is Stored
Vendor's tenancy. Some vendors offer single-tenant deployment for premium tiers.

### C.6 How Compliance is Achieved (claimed)
- Vendor BAA covers entire platform.
- Vendor maintains HITRUST CSF / SOC 2 Type II / sometimes HITRUST r2.
- Sub-processor BAAs cover LLM providers.

### C.7 Shared Responsibility — Architecture C

| Domain | Vendor | Customer |
|---|---|---|
| Entire technical stack (infra, app, AI, storage, network) | ✅ | — |
| Platform compliance attestations | ✅ | — |
| Sub-processor BAA chain | ✅ | — |
| Vulnerability management of platform | ✅ | — |
| Backup/DR of vendor cloud | ✅ | — |
| **Identity / SSO config** | — | ✅ |
| **User provisioning / deprovisioning** | — | ✅ |
| **Role / scope assignment** | — | ✅ |
| **EHR data scope (which patients, which fields flow)** | — | ✅ |
| **Output review / clinical sign-off** | — | ✅ |
| **Acceptable use policy / training** | — | ✅ |
| **Vendor risk management (ongoing)** | — | ✅ |
| **Configuration of any vendor-exposed knobs** | — | ✅ |
| **Termination / data deletion / portability** | — | ✅ |

### C.8 Where Liability Transfers vs Stays Internal

**Transferred to vendor (most extensive of the three):**
- Infrastructure, platform, application code, AI model operation, sub-processor management, platform-level audit, platform-level breach response.

**Stays internal:**
- Identity configuration (over-provisioning is the #1 SaaS breach vector)
- EHR scope (sending more PHI than necessary)
- Role assignment
- Clinical responsibility for outputs (AI proposes; clinician/admin remains the responsible party)
- Vendor risk management (you must verify their attestations annually)
- Termination handling (data extraction + deletion verification)
- Use of any custom integrations or data feeds

> ⚠️ **HIPAA-eligibility boundary breaks if:**
> - Vendor uses a sub-processor without a BAA (your responsibility to verify)
> - You feed PHI into a vendor "lab" / "preview" feature outside the BAA scope
> - You export PHI to a destination not covered by the BAA (CSV download to local laptop, BI tool, email)
> - You over-provision EHR scope (sending entire chart when only specific fields are needed)
> - You let the vendor use your PHI for "model improvement" without explicit BAA carve-out (default ToS in some products allows this)
> - You skip Business Continuity planning under the assumption "the vendor handles it"
> - The vendor changes ownership / sub-processor list and you don't re-evaluate
>
> **In all of these, the vendor BAA does not protect you. You assume full liability.**

---

## 11.4 Cross-Architecture Reinforcement of the Core Principle

| Architecture | What you can offload | What you cannot offload |
|---|---|---|
| **A — Salesforce/Agentforce** | Platform, LLM brokering, Trust Layer, datacenter | Sharing model, profiles, prompts, custom code, AppExchange, sandbox PHI, report scope |
| **B — Azure HIPAA stack** | Eligible service infra, Azure OpenAI infra, key infra | RBAC, network, app code, deployment options, content filter, prompts, logging, eligibility selection |
| **C — Vertical Healthcare AI SaaS** | Almost everything technical | Identity config, EHR scope, role assignment, output responsibility, vendor risk, exports |
| **Self-hosted Brad 2.0** | Nothing (no vendor risk transfer) | Everything (full ownership = full control = full responsibility) |

In **every** SaaS model, the **customer remains the Covered Entity** under HIPAA. The vendor is at most a Business Associate. **The Covered Entity carries unconditional accountability** under §164.308 and §164.402 regardless of who operates the infrastructure.

> **Restated for executive clarity:**
> - Self-hosted: you own everything, including the breach.
> - SaaS: you own the design and configuration, including the breach.
> - There is no architecture in which the organization stops owning the breach.
> - SaaS shifts **operational labor** and a sliver of **infrastructure liability**. It does **not** shift **HIPAA accountability**.
