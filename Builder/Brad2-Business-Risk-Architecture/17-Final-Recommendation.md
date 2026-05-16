# 17 â€” Final Recommendation

**Audience:** Executive Sponsor, HIPAA Security Officer, Compliance Officer, Board.
**Inputs:** Files [01](./01-Executive-Security-Summary.md) â€“ [16](./16-Sprint-Plan-Project-Board.md).
**Decision posture:** Conditional Go on the **Self-Hosted Brad.pi architecture** as the primary system, with **narrow, well-bounded use of SaaS** for non-PHI or low-risk PHI workflows.

> **Single most important sentence in this document:**
> **In every architecture evaluated, Care Indeed remains the Covered Entity and bears full HIPAA accountability. SaaS reduces operational labor; it does not reduce regulatory liability. HIPAA-eligibility is a vendor checkbox; HIPAA compliance is an organizational practice.**

---

## 17.1 The Decision Frame

We evaluated four architectures against the workload (AI-assisted chart review, QAPI, PIP support, training):

- **SH** â€” Self-hosted Brad.pi (Linux + GPU + open-source LLM)
- **A** â€” Salesforce Health Cloud + Agentforce + Einstein Trust Layer
- **B** â€” Azure HIPAA Stack (Azure OpenAI + Health Data Services)
- **C** â€” Vertical Healthcare AI SaaS (Abridge / Notable / Innovaccer class)

We graded each on 27 dimensions ([13](./13-Comparison-Matrix.md)), modeled total cost and three budget tiers ([14](./14-Cost-Analysis.md)), and identified failure modes that produce direct liability ([12](./12-Liability-Failure-Analysis.md)).

---

## 17.2 Recommendation Matrix (by Optimization Goal)

| You optimize forâ€¦ | Recommended architecture | Rationale |
|---|---|---|
| **Maximum control over PHI** | **SH** | PHI never leaves the building; smallest external surface; no shared tenancy. |
| **Minimum *infrastructure* liability** | **C** (then A, then B) | Vendor owns most of the stack â€” but you still own configuration and use. |
| **Minimum *overall HIPAA* liability** | **None â€” equal across architectures** | HIPAA accountability does not transfer. Pretending it does is itself a liability. |
| **Fastest deployment** | **C** | Weeks if BAA, SSO, EHR scope, and offline workflow are pre-staged. |
| **Lowest 5-year cost at full scale** | **SH** | $1.35M vs. $4.8â€“7.4M for SaaS at 100 users. |
| **Lowest 1-year cost for small pilot** | **C** (small license count) | Variable cost scales with users; minimal up-front. |
| **Best fit when already a Salesforce shop** | **A** | Leverages existing identity, processes, admin skills. |
| **Best fit when already an Azure / Microsoft shop** | **B** | Leverages existing landing zone, identity, SOC. |
| **Best fit for documentation-heavy clinical workflows out of the box** | **C** | Vendors have invested years of clinical engineering. |
| **Best fit for chart review + QAPI + PIP with deep customization** | **SH** | Total control over model, prompts, evidence, audit. |

---

## 17.3 Final Recommendation for Care Indeed

### 17.3.1 Primary System â€” Self-Hosted Brad.pi (SH)

Care Indeed should **continue with SH** as the primary system for chart review, QAPI, PIP support, and policy training. Justification:

1. **Validated.** 247 simulated attack iterations, 100/100 final-pass run, 0 PHI exposure events ([06](./06-Breach-Simulation-100-Pass.md)).
2. **Lowest 5-yr TCO at scale** ([14 Â§14.1](./14-Cost-Analysis.md)).
3. **Smallest external attack surface** â€” single VPN endpoint, no shared tenancy, no per-action LLM pricing surprises.
4. **No vendor concentration**, no AppExchange / Marketplace supply chain, no abuse-monitoring opt-out negotiation.
5. **Customization required by clinical, QAPI, and PIP workflows is unconstrained** â€” no SaaS-imposed data model.
6. **Full evidentiary control** â€” every audit record produced and protected by Care Indeed.
7. **Already has Hardening Manifest, Pen Test Report, Operational Recommendations, and 100-pass evidence ready for auditor.**

**Conditions of the Go:** maintain the operational regime in [10](./10-Operational-Recommendations.md). If that operational regime cannot be sustained â€” particularly the 1.0 FTE DevSecOps + 0.25 FTE HIPAA Security Officer + quarterly drills â€” **the Go is revoked**, and Care Indeed must move to a SaaS architecture where vendor labor substitutes for the missing in-house capacity.

### 17.3.2 Secondary / Adjacent â€” Permissible SaaS Use

The following SaaS uses are **permitted** alongside SH, but only under defined conditions:

| Use case | Recommended | Conditions |
|---|---|---|
| Marketing / outreach (no PHI) | **C-equivalent or A's Marketing Cloud** | **No PHI ever**; Z-NPHI segregation maintained; allowlist-only contact lists |
| HR / payroll | Standard SaaS | Not PHI; standard SOC 2 + BAA where they touch contact info |
| Vendor risk management itself | A SaaS GRC (e.g., HyperProof, Drata, Vanta) | No PHI; for evidence collection only |
| EHR (already in production) | Existing vendor | Existing BAA; integrate as read-only into Brad |
| Future ambient documentation pilot | **C (Abridge / Notable class)** | Single-site pilot, BAA + PHI-use carve-out, audit export to Care Indeed SIEM, offline workflow documented, vendor risk re-assessed quarterly |

