# 06 — UX & Information Architecture Review: Phase 1 Staffing MVP

**Reviewer:** UX / Information Architecture Reviewer
**Date:** 2026-05-13
**Scope:** Phase 1 Staffing MVP — 4 read-only pages (ClinicianListPage, ClinicianDetailPage, ClientListPage, ClientDetailPage)
**Sources Reviewed:**
- `Builder/UserProfiles/Architecture.md` (sections 11–12, implementation prompt at lines 1361–1430)
- `Builder/Documentations/System_Documentation/01_CURRENT_STATE_OVERVIEW.md`
- `Builder/Documentations/System_Documentation/03_APP_ROUTES_AND_NAVIGATION.md`
- `Builder/Documentations/System_Documentation/04_COMPONENT_INVENTORY.md`
- `Builder/Documentations/System_Documentation/13_IMPLEMENTATION_READINESS_FOR_CLINICIAN_CLIENT_PROFILE.md`

---

## Executive Summary

The Phase 1 implementation prompt is **structurally sound** and correctly scoped for an MVP staffing foundation. It follows the established `ProtectedRoute + CommandCenterLayout` wrapping pattern, uses the correct naming conventions, and defines a sensible 4-page scope. However, this review identifies **12 gaps** across navigation integration, screen specification, component reuse, tab structure, responsive design, and empty states that should be corrected before the prompt is handed to an implementer.

**Critical gaps:**
1. The detail pages lack a defined tab structure — Architecture.md specifies 7 clinician tabs and 8 client tabs; the prompt gives flat section lists with no tab guidance for Phase 1.
2. No responsive/mobile specifications exist; the prompt is desktop-only by implication.
3. No empty state definitions for sparse mock data scenarios (e.g., a clinician with zero assignments).
4. The shared UI primitive `DataGrid` exists but isn't referenced — the prompt says "table/card list" without specifying which pattern.
5. Sidebar hierarchy placement is underspecified (icon choice only, no position or grouping).

**No scope expansion is recommended.** All corrections below stay within the approved 4-page read-only MVP.

---

## 1. Navigation Integration Plan

### 1.1 Full Nav Tree (Architecture.md Section 11) vs Phase 1 Scope

Architecture.md defines a complete navigation tree with 7 top-level sections:

| Full Nav Tree Node | Phase 1 Status | Notes |
|---|---|---|
| **Dashboard** (daily operations summary) | DEFERRED | Existing page; no staffing integration in Phase 1 |
| **Clinician Directory** | **INCLUDED** | `ClinicianListPage` at `/clinicians` |
| └─ Clinician Profile Detail | **INCLUDED** | `ClinicianDetailPage` at `/clinicians/:clinicianId` |
| **Client Directory** | **INCLUDED** | `ClientListPage` at `/clients` |
| └─ Client Profile Detail | **INCLUDED** | `ClientDetailPage` at `/clients/:clientId` |
| **Staffing Board** (daily shift needs + assignments) | DEFERRED | Phase 2+ (requires matching engine) |
| **Connection Manager** | DEFERRED | Phase 3 (requires ClinicianClientConnection entity) |
| **Reports** (Compliance, Bias, Audit) | DEFERRED | Phase 3+ (requires metrics foundation) |

**Verdict:** The Phase 1 scope correctly includes only the 4 foundational directory/detail pages. All operational views (Staffing Board, Connection Manager, Reports) are correctly deferred.

### 1.2 Route Registration Assessment

The implementation prompt specifies:

| Route | Component | Pattern |
|---|---|---|
| `/clinicians` | `ClinicianListPage` | ProtectedRoute + CommandCenterLayout |
| `/clinicians/:clinicianId` | `ClinicianDetailPage` | ProtectedRoute + CommandCenterLayout |
| `/clients` | `ClientListPage` | ProtectedRoute + CommandCenterLayout |
| `/clients/:clientId` | `ClientDetailPage` | ProtectedRoute + CommandCenterLayout |

**Verdict: CORRECT.** All four routes are wrapped in `ProtectedRoute + CommandCenterLayout`, matching the pattern used by every other authenticated route in the app (doc 03). Lazy-loading with `React.lazy()` is specified, consistent with all existing page components.

