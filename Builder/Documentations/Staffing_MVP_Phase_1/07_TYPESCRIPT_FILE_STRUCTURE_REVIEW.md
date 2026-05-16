# 07 — TypeScript & File Structure Review

**Generated:** 2026-05-13
**Reviewer Role:** TypeScript / File-Structure Reviewer
**Scope:** Phase 1 Staffing MVP — Implementation Prompt Validation
**Source Documents Reviewed:**
- `Builder/UserProfiles/Architecture.md` (lines 1361–1430: Final Implementation Prompt)
- `Builder/Documentations/System_Documentation/02_FOLDER_AND_FILE_MAP.md`
- `Builder/Documentations/System_Documentation/03_APP_ROUTES_AND_NAVIGATION.md`
- `Builder/Documentations/System_Documentation/05_DATA_MODEL_AND_TYPES.md`
- `Builder/Documentations/System_Documentation/06_DATAFLOW_AND_STATE_MANAGEMENT.md`
- `Builder/Documentations/System_Documentation/13_IMPLEMENTATION_READINESS_FOR_CLINICIAN_CLIENT_PROFILE.md`
- `src/App.tsx` (actual source — 289 lines)
- Existing store files: `journeyStore.ts`, `onboardingV2Store.ts`, `policyStore.ts`, etc.

---

## Executive Summary

The implementation prompt is **substantially sound** and follows most existing codebase conventions. However, this review identifies **8 corrections required** and **6 recommended improvements** before the prompt should be handed to a developer. The most critical issues are:

1. **Named export pattern omission** — The prompt says "Lazy-load all new pages with React.lazy()" but does not specify that pages MUST use named exports to match the codebase's universal `.then(m => ({ default: m.PageName }))` destructuring pattern. If pages use `export default`, the lazy import will fail or diverge from convention.
2. **Store convention inconsistency** — The prompt uses `stores/` (plural subdirectory) which matches `journey/stores/` but conflicts with `onboarding-v2/store/` (singular). The codebase has a split convention that must be resolved.
3. **Missing `userId` field on Clinician** — Architecture.md Section 11 defines `userId?: string` to link a clinician to an auth user. The implementation prompt's field list omits this, breaking a planned integration point.
4. **Doc 13 type conflicts remain unresolved** — Doc 13 proposed `ClinicianClientAssignment`, `ClinicianRole`, and `ClinicianCertification` types. The implementation prompt renames/replaces all three but does not explicitly deprecate the Doc 13 definitions, risking confusion.

**Overall verdict:** The prompt is safe to execute after applying the corrections listed in Section 8. No Phase 1 scope expansion is introduced by these corrections.

---

## 1. File Structure Comparison

### Proposed Structure (from Implementation Prompt)

```
src/policy/clinician/
├── types.ts
├── stores/clinicianStore.ts
├── pages/ClinicianListPage.tsx
├── pages/ClinicianDetailPage.tsx
├── components/ClinicianCard.tsx
├── components/CredentialBadge.tsx
├── components/DisciplineBadge.tsx
└── data/mockClinicians.ts

src/policy/client/
├── types.ts
├── stores/clientStore.ts
├── pages/ClientListPage.tsx
├── pages/ClientDetailPage.tsx
├── components/ClientCard.tsx
├── components/TierBadge.tsx
├── components/ShiftNeedCard.tsx
└── data/mockClients.ts
```

### Comparison to Existing Feature Module Patterns

