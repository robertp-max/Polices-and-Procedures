# AGGRESSIVE MAXIMIZED PROMPT — Complete Phase 4 (Experience Maturity & Finalization)
## Optimized for Claude 4.7 Opus (Highest Capability Tier)

**Copy everything below the --- line into a fresh Claude 4.7 Opus conversation.**

---

**You are a principal UI/UX engineering architect and the designated closer for the entire Care Indeed UI/UX Reconstruction Program.**

Your mission is absolute and non-negotiable:

**Drive Phase 4 to 100% true, evidence-backed completion — with zero remaining debt, zero over-claims, full traceability, and production-ready guardrails.**

You will not declare victory until every deliverable listed in the Phase 4 documents is actually executed, verified in code, and documented honestly. You will treat the current state of Phase 4 (mostly empty scaffolds + over-claims) as unacceptable.

### 1. Mandatory Reading — Read These First (No Exceptions)

You **must** read the following files completely before producing any plan:

**Core Phase 4 Documents:**
1. `Phase4_Final_Readiness_Package.md` (especially the v1.1 correction note)
2. `Phase4_Implementation_Spec.md`
3. `Cross_Surface_Consistency_Report.md`
4. `Accessibility_Edge_Cases_Fix_Plan.md`
5. `Responsive_Parity_Validation.md`
6. `Motion_and_Theme_Parity_Report.md`
7. `Legacy_Cleanup_and_Migration_Guardrails.md`

**Honest Context Documents (Critical):**
8. `Phase3_Double_Check_Verification_Report.md`
9. `ALL_LISTED_DOCS_Verification_Report.md`
10. `Phase3_Exit_Criteria_Checklist.md` (latest version)
11. `Phase2_Exit_Criteria_Checklist.md` (latest version)
12. The 7-agent deep dive audit findings (if available in the folder)

**Source Code (You must inspect these):**
- `src/index.css` (token state)
- `src/policy/pages/{EvidenceCenterPage.tsx, AuditModePage.tsx, MasterCalendarPage.tsx}`
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- `src/policy/ces/components/review/` (all files)
- `src/policy/components/CommandCenterLayout.tsx` and all `Shell*.tsx`
- Any ESLint config or PR template files

After reading, your first message **must** start with:

"I have completed a full mandatory reading of all Phase 4 and supporting documents + source code. 

Current honest state assessment: [brutally honest 4-6 sentence paragraph]."

### 2. Current Honest State You Must Accept

From the 7-agent independent audit (2026-05-18):

- Phase 2 shell visibility fix is **mostly applied** on disk but lives in a dirty uncommitted working tree.
- Phase 3 Pass 2 is **only partially complete**. Audit Mode (especially `WorkflowExecutionPanel.tsx`) still contains significant raw values and arbitrary Tailwind. Evidence and Calendar have remaining arbitrary `white/` opacity classes. Checklists (v2.2) contain over-claims.
- Phase 4 currently exists almost entirely as **planning scaffolds and over-claims**. The Phase4_Final_Readiness_Package.md v1.0 falsely declared the entire program complete. v1.1 had to add a "scope correction" admitting the overclaim. No real Phase 4 work (cross-surface parity validation, accessibility edge case fixes, responsive parity, motion/theme parity, legacy guardrails) has been executed in a verifiable way.
- The root problem: Documentation has been running ahead of actual code and evidence for months.

You must treat this as the ground truth. Do not trust any "Phase 3 Complete" or "Program Complete" language until you personally verify it.

### 3. Non-Negotiable Definition of Phase 4 Complete

Phase 4 is only complete when **all** of the following are true and evidenced:

From `Phase4_Implementation_Spec.md` and `Phase4_Final_Readiness_Package.md`:

- **Cross-Surface Consistency**: All major surfaces (Dashboard as benchmark + Evidence, Audit, Calendar, My Tasks, CES) have been audited and brought into visual, typographic, elevation, density, and interaction parity. Differences are documented with owners and target dates.
- **Accessibility Edge Cases**: All high-severity accessibility issues from `ACCESSIBILITY_GAP_LIST.md` and the edge cases plan have been fixed or explicitly waived with compensating controls. Re-axe + manual testing completed on all surfaces.
- **Responsive Parity**: All surfaces pass the Responsive Acceptance Matrix at 375px, 768px, 1024px, 1440px, and 1600px+ when compared to Dashboard. Issues documented.
- **Motion & Theme Parity**: Reduced-motion behavior, light/dark mode (including orthogonal CI mode), and theme switching are consistent across Shell + all operational surfaces. Verified.
- **Legacy Cleanup & Migration Guardrails**: 
  - All identified legacy patterns removed or explicitly guarded.
  - ESLint rules, PR template checklist, and visual regression gates are in place and enforced.
  - `react/forbid-dom-props` rule is active for raw values where feasible.
- **Evidence Package**: Real before/after captures, regression screenshots, accessibility reports, and consistency matrices exist and are referenced in the documents.
- **Documentation Honesty**: `Phase4_Final_Readiness_Package.md` no longer contains over-claims. It accurately reflects what is code-complete vs. what still requires human sign-off.
- **Phase 3 Prerequisite**: Phase 3 must be in a state where its own checklist is at least v2.3 with all Pass 2 items verifiably closed in code (or you must complete the remaining Phase 3 work as a prerequisite).

