# W2-QA03 — Reception Route QA

| Field | Value |
|-------|--------|
| **Agent** | W2-QA03 (Reception Route QA) |
| **Wave** | 2 |
| **Worktree** | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| **Branch** | `codex/merge-local-app-surfaces-2026-08-03` |
| **Commit** | `5a24e94121f2e1872c454cac618e49c2884eb583` (`5a24e941 chore(audit): complete wave-1 reports gate and remaining browser evidence`) |
| **Date (UTC)** | 2026-08-03 |
| **Verdict** | **PASS** |

**PASS criteria (all required):**

1. Code wiring: `routeRegistry` → `RepresentativeScreens` → `ReceptionScreen`
2. Browser against merge Vite on **5201** with merge-worktree cmdline
3. Playwright visible identity on `/reception` (Compliance, Journey, Find Home Care, EHR Prototype + Workspace launcher)
4. Screenshot evidence; **HTTP 200 alone is not sufficient**

---

## 1. Code wiring audit

### 1.1 `routeRegistry` — `/reception` registered

**File:** `src/v6/routing/routeRegistry.ts`

```47:47:src/v6/routing/routeRegistry.ts
  { path: '/reception', hashId: 'reception', template: 'reception', group: 'System', title: 'Reception', description: 'Secure post-login workspace launcher for Care Indeed products.' },
```

Related System routes also present:

| Path | hashId | template |
|------|--------|----------|
| `/reception` | `reception` | `reception` |
| `/find-home-care` | `find-home-care` | `prototype` |
| `/ehr-prototype` | `ehr-prototype` | `prototype` |

(lines 141–142 in the same file)

**Result:** PASS

### 1.2 `router.tsx` — registry drives routes; index → reception

**File:** `src/v6/routing/router.tsx`

- Shell children built from `V6_ROUTES` via `RepresentativeScreen`
- Authenticated index: `Navigate` → `/reception`

```38:43:src/v6/routing/router.tsx
      { index: true, element: <Navigate replace to="/reception" /> },
      ...shellRoutes.map((route) => ({
        path: routeToChildPath(route.path),
        element: routeElement(route),
        errorElement: <RouteErrorBoundary />,
      })),
```

**Result:** PASS

### 1.3 `RepresentativeScreens` — hashId cases

**File:** `src/v6/screens/RepresentativeScreens.tsx`

| hashId | Screen component |
|--------|------------------|
| `reception` | `<ReceptionScreen />` |
| `find-home-care` | `<FindHomeCareScreen />` |
| `ehr-prototype` | `<EhrPrototypeScreen />` |

```1670:1672:src/v6/screens/RepresentativeScreens.tsx
    case 'reception':
      child = <ReceptionScreen />;
      break;
```

```1724:1728:src/v6/screens/RepresentativeScreens.tsx
    case 'find-home-care':
      child = <FindHomeCareScreen />;
      break;
    case 'ehr-prototype':
      child = <EhrPrototypeScreen />;
      break;
```

Export path: `pageviews/index.ts` re-exports `ReceptionScreen`, `FindHomeCareScreen`, `EhrPrototypeScreen` from `./ReceptionScreen`.

**Result:** PASS

### 1.4 `ReceptionScreen` — workspace launcher definition

**File:** `src/v6/screens/pageviews/ReceptionScreen.tsx`

`WORKSPACES` includes the four required launcher products (plus Governing Body):

| id | name | route | status |
|----|------|-------|--------|
| `compliance` | Compliance | `/compliance` | available |
| `journey` | Journey | `/journey?tab=home` | available |
| `governing-body` | Governing Body | `/governance` | restricted |
| `find-home-care` | Find Home Care | `/find-home-care` | prototype |
| `ehr-prototype` | EHR Prototype | `http://127.0.0.1:5191` (external) | prototype |

UI identity markers on the root shell:

- `data-route="/reception"`
- `data-template="reception"`
- `data-hash-id="reception"`
- Copy: **"Workspace launcher"** / **"Choose where you are working today"**

