# 11 — Build, Deploy, and Environment

**Generated:** 2026-05-12
**Source:** `package.json`, `vite.config.ts`, `.env.example`, `vercel.json`

---

## Package.json Scripts

### Development

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `concurrently -k -n web,api -c cyan,magenta "npm:dev:web" "npm:dev:api"` | ★ Main dev command — runs Vite + Express simultaneously |
| `npm run dev:web` | `vite` | Frontend only (Vite dev server on port 5173) |
| `npm run dev:api` | `tsx watch server/index.ts` | Backend only (Express on port 8787, hot reload) |
| `npm run predev:web` | `node scripts/syncMasterControlInventory.mjs` | Auto-runs before frontend dev — syncs MCI data |

### Build

| Script | Command | Purpose |
|---|---|---|
| `npm run build` | `tsc -b && vite build` | Production build (TypeScript check + Vite bundle) |
| `npm run prebuild` | `node scripts/syncMasterControlInventory.mjs` | Auto-runs before build — syncs MCI data |
| `npm run preview` | `vite preview` | Preview production build locally |

### Server Only

| Script | Command | Purpose |
|---|---|---|
| `npm run server` | `tsx server/index.ts` | Run Express server (no hot reload) |

### IA (iAdministrator / RAG)

| Script | Command | Purpose |
|---|---|---|
| `npm run ia:index` | `tsx server/cli/build-index.ts` | Build the local IA corpus index (requires Ollama) |
| `npm run ia:health` | `node -e "fetch(...)"` | Health check the IA service |

### Data Sync / Integration

| Script | Command | Purpose |
|---|---|---|
| `npm run push-events` | `tsx scripts/pushAllEvents.ts` | Push all regulatory events to Google Calendar |
| `npm run push-hubstaff` | `tsx scripts/pushToHubstaff.ts` | Push tasks to Hubstaff |
| `npm run sync:master-control-inventory` | `node scripts/syncMasterControlInventory.mjs` | Sync MCI data |
| `npm run compile:workflows` | `tsx scripts/compileWorkflows.ts` | Compile workflow definitions |

### Verification / QA Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run verify:alignment` | `tsx scripts/verifyAlignment.ts` | Verify data alignment |
| `npm run verify:pm-unified` | `tsx scripts/verifyUnifiedTaskProjection.ts` | Verify PM task projection |
| `npm run verify:task-identity` | `tsx scripts/verifyTaskIdentity.ts` | Verify task identity |
| `npm run verify:calendar-keys` | `node scripts/checkCalendarTaskKeys.mjs` | Check calendar task keys |
| `npm run verify:ui` | `tsx --tsconfig tsconfig.app.json scripts/verifyUiDesignSystem.ts` | UI design system verification |
| `npm run verify:brad-scenario` | `tsx --tsconfig tsconfig.app.json scripts/verifyBradScenarioActionLayer.ts` | Brad scenario verification |
| `npm run validate:event-dataflow` | `tsx scripts/validateEventDataflow.ts` | Validate event data flow |

### Evidence Phase Checks

| Script | Command | Purpose |
|---|---|---|
| `npm run check:evidence-phase01` | `tsx scripts/checkEvidencePhase01.ts` | Evidence phase 1 check |
| `npm run check:evidence-phase15` | `tsx scripts/checkEvidencePhase15.ts` | Evidence phase 1.5 check |
| `npm run check:evidence-phase2` | `tsx scripts/checkEvidencePhase2.ts` | Evidence phase 2 check |
| `npm run check:evidence-phase21/22/23/235` | (similar) | Evidence phase sub-checks |

### eCIgn Checks

| Script | Command | Purpose |
|---|---|---|
| `npm run check:ecign-routes` | `tsx scripts/checkEcignRouteHealth.ts` | eCIgn route health check |
| `npm run check:ecign-demo-local` | `tsx --tsconfig tsconfig.app.json scripts/checkEcignDemoLocal.ts` | eCIgn demo local check |

### AWS / CES Mapping

| Script | Command | Purpose |
|---|---|---|
| `npm run validate:aws-ces-mapping` | `tsx scripts/validateAwsCesMapping.ts` | Validate AWS ↔ CES mapping |

### Forms

| Script | Command | Purpose |
|---|---|---|
| `npm run forms:build` | `tsx scripts/formsSystemBuild.ts` | Build forms system |

### CDK (Infrastructure)

| Script | Command | Purpose |
|---|---|---|
| `npm run cdk:auth:synth` | `npm --prefix infra/demo-auth-cdk run synth` | Synth CDK auth stack |
| `npm run cdk:auth:deploy` | `npm --prefix infra/demo-auth-cdk run deploy` | Deploy CDK auth stack |

### Cleanup / Maintenance

| Script | Command | Purpose |
|---|---|---|
| `npm run cleanup-duplicates` | `tsx scripts/cleanupDuplicates.ts` | Detect duplicate data |
| `npm run cleanup-duplicates:apply` | `tsx scripts/cleanupDuplicates.ts --apply` | Apply cleanup |

### Testing

| Script | Command | Purpose |
|---|---|---|
| `npm run lint` | `eslint .` | ESLint check |

*(Playwright tests exist via `playwright.config.ts` but no `test` script detected in package.json — likely run via `npx playwright test`)*

---

## Environment Variables

**Source:** `.env.example`
**Never expose values — variable names only listed below.**

