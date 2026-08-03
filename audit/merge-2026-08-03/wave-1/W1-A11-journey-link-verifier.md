# W1-A11 — Journey Link Verifier

| Field | Value |
| --- | --- |
| Agent | Wave 1 / **W1-A11** (Journey Link Verifier) |
| Date | 2026-08-03 |
| Merge worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Merge branch | `codex/merge-local-app-surfaces-2026-08-03` @ `60f17bb5` |
| Merge base (documented) | `onboarding_specialized` @ `7b0b6ae6` |
| Journey repo (read-only) | `C:\AI\Git\training\HomeHealth\employee-journey` |
| Expected Journey commit | `0ab6155` |
| **Verdict** | **PASS** — separation holds |

---

## Summary

The external **Employee Journey** repo is clean at the expected tip (`0ab6155`). The merge-branch delta (vs `onboarding_specialized`) contains **no** `employee-journey` source trees, no Journey submodule, and no Journey package dependency. Reception’s Journey workspace is an **in-app SPA route** (`/journey?tab=home`) only — not a vendored copy of the separate Employee Journey app, and not an external handoff like EHR (`http://127.0.0.1:5191`).

---

## 1. Journey repo clean @ expected commit

| Check | Result | Evidence |
| --- | --- | --- |
| Working tree | **Clean** | `git status`: `nothing to commit, working tree clean`; porcelain empty |
| Branch | `main` (up to date with `origin/main`) | `git status -sb` / `git branch -v` |
| HEAD | **`0ab615585e6bd404139003aa10fed1b84a4af5a8`** | matches expected short SHA **`0ab6155`** |
| Tip message | `Polish RN training workflow landing` | `git log -1 --oneline` |
| Expected SHA resolves | Yes | `git rev-parse 0ab6155` → full hash above |

### Journey repo identity (for separation context)

- Path: `C:\AI\Git\training\HomeHealth\employee-journey`
- Package name: `site-creator-vinext-starter` (vinext / Next-style Sites app)
- App surface lives under `app/journey/` (portal + player routes) — **outside** the merge worktree
- Inventory reference URL (not launched from Reception in this merge):  
  `http://127.0.0.1:5193/journey/training?persona=taylor-rn`  
  (documented in `MERGE_INVENTORY_2026-08-03.md` as **separate repo**)

**Conclusion (1):** PASS — Journey repo is clean at expected commit `0ab6155`.

---

## 2. Merge branch diff has no employee-journey source files

Compared: `onboarding_specialized...HEAD` (the documented merge base for this worktree).

### Merge-only commits

| Commit | Message |
| --- | --- |
| `79f25bd4` | feat(reception): add post-login reception launcher and EHR handoff |
| `2aca52cf` | docs(ehr): add development inventory and UI/UX discovery plan |
| `e0c678ed` | chore(apps): vendor static EHR prototype mirror for local 5191 handoff |
| `5af4f6fd` | docs: record local app surfaces merge inventory 2026-08-03 |
| `60f17bb5` | docs: add build/QA results to merge inventory |

### Files changed on merge branch (complete set)

- `MERGE_INVENTORY_2026-08-03.md`
- `apps/ehr-prototype-static/**` (static EHR mirror only)
- `docs/ehr-development-inventory.md`
- `docs/ehr-uiux-discovery-plan.md`
- Reception wiring:  
  `src/auth/apiClient.ts`,  
  `src/v6/routing/routeRegistry.ts`,  
  `src/v6/routing/router.tsx`,  
  `src/v6/screens/RepresentativeScreens.tsx`,  
  `src/v6/screens/pageviews/ReceptionScreen.tsx`,  
  `src/v6/screens/pageviews/index.ts`,  
  `src/v6/shell/V6Shell.tsx`,  
  `src/v6/utils/safeRedirect.ts`

### Negative checks (no Journey vendor)

| Check | Result |
| --- | --- |
| `git diff --name-only onboarding_specialized...HEAD` matches `employee-journey` / `connect` | **None** |
| `git ls-files '*employee-journey*' '*employee_journey*'` | **Empty** |
| `.gitmodules` | **Absent** |
| `package.json` dependency on employee-journey / journey package | **None** |
| `apps/` contents | **`ehr-prototype-static` only** (no journey app mirror) |
| Inventory claim “Connect / Journey sources in diff \| Not included” | **Confirmed** |

### Note: host `src/policy/journey` is **not** this merge’s Employee Journey copy

The host app already contains an **in-repo** onboarding LMS under `src/policy/journey` (routes `/journey/*` in `routeRegistry.ts`). That tree:

- is **not** introduced by the five merge commits above (not in `onboarding_specialized...HEAD` file list);
- is **not** a path-named vendor of `C:\AI\Git\training\HomeHealth\employee-journey`;
- is a different product surface (Policies & Procedures onboarding modules) from the external vinext Employee Journey app (`app/journey/*` on Sites).

W1-A11 scope is **Employee Journey repo separation** for the local-app-surfaces merge: **no employee-journey sources in the merge delta** — **confirmed**.

**Conclusion (2):** PASS — merge branch diff has no employee-journey source files.

---

## 3. ReceptionScreen Journey workspace route (target documented)

