# Appendix / Form Crosswalk

_Master Correction Prompt §11. Source: `appendixFormCrosswalk.generated.ts` (15 keys, build-verified against `FORMS_DATASET`) + `appendixForms.generated.ts` (baked `FormContent`). Status: **IMPLEMENTED (classification + real form render); Appendix F composite is partial**._

## Classification (every key classified; no guessed mappings)

| Key | Classification | Form(s) |
|---|---|---|
| F | COMPOSITE_PACKET | HR-FM-018, HR-FM-005, HR-FM-006, HR-FM-007 |
| A | EXACT_FORM | HR-FM-005 |
| B | EXACT_FORM | HR-FM-006 |
| HRTA005_A | EXACT_FORM | HR-FM-007 |
| HRTA005_B | FORM_MAPPING_REVIEW_REQUIRED | — |
| HRTA005_D | QUIZ_NOT_FORM | — (GAO-EXAM) |
| HRTA005_E | FORM_MAPPING_REVIEW_REQUIRED | — |
| HRTD003_A | EXACT_FORM | HR-FM-016 |
| HRTD003_C | EXACT_FORM | HR-FM-038 |
| HRTD003_D | EXACT_FORM | CL-FM-016 |
| HRTD003_E | EXACT_FORM | CL-FM-042 |
| HRER001_C | FORM_MAPPING_REVIEW_REQUIRED | — |
| HRTD001_B | FORM_MAPPING_REVIEW_REQUIRED | — |
| HRTD005_B | EXACT_FORM | RM-FM-005 |
| NONE | NO_FORM_REQUIRED | — (ADV modules) |

Missing form identity is classified `FORM_MAPPING_REVIEW_REQUIRED` (blocked), never invented.
The generator **fails the build** if any referenced form id is absent from `FORMS_DATASET`.

## Real form rendering

`/journey/forms/:formId` and `/journey/appendices/:appendixKey` render the canonical
`FormContent` via `ControlledFormRenderer` (grid/checklist/attestation/table/matrix/narrative/
image/signature layouts, version metadata, policy refs, signer roles) — not prose summaries.
Employee mode shows structural preview only; no confidential HR report content.

## Appendix F (partial)

`AppendixPacketNavigator` renders the Appendix F composite with 4 real baked constituent forms
(background auth, OIG/SAM, license verification, onboarding checklist) plus HR-managed status
rows. **Remaining:** the full §11.2 packet (references, I-9, health/TB/immunization, driving
clearance, offer letter, JD acknowledgment, HR sign-off) currently appears as hard-coded
status rows rather than each linking to a real artifact/status source.
