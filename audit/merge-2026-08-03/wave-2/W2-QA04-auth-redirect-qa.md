# W2-QA04 — Reception Auth Redirect QA

## Verdict: **PASS**

| Field | Value |
|-------|--------|
| Agent ID | **W2-QA04** |
| Role | Reception Auth Redirect QA (Wave 2, independent) |
| Date | 2026-08-03 |
| Worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Merge UI origin | **`http://127.0.0.1:5201`** (Vite from this worktree; not 5173) |
| Independence | Code + runtime re-verified by this agent. **Does not certify solely on W1-A05** (static-only). W1-A14 browser evidence is supporting, not sole proof. |

---

## Scope

1. **Code:** authenticated root index `Navigate` → `/reception`; `safeRedirect` `BRAD_DEFAULT_ROUTE = '/reception'`; login post-auth uses `safeReturnTo`.
2. **Runtime:** on merge server **5201**, navigate `/` and prove final URL is `/reception` under demo/local auth; screenshot evidence.
3. **Limitations:** document if full Cognito is unavailable; still require code + runtime path proof.

---

## Overall matrix

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 1 | `router.tsx` index `Navigate replace to="/reception"` | **PASS** | Source + static code script |
| 2 | No legacy index defaults (`/dashboard`, `/iadministrator`) | **PASS** | Static code script |
| 3 | `BRAD_DEFAULT_ROUTE = '/reception'` | **PASS** | Source + `safeReturnTo` unit |
| 4 | `safeReturnTo` fallback defaults to `BRAD_DEFAULT_ROUTE` | **PASS** | Source + 12 unit cases |
| 5 | `LoginScreen` post-auth uses `safeReturnTo(returnTo\|from)` | **PASS** | Source static |
| 6 | `RequireAuth` admits `demo` into protected shell | **PASS** | Source static |
| 7 | Runtime: `GET /` → final URL `/reception` on 5201 | **PASS** | Playwright + screenshot |
| 8 | Runtime: reception identity (`data-route="/reception"`, Demo User) | **PASS** | Playwright + screenshot |
| 9 | Full Cognito interactive login E2E | **N/A (limitation)** | Demo bypass used; code path for post-login still proven |

**Gate result: PASS** — required code + runtime path proofs satisfied.

---

## 1. Code proof

### 1.1 Authenticated root index → `/reception`

Absolute path:  
`C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\src\v6\routing\router.tsx`

```28:48:src/v6/routing/router.tsx
export const v6Router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <V6Shell />
      </RequireAuth>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate replace to="/reception" /> },
      ...shellRoutes.map((route) => ({
        path: routeToChildPath(route.path),
        element: routeElement(route),
        errorElement: <RouteErrorBoundary />,
      })),
      {
        path: '*',
        element: <NotFoundScreen />,
      },
    ],
  },
```

Flow when session is authenticated or **demo**:

1. `/` matches protected shell under `RequireAuth`.
2. Index child renders `<Navigate replace to="/reception" />`.
3. Browser lands on `/reception`.

When unauthenticated (production-shaped / no demo): `RequireAuth` sends user to `/login?returnTo=…` (see §1.4). That is expected and not a reception-default regression.

### 1.2 `BRAD_DEFAULT_ROUTE` and `safeReturnTo`

Absolute path:  
`C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\src\v6\utils\safeRedirect.ts`

```9:39:src/v6/utils/safeRedirect.ts
export const BRAD_DEFAULT_ROUTE = '/reception';

/**
 * Validate a candidate redirect target. Returns the candidate if it is a safe
 * internal path, otherwise the fallback. ...
 */
export function safeReturnTo(raw: string | null | undefined, fallback: string = BRAD_DEFAULT_ROUTE): string {
  if (!raw) return fallback;
  // ... open-redirect / login-loop guards ...
  if (pathOnly === '/login' || pathOnly.startsWith('/login/')) return fallback;

  return candidate;
}
```

Post-login default destination is **Reception**, not dashboard or Brad admin.

### 1.3 LoginScreen post-auth redirect

Absolute path:  
`C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\src\v6\screens\pageviews\LoginScreen.tsx`

