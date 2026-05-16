# 09 — Scope Control Review: Phase 1 Staffing MVP

**Generated:** 2026-05-13  
**Role:** Scope-Control Reviewer  
**Review Scope:** Architecture.md, Planning_Implementation.md, System Documentation 12 & 13, Implementation Prompt  

---

## Executive Summary

Phase 1 has **three competing scope definitions** that must be reconciled before implementation begins. Architecture.md Section 12 defines Phase 1 as "Data Model + Mock Data (Weeks 1-2)" with **no UI**, but the implementation prompt at the bottom of the same file builds **4 pages, 6 components, routes, and sidebar nav entries**. Planning_Implementation.md further narrows scope to "Home Care only" and mandates terminology corrections. These documents contradict each other on fundamental questions: Does Phase 1 include UI? How many entities? Which terminology?

This review identifies **14 feature creep flags**, **8 items to add to the DO NOT BUILD list**, **3 over-engineering concerns**, **5 phase boundary risks**, **2 Home Health concept leaks**, and **4 terminology violations** in the current implementation prompt.

**Bottom line:** The implementation prompt is the de facto build spec, but it exceeds Architecture.md Phase 1, includes concepts that Planning_Implementation.md explicitly defers, and has internal inconsistencies that will cause rework if not corrected before code is written.

---

## 1. Authoritative Phase 1 Scope Definition (Reconciled)

### Source Conflict Matrix

| Dimension | Architecture.md §12 (Phase 1) | Architecture.md Implementation Prompt | Planning_Implementation.md |
|---|---|---|---|
| **UI** | "No UI yet" | 4 pages, 6 components, sidebar nav | Read-only pages listed |
| **Entities** | "All 11 entities" | 4 types: Clinician, Client, CareAssignment, ShiftNeed | 4 types (same) |
| **Data volume** | "70+ clinicians, 150+ clients" | "10 clinicians, 6 clients" | "8-10 clinicians, 5-6 clients" |
| **Persistence** | "Local state management (or lightweight DB)" | Zustand stores seeded from mock | Zustand stores |
| **Service lines** | Both HC and HH implied | Not specified | "HC only; add HH in Phase 3" |
| **Terminology** | Uses "Skill" as entity name (§2.5) | Uses "Competency" | Mandates Discipline/Competency ONLY |
| **Matching** | "Implement unique constraint validation functions" | "Do NOT build matching engine" | "Defer matching to Phase 2" |

### Reconciled Authoritative Definition

The **implementation prompt** (bottom of Architecture.md, lines 1362-1430) is the authoritative build spec for Phase 1, with the following corrections applied from Planning_Implementation.md:

1. **Service line:** Home Care ONLY. No Home Health concepts.
2. **Terminology:** Discipline (primary), Competency (secondary). Never "Skill."
3. **UI scope:** Read-only display pages. No write/edit/create forms.
4. **Data scope:** Mock data only. No API, no DynamoDB, no server routes.
5. **Entity count:** 4 entities (Clinician, Client, CareAssignment, ShiftNeed). NOT all 11 from Architecture.md §2.
6. **Mock data size:** 10 clinicians, 6 clients, 8 assignments, 6 shift needs.

**Architecture.md §12 Phase 1 ("no UI") is superseded** by the implementation prompt. The phased plan in §12 was written before the Planning_Implementation.md review refined scope. The implementation prompt represents the latest agreed scope.

**Architecture.md §12 "all 11 entities" is NOT in Phase 1 scope.** Only 4 entities plus supporting types (Discipline, Competency, Credential) are in scope. The remaining 7 entities (Availability, Skill, Credential as standalone entity, Restriction, Preference, ShiftNeed lifecycle, AuditLog) are deferred.

---

## 2. Feature Creep Flags

Items in the implementation prompt that exceed the approved MVP scope of "read-only data display with mock data":

### FLAG 1: Store Actions Imply Query Engine (Medium Risk)

**Location:** Implementation prompt — "CREATE STORES" section  
**Issue:** Store actions `filterByDiscipline`, `filterByStatus`, `filterByTier`, `filterByAccm`, `filterBySetting` are filter operations that could grow into a query engine.  
**Verdict:** ACCEPTABLE for Phase 1 — these are simple array filters on local mock data. But constrain to client-side array `.filter()` calls ONLY. No search indexes, no fuzzy matching, no debounced search.

