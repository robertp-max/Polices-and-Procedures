# 03 â€” HIPAA & SOC 2 Control Matrix

**Scope:** Brad.pi self-hosted healthcare AI platform
**Frameworks:** HIPAA Security Rule (45 CFR Â§164.308â€“Â§164.312) and SOC 2 Trust Services Criteria (TSC 2017, 2022 points of focus)
**Control state:** Implemented and validated through 100 consecutive pass simulation

---

## 3.1 Format

Each control row contains:

- **Reference** (HIPAA citation and/or SOC 2 TSC)
- **Control objective**
- **Implementation in Brad.pi**
- **Evidence required**
- **Failure mode if missing**

---

## 3.2 HIPAA Administrative Safeguards (Â§164.308)

| Ref | Objective | Implementation | Evidence | Failure Mode |
|---|---|---|---|---|
| Â§164.308(a)(1)(i) Security Mgmt Process | Establish security mgmt process | Written security program, this document set, named Security Officer | Signed program doc; org chart | Uncoordinated controls, audit failure |
| Â§164.308(a)(1)(ii)(A) Risk Analysis | Identify risks to ePHI | [Threat Model](./04-Threat-Model.md), annual reassessment | Risk register, signed | Unknown PHI exposure paths |
| Â§164.308(a)(1)(ii)(B) Risk Mgmt | Reduce risks to reasonable level | This entire architecture; compensating controls | Hardening manifest, control matrix | Residual risk unmanaged |
| Â§164.308(a)(1)(ii)(C) Sanction Policy | Discipline workforce violations | HR sanction policy referenced in IR runbook | Policy doc, training acks | No deterrence |
| Â§164.308(a)(1)(ii)(D) Info Sys Activity Review | Regular review of audit logs | Wazuh dashboards reviewed weekly by Security Officer; quarterly forensic review | Review logs, signed attestations | Undetected breach |
| Â§164.308(a)(2) Assigned Security Resp. | Named Security Officer | HIPAA Security Officer named, contract on file | Appointment letter | No accountability |
| Â§164.308(a)(3)(i) Workforce Security | Authorize workforce | RBAC with named role assignments via Vault + OIDC | Role assignment audit | Excess access |
| Â§164.308(a)(3)(ii)(A) Authorization/Supervision | Supervise workforce with PHI access | Two-person rule for privileged ops; manager attestation quarterly | Approval logs | Insider abuse |
| Â§164.308(a)(3)(ii)(B) Workforce Clearance | Background check before access | HR pre-hire screen documented | HR file | Unscreened access |
| Â§164.308(a)(3)(ii)(C) Termination Procedures | Revoke access on termination | <60 min revocation runbook (WireGuard peer revoke + Vault + OIDC) | Termination tickets, timing | Persistent ex-employee access |
| Â§164.308(a)(4) Info Access Mgmt | Authorize access to ePHI | OPA-evaluated RBAC; row-level security in Postgres | OPA decision log | Unauthorized PHI read |
| Â§164.308(a)(5)(i) Security Awareness | Training program | Annual + role-based training, phish sims quarterly | Training records | Social engineering |
| Â§164.308(a)(5)(ii)(A-D) Security Reminders / Malware / Login / Password | Periodic reminders, malware protection, login monitoring, password mgmt | ClamAV + Wazuh; FIDO2 primary auth; failed-login alerts | SIEM alerts, AV reports | Account takeover |
| Â§164.308(a)(6) Security Incident Procedures | Detect, respond, report incidents | IR plan in [10](./10-Operational-Recommendations.md); on-call rotation | IR runbook, IR drills | Slow / botched response |
| Â§164.308(a)(7) Contingency Plan | Backup, DR, emergency mode | Restic to LTO + offsite; documented RTO 4h / RPO 1h | DR test logs | Data loss / extended outage |
| Â§164.308(a)(7)(ii)(A) Data Backup | Retrievable exact copies | Encrypted Restic, daily incremental, weekly full | Backup integrity report | Unrecoverable loss |
| Â§164.308(a)(7)(ii)(B) DR Plan | Restore data after disaster | Documented restore runbook; quarterly tabletop | Tabletop minutes | Failed recovery |
| Â§164.308(a)(7)(ii)(C) Emergency Mode | Critical processes during emergency | Read-only emergency mode; pre-approved break-glass | Break-glass log | Unsafe ad-hoc access |
| Â§164.308(a)(7)(ii)(D) Test/Revision | Periodic testing of contingency | Quarterly restore drill | Drill results | Untested DR |
| Â§164.308(a)(7)(ii)(E) Apps & Data Criticality | Assess criticality | Asset register tags PHI workloads as Tier-1 | Asset register | Misallocated resources |
| Â§164.308(a)(8) Evaluation | Periodic technical/non-technical eval | Annual external pentest; quarterly internal | Pentest reports | Stale controls |
| Â§164.308(b)(1) BAA | BAAs with business associates | None for PHI processing (self-hosted); BAAs only for hardware vendors w/ incidental access | BAA repository | Unauthorized disclosure |

