# Merge Inventory - 2026-08-03

## Final reconciliation closure

This section supersedes earlier point-in-time QA counts and open findings in this
inventory. The reconciliation was performed only in the dedicated merge
worktree on `codex/merge-local-app-surfaces-2026-08-03`.

| Closure item | Result |
| --- | --- |
| Reception and training working-tree changes | Committed in `36b605c8` |
| Governance test and lint failures | Fixed in `86c76969` |
| Compliance discovery for Registry, Vendor, and Contractor management | Added in `6f96ce92` |
| Canonical EHR design-system tooling | Added and verified in `b52ab20f` |
| Latest committed EHR requirements correction | Applied in `07859aa5` |
| Root build | **PASS** - 3,357 modules |
| Full tests | **PASS** - 94 files, 1,045 tests |
| Full lint | **PASS** - 0 errors, 725 warnings |
| EHR `npm run verify` | **PASS** - 0 errors and 0 warnings across 50 files |
| EHR production build | **PASS** - 1,641 modules |
| Browser: Compliance discovery and three management routes | **PASS** - correct headings, no horizontal overflow |
| Browser: Reception launchers | **PASS** - five corrected destinations, all `target="_blank"` |
| Browser: merge-copy EHR on isolated QA port 5203 | **PASS** - Today, Design System, MVP Policy, and COR domain; zero browser errors |
| Compiled JavaScript shadows under `src/` | **0** |

The canonical editable EHR is `apps/ehr-prototype/` on port 5194. The
`apps/ehr-prototype-static/` app on port 5191 is an isolated inspection
fallback and is not the Reception target. Vendor and Contractor management
remain intentionally UI/mock-client implementations; production APIs were not
part of this merge.

## Merge branch result

| Field | Value |
| --- | --- |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| Base | `onboarding_specialized` @ `7b0b6ae6` |
| Safety branch | `safety/onboarding_specialized-2026-08-03` @ `7b0b6ae6` |
| Reconciliation safety branch | `safety/recon-fix-start-20260803` @ `dae8e24b` |
| Merge worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Method | Additive commits and committed Git history only during final reconciliation; dirty root and the separate Fable filesystem worktree were not used as sources |

### Commits on merge branch

| Commit | Message |
| --- | --- |
| `79f25bd4` | feat(reception): add post-login reception launcher and EHR handoff |
| `2aca52cf` | docs(ehr): add development inventory and UI/UX discovery plan |
| `e0c678ed` | chore(apps): vendor static EHR prototype mirror for local 5191 handoff |
| `5af4f6fd` | docs: record local app surfaces merge inventory 2026-08-03 |
| `60f17bb5` | docs: add build/QA results to merge inventory |
| `f05cca59` | fix: close merge quality gates |
| `25f2ff25` | feat(ehr-prototype): CI-branded Home Health EHR design prototype |
| `09483a5c` | style(ehr-prototype): white card containers, cool neutrals, edge side nav |
| `e2b1e4c8` | docs(ehr-prototype): bring UAT report current, park remaining checks |
| `36b605c8` | fix(reception): preserve launcher and training accessibility updates |
| `86c76969` | fix(governance): close current test and lint gates |
| `6f96ce92` | feat(compliance): surface management workspaces |
| `b52ab20f` | feat(ehr-prototype): add live design system tooling |
| `07859aa5` | docs(ehr-prototype): correct requirements review misattribution |

### Build / QA snapshot (merge worktree)

| Check | Result |
| --- | --- |
| `npm run build` (`tsc -b && vite build`) | **PASS** |
| `npm run lint` | **PASS** - 0 errors; 725 warnings (existing warning debt) |
| `npm test -- --run` | **PASS** - 94 files, 1,045 tests |
| `apps/ehr-prototype`: `npm run verify` | **PASS** - 0 errors and 0 warnings across 50 files |
| `apps/ehr-prototype`: `npm run build` | **PASS** - Vite 6.4.3, 1,641 modules |
| Journey: direct ESLint / `vinext build` / route tests | **PASS** — 0 lint errors, production build, 7/7 tests |
| Browser: Journey to Connect | **PASS** - desktop/mobile no switch overlap; opens the separate Connect app |
| Browser: Reception → EHR | **PASS** — launcher present; EHR dashboard renders on `http://127.0.0.1:5194/` with no console errors |
| Browser: Compliance discovery | **PASS** - Registry, Vendor, and Contractor cards and destination routes render |
| Browser: merge-copy EHR | **PASS** - verified on isolated QA port 5203 with zero error logs and no horizontal overflow |
| Sibling `src/**/*.js` shadows | None |
| Secrets in `apps/ehr-prototype-static` | None found |
| Canonical EHR source | `apps/ehr-prototype/`; latest committed requirements correction `07859aa5` plus merge-specific MVP rails |
| Connect / Journey sources in diff | **Not included** |
| Drive health `http://127.0.0.1:5188/api/calendar/evidence/health` | HTTP 200, `ok: true`, `drive.reachable: true` (env on main) |
| EHR source app `http://127.0.0.1:5194/` | Production build passed; Reception launcher target |
| EHR static fallback `http://127.0.0.1:5191/` | HTTP 200, title Care Indeed Home Health EHR Prototype |
| Reception preview `http://127.0.0.1:5179/reception` | HTTP 200 |
| Full EHR source import tip (before final integration fixes) | `e2b1e4c8` |

