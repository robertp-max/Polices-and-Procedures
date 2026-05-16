# 14 â€” Cost Analysis & Budget-Tier Models

**Subjects:** SH (self-hosted Brad.pi), A (Salesforce), B (Azure), C (Vertical SaaS).
**Assumptions:** ~100 clinical users, ~50 chart reviews/clinician/day, US-only, single org.
**Currency:** USD. All figures realistic order-of-magnitude estimates for executive planning, not vendor quotes.

> **Reminder:** None of the cost models below alter HIPAA liability. Cheaper SaaS does not reduce your accountability. Misconfiguration cost is **not** included in these tables and is borne fully by the organization.

---

## 14.1 Per-Architecture Cost (Steady State, Year 2+)

### 14.1.1 SH â€” Self-hosted Brad.pi

| Line | Monthly | Annual |
|---|---|---|
| Hardware amortization (4Ã— RTX 6000 Ada + servers + network, 5-yr) | $2,000 | $24,000 |
| Power + cooling | $700 | $8,400 |
| Bandwidth + remote access (WG/edge) | $300 | $3,600 |
| Backup (LTO drive amortization + tapes + offsite MinIO) | $800 | $9,600 |
| Software (Wazuh OSS, Vault OSS or licensed, ClamAV, etc.) | $1,200 | $14,400 |
| 1.0 FTE DevSecOps (loaded) | $16,000 | $192,000 |
| 0.25 FTE HIPAA Security Officer (loaded) | $4,500 | $54,000 |
| Annual external pentest (amortized) | $2,500 | $30,000 |
| Compliance evidence + audit prep (amortized) | $1,500 | $18,000 |
| **Subtotal** | **$29,500** | **$354,000** |
| Year 1 add: build + initial pentest + capex | â€” | +$200,000 |
| **5-year TCO** | â€” | **~$1.35M** |

### 14.1.2 A â€” Salesforce Health Cloud + Agentforce

| Line | Monthly | Annual |
|---|---|---|
| Health Cloud licenses (100 Ã— ~$300) | $30,000 | $360,000 |
| Shield (encryption, FAT, Event Monitoring) base | $2,500 | $30,000 |
| Agentforce / Einstein (per-action; ~50 actions/user/day Ã— $0.10 average) | $15,000 | $180,000 |
| Sandboxes (full + partial) | $4,000 | $48,000 |
| MuleSoft / integration (small footprint) | $5,000 | $60,000 |
| OwnBackup or Salesforce Backup | $3,000 | $36,000 |
| Salesforce admin (1.0 FTE loaded) | $13,000 | $156,000 |
| Salesforce developer (0.5 FTE loaded) | $9,000 | $108,000 |
| HIPAA Security Officer (0.25 FTE loaded) | $4,500 | $54,000 |
| Implementation partner (Year 1 only ~$300k; amortize) | $5,000 | $60,000 |
| **Subtotal** | **~$91,000** | **~$1.09M** |
| **5-year TCO** | â€” | **~$5.5M** (heavier in Y1 due to implementation) |

### 14.1.3 B â€” Azure HIPAA Stack (custom app on Azure)

| Line | Monthly | Annual |
|---|---|---|
| Azure OpenAI (GPT-4o, ~250k req/mo, mix of 4o + 4o-mini, plus PTU for steady) | $18,000 | $216,000 |
| Azure Health Data Services (FHIR + DICOM) | $4,500 | $54,000 |
| App Service / AKS + Postgres flex + Storage + CDN | $6,000 | $72,000 |
| Sentinel + Defender for Cloud + Log Analytics | $3,500 | $42,000 |
| Front Door + WAF + Private Link + DDoS standard | $2,500 | $30,000 |
| Key Vault HSM + Backup + DR (geo-redundant) | $1,800 | $21,600 |
| 1.5 FTE platform/DevSecOps (loaded) | $24,000 | $288,000 |
| 1.0 FTE app/ML engineer (loaded) | $16,000 | $192,000 |
| 0.25 FTE HIPAA Security Officer | $4,500 | $54,000 |
| Annual pentest | $2,500 | $30,000 |
| **Subtotal** | **~$83,300** | **~$1.0M** |
| **5-year TCO** | â€” | **~$4.8M** (Y1 build + integration ~+$300k) |

### 14.1.4 C â€” Vertical Healthcare AI SaaS

