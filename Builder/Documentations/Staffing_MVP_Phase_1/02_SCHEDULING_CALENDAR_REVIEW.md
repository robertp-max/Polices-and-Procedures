# 02 — Scheduling / Calendar Demo Review

**Reviewer:** Scheduling/Calendar Demo Reviewer (Automated)
**Date:** 2026-05-13
**Scope:** Phase 1 Staffing MVP — Scheduling Board, Calendar Separation, ShiftNeed Lifecycle, Demo Scenarios, Route Integration
**Status:** REVIEW COMPLETE — Corrections Required Before Implementation

---

## Executive Summary

The Phase 1 Staffing MVP planning documents (Architecture.md sections 2.9–2.11 and 8, Planning_Implementation.md Parts 3 and 6) define a Staffing Board with Today/Tomorrow/Week views and a ShiftNeed lifecycle that is structurally sound but **over-specified for a read-only MVP demo**. The existing codebase's calendar infrastructure (Master Calendar, Google Calendar sync, CES sprint calendar) is architecturally distinct from the proposed staffing calendar — this is correct and must remain so. However, the planning documents lack explicit separation enforcement, and several specification gaps would block implementation.

**Key findings:**

1. **Calendar separation is implicitly correct but not explicitly enforced.** No shared stores, no shared types, no shared routes — but no planning doc states this as a rule.
2. **ShiftNeed lifecycle is over-engineered for Phase 1.** The 8-status state machine (`open → matchingInProgress → matched → assigned → confirmed → completed → missed → cancelled`) includes states that require a matching engine (Phase 2+). Phase 1 needs at most 4 statuses.
3. **`assignmentSource` is partially defined.** Architecture.md defines only `bradRecommendation | manualAssignment`. Planning_Implementation.md recommends `brad_recommendation | brad_filled | manual_override`. These are inconsistent and neither is implemented in the codebase.
4. **Demo scenarios are well-specified in Planning_Implementation.md** (3 Brad-matched, 2 hard-gate, 1 human override) but are not reflected in any mock data specification.
5. **Staffing Board specification lacks component-level detail** needed for implementation — no column definitions, no card layout, no interaction patterns for a read-only board.
6. **Route integration plan is missing.** New `/staffing/*` routes are not defined in any planning document, and the sidebar navigation (`CommandCenterLayout.tsx`) has no slot for staffing.

---

## 1. Calendar Separation Analysis

### Existing Calendar Infrastructure

The codebase has a mature, compliance-focused calendar system consisting of:

| Component | File | Purpose |
|---|---|---|
| Master Calendar Page | `src/policy/pages/MasterCalendarPage.tsx` | Regulatory event timeline with workflow execution |
| Calendar Sync Store | `src/policy/stores/calendarSyncStore.ts` | Google Calendar push-sync for compliance events |
| Calendar API | `src/policy/services/calendarApi.ts` | Google Calendar REST integration |
| Regulatory Events | `src/policy/data/regulatoryEvents.ts` | Static compliance event definitions |
| CES Sprint Board | `src/policy/ces/pages/CesBoardPage.tsx` | Sprint-based compliance execution kanban |
| Google Calendar Server | `server/routes/calendar.ts`, `server/googleCalendar.ts` | Express routes for Google Calendar API |

**Critical observation:** The Master Calendar is explicitly described in its own source as *"Not a calendar. A control surface over the workflow system"* (`MasterCalendarPage.tsx`, line 36). It renders `RegulatoryEvent` instances — compliance workflow projections — not staffing shifts or clinician schedules.

### Separation Verdict: ARCHITECTURALLY SAFE — But Needs Explicit Policy

The existing calendar system operates on:
- **Data type:** `RegulatoryEvent` (from `src/policy/data/regulatoryEvents.ts`)
- **Store:** `calendarSyncStore` (Google Calendar sync), `regulatoryExecutionStore` (workflow state)
- **Route:** `/calendar` and `/calendar/event/:eventId/*`
- **Domain:** Compliance execution (QAPI, governing body, risk management)

