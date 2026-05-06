# 08 — Recommended Hardening Manifest (Brad 1.0 LIVE)

**Status:** **RECOMMENDED TARGET STATE. NOT APPLIED.** This document defines the control baseline that, if adopted, would put Brad 1.0 (or its successor) into a posture capable of surviving a 100-consecutive-pass simulation. It is the consolidation of [05](./05-Hardening-Blueprint.md) into a manifest format suitable for governance use. **Nothing in this document has been implemented by this assessment.**

> The most direct path to this manifest in practice is to migrate Brad 1.0's PHI workload onto the **Brad 2.0** architecture (see `../../Business Risk & Analytics Director Brad2.0/Documentation/08-Final-Hardening-Manifest.md`). The manifest below is therefore expressed in terms of "the Brad-1.0 deployment, once migrated / hardened to this baseline."

---

## 8.1 Network Segmentation (Recommended)

- Seven security zones (Z0 Edge / Z1 Proxy+Auth / Z2 App / Z3 Inference / Z4 Retrieval / Z5 PHI Data / Z6 Audit / Z7 Admin), with the non-PHI marketing/ComfyUI module on a fully isolated Z-NPHI VLAN with no L3 route to PHI zones.
- Default-DROP at host firewall for every zone; explicit allowlists per direction.
- mTLS east-west; no plaintext channels internally.
- Single ingress: WireGuard UDP from internet → edge appliance (not the operator workstation).

## 8.2 Access Control Model (Recommended)

- Roles: `Admin`, `DON`, `QA`, `Compliance`, `IT`, `Auditor`, `ReadOnlyClinical`, `ServiceAccount-*`.
- Deny-by-default; OPA policy decision on every action.
- Quarterly access review with named-owner attestation.
- Separation of duties: no single person holds both `Admin` and `Compliance` / `Auditor`.
- Sub-60-second revocation runbook (WireGuard peer revoke + Vault token revoke + OIDC session kill).

## 8.3 Authentication & MFA (Recommended)

- OIDC front-door with FIDO2 hardware-key MFA mandatory for humans.
- TOTP only as HSM-backed backup; no SMS, no email link, no push fatigue.
- Service identity = mTLS certificate SAN, issued by Vault PKI, 24-hour TTL.
- Admins hold two FIDO2 keys (primary + offline backup).

## 8.4 Encryption — At Rest (Recommended)

- LUKS2 on all data volumes; TPM 2.0 + PIN unsealing for boot.
- Postgres TDE (filesystem) + pgcrypto column-level on identifiers (MRN, SSN, DOB).
- MinIO SSE-KMS with per-bucket keys via Vault transit engine.
- Key custody: production data KEK separate from backup KEK; both in Vault; root sealed offline.

## 8.5 Encryption — In Transit (Recommended)

- TLS 1.3 only externally; TLS 1.3 + mTLS internally.
- AEAD ciphers only.
- HSTS, CSP `default-src 'self'`, X-Frame-Options DENY, Referrer-Policy strict-origin, Permissions-Policy minimal — enforced at proxy.
- WireGuard UDP at the edge with FIDO2-bound enrollment and TPM-backed device cert.

## 8.6 Logging & Audit Immutability (Recommended)

- Sources: app audit, OPA decisions, inference prompts/outputs (encrypted, Z6 only), proxy access logs, WireGuard, auditd, Falco, Docker events, Vault audit, Postgres `pgaudit`, MinIO audit.
- Pipeline: source → local agent (Wazuh/Filebeat/auditbeat) → mTLS → Z6 ingester → Wazuh manager → (a) search indices and (b) WORM bucket (raw, hash-chained batches) → hourly chain root anchored to offline notary HSM.
- Integrity: each batch contains `prev_hash`, `batch_hash`, `batch_id`, `timestamp`, `count`. Continuous verifier; P1 alarm on chain break.
- Retention: 7 years (audit), 1 year (operational). Legal hold mechanism documented.

## 8.7 Container Isolation (Recommended)

- Rootless Docker preferred; userns-remap where rootful is required (GPU).
- `no-new-privileges: true` daemon-wide; `seccomp: default` + custom profiles; AppArmor/SELinux per service.
- `cap_drop: ALL`; explicit `cap_add` only as required.
- `--read-only` rootfs with explicit tmpfs mounts.
- `pids-limit`, `memory`, `cpus`, `ulimits` set per container.
- **No container ever mounts `/var/run/docker.sock`.**
- Images: Distroless / Chainguard / verified upstream, pinned by SHA256 digest, **cosign-signed**, admission policy rejects unsigned, SBOM (CycloneDX) attached, Trivy in CI fails build on Critical/High without exception ticket.

## 8.8 GPU / VRAM Handling Controls (Recommended)

- Dedicated GPU host(s); no co-tenancy with non-PHI workloads; non-PHI generative work strictly on a different physical host.
- BMC/IPMI on isolated mgmt VLAN; default creds rotated; Redfish over TLS only.
- NVIDIA driver pinned and vetted; updates via staging.
- NVIDIA Container Toolkit with runtime class `nvidia`; **no `--privileged`**; `--gpus` only.
- `nvidia-smi --compute-mode=EXCLUSIVE_PROCESS`.
- vLLM (or equivalent): one worker per session, killed at session end; on recycle perform `torch.cuda.empty_cache()` + deliberate large-then-small `cudaMemset` allocation overwrite + exit. Cross-session KV-cache disabled.
- Periodic GPU reset on idle (>15 min) where supported; nightly worker pool restart.
- Wipe-and-fill canary after model swap or driver reload (sanity check, not cryptographic guarantee).
- Egress firewall on the inference host: **DROP all egress** except mTLS to Z6 audit and read-only model mirror.
- Model weights mounted **read-only**; SHA-256 recorded; swaps require signed manifest + Security Officer approval.

