# Prompt for Claude – Full UI/UX Reconstruction Fix

You are being asked to fix a major UI/UX reconstruction program that was previously declared "complete" in documentation but failed in reality.

## Critical Context – What Went Wrong Last Time

Previous execution (led by you on Phases 2-3-4, with Grok on Phase 1) produced the following pattern:

- Excellent governance documents were written (`CANONICAL_UI_SYSTEM_SPEC.md`, Master Plan, reconstruction plans, checklists, etc.).
- Checklists were updated with optimistic claims ("100% canonical primitives", "Pass 2 Complete", "responsive parity", "Phase 3/4 complete").
- In actual code, very little of the locked contract was delivered:
  - The Brand/Mode system was never collapsed.
  - The proper Care Indeed Navy Dark glassmorphic experience was never built.
  - Legacy `ci-premium-*` wave classes were never removed.
  - Canonical primitives saw almost zero adoption on core surfaces.
  - Many surfaces still look nothing like the Top Picks mocks.

The root cause was that Phase 1 foundations were never actually delivered in code, yet later phases were allowed to proceed. This time, we are resetting with strict sequencing.

---

## Your Mandate

You must fix the entire system. However, you are **strictly forbidden** from repeating the previous mistake.

**Rule #1 (Non-Negotiable):**  
You must complete the Brand & Dark Mode remediation to production quality **before** touching anything else (no surface work, no primitive adoption, no typography fixes, nothing).

**Rule #2:**  
Do not update any checklist or claim any work is "complete" until the change has been visually validated against the Top Picks mocks (both Light and the new Navy Dark).

---

## Required Reading (in this exact order)

1. `docs/UIUX/BRAND_AND_DARK_MODE_REMEDIATION_PLAN.md` ← Start here. This is your Phase 1 remediation. Treat it as the new hard gate.

2. `docs/UIUX/MASTER_FIX_EXECUTION_PLAN.md` ← This gives you the overall strict order of the entire fix program.

3. `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md` (especially Sections 1, 2, 4, 6, 7, and 16)

4. `docs/UIUX/UIUX_RECONSTRUCTION_MASTER_PLAN.md`

5. The Top Picks mocks in `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/mocks/Top-Picks/` (particularly the dark ones)

---

## Execution Instructions

### Phase 1 – Brand & Dark Mode Remediation (Do This First)

Follow `BRAND_AND_DARK_MODE_REMEDIATION_PLAN.md` exactly.

Your primary goal is to deliver a clean, beautiful **Care Indeed Navy Dark** glassmorphic experience that actually matches the dark glass in the Top Picks mocks.

Key technical requirements:
- Collapse the dual system (`useShellStore.theme` + `useCiModeStore`) into one clean system.
- Fix `ShellFrame.tsx` so the backdrop respects the Care Indeed brand.
- Make the Navy Dark the primary (and only) dark experience for Care Indeed in production.
- Remove easy access to the old CI-ION maroon/gold dark in production flows.
- Ensure the new Navy Dark has proper rich glassmorphism (deep navy backdrop + constrained single glass canvas + visible 4-sided breathing room).

Do not move on until this is production-ready and visually validated against the mocks.

### After Phase 1 Passes

Follow the order in `MASTER_FIX_EXECUTION_PLAN.md`:
- Legacy wave class purge
- Primitive adoption (starting with Dashboard as the true reference)
- Typography, spacing, motion, responsive
- Parallel systems cleanup (CES, print, etc.)
- Final validation

---

## What "Success" Looks Like

When a designer or stakeholder opens the app in Care Indeed Navy Dark, they should immediately think:

"This looks like the dark versions in the Top Picks mocks."

Not "it's better than before" or "the old CI-ION dark is still nicer."

The product should feel like one coherent design system, not multiple competing aesthetics.

---

## Final Warning

Do not optimize for updating documents or checklists.  
Optimize for making the live product match the locked vision in the mocks and canonical spec.

Previous attempts failed because we celebrated documentation progress instead of actual visual and architectural delivery.

This time, we are fixing it for real.

Start with the Brand & Dark Mode Remediation Plan. Report progress against its exit criteria.

Good luck. This is important.