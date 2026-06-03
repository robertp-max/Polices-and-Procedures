# Executive Summary — HomeHealth Compliance App: Forensic Failure Analysis

**Date**: 2026-05-14  
**Audience**: Engineering lead, Grok analyst, QA  
**Scope**: All recurring failures identified during Cursor AI-assisted development of the HomeHealth Policies & Procedures compliance application  
**Transcripts analyzed**: 86 parent chats, 168 total (including subagents), spanning approximately April–May 2026  
**globalStorage (state.vscdb)**: ~4.5 GB — not dumped per constraints; used only as size reference

---

## Overview

This document summarizes a pattern of recurring, unresolved failures across the HomeHealth compliance application. Development proceeded through multiple AI-assisted repair cycles (primarily using Claude via Cursor) in which fixes were declared complete based on build success alone — without browser runtime validation. The same failures reappeared in subsequent sessions, creating a compounding debt of unverified "closed" issues.

Nine distinct failure categories are documented in this set. They span authentication, document signing, evidence persistence, task identity, calendar sync, PDF routing, permissions, repository hygiene, and AI agent reliability.

---

## Top 10 Recurring Unresolved Defects

| # | Defect ID | Component | First Observed | Times Re-Reported | Status |
|---|-----------|-----------|---------------|-------------------|--------|
| 1 | VERCEL-AUTH-001 | Auth / Vercel | Apr 2026 | 2+ sessions | CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION |
| 2 | ECIGN-PDF-001 | eCIgn Signed Artifact | May 11, 2026 00:34 | 3+ messages same session | CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION |
| 3 | EVIDENCE-RESET-001 | Evidence Center | May 11, 2026 11:12 | 4 escalating messages | CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION |
| 4 | DEFECT-Q2-004 | CES Form Persistence | May 10–11, 2026 | Playwright-confirmed | OPEN |
| 5 | DEFECT-Q2-001 | CES Sprint Board | May 10–11, 2026 | Playwright-confirmed | OPEN |
| 6 | DEFECT-Q2-006 | Audit Trail Artifact Links | May 10–11, 2026 | Playwright-confirmed | OPEN |
| 7 | DEFECT-Q2-003 | Form URL / Instance Routing | May 10–11, 2026 | Playwright-confirmed | OPEN |
| 8 | CALENDAR-SYNC-001 | Google Calendar Push | Apr 22, 2026 | "no events created" user report | CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION |
| 9 | PRINT-ROUTE-001 | Print / Signed PDF Routes | May 2026 | Visual presence ≠ working print | UNVALIDATED |
| 10 | PERM-TRAINER-001 | Trainer Admin Leakage | May 2026 | No targeted validation ever | UNVALIDATED |

---

## Failure Categories at a Glance

| # | Component | Severity | Root Cause Summary |
|---|-----------|----------|--------------------|
| 1 | Auth / Vercel | P0 | `VITE_LOCAL_DEMO_AUTH_BYPASS` baked as `false` at build; `vercel.json` wildcard rewrite intercepts all `/api/*` with 405 |
| 2 | eCIgn Signed Artifact | P0 | Post-sign handlers render form HTML template, not stored signed PDF; multi-signer PDF chain not implemented |
| 3 | Evidence Center | P1 | In-memory `demoEvidenceRuntimeCache`; metadata persists to `localStorage`, artifact blob lost on reload; sandbox reset broken |
| 4 | CES / Task Identity | P1 | 6 Playwright-documented defects: sprint board, form URL, form persistence, sign button, audit trail, calendar chips |
| 5 | Calendar / Sprint / Kanban / Gantt | P1 | Four views use different projections; Google Calendar push produced zero events on first push |
| 6 | Print / Signed PDF Routes | P1 | Route target drifted during refactor; no error surfaced at runtime |
| 7 | Permissions / Trainer Leakage | P1 | `user.provision` in Trainer group gates admin UI; DON Assistant signing not blocked |
| 8 | Builder / Bin Git Hygiene | P2 | 80+ previously-committed files remain in git index despite `.gitignore` entries |
| 9 | Claude False Fix Reports | Cross-cutting | Build pass declared as fix; browser runtime test never performed or requested |

---

## Top 10 Files and Components Repeatedly Involved