## What was merged (copy sources)

### Reception (from `reception_area` / `codex/reception_area`)

- `src/v6/routing/routeRegistry.ts`
- `src/v6/routing/router.tsx`
- `src/v6/screens/RepresentativeScreens.tsx`
- `src/v6/screens/pageviews/index.ts`
- `src/v6/shell/V6Shell.tsx`
- `src/v6/utils/safeRedirect.ts`
- `src/auth/apiClient.ts` (minimal reception copy)
- `src/v6/screens/pageviews/ReceptionScreen.tsx`

Expected behavior:

- `/reception` route
- Authenticated default + safeRedirect → `/reception`
- Find A Home Care separate from EHR Prototype
- EHR launcher → `http://127.0.0.1:5194/`
- Every Reception destination opens in a new browser tab, including command-palette launches
- Find A Home Care launcher → `https://fahc-provider-portal-rti5nksmma-uc.a.run.app/provider/login`
- Journey launcher -> `http://127.0.0.1:5193/journey?persona=taylor-rn` (the separate Journey app with the Journey/Connect toggle)
- Connect launcher -> `http://127.0.0.1:5192/?view=home` (separate Connect app; no source merge)
- Governing Body launcher → `/governance` (latest Governing Body V3 Executive Readiness portal; not Find A Home Care)

### qapi docs (from `qapi-uiux-discovery` / `qapi`)

- `docs/ehr-development-inventory.md` (from commit `c207655b`)
- `docs/ehr-uiux-discovery-plan.md` (was untracked on qapi worktree)

No full `git merge qapi` (branch history diverges from base).

### Static EHR prototype mirror (from Temp — not Fable)

- Source: `C:\Users\razer\AppData\Local\Temp\care-indeed-ehr-prototype-local`
- Destination: `apps/ehr-prototype-static/`
- Title: Care Indeed Home Health EHR Prototype
- Isolated static assets only; no auth/API/shared-state wiring
- Serve: `npx --yes serve apps/ehr-prototype-static -l 5191`

### Canonical interactive EHR source

- Destination: `apps/ehr-prototype/`
- Owner Git lineage: `EHR_Prototype`; committed app imports `25f2ff25`, `09483a5c`, and `e2b1e4c8`
- Latest committed owner correction: `07859aa5` (source commit `64f9dbb2`)
- Merge-specific additions: business-plan and requirements surfaces, Wizard-of-Oz MVP policy rails, domain navigation, and live design-system tooling
- Standalone Vite app with no policy-runtime auth, API, or shared-state wiring
- Dev URL: `http://127.0.0.1:5194/`
- Reception workspace card and `/ehr-prototype` CTA both launch port 5194
- Production build and design verification passed; UAT handoff is `apps/ehr-prototype/docs/UAT-REPORT.md`
- Final reconciliation did not copy from or modify the separate Fable filesystem worktree

### Governing Body V3 Executive Readiness portal (from latest governance worktree)

- Source: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\codex-governing-body-v3-executive-readiness-os`
- Source branch: `codex/governing-body-v3-executive-readiness-os`
- Source tip: `f67b794a` plus current governance worktree file state
- Included app files: `src/v6/screens/governance/` and `src/v6/screens/pageviews/GovernanceScreen.tsx`
- Included route wiring: `/governance`, `/governance/meetings`, `/governance/decisions`, `/governance/workflows`, `/governance/evidence`, `/governance/academy`, and related meeting/module child routes
- Included scoped API support: `server/governance/`, `server/routes/governance*.ts`, `server/auth/requireGovernancePortalAccess.ts`, `server/auth/authorization/`, and governance reference/tabletop packet assets under `server/assets/`
- Local route: `http://127.0.0.1:5201/governance`
- Reception card opens the standalone portal route in a new tab.
- Explicitly not sourced from the older `feature/governing-body-portal` / `GOVERNING_BODY_PORTAL` worktree.

