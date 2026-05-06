# 03 — HIPAA & SOC 2 Control Matrix (Brad 1.0 LIVE)

**Scope:** Brad 1.0, as-observed live operator-workstation deployment.
**Frameworks:** HIPAA Security Rule (45 CFR §164.308–§164.312); SOC 2 TSC (2017 / 2022 PoF).
**Status of each control:** observation only. Where the control is not satisfied, a **recommendation** is provided. **Nothing in this matrix has been implemented by this assessment.**

---

## 3.1 Format

Each row contains:

- **Reference**
- **Control objective**
- **As-observed status in Brad 1.0**
- **Gap (if any)**
- **Recommendation (informational; not applied)**

Status legend:
- ✅ Met
- ⚠️ Partial / Compensated
- ❌ Not Met

---

## 3.2 HIPAA Administrative Safeguards (§164.308)

| Ref | Objective | Status | Gap | Recommendation |
|---|---|---|---|---|
| §164.308(a)(1)(i) Security Mgmt Process | Establish written security mgmt program for ePHI | ⚠️ | No Brad-1.0-specific written program observed | Adopt a written security program scoped to Brad 1.0 and name a Security Officer for it |
| §164.308(a)(1)(ii)(A) Risk Analysis | Identify risks to ePHI | ⚠️ | This document is the first formal risk analysis | Treat [04](./04-Threat-Model.md) as the v1 risk register; reassess annually |
| §164.308(a)(1)(ii)(B) Risk Mgmt | Reduce risks to a reasonable level | ❌ | Critical risks (VRAM remanence, plaintext SA key, mutable audit) not yet mitigated | Address C-01..C-07 before unrestricted PHI use |
| §164.308(a)(1)(ii)(C) Sanction Policy | Discipline policy for violations | ⚠️ | Not Brad-specific | Reference HR sanction policy in Brad runbook |
| §164.308(a)(1)(ii)(D) Information Sys Activity Review | Regular review of audit records | ❌ | No tamper-evident audit to review | Stand up immutable log pipeline first; then schedule weekly review |
| §164.308(a)(2) Assigned Security Responsibility | Named Security Officer | ⚠️ | Implicit only | Formally appoint Security Officer for Brad 1.0 in writing |
| §164.308(a)(3)(i) Workforce Security | Authorize workforce | ❌ | Single operator identity = effective superuser | Introduce role separation when topology supports it |
| §164.308(a)(3)(ii)(A) Authorization/Supervision | Supervise workforce w/ PHI access | ❌ | No enforced 2-person rule | Require 2-person rule for chart-affecting / PIP / export actions |
| §164.308(a)(3)(ii)(B) Workforce Clearance | Background check | ⚠️ | HR-level, not Brad-specific | Ensure operator has documented HR clearance |
| §164.308(a)(3)(ii)(C) Termination Procedures | Revoke access promptly | ❌ | No documented sub-60-min revocation runbook for Brad 1.0 specifically | Author Brad-1.0 termination runbook |
| §164.308(a)(4) Information Access Mgmt | Authorize access to ePHI | ❌ | No granular access model | Adopt Brad-2.0-style RBAC (Admin/DON/QA/Compliance/IT/Auditor/ReadOnlyClinical) |
| §164.308(a)(5)(i) Security Awareness | Training program | ⚠️ | Org-level, not Brad-specific | Add Brad-1.0-specific operator handling training |
| §164.308(a)(5)(ii)(A-D) Reminders / Malware / Login / Password | Periodic reminders, malware protection, login monitoring, password mgmt | ⚠️ | Workstation-level only | Add Brad-1.0 alerting on failed access attempts |
| §164.308(a)(6) Security Incident Procedures | Detect, respond, report | ❌ | No Brad-1.0 IR runbook observed | Author IR runbook (account compromise, suspected data exfil, audit chain break) |
| §164.308(a)(7) Contingency Plan | Backup, DR, emergency mode | ❌ | No segregated backup observed | Stand up encrypted, append-only Restic backups |
| §164.308(a)(7)(ii)(A) Data Backup | Retrievable exact copies | ❌ | Not observed segregated | Daily incremental + weekly full to two destinations |
| §164.308(a)(7)(ii)(B) DR Plan | Restore data after disaster | ❌ | Not observed | Documented RTO/RPO + restore runbook |
| §164.308(a)(7)(ii)(C) Emergency Mode | Critical processes during emergency | ❌ | Not observed | Read-only emergency mode with break-glass log |
| §164.308(a)(7)(ii)(D) Test/Revision | Periodic testing of contingency | ❌ | Not observed | Quarterly restore drill |
| §164.308(a)(7)(ii)(E) Apps & Data Criticality | Assess criticality | ⚠️ | Implicit | Add to asset register |
| §164.308(a)(8) Evaluation | Periodic technical/non-tech eval | ⚠️ | This is the first one | Annual external pentest going forward |
| §164.308(b)(1) BAA | BAAs with business associates | ⚠️ | Need to confirm Google Cloud / Calendar usage scope (the SA key in `Builder/` implies a Google integration) | Confirm BAA coverage for any Google service that touches PHI; eliminate if not BAA-covered |

