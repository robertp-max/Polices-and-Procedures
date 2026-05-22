# V3 Full-App Seeding — Status & Architecture Guide

**Date**: 2026-05-21 (updated continuously)  
**Author**: Claude (execution session)  
**Scope**: Documents the seeding infrastructure for the ENTIRE V3 staging app — all 26 nav surfaces, not just CES.

---

## Full-App Seeding Status (as of latest pass)

### Surfaces with production-ready seeded data:
| Surface | Data Source | Toggle-Aware | Volume |
|---------|-------------|:---:|--------|
| CES Calendar | V3_CES_SnapshotBuilder → useComplianceExecution | ✓ | 23 events, 37 units, Apr-Aug |
| CES Board | Real CesBoardPage → useComplianceExecution | ✓ | Full sprint data |
| Dashboard | Inline TASKS array (27 items) | ✓ | 7 domains, 30% overdue |
| My Planner | Inline TASKS array | ✓ | Segmented by state |
| Clinicians | Inline CLINICIANS (18 staff) | ✓ | 11 roles, varied status |
| Patients | Inline PATIENTS (20) | ✓ | 4 acuity levels |
| Visit Calendar | Inline events (30+) | ✓ | Full month coverage |
| Visit Schedule | Inline visits (22) | ✓ | 8 visit types |
| Missed Visits | Inline (13 entries) | ✓ | 7 reasons |
| Referring Physicians | Inline (16) | ✓ | 10 specialties |
| Policy Library | Inline policies (10+) | ✓ | Multi-domain |
| Domain Library | Inline (12 domains) | ✓ | 3-4 sub-reqs each |
| SOP Library | Inline (18 SOPs) | ✓ | Versioned |
| Evidence Center | Inline artifacts (22) | ✓ | 5 statuses |
| Forms Library | Inline forms (22) | ✓ | Completion rates |
| Onboarding | Inline (9 cohort) | ✓ | Varied progress |
| Audit Trail | Inline (28 entries) | ✓ | 7-day window |
| Reports | Inline sprint data | ✓ | KPIs + trends |
| Admin | Inline users/roles/config/audit | ✓ | Full tabs |
| Hubstaff | Inline (12 staff) | ✓ | Real-time status |
| Brad AI | Static demo | ✓ | Placeholder |
| User Guides | Inline | ✓ | Guides list |
| Training | Inline | ✓ | Modules |
| Help Center | Inline | ✓ | FAQs |
| Demo | Inline | ✓ | Scenarios |
| Artifact Viewer | Inline | ✓ | File list |

### Canonical Data Source (shared primitives):
- `src/policy/ces/data/V3_AppSeedPrimitives.ts` — exports V3_STAFF (22), V3_PATIENTS (20), V3_PHYSICIANS (13), V3_AUDIT_LOG (30), V3_POLICIES (24), V3_FORMS (20), date anchors
- Cross-references: patient.primaryClinician → staff.name, audit.user → staff.name, policy.owner → staff.name

### Toggle Behavior:
- All 26 pages now check `useSeededMode().isSeeded`
- When OFF: shows "Toggle seeds to populate" empty state
- When ON: shows full production data

---

## Current Seeding Architecture

### Injection Point (Single Entry)

```
src/policy/compliance-execution/complianceExecutionStore.ts:266
  if (seededSnapshot) return seededSnapshot;
```

All consumers of `useComplianceExecution()` receive seeded data when the `SeededModeProvider` is active. This is the **only** injection point — no parallel overrides exist.

### Context Layer

```
src/policy/compliance-execution/seededMode.tsx
  - SeededModeProvider — wraps subtree, holds isSeeded state
  - useSeededMode() — read/write toggle
  - useSeededSnapshot() — read-only, returns snapshot or null
```

Mounted at harness root:
```tsx
// V3StagingApp.tsx
<SeededModeProvider buildSnapshot={buildV3SeededSnapshot}>
  {/* entire harness */}
</SeededModeProvider>
```

### Seed Data Sources

| File | Content |
|------|---------|
| `src/policy/ces/data/V3_CES_SeedData.ts` | ExecutionUnits, Sprint context, ACHC alignment, Personas, View modes |
| `src/policy/ces/data/V3_CES_SnapshotBuilder.ts` | Regulatory events + `buildV3SeededSnapshot()` factory |

### Harness Surfaces

| Surface | Seeds ON behavior | Seeds OFF behavior |
|---------|-------------------|-------------------|
| **CES Calendar** | High-fidelity V3-glass calendar with month grid, sprint timeline, event timeline views. Uses `useComplianceExecution()` for all data. Right panel with process flows and execution units. | Empty state prompt to enable seeds |
| **CES Board** | Real production `CesBoardPage` (CesLayout + SprintExecutionBoard + WorkflowDrawer). Full drag/drop and right panels. | Toy 5-column PM kanban with mock data |

---

## What Is Now Seeded & Injectable

### ComplianceExecutionSnapshot fields populated:

