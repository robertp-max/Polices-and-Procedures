# Motion Token Implementation Guide — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Audience:** Engineering

---

## 1. Purpose

This document provides the recommended implementation of motion tokens in code (React / React Native).

---

## 2. Motion Tokens

### Duration

| Token                    | Value   | Usage |
|--------------------------|---------|-------|
| `--motion-duration-micro`    | 150ms   | Button presses, toggles |
| `--motion-duration-fast`     | 200ms   | Card elevation, small transitions |
| `--motion-duration-standard` | 280ms   | Bottom sheets, modals, major state changes |
| `--motion-duration-slow`     | 350ms   | Page transitions, important animations |

### Easing

| Token                    | Cubic Bezier                  | Usage |
|--------------------------|-------------------------------|-------|
| `--motion-easing-standard`   | `cubic-bezier(0.2, 0, 0, 1)`  | Most UI transitions |
| `--motion-easing-out`        | `cubic-bezier(0, 0, 0.2, 1)`  | Elements entering |
| `--motion-easing-in`         | `cubic-bezier(0.4, 0, 1, 1)`  | Elements exiting |
| `--motion-easing-in-out`     | `cubic-bezier(0.4, 0, 0.2, 1)`| Balanced transitions |

---

## 3. React Example (Web)

```tsx
const buttonTransition = {
  transition: `transform var(--motion-duration-micro) var(--motion-easing-out)`,
};

const cardTransition = {
  transition: `box-shadow var(--motion-duration-fast) var(--motion-easing-standard), transform var(--motion-duration-fast) var(--motion-easing-standard)`,
};
```

---

## 4. React Native Example

```tsx
const buttonStyle = {
  transition: {
    duration: 150,
    easing: Easing.out(Easing.ease),
  },
};
```

---

## 5. Best Practices

- Always respect `prefers-reduced-motion`.
- Use the same tokens across web and mobile for consistency.
- Avoid custom easing curves unless justified.

---

*Motion should feel invisible but intentional.*