The proposed staffing calendar would operate on:
- **Data type:** `ShiftNeed` + `ShiftAssignment` (from staffing types — not yet created)
- **Store:** New staffing-specific store (not yet created)
- **Route:** `/staffing/*` (not yet defined)
- **Domain:** Clinician scheduling and assignment

**There is zero overlap in data types, stores, routes, or domain logic.** The separation is architecturally sound. However:

### GAP: No Explicit Separation Rule in Planning Documents

Neither Architecture.md nor Planning_Implementation.md contains a statement like:

> "The staffing calendar/board MUST NOT import from, extend, or share state with `calendarSyncStore`, `regulatoryExecutionStore`, `calendarApi`, or any file under `src/policy/data/regulatoryEvents.ts`. The staffing module has its own data layer, its own store, and its own route tree."

**Risk:** Without this explicit constraint, a developer could reasonably attempt to reuse `MasterCalendarPage` components (like `TimelineMonth.tsx`, `MonthGrid.tsx`) for the staffing board. These components are tightly coupled to `RegulatoryEvent` types and compliance workflow state — reusing them would create a coupling hazard.

**Recommendation:** Add an explicit separation constraint to the implementation prompt:

```
CONSTRAINT: The staffing module (src/policy/staffing/) must have ZERO imports 
from src/policy/stores/calendarSyncStore.ts, src/policy/stores/calendarStore.ts, 
src/policy/services/calendarApi.ts, src/policy/data/regulatoryEvents.ts, 
src/policy/components/regulatory/*, or src/policy/ces/*. 
The staffing board is NOT a calendar — it is a shift-need dashboard.
```

---

## 2. Staffing Board Specification Gaps

### What Architecture.md Defines (Section 11)

The Architecture.md specifies a "Staffing Board" nav item with:

```
├── Staffing Board (daily shift needs + assignments)
│   ├── Today View
│   ├── Tomorrow View
│   ├── Week View
│   └── Uncovered Visits Alert
```

And a "Shift Need / Assignment Panel" screen:

| Screen | Purpose | Key Actions |
|---|---|---|
| Shift Need / Assignment Panel | Daily operations view. "Today" and "Tomorrow" views showing all shift needs, their status, assigned clinicians, gaps. | Create shift need, view matching candidates, approve assignment, handle call-outs, see uncovered visits |

### Gaps Identified

**GAP 2.1: No column/layout specification for the board view.**
The doc says "Today/Tomorrow/Week views" but doesn't specify what a row/card looks like. For implementation, we need:
- What fields appear on each ShiftNeed card? (client name, discipline, time window, status, assigned clinician)
- How are uncovered shifts visually distinguished?
- What is the grouping axis? (by time slot? by client? by discipline? by status?)

**GAP 2.2: "Key Actions" include write operations that are out of Phase 1 scope.**
The Architecture.md lists: "Create shift need, view matching candidates, approve assignment, handle call-outs." Phase 1 is read-only. The planning doc must clarify that Phase 1 Staffing Board is display-only with no interactive actions.

**GAP 2.3: No specification for the "Uncovered Visits Alert" visual treatment.**
Is this a banner? A count badge? A filtered view? A separate panel?

**GAP 2.4: Week View lacks definition.**
Today and Tomorrow are clear temporal scopes. "Week View" is ambiguous:
- Current work week (Mon–Fri)?
- Rolling 7 days from today?
- Current calendar week (Sun–Sat)?

**GAP 2.5: No responsive/mobile specification.**
The existing `MasterCalendarPage` has viewport breakpoints (`isCompactLayout < 1280`, `isMobileLayout < 768`). The staffing board needs similar consideration.

### Recommended Phase 1 Staffing Board Specification

For a read-only MVP demo, the Staffing Board should be:

| Aspect | Phase 1 Specification |
|---|---|
| **Primary view** | "Today" — single-day shift-need list |
| **Secondary view** | "Tomorrow" — preview of next day |
| **Deferred** | "Week View" — defer to Phase 2 |
| **Grouping** | Group by status: Uncovered (red) → Assigned (amber) → Confirmed (green) → Completed (gray) |
| **Card fields** | Client name, required discipline badge, visit window (time), status badge, assigned clinician name (if any), assignment source badge |
| **Uncovered alert** | Top-of-page banner: "X uncovered shifts for today" with count, red background |
| **Interactions** | Click card → expand detail (read-only). No create, edit, or approve actions. |
| **Layout** | Single-column card list (not a calendar grid). Group headers by status. |