| Line | Monthly | Annual |
|---|---|---|
| Per-clinician licensing (100 Ã— ~$1,000 mid-tier) | $100,000 | $1,200,000 |
| EHR integration fees (one-time amortized + ongoing) | $4,000 | $48,000 |
| SSO + IdP integration (incremental) | $500 | $6,000 |
| Customer admin (0.5 FTE loaded) | $7,500 | $90,000 |
| Clinical informaticist (0.5 FTE) | $8,000 | $96,000 |
| Vendor risk management (0.1 FTE Compliance) | $1,800 | $21,600 |
| HIPAA Security Officer (0.1 FTE) | $1,800 | $21,600 |
| **Subtotal** | **~$123,600** | **~$1.48M** |
| **5-year TCO** | â€” | **~$7.4M** |

### 14.1.5 Summary

| Architecture | Annual (Y2+) | 5-Year TCO | Cost Predictability | Hidden Risk |
|---|---|---|---|---|
| SH | $354k | $1.35M | High | Capex + talent |
| A | $1.09M | $5.5M | Medium (per-action AI) | Per-action pricing creep |
| B | $1.0M | $4.8M | Low (consumption) | Bill spikes; PTU pressure |
| C | $1.48M | $7.4M | High | Vendor exit / repricing |

> Self-hosted is **2â€“4Ã— cheaper at scale** than any SaaS option, but trades cost for operational labor and direct ownership of all risk.

---

## 14.2 Budget-Tier Models (for organizations evaluating entry points)

### 14.2.1 $10,000 / month total budget

| Architecture | Feasible? | Configuration | Sacrifices | Risks Increased | Capabilities Gained |
|---|---|---|---|---|---|
| **SH** | **Yes** | 1Ã— RTX 6000 Ada or 2Ã— RTX A6000 (used), single inference node, OSS Vault/Wazuh, 0.5 FTE shared DevSecOps, no dedicated HIPAA Security Officer (designate existing exec) | Redundancy, hot standby, full pentest cadence (annual external instead of quarterly internal+annual external), GPU concurrency | **Higher BC risk** (single GPU node), reduced detection coverage, slower patch cadence | Full PHI control, full customization, no SaaS lock-in |
| **A** | **No** | Even minimum Health Cloud (10 users) + Agentforce + Shield > $10k/mo | â€” | â€” | â€” |
| **B** | **Marginal** | 10 users, GPT-4o-mini only, no PTU, basic FHIR, App Service Standard, no Sentinel (use Defender free tier), 0.5 FTE shared DevOps | Production-grade detection (no Sentinel), PTU latency guarantees, multi-region DR | **Higher MTTD**, slower DR, **Azure OpenAI shared capacity = unpredictable latency**, must opt out of abuse-monitoring still | Cloud elasticity, ZDR LLM, FHIR built-in |
| **C** | **Yes for ~10 clinicians** | 10-clinician license at ~$1,000/mo each; minimum integration | Scale, advanced workflows, premium tier features | Vendor concentration, no offline workflow if vendor down, limited audit visibility | Fastest deployment, vendor handles ops |

**Best $10k pick:** **SH at minimal scale** if PHI control matters; **C for 10 clinicians** if speed-to-value matters.

**Compliance gaps that emerge at $10k/mo:**
- SH: insufficient redundancy violates Â§164.308(a)(7) availability expectations.
- B: no SIEM = Â§164.312(b) audit controls weakened.
- C: no offline workflow = Â§164.308(a)(7)(ii)(C) emergency mode missing.
- All: training, drills, formal IR retainer get squeezed; **liability still 100% with you**.

---

### 14.2.2 $30,000 / month total budget

| Architecture | Feasible? | Configuration | Sacrifices | Risks Increased | Capabilities Gained |
|---|---|---|---|---|---|
| **SH** | **Strongly yes** | Production architecture as designed in [05](./05-Hardening-Blueprint.md): 4Ã— RTX 6000 Ada, full HA (warm standby), Wazuh + Falco + AIDE, 1.0 FTE DevSecOps, 0.25 HIPAA Security Officer, annual external pentest. **This is the validated baseline.** | Nothing essential | â€” | Full Brad.pi capability |
| **A** | **Marginal** | ~25â€“30 Health Cloud users + Shield + restrained Agentforce usage; small implementation partner footprint | 70%+ of clinician population, advanced AI workflows | Pilot scope only; cannot serve full org | Validated platform; fast onboarding within scope |
| **B** | **Yes** | ~30â€“40 users, GPT-4o + GPT-4o-mini blend, no PTU (consumption), full FHIR, full Sentinel, 1.0 FTE DevSecOps | Multi-region DR (single region only), PTU latency guarantees | Region outage = downtime; cost spike risk | Rich custom app, full Azure compliance posture |
| **C** | **Yes for ~30 clinicians** | 30-clinician license + standard integration | Scale beyond 30, premium analytics | Same vendor concentration; broader scope = bigger blast if vendor breach | Fast value, vendor-managed ops |

