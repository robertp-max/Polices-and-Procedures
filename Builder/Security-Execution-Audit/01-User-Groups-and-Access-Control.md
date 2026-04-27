# 01 — User Groups & Access Control

**Layer:** Identity & Access (IAL)

---

## 1. Core Entities

### 1.1 User
```
User {
  id: UserId                          // stable internal id
  externalId: string                  // SSO / IdP subject
  displayName: string
  email: string
  attributes: {
    licenseNumbers?: string[]         // RN, LVN, etc.
    employmentStatus: 'active' | 'suspended' | 'terminated'
    branchIds?: string[]
    hireDate?: ISODate
  }
  status: 'active' | 'suspended'
  createdAt, updatedAt: ISODateTime
}
```
Credentials live in the external IdP (SSO). The platform never stores passwords.

### 1.2 UserGroup
```
UserGroup {
  id: GroupId
  name: 'RN' | 'LVN' | 'CHHA' | 'Admin' | 'Compliance' | 'Auditor'
        | 'Onboarding' | 'Billing' | 'Director' | 'Executive' | 'System'
  domain: 'clinical' | 'admin' | 'audit' | 'governance' | 'system'
  permissions: PermissionRef[]        // base permission set
  description: string
}
```
Groups grant **base** permissions. Final authority = group permissions ∩ scope ∩ assignment status.

### 1.3 RoleAssignment
```
RoleAssignment {
  id: AssignmentId
  userId: UserId
  groupId: GroupId
  scope: Scope                        // see §2
  effectiveFrom: ISODateTime
  effectiveTo?: ISODateTime           // null = open-ended
  grantedBy: UserId | 'system'
  reason?: string
}
```
Assignments are **versioned**; expired/revoked rows remain for audit.

### 1.4 Permission
```
Permission {
  id: 'resource.action'               // e.g. 'policy.approve'
  resource: 'policy' | 'form' | 'ceu' | 'user' | 'audit' | 'phi' | 'signature' | ...
  action: 'view' | 'create' | 'update' | 'delete' | 'approve' | 'sign' | 'audit' | 'override'
  phi: boolean                        // if true, triggers PHI access logging
}
```

### 1.5 Scope
```
Scope = {
  organizationId: 'care-indeed'
  branchId?: string
  patientId?: string                  // when applicable (PHI scope)
  programId?: string
}
```
Scopes are evaluated **most specific first**; deny at a narrower scope overrides allow at a broader scope only when explicitly marked `restrictive: true`.

---

## 2. Authorization Decision

```
authorize(actor, action, resource, scope) -> Decision
Decision = { allow: boolean, reasonCode: string, obligations: Obligation[] }
```
Obligations include: `log_phi_access`, `require_dual_signature`, `record_reason`, `notify_compliance`.

Decision algorithm (deterministic):
1. Resolve actor's active `RoleAssignments` valid at `now()`.
2. Union their group permissions.
3. Intersect with requested scope.
4. Apply **separation of duties** rules.
5. Apply **deny rules** (suspended user, expired assignment, scope mismatch).
6. Emit `ACCESS_DECISION` audit event regardless of outcome.

---

## 3. Permission Catalog (initial)

| Permission | Allowed Groups (default) | Notes |
|------------|--------------------------|-------|
| `policy.view` | All authenticated | Public-to-org policies only |
| `policy.draft` | Compliance, Director | |
| `policy.approve` | Director, Executive | SoD: cannot approve own draft |
| `policy.publish` | Compliance, Executive | Requires approved version |
| `form.view` | Clinical, Admin | PHI-tagged forms require `phi.read` |
| `form.sign` | Role-specific (RN, LVN, CHHA, Admin) | Via eCIgn only |
| `ceu.view` | Owner, Reviewers, Compliance, Auditor | |
| `ceu.assign` | Manager, Compliance | |
| `ceu.execute` | Owner | |
| `ceu.complete` | Owner + Reviewer (if required) | |
| `ceu.override` | Compliance + Director (dual) | Records reason, raises event |
| `audit.read` | Auditor, Compliance, Executive | Read-only |
| `audit.export` | Compliance, Executive | Watermarked, logged |
| `phi.read` | Clinical, with patient-scope assignment | Logs every access |
| `phi.write` | Clinical, with patient-scope assignment | Logs every change |
| `user.provision` | Onboarding, Admin | |
| `user.suspend` | Admin, Compliance | Logs reason |
| `system.replay` | System only | For deterministic rebuild |

---

## 4. Separation of Duties (SoD)

Hard-coded SoD constraints:

| Rule | Constraint |
|------|------------|
| Policy authoring | The same user **cannot** both `policy.draft` and `policy.approve` the same `policyVersionId`. |
| Form signing | The same user cannot both `form.assign` and `form.sign` the same form instance unless self-attestation is the explicit form type. |
| CEU completion | The user who `ceu.execute`s cannot single-handedly mark `Completed` if `requiresReviewer: true`. |
| Override | Override requires two distinct users from approved override-eligible groups. |
| Audit access | Auditor group has **no** write permission anywhere. |

SoD violations are **denied** and emit `SOD_VIOLATION` audit events.

---

## 5. Roles

### 5.1 Standard
RN, LVN, CHHA, Admin, Onboarding Specialist, Billing, Compliance Analyst, Director, Executive.

### 5.2 Escalation Roles
- **Compliance Lead** — receives SLA breaches, blocked CEUs, repeated denials.
- **Director on Call** — receives override requests and high-risk events.

### 5.3 Override Roles (dual-approval)
- `override.policy` — Compliance Lead + Director
- `override.signature` — Director + Executive
- `override.access` — Admin + Compliance Lead

Override workflow:
1. Requestor opens an override CEU with reason and target.
2. Two distinct override-role users must approve.
3. Both approvals are signed (eCIgn) and audit-chained.
4. Override expires automatically (default 24h) and is logged on expiration.

### 5.4 Auditor (Read-Only)
- Group `Auditor` may read CEUs, audit events, policies, forms metadata, and exports.
- Cannot create, update, sign, approve, or override anything.
- Cannot read raw PHI; sees redacted views with PHI access markers.

---

## 6. Lifecycle Events (emitted to AEL)

`USER_CREATED`, `USER_SUSPENDED`, `USER_REINSTATED`,
`GROUP_CREATED`, `PERMISSION_GRANTED`, `PERMISSION_REVOKED`,
`ASSIGNMENT_CREATED`, `ASSIGNMENT_EXPIRED`, `ASSIGNMENT_REVOKED`,
`ACCESS_DECISION` (allow/deny + reasonCode), `SOD_VIOLATION`,
`OVERRIDE_REQUESTED`, `OVERRIDE_APPROVED`, `OVERRIDE_DENIED`, `OVERRIDE_EXPIRED`.
