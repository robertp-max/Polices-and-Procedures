# Auth Failure — Vercel Build-Time Env Var Not Picked Up + Wildcard Rewrite 405

**Component**: Authentication / Vercel Deployment  
**Severity**: P0 — blocks all demo and testing  
**Status**: Unresolved as of 2026-05-14  

---

## 1. Symptoms Reported by User

Transcript source: `c2cb5aee-5cc3-45c8-8c81-93f291ebace1`

> *"The Rebuild button is failing in production with HTTP 405 and the UI shows:*  
> *- Brad Internal Corpus: error*  
> *- Brad Inference Engine: unreachable*  
> *- Rebuild failed: HTTP 405"*

- Application deployed to Vercel fails to authenticate any user
- Login form submits, then either loops back to login or shows a blank/error screen
- `robertp@careindeed.com` cannot log in despite being a valid demo user
- Issue persists after setting `VITE_LOCAL_DEMO_AUTH_BYPASS=true` in Vercel dashboard
- `/api/*` routes return HTTP 405 Method Not Allowed in production

---

## 2. Prior Attempted Fixes

1. Added `VITE_LOCAL_DEMO_AUTH_BYPASS=true` to Vercel project environment variables via the Vercel dashboard
2. Ran `vercel redeploy` on the existing deployment URL
3. Agent declared fix complete after confirming variable was present in dashboard settings

All prior fixes: **CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION** — no browser login test was performed.

---

## 3. Root Cause 1: Vite Build-Time Constant

`VITE_LOCAL_DEMO_AUTH_BYPASS` is a **Vite build-time constant**, not a runtime environment variable. Vite processes `import.meta.env.*` references during the build step and replaces them with literal values in the output JavaScript bundle.

Code in `src/auth/AuthProvider.tsx`:

```typescript
const LOCAL_DEMO_AUTH_BYPASS = import.meta.env.VITE_LOCAL_DEMO_AUTH_BYPASS === 'true';
```

`vercel redeploy` **reuses the existing compiled build artifact** — it does not trigger a new Vite build. The old bundle contains the literal `false` baked in when the env var was absent. Setting the variable in Vercel's dashboard after the build has no effect on the already-compiled JavaScript.

---

## 4. Root Cause 2: vercel.json Wildcard Rewrite Kills All API Routes

Transcript source: `c2cb5aee-5cc3-45c8-8c81-93f291ebace1` — assistant analysis:

> *"Root cause found immediately: `vercel.json` has a wildcard rewrite `"/(.*)" → "/index.html"`. This means EVERY request including `/api/ia/index/rebuild` gets rewritten to the static `index.html` file. The static server serves `index.html` for `/api/ia/index/rebuild` but with method POST, the static file server returns 405 (Method Not Allowed) because it only supports GET."*

The `vercel.json` wildcard rewrite:
```json
{ "source": "/(.*)", "destination": "/index.html" }
```

This pattern matches **every** path — including `/api/ia/index/rebuild`. When the frontend sends `POST /api/ia/index/rebuild`, Vercel's CDN routes it to `index.html`. Static assets only allow `GET` → **HTTP 405 Method Not Allowed**.

`GET /api/ia/health` also hits the rewrite, returns HTML instead of JSON.

Additionally, this is a `local-only` backend — the entire backend server (`server/`) is not deployed to Vercel. All API routes fail by design without a serverless function or separate backend deployment.

---

## 5. Exact Files and Components Involved

| File | Role |
|------|------|
| `src/auth/AuthProvider.tsx` | Reads `VITE_LOCAL_DEMO_AUTH_BYPASS` at build time; controls which auth path is taken |
| `src/policy/security/identity/demoUsers.ts` | Defines `LOCAL_DEMO_USER`; contains `robertp@careindeed.com` as `demo-user-careindeed` with role `super_admin` |
| `vercel.json` | Contains wildcard rewrite that captures all `/api/*` routes; root cause of 405 |
| Vercel project settings | Source of truth for environment variables; must be set **before** a fresh build |

---

## 6. Current Suspected Root Cause

Two compounding failures:

1. The Vercel deployment was built without `VITE_LOCAL_DEMO_AUTH_BYPASS=true` present in the build environment. The variable was added to Vercel settings afterward, but `vercel redeploy` reused the existing artifact. The compiled bundle permanently contains `false` for this constant.

2. `vercel.json` has a wildcard rewrite that makes Vercel treat the entire deployment as a static SPA, routing all requests (including API calls) to `index.html`. Any `POST` or non-GET request to `/api/*` returns 405.

Additionally, AWS Cognito is not configured for the Vercel deployment domain, so even if bypass were somehow disabled, the real auth path has no valid configuration to succeed.

---

## 7. Validation That Was Claimed

- Environment variable was confirmed present in Vercel dashboard settings
- `vercel redeploy` command ran without error

---

## 8. Validation That Was Missing

- Browser was not opened to confirm login actually succeeded
- The compiled bundle was not inspected to verify the literal value of `LOCAL_DEMO_AUTH_BYPASS`
- No check was performed to confirm `vercel redeploy` triggered a new Vite build vs. reusing the artifact
- No network tab check to confirm Cognito requests were not being made
- No check that `vercel.json` wildcard rewrite was not intercepting API calls

---

## 9. Acceptance Criteria for Future Fix

- [ ] `VITE_LOCAL_DEMO_AUTH_BYPASS=true` is confirmed present in Vercel project environment settings **before** any build is triggered
- [ ] `vercel.json` is updated to exclude `/api/*` paths from the wildcard rewrite (or use Vercel Serverless Functions for API routes)
- [ ] A **new build** is triggered (not `vercel redeploy` of an existing URL) — via `vercel deploy`, a git push to the connected branch, or the Vercel dashboard "Redeploy with new build" option
- [ ] Browser is opened to the deployed URL
- [ ] Login form is submitted using `robertp@careindeed.com` with any password
- [ ] User lands on the main application dashboard with role `super_admin`
- [ ] No Cognito-related network errors appear in the browser console or network tab
- [ ] The session persists across a page refresh
- [ ] No HTTP 405 errors on any `/api/*` route

---

## 10. Reference: Demo User Definition

From `src/policy/security/identity/demoUsers.ts`:

```typescript
LOCAL_DEMO_USER = {
  id: 'demo-user-careindeed',
  email: 'robertp@careindeed.com',
  name: 'TJ Padilla',
  role: 'super_admin'
}
```

In bypass mode, `login()` sets the current user to `LOCAL_DEMO_USER` regardless of what credentials are entered. This is the intended behavior for demo/staging environments.

---

## 11. Priority

**P0** — Nothing else is testable without a working login. The auth failure blocks every other acceptance criterion in this forensic set.