### 17.3.3 NOT Recommended

- **Migrating PHI workloads from SH to A, B, or C as a wholesale replacement.** It would **increase** 5-year cost, increase customization friction, and would not reduce HIPAA accountability.
- **Putting PHI into Salesforce Marketing Cloud, Microsoft 365 Copilot, or any non-HIPAA-eligible SKU** â€” even temporarily, even "just to test."
- **Using AppExchange / Marketplace AI add-ons that touch PHI without independent BAAs and security review.**
- **Using vendor preview / lab features for PHI workloads.**
- **Allowing PHI to seed any non-prod environment** in any architecture.

---

## 17.4 Hybrid Recommendation (if pursued)

If Care Indeed elects a **hybrid** posture in the future, the only defensible pattern is:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Self-Hosted Brad.pi (PHI side)     â”‚    â”‚  SaaS Z-NPHI side                â”‚
â”‚                                      â”‚    â”‚                                  â”‚
â”‚  - Chart review                      â”‚    â”‚  - Marketing automation          â”‚
â”‚  - QAPI, PIP                         â”‚    â”‚  - Vendor risk / GRC tooling     â”‚
â”‚  - Training (PHI-bearing)            â”‚    â”‚  - Public training (no PHI)      â”‚
â”‚  - Audit, SIEM, backup               â”‚    â”‚  - Comms / CMS                   â”‚
â”‚                                      â”‚    â”‚                                  â”‚
â”‚  Strict egress DROP except:          â”‚    â”‚  Strict ingress: no PHI accepted â”‚
â”‚  - audit forwarding                  â”‚    â”‚  DLP at boundary                 â”‚
â”‚  - signed model mirror               â”‚    â”‚                                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                  â”‚                                          â”‚
                  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ DLP-enforced gap â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                  (No PHI crosses; no SaaS reaches into PHI side)
```

A **single-site ambient documentation pilot using a Vertical SaaS (C)** can sit *outside* this pattern as its own tenancy with an EHR feed, but must:
- Have its own BAA + PHI-use carve-out
- Export audit to Care Indeed SIEM
- Not be wired into Brad's PHI plane
- Be subject to quarterly vendor risk review
- Have a documented offline workflow

---

## 17.5 What Would Change the Recommendation

The recommendation **flips to SaaS-first** only if **any** of these are true:

| Condition | Effect |
|---|---|
| Care Indeed cannot fund/staff 1.0 FTE DevSecOps + 0.25 FTE HSO | SH operationally non-viable â†’ recommend B (cloud-native) or C (vertical) |
| Multi-state / multi-region growth requires elasticity within 12 months | Tilts toward B with PTU + region failover |
| Clinical workflow needs ambient documentation as primary value driver | Tilts toward C for that workflow only (still hybrid w/ SH for QAPI/PIP) |
| Care Indeed becomes a Salesforce-first organization | A becomes the lower-friction choice for CRM-adjacent PHI workflows |
| External investor / acquirer requires SOC 2 Type II inheritance from a hyperscaler | B's inherited attestations may be operationally easier than producing your own |

The recommendation **never** flips because of any of these:

- "The vendor handles HIPAA for us." â€” False. The vendor handles their share.
- "BAA = we're covered." â€” False. BAA is necessary, not sufficient.
- "Vendor breach is the vendor's problem." â€” False. Your patients' breach notice is yours to send.
- "SaaS is cheaper." â€” False at scale; even when true, it does not change accountability.
- "If they're HIPAA-eligible, it's HIPAA-compliant." â€” False. Eligibility is a checkbox; compliance is a configuration + practice.

---

## 17.6 Decision Summary

| | Decision |
|---|---|
| **Primary system for PHI AI workflows** | **Self-Hosted Brad.pi (SH)** â€” Conditional Go |
| **Conditions of the Go** | Maintain operational regime in [10](./10-Operational-Recommendations.md): 1.0 FTE DevSecOps, 0.25 FTE HIPAA Security Officer, quarterly drills, monthly access reviews, annual external pentest, HSO sign-off on every change |
| **Permitted SaaS adjacencies** | Marketing (no PHI) on Z-NPHI; HR/Payroll; GRC tooling; existing EHR; optional single-site ambient documentation pilot (C) under strict conditions |
| **Prohibited** | Wholesale migration of PHI workloads to SaaS; PHI in non-HIPAA-eligible SKUs; AppExchange/Marketplace AI touching PHI without independent BAA + review; preview/lab features for PHI; real PHI in non-prod |
| **Re-evaluation cadence** | Annually, or upon any material change (vendor, regulator, scope, talent) |
| **Final accountable role** | HIPAA Security Officer signs off; Executive Sponsor approves; Board informed |

---

## 17.7 Closing Statement

> Across four architectures, twenty-seven dimensions, four budget tiers, and 247 simulated attacks, the conclusion is unambiguous:
>
> **The hardest part of HIPAA compliance is not technology. It is the discipline to configure it correctly, the integrity to operate it honestly, the courage to log every action, and the humility to accept that no vendor can carry that responsibility for you.**
>
> Care Indeed has built â€” and validated â€” a system that earns the right to that responsibility. Maintaining that right is a daily practice, not a quarterly project.

â€” End of Documentation Series â€”

