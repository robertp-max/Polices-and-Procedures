# Phase 1 Clinician Profile & Patient Profile — Final Implementation Prompt

**Document ID:** STAFFING-MVP-P1-09
**Version:** 1.1 (Naming Convention Update — Patient terminology, no Calendar build, no Brad/Staffing Helper branding)
**Date:** 2026-05-13
**Status:** APPROVED FOR IMPLEMENTATION
**Target:** Cursor coding agent (Claude 4.6 Sonnet/Opus or earlier — never Claude 4.7)

---

## 1. CONTEXT

You are implementing Phase 1 of the Clinician Profile and Patient Profile foundation for the Care Indeed Compliance Platform (`ci-policy-app`). This is a React 19 + TypeScript + Zustand + Tailwind CSS application.

Phase 1 builds the **read-only profile foundation**: TypeScript types, synthetic mock data, Zustand stores, and 4 display pages for clinician and patient profiles. There is no matching engine, no write UI, no API integration, no server-side code, and no calendar/scheduling view.

**Phase 1 Capability Naming — STRICT:**

The following names are **forbidden** for Phase 1 features, modules, files, routes, sidebar entries, page titles, banners, or any user-facing label:

- iStaffing
- Staffing Helper
- Brad Workforce AI
- Brad System
- Brad Platform
- Brad App

Use plain feature names instead:

- **Clinician Profile**
- **Patient Profile**
- **Calendar** (reserved — do NOT build in Phase 1)

**ADS / FEHA Context (preserve verbatim in code comments where relevant):**

> "Phase 1 is a read-only Clinician Profile and Patient Profile foundation using synthetic data. Future AI-assisted staffing recommendations may be treated as Automated Decision System decision-support activity under California FEHA. Phase 1 must preserve the data fields, terminology, and audit-ready structure needed for future ADS compliance, but Phase 1 does not perform active matching, autonomous scheduling, or production staffing decisions."

Use **"AI-assisted recommendation"** language only inside future-readiness or ADS/FEHA context. Do NOT imply Phase 1 has active AI matching, autonomous scheduling, or production scheduling automation.

**Scope Boundary:** This prompt is the SOLE build specification for Phase 1. Do NOT reference Architecture.md, Planning_Implementation.md, or any other document for field lists, entity definitions, or page specifications. Use ONLY the interfaces, mock data specs, and page specs defined in this document.

---

## 2. TERMINOLOGY (Enforce Strictly)

| Term | Meaning | Usage Rule |
|---|---|---|
| **Discipline** | Professional/service category (RN, LVN, HHA, Caregiver, PT, OT, ST, MSW, CNA) | PRIMARY matching axis. Use for field names: `primaryDiscipline`, `requiredDiscipline`. |
| **Competency** | Specific capability/experience (wound care, IV therapy, OASIS, trach care, Hoyer lift) | SECONDARY matching. Use for field names: `competencies`, `requiredCompetencies`. |
| **Credential** | License/certification/document proving eligibility | Compliance gating. Use for field names: `credentials`. |
| **Skill** | — | **NEVER use.** Not as a type name, field name, variable name, comment term, or UI label. |
| **Patient** | The person receiving care (person side of staffing) | Use in all UI labels. Use as the internal entity name (`Patient`, `PatientProfile`, `mockPatients`, `patientStore`, `PatientListPage`, `PatientDetailPage`). |
| **Client** | — | **Do NOT use** as a UI label or user-visible term. The relationship-level entity is `ClinicianPatientConnection`, not "CareAssignment" or "ClinicianClientAssignment". |
| **Connection** | The clinician↔patient relationship record | Use `ClinicianPatientConnection` for the type, `connections` for collections. |

---

## 3. NAMING CONVENTIONS

| Element | Convention | Example |
|---|---|---|
| TypeScript types | PascalCase interface | `interface Clinician {}` |
| Zustand stores | camelCase + Store suffix, exported as `use[Name]Store` | `export const usePatientStore = create<PatientStoreState>()(...)` |
| React pages | PascalCase + Page suffix, **named export** (not default) | `export function PatientListPage() {}` |
| React components | PascalCase, **named export** | `export function CredentialBadge() {}` |
| Route paths | kebab-case plural | `/clinicians`, `/patients` |
| Feature directory | lowercase under `src/policy/` | `src/policy/staffing/` |
| Types file | `types.ts` in feature root | `src/policy/staffing/types.ts` |
| Data files | descriptive camelCase | `mockClinicians.ts`, `mockPatients.ts` |
| String enums | snake_case for multi-word values | `'on_leave'`, `'pending_approval'` |

**Note:** The internal directory remains `src/policy/staffing/` because it is an internal organizational folder, not a user-facing label. The Phase 1 user-facing capability is presented as "Clinician Profile" and "Patient Profile" only.

---

## 4. FILE STRUCTURE

Create this exact directory structure:

```
src/policy/staffing/
├── index.ts                           (barrel exports)
├── types.ts                           (ALL profile types — single source of truth)
├── stores/
│   ├── clinicianStore.ts              (Zustand: useClinicianStore)
│   └── patientStore.ts                (Zustand: usePatientStore)
├── data/
│   ├── mockClinicians.ts              (exports MOCK_CLINICIANS, MOCK_CONNECTIONS)
│   ├── mockPatients.ts                (exports MOCK_PATIENTS, MOCK_SHIFT_NEEDS)
│   └── disclaimer.ts                  (exports DEMO_DISCLAIMER, MOCK_DATA_NOTICE)
├── pages/
│   ├── ClinicianListPage.tsx
│   ├── ClinicianDetailPage.tsx
│   ├── PatientListPage.tsx
│   └── PatientDetailPage.tsx
└── components/
    ├── ClinicianCard.tsx
    ├── PatientCard.tsx
    ├── CredentialBadge.tsx
    ├── DisciplineBadge.tsx
    ├── TierBadge.tsx
    ├── StatusBadge.tsx
    ├── ShiftNeedCard.tsx
    └── DemoBanner.tsx
```

**Barrel export (`index.ts`):**
```typescript
export * from './types';
export { useClinicianStore } from './stores/clinicianStore';
export { usePatientStore } from './stores/patientStore';
```

---

## 5. TYPE DEFINITIONS

Create all types in `src/policy/staffing/types.ts`. This is the single source of truth for all Phase 1 staffing/profile types.

