# Complete EHR Development Inventory

**Project:** Care Indeed EHR planning baseline  
**Purpose:** Inventory the required technical, compliance, certification, operational, and product components needed to develop an Electronic Health Record from scratch.  
**Status:** Planning baseline for architecture and UI/UX discovery. Not yet a final engineering specification.  
**Last updated:** 2026-08-03

---

## Executive Summary

Building an EHR from scratch is not just building a clinical CRUD application. It is a regulated, safety-critical, interoperability-heavy platform that must support clinical workflows, protected health information, auditability, data exchange, security controls, operational resilience, and possibly ONC certification.

This inventory is complete enough to begin UI/UX and architecture design now. It should be treated as the master planning inventory, not the final locked build specification. The next layer needed before full engineering execution is a Care Indeed-specific requirements pass for home health workflows, OASIS, CMS home health operations, California-specific needs, claims/billing scope, physician order workflows, visit documentation, QA review, survey-readiness evidence, and integration targets.

Recommended build posture:

1. Use a relational transactional core as the legal clinical system of record.
2. Wrap it with standards-facing interoperability services for FHIR, SMART on FHIR, HL7 v2, C-CDA, Direct, TEFCA, NCPDP, and DICOM where applicable.
3. Externalize terminology and clinical decision support into dedicated services.
4. Treat audit logs, IAM, backup/DR, privacy, and observability as product features, not back-office infrastructure.
5. Start UI/UX now, but keep requirements discovery running in parallel.

---

# 1. Critical Foundation — Must Exist Before Serious Build

## 1.1 Product Scope and Governance

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Care setting definition | Define whether the EHR is home health only, broader post-acute, ambulatory, hospice, private duty, or multi-setting. | Critical | MVP |
| User personas | Define roles: RN, LVN, PT, PTA, OT, OTA, SLP, MSW, HHA, DON, administrator, intake, scheduler, QA, billing, physician, patient/representative. | Critical | MVP |
| Product boundaries | Decide what is in-scope: clinical chart, scheduling, orders, QA, documents, billing, claims, EVV, patient portal, referral intake, analytics. | Critical | MVP |
| Certification intent | Decide whether ONC certification is mandatory, future option, or out-of-scope. | Critical | MVP |
| Regulatory mapping | Map product requirements to HIPAA, CMS home health, Conditions of Participation, ACHC readiness, California operational needs, and payer requirements. | Critical | MVP |
| Requirements repository | Maintain controlled requirements docs, ADRs, data-flow diagrams, risk register, traceability matrix, and acceptance tests. | Critical | MVP |
| Change control | Define how clinical, compliance, and engineering changes are approved and versioned. | Critical | MVP |
| Clinical safety governance | Create a process for clinical review of workflows, alerts, documentation, orders, and patient-safety risks. | Critical | MVP |
| Data ownership rules | Define legal record ownership, amendment process, retention, export, deletion, and litigation hold behavior. | Critical | MVP |

## 1.2 Core Architecture

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Modular architecture | Separate frontend, backend domain services, interoperability layer, terminology service, CDS service, analytics, audit, and platform services. | Critical | MVP |
| System of record | Establish a transactional clinical database as the authoritative legal record. | Critical | MVP |
| API gateway | Route traffic, enforce auth, rate limits, logging, versioning, and service boundaries. | Critical | MVP |
| Backend domain services | Patient, episode/admission, encounter/visit, clinical note, orders, meds, diagnoses, allergies, care plan, documents, signatures, tasks. | Critical | MVP |
| Event bus / queue | Durable eventing for integration retries, exports, document generation, notifications, audit fan-out, and background jobs. | Critical | MVP |
| Object storage | Secure storage for PDFs, images, attachments, signed packets, scanned documents, and export archives. | Critical | MVP |
| Search/indexing | Patient search, chart search, document search, task search, and audit search. | High | MVP/V1 |
| Reporting model | Separate analytics/reporting store from the transactional record. | High | V1 |
| Environment strategy | Local, dev, staging, UAT, production, and DR environments with controlled promotion. | Critical | MVP |
| Infrastructure as Code | Terraform/Pulumi/CloudFormation or equivalent for repeatable infrastructure. | Critical | MVP |

