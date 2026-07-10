# User Setup & Identity ΓÇö Complete Developer Manual

**Audience:** engineers working on identity, roster, role/setup assignment, journey learner wiring, escalations, and demo audit.  
**Status:** Documents **Phases 2AΓÇô2E** as implemented (demo / localStorage). **Phase 2F** (real IdP + API) is not implemented.  
**Repo root:** `Policies_and_Procedures_V2`  
**Last aligned to code:** 2026-07-09  

> **Hard rule:** This system is **demo/local-only** until Phase 2F. Do not present localStorage registries, soft role gates, or the audit tab as production security or ACHC system-of-record.

---

## Table of contents

1. [Purpose and scope](#1-purpose-and-scope)
2. [Architecture overview](#2-architecture-overview)
3. [ID namespaces (critical)](#3-id-namespaces-critical)
4. [Directory map](#4-directory-map)
5. [Core types](#5-core-types)
6. [Identity registry store](#6-identity-registry-store)
7. [User setup assignments](#7-user-setup-assignments)
8. [Demo seed data](#8-demo-seed-data)
9. [Permissions, groups, authorize](#9-permissions-groups-authorize)
10. [Page access matrix](#10-page-access-matrix)
11. [User-setup audit log](#11-user-setup-audit-log)
12. [Admin Users UI](#12-admin-users-ui)
13. [Demo impersonation](#13-demo-impersonation)
14. [Journey integration](#14-journey-integration)
15. [Supervisor filtering](#15-supervisor-filtering)
16. [Deadlines and escalations](#16-deadlines-and-escalations)
17. [Appendix F signatures](#17-appendix-f-signatures)
18. [Auth layer (current vs 2F)](#18-auth-layer-current-vs-2f)
19. [Routing and navigation](#19-routing-and-navigation)
20. [localStorage keys and migration](#20-localstorage-keys-and-migration)
21. [API reference (cheatsheet)](#21-api-reference-cheatsheet)
22. [How-to recipes](#22-how-to-recipes)
23. [Testing](#23-testing)
24. [UX labels and honesty requirements](#24-ux-labels-and-honesty-requirements)
25. [Known limitations and non-goals](#25-known-limitations-and-non-goals)
26. [Phase 2F readiness checklist](#26-phase-2f-readiness-checklist)
27. [Troubleshooting](#27-troubleshooting)
28. [Related documents](#28-related-documents)

---

## 1. Purpose and scope

### What ΓÇ£User SetupΓÇ¥ means in this product

| Capability | Status |
|------------|--------|
| Identity roster (name, email, status) | **Live** ΓÇö Zustand + localStorage |
| Permission groups (`RoleAssignment` ΓåÆ `UserGroup`) | **Live** ΓÇö seed + CRUD |
| Journey-shaped setup (role, supervisor, first day, licenses, onboarding modules) | **Live** ΓÇö `UserSetupAssignment` side map |
| Admin UI create / edit / soft-deactivate | **Live** ΓÇö `/admin/users` |
| Demo learner impersonation for Journey | **Live** ΓÇö `DemoImpersonationBar` |
| Supervisor direct-report filtering | **Live** ΓÇö setup + journey `supervisorId` |
| Assignment-driven academy module lists | **Live** ΓÇö partial (Academy primary; ModulePlayer soft banner) |
| Deadline / escalation engine + UI | **Live** ΓÇö `/journey/admin?tab=escalations` |
| Client audit of user-setup mutations | **Live** ΓÇö demo only, not tamper-evident |
| Real login / IdP session | **Not live** ΓÇö `AuthProvider` stub |
| Server-side gates / API registry | **Not live** ΓÇö Phase 2F |

### In scope for this manual

- Everything under `src/policy/security/identity/`
- User-setup UI: `AdminUsersScreen.tsx`
- Journey bridges: `DemoImpersonationBar`, `journeyProfileAdapter`, Supervisor / Academy / ModulePlayer touchpoints
- Escalation engine + Journey Admin escalations tab
- Soft admin gates: `adminRoleHelper.ts`
- Related journey store audit hooks

### Out of scope (mentioned only for orientation)

- Nolan tutor design
- Full onboarding-v2 engine (`src/policy/onboarding-v2/`) as production engine
- Production Cognito deploy runbooks (infra exists under `infra/demo-auth-cdk`; wiring is 2F)

---

## 2. Architecture overview

```
ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
Γöé  UI LAYER (v6 pageviews)                                                  Γöé
Γöé  AdminUsersScreen Γöé SupervisorScreen Γöé JourneyAcademy Γöé JourneyAdmin     Γöé
Γöé  ModulePlayer (banner) Γöé AppendixFScreen Γöé DemoImpersonationBar           Γöé
ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
              Γöé                           Γöé
              Γû╝                           Γû╝
ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
Γöé  IDENTITY (canonical User)  Γöé  Γöé  JOURNEY STORE                          Γöé
Γöé  userAssignmentsStore       Γöé  Γöé  journeyStore (ci-journey-v1)          Γöé
Γöé  ΓÇó users[]                  Γöé  Γöé  ΓÇó employees (SEED_EMPLOYEES)          Γöé
Γöé  ΓÇó assignments[] (groups)   Γöé  Γöé  ΓÇó currentEmployeeId (EMP-*)           Γöé
Γöé  ΓÇó setupAssignments{}       Γöé  Γöé  ΓÇó attempts / evidence / escalations   Γöé
Γöé  ΓÇó auditLog[]               Γöé  Γöé  ΓÇó sign / visits / ack-resolve         Γöé
Γöé  Key: ci.identityRegistry.v1Γöé  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
Γöé  Audit: ci.identitySetupΓÇª   Γöé                    Γöé
ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ                    Γöé
               Γöé         journeyProfileAdapter      Γöé
               ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ resolveJourneyEmployeeId ΓöÇΓöÇΓöÿ
                         getAssignedModuleIdsForEmployee
                         DEMO_JOURNEY_EMPLOYEE_MAP

ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ  ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
Γöé  AUTH STUB (not production) Γöé  Γöé  RELATED (do not confuse)              Γöé
Γöé  AuthProvider ΓåÆ DemoUser    Γöé  Γöé  onboarding-v2 WorkforceMember seeds   Γöé
Γöé  always id "demo-user"      Γöé  Γöé  CNA learnerState (ci-cna-learner-v1)  Γöé
Γöé  auth/api.ts client unused  Γöé  Γöé  security/auditLog (hash chain, other) Γöé
Γöé  by AuthProvider today      Γöé  Γöé  pageAccessStore (page matrix audit)   Γöé
ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ  ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
```

### Design principle (Phase 2A)

**Do not invent a fourth person model.**

Canonical person = `User` in `security/identity/types.ts`.  
Journey fields hang off a **side map** `setupAssignments[userId]`, not a parallel `UserProfile` type/store.

| Model | Location | Purpose |
|-------|----------|---------|
| `User` | `security/identity` | Auth-shaped identity + status |
| `RoleAssignment` + `UserGroup` | same | Permission groups |
| `UserSetupAssignment` | same (side map) | Journey role, supervisor, onboarding modules |
| `JourneyEmployee` | `journey` | Learner roster for LMS / escalations (EMP-* seeds) |
| `WorkforceMember` | `onboarding-v2` | Separate prototype; **not** wired to User Setup |

---

## 3. ID namespaces (critical)

Developers who mix these will break supervisor filters, completions, and profile achievements.

| Namespace | Example IDs | Owner store | Notes |
|-----------|-------------|-------------|--------|
| **Identity user** | `usr-rn`, `demo-user-careindeed` | `userAssignmentsStore.users` | Canonical for admin roster / setup |
| **Permission group** | `grp-super-admin`, `grp-rn` | `userGroups` + `assignments` | Not a person |
| **Journey employee** | `EMP-1001`, `EMP-2001` | `journeyStore.employees` | Completions, Appendix F, escalations keyed here |
| **Auth demo id** | `demo-user` | `AuthProvider` | **Different** from `demo-user-careindeed` |
| **Legacy community** | `u-admin-brad`, `u-don-01` | maps only | Mapped in `DEMO_JOURNEY_EMPLOYEE_MAP` |
| **Supervisor on setup** | identity `User.id` | `setup.supervisorId` | e.g. `usr-director` |
| **Supervisor on journey seed** | EMP id | `JourneyEmployee.supervisorId` | e.g. `EMP-2001` |

### Bridge tables (Phase 2C)

Defined in `src/v6/utils/journeyProfileAdapter.ts`:

| Identity ΓåÆ EMP | EMP ΓåÆ Identity |
|----------------|----------------|
| `usr-rn` ΓåÆ `EMP-1001` | `EMP-1001` ΓåÆ `usr-rn` |
| `usr-chha` ΓåÆ `EMP-1002` | `EMP-1002` ΓåÆ `usr-chha` |
| `usr-lvn` ΓåÆ `EMP-1003` | `EMP-1003` ΓåÆ `usr-lvn` |
| `usr-director` ΓåÆ `EMP-2001` | `EMP-2001` ΓåÆ `usr-director` |
| `demo-user-careindeed` ΓåÆ `EMP-3001` | `EMP-3001` ΓåÆ `demo-user-careindeed` |
| `demo-user` ΓåÆ `EMP-1001` (legacy auth) | ΓÇö |

Also: each mapped setup row may carry `journeyEmployeeSeedRef` (same EMP id).  
Resolution order in `resolveJourneyEmployeeId(id)`:

1. Static `DEMO_JOURNEY_EMPLOYEE_MAP`
2. Live `getLiveSetupAssignment(id)?.journeyEmployeeSeedRef`
3. Passthrough if id already matches `/^EMP-\d+/i`
4. Else `null`

---

## 4. Directory map

### Identity subsystem

```
src/policy/security/identity/
Γö£ΓöÇΓöÇ index.ts                    # Public barrel (see exports caveats)
Γö£ΓöÇΓöÇ types.ts                    # User, UserGroup, RoleAssignment, Permission*, Decision
Γö£ΓöÇΓöÇ demoUsers.ts                # DEMO_USERS (18) + resolveUserIdFromAuth
Γö£ΓöÇΓöÇ userGroups.ts               # USER_GROUPS, USER_GROUP_BY_ID
Γö£ΓöÇΓöÇ roleAssignments.ts          # ROLE_ASSIGNMENTS seed links userΓåÆgroup
Γö£ΓöÇΓöÇ permissionCatalog.ts        # PermissionId catalog
Γö£ΓöÇΓöÇ separationOfDuties.ts       # SoD rules
Γö£ΓöÇΓöÇ identityNormalization.ts    # email/auth subject helpers, toAppUser
Γö£ΓöÇΓöÇ authorize.ts                # authorize(userId, permission, resource)
Γö£ΓöÇΓöÇ access.ts                   # thin access helpers
Γö£ΓöÇΓöÇ pageAccessTypes.ts          # page access DTOs
Γö£ΓöÇΓöÇ pageRegistry.ts             # page catalog for matrix
Γö£ΓöÇΓöÇ pageAccess.ts               # canViewPage / canWritePage
Γö£ΓöÇΓöÇ pageAccessStore.ts          # Zustand page-access grants + its own audit
Γö£ΓöÇΓöÇ userSetupAssignments.ts     # Γÿà UserSetupAssignment types + seed + helpers
Γö£ΓöÇΓöÇ userSetupAudit.ts           # Γÿà Demo audit types + localStorage helpers
Γö£ΓöÇΓöÇ userAssignmentsStore.ts     # Γÿà Canonical Zustand registry + CRUD + setup + audit
ΓööΓöÇΓöÇ userAssignmentsStore.test.ts
```

### UI / adapters

```
src/v6/screens/pageviews/
Γö£ΓöÇΓöÇ AdminUsersScreen.tsx          # Γÿà Live user directory (2B/2E)
Γö£ΓöÇΓöÇ SupervisorScreen.tsx          # Impersonation + direct-report filter
Γö£ΓöÇΓöÇ JourneyAcademyScreen.tsx      # Impersonation + assignment modules
Γö£ΓöÇΓöÇ ModulePlayerScreen.tsx        # Soft assignment banner (partial 2C)
Γö£ΓöÇΓöÇ JourneyAdminScreen.tsx        # escalations tab (2D)
ΓööΓöÇΓöÇ AppendixFScreen.tsx           # Explicit signer required

src/policy/journey/components/
ΓööΓöÇΓöÇ DemoImpersonationBar.tsx      # Γÿà Demo learner switcher

src/v6/utils/
Γö£ΓöÇΓöÇ journeyProfileAdapter.ts      # Γÿà ID bridges + assigned modules
ΓööΓöÇΓöÇ adminRoleHelper.ts            # Soft admin role strings / groups

src/auth/
Γö£ΓöÇΓöÇ AuthProvider.tsx              # Stub always Demo User
ΓööΓöÇΓöÇ api.ts                        # AuthApi client types (unused by provider)
```

### Engine / journey data

```
src/policy/journey/
Γö£ΓöÇΓöÇ types/journey.ts              # JourneyRole, JourneyEmployee, JourneyEscalation
Γö£ΓöÇΓöÇ data/employees.ts             # SEED_EMPLOYEES (5)
Γö£ΓöÇΓöÇ data/modules.ts               # ALL_MODULES, modulesForRole()
Γö£ΓöÇΓöÇ stores/journeyStore.ts        # LMS state + audit hooks
ΓööΓöÇΓöÇ utils/escalation.ts           # Γÿà Due dates + evaluateEscalations
    escalation.test.ts
```

---

## 5. Core types

### 5.1 `User` (identity person)

```ts
// src/policy/security/identity/types.ts
interface User {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  source?: 'manual-provisioned' | 'seed' | 'authenticated';
  authSubject?: string;
  provider?: string;
  createdAt?: string;
  lastLoginAt?: string;
}
```

**There is no `role` field on `User`.**  
Journey clinical/ops role lives on `UserSetupAssignment.role`.  
Permission role/group lives on `RoleAssignment.groupId` ΓåÆ `UserGroup`.

### 5.2 `RoleAssignment`

```ts
interface RoleAssignment {
  id: string;
  userId: string;
  groupId: string;          // e.g. 'grp-super-admin'
  scope: Scope;             // { organizationId, branchId?, ... }
  effectiveFrom: string;
  effectiveTo?: string;
  revokedAt?: string;
}
```

Active assignment = not revoked and effective window contains ΓÇ£nowΓÇ¥.

### 5.3 `UserSetupAssignment` (journey-shaped side record)

```ts
// src/policy/security/identity/userSetupAssignments.ts
interface UserSetupAssignment {
  userId: string;
  role: JourneyRole | null;       // ADM | DON | RN | LVN | PT | ... | HHA
  discipline?: string;
  supervisorId: string | null;    // identity User.id of supervisor
  hireDate?: string;              // ISO date
  firstDay?: string;              // maps to JourneyEmployee.startDate
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiry?: string;
  appendixFCleared?: boolean;
  clearedForIndependentWork?: boolean;
  onboarding: OnboardingTrackAssignment | null;
  journeyEmployeeSeedRef?: string; // e.g. 'EMP-1001'
  active: boolean;                 // false when soft-deactivated
  createdAt: string;
  updatedAt: string;
}

type UserAssignment = UserSetupAssignment; // plan alias
```

### 5.4 `OnboardingTrackAssignment`

```ts
interface OnboardingTrackAssignment {
  trackId: string;                 // e.g. 'role-RN'
  journeyRole: JourneyRole;
  moduleIds: string[];             // usually modulesForRole(role)
  assignedAt: string;
  dueDate?: string;                // default firstDay + 60 days
  moduleDueDates?: Record<string, string>;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'deferred';
}
```

### 5.5 `UserSetupFieldsPayload`

Partial patch accepted by `addUser`/`editUser` (`setup?:`) and `setSetupAssignment`.

### 5.6 `JourneyRole` vocabulary

```ts
type JourneyRole =
  | 'ADM' | 'DON' | 'RN' | 'LVN'
  | 'PT' | 'PTA' | 'OT' | 'COTA'
  | 'SLP' | 'MSW' | 'HHA';
```

Defined in `src/policy/journey/types/journey.ts`.  
**Do not invent free-form role strings** for setup; use this union.

### 5.7 `UserSetupAuditEntry`

```ts
interface UserSetupAuditEntry {
  id: string;
  actorUserId: string;
  action: UserSetupAuditAction;
  targetUserId?: string;
  detail?: string;
  createdAt: string;   // ALWAYS createdAt ΓÇö never `at`
}
```

Actions:

| Action | Source |
|--------|--------|
| `addUser` | identity store |
| `editUser` | identity store |
| `deleteUser` | identity store (soft deactivate) |
| `setSetupAssignment` | identity store |
| `appendixFSign` | journeyStore |
| `supervisedVisitSave` | journeyStore |
| `acknowledgeEscalation` | journeyStore |
| `resolveEscalation` | journeyStore |

### 5.8 Payload types for CRUD

```ts
interface AddUserPayload {
  name: string;
  email: string;              // must be @careindeed.com
  groupId: string;
  status: 'active' | 'pending' | 'suspended';
  sendInvite?: boolean;       // UI flag only today
  setup?: UserSetupFieldsPayload;
}

interface EditUserPayload {
  name?: string;
  email?: string;
  groupId?: string;
  status?: 'active' | 'pending' | 'suspended';
  setup?: UserSetupFieldsPayload;
}

interface CrudResult {
  ok: boolean;
  error?: string;
}
```

---

## 6. Identity registry store

**File:** `src/policy/security/identity/userAssignmentsStore.ts`  
**Hook:** `useUserAssignmentsStore`  
**Comment in code:** demo/local-only, no backend.

### 6.1 State shape

```ts
interface UserAssignmentsState {
  users: User[];
  assignments: RoleAssignment[];
  setupAssignments: Record<string, UserSetupAssignment>;
  auditLog: UserSetupAuditEntry[];   // Phase 2E

  getUserById(userId: string): User | undefined;
  getActiveAssignmentsForUser(userId: string, atIso?: string): RoleAssignment[];
  getRegistrySnapshot(): IdentityRegistrySnapshot;

  getSetupAssignment(userId: string): UserSetupAssignment | undefined;
  getAllSetupAssignments(): UserSetupAssignment[];
  setSetupAssignment(userId, patch, actorUserId?): CrudResult;

  appendAudit(input): UserSetupAuditEntry;
  getRecentAudit(limit?: number): UserSetupAuditEntry[];

  hydrateRegistry(snapshot): void;
  upsertAuthenticatedUser(authUser, nowIso?): User | null;
  addUser(payload, actorUserId?): CrudResult;
  editUser(userId, currentUserId, payload): CrudResult;
  deleteUser(userId, currentUserId): CrudResult;
}
```

### 6.2 Persistence

| Item | Value |
|------|--------|
| localStorage key | `ci.identityRegistry.v1` (constant `IDENTITY_REGISTRY_STORAGE_KEY`) |
| Internal version | `2` (`IDENTITY_REGISTRY_VERSION`) |
| Payload | `{ version, updatedAt, users, assignments, setupAssignments }` |
| Audit key | **Separate** `ci.identitySetupAudit.v1` |

**v1 ΓåÆ v2 migration:** blobs without `setupAssignments` get `buildSeedSetupAssignments()`, then any partial map is overlaid. Every known user is guaranteed a setup row after migrate.

### 6.3 Business rules (CRUD)

| Rule | Behavior |
|------|----------|
| Email domain | Must end with `@careindeed.com` |
| Email unique | Normalized lowercase compare |
| Protected user | `demo-user-careindeed` cannot be edited or deleted |
| Self-delete | Actor cannot `deleteUser` self |
| Last Super Admin | Cannot soft-delete last active `grp-super-admin` assignment |
| Soft delete | `status ΓåÆ suspended`, revoke assignments, `setup.active ΓåÆ false` |
| Group change | Updates active `RoleAssignment.groupId` or creates one |
| Setup on add | Optional `setup`; else default setup row created |
| Setup on role change | If role changes without explicit `onboarding`, track rebuilt via `buildOnboardingTrackForRole` |
| Auth upsert | Merges `DemoUser` into registry; may downgrade inherited privileged groups for non-exempt users |

### 6.4 Non-React accessors

Prefer these outside components / in adapters:

```ts
import {
  getLiveUserById,
  getLiveActiveAssignments,
  getIdentityRegistrySnapshot,
  hydrateIdentityRegistry,
  upsertAuthenticatedAppUser,
  getLiveSetupAssignment,
  getLiveAllSetupAssignments,
  setLiveSetupAssignment,
  appendUserSetupAudit,
  getRecentUserSetupAudit,
  rehydrateIdentityRegistryFromStorage, // tests
  IDENTITY_REGISTRY_STORAGE_KEY,
  IDENTITY_REGISTRY_VERSION,
} from '@/policy/security/identity';
// or from './userAssignmentsStore'
```

### 6.5 React usage pattern

```tsx
import { useUserAssignmentsStore } from '@/policy/security/identity';

function Example() {
  const users = useUserAssignmentsStore(s => s.users);
  const setupAssignments = useUserAssignmentsStore(s => s.setupAssignments);
  const addUser = useUserAssignmentsStore(s => s.addUser);
  const getSetupAssignment = useUserAssignmentsStore(s => s.getSetupAssignment);

  const rnSetup = getSetupAssignment('usr-rn');
  // ...
}
```

**Subscription tip:** select only slices you need so unrelated edits do not re-render entire admin trees. `useFeatureAccess` already rev-subscribes to `users` + `assignments`.

---

## 7. User setup assignments

**File:** `src/policy/security/identity/userSetupAssignments.ts`

### 7.1 Helpers

| Function | Purpose |
|----------|---------|
| `buildOnboardingTrackForRole(role, opts?)` | Catalog track: `modulesForRole` + dueDate = firstDay + 60d |
| `createDefaultSetupAssignment(userId, partial?, now?)` | Full row constructor |
| `normalizeSetupAssignment(input)` | Safe clone / defaults |
| `mergeSetupAssignment(existing, userId, patch, now?)` | Patch merge + roleΓåÆtrack refresh |
| `buildSeedSetupAssignments(now?)` | Map for all `DEMO_USERS` |
| `toJourneyEmployeeOverlap(user, setup)` | Structural bridge fields for adapters/tests |
| `getDirectReportUserIds(map, supervisorUserId)` | Active reports by `setup.supervisorId` |

### 7.2 Role ΓåÆ modules

Module ids come from **existing** journey catalog ΓÇö never hand-copy lists in admin UI:

```ts
import { modulesForRole } from '@/policy/journey/data/modules';
import { buildOnboardingTrackForRole } from '@/policy/security/identity';

const track = buildOnboardingTrackForRole('RN', { firstDay: '2026-04-20' });
// track.moduleIds === modulesForRole('RN').map(m => m.id)
// track.dueDate === firstDay + 60 calendar days (UTC date string)
```

### 7.3 Changing a userΓÇÖs journey role

```ts
useUserAssignmentsStore.getState().setSetupAssignment('usr-rn', {
  role: 'LVN',
  firstDay: '2026-04-20',
  // onboarding omitted ΓåÆ auto rebuild track for LVN
}, 'demo-user-careindeed');
```

Or via edit:

```ts
editUser('usr-rn', 'demo-user-careindeed', {
  setup: { role: 'LVN', supervisorId: 'usr-director' },
});
```

### 7.4 Supervisor field semantics

- **Setup layer:** `supervisorId` is an **identity** user id (`usr-director`).
- **Journey seed layer:** employee `supervisorId` is an **EMP** id (`EMP-2001`).
- Supervisor UI may combine **both** filters for demo richness (see ┬º15).

---

## 8. Demo seed data

### 8.1 Identity users (`DEMO_USERS`)

**File:** `src/policy/security/identity/demoUsers.ts` ΓÇö **18 users**.  
Do not invent a parallel cast for User Setup demos; extend this list if you need more people.

Notable ids:

| id | name | typical group (via ROLE_ASSIGNMENTS) |
|----|------|--------------------------------------|
| `demo-user-careindeed` | TJ Padilla | Super Admin (protected) |
| `usr-admin` / `usr-deeb-admin` | Admin personas | Admin |
| `usr-rn` / `usr-lvn` / `usr-chha` | Clinical | Clinician groups |
| `usr-director` | DON | Leadership |
| `usr-executive` | Executive | Executive |
| `usr-suspended` | Sam Suspended | status suspended |

### 8.2 Setup seed highlights

From `SEED_SETUP_META` in `userSetupAssignments.ts`:

| userId | role | supervisorId | journeyEmployeeSeedRef |
|--------|------|--------------|------------------------|
| `demo-user-careindeed` | ADM | null | EMP-3001 |
| `usr-rn` | RN | usr-director | EMP-1001 |
| `usr-lvn` | LVN | usr-director | EMP-1003 |
| `usr-chha` | HHA | usr-director | EMP-1002 |
| `usr-director` | DON | usr-executive | EMP-2001 |
| `usr-suspended` | RN | usr-director | (active: false) |

### 8.3 Journey employees (`SEED_EMPLOYEES`)

**File:** `src/policy/journey/data/employees.ts` ΓÇö **5 people**.  
Comment remains: *Replace with API-backed directory in production.*

| EMP id | Name | Role | supervisorId |
|--------|------|------|--------------|
| EMP-1001 | Maria Santos, RN | RN | EMP-2001 |
| EMP-1002 | Grace Abella, HHA | HHA | EMP-2001 |
| EMP-1003 | Jonathan Park, LVN | LVN | EMP-2001 |
| EMP-2001 | Dr. Elena Navarro, RN DON | DON | null |
| EMP-3001 | Robert Cruz, Administrator | ADM | null |

Default `journeyStore.currentEmployeeId` = **EMP-1001**.

---

## 9. Permissions, groups, authorize

### 9.1 Groups

**File:** `userGroups.ts`  
Groups have stable ids like `grp-super-admin` and a closed `name` union.  
Each group lists `PermissionId[]` from `permissionCatalog.ts`.

### 9.2 `authorize`

```ts
import { authorize } from '@/policy/security/identity';

const decision = authorize(userId, 'user.provision', {
  kind: 'user',
  id: targetUserId,
});
// decision.allow, decision.reasonCode, decision.obligations
```

Uses live registry via `getLiveUserById` / `getLiveActiveAssignments`.

### 9.3 Feature access

`src/policy/security/features/featureAccess.ts` + `useFeatureAccess.ts` subscribe to the identity store so admin group edits recompute features.

### 9.4 Soft admin UI gates (v6)

**File:** `src/v6/utils/adminRoleHelper.ts`

```ts
ADMIN_ROLES = ['admin', 'owner', 'security', 'system_admin', 'super_admin']
isAdminRole(roleString)
canManageCommunityProfiles(user)
canManageAdminUsers(user)          // AdminUsersScreen
isDemoAdminAccess({ role, groupNames })
```

**Important:** `useAuth()` currently always returns role `"Administrator"`, so these gates usually pass. They are **scaffolding**, not security.

### 9.5 Missing components (do not import)

Phase 2E removed broken barrel re-exports. These are **not** implemented modules:

- `AccessDeniedPage`
- `AdminRouteGuard`
- `PageAccessRouteGuard`
- `PageAccessMatrix`
- Feature barrel: `FeatureGate` / `FeatureRouteGuard` (if previously re-exported)

Implement real route guards only when UI exists or in 2F.

---

## 10. Page access matrix

Separate from User Setup roster, but same identity subsystem:

| File | Role |
|------|------|
| `pageRegistry.ts` | Catalog of pages/components |
| `pageAccessStore.ts` | Per-user grants + `audit` array (page_access_updated) |
| `pageAccess.ts` | `canViewPage`, `canWritePage`, `canManagePageAccess` |

Page-access audit is **not** the same store as `userSetupAudit`. Do not merge them casually.

---

## 11. User-setup audit log

**Files:** `userSetupAudit.ts` + store `auditLog` / `appendAudit`

### Constants

```ts
USER_SETUP_AUDIT_STORAGE_KEY = 'ci.identitySetupAudit.v1'
MAX_USER_SETUP_AUDIT_ENTRIES = 200
USER_SETUP_AUDIT_DEMO_LABEL = 'Demo audit trail ΓÇö not tamper-evident'
```

### Rules for developers

1. Always set **`createdAt`**, never `at`.
2. Label UI and comments with the demo honesty string.
3. Successful mutations only are audited (failed `CrudResult` should not log).
4. Cap at 200 newest entries.
5. **Not** hash-chained (unlike `src/policy/security/auditLog.ts`).

### Append from non-store code

```ts
import { appendUserSetupAudit } from '@/policy/security/identity';

appendUserSetupAudit({
  actorUserId: 'demo-user-careindeed',
  action: 'supervisedVisitSave',
  targetUserId: 'EMP-1001', // or identity id ΓÇö document in detail
  detail: 'Supervised visit recorded for EMP-1001',
});
```

Journey store already calls this for Appendix F, visits, and escalation ack/resolve.

### Read in UI

```ts
const recent = useUserAssignmentsStore(s => s.getRecentAudit(40));
// newest first
```

Admin Users **Audit** tab renders this list.

---

## 12. Admin Users UI

**File:** `src/v6/screens/pageviews/AdminUsersScreen.tsx`  
**Route:** `/admin/users`  
**hashId:** `admin-users`  
**Nav:** Admin ΓåÆ Users  

### 12.1 What it does

| Feature | Implementation |
|---------|----------------|
| Roster | `users` Γ¿¥ active group assignment Γ¿¥ `setupAssignments` |
| Metrics | Live counts: active, suspended, privileged groups, supervised |
| Create | Form ΓåÆ `addUser({ name, email, groupId, status, setup })` |
| Edit | Form ΓåÆ `editUser(id, DEMO_ACTOR, { ΓÇª, setup })` |
| Deactivate | `deleteUser` soft-delete |
| Setup fields | role, discipline, supervisor, firstDay, hireDate, onboarding track |
| Audit tab | `getRecentAudit` + honesty label |
| Gate | `canManageAdminUsers(useAuth().user)` ΓÇö soft |
| Banners | Demo/localStorage directory; Demo impersonation actor |

### 12.2 Demo actor

```ts
const DEMO_ACTOR_USER_ID = 'demo-user-careindeed';
```

Used as `currentUserId` for edit/delete authorization inside the store.  
UI must keep the **Demo impersonation ΓÇö not a real session** label near actor context.

### 12.3 Tabs (aside)

Typically: security summaries / assignments lanes / **live audit** (static override matrix removed in favor of real setup editor).

### 12.4 What it does **not** do

- Does not call `src/auth/api.ts` HTTP methods
- Does not mutate `SEED_EMPLOYEES` / journeyStore employees
- Does not fix `JourneyAdminScreen` static syllabus/metrics (still mostly cosmetic except escalations tab)

---

## 13. Demo impersonation

**File:** `src/policy/journey/components/DemoImpersonationBar.tsx`

### Behavior

1. Lists options from `journeyStore.employees` + setup seed refs.
2. On change ΓåÆ `setCurrentEmployee(empId)` (always EMP-* when possible).
3. Always shows: **`Demo impersonation ΓÇö not a real session`**.
4. Shows current learner name + optional identity hint.

### Where mounted

- `JourneyAcademyScreen`
- `SupervisorScreen`
- (Add elsewhere carefully; keep the honesty banner)

### Programmatic options builder

```ts
import {
  DemoImpersonationBar,
  buildDemoImpersonationOptions,
  DEMO_IMPERSONATION_LABEL,
} from '@/policy/journey/components/DemoImpersonationBar';
```

### Not real auth

This does **not** change `useAuth().user`. Completions attach to `currentEmployeeId` in journey store only.

---

## 14. Journey integration

### 14.1 Adapter API (`journeyProfileAdapter.ts`)

| Export | Use |
|--------|-----|
| `DEMO_JOURNEY_EMPLOYEE_MAP` | identity/auth ΓåÆ EMP |
| `JOURNEY_EMPLOYEE_TO_IDENTITY` | EMP ΓåÆ primary identity |
| `resolveJourneyEmployeeId(userId)` | safe EMP resolution |
| `resolveIdentityUserIdFromEmployee(empId)` | reverse |
| `getAssignedModuleIdsForEmployee(empId, role?)` | onboarding.moduleIds or modulesForRole |
| `isModuleAssignedToEmployee(empId, moduleId, role?)` | empty assignment ΓåÆ allow (no hard block) |
| `getJourneyProfileAchievements(userId)` | positive-only profile chips |

### 14.2 Journey Academy

- Uses impersonation bar.
- Module tiles prefer assignment module ids for current EMP / identity bridge.
- Completion stats filter attempts/evidence by `currentEmployeeId` (not global aggregate).

### 14.3 Module Player (partial)

- Soft **assignment banner** when module is outside assignment list.
- Completions still write with `journeyStore.currentEmployeeId`.
- **Does not** re-enable full `canStartModule` hard gates (explicit 2C scope cut).
- `gating.ts` logic intentionally unchanged for input-only wiring rule.

### 14.4 Linking a new identity user to journey demos

1. Add/create identity user with `@careindeed.com` email.
2. `setSetupAssignment` with `role`, `supervisorId`, `firstDay`.
3. Optionally set `journeyEmployeeSeedRef` to an existing EMP, **or**
4. Extend `SEED_EMPLOYEES` + maps if you need a new EMP learner record (larger change).
5. Update `DEMO_JOURNEY_EMPLOYEE_MAP` / reverse map if the user should resolve for profile achievements.

---

## 15. Supervisor filtering

**File:** `SupervisorScreen.tsx`

### Expected demo path

1. Open Supervisor route.
2. Impersonate **EMP-2001** (DON / `usr-director`).
3. Employee dropdown shows direct reports only (seed: EMP-1001, EMP-1002, EMP-1003).

### Filter logic (conceptual)

- Acting EMP from `currentEmployeeId`.
- Journey reports: `employees.filter(e => e.supervisorId === actingEmpId)`.
- Identity reports: `getDirectReportUserIds(setupAssignments, identitySupervisorId)` then map to EMP via seed refs.
- Combined for demo richness; do not drop journey-only reports.

### Visit records

Supervised visits should record **acting EMP** as supervisor id (not hardcoded `SUP-001`). If you see `SUP-001` in old data, treat as pre-2C residue.

---

## 16. Deadlines and escalations

### 16.1 Engine

**File:** `src/policy/journey/utils/escalation.ts`

| Helper | Purpose |
|--------|---------|
| `quarterEndDate(year, Q1\|Q2\|Q3\|Q4)` | Mar 31 / Jun 30 / Sep 30 / Dec 31 local noon |
| `resolveModuleDeadline(module, employee, now)` | Per-module due date |
| `evaluateEscalations(ctx)` | Build open tickets |
| `moduleDeadlineStatus` / `humanEscalation` | Display helpers |

**Due-date formula (stakeholder-visible behavior change from universal Dec 31):**

1. **`annualQuarter` set** ΓåÆ that quarterΓÇÖs end in the **current calendar year**.
2. **No quarter** (typical COMP annual) ΓåÆ hire/firstDay anniversary cycle.
3. **`COMP-90DAY`** ΓåÆ anchor + 90 days.

Overdue tiers still: **30 / 45 / 60** days past deadline ΓåÆ `OVERDUE_30|45|60`.

**Licenses:** `JourneyEmployee.licenseExpiry` ΓåÆ `LICENSE_EXPIRING_120` / `LICENSE_EXPIRED`.

### 16.2 Store merge

`journeyStore.recomputeEscalations()`:

- Calls `evaluateEscalations`.
- Preserves existing ticket status for same ids (Ack/Resolved not clobbered).
- Invoked after completions, Appendix F, remediations, etc.

### 16.3 UI

**Route:** `/journey/admin?tab=escalations`  
**File:** `JourneyAdminScreen.tsx` tab `'escalations'`

- Lists `journeyStore.escalations`.
- **Acknowledge** ΓåÆ `acknowledgeEscalation(id, actor)` (+ audit).
- **Resolve** ΓåÆ `resolveEscalation(id, actor)` (+ audit).

Other Journey Admin tabs (syllabus, governance, etc.) may still be **static/cosmetic**.

### 16.4 Stakeholder note

Mid-year demos will show **more overdue tickets earlier** than the old Dec-31-only engine. That is intentional Phase 2D behavior.

---

## 17. Appendix F signatures

**File:** `AppendixFScreen.tsx`

### Rule (fixed pre-2E)

Do **not** default blank signer name to `employee.name` (self-signing HR attestation).

Helper pattern: `prepareAppendixFSignature` rejects blank/whitespace with an explicit error requiring HR Director full name. Role still constrained (e.g. HRDirector). Checklist PASS/NA still required.

Regression: `journey-p0-reuat.test.ts` ΓåÆ **P0-004b**.

Signing also appends `appendixFSign` to the demo user-setup audit log via journeyStore.

---

## 18. Auth layer (current vs 2F)

### Current (`AuthProvider.tsx`)

```ts
// Always (including login):
id: "demo-user"
name: "Demo User"
role: "Administrator" // or login role string only
```

- `login(email, role)` does **not** change `id`.
- Missing provider context returns the same hardcoded user (headless safety).
- **No** call to Cognito / `AuthApi` HTTP methods.

### `src/auth/api.ts`

- Defines `DemoUser`, `AuthSession`, identity-registry DTOs, login/challenge types.
- Looks like a real client for `/auth/admin/identity-registry` style endpoints.
- **Type** `DemoUser` is used by identity store; **HTTP methods are not wired** into AuthProvider.

### Infra hint (for 2F recon)

`infra/demo-auth-cdk/` contains Cognito + Lambda routes for identity registry.  
Whether it is deployed in your environment is an ops question ΓÇö see Phase 2F checklist.

---

## 19. Routing and navigation

| Path | hashId | Screen | User-setup relevance |
|------|--------|--------|----------------------|
| `/admin/users` | `admin-users` | AdminUsersScreen | Γÿà Roster CRUD |
| `/admin/user-groups` | `admin-groups` | AdminGroupsScreen | Still largely cosmetic |
| `/admin/roles` | `admin-roles` | AdminRolesScreen | Cosmetic sibling |
| `/admin/permissions` | `admin-permissions` | AdminPermissionsScreen | Cosmetic sibling |
| `/admin/community-profiles` | ΓÇª | AdminCommunityProfilesScreen | Soft admin gate pattern |
| `/journey` (academy) | `journey-overview` | JourneyAcademyScreen | Impersonation + modules |
| `/journey/...` supervisor | `supervisor` | SupervisorScreen | Filter + impersonation |
| `/journey/admin` | `journey-admin` | JourneyAdminScreen | `?tab=escalations` |
| Module player routes | `module-player` etc. | ModulePlayerScreen | Soft assignment banner |
| Appendix F | `appendix-f` | AppendixFScreen | Sign + audit |

Registry: `src/v6/routing/routeRegistry.ts`  
Nav: `src/v6/routing/navigationManifest.ts` ΓåÆ Admin ΓåÆ Users  
Mount: `RepresentativeScreens.tsx` switch cases.

---

## 20. localStorage keys and migration

| Key | Owner | Contents |
|-----|-------|----------|
| `ci.identityRegistry.v1` | identity store | users, group assignments, setupAssignments (v2 payload) |
| `ci.identitySetupAudit.v1` | user-setup audit | last Γëñ200 audit entries |
| `ci-journey-v1` | journeyStore | employees, attempts, escalations, currentEmployeeId, ΓÇª |
| `ci-cna-learner-v1` | learnerState | Separate CNA progress ΓÇö **not** identity |
| page access keys | pageAccessStore | grants + page-access audit (see that module) |

### Reset demo identity (dev console)

```js
localStorage.removeItem('ci.identityRegistry.v1');
localStorage.removeItem('ci.identitySetupAudit.v1');
location.reload();
```

### Reset journey learner state

```js
localStorage.removeItem('ci-journey-v1');
location.reload();
```

### Versioning rules for authors

- Prefer **same** registry key with internal `version` bump + migration (as v1ΓåÆv2 did).
- Do **not** invent a fourth parallel store for person records.
- Document any new key in this manual and in code header comments.

---

## 21. API reference (cheatsheet)

### Import surface

```ts
// Preferred barrel
import {
  // types
  type User,
  type RoleAssignment,
  type UserSetupAssignment,
  type UserSetupFieldsPayload,
  type OnboardingTrackAssignment,
  type UserSetupAuditEntry,
  // store
  useUserAssignmentsStore,
  getLiveUserById,
  getLiveSetupAssignment,
  getLiveAllSetupAssignments,
  setLiveSetupAssignment,
  appendUserSetupAudit,
  getRecentUserSetupAudit,
  // setup helpers
  buildOnboardingTrackForRole,
  getDirectReportUserIds,
  toJourneyEmployeeOverlap,
  // audit label
  USER_SETUP_AUDIT_DEMO_LABEL,
  // seeds
  DEMO_USERS,
  USER_GROUPS,
  // authorize
  authorize,
  canViewPage,
} from '@/policy/security/identity';
```

### Journey bridges

```ts
import {
  resolveJourneyEmployeeId,
  getAssignedModuleIdsForEmployee,
  DEMO_JOURNEY_EMPLOYEE_MAP,
  JOURNEY_EMPLOYEE_TO_IDENTITY,
} from '@/v6/utils/journeyProfileAdapter';

import {
  DemoImpersonationBar,
  DEMO_IMPERSONATION_LABEL,
} from '@/policy/journey/components/DemoImpersonationBar';
```

### Escalations

```ts
import {
  evaluateEscalations,
  resolveModuleDeadline,
  quarterEndDate,
} from '@/policy/journey/utils/escalation';

const { recomputeEscalations, acknowledgeEscalation, resolveEscalation } =
  useJourneyStore.getState();
```

---

## 22. How-to recipes

### 22.1 Create a user from code

```ts
const result = useUserAssignmentsStore.getState().addUser(
  {
    name: 'New Clinician',
    email: 'new.clinician@careindeed.com',
    groupId: 'grp-rn', // must exist in USER_GROUPS
    status: 'active',
    setup: {
      role: 'RN',
      supervisorId: 'usr-director',
      firstDay: '2026-07-01',
      hireDate: '2026-06-20',
      discipline: 'Registered Nurse',
    },
  },
  'demo-user-careindeed',
);
if (!result.ok) throw new Error(result.error);
```

### 22.2 Soft-deactivate

```ts
useUserAssignmentsStore.getState().deleteUser('usr-billing', 'demo-user-careindeed');
// status suspended, assignments revoked, setup.active false, audit deleteUser
```

### 22.3 List active RNs with module tracks

```ts
const { users, getSetupAssignment } = useUserAssignmentsStore.getState();
const rns = users
  .filter(u => u.status === 'active')
  .map(u => ({ user: u, setup: getSetupAssignment(u.id) }))
  .filter(row => row.setup?.role === 'RN' && row.setup.active);
```

### 22.4 Switch academy learner to DON

UI: DemoImpersonationBar ΓåÆ EMP-2001.  
Code:

```ts
useJourneyStore.getState().setCurrentEmployee('EMP-2001');
```

### 22.5 Open escalations deep link

Navigate to: `/journey/admin?tab=escalations`  
Ensure `recomputeEscalations()` has run (admin tab does on mount / actions may recompute).

### 22.6 Add a new journey role to Admin UI dropdown

1. Confirm role exists on `JourneyRole` union.
2. Add label in `JOURNEY_ROLE_LABELS` inside `AdminUsersScreen.tsx`.
3. Ensure `modulesForRole(role)` returns modules in `modules.ts`.
4. Seed meta if the role should appear on a DEMO_USER by default.

### 22.7 Wire a new screen to setup data

```tsx
const setup = useUserAssignmentsStore(s => s.getSetupAssignment(userId));
const modules = setup?.onboarding?.moduleIds ?? [];
// Always show demo/local disclaimer if you surface setup as ΓÇ£directoryΓÇ¥
```

---

## 23. Testing

### Commands

```bash
# Identity store + setup + audit
npx vitest run src/policy/security/identity/userAssignmentsStore.test.ts

# Escalation due dates / license tiers
npx vitest run src/policy/journey/utils/escalation.test.ts

# Appendix F signer + journey P0
npx vitest run src/policy/journey/journey-p0-reuat.test.ts

# Typecheck (never emit JS into src/)
npx tsc -p tsconfig.app.json --noEmit
```

**Forbidden:** bare `tsc <file>` that emits `.js` next to `.tsx` (see `Agents.md` #1 rule).

### Test patterns

- `beforeEach`: `localStorage.clear(); rehydrateIdentityRegistryFromStorage();`
- Assert registry version 2 and setup rows for every `DEMO_USERS` id.
- Assert audit entries have `createdAt` and correct `action`.
- Structural parity: `toJourneyEmployeeOverlap` fields align with `JourneyEmployee` picks.

### Manual UAT checklist

| # | Step | Expected |
|---|------|----------|
| 1 | Open `/admin/users` | Live DEMO_USERS names, not Brad/Tina fiction |
| 2 | Create `@careindeed.com` user | Appears in table; survives hard refresh |
| 3 | Edit role/supervisor/firstDay | Persists; audit tab shows editUser / setSetup |
| 4 | Deactivate | Suspended; excluded from active metrics; audit deleteUser |
| 5 | Academy impersonate EMP-1001 | Modules/stats for that learner |
| 6 | Supervisor as EMP-2001 | Only 3 reports (seed) |
| 7 | `/journey/admin?tab=escalations` | Tickets; Ack/Resolve stick after refresh |
| 8 | Appendix F blank signer | Error; no employee-name default |
| 9 | Honesty banners | Demo directory / impersonation / audit labels visible |

---

## 24. UX labels and honesty requirements

Whenever you ship UI that touches identity simulation or local persistence, include the matching label:

| Context | Required copy |
|---------|----------------|
| Admin directory | Demo / localStorage only ΓÇö not a production directory |
| Learner switcher | **Demo impersonation ΓÇö not a real session** |
| Audit tab / log | **Demo audit trail ΓÇö not tamper-evident** |
| Escalations data | Demo seed / local journey store until 2F |
| ACHC completion math | UAT-only until backend personnel/evidence (existing code comments) |

Constants:

```ts
DEMO_IMPERSONATION_LABEL  // DemoImpersonationBar
USER_SETUP_AUDIT_DEMO_LABEL // userSetupAudit.ts
```

---

## 25. Known limitations and non-goals

1. **Not production security** ΓÇö Auth stub, client gates, editable localStorage.
2. **Three person models remain** ΓÇö identity User, JourneyEmployee, WorkforceMember (onboarding-v2).
3. **ID bridge is partial** ΓÇö unmapped users get empty achievements / no EMP learner record.
4. **ModulePlayer hard gates not restored** ΓÇö assignment is soft guidance.
5. **Journey Admin** still mostly static outside escalations tab.
6. **Admin Groups/Roles/Permissions** screens not fully wired to live identity groups.
7. **No route-level PageAccess guards** shipped as components.
8. **Signature capture** still lacks real png/ip/userAgent binding (2F).
9. **Nolan** not a consumer of setup data in this work.
10. **onboarding-v2** engine still largely unwired; do not silently inherit its `a.at` audit field bug.

---

## 26. Phase 2F readiness checklist

Use this when starting production identity work:

- [ ] Confirm whether `infra/demo-auth-cdk` is deployed and which API base URL the SPA should use
- [ ] Wire `AuthProvider` to real session (tokens); remove hardcoded fallback for production builds
- [ ] Decide canonical server entity for person (map/migrate EMP-* vs usr-*)
- [ ] Replace `userAssignmentsStore` persistence with API (keep Zustand as cache if desired)
- [ ] Server-enforce: provision, suspend, Appendix F sign, clear-for-independent-work
- [ ] Bind signatures to authenticated subject + capture metadata
- [ ] Replace demo audit with append-only server audit (or adopt hardened `security/auditLog` with persistence)
- [ ] Export/import path for pilot localStorage data if needed
- [ ] Lift or reconfirm ACHC UAT-only comment in `achcTrainingCalculations`
- [ ] Data-handling / PII review signed off before real employee data

---

## 27. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Admin still shows Brad/Tina | Stale build or wrong branch | Confirm `AdminUsersScreen` imports `useUserAssignmentsStore`; hard refresh |
| Changes vanish on reload | localStorage blocked / private mode | Check Application ΓåÆ Local Storage key `ci.identityRegistry.v1` |
| Setup missing after old cache | v1 blob without migration run | Reload once; or clear key and reseed |
| Supervisor sees everyone | Impersonating EMP without reports, or filter bypassed | Impersonate EMP-2001; confirm filter code path |
| Completions on wrong person | `currentEmployeeId` still EMP-1001 | Use DemoImpersonationBar before training |
| `authorize` denies unexpectedly | No active group assignment | Check `assignments` for userId; grant group in Admin Users |
| tsc fails on AccessDeniedPage | Stale import of removed barrel symbols | Import only exported modules from `identity/index.ts` |
| UI ΓÇ£does nothingΓÇ¥ after TS edit | Stale emitted `.js` shadowing `.tsx` | Run `npm run dev` (predev cleans); never emit into `src/` |
| Audit empty | Looking at pageAccess audit or wrong key | Use `ci.identitySetupAudit.v1` / Admin Users Audit tab |
| Escalations always empty | Not recomputed / all resolved preserved | Trigger recompute; use new ticket ids only for reopen |
| Email create fails | Not `@careindeed.com` | Domain validation in store |

---

## 28. Related documents

| Document | Path |
|----------|------|
| Implementation plan (phases 2AΓÇô2F) | `UAT_Reports/USER_SETUP_PHASE1_SCOPE_2026-07-09_122306/USER_SETUP_IMPLEMENTATION_PLAN.md` |
| Exec summaries 2AΓÇô2E | same folder `exec-summary-2*.md` |
| Final exec summary | `exec-summary-FINAL.md` |
| Recon 2C / 2BDE | `exec-recon-2C.md`, `exec-recon-2BDE.md` |
| Agent repo rules | `Agents.md` |
| V6 app map | `docs/v6/V6_APP_MAP.md` |

---

## Appendix A ΓÇö Component ownership matrix

| Component / module | Primary owner phase | Consumers |
|--------------------|---------------------|-----------|
| `User` + group CRUD | pre-2A / identity | featureAccess, authorize, AdminUsers |
| `UserSetupAssignment` | 2A | AdminUsers, Academy, Supervisor, adapter |
| `userSetupAudit` | 2E | AdminUsers, journeyStore hooks |
| `AdminUsersScreen` | 2B / 2E | Operators (demo) |
| `DemoImpersonationBar` | 2C | Academy, Supervisor |
| `journeyProfileAdapter` maps | 2C | Profile, Academy, Player helpers |
| `escalation.ts` | 2D | journeyStore, JourneyAdmin tab |
| `adminRoleHelper` | 2E soft | AdminUsers, Community Profiles |
| `AuthProvider` | pre / 2F | entire app (stub) |

---

## Appendix B ΓÇö File touch guide for common tasks

| Task | Touch first |
|------|-------------|
| New setup field | `userSetupAssignments.ts` types + merge + seed; store payload version if persisted shape breaks; AdminUsers form; tests |
| New audit action | `UserSetupAuditAction` union; call `appendUserSetupAudit` at mutation site; AdminUsers display if needed |
| New demo user | `demoUsers.ts` + `roleAssignments.ts` + `SEED_SETUP_META` + optional EMP/map |
| New EMP learner | `employees.ts` + maps in adapter + optional setup seed ref |
| Change deadline math | `escalation.ts` + `escalation.test.ts` + stakeholder note |
| Wire another screen to roster | Prefer `useUserAssignmentsStore`; never hardcode person names |

---

## Appendix C ΓÇö Glossary

| Term | Meaning |
|------|---------|
| **Identity registry** | The Zustand store + localStorage blob for users/groups/setup |
| **Setup assignment** | Journey-shaped side record keyed by identity user id |
| **Group assignment** | `RoleAssignment` linking user ΓåÆ permission group |
| **Soft deactivate** | Suspend + revoke groups + `setup.active=false` (row retained) |
| **Demo impersonation** | UI that sets journey `currentEmployeeId` without real auth |
| **EMP bridge** | Mapping between `usr-*` and `EMP-*` for demo LMS |
| **Tamper-evident** | Cryptographic / server append-only audit ΓÇö **not** this demo log |
| **Phase 2F** | Real IdP + API + server gates |

---

*End of User Setup & Identity Developer Manual.*  
*When code drifts, update this file in the same PR as the component change.*