```typescript
// ============================================================
// PHASE 1 — CLINICIAN PROFILE & PATIENT PROFILE TYPES
// Terminology: Discipline (primary), Competency (secondary),
//              Credential (documents). NEVER use "Skill".
//              The person receiving care is "Patient" — never
//              "Client" — in user-facing labels and internal
//              names.
// ADS NOTE:    Phase 1 is read-only synthetic data. Future
//              AI-assisted staffing may be ADS decision-support
//              under CA FEHA. Phase 1 preserves the data
//              shape required for future compliance but does
//              NOT perform active matching, autonomous
//              scheduling, or production decisions.
// ============================================================

// --- Shared Enums ---

export type Discipline =
  | 'RN' | 'LVN' | 'LPN'
  | 'PT' | 'PTA'
  | 'OT' | 'COTA'
  | 'ST' | 'SLP'
  | 'MSW'
  | 'HHA' | 'CNA'
  | 'Caregiver';

export type CareTier =
  | 'L1_essential'
  | 'L2_enhanced'
  | 'L3_specialized'
  | 'L4_critical';

export type ClinicianStatus =
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'pending'
  | 'suspended'
  | 'terminated';

export type PatientStatus =
  | 'active'
  | 'inactive'
  | 'discharged'
  | 'pending'
  | 'on_hold';

export type ConnectionStatus =
  | 'eligible'
  | 'preferred'
  | 'restricted'
  | 'blocked'
  | 'assigned'
  | 'pending_approval'
  | 'inactive';

export type ConnectionSource =
  | 'system_recommendation'
  | 'manual_assignment'
  | 'manual_override'
  | 'patient_request'
  | 'clinician_request'
  | 'historical_continuity';

export type CredentialStatus =
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'pending_verification'
  | 'revoked';

export type ShiftNeedStatus =
  | 'open'
  | 'filled'
  | 'cancelled';

export type ShiftType =
  | 'recurring'
  | 'prn'
  | 'soc'
  | 'discharge'
  | 'supervisory'
  | 'respite';

export type Priority =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export type AssignmentRole =
  | 'primary'
  | 'secondary'
  | 'prn'
  | 'supervisory';

// --- Embedded Types ---

export interface Competency {
  name: string;
  level?: 'basic' | 'intermediate' | 'advanced';
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Credential {
  type: string;
  credentialName: string;
  issuingBody?: string;
  licenseNumber?: string;
  state?: string;
  issuedAt: string;
  expiresAt?: string;
  daysUntilExpiry?: number;
  verifiedAt?: string;
  verifiedBy?: string;
  status: CredentialStatus;
  evidenceRef?: string;
}

export interface ReligiousRestriction {
  day: string;
  timeRange?: string;
  description?: string;
  recurring?: boolean;
}

export interface AdaAccommodation {
  type: string;
  description: string;
  effectiveDate: string;
  reviewDate?: string;
}

export interface PregnancyAccommodation {
  active: boolean;
  details?: string;
  expectedEndDate?: string;
}

export interface FmlaLeave {
  active: boolean;
  startDate?: string;
  endDate?: string;
  leaveType?: string;
  intermittent?: boolean;
}

export interface SchedulingLimitation {
  type: string;
  description?: string;
}

export interface ShiftBlocker {
  type: string;
  description: string;
  clinicianId?: string;
}

// --- Core Entities ---

export interface Clinician {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  email?: string;
  phone?: string;

  primaryDiscipline: Discipline;
  secondaryDisciplines?: Discipline[];
  competencies: Competency[];
  credentials: Credential[];

  employmentType: 'W2' | 'contractor';
  hireDate?: string;
  status: ClinicianStatus;

  orgRole?: 'field_clinician' | 'supervisor' | 'accm' | 'ccm' | 'vcc' | 'admin';
  supervisorId?: string;
  cgssId?: string;

  serviceAreas?: string[];
  maxHoursPerWeek?: number;

  religiousRestrictions?: ReligiousRestriction[];
  adaAccommodations?: AdaAccommodation[];
  pregnancyAccommodation?: PregnancyAccommodation;
  fmlaLeave?: FmlaLeave;
  schedulingLimitations?: SchedulingLimitation[];

  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;

  serviceSetting: 'home' | 'facility';
  serviceEntity: 'home_care';
  careTier: CareTier;
  weightedCaseloadPoints: number;
  status: PatientStatus;

  accmOwnerId: string;
  ccmId?: string;

  serviceZone?: string;
  facilityId?: string;
  facilityName?: string;

  admissionDate?: string;
  dischargeDate?: string;

  requiredDisciplines: Discipline[];
  requiredCompetencies?: string[];
  continuityPriority?: 'low' | 'medium' | 'high';

  createdAt: string;
  updatedAt: string;
}

export interface ClinicianPatientConnection {
  id: string;
  clinicianId: string;
  patientId: string;
  connectionStatus: ConnectionStatus;
  source: ConnectionSource;
  discipline: Discipline;
  assignmentRole: AssignmentRole;
  startDate: string;
  endDate?: string;

  assignedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalRationale?: string;
  overrideReason?: string;

  priorAssignmentCount?: number;
  lastWorkedDate?: string;
  continuityFlag?: boolean;

  lastSupervisoryVisit?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftNeed {
  id: string;
  patientId: string;
  requiredDiscipline: Discipline;
  requiredCompetencies?: string[];
  isHardRequirement: boolean;
  visitDate: string;
  visitWindow?: { startTime: string; endTime: string };
  shiftType?: ShiftType;
  priority?: Priority;
  acuityLevel?: CareTier;
  frequency?: string;
  preferredDays?: string[];
  durationHours?: number;
  startDate: string;
  endDate?: string;
  status: ShiftNeedStatus;
  assignedConnectionId?: string;
  blockers?: ShiftBlocker[];
  notes?: string;
  createdAt: string;
}

// --- Type Stubs (define only — no store, no UI, no logic) ---

export interface AuditLogEntry {
  id: string;
  entityType: 'clinician' | 'patient' | 'connection' | 'credential' | 'competency' | 'shift_need';
  entityId: string;
  action: 'created' | 'updated' | 'status_changed' | 'approved' | 'rejected' | 'overridden';
  fieldChanged?: string;
  previousValue?: unknown;
  newValue?: unknown;
  performedBy: string;
  performedByRole?: string;
  rationale?: string;
  timestamp: string;
}

export interface AdsDecisionLog {
  id: string;
  decisionType: 'eligibility_check' | 'ranking' | 'recommendation';
  shiftNeedId: string;
  inputFactors: Record<string, unknown>;
  outputResult: Record<string, unknown>;
  biasCheckResult?: Record<string, unknown>;
  retentionExpiresAt: string;
  timestamp: string;
}
```

**Key constraints on types:**
- `serviceEntity` is locked to the literal `'home_care'`. Do NOT add `'home_health'` until Phase 3.
- `AuditLogEntry` and `AdsDecisionLog` are type stubs only. Do NOT create stores, UI, or population logic for them.
- `lastSupervisoryVisit` exists on `ClinicianPatientConnection` for forward compatibility but must NOT be displayed in any Phase 1 UI component.
- Deferred fields (`dateOfBirth`, `primaryDiagnosis`, `address`, `serviceZip`, `serviceCity`, `primaryDiagnosisCategory`, `demographicRace`, `demographicSex`, `demographicAge`) must be completely absent — not commented out, not marked TODO.
- `ConnectionSource` uses `'system_recommendation'` (NOT `'brad_recommendation'`) so no Brad branding leaks into Phase 1 UI when the source value is rendered.

---

## 6. MOCK DATA SPECIFICATION

### 6.1 Disclaimer Constants

Create `src/policy/staffing/data/disclaimer.ts`:

```typescript
export const DEMO_DISCLAIMER =
  'Demonstration environment. Synthetic data. Not production-validated.';

export const MOCK_DATA_NOTICE =
  'ALL NAMES ARE FICTIONAL. Any resemblance to real persons is coincidental.';

export const ADS_FUTURE_READINESS_NOTE =
  'Phase 1 is a read-only Clinician Profile and Patient Profile foundation using synthetic data. ' +
  'Future AI-assisted staffing recommendations may be treated as Automated Decision System ' +
  'decision-support activity under California FEHA. Phase 1 preserves the data fields, ' +
  'terminology, and audit-ready structure needed for future ADS compliance but does not ' +
  'perform active matching, autonomous scheduling, or production staffing decisions.';
```

