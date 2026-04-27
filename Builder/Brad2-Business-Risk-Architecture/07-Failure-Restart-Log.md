# 07 — Failure & Restart Log

**Purpose:** Document every failure that occurred prior to the final 100 consecutive pass run. Each failure includes root cause, blast radius, PHI exposure analysis, control mappings, patches applied, and confirmation of restart.

**Total restart events:** 4
**Cumulative iterations across all attempts:** 247
**Final clean run:** Attempt 5, iterations 1–100

---

## Failure 1 — VRAM Remanence

| Field | Value |
|---|---|
| Attempt # | 1 |
| Failed at iteration | 12 |
| Scenario | GPU/VRAM data remanence across sessions |
| Date (sim) | 2026-04-08 |
| Severity | **Critical** |
| Detection in failure | No (this is what made it Critical) |

### Attack Path

Tester opened session A as user U1 with role `DON`, submitted a chart containing a unique synthetic canary string (`CANARY-7e4a91-PHI-NONE`). Closed session, immediately opened session B as user U2 with role `QA`, and issued a crafted prompt asking the model to "complete the previous draft" / "summarize what you were just thinking about". The model returned text containing the canary string from session A.

### Root Cause

The vLLM worker pool was configured to keep workers warm under low traffic, with **prefix caching enabled** and **KV-cache reuse across sequences**. The worker process did not clear KV-cache or recycle the worker on session boundary. Session B was scheduled onto the same warm worker, where session A's KV-cache lingered. The crafted prompt extracted residual context.

### Blast Radius