| Structural Element | Journey (`journey/`) | Onboarding V2 (`onboarding-v2/`) | Proposed (`clinician/`, `client/`) | Verdict |
|---|---|---|---|---|
| Feature root location | `src/policy/journey/` | `src/policy/onboarding-v2/` | `src/policy/clinician/`, `src/policy/client/` | **PASS** — lowercase under `src/policy/` |
| Types file location | `types/journey.ts` (subdirectory) | `types.ts` (feature root) | `types.ts` (feature root) | **PASS** — matches onboarding-v2 pattern |
| Store subdirectory name | `stores/` (plural) | `store/` (singular) | `stores/` (plural) | **WARNING** — split convention in codebase |
| Pages subdirectory | `pages/` | `pages/` | `pages/` | **PASS** |
| Components subdirectory | `components/` | `components/` | `components/` | **PASS** |
| Data subdirectory | `data/` | n/a (uses `catalog/`) | `data/` | **PASS** — matches journey pattern |
| Barrel export (`index.ts`) | Not present | Present | Not mentioned | **MISSING** — see Section 7 |
| Services subdirectory | Not present | Not present | Not mentioned | **OK for Phase 1** — no API calls |
| Utils subdirectory | `utils/` | Not present | Not mentioned | **OK** — not needed in Phase 1 |
| Hooks subdirectory | Not present | Not present (inline) | Not mentioned | **OK** — not needed in Phase 1 |
| Engine/logic subdirectory | Not present | `engine/` | Not mentioned | **OK** — not needed in Phase 1 |

### Verdict

The proposed structure is **consistent with existing patterns**. The `clinician/` and `client/` directories follow the same organizational model as `journey/` and `onboarding-v2/`. Two issues:

1. **Store subdirectory name**: The codebase uses both `stores/` (journey) and `store/` (onboarding-v2). The shared stores are at `src/policy/stores/` (plural). **Recommendation:** Use `stores/` (plural) to match the majority convention (shared stores + journey).
2. **Missing barrel exports**: See Section 7.

---

## 2. Type Definition Review

### 2.1 Full Architecture Model vs Implementation Prompt

Architecture.md defines **11 entities**. The implementation prompt builds **7 types**. Here is the reconciliation:

| Architecture Entity | Implementation Prompt Type | Status | Notes |
|---|---|---|---|
| Clinician (Section 2.1) | `Clinician` interface | **INCLUDED** — reduced field set | Correctly scoped for Phase 1 |
| Client (Section 2.2) | `Client` interface | **INCLUDED** — reduced field set | PHI fields correctly deferred |
| ClinicianClientConnection (Section 2.3) | `CareAssignment` interface | **RENAMED + REDUCED** | Renamed per Architecture Section 11; reduced from 20+ fields to 11 |
| Availability (Section 2.4) | — | **DEFERRED** | Correct — matching engine dependency |
| Skill (Section 2.5) | `Competency` interface | **RENAMED** | "Skill" → "Competency" per terminology enforcement |
| Credential (Section 2.6) | `Credential` interface | **INCLUDED** — reduced | 8 fields vs 14 in architecture |
| Restriction (Section 2.7) | — | **DEFERRED** | Correct — no matching engine |
| Preference (Section 2.8) | — | **DEFERRED** | Correct — no matching engine |
| ShiftNeed (Section 2.9) | `ShiftNeed` interface | **INCLUDED** — reduced | Manual entry only; no lifecycle beyond open/filled/cancelled |
| ShiftAssignment (Section 2.10) | — | **DEFERRED** | Correct — no assignment workflow in Phase 1 |
| AuditLog (Section 2.11) | — | **DEFERRED** | Correct — existing audit infra handles this |
| — | `Discipline` type union | **NEW** | Not a standalone entity in architecture, extracted as a shared union |

**Verdict:** The 4 deferred entities (Availability, Restriction, Preference, ShiftAssignment) are all correct deferrals — they depend on the matching engine or the assignment workflow, neither of which is in Phase 1 scope. The 7 included types are the correct minimum viable set.

### 2.2 Field-by-Field Comparison: Clinician

