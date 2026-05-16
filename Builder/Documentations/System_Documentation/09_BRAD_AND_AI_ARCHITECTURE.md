# 09 — Brad and AI Architecture (iAdministrator)

**Generated:** 2026-05-12

---

## Overview

**iAdministrator** (internally referred to as "Brad") is an AI-powered compliance assistant embedded in the app. It answers natural language questions about policies, regulatory events, tasks, and compliance requirements. It is accessible at route `/iadministrator`.

The system has **two modes**:
1. **Local RAG mode** (production intent) — uses a local Ollama LLM with BM25/vector index over the internal policy corpus
2. **Mock mode** (demo fallback) — uses `mockBradEngine.ts` to return structured canned responses

---

## Existing Brad-Related Files

### Frontend (Client)

| File | Role |
|---|---|
| `src/policy/pages/iAdministrator/index.tsx` | Main page component |
| `src/policy/pages/iAdministrator/components/ChatThread.tsx` | Chat message thread |
| `src/policy/pages/iAdministrator/components/CommandBar.tsx` | Query input bar |
| `src/policy/pages/iAdministrator/components/StructuredAnswer.tsx` | Structured AI response display |
| `src/policy/pages/iAdministrator/components/ScenarioResponse.tsx` | Scenario-specific response renderer |
| `src/policy/pages/iAdministrator/components/ScenarioActionSections.tsx` | Action plan sections |
| `src/policy/pages/iAdministrator/components/CitationChips.tsx` | Policy citation chips |
| `src/policy/pages/iAdministrator/components/ReferenceCards.tsx` | Referenced policy cards |
| `src/policy/pages/iAdministrator/components/ReferenceLink.tsx` | In-line policy link |
| `src/policy/pages/iAdministrator/components/ReferenceText.tsx` | Citation text display |
| `src/policy/pages/iAdministrator/components/BradHelpCenter.tsx` | Brad-specific help |
| `src/policy/pages/iAdministrator/components/ActiveCasePanel.tsx` | Active case/event context panel |
| `src/policy/pages/iAdministrator/components/AvailableActions.tsx` | Recommended actions |
| `src/policy/pages/iAdministrator/components/RegulatoryAlerts.tsx` | Regulatory alert surface |
| `src/policy/pages/iAdministrator/components/RequirementsSnapshot.tsx` | Requirements overview |
| `src/policy/pages/iAdministrator/components/RightPanelPreview.tsx` | Right panel preview |
| `src/policy/pages/iAdministrator/components/HealthStrip.tsx` | Compliance health strip |
| `src/policy/pages/iAdministrator/components/EmergencyBanner.tsx` | Emergency situation banner |
| `src/policy/pages/iAdministrator/components/OperationalGaps.tsx` | Operational gap analysis |
| `src/policy/pages/iAdministrator/components/NoAnswer.tsx` | No-answer fallback |
| `src/policy/pages/iAdministrator/components/FormRenderer.tsx` | Form rendering within IA context |
| `src/policy/pages/iAdministrator/components/RiskBadge.tsx` | Risk level badge |
| `src/policy/pages/iAdministrator/components/StudioTabs.tsx` | Tab navigation |
| `src/policy/pages/iAdministrator/lib/useIa.ts` | Main IA hook |
| `src/policy/pages/iAdministrator/lib/iaClient.ts` | HTTP client → `/api/ia/*` |
| `src/policy/pages/iAdministrator/lib/classifyScenario.ts` | Client-side scenario classifier |
| `src/policy/pages/iAdministrator/lib/complianceActionMap.ts` | Compliance action definitions |
| `src/policy/pages/iAdministrator/lib/demoCriticalEmergency.ts` | Demo emergency scenario data |
| `src/policy/pages/iAdministrator/lib/referenceRouting.ts` | Policy reference routing |
| `src/policy/pages/iAdministrator/lib/responseTypes.ts` | Response type definitions |
| `src/policy/pages/iAdministrator/lib/sessionTypes.ts` | Session type definitions |
| `src/services/bradAppContext.ts` | Builds Brad context from Zustand stores |
| `src/services/mockBradEngine.ts` | Mock AI engine (demo fallback) |
| `src/policy/brad/useBradWorkflow.ts` | Brad workflow hook |
| `src/policy/brad/workflowKnowledge.ts` | Workflow knowledge base |
| `src/policy/brad/workflowRuntime.ts` | Workflow runtime |
| `src/policy/brad/workflowSchedule.ts` | Workflow scheduling |

