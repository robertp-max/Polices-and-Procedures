# LMS Backend — Source Truth

**Date:** 2026-07-27
**Backend branch:** `feature/employee-journey-lms-backend`
**Starting SHA:** `7d861e9d` (from portal branch `journey_specific_updates`, which carries the
verified-green lockfile state + committed Playwright suite).
**Deploy:** none authorized; none performed.

## Controlling documents (canonical, in-repo)

| Artifact | Path | SHA-256 | Version |
|---|---|---|---|
| Architecture | `docs/Employee_Journey/LMS_Backend/CARE_INDEED_LMS_BACKEND_ARCHITECTURE.md` | `c9512380cec30e3e04e12b32c4d954871457473f7372a4de379ad9f9c23dbc13` | 1.0 |
| Implementation prompt | `docs/Employee_Journey/LMS_Backend/CLAUDE_CARE_INDEED_LMS_BACKEND_IMPLEMENTATION_PROMPT.md` | `c797834316664c17c40d78a43e36819bb11c106a75fe3829acf913110da15c97` | — |

Both read in full; not truncated (see `SPEC_INGESTION_PROOF.md`).

## Physical target (this platform)

Provider-neutral domain; **Phase-1 adapters target Google Cloud** (Firestore, GCS,
Cloud Tasks/Pub-Sub, Cloud KMS, existing Care Indeed auth) per **ADR-LEARNING-001** —
NOT AWS. The architecture's AWS resource names map to GCP equivalents in that ADR.

## Non-negotiable invariants carried into the domain layer

- Server-authoritative completion; browser holds resume-state only.
- No client-supplied official score; answer keys server-only.
- No standalone `completed=true`; completion is a derived `GateDecision`.
- Every assignment pins requirement/content/policy/assessment/grade/evidence/
  certificate/recurrence **version + SHA-256**.
- Attempts, grades, evidence, gate decisions, certificates are **append-only**.
- Policy reading is a `JourneyActivity`.
- Approved P&P: 10 questions / 80% / 3 ordinary attempts; third-failure ladder per ADR-LEARNING-003.
- Certificate ≠ clearance (ADR-LEARNING-004); distinct-human signoff (ADR-LEARNING-005).
- No PHI in events, responses, logs, certificates.

## Existing runtime this backend replaces authority for

`ci-journey-v1` (the current Employee Journey prototype) — browser/local persistence.
It may retain **resume state only**; it is not authoritative for completion, score,
competency, certificate, or clearance. Migration treats legacy records as untrusted
claims (architecture §21).

## Wave status

- **Wave 0 — ADRs:** complete (ADR-LEARNING-001…005; `ADR_INDEX.md`).
- **Wave 1 — domain foundation:** in progress (provider-neutral domain types + ports + in-memory adapters + invariant tests).
- **Waves 2–8:** not started. Waves that require live GCP services (Firestore/GCS/KMS
  integration, Cloud Tasks) are implemented against ports with in-memory/fake adapters
  here; live wiring + deploy are a separate, separately-authorized step.