**Best $30k pick:** **SH at validated scale** for full capability; **B** if cloud strategy is mandated; **C** for 30-user pilot.

**Compliance gaps that emerge at $30k/mo:**
- SH: very few; this is the baseline budget for the validated architecture.
- A: scope-limited deployment fails to cover full PHI workforce; PHI sprawl risk if clinicians work outside the scoped Health Cloud.
- B: single-region = Â§164.308(a)(7)(ii)(B) DR weaker.
- C: data portability + termination planning often skipped at this tier.

---

### 14.2.3 $60,000 / month total budget

| Architecture | Feasible? | Configuration | Sacrifices | Risks Increased | Capabilities Gained |
|---|---|---|---|---|---|
| **SH** | **Excess capacity** | Validated architecture + secondary site + dedicated 24/7 SOC partner + quarterly external pentest + dedicated HIPAA Security Officer (1.0 FTE) + dedicated Compliance Officer (0.5 FTE) + air-gap LTO rotation bi-weekly + Vault Enterprise + Wazuh Enterprise | Almost nothing | â€” | Multi-site, true 24/7 SOC, premium support, regulatory grade |
| **A** | **Yes for ~70â€“90 users** | Full Health Cloud + Agentforce + Shield + MuleSoft + dedicated implementation partner + Salesforce Premier Success | Long-tail customization gaps remain | AppExchange and integration risk grows with scope | Mature Salesforce platform end-to-end |
| **B** | **Yes for full org** | 100 users, Azure OpenAI w/ PTU, multi-region DR, full Sentinel + Defender, App Service Premium / AKS, 1.5 FTE platform, 1.0 FTE app/ML | Limited (premium config) | Operational complexity remains high | Production-grade cloud-native PHI app |
| **C** | **Yes for ~50â€“60 clinicians at premium tier** | Premium tier (often single-tenant), advanced workflows, broader EHR scope | Scale beyond ~60 at premium | Bigger vendor concentration; bigger blast radius | Premium SLA, single-tenant isolation, advanced AI features |

**Best $60k pick:** **SH with multi-site + 24/7 SOC** for absolute control; **B with PTU** for cloud-strategy alignment.

**Compliance gaps that emerge at $60k/mo:** Almost none if architected correctly. **The remaining gap is configuration discipline**, which money cannot buy â€” it requires governance.

---

## 14.3 Hidden / Easy-to-Miss Costs

| Cost | SH | A | B | C |
|---|---|---|---|---|
| Annual external pentest | $25â€“60k | $20â€“40k | $25â€“60k | $15â€“30k (vendor-led + your org-side) |
| Backup tooling (Salesforce-specific) | â€” | $25â€“50k/yr | â€” | â€” |
| Sandbox/data-mask tooling | â€” | $15â€“40k/yr | â€” | â€” |
| Vendor risk re-assessment (annual) | $5k | $10k | $10k | **$25â€“50k** (vendor questionnaires, BAA review, sub-processor review) |
| Egress / data export fees | â€” | Limited | **Yes â€” significant for high-volume export** | Often metered |
| Premier / dedicated support | â€” | $50â€“150k/yr | Microsoft Unified ~5â€“8% of spend | Premium tier upsell |
| Termination-cost (data extraction + verified deletion) | $0 | **High** (proprietary data model) | Moderate (export to portable formats) | **Very high** (workflow lock-in) |
| Per-action AI overage | â€” | **Yes** | Consumption-based (already in line) | Sometimes |
| Compliance attestation fees | â€” | included in Shield | included | Pass-through varies |

---

## 14.4 Risk-Adjusted Cost Conclusion

When you adjust for:
- Likelihood of misconfiguration breach (highest in SaaS due to large customer-side surface)
- Likelihood of vendor concentration impact
- Likelihood of repricing / vendor exit
- Real labor costs (often under-counted in SaaS â€” you still need admins, integration, vendor management)

**Self-hosted is dramatically cheaper at scale and has the lowest risk-adjusted TCO _provided_ Care Indeed maintains the operational regime in [10](./10-Operational-Recommendations.md). If that operational discipline cannot be sustained, SaaS is cheaper because someone else carries operational labor â€” but never carries HIPAA accountability.**

---

## 14.5 Final Cost Reminder

> **Cost is the easiest thing in this analysis to get wrong.** SaaS line items look small until you add the customer-side admins, the vendor risk management, the data extraction tooling, the per-action AI fees, the integration partner, and the cost of a misconfiguration breach. **The only "free" thing in any architecture is the assumption that the BAA absolves you. It does not.**

