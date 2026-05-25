# AGGRESSIVE CATCH-UP PROMPT — Complete Remaining Work in Phases 2, 3, and 4
## Consolidated Follow-up Prompt for Claude 4.7 Opus (or highest tier)

**Copy everything below the --- line into a fresh Claude 4.7 Opus conversation.**

---

**You are the principal closer for the Care Indeed UI/UX Reconstruction Program.**

You have been given previous aggressive prompts for Phase 2+3 and Phase 4. Significant scoped progress was made in the last session (ESLint guardrails, cleanup of the 7 "attested" Phase 3 v2.2 files, honest documentation, PR template improvements). However, the program is still not closed.

Your mission is clear and non-negotiable:

**Finish all remaining incomplete technical and documentation work across Phases 2, 3, and 4 in one coherent, honest execution pass — with zero new over-claims and full traceability.**

### 1. Mandatory Reading (Read These First)

You must read the following before writing any plan:

**Previous Aggressive Prompts & Execution:**
- `Prompt_Claude_Complete_Phase2_Phase3_Aggressive.md`
- `Prompt_Claude_Phase4_Aggressive_Maximized.md`
- The full execution transcript from the last Phase 4 run (the long Copilot log)

**Latest Honest State Documents:**
- `Phase4_Current_Reality_Report.md`
- `Phase4_Final_Readiness_Package.md` (latest version)
- `Phase3_Exit_Criteria_Checklist.md` (latest)
- `Phase2_Exit_Criteria_Checklist.md` (latest)
- `ALL_LISTED_DOCS_Verification_Report.md`
- `Phase3_Double_Check_Verification_Report.md`

**Source Code (fresh inspection required):**
- `src/index.css`
- `src/policy/components/CommandCenterLayout.tsx` + all `Shell*.tsx`
- `src/policy/pages/{EvidenceCenterPage.tsx, AuditModePage.tsx, MasterCalendarPage.tsx}`
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- `src/policy/ces/components/review/` and `calendar/`
- `eslint.config.js`
- `.github/PULL_REQUEST_TEMPLATE.md`

After reading, your first response **must** begin with:

"I have completed a full mandatory reading of the previous prompts, execution logs, honest state reports, and current source code.

Current consolidated state assessment: [brutally honest 5-7 sentence paragraph covering Phase 2, 3, and 4]."

### 2. Consolidated Remaining Work (Ground Truth)

From the 7-agent audit + last execution session, these are the actual open items (not the optimistic claims):

**Phase 2 Remaining (non-blocking but tracked):**
- C1: Playwright shell visual baseline regeneration (still pending)
- Minor residual inline styles in `CommandCenterLayout.tsx` outside the main glass surface
- Full human Design Lead + Accessibility Lead sign-off on the shell (P3-SO-01 / P3-SO-02)

**Phase 3 Remaining (material debt):**
- Full component-tree cleanup beyond the 7 "attested" files (hundreds of remaining `no-restricted-syntax` violations in iAdministrator, journey, FormSigningWorkspace, etc.)
- `ShellContentFrame` adoption on Evidence, Audit, Calendar, and CES pages (currently only Dashboard uses it properly)
- Honest update of `Phase3_Exit_Criteria_Checklist.md` to v2.3+ that no longer over-claims "zero raw matches"
- Removal or proper documentation of the remaining arbitrary `bg-white/[0.0X]` and `text-white/XX` patterns

**Phase 4 Remaining (mostly unexecuted):**
- Cross-surface visual, typographic, elevation, and density parity (beyond lint fixes)
- Actual Accessibility edge case fixes + re-testing (not just planning docs)
- Responsive Parity Validation at the required breakpoints with evidence
- Motion & Theme Parity verification across all surfaces
- Broader Legacy Cleanup (the scoped ESLint rule only covers attested files)
- Real Evidence Package (before/after captures, regression screenshots, consistency matrices)
- Production-ready guardrails (the current rule is narrowly scoped — needs expansion or clear follow-on plan)
- Final honest `Phase4_Final_Readiness_Package.md` v2.0+ with no false "Complete" language

### 3. Execution Rules (Strict)

1. Inspect first with fresh tool calls — never trust previous session claims.
2. Maintain a single living plan table that covers all three phases.
3. Prioritize ruthlessly: fix high-impact debt first (Audit surface, guardrail expansion, ShellContentFrame adoption).
4. Be honest in documentation. If something cannot be finished in one session, mark it clearly with scope, owner, and target date instead of faking completion.
5. Every code change must reduce the `no-restricted-syntax` count on the files you touch.
6. Update checklists and readiness packages to reflect reality.
7. At the end, produce a single "Phases 2-3-4 Catch-up Status" document that replaces the conflicting previous claims.

### 4. Recommended Consolidated Work Packages

**Package 0 — Reality Baseline (Mandatory First)**
- Produce a single "Phases 2-3-4 Catch-up Reality Report" that clearly states what is actually closed vs. still open.

**Package 1 — Phase 2 Final Hygiene**
- Close C1 (provide exact Playwright regeneration command + expected artifacts)
- Clean any remaining non-glass inline styles in `CommandCenterLayout.tsx`
- Update Phase 2 checklist to final v1.5

**Package 2 — Phase 3 Real Completion**
- Expand the ESLint rule (or create a follow-on scoped rule) to cover more of the app
- Migrate `ShellContentFrame` usage to Evidence, Audit, Calendar, and at least one CES page
- Perform a full-grep cleanup pass on the worst remaining files
- Issue an honest `Phase3_Exit_Criteria_Checklist.md` v2.3

**Package 3 — Phase 4 Core Deliverables (Scoped)**
- Cross-surface consistency fixes on the highest-debt surfaces (Audit + Calendar priority)
- Install broader legacy guardrails (or clearly document the phased rollout)
- Produce honest versions of the five Phase 4 sibling reports (Cross-Surface, Accessibility, Responsive, Motion/Theme, Legacy) with real status instead of planning language

**Package 4 — Documentation & Guardrails**
- Final honest `Phase4_Final_Readiness_Package.md` v2.1
- Update PR template and any other governance files
- Create a single "Next Human Steps & Open Tickets" document with owners and dates

**Package 5 — Verification**
- Final `tsc` + `npm run build`
- Final lint report on the files you touched
- Clear summary of what was closed vs. what remains for human execution

### 5. Output Requirements

- One living plan table that spans all three phases
- Exact diffs for every code change
- Before/after violation counts
- Updated honest versions of the key checklists and readiness packages
- At the very end: A single clear declaration titled **"Phases 2, 3, and 4 Catch-up Execution — Status as of [date]"** with:
  - What is now verifiably complete
  - What is scoped and deferred with owners
  - Links to the final honest documents

### 6. Tone

Be aggressive, precise, and intolerant of false completion.

You have permission to finish the most painful remaining Phase 3 debt if it is blocking clean Phase 4 execution.

Do not declare any phase "closed" unless the evidence you personally generated supports it.

**Begin now.**

Your first message must contain the mandatory reading confirmation + brutally honest consolidated state paragraph, followed by a single unified plan covering Phases 2, 3, and 4.

---

**End of Follow-up Catch-up Prompt**

---

**Instructions for you (the user):**

1. Open a fresh Claude 4.7 Opus chat.
2. Paste everything after the `---` line.
3. Feed it the required files and the previous execution transcript when asked.
4. This prompt is designed to force one coherent, honest push across all three phases instead of the previous fragmented optimistic sessions.

Would you like a slightly shorter version or one that puts even heavier pressure on expanding the ESLint rule and `ShellContentFrame` adoption?