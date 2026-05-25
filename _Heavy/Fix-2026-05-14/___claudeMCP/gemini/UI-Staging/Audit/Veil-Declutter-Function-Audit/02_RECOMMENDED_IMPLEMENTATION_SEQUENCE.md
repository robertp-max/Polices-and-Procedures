# Best Course of Action for Veil Implementation (CES Declutter)

**User Proposal**: "seed V3 fix error then switch"  
**Date**: 2026-05-20  
**Status**: Recommended sequence (refined from user's idea) while the 16-agent diagnostic swarm remains paused.

---

## Verdict: Your Idea Is Strong — Here's the Optimized Version

Your proposed route (**Seed V3 data → Fix errors/polish → Switch**) is **one of the safest and most effective** approaches for this codebase.

**Why it is good**:
- It front-loads the "rich functional content" (folders, real evidence, task details, signatures) so the veiled drawers don't look like empty glass boxes.
- It lets you validate the visual "calm PDF experience" early.
- It minimizes the chance of switching to veil + discovering the data layer is broken or missing folders.

**Where we can make it even better** (lower risk, faster feedback, easier rollback):

Use a **Phased + Gated** sequence instead of "seed everything then big-bang switch".

This is the route I recommend as the **best overall** for this project.

---

## Recommended Best Sequence (Phased + Gated)

### Phase 1: Seed + Isolated Prototype (Do this first — zero production risk)

**Goal**: Have real-shaped, folder-rich data + a working "what the veiled drawer will look like" preview you can click around in dev/staging without touching any live CES pages.

**Actions**:
1. Create `src/policy/ces/data/V3_CES_SeedData.ts` (or `src/policy/data/cesV3Seeds.ts`).
   - Pull the real shapes from `regulatoryExecutionStore`, `compliance-execution/types.ts`, `eventFolders`, task projection, etc.
   - Include proper nested folder trees (the missing piece the spec keeps mentioning).
   - 3-4 evidence folders + 1-2 full task details + 1 workflow unit + signature rosters.
2. Create a **throwaway prototype surface** (or use the existing ui-staging harness):
   - Either a new route `/veil-proto/ces-drawer` (protected behind a dev flag)
   - Or simply render the veiled versions of GlobalTaskDrawer / WorkflowDrawer / VeilModal in a hidden dev-only panel.
   - These prototypes use the V3 seeds + `glassVariant="v3-veil"` + full `v3-veil-glass-panel` treatment.
3. Iterate visually against `APP_Screenshots.pdf` until the folders + density + motion feel right.

**Deliverable**: You (and Claude) can open a drawer in the prototype and say "yes, this is the veiled replacement we want — folders, calm glass, rich content."

**Why do this before any switch?**
- You discover data shape mismatches and folder rendering bugs in a safe place.
- You get the "rich content" part working while the 16-agent audit is still paused.

### Phase 2: Fix + Harden the Veil Paths (Parallel with Phase 1)

While the prototype is being validated:

- Fix any bugs in the existing `glassVariant` branches (RightDrawer, BottomSheet, GlobalTaskDrawer partial V3, VeilModal).
- Add the reusable `<EvidenceFolderTree />` or `<TaskFolderTree />` component once (used by all veiled drawers).
- Ensure transitions, backdrop, no-scroll, 0.33 borders, teal accents all work cleanly inside the drawers when `isV3`.
- Add a clean `isV3` or `glassVariant` prop passthrough to TaskDetailRightPanel / EvidencePanel content areas.

**Error fixing happens here** — exactly what you said ("fix error").

### Phase 3: Gated Switch — One Surface at a Time (Smallest Blast Radius First)

Only after Phase 1 + 2 are solid and visually approved:

**Order of surfaces to flip (recommended)**:

1. **WorkflowDrawer + SprintExecutionBoard** (best first candidate)
   - Already uses a drawer (not a permanent split).
   - High visual impact on the dense board.
   - Lower risk because it's execution-unit detail, not the primary calendar/my-tasks rail.

2. **GlobalTaskDrawer** (the app-wide overlay)
   - Already mounted in CommandCenterLayout.
   - Affects many pages but is non-destructive (legacy pages still skip it).

3. **MasterCalendarPage** (the biggest density offender)
   - Replace the `ci-right-panel` + inline TaskDetail/SprintTask/WorkflowExecutionPanel with the new veiled drawers on desktop too.
   - Do compact/mobile first, then desktop.

4. **MyTasksPmPage** (hard w-[420px] split)

5. **Remaining CES pages** (EventWorkspace, WorkflowExecutionPanel tabs, etc.) + removal of legacy files.

**For each gated switch**:
- Add the `glassVariant="v3-veil"` + seed data only on that path.
- Keep the old legacy code path live for the other surfaces.
- Test thoroughly, screenshot, compare to PDF.
- Only after it's stable, delete the legacy code for that surface.

**This is the key improvement over a pure "seed then big switch"** — you get incremental wins, easy rollbacks, and real user feedback after each gate.

### Phase 4: Final Cleanup + 16-Agent Diagnostic (Optional but Powerful)

Once the major surfaces are on the veiled path:
- Run the 16-agent Veil Function Audit on the new state (it will now report much higher "functional + veiled" scores).
- Or use the audit findings as the final quality gate before declaring the 70% declutter goal met.

---

## Comparison of Approaches

| Approach                        | Risk | Speed of Visible Wins | Feedback Quality | Rollback Ease | Recommendation |
|--------------------------------|------|-----------------------|------------------|---------------|----------------|
| Your idea: Seed → Fix → Big Switch | Medium | Medium | Good | Hard | Solid, but can be improved |
| **Recommended: Seed+Proto → Fix → Gated Switch (1 surface at a time)** | Low | High (early prototype) | Excellent | Very Easy | **Best route** |
| Pure "switch the glassVariant everywhere first, then fix data" | High | Fast but ugly | Poor (you'll hate the empty drawers) | Medium | Avoid |
| Run full 16-agent audit first, then implement | Low | Slow | Excellent (but delayed) | N/A | Good if you want the diagnostic report before any code |

---

## My Final Recommendation

**Do this exact sequence** (it is your idea + the safety refinements that fit this codebase):

1. **Phase 1 right now** (while still "save for now" on the 16 agents): Seed the data + build an isolated prototype so you can see and feel the veiled drawers with real folders and rich content.
2. Fix/harden the veil paths using what you learn from the prototype.
3. Gated switch, starting with WorkflowDrawer + Board (lowest risk, high impact).
4. Expand the gates to calendar → my-tasks → cleanup.
5. (Optional) Trigger the 16-agent swarm on the partially or fully switched state for the final quality report.

This route gives you:
- The fastest path to a convincing "this is what the PDF experience actually feels like in the real app".
- The lowest risk of breaking compliance-critical CES flows.
- Natural points to pause, review with Claude, or adjust course.

---

**Next Micro-Step Available**

If you like this sequence, the single best thing to do today/tomorrow is:

**"Generate the first-draft V3_CES_SeedData.ts with folders"**

I can create it (with 3 evidence folders + task + workflow unit using the real types) and drop it in the Veil- subdir for your review. Then we build the prototype viewer on top of it.

Just say the word (or "go ahead and seed the data file") and we'll start Phase 1 immediately.

This is the cleanest, lowest-risk, highest-confidence path to finally making the decluttering "veiled" instead of "actual".