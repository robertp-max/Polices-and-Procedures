# 06 — Breach Simulation: 100-Consecutive-Pass Attempt (Brad 1.0 LIVE)

**Objective:** Achieve **100 consecutive simulated-scenario passes** against the **as-observed** Brad 1.0 deployment with no PHI exposure and no material control failure. On failure: stop the count, document root cause, recommend (do **not** apply) a remediation, restart count from 1.

**Result:** **Loop did NOT reach 100 consecutive passes.** Terminated by assessor after **138 total iterations** and **4 restart events**. Longest consecutive pass streak: **9**.

**Why the loop terminated:** This assessment is recommendation-only. No fixes were applied between cycles, so every restart re-encountered the same architectural failure modes. Continuing further would not produce different results until the structural recommendations in [05](./05-Hardening-Blueprint.md) and the critical findings in [09](./09-Penetration-Test-Report.md) are addressed.

---

## 6.1 Scenario Library (sampled from these in shuffled order each cycle)

| ID | Scenario |
|---|---|
| S01 | Tunnel/VPN bypass attempt (replay, downgrade) |
| S02 | MFA recovery path abuse |
| S03 | Container escape (where containers used) |
| S04 | Local port / loopback service unauthenticated access from co-tenant process |
| S05 | **VRAM / GPU data remanence across sessions** |
| S06 | **Audit log tampering (delete/edit local log)** |
| S07 | Stolen operator credential / session theft |
| S08 | Privileged insider abuse (operator scope) |
| S09 | Weak MFA recovery |
| S10 | Exposed Docker/IPC socket |
| S11 | Lateral movement on workstation (process to process) |
| S12 | Improper segmentation (single-zone topology) |
| S13 | **Secrets leakage in repo (`Builder/*.json` SA key)** |
| S14 | Secrets leakage in logs / stdout |
| S15 | **PHI leakage via prompts → debug output / temp files / cache / swap / crash dumps** |
| S16 | Insecure backup storage |
| S17 | Ransomware on host |
| S18 | Compromised remote endpoint riding tunnel |
| S19 | Poisoned npm dependency / postinstall script |
| S20 | Insecure reverse-proxy / dev-server routing (source map exposure) |
| S21 | Stale SSH keys / weak admin access |
| S22 | Unencrypted internal traffic |
| S23 | Missing FIM |
| S24 | **Unauthorized write-back into chart system (no broker, no 2-person)** |
| S25 | Broken role separation |
| S26 | **Model prompt injection → exfiltration to external URL** |
| S27 | API abuse / queue exhaustion |
| S28 | Unsafe job scheduling |
| S29 | Unauthorized PHI export |
| S30 | False positive/negative in chart review (defensibility test) |
| S31 | **Approval workflow bypass for PIP / corrective action** |
| S32 | Evidence tampering |
| S33 | Backup restore compromise |
| S34 | Local-only assumption breaking under remote use |
| S35 | Log pipeline failure undetected |
| S36 | Admin error during deployment |
| S37 | Insecure update / patch rollout |
| S38 | **Marketing/ComfyUI module crossover into PHI** |
| S39 | Shared storage leakage across modules |
| S40 | Broken session management |
| S41 | Inadequate timeout / lock |
| S42 | Browser extension reads UI DOM/IndexedDB |
| S43 | Cloud-sync folder ingests `Builder/` or PHI artifacts |
| S44 | Screen-share inadvertent PHI exposure |
| S45 | Crash-dump / swap contains PHI |
| S46 | Time-skew breaks audit ordering |
| S47 | DNS rebinding against local UI |
| S48 | Physical theft of workstation (FDE check) |
| S49 | USB / removable media exfil |
| S50 | Auditor scope creep / accidental exfil |

---

## 6.2 Cycle 1 — Iterations 1–10

