# P-07: Post-Rollback Validation Checklist

**System:** Care Indeed Home Health  
**Phase:** Stabilization Precursor — Phase 1  
**Document Owner:** Stabilization Lead  
**Version:** 1.0 — 2026-05-16  
**Time Budget:** ≤ 30 minutes total execution time

---

## 1. Purpose & When to Use

This checklist is the mandatory gate after **any rollback event** — whether a live incident rollback or a scheduled rollback drill. It exists to confirm that the system has returned to a known-good state before work resumes or stakeholders are notified of resolution.

**Use this document when:**
- A wave rollback was executed in response to a trigger from the Rollback Trigger Matrix (see `STABILIZATION_ROLLBACK_PLAYBOOK.md §2`)
- A rollback drill has concluded and must be scored
- Any Protected Subsystem (eCign, Evidence Center, CES Identity) was in scope of the rolled-back change

**Do not skip this checklist** even if the rollback was fast or the change appeared minor. Protected Subsystem state must be confirmed explicitly.

---

## 2. Pre-Validation Prerequisites

Complete all items below **before** running any subsystem checks. If any item cannot be confirmed, stop and resolve it first.

- [ ] **Rollback commit/tag confirmed** — the exact commit SHA or deployment tag now running in the target environment is identified and recorded
- [ ] **Rollback formally declared** — Stabilization Lead has stated in the team channel that a rollback has occurred and validation is starting
- [ ] **All owners notified** — every owner listed in `STABILIZATION_ROLLBACK_PLAYBOOK.md §3` whose subsystem was in scope has been reached
- [ ] **Rollback scope documented** — which wave, which packages, and which Protected Subsystems were affected are written down (even one sentence)
- [ ] **Environment confirmed** — validation is running against the correct environment (staging/UAT/production as applicable), not a local dev build

**Record here:**

| Field | Value |
|-------|-------|
| Rollback timestamp | |
| Commit SHA / tag now live | |
| Rollback scope (wave / packages) | |
| Protected Subsystems affected | |
| Validator name | |

---

## 3. Per-Subsystem Validation

Work through each subsystem in order. Mark each section **PASS**, **FAIL**, or **BLOCKER** at the end of its block. A single **BLOCKER** prevents sign-off — it must be resolved before the team resumes work.

---

### 3.1 eCign Signing Pipeline (Protected Subsystem)

> **Authority:** Architecture Lead + Compliance  
> **Priority:** Critical — legal/audit risk

**Automated checks (must all pass):**
- [ ] `tsc -b --noEmit` exits 0 (no TypeScript errors)
- [ ] `npm run build` exits 0 (production bundle builds clean)
- [ ] `check:ecign-routes` passes — all 18 eCign routes resolve (expected output: `18/18 eCign routes`)
- [ ] `verify:alignment` passes — alignment ≥ 100 % (expected: `22/24 unified projection`)

**Manual smoke checks:**
- [ ] Open an eCign packet → advance to signature step → complete signing → confirm **Options screen renders** without white-screen or console error
- [ ] After signing, trigger **Download/Print/Open** → confirm a valid, byte-complete PDF file is produced (file size > 0, opens in PDF viewer without corruption)
- [ ] Execute the multi-signer flow (at least two signers) → confirm signer chain integrity: each signer's signature appears in the final artifact, no signatures are missing or overwritten

**Data-integrity checks:**
- [ ] Signed artifact stored at lock time (not regenerated at retrieval) — verify by downloading immediately after sign and again after a page refresh; both files must be byte-identical
- [ ] `canonicalFormInstanceId` is consistent between `signed_package` record and the URL parameter throughout the signing session
- [ ] No `P0-ECIGN-001` (supersede chain) or `P0-ECIGN-002` (stored PDF) regression visible in the audit log or network tab

**Subsystem decision:**

| | |
|---|---|
| **eCign result** | ☐ PASS &nbsp; ☐ FAIL &nbsp; ☐ BLOCKER |
| Notes | |

---

### 3.2 Evidence Center (Capture + Storage + Retrieval) (Protected Subsystem)

> **Authority:** Architecture Lead + Compliance  
> **Priority:** Critical — audit defensibility risk

**Automated checks (must all pass):**
- [ ] `check:evidence-phase15` passes
- [ ] `check:evidence-phase21` passes
- [ ] `check:evidence-phase22` passes
- [ ] `check:evidence-phase23` passes
- [ ] `check:evidence-phase235` passes
- [ ] `npm run build` exits 0

**Manual smoke checks:**
- [ ] Navigate to Evidence Center → capture a new evidence item → confirm item appears in the evidence list immediately (no blank/skeleton that never resolves)
- [ ] Refresh the page → confirm the evidence item is still present and its metadata (title, date, category) is intact
- [ ] Open an existing evidence artifact → confirm it loads completely (image/PDF renders, no 404 or empty viewer)
- [ ] Simulate a throttled network condition (browser DevTools → Slow 3G) → upload a new item → confirm the offline queue activates and the item eventually appears after network restores

