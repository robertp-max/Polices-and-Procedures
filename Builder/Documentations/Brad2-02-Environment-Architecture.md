# 02 â€” Environment Architecture

**Document:** Target Production Architecture, Security Zones, Trust Boundaries, PHI Flows
**Scope:** Brad.pi self-hosted Linux + GPU + Docker + Local Qwen LLM
**Audience:** Security architects, auditors, platform engineers

---

## 2.1 Architectural Overview

Brad.pi is composed of **seven security zones** with strictly mediated crossings. No zone trusts another by default; all crossings authenticate (mTLS), authorize (OPA / RBAC), and log (append-only audit).

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚                  CARE INDEED PERIMETER                  â”‚
                    â”‚                                                         â”‚
   Remote User â”€â”€â”€â–º â”‚  Z0  Edge / VPN  (WireGuard, FIDO2, device cert)        â”‚
                    â”‚            â”‚                                            â”‚
                    â”‚            â–¼                                            â”‚
                    â”‚  Z1  Reverse Proxy / Auth (Caddy + OIDC + mTLS term.)   â”‚
                    â”‚            â”‚                                            â”‚
                    â”‚            â–¼                                            â”‚
                    â”‚  Z2  Application Tier (Brad API, RBAC, approval engine) â”‚
                    â”‚            â”‚            â–²                               â”‚
                    â”‚            â–¼            â”‚                               â”‚
                    â”‚  Z3  Inference Tier  Z4 Retrieval Tier                  â”‚
                    â”‚  (Qwen vLLM, GPU)    (vector DB, rerank, policy corpus) â”‚
                    â”‚            â”‚            â”‚                               â”‚
                    â”‚            â–¼            â–¼                               â”‚
                    â”‚  Z5  PHI Data Plane  (Postgres, MinIO PHI bucket)       â”‚
                    â”‚                                                         â”‚
                    â”‚  Z6  Audit / Logging Plane  (WORM MinIO, Wazuh SIEM)    â”‚
                    â”‚                                                         â”‚
                    â”‚  Z7  Admin / Management  (jump host, secrets, backup)   â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚  ISOLATED â€” NON-PHI MARKETING / COMFYUI ZONE (Z-NPHI)   â”‚
                    â”‚  Separate VLAN, separate GPU host, separate storage,    â”‚
                    â”‚  no route to Z2-Z6, no shared secrets, no shared FS     â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 2.2 Security Zones

| Zone | Name | Purpose | Trust Level | Network |
|---|---|---|---|---|
| **Z0** | Edge / VPN | WireGuard tunnel termination, device cert validation | Untrusted | 10.10.0.0/24 |
| **Z1** | Reverse Proxy / Auth | TLS termination, OIDC, mTLS to Z2 | Low | 10.20.0.0/24 |
| **Z2** | Application | Brad API, RBAC, approval engine, job orchestrator | Medium | 10.30.0.0/24 |
| **Z3** | Inference | Qwen LLM on GPU (vLLM), prompt logger | High | 10.40.0.0/24 |
| **Z4** | Retrieval | Vector DB (Qdrant), reranker, policy corpus (read-only) | High | 10.41.0.0/24 |
| **Z5** | PHI Data Plane | Postgres (PHI), MinIO PHI bucket, encrypted volumes | Highest | 10.50.0.0/24 |
| **Z6** | Audit/Logging | WORM MinIO, Wazuh SIEM, hash-chain verifier | Highest (integrity) | 10.60.0.0/24 |
| **Z7** | Admin / Mgmt | Jump host, Vault, backup orchestrator | Highest (privilege) | 10.70.0.0/24 |
| **Z-NPHI** | Marketing / ComfyUI | Non-PHI media generation | Isolated | 10.90.0.0/24 (separate VLAN, no L3 route to PHI zones) |

---

## 2.3 Components

### 2.3.1 Edge / VPN (Z0)
- **WireGuard** server, FIDO2 device attestation required for tunnel auth.
- Per-user, per-device peer config issued via signed enrollment workflow.
- Split-tunnel **disabled**; full tunnel for the duration of session.
- VPN logs to Z6 over one-way syslog.

### 2.3.2 Reverse Proxy / Auth (Z1)
- **Caddy 2** with internal CA-issued TLS, automatic certificate rotation.
- **OIDC** front-door (Authentik or Keycloak) bound to FIDO2 + TOTP fallback (TOTP only with HSM-backed seed).
- Issues short-lived (15 min) signed JWT to Z2.
- Strict route allowlist; no proxy_pass to inference (Z3) directly.

