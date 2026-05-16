# 09 â€” Penetration Test Report (Audit-Ready, Brad 1.0 LIVE)

**System:** Brad 1.0 â€” Business Risk & Analytics Director (currently in production)
**Owner:** Care Indeed
**Assessment Date:** 2026-04-21
**Assessment Type:** Architectural pen-test + adversarial scenario simulation, **observation-only**.
**Engagement scope rule:** **Recommendations only. No remediation, no configuration changes, no code changes were performed.**
**Audience:** HIPAA auditors, SOC 2 assessors, Care Indeed Governing Body and Executive Leadership.

---

## SECTION 1 â€” Executive Security Summary

- **Overall security posture:** **AT RISK**
- **PHI exposure risk level (residual, unremediated):** **High**
- **Total test iterations executed:** **138**
- **100 consecutive validated passes achieved?** **NO.** Longest streak: **9**.
- **Restart events:** **4**
- **Vulnerabilities identified:** **7 Critical, 11 High, 14 Medium** (32 total)
- **Vulnerabilities resolved by this engagement:** **0** (per scope; recommendations only)
- **Final Go / No-Go recommendation:** **NO-GO for unrestricted PHI production use** until Critical findings are addressed. An optional constrained interim operating mode is described in [01](./01-Executive-Security-Summary.md) Â§1.5 and reproduced in Â§15 below.

---

## SECTION 2 â€” Scope & Methodology

### 2.1 Systems Tested
- Brad 1.0 deployment as observed: operator workstation, local Node/Vite dev server, local LLM inference (VRAM-resident on workstation GPU), local file storage, repository working tree.

### 2.2 In-Scope
- Architecture and data-flow analysis.
- Adversarial scenario simulation (tabletop + reasoning against the as-observed topology).
- Control mapping to HIPAA Security Rule and SOC 2 Trust Services Criteria.

### 2.3 Out-of-Scope
- Any modification to the live system, codebase, configuration, or operating environment.
- Live exploitation against the production workstation.
- External infrastructure not under Care Indeed's direct control.
- Source code line-by-line review (architectural analysis only).

### 2.4 Assumptions
- The operator's workstation has FDE enabled (assumed; **recommend confirming**).
- The Google service-account key found in `Builder/orbital-stage-443721-v1-99d78d776418.json` represents a real credential authorized in a Google Cloud project (treated conservatively as if exploitable).
- Logs (such as they exist) are mutable to the operator account; no WORM sink was observed.

