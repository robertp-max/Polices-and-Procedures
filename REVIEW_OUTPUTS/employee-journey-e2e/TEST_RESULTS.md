# Employee Journey — Committed Playwright Suite Results

**Date:** 2026-07-27
**Branch:** `journey_specific_updates`
**Command:** `npm run test:e2e:journey` (`playwright.journey.config.ts`)
**App under test:** `apps/employee-journey` (vinext preview portal), served fresh on port 5186 by the Playwright `webServer`.
**Browser:** Chromium (Desktop Chrome device profile).

## Result

```
151 passed   0 failed   0 skipped   exit 0   (18-persona matrix, ≈1.8m)
```
(Prior 10-persona run: 95 passed. The suite grew to 18 personas — see below.)

## Coverage

- **Spec file:** `e2e-journey/journey.spec.ts`
- **Personas (18 — the full unblock-prompt roster, all now real portal fixtures):**
  taylor-rn (RN), jordan-lvn (LVN), morgan-hha (HHA skilled), dana-hha-aide (HHA aide-only),
  casey-pta (PTA), riann-pt (PT), owen-ot (OT), cora-cota (COTA), sloane-slp (SLP),
  micah-msw (MSW), avery-don (DON), riley-administrator (ADM), quinn-adm-rn (ADM+RN secondary),
  jamie-office (GAO general), skyler-driver (field driver), parker-returning (returning-from-leave),
  cameron-separating (separating), sage-remediation (RN failed-competency / remediation).
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

## Persona-roster gap — CLOSED

The unblock prompt's 18-persona requirement is now fully met. The 8 previously-missing
personas were added to `app/journey/_data/fixtures.ts` (with the `PersonaId` union extended):
**PT, OT, COTA, SLP, MSW**, **ADM + RN secondary role** (`quinn-adm-rn`), **HHA aide-only**
(`dana-hha-aide`, distinct from the skilled `morgan-hha`), and **remediation/failed-competency**
(`sage-remediation`). All 18 are exercised across the 6-viewport matrix + owner rules; the
new therapy/social-work roles (PT/OT/COTA/SLP/MSW) render with graceful role-specific data and
correct Advanced-Training visibility (advanced only for PT/RN/DON/ADM).
