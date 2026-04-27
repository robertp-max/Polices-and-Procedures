# 02 — Global Execution Unit Model (CEU)

> **Status**: EXTENSION. Renames and standardizes `OnboardingExecutionUnit` (already defined in `Builder/Onboarding/08-Data-Model.md`) into the global **`ExecutionUnit` (CEU)** primitive that every domain in the system uses.
>
> **Mandate**: ALL WORK IN THE SYSTEM = CEU. No exceptions. No parallel "task", "ticket", "todo", "checklist", "case", or "request" primitives.
>
> **Anchors**: `Builder/Onboarding/03-Onboarding-Execution-Engine.md`, `Builder/Onboarding/05-Workflow-and-Form-Mapping.md`, `Builder/Compliance-Execution-Sprints/03-Workflow-Based-Execution.md`.

---

## 1. Renaming Contract

```
OnboardingExecutionUnit  →  ExecutionUnit (CEU)
OnboardingExecutionBatch →  ExecutionBatch
OnboardingTemplate       →  ExecutionTemplate
OnboardingProfile        →  ExecutionContext     // generalizes "subject of work"
```

The existing onboarding domain is preserved as **CEU domain = `onboarding`**. No fields removed; new fields add domain extensibility.

---

## 2. CEU Type Catalog (initial — extensible)

| ceu_type | domain | Purpose | Examples |
|----------|--------|---------|----------|
| `onboarding.requirement` | onboarding | Role requirement satisfaction | License PSV, HIPAA ack, BLS upload |
| `onboarding.competency` | onboarding | Observed competency | OASIS, HHA-12, wound care |
| `onboarding.acknowledgment` | onboarding | Single-policy ack | COC, AUP, HIPAA |
| `onboarding.appointment` | governance | Governance role appointment | CO, Admin, MD, GB members |
| `qapi.pip` | qapi | Performance improvement project step | Aim statement, PDSA cycle |
| `qapi.review` | qapi | Periodic review | Quarterly QAPI meeting |
| `policy.author` | policy | Authoring step | Draft, peer review |
| `policy.publish` | policy | Publish gate | Dual-sig publish |
| `policy.reack` | policy | Re-ack on republish | Per subject |
| `incident.report` | compliance | Incident intake | Privacy breach, fall, med error |
| `incident.investigation` | compliance | Root cause | Interviews, timeline |
| `incident.remediation` | compliance | Corrective actions | CAPA |
| `training.assignment` | hr/compliance | Required training | LMS course completion |
| `training.attestation` | hr/compliance | Training attestation | Annual HIPAA |
| `vendor.intake` | vendor | New vendor evaluation | Risk tier, BAA, exclusion |
| `vendor.baa` | vendor | BAA execution | Multi-sig |
| `vendor.revalidation` | vendor | Annual vendor recheck | COI, exclusion |
| `governance.attestation` | governance | Annual attestation | Conflict of interest |
| `governance.minutes_signoff` | governance | GB/MEC minutes | Signed |
| `it.access_request` | it | Provisioning | System access clearance |
| `it.access_review` | it | Periodic recert | Quarterly |
| `it.risk_analysis` | it | HIPAA §164.308 | Annual |
| `clinical.supervisory_visit` | clinical | HHA supervisory visit | RN signed |
| `clinical.chart_review` | clinical | OASIS / chart review | Sampled |
| `audit.dossier_export` | audit | Dossier export request | Watermarked PDF |
| `audit.chain_verification` | audit | Manual chain verify | Triggered or scheduled |

New types are introduced via `ExecutionTemplate` registration (versioned + signed); never inline.

---

## 3. Shared Structure (every CEU)

