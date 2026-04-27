# 08 — Data Model

## Purpose

Define the canonical objects, fields, and relationships for the onboarding compliance engine. This is the contract used by the engine, CES, eCIgn, Audit Mode, and the UI.

All IDs are ULIDs unless noted. All timestamps are UTC. All artifacts are content-hashed (SHA-256). All mutable specifications are versioned.

---

## 1. Object Map (high level)

```
WorkforceMember ──┐
                  ├── OnboardingProfile ──┐
Vendor ───────────┘                       │
                                          │
RoleRequirement (catalog)                 │
        │                                 │
        ▼                                 ▼
OnboardingTemplate (versioned) ──► OnboardingExecutionBatch ──► OnboardingExecutionUnit
                                          │                           │
                                          │                           ├── EvidenceObject
                                          │                           ├── SignatureRecord (eCIgn)
                                          │                           └── OnboardingAuditEvent
                                          │
                                          └── readiness contribution → CES Audit Readiness Score
```

---

## 2. Subject Objects

### 2.1 WorkforceMember
| Field | Type | Notes |
|-------|------|-------|
| id | ULID | PK |
| legal_name | string | |
| preferred_name | string | |
| dob | date | encrypted |
| ssn_last4 | string | encrypted |
| email | string | unique |
| phone | string | |
| hire_date | date | |
| status | enum | Prospect, Active, OnLeave, Terminated, Withdrawn |
| primary_role_id | FK Role | |
| roles | [FK Role] | many |
| branch_id | FK Branch | |
| supervisor_id | FK WorkforceMember | nullable |
| created_at, updated_at | timestamp | |

### 2.2 Vendor
| Field | Type | Notes |
|-------|------|-------|
| id | ULID | PK |
| legal_name | string | |
| tax_id | string | encrypted |
| vendor_type | enum | BA, NonBA, Contractor |
| status | enum | Pending, Active, Suspended, Terminated |
| primary_contact | json | |
| created_at, updated_at | timestamp | |

### 2.3 Role
| Field | Type | Notes |
|-------|------|-------|
| id | string | e.g., `RN`, `HHA`, `ADMIN` |
| name | string | |
| domain | enum | EN, CL, OP, FN, RM, CO, IT, QA, HR |
| description | text | |
| active | bool | |

---

## 3. Requirement Catalog

### 3.1 RoleRequirement
| Field | Type | Notes |
|-------|------|-------|
| id | string | e.g., `REQ-RN-LICENSE-PSV` |
| role_ids | [Role] | applicable roles |
| name | string | |
| description | text | |
| policy_refs | [PolicyVersionRef] | governing policies |
| workflow_id | FK Workflow | required workflow |
| form_ids | [FK Form] | forms used |
| evidence_schema | json | required evidence object types + fields |
| signature_specs | [SignatureSpec] | who must sign, what, how |
| training_refs | [TrainingRef] | optional training prerequisites |
| competency_ref | FK Competency | optional |
| cadence | Cadence | initial + recurring |
| sla | json | per-window SLA + escalation policy |
| pre_conditions | json | required prior requirements |
| gate_contributions | [Gate] | which gates this requirement contributes to |
| version | int | |
| effective_from / effective_to | timestamp | |

### 3.2 PolicyVersionRef
| Field | Type | Notes |
|-------|------|-------|
| policy_id | string | |
| policy_version | string | semantic |
| content_hash | string | SHA-256 of canonical render |

### 3.3 SignatureSpec
| Field | Type | Notes |
|-------|------|-------|
| signer_role | enum | Subject, Supervisor, ClinicalManager, ComplianceOfficer, Administrator, Vendor, Custom |
| count | int | for multi-sig |
| order | enum | Sequential, Parallel |
| binds_to | enum | PolicyVersion, EvidenceObject, Appointment |
| ecign_template_id | string | |

### 3.4 Cadence
| Field | Type | Notes |
|-------|------|-------|
| initial | bool | required at activation |
| recurrence | json | RRULE-style or windowed |
| pre_expiry_window | duration | for credential-style |

### 3.5 Gate
| Field | Type | Notes |
|-------|------|-------|
| gate_id | enum | FieldClearance, BillingClearance, SystemAccessClearance, PolicyCompliance, VendorEngagement, GovernanceActive |
| weight | enum | Required, Conditional |

### 3.6 Competency
| Field | Type | Notes |
|-------|------|-------|
| id | string | e.g., `COMP-HHA-12` |
| name | string | |
| skills | [Skill] | structured |
| observer_role | enum | RN, CM, etc. |
| pass_criteria | json | |
| revalidation_period | duration | |
| version | int | |

### 3.7 Skill
| Field | Type | Notes |
|-------|------|-------|
| id | string | |
| name | string | |
| evaluation_type | enum | Observed, Demonstrated, Simulated, KnowledgeCheck |
| pass_threshold | json | |

