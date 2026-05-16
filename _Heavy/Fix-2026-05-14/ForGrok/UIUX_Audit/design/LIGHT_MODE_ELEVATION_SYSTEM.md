# Light Mode Elevation & Contrast System
**CareIndeed Home Health Platform**

**Last Updated:** May 2026

---

## 1. Objective

Solve the "white on white" and low visual separation problem in light mode **while preserving the premium glassmorphic aesthetic**.

The goal is to create clear hierarchy and depth in light mode without using hard or dark borders, which break the soft, frosted glass feeling that defines the Care Indeed visual language.

---

## 2. Glass Layering System (Strict Rule)

**Maximum of 3 glass layers** are allowed.

### Layer Definitions

| Layer | Name                          | Purpose                                      | Visual Treatment                                      | When to Use |
|-------|-------------------------------|----------------------------------------------|-------------------------------------------------------|-------------|
| **0** | Dark Atmospheric Background   | Deepest background layer                     | Dark navy/charcoal with subtle texture or gradient    | Page / screen background |
| **1** | Main App Surface              | Primary working surface                      | Frosted glass panel (main content area)               | Default surface for most screens |
| **2** | Elevated Actionable Surface   | Cards, dialogs, and focused components       | Slightly more opaque + stronger shadow / definition   | Task cards, forms, modals, bottom sheets, detail panels |
| **3** | Exception Layer               | Only when functionally necessary             | Highest elevation + strongest definition              | Rare cases only (e.g. critical floating actions or multi-layer confirmations) |

**Strict Rules:**
- Layer 3 is **not** default. It should only be used when it directly supports a critical function and cannot be solved cleanly with Layer 2.
- Do not stack glass endlessly. Over-layering kills the premium, calm, and expensive feeling.
- In light mode, Layer 2 should rely more on stronger soft shadows and very subtle borders rather than heavy transparency.

---

## 3. Core Principle for Light Mode

**Avoid strong/dark borders in light mode.**

Hard borders (especially dark or high-contrast ones) destroy the elegant, soft glassmorphic quality. Instead, we achieve separation and elevation through a combination of:

- Very subtle, soft hairline borders (`#E5E4E3` range)
- Layered and stronger shadows
- Slight background differentiation / tints
- Typography hierarchy
- Strategic use of teal and orange accents

---

## 4. Recommended Elevation Methods (Light Mode)

### Preferred Order

| Method                    | How to Apply                                      | Strength | Notes |
|---------------------------|---------------------------------------------------|----------|-------|
| **Shadow Elevation**      | Use layered, soft shadows (multiple shadow values) | High     | Most important tool in light mode |
| **Background Tint**       | Use very light cool gray tints (`#F8FAFC`, `#F1F5F9`) for secondary surfaces | Medium   | Helps create subtle depth |
| **Soft Hairline Borders** | Use extremely subtle borders (`#E5E4E3` or `#E8E6E3`) | Low-Medium | Should feel almost invisible |
| **Typography & Weight**   | Stronger heading weights and better spacing       | Medium   | Creates visual separation without lines |
| **Accent Color**          | Use teal/orange sparingly to draw attention       | Medium   | Great for CTAs and status |

### Border Rules (Light Mode)

- **Never use dark or high-contrast borders** in light mode.
- Recommended border color: `#E5E4E3` or `#E8E6E3` (very soft warm gray).
- Border should feel like a gentle definition rather than a hard line.
- For most cards, a border is optional if shadow elevation is strong enough.

**Bad Practice:**
- Dark gray or black borders (`#64748B`, `#475569`, etc.)
- High contrast borders that cut through the glass effect

**Good Practice:**
- Extremely soft borders that almost disappear
- Rely primarily on shadow + background tint for separation

---

## 5. Recommended Elevation Scale (Aligned with 3-Layer System)

| Elevation | Background     | Border (Soft)   | Shadow                                      | Layer | Usage |
|-----------|----------------|------------------|---------------------------------------------|-------|-------|
| 0         | `#F8FAFC`      | None             | None                                        | 0     | Page background |
| 1         | `#FFFFFF`      | `#E8E6E3` (optional) | `0 1px 3px rgba(0,0,0,0.06)`               | 1     | Basic list items |
| 2         | `#FFFFFF`      | `#E5E4E3`        | `0 4px 12px rgba(15,23,42,0.08)`            | 1–2   | Primary cards (Tasks, Evidence, Policy) |
| 3         | `#FFFFFF`      | `#E5E4E3`        | `0 8px 24px rgba(15,23,42,0.10) + 0 2px 4px rgba(15,23,42,0.06)` | 2     | Modals, bottom sheets, important panels |
| 4         | `#F1F5F9`      | `#E5E4E3`        | `0 12px 32px rgba(15,23,42,0.12)`           | 3     | Highest elevation surfaces (rare) |

**Note:** Background can stay pure white (`#FFFFFF`) for main cards. Use very light tints (`#F1F5F9`) only for clearly nested or secondary surfaces.

---

## 6. Glassmorphism Usage in Light Mode

- Light mode glass should remain **soft and elegant**.
- Backdrop blur is still allowed, but should be paired with very subtle borders.
- Heavy transparency (below 70% opacity) often causes blending — consider using 80–85% opacity glass panels when blur is applied.
- Respect the 3-layer limit strictly.

---

## 7. Summary of Rules

**Do:**
- Use soft, almost invisible borders (`#E5E4E3` range)
- Use layered, soft shadows for elevation
- Use very light background tints for secondary surfaces
- Rely on typography weight and spacing for hierarchy
- Use teal and orange strategically for focus
- Limit glass layers to a maximum of 3 (Layer 3 only when functionally necessary)

**Don't:**
- Use dark, high-contrast, or black borders in light mode
- Over-rely on transparency (causes white-on-white blending)
- Make all cards the exact same elevation
- Use strong borders as the primary separation method
- Stack glass beyond Layer 2 without strong justification

---

## 8. Affected Areas (Current State)

These screens were previously noted as having contrast issues in light mode and should be reviewed against the new 3-layer + soft elevation rules:

- CES My Tasks
- Policy Search
- Policy Appendices
- CES Workloads
- Onboarding V2 batch views (light mode)

---

**Document Owner:** Grok  
**Related Files:**
- `DESIGN_SPEC.md` (main spec)
- `LIGHT_MODE_ELEVATION_SYSTEM.md` (this file)

---

*This document aligns with the v2 direction: Care Indeed as the single canonical brand, strict 3-layer glass system, and soft elevation in light mode.*