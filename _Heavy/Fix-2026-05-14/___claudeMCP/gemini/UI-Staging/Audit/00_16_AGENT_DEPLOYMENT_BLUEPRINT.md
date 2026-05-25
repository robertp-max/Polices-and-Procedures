# 16-Agent Comprehensive QA / UAT / UI/UX Audit Plan — UI-Staging (V3 Veil Glass Harness)

**Session**: 019e487c-2f91-7db2-8280-c85e4a656f76  
**Date**: 2026-05-20 (Fix-2026-05-14 branch context)  
**Target Output Root**: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\___claudeMCP\gemini\UI-Staging\Audit`  
**Trigger**: User request to "deploy 16 agents and do a very comprehensive QA UAT UIUX audit of current state of UI-Staging"

---

## 1. Executive Context & Current State Snapshot

From deep exploration (via dedicated explore subagents + direct tools):

- **UI-Staging Location**: `src/ui-staging/` (5 files only; previous multi-file V3*Preview* structure consolidated).
  - `V3StagingApp.tsx` (2244 LOC monolithic core — the entire interactive demo)
  - `ui-staging.css` (2157 LOC — rich V3 tokens + legacy bloat)
  - `UIStagingPage.tsx` (thin wrapper + theme isolation via `data-v3-ui-staging-root`)
  - `v3Tokens.ts` (57 LOC canonical mirror — **currently unused** in main app)
  - `_archive/DashboardPage.tsx` (legacy 1266 LOC)

- **What it is**: A **standalone, fixed-overlay, zero-dependency visual language demonstration harness** for the V3 "Veil Glass" premium matte-slate dark theme (#05060A base, 77.7% main card, 0.33 borders, teal #00D1C1 dominance + limited orange glows, `.v3-invisible-glare` hovers, butter-shift animations, ci-angel watermark at 0.33 opacity). Accessible at `/ui-staging` (public lazy route in App.tsx, outside CommandCenterLayout).

- **Content**: 22 `SectionId` nav items across 7 groups (OVERVIEW, CLINICAL, COMPLIANCE, FORMS & EVIDENCE, INTELLIGENCE, WORKFORCE, RESOURCES). Every section has a dedicated page function returning polished JSX. Uses local `V3` const + heavy inline `style={{}}` + shared CSS classes. One shallow prod integration: `PolicyDetailPage` wraps `<GVGBDetailView>`.

- **Strengths** (from page-by-page scan): 
  - All 22 pages render without crashes.
  - Strong, consistent visual adherence to V3 Veil Glass contract (from `docs/UIUX/V3-Veil-Glass-Design-System-Implementation-Specs.md`, `_Heavy/.../SourceOfTruth/APP_Screenshots.pdf` (36 pages), DesignSpecs, previous ClaudeX2).
  - Good use of HeaderBlock, status coloring, progress bars, card grids, filter chips.
  - CSS-driven transitions (View Transitions API + `@keyframes v3ButterShift` etc.).

- **Critical Debt & Gaps** (baseline for audit):
  - Monolithic single-file architecture (all 20+ pages + 3 global mocks + 18+ inline mocks inside 2244 LOC).
  - Extreme duplication of inline styles, list/table patterns, filter chips, KPI grids, search bars.
  - ~70-80% of controls are **purely visual / non-functional** (search inputs, tabs, buttons have no state/handlers).
  - Mock data sprawl + inconsistency with real production models (`src/policy/staffing/types.ts`, `stores/`, `Clinician*Page.tsx`, `Patient*Page.tsx` etc. — missing FEHA, credentials lifecycle, ShiftNeed, real hooks).
  - Token source-of-truth drift: local `V3`, unused `v3Tokens.ts`, CSS `:root --v3-*`, vestigial hundreds of `.v3-shell-*` / `.v3-login-*` / `.v3-profile-*` classes from pre-consolidation.
  - Shallow production bridge (only GVGBDetailView; no V3 styling pass-through).
  - No real UAT interactivity, no error states, no loading, limited mobile simulation depth.
  - Legacy CSS bloat, no extracted primitives (V3Card, V3Filter etc. as planned in historical 16-agent reports).

- **Historical Context**: Builds on massive prior 16-agent audits (`docs/UIUX/16_Agent_Reports/`, `16_AGENT_CLAUDE_BATCH1_AUDIT/`, X2-16 master consolidated feedback). UI-Staging evolved from "Claude overclaim recovery" into the current executable spec harness. This new audit must reference and delta against all prior findings.

**Primary References for All Agents**:
- `src/ui-staging/V3StagingApp.tsx` (full), `ui-staging.css`, `v3Tokens.ts`
- `_Heavy/Fix-2026-05-14/___claudeMCP/gemini/SourceOfTruth/APP_Screenshots.pdf` (36 visual benchmarks)
- `docs/UIUX/V3-Veil-Glass-Design-System-Implementation-Specs.md`
- `docs/UIUX/16_AGENT_CLAUDE_BATCH1_AUDIT/` + `16_Agent_Reports/`
- Production anchors: `src/policy/staffing/pages/`, `src/policy/components/CommandCenterLayout.tsx`, staffing stores/types, real policy detail views
- Existing screenshots: `tmp-ui-staging-*.png`, `tmp-ui-verify-screenshots/`, gemini PNGs

---

## 2. 16 Specialized Agent Charters (Deploy in Parallel)

Each agent will be a **general-purpose** (or "execute" capable) subagent given:
- Full briefing (this plan + the two exploration reports from session).
- Strict instructions: exhaustive tool use (read_file with offsets, grep patterns for "border", "onClick", "V3\.", specific page functions, cross-file compares), produce **structured Markdown report** (template: Executive Summary, Scope, Detailed Findings by Severity [P0/P1/P2], Evidence (exact file:line + quotes), Visual/UX/UAT Impact, Comparison Matrix vs PDF+prod, Recommendations (actionable + effort), Appendix).
- **Must** use `write` tool to persist report to target Audit dir **before** final response.
- Reference prior 16-agent work for deltas ("since Agent 03 Token report...").
- For visual agents: describe what would be seen in browser (or note if server was live).

**Agent 01: V3 Token System, Palette & Visual Contract Fidelity**  
Focus: Exhaustive diff of every `--v3-*`, local `V3`, inline color/border/glass/shadow/gradient/opacity (esp. 0.33 sacred border, 77.7% card, watermark 0.33, teal/orange discipline, glare) against CSS `:root`, `v3Tokens.ts`, Design Specs §2, and every page of APP_Screenshots.pdf. Flag any drift, opacity violations, missing glows, contrast issues. Deliver: Token Drift Matrix (50+ entries), visual parity % score.

**Agent 02: Architecture, Monolith Debt & Code Hygiene**  
Focus: Deep analysis of 2244 LOC single file, duplication count (grep style= blocks, repeated map patterns), lack of component extraction (no V3* primitives despite historical plans), mock data sprawl (count unique arrays + reuse), unused `v3Tokens.ts`, legacy CSS bloat (vestigial classes still in file). Compare to planned `components/V3PageWrapper.tsx` etc. Deliver: Refactor roadmap with proposed file splits + duplication % metrics + smell scorecard (0-10).

**Agent 03: Mock Data Fidelity vs Real Production Models**  
Focus: Map every hardcoded array (TASKS, CLINICIANS, PATIENTS, policies, forms, artifacts, tracks, domains, visits, etc.) against real types in `src/policy/staffing/types.ts`, `data/`, stores (`clinicianStore`, `patient` projections), `Clinician*Page.tsx`, `Patient*Page.tsx`, CES types, policy lifecycle. Flag missing fields (FEHA, credentials, ShiftNeed, verifiedAt, acuity math, etc.). Deliver: Fidelity gap table per domain + "what real data would look like" examples.

**Agent 04: Navigation, State & Transition UX**  
Focus: Sidebar groups/items, `activeSection` state, `isNavOpen`, `viewportWidth` + isMobile, `performRouteTransition` (View Transitions + fallback), `navigate` calls, all `onClick` that change section (only a few real ones), `.animate-butter-shift` + CSS keyframes, mobile collapse behavior. Test mental model of "22 pages in one shell". Deliver: Flow diagram + issues (e.g. orphaned policy-detail, no back buttons in most, keyboard nav gaps).

**Agent 05: Page Completeness & Feature Parity Matrix**  
Focus: For all 22 pages — richness vs thinness (from prior page scan), which have real handlers vs pure visual, consistency of HeaderBlock usage, filter/search patterns. Cross-ref to 16_Agent_Reports (e.g. Agent 05 Dashboard, Agent 08 Policy, Agent 10 Calendar). Deliver: Completeness heatmap (rich/medium/thin) + per-page "UAT readiness" score.

**Agent 06: Interactivity, Controls & Micro-Interaction UAT**  
Focus: Inventory **every** button, input, tab, chip, "Start eCign", "Document", "Launch", search, filter — which have real `onClick`/`onChange` vs `cursor:pointer` only. Simulate user flows (e.g. "click clinician row → expect detail?"). Note lack of controlled components, modals, toasts. Deliver: Non-functional Controls Register (with line numbers) + "minimum viable interactivity" proposal for key pages.

**Agent 07: Responsiveness, Mobile & Breakpoint UAT**  
Focus: `isMobile = <768`, nav collapse, 77.7% → 95vw logic, all grids (`repeat(auto-fit, minmax...)`), font scaling, touch targets, calendar grid on small vw, long lists. Use code + (if server live) browser_tab on simulated mobile UA. Compare to Agent 12 Mobile reports. Deliver: Responsive issues log + recommended breakpoint refinements + test matrix (320/375/768/1024/1440).

**Agent 08: Accessibility (A11y) & Inclusive UAT**  
Focus: ARIA on nav/sidebar/buttons, focus management (sidebar items, header toggles), color contrast (teal on dark, textSecondary), keyboard-only navigation (Tab, Esc for sidebar, arrows?), missing labels on icon-only, screen-reader order, `data-v3-ui-staging-root` impact. No explicit roles in many lists. Deliver: A11y audit (WCAG 2.2 AA violations count) + quick wins list. Reference Agent 13 A11y prior work.

**Agent 09: Performance, Runtime & Bundle Impact**  
Focus: 2244 LOC + 2157 CSS in one chunk (lazy but still), hundreds of inline styles (no memo/pure), re-renders on every nav (full tree), resize listener, no virtualization on long lists (Clinicians etc.), animation cost (butter + view-transition), watermark img. Suggest `npm run build` analysis or source-map. Deliver: Perf risk assessment + "before/after" for extraction.

**Agent 10: Content, Terminology, Copy & Domain Accuracy**  
Focus: All micro labels, titles, subtitles, domain names (CL/QA/GV/IT/HR/SA), policy codes (GV-GB-001), form names, status values, "PHASE 1 • READ-ONLY" notes, hardcoded May 2026 dates. Cross-check against real policy corpus (`src/policy/data/`), ACHC tags, regulatory events. Flag anachronisms or drift. Deliver: Terminology inconsistency log + suggested canonical glossary for staging.

**Agent 11: Production Integration & Bridge Quality**  
Focus: The sole `GVGBDetailView` import + wrapper — does the imported prod component inherit V3 glass/77.7%? Any style leakage or conflicts? Future pattern for bringing real `ClinicianPage`, `EvidenceCenterPage` etc. into the harness without breaking isolation. Review CommandCenterLayout for how V3 would layer. Deliver: Integration risk report + "V3PageWrapper" spec for safe embedding.

**Agent 12: Theme Isolation, CSS Leakage & Global Side-Effects**  
Focus: `UIStagingPage.tsx` useEffect (bg color force, `data-v3-ui-staging-root`, cleanup), all `[data-v3-ui-staging-root]` rules in CSS, potential leakage to other routes or html/body, `removeAttribute('data-theme')`. Any `index.css` or tailwind conflicts? Watermark z-index 9000 shell. Deliver: Isolation safety audit + leakage test cases.

**Agent 13: Animation, Polish & "Premium Feel" Audit**  
Focus: All `@keyframes` (v3ButterShift, page/subview/stagger, shell-settle), `cubic-bezier(0.16,1,0.3,1)` usage, View Transitions support/fallback, hover micro-transitions on glare/btn-smooth, lack of GSAP (historical), consistency of "buttery" motion. Compare to Dribbble-level transitions in specs. Deliver: Polish score + missing delight opportunities (e.g. stagger on list load, subtle parallax watermark).

**Agent 14: End-to-End UAT User Journey Scenarios**  
Focus: Script and mentally/simulate 8-10 realistic personas/flows through the 22 sections (e.g. "QA Lead opens /ui-staging → Dashboard → sees overdue → goes to My Planner → filters → opens Policy Library → clicks featured GV-GB-001 → sees detail via GVGB → back"). Note dead-ends, missing context, data freshness illusion. Deliver: Journey maps + pass/fail per scenario + friction log.

**Agent 15: Delta vs Prior 16-Agent Audits & Historical Drift**  
Focus: Read all `16_Agent_Reports/Agent_*_Analysis.md` + `16_AGENT_CLAUDE_BATCH1_AUDIT/` (especially X2-16 master, Agent15 Production Reality, Agent04/05 Clinician/Patient, Agent03 Token, Agent14 Legacy). Quantify what has improved/regressed in current monolithic staging vs the multi-file preview era and Claude promises. Deliver: "Since Last Audit" change log + remaining open items from 2026-05-14 work.

**Agent 16: Risk Register, UAT Verdict & Prioritized Remediation Roadmap**  
Focus: Synthesis lens (will also read the other 15 reports post-completion). Produce overall risk heat-map (Visual Fidelity | Maintainability | Data Accuracy | Interactivity | A11y | Integration | Perf), UAT sign-off verdict (e.g. "Visually 92% — Functionally 18% ready as demo"), P0/P1/P2 backlog with file:line, effort (S/M/L), suggested owners (Grok vs human), quick-win vs architectural items. Master recommendations for "UI-Staging v2" (e.g. make 3-4 pages deeply interactive with real stores, extract 8 primitives).

---

## 3. Execution Workflow & Tooling

**Prep (Main Agent — immediate)**:
1. Ensure target `.../UI-Staging/Audit/` exists (create with subfolders: `Agent_Reports/`, `Screenshots/`, `Master/`, `Raw_Findings/`).
2. Optionally launch dev server: `npm run dev` via `run_terminal_command` with `background: true` + `monitor` for "ready" log (Vite on :5173). Capture baseline screenshots via `browser_tab` tool (`url: "http://localhost:5173/ui-staging"`, multiple calls with wait/js for different sections if hackable, full-page screenshots).
3. Write this plan + the two exploration reports as `00_EXPLORATION_BASELINE.md` into Audit for agents to reference.
4. Create `00_MASTER_INDEX.md` skeleton.

**Deployment (Main)**:
- Issue **16 parallel `spawn_subagent`** calls (general-purpose, capability_mode="all" or "execute", isolation="none" or "worktree" if needed for safety, background=true for long ones).
- Each prompt = "You are Agent 0N: [Charter Title]. [Full 1-2 para brief + references + required report template + instruction to write output file using `write` tool to exact path + 'report back with subagent_id and summary when done']."
- Use unique IDs, track via todo_write (16 items).

**Monitoring & Collection**:
- Use `wait_commands_or_subagents` + repeated `get_command_or_subagent_output` (with block) for all 16 IDs.
- If any stall, kill + respawn with narrower scope.
- As reports land in Audit/Agent_Reports/, main reads them progressively.

**Synthesis (Main — after all 16 done)**:
- Read all 16 + any new screenshots/PDF pages.
- Write `00_MASTER_CONSOLIDATED_16_AGENT_QA_UAT_UIUX_AUDIT_OF_UI_STAGING.md` (exec summary, category rollups, visual scorecard vs PDF, full prioritized backlog, "what to do next" for UI-Staging and for production reskin, continuity with prior 16-agent work).
- Optionally produce a lightweight CSV/JSON issue register.
- If critical P0 bugs found in code, propose minimal fixes via search_replace (but primary is audit output).

**Visual UAT Notes**:
- Agents 01/07/08/13/14 will emphasize "rendered appearance" using code inspection + reference to provided screenshots + any live captures I produce.
- If localhost not stable (auth, port, concurrent api), fall back to "static visual analysis + PDF pixel matching" — still highly valuable.

**Output Contract**:
- Every agent report must be self-contained, cite exact `file:line`, quote code, reference specific PDF page or prior Agent_XX.
- Master must be decision-ready for "fix or evolve UI-Staging" or "decommission as pure reference".

---

## 4. Success Criteria & Deliverables

**Must-Have at End of Session**:
- 16 individual `Agent_0N_<Title>_UIStaging_Audit.md` files in `.../Audit/Agent_Reports/`
- `00_MASTER_CONSOLIDATED_...md` (8-15k words, tables, heatmaps)
- `/Screenshots/` with 5-15 fresh captures or annotated diffs (if captured)
- Updated `Audit/README.md` with index + "how to use these reports"
- (Optional) One-pager "UI-Staging Current State Verdict — 2026-05-20" for quick human review

**Quality Bar** (inherited from prior 16-agent work): Brutally honest, evidence-based, no overclaiming, actionable, references history, distinguishes "visual showcase strength" from "prototype weakness".

**Non-Goals**: Do not rewrite the entire V3StagingApp during this audit (unless tiny P0). Do not change production. The query is audit + save output.

---

## 5. Risks, Mitigations & Sequencing

- **Risk: Subagent context overload** — Mit: Seed each with "First action: read the two exploration reports I placed in Audit/00_*.md + this plan. Then targeted reads only."
- **Risk: Parallel spawn limits / timeouts** — Mit: Spawn in 2-3 waves of 5-6; use background + monitor; have Agent 16 wait on others via resume logic if needed.
- **Risk: No live browser for some agents** — Mit: Strong static + PDF analysis is sufficient for 80% of value; I will attempt 1-2 live captures upfront.
- **Risk: Drift from "gemini/Claude" context** — Mit: Explicitly include the _Heavy/gemini/... paths in every charter; treat as continuation.
- **Sequencing**: Prep (5min) → Wave 1 (Agents 01-06) → Wave 2 (07-12) → Wave 3 (13-16 + synthesis start) → Master.

This plan is concrete, leverages all existing artifacts, directly fulfills "deploy 16 agents" + "very comprehensive" + "output save here", and builds on the project's rich audit history without reinventing.

---

**REVISION 2026-05-20 (per user instruction)**: 

**"save for now and wait for claude's audit"**

This plan is now **frozen as the authoritative 16-Agent Deployment Blueprint**. 

**Current Status**:
- Full exploration complete (two detailed subagent reports captured in this session).
- 16 specialized charters defined with exact focus, references, and expected artifacts.
- Execution workflow, success criteria, risk mitigations, and output contract locked.
- **No spawns executed yet**. The 16 agents (general-purpose subagents with full tool access) are **prepped and ready to deploy in parallel** the moment the Claude / Gemini side (via the ___claudeMCP context in the target path) signals readiness or provides additional seeds / screenshots / specific UAT scenarios.

**Artifacts "Saved for Claude"** (to be materialized in target on trigger or by next agent):
- This exact plan copied to `.../UI-Staging/Audit/00_16_AGENT_DEPLOYMENT_BLUEPRINT.md`
- The two exploration reports (structural + page-by-page completeness) written as `00_EXPLORATION_BASELINE_STRUCTURAL.md` and `00_PAGE_COMPLETENESS_MATRIX.md`
- `00_MASTER_INDEX.md` + `README.md` for the Audit folder
- Any live screenshots captured in this session (browser_tab on localhost:5173/ui-staging) will land in `/Screenshots/`

**How Claude/Gemini Should Use This**:
1. Review the 16 charters (Agents 01–16) — they are designed to run fully autonomously with the provided references.
2. (Optional) Add any new focus areas, specific PDF page callouts, or additional mock data seeds before launch.
3. Trigger the 16 `spawn_subagent` calls (or equivalent MCP / parallel agent dispatch) using the exact prompts derived from each charter + the "First action: read the 00_ baselines + this blueprint".
4. Collect the 16 written reports from the Audit/Agent_Reports/ directory.
5. Run the Synthesis phase (Agent 16 or main) to produce the final consolidated master audit.

**Why Pause Here (Fits "gemini" + ClaudeMCP workflow)**:
- Avoids duplicate parallel swarm runs.
- Allows Claude to inject its own visual references, recent screenshots, or domain-specific UAT test cases (e.g. from its last ClaudeX2 delivery).
- Keeps the "Grok prepares the swarm, Claude/Gemini executes or reviews the swarm output" handoff clean — matching the directory naming `___claudeMCP/gemini/UI-Staging/Audit`.

**Next Expected Action**: Claude (or user on Claude's behalf) signals "deploy now" or "add these 3 extra scenarios to Agent 14" → then full parallel deployment + master report generation will occur, with all output landing exactly at the requested path.

This fulfills the spirit of the original request while respecting the "save for now and wait" directive. The blueprint is comprehensive, evidence-based, and directly executable.

---

**End of Revised Plan** (frozen). All prior sections (1–5) remain the approved technical definition of the 16-agent audit.