### 1.3 Route Naming Assessment

| Aspect | Prompt Spec | Existing Convention | Verdict |
|---|---|---|---|
| Pluralization | `/clinicians`, `/clients` | `/library`, `/forms`, `/workflows` (plural) | **CORRECT** |
| Kebab-case | `/clinicians/:clinicianId` | `/library/:policyId`, `/forms/:formId` | **CORRECT** |
| Param naming | `:clinicianId`, `:clientId` | `:policyId`, `:formId`, `:eventId` | **CORRECT** — consistent camelCase param |

**No issues found with route naming.**

---

## 2. Sidebar Integration Assessment

### 2.1 What the Prompt Specifies

> "ADD SIDEBAR NAV entries in CommandCenterLayout for 'Clinicians' and 'Clients' (use Lucide icons: Users for clinicians, Heart for clients)."

### 2.2 What's Known About the Sidebar

From doc 03:
- Sidebar nav is controlled by `CommandCenterLayout` (`src/policy/components/CommandCenterLayout.tsx`)
- Nav items are likely driven by `navStore.ts` (`src/policy/stores/navStore.ts`)
- `UniversalNavControls.tsx` provides navigation controls
- `navExclusions.ts` exists to exclude certain routes

From doc 04, the existing sidebar groups (inferred from route structure):
1. Dashboard
2. Calendar & Events
3. Policy Library / Lifecycle
4. CES / Compliance
5. Journey / LMS
6. Admin

### 2.3 Gaps Identified

| Gap | Detail | Recommendation |
|---|---|---|
| **GAP-SB-1: No group/section specified** | The prompt says "add entries" but doesn't define where in the sidebar hierarchy they should appear. Should "Clinicians" and "Clients" be a new sidebar group (e.g., "Staffing") or standalone items? | **Add a "Staffing" sidebar group** containing Clinicians and Clients sub-items. This provides a logical home for future Staffing Board, Connection Manager, and Reports pages without restructuring the nav. |
| **GAP-SB-2: No icon consistency check** | `Users` (Lucide) for Clinicians is fine — it's not used elsewhere in the nav. `Heart` for Clients is potentially misleading (Heart often implies favorites/likes). | **Recommend `UserRound` or `Contact` for Clients** instead of `Heart`. Alternative: `HeartHandshake` (care-giving connotation). Check existing icon usage in `CommandCenterLayout.tsx` to avoid collisions. |
| **GAP-SB-3: No position specification** | Where in the sidebar order should the Staffing group appear? Before or after the Policy group? Before or after CES? | **Recommend placing "Staffing" between Dashboard and Calendar** — this positions it as a high-frequency operational section, consistent with the Architecture.md nav tree which lists Clinician/Client Directories immediately after Dashboard. |
| **GAP-SB-4: navStore integration not mentioned** | Doc 03 notes the sidebar is "likely driven by `navStore.ts`." The prompt should specify whether nav items are added directly in `CommandCenterLayout` JSX or registered via the nav store. | **The implementer should inspect `CommandCenterLayout.tsx` and `navStore.ts`** to determine the correct integration pattern. The prompt should note: "Follow the existing nav item registration pattern — inspect how current sidebar items are defined." |

---

## 3. Screen-by-Screen Specification Review

### 3.1 ClinicianListPage

**What the prompt specifies:**
> "Table/card list with discipline and status filters. Shows: name, discipline, status, competency count, active assignments count."

