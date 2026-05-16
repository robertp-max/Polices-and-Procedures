# 10 — Security, Privacy, and PHI Boundary

**Generated:** 2026-05-12
**Disclaimer:** This document identifies risks and needed controls only. It does not claim HIPAA compliance and is not a legal compliance assessment.

---

## External Service Calls Detected

| Service | Protocol | Files | Notes |
|---|---|---|---|
| AWS Cognito | HTTPS | `server/auth/service.ts`, `@aws-sdk/client-cognito-identity-provider` | User authentication |
| AWS DynamoDB | HTTPS | `@aws-sdk/client-dynamodb`, `server/audit/` | Audit logs, user registration |
| AWS SES | HTTPS | `@aws-sdk/client-ses` | Email (registration, password reset) |
| Google Calendar | HTTPS | `server/googleCalendar.ts`, `googleapis` | Calendar event sync |
| Ollama (local) | HTTP (localhost) | `server/ia/ollama.ts` | LLM inference — local only |
| Hubstaff | HTTPS | `server/routes/hubstaff.ts` | Time-tracking API proxy |

---

## Local Storage Usage

| Key | Contents | Risk Level |
|---|---|---|
| `ci_demo_auth_v1` | `{ session: { accessToken, refreshToken }, expiresAt, user }` | **High** — JWT tokens stored in localStorage are accessible to any JS on the page (XSS risk) |
| `ci_demo_bypass_logged_out_v1` | `'1'` or absent | Low |
| `ci_demo_auth_logout_broadcast_v1` | Timestamp | Low |

**Recommendation:** Consider migrating auth tokens to `httpOnly` cookies served by the backend to prevent XSS token theft.

---

## Browser Storage

| Storage Type | Contents | Usage |
|---|---|---|
| `localStorage` | Auth tokens, demo bypass flags | See above |
| `sessionStorage` | Not detected in initial scan | — |
| `indexedDB` | Not detected | — |
| Browser cookies | Not detected from frontend code | Auth may use cookies via Cognito hosted UI if configured |

---

## Server-Side Persistence Risks

| Storage | Contents | Risk |
|---|---|---|
| `server/ecign/data/form_instances.jsonl` | Form instance state | Contains form submission data — may include employee acknowledgment data |
| `server/ecign/data/signatures.jsonl` | Signature records | Contains signer identity, timestamps, potentially name/role |
| `server/ecign/data/consents.jsonl` | User consent records | Consent data |
| `server/ecign/data/audit_events.jsonl` | Audit events | Actor user IDs, action types, timestamps |
| `server/ecign/data/document_versions.jsonl` | Document versions | Version history |

**Risk:** JSONL files are **unencrypted at rest**, stored in the project directory. If the server machine is compromised, all ecign data is exposed in plaintext.

**Risk:** JSONL files are likely **tracked in git** (not excluded in observed `.gitignore`). If real PHI or PII were ever written to these files, it would be in git history.

---

## Credential Files

| File | Contents | Risk |
|---|---|---|
| `server/credentials/service-account.json` | Google Cloud service account key | **Critical** — private key file in project directory. Even though gitignored, it is at risk of accidental commit. |
| `.env` | All environment secrets (Cognito, DynamoDB, Calendar IDs) | **High** — gitignored but present at root |
| `.env.local` | Local overrides | **High** — gitignored |
| `.env.production` | Production secrets | **Critical** — gitignored but presence at root is risky |

**Verification needed:** Confirm `server/credentials/service-account.json` is in `.gitignore`. Confirm no secrets have been committed in git history.

---

## Public / Static Assets

| Path | Contents | Risk |
|---|---|---|
| `public/` | Static files served by Vite | Should contain no sensitive data |
| `src/assets/` | Images (logos, avatars) | No sensitive data detected |
| `dist/` | Built frontend (generated) | Should be gitignored |

**Check:** Ensure `dist/` is gitignored and not deployed with sensitive data embedded in generated JS bundles (e.g., hardcoded policy content that should be access-controlled).

---

## Risky File Locations

