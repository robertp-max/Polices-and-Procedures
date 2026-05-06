# 10 — Operational Recommendations

**Purpose:** Define what Care Indeed must do **organizationally** after technical hardening, to sustain the security posture validated in [09](./09-Penetration-Test-Report.md).

Technical controls decay without operational discipline. This document is a binding operational regime, not a wish list.

---

## 10.1 Governance

### 10.1.1 Roles
| Role | Responsibility |
|---|---|
| HIPAA Security Officer | Ultimate authority on PHI security; signs off on all material changes; reviews all P1 incidents |
| HIPAA Privacy Officer | Owns Notice of Privacy Practices, breach notification decisions, patient rights |
| Compliance Officer | Owns SOC 2 evidence collection; audit-readiness |
| IT Lead | Operational ownership of infrastructure |
| DevSecOps Lead | Owns hardening manifest, CI gates, drift remediation |
| Red Team Lead | Quarterly internal pentest execution |
| Data Owner (DON / Compliance) | Approves access decisions to PHI scope |
| Executive Sponsor | Resourcing and risk acceptance authority |

### 10.1.2 Committees
- **Security Steering Committee** — quarterly. Reviews risk register, incidents, audit findings, change posture.
- **Change Advisory Board (CAB)** — weekly + emergency. Reviews production-impacting changes.
- **Incident Review Board** — convened post-incident. Approves post-mortems and corrective actions.

### 10.1.3 Risk Acceptance
- Any residual risk above Low requires Executive Sponsor signature.
- Any new risk above Medium requires Security Officer + Executive Sponsor.
- All accepted risks tracked in a risk register reviewed semi-annually.

---

## 10.2 Change Management

### 10.2.1 Standing Rules
- All production changes via signed-commit GitOps PR with **two reviewers**.
- CI gates (OpenSCAP, Lynis, Trivy, kics, gitleaks, cosign verify, property tests) are **mandatory**; bypass requires Security Officer ticket.
- Emergency changes go to post-hoc CAB within **5 business days**.
- Drift detection runs nightly; non-emergency drift auto-reverted.

### 10.2.2 Categorization
| Type | Approval | Window |
|---|---|---|
| Standard | CAB monthly approval; PR + CI | Maintenance window |
| Normal | CAB weekly | Maintenance window |
| Emergency | Security Officer or designate | Any; post-hoc CAB <5 d |
| Hardening update | Security Officer | Any |

### 10.2.3 Documentation
- Every change documented with: ticket, scope, blast radius, rollback plan, test evidence.
- Hardening Manifest [08](./08-Final-Hardening-Manifest.md) updated when baseline changes.

---

## 10.3 Access Review Cadence

| Review | Cadence | Owner | Evidence |
|---|---|---|---|
| All user access (full attestation) | Quarterly | Data Owners + IT Lead | Signed attestation |
| Privileged accounts (Admin, Compliance, IT) | Monthly | Security Officer | Signed list |
| Service accounts | Quarterly | DevSecOps | Mapping doc |
| Vault policies | Quarterly | Security Officer | Vault audit + policy diff |
| FIDO2 key inventory | Semi-annual | IT Lead | Inventory + physical sight check |
| WireGuard peers | Monthly | IT Lead | Peer list reconciled to active staff |
| Shared resource ACLs | Quarterly | Security Officer | ACL diff |

Termination revocation **<60 minutes** from notification, evidenced by ticket timestamps.

---

## 10.4 Patch Cadence

| Class | SLA |
|---|---|
| Critical CVE on PHI-exposed surface | **72 hours** |
| Critical CVE elsewhere | 7 days |
| High CVE | 30 days |
| Medium / Low | 90 days |
| Routine OS patch | Monthly maintenance window |
| Container base image rebuild | Weekly |
| Kernel update | Monthly + emergency |
| NVIDIA driver | Tested in staging first; quarterly cadence unless critical |

Patching evidence retained 1 year minimum.

---

## 10.5 Incident Response Drills

### 10.5.1 Tabletop Exercises (semi-annual)
Scenarios rotate through:
- Ransomware on Linux host
- Audit chain break
- VPN compromise
- Insider abuse with privileged credentials
- Backup tamper
- Suspected PHI exfiltration
- Container escape
- Supply chain compromise

### 10.5.2 Live Drills (annual minimum)
- Backup full restore to clean staging — **must** complete within RTO of 4 hours.
- Failover of Brad API to standby — measured.
- WireGuard edge failover — measured.

