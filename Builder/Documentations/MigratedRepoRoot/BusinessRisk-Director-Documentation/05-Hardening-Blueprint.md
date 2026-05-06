# 05 — Hardening Recommendations (Brad 1.0 LIVE)

**Purpose:** Document the recommended hardened baseline that, if adopted, would close the gaps identified for Brad 1.0.
**Status:** **RECOMMENDATIONS ONLY. NOT APPLIED.** This document does not modify the running system, the workstation, the codebase, or any policy.
**Reference target state:** the Brad 2.0 Hardening Blueprint (`../../Business Risk & Analytics Director Brad2.0/Documentation/05-Hardening-Blueprint.md`). This document highlights the **deltas** Brad 1.0 needs to close.

---

## 5.1 Recommendation Pattern

For each domain we list:
- **Current state (observed)**
- **Recommended state**
- **Recommended action (if Care Indeed chooses to implement)**

Nothing here is enforced by this assessment.

---

## 5.2 Topology — The Single Highest-Leverage Recommendation

- **Current:** PHI workload runs on the operator's general-purpose workstation; GPU is shared.
- **Recommended:** Move inference and PHI handling to a **dedicated host** with no co-tenancy and a dedicated GPU. Keep the operator's general-purpose workstation as a **client only**, accessing Brad over a hardened remote-access path.
- **Recommended action:** Treat Brad 2.0 as the target topology. Begin migration planning. Until then, treat Brad 1.0 as constrained per [01](./01-Executive-Security-Summary.md) §1.5.

---

## 5.3 Linux / Workstation Host Baseline (Recommended)

(All items below are recommendations, not changes.)

### 5.3.1 Kernel & Boot
- Confirm Secure Boot enabled on the workstation.
- Confirm full disk encryption (BitLocker on Windows, LUKS2 on Linux, FileVault on macOS) with TPM-backed unsealing.
- Confirm OS patch level current and `unattended-upgrades` (or vendor equivalent) enabled.

### 5.3.2 Users & Sudo / Admin
- Recommend **named individual accounts** for any human who touches Brad operationally; deprecate "the operator account."
- No interactive root / Administrator login.
- `sudo` / UAC actions should be logged centrally.

### 5.3.3 SSH (if exposed at all)
- Recommend SSH be **off** on the workstation if not strictly required.
- If required: key-only, FIDO2-backed (`sk-ssh-ed25519`), `PermitRootLogin no`, `PasswordAuthentication no`, on management VLAN only.

### 5.3.4 Mandatory Access Control / EDR
- Recommend EDR with tamper protection on the workstation.
- Consider AppArmor / SELinux profiles for the dev server and the LLM process (if Linux).

### 5.3.5 Host Firewall
- Recommend **default-DROP egress** for the LLM inference process specifically. The inference process must not be able to reach the internet.
- Inbound: allow only the local UI port to localhost; no LAN exposure unless intentional.

### 5.3.6 Auditd / Event Logging
- Recommend OS-level event logging (`auditd` on Linux, Sysmon/EVTX on Windows) shipped to a **separate** log destination the operator cannot modify.

### 5.3.7 File Integrity Monitoring
- Recommend AIDE (Linux) or osquery on the workstation, at minimum monitoring:
  - `Builder/`
  - the model weights directory
  - the policy corpus directory
  - the application binaries / `node_modules` integrity (this one is noisy; advisory only)

### 5.3.8 Time
- Recommend NTP from a reliable source; alert on drift > 100 ms (audit ordering depends on it).

### 5.3.9 Anti-malware
- Recommend EDR + on-demand scan of any inbound files (chart uploads).

---

## 5.4 GPU / VRAM (Highest Brad-1.0-Specific Risk)

- **Current:** Shared GPU; no per-session worker recycle observed; no `cudaMemset` hygiene; no per-session KV-cache scoping confirmed.
- **Recommended:**
  - **One worker process per session**, killed at session end.
  - On worker recycle, perform `torch.cuda.empty_cache()` plus a deliberate large-then-small `cudaMemset` allocation overwrite.
  - **Disable cross-session KV-cache reuse.**
  - Set `nvidia-smi --compute-mode=EXCLUSIVE_PROCESS` so other GPU consumers cannot attach.
  - **Stop running non-PHI GPU workloads on the same physical GPU.** This is the single most effective remanence mitigation.
  - Consider periodic `nvidia-smi --gpu-reset` on idle (where supported).
  - After every model swap or driver reload, run a "wipe-and-fill" canary that scans newly allocated buffers for residual ASCII patterns (sanity check, not a cryptographic guarantee).

> **Acknowledged limitation:** Even with the above, VRAM hygiene on a shared workstation GPU is **best-effort**. The defensible posture is a **dedicated** inference host, as in Brad 2.0.

---

## 5.5 Local Service Architecture

