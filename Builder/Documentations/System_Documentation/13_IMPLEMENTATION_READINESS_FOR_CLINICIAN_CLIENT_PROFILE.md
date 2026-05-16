# 13 — Implementation Readiness: Clinician Profiles, Client Profiles, and Clinician-Client Connection Layer

**Generated:** 2026-05-12

---

## Purpose

This document assesses the current codebase's readiness to support a new feature: **Clinician Profiles**, **Client Profiles**, and a **Clinician-Client Connection Layer**. It identifies what exists, what can be reused, where new files should be added, and risks to address before implementation.

---

## Current State Assessment: What Exists That Could Support This Feature

### Existing Infrastructure That Can Be Reused

| Existing Element | Location | How It Applies |
|---|---|---|
| Auth system (Cognito) | `src/auth/`, `server/auth/` | Clinicians can have authenticated accounts linked to their profile |
| DynamoDB access | `server/` | Client and clinician profile data should live in DynamoDB |
| Identity / RBAC | `src/policy/security/identity/` | Clinician role can be added to permission catalog |
| User groups system | `src/policy/security/identity/userGroups.ts` | New "Clinician" user group can be added |
| Role assignments | `src/policy/security/identity/roleAssignments.ts` | Clinician role assignment pattern already modeled |
| Employee types | `src/policy/journey/data/employees.ts` | Static employee data shows the concept — real clinician data should replace/extend this |
| Journey module gating | `src/policy/journey/utils/gating.ts` | Clinician training compliance requirements can use existing gate logic |
| eCIgn signature system | `src/policy/ecign/`, `server/ecign/` | Clinician-Client agreements and consent forms can use eCIgn |
| Form system | `src/policy/data/formsCatalog.ts`, `FormViewer.tsx` | Client intake forms and clinician assignment forms can use existing form structure |
| Evidence model | `src/policy/evidence/evidenceModel.ts` | Clinician credential evidence (licenses, certifications) fits this model |
| Onboarding V2 | `src/policy/onboarding-v2/` | Clinician onboarding (required training, policy acknowledgment) maps to onboarding V2 |
| PM task projection | `src/policy/pm/taskProjection.ts` | Clinician assignment tasks can be projected into PM layer |
| Notification system | `src/policy/pm/notificationStore.ts`, `notificationTicker.ts` | Clinician-Client match notifications can use existing notification pattern |
| CES execution | `src/policy/ces/` | Clinician compliance (license renewals, TB tests, etc.) can become CES events |
| User profile architecture | `Builder/UserProfiles/Architecture` | 936-line architecture document — review before designing profile schema |

---

## What Does Not Exist

| Needed Element | Current Status |
|---|---|
| `Clinician` data model / TypeScript type | Does not exist |
| `Client` data model / TypeScript type | Does not exist |
| `ClinicianClientAssignment` model | Does not exist |
| Clinician profile page/route | Does not exist |
| Client profile page/route | Does not exist |
| Clinician-Client connection page/route | Does not exist |
| DynamoDB table for clinician/client data | Does not exist |
| Server routes for `/api/clinicians/*` | Does not exist |
| Server routes for `/api/clients/*` | Does not exist |
| Clinician credential tracking | Does not exist |
| Client care plan linkage | Does not exist |
| HR system integration | Does not exist |

---

## Recommended Data Model Integration Points

### New TypeScript Types (Location: `src/policy/clinician/types.ts` and `src/policy/client/types.ts`)

```typescript
// src/policy/clinician/types.ts
export interface Clinician {
  id: string;                          // Cognito sub or internal ID
  userId: string;                      // Links to auth user
  firstName: string;
  lastName: string;
  email: string;
  role: ClinicianRole;                 // RN, LVN, HHA, PT, OT, etc.
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiresAt?: string;
  certifications: ClinicianCertification[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  hireDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicianCertification {
  type: string;                        // CPR, TB test, etc.
  issuedAt: string;
  expiresAt?: string;
  evidenceRef?: string;                // EcignEvidence.evidence_id
}

// src/policy/client/types.ts
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;               // ⚠️ PHI — requires encryption
  primaryDiagnosis?: string;          // ⚠️ PHI — requires encryption
  address?: ClientAddress;            // ⚠️ PHI
  status: 'active' | 'inactive' | 'discharged' | 'pending';
  admissionDate?: string;
  dischargeDate?: string;
  assignedClinicianIds: string[];     // FK → Clinician.id[]
  createdAt: string;
  updatedAt: string;
}

// src/policy/clinician/types.ts (continued)
export interface ClinicianClientAssignment {
  id: string;
  clinicianId: string;                // FK → Clinician.id
  clientId: string;                   // FK → Client.id
  startDate: string;
  endDate?: string;
  primaryClinician: boolean;
  status: 'active' | 'ended';
  assignedBy: string;                 // user ID of assigning admin
  createdAt: string;
}
```

---

## Where New Files Should Be Added

### Frontend

