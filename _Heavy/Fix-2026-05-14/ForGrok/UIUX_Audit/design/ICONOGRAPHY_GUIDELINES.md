# Iconography Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Philosophy

Icons in the CareIndeed platform should feel **clear, professional, and restrained**.

They exist to:
- Support quick recognition
- Reduce cognitive load
- Reinforce the premium, clinical, and trustworthy brand
- Never compete with content

Icons should feel like quiet, high-quality tools — not decorative elements.

---

## 2. Icon Style

- **Style:** Line icons with consistent stroke weight
- **Stroke Width:** 1.5px – 2px (depending on size)
- **Corner Radius:** Slight rounding (2–4px) for a modern but professional feel
- **Optical Balance:** Icons should feel optically balanced at their intended size (not mathematically perfect)

**Preferred aesthetic:** Clean, modern, slightly soft — similar to a refined version of Lucide, Heroicons, or Feather, but customized for Care Indeed.

---

## 3. Icon Sizes

| Size       | Pixel Size | Use Case                              | Stroke |
|------------|------------|---------------------------------------|--------|
| `icon-xs`  | 12–14px    | Dense tables, metadata                | 1.5px  |
| `icon-sm`  | 16–18px    | Buttons, tabs, form labels            | 1.5–2px|
| `icon-md`  | 20–24px    | Default size for navigation & lists   | 2px    |
| `icon-lg`  | 28–32px    | Empty states, large actions           | 2px    |
| `icon-xl`  | 40–48px    | Onboarding illustrations, major empty states | 2–2.5px |

**Rule:** Never scale icons below their intended optical size. Use the correct size token instead of shrinking.

---

## 4. Color Usage

| Usage                  | Color Token              | Opacity | Example |
|------------------------|--------------------------|---------|---------|
| Primary / Active       | `--color-brand-teal`     | 100%    | Navigation active icon |
| Secondary              | `--color-text-secondary` | 100%    | Default list icons |
| Muted / Disabled       | `--color-text-muted`     | 60–70%  | Disabled actions |
| On colored backgrounds | White or appropriate contrast | 100% | Orange button icon |
| Status icons           | Semantic color (green, amber, red) | 100% | Success, warning, error |

**Important:** Avoid using brand orange for decorative icons. Orange should feel meaningful (action/urgency).

---

## 5. Icon Library Recommendations

**Recommended base libraries (to be customized):**
- Lucide (excellent modern line style)
- Heroicons (v2)
- Tabler Icons

**Do not mix multiple icon libraries** in the same product. Choose one and customize as needed.

---

## 6. Do’s and Don’ts

### ✅ Do
- Use consistent stroke weight and corner radius across the icon set.
- Design icons at the actual size they will be used (not just scaled).
- Pair icons with clear text labels in navigation and actions.
- Use semantic color for status icons (never just color for decoration).
- Maintain optical balance (e.g., a phone icon should not feel smaller than a document icon).

### ❌ Don’t
- Use filled icons mixed with line icons (unless intentional and consistent).
- Use 3D, gradient, or overly stylized icons.
- Use icons that are too detailed or illustrative at small sizes.
- Create custom icons for every single concept — prefer a small, well-curated set.
- Use brand orange for non-action icons.

---

## 7. Icon Categories (Recommended Starting Set)

**Core Navigation**
- Home, Calendar, Tasks, Evidence, More

**Actions**
- Add, Edit, Delete, Search, Filter, Sort, Download, Upload, Sign, Capture

**Status**
- Check, Warning, Error, Pending, Blocked, In Progress

**Objects**
- Document, Form, Signature, User, Building, Calendar event, Evidence

**System**
- Settings, Help, Notifications, Profile, Logout

---

## 8. Future Work

- Build a curated CareIndeed icon library (exported as SVG + React components).
- Define rules for when to use icons vs text-only.
- Create a “icon request” process for new features.

---

*Good iconography disappears — the user just knows what to do.*