### FLAG 2: CredentialBadge Implies Credential Lifecycle Logic (Medium Risk)

**Location:** Implementation prompt — "CREATE COMPONENTS" — `CredentialBadge.tsx`  
**Issue:** "Shows green/yellow/red based on expiry" implies date comparison logic and credential status computation. This is the beginning of credential compliance tracking, which Planning_Implementation.md §11 explicitly defers: "No credential renewal compliance."  
**Verdict:** ACCEPTABLE if limited to a static color based on the `status` field already in mock data (`active`/`expired`/`pending_verification`). Must NOT compute `daysUntilExpiry` or trigger status transitions.

### FLAG 3: TierBadge Color Mapping (Low Risk)

**Location:** Implementation prompt — `TierBadge.tsx (L1=green, L2=blue, L3=orange, L4=red)`  
**Verdict:** ACCEPTABLE — pure display logic, no business rules.

### FLAG 4: "Active Assignments Count" on List Pages (Low Risk)

**Location:** Implementation prompt — ClinicianListPage "Shows: ... active assignments count" and ClientListPage "Shows: ... active assignments count."  
**Issue:** Computing active assignments requires joining Clinician/Client data with CareAssignment data. This is a derived field.  
**Verdict:** ACCEPTABLE if computed as a simple `.filter()` on mock CareAssignment array. Must NOT become a denormalized field or trigger a cascade of store subscriptions.

### FLAG 5: "Linked to Clients/Clinicians" on Detail Pages (Medium Risk)

**Location:** Implementation prompt — ClinicianDetailPage "active assignments section (linked to clients)" and ClientDetailPage "active assignments section (linked to clinicians)."  
**Issue:** "Linked" implies navigation between entities. If this means clickable links from a clinician's assignments to the client detail page (and vice versa), it creates a navigation pattern that implies a working relational data layer.  
**Verdict:** ACCEPTABLE — React Router `<Link>` components to the other detail page are fine. But this is the ceiling. No connection manager, no status changes, no approval flows through these links.

### FLAG 6: ShiftNeedCard Component (Medium Risk)

**Location:** Implementation prompt — `ShiftNeedCard.tsx`  
**Issue:** ShiftNeed is a Phase 2 operational entity (shift demand management). Including a display card for it in Phase 1 is acceptable for read-only display, but risks becoming a launchpad for shift management features.  
**Verdict:** ACCEPTABLE for display only. The card must show static data from mock ShiftNeeds. No status transitions, no "assign" buttons, no "fill shift" actions.

### FLAG 7: CareAssignment Entity in Phase 1 (Medium Risk)

**Location:** Implementation prompt — CareAssignment interface definition and mock data  
**Issue:** Architecture.md §12 Phase 3 is "Connection Layer (Weeks 5-6)" — the clinician-client connection entity. Including CareAssignment (a simplified connection entity) in Phase 1 pulls forward Phase 3 scope.  
**Verdict:** ACCEPTABLE — CareAssignment is a stripped-down version (no matchScore, no biasFlags, no approvalWorkflow). It serves Phase 1's goal of showing "who is assigned to whom." But it must remain read-only with no lifecycle management.

### FLAG 8: `assignedBy` and `approvedBy` Fields on CareAssignment (Low Risk)

**Location:** Implementation prompt — CareAssignment interface  
**Issue:** These fields imply an approval workflow exists. In Phase 1 they will be static strings in mock data.  
**Verdict:** ACCEPTABLE — including these fields in the type definition is forward-compatible. They do not create feature creep unless UI is built around them.

### FLAG 9: `lastSupervisoryVisit` Field on CareAssignment (High Risk)

**Location:** Implementation prompt — CareAssignment interface  
**Issue:** Planning_Implementation.md §10 says "Do NOT build compliance tracking yet" and §11 says "No supervisory visit tracking (beyond display)." The `lastSupervisoryVisit` field IS supervisory visit tracking, even if read-only.  
**Verdict:** BORDERLINE — the field itself is acceptable as a type definition for forward compatibility. But if displayed in the UI with any color coding, overdue flags, or compliance indicators, it becomes supervisory compliance tracking. **Recommend: include in type definition, do NOT display in Phase 1 UI.**

