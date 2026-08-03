# W2-QA11 — Journey Link QA

| Field | Value |
| --- | --- |
| Agent | Wave 2 / **W2-QA11** (Journey Link QA) — independent re-audit |
| Date | 2026-08-03 |
| Merge worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Merge branch | `codex/merge-local-app-surfaces-2026-08-03` @ **`5a24e941`** |
| Merge base | `onboarding_specialized` @ **`7b0b6ae6`** |
| Prior Wave-1 reference | `audit/merge-2026-08-03/wave-1/W1-A11-journey-link-verifier.md` (PASS @ tip `60f17bb5`) |
| External Journey repo | `C:\AI\Git\training\HomeHealth\employee-journey` @ **`0ab6155`** |
| **Overall verdict** | **PASS** |

---

## Mission criteria (must all pass)

| # | Criterion | Result |
| --- | --- | --- |
| 1 | **No employee-journey source paths in merge diff** | **PASS** |
| 2 | **Reception Journey is route/target only** | **PASS** |
| 3 | **External Journey repo not vendored** | **PASS** |

### Overall: **PASS**

Independent re-verification confirms Wave-1 separation still holds after subsequent audit-only commits (`60f17bb5` → `5a24e941`). The merge does not bring in Employee Journey sources; Reception opens Journey as an in-app SPA route string only; the external Employee Journey repo remains a clean, separate Sites app and is not vendored under this worktree.

---

## Scope notes

- **Merge-scope comparison used:** `onboarding_specialized...HEAD` (three-dot). Do **not** use `main...HEAD` for this audit — merge base is `onboarding_specialized`.
- **Two different “Journey” products exist** (documented; not a defect):
  1. **Host onboarding LMS** — pre-existing in-repo `src/policy/journey/*` and SPA routes `/journey/*`. Reception points here.
  2. **External Employee Journey** — separate repo `...\employee-journey` (vinext Sites app, inventory port **5193**). Intentionally **not** in this merge.
- Host `src/policy/journey` is **not** a vendor of `employee-journey` and is **not** introduced by the merge-branch file delta (empty under `src/policy/journey` in the merge diff).

---

## 1. No employee-journey source paths in merge diff

### Method

```text
git rev-parse HEAD                  # 5a24e94121f2e1872c454cac618e49c2884eb583
git rev-parse onboarding_specialized  # 7b0b6ae6...
git diff --name-only onboarding_specialized...HEAD
git ls-files "*employee-journey*" "*employee_journey*" "*EmployeeJourney*"
```

Negative filter over full merge name-only list:

```text
employee-journey | employee_journey | EmployeeJourney |
apps/journey | apps/employee | packages/journey | vendor/journey | connect/
```

### Result

| Check | Result |
| --- | --- |
| Merge name-only matches employee-journey / connect / apps-journey vendor paths | **NONE** |
| `git ls-files '*employee-journey*'` (and variants) | **Empty** |
| `.gitmodules` | **Absent** |
| Feature-only tip (`…60f17bb5`) journey-named paths | **None** (only later audit report path under wave-1) |
| `src/policy/journey` in merge diff | **Empty** (pre-existing host tree, not merge-introduced) |
| Only app under `apps/` | **`ehr-prototype-static`** (EHR mirror, not Journey) |

### Feature commits (product merge, pre-audit noise)

| Commit | Message |
| --- | --- |
| `79f25bd4` | feat(reception): add post-login reception launcher and EHR handoff |
| `2aca52cf` | docs(ehr): add development inventory and UI/UX discovery plan |
| `e0c678ed` | chore(apps): vendor static EHR prototype mirror for local 5191 handoff |
| `5af4f6fd` | docs: record local app surfaces merge inventory 2026-08-03 |
| `60f17bb5` | docs: add build/QA results to merge inventory |

Feature file set: Reception wiring under `src/v6/**` + `src/auth/apiClient.ts`, `apps/ehr-prototype-static/**`, EHR docs, `MERGE_INVENTORY_2026-08-03.md`. **No** Employee Journey / Connect source trees.

Inventory claims confirmed:

- `Connect / Journey sources in diff | **Not included**`
- `Employee Journey repo | Clean reference target only`
- `Exclusion: Connect / Journey | **OK**`