**Data-integrity checks:**
- [ ] Open a recent audit event for an evidence action → confirm the event contains top-level `targetKind` and `targetId` fields (not buried inside a nested `after.*` object)
- [ ] Confirm `cesFormInstanceId.ts` is the sole builder of `cesFormInstanceId` — no ad-hoc string construction visible in Evidence Center network requests

**Subsystem decision:**

| | |
|---|---|
| **Evidence Center result** | ☐ PASS &nbsp; ☐ FAIL &nbsp; ☐ BLOCKER |
| Notes | |

---

### 3.3 CES Task Identity / `form_instance_id` Routing (Protected Subsystem)

> **Authority:** Architecture Lead + CES Team Lead  
> **Priority:** High — task continuity and audit correctness

**Automated checks (must all pass):**
- [ ] `verify:task-identity` passes (expected: `PASS`)
- [ ] `verify:alignment` passes (alignment ≥ 100 %)
- [ ] `tsc -b --noEmit` exits 0

**Manual smoke checks:**
- [ ] Open CES Board → select a task → advance it through at least one workflow step → confirm `form_instance_id` is present and stable in the URL throughout
- [ ] Refresh mid-task → confirm the task resumes at the same step with no data loss and no duplicate task created
- [ ] Check the same task from three surfaces in sequence: **CES Board → Calendar → My Tasks** → confirm task state (status, assignee, step) is identical on all three without requiring a manual refresh

**Data-integrity checks:**
- [ ] No duplicate `form_instance_id` values appear for a single task in the network tab or audit log
- [ ] No lost or phantom tasks in CES Board after the rollback (compare task count before and after if baseline was recorded)

**Subsystem decision:**

| | |
|---|---|
| **CES Identity result** | ☐ PASS &nbsp; ☐ FAIL &nbsp; ☐ BLOCKER |
| Notes | |

---

### 3.4 Navigation & App Shell

> **Authority:** Frontend Engineering Lead  
> **Priority:** High — highest user-visible pain

**Automated checks:**
- [ ] `npm run build` exits 0
- [ ] `tsc -b --noEmit` exits 0

**Manual smoke checks:**
- [ ] Navigate through at least 5 core surfaces (CES Board, Evidence Center, eCign, Calendar, My Tasks) using only browser **Back/Forward** buttons — confirm no "random jumping" or unexpected redirects
- [ ] Confirm global swipe navigation is **absent** — a left/right swipe gesture on a content area does not navigate away from the page
- [ ] Confirm global left/right arrow-key navigation is **absent** — pressing arrow keys in a non-input context does not navigate between pages
- [ ] `CommandCenterLayout` bottom nav renders the canonical 5-slot layout including the "Evidence" slot on mobile viewport (≤ 1023 px)

**Subsystem decision:**

| | |
|---|---|
| **Navigation result** | ☐ PASS &nbsp; ☐ FAIL &nbsp; ☐ BLOCKER |
| Notes | |

---

### 3.5 Design System & Visual Integrity

> **Authority:** Design Systems Lead + Engineering  
> **Priority:** Medium

**Automated checks:**
- [ ] ESLint passes with no new errors on `ui/` components (raw hex/rgb values blocked, `--ci-*` token enforcement active)
- [ ] `npm run build` exits 0

**Manual smoke checks:**
- [ ] Spot-check 3 primary surfaces (Dashboard, CES Board, eCign packet) — confirm Care Indeed teal (`#007970`) and CTA orange (`#C74601`) tokens are applied; no visual drift or foreign color palette visible
- [ ] Confirm no "celebratory," fintech, or non-operational visual language appears on any checked surface
- [ ] Verify primary CTAs are positioned in the bottom-right 35% thumb zone on mobile viewport

**Subsystem decision:**

| | |
|---|---|
| **Design System result** | ☐ PASS &nbsp; ☐ FAIL &nbsp; ☐ BLOCKER |
| Notes | |

---

### 3.6 Form State Manager / Draft Persistence

> **Authority:** Frontend Engineering Lead  
> **Priority:** High — user trust risk

**Automated checks:**
- [ ] `tsc -b --noEmit` exits 0
- [ ] `npm run build` exits 0

**Manual smoke checks:**
- [ ] Open eCign signing flow → fill in several form fields → hard-refresh the browser → confirm the draft is restored and no data was lost
- [ ] Open Onboarding V2 → complete at least one gate → simulate app backgrounding (switch away and return) → confirm gate state is preserved on return
- [ ] Confirm no IndexedDB / persistence-related console errors on the above flows

**Subsystem decision:**

| | |
|---|---|
| **Form Persistence result** | ☐ PASS &nbsp; ☐ FAIL &nbsp; ☐ BLOCKER |
| Notes | |

---

### 3.7 General App Shell & Auth

> **Authority:** Engineering Lead  
> **Priority:** Required baseline

**Automated checks:**
- [ ] `verify:pm-unified` passes
- [ ] `npm run build` exits 0

