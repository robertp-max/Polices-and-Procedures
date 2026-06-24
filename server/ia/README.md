# iAdministrator — Compliance Intelligence Engine

Local-first, NotebookLM-style compliance intelligence over the internal
Home Health Policies, Procedures, Forms, and Appendices corpus. Runs on
a developer machine with Ollama; nothing leaves localhost.

This is **not** a chatbot. Every response is a typed, citation-backed
`StructuredResponse` (see `server/ia/types.ts`) that the
`/iadministrator` UI renders into a direct answer, requirements snapshot,
citation chips, reference cards, available actions, and a right-panel
execution workspace.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     /iadministrator (React page)                      │
│  CommandBar ─▶ useIaQuery ─▶ /api/ia/query                            │
│  RefCards ───▶ useIaReference ─▶ /api/ia/references/:id               │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│               server/ia/service.ts — IaService facade                 │
└──────────────────────────────────────────────────────────────────────┘
   │         │            │            │            │           │
   ▼         ▼            ▼            ▼            ▼           ▼
 ingest   vector     retrieval      prompt      responder     ollama
(sources, (store,    (intent class. (builds JSON (structured   (local LLM
 parsers, embeddings, +explicit IDs  schema prompt  JSON +       chat +
 metadata,search)    +filters)       +passages)   citations    embeddings
 chunker)                                          +linkedRefs)  HTTP)
```

Key pieces:

- **Ingestion** (`ingest/*`)
  Reads `Builder/*.md`, `Builder/Policies/*.{md,docx}`, `Builder/Forns/*.txt`.
  Extracts canonical metadata (policy ID, domain, subdomain, access tier,
  owner/steward, review cycle, regulatory tags) from either markdown
  header tables or form front-matter. Normalizes text and does
  section-aware chunking (target 750 tokens, max 1000, ~80-token
  overlap on paragraph boundaries).
- **Index** (`index/*`)
  JSON-persisted local store (`$IA_INDEX_ROOT`, default `.cache/ia-index`).
  Holds a `manifest.json`, slim `docs.json` + full `docs-content.json`,
  and a `chunks.json` with inlined L2-normalized embeddings.
  In-memory hybrid search: cosine on embeddings + BM25 companion.
  If embeddings are unavailable at build time the index falls back to
  lexical-only — answers still ground in the corpus, just with lower
  semantic recall.
- **Retrieval** (`retrieval.ts`)
  Rule-based intent classifier (question / pre-survey audit / action plan
  / governing body brief / QAPI digest / knowledge / artifact lookup /
  missing items) + explicit ID extraction. Mode-aware filters (e.g.
  `missing_items` restricts to `form|policy`) and an "active-doc bias"
  hook for when the UI has a reference already open.
- **Prompt assembly** (`prompt.ts`)
  Tight JSON-mode prompt with a numbered `CORPUS` block. The system
  message forbids outside knowledge, forbids prose, and enumerates the
  response schema. Mode directives steer tone/emphasis without changing
  the output shape.
- **Responder** (`responder.ts`)
  Calls Ollama, repairs / validates the JSON, and **materializes**
  citations, `linkedReferences`, and `availableActions` from the
  corpus graph rather than free-form LLM output. This is the guardrail
  that keeps the execution workspace safe: the model cannot name
  documents that aren't in the passage map.

---

## Response contract

See `server/ia/types.ts` → `StructuredResponse`. Mirrored on the
frontend Brad logic now ported under `src/policy/brad/` (from V1 iAdministrator).
Any change must be made in both files.

---

## HTTP surface

| Method | Path                          | Purpose                              |
|--------|-------------------------------|--------------------------------------|
| GET    | `/api/ia/health`              | Index + Ollama status                |
| POST   | `/api/ia/query`               | Run a compliance command             |
| GET    | `/api/ia/references`          | List docs (filter `domain`, `type`)  |
| GET    | `/api/ia/references/:id`      | Load a reference preview             |
| POST   | `/api/ia/index/rebuild`       | Rebuild the local index              |

`POST /api/ia/query` body:

```json
{ "input": "Run pre-survey audit for governing body",
  "intent": "pre_survey_audit", "activeDocId": "GV-GB-001", "k": 8 }
```

Only `input` is required. `intent` is otherwise derived from the input
text; the UI supplies it explicitly when the user clicks a Studio tab.

---

## Local run

1. **Install Ollama** (https://ollama.com) and pull models:
   ```bash
   ollama pull llama3.1:8b-instruct-q4_K_M
   ollama pull nomic-embed-text
   ```
2. **Configure env**. Copy `.env.example` → `.env`. Defaults point at
   `http://127.0.0.1:11434`; no credentials are required for IA.
3. **Build the index** (one-shot; repeat after corpus changes):
   ```bash
   npm run ia:index
   ```
4. **Start the stack**:
   ```bash
   npm run dev
   ```
   - Web: http://localhost:5173/iadministrator
   - API: http://localhost:8787/api/ia/health

If Ollama is unreachable during `ia:index` the build proceeds with a
lexical-only index so the page still works (reduced recall). Re-run
`npm run ia:index` once Ollama is up to add embeddings.

---

## Security boundaries

- Model paths, corpus filesystem paths, and Ollama base URL are
  **server-side only**. Never exposed to the browser.
- The frontend only sees HTTP endpoints under `/api/ia/*`.
- The frontend cannot request arbitrary files — only registered
  references by ID. Reference IDs must resolve to a document the
  indexer has already admitted to the corpus.
- `.cache/ia-index` is gitignored.

---

## Staged for later (deliberately not built now)

- **Brad persona layer** — drop in as a pre-processor on
  `prompt.buildSystemPrompt(intent)`.
- **Voice input / output** — the mic button in `CommandBar` is present
  and disabled; wiring it to Web Speech API + a backend speech endpoint
  is a pure UI patch.
- **Richer form execution** — `RightPanelPreview` switches on
  `reference.type === 'form'`; today it shows sections, tomorrow it can
  render field staging + auto-fill.
- **PDF / print / export** — `print_form` and `download_pdf` action
  types are already in the contract; wire up a server-side renderer.
- **Cloud portability** — `OllamaClient` and `IndexStore` are the two
  swap points. Both are small, single-file modules.
