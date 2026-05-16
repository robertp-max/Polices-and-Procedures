# Icon Implementation Guide — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines how the official CareIndeed icon library should be implemented in both React (Web) and React Native.

---

## 2. Recommended Approach

**Use inline SVG components** (not icon fonts or sprite sheets).

**Why:**
- Best visual quality and control
- Easy theming with `currentColor`
- Better accessibility
- Works consistently in dark/light mode and print

---

## 3. Icon Component Structure (Recommended)

```tsx
// Example: IconAdd.tsx
import * as React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconAdd: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor',
  className 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
```

---

## 4. Usage Examples

### React (Web)
```tsx
import { IconAdd, IconCheck } from '@/components/icons';

<IconAdd size={20} color="var(--ci-color-brand-teal)" />
<IconCheck size={16} />
```

### React Native
```tsx
import { IconAdd } from '@/components/icons';

<IconAdd size={24} color={tokens.color.brand.teal} />
```

---

## 5. Icon Organization

Recommended folder structure:

```
src/components/icons/
  ├── index.ts                 // Barrel export
  ├── IconAdd.tsx
  ├── IconCheck.tsx
  ├── IconDocument.tsx
  ├── IconSignature.tsx
  ├── IconCalendar.tsx
  ├── ... (60-80 icons max)
```

---

## 6. Color Handling Rules

- Most icons should inherit color using `currentColor` or by accepting a `color` prop.
- Status icons (success, warning, error) may have fixed semantic colors.
- Never hardcode brand colors inside individual icon files.

---

## 7. Sizing

- Default size: 24 × 24
- Common sizes: 16, 20, 24, 32
- Always maintain 1:1 aspect ratio

---

## 8. Do’s and Don’ts

**✅ Do**
- Keep the icon library small and high-quality (aim for 60–80 icons)
- Use consistent stroke weight and corner radius across all icons
- Review new icons with design before adding them

**❌ Don’t**
- Mix filled and outline icons in the same set
- Create one-off icons for every feature
- Use icon fonts (they look blurry on some devices and are harder to theme)

---

## 9. Future Work

- Create a script to generate React + React Native icon components from SVG files
- Maintain a living icon library in Figma that matches the code
- Document the icon request process

---

*Good icons disappear. The user just understands what the action is.*

---

**Related Documents:**
- `ICONOGRAPHY_GUIDELINES.md`
- `ICON_LIBRARY_EXPORT_GUIDE.md`
- `COMPONENT_ANATOMY_AND_CODE_EXAMPLES.md`