### Google Calendar Integration
| Variable | Purpose |
|---|---|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON (default: `./server/credentials/service-account.json`) |
| `GOOGLE_CALENDAR_ID` | Target Google Calendar ID |
| `DEFAULT_TIMEZONE` | IANA timezone (default: `America/Los_Angeles`) |

### Express Server
| Variable | Purpose |
|---|---|
| `PORT` | Express port (default: `8787`) |
| `ALLOWED_ORIGIN` | CORS allowed origin (dev: `http://localhost:5173`) |
| `API_SHARED_SECRET` | Optional bearer token for API calls |
| `LOG_LEVEL` | Log verbosity (debug/info/warn/error) |

### IA / Ollama
| Variable | Purpose |
|---|---|
| `IA_INDEX_ROOT` | Local index directory (default: `.cache/ia-index`) |
| `IA_CORPUS_ROOT` | Corpus root for indexing (default: repo root) |
| `IA_REQUIRE_EMBEDDINGS` | Abort if Ollama unavailable (default: false) |
| `OLLAMA_BASE_URL` | Ollama endpoint (default: `http://127.0.0.1:11434`) |
| `OLLAMA_CHAT_MODEL` | Chat LLM model |
| `OLLAMA_EMBED_MODEL` | Embedding model |
| `OLLAMA_TIMEOUT_MS` | Ollama request timeout |

### AWS (Demo Auth)
| Variable | Purpose |
|---|---|
| `AWS_REGION` | AWS region (default: `us-west-2`) |
| `APP_BASE_URL` | Application base URL |
| `COGNITO_USER_POOL_ID` | Cognito user pool ID |
| `COGNITO_CLIENT_ID` | Cognito app client ID |
| `FROM_EMAIL` | SES sender email |
| `REGISTRATION_TABLE_NAME` | DynamoDB registration table name |
| `SETUP_TOKEN_TTL_MINUTES` | Account setup token TTL |
| `AUTO_APPROVED_DOMAIN` | Email domain for auto-approval |
| `DEMO_AUTH_DEBUG` | Enable auth debug logging |

### Frontend (Vite env, exposed to browser)
| Variable | Purpose |
|---|---|
| `VITE_AUTH_API_BASE_URL` | Auth API base URL (default: `/api/auth`) |
| `VITE_LOCAL_DEMO_AUTH_BYPASS` | ⚠️ If `true`, bypasses real auth with hardcoded demo user |

---

## Vite Configuration (`vite.config.ts`)

```typescript
// Key settings:
resolve.alias: { '@': './src' }  // All imports use @/ for src/

server.proxy: {
  '/api': {
    target: 'http://localhost:8787',
    changeOrigin: true,
  }
}
```

- In **development**: Vite proxies `/api/*` to Express on port 8787
- In **production**: `/api/*` must be routed to the Express server via reverse proxy (Vercel routes or nginx)

---

## TypeScript Configuration

| File | Scope | Notes |
|---|---|---|
| `tsconfig.json` | Root (references other configs) | References `tsconfig.app.json` and `tsconfig.node.json` |
| `tsconfig.app.json` | Frontend (Vite) | Browser environment, React JSX |
| `tsconfig.node.json` | Backend (Node/server scripts) | Node environment |
| `server/tsconfig.json` | Server-specific | Server TypeScript config |

---

## Build / Deploy Configuration

### Vercel (`vercel.json`)

Present at root — Vercel deployment is the primary deployment target for the frontend.

Likely configured to:
- Serve built `dist/` as static assets
- Route `/api/*` to the Express server (via Vercel Serverless Functions or a separate API deployment)

*Note: Full `vercel.json` contents not inspected — read for complete routing rules.*

### AWS CDK (`infra/demo-auth-cdk/`)

CDK stack for the demo auth infrastructure:
- Cognito User Pool
- SES email configuration
- DynamoDB registration table
- Likely API Gateway or Lambda for auth handlers

---

## Port Configuration

| Service | Port | Notes |
|---|---|---|
| Vite dev server | 5173 | Frontend |
| Express API | 8787 | Backend |
| Ollama | 11434 | Local LLM (must be running separately) |

---

## Known Deployment Assumptions

| Assumption | Notes |
|---|---|
| Ollama runs locally | iAdministrator RAG requires Ollama at localhost — not cloud-deployable without LLM provider swap |
| Google Calendar credentials required | Service account JSON must be present for calendar sync |
| DynamoDB table pre-created | Registration table must exist before deployment |
| Cognito User Pool pre-created | Auth requires existing Cognito pool |
| JSONL files writable | Server must have write access to `server/ecign/data/` directory |
| Single-node server | No horizontal scaling — JSONL store is node-local |
| Build outputs committed? | `dist/` should be gitignored; built separately |

---

## Pre-Build Data Sync

Before every `build` and `dev:web`, the `syncMasterControlInventory.mjs` script runs automatically. This:
- Reads master control inventory data
- Writes to `src/policy/data/masterControlInventory.ts`

This pattern means some generated TypeScript source files are part of the build process and must be kept in sync.

---

## Generated Files in Source Control

These files are generated by scripts but committed to the repo:

| File | Generated By |
|---|---|
| `src/policy/data/*.generated.ts` | Various build/sync scripts |
| `src/policy/data/masterControlInventory.ts` | `syncMasterControlInventory.mjs` |
| `src/policy/data/frameworkSeed.generated.ts` | Framework builder |
| `src/policy/data/workflows.generated.ts` | `compileWorkflows.ts` |
| `src/policy/data/achcSurveyProjection.generated.ts` | `buildAchcSurveyProjection.mjs` |
