# 13 — Comprehensive Architecture Comparison (27 Dimensions)

**Subjects:**
- **SH** — Self-hosted Brad 2.0 (validated)
- **A** — Salesforce Health Cloud + Agentforce + Einstein Trust Layer
- **B** — Azure HIPAA Stack (Azure OpenAI + Health Data Services)
- **C** — Vertical Healthcare AI SaaS (Abridge / Notable / Innovaccer class)

**Theme reminder:** HIPAA-eligibility ≠ HIPAA compliance. Every "vendor handles it" cell below assumes correct configuration and supported architecture. Off-pattern use voids that assumption.

---

## 13.1 Quick Scoreboard

Lower is better for risk/cost dimensions; higher is better for capability dimensions. Scale 1–5.

| Dimension | SH | A | B | C |
|---|---|---|---|---|
| Control over data | 5 | 2 | 3 | 1 |
| Liability transfer (infra) | 1 | 4 | 4 | 5 |
| Liability transfer (overall HIPAA) | 1 | 1 | 1 | 1 |
| Operational complexity | 5 | 3 | 4 | 2 |
| Time to market | 1 | 4 | 3 | 5 |
| Customization | 5 | 3 | 5 | 1 |
| Cost predictability | 4 | 4 | 2 | 5 |
| Vendor lock-in | 1 | 5 | 4 | 5 |
| Data residency control | 5 | 2 | 4 | 2 |
| Talent need | 5 | 3 | 4 | 2 |

(Detailed analysis follows.)

---

## 13.2 Dimension-by-Dimension Analysis

### 1. Total Cost of Ownership (TCO) — 5-year horizon

- **SH:** Capital up front (~$120k GPU/server + $30k network/security tooling) + ~$240k/yr ops (DevSecOps headcount portion, power, replacement reserve, audits). 5-yr ≈ **$1.35M**. Cost grows linearly with site count, sub-linearly with users.
- **A:** Health Cloud ~$300/user/mo + Agentforce/Einstein add-ons (~$50–125/conversation or per-action pricing) + Shield ~$25k/yr base + implementation partner ~$300k year 1. 100 clinical users 5-yr ≈ **$2.4–4.0M**.
- **B:** Azure consumption-based. 100 users at moderate inference (~50 calls/day/user, GPT-4o class, regional capacity) ≈ $35–55k/mo all-in including Health Data Services, App Service, storage, Sentinel. Plus ~2 FTE platform engineers. 5-yr ≈ **$3.2–4.5M**.
- **C:** Per-clinician licensing ~$500–2,000/clinician/mo depending on workflow scope; implementation $100–250k. 100 clinicians 5-yr ≈ **$3.5–13M**.

**Verdict:** Self-hosted is cheapest at scale. SaaS is cheapest at very small scale and during ramp.

### 2. Total Cost of Risk (TCOR) — expected breach + downtime + remediation