---

## 3.3 HIPAA Physical Safeguards (§164.310)

| Ref | Objective | Status | Gap | Recommendation |
|---|---|---|---|---|
| §164.310(a)(1) Facility Access | Limit physical access | ⚠️ | "Facility" is the operator's workspace; no server room | Document physical control of the operator workstation |
| §164.310(a)(2)(i-iv) Contingency / Plan / Validation / Maintenance | Physical recovery + maintenance records | ❌ | Not observed | Author basic physical security plan for the workstation |
| §164.310(b) Workstation Use | Define proper workstation use | ❌ | Workstation is general-purpose | Adopt AUP forbidding non-Brad workloads when handling PHI; enforce dedicated device long-term |
| §164.310(c) Workstation Security | Physical safeguards | ⚠️ | FDE on workstation should be confirmed | Confirm FDE (BitLocker/LUKS), TPM bound, privacy screen, cable lock |
| §164.310(d)(1-2) Device & Media Controls / Disposal / Re-use / Accountability / Backup-Before-Move | Govern media | ❌ | Not formally controlled | Adopt media handling policy; NIST 800-88 sanitization on disposal |

---

## 3.4 HIPAA Technical Safeguards (§164.312)

| Ref | Objective | Status | Gap | Recommendation |
|---|---|---|---|---|
| §164.312(a)(1) Access Control | Allow access only to authorized | ❌ | Effectively single-user superuser | Introduce OIDC + FIDO2 + RBAC + OPA |
| §164.312(a)(2)(i) Unique User ID | Unique ID per user | ❌ | Operator account = everyone | Per-user identity |
| §164.312(a)(2)(ii) Emergency Access | Emergency access procedure | ❌ | Not observed | Documented break-glass with logging |
| §164.312(a)(2)(iii) Auto Logoff | Terminate session after inactivity | ❌ | App-level not enforced | 15-min idle / 8-hr hard cap |
| §164.312(a)(2)(iv) Encryption/Decryption | Encrypt ePHI | ⚠️ | At rest depends on workstation FDE; in-transit depends on tunnel | LUKS/BitLocker confirmed; TLS 1.3 + mTLS internal |
| §164.312(b) **Audit Controls** | Record/examine activity | ❌ | **Mutable, deletable logs** | **Implement WORM + hash-chain audit** |
| §164.312(c)(1) Integrity | Protect ePHI from improper alteration | ❌ | No FIM, no DB triggers, no signed envelopes | AIDE + DB audit triggers + signed write envelopes |
| §164.312(c)(2) Mechanism to Authenticate ePHI | Detect alteration | ❌ | No checksum / chain | Hash chain + checksum on exports |
| §164.312(d) Person/Entity Authentication | Verify identity | ❌ | No FIDO2, no mTLS internal | FIDO2 mandatory; mTLS pinning service-to-service |
| §164.312(e)(1) Transmission Security | Protect in transit | ⚠️ | Tunnel-dependent | TLS 1.3 + WireGuard appliance |
| §164.312(e)(2)(i) Integrity Controls | Detect transmission alteration | ⚠️ | TLS only if used | TLS AEAD + JWS-signed payloads on critical envelopes |
| §164.312(e)(2)(ii) Encryption | Encrypt where appropriate | ⚠️ | Cleartext channels possible internally | Deny cleartext at proxy |

