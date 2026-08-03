# W1-A10 — Connect Repo Analyst

| Field | Value |
| --- | --- |
| Agent | Wave 1 / **W1-A10** (Connect Repo Analyst) |
| Date | 2026-08-03 |
| Merge worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Connect repo (read-only) | `C:\AI\Git\training\HomeHealth\connect` |
| **Verdict** | **PASS** — Connect stays separate; no Connect app source in merge branch |

---

## 1. Executive summary

Connect is a **separate Sites/Vite app** at `...\connect` (package name `care-indeed-community`). Its only outstanding local change is a **dirty** edit to `app/community-app.tsx` that makes the portal **Journey** toggle point at local port **5193** when running on `localhost` / `127.0.0.1`.

That change (and all Connect source) **must remain in the Connect repo**. Inspection of the merge worktree confirms:

1. `git diff --name-only 7b0b6ae6..HEAD` lists **no** Connect app source files.
2. There is **no** `connect/` tree, no `community-app.tsx`, and no Connect portal implementation under the policy merge worktree (aside from inventory *documentation* that explicitly says Connect is external).
3. Inventory already records Connect/Journey as intentionally excluded.

**Do not copy Connect into the Policies_and_Procedures merge branch.**

---

## 2. Connect repo inspection

### 2.1 Branch / commit / dirty state

| Field | Value |
| --- | --- |
| Path | `C:\AI\Git\training\HomeHealth\connect` |
| Branch | `connect` (tracking `origin/connect`) |
| HEAD (short) | `305ae2e` |
| HEAD (full) | `305ae2ee1e8d4993427c919323004e3595e67844` |
| HEAD message | `chore: checkpoint Connect app` |
| AuthorDate | 2026-08-03 12:08:35 -0700 |
| Working tree | **Dirty** — only `app/community-app.tsx` modified |
| Diffstat (dirty) | `app/community-app.tsx` \| **+18 / −3** (21 lines changed) |
| Package name | `care-indeed-community` `0.1.0` |
| Stack | Vite + vinext / Cloudflare Sites; Next 16 / React 19 deps present |
| Remote | `origin` → `https://git.chatgpt-team.site/.../appgprj_6a684808ff288191a7f94807d0cbc49e.git` |

Recent commits (context):

| Commit | Message |
| --- | --- |
| `305ae2e` | chore: checkpoint Connect app |
| `9353b09` | Align Connect with Journey and add portal toggle |
| `42d140b` | Rebrand Community as Connect and restore social connections |
| `48d58c4` | Fix lazy Community storage binding |
| `62b8b4b` | Add durable Community communication records |

Portal toggle was introduced at **`9353b09`** (`PortalModeSwitcher` + Journey link). The **local dirty** change is a follow-up that makes that link environment-aware (prod URL vs local **:5193**).

### 2.2 Dirty `app/community-app.tsx` — Journey toggle → 5193

**Committed HEAD behavior** (`305ae2e`): hard-coded production Journey URL:

```ts
const JOURNEY_HREF =
  "https://care-indeed-employee-journey.teejay1784.chatgpt.site/journey/training?persona=taylor-rn";
// PortalModeSwitcher uses <a href={JOURNEY_HREF}>Journey</a>
```

**Working tree (dirty) behavior**: resolve Journey href by host; local → port **5193**:

```ts
const JOURNEY_PATH = "/journey/training?persona=taylor-rn";
const PRODUCTION_JOURNEY_HREF =
  `https://care-indeed-employee-journey.teejay1784.chatgpt.site${JOURNEY_PATH}`;

function resolveJourneyHref() {
  if (typeof window === "undefined") return PRODUCTION_JOURNEY_HREF;
  const { hostname, protocol } = window.location;
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return `${protocol}//${hostname}:5193${JOURNEY_PATH}`;
  }
  return PRODUCTION_JOURNEY_HREF;
}
```

`PortalModeSwitcher` uses React state + `useEffect` to set `journeyHref` from `resolveJourneyHref()` after mount (SSR-safe default = production URL).

| Local surface (inventory) | URL |
| --- | --- |
| Connect | `http://127.0.0.1:5192/` |
| Journey (toggle target) | `http://127.0.0.1:5193/journey/training?persona=taylor-rn` |

**Ownership:** this dirty file lives only under `C:\AI\Git\training\HomeHealth\connect\app\community-app.tsx`. It is **not** present in the policy merge worktree. Any commit of this change belongs on the Connect `connect` branch / Sites project, not on `codex/merge-local-app-surfaces-2026-08-03`.

### 2.3 Connect tree shape (not part of policy repo)

Top-level Connect layout (excerpt): `app/` (`community-app.tsx`, `page.tsx`, `layout.tsx`, `api/`, …), `build/`, `db/`, `worker/`, `vite.config.ts`, `package.json`, Sites/Wrangler runtime dirs. Separate git root from Policies_and_Procedures_V2.

---

## 3. Merge worktree: `git diff --name-only 7b0b6ae6..HEAD`

### 3.1 Context

| Field | Value |
| --- | --- |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| HEAD | `60f17bb58bc7f14781dbf5557cc205be04624131` (`60f17bb5` docs: add build/QA results to merge inventory) |
| Base | `7b0b6ae68456aa4aa353a69009ea3465767e48ec` — `Update onboarding modules and DON visuals` |
| File count in range | **32** paths |

