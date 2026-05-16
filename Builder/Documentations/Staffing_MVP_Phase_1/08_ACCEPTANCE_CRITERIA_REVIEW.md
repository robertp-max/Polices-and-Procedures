# 08 — Acceptance Criteria Review: Phase 1 Staffing MVP

**Reviewer Role:** UAT / Acceptance Criteria Reviewer  
**Review Date:** 2026-05-13  
**Scope:** Phase 1 Staffing MVP — Clinician & Client Profile Foundation  
**Source Documents Reviewed:**
- `Builder/UserProfiles/Architecture.md` (Implementation Prompt, Section 12+, Constraints)
- `Builder/UserProfiles/Planning_Implementation.md` (Parts 1–6, Quick Wins)
- `Builder/Documentations/System_Documentation/13_IMPLEMENTATION_READINESS_FOR_CLINICIAN_CLIENT_PROFILE.md`

---

## Executive Summary

This review defines **72 testable acceptance criteria** organized across 8 categories for the Phase 1 Staffing MVP. Every deliverable in the implementation prompt (Architecture.md lines 1362–1430) is traced to a pass/fail criterion.

**Key findings:**

1. **The implementation prompt is well-scoped.** Constraints are explicit, deliverables are enumerable, and the read-only enforcement is clearly stated.
2. **Two acceptance criteria from Planning_Implementation.md Part 5 are missing** from the current prompt: "No demographic data used in mock matching logic" and "Every assignment has traceable source." Both are recommended additions.
3. **Six gap risks identified** where the implementation prompt lacks explicit testable enforcement — primarily around deferred-field exclusion verification, mock data FK integrity validation, and lazy-loading enforcement.
4. **The prompt correctly defers** matching engine, API integrations, PHI fields, and write UI — but acceptance criteria must verify these deferrals hold (negative tests).

---

## Acceptance Criteria by Category

### Category 1: Type Definitions

| ID | Description | Pass Condition | Fail Condition |
|---|---|---|---|
| **TYP-01** | Discipline type union defined in `src/policy/clinician/types.ts` | Type includes exactly: `'RN' \| 'LVN' \| 'LPN' \| 'PT' \| 'PTA' \| 'OT' \| 'COTA' \| 'ST' \| 'SLP' \| 'MSW' \| 'HHA' \| 'CNA' \| 'Caregiver'` | Missing any value, extra values added, or type defined as `string` |
| **TYP-02** | Competency interface defined | Interface has fields: `name: string`, `level?: 'basic' \| 'intermediate' \| 'advanced'`, `verifiedAt?: string`, `verifiedBy?: string` | Missing required field `name`, or `level` uses wrong union values |
| **TYP-03** | Credential interface defined | Interface has all fields: `type`, `issuingBody?`, `licenseNumber?`, `state?`, `issuedAt`, `expiresAt?`, `verifiedAt?`, `verifiedBy?`, `status`, `evidenceRef?` | Missing `status` field, or `status` enum incomplete |
| **TYP-04** | Credential.status enum correct | Status is exactly: `'active' \| 'expired' \| 'pending_verification' \| 'revoked'` | Missing values or extra values |
| **TYP-05** | Clinician interface defined | All required fields present: `id`, `firstName`, `lastName`, `primaryDiscipline`, `competencies`, `credentials`, `employmentType`, `status`, `createdAt`, `updatedAt` | Any required field missing or typed as optional |
| **TYP-06** | Clinician.employmentType correct | Type is `'W2' \| 'contractor'` | Uses string or different values |
| **TYP-07** | Clinician.status enum correct | Status is `'active' \| 'inactive' \| 'pending' \| 'suspended' \| 'terminated'` | Missing or extra values |
| **TYP-08** | Clinician.primaryDiscipline uses Discipline type | Field references the shared `Discipline` type, not an inline union | Inline string union duplicating the Discipline definition |
| **TYP-09** | CareAssignment interface defined | All required fields: `id`, `clinicianId`, `clientId`, `discipline`, `assignmentRole`, `startDate`, `status`, `assignedBy`, `createdAt` | Any required field missing |
| **TYP-10** | CareAssignment.assignmentRole correct | Type is `'primary' \| 'secondary' \| 'prn' \| 'supervisory'` | Missing values |
| **TYP-11** | Client interface defined in `src/policy/client/types.ts` | All required fields: `id`, `firstName`, `lastName`, `serviceSetting`, `serviceEntity`, `careTier`, `status`, `accmOwnerId`, `requiredDisciplines`, `createdAt`, `updatedAt` | Any required field missing or typed as optional |
| **TYP-12** | Client.careTier enum correct | Type is `'L1' \| 'L2' \| 'L3' \| 'L4'` | Missing tiers or wrong naming |
| **TYP-13** | Client.serviceSetting correct | Type is `'home' \| 'facility'` | Includes `'home_health'` (deferred) |
| **TYP-14** | Client.serviceEntity locked to Phase 1 | Type is `'home_care'` (literal) | Includes `'home_health'` (deferred per Architecture.md) |
| **TYP-15** | ShiftNeed interface defined | All required fields: `id`, `clientId`, `requiredDiscipline`, `isHardRequirement`, `startDate`, `status`, `createdAt` | Missing fields |
| **TYP-16** | ShiftNeed.status enum correct | Type is `'open' \| 'filled' \| 'cancelled'` | Extra lifecycle states from full Architecture.md (e.g., `matchingInProgress`, `assigned`) that belong in Phase 5+ |
| **TYP-17** | No `any` types used | `grep -r "any" src/policy/clinician/types.ts src/policy/client/types.ts` returns zero hits for `: any` | Any field typed as `any` |
| **TYP-18** | No deferred fields present | Client type does NOT contain `dateOfBirth`, `primaryDiagnosis` (text field), `address`/`ClientAddress`. Fields are absent, not commented out. | Deferred PHI fields exist as comments, optional fields, or in any form |
| **TYP-19** | All types compile without errors | `tsc --noEmit` passes with zero errors on types files | Any TypeScript compilation error |
| **TYP-20** | No "Skill" terminology used | Zero instances of the word "Skill" (as a type name, field name, or comment term) in types files. "Competency" is used instead. | `Skill` appears in any type definition or field name |
| **TYP-21** | Types exported correctly | All interfaces and types use `export` keyword | Any type not exported |

