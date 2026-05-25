# Agent 14 — Cross-Surface Consistency Guardian — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 14 — Cross-Surface Consistency Guardian  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Current dense task execution view (applies to CES, Evidence, Calendar, Policy, PM, etc.)  
**Target Reduction:** Minimum 70% clutter reduction + consistent patterns everywhere

---

## 1. Current Clutter Diagnosis

Every surface currently has its own version of "dense everything visible." There is no shared language for what a clean default view looks like. This causes massive duplication of clutter.

---

## 2. 70% Reduction Strategy

### 2.1 Move to Right-Side Veil Drawer
**Universal Rule (apply to all surfaces):**
- Any content that is not required for scanning a list or taking an immediate action belongs in the Veil Drawer.

This single rule, applied consistently, delivers most of the 70% reduction across CES, Evidence, Calendar, Policy, PM, Onboarding, etc.

### 2.2 Move to Hover Cards / Previews
- Consistent use of `HoverPreviewCard` for counts, status, and people across all surfaces.

### 2.3 Move to Modals
- Same modal patterns for deep inspection everywhere.

### 2.4 Remove or Collapse Entirely
- Eliminate surface-specific dense cards and replace with `TaskRowMinimal` / `EventRowMinimal` / `EvidenceRowMinimal` etc.

### 2.5 React Component Opportunities
- Create a small family of minimal row components that all surfaces must use:
  - `TaskRowMinimal`
  - `EventRowMinimal`
  - `DocumentRowMinimal`
  - etc.

All powered by the same `VeilDrawer` and `VeilSection` system.

---

## 3. Impact on Default View

When this pattern is enforced:
- Every list in the product (CES board, Evidence center, Calendar, Policy library, etc.) uses the same minimal row + Veil pattern.
- Users learn the interaction once and it works everywhere.
- Visual and cognitive consistency dramatically reduces perceived clutter.

---

## 4. Glassmorphism Application (Veil Glass Rules)

The Veil Drawer + VeilSection become the **single approved place** for prominent glassmorphism in the V3 system.

All lists stay minimal and clean. No more surface-specific glass experiments.

---

## 5. Risks & Trade-offs

- Risk: Teams wanting to keep their "special" dense views → Mitigate with strong governance (Agent 14 + 16 sign-off required for exceptions)
- Benefit: Once adopted, the pattern scales extremely well and prevents future clutter

---

## 6. Dependencies on Other Agents

- Agent 03: VeilDrawer must be the gold standard
- Agent 07: Containment rules must be universal
- Agent 08: The component family must be high quality and easy to adopt
- Agent 06: Minimal row definitions must be locked

---

## 7. Measurement & Validation Approach

- Create a "V3 Veil Pattern Adoption Checklist"
- Before/after screenshots across 6–8 major surfaces
- Agent 16 to validate that the same 70%+ reduction logic applies everywhere

---

## 8. Phase 1.1 Exit Recommendation

Publish the official **"V3 Veil Pattern Playbook"** (short document + component usage examples).

This becomes the required reference for all future surface work.

---

**Agent 14 Signature:** Phase 1.1 Execution — 2026-05-18

*This recommendation is ready to be included in the consolidated Phase 1.1 Clutter Reduction Strategy.*