### FLAG 10: `orgRole` Field on Clinician (Low Risk)

**Location:** Implementation prompt — Clinician interface  
**Issue:** `orgRole: 'field_clinician' | 'supervisor' | 'accm' | 'ccm' | 'vcc' | 'admin'` implies organizational hierarchy and permission modeling.  
**Verdict:** ACCEPTABLE as a type field. Do NOT use for permission gating in Phase 1.

### FLAG 11: ShiftNeed `status` Values (Medium Risk)

**Location:** Implementation prompt — ShiftNeed interface `status: 'open' | 'filled' | 'cancelled'`  
**Issue:** Even though this is simplified from the full lifecycle (Architecture.md §2.9 has 8 status values), having `filled` implies a process of filling shifts. Mock data can show pre-filled shifts, but no UI should transition a ShiftNeed from `open` to `filled`.  
**Verdict:** ACCEPTABLE for type definition and mock data. No status transition UI.

### FLAG 12: `isHardRequirement` Boolean on ShiftNeed (Medium Risk)

**Location:** Implementation prompt — ShiftNeed interface  
**Issue:** `isHardRequirement: boolean` — "true = disqualifier; false = ranking factor." This is matching engine terminology. It describes how a competency requirement affects eligibility scoring.  
**Verdict:** BORDERLINE — the field is fine for forward compatibility, but the comment "true = disqualifier; false = ranking factor" should be removed from Phase 1. In Phase 1, this field has no behavioral impact.

### FLAG 13: `assignedCareAssignmentId` on ShiftNeed (Low Risk)

**Location:** Implementation prompt — ShiftNeed interface  
**Issue:** This FK implies a join between ShiftNeed and CareAssignment. In mock data, this is just a string. Fine for Phase 1.  
**Verdict:** ACCEPTABLE.

### FLAG 14: 6 Components May Be Over-Scoped (Low Risk)

**Location:** Implementation prompt — CREATE COMPONENTS section  
**Issue:** 6 dedicated components for 4 pages may be over-componentized for read-only mock data. `ClinicianCard`, `ClientCard`, `CredentialBadge`, `DisciplineBadge`, `TierBadge`, `ShiftNeedCard`.  
**Verdict:** ACCEPTABLE — small presentational components are good practice. Not feature creep, just potentially more engineering work than needed for an MVP.

---

## 3. Complete "DO NOT BUILD" List (Expanded)

### Original List (from Planning_Implementation.md §11)

| # | Item | Source |
|---|---|---|
| 1 | No write/edit UI | Planning_Implementation.md |
| 2 | No matching engine | Planning_Implementation.md |
| 3 | No AlayaCare/WellSky integration | Planning_Implementation.md |
| 4 | No PHI fields (DOB, diagnosis text, full address) | Planning_Implementation.md |
| 5 | No credential renewal compliance | Planning_Implementation.md |
| 6 | No supervisory visit tracking (beyond display) | Planning_Implementation.md |
| 7 | No approval workflows | Planning_Implementation.md |
| 8 | No S3 evidence storage | Planning_Implementation.md |
| 9 | No Brad/IA integration with profile data | Planning_Implementation.md |

### Additions (from this review)

