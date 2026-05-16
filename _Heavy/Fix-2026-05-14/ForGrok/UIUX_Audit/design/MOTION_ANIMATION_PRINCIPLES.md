# Motion & Animation Principles — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Philosophy

Motion in the CareIndeed platform should feel **premium, calm, and purposeful** — never flashy or distracting.

The goal is to:
- Guide the user’s attention
- Communicate state changes clearly
- Reinforce the expensive, clinical, and professional brand
- Support operational clarity under time pressure

Motion should feel like a quiet, confident assistant — not a show.

---

## 2. Core Principles

### 2.1 Purpose Over Polish
Every animation must serve a clear functional purpose:
- Feedback (button press, toggle)
- Orientation (where something came from / went to)
- Hierarchy (what is most important right now)
- State communication (loading, success, error, blocked)

### 2.2 Calm & Restrained
- Avoid bouncy, playful, or overly elastic motion.
- Prefer subtle easing curves that feel sophisticated.
- Reduce motion on high-frequency actions (e.g., quick taps in signing flow).

### 2.3 Respect User Preferences
- Honor `prefers-reduced-motion`.
- Provide meaningful alternatives (instant state change, static indicators) when reduced motion is enabled.

### 2.4 Consistency
- Use the same timing and easing values across similar interactions.
- Build a small, reusable set of motion tokens instead of inventing new ones per screen.

---

## 3. Recommended Easing Curves

| Name              | Cubic Bezier              | Feel                  | Common Use Cases |
|-------------------|---------------------------|-----------------------|------------------|
| `ease-standard`   | `cubic-bezier(0.2, 0, 0, 1)` | Smooth, premium       | Most UI transitions |
| `ease-out`        | `cubic-bezier(0, 0, 0.2, 1)` | Natural deceleration  | Entering elements, expanding |
| `ease-in`         | `cubic-bezier(0.4, 0, 1, 1)` | Subtle acceleration   | Exiting elements |
| `ease-in-out`     | `cubic-bezier(0.4, 0, 0.2, 1)` | Balanced              | Page transitions, major state changes |
| `ease-sharp`      | `cubic-bezier(0.4, 0, 0.6, 1)` | Crisp, quick          | Button presses, toggles |

**Default recommendation:** Use `ease-standard` for most interactions.

---

## 4. Timing Guidelines

| Interaction Type               | Duration     | Notes |
|--------------------------------|--------------|-------|
| Micro-interactions (button press, toggle) | 120–180ms   | Should feel instant but polished |
| Card / surface elevation change | 200–280ms   | Layer 1 → Layer 2 transitions |
| Bottom sheet / modal entry     | 280–350ms   | Feels substantial but not slow |
| Page / major screen transition | 350–450ms   | Only for important navigation |
| Loading states / skeleton      | 800–1200ms  | Use shimmer or pulse, not full loops |
| Success / error feedback       | 300–400ms   | Clear but not lingering |

**Rule of thumb:** The more important the action, the slightly longer the motion (but never slow).

---

## 5. Common Patterns

### Button Press
- Scale: 0.985 → 1.0
- Duration: 120–150ms
- Easing: `ease-out`

### Card Elevation (Hover / Tap)
- Shadow increase + slight lift (2–4px)
- Duration: 200–250ms
- Easing: `ease-standard`

### Bottom Sheet / Modal Entry
- Slide up + fade in
- Duration: 300–350ms
- Easing: `ease-out`

### Status Change (e.g., Task moves from Pending → In Progress)
- Subtle color + icon change
- Duration: 250–300ms
- Consider a very light pulse on the status badge

### Loading / Skeleton
- Use a soft shimmer (gradient moving across the surface)
- Avoid aggressive flashing or spinning unless it’s a long operation

---

## 6. Motion Do’s and Don’ts

### ✅ Do
- Use motion to communicate **state and hierarchy**.
- Keep motion subtle on high-frequency actions (signing, evidence capture).
- Test motion on real devices, not just desktop.
- Reduce motion intensity on mobile compared to desktop.

### ❌ Don’t
- Use bouncy or springy animations (feels unprofessional).
- Animate too many elements at once on one screen.
- Make loading spinners the default for quick actions.
- Ignore `prefers-reduced-motion`.

---

## 7. Recommended Motion Tokens (for Engineering)

```json
{
  "motion": {
    "duration": {
      "micro": "150ms",
      "fast": "200ms",
      "standard": "280ms",
      "slow": "350ms"
    },
    "easing": {
      "standard": "cubic-bezier(0.2, 0, 0, 1)",
      "out": "cubic-bezier(0, 0, 0.2, 1)",
      "in": "cubic-bezier(0.4, 0, 1, 1)",
      "inOut": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  }
}
```

---

## 8. Future Work

- Define specific motion for eCign signing flow (very high-trust interaction).
- Define motion for evidence capture and photo upload.
- Create a small motion library in code (Framer Motion / React Native Reanimated tokens).

---

*Motion should support the work — not become the work.*