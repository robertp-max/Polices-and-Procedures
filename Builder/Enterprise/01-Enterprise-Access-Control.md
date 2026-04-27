# 01 — Enterprise Access Control (RBAC + ABAC)

> **Status**: EXTENSION of the existing onboarding/CES/eCIgn architecture. This document does **not** replace any existing engine, audit chain, or gate model. It introduces the **Access Control layer** that all existing services will consult.
>
> **Anchor docs (existing — do not redesign)**:
> - `Builder/Onboarding/System/00-Onboarding-Execution-Architecture.md`
> - `Builder/Onboarding/06-Enforcement-Rules.md`
> - `Builder/eCIgn/03-Audit-and-Compliance-Model.md`
> - `Builder/Compliance-Execution-Sprints/04-Assignment-Model.md`
> - `Builder/Compliance-Execution-Sprints/10-Enforcement-and-Rules.md`

---

## 1. Purpose

Provide a **single authorization layer** consumed by every service (Onboarding Engine, CES, eCIgn, Policy Lifecycle, Audit Mode, Compliance Calendar, Vendor Mgmt, Governance, IT/Security, QAPI). All authorization decisions are **policy-driven** (not hardcoded), **resource + action scoped**, **attribute-aware**, and **always audited**.

Authorization model: **RBAC + ABAC hybrid** — RBAC supplies coarse role grants; ABAC supplies fine-grained attribute predicates (subject, resource, environment).

---

## 2. Core Entities

### 2.1 `User`

```
User {
  user_id            : ULID                     // immutable
  external_id        : string?                  // SSO/IdP subject
  display_name       : string
  email              : string
  status             : Active | Suspended | Deactivated
  identity_assurance : IAL1 | IAL2 | IAL3       // NIST 800-63
  mfa_enrolled       : boolean
  attributes         : { branch, service_lines[], cost_center, employment_type, ... }
  created_at, updated_at
}
```

### 2.2 `UserGroup`

```
UserGroup {
  group_id     : ULID
  group_key    : string                         // e.g. "rn-clinicians", "branch-sf-admin"
  name         : string
  scope        : Global | Branch | Domain | ServiceLine
  scope_value  : string?                        // e.g. branch_id
  parent_group : group_id?                      // hierarchical (optional)
  attributes   : { ... }                        // inherited downstream
}
```

Membership is event-sourced (`USER_GROUP_MEMBERSHIP_CHANGED`) and bounded by validity dates.

### 2.3 `Role`

```
Role {
  role_id     : string                          // stable canonical id
  name        : string
  description : string
  tier        : Workforce | Supervisor | Operational | Compliance | Governance | Auditor | System
  permissions : permission_id[]                 // grants
  constraints : Constraint[]                    // ABAC predicates that must hold
}
```

Canonical roles (initial set):

| role_id | tier | Notes |
|--------|------|-------|
| `compliance_officer` | Compliance | Privileged; dual-sig partner for overrides |
| `administrator` | Governance | Privileged; dual-sig partner for overrides |
| `privacy_officer` | Compliance | HIPAA Privacy oversight |
| `security_officer` | Compliance | HIPAA Security oversight |
| `clinical_manager` | Supervisor | Branch/team scope |
| `rn_clinician`, `lvn_clinician`, `hha_clinician`, `therapist` | Workforce | Field-clearance gated |
| `intake_coordinator`, `scheduler`, `biller`, `coder` | Operational | Billing/system-access gated |
| `qapi_lead`, `qapi_member` | Operational | QAPI scope |
| `auditor_internal`, `auditor_external` | Auditor | Read-only across audit projections |
| `vendor_owner` | Operational | Vendor lifecycle owner |
| `governing_body_member`, `medical_director` | Governance | Appointment-bound |
| `system_service` | System | Service principals (engine, eCIgn, gate evaluator) |

### 2.4 `RoleAssignment`

```
RoleAssignment {
  assignment_id : ULID
  user_id       : ULID
  role_id       : string
  scope         : { branch?, service_line?, vendor_id?, batch_id?, ... }
  valid_from    : timestamp
  valid_to      : timestamp?                    // bounded; required for elevated roles
  granted_by    : user_id
  grant_reason  : string                        // free text, audited
  signature_ref : SignatureRecord?              // required for elevated grants (CO/Admin/PrivacyOfficer/SecurityOfficer)
  status        : Active | Expired | Revoked
}
```

