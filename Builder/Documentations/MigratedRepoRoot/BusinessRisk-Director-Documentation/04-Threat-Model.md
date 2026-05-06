# 04 — Threat Model (Brad 1.0 LIVE)

**Methodology:** STRIDE + LINDDUN + adversary-driven attack-path analysis, applied to the **as-observed** Brad 1.0 topology (single operator workstation, shared GPU, locally orchestrated services).
**Note:** All threats are evaluated against the live state. Where Brad 2.0's controls would defeat the threat, that is noted as the **target state**, not as a current control.

---

## 4.1 Critical Assets

| Asset | Confidentiality | Integrity | Availability | Current Location | Notes |
|---|---|---|---|---|---|
| PHI in active sessions | **Critical** | **Critical** | High | RAM + VRAM + temp files on operator workstation | Co-located with general-purpose workload |
| PHI in corpora / files | **Critical** | **Critical** | High | Operator-writable filesystem | No FIM, no integrity proof |
| Audit traces (such as they exist) | High | **Critical** | **Critical** | Local mutable files / stdout | **Operator-deletable** |
| Google service-account JSON | **Critical** | **Critical** | Medium | `Builder/orbital-stage-443721-v1-99d78d776418.json` in working tree | **Plaintext on disk in repo path** |
| Tunnel / remote-access keys | **Critical** | High | High | On operator workstation | Single point of compromise |
| Policy corpus | Low | **Critical** | High | Working tree | Operator-writable |
| LLM model state in VRAM | Medium (PHI bleeds in) | High | High | Shared GPU(s) | **Remanence risk** |
| Backups (if any) | **Critical** | **Critical** | **Critical** | Not observed segregated | Cannot attest immutability |

---

## 4.2 Threat Actors

| Actor | Motivation | Capability | Likelihood (Brad 1.0 specific) | Prioritized? |
|---|---|---|---|---|
| External opportunist | Ransom, data theft | Low–Med | Medium — workstation phishing surface | Yes |
| Targeted external (APT) | Targeted data theft, espionage | High | Low–Med | Yes |
| Compromised remote endpoint | Pivot to PHI | Medium | **High** — remote use is endpoint-trust-dependent | Yes |
| Malicious insider (clinical) | Curiosity, revenge | Low | Low–Med | Yes |
| Malicious insider (operator/IT) | Sabotage, theft | **Very High** (effective superuser) | Low (likelihood) but **catastrophic blast radius** | **Yes (highest blast radius)** |
| Negligent insider | Misconfig, phishing, accidental commit | Low | **High** | Yes |
| Supply-chain attacker | Embed malware in npm dep / image / model | High | Medium — no signed-image / SBOM enforcement observed | Yes |
| Physical intruder | Theft of workstation | Low | Low–Med | Yes |
| Auditor / contractor | Scope creep, accidental exfil | Medium | Low | Yes |
| Co-tenant process on workstation | Browser exploit, malicious extension, vulnerable dev tool | Medium | **High** — same user, same machine | **Yes — Brad-1.0 specific** |

---

## 4.3 Attack Surfaces (Brad 1.0 specific)

1. **Operator workstation OS** — patches, EDR coverage, browser exploits.
2. **Browser** — extensions, malicious tabs, IndexedDB / cache exfil.
3. **npm dependency tree** — supply chain (`vite`, `tailwind`, etc.); typosquat; postinstall scripts.
4. **Local dev server (`npm run dev`)** — bind address, dev-mode endpoints, source-map exposure.
5. **Local LLM inference process** — prompt injection, model-side exfil, memory dump.
6. **Shared GPU / VRAM** — remanence across processes.
7. **File system** — repo working tree (PHI artifacts in `tmp-*.json`, secrets in `Builder/...json`).
8. **Tunnel / VPN client** on operator workstation.
9. **Operator's secondary tools** running concurrently (mail client, browser, IDE, screen-share apps).
10. **USB / removable media** on the workstation.
11. **Backup destination** (if any) — could be a sync folder, cloud drive, etc.
12. **Git remote** — accidental push of `Builder/*.json` to a non-private/non-PHI remote.
13. **Update / patch flow** — unpinned npm versions, unverified base images for any local containers.
14. **Time source** — workstation NTP; time-skew breaks any audit ordering.
15. **DNS** — workstation DNS resolver is whatever the OS / VPN configures.
16. **Cross-module ComfyUI** — if marketing/media work runs on the same workstation, it shares everything.

---

## 4.4 High-Risk Attack Paths (Brad 1.0)