| File / Pattern | Risk |
|---|---|
| `server/credentials/service-account.json` | Google service account private key in project directory |
| `tmp-ddb-key-raney.json` (root) | DynamoDB key file in root — likely a test artifact |
| `tmp-ddb-key.json` (root) | DynamoDB key file in root |
| `tmp-ddb-names.json`, `tmp-ddb-values.json` | DynamoDB data artifacts at root |
| `tmp-*.log`, `tmp-*.json` (root) | Temp files may contain sensitive API responses |
| `.env`, `.env.local`, `.env.production` | All at root — confirm gitignored |
| `server/ecign/data/*.jsonl` | Unencrypted persistence |
| `.cache/ia-index/` | Vector index may contain chunks of sensitive policy content |

---

## PHI Boundary Analysis

**This is a home health compliance platform. PHI risks are:**

| Risk Area | Description |
|---|---|
| Employee data in Journey module | `src/policy/journey/data/employees.ts` contains a static employee roster. If this includes real names, it is PII. |
| Demo user hardcoded | `AuthProvider.tsx` hardcodes `robertp@careindeed.com` / `TJ Padilla` — real person's data in code |
| Form submissions | `server/ecign/data/form_instances.jsonl` may contain form field values including employee acknowledgments |
| iAdministrator corpus | If `Builder/` files contain any patient or employee PHI, the RAG index would contain PHI |
| Audit log | `server/ecign/data/audit_events.jsonl` contains actor user IDs — these are PII if linked to real users |
| Training content | Journey module lesson content refers to fictional training scenarios — PHI risk is low if content is fictional |

**Note:** No real patient data (clinical PHI) was detected in the codebase during this review. The primary concern is **employee PII** and **operational data** in the JSONL files.

---

## Detected Security Controls

| Control | File | Status |
|---|---|---|
| JWT auth guard | `src/auth/ProtectedRoute.tsx` | Active |
| Server identity middleware | `server/identity/middleware.ts` | Active |
| Role-based access control | `server/access/pdp.ts` + `pep.ts` | Active |
| Separation of duties | `server/access/sod.ts` | Active |
| Audit logging | `server/audit/writer.ts` + `server/ecign/data/audit_events.jsonl` | Active |
| Hash chain integrity | `server/ecign/hashChain.ts` | Active |
| CORS | `server/index.ts` (cors middleware) | Active |
| `x-powered-by` disabled | `app.disable('x-powered-by')` | Active |
| Session isolation | `server/ia/session/manager.ts` | Partial (completeness unclear) |
| MFA for signers | `EcignPacketSigner.mfa_verified` field | In type; enforcement unclear |

---

## Missing or Unverified Security Controls

| Control | Status | Notes |
|---|---|---|
| Rate limiting on API | Not detected | All API routes appear unthrottled |
| Input validation / sanitization | Not fully verified | Express JSON parser handles basic parsing |
| HTTPS enforcement | Not detected in Express code | Likely handled by Vercel/reverse proxy in production |
| JSONL encryption at rest | Not present | JSONL files are plaintext |
| Secret rotation policy | No evidence | Service account and Cognito credentials are static |
| Dependency vulnerability scanning | Not detected in CI | No automated CVE scanning detected |
| CSP headers | Not detected | No Content-Security-Policy header middleware detected |
| HSTS | Not detected | Likely handled by Vercel |

---

## `.gitignore` Recommendations

Verify (and add if missing) the following entries:

```
# Secrets
.env
.env.local
.env.production
server/credentials/service-account.json
tmp-ddb-key*.json

# Generated
dist/
.cache/

# Temp files
tmp-*.json
tmp-*.log
tmp-*.js
```

---

## `.cursorignore` Recommendations

Add to `.cursorignore` to prevent AI tools from reading sensitive content:

```
.env
.env.local
.env.production
server/credentials/
tmp-ddb-key*.json
tmp-*.json
tmp-*.log
server/ecign/data/
.cache/ia-index/
```

---

## Summary Risk Assessment

| Risk | Level | Action Needed |
|---|---|---|
| Auth tokens in localStorage | High | Migrate to httpOnly cookies |
| Service account key in project dir | Critical | Move outside project; use secret manager |
| DynamoDB key files at root | Critical | Delete immediately; add to .gitignore |
| JSONL files unencrypted | Medium | Migrate to DynamoDB; encrypt at rest |
| Demo user hardcoded in code | Medium | Move to env config |
| Planning docs in IA corpus | Medium | Audit corpus before production indexing |
| No rate limiting | Medium | Add API rate limiter |
| Missing CSP headers | Medium | Add security headers middleware |
| Employee PII in static data files | Low-Medium | Audit employees.ts; ensure not real data |