## 1.3 Frontend / UI Platform

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Design system | Reusable components for clinical forms, tables, alerts, cards, modals, timeline, notes, signatures, and audit displays. | Critical | MVP |
| Role-aware navigation | Different navigation by clinician, QA, admin, scheduler, billing, physician, and executive user. | Critical | MVP |
| Patient search | Fast, safe lookup by name, DOB, MRN, phone, address, payer, episode, status. | Critical | MVP |
| Patient chart shell | Persistent patient header, alerts, demographics, status, episode, discipline, payer, physician, and action bar. | Critical | MVP |
| Clinical workspace | Visits, orders, meds, diagnoses, care plan, documents, tasks, communication, QA, and audit tabs. | Critical | MVP |
| Form engine | Dynamic clinical forms with validation, required fields, conditional logic, autosave, signatures, locked states, and versioning. | Critical | MVP |
| Offline/field readiness | For home health, assess offline drafts, conflict handling, mobile-first forms, and low-bandwidth behavior. | High | V1 |
| Accessibility | WCAG 2.2 AA target, keyboard support, focus order, color contrast, clear errors, screen-reader semantics. | High | MVP/V1 |
| Responsive design | Desktop, tablet, and field mobile layouts. | High | MVP/V1 |
| Error prevention | Guardrails for wrong-patient actions, duplicate documentation, unsigned orders, and incomplete notes. | Critical | MVP |

## 1.4 Backend Core Clinical Components

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Patient master | Demographics, identifiers, contacts, emergency contacts, representatives, language, communication preferences. | Critical | MVP |
| Episode/admission model | Referral, intake, admission, certification periods, episode status, discharge, transfer, readmission. | Critical | MVP |
| Encounter/visit model | Scheduled visit, completed visit, missed visit, documentation, clinician, discipline, time-in/time-out, location. | Critical | MVP |
| Clinical note service | Note drafts, final notes, amendments, addenda, countersignatures, QA states, version history. | Critical | MVP |
| Problem/diagnosis list | ICD-10 coding, active/inactive state, onset/resolution dates, primary/secondary diagnosis. | Critical | MVP |
| Allergy list | Substance, reaction, severity, status, source, last reviewed. | Critical | MVP |
| Medication list | Medication reconciliation, active meds, discontinued meds, dose, route, frequency, start/stop, interactions integration if used. | Critical | MVP |
| Orders service | Physician orders, verbal orders, plan of care orders, order status, signature tracking, order changes. | Critical | MVP |
| Care plan service | Goals, interventions, disciplines, frequencies, problems, outcomes, review history. | Critical | MVP |
| Document service | Upload, generate, view, sign, lock, archive, export, and audit documents. | Critical | MVP |
| Task/work queue | Clinical, QA, order, signature, intake, scheduling, billing, and compliance tasks. | Critical | MVP |
| Notification service | In-app alerts, email/SMS if permitted, escalation rules, overdue tasks. | High | MVP/V1 |
| Comment/communication log | Internal patient-specific communication, phone calls, coordination notes, handoffs. | High | MVP/V1 |
| Audit service | Immutable access, read, write, print, export, sign, delete, and admin action logs. | Critical | MVP |

---

# 2. Critical Compliance, Security, and Privacy

## 2.1 HIPAA Security Baseline

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Security risk analysis | Formal HIPAA security risk analysis before production and recurring thereafter. | Critical | MVP |
| Administrative safeguards | Policies for access, workforce clearance, incident response, contingency planning, vendor management. | Critical | MVP |
| Technical safeguards | Access control, unique users, emergency access, auto-logoff, encryption, audit controls, integrity controls. | Critical | MVP |
| Physical safeguards | Workstation/device rules, facility access assumptions, cloud/on-prem responsibility matrix. | Critical | MVP |
| Minimum necessary | Role-based data exposure and workflows limiting unnecessary PHI access. | Critical | MVP |
| Breach response | Incident classification, investigation, notification workflows, evidence preservation. | Critical | MVP |
| Vendor/subprocessor inventory | Hosting, AI, analytics, email, SMS, storage, monitoring, support vendors and BAA status. | Critical | MVP |