## 8.9 Backup & Recovery (Recommended)

- Restic to two destinations:
  1. Local LTO-9 tape, encrypted, sealed, off-site rotation weekly.
  2. Secondary MinIO at a different physical site, with object-lock + append-only Restic config.
- Daily incremental + weekly full.
- Quarterly restore drill into clean staging environment with end-to-end integrity verification.
- Backup KEK held in Vault, separate from production data KEK.
- Backup writer cannot delete (append-only repo + WORM bucket policy).
- RTO 4h / RPO 1h documented.

## 8.10 Monitoring & Alerting (Recommended)

- **Wazuh** (or equivalent) as SIEM with rules tuned to suppress noise but escalate on:
  - Audit chain break → P1, page immediately.
  - New admin role assignment → P2.
  - WireGuard new peer or revocation → P2.
  - Falco rule fire (e.g., `Terminal shell in container`) in PHI zones → P1.
  - Failed FIDO2 attempts above threshold → P2.
  - **Outbound connection attempt from inference host → P1.**
  - File integrity change in `/etc`, `/opt/brad`, model weights dir, policy corpus dir → P1.
  - Detection of plaintext credential pattern in any log → P1.
- Alerts mirrored to two independent channels (on-prem ntfy + offsite SMS gateway) to defeat local-only suppression.

## 8.11 Separation of PHI vs Non-PHI Modules (Recommended)

- Separate physical host or strictly separate VM with PCIe GPU passthrough for non-PHI generative work.
- Separate VLAN with **no L3 route** to PHI zones — verified by router ACL audit AND active probe (must time out).
- Separate identity store (different OIDC realm).
- Separate storage; no shared NFS/SMB; no shared LDAP.
- Admin context switch is explicit and logged.
- Quarterly red-team probe from the non-PHI side to confirm zero PHI reachability.

## 8.12 Secrets Management (Recommended)

- Hashicorp Vault clustered (Raft), auto-unseal via Shamir 3-of-5 operator quorum.
- **No secrets in env files, container images, or git.** CI fails on detection (gitleaks).
- AppRole + workload identity (signed JWT from app) for service auth to Vault.
- PKI engine issues short-lived (24h) mTLS certs to all services.
- Transit engine for envelope encryption of PHI exports.
- Audit device → Z6 WORM.
- Root token sealed in tamper-evident envelope, vaulted physically; emergency-only.

## 8.13 Change Control (Recommended)

- All host & container config managed via Ansible (or equivalent) from a signed-commit Git repo.
- All changes via PR with two approvers; CI runs OpenSCAP, Lynis, Trivy, kics/checkov, gitleaks.
- Drift detection nightly; non-emergency drift auto-reverted.
- Production deploys via gated pipeline; emergency change requires post-hoc CAB review within 5 business days.

## 8.14 Vulnerability Management (Recommended)

- Trivy scan per image build.
- Weekly OpenSCAP scan of hosts.
- Monthly authenticated network scan from Z7 against all zones.
- Quarterly external pentest by independent firm.
- SLA: Critical 72h, High 7d, Medium 30d, Low 90d.

## 8.15 Incident Response Readiness (Recommended)

- 24/7 on-call rotation for Security Officer + IT lead.
- IR runbooks for: account compromise, container escape, suspected data exfil, ransomware, audit chain break, backup tamper, VPN compromise, suspected SA-key leak.
- Communication tree printed and laminated (out-of-band reachable).
- Forensic image kit (write-blockers, sealed evidence drives, chain-of-custody forms).
- Pre-arranged external IR firm for surge capacity.

## 8.16 PHI Minimization (Recommended)

- Pseudonymization layer where compatible with task accuracy.
- DLP scan on outputs before leaving the inference path (regex + ML for SSN/MRN/DOB; allowlist of permitted identifier shapes per workflow).
- Exports require Admin role + DLP scan + 2-person approval + audit entry.

## 8.17 Admin Workstation Standard (Recommended)

- Dedicated admin device — no email, no general browsing.
- FDE (BitLocker / LUKS), TPM-bound; EDR with tamper protection.
- Patch within 7 days for critical OS/browser vulns.
- USB storage class blocked except whitelisted secure tokens.
- Hardened browser profile, no extensions except approved.
- Locked screen on idle 5 min; auto-logout 30 min.
- Quarterly device attestation review.

## 8.18 Operational Cadences (Recommended)

| Activity | Cadence |
|---|---|
| Patch — Critical CVE | 72h |
| Patch — High | 7d |
| Patch — Medium | 30d |
| Patch — Low | 90d |
| Access review | Quarterly |
| Backup restore drill | Quarterly |
| Internal pentest | Quarterly |
| External pentest | Annually |
| IR tabletop | Semi-annually |
| Audit chain verifier | Continuous |
| FIM scan | Nightly |
| Image rebuild | Weekly |
| DR full failover test | Annually |

---

## 8.19 Acceptance

This manifest is the **target** baseline. Acceptance against it requires:

1. Implementation evidence for every section above (configs, screenshots, scan reports, SBOMs, signed manifests).
2. A clean 100-consecutive-pass run of the simulation in [06](./06-Breach-Simulation-100-Pass.md).
3. Sign-off by HIPAA Security Officer and SOC 2 control owner.

**As of this assessment, none of these acceptance conditions are met for Brad 1.0.** This document records the recommended target only.
