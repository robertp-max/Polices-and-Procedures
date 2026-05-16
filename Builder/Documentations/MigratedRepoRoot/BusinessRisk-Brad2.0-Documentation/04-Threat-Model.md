# 04 â€” Threat Model

**Methodology:** STRIDE + LINDDUN + adversary-driven attack-path analysis.
**Scope:** Brad.pi self-hosted Linux + GPU + Docker + Local Qwen LLM.

---

## 4.1 Critical Assets (Crown Jewels)

| Asset | Confidentiality | Integrity | Availability | Notes |
|---|---|---|---|---|
| PHI charts (Postgres, MinIO) | **Critical** | **Critical** | High | HIPAA core asset |
| Audit ledger (Z6 WORM) | High | **Critical** | **Critical** | Tamper = breach cover-up |
| Vault unseal keys | **Critical** | **Critical** | High | Compromise = total compromise |
| Qwen model weights | Medium | High | High | IP + model integrity for safety |
| Policy corpus | Low | **Critical** | High | Integrity = correct compliance evaluation |
| Backups | **Critical** | **Critical** | **Critical** | Last line of defense |
| FIDO2 keys (admin) | **Critical** | High | Medium | Physical custody |
| mTLS service certs | High | High | High | Short-lived, Vault-issued |
| Approval engine signing key | High | **Critical** | High | Forgery = unauthorized PIPs |

---

## 4.2 Threat Actors

| Actor | Motivation | Capability | Likelihood | Prioritized? |
|---|---|---|---|---|
| External opportunist | Ransom, data theft | Lowâ€“Med (commodity tooling) | Medium | Yes |
| Targeted external (APT) | Targeted data theft, espionage | High | Low | Yes |
| Compromised remote endpoint | Pivot to PHI | Medium | Medium-High | Yes |
| Malicious insider (clinical) | Curiosity, revenge | Low | Medium | Yes |
| Malicious insider (admin/IT) | Sabotage, theft | **High** (privileged) | Low | **Yes (highest blast radius)** |
| Negligent insider | Misconfiguration, phishing | Low | **High** | Yes |
| Supply-chain attacker | Embed malware in image/dep | High | Medium | Yes |
| Physical intruder | Theft, tamper | Low | Low | Yes |
| Auditor / contractor | Scope creep, accidental exfil | Medium | Low | Yes |

---

## 4.3 Attack Surfaces

1. **WireGuard endpoint** â€” UDP port, peer key compromise, FIDO2 bypass.
2. **Reverse proxy (Caddy)** â€” TLS misconfig, OIDC redirect abuse, header smuggling.
3. **OIDC / IdP** â€” Account takeover, SSO bug, MFA recovery abuse.
4. **Brad API** â€” AuthZ bypass, IDOR, SQLi, SSRF.
5. **OPA policy engine** â€” Stale bundle, policy bypass.
6. **Approval engine** â€” Race conditions, replay of approval tokens.
7. **vLLM inference** â€” Prompt injection, output exfiltration, model file swap.
8. **GPU driver / VRAM** â€” Data remanence, side-channel.
9. **Qdrant / retrieval** â€” Index poisoning, query exfiltration.
10. **Postgres / MinIO** â€” RLS bypass, backup access, IAM misconfig.
11. **Docker daemon / socket** â€” Socket exposure, container escape.
12. **Container images** â€” Compromised base, dependency confusion, typosquat.
13. **Host OS / Linux kernel** â€” Privilege escalation (e.g., dirty-pipe class), unpatched CVEs.
14. **SSH / Bastion** â€” Stale keys, weak ciphers, missing MFA.
15. **Vault** â€” Auto-unseal compromise, token leak.
16. **Backup repository** â€” Restic key theft, immutability bypass.
17. **Audit pipeline** â€” Log injection, hash chain forgery, log dropping.
18. **Time source (NTP)** â€” Time-skew to break audit ordering or cert validation.
19. **DNS** â€” DNS rebinding, internal DNS poisoning.
20. **Cross-module (ComfyUI)** â€” Shared host/network/storage leak.
21. **Admin workstation** â€” Endpoint malware, browser exploit, USB.
22. **Physical** â€” Server room access, console access, drive theft.
23. **Update / patch pipeline** â€” Compromised CI/CD, image registry poisoning.
24. **Email/Slack out-of-band** â€” Phishing of admins/clinicians.