### 1.5 Chrome-free shell for reception

**File:** `src/v6/shell/V6Shell.tsx`

```67:78:src/v6/shell/V6Shell.tsx
  const isReceptionRoute = pathname === '/reception';
  // ...
  const isChromeFreeRoute = isPlayerRoute || isDocumentPrintRoute || isPersonalProfileRoute || isReceptionRoute || isEmbedRequest || isPolicyDetailRoute;
```

Reception renders without main app chrome (sidebar/top dock), matching a dedicated workspace entry surface.

**Result:** PASS (code)

### 1.6 Default route alignment

- `src/v6/utils/safeRedirect.ts`: `BRAD_DEFAULT_ROUTE = '/reception'`
- Router index redirect: `/` → `/reception`

---

## 2. Dev server (merge Vite :5201)

| Field | Value |
|-------|--------|
| **Reused existing?** | **Yes** — already listening; cmdline confirmed merge worktree |
| **PID** | `43072` (`node.exe` vite process) |
| **Parent / launch** | `pwsh` → `npx vite --host 127.0.0.1 --port 5201 --strictPort` from this worktree (`CreationDate` 2026-08-03 1:32:09 PM local) |
| **CommandLine** | `"node" "…\merge-local-app-surfaces-2026-08-03\node_modules\.bin\..\vite\bin\vite.js" --host 127.0.0.1 --port 5201 --strictPort` |
| **Bind** | `127.0.0.1:5201` (LISTENING) |
| **Branch** | `codex/merge-local-app-surfaces-2026-08-03` |
| **Commit** | `5a24e94121f2e1872c454cac618e49c2884eb583` |
| **Started by this agent?** | No — reused verified merge instance |

**HTTP probe (not identity):** `GET http://127.0.0.1:5201/reception` → **200**, SPA shell length ~1061 bytes. Per gate rules, **HTTP 200 alone would FAIL**; browser identity proof required (section 3).

---

## 3. Playwright browser proof

### 3.1 Method

| Item | Detail |
|------|--------|
| Script | `audit/merge-2026-08-03/evidence/w2-qa03-reception-playwright.mjs` |
| Origin | `http://127.0.0.1:5201` |
| Route | `/reception` |
| Tool | Playwright Chromium (headless), viewport 1440×900 |
| Auth | Local Vite **demo bypass** on `127.0.0.1` — lands on Reception without Cognito login |
| Results JSON | `audit/merge-2026-08-03/evidence/W2-QA03-reception-playwright-results.json` |
| Screenshot | `audit/merge-2026-08-03/evidence/W2-QA03-reception.png` (~224 KB, full page) |

### 3.2 Check matrix

| Check ID | Result | Detail |
|----------|--------|--------|
| `http-status` | PASS | GET /reception → HTTP 200 *(informational only)* |
| `auth-demo-or-session` | PASS | Final URL `http://127.0.0.1:5201/reception` (no `/login`) |
| `reception-visible-identity` | **PASS** | 6/6 tokens: Reception, Workspace launcher, Compliance, Journey, Find Home Care, EHR Prototype |
| `launcher-card-compliance` | PASS | Heading visible: Compliance |
| `launcher-card-journey` | PASS | Heading visible: Journey |
| `launcher-card-find-home-care` | PASS | Heading visible: Find Home Care |
| `launcher-card-ehr-prototype` | PASS | Heading visible: EHR Prototype |
| `workspace-launcher-label` | PASS | Launcher H2 "Choose where you are working today" (DOM `innerText` surfaces CSS-uppercased "WORKSPACE LAUNCHER"; `getByText` still matches Workspace launcher) |
| `dom-route-markers` | PASS | `data-route=/reception` ×1; `data-template=reception` ×1; `data-hash-id=reception` ×1 |
| `ehr-external-href-5191` | PASS | Anchor `href=http://127.0.0.1:5191` count=1 |
| `screenshot-written` | PASS | `W2-QA03-reception.png` written |

