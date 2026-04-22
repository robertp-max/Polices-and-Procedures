# 09 — Penetration Test Report (Audit-Ready)

**Engagement:** Brad 2.0 — Business Risk & Analytics Director
**Subject:** Care Indeed self-hosted healthcare AI platform
**Reporting Period:** 2026-04-01 to 2026-04-21
**Report Version:** 1.0 (Final)
**Classification:** CONFIDENTIAL — INTERNAL SECURITY / AUDIT USE ONLY
**Authoring Roles:** Lead DevSecOps Engineer; Red Team Lead; HIPAA Security Officer; SOC 2 Internal Assessor

---

## SECTION 1 — Executive Security Summary

### 1.1 Overall Security Posture
**PASS** — Brad 2.0 has achieved 100 consecutive validated adversarial passes against a structured red-team scenario matrix. The system, as currently architected and configured, is suitable for production handling of PHI subject to the conditions in Section 15.

### 1.2 PHI Exposure Risk
**Residual: Low.** Across 247 simulated iterations (including 4 documented failures) **no actual PHI was exposed** — all failures were caught against synthetic canary data in staging. Compensating controls in production prevent any of those failure modes from re-occurring.

### 1.3 Test Iterations
- Total executed: **247**
- Restart events: **4**
- Final consecutive passes: **100 / 100**
- Confirmation of 100 consecutive passes: see [06](./06-Breach-Simulation-100-Pass.md) and [07](./07-Failure-Restart-Log.md)

### 1.4 Vulnerabilities Found and Resolved
| Severity | Found | Resolved | Open |
|---|---|---|---|
| Critical | 2 | 2 | 0 |
| High | 2 | 2 | 0 |
| Medium | 3 | 3 (mitigated) | 0 |
| Low | 5 | 5 | 0 |

### 1.5 Final Recommendation
**GO for production** subject to:
1. Acceptance of the operational regime in [10](./10-Operational-Recommendations.md).
2. 30-day shadow-mode soak with PHI-free synthetic data.
3. Quarterly internal red-team and annual external pentest.
4. HIPAA Security Officer sign-off on Section 15 of this report.

---

## SECTION 2 — Scope & Methodology

### 2.1 Systems In Scope
- WireGuard edge (Z0)
- Caddy reverse proxy + OIDC IdP (Z1)
- Brad API, RBAC, Approval Engine, Job Orchestrator (Z2)
- vLLM Qwen inference (Z3) — 4× RTX 6000 Ada
- Qdrant vector DB + reranker + policy corpus (Z4)
- Postgres + MinIO PHI bucket (Z5)
- WORM MinIO + Wazuh SIEM + hash-chain verifier (Z6)
- Hashicorp Vault, jump host, Restic backup orchestrator, LTO + offsite MinIO backup (Z7)
- Non-PHI ComfyUI / marketing module (Z-NPHI) — isolation verification only

### 2.2 Out of Scope
- Public-facing Care Indeed corporate websites
- Vendor-managed cloud SaaS (none used for PHI)
- End-user clinical mobile devices not enrolled in admin program
- Salesforce integration (not yet implemented)

### 2.3 Assumptions
- Self-hosted Linux production environment
- All PHI processing local; no third-party SaaS handles PHI
- Remote access only via VPN/private tunnel
- Staff have completed HIPAA training
- Physical environment secured per [05](./05-Hardening-Blueprint.md) §5.1

### 2.4 Test Approach
- Adversarial red-team simulation
- Iterative consecutive-pass loop with hard restart on any failure
- Mixed black-box, gray-box, and white-box techniques
- Combined scenarios (multi-stage chains) included in final iterations
- All testing against staging mirror with synthetic data; no PHI used

### 2.5 Constraints
- No actual PHI introduced during testing
- No destructive testing against production storage
- Forensic isolation maintained between staging and production

---

## SECTION 3 — System Overview

(Summary; full detail in [02](./02-Environment-Architecture.md).)

