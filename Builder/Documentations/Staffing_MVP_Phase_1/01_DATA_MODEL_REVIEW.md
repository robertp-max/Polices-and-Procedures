# 01 — Data Model Review: Staffing MVP Phase 1

**Reviewer Role:** Staffing Data Model Reviewer
**Date:** 2026-05-13
**Review Scope:** Entity completeness, relationship correctness, type safety, naming conflicts, Phase 1 scope alignment, accommodation fields, weighted caseload formula, mock data adequacy
**Source Documents Reviewed:**
- `Builder/UserProfiles/Architecture.md` (1,430 lines — full architecture)
- `Builder/UserProfiles/Planning_Implementation.md` (223 lines — feedback & efficiency recommendations)
- `Builder/Documentations/System_Documentation/05_DATA_MODEL_AND_TYPES.md` (existing codebase types)
- `Builder/Documentations/System_Documentation/13_IMPLEMENTATION_READINESS_FOR_CLINICIAN_CLIENT_PROFILE.md` (readiness assessment)
- `Builder/Documentations/Survey-Simulation/Brad2.0/Staffing/Requirements` (Brad v2.0 requirements)

---

## Executive Summary

The Architecture.md defines a comprehensive 11-entity data model that is well-structured for full production staffing, but the implementation prompt at the bottom of that same document only builds 4 types (Clinician, Client, CareAssignment, ShiftNeed) — and those 4 types diverge significantly from the 11-entity architecture above them. There are **critical naming conflicts** between the Architecture.md model (which uses "Skill" as a first-class entity) and the Planning_Implementation.md mandate (which forbids "Skill" and requires "Discipline" primary / "Competency" secondary). The implementation prompt **drops all FEHA accommodation fields** from the Clinician type, despite these being marked P0 compliance in every other source document. The junction model is conflated from two distinct concepts (ClinicianClientConnection + ShiftAssignment) into a single oversimplified CareAssignment that will create architectural debt for Phase 2. Mock data spec (10/6/8/6) contradicts two other sources that recommend larger datasets.

---

## Gaps Found

### Critical Severity

