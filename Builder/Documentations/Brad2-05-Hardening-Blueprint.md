# 05 â€” Hardening Blueprint

**Purpose:** Define the hardened baseline for every layer of Brad.pi.
**Authority:** This document is the source of truth for system configuration. Any deviation requires Security Officer sign-off and a documented compensating control.
**Validation:** Every item here is enforced via Ansible + tested via OpenSCAP / Lynis / Trivy / Falco / custom probes.

---

## 5.1 Linux Host Baseline (Ubuntu 24.04 LTS or RHEL 9)

### 5.1.1 Kernel & Boot
- Secure Boot enabled, kernel signed.
- Kernel `lockdown=confidentiality` mode.
- `kptr_restrict=2`, `dmesg_restrict=1`, `kernel.unprivileged_bpf_disabled=1`, `kernel.yama.ptrace_scope=2`.
- `fs.protected_hardlinks=1`, `fs.protected_symlinks=1`, `fs.protected_fifos=2`, `fs.protected_regular=2`.
- IPv6 disabled if not used; otherwise hardened (`net.ipv6.conf.all.disable_ipv6` per policy).
- ASLR full (`kernel.randomize_va_space=2`).
- Disable unused FS modules: `cramfs`, `freevxfs`, `jffs2`, `hfs`, `hfsplus`, `udf`, `usb-storage` (server class).
- LUKS2 full disk encryption with TPM 2.0 + PIN unsealing for boot, recovery key escrowed in Vault.

### 5.1.2 Packages & Patching
- Minimal install profile; no GUI; no compilers in production hosts.
- `unattended-upgrades` for security patches; reboots scheduled in maintenance window with health checks.
- Monthly full patch cadence; emergency patch SLA 72h for Critical CVEs, 7d for High.
- Package source: official distro mirror over HTTPS; cryptographic signature verification mandatory.

### 5.1.3 Users & Sudo
- No interactive root login.
- Admin users via individual accounts; group `wheel` / `sudo` membership audited monthly.
- `sudo` policy enforced via Ansible-managed `/etc/sudoers.d/*` files; `requiretty`, `use_pty`, `logfile=/var/log/sudo.log`, no `NOPASSWD` for any privileged op.
- Service accounts: nologin shell, no home dir, UID < 1000 reserved; one account per service, no shared.

### 5.1.4 SSH
- `Port` non-default and only exposed on management VLAN.
- `PermitRootLogin no`, `PasswordAuthentication no`, `ChallengeResponseAuthentication no`, `PubkeyAuthentication yes`.
- Key types: ed25519 only; FIDO2-backed (`sk-ssh-ed25519@openssh.com`) for admins.
- `AllowGroups ssh-admins`.
- `MaxAuthTries 3`, `LoginGraceTime 20`, `ClientAliveInterval 300`, `ClientAliveCountMax 0`.
- Ciphers/MACs/KEX: modern only (`chacha20-poly1305@openssh.com`, `aes256-gcm@openssh.com`, `hmac-sha2-512-etm@openssh.com`, `curve25519-sha256`).
- All SSH sessions recorded via `auditd` exec logging + `tlog`/`asciinema` on bastion.
- SSH CA-signed certificates with 8-hour TTL preferred over static authorized_keys.

### 5.1.5 Mandatory Access Control
- **AppArmor** (Ubuntu) or **SELinux** (RHEL) **enforcing** for all services.
- Custom profiles for Brad API, vLLM worker, Caddy, Postgres, MinIO, Wazuh agent.
- Confined Docker (Moby) and containerd profiles.

### 5.1.6 Firewall (host)
- `nftables` default-DROP for input and forward.
- Allowed input: WireGuard UDP (Edge nodes only), management SSH (mgmt VLAN only), monitoring scrape from Z6 (specific source).
- Allowed output: explicit per-service allowlist; default DROP. NTP, internal DNS, internal MinIO, internal Postgres, Vault â€” that's it.
- IPv6 firewall mirrors v4.

