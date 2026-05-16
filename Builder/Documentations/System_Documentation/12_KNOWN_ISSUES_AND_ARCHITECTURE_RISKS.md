# 12 — Known Issues and Architecture Risks

**Generated:** 2026-05-12

---

## Summary Risk Table

| # | Issue | Severity | Category |
|---|---|---|---|
| 1 | CES execution state not persisted | Critical | Missing persistence |
| 2 | DynamoDB key files at project root | Critical | Security |
| 3 | Service account JSON in project directory | Critical | Security |
| 4 | Auth tokens in localStorage (XSS risk) | High | Security |
| 5 | JSONL storage is not production-grade | High | Architecture |
| 6 | Demo auth bypass is a frontend env var | High | Security |
| 7 | iAdministrator mock in production bundle | High | Architecture |
| 8 | IA corpus may include sensitive planning docs | High | Privacy |
| 9 | Orphaned backup files in pages/ | Medium | Maintenance |
| 10 | Two parallel onboarding implementations | Medium | Duplicate |
| 11 | Duplicate component names across modules | Medium | Maintenance |
| 12 | DemoPhase2/DemoPhase3 unrouted pages | Low | Orphaned |
| 13 | `PolicyDesign(light).html` invalid filename | Low | Maintenance |
| 14 | 20+ temp files at root | Low | Maintenance |
| 15 | Journey progress not persisted | High | Missing persistence |
| 16 | Missing 404 page | Low | UX |
| 17 | No rate limiting on API | Medium | Security |
| 18 | Missing S3 wiring for evidence files | High | Missing feature |
| 19 | TaskSource type has duplicate casing | Low | Type inconsistency |
| 20 | Two authorize.ts files in security/ | Medium | Duplicate |

---

## Detailed Issue Analysis

---

### Issue 1: CES Execution State Not Persisted (Critical)

**Category:** Missing Persistence

**Description:**
The entire Compliance Execution Sprint System (CES) runs in-memory via Zustand. This includes:
- Sprint assignments
- Event compliance states (upcoming/in_progress/completed)
- Workflow phase progress
- Task completion status
- Evidence readiness scores

**Impact:** Refreshing the browser resets all CES state to seed data. Multi-user use is impossible since each browser has its own state.

**Files affected:**
- `src/policy/compliance-execution/complianceExecutionStore.ts`
- `src/policy/stores/regulatoryExecutionStore.ts`
- All CES Zustand stores

**Recommended fix:** Add server-side persistence for CES state in DynamoDB. Use the PM API (`/api/pm`) or a new `/api/ces` route.

---

### Issue 2: DynamoDB Key Files at Project Root (Critical)

**Category:** Security

**Description:**
The following files exist at the project root and appear to be DynamoDB credential/test artifacts:
- `tmp-ddb-key-raney.json`
- `tmp-ddb-key.json`
- `tmp-ddb-names.json`
- `tmp-ddb-values.json`

**Impact:** If these contain real AWS credentials or real DynamoDB data, they represent a critical security risk — especially if ever committed to git or exposed via the file system.

**Recommended fix:** Delete immediately. Add `tmp-ddb-*.json` to `.gitignore`. Rotate any credentials if these were real.

---

### Issue 3: Service Account JSON in Project Directory (Critical)

**Category:** Security

**File:** `server/credentials/service-account.json`

**Description:** Google Cloud service account private key file is stored inside the project directory. While `.gitignore` should prevent it from being committed, the file path inside the repo tree is inherently risky.

**Impact:** Accidental git commit would expose the private key. Any developer with repo access can read the file.

**Recommended fix:** Move to a secrets manager (AWS Secrets Manager, Google Secret Manager) or at minimum outside the project directory. Use the `GOOGLE_APPLICATION_CREDENTIALS` env var to point to the external location.

---

### Issue 4: Auth Tokens in localStorage (High)

**Category:** Security

**File:** `src/auth/AuthProvider.tsx`

**Description:** JWT access tokens and refresh tokens are stored in `localStorage` under key `ci_demo_auth_v1`. localStorage is accessible to any JavaScript executing on the page, making it vulnerable to XSS attacks.

**Recommended fix:** Migrate to `httpOnly` cookies managed by the Express server, preventing JavaScript access to tokens.

---

### Issue 5: JSONL Storage Not Production-Grade (High)

**Category:** Architecture

**Files:** `server/ecign/data/*.jsonl`

**Description:** All eCIgn form instances, signatures, consents, and audit events are stored in JSONL flat files. Issues:
- No atomic writes (crash mid-write can corrupt file)
- No concurrent write protection (two simultaneous users can corrupt the same file)
- No backup strategy
- Not queryable
- Not scalable
- Files are unencrypted at rest

**Recommended fix:** Migrate eCIgn data to DynamoDB (already available in the stack). Design DynamoDB table schema for form_instances, signatures, audit_events.

---

### Issue 6: Demo Auth Bypass Is a Frontend Env Var (High)