### Backend (Server)

| File | Role |
|---|---|
| `server/ia/service.ts` | ★ IaService — main RAG service class |
| `server/ia/routes.ts` | `/api/ia/*` Express routes |
| `server/ia/ollama.ts` | Ollama API client |
| `server/ia/prompt.ts` | Prompt templates |
| `server/ia/responder.ts` | Response assembly |
| `server/ia/retrieval.ts` | RAG retrieval logic |
| `server/ia/scenarioClassifier.ts` | Server-side scenario classification |
| `server/ia/types.ts` | Backend IA types |
| `server/ia/README.md` | IA module documentation |
| `server/ia/index/embeddings.ts` | Embedding generation |
| `server/ia/index/search.ts` | Index search |
| `server/ia/index/store.ts` | Index store (JSON vectors) |
| `server/ia/ingest/chunker.ts` | Document chunking |
| `server/ia/ingest/index.ts` | Ingest entry point |
| `server/ia/ingest/metadata.ts` | Document metadata |
| `server/ia/ingest/normalize.ts` | Text normalization |
| `server/ia/ingest/parsers.ts` | Document parsers (MD, DOCX, etc.) |
| `server/ia/ingest/sources.ts` | Source file discovery |
| `server/ia/operational/seed.ts` | Operational knowledge seed |
| `server/ia/operational/service.ts` | Operational knowledge service |
| `server/ia/regulatory/feed.ts` | Regulatory feed |
| `server/ia/regulatory/matcher.ts` | Regulatory event matcher |
| `server/ia/session/audit.ts` | Session audit log |
| `server/ia/session/classifier.ts` | Session classifier |
| `server/ia/session/envelope.ts` | Session envelope |
| `server/ia/session/manager.ts` | Session manager |
| `server/ia/session/store.ts` | Session store (in-memory) |
| `server/ia/session/types.ts` | Session types |
| `server/cli/build-index.ts` | CLI: build IA index (npm run ia:index) |
| `server/sync/bradNotifier.ts` | Brad notification service |

### Planning / Spec Files in Builder

| File | Role |
|---|---|
| `Builder/Brad2-Business-Risk-Architecture/` | Business risk + Brad architecture docs |
| `Builder/Documentations/Brad2-README.md` | Brad 2.0 documentation readme |
| `Builder/UserProfiles/Architecture` | User profile architecture (936 lines) |

---

## Current Mode: Local vs Mocked

### Local RAG Mode (When Ollama is running)

**Setup:**
1. Install Ollama locally at `http://127.0.0.1:11434`
2. Pull models: `ollama pull llama3.1:8b-instruct-q4_K_M` and `ollama pull nomic-embed-text`
3. Build index: `npm run ia:index`
4. Start app: `npm run dev`

**Index location:** `.cache/ia-index` (gitignored)

**Index build process (`server/cli/build-index.ts`):**
1. Discovers documents in `Builder/` subtree via `server/ia/ingest/sources.ts`
2. Parses and normalizes documents (`parsers.ts`, `normalize.ts`)
3. Chunks documents (`chunker.ts`)
4. Generates embeddings via Ollama (`embeddings.ts`)
5. Stores vectors + metadata in `.cache/ia-index/` JSON files