| # | Item | Rationale |
|---|---|---|
| 10 | No server routes or API endpoints | Phase 1 is frontend-only with mock data. No `/api/clinicians` or `/api/clients` routes. Doc 13 recommends server routes in Phase 1 — this is overridden by the implementation prompt. |
| 11 | No DynamoDB table creation or persistence | Implementation prompt specifies Zustand stores with mock data only. |
| 12 | No credential expiry computation | `CredentialBadge` must use the static `status` field from mock data, NOT compute days-until-expiry from `expiresAt`. |
| 13 | No shift status transitions | ShiftNeed and CareAssignment statuses are static in mock data. No UI buttons to change status. |
| 14 | No connection manager or connection status workflows | Architecture.md §11 describes a Connection Manager screen — this is Phase 3. |
| 15 | No Staffing Board or daily operations view | Architecture.md §11 describes a Shift Need / Assignment Panel — this is Phase 5. |
| 16 | No bias check, FEHA compliance logic, or demographic fields | Architecture.md §2.1 includes demographic fields "FOR BIAS AUDIT ONLY." These are not in Phase 1 scope. |
| 17 | No AuditLog entity or audit trail display | Architecture.md §12 Phase 6 is "Audit Logs + Approval Workflow." No audit functionality in Phase 1, even read-only. |
| 18 | No Home Health-specific fields or concepts | Planning_Implementation.md §7: "Start with Home Care only; add HH in Phase 3." See Section 8 of this review. |
| 19 | No Availability entity or schedule management | Architecture.md §12 Phase 4 scope. |
| 20 | No Restriction or Preference entities | Architecture.md §12 Phase 3-4 scope. |
| 21 | No caseload capacity metrics or weighted caseload computation | Planning_Implementation.md §9 "Defer" list. |
| 22 | No eligibility preview or `isEligible()` function | Planning_Implementation.md describes this conceptually — it belongs in Phase 2. |
| 23 | No modification of existing CES, eCIgn, PM, or Journey files | Implementation prompt constraint. |
| 24 | No modification of AuthProvider.tsx | Implementation prompt constraint. |

---

## 4. Deferred Features Inventory

### From Architecture.md (Entities and Features NOT in Phase 1)

| Feature | Architecture.md Section | Target Phase | Accidentally in Implementation Prompt? |
|---|---|---|---|
| Availability entity | §2.4 | Phase 4 | No |
| Skill entity (standalone) | §2.5 | Phase 4 (as Competency) | No |
| Credential entity (standalone with lifecycle) | §2.6 | Phase 4 | No — Credential is embedded in Clinician type |
| Restriction entity | §2.7 | Phase 3 | No |
| Preference entity | §2.8 | Phase 3 | No |
| ShiftNeed full lifecycle (8 statuses) | §2.9 | Phase 5 | Partially — ShiftNeed exists with 3 statuses |
| ShiftAssignment entity | §2.10 | Phase 5 | No — replaced by simplified CareAssignment |
| AuditLog entity | §2.11 | Phase 6 | No |
| ClinicianClientConnection (full) | §2.3 | Phase 3 | No — replaced by simplified CareAssignment |
| Matching readiness logic | §7 | Phase 5 | No |
| Scoring formula | §7 | Phase 5 | No |
| Human approval workflow | §8 | Phase 6 | No |
| Citation card generation | §8 | Phase 6 | No |
| Connection Manager screen | §11 | Phase 3 | No |
| Staffing Board (daily view) | §11 | Phase 5 | No |
| Matching Review Panel | §11 | Phase 5 | No |
| Reports / Compliance Dashboard | §11 | Phase 6+ | No |
| Bias Monitoring Dashboard | §11 | Phase 6+ | No |
| Audit Log Viewer | §11 | Phase 6 | No |
| Brad optimizer integration | §12 Phase 7 | Phase 7 | No |
| Layer 3 bias check automation | §12 Phase 7 | Phase 7 | No |
| Predictive call-out modeling | §12 Phase 7 | Phase 7 | No |
| Visit frequency parser | §12 Phase 7 | Phase 7 | No |

### From Planning_Implementation.md (Explicitly Deferred)

| Feature | Planning_Implementation.md Section | Target Phase |
|---|---|---|
| Matching engine | §11 | Phase 2 |
| AlayaCare integration | §11 | Phase 3 |
| WellSky integration | §11 | Phase 4+ |
| Auto-ShiftNeed generation from care plans | §11 | Phase 2 |
| Credential renewal CES events | §11 | Phase 2 |
| Supervisory visit compliance engine | §11 | Phase 2 |
| Client intake forms via eCIgn | §11 | Phase 2 |
| Caregiver-client compatibility scoring | §11 | Phase 3 |
| Caseload balancing | §11 | Phase 3 |
| Multi-entity support (HH + HC in one view) | §11 | Phase 3 |
| Mobile app for field clinicians | §11 | Future |
| Brad knowledge of client PHI | §11 | Never (or Phase 4 with PHI framework) |
| FEHA ADS compliance framework | Part 1 §1 | Phase 2 (pre-matching) |
| Claims substantiation documentation | Part 3 §2 | Phase 2 |
| AdsDecisionLog entity | Part 5 | Phase 2 |
| CaseloadTransfer entity | §9 | Phase 2 |
| AvailabilityWindow entity | §11 | Phase 2 |