### 2.3.3 Application Tier (Z2)
- **Brad API** (Node/Python) â€” REST + WebSocket.
- **RBAC engine** with roles: `Admin`, `DON`, `QA`, `Compliance`, `IT`, `Auditor`, `ReadOnlyClinical`.
- **Approval Engine**: two-person rule for any PIP / corrective action / chart write.
- **Job Orchestrator**: queues chart review jobs to Z3 with rate limits.
- **Policy Decision Point (OPA)** evaluates every action against signed policy bundle.

### 2.3.4 Inference Tier (Z3)
- **vLLM** serving Qwen, **dedicated GPU node**, no co-tenancy with non-PHI.
- One **worker process per session**, killed at session end â†’ forces VRAM reclaim.
- `cudaMemset` of allocator pools on worker recycle.
- KV-cache disabled across users; no cross-session prompt caching.
- Prompt + output captured to Z6 audit (PHI-tagged, encrypted at rest).
- No outbound internet; egress firewall = DROP all.

### 2.3.5 Retrieval Tier (Z4)
- **Qdrant** vector DB, policy corpus mounted **read-only**.
- Reranker (cross-encoder) on CPU.
- No write path from Z3/Z2 except via signed corpus update job from Z7 with checksum manifest.

### 2.3.6 PHI Data Plane (Z5)
- **PostgreSQL 16** with TDE (LUKS at rest + pgcrypto for column-level on identifiers).
- **MinIO** PHI bucket with server-side encryption (SSE-KMS via Vault transit).
- All connections **mTLS only**; client cert pinned per service.
- Row-level security for tenant/site separation.

### 2.3.7 Audit / Logging (Z6)
- **MinIO with object-lock (WORM)**, retention = 7 years (HIPAA), governance mode locked.
- **Hash-chain ledger**: each log batch contains SHA-256 of previous batch; root anchored hourly to a separate offline notary (USB HSM at admin workstation).
- **Wazuh SIEM** ingests syslog, auditd, Falco, Docker events, OPA decisions, app audit.
- Alerts mirrored to PagerDuty-equivalent on-prem (e.g., ntfy) AND offsite SMS gateway.

### 2.3.8 Admin / Management (Z7)
- **Hashicorp Vault** with auto-unseal via Shamir + 3-of-5 operator quorum.
- **Backup orchestrator**: Restic to encrypted offline LTO + secondary encrypted MinIO at a different physical site.
- **Jump host** (bastion): SSH FIDO2 only, session recorded (asciinema + auditd).
- No direct admin connections to Z3/Z5 except via jump host.

### 2.3.9 Non-PHI Marketing / ComfyUI (Z-NPHI)
- Separate physical host or strictly separate VM with **PCIe passthrough** to its own GPU.
- Separate VLAN, separate switch port, **no route** in router ACL to 10.30â€“10.70 ranges.
- Separate identity store; admin must explicitly switch context.
- Storage is local to Z-NPHI; no shared NFS/SMB with PHI zones.

---

## 2.4 Trust Boundaries

| Boundary | Crossing Control |
|---|---|
| Internet â†’ Z0 | WireGuard handshake + device cert; UDP only on configured port; rate-limited |
| Z0 â†’ Z1 | mTLS + OIDC session |
| Z1 â†’ Z2 | mTLS + signed JWT (15-min TTL) + OPA decision |
| Z2 â†’ Z3 | mTLS, signed inference request envelope, per-session token |
| Z2 â†’ Z4 | mTLS, read-only API |
| Z2 â†’ Z5 | mTLS, RLS-bound DB user, parameterized queries only |
| Z3 â†’ Z6 | One-way syslog over mTLS (UDPâ†’TCP relay), no return path |
| Z7 â†’ all | Jump host only, FIDO2, session recorded |
| Z-NPHI â†” PHI zones | **No route. Physical/L2 separation.** |

---

## 2.5 PHI Data Flows

### Flow A â€” Chart Review Request (read-only reasoning)
```
User (Z0) â†’ VPN â†’ Caddy (Z1) â†’ Brad API (Z2)
   â†’ OPA check â†’ Job Queue â†’ Inference Worker (Z3)
   â†’ Retrieval read-only fetch from Qdrant + Postgres (Z4/Z5, mTLS)
   â†’ LLM reasoning (Z3, dedicated worker, VRAM scoped)
   â†’ Findings JSON â†’ Brad API (Z2) â†’ User UI
   â†’ Audit entry â†’ Z6 (WORM)
```
**Properties:** No write to Z5. Worker recycled after session. Findings include evidence pointers (chart line, policy section) for explainability.