**Category:** Security

**File:** `src/auth/AuthProvider.tsx`

**Code:**
```typescript
const LOCAL_DEMO_AUTH_BYPASS = import.meta.env.VITE_LOCAL_DEMO_AUTH_BYPASS === 'true';
```

**Description:** The demo bypass is controlled by a Vite env var that gets baked into the frontend bundle at build time. If `VITE_LOCAL_DEMO_AUTH_BYPASS=true` is set in `.env.production`, the production build will allow unauthenticated access as a hardcoded user (`TJ Padilla / super_admin`).

**Impact:** If this variable is accidentally set in production, anyone can access the full application as a super admin.

**Recommended fix:** Add a build-time assertion that fails the build if `VITE_LOCAL_DEMO_AUTH_BYPASS=true` and `NODE_ENV=production`.

---

### Issue 7: Mock Brad Engine in Production Bundle (High)

**Category:** Architecture

**File:** `src/services/mockBradEngine.ts`

**Description:** The mock Brad engine is a frontend file that generates simulated AI responses. Because it's a frontend file, it is **always bundled into the production build**, regardless of whether it's used.

**Impact:** Users with browser devtools can read the mock responses, understand the simulation logic, and potentially distinguish real IA responses from mock ones. The ~526+ line mock engine adds unnecessary bundle size.

**Recommended fix:** Move mock logic to a development-only file (tree-shaken in production). The backend should handle fallback responses server-side.

---

### Issue 8: IA Corpus May Include Sensitive Planning Docs (High)

**Category:** Privacy / Security

**Description:** The `server/ia/ingest/sources.ts` discovers documents from the `Builder/` subtree. This includes:
- Business risk architecture documents (`Builder/Brad2-Business-Risk-Architecture/`)
- Architecture analysis and security assessments
- Training blueprints with potentially real business context

**Impact:** Brad (the AI assistant) would have knowledge of internal security risks, architecture decisions, and business planning if these docs are indexed. This information could surface in responses to users.

**Recommended fix:** Audit the corpus before building the production index. Add an include-list or exclude-list in `sources.ts` to limit what gets indexed.

---

### Issue 9: Orphaned Backup Files in pages/ (Medium)

**Category:** Maintenance

**Files:**
- `src/policy/pages/DashboardPage.tsx.backup`
- `src/policy/pages/MasterCalendarPage.tsx.backup`
- `src/policy/pages/TaxonomyPage.old.tsx`

**Description:** Backup/old versions left in the source directory. These create confusion and may be accidentally imported.

**Recommended fix:** Delete these files. Git history preserves old versions if needed.

---

### Issue 10: Two Parallel Onboarding Implementations (Medium)

**Category:** Duplicate

**Files:**
- `src/policy/onboarding/` (V1 — legacy)
- `src/policy/onboarding-v2/` (V2 — audit-grade)

**Description:** Two separate onboarding engines exist with overlapping purpose. V1 appears to be the legacy implementation. The V1 route (`/journey/v1-journey`) still exists in the router.

**Impact:** Confusion about which system is authoritative. Both systems use different data models and stores.

**Recommended fix:** Formally deprecate V1 onboarding. Remove the V1 route and files once V2 is confirmed complete.

---

### Issue 11: Duplicate Component Names Across Modules (Medium)

**Category:** Duplicate / Maintenance

| Component | Path A | Path B |
|---|---|---|
| `WorkflowDrawer` | `src/policy/ces/components/details/WorkflowDrawer.tsx` | `src/policy/components/regulatory/WorkflowDrawer.tsx` |
| `EvidencePanel` | `src/policy/components/regulatory/EvidencePanel.tsx` | `src/policy/onboarding-v2/components/EvidencePanel.tsx` |
| `KpiTile` | `src/policy/components/regulatory/KpiTile.tsx` | `src/policy/onboarding-v2/components/KpiTile.tsx` |

**Description:** Same component names exist in different modules with likely different props/behavior. TypeScript imports resolve correctly by path, but this creates confusion during development.

**Recommended fix:** Rename components to include module prefix (e.g., `CesWorkflowDrawer`, `OnboardingEvidencePanel`).

---

### Issue 12: DemoPhase2 and DemoPhase3 Unrouted (Low)

**Category:** Orphaned

**Files:**
- `src/policy/pages/DemoPhase2.tsx`
- `src/policy/pages/DemoPhase3.tsx`

**Description:** These page components exist in the pages directory but are not referenced in `App.tsx` routes.

**Recommended fix:** Either route them (if needed) or delete them.

---

### Issue 13: Invalid Filename with Parentheses (Low)

**Category:** Maintenance

**File:** `src/policy/PolicyDesign(light).html`

**Description:** Filename contains parentheses, which can cause issues on some file systems and tools.

**Recommended fix:** Rename to `PolicyDesign-light.html`.

---

### Issue 14: ~20 Temp Files at Root (Low)

**Category:** Maintenance

