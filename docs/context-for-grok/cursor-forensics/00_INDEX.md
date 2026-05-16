# Cursor Forensics Index

**Project**: HomeHealth Compliance App  
**Created**: 2026-05-14  
**Source transcripts analyzed**: 86 parent chats, 168 total (including subagents)  
**globalStorage state.vscdb**: ~4.5 GB (not dumped — per constraints)  
**Purpose**: Forensic documentation of recurring build, runtime, and AI-agent failures for handoff to Grok for independent analysis and remediation.

---

## Component Priority Table

| Component | File | Priority | Recurring Symptom | Suspected Root Cause | Prior Fix Status | Proof Missing |
|-----------|------|----------|-------------------|----------------------|------------------|---------------|
| Auth / Vercel | [VERCEL_AUTH_FAILURE.md](./components/auth/VERCEL_AUTH_FAILURE.md) | P0 | Login loops or blank screen on Vercel deployment; `vercel redeploy` reuses stale bundle | `VITE_LOCAL_DEMO_AUTH_BYPASS` is a Vite build-time constant baked as `false`; `vercel.json` wildcard rewrite captures `/api/*` with 405 | CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION — set in dashboard but no new build triggered | Browser login confirmation; network tab showing no Cognito calls |
| eCIgn Signed Artifact | [ECIGN_SIGNED_ARTIFACT_FAILURE.md](./components/ecign/ECIGN_SIGNED_ARTIFACT_FAILURE.md) | P0 | After signing, Download/Print/Open actions open live form HTML template, not the stored signed PDF | Post-sign handlers resolve to form-render path instead of artifact retrieval; no deterministic filename standard; multi-signer PDF chain not implemented | CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION — signing UI rendered but PDF chain never validated | Click Download after signing; confirm PDF contains signed content not blank template; test after hard refresh |
| Evidence Center | [EVIDENCE_CENTER_METADATA_ONLY.md](./components/evidence/EVIDENCE_CENTER_METADATA_ONLY.md) | P1 | Evidence row visible after reload; artifact content gone; sandbox reset fails to clear evidence | `demoEvidenceRuntimeCache` is in-memory only; object URL lost on reload; reset does not clear persisted evidence rows | CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION — reset reported fixed but user confirmed still broken (May 11 session) | Hard refresh → Evidence Center → click artifact; confirm content loads; sandbox reset → confirm all rows cleared |
| CES / Task Identity | [CES_TASK_IDENTITY_AND_Q2_FAILURES.md](./components/ces/CES_TASK_IDENTITY_AND_Q2_FAILURES.md) | P1 | Q2 2026 tasks missing from sprint/kanban/gantt; form links navigate to Forms Library not form instance; form data lost on refresh; sign button missing; audit trail links broken | `taskOverridesByEventId` corrupts canonical IDs; form_instance_id not passed in nav URL; form state in-memory only; targetKind/targetId not written to audit entries | CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION — 6 Playwright-verified defects found May 10–11, 2026 | 6 specific Playwright tests described in DEFECT-Q2-001 through DEFECT-Q2-006 |
| Calendar / Sprint / Kanban / Gantt | [CALENDAR_SPRINT_KANBAN_GANTT_SYNC.md](./components/calendar/CALENDAR_SPRINT_KANBAN_GANTT_SYNC.md) | P1 | Views show different task counts for same date range; Google Calendar push produced no events; task completion in one view not reflected in others | Four views use different store selectors; no shared reactive projection; Google Calendar sync implemented but produced zero events on push | CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION — calendar push "implemented" but user reported no events created (May ~Apr 22) | Cross-view consistency check; Google Calendar showing pushed events; task complete in kanban → visible in gantt same session |
| Print / Signed PDF Routes | [PRINT_AND_SIGNED_PDF_ROUTE_DRIFT.md](./components/print/PRINT_AND_SIGNED_PDF_ROUTE_DRIFT.md) | P1 | Print action opens wrong content or blank dialog; signed PDF download resolves to incorrect file; no error shown | Route target drifted during refactor; print route not updated when components were renamed/moved; depends on broken artifact ID from eCIgn | CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION — print button visually present but actual print behavior never tested | Click Print after signing → confirm print dialog shows signed content; download link → confirm PDF contains signed form |
| Permissions / Trainer Leakage | [TRAINER_ONBOARDING_ADMIN_LEAKAGE.md](./components/permissions/TRAINER_ONBOARDING_ADMIN_LEAKAGE.md) | P1 | Trainer/Onboarding role users see full admin UI; DON Assistant can sign when role should be blocked from signing | `user.provision` in Trainer group gates admin UI; DON Assistant role enforcement not enforced in form signing flow | No targeted validation documented in any session | Login as trainer-role → confirm admin UI not visible; login as DON Assistant → confirm Sign button disabled/absent |
| Builder / Bin Git Hygiene | [BUILDER_BIN_GIT_HYGIENE.md](./components/builder_git/BUILDER_BIN_GIT_HYGIENE.md) | P2 | 80+ files in `Builder/` and `Bin-(thrash)/` appear in every `git status`/diff despite `.gitignore` entries | Files were committed before `.gitignore` entries added; `git rm --cached` never run; hard constraint blocks execution | Known unresolved — `.gitignore` entry confirmed present but ineffective | Owner approval for `git rm --cached`; `git ls-files Builder/` returns empty |
| Claude False Fix Reports | [CLAUDE_FALSE_FIX_REPORTS.md](./components/qa_uat/CLAUDE_FALSE_FIX_REPORTS.md) | Cross-cutting | Fix declared complete by AI agent; user opens browser → same symptom; cycle repeats across sessions | AI agent validates code changes and build pass only; no browser runtime step in closure loop | Active systemic risk — observed on auth (2+ times), eCIgn PDF chain, evidence reset, form persistence | Documented browser test result with URL, role, and action for every declared fix |