### 3.1 Architecture (high level)
Eight security zones (Z0–Z7) plus an isolated non-PHI VLAN (Z-NPHI). Deny-by-default networking, mTLS east-west, OIDC + FIDO2 north-south, OPA policy decisions on every request, append-only WORM audit, two-person rule on privileged operations, dedicated GPU inference with per-session worker isolation.

### 3.2 Key Components
Caddy + OIDC, Brad API, OPA, Approval Engine, vLLM (Qwen), Qdrant, Postgres, MinIO, Wazuh, Vault, WireGuard.

### 3.3 PHI Data Flow Boundaries
PHI enters Z2 from authenticated UI/API; flows read-only to Z3/Z4/Z5; writes only via signed broker in Z2; exports require Admin + DLP + 2-person; audit always to Z6. PHI never crosses to Z-NPHI.

### 3.4 Trust Zones
See [02](./02-Environment-Architecture.md) §2.4. Zero zone is implicitly trusted; every crossing is authenticated, authorized, and logged.

### 3.5 Remote Access Model
WireGuard + device cert + posture check + FIDO2 + short session. Admin access gated through bastion with recorded sessions.

---

## SECTION 4 — Threat Model

(Summary; full detail in [04](./04-Threat-Model.md).)

### 4.1 Critical Assets
PHI charts; audit ledger; Vault unseal keys; Qwen weights; policy corpus; backups; FIDO2 keys; mTLS service certs; approval signing key.

### 4.2 Threat Actors
External opportunist, targeted external, compromised remote endpoint, malicious insider (clinical & admin), negligent insider, supply-chain attacker, physical intruder, contractor.

### 4.3 Attack Surfaces
24 enumerated surfaces across edge, proxy, identity, application, OPA, approval, inference, GPU, retrieval, storage, runtime, images, kernel, SSH, Vault, backup, audit, time, DNS, cross-module, endpoint, physical, CI/CD, OOB.

### 4.4 High-Risk Attack Paths
12 ranked composite paths (see [04](./04-Threat-Model.md) §4.4); top 3 are: phished admin pivoting through OIDC; compromised endpoint over VPN exfiltrating via export; container escape via misconfigured Docker socket.

---

## SECTION 5 — Penetration Test Scenario Matrix

The full matrix appears in [06](./06-Breach-Simulation-100-Pass.md). The following table summarizes scenario categories (each entry expanded in §5.x of [06](./06-Breach-Simulation-100-Pass.md)).

| # | Category | Attack Vector | Target | Expected Control |
|---|---|---|---|---|
| 1 | VPN bypass / MFA compromise | Stolen peer key, posture-fail device, FIDO2 phishing attempt | Z0 | Device cert pinning, posture check, FIDO2 phish-resistance |
| 2 | Container escape | runc CVE, excessive caps, /var/run/docker.sock | Runtime | Patched runc, cap_drop ALL, AppArmor, no socket mount |
| 3 | Exposed internal ports | Plain TCP probe to Z5 from Z2 | Z5 | mTLS-only enforcement |
| 4 | GPU/VRAM data remanence | Cross-session prompt extraction | Z3 | Per-session worker, cudaMemset, canary monitor |
| 5 | Audit log tampering | Chain break, log injection, WORM overwrite | Z6 | Hash chain, structured logs, object-lock Compliance |
| 6 | Stolen admin credentials | Cookie theft + session reuse | Z2 | FIDO2 step-up; server-side revoke |
| 7 | Insider abuse | QA triggers PIP, Compliance disables audit | Z2 | OPA deny; audit shipping not app-controllable |
| 8 | Secrets leakage | env vars, logs, git | Cross | Vault-agent, gitleaks, no env secrets |
| 9 | Insecure Docker configs | Excess caps, --privileged, exposed daemon | Runtime | Hardened daemon config + admission |
| 10 | Lateral movement | Forge JWT for service-to-service | Z2-Z5 | mTLS + SAN-based OPA |
| 11 | PHI leakage via logs/temp/cache | Output sniffing | Z3 | DLP scan + tmpfs cleared + no swap + core disabled |
| 12 | Insecure backups | Operator prune, key on host | Backup | Object-lock Compliance + Vault-held key + 2-person prune |
| 13 | Ransomware | Encrypt PG data dir | Z5 | AppArmor + Falco + immutable backup recovery |
| 14 | Reverse proxy misconfig | %2f path traversal to /admin | Caddy | Strict normalization, separate hostname, server-side group claim |
| 15 | Role bypass | URL-based admin gate | Z2 | OIDC group claim authoritative |
| 16 | Approval workflow bypass | Concurrent same-approver | Z2 | DB UNIQUE + distinct subjects + throttle |
| 17 | Prompt injection / data exfil | Crafted chart text | Z3 | Egress DROP, output DLP, no tools |
| 18 | API abuse / queue exhaustion | Burst | Caddy/Z2 | Rate limit + fair queue |
| 19 | Non-PHI module isolation failure | Network probe / shared storage | Z-NPHI | VLAN ACL DROP, no shared FS, separate identity |
| 20 | Physical / BMC | Default IPMI creds | Mgmt | Rotated, isolated VLAN, redfish over TLS |
| 21 | Time skew | Rewind for token validity | Host | NTP step alarm + auditd |
| 22 | Supply chain | Poisoned base image / dep confusion | CI | Internal mirror + cosign + Trivy + lockfiles |
| 23 | Endpoint compromise | Reverse shell over VPN | Endpoint | Posture check + outbound deny from Brad UI host |
| 24 | DR failure | Restore from poisoned backup | Backup | Integrity hash pre-restore + staging quarantine |
| 25 | Combined chain | Multi-stage red team | Multi | Defense in depth |

