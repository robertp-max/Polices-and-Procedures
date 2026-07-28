# LMS Backend — Domain Readiness (Waves 0–8)

**Branch:** `feature/employee-journey-lms-backend`
**Nature:** provider-neutral TypeScript domain + pure invariants + tests. **No deployment.**
**Physical target:** Google Cloud (Firestore/GCS/Cloud KMS/Cloud Tasks) behind ports — ADR-LEARNING-001.

## Waves complete (domain layer)

| Wave | Module(s) | What it enforces |
|---|---|---|
| 0 | `adr/ADR-LEARNING-001..005` | Storage(GCP)/event-outbox/attempt-policy/cert≠clearance/artifact-signature decisions |
| 1 | `invariants.ts` | Derived completion, append-only attempts, unrounded pass + critical error, versioned grade selection, distinct-human, cert-from-signed-PASS-gate, evidence-must-be-validated |
| 2 | `ports.ts`, `planning.ts`, `activity.ts` | Hexagonal ports; role/duty resolution; version-pinned assignment status; active-time heartbeat validation |
| 3 | `assessment.ts` | 10q/80%/3-attempt ladder + cooldown/hold; server question-set + scoring; grade decision; identity-bound single-use reattempt |
| 4 | `evidence.ts` | Append-only evidence + artifact-required validation; competency (qualified, non-self evaluator); signoff distinct-human + signature-service ref; Drive mirror non-authoritative |
| 5 | `gates.ts` | Versioned rule-tree evaluation → PASS/FAIL/CONDITIONAL(override); signed-non-stale-non-expired consumption |
| 6 | `certificates.ts` | Idempotent issuance; deterministic manifest (source of truth); data-minimized public verification; revoke/supersede never delete; annual lapse never rewrites history |
| 7 | `recurrence.ts` | Deterministic cycle keys; ACCEPTED-only credit ledger; HHA rolling 12-hour; readiness-vs-history; transcript projection |
| 8 | `migration.ts` | Legacy classification (MAPPED/AMBIGUOUS/QUARANTINED/REJECTED); no boolean-to-pass; never creates a signed gate; idempotent |

## Tests

```
npx vitest run src/learning/domain/
→ 9 files, 94 tests, all passed
```

## Not yet built (require live GCP + deploy authorization — out of scope here)

- Firestore/GCS/Cloud KMS/Cloud Tasks adapter **implementations** of the ports.
- The `/api/training/*` HTTP surface (learner/supervisor/admin/public) wired into the
  existing authenticated server, with Cognito/existing-auth JWT, object-level authz,
  Idempotency-Key, optimistic concurrency, and the outbox relay.
- SCORM runtime adapter, certificate PDF renderer worker, notification/CES/calendar
  projections.
- Shadow-mode migration run + parity report against real `ci-journey-v1` data.

Each of the above consumes the domain via the existing ports and invariants; none
requires changing the domain types or rules committed here.

## Stop condition (honest)

Per the architecture's §26 acceptance list, the domain-layer guarantees are in place
and tested, but **production readiness also requires the live GCP wiring, the HTTP API,
signed real KMS decisions, deterministic PDF rendering, and the migration shadow run** —
all of which need cloud credentials and a separate deployment authorization. Those are
the remaining, explicitly-gated steps.