```49:53:src/v6/screens/pageviews/LoginScreen.tsx
  function redirectAfterAuth() {
    setToastVisible(true);
    const dest = safeReturnTo(searchParams.get('returnTo') ?? searchParams.get('from'));
    window.setTimeout(() => navigate(dest, { replace: true }), 400);
  }
```

- Missing/unsafe `returnTo` / `from` → **`/reception`** via `BRAD_DEFAULT_ROUTE`.
- Safe deep links preserved; external / protocol-relative / login loops rejected.

### 1.4 RequireAuth + local demo bypass (runtime precondition)

Absolute paths:

- `src\auth\RequireAuth.tsx`
- `src\auth\bypass.ts`
- `src\auth\AuthProvider.tsx`

`RequireAuth` admits `status === 'authenticated' | 'demo'`. On **Vite dev** + host `127.0.0.1` / `localhost`, `isDemoAuthBypassEnabled()` is true → demo session → shell mounts → index Navigate to `/reception`.

Deployed / production builds never get demo bypass (absolute production veto + dev-build gate).

### 1.5 Static automation results

Command (from worktree root):

```text
node audit/merge-2026-08-03/evidence/w2-qa04-code-check.mjs
```

Result: **OVERALL=PASS** (10/10 hard checks).  
JSON: `audit/merge-2026-08-03/evidence/W2-QA04-code-check-results.json`

### 1.6 `safeReturnTo` unit results (tsx import of real module)

Command:

```text
npx tsx --tsconfig tsconfig.app.json audit/merge-2026-08-03/evidence/_w2qa04_safe_tmp.mts
```

| Case | Got | Expect |
|------|-----|--------|
| null / undefined / empty / whitespace | `/reception` | `/reception` |
| valid deep `/evidence` | `/evidence` | `/evidence` |
| query preserved | `/library/p-01?tab=x` | same |
| external / protocol-relative / login / backslash / relative | `/reception` | `/reception` |
| `BRAD_DEFAULT_ROUTE` constant | `/reception` | `/reception` |

**OVERALL=PASS** — `audit/merge-2026-08-03/evidence/W2-QA04-safeReturnTo-results.json`

---

## 2. Runtime proof (merge worktree server 5201)

### 2.1 Server identity

| Port | State | Role |
|------|--------|------|
| **5201** | Listen | **Merge worktree Vite** — used for this QA |
| 5173 | Listen | Unrelated/other UI — **not** used as proof |

Preflight: `HTTP 200` from `http://127.0.0.1:5201/`.

### 2.2 Playwright navigation

Command:

```text
node audit/merge-2026-08-03/evidence/w2-qa04-playwright-verify.mjs
```

(Origin default: `MERGE_ORIGIN=http://127.0.0.1:5201`)

| Check | Result | Detail |
|-------|--------|--------|
| Server reachable | PASS | HTTP 200 |
| Navigate `/` final URL | **PASS** | `http://127.0.0.1:5201/reception` |
| Reception identity | **PASS** | `data-route="/reception"` |
| Direct `/reception` | PASS | same origin path + data-route |

`authProbe` after direct load:

```json
{
  "href": "http://127.0.0.1:5201/reception",
  "pathname": "/reception",
  "dataRoute": "/reception",
  "title": "Care Indeed Home Health"
}
```

JSON: `audit/merge-2026-08-03/evidence/W2-QA04-playwright-results.json`

### 2.3 Screenshot evidence

| File | Absolute path | What it shows |
|------|----------------|---------------|
| Root → reception | `...\audit\merge-2026-08-03\evidence\W2-QA04-root-to-reception.png` | After `goto('/')`: Reception chrome (“Reception / SECURE WORKSPACE ENTRY”), **Demo User · Signed in**, workspace launcher (Compliance, Journey, Governing Body, Find Home Care, EHR Prototype) |
| Direct reception | `...\audit\merge-2026-08-03\evidence\W2-QA04-reception-direct.png` | Same surface on explicit `/reception` |

Visual confirmation (root redirect shot): Reception secure workspace entry under **local demo auth** — not login, not dashboard, not `/iadministrator`.

---

## 3. Auth path model (required understanding)

```text
Unauthenticated:
  any protected path → /login?returnTo=<encoded path>
  successful Cognito login → safeReturnTo(returnTo|from) → default /reception

Local Vite dev (127.0.0.1 / localhost):
  demo bypass → status 'demo' → RequireAuth allows shell
  / → index Navigate → /reception   ← runtime proven on 5201
```