**Mandates**:
- Elevated roles (Compliance Officer, Administrator, Privacy Officer, Security Officer, Medical Director) require a **signed** `RoleAssignment` (eCIgn) with a bounded `valid_to`.
- Any change to a `RoleAssignment` emits `ROLE_ASSIGNMENT_CHANGED` to the global audit log.

### 2.5 `Permission`

```
Permission {
  permission_id : string                        // "evidence:create", "audit:export", ...
  resource_type : ResourceType
  action        : Action
  description   : string
}
```

Permissions are **declared, not invented at call sites**. Service code references permission IDs only.

### 2.6 `Resource`

```
Resource {
  resource_type   : ResourceType                // see catalog §4
  resource_id     : ULID | composite
  owner_user_id   : ULID?                       // for self-action restrictions
  attributes      : { branch, service_line, subject_id, vendor_id, classification, contains_phi, ... }
  parent_resource : ResourceRef?                // for inheritance (e.g., Unit ⊂ Batch)
}
```

### 2.7 `Action`

Canonical action verbs (closed set):

```
view · list · search · export · create · update · withdraw ·
assign · reassign · approve · sign · countersign · reject ·
override · revoke · suppress · activate · deactivate ·
acknowledge · attest · dispatch · ingest · replay · audit
```

Anything not in this set requires an architectural change (and a new permission).

---

## 3. Decision Model

```
Decision = (User, Action, Resource, Environment) → Permit | Deny | Indeterminate
```

Pipeline (Policy Decision Point — PDP):

1. **Authentication check** — session valid, MFA satisfied where required.
2. **Role lookup** — collect active `RoleAssignment`s in scope at `now`.
3. **Permission resolution** — union of permissions from those roles.
4. **Resource match** — `permission.resource_type == resource.resource_type` and `permission.action == action`.
5. **ABAC constraints** — evaluate role + permission + resource constraints (see §5).
6. **Separation-of-Duties check** — see §6.
7. **Environment checks** — IP, device, time-of-day where policy applies.
8. **Decision** + reason code.
9. **Audit emit** — every decision (Permit and Deny) produces an `AuditEvent` (see `03-Enterprise-Audit-Model.md`).

**Default: Deny**. Indeterminate decisions are treated as Deny and flagged.

---

## 4. Resource Catalog (initial)

| ResourceType | Owning service | Notes |
|--------------|----------------|-------|
| `User` | Identity | Includes profile + assignments |
| `RoleAssignment` | Identity | Elevated grants need signature |
| `Policy` / `PolicyVersion` | Policy Lifecycle | Versioned, hashed |
| `Workflow` / `WorkflowVersion` | Workflow registry | Immutable once published |
| `Form` / `FormVersion` | Forms library | Immutable once published |
| `ExecutionUnit` (CEU) | Onboarding/CES | See `02-Global-Execution-Unit-Model.md` |
| `ExecutionBatch` | Onboarding/CES | Aggregates CEUs |
| `EvidenceObject` | Evidence Service | Immutable, content-addressed |
| `SignatureRecord` | eCIgn | Bound + hashed |
| `Gate` / `GateEvaluation` | Gate Service | Pure read; assertions signed |
| `OverrideRecord` | Onboarding/Gate | Dual-sig, time-bounded |
| `AuditEvent` | Audit Store | Append-only |
| `Dossier` / `DossierExport` | Audit Mode | Watermarked + hashed |
| `Vendor` / `BAA` | Vendor Mgmt | BAA bound to template version |
| `Appointment` | Governance | Signed |
| `IncidentReport` | QAPI/Compliance | CEU-backed |
| `Session` | Identity | Required for PHI access |
| `PHIRecord` | Clinical/EHR adapter | Special handling §5.4 |

Permissions are declared as `<resource_type>:<action>` (e.g., `evidence:create`, `audit:export`, `override:approve`, `phi:view`, `dossier:export`).

---

## 5. ABAC Constraints

Constraints are predicates evaluated by the PDP. They are declarative and stored alongside roles/permissions.

### 5.1 Standard predicates

