# LMS Backend — ADR Index (Wave 0)

Architecture decisions resolving the open questions the controlling architecture flags
before code. All ADRs live in `docs/Employee_Journey/LMS_Backend/adr/`.

| ADR | Decision | Status |
|---|---|---|
| [ADR-LEARNING-001](../../docs/Employee_Journey/LMS_Backend/adr/ADR-LEARNING-001-production-storage.md) | **Production storage** — provider-neutral domain; Phase-1 adapters target **Google Cloud** (Firestore records+events, GCS artifacts, Cloud Tasks/Pub-Sub, Cloud KMS, existing Care Indeed auth). Corrects the spec's AWS naming. | Accepted |
| [ADR-LEARNING-002](../../docs/Employee_Journey/LMS_Backend/adr/ADR-LEARNING-002-event-outbox-model.md) | **Event/outbox** — single Firestore transaction writes state + append-only event + outbox; at-least-once relay + idempotent consumers; optional hash chain. | Accepted |
| [ADR-LEARNING-003](../../docs/Employee_Journey/LMS_Backend/adr/ADR-LEARNING-003-assessment-attempt-policy.md) | **Assessment/attempt** — 10q/80%/3 ordinary attempts; **post-third-failure = hold + DON/HR review + identity-bound single-use `ReattemptAuthorization`** that continues (never resets) attempt numbering; server-only scoring; `LATEST_PASS` default grade policy. | Accepted |
| [ADR-LEARNING-004](../../docs/Employee_Journey/LMS_Backend/adr/ADR-LEARNING-004-certificate-clearance-separation.md) | **Certificate vs clearance** — certificates never grant clearance; clearance requires its own signed `GateDecision`; scopes isolated; annual lapse never rewrites historical onboarding certificate. | Accepted |
| [ADR-LEARNING-005](../../docs/Employee_Journey/LMS_Backend/adr/ADR-LEARNING-005-artifact-signature-record-routing.md) | **Artifact/signature/routing** — GCS immutable artifacts; Cloud KMS signs GateDecisions + certificate manifests; distinct-human signoff enforced in data model + gate rule; deterministic server-side certificates; Drive mirror is non-authoritative. | Accepted |

## Gate satisfied

The architecture/impl prompt require the **post-third-failure reattempt rule** to be
resolved before publishing any `AttemptPolicy` record — resolved in ADR-LEARNING-003.
Wave 1 (domain foundation) may now proceed.
