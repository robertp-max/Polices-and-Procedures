# Phase COG-1 — Real Users, Cognito Login, and Minimum User Provisioning

**Status:** code complete + tested; integration review passed; **post-review hardening
applied**; **NOT merged, NOT deployed**. Cognito is the **current tactical
implementation chosen for fastest working login** — the approved long-term identity
target in `GC+Architecture.html` (Firebase Auth, §5/§20) is unchanged by this phase.
The provider interface is deliberately IdP-agnostic so that migration replaces
`src/auth/AuthProvider.tsx` + `src/auth/api.ts`, not every consumer.

**Post-review hardening (on `integration/cog1-review`):** two Major fixes landed after
the integration review:
1. **Demo-bypass now requires an explicit development-only signal** (`import.meta.env.DEV`
   or `VITE_LOCAL_DEMO_AUTH_BYPASS`) in addition to the deployed-host veto. Hostname
   inference alone (localhost / `*.vercel.app`) can no longer enable demo mode in a
   production build, and no host outside the denylist silently falls into demo
   (`src/auth/bypass.ts`, regression tests in `src/auth/bypass.test.ts`).
2. **Suspended/disabled application users are rejected server-side even with a valid
   Cognito token** via `assertRegistrationActiveForSession`, wired into the shared
   `DemoAuthService.getCurrentUser` seam — so `/me`, admin APIs (through
   `assertAdminAccessToken`), and the login/refresh resolution paths all fail closed
   with 403 (`server/auth/service.ts`, unit tests in `server/auth/authService.test.ts`).

## What changed

| Area | Before | After |
|---|---|---|
| `src/auth/AuthProvider.tsx` | Hardcoded `demo-user`, always authenticated | Real Cognito-backed session via the existing `AuthApi`; typed `NEW_PASSWORD_REQUIRED` challenge; restoration, refresh, logout; demo identity only where `bypass.ts` allows (localhost/Vercel preview — **never CloudFront**) |
| `src/main.tsx` | Provider not mounted | `AuthProvider` wraps the app |
| `src/v6/routing/router.tsx` | No guarding | `RequireAuth` wraps the V6 shell; Auth-group routes render outside it |
| `src/v6/screens/pageviews/LoginScreen.tsx` | Visual mock (fake setTimeout) | Real login + first-login password challenge + safe generic errors |
| `src/v6/screens/pageviews/AuthFlowScreens.tsx` | — (new) | Forgot-password, reset-password, invited-account setup (`/setup-account?token=` matches the backend email link) |
| `src/auth/session.ts` | — (new) | Token containment (see below) |
| `src/auth/AccountProvisioningCard.tsx` + AdminUsersScreen | Demo-only roster | Invite (setup link), resend link, grant access (temp password), manual reset, Cognito binding state |
| `server/auth/*` | `/me` had no role | `/me` now returns the server-authoritative allowlist `role`/`department` (`findApprovedUserByEmail`) |

## Identity mapping (no fourth person model)

`User` in `src/policy/security/identity/` stays canonical. On every authenticated
`/me`, the provider calls the existing `upsertAuthenticatedUser` store action: match
by normalized email → record `authSubject` (Cognito `sub`) + `provider: 'cognito'` on
the existing `User`. `useAuth().user.userId` is the canonical id; `cognitoSub` is the
IdP reference. `UserSetupAssignment` (Journey side map) and `ci-journey-v1` are
untouched; downstream systems (eCign signer identity, Journey, CES, audit) receive
the real `userId`/email/name/role through the same `useAuth()` contract as before.

## Session-storage design

- **Access token:** `sessionStorage` (`ci.authSession.v1`) — per-tab, survives F5,
  cleared on tab close. *Documented residual risk:* readable by same-origin XSS
  (same class as in-memory exposure). Narrowly contained: only `session.ts` and the
  provider touch it.
- **Refresh token:** **memory only** — never localStorage, sessionStorage, or JS
  cookies. Consequence: silent refresh works within a tab session; after a full
  reload with an expired access token the user signs in again.
- **Role authority:** the server derives role from the allowlist on every `/me`;
  client storage/Zustand can only display it. No client payload/header can elevate.
- **No secrets in logs:** `redactForLog()` masks tokens/passwords/codes; nothing in
  the provider logs token material.
- Future hardening (not this phase): move to HttpOnly-cookie server sessions.

## Authorization enforcement

- `RequireAuth` blocks all shell routes: `loading` renders a neutral state (no
  authenticated flash), `unauthenticated` redirects to `/login?returnTo=…`.
- Admin API endpoints re-validate the caller's access token server-side
  (`assertAdminAccessToken`); the UI card is convenience, not the boundary.
- Disabled/revoked users fail the next `/me`/refresh and lose the session.
- Local demo bypass policy is unchanged (`bypass.ts`): CloudFront production never
  bypasses; localhost/Vercel previews may, for development.

## MFA — deliberately out of scope (follow-on backlog)

MFA is **not enabled and not claimed as enforced**. The Cognito pool has MFA OFF and
`service.ts` supports only the normal login path + `NEW_PASSWORD_REQUIRED`.
Backlog for a future phase:
1. `SOFTWARE_TOKEN_MFA` (TOTP) challenge support in `service.ts`, `api.ts`, provider, and login UI.
2. `EMAIL_OTP`/SMS challenge support **if approved**.
3. Derive `mfa_enrolled` from the **verified token**, replacing the client-supplied `x-user-mfa` header in `server/identity/middleware.ts`.
4. Recovery codes / account-recovery flow.
5. Step-up authentication for sensitive actions (align with the existing eCign step-up, which is preserved unchanged).

## Proposed deployment (DO NOT RUN without separate approval)

The deployed Cloud Run dev service already carries the Cognito env/secrets. The
approved release path builds the combined API+SPA server image through
`cloudbuild.server.yaml` (which uses `Dockerfile.server` — the full Express server
serving `/api` + the built `dist`, NOT the web-tier-only `Dockerfile`), then deploys
that image to `care-indeed-hh-v2-dev`. **Deployment still requires separate approval.**

```bash
# 1) Build + push the server image via Cloud Build (Dockerfile.server):
gcloud builds submit --project data-hangout-500409-j4 --config cloudbuild.server.yaml

# 2) Deploy the built image to the dev service (no env changes; secrets already attached):
gcloud run deploy care-indeed-hh-v2-dev \
  --project data-hangout-500409-j4 --region us-central1 \
  --image <image-ref-produced-by-cloudbuild>
```

Do **not** use `gcloud run deploy --source .` — that is not the approved path and can
pick the wrong Dockerfile.

Verify after deploy: `/login` renders; sign in with a test allowlisted account;
`/api/auth/me` returns the allowlist role AND rejects a suspended account with 403;
admin invite → setup email → first login.

## Rollback

```bash
# List revisions, then route traffic back to the prior one:
gcloud run revisions list --service care-indeed-hh-v2-dev --project data-hangout-500409-j4 --region us-central1
gcloud run services update-traffic care-indeed-hh-v2-dev \
  --project data-hangout-500409-j4 --region us-central1 \
  --to-revisions <previous-revision>=100
```
Code rollback: revert the COG-1 files; the demo bypass policy means local flows keep
working at every point.

## Out of scope / unchanged

- **No Firebase** (Auth/SDK/Firestore/Functions) was added.
- **Google Drive and Calendar untouched** — no auth, folder, file, permission, or
  event change; the keyless-impersonation preparation is exactly as it was.
- Journey/attempts/evidence/escalations persistence migration remains a later phase.
- Public self-registration remains governed by the existing approved-domain +
  explicit allowlist policy (unchanged).
