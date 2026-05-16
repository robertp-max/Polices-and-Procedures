# 15 â€” Product Requirements & User Stories (per Architecture)

**Scope:** Translate each of the four candidate architectures (SH, A, B, C) into product build requirements suitable for engineering execution and compliance review.

> **Reminder applies to every requirement below:** Building to these requirements does not, by itself, make the system HIPAA-compliant. Compliance arises from correct configuration, supported architecture, and disciplined operations. **Misconfiguration in any of these builds = full organizational liability.**

---

## 15.1 Cross-Architecture Common Requirements

Every architecture (including SH) must satisfy these baseline functional + non-functional requirements:

### 15.1.1 Functional (common)
- **F-COM-01** Authenticate users via organization SSO (OIDC/SAML) with FIDO2 mandatory.
- **F-COM-02** Authorize access to PHI by role + scope (site, patient panel).
- **F-COM-03** Allow chart review request creation by authorized users.
- **F-COM-04** Return AI-generated findings with explainable evidence (chart citation + policy citation).
- **F-COM-05** Require two-person approval for any chart-affecting or PIP-affecting action.
- **F-COM-06** Capture immutable audit of every PHI access and every action.
- **F-COM-07** Allow controlled PHI export under Admin + DLP + 2-person approval.
- **F-COM-08** Provide auditor read-only role.
- **F-COM-09** Provide break-glass emergency access with extra logging.
- **F-COM-10** Auto-logoff after 15 min idle; hard cap 8h.

### 15.1.2 Non-functional (common)
- **NF-COM-01** PHI encrypted at rest and in transit (TLS 1.3 min).
- **NF-COM-02** RTO â‰¤ 4h, RPO â‰¤ 1h.
- **NF-COM-03** Audit retention â‰¥ 7 years, tamper-evident.
- **NF-COM-04** P95 chart review latency â‰¤ 30s; P99 â‰¤ 90s.
- **NF-COM-05** â‰¥ 99.5% uptime within business hours.
- **NF-COM-06** All third-party processors of PHI must hold a current BAA.
- **NF-COM-07** All deviations from supported vendor architecture require Security Officer approval and documented compensating controls.

---

## 15.2 Architecture SH â€” Self-hosted Brad.pi

### 15.2.1 Functional (SH-specific)
- **F-SH-01** Local LLM inference on dedicated GPU host with per-session worker isolation.
- **F-SH-02** Read-only mounts for PHI corpus and policy corpus to inference plane.
- **F-SH-03** Approval engine with DB-enforced UNIQUE on (action_id, approver_id) and distinct-subject predicate.
- **F-SH-04** Hash-chained WORM audit pipeline with hourly offline anchor.
- **F-SH-05** OPA policy decisions on every request with deny-by-default.

### 15.2.2 Non-functional (SH-specific)
- **NF-SH-01** Egress DROP from inference zone except audit + model mirror.
- **NF-SH-02** VRAM remanence canary every 10 min; P1 alert on leak.
- **NF-SH-03** Backups in object-lock Compliance mode + LTO offline rotation.

### 15.2.3 User Stories (SH)

- **As an RN (DON):** I want to request a chart review and see deficiencies cited to specific chart sections and specific policy clauses, so I can act with confidence.
- **As a Compliance Officer:** I want to co-approve every PIP with my own FIDO2 key, so that no single user can issue an unauthorized PIP.
- **As an Admin:** I want backup restores to require two-person approval, so an insider cannot poison recovery alone.
- **As an Executive:** I want a monthly attestation that PHI never left the building, so I can confidently sign Â§164.402 risk assessments.
- **As an Auditor:** I want to verify the audit hash chain end-to-end and read all audit entries without write capability, so I can attest integrity.
- **As IT:** I want all hosts to revert configuration drift overnight, so I never come in to a misconfigured production.
- **As an RN on call after hours:** I want emergency mode to allow PHI read with extra logging, so I can act in patient safety situations without bypassing the audit.

### 15.2.4 Deliverables (SH)
- Brad API + UI; OPA bundle; Approval Engine; vLLM worker supervisor; audit ledger; Vault + PKI; Wazuh/Falco/AIDE; backup (Restic+LTO).
- Hardening Manifest [08](./08-Final-Hardening-Manifest.md) implemented end-to-end.
- 100-pass simulation evidence [06](./06-Breach-Simulation-100-Pass.md).
- Compliance artifacts [03](./03-HIPAA-SOC2-Control-Matrix.md), [09](./09-Penetration-Test-Report.md).