**Conclusion (1):** **PASS** — no employee-journey source paths in the merge diff.

---

## 2. Reception Journey is route/target only

**File:** `src/v6/screens/pageviews/ReceptionScreen.tsx`  
**Introduced by:** merge commit `79f25bd4` (full file add).

### Workspace definition (Journey)

| Field | Value |
| --- | --- |
| Workspace id | `journey` |
| Name | `Journey` |
| Description | Onboarding, training, role paths, certificates, policy attestation, and employee evidence. |
| **Route target** | **`/journey?tab=home`** (relative SPA path only) |
| `external` flag | **unset / false** |
| Status | `available` |
| CTA | `Open Journey` |
| Accent / icon | orange / `GraduationCap` |

Evidence (current HEAD):

```65:75:src/v6/screens/pageviews/ReceptionScreen.tsx
  {
    id: 'journey',
    name: 'Journey',
    description: 'Onboarding, training, role paths, certificates, policy attestation, and employee evidence.',
    route: '/journey?tab=home',
    status: 'available',
    requiredRoles: ['Administrator', 'Employee', 'Clinician', 'Supervisor', 'RN', 'LVN', 'PT', 'OT', 'HHA'],
    capabilities: ['Training path', 'Modules', 'Assessments', 'Certificates'],
    accent: 'orange',
    icon: GraduationCap,
    cta: 'Open Journey',
  },
```

### Navigation behavior (route only — not source handoff)

| Interaction | Journey behavior |
| --- | --- |
| Card click | React Router `<Link to={lastRoute}>` — **internal** |
| Command palette | `navigate(workspace.lastRoute)` — **internal** |
| External flag | Journey does **not** set `external` |
| Contrast: EHR Prototype | `route: 'http://127.0.0.1:5191'`, `external: true` → `<a target="_blank">` / `window.open` |

Branch points in the same file:

- `if (workspace.external)` → external anchor / `window.open(..., '_blank', 'noopener,noreferrer')`
- else → `<Link to={…}>` / `navigate(…)`
- Journey takes the **else** path

### Not used for Reception Journey

| Forbidden pattern for this criterion | Present for Journey? |
| --- | --- |
| Absolute external URL (`http://127.0.0.1:5193/...`) | **No** |
| `external: true` | **No** |
| New-tab handoff | **No** |
| Imported Employee Journey components/modules | **No** |
| Vendored path under `apps/` or `packages/` | **No** |

### Host route alignment (target exists in host app)

`src/v6/routing/routeRegistry.ts` registers host SPA routes including `/journey` and children (`/journey/new-hire`, `/journey/module/:moduleId`, `/journey/appendix-f`, `/journey/supervisor`, `/journey/admin`, etc.). Reception’s `/journey?tab=home` targets that **in-app** surface, not the external Sites app on **5193**.

Content scan of feature `src/` + `apps/` + package files for `employee-journey` / `5193` / vinext package name: **no Employee Journey vendor hits**; only intentional Reception route string `'/journey?tab=home'`.

**Conclusion (2):** **PASS** — Reception Journey is a **route/target string only** (`/journey?tab=home`), internal SPA navigation.

---

## 3. External Journey repo not vendored

### External repo state (read-only check)

| Check | Result |
| --- | --- |
| Path | `C:\AI\Git\training\HomeHealth\employee-journey` |
| HEAD | **`0ab615585e6bd404139003aa10fed1b84a4af5a8`** (short **`0ab6155`**) |
| Branch | `main` tracking `origin/main` |
| Working tree | **Clean** (`## main...origin/main`, no porcelain dirt) |
| Tip message | `Polish RN training workflow landing` |
| Package name | `site-creator-vinext-starter` (vinext / Sites-style app) |
| Inventory expected tip | **`0ab6155`** — **matches** |

Inventory reference (not launched from Reception in this merge):

- `http://127.0.0.1:5193/journey/training?persona=taylor-rn` — **separate repo**

### Vendor absence in merge worktree

