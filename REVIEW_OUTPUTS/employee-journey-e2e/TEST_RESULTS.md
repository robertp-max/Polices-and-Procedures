# Employee Journey — Committed Playwright Suite Results

**Date:** 2026-07-27
**Branch:** `journey_specific_updates`
**Command:** `npm run test:e2e:journey` (`playwright.journey.config.ts`)
**App under test:** `apps/employee-journey` (vinext preview portal), served fresh on port 5186 by the Playwright `webServer`.
**Browser:** Chromium (Desktop Chrome device profile).

## Result

```
95 passed (≈1.1m)   0 failed   0 skipped   exit 0
```

## Coverage

- **Spec file:** `e2e-journey/journey.spec.ts`
- **Personas (10 — every preview persona that exists in the portal fixtures):**
  taylor-rn (RN), jordan-lvn (LVN), morgan-hha (HHA), casey-pta (PTA), avery-don (DON),
  riley-administrator (ADM), jamie-office (GAO), skyler-driver (GAO/field driver),
  parker-returning (GAO/returning), cameron-separating (GAO/separating).
- **Viewports (6):** 320, 375, 768, 1024, 1440, 1600 px + reduced-motion context + keyboard-focus check.
- **Surfaces (10):** /journey, /journey/my-journey, /journey/training, /journey/policies,
  /journey/documents, /journey/competencies, /journey/performance, /journey/history,
  /journey/handbook, /journey/workflows.
- **Assertions:** HTTP < 400, `<h1>` visible, **no horizontal overflow** (scrollWidth ≤ clientWidth+2),
  **no non-benign console errors / pageerror**, no "Application error" surface.
- **Owner visibility rules verified:**
  - Advanced Training link present **only** for PT/RN/DON/ADM — asserted PRESENT for RN/DON/ADM and ABSENT for LVN/HHA/PTA and all GAO personas.
  - Advanced module set contains the four canonical markers (CMS-485, QAPI, OASIS, Documentation).
  - ACHC Clinical Bundle section **absent** for a general employee (jamie-office) and **present** for an assigned clinical role (taylor-rn).

## Defect found and fixed by this suite

**Responsive: home dashboard horizontal overflow ≤768px.** The Journey Roadmap stepper
(`ol.roadmap-steps`) forced the page to ~1468px wide at 320/375/768px because its grid
parent (`.home-roadmap`) lacked `min-width:0`, so the stepper's own `overflow-x:auto`
never engaged. Fix: `min-width:0` on `.home-roadmap`/`.home-velocity` + collapse
`.home-dashboard` to a single column ≤768px (`app/styles/workspaces.css`). This flipped
31 failing viewport tests to green.

## Persona-roster gap (honest note — no fake coverage)

The unblock prompt lists 18 personas; the portal currently ships **10** preview personas.
The following have **no distinct preview persona** and are therefore not covered as separate
cases (rather than faked): standalone **PT, OT, COTA, SLP, MSW**, **ADM + RN secondary role**,
**HHA aide-only** (only a single HHA persona exists), and **remediation/failed-competency**.
Closing this gap requires adding those preview personas to `app/journey/_data/fixtures.ts`;
the suite is structured (the `PERSONAS` array) so each new persona is one row.