### 6.2 Clinicians (10 records)

Export as `MOCK_CLINICIANS: Clinician[]` from `mockClinicians.ts`.

Add a file-level comment: `// ALL NAMES ARE FICTIONAL. Any resemblance to real persons is coincidental.`

| # | Discipline | Status | Employment | Accommodation Data | Credential Notes | orgRole | Notes |
|---|---|---|---|---|---|---|---|
| 1 | RN | active | W2 | religiousRestrictions: 1 entry (Sabbath observer — Saturday unavailable, recurring: true) | All credentials active | field_clinician | |
| 2 | RN | active | contractor | — | All credentials active | field_clinician | |
| 3 | LVN | active | W2 | — | 1 credential with status: 'expired' (CA LVN license expired 2 months ago), daysUntilExpiry: -60 | field_clinician | Demonstrates hard gate |
| 4 | LVN | pending | W2 | — | 1 credential with status: 'pending_verification' | field_clinician | |
| 5 | PT | active | contractor | — | All credentials active | field_clinician | |
| 6 | OT | active | W2 | adaAccommodations: 1 entry (lifting restriction) | 1 credential with status: 'expiring_soon', daysUntilExpiry: 30 | field_clinician | |
| 7 | HHA | active | W2 | — | All credentials active | accm | accmOwnerId target for patients 1, 2, 5 |
| 8 | HHA | on_leave | W2 | fmlaLeave: { active: true, startDate, endDate, leaveType: 'FMLA' } | All credentials active | field_clinician | Demonstrates FMLA blocking |
| 9 | CNA | active | W2 | — | All credentials active | accm | accmOwnerId target for patients 3, 4, 6. Minimal optional fields. |
| 10 | Caregiver | inactive | contractor | — | All credentials active | field_clinician | |