```ts
ExecutionUnit (CEU) {
  ceu_id              : ULID                    // immutable
  ceu_type            : string                  // see §2
  ceu_version         : int                     // increments on retry/reissue
  domain              : Domain                  // onboarding | qapi | policy | incident | training | vendor | governance | it | clinical | audit | compliance
  template_ref        : { id, version }         // ExecutionTemplate@version (immutable pin)
  workflow_ref        : { id, version }         // WF-* @ version
  context             : ExecutionContext        // {subject_id?, vendor_id?, batch_id?, parent_ceu_id?, ...}
  scope               : { branch?, service_line?, period?, patient_id?, classification }
  assignee            : { type, user_id?, group_id?, role_id? }   // resolved by CES Assignment Model
  owner               : { user_id }             // accountable owner
  status              : Lifecycle               // see §4
  due_at              : timestamp?
  sla_at              : timestamp?              // hard deadline
  priority            : Critical | High | Normal | Low
  evidence_required   : EvidenceRequirementRef[]
  signature_required  : SignatureSpec[]
  gates_affected      : gate_id[]               // gates that re-evaluate on this CEU's state changes
  policy_refs         : PolicyVersionRef[]      // immutable bindings
  evidence_refs       : EvidenceObjectRef[]     // captured artifacts
  signature_refs      : SignatureRecordRef[]    // captured signatures
  attempts            : Attempt[]               // history of tries
  domain_extension    : { ... }                 // §5
  parent_ceu_id       : ULID?                   // hierarchical CEU support
  child_ceu_ids       : ULID[]                  // remediation/sub-units
  blocking_ceu_ids    : ULID[]                  // cross-domain dependencies (§6)
  blocked_by          : { reason, since }?      // current blocker
  created_by, created_at
  updated_at
  closed_at?
  closure_reason?     : Completed | Withdrawn | Suppressed | Failed
}
```

**Immutability**:
- `template_ref`, `workflow_ref`, `policy_refs[]` are pinned at create time and never mutate.
- `evidence_refs`, `signature_refs` are append-only.
- Status transitions are append-only (history kept on `attempts[]` and the audit stream).

---

## 4. Lifecycle (CEU State Machine — global)

```
Draft → PendingActivation → InProgress
   → AwaitingEvidence ↔ InProgress
   → AwaitingSignature ↔ InProgress
   → Blocked         ↔ InProgress
   → Completed | Failed | Suppressed | Withdrawn
```

Transition rules:
- `Draft` → `PendingActivation` is system-emitted on template selection.
- `PendingActivation` → `InProgress` on first action.
- A CEU may not enter `Completed` unless **all required evidence is `Valid`** AND **all required signatures are `Signed`** AND **no `blocking_ceu_ids` are unresolved**.
- `Suppressed` requires a documented reconciliation reason recorded as audit event.
- `Failed` triggers domain-specific child CEU emission (e.g., remediation sub-batch).
- `Withdrawn` is a terminal state for cancelled work; reason mandatory.

This is the **same** state machine as the existing onboarding unit — generalized.

---

## 5. Domain Extensions

Each `ceu_type` declares a typed `domain_extension` schema. Extension fields **never** alter the shared structure; they live behind `domain_extension`.

Examples:

```ts
// onboarding.competency
domain_extension: {
  setting        : "Patient" | "Simulated";
  skill_grid     : SkillResult[];
  observer_user_id : ULID;
}

// incident.report
domain_extension: {
  incident_type  : "privacy_breach" | "fall" | "med_error" | ...;
  patient_id?    : ULID;
  severity       : 1..5;
  reported_to    : ("ocr"|"state"|"medical_director"|...)[];
  reported_at?   : timestamp;
}

// vendor.baa
domain_extension: {
  vendor_id      : ULID;
  baa_template_version : int;
  envelope_id    : string;
}

// it.access_request
domain_extension: {
  systems        : string[];
  justification  : string;
  data_classes   : string[];
}
```

Extensions are validated by the Workflow Orchestrator against the workflow's declared schema.

---

## 6. Cross-Domain Dependencies

CEUs may declare hard dependencies on other CEUs across domains. The engine refuses to mark dependent CEUs `Completed` while blockers remain.

Examples:
- `incident.remediation` blocks `incident.investigation` closure? No — reverse: `incident.investigation` blocks `incident.remediation` activation.
- `vendor.baa.Completed` is required before `it.access_request` for that vendor.
- `policy.publish.Completed` is the trigger that **emits** `policy.reack` CEUs across affected subjects.
- `onboarding.requirement[license_psv]` blocks `gate:field_clearance` (gate dependency, not CEU dependency, but evaluated similarly).
- `qapi.pip` may declare `incident.investigation` as predecessor.

