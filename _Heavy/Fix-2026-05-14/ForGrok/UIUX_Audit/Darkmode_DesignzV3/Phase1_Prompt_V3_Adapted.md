# PHASE 1 — 16-Agent Coordinated V3 Dark Mode Design Application Specification
**Project:** Darkmode_DesignzV3 — Care Indeed Home Health UI/UX v3 Glassmorphic Dark Mode First
**Location:** This folder
**Date:** 2026-05-18+
**Visual North Star (V3):** 
- `mockup/v3/V3_MOCKUP_DESIGN_SPEC.md` (authoritative rules)
- `mockup/v3/Dashboard_v3_Floating_Cards.jpg` (dark mode reference — floating glass cards, strong 4-sided borders, 3-layer max, teal + warm orange accents on deep navy)
- `mockup/v3/Dashboard_v3_Light_Dark.jpg` (paired light mode for consistency)
- Supporting references: strongest v2 Top Picks and Desktop/v2 that show premium glass (but adapted to new floating-card + visible border language)

**Governing Documents:** `mockup/v3/V3_MOCKUP_DESIGN_SPEC.md`, `design/DARK_VS_LIGHT_MODE_GUIDE.md`, existing tokens + primitives, current `src/` implementation, `16_AGENT_COORDINATED_FRONTEND_INTEGRATION_PLAN.md` (for agent ownership)

---

## Key V3 Differences from Previous Waves (Critical for All Agents)

From V3_MOCKUP_DESIGN_SPEC.md:
- Primary aesthetic is **floating individual glass cards** with clear visible borders on all 4 sides over a deep atmospheric background.
- Max **3 layers** (Layer 0 backdrop, Layer 1 main surfaces, Layer 2 elevated floating cards).
- No giant single glass container wrapping everything.
- Strong emphasis on **dark mode first** — premium, calm, clinical-grade dark glass.
- Light mode must match the same card language and spacing but feel soft/clean.
- Every card must "float" with breathing room from siblings and from the frame.
- Navigation rail + top bar must integrate without breaking the glass language.

The old single `ShellContentFrame` + inset breathing room philosophy must evolve to support floating card compositions while still providing the luminous depth.

---

## Master System Prompt for V3 Agents (use this for all 16 launches)

```
You are Agent [NN] — [Specialization Name] in the Care Indeed Darkmode_DesignzV3 16-Agent Program.

You are one node in a tightly-coupled 16-agent system whose sole mission in Phase 1 is to produce COMPLETE, CONSISTENT, CLAUDE-READY "How to Apply the V3 Dark Mode Floating-Card Design Language" specifications for your assigned surfaces.

The end goal (3 phases) is a single massive prompt that lets Claude (or equivalent) generate the full updated frontend code matching the V3 design (dark primary) with all data contracts and endpoints.

**V3 North Star (read these first):**
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/mockup/v3/V3_MOCKUP_DESIGN_SPEC.md` — the strict rules (floating cards, 3 layers, 4-sided visible borders, no full-bleed, dark-first).
- `mockup/v3/Dashboard_v3_Floating_Cards.jpg` (primary dark reference)
- `mockup/v3/Dashboard_v3_Light_Dark.jpg` (light pairing)
- `design/DARK_VS_LIGHT_MODE_GUIDE.md`

You must read current implementation of your surfaces, the V3 spec, the two V3 images (via multimodal read), relevant design/ docs, and tokens.

**Non-negotiable for this V3 run:**
- Every recommendation must produce the "floating card with strong visible borders" aesthetic shown in the V3 dark mock.
- Dark mode is the primary target; light mode is the paired variant that must feel equally premium.
- You must explicitly call out how the old single-frame ShellContentFrame / inset approach must be evolved or supplemented with floating card compositions.
- Endpoint and data contract section remains mandatory and detailed.

Use the exact Unified Output Schema from the original Phase1_Prompt.md (the long one in this folder), but replace all references to the old Pinterest with the V3 local files and "floating card + visible 4-sided border" language.

Begin your response with the certification sentence adapted for V3.

Output only the structured spec.
```

---

## Execution Plan for This Folder

1. Launch 16 agents using the V3-adapted master + per-agent specialization (surfaces same as the 16-agent plan, but all analysis through V3 floating-card dark lens).
2. Save each as `Agent_XX_V3_Phase1_DesignSpec.md` in this folder.
3. After all 16, produce `V3_Phase1_Master_Spec.md` (concatenated + endpoint inventory) and `V3_Phase1_Exit_Report.md`.

All outputs live in:
`c:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Darkmode_DesignzV3\`

---

**Next action:** I am now launching the first batch of agents (01 Glass/Layering V3, 02 Borders V3, 03 Tokens V3, 05 Dashboard V3 reference) using the spawn_subagent tool with the V3 prompt.

The full 16 will be completed across turns and all files written to this exact folder.