| Check | Result |
| --- | --- |
| Submodule for employee-journey | **None** (no `.gitmodules`) |
| `package.json` dependency on employee-journey / vinext journey package | **None** (only unrelated `connect-history-api-fallback`) |
| `apps/` journey / employee subtree | **None** — only `ehr-prototype-static` |
| `git ls-files` under `apps/*journey*`, `vendor/*journey*`, `packages/*journey*` | **Empty** |
| Copy of external `app/journey/*` into merge tree | **Not present** |
| Inventory: Journey external, not in branch | **Confirmed** |

**Only vendored local surface in this merge:** static EHR prototype at `apps/ehr-prototype-static` → Reception external URL `http://127.0.0.1:5191`. That is **not** Employee Journey.

**Conclusion (3):** **PASS** — external Employee Journey repo is **not vendored**; remains a clean external reference at `0ab6155`.

---

## Separation matrix (confirmed)

| Surface | In merge branch product delta? | How Reception reaches it |
| --- | --- | --- |
| Compliance | Host (pre-existing + launcher) | Internal `/compliance` |
| **Journey (host onboarding LMS)** | Host pre-existing `src/policy/journey`; **not** merge-introduced tree | **Internal `/journey?tab=home`** |
| **Employee Journey (external repo)** | **No — excluded / not vendored** | **Not linked from Reception**; inventory-only 5193 URL |
| Governing Body | Host | Internal `/governance` |
| Find Home Care | Host | Internal `/find-home-care` |
| EHR Prototype | **Vendored static** `apps/ehr-prototype-static` | **External** `http://127.0.0.1:5191` |
| Connect | **Excluded** (separate repo) | N/A in this branch |

---

## PASS / FAIL scorecard

| # | Criterion | Evidence summary | Result |
| --- | --- | --- | --- |
| 1 | No employee-journey source paths in merge diff | `onboarding_specialized...HEAD` name-only + `git ls-files` + apps inventory | **PASS** |
| 2 | Reception Journey is route/target only | `route: '/journey?tab=home'`, no `external`, Link/navigate only | **PASS** |
| 3 | External Journey repo not vendored | External HEAD `0ab6155` clean; no submodule/dep/apps mirror | **PASS** |

### Overall: **PASS**

---

## Commands / evidence recap

```text
# Merge worktree
cd ...\merge-local-app-surfaces-2026-08-03
git rev-parse HEAD
# → 5a24e94121f2e1872c454cac618e49c2884eb583
git rev-parse onboarding_specialized
# → 7b0b6ae6...
git diff --name-only onboarding_specialized...HEAD
# → reception + ehr-static + docs + audit artifacts; no employee-journey paths
git ls-files "*employee-journey*" "*employee_journey*" "*EmployeeJourney*"
# → (empty)
Test-Path .gitmodules
# → False / ABSENT
Get-ChildItem apps
# → ehr-prototype-static only

# External Journey
cd C:\AI\Git\training\HomeHealth\employee-journey
git rev-parse HEAD
# → 0ab615585e6bd404139003aa10fed1b84a4af5a8
git status -sb
# → ## main...origin/main (clean)
git log -1 --oneline
# → 0ab6155 Polish RN training workflow landing
```

---

## Residual notes (non-blocking)

1. **Naming overlap:** Host SPA “Journey” (`/journey/*`) vs external Employee Journey (5193) can confuse operators. Product docs already mark external Journey as separate; Reception correctly targets the **host** surface.
2. If product later wants Reception → external Employee Journey on **5193**, that would be an **external URL launcher** (same pattern as EHR), **not** a source vendor — and is **out of current merge scope**.
3. Wave-1 tip was `60f17bb5`; current tip includes audit chore commits only. Re-scan at `5a24e941` found **no regression** of Journey separation.
4. Package name of external repo (`site-creator-vinext-starter`) does not appear as a dependency of this host app.

---

## Cross-check vs W1-A11

| W1-A11 claim | W2-QA11 independent status |
| --- | --- |
| Journey repo clean @ `0ab6155` | **Reconfirmed** |
| Merge diff has no employee-journey sources | **Reconfirmed** (including post–wave-1 audit commits) |
| Reception route `/journey?tab=home` internal | **Reconfirmed** |
| Journey target only, not vendored | **Reconfirmed** |

No defects opened. No remediation required for Journey Link QA.

---

*Report authored by W2-QA11 Journey Link QA · independent Wave-2 audit · 2026-08-03*