### 5.1.7 Auditd
- Ruleset based on CIS + custom: capture `execve`, file writes to `/etc`, `/usr/bin/sudo`, mount events, time-changes, identity changes, network namespace ops, ptrace.
- Audit log shipped to Z6 in real time via `auditbeat` over mTLS; local copy retained 30 days.
- `auditd` configured with `-e 2` to lock the rules until reboot; reboot requires change ticket.

### 5.1.8 File Integrity (FIM)
- **AIDE** baseline taken post-provision; nightly check; report to Z6.
- **osquery** for live state queries from SIEM.
- Critical paths monitored: `/etc`, `/boot`, `/usr/bin`, `/usr/sbin`, `/lib`, `/lib64`, `/var/lib/docker`, `/opt/brad`.

### 5.1.9 Time
- Two stratum-1 internal NTP sources (GPS-disciplined preferred); chrony with `makestep 1.0 3`; max drift alert at 100 ms.
- Time critical for audit chain ordering and TLS validity.

### 5.1.10 Logging
- `journald` persistent, forward to `rsyslog` â†’ mTLS â†’ Wazuh ingester in Z6.
- Local retention 14 days; central retention 7 years for audit-relevant streams.

### 5.1.11 Endpoint Anti-malware
- ClamAV with daily signature update from internal mirror; on-demand scans of staging dirs and inbound files.
- **Falco** runtime detection for kernel/syscall anomalies inside containers.

---

## 5.2 Docker / Container Runtime

### 5.2.1 Daemon
- **Rootless mode preferred** for application containers; rootful only where required (GPU access via NVIDIA runtime).
- `userns-remap` enabled where rootful.
- `live-restore: true`.
- `no-new-privileges: true` daemon-wide.
- TLS-only daemon socket if exposed; otherwise UNIX socket only with strict perms (`root:docker`, 0660), and **no container ever mounts `/var/run/docker.sock`**.
- `seccomp: default` enforced; per-service custom profiles where stricter is possible.
- `apparmor` profile required per service.
- Default `cap_drop: ALL`; explicit `cap_add` only what's needed (`NET_BIND_SERVICE` etc.).
- `pids-limit`, `memory`, `cpus`, `ulimits` set per container.
- `--read-only` filesystem with explicit `tmpfs` mounts where writes are needed.
- `/proc` masked (`-v /proc:/host-proc:ro,rslave` not used; default masked paths kept).

### 5.2.2 Images
- Base images from **Distroless / Chainguard / verified upstream only**; pinned by SHA256 digest, not tag.
- All images signed with **cosign** (keyless via internal Fulcio or Vault-managed keypair); admission policy rejects unsigned.
- **Trivy** scan in CI; build fails on Critical/High CVE without an exception ticket.
- SBOM generated (CycloneDX) and stored alongside image; reviewed quarterly.
- No `latest` tag in production manifests.

### 5.2.3 Networking
- User-defined bridge networks per zone; ICC disabled where possible.
- Inter-container traffic across zones routed via host firewall + mTLS only.
- DNS: internal CoreDNS; outbound DNS denied at firewall.

### 5.2.4 Compose / Orchestration
- Single source of truth: GitOps repo with signed commits.
- `docker compose` configs validated by `kics`/`checkov` in CI.

---

## 5.3 GPU Inference Host (Z3)

### 5.3.1 Hardware Layout
- Dedicated host(s) with 4Ã— RTX 6000 Ada.
- Host runs **only** PHI inference; ComfyUI/marketing strictly on a different physical host.
- BMC/IPMI on isolated mgmt VLAN; default creds rotated; firmware patched; redfish over TLS only.

### 5.3.2 Driver & Toolkit
- NVIDIA driver pinned, vetted version; updates tested in staging.
- NVIDIA Container Toolkit via runtime class `nvidia`; **no `--privileged`**, `--gpus` only.
- `nvidia-persistenced` enabled; persistence mode on for predictable reset behavior.
- `nvidia-smi --compute-mode=EXCLUSIVE_PROCESS` to prevent unintended sharing.