- **Current:** Local processes on a single user; no internal authentication.
- **Recommended (interim, before full Brad 2.0 migration):**
  - Bind UI / dev server strictly to `127.0.0.1`; never `0.0.0.0`.
  - Consider running the LLM process under a **distinct service account** (separate user) so the operator's general-use account cannot read its memory or temp files casually.
  - Add a token-based auth check between the UI and the local inference endpoint (even a localhost-only token defeats casual co-tenant scraping).

- **Long-term (Brad 2.0):**
  - mTLS east-west; OPA policy decision on every action; signed envelopes for write operations.

---

## 5.6 Storage / PHI Artifacts

- **Current:** PHI may persist in `tmp-*.json` files, dev server stdout, browser cache/IndexedDB, and the working tree.
- **Recommended:**
  - Define a **single, encrypted PHI workspace directory**; configure the application to write all PHI artifacts there only.
  - **Exclude that directory from any cloud sync** (OneDrive/Drive/Dropbox) and from the git working tree.
  - Add a `.gitignore` audit step in the operator's startup runbook (recommendation; not implemented here).
  - Configure browser storage policy to **clear site data on close** for the Brad UI origin.
  - Disable verbose/dev-mode logging when handling PHI.

---

## 5.7 Secrets Management

- **Current:** `Builder/orbital-stage-443721-v1-99d78d776418.json` is plaintext in the working tree.
- **Recommended (in priority order):**
  1. **Treat this credential as compromised** for the purposes of risk planning, regardless of whether a leak has actually occurred. Plan a credential rotation in coordination with the Google Cloud project owner.
  2. **Remove the file from the working tree** and from git history (`git filter-repo` or equivalent), then **rotate the key**.
  3. Move secrets to a real secrets manager (Vault, 1Password CLI, age-encrypted SOPS, OS keychain) and load via runtime injection, not on-disk JSON.
  4. Add a **gitleaks** pre-commit hook to prevent recurrence.
  5. Confirm the BAA scope of the underlying Google service. If the integration is not BAA-covered for PHI, the integration itself needs review.

> This is the single highest-leverage action that requires **no architectural change** and would meaningfully reduce risk today.

---

## 5.8 RBAC / Identity (Recommended)

- **Current:** Single operator identity = effective superuser.
- **Recommended:** Adopt the Brad 2.0 role model:
  - `Admin`, `DON`, `QA`, `Compliance`, `IT`, `Auditor`, `ReadOnlyClinical`, `ServiceAccount-*`.
  - OIDC + FIDO2 + OPA enforcement.
  - Quarterly access review with named-owner attestation.
  - Separation of duties: no single user holds both `Admin` and `Compliance`/`Auditor`.

---

## 5.9 MFA (Recommended)

- **Current:** Whatever MFA the operator's identity provider enforces; no Brad-specific FIDO2 requirement observed.
- **Recommended:** FIDO2 hardware key required for any human accessing Brad; TOTP only as HSM-backed backup; no SMS, no email link, no push fatigue.
- Admins should hold **two FIDO2 keys** (primary + offline backup).

---

## 5.10 Remote Access (Recommended)

- **Current:** Remote access depends on the operator's workstation being on, plus whatever tunnel software is configured.
- **Recommended:**
  - Move to a **WireGuard appliance** (or equivalent hardened tunnel) that is **not** the operator's workstation.
  - Per-user, per-device peer keys with TPM-backed key generation.
  - Posture check before connect (OS patch level, FDE on, EDR running).
  - Idle disconnect 15 min; max session 8h.
  - All connect/disconnect events logged to a destination the operator cannot modify.
  - Documented sub-60-second revocation runbook.

---

## 5.11 TLS / Certificate Management (Recommended)

- **Current:** Whatever the dev server and tunnel happen to use.
- **Recommended:** TLS 1.3 only; AEAD ciphers; internal CA via Vault PKI; service certs with 24-hour TTL; HSTS, CSP, X-Frame-Options DENY, Referrer-Policy strict-origin enforced at the proxy.

---

## 5.12 Logging & Audit Integrity (Critical Recommendation)

- **Current:** Mutable, operator-deletable.
- **Recommended:**
  - Stand up a **WORM** sink (MinIO with object-lock, or AWS S3 Object Lock in a separate account/BAA-covered, or equivalent).
  - Ship log batches with `prev_hash`, `batch_hash`, `batch_id`, `timestamp`, `count` — hash-chained.
  - Hourly chain root signed with an **offline** HSM (USB security key on a separate admin machine).
  - Continuous verifier alarm on chain break.
  - 7-year retention for audit; 1-year for operational.
  - Until this is in place, **no operator should be able to delete log files**; that alone is a meaningful interim win.

---

## 5.13 Backup & Recovery (Recommended)