---

### Category 2: Mock Data Quality

| ID | Description | Pass Condition | Fail Condition |
|---|---|---|---|
| **MOC-01** | Correct clinician count | `mockClinicians` array contains exactly 10 records | Fewer or more than 10 |
| **MOC-02** | Clinician discipline mix | Distribution: 2 RN, 2 LVN, 1 PT, 1 OT, 3 HHA/CNA, 1 Caregiver (per implementation prompt) | Disciplines missing or counts don't match specification |
| **MOC-03** | Clinician status diversity | At least 3 distinct `status` values present across 10 clinicians (minimum: active, pending, inactive) | All clinicians have same status |
| **MOC-04** | Clinician employment type mix | Both `'W2'` and `'contractor'` present in dataset | Only one employmentType used |
| **MOC-05** | Accommodation fields populated | At least 2 clinicians have accommodation-related data (if accommodation fields are on the Clinician type) OR if accommodations are deferred, this is documented | Accommodation fields present on type but empty on all records |
| **MOC-06** | Correct client count | `mockClients` array contains exactly 6 records | Fewer or more than 6 |
| **MOC-07** | Client tier distribution | Distribution: 2 L1, 2 L2, 1 L3, 1 L4 (per implementation prompt) | Tiers missing or counts wrong |
| **MOC-08** | Client setting mix | Both `'home'` and `'facility'` settings present | Only one setting used |
| **MOC-09** | Client accmOwnerId populated | Every client has a non-empty `accmOwnerId` | Any client missing accmOwnerId |
| **MOC-10** | Correct assignment count | `mockCareAssignments` array contains exactly 8 records | Fewer or more than 8 |
| **MOC-11** | Correct shift need count | `mockShiftNeeds` array contains exactly 6 records | Fewer or more than 6 |
| **MOC-12** | Shift need status mix | At least 1 `'open'` and at least 1 `'filled'` ShiftNeed present | All same status |
| **MOC-13** | FK integrity: assignments → clinicians | Every `CareAssignment.clinicianId` resolves to a clinician in `mockClinicians` | Any clinicianId references a non-existent clinician |
| **MOC-14** | FK integrity: assignments → clients | Every `CareAssignment.clientId` resolves to a client in `mockClients` | Any clientId references a non-existent client |
| **MOC-15** | FK integrity: shift needs → clients | Every `ShiftNeed.clientId` resolves to a client in `mockClients` | Any clientId references a non-existent client |
| **MOC-16** | FK integrity: shift needs → assignments | Any `ShiftNeed.assignedCareAssignmentId` (if populated) resolves to a record in `mockCareAssignments` | Dangling FK reference |
| **MOC-17** | No PHI in mock data | No real dates of birth, no real diagnosis text, no real street addresses, no real SSNs, no real phone numbers from real people | Any data that could be traced to a real individual |
| **MOC-18** | Realistic Bay Area names | Clinician and client names reflect Bay Area demographic diversity (per implementation prompt: "Realistic Bay Area names") | All names from a single demographic or obviously placeholder (e.g., "Test User 1") |
| **MOC-19** | Unique IDs | All `id` fields across all mock datasets are unique (no duplicates within or across entities) | Any duplicate ID |
| **MOC-20** | Every assignment has traceable source | Every CareAssignment has a populated `assignedBy` field identifying the assigning user/role | Any assignment missing `assignedBy` (per Planning_Implementation.md Part 5) |
| **MOC-21** | Timestamps present | All records have `createdAt` populated with valid ISO-8601 date strings | Missing or malformed timestamps |