| # | Path | Why High Risk in Current Topology |
|---|---|---|
| 1 | Phish operator → workstation token theft → direct PHI access via UI | The operator account *is* the PHI access boundary |
| 2 | Malicious browser extension on operator workstation reads UI DOM / IndexedDB | UI runs in operator's browser context |
| 3 | npm supply-chain compromise (e.g., postinstall in a transitive dep) → code runs as operator → reads filesystem incl. `Builder/*.json` and PHI artifacts | No signed dependency policy; no isolation |
| 4 | Operator inadvertently `git push` exposes `Builder/orbital-stage-443721-v1-99d78d776418.json` | The file already lives in the working tree |
| 5 | Prompt injection in chart text → LLM emits PHI to a tool call / fetch / external URL | Egress not bounded |
| 6 | Next user (or next session of same user) reads VRAM remnants of prior session | No per-session worker recycle / memset hygiene observed |
| 7 | Co-tenant compromise (browser, IDE, side tool) pivots to local LLM endpoint via loopback | No mTLS / no service auth on local IPC |
| 8 | Operator deletes / edits log artifacts after-the-fact (intentional or accidental) | Logs are mutable |
| 9 | Stolen / unattended workstation → cold-boot or simply reading disk | FDE status not confirmed |
| 10 | Backup of working tree to cloud sync (OneDrive/Drive/Dropbox) leaks PHI artifacts and SA key | No segregated backup destination observed |
| 11 | ComfyUI / marketing module running on same host shares GPU/VRAM/disk with PHI workload | No host/GPU separation |
| 12 | Tunnel client on remote endpoint compromised → attacker rides session to PHI UI | No posture check, no FIDO2 |
| 13 | Dev-server source map exposure leaks application internals → speeds privilege escalation | Vite dev mode routinely exposes source maps |
| 14 | Crash-dump / swap on workstation contains PHI plaintext | OS crash reporting / swap not bounded |
| 15 | Screen-share / "let me show you" sessions inadvertently expose PHI | No UI-level redaction mode for sharing |

---

## 4.5 STRIDE (selected components)

### Operator Workstation (the de facto trust boundary)
| Threat | Current Mitigation |
|---|---|
| Spoofing | OS login + tunnel auth (whatever is configured) |
| Tampering | Workstation user ACL (operator can do anything) |
| Repudiation | None — logs are mutable |
| Info disclosure | Workstation FDE (assumed) + browser sandbox |
| DoS | None specific |
| Elevation | OS-level only |

### Local LLM Inference Process
| Threat | Current Mitigation |
|---|---|
| Spoofing (caller identity) | None — any local process can connect |
| Tampering (model file) | OS file ACL only; no signature verification observed |
| Repudiation (who prompted what) | None — no immutable prompt log |
| Info disclosure (VRAM remanence, output exfil) | None observed |
| DoS | None |
| Elevation | Process runs as operator |

### File System (repo working tree)
| Threat | Current Mitigation |
|---|---|
| Tampering (PHI / corpus integrity) | None — no FIM |
| Info disclosure (SA key, PHI artifacts) | OS ACL only |
| Repudiation (who changed what) | Git history (if committed); not real-time forensic |

---

## 4.6 LINDDUN Privacy Threats

| Privacy Threat | Current State (Brad 1.0) |
|---|---|
| Linkability across sessions | **High** — shared VRAM, shared workstation context, no per-session isolation |
| Identifiability | Identifiers flow through prompts unredacted (no minimization layer observed) |
| Non-repudiation gap (legitimate user denies action) | **High** — no FIDO2 attestation, no WORM audit |
| Detectability of PHI presence in logs | **High** — prompts/outputs may persist in stdout, dev logs, browser cache, `tmp-*.json` |
| Disclosure of info | Egress not bounded; no DLP scan on outputs |
| Unawareness (data subject) | Org-level NoPP coverage assumed |
| Non-compliance | This entire matrix |

---

## 4.7 Highest-Risk Failure Scenarios (drives the test program in [06](./06-Breach-Simulation-100-Pass.md))

1. PHI extracted from VRAM after a session by next user / process.
2. Operator workstation compromise via phishing or malicious browser extension → full PHI access.
3. Plaintext Google service-account key (`Builder/orbital-stage-443721-v1-99d78d776418.json`) leaks via git push, sync, or backup.
4. Audit traces silently altered or deleted — no detection.
5. Prompt-injection in chart text → PHI exfil to attacker-controlled URL.
6. Co-tenant process on the workstation reads the local inference endpoint and harvests PHI.
7. Cloud-sync folder (OneDrive / Drive) accidentally syncs PHI working artifacts off the workstation.
8. Source-map exposure in dev mode reveals app internals to anyone reaching the dev server.
9. Crash-dump or swap contains PHI plaintext.
10. Screen-share session inadvertently shows PHI to unauthorized viewer.
11. ComfyUI / marketing module on the same host crosses over into PHI memory or storage.
12. Stolen / unattended workstation read offline.
13. Tunnel-endpoint compromise rides legitimate session.
14. Two-person rule absent → unauthorized chart or PIP write executes on a single click.
15. Backup compromise / no segregated backup → no defensible recovery.

Each of these appears as an explicit scenario in [06](./06-Breach-Simulation-100-Pass.md), with PASS/FAIL determination against the **as-observed** Brad 1.0 environment.