| Aspect | Assessment | Gap |
|---|---|---|
| List display mode | "Table/card list" — ambiguous | **GAP-CL-1:** Does this mean a DataGrid (table) with card fallback, a card grid, or a toggle between both? The existing `DataGrid` component in `src/policy/components/ui/` should be specified as the primary list format, with card view as optional. |
| Displayed columns | name, discipline, status, competency count, assignments count | **Adequate for Phase 1.** Consider adding `employmentType` (W2/contractor) as a visible column — it's a key operational differentiator. |
| Filters | discipline, status | **GAP-CL-2:** Missing `employmentType` filter. Architecture.md section 11 specifies filtering by "discipline, status, zone, credential status, availability." For Phase 1, `discipline` + `status` + `employmentType` is the minimum. Zone, credential status, and availability are correctly deferred. |
| Search | Not specified | **GAP-CL-3:** No search capability defined. The existing `SearchField` component in `ui/` should be used for name search. Architecture.md says "Searchable/filterable list." |
| Sorting | Not specified | **GAP-CL-4:** No sort specification. At minimum, sort by name (alpha) and status should be supported. |
| Pagination | Not specified | **GAP-CL-5:** With 10 mock clinicians this isn't critical, but the prompt should specify whether all items render or if pagination/virtual scrolling is expected. For 10 items, flat render is fine. |
| Click behavior | Not specified | **GAP-CL-6:** The prompt implies clicking a clinician navigates to `/clinicians/:clinicianId` but doesn't say so explicitly. State it. |
| Page header | Not specified | **Recommendation:** Use `PageHeader` component from `ui/` with title "Clinicians" and a count badge. |

### 3.2 ClinicianDetailPage

**What the prompt specifies:**
> "Full profile: personal info section, credentials section (with expiry status badges), competencies section, active assignments section (linked to clients)."

| Aspect | Assessment | Gap |
|---|---|---|
| Layout structure | "sections" — flat layout implied | **GAP-CD-1:** Architecture.md defines 7 tabs for the Clinician Profile Detail (Overview, Credentials & Compliance, Skills, Availability & Accommodations, Connections, Assignment History, Audit Trail). The prompt specifies flat sections instead. See Section 5 below for tab recommendation. |
| Back navigation | Not specified | **GAP-CD-2:** No breadcrumb or back button specified. Recommend: `Clinicians > [Clinician Name]` breadcrumb, or at minimum a back arrow. |
| Personal info display | Implied | **Adequate.** Fields to display: name, preferredName, primaryDiscipline, secondaryDisciplines, employmentType, status, hireDate, email, phone, orgRole, serviceAreas, maxHoursPerWeek. |
| Credentials section | "with expiry status badges" | **Adequate.** CredentialBadge (green/yellow/red) is defined. Ensure the threshold for "yellow" (expiring soon) is specified — recommend 60 days. |
| Competencies section | Specified | **Adequate.** Display name + level as chips/badges. |
| Assignments section | "linked to clients" | **GAP-CD-3:** Should clicking a linked client navigate to `/clients/:clientId`? The prompt should state this cross-linking explicitly. |
| Supervisory visit display | Not specified in prompt | **GAP-CD-4:** Architecture.md Section 10 says Phase 1 should display `lastSupervisoryVisit` with color coding (>90 days = yellow, >14 days for HH = red). The prompt omits this. Add as informational display on active assignments. |

### 3.3 ClientListPage

**What the prompt specifies:**
> "Table/card list with tier, setting, and ACCM filters. Shows: name, tier badge, setting, ACCM name, active assignments count."

| Aspect | Assessment | Gap |
|---|---|---|
| List display mode | Same ambiguity as ClinicianListPage | **GAP-CLL-1:** Same as GAP-CL-1. Specify `DataGrid` as primary pattern. |
| Displayed columns | name, tier badge, setting, ACCM name, assignments count | **Adequate.** Consider adding `status` as a visible column. |
| Filters | tier, setting, ACCM | **Good.** Three filters is appropriate for Phase 1. Store has `filterByTier`, `filterByAccm`, `filterBySetting` actions. |
| Search | Not specified | **GAP-CLL-2:** Same as GAP-CL-3. Add `SearchField` for name search. |
| ACCM name display | "ACCM name" | **GAP-CLL-3:** ACCM is stored as `accmOwnerId` (a string ID). How is this resolved to a display name? The mock data must include ACCM name resolution — either embed the name in the client mock or create an ACCM lookup in the clinician store (since ACCMs are clinicians with `orgRole: 'accm'`). The prompt should specify this. |
| Click behavior | Not specified | **GAP-CLL-4:** Same as GAP-CL-6 — state that clicking navigates to `/clients/:clientId`. |

