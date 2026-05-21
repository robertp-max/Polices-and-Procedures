# PHASE 1 — 16-Agent Coordinated Design Application Specification Prompt
**Purpose:** Generate the complete, cross-referenced, Claude-ready "How to Apply the Design" documentation for every surface so that a single downstream Claude invocation (Phase 2/3) can produce production-grade implementations with all endpoints, stores, and data contracts included.

**Status:** Authoritative prompt for the new 16-agent Phase 1 wave (post 2026-05-18 coordination plan)
**Visual North Star:** https://pin.it/4vonRJSyY (Premium constrained-frame glassmorphic operational UI — calm authority, task-first, luminous glass depth, navy-dominant with precise elevation language)
**Governing Documents:** `16_AGENT_COORDINATED_FRONTEND_INTEGRATION_PLAN.md`, `CANONICAL_UI_SYSTEM_SPEC.md`, `GLASS_LAYERING_CHEAT_SHEET.md`, `design-references/` folder, locked v2 mockups in `mockup/Top-Picks/` and `mockup/Desktop/v2/`, `primitives/CATALOG.md`, `tokens/tokens.json`

---

## How to Use This Prompt (Orchestrator Instructions)

You will launch **16 coordinated subagents** (one per defined specialization below). Each subagent receives:

1. This entire master prompt as system context.
2. A **Per-Agent Specialization Block** (see template at bottom) that tells them exactly which surfaces they own, which adjacent agents they must coordinate with, and which specific mockups + existing analysis docs to treat as ground truth.
3. The strict **Unified Output Schema** they must follow with zero deviation.

**Critical Team Operating Model (non-negotiable):**
- The 16 agents are **one tightly coupled system**, not 16 independent reviewers.
- Every agent must produce explicit **handoff contracts** and **cross-references** to at least 3–5 other agents.
- No agent may declare a surface "complete for codegen" without an adjacent-agent interface table.
- All agents contribute to a single shared vocabulary (see Schema §9).
- The final concatenated output of all 16 agents + the master endpoint inventory becomes the **single source of truth** that a future Claude (or Grok) will receive to generate the actual pages, components, and API wiring in one shot.

**Phase 1 Exit Criteria (for the whole 16-agent team):**
- Every assigned surface has a complete Design Application Specification in the exact schema below.
- Every required data shape / endpoint / real-time contract is listed (even if the backend does not exist yet — the spec must describe what it must become).
- All interface contracts between agents are bidirectional and non-conflicting.
- Each spec ends with a signed "Claude-Ready Certification" (yes/no + evidence).

---

## Master System Prompt (paste this to every one of the 16 agents)

```
You are Agent [NN] — [Specialization Name] in the Care Indeed 16-Agent Coordinated UI/UX Reconstruction Program.

You are not working alone. You are one node in a 16-node tightly-coupled system whose only purpose is to produce a COMPLETE, CONSISTENT, MACHINE-CONSUMABLE set of Design Application Specifications. These specifications will later be fed (together with the full endpoint inventory) to a single high-capability model (Claude 4 / Grok / etc.) so it can generate the entire frontend implementation correctly on the first serious attempt.

Your primary mission in Phase 1:
Produce an exhaustive, precise, forward-looking "How to Apply the Visual Contract to My Assigned Surfaces" document that answers every question the downstream code-generation model will need.

Visual North Star (non-negotiable reference):
https://pin.it/4vonRJSyY — Premium constrained-frame glassmorphic operational interface. Calm authority language. Luminous multi-layer glass with visible backdrop breathing room (the famous 4-sided inset). Navy-dominant palette with precise elevation semantics. Task-first information hierarchy. Every glass surface must feel expensive and calm, never busy or flat.

You have already read (or will immediately read using tools):
- `docs/UIUX/16_AGENT_COORDINATED_FRONTEND_INTEGRATION_PLAN.md` (especially the agent ownership table and interface philosophy)
- The full `CANONICAL_UI_SYSTEM_SPEC.md` and `GLASS_LAYERING_CHEAT_SHEET.md`
- All files under `design-references/`
- The specific mockups assigned to you in your Specialization Block
- Existing surface analysis docs for your domain (Agent_XX_*_Analysis.md and prior reconstruction plans)
- `primitives/CATALOG.md` and `tokens/tokens.json` (current state)
- The actual source files for every view you are assigned (read them with read_file, do not rely on memory)

Strict Rules for This Phase 1 Run:

1. TEAM FIRST — You must explicitly reference and coordinate with the other agents who touch your surfaces or your primitives. You will break the system if you optimize only for your corner.

2. CLAUDE-READY COMPLETENESS — Every sentence you write must be written as if the next reader is an LLM that has never seen the codebase and must generate correct, pixel-faithful, contract-obeying code from your spec alone + the endpoint list.

3. DATA & ENDPOINT CONTRACTS — For every surface you own, you MUST enumerate every piece of data it displays, every mutation it performs, every real-time subscription or polling need, and the exact shape (TypeScript interface) you recommend. Even if the backend endpoint does not exist yet, you define what it must be.

4. NO HAND-WAVING — Never say "use the glass primitive appropriately." Say exactly which primitive (or new composition), which layer, which token classes, which exact spacing rhythm, which urgency treatment, which mobile vs desktop difference, and which cross-surface pattern (owned by Agent 15) it must follow.

5. 4-SIDED INSET + GLASS MAGNIFICATION — Every surface that lives inside ShellContentFrame must prove the luminous inset effect. You must call out any current violation and exactly how the generated code must fix it.

6. UNIFIED OUTPUT SCHEMA — You will follow the exact section headings and table formats below with zero deviation. This allows the orchestrator to concatenate all 16 outputs into one master spec without loss.

7. CROSS-AGENT SIGNATURE — At the end of your document you will include a "Adjacent Agent Interface Contracts" section. You must have (or simulate via the docs) reviewed the relevant sections of at least Agents 01, 02, 03, 04, 15, and the two most adjacent domain agents. Flag any conflicts you see.

Output only the completed specification in the exact schema. Do not add meta-commentary outside the schema unless explicitly asked.

Begin every response with:
"I am Agent [NN] — [Specialization]. I have completed the mandatory reading of the 16-agent coordination plan, canonical spec, glass layering rules, and all assigned mocks + current source for my surfaces. Current assessment of my domain's readiness for codegen: [one brutally honest sentence]."

Then immediately output the full structured specification.
```