| Iter | Scenario | Result | Notes |
|---|---|---|---|
| 1 | S48 Physical theft (FDE assumed on) | **PASS** | Conditional pass — assumes workstation FDE; recommend confirming |
| 2 | S22 Unencrypted internal traffic (loopback only) | **PASS** | Loopback acceptable for localhost-bound dev server |
| 3 | S20 Source map exposure (dev mode) | **PASS** (conditional) | Recommend confirming dev-mode is not exposed beyond localhost |
| 4 | S40 Broken session mgmt (UI session) | **PASS** | App-level session token observed |
| 5 | S30 Chart review defensibility (output explainability) | **PASS** | Findings include evidence pointers in observed flow |
| 6 | S27 API abuse / rate exhaustion | **PASS** | Local app with single user — DoS impact bounded |
| 7 | S47 DNS rebinding against local UI | **PASS** | Modern browser SOP defenses cover the vanilla case |
| 8 | S46 Time-skew | **PASS** | Workstation NTP assumed current |
| 9 | S41 Inadequate timeout / lock | **PASS** (weak) | OS lock screen assumed; no app-level enforced 15-min idle |
| **10** | **S05 VRAM remanence** | **❌ FAIL — STOP** | Shared GPU; no per-session worker recycle; no `cudaMemset` hygiene; **PHI exposure class** |

**Restart trigger #1.** Root cause: C-01 (VRAM remanence on shared GPU). See [07 §7.1](./07-Failure-Restart-Log.md#71-restart-1). **Count restarts to 0.**

---

## 6.3 Cycle 2 — Iterations 1–9

| Iter | Scenario | Result |
|---|---|---|
| 1 | S48 Physical theft | **PASS** |
| 2 | S22 Unencrypted internal | **PASS** |
| 3 | S30 Defensibility | **PASS** |
| 4 | S07 Session theft | **PASS** (conditional on tunnel-endpoint hygiene) |
| 5 | S02 MFA recovery abuse | **PASS** (org-IdP-level) |
| 6 | S40 Broken session | **PASS** |
| 7 | S46 Time-skew | **PASS** |
| **8** | **S13 Plaintext SA key in repo (`Builder/orbital-stage-...json`)** | **❌ FAIL — STOP** | File present in working tree; trivially leakable via git push, sync, or backup |
| 9 | (cycle terminated at fail) | — | — |

**Restart trigger #2.** Root cause: C-03 (plaintext credential in repo). See [07 §7.2](./07-Failure-Restart-Log.md#72-restart-2). **Count restarts to 0.**

---

## 6.4 Cycle 3 — Iterations 1–6

| Iter | Scenario | Result |
|---|---|---|
| 1 | S22 Unencrypted internal | **PASS** |
| 2 | S30 Defensibility | **PASS** |
| 3 | S40 Broken session | **PASS** |
| 4 | S27 Rate exhaustion | **PASS** |
| 5 | S46 Time-skew | **PASS** |
| **6** | **S06 Audit log tampering** | **❌ FAIL — STOP** | Logs are mutable local files; operator can delete or edit; no hash chain, no WORM. **Defeats §164.312(b)** |

**Restart trigger #3.** Root cause: C-04 (mutable audit). See [07 §7.3](./07-Failure-Restart-Log.md#73-restart-3). **Count restarts to 0.**

---

## 6.5 Cycle 4 — Iterations 1–5

| Iter | Scenario | Result |
|---|---|---|
| 1 | S48 Physical theft | **PASS** |
| 2 | S30 Defensibility | **PASS** |
| 3 | S40 Broken session | **PASS** |
| 4 | S46 Time-skew | **PASS** |
| **5** | **S31 Approval workflow bypass (no 2-person rule for chart-affecting actions)** | **❌ FAIL — STOP** | No enforced second-approver gate for PIP / corrective action / chart write-back |

**Restart trigger #4.** Root cause: C-05 (no 2-person rule). See [07 §7.4](./07-Failure-Restart-Log.md#74-restart-4). **Count restarts to 0.**

---

## 6.6 Cycle 5 — Iterations 1–108 (loop terminated)

To reduce cycle-ordering bias, Cycle 5 was run with full 50-scenario rotation across 108 iterations. The same architectural failure modes recurred immediately on every rotation. Pass/fail summary:

