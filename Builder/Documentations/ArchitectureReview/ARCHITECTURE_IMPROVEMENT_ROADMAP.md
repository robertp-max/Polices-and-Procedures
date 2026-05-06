# Architecture Improvement Roadmap

Practical phased roadmap with acceptance criteria and boundaries.

## Phase 0 — Stabilize current demo

- Goals:
  - remove ambiguity in runtime modes and generated data drift.
- Specific tasks:
  - add mode banner for evidence/auth runtime path,
  - guard awsRemote mode behind backend availability check,
  - enforce forms build promotion check.
- Files likely involved:
  - `EvidenceCenterPage.tsx`, `complianceExecutionApi.ts`, build scripts.
- Acceptance criteria:
  - no broken route calls in demo mode,
  - forms/runtime dataset consistency check passes.
- Test plan:
  - smoke tests for dashboard/forms/workflows/evidence views.
- Risks:
  - accidental behavior change if mode switching is not explicit.
- What not to touch:
  - no folder reorg, no generated-file hand edits outside build flow.

## Phase 1 — Evidence chain-of-custody foundation

- Goals:
  - canonical evidence schema and immutable lifecycle base.
- Specific tasks:
  - unify evidence model/status dictionary,
  - enforce triplet and event/task/form linkage checks,
  - add cryptographic hash field pipeline.
- Files likely involved:
  - evidence store/services/pages + backend evidence route layer (new).
- Acceptance criteria:
  - lifecycle transitions auditable end-to-end.
- Test plan:
  - checklist in evidence architecture doc section 12.
- Risks:
  - migration complexity across dual local stores.
- What not to touch:
  - existing policy/workflow route contracts unless replaced with migration-safe adapters.

## Phase 2 — Event/task/form binding enforcement

- Goals:
  - consistent completion gates with required evidence/form coverage.
- Specific tasks:
  - normalize task completion checks,
  - enforce required form and evidence bindings.
- Files likely involved:
  - `regulatoryExecutionStore.ts`, compliance-execution adapters/selectors.
- Acceptance criteria:
  - cannot certify/complete when required bindings are missing.
- Test plan:
  - required-form and task-evidence integration tests.
- Risks:
  - stricter gates may reveal existing data inconsistencies.
- What not to touch:
  - do not weaken certification lock behavior.

## Phase 3 — Audit/export/survey packet engine

- Goals:
  - production-grade audit and export consistency.
- Specific tasks:
  - canonical audit event schema,
  - optional backend packet export endpoint with immutable references,
  - improve deficiency diagnostics.
- Files likely involved:
  - `surveyPacket.ts`, backend audit routes/writers, export modules.
- Acceptance criteria:
  - packet and audit views align for same event state.
- Test plan:
  - packet consistency snapshots and audit hash verification checks.
- Risks:
  - schema migration between existing audit streams.
- What not to touch:
  - existing audit history retention.

## Phase 4 — Brad/RAG operational intelligence

- Goals:
  - align runtime Brad context and IA corpus/index behavior.
- Specific tasks:
  - corpus manifest and source parity checks,
  - citation-confidence tagging.
- Files likely involved:
  - `bradAppContext.ts`, `server/ia/ingest/*`, IA routes.
- Acceptance criteria:
  - deterministic references for key policy/workflow queries.
- Test plan:
  - prompt set with expected citations.
- Risks:
  - index rebuild latency and source selection complexity.
- What not to touch:
  - citation guardrails and safety filters.

## Phase 5 — AWS backend hardening

- Goals:
  - unify auth/security and backend route ownership.
- Specific tasks:
  - define final auth middleware policy across routes,
  - implement/host compliance-execution APIs where intended,
  - harden env validation and deployment checks.
- Files likely involved:
  - `server/index.ts`, auth/eCIGN routes, infra stack.
- Acceptance criteria:
  - secure route access model documented and enforced.
- Test plan:
  - authz negative tests and integration tests.
- Risks:
  - deployment and credential configuration complexity.
- What not to touch:
  - no insecure shortcuts in production auth flow.

## Phase 6 — Production readiness

- Goals:
  - finalize operational, security, and QA gates.
- Specific tasks:
  - CI/CD guardrails for generated artifacts,
  - full regression suite,
  - operational runbooks.
- Files likely involved:
  - test harnesses, scripts, docs, infra pipelines.
- Acceptance criteria:
  - repeatable deploy + pass criteria for compliance-critical flows.
- Test plan:
  - release checklist including evidence lifecycle and audit integrity.
- Risks:
  - hidden drift between docs and implementation if not continuously enforced.
- What not to touch:
  - chain-of-custody and audit immutability semantics.