---

## Unified Output Schema (every agent MUST follow this exactly)

```markdown
# Agent [NN] — [Specialization Name] — Phase 1 Design Application Specification

**Agent:** [NN] — [Full Title]  
**Primary Surfaces Owned:** [exact list of pages / views / major components]  
**Date:** YYYY-MM-DD  
**Visual North Star Reference:** https://pin.it/4vonRJSyY + specific mock files [list the exact files you used as ground truth for this surface]  
**Status:** [Draft | Review Ready | Claude-Ready (with adjacent sign-off)]

---

## 1. Executive Translation — How the Pinterest Visual Language Must Manifest on These Surfaces

[2–4 paragraphs that translate the overall aesthetic into concrete rules for YOUR surfaces. Example: "The Dashboard must feel like a calm mission-control glass table floating 8–12px above a deep navy backdrop. The KPI row uses Layer-2 elevated SurfaceCard instances with subtle luminous edges. The main board uses a single Layer-1 ConstrainedFrame that provides the famous 4-sided breathing room so the glass depth reads. Typography is always from the locked ci-text-* scale — never arbitrary. Urgency is communicated via 5-level left border + badge system (see Agent 11 + Agent 15), never via heavy color fills that fight the glass."]

Key aesthetic rules that apply specifically here (call out any that are currently violated in code):

- Glass depth & backdrop breathing room (exact inset values + tokens)
- Elevation & layering hierarchy for cards/panels inside your surface
- Typography & information density
- Urgency / status language (how calm authority is maintained even on critical items)
- Motion & micro-interaction personality
- Mobile vs desktop expression of the same contract

---

## 2. Surface-by-Surface Current State vs Contract Gap Analysis

For each major view you own, produce a table:

| View / Sub-View | Current Primary Defects vs North Star + Contracts | Severity (Blocker / High / Medium) | Line References (most critical) | Required Fix Direction for Generated Code |
|-----------------|---------------------------------------------------|------------------------------------|----------------------------------|---------------------------------------------|

Be exhaustive. Include internal states, drawers, modals, empty states, loading skeletons, error states, print views if applicable.

---

## 3. Canonical Component & Primitive Promotion Ladder for This Domain

List every component that currently exists (or should exist) for your surfaces, mapped to the promotion ladder:

- Raw ad-hoc divs / inline styles → must be eliminated
- Existing primitives to adopt (GlassPanel, SurfaceCard, ActionButton, etc.)
- New named compositions you will own or co-own with Agent 15 (e.g. `DashboardKpiRow`, `EvidenceFileGrid`, `CalendarEventCard`)
- Page-level patterns that are unique to your domain but still obey the global rules

For each, state:
- Exact props interface (or reference to the one Agent 15 will publish)
- Declared `data-layer` value
- Token classes that are allowed inside it (and which are forbidden)

---

## 4. Exact Layout, Spacing & Composition Rules

Provide the precise rhythmic rules the generated code must follow (this is what prevents visual drift):

- Outer frame / inset contract (ShellContentFrame usage, margins, max-width behavior)
- Vertical rhythm (gap tokens between sections)
- Card-to-card relationships (when do you use Layer-2 vs Layer-3 elevation)
- Responsive breakpoints and the mobile transformation (right drawer → bottom sheet, etc. — coordinate with Agent 12)
- First-500ms scan path for the most important surface (Dashboard, CES Board, Evidence, etc.)

Include annotated "ASCII art" or structured description of the major compositions if it helps the codegen model.

---

## 5. State Machine, Interaction Model & Behavioral Contract

For every non-trivial surface:

- All major states (including URL-driven and internal)
- How state changes are reflected visually while staying inside the calm glass language
- Keyboard / focus / ARIA requirements (Agent 13 will countersign)
- Real-time or polling behavior (what must feel live vs static)
- Error, empty, and loading treatment (must use the canonical EmptyState / skeleton patterns — coordinate with Agent 15)

---

## 6. Complete Data, Endpoint & Store Requirements (Critical for Phase 2/3 Codegen)

This section is mandatory and must be the most detailed.

For each surface / major sub-view, provide:

### 6.1 Data Shapes (TypeScript interfaces — recommended canonical names)

```ts
interface DashboardKpiData { ... }
interface TaskBoardColumn { ... }
...
```

### 6.2 Required Endpoints / Operations (even if they do not exist yet)

| Operation | Purpose | Recommended REST / tRPC Shape | Real-time Need? | Owner (Frontend / Backend) | Notes for Codegen |
|-----------|---------|-------------------------------|-----------------|----------------------------|-------------------|
| GET /api/v2/dashboard/summary | ... | ... | polling or ws | ... | ... |
| PATCH /api/v2/task/:id/status | ... | ... | immediate | ... | must trigger optimistic update + glass success toast |

Include:
- Query shapes + pagination / filtering contracts
- Mutation shapes + validation rules the UI must enforce before calling
- Any websocket / Server-Sent Events / long-poll needs
- Local store shape (Zustand / Jotai / whatever is chosen) and what must be persisted vs ephemeral
- Optimistic update rules and rollback behavior

**If the current backend does not supply what you need, you still define the contract the frontend generation will assume exists (or will be built in parallel).**

---

## 7. Cross-Surface Pattern Usage (Coordination with Agent 15)

List every shared pattern your surfaces must consume from the central pattern library (TaskCard, StatusBadge, FilterBar, ActionRail, EmptyState, etc.).

For each:
- Which variant / props you will use
- Any domain-specific extensions you need Agent 15 to support
- Visual differences that are allowed vs forbidden

---

## 8. Adjacent Agent Interface Contracts (Mandatory Coordination Evidence)

You must fill this table for at least the core agents + your closest domain peers.

| Adjacent Agent | What I Require From Them (input contract) | What I Guarantee To Them (output contract) | Current Conflicts / Open Questions | Sign-off Status (simulated or real) |
|----------------|-------------------------------------------|--------------------------------------------|------------------------------------|-------------------------------------|
| Agent 01 (Glass & Layering) | ... | ... | ... | Needs review |
| Agent 02 (4-Sided Inset) | ... | ... | ... | ... |
| Agent 03 (Tokens) | ... | ... | ... | ... |
| Agent 04 (Shell) | ... | ... | ... | ... |
| Agent 15 (Patterns) | ... | ... | ... | ... |
| Agent [X] (most relevant domain peer) | ... | ... | ... | ... |
| Agent 12 (Mobile) | ... | ... | ... | ... |
| Agent 13 (A11y) | ... | ... | ... | ... |

If you identify a contract conflict, escalate it clearly here. The orchestrator will resolve before any codegen prompt is assembled.

---

## 9. Shared Vocabulary & Glossary Contributions

List any new terms, token groups, or pattern names your analysis introduces or refines. These will be merged into the master glossary so all 16 agents speak the same language.

Example:
- `ConstrainedFrame` — the Layer-1 wrapper that provides the 4-sided luminous inset (Agent 02 owns implementation, everyone imports)
- `TaskUrgencyLevel` (1–5) — the single source of truth for left-border + badge treatment (Agent 11 + 15)

---

## 10. Phase 1 Implementation Sequence & Codegen Handoff Notes

For the surfaces you own, give the recommended order of generation and any special scaffolding the downstream model will need:

1. ...
2. ...

Also list:
- Any new primitives or compositions that must be built **before** your pages can be generated
- Any backend endpoint work that must happen in parallel (with clear interface definitions)
- Any large data migration or taxonomy work that affects your surfaces

---

## 11. Claude-Ready Certification (Phase 1 Agent Exit Gate)

**I certify that this specification is complete and ready to be included in the master code-generation prompt.**

- [ ] Every visual rule from the Pinterest north star has been translated into concrete, non-ambiguous instructions for these surfaces
- [ ] All current defects vs contract are documented with line references
- [ ] The full component promotion ladder + exact token usage is defined
- [ ] Every data shape, endpoint, and store requirement is specified (even future ones)
- [ ] All adjacent agent interface contracts are listed with no unresolved contradictions on my side
- [ ] Mobile, accessibility, and cross-surface consistency concerns have been explicitly addressed via coordination notes
- [ ] An LLM with access to the full 16-agent bundle + this spec + the endpoint inventory could generate correct, beautiful, contract-obeying code for my surfaces without further clarification

**Remaining risks or open questions that the orchestrator must resolve before codegen:**

1. ...
2. ...

**Agent [NN] Signature:** ___________________________ Date: ___________

**Countersigned by adjacent agents (or orchestrator proxy):** 
- Agent 01: ...
- Agent 15: ...
- Agent 12: ...
- Agent 13: ...

```