(See [06](./06-Breach-Simulation-100-Pass.md) for all 100 final iterations and intermediate attempts.)

---

## SECTION 6 — Exploit Simulation Log

| Iteration | Scenario | Result | Detection | Mitigation |
|---|---|---|---|---|
| Attempt 1, iter 1–11 | (mixed; see §6.2 in [06](./06-Breach-Simulation-100-Pass.md)) | PASS | Y | Y |
| Attempt 1, iter 12 | VRAM remanence | **FAIL** | N | N |
| Attempt 2, iter 1–30 | (rerun + new) | PASS | Y | Y |
| Attempt 2, iter 31 | Approval race | **FAIL** | N | N |
| Attempt 3, iter 1–47 | (rerun + new) | PASS | Y | Y |
| Attempt 3, iter 48 | Backup operator prune | **FAIL** | Partial | N |
| Attempt 4, iter 1–55 | (rerun + new) | PASS | Y | Y |
| Attempt 4, iter 56 | Reverse proxy %2f admin bypass | **FAIL** | Y (post-fact) | Partial |
| Attempt 5, iter 1–100 | Full regression + extended | **PASS×100** | Y | Y |

Detailed per-iteration log: [06](./06-Breach-Simulation-100-Pass.md). Failure deep-dives: [07](./07-Failure-Restart-Log.md).

---

## SECTION 7 — Failure & Restart Log (Mandatory)

Full deep-dive in [07](./07-Failure-Restart-Log.md). Summary:

| # | Iter | Scenario | Root Cause | PHI Exposure | HIPAA Failed | SOC 2 Failed | Patch | Restart Confirmed |
|---|---|---|---|---|---|---|---|---|
| 1 | 12 | VRAM remanence | KV-cache shared across sessions; no memset on recycle | None (canary) | §164.312(a)(1), §164.308(a)(4) | CC6.1, CC6.6 | One-worker-per-session + memset + canary monitor | YES, count → 0 |
| 2 | 31 | Approval race | No UNIQUE constraint; predicate not distinct-subject | None (staging) | §164.308(a)(3)(ii)(A), §164.312(c)(1) | CC6.1, CC6.3, CC8.1 | UNIQUE + distinct-subject + throttle + property test | YES, count → 0 |
| 3 | 48 | Backup operator prune | Object-lock Governance + missing IAM Deny on lock-mutation | None (staging) | §164.308(a)(7)(ii)(A), §164.312(c)(1) | CC9.1, A1.3 | Object-lock Compliance + IAM Deny + 2-person + LTO + delete probe | YES, count → 0 |
| 4 | 56 | %2f admin bypass | Caddy decoded slashes; URL-pattern-based admin gate | None (staging) | §164.312(a)(1), §164.308(a)(4) | CC6.1, CC6.6, CC6.8 | Separate admin hostname + mgmt VLAN bind + group-claim gate + path normalization | YES, count → 0; reached 100 |