**Query path:**
1. User submits query via `CommandBar`
2. `useIa` hook calls `iaClient.ts` → `POST /api/ia/query`
3. `server/ia/service.ts` classifies scenario (`scenarioClassifier.ts`)
4. Retrieves relevant chunks (`retrieval.ts` via `search.ts`)
5. Builds prompt with context (`prompt.ts`)
6. Sends to Ollama chat model
7. Assembles and returns structured response (`responder.ts`)

### Mock Mode (When Ollama is NOT running)

**Activation:**
- Automatic fallback when Ollama is unavailable
- OR when running in demo mode

**File:** `src/services/mockBradEngine.ts`

This file contains a **large (~526+ lines) mock engine** that returns structured responses based on scenario classification. It uses `classifyScenario` and `getComplianceActionDefinition` from the client-side libs to generate contextually appropriate mock answers without any LLM calls.

**Mock response types detected:**
- `BradResponse` with `answer`, `citations`, `qapi`, `actionPlan`, `governingBody`
- `BradCitation` pointing to real policy IDs and sections

---

## Data Sources Brad Can Currently Access

### In RAG Mode (via corpus index)
- All documents in `Builder/` subtree (policies, procedures, appendices, markdown docs)
- ACHC standards data (from generated files if included in corpus)
- Builder planning docs (architectural risk — planning docs should be excluded from corpus)

### In Mock Mode (via bradAppContext.ts + stores)
- `policyStore` — policy list and metadata
- `complianceExecutionStore` — current CES events and sprint state
- `calendarStore` — calendar events
- `formsCatalog.ts` — forms list

### NOT Currently Accessible
- Live DynamoDB data (audit logs, user data)
- Real-time eCIgn signature state (JSONL backend)
- External regulatory feeds
- Clinician/client profile data (does not exist yet)

---

## Data Sources Brad Appears Intended to Access

Based on the architecture files in `Builder/Brad2-Business-Risk-Architecture/` and the operational service structure:
- Live compliance event state from the CES engine
- Task completion status and evidence readiness
- Regulatory feed for upcoming requirements
- User session context (who is asking, their role, their assigned tasks)
- Operational knowledge seed (`server/ia/operational/seed.ts`)

---

## Safety Boundaries

| Boundary | Current Status |
|---|---|
| PHI in corpus | Risk — if `Builder/` contains any PHI or PII, it will be indexed. Content should be audited before indexing. |
| Session isolation | `server/ia/session/manager.ts` manages sessions — isolation completeness unclear |
| Audit logging | `server/ia/session/audit.ts` — session audit present |
| Rate limiting | Not detected — no rate limiter on `/api/ia/*` |
| Input sanitization | Unclear — prompts are user-submitted text |
| Demo emergency scenarios | `demoCriticalEmergency.ts` contains hardcoded emergency scenario data — should not contain real PHI |
| API authentication | Identity middleware (`server/identity/middleware.ts`) runs on all `/api/*` — but IA route auth completeness unclear |

---

## Gaps Between Intended Architecture and Current Implementation

| Gap | Description |
|---|---|
| Ollama dependency | Production deployment requires local Ollama — not cloud-deployable in current form without cloud LLM swap |
| Index rebuild required | After any content change, `npm run ia:index` must be run manually — no auto-rebuild |
| No streaming | Response streaming not detected — full response assembled before return |
| No conversation memory | Sessions exist but cross-session memory is unclear |
| Mock mode in production | `mockBradEngine.ts` is a frontend file that will be bundled into production — creates confusion about whether responses are real |
| Planning docs in corpus | `Builder/Brad2-Business-Risk-Architecture/` contains sensitive architecture analysis — if indexed, Brad would have access to internal risk assessments |
| No PHI guardrail | No detected PHI filtering on corpus ingestion or query response |
| Brad workflow vs IA service | `src/policy/brad/` (workflow hooks) and `server/ia/` (RAG service) appear to be parallel implementations — relationship unclear |
| Brad Proposal page | `src/policy/pages/BradProposal/index.tsx` is a hidden executive demo page — unclear if it uses the real IA service or mock |