### 10.5.3 Post-Mortem Discipline
- Blameless post-mortem within 5 business days of any P1 or P2 incident.
- Corrective actions tracked to closure.
- Lessons added to standing red-team scenario regression set.

---

## 10.6 Backup Restore Tests

- **Quarterly** restore drill from each backup destination (LTO + offsite MinIO).
- Drill includes: integrity verification (hash), restore to staging, application-level smoke test, audit chain verification.
- Results signed by Security Officer + IT Lead.
- Failed drill triggers immediate root cause + remediation; next drill scheduled within 30 days.

---

## 10.7 Penetration Retest Cadence

| Type | Cadence | Conducted By |
|---|---|---|
| Internal red-team scenario regression (subset) | Quarterly | Red Team Lead |
| Internal full 100-scenario regression | Annual | Red Team Lead |
| External penetration test | Annual | Independent qualified firm |
| Targeted retest after material change | Within 30 days of change | Red Team Lead |
| Z-NPHI isolation probe | Quarterly | DevSecOps |

External pentest scope must include the same surface as this report and explicitly include attempts at the four historical failure scenarios.

---

## 10.8 Evidence Retention

| Artifact | Retention |
|---|---|
| Audit logs | 7 years (HIPAA-aligned) |
| Operational logs | 1 year |
| Pentest reports | 7 years |
| Access reviews | 7 years |
| Change tickets & PRs | 7 years |
| Training records | 6 years post-employment |
| Incident records | 7 years |
| Vendor / BAA records | Term + 6 years |
| Backup integrity reports | 3 years |
| Risk register snapshots | Indefinite |

Retention enforced via WORM for audit; indexed and searchable for auditor queries within 24 hours of request.

---

## 10.9 Administrator Approval Controls

- **Two-person rule** is non-negotiable for: PIPs, corrective actions, chart writes, policy corpus updates, model updates, Vault rekey, backup restore/prune, role grants ≥ Admin, firewall changes, image deploys, audit pipeline configuration.
- Approvals logged with FIDO2 attestation to Z6.
- Approvers must be distinct OIDC subjects with distinct FIDO2 credential IDs.
- Throttle: 1 approval per 2 seconds per user (race protection).
- Quarterly review of approval logs by Security Officer.

---

## 10.10 Training Requirements

| Training | Audience | Cadence | Evidence |
|---|---|---|---|
| HIPAA general | All workforce | Annual + onboarding | LMS records |
| Role-based (clinical PHI handling) | DON, QA, Compliance, ReadOnlyClinical | Annual | LMS + practical |
| Privileged user | Admin, IT | Annual | LMS + practical |
| Phishing simulation | All workforce | Quarterly | Click-rate report |
| FIDO2 enrollment & duress | All staff with VPN | Onboarding + annual refresh | Sign-off |
| IR runbook drill | On-call rotation | Semi-annual | Drill records |
| Secure development | DevSecOps + developers | Annual | LMS |
| Data classification & PHI minimization | All clinical roles | Annual | LMS |

Training compliance tracked; non-compliance suspends access at 30-day overdue.

---

## 10.11 Vendor Risk

- Maintain vendor inventory.
- BAAs in place for any vendor with even incidental PHI access (e.g., hardware support).
- Re-evaluate vendor risk annually.
- Cloud SaaS vendors **prohibited** from PHI workflows.

---

## 10.12 Data Subject Rights & Breach Response

- Documented procedure for HIPAA right of access requests (PHI export approval through governed export workflow).
- Breach notification process aligned with HIPAA §164.404–§164.410: assessment of unsecured PHI, notification within 60 days, OCR notification, media notification if >500 individuals, state law overlay.
- Breach assessment uses **§164.402 four-factor test**.
- Pre-drafted notification templates reviewed by Privacy Officer + Counsel.

---

## 10.13 Continuous Improvement

- Lessons from incidents and pentests integrated into Hardening Manifest within 30 days.
- Standing red-team scenario regression set grows with each new finding (never shrinks without Security Officer approval).
- Annual review of this document set; version controlled.

---

## 10.14 Acceptance

By approving this document, Care Indeed leadership commits to:
1. Maintaining the operational regime above without exception.
2. Resourcing the cadences and roles defined.
3. Re-attesting to this regime annually.
4. Treating any deviation as a **material control failure** requiring Security Officer review and remediation.

Signatures:
- HIPAA Security Officer
- HIPAA Privacy Officer
- Compliance Officer
- IT Lead
- DevSecOps Lead
- Executive Sponsor / Governing Body Representative

---

**End of document set.** The full deliverable comprises files 01–10 in this directory plus the [README](./README.md) index.