## 2.2 Identity and Access Management

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| SSO | Enterprise SSO with OIDC/SAML. | Critical | MVP |
| MFA | MFA for workforce users; stronger controls for privileged users. | Critical | MVP |
| RBAC | Role-based access by job function, discipline, department, location, and patient assignment. | Critical | MVP |
| ABAC | Attribute-based rules for assigned patients, county, branch, episode, employment status, and emergency access. | High | V1 |
| Emergency access | Break-glass workflow with reason capture, alerts, and audit review. | Critical | MVP |
| Session management | Timeout, refresh, revocation, device trust, concurrent session rules. | Critical | MVP |
| Service identities | Managed service accounts, scoped permissions, secret rotation. | Critical | MVP |
| Privileged access | Separate admin accounts, just-in-time access, approval logs, admin audit review. | Critical | MVP |

## 2.3 Encryption, Secrets, and Key Management

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| TLS everywhere | TLS for all web, API, internal service, database, and integration traffic. | Critical | MVP |
| Encryption at rest | Database, backups, object storage, logs, queues, caches. | Critical | MVP |
| KMS/HSM | Managed key service, key rotation, access policies, key usage logs. | Critical | MVP |
| Secrets manager | No secrets in code or logs; rotate API keys, certs, and credentials. | Critical | MVP |
| PHI export controls | Encrypted exports, expiration, access logging, download restrictions. | Critical | MVP |
| Device/local storage rules | Mobile/browser storage restrictions for PHI. | High | MVP/V1 |

## 2.4 Audit, Logging, and Monitoring

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| User audit log | Login, logout, failed login, patient access, view, edit, sign, print, export. | Critical | MVP |
| Data-change audit | Before/after or structured change record for legal chart elements. | Critical | MVP |
| Admin audit | User creation, role changes, permission grants, system config changes. | Critical | MVP |
| Integration audit | Inbound/outbound messages, ACKs, retries, failures, transformations. | Critical | MVP |
| Immutable retention | Append-only or tamper-evident storage for high-risk logs. | High | MVP/V1 |
| SIEM integration | Centralized monitoring, alerts, correlation, incident triage. | High | V1/Ongoing |
| Audit review workflow | Compliance users can review suspicious access and export evidence. | High | V1 |

## 2.5 Backup, Disaster Recovery, and Business Continuity

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| RPO/RTO | Define recovery point and recovery time objectives. | Critical | MVP |
| Automated backups | Database, object storage, configuration, secrets metadata, audit logs. | Critical | MVP |
| Restore testing | Regular restore drills, not just backup creation. | Critical | MVP |
| DR environment | Failover region or recovery environment depending on hosting model. | Critical | MVP/V1 |
| Offline copies | Ransomware-resistant or immutable backup strategy. | Critical | MVP |
| Downtime procedure | Clinical downtime forms, read-only emergency access, recovery reconciliation. | Critical | MVP/V1 |
| Runbooks | Incident, restore, failover, rollback, communications. | Critical | MVP |

---

# 3. High-Priority Interoperability and Standards

## 3.1 FHIR / SMART on FHIR / USCDI

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| FHIR R4 API | Expose core clinical resources using FHIR R4-compatible APIs. | High | V1 |
| US Core alignment | Map internal data to US Core profiles where applicable. | High | V1 |
| USCDI mapping | Maintain USCDI data class/element traceability. | High | V1 |
| SMART App Launch | OAuth/OIDC launch flow for third-party apps. | High | V1 |
| Patient access API | Patient-facing API support if certification or market requires it. | High | V1 |
| Population export | Bulk-style export strategy for reporting, migration, and EHI export. | High | V1 |
| FHIR validation | Profile validation, capability statement, conformance testing. | High | V1 |
| App registration | Third-party app registration, client IDs, scopes, revocation. | High | V1 |

## 3.2 HL7 v2 Interfaces

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Integration engine | HL7 v2 routing, transformation, ACK/NACK handling, retries, monitoring. | Critical | MVP |
| ADT support | Patient/admission/discharge/transfer feeds if interfacing with external systems. | High | V1 |
| Orders | Lab/order interfaces where applicable. | High | V1 |
| Results | Lab/result ingestion, abnormal flags, result review, routing. | Critical | MVP/V1 |
| Interface specs | Per-partner mapping documents and test scripts. | Critical | MVP/V1 |
| Message replay | Safe replay, error queue, correction workflow. | High | V1 |