### 5.3.3 vLLM Worker Pattern
- One worker process **per session**; killed at session end.
- Worker recycle calls `torch.cuda.empty_cache()` AND a deliberate large-then-small `cudaMemset` allocation pattern to overwrite freed memory pages, then exits.
- KV-cache **scoped per session**; cross-user cache reuse disabled.
- Prompt + output captured via wrapper to Z6 audit before any response leaves Z3.

### 5.3.4 VRAM Hygiene
- Periodic GPU reset on idle (>15 min) via `nvidia-smi --gpu-reset` where supported, or full process restart of worker pool nightly.
- After model swap or driver reload, run a "wipe-and-fill" canary that verifies no plaintext ASCII patterns remain in newly allocated buffers (sanity check; documented limitation: not a cryptographic guarantee).
- Compute mode prevents foreign processes from attaching.

### 5.3.5 Model Provenance
- Qwen weights downloaded once over verified channel; SHA-256 recorded; mounted **read-only**.
- Model swaps require signed manifest + Security Officer approval + tested in staging first.

### 5.3.6 Egress
- Inference host firewall: **DROP all egress** except to Z6 audit (mTLS) and internal model weights mirror (read-only). No internet, ever.

---

## 5.4 Storage

### 5.4.1 At-Rest Encryption
- LUKS2 on all data volumes.
- Postgres TDE via filesystem encryption + `pgcrypto` for column-level encryption of identifiers (MRN, SSN, DOB).
- MinIO SSE-KMS keys served by Vault transit engine; per-bucket key.

### 5.4.2 Access Control
- Postgres: per-service DB user with least privilege; `pg_hba` mTLS only; no `trust` anywhere.
- RLS policies for tenant/site separation.
- MinIO: bucket policies per service; signed URLs disabled for PHI bucket; access only via mTLS API.

### 5.4.3 Data Lifecycle
- PHI retention per medical record retention law (state-specific, default 10 years post last service); automated archival to LTO with sealed retention metadata.
- Crypto-shred at end of life (destroy KEK in Vault); documented certificate of destruction.

---

## 5.5 Secrets Management (Vault)

- **Hashicorp Vault** clustered (Raft) with auto-unseal via Shamir 3-of-5 operator quorum.
- **No secrets in environment files, container images, or git.** CI fails on detection (gitleaks).
- AppRole + workload identity (signed JWT from Brad API) for service auth to Vault.
- PKI engine issues short-lived (24h) mTLS certs to all services.
- Transit engine for envelope encryption of PHI exports.
- Audit device â†’ Z6 WORM.
- Root token sealed in tamper-evident envelope, vaulted physically; emergency-only.

---

## 5.6 RBAC / Identity

### 5.6.1 Roles
| Role | Permissions |
|---|---|
| Admin | Full admin in Z2/Z7 (with 2-person rule on destructive ops); cannot read PHI by default; can grant break-glass |
| DON (Director of Nursing) | Read PHI in scope; propose & co-approve PIPs |
| QA | Read PHI in scope; review chart findings; cannot approve PIPs |
| Compliance | Read PHI; co-approve PIPs; read all audit |
| IT | Operate infrastructure; cannot read PHI; cannot disable audit |
| Auditor | Read-only audit + read-only configuration; cannot read PHI charts |
| ReadOnlyClinical | Read PHI in scope; no write |
| ServiceAccount-* | Per-service least privilege via mTLS |

### 5.6.2 Enforcement
- OIDC issues role claims; OPA evaluates per request; deny-by-default.
- All role assignments logged; quarterly access review with attestation by data owners.
- Separation of duties: no single user holds both `Admin` and `Compliance`/`Auditor`.

---

## 5.7 MFA

- **Primary:** FIDO2 hardware key (YubiKey 5 series or equivalent).
- **Backup:** TOTP with HSM-stored seed; usable only after enrollment + admin approval.
- **No SMS, no email-link, no push-notification fatigue patterns.**
- Recovery requires in-person verification + 2-person admin approval + replacement FIDO2 enrollment ceremony.
- Admin accounts require **two FIDO2 keys** (primary + offline backup in safe).