---

## 3. ShiftNeed Status Lifecycle — Phase 1 Scope Assessment

### Current Specification (Architecture.md Section 2.9)

```
status: enum: open, matchingInProgress, matched, assigned, confirmed, completed, missed, cancelled
```

This is an 8-status state machine.

### Phase 1 Applicability Analysis

| Status | Requires | Phase 1 Applicable? | Verdict |
|---|---|---|---|
| `open` | ShiftNeed created | Yes | **KEEP** — Initial state |
| `matchingInProgress` | Matching engine running | No — matching engine is Phase 2 | **DEFER** |
| `matched` | Matching engine returned candidates | No — matching engine is Phase 2 | **DEFER** |
| `assigned` | Clinician selected and assigned | Yes — mock data shows assigned shifts | **KEEP** |
| `confirmed` | Clinician confirmed acceptance | No — notification system is Phase 2+ | **DEFER** |
| `completed` | Visit completed | Yes — mock data shows completed shifts | **KEEP** |
| `missed` | Visit was missed | Yes — demo scenario for consequence display | **KEEP** |
| `cancelled` | Shift cancelled | Yes — demo scenario | **KEEP** |

### Recommended Phase 1 Status Set

```typescript
type ShiftNeedStatus_Phase1 = 
  | 'open'        // Shift need exists, no clinician assigned
  | 'assigned'    // Clinician assigned (by Brad recommendation or manual)
  | 'completed'   // Visit delivered
  | 'missed'      // Visit was not delivered
  | 'cancelled';  // Shift cancelled before delivery
```

**5 statuses, not 8.** The `matchingInProgress`, `matched`, and `confirmed` statuses require infrastructure that doesn't exist in Phase 1 (matching engine, clinician notification system). They should be defined in the type system with a comment `// Phase 2` but not used in mock data or UI.

### State Transitions (Phase 1)

```
open ──→ assigned ──→ completed
  │         │             
  │         ├──→ missed    
  │         │             
  │         └──→ cancelled 
  │                       
  └──→ cancelled          
```

### Cancellation Fields — Keep for Phase 1

The cancellation tracking fields are correctly specified and should remain:
- `cancellationSource: 'client_initiated' | 'caregiver_initiated' | 'agency_initiated'`
- `cancellationReason: string`
- `cancellationPreventable: boolean`

These align with the QA/PI Playbook cancellation classification system (Requirements doc Section 8) and are needed for the demo narrative even in a read-only view.

---

## 4. Demo Scenario Coverage Assessment

### Planning_Implementation.md Recommendations (Part 3, Section 4)

The document recommends these demo scenarios:
1. **3 Brad-matched shifts** — Brad identified the match using discipline + credential + competency
2. **2 hard-gate failures** — Brad could not match due to expired credential or blocked connection
3. **1 human override** — Brad recommended but human overrode

### Assessment Against Mock Data Specification

**FINDING: No mock data specification exists that implements these scenarios.**

Architecture.md Section 12 (Phased Implementation) says:
> "Phase 1: Data Model + Mock Data (Weeks 1-2) — Create mock data generators for clinicians (70+), clients (150+)"

The Implementation Prompt (Architecture.md lines 1393-1397) scales this down to:
> "10 clinicians... 6 clients... 8 CareAssignments... 6 ShiftNeeds (some filled, some open)"

**Neither specification maps the 6 ShiftNeeds to the 6 demo scenarios.** The mock data must be designed to tell the demo story.

### Recommended Mock Data — ShiftNeed Scenarios

