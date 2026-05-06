# 08 — Final System Hardening Manifest

**Status:** Approved baseline after 100 consecutive pass validation.
**Authority:** This manifest supersedes all prior configuration. Drift triggers automatic alert and revert.
**Enforcement:** Ansible-managed; signed-commit GitOps; OpenSCAP/Lynis/Trivy/Falco probes.

---

## 8.1 Network

| Item | Setting |
|---|---|
| Internet ingress | WireGuard UDP only, edge appliance |
| All other ingress | DROP |
| Egress default | DROP |
| Egress allowlist | Per-host explicit; Z3 has only Z6 + model mirror |
| East-west | mTLS only; plaintext denied by Falco |
| Zone segmentation | 7 PHI zones + 1 isolated non-PHI VLAN; router ACL DROP between Z-NPHI and PHI zones |
| Admin API | Separate hostname, bound to mgmt VLAN, denied at L3 elsewhere |
| DNS | Internal CoreDNS only; PHI hosts cannot resolve external |
| NTP | Two GPS-disciplined stratum-1 internal sources; chrony alarms |

---

## 8.2 Identity & Access

| Item | Setting |
|---|---|
| Auth | OIDC (Authentik/Keycloak) + FIDO2 mandatory |
| TOTP | Backup only, HSM-stored seed |
| SMS / email-link / push | **Disabled** |
| Admin keys | Two FIDO2 keys per admin (primary + offline backup) |
| Recovery | In-person + 2-person admin + new enrollment ceremony |
| Session | 15 min idle, 8 h hard cap, server-side revoke on logout |
| RBAC | OPA-evaluated, deny-by-default, claims-based; URL patterns are not authoritative |
| Two-person rule | Enforced for: PIPs, corrective actions, chart writes, policy corpus updates, model updates, Vault rekey, backup restore/prune, role grants ≥ Admin, firewall changes, image deploys |
| SoD | No user holds both Admin and Compliance/Auditor |

---

## 8.3 Encryption

| Item | Setting |
|---|---|
| At rest | LUKS2 + Postgres TDE + pgcrypto column-level on identifiers + MinIO SSE-KMS via Vault transit |
| In transit external | TLS 1.3 only, AEAD ciphers, HSTS preload |
| In transit internal | mTLS 1.3, 24h cert TTL, Vault PKI, SAN-based authz |
| Key custody | Vault clustered Raft, Shamir 3-of-5 unseal, root key sealed offline |
| Backup keys | Separate KEK in Vault, distinct from data KEK |

---

## 8.4 Linux Host

| Item | Setting |
|---|---|
| Distro | Ubuntu 24.04 LTS or RHEL 9 |
| Boot | Secure Boot + signed kernel + LUKS2 + TPM2 unsealing |
| Kernel | `lockdown=confidentiality`, `kptr_restrict=2`, `dmesg_restrict=1`, `unprivileged_bpf_disabled=1`, `yama.ptrace_scope=2`, `randomize_va_space=2` |
| Filesystem | Protected hardlinks/symlinks/fifos/regular |
| Swap | Disabled on inference hosts; encrypted random per-boot key elsewhere |
| Core dumps | Disabled (`fs.suid_dumpable=0`, `LimitCORE=0`) |
| MAC | AppArmor (Ubuntu) / SELinux (RHEL) enforcing, custom profiles per service |
| Firewall | nftables default DROP both directions; per-host allowlist |
| SSH | ed25519 only (FIDO2-backed for admins), CA-signed certs 8h TTL, no root, no password, AllowGroups, modern ciphers |
| sudo | requiretty, use_pty, logfile, no NOPASSWD |
| Auditd | CIS+custom rules, `-e 2` lock, ship to Z6 |
| FIM | AIDE nightly + osquery live |
| Anti-malware | ClamAV + Falco runtime |
| Patching | unattended-upgrades, monthly cadence, 72h Critical SLA |
| Hidden /proc | `hidepid=2` |

---

## 8.5 Docker / Containers