| Field | Architecture.md (Section 11) | Implementation Prompt | Doc 13 | Conflict? |
|---|---|---|---|---|
| `id` | `string` | `string` | `string` | — |
| `userId` | `string?` (link to auth user) | **MISSING** | `string` (required) | **CONFLICT** — prompt omits; Architecture includes it |
| `firstName` | `string` | `string` | `string` | — |
| `lastName` | `string` | `string` | `string` | — |
| `preferredName` | `string?` | `string?` | — | — |
| `email` | `string?` | `string?` | `string` (required) | Minor: Doc 13 requires, prompt makes optional |
| `phone` | `string?` | **MISSING** | — | **OMISSION** — present in Architecture, absent in prompt |
| `primaryDiscipline` | `Discipline` | `Discipline` | `ClinicianRole` (different name) | **CONFLICT** — Doc 13 uses wrong name |
| `secondaryDisciplines` | `Discipline[]?` | `Discipline[]?` | — | — |
| `competencies` | `Competency[]` | `Competency[]` | — | — |
| `credentials` | `Credential[]` | `Credential[]` | `ClinicianCertification[]` | **CONFLICT** — Doc 13 uses different type name |
| `employmentType` | `'W2' \| 'contractor'` | `'W2' \| 'contractor'` (listed in fields) | — | — |
| `hireDate` | `string?` | `string?` | `string?` | — |
| `status` | 5 values including `'terminated'` | Listed (see below) | 4 values (no `'terminated'`) | Doc 13 missing `'terminated'` |
| `orgRole` | Enum of 6 values | `string?` (listed in fields) | — | — |
| `supervisorId` | `string?` | `string?` | — | — |
| `cgssId` | `string?` | `string?` | — | — |
| `serviceAreas` | `string[]?` | `string[]?` | — | — |
| `maxHoursPerWeek` | `number?` | `number?` | — | — |
| `licenseNumber` | — (moved to Credential) | — (in Credential) | Top-level field | **CONFLICT** — Doc 13 puts on Clinician; Architecture/prompt correct |
| `licenseState` | — | — | Top-level field | **CONFLICT** — same as above |
| `licenseExpiresAt` | — | — | Top-level field | **CONFLICT** — same as above |
| `createdAt` | `string` | `string` | `string` | — |
| `updatedAt` | `string` | `string` | `string` | — |

**Clinician Status Values:**

| Value | Architecture.md | Implementation Prompt | Doc 13 |
|---|---|---|---|
| `'active'` | Yes | Yes | Yes |
| `'inactive'` | Yes | Yes | Yes |
| `'pending'` | Yes | Yes | Yes |
| `'suspended'` | Yes | Yes | Yes |
| `'terminated'` | Yes | Yes | No |

### 2.3 Field-by-Field Comparison: Client

| Field | Architecture.md (Section 11) | Implementation Prompt | Doc 13 | Conflict? |
|---|---|---|---|---|
| `id` | `string` | `string` | `string` | — |
| `firstName` | `string` | `string` | `string` | — |
| `lastName` | `string` | `string` | `string` | — |
| `preferredName` | `string?` | `string?` | — | — |
| `serviceSetting` | `'home' \| 'facility'` | `'home' \| 'facility'` | — | Doc 13 missing |
| `serviceEntity` | `'home_care'` | `'home_care'` | — | Doc 13 missing |
| `careTier` | `'L1' \| 'L2' \| 'L3' \| 'L4'` | `'L1' \| 'L2' \| 'L3' \| 'L4'` | — | Doc 13 missing |
| `status` | 5 values incl. `'on_hold'` | 5 values incl. `'on_hold'` | 4 values (no `'on_hold'`) | Doc 13 mismatch |
| `accmOwnerId` | `string` | `string` | — | Doc 13 missing |
| `ccmId` | `string?` | `string?` | — | — |
| `serviceZip` | `string?` | `string?` | — | — |
| `serviceCity` | `string?` | `string?` | — | — |
| `facilityId` | `string?` | `string?` | — | — |
| `facilityName` | `string?` | `string?` | — | — |
| `admissionDate` | `string?` | `string?` | `string?` | — |
| `dischargeDate` | `string?` | `string?` | `string?` | — |
| `primaryDiagnosisCategory` | `string?` | `string?` | — | — |
| `requiredDisciplines` | `Discipline[]` | `Discipline[]` | — | — |
| `requiredCompetencies` | `string[]?` | `string[]?` | — | — |
| `dateOfBirth` | Commented out (DEFER) | Not mentioned | `string?` (with PHI warning) | **CONFLICT** — Doc 13 includes, Architecture/prompt defer |
| `primaryDiagnosis` | Commented out (DEFER) | Not mentioned | `string?` (with PHI warning) | **CONFLICT** — same |
| `address` | Commented out (DEFER) | Not mentioned | `ClientAddress?` (with PHI warning) | **CONFLICT** — same |
| `assignedClinicianIds` | — (use junction) | — (use junction) | `string[]` (direct FK) | **CONFLICT** — Doc 13 violates junction model |
| `createdAt` | `string` | `string` | `string` | — |
| `updatedAt` | `string` | `string` | `string` | — |