- `subject.scope.branch ∈ user.attributes.branches`
- `subject.service_line ∈ user.attributes.service_lines`
- `resource.owner_user_id != user.user_id` (self-action exclusion)
- `now ∈ [role_assignment.valid_from, role_assignment.valid_to]`
- `user.identity_assurance >= required_ial`
- `user.mfa_enrolled == true` when `resource.contains_phi`
- `session.auth_age <= max_phi_session_age`
- `environment.ip ∈ allowed_networks` (when configured)

### 5.2 Resource-typed constraints

Each `(role, permission)` may declare extra predicates:

```
role: clinical_manager
permission: execution_unit:approve
constraints:
  - resource.subject.attributes.branch ∈ user.attributes.branches
  - resource.assignee_user_id != user.user_id
```

### 5.3 Override predicates

Override grants are themselves resources. Approving an override requires:

```
permission: override:approve
constraints:
  - resource.requested_by_user_id != user.user_id
  - role ∈ {compliance_officer, administrator}
  - resource.valid_to - resource.valid_from <= policy_max_window
  - countersign_required == true   // dual-sig enforced (§6)
```

### 5.4 PHI predicates

```
permission: phi:view
constraints:
  - user.mfa_enrolled == true
  - session.auth_age <= 30m
  - minimum_necessary(user, patient, purpose) == true     // see HIPAA mapping
  - resource.classification in user.access_classes
```

`phi:view` and `phi:export` always emit a high-severity `AuditEvent` (see `04-User-Activity-Tracking.md`).

---

## 6. Separation of Duties (Hard, Non-Negotiable)

The PDP enforces these SoD rules globally — **no service may bypass**:

| Rule | Predicate |
|------|-----------|
| Cannot create AND approve same artifact | `audit_history.created_by_user_id != action.user_id` for any `*:approve` |
| Cannot validate own competency | `competency_artifact.subject_user_id != action.user_id` for `competency:finalize` |
| Cannot override own gate | `override_request.affected_subject_user_id != action.user_id` |
| Cannot countersign own request | `override_request.requested_by_user_id != action.user_id` for second signer |
| Cannot approve own evidence | `evidence.created_by_user_id != action.user_id` for `evidence:approve` |
| Cannot sign own appointment as sole signer | Appointments require Administrator + appointee; appointee may not be sole signer |
| Cannot modify policy they authored AND publish it | Policy `publish` requires a different actor than `author` |
| Cannot dispatch payment AND approve same invoice | Vendor Mgmt parity rule |
| Cannot issue and approve override grant in single role | Override grants always dual-sig (CO + Admin) |
| Auditor cannot perform any non-`view`/`export`/`replay` action | Hard role constraint on `auditor_*` |

SoD violations produce `Deny` with reason `sod_violation` and a high-severity audit event.

---

## 7. Canonical Permission Bundles (initial)

These bundles are the **starting point**. They are stored as data, versioned, and editable by Compliance Officer + Administrator dual-sig.

### 7.1 Compliance Officer

```
allow:
  - audit:view, audit:export, audit:replay
  - dossier:view, dossier:export
  - execution_unit:view, execution_unit:reassign, execution_unit:withdraw
  - execution_batch:view, execution_batch:withdraw, execution_batch:attest
  - evidence:view, evidence:reject
  - signature:view
  - gate:view, gate:evaluate
  - override:request, override:approve            // approve requires SoD §6
  - policy:view, policy:author, policy:publish    // publish requires different actor (SoD)
  - role_assignment:grant (non-elevated)          // elevated grants require Admin co-sign
  - workflow:view, form:view, vendor:view, appointment:view
  - phi:view (minimum_necessary required)
deny:
  - phi:export without legal hold + Admin co-sign
  - audit:write (audit is system-only)
  - override:approve where requested_by == self
```

### 7.2 Administrator

```
allow:
  - role_assignment:grant (including elevated, with signature)
  - override:approve (countersign role)
  - appointment:sign
  - vendor:engage, baa:execute (with CO co-sign)
  - audit:view, audit:export
  - delegation_matrix:author, delegation_matrix:publish
deny:
  - phi:view by default (must request explicit grant)
  - override:request AND override:approve same record
```

### 7.3 Auditor (read-only model)

