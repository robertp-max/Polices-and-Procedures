# Test Results

_Master Correction Prompt §18. Status: **PARTIAL** — typecheck + live smoke verification done this pass; automated persona/parity suite not yet added._

## Verified this pass

- **Journey-app typecheck:** `npx tsc --noEmit -p tsconfig.json` — 0 errors in all
  edited/new files (`annualRequirements`, `AnnualWorkspace`, `PolicyMarkdown`,
  `NolanAssistant`, `EmployeePortalShell`, `SupportWorkspace`). Only pre-existing Cloudflare
  `worker/db` ambient notes remain (handled by the vinext build, out of scope).
- **Main-app typecheck:** clean for `navigationManifest.ts` / `V6Shell.tsx` edits.
- **Live smoke (Browser pane, localhost:5190):**
  - Annual page: renamed "Annual & Recurring Requirements"; no "Agency Annual Plan"/"Annual
    Competency" tabs; one summary strip; 12 ACHC modules with Launch (no false Unavailable);
    dedup "Also satisfies" chips; Advanced visible; console clean.
  - Policy reader `RN__G-01__GV-PM-004`: 14 numbered clauses render as structured statements;
    18 tables; no raw markdown tokens.
  - Nolan: FAB + panel render; graceful "temporarily unavailable" + alternatives on
    unreachable endpoint (no raw 404 / crash).

## Automated invariant suite (new)

`npm run journey:verify:corrections` (`scripts/verifyJourneyCorrections.ts`, tsx, no build
needed) asserts the §5/§6/§7 data-layer guarantees and **passes 11/11**:
- ACHC: all 12 modules; audience = 10-role clinical set with ADM excluded; no `roles:'ALL'`
  leak (M04/M07/M09); every ACHC module has a canonical player (no false Unavailable).
- Advanced: PT/RN/DON/ADM floor ⊆ effective audience for every module; canonical roles never
  dropped.
- Dedup: superseded ANN ids never appear as their own role-specific card; each dedup-target
  ACHC module carries its Also-satisfies provenance; ADM not assigned the ACHC bundle; HHA
  gets the 12h in-service clock.

## Live persona sweep (Browser pane, all 10 synthetic personas)

Navigated key routes for every persona; console clean (0 errors) throughout:
- taylor-rn, jordan-lvn, morgan-hha, casey-pta, avery-don, riley-administrator, jamie-office,
  skyler-driver, parker-returning, cameron-separating.
- Spot-verified role-specific behavior: HHA → 5 supervised-visit clocks; PTA → therapy-assistant
  oversight; office → OIG/SAM "Not applicable" + no clocks; ADM → Advanced scope warning;
  separating → separation phase Current; returning → leave/return phase; RN → 12 ACHC launchable.

## Not yet run (remaining)

- Headless multi-viewport player-parity assertions and the 18-persona expansion (skilled-vs-
  aide-only HHA, ADM+RN secondary, expiring-credential, failed-competency) in an automated runner.
- Regulatory-cadence assertions (HHA 14/60-day, observation, in-service).
- Full responsive (320–1600px, 200%) and screen-reader/keyboard sweeps (see RESPONSIVE_QA.md /
  ACCESSIBILITY_QA.md).