**File:** `src/v6/screens/pageviews/ReceptionScreen.tsx`

### Workspace definition

| Field | Value |
| --- | --- |
| Workspace id | `journey` |
| Name | `Journey` |
| Description | Onboarding, training, role paths, certificates, policy attestation, and employee evidence. |
| **Route target** | **`/journey?tab=home`** |
| `external` flag | **unset / false** (internal) |
| Status | `available` |
| CTA | `Open Journey` |
| Accent / icon | orange / `GraduationCap` |

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

### Navigation behavior

| Path | Behavior for Journey |
| --- | --- |
| Card click | React Router `<Link to={lastRoute}>` (internal) — **not** `<a target="_blank">` |
| Command palette | `navigate(workspace.lastRoute)` — **not** `window.open` |
| Contrast: EHR Prototype | `route: 'http://127.0.0.1:5191'`, `external: true` → new tab |

Relevant branch points:

- External cards use `workspace.external` → `<a href=… target="_blank">` / `window.open(…, '_blank', 'noopener,noreferrer')`
- Journey does **not** set `external`, so it stays SPA-internal

### Host route registry alignment

`src/v6/routing/routeRegistry.ts` registers host onboarding routes including:

- `/journey` (overview)
- `/journey/new-hire`, `/journey/module/:moduleId`, `/journey/appendix-f`, `/journey/supervisor`, `/journey/admin`, etc.

`navigationManifest.ts` also uses `to: '/journey?tab=home'` for Training / Journey nav.

Reception’s target is therefore the **same internal host Journey surface**, not `http://127.0.0.1:5193/...`.

**Conclusion (3):** Journey workspace target is **internal route `/journey?tab=home`**.

---

## 4. Journey is target URL/route only — not vendored source

| Claim | Status | Notes |
| --- | --- | --- |
| Reception opens Journey via route string only | **Yes** | `'/journey?tab=home'` |
| No copy of `employee-journey` into merge tree | **Yes** | No paths / apps / submodule |
| No merge of Employee Journey app sources | **Yes** | Inventory: “Employee Journey repo \| Clean reference target only” |
| External Employee Journey remains separate | **Yes** | Documented local URL on **5193**; Connect may deep-link there; **not** part of this branch |
| Only vendored local surface in merge | EHR static | `apps/ehr-prototype-static` @ 5191 (`external: true`) |

**Conclusion (4):** PASS — Employee Journey is a **target URL/route concern** (in Reception: internal `/journey?tab=home`; as external Sites app: separate repo @ `0ab6155`, not vendored).

---

## Separation matrix

| Surface | In merge branch? | How Reception reaches it |
| --- | --- | --- |
| Compliance | Host app (pre-existing) | Internal `/compliance` |
| **Journey (host onboarding LMS)** | Host app (pre-existing `src/policy/journey`) | **Internal `/journey?tab=home`** |
| **Employee Journey (external repo)** | **No — excluded** | **Not linked from Reception in this merge**; inventory-only reference `http://127.0.0.1:5193/...` |
| Governing Body | Host app | Internal `/governance` |
| Find Home Care | Host app | Internal `/find-home-care` |
| EHR Prototype | **Vendored static** `apps/ehr-prototype-static` | **External** `http://127.0.0.1:5191` |

---

## PASS / FAIL criteria

| # | Criterion | Result |
| --- | --- | --- |
| 1 | Journey repo clean at expected commit `0ab6155` if possible | **PASS** |
| 2 | Merge branch diff has no employee-journey source files | **PASS** |
| 3 | ReceptionScreen Journey route documented | **PASS** → `/journey?tab=home` (internal) |
| 4 | Journey is target URL/route only, not vendored source | **PASS** |

### Overall: **PASS**

Separation holds: the merge does not vendor the Employee Journey repo; Reception links Journey as an in-app route only.

---

## Commands / evidence recap

```text
# Journey repo
cd C:\AI\Git\training\HomeHealth\employee-journey
git rev-parse HEAD
# → 0ab615585e6bd404139003aa10fed1b84a4af5a8
git status
# → clean, main == origin/main, tip "Polish RN training workflow landing"

# Merge worktree
cd ...\merge-local-app-surfaces-2026-08-03
git log --oneline onboarding_specialized..HEAD
# → 60f17bb5, 5af4f6fd, e0c678ed, 2aca52cf, 79f25bd4
git diff --name-only onboarding_specialized...HEAD
# → reception + ehr-static + docs only (no employee-journey)
git ls-files "*employee-journey*"
# → (empty)
```

---

## Residual notes (non-blocking)

1. **Two “Journey” concepts exist:** host `src/policy/journey` (SPA `/journey/*`) vs external `employee-journey` (Sites app, inventory port 5193). This merge intentionally leaves the external app out; Reception currently points at the **host** surface.
2. If product intent later becomes “Reception → external Employee Journey on 5193,” that would be an **external** launcher change (pattern already used by EHR), not a vendor of source — still out of current merge scope.
3. Diff vs `main...HEAD` is noisy for this audit because the merge base is `onboarding_specialized`, not `main`. Always use `onboarding_specialized...HEAD` for merge-scope file lists.

---

*Report authored by W1-A11 Journey Link Verifier · 2026-08-03*