---

## 5. Phase Boundary Risk Assessment

### RISK 1: CareAssignment Type Is Too Narrow for Phase 3 Connection Layer (High)

**Current Phase 1 definition:**
```typescript
interface CareAssignment {
  id: string;
  clinicianId: string;
  clientId: string;
  discipline: Discipline;
  assignmentRole: 'primary' | 'secondary' | 'prn' | 'supervisory';
  startDate: string;
  endDate?: string;
  status: 'active' | 'ended' | 'pending_approval';
  assignedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  lastSupervisoryVisit?: string;
  createdAt: string;
}
```

**Architecture.md Phase 3 requires:** ClinicianClientConnection with `connectionStatus` (7 values), `source` (6 values), `matchScore`, `matchFactors`, `distanceMiles`, `approvalStatus`, `biasFlags`, `citationCard`, and more.

**Risk:** CareAssignment and ClinicianClientConnection serve different purposes. CareAssignment is "who is working with whom now." ClinicianClientConnection is "what is the full relationship history and match quality." Phase 3 will need to either:
- Replace CareAssignment with ClinicianClientConnection (breaking change)
- Keep both entities (data model complexity)
- Extend CareAssignment with connection fields (type bloat)

**Mitigation:** Document now that CareAssignment is a **Phase 1 simplification** that will be superseded by ClinicianClientConnection in Phase 3. The Phase 1 CareAssignment data can be migrated to ClinicianClientConnection records with `connectionStatus: 'assigned'`.

### RISK 2: Mock Data Shape May Not Match Production Data (Medium)

**Issue:** The implementation prompt specifies "Realistic Bay Area names" and specific counts (10 clinicians, 6 clients), but does not define the data shape constraints that production data will have:
- Production clinicians come from AlayaCare/WellSky (external system IDs, different field names)
- Production clients have PHI fields that are deliberately excluded from Phase 1
- Production credentials have `evidenceRef` pointing to S3 objects that don't exist in Phase 1

**Risk:** Mock data becomes a "golden path" that developers optimize for. When production data arrives with different shapes, null fields, or unexpected values, the UI breaks.

**Mitigation:** Mock data should include:
- At least 2 clinicians with missing optional fields (no `preferredName`, no `email`, no `serviceAreas`)
- At least 1 client with minimal data (only required fields populated)
- At least 1 credential with `status: 'expired'` and no `expiresAt` date (edge case)
- At least 1 CareAssignment with `status: 'ended'`

### RISK 3: Route Structure Conflicts with Future Features (Low)

**Phase 1 routes:**
- `/clinicians` → ClinicianListPage
- `/clinicians/:clinicianId` → ClinicianDetailPage
- `/clients` → ClientListPage
- `/clients/:clientId` → ClientDetailPage

**Future features that need routes:**
- `/staffing` → Staffing Board (Phase 5)
- `/connections` → Connection Manager (Phase 3)
- `/staffing/matching/:shiftNeedId` → Matching Review Panel (Phase 5)
- `/reports/compliance` → Compliance Dashboard (Phase 6)

**Risk:** Low — the route structure is clean and extensible. No conflicts identified.

**Mitigation:** None needed. The `/clinicians` and `/clients` routes are correctly scoped.

### RISK 4: Zustand Store Pattern Won't Scale to Server-Side Persistence (High)

**Issue:** Phase 1 uses Zustand stores seeded from mock data with simple filter actions. Phase 2+ requires server-side persistence (DynamoDB). The transition from "Zustand store with local data" to "Zustand store as cache layer over API" requires:
- Adding async actions (API calls)
- Adding loading/error states
- Adding cache invalidation
- Potentially switching to React Query or SWR for server state