### 15.2.5 Engineering / Security / Infra Tasks
- Provision GPU host(s); install vetted NVIDIA driver pinned version.
- Build Brad API w/ OIDC + FIDO2 + OPA integration.
- Build Approval Engine with property tests in CI.
- Build vLLM worker supervisor (one process per session + cudaMemset on spawn).
- Stand up Vault with Shamir 3-of-5; configure PKI + transit + AppRole.
- Configure Wazuh + Falco + AIDE + osquery.
- Build hash-chained WORM audit pipeline with offline anchor.
- Provision Restic + LTO + offsite MinIO with object-lock Compliance.
- Author Ansible playbooks; CI gates (OpenSCAP, Lynis, Trivy, kics, gitleaks, cosign).
- Run 100-pass simulation; remediate; restart on failure; document.

---

## 15.3 Architecture A â€” Salesforce / Agentforce

### 15.3.1 Functional (A-specific)
- **F-A-01** Health Cloud objects + sharing model designed for least-privilege site/panel scope.
- **F-A-02** Agentforce action library limited to vetted, BAA-covered LLMs and Trust Layerâ€“brokered prompts.
- **F-A-03** Field Audit Trail enabled on all PHI fields with maximum retention.
- **F-A-04** Shield Platform Encryption on PHI fields/objects.
- **F-A-05** Two-person approval implemented as Approval Process + Apex guard with `WITH SHARING` and CAS check.

### 15.3.2 Non-functional (A-specific)
- **NF-A-01** No AppExchange package processes PHI without independent BAA and security review.
- **NF-A-02** No sandbox seeded with real PHI; Salesforce Data Mask enforced for all sandbox refresh.
- **NF-A-03** Connected Apps and Named Credentials reviewed quarterly; no broad scopes.
- **NF-A-04** Backup via OwnBackup or equivalent, daily; quarterly restore drill.
- **NF-A-05** Use only HIPAA-eligible Salesforce SKUs and Einstein/Agentforce models.

### 15.3.3 User Stories (A)
- **As a Compliance Officer:** I want every Agentforce action to be logged in Field Audit Trail + Event Monitoring so I can reconstruct any action.
- **As an Admin:** I want sharing rules to default to the most restrictive setting and exceptions to require ticketed change with two reviewers.
- **As an RN:** I want the agent to surface only PHI I am already authorized to see in Health Cloud.
- **As IT:** I want sandbox refresh to fail if Data Mask is not applied to PHI fields.
- **As an Executive:** I want a quarterly report demonstrating that no PHI flowed to non-HIPAA-eligible Salesforce SKUs (Marketing Cloud, etc.).

### 15.3.4 Deliverables (A)
- Health Cloud configuration (objects, sharing, profiles, perm sets, FLS).
- Agentforce action set + prompt templates + grounding scope.
- Shield + Field Audit Trail + Event Monitoring config.
- OwnBackup deployment + restore drill evidence.
- Salesforce DX repo + CI for Apex/LWC + signed deploy pipeline.
- AppExchange BAA register.
- Compliance evidence pack reflecting Salesforce attestations + customer-side controls.

### 15.3.5 Tasks (A)
- Define data model + sharing strategy with HIPAA Security Officer sign-off.
- Build profiles, perm sets, FLS, sharing rules.
- Implement Approval Process for PIPs with Apex guard (`WITH SHARING`, idempotency).
- Configure Trust Layer prompts + grounding.
- Enable Shield + FAT + EM; configure retention.
- Stand up DX + CI; integrate static analysis (PMD-Apex), packaging.
- Configure Data Mask for sandboxes; gate refresh behind admin ticket.
- Build dashboards for sharing-violation monitoring.
- Quarterly AppExchange + sub-processor review process.

---

## 15.4 Architecture B â€” Azure HIPAA Stack

### 15.4.1 Functional (B-specific)
- **F-B-01** Custom app on App Service / AKS with Entra ID auth + Conditional Access.
- **F-B-02** Azure OpenAI deployment in eligible region with abuse-monitoring opt-out for PHI workloads.
- **F-B-03** PHI at rest in FHIR Service + blob with CMK in Key Vault HSM.
- **F-B-04** Sentinel rules for: storage policy change, OpenAI abnormal usage, role assignment changes, key access anomalies, public IP exposure.
- **F-B-05** Two-person approval implemented at app layer with DB-enforced uniqueness.

### 15.4.2 Non-functional (B-specific)
- **NF-B-01** All PHI services behind Private Endpoints; no public network access.
- **NF-B-02** Front Door + WAF in front of any user-facing endpoints.
- **NF-B-03** Diagnostic logs to a Log Analytics workspace within BAA scope only.
- **NF-B-04** Use only HIPAA-eligible services + GA features for PHI workloads (no preview).
- **NF-B-05** Geo-redundant backup; tested restore quarterly.

