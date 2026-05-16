# 10 â€” Operational Recommendations (Brad 1.0 LIVE)

**Status:** **RECOMMENDATIONS ONLY. NOT APPLIED.**
**Audience:** Care Indeed leadership, HIPAA Security Officer, IT/Operations.
**Purpose:** Define what Care Indeed must do **organizationally** to operate Brad (1.0 today, 2.0 tomorrow) at HIPAA / SOC 2 standard, independent of the technical hardening recommended in [05](./05-Hardening-Blueprint.md) and [08](./08-Final-Hardening-Manifest.md).

---

## 10.1 Governance

- **Name a Brad-specific HIPAA Security Officer** in writing, with explicit accountability for Brad 1.0 (and successor versions).
- **Charter a Brad governance committee** including: Security Officer, Compliance, DON representation, IT lead, and an Executive sponsor. Quarterly review of risk register, findings, and access review attestations.
- **Maintain a living risk register** seeded by the threat model in [04](./04-Threat-Model.md). Annual reassessment plus event-driven updates.
- **Decision authority for Go/No-Go on PHI use** rests with the HIPAA Security Officer with Executive ratification.

---

## 10.2 Change Management

- **All production changes** to Brad pipeline / config / model / corpus require:
  - signed-commit PR with two reviewers,
  - automated CI gates (gitleaks, Trivy, kics/checkov),
  - documented change ticket,
  - production deploy via gated pipeline.
- **Emergency changes** allowed with named approver; require post-hoc CAB review within 5 business days.
- **Drift detection** runs nightly; non-emergency drift is auto-reverted.

---

## 10.3 Access Review Cadence

- **Quarterly access review** with named-data-owner attestation for each role grant.
- **Immediate review on role change** (promotion, transfer, termination).
- **Brad-specific termination runbook** with sub-60-second target for revocation across WireGuard / Vault / OIDC / app session.
- **Separation-of-duties enforcement:** no single human holds both `Admin` and `Compliance`/`Auditor`.

---

## 10.4 Patch & Vulnerability Cadence

| Severity | SLA |
|---|---|
| Critical CVE | 72 hours |
| High | 7 days |
| Medium | 30 days |
| Low | 90 days |

- **Source-of-truth:** Trivy (images), OpenSCAP/Lynis (hosts), npm audit / Snyk (dependencies), monthly authenticated network scan, quarterly external pentest.
- **Exception process:** any deferral past SLA requires Security Officer sign-off + compensating control + scheduled re-evaluation.

---

## 10.5 Incident Response Drills

- **Tabletop IR exercises:** **semi-annually**, scenarios rotated across:
  1. Operator account compromise.
  2. Suspected PHI exfil via prompt injection.
  3. Audit chain break / suspected log tampering.
  4. Backup tamper / ransomware on inference host.
  5. Suspected Google SA-key leak.
  6. Tunnel / VPN endpoint compromise.
  7. Container escape (when containerized).
  8. ComfyUI / non-PHI module crossover.
- **Live IR drill (full-scope):** **annually**, with external IR firm participation.
- **Post-mortem with corrective actions** within 10 business days for every drill or real event.

---

## 10.6 Backup Restore Tests

- **Quarterly restore drill** into a clean, isolated staging environment.
- **End-to-end integrity verification** (data + audit chain + service operability).
- **Documented restore runbook** with named owner; reviewed annually.
- **RTO 4h / RPO 1h** targets verified by drill evidence.

---

## 10.7 Penetration Retest Cadence

- **Internal red-team simulation** (the loop in [06](./06-Breach-Simulation-100-Pass.md)): **quarterly**.
- **External independent pentest:** **annually**.
- **Triggered retest** after any Critical/High finding remediation.
- **Triggered retest** after any architectural change (new module, new GPU host, new tunnel, new identity provider, etc.).

---

## 10.8 Evidence Retention

