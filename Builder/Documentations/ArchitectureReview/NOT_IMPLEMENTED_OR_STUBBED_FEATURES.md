# Not Implemented or Stubbed Features

Findings are based on current repository code inspection.  
Each item includes evidence and impact.

## 1) Compliance Execution Remote API (`/api/compliance-execution/*`)

- Where it appears:
  - `src/policy/services/complianceExecutionApi.ts` (`AwsComplianceExecutionApi`).
- Why not implemented:
  - `server/index.ts` does not mount `/api/compliance-execution`.
- Evidence:
  - route mount list includes `/api/calendar`, `/api/ecign`, `/api/auth`, `/api/compliance`, etc., but not `/api/compliance-execution`.
- Impact:
  - awsRemote mode client calls fail against local backend.
- Required fix:
  - implement route group or disable unreachable mode.
- Priority:
  - High.

## 2) Evidence Center Cloud Path Default Disabled

- Where it appears:
  - `src/policy/pages/EvidenceCenterPage.tsx`.
- Why stubbed:
  - `const LAMBDA_DISABLED = true`.
- Evidence:
  - upload/list/download use localStorage path when disabled.
- Impact:
  - evidence flow demo-only by default.
- Required fix:
  - environment-driven runtime mode and backend readiness checks.
- Priority:
  - High.

## 3) HHC eSign/Form/Workflow backend bridges disabled

- Where it appears:
  - `src/policy/ecign/hhcEvidence.ts`
  - `src/policy/services/hhcFormEvidence.ts`
  - `src/policy/services/hhcWorkflowCompletion.ts`
- Why stubbed:
  - each contains `LAMBDA_DISABLED = true`.
- Evidence:
  - returns stub payloads instead of network calls.
- Impact:
  - workflow completion and evidence mirroring can appear complete without real persistence.
- Required fix:
  - connect to live backend and validate contracts.
- Priority:
  - High.

## 4) Event/task/form evidence cloud lifecycle endpoints

- Where it appears:
  - target endpoints in EvidenceCenter comments/client calls.
- Why not implemented in local backend:
  - local Express routes do not expose upload/validate/promote/download endpoints for this pipeline.
- Evidence:
  - no matching route mount and no server route file with endpoint set.
- Impact:
  - no full chain-of-custody evidence pipeline from local app backend.
- Required fix:
  - implement endpoint set + storage/audit integration.
- Priority:
  - High.

## 5) EvidencePanel actual file download

- Where it appears:
  - `src/policy/components/regulatory/EvidencePanel.tsx`.
- Why stubbed:
  - download button triggers toast only.
- Evidence:
  - `push('info', 'Download started', doc.name)` with no retrieval call.
- Impact:
  - user expectation mismatch for evidence retrieval.
- Required fix:
  - implement real download path or clearly mark metadata-only.
- Priority:
  - Medium.

## 6) Simulated file upload in event EvidencePanel

- Where it appears:
  - `EvidencePanel` upload modal.
- Why stubbed:
  - mock file selection and static size label behavior.
- Evidence:
  - "Click to simulate file selection" + fixed `sizeLabel`.
- Impact:
  - non-production upload semantics in core evidence panel.
- Required fix:
  - integrate real file input and validation pipeline.
- Priority:
  - Medium.

## 7) CEU adapter runtime source

- Where it appears:
  - `server/ceu/routes.ts` + `server/ceu/registry.ts`.
- Why partial/stub:
  - no confirmed adapter registration in reviewed runtime path.
- Evidence:
  - registry defines adapter pattern; active adapter wiring needs confirmation.
- Impact:
  - CEU route value may be limited or empty depending deployment.
- Required fix:
  - register adapter(s) and add health endpoint assertions.
- Priority:
  - Medium.

## 8) Survey packet backend export endpoint

- Where it appears:
  - target expectation includes `POST /exports/survey-packet`.
- Why not found:
  - current packet export is frontend-generated (`surveyPacket.ts`) without dedicated backend export endpoint.
- Evidence:
  - no matching route mounted in server.
- Impact:
  - export immutability/signing/storage not backend-governed.
- Required fix:
  - optionally add backend packet generation and storage for production mode.
- Priority:
  - Medium.

## 9) Evidence lock lifecycle harmonization

- Where it appears:
  - evidence statuses and mutation controls across modules.
- Why partial:
  - lock is primarily event-level; evidence-level lifecycle statuses vary.
- Evidence:
  - execution store status set differs from Evidence Center status terms.
- Impact:
  - ambiguity in immutable evidence guarantees.
- Required fix:
  - create canonical evidence state machine and transition guard.
- Priority:
  - High.

## 10) Gantt/board mode clarity

- Where it appears:
  - PM/CES module references for sprint/board.
- Why partial/needs confirmation:
  - no single dedicated canonical Gantt route confirmed.
- Evidence:
  - board/sprint paths exist; explicit Gantt implementation surface unclear.
- Impact:
  - documentation can overstate feature completeness.
- Required fix:
  - confirm feature scope, label as available/roadmap clearly.
- Priority:
  - Low/Medium.