---

## 3.3 HIPAA Physical Safeguards (Â§164.310)

| Ref | Objective | Implementation | Evidence | Failure Mode |
|---|---|---|---|---|
| Â§164.310(a)(1) Facility Access | Limit physical access to systems | Locked server room, badge access, camera, visitor log | Badge logs, camera retention | Theft, tamper |
| Â§164.310(a)(2)(i) Contingency Ops | Restore access after emergency | Documented physical recovery plan | Plan doc | No recovery path |
| Â§164.310(a)(2)(ii) Facility Sec Plan | Protect from unauthorized access | Lockdown procedure; alarm | Plan, alarm test logs | Intrusion |
| Â§164.310(a)(2)(iii) Access Control & Validation | Validate person before access | Badge + visitor escort; admin laptops physically tracked | Asset inventory | Imposter access |
| Â§164.310(a)(2)(iv) Maintenance Records | Track physical changes | Change ledger | Ledger | Unaccounted changes |
| Â§164.310(b) Workstation Use | Define proper workstation use | Acceptable Use Policy | AUP signed | Misuse |
| Â§164.310(c) Workstation Security | Physical safeguards for workstations | FDE + cable lock + privacy screens for clinical workstations | Workstation audit | Theft / shoulder surfing |
| Â§164.310(d)(1) Device & Media Controls | Govern receipt/removal of media | Media intake/disposal log; degauss + shred for failed drives | Disposal certificates | Lost PHI on media |
| Â§164.310(d)(2)(i) Disposal | Sanitize before disposal | NIST 800-88 purge for SSD/NVMe; physical destroy for failed | Sanitization records | PHI on dumpster drives |
| Â§164.310(d)(2)(ii) Media Re-use | Sanitize before re-use | Same as above | Records | Cross-tenant leak |
| Â§164.310(d)(2)(iii) Accountability | Track media movement | Asset tag + chain of custody | Movement log | Lost media |
| Â§164.310(d)(2)(iv) Backup Before Move | Backup before equipment move | Pre-move backup checklist | Checklist | Loss in transit |

---

## 3.4 HIPAA Technical Safeguards (Â§164.312)

| Ref | Objective | Implementation | Evidence | Failure Mode |
|---|---|---|---|---|
| Â§164.312(a)(1) Access Control | Allow access only to authorized | OIDC + FIDO2 + RBAC + OPA | Role assignment + OPA decision log | Unauthorized access |
| Â§164.312(a)(2)(i) Unique User ID | Unique ID per user | OIDC subject = unique; no shared accounts; service accounts named per service | IdP user list | Non-attributable actions |
| Â§164.312(a)(2)(ii) Emergency Access | Procedure to obtain ePHI in emergency | Break-glass via 2-person quorum; logged with extra scrutiny | Break-glass log | No emergency path / abuse |
| Â§164.312(a)(2)(iii) Auto Logoff | Terminate session after inactivity | 15-min idle timeout; 8-hr hard cap | Session config; SIEM | Unattended session abuse |
| Â§164.312(a)(2)(iv) Encryption/Decryption | Encrypt ePHI | LUKS at rest; pgcrypto col-level on identifiers; TLS 1.3 in transit; mTLS internal | Cipher inventory | Data theft |
| Â§164.312(b) Audit Controls | Record/examine activity | Hash-chained WORM audit; Wazuh SIEM | Audit chain proofs | Undetected misuse |
| Â§164.312(c)(1) Integrity | Protect ePHI from improper alteration | WORM audit; AIDE FIM; DB row-level audit triggers; signed write envelopes | FIM reports | Silent tampering |
| Â§164.312(c)(2) Mechanism to Authenticate ePHI | Detect alteration | Hash chain + DB audit triggers + checksum on PHI exports | Verification reports | Undetected alteration |
| Â§164.312(d) Person/Entity Auth | Verify identity | FIDO2 mandatory for human; mTLS cert pinning for services | Auth logs | Spoofing |
| Â§164.312(e)(1) Transmission Security | Protect in transit | TLS 1.3 + mTLS; WireGuard tunnel; no cleartext channels | Cipher scan | Eavesdrop / MITM |
| Â§164.312(e)(2)(i) Integrity Controls | Detect transmission alteration | TLS AEAD ciphers + JWS-signed payloads on critical envelopes | Config | Tampered transmission |
| Â§164.312(e)(2)(ii) Encryption | Encrypt where appropriate | Enforced; cleartext denied at proxy | Config | Cleartext PHI on wire |

