# Building a v2 Screen - Implementation Playbook

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This playbook gives engineers a **step-by-step process** for building any new screen using the CareIndeed v2 design system. Following this process ensures consistency, accessibility, and proper use of the glass system.

---

## 2. Pre-Work (Before Writing Code)

1. **Review the relevant workflow spec**
   - CES → `CES_BOARD_VISUAL_LANGUAGE.md`
   - Onboarding V2 → `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md`
   - Calendar → `CALENDAR_VISUAL_PATTERNS.md`
   - Evidence → `EVIDENCE_CAPTURE_SPECIFICATION.md`
   - Signature → `SIGNATURE_CAPTURE_BEST_PRACTICES.md`
   - Policy → `COMPONENT_GUIDELINES.md` + `POLICY_LIFECYCLE_VISUAL_SPEC.md` (future)

2. **Check the production surface filter**
   - Only build for real operational workflows (CES, eCign, Evidence, Onboarding V2, Calendar, Policy, Audit, etc.).
   - Demo, Hubstaff, iAdministrator, and experimental surfaces are out of scope for v2 canonical treatment.

3. **Review the 3-Layer Glass System**
   - Read `GLASS_LAYERING_CHEAT_SHEET.md` and `DESIGN_SPEC.md`.

---

## 3. Step-by-Step Implementation Process

### Step 1: Layout Structure (Desktop vs Mobile)

- **Mobile**: Single column, bottom navigation or tab bar, bottom sheets for detail.
- **Desktop**: Constrained main container (max-width 1280–1600px) + visible Layer 0 background on sides (see `RESPONSIVE_BEHAVIOR_MATRIX.md` and `DESIGN_SPEC.md` desktop container rule).

Use `CommandCenterLayout` as the shell where possible.

### Step 2: Choose the Right Surface Layer

| Content Type                    | Recommended Layer | Component Suggestion |
|--------------------------------|-------------------|----------------------|
| Page background                 | Layer 0           | Background color or subtle texture |
| Main content area / lists       | Layer 1           | `GlassPanel` or main container |
| Cards, task items, forms        | Layer 2           | `Card`, `GlassPanel` with elevation |
| Modals, bottom sheets, dialogs  | Layer 2           | `Modal`, `BottomSheet` |
| Critical floating elements      | Layer 3 (rare)    | Only with approval |

### Step 3: Use Canonical Components

**Always prefer these first:**
- Buttons → `ui/Button` (Primary, Secondary, Ghost, Danger)
- Cards → `ui/Card` or `GlassPanel`
- Form fields → `ui/Input`, `ui/Textarea`, `ui/Select`
- Navigation → `ui/BottomNav`, `ui/Sidebar`
- Status → `ui/Badge` or `ui/Status`
- Empty / Loading / Error → `ui/EmptyState`, `ui/Loading`, `ui/ErrorMessage`
- Tabs → `ui/Tabs`

Do **not** create local versions of these components.

### Step 4: Apply Design Tokens

- Use only tokens from `DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md`
- No raw hex, rgb, or magic numbers in new code
- Spacing, radius, shadows, and motion must come from tokens

### Step 5: Handle All States

Every interactive element must support:
- Default
- Hover (desktop)
- Focus (keyboard)
- Active / Pressed
- Disabled
- Loading
- Error (when applicable)

See `HOVER_FOCUS_ACTIVE_STATES.md`

### Step 6: Mobile Gestures & Interactions

- Implement swipe actions where appropriate (see `GESTURE_INTERACTION_GUIDELINES.md`)
- Use bottom sheets instead of wide drawers on mobile
- Support pull-to-refresh on list views

### Step 7: Accessibility

- Run through `ACCESSIBILITY_COMPONENT_CHECKLIST.md`
- Ensure proper ARIA labels, focus management, and contrast
- Test with keyboard and screen reader

### Step 8: Content & Microcopy

- Use approved language from `CONTENT_EXAMPLES_GALLERY.md` and `CONTENT_MICROCOPY_GUIDELINES.md`
- Empty states must be helpful and action-oriented

### Step 9: Testing Checklist

- [ ] Mobile (iPhone 14/15/16 Pro)
- [ ] Tablet
- [ ] Desktop (at least 1440px)
- [ ] Keyboard navigation
- [ ] Screen reader (VoiceOver / NVDA)
- [ ] Reduced motion preference
- [ ] Light mode (if applicable)
- [ ] Print/PDF output (for eCign or report screens)

---

## 4. Common Anti-Patterns to Avoid

- Creating a new "Card" component instead of using `ui/Card`
- Hardcoding colors for status instead of using semantic tokens
- Using wide right drawers on mobile
- Ignoring the desktop container rule (full-bleed main surface)
- Building custom tabs or form fields when canonical ones exist
- Forgetting focus states

---

## 5. When to Ask Design Systems

Ask before implementing if you need to:
- Create a new primitive component
- Use Layer 3
- Create a new gesture pattern
- Build complex data visualizations
- Handle a new production workflow surface

---

*Following this playbook will dramatically reduce visual and interaction drift during the v2 implementation.*

---

**Related Core Documents:**
- `DESIGN_SPEC.md`
- `ENGINEERING_HANDOFF_GUIDE.md`
- `RESPONSIVE_BEHAVIOR_MATRIX.md`
- `COMPONENT_GUIDELINES.md`