### 3.4 ClientDetailPage

**What the prompt specifies:**
> "Full profile: info section, care needs section (required disciplines + competencies), shift needs section, active assignments section (linked to clinicians)."

| Aspect | Assessment | Gap |
|---|---|---|
| Layout structure | Flat sections | **GAP-CDT-1:** Architecture.md defines 8 tabs (Overview, Clinical Requirements, Episode & Authorization, Schedule Needs, Connections, Preferences & Restrictions, Assignment History, Audit Trail). Same issue as GAP-CD-1. See Section 5. |
| Back navigation | Not specified | **GAP-CDT-2:** Same as GAP-CD-2. |
| Info section | Implied | **Adequate.** Display: name, preferredName, serviceSetting, serviceEntity, careTier, status, serviceZip, serviceCity, facilityId/facilityName, admissionDate, dischargeDate, primaryDiagnosisCategory. |
| Care needs section | "required disciplines + competencies" | **Adequate.** Display `requiredDisciplines[]` as DisciplineBadges and `requiredCompetencies[]` as text chips. |
| Shift needs section | Specified | **Adequate.** Uses `ShiftNeedCard` component. Shows status, fill state, linked assignment. |
| Assignments section | "linked to clinicians" | **GAP-CDT-3:** Same as GAP-CD-3 — cross-link to `/clinicians/:clinicianId` should be stated. |
| ACCM/CCM display | Not explicitly mentioned in detail page spec | **GAP-CDT-4:** The ACCM owner and CCM (if L3-L4) should be prominently displayed with names resolved, not just IDs. |

---

## 4. Component Reuse Inventory

### 4.1 Existing UI Primitives Available (from `src/policy/components/ui/`)

| Primitive | Purpose | Should Be Used In |
|---|---|---|
| `PageHeader` | Page title + actions header | All 4 pages — page title, filter controls, count display |
| `DataGrid` | Data grid | ClinicianListPage, ClientListPage — primary list view |
| `SearchField` | Search input | Both list pages — name search |
| `Tabs` | Tab group | Both detail pages — section organization |
| `SurfaceCard` | Card surface | Card view alternative, section containers in detail pages |
| `SectionHeader` | Section heading | Detail page section titles |
| `EmptyState` | Empty state display | All pages — when no data matches filters |
| `CiStatusBadge` | Status badge | Clinician/client status display |
| `GlassPanel` | Glass-morphism card | Detail page header/hero section |
| `ActionButton` | Primary action button | N/A for Phase 1 (read-only) — but useful for "Back" or navigation actions |
| `RightDrawer` | Slide-in right panel | Potential future use for quick-view on list pages |

### 4.2 Existing Non-UI Components Relevant for Patterns

| Component | Location | Pattern to Follow |
|---|---|---|
| `StatusBadge` | `src/policy/components/StatusBadge.tsx` | General status badge — the new `CredentialBadge`, `DisciplineBadge`, and `TierBadge` should follow the same API pattern |
| `StatusChip` | `src/policy/journey/components/StatusChip.tsx` | Chip-style status display — relevant for competency chips |
| `RiskBadge` | `src/policy/pages/iAdministrator/components/RiskBadge.tsx` | Color-coded risk indicator — same pattern as CredentialBadge (green/yellow/red) |
| `PmFilterBar` | `src/policy/components/pm/PmFilterBar.tsx` | Filter controls pattern — ClinicianListPage and ClientListPage filters should follow this pattern |
| `PmViews` | `src/policy/components/pm/PmViews.tsx` | View switcher (table/card toggle) — relevant if list pages support both views |
| `EntityLink` | `src/policy/components/pm/EntityLink.tsx` | Entity navigation link — should be used for cross-links (clinician → client, client → clinician) |

### 4.3 New Components Defined in the Prompt

