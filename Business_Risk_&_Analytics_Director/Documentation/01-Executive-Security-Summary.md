# 01 — Executive Security Summary (Brad 1.0 LIVE)

**System:** Brad 1.0 — Business Risk & Analytics Director (currently in production use)
**Owner:** Care Indeed
**Classification:** PHI-bearing healthcare AI workload
**Assessment Date:** 2026-04-21
**Assessment Type:** Observation + adversarial simulation. **Recommendations only. No changes applied.**

---

## 1.1 Overall Security Posture

**Posture: AT RISK — NO-GO for unrestricted PHI handling**

Brad 1.0 is operating as a **single-host, operator-workstation deployment** with **GPU/VRAM-resident model inference**, locally orchestrated services, and a remote-access pattern that depends on the operator's workstation security boundary. The simulation loop did **not** reach 100 consecutive passes; it terminated early on PHI-exposure-class findings that are inherent to the current single-tenant, single-workstation topology.

| Metric | Result |
|---|---|
| Overall posture | **AT RISK** |
| PHI exposure risk (residual, unremediated) | **High** |
| Total simulated iterations | 138 |
| Restart events | 4 |
| Longest consecutive pass streak | **9** (target: 100) |
| Critical findings (open) | **7** |
| High findings (open) | **11** |
| Medium findings (open) | **14** |
| Go / No-Go recommendation | **NO-GO** for unrestricted production PHI use |

Detailed findings: see [09 Penetration Test Report](./09-Penetration-Test-Report.md). Iteration evidence: see [06 Breach Simulation](./06-Breach-Simulation-100-Pass.md) and [07 Failure & Restart Log](./07-Failure-Restart-Log.md).

---

## 1.2 What Brad 1.0 Currently Is (As-Observed)

- **Hosted on a workstation-class machine** ("operator's workstation"; same device used for general work tasks).
- **GPU inference** is local; model weights and inference state reside in **VRAM** on the same physical GPU(s) used for other potentially non-PHI activities (browser GPU acceleration, etc.).
- **Services are locally orchestrated** (Node/Vite dev server + supporting processes) — see workspace evidence (`npm run dev` in the recent terminal history).
- **No formal zone segmentation** (no separate inference host, no separate audit/logging plane, no separate admin jump host).
- **No immutable / WORM audit pipeline** observed.
- **No mTLS east-west** between local services.
- **Secrets** (Google Calendar service account, etc.) appear as JSON files on disk in the working tree (e.g., `Builder/orbital-stage-443721-v1-99d78d776418.json`).
- **Remote access pattern** appears to depend on workstation availability / tunneling rather than a hardened VPN appliance + posture-checked endpoints.

This is a **valid early-stage operator deployment** — but it is **not** a HIPAA-defensible production posture for unrestricted PHI throughput.

---

## 1.3 Top Critical Findings (Headline)

These are the findings that, individually, constitute a STOP condition for unrestricted PHI use. Full detail and exploit reasoning in [09](./09-Penetration-Test-Report.md).

| # | Finding | Why Critical |
|---|---|---|
| C-01 | **VRAM data remanence on shared GPU** | Prior session PHI may persist in GPU memory across user sessions; no per-session worker recycle / memset hygiene was identified. |
| C-02 | **Workstation co-tenancy** | The host runs general-purpose workloads (browser, dev tools). Any compromise of those is a direct PHI compromise. No host segmentation. |
| C-03 | **Plaintext service-account JSON on disk in repo tree** | A Google service account key is present in `Builder/`. If the workspace is ever shared, synced, or backed up to a non-PHI destination, the credential is leaked. |
| C-04 | **No immutable/append-only audit trail** | A privileged user (or any process running as that user) can delete or alter logs after-the-fact. HIPAA §164.312(b) and (c) cannot be defensibly attested. |
| C-05 | **No two-person rule for chart-affecting actions** | If Brad 1.0 produces or executes chart write-backs, PIPs, or corrective actions, there is no enforced second-approver gate. |
| C-06 | **No mTLS / no service-to-service authentication** between local processes | Any local process on the workstation can speak to the model/inference endpoint. |
| C-07 | **No formal egress restriction from inference path** | Prompt-injection-driven exfiltration (e.g., LLM emits PHI into a tool call or HTTP fetch) is not bounded by an egress allowlist. |