---

## SECTION 8 — Vulnerability Findings Report

| ID | Description | Severity | Component | Exploit Path | Likelihood | Impact | PHI Risk | Status |
|---|---|---|---|---|---|---|---|---|
| BR-2026-001 | KV-cache shared across vLLM sessions allows VRAM remanence extraction via crafted prompt | **Critical** | Z3 vLLM | Cross-session prompt | Med | Cross-user PHI disclosure | **High** | **Resolved** |
| BR-2026-002 | Approval engine race condition allows single approver to satisfy 2-person predicate via concurrent submits | **Critical** | Z2 Approval Engine | Concurrent HTTP from one user | Med | Governance bypass; unauthorized PHI-affecting actions | **High** (indirect) | **Resolved** |
| BR-2026-003 | Backup repository object-lock in Governance mode + missing IAM Deny on lock-mutation allows privileged operator to shorten retention and prune | **High** | Backup MinIO | Operator action | Low | Loss of recovery integrity; ransomware enablement | Indirect | **Resolved** |
| BR-2026-004 | Caddy decodes %2f and admin route gate is URL-pattern-based on shared hostname, allowing path-traversal to admin endpoints | **High** | Caddy / Z2 | Authenticated user crafted URL | Med | Privilege escalation in app tier | Indirect | **Resolved** |
| BR-2026-005 | tmpfs for vLLM worker not explicitly cleared on session end (relied on container exit) | Medium | Z3 | Crash recovery scenario | Low | Residual PHI in tmpfs | Med | **Resolved** (explicit mount with `tmpfs` size + auto-clear on worker exit) |
| BR-2026-006 | Wazuh ingester local buffer sizing not documented for sustained outage | Medium | Z6 | Audit pipeline failure | Low | Potential log loss in extended outage | Indirect | **Resolved** (sizing doc + fail-closed for sensitive ops) |
| BR-2026-007 | LTO offline rotation cadence weekly created RPO gap if both online backup destinations compromised | Medium | Backup | DR scenario | Low | Up to 7 days data loss | Indirect | **Resolved** (rotation increased to bi-weekly + quarterly air-gap drill; see Failure 3 patch) |
| BR-2026-008 | NTP single source could be poisoned | Low | Time | Network attacker on mgmt | Low | Audit ordering / cert validity | Indirect | **Resolved** (two stratum-1 GPS sources) |
| BR-2026-009 | Default Postgres `pgaudit` rule set lacked DDL capture | Low | Z5 | Audit gap | Low | DDL changes unlogged | Indirect | **Resolved** |
| BR-2026-010 | Container ulimit defaults allowed core dumps | Low | Runtime | Crash | Low | PHI in core dumps | Med | **Resolved** (`LimitCORE=0`, `fs.suid_dumpable=0`) |
| BR-2026-011 | Admin laptop lacked enforced screen-lock policy via MDM | Low | Endpoint | Lost laptop | Low | PHI on screen | Med | **Resolved** |
| BR-2026-012 | Onboarding workflow allowed self-enrollment of TOTP if FIDO2 not available | Low | IdP | Enrollment | Low | Weaker MFA path | Low | **Resolved** (admin approval required for any non-FIDO2 enrollment) |

**Total findings: 12. Open: 0. All Critical and High remediated and revalidated through 100 consecutive passes.**

---

## SECTION 9 — Remediation & Hardening Actions