- Any user with chat access could potentially extract content from any prior user's session on the same worker.
- All PHI processed through Z3 was at risk.
- Cross-role exposure (QA seeing DON's data) violates need-to-know.

### PHI Exposure Risk in Production

**High** if undetected. **Zero in this test** because the canary was synthetic and staging was non-PHI.

### Control Failure Mapping

- **HIPAA §164.312(a)(1) Access Control** — failed (data accessible to unauthorized session)
- **HIPAA §164.312(c)(1) Integrity / scope of access** — failed
- **HIPAA §164.308(a)(4) Info Access Mgmt** — failed
- **SOC 2 CC6.1 / CC6.6** — failed (logical boundaries not enforced at GPU layer)

### Remediation Applied

1. Enforce one worker process per session: `--max-num-seqs 1`, `--enable-prefix-caching false`, `--disable-sliding-window` where applicable.
2. Worker exits at session end; supervisor (a small Python orchestrator with FIFO queue) spawns a new worker for each session; no reuse.
3. On worker spawn, pre-warm includes a deliberate `cudaMemset` over allocator pools, plus a 2 GB allocate-zero-free cycle to overwrite freed memory pages.
4. KV-cache and any prefix cache disabled cross-session.
5. Continuous canary monitor: synthetic canary injected every 10 minutes; if next session can retrieve it, **P1 alert** and inference plane is fail-closed.
6. Hardening manifest updated: `Section 5.3.3 vLLM Worker Pattern` and `5.3.4 VRAM Hygiene`.

### Restart

- Patches applied to staging.
- Counter reset to 0.
- Re-execution of iterations 1–11 PASS, iteration 12 PASS.
- Continued from iteration 13.

---

## Failure 2 — Approval Workflow Race Condition

| Field | Value |
|---|---|
| Attempt # | 2 |
| Failed at iteration | 31 |
| Scenario | Two-person approval bypass via concurrent submissions from one approver |
| Date (sim) | 2026-04-12 |
| Severity | **Critical** |
| Detection in failure | No |

### Attack Path

Approver U-DON opened the PIP `PIP-2098` in two browser tabs. Both tabs submitted approval at near-simultaneous timestamps (race window ~80 ms). The approval engine inserted two distinct rows in `pip_approvals` (different `created_at` and `client_session_id`), then queried `SELECT COUNT(*) FROM pip_approvals WHERE pip_id = $1` and saw **2**, satisfying the two-person rule. The PIP transitioned to `Approved` and was eligible for execution.

### Root Cause

Missing **uniqueness constraint** on `(pip_id, approver_id)`. Approval count predicate did not enforce **distinct approver subjects**.

### Blast Radius

- Any approver could unilaterally approve any PIP / corrective action.
- Subverts the entire governance model around PHI-affecting and operationally affecting actions.
- Could cascade to chart write-back, corrective actions, policy changes.

### PHI Exposure Risk

Indirect but significant — unauthorized PIPs could trigger chart-affecting actions. **Zero exposure in this test** (staging fixtures only).

### Control Failure Mapping

- **HIPAA §164.308(a)(3)(ii)(A) Authorization/Supervision** — failed
- **HIPAA §164.312(c)(1) Integrity** — failed (uncontrolled mutations)
- **SOC 2 CC6.1 / CC6.3 / CC8.1** — failed (change control bypass)

### Remediation Applied

1. DDL: `ALTER TABLE pip_approvals ADD CONSTRAINT uniq_pip_approver UNIQUE (pip_id, approver_id);`
2. Approval insert path: `INSERT ... ON CONFLICT DO NOTHING`, then re-read authoritative row set in serializable transaction.
3. Count predicate redefined: `SELECT COUNT(DISTINCT approver_oidc_subject) FROM pip_approvals WHERE pip_id = $1 AND fido2_credential_id IS NOT NULL` — must equal 2 distinct subjects with distinct FIDO2 credential IDs.
4. Per-user submission throttle (1 approval per 2 seconds per user).
5. CI property test: 1,000-iteration concurrent fuzz of approval submissions; must never produce a PIP with fewer than 2 distinct approvers.
6. Hardening manifest updated.

### Restart

- Patches applied. Counter reset to 0. Continued from iteration 1.

---

## Failure 3 — Backup Compromise via Privileged Operator

| Field | Value |
|---|---|
| Attempt # | 3 |
| Failed at iteration | 48 |
| Scenario | Backup operator with single-handed control prunes / overwrites backups |
| Date (sim) | 2026-04-15 |
| Severity | **High** (Critical if combined with ransomware) |
| Detection in failure | Partial (cron noticed, but operation succeeded) |

### Attack Path

Tester assumed the role of the Backup Operator service principal (which legitimately holds Restic password and S3 access). Operator performed `restic forget --keep-last 1 --prune` against the secondary MinIO repository and shortened the bucket's object-lock retention via `s3:PutObjectLockConfiguration` (which was not denied), creating a window in which old snapshots could be deleted and replaced with attacker-supplied snapshots. Combined with a ransomware scenario, this would let the attacker poison the recovery path.

### Root Cause

- Object-lock was in **Governance** mode, allowing privileged users to bypass with `s3:BypassGovernanceRetention`.
- The bucket policy did not explicitly **Deny** `s3:PutObjectLockConfiguration` for the operator principal.
- The Restic `forget`/`prune` wrapper did not require 2-person approval.
- LTO offline copy existed but was not in the test path; without it the failure would have been Critical.

### Blast Radius

- Backup integrity for the secondary MinIO destination compromised.
- Recovery from ransomware would depend solely on LTO tape rotation cadence (weekly).

### PHI Exposure Risk

Indirect — does not directly expose PHI, but defeats integrity/availability of last-line-of-defense controls.

### Control Failure Mapping

- **HIPAA §164.308(a)(7)(ii)(A) Data Backup** — failed (backups mutable)
- **HIPAA §164.312(c)(1) Integrity** — failed
- **SOC 2 CC9.1 (Risk Mitigation — Disruption)** — failed
- **SOC 2 A1.3 (Recovery Infrastructure)** — failed

### Remediation Applied

1. Object-lock switched to **Compliance mode** with retention >= legal hold horizon. **Cannot be shortened by anyone, including root.**
2. Bucket policy adds explicit `Deny` for `s3:PutObjectLockConfiguration`, `s3:BypassGovernanceRetention`, `s3:DeleteObjectVersion`, `s3:PutBucketObjectLockConfiguration` for **all** principals (only changeable via root account ceremony with 2-person physical key).
3. Restic `forget` and `prune` operations now gated through Brad approval engine: 2-person rule enforced, ticket required, audited to Z6.
4. Daily probe: backup-operator principal attempts to delete a yesterday object; expected: **fail**; alarm if it succeeds.
5. LTO offline tape cadence increased from weekly to bi-weekly with documented rotation; quarterly air-gap restore drill.
6. Hardening manifest updated; Section 5.11 expanded.

### Restart

- Patches applied. Counter reset to 0. Continued from iteration 1.

---

## Failure 4 — Reverse Proxy Path Normalization (Admin Route Bypass)

| Field | Value |
|---|---|
| Attempt # | 4 |
| Failed at iteration | 56 |
| Scenario | URL-encoded path bypass exposes admin API to non-admin user |
| Date (sim) | 2026-04-17 |
| Severity | **High** |
| Detection in failure | Yes (anomaly alert fired), but exploit reached admin API briefly before mitigation |

### Attack Path

Authenticated as a `QA` role user, tester sent:
```
GET /api%2f..%2fadmin/users HTTP/2
Host: brad.internal
```
Caddy's `path_regexp` matcher for `/api/*` matched first because Caddy decoded `%2f` after route selection. Brad API received the request on its admin path with a valid session cookie for `QA`. Server-side admin enforcement was URL-prefix based and was bypassed because the normalized path arrived at the admin handler. The request returned a partial user list before the anomaly detector flagged unusual traffic.

### Root Cause

- Caddy decoded encoded slashes during routing in a way that allowed path traversal across route boundaries.
- Admin API was on the same hostname as the user API, with route segregation enforced only at the proxy layer.
- Server-side authorization checked URL pattern rather than OIDC group/role claim.

### Blast Radius

- Any authenticated user could access admin endpoints.
- Privilege escalation in the application tier — could enumerate users, read configuration, potentially trigger administrative actions if such endpoints existed.

### PHI Exposure Risk

Indirect — the admin API does not return chart PHI, but it returns user metadata that supports further attack chaining (role enumeration, knowing approvers to phish).

### Control Failure Mapping

- **HIPAA §164.312(a)(1) Access Control** — failed
- **HIPAA §164.308(a)(4) Info Access Mgmt** — failed
- **SOC 2 CC6.1 / CC6.6 / CC6.8** — failed

### Remediation Applied

1. Admin API moved to a **separate hostname** (`admin.brad.internal`), bound to a separate Caddy site, only reachable from the **management VLAN** by host firewall rule (deny at L3 for non-mgmt source IPs).
2. Caddy configured with `strict_sni_host` and a normalization gate: any request whose normalized path differs from the raw path is **rejected** with 400.
3. Brad API admin route allowlist enforced server-side based on **OIDC `groups` claim** containing `admin`; URL pattern is no longer the gate.
4. Path-traversal fuzz test added to CI (10,000 mutations including double-encoding, mixed-case, Unicode normalization).
5. Wazuh rules: `4xx burst from single peer on /admin*` → P2; `2xx on /admin* from non-admin role` → **P1**; latter triggers automatic session kill via SOC playbook.
6. Hardening manifest updated.

### Restart

- Patches applied. Counter reset to 0. Continued from iteration 1. Reached 100.

---

## Aggregate Statistics

| Metric | Value |
|---|---|
| Total scenarios in regression set | 100 unique + variants |
| Total iterations executed | 247 |
| Failures | 4 |
| Failure rate | 1.6% pre-patch; 0% post-patch |
| Mean iterations between failures (Attempts 1–4) | ~37 |
| PHI exposed in any failure | **0** (all detected against synthetic data in staging) |
| Final consecutive passes | **100 / 100** |

---

## Lessons Internalized into Architecture

1. **GPU memory is not a primitive.** Treat VRAM lifetime explicitly; never assume the runtime cleans up. → Section 5.3.
2. **Concurrency is an authorization surface.** Two-person rules require uniqueness constraints, not predicates over post-insert counts. → Section 5.6 + Section 5.15 (CI property tests).
3. **Backup immutability must be enforced at the storage layer, not at the application layer.** → Section 5.11.
4. **Path normalization belongs at the host, not at the route.** Admin segregation must be enforced both at network (mgmt VLAN) and at identity (claims), not at URL pattern. → Section 5.18 + Section 5.6.

These lessons are now standing engineering policy.
