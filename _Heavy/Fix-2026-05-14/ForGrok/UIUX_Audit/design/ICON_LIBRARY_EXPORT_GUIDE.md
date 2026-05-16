# Icon Library Export Guide — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This guide explains how the CareIndeed icon library should be built, maintained, and exported for use across web and mobile platforms.

---

## 2. Icon Style Requirements

- Line style with consistent stroke weight (1.5–2px)
- Slight corner rounding (2–4px) for a modern but professional feel
- Optically balanced at all intended sizes
- 24×24 px base size (scalable)
- Consistent optical weight across the set (a phone icon should not feel smaller than a document icon)

---

## 3. Icon Naming Convention

Format: `category-name`

Examples:
- `action-add`
- `action-edit`
- `status-check`
- `status-warning`
- `object-document`
- `object-signature`
- `navigation-home`
- `navigation-calendar`

---

## 4. Recommended Icon Set Size

Start with a curated set of **60–80 icons** maximum. It is better to have a small, high-quality, consistent set than a large inconsistent one.

---

## 5. Export Requirements

### For Web (React)

- Export as **SVG** (inline preferred)
- Component naming: `IconAdd`, `IconDocument`, etc.
- Support `size` and `color` props

### For React Native

- Export as **SVG** using `react-native-svg`
- Or use a solution like `react-native-vector-icons` with a custom icon font (less recommended for premium feel)

### For Figma

- Keep a master component library in Figma
- Use variants for size and color where possible

---

## 6. Color Handling

- Icons should inherit color from the parent (use `currentColor` in SVG).
- Avoid hardcoding brand colors inside the SVG files.
- Exception: Status icons (success, warning, error) may have fixed semantic colors.

---

## 7. Do’s and Don’ts

### ✅ Do
- Maintain strict consistency in stroke weight and corner radius.
- Design icons at the actual size they will be used.
- Review new icons with the design systems team before adding them to the library.

### ❌ Don’t
- Mix filled and line icons in the same set.
- Use 3D, gradient, or overly stylized icons.
- Create one-off icons for every single feature.
- Use brand orange for non-action icons.

---

## 8. Future Work

- Curate the official CareIndeed icon library (60–80 icons).
- Export as:
  - SVG sprite
  - React components
  - React Native components
  - Figma library
- Create an icon request process for new features.

---

*Good icons disappear. The user just knows what to do.*