### 15.4.3 User Stories (B)
- **As a Compliance Officer:** I want Sentinel to alert if any storage account in the PHI subscription becomes publicly accessible.
- **As an Admin:** I want Conditional Access to block sign-in from non-managed devices for PHI-touching roles.
- **As an RN:** I want chart review responses to be returned within seconds with consistent latency, even at peak.
- **As IT:** I want PTU sizing alerts before tokens are throttled.
- **As an Executive:** I want monthly evidence that no PHI workload runs in a non-eligible region or preview service.

### 15.4.4 Deliverables (B)
- Azure landing zone (subscription, RG, RBAC, network).
- Private Endpoints + VNets + NSGs + Front Door + WAF.
- App Service / AKS deployment of Brad-equivalent app.
- FHIR Service + blob storage with CMK.
- Azure OpenAI deployment(s) with abuse-monitoring opt-out.
- Key Vault (HSM) with rotation policy.
- Sentinel + Defender for Cloud configuration, custom analytics rules.
- Backup (Azure Backup) + DR (paired region) + drill evidence.
- Compliance evidence pack inheriting Azure attestations + customer-side controls.

### 15.4.5 Tasks (B)
- Build landing zone via Bicep/Terraform with policy guardrails (Azure Policy).
- Implement app w/ Entra ID auth + role claims + OPA-equivalent (Open Policy Agent or in-app).
- Submit Azure OpenAI abuse-monitoring opt-out request; track ticket.
- Configure CMK rotation + access policies in Key Vault.
- Build Sentinel workbook + alert rules; integrate with on-call.
- Implement DR runbook + quarterly restore drill.
- Build CI/CD with OpenSSF best practices, container signing, IaC scanning.

---

## 15.5 Architecture C â€” Vertical Healthcare AI SaaS

### 15.5.1 Functional (C-specific)
- **F-C-01** SSO from organization IdP with FIDO2 enforcement.
- **F-C-02** EHR integration with **least-scope** data feeds (only fields/patients required).
- **F-C-03** Clinician sign-off required on all AI outputs that affect documentation.
- **F-C-04** Audit export pulled to organization SIEM weekly.
- **F-C-05** Data deletion / portability process tested annually.

### 15.5.2 Non-functional (C-specific)
- **NF-C-01** Vendor BAA + sub-processor list reviewed quarterly.
- **NF-C-02** Default ToS amended to exclude PHI use for model training/improvement.
- **NF-C-03** Offline clinical workflow documented for vendor outage.
- **NF-C-04** Vendor preview/lab features disabled for PHI workloads.

### 15.5.3 User Stories (C)
- **As a Compliance Officer:** I want vendor sub-processor change notifications routed to me for re-evaluation within 30 days.
- **As an Admin:** I want EHR data scope to default to a single site and require a ticket to expand.
- **As an RN:** I want to sign off on AI documentation suggestions and have my sign-off recorded.
- **As IT:** I want to extract audit weekly and verify it against expected actions.
- **As an Executive:** I want a documented offline workflow my clinicians can run if the vendor is down.

### 15.5.4 Deliverables (C)
- Signed BAA with PHI-use carve-out.
- SSO integration + role mapping.
- EHR integration with least-scope feeds.
- Audit export + SIEM ingestion.
- Vendor risk register entry + quarterly review cadence.
- Offline workflow runbook.
- Termination playbook with data deletion verification template.

### 15.5.5 Tasks (C)
- Negotiate BAA + ToS amendment.
- Configure SSO + provisioning.
- Configure EHR integration; review scope with HIPAA Security Officer.
- Build SIEM ingestion of vendor audit exports.
- Build offline workflow + practice it semi-annually.
- Build termination playbook + dry-run.

---

## 15.6 Sprint Plans (per architecture, 6â€“10 sprints, 2-week sprints)

### 15.6.1 SH Sprint Plan (already validated; included for completeness)
| Sprint | Focus | Priorities | Dependencies |
|---|---|---|---|
| 1 | Hardening baseline (Linux, Docker) | Ansible bring-up + CI gates | Hardware provisioning |
| 2 | Identity + Vault + PKI | OIDC, FIDO2, mTLS plumbing | Sprint 1 |
| 3 | Brad API skeleton + OPA | RBAC, audit emit | Sprint 2 |
| 4 | vLLM worker pattern + GPU host | Per-session worker, memset, canary | GPU host ready |
| 5 | Approval engine | DB constraints, property tests | Sprint 3 |
| 6 | Audit pipeline + WORM + chain | Hash chain + offline anchor | Sprint 1 |
| 7 | Backup + DR | Restic + LTO + restore drill | Sprint 6 |
| 8 | First red-team pass + remediation | Run scenario set 1â€“50 | Sprints 1â€“7 |
| 9 | Second red-team pass + remediation | Run 51â€“100 | Sprint 8 |
| 10 | Compliance evidence + go-live readiness | Hardening manifest, pen test report, sign-off | Sprints 1â€“9 |

