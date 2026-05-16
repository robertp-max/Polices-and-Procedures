# Design Tokens - Complete Implementation Guide (v2)

**Version:** 1.0  
**Date:** May 2026  
**Audience:** Frontend Engineers

---

## 1. Purpose

This document provides the **actual, ready-to-use** token structure for the CareIndeed v2 design system. It includes:

- The official token categorization
- A sample `tokens.json` structure
- How to consume tokens in React (Web) and React Native
- Naming conventions
- Best practices to prevent drift

---

## 2. Token Categories & Structure

All tokens follow this naming pattern:

```
--ci-{category}-{subcategory}-{variant}-{state?}
```

**Main Categories:**

| Category       | Prefix          | Examples |
|----------------|------------------|----------|
| Color          | `--ci-color-`    | `--ci-color-brand-teal`, `--ci-color-semantic-success` |
| Surface        | `--ci-surface-`  | `--ci-surface-1-dark`, `--ci-surface-glass-light` |
| Text           | `--ci-text-`     | `--ci-text-primary`, `--ci-text-muted` |
| Border         | `--ci-border-`   | `--ci-border-subtle-light`, `--ci-border-focus` |
| Radius         | `--ci-radius-`   | `--ci-radius-sm`, `--ci-radius-lg` |
| Spacing        | `--ci-spacing-`  | `--ci-spacing-touch`, `--ci-spacing-card` |
| Shadow         | `--ci-shadow-`   | `--ci-shadow-elevation-1`, `--ci-shadow-elevation-2-light` |
| Motion         | `--ci-motion-`   | `--ci-motion-duration-fast`, `--ci-motion-easing-standard` |
| Typography     | `--ci-typography-` | `--ci-typography-font-family-heading`, `--ci-typography-size-lg` |

---

## 3. Sample `tokens.json` Structure

```json
{
  "color": {
    "brand": {
      "navy": { "value": "#0F172A", "type": "color" },
      "teal": { "value": "#007970", "type": "color" },
      "orange": { "value": "#E07B2C", "type": "color" }
    },
    "semantic": {
      "success": { "value": "#007970", "type": "color" },
      "warning": { "value": "#E07B2C", "type": "color" },
      "error": { "value": "#DC2626", "type": "color" }
    }
  },
  "surface": {
    "dark": {
      "level0": { "value": "#0F172A", "type": "color" },
      "level1": { "value": "rgba(15, 23, 42, 0.72)", "type": "color" },
      "level2": { "value": "rgba(15, 23, 42, 0.85)", "type": "color" }
    },
    "light": {
      "level1": { "value": "#FFFFFF", "type": "color" },
      "level2": { "value": "rgba(255, 255, 255, 0.92)", "type": "color" }
    }
  },
  "text": {
    "primary": { "value": "#0F172A", "type": "color" },
    "muted": { "value": "#64748B", "type": "color" }
  },
  "radius": {
    "sm": { "value": "6px", "type": "dimension" },
    "md": { "value": "10px", "type": "dimension" },
    "lg": { "value": "16px", "type": "dimension" }
  },
  "spacing": {
    "touch": { "value": "12px", "type": "dimension" },
    "card": { "value": "16px", "type": "dimension" },
    "section": { "value": "24px", "type": "dimension" }
  },
  "shadow": {
    "elevation-1": { "value": "0 2px 8px rgba(0,0,0,0.12)", "type": "shadow" },
    "elevation-2-light": { "value": "0 8px 24px rgba(0,0,0,0.08)", "type": "shadow" }
  },
  "motion": {
    "duration": {
      "fast": { "value": "120ms", "type": "duration" },
      "standard": { "value": "220ms", "type": "duration" },
      "slow": { "value": "320ms", "type": "duration" }
    },
    "easing": {
      "standard": { "value": "cubic-bezier(0.4, 0, 0.2, 1)", "type": "cubicBezier" }
    }
  }
}
```

---

## 4. How to Use Tokens

### React (Web) – Recommended Approach

```tsx
// Using CSS Custom Properties (preferred)
const Card = () => (
  <div 
    style={{ 
      background: 'var(--ci-surface-1-dark)',
      borderRadius: 'var(--ci-radius-md)',
      boxShadow: 'var(--ci-shadow-elevation-2-light)'
    }}
  >
    Content
  </div>
);
```

**Best Practice:** Create a `tokens.css` file and import it once in your app.

### React Native

```tsx
import { tokens } from '@/design/tokens';

const Card = () => (
  <View
    style={{
      backgroundColor: tokens.surface.dark.level1,
      borderRadius: tokens.radius.md,
      // Shadow handling via react-native-shadow or platform specific
    }}
  >
    Content
  </View>
);
```

---

## 5. Consumption Strategy (Recommended)

1. **Single Source of Truth**: Keep `tokens.json` in the design system repo.
2. **Build Step**: Use Style Dictionary or a custom script to generate:
   - `tokens.css` (CSS Custom Properties)
   - `tokens.ts` (TypeScript constants for React)
   - `tokens.native.ts` (React Native constants)
3. **ESLint Rule**: Block raw hex/rgb values in new code (except in token files).

---

## 6. Naming & Usage Rules

- Always use semantic names (`--ci-color-semantic-success`), never direct brand colors in components.
- Use spacing tokens for padding/margin instead of arbitrary values.
- Motion tokens must be used for all transitions and animations.

---

## 7. Current Status

- `tokens.json` (to be maintained in design system repo)
- CSS + TS output files will be generated from the JSON above.

---

**This document + the accompanying `tokens.json` should be the single source of truth for all color, spacing, motion, and elevation values in the v2 system.**

---

*Next documents in queue: Component Anatomy Specs, Figma-to-Code Mapping, and "Building a v2 Screen" Playbook.*