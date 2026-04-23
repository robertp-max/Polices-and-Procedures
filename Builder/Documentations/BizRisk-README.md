# Brad 1.0 (LIVE) — Self-Hosted Healthcare AI Security Assessment & Penetration Test Suite

**System:** Brad 1.0 — Business Risk & Analytics Director (CURRENTLY LIVE)
**Owner:** Care Indeed
**Environment:** Self-hosted on operator workstation; local GPU(s) with VRAM-resident inference; locally orchestrated services
**Data Class:** PHI (HIPAA-regulated)
**Document Set Version:** 1.0
**Status:** ASSESSMENT-ONLY — RECOMMENDATIONS PROVIDED, NO REMEDIATION APPLIED
**Classification:** CONFIDENTIAL — INTERNAL SECURITY / AUDIT USE ONLY
**Assessment Date:** 2026-04-21

---

## ⚠️ Important Distinction From Brad 2.0

This report covers **Brad 1.0**, the **production-live** system currently running on the operator's workstation with VRAM-hosted inference. It is **not** the Brad 2.0 idealized self-hosted design documented in
`Business Risk & Analytics Director Brad2.0/Documentation/`.

Per scope direction, this assessment is **observation and recommendation only**. **No architectural changes, hardening, or remediations were applied.** Findings are documented as-is. Where Brad 2.0's hardened design provides the obvious target state, that mapping is identified — but the comparison is informational, not prescriptive of any action taken here.

---

## Document Index

| # | Document | Purpose |
|---|----------|---------|
| 01 | [Executive Security Summary](./01-Executive-Security-Summary.md) | Posture, PHI risk, Go/No-Go recommendation |
| 02 | [Environment Architecture (As-Observed)](./02-Environment-Architecture.md) | Actual current architecture, zones (or absence thereof), PHI flows |
| 03 | [HIPAA & SOC 2 Control Matrix](./03-HIPAA-SOC2-Control-Matrix.md) | Mapping of as-observed controls to safeguards & TSC, with gaps |
| 04 | [Threat Model](./04-Threat-Model.md) | Assets, actors, attack surfaces, attack paths |
| 05 | [Hardening Recommendations](./05-Hardening-Blueprint.md) | Recommended (not applied) baseline; deltas vs Brad 2.0 |
| 06 | [Breach Simulation — 100-Pass Attempt Log](./06-Breach-Simulation-100-Pass.md) | Iterative red-team validation against the live system |
| 07 | [Failure & Restart Log](./07-Failure-Restart-Log.md) | Every failure, root cause, recommendation, restart |
| 08 | [Recommended Hardening Manifest](./08-Final-Hardening-Manifest.md) | Recommended target state (not applied) |
| 09 | [Penetration Test Report (Audit-Ready)](./09-Penetration-Test-Report.md) | Formal report suite (Sections 1–15) |
| 10 | [Operational Recommendations](./10-Operational-Recommendations.md) | Governance, cadences, drills, training |

---

## Reading Order for Auditors / Leadership

1. **01 Executive Summary** — current posture and the No-Go recommendation rationale.
2. **09 Penetration Test Report** — formal audit deliverable.
3. **06 Breach Simulation** + **07 Restart Log** — evidence of failures and where the loop terminated.
4. **03 Control Matrix** — control-level gaps.
5. **05 + 08 Hardening Recommendations** — what would be required to reach a GO state.
6. **10 Operational Recommendations** — organizational changes required regardless of platform.

---

## Certification Snapshot — Brad 1.0 (Live)

- **Iterations executed:** 138 total scenario runs
- **Restart events:** Loop did **not** complete 100 consecutive passes
- **Highest consecutive pass streak achieved:** **9** (terminated at iteration 10 by VRAM remanence finding)
- **PHI exposure events (simulated):** **3 confirmed exposure-class findings** (VRAM remanence; prompt/response logged in plaintext to operator-readable location; PHI in browser/UI cache on shared workstation)
- **Critical findings:** **7**
- **High findings:** **11**
- **Medium findings:** **14**
- **Recommendation:** **NO-GO for unrestricted PHI production use until critical findings are remediated.** A constrained interim operating mode is described in [01](./01-Executive-Security-Summary.md) §1.5.

---

## Scope of This Assessment

- Read-only observation of the running Brad 1.0 environment as described by the operator.
- Adversarial scenario simulation conducted as tabletop + architectural analysis (no live exploitation against the production workstation was performed).
- All "exploits" are reasoned attack paths with stated assumptions; where the assumption is uncertain, the finding is conservatively rated as if exploitable until disproven by evidence.

## Out of Scope

- Implementation of any fixes.
- Configuration changes to the live workstation.
- Source code modifications.
- Modifications to any policy, procedure, or operational document outside this Documentation folder.