**Risk:** If Phase 1 Zustand stores are designed as the source of truth (which they are, since there's no server), Phase 2 must refactor every store and every component that reads from them.

**Mitigation:** Design Phase 1 stores with a clear separation between "data" and "UI state." Store the mock data in a separate module that can be swapped for API calls later. Use selectors pattern so components don't directly access store internals.

### RISK 5: Doc 13 Recommends Server Routes in Phase 1 (Medium)

**Issue:** System Documentation 13 (§Phase 1 Implementation Recommendation) says: "Create server routes `server/routes/clinicians.ts` with `GET /api/clinicians` and `GET /api/clinicians/:id`" and "Create DynamoDB table `clinicians`." The implementation prompt says no server routes, no DynamoDB.

**Risk:** If a developer reads Doc 13 instead of the implementation prompt, they will build server infrastructure that is out of scope.

**Mitigation:** Add a note to Doc 13 that its Phase 1 recommendation is superseded by the implementation prompt. The implementation prompt is the authoritative build spec.

---

## 6. Over-Engineering Flags

### OVER-ENGINEERING 1: 11-Entity Data Model Defined in Architecture.md (Confirmed)

**Issue:** Architecture.md §2 defines 11 entities with full field specifications: Clinician (30+ fields), Client (30+ fields), ClinicianClientConnection (20+ fields), Availability (13 fields), Skill (11 fields), Credential (14 fields), Restriction (13 fields), Preference (10 fields), ShiftNeed (18 fields), ShiftAssignment (25+ fields), AuditLog (12 fields).

**Phase 1 actually uses:** 4 simplified entities with 10-15 fields each.

**Verdict:** The full data model in Architecture.md is a **design reference**, not a Phase 1 deliverable. This is acceptable — the architecture document should define the full vision. The risk is if a developer reads Architecture.md §2 and implements all 11 entities in Phase 1.

**Recommendation:** The implementation prompt correctly scopes to 4 entities. No change needed, but the implementation prompt should explicitly state: "The full 11-entity model in Architecture.md is the Phase 3-7 target. Phase 1 implements only the 4 entities listed below."

### OVER-ENGINEERING 2: Clinician Detail Page Sections (Medium Concern)

**Issue:** The implementation prompt specifies the ClinicianDetailPage has: "Full profile: personal info section, credentials section (with expiry status badges), competencies section, active assignments section (linked to clients)."

That's 4 sections. Architecture.md §11 specifies 7 tabs for the clinician detail page: Overview, Credentials & Compliance, Skills, Availability & Accommodations, Connections, Assignment History, Audit Trail.

**Verdict:** The implementation prompt correctly reduces to 4 sections (not tabs). This is appropriate for Phase 1. However, the 4 sections are still substantial for read-only mock data. Consider whether a single-page layout (no tabs) would suffice.

**Recommendation:** Keep the 4 sections but implement as a single scrollable page, not as tabs. Tabs imply more content depth than mock data provides.

### OVER-ENGINEERING 3: Scoring Formula Leakage Check (Clear)

**Issue:** Architecture.md §7 defines a full scoring formula with 11 factors and weights. Planning_Implementation.md §5 asks: "Is the Scoring Formula (section 7) included anywhere it shouldn't be?"

**Finding:** The scoring formula is NOT in the implementation prompt. No `matchScore`, `matchFactors`, or scoring logic is in Phase 1 scope. The only proximity is `isHardRequirement` on ShiftNeed, which references "disqualifier" and "ranking factor" in its comment — matching engine concepts.

**Verdict:** Clean. Remove the comment "true = disqualifier; false = ranking factor" from the ShiftNeed interface to avoid conceptual leakage.

---

## 7. Home Health Concept Leakage Check

### PASS: Implementation Prompt Types

The implementation prompt's type definitions do NOT include:
- `episodePattern` — NOT present
- `visitFrequencyString` — NOT present
- `parsedVisitPlan` — NOT present
- OASIS references — NOT present
- Certification periods (`certPeriodStart`, `certPeriodEnd`) — NOT present
- `currentWeek` (week in episode) — NOT present
- `authorizationLimit` — NOT present
- `payerType` — NOT present
- `missedVisitSensitivity` — NOT present
- `visitIntensity` — NOT present
- `taperType` — NOT present
- `frontloadIndex` — NOT present

### LEAK 1: `serviceEntity` Field Allows 'home_health' Conceptually

**Location:** Implementation prompt — Client interface: `serviceEntity: 'home_care'` with comment "Phase 1: HC only."

**Issue:** The type definition in Planning_Implementation.md shows `serviceEntity: 'home_care'` as a literal type. But Architecture.md and Planning_Implementation.md §7 define three service entities: `home_care`, `home_health`, and `facility` (or similar). If the TypeScript type is defined as `serviceEntity: 'home_care' | 'home_health'`, a developer could create mock clients with `serviceEntity: 'home_health'`.

**Verdict:** MINOR LEAK. The type should be `serviceEntity: 'home_care'` (literal string, no union) in Phase 1. When Home Health is added in Phase 3, extend the type.

**Recommendation:** Define `serviceEntity` as a literal `'home_care'` in Phase 1, not as a union type.

### LEAK 2: `clientType` in Architecture.md §2.2 Includes 'individual_homehealth'

**Location:** Architecture.md §2.2 Client entity — `clientType: enum: individual_homehealth, individual_homecare, facility`

**Issue:** The full Architecture.md data model includes `individual_homehealth` as a client type. The implementation prompt replaces `clientType` with `serviceSetting` and `serviceEntity`, which is correct. But if a developer refers to Architecture.md §2.2 for reference, they may include the Home Health client type.

**Verdict:** ACCEPTABLE — the implementation prompt correctly excludes this. But flag for awareness.

### LEAK 3: ShiftNeed `shiftType` Not Included — But Architecture.md Has HH-Specific Values

**Location:** Architecture.md §2.9 — `shiftType: enum: recurring, prn, soc, discharge, supervisory, respite, liveIn`

**Issue:** `soc` (Start of Care) and `discharge` are Home Health concepts. The implementation prompt's ShiftNeed does NOT include `shiftType`, which is correct. No leak.

**Verdict:** CLEAN.

### Overall Home Health Leakage: LOW RISK

The implementation prompt is clean of Home Health concepts. The only risk is developers reading Architecture.md sections 2.2, 2.9, 5.3, and 5.4 and bringing HH concepts into Phase 1 mock data.

---

## 8. Terminology Compliance Check

### Standard (from Planning_Implementation.md)

| Term | Usage | Status |
|---|---|---|
| **Discipline** | Professional/service category (RN, LVN, HHA, etc.) | PRIMARY term |
| **Competency** | Specific capability/experience (wound care, IV therapy, etc.) | SECONDARY term |
| **Credential** | License/certification/document | TERTIARY term |
| **Skill** | NEVER use as primary term | BANNED |

### Implementation Prompt Compliance

| Location | Term Used | Compliant? |
|---|---|---|
| TERMINOLOGY section | Discipline, Competency, Credential defined. "NEVER use Skill" | YES |
| Clinician interface | `primaryDiscipline`, `secondaryDisciplines`, `competencies`, `credentials` | YES |
| Client interface | `requiredDisciplines`, `requiredCompetencies` | YES |
| CareAssignment interface | `discipline` | YES |
| ShiftNeed interface | `requiredDiscipline`, `requiredCompetencies` | YES |
| Components | `DisciplineBadge.tsx` | YES |
| Store actions | `filterByDiscipline` | YES |

### Architecture.md Compliance (Where Terminology Conflicts Exist)

| Location | Term Used | Compliant? | Issue |
|---|---|---|---|
| Architecture.md §2.5 | **SKILL** entity (full section) | **NO** | The entire entity is named "Skill" with fields `skillName`, `skillCategory`, `proficiencyLevel`. This directly contradicts the terminology mandate. |
| Architecture.md §2.1 | `Has many Skills (one-to-many)` | **NO** | Clinician relationship uses "Skills." |
| Architecture.md §4.4 | Section titled "Skills (via Skill entity)" | **NO** | Profile architecture uses "Skills." |
| Architecture.md §7 | `skillExactMatch` scoring factor | **NO** | Matching logic uses "skill" terminology. |

**Verdict:** The **implementation prompt** is terminology-compliant. **Architecture.md** is NOT. Since Architecture.md is the long-term design reference, it should be corrected — but this is a documentation task, not a Phase 1 build task. The risk is developers reading Architecture.md and using "Skill" in code.

**Recommendation:** Add a note at the top of Architecture.md: "TERMINOLOGY NOTE: This document uses 'Skill' in several places. Per the Phase 1 terminology standard, use 'Competency' instead of 'Skill' in all code. See Planning_Implementation.md for authoritative terminology."

---

## 9. Recommended Corrections for the Implementation Prompt

### CORRECTION 1: Add Explicit Scope Boundary Statement

Add at the top of the implementation prompt:

> "This prompt implements Phase 1 of the Staffing MVP. Phase 1 scope is: read-only display of mock data for Home Care clinicians and clients. The full 11-entity data model in Architecture.md sections 2.1-2.11 is the Phase 3-7 target. Phase 1 implements only the 4 entities listed below. Do NOT reference Architecture.md for field lists — use only the interfaces defined in this prompt."

### CORRECTION 2: Remove Matching Engine Comment from ShiftNeed

Change ShiftNeed's `isHardRequirement` comment from:
```
isHardRequirement: boolean;  // true = disqualifier; false = ranking factor
```
To:
```
isHardRequirement: boolean;  // Indicates if this competency is mandatory vs preferred
```

### CORRECTION 3: Lock `serviceEntity` to Literal Type

Change:
```
serviceEntity: 'home_care';  // Phase 1: HC only
```
To:
```
serviceEntity: 'home_care';  // LOCKED to home_care in Phase 1. Do NOT add 'home_health' until Phase 3.
```

### CORRECTION 4: Clarify CredentialBadge Behavior

Add to constraints:
> "CredentialBadge must display color based on the static `status` field in mock data (`active` = green, `expired` = red, `pending_verification` = yellow). Do NOT compute expiry status from `expiresAt` dates. Do NOT implement credential lifecycle transitions."

### CORRECTION 5: Suppress `lastSupervisoryVisit` Display

Add to constraints:
> "The `lastSupervisoryVisit` field exists on CareAssignment for forward compatibility but must NOT be displayed in any Phase 1 UI component. Supervisory visit tracking is Phase 2 scope."

### CORRECTION 6: Clarify No Server Routes

Add to constraints:
> "Do NOT create any server-side files, API routes, or DynamoDB tables. Phase 1 is entirely frontend with Zustand stores seeded from static mock data arrays."

### CORRECTION 7: Add Edge Case Requirements to Mock Data

Add to mock data section:
> "Include at least 2 clinicians with minimal data (only required fields). Include at least 1 client with only required fields. Include at least 1 CareAssignment with `status: 'ended'`. Include at least 1 credential with `status: 'expired'`. This ensures the UI handles sparse data gracefully."

### CORRECTION 8: Reconcile Doc 13 Phase 1 Recommendation

System Documentation 13 recommends DynamoDB tables and server routes in Phase 1. Add a note to Doc 13 or to the implementation prompt:
> "Doc 13's Phase 1 recommendation (server routes, DynamoDB tables) is superseded by this implementation prompt. Phase 1 is frontend-only."

### CORRECTION 9: Clarify Store Design for Future API Migration

Add to store creation section:
> "Design stores so mock data import can be replaced by API calls in Phase 2 without changing component code. Use selector functions for data access. Store filter state separately from data state."

---

## 10. Summary of Findings

| Category | Count | Severity |
|---|---|---|
| Feature creep flags | 14 | 2 High, 7 Medium, 5 Low |
| DO NOT BUILD additions | 15 (total 24) | — |
| Deferred features cataloged | 33 | — |
| Phase boundary risks | 5 | 2 High, 2 Medium, 1 Low |
| Over-engineering flags | 3 | 1 Confirmed, 1 Medium, 1 Clear |
| Home Health leaks | 2 | 1 Minor, 1 Awareness |
| Terminology violations (in Architecture.md) | 4 | Documentation-only |
| Recommended prompt corrections | 9 | — |

### Disposition

Phase 1 is **approved for implementation** with the 9 corrections above applied to the implementation prompt. The scope is well-defined in the implementation prompt itself, but guardrails are needed to prevent developers from reading Architecture.md or Doc 13 and expanding scope.

The single highest risk is **RISK 4: Zustand stores that don't anticipate server-side persistence.** This should be addressed in store design, not by adding server infrastructure to Phase 1.

---

*End of Scope Control Review*