---

## 1.4 PHI Exposure Risk Statement (Honest)

> **PHI exposure risk in the current Brad 1.0 deployment is HIGH.** The platform delivers real clinical value, but it does so on a topology that does not yet meet the standard a HIPAA Security Rule auditor or a SOC 2 Type II assessor would accept for unrestricted PHI handling. The single most material risks are (a) **GPU/VRAM remanence on a shared workstation GPU**, (b) **co-tenancy of PHI workload with general-purpose workstation activity**, and (c) **mutable, operator-deletable audit logs**.

This statement reflects observation and reasoning only; it does **not** assert any actual breach event has occurred.

---

## 1.5 Recommended Interim Operating Mode (RECOMMENDATION ONLY — NOT IMPLEMENTED)

If Care Indeed wishes to keep Brad 1.0 in service while Brad 2.0 (or equivalent hardened topology) is stood up, the following **constrained interim operating mode** is recommended for leadership consideration. **Nothing in this section has been implemented or enforced by this assessment.**

1. **Restrict to de-identified or synthetic data** until the C-01 through C-07 findings are addressed, OR
2. If real PHI must be processed:
   - Limit Brad 1.0 to **read-only summarization** workflows (no write-back to charts, no automated PIP execution).
   - Require **named, individual operator** sessions; no shared workstation use.
   - Require **documented manual log preservation** at end of each session (operator copies `dev` logs and any prompt/output records to a sealed location and signs an attestation).
   - Require **manual second-person review** of any output before it influences a clinical or compliance decision.
   - **Disable any direct outbound network access** from the inference process to the public internet for the duration of PHI sessions (egress allowlist at the workstation firewall).
   - **Remove the `Builder/orbital-stage-443721-v1-99d78d776418.json` service-account key from the working tree** and rotate the credential; store the new credential in a secrets manager. *(This is the single highest-leverage recommendation that requires no architectural change.)*
   - Establish a **written incident escalation path** specific to Brad 1.0.

These are **conditions a reasonable HIPAA Security Officer would impose** on an interim live deployment of this class of system. They are presented as recommendations for leadership; they are not changes made by this assessment.

---

## 1.6 Recommended Path to GO

The defensible production target is the **Brad 2.0 architecture** documented in `Business Risk & Analytics Director Brad2.0/Documentation/`. The deltas Brad 1.0 must close to reach that target are enumerated in [05](./05-Hardening-Blueprint.md) and [08](./08-Final-Hardening-Manifest.md).

Headline gap categories:
- Move inference off the operator workstation onto a dedicated GPU host with no co-tenancy.
- Implement per-session worker recycle + VRAM hygiene.
- Stand up a WORM audit pipeline with hash-chain integrity.
- Enforce two-person approval for any chart-affecting / PIP / corrective action operation.
- Replace ambient remote access with WireGuard + FIDO2 + posture-checked endpoints.
- Move all secrets (starting with the service-account JSON) into Vault or equivalent.
- Implement deny-by-default egress on the inference path.

---

## 1.7 Final Statement

> Brad 1.0 in its **current observed configuration** does **not meet** the technical or architectural bar required by HIPAA Security Rule §164.308, §164.310, §164.312 or SOC 2 Trust Services Criteria for Security and Confidentiality for unrestricted PHI use. The simulation program was unable to achieve 100 consecutive passes; the loop terminated repeatedly on PHI-exposure-class findings inherent to the workstation-hosted, VRAM-shared topology. The recommendation is **NO-GO for unrestricted PHI production** until the critical findings in §1.3 are addressed, with an optional constrained interim operating mode described in §1.5 if leadership chooses to keep the system in service.

This assessment is **recommendation-only**. No fixes were applied. No configurations were changed. No source code was modified.

Signed (logical):
- Lead Security Architect / Red Team Lead — Brad 1.0 Assessment
- For review by: HIPAA Security Officer, Care Indeed Executive Leadership