---

### Category 3: Page Functionality

| ID | Description | Pass Condition | Fail Condition |
|---|---|---|---|
| **PAG-01** | ClinicianListPage renders all clinicians | Page displays all 10 mock clinicians on load | Any clinician missing from list |
| **PAG-02** | ClinicianListPage shows required columns | Each entry shows: name, discipline, status, competency count, active assignments count | Any required column missing |
| **PAG-03** | ClinicianListPage filter by discipline | Selecting a discipline filter shows only clinicians with that `primaryDiscipline` | Filter returns wrong results or no-ops |
| **PAG-04** | ClinicianListPage filter by status | Selecting a status filter shows only clinicians with that `status` | Filter returns wrong results or no-ops |
| **PAG-05** | ClinicianListPage click navigates to detail | Clicking a clinician row/card navigates to `/clinicians/:clinicianId` | Click does nothing or navigates to wrong route |
| **PAG-06** | ClinicianDetailPage loads correct data | Navigating to `/clinicians/:clinicianId` displays the profile for that specific clinician | Wrong clinician displayed or page errors |
| **PAG-07** | ClinicianDetailPage shows personal info section | Displays: name, preferred name (if set), email, phone, discipline, employment type, status, hire date | Any profile field missing |
| **PAG-08** | ClinicianDetailPage shows credentials section | Lists all credentials for this clinician | Credentials section absent |
| **PAG-09** | ClinicianDetailPage credential expiry badges | Each credential displays a color-coded badge: green (active), yellow (expiring soon), red (expired) via `CredentialBadge` component | No visual distinction between active/expiring/expired |
| **PAG-10** | ClinicianDetailPage shows competencies section | Lists all competencies with level (if set) | Competencies section absent |
| **PAG-11** | ClinicianDetailPage shows assignments section | Lists active CareAssignments with linked client names | Assignments not shown or client names not linked |
| **PAG-12** | ClinicianDetailPage assignments link to clients | Clicking a client name in assignments navigates to `/clients/:clientId` | No navigation or wrong destination |
| **PAG-13** | ClientListPage renders all clients | Page displays all 6 mock clients on load | Any client missing from list |
| **PAG-14** | ClientListPage shows required columns | Each entry shows: name, tier badge, setting, ACCM name, active assignments count | Any required column missing |
| **PAG-15** | ClientListPage filter by tier | Selecting a tier filter shows only clients with that `careTier` | Filter wrong or no-ops |
| **PAG-16** | ClientListPage filter by ACCM | Selecting an ACCM filter shows only clients with that `accmOwnerId` | Filter wrong or no-ops |
| **PAG-17** | ClientListPage filter by setting | Selecting a setting filter shows only clients with that `serviceSetting` | Filter wrong or no-ops |
| **PAG-18** | ClientListPage click navigates to detail | Clicking a client row/card navigates to `/clients/:clientId` | Click does nothing or wrong route |
| **PAG-19** | ClientDetailPage loads correct data | Navigating to `/clients/:clientId` displays profile for that specific client | Wrong client displayed or page errors |
| **PAG-20** | ClientDetailPage shows info section | Displays: name, tier, setting, status, ACCM, service city/zip, facility info (if applicable) | Any profile field missing |
| **PAG-21** | ClientDetailPage shows care needs section | Displays: required disciplines, required competencies, primary diagnosis category | Care needs section absent |
| **PAG-22** | ClientDetailPage shows shift needs section | Lists ShiftNeeds associated with this client via `ShiftNeedCard` component | Shift needs not shown |
| **PAG-23** | ClientDetailPage shows assignments section | Lists active CareAssignments with linked clinician names | Assignments not shown or clinician names not linked |
| **PAG-24** | ClientDetailPage assignments link to clinicians | Clicking a clinician name in assignments navigates to `/clinicians/:clinicianId` | No navigation or wrong destination |
| **PAG-25** | TierBadge color coding | L1 = green, L2 = blue, L3 = orange, L4 = red (per implementation prompt) | Wrong colors or no visual distinction |
| **PAG-26** | DisciplineBadge renders | Discipline badge component renders a recognizable indicator for each discipline | Component missing or not rendering |

