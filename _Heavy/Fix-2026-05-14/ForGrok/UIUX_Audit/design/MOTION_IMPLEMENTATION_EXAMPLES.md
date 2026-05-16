# Motion Implementation Examples — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document provides concrete code examples for implementing the motion tokens defined in `MOTION_ANIMATION_PRINCIPLES.md` and `DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md`.

---

## 2. Core Motion Tokens (Recap)

```ts
// Example token values
const motion = {
  duration: {
    fast: '120ms',
    standard: '220ms',
    slow: '320ms',
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }
};
```

---

## 3. React (Web) Examples

### Button Press Feedback
```tsx
const buttonStyle = {
  transition: `transform var(--ci-motion-duration-fast) var(--ci-motion-easing-standard)`,
};

<button
  style={buttonStyle}
  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
>
  Sign & Lock
</button>
```

### Card Hover Lift
```tsx
const cardStyle = {
  transition: `
    transform var(--ci-motion-duration-standard) var(--ci-motion-easing-standard),
    box-shadow var(--ci-motion-duration-standard) var(--ci-motion-easing-standard)
  `,
};

<Card
  style={cardStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = 'var(--ci-shadow-elevation-2-light)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'var(--ci-shadow-elevation-1)';
  }}
>
  Content
</Card>
```

### Modal / Bottom Sheet Entrance
```tsx
const sheetVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.22, 
      ease: [0.4, 0, 0.2, 1] 
    } 
  }
};
```

---

## 4. React Native Examples

### Button Press
```tsx
import { Pressable, Animated } from 'react-native';

const scale = new Animated.Value(1);

<Pressable
  onPressIn={() => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }}
  onPressOut={() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }}
>
  <Animated.View style={{ transform: [{ scale }] }}>
    <Text>Mark Complete</Text>
  </Animated.View>
</Pressable>
```

### Bottom Sheet Slide Up
```tsx
<Animated.View
  style={{
    transform: [{
      translateY: slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [400, 0],
      })
    }]
  }}
>
  {/* Sheet content */}
</Animated.View>
```

---

## 5. Important Rules

- Always use the motion tokens (`--ci-motion-duration-*` and `--ci-motion-easing-*`).
- Respect `prefers-reduced-motion` — disable or reduce animations when the user has it enabled.
- Keep most micro-interactions under 250ms.
- Use spring animations sparingly in React Native (they feel more natural for press feedback).

---

## 6. Common Patterns

| Pattern                  | Recommended Duration | Easing     | Notes |
|--------------------------|----------------------|------------|-------|
| Button press             | Fast (120ms)         | Standard   | Scale or opacity |
| Card hover lift          | Standard (220ms)     | Standard   | Subtle and elegant |
| Bottom sheet / Modal     | Standard (220ms)     | Standard   | Slide + fade |
| Page transitions         | Slow (320ms)         | Standard   | Only for major navigation |
| Status / Badge change    | Fast (120ms)         | Standard   | Color or scale change |

---

*Good motion feels intentional and calm — never flashy.*

---

**Related Documents:**
- `MOTION_ANIMATION_PRINCIPLES.md`
- `DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md`
- `HOVER_FOCUS_ACTIVE_STATES.md`