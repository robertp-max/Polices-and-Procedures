# Exec summary — Phase 2D: Deadlines + escalations UI

**Date:** 2026-07-09  
**Commit message:** `feat(user-setup): Phase 2D deadlines + escalations UI`  
**Scope:** Real due-date resolution in the journey escalation engine; surface escalations in Journey Admin.

---

## What shipped

### 1. Deadline engine (`src/policy/journey/utils/escalation.ts`)

**Replaced** the universal `${year}-12-31` deadline for all ANN/COMP/DRILL modules with resolved per-module deadlines.

| Rule | When | Formula |
|------|------|---------|
| **Quarter-tagged** | `module.annualQuarter` set (typical ANN/DRILL) | Q1 → Mar 31, Q2 → Jun 30, Q3 → Sep 30, Q4 → Dec 31 of the **current calendar year** |
| **Hire/firstDay annual** | No `annualQuarter` (typical COMP annual re-eval) | Anchor = `startDate ?? hireDate`; first deadline = anchor + 1 year; then same MM-DD each year. Overdue uses most recent anniversary on/before `now`. |
| **COMP-90DAY** | Module id `COMP-90DAY` | Anchor + 90 calendar days |
| **Fallback** | Missing hire/start | Q4 Dec 31 (legacy-safe) |

**Unchanged tier types:** `OVERDUE_30` (≥30d past deadline, INFO), `OVERDUE_45` (≥45d, WARN), `OVERDUE_60` (≥60d, CRITICAL) — still HR-TD-001 §4.6.

**Exports for tests/UI:** `resolveModuleDeadline`, `daysPastModuleDeadline`, `quarterEndDate`, `formatModuleDeadline`.

### 2. Credential expiry (verified, not redesigned)

- Source field: **`JourneyEmployee.licenseExpiry`** (already on type + seeds).
- `LICENSE_EXPIRED` when days left ≤ 0 (CRITICAL).
- `LICENSE_EXPIRING_120` when 1–120 days left (CRITICAL if ≤30, else WARN).
- Seed demo: EMP-1003 `2026-05-18` fires expiring/expired depending on “now”; EMP-1001/2001 further out.

### 3. Escalations UI

**Preferred path from recon:** sixth tab on `JourneyAdminScreen.tsx` (no new route).

- Deep link: `/journey/admin?tab=escalations`
- Subscribes to `useJourneyStore` → `escalations`, `employees`
- `recomputeEscalations()` on mount + manual **Recompute**
- **Acknowledge** → `acknowledgeEscalation(id, actor)`
- **Resolve** → `resolveEscalation(id, actor)`
- Labels open count on the tab; severity/status tags; policy ref + human action text via `humanEscalation`

Demo/local-only (browser `ci-journey-v1` persist) until Phase 2F backend.

### 4. Unit tests

`src/policy/journey/utils/escalation.test.ts` — **17 tests**, all passing:

- Q1–Q4 date mapping and mid-year stagger (Q1 overdue, Q4 not)
- Hire-anchored first anniversary + subsequent anniversary
- COMP-90DAY = anchor + 90d
- OVERDUE_30 / 45 / 60 thresholds vs Q1 (Mar 31)
- Passed attempt suppresses overdue
- LICENSE_EXPIRED / LICENSE_EXPIRING_120 (WARN and CRITICAL) / no-fire when >120d

---

## Stakeholder behavior change (must call out)

**Before Phase 2D:** every unfinished ANN/COMP/DRILL module shared one year-end deadline. In July, *nothing* was “overdue” until after Dec 31.

**After Phase 2D:** deadlines **stagger by quarter**. Example (calendar year 2026, no pass recorded):

| Module quarter | Due | Overdue tiers start after |
|----------------|-----|---------------------------|
| Q1 | Mar 31 | Apr 30 / May 15 / May 30 |
| Q2 | Jun 30 | Jul 30 / Aug 14 / Aug 29 |
| Q3 | Sep 30 | … |
| Q4 | Dec 31 | (same as old universal date) |

COMP modules without `annualQuarter` now track **hire/first-day anniversary**, not Dec 31.

Demo roster overdue counts will **increase earlier in the year** for Q1/Q2 modules and long-tenured staff with incomplete annual competency — expected and intentional.

---

## Files changed

| File | Action |
|------|--------|
| `src/policy/journey/utils/escalation.ts` | Edit — real due-date resolution + docs |
| `src/policy/journey/utils/escalation.test.ts` | **New** — unit tests |
| `src/v6/screens/pageviews/JourneyAdminScreen.tsx` | Edit — `escalations` tab + store wiring |
| `UAT_Reports/.../exec-summary-2D.md` | **New** — this summary |

**Not touched (out of scope):** AdminUsersScreen (2B), Phase 2F backend, full JourneyAdmin static dashboard rewrite, `roleJourneyData` prose tables (escalation.ts remains enforcement SoT).

---

## Acceptance checklist

| Criterion | Status |
|-----------|--------|
| UI renders `journeyStore.escalations` | Yes — Journey Admin → Escalations tab |
| Ack / Resolve wired | Yes |
| `annualQuarter` affects due dates | Yes — Q1–Q4 mapped |
| Credential model confirmed | Yes — `licenseExpiry` on `JourneyEmployee` |
| Unit tests for quarters + tiers | Yes — 17 green |
| Behavior change documented | Yes — this summary |

---

## Verify

```bash
npx vitest run src/policy/journey/utils/escalation.test.ts
# UI: npm run dev → /journey/admin?tab=escalations
```

*Phase 2D complete for client-side deadline math + first escalations consumer.*
