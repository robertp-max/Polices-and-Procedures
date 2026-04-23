# iAdministrator — Comprehensive End-User Manual
## Care Indeed Home Health Care, Inc. | Compliance Intelligence Engine

**Version:** 2.0 (Operational Compliance Monitoring Platform)  
**Built:** April 2026  
**Classification:** Internal — Tier 2 Restricted  
**Architecture:** Local-First RAG (Retrieval-Augmented Generation)  

---

## Table of Contents

1. [What iAdministrator Is](#1-what-iadministrator-is)
2. [What It Is Not](#2-what-it-is-not)
3. [System Architecture](#3-system-architecture)
4. [Full Pipeline Flowchart](#4-full-pipeline-flowchart)
5. [Data Flow: End-to-End Request Lifecycle](#5-data-flow-end-to-end-request-lifecycle)
6. [The Corpus Model](#6-the-corpus-model)
7. [The Response Contract](#7-the-response-contract)
8. [UI Layout and Components](#8-ui-layout-and-components)
9. [How to Issue Compliance Commands](#9-how-to-issue-compliance-commands)
10. [Studio Output Modes](#10-studio-output-modes)
11. [Citation and Reference System](#11-citation-and-reference-system)
12. [The Right-Panel Execution Workspace](#12-the-right-panel-execution-workspace)
13. [Health Strip and Index Management](#13-health-strip-and-index-management)
14. [Available Actions](#14-available-actions)
15. [Risk Levels and Confidence Scores](#15-risk-levels-and-confidence-scores)
16. [Intent Classification System](#16-intent-classification-system)
17. [Local Setup and Run Instructions](#17-local-setup-and-run-instructions)
18. [Environment Variables Reference](#18-environment-variables-reference)
19. [npm Scripts Reference](#19-npm-scripts-reference)
20. [Index Build and Rebuild](#20-index-build-and-rebuild)
21. [API Reference](#21-api-reference)
22. [Security and Boundary Model](#22-security-and-boundary-model)
23. [Performance Reference](#23-performance-reference)
24. [Troubleshooting](#24-troubleshooting)
25. [Staged Future Capabilities](#25-staged-future-capabilities)
26. [Glossary](#26-glossary)

---

## 1. What iAdministrator Is

iAdministrator is a **local-first compliance intelligence engine** built specifically for Care Indeed Home Health Care, Inc. It functions as a compliance operating system: you issue a command, it retrieves relevant passages from the internal governed corpus, and it returns a structured, citation-backed answer with actionable references.

It is modeled on the concept of NotebookLM — a document-grounded intelligence system — but specialized for:

- **Survey readiness** (pre-survey audits, gap identification)
- **Governing body documentation** (executive briefs, board preparation)
- **QAPI oversight** (quality digest, performance indicators)
- **Clinical operations** (Plan of Care, OASIS, billing prerequisites)
- **Compliance execution** (action plans, form lookup, policy navigation)

**The authority is the corpus.** Every answer traces to a specific passage in a real policy, procedure, form, or appendix. The system will explicitly tell you when the corpus does not support an answer rather than invent one.

---

## 2. What It Is Not

| iAdministrator IS | iAdministrator IS NOT |
|---|---|
| A compliance command interface | A conversational chatbot |
| Grounded in one internal corpus | Connected to the internet |
| Returning structured typed JSON | Returning free-form prose |
| Citation-backed against real policies | Hallucinating invented policies |
| Corpus-authoritative | Relying on general LLM training |
| A compliance operating system | A search engine |
| Local — nothing leaves localhost | A cloud service |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 19 + Vite)                        │
│                                                                            │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │  CommandBar  │  │ StudioTabs │  │ StructuredAnswer │  │ RightPanel │  │
│  │  (input)     │  │ (intent UI)│  │ CitationChips    │  │  Preview   │  │
│  │              │  │            │  │ ReferenceCards   │  │(exec wksp) │  │
│  │              │  │            │  │ AvailableActions │  │            │  │
│  └──────┬───────┘  └─────┬──────┘  └────────┬─────────┘  └─────┬──────┘  │
│         │                │                   │                   │         │
│         └────────────────┴──────────┬────────┘                   │         │
│                                     │useIaQuery / useIaReference  │         │
│                                     │iaClient.ts                  │         │
└─────────────────────────────────────┼─────────────────────────────┼─────────┘
                                      │ HTTP /api/ia/*               │
══════════════════════════════════════╪═════════════════════════════╪══════════
                                      │                             │
┌─────────────────────────────────────┼─────────────────────────────┼─────────┐
│                    BACKEND (Node.js + Express)                               │
│                                     │                             │         │
│  ┌──────────────────────────────────▼──────────────────────────────┐        │
│  │                        IaService (facade)                        │        │
│  │   answer(req)  →  retrieve()  →  generateStructuredResponse()    │        │
│  │   getReference(id)  →  docs Map                                  │        │
│  │   rebuild()    →  ingestCorpus()  →  embedChunks()               │        │
│  └───┬──────────┬──────────────────────┬────────────────────┬──────┘        │
│      │          │                      │                    │               │
│  ┌───▼──┐  ┌────▼──────────────┐  ┌───▼──────┐  ┌─────────▼──────┐        │
│  │Index │  │  Ingestion layer  │  │Retrieval │  │   Responder    │        │
│  │Store │  │  (ingest/*)       │  │+ Intent  │  │   + Prompt     │        │
│  │      │  │                   │  │Classifier│  │   Assembly     │        │
│  │ .json│  │ sources → parsers │  │          │  │                │        │
│  │ files│  │ normalize →       │  │ BM25     │  │ OllamaClient   │        │
│  │      │  │ metadata →        │  │ + cosine │  │ (local LLM)    │        │
│  │      │  │ chunker           │  │ hybrid   │  │                │        │
│  └──────┘  └───────────────────┘  └──────────┘  └────────────────┘        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                              ┌───────▼────────┐
                              │  Ollama (local) │
                              │  llama3.1:8b    │
                              │  nomic-embed    │
                              └────────────────┘
```

### Component Descriptions

| Layer | Module | Responsibility |
|---|---|---|
| **HTTP Routes** | `server/ia/routes.ts` | Express endpoints, request validation, error mapping |
| **Service Facade** | `server/ia/service.ts` | Index lifecycle, owns OllamaClient + LexicalIndex |
| **Retrieval** | `server/ia/retrieval.ts` | Intent classification + hybrid chunk retrieval |
| **Search** | `server/ia/index/search.ts` | BM25 + cosine hybrid, metadata filters, section-title boost |
| **Prompt Assembly** | `server/ia/prompt.ts` | System + user prompt construction, passage block formatting |
| **Responder** | `server/ia/responder.ts` | LLM call, JSON repair, citation materialization, guardrails |
| **Ollama Client** | `server/ia/ollama.ts` | HTTP client for chat + embeddings |
| **Index Store** | `server/ia/index/store.ts` | JSON-persisted vector store, atomic save/load |
| **Embeddings** | `server/ia/index/embeddings.ts` | L2-normalize + Ollama embed calls |
| **Ingestion** | `server/ia/ingest/*` | Source discovery, parsing, normalization, metadata, chunking |
| **Frontend Hooks** | `src/.../lib/useIa.ts` | React state for health, query, reference |
| **Frontend Client** | `src/.../lib/iaClient.ts` | HTTP client for `/api/ia/*` |

---

## 4. Full Pipeline Flowchart

```
╔═══════════════════════════════════════════════════════════════════════╗
║                    INDEX BUILD PIPELINE (one-shot)                    ║
╚═══════════════════════════════════════════════════════════════════════╝

   Builder/Policies/*.{md,docx}
   Builder/Forns/*.txt               ─── SOURCE DISCOVERY ───▶  file list
   Builder/Journey/*.md                  (sources.ts)              │
   Builder/*.md                                                     │
                                                                    ▼
                                         ┌──────────────────────────┐
                                         │  PARSE (parsers.ts)      │
                                         │  .md / .txt → readFile   │
                                         │  .docx → mammoth         │
                                         └──────────────┬───────────┘
                                                        │ raw text
                                                        ▼
                                         ┌──────────────────────────┐
                                         │  NORMALIZE (normalize.ts)│
                                         │  unify line-endings,     │
                                         │  collapse blank lines,   │
                                         │  strip page headers      │
                                         └──────────────┬───────────┘
                                                        │ clean text
                                                        ▼
                                         ┌──────────────────────────┐
                                         │  METADATA (metadata.ts)  │
                                         │  Policy Header table     │
                                         │  → id, title, domain,    │
                                         │    subdomain, type,      │
                                         │    owner, accessTier,    │
                                         │    regulatoryTags,       │
                                         │    reviewCycle,          │
                                         │    linkedIds, sections   │
                                         └──────────────┬───────────┘
                                                        │ CorpusDoc
                                                        ▼
                                         ┌──────────────────────────┐
                                         │  CHUNKER (chunker.ts)    │
                                         │  section-aware: each     │
                                         │  section → 750-token     │
                                         │  chunks, ~80-token       │
                                         │  overlap on paragraph    │
                                         │  boundaries              │
                                         └──────────────┬───────────┘
                                                        │ CorpusChunk[]
                                                        ▼
                                         ┌──────────────────────────┐
                                         │  EMBED (embeddings.ts)   │
                                         │  nomic-embed-text via    │
                                         │  Ollama, L2-normalize,   │
                                         │  768-dim vectors inlined │
                                         └──────────────┬───────────┘
                                                        │ chunks + vectors
                                                        ▼
                                         ┌──────────────────────────┐
                                         │  PERSIST (store.ts)      │
                                         │  .cache/ia-index/        │
                                         │    manifest.json         │
                                         │    docs.json             │
                                         │    docs-content.json     │
                                         │    chunks.json           │
                                         └──────────────────────────┘


╔═══════════════════════════════════════════════════════════════════════╗
║                    QUERY PIPELINE (every command)                     ║
╚═══════════════════════════════════════════════════════════════════════╝

  User types command ─▶  CommandBar.onSubmit()
       (or clicks tab)         │
                               │  { input, intent }
                               ▼
                     useIaQuery.submit()
                               │
                               │ POST /api/ia/query
                               ▼
                     IaService.answer(req)
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
           classifyQuery()         embedQuery()
           (rule-based,            (nomic-embed-text
            intent + IDs           768-dim vector)
            + domain hint)
                    │                     │
                    └──────────┬──────────┘
                               │
                               ▼
                    hybrid search(BM25 + cosine)
                    + section-title boost
                    + domain hard-filter (question/artifact)
                    + type filter (missing_items)
                    + explicit-ID pin (direct match boost)
                    + active-doc bias
                               │
                               │ top-K ScoredChunk[]
                               ▼
                    buildPrompt()
                    ┌──────────────────────────────┐
                    │  SYSTEM:                      │
                    │    authority boundary rules   │
                    │    mode directive (intent)    │
                    │    JSON schema command        │
                    │  USER:                        │
                    │    COMMAND: <user input>      │
                    │    CORPUS: [P1] … [PK]        │
                    │    INSTRUCTION: (JSON only)   │
                    └──────────────────────────────┘
                               │
                               ▼
                    ollama.chat({ format: 'json',
                                  temp: 0.15 })
                               │
                               │ raw JSON string
                               ▼
                    parseLLMJson() — repair attempts:
                    1. direct JSON.parse
                    2. strip markdown fences
                    3. extract first { … } block
                               │
                               ▼
                    materializeCitations()
                    — passage IDs → real doc metadata
                    — never trusts free-form LLM doc names

                    buildLinkedReferences()
                    — rank by: direct match > requiredArtifacts
                      > requirementsSnapshot > retrieval order
                    — filter to valid XX-XX-NNN IDs only
                    — cap at 8

                    buildAvailableActions()
                    — open_* for top 3 refs
                    — generate_* for all other intents
                               │
                               ▼
                    StructuredResponse (typed JSON)
                               │
                        HTTP 200 response
                               │
                               ▼
                    useIaQuery receives → setState
                               │
                               ▼
                    ResponseStack renders:
                    ├── StructuredAnswer
                    ├── RequirementsSnapshot
                    ├── CitationChips
                    ├── ReferenceCards
                    └── AvailableActions

                    RightPanelPreview auto-loads
                    first linkedReference
```

---

## 5. Data Flow: End-to-End Request Lifecycle

```
Browser Tab                 React (useIaQuery)           Express Server
────────────                ──────────────────           ──────────────
[User types command]
      │
      ▼
[CommandBar onSubmit]
      │  input + intent
      ▼
[iaClient.query()]  ──── POST /api/ia/query ────────▶  [routes.ts]
                                                             │ validate
                                                             ▼
                                                       [IaService.answer()]
                                                             │
                                                     ┌───────┴────────┐
                                                     │                │
                                                  retrieve()    (async)
                                                     │
                                              ┌──────┴───────┐
                                              │              │
                                         classifyQuery   embedQuery
                                              │              │ (Ollama)
                                              └──────┬───────┘
                                                     │
                                               search(BM25+cos)
                                                     │
                                                 top-K hits
                                                     │
                                              buildPrompt()
                                                     │
                                           ollama.chat() ─────▶ Ollama
                                                     │ ◀─────── JSON
                                                     │
                                          parseLLMJson()
                                          materializeCitations()
                                          buildLinkedReferences()
                                          buildAvailableActions()
                                                     │
                                           StructuredResponse
                                                     │
[StructuredResponse JSON] ◀── HTTP 200 ─────────────┘
      │
      ▼
[setState(response)]
      │
      ▼
[ResponseStack renders]
  ├── StructuredAnswer (direct answer, risk, op-req)
  ├── RequirementsSnapshot (gap checklist)
  ├── CitationChips (policy citations)
  ├── ReferenceCards (linked docs)
  └── AvailableActions (buttons)
      │
      ▼ (auto-load first ref)
[reference.load(id)] ─── GET /api/ia/references/:id ─▶ [IaService.getReference()]
                                                              │
[RightPanelPreview]  ◀── ReferencePreview ────────────────────┘
```

---

## 6. The Corpus Model

### Source Layout

```
Builder/
├── Policies/                  ← policy markdown + docx files
│   ├── CIHHPP's.md            ← master policy narrative
│   ├── Governing-Body-*.md    ← governance policies
│   └── *.docx                 ← additional policy documents
├── Forns/                     ← forms (KEY:VALUE front-matter + body)
│   ├── CL-FM-001.txt          ← Clinical forms
│   ├── GV-FM-001.txt          ← Governance forms
│   ├── HR-FM-*.txt            ← HR forms
│   ├── FN-FM-*.txt            ← Finance forms
│   ├── QA-FM-*.txt            ← QAPI forms
│   ├── CO-FM-*.txt            ← Compliance forms
│   ├── OP-FM-*.txt            ← Operations forms
│   ├── EN-FM-*.txt            ← Enterprise forms
│   ├── RM-FM-*.txt            ← Risk Mgmt forms
│   └── IT-FM-*.txt            ← IT forms
└── Journey/                   ← onboarding and role journeys
```

### Domain Taxonomy

| Code | Domain | Examples |
|---|---|---|
| `GV` | Governance | Governing body, board authority, administrator |
| `CO` | Compliance | HIPAA, CMIA, credentialing, audit trails |
| `QA` | Quality Assurance | QAPI, PI projects, performance indicators |
| `CL` | Clinical | Plan of care, OASIS, wound care, infection control |
| `HR` | Human Resources | Hiring, onboarding, personnel records |
| `FN` | Finance | Billing, Medicare/PDGM, revenue cycle |
| `IT` | Information Technology | EHR, cybersecurity, data breach |
| `OP` | Operations | Intake, scheduling, field dispatch |
| `RM` | Risk Management | Incidents, emergency, OSHA, safety |
| `EN` | Enterprise | Policy library, taxonomy, exception/waiver |

### Document ID Format

```
XX-YY-NNN
│  │  └── sequential number (001–999)
│  └───── subdomain (2–3 chars): FM=form, CP=compliance policy,
│                                 BC=billing compliance, GB=governing body,
│                                 SC=security, HR=human resources, etc.
└──────── domain (2 chars): GV, CO, QA, CL, HR, FN, IT, OP, RM, EN
```

Examples: `GV-GB-001`, `CL-FM-034`, `FN-BC-001`, `CO-CP-001`, `HR-FM-020`

### CorpusDoc Fields

| Field | Description |
|---|---|
| `id` | Enterprise taxonomy ID (XX-XX-NNN) |
| `title` | Document title |
| `type` | `policy` \| `form` \| `appendix` \| `workflow` |
| `domain` | 2-char domain code |
| `subdomain` | 2–3 char subdomain code |
| `ownerSteward` | Policy owner / steward |
| `accessTier` | `Tier 1 - Public` \| `Tier 2 - Restricted` \| `Tier 3 - Confidential` |
| `regulatoryTags` | Array: `CoP`, `HIPAA`, `PDGM`, `OASIS`, `42 CFR 484`, etc. |
| `reviewCycle` | Annual, Biennial, etc. |
| `linkedIds` | Other document IDs mentioned in the text |
| `sections` | `{ id, title, level, start, end }` for right-panel navigation |
| `effectiveDate` | Date policy took effect |
| `nextReviewDate` | Scheduled review date |
| `version` | Policy version number |

### CorpusChunk Fields

| Field | Description |
|---|---|
| `id` | `{docId}#{sectionId}#{seqNum}` |
| `docId` | Parent document ID |
| `sectionId` | Section identifier |
| `sectionTitle` | Section heading text |
| `text` | 500–1000 token window of section content |
| `tokens` | Tokenized text array for BM25 |
| `embedding` | 768-dim L2-normalized float vector (nomic-embed-text) |
| `domain` / `subdomain` | Inherited from parent doc |
| `type` | Inherited from parent doc |
| `regulatoryTags` | Inherited from parent doc |
| `accessTier` | Inherited from parent doc |

---

## 7. The Response Contract

Every command returns exactly this JSON shape (never prose, never markdown):

```json
{
  "id": "ia_<uuid>",
  "responseType": "compliance_answer",

  "directAnswer": "1–3 sentence operational answer. Survey-ready.",
  "operationalRequirement": "What the agency must do per corpus.",
  "requiredArtifacts": ["FN-BC-001", "CL-CP-008"],

  "complianceRisk": "Specific regulatory / survey risk if not addressed.",
  "riskLevel": "none | low | moderate | high | critical",
  "confidence": "high | medium | low",

  "requirementsSnapshot": [
    {
      "label": "Pre-Billing Verification",
      "status": "required | recommended | warning",
      "sourcePolicyId": "FN-BC-001",
      "sourceSection": "6.1.2"
    }
  ],

  "citations": [
    {
      "id": "c-1",
      "policyId": "FN-BC-001",
      "title": "Verification Item",
      "section": "6.1.2",
      "excerpt": "The pre-billing verification shall confirm...",
      "relevance": "primary | secondary"
    }
  ],

  "linkedReferences": [
    {
      "id": "FN-BC-001",
      "type": "policy | form | appendix | workflow",
      "title": "...",
      "intent": "required | required_for_audit | required_for_completion | required_for_review | supporting | related",
      "required": true,
      "description": "...",
      "policyId": "FN-BC-001",
      "section": "6.1.2",
      "accessTier": "Tier 2 - Restricted",
      "domain": "FN",
      "subdomain": "BC",
      "previewMode": "document | form | workflow"
    }
  ],

  "availableActions": [
    {
      "id": "a-open-FN-BC-001",
      "type": "open_policy | open_form | open_appendix | open_workflow | generate_action_plan | generate_audit_checklist | generate_governing_body_brief | generate_qapi_digest | generate_knowledge_article | print_form | download_pdf",
      "label": "Open FN-BC-001",
      "targetId": "FN-BC-001",
      "targetType": "policy",
      "studioOutputType": "audit_checklist | action_plan | governing_body_brief | qapi_digest | knowledge_article | summary | null",
      "priority": "primary | secondary"
    }
  ],

  "studioOutputType": "audit_checklist | action_plan | governing_body_brief | qapi_digest | knowledge_article | summary | null",
  "noAnswerFound": false,
  "noAnswerReason": "",

  "meta": {
    "intent": "pre_survey_audit",
    "retrievedChunkIds": ["FN-BC-001#6.1#0", "..."],
    "model": "llama3.1:8b-instruct-q4_K_M",
    "elapsedMs": 12535
  }
}
```

### Anti-hallucination Guardrails

The response contract enforces corpus authority at multiple layers:

| Guardrail | Where enforced |
|---|---|
| Model only cites numbered passages supplied | `prompt.ts` system message |
| `linkedReferences` built from corpus graph, not LLM text | `responder.ts → buildLinkedReferences()` |
| Only valid `XX-XX-NNN` IDs surfaced as references | `responder.ts → VALID_ID filter` |
| JSON repair with fallback to `noAnswerFound=true` | `responder.ts → parseLLMJson()` |
| `noAnswerFound` state shows closest refs from corpus | `ResponseStack` (UI) + `buildLinkedReferences` |
| Temperature locked at 0.15 | `responder.ts → ollama.chat()` |

---

## 8. UI Layout and Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│  iAdministrator                              Policies · Forms · Appendix │
│  COMPLIANCE INTELLIGENCE · LOCAL CORPUS · GROUNDED ANSWERS ONLY         │
├─────────────────────────────────────────────────────────────────────────┤
│  HealthStrip [● Index Ready | 304 docs | nomic-embed-text | Ollama ✓]   │
├────────────────────────────────────────┬────────────────────────────────┤
│                                        │                                │
│  ┌────────────────────────────────┐    │  ┌──────────────────────────┐  │
│  │  CommandBar                    │    │  │  RightPanelPreview        │  │
│  │  "Run pre-survey audit..."     │    │  │                          │  │
│  │                          [▶]   │    │  │  FN-BC-001               │  │
│  └────────────────────────────────┘    │  │  Verification Item       │  │
│                                        │  │  POLICY · FN · BC        │  │
│  [Answer][Audit][Action][Gov][QAPI]... │  │                          │  │
│                                        │  │  ▼ 6.1 Pre-Billing...   │  │
│  ┌────────────────────────────────┐    │  │    The pre-billing...    │  │
│  │  StructuredAnswer              │    │  │                          │  │
│  │  Direct Answer: ...            │    │  │  ▼ 6.1.2 Verification   │  │
│  │  Operational Requirement: ...  │    │  │    Confirm all:          │  │
│  │  Compliance Risk: ...          │    │  │    - Physician cert...   │  │
│  │  Risk: [MODERATE] [HIGH CONF]  │    │  │    - Signed 485...       │  │
│  └────────────────────────────────┘    │  │                          │  │
│                                        │  │  Linked: CL-CP-008 →    │  │
│  ┌────────────────────────────────┐    │  └──────────────────────────┘  │
│  │  RequirementsSnapshot          │    │                                │
│  │  [✓ REQUIRED] Pre-Billing...   │    │                                │
│  │  [! WARNING]  Training docs... │    │                                │
│  └────────────────────────────────┘    │                                │
│                                        │                                │
│  ┌────────────────────────────────┐    │                                │
│  │  CitationChips                 │    │                                │
│  │  [FN-BC-001 · 6.1.2] [...]    │    │                                │
│  └────────────────────────────────┘    │                                │
│                                        │                                │
│  ┌────────────────────────────────┐    │                                │
│  │  ReferenceCards                │    │                                │
│  │  REQUIRED: FN-BC-001           │    │                                │
│  │  SUPPORTING: CL-CP-008         │    │                                │
│  └────────────────────────────────┘    │                                │
│                                        │                                │
│  [Open FN-BC-001] [Action Plan] ...    │                                │
│                                        │                                │
├────────────────────────────────────────┴────────────────────────────────┤
│  intent: question · model: llama3.1:8b · 12535 ms · 7 passages          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Reference

| Component | File | Purpose |
|---|---|---|
| `IAdministratorPage` | `index.tsx` | Root page, state orchestration, layout |
| `CommandBar` | `CommandBar.tsx` | Command input, submit, mic stub |
| `StudioTabs` | `StudioTabs.tsx` | Intent mode switcher (6 tabs) |
| `StructuredAnswer` | `StructuredAnswer.tsx` | Primary answer + risk + op-req |
| `RequirementsSnapshot` | `RequirementsSnapshot.tsx` | Checklist of gaps and controls |
| `CitationChips` | `CitationChips.tsx` | Clickable citation source chips |
| `ReferenceCards` | `ReferenceCards.tsx` | Required/supporting doc cards |
| `AvailableActions` | `AvailableActions.tsx` | Action button strip |
| `RightPanelPreview` | `RightPanelPreview.tsx` | Execution workspace, doc preview |
| `NoAnswer` | `NoAnswer.tsx` | Explicit no-corpus-support state |
| `HealthStrip` | `HealthStrip.tsx` | Index + Ollama status ribbon |
| `RiskBadge` | `RiskBadge.tsx` | Risk level + confidence pills |

---

## 9. How to Issue Compliance Commands

iAdministrator accepts commands, not questions. Think of it as issuing directives to a compliance operating system.

### Command Patterns

| Pattern | Example | Best Intent |
|---|---|---|
| Run audit | `Run pre-survey audit` | `pre_survey_audit` |
| Generate report | `Generate governing body brief` | `governing_body_brief` |
| Gap analysis | `What forms are missing for QAPI?` | `missing_items` |
| Policy lookup | `Open plan of care policy` | `artifact_lookup` |
| Compliance question | `What is required before billing?` | `question` |
| ID-anchored lookup | `Show me CL-FM-034` | `artifact_lookup` |
| Action planning | `Create corrective action plan for survey gaps` | `action_plan` |
| QAPI digest | `Generate QAPI quality digest` | `qapi_digest` |
| Knowledge article | `Explain PDGM billing methodology` | `knowledge_article` |
| Fix compliance gaps | `Identify compliance gaps and corrective steps` | `action_plan` |

### ID Anchoring (Precision Retrieval)

Quoting a policy or form ID directly anchors retrieval to that document and boosts all its chunks to the front of the passage map:

```
What does HR-FM-020 require?
Open GV-GB-001
Explain CO-CP-001 audit requirements
Compare CL-FM-034 with GV-GB-001
```

### Domain Anchoring

For focused questions, the system detects domain signals and applies a domain hard-filter:

```
What is required for billing?           → FN domain
What forms does HR need?                → HR domain
What are HIPAA compliance requirements? → CO domain
What is the governing body responsible for? → GV domain
```

### Studio Tab Selection

Instead of typing the intent, click the Studio Tab before or during your command:

| Tab | Intent | Use For |
|---|---|---|
| Answer | `question` | Direct compliance question |
| Pre-Survey Audit | `pre_survey_audit` | Survey readiness, gap audit |
| Action Plan | `action_plan` | Corrective action steps |
| Governing Body | `governing_body_brief` | Board prep, executive brief |
| QAPI Digest | `qapi_digest` | Quality digest, PI oversight |
| Knowledge | `knowledge_article` | Staff explainer, training |

Switching a tab while a response is showing **re-runs the last command** under the new intent — giving you the same query rendered as an audit, then a brief, then an action plan.

---

## 10. Studio Output Modes

### Pre-Survey Audit (`pre_survey_audit`)
Returns a readiness summary with the following structure:
- **directAnswer**: 2–4 sentence readiness summary
- **requirementsSnapshot**: gaps as `warning`, confirmed controls as `required`
- **riskLevel**: aggregate risk (typically `moderate` to `high`)
- **requiredArtifacts**: specific forms/policies to have ready
- **linkedReferences**: policies/forms needed for survey preparation

Best commands:
```
Run pre-survey audit
Survey readiness assessment for governing body
Audit readiness for CoP compliance
```

### Action Plan (`action_plan`)
Returns prioritized corrective steps:
- **directAnswer**: executive framing of the remediation scope
- **requirementsSnapshot**: ordered steps, deadline-bearing items marked `required`
- **requiredArtifacts**: forms/policies needed for completion
- **availableActions**: open each referenced artifact immediately

Best commands:
```
Create action plan for survey findings
Generate corrective action plan
Next steps to address compliance gaps
```

### Governing Body Brief (`governing_body_brief`)
Returns board-ready executive summary:
- **directAnswer**: executive summary
- **operationalRequirement**: board approvals and documentation required
- **requirementsSnapshot**: fiduciary and oversight control items
- **linkedReferences**: governing body policies/forms

Best commands:
```
Generate governing body brief
Board preparation for next meeting
Governing body compliance requirements
```

### QAPI Digest (`qapi_digest`)
Returns quality oversight summary:
- **directAnswer**: quality issue or QAPI scope summary
- **operationalRequirement**: oversight implications for QAPI committee
- **requiredArtifacts**: QAPI forms and records
- **requirementsSnapshot**: indicators and PI project requirements

Best commands:
```
Generate QAPI digest
Quality performance indicators summary
QAPI committee briefing for this quarter
```

### Knowledge Article (`knowledge_article`)
Returns staff-facing explainer:
- **directAnswer**: 1-paragraph plain-English explainer
- **operationalRequirement**: what staff must do today
- **citations**: policy source passages

Best commands:
```
Explain PDGM payment methodology
What is a plan of care?
Training article on HIPAA obligations
```

### Artifact Lookup (`artifact_lookup`)
Returns metadata + preview for a specific policy or form:
- **directAnswer**: what the artifact is and when it's used
- **linkedReferences**: the artifact + its supporting documents
- **availableActions**: open/preview the artifact immediately

Best commands:
```
Open GV-FM-001
Show me CO-CP-001
Preview CL-FM-034
```

---

## 11. Citation and Reference System

### Citations
Citations are materialized from the retrieved corpus passages, not from free-form LLM text. Each citation contains:
- **policyId**: the governing document (e.g., `FN-BC-001`)
- **section**: exact section heading where the evidence lives
- **excerpt**: verbatim or paraphrased passage text (max 260 chars)
- **relevance**: `primary` (top citation) or `secondary`

Clicking a citation chip opens the referenced document in the right-panel preview with the section visible.

### Linked References
References are built from the corpus document graph, not from what the model says. Sources:
1. **Direct matches**: documents explicitly named in the query (`GV-GB-001`)
2. **Required artifacts**: IDs the LLM extracted from passages (validated against corpus)
3. **Requirements snapshot**: source policy IDs from gap analysis items
4. **Retrieved chunks**: top-scoring documents from hybrid search

References are filtered to valid `XX-XX-NNN` IDs only. Large narrative files with filename-based IDs are excluded.

### Reference Intent Labels

| Intent | Meaning |
|---|---|
| `required` | Must have — directly named in query or primary retrieval |
| `required_for_audit` | Must have for survey/audit readiness |
| `required_for_completion` | Must complete to resolve the gap |
| `required_for_review` | Must review for board/governing body approval |
| `supporting` | Referenced in the requirements snapshot |
| `related` | Appears in retrieval, not directly required |

---

## 12. The Right-Panel Execution Workspace

The right panel loads automatically when a response includes linked references. It can also be opened manually by:
- Clicking any **citation chip**
- Clicking any **reference card**
- Clicking any **Open [ID]** action button

### Panel Modes

| `previewMode` | Rendered as |
|---|---|
| `document` | Collapsible section headings, metadata, linked doc chips |
| `form` | Form fields (staging for auto-fill in future release) |
| `workflow` | Workflow steps (staged for future release) |

### Panel Information

- Document ID, type badge, domain/subdomain
- Access tier badge
- Regulatory tag chips
- Version, effective date, next review date
- All sections (collapsible, clickable for section preview)
- Linked document IDs → click to navigate to another reference

The panel is the "execution workspace" — you can move from citation to linked document to supporting form without leaving the page.

---

## 13. Health Strip and Index Management

The HealthStrip at the top of the page shows real-time status of all three dependencies.

### Status Indicators

| Indicator | Green | Yellow | Red |
|---|---|---|---|
| Index | Ready, embeddings loaded | Ready, lexical-only | Not built |
| Corpus | `N docs · N chunks` | — | Missing corpus files |
| Ollama | Reachable | — | Unreachable |
| Model | `nomic-embed-text 768d` | `(lexical-only)` | — |

### Rebuild Index Button

Click **Rebuild Index** in the HealthStrip (or run `npm run ia:index`) to:
1. Re-scan all corpus files
2. Re-extract metadata
3. Re-chunk documents
4. Re-embed chunks with `nomic-embed-text`
5. Persist new index to `.cache/ia-index/`

**When to rebuild:**
- After adding or modifying policy files in `Builder/`
- After a new form is added to `Builder/Forns/`
- After updating the corpus taxonomy
- After changing the embedding model

---

## 14. Available Actions

Actions are generated deterministically from the response, not from LLM output. Every response includes:

| Action Type | Behavior |
|---|---|
| `open_policy` | Loads the document in the right-panel preview |
| `open_form` | Loads the form in the right-panel (form mode) |
| `open_appendix` | Loads the appendix in the right-panel |
| `open_workflow` | Loads the workflow in the right-panel (staged) |
| `generate_action_plan` | Re-runs the command as `action_plan` intent |
| `generate_audit_checklist` | Re-runs as `pre_survey_audit` intent |
| `generate_governing_body_brief` | Re-runs as `governing_body_brief` intent |
| `generate_qapi_digest` | Re-runs as `qapi_digest` intent |
| `generate_knowledge_article` | Re-runs as `knowledge_article` intent |
| `print_form` | (Staged) Print form to PDF |
| `download_pdf` | (Staged) Download document as PDF |
| `attach_to_event` | (Staged) Attach to calendar event |
| `mark_complete` | (Staged) Mark item as complete in workflow |

The current `generate_*` action that matches the active Studio Tab is excluded (prevents a "regenerate same" suggestion).

---

## 15. Risk Levels and Confidence Scores

### Risk Level

| Level | Color | Meaning |
|---|---|---|
| `none` | Green | Fully compliant per corpus |
| `low` | Blue | Minor documented gap |
| `moderate` | Yellow | Documented gap requiring attention |
| `high` | Orange | Critical gap with survey exposure |
| `critical` | Red | Immediate regulatory deficiency |

**Floor rules:**
- `pre_survey_audit` and `action_plan` intents: minimum floor is `moderate`
- LLM derives from corpus evidence; floor is enforced by `coerceRiskLevel()`

### Confidence Score

| Score | Meaning | Trigger |
|---|---|---|
| `high` | Top retrieval score ≥ 0.55 | Strong semantic + lexical match |
| `medium` | Top score ≥ 0.30 | Moderate match |
| `low` | Top score < 0.30 | Weak retrieval or LLM override |

---

## 16. Intent Classification System

Classification is rule-based (regex patterns) for determinism and zero latency.

### Classification Priority

1. **Explicit intent** from Studio Tab (user-selected) → overrides all
2. **Pattern matching** on the input text (see table below)
3. **Short input + explicit ID** → `artifact_lookup`
4. **Default** → `question`

### Pattern Table

| Pattern | Intent |
|---|---|
| `pre-survey`, `survey audit`, `readiness audit` | `pre_survey_audit` |
| `action plan`, `corrective action`, `plan of correction` | `action_plan` |
| `governing body brief`, `board brief`, `executive brief` | `governing_body_brief` |
| `qapi digest`, `qapi report`, `quality digest` | `qapi_digest` |
| `knowledge article`, `training article` | `knowledge_article` |
| `missing forms`, `gaps`, `what's missing` | `missing_items` |
| `open [ID]`, `show [ID]`, `load [ID]` | `artifact_lookup` |

### Domain Hint Detection

Domain hints apply a **hard domain filter** for `question` and `artifact_lookup` intents:

| Pattern | Domain |
|---|---|
| `governing body`, `board`, `authority` | `GV` |
| `HIPAA`, `CMIA`, `compliance officer` | `CO` |
| `QAPI`, `quality indicator`, `PI project` | `QA` |
| `plan of care`, `OASIS`, `start of care` | `CL` |
| `HR`, `employee`, `onboarding` | `HR` |
| `billing`, `Medicare`, `PDGM`, `revenue` | `FN` |
| `cybersecurity`, `EHR`, `ransomware` | `IT` |
| `intake`, `scheduling`, `dispatch` | `OP` |
| `incident`, `emergency`, `OSHA` | `RM` |

---

## 17. Local Setup and Run Instructions

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 20 | Runtime |
| npm | ≥ 10 | Package manager |
| Ollama | Latest | Local LLM inference |
| Git | Any | Source control |

### Step-by-Step Setup

```bash
# 1. Clone or pull the repository
cd C:\AI\Git\training\HomeHealth\Policies_and_Procedures

# 2. Install dependencies
npm install

# 3. Install Ollama
# Windows: https://ollama.com/download/windows
# Mac:     brew install ollama

# 4. Pull the required models
ollama pull llama3.1:8b-instruct-q4_K_M
ollama pull nomic-embed-text

# 5. Configure environment
copy .env.example .env
# Edit .env if you need non-default ports or models

# 6. Build the local compliance index (first run ~3-5 minutes)
npm run ia:index

# 7. Start the development stack
npm run dev
```

### Access Points

| Service | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| iAdministrator page | http://localhost:5173/iadministrator |
| Backend API | http://localhost:8787 |
| IA Health endpoint | http://localhost:8787/api/ia/health |

### Production-Like Server

```bash
# Build the frontend
npm run build

# Start API server only
npm run server
```

---

## 18. Environment Variables Reference

Copy `.env.example` to `.env` and adjust as needed. All IA variables have safe defaults.

| Variable | Default | Description |
|---|---|---|
| `IA_INDEX_ROOT` | `.cache/ia-index` | Where the local index JSON files are stored |
| `IA_CORPUS_ROOT` | `.` (repo root) | Root directory to scan for `Builder/` corpus |
| `IA_REQUIRE_EMBEDDINGS` | `false` | If `true`, build fails when Ollama embed is unavailable |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Ollama server URL |
| `OLLAMA_CHAT_MODEL` | `llama3.1:8b-instruct-q4_K_M` | Chat model for structured responses |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` | Embedding model for vector indexing |
| `OLLAMA_TIMEOUT_MS` | `60000` | Timeout per Ollama request (ms) |
| `LOG_LEVEL` | `info` | Log verbosity: `debug` \| `info` \| `warn` \| `error` |
| `PORT` | `8787` | Express server port |

---

## 19. npm Scripts Reference

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `concurrently dev:web dev:api` | Start full stack with hot reload |
| `npm run dev:web` | `vite` | Frontend only (Vite dev server) |
| `npm run dev:api` | `tsx watch server/index.ts` | API only with file watching |
| `npm run ia:index` | `tsx server/cli/build-index.ts` | Build / rebuild the compliance index |
| `npm run ia:health` | `node -e "fetch(...)"` | Quick health check of running API |
| `npm run build` | `tsc -b && vite build` | Production build |
| `npm run server` | `tsx server/index.ts` | Start production API server |
| `npm run lint` | `eslint .` | Lint all source files |
| `npm run preview` | `vite preview` | Preview production build |

---

## 20. Index Build and Rebuild

### When to Rebuild

| Event | Rebuild Needed? |
|---|---|
| New policy file added to `Builder/Policies/` | **Yes** |
| New form added to `Builder/Forns/` | **Yes** |
| Policy text edited | **Yes** |
| Form front-matter changed | **Yes** |
| Changed `OLLAMA_CHAT_MODEL` | No |
| Changed `OLLAMA_EMBED_MODEL` | **Yes** (vectors change) |
| First run | **Yes** |

### Rebuild Command

```bash
npm run ia:index
```

This will:
1. Discover all corpus files
2. Parse, normalize, extract metadata
3. Chunk with section boundaries
4. Embed with `nomic-embed-text` (batch, ~93 chunks/second)
5. Save to `.cache/ia-index/` (4 JSON files)
6. Total time: ~3 minutes for full corpus at 9,303 chunks

### Lexical-Only Fallback

If Ollama is unavailable during build, and `IA_REQUIRE_EMBEDDINGS=false` (default), the index builds without embeddings. The system falls back to BM25-only search. Results are still corpus-grounded but with lower semantic recall.

To force a fail if embeddings are unavailable:
```bash
IA_REQUIRE_EMBEDDINGS=true npm run ia:index
```

### Index Files

```
.cache/ia-index/
├── manifest.json       (build metadata: date, model, doc/chunk count)
├── docs.json           (slim CorpusDoc records, no content)
├── docs-content.json   (full normalized text by docId)
└── chunks.json         (CorpusChunk[] with embedded 768-dim vectors)
```

The `.cache/` directory is gitignored — never commit index files.

---

## 21. API Reference

### GET `/api/ia/health`

Returns index status and Ollama reachability.

```json
{
  "status": {
    "ready": true,
    "builtAt": "2026-04-21T20:04:55.647Z",
    "embedModel": "nomic-embed-text",
    "embedDim": 768,
    "docCount": 304,
    "chunkCount": 9303,
    "corpusRoot": "C:\\...",
    "missing": []
  },
  "ollama": {
    "ok": true,
    "models": ["llama3.1:8b-instruct-q4_K_M", "nomic-embed-text:latest"]
  }
}
```

---

### POST `/api/ia/query`

Run a compliance command. Returns `StructuredResponse`.

**Request body:**

```json
{
  "input": "What is required before billing a Medicare claim?",
  "intent": "question",
  "activeDocId": "FN-BC-001",
  "k": 8
}
```

| Field | Required | Description |
|---|---|---|
| `input` | **Yes** | Free-text compliance command |
| `intent` | No | Override intent classification |
| `activeDocId` | No | Currently-open doc ID (biases retrieval) |
| `k` | No | Override top-K chunk budget |

**Valid intent values:** `question`, `pre_survey_audit`, `action_plan`, `governing_body_brief`, `qapi_digest`, `knowledge_article`, `artifact_lookup`, `missing_items`

**Response:** Full `StructuredResponse` JSON (see Section 7).

**Error responses:**

| Status | Code | Meaning |
|---|---|---|
| 400 | `validation_error` | Missing `input` field |
| 503 | `not_ready` | Index not built — run `npm run ia:index` |
| 500 | `internal_error` | Unexpected server error |

---

### GET `/api/ia/references`

List documents in the corpus (for index/browse UI).

**Query params:** `domain` (e.g., `GV`), `type` (`policy`\|`form`\|`appendix`), `limit` (default 200)

**Response:**

```json
[
  {
    "id": "GV-GB-001",
    "title": "Governing Body Authority & Responsibilities",
    "type": "policy",
    "domain": "GV",
    "subdomain": "GB",
    "accessTier": "Tier 2 - Restricted",
    "regulatoryTags": ["42 CFR 484.105", "CoP"]
  }
]
```

---

### GET `/api/ia/references/:id`

Load a full reference preview for the right panel.

**Response:** `ReferencePreview`

```json
{
  "id": "FN-BC-001",
  "type": "policy",
  "title": "Verification Item",
  "domain": "FN",
  "subdomain": "BC",
  "accessTier": "Tier 2 - Restricted",
  "regulatoryTags": ["42 CFR 484.205", "PDGM"],
  "sections": [
    { "id": "6.1", "title": "Pre-Billing Verification", "level": 2, "body": "..." }
  ],
  "linkedIds": ["CL-CP-008", "CO-CP-008"],
  "sourcePath": "Builder/Policies/...",
  "version": "1.0",
  "effectiveDate": "2024-01-01",
  "nextReviewDate": "2025-01-01"
}
```

---

### POST `/api/ia/index/rebuild`

Trigger a full index rebuild from the running server.

**Response:** `IndexStatus` (same shape as `/health`.`status`)

---

## 22. Security and Boundary Model

### Local-Only MVP Rules

| Rule | Implementation |
|---|---|
| Model paths never reach the browser | `env.ts` variables are server-side only |
| Corpus filesystem never browsable from UI | Frontend only calls `/api/ia/references/:id` with validated IDs |
| No arbitrary file access from API | `getReference()` only resolves IDs in the in-memory doc map |
| Ollama endpoint internal only | `OLLAMA_BASE_URL` set in server env, never returned to frontend |
| No user data stored | iAdministrator is stateless; no logs of queries |
| `.cache/` gitignored | Index files (including embedded vectors) never committed |

### What the Frontend Sees

The browser only ever sees:
- `/api/ia/health` — status metadata
- `/api/ia/query` → `StructuredResponse` — typed, safe JSON
- `/api/ia/references/:id` → `ReferencePreview` — document metadata + section text
- `/api/ia/references` → list of doc metadata

It never sees: file paths, model names, raw embeddings, Ollama responses, or corpus filesystem layout.

---

## 23. Performance Reference

### Index Build

| Stage | Time (9,303 chunks) | Notes |
|---|---|---|
| Ingestion (parse + chunk) | ~18 seconds | Pure Node.js |
| Embedding (nomic-embed-text) | ~160 seconds | ~58 chunks/sec via Ollama |
| Persist to disk | ~2 seconds | Atomic JSON write |
| **Total** | **~3 minutes** | One-shot, run once |

### Query Response (with full semantic index)

| Component | Typical Time |
|---|---|
| Intent classification | < 1 ms |
| Query embedding (nomic) | ~200 ms |
| BM25 + cosine search (9,303 chunks) | < 5 ms |
| Prompt assembly | < 1 ms |
| Ollama chat (llama3.1:8b) | 8–18 seconds |
| JSON repair + materialization | < 5 ms |
| **Total** | **9–20 seconds** |

### Server Memory

| Asset | Size |
|---|---|
| `docs.json` (304 docs) | ~1.2 MB |
| `docs-content.json` (full text) | ~8 MB |
| `chunks.json` (9,303 × 768 floats) | ~43 MB |
| **Total heap approx.** | **~55 MB** |

---

## 24. Troubleshooting

### "Index not ready" or HealthStrip shows red

```bash
npm run ia:index
```

If Ollama is unavailable:
```bash
# Check Ollama is running
ollama list

# If not running (Mac/Linux)
ollama serve

# Windows: start from system tray or:
# C:\Users\<you>\AppData\Local\Programs\Ollama\ollama app.exe

# Then rebuild
npm run ia:index
```

### "Local reasoning model is unavailable"

The LLM model was not found or Ollama timed out. Check:
```bash
ollama list
# Should show llama3.1:8b-instruct-q4_K_M

# If missing:
ollama pull llama3.1:8b-instruct-q4_K_M
```

### Vite "504 Outdated Optimize Dep" errors in browser

```bash
# Stop dev server, then:
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

### "noAnswerFound: true" for a query that should have an answer

1. Check that the relevant policy/form is in `Builder/`
2. Rebuild the index: `npm run ia:index`
3. Try anchoring with a specific ID: `Show me GV-GB-001`
4. Try broader wording: `What does the governing body policy require?`

### Citations showing wrong policy

The retrieval may have pulled a related but wrong domain document. Try:
- Anchoring with a specific ID in the query
- Using a Studio Tab to specify the intent explicitly
- Checking the HealthStrip shows embeddings are loaded (not lexical-only)

### Answers missing `requiredArtifacts`

The LLM may not have found form IDs in the passages. Try:
- Rebuilding with full semantic embeddings (`npm run ia:index` with Ollama running)
- Asking with domain context: `What forms does HR require for onboarding?`

### Response takes > 30 seconds

Default `OLLAMA_TIMEOUT_MS` is 60,000 ms. The llama3.1:8b model needs:
- At least 8 GB RAM available
- GPU acceleration helps significantly (NVIDIA CUDA or Apple Metal)

For faster responses, configure a smaller model:
```
OLLAMA_CHAT_MODEL=llama3.2:3b
```

---

## 25. Staged Future Capabilities

These are architected in but not implemented in the MVP. Each requires minimal code to activate.

### Brad Persona Layer

Insert a persona pre-processor in `server/ia/prompt.ts` → `buildSystemPrompt(intent)`. The persona modifies tone/authority framing without changing the JSON output shape.

```typescript
// staged insertion point:
export function buildSystemPrompt(intent: IntentKind, persona?: PersonaConfig): string {
  const base = persona ? persona.systemPreamble + '\n\n' + SYSTEM_BASE : SYSTEM_BASE;
  // ...
}
```

### Voice Input

`CommandBar.tsx` contains a disabled mic button. Wire it to the Web Speech API `SpeechRecognition` interface and call `onSubmit(transcript)`.

```typescript
// staged in CommandBar.tsx:
// <button onClick={startVoiceInput} disabled title="Voice input coming soon">
```

### Voice Output

Add a `SpeechSynthesis` call in `IAdministratorPage` after `query.response` is set:

```typescript
if (response.directAnswer) {
  speechSynthesis.speak(new SpeechSynthesisUtterance(response.directAnswer));
}
```

### Richer Form Execution

`RightPanelPreview` already switches on `reference.type === 'form'`. Extend that branch with:
- Field extraction from form front-matter
- Auto-fill staging UI
- Electronic signature hooks

### PDF / Print / Export

The `print_form` and `download_pdf` action types are in the contract. Wire up a server-side renderer (e.g., Puppeteer, Playwright) behind a new `/api/ia/export/:id` endpoint.

### Cloud Portability

Two swap points only:
1. `server/ia/ollama.ts` → replace with any OpenAI-compatible client
2. `server/ia/index/store.ts` → replace with a vector database (Pinecone, Weaviate, pgvector)

---

## 26. Glossary

| Term | Definition |
|---|---|
| **RAG** | Retrieval-Augmented Generation — answers grounded in retrieved corpus passages, not LLM training data |
| **Corpus** | The single internal source of truth: all policies, procedures, forms, and appendices |
| **Chunk** | A 500–1000 token segment of a document section, with metadata, used as the unit of retrieval |
| **Embedding** | 768-dimensional numeric vector representing the semantic meaning of a chunk or query |
| **BM25** | Best Match 25 — a probabilistic lexical search algorithm used as a fallback/blend with vector search |
| **Cosine similarity** | The angle between two embedding vectors, used to measure semantic closeness |
| **Hybrid search** | Blending vector (0.65) + lexical BM25 (0.35) scores, with section-title boost |
| **Intent** | The classified purpose of a user command (question, audit, brief, etc.) |
| **Passage map** | The numbered `[P1]…[PN]` block sent to the LLM — the LLM may only cite from this |
| **Materialization** | Building citations/references from the corpus graph rather than trusting free-form LLM text |
| **Section-title boost** | +0.05/token added to a chunk's score when the user's query terms appear in its section heading |
| **Domain hard-filter** | Restricting BM25+vector search to chunks from a single domain code (e.g., `FN`) |
| **nomic-embed-text** | The local embedding model (274 MB, 768-dim) used to vectorize chunks and queries |
| **llama3.1:8b** | The local chat LLM (4.9 GB, q4_K_M quantized) used for structured JSON generation |
| **Ollama** | The local inference runtime that serves both models via HTTP |
| **LexicalIndex** | The in-memory BM25 index built from tokenized chunks on server startup |
| **IndexManifest** | Metadata record of the last index build (date, model, doc/chunk counts) |
| **CorpusDoc** | The full metadata + section structure + normalized text for one governance document |
| **StructuredResponse** | The typed JSON output contract returned by every compliance command |
| **ReferencePreview** | The document detail payload loaded by the right-panel on demand |
| **CoP** | Conditions of Participation (42 CFR 484) — the CMS regulatory framework for home health |
| **PDGM** | Patient-Driven Groupings Model — the Medicare home health payment methodology |
| **OASIS** | Outcome and Assessment Information Set — the patient assessment instrument |
| **QAPI** | Quality Assessment and Performance Improvement — the CMS quality oversight requirement |
| **Plan of Care (485)** | The CMS-485 physician-certified plan of care required before billing Medicare |

---

---

## 26. Operational Compliance Monitoring Platform (v2.0 Upgrade)

iAdministrator v2.0 extends the platform from pure policy intelligence into a **four-layer operational compliance monitoring system**.

### Four Intelligence Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│  BRAD / iAdministrator — Compliance Intelligence Platform v2.0      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LAYER 1: Internal Governed Corpus        [LIVE — always active]   │
│  ├─ Policies / Procedures                                           │
│  ├─ Forms / Appendices                                              │
│  └─ RAG retrieval → structured response                             │
│                                                                     │
│  LAYER 2: Operational App State           [Phase 1 — seed data]    │
│  ├─ Tasks: overdue, blocked, incomplete                             │
│  ├─ Forms: unsigned, incomplete, pending approval                   │
│  ├─ Workflows: blocked by missing prerequisite                      │
│  ├─ Policy Lifecycle: draft/pending/overdue/unpublished             │
│  └─ Events: unscheduled, governing body, QAPI meetings              │
│                                                                     │
│  LAYER 3: Regulatory Update Feed          [Phase 2 — seed feed]    │
│  ├─ CMS Final Rules & transmittals                                  │
│  ├─ OIG Work Plan compliance priorities                             │
│  ├─ HIPAA Security Rule updates                                     │
│  └─ Impact mapping → affected policies/forms/workflows              │
│                                                                     │
│  LAYER 4: EHR-Derived Assessment          [Phase 3 — pending]      │
│  ├─ Unsigned physician orders                                       │
│  ├─ Missing clinical documentation                                  │
│  ├─ Plan-of-care mismatches                                         │
│  └─ Episode/billing artifact gaps                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### New API Endpoints (v2.0)

| Endpoint | Description |
|---|---|
| `GET /api/ia/operational/summary` | Overall operational compliance health summary |
| `GET /api/ia/operational/gaps` | Filtered list of operational compliance gaps |
| `GET /api/ia/operational/lifecycle` | Policy lifecycle alerts (filtered by state) |
| `GET /api/ia/regulatory/updates` | Full regulatory update feed |
| `GET /api/ia/regulatory/updates/:id` | Single regulatory update detail |
| `GET /api/ia/regulatory/policy/:id` | Regulatory updates impacting a specific policy |

### Extended StructuredResponse Contract (v2.0)

Three new optional fields are added to every `StructuredResponse`:

```typescript
operationalGaps?: OperationalGap[];      // Phase 1: live task/form/approval gaps
lifecycleAlerts?: LifecycleAlert[];      // Phase 1: policy governance state
regulatoryAlerts?: RegulatoryAlert[];    // Phase 2: external regulatory updates
phaseStatus?: PhaseStatus;              // Honest reporting of data source per phase
```

These fields are **deterministically populated server-side** — never generated by the LLM. They cannot be hallucinated.

### Architectural Safeguards

1. **No auto-publishing**: Policy changes always require owner review and Governing Body approval.
2. **No auto-completion**: Tasks and forms must be closed by a human owner.
3. **PHI minimization**: Phase 3 EHR data uses aggregated summaries (e.g., "4 unsigned orders"), never patient-identifiable detail in broad compliance reporting.
4. **Phase transparency**: Every response includes a `phaseStatus` object that clearly labels which data layers are providing live data vs. seed demonstration data.
5. **Non-destructive extension**: Existing corpus RAG, citations, reference preview, and form rendering are completely unchanged.

### Phase Activation Roadmap

| Phase | Activation Requirement | Estimated Effort |
|---|---|---|
| Phase 1 (live) | Replace `SEED_OPERATIONAL_GAPS` / `SEED_LIFECYCLE_ALERTS` in `server/ia/operational/seed.ts` with live adapter calls to task management API | 2-3 days |
| Phase 2 (live) | Replace `SEED_REGULATORY_UPDATES` in `server/ia/regulatory/feed.ts` with CMS transmittal ingestion service | 3-5 days |
| Phase 3 | Build `server/ia/ehr/` adapter implementing EHR structured read endpoints; add `ehr_gap` type to gap cards | 1-2 weeks |

---

## 27. New File/Module Reference (v2.0)

| File | Purpose |
|---|---|
| `server/ia/operational/seed.ts` | Phase 1 seed data: operational gaps + lifecycle alerts |
| `server/ia/operational/service.ts` | OperationalService: query, filter, summarize operational state |
| `server/ia/regulatory/feed.ts` | Phase 2 seed data: CMS/OIG regulatory update records |
| `server/ia/regulatory/matcher.ts` | RegulatoryMatcher: score relevance, build prompt summaries |
| `src/.../components/OperationalGaps.tsx` | UI: gap cards, lifecycle alert cards, phase disclaimer |
| `src/.../components/RegulatoryAlerts.tsx` | UI: regulatory update alert cards |

---

*End of Manual — Care Indeed Home Health Care, Inc. | iAdministrator v2.0*  
*Updated: April 2026 | Sections 1–25 unchanged from v1.0 | Sections 26–27 added for v2.0 upgrade*