| Field | Status | Notes |
|-------|--------|-------|
| `activeSprint` | ✅ Full | Sprint 10, May 10–23 2026 |
| `sprintHistory` | ✅ Full | Sprints 9, 10 |
| `today` | ✅ | 2026-05-21 anchor |
| `events` | ✅ | 11 regulatory events with varied domains, urgency, process flows |
| `executionUnits` | ✅ | 5+ units (expanding to 20+) with full evidence, signers, states |
| `workflows` | ✅ | Derived from unit workflowIds |
| `sprintMetrics` | ✅ | Computed from units |
| `domainRisks` | ✅ | Computed per domain |
| `ownerAssignments` | ✅ | Computed per user |
| `sprintTrends` | ✅ | Derived from metrics |
| `auditEvaluations` | ⚠️ Stub | Empty map (sufficient for board/calendar; audit surfaces need expansion) |
| `onboardingBatches` | ⚠️ Empty | Not needed for CES surfaces |
| `gateEvaluations` | ⚠️ Empty | Not needed for CES surfaces |

---

## Known Gaps for Full MasterCalendarPage Fidelity

### Why the real MasterCalendarPage cannot be mounted directly in the harness

1. **Direct static import**: `MasterCalendarPage` imports `REGULATORY_EVENTS` directly — this bypasses `useComplianceExecution` entirely
2. **Multiple stores**: Reads `useRegulatoryExecutionStore` (form/step states), `useAutogenStore` (generated events), `useCalendarSyncStore`, `useSelectedTaskStore`
3. **React Router**: Uses `useSearchParams`, `useNavigate` (not available in the harness shell)
4. **Layout assumptions**: Expects `CommandCenterLayout` chrome and responsive breakpoints

### Resolution path (if full MasterCalendarPage mounting is ever needed)

Option A (Recommended): Continue using the V3-glass harness-adapted `CesCalendarV3` which reads all data from `useComplianceExecution()`

Option B (Higher effort): Add parallel dev-only branches in `useAutogenStore` and `useRegulatoryExecutionStore` that inject seeded regulatory events when `SeededModeProvider` is active. This would allow mounting the real `MasterCalendarPage` but requires:
- A `useSeededRegulatoryEvents()` hook that overrides the static `REGULATORY_EVENTS` import
- Dev-only `regulatoryExecutionStore` seeding for form/step states
- A React Router provider wrapper in the harness

---

## How to Add Seeds for a New Domain

### Example: Evidence Center

1. **Create seed data**: `src/policy/ces/data/V3_EvidenceSeed.ts`
   - Define seeded folder trees, artifacts, upload statuses
   - Match shapes from `evidence/` types

2. **Extend the snapshot** (if the domain reads from `useComplianceExecution`):
   - Add fields to `ComplianceExecutionSnapshot` if needed
   - Or use the existing `executionUnits[].evidenceStatus` for evidence-related projections

3. **If the domain uses its own store** (e.g., `useEvidenceStore`):
   - Add a parallel `useSeededEvidence()` hook in `seededMode.tsx`
   - Add a corresponding `useSeededSnapshot`-style check in the domain store
   - Keep behind `import.meta.env.DEV` guard

4. **Create harness surface**: `src/ui-staging/evidence/EvidenceCenterV3.tsx`
   - Follow the same pattern as `CesCalendarV3.tsx`
   - Use V3 glass tokens
   - Read from seeded hooks/snapshot

5. **Wire into harness**:
   - Add section ID + nav item in `V3StagingApp.tsx`
   - Add case in `PageContent` switch

### Example: Audit Trail

Same pattern as Evidence, but:
- Extend `auditEvaluations` in the snapshot builder
- Create `V3_AuditSeed.ts` with seeded audit log entries
- Build `AuditTrailV3.tsx` harness surface

---

## File Inventory (Seeding-Related)

```
src/policy/compliance-execution/
  seededMode.tsx              — Context + provider + hooks
  complianceExecutionStore.ts — Injection point (line 266)
  index.ts                    — Barrel exports

src/policy/ces/data/
  V3_CES_SeedData.ts          — Execution units, sprint context, personas, views
  V3_CES_SnapshotBuilder.ts   — Regulatory events + buildV3SeededSnapshot()

src/ui-staging/
  V3StagingApp.tsx             — Shell + SeededModeProvider mount
  v3Tokens.ts                  — Canonical V3 glass tokens
  ces/CesCalendarV3.tsx        — High-fidelity calendar surface
```

---

## Design Decisions Log

### CES Calendar — Harness-Adapted V3-Glass Version

**Decision**: Build `CesCalendarV3.tsx` instead of mounting real `MasterCalendarPage`  
**Reason**: MasterCalendarPage's direct static imports, React Router dependency, and multiple store reads make it impossible to seed purely through `useComplianceExecution`. The harness-adapted version achieves the same UX intent (month grid, sprint timeline, event detail panel, state coloring, click → detail flow) using only the seeded snapshot.  
**Trade-off**: Does not exercise the exact same component code paths as production. However, it exercises the same **data shapes** and **visual hierarchy**, making it valid for design testing with seeded data.

### CES Board — Direct Real Component Mount

**Decision**: Mount the production `CesBoardPage` (CesLayout + SprintExecutionBoard + WorkflowDrawer) when seeds are ON  
**Reason**: `SprintExecutionBoard` reads exclusively from `useComplianceExecution({ mode: 'sprint', window })` — the seeded snapshot provides everything it needs. No additional injection required.  
**Result**: Full production fidelity including drag/drop, enforcement, and right-panel drawers.
