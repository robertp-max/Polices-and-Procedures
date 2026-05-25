# V3 Veil Glass Reference Package for Claude

This is the official, curated reference package for implementing the **V3 Veil Glass Design System** (Seamless Matte Slate-Carbon Theme) across the CareIndeed platform.

## Folder Organization

```
gemini/
├── README.md
├── 01_Visual_Reference/
│   └── V3_Dashboard_Reference.tsx          ← Full working V3 code (source of truth for visuals, behavior, and navigation structure)
├── 02_Design_System/
│   └── V3_Veil_Glass_Design_Specs.md       ← Authoritative design system (tokens, rules, multipage transitions)
├── 03_Implementation_Guide/
│   └── V3_Implementation_Specs.md          ← Migration phases and rollout guidance
├── 04_Claude_Instructions/
│   └── Claude_Master_Instructions.md       ← Start here — master prompt for Claude
└── 05_Navigation_Wiring/
    └── V3_Nav_Wiring_Template.md           ← Required deliverable — full sidebar endpoint wiring map
```

## How to Use With Claude

**Recommended workflow:**

1. Start a fresh Claude conversation.
2. Paste the full contents of `04_Claude_Instructions/Claude_Master_Instructions.md`
3. Attach your `APP_Screenshots.pdf` (the 36 reference images)
4. Give Claude the task.

Claude is explicitly instructed to handle **full navigation wiring** (all sidebar items and submenus) in addition to the visual design and transitions.  
A completed `V3_Nav_Wiring_Template.md` is a mandatory part of any serious implementation plan.

## What Claude Is Expected To Deliver

- Visual design system compliance (glass treatment, tokens, 33% borders, etc.)
- Polished, consistent multipage transition system applied to **every** view change
- Complete navigation alignment — the production sidebar must match the V3 structure from the reference code, with all endpoints properly wired to real routes

## Core Principles Enforced by This Package

- The app must feel like a **true multipage transition application**.
- Teal dominance with extremely restricted orange.
- 77.7% main glass card, 33% borders, invisible surfaces by default.
- All navigation endpoints must be wired and consistent with the V3 reference.

This package was prepared so Claude can deliver high-quality, consistent results without hallucinating new styles or leaving navigation half-wired.

Use it strictly. It works when followed.