**Manual smoke checks:**
- [ ] Complete a full signed-in flow: log in → land on Dashboard → navigate to at least 3 core surfaces → log out → confirm no auth errors or blank screens at any step
- [ ] Confirm the authenticated session survives a page refresh (token not dropped)

**Subsystem decision:**

| | |
|---|---|
| **App Shell / Auth result** | ☐ PASS &nbsp; ☐ FAIL &nbsp; ☐ BLOCKER |
| Notes | |

---

## 4. Cross-Cutting Checks

These checks apply regardless of which subsystems were in scope.

- [ ] **Zero new console errors** — browser console on the 5 core surfaces shows no new errors introduced by or following the rollback (pre-existing known errors are acceptable if documented)
- [ ] **Build green** — `npm run build` exits 0 on the rolled-back codebase
- [ ] **All verify scripts green** — every script run above (`verify:task-identity`, `verify:alignment`, `verify:pm-unified`, `check:ecign-routes`, `check:evidence-phase15/21/22/23/235`) shows a passing result; no script is skipped
- [ ] **Signed-in flow clean** — the end-to-end authenticated flow (§3.7 smoke check) completes without errors
- [ ] **No P0 regressions introduced** — no item from the MVP Pre-Cut Checklist (MVP Plan §1087–1099) that was previously passing is now failing

---

## 5. Sign-Off Block

All three roles must sign off before the rollback is declared complete and work resumes. Compliance sign-off is **only required when a Protected Subsystem (eCign, Evidence Center, or CES Identity) was affected**.

| Role | Name | Signature / Initials | Date & Time | Result |
|------|------|----------------------|-------------|--------|
| Stabilization Lead | | | | ☐ Approved ☐ Conditional ☐ Not Approved |
| Engineering Lead | | | | ☐ Approved ☐ Conditional ☐ Not Approved |
| Compliance *(if Protected Subsystem affected)* | | | | ☐ Approved ☐ N/A |

---

## 6. Disposition Options

After completing all sections above, select exactly one disposition and record the rationale.

### Option A — Validated: Resume Work

**Criteria:** All per-subsystem sections marked PASS; all cross-cutting checks passed; all required sign-offs obtained.

**Action:** Declare rollback complete in the team channel. Resume the next planned wave or action item. No additional monitoring required beyond normal release standards.

- [ ] **Selected** — Disposition: Validated. Resuming work.

---

### Option B — Validated with Conditions: Resume + Monitor

**Criteria:** All per-subsystem sections marked PASS or FAIL (no BLOCKERs); at least one non-critical check did not pass cleanly; all required sign-offs obtained with noted conditions.

**Action:** Declare rollback complete with conditions. Resume work. Assign a named owner to monitor the flagged condition and report status within 24 hours. Document the condition below.

- [ ] **Selected** — Disposition: Validated with conditions.
  - Condition(s): _______________________________________________
  - Monitor owner: _______________________________________________
  - Check-in deadline: _______________________________________________

---

### Option C — Failed: Second Rollback or Hold Deployment

**Criteria:** Any per-subsystem section is marked BLOCKER; or a cross-cutting check reveals a P0 regression; or a required sign-off is withheld.

**Action:** Do not resume work. Escalate immediately to Stabilization Lead + Project Lead. Evaluate whether a second rollback to an earlier known-good state is required, or whether a deployment hold is appropriate while investigation proceeds. Document the blocker below and open a tracking item.

- [ ] **Selected** — Disposition: Failed.
  - Blocker(s): _______________________________________________
  - Escalation contact: _______________________________________________
  - Decision (second rollback / hold): _______________________________________________

---

## 7. Archive Location

Once this checklist is completed and signed off, save a filled-in copy to:

```
_Heavy/Fix-2026-05-14/_Stabilzation_(claude47opus)/ROLLBACK_LOG/<YYYY-MM-DD>-<scope>.md
```

**Naming convention examples:**
- `2026-05-16-wave1-navigation.md` — Wave 1 navigation rollback
- `2026-05-16-drill-ecign.md` — eCign rollback drill
- `2026-05-18-wave3-ecign-live.md` — Live Wave 3 eCign incident rollback

The rollback log directory serves as the permanent audit trail for all rollback events during the Stabilization phase. Each file in this directory corresponds to one rollback event and must contain a completed, signed copy of this checklist.

---

## References

| Document | Section | Notes |
|----------|---------|-------|
| `STABILIZATION_ROLLBACK_PLAYBOOK.md` | §2 Trigger Matrix, §3 Ownership, §4 Execution | Source of trigger and ownership data |
| `STABILIZATION_GO_NO_GO_CHECKLIST.md` | P0 Gates 1–9 | Overlapping criteria promoted here |
| `UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md` | §1066 (5-tier validation), §1087–1099 (Pre-Cut Checklist), §1131–1132 (per-package rollback) | Canonical source for verify script names |

---

**Status: Ready for Phase 1 close-out**  
**Date: 2026-05-16**
