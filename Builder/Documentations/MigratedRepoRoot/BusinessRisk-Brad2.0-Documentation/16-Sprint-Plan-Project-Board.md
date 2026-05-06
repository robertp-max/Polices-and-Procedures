# 16 — Sprint Plan & Project Board (Jira/ClickUp Style)

**Scope:** Unified, executable project plan suitable for direct import into Jira / ClickUp / Linear / Azure DevOps. Covers a 10-sprint (20-week) build for whichever architecture is selected. Per-architecture sprint focus is in [15 §15.6](./15-Product-Requirements.md#156-sprint-plans-per-architecture-6–10-sprints-2-week-sprints).

> **Reminder:** Sprint completion ≠ HIPAA compliance. Each Definition of Done below includes compliance acceptance criteria. Misconfiguration = full organizational liability.

---

## 16.1 Roles (Owners)

| Code | Role |
|---|---|
| EXEC | Executive Sponsor |
| HSO | HIPAA Security Officer |
| CO | Compliance Officer |
| PO | Product Owner |
| TL | Tech Lead |
| SE | Security Engineer |
| PE | Platform / DevSecOps Engineer |
| AE | Application Engineer |
| MLE | ML / AI Engineer |
| SA | Salesforce Architect (Arch A only) |
| CLA | Cloud Architect (Arch B only) |
| VRM | Vendor Risk Manager (esp. Arch C) |
| CIN | Clinical Informaticist |
| QA | QA / Test Engineer |
| SA-OPS | SOC / Operations Analyst |
| LEGAL | Legal / Privacy Counsel |
| RN-LEAD | Nurse / Clinical Lead (UAT) |

---

## 16.2 Epics

| ID | Epic | Owner | Architectures |
|---|---|---|---|
| E-01 | Governance, Risk, Compliance Foundation | HSO | All |
| E-02 | Identity & Access (SSO, FIDO2, RBAC) | SE | All |
| E-03 | Network & Perimeter | PE / CLA | SH, B (limited in A, C) |
| E-04 | Data Protection (encryption, key mgmt, secrets) | SE | All |
| E-05 | AI Inference Plane (LLM) | MLE | SH, B (vendor-side in A, C) |
| E-06 | Application & Approval Engine | AE | SH, A, B (limited in C) |
| E-07 | Audit, SIEM, Detection | SA-OPS | All |
| E-08 | Backup & Disaster Recovery | PE | All |
| E-09 | Vendor Management & BAAs | VRM / LEGAL | A, B, C (light in SH) |
| E-10 | Clinical Workflow & UAT | CIN / RN-LEAD | All |
| E-11 | Pen Testing & Hardening Validation | SE | All |
| E-12 | Go-Live Readiness & Sign-off | EXEC / HSO | All |

---

## 16.3 Sprint-by-Sprint Board

Format: **[ID] Story / Task — Owner — Status — Depends on — Definition of Done**
Statuses: `Planned` / `In Progress` / `Blocked` / `In Review` / `Done`

### Sprint 1 — Foundations
| ID | Item | Type | Owner | Status | Deps | DoD |
|---|---|---|---|---|---|---|
| S1-001 | Approve architecture choice (SH/A/B/C) | Decision | EXEC, HSO | Planned | — | Signed memo, recorded in risk register |
| S1-002 | Stand up project board, repo, secrets vault | Task | TL | Planned | — | Repo + board live; secrets vault initialized |
| S1-003 | Risk Analysis (HIPAA §164.308(a)(1)(ii)(A)) draft | Story | HSO | Planned | S1-001 | Draft circulated; risks logged with owners |
| S1-004 | Policies & Procedures inventory + gap analysis | Story | CO | Planned | — | Gap list with target close dates |
| S1-005 | Provision base infrastructure (per arch) | Task | PE/CLA/SA | Planned | S1-001 | Infra reachable; baseline tags applied |
| S1-006 | Sign / verify BAAs (A, B, C) or N/A statement (SH) | Task | LEGAL | Planned | S1-001 | BAAs filed; sub-processor list reviewed |
| S1-007 | Threat model v0 ([04](./04-Threat-Model.md) tailored) | Story | SE | Planned | S1-001 | Doc reviewed by HSO |

### Sprint 2 — Identity & Network
| ID | Item | Type | Owner | Status | Deps | DoD |
|---|---|---|---|---|---|---|
| S2-001 | OIDC/SAML SSO with FIDO2 enforcement | Story | SE | Planned | S1-005 | All admins enrolled in FIDO2; password fallback removed |
| S2-002 | Role + scope model (RBAC) defined and implemented | Story | SE/AE | Planned | S2-001 | RBAC matrix approved; deny-by-default verified |
| S2-003 | VPN / Private Link / Edge proxy configured | Task | PE/CLA | Planned | S1-005 | No PHI service exposed to public internet |
| S2-004 | Conditional Access / Device trust policies | Task | SE | Planned | S2-001 | Non-managed devices blocked for PHI roles |
| S2-005 | Vault / Key Vault HSM with rotation policy | Task | SE | Planned | S1-005 | Keys generated in HSM; rotation policy active |
| S2-006 | Audit emit contract (event schema) | Story | AE/SA-OPS | Planned | — | Schema approved; sample events validated |

### Sprint 3 — Data Protection & Audit Pipeline
| ID | Item | Type | Owner | Status | Deps | DoD |
|---|---|---|---|---|---|---|
| S3-001 | PHI store provisioned with CMK (FHIR / Health Cloud / Postgres+MinIO) | Story | PE/CLA/SA | Planned | S2-005 | Encryption verified; key access scoped |
| S3-002 | Hash-chained WORM audit pipeline (or platform equivalent) | Story | SA-OPS | Planned | S2-006 | Chain verified; offline anchor running hourly |
| S3-003 | DLP / egress controls | Task | SE | Planned | S2-003 | Egress policy enforced; alerts wired |
| S3-004 | Log Analytics / Wazuh ingestion live | Task | SA-OPS | Planned | S3-002 | Sample alerts firing in test |
| S3-005 | Backup strategy implemented (Restic+LTO / OwnBackup / Azure Backup / vendor export) | Story | PE/SA | Planned | S3-001 | First successful backup verified |

### Sprint 4 — Application & Inference
| ID | Item | Type | Owner | Status | Deps | DoD |
|---|---|---|---|---|---|---|
| S4-001 | App skeleton with auth + RBAC + audit emit | Story | AE | Planned | S2-001, S2-006 | Smoke test passes; audit entries land in pipeline |
| S4-002 | LLM inference plane (vLLM / Azure OpenAI / Trust Layer / vendor) | Story | MLE | Planned | S1-005 | Inference reachable; PHI never logged in plain text |
| S4-003 | Per-session worker isolation + memset (SH) / abuse-monitoring opt-out (B) / Trust Layer config (A) / vendor PHI carve-out (C) | Story | MLE/SE | Planned | S4-002 | Verified via canary or vendor attestation |
| S4-004 | Chart-review request → response end-to-end | Story | AE/MLE | Planned | S4-001, S4-002 | First successful synthetic-PHI workflow |
| S4-005 | OPA / authorization policies | Story | SE | Planned | S4-001 | Deny-by-default proven via tests |

### Sprint 5 — Approval Engine & Property Tests
| ID | Item | Type | Owner | Status | Deps | DoD |
|---|---|---|---|---|---|---|
| S5-001 | Two-person approval engine implemented | Story | AE | Planned | S4-001 | DB UNIQUE constraint enforced; idempotent |
| S5-002 | Property tests for approval invariants | Task | QA/AE | Planned | S5-001 | 10k randomized scenarios pass; race tests pass |
| S5-003 | Approval workflow integrated with chart actions | Story | AE | Planned | S5-001 | All chart-affecting actions require 2-person |
| S5-004 | Break-glass emergency access path | Story | AE/SE | Planned | S5-001 | Extra logging verified; alert on use |
| S5-005 | Auditor read-only role | Task | SE | Planned | S2-002 | Auditor cannot modify; can read all |

### Sprint 6 — Detection, SIEM, Response
| ID | Item | Type | Owner | Status | Deps | DoD |
|---|---|---|---|---|---|---|
| S6-001 | SIEM detection rules (sharing change, public storage, key access, abnormal AI usage, etc.) | Story | SA-OPS | Planned | S3-004 | Rules tested with synthetic events |
| S6-002 | On-call rotation + paging + IR runbook | Task | SA-OPS | Planned | S6-001 | Runbook signed off; first paging test passes |
| S6-003 | Tabletop exercise (ransomware + insider + LLM exfil) | Story | HSO/CO | Planned | S6-002 | Lessons logged; remediations created |
| S6-004 | Drift detection + nightly reconcile | Task | PE | Planned | S1-005 | Drift produces alert; auto-revert verified |

### Sprint 7 — Backup, DR, BC
| ID | Item | Type | Owner | Status | Deps | DoD |
|---|---|---|---|---|---|---|
| S7-001 | Restore drill (cold restore from backup) | Story | PE | Planned | S3-005 | RTO ≤ 4h, RPO ≤ 1h verified |
| S7-002 | Offline / vendor-down workflow (esp. Arch C) | Story | CIN/RN-LEAD | Planned | — | Documented + walkthrough completed |
| S7-003 | Geo / multi-region failover (Arch B) or secondary site (SH) | Story | PE/CLA | Planned | — | Failover verified or accepted-risk documented |
| S7-004 | Sandbox / non-prod data masking | Task | PE/SA | Planned | — | No real PHI in non-prod |

### Sprint 8 — Pen Test Pass 1 + Remediation
| ID | Item | Type | Owner | Status | Deps | DoD |
|---|---|---|---|---|---|---|
| S8-001 | Internal red-team scenarios 1–50 (per [06](./06-Breach-Simulation-100-Pass.md)) | Story | SE | Planned | All prior | Findings logged |
| S8-002 | Remediate any P1/P2 finding | Task | SE/AE/PE | Planned | S8-001 | All P1/P2 closed or accepted by HSO |
| S8-003 | Re-run failed scenarios to PASS | Task | SE | Planned | S8-002 | All scenarios PASS |

### Sprint 9 — Pen Test Pass 2 + Compliance Evidence
| ID | Item | Type | Owner | Status | Deps | DoD |
|---|---|---|---|---|---|---|
| S9-001 | Internal red-team scenarios 51–100 | Story | SE | Planned | S8-003 | All PASS |
| S9-002 | External pentest engagement (Arch B/SH at minimum) | Story | SE/LEGAL | Planned | S9-001 | Report received; remediations tracked |
| S9-003 | Compliance evidence pack assembled (control matrix, hardening manifest, pentest report, training records) | Story | CO/HSO | Planned | All prior | Pack reviewed by HSO + EXEC |
| S9-004 | UAT with clinical leads | Story | RN-LEAD/CIN | Planned | All prior | Sign-off captured |

### Sprint 10 — Go-Live Readiness & Sign-off
| ID | Item | Type | Owner | Status | Deps | DoD |
|---|---|---|---|---|---|---|
| S10-001 | Final risk acceptance / residual risk register | Story | HSO/EXEC | Planned | S9-003 | Signed; archived in compliance vault |
| S10-002 | Training: workforce + admins + clinicians | Story | CO/CIN | Planned | — | 100% attendance; quiz pass ≥ 90% |
| S10-003 | Go/No-Go meeting | Decision | EXEC | Planned | S10-001 | Recorded decision |
| S10-004 | Cutover + 30-day shadow period | Story | TL | Planned | S10-003 | Shadow metrics within thresholds |
| S10-005 | Post-go-live retrospective | Story | TL/PO | Planned | S10-004 | Retro logged; backlog updated |

---

## 16.4 Cross-Sprint Continuous Workstreams

| Workstream | Owner | Cadence |
|---|---|---|
| Vendor risk re-evaluation (esp. Arch A/B/C) | VRM | Quarterly |
| Sub-processor change review | VRM/LEGAL | On notice + quarterly |
| Access review (joiners/movers/leavers) | SE/HSO | Monthly + quarterly attest |
| Patch management | PE | Monthly + emergency |
| SIEM tuning + alert quality review | SA-OPS | Sprint cadence |
| Drift detection + reconcile | PE | Nightly automated, weekly review |
| Approval engine property tests | QA | Per PR + nightly |
| Tabletop exercises | HSO | Quarterly |
| Restore drills | PE | Quarterly |
| Risk register update | HSO | Monthly |
| Training | CO | Onboarding + annual |

---

## 16.5 Dependency Graph (Selected Critical Path)

```
S1-001 (architecture decision)
  └─► S1-005 (provision infra)
        ├─► S2-001 (SSO+FIDO2) ──► S2-002 (RBAC) ──► S4-001 (app)
        ├─► S2-005 (HSM/Vault) ──► S3-001 (PHI store w/ CMK)
        ├─► S2-003 (network) ──► S3-003 (DLP/egress)
        └─► S4-002 (inference) ──► S4-004 (E2E review)
                                      └─► S5-001 (approval) ──► S5-002 (property tests)

S2-006 (audit schema) ──► S3-002 (WORM/chain) ──► S6-001 (SIEM rules) ──► S8-001 (pen test 1)
S3-005 (backup) ──► S7-001 (restore drill)
All prior ──► S9-003 (evidence pack) ──► S10-001 (risk acceptance) ──► S10-003 (Go/No-Go)
```

---

## 16.6 Definition of Ready (story acceptance)

A story is **Ready** only if:
- Acceptance criteria are explicit and testable
- HIPAA / SOC 2 control mapping is recorded (if security/compliance-relevant)
- Owner identified (single accountable role)
- Dependencies identified
- Test data is synthetic (no real PHI in non-prod) — explicit
- Reviewer assigned (must be different person than author for security work)

## 16.7 Definition of Done (sprint acceptance)

A sprint is **Done** only if:
- All committed stories meet their acceptance criteria
- All security/compliance items have evidence in the compliance vault
- All P1/P2 findings from the sprint's testing closed or formally risk-accepted
- Audit pipeline has captured every action taken during the sprint
- HSO has signed the sprint compliance attestation

---

## 16.8 Risks & Mitigations (project execution)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Architecture choice changes mid-build | Med | High | Lock decision in S1-001; require EXEC+HSO sign-off to change |
| Talent shortage (cloud / Salesforce / DevSecOps) | High | High | Identify partner / contractor backup before Sprint 1 |
| Vendor BAA / opt-out delays (esp. Azure OpenAI abuse-monitoring opt-out, Salesforce HIPAA SKU enablement) | Med | Med | Submit in Sprint 1; track to closure |
| Scope creep (clinicians ask for new workflow) | High | Med | Backlog with PO; freeze beyond Sprint 4 |
| Sandbox PHI leakage | Med | Critical | Mandatory data mask in S7-004; CI gate to fail on real-PHI patterns |
| Pen test reveals fundamental design flaw | Low | Critical | Budget contingency; restart-on-failure pattern from [07](./07-Failure-Restart-Log.md) |

---

## 16.9 Reporting & Cadence

- **Daily standup:** TL + active engineers (15 min).
- **Sprint review:** PO + EXEC + HSO + clinical lead (30 min).
- **Sprint retro:** Whole team (30 min).
- **Monthly steering:** EXEC + HSO + CO + TL.
- **Quarterly governance:** All leadership + external auditor briefing.
- **On-call rotation:** SE + PE + SA-OPS, 24/7 once production PHI lands.

---

## 16.10 Theme Reinforcement

> **Shipping the sprint plan does not ship compliance.** A green project board with all items marked "Done" can still represent a non-compliant system if controls were not configured correctly, evidence was not collected, or operational discipline was not established. The sprint plan is a **scaffold for compliance, not a substitute for it**. Misconfiguration at any stage = full organizational liability.