| New Component | Purpose | Reuse Opportunity |
|---|---|---|
| `ClinicianCard.tsx` | Card view for clinician in list | Should extend `SurfaceCard` from ui/ |
| `CredentialBadge.tsx` | Green/yellow/red expiry badge | Should follow `CiStatusBadge` API pattern |
| `DisciplineBadge.tsx` | Discipline label badge | New — no direct equivalent exists |
| `ClientCard.tsx` | Card view for client in list | Should extend `SurfaceCard` from ui/ |
| `TierBadge.tsx` | L1-L4 colored badge | Should follow `CiStatusBadge` API pattern |
| `ShiftNeedCard.tsx` | Shift need display card | Should extend `SurfaceCard` from ui/ |

### 4.4 Prompt Gap: Component Reuse Not Specific Enough

**GAP-COMP-1:** The prompt says "Use existing UI primitives from `src/policy/components/ui/` where possible" but doesn't specify which ones. The implementer may create redundant components. The prompt should explicitly list:
- Use `PageHeader` for all page titles
- Use `DataGrid` for list views (if table mode)
- Use `SearchField` for search inputs
- Use `Tabs` for detail page tab navigation
- Use `SurfaceCard` as the base for all card components
- Use `SectionHeader` for detail page section titles
- Use `EmptyState` for empty/no-data states
- Follow `CiStatusBadge` API pattern for all new badge components
- Use `EntityLink` pattern for cross-entity navigation links

---

## 5. Tab Structure Recommendation for Phase 1

### 5.1 Architecture.md Defines (Full Vision)

**Clinician Profile — 7 tabs:**
1. Overview
2. Credentials & Compliance
3. Skills (Competencies)
4. Availability & Accommodations
5. Connections (clients served)
6. Assignment History
7. Audit Trail

**Client Profile — 8 tabs:**
1. Overview
2. Clinical Requirements
3. Episode & Authorization
4. Schedule Needs
5. Connections (clinicians assigned)
6. Preferences & Restrictions
7. Assignment History
8. Audit Trail

### 5.2 Phase 1 Implementation Prompt (Current)

The prompt defines **flat sections, no tabs:**
- Clinician: personal info, credentials, competencies, active assignments
- Client: info, care needs, shift needs, active assignments

### 5.3 Phase 1 Tab Recommendation

For Phase 1 read-only, build with the `Tabs` component from `ui/` but only populate the tabs that have data. This avoids a flat page rewrite in Phase 2.

**ClinicianDetailPage — 3 tabs for Phase 1:**

| Tab | Content | Rationale |
|---|---|---|
| **Overview** | Personal info + discipline + employment + status + service areas | Combines identity fields into a summary view |
| **Credentials & Compliance** | Credentials list with CredentialBadges + competencies list | Core compliance data — the primary reason this profile exists |
| **Assignments** | Active CareAssignments with linked client names | Operational context — "who is this person caring for?" |

**Deferred Clinician tabs (render as disabled/placeholder):**
- Availability & Accommodations → Phase 2 (no data model yet)
- Assignment History → Phase 2 (requires historical data)
- Audit Trail → Phase 2 (requires audit log integration)

**ClientDetailPage — 3 tabs for Phase 1:**

| Tab | Content | Rationale |
|---|---|---|
| **Overview** | Client info + care tier + service setting + ACCM/CCM + dates | Summary view |
| **Care Needs** | Required disciplines + required competencies + shift needs (ShiftNeedCards) | The demand profile — what this client needs |
| **Assignments** | Active CareAssignments with linked clinician names | Who is currently assigned |

**Deferred Client tabs (render as disabled/placeholder):**
- Episode & Authorization → Phase 2 (no episode model)
- Preferences & Restrictions → Phase 2 (no data model)
- Assignment History → Phase 2 (requires historical data)
- Audit Trail → Phase 2 (requires audit log integration)

### 5.4 Why Tabs Matter Even for Phase 1

1. **Establishes the component pattern** using the existing `Tabs` primitive — no rewrite later.
2. **Prevents the "wall of data" problem** — a flat detail page with 15+ fields, credentials, competencies, and assignments is too dense for a single scroll.
3. **Disabled tabs signal the roadmap** — demo reviewers can see what's coming without confusing it for what's built.
4. **Architecture.md alignment** — the full nav tree assumes tabs; building flat now creates a Phase 2 migration tax.

---

## 6. Badge/Status Color Consistency Check

