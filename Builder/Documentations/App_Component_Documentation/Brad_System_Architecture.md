# Brad System Architecture

Scope: `src/policy/pages/iAdministrator/*`, `server/ia/*`, and related routing/service infrastructure.

---

## 1) End-to-End Request Flow

## Query mode (`POST /api/ia/query`)

1. User submits command from `IAdministratorPage`.
2. `useIaQuery()` in `src/policy/pages/iAdministrator/lib/useIa.ts` calls `iaClient.queryStream(...)`.
3. Client opens SSE stream to `POST /api/ia/query` (`Accept: text/event-stream`).
4. `createIaRouter()` delegates to `IaService.answer(...)`.
5. `IaService`:
   - classifies scenario (`scenarioClassifier`)
   - runs retrieval (`retrieval.ts`)
   - emits phase-1 metadata (top docs, intent, chunk count)
   - enriches with operational/regulatory context
   - calls `generateStructuredResponse(...)` (`responder.ts`)
6. SSE sends `phase1` then `complete` payload back to UI.
7. UI updates right panel and response sections.

## Chat mode (`POST /api/ia/chat`)

1. `useChatThread()` calls `iaClient.chatStream(...)`.
2. Backend `IaService.answerInThread(...)`:
   - `processTurn(...)` (session classification + retrieval query enrichment)
   - retrieval
   - context envelope build
   - structured response generation
   - deterministic safety enforcement
   - session update + audit entry write
3. SSE returns `phase1` then final turn result (threadId + message + session summary).

---

## 2) Retrieval Sources

- Corpus discovery (`server/ia/ingest/sources.ts`):
  - `Builder/`
  - `Builder/Policies/`
  - `Builder/Forns/`
- Parsed and chunked corpus stored in IA index:
  - `.cache/ia-index/manifest.json`
  - `.cache/ia-index/docs.json`
  - `.cache/ia-index/docs-content.json`
  - `.cache/ia-index/chunks.json`
- Retrieval stack:
  - lexical BM25 (`server/ia/index/search.ts`)
  - optional embedding similarity (`server/ia/index/embeddings.ts`)
  - explicit ID pinning and intent/domain filtering (`server/ia/retrieval.ts`)

---

## 3) Safeguards and Deterministic Controls

## Readiness and fallback

- If index not loaded: returns `not_ready` with rebuild guidance.
- If embedding fails and not required: lexical-only mode continues.
- Rebuild lock prevents concurrent rebuild collisions.

## Response integrity guardrails (`server/ia/responder.ts`)

- LLM output required in JSON mode.
- Citation materialization only from retrieval passage map (not arbitrary LLM doc IDs).
- Invalid/non-taxonomy IDs filtered.
- Raw corpus dump regex check suppresses unsafe direct answer.
- Hedged “not explicitly stated” patterns can force `noAnswerFound`.

## High-stakes scenario safeguards

- Scenario classification precedes retrieval.
- If no hits and scenario is high-stakes, returns deterministic scenario answer (no no-answer dead-end).
- Chat mode deterministic emergency enforcement prepends:
  - `EMERGENCY — Call 911 immediately.` when life-safety flag is active.

## Session and data quality controls

- Session state and summaries are server-managed per thread.
- Optional audit logging captures turn metadata.
- If data envelope is seed-only, confidence is capped to medium.

---

## 4) Response Shaping

Structured payload includes:
- `directAnswer`
- `operationalRequirement`
- `riskLevel`, `confidence`, `systemConfidenceScore`
- `governingPolicyId`
- `enforcementLevel`
- `requirementsSnapshot`
- `citations`
- `linkedReferences`
- `availableActions`
- optional `operationalGaps`, `lifecycleAlerts`, `regulatoryAlerts`
- `phaseStatus`
- optional scenario metadata

Purpose:
- Ensure Brad output is actionable, auditable, and anchored to known documents.

---

## 5) Known QA Issues / Architectural Friction

1. `useBradWorkflow` deterministic frontend workflow answer modules (`src/policy/brad/*`) do not appear wired into `IAdministratorPage` request path.
2. Mixed messaging in comments/docs around “no chat history” vs current active thread/session chat support.
3. Local-only runtime assumptions (in-memory sessions + local index) may limit horizontal scale behavior.
4. `static_deploy` fallback exists client-side, implying environments where backend may be absent.
5. Prompt + rule heuristics are mostly regex/rule-driven and may have false positive/false negative classification behavior.

---

## 6) Rule System

- Intent rules: `server/ia/retrieval.ts` (`INTENT_PATTERNS`, `DOMAIN_HINTS`)
- Scenario rules: `server/ia/scenarioClassifier.ts`
- Session classifier rules: `server/ia/session/classifier.ts`
- Enforcement/risk shaping:
  - responder risk elevation and enforcement level coercion
  - emergency hard enforcement in chat path
  - no-answer handling and scenario override logic

---

## 7) Limitations

- Single-node/local-state design for session and index.
- Depends on local Ollama availability for full structured generation.
- Corpus quality directly determines retrieval quality.
- Optional lexical-only fallback can reduce precision.
- Frontend deterministic Brad workflow modules likely underutilized (`Needs confirmation`).

---

## 8) Needs Confirmation

1. Should `src/policy/brad/useBradWorkflow.ts` be integrated into active iAdministrator flow?
2. Is production expected to run with full backend for all deployments, or static-only mode for some?
3. Should IA sessions/audit logs persist to durable shared storage in production architecture?

