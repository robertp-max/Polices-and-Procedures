# 02 â€” Environment Architecture (As-Observed, Brad 1.0 LIVE)

**Document:** Actual current architecture of the live Brad 1.0 deployment.
**Method:** Observation of workspace state, terminal evidence, and operator-described topology.
**Important:** This document describes the system **as it is**, not as it should be. Recommended target state is in [05](./05-Hardening-Blueprint.md) and [08](./08-Final-Hardening-Manifest.md).

---

## 2.1 As-Observed Topology

```
                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                        â”‚                  OPERATOR WORKSTATION                  â”‚
                        â”‚     (single host; general-purpose + Brad 1.0)          â”‚
                        â”‚                                                        â”‚
   Remote consumer â”€â”€â”€â–º â”‚  Browser / UI (served via local dev server)            â”‚
                        â”‚           â”‚                                            â”‚
                        â”‚           â–¼                                            â”‚
                        â”‚  Local Node/Vite dev server  (`npm run dev`)           â”‚
                        â”‚           â”‚                                            â”‚
                        â”‚           â–¼                                            â”‚
                        â”‚  Local app + retrieval glue (loopback only)            â”‚
                        â”‚           â”‚                                            â”‚
                        â”‚           â–¼                                            â”‚
                        â”‚  Local LLM inference  â”€â”€ shares GPU(s) / VRAM with     â”‚
                        â”‚     other workstation processes (browser GPU accel,    â”‚
                        â”‚     other dev tooling, etc.)                           â”‚
                        â”‚                                                        â”‚
                        â”‚  Local files: source tree, `tmp-*.json` payloads,      â”‚
                        â”‚     `Builder/orbital-stage-...json` service-account    â”‚
                        â”‚     key, policy/forms corpora (read-write to operator) â”‚
                        â”‚                                                        â”‚
                        â”‚  Logs: dev server stdout, ad-hoc files (mutable)       â”‚
                        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

There is **one trust zone**: the operator's workstation user account. Everything inside it can talk to everything else. There is no internal authentication boundary between the UI, the orchestration code, the inference process, and the file system.

---

## 2.2 Components (As-Observed)

| Component | Where it Lives | Notes |
|---|---|---|
| Web UI | Vite dev server on workstation | Bound to localhost (assumed); exposed externally only via tunnel/VPN if at all |
| App / orchestration | Node process | Same user as operator |
| Local LLM inference | Local GPU(s), VRAM-resident | **Shared GPU** with general workstation use |
| Vector / retrieval glue | Local process / files | No isolation from other local processes |
| Policy / procedure corpus | Repository working tree | Read-write to operator |
| Secrets | Plaintext JSON in repo (`Builder/orbital-stage-443721-v1-99d78d776418.json`); env vars | **Critical exposure path** |
| Audit log | Dev server stdout + ad-hoc files | **Mutable; no integrity controls; operator-deletable** |
| Backups | Not observed (no Restic/WORM/object-lock) | If they exist, they are not segregated from operator-write access |
| Remote access | Workstation-dependent (tunnel / VPN to operator host); not a hardened appliance | Single point of dependency on operator endpoint hygiene |
| Marketing / non-PHI module | Not observed as a separately isolated environment | Cannot confirm zero crossover |

---

## 2.3 Trust Boundaries (As-Observed)

| Boundary | Crossing Control |
|---|---|
| Internet â†’ workstation | Whatever the operator's network, OS firewall, and tunnel software enforce |
| Workstation user â†’ app | None (same user) |
| App â†’ inference | None (same user, loopback) |
| App â†’ files / secrets | None (same user, full filesystem ACL) |
| Inference â†” other GPU consumers on same host | **None at the GPU layer** â€” VRAM is shared resource |
| Brad 1.0 â†” non-PHI workloads | **No enforced separation** â€” same machine, same user, same GPU |

> **Translation:** the security boundary is "the operator's workstation user account." If anything inside that account is compromised â€” a malicious browser extension, a phishing-payload download, a vulnerable dependency in the dev server, an EDR miss â€” the entire PHI workflow is compromised.

---

## 2.4 PHI Data Flows (As-Observed)

### Flow A â€” Chart Review Read & Reason
```
Operator opens UI â†’ local app loads chart-related material from local files / corpus
    â†’ Sent to local LLM (in VRAM)
    â†’ LLM emits findings â†’ rendered in UI (browser cache, screen)
    â†’ No append-only audit; output may persist in:
         - browser cache / IndexedDB
         - dev server stdout
         - tmp-*.json artifacts in working tree
         - VRAM (until next allocation overwrite â€” not deterministic)