---

## 5.8 VPN / Remote Access (WireGuard)

- WireGuard server on dedicated edge appliance/VM in Z0.
- Per-user, per-device peer keys; key generated on device (TPM-backed where available); public key registered via signed enrollment.
- Edge appliance authenticates client via cert in addition to WG handshake (using Caddy mTLS at next hop).
- Posture check: lightweight agent attests OS patch level, FDE on, EDR running.
- Idle disconnect 15 min; max session 8h.
- All connect/disconnect logged to Z6 with peer key fingerprint, source IP, posture report.
- Revocation via removing peer + Vault token revoke + OIDC session kill â€” runbook target <60s.

---

## 5.9 TLS / Certificate Management

- TLS 1.3 only externally; TLS 1.3 internally (mTLS).
- Cipher suites: AEAD only.
- Internal CA: Vault PKI root offline; intermediate online with 1-year validity, auto-rotated.
- Service certs: 24-hour TTL, auto-renewed via Vault agent.
- CT log not used internally; pinning via mTLS trust store.
- HSTS, CSP, X-Frame-Options DENY, Referrer-Policy strict-origin, Permissions-Policy minimal â€” all enforced at Caddy.

---

## 5.10 Logging & Audit Integrity

### 5.10.1 Sources
- App audit (Brad API) â€” every action with actor, role, target, outcome, OPA decision id.
- OPA decisions.
- Inference prompts/outputs (encrypted; Z6 only).
- Caddy access logs.
- WireGuard.
- Auditd (host).
- Falco (runtime).
- Docker events.
- Vault audit.
- Postgres `pgaudit`.
- MinIO audit.

### 5.10.2 Pipeline
```
Source â†’ local agent (Wazuh / Filebeat / auditbeat) â†’ mTLS â†’ Z6 ingester
   â†’ Wazuh manager â†’ enrich â†’ write to:
     (a) Wazuh indices (search)
     (b) Append-only WORM bucket (raw, hash-chained batches)
   â†’ hourly chain root anchored to offline notary device
```

### 5.10.3 Integrity
- Each batch contains: `prev_hash`, `batch_hash`, `batch_id`, `timestamp`, `count`.
- Verifier job runs continuously; alarm on chain break.
- Hourly anchor: root hash signed with offline HSM (admin workstation USB) and stored separately.

### 5.10.4 Retention
- 7 years for audit (HIPAA-aligned).
- 1 year for operational logs.
- Legal hold mechanism documented.

---

## 5.11 Backup & Recovery

- **Restic** to two destinations:
  1. Local LTO-9 tape, encrypted, sealed, off-site rotation weekly.
  2. Secondary MinIO at a different physical site, with object-lock + append-only Restic config.
- Daily incremental, weekly full.
- Quarterly **restore drill** to clean staging environment; integrity verified end-to-end.
- Backup encryption keys held in Vault (separate KEK, not the production data KEK).
- **Backup writer cannot delete** â€” append-only repo + WORM bucket policy.

---

## 5.12 Incident Response Readiness

- 24/7 on-call rotation for Security Officer + IT lead.
- IR runbooks for: account compromise, container escape, suspected data exfil, ransomware, audit chain break, backup tamper, VPN compromise.
- Communication tree printed and laminated (out-of-band reachable).
- Forensic image kit ready: write-blockers, sealed evidence drives, chain-of-custody forms.
- Pre-arranged external IR firm for surge capacity.

---

## 5.13 PHI Minimization

- Prompts to LLM should minimize patient identifiers; pseudonymization layer where compatible with task accuracy.
- Outputs scanned by DLP rules before leaving Z3 (regex + ML for SSN/MRN/DOB; allowlist of permitted identifier shapes per workflow).
- Exports require Admin role + DLP scan + 2-person approval + audit entry.

---

## 5.14 Admin Workstation Requirements