| # | File / Component | Appears In |
|---|-----------------|------------|
| 1 | `src/auth/AuthProvider.tsx` | Auth, eCIgn demo bypass, all UAT |
| 2 | `src/policy/components/FormSignatureFlow.tsx` | eCIgn, Evidence, Print, CES |
| 3 | `regulatoryExecutionStore` (`reg-execution-v2`) | Evidence, CES, Calendar, Audit |
| 4 | `demoEvidenceRuntimeCache` | Evidence, eCIgn, Print |
| 5 | `src/policy/evidence/storageMode.ts` | Evidence, eCIgn artifact storage |
| 6 | `taskProjection` / `obligationSelectors` | CES, Calendar, Sprint, Kanban, Gantt |
| 7 | `taskOverridesByEventId` | CES task identity corruption |
| 8 | `vercel.json` | Auth 405 root cause; API route interception |
| 9 | `src/policy/security/identity/permissionCatalog.ts` / `userGroups.ts` | Permissions / Trainer leakage |
| 10 | `WorkflowExecutionPanel.tsx` | Form URL routing, form persistence, audit event writing |

---

## Critical Path

Two failures block any meaningful demo or compliance review:

**1. Auth Failure (Vercel)**

The application requires `VITE_LOCAL_DEMO_AUTH_BYPASS=true` present **at Vite build time**, not set in Vercel environment settings at runtime. Additionally, `vercel.json` contains a wildcard rewrite `"/(.*)" → "/index.html"` that intercepts every request including `POST /api/ia/index/rebuild`, causing HTTP 405. Evidence source: transcript `c2cb5aee-5cc3-45c8-8c81-93f291ebace1` — user reported "Rebuild button is failing in production with HTTP 405, Brad Internal Corpus: error, Brad Inference Engine: unreachable."

A **fresh Vercel build** (not `vercel redeploy`) is required, with `VITE_LOCAL_DEMO_AUTH_BYPASS=true` present in the Vercel project environment **before** the build runs.

**2. eCIgn Signed Artifact — Multi-Signer PDF Chain**

After a user completes a form signature flow, the "Download PDF," "Print," and "Open Artifact" actions render the live form HTML template rather than retrieving the stored signed PDF. Evidence source: transcript `cacb1d6f-47aa-4365-9097-1cbfcca36b6c` (May 11, 2026, 00:34 UTC-7) — user message: *"why is it so difficult for u to understand to use the pdf generated at the end of the ecign and use the pdf for the artifact."*

Follow-up user message (May 11, 2026, 15:15): *"u are missing the point! it is important that the pdf generated is the same pdf saved in the evidence for it to be defensible dont generate a new pdf."*

This is not a UX issue. It is a CMS defensibility risk: the signed artifact in Evidence Center must be the same PDF that was signed, not a newly rendered copy.

---

## Systemic Pattern: AI Agent False Fix Reports

Across all components, a recurring meta-failure was observed: the AI agent (Claude) reported fixes as complete after build success, without performing or requesting browser-level runtime validation.

**False closure cycle:**

1. Symptom reported by user
2. Agent locates plausible code path
3. Agent edits code, build passes
4. Agent declares fix complete
5. User opens browser → same symptom
6. Next session restarts from step 1

**Confirmed instances of CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION:**

- Auth bypass: set in Vercel dashboard, `vercel redeploy` run, no browser login test → same failure
- Evidence reset: agent reported reset implemented (May 11, 12:07) → user at 11:18: *"its still here!!!!!"* → at 11:21: *"u idiot both reset dont work!"* → at 13:26: reset still not clearing audit trail
- eCIgn PDF: agent reported signing flow "working" → user confirmed artifact was new render, not stored PDF
- Form persistence: Playwright test DEFECT-Q2-004 confirmed form state in-memory only, lost on refresh

---

## Evidence Persistence Architecture Risk

The `regulatoryExecutionStore` persists to `localStorage` under key `reg-execution-v2`. However, `demoEvidenceRuntimeCache` is **in-memory only** and is lost on hard refresh or tab close.

This creates a persistent "ghost record" pattern: metadata row visible in Evidence Center, artifact content unretrievable. This is the default behavior for all signed artifacts in the current architecture, not an edge case.

The sandbox reset function was implemented but did not clear evidence rows from `regulatoryExecutionStore`. This was observed and reported multiple times in the May 11, 2026 session (transcripts `3cf17f83` and `cacb1d6f`).

---