| # | Scenario | ShiftNeed Status | Assignment Source | Demo Purpose |
|---|---|---|---|---|
| 1 | Brad matched RN to L3 wound care | `assigned` | `brad_recommendation` | Show discipline + competency match |
| 2 | Brad matched HHA to L1 companion care | `assigned` | `brad_recommendation` | Show routine successful match |
| 3 | Brad matched LVN to L2 medication management | `assigned` | `brad_recommendation` | Show credential validation |
| 4 | Open shift — LVN credential expired | `open` | (none) | Show hard-gate: expired credential |
| 5 | Open shift — clinician blocked by client | `open` | (none) | Show hard-gate: blocked connection |
| 6 | Override — Brad recommended Clinician A, human chose Clinician B | `assigned` | `manual_override` | Show HITL decision with rationale |

Each assigned ShiftNeed should have a corresponding `ShiftAssignment` record with:
- `matchScore` and `matchFactors` (even if calculated offline for mock data)
- `citationCard` JSON showing the defensibility trail
- `overrideReason` (for scenario 6 only)

Each open ShiftNeed (scenarios 4-5) should have mock `blockers[]` data showing why no clinician could be matched.

---

## 5. Assignment Source Tracking — Inconsistency Found

### Architecture.md Definition (Section 2.10, Line 380)

```
assignmentSource  enum: bradRecommendation, manualAssignment  How this was created
```

Two values, camelCase.

### Planning_Implementation.md Definition (Part 3, Section 4)

```
assignmentSource: 'brad_recommendation' | 'brad_filled' | 'manual_override'
```

Three values, snake_case.

### Analysis

| Value | Architecture.md | Planning_Implementation.md | Verdict |
|---|---|---|---|
| Brad recommended, human approved | `bradRecommendation` | `brad_recommendation` | Same concept, different casing |
| Brad auto-filled (no human review) | (not present) | `brad_filled` | **Not applicable** — all assignments require human review per §484 |
| Human overrode Brad's recommendation | (not present) | `manual_override` | **Required for demo scenario 6** |
| Human assigned without Brad involvement | `manualAssignment` | (not present) | Valid for Phase 1 manual entry |

### Recommended Canonical Definition

```typescript
type AssignmentSource = 
  | 'brad_recommendation'   // Brad recommended, human approved
  | 'manual_assignment'     // Human assigned without Brad involvement
  | 'manual_override';      // Brad recommended differently, human overrode with rationale
```

**Remove `brad_filled`** — it implies autonomous assignment without human review, which violates 42 CFR §484 and FEHA ADS requirements. Per the Requirements document: *"All assignments require meaningful human review before finalization"* (Section 4). Even in future phases, `brad_recommendation` with human approval is the correct flow.

**Use snake_case** — consistent with the TypeScript convention in the rest of the proposed staffing types (e.g., `client_initiated`, `caregiver_initiated` in cancellation source).

---

## 6. Route Integration Plan

### Current Route Landscape (from 03_APP_ROUTES_AND_NAVIGATION.md)

The app has ~70 routes organized into these authenticated route groups inside `CommandCenterLayout`:

- Dashboard (`/dashboard`)
- Calendar & Event Execution (`/calendar/*`)
- CES (`/ces/*`)
- Policy Library (`/library/*`)
- Policy Lifecycle (`/policy-lifecycle/*`)
- Framework/Taxonomy (`/framework/*`, `/taxonomy`)
- Forms (`/forms/*`)
- Onboarding (`/journey/*`, `/onboarding-v2/*`)
- Admin (`/admin/*`)
- PM (`/pm/*`)
- Workflows (`/workflows/*`)
- System Documentation (`/system-documentation/*`)
- Hubstaff (`/hubstaff`)

### Proposed Staffing Routes (Not Yet in Any Planning Doc)

Based on Architecture.md Section 11 navigation structure:

| Route | Component | Purpose |
|---|---|---|
| `/staffing` | `StaffingBoardPage` | Staffing Board — Today view (default) |
| `/staffing/board` | (redirect → `/staffing`) | Alias for clarity |
| `/clinicians` | `ClinicianListPage` | Clinician directory |
| `/clinicians/:clinicianId` | `ClinicianDetailPage` | Clinician profile detail |
| `/clients` | `ClientListPage` | Client directory |
| `/clients/:clientId` | `ClientDetailPage` | Client profile detail |

### Sidebar Navigation Integration

