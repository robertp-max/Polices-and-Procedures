# 01 — Current State Overview

**Project:** CI Policy App (`ci-policy-app`)
**Organization:** Care Indeed Home Health
**Generated:** 2026-05-12

---

## Project Name and Purpose

The **Care Indeed Compliance Platform** (package name: `ci-policy-app`) is a React + Express fullstack web application designed to serve as a unified compliance command center for a home health agency seeking ACHC accreditation. Its core mission is to:

1. **Manage and surface policies and procedures** across all ACHC-required domains
2. **Run compliance execution sprints (CES)** — scheduled, audit-ready evidence cycles
3. **Produce electronically signed evidence packets (eCIgn)** for regulatory submission
4. **Train staff** through a structured journey/LMS module system
5. **Provide an AI compliance assistant (iAdministrator / Brad)** backed by a local RAG engine
6. **Track onboarding** of new employees against required documentation and training

---

## Current App Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (React 19 SPA)                                     │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────┐ │
│  │ Auth    │ │ Policy   │ │  CES / eCIgn │ │  Journey   │ │
│  │Cognito  │ │ Library  │ │  Execution   │ │  LMS       │ │
│  └────┬────┘ └──────────┘ └──────┬───────┘ └────────────┘ │
│       │                          │                          │
│  Zustand Stores (in-memory, no server sync for most)       │
└───────┬──────────────────────────┬──────────────────────────┘
        │ /api/*                   │ /api/ecign, /api/pm
        ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Express API Server (port 8787, tsx watch)                  │
│  /api/auth      → AWS Cognito (user pool, SES email)        │
│  /api/calendar  → Google Calendar API                       │
│  /api/ecign     → JSONL files (server/ecign/data/*.jsonl)   │
│  /api/ia        → Ollama local LLM (RAG over Builder/)      │
│  /api/pm        → PM task layer                             │
│  /api/compliance→ Compliance data                           │
│  /api/audit     → Audit log (AWS DynamoDB)                  │
│  /api/hubstaff  → Hubstaff time-tracking integration        │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack (Detected)

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.4 | UI framework |
| React Router DOM | 7.13.2 | Client-side routing |
| Zustand | 5.0.12 | Global state management |
| TypeScript | 5.9.3 | Type safety |
| Vite | 8.0.1 | Build tool + dev server |
| Tailwind CSS | 3.4.17 | Utility CSS styling |
| Lucide React | 1.7.0 | Icon library |
| @dnd-kit | 6.x / 10.x | Drag-and-drop (sprint board) |
| html2pdf.js | 0.14.0 | Client-side PDF generation |
| pdf-lib | 1.17.1 | PDF manipulation |
| mammoth | 1.12.0 | DOCX parsing |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Express | 4.21.1 | HTTP API server |
| tsx | 4.19.2 | TypeScript execution (dev) |
| @aws-sdk/client-cognito-identity-provider | 3.922.0 | Authentication |
| @aws-sdk/client-dynamodb + lib-dynamodb | 3.922.0 | Database (audit logs, user data) |
| @aws-sdk/client-ses | 3.922.0 | Transactional email |
| googleapis | 144.0.0 | Google Calendar API |
| cors | 2.8.5 | CORS middleware |
| dotenv | 16.4.5 | Environment config |

### AI / RAG
| Technology | Purpose |
|---|---|
| Ollama (local) | LLM inference host (llama3.1:8b-instruct-q4_K_M) |
| nomic-embed-text | Embedding model for corpus indexing |
| gradflow | 0.1.0 — workflow graph utility |
| BM25 fallback | Lexical-only index when Ollama unavailable |

### Infrastructure (Detected References)
| Service | Purpose |
|---|---|
| AWS Cognito | User pool auth / JWT |
| AWS DynamoDB | Registration table, audit events |
| AWS SES | Email delivery (registration, reset) |
| Google Calendar | Regulatory event planner |
| Vercel | Frontend deployment (vercel.json present) |
| AWS CDK (infra/demo-auth-cdk) | Auth infrastructure as code |

### Testing
| Tool | Purpose |
|---|---|
| Playwright | End-to-end testing |
| Custom check scripts (scripts/*.ts) | Verification/smoke tests |

---

## Main Folders and Purpose

| Folder | Purpose |
|---|---|
| `src/` | Frontend application source |
| `src/auth/` | Auth context, login/register pages, ProtectedRoute |
| `src/policy/` | Entire compliance application domain |
| `src/policy/ces/` | Compliance Execution Sprint System |
| `src/policy/ecign/` | Electronic signature client layer |
| `src/policy/journey/` | Training / LMS module player |
| `src/policy/onboarding/` | Onboarding V1 (partial — older) |
| `src/policy/onboarding-v2/` | Onboarding V2 (audit-grade activation engine) |
| `src/policy/pages/iAdministrator/` | Brad AI assistant UI |
| `src/policy/data/` | Static / generated data files (mock corpus) |
| `src/policy/stores/` | Zustand stores |
| `src/policy/pm/` | PM layer types, stores, task projection |
| `src/policy/security/` | Authorization, audit log, role hierarchy |
| `src/services/` | Brad context builder, mock engine |
| `server/` | Express backend |
| `server/ia/` | Local RAG engine (Ollama integration) |
| `server/ecign/` | eCIgn signature lifecycle backend |
| `server/ecign/data/` | JSONL persistence files (signatures, form instances) |
| `server/auth/` | Cognito auth service |
| `server/routes/` | Express route handlers |
| `Builder/` | Planning docs, architecture analysis, training blueprints |
| `Builder/Documentations/` | Reference documentation, migration records |
| `Builder/Journey/` | ACHC training module blueprints |
| `Builder/Compliance-Execution-Sprints/` | CES planning docs |
| `infra/` | AWS CDK infrastructure code |
| `scripts/` | Utility/verification scripts (~46 files) |
| `migrations/` | Database migration scripts |
| `public/` | Static assets |
| `dist/` | Built frontend (gitignored in dev) |

---

## Active Modules / Features Detected

| Module | Status |
|---|---|
| Policy Library | Active |
| Policy Lifecycle (Draft/Review/Approve/Publish) | Active |
| Master Calendar + Event Execution | Active |
| CES (Compliance Execution Sprints) | Active |
| Evidence Center | Active |
| eCIgn (Electronic Signatures) | Active (partial — JSONL backend, demo mode available) |
| iAdministrator / Brad AI | Active (partial — local Ollama or mock fallback) |
| Journey / LMS Training | Active |
| Onboarding V2 | Active |
| ACHC Survey Alignment | Active |
| Workflow Library | Active |
| Governance Page | Active |
| PM Layer (Sprint Plan/Review, Approvals) | Active |
| Master Control Inventory | Active |
| Framework / Taxonomy | Active |
| Audit Mode | Active |
| Admin (Users/Roles/Permissions) | Active |
| Hubstaff Integration | Partial (staging page present) |
| Google Calendar Sync | Partial (server route present, sync scripts present) |
| Demo pages (DemoPage, DemoPhase2, DemoPhase3) | Demo/staging |
| Onboarding V1 | Partial / legacy |

---

## Known Incomplete or Broken Areas

| Area | Issue |
|---|---|
| eCIgn persistence | Backend uses JSONL flat files — not scalable, no transactions |
| iAdministrator RAG | Requires local Ollama install; falls back to mock engine |
| Demo auth bypass | `VITE_LOCAL_DEMO_AUTH_BYPASS=true` hardcodes a demo user — risk in shared/prod environments |
| `DashboardPage.tsx.backup` | Orphaned backup file in `src/policy/pages/` |
| `MasterCalendarPage.tsx.backup` | Orphaned backup file in `src/policy/pages/` |
| `TaxonomyPage.old.tsx` | Old version still in repo |
| `server/credentials/service-account.json` | **Credential file tracked in repo directory** (high risk) |
| `tmp-*` files at root | ~20 temp/debugging files in root directory |
| Onboarding V1 vs V2 | Two parallel implementations with no clear deprecation path |
| State persistence | Most Zustand stores are in-memory only — data lost on refresh |
| Clinician/Client profiles | Not implemented — no model, route, or component exists |
| Audit trail | `server/audit/` exists but completeness of logging is unclear |

---

## What Appears Production-Like vs Demo/Mock

| Area | Assessment |
|---|---|
| Auth (Cognito + SES) | Production-like — real AWS integration wired |
| Policy Library | Production-like — real content, lifecycle states |
| CES Engine | Production-like — state machine, sprint logic implemented |
| eCIgn signatures | Partial — backend logic exists; JSONL store is dev-grade |
| iAdministrator | Demo/mock by default — requires Ollama local LLM to be real |
| Journey/LMS | Production-like structure; content completeness varies per module |
| Google Calendar sync | Demo/staging — wired but requires calendar credentials |
| Hubstaff staging page | Demo/staging |
| DemoPage, DemoPhase2, DemoPhase3 | Explicit demo pages |
| Brad Proposal page | Hidden executive demo page |
| Admin user management | Partial — UI exists; DynamoDB-backed in real mode |