## Permissions Leakage

The `user.provision` permission was included in the Trainer/Onboarding user group for a narrow workflow purpose, but `user.provision` was wired in the feature catalog to gate access to the full admin UI. Any trainer-role user has implicit admin access.

Separately, the CES UAT (transcript `3cf17f83`, May 10–11) explicitly tested DON Assistant role constraints and found that the signing role enforcement was not functioning — DEFECT-Q2-005 confirmed the sign button was absent from the DON Assistant view, but this was a missing `data-testid`, not a confirmed role gate. The role gate for DON Assistant (must not be allowed to sign) has never been browser-validated.

---

## Repository Hygiene

`Builder/` and `Bin-(thrash)/` directories appear in `.gitignore` but contain files committed before the ignore rules were added. As of May 14, 2026, `git status` shows 80+ modified files in these directories in every commit diff. The `git rm --cached` remediation has not been run due to a hard constraint on destructive git operations without owner approval. This is a tracking-only issue and does not affect runtime.

---

## Recommended Priority Order (Surgical Fix Sequence)

1. **Auth** — nothing is testable without a working login; fix `vercel.json` wildcard rewrite and trigger fresh build with `VITE_LOCAL_DEMO_AUTH_BYPASS=true`
2. **eCIgn Signed Artifact** — implement deterministic filename standard, ensure post-sign handlers retrieve stored PDF, not re-render template; implement multi-signer PDF chain
3. **Evidence Center Persistence** — migrate artifact storage from in-memory to `localStorage` or IndexedDB; fix sandbox reset to clear all rows including metadata
4. **Permissions Leakage** — audit `permissionCatalog.ts` and `userGroups.ts`; replace admin gate from `user.provision` to dedicated `admin.panel` permission
5. **CES Q2 Task Identity** — fix `taskOverridesByEventId` canonical ID collision; fix form URL to include `form_instance_id`; fix `obligationSelectors` Q2 boundary; populate `targetKind`/`targetId` in audit entries
6. **Calendar / Sprint / Kanban / Gantt Sync** — unify all four views on single reactive `taskProjection`; fix Google Calendar push
7. **Print / PDF Route Drift** — audit print route registration; confirm route target points to current component
8. **Builder / Bin Git Hygiene** — requires owner approval before action; low runtime risk
9. **Claude False Fix Protocol** — process change: require browser test checklist before every declared closure

---

## Items That Must NOT Be Touched

- Files in `Builder/` directory — AI-generated working corpus, not runtime dependencies
- Files in `Bin-(thrash)/` directory — archived; must not be deleted or committed
- `git rm`, `git rm --cached`, `git add`, `git commit`, `git push` — not to be run in this forensic phase
- `src/`, `server/`, `public/`, `scripts/` — no edits during forensic phase

---

## Items Requiring Browser Proof Before Declaring Fixed

Every item in the priority list above requires browser runtime proof. Specifically:

| Component | Required Browser Evidence |
|-----------|--------------------------|
| Auth | Login as `robertp@careindeed.com` → lands on dashboard, no Cognito network errors |
| eCIgn | Sign a form → Download PDF → open file → confirm signed content, not blank template |
| Evidence | Sign → hard refresh → Evidence Center → click artifact → content loads |
| Evidence | Sandbox reset → all evidence rows cleared (0%) |
| CES Sprint | Q2 2026 tasks visible in sprint board without page refresh |
| CES Form | Fill form → refresh → fields retain values |
| CES Sign | DON role user → sign button present; DON Assistant role → sign button absent or disabled |
| CES Audit | Complete a form → audit trail → "View Artifact" link present and resolves |
| Calendar | Complete task in kanban → gantt reflects same status without refresh |
| Calendar | Push to Google Calendar → event appears in Google Calendar |
| Print | Print action → print dialog shows signed content, not blank or template |
| Permissions | Login as trainer → admin UI not visible |

---

## Validation Requirement (All Components)

**No fix may be declared complete without all of the following:**

- [ ] Build succeeds (TypeScript, Vite, no console errors at startup)
- [ ] Browser opened to deployed or local URL
- [ ] Specific user action performed that previously triggered the symptom
- [ ] Expected outcome observed in browser (not inferred from code reading)
- [ ] Result documented with URL, role used, and action taken

Any fix that lacks this checklist should be treated as **in-progress**, not resolved.
