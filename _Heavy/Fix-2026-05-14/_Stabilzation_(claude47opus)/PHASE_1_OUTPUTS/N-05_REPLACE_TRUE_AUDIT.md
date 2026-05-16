# N-05 — `replace: true` Audit & Follow-Up List

**Task:** Audit all `replace: true` usages across the app; identify any that are inappropriate ("aggressive") on normal navigation routes; produce a follow-up list of ambiguous cases for later cleanup.
**Scope per Phase 1 plan:** CES, Evidence, eCign, Onboarding V2, Calendar.
**Status:** Audit complete. **No code changes required.** All current usages are appropriate.
**Owner:** Track A (Navigation & Input Safety)
**Date:** 2026-05-16

---

## 1. Audit Method

Two grep passes, both case-sensitive:

1. Route-level `<Navigate ... replace />` in `src/App.tsx`
2. Programmatic `navigate(..., { replace: true })` across `src/`

Pattern used for #2:

```text
navigate\([^)]*\{[^}]*replace\s*:\s*true
```

---

## 2. Route-Level `<Navigate replace />` — `src/App.tsx`

| Line | Route | Target | Category | Verdict |
|---|---|---|---|---|
| 139 | `PublicAuthRoute` if `isAuthenticated` | `/dashboard` | Auth-flow redirect | **KEEP** |
| 147 | `EntryRoute` `/` | `/dashboard` or `/login` | Entry redirect | **KEEP** |
| 196 | `/` (inside protected) | `/dashboard` | Default-route redirect | **KEEP** |
| 210 | `/policies` | `/library` | Stable alias | **KEEP** |
| 215 | `/drafts` | `/policy-lifecycle?stage=DRAFT` | Legacy alias (one release cycle per code comment) | **KEEP** (sunset) |
| 216 | `/drafts/:policyId` | `/policy-lifecycle` | Legacy alias | **KEEP** (sunset) |
| 217 | `/review` | `/policy-lifecycle?stage=REVIEW` | Legacy alias | **KEEP** (sunset) |
| 218 | `/publish` | `/policy-lifecycle?stage=APPROVED` | Legacy alias | **KEEP** (sunset) |
| 231 | `/admin` | `/admin/user-groups` | Default-route redirect | **KEEP** |
| 236 | `/security/identity` | `/security/identity/user-groups` | Internal section default | **KEEP** |
| 237 | `/security/identity/user-groups` | `/admin/user-groups` | Legacy path → canonical | **KEEP** (alias) |
| 238 | `/security/identity/permission-catalog` | `/admin/permissions` | Legacy path → canonical | **KEEP** (alias) |
| 239 | `/security/identity/user-assignments` | `/admin/users` | Legacy path → canonical | **KEEP** (alias) |
| 257 | `/onboarding-v2` index | `/onboarding-v2/dashboard` | Default-route redirect | **KEEP** |
| 267 | `/system-documentation` | `/system-documentation/executive-overview` | Default-route redirect | **KEEP** |
| 271 | `/ces` | `/ces/dashboard` | Default-route redirect | **KEEP** |
| 275 | `/ces/calendar` | `/calendar?view=sprint` | Consolidation alias (per code comment) | **KEEP** (alias) |
| 280 | `/ces/my-tasks` | `/my-tasks` | Consolidation alias | **KEEP** (alias) |
| 291 | `/pm` | `/pm/my-tasks` | Default-route redirect | **KEEP** |
| 298 | `*` (catch-all) | `/dashboard` | 404 fallback | **KEEP** |

**Subtotal:** 20 route-level `replace` usages. **All categorized as either**:
- Default-route redirects (e.g. `/ces` → `/ces/dashboard`)
- Legacy aliases under sunset (per existing code comments)
- Auth-flow guards
- 404 fallback

**None violate the "browser back jumps over visited page" anti-pattern.** Browser back from `/ces/dashboard` returns to whatever the user was on **before** they entered the CES section, which is the intended behavior. Removing `replace` from these would push synthetic history entries (`/ces` → `/ces/dashboard`) and make Back take **two** clicks to leave the section, which is worse.

---

## 3. Programmatic `navigate(..., { replace: true })`

Five occurrences across the codebase:

| File | Line | Target | Trigger | Verdict |
|---|---|---|---|---|
| `src/auth/pages/LoginPage.tsx` | 29 | `next` (returnTo) | Successful login | **KEEP** (auth) |
| `src/auth/pages/RegisterPage.tsx` | 88 | `/login` | Successful registration | **KEEP** (auth) |
| `src/auth/pages/SetupAccountPage.tsx` | 43 | `/login` | Setup completion | **KEEP** (auth) |
| `src/auth/pages/SetNewPasswordPage.tsx` | 26 | `/login` | Password set completion | **KEEP** (auth) |
| `src/policy/pages/SystemDocumentationPage.tsx` | 987, 991 | `/system-documentation/executive-overview` | Default section redirect (matches App.tsx route 267) | **KEEP** |

**All 5 programmatic usages are in auth-flow finalization or default-section redirects. None are on operational routes (CES, Evidence, eCign, Onboarding V2, Calendar).**

---

## 4. Findings on the Five Surfaces Phase 1 Was Concerned About

| Surface | Route-level `replace` | Programmatic `replace: true` | Net concern |
|---|---|---|---|
| **CES** (`/ces/*`, `/ces/board`, `/ces/dashboard`) | 4 (lines 271, 275, 280; index/aliases only) | 0 | None — all are default-route or alias redirects |
| **Evidence** (`/evidence`, `/evidence/*`) | 0 | 0 | None |
| **eCign** (`/forms/:formId`, `/artifacts/*`) | 0 | 0 | None |
| **Onboarding V2** (`/onboarding-v2/*`) | 1 (line 257; index redirect) | 0 | None |
| **Calendar** (`/calendar`, `/calendar/event/*`) | 0 | 0 | None |

**Result: zero unsafe `replace: true` calls on the five surfaces of concern. The repo is already clean on this dimension.**

---

## 5. Why The Original Concern Did Not Materialize Here

The original 16-agent feedback flagged "aggressive `replace: true`" as a high-risk pattern on operational surfaces. Inspection shows that concern was directed at apps where post-action redirects (e.g. after submitting a CES task, after capturing evidence, after signing an eCign packet) use `{ replace: true }`, causing browser Back to skip the just-visited form and confuse users.

In this repo, **post-action redirects use plain `navigate(target)` without `replace`**. Examples found during the audit:

- `ActivationPage.tsx:75` — `navigate('/onboarding-v2/dashboard')` after `ingest(payload)` — **no replace**
- `LoginPage.tsx:29` does use replace, which is correct (auth boundary)

So the underlying app discipline is already good. The five surfaces of concern do **not** require a code change.

---

## 6. Follow-Up List (Ambiguous Cases)

Per Phase 1 plan, cases that are *ambiguous* (could go either way and need human review) are deferred for later cleanup. After the full audit:

**Zero ambiguous cases identified.** Every `replace: true` usage falls cleanly into one of:
- Auth-flow finalization (KEEP)
- Default-route redirect (KEEP)
- Legacy alias / consolidation alias (KEEP — already documented in code comments as time-bounded)
- 404 fallback (KEEP)

**Recommended follow-ups (post-Phase-1, low priority):**

1. **Sunset confirmation for legacy aliases (lines 215–218, 231, 236–239).** Code comment on line 214 says "Old route redirects (one release cycle)". When the next release ships, these can be deleted entirely (not just have `replace` removed). Owner: Frontend Engineering. Deferred to MVP plan post-Wave-0.
2. **CES alias consolidation (lines 275, 280).** `/ces/calendar` → `/calendar?view=sprint` and `/ces/my-tasks` → `/my-tasks` are intentional consolidations. After 1 release cycle of UAT confirms no broken external links, these alias `<Route>` entries can be removed. Owner: CES team. Deferred.
3. **`/security/identity/*` aliases (lines 236–239).** Three legacy security routes redirect to `/admin/*`. Same pattern: confirm post-UAT, remove. Owner: Security/Identity. Deferred.

None of the above belong in Phase 1.

---

## 7. Outcome

- **N-03 (Audit `replace: true`):** ✅ Complete. 25 total occurrences identified (20 route-level + 5 programmatic).
- **N-04 (Remove `replace: true` from CES/Evidence/eCign/OnboardingV2/Calendar normal routes):** ✅ Complete. **Zero changes required** — no unsafe usages exist on these surfaces.
- **N-05 (Follow-up list of ambiguous cases):** ✅ This document. Zero ambiguous cases; 3 low-priority sunset opportunities deferred to post-Wave-0.

**Net code delta from Track A audit work: 0 lines changed.** The audit confirms existing discipline.

---

**End of N-05 audit document.**