**Requirements:**
- Use clearly fictional, culturally diverse names. Do NOT copy names from any real Care Indeed employee or public person.
- Each clinician must have at least 1 credential with complete fields (type, credentialName, issuingBody, issuedAt, status).
- Each clinician must have at least 1 competency with name and level.
- At least 2 clinicians (#7, #9) must have `orgRole: 'accm'` — these are the ACCM owners referenced by patients.
- All IDs must be unique stable identifiers (e.g., `'clin-001'` through `'clin-010'`).
- All records must have `createdAt` and `updatedAt` as valid ISO-8601 date strings.

### 6.3 Patients (6 records)

Export as `MOCK_PATIENTS: Patient[]` from `mockPatients.ts`.

| # | CareTier | Setting | accmOwnerId | weightedCaseloadPoints | Zone | Notes |
|---|---|---|---|---|---|---|
| 1 | L1_essential | home | Clinician #7 ID | 0.5 | North Bay | |
| 2 | L1_essential | home | Clinician #7 ID | 0.5 | North Bay | |
| 3 | L2_enhanced | facility | Clinician #9 ID | 0.75 | Peninsula | Has facilityId and facilityName |
| 4 | L2_enhanced | home | Clinician #9 ID | 0.75 | East Bay | Minimal optional fields populated |
| 5 | L3_specialized | home | Clinician #7 ID | 1.0 | North Bay | continuityPriority: 'high' |
| 6 | L4_critical | facility | Clinician #9 ID | 1.0 | Peninsula | Has facilityId and facilityName |

**Requirements:**
- Use clearly fictional patient names with a file-level `MOCK_DATA_NOTICE` comment.
- `weightedCaseloadPoints` is pre-computed: L1→0.5, L2→0.75, L3/L4→1.0. Hardcode the value.
- `serviceEntity` must be `'home_care'` for all records (literal — not a union).
- Every patient must have `requiredDisciplines` populated with at least 1 entry.
- At least 2 patients should have `requiredCompetencies` populated.
- All IDs must be unique (e.g., `'pat-001'` through `'pat-006'`).

### 6.4 Connections (8 records)

Export as `MOCK_CONNECTIONS: ClinicianPatientConnection[]` from `mockClinicians.ts`.

| # | Clinician | Patient | Status | Source | Role | Notes |
|---|---|---|---|---|---|---|
| 1 | RN #1 | Patient #5 (L3) | assigned | system_recommendation | primary | Demonstrates discipline + competency match |
| 2 | HHA #7 | Patient #1 (L1) | assigned | system_recommendation | primary | Demonstrates routine match |
| 3 | LVN #3 | Patient #3 (L2) | assigned | system_recommendation | primary | Demonstrates credential-validated match (note: this LVN has an expired credential on a DIFFERENT license) |
| 4 | PT #5 | Patient #5 (L3) | assigned | manual_assignment | secondary | Has approvalRationale populated |
| 5 | OT #6 | Patient #6 (L4) | assigned | manual_override | primary | Has overrideReason populated |
| 6 | CNA #9 | Patient #4 (L2) | eligible | historical_continuity | primary | Not yet assigned, shows prior relationship |
| 7 | Caregiver #10 | Patient #1 (L1) | inactive | manual_assignment | prn | Ended assignment |
| 8 | RN #2 | Patient #6 (L4) | preferred | patient_request | secondary | Patient requested this clinician |

**Requirements:**
- Unique constraint: one record per (clinicianId, patientId) pair. No duplicate pairs.
- Every connection must have `assignedBy` populated.
- At least 1 connection must have `approvalRationale` populated.
- At least 1 connection must have `overrideReason` populated.
- At least 1 connection must have `continuityFlag: true` and `priorAssignmentCount` > 0.
- All foreign keys must resolve: every `clinicianId` must exist in `MOCK_CLINICIANS`, every `patientId` must exist in `MOCK_PATIENTS`.
- Free-text fields (`overrideReason`, `notes`, `approvalRationale`) must contain only operational content. Safe example: "Patient requested continuity with prior OT." Unsafe: any clinical detail or diagnosis.

### 6.5 Shift Needs (6 records)

Export as `MOCK_SHIFT_NEEDS: ShiftNeed[]` from `mockPatients.ts`.

Map to these demo scenarios:

| # | Patient | Discipline | Status | Demo Scenario | Scenario Detail |
|---|---|---|---|---|---|
| 1 | Patient #5 (L3) | RN | filled | AI-assisted match: discipline + competency | assignedConnectionId → Connection #1. Shows successful match. |
| 2 | Patient #1 (L1) | HHA | filled | AI-assisted match: routine companion care | assignedConnectionId → Connection #2. |
| 3 | Patient #3 (L2) | LVN | filled | AI-assisted match: credential validated | assignedConnectionId → Connection #3. |
| 4 | Patient #6 (L4) | LVN | open | Hard gate: expired credential | blockers: [{ type: 'expired_credential', description: 'LVN #3 CA license expired 2026-03-15. No other LVN available.' }] |
| 5 | Patient #4 (L2) | RN | open | Hard gate: clinician on leave | blockers: [{ type: 'on_leave', description: 'HHA #8 on FMLA leave through 2026-07-01.' }] |
| 6 | Patient #6 (L4) | OT | filled | Human override | assignedConnectionId → Connection #5. Notes: "Human reviewer selected OT #6 for continuity with prior assignment." |

**Requirements:**
- Every ShiftNeed must have `visitDate` populated with a valid ISO date (use dates relative to "today" — e.g., today, tomorrow, yesterday).
- At least 2 ShiftNeeds must have `priority` populated (1 critical, 1 high).
- Filled ShiftNeeds must have `assignedConnectionId` that resolves to a `MOCK_CONNECTIONS` record.
- Open ShiftNeeds must have `blockers` array populated explaining why they are uncovered.
- All foreign keys must resolve: every `patientId` must exist in `MOCK_PATIENTS`.
- The phrase "AI-assisted match" is the ONLY acceptable shorthand label in mock data. Do NOT use "Brad-matched", "Staffing Helper-matched", or any product brand name.

### 6.6 Mock Data Safety Rules

- No real dates of birth, diagnosis text, street addresses, SSNs, or phone numbers from real people.
- All free-text fields (notes, description, rationale) must contain ONLY operational content. Safe: "Prefers morning shifts." Unsafe: "Patient has diabetes and fall risk."
- All clinician names must be clearly fictional with cultural diversity.
- All patient names must be clearly fictional.

---

## 7. STORE DEFINITIONS

### 7.1 clinicianStore.ts

Export as `useClinicianStore`.

```typescript
interface ClinicianStoreState {
  clinicians: Clinician[];
  connections: ClinicianPatientConnection[];

  filterDiscipline: Discipline | null;
  filterStatus: ClinicianStatus | null;
  searchQuery: string;

  setFilterDiscipline: (d: Discipline | null) => void;
  setFilterStatus: (s: ClinicianStatus | null) => void;
  setSearchQuery: (q: string) => void;

  getClinicianById: (id: string) => Clinician | undefined;
  getConnectionsForClinician: (clinicianId: string) => ClinicianPatientConnection[];
  getFilteredClinicians: () => Clinician[];
}
```

**Seed** from `MOCK_CLINICIANS` and `MOCK_CONNECTIONS` on store creation.

`getFilteredClinicians` applies `filterDiscipline`, `filterStatus`, and `searchQuery` (name search) as in-memory `.filter()` calls on the `clinicians` array. No network requests, no debouncing, no search indexes.

### 7.2 patientStore.ts

Export as `usePatientStore`.

```typescript
interface PatientStoreState {
  patients: Patient[];
  shiftNeeds: ShiftNeed[];

  filterTier: CareTier | null;
  filterAccm: string | null;
  filterSetting: 'home' | 'facility' | null;
  searchQuery: string;

  setFilterTier: (t: CareTier | null) => void;
  setFilterAccm: (id: string | null) => void;
  setFilterSetting: (s: 'home' | 'facility' | null) => void;
  setSearchQuery: (q: string) => void;

  getPatientById: (id: string) => Patient | undefined;
  getShiftNeedsForPatient: (patientId: string) => ShiftNeed[];
  getFilteredPatients: () => Patient[];
}
```

**Seed** from `MOCK_PATIENTS` and `MOCK_SHIFT_NEEDS` on store creation.

**Store design for future API migration:** Keep data arrays (`clinicians`, `connections`, `patients`, `shiftNeeds`) and UI state (`filter*`, `searchQuery`) as separate concerns. When Phase 2 adds API calls, the data arrays are replaced by API responses while filter/search state remains local. Use selector functions (`get*`) so components do not access store internals directly.

---

## 8. PAGE SPECIFICATIONS

### 8.1 ClinicianListPage (`/clinicians`)

**Layout:**
- `PageHeader` component with title **"Clinician Profiles"** and a count badge showing total/filtered count.
- `SearchField` from `src/policy/components/ui/` for name search.
- Filter bar with dropdowns: Discipline (all values from `Discipline` type), Status (all values from `ClinicianStatus`).
- `DataGrid` from `src/policy/components/ui/` as the primary list view.
- On mobile (`< md:` breakpoint), switch to `ClinicianCard` stack.
- `DemoBanner` rendered above page content.

**Columns:**
| Column | Field | Component |
|---|---|---|
| Name | `${firstName} ${lastName}` | Text link → navigates to `/clinicians/:id` |
| Discipline | primaryDiscipline | DisciplineBadge |
| Status | status | StatusBadge |
| Employment | employmentType | Text ("W2" / "Contractor") |
| Competencies | competencies.length | Count badge |
| Assignments | (computed: connections where clinicianId matches and connectionStatus is 'assigned') | Count badge |

**Click behavior:** Clicking a row navigates to `/clinicians/:clinicianId`.

**Empty state:** When filters return zero results, show `EmptyState` from `src/policy/components/ui/` with message "No clinicians match your filters" and a clear-filters action.

### 8.2 ClinicianDetailPage (`/clinicians/:clinicianId`)

**Layout:**
- Breadcrumb: "Clinician Profiles › [Clinician Name]" (clickable back to `/clinicians`).
- `Tabs` component from `src/policy/components/ui/` with 3 tabs.
- `DemoBanner` rendered above page content.

**Tab 1 — Overview:**
- Personal info: name, preferredName, email, phone, primaryDiscipline (DisciplineBadge), secondaryDisciplines (DisciplineBadges), employmentType, hireDate, status (StatusBadge), orgRole, serviceAreas, maxHoursPerWeek.
- Accommodations section (if any accommodation fields are populated): display `religiousRestrictions`, `adaAccommodations`, `pregnancyAccommodation`, `fmlaLeave` as read-only cards. Label section **"FEHA Compliance — Accommodation Data."**

**Tab 2 — Credentials & Competencies:**
- Credentials list: each credential shows credentialName, type, issuingBody, licenseNumber, state, issuedAt, expiresAt, status (CredentialBadge: green=active, yellow=expiring_soon, red=expired, gray=pending_verification/revoked).
- Competencies list: each competency shows name, level as chips/badges.

**Tab 3 — Assignments:**
- List of `ClinicianPatientConnection` records where `clinicianId` matches and `connectionStatus` is 'assigned' or 'eligible' or 'preferred'.
- Each row shows: patient name (clickable link → `/patients/:patientId`), discipline (DisciplineBadge), assignmentRole, connectionStatus (StatusBadge), source, startDate.
- If `approvalRationale` is populated, show it as a sub-line.
- If `overrideReason` is populated, show it with an amber indicator.

**Deferred tabs:** Render 2 additional tabs as disabled with tooltip "Coming in Phase 2": "Availability" and "History."

**Invalid ID handling:** If `:clinicianId` does not match any record in the store, show `EmptyState` with "Clinician not found" message and a "Return to Clinician Profiles" link.

### 8.3 PatientListPage (`/patients`)

**Layout:**
- `PageHeader` with title **"Patient Profiles"** and count badge.
- `SearchField` for name search.
- Filter bar with dropdowns: Care Tier (all `CareTier` values), Service Setting ('home' | 'facility'), ACCM (populated from clinicians with `orgRole: 'accm'`).
- `DataGrid` as primary list view. On mobile, switch to `PatientCard` stack.
- `DemoBanner` rendered above page content.

**Columns:**
| Column | Field | Component |
|---|---|---|
| Name | `${firstName} ${lastName}` | Text link → `/patients/:id` |
| Care Tier | careTier | TierBadge (L1=green, L2=blue, L3=orange, L4=red) |
| Setting | serviceSetting | Text ("Home" / "Facility") |
| Zone | serviceZone | Text |
| ACCM | accmOwnerId → resolved to ACCM clinician name via clinicianStore | Text |
| Assignments | (computed: connections where patientId matches and connectionStatus is 'assigned') | Count badge |

**ACCM name resolution:** The `accmOwnerId` is a clinician ID. Resolve it to a display name by looking up the clinician in `useClinicianStore`. The mock data includes 2 clinicians with `orgRole: 'accm'` for this purpose.

**Click behavior:** Clicking a row navigates to `/patients/:patientId`.

**Empty state:** Same pattern as ClinicianListPage.

### 8.4 PatientDetailPage (`/patients/:patientId`)

**Layout:**
- Breadcrumb: "Patient Profiles › [Patient Name]" (clickable back to `/patients`).
- `Tabs` component with 3 tabs.
- `DemoBanner` rendered above page content.

**Tab 1 — Overview:**
- Patient info: name, preferredName, careTier (TierBadge), serviceSetting, status (StatusBadge), serviceZone, facilityName (if facility), admissionDate, dischargeDate, weightedCaseloadPoints.
- ACCM owner: resolved name (link to `/clinicians/:accmOwnerId`).
- CCM (if populated): resolved name.

**Tab 2 — Care Needs:**
- Required disciplines: list of DisciplineBadges.
- Required competencies: list as text chips (if populated).
- Continuity priority: display if populated.
- Shift Needs section: list of `ShiftNeedCard` components for all `MOCK_SHIFT_NEEDS` where `patientId` matches. Each card shows: requiredDiscipline (DisciplineBadge), visitDate, visitWindow, priority (if set), status badge (open=red, filled=green, cancelled=gray), assigned clinician name (if filled — resolve via connection), blockers (if open — display as amber warning).

**Tab 3 — Assignments:**
- List of `ClinicianPatientConnection` records where `patientId` matches.
- Each row shows: clinician name (clickable link → `/clinicians/:clinicianId`), discipline (DisciplineBadge), assignmentRole, connectionStatus (StatusBadge), source, startDate.

**Deferred tabs:** Render 2 additional tabs as disabled: "Preferences" and "History."

**Invalid ID handling:** Same pattern as ClinicianDetailPage.

---

## 9. COMPONENT SPECIFICATIONS

### ClinicianCard.tsx
Card representation of a clinician for mobile/card-view layouts. Shows: name, primaryDiscipline (DisciplineBadge), status (StatusBadge), competency count, assignment count. Extends `SurfaceCard` from `src/policy/components/ui/`. Clicking navigates to detail page.

### PatientCard.tsx
Card representation of a patient. Shows: name, careTier (TierBadge), serviceSetting, serviceZone, ACCM name, assignment count. Extends `SurfaceCard`. Clicking navigates to detail page.

### CredentialBadge.tsx
Color-coded badge based on `Credential.status`:
- `'active'` → green
- `'expiring_soon'` → yellow/amber
- `'expired'` → red
- `'pending_verification'` → gray
- `'revoked'` → dark red/maroon

Read the `status` field directly from the credential object. Do NOT compute status from dates at runtime.

### DisciplineBadge.tsx
Badge displaying discipline name with color coding:
- Licensed professionals (RN, LVN, LPN, PT, PTA, OT, COTA, ST, SLP, MSW): blue/indigo
- Certified aides (HHA, CNA): teal/green
- Non-licensed (Caregiver): gray/neutral

### TierBadge.tsx
Badge displaying care tier with color coding:
- L1_essential → green, display label: "L1 Essential"
- L2_enhanced → blue, display label: "L2 Enhanced"
- L3_specialized → orange, display label: "L3 Specialized"
- L4_critical → red, display label: "L4 Critical"

### StatusBadge.tsx
Generic status badge for `ClinicianStatus`, `PatientStatus`, and `ConnectionStatus`. Color mapping:
- active/assigned/eligible → green
- pending/pending_approval → yellow/amber
- inactive/on_hold → gray
- on_leave → blue
- suspended/restricted/blocked → orange
- terminated/discharged → red

Follow the existing `CiStatusBadge` API pattern from `src/policy/components/ui/`.

### ShiftNeedCard.tsx
Card displaying a shift need. Shows: requiredDiscipline (DisciplineBadge), visitDate, visitWindow (if set), priority badge (if set), status indicator (open=red outline, filled=green outline, cancelled=gray), assigned clinician name (if filled — resolved via assignedConnectionId → connection → clinicianId), blockers list (if open — displayed as amber warning text).

### DemoBanner.tsx
Fixed banner at the top of all profile pages. Displays: **"DEMO — Synthetic Data | Not production-validated."** Uses a neutral background (blue-gray). Import `DEMO_DISCLAIMER` from `../data/disclaimer.ts`. Every Phase 1 profile page must render this banner above the page content.

---

## 10. ROUTE REGISTRATION

### Lazy Imports (add to top of `src/App.tsx`)

All page components use named exports. Use the existing `.then()` destructuring pattern:

```typescript
// ── Clinician Profile & Patient Profile (Phase 1) ──────────────
const ClinicianListPage = lazy(() =>
  import('@/policy/staffing/pages/ClinicianListPage').then(m => ({ default: m.ClinicianListPage }))
);
const ClinicianDetailPage = lazy(() =>
  import('@/policy/staffing/pages/ClinicianDetailPage').then(m => ({ default: m.ClinicianDetailPage }))
);
const PatientListPage = lazy(() =>
  import('@/policy/staffing/pages/PatientListPage').then(m => ({ default: m.PatientListPage }))
);
const PatientDetailPage = lazy(() =>
  import('@/policy/staffing/pages/PatientDetailPage').then(m => ({ default: m.PatientDetailPage }))
);
```

### Route Elements (add inside inner `<Routes>` block)

```tsx
{/* Clinician Profile & Patient Profile (Phase 1, read-only) */}
<Route path="/clinicians" element={<ClinicianListPage />} />
<Route path="/clinicians/:clinicianId" element={<ClinicianDetailPage />} />
<Route path="/patients" element={<PatientListPage />} />
<Route path="/patients/:patientId" element={<PatientDetailPage />} />
```

All routes are inside the existing `<ProtectedRoute>` + `<CommandCenterLayout>` + `<Suspense>` wrapper. No additional Suspense is needed per page.

**Forbidden routes:** Do NOT register `/clients`, `/clients/:id`, or any `/staffing-*`, `/staffing-helper`, `/brad`, `/calendar/*` routes as part of Phase 1. The existing `/calendar` route in `App.tsx` is for the existing CES Master Calendar and must NOT be modified.

---

## 11. SIDEBAR NAVIGATION

Add **two top-level entries** to the `MAIN_NAV` array (or equivalent nav definition) inside `src/policy/components/CommandCenterLayout.tsx`. Use the existing nav item pattern: `{ id, to, label, icon, subItems? }`.

```typescript
{ id: 'clinician-profiles', to: '/clinicians', label: 'Clinician Profiles', icon: Users },
{ id: 'patient-profiles',   to: '/patients',   label: 'Patient Profiles',   icon: Heart },
```

**Placement:** Insert these two entries after the existing Dashboard entry and before the existing Brad/iAdministrator entry. They are top-level, plain entries — NOT a nested group.

**Icons:** Use `Users` (lucide-react) for Clinician Profiles and `Heart` (lucide-react) for Patient Profiles. Import them at the top of `CommandCenterLayout.tsx` alongside the existing Lucide imports.

**Forbidden sidebar entries:** Do NOT add any of the following to the sidebar in Phase 1:
- "iStaffing"
- "Staffing Helper"
- "Staffing"
- "Staffing Board"
- "Brad Workforce AI"
- "Brad System"
- "Brad Platform"
- "Calendar" (a Calendar entry already exists for CES — do not add a second one for staffing)

---

## 12. CONSTRAINTS

### Absolute Constraints (violation = build failure)

1. Do NOT build any write/edit functionality. No forms, no create buttons, no update buttons, no delete buttons.
2. Do NOT build a matching engine, scoring logic, `isEligible()` function, or any Layer 1/Layer 2 processing.
3. Do NOT add PHI fields: `dateOfBirth`, `primaryDiagnosis` (text), `address`/`PatientAddress`, `serviceZip`, `serviceCity`, `primaryDiagnosisCategory`, `visitFrequencyString`, `riskFactors`, `careNotes`, `payerType`, `certPeriodStart`, `certPeriodEnd`, or any episode fields.
4. Do NOT add demographic fields: `demographicRace`, `demographicSex`, `demographicAge`. Not even as stubs.
5. Do NOT integrate with AlayaCare, WellSky, Google Maps, or any external service.
6. Do NOT modify any existing CES, eCIgn, PM, Journey, or compliance files.
7. Do NOT modify `AuthProvider.tsx`.
8. Do NOT create server routes, API endpoints, or DynamoDB tables. Phase 1 is frontend-only.
9. Do NOT compute credential expiry at runtime. CredentialBadge reads the static `status` field from mock data.
10. Do NOT display `lastSupervisoryVisit` in any UI component. The field exists on the type for forward compatibility only.
11. Do NOT implement status transitions. All mock data statuses are static.
12. Do NOT use the word "Skill" as a type name, field name, variable name, comment term, or UI label. Use "Competency."
13. Do NOT use the word "Client" in any user-facing UI label, page title, breadcrumb, or sidebar entry. The person receiving care is "Patient."
14. Do NOT use any of these branded names anywhere in Phase 1 user-facing UI, sidebar, page titles, mock data labels, or comments displayed to the user: "iStaffing", "Staffing Helper", "Brad Workforce AI", "Brad System", "Brad Platform", "Brad App". Internal comments may reference Brad only in future-readiness or ADS/FEHA context paragraphs.
15. Do NOT build a Calendar route, Calendar page, or Calendar sidebar entry as part of Phase 1. The existing CES `/calendar` route must remain untouched.

### Module Isolation Constraint

The staffing module (`src/policy/staffing/`) must have ZERO imports from:
- `src/policy/stores/calendarSyncStore.ts`
- `src/policy/stores/calendarStore.ts`
- `src/policy/services/calendarApi.ts`
- `src/policy/data/regulatoryEvents.ts`
- `src/policy/components/regulatory/*`
- `src/policy/ces/*`
- `src/policy/ecign/*`
- `src/policy/pages/iAdministrator/*` (no Brad integration in Phase 1)

The staffing module uses its own types, its own stores, and its own data. It shares only generic UI primitives from `src/policy/components/ui/` and React Router primitives.

### UI Primitive Reuse

Use these existing components from `src/policy/components/ui/` (verify each exists; if a primitive is missing, build a Tailwind-styled local equivalent rather than introducing a new abstraction):
- `PageHeader` — for all page titles
- `DataGrid` — for list views (if the existing API supports the columns; otherwise build a Tailwind table consistent with existing list pages)
- `SearchField` — for search inputs
- `Tabs` — for detail page tab navigation
- `SurfaceCard` — as the base for all card components
- `SectionHeader` — for detail page section titles
- `EmptyState` — for empty/no-data states

Follow the `CiStatusBadge` API pattern for all new badge components. Use React Router `<Link>` for cross-entity navigation.

### Styling

- Use Tailwind utility classes consistent with existing pages.
- Responsive: use Tailwind breakpoints. On screens below `md:`, list pages should render cards instead of table rows. Detail page sections should stack in single column.
- Do NOT use inline styles, CSS modules, or styled-components.
- Follow the existing color palette — do not introduce new colors outside of the badge specifications above.

### Claims & Disclaimers

- Do NOT use the words "proves," "proven," "guaranteed," "eliminates," or "ensures" in any UI text, component label, tooltip, or mock data string.
- Use "demonstrates," "designed to," "projected," "estimated," or "supports."
- Every Phase 1 profile page must render the `DemoBanner` component at the top.
- No comparative claims ("no competitor has," "best in class") in any UI text.

### Mock Data Safety

- All free-text fields (notes, description, rationale, overrideReason) must contain ONLY operational content — never clinical details, diagnoses, or health conditions.
- All mock data foreign keys must resolve. Every `clinicianId` in connections must exist in `MOCK_CLINICIANS`. Every `patientId` must exist in `MOCK_PATIENTS`. Every `assignedConnectionId` in shift needs must exist in `MOCK_CONNECTIONS`.

---

## 13. DO NOT BUILD

This is the complete list. If it is on this list, do not build it, define a store for it, or create UI for it.

1. Write/edit/create/delete UI
2. Matching engine or scoring logic
3. AlayaCare integration
4. WellSky integration
5. PHI fields (DOB, diagnosis text, full address, city, zip, primaryDiagnosisCategory)
6. Demographic fields (race, sex, age)
7. Credential renewal compliance logic
8. Supervisory visit tracking UI
9. Approval workflows
10. S3 evidence storage
11. Brad / iAdministrator integration with profile data
12. Server routes or API endpoints
13. DynamoDB tables or persistence
14. Credential expiry computation at runtime
15. Shift status transition logic
16. Connection manager screen
17. Staffing Board / daily operations view
18. Audit Log implementation (type stub only)
19. Home Health fields or concepts
20. Availability entity or schedule management
21. Restriction or Preference entities
22. Caseload capacity computation logic
23. Eligibility preview / `isEligible()` function
24. Bias check logic or disparate impact monitoring
25. Worker disclosure / ADS notification UI
26. External calendar, Google Maps, or geocoding integration
27. **Calendar route, page, or sidebar entry for Phase 1** (the existing CES `/calendar` route remains untouched and must not be extended for staffing/profile data)
28. Any "Staffing Helper", "iStaffing", or "Brad Workforce AI" branded UI surface

---

## 14. REQUIRED EXISTING-FILE MODIFICATIONS

Only these existing files may be modified:

| File | Change | Pattern |
|---|---|---|
| `src/App.tsx` | Add 4 lazy imports + 4 Route elements + section comment | Follow existing lazy import pattern with `.then()` destructuring |
| `src/policy/components/CommandCenterLayout.tsx` | Add 2 top-level nav entries ("Clinician Profiles", "Patient Profiles") + 2 Lucide icon imports (`Users`, `Heart`) if not already imported | Follow existing nav item registration pattern |

No other existing files may be modified. Run `git diff` after implementation to verify.

---

## 15. ACCEPTANCE CRITERIA

### Category 1: Type Definitions (21 criteria)

| ID | Pass Condition |
|---|---|
| TYP-01 | `Discipline` type includes all 13 values: RN, LVN, LPN, PT, PTA, OT, COTA, ST, SLP, MSW, HHA, CNA, Caregiver |
| TYP-02 | `Competency` interface has `name: string` (required), `level?: 'basic' \| 'intermediate' \| 'advanced'` |
| TYP-03 | `Credential` interface has all fields including `credentialName`, `daysUntilExpiry?`, `status: CredentialStatus` |
| TYP-04 | `CredentialStatus` includes `'expiring_soon'` |
| TYP-05 | `Clinician` interface has all required fields: id, firstName, lastName, primaryDiscipline, competencies, credentials, employmentType, status, createdAt, updatedAt |
| TYP-06 | `Clinician` has accommodation fields: `religiousRestrictions?`, `adaAccommodations?`, `pregnancyAccommodation?`, `fmlaLeave?`, `schedulingLimitations?` |
| TYP-07 | `ClinicianStatus` includes `'on_leave'` |
| TYP-08 | `Patient` interface has `weightedCaseloadPoints: number`, `serviceZone?: string`, NO `serviceZip`, NO `serviceCity`, NO `primaryDiagnosisCategory` |
| TYP-09 | `CareTier` uses semantic labels: `'L1_essential' \| 'L2_enhanced' \| 'L3_specialized' \| 'L4_critical'` |
| TYP-10 | `ClinicianPatientConnection` (NOT `CareAssignment`, NOT `ClinicianClientConnection`) has: `connectionStatus`, `source`, `approvalRationale?`, `overrideReason?` |
| TYP-11 | `ShiftNeed` has `visitDate: string` (required), `visitWindow?`, `priority?`, `shiftType?`, `blockers?`, `patientId` (NOT `clientId`) |
| TYP-12 | `ShiftNeedStatus` is exactly `'open' \| 'filled' \| 'cancelled'` — no extra lifecycle states |
| TYP-13 | `Patient.serviceEntity` is literal `'home_care'` — not a union type |
| TYP-14 | `AuditLogEntry` and `AdsDecisionLog` are exported as interfaces (type stubs only) |
| TYP-15 | Zero instances of `: any` in `types.ts` |
| TYP-16 | Zero instances of "Skill" as type name, field name, or comment term in any new file |
| TYP-17 | All types compile: `tsc --noEmit` (or `npm run build` TypeScript phase) passes with zero errors in new files |
| TYP-18 | All interfaces and types use `export` keyword |
| TYP-19 | Deferred fields are completely absent — not commented out, not TODO |
| TYP-20 | `Clinician` has `userId?: string` and `phone?: string` |
| TYP-21 | `ShiftNeed.assignedConnectionId` (NOT `assignedCareAssignmentId`) |

### Category 2: Mock Data Quality (21 criteria)

| ID | Pass Condition |
|---|---|
| MOC-01 | `MOCK_CLINICIANS` contains exactly 10 records |
| MOC-02 | Discipline distribution: 2 RN, 2 LVN, 1 PT, 1 OT, 2 HHA, 1 CNA, 1 Caregiver |
| MOC-03 | At least 3 distinct `ClinicianStatus` values across 10 clinicians (min: active, pending, on_leave) |
| MOC-04 | Both `'W2'` and `'contractor'` employmentType present |
| MOC-05 | At least 1 clinician has `religiousRestrictions` populated |
| MOC-06 | At least 1 clinician has `adaAccommodations` populated |
| MOC-07 | At least 1 clinician has `fmlaLeave.active = true` AND `status = 'on_leave'` |
| MOC-08 | At least 1 credential with `status: 'expired'` and `daysUntilExpiry < 0` |
| MOC-09 | At least 1 credential with `status: 'expiring_soon'` and `0 < daysUntilExpiry <= 60` |
| MOC-10 | At least 2 clinicians have `orgRole: 'accm'` |
| MOC-11 | `MOCK_PATIENTS` contains exactly 6 records with distribution: 2 L1, 2 L2, 1 L3, 1 L4 |
| MOC-12 | Both `'home'` and `'facility'` serviceSetting present |
| MOC-13 | At least 2 distinct `accmOwnerId` values across patients |
| MOC-14 | All patient `weightedCaseloadPoints` match careTier: L1→0.5, L2→0.75, L3/L4→1.0 |
| MOC-15 | `MOCK_CONNECTIONS` contains exactly 8 records |
| MOC-16 | At least 3 distinct `ConnectionSource` values in connections |
| MOC-17 | At least 1 connection has `approvalRationale` populated |
| MOC-18 | At least 1 connection has `overrideReason` populated |
| MOC-19 | `MOCK_SHIFT_NEEDS` contains exactly 6 records: at least 2 open, at least 3 filled |
| MOC-20 | All FK integrity: every `clinicianId` in connections exists in `MOCK_CLINICIANS`, every `patientId` exists in `MOCK_PATIENTS`, every `assignedConnectionId` in shift needs exists in `MOCK_CONNECTIONS` |
| MOC-21 | All IDs unique across all mock datasets. All records have `createdAt` with valid ISO-8601 dates. |

### Category 3: Page Functionality (26 criteria)

| ID | Pass Condition |
|---|---|
| PAG-01 | ClinicianListPage renders all 10 clinicians on load |
| PAG-02 | ClinicianListPage shows: name, discipline badge, status badge, employment type, competency count, assignment count |
| PAG-03 | ClinicianListPage discipline filter works correctly |
| PAG-04 | ClinicianListPage status filter works correctly |
| PAG-05 | ClinicianListPage name search filters results |
| PAG-06 | Clicking clinician row navigates to `/clinicians/:clinicianId` |
| PAG-07 | ClinicianDetailPage has 3 active tabs: Overview, Credentials & Competencies, Assignments |
| PAG-08 | Overview tab shows personal info including accommodation data when present |
| PAG-09 | Credentials tab shows credentials with `CredentialBadge` color coding |
| PAG-10 | Credentials tab shows competencies with level badges |
| PAG-11 | Assignments tab shows connections with linked patient names |
| PAG-12 | Clicking patient name in assignments navigates to `/patients/:patientId` |
| PAG-13 | PatientListPage renders all 6 patients on load |
| PAG-14 | PatientListPage shows: name, tier badge, setting, zone, ACCM name (resolved), assignment count |
| PAG-15 | PatientListPage tier filter works correctly |
| PAG-16 | PatientListPage ACCM filter works correctly |
| PAG-17 | PatientListPage setting filter works correctly |
| PAG-18 | PatientListPage name search filters results |
| PAG-19 | Clicking patient row navigates to `/patients/:patientId` |
| PAG-20 | PatientDetailPage has 3 active tabs: Overview, Care Needs, Assignments |
| PAG-21 | Overview tab shows patient info with `TierBadge`, resolved ACCM name |
| PAG-22 | Care Needs tab shows required disciplines, competencies, and `ShiftNeedCard`s |
| PAG-23 | `ShiftNeedCard`s show status, discipline, visit date, blockers (for open shifts) |
| PAG-24 | Assignments tab shows connections with linked clinician names |
| PAG-25 | Clicking clinician name in assignments navigates to `/clinicians/:clinicianId` |
| PAG-26 | `DemoBanner` visible on all 4 pages |

### Category 4: Route Registration (11 criteria)

| ID | Pass Condition |
|---|---|
| RTE-01 | `/clinicians` route registered in App.tsx, loads ClinicianListPage |
| RTE-02 | `/clinicians/:clinicianId` route registered, loads ClinicianDetailPage |
| RTE-03 | `/patients` route registered, loads PatientListPage |
| RTE-04 | `/patients/:patientId` route registered, loads PatientDetailPage |
| RTE-05 | All 4 routes inside `ProtectedRoute` wrapper |
| RTE-06 | All 4 routes inside `CommandCenterLayout` (sidebar visible) |
| RTE-07 | Sidebar has top-level "Clinician Profiles" entry → `/clinicians` and "Patient Profiles" entry → `/patients` |
| RTE-08 | All 4 page imports use `React.lazy()` with `.then(m => ({ default: m.PageName }))` pattern |
| RTE-09 | All page components use named exports (NOT `export default`) |
| RTE-10 | Navigating to `/clinicians/nonexistent-id` shows graceful "not found" state |
| RTE-11 | Navigating to `/patients/nonexistent-id` shows graceful "not found" state |

### Category 5: Read-Only Enforcement (6 criteria)

| ID | Pass Condition |
|---|---|
| RON-01 | No "Create," "Add," "New" buttons on any page |
| RON-02 | No "Edit," "Update," "Save" buttons on any page |
| RON-03 | No "Delete," "Remove," "Archive" buttons on any page |
| RON-04 | No form inputs for data modification (filter/search controls are acceptable) |
| RON-05 | No POST/PUT/DELETE API calls or fetch mutations |
| RON-06 | Stores have no create/update/delete actions (only get/filter/set-filter) |

### Category 6: No-PHI Enforcement (5 criteria)

| ID | Pass Condition |
|---|---|
| PHI-01 | No `dateOfBirth`, `primaryDiagnosis`, `address`, `serviceZip`, `serviceCity`, or `primaryDiagnosisCategory` field in `types.ts` |
| PHI-02 | No `demographicRace`, `demographicSex`, `demographicAge` in any file |
| PHI-03 | No real person data in mock files |
| PHI-04 | All free-text mock data contains only operational content (no clinical details) |
| PHI-05 | `DemoBanner` displays on all 4 pages |

### Category 7: Scope & Naming Control (13 criteria)

| ID | Pass Condition |
|---|---|
| NSC-01 | No matching/scoring logic in any new file |
| NSC-02 | No `fetch()` or HTTP calls to external services |
| NSC-03 | Zero references to "AlayaCare" or "WellSky" in new files |
| NSC-04 | Zero changes to files under `src/policy/ces/`, `src/policy/ecign/`, `src/policy/pm/`, `src/policy/journey/` |
| NSC-05 | Zero changes to `AuthProvider.tsx` |
| NSC-06 | Zero imports from `calendarSyncStore`, `calendarApi`, `regulatoryEvents`, or `ces/*` in staffing module |
| NSC-07 | New files exist only under `src/policy/staffing/` plus modifications to `App.tsx` and `CommandCenterLayout.tsx` |
| NSC-08 | No `export default` on any new page component |
| NSC-09 | No server-side files, API routes, or DynamoDB references |
| NSC-10 | The word "Skill" does not appear as a type name, field name, or primary term in any new file |
| NSC-11 | `Patient.serviceEntity` is literal `'home_care'` — not a union |
| NSC-12 | The branded names "iStaffing", "Staffing Helper", "Brad Workforce AI", "Brad System", "Brad Platform", "Brad App" do NOT appear in any user-facing UI string, page title, sidebar label, breadcrumb, or mock data label |
| NSC-13 | No Calendar route, Calendar page, or Calendar sidebar entry was added in Phase 1; the existing CES `/calendar` route is unchanged |

### Category 8: Component & Store Quality (11 criteria)

| ID | Pass Condition |
|---|---|
| CSQ-01 | All 8 components exist in `src/policy/staffing/components/` |
| CSQ-02 | `CredentialBadge` renders green/yellow/red/gray based on `credential.status` |
| CSQ-03 | `TierBadge` renders L1=green, L2=blue, L3=orange, L4=red |
| CSQ-04 | `DisciplineBadge` renders with licensed/certified/non-licensed color grouping |
| CSQ-05 | `useClinicianStore` exposes: `getClinicianById`, `getConnectionsForClinician`, `getFilteredClinicians`, filter setters |
| CSQ-06 | `usePatientStore` exposes: `getPatientById`, `getShiftNeedsForPatient`, `getFilteredPatients`, filter setters |
| CSQ-07 | Both stores initialize with mock data on creation (no API calls) |
| CSQ-08 | Tailwind styling consistent with existing pages |
| CSQ-09 | Existing UI primitives used where available (`PageHeader`, `Tabs`, `EmptyState`, etc.) |
| CSQ-10 | Barrel export `index.ts` exists and exports types + store hooks |
| CSQ-11 | Mock data files have file-level disclaimer comment about fictional names |

---

## 16. VERIFICATION CHECKLIST

Execute in this order after implementation:

1. **Compilation:** `npm run build` (which runs `tsc -b && vite build`) — zero TypeScript errors in new files; build artifact produced.
2. **Static analysis grep on `src/policy/staffing/`:**
   - `rg -n "\bSkill\b" src/policy/staffing/` → expect zero matches.
   - `rg -n "\bClient\b" src/policy/staffing/` → expect zero matches.
   - `rg -n "Brad Workforce AI|Staffing Helper|iStaffing|Brad System|Brad Platform" src/policy/staffing/` → expect zero matches.
   - `rg -n ": any\b" src/policy/staffing/` → expect zero matches.
   - `rg -n "export default" src/policy/staffing/pages/` → expect zero matches.
   - `rg -n "dateOfBirth|primaryDiagnosis|serviceZip|serviceCity|primaryDiagnosisCategory|demographicRace|demographicSex|demographicAge" src/policy/staffing/` → expect zero matches.
3. **File inventory:** Verify all expected files exist under `src/policy/staffing/` per section 4.
4. **Mock data audit:** Count records, verify FK integrity, check diversity requirements per section 15 Category 2.
5. **Route verification:** Navigate to all 4 routes (`/clinicians`, `/clinicians/:id`, `/patients`, `/patients/:id`), verify sidebar shows two new top-level entries, verify `ProtectedRoute` wrapping.
6. **Page functionality:** Exercise all list pages (filters, search), detail pages (tabs, cross-links).
7. **Read-only audit:** Inspect all pages for create/edit/delete affordances.
8. **Scope audit:** `git diff --stat` — only `App.tsx`, `CommandCenterLayout.tsx`, and new files under `src/policy/staffing/`.
9. **Error handling:** Navigate to invalid IDs — verify graceful "not found" state.
10. **Demo banner:** Verify `DemoBanner` visible on all 4 pages.
11. **Calendar exclusion:** `rg -n "/calendar" src/App.tsx` should show only the pre-existing CES Calendar routes — no new Calendar routes added.

---

*End of Phase 1 Clinician Profile & Patient Profile Implementation Prompt*
*Version 1.1 — Naming convention update applied (Patient terminology, no Calendar build, no Brad/Staffing Helper branding)*
*This document is the sole build specification. Do not reference other documents.*