Dependencies are stored as `blocking_ceu_ids` and visualized as a DAG in the UI.

---

## 7. Aggregation: `ExecutionBatch`

```
ExecutionBatch {
  batch_id        : ULID
  domain          : Domain
  trigger         : { type, source, source_event_id }   // unchanged from onboarding
  context         : ExecutionContext
  template_ref    : { id, version }                     // batch-level template
  ceu_ids         : ULID[]                              // member CEUs
  status          : PendingActivation | InProgress | AtRisk | AwaitingEvidence | AwaitingSignature | Blocked | Completed | Withdrawn
  completion_rule : "all_required_completed" | "all_completed" | custom
  attestation_required : boolean
  attestation_signature_ref? : SignatureRecordRef
  audit_stream    : "batch:<batch_id>"
}
```

**Generalization**: Onboarding batches remain unchanged in semantics; QAPI cycles, incident cases, vendor onboarding journeys, training campaigns, and IT access reviews all become `ExecutionBatch`es with the appropriate `domain`.

---

## 8. Templates (`ExecutionTemplate`)

```
ExecutionTemplate {
  template_id     : string
  version         : int                 // immutable per-version
  domain          : Domain
  trigger_types   : TriggerType[]       // when this template applies
  ceu_types       : { ceu_type, workflow_ref, evidence_required, signature_required, gates_affected, sla_rule, dependencies }[]
  policy_refs     : PolicyVersionRef[]  // pinned bindings
  scope_filters   : ScopeFilter[]
  approval_chain  : { authoring, peer_review, publish_signers[] }
  status          : Draft | Published | Retired
  published_at?, published_by_signature_ref?
}
```

Existing onboarding templates become `ExecutionTemplate` rows with `domain = onboarding`. New domains add new templates.

---

## 9. Workflow Binding

CEUs do not contain logic; they reference `WorkflowVersion`s. The Workflow Orchestrator (existing) executes step-by-step. Workflows in any domain produce evidence/signatures via the same Evidence and eCIgn services.

No new orchestrator. No domain-specific workflow engines.

---

## 10. Routing Through CES

CEUs from every domain flow through CES exactly as onboarding CEUs do:

- CEUs surface as Sprint Board items (filtered by domain when needed).
- The Compliance Calendar shows due/recurring entries from all domains.
- Assignment Model resolves owners using existing rules.
- Recurring Execution drives cadence-based CEUs (training, vendor revalidation, IT access review, etc.).
- Sprint planning bundles by sprint window across domains; the board can be filtered to a single domain.

This is the unification: **one execution surface for the entire enterprise.**

---

## 11. Mandates

1. **All work = CEU.** No new task primitives. Service code that needs to "do compliance work" emits a CEU.
2. **No silent transitions.** Every status change emits `EXECUTION_UNIT_STATE_CHANGED`.
3. **Pinned versions everywhere.** Template, workflow, policy bindings are version-pinned at create time.
4. **Idempotent emission.** CEU creation uses idempotency keys per existing engine rules.
5. **Cross-domain dependencies are explicit.** No hidden coupling.
6. **No domain-specific audit chains.** Audit events for all CEUs go to the global audit log (see `03-Enterprise-Audit-Model.md`).
7. **No domain-specific access logic.** All authorization flows through the PDP (`01-Enterprise-Access-Control.md`).

---

## 12. Migration

- Existing `OnboardingExecutionUnit` rows are mapped 1:1 to `ExecutionUnit` with `domain = onboarding` and `ceu_type = onboarding.requirement | onboarding.competency | onboarding.acknowledgment | onboarding.appointment`.
- `OnboardingExecutionBatch` → `ExecutionBatch` with `domain = onboarding`.
- IDs preserved; all references continue to resolve.
- API surface adds CEU routes that read across domains while preserving onboarding-specific routes for backward compatibility.

---

## 13. Forbidden

- Building a "case management" system, "ticketing" system, "task tracker", or "checklist app" parallel to CEUs.
- Domain-specific evidence stores, signature stores, or audit stores.
- Inventing workflow engines per domain.
- Skipping CES for "small" workflows.
- Mutating CEUs in place (status changes are events; field corrections are forward compensating events).