Latest correction verification:

| Check | Result |
| --- | --- |
| `npm run build` | **PASS** |
| `npx vitest run src/v6/screens/governance/v33` | **PASS** - 20 files, 240 tests |
| `npx vitest run --config vitest.server.config.ts server/routes/governanceComplianceEvidence.test.ts server/routes/governanceReferences.test.ts server/routes/governanceTabletopPackets.test.ts server/governance` | **PASS** - 8 files, 39 tests |
| Browser: `http://127.0.0.1:5201/reception` | **PASS** - Reception lists Journey, Connect, Governing Body, Find A Home Care, and EHR Prototype |
| Browser: Reception launcher URLs | **PASS** - Governing Body -> `/governance`, Find A Home Care -> `https://fahc-provider-portal-rti5nksmma-uc.a.run.app/provider/login`, Journey -> `http://127.0.0.1:5193/journey?persona=taylor-rn`, Connect -> `http://127.0.0.1:5192/?view=home`, EHR -> `http://127.0.0.1:5194/`; all target `_blank` |
| Browser: `http://127.0.0.1:5201/governance` | **PASS** - latest V3 home rendered with `Executive Readiness Office` and `My Compliance` |
| Browser: `http://127.0.0.1:5201/governance#compliance/tabletop` | **PASS** - rendered `Governing Body Boardroom Simulation`, `Tabletop Hub`, and `Workflow Coverage` |
| Browser: `http://127.0.0.1:5201/governance/academy/modules/GB-001` | **PASS** - normalized to `#compliance/training/module/GB-001` and rendered the V3 training module |
| Current failed browser responses on verified routes | None |

## Intentionally excluded

| Item | Reason |
| --- | --- |
| Separate Fable `EHR_Prototype` filesystem worktree | Not modified or used as a source during final reconciliation; committed Git history only |
| Dirty root checkout bulk untracked | Unrelated litter; merge done only in worktree |
| Main dirty `src/auth/apiClient.ts` (larger) / tests | Not reception-approved set |
| Connect repo (`...\connect`) | Separate Sites source; Journey toggle stays there |
| Employee Journey repo | Separate repo; reciprocal Journey/Connect toggle is maintained and verified there, not merged into this policy branch |
| Older Governing Body portal branch (`feature/governing-body-portal`) | Superseded by `codex/governing-body-v3-executive-readiness-os`; not the source for the current Reception launcher |
| Secrets (`.env`, service-account JSON, keys) | Never staged/committed |

## DefenCIble / Google Drive (investigation)

Working Drive behavior is **runtime/env**, not a missing code merge from dirty root.

**Canonical working Drive surface is only port 5188** (with local env + API **8790**).  
**Ports 5187 and 5173 are not working Drive URLs** — do not treat them as the verified Drive stack.

| Surface | URL | Drive status |
| --- | --- | --- |
| **Working Drive (only)** | `http://127.0.0.1:5188/evidence` (+ `/evidence/defensible-2`) | Verified when main checkout has local `.env` and API on **8790**: `ok: true`, `drive.reachable: true` via `/api/calendar/evidence/health` |
| qapi preview | `http://127.0.0.1:5187/compliance` | UI may load; **NOT working Drive** (health 503 without env; not the verified Drive URL) |
| Older baseline | `http://localhost:5173/evidence/defensible-2` | **NOT working Drive** |

Code already present on base: `server/googleDrive.ts`, `server/googleDriveAuth.ts`, `server/routes/calendar.ts` (`GET /api/calendar/evidence/health`).  
**Do not commit credentials.** Drive fails safely without local credentials.

## Local app URLs (reference)

| Surface | URL | Notes |
| --- | --- | --- |
| DefenCIble + Drive | `http://127.0.0.1:5188/evidence` | Main + API 8790; env-backed |
| DefenCIble direct | `http://127.0.0.1:5188/evidence/defensible-2` | |
| Reception (preview) | `http://127.0.0.1:5179/reception` | reception_area worktree |
| EHR source app | `http://127.0.0.1:5194/` | `apps/ehr-prototype`; Reception launcher target |
| EHR static mirror | `http://127.0.0.1:5191/` | `apps/ehr-prototype-static`; preserved fallback |
| Connect | `http://127.0.0.1:5192/?view=home` | Separate repo; Reception target |
| Journey | `http://127.0.0.1:5193/journey?persona=taylor-rn` | Separate repo; Reception target |
| qapi preview | `http://127.0.0.1:5187/compliance` | **Not** working Drive |

