# Migration Plan — current generators → Universal Packet Platform (PRD §29 #14)

## Current generators
- `src/policy/qapi/renderQapiPacket.ts` (10-page QAPI HTML) and
  `src/v6/screens/evidence/alpha/qapiPacketDriver.ts` (upload→derive→render preview).
- `src/policy/admission/patientAdmissionPacket.tsx` (design-system source of truth) + server PDF.
- Legacy iframe studio (`public/care_indeed_pdf_studio.html`) + `defensibleAlphaDriver.ts`.

## Convergence path
1. **Done:** `renderQapiPacketHtmlFromRollup` refactored into a shim that builds a `PacketModel` and
   calls the model-driven `renderPacketModel`; the 10 pages are now analytical-report module renderers.
   `qapiPacketDriver.ts` still works unchanged (consumes the shim).
2. **Next:** point `qapiPacketDriver`/Defensible2StudioLanding QAPI generation at the new
   `/api/packets` lifecycle + `PacketStudioScreen` flow (behind the existing `/evidence` studio, which
   stays as-is until parity is demonstrated). Retire the QAPI branch of the alpha driver.
3. **Admission packet:** adopt the rendering-profile registry tokens; optionally re-express admission as
   a packet archetype once QAPI parity is proven. No change required for this release.
4. **Retire** the legacy iframe studio only after the native Packet Studio covers its templates.

## Guardrails during migration
`/evidence` must keep rendering `Defensible2Studio` (pre-commit guard); no bespoke renderers
(architecture test); recurring occurrences never overwrite (store idempotency + lock immutability).