### 2.5 Test Approach
- Red-team scenario simulation against the as-observed topology (50-scenario library, see [06 Â§6.1](./06-Breach-Simulation-100-Pass.md#61-scenario-library-sampled-from-these-in-shuffled-order-each-cycle)).
- Iterative consecutive-pass loop with restart-on-failure protocol (see [06](./06-Breach-Simulation-100-Pass.md) and [07](./07-Failure-Restart-Log.md)).
- Constructive attacker reasoning: where evidence is uncertain, the conservative interpretation is taken.

### 2.6 Constraints
- Self-hosted, single-workstation topology.
- PHI sensitivity prohibits live exploitation.
- No remediation budget for this engagement; recommendations only.

---

## SECTION 3 â€” System Overview

See [02 Environment Architecture](./02-Environment-Architecture.md) for full detail.

Summary:
- Single-host operator workstation.
- One trust zone (the operator's user account).
- Local UI + app + LLM inference, all sharing the operator's identity and resources.
- GPU shared with general workstation activity.
- Mutable local logs; secrets present in plaintext on disk in repo path.
- Remote access depends on operator workstation availability and tunnel configuration.

---

## SECTION 4 â€” Threat Model

Full detail: [04 Threat Model](./04-Threat-Model.md).

Headline crown-jewel assets: PHI in active sessions, PHI in corpora, audit traces, Google service-account JSON, tunnel/remote-access keys, LLM model state in VRAM, backups (if any).

Headline actors: compromised remote endpoint, malicious/negligent insider, supply-chain attacker (npm / model), co-tenant process on the workstation.

Top attack paths (full ranking in [04 Â§4.4](./04-Threat-Model.md#44-high-risk-attack-paths-brad-10)): operator phishing â†’ workstation token theft, malicious browser extension reads UI DOM, npm supply-chain â†’ operator scope, accidental git push of SA key, prompt injection â†’ exfil via unbounded egress, VRAM remanence across sessions, co-tenant pivot to local inference endpoint.

---

## SECTION 5 â€” Penetration Test Scenario Matrix

Full library of 50 scenarios in [06 Â§6.1](./06-Breach-Simulation-100-Pass.md#61-scenario-library-sampled-from-these-in-shuffled-order-each-cycle). Each scenario is defined with:
- attack vector,
- target asset/component,
- expected control (against the Brad.pi target baseline) and observed control (in Brad 1.0).

Scenario categories include: tunnel/MFA bypass, container escape, exposed loopback services, **VRAM remanence**, **audit tampering**, stolen credentials, insider abuse, **secrets leakage in repo**, insecure docker configs, lateral movement, **PHI leakage via logs/temp/cache/swap**, insecure backups, ransomware, reverse-proxy / dev-server misconfig, role bypass, **approval workflow bypass**, **prompt injection / data exfiltration**, API abuse / queue exhaustion, **non-PHI module isolation failure**, plus Brad-1.0-specific surfaces (browser extension, cloud sync of working tree, screen-share exposure, source-map leak).

---

## SECTION 6 â€” Exploit Simulation Log

Full per-iteration log in [06 Breach Simulation](./06-Breach-Simulation-100-Pass.md).

Aggregate:

| Cycle | Iterations | First-FAIL Iteration | Failing scenario | Detection triggered? | Mitigation triggered? |
|---|---|---|---|---|---|
| 1 | 10 | 10 | S05 VRAM remanence | NO (no GPU memory monitoring) | NO |
| 2 | 8 | 8 | S13 SA key in repo | NO | NO |
| 3 | 6 | 6 | S06 Audit tampering | NO (no chain verifier) | NO |
| 4 | 5 | 5 | S31 Approval bypass | NO | NO |
| 5 | 108 | recurring across rotation | C-01..C-07 categories | NO | NO |
| **Total** | **138** | â€” | â€” | **0 / 138** | **0 / 138** |

> **Detection capability gap:** zero of the failing scenarios were detected by the current environment. There is no SIEM, no chain verifier, no FIM, and no egress alerting in place to fire on these conditions.

---

## SECTION 7 â€” Failure & Restart Log (MANDATORY)

Full text: [07 Failure & Restart Log](./07-Failure-Restart-Log.md).

| Restart # | Iter | Scenario | Root cause (Finding) | PHI impact | Control failures | Remediation status |
|---|---|---|---|---|---|---|
| 1 | C1-10 | S05 VRAM remanence | C-01 | High (direct read of prior-session PHI) | HIPAA Â§164.312(a)(1), (b), (c)(1); SOC 2 CC6.1, CC6.6, CC6.8 | **Recommended only â€” NOT applied** |
| 2 | C2-8 | S13 Plaintext SA key in repo | C-03 | Indirect â†’ potentially direct (depends on SA scope) | HIPAA Â§164.308(a)(4), Â§164.312(d), Â§164.308(b)(1); SOC 2 CC6.1, CC6.7, CC9.2 | **Recommended only â€” NOT applied** |
| 3 | C3-6 | S06 Audit tampering | C-04 | Forensic / breach-detectability | HIPAA Â§164.312(b), (c)(1)/(c)(2), Â§164.308(a)(1)(ii)(D); SOC 2 CC4.1â€“4.2, CC7.2â€“7.3 | **Recommended only â€” NOT applied** |
| 4 | C4-5 | S31 Approval bypass (no 2-person) | C-05 | Integrity of governed records | HIPAA Â§164.308(a)(3)(ii)(A), Â§164.308(a)(4), Â§164.312(c)(1); SOC 2 CC6.1, CC6.3, CC8.1 | **Recommended only â€” NOT applied** |
| (loop terminated) | C5-108 | recurring | C-01..C-07 | various | various | **No remediation applied; loop declared non-converging in current state** |

---

## SECTION 8 â€” Vulnerability Findings

Severity legend: **C = Critical, H = High, M = Medium, L = Low**.

### 8.1 Critical Findings (7)

| ID | Severity | Component | Description | Exploit Path | Likelihood | Impact | PHI Risk | Remediation Status |
|---|---|---|---|---|---|---|---|---|
| C-01 | C | GPU / Inference | VRAM data remanence on shared workstation GPU | Subsequent GPU consumer (process or session) reads residual PHI fragments from physical VRAM pages | Medium | Direct PHI disclosure | **High** | Recommended (see [05 Â§5.4](./05-Hardening-Blueprint.md#54-gpu--vram-highest-brad-10-specific-risk)); NOT applied |
| C-02 | C | Host / Topology | Workstation co-tenancy: PHI workload runs on a general-purpose machine | Compromise of any co-tenant (browser, IDE, mail, extension) escalates to full PHI access via shared user account | Medium-High | Full PHI compromise | **High** | Recommended (dedicated host per Brad.pi); NOT applied |
| C-03 | C | Secrets | Google service-account JSON present in working tree (`Builder/orbital-stage-443721-v1-99d78d776418.json`) | Git push, cloud sync, backup, or co-tenant read leaks credential; downstream blast radius depends on SA scope | Medium-High | Credential takeover; potential PHI access via Google services | **High** (if SA touches PHI-relevant scope) | Recommended (treat as compromised, rotate, vault, gitleaks); NOT applied |
| C-04 | C | Audit | No immutable / hash-chained audit pipeline; logs are operator-deletable | Operator compromise or intentional cover-up edits/removes evidence; alteration not detectable | High (capability exists by default) | Defeats Â§164.312(b)/(c) â€” undetectable misuse | High (forensic) | Recommended (WORM + hash chain + offline notary); NOT applied |
| C-05 | C | Governance / Workflow | No enforced two-person approval for chart-affecting / PIP / corrective action / PHI export operations | Single click executes governed action under sole operator identity | Medium | Integrity of governed records; potential unauthorized PHI export | High (integrity + confidentiality) | Recommended (write-broker + 2-person + signed envelopes); NOT applied |
| C-06 | C | Internal Auth | No service-to-service authentication on local IPC / loopback inference endpoint | Co-tenant process speaks to local inference endpoint and harvests PHI | Medium | Direct PHI disclosure | High | Recommended (localhost token at minimum; mTLS at target); NOT applied |
| C-07 | C | Egress | Inference path can reach the internet (no allowlist) | Prompt-injection-driven exfil emits PHI to attacker-controlled URL via tool call / fetch | Medium | Direct PHI exfiltration | High | Recommended (default-DROP egress on inference path); NOT applied |

### 8.2 High Findings (11)

| ID | Severity | Component | Description | PHI Risk | Status |
|---|---|---|---|---|---|
| H-01 | H | Host | EDR coverage / tamper protection on operator workstation not confirmed | Med | Recommend confirm |
| H-02 | H | Browser | UI runs in operator's general browser; cache/IndexedDB may persist PHI | Med | Recommend clear-on-close + redaction mode |
| H-03 | H | Backups | No segregated, append-only backup observed | Med-High (recovery + ransomware) | Recommend Restic + WORM target |
| H-04 | H | Tunnel | Remote access has no posture check / FIDO2 device-cert pinning observed | Med | Recommend WireGuard + posture agent |
| H-05 | H | RBAC | Single-user effective superuser; no role separation | Med | Recommend OIDC + RBAC + OPA |
| H-06 | H | Supply chain | npm dependencies not pinned by integrity hash beyond `package-lock`; no SBOM; no signed-image policy | Med | Recommend cosign + SBOM + Trivy in CI |
| H-07 | H | Dev mode | Vite dev server source maps may expose app internals to anyone reaching it | Low-Med | Recommend production build for any non-developer access |
| H-08 | H | Filesystem | No FIM on `Builder/`, model dir, policy corpus | Med | Recommend AIDE/osquery |
| H-09 | H | DLP | No DLP scan on LLM outputs before display/export | Med-High | Recommend regex + ML DLP |
| H-10 | H | Cloud sync | No documented exclusion of working tree from OneDrive/Drive/Dropbox | Med-High | Recommend explicit exclusion + verification |
| H-11 | H | Time | Workstation NTP drift not monitored | Low (audit ordering) | Recommend chrony + drift alert |

### 8.3 Medium Findings (14)

| ID | Component | Description | Status |
|---|---|---|---|
| M-01 | Session | No app-level enforced 15-min idle / 8-hr cap | Recommend |
| M-02 | MFA | FIDO2 hardware key not mandated for Brad-specific access | Recommend |
| M-03 | Secrets | No `gitleaks` pre-commit hook | Recommend |
| M-04 | Logging | No central syslog / SIEM | Recommend Wazuh |
| M-05 | Patching | No documented Brad-specific patch SLA | Recommend (Critical 72h / High 7d) |
| M-06 | Vuln scan | No periodic OpenSCAP / Lynis | Recommend weekly |
| M-07 | Pen-test cadence | No documented quarterly internal / annual external pentest | Recommend |
| M-08 | Access review | No quarterly access review with attestation | Recommend |
| M-09 | IR | No Brad-specific IR runbook | Recommend |
| M-10 | Drills | No quarterly restore drill | Recommend |
| M-11 | Module isolation | Cannot confirm zero ComfyUI/marketing crossover on the same workstation | Recommend separate host/VLAN |
| M-12 | Screen-share | No UI-level redaction mode for screen-shares | Recommend |
| M-13 | Crash dump / swap | OS crash reporting / swap not bounded for the inference process | Recommend disable crash reporting; prefer no-swap or encrypted swap |
| M-14 | DNS | No allowlisted internal DNS for inference path | Recommend internal CoreDNS |

### 8.4 Low Findings
- Misc workstation hardening items (privacy screen, cable lock, USB controls, browser extension policy) â€” recommend per [05](./05-Hardening-Blueprint.md).

---

## SECTION 9 â€” Remediation & Hardening Actions

> **Per scope, no remediation actions were performed by this engagement.** The Recommended Hardening Manifest in [08](./08-Final-Hardening-Manifest.md) and the Hardening Recommendations in [05](./05-Hardening-Blueprint.md) define the actions Care Indeed should consider. Each finding above is cross-referenced to its recommendation section.

---

## SECTION 10 â€” Control Validation Mapping

Full mapping in [03 HIPAA & SOC 2 Control Matrix](./03-HIPAA-SOC2-Control-Matrix.md).

Aggregate validation result for Brad 1.0 (current state):

| Domain | Mapped | Met | Partial | Not Met |
|---|---|---|---|---|
| HIPAA Administrative | 22 | 0 | 9 | 13 |
| HIPAA Physical | 6 | 0 | 2 | 4 |
| HIPAA Technical | 12 | 0 | 4 | 8 |
| SOC 2 CC | 22 | 0 | 7 | 15 |
| SOC 2 Availability | 3 | 0 | 0 | 3 |
| SOC 2 Confidentiality | 2 | 0 | 1 | 1 |
| **TOTAL** | **67** | **0** | **23** | **44** |

**No control was validated as PASS by the simulation program** (the loop did not reach 100 consecutive passes). Many controls operate at the org/workstation level and are partially met, but they cannot achieve full compliance without architectural change.

---

## SECTION 11 â€” PHI Exposure Analysis

- **Was PHI exposed in any test?** No actual PHI was exposed during this assessment; all simulation was tabletop/architectural and did not perform live exploitation. **However**, the assessment identified **3 categories of exposure-class architectural conditions**:
  1. **VRAM remanence** on the shared workstation GPU (C-01) â€” prior-session PHI may remain readable to subsequent GPU consumers.
  2. **Plaintext Google service-account JSON** in the repository working tree (C-03) â€” leakable via routine git/sync/backup operations.
  3. **Plaintext PHI persistence** in ad-hoc files, dev-server stdout, browser cache/IndexedDB, swap, and crash dumps on the operator workstation (M-13 + C-02).

- **Where exposure could have occurred (real-world conditions):**
  - GPU memory reuse across sessions or co-tenant processes.
  - `git push` of `Builder/orbital-stage-443721-v1-99d78d776418.json` to any remote not strictly private and PHI-scoped.
  - Cloud-sync ingestion of the working tree into a non-PHI-covered storage destination.
  - Co-tenant process or compromised browser extension reading the UI / IndexedDB / loopback inference endpoint.
  - Operator-account compromise via phishing.

- **How exposure was prevented in this assessment:** No live exploitation was performed. The conditions remain as observed.

- **Final statement:**

> **The current Brad 1.0 environment does not provide architectural assurance against PHI exposure.** This assessment makes no claim of zero exposure across the simulation; it claims only that the simulation was conducted without performing live exploitation. The architectural conditions for exposure exist and are documented above.

This phrasing is intentional and contrasts with the Brad.pi statement ("No PHI exposure occurred across 100 consecutive validated simulations") â€” Brad 1.0 cannot make that claim.

---

## SECTION 12 â€” Final System Hardening Manifest

Full text: [08 Recommended Hardening Manifest](./08-Final-Hardening-Manifest.md).

> **Manifest status for Brad 1.0:** RECOMMENDED. NOT IMPLEMENTED.

---

## SECTION 13 â€” Residual Risk Report

Until remediation is performed, **residual risk equals total risk**. The 7 Critical, 11 High, and 14 Medium findings remain open.

### Residual risks Care Indeed must explicitly accept (or remediate) before unrestricted PHI use:
1. **GPU/VRAM remanence on shared GPU** (C-01) â€” Direct PHI read path. *Mitigation while open:* avoid PHI workloads, or operate on synthetic data, or accept and document.
2. **Workstation co-tenancy** (C-02) â€” Direct compromise path via co-tenant process. *Mitigation while open:* limit workstation use during PHI sessions; aggressive EDR; lock screen and avoid concurrent activity.
3. **Plaintext SA key in repo** (C-03) â€” Credential leak path. *Mitigation while open:* never push the working tree; verify cloud sync exclusion; rotate credential out of the file as soon as practical (this is the single highest-leverage immediate action).
4. **Mutable audit** (C-04) â€” Forensic blind spot. *Mitigation while open:* manual log preservation at end of each session with attestation.
5. **No 2-person rule** (C-05) â€” Governance gap. *Mitigation while open:* manual second-person review of any chart-affecting output before downstream action.
6. **No internal service auth** (C-06) â€” Co-tenant pivot path. *Mitigation while open:* minimize concurrent processes; lock workstation; EDR.
7. **No egress allowlist on inference path** (C-07) â€” Prompt-injection exfil path. *Mitigation while open:* host firewall outbound deny for the inference process at minimum.

### Monitoring controls (recommended)
None of the recommended monitoring controls are currently in place. See [08 Â§8.10](./08-Final-Hardening-Manifest.md#810-monitoring--alerting-recommended).

---

## SECTION 14 â€” Continuous Monitoring & Retest Plan (Recommended)

| Activity | Recommended cadence |
|---|---|
| Continuous monitoring | SIEM (Wazuh or equivalent) with rules in [08 Â§8.10](./08-Final-Hardening-Manifest.md#810-monitoring--alerting-recommended) |
| Audit chain verifier | Continuous (P1 alarm on break) |
| FIM scan | Nightly |
| Image rebuild + Trivy scan | Weekly |
| OpenSCAP / Lynis host scan | Weekly |
| Authenticated network scan | Monthly |
| Internal pentest (this loop) | Quarterly |
| External pentest | Annually |
| IR tabletop | Semi-annually |
| DR full failover test | Annually |
| Access review with attestation | Quarterly |
| Backup restore drill | Quarterly |
| Quarterly red-team probe from Z-NPHI to PHI zones (must time out) | Quarterly |

---

## SECTION 15 â€” Final Certification Statement

> **Brad 1.0, in its current observed configuration, has NOT achieved 100 consecutive validated passes** of the adversarial simulation program. Of 67 mapped HIPAA / SOC 2 controls, **0 are fully met**, **23 are partially met**, and **44 are not met**. **7 Critical, 11 High, and 14 Medium findings are open**. None were remediated by this engagement (per scope; recommendations only).
>
> **Recommendation:** **NO-GO for unrestricted production handling of PHI** in the current configuration. An optional **constrained interim operating mode** is described in [01 Â§1.5](./01-Executive-Security-Summary.md#15-recommended-interim-operating-mode-recommendation-only--not-implemented). The defensible production target is the **Brad.pi** architecture documented in `../../Business Risk & Analytics Director Brad.pi/Documentation/`.
>
> **Conditions for ongoing compliance** (once remediated to Brad.pi baseline): see [10 Operational Recommendations](./10-Operational-Recommendations.md).

Signed (logical):
- Lead DevSecOps / Red Team Lead (this assessment)
- For review and decision by: HIPAA Security Officer, SOC 2 Control Owner, Care Indeed Governing Body