---

## 3.5 SOC 2 Trust Services Criteria

### 3.5.1 Common Criteria — Security

| TSC | As-Observed | Recommendation |
|---|---|---|
| CC1.1–1.5 Control Environment | ⚠️ Org-level only | Name Brad-specific Security Officer + board reviews |
| CC2.1–2.3 Communication | ⚠️ Informal | This doc set should be the formal communication baseline |
| CC3.1–3.4 Risk Assessment | ⚠️ This is the first | Maintain risk register; reassess annually |
| CC4.1–4.2 Monitoring | ❌ No SIEM | Stand up Wazuh or equivalent |
| CC5.1–5.3 Control Activities | ❌ Not formalized | Adopt hardening manifest |
| CC6.1 Logical Access provisioning | ❌ Single account | OIDC + ticket-based provisioning |
| CC6.2 Registration | ❌ N/A in current model | Onboarding workflow |
| CC6.3 Modify/remove | ❌ No revocation runbook | <60-min revocation |
| CC6.4 Physical | ⚠️ Workstation-level | Document physical controls |
| CC6.5 Disposal | ❌ Not formal | NIST 800-88 |
| CC6.6 Boundaries | ❌ One zone | Zone segmentation, mTLS, firewalls |
| CC6.7 Restrict transmission | ⚠️ Tunnel-dependent | TLS 1.3 + WireGuard |
| CC6.8 Anti-malware | ⚠️ Workstation EDR only | Add Falco runtime detection |
| CC7.1 Vuln detection | ❌ No image scanning observed | Trivy + weekly host scan |
| CC7.2 Anomaly monitoring | ❌ | SIEM rules |
| CC7.3 Sec event evaluation | ❌ | IR triage runbook |
| CC7.4 Respond | ❌ | IR plan + on-call |
| CC7.5 Recover | ❌ | DR plan, restore drills |
| CC8.1 Change Management | ⚠️ Git is used; no signed-commit + 2-reviewer policy observed | GitOps with signed commits, two-reviewer PR |
| CC9.1 Disruption mitigation | ❌ | Redundancy, DR |
| CC9.2 Vendor risk | ⚠️ Google integration via SA key needs BAA confirmation | Vendor list + BAAs |

### 3.5.2 Availability (A)

| TSC | As-Observed | Recommendation |
|---|---|---|
| A1.1 Capacity mgmt | ❌ No monitoring observed | Grafana on host/GPU |
| A1.2 Environmental protections | ❌ Workstation environment | UPS + appropriate physical environment |
| A1.3 Recovery infrastructure | ❌ Single host | Hot/warm standbys per Brad 2.0 |

### 3.5.3 Confidentiality (C)

| TSC | As-Observed | Recommendation |
|---|---|---|
| C1.1 Identify confidential info | ⚠️ Implicit only | Data classification + PHI tagging |
| C1.2 Dispose of confidential | ❌ Not formal | NIST 800-88 + crypto-shred for keys |

---

## 3.6 Coverage Summary

| Domain | Mapped | Met | Partial | Not Met |
|---|---|---|---|---|
| HIPAA Administrative | 22 | 0 | 9 | **13** |
| HIPAA Physical | 6 categories | 0 | 2 | **4** |
| HIPAA Technical | 12 | 0 | 4 | **8** |
| SOC 2 CC | 22 | 0 | 7 | **15** |
| SOC 2 Availability | 3 | 0 | 0 | **3** |
| SOC 2 Confidentiality | 2 | 0 | 1 | **1** |
| **TOTAL** | **67** | **0 fully met** | **23 partial** | **44 not met** |

> **Plain-language reading:** Brad 1.0 is not failing because Care Indeed is doing nothing wrong — many controls exist at the org/workstation level. It is failing because the **architecture itself does not give those controls a place to land**. A single-host, single-user, mutable-log topology cannot, by construction, satisfy controls that require segmentation, separation of duties, and tamper-evidence. The Brad 2.0 design exists precisely to give each of these controls an architectural home.
