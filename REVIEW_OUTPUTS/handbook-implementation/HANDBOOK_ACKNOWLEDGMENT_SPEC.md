# Handbook Acknowledgment Spec

## Current status: disabled while draft

Acknowledgment collection is disabled at the application level for CI-HR-HB-2026
(`acknowledgmentEnabled = false`, baked into the generated projection metadata by the
ingestion pipeline). The `/acknowledgment` route exists in the reader but does not accept or
record acknowledgments while the handbook is a draft. This document specifies the intended
acknowledgment mechanism for when the handbook becomes effective — it does not describe an
active data-collection flow today.

## Attestation text (4 statements)

The acknowledgment, when enabled, presents an attestation composed of 4 statements that the
employee affirms:

1. I have received access to the Employee Handbook (identified by doc id and version).
2. I have had the opportunity to read and review its contents, including the referenced
   policies and forms.
3. I understand the handbook is a summary and does not replace the full policies and
   procedures it references.
4. I understand my acknowledgment applies to this specific version and that a future revised
   version will require a new acknowledgment.

## Recorded fields (per acknowledgment)

| Field | Purpose |
|---|---|
| Employee identifier | Who acknowledged |
| Doc id | Which handbook |
| Version | Which specific version |
| Content hash | Binds the acknowledgment to the exact content acknowledged |
| Acknowledgment timestamp | When the acknowledgment was recorded |

## Binding rules

- **Version-bound**: an acknowledgment is valid only for the specific version presented at the
  time of acknowledgment.
- **Content-hash-bound**: the acknowledgment record stores the content hash of the version
  acknowledged, so any later dispute over "what did the employee actually see" can be verified
  against the exact content, not just a version label.
- **Disabled while draft**: none of the above collection can occur until the handbook clears
  the release gates in `HANDBOOK_RELEASE_GATE_REPORT.md` and is flipped to effective.

## Not yet implemented / not observed in this review

No acknowledgment records exist for CI-HR-HB-2026. This spec describes the designed mechanism
as built into the reader and projection; it is not evidence of any acknowledgment having been
collected.