```
src/policy/clinician/
├── types.ts                          ★ Clinician TypeScript types
├── stores/
│   └── clinicianStore.ts             Zustand store for clinician data
├── pages/
│   ├── ClinicianListPage.tsx         /clinicians — list view
│   └── ClinicianDetailPage.tsx       /clinicians/:clinicianId — detail view
├── components/
│   ├── ClinicianCard.tsx             Clinician list card
│   ├── ClinicianProfilePanel.tsx     Profile detail panel
│   ├── CredentialStatus.tsx          License/cert status display
│   └── AssignmentHistory.tsx         Client assignment history
└── services/
    └── clinicianApi.ts               HTTP client → /api/clinicians/*

src/policy/client/
├── types.ts                          ★ Client TypeScript types
├── stores/
│   └── clientStore.ts                Zustand store for client data
├── pages/
│   ├── ClientListPage.tsx            /clients — list view
│   └── ClientDetailPage.tsx          /clients/:clientId — detail view
├── components/
│   ├── ClientCard.tsx                Client list card
│   ├── ClientProfilePanel.tsx        Profile detail panel
│   └── AssignmentPanel.tsx           Current clinician assignments
└── services/
    └── clientApi.ts                  HTTP client → /api/clients/*
```

### Backend

```
server/clinician/
├── types.ts
├── routes.ts                         /api/clinicians/*
└── service.ts                        DynamoDB CRUD for clinicians

server/client/
├── types.ts
├── routes.ts                         /api/clients/*
└── service.ts                        DynamoDB CRUD for clients
```

---

## Naming Conventions to Follow

Based on observed codebase conventions:

| Convention | Pattern | Example |
|---|---|---|
| TypeScript types | PascalCase interface | `interface Clinician { }` |
| Zustand stores | camelCase file + `Store` suffix | `clinicianStore.ts` |
| React pages | PascalCase + `Page` suffix | `ClinicianListPage.tsx` |
| React components | PascalCase | `ClinicianCard.tsx` |
| API service files | camelCase + `Api` suffix | `clinicianApi.ts` |
| Server routes files | camelCase plural | `clinicians.ts` |
| Route paths | kebab-case plural | `/clinicians`, `/clients` |
| Feature directory | lowercase-kebab under `src/policy/` | `src/policy/clinician/` |
| Types file | `types.ts` in feature root | `src/policy/clinician/types.ts` |

---

## Recommended Data Model Integration Points

| Integration | How |
|---|---|
| CES compliance events | Clinician license renewals, TB tests, annual training → become `ComplianceEvent` with `domain: 'hr'` |
| Journey training | `Clinician.id` replaces static employee IDs in `journeyStore` |
| eCIgn signatures | New hire acknowledgments and client consent forms use existing `FormSigningWorkspace` |
| Onboarding V2 | Clinician onboarding batch uses existing `OnboardingV2` engine with clinician-specific catalog |
| Evidence | `ClinicianCertification.evidenceRef` links to `EcignEvidence.evidence_id` |
| Admin UI | Clinician management page accessible at `/admin/clinicians` behind `AdminRouteGuard` |
| PM tasks | Assignment tasks projected as `PmTask` with `type: 'certification'` |

---

## Risks From Current Architecture

| Risk | Description | Impact |
|---|---|---|
| PHI handling | Client data (DOB, diagnosis, address) is protected health information — requires encryption at rest, audit logging, BAA with cloud providers | Critical |
| Static employee data | `employees.ts` in journey must be migrated to real clinician profiles — existing gating logic must be updated | High |
| In-memory state | New clinician/client stores must be server-backed from day 1 — do not repeat the CES in-memory anti-pattern | High |
| JSONL store | Do not store clinician or client data in JSONL — use DynamoDB with proper table design | High |
| Auth coupling | Clinicians need their own Cognito accounts or an agency-admin can manage on their behalf — design decision needed | Medium |
| Role overlap | `userGroups.ts` and `roleAssignments.ts` have existing role concepts — clinician role must fit consistently | Medium |
| DemoUsers | `demoUsers.ts` has hardcoded personas — clinician profiles should not be hardcoded similarly | Medium |

---

## Phase 1 Implementation Recommendation

**Phase 1 scope: Clinician Profile (read-only + admin management)**

1. **Define `Clinician` TypeScript type** in `src/policy/clinician/types.ts`
2. **Create DynamoDB table** `clinicians` (or extend existing) with partition key `clinician_id`
3. **Create server routes** `server/routes/clinicians.ts` with `GET /api/clinicians` and `GET /api/clinicians/:id`
4. **Create Zustand store** `src/policy/clinician/stores/clinicianStore.ts`
5. **Create list page** `src/policy/clinician/pages/ClinicianListPage.tsx` at route `/clinicians`
6. **Create detail page** `src/policy/clinician/pages/ClinicianDetailPage.tsx` at route `/clinicians/:clinicianId`
7. **Add route guards** — use existing `AdminRouteGuard` for management, read-only access for all authenticated users
8. **Add to sidebar nav** in `CommandCenterLayout`
9. **Link to Journey** — replace static `employees.ts` references with dynamic clinician data

**Defer to Phase 2:**
- Client profiles (higher PHI risk, more complex)
- Clinician-Client assignment layer
- Client intake forms via eCIgn
- Credential compliance events in CES

---

## Files That Must NOT Be Modified in Phase 1

| File | Reason |
|---|---|
| `server/ecign/` | eCIgn is stable — only integrate, don't modify |
| `src/policy/ces/types.ts` | CES types are canonical — extend, don't change |
| `src/policy/pm/types.ts` | PM types are canonical — extend, don't change |
| `src/auth/AuthProvider.tsx` | Auth is working — don't change session logic |
| `src/policy/compliance-execution/complianceExecutionStore.ts` | Core CES store — don't modify for profile feature |