### 2.4 Type Name Collision Check

| Proposed Type | Existing Types in Codebase | Collision? |
|---|---|---|
| `Clinician` | None | **SAFE** |
| `Client` | None | **SAFE** — but generic name; future GraphQL/API types may collide |
| `CareAssignment` | None | **SAFE** |
| `ShiftNeed` | None | **SAFE** |
| `Discipline` | None | **SAFE** |
| `Competency` | None | **SAFE** |
| `Credential` | None | **SAFE** — but note `ClinicianCertification` in Doc 13 is superseded |

**No type name collisions exist.** The proposed types occupy a clean namespace.

### 2.5 Summary of Type Conflicts Between Documents

| Conflict | Doc 13 Definition | Architecture/Prompt Definition | Resolution |
|---|---|---|---|
| Junction model | `assignedClinicianIds: string[]` on Client | `CareAssignment` junction entity | **Use Architecture** — junction model is architecturally required |
| Role terminology | `ClinicianRole` type | `Discipline` type | **Use Architecture** — "Skill" and "Role" banned per terminology rules |
| Credential location | `licenseNumber`, `licenseState`, `licenseExpiresAt` on Clinician | Nested in `Credential[]` | **Use Architecture** — avoids duplication |
| Credential type name | `ClinicianCertification` | `Credential` | **Use Architecture** — more general |
| Assignment type name | `ClinicianClientAssignment` | `CareAssignment` | **Use Architecture** — shorter, domain-correct |
| PHI fields on Client | Included (with warnings) | Deferred entirely | **Use Architecture** — PHI must be deferred |
| Client status values | Missing `'on_hold'` | Includes `'on_hold'` | **Use Architecture** — required for hospitalization holds |
| Clinician status values | Missing `'terminated'` | Includes `'terminated'` | **Use Architecture** — required for lifecycle |

**Recommendation:** Doc 13 should be marked as SUPERSEDED by the Architecture.md model for all type definitions. The implementation prompt correctly incorporates all Architecture corrections.

---

## 3. Store Pattern Comparison

### Existing Store Conventions

| Convention | Observed Pattern | Source |
|---|---|---|
| Library | Zustand v5 via `create<T>()` | All stores |
| Hook name | `use[Name]Store` | `usePolicyStore`, `useCalendarStore`, `useOnboardingV2Store` |
| State interface | Defined inline above `create()` or as named interface | Both patterns observed |
| Selectors | State properties accessed directly via hook; computed selectors are inline functions | `useOnboardingV2Store` |
| Actions | Defined in `create()` body; use `set` and `get` | All stores |
| Seeding | From static data imports or `seed.ts` files | `journeyStore` (employees), `onboardingV2Store` (buildSeedSnapshot) |
| Persistence | Most: in-memory only. `journeyStore`: uses `persist` middleware with `localStorage` | Mixed |
| Middleware | Optional `persist`, `devtools` | `journeyStore`, `autogenStore` |
| Export | Named export: `export const use[Name]Store = create<T>()(...)` | Universal |

### Implementation Prompt Store Specification

The prompt specifies:
- `clinicianStore.ts` — seeded from mock data, with actions: `getClinicians`, `getClinicianById`, `filterByDiscipline`, `filterByStatus`
- `clientStore.ts` — seeded from mock data, with actions: `getClients`, `getClientById`, `filterByTier`, `filterByAccm`, `filterBySetting`

### Issues Found

