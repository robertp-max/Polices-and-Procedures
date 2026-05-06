# Current Gaps and Risks

Only observed or strongly evidenced current-state gaps are listed.  
Each item includes recommended next action.

## Runtime gaps

1. Dual evidence data stores (`reg-execution-v2` and `evidence-center-demo-store-v1`) are not unified.
   - Next action: define single runtime source mode or sync strategy.
2. Evidence Center defaults to `LAMBDA_DISABLED = true`, so cloud evidence pipeline is bypassed.
   - Next action: provide explicit environment mode toggle and smoke tests.
3. `/api/compliance-execution` client contracts exist but local Express does not mount this route.
   - Next action: either implement route group or disable awsRemote mode in UI.

## Documentation gaps

1. Multiple overlapping policy generation scripts with unclear canonical owner.
   - Next action: designate canonical script and update generation headers.
2. Some generated files have unclear consumer status.
   - Next action: add generated artifact ownership and usage map in build docs.
3. Builder docs and runtime implementation diverge in some evidence lifecycle descriptions.
   - Next action: add "implemented vs target" labels in all architecture docs.

## Data integrity gaps

1. Form build output goes to `.cache` while runtime reads checked-in dataset file.
   - Next action: create promoted output step or CI guardrail to prevent drift.
2. Evidence local checksum is not a cryptographic content hash.
   - Next action: add true content digest in upload path.
3. Placeholder tokens (`UNASSIGNED-POLICY`, `UNASSIGNED-WORKFLOW`) can be written in evidence metadata.
   - Next action: enforce strict required IDs in production mode.

## UX gaps

1. EvidencePanel download action is toast-only in local flow.
   - Next action: show explicit metadata-only badge or wire actual file retrieval path.
2. Upload modal simulates file selection and fixed size labels.
   - Next action: expose clear demo-labeling and transition plan to real file handling.
3. Mixed status vocabularies can confuse users (`active` vs `EVIDENCE_LOCKED` etc.).
   - Next action: standardize status labels across UI surfaces.

## AWS/backend gaps

1. Auth stack is implemented, but compliance-execution API backend path is missing in local server.
   - Next action: define backend boundary and route ownership.
2. Evidence API endpoint contracts are frontend-defined but server implementation is not confirmed in repo.
   - Next action: publish API contract + implementation matrix with deploy target.
3. Identity model differs across auth and eCIGN routes (header-based session in eCIGN).
   - Next action: unify auth enforcement policy by environment tier.

## Security/compliance gaps

1. Evidence immutability is mostly event-lock based, not full evidence-row lifecycle enforcement.
   - Next action: implement explicit immutable evidence state transitions.
2. Audit event taxonomy differs across frontend execution, eCIGN, and audit-v2 paths.
   - Next action: define canonical audit event schema.
3. Local demo storage does not provide production-grade chain-of-custody guarantees.
   - Next action: require cloud-backed immutable store in production mode.

## Generated-file drift risks

1. `frameworkSeed.generated.ts` and policy corpus data can diverge.
   - Next action: add cross-validation script in CI.
2. ACHC/crosswalk generated artifacts may lack visible generator ownership in repo.
   - Next action: document generation origin and rebuild process.
3. `public` master-control JSON has three synced copies.
   - Next action: retain sync script as single write path and validate copy parity.
