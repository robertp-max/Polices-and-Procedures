# Stabilization 32-Agent Allocation & Task Distribution Plan

**Purpose:** This document provides a practical plan for dividing the 46 detailed Stabilization tasks across the available 32 agents (16 Grok 4.3 + 16 Claude Sonnet 4.6 or lower) over the 3-week period.

**Important:**  
This plan is for the **Stabilization Precursor Phase only**. It runs in parallel with the main UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN and must not overlap with it. The MVP implementation is being rushed for next week, while Stabilization follows a deliberate, non-rushed 3-week timeline.

**Available Resources:**  
- 16 Grok 4.3 agents  
- 16 Claude Sonnet 4.6 (or lower) agents  
- **Total:** 32 agents  
- **Note:** No additional Claude Opus 4.7 agents.

---

## 1. Agent Allocation Strategy

### Guiding Principles
- Assign agents based on **effectiveness** rather than a strict 1:1 Grok:Claude ratio.
- Use a mix of Grok and Claude on complex or high-risk workstreams for cross-validation.
- Heavy parallelization is encouraged, especially in Week 1.
- Some agents can shift between workstreams as tasks complete.
- A small number of agents can be reserved for coordination and validation.

### Recommended Overall Allocation (Flexible)

| Workstream                              | Suggested Agents | Grok Agents | Claude Agents | Focus Area |
|-----------------------------------------|------------------|-------------|---------------|------------|
| Navigation & History Stability          | 6–8              | 3–4         | 3–4           | High parallelization |
| Runtime & Session Resilience            | 7–9              | 3–4         | 4–5           | Complex state management |
| Mobile & Field Survivability            | 7–9              | 3–4         | 4–5           | Testing + validation heavy |
| Protected Systems & Rollback Readiness  | 4–6              | 2–3         | 2–3           | Governance + documentation |
| Design System Guardrails                | 4–5              | 2–3         | 2             | Rules + enforcement |
| Validation & Governance Infrastructure  | 4–5              | 2           | 2–3           | Planning + coordination |

**Total:** 32 agents (adjustable based on daily progress)

---

## 2. 3-Week Phased Allocation

### Week 1 – Foundation & High-Impact Fixes (Most Agents)

**Focus:** Quick wins that have the highest immediate impact on making the app stable and professional for next week’s training.

**Suggested Agent Split:** 20–24 agents

**Recommended Tasks (from STABILIZATION_DETAILED_TASK_BREAKDOWN.md):**
- N-01, N-02, N-03, N-04, N-05 (Navigation)
- R-01, R-02, R-03, R-04 (Runtime)
- D-01, D-02 (Design System)
- P-01, P-02, P-03, P-04 (Protected Systems)
- V-01, V-02, V-03, V-04 (Validation & Governance)

**Agent Allocation Suggestion:**
- Navigation workstream: 6–8 agents
- Runtime workstream: 6–8 agents
- Governance & Design System: 6–8 agents

---

### Week 2 – Mobile, Protected Systems & Rollback

**Focus:** Deeper mobile validation and rollback capability.

**Suggested Agent Split:** 16–20 agents

**Recommended Tasks:**
- M-01 to M-08 (All Mobile tasks)
- P-05, P-06, P-07 (Rollback drills & boundaries)
- R-05, R-06, R-07 (Advanced runtime)
- D-03, D-04 (Design System continuation)

**Agent Allocation Suggestion:**
- Mobile workstream: 8–10 agents (heaviest testing load)
- Protected Systems + Rollback: 4–6 agents
- Remaining runtime & design system: 4–6 agents

---

### Week 3 – Advanced Hardening & Final Governance

**Focus:** Complete remaining items and prepare for handoff to the main MVP implementation.

**Suggested Agent Split:** 10–16 agents

**Recommended Tasks:**
- R-08, M-08 (Final runtime & mobile items)
- V-05 to V-08 (Final validation & Go/No-Go)
- D-05, D-06 (Final design system items)
- Any remaining P2 tasks

**Agent Allocation Suggestion:**
- Validation & Governance: 5–6 agents
- Remaining workstreams: 5–10 agents (based on what is left)

---

## 3. Agent Type Recommendations

- **Grok 4.3 agents**: Good for fast execution, code changes, and straightforward implementation tasks.
- **Claude Sonnet 4.6 agents**: Strong for careful analysis, documentation, validation planning, and complex reasoning tasks.
- **Mix on high-risk items**: For Protected Systems, eCign, Evidence, and CES identity work, assign at least one Grok and one Claude to the same task when possible.

**Note:** Assignment should be based on effectiveness and workload, not a strict 1:1 ratio. Adjust daily based on progress.

---

## 4. Coordination Recommendations

- Designate 1–2 agents (or a human lead) each day for **coordination and blocker escalation**.
- Use a shared tracking board (Notion, Linear, or spreadsheet) with columns for:
  - Task ID
  - Status (Not Started / In Progress / Blocked / Completed)
  - Assigned Agent(s)
  - Dependencies Met?
- At the end of each day, run a quick status sync (can be handled by 1–2 coordination agents).

---

## 5. Daily Execution Tips

- Start each day by having agents complete the **Daily Agent Checklist** from the Master Prompt.
- Prioritize tasks that unblock other high-priority items.
- If a task is blocked, reassign agents to other ready tasks instead of waiting.
- Keep a running “Ready for Next Week” list of items that must be complete before training starts.

---

**Document Status:** Living. Will be updated based on actual progress and agent availability.

---

*This plan is designed to give you maximum flexibility while ensuring the Stabilization phase supports the Unified MVP at 90–100% success without being unnecessarily rushed.*