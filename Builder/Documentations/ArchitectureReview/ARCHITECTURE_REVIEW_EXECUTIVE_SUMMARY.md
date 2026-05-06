# Architecture Review Executive Summary

## Overall architecture status

- The repository contains a substantial and functioning runtime application:
  - React frontend with broad module coverage,
  - Express backend with auth/eCIGN/audit/calendar/IA routes,
  - generated data pipelines for policies/forms/workflows.
- The evidence architecture is partially implemented:
  - local execution evidence model is active,
  - cloud-grade evidence lifecycle is mostly target/stubbed in current runtime mode.

## What is working now

- Core UX domains are operational: dashboard, library, forms, workflows, calendar, audit mode, PM/CES, help center, iAdministrator.
- Local event/task/form execution with certification gating is implemented.
- Survey packet generation (markdown/html) is implemented in frontend audit pipeline.
- Auth backend with Cognito/SES/Dynamo integration is implemented.

## What is not implemented or partial

- `awsRemote` compliance execution API path is not backed by local Express routes.
- Evidence Center cloud flow is coded but disabled by default (`LAMBDA_DISABLED`).
- Evidence row lifecycle (validate/promote/immutable lock/version/supersede) is not fully unified.
- Evidence storage and metadata are split across local demo stores and target API contracts.

## Highest-risk gaps

1. Evidence chain-of-custody completeness in production pathway is not fully implemented in repo runtime.
2. Dual evidence models/stores can drift and create audit ambiguity.
3. Mixed auth/session enforcement across backend modules.
4. Generated data drift risk (forms and some generated artifacts).
5. Documentation sometimes describes target state without strict implemented labels.

## Most important recommendations

1. Establish canonical evidence model and lifecycle first.
2. Implement or explicitly disable unreachable remote compliance-execution APIs.
3. Unify evidence status taxonomy and audit event schema.
4. Add strict triplet and linkage validation gates.
5. Add generated artifact ownership and CI drift checks.

## Suggested implementation order

1. Phase 0: stabilize mode clarity and drift checks.
2. Phase 1: evidence chain-of-custody foundation.
3. Phase 2: enforce task/form/evidence binding.
4. Phase 3: harden audit/export engine.
5. Phase 4: align Brad/IA corpus behavior.
6. Phase 5: backend/auth hardening.
7. Phase 6: production readiness gates.

## Verdict

- Ready for demo: **Yes** (with explicit demo-mode labeling).
- Ready for internal pilot: **Conditional** (requires evidence mode and API boundary clarity).
- Not ready for production: **Yes** (current state is not production-ready for evidence chain-of-custody requirements).

## Required before production

- implement and verify production evidence upload/validate/promote/lock pipeline,
- unify and enforce canonical evidence/audit schemas,
- resolve remote API boundary (`/api/compliance-execution`) and route ownership,
- harden auth/identity consistency across all critical routes,
- establish CI checks preventing generated-data drift.
