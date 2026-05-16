# System Documentation Index
**Project:** CI Policy App (Care Indeed Compliance Platform)
**Generated:** 2026-05-12
**Location:** `Builder/Documentations/System_Documentation/`

---

## Document Map

| # | File | Purpose |
|---|------|---------|
| 00 | [00_SYSTEM_DOCUMENTATION_INDEX.md](./00_SYSTEM_DOCUMENTATION_INDEX.md) | This index |
| 01 | [01_CURRENT_STATE_OVERVIEW.md](./01_CURRENT_STATE_OVERVIEW.md) | Project purpose, architecture summary, tech stack, active modules, known gaps |
| 02 | [02_FOLDER_AND_FILE_MAP.md](./02_FOLDER_AND_FILE_MAP.md) | Top-level folder map, key files, deprecated/generated/duplicate markers |
| 03 | [03_APP_ROUTES_AND_NAVIGATION.md](./03_APP_ROUTES_AND_NAVIGATION.md) | All detected routes, layout components, route-to-component mapping |
| 04 | [04_COMPONENT_INVENTORY.md](./04_COMPONENT_INVENTORY.md) | Major React components, purpose, location, related hooks/data |
| 05 | [05_DATA_MODEL_AND_TYPES.md](./05_DATA_MODEL_AND_TYPES.md) | TypeScript interfaces, entities, relationships, mock data, inconsistencies |
| 06 | [06_DATAFLOW_AND_STATE_MANAGEMENT.md](./06_DATAFLOW_AND_STATE_MANAGEMENT.md) | Zustand stores, hooks, context providers, services, data loading |
| 07 | [07_FEATURE_MODULES.md](./07_FEATURE_MODULES.md) | Per-module documentation: purpose, files, data, current state, risks |
| 08 | [08_CES_EVENTS_TASKS_FORMS_EVIDENCE_MAP.md](./08_CES_EVENTS_TASKS_FORMS_EVIDENCE_MAP.md) | CES/event/task/form/evidence/signature architecture deep-dive |
| 09 | [09_BRAD_AND_AI_ARCHITECTURE.md](./09_BRAD_AND_AI_ARCHITECTURE.md) | Brad/iAdministrator AI files, RAG engine, local vs mocked mode |
| 10 | [10_SECURITY_PRIVACY_AND_PHI_BOUNDARY.md](./10_SECURITY_PRIVACY_AND_PHI_BOUNDARY.md) | API calls, external services, storage, PHI risks, recommended controls |
| 11 | [11_BUILD_DEPLOY_AND_ENVIRONMENT.md](./11_BUILD_DEPLOY_AND_ENVIRONMENT.md) | Scripts, env vars, Vite/build config, Vercel/AWS references |
| 12 | [12_KNOWN_ISSUES_AND_ARCHITECTURE_RISKS.md](./12_KNOWN_ISSUES_AND_ARCHITECTURE_RISKS.md) | Confirmed issues, duplicate implementations, broken imports, hard-coded demo logic |
| 13 | [13_IMPLEMENTATION_READINESS_FOR_CLINICIAN_CLIENT_PROFILE.md](./13_IMPLEMENTATION_READINESS_FOR_CLINICIAN_CLIENT_PROFILE.md) | Readiness assessment and recommendations for Clinician/Client profile feature |
| 14 | [14_DOCUMENTATION_CHANGELOG.md](./14_DOCUMENTATION_CHANGELOG.md) | Generation date, files created, known limitations, areas for human review |

---

## Quick Reference

### Entry Points
- **Frontend root:** `src/main.tsx` → `src/App.tsx`
- **Backend root:** `server/index.ts` (Express, port 8787)
- **Dev command:** `npm run dev` (concurrently runs Vite + Express)
- **Build command:** `npm run build`

### Key Paths
| Path | Role |
|------|------|
| `src/App.tsx` | All route definitions |
| `src/auth/AuthProvider.tsx` | Auth context (Cognito + demo bypass) |
| `src/policy/` | Entire application domain |
| `src/policy/ces/` | Compliance Execution Sprint System |
| `src/policy/ecign/` | Electronic Signature (eCIgn) |
| `src/policy/journey/` | Training / LMS module |
| `src/policy/pages/iAdministrator/` | Brad AI assistant UI |
| `server/ia/` | Local RAG engine (Ollama) |
| `server/ecign/` | eCIgn backend + JSONL persistence |
| `Builder/Documentations/` | Planning and reference documents |

### Architecture in One Line
> React 19 SPA (Vite) + Express backend + AWS Cognito auth + DynamoDB + Google Calendar + local Ollama RAG + JSONL-based eCIgn persistence + Zustand state