## 3.3 C-CDA / CCD / Document Exchange

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| C-CDA generation | Generate CCD/summary documents for transitions and record sharing. | High | V1 |
| C-CDA parsing | Ingest external summaries into reviewable structured/staged data. | High | V1 |
| Document viewer | Human-readable display with provenance and source. | High | MVP/V1 |
| Reconciliation workflow | Compare imported meds, problems, allergies, diagnoses before chart acceptance. | High | V1 |

## 3.4 HIE, Direct, TEFCA

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| HIE strategy | Decide state/regional HIE participation, query/retrieve, push, consent requirements. | High | V1 |
| Direct messaging | Secure provider-to-provider document exchange. | High | V1 |
| TEFCA strategy | Decide whether to connect through QHIN/participant/vendor route. | Strategic | V1/Ongoing |
| Provider directory | Maintain external providers, addresses, Direct addresses, NPI, facilities. | High | V1 |

## 3.5 Terminology Services

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| SNOMED CT | Clinical concepts where needed. | High | V1 |
| LOINC | Labs, observations, assessment questions where applicable. | High | V1 |
| RxNorm | Medication normalization. | High | V1 |
| ICD-10-CM | Diagnoses and billing support. | Critical | MVP |
| CPT/HCPCS | Billing/procedure support if claims are in scope. | High | V1 |
| VSAC/UMLS | Value set management for quality measures and reporting. | High | V1 |
| Terminology server | Code validation, mappings, expansion, versioning, and updates. | High | V1 |
| Licensing inventory | Track license/access obligations for each terminology source. | Critical | MVP/V1 |

## 3.6 Pharmacy / E-Prescribing

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Medication database | Drug names, strengths, forms, routes, interactions if licensed. | High | V1 |
| NCPDP SCRIPT | E-prescribing, renewal, cancellation, medication history where in scope. | High | V1 |
| EPCS | Controlled substance prescribing if in scope, with stronger identity requirements. | Conditional Critical | V1 |
| Prior authorization | Electronic prior auth if product scope requires it. | Strategic | V1/Ongoing |
| Pharmacy directory | Pharmacy search, preferred pharmacy, routing. | High | V1 |

## 3.7 Imaging / DICOM

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| DICOM/DICOMweb | Imaging object access if imaging is in scope. | Conditional High | V1 |
| Viewer integration | Diagnostic image viewer or external viewer launch. | Conditional High | V1 |
| Report linkage | Link imaging reports to orders/results and documents. | Conditional High | V1 |
| Storage policy | Decide native storage vs external PACS/VNA integration. | Conditional High | V1 |

---

# 4. Home Health-Specific Inventory

This is the area that must be expanded before engineering starts. For Care Indeed, this is not optional; it is what differentiates the EHR from a generic ambulatory chart.

## 4.1 Intake and Referral

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Referral intake | Referral source, diagnosis, payer, physician, requested services, documents. | Critical | MVP |
| Eligibility checks | Payer/coverage checks if billing scope requires it. | High | V1 |
| Document intake | Upload referral packet, face sheet, H&P, discharge summary, orders. | Critical | MVP |
| Intake work queue | Pending referrals, missing info, accepted/declined, assigned owner. | Critical | MVP |
| Referral conversion | Convert referral to patient/admission/episode without duplicate entry. | Critical | MVP |

## 4.2 Admission / Start of Care

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Admission packet | Consent, rights, financial responsibility, HIPAA notice, emergency plan, service agreements. | Critical | MVP |
| SOC workflow | Start of Care visit, required documentation, signatures, QA review. | Critical | MVP |
| OASIS support | OASIS data collection, validation, export/submission workflow if Medicare-certified home health scope. | Critical | MVP/V1 |
| Plan of care | 485-style plan of care, problems, goals, interventions, frequencies. | Critical | MVP |
| Physician certification | Certifying physician, face-to-face, eligibility, signature tracking. | Critical | MVP |
| Caregiver/representative | Responsible party, legal representative, contact permissions. | Critical | MVP |
| Home safety | Environment, emergency preparedness, infection control, risks. | High | MVP |