| Item | Setting |
|---|---|
| Runtime | Rootless preferred; userns-remap if rootful |
| Daemon | live-restore on, no-new-privileges global |
| Socket | UNIX only, never mounted into containers |
| seccomp | Default + per-service stricter where possible |
| AppArmor | Per-service profile required |
| Capabilities | cap_drop: ALL; explicit cap_add only |
| Filesystem | --read-only + tmpfs for writable paths |
| Resource limits | pids/memory/cpus/ulimits set per container |
| Image source | Internal registry mirror; Distroless/Chainguard/verified base |
| Image trust | cosign signing required; admission denies unsigned |
| Image pin | SHA256 digest, no `latest` |
| SBOM | CycloneDX per image, reviewed quarterly |
| Vuln scan | Trivy in CI gates Critical/High |
| GPU runtime | nvidia, no --privileged, --gpus only |

---

## 8.6 GPU Inference (Z3)

| Item | Setting |
|---|---|
| Hardware | Dedicated host(s); 4× RTX 6000 Ada; no co-tenancy with non-PHI |
| Driver | Pinned vetted version |
| Compute mode | EXCLUSIVE_PROCESS |
| Worker model | One process per session; killed at session end |
| Memory hygiene | cudaMemset on spawn + 2GB allocate-zero-free wipe |
| KV / prefix cache | Disabled cross-session |
| Canary monitor | Synthetic canary every 10 min; P1 if leak |
| Egress | DROP all; Z6 audit + model mirror only |
| Model files | Read-only mount, signed manifest |
| Prompt logging | Captured to Z6 (encrypted) |
| Output DLP | Regex+ML scan before response leaves Z3 |
| Memory acquisition tools | Denied via AppArmor + ptrace_scope |

---

## 8.7 Storage / Database

| Item | Setting |
|---|---|
| Postgres | mTLS only (`pg_hba`), per-service users least privilege, RLS on PHI tables, pgaudit, `pgcrypto` on identifiers |
| App role | No direct INSERT/UPDATE on chart tables; writes via broker role only |
| Extensions | Allowlist; superuser only via 2-person ceremony |
| MinIO | Bucket policies per service, presigned URLs disabled on PHI bucket, mTLS API |
| WORM bucket (audit) | Object-lock Compliance mode, 7-year retention |
| Backup bucket | Object-lock Compliance, IAM Deny on lock-mutation actions |

---

## 8.8 Audit Pipeline

| Item | Setting |
|---|---|
| Sources | App audit, OPA, vLLM I/O, Caddy, WG, auditd, Falco, Docker events, Vault, pgaudit, MinIO audit |
| Transport | mTLS to Z6 |
| Storage | Wazuh indices + WORM raw |
| Integrity | Hash chain per batch; hourly root anchored to offline HSM |
| Verifier | Continuous; alarm on chain break (P1) |
| Retention | 7 years audit; 1 year operational |
| Failover | Local agent buffer; sensitive ops fail-closed if Z6 unreachable |

---

## 8.9 Backup & Recovery

| Item | Setting |
|---|---|
| Tool | Restic, append-only repo |
| Destinations | (1) LTO-9 encrypted offline, weekly rotation; (2) MinIO offsite, object-lock Compliance |
| Schedule | Daily incremental, weekly full |
| Encryption keys | Vault, separate KEK |
| Restore | 2-person Vault unwrap; staged scan before production restore |
| Drill | Quarterly end-to-end |
| Forget/prune | Through approval engine; 2-person; daily delete-attempt probe |
| RTO / RPO | 4h / 1h |

---

## 8.10 Secrets

| Item | Setting |
|---|---|
| Store | Vault (Raft cluster, Shamir 3-of-5) |
| Service auth | AppRole + workload-identity JWT |
| Distribution | vault-agent template; no env vars; no secrets in images or git |
| Detection | gitleaks in CI |
| PKI | Internal CA, offline root, 1-year intermediate, 24h leaf, auto-rotated |
| Audit | Vault audit device → Z6 |

---

## 8.11 Approval Engine (Two-Person Rule)

| Item | Setting |
|---|---|
| Constraint | DB UNIQUE (action_id, approver_subject) |
| Predicate | COUNT(DISTINCT subject AND distinct FIDO2 cred) ≥ 2 |
| Throttle | 1 approval per 2 sec per user |
| Replay | Idempotency key + nonce per envelope |
| Property test | 1,000-iteration concurrent fuzz in CI |
| Logged | Per-approval FIDO2 attestation to Z6 |