### 15.6.2 A Sprint Plan
| Sprint | Focus | Priorities | Dependencies |
|---|---|---|---|
| 1 | Org strategy + data model | Sharing model, profiles, FLS | Health Cloud provisioned |
| 2 | Shield + FAT + EM enablement | Field-level encryption, audit retention | Sprint 1 |
| 3 | Approval Process + Apex guard | 2-person rule, idempotency | Sprint 1 |
| 4 | Agentforce action set + Trust Layer prompts | Grounding scope tied to user perms | Sprints 1â€“3 |
| 5 | Sandbox + Data Mask + DX/CI | Sandbox refresh gated; CI for Apex | Sprint 1 |
| 6 | OwnBackup + restore drill | Backup config + first drill | Sprints 1, 5 |
| 7 | Sharing-violation monitoring + dashboards | Detect over-share | Sprint 2 |
| 8 | AppExchange + sub-processor review process | Inventory + cadence | â€” |
| 9 | UAT + clinician training | End-to-end validation | Sprints 1â€“8 |
| 10 | Go-live + 30-day shadow + sign-off | Compliance evidence | All prior |

### 15.6.3 B Sprint Plan
| Sprint | Focus | Priorities | Dependencies |
|---|---|---|---|
| 1 | Landing zone + RBAC + network | Subscription, VNets, Private Endpoints | Tenant ready |
| 2 | Identity + Conditional Access | Entra ID FIDO2, CA policies | Sprint 1 |
| 3 | Storage + FHIR + Key Vault HSM + CMK | Encryption + rotation | Sprint 1 |
| 4 | App skeleton (App Service/AKS) | Auth, OPA, audit emit | Sprints 1â€“2 |
| 5 | Azure OpenAI deployment + abuse opt-out | Region selection, content filter, opt-out request | Sprint 1 |
| 6 | Approval engine + DB constraints | 2-person rule, property tests | Sprint 4 |
| 7 | Sentinel + Defender + analytics rules | Custom rules, dashboards | Sprints 1â€“6 |
| 8 | Backup + DR + drill | Geo-redundancy + restore | Sprint 3 |
| 9 | Pentest pass + remediation | External or internal | All prior |
| 10 | Go-live + sign-off | Evidence, runbooks | All prior |

### 15.6.4 C Sprint Plan
| Sprint | Focus | Priorities | Dependencies |
|---|---|---|---|
| 1 | BAA + ToS amendment + procurement | Legal + carve-outs | Vendor selection |
| 2 | SSO + IdP integration | Provisioning + FIDO2 | Sprint 1 |
| 3 | EHR integration least-scope | Single-site pilot scope | Sprint 1 |
| 4 | Workflow configuration | Roles, panels, sign-off requirements | Sprints 2â€“3 |
| 5 | Audit export + SIEM ingestion | Wazuh/Sentinel ingest of vendor audit | Sprint 4 |
| 6 | Offline workflow design + tabletop | Vendor-down runbook | â€” |
| 7 | Vendor risk register + quarterly cadence | Sub-processor review | â€” |
| 8 | UAT + clinician training | End-to-end validation | Sprints 1â€“6 |
| 9 | Pilot go-live (single site) | Limited PHI flow | All prior |
| 10 | Expand or termination playbook dry-run | Decision gate | All prior |

---

## 15.7 Compliance Artifacts (per architecture)

| Artifact | SH | A | B | C |
|---|---|---|---|---|
| BAA | N/A (self) | Salesforce master + AppExchange + sub-processors | Microsoft master | Vendor + sub-processors |
| Risk Analysis | Required | Required | Required | Required |
| Policies & Procedures | Required | Required | Required | Required |
| Hardening / Config Baseline | [08](./08-Final-Hardening-Manifest.md) | Salesforce config baseline | Azure landing zone baseline | Vendor config baseline |
| Pentest Report | [09](./09-Penetration-Test-Report.md) | Customer-side pentest required | Customer-side pentest required | Vendor's + customer-side scope |
| Audit logs (7-yr) | Owned | FAT + EM | Sentinel + Log Analytics + immutable storage | Vendor + exported to org SIEM |
| Access reviews | Quarterly | Quarterly | Quarterly | Quarterly |
| Backup + DR drill evidence | Quarterly | Quarterly (OwnBackup) | Quarterly (Azure Backup) | Documented vendor + customer-side offline drill |
| Vendor risk re-evaluation | Annual | Quarterly (AppExchange + sub-processors) | Quarterly (Microsoft sub-processors) | **Quarterly (critical)** |
| Training records | Required | Required | Required | Required |