- Dedicated admin device (no general browsing, no email).
- FDE (BitLocker / LUKS), TPM-bound.
- EDR running with tamper protection.
- Patched within 7 days for critical OS/browser vulns.
- USB device control: storage class blocked except whitelisted secure tokens.
- Browser: hardened profile, no extensions except approved.
- Locked screen on idle 5 min; auto-logout 30 min.
- Quarterly device attestation review.

---

## 5.15 Change Control & Configuration Management

- All host & container config managed via **Ansible** (or equivalent) from a signed-commit Git repo.
- All changes via PR with two approvers; CI runs OpenSCAP, Lynis, Trivy, kics.
- Drift detection runs nightly; deviations alert and auto-revert non-emergency changes.
- Production deploys via gated pipeline; emergency change requires post-hoc CAB review within 5 business days.

---

## 5.16 Vulnerability Management

- Trivy scan per image build.
- Weekly OpenSCAP scan of hosts.
- Monthly authenticated network scan from Z7 against all zones.
- Quarterly external pentest by independent firm.
- SLA: Critical 72h, High 7d, Medium 30d, Low 90d.

---

## 5.17 Egress Controls

- Default DROP at host firewall.
- Allowlist per host:
  - Z1 Caddy: 443 outbound to internal DNS, internal Vault, OIDC, Z2.
  - Z2 Brad: Z3 inference, Z4 retrieval, Z5 DB, Z6 audit, Vault.
  - Z3 inference: Z6 audit, internal model mirror (read-only). **No internet.**
  - Z5 DB: Z6 audit, Vault.
  - Z6: outbound only to offsite alerting gateway.
- DNS resolver: internal CoreDNS only; rejects queries for non-allowlisted external domains for PHI hosts.

---

## 5.18 Ingress Controls

- Single ingress: WireGuard UDP from internet â†’ edge.
- All other ingress denied at perimeter and host firewall.
- Internal services bound to specific zone interfaces, not `0.0.0.0`.

---

## 5.19 Internal Service-to-Service Authentication

- **mTLS everywhere east-west.**
- Service identity = certificate SAN; OPA authorizes based on identity.
- No shared secrets between services; Vault issues per-service short-lived material.

---

## 5.20 Container Image Provenance

- Cosign signing required; admission controller rejects unsigned.
- SBOM (CycloneDX) attached to each image.
- Source: internal registry mirror; no direct pull from public registries in production.
- Base image refresh cadence: weekly rebuild for security patches.

---

## 5.21 SIEM / Alerting

- **Wazuh** as SIEM; rules tuned to suppress noise but escalate:
  - Audit chain break â†’ P1, page immediately.
  - New admin role assignment â†’ P2.
  - WireGuard new peer or revocation â†’ P2.
  - Falco rule fire (e.g., `Terminal shell in container`) â†’ P1 for PHI zones.
  - Failed FIDO2 attempts > threshold â†’ P2.
  - Outbound connection attempt from Z3 inference â†’ **P1**.
  - File integrity change in `/etc`, `/opt/brad` â†’ P1.
- Alerts mirrored to two channels (on-prem ntfy + offsite SMS gateway) to prevent local-only suppression.

---

## 5.22 Forensic Readiness

- Disk imaging kit + documented procedure.
- Memory acquisition via LiME (kernel module pre-built and signed for current kernel).
- Container snapshot procedure (checkpoint via CRIU where available; otherwise filesystem + state dump).
- Evidence chain-of-custody form template.

---

## 5.23 ComfyUI / Marketing Module Isolation (Z-NPHI)

- **Separate physical host or strictly separate VM with PCIe GPU passthrough.**
- **Separate VLAN with no L3 route to PHI zones.** Verified by router ACL audit AND active probe from Z-NPHI to PHI ranges (must time out).
- **Separate identity store** (different OIDC realm).
- **Separate storage**; no shared NFS, no shared MinIO buckets, no shared LDAP.
- Admin context switch is explicit and logged.
- Quarterly verification: red team probe from Z-NPHI to confirm zero PHI reachability.