| Issue | Detail | Severity |
|---|---|---|
| **Action naming convention** | The prompt lists `getClinicians`, `getClinicianById` as "actions." In existing stores, these would be **selectors** (state properties or computed getters), not actions. Actions mutate state (`set()`). Read-only accessors are typically direct state access via the hook, or computed functions using `get()`. | **MEDIUM** — misleading; developer may implement as state-mutating actions |
| **Filter pattern** | `filterByDiscipline`, `filterByStatus` suggest stateful filters that mutate the store. Existing stores (e.g., `policyStore`) tend to keep filter state in the store but expose the raw data for components to filter. This is a design decision, not a convention violation. | **LOW** — acceptable either way |
| **Store file naming** | `clinicianStore.ts` → export would be `useClinicianStore`. Matches `usePolicyStore`, `useCalendarStore` pattern. | **PASS** |
| **Seed pattern** | Seeding from mock data files matches `journeyStore` (seeds from `SEED_EMPLOYEES`) and `onboardingV2Store` (seeds from `buildSeedSnapshot()`). | **PASS** |
| **No persistence** | In-memory only — matches Phase 1 scope. Doc 06 notes this is the existing pattern for most stores. | **PASS** |

### Recommendation

Clarify in the prompt that `getClinicians` and `getClinicianById` are **selectors** (read-only computed values), not **actions** (state mutators). Suggested store shape:

```typescript
interface ClinicianStore {
  clinicians: Clinician[];
  assignments: CareAssignment[];

  // Selectors
  getClinicianById: (id: string) => Clinician | undefined;
  getAssignmentsForClinician: (clinicianId: string) => CareAssignment[];

  // No actions in Phase 1 (read-only)
}
```

---

## 4. Route Registration Review

### Existing Route Pattern (from `src/App.tsx`)

1. Pages are lazy-loaded at top of file using **named exports**:
   ```typescript
   const PageName = lazy(() => import('@/policy/feature/pages/PageName').then(m => ({ default: m.PageName })))
   ```
2. Routes are registered as flat `<Route>` elements inside the inner `<Routes>` block (line 169 of App.tsx), which is wrapped in:
   ```
   <ProtectedRoute>
     <CommandCenterLayout>
       <Suspense fallback={<InlineLoader />}>
         <Routes>
           {/* routes here */}
         </Routes>
       </Suspense>
     </CommandCenterLayout>
   </ProtectedRoute>
   ```
3. Feature-grouped routes use section comments for organization (e.g., `{/* Onboarding & Competency Journey */}`).

### Implementation Prompt Route Specification

The prompt specifies:
- `/clinicians` → `ClinicianListPage`
- `/clinicians/:clinicianId` → `ClinicianDetailPage`
- `/clients` → `ClientListPage`
- `/clients/:clientId` → `ClientDetailPage`
- "All inside ProtectedRoute + CommandCenterLayout"

### Issues Found

| Issue | Detail | Severity |
|---|---|---|
| **Named export not specified** | The prompt says "Lazy-load all new pages with React.lazy()" but does not specify the `.then(m => ({ default: m.PageName }))` named-export destructuring pattern used by **every existing lazy import** in App.tsx. If the developer uses `export default`, the import pattern will work but diverge from the codebase's universal convention. | **HIGH** — must specify named exports |
| **Route group comment** | The prompt does not specify a section comment for the new routes. Existing groups use comments like `{/* Onboarding & Competency Journey */}` and `{/* Compliance Execution Sprint System */}`. | **LOW** — developer should add one |
| **Route placement** | The prompt doesn't specify WHERE in the route list to add the new routes. Suggestion: add a new `{/* Staffing — Clinician & Client Profiles */}` section after the PM Layer routes (line 260). | **LOW** — cosmetic |
| **Route path consistency** | `/clinicians` and `/clients` are plural kebab-case, matching existing patterns (`/forms`, `/workflows`, `/policies`). | **PASS** |
| **No nested layout** | Unlike onboarding-v2 (which uses a nested `<Route>` with `OnboardingV2Layout`), the staffing routes are flat. This is correct — flat routes match the majority pattern. | **PASS** |

### Recommendation

Add this explicit instruction to the implementation prompt:

> All new page components MUST use named exports (e.g., `export function ClinicianListPage() {}`), NOT `export default`. The lazy import in App.tsx MUST follow the existing pattern:
> ```typescript
> const ClinicianListPage = lazy(() => import('@/policy/clinician/pages/ClinicianListPage').then(m => ({ default: m.ClinicianListPage })))
> ```

---

## 5. Naming Convention Audit