---

## 8.12 Reverse Proxy (Caddy)

| Item | Setting |
|---|---|
| TLS | 1.3 only, AEAD, HSTS preload, internal-CA-issued |
| Path normalization | Strict; reject if normalized != raw |
| Encoded slash | Rejected for routing decisions |
| Admin route | Separate hostname, mgmt-VLAN bind |
| Headers | CSP `default-src 'self'`, X-Frame-Options DENY, Referrer-Policy strict-origin, Permissions-Policy minimal |
| Rate limit | Per-IP, per-route, per-user |
| Logging | mTLS to Z6 |

---

## 8.13 Remote Access (WireGuard)

| Item | Setting |
|---|---|
| Protocol | WireGuard UDP, non-default port |
| Peer keys | Per-user, per-device, TPM-backed where available |
| Device cert | Required at Caddy mTLS layer |
| Posture check | OS patch level, FDE on, EDR running |
| Idle / hard cap | 15 min / 8 h |
| Revocation | <60s runbook (peer + Vault + OIDC) |
| Logging | All connect/disconnect to Z6 |

---

## 8.14 Endpoint (Admin Workstation)

| Item | Setting |
|---|---|
| Use | Dedicated; no email/general browsing |
| FDE | BitLocker / LUKS, TPM-bound |
| EDR | Tamper-protected, current sigs |
| Patching | 7d for Critical OS/browser |
| USB | Storage class blocked; only allowlisted FIDO2 VID/PID |
| Browser | Hardened profile, no extensions except approved |
| Idle/lock | 5 min / 30 min auto-logout |
| Attestation | Quarterly review |

---

## 8.15 Non-PHI Module (Z-NPHI / ComfyUI)

| Item | Setting |
|---|---|
| Host | Separate physical or VM with PCIe GPU passthrough |
| Network | Separate VLAN; no L3 route to PHI zones |
| Identity | Separate OIDC realm; tokens not interchangeable |
| Storage | Local; no shared NFS/SMB/MinIO with PHI |
| Admin context | Explicit switch, logged |
| Verification | Quarterly red-team probe to confirm zero PHI reachability |

---

## 8.16 Monitoring & Alerting

| Item | Setting |
|---|---|
| SIEM | Wazuh |
| Critical (P1) | Audit chain break; egress from Z3; FIM change in /etc, /opt/brad; non-admin 2xx on /admin*; canary leak in Z3; backup delete success on probe |
| High (P2) | Failed FIDO2 burst; new admin role assignment; WG peer change; container shell |
| Channels | On-prem ntfy + offsite SMS gateway (dual, prevents local suppression) |
| On-call | 24/7 Security Officer + IT lead rotation |

---

## 8.17 Change Control

| Item | Setting |
|---|---|
| Source | GitOps with signed commits |
| Review | Two reviewers per PR |
| CI gates | OpenSCAP, Lynis, Trivy, kics, gitleaks, image cosign verify, property tests |
| Drift | Nightly detection, auto-revert non-emergency |
| Emergency | Post-hoc CAB within 5 business days |

---

## 8.18 Forensic Readiness

| Item | Setting |
|---|---|
| Disk imaging | Kit + procedure |
| Memory acquisition | LiME signed for current kernel |
| Container snapshot | CRIU or filesystem+state dump |
| Chain of custody | Form template; sealed evidence drives |
| External IR retainer | Pre-arranged |

---

## 8.19 Compliance Cadences

| Activity | Cadence |
|---|---|
| Access review | Quarterly |
| Patch review | Monthly + emergency |
| Backup restore drill | Quarterly |
| DR tabletop | Semi-annual |
| Internal pentest | Quarterly |
| External pentest | Annual |
| Risk register review | Semi-annual |
| Policy review | Annual |
| Training (all staff) | Annual + quarterly phish sim |
| Z-NPHI isolation probe | Quarterly |
| Audit chain manual verification | Monthly + post-incident |
