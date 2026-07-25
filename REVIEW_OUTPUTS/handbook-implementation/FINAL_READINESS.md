# Handbook Implementation — Final Readiness

_Handbook plan §10. Branch `feature/governing-body-portal`. **No deployment.** The
2026 handbook remains a controlled draft; effective/acknowledgment gates are NOT
closed (they require employer-fact verification, policy reconciliation, and named
legal approvals this app cannot perform)._

## §10 acceptance criteria

| Criterion | Status |
|---|---|
| 2022 handbook retired and preserved | ✅ archived (hash `fc84d206…`), RETIREMENT_METADATA + report |
| Cannot be assigned or newly acknowledged | ✅ no distribution surface; tombstone-only; no-new-ack recorded |
| No one attempted to "fix" the legacy PDF | ✅ untouched, not renamed, not deleted |
| Reason for full replacement documented | ✅ LEGACY_2022_RETIREMENT_REPORT.md |
| 2026 source package integrity-verified | ✅ all 8 files' SHA-256 match manifest; build-time gate re-verifies |
| 2026 handbook remains visibly draft until gates close | ✅ watermark on every surface (screen/SR/print) |
| App cannot enable acknowledgment for a draft | ✅ `acknowledgmentEnabled=false`; controls disabled; `releaseIsBlocked()` true |
| All policy/form references validated or blocked | ✅ 104/52/25 reproduced exactly + linked; target-currency = OPEN gate #17 |
| Stale cited policies reconciled | ⚠️ SURFACED + BLOCKING (gate #16, 73 cited stale); per-policy list needs `policy_metadata2.json` (not in package) |
| Named approvals captured | ⛔ none — 8 approvals unsigned (correctly; cannot self-approve) |
| One approved Care Indeed logo throughout | ✅ single asset via `<CareIndeedBrand/>`; scanner PASS |
| No inline substitute logo remains | ✅ scanner: 0 inline brand-mark SVGs |
| No broken or remote logo remains | ✅ local bundled asset only |
| Approved handbook gets new ID/version/effective/hash | ⚠️ machinery scaffolded (meta + integrity); assigned only on the approved build |
| Acknowledgment bound to exact version + hash | ⚠️ spec'd (HANDBOOK_ACKNOWLEDGMENT_SPEC.md); enabled only post-approval |
| Retired + approved versions separately auditable | ✅ distinct IDs + hashes in /history |
| Responsive / accessibility / print / visual / route QA | ⚠️ built-in + desktop-verified; full device/AT/print-PDF sweep pending |
| No deployment without separate authorization | ✅ none occurred |

## What is DONE (verified, committed)

Retirement + preservation; integrity-verified ingestion with a fail-closed hash gate;
a native 48-section handbook reader (search/TOC/progress · native content · refs/owner/
status/Nolan) that never shows raw HTML/Markdown; same-tab policy/form links (104/52/25
reproduced); draft watermark everywhere; **acknowledgment disabled**; a 21-gate + 8-
approval release workspace that computes **BLOCKED**; retired-2022 tombstone; canonical
`<CareIndeedBrand/>` + drift scanner; Handbook nav entry. Journey-app tsc clean; live
smoke on all routes; console error-free.

## What remains (owner / counsel — cannot be done in-app)

Employer-fact verification (entity, locations, wage orders, plans, contacts), the 73
stale-policy reconciliation (needs the policy-metadata source), the 8 named legal/HR/
clinical/Governing-Body approvals, and — only after all gates close — publishing the
approved, version-bound build (new ID/version/effective date/content hash), removing the
watermark in that build, and enabling version-bound acknowledgment. Plus the automated
persona/print/device/AT QA sweep. None of these may proceed until separately authorized;
no deployment.

## The essential rule (held)

The 2022 handbook is historical evidence, not a repair candidate. The 2026 handbook is
the replacement foundation, and its draft status is preserved until verified employer
facts, policy freshness, legal review, and approvals are complete.
