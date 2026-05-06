# Admin User Manual

Audience: system administrators, compliance leads, and implementation owners.

## 1) Managing policies

- Primary runtime references:
  - `src/policy/data/policyCorpus.ts`
  - `src/policy/data/allPoliciesContent.generated.ts`
- Admin actions:
  - validate policy IDs, verify detail/print renders, confirm cross-links to forms/workflows.
- Warning:
  - avoid editing generated files manually unless pipeline requires direct update process.

## 2) Reviewing workflows

- Source:
  - `Builder/Policies/Workflows/*-WORKFLOWS.md`
- Compile path:
  - `scripts/compileWorkflows.ts`
- Admin checks:
  - section completeness, required form IDs, policy refs, dependency graph output.

## 3) Configuring events

- Event source files:
  - `src/policy/data/regulatoryEvents.ts`
  - `src/policy/data/mandatedEventsExpanded.ts`
- Execution runtime:
  - compliance-execution modules + `useRegulatoryExecutionStore`.
- Admin checks:
  - event/workflow references remain aligned after data updates.

## 4) Monitoring evidence

- Current evidence stores:
  - `reg-execution-v2` local store (execution path)
  - `evidence-center-demo-store-v1` local store (Evidence Center demo)
- Admin checks:
  - ensure event/task/form linkage exists,
  - verify lock behavior after certification,
  - verify evidence appears in packet exports.

## 5) Checking audit logs

- Frontend/local:
  - workflow execution audit chain (`taskAuditByEventId`).
- Backend:
  - `server/audit/data/*.jsonl`
  - `server/ecign/data/*.jsonl`
  - `.cache/audit/*.jsonl`
- Admin checks:
  - hash-chain continuity where supported,
  - actor/time/entity records for critical transitions.

## 6) Validating broken links and navigation

- Check routes in `src/App.tsx` and module links from:
  - workflow panels,
  - evidence/form links,
  - help center contextual links.
- Admin practice:
  - run route smoke checks after generator updates.

## 7) Rebuilding generated data

- Workflows:
  - run workflow compile script; confirm generated files update.
- Policies:
  - run selected policy generation path (canonical script needs confirmation).
- Forms:
  - run forms build script and reconcile with runtime dataset.
- Master control inventory:
  - run sync script to copy source JSON into `public` outputs.

## 8) Troubleshooting Brad / iAdministrator

- Runtime context path:
  - `src/services/bradAppContext.ts`
- Backend IA path:
  - `/api/ia/*` in `server/ia/`
- Troubleshooting order:
  - verify source datasets load,
  - verify IA index exists,
  - confirm references are returned for user prompts.

## 9) AWS/backend checks

- Express route mounts:
  - confirm `/api/*` route availability in `server/index.ts`.
- Auth dependencies:
  - confirm Cognito/SES/Dynamo env vars.
- CDK stack:
  - verify `infra/demo-auth-cdk` deploy/synth status.
- Important:
  - `/api/compliance-execution` route is not mounted in local server; treat remote client mode as needs confirmation.

## 10) localStorage vs backend persistence limitations

- Current limitation:
  - significant execution/evidence state remains browser-local in demo/local mode.
- Impact:
  - cross-user consistency and immutable backend audit guarantees are reduced in this mode.
- Admin mitigation:
  - keep environment mode explicit,
  - use backend routes where implemented,
  - avoid mixing demo local mode and remote mode without reset/migration procedure.

---

## Admin Operations Checklist

- [ ] Verify generated files are rebuilt before release.
- [ ] Verify evidence/event/task linkage after data changes.
- [ ] Verify audit exports render expected completeness.
- [ ] Verify role access controls for admin pages.
- [ ] Verify backend env configs and route mounts for target deployment mode.