Both arms of the default-to-reception contract are covered:

| Arm | Proof method | Status |
|-----|--------------|--------|
| Authenticated/demo root index | Runtime Playwright on 5201 + screenshot | **PASS** |
| Post-login empty/unsafe returnTo | Code + unit (`safeReturnTo` → `/reception`) | **PASS** |
| Full Cognito UI login with real pool user | Not run this wave | Limitation (below) |

---

## 4. Limitations

1. **Full Cognito interactive login not exercised** in this run. Merge UI on `127.0.0.1:5201` is a **Vite dev** host, so demo bypass supplies a signed-in **Demo User** without Cognito credentials.  
   - Runtime proves: `/` → `/reception` under **demo/local auth**.  
   - Post-login default is proven by **code + pure unit tests**, not by typing a real Cognito password in the browser.  
   - This meets the assignment bar (“document limitations if full Cognito auth not available, but require code+runtime path proof”).

2. **Production / CloudFront hosts** will not use demo bypass. On those hosts, unauthenticated `/` goes to login; after real auth, empty/safe fallback is still `/reception` via `BRAD_DEFAULT_ROUTE`. That production session hop was not browser-tested here.

3. **Stale helper (informational, non-blocking for this gate):**  
   `scripts/verifyBradDefaultHomeNav.ts` still asserts index/default → **`/iadministrator`** and `safeReturnTo(null) === '/iadministrator'`.  
   That script is **out of date** vs merged reception default. It was **not** used as the pass criterion. Recommend a follow-up to retarget the script to `/reception` so CI does not drift.

4. Independence note: W1-A05 was static-only (no runtime). This agent re-read sources and ran independent Playwright on 5201; did not rubber-stamp W1-A05.

---

## 5. Commands executed (reproducible)

```text
# From merge worktree root
node audit/merge-2026-08-03/evidence/w2-qa04-code-check.mjs
npx tsx --tsconfig tsconfig.app.json audit/merge-2026-08-03/evidence/_w2qa04_safe_tmp.mts
node audit/merge-2026-08-03/evidence/w2-qa04-playwright-verify.mjs
```

Optional: `MERGE_ORIGIN=http://127.0.0.1:5201` (default already).

---

## 6. Evidence index

| Artifact | Path |
|----------|------|
| This report | `audit/merge-2026-08-03/wave-2/W2-QA04-auth-redirect-qa.md` |
| Code check JSON | `audit/merge-2026-08-03/evidence/W2-QA04-code-check-results.json` |
| safeReturnTo unit JSON | `audit/merge-2026-08-03/evidence/W2-QA04-safeReturnTo-results.json` |
| Playwright JSON | `audit/merge-2026-08-03/evidence/W2-QA04-playwright-results.json` |
| Screenshot (root → reception) | `audit/merge-2026-08-03/evidence/W2-QA04-root-to-reception.png` |
| Screenshot (direct reception) | `audit/merge-2026-08-03/evidence/W2-QA04-reception-direct.png` |
| Scripts | `audit/merge-2026-08-03/evidence/w2-qa04-code-check.mjs`, `w2-qa04-playwright-verify.mjs`, `_w2qa04_safe_tmp.mts` |

### Source files inspected

| File | Absolute path |
|------|----------------|
| router | `...\src\v6\routing\router.tsx` |
| safeRedirect | `...\src\v6\utils\safeRedirect.ts` |
| LoginScreen | `...\src\v6\screens\pageviews\LoginScreen.tsx` |
| RequireAuth | `...\src\auth\RequireAuth.tsx` |
| bypass | `...\src\auth\bypass.ts` |
| routeRegistry | `...\src\v6\routing\routeRegistry.ts` |

---

## 7. Final certification

**W2-QA04: PASS**

- Code: index `Navigate` → `/reception`; `BRAD_DEFAULT_ROUTE = '/reception'`; login `safeReturnTo` default chain intact.  
- Runtime: on **`http://127.0.0.1:5201`**, `/` resolves to **`/reception`** under demo/local auth, with screenshot + `data-route` identity.  
- Cognito full E2E limited as documented; not a gate failure for this assignment.

Signed: Wave 2 QA Agent **W2-QA04** (independent reception auth redirect QA).