## 4.3 Scheduling and Field Visits

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Visit scheduling | Discipline, frequency, assigned clinician, due windows, missed visits. | Critical | MVP |
| Clinician route/day view | Field-friendly daily schedule and patient context. | High | MVP/V1 |
| Visit documentation | Skilled nursing, therapy, HHA, MSW, supervisory, discharge, recertification notes. | Critical | MVP |
| EVV | Electronic visit verification if required by payer/state/service line. | Conditional Critical | V1 |
| Missed visit workflow | Reason, physician/patient notification, reschedule, QA visibility. | Critical | MVP |
| Time and mileage | Optional depending on payroll/ops integration. | Medium | V1 |

## 4.4 Orders and Physician Signatures

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Physician order management | Verbal orders, new orders, changed orders, plan-of-care orders. | Critical | MVP |
| Signature routing | Send, track, remind, receive, file signed orders. | Critical | MVP |
| Order status | Draft, sent, pending signature, signed, rejected, superseded, archived. | Critical | MVP |
| Order audit | Who created, who sent, who signed, timestamps, versions. | Critical | MVP |
| Physician portal or e-sign | Decide external physician access model or integration. | High | V1 |

## 4.5 QA / Compliance Review

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| QA queues | SOC QA, recert QA, discharge QA, order QA, visit-note QA, OASIS QA. | Critical | MVP |
| Deficiency tracking | Missing signatures, incomplete forms, late notes, inconsistent frequencies. | Critical | MVP |
| Locking rules | Finalized notes and signed documents become locked with addendum workflow. | Critical | MVP |
| Survey evidence | Generate evidence packets for ACHC/CMS survey readiness. | High | V1 |
| Compliance dashboard | Deficiencies, overdue orders, unsigned notes, OASIS status, patient risk. | High | MVP/V1 |

## 4.6 Billing / Claims Boundary

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Billing scope decision | Decide whether to build billing/claims or integrate with external RCM. | Critical | MVP |
| Payer setup | Payer rules, authorizations, service codes, eligibility. | High | V1 |
| Claims | 837/835 support if building RCM. | Conditional High | V1/Ongoing |
| Authorization tracking | Units/visits approved, expiration, over-utilization warnings. | High | V1 |
| Visit-to-billing rules | Connect completed visits to billable events. | High | V1 |

---

# 5. Certification and External Assurance Inventory

## 5.1 ONC Health IT Certification

ONC certification is not legally required for every internal EHR build, but it is often commercially important in the U.S. provider market. If Care Indeed is building an internal-only EHR, certification may be a later strategic choice. If the product will be sold or positioned as a general EHR, plan for certification earlier.

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Certification scope decision | Decide which ONC criteria apply to the product/modules. | High | MVP/V1 |
| Certification traceability matrix | Map criteria to features, tests, and evidence. | High | V1 |
| ONC test method readiness | Prepare evidence for applicable criteria. | High | V1 |
| API certification readiness | SMART/FHIR/API behavior and testing. | High | V1 |
| EHI export | Single-patient and population export capability. | High | V1 |
| DSI/CDS transparency | Decision-support governance, source, logic, intervention transparency. | High | V1 |
| Safety-enhanced design | Usability and safety testing evidence. | High | V1 |
| Real-world testing | Post-certification testing and reporting if certified. | Strategic | Ongoing |
| Maintenance of certification | Monitor changing standards, deadlines, surveillance. | Strategic | Ongoing |

## 5.2 Privacy/Security/Trust Certifications

| Certification / Framework | Required? | Why It Matters | Phase |
|---|---:|---|---|
| HIPAA compliance | Yes if handling ePHI as covered entity/business associate | Legal/security baseline. | MVP |
| SOC 2 Type I/II | Optional but commercially useful | Enterprise buyer trust; security/availability/confidentiality controls. | Ongoing |
| ISO 27001 | Optional | Formal information security management system. | Ongoing |
| HITRUST e1/i1/r2 | Optional but healthcare-relevant | Healthcare vendor assurance and procurement support. | Ongoing |
| WCAG 2.2 AA | Strongly recommended | Accessibility, usability, procurement, risk reduction. | MVP/V1 |
| NIST SSDF alignment | Strongly recommended | Secure software development discipline. | MVP |
| NIST CSF alignment | Recommended | Security program maturity. | Ongoing |

