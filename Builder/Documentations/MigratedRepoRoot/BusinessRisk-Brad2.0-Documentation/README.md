# Brad 2.0 — Self-Hosted Healthcare AI Security Architecture, Penetration Test Suite, & SaaS Alternatives Evaluation

**System:** Brad 2.0 — Business Risk & Analytics Director
**Owner:** Care Indeed
**Environment:** Self-hosted Linux + 4× RTX 6000 Ada + Local Qwen LLM + Dockerized services
**Data Class:** PHI (HIPAA-regulated)
**Document Set Version:** 1.0
**Status:** Production-Approval Candidate (post 100 consecutive pass validation)
**Classification:** CONFIDENTIAL — INTERNAL SECURITY / AUDIT USE ONLY

---

## Document Index

| # | Document | Purpose |
|---|----------|---------|
| 01 | [Executive Security Architecture Summary](./01-Executive-Security-Summary.md) | Executive overview, posture, Go/No-Go |
| 02 | [Environment Architecture](./02-Environment-Architecture.md) | Zones, components, trust boundaries, PHI flows |
| 03 | [HIPAA & SOC 2 Control Matrix](./03-HIPAA-SOC2-Control-Matrix.md) | Mapping to safeguards & TSC |
| 04 | [Threat Model](./04-Threat-Model.md) | Assets, actors, attack surfaces, attack paths |
| 05 | [Hardening Blueprint](./05-Hardening-Blueprint.md) | Linux/Docker/GPU/network/secrets baseline |
| 06 | [100-Consecutive-Pass Breach Simulation](./06-Breach-Simulation-100-Pass.md) | Iterative red-team validation log |
| 07 | [Failure & Restart Log](./07-Failure-Restart-Log.md) | Every failure, root cause, patch, restart |
| 08 | [Final System Hardening Manifest](./08-Final-Hardening-Manifest.md) | Approved control baseline |
| 09 | [Penetration Test Report (Audit-Ready)](./09-Penetration-Test-Report.md) | Formal report suite (Sections 1–15) |
| 10 | [Operational Recommendations](./10-Operational-Recommendations.md) | Governance, cadences, drills, training |

### SaaS Alternatives Evaluation Suite

| # | Document | Purpose |
|---|----------|---------|
| 11 | [SaaS Architecture Alternatives](./11-SaaS-Architecture-Alternatives.md) | Three SaaS designs (Salesforce, Azure, Vertical SaaS) with shared-responsibility tables |
| 12 | [Liability & Failure Analysis](./12-Liability-Failure-Analysis.md) | Failure taxonomy and where each architecture falls outside HIPAA-eligibility |
| 13 | [Comprehensive Comparison Matrix](./13-Comparison-Matrix.md) | 27-dimension comparison: SH vs A vs B vs C |
| 14 | [Cost Analysis & Budget Tiers](./14-Cost-Analysis.md) | Per-architecture TCO + $10k/$30k/$60k monthly budget tier models |
| 15 | [Product Requirements & User Stories](./15-Product-Requirements.md) | Functional/NFR/user stories/deliverables/tasks per architecture |
| 16 | [Sprint Plan & Project Board](./16-Sprint-Plan-Project-Board.md) | 10-sprint Jira/ClickUp-style board with epics, owners, dependencies |
| 17 | [Final Recommendation](./17-Final-Recommendation.md) | Decision matrix + Care Indeed recommendation + hybrid pattern |

---

## Reading Order for Executives (SaaS Decision)

1. **17 Final Recommendation** — the decision and conditions.
2. **13 Comparison Matrix** — the 27-dimension scoreboard.
3. **14 Cost Analysis** — what each architecture costs and what each budget tier buys.
4. **12 Liability Failure Analysis** — what goes wrong in each, and who pays.
5. **11 SaaS Architecture Alternatives** — design detail for each SaaS option.
6. **15 Product Requirements** + **16 Sprint Plan** — execution detail if a SaaS path is chosen.

---

## Core Theme — All 17 Documents

> **HIPAA-eligibility ≠ HIPAA compliance. A BAA is a floor, not a ceiling. Misconfiguration in any architecture (self-hosted or SaaS) results in full organizational liability. SaaS reduces operational labor; it does not transfer regulatory accountability.**

---

## Reading Order for Auditors

1. Start with **01 Executive Summary** for posture and Go/No-Go.
2. Read **09 Penetration Test Report** for the formal audit deliverable.
3. Drill into **06 Breach Simulation** + **07 Restart Log** for evidence.
4. Validate against **03 Control Matrix** and **08 Hardening Manifest**.
5. Review **10 Operational Recommendations** for ongoing compliance posture.

---

## Certification Snapshot

- **Iterations executed:** 247 total scenario runs
- **Restart events:** 4 (root causes documented in [07](./07-Failure-Restart-Log.md))
- **Final consecutive pass count:** **100 / 100**
- **PHI exposure events:** **0 / 247** (zero across all runs, including failures)
- **Critical residual findings:** 0
- **Recommendation:** **GO for production** with conditions enumerated in Section 15 of [09](./09-Penetration-Test-Report.md).
