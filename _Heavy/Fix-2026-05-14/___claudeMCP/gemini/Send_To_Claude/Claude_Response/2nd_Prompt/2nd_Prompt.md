# 2nd Prompt to Claude (After Confirmation)

You have already confirmed that you have read and understood all the reference materials in the WH folder, including:

- README.md
- V3_Dashboard_Reference.tsx
- V3_Veil_Glass_Design_Specs.md
- V3_Implementation_Specs.md
- Claude_Master_Instructions.md
- V3_Nav_Wiring_Template.md
- The PDF file named `APP_Screenshots.pdf` (36 pages)
- All the latest screenshots in the WH folder (including the May 19 batch, starting with `Screenshot 2026-05-19 235402.png`)

You also confirmed you understand the two critical non-negotiable requirements:
1. Every single page view change across the entire application must use polished, clean, smooth, cohesive, and consistent multipage transitions.
2. Full sidebar navigation wiring is mandatory, and a completed Navigation Wiring Template is a required deliverable.

---

Now deliver the complete V3 Veil Glass Design System.

Work in this exact order and be exhaustive:

### 1. Completed Navigation Wiring Template
Fully complete the `V3_Nav_Wiring_Template.md` file.

- Use the exact navigation structure from `V3_Dashboard_Reference.tsx` as the source of truth.
- Map every nav item (including all submenus) to real production routes and components.
- For each item, provide:
  - Target Route
  - Target Page / Component
  - Status (Exists / Needs Update / Needs Creation)
  - Notes (including how the V3 transparent sidebar, collapsible submenus, and interrupted vertical divider will behave)
- Add a short section explaining how the navigation will be maintained as a single source of truth in the real application.

### 2. Full V3 Veil Glass Design System Documentation
Create a complete, production-ready design system document that covers:

- Visual tokens and rules (base colors, glass treatment, borders, typography)
- The 77.7% main glass card contract
- Component patterns (invisible vs bordered surfaces)
- The complete Multipage Transition System (exact specifications, easing, durations, and where it must be applied)
- Polish and consistency rules

Use the latest screenshots from the WH folder (especially the May 19 ones) as the current visual standard.

### 3. Implementation & Migration Plan
Provide a clear, phased plan to bring the entire application to V3 Veil Glass, including:

- How to integrate the design system into the existing shell architecture
- How to implement the global multipage transition system across all pages
- How to wire and maintain the full V3 navigation structure
- Recommended migration sequence across different sections of the app
- Testing and consistency checklist

---

**Strict Instructions:**
- Be exhaustive. Do not summarize or skip sections.
- Prioritize the latest screenshots from the WH folder as the visual reference.
- Treat the completed Navigation Wiring Template as the most important deliverable.
- Output everything in a clean, well-structured format that can be directly used.

Begin now and deliver all three sections.