---

## 4.4 High-Risk Attack Paths (top 12, ranked by composite risk)

| # | Path | Why High Risk |
|---|---|---|
| 1 | Phish admin â†’ steal session â†’ pivot via OIDC â†’ trigger PIP without 2-person | Bypasses governance |
| 2 | Compromised endpoint over VPN â†’ access Brad UI as legitimate role â†’ exfil chart via export | Endpoint trust failure |
| 3 | Container escape via misconfigured Docker socket â†’ root on host â†’ read PHI volumes / disable audit | Single weakness, total compromise |
| 4 | Prompt injection in chart text â†’ LLM emits PHI to attacker-supplied callback channel | Subtle, hard to detect |
| 5 | VRAM remanence: prior session data accessed by next user via shared worker | Healthcare-specific, easy to miss |
| 6 | Stolen admin FIDO2 + coerced quorum â†’ backup restore to attacker-controlled host | Insider w/ duress |
| 7 | Audit log tampering by compromised root â†’ cover up breach | Defeats detection |
| 8 | Supply chain: poisoned base image â†’ ships with backdoor â†’ C2 over allowed egress | Persistent foothold |
| 9 | Approval workflow race condition â†’ single approval treated as two | Workflow bug = governance bypass |
| 10 | Backup compromise â†’ ransomware â†’ restore from poisoned backup | DR turned into attack vector |
| 11 | ComfyUI host bridged to PHI storage via shared NFS or shared admin workstation | Module crossover |
| 12 | DNS rebinding against internal admin dashboard from attacker-controlled site visited on admin laptop | Endpoint browser pivot |

---

## 4.5 STRIDE Analysis (selected components)

### Brad API (Z2)
| Threat | Mitigation |
|---|---|
| Spoofing | OIDC + FIDO2 + mTLS service auth |
| Tampering | Signed envelopes for write ops; WORM audit |
| Repudiation | Per-action audit with FIDO2 attestation |
| Info disclosure | RBAC + OPA + RLS; output filters |
| DoS | Rate limit at Caddy + queue limits |
| Elevation | OPA deny-by-default; no role-self-assignment |

### Inference (Z3)
| Threat | Mitigation |
|---|---|
| Spoofing | mTLS from Z2; signed inference envelope |
| Tampering | Read-only model volume + image signature |
| Repudiation | Prompt + output logged to Z6 |
| Info disclosure | No outbound; per-session worker; VRAM scrub |
| DoS | Queue depth + timeout per request |
| Elevation | Rootless container; seccomp; no docker.sock |

---

## 4.6 LINDDUN Privacy Threats (PHI-specific)

| Privacy Threat | Mitigation |
|---|---|
| Linkability (correlate across sessions) | Per-session worker; no cross-session cache |
| Identifiability | Column-level encryption on identifiers; PHI minimization in prompts where feasible |
| Non-repudiation gap (legitimate user denies action) | FIDO2 attestation + WORM audit |
| Detectability of PHI presence in logs | Prompt/output stored only in Z6, encrypted, access-controlled |
| Disclosure of info | Egress firewall DROP; output DLP scanner before display/export |
| Unawareness (data subject) | Notice of Privacy Practices covers AI processing |
| Non-compliance | This control matrix |

---

## 4.7 Highest-Risk Failure Scenarios (drives test program)

These are the scenarios that, if they occur, would constitute reportable breaches under HIPAA Breach Notification Rule:

1. PHI extracted from VRAM after a session by the next user.
2. Audit log tampering goes undetected.
3. Two-person approval bypassed â†’ unauthorized chart write.
4. Backup repository compromised â†’ restore from poisoned backup.
5. ComfyUI module gains read access to PHI volumes.
6. Container escape leads to host root and PHI volume read.
7. Prompt injection causes PHI to be emitted into a non-PHI sink.
8. Stolen admin credentials used to disable audit pipeline.
9. Unencrypted PHI export via approval workflow bug.
10. Stale VPN peer/SSH key used by ex-employee for re-entry.

Every scenario above appears as an explicit test in [06](./06-Breach-Simulation-100-Pass.md).