---

### Category 4: Route Registration

| ID | Description | Pass Condition | Fail Condition |
|---|---|---|---|
| **RTE-01** | `/clinicians` route registered | Route exists in `App.tsx` and loads `ClinicianListPage` | Route missing or loads wrong component |
| **RTE-02** | `/clinicians/:clinicianId` route registered | Route exists in `App.tsx` and loads `ClinicianDetailPage` | Route missing or loads wrong component |
| **RTE-03** | `/clients` route registered | Route exists in `App.tsx` and loads `ClientListPage` | Route missing or loads wrong component |
| **RTE-04** | `/clients/:clientId` route registered | Route exists in `App.tsx` and loads `ClientDetailPage` | Route missing or loads wrong component |
| **RTE-05** | All routes inside ProtectedRoute | All four routes are children of the `<ProtectedRoute>` wrapper (inside the `path="*"` catch-all that wraps `CommandCenterLayout`) | Any route accessible without authentication |
| **RTE-06** | All routes inside CommandCenterLayout | All four routes render within `CommandCenterLayout` (sidebar visible on all pages) | Any page renders without sidebar |
| **RTE-07** | Sidebar nav entry for Clinicians | `CommandCenterLayout` has a nav item labeled "Clinicians" with `to="/clinicians"` and a Lucide `Users` icon | Nav entry missing or wrong icon |
| **RTE-08** | Sidebar nav entry for Clients | `CommandCenterLayout` has a nav item labeled "Clients" with `to="/clients"` and a Lucide `Heart` icon | Nav entry missing or wrong icon |
| **RTE-09** | Lazy-loading enforced | All four page components loaded via `React.lazy()` with `<Suspense>` fallback | Direct import without lazy loading |
| **RTE-10** | Invalid clinician ID handled | Navigating to `/clinicians/nonexistent-id` shows a graceful "not found" state, not a crash | White screen, unhandled error, or React error boundary triggered |
| **RTE-11** | Invalid client ID handled | Navigating to `/clients/nonexistent-id` shows a graceful "not found" state, not a crash | White screen, unhandled error, or React error boundary triggered |

---

### Category 5: No-Write Enforcement (Read-Only)

| ID | Description | Pass Condition | Fail Condition |
|---|---|---|---|
| **RON-01** | No "Create" buttons | No "Add Clinician", "Add Client", "Create Assignment", or similar buttons exist anywhere in Phase 1 pages | Any create/add button present |
| **RON-02** | No "Edit" buttons | No "Edit Profile", "Edit Credentials", "Update" buttons on any detail page | Any edit/update button present |
| **RON-03** | No "Delete" buttons | No "Remove", "Delete", "Archive" buttons on any page | Any delete/remove button present |
| **RON-04** | No form inputs for data modification | No `<input>`, `<textarea>`, `<select>` elements that would submit data changes (filter controls are acceptable) | Any form field that modifies entity data |
| **RON-05** | No POST/PUT/DELETE API calls | Codebase search for `fetch`, `axios`, or API service calls shows zero write operations | Any mutation endpoint called |
| **RON-06** | Zustand stores are read-only | Store actions are limited to `get*` and `filterBy*` patterns. No `create*`, `update*`, `delete*`, `set*` (beyond initial seeding) actions exist. | Any mutation action in stores |

