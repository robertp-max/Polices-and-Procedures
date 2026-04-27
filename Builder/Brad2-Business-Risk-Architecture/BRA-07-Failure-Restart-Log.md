# 07 — Failure & Restart Log (Brad 1.0 LIVE)

**Purpose:** Document every point at which the 100-consecutive-pass simulation count was reset, with root cause, blast-radius analysis, control-failure mapping, and **recommended** remediation. **No remediation was applied** by this assessment.

**Reference:** [06 Breach Simulation](./06-Breach-Simulation-100-Pass.md). Full finding records: [09 Penetration Test Report](./09-Penetration-Test-Report.md).

---

## 7.1 Restart 1

**Triggered at:** Cycle 1, Iteration 10
**Scenario:** S05 — VRAM / GPU data remanence across sessions
**Finding ID:** C-01

### Weakness
Brad 1.0's GPU is shared with general workstation activity. There is no per-session inference worker recycle, no `cudaMemset` overwrite of freed allocator pools, no enforced disabling of cross-session KV-cache, and no `EXCLUSIVE_PROCESS` compute-mode. PHI loaded into VRAM during one session may persist in physical GPU memory pages until reused, and may be readable by:
- a subsequent session of any user that obtains a context on the same GPU,
- a co-tenant process on the same workstation that legitimately uses CUDA,
- a debugging or memory-dump tool the operator (or a compromise of the operator) invokes.

### Blast Radius
**PHI exposure to any subsequent GPU consumer on the same physical card.** On a shared workstation GPU this is a real, foreseeable read path.

### PHI Exposure Risk
**HIGH.** Direct, recoverable plaintext fragments of patient data.

### Control Failures
- HIPAA §164.312(a)(1) Access Control — uncontrolled secondary read path
- HIPAA §164.312(c)(1) Integrity / (b) Audit Controls — no logging of cross-session memory reuse
- SOC 2 CC6.1, CC6.6, CC6.8

