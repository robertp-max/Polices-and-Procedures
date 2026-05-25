# Agent 09 — Visual Weight Reducer — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 09 — Visual Weight Reducer  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Current dense task execution view with heavy visual elements  
**Target Reduction:** 70%+ by reducing borders, colors, icons, spacing, and noise

---

## 1. Current Clutter Diagnosis

The view has too many competing visual elements: multiple teal accents, borders, icons, progress bars, cards with shadows, dense text, etc. This creates high visual weight even before the information density.

---

## 2. 70% Reduction Strategy

### 2.1 Move to Right-Side Veil Drawer
Most visual weight moves into the Veil (where richer treatment is allowed).

### 2.2 Move to Hover Cards / Previews
Use very light visual treatment on hover (minimal borders, soft icons).

### 2.3 Move to Modals
Modals can afford slightly more visual weight since they are temporary.

### 2.4 Remove or Collapse Entirely
- Remove most teal banners and decorative lines from the default list
- Reduce icon usage to only the most essential
- Use much tighter, consistent spacing (per V3 tokens)
- Eliminate redundant visual separators

### 2.5 React Component Opportunities
- `MinimalVisualTreatment` tokens and styles for list items
- Consistent icon scale (small by default)
- Remove heavy card shadows/borders on list level

---

## 3. Impact on Default View

The default list becomes very light and airy — exactly what "minimal dark" should feel like. Most visual richness lives only when the user opens the Veil.

This is one of the fastest ways to achieve the "70% less cluttered" feeling.

---

## 4. Glassmorphism Application (Veil Glass Rules)

Glass and richer visuals are reserved for the Veil Drawer and modals. The list stays flat, matte, and calm.

---

## 5. Risks & Trade-offs

- Risk: The list can feel "too plain" for some users → Mitigate with excellent typography and clear status colors (still minimal)
- Benefit: Much easier to scan quickly, which is the primary goal of the default view

---

## 6. Dependencies on Other Agents

- Agent 06: Minimal row design must use the reduced visual weight
- Agent 03: Veil can be visually richer (this is where glass and accents belong)

---

## 7. Measurement & Validation Approach

- Pixel visual weight analysis (before/after)
- User "how cluttered does this feel" rating (1-10)

---

## 8. Phase 1.1 Exit Recommendation

Define the official "V3 Minimal Visual Weight Guidelines" for all list-level components.

---

**Agent 09 Signature:** Phase 1.1 Execution — 2026-05-18

*This recommendation is ready to be included in the consolidated Phase 1.1 Clutter Reduction Strategy.*