---

### Category 6: No-PHI Enforcement

| ID | Description | Pass Condition | Fail Condition |
|---|---|---|---|
| **PHI-01** | No dateOfBirth displayed | No page, component, or mock data file contains or renders a date of birth field | `dateOfBirth`, `dob`, or `DOB` appears in any rendered output |
| **PHI-02** | No primaryDiagnosis text displayed | No page renders a free-text diagnosis field. Only `primaryDiagnosisCategory` (category-level) is acceptable. | A field named `primaryDiagnosis` (without "Category") is rendered |
| **PHI-03** | No full address displayed | No page renders a street address, full address object, or `ClientAddress` type | Street address, apartment number, or full mailing address visible |
| **PHI-04** | No demographic data displayed | No page renders `demographicRace`, `demographicSex`, `demographicAge`, or equivalent fields | Any demographic field visible on any screen |
| **PHI-05** | primaryDiagnosisCategory acceptable | If displayed, `primaryDiagnosisCategory` shows only a general category (e.g., "Cardiac", "Wound Care", "Neurological") — not specific ICD codes or diagnosis text | Specific ICD-10 codes or detailed diagnosis text shown |
| **PHI-06** | No real person data in mock files | Mock data files contain only fictional names, fictional credential numbers, fictional addresses | Any data traceable to a real person |

---

### Category 7: No Scope Creep

| ID | Description | Pass Condition | Fail Condition |
|---|---|---|---|
| **NSC-01** | No matching engine logic | No files contain matching/scoring algorithms, `matchScore` computation, `isEligible()` functions, or Layer 1/Layer 2 logic | Any matching/scoring code present |
| **NSC-02** | No external API calls | No `fetch()` or HTTP calls to external services (AlayaCare, WellSky, Google Maps, etc.) | Any external service integration |
| **NSC-03** | No AlayaCare references | Zero references to "AlayaCare" in any new Phase 1 file | AlayaCare mentioned in code (documentation references acceptable) |
| **NSC-04** | No WellSky references | Zero references to "WellSky" in any new Phase 1 file | WellSky mentioned in code |
| **NSC-05** | No CES file modifications | `git diff` shows zero changes to files under `src/policy/ces/` | Any CES file modified |
| **NSC-06** | No eCIgn file modifications | `git diff` shows zero changes to files under `src/policy/ecign/` | Any eCIgn file modified |
| **NSC-07** | No PM file modifications | `git diff` shows zero changes to files under `src/policy/pm/` | Any PM file modified |
| **NSC-08** | No Journey file modifications | `git diff` shows zero changes to files under `src/policy/journey/` | Any Journey file modified |
| **NSC-09** | No AuthProvider modifications | `git diff` shows zero changes to `src/auth/AuthProvider.tsx` | AuthProvider.tsx modified |
| **NSC-10** | No demographic data in mock matching | Mock data does not use `demographicRace`, `demographicSex`, or `demographicAge` in any assignment logic or data field | Demographic fields present in mock data used for assignment decisions (per Planning_Implementation.md Part 5) |
| **NSC-11** | Directory structure follows convention | New files exist only under `src/policy/clinician/` and `src/policy/client/` (plus route registration in `App.tsx` and nav in `CommandCenterLayout.tsx`) | Files created outside designated directories |

---

### Category 8: Component & Store Quality

