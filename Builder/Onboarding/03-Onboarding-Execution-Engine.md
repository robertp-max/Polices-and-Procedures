# 03 — Onboarding Execution Engine

## Purpose

Define the engine that turns a **trigger** into governed **execution units** inside CES. Onboarding is not a UI; it is an engine that emits work.

---

## 1. Trigger Model

The engine activates on any of:

| Trigger | Description | Source |
|---------|-------------|--------|
| `NEW_HIRE` | Workforce member created | HR system / Admin UI |
| `ROLE_CHANGE` | Existing member assigned new role | HR / Admin |
| `REACTIVATION` | Return from LOA, rehire, lapsed status | HR |
| `ANNUAL_REVALIDATION` | Anniversary or policy-driven cycle | Compliance Calendar |
| `CREDENTIAL_EXPIRY_WINDOW` | License/TB/BLS/etc. nearing expiry | Calendar engine |
| `POLICY_VERSION_CHANGE` | Bound policy republished | Policy library |
| `SCOPE_EXPANSION` | New service line, new patient population | Operations |
| `VENDOR_ONBOARD` | New BA/contractor | Vendor Mgmt |
| `GOVERNANCE_APPOINTMENT` | New GB member, Officer, Medical Director | Governance |

Each trigger carries a typed payload (subject ID, role, effective date, reason).

---

## 2. Pipeline

```
Trigger
   │
   ▼
[1] Profile Resolution        → resolves role(s), domain(s), scope, tenant
   │
   ▼
[2] Template Selection        → selects OnboardingTemplate(s) for role × trigger
   │
   ▼
[3] Requirement Expansion     → expands template into RoleRequirement set
   │
   ▼
[4] Pre-Existing Evidence Reconciliation → suppresses already-satisfied requirements
   │
   ▼
[5] Execution Batch Creation  → OnboardingExecutionBatch (immutable spec)
   │
   ▼
[6] Execution Unit Emission   → one OnboardingExecutionUnit per requirement
   │
   ▼
[7] CES Routing               → units injected into Sprint Board + Calendar
   │
   ▼
[8] Lifecycle Management      → status, escalation, completion, audit close
```

---

## 3. Core Concepts

### 3.1 OnboardingProfile

The **person + role + scope** snapshot at trigger time. Includes:

- subject (workforce_member_id or vendor_id)
- role(s)
- domain(s)
- service line(s)
- patient population scope
- supervisor / reporting line
- tenant / branch
- effective date
- prior profile reference (for role-change diff)

### 3.2 OnboardingTemplate

Versioned, immutable definition of what a role requires for a given trigger type:

- `template_id`, `version`, `effective_from`, `effective_to`
- `role_id`, `trigger_type`
- ordered list of `RoleRequirement` references
- pre-conditions, post-conditions
- evidence schema
- escalation policy reference
- linkage to policy versions (so a policy republish triggers a new template version)

### 3.3 OnboardingExecutionBatch

The **materialized run** for one (subject × trigger × template) instance:

- `batch_id`, `subject_id`, `template_id`, `template_version`
- trigger payload
- creation timestamp, owner, due date
- aggregate status (Active / Blocked / At Risk / Completed / Withdrawn)
- audit-readiness score contribution
- linked Sprint(s)

### 3.4 OnboardingExecutionUnit

The atomic unit injected into CES. One per requirement. Always workflow-backed.

- `unit_id`, `batch_id`
- `requirement_id` (RoleRequirement)
- `workflow_id` (the workflow that performs the work)
- `assignee` (resolved by Assignment Model from CES doc 04)
- `due_at`, `sla`, `priority`
- `dependencies[]` (gates)
- `evidence_required[]` (object types)
- `signature_required[]` (eCIgn signature specs)
- `status` (Not Started / In Progress / Blocked / At Risk / Awaiting Signature / Awaiting Evidence / Completed / Failed)
- `attempts[]` (for retry-bearing units like competency)
- `audit_events[]`

### 3.5 OnboardingStatus

Aggregated states surfaced to UI and CES:

- **Pending Activation** — batch created, not yet started
- **In Progress** — units active
- **At Risk** — any unit < 48h to SLA, no completion path
- **Blocked** — required gate not met (e.g., license PSV failed)
- **Awaiting Signature** — eCIgn outstanding
- **Awaiting Evidence** — artifact upload outstanding
- **Completed** — all units satisfied, batch sealed
- **Withdrawn** — subject terminated/withdrawn before completion
- **Revalidation Due** — recurring trigger fired

---

## 4. Escalation Rules (Engine-Level)

| Condition | Action |
|-----------|--------|
| Unit overdue by 0–24h | Notify assignee + supervisor |
| Unit overdue by 24–72h | Notify Compliance Officer; mark batch At Risk |
| Unit overdue by >72h | Block dependent units; mark batch Blocked; create Compliance escalation |
| Pre-field gate not met by start date | Hard block — scheduling cannot assign field work |
| Signature outstanding > policy SLA | Re-issue eCIgn; notify signer + delegate |
| Evidence rejected | Reopen unit with rejection reason + retry attempt |
| Credential expiry inside 30/14/7/0-day windows | Auto-emit revalidation units; escalate at each window |

Escalation policy is referenced by template, not hardcoded in unit.

---

## 5. Completion Rules

A batch is **Completed** only when all of:

1. Every emitted unit is in `Completed` (or `Suppressed-By-Reconciliation` with audit reason).
2. Every required evidence object is persisted, hashed, and bound to subject + policy version.
3. Every required signature is captured via eCIgn and bound to evidence.
4. Pre-field / pre-billing / pre-system-access gates pass.
5. An `OnboardingAuditEvent` of type `BATCH_COMPLETED` is written with:
   - signed completion attestation by Compliance Officer or delegate
   - audit-readiness score delta
   - dossier snapshot reference

A unit is **Completed** only when:

- workflow returns success
- evidence objects validated (schema + content checks)
- signatures captured (if required)
- audit event written

No completion via UI checkbox alone. Ever.

---

## 6. Reconciliation Logic

Before emitting units, the engine reconciles against existing valid evidence:

- Suppress duplicate requirements when valid evidence exists and is within retention/expiry window.
- Convert suppressed requirements into `Verified-By-Reconciliation` audit events.
- Never silently skip — always emit an audit event with rationale.

---

## 7. Recurring & Revalidation

The engine subscribes to the Compliance Calendar. For every recurring rule on a `RoleRequirement` (e.g., annual TB, monthly OIG check, biannual competency), the engine:

- creates a lightweight **Revalidation Batch** scoped to the recurring requirement(s)
- routes units to CES using the Recurring Execution model (CES doc 07)
- enforces window-based escalation

---

## 8. Engine Outputs

Per trigger, the engine outputs:

- 1 OnboardingExecutionBatch
- N OnboardingExecutionUnits
- Audit events for: trigger received, profile resolved, template selected, reconciliation decisions, batch created, unit lifecycle changes, batch completion
- CES sprint injections
- Calendar entries

Per recurring cycle, the engine outputs the equivalent scoped to revalidation.

---

## 9. Determinism & Replayability

- Templates are versioned and immutable.
- Trigger payloads are persisted.
- The engine must be able to **replay** any historical trigger and produce a logically equivalent batch (modulo policy version changes), enabling surveyor reproducibility.