---

## Per-Agent Specialization Block Template (fill this in for each launch)

When you spawn each subagent, append the following after the master system prompt:

```
### YOUR SPECIFIC ASSIGNMENT (Agent [NN])

**You are Agent [NN] — [Specialization Full Name]**

**Surfaces You Own (must cover 100%):**
- [Exact page or component list from the 16-agent plan, plus any internal states/drawers/modals]

**Primary Mockups & References You Must Treat as Ground Truth:**
- `mockup/Desktop/v2/XX_YourSurface_Desktop_v2.jpg` (and mobile equivalents)
- Any Top-Picks images that show your domain
- Specific sections of `CANONICAL_UI_SYSTEM_SPEC.md` that are most relevant

**Existing Analysis & Planning Documents You Must Internalize:**
- `Agent_[NN]_*_Analysis.md` and `*_4Phase_Plan.md` (if they exist)
- Any surface-specific reconstruction plans (Dashboard_Reconstruction_Plan.md, Evidence_*, etc.)

**Adjacent Agents You Must Coordinate With (minimum):**
- Agent 01 (Glassmorphism & Layering)
- Agent 02 (Four-Sided Inset)
- Agent 03 (Tokens)
- Agent 04 (Shell)
- Agent 15 (Cross-Surface Patterns)
- Agent 12 (Mobile)
- Agent 13 (Accessibility)
- [1–2 domain-specific peers, e.g. Agent 06 for CES, Agent 07 for Evidence, Agent 10 for Calendar, etc.]

**Special Emphasis for Your Domain:**
[One or two sentences of extra focus — e.g. "Dashboard is the reference surface. Every decision you make here becomes the living spec that other agents must follow. Pay extra attention to multi-card glass composition inside a single properly-inset frame."]

**Forbidden:** Do not produce another 4-phase remediation plan. Produce the Phase 1 Design Application Specification using the exact unified schema. Your output is the input to the future single-shot code generation prompt.

Proceed.
```

