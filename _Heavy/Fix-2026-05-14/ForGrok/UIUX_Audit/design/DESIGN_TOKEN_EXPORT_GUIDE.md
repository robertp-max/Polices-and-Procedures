# Design Token Export Guide — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Audience:** Engineering & Design Systems Team

---

## 1. Purpose

This guide explains how the CareIndeed design tokens are structured and how they should be exported and consumed in code (both web and mobile).

The goal is to ensure a **single source of truth** between design and engineering.

---

## 2. Token Structure

All tokens follow a consistent naming pattern:

```
--{category}-{subcategory}-{variant}-{state}
```

Examples:
- `--color-brand-orange`
- `--color-surface-1-dark`
- `--motion-duration-standard`
- `--radius-md`

---

## 3. Recommended Token Categories

| Category     | Examples                                      | Purpose |
|--------------|-----------------------------------------------|--------|
| `color`      | `--color-brand-orange`, `--color-semantic-success` | All color values |
| `surface`    | `--color-surface-1-light`, `--color-glass-dark` | Backgrounds and glass layers |
| `text`       | `--color-text-primary`, `--color-text-muted`   | Typography colors |
| `border`     | `--color-border-subtle-light`                  | Border colors |
| `radius`     | `--radius-sm`, `--radius-lg`                   | Border radius |
| `spacing`    | `--spacing-touch`, `--spacing-card`            | Spacing system |
| `shadow`     | `--shadow-elevation-2-light`                   | Elevation shadows |
| `motion`     | `--motion-duration-fast`, `--motion-easing-standard` | Animation tokens |
| `typography` | `--typography-font-family-heading`             | Font stacks and sizes |

---

## 4. Export Formats

### For Web (Recommended)

**Format:** CSS Custom Properties + JSON

**CSS Example:**
```css
:root {
  --color-brand-orange: #E07B2C;
  --color-brand-teal: #007970;
  --color-surface-1-light: #FFFFFF;
  --color-glass-light: rgba(255, 255, 255, 0.72);
}
```

**JSON Export (for build tools):**
```json
{
  "color": {
    "brand": {
      "orange": { "value": "#E07B2C", "type": "color" },
      "teal": { "value": "#007970", "type": "color" }
    }
  }
}
```

### For React Native / Mobile

**Format:** JavaScript object

```js
export const Colors = {
  brand: {
    orange: '#E07B2C',
    teal: '#007970',
  },
  surface: {
    light: {
      level1: '#FFFFFF',
    },
    dark: {
      level1: 'rgba(15, 23, 42, 0.72)',
    },
  },
};
```

---

## 5. Tooling Recommendations

- **Style Dictionary** (recommended)
- **Tokens Studio** (Figma plugin) + export
- **Amazon Style Dictionary**
- Custom script using Figma API (if using Figma Variables)

---

## 6. Update Process

1. Designer updates tokens in Figma (or central token file).
2. Tokens are exported via Style Dictionary or similar.
3. Codebase consumes the generated files (CSS / JS / Swift / Kotlin).
4. Any change to tokens must go through design systems review.

---

## 7. Current Token Files Location

- `COLOR_TOKENS.md` — Human-readable reference
- `tokens.json` (to be created) — Machine-readable export

---

*This guide ensures consistency between design and code as the system scales.*