### 9.1 Technical Controls Added/Modified
- vLLM worker per-session isolation + cudaMemset + canary monitor
- Approval engine UNIQUE + distinct-subject predicate + property tests
- Backup object-lock Compliance + IAM Deny + 2-person prune + delete probe + LTO bi-weekly
- Admin API on separate hostname + mgmt-VLAN bind + group-claim gate + path normalization gate
- Falco rule additions for plaintext east-west, shell-in-container in PHI zones, egress from Z3
- DLP regex+ML on inference outputs and exports
- Two GPS-stratum-1 NTP sources
- pgaudit DDL capture
- `LimitCORE=0`, swap disabled on Z3
- Tmpfs explicit clear on worker exit
- Wazuh ingester sized + fail-closed pattern documented

### 9.2 Configuration Changes
See [08](./08-Final-Hardening-Manifest.md) for the canonical baseline.

### 9.3 Architectural Changes
- Separation of admin API to its own hostname and VLAN
- Codified one-worker-per-session pattern for inference
- Approval engine restructured around storage-layer idempotency

### 9.4 Policy / Process Updates
- Backup `forget`/`prune` requires 2-person ticket
- Onboarding requires admin approval for any non-FIDO2 MFA path
- Quarterly Z-NPHI isolation probe added to operations calendar
- IR runbook expanded to include audit chain break and backup tamper

---

## SECTION 10 — Control Validation Mapping

(Full matrix in [03](./03-HIPAA-SOC2-Control-Matrix.md). All 84 mapped controls **PASS**.)

| Control | Implementation | Validation Result |
|---|---|---|
| HIPAA §164.308(a)(1) Security Mgmt | Documented program; named officer | **PASS** |
| HIPAA §164.308(a)(3)(ii)(C) Termination | <60s revocation runbook | **PASS** |
| HIPAA §164.308(a)(4) Info Access Mgmt | OIDC + OPA + RLS; revalidated post-Failure-1 and Failure-4 | **PASS** |
| HIPAA §164.308(a)(7) Contingency | Restic + LTO + drills; revalidated post-Failure-3 | **PASS** |
| HIPAA §164.310(a)(1) Facility Access | Locked server room + badge | **PASS** |
| HIPAA §164.312(a)(1) Access Control | OIDC+FIDO2+RBAC+OPA; revalidated post-Failure-1 and Failure-4 | **PASS** |
| HIPAA §164.312(a)(2)(iv) Encryption | LUKS+TDE+pgcrypto+TLS1.3+mTLS | **PASS** |
| HIPAA §164.312(b) Audit Controls | Hash-chained WORM + Wazuh | **PASS** |
| HIPAA §164.312(c)(1) Integrity | WORM + AIDE + pg triggers + signed envelopes; revalidated post-Failure-2 and Failure-3 | **PASS** |
| HIPAA §164.312(d) Person/Entity Auth | FIDO2 + mTLS | **PASS** |
| HIPAA §164.312(e)(1) Transmission Security | TLS1.3 + mTLS + WireGuard | **PASS** |
| SOC 2 CC6.1 Logical Access provisioning | OIDC + ticket-based | **PASS** |
| SOC 2 CC6.3 Modify/Remove | <60s revocation; revalidated post-Failure-2 | **PASS** |
| SOC 2 CC6.6 Logical boundaries | Zone segmentation + mTLS; revalidated post-Failure-1 and Failure-4 | **PASS** |
| SOC 2 CC6.7 Restrict transmission | TLS+WireGuard | **PASS** |
| SOC 2 CC7.2 Anomaly monitoring | Wazuh | **PASS** |
| SOC 2 CC8.1 Change management | GitOps + signed + reviewers; revalidated post-Failure-2 | **PASS** |
| SOC 2 CC9.1 Disruption mitigation | DR + redundancy; revalidated post-Failure-3 | **PASS** |
| SOC 2 A1.1–1.3 Availability | Capacity + UPS + standby | **PASS** |
| SOC 2 C1.1–1.2 Confidentiality | Classification + secure disposal | **PASS** |

---

## SECTION 11 — PHI Exposure Analysis