### 6.1 CredentialBadge (Clinician)

**Prompt spec:** green/yellow/red based on expiry.

| Color | Meaning | Consistency Check |
|---|---|---|
| Green | Valid, not expiring soon | Consistent — green = good/healthy is used in `CiStatusBadge`, `HealthStrip` |
| Yellow | Expiring soon (threshold undefined) | Consistent — yellow/amber = warning is standard. **GAP-BADGE-1: Define threshold** — recommend 60 days. |
| Red | Expired | Consistent — red = critical/expired is used in `RiskBadge`, `EmergencyBanner` |

**Verdict: CONSISTENT** with existing color semantics. Add threshold definition.

### 6.2 TierBadge (Client)

**Prompt spec:** L1=green, L2=blue, L3=orange, L4=red.

| Tier | Color | Meaning | Consistency Check |
|---|---|---|---|
| L1 (Essential) | Green | Low acuity | Consistent — green = low risk/standard |
| L2 (Enhanced) | Blue | Moderate acuity | **Acceptable** — blue is used as informational in the app (links, CES states). Not conflicting. |
| L3 (Complex) | Orange | High acuity | Consistent — orange = elevated concern |
| L4 (Critical) | Red | Critical acuity | Consistent — red = critical/urgent |

**Verdict: CONSISTENT.** The green→blue→orange→red progression maps cleanly to the severity scale used elsewhere in the app. No conflicts detected.

### 6.3 DisciplineBadge (Clinician)

**Not color-specified in the prompt.** This component is defined but has no color guidance.

**GAP-BADGE-2:** Define DisciplineBadge color scheme. Recommend:
- Licensed professionals (RN, LVN, PT, OT, ST, MSW): blue/indigo tones
- Certified aides (HHA, CNA): teal/green tones
- Non-licensed (Caregiver): gray/neutral tone

This provides a visual hierarchy distinguishing licensed vs non-licensed disciplines without introducing new semantic colors.

### 6.4 Clinician/Client Status Display

The prompt doesn't specify how `status` (active/inactive/pending/suspended/terminated) is displayed visually.

**GAP-BADGE-3:** Define status color mapping:
- `active` → green
- `pending` → yellow/amber
- `inactive` / `on_hold` → gray
- `suspended` → orange
- `terminated` / `discharged` → red

Use the existing `CiStatusBadge` component pattern for this.

---

## 7. Responsive Design & Empty State Requirements

### 7.1 Responsive Design Assessment

**GAP-RESP-1: The implementation prompt contains zero responsive design specifications.**

The existing codebase uses Tailwind CSS (3.4.17), which provides responsive utilities (`sm:`, `md:`, `lg:`, `xl:`). The `MobileIncidentExecutionPage` exists as a mobile-optimized page, proving the app does consider mobile scenarios.

**Recommended additions to the implementation prompt:**

| Breakpoint | List Pages | Detail Pages |
|---|---|---|
| Desktop (≥1024px) | DataGrid table view with full columns | Tabs + full-width sections |
| Tablet (768–1023px) | Table with fewer columns (hide competency count, assignments count) | Tabs + stacked sections |
| Mobile (<768px) | Card view (ClinicianCard/ClientCard) replaces table | Tabs + single-column stacked layout |

**Minimum responsive requirements for Phase 1:**
1. List pages should use Tailwind responsive classes to collapse table columns on smaller screens, or switch to card view below `md:` breakpoint.
2. Detail page tab content should stack vertically on mobile.
3. Filter bar should wrap or collapse into a dropdown on mobile.
4. Sidebar should already handle collapse (via `CommandCenterLayout`) — no new work needed.

### 7.2 Empty State Assessment

**GAP-EMPTY-1: The implementation prompt contains zero empty state definitions.**

With 10 mock clinicians, 6 clients, 8 assignments, and 6 shift needs, empty states will occur when:

| Scenario | Where It Occurs | Recommended Empty State |
|---|---|---|
| Filter returns zero results | ClinicianListPage, ClientListPage | "No clinicians match your filters" / "No clients match your filters" with a clear-filter action |
| Clinician has no assignments | ClinicianDetailPage → Assignments tab | "No active assignments" with brief explanation |
| Clinician has no credentials | ClinicianDetailPage → Credentials tab | "No credentials on file" (this is also a compliance concern — consider a warning variant) |
| Clinician has no competencies | ClinicianDetailPage → Credentials tab | "No competencies recorded" |
| Client has no shift needs | ClientDetailPage → Care Needs tab | "No shift needs defined" |
| Client has no assignments | ClientDetailPage → Assignments tab | "No clinicians currently assigned" |
| Search returns no matches | Both list pages | "No results for '[search term]'" |

**All empty states should use the existing `EmptyState` component from `src/policy/components/ui/EmptyState.tsx`.** The prompt should specify this explicitly.

---

## 8. Additional Specification Gaps

### 8.1 Cross-Entity Navigation

**GAP-NAV-1:** The prompt doesn't define navigation between entities:
- Clinician detail → click a client in assignments → navigate to `/clients/:clientId`
- Client detail → click a clinician in assignments → navigate to `/clinicians/:clinicianId`
- ACCM name on client → link to the ACCM's clinician profile?

**Recommendation:** Use the existing `EntityLink` pattern from `src/policy/components/pm/EntityLink.tsx` for all cross-entity links.

### 8.2 Page Loading States

**GAP-LOAD-1:** No loading state specification. Since Phase 1 uses Zustand stores seeded from mock data (synchronous), loading states may seem unnecessary. However, the `React.lazy()` route-level code splitting means a Suspense fallback is needed. The prompt should specify:
- Route-level: Use the existing `AppLoader` or Suspense fallback pattern
- Component-level: Not needed for Phase 1 (mock data is synchronous)

### 8.3 URL Parameter Handling

**GAP-URL-1:** The prompt doesn't specify behavior when navigating to `/clinicians/:clinicianId` with an invalid ID. Recommend: redirect to `/clinicians` list page or show an error state with a back link.

### 8.4 Browser Tab Title

**GAP-TITLE-1:** No page title specification. Recommend setting `document.title` per page:
- `/clinicians` → "Clinicians | Care Indeed"
- `/clinicians/:id` → "[Name] | Clinicians | Care Indeed"
- `/clients` → "Clients | Care Indeed"
- `/clients/:id` → "[Name] | Clients | Care Indeed"

---

## 9. Recommended Corrections for the Implementation Prompt

### Priority 1 — Must Fix Before Implementation

| # | Gap ID | Correction |
|---|---|---|
| 1 | GAP-CD-1, GAP-CDT-1 | **Add tab structure to detail pages.** Use the `Tabs` component from `ui/`. ClinicianDetailPage: 3 tabs (Overview, Credentials & Compliance, Assignments). ClientDetailPage: 3 tabs (Overview, Care Needs, Assignments). Render deferred tabs as disabled with "Coming in Phase 2" tooltip. |
| 2 | GAP-CL-1, GAP-CLL-1 | **Specify DataGrid as primary list pattern.** "Use the existing `DataGrid` component from `src/policy/components/ui/` for the list view." |
| 3 | GAP-CL-3, GAP-CLL-2 | **Add search capability.** "Include `SearchField` from `src/policy/components/ui/` for name search on both list pages." |
| 4 | GAP-EMPTY-1 | **Define empty states.** "Use the `EmptyState` component from `src/policy/components/ui/` for all zero-result scenarios: empty filter results, no assignments, no credentials, no shift needs." |
| 5 | GAP-COMP-1 | **Enumerate specific primitives to reuse.** Replace "Use existing UI primitives from `src/policy/components/ui/` where possible" with an explicit list: PageHeader, DataGrid, SearchField, Tabs, SurfaceCard, SectionHeader, EmptyState, CiStatusBadge. |
| 6 | GAP-CLL-3 | **Specify ACCM name resolution.** "ACCM is stored as `accmOwnerId` (a clinician ID). The mock data must include clinicians with `orgRole: 'accm'` so that the client list can resolve ACCM IDs to display names via the clinician store." |

### Priority 2 — Strongly Recommended