```

### Flow B â€” Any Write-Back / Action Trigger (if used)
```
Operator clicks action in UI â†’ app invokes downstream effect
    â†’ No deterministic OPA-style policy gate observed
    â†’ No two-person approval gate observed
    â†’ Effect executed as the operator's identity
```

### Flow C â€” Remote Use
```
Remote consumer over tunnel â†’ reaches operator workstation â†’ uses UI as if local
    â†’ Trust = operator workstation trust + tunnel trust + remote endpoint trust
```

---

## 2.5 Critical Assets (Where They Sit Today)

| Asset | Current Location | Risk of Current Placement |
|---|---|---|
| PHI processed in sessions | RAM + VRAM + temp files on workstation | High â€” colocated with general-purpose workload |
| Service-account JSON (Google) | `Builder/orbital-stage-443721-v1-99d78d776418.json` in working tree | **Critical** â€” leaks via git, sync, backup, or repo share |
| Policy corpus | Working tree, operator-writable | Medium â€” integrity not protected |
| Audit traces (such as they exist) | Mutable local files / stdout | **Critical** â€” not tamper-evident |
| Remote access credentials / tunnel keys | On operator workstation | High â€” single point of compromise |

---

## 2.6 Privileged Operations (As-Observed)

In the current deployment, the **operator IS the privileged user for everything**: starting/stopping inference, modifying corpora, reading PHI, writing action effects, deleting logs, and rotating any local secrets. There is **no separation of duties** enforced at the system level.

---

## 2.7 Read-Only vs Write Paths (As-Observed)

| Path | Mode (Observed) | Should Be (Brad.pi target) |
|---|---|---|
| LLM â†’ PHI corpus | Operator's full ACL (read-write) | Read-only |
| LLM â†’ policy corpus | Operator's full ACL (read-write) | Read-only |
| App â†’ action effects | Operator identity (no broker) | Write broker + 2-person token |
| Audit log writes | Mutable / deletable | WORM + hash chain |
| Backup writes | Not observed segregated | Append-only repo |

---

## 2.8 AI Authority Boundaries (As-Observed)

| Operation | Currently Allowed for AI? | Should Be |
|---|---|---|
| Read PHI for reasoning | Yes (effectively unbounded within operator scope) | Yes, scoped per session |
| Reason / summarize | Yes | Yes |
| Recommend action | Yes | Yes |
| Execute chart write-back | Depends on app paths; **no enforced gate observed** | NO without 2-person + broker |
| Approve compliance action | **No enforced gate observed** | NO |
| Export PHI | **No DLP / no audit gate observed** | NO without Admin + DLP + 2-person |
| Egress to internet | **Not bounded by allowlist** | DROP all by default |

---

## 2.9 Remote Access (As-Observed)

- The remote-access pattern depends on the **operator's workstation availability** and whatever tunneling mechanism is configured. There is **no dedicated VPN appliance** observed.
- **Device posture of the remote endpoint is not attested** before access.
- **Session timeout / idle-lock** behavior is whatever the OS and the UI application happen to do; no enforced 15-min idle / 8-hour cap was observed.
- **FIDO2 hardware-key MFA** is not observed as required for remote use.
- **Revocation runbook** with a sub-60-second target is not observed.

---

## 2.10 Non-PHI / Marketing Module (As-Observed)

- No separate VLAN, no separate host, no separate identity store, no separate storage for any non-PHI module was observed in this assessment scope.
- If non-PHI generative work happens on the same workstation/GPU, that constitutes a **module-crossover risk** (see [04](./04-Threat-Model.md) Â§4.4 #11 and [09](./09-Penetration-Test-Report.md) finding M-11).

---

## 2.11 Summary

Brad 1.0 is, architecturally, a **single-tenant, single-host operator-driven prototype** that has been pressed into PHI-handling service. It works â€” but it does so on a topology where the **only enforced boundary is the operator's user account**. Every HIPAA technical safeguard that requires segmentation, integrity, or separation-of-duty must therefore be considered **not architecturally enforced** in the current state.

The recommended target architecture is Brad.pi (`../../Business Risk & Analytics Director Brad.pi/Documentation/02-Environment-Architecture.md`). The deltas required to migrate are enumerated in [05](./05-Hardening-Blueprint.md).

