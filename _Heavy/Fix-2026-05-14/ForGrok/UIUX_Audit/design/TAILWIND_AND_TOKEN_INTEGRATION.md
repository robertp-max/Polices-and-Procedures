# Tailwind + Design Token Integration Guide — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Your current codebase uses a heavy mix of Tailwind CSS and a large number of custom CSS variables. This document provides a clear strategy for integrating the new v2 design tokens without creating further chaos.

---

## 2. Recommended Approach

### Option A (Preferred): Hybrid Model (Short-term)

- Keep Tailwind for layout utilities (`flex`, `grid`, `p-`, `m-`, etc.).
- Gradually replace color, spacing, radius, and shadow values with design tokens.
- Create a `tokens.css` file that defines all `--ci-*` custom properties.
- Use `@apply` sparingly. Prefer direct token usage in components for clarity.

### Option B (Long-term Goal): Token-First

- Move toward using design tokens as the single source of truth.
- Create Tailwind config that extends the theme using token values.
- Reduce reliance on arbitrary values (`bg-[#123456]`, `p-[17px]`, etc.).

---

## 3. Implementation Steps

1. Create `src/styles/tokens.css` and import it early in your app.
2. Define all core tokens as CSS Custom Properties (from `DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md`).
3. Update `tailwind.config.js` to reference token values where possible.
4. Add ESLint rules to discourage raw hex/rgb and arbitrary values in new code.
5. During migration, wrap legacy surfaces so they can coexist with v2 components.

---

## 4. Do’s and Don’ts

**✅ Do**
- Use tokens for all new `ui/` components.
- Keep Tailwind for rapid layout work.
- Document which parts of the app are still on legacy styling.

**❌ Don’t**
- Mix hundreds of new custom properties with the existing 100+ variables without a plan.
- Use arbitrary Tailwind values in production v2 components.

---

*This integration needs to be handled carefully to avoid making the CSS situation worse during the transition.*

---

**Related Documents:**
- `DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md`
- `MIGRATION_AND_ROLLOUT_STRATEGY.md`