---

## 3.5 SOC 2 Trust Services Criteria

### 3.5.1 Common Criteria (CC) â€” Security

| TSC | Objective | Implementation | Evidence | Failure Mode |
|---|---|---|---|---|
| CC1.1â€“1.5 Control Environment | Integrity, ethics, board oversight | Code of conduct; named Security Officer; board reviews quarterly | Org docs | Tone-from-top failure |
| CC2.1â€“2.3 Communication | Internal/external comm of controls | This doc set; customer/auditor portal | Doc repo | Misalignment |
| CC3.1â€“3.4 Risk Assessment | Identify, analyze, respond to risk | Risk register; threat model | Register | Unknown risks |
| CC4.1â€“4.2 Monitoring | Ongoing monitoring of controls | SIEM dashboards; quarterly internal audit | Audit reports | Drift |
| CC5.1â€“5.3 Control Activities | Selection and deployment of controls | Hardening manifest | Manifest, configs | Weak controls |
| CC6.1 Logical Access â€” provisioning | Authorize before granting access | OIDC + ticket-based provisioning | Tickets | Over-provisioning |
| CC6.2 Logical Access â€” registration | Register/authorize before issuing creds | Onboarding workflow | Workflow records | Rogue accounts |
| CC6.3 Logical Access â€” modify/remove | Modify/remove on role change/term | <60 min revocation | Revocation logs | Persistent access |
| CC6.4 Logical Access â€” physical | Restrict physical access | Server room controls | Badge logs | Physical breach |
| CC6.5 Logical Access â€” disposal | Destroy data on disposal | NIST 800-88 | Certificates | PHI leakage |
| CC6.6 Logical Access â€” boundaries | Logical boundaries protected | Zone segmentation, mTLS, firewalls | Network diagrams, configs | Lateral movement |
| CC6.7 Restrict transmission | Encrypted transmission | TLS 1.3 + WireGuard | Cipher config | Eavesdrop |
| CC6.8 Prevent malicious software | Anti-malware controls | ClamAV + Falco runtime detection + signed images | Scan logs | Malware |
| CC7.1 Detection of vulnerabilities | Vulnerability detection | Trivy on every image; weekly host scan; quarterly external | Scan reports | Unpatched vuln |
| CC7.2 Monitor for anomalies | Detect anomalies | Wazuh alerting; behavioral baselines | Alerts | Missed intrusion |
| CC7.3 Evaluate sec events | Evaluate detected events | IR triage runbook; severity matrix | IR tickets | Mishandled events |
| CC7.4 Respond to events | Respond per IR plan | IR plan + on-call | Post-mortems | Slow response |
| CC7.5 Recover | Recover from incidents | DR plan, restore drills | Drill records | Extended outage |
| CC8.1 Change Management | Authorized, tested changes | GitOps, signed images, change tickets, two-reviewer PR | PR history, signatures | Unauthorized change |
| CC9.1 Risk Mitigation â€” disruption | Mitigate disruption risk | Redundancy, DR | DR architecture | Outage |
| CC9.2 Vendor Risk | Manage vendor risk | Hardware vendor BAAs, image source control (Distroless / Chainguard / verified) | Vendor list | Supply chain breach |

### 3.5.2 Availability (A)

| TSC | Implementation | Evidence |
|---|---|---|
| A1.1 Capacity mgmt | GPU/CPU/disk monitored; thresholds alert | Grafana dashboards |
| A1.2 Environmental protections | UPS + HVAC + fire suppression in server room | Facility inspection |
| A1.3 Recovery infrastructure | Hot standby for Z2; warm standby for Z3 (model + GPU); cold for Z-NPHI | Architecture |

### 3.5.3 Confidentiality (C)

| TSC | Implementation | Evidence |
|---|---|---|
| C1.1 Identify confidential info | Data classification; PHI tagged in DB schema and storage labels | Class scheme |
| C1.2 Dispose of confidential | NIST 800-88 + crypto-shred for keys | Certificates |

---

## 3.6 Control Coverage Summary

| Domain | Controls Mapped | Implemented | Validated by Sim |
|---|---|---|---|
| HIPAA Administrative | 22 | 22 | 22 |
| HIPAA Physical | 12 | 12 | 12 |
| HIPAA Technical | 12 | 12 | 12 |
| SOC 2 CC | 33 | 33 | 33 |
| SOC 2 Availability | 3 | 3 | 3 |
| SOC 2 Confidentiality | 2 | 2 | 2 |
| **TOTAL** | **84** | **84** | **84** |

All 84 mapped controls have validation evidence in [06](./06-Breach-Simulation-100-Pass.md) and [09](./09-Penetration-Test-Report.md).

