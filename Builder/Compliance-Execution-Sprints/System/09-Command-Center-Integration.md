# 09 — Command Center Integration Surfaces

> Status: ACTIVE · Owner: Platform Architecture
> Companion to: [06-Command-Center-CES-Merge-Architecture.md](06-Command-Center-CES-Merge-Architecture.md), [07-Shared-Data-Contracts.md](07-Shared-Data-Contracts.md), [08-Calendar-Merge-and-Toggle.md](08-Calendar-Merge-and-Toggle.md)

This document inventories every Command Center surface that has been wired to the merged compliance-execution layer.

## 1. Routes Affected

| Route | Status |
| --- | --- |
| `/dashboard` | Sprint Snapshot strip added at top |
| `/calendar` | Default Command Center view (unchanged) |
| `/calendar?view=sprint` | New: CES sprint view in same shell |
| `/ces/calendar` | Removed; redirects to `/calendar?view=sprint` |
| `/audit` | CES Sprint Audit Strip added between header and Region 2 |
| `/compliance/master-controls` | StatCard grid extended with "Linked Exec Units" + "Blocked by Controls" |
| `/workflows`, `/ces/dashboard`, `/ces/board`, `/ces/workloads`, `/ces/reports` | Unchanged this phase; will continue to read from existing CES stores. They are visually consistent because the shared layer feeds the same primitives. |

## 2. Dashboard — `/dashboard`

`src/policy/pages/DashboardPage.tsx`

- New imports: `useComplianceExecution`, `selectAuditReadinessRollup`, `selectCriticalUnits`, `selectAwaitingSignatureUnits`.
- New component `SprintSnapshotStrip` mounted between `<CommandHeader />` and `<AgencyReadinessBanner />`.
- Click → `navigate('/calendar?view=sprint')`.
- 7 SnapStats: Completion %, Audit Ready, Active Blockers, Sig SLAs Missed, Awaiting Sig, Critical Units, Audit Open.

## 3. Audit Mode — `/audit`

`src/policy/pages/AuditModePage.tsx`

- New imports: `useComplianceExecution`, `selectAuditReadinessRollup`, `selectCriticalUnits`.
- New component `CesSprintAuditStrip` mounted between Region 1 (header) and Region 2 (health tiles).
- Displays: Sprint label, Not Ready / Partial / Ready / Certified counts (from CES rollup), Critical Units count, "Open Sprint View →" jump button.
- The original `evaluateAudit`-driven Region 2 health tiles remain authoritative for survey readiness; the CES strip is a parallel, sprint-scoped readiness surface.

## 4. Master Controls — `/compliance/master-controls`

`src/policy/components/MasterControlInventory.tsx`

- New imports: `useComplianceExecution`, `selectBlockedUnits`, `selectAllExecutionUnits`.
- Derivation in body:
  ```ts
  const cesSnap     = useComplianceExecution();
  const cesLinkage  = useMemo(() => {
    const allUnits     = selectAllExecutionUnits(cesSnap);
    const blockedUnits = selectBlockedUnits(cesSnap);
    const openUnits    = allUnits.filter(u => u.complianceState !== 'completed');
    return { linkedActive: openUnits.length, blockedByControls: blockedUnits.length };
  }, [cesSnap]);
  ```
- StatCard summary grid expanded from `xl:grid-cols-7` → `xl:grid-cols-9` with two new cards: **Linked Exec Units** and **Blocked by Controls**.

## 5. Calendar — `/calendar`

See [08-Calendar-Merge-and-Toggle.md](08-Calendar-Merge-and-Toggle.md). The Command Center calendar shell (`MasterCalendarPage.tsx`) now hosts both the timeline view and the CES sprint view via `?view=sprint`.

## 6. Sidebar / Navigation Links

| File | Change |
| --- | --- |
| `src/App.tsx` | Removed `CesCalendarPage` lazy import. Added `<Route path="/ces/calendar" element={<Navigate to="/calendar?view=sprint" replace />} />`. |
| `src/policy/components/CommandCenterLayout.tsx` | CES "Compliance Calendar" sub-item → `/calendar?view=sprint`. |
| `src/policy/ces/layouts/CesLayout.tsx` | `CES_NAV` "Compliance Calendar" → `/calendar?view=sprint`. |

## 7. Read Path Summary

```
        ┌──── REGULATORY_EVENTS  (Command Center seed)
        │
useComplianceExecution() ─┬── + autogen.generated/triggered
        │                  │
        │                  + EVENTS / EXECUTION_UNITS  (CES seed)
        │                  │
        │                  + regulatoryExecutionStore state
        │                  │
        │                  + evaluateAudit per-event classification
        ▼
   Snapshot ──► Selectors ──► Dashboard, Audit, Master Controls, Calendar (sprint view)
```

Any new surface that needs sprint or compliance data MUST consume from this snapshot — never re-import the underlying seeds.