### 3.8 PolicyAcknowledgmentRequirement (specialization of RoleRequirement)
| Field | Type | Notes |
|-------|------|-------|
| policy_id | string | |
| min_policy_version | string | |
| stale_on_republish | bool | true → re-ack required on new version |
| ack_language | text | rendered with form |

### 3.9 EvidenceRequirement (embedded in `evidence_schema`)
| Field | Type | Notes |
|-------|------|-------|
| object_type | enum | TrainingRecord, FormSubmission, FileUpload, ExternalSystemRecord, ScreeningResult, PSVResult, CompetencyArtifact |
| required_fields | [string] | |
| validation_rules | json | |

---

## 4. Profile, Template, Batch, Unit

### 4.1 OnboardingProfile
| Field | Type | Notes |
|-------|------|-------|
| id | ULID | PK |
| subject_id | ULID | FK WorkforceMember or Vendor |
| subject_type | enum | Workforce, Vendor |
| roles | [Role] | |
| domains | [Domain] | derived |
| service_lines | [ServiceLine] | |
| patient_populations | [Population] | |
| supervisor_id | ULID | nullable |
| branch_id | ULID | |
| effective_date | date | |
| prior_profile_id | ULID | for role-change diff |
| created_at | timestamp | |

### 4.2 OnboardingTemplate
| Field | Type | Notes |
|-------|------|-------|
| id | string | e.g., `TPL-RN-NEW-HIRE` |
| version | int | |
| effective_from / effective_to | timestamp | |
| role_id | string | |
| trigger_type | enum | NEW_HIRE, ROLE_CHANGE, REACTIVATION, ANNUAL_REVALIDATION, CREDENTIAL_EXPIRY_WINDOW, POLICY_VERSION_CHANGE, SCOPE_EXPANSION, VENDOR_ONBOARD, GOVERNANCE_APPOINTMENT |
| requirement_ids | [RoleRequirement] | ordered |
| pre_conditions | json | |
| post_conditions | json | |
| escalation_policy_id | string | |
| policy_version_refs | [PolicyVersionRef] | snapshot at publish time |
| immutable | bool | always true once published |

### 4.3 OnboardingExecutionBatch
| Field | Type | Notes |
|-------|------|-------|
| id | ULID | PK |
| subject_id | ULID | |
| profile_id | ULID | |
| template_id | string | |
| template_version | int | |
| trigger_type | enum | |
| trigger_payload | json | |
| owner_id | ULID | Compliance Officer or delegate |
| created_at | timestamp | |
| due_at | timestamp | |
| status | enum | PendingActivation, InProgress, AtRisk, Blocked, AwaitingSignature, AwaitingEvidence, Completed, Withdrawn, RevalidationDue |
| readiness_contribution | float | computed |
| ces_sprint_ids | [ULID] | linkage |
| dossier_snapshot_id | ULID | on completion |
| sealed_at | timestamp | nullable |

### 4.4 OnboardingExecutionUnit
| Field | Type | Notes |
|-------|------|-------|
| id | ULID | PK |
| batch_id | ULID | FK |
| requirement_id | string | FK RoleRequirement |
| workflow_id | string | FK Workflow |
| workflow_version | int | |
| assignee_id | ULID | resolved by CES Assignment Model |
| due_at | timestamp | |
| sla | json | |
| priority | enum | Low, Normal, High, Critical |
| dependencies | [ULID] | other unit IDs |
| evidence_required | [EvidenceRequirement] | |
| signature_required | [SignatureSpec] | |
| status | enum | NotStarted, InProgress, Blocked, AtRisk, AwaitingSignature, AwaitingEvidence, Completed, Failed, Suppressed |
| attempts | [Attempt] | |
| evidence_object_ids | [ULID] | on capture |
| signature_record_ids | [ULID] | on capture |
| audit_event_ids | [ULID] | append-only |
| started_at, completed_at | timestamp | nullable |

### 4.5 Attempt
| Field | Type | Notes |
|-------|------|-------|
| index | int | 1-based |
| started_at, ended_at | timestamp | |
| outcome | enum | Pass, Fail, Withdrawn |
| reason | text | |

---

## 5. Evidence and Signature

### 5.1 EvidenceObject
| Field | Type | Notes |
|-------|------|-------|
| id | ULID | PK |
| unit_id | ULID | FK |
| batch_id | ULID | FK |
| subject_id | ULID | |
| object_type | enum | per EvidenceRequirement.object_type |
| source | enum | UserUpload, FormSubmission, ExternalAPI, SystemAttestation |
| source_ref | string | external ID |
| policy_version_ref | PolicyVersionRef | nullable |
| storage_uri | string | |
| content_hash | string | SHA-256 |
| schema_validation | json | result |
| content_validation | json | result |
| created_by | ULID | |
| created_at | timestamp | |
| status | enum | Pending, Valid, Rejected, Superseded |
| rejection_reason | text | nullable |

