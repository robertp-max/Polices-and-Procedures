# Phase 2.1 — Claude Foundation Build Package

**Location:** `_ClaudePhase2.1/`  
**Purpose:** Self-contained documentation package for Claude to implement the complete V3 Veil Glass foundation.

---

## Documents in This Folder

| File | Purpose |
|------|---------|
| `Phase2.1_Claude_Foundation_Build_Prompt.md` | **Primary prompt** — Feed this to Claude first. Contains build order, rules, and instructions. |
| `V3_Veil_Glass_Theme_Tokens_Spec.md` | Full visual language + strengthened glassmorphism (v1.1) + merged nav with broken lines. |
| `V3_Veil_Drawer_Behavior_Spec.md` | Exact Veil behavior contract, two-layer model, non-stacking, shell rules (v1.1). |
| `Phase2_Core_Primitives_Spec.md` | Detailed React component contracts (`VeilDrawer`, `TaskRowMinimal`, etc.). |
| `Phase2_V3_Foundation_Implementation_Plan.md` | Overall Phase 2 strategy and exit gates. |
| `Phase2_Entry_Checklist.md` | Pre-build checklist and recommended 3-week timeline. |
| `V3_4Phase_Implementation_Roadmap.md` | Full program context (shows Phase 1 + 1.1 are complete). |

---

## How to Use This Package

1. Give Claude the **entire contents** of this folder.
2. Start with the file `Phase2.1_Claude_Foundation_Build_Prompt.md`.
3. Claude should read all specs before writing any code.
4. Follow the strict build order defined in the master prompt.

---

## Latest Refinements Included (v1.1)

- Stronger glassmorphism on the Veil (22px blur, richer frost)
- Left nav + logo **merged** into the main container
- Separation via **broken/interrupted lines** (no solid borders)
- "Hide the Veil as much as possible" principle reinforced

---

**This package is ready for Claude to begin Phase 2.1 foundation work.**