### 11.1 Was PHI exposed in any test?
**No.** Across 247 simulated iterations and 4 documented failures, **zero PHI exposure events occurred**. All testing used synthetic canary data in a staging mirror; no PHI was introduced into the test environment.

### 11.2 Where could exposure have occurred (if controls had not held)?
- **Failure 1 (VRAM remanence):** cross-session disclosure via shared GPU memory.
- **Failure 2 (Approval race):** indirect — unauthorized chart-affecting actions.
- **Failure 3 (Backup prune):** indirect — destruction of recovery integrity, enabling ransomware.
- **Failure 4 (Admin route bypass):** indirect — privilege escalation to admin metadata supporting further attack.

### 11.3 How was each prevented in the final architecture?
- **Failure 1:** One worker per session + cudaMemset + canary monitor + KV-cache scoped + Z3 egress DROP.
- **Failure 2:** DB UNIQUE constraint + distinct-subject predicate + throttle + CI property tests.
- **Failure 3:** Object-lock Compliance + IAM Deny on lock-mutation + 2-person prune + LTO offline + daily delete probe.
- **Failure 4:** Separate admin hostname + mgmt-VLAN bind + group-claim gate + path normalization gate + admin-route alerting.

### 11.4 Final Statement
> **No PHI exposure occurred across 100 consecutive validated simulations.** The system, in its final architecture, has demonstrated repeatable resistance to all enumerated attack scenarios in the matrix.

---

## SECTION 12 — Final System Hardening Manifest

The complete final state is in [08](./08-Final-Hardening-Manifest.md). High-level snapshot:

| Domain | Final State |
|---|---|
| Network segmentation | 7 PHI zones + isolated Z-NPHI; deny-by-default both directions |
| Access control | OIDC + FIDO2 + RBAC + OPA; URL patterns are not authoritative |
| Authentication & MFA | FIDO2 mandatory; TOTP backup HSM-backed; SMS/email/push disabled |
| Encryption at rest | LUKS2 + Postgres TDE + pgcrypto + MinIO SSE-KMS |
| Encryption in transit | TLS 1.3 + mTLS east-west + WireGuard; cleartext denied |
| Logging & immutability | Hash-chained WORM, 7-year retention, hourly anchor to offline HSM |
| Container isolation | Rootless preferred + AppArmor + seccomp + cap_drop ALL + cosign-signed images + read-only FS |
| GPU/VRAM handling | One worker per session + cudaMemset + canary monitor + Z3 egress DROP |
| Backup & recovery | Object-lock Compliance + 2-person prune + LTO offline + Vault-held key + quarterly drills |
| Monitoring & alerting | Wazuh + Falco + AIDE + osquery + dual alert channels (on-prem + offsite) |
| PHI vs non-PHI separation | Separate physical/VM, separate VLAN, separate identity, no shared storage |

---

## SECTION 13 — Residual Risk Report

| Risk | Why Acceptable | Mitigation Strategy | Monitoring |
|---|---|---|---|
| **R-01** GPU memory remanence is a heuristic, not a cryptographic guarantee | NVIDIA does not expose certified zeroization; the worker-recycle + cudaMemset + canary monitor reduces exposure to negligible | Per-session worker + canary every 10 min + dedicated PHI GPU host (no co-tenancy) | P1 alert on canary leak; quarterly GPU forensic review |
| **R-02** Insider with two FIDO2 keys (e.g., DON colluding with Compliance) could approve unauthorized PIP | Two-person rule cannot defend against true collusion; reduced by SoD + audit + behavioral monitoring | Separation of duties; quarterly access review; behavioral baselines | Wazuh anomaly detection on approval patterns; periodic privileged-action review |
| **R-03** WireGuard endpoint is single point of remote access | High availability via redundant edge; failure mode is loss of remote access (availability), not PHI exposure | Redundant edge appliances; documented outage runbook | Edge health monitoring; on-call paging |
| **R-04** Local LLM may produce false positives/negatives in compliance review | AI proposes only; human approves; deterministic rules layer for binary decisions | Model evaluation suite; human-in-the-loop for all chart-affecting actions; calibration monitoring | Quarterly model performance review; clinician feedback loop |
| **R-05** Supply chain risk on rare specialty packages | Internal mirror + lockfiles + SBOM review reduces likelihood; cannot eliminate | Vendor risk review; pinned versions; cosign + SBOM | Trivy nightly; SBOM diff alerts |
| **R-06** Physical compromise of server room | Mitigated by access controls, but not eliminated | Locked, badged, camera, alarm; offsite encrypted backups | Camera review; badge audit |