The sidebar is defined in `src/policy/components/CommandCenterLayout.tsx` as a `NAV_ITEMS` array (line 60). A new nav group should be added:

```typescript
{
  id: 'staffing',
  to: '/staffing',
  label: 'Staffing',
  subItems: [
    { to: '/staffing',    label: 'Staffing Board' },
    { to: '/clinicians',  label: 'Clinicians' },
    { to: '/clients',     label: 'Clients' },
  ],
  icon: Users,  // from lucide-react
}
```

**Recommended placement:** After the CES group (id: `ces`) and before Taxonomy (id: `taxonomy`). This positions staffing as an operational peer to compliance execution — both are daily-operations tools.

### Route Registration Pattern

All routes should follow the existing pattern in `App.tsx`:
- Lazy-loaded via `React.lazy()`
- Wrapped in `ProtectedRoute` + `CommandCenterLayout`
- Feature code under `src/policy/staffing/` (new directory)

### GAP: No Route Specification in Any Planning Document

Neither Architecture.md's navigation structure (Section 11) nor Planning_Implementation.md specifies the actual URL paths. The implementation prompt (Architecture.md lines 1413-1418) specifies routes but only for `/clinicians` and `/clients` — **no `/staffing` board route is defined**. This is a critical gap.

---

## 7. Phase 1 View Recommendations

### What to Build

| View | Priority | Justification |
|---|---|---|
| **Staffing Board (Today)** | P0 | Core demo view. Shows open/assigned/completed shifts for the day. Tells the staffing story. |
| **Clinician Directory** | P0 | Required for navigating clinician profiles. Shows discipline, status, credential health. |
| **Clinician Detail** | P0 | Shows credentials, competencies, active assignments. Required for demo drill-down. |
| **Client Directory** | P0 | Required for navigating client profiles. Shows care tier, required disciplines. |
| **Client Detail** | P0 | Shows care needs, shift needs, assigned clinicians. Required for demo drill-down. |
| **Staffing Board (Tomorrow)** | P1 | Simple date filter on the same board component. Low incremental effort. |

### What to Defer

| View | Target Phase | Reason |
|---|---|---|
| **Staffing Board (Week View)** | Phase 2 | Requires more complex layout (multi-day grid or Gantt), adds UX complexity beyond demo needs |
| **Daily Schedule per Clinician** | Phase 2 | Requires clinician-centric schedule aggregation; Phase 1 is shift-centric, not person-centric |
| **Connection Manager** | Phase 2 | Requires connection status CRUD and approval workflow |
| **Matching Review Panel** | Phase 2 | Requires matching engine (ranked candidates, score breakdowns) |
| **Uncovered Visits Alert (as separate view)** | Phase 2 | Phase 1: show as inline banner/badge on Staffing Board. Phase 2: dedicated dashboard. |
| **Bias Monitoring Dashboard** | Phase 2+ | Requires demographic data collection and statistical analysis |
| **Clinician Daily Schedule View** | Phase 2 | Would show a clinician's full day (all assigned shifts, drive times, gaps). Useful but not required for staffing-board-centric demo. |

### View Architecture Recommendation

```
/staffing (StaffingBoardPage)
    ├── Today tab (default) — card list of ShiftNeeds grouped by status
    ├── Tomorrow tab — same layout, next day's data
    └── Summary banner: "X open | Y assigned | Z completed | W uncovered"

/clinicians (ClinicianListPage)
    └── Table with filters: discipline, status, credential health

/clinicians/:id (ClinicianDetailPage)
    ├── Profile section (identity, discipline, employment)
    ├── Credentials section (with red/yellow/green expiry badges)
    ├── Competencies section
    └── Active Assignments section (linked to clients)

/clients (ClientListPage)
    └── Table with filters: care tier, service setting, ACCM owner

/clients/:id (ClientDetailPage)
    ├── Profile section (identity, tier, setting, ACCM)
    ├── Care Needs section (required disciplines + competencies)
    ├── Shift Needs section (list of open/assigned/completed)
    └── Assigned Clinicians section (linked to clinician profiles)
```

---

## 8. Recommended Corrections for the Implementation Prompt

The following corrections should be applied to the implementation prompt before it is given to a coding agent:

### Correction 1: Add Staffing Board Page

The implementation prompt (Architecture.md lines 1401-1405) specifies only 4 pages (ClinicianList, ClinicianDetail, ClientList, ClientDetail). **The Staffing Board page is missing.**

Add:
```
src/policy/staffing/pages/StaffingBoardPage.tsx — Today/Tomorrow tabbed view 
showing ShiftNeeds grouped by status (open, assigned, completed, missed, cancelled). 
Each shift card shows: client name, required discipline, visit window, status badge, 
assigned clinician (if any), assignment source badge. Top banner shows uncovered 
shift count. Read-only — no actions. Seeded from mock ShiftNeed data.
```

### Correction 2: Add Staffing Board Route

Add to the route registration section:
```
/staffing → StaffingBoardPage
```

### Correction 3: Add Staffing Board Sidebar Entry

Change the sidebar nav addition from just "Clinicians" and "Clients" to a grouped entry:
```
Add sidebar nav group "Staffing" with sub-items: 
"Staffing Board" (/staffing), "Clinicians" (/clinicians), "Clients" (/clients).
Use Lucide icon: Users for the group.
```

### Correction 4: Fix `assignmentSource` Values

Replace the `assignmentSource` in ShiftAssignment type from:
```
assignmentSource: enum: bradRecommendation, manualAssignment
```
To:
```
assignmentSource: 'brad_recommendation' | 'manual_assignment' | 'manual_override'
```

### Correction 5: Reduce ShiftNeed Statuses for Phase 1

Add to the implementation constraints:
```
Phase 1 ShiftNeed statuses: only 'open', 'assigned', 'completed', 'missed', 'cancelled'.
Do NOT use 'matchingInProgress', 'matched', or 'confirmed' in mock data or UI.
These statuses should exist in the type definition with a // Phase 2 comment.
```

### Correction 6: Map Mock Data to Demo Scenarios

Replace the generic "6 ShiftNeeds (some filled, some open)" with:
```
6 ShiftNeeds mapped to demo scenarios:
  - 3 with status='assigned', assignmentSource='brad_recommendation' 
    (successful Brad matches with matchScore, matchFactors, citationCard)
  - 2 with status='open' (hard-gate failures: 1 expired credential, 
    1 blocked connection — include blockers[] array explaining why)
  - 1 with status='assigned', assignmentSource='manual_override' 
    (includes overrideReason explaining why human chose differently)
```

### Correction 7: Add Calendar Separation Constraint

Add to the implementation constraints:
```
The staffing module (src/policy/staffing/) must have ZERO imports from:
  - src/policy/stores/calendarSyncStore.ts
  - src/policy/services/calendarApi.ts  
  - src/policy/data/regulatoryEvents.ts
  - src/policy/components/regulatory/*
  - src/policy/ces/*
The staffing board is a shift-need dashboard, NOT a calendar.
It uses its own store (staffingStore.ts) and its own types.
```

### Correction 8: Add `blockers` Field to ShiftNeed

For hard-gate demo scenarios, the ShiftNeed type needs a way to show WHY a shift is uncovered:
```typescript
interface ShiftNeed {
  // ... existing fields ...
  blockers?: Array<{
    type: 'expired_credential' | 'discipline_mismatch' | 'blocked_connection' | 
          'no_availability' | 'capacity_exceeded';
    description: string;
    clinicianId?: string;  // Which clinician was blocked (if specific)
  }>;
}
```

### Correction 9: Directory Structure Clarification