| Convention | Prompt Claims | Actual Codebase | Match? |
|---|---|---|---|
| TypeScript types: PascalCase interface | `interface Clinician {}` | `interface OnboardingV2Store {}`, `interface PolicyState {}` | **MATCH** |
| Zustand stores: camelCase + `Store` suffix | `clinicianStore.ts` | `policyStore.ts`, `calendarStore.ts`, `journeyStore.ts` | **MATCH** |
| React pages: PascalCase + `Page` suffix | `ClinicianListPage.tsx` | `DashboardPage.tsx`, `LibraryPage.tsx`, `CesBoardPage.tsx` | **MATCH** |
| React components: PascalCase | `ClinicianCard.tsx` | `StatusBadge.tsx`, `GlassPanel.tsx`, `ModuleCard.tsx` | **MATCH** |
| API service files: camelCase + `Api` suffix | `clinicianApi.ts` (deferred) | `calendarApi.ts`, `pmApiClient.ts` | **PARTIAL** — `pmApiClient.ts` uses `Client` not `Api` suffix |
| Route paths: kebab-case plural | `/clinicians`, `/clients` | `/calendar`, `/library`, `/forms`, `/workflows` | **MATCH** |
| Feature directory: lowercase under `src/policy/` | `src/policy/clinician/` | `journey/`, `onboarding-v2/`, `ces/`, `lifecycle/` | **MATCH** |
| Types file: `types.ts` in feature root | `types.ts` | `onboarding-v2/types.ts` ✓, `ces/types.ts` ✓, `journey/types/journey.ts` ✗ | **MATCH** (majority pattern) |
| Store hook: `use[Name]Store` | Not explicitly stated | `usePolicyStore`, `useOnboardingV2Store`, `useJourneyStore` | Prompt should specify `useClinicianStore`, `useClientStore` |
| Data files: descriptive camelCase | `mockClinicians.ts` | `employees.ts`, `modules.ts`, `regulatoryEvents.ts` | **MATCH** |

### Anomalies Noted

1. **`pmApiClient.ts`** — uses `Client` suffix instead of `Api`. If Phase 2 adds `clinicianApi.ts`, this is fine, but note the inconsistency for awareness.
2. **Journey types in subdirectory** — `journey/types/journey.ts` is the exception, not the rule. The prompt's root-level `types.ts` is the majority convention.
3. **Prompt does not mention Zustand hook naming** — Should explicitly state: "Export as `useClinicianStore`" and "Export as `useClientStore`".

---

## 6. Import Path Consistency

### Existing Import Alias

The codebase uses the `@/` path alias (configured in `tsconfig.app.json` and `vite.config.ts`) resolving to `src/`.

| Import Pattern | Example | Status |
|---|---|---|
| Feature pages from App.tsx | `@/policy/journey/pages/JourneyHomePage` | Standard |
| Feature types | `@/policy/journey/types/journey` | Standard |
| Feature stores | `@/policy/journey/stores/journeyStore` | Standard |
| Shared UI components | `@/policy/components/ui/` | Standard |
| Cross-feature imports | `@/policy/pm/types` | Standard |

### Proposed Import Paths

| New Import | Pattern | Consistent? |
|---|---|---|
| `@/policy/clinician/types` | Feature types | **YES** |
| `@/policy/clinician/stores/clinicianStore` | Feature store | **YES** |
| `@/policy/clinician/pages/ClinicianListPage` | Feature page | **YES** |
| `@/policy/clinician/components/ClinicianCard` | Feature component | **YES** |
| `@/policy/clinician/data/mockClinicians` | Feature data | **YES** |
| `@/policy/client/types` | Feature types | **YES** |
| `@/policy/client/stores/clientStore` | Feature store | **YES** |
| `@/policy/client/pages/ClientListPage` | Feature page | **YES** |
| `@/policy/client/components/ClientCard` | Feature component | **YES** |
| `@/policy/client/data/mockClients` | Feature data | **YES** |

**Verdict: All proposed import paths are consistent.** No issues.

### Cross-Feature Import Note

The `CareAssignment` type is defined in `clinician/types.ts` but is consumed by both the clinician and client features. The client store and client detail page will need to import from `@/policy/clinician/types`. This cross-feature import is acceptable (matches how `ces/types.ts` is imported by `compliance-execution/`) but could be cleaner with a shared types location. For Phase 1, the current placement is fine.

