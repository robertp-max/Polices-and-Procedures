# Final Readiness — Employee Journey Completion

_Master Correction Prompt §21. Honest status. Branch `feature/governing-body-portal`; work
committed and pushed. **No deploy.** This is an incremental correction pass focused on the
owner's hard rejections; it is not a claim of full §21 completion._

## Overall status: **CONDITIONAL PASS**

The owner's hard rejections are corrected, and (post-push hardening) the P0 defects are fixed:
main-app origin (5188 not 5190), OIG/SAM applicability (not hard-coded N/A), HHA scenario-
specific clocks, and approved-equivalency dedup gating — all covered by the runnable invariant
suite (`journey:verify:corrections`, 24/24) and a guardrail source scan (`journey:verify:guardrails`,
PASS). This is **not** a full acceptance PASS: the checklist rows below marked ✅ reflect the
feature being *implemented*, not that the full automated acceptance matrix has run. The following
remain **NOT RUN / open** and gate a full PASS:

- 18-persona **automated** browser matrix (Playwright) across 320/375/768/1024/1440/1600 + 200% zoom
- keyboard-only + screen-reader semantics sweep
- regulatory-cadence and module-player-parity **assertions** (beyond the data invariants)
- cross-app **return-route** testing and **authenticated** Nolan testing
- Nolan authenticated client (still sends dev `x-user-*` headers — tracked)

A manual 10-persona DOM sweep is **not** full responsive/accessibility acceptance and is not
claimed as such.

## Pushed this pass (verified)

| Commit | What |
|---|---|
| 53cef495 | Annual page rebuilt → "Annual & Recurring Requirements" + dedup projection + runtime-owner proof |
| 38cb243d | Policy reader parses numbered clauses / ordered lists (no more markdown-dump feel) |
| c4b745c3 | Real Nolan assistant replaces "Need help?" (graceful degradation) |
| 2ce03a05 | Nav dedup — single learner training destination |
| 63c47f23 | 17 review deliverable docs |
| 2b28ef00 | Supervised visitation matrix + OIG/SAM status (§13) — implemented |
| bb18b6fb | P&P learning right-rail + in-context Nolan (§9.3) — implemented |

## §21 acceptance checklist (honest)

| # | Criterion | Status |
|---|---|---|
| 1 | "Agency Annual Plan" tab gone | ✅ DONE |
| 2 | "Annual Competency" tab gone | ✅ DONE |
| 3 | Competency remains in Competencies workspace | ✅ DONE (linked) |
| 4 | Annual/recurring deduplicated | ✅ DONE |
| 5 | All 12 ACHC modules mapped | ✅ DONE |
| 6 | ACHC restricted to clinical audience (M04/M07/M09 leak fixed, DON added, ADM secondary-only) | ✅ DONE |
| 7 | Advanced in onboarding + recurring for PT/RN/DON/ADM | ✅ DONE (annual + advanced route + Training-workspace nav links) |
| 8 | Every canonical module mapped | ✅ DONE (MODULE_PLAYER_MAP) |
| 9 | All families use the canonical main-app player | ✅ DONE (launched same-tab; not copied) |
| 10 | GAO/LVN/RN use two-panel player | ✅ via canonical player launch; ⚠️ chrome-free embed refinement pending |
| 11 | No mapped module uses a one-panel template | ✅ DONE (no template exists; availability from player map) |
| 12 | P&P no longer renders raw/copy-pasted markdown | ✅ DONE (clauses/lists parsed) |
| 13 | New policy player visually premium & usable | ✅ improved (learning right-rail + in-context Nolan added); further polish optional |
| 14 | Actual forms render for appendices | ✅ DONE |
| 15 | Appendix F is a real composite packet | ✅ DONE (grouped packet, employee-safe statuses, 4 real-form links) |
| 16 | Supervised visitation present | ✅ DONE (role/assignment oversight clocks in Competencies) |
| 17 | OIG/SAM status present | ✅ DONE (employee-safe status tile) |
| 18 | Full HR lifecycle present | ✅ DONE — My Journey timeline runs pre-hire (incl. OIG/SAM) → separation; HR crosswalk documented (per-item status tiles a future polish) |
| 19 | Day 30/60/90 + annual performance present | ✅ DONE — day-30 / day-60 check-in + day-90 evaluation phases (distinct from check-ins) + Performance workspace |
| 20 | Documents/credentials, leave/return, separation | ✅ DONE — Documents workspace + leave-return & separation timeline phases |
| 21 | Nolan replaces generic Need Help | ✅ DONE |
| 22 | Workflow training NOT added | ✅ CONFIRMED (none added) |
| 23 | Same-tab navigation works | ✅ DONE |
| 24 | No production URL uses localhost | ✅ DONE (env-aware, fails closed) |
| 25 | Responsive/accessibility QA passes | 🚫 NOT RUN as full acceptance — semantics + media queries in place, desktop no-overflow verified; the 18-persona automated matrix + zoom + keyboard + screen-reader sweeps have NOT run |
| 26 | No backend/deployment work occurred | ✅ CONFIRMED |
| 27 | Branch pushed & synchronized | ✅ DONE |

> Rows marked ✅ mean the feature is **implemented and spot-verified**, not that the full
> automated acceptance matrix (§18) has run. Overall status is **CONDITIONAL PASS** (see top).

## Later commits (parallel budget-model pass)

| Commit | What |
|---|---|
| f8afa6ea | Runnable invariant suite — first pass |
| 545d2083.. | Appendix F composite packet (§11.2) + Advanced/Annual Training nav links (§7) |
| (post-push hardening) | P0 fixes: main-app origin 5188, OIG/SAM applicability, HHA scenario clocks, approved-equivalency dedup; invariant suite → 24/24; guardrail scan PASS |

## Honest bottom line

The owner's most-cited rejections are corrected and pushed, and the post-push P0 defects are
fixed and covered by runnable checks (`journey:verify:corrections` 24/24; `journey:verify:guardrails`
PASS): the Annual page is rebuilt/deduplicated through **approved-equivalency records** (ANN-006
return demonstration is retained, not erased), ACHC/Advanced audiences are correct and player-
backed, the P&P reader no longer flattens numbered policy text, **OIG/SAM applicability is no
longer hard-coded by clinical vs nonclinical role** (REVIEW_REQUIRED where unresolved), **HHA
oversight is assignment/scenario-specific** (rules-that-may-apply vs active-assignment clocks),
the **main-app origin points at 5188** (not the journey app), Nolan replaces the generic support
treatment, and the duplicate training nav is collapsed.

**Still open — gates a full PASS, not yet done:** the **authenticated** Nolan client (still sends
dev `x-user-*` headers), the **18-persona automated Playwright matrix** across all viewports +
200% zoom + keyboard + screen-reader, regulatory-cadence and module-player-parity **assertions**,
cross-app **return-route** and authenticated-Nolan browser tests, the full pre-hire→separation
lifecycle surface (§12), the complete Appendix F crosswalk + persona-driven MVR (§9), and the
deeper policy-player completion-semantics/jargon work (§8). Tracked in this session's task list.