- **Audit logs:** 7 years (HIPAA-aligned).
- **Operational logs:** 1 year.
- **Pen-test reports + remediation evidence:** 7 years.
- **Access reviews + attestations:** 7 years.
- **Training records:** 7 years.
- **IR drill records and post-mortems:** 7 years.
- **Backup integrity verification reports:** 7 years.
- **Legal hold mechanism documented and tested annually.**

---

## 10.9 Administrator Approval Controls

- **Two-person rule** enforced server-side (technical control in [05 Â§5.5](./05-Hardening-Blueprint.md#55-local-service-architecture)) for:
  - PIP creation / approval / execution,
  - corrective action execution,
  - chart write-back,
  - PHI export,
  - role assignment (Admin and above),
  - firewall / network ACL change,
  - container image deploy,
  - Vault unseal / rekey,
  - backup restore.
- **FIDO2 attestation** required at the moment of approval; recorded in the WORM audit ledger.
- **No approval may be granted by the same person who initiated the request.**

---

## 10.10 Training Requirements

- **All Brad users:** annual HIPAA refresher + Brad-specific operator handling training (covers prompt-injection awareness, screen-share hygiene, working-tree hygiene, never-commit-secrets discipline, what PHI looks like in outputs).
- **Brad operators (privileged):** annual + role-based training, plus quarterly phishing simulation, plus secure-coding refresher (for any developer with merge rights to the Brad repo).
- **Security Officer:** maintain CISSP/HCISPP/equivalent; annual continuing education.
- **Executive leadership:** annual security briefing + tabletop participation.
- **Training completion is a gate for access:** no completion = access revoked.

---

## 10.11 Vendor Risk Management

- **Maintain a vendor inventory** of every external service Brad touches (OIDC IdP, hardware vendors, model weight providers, npm registry, OS vendor, cloud sync if any).
- **BAA required** for any vendor with possible incidental PHI access.
- **The Google Cloud project referenced by `Builder/orbital-stage-...json`** must be inventoried and its BAA status confirmed. If not BAA-covered for PHI, the integration must be reviewed.
- **Annual vendor review.**

---

## 10.12 Communication & Notification

- **Internal communication tree** printed, laminated, and reachable out-of-band.
- **Breach notification readiness:** documented procedure aligned with HIPAA Breach Notification Rule (60-day individual notification, media + HHS thresholds).
- **Customer / governing body notification matrix** documented.
- **External counsel and IR firm** on retainer with documented engagement procedure.

---

## 10.13 Specific Operational Recommendations Stemming From This Assessment

These are the high-leverage operational actions Care Indeed should consider, in priority order, **regardless of platform topology**:

1. **Confirm BAA scope of every Google service touched by `Builder/orbital-stage-443721-v1-99d78d776418.json`.** If any of those scopes can touch PHI, treat the service relationship itself as a compliance question.
2. **Treat the file above as a credential-leak risk and plan a coordinated rotation** with the Google Cloud project owner. (Technical removal from working tree is recommended in [05 Â§5.7](./05-Hardening-Blueprint.md#57-secrets-management) but is **not** performed by this assessment.)
3. **Pause unrestricted PHI use of Brad 1.0** pending a decision on the constrained interim operating mode in [01 Â§1.5](./01-Executive-Security-Summary.md#15-recommended-interim-operating-mode-recommendation-only--not-implemented).
4. **Authorize the Brad.pi build-out** as the defensible production target.
5. **Charter the Brad governance committee** in Â§10.1 above.
6. **Schedule the first quarterly internal pen-test re-run** after any remediation, using the protocol in [06](./06-Breach-Simulation-100-Pass.md).
7. **Fund the operational cadences** in Â§10.4â€“Â§10.7 as recurring line items, not one-time projects.

---

## 10.14 Final Note

> Technical hardening alone will not produce HIPAA / SOC 2 compliance. Compliance is the **operational practice** of running, monitoring, reviewing, drilling, retraining, and re-testing those technical controls over time. The recommendations in this document are the operational scaffolding around the technical recommendations elsewhere in this set. **None of them have been applied** by this assessment; they are presented for leadership decision.