**Files:** `tmp-*.json`, `tmp-*.log`, `tmp-*.js` at root

**Description:** Debugging/testing artifacts accumulated at the project root.

**Recommended fix:** Delete temp files. Add `tmp-*` to `.gitignore`. Consider a `/tmp/` directory if temporary files are needed during development.

---

### Issue 15: Journey Training Progress Not Persisted (High)

**Category:** Missing Persistence

**File:** `src/policy/journey/stores/journeyStore.ts`

**Description:** Employee training module progress (completed lessons, assessment scores, signatures) is stored in Zustand in-memory. Refreshing the browser resets all progress.

**Impact:** A nurse who completes 8 of 12 training modules and closes the browser would need to restart all training. This makes the LMS non-functional for real deployment.

**Recommended fix:** Add a backend endpoint to persist journey progress per user. Could use DynamoDB.

---

### Issue 16: No 404 Page (Low)

**Category:** UX

**Description:** Unmatched routes silently redirect to `/dashboard` (`<Route path="*" element={<Navigate to="/dashboard" replace />}`).

**Impact:** Users following broken links get silently redirected with no indication of what happened.

**Recommended fix:** Add a proper 404 page component.

---

### Issue 17: No Rate Limiting on API (Medium)

**Category:** Security

**Description:** No rate-limiting middleware detected in `server/index.ts`. All API routes including auth, IA, and ecign are unthrottled.

**Recommended fix:** Add `express-rate-limit` or similar. Especially important for auth endpoints to prevent brute-force attacks.

---

### Issue 18: S3 Evidence File Storage Not Wired (High)

**Category:** Missing Feature

**Description:** The `EcignEvidence` type includes `s3_bucket` and `s3_key` fields, suggesting S3 was planned for evidence file storage. However, the AWS SDK package only includes DynamoDB, Cognito, and SES — no S3 client is installed.

**Impact:** Evidence files (signed PDFs, uploaded documents) have no durable file storage. Everything is either in-memory or appended to JSONL.

**Recommended fix:** Add `@aws-sdk/client-s3` and wire S3 upload in `server/ecign/pdf.ts` for storing signed PDF packets.

---

### Issue 19: TaskSource Type Has Duplicate Casing (Low)

**Category:** Type Inconsistency

**File:** `src/policy/pm/types.ts`

```typescript
export type TaskSource = 'CES' | 'manual' | 'personal' | 'ces';
```

Both `'CES'` and `'ces'` are in the same union. This will cause runtime comparison bugs if code uses one casing and data uses the other.

**Recommended fix:** Standardize to lowercase `'ces'` and update all usages.

---

### Issue 20: Two authorize.ts Files (Medium)

**Category:** Duplicate

**Files:**
- `src/policy/security/authorize.ts`
- `src/policy/security/identity/authorize.ts`

**Description:** Two files with the same name and likely overlapping purpose exist in parent and child directories.

**Recommended fix:** Consolidate into one. Determine which is canonical and update imports.

---

## Hardcoded Demo Logic

| Location | Hardcoded Value | Risk |
|---|---|---|
| `src/auth/AuthProvider.tsx` | `robertp@careindeed.com`, `TJ Padilla`, `super_admin` | Real person's data hardcoded |
| `src/policy/security/identity/demoUsers.ts` | Demo user definitions | Demo users in production code |
| `src/policy/evidence/demoEvidenceRuntimeCache.ts` | Demo evidence cache | Demo data may surface in production |
| `src/policy/ecign/demoLocalApi.ts` | Local demo API | Bypasses real server |
| `src/policy/pages/iAdministrator/lib/demoCriticalEmergency.ts` | Emergency scenario data | Demo data in core lib |
| `src/policy/ces/components/review/RobertCesReviewLayer.tsx` | Persona-named component (`Robert`) | Real name possibly in component |

---

## Mock Data Masquerading as Real Data

| Data Source | File | Risk |
|---|---|---|
| Regulatory events | `src/policy/data/regulatoryEvents.ts` | These are real regulatory requirements, but the **event state** (completed/in-progress) is mocked/seeded — does not reflect actual agency status |
| Employee roster | `src/policy/journey/data/employees.ts` | Static employee list — may be fictional or may be real names |
| Form content | `src/policy/data/formsLibraryContent.ts` | Form templates are real; form instance data is demo |
| Evidence readiness | `src/policy/evidence/demoEvidenceRuntimeCache.ts` | Explicitly demo — not real evidence status |

---

## Missing Features for Production Readiness

| Feature | Status |
|---|---|
| Multi-user state sync | Missing |
| Server-side CES state persistence | Missing |
| Journey progress persistence | Missing |
| S3 file storage for evidence | Missing |
| Real employee HR integration | Missing |
| Clinical PHI handling / BAA coverage | Not assessed |
| Audit trail completeness | Partial |
| Signed PDF durable storage | Partial |
| Approval chain persistence | Unclear |
| Clinician/Client profiles | Not started |