### 5.2 SignatureRecord (eCIgn)
| Field | Type | Notes |
|-------|------|-------|
| id | ULID | PK |
| unit_id | ULID | FK |
| batch_id | ULID | FK |
| subject_id | ULID | signer |
| signer_role | enum | per SignatureSpec |
| binds_to_type | enum | PolicyVersion, EvidenceObject, Appointment |
| binds_to_ref | string | |
| envelope_id | string | eCIgn envelope ID |
| status | enum | Requested, Sent, Viewed, Signed, Declined, Expired, Voided |
| signed_artifact_uri | string | nullable until signed |
| signed_artifact_hash | string | nullable until signed |
| auth_method | enum | per eCIgn |
| ip | string | |
| timestamp | timestamp | |

---

## 6. Audit

### 6.1 OnboardingAuditEvent
| Field | Type | Notes |
|-------|------|-------|
| id | ULID | PK |
| sequence | bigint | per-stream monotonic |
| prev_hash | string | hash chain |
| event_hash | string | of canonical event payload |
| event_type | enum | TRIGGER_RECEIVED, PROFILE_RESOLVED, TEMPLATE_SELECTED, REQUIREMENT_RECONCILED, REQUIREMENT_EMITTED, UNIT_STATE_CHANGED, EVIDENCE_CAPTURED, EVIDENCE_REJECTED, SIGNATURE_REQUESTED, SIGNATURE_COMPLETED, SIGNATURE_DECLINED, GATE_EVALUATED, OVERRIDE_GRANTED, OVERRIDE_EXPIRED, BATCH_COMPLETED, BATCH_WITHDRAWN |
| batch_id | ULID | nullable |
| unit_id | ULID | nullable |
| subject_id | ULID | nullable |
| actor_id | ULID | nullable |
| payload | json | typed per event_type |
| created_at | timestamp | |

Append-only. Hash-chained. Replayable.

### 6.2 GateEvaluation (specialization of audit event)
| Field | Type | Notes |
|-------|------|-------|
| gate_id | enum | per Gate |
| subject_id | ULID | |
| evaluation_at | timestamp | |
| inputs | json | which units/evidence were checked |
| outcome | enum | Pass, Fail, Conditional |
| reasons | [string] | machine-readable codes |
| caller | string | which downstream system queried |

### 6.3 OverrideRecord
| Field | Type | Notes |
|-------|------|-------|
| id | ULID | PK |
| gate_or_rule_id | string | |
| subject_id | ULID | |
| reason | text | |
| granted_by_signatures | [SignatureRecord] | dual sig (CO + Admin) |
| valid_from / valid_to | timestamp | bounded |
| status | enum | Active, Expired, Revoked |

---

## 7. Recurring & Calendar

### 7.1 RecurringRule
| Field | Type | Notes |
|-------|------|-------|
| id | ULID | PK |
| requirement_id | string | |
| subject_id | ULID | |
| rrule | string | iCal RRULE |
| pre_window_alerts | [duration] | e.g., 60d, 30d, 14d, 7d |
| next_due_at | timestamp | |
| last_completed_at | timestamp | nullable |

### 7.2 CalendarEntry (CES Compliance Calendar)
| Field | Type | Notes |
|-------|------|-------|
| id | ULID | |
| source | enum | Onboarding (subtype), CES, Other |
| subject_id | ULID | |
| batch_id, unit_id, requirement_id | refs | |
| due_at | timestamp | |
| escalation_tier | enum | |
| link | string | URL to unit/batch |

---

## 8. Relationships Summary

- WorkforceMember/Vendor 1—N OnboardingProfile
- OnboardingProfile 1—N OnboardingExecutionBatch
- OnboardingTemplate 1—N OnboardingExecutionBatch
- OnboardingExecutionBatch 1—N OnboardingExecutionUnit
- OnboardingExecutionUnit 1—N EvidenceObject
- OnboardingExecutionUnit 1—N SignatureRecord
- OnboardingExecutionUnit 1—N OnboardingAuditEvent
- RoleRequirement N—N OnboardingTemplate
- RoleRequirement 1—N RecurringRule (per subject)
- OnboardingExecutionBatch 1—N CalendarEntry (deadlines)
- Gate ←— GateEvaluation (audit event)
- OverrideRecord ←— GateEvaluation override

---

## 9. Constraints

- All `*_version` fields immutable once published.
- All evidence and signature artifacts immutable once stored; new versions created on change.
- All audit events append-only, hash-chained.
- Deletes are forbidden; status transitions are the only mutation pattern.
- All FK references must resolve at write time; orphan creation rejected.
- Reconciled requirements must reference the source evidence object and reason.

---

## 10. Indices (operational)

- `OnboardingExecutionUnit` by `(status, due_at)` for board/calendar queries
- `OnboardingExecutionBatch` by `(subject_id, status)` for dossier
- `OnboardingAuditEvent` by `(batch_id, sequence)` and `(subject_id, created_at)`
- `EvidenceObject` by `(subject_id, object_type, status)` for reconciliation
- `SignatureRecord` by `(subject_id, binds_to_type, binds_to_ref)` for policy-acknowledgment lookup
- `RecurringRule` by `(next_due_at, subject_id)` for calendar sweep