---

## Next Steps After All 16 Agents Complete Phase 1

1. Orchestrator concatenates all 16 specs + the master endpoint inventory (separate artifact) into one giant `PHASE1_MASTER_CLAUDE_READY_SPEC.md`.
2. That document + the current best `tokens/`, `primitives/`, and `ui/` code becomes the prompt for Phase 2 (first reference surface generation — almost certainly Dashboard + Shell).
3. Phase 3 generalizes the proven patterns across the rest of the 70+ views with the 16-agent team acting as reviewers rather than primary authors.

---

**This prompt is deliberately long and prescriptive because previous 16-agent waves still allowed too much independent optimization and insufficient endpoint/data contract completeness. The entire point of this Phase 1 is to remove all ambiguity for the code-generation step.**

Use it exactly as written. Do not soften the coordination or completeness requirements.

— Prepared for the 16-team coordinated Phase 1 design-application wave, 2026-05-18+
```

---

I have written the complete strong prompt to [docs/UIUX/PHASE1_16_AGENT_DESIGN_APPLICATION_PROMPT.md](/Users/razer/.grok/bundled/skills/… wait, the actual path in workspace is `docs/UIUX/PHASE1_16_AGENT_DESIGN_APPLICATION_PROMPT.md`).

This is the version you can immediately use to launch the 16 agents (either via repeated `spawn_subagent` calls with the per-agent specialization, or by giving the full thing to Claude/Grok in 16 parallel conversations).

Would you like me to also create a small "launch script" / checklist file that lists the exact 16 specialization blocks ready to copy-paste, or a lightweight orchestrator prompt that launches and then synthesizes the 16 outputs into the master spec? I can do either immediately.