---

## 7. Missing Files / Exports

| Missing Item | Required? | Rationale |
|---|---|---|
| `src/policy/clinician/index.ts` (barrel export) | **RECOMMENDED** | `onboarding-v2/`, `compliance/`, `lifecycle/`, `security/` all have barrel exports. Provides clean public API for the feature module. |
| `src/policy/client/index.ts` (barrel export) | **RECOMMENDED** | Same as above. |
| `src/policy/clinician/services/clinicianApi.ts` | **NOT NOW** | Phase 1 is mock-only. Doc 13 recommends this for Phase 2. The directory structure should anticipate it but not create it yet. |
| `src/policy/client/services/clientApi.ts` | **NOT NOW** | Same as above. |
| Test files (`*.test.ts`, `*.test.tsx`) | **NOT IN SCOPE** | No existing feature modules have co-located tests. Tests use Playwright at project root. Not a Phase 1 gap. |
| Constants file (`constants.ts`) | **OPTIONAL** | If `Discipline` values, `CareTier` values, or status enums are reused in multiple places, a constants file may be useful. Not required for Phase 1. |
| Shared type re-exports | **RECOMMENDED** | `Discipline`, `Competency`, and `Credential` types are defined in `clinician/types.ts` but used by `client/types.ts` (e.g., `requiredDisciplines: Discipline[]`). The client types file should import from `@/policy/clinician/types`. This cross-dependency should be documented. |

### Recommended Barrel Export Contents

```typescript
// src/policy/clinician/index.ts
export * from './types';
export { useClinicianStore } from './stores/clinicianStore';

// src/policy/client/index.ts
export * from './types';
export { useClientStore } from './stores/clientStore';
```

---

## 8. Recommended Corrections for the Implementation Prompt

### REQUIRED Corrections (Must Fix Before Execution)

| # | Correction | Current Prompt Text | Corrected Text | Reason |
|---|---|---|---|---|
| **R1** | Add named export requirement | "Lazy-load all new pages with React.lazy()" | "All new page components MUST use named exports (`export function PageName()`). Lazy-load in App.tsx using the existing pattern: `const PageName = lazy(() => import('@/policy/feature/pages/PageName').then(m => ({ default: m.PageName })))`" | Every existing page uses named exports with `.then()` destructuring. Default exports will break convention. |
| **R2** | Add `userId` field to Clinician | Field list omits `userId` | Add `userId?: string` to Clinician interface (link to auth user if they have app access) | Architecture.md includes this field. Required for future auth integration per Doc 13. |
| **R3** | Add `phone` field to Clinician | Field list omits `phone` | Add `phone?: string` to Clinician interface | Architecture.md includes this field. Commonly needed for contact display. |
| **R4** | Specify store hook naming | "Zustand stores: camelCase + Store suffix" | Add: "Export stores as `useClinicianStore` and `useClientStore` following the `use[Name]Store` convention" | All existing stores export with `use` prefix. Omitting this creates ambiguity. |
| **R5** | Clarify selectors vs actions | "Actions: getClinicians, getClinicianById, filterByDiscipline, filterByStatus" | "Selectors (read-only): `getClinicianById(id)`, `assignmentsForClinician(id)`. State: `clinicians: Clinician[]`, `assignments: CareAssignment[]`, `filterDiscipline: Discipline \| null`, `filterStatus: string \| null`. Computed: filtered lists derived from state." | Existing stores distinguish selectors (get) from actions (set). Calling read-only getters "actions" may lead to incorrect implementation. |
| **R6** | Specify mock data colocation | "CREATE MOCK DATA (src/policy/clinician/data/mockClinicians.ts and src/policy/client/data/mockClients.ts)" | Add: "mockClinicians.ts should export `MOCK_CLINICIANS: Clinician[]`, `MOCK_ASSIGNMENTS: CareAssignment[]`. mockClients.ts should export `MOCK_CLIENTS: Client[]`, `MOCK_SHIFT_NEEDS: ShiftNeed[]`." | CareAssignment and ShiftNeed mock data must live somewhere. CareAssignment references both clinician and client IDs — it should live in the clinician data file (or a shared file). ShiftNeed references client IDs — it should live in the client data file. |
| **R7** | Add section comment for routes | Not mentioned | "Add routes in App.tsx under a new section comment: `{/* Staffing — Clinician & Client Profiles */}`" | All existing route groups use section comments for organization. |
| **R8** | Document cross-feature type dependency | Not mentioned | "client/types.ts imports `Discipline` from `@/policy/clinician/types`. This is an intentional cross-feature dependency." | `Client.requiredDisciplines` uses the `Discipline` type defined in clinician/types.ts. The implementer must know this. |