### Flow B â€” Corrective Action / PIP Execution (write, governed)
```
DON proposes PIP in UI â†’ Brad API (Z2)
   â†’ OPA policy check (deterministic)
   â†’ Approval Engine: requires 2-person sign-off (DON + Compliance)
   â†’ Signed envelope â†’ Write Broker (Z2) â†’ Z5 with append-only PIP table
   â†’ Audit entry â†’ Z6 (WORM)
```
**Properties:** LLM never executes. Two-person rule enforced server-side. Every approval is logged with FIDO2 attestation.

### Flow C â€” Audit Read (Auditor Role)
```
Auditor (Z0) â†’ VPN â†’ Caddy (Z1) â†’ Brad API (Z2, Auditor role)
   â†’ Read-only audit query â†’ Z6 with hash-chain verification
   â†’ Result rendered with chain proof
```
**Properties:** Auditor role cannot write anywhere. All auditor reads are themselves logged.

---

## 2.6 Critical Assets

| Asset | Location | Sensitivity |
|---|---|---|
| PHI charts / patient identifiers | Z5 (Postgres, MinIO PHI) | **Highest** |
| Audit ledger | Z6 (WORM MinIO) | **Highest (integrity)** |
| Vault unseal keys | Offline, 3-of-5 quorum | **Highest** |
| Qwen model weights | Z3 read-only volume | High (IP) |
| Policy corpus | Z4 read-only | High |
| Backups | LTO offline + offsite MinIO | **Highest** |
| Service mTLS certs | Vault PKI, short-lived | High |
| Admin FIDO2 keys | Physical custody of named admins | **Highest** |

---

## 2.7 Privileged Operations (Require Two-Person + Audit)

- PIP creation / approval / execution
- Corrective action execution
- Chart write-back
- Policy corpus update
- Model weight update
- Vault unseal / rekey
- Backup restore
- User role assignment changes (Admin and above)
- Firewall / network ACL change
- Container image deploy (signed manifest required)

---

## 2.8 Read-Only vs Write Paths

| Path | Mode | Enforcement |
|---|---|---|
| LLM â†’ PHI corpus | Read-only | DB user has only `SELECT`; mount is `ro` |
| LLM â†’ policy corpus | Read-only | Filesystem `ro,nosuid,nodev` |
| Brad API â†’ PHI write | Write via broker only | Broker requires 2-person token |
| Audit log writes | Append-only | WORM object-lock + hash chain |
| Backup writes | Append-only | Restic repository in append-only mode |
| Admin â†’ host config | Write via signed Ansible only | All hosts immutable except via pipeline |

---

## 2.9 AI Authority Boundaries

| Operation | Allowed for AI? |
|---|---|
| Read PHI for reasoning | YES (within session, scoped) |
| Reason / summarize / detect deficiencies | YES |
| Recommend corrective actions | YES |
| Draft PIP text | YES |
| **Execute** PIP / corrective action | **NO â€” human approval required** |
| **Write** to chart record | **NO â€” write broker + 2-person** |
| **Approve** anything | **NO** |
| Export PHI | **NO â€” Admin + audit + DLP scan** |
| Send PHI outside Z5 | **NO â€” egress firewall blocks** |

---

## 2.10 Remote Access Design

- **WireGuard** only; no SSL VPN, no RDP gateway, no exposed RDP/SSH.
- **Device trust:** enrollment ties WireGuard peer key to a device certificate stored in TPM 2.0; device must present cert at TLS time.
- **Posture check:** on connect, a lightweight agent attests OS patch level, FDE on, antivirus current; non-compliant device is shunted to a remediation VLAN with no access.
- **Session control:** idle timeout 15 min, hard cap 8 hours, re-auth required.
- **Browser exposure:** Brad UI served only inside VPN; CSP `default-src 'self'`, no third-party scripts, SRI on all assets.
- **Admin access separation:** Admins use a dedicated admin laptop (no email, no general browsing) with separate VPN profile and FIDO2 key.
- **Remote logging:** all VPN connect/disconnect events go to Z6 with source IP, peer key fingerprint, and device cert serial.
- **Kill/revoke:** WireGuard peer revoke + Vault token revoke + OIDC session revoke can be executed from jump host in <60 seconds; documented runbook.