---

## File Index

| File | Description |
|------|-------------|
| [01_EXECUTIVE_SUMMARY.md](./01_EXECUTIVE_SUMMARY.md) | Executive brief: top 10 defects, top 10 suspect files, failure patterns, fix order |
| [components/auth/VERCEL_AUTH_FAILURE.md](./components/auth/VERCEL_AUTH_FAILURE.md) | Vercel build-time env var baked as `false`; `vercel.json` wildcard rewrite kills API routes |
| [components/ecign/ECIGN_SIGNED_ARTIFACT_FAILURE.md](./components/ecign/ECIGN_SIGNED_ARTIFACT_FAILURE.md) | Post-signing opens form HTML template not signed PDF; multi-signer PDF chain absent |
| [components/evidence/EVIDENCE_CENTER_METADATA_ONLY.md](./components/evidence/EVIDENCE_CENTER_METADATA_ONLY.md) | Artifact is in-memory object URL; metadata survives reload, content does not; reset broken |
| [components/ces/CES_TASK_IDENTITY_AND_Q2_FAILURES.md](./components/ces/CES_TASK_IDENTITY_AND_Q2_FAILURES.md) | 6 Playwright-documented defects: sprint board, calendar chips, form URL, form persistence, sign button, audit trail |
| [components/calendar/CALENDAR_SPRINT_KANBAN_GANTT_SYNC.md](./components/calendar/CALENDAR_SPRINT_KANBAN_GANTT_SYNC.md) | Views use different projections and drift; Google Calendar push produced zero events |
| [components/print/PRINT_AND_SIGNED_PDF_ROUTE_DRIFT.md](./components/print/PRINT_AND_SIGNED_PDF_ROUTE_DRIFT.md) | Print route target drifted during refactor; no runtime error surfaced |
| [components/permissions/TRAINER_ONBOARDING_ADMIN_LEAKAGE.md](./components/permissions/TRAINER_ONBOARDING_ADMIN_LEAKAGE.md) | `user.provision` in Trainer group grants admin UI; DON Assistant signing not blocked |
| [components/builder_git/BUILDER_BIN_GIT_HYGIENE.md](./components/builder_git/BUILDER_BIN_GIT_HYGIENE.md) | 80+ tracked files in `Builder/` and `Bin-(thrash)/` polluting every diff |
| [components/qa_uat/CLAUDE_FALSE_FIX_REPORTS.md](./components/qa_uat/CLAUDE_FALSE_FIX_REPORTS.md) | AI agent false closure pattern: build pass ≠ browser pass |

---

## How to Use This Document Set

1. Start with `01_EXECUTIVE_SUMMARY.md` for overall context and priority ranking.
2. Drill into any component file for full symptom history, root cause, and acceptance criteria.
3. Each component file is self-contained — pass individual files to Grok for targeted remediation.
4. Acceptance criteria sections define the minimum bar for declaring a component "fixed."

---

## Hard Constraints (Apply to All Components)

- **Never delete files** from `Builder/` or `Bin-(thrash)/` directories.
- **Never run `git rm` or `git rm --cached`** on any tracked file without explicit owner approval.
- **No secrets or passwords** appear in any file in this set.
- All fixes must be **browser-runtime validated**, not just build-pass validated.
- Do not edit `src/`, `server/`, `public/`, or `scripts/` as part of this forensic phase.
