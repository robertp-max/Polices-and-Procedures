# CareIndeed Home Health — Design System Specification (v2)

**Status:** Active Direction  
**Date:** May 2026  
**Focus:** Mobile-First + Desktop Enhanced, Premium Glassmorphic

---

## 1. Visual Direction (Locked)

**Primary / Strongest Aesthetic (v2 Base):**
- Deep, elegant dark glassmorphic (inspired by CES Board mobile + Evidence Center desktop)
- Navy + Charcoal base with subtle frosted depth
- Teal (#007970) and restrained warm orange accents
- Clean, modern, clinical, expensive, professional

**Secondary (Light Mode):**
- Soft light glassmorphic
- Very subtle hairline borders only (no hard/dark borders)
- Layered soft shadows + light background tints for separation
- Maintains the premium glass feeling while solving white-on-white issues

---

## 2. Glass Layering System (Strict Rule)

**Maximum of 3 glass layers** are allowed in the interface.

### Layer Definitions

| Layer | Name                          | Purpose                                      | Visual Treatment                                      | When to Use |
|-------|-------------------------------|----------------------------------------------|-------------------------------------------------------|-------------|
| **0** | Dark Atmospheric Background   | Deepest background layer                     | Dark navy/charcoal with subtle texture or gradient    | Page / screen background |
| **1** | Main App Surface              | Primary working surface                      | Frosted glass panel (main content area)               | Default surface for most screens |
| **2** | Elevated Actionable Surface   | Cards, dialogs, and focused components       | Slightly more opaque + stronger shadow / definition   | Task cards, forms, modals, bottom sheets, detail panels |
| **3** | Exception Layer               | Only when functionally necessary             | Highest elevation + strongest definition              | Rare cases only (e.g., floating action menus, critical multi-layer confirmations) |

### Desktop Main Surface Container Rule (Critical for Glassmorphism)

**On desktop (≥1024px), the main Layer 1 app surface must NEVER take up the full viewport width.**

To strongly enhance the premium glassmorphic effect:

- The Layer 1 main content area must be **constrained** with a reasonable `max-width` (recommended 1280px–1600px depending on content density).
- Horizontal margins/padding on the sides must be visible (minimum 32–48px on 1440px screens, more on larger displays).
- This allows the rich **Layer 0 atmospheric background** to show on the left, right, top, and bottom — creating beautiful depth and making the main glass surface feel like a distinct, elevated panel.

This rule is directly inspired by the current high-quality desktop implementations (see referenced Policy Library desktop view).

**Why this matters:**
- Full-bleed Layer 1 on desktop kills the glass feeling and makes the interface feel flat and heavy.
- Visible Layer 0 around the main surface is one of the strongest contributors to the "expensive, premium" perception.
- Cards (Layer 2) inside the constrained Layer 1 then get proper elevation contrast.

**Implementation guidance:**
- Use a centered container with `max-width` + `margin: 0 auto` + side padding for the main content area on desktop routes.
- Mobile and tablet remain closer to full-width (as they have less room for breathing room).

### Strict Rules

- **Layer 3 is not default.** It should only be used when it directly supports a critical function and cannot be solved with Layer 2.
- **Do not stack glass on glass endlessly.** Over-layering kills the premium, calm, and expensive feeling.
- In **light mode**, Layer 2 should rely more on stronger shadows and very subtle borders rather than heavy transparency.
- In **dark mode**, Layer 2 can use slightly more opacity and depth, but still stay elegant and soft.

**Philosophy**:  
The interface should feel like a calm, focused operating system — not a stack of floating windows.

---

## 3. Key Rules

- **No hard or dark borders** in light mode (breaks the glass aesthetic).
- Light mode separation comes from: soft shadows, subtle background differentiation, typography weight, and restrained accent usage.
- Dark mode can use slightly stronger definition but still elegant and soft.
- Every screen must feel like part of the same premium compliance operating system.
- **Maximum 3 glass layers** (Layer 0, 1, 2). Layer 3 only by exception.

---

## 4. Current v2 Mockup Status

v2 mockups are being generated in:
- `mockup/Mobile/v2/`
- `mockup/Desktop/v2/`

**Already delivered in v2 (as of now):**
- Dashboard (Mobile + Desktop)
- CES Board (Mobile + Desktop)
- Policy Detail (Mobile + Desktop)
- eCign Signing (Mobile + Desktop)
- Onboarding Batch View (Mobile + Desktop)
- Onboarding Activation (Mobile + Desktop)
- Onboarding Dashboard (Desktop)
- Evidence Capture (Mobile + Desktop)
- Evidence List (Mobile)
- CES Task Detail (Mobile)
- CES My Tasks (Desktop)
- CES Reports (Mobile + Desktop)
- Audit Readiness (Mobile)
- Policies Library (Mobile + Desktop)
- Policy Search (Mobile)

**Next in queue (prioritized):**
1. CES Calendar – Mobile (Light v2)
2. CES Calendar – Desktop (Light v2)
3. Journey Home / Module List – Mobile (Light v2)
4. Journey Home / Module List – Desktop (Light v2)
5. Journey Module Player – Mobile (Light v2)
6. Journey Module Player – Desktop (Light v2)

---

## 5. Notes

- All future mockups should follow the v2 aesthetic and the **3-layer glass rule**.
- Vary layouts per screen type (do not make every page look identical).
- Pull good elements from previous successful designs (typography, card treatment, spacing, accent usage).
- Keep the feeling expensive, clean, modern, clinical, and professional.

---

*This document will be updated as the v2 direction evolves.*