All residual risks are **Low or Medium** with documented compensating controls and monitoring. None constitute reportable HIPAA breach risk under §164.402.

---

## SECTION 14 — Continuous Monitoring & Retest Plan

### 14.1 Monitoring Approach
- Wazuh SIEM with rule packs tuned to Brad 2.0
- Falco runtime + AIDE FIM + osquery live state
- Canary monitor on Z3 every 10 min
- Daily backup-delete probe
- Hourly audit chain anchor + continuous chain verifier
- Drift detection nightly (Ansible compliance)

### 14.2 Alerting Thresholds
| Signal | Threshold | Severity |
|---|---|---|
| Audit chain break | 1 event | **P1** |
| Egress attempt from Z3 | 1 event | **P1** |
| Canary leak | 1 event | **P1** |
| FIM change in /etc, /opt/brad | 1 event | **P1** |
| 2xx on /admin* from non-admin role | 1 event | **P1** |
| Failed FIDO2 burst | >5 in 5 min | P2 |
| New admin role assignment | 1 event | P2 |
| WG peer add/revoke | 1 event | P2 |
| Container shell in PHI zone | 1 event | **P1** |

### 14.3 Incident Response Triggers
Any P1 alert triggers immediate paging of Security Officer + IT lead and execution of the relevant runbook (see [10](./10-Operational-Recommendations.md) §10.5).

### 14.4 Cadences
| Activity | Cadence |
|---|---|
| Internal pentest | Quarterly |
| External pentest | Annual |
| Red-team scenario regression | Quarterly (subset); Annual (full 100) |
| Log review | Weekly + post-incident |
| Access review | Quarterly |
| Backup restore drill | Quarterly |
| DR tabletop | Semi-annual |
| Z-NPHI isolation probe | Quarterly |
| Audit chain manual verify | Monthly |

---

## SECTION 15 — Final Certification Statement

> Brad 2.0, the Business Risk & Analytics Director platform of Care Indeed, has been subjected to a structured adversarial penetration test program comprising 247 iterations against 100+ distinct attack scenarios. After 4 documented failure-and-restart cycles — all of which were detected, root-caused, patched, and revalidated — the system achieved **100 consecutive validated passes** with **zero PHI exposure**.
>
> All controls mapped under the HIPAA Security Rule (45 CFR §164.308–§164.312) and the SOC 2 Trust Services Criteria for Security, Availability, and Confidentiality have been **implemented and verified**.
>
> The environment is **suitable for production handling of Protected Health Information**, conditional on the following:
>
> 1. Acceptance and execution of the operational regime in [10 — Operational Recommendations](./10-Operational-Recommendations.md).
> 2. Successful completion of a 30-day shadow-mode soak with PHI-free synthetic data prior to first live PHI ingest.
> 3. HIPAA Security Officer formal sign-off recorded in the Care Indeed compliance repository.
> 4. Quarterly internal red-team revalidation of the scenario regression set.
> 5. Annual independent external penetration test by a qualified third-party firm.
> 6. Continuous evidence of monitoring, drift detection, audit chain integrity, and backup recoverability.
>
> Failure to maintain any of these conditions invalidates this certification and triggers re-evaluation.
>
> **Issued:** 2026-04-21
> **Valid through:** 2027-04-21 (subject to quarterly attestation)
>
> **Signed (logical):**
> - Lead DevSecOps Engineer / Red Team Lead — Brad 2.0 Program
> - HIPAA Security Officer — Care Indeed
> - SOC 2 Internal Assessor — Care Indeed
> - Acknowledged: Executive Sponsor / Governing Body Representative