**GAP-01: Accommodation fields missing from implementation Clinician type**
- **Where:** Architecture.md lines 1167–1198 (implementation prompt's Clinician interface)
- **Problem:** The recommended Clinician interface omits `religiousRestrictions[]`, `adaAccommodations[]`, `pregnancyAccommodation`, `fmlaLeave`, and `schedulingLimitations[]`. These are explicitly marked P0 COMPLIANCE in Architecture.md lines 70–79, in the Brad Requirements doc (lines 97–105), and in Planning_Implementation.md (line 209).
- **Impact:** FEHA ADS violations. These are Layer 1 hard constraints — the system cannot claim compliance readiness without them.
- **Fix:** Add the following fields to the Phase 1 Clinician type:
  ```typescript
  // FEHA Layer 1 Hard Constraints — P0 Compliance
  religiousRestrictions?: { day: string; timeRange?: string; description: string }[];
  adaAccommodations?: { type: string; description: string; effectiveDate: string }[];
  pregnancyAccommodation?: { active: boolean; details?: string; expectedEndDate?: string };
  fmlaLeave?: { active: boolean; startDate?: string; endDate?: string };
  schedulingLimitations?: { type: string; description: string }[];
  ```

**GAP-02: Junction model conflated with shift assignment**
- **Where:** Architecture.md lines 1268–1288 (CareAssignment definition)
- **Problem:** The 11-entity architecture defines two distinct concepts: (a) `ClinicianClientConnection` — the *relationship* between a clinician and client (eligibility, preference, block status, match score), and (b) `ShiftAssignment` — the *operational* assignment to a specific shift. The implementation prompt collapses both into `CareAssignment`, which has `assignmentRole`, `startDate/endDate`, and `approvedBy` but loses all connection intelligence fields (`matchScore`, `matchFactors`, `connectionStatus`, `distanceMiles`, `continuityFlag`, `priorAssignmentCount`, `lastWorkedDate`, `restrictionReason`, `approvalRationale`).
- **Impact:** When Phase 2 introduces the matching engine, there is no place to store connection-level intelligence without a breaking refactor. The unique constraint `(clinicianId, clientId)` from the architecture (line 233) cannot be enforced because CareAssignment is per-assignment, not per-pair.
- **Fix:** For Phase 1, keep `CareAssignment` as the simplified entity but:
  1. Rename it to `ClinicianClientConnection` to match the architecture
  2. Add `connectionStatus: 'eligible' | 'preferred' | 'restricted' | 'blocked' | 'assigned' | 'inactive'`
  3. Add the unique constraint documentation `(clinicianId, clientId)`
  4. Defer the operational `ShiftAssignment` entity to Phase 2

**GAP-03: `onLeave` status removed from Clinician without replacement**
- **Where:** Architecture.md line 1185 vs. line 43
- **Problem:** The architecture's Clinician status enum includes `onLeave` (lines 43, 90–91) which is essential for FMLA tracking. The implementation prompt changes this to `'active' | 'inactive' | 'pending' | 'suspended' | 'terminated'` — `onLeave` is gone but `fmlaLeave` tracking requires it.
- **Impact:** A clinician on FMLA leave cannot be distinguished from `inactive`. The system cannot enforce the Layer 1 hard constraint "NOT on FMLA/pregnancy leave" if there's no status to represent leave.
- **Fix:** Restore `onLeave` to the Clinician status union: `'active' | 'inactive' | 'onLeave' | 'pending' | 'suspended' | 'terminated'`

### High Severity

**GAP-04: No `Credential` as a standalone entity in Phase 1**
- **Where:** Architecture.md lines 1216–1227 vs. section 2.6 (lines 274–299)
- **Problem:** The implementation prompt embeds `Credential` as an inline interface inside the Clinician type (`credentials: Credential[]`). The architecture defines Credential as a first-class entity (section 2.6) with its own lifecycle rules: `valid → expiringSoon → expired`, computed `daysUntilExpiry`, and the critical rule "No human override can bypass an expired required credential per 42 CFR §484.115."
- **Impact:** Embedding credentials as an array means no independent lifecycle management, no cross-clinician credential queries ("show all expiring credentials across all clinicians"), and no audit trail per credential. This is a Phase 1 display concern — the credential expiry badges shown in `CredentialBadge.tsx` need reliable status computation.
- **Fix:** Keep credentials embedded in the Clinician type for Phase 1 (acceptable for read-only display), but add these fields that were stripped:
  ```typescript
  interface Credential {
    type: string;
    credentialName: string;        // MISSING: e.g., "CA RN License"
    issuingBody?: string;
    licenseNumber?: string;
    state?: string;
    issuedAt: string;
    expiresAt?: string;
    daysUntilExpiry?: number;      // MISSING: computed, needed for CredentialBadge
    verifiedAt?: string;
    verifiedBy?: string;
    status: 'active' | 'expiringSoon' | 'expired' | 'pending_verification' | 'revoked';
    evidenceRef?: string;
  }
  ```
  Note: `expiringSoon` status value is missing from the implementation prompt's Credential but required by the architecture's lifecycle rules (line 287, 296–297).

**GAP-05: ACCM caseload tracking has no mechanism**
- **Where:** Architecture.md line 920, implementation prompt lines 1246, 1112–1113
- **Problem:** The weighted caseload formula (L3-L4 × 1.0, L2 × 0.75, L1 × 0.5, hard cap 40) is correctly defined. The implementation prompt adds `accmOwnerId` to Client (line 1246). But there is no computed `currentCaseloadPoints` field anywhere, and no ACCM entity/profile to track portfolio load. The architecture itself flags this: "ACCM assignment tracking is missing" (line 920).
- **Impact:** Cannot display ACCM caseload status in Phase 1. Cannot demonstrate Near Full (36–39) or At Cap (40) alerting. The demo cannot show the capacity band system from Brad Requirements lines 57–59.
- **Fix:** Add to mock data computation: for each unique `accmOwnerId`, sum client `weightedCaseloadPoints` and store as derived display data. No new entity needed — just a computed view in the store.

**GAP-06: `weightedCaseloadPoints` missing from implementation Client type**
- **Where:** Architecture.md line 146 defines `weightedCaseloadPoints` on Client; implementation prompt lines 1229–1267 omit it
- **Problem:** The Client type in the implementation prompt has `careTier: 'L1' | 'L2' | 'L3' | 'L4'` but no `weightedCaseloadPoints` computed field. The formula is documented (Architecture.md line 26, line 573; Brad Requirements line 56) but there's no field to store the result.
- **Impact:** Cannot compute or display ACCM caseload totals without this field on each client.
- **Fix:** Add `weightedCaseloadPoints: number` to Client type. Compute from `careTier`: L1 → 0.5, L2 → 0.75, L3 → 1.0, L4 → 1.0.

**GAP-07: ShiftNeed model in implementation prompt is significantly simplified**
- **Where:** Architecture.md lines 338–362 (full ShiftNeed) vs. lines 1289–1305 (implementation ShiftNeed)
- **Problem:** The implementation prompt's ShiftNeed drops these architecturally important fields:
  - `visitDate: date` — **required** to show when the shift occurs
  - `visitWindow: {startTime, endTime}` — required for scheduling display
  - `priority: enum` — required for demand prioritization (SOC > BID > high-acuity)
  - `shiftType: enum` — required to distinguish recurring vs. PRN vs. SOC
  - `acuityLevel: enum` — inherited from client, drives triage
  - `cancellationSource`, `cancellationReason`, `cancellationPreventable` — required by QA/PI Playbook
  - `estimatedDuration` — the implementation has `durationHours` but as optional
- **Impact:** A ShiftNeed without `visitDate` or `visitWindow` cannot be placed on any calendar or staffing board. Without `priority`, the demo cannot show demand prioritization — a key Brad capability.
- **Fix:** Add to Phase 1 ShiftNeed:
  ```typescript
  visitDate: string;              // ISO date — REQUIRED
  visitWindow?: { startTime: string; endTime: string };
  shiftType?: 'recurring' | 'prn' | 'soc' | 'discharge' | 'supervisory' | 'respite';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  acuityLevel?: 'L1' | 'L2' | 'L3' | 'L4';
  ```

### Medium Severity

**GAP-08: Acuity naming inconsistency (`acuityLevel` vs. `careTier`)**
- **Where:** Architecture.md line 117 uses `acuityLevel: enum: L1_essential, L2_enhanced, L3_specialized, L4_critical`; implementation prompt line 1238 uses `careTier: 'L1' | 'L2' | 'L3' | 'L4'`
- **Problem:** Two different field names for the same concept. The architecture's `acuityLevel` carries semantic labels (`L1_essential`, etc.); the implementation's `careTier` uses bare codes. Both are valid, but they must be reconciled to one canonical name.
- **Fix:** Use `careTier` as the field name (matches Care Indeed's operational language per Brad Requirements lines 48–54). Define the type as: `type CareTier = 'L1_essential' | 'L2_enhanced' | 'L3_specialized' | 'L4_critical'`. Display labels derive from the value.

**GAP-09: `onHold` vs. `on_hold` casing inconsistency in Client status**
- **Where:** Architecture.md line 163 uses `onHold`; implementation prompt line 1239 uses `on_hold`
- **Problem:** The codebase has no standard for multi-word enum casing. Both camelCase (`onHold`) and snake_case (`on_hold`) appear.
- **Fix:** Standardize on snake_case for all status/enum string unions throughout the staffing types to match the implementation prompt's convention: `'active' | 'inactive' | 'discharged' | 'pending' | 'on_hold'`.

**GAP-10: Brad Requirements doc uses `PATIENT_EPISODE` but architecture uses `Client`**
- **Where:** Brad Requirements line 201 (`PATIENT_EPISODE`) vs. Architecture.md line 105 (`CLIENT`)
- **Problem:** The Brad Requirements doc models the demand side as `PATIENT_EPISODE` (combining patient identity with episode data), while the architecture separates these into `Client` (the person/facility) with episode fields embedded. This is a design decision, not a bug — but the implementation prompt should be explicit that episode data is embedded in Client for Phase 1.
- **Fix:** Add a comment in the Client type noting that episode fields (`certPeriodStart`, `certPeriodEnd`, etc.) are deferred to Phase 2+ when Home Health support is added.

**GAP-11: Doc 13 `ClinicianClientAssignment` vs. Architecture's `ClinicianClientConnection` vs. Implementation's `CareAssignment`**
- **Where:** Doc 13 line 103, Architecture.md line 173, Implementation prompt line 1268
- **Problem:** Three different names for the junction concept across three documents. This creates confusion about which is canonical.
- **Fix:** Standardize on `ClinicianClientConnection` per the architecture's rationale (lines 602–604). If a shorter name is needed for the implementation, use `Connection` as the shorthand but never `CareAssignment` (which implies shift-level operation, not relationship-level).

### Low Severity

**GAP-12: Doc 13 includes PHI fields the implementation prompt explicitly defers**
- **Where:** Doc 13 lines 91–93 (`dateOfBirth`, `primaryDiagnosis`, `address`); implementation prompt lines 1261–1263 marks these as DEFER
- **Problem:** Doc 13 suggests these as initial Client fields. The implementation prompt correctly defers them. But Doc 13 was not updated to reflect the deferral — it still shows them as part of the type definition.
- **Fix:** No action needed for implementation prompt. Doc 13 should be annotated as superseded by the implementation prompt for Phase 1 scope.

**GAP-13: Mock data quantity contradiction between architecture sections**
- **Where:** Architecture.md line 853 ("clinicians (70+), clients (150+)") vs. implementation prompt line 1394 ("10 clinicians... 6 clients")
- **Problem:** The Phase 1 plan at line 853 says "Create mock data generators for clinicians (70+), clients (150+)" but the implementation prompt says 10 clinicians and 6 clients. These are in the same document.
- **Fix:** Resolve in favor of the implementation prompt (10/6) for Phase 1 MVP. The 70/150 numbers from line 853 are aspirational for production simulation and should be moved to Phase 2+ scope.

---

## Naming Conflicts: "Skill" vs. "Discipline/Competency"

The Planning_Implementation.md (line 1019–1023) and the implementation prompt (lines 1367–1371) mandate:

| Term | Meaning | Usage Rule |
|------|---------|------------|
| **Discipline** | Professional/service category (RN, LVN, HHA, Caregiver, PT, OT, ST, MSW, CNA) | PRIMARY matching axis |
| **Competency** | Specific capability/experience (wound care, IV therapy, OASIS, trach, Hoyer lift) | SECONDARY matching |
| **Credential** | License/certification/document proving eligibility | Compliance gating |
| **Skill** | — | **NEVER use as primary term** |

### Specific Instances Where "Skill" Appears and Must Be Corrected

| # | Location | Current Text | Required Change |
|---|----------|-------------|-----------------|
| 1 | Architecture.md §2.5 (line 257) | Entity name: **"SKILL"** | Rename entity to **"Competency"** |
| 2 | Architecture.md §2.5 (line 265) | `skillName: string` | Rename to `competencyName: string` |
| 3 | Architecture.md §2.5 (line 266) | `skillCategory: enum` | Rename to `competencyCategory: enum` |
| 4 | Architecture.md §2.1 (line 98) | "Has many **Skills** (one-to-many)" | "Has many **Competencies** (one-to-many)" |
| 5 | Architecture.md §4.4 (line 474) | "4.4 **Skills** (via **Skill** entity)" | "4.4 **Competencies** (via **Competency** entity)" |
| 6 | Architecture.md ERD (line 421) | "**SKILL** [entityType=clinician]" | "**COMPETENCY** [entityType=clinician]" |
| 7 | Architecture.md ERD (line 431) | "**SKILL** [entityType=client]" | "**COMPETENCY** [entityType=client]" |
| 8 | Architecture.md §2.2 (line 132) | `requiredSkills[]: string[]` | Rename to `requiredCompetencies[]: string[]` |
| 9 | Architecture.md §2.9 (line 347) | `requiredSkills[]: string[]` on ShiftNeed | Rename to `requiredCompetencies[]: string[]` |
| 10 | Architecture.md §7 (line 653) | "Skill exact match +0 to +10" | "Competency exact match" |
| 11 | Architecture.md §7 (line 669) | `+ skillExactMatch (max +10)` | `+ competencyExactMatch (max +10)` |
| 12 | Architecture.md §3 (line 450) | "**Skills**: Polymorphic" | "**Competencies**: Polymorphic" |
| 13 | Architecture.md §2.3 (line 195) | `matchFactors` includes `skillMatch` | Change to `competencyMatch` |
| 14 | Brad Requirements §6 (line 157) | `skills[]` under CLINICIAN/CAREGIVER | Change to `competencies[]` |
| 15 | Brad Requirements §6 (line 219) | `requiredSkills[]` under PATIENT_EPISODE | Change to `requiredCompetencies[]` |
| 16 | Brad Requirements §7 (line 352) | `skills match required` | `competencies match required` |
| 17 | Brad Requirements §7 (line 356) | `+ skillExactMatch (+10)` | `+ competencyExactMatch (+10)` |
| 18 | Architecture.md §2.3 (line 195) | `matchFactors` JSON includes `skillMatch` | Change to `competencyMatch` |
| 19 | Architecture.md §11 (line 804) | "Credentials & Compliance" tab + "**Skills**" tab | "Credentials & Compliance" tab + "**Competencies**" tab |
| 20 | Architecture.md §2.11 (line 402) | AuditLog `entityType` includes `skill` | Change to `competency` |

**Total: 20 instances across 2 documents require correction.**

---

## Recommended Corrections

### Correction 1: Restore Accommodation Fields to Implementation Clinician Type

Add to the Clinician interface in the implementation prompt:

```typescript
interface Clinician {
  // ... existing fields ...

  // FEHA Layer 1 Hard Constraints (P0 Compliance)
  religiousRestrictions?: {
    day: string;
    timeRange?: string;
    description: string;
  }[];
  adaAccommodations?: {
    type: string;
    description: string;
    effectiveDate: string;
  }[];
  pregnancyAccommodation?: {
    active: boolean;
    details?: string;
    expectedEndDate?: string;
  };
  fmlaLeave?: {
    active: boolean;
    startDate?: string;
    endDate?: string;
  };
  schedulingLimitations?: {
    type: string;
    description: string;
  }[];
}
```

### Correction 2: Rename CareAssignment to ClinicianClientConnection and Restore Key Fields

```typescript
interface ClinicianClientConnection {
  id: string;
  clinicianId: string;
  clientId: string;
  connectionStatus: 'eligible' | 'preferred' | 'restricted' | 'blocked' | 'assigned' | 'pending_approval' | 'inactive';
  source: 'brad_recommendation' | 'manual_assignment' | 'client_request' | 'clinician_request' | 'historical_continuity';
  discipline: Discipline;
  assignmentRole: 'primary' | 'secondary' | 'prn' | 'supervisory';
  startDate: string;
  endDate?: string;

  // Approval
  assignedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalRationale?: string;

  // Connection Intelligence (Phase 1: display only)
  priorAssignmentCount?: number;
  lastWorkedDate?: string;
  continuityFlag?: boolean;

  // Supervisory (informational)
  lastSupervisoryVisit?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

Unique constraint: `(clinicianId, clientId)` — one record per pair.

### Correction 3: Restore `onLeave` Status and Standardize Enums

```typescript
type ClinicianStatus = 'active' | 'inactive' | 'on_leave' | 'pending' | 'suspended' | 'terminated';

type ClientStatus = 'active' | 'inactive' | 'discharged' | 'pending' | 'on_hold';

type CareTier = 'L1_essential' | 'L2_enhanced' | 'L3_specialized' | 'L4_critical';

type ConnectionStatus = 'eligible' | 'preferred' | 'restricted' | 'blocked' | 'assigned' | 'pending_approval' | 'inactive';
```

### Correction 4: Add Missing Fields to ShiftNeed

```typescript
interface ShiftNeed {
  id: string;
  clientId: string;
  requiredDiscipline: Discipline;
  requiredCompetencies?: string[];      // RENAMED from requiredSkills
  isHardRequirement: boolean;
  visitDate: string;                     // ADDED — required for calendar display
  visitWindow?: {
    startTime: string;
    endTime: string;
  };                                     // ADDED — required for scheduling
  shiftType?: 'recurring' | 'prn' | 'soc' | 'discharge' | 'supervisory' | 'respite';  // ADDED
  priority?: 'critical' | 'high' | 'medium' | 'low';  // ADDED
  acuityLevel?: CareTier;               // ADDED — inherited from client
  frequency?: string;
  preferredDays?: string[];
  durationHours?: number;
  startDate: string;
  endDate?: string;
  status: 'open' | 'filled' | 'cancelled';
  assignedConnectionId?: string;        // RENAMED from assignedCareAssignmentId
  notes?: string;
  createdAt: string;
}
```

### Correction 5: Add `weightedCaseloadPoints` to Client

```typescript
interface Client {
  // ... existing fields ...
  careTier: CareTier;
  weightedCaseloadPoints: number;  // ADDED — computed: L3/L4=1.0, L2=0.75, L1=0.5
  // ... rest of fields ...
}
```

### Correction 6: Add `Credential.expiringSoon` Status and `daysUntilExpiry`

```typescript
interface Credential {
  type: string;
  credentialName: string;              // ADDED
  issuingBody?: string;
  licenseNumber?: string;
  state?: string;
  issuedAt: string;
  expiresAt?: string;
  daysUntilExpiry?: number;            // ADDED — computed, feeds CredentialBadge
  verifiedAt?: string;
  verifiedBy?: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'pending_verification' | 'revoked';  // ADDED expiring_soon
  evidenceRef?: string;
}
```

---

## Phase 1 vs. Deferred Classification Table

| Entity / Feature | Architecture Section | Phase 1 Action | Deferred To | Rationale |
|---|---|---|---|---|
| **Clinician** type | §2.1 | BUILD with corrections (add accommodations, restore `on_leave`) | — | Core supply-side entity |
| **Client** type | §2.2 | BUILD with corrections (add `weightedCaseloadPoints`, use `CareTier`) | — | Core demand-side entity |
| **ClinicianClientConnection** | §2.3 | BUILD as simplified connection (not CareAssignment) | Full intelligence fields → Phase 2 | Junction model is architecturally critical |
| **ShiftNeed** | §2.9 | BUILD with corrections (add `visitDate`, `priority`, `shiftType`) | Cancellation tracking → Phase 2 | Demand unit for staffing board |
| **Discipline** type | §2.1 / Planning_Implementation | BUILD | — | Primary matching axis |
| **Competency** type | Replaces Skill entity | BUILD as embedded interface | Standalone entity → Phase 2 | Secondary matching |
| **Credential** type | §2.6 | BUILD as embedded in Clinician (add `expiring_soon`, `daysUntilExpiry`) | Standalone entity → Phase 2 | Layer 1 display |
| **Availability** entity | §2.4 | DO NOT BUILD | Phase 2 (matching engine) | No matching engine in Phase 1 |
| **Skill** entity | §2.5 | DO NOT BUILD (replaced by Competency) | Rename to Competency in Phase 2 | Naming mandate |
| **Restriction** entity | §2.7 | DO NOT BUILD | Phase 2 (matching engine) | Requires connection intelligence |
| **Preference** entity | §2.8 | DO NOT BUILD | Phase 2 (matching engine) | Requires connection intelligence |
| **ShiftAssignment** entity | §2.10 | DO NOT BUILD | Phase 2 (matching engine) | Operational assignment → Phase 2 |
| **AuditLog** entity | §2.11 | DO NOT BUILD (define type only) | Phase 2 (full implementation) | Type stub for forward compatibility |
| **Accommodation fields** | §2.1 lines 70–79 | BUILD on Clinician type | — | P0 FEHA compliance, non-negotiable |
| **Demographic fields** | §2.1 lines 80–87 | DO NOT BUILD | Phase 2+ (bias audit) | Layer 3 only — risk if stored prematurely |
| **ACCM caseload computation** | §14 line 920 | BUILD as computed view in store | Entity-level tracking → Phase 2 | Demonstrates weighted formula |
| **Eligibility preview** | Planning_Implementation §5 | DEFINE TYPE ONLY (no logic) | Phase 2 (matching engine) | Documents the concept for Phase 2 |
| **AdsDecisionLog** | Planning_Implementation §5 part 1 | DEFINE TYPE ONLY | Phase 2 | FEHA 4-year retention |
| **Staffing Board / Calendar** | Architecture §11 | DO NOT BUILD | Phase 2 | Requires ShiftAssignment + matching |
| **Connection Manager screen** | Architecture §11 | DO NOT BUILD | Phase 2 | Requires full connection lifecycle |
| **Matching engine** | Architecture §7 | DO NOT BUILD | Phase 2 | Complex; requires Availability + Restriction + Credential lifecycle |
| **Supervisory visit tracking** | Architecture §14 line 922 | DISPLAY ONLY (`lastSupervisoryVisit` field) | CES integration → Phase 2 | Informational only in Phase 1 |

---

## Mock Data Adequacy Assessment

### Current Spec (Implementation Prompt)

| Entity | Count | Breakdown |
|--------|-------|-----------|
| Clinicians | 10 | 2 RN, 2 LVN, 1 PT, 1 OT, 3 HHA/CNA, 1 Caregiver |
| Clients | 6 | 2 L1, 2 L2, 1 L3, 1 L4 |
| Connections (CareAssignments) | 8 | Linking clinicians to clients |
| ShiftNeeds | 6 | Some filled, some open |

### Contradictions in Source Documents

| Source | Recommended Count | Context |
|--------|------------------|---------|
| Architecture.md line 853 | 70+ clinicians, 150+ clients | Phase 1 plan within architecture |
| Implementation prompt line 1394 | 10 clinicians, 6 clients | Bottom of same document |
| Planning_Implementation.md line 215 | 15 clinicians, 12 clients minimum | Efficiency recommendations |
| Brad Requirements line 35 | 400+ caregivers, 150 patients | Production scale |

### Assessment

The 10/6/8/6 spec is **adequate for Phase 1 read-only demo** with the following conditions:

**Adequate:**
- Covers all discipline categories (RN, LVN, PT, OT, HHA/CNA, Caregiver)
- Covers all four care tiers (L1–L4)
- Mix of statuses (active/pending/inactive) demonstrates lifecycle

**Inadequate — requires additions:**

1. **No accommodation data in mock clinicians.** At least 2 of the 10 clinicians must have accommodation data:
   - 1 clinician with `religiousRestrictions` (e.g., no work on Saturday for Sabbath observance)
   - 1 clinician with `fmlaLeave` active (demonstrates on_leave status + Layer 1 blocking)

2. **No expired credentials in mock data.** At least 1 clinician must have an expired credential and 1 must have `expiring_soon` to demonstrate the `CredentialBadge` component (green/yellow/red).

3. **No ACCM ownership diversity.** Mock clients should map to at least 2 different `accmOwnerId` values so the ACCM filter on ClientListPage has meaningful data. One ACCM should have caseload near 3.5+ points (demonstrating Near Full band).

4. **ShiftNeeds need `visitDate` populated** to be displayable. At least 2 should be for "today" or "tomorrow" (relative to demo time) to support future staffing board views.

5. **Connection source diversity.** At least 1 connection should be `source: 'client_request'` and 1 should be `source: 'historical_continuity'` to demonstrate non-manual assignment sources.

### Recommended Mock Data Revision

| Entity | Count | Breakdown |
|--------|-------|-----------|
| Clinicians | 10 | 2 RN (1 with religious restriction), 2 LVN (1 with expired credential), 1 PT, 1 OT (with expiring_soon credential), 2 HHA (1 on FMLA leave), 1 CNA, 1 Caregiver |
| Clients | 6 | 2 L1, 2 L2, 1 L3, 1 L4. Across 2 ACCMs. Mix of home/facility. Include `weightedCaseloadPoints`. |
| Connections | 8 | Mix of statuses: 5 eligible/assigned, 1 preferred, 1 restricted, 1 inactive. Mix of sources. |
| ShiftNeeds | 6 | 2 open (today/tomorrow dates), 2 filled, 1 cancelled, 1 with `priority: critical`. |

---

## Final Data Model Recommendation

The consolidated implementation prompt's data model section should contain exactly the following types. This replaces the type definitions in the current implementation prompt (Architecture.md lines 1167–1305).

### Canonical Type Definitions for Phase 1

```typescript
// ============================================================
// TERMINOLOGY (ENFORCED STRICTLY)
// Discipline = professional/service category → primary matching axis
// Competency = specific capability/experience → secondary matching
// Credential = license/certification/document → compliance gating
// NEVER use "Skill" as an entity name or field name
// ============================================================

// --- Shared Enums ---

type Discipline =
  | 'RN' | 'LVN' | 'LPN'
  | 'PT' | 'PTA'
  | 'OT' | 'COTA'
  | 'ST' | 'SLP'
  | 'MSW'
  | 'HHA' | 'CNA'
  | 'Caregiver';

type CareTier = 'L1_essential' | 'L2_enhanced' | 'L3_specialized' | 'L4_critical';

type ClinicianStatus = 'active' | 'inactive' | 'on_leave' | 'pending' | 'suspended' | 'terminated';

type ClientStatus = 'active' | 'inactive' | 'discharged' | 'pending' | 'on_hold';

type ConnectionStatus = 'eligible' | 'preferred' | 'restricted' | 'blocked' | 'assigned' | 'pending_approval' | 'inactive';

type ConnectionSource = 'brad_recommendation' | 'manual_assignment' | 'client_request' | 'clinician_request' | 'historical_continuity';

type CredentialStatus = 'active' | 'expiring_soon' | 'expired' | 'pending_verification' | 'revoked';

type ShiftNeedStatus = 'open' | 'filled' | 'cancelled';

type ShiftType = 'recurring' | 'prn' | 'soc' | 'discharge' | 'supervisory' | 'respite';

type Priority = 'critical' | 'high' | 'medium' | 'low';

// --- Embedded Types ---

interface Competency {
  name: string;
  level?: 'basic' | 'intermediate' | 'advanced';
  verifiedAt?: string;
  verifiedBy?: string;
}

interface Credential {
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

interface ReligiousRestriction {
  day: string;
  timeRange?: string;
  description: string;
}

interface AdaAccommodation {
  type: string;
  description: string;
  effectiveDate: string;
}

interface PregnancyAccommodation {
  active: boolean;
  details?: string;
  expectedEndDate?: string;
}

interface FmlaLeave {
  active: boolean;
  startDate?: string;
  endDate?: string;
}

interface SchedulingLimitation {
  type: string;
  description: string;
}

// --- Core Entities ---

interface Clinician {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  email?: string;
  phone?: string;

  // Professional Identity
  primaryDiscipline: Discipline;
  secondaryDisciplines?: Discipline[];
  competencies: Competency[];
  credentials: Credential[];

  // Employment
  employmentType: 'W2' | 'contractor';
  hireDate?: string;
  status: ClinicianStatus;

  // Organization
  orgRole?: 'field_clinician' | 'supervisor' | 'accm' | 'ccm' | 'vcc' | 'admin';
  supervisorId?: string;
  cgssId?: string;

  // Service
  serviceAreas?: string[];
  maxHoursPerWeek?: number;

  // FEHA Layer 1 Hard Constraints (P0 Compliance)
  religiousRestrictions?: ReligiousRestriction[];
  adaAccommodations?: AdaAccommodation[];
  pregnancyAccommodation?: PregnancyAccommodation;
  fmlaLeave?: FmlaLeave;
  schedulingLimitations?: SchedulingLimitation[];

  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;

  // Service Context
  serviceSetting: 'home' | 'facility';
  serviceEntity: 'home_care';
  careTier: CareTier;
  weightedCaseloadPoints: number;
  status: ClientStatus;

  // Ownership
  accmOwnerId: string;
  ccmId?: string;

  // Location (non-PHI for matching)
  serviceZip?: string;
  serviceCity?: string;
  facilityId?: string;
  facilityName?: string;

  // Dates
  admissionDate?: string;
  dischargeDate?: string;

  // Care Needs
  primaryDiagnosisCategory?: string;
  requiredDisciplines: Discipline[];
  requiredCompetencies?: string[];
  continuityPriority?: 'low' | 'medium' | 'high';

  createdAt: string;
  updatedAt: string;
}

interface ClinicianClientConnection {
  id: string;
  clinicianId: string;
  clientId: string;
  connectionStatus: ConnectionStatus;
  source: ConnectionSource;
  discipline: Discipline;
  assignmentRole: 'primary' | 'secondary' | 'prn' | 'supervisory';
  startDate: string;
  endDate?: string;

  // Approval
  assignedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalRationale?: string;

  // Connection Intelligence (Phase 1: display only, populated in mock data)
  priorAssignmentCount?: number;
  lastWorkedDate?: string;
  continuityFlag?: boolean;

  // Supervisory (informational)
  lastSupervisoryVisit?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Unique constraint: (clinicianId, clientId) — one record per pair

interface ShiftNeed {
  id: string;
  clientId: string;
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
  notes?: string;
  createdAt: string;
}
```

### Type-Only Stubs (Define for Forward Compatibility, Do Not Implement Logic)

```typescript
// Stub: AuditLog type for Phase 2 readiness
interface AuditLogEntry {
  id: string;
  entityType: 'clinician' | 'client' | 'connection' | 'credential' | 'competency' | 'shift_need';
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

// Stub: ADS Decision Log for FEHA 4-year retention
interface AdsDecisionLog {
  id: string;
  decisionType: 'eligibility_check' | 'ranking' | 'recommendation';
  shiftNeedId: string;
  inputFactors: Record<string, unknown>;
  outputResult: Record<string, unknown>;
  biasCheckResult?: Record<string, unknown>;
  timestamp: string;
}
```

---

## Implementation Prompt Impact Summary

The following changes are required to the implementation prompt (Architecture.md lines 1326–1430) before it is used as input to an implementation agent:

| # | Change | Severity | Lines Affected |
|---|--------|----------|---------------|
| 1 | Add accommodation fields to Clinician type | Critical | Type definition |
| 2 | Rename `CareAssignment` → `ClinicianClientConnection` throughout | Critical | Type def, stores, pages, components, mock data |
| 3 | Add `on_leave` to ClinicianStatus | Critical | Type definition |
| 4 | Add `weightedCaseloadPoints` to Client type | High | Type definition, mock data |
| 5 | Add `visitDate`, `priority`, `shiftType`, `visitWindow` to ShiftNeed | High | Type definition, mock data |
| 6 | Add `credentialName`, `daysUntilExpiry`, `expiring_soon` status to Credential | High | Type definition, mock data |
| 7 | Replace all "Skill" references with "Competency" | High | Type definitions, store names, comments |
| 8 | Standardize `CareTier` enum to include labels (`L1_essential`, etc.) | Medium | Type definition |
| 9 | Add accommodation data to mock clinicians (min 2 clinicians) | Medium | Mock data |
| 10 | Add expired/expiring credential to mock clinicians (min 2) | Medium | Mock data |
| 11 | Add ACCM diversity to mock clients (min 2 ACCMs) | Medium | Mock data |
| 12 | Add `continuityPriority` to Client type | Low | Type definition |
| 13 | Add type stubs for `AuditLogEntry` and `AdsDecisionLog` | Low | New type file |

---

*End of Data Model Review*