---

# 6. Legal, Contracting, and Vendor Inventory

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Master services agreement | Commercial/legal terms for customers if product is external. | High | V1 |
| SaaS terms | User/customer responsibilities, acceptable use, limits. | High | V1 |
| Business Associate Agreement | Required for ePHI handling with covered entities/business associates. | Critical | MVP |
| Subprocessor BAAs | Hosting, monitoring, AI, analytics, support vendors. | Critical | MVP |
| Data Processing Agreement | Required if GDPR/processor obligations apply. | Conditional High | V1 |
| SLA | Uptime, support windows, response time, severity definitions. | High | V1 |
| Privacy notice | Patient/user-facing privacy posture where applicable. | High | MVP/V1 |
| Incident notification terms | Timelines, roles, evidence, cooperation obligations. | Critical | MVP |
| Data return/deletion | Offboarding, export, retention, litigation hold. | Critical | MVP/V1 |
| Open-source license inventory | Track OSS dependencies and obligations. | High | MVP |
| Clinical content licenses | Drug DB, terminology, assessment tools, quality measures, copyrighted forms. | High | MVP/V1 |

---

# 7. Engineering Platform and DevOps Inventory

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Source control | GitHub repo, branch strategy, CODEOWNERS, protected branches. | Critical | MVP |
| CI/CD | Build, test, scan, deploy, rollback. | Critical | MVP |
| IaC | Versioned infrastructure definitions. | Critical | MVP |
| Secrets scanning | Prevent secret leakage. | Critical | MVP |
| Dependency scanning | SCA, SBOM, vulnerability remediation. | Critical | MVP |
| SAST/DAST | Static/dynamic security testing. | High | MVP/V1 |
| Container security | Image scanning, minimal images, signed artifacts. | High | MVP/V1 |
| Release management | Release notes, approvals, migration plan, rollback plan. | Critical | MVP |
| Observability | Metrics, logs, traces, dashboards, alerts. | Critical | MVP |
| Performance testing | Load, concurrency, export, form autosave, search, reporting. | High | MVP/V1 |
| Feature flags | Safe rollout, tenant/user targeting, rollback. | High | V1 |
| Configuration management | Environment-specific config, no hardcoded PHI/secrets. | Critical | MVP |

---

# 8. Data Architecture and Migration Inventory

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Canonical data model | Internal normalized model separate from external standards. | Critical | MVP |
| Data dictionary | Field definitions, validation, ownership, PHI classification. | Critical | MVP |
| Master patient index | Duplicate detection, merge/unmerge, identifiers. | High | V1 |
| Provenance | Source, author, time, device/system, import path. | Critical | MVP |
| Versioning | Record versions, amendments, addenda, superseded orders/documents. | Critical | MVP |
| Data retention | Retention by record type and jurisdiction. | Critical | MVP |
| Migration tooling | ETL, mapping, validation, reconciliation, rollback. | High | V1 |
| Archive strategy | Historical records, scanned docs, legacy exports. | High | V1 |
| De-identification | Analytics/test data generation without PHI. | High | MVP/V1 |
| Data quality checks | Completeness, duplicates, invalid codes, missing signatures. | High | MVP/V1 |

---

# 9. Clinical Decision Support and AI Inventory

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Rule engine | Deterministic alerts, reminders, required-field logic, contraindications. | High | MVP/V1 |
| CDS governance | Clinical approval, versioning, override reasons, monitoring. | High | V1 |
| CDS Hooks | Standards-based CDS integration points if external apps/rules are used. | Strategic | V1 |
| CQL | Computable clinical logic for measures/rules where useful. | Strategic | V1 |
| Alert fatigue management | Severity, suppression, override tracking, review. | High | V1 |
| AI policy | Define where AI can and cannot touch PHI/clinical decision-making. | Critical | MVP |
| AI BAA review | Confirm AI vendors/services are covered under BAA if PHI is processed. | Critical | MVP |
| Human review | AI-generated summaries, notes, codes, and suggestions require clear human acceptance. | Critical | MVP/V1 |
| Model monitoring | Accuracy, drift, bias, incident handling for predictive models. | Strategic | Ongoing |
| Prompt/audit logs | Log AI-assisted actions without leaking unnecessary PHI. | High | V1 |