### 3.2 Full name-only list (32 paths)

```
MERGE_INVENTORY_2026-08-03.md
apps/ehr-prototype-static/README.md
apps/ehr-prototype-static/assets/_vinext_fonts/... (10 font files)
apps/ehr-prototype-static/assets/framework-CXnKph_e.js
apps/ehr-prototype-static/assets/index-B6csGzFL.css
apps/ehr-prototype-static/assets/index-CcITSQVe.js
apps/ehr-prototype-static/assets/layout-segment-context-CXNA_Ckw.js
apps/ehr-prototype-static/assets/page-DYDiOo50.js
apps/ehr-prototype-static/assets/query-D8Wk3mvj.js
apps/ehr-prototype-static/assets/rolldown-runtime-S-ySWqyJ.js
apps/ehr-prototype-static/favicon.svg
apps/ehr-prototype-static/index.html
docs/ehr-development-inventory.md
docs/ehr-uiux-discovery-plan.md
src/auth/apiClient.ts
src/v6/routing/routeRegistry.ts
src/v6/routing/router.tsx
src/v6/screens/RepresentativeScreens.tsx
src/v6/screens/pageviews/ReceptionScreen.tsx
src/v6/screens/pageviews/index.ts
src/v6/shell/V6Shell.tsx
src/v6/utils/safeRedirect.ts
```

### 3.3 Connect filter result

| Check | Result |
| --- | --- |
| Paths matching `connect` / `community-app` / Connect app source | **None** |
| `connect/` directory in worktree | **Absent** |
| `community-app.tsx` anywhere in worktree (non-`node_modules`) | **None** |
| `PortalModeSwitcher` / `resolveJourneyHref` / `care-indeed-community` in tree | **Only** inventory prose in `MERGE_INVENTORY_2026-08-03.md` |
| Mentions of ports 5192 / 5193 in merge branch | Inventory reference only (not app source); unrelated **§5193** Cal/OSHA BBP citations exist in policy seed data and are **not** Connect |

**Confirmed:** `git diff --name-only 7b0b6ae6..HEAD` contains **NO Connect app source files.**

What *is* in the range: reception/V6 shell routes, static EHR prototype mirror under `apps/ehr-prototype-static/`, EHR docs, and the merge inventory markdown.

---

## 4. Intentional separation (do not copy)

Aligned with `MERGE_INVENTORY_2026-08-03.md`:

| Item | Inventory stance | W1-A10 confirmation |
| --- | --- | --- |
| Connect repo (`...\connect`) | “Separate Sites source; Journey toggle stays there” | Confirmed separate git root; dirty Journey/5193 toggle only there |
| Connect / Journey sources in diff | “**Not included**” | Confirmed empty filter on name-only list |
| Connect URL | `http://127.0.0.1:5192/` | Documented; not vendored |
| Journey URL | `http://127.0.0.1:5193/journey/training?persona=taylor-rn` | Toggle target in Connect dirty file; Journey is its own repo |

### Why Connect must stay separate

1. **Different product/repo** — Sites Connect app vs Policies_and_Procedures Vite policy app; different remotes, build (`vinext`/Wrangler vs `tsc -b && vite build`), and runtime ports.
2. **Dirty local-only DX change** — `resolveJourneyHref()` → `:5193` is Connect UX wiring; merging it into the policy branch would invent a false dependency and risk wrong packaging.
3. **Merge method was pure file COPY** of reception + EHR static + docs — Connect was never a source for that copy set.
4. **Inventory already forbids inclusion** under “Intentionally excluded.”

**Directive for later waves:** do **not** copy `app/community-app.tsx` (or any Connect `app/`, `worker/`, `db/`, Sites config) into this policy merge worktree. Leave Connect commits on the Connect branch.

---

## 5. Evidence commands (reproducible)

```powershell
# Connect
cd C:\AI\Git\training\HomeHealth\connect
git rev-parse HEAD
git rev-parse --abbrev-ref HEAD
git status -sb
git diff --stat app/community-app.tsx
git diff app/community-app.tsx

# Merge worktree
cd C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03
git rev-parse HEAD
git rev-parse --abbrev-ref HEAD
git diff --name-only 7b0b6ae6..HEAD
git diff --name-only 7b0b6ae6..HEAD | Where-Object { $_ -match 'connect|community-app' }
```

Observed filter output for connect-ish paths: **empty**.

---

## 6. Verdict matrix

| Criterion | Status |
| --- | --- |
| Inspect Connect branch/commit | **Done** — `connect` @ `305ae2e` |
| Inspect dirty Journey toggle (5193) | **Done** — dirty `app/community-app.tsx` only; local → `:5193` |
| `7b0b6ae6..HEAD` has no Connect app source | **PASS** |
| Connect changes remain separate (not copied into policy repo) | **PASS** |

### Final result

# **PASS**

Connect stays separate. No action required on the merge branch for Connect. Any follow-up for the Journey-on-5193 toggle is **Connect-repo-only** (commit/PR on `connect`, not on `codex/merge-local-app-surfaces-2026-08-03`).

---

## 7. Report location

`audit/merge-2026-08-03/wave-1/W1-A10-connect-repo-analyst.md`