- **SH:** Highest infrastructure-attack surface internally, but smallest blast radius (no shared tenancy, no internet exposure). Major risk: insider + ops error. Expected annual loss ≈ **$80–150k** with current controls.
- **A:** Lower infra risk, but very high config risk (Salesforce sharing model is the #1 cause of real-world breaches in this class). Expected ≈ **$150–400k**, dominated by misconfiguration.
- **B:** Medium config risk, broad Azure attack surface if misused. Expected ≈ **$130–300k**.
- **C:** Lowest day-to-day operational risk, but **vendor concentration risk**: a vendor breach is your breach to notify. Expected ≈ **$100–500k**, fat-tailed by vendor incidents.

### 3. Shared Responsibility Model (clarity)

- **SH:** None — you own it all. Crystal clear.
- **A:** Documented but very large customer-side surface (sharing, profiles, code, AppExchange).
- **B:** Industry-standard cloud SRM, well-documented, but very deep customer surface (you're building an app).
- **C:** Smallest customer-side surface but customer responsibility for identity, scope, output review remains.

### 4. Security Control Ownership

- **SH:** 100% you. Maximum control, maximum work.
- **A:** Platform controls vendor-owned; data-plane controls (sharing/profile/field-level/code) yours.
- **B:** Infra controls vendor-owned; identity, network, app, prompts yours.
- **C:** Almost all controls vendor-owned; identity + scope + output yours.

### 5. Attack Surface Area

- **SH:** Smallest external surface (one WireGuard endpoint). Largest internal surface (your hardware, your kernel, your patches).
- **A:** Salesforce login URL = global attack surface; multi-tenant blast radius if Salesforce platform vuln. Customer code is its own surface.
- **B:** Public Azure endpoints are large surface unless every service is behind Private Endpoints + WAF; many customers fail this.
- **C:** Vendor-managed external surface; customer surface limited to SSO + EHR connector.

### 6. Blast Radius

- **SH:** PHI for one organization in one location. Worst case: single org-wide breach.
- **A:** Multi-tenant platform; if Salesforce platform breach (rare), spans many orgs. Your slice still your breach to notify.
- **B:** Subscription-scoped; well-isolated if configured correctly. Misconfig (public storage) is org-wide.
- **C:** Vendor-tenancy scope; vendor breach affects many customers.

### 7. Data Residency Control

- **SH:** Absolute. PHI never leaves your premises.
- **A:** US Hyperforce region selection; multi-region replication possible but limited.
- **B:** Per-region selection (must be on the eligible list); some services replicate paired-region.
- **C:** Vendor-defined; some vendors offer region pinning, many do not.

### 8. Vendor Lock-in

- **SH:** None.
- **A:** Severe. Salesforce data model, Apex, LWC, Flow are all proprietary. Migration cost prohibitive.
- **B:** Moderate. App code portable; Azure-specific services (FHIR Service, OpenAI, Sentinel rules) are not.
- **C:** Severe. Vertical SaaS workflows and AI behavior are not portable.

### 9. Operational Complexity (day-to-day)

- **SH:** High. You're running Linux, Docker, GPUs, Vault, SIEM, backups, and PHI compliance.
- **A:** Medium. Salesforce admin overhead is non-trivial; release management three times/year.
- **B:** Medium-high. You're operating a cloud-native app; many services to manage.
- **C:** Low. Vendor handles operations.

### 10. MTTR (Mean Time to Recovery)

- **SH:** You set it. Practiced quarterly. RTO 4h.
- **A:** Outages are Salesforce's; your MTTR = "wait." Status page is the SLA. Historic Salesforce outages have been hours.
- **B:** Region failover possible if architected; depends on your design.
- **C:** Vendor-defined, often opaque. SLA credit ≠ uptime.

### 11. MTTD (Mean Time to Detect)

- **SH:** Wazuh + Falco + audit chain = minutes for known-bad signals.
- **A:** Salesforce Event Monitoring + Shield Field Audit Trail; you must build dashboards/alerts. Otherwise hours-to-days.
- **B:** Sentinel built-in detections + custom rules. Strong if invested.
- **C:** Vendor-side detections; your visibility is limited to vendor-supplied audit exports.

### 12. Scalability Model

- **SH:** Vertical scaling (add GPU nodes) or horizontal (add inference workers). Capex required. Predictable.
- **A:** Salesforce scales for you — within license tiers; cost scales linearly with users.
- **B:** Cloud-elastic; great for spiky workloads.
- **C:** Vendor-managed.

### 13. Latency / Performance

- **SH:** Single-digit ms LAN; LLM inference latency depends on model size and batching. Predictable.
- **A:** Variable; multi-tenant cloud with shared compute. Einstein latency uneven.
- **B:** Strong; Azure OpenAI PTU (provisioned throughput units) gives predictable latency at premium cost.
- **C:** Vendor-defined; typically tuned for the workflow.

### 14. Compliance Burden (HIPAA + SOC 2 evidence collection)

- **SH:** Highest. You produce all evidence (this very document set).
- **A:** Medium. Salesforce attestations inherited; you produce config and access evidence.
- **B:** Medium. Azure attestations inherited; you produce design/config/app evidence.
- **C:** Lowest. Vendor produces most attestations; you produce identity/scope evidence.

### 15. Audit Readiness

- **SH:** Excellent if maintained; otherwise terrible. You own evidence quality.
- **A:** Good — Shield + Event Monitoring give strong audit if enabled. You must enable them.
- **B:** Good — Sentinel + Log Analytics give strong audit if configured.
- **C:** Limited to vendor exports; auditor may require additional evidence the vendor must provide.

### 16. Change Management Complexity

- **SH:** GitOps + CAB; high engineering investment but full control.
- **A:** Salesforce releases (3/yr) force-push platform changes; you must regression-test. Custom code change-managed by you.
- **B:** Azure preview-to-GA flux; you must manage SKU/feature lifecycle.
- **C:** Vendor pushes changes; you have no control over LLM/model upgrades or workflow changes that may alter clinical behavior.

### 17. DevOps / DevSecOps Maturity Required

- **SH:** Maximum. Without it, the system fails.
- **A:** Salesforce DevOps (DX, CI for Apex, sandbox strategy) — meaningful.
- **B:** Cloud-native DevSecOps. Comparable to SH in skill needs.
- **C:** Lowest — vendor-driven.

### 18. Human Error Risk

- **SH:** Concentrated in DevSecOps team; mitigated by GitOps reviewers and CI gates.
- **A:** Distributed (admins, developers, business users w/ flow access). **Highest** in practice — most SaaS HIPAA breaches are admin/sharing errors.
- **B:** Cloud admin error (public storage, NSG misconfig) is the dominant risk class.
- **C:** Concentrated in identity and EHR scope — fewer surfaces but high-impact when wrong.

### 19. Insider Threat Surface

- **SH:** Internal staff + your DevSecOps team. Mitigated by 2-person rule + WORM audit.
- **A:** Salesforce personnel + customer admins + AppExchange vendors.
- **B:** Microsoft personnel + customer admins + sub-processors. Microsoft has strong personnel controls and abuse-monitoring boundary issues for OpenAI workloads.
- **C:** Vendor personnel (largest), sub-processors, customer admins.

### 20. Business Continuity

- **SH:** You own the BC plan; tested.
- **A:** Depends on Salesforce uptime; offline workflow design required.
- **B:** Depends on Azure region health; multi-region failover possible at cost.
- **C:** Depends on vendor uptime; offline clinical workflow MUST exist.

### 21. Disaster Recovery Complexity

- **SH:** You design and execute; LTO offline + offsite + drills.
- **A:** Salesforce backup is **not** a substitute for a customer backup — you must export periodically (own a Salesforce backup tool like OwnBackup/Salesforce Backup) or face data loss on accidental delete.
- **B:** You design DR; standard Azure patterns apply.
- **C:** Vendor handles platform DR; you must plan for **vendor failure / vendor exit**.

### 22. Dependency Risk

- **SH:** Hardware vendors + OS distro + open-source projects. Diversifiable.
- **A:** Single vendor (Salesforce) for platform + AI brokering.
- **B:** Single hyperscaler (Microsoft) for platform + AI.
- **C:** Single vendor for everything.

### 23. Supply Chain Risk

- **SH:** Container image + dep risk; managed by cosign + SBOM + internal mirror.
- **A:** AppExchange ecosystem is a supply chain (often unvetted by Salesforce for HIPAA).
- **B:** Azure marketplace, Power Platform connectors, Logic Apps connectors.
- **C:** Vendor's sub-processor chain (changes notified, but you must re-evaluate).

### 24. Cost Predictability

- **SH:** Very predictable (fixed amortization + ops).
- **A:** Predictable per-license, **unpredictable on Einstein/Agentforce per-action pricing**.
- **B:** Variable consumption; PTU helps but is expensive.
- **C:** Predictable per-license.

### 25. Flexibility / Customization

- **SH:** Maximum.
- **A:** Within Salesforce paradigm — flexible. Outside it — impossible.
- **B:** Maximum (you build the app).
- **C:** Minimum.

### 26. Time to Market

- **SH:** Months (build, harden, validate). Already done for Brad 2.0.
- **A:** Weeks-to-months (Salesforce delivery partner).
- **B:** Months (custom build).
- **C:** Weeks (configuration only).

### 27. Talent Requirements

- **SH:** Linux SRE, GPU/ML ops, DevSecOps, HIPAA Security Officer, app engineers.
- **A:** Salesforce admin + developer + architect; Health Cloud experience scarce/expensive.
- **B:** Azure cloud engineers + ML engineers + security engineers + app developers.
- **C:** Light: SSO admin + analyst + clinical informatics.

---

## 13.3 Composite Verdict

| If you optimize for… | Pick |
|---|---|
| **Maximum control over PHI** | **SH** |
| **Minimum operational labor** | **C** |
| **Minimum HIPAA liability transfer** | None — they're all equivalent (HIPAA accountability does not transfer) |
| **Minimum *infrastructure* liability** | **C**, then **A**, then **B** |
| **Maximum customization for chart-review/QAPI** | **SH** or **B** |
| **Fastest deployment** | **C** |
| **Lowest 5-yr cost at 100+ users** | **SH** |
| **Lowest 1-yr cost for pilot** | **C** |
| **Best fit for clinical workflows out of the box** | **C** |
| **Best fit when you're already a Salesforce shop** | **A** |
| **Best fit when you're already an Azure shop** | **B** |

(See [17 — Final Recommendation](./17-Final-Recommendation.md) for synthesized guidance.)

---

## 13.4 The Constant Across All Four

In **all** four architectures:

> **Care Indeed remains the Covered Entity. The BAA is a floor. Configuration, integration, scope, and clinical use determine whether that floor holds. Misconfiguration in any architecture = full organizational liability.**