## Compliance latest-source refresh

The `/compliance` execution workspace was refreshed from the latest committed
Compliance lineage in `codex/governing-body-v3-executive-readiness-os`:

- `src/v6/screens/pageviews/ComplianceHomeScreen.tsx` from `9de7f2e0`, including
  its later WCAG contrast pass.
- Canonical master-control registry from `bb35dfa2`.
- Deterministic control-readiness engine from `15743682`.

Only the Compliance screen was taken from `9de7f2e0`; that commit's unrelated
bulk Employee Journey payload was intentionally excluded.
Reconciliation commit `6f96ce92` added prominent Registry, Vendor, and
Contractor discovery cards to Compliance Home, with focused route tests.

## Connect / Journey (external, not in this branch)

- Connect: branch `connect` @ `305ae2e`; local change `app/community-app.tsx` → Journey on 5193. Keep in Connect repo only.
- Journey: branch `codex/journey-connect-toggle-2026-08-03` @ `1909dc5`; reciprocal toolbar toggle targets local Connect on 5192 and the verified Sites deployment as its hosted fallback. Changes remain in the Journey repo only.

## EHR Wizard-of-Oz MVP substitution policy

The EHR source app now includes `#/mvp-policy` and an explicit substitution
registry. The EHR supplies clinical context and opens the existing authoritative
rail in a new tab; it does not copy completion state or fabricate an integration.

| EHR capability | Authoritative rail | Verified local target |
| --- | --- | --- |
| Documents and signatures | eCign | `http://127.0.0.1:5201/forms/CL-FM-029/esign?source=ehr-mvp` |
| Forms library | Policy Suite Forms | `http://127.0.0.1:5201/forms?source=ehr-mvp` |
| Messages | Connect | `http://127.0.0.1:5192/` |
| Vendor BAAs | Master Control Registry | `http://127.0.0.1:5201/compliance/master-controls?control=CTRL-042&source=ehr-mvp` |

`MasterControlsScreen` accepts a `control` query parameter so the vendor BAA
handoff opens the `CTRL-042` dossier directly and keeps the selected dossier
addressable in the URL.

## Confirmation

- Final reconciliation used the dedicated merge worktree and additive commits only; the dirty root checkout was not staged.
- The separate Fable `EHR_Prototype` filesystem worktree was not modified or used as a source during final reconciliation. Only committed Git history was consulted for the latest owner correction.
- Connect and Journey remain separate repositories; this branch contains launch URLs only.

## Wave-1 inventory verification (2026-08-03, W1-A15)

Additive check against merge worktree HEAD after feature commits (pre-refresh tip `60f17bb5`):

| Claim | Status | Evidence |
| --- | --- | --- |
| Inclusions: reception launcher paths | **OK** | `src/v6/screens/pageviews/ReceptionScreen.tsx` (EHR → `http://127.0.0.1:5194`), route/shell/auth files from `79f25bd4` present |
| Inclusions: qapi EHR docs | **OK** | `docs/ehr-development-inventory.md`, `docs/ehr-uiux-discovery-plan.md` |
| Inclusions: static EHR path | **OK** | Destination **`apps/ehr-prototype-static/`**; title *Care Indeed Home Health EHR Prototype*; serve on **5191**; source Temp mirror (not Fable) |
| Inclusion: latest `EHR_Prototype` app snapshot | **OK** | Committed branch content plus all current modified/untracked files under `apps/ehr-prototype`; exact SHA-256 parity checked before commit |
| Exclusion: Connect / Journey | **OK** | External-only section; not in merge diff |
| Working Drive URL | **OK** | **Only** `http://127.0.0.1:5188/evidence` (+ defensible-2) with API 8790 / env |
| 5187 is not working Drive | **OK** | Inventory labels qapi preview **Not** / **NOT working Drive** |
| 5173 is not working Drive | **OK** | Inventory labels older baseline **Not** / **NOT working Drive** |
| Drive code already on base | **OK** | `server/googleDrive*.ts`, calendar `evidence/health` route present; no Drive merge required |