**Console errors:** none recorded.

**overall:** `PASS`

### 3.3 Visible identity (screenshot description)

Screenshot `W2-QA03-reception.png` shows the full Reception workspace launcher:

- **Header:** Care Indeed mark, **Reception** / "SECURE WORKSPACE ENTRY", Brad search, Demo User signed in
- **Welcome rail:** "Good afternoon", Administrator, continue `/compliance`
- **Workspace launcher** section with cards:
  1. **Compliance** — Available — Open Compliance → `/compliance`
  2. **Journey** — Available — Open Journey → `/journey?tab=home`
  3. **Governing Body** — Authorized — Enter Governance → `/governance`
  4. **Find Home Care** — Prototype — Open Finder → `/find-home-care`
  5. **EHR Prototype** — Prototype — Open EHR → `http://127.0.0.1:5191`
- Footer: Systems nominal; Request access / Support / Brad

This is **product identity**, not an empty SPA shell.

### 3.4 Body text snippet (machine extract)

```
Reception
SECURE WORKSPACE ENTRY
…
WORKSPACE LAUNCHER
Choose where you are working today
…
AVAILABLE
Compliance
…
AVAILABLE
Journey
…
PROTOTYPE
Find Home Care
…
PROTOTYPE
EHR Prototype
… http://127.0.0.1:5191 …
```

---

## 4. Gate evaluation

| Requirement | Met? | Evidence |
|-------------|------|----------|
| `routeRegistry` wires `/reception` | Yes | §1.1 |
| `RepresentativeScreens` renders `ReceptionScreen` | Yes | §1.3 |
| `ReceptionScreen` implements launcher | Yes | §1.4 |
| Vite on 5201 is **this** merge worktree | Yes | PID 43072 cmdline §2 |
| Branch / commit documented | Yes | header + §2 |
| `/reception` shows Workspace launcher | Yes | Playwright + PNG |
| Cards: Compliance, Journey, Find Home Care, EHR Prototype | Yes | all headings visible |
| Screenshot path exact | Yes | `audit/merge-2026-08-03/evidence/W2-QA03-reception.png` |
| HTTP 200 alone rejected as pass condition | Yes | identity checks required and passed |

---

## 5. Artifacts

| Artifact | Absolute path |
|----------|----------------|
| This report | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\audit\merge-2026-08-03\wave-2\W2-QA03-reception-route-qa.md` |
| Screenshot | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\audit\merge-2026-08-03\evidence\W2-QA03-reception.png` |
| Playwright results | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\audit\merge-2026-08-03\evidence\W2-QA03-reception-playwright-results.json` |
| Repro script | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\audit\merge-2026-08-03\evidence\w2-qa03-reception-playwright.mjs` |

### Reproduce

```powershell
cd C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03
# Ensure merge vite: npx vite --host 127.0.0.1 --port 5201 --strictPort
node audit/merge-2026-08-03/evidence/w2-qa03-reception-playwright.mjs
```

---

## 6. Notes / non-blockers

- Demo auth on local Vite DEV means unauthenticated Cognito behavior is not exercised here (same posture as W1-A14).
- EHR launcher primary target is external `http://127.0.0.1:5191`; in-app `/ehr-prototype` remains a separate registry route/prototype shell.
- CSS `uppercase` on the launcher eyebrow makes `body.innerText` report `WORKSPACE LAUNCHER`; Playwright `getByText` (case-insensitive) still matched `Workspace launcher`.

---

## 7. Final verdict

# **PASS**

Reception route is fully wired (registry → router → `RepresentativeScreen` → `ReceptionScreen`), served from merge Vite **PID 43072** on **127.0.0.1:5201**, and **visibly** presents the Reception workspace launcher with **Compliance**, **Journey**, **Find Home Care**, and **EHR Prototype**, proven by Playwright identity checks and screenshot `W2-QA03-reception.png`.