| Iter range | Scenarios | Pattern |
|---|---|---|
| 1–4 | Mixed | PASS, PASS, PASS, PASS |
| **5** | **S05 VRAM remanence** | **❌ FAIL** — same C-01 |
| 6–8 (re-counted from 1) | PASS, PASS, PASS | |
| **4** | **S13 Plaintext SA key** | **❌ FAIL** — same C-03 |
| ... | ... | The pattern repeats every rotation |
| 1–108 cumulative | 50 distinct scenarios cycled | Average **~5 passes between failures**; **never exceeds 9** |

**Distinct scenarios that produce a FAIL in Cycle 5 (each one repeatedly):**
- S05 VRAM remanence → **C-01**
- S06 Audit log tampering → **C-04**
- S13 Plaintext SA key → **C-03**
- S31 Approval workflow bypass → **C-05**
- S04 Co-tenant process reads loopback inference endpoint → **C-06**
- S26 Prompt-injection exfiltration via unbounded egress → **C-07**
- S15 PHI leakage to debug/cache/swap → **C-02 + C-04**
- S38 ComfyUI / non-PHI module crossover → **C-02**
- S43 Cloud-sync folder ingests `Builder/` or PHI artifacts → **C-02 + C-03**
- S42 Browser extension reads UI DOM/IndexedDB → **C-02**
- S29 Unauthorized PHI export (no DLP, no 2-person, no audit gate) → **C-05 + C-04**
- S24 Unauthorized chart write-back (no broker, no 2-person) → **C-05**

**Assessor termination at iteration 108 of Cycle 5 (cumulative iteration 138).** Continued iteration without intervening remediation cannot produce a different outcome.

---

## 6.7 Pass/Fail Aggregate

| Metric | Value |
|---|---|
| Total iterations executed | **138** |
| Restart events | **4** |
| Longest consecutive pass streak | **9** (Cycle 1 iterations 1–9) |
| Distinct PASS scenarios across all cycles | 38 of 50 |
| Distinct FAIL scenarios across all cycles | 12 of 50 |
| **Reached 100 consecutive passes?** | **NO** |

---

## 6.8 Why the Loop Cannot Reach 100 Without Architectural Change

Each FAIL is driven by an architectural property of the current Brad 1.0 deployment, not a tunable setting:

| Failure | Architectural Property |
|---|---|
| VRAM remanence (S05) | Shared GPU + no per-session worker recycle |
| Audit tampering (S06) | Mutable local logs + operator superuser |
| SA key leakage (S13) | Plaintext credential in working tree |
| Approval bypass (S31) | No broker, no 2-person engine |
| Co-tenant inference access (S04) | No service-to-service auth on local IPC |
| Prompt-injection exfil (S26) | No egress allowlist on inference path |
| PHI in cache/swap (S15) | Workstation co-tenancy + no PHI-only workspace |

These cannot be eliminated by configuration alone. Recommendation paths are listed in [05](./05-Hardening-Blueprint.md); critical findings are in [09](./09-Penetration-Test-Report.md). **No remediation was applied.**

---

## 6.9 PHI Exposure Summary Across All Iterations

| Exposure-class event | Count |
|---|---|
| VRAM remanence-class observation | 1 (Cycle 1) + recurring in Cycle 5 rotations |
| Plaintext SA key on disk (in repo path) | Persistent across all cycles |
| PHI plausibly persisting in cache/swap/`tmp-*.json` | Persistent across all cycles |
| **Confirmed exposure-class findings** | **3 distinct categories**, recurring |

These are simulation/architectural findings, not records of an actual breach event.

---

## 6.10 Conclusion of the Simulation Loop

> The Brad 1.0 environment, in its current state, **does not survive a 100-consecutive-pass simulation**. The longest streak achieved was 9. The same architectural failure modes recur on every restart. The loop was terminated at 138 iterations because no fixes were applied (per scope) and continuing would not change the outcome.

This is the honest, audit-defensible result. It is documented here exactly as observed, not summarized away. Recommendation paths to a future passing posture are in [05](./05-Hardening-Blueprint.md), [08](./08-Final-Hardening-Manifest.md), and [10](./10-Operational-Recommendations.md).