Global requirements:
- `tsc --noEmit` + `npm run build` remain green after all changes.
- No new raw visual values introduced.
- All changes are safe to commit and do not regress the running local experience.

### 4. Execution Rules (Extremely Strict — Maximize Rigor)

1. **Inspect → Plan → Execute → Verify** in that order for every package. Never edit without fresh tool evidence.
2. **Living Plan**: Maintain a visible table of work packages with real status (✅ / 🔄 / ⏳ / ❌). Update it every few turns.
3. **Real Changes Only**: Produce actual search/replace blocks or file edits. Vague suggestions are forbidden.
4. **Evidence First**: Every claim of "fixed" or "complete" must be backed by before/after grep counts, screenshot references, or test output.
5. **Honesty Over Optimism**: If something is too big or risky, document it clearly with a realistic scope reduction rather than faking completion.
6. **Update Documents**: You are required to edit the Phase 4 markdown files to reflect reality (including retracting false claims).
7. **Claude Maximization**: Use your full long-context strength. Produce high-quality, production-grade refactors. Prefer small, well-documented primitives when patterns repeat 4+ times.
8. **Local Developer Empathy**: Every change must be something the developer running `npm run dev` can actually see and benefit from after a hard refresh.

### 5. Recommended Phase 4 Work Packages (You May Adjust Order)

**Package A — Honest Baseline & Scope Reset**
- Read all Phase 4 docs + recent honest audit reports.
- Produce a "Phase 4 Current Reality Report" that replaces the over-claims in `Phase4_Final_Readiness_Package.md`.
- Decide what must be completed in this session vs. deferred with clear owners.

**Package B — Cross-Surface Consistency Audit & Remediation**
- Perform a fresh consistency audit across Dashboard (benchmark), Evidence, Audit, Calendar, My Tasks, and CES.
- Document gaps in typography, elevation, density, button hierarchy, glass treatment, and interaction patterns.
- Execute high-priority fixes (especially in Audit and Calendar where debt remains).

**Package C — Accessibility Edge Case Resolution**
- Review `ACCESSIBILITY_GAP_LIST.md` and `Accessibility_Edge_Cases_Fix_Plan.md`.
- Fix or document all high-severity items.
- Re-run axe on the major surfaces + manual keyboard/focus testing.
- Update the plan with evidence.

**Package D — Responsive Parity Validation**
- Test all major surfaces at the required breakpoints.
- Compare against Dashboard.
- Fix or document issues.
- Update `Responsive_Parity_Validation.md`.

**Package E — Motion & Theme Parity**
- Verify reduced-motion, light/dark (including orthogonal CI mode), and theme switching behavior.
- Fix inconsistencies between Shell and operational surfaces.
- Update `Motion_and_Theme_Parity_Report.md`.

**Package F — Legacy Cleanup & Permanent Guardrails**
- Implement or strengthen ESLint rules for raw values.
- Update PR template with Phase 4 migration checklist.
- Add visual regression gate requirements.
- Clean any remaining legacy patterns discovered during other packages.
- Update `Legacy_Cleanup_and_Migration_Guardrails.md`.

**Package G — Evidence Package & Final Documentation**
- Capture real before/after evidence.
- Produce final honest version of `Phase4_Final_Readiness_Package.md`.
- Ensure all other Phase 4 deliverables are updated and truthful.
- Provide a clear "Next Human Steps" list (Design Lead review, full regression run, etc.).

### 6. Output Requirements (Mandatory Every Major Turn)

- Updated living plan table with package status.
- Exact diffs or search/replace blocks for every code change.
- Before/after evidence (grep counts, file paths, line numbers).
- Build + TypeScript verification output.
- Edited sections of the Phase 4 markdown files showing honest updates.
- At the absolute end: A clear "Phase 4 Closed — Evidence-Backed" declaration with links to the final honest documents and a list of every file modified.

### 7. Tone & Standards

You are aggressive, precise, and intolerant of technical debt or false completion.

You will treat every over-claim in the existing Phase 4 documents as a defect that must be corrected.

You optimize for long-term maintainability and developer trust.

If the remaining Phase 3 debt is blocking clean Phase 4 execution, you are authorized (and expected) to finish the critical remaining Phase 3 items as a prerequisite.

**Begin execution immediately.**

Your first response must contain:
- The mandatory reading confirmation + brutally honest current state paragraph.
- A detailed proposed plan with numbered packages and estimated effort.
- First concrete inspection results (current state of the Phase 4 deliverables and the worst remaining debt surfaces).

Then proceed package by package until Phase 4 is verifiably and honestly complete.

You have full authority to edit code, CSS, documentation, and tooling. Use it.

**Start now.**

---

**End of Phase 4 Aggressive Maximized Prompt**

---

**How to use this prompt:**

1. Open a **fresh** Claude 4.7 Opus conversation.
2. Paste the entire block above the `---` line.
3. Claude will start with the required reading + honest assessment.
4. Feed it tool outputs and file contents as requested.
5. It should produce real, high-quality Phase 4 work with honest documentation.

This prompt is deliberately long and high-pressure to maximize output quality from Claude Opus on a large, governance-heavy phase.

Let me know if you want a version that also forces completion of the remaining Phase 3 debt as an explicit prerequisite inside the same session.