| # | Gap ID | Correction |
|---|---|---|
| 7 | GAP-SB-1, GAP-SB-3 | **Define sidebar group and position.** "Create a 'Staffing' sidebar group positioned after Dashboard and before Calendar, containing 'Clinicians' and 'Clients' as sub-items." |
| 8 | GAP-SB-2 | **Reconsider Client icon.** Replace `Heart` with `UserRound`, `Contact`, or `HeartHandshake` for Clients. |
| 9 | GAP-BADGE-1 | **Define CredentialBadge thresholds.** "Green: expires in >60 days or no expiry. Yellow: expires within 60 days. Red: expired." |
| 10 | GAP-BADGE-3 | **Define status color mapping.** "Use `CiStatusBadge` pattern: active=green, pending=yellow, inactive=gray, suspended=orange, terminated=red." |
| 11 | GAP-CD-2, GAP-CDT-2 | **Specify back navigation.** "Include a breadcrumb or back link at the top of detail pages: 'Clinicians > [Name]' or '← Back to Clinicians'." |
| 12 | GAP-CD-3, GAP-CDT-3, GAP-NAV-1 | **Specify cross-entity linking.** "All entity references in assignments sections should be clickable links navigating to the referenced entity's detail page." |

### Priority 3 — Nice to Have for Phase 1

| # | Gap ID | Correction |
|---|---|---|
| 13 | GAP-RESP-1 | **Add minimal responsive guidance.** "Use Tailwind responsive classes. On screens below `md:` breakpoint, list pages should render cards instead of table rows. Detail page sections should stack in a single column." |
| 14 | GAP-CL-4 | **Add sort specification.** "List pages should support sort by name (alpha, default) and status." |
| 15 | GAP-CL-6, GAP-CLL-4 | **Specify click behavior.** "Clicking a row/card navigates to the detail page for that entity." |
| 16 | GAP-URL-1 | **Handle invalid IDs.** "If `:clinicianId` or `:clientId` is not found in the store, display the EmptyState component with a 'Return to list' link." |
| 17 | GAP-BADGE-2 | **Define DisciplineBadge colors.** "Licensed (RN, LVN, PT, OT, ST, MSW): blue. Certified (HHA, CNA): teal. Non-licensed (Caregiver): gray." |
| 18 | GAP-CD-4 | **Add supervisory visit display.** "On CareAssignment cards, show `lastSupervisoryVisit` date with yellow (>90 days ago) or red (>14 days for HH assignments) indicators." |

---

## 10. Summary Checklist

| Review Area | Status | Gaps Found |
|---|---|---|
| Navigation structure & route mapping | PASS | 0 |
| Route naming conventions | PASS | 0 |
| ProtectedRoute + CommandCenterLayout wrapping | PASS | 0 |
| Lazy loading | PASS | 0 |
| Sidebar integration | NEEDS WORK | 4 gaps (group, icon, position, navStore) |
| ClinicianListPage specification | NEEDS WORK | 6 gaps (display mode, search, sort, pagination, click, filters) |
| ClinicianDetailPage specification | NEEDS WORK | 4 gaps (tabs, back nav, cross-links, supervisory) |
| ClientListPage specification | NEEDS WORK | 4 gaps (display mode, search, ACCM resolution, click) |
| ClientDetailPage specification | NEEDS WORK | 4 gaps (tabs, back nav, cross-links, ACCM display) |
| Component reuse | NEEDS WORK | 1 gap (not specific enough) |
| Tab structure | NEEDS WORK | Undefined — flat sections instead of tabs |
| Badge/status colors | PASS with gaps | 3 gaps (thresholds, discipline colors, status colors) |
| Responsive design | FAIL | No specification at all |
| Empty states | FAIL | No specification at all |
| Cross-entity navigation | NEEDS WORK | Not specified |
| Loading/error states | MINOR | Minimal — Suspense handles most |

**Overall assessment:** The implementation prompt is a solid foundation with correct architectural decisions (routing, auth wrapping, naming, scope constraints). The 18 corrections above — none of which expand scope beyond the approved 4-page MVP — will produce a significantly more complete and implementable specification.

---

*End of UX & Information Architecture Review*
