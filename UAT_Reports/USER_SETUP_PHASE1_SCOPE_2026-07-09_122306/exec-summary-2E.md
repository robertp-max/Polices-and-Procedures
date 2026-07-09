# Phase 2E exec summary — Permissions + demo audit scaffolding

**Date:** 2026-07-09  
**Scope:** Client-side user-setup audit log, demo impersonation labels, soft admin gates, barrel hygiene.  
**Not in scope:** Phase 2F real auth, production audit chain, Nolan, rewriting onboarding-v2 audit engine.

## Commit

- **Message:** `feat(user-setup): Phase 2E demo audit + permission scaffolding`
- **SHA:** `815ab317231f70a7380d37516650c38be3fd8fe8` (`815ab317`) — primary feature commit; this summary SHA line may be updated by a docs-only follow-up

## Files changed

| Path | Change |
|------|--------|
| `src/policy/security/identity/userSetupAudit.ts` | **New** — append-only demo audit types/helpers; storage key `ci.identitySetupAudit.v1`; explicit label **Demo audit trail — not tamper-evident** |
| `src/policy/security/identity/userAssignmentsStore.ts` | `auditLog` state; `appendAudit` / `getRecentAudit`; log on `addUser`, `editUser`, `deleteUser`, `setSetupAssignment`; free fns `appendUserSetupAudit` / `getRecentUserSetupAudit` |
| `src/policy/security/identity/userAssignmentsStore.test.ts` | Phase 2E tests: mutating actions append entries; `createdAt` present; no `at` field; rehydrate persistence |
| `src/policy/security/identity/index.ts` | Removed broken re-exports of missing guard modules; export `userSetupAudit` |
| `src/policy/security/features/index.ts` | Removed broken re-exports of missing FeatureGate / PermissionGate / etc. |
| `src/policy/journey/stores/journeyStore.ts` | Audit on `signAppendixF`, `addSupervisedVisit`, `acknowledgeEscalation`, `resolveEscalation` |
| `src/v6/screens/pageviews/AdminUsersScreen.tsx` | Soft admin gate; demo impersonation actor banner; live audit tab from store |
| `src/v6/utils/adminRoleHelper.ts` | `canManageAdminUsers`, `isDemoAdminAccess`, `ADMIN_GROUP_NAMES` scaffolding |

## Behavior

### 1. User-setup audit log (demo only)

- Colocated with identity store (not a parallel journey store).
- Entry shape: `{ id, actorUserId, action, targetUserId?, detail?, createdAt }`
- **Field name:** `createdAt` only — never `at` (avoids onboarding-v2 consumer bug).
- Actions logged:
  - Identity: `addUser`, `editUser`, `deleteUser` (soft-deactivate), `setSetupAssignment`
  - Journey: `appendixFSign`, `supervisedVisitSave`, `acknowledgeEscalation`, `resolveEscalation`
- Persistence: localStorage `ci.identitySetupAudit.v1`, capped at 200 entries.
- UI + code comments: **Demo audit trail — not tamper-evident**.

### 2. AdminUsersScreen audit tab

- Replaces static evidence rows with recent live entries (newest first).
- Shows registry + audit keys, entry count, actor, action, `createdAt`, detail.

### 3. Demo impersonation labels

- `DemoImpersonationBar` already labels surfaces (Phase 2C).
- AdminUsersScreen actor context now shows **Demo impersonation — not a real session** with demo actor id `demo-user-careindeed`.

### 4. Permissions scaffolding (wire, don’t reinvent)

- Soft gate on AdminUsersScreen via `canManageAdminUsers` (same string-role pattern as Community Profiles).
- **Not** a security boundary: `AuthProvider` still hardcodes Administrator until 2F.
- Did **not** implement full `AccessDeniedPage` / `AdminRouteGuard` / `PageAccessMatrix` / FeatureGate components.
- Fixed barrels by **removing** broken re-exports of missing modules so `tsc` improves.

## Verification

- `npx vitest run src/policy/security/identity/userAssignmentsStore.test.ts` — **14 passed**
- `npx tsc -p tsconfig.app.json --noEmit` — **exit 0**

## Honest limitations

1. **Not tamper-evident** — any user can edit/clear `localStorage`; no hash chain, no server append-only store.
2. **Not production security** — admin gate is demo role-string scaffolding; IdP session binding is Phase 2F.
3. **Actor identity is simulated** — AdminUsers uses `demo-user-careinstead`; journey actions use free-text signer / supervisor id / “Journey Admin” strings.
4. **No route-level guards** — missing guard components not built; only soft in-screen deny + existing authorize/pageAccess helpers remain unused by most screens.
5. **Failed mutations are not audited** (by design); only successful identity CRUD / journey side-effects append.
6. **pageAccessStore audit** remains a separate trail for page-access matrix mutations; 2E did not unify both into one compliance view.
7. **Appendix F blank-signer** already fixed pre-2E (`prepareAppendixFSignature`); audit will not invent employee-name defaults.

## Explicit non-goals

- Phase 2F Cognito/real auth
- Claiming ACHC / surveyor-grade audit of record
- onboarding-v2 hash-chained audit engine rewrite
- Nolan