The implementation prompt references `src/policy/clinician/` and `src/policy/client/` but should consolidate under `src/policy/staffing/` for module cohesion:
```
src/policy/staffing/
  ├── types.ts                    (all staffing types: Clinician, Client, ShiftNeed, etc.)
  ├── stores/
  │   ├── clinicianStore.ts
  │   ├── clientStore.ts
  │   └── staffingBoardStore.ts   (aggregates shift needs for board view)
  ├── data/
  │   ├── mockClinicians.ts
  │   ├── mockClients.ts
  │   ├── mockShiftNeeds.ts       (the 6 demo scenarios)
  │   └── mockAssignments.ts
  ├── pages/
  │   ├── StaffingBoardPage.tsx
  │   ├── ClinicianListPage.tsx
  │   ├── ClinicianDetailPage.tsx
  │   ├── ClientListPage.tsx
  │   └── ClientDetailPage.tsx
  └── components/
      ├── ShiftNeedCard.tsx
      ├── ClinicianCard.tsx
      ├── ClientCard.tsx
      ├── DisciplineBadge.tsx
      ├── TierBadge.tsx
      ├── CredentialBadge.tsx
      ├── StatusBadge.tsx
      └── AssignmentSourceBadge.tsx
```

---

## Appendix A: File Reference Index

| Source File | What Was Reviewed | Finding |
|---|---|---|
| `Builder/UserProfiles/Architecture.md` §2.9 | ShiftNeed entity model | Complete for full product; over-specified for Phase 1 |
| `Builder/UserProfiles/Architecture.md` §2.10 | ShiftAssignment entity model | `assignmentSource` only has 2 values; needs 3 |
| `Builder/UserProfiles/Architecture.md` §8 | Human approval workflow | Pipeline steps 1-8 are Phase 2+; Phase 1 is read-only display |
| `Builder/UserProfiles/Architecture.md` §11 | UX/Navigation | Staffing Board defined but under-specified for implementation |
| `Builder/UserProfiles/Architecture.md` §12 | Phased implementation | Phase 1 scope is data model + mock data; board is Phase 5 |
| `Builder/UserProfiles/Planning_Implementation.md` Part 3§4 | Demo scenarios | 3+2+1 scenarios well-specified but not mapped to mock data |
| `Builder/UserProfiles/Planning_Implementation.md` Part 6 | Efficiency recommendations | `assignmentSource` 3-value definition conflicts with Architecture.md |
| `Builder/Documentations/System_Documentation/03_APP_ROUTES_AND_NAVIGATION.md` | Existing routes | 70+ routes; no staffing routes exist; slot available |
| `Builder/Documentations/System_Documentation/07_FEATURE_MODULES.md` | Feature modules | 19 modules documented; Module 3 (Master Calendar) is compliance-only |
| `Builder/Documentations/Survey-Simulation/Brad2.0/Staffing/Requirements` §7 | Assignment optimizer algorithm | Phase 2+ feature; Phase 1 uses pre-computed mock scores |
| `Builder/Documentations/Survey-Simulation/Brad2.0/Staffing/Requirements` §14 | Demo script | 7-minute demo script; staffing board demo fits into minutes 1:30-3:00 |
| `src/policy/stores/calendarSyncStore.ts` | Google Calendar sync | Operates on `RegulatoryEvent` type; zero staffing overlap |
| `src/policy/pages/MasterCalendarPage.tsx` | Master Calendar page | Self-describes as "execution timeline, not a calendar"; compliance-only |
| `src/policy/components/CommandCenterLayout.tsx` | Sidebar navigation | `NAV_ITEMS` array; no staffing entry; slot between CES and Taxonomy |

## Appendix B: Phase 1 Implementation Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Developer reuses Master Calendar components for Staffing Board | High | High — creates coupling between compliance and staffing domains | Add explicit import ban in implementation prompt (Correction 7) |
| `matchingInProgress`/`matched` statuses used in Phase 1 mock data | Medium | Medium — implies matching engine exists | Restrict Phase 1 to 5 statuses (Correction 5) |
| `brad_filled` used as assignment source | Medium | High — implies autonomous assignment without human review (§484 violation) | Remove from type definition entirely (Correction 4) |
| Staffing Board page omitted from implementation | High | Critical — core demo view missing | Add explicitly to implementation prompt (Correction 1) |
| Demo scenarios not reflected in mock data | High | High — demo cannot show the planned narrative | Map 6 ShiftNeeds to 6 scenarios (Correction 6) |
| Staffing routes not registered in App.tsx | Medium | Critical — pages exist but are unreachable | Add route spec to implementation prompt (Correction 2) |

---

*Review complete. 9 corrections identified. Apply all corrections to the implementation prompt before submitting to a coding agent.*