---

# 10. QA, Validation, and Testing Inventory

| Item | Requirement | Importance | Phase |
|---|---|---:|---|
| Unit tests | Domain logic, validations, permissions, exports. | Critical | MVP |
| Integration tests | Database, API, queues, storage, identity, integrations. | Critical | MVP |
| End-to-end tests | Critical workflows: intake, SOC, visit note, order, signature, QA, discharge. | Critical | MVP |
| Security tests | Authz negative tests, injection, session, audit, export controls. | Critical | MVP |
| Accessibility tests | Automated and manual WCAG checks. | High | MVP/V1 |
| Usability testing | Clinician task testing, safety review, field mobile tests. | High | MVP/V1 |
| Conformance testing | FHIR, SMART, HL7, C-CDA, certification tools where applicable. | High | V1 |
| Performance tests | Concurrent users, autosave, search, exports, reports, large charts. | High | MVP/V1 |
| DR tests | Backup restore, failover, downtime recovery. | Critical | MVP/V1 |
| Migration validation | Record counts, mapping validation, clinician signoff. | High | V1 |
| Release evidence | Test results, approvals, known issues, rollback plan. | Critical | MVP |

---

# 11. UI/UX Pageview Inventory for Starting Design

Start UI/UX in this sequence.

## 11.1 Global / Platform Views

| Pageview | Priority |
|---|---:|
| Login / SSO / MFA | Critical |
| Forgot password / account recovery | High |
| User profile and preferences | High |
| Global dashboard | Critical |
| Global search | Critical |
| Notifications center | High |
| Task inbox / work queue | Critical |
| Audit/access history | Critical |
| Help/support | Medium |

## 11.2 Patient Chart Views

| Pageview | Priority |
|---|---:|
| Patient list | Critical |
| Patient chart summary | Critical |
| Demographics | Critical |
| Contacts/representatives | Critical |
| Episodes/admissions | Critical |
| Diagnoses/problems | Critical |
| Allergies | Critical |
| Medications | Critical |
| Care plan | Critical |
| Orders | Critical |
| Visit history | Critical |
| Notes | Critical |
| Documents | Critical |
| Signatures | Critical |
| Communication log | High |
| QA deficiencies | Critical |
| Audit trail | Critical |

## 11.3 Home Health Workflow Views

| Pageview | Priority |
|---|---:|
| Referral intake queue | Critical |
| Referral detail | Critical |
| Admission/SOC workspace | Critical |
| OASIS workspace | Critical if Medicare HH |
| Plan of care builder | Critical |
| Visit scheduler | Critical |
| Clinician daily route | High |
| Skilled nursing visit note | Critical |
| Therapy visit note | Critical |
| HHA visit note | High |
| Wound documentation | High |
| Medication reconciliation | Critical |
| Physician order creation | Critical |
| Physician signature tracking | Critical |
| QA review queue | Critical |
| Discharge/transfer workflow | Critical |
| Recertification workflow | Critical |

## 11.4 Admin / Compliance Views

| Pageview | Priority |
|---|---:|
| User management | Critical |
| Roles and permissions | Critical |
| Branch/location setup | High |
| Payer setup | High |
| Physician/provider directory | High |
| Forms/templates admin | Critical |
| Clinical rules/admin | High |
| Audit log explorer | Critical |
| Security dashboard | High |
| Backup/DR status | High |
| Interface monitor | High |
| Report builder | Medium/High |
| Compliance dashboard | Critical |

---

# 12. Recommended Phasing

## MVP — Non-Negotiable

The MVP should include:

- Secure login, SSO/MFA-ready identity, RBAC, and audit trails.
- Core patient chart and admission/episode model.
- Intake/referral workflow.
- Patient demographics, contacts, diagnoses, allergies, meds, care plan.
- Visit scheduling and core visit documentation.
- Orders and signature tracking.
- Document upload/generation/viewing/signing/locking.
- QA queues and deficiency tracking.
- Core reporting dashboard.
- Transactional database, object storage, backups, DR runbooks.
- CI/CD, test automation, logging, observability, security scanning.
- HIPAA risk analysis and BAA/subprocessor inventory.
- Initial interface architecture and integration engine plan.

## V1 — Certification/Interoperability-Ready

V1 should add:

- FHIR R4 / US Core / USCDI mapping.
- SMART on FHIR.
- EHI export.
- C-CDA generation/parsing.
- HL7 v2 lab/order/result interfaces.
- Terminology server with SNOMED CT, LOINC, RxNorm, ICD-10, VSAC/UMLS.
- OASIS completeness/submission workflow if required.
- Physician portal or electronic signature workflow.
- HIE/Direct/TEFCA strategy.
- eRx/NCPDP if prescribing is in scope.
- Stronger analytics and quality reporting.
- Usability/accessibility evidence and certification traceability matrix.

## Ongoing Maturity

Ongoing work should include:

- ONC maintenance of certification if certified.
- Real-world testing and surveillance response.
- SOC 2 / ISO 27001 / HITRUST if commercially useful.
- SIEM/SOC operations.
- Penetration testing and vulnerability management.
- DR drills and restore validation.
- Cost optimization.
- Clinical safety review board.
- AI governance and monitoring if AI is used.
- Continuous interoperability partner onboarding.

---

# 13. Open Decisions Before Engineering Build

These do not block UI/UX, but they do block a final engineering specification.

1. Is this EHR internal-only for Care Indeed, or intended to become a sellable product?
2. Is ONC certification a firm requirement, future option, or not needed?
3. Is Medicare-certified home health the first exact scope?
4. Is OASIS required in MVP or V1?
5. Will billing/claims be built or integrated?
6. Will EVV be built or integrated?
7. Will e-prescribing be in scope?
8. Which systems must integrate first: Kinnser/WellSky, labs, clearinghouse, HIE, Google Workspace, payroll, accounting, identity provider?
9. What is the cloud target: Google Cloud, AWS, Azure, hybrid, or on-prem?
10. Will AI process PHI, and under which BAA-covered services?
11. What are RPO/RTO targets?
12. What records must be migrated from legacy systems?
13. What is the minimum viable clinical workflow for the first live pilot?

---

# 14. Confidence Assessment

| Area | Confidence | Notes |
|---|---:|---|
| General EHR technical inventory | 90% | Strong enough for architecture and UI/UX start. |
| HIPAA/security/control inventory | 90% | Still needs org-specific risk analysis. |
| ONC/certification inventory | 80% | Must be mapped to selected certification criteria if certification is pursued. |
| Home health workflow inventory | 75% | Good baseline, but must be expanded into detailed Care Indeed requirements. |
| UI/UX starting inventory | 90% | Complete enough to begin IA, wireframes, and prototypes. |
| Final engineering completeness | 65% | Needs detailed requirements, acceptance tests, integration targets, and data model decisions. |

Bottom line: **Start UI/UX now. Do not start full engineering implementation until the Care Indeed-specific requirements and technical architecture are locked.**

---

# 15. Source Categories to Preserve for Formal Requirements

For the formal requirements package, preserve authoritative references from these source families:

- ONC Health IT Certification Program and 45 CFR Part 170 criteria.
- ONC HTI-1 / HTI regulatory updates.
- USCDI and US Core implementation guides.
- HL7 FHIR R4, SMART App Launch, Bulk Data Access.
- HL7 v2 lab/order/result implementation guides.
- C-CDA / CCD implementation guides.
- HHS HIPAA Security Rule and Security Risk Assessment guidance.
- NIST SSDF, Digital Identity, logging, contingency planning, patch management, mobile/BYOD guidance.
- SNOMED CT, LOINC, RxNorm, VSAC, UMLS documentation and licensing.
- CMS home health, OASIS, Conditions of Participation, and payer-specific requirements.
- WCAG 2.2 accessibility standard.
- SOC 2, ISO 27001, HITRUST framework documentation if external assurance is pursued.
