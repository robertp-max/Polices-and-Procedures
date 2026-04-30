# Security Demo Foundation Status (Phase A)

## Scope
- Implemented only Phase A (Identity and Access Layer foundation) for non-HIPAA demo environment.
- No PM architecture changes.
- No HIPAA-only AWS services or production security controls added.
- No CEU core engine, audit chain persistence, or dashboard expansion from later phases.

## Files Changed
- src/policy/security/identity/types.ts
- src/policy/security/identity/permissionCatalog.ts
- src/policy/security/identity/userGroups.ts
- src/policy/security/identity/roleAssignments.ts
- src/policy/security/identity/separationOfDuties.ts
- src/policy/security/identity/demoUsers.ts
- src/policy/security/identity/authorize.ts
- src/policy/security/identity/index.ts
- src/policy/security/identity/UserGroupsPage.tsx
- src/policy/security/identity/PermissionCatalogPage.tsx
- src/policy/security/identity/UserAssignmentsPage.tsx
- src/App.tsx
- src/policy/pages/PolicyLifecyclePage.tsx
- src/policy/components/FormSignatureFlow.tsx
- src/policy/workflows/components/WorkflowDetailView.tsx

## Groups Seeded
- Super Admin
- Admin
- RN
- LVN
- CHHA
- Compliance
- Auditor
- Onboarding
- Billing
- Director
- Executive
- System

## Permissions Seeded
- policy.view
- policy.draft
- policy.approve
- policy.publish
- form.view
- form.sign
- ceu.view
- ceu.assign
- ceu.execute
- ceu.complete
- ceu.override
- audit.read
- audit.export
- phi.read
- phi.write
- user.provision
- user.suspend
- system.replay

## Demo Users and Assignments
- super_admin -> demo-user-careindeed
- admin -> usr-admin
- rn -> usr-rn
- lvn -> usr-lvn
- chha -> usr-chha
- compliance -> usr-compliance
- auditor -> usr-auditor
- onboarding -> usr-onboarding
- billing -> usr-billing
- director -> usr-director
- executive -> usr-executive
- suspended test user -> usr-suspended

## Deterministic Authorization
- Added deterministic authorize() in identity module with ordered checks:
  1. Permission exists.
  2. User exists and is active.
  3. User has active role assignments.
  4. Requested resource is in assignment scope.
  5. Permission is granted by at least one assigned group.
  6. Policy publish requires approved policy version metadata.
  7. Separation of duties checks.
  8. Obligations attached (PHI logging and override constraints).
- Added in-memory ACCESS_DECISION event sink (`emitAccessDecision` / `listAccessDecisionEvents`) for demo traceability.

## SoD Rules Implemented
- Policy author cannot approve own policy version.
- Form assign/sign conflict denied unless self-attestation is explicitly allowed.
- CEU complete denied when reviewer is required and missing a distinct reviewer.
- Override blocks same-user dual approval.
- Auditor is restricted to read-only permission set.

## UI Integration (Required Visible Actions)
- Policy action gated: lifecycle intents map to policy permissions in Policy Lifecycle page.
- Form action gated: Send for Second Signature requires form.sign.
- Workflow/CEU action gated: Mark workflow complete requires ceu.complete.
- Denials are visible as disabled controls plus reason text/tooltips.

## Phase A Validation Matrix
- Super Admin all access: expected allow for policy/form/ceu actions.
- Auditor read-only: expected deny for sign/approve/complete actions.
- RN/LVN/CHHA forms and assigned CEU execution: expected allow for form.sign and ceu.execute/complete (subject to SoD).
- Compliance audit-read and ceu.assign: expected allow.
- Director/Executive policy approval path: expected allow for policy.approve (and Executive publish when approved).
- Suspended user: expected deny with reason code user.suspended.

## Implemented vs Remaining
- Implemented now (Phase A): identity types, permission catalog, group/user seeds, role assignments, deterministic authorization, SoD, access decision event stub, minimal admin pages, three visible UI permission gates.
- Remaining (Phase B/C/D, intentionally deferred):
  - CEU core state machine expansion and execution orchestration.
  - Durable audit chain persistence and tamper-evident verification pipeline.
  - HIPAA-grade controls and infrastructure hardening.
  - Security and compliance dashboards beyond current demo pages.
