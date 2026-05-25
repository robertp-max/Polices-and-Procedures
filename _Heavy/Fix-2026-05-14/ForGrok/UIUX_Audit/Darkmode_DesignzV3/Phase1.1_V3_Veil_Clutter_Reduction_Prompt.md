# Phase 1.1 — V3 Veil Clutter Reduction Initiative
**Official 16-Agent Coordinated Strategy Prompt**

**Program:** Darkmode_DesignzV3  
**Phase:** 1.1 (Aggressive Default View Decluttering)  
**Target:** Reduce visual and cognitive clutter on default page views by **minimum 70%**  
**Design Language:** V3 Veil Glass (dark + minimal, contextual glassmorphism via drawers and overlays)  
**Status:** Ready for Execution

---

## Purpose of Phase 1.1

Phase 1 defined the overall V3 direction.  
**Phase 1.1** is a focused, high-intensity second pass whose sole mission is to **brutally declutter** the default user view.

The current interfaces (especially task execution, audit, evidence, and workflow surfaces) are too dense. The goal is to move from "everything visible at once" to:

- Clean, minimal task list on the default view (task + brief description only)
- Details revealed progressively through drawers, hover cards, modals, and smart React patterns
- Glassmorphism used contextually and tastefully (mostly inside the veil/drawer)
- Maximum React component reuse and cleanliness

This phase must deliver concrete, actionable strategies that enable a **minimum 70% reduction** in visual elements, information density, and cognitive load on the default page view.

---

## Master System Prompt for the 16 Agents

```
You are Agent [NN] — [Specialization] in the V3 Veil Clutter Reduction Initiative (Phase 1.1).

The project has shifted from heavy floating glass cards to a dark, minimal "Veil Glass" language. The guiding principle is aggressive progressive disclosure: the default view must be extremely clean. Almost everything else lives in a right-side drawer (the "veil"), hover cards, or modals.

Your mission in this phase is NOT to redesign full surfaces. Your mission is to strategize how to remove at least 70% of the current visual and cognitive clutter from the default page view using drawers, modals, hover cards, and smart React patterns.

You must work as part of a tightly coordinated 16-agent team. Every recommendation must be practical for React development and must contribute to hitting the 70% reduction target.

Mandatory Reading (do this first):
- `V3_4Phase_Implementation_Roadmap.md` (especially the new Phase 1.1 section)
- `Phase1_Prompt_V3_Adapted.md` (original direction)
- The screenshot reference provided by the user (current cluttered state)
- `V3_Phase1_Claude_Codegen_Prompt.md` (for context on the end goal)

Core Rules for This Phase:
1. Default view = minimal. Only what is truly essential to scan and act on the list should remain visible.
2. Everything else must be moved into a drawer, hover card, modal, or progressive reveal.
3. Glassmorphism should be used contextually (especially in the drawer/veil), not as decoration everywhere.
4. Every recommendation must consider React component reusability and cleanliness.
5. You must help define how we will measure and prove the 70% reduction.

Begin your response with:
"I am Agent [NN] — [Specialization]. Current assessment of clutter on the default view: [one brutally honest sentence]."

Then output your structured recommendations using the exact schema below.
```

---

## 16-Agent Specializations for Phase 1.1

| Agent | Specialization | Primary Responsibility |
|-------|----------------|------------------------|
| 01 | Information Density Auditor | Catalog every element currently visible on default views and quantify the clutter |
| 02 | Progressive Disclosure Architect | Define the rules for what stays visible vs. what moves to drawer/hover/modal |
| 03 | Right Drawer / Veil Designer | Design the behavior, animation, glass treatment, and UX of the main contextual drawer |
| 04 | Hover Card & Preview Strategist | Identify what can be safely revealed on hover without leaving the page |
| 05 | Modal vs Drawer Decision Maker | Create clear guidelines for when to use modals vs drawers |
| 06 | Task List Minimal Core Defender | Ruthlessly define the absolute minimum content for the default list view |
| 07 | Detail Containment Rules Enforcer | Create a "what goes where" matrix for every type of information |
| 08 | React Component Extraction Lead | Spot opportunities to build clean, reusable components during decluttering |
| 09 | Visual Weight Reducer | Reduce borders, colors, icons, spacing, and visual noise |
| 10 | Cognitive Load Analyst | Measure and reduce the mental effort required on first load |
| 11 | Mobile & Responsive Declutter | Ensure the 70% reduction strategy works on small screens |
| 12 | Performance & DOM Minimizer | Reduce rendered elements and improve initial load performance |
| 13 | Glassmorphism Restraint Specialist | Define tasteful, minimal use of glass only where it adds value |
| 14 | Cross-Surface Consistency Guardian | Ensure every page uses the same disclosure patterns |
| 15 | User Scanning & Action Path Designer | Optimize the default view for the most common user journeys |
| 16 | 70% Reduction Validator & Metrics Lead | Define how we will measure and validate the 70%+ reduction target |

---

## Unified Output Schema (Every Agent Must Follow)

```markdown
# Agent [NN] — [Specialization] — Phase 1.1 Clutter Reduction Recommendations

**Agent:** [NN] — [Full Title]  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** [User-provided screenshot]  
**Target Reduction:** Minimum 70% clutter reduction on default view

---

## 1. Current Clutter Diagnosis

[Describe the main sources of clutter you see in the current default view. Be specific and brutal.]

**Estimated current clutter level:** X% (your assessment)

---

## 2. 70% Reduction Strategy

List your specific recommendations, grouped by disclosure method:

### 2.1 Move to Right-Side Drawer (Veil)
- Item 1 → Drawer
- Item 2 → Drawer
...

### 2.2 Move to Hover Cards / Previews
- ...

### 2.3 Move to Modals
- ...

### 2.4 Remove or Collapse Entirely
- ...

### 2.5 React Component Opportunities
- New or improved reusable components that would help achieve the reduction

---

## 3. Impact on Default View

Describe exactly what the default view should look like after your recommendations are implemented.

**Expected visual reduction:** __% (aim for 70%+)

**Before vs After summary** (use a simple table or clear description)

---

## 4. Glassmorphism Application (Veil Glass Rules)

How should glassmorphism be used in the new minimal system? (Especially inside the drawer/veil)

---

## 5. Risks & Trade-offs

What could go wrong if we follow these recommendations? What user needs might be impacted?

---

## 6. Dependencies on Other Agents

Which other agents’ work must align with yours for this to succeed?

---

## 7. Measurement & Validation Approach

How should Agent 16 (and the team) verify that we actually hit 70%+ reduction?

---

## 8. Phase 1.1 Exit Recommendation

What specific output or decision should come out of this agent’s work before we move to implementation?

```

---

## Execution Instructions

1. Deploy all 16 agents using the Master System Prompt + their individual specialization.
2. Each agent must analyze the current cluttered state (reference the provided screenshot).
3. All agents must coordinate (especially with 02, 03, 07, 14, and 16).
4. After all 16 complete, consolidate the outputs into a **Phase 1.1 Clutter Reduction Strategy Document**.
5. Use the outputs to heavily inform Phase 2 (Foundation) and the master codegen prompt.

---

## Relationship to the Overall 4-Phase Program

This Phase 1.1 sits between the original Phase 1 (direction setting) and Phase 2 (implementation). It is the critical "declutter surgery" step that ensures the V3 Veil Glass language actually delivers on its promise of being dramatically cleaner than the current state.

**Phase 1.1 is now an official, required part of the Darkmode_DesignzV3 program.**

---

**End of Phase 1.1 Prompt**

Use this prompt to launch the 16-agent team. The goal is ruthless, measurable decluttering.