| ID | Description | Pass Condition | Fail Condition |
|---|---|---|---|
| **CSQ-01** | ClinicianCard component exists | `src/policy/clinician/components/ClinicianCard.tsx` exists and exports a React component | File missing |
| **CSQ-02** | CredentialBadge component exists | `src/policy/clinician/components/CredentialBadge.tsx` exists and renders green/yellow/red based on credential status/expiry | File missing or no color logic |
| **CSQ-03** | DisciplineBadge component exists | `src/policy/clinician/components/DisciplineBadge.tsx` exists and exports a component | File missing |
| **CSQ-04** | ClientCard component exists | `src/policy/client/components/ClientCard.tsx` exists and exports a React component | File missing |
| **CSQ-05** | TierBadge component exists | `src/policy/client/components/TierBadge.tsx` exists with L1=green, L2=blue, L3=orange, L4=red | File missing or wrong colors |
| **CSQ-06** | ShiftNeedCard component exists | `src/policy/client/components/ShiftNeedCard.tsx` exists and exports a component | File missing |
| **CSQ-07** | clinicianStore has required actions | Store exposes: `getClinicians()`, `getClinicianById(id)`, `filterByDiscipline(d)`, `filterByStatus(s)` | Any action missing |
| **CSQ-08** | clientStore has required actions | Store exposes: `getClients()`, `getClientById(id)`, `filterByTier(t)`, `filterByAccm(id)`, `filterBySetting(s)` | Any action missing |
| **CSQ-09** | Stores seeded from mock data | Both stores initialize with mock data on creation (no API calls required) | Stores start empty or require API calls |
| **CSQ-10** | Tailwind styling consistent | New pages use Tailwind utility classes consistent with existing pages (same spacing, color palette, typography patterns) | Inline styles, CSS modules, or divergent styling approach |
| **CSQ-11** | Existing UI primitives used | Components leverage existing primitives from `src/policy/components/ui/` where applicable (buttons, cards, badges, etc.) | Custom UI primitives created when existing ones suffice |

---

## Traceability Matrix

Every acceptance criterion traced to its authoritative source:

| Criterion ID(s) | Requirement Source | Source Location |
|---|---|---|
| TYP-01 through TYP-09 | Clinician & Client type definitions | Architecture.md lines 1384–1392 |
| TYP-10 | CareAssignment.assignmentRole | Architecture.md line 1268–1275 |
| TYP-11 through TYP-16 | Client & ShiftNeed type definitions | Architecture.md lines 1391–1392, 1289–1305 |
| TYP-17 | No `any` types | UAT standard (TypeScript best practice) |
| TYP-18 | PHI field deferral | Architecture.md lines 1260–1264 ("DEFER" comments) |
| TYP-19 | Compilation requirement | UAT standard |
| TYP-20 | Terminology enforcement | Architecture.md lines 1368–1371 ("NEVER use Skill") |
| TYP-21 | Export requirement | Standard module convention |
| MOC-01, MOC-02 | Clinician mock data spec | Architecture.md line 1394 |
| MOC-03, MOC-04 | Status/employment diversity | Architecture.md line 1394 ("Mix of active/pending/inactive. Mix of employmentTypes") |
| MOC-05 | Accommodation fields | Architecture.md lines 70–79 (P0 compliance) |
| MOC-06, MOC-07, MOC-08 | Client mock data spec | Architecture.md line 1395 |
| MOC-09 | ACCM ownership | Architecture.md line 1395 ("Each has an accmOwnerId") |
| MOC-10 | Assignment count | Architecture.md line 1396 |
| MOC-11, MOC-12 | Shift need spec | Architecture.md line 1397 |
| MOC-13 through MOC-16 | FK integrity | Implicit in relational model (Architecture.md Section 3) |
| MOC-17 | No PHI in mock data | Architecture.md line 1424 + HIPAA compliance |
| MOC-18 | Bay Area names | Architecture.md line 1394 |
| MOC-19 | Unique IDs | Architecture.md Section 9 Data Integrity Rules |
| MOC-20 | Traceable assignment source | Planning_Implementation.md Part 5 ("Every assignment has traceable source") |
| MOC-21 | Timestamps | Architecture.md entity definitions (createdAt required on all) |
| PAG-01 through PAG-12 | Clinician pages | Architecture.md lines 1402–1404 |
| PAG-13 through PAG-24 | Client pages | Architecture.md lines 1405–1406 |
| PAG-25 | TierBadge colors | Architecture.md line 1411 |
| PAG-26 | DisciplineBadge | Architecture.md line 1409 |
| RTE-01 through RTE-04 | Route paths | Architecture.md lines 1413–1417 |
| RTE-05, RTE-06 | ProtectedRoute + CommandCenterLayout | Architecture.md line 1418 |
| RTE-07, RTE-08 | Sidebar nav entries | Architecture.md line 1419 |
| RTE-09 | Lazy loading | Architecture.md line 1430 |
| RTE-10, RTE-11 | Error handling | UAT standard (graceful degradation) |
| RON-01 through RON-06 | Read-only enforcement | Architecture.md lines 1422–1423 |
| PHI-01 through PHI-06 | No-PHI enforcement | Architecture.md line 1424, lines 1260–1264 |
| NSC-01 | No matching engine | Architecture.md line 1423 |
| NSC-02 through NSC-04 | No external integrations | Architecture.md line 1425 |
| NSC-05 through NSC-09 | No modification of existing files | Architecture.md lines 1426–1427 + Readiness doc Section "Files That Must NOT Be Modified" |
| NSC-10 | No demographic data in matching | Planning_Implementation.md Part 5 ("No demographic data used in mock matching logic") |
| NSC-11 | Directory structure | Architecture.md lines 1380–1381, Readiness doc "Where New Files Should Be Added" |
| CSQ-01 through CSQ-06 | Component inventory | Architecture.md lines 1407–1412 |
| CSQ-07, CSQ-08 | Store actions | Architecture.md lines 1399–1400 |
| CSQ-09 | Mock data seeding | Architecture.md line 1399 ("seeded from mock data") |
| CSQ-10, CSQ-11 | Styling consistency | Architecture.md lines 1428–1429 |