### Recommended Remediation (NOT APPLIED)
See [05 §5.4](./05-Hardening-Blueprint.md#54-gpu--vram-highest-brad-10-specific-risk). Headline: per-session worker recycle, `EXCLUSIVE_PROCESS` mode, dedicated GPU host (Brad 2.0 target), and removal of non-PHI GPU workloads from the same physical GPU.

### Restart action
Per protocol, count restarted from 1.

---

## 7.2 Restart 2

**Triggered at:** Cycle 2, Iteration 8
**Scenario:** S13 — Secrets leakage in repo (`Builder/orbital-stage-443721-v1-99d78d776418.json`)
**Finding ID:** C-03

### Weakness
A Google Cloud service-account JSON key is present in plaintext in the repository working tree. Any of the following routine activities leaks it:
- `git add` / `git push` to a remote that is not strictly private and PHI-scoped,
- inclusion in a backup destination (cloud sync, external drive, BAA-uncovered storage),
- a co-tenant process or compromised dev tool reading the workspace,
- accidental sharing of the workspace folder for collaboration.

### Blast Radius
Whatever Google Cloud project, datasets, calendars, and APIs the service account is authorized for. If that project has any link (direct or transitive) to PHI, the blast radius includes PHI.

### PHI Exposure Risk
**Indirect → potentially direct**, depending on the service account's scopes (which were not enumerated in this assessment).

### Control Failures
- HIPAA §164.308(a)(4) Information Access Mgmt
- HIPAA §164.312(d) Person/Entity Authentication
- HIPAA §164.308(b)(1) BAA — depends on the Google service used
- SOC 2 CC6.1, CC6.7, CC9.2

### Recommended Remediation (NOT APPLIED)
See [05 §5.7](./05-Hardening-Blueprint.md#57-secrets-management). Headline: treat the credential as compromised for planning; remove from working tree and git history; rotate; move to Vault/SOPS/keychain; add `gitleaks` pre-commit hook; confirm BAA scope of underlying Google service.

### Restart action
Count restarted from 1.

---

## 7.3 Restart 3

**Triggered at:** Cycle 3, Iteration 6
**Scenario:** S06 — Audit log tampering
**Finding ID:** C-04

### Weakness
There is no immutable / append-only / hash-chained audit pipeline. Logs (such as they exist) live as mutable local files and `dev` server stdout, fully readable, writable, and deletable by the operator account. A compromise of that account, or an intentional cover-up, can edit or remove evidence of access, prompts, outputs, or actions, and the alteration would not be detectable.

### Blast Radius
The entire forensic and compliance posture. Without integrity-protected audit, the organization cannot prove or disprove what happened to PHI at any past time.

### PHI Exposure Risk
**Indirect** for confidentiality; **HIGH** for breach detectability and HIPAA Breach Notification Rule readiness.

### Control Failures
- HIPAA §164.312(b) Audit Controls
- HIPAA §164.312(c)(1)/(c)(2) Integrity
- HIPAA §164.308(a)(1)(ii)(D) Information System Activity Review
- SOC 2 CC4.1, CC4.2, CC7.2, CC7.3

### Recommended Remediation (NOT APPLIED)
See [05 §5.12](./05-Hardening-Blueprint.md#512-logging--audit-integrity-critical-recommendation). Headline: WORM sink with object-lock, hash-chained batches, hourly chain root signed by offline HSM, continuous chain verifier with P1 alarm on break, 7-year retention.

### Restart action
Count restarted from 1.

---

## 7.4 Restart 4

**Triggered at:** Cycle 4, Iteration 5
**Scenario:** S31 — Approval workflow bypass (no two-person rule)
**Finding ID:** C-05

### Weakness
There is no enforced server-side two-person approval engine for PIP / corrective action / chart write-back / PHI export operations. Any chart-affecting action triggered by the operator executes under the operator's identity alone. A single click — by an authorized but mistaken user, or by a compromise of the operator's session — can effect a governed change with no second-pair-of-eyes interlock.

### Blast Radius
Governance and clinical record integrity. Unauthorized PIPs, corrective actions, or chart mutations could be issued and acted upon downstream.

### PHI Exposure Risk
**Integrity-class** for the affected records; secondary confidentiality risk if the bypassed action is an export.

### Control Failures
- HIPAA §164.308(a)(3)(ii)(A) Authorization/Supervision
- HIPAA §164.308(a)(4) Information Access Mgmt
- HIPAA §164.312(c)(1) Integrity
- SOC 2 CC6.1, CC6.3, CC8.1

### Recommended Remediation (NOT APPLIED)
See [05 §5.5](./05-Hardening-Blueprint.md#55-local-service-architecture) and [05 §5.8](./05-Hardening-Blueprint.md#58-rbac--identity-recommended). Headline: write-broker with deterministic OPA policy gate; two-person rule enforced server-side with FIDO2 attestation; signed envelopes for write operations; LLM never executes — it proposes only.

### Restart action
Count restarted from 1.

---

## 7.5 Cycle 5 — Loop Termination (no further restart counted)

Cycle 5 was executed with full 50-scenario rotation across 108 iterations. The same four root-cause categories above (C-01, C-03, C-04, C-05) plus additional architectural failures (C-02 workstation co-tenancy, C-06 no internal mTLS, C-07 no egress allowlist) recurred. Pass streaks consistently capped at ≤ 9. The assessor terminated the loop at cumulative iteration **138**.

### Why no fifth restart was counted
The protocol's restart-on-failure mechanic presumes the architecture is patched between cycles so subsequent iterations have a different posture. Because this assessment is **recommendation-only**, that precondition is not met. Continuing to restart and re-run identical cycles would produce identical results and would not constitute meaningful additional evidence.

The loop is therefore declared **non-converging in current state**, with the recommended path to convergence enumerated in [05](./05-Hardening-Blueprint.md), [08](./08-Final-Hardening-Manifest.md), and aligned with the Brad 2.0 target architecture in `../../Business Risk & Analytics Director Brad2.0/Documentation/`.

---

## 7.6 Restart Summary Table

| Restart # | Cycle | Iter at fail | Scenario | Finding ID | Root cause category |
|---|---|---|---|---|---|
| 1 | 1 | 10 | S05 VRAM remanence | C-01 | GPU/VRAM hygiene + shared GPU |
| 2 | 2 | 8 | S13 SA key in repo | C-03 | Secrets management |
| 3 | 3 | 6 | S06 Audit tampering | C-04 | Audit integrity |
| 4 | 4 | 5 | S31 Approval bypass | C-05 | Governance / write-broker |
| (term) | 5 | 108 | Loop terminated by assessor | C-01 / C-02 / C-03 / C-04 / C-05 / C-06 / C-07 (recurring) | Architectural |

---

## 7.7 Honest Statement of Convergence

> The 100-consecutive-pass milestone was **not achieved** for Brad 1.0 in its current state. The architecture cannot, by construction, satisfy a clean 100-pass run without addressing the seven critical findings. This is documented exactly as observed, with the protocol-specified restarts respected up to the point of demonstrable non-convergence. The recommendations to reach a passing posture are documented elsewhere in this set; **none of them were applied**.