- **Current:** Not observed segregated.
- **Recommended:** Restic to two destinations (local LTO + offsite append-only MinIO with object-lock); daily incremental + weekly full; quarterly restore drill; backup keys in Vault distinct from data KEKs; backup writer cannot delete (append-only).

---

## 5.14 Incident Response Readiness (Recommended)

- **Current:** No Brad-1.0 IR runbook observed.
- **Recommended:** Author IR runbooks for: account compromise, suspected data exfil, ransomware, audit chain break (when audit exists), backup tamper, tunnel compromise, Google-SA-key suspected leak. Maintain a printed, laminated communication tree.

---

## 5.15 PHI Minimization (Recommended)

- **Current:** Identifiers flow through prompts unredacted (no minimization layer observed).
- **Recommended:** Pseudonymization layer where compatible with task accuracy; DLP rule scan on outputs before display/export; Admin + 2-person + audit + DLP scan required for any export.

---

## 5.16 Admin Workstation Requirements (Recommended)

- **Current:** Single shared workstation for everything.
- **Recommended:** Dedicated admin device — no email, no general browsing — for any privileged Brad operation; FDE; TPM-bound; EDR with tamper protection; USB storage class blocked except whitelisted secure tokens; hardened browser profile.

---

## 5.17 Change Control (Recommended)

- **Current:** Git is in use; signed-commit + 2-reviewer enforcement not observed.
- **Recommended:** GitOps with signed commits, two-reviewer PR, CI runs `gitleaks` + `trivy` + `kics`/`checkov`; drift detection nightly; emergency change requires post-hoc CAB review within 5 business days.

---

## 5.18 Vulnerability Management (Recommended)

- **Current:** No image / dependency scanning observed.
- **Recommended:** Trivy on every image build; weekly OpenSCAP / Lynis on the host; monthly authenticated network scan; quarterly external pentest; SLA: Critical 72h, High 7d, Medium 30d, Low 90d.

---

## 5.19 Egress Controls (Recommended)

- **Current:** Inference process can reach the internet (no allowlist observed).
- **Recommended:** Default DROP at host firewall for the inference process. Allowlist: internal audit sink, internal model mirror (read-only). **Nothing else.** This is the single most important control for prompt-injection-driven exfiltration.

---

## 5.20 Ingress Controls (Recommended)

- **Current:** Local dev server presumed bound to localhost.
- **Recommended:** Confirm bind-address is `127.0.0.1`; deny any LAN/WAN ingress except via the hardened tunnel path.

---

## 5.21 Internal Service-to-Service Authentication (Recommended)

- **Current:** None on local IPC.
- **Recommended:** Even without full mTLS, a localhost-bound bearer token between UI and inference process closes the easy co-tenant attack.

---

## 5.22 Container Image Provenance (Recommended, when containers are introduced)

- Cosign signing required; admission policy rejects unsigned; SBOM (CycloneDX) attached; pinned by SHA256 digest; weekly base-image rebuild for security patches.

---

## 5.23 SIEM / Alerting (Recommended)

- **Current:** None Brad-specific.
- **Recommended (key alerts):**
  - Audit chain break → P1.
  - New admin role assignment → P2.
  - Tunnel new peer or revocation → P2.
  - Falco / EDR rule fire on the inference host → P1.
  - Failed FIDO2 attempts above threshold → P2.
  - **Outbound connection attempt from the inference process → P1.**
  - File integrity change in `Builder/`, model weights, policy corpus → P1.
  - Detection of plaintext credential pattern in any log → P1.

---

## 5.24 Forensic Readiness (Recommended)

- Disk imaging kit + procedure.
- Memory acquisition tool ready (e.g., LiME on Linux; appropriate equivalent on the target OS).
- Container snapshot procedure (when containers are used).
- Evidence chain-of-custody form template.

---

## 5.25 Non-PHI Marketing / ComfyUI Isolation (Recommended)

- **Current:** No separate host / VLAN / identity / storage observed for non-PHI generative work.
- **Recommended (Brad 2.0-aligned):**
  - Separate physical host or strictly separate VM with PCIe GPU passthrough.
  - Separate VLAN with **no L3 route** to PHI zones — verified by router ACL audit AND active probe (must time out).
  - Separate identity store, separate storage, no shared NFS/SMB.
  - Quarterly red-team probe from the non-PHI side to confirm zero PHI reachability.

---

## 5.26 Summary Delta vs Brad 2.0

The single biggest observation: **most of these are not "fix a setting" — they are "introduce an architectural element that does not currently exist"** (a separate inference host, a WORM audit sink, an OPA policy engine, a Vault, a WireGuard appliance, a separate non-PHI module). Brad 1.0 is doing what it can within a single-workstation topology; the deficiencies are inherent to that topology, and the only durable answer is the Brad 2.0 architecture.

This document is recommendation-only. **No changes have been applied.**
