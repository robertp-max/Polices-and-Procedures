# Handbook Policy / Form Reference Validation

_Handbook plan §4. Source: the controlled crosswalk CSV joined to the parsed
sections. Status: **IMPLEMENTED / VERIFIED**._

## Reference totals (reproduce the manifest exactly)

| Reference type | Live index count | Manifest count | Match |
|---|---|---|---|
| Policies | 104 | 104 | ✅ |
| Forms / records | 52 | 52 | ✅ |
| External authorities | 25 | 25 | ✅ |

The `/journey/handbook/references` index rendered **104 policy rows**, each with a
same-tab link chip (104/104 linked), and no horizontal overflow.

## Per-section wiring

Every section's right rail shows its crosswalk-derived policy IDs, form IDs,
external authorities, process owner, and employee action. Each policy ID links
same-tab to the main-app `/library/<ID>`; each form ID to `/forms/<ID>` (via the
env-aware resolver — chips render as static when the origin is unconfigured in
production rather than pointing at a dead link).

## Resolution posture (honest)

- ID **presence and citing-section mapping** are validated here (join is exact,
  counts match the manifest).
- Whether each `/library/<ID>` and `/forms/<ID>` **target currently resolves in
  the main app**, and whether every form has the correct title/version in the
  canonical Forms Library, is **release gate #17** — it is OPEN. This app links to
  the canonical routes but does not (and must not, pre-approval) assert that every
  target is current. Role-applicability and owner correctness are part of the same
  reviewer sign-off.
