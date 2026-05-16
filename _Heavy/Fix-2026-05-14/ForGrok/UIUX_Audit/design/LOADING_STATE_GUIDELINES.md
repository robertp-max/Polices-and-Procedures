# Loading State Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Philosophy

Loading states exist to **reduce perceived wait time** and **maintain trust**.

In a compliance platform, long or confusing loading states create anxiety ("Is the signature going through?"). Every loading state must feel calm, purposeful, and transparent.

---

## 2. Three Levels of Loading

### Level 1 — Immediate / Skeleton (Preferred for most views)

- Use skeleton loaders that match the final layout.
- Never show a generic spinner for complex pages.
- Skeleton should feel like the content is "coming into focus."

**Recommended for:**
- CES Board
- Policy Library
- Evidence Center list
- Onboarding V2 batch list

### Level 2 — Inline / Component Level

- Small, subtle spinner or progress indicator inside a card or button.
- Use for form submissions, evidence upload, signature capture.

**Rules:**
- Must include `role="status"` + `aria-live="polite"`
- Text should be meaningful ("Uploading evidence…", "Verifying signature…")

### Level 3 — Full Screen / Critical Action

- Used only for high-stakes actions (final signature lock, batch activation, large PDF generation).
- Must show clear progress when possible.
- Must show what is happening ("Finalizing eCign packet and generating certificate…").

---

## 3. Visual Treatment

- **Primary spinner color:** Teal (`--color-brand-teal`)
- **Accent / progress:** Restrained Orange only for long-running critical actions
- Never use bright cyan or legacy CI-ION colors.
- Respect `prefers-reduced-motion` — reduce or remove animation when requested.

**Glass integration:**
- Loading states should feel like they belong on the same Layer 1 or Layer 2 glass surface.
- Avoid hard white boxes on dark mode.

---

## 4. Timing Guidelines

| Duration       | Recommended Treatment                  | Example |
|----------------|----------------------------------------|-------|
| < 300ms        | None (instant)                         | Button click feedback |
| 300ms – 1.2s   | Subtle inline spinner or skeleton      | Filtering a list |
| 1.2s – 4s      | Skeleton or meaningful progress        | Loading CES board |
| 4s – 12s       | Progress indicator + helpful text      | Generating large PDF / signing packet |
| > 12s          | Explicit message + estimated time      | Large evidence batch processing |

---

## 5. Do’s and Don’ts

**✅ Do**
- Show what is happening when the action is important
- Use skeletons for list and card views
- Provide meaningful microcopy during long operations
- Allow cancellation for non-critical long operations when possible

**❌ Don’t**
- Show a generic spinner with no context for more than 2 seconds
- Use different spinner styles across the app
- Block the entire interface for minor actions
- Forget reduced-motion support

---

## 6. Component Ownership

- Canonical loading primitives should live in `ui/Loading*`
- Every surface (CES, eCign, Onboarding V2, Evidence, Policy) must use the same primitives
- Custom loaders are only allowed for truly unique situations and must be reviewed

---

## 7. Accessibility Requirements

- All loading indicators must be announced to screen readers
- Long operations must communicate progress (even approximate)
- Never trap focus during loading unless it is a modal critical action

---

*Good loading states make the system feel fast and trustworthy even when the network is slow.*

---

**Next:** Integrate skeleton loaders into CES Board and Evidence Center as part of Phase 2 Mobile Shell work.