---

## Risk Items: Missing or Underspecified Acceptance Criteria

The following gaps were identified where the current implementation prompt lacks explicit testable criteria. These represent areas where an implementer could deviate without technically violating the prompt:

### RISK-01: Deferred Field Exclusion Not Verifiable via Prompt Alone

**Description:** The implementation prompt says "Do NOT add PHI fields (no DOB, no diagnosis text, no full address)" but the Architecture.md data model (lines 1260–1264) shows these fields as commented-out `// DEFER` entries. An implementer could include them as commented code, which technically satisfies "no PHI fields" but violates clean deferred-field practice.

**Recommendation:** Add to implementation prompt constraints: "Deferred fields must be completely absent from type definitions — not commented out, not marked as `// TODO`, not present in any form."

### RISK-02: Mock Data FK Integrity Not Explicitly Required

**Description:** The implementation prompt specifies record counts (10 clinicians, 6 clients, 8 assignments, 6 shift needs) but does not explicitly require FK consistency. An implementer could create 8 assignments that reference `clinicianId` values not present in the 10 clinicians.

**Recommendation:** Add to implementation prompt: "All foreign key references in mock data must resolve — every clinicianId in assignments must exist in mockClinicians, every clientId must exist in mockClients."

### RISK-03: Lazy-Loading Enforcement Unverifiable Without Inspection

**Description:** The prompt says "Lazy-load all new pages with React.lazy()" but the existing codebase (App.tsx) does NOT use React.lazy() for any current pages — they are directly imported. This creates a conflict between the instruction and existing patterns.

**Recommendation:** Clarify whether the implementer should: (a) use React.lazy() diverging from existing patterns, or (b) follow existing import patterns for consistency. If lazy-loading is required, add a verification criterion: "All four page imports in App.tsx use `const XPage = lazy(() => import(...))` syntax."

### RISK-04: Accommodation Fields Ambiguity

**Description:** The Architecture.md full data model (lines 70–79) defines accommodation fields (`religiousRestrictions[]`, `adaAccommodations[]`, `pregnancyAccommodation`, `fmlaLeave`, `schedulingLimitations[]`) as "REQUIRED — P0 Compliance per FEHA ADS." However, the simplified Phase 1 Clinician interface (Architecture.md line 1388) does NOT include these fields. The implementation prompt is silent on whether accommodations should be part of Phase 1 types.

**Recommendation:** Explicitly decide: either add accommodation fields to Phase 1 Clinician type (and require 2+ clinicians in mock data to populate them), OR explicitly defer them with a note in the Phase 1 prompt. Given FEHA P0 priority, recommend including at minimum a `schedulingLimitations?: string[]` field.

### RISK-05: "filterBySetting" Listed but No UI Filter Specified for Setting

**Description:** The `clientStore` specifies a `filterBySetting(s)` action (Architecture.md line 1400), and the ClientListPage mentions "tier, setting, and ACCM filters" (line 1404). However, with only 6 clients in 2 settings, the setting filter may be trivial. More importantly, the UI mockup doesn't specify filter component design.

**Recommendation:** Accept as-is — filter presence is testable regardless of data volume. Filter UX design is left to implementer's discretion within Tailwind conventions.

### RISK-06: Planning_Implementation.md Part 5 Recommendations Not Reflected in Prompt