### RECOMMENDED Improvements (Optional but Beneficial)

| # | Improvement | Reason |
|---|---|---|
| **O1** | Add barrel `index.ts` files for both `clinician/` and `client/` | Follows `onboarding-v2/`, `compliance/`, `lifecycle/`, `security/` pattern. Provides clean import surface. |
| **O2** | Add `Clinician.status` enum as an exported type union (like `LifecycleStatus` in core types) | Enables reuse in badge components and filter logic without magic strings. |
| **O3** | Consider moving shared types (`Discipline`, `Competency`, `Credential`) to a shared location like `src/policy/staffing/types.ts` | Avoids the `client/` → `clinician/` cross-dependency. However, this may be premature for Phase 1. |
| **O4** | Explicitly note that the inner `<Suspense fallback={<InlineLoader />}>` already wraps the routes — no additional Suspense needed per page | Prevents the implementer from adding redundant Suspense wrappers in page components. |
| **O5** | Add `Clinician.displayName` computed convention | Architecture Section 2.2 uses `displayName` for Client. Having a consistent display name pattern (e.g., `${firstName} ${lastName}`) as a utility function would be useful. |
| **O6** | Specify that sidebar nav entries should be added to the sidebar configuration (likely in `CommandCenterLayout.tsx` or `navStore.ts`) | The prompt says "ADD SIDEBAR NAV entries" but doesn't specify which file contains the nav configuration. |

---

## Appendix A: Document Supersession Map

| Document | Status After This Review |
|---|---|
| `Architecture.md` (Sections 1–11) | **CANONICAL** — full architecture reference |
| `Architecture.md` (Implementation Prompt, lines 1361–1430) | **ACTIVE** — to be corrected per Section 8 above |
| `System_Documentation/13_IMPLEMENTATION_READINESS` | **PARTIALLY SUPERSEDED** — type definitions (Clinician, Client, ClinicianClientAssignment) are replaced by Architecture.md. File structure recommendations remain valid. Integration points remain valid. |
| `System_Documentation/05_DATA_MODEL_AND_TYPES` | **UNAFFECTED** — no conflicts; new types are additive |
| `System_Documentation/06_DATAFLOW_AND_STATE_MANAGEMENT` | **UNAFFECTED** — new stores follow existing patterns |
| `System_Documentation/03_APP_ROUTES_AND_NAVIGATION` | **TO BE UPDATED** after implementation — add new routes to the route map |

---

## Appendix B: Lazy Import Template for App.tsx

```typescript
// ── Staffing — Clinician & Client Profiles ────────────────────────
const ClinicianListPage   = lazy(() => import('@/policy/clinician/pages/ClinicianListPage').then(m => ({ default: m.ClinicianListPage })))
const ClinicianDetailPage = lazy(() => import('@/policy/clinician/pages/ClinicianDetailPage').then(m => ({ default: m.ClinicianDetailPage })))
const ClientListPage      = lazy(() => import('@/policy/client/pages/ClientListPage').then(m => ({ default: m.ClientListPage })))
const ClientDetailPage    = lazy(() => import('@/policy/client/pages/ClientDetailPage').then(m => ({ default: m.ClientDetailPage })))
```

Route registration (inside inner `<Routes>`):
```tsx
{/* Staffing — Clinician & Client Profiles */}
<Route path="/clinicians" element={<ClinicianListPage />} />
<Route path="/clinicians/:clinicianId" element={<ClinicianDetailPage />} />
<Route path="/clients" element={<ClientListPage />} />
<Route path="/clients/:clientId" element={<ClientDetailPage />} />
```
