# Gap Analysis and Recommendations

Each gap entry includes current behavior, desired behavior, risk, complexity, dependencies, and sequencing.

## A) Architecture gaps

### Gap A1: Split compliance execution API boundary

- Gap description: frontend defines local and awsRemote compliance execution clients, but local backend lacks awsRemote route group.
- Current behavior: local mode works; remote mode target contracts are not backed in local server.
- Desired behavior: single explicit runtime mode with available backend implementation.
- Risk level: High.
- Impact: false readiness assumptions and runtime API failures.
- Recommended fix: implement `/api/compliance-execution/*` or remove runtime exposure until available.
- Estimated complexity: High.
- Dependencies: backend route design, storage model decisions.
- Sequence: Phase 0/1.

## B) Data model gaps

### Gap B1: Divergent evidence status and shape models

- Current behavior: EvidenceDoc and EvidenceCenter models use different status/field sets.
- Desired behavior: canonical evidence schema across modules.
- Risk: High.
- Impact: inconsistent validation and reporting.
- Fix: define canonical evidence DTO + migration adapters.
- Complexity: Medium.
- Dependencies: evidence lifecycle design.
- Sequence: Phase 1.

## C) Evidence system gaps

### Gap C1: Production-grade evidence lifecycle is partial

- Current behavior: local metadata workflows are implemented; cloud promote/lock/audit path mostly target/stub.
- Desired behavior: full upload-init -> validate -> promote -> lock -> audit -> export chain.
- Risk: High.
- Impact: audit defensibility limitations.
- Fix: implement and enforce backend pipeline and immutable transitions.
- Complexity: High.
- Dependencies: storage schema, API contracts, security controls.
- Sequence: Phase 1-3.

## D) Workflow/event/task gaps

### Gap D1: Evidence requirement enforcement is uneven by task source

- Current behavior: some task types enforce evidence before completion, others do not.
- Desired behavior: explicit policy-driven evidence requirement matrix.
- Risk: Medium.
- Impact: incomplete evidence under completed tasks.
- Fix: centralized task completion gate rules.
- Complexity: Medium.
- Dependencies: workflow/task policy metadata.
- Sequence: Phase 2.

## E) Policy/form linkage gaps

### Gap E1: Forms build output promotion drift

- Current behavior: forms build writes to `.cache`, runtime reads checked-in dataset.
- Desired behavior: deterministic generated runtime dataset promotion.
- Risk: Medium.
- Impact: stale forms metadata in runtime.
- Fix: add promotion command + CI check.
- Complexity: Low/Medium.
- Dependencies: build pipeline updates.
- Sequence: Phase 0.

## F) Brad/AI gaps

### Gap F1: Runtime Brad context and IA corpus can diverge

- Current behavior: runtime context built from TS datasets, IA index built from Builder source subsets.
- Desired behavior: explicit corpus alignment policy and validation.
- Risk: Medium.
- Impact: reference/result inconsistency.
- Fix: shared corpus manifest and drift checker.
- Complexity: Medium.
- Dependencies: IA indexing workflow.
- Sequence: Phase 4.

## G) AWS/backend gaps

### Gap G1: Mixed auth patterns across modules

- Current behavior: auth routes rely on Cognito tokens; eCIGN uses header-based demo session middleware.
- Desired behavior: unified auth strategy by environment tier.
- Risk: High.
- Impact: security posture inconsistency.
- Fix: consolidated auth middleware strategy + route policy matrix.
- Complexity: Medium/High.
- Dependencies: deployment model.
- Sequence: Phase 5.

## H) UI/UX gaps

### Gap H1: Evidence UX mismatch in local modes

- Current behavior: upload/download controls may imply full file operations when metadata-only path is active.
- Desired behavior: explicit mode messaging with capability flags.
- Risk: Medium.
- Impact: user confusion and operational mistakes.
- Fix: mode-aware UI labels, disabled actions with guidance.
- Complexity: Low.
- Dependencies: minimal.
- Sequence: Phase 0.

## I) Security/compliance gaps

### Gap I1: Cryptographic integrity handling not unified

- Current behavior: local checksum helper is not equivalent to cryptographic file integrity evidence.
- Desired behavior: content-hash integrity fields and verification events on every evidence promotion.
- Risk: High.
- Impact: weaker chain-of-custody defensibility.
- Fix: sha256 lifecycle fields + immutable audit events.
- Complexity: Medium.
- Dependencies: backend evidence pipeline.
- Sequence: Phase 1-3.

## J) Documentation gaps

### Gap J1: Implemented vs target boundaries are not consistently labeled across docs

- Current behavior: several docs describe planned architecture without clear status flags.
- Desired behavior: strict tags for implemented/partial/stub/planned.
- Risk: Medium.
- Impact: planning and audit confusion.
- Fix: standardized doc status template.
- Complexity: Low.
- Dependencies: documentation governance.
- Sequence: Immediate.

## K) Generated-file drift risks

### Gap K1: Orphan generated artifacts and unclear ownership

- Current behavior: some generated files lack visible active consumers.
- Desired behavior: each generated file has owner, producer script, and consumer list.
- Risk: Medium.
- Impact: stale data and accidental dependency assumptions.
- Fix: generated-manifest doc + CI check for orphan artifacts.
- Complexity: Low/Medium.
- Dependencies: repository metadata cleanup.
- Sequence: Phase 0.

## L) Testing/QA gaps

### Gap L1: No single evidence lifecycle QA gate

- Current behavior: evidence checks are distributed across UI behaviors and local logic.
- Desired behavior: repeatable QA checklist with automated smoke suite for critical transitions.
- Risk: High.
- Impact: regressions in lock/audit/export paths.
- Fix: establish evidence QA checklist + integration tests for key endpoints/state transitions.
- Complexity: Medium.
- Dependencies: stable API contract.
- Sequence: Phase 1.
