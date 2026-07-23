# ZIP Integration Manifest — Governing Body Portal

## Source package
- File: `Care_Indeed_Governing_Body_Office_Corrective_Hardening_2026-07-22.zip`
- Size: 192,888,668 bytes · 166 entries · single root `Care_Indeed_Governing_Body_Office_Corrective_Hardening/`
- Extracted to a temp folder **outside** the repository (scratchpad), then compared file-by-file to
  the base worktree at `9a6defca`. The package was NOT blindly copied over `main`.

## Key finding — the ZIP was built off an OLDER base
The shared (divergent) files carry large non-governance diffs (e.g. `V6Shell.tsx` differs by
**1189** lines, `routeRegistry.ts` by 509, `server/index.ts` by 436). Those large diffs are the
ZIP's **stale copy of unrelated current code**, not governance content. Therefore divergent files
are integrated by **surgically porting only the governance hunks** onto the current `main` version —
never by replacing the current file. This preserves the admin redesign and all production fixes.

## Classification (source files)

### NEW — additive, dropped in verbatim (22)  ✅ LANDED
```
server/governance/academyBank.ts, academyService.ts, adapters.ts, authority.ts, contracts.ts,
meetingService.ts, mutations.ts, repository.ts, routes.ts, runtime.ts, schemas.ts, service.ts,
sourcePosture.ts, testFixtures.ts
server/governance/*.corrective.test.ts (academy, authority, qapi-vertical, repository, source-and-schema)
scripts/migrateGovernanceAuthority.ts
e2e-auth/governance-corrective.spec.ts
src/v6/screens/governance/GovernanceOffice.tsx, GovernanceAcademyCatalog.tsx,
  GovernanceAcademyPlayer.tsx, governanceApi.ts, governance-office.css
```

### DIVERGENT — surgical governance-only merge (11)
| File | Governance delta | Status |
|---|---|---|
| `server/index.ts` | import + `app.use('/api/governance', <guard>, governanceRouter)` (2 lines) | pending (permission-first guard) |
| `server/cloudrun.ts` | governance readiness flag + required-surface mount block (mirrors Brad/Nolan) | pending |
| `server/auth/routeAccessMatrix.ts` | one `mount:'governance'` entry | pending (permission-first) |
| `src/v6/routing/routeRegistry.ts` | ~21 `/governance/**` route rows | pending (per §3 canonical family) |
| `src/v6/screens/pageviews/GovernanceScreen.tsx` | router: academy player vs GovernanceOffice | pending |
| `src/v6/shell/V6Shell.tsx` | nav item + icon wiring | pending (borderless #273D38 icon) |
| `server/auth/e2eTestAuth.ts` (+`.test.ts`) | governance test identities | pending |
| `playwright.auth.config.ts` | governance auth project | pending |
| `package.json` / `package-lock.json` | dependency merge (additive only) | pending (merge, not replace) |

### Design decisions (owner-confirmed)
1. **Permission-first access gate:** implement new permission `governance.portal.access` as the
   primary gate (registry/catalog/Admin UI/resolver/guards/audit/tests); ZIP's role list kept only
   as a compatibility fallback. (ZIP shipped a hard-coded `requireRole` gate.)
2. **Sequencing:** ZIP integration = milestone 1; the §9 net-new "Required Learning" (13 bundles /
   42 policy assignments, read→quiz→attest, from the XLSX + learning map — **not present in the ZIP**)
   = milestone 2.

## Media
- `public/gb-visuals/` module covers: **13** (gb-001…gb-012 + gb-capstone) ✅ landed
- `public/gb-visuals/scenes/`: shipped 70 → **65 canonical** after removing 5 exact-duplicate
  repair images (byte-identical `*-cards-fixed-v27.png`): ✅ landed
  ```
  gb-001/control-model-cards-fixed-v27.png, gb-001/field-guide-cards-fixed-v27.png,
  gb-002/control-model-cards-fixed-v27.png, gb-002/worked-example-cards-fixed-v27.png,
  gb-003/worked-example-cards-fixed-v27.png
  ```
- `public/logo-careindeed-orange.png`: ✅ added (was absent from base)
- Preserved: 13 Academy modules, 5 canonical scenes/module, 65 scene assets, 13 cover assets.

## REVIEW_OUTPUTS docs from the ZIP
The ZIP's `REVIEW_OUTPUTS/governing-body-office/**` corrective reports are retained under the
scratchpad for reference and inform the merge; the branch's own deliverables live under
`REVIEW_OUTPUTS/governing-body-portal-integration/`.