**Description:** Planning_Implementation.md Part 5 explicitly recommends two acceptance criteria additions:
1. "No demographic data used in mock matching logic"
2. "Every assignment has traceable source"

These are NOT present in the implementation prompt's constraint list (Architecture.md lines 1422–1430).

**Recommendation:** Add both as explicit constraints in the implementation prompt. These have been captured as NSC-10 and MOC-20 in this review.

---

## Recommended Additions to the Implementation Prompt

Based on this review, the following additions would close identified gaps:

### Addition 1: FK Integrity Constraint
Add to CONSTRAINTS section:
> "All mock data foreign keys must resolve. Every `clinicianId` in CareAssignments must exist in mockClinicians. Every `clientId` must exist in mockClients. Every `ShiftNeed.assignedCareAssignmentId` (if populated) must exist in mockCareAssignments."

### Addition 2: Deferred Field Exclusion Rule
Add to CONSTRAINTS section:
> "Deferred fields (dateOfBirth, primaryDiagnosis, address, matchScore, SupervisoryVisit entity, AvailabilityWindow entity) must be completely absent from type definitions — not commented out, not marked TODO."

### Addition 3: Planning_Implementation.md Part 5 Criteria
Add to CONSTRAINTS section:
> "No demographic data (race, sex, age) in mock data or any assignment logic."  
> "Every CareAssignment must have a populated `assignedBy` field documenting the assignment source."

### Addition 4: Error State Handling
Add to CREATE PAGES section:
> "All detail pages must handle invalid/nonexistent IDs gracefully (show 'not found' message, do not crash)."

### Addition 5: Terminology Enforcement Verification
Add to CONSTRAINTS section:
> "The word 'Skill' must not appear as a type name, field name, or primary term in any new file. Use 'Competency' for capabilities and 'Discipline' for professional categories."

### Addition 6: Accommodation Fields Decision
Add to CREATE TYPES (clinician) section, one of:
> **Option A (Include):** "Add `religiousRestrictions?: object[]`, `adaAccommodations?: object[]`, `schedulingLimitations?: string[]` to Clinician type. Populate on at least 2 mock clinicians."  
> **Option B (Explicit Defer):** "Accommodation fields (religiousRestrictions, adaAccommodations, pregnancyAccommodation, fmlaLeave) are explicitly deferred to Phase 2. Do not include in Phase 1 types."

---

## Test Execution Checklist

For UAT sign-off, execute in this order:

1. **Compilation gate:** `tsc --noEmit` — all types compile (TYP-19)
2. **Static analysis:** Grep for `any`, `Skill`, PHI field names, AlayaCare, WellSky (TYP-17, TYP-20, PHI-*, NSC-03, NSC-04)
3. **File inventory:** Verify all 16+ expected files exist in correct directories (CSQ-01–06, NSC-11)
4. **Mock data audit:** Count records, verify FK integrity, check diversity (MOC-01–21)
5. **Route verification:** Navigate to all 4 routes, verify ProtectedRoute and CommandCenterLayout wrapping (RTE-01–08)
6. **Page functionality:** Exercise all list pages, filters, detail pages, cross-links (PAG-01–26)
7. **Read-only audit:** Inspect all pages for any create/edit/delete affordances (RON-01–06)
8. **Scope creep audit:** `git diff` for existing file modifications (NSC-05–09)
9. **Lazy-load verification:** Inspect App.tsx imports for React.lazy() usage (RTE-09)
10. **Error handling:** Navigate to invalid IDs (RTE-10, RTE-11)

---

## Sign-Off Criteria

Phase 1 Staffing MVP passes acceptance when:

- [ ] All 72 acceptance criteria evaluated
- [ ] Zero **FAIL** results on TYP-*, RTE-*, RON-*, PHI-*, NSC-* categories (zero tolerance)
- [ ] Maximum 2 **FAIL** results on MOC-* category (minor data gaps acceptable if documented)
- [ ] Maximum 3 **FAIL** results on PAG-* category (UI polish issues acceptable if functionality works)
- [ ] Maximum 1 **FAIL** result on CSQ-* category (component naming/structure issues acceptable if functionality works)
- [ ] All 6 RISK items addressed (either resolved or explicitly deferred with documentation)

---

*Review completed by: UAT / Acceptance Criteria Reviewer*  
*Document version: 1.0*  
*Next review: Post-implementation, before Phase 1 demo*