```
allow:
  - audit:view, audit:list, audit:search
  - audit:replay (read-only reconstruction)
  - dossier:view, dossier:export (export emits audit event)
  - gate:view (historical evaluations)
  - execution_unit:view, execution_batch:view
  - policy:view, workflow:view, form:view
  - signature:view, evidence:view
deny:
  - everything else (hard deny on any verb other than view/list/search/export/replay)
  - phi:view unless engagement letter flag = true
```

### 7.4 Dual-Signature Enforcement Roles

These are the only roles that may participate as **signer** in dual-sig flows:

| Action | Signer A (initiator) | Signer B (countersign) |
|--------|----------------------|------------------------|
| Override grant | `compliance_officer` | `administrator` |
| Elevated `RoleAssignment` (CO/Admin/PO/SO) | Granting role | `administrator` (or board-level for Admin grant itself) |
| BAA execution | `compliance_officer` | `administrator` |
| Policy publish (high-impact) | `compliance_officer` | `administrator` |
| PHI bulk export | `compliance_officer` | `administrator` |
| Audit chain reconciliation override | `security_officer` | `administrator` |

Engine refuses to emit `*_GRANTED` until both `SignatureRecord`s exist and bind to the same request `event_hash`.

---

## 8. Service Boundaries (PDP / PEP)

- **PDP** (Policy Decision Point) — single library `server/access/pdp.ts`. Pure functions over (User, Action, Resource, Env) → Decision.
- **PEP** (Policy Enforcement Point) — Express middleware `requirePermission(permissionId, resourceLoader)` mounted on every route, plus engine-internal `authorize()` calls inside service handlers (events bus, queue workers).
- **PIP** (Policy Information Point) — read adapters that fetch `RoleAssignment`s, resource attributes, and session state.
- **PAP** (Policy Administration Point) — Compliance Officer UI to author roles/permission bundles; changes require dual-sig and emit `ACCESS_POLICY_CHANGED`.

No service implements its own authorization. Calling the PDP is mandatory.

---

## 9. Identity & Session Requirements

- **Authentication** via SSO/IdP; identity_assurance level recorded.
- **MFA** required for: any role with elevated tier, any user accessing PHI, any signer.
- **Session**: server-side session store; `auth_age` tracked; PHI actions require `auth_age ≤ 30m` (re-auth otherwise).
- **Step-up authentication** required for: override approvals, BAA execution, policy publish, dossier export, role assignment.
- **Service principals**: `system_service` role; rotated credentials; per-service permission scope; cannot perform user-bound SoD actions.

---

## 10. Caching & Consistency

- Decisions are **not cached across requests** for `*:approve`, `*:sign`, `override:*`, `phi:*`, and `audit:*`.
- Read decisions (`*:view`, `*:list`) may be cached per-request only.
- `RoleAssignment` changes invalidate caches via `ACCESS_INVALIDATION` event.
- Effective permissions for a `(user, scope)` snapshot are computed lazily and never persisted.

---

## 11. Failure Modes

- PDP failure → fail-closed (Deny). Caller surfaces "authorization service unavailable" and emits `ACCESS_DENIED { reason: pdp_unavailable }`.
- Missing role/permission → Deny with `not_authorized`.
- SoD violation → Deny with `sod_violation` + high-severity audit.
- Stale role assignment (expired) → Deny with `role_expired`.
- Identity assurance insufficient → `step_up_required` (UI initiates re-auth).

All Deny outcomes are audited with reason codes; the UI surfaces remediation paths only — never raw policy internals.

---

## 12. Migration / Extension Notes

- The existing onboarding engine, CES, eCIgn, and audit chain remain authoritative.
- **All existing routes** acquire a PEP middleware that calls the PDP; routes that previously had no checks now require explicit permission declarations.
- **All engine actions** (event handlers, batch generators, gate evaluators) acquire `authorize()` guards using the `system_service` principal augmented with the originating user context.
- The audit system gains the `AccessDecision` event family (see `03-Enterprise-Audit-Model.md`).
- No existing audit events are altered.

---

## 13. What This Document Forbids

- Hardcoded role checks in service code (`if (user.role === 'admin')`).
- Permissions invented at call sites.
- Skipping the PDP for "internal" actions.
- Caching `*:approve`, `*:sign`, `override:*`, `phi:*` decisions.
- Granting elevated roles without a signed `RoleAssignment`.
- Bypassing SoD via service-principal escalation.
