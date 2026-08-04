# Phase 2 — ProgressBar labels & design hygiene

**Date:** 2026-08-03  
**Scope:** `apps/ehr-prototype` only (branch `ehr_phase1`)  
**Commit message (intended):** `fix(ehr): progress bar labels and design hygiene`

## Summary

1. Added meaningful `label` props to every `ProgressBar` call site that was relying on the generic fallback (`Progress N%`).
2. Confirmed no `behavior: 'smooth'` / `scroll-behavior: smooth` in source.
3. Confirmed `/design-system` route + nav item are consistent; corrected stale AGENTS.md gap notes that claimed the route was missing.
4. `npm run verify` — **PASS** (0 errors, 0 warnings).

## 1. ProgressBar labels

`ProgressBar` in `src/ui/index.tsx` already supports optional `label` and falls back to `Progress ${pct}%` for `aria-label`. Call sites below now pass context-specific labels so multiple bars on one screen are distinguishable to assistive tech (A11Y M3 / UIUX framework contract).

| File | Context | Label pattern |
|---|---|---|
| `src/screens/PatientChartScreen.tsx` | Assessment row | `` `${a.name} assessment ${a.completion}% complete` `` |
| `src/screens/PatientChartScreen.tsx` | Assessment section breakdown | `` `${a.name} · ${sec.section} ${sec.done} of ${sec.total} items` `` |
| `src/screens/PatientsScreen.tsx` | Episode day meter | `` `${name} episode day ${day} of ${length}` `` |
| `src/screens/PatientsScreen.tsx` | Integrity meter | `` `${name} record integrity ${passed} of ${total} checks passed` `` |
| `src/screens/QualityScreen.tsx` | Integrity list meter | `` `${name} record integrity ${passed} of ${total} checks passed` `` |
| `src/screens/RequirementsScreen.tsx` | Epic card planning bar | `` `${id} ${name} planning ${pct}% complete` `` |
| `src/screens/RequirementsScreen.tsx` | Epic drawer planning bar | same as above for `selected` |
| `src/screens/DesignSystemScreen.tsx` | Demo bars (25/60/90) | `` `Demo progress bar at ${p}%` `` |

**Already labeled (no change):**

- `src/ui/index.tsx` — `StatCard` meter passes `props.meter.label ?? \`${kicker} ${pct}%\``.

## 2. Smooth scroll

Grep across the app for `behavior:'smooth'`, `behavior: "smooth"`, and `scroll-behavior: smooth`:

- **No matches in `src/`.**  
- Existing scroll calls correctly use instant behavior:
  - `DesignSystemScreen.tsx` — `scrollIntoView({ block: 'start' })`
  - `BusinessPlanScreen.tsx` — same
  - `ScheduleScreen.tsx` — `scrollIntoView({ behavior: 'auto', ... })`
- Shell CSS already forces `scroll-behavior: auto` on nested scroll containers (`shell.css`, `doc-shell.css`, `ds.css`).

**No code changes required.**

## 3. Design system nav / route consistency

| Surface | Status |
|---|---|
| `src/App.tsx` | `<Route path="/design-system" element={<DesignSystemScreen />} />` (full-width, outside shells) |
| `src/data/navigation.ts` | `{ to: '/design-system', label: 'Design system', ..., status: 'built' }` |
| `src/shell/CommandPalette.tsx` | Palette entry present |
| `src/screens/DesignSystemScreen.tsx` | Screen exists |

**Consistent.** AGENTS.md §1 and §4 still claimed a dangling nav entry with no route — those notes were updated to describe the live gallery and to use `/design-system` as the positive lockstep example.

## 4. Files changed

```
apps/ehr-prototype/src/screens/PatientChartScreen.tsx
apps/ehr-prototype/src/screens/PatientsScreen.tsx
apps/ehr-prototype/src/screens/QualityScreen.tsx
apps/ehr-prototype/src/screens/RequirementsScreen.tsx
apps/ehr-prototype/src/screens/DesignSystemScreen.tsx
apps/ehr-prototype/Agents.md   (shared docs note only — design-system status correction)
audit/ehr-phase1-uiux/phase2-progress-labels.md  (this report)
```

No shared UI kit API change (`ProgressBar` already accepted `label`). No CSS changes. No route or nav data changes (already correct).

## 5. Verify result

```text
> npm run verify
> tsc --noEmit -p . && node scripts/verify-design.mjs

0 error(s), 0 warning(s) across 50 files
Design guardrail: PASS
```

**Exit code:** 0  
**New failures from this work:** none.
