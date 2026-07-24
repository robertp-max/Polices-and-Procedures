# Final Readiness — Employee Journey Completion

_Master Correction Prompt §21. Honest status. Branch `feature/governing-body-portal`; work
committed and pushed. **No deploy.** This is an incremental correction pass focused on the
owner's hard rejections; it is not a claim of full §21 completion._

## Pushed this pass (verified)

| Commit | What |
|---|---|
| 53cef495 | Annual page rebuilt → "Annual & Recurring Requirements" + dedup projection + runtime-owner proof |
| 38cb243d | Policy reader parses numbered clauses / ordered lists (no more markdown-dump feel) |
| c4b745c3 | Real Nolan assistant replaces "Need help?" (graceful degradation) |
| 2ce03a05 | Nav dedup — single learner training destination |

## §21 acceptance checklist (honest)

| # | Criterion | Status |
|---|---|---|
| 1 | "Agency Annual Plan" tab gone | ✅ DONE |
| 2 | "Annual Competency" tab gone | ✅ DONE |
| 3 | Competency remains in Competencies workspace | ✅ DONE (linked) |
| 4 | Annual/recurring deduplicated | ✅ DONE |
| 5 | All 12 ACHC modules mapped | ✅ DONE |
| 6 | ACHC restricted to clinical audience (M04/M07/M09 leak fixed, DON added, ADM secondary-only) | ✅ DONE |
| 7 | Advanced in onboarding + recurring for PT/RN/DON/ADM | ✅ DONE (annual + advanced route; standalone nav link still recommended) |
| 8 | Every canonical module mapped | ✅ DONE (MODULE_PLAYER_MAP) |
| 9 | All families use the canonical main-app player | ✅ DONE (launched same-tab; not copied) |
| 10 | GAO/LVN/RN use two-panel player | ✅ via canonical player launch; ⚠️ chrome-free embed refinement pending |
| 11 | No mapped module uses a one-panel template | ✅ DONE (no template exists; availability from player map) |
| 12 | P&P no longer renders raw/copy-pasted markdown | ✅ improved (clauses/lists parsed); ⚠️ premium learning right-rail pending |
| 13 | New policy player visually premium & usable | ⚠️ PARTIAL |
| 14 | Actual forms render for appendices | ✅ DONE |
| 15 | Appendix F is a real composite packet | ⚠️ PARTIAL (4 real forms + status rows) |
| 16 | Supervised visitation present | ⚠️ documented + competency items; dedicated matrix UI pending |
| 17 | OIG/SAM status present | ⚠️ documented; status-tile UI pending |
| 18 | Full HR lifecycle present | ⚠️ crosswalk documented; lifecycle UI pending |
| 19 | Day 30/60/90 + annual performance present | ⚠️ Performance workspace exists; explicit phase framing pending |
| 20 | Documents/credentials, leave/return, separation | ⚠️ Documents present; separation surface missing |
| 21 | Nolan replaces generic Need Help | ✅ DONE |
| 22 | Workflow training NOT added | ✅ CONFIRMED (none added) |
| 23 | Same-tab navigation works | ✅ DONE |
| 24 | No production URL uses localhost | ✅ DONE (env-aware, fails closed) |
| 25 | Responsive/accessibility QA passes | ⚠️ PARTIAL (built-in; full sweep pending) |
| 26 | No backend/deployment work occurred | ✅ CONFIRMED |
| 27 | Branch pushed & synchronized | ✅ DONE |

## Honest bottom line

The owner's most-cited rejections are corrected and pushed: the Annual page is rebuilt and
deduplicated, ACHC/Advanced audiences are correct and player-backed (no false "Unavailable"),
the P&P reader no longer flattens numbered policy text, Nolan replaces the generic support
treatment, and the duplicate training nav is collapsed. **Remaining** (larger builds, not yet
done): the full pre-hire→separation lifecycle surface (§12), the supervised-visitation matrix
+ OIG/SAM status tiles UI (§13), the premium P&P learning right-rail with in-context Nolan +
practice scenario (§9.3), the full Appendix F composite (§11.2), chrome-free embedded module
players with journey-return (§8.4), and the automated persona/parity test suite + full
responsive/a11y sweep (§18). Each is scoped in its report above.
