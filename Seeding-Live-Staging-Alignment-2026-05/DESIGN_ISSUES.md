# V3 Design Issues — Identified 2026-05-21

## Source: User feedback on live screenshots of CES Calendar and harness pages

---

## Issue 1: 3D / Depth Effects
**Problem:** Elements use `translateY`, `scale`, `box-shadow` changes, or gradient backgrounds that simulate raised cards. This violates the V3 flat-glass philosophy.
**Where found:** `.v3-invisible-glare` CSS class was forcing gradient backgrounds + visible borders via a `.v3-staging-page` override. Some buttons used translateY hover effects.
**Fix:** Remove all depth-simulating transforms. Hover = opacity/color only. No shadows, no elevation.

## Issue 2: Unnecessary Boxing
**Problem:** Individual stats, metadata values, list items, and settings entries are each wrapped in their own bordered container (border + borderRadius + background). This creates visual noise, makes the app look "dirty and cluttered."
**Where found:**
- `StatBox` component wrapping single numbers in bordered cards
- Admin settings items in individual glass2 cards with borders
- Audit log entries each in their own bordered card
- Filter buttons in pill-shaped bordered containers
- Sprint metric KPIs in 4-column grid of bordered cards
- Tab containers using glass2 background + border as pill bars
**Fix:** Use white space, alignment, and typography weight for hierarchy. Stats are inline `value + label`. List items separated by subtle bottom borders (rgba 0.04), no per-item containers.

## Issue 3: Redundant Lists
**Problem:** Information already conveyed by the parent context is re-listed in child panels (e.g., process flow steps that just mirror the event title's workflow).
**Where found:** Detail drawer "Process Flow" tab listing the same execution units visible from the calendar. Overview tab showing stats that are already in the header metrics bar.
**Fix:** Every rendered element must earn its space. If a list adds no new information beyond what the parent already shows, remove it or collapse it into a single summary line.

## Issue 4: Rainbow Colors for States
**Problem:** Using red (#F87171), green (#4ADE80), amber (#FBBF24) for severity/status when V3 specifies teal as the singular truth for ALL state indicators.
**Where found:** Audit log severity dots using red/amber/green. Status badges using colored backgrounds.
**Fix:** All states use teal (#00D1C1) at varying opacities. Severity is communicated through text labels, not color.

---

## Guiding Principles (Permanent)

1. **Flat.** No depth simulation. The glass illusion = opacity + blur, never fake elevation.
2. **No gratuitous containers.** A border earns its existence by grouping semantically distinct sections. A single value does not need a box.
3. **No redundant information.** If the parent conveys it, the child doesn't repeat it.
4. **White space is the organizer.** Spacing, alignment, and font weight create hierarchy.
5. **Teal is truth.** States, progress, activity — all teal at varying opacities. No color rainbow.
6. **Orange is only for section micro-labels.** No glowing text-shadow (flat = no glow).
