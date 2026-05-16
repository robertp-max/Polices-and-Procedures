# CareIndeed UI/UX Design System — Combined Reference

> **Generated:** 05/15/2026, 18:17 (local)
> **Source folder:** `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/`
> **Files merged:** 62

This document concatenates all design-system markdown files in the folder above into a single reference.
Each section is separated by a horizontal rule and labelled with its source filename.

---

## Table of Contents

1. [ACCESSIBILITY COMPONENT CHECKLIST](#accessibility-component-checklist)
2. [ACCESSIBILITY GUIDELINES](#accessibility-guidelines)
3. [ADVANCED FORM IMPLEMENTATION PATTERNS](#advanced-form-implementation-patterns)
4. [ASSET AND ILLUSTRATION STRATEGY](#asset-and-illustration-strategy)
5. [BUILDING V2 SCREEN PLAYBOOK](#building-v2-screen-playbook)
6. [CALENDAR VISUAL PATTERNS](#calendar-visual-patterns)
7. [CES BOARD VISUAL LANGUAGE](#ces-board-visual-language)
8. [CHART VISUAL GUIDELINES](#chart-visual-guidelines)
9. [COLOR TOKENS](#color-tokens)
10. [COMPLETE V2 DESIGN SYSTEM DOCUMENTATION](#complete-v2-design-system-documentation)
11. [COMPONENT ANATOMY AND CODE EXAMPLES](#component-anatomy-and-code-examples)
12. [COMPONENT GUIDELINES](#component-guidelines)
13. [COMPONENT USAGE EXAMPLES](#component-usage-examples)
14. [CONTENT EXAMPLES GALLERY](#content-examples-gallery)
15. [CONTENT MICROCOPY GUIDELINES](#content-microcopy-guidelines)
16. [DARK VS LIGHT MODE GUIDE](#dark-vs-light-mode-guide)
17. [DESIGN CRITIQUE AND REVIEW PROCESS](#design-critique-and-review-process)
18. [DESIGN SPEC](#design-spec)
19. [DESIGN SYSTEM GOVERNANCE](#design-system-governance)
20. [DESIGN SYSTEM HEALTH AND METRICS](#design-system-health-and-metrics)
21. [DESIGN SYSTEM METRICS DASHBOARD](#design-system-metrics-dashboard)
22. [DESIGN SYSTEM RELEASE PROCESS](#design-system-release-process)
23. [DESIGN TOKENS IMPLEMENTATION GUIDE](#design-tokens-implementation-guide)
24. [DESIGN TOKEN EXPORT GUIDE](#design-token-export-guide)
25. [DOS AND DONTS](#dos-and-donts)
26. [EMPTY STATE PATTERNS](#empty-state-patterns)
27. [ENGINEERING HANDOFF GUIDE](#engineering-handoff-guide)
28. [ERROR HANDLING GUIDELINES](#error-handling-guidelines)
29. [EVIDENCE CAPTURE SPECIFICATION](#evidence-capture-specification)
30. [FIGMA KIT SPEC](#figma-kit-spec)
31. [FIGMA TO CODE MAPPING](#figma-to-code-mapping)
32. [FORM VALIDATION PATTERNS](#form-validation-patterns)
33. [GESTURE INTERACTION GUIDELINES](#gesture-interaction-guidelines)
34. [GLASS LAYERING CHEAT SHEET](#glass-layering-cheat-sheet)
35. [GLOBAL ERROR HANDLING PATTERNS](#global-error-handling-patterns)
36. [HOVER FOCUS ACTIVE STATES](#hover-focus-active-states)
37. [ICONOGRAPHY GUIDELINES](#iconography-guidelines)
38. [ICON IMPLEMENTATION GUIDE](#icon-implementation-guide)
39. [ICON LIBRARY EXPORT GUIDE](#icon-library-export-guide)
40. [LIGHT MODE ELEVATION SYSTEM](#light-mode-elevation-system)
41. [LOADING STATE GUIDELINES](#loading-state-guidelines)
42. [MASTER IMPLEMENTATION READINESS CHECKLIST](#master-implementation-readiness-checklist)
43. [MIGRATION AND ROLLOUT STRATEGY](#migration-and-rollout-strategy)
44. [MOTION ANIMATION PRINCIPLES](#motion-animation-principles)
45. [MOTION IMPLEMENTATION EXAMPLES](#motion-implementation-examples)
46. [MOTION TOKEN IMPLEMENTATION](#motion-token-implementation)
47. [OFFLINE FIRST AND SYNC PATTERNS](#offline-first-and-sync-patterns)
48. [ONBOARDING V2 MOBILE PATTERN LIBRARY](#onboarding-v2-mobile-pattern-library)
49. [PERFORMANCE AND LOADING STRATEGY](#performance-and-loading-strategy)
50. [PRINT PDF CONSISTENCY GUIDELINES](#print-pdf-consistency-guidelines)
51. [README](#readme)
52. [RESPONSIVE BEHAVIOR MATRIX](#responsive-behavior-matrix)
53. [SECURITY AND PRIVACY IN UI](#security-and-privacy-in-ui)
54. [SIGNATURE CAPTURE BEST PRACTICES](#signature-capture-best-practices)
55. [TAILWIND AND TOKEN INTEGRATION](#tailwind-and-token-integration)
56. [TASK URGENCY HIERARCHY SPEC](#task-urgency-hierarchy-spec)
57. [TRAINING MATERIALS STRUCTURE](#training-materials-structure)
58. [TYPOGRAPHY SCALE](#typography-scale)
59. [V2 DESIGN DIRECTION SUMMARY](#v2-design-direction-summary)
60. [V2 MOCKUP GENERATION BRIEF](#v2-mockup-generation-brief)
61. [VISUAL REGRESSION TESTING STRATEGY](#visual-regression-testing-strategy)
62. [VOICE BRAD INTEGRATION HOOKS](#voice-brad-integration-hooks)

---

---

<a name="accessibility-component-checklist"></a>

## SOURCE: ACCESSIBILITY_COMPONENT_CHECKLIST.md

# Accessibility Component Checklist — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Target:** WCAG 2.2 AA

---

## Purpose

This checklist helps designers and developers ensure every component meets accessibility standards before it is released.

---

## General Requirements (All Components)

- [ ] Minimum touch target size of 44 × 44 px (mobile)
- [ ] Visible focus indicator (teal ring) on keyboard focus
- [ ] Sufficient color contrast (4.5:1 for text, 3:1 for large text)
- [ ] Does not rely on color alone to convey meaning
- [ ] Works with `prefers-reduced-motion` enabled
- [ ] No keyboard traps
- [ ] Logical tab order
- [ ] Proper ARIA attributes where needed (`role`, `aria-label`, `aria-labelledby`, `aria-describedby`)

---

## Button

- [ ] Minimum 44px height on mobile
- [ ] Clear accessible name (visible text or `aria-label`)
- [ ] Focus ring visible on keyboard navigation
- [ ] Disabled state is clearly communicated (not just lower opacity)

---

## Card

- [ ] If the entire card is clickable, it has proper `role="button"` or is wrapped in a link
- [ ] Focus is properly managed when the card is interactive
- [ ] Content inside the card remains readable when the card is focused

---

## Form Field

- [ ] Label is properly associated with the input (`<label>` or `aria-labelledby`)
- [ ] Required fields are clearly marked
- [ ] Error messages are associated with the field (`aria-describedby`)
- [ ] Helper text is announced to screen readers
- [ ] Focus state is clearly visible

---

## Status Badge

- [ ] Color is never the only way to understand the status (text or icon must accompany it)
- [ ] Meets contrast requirements against its background

---

## Navigation (Bottom Nav / Sidebar)

- [ ] Active state is clearly indicated (not just by color)
- [ ] Icons have accessible names (or are accompanied by visible text)
- [ ] Tab order follows visual order

---

## Modal / Bottom Sheet

- [ ] Focus is trapped inside when open
- [ ] Focus returns to the trigger element when closed
- [ ] Has a clear accessible name (`aria-labelledby` or `aria-label`)
- [ ] Can be closed with Escape key

---

## Status & Loading

- [ ] Loading states are announced to screen readers (`aria-live="polite"`)
- [ ] Status changes (e.g., “Document Locked”, “Evidence Uploaded”) are announced

---

## Signature Component

- [ ] Large, comfortable touch target on mobile
- [ ] Clear instructions for the user
- [ ] Ability to review the document before signing (critical for legal defensibility)
- [ ] Keyboard-accessible alternative where possible (or clear support for external input devices)

---

## Evidence Upload

- [ ] File input is properly labeled
- [ ] Drag-and-drop area (if present) is accessible via keyboard
- [ ] Clear feedback when file is successfully captured or uploaded
- [ ] Error states are clearly communicated

---

## Empty States

- [ ] Clear explanation of why the section is empty
- [ ] Clear next action (if available)
- [ ] Does not rely only on color or imagery

---

## Notes

- This checklist should be used during design reviews and before development handoff.
- Any component that fails multiple items on this list should be revised before release.

---

**Next:** Turn this into an interactive checklist (Notion, Figma, or code) for the team.

---

*Accessibility is everyone’s responsibility.*


---

<a name="accessibility-guidelines"></a>

## SOURCE: ACCESSIBILITY_GUIDELINES.md

# Accessibility Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Target:** WCAG 2.2 AA (with AAA aspirations in key areas)

---

## 1. Philosophy

Accessibility is not a checklist — it is a core part of building a **trustworthy, professional, and inclusive** compliance platform.

Every clinician, DON, surveyor, and administrator — regardless of ability — must be able to use the platform effectively, especially during high-stakes activities like signing documents, capturing evidence, and completing regulatory tasks.

---

## 2. Core Principles

- **Perceivable** — Information must be presentable in ways users can perceive.
- **Operable** — Interface components must be operable by all users.
- **Understandable** — Information and operation must be understandable.
- **Robust** — Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.

---

## 3. Key Requirements by Area

### 3.1 Color & Contrast

- Minimum contrast ratio of **4.5:1** for normal text and **3:1** for large text (WCAG AA).
- **7:1** contrast is preferred for body text in light mode.
- Never rely on color alone to convey meaning (always pair with text or icons).
- Status colors (Teal, Orange, Red) must meet contrast requirements against their backgrounds.

### 3.2 Touch Targets (Mobile)

- All interactive elements must have a minimum touch target of **44 × 44 px**.
- This applies to buttons, icons, form fields, checkboxes, signature areas, and navigation items.

### 3.3 Keyboard Navigation

- All functionality must be reachable via keyboard.
- Visible focus indicator (teal ring) must be present on all focusable elements.
- Logical tab order must be maintained.
- No keyboard traps (users must be able to tab out of modals, drawers, etc.).

### 3.4 Screen Reader Support

- All interactive elements must have accessible names (via `aria-label`, `aria-labelledby`, or visible text).
- Status changes (e.g., "Document Locked", "Evidence Uploaded", "Signature Applied") must be announced via `aria-live` regions or equivalent.
- Form fields must be properly labeled and associated with their labels.
- Tables (especially in Reports, Audit Readiness, Evidence) must have proper headers and scope attributes.

### 3.5 Forms & Signing

- Large, comfortable inputs and signature areas (especially on mobile).
- Clear error messaging that is announced to screen readers.
- Ability to review content before signing (critical for legal defensibility).
- Support for external keyboards and assistive input devices during signing.

### 3.6 Motion & Animation

- Respect `prefers-reduced-motion`.
- Provide static alternatives for animated elements when reduced motion is enabled.
- Avoid flashing or rapidly changing content that could trigger vestibular disorders.

### 3.7 Glassmorphism & Visual Effects

- Ensure text remains readable over glass panels in both light and dark modes.
- Do not rely solely on blur or transparency for visual hierarchy.
- Maintain sufficient contrast even when glass layers overlap.

---

## 4. Testing Requirements

- Automated testing with **axe** or **WAVE** on all major screens.
- Manual keyboard testing on desktop.
- Screen reader testing (VoiceOver on iOS/macOS, TalkBack on Android) for key flows:
  - eCign Signing
  - Evidence Capture
  - Task execution
  - Onboarding flows
- Real-device testing on both light and dark modes.

---

## 5. Common Pitfalls to Avoid

- Using orange or teal text on low-contrast backgrounds.
- Making signature areas too small or low-contrast.
- Hiding important information behind hover states.
- Creating custom components that break standard accessibility patterns.
- Overusing glass transparency in light mode without proper contrast support.

---

## 6. Future Work

- Create an Accessibility Component Checklist.
- Define ARIA patterns for common components (Tabs, Bottom Sheets, Status, etc.).
- Establish an accessibility review gate in the design process.

---

*Accessible design is not optional — it is part of delivering a professional, defensible, and ethical compliance platform.*


---

<a name="advanced-form-implementation-patterns"></a>

## SOURCE: ADVANCED_FORM_IMPLEMENTATION_PATTERNS.md

# Advanced Form Implementation Patterns — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document provides deeper implementation guidance for complex forms (eCign packets, Onboarding V2 gates, policy acknowledgments, etc.), going beyond basic validation.

---

## 2. Recommended Architecture

### Form State Management
- Prefer **React Hook Form** + **Zod** (or similar schema validation) for most forms.
- For very large multi-step forms (eCign, Onboarding), consider a state machine or step-based approach.

### Progressive Saving
- Auto-save drafts locally (especially important for long eCign packets).
- Show subtle “Draft saved” indicators.
- Allow resuming from where the user left off.

---

## 3. Complex Form Patterns

### Multi-Step / Wizard Forms
- Clear progress indicator (stepper or progress bar).
- Allow going back without losing data.
- Validate only the current step before allowing progression.
- Save progress on every step change.

### Conditional Fields
- Show/hide fields based on previous answers.
- Keep the form structure clean — avoid deeply nested conditionals when possible.

### Signature + Affirmation Combination
- Signature capture should be treated as a required field.
- Affirmation checkbox must be checked **before** allowing final submission.
- See `SIGNATURE_CAPTURE_BEST_PRACTICES.md` for full requirements.

---

## 4. Performance Considerations

- Lazy load heavy form sections when possible.
- Debounce expensive validations.
- Use `useMemo` and `useCallback` appropriately on large forms.

---

## 5. Accessibility in Complex Forms

- Group related fields with `<fieldset>` and `<legend>`.
- Announce step changes to screen readers.
- Ensure error messages are associated with their fields using `aria-describedby`.

---

## 6. Do’s and Don’ts

**✅ Do**
- Treat long forms as multi-step journeys.
- Save progress frequently.
- Make the current step and overall progress always visible.

**❌ Don’t**
- Build massive single-page forms without clear structure.
- Lose user input on validation errors or navigation.
- Require all fields to be filled before allowing partial save.

---

*Good form implementation reduces abandonment and increases compliance completion rates.*

---

**Related Documents:**
- `FORM_VALIDATION_PATTERNS.md`
- `SIGNATURE_CAPTURE_BEST_PRACTICES.md`
- `COMPONENT_ANATOMY_AND_CODE_EXAMPLES.md`


---

<a name="asset-and-illustration-strategy"></a>

## SOURCE: ASSET_AND_ILLUSTRATION_STRATEGY.md

# Asset & Illustration Strategy — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines how logos, icons, illustrations, and other visual assets should be managed within the v2 design system.

---

## 2. Asset Categories

| Category          | Ownership          | Guidelines |
|-------------------|--------------------|----------|
| **Brand Logos**   | Marketing + Design Systems | Care Indeed mark + wordmark only. Strict usage rules. |
| **Icons**         | Design Systems     | See `ICON_IMPLEMENTATION_GUIDE.md` and `ICONOGRAPHY_GUIDELINES.md` |
| **Illustrations / Empty States** | Design Systems | Calm, professional, clinical style. Limited use. |
| **Photography**   | Marketing          | Real photos of clinicians, patients, home settings when possible. |
| **Screenshots**   | Product + Design   | Must reflect current v2 design when used in marketing or help. |

---

## 3. Key Rules

- All production assets must come from approved sources (Figma library or shared drive).
- Never use CI-ION assets in new v2 work.
- Illustrations should be used sparingly and only when they genuinely improve understanding (especially in empty states and onboarding).
- All icons and illustrations must support both dark and light mode.

---

## 4. Storage & Access

- Figma: Master asset library linked to the v2 design system file.
- Code: Icons live in `src/components/icons/`
- Marketing assets: Centralized shared drive with clear naming.

---

## 5. Do’s and Don’ts

**✅ Do**
- Keep the icon set small and high quality.
- Update assets when the design system evolves.
- Version important brand assets.

**❌ Don’t**
- Create one-off illustrations for every feature.
- Use outdated CI-ION assets in new flows.

---

*Good asset management keeps the system clean and consistent.*

---

**Related Documents:**
- `ICON_IMPLEMENTATION_GUIDE.md`
- `ICONOGRAPHY_GUIDELINES.md`


---

<a name="building-v2-screen-playbook"></a>

## SOURCE: BUILDING_V2_SCREEN_PLAYBOOK.md

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


---

<a name="calendar-visual-patterns"></a>

## SOURCE: CALENDAR_VISUAL_PATTERNS.md

# Calendar Visual Patterns — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

The Master Calendar (unified view for CES sprints, tasks, staffing, and policy deadlines) is a high-frequency surface. This document defines its visual language so it feels consistent, scannable, and calm — even when schedules are busy.

---

## 2. Core Principles

- **Task & deadline clarity** — Users must instantly see what is due today vs. this week vs. overdue.
- **Mobile-first** — Most field users will view and interact with the calendar primarily on phones.
- **Layered glass** — Events and tasks sit on Layer 1 or Layer 2 cards.
- **Restrained urgency** — Overdue items use orange/red sparingly and clearly.

---

## 3. View Modes

### Mobile (Primary)
- **Agenda / List view** (default) — Vertical list grouped by day.
- **Week view** (horizontal swipe or segmented control).
- **Month view** (secondary, for planning).

### Desktop / Tablet
- Full month grid + agenda sidebar (split view).
- Ability to toggle between "My Tasks", "Team", "CES Sprints", "Policy Deadlines".

---

## 4. Event & Task Card Treatment

- Use **Layer 1** glass for normal items.
- Use **Layer 2** with teal left border for "My Tasks" or selected items.
- Overdue items: subtle restrained orange left border + "Overdue" badge.
- All-day or multi-day items: slightly different treatment (full-width bar or different background tint).

**Information priority on mobile cards:**
1. Title (bold)
2. Time or "All day"
3. Patient / Unit / Policy name (if relevant)
4. Status badge
5. Assignee (when in team view)

---

## 5. Color & Status System

- **Teal** — Completed or on-track events
- **Restrained Orange** — Due today or action needed
- **Red** — Overdue (use only for true blockers)
- Navy for neutral / informational calendar items (e.g., training sessions)

Never use legacy CI-ION colors.

---

## 6. Interaction Patterns

**Mobile:**
- Tap event → Opens bottom sheet with full details + quick actions ("Mark Complete", "Capture Evidence", "Reschedule").
- Long press → Quick actions menu.
- Swipe on task → Mark done or snooze.

**Desktop:**
- Click → Side panel detail.
- Drag to reschedule (when permissions allow).

---

## 7. Empty & Loading States

- Empty day: "No tasks scheduled. Enjoy the breathing room." (calm tone)
- Loading: Skeleton list that matches the agenda card layout.

---

## 8. Do’s and Don’ts

**✅ Do**
- Default to "My View" (personal tasks + deadlines) for most users.
- Make today’s section visually prominent but not alarming.
- Support deep linking (e.g., `/calendar?date=2026-06-12&task=123`).
- Show regulatory deadlines (policy reviews, ACHC, etc.) alongside clinical tasks.

**❌ Don’t**
- Overload the calendar with too many event types without clear visual distinction.
- Use tiny text for times on mobile.
- Make month view the only view on phones.

---

## 9. Integration Points

- CES tasks (sprint items)
- PM / My Tasks
- Policy review & acknowledgment deadlines
- Onboarding V2 activation windows
- Staffing calendar (read-only for most users)

All must use the same visual language.

---

*Calendar is the "when" layer of the operational system. It must feel reliable and easy to scan under pressure.*

---

**Related:** `CES_BOARD_VISUAL_LANGUAGE.md`, `TASK_URGENCY_HIERARCHY_SPEC.md` (future)


---

<a name="ces-board-visual-language"></a>

## SOURCE: CES_BOARD_VISUAL_LANGUAGE.md

# CES Board Visual Language — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

The CES Board is one of the most frequently used and operationally critical surfaces in the entire platform. This document defines its exact visual language so every sprint, task card, and status feels consistent, scannable, and trustworthy.

---

## 2. Core Principles for the CES Board

- **Task-first** — The clinician/DON should immediately understand what needs to be done today.
- **Urgency hierarchy** — Overdue and high-risk items must stand out without screaming.
- **Calm glass aesthetic** — Even when there is a lot of work, the interface should not feel chaotic.
- **One-handed friendly** on mobile (large tap targets, clear swipe actions).

---

## 3. Card Hierarchy (Layer System)

| Layer | Use Case                              | Treatment |
|-------|---------------------------------------|---------|
| Layer 1 | Standard task card                    | Soft glass, subtle shadow |
| Layer 2 | Selected / focused / "My Task"        | Slightly stronger elevation + teal accent border on left |
| Layer 3 | Critical overdue or blocked (rare)    | Stronger shadow + restrained orange left border |

**Rule:** Do not overuse Layer 3. Most overdue items should live in Layer 2 with clear "Overdue" badge.

---

## 4. Status & Urgency System

**Approved semantic colors (Care Indeed only):**

- **Teal** — Completed / On Track / Compliant
- **Restrained Orange** — Due today, Action required, In progress
- **Red** — Overdue, Blocked, Failed (use sparingly)

**Badge treatments:**
- Small, rounded, high-contrast text
- Never rely on color alone — always pair with clear text ("Overdue 3d", "Due Today", "Completed")

---

## 5. Information Density Rules

Each CES card should show (in order of importance):

1. Task title (bold, primary text)
2. Patient / Unit name (if applicable)
3. Due date or "Overdue X days" (clear, not tiny)
4. Status badge
5. Assignee avatar (when relevant)
6. Quick actions (Start, Complete, View Evidence) — only the most important 1–2

**Mobile:** Collapse less critical information behind a "More" or swipe gesture.

---

## 6. Board Layout

### Desktop
- Kanban-style columns (To Do / In Progress / Review / Done) or grouped by clinician
- Cards should feel generous but not wasteful
- Drag-and-drop supported (with clear affordance)

### Mobile
- Vertical list (not Kanban)
- Pull-to-refresh
- FAB for "Quick Capture Evidence" or "Log Task"
- Bottom sheet for task detail (never a wide drawer on mobile)

---

## 7. Do’s and Don’ts

**✅ Do**
- Make "My Tasks" the default filtered view for most users
- Use progressive disclosure (show more detail on tap/click)
- Show clear "Why this task matters" context when possible
- Maintain excellent contrast even in bright sunlight (field use)

**❌ Don’t**
- Create 8+ different card variants
- Use tiny text for due dates
- Mix CI-ION maroon/gold into any CES element
- Make the board feel like a spreadsheet

---

## 8. Interaction Patterns

- Tap card → Opens task detail (bottom sheet on mobile, side panel on desktop)
- Long press / right-click → Quick actions menu
- Swipe left on mobile → Mark complete or Capture Evidence (contextual)

---

## 9. Future Enhancements (Phase 4+)

- Smart grouping (by patient, by regulatory domain, by risk level)
- Voice/Brad integration ("Read me the three most urgent tasks")
- Offline-first support with clear sync status

---

*CES is the daily operating system for compliance execution. It must feel fast, clear, and calm — even on the busiest days.*

---

**Next:** Align the actual `CesBoardPage` and `CesCard` implementations with this spec during Phase 3 High-Frequency Workflow work.


---

<a name="chart-visual-guidelines"></a>

## SOURCE: CHART_VISUAL_GUIDELINES.md

# Chart & Data Visualization Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Charts and data visualizations appear in CES Reports, Audit Readiness, Dashboards, and Compliance overviews. This document ensures they follow the same premium, calm, and operationally useful aesthetic as the rest of the v2 system.

---

## 2. Core Principles for Visualizations

- **Operational meaning first** — Every chart should answer a real question for clinicians, DONs, or surveyors.
- **Calm and professional** — Avoid bright, noisy, or overly colorful charts.
- **High contrast & accessibility** — Must work in both dark and light mode.
- **Mobile friendly** — Charts must remain readable on small screens.

---

## 3. Approved Color Usage

Use the Care Indeed palette only:

- **Navy** (`#0F172A`) – Primary text and axes
- **Teal** (`#007970`) – Positive / Compliant / On Track
- **Restrained Orange** (`#E07B2C`) – Attention / Due Soon / Warning
- **Red** (`#DC2626`) – Only for serious blockers or failures (use sparingly)
- **Muted Gray** (`#64748B`) – Neutral or historical data

**Never** use legacy CI-ION maroon/gold or bright neon colors in charts.

---

## 4. Recommended Chart Types & Use Cases

| Chart Type       | Recommended Use                              | Notes |
|------------------|----------------------------------------------|-------|
| **Bar**          | Comparison (e.g., tasks completed by clinician) | Horizontal bars often better on mobile |
| **Line**         | Trends over time (compliance score, overdue count) | Use subtle teal line with light area fill |
| **Donut / Pie**  | Distribution (e.g., status breakdown)        | Limit to max 5 segments. Use teal + orange + gray |
| **Progress**     | Single metric (e.g., Onboarding completion %) | Large, calm progress ring or bar |
| **Heatmap**      | Calendar-style density (optional)            | Use very subtle teal intensity scale |

---

## 5. Styling Rules

- **Axes & Grid**: Very light muted lines. Never heavy.
- **Labels**: Use Inter at readable size (minimum 12px on desktop, 11px on mobile).
- **Legends**: Place above or below the chart. Keep short.
- **Tooltips**: Clean glass-style card with clear data.
- **Animation**: Subtle entrance animation only. Respect `prefers-reduced-motion`.

---

## 6. Dark vs Light Mode

- **Dark mode**: Charts should have good contrast against the dark glass surface. Use slightly brighter versions of teal and orange if needed.
- **Light mode**: Use the standard palette. Ensure text remains highly legible.

---

## 7. Do’s and Don’ts

**✅ Do**
- Start with a clear question the chart is answering.
- Use at most 3–4 colors per chart.
- Make key numbers large and prominent (e.g., “87% Compliant”).
- Provide a “View Details” action when the chart is summary-level.

**❌ Don’t**
- Use rainbow or many colors.
- Make 3D or overly stylized charts.
- Cram too much data into one visualization.
- Use red for anything that isn’t truly critical.

---

## 8. Examples of Good Visualizations

- CES Reports: “Tasks Completed by Week” (clean teal line chart)
- Audit Readiness: Large calm progress circle showing overall readiness %
- Compliance Dashboard: Simple horizontal bar chart showing overdue tasks by domain

---

## 9. Technical Recommendations

- Prefer libraries that support theming (Recharts, Chart.js with custom colors, or Victory).
- All colors should come from design tokens when possible.
- Make charts responsive and touch-friendly on mobile.

---

*Good visualizations reduce cognitive load and help users make faster, better decisions.*

---

**Related:** `CES_BOARD_VISUAL_LANGUAGE.md`, `TASK_URGENCY_HIERARCHY_SPEC.md`


---

<a name="color-tokens"></a>

## SOURCE: COLOR_TOKENS.md

# Color Tokens — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Brand:** Care Indeed (Single Canonical Identity)

---

## 1. Core Brand Colors

| Token Name              | Hex       | Usage                                      | Notes |
|-------------------------|-----------|--------------------------------------------|-------|
| `--color-brand-orange`  | `#E07B2C` | Primary actions, CTAs, pending states      | Use sparingly and with purpose |
| `--color-brand-teal`    | `#007970` | Secondary actions, stable/compliant states | Primary supporting color |
| `--color-brand-navy`    | `#0F172A` | Dark mode surfaces, headers, emphasis      | Deep professional base |

---

## 2. Semantic Colors

| Token Name                  | Hex       | Meaning                              | Light Mode Usage          | Dark Mode Usage           |
|-----------------------------|-----------|--------------------------------------|---------------------------|---------------------------|
| `--color-success`           | `#10B981` | Compliant, complete, stable          | Text + Background tint    | Text + Background tint    |
| `--color-warning`           | `#F59E0B` | Pending, review required             | Text + Background tint    | Text + Background tint    |
| `--color-error`             | `#EF4444` | Failed, blocked, overdue critical    | Text + Background tint    | Text + Background tint    |
| `--color-info`              | `#3B82F6` | Informational / neutral status       | Text + Background tint    | Text + Background tint    |

---

## 3. Surface & Glass Colors

### Light Mode

| Token Name                    | Value                          | Usage |
|-------------------------------|--------------------------------|-------|
| `--color-bg-page`             | `#F8FAFC`                      | Page background (Layer 0) |
| `--color-surface-1`           | `#FFFFFF`                      | Main app surface (Layer 1) |
| `--color-surface-2`           | `#FFFFFF` + subtle tint        | Elevated cards (Layer 2) |
| `--color-glass-light`         | `rgba(255, 255, 255, 0.72)`    | Glass panels |
| `--color-border-subtle`       | `#E5E4E3`                      | Very soft hairline borders |
| `--color-border-medium`       | `#CBD5E1`                      | Medium strength borders |

### Dark Mode

| Token Name                    | Value                          | Usage |
|-------------------------------|--------------------------------|-------|
| `--color-bg-page-dark`        | `#0F172A`                      | Page background (Layer 0) |
| `--color-surface-1-dark`      | `rgba(15, 23, 42, 0.72)`       | Main app surface (Layer 1) |
| `--color-surface-2-dark`      | `rgba(15, 23, 42, 0.82)`       | Elevated cards (Layer 2) |
| `--color-glass-dark`          | `rgba(15, 23, 42, 0.72)`       | Glass panels |
| `--color-border-subtle-dark`  | `rgba(241, 245, 249, 0.10)`    | Very soft hairline borders |
| `--color-border-medium-dark`  | `rgba(241, 245, 249, 0.18)`    | Medium strength borders |

---

## 4. Text Colors

| Token Name               | Light Mode     | Dark Mode      | Usage |
|--------------------------|----------------|----------------|-------|
| `--color-text-primary`   | `#0F172A`      | `#F1F5F9`      | Headings, primary body text |
| `--color-text-secondary` | `#475569`      | `#94A3B8`      | Metadata, secondary text |
| `--color-text-muted`     | `#64748B`      | `#64748B`      | Disabled, low priority |
| `--color-text-on-orange` | `#FFFFFF`      | `#FFFFFF`      | Text on orange buttons |
| `--color-text-on-teal`   | `#FFFFFF`      | `#FFFFFF`      | Text on teal buttons |

---

## 5. Accent & Interaction Colors

| Token Name                  | Hex       | Usage |
|-----------------------------|-----------|-------|
| `--color-accent-teal`       | `#007970` | Focus rings, active states, links |
| `--color-accent-orange`     | `#E07B2C` | Primary CTAs, pending actions |
| `--color-focus-ring`        | `#007970` | Keyboard focus indicator |

---

## 6. Usage Rules

- **Orange** should be used **strategically** — primarily for CTAs, pending approvals, signatures, and escalations. Avoid scattering it everywhere.
- **Teal** is the workhorse color for stable, compliant, and secondary actions.
- In **light mode**, favor stronger shadows and subtle tints over heavy transparency.
- In **dark mode**, glass can be slightly more opaque while still feeling elegant.

---

## 7. Token Export (Recommended for Engineering)

```json
{
  "color": {
    "brand": {
      "orange": "#E07B2C",
      "teal": "#007970",
      "navy": "#0F172A"
    },
    "semantic": {
      "success": "#10B981",
      "warning": "#F59E0B",
      "error": "#EF4444",
      "info": "#3B82F6"
    },
    "surface": {
      "light": {
        "page": "#F8FAFC",
        "level1": "#FFFFFF",
        "level2": "#FFFFFF",
        "glass": "rgba(255, 255, 255, 0.72)"
      },
      "dark": {
        "page": "#0F172A",
        "level1": "rgba(15, 23, 42, 0.72)",
        "level2": "rgba(15, 23, 42, 0.82)",
        "glass": "rgba(15, 23, 42, 0.72)"
      }
    }
  }
}
```

---

*This token set is the single source of truth for all Care Indeed production interfaces.*


---

<a name="complete-v2-design-system-documentation"></a>

## SOURCE: COMPLETE_V2_DESIGN_SYSTEM_DOCUMENTATION.md

# CareIndeed Home Health — v2 Design System
## Complete Documentation (All Files Combined)

**Generated:** May 2026  
**Source:** `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/`  
**Note:** This file contains the full content of every markdown document in the design system folder. Original files have not been modified or deleted.

---

> **How to use this file:**  
> Each document is separated by `---` and starts with its original filename as a heading.  
> You can use Ctrl+F (or Cmd+F) to search for a specific filename.

---

## TABLE OF CONTENTS (Quick Reference)

### Foundations & Core
- DESIGN_SPEC.md
- V2_DESIGN_DIRECTION_SUMMARY.md
- GLASS_LAYERING_CHEAT_SHEET.md
- LIGHT_MODE_ELEVATION_SYSTEM.md
- DESIGN_TOKEN_EXPORT_GUIDE.md
- DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md
- COLOR_TOKENS.md
- TYPOGRAPHY_SCALE.md
- MOTION_ANIMATION_PRINCIPLES.md
- MOTION_TOKEN_IMPLEMENTATION.md
- MOTION_IMPLEMENTATION_EXAMPLES.md

### Guidelines & Standards
- DOS_AND_DONTS.md
- COMPONENT_GUIDELINES.md
- COMPONENT_USAGE_EXAMPLES.md
- COMPONENT_ANATOMY_AND_CODE_EXAMPLES.md
- ICONOGRAPHY_GUIDELINES.md
- ICON_LIBRARY_EXPORT_GUIDE.md
- ICON_IMPLEMENTATION_GUIDE.md
- DARK_VS_LIGHT_MODE_GUIDE.md
- ACCESSIBILITY_GUIDELINES.md
- ACCESSIBILITY_COMPONENT_CHECKLIST.md
- ACCESSIBILITY_IMPLEMENTATION_GUIDE.md
- CONTENT_MICROCOPY_GUIDELINES.md
- CONTENT_EXAMPLES_GALLERY.md
- CHART_VISUAL_GUIDELINES.md

### Implementation, Handoff & Migration
- BUILDING_V2_SCREEN_PLAYBOOK.md
- FIGMA_TO_CODE_MAPPING.md
- ENGINEERING_HANDOFF_GUIDE.md
- FIGMA_KIT_SPEC.md
- TAILWIND_AND_TOKEN_INTEGRATION.md
- MIGRATION_AND_ROLLOUT_STRATEGY.md
- DESIGN_SYSTEM_GOVERNANCE.md
- DESIGN_SYSTEM_RELEASE_PROCESS.md
- DESIGN_CRITIQUE_AND_REVIEW_PROCESS.md
- VISUAL_REGRESSION_TESTING_STRATEGY.md
- PERFORMANCE_AND_LOADING_STRATEGY.md
- GLOBAL_ERROR_HANDLING_PATTERNS.md
- ADVANCED_FORM_IMPLEMENTATION_PATTERNS.md

### Specialized Workflow Specifications
- CES_BOARD_VISUAL_LANGUAGE.md
- CALENDAR_VISUAL_PATTERNS.md
- ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md
- TASK_URGENCY_HIERARCHY_SPEC.md
- EVIDENCE_CAPTURE_SPECIFICATION.md
- SIGNATURE_CAPTURE_BEST_PRACTICES.md
- EMPTY_STATE_PATTERNS.md
- LOADING_STATE_GUIDELINES.md
- ERROR_HANDLING_GUIDELINES.md
- FORM_VALIDATION_PATTERNS.md
- HOVER_FOCUS_ACTIVE_STATES.md
- GESTURE_INTERACTION_GUIDELINES.md
- VOICE_BRAD_INTEGRATION_HOOKS.md
- PRINT_PDF_CONSISTENCY_GUIDELINES.md
- OFFLINE_FIRST_AND_SYNC_PATTERNS.md
- SECURITY_AND_PRIVACY_IN_UI.md

### Team Processes, Training & Long-term Health
- DESIGN_SYSTEM_ONBOARDING_GUIDE.md
- TRAINING_MATERIALS_STRUCTURE.md
- ASSET_AND_ILLUSTRATION_STRATEGY.md
- DESIGN_SYSTEM_HEALTH_AND_METRICS.md
- DESIGN_SYSTEM_METRICS_DASHBOARD.md
- MASTER_IMPLEMENTATION_READINESS_CHECKLIST.md
- RESPONSIVE_BEHAVIOR_MATRIX.md
- V2_MOCKUP_GENERATION_BRIEF.md
- README.md

---

# START OF COMBINED DOCUMENTS

---


---

<a name="component-anatomy-and-code-examples"></a>

## SOURCE: COMPONENT_ANATOMY_AND_CODE_EXAMPLES.md

# Component Anatomy & Code Examples — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document provides detailed anatomy, props, states, and code examples for the most frequently used canonical components. Engineers should refer to this when implementing or reviewing components.

---

## 2. Button

### Anatomy
- Label (required)
- Optional leading icon
- Loading spinner (replaces label when `loading={true}`)
- Focus ring (teal)

### Props
```ts
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}
```

### Code Example
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" onPress={handleSignAndLock}>
  Sign & Lock
</Button>

<Button variant="secondary" loading={isUploading}>
  Capture Evidence
</Button>
```

### States
- Default
- Hover (desktop)
- Focus (teal ring)
- Active / Pressed
- Loading
- Disabled

---

## 3. Card / GlassPanel

### Recommended Usage
- Use `ui/Card` for most elevated content (Layer 2)
- Use `GlassPanel` for lower-level or custom surfaces

### Props
```ts
interface CardProps {
  layer?: 1 | 2;
  padding?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  children: ReactNode;
}
```

### Code Example
```tsx
<Card layer={2} padding="md" onPress={handleTaskPress}>
  <TaskContent />
</Card>
```

---

## 4. Input

### Anatomy
- Label (always shown above)
- Input field
- Optional helper text
- Error message (when invalid)

### Props
```ts
interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}
```

### Code Example
```tsx
<Input
  label="Patient Name"
  value={patientName}
  onChangeText={setPatientName}
  error={errors.patientName}
  helperText="Enter the legal name as it appears on the ID"
/>
```

---

## 5. Badge

### Props
```ts
interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  children: ReactNode;
}
```

### Code Example
```tsx
<Badge variant="error">Overdue 4d</Badge>
<Badge variant="success">Completed</Badge>
```

---

## 6. EmptyState

### Props
```ts
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode; // Usually a Button
}
```

### Code Example
```tsx
<EmptyState
  title="No evidence captured yet"
  description="Capture a clear photo of the signed document."
  action={<Button variant="primary">Capture Evidence</Button>}
/>
```

---

## 7. Loading States

| Type       | When to Use                     | Component |
|------------|----------------------------------|---------|
| Skeleton   | Lists, cards, dashboards         | `ui/Skeleton` or `Loading type="skeleton"` |
| Spinner    | Buttons, small inline areas      | `Loading type="spinner"` |
| Full screen| Major actions (signing, activation) | `Loading type="full"` |

---

## 8. Best Practices

- Always import from `@/components/ui/*` (or the designated barrel export)
- Never hardcode colors, spacing, or radius values
- Compose complex screens using the primitives above instead of building one-off components
- Review `BUILDING_V2_SCREEN_PLAYBOOK.md` before starting a new screen

---

*This document will be expanded as more components are finalized in the `ui/` folder.*

---

**Related:** `COMPONENT_GUIDELINES.md`, `BUILDING_V2_SCREEN_PLAYBOOK.md`, `FIGMA_TO_CODE_MAPPING.md`


---

<a name="component-guidelines"></a>

## SOURCE: COMPONENT_GUIDELINES.md

# Component Guidelines — CareIndeed Home Health (v2)

**Version:** 1.1  
**Date:** May 2026

---

## Overview

This document provides detailed guidelines for the core components in the CareIndeed v2 design system.

All components must follow:
- Premium glassmorphic aesthetic (light + dark)
- Strict 3-layer glass system
- Care Indeed color palette only
- Mobile-first responsive behavior
- High accessibility standards (WCAG 2.2 AA)

---

## 1. Button

### Variants
- **Primary** (Orange) — Main actions
- **Secondary** (Teal) — Supporting actions
- **Ghost** — Tertiary actions
- **Danger** — Destructive actions

### States
- Default, Hover, Active, Disabled, Loading

### Rules
- Minimum height: 44px on mobile
- Use Montserrat or Inter 600 for labels
- Icons (if used) should be 16–20px

**Do:** Keep labels short and action-oriented (“Sign & Lock”, “Capture Evidence”)

**Don’t:** Use multiple primary buttons on one screen.

---

## 2. Card

### Variants
- **Default Card** (Layer 1)
- **Elevated Card** (Layer 2) — for actionable content
- **Glass Card** — when visual lightness is needed

### Rules
- Consistent internal padding (16px–24px)
- Clear visual separation via shadow or soft border
- Never mix hard borders with glass in light mode

**Do:** Use Layer 2 elevation for anything the user needs to act on.

**Don’t:** Stack cards with no breathing room.

---

## 3. Form Field

### Anatomy
- Label (above field)
- Input / Textarea / Select / Signature
- Helper text or error message
- Optional icon

### States
- Default, Focused, Filled, Error, Disabled

**Do:**
- Make fields large and comfortable (min 48px height on mobile)
- Show validation inline
- Use clear, left-aligned labels

**Don’t:**
- Use placeholder as the only label
- Hide error messages until form submission

---

## 4. Navigation

### Mobile
- Bottom navigation (max 5 tabs)
- “More” sheet for secondary items

### Desktop
- Left sidebar (collapsible)
- Clear active state with teal accent

**Do:** Prioritize the most frequent tasks in primary navigation.

**Don’t:** Change navigation patterns between similar screens.

---

## 5. Status & Badges

### Semantic Colors
- Teal = Compliant / Stable
- Orange = Pending / Action Required
- Red = Failed / Blocked / Overdue
- Grey = Neutral / In Progress

**Do:** Always pair color with clear text.

**Don’t:** Create new status colors without system approval.

---

## 6. Status of This Document

This is a living document. More components will be added:

- Tabs & Navigation patterns
- Tables / DataGrid
- Empty States
- Loading States
- Modals & Bottom Sheets
- Signature Component
- Evidence Upload Component

---

**Next:** Expand each component with full anatomy, spacing, and code examples.

---

*Good components disappear — the user just gets their work done.*


---

<a name="component-usage-examples"></a>

## SOURCE: COMPONENT_USAGE_EXAMPLES.md

# Component Usage Examples — CareIndeed Home Health (v2)

**Version:** 0.8 (Initial Draft)  
**Date:** May 2026

---

## Purpose

This document provides real-world usage examples for the core components in the CareIndeed v2 design system. It shows both correct and incorrect usage to help maintain consistency.

---

## 1. Button

### Correct Usage

**Primary Button (Orange)**
- Use for the main action on a screen (e.g., “Sign & Lock”, “Submit”, “Capture Evidence”).
- Only one primary button should be visible per screen in most cases.

**Secondary Button (Teal)**
- Use for supporting actions (e.g., “Review Document”, “Add Note”).

**Ghost Button**
- Use for tertiary actions or when you need a button that doesn’t compete visually.

### Incorrect Usage

- Multiple primary (orange) buttons on the same screen.
- Using orange for non-primary actions (e.g., “Cancel”, “Back”).
- Small buttons on mobile (< 44px height).

---

## 2. Card

### Correct Usage

**Elevated Card (Layer 2)**
- Use for actionable content (tasks, evidence items, policy cards, batches).
- Should feel clearly elevated from the background.

**Default Card (Layer 1)**
- Use for grouping information that is not directly actionable.

### Incorrect Usage

- Using the same elevation for every card (flat hierarchy).
- Stacking cards with no breathing room.
- Using dark borders on light mode cards.

---

## 3. Form Field

### Correct Usage

- Large, comfortable inputs (minimum 48px height on mobile).
- Clear labels above the field.
- Helpful helper text when needed.
- Clear error states with helpful messaging.

### Incorrect Usage

- Tiny input fields on mobile.
- Using placeholder text as the only label.
- Hiding error messages until the user submits the form.

---

## 4. Status Badge

### Correct Usage

- Use semantic colors consistently:
  - Teal = Compliant / Complete
  - Orange = Pending / Action Required
  - Red = Failed / Blocked / Overdue
- Always pair color with clear text.

### Incorrect Usage

- Using bright or neon versions of brand colors for status.
- Creating new status colors without adding them to the system.

---

## 5. Navigation

### Mobile Bottom Navigation

- Maximum 5 primary tabs.
- Use “More” sheet for secondary destinations.
- Prioritize the most frequent tasks.

### Desktop Sidebar

- Collapsible for power users.
- Clear active state with teal accent.
- Group related items logically.

---

## 6. Glass Layering Examples

**Good Example:**
- Page background (Layer 0)
- Main dashboard surface (Layer 1)
- Task card (Layer 2)
- Confirmation dialog (Layer 2 or 3 if needed)

**Bad Example:**
- Stacking 4+ translucent panels on top of each other.
- Using dark borders on light glass cards.

---

## 7. Status of This Document

This is an early draft. More components and visual/code examples will be added over time, including:

- Tabs
- Tables / DataGrid
- Empty States
- Loading States
- Modals & Bottom Sheets
- Signature Component
- Evidence Upload Component

---

**Next:** Expand this document with screenshots + code snippets for each component.

---

*Good usage examples help maintain consistency as the team scales.*


---

<a name="content-examples-gallery"></a>

## SOURCE: CONTENT_EXAMPLES_GALLERY.md

# Content Examples Gallery — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This gallery provides real-world, approved microcopy examples for the most common surfaces in the CareIndeed platform. Use these as the starting point for new screens to maintain consistent voice and tone.

---

## 2. Voice & Tone Summary

- **Professional but warm** — Competent and caring, never cold or robotic.
- **Clear and direct** — Clinicians are busy. Get to the point.
- **Calm under pressure** — Even when showing urgency, the language should reduce anxiety.
- **Action-oriented** — Tell the user what they can do.

---

## 3. CES / Tasks

### Task List / Board
- Empty state: “You have no tasks due today. Great work staying on top of things.”
- Overdue badge: “Overdue 3d”
- Due today: “Due today”
- Quick action: “Capture Evidence”
- Long press menu: “Mark Complete”, “Request Help”, “View Details”

### Task Detail
- “This task is required for patient safety and regulatory compliance.”
- “Evidence captured 2h ago by Maria Lopez, RN”

---

## 4. eCign Signing

- Before signing: “You are about to electronically sign this document as **Jane Doe, RN**. This action is legally binding.”
- Affirmation checkbox: “I confirm that I have reviewed this document and that this is my electronic signature.”
- Success: “Document signed and locked. A copy has been added to the patient record.”
- Error: “We couldn’t complete the signature. Please try again or contact support.”

---

## 5. Evidence Center

- “No evidence has been captured for this requirement yet.”
- Primary action: “Capture Evidence”
- After upload: “Evidence attached successfully. Thank you.”
- “This evidence was captured on [date] and is linked to Task #48291.”

---

## 6. Onboarding V2

### Batch View
- “This batch contains 12 units and is currently 67% complete.”
- “3 gates are ready for your review.”

### Unit Detail
- “This unit has cleared all gates and is ready for final activation.”
- “Evidence needed: Medication Administration Record (last 30 days)”

### Activation
- “You are about to activate 12 units. This will notify the assigned clinicians and begin the compliance tracking period.”
- Final button: “Activate Batch”

---

## 7. Policy Library & Detail

- “This policy was last reviewed on March 12, 2026.”
- “You have not yet acknowledged this policy.”
- Acknowledge button: “I have read and understand this policy”
- “Your acknowledgment was recorded on [date].”

---

## 8. Calendar

- “You have 4 items due today.”
- “3 overdue tasks from previous days.”
- Empty day: “No scheduled tasks. Enjoy the breathing room.”

---

## 9. Error & System Messages

- Network error: “Connection lost. Your changes have been saved locally and will sync when you’re back online.”
- Generic failure: “Something went wrong on our end. We’ve logged the issue and are looking into it.”
- Validation: “Please provide a clear signature before locking the document.”

---

## 10. Buttons & CTAs (Tone Guide)

**Recommended primary actions:**
- “Capture Evidence”
- “Sign & Lock”
- “Mark Complete”
- “Submit for Review”
- “Activate Batch”
- “Acknowledge Policy”

**Avoid:**
- “Submit” (too generic)
- “Save” (unless it’s a draft)
- “Continue” (use more specific language when possible)

---

## 11. Empty States (Examples)

- CES: “No tasks match your current filters.”
- Evidence: “No evidence has been captured for this requirement.”
- Onboarding: “This batch has no units assigned yet.”
- Calendar: “You have no scheduled items for this day.”

---

*Consistent language builds trust and reduces training time.*

---

**Next:** Expand this gallery with more surfaces (Audit, Reports, Clinician Profiles, etc.) as the platform grows.


---

<a name="content-microcopy-guidelines"></a>

## SOURCE: CONTENT_MICROCOPY_GUIDELINES.md

# Content & Microcopy Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Voice & Tone

The CareIndeed platform should sound:

- **Professional but warm** — We are healthcare professionals helping other professionals.
- **Clear and direct** — Users are often under time pressure. Avoid fluff.
- **Confident and trustworthy** — The language should reinforce that the platform is reliable and compliant.
- **Respectful** — Never condescending or overly casual.

**Avoid:**
- Overly corporate jargon
- Playful or humorous language in operational flows
- Vague phrases like “Something went wrong” or “Please try again later”

---

## 2. General Writing Principles

- Use **active voice** whenever possible.
- Be **specific** — “Sign document” is better than “Complete action”.
- Use **sentence case** for buttons, labels, and headings (unless it’s a proper name).
- Keep labels and button text short (ideally under 4 words).
- Use **consistent terminology** across the product (e.g., always say “Evidence” not sometimes “Attachment” or “Document”).

---

## 3. Key Terminology (Standardized)

| Preferred Term          | Avoid                              | Context |
|-------------------------|------------------------------------|-------|
| Evidence                | Attachment, File, Document         | When referring to uploaded/proof items |
| Signature / Attestation | Sign-off, Consent, Acknowledgment  | When legally binding action is required |
| Task                    | Item, Requirement, Obligation      | In CES and task management |
| Batch                   | Group, Cohort, Onboarding Group    | In Onboarding V2 |
| Gate                    | Block, Requirement, Checkpoint     | In Onboarding V2 |
| Locked                  | Completed, Finalized, Sealed       | After eCign signing |
| Pending                 | Waiting, In Progress (when unclear) | Status language |

---

## 4. Button & Action Language

### Primary Actions
- “Sign & Lock”
- “Capture Evidence”
- “Submit for Review”
- “Activate Onboarding”
- “Resolve Gate”

### Secondary Actions
- “Review Document”
- “View Evidence”
- “Add Note”
- “Skip for Now”

### Destructive / Caution Actions
- “Delete Evidence”
- “Cancel Signing”
- “Remove Signer”

**Rule:** Buttons should clearly communicate the outcome of the action.

---

## 5. Form Labels & Helper Text

### Good Examples
- Label: “Full Legal Name”
  - Helper: “This must match the name on your government ID.”
- Label: “Reason for Exception”
  - Helper: “This will be visible to the compliance team.”

### Bad Examples
- Label: “Name” (too vague)
- Helper: “Enter your name here.” (useless)

**Best Practice:** Helper text should explain *why* the field matters or what format is expected, not just repeat the label.

---

## 6. Empty States

Empty states should:
- Explain why the section is empty
- Tell the user what they can do next (if anything)
- Feel calm and professional (not cute or overly branded)

**Example:**
> “No evidence captured yet”
> “Capture photos or documents during your visit to build a complete record.”

---

## 7. Error Messages

Error messages should be:
- Clear and specific
- Helpful (tell the user what to do)
- Calm (never alarming unless it’s a true emergency)

**Good:**
- “We couldn’t lock this document. Please check your connection and try again.”
- “This signature is required before the task can be marked complete.”

**Bad:**
- “Error 4721”
- “Something went wrong. Please try again.”

---

## 8. Status Language

| Status       | Recommended Text                     | Notes |
|--------------|--------------------------------------|-------|
| Compliant    | “Compliant”                          | Positive, clear |
| Pending      | “Pending Signature” / “Pending Review” | Be specific when possible |
| Blocked      | “Blocked – Missing Evidence”         | Explain the blocker |
| Overdue      | “Overdue”                            | Use red + clear context |
| In Progress  | “In Progress”                        | Neutral |

---

## 9. Onboarding & Training Language

Onboarding and Journey content should feel:
- Encouraging but not condescending
- Clear about what is required vs. recommended
- Respectful of the user’s time and professionalism

**Example:**
- “Complete this module to maintain your compliance status.”
- Not: “Great job! You’re almost there!”

---

## 10. Future Work

- Create a full glossary of standardized terms.
- Build error message templates for common failure types.
- Develop onboarding microcopy templates for different trigger types (New Hire, Role Change, Annual, etc.).

---

*Good microcopy reduces support tickets, improves compliance rates, and makes users feel respected.*


---

<a name="dark-vs-light-mode-guide"></a>

## SOURCE: DARK_VS_LIGHT_MODE_GUIDE.md

# Dark vs Light Mode Usage Guide — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Overview

CareIndeed supports both **Dark Mode** (primary for operational/compliance work) and **Light Mode** (secondary, for specific workflows).

The two modes are not just color inversions — they have different elevation strategies and usage contexts.

---

## 2. Primary vs Secondary Mode

| Mode        | Priority     | Recommended For                              | Visual Character                  |
|-------------|--------------|----------------------------------------------|-----------------------------------|
| **Dark Mode**   | Primary      | CES, Evidence, Audit, Governance, Policy Detail, eCign, Reports | Deep, premium, focused, high-end |
| **Light Mode**  | Secondary    | Onboarding flows, simple forms, field clinician quick tasks, acknowledgments | Clean, calm, approachable         |

**Rule of thumb:**
- If the screen is **operationally heavy** or **compliance-critical** → Dark Mode (default)
- If the screen is **form-heavy** or used by **field clinicians** in bright environments → Light Mode

---

## 3. Visual Treatment Differences

### Dark Mode
- Deeper glassmorphism (more opacity + blur)
- Stronger visual depth and layering
- Navy + Charcoal base
- Teal and warm orange stand out clearly
- More forgiving with elevation

### Light Mode
- Shallower glass effect
- **Very subtle hairline borders** (`#E5E4E3` range)
- Stronger reliance on **soft shadows** for elevation
- Slightly cooler background (`#F8FAFC`)
- More conservative use of transparency (to avoid white-on-white)

**Never** use the same glass treatment in both modes without adjustment.

---

## 4. When to Force a Mode

Some flows should **always** appear in a specific mode, regardless of user preference:

| Flow                        | Recommended Mode | Reason |
|----------------------------|------------------|--------|
| eCign Signing              | Light Mode       | High trust, signature clarity, reduced eye strain |
| Evidence Capture (photo)   | Light Mode       | Better camera preview and document visibility |
| Onboarding Activation      | Light Mode       | Feels more welcoming and less intimidating |
| Major Compliance Reports   | Dark Mode        | Feels more serious and premium |
| Audit Readiness Dashboard  | Dark Mode        | High-stakes operational view |

---

## 5. User Preference Handling

- Respect system preference (`prefers-color-scheme`) as the default.
- Allow users to override per session or globally.
- When overriding, clearly communicate that some flows may still appear in the other mode for usability reasons.

---

## 6. Glass & Elevation Adjustments

| Aspect                    | Dark Mode                          | Light Mode                              |
|---------------------------|------------------------------------|-----------------------------------------|
| Glass opacity             | 70–82%                             | 80–90% (less transparent)               |
| Border strength           | Medium                             | Very soft hairline                      |
| Shadow strength           | Moderate                           | Stronger (to compensate for less depth) |
| Background tinting        | Subtle                             | More important for separation           |

---

## 7. Recommendations

- Default the app to **Dark Mode** for most operational users (DONs, compliance, surveyors).
- Default to **Light Mode** for field clinicians during onboarding and signing flows.
- Test critical flows (especially signing and evidence capture) in both modes on real devices.
- Never treat light mode as an afterthought — it must feel equally premium.

---

## 8. Future Work

- Define exact glass opacity and shadow values per mode in the design tokens.
- Create side-by-side examples of the same screen in both modes.
- Decide on default mode per user role (e.g., Clinician vs Compliance Officer).

---

*Dark mode currently carries the premium brand feel. Light mode must match it in quality, not just invert the colors.*


---

<a name="design-critique-and-review-process"></a>

## SOURCE: DESIGN_CRITIQUE_AND_REVIEW_PROCESS.md

# Design Critique & Review Process — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines how design reviews and critiques should be conducted to maintain quality and consistency with the v2 design system.

---

## 2. Types of Reviews

### 1. Design System Review (Required for system changes)
- When a new component, variant, or token change is proposed.
- Attendees: Design Systems Lead + relevant designers + engineers.
- Focus: Does this follow the principles? Does it create drift?

### 2. Feature Design Review (Production Surfaces)
- For any new feature or major update on CES, Onboarding V2, Evidence, eCign, Calendar, Policy, etc.
- Must include review against v2 guidelines and relevant workflow spec.
- Should check use of canonical components and tokens.

### 3. Visual QA Review (Before Release)
- Focus on implementation fidelity to the design.
- Check glass layering, spacing, typography, states, and mobile behavior.

---

## 3. Review Checklist (Minimum)

- Follows 3-layer glass system
- Uses only approved tokens and components
- Respects desktop container rule (Layer 0 visible)
- Mobile-first patterns applied correctly
- Accessibility checklist reviewed
- Content follows approved voice and microcopy
- Loading, empty, and error states are appropriate

---

## 4. Tools & Artifacts

- Figma comments for design-level feedback
- Notion or Slack thread for decisions
- PR description must reference relevant design system documents

---

## 5. Do’s and Don’ts

**✅ Do**
- Review against the documented system, not personal taste.
- Give constructive feedback with references to guidelines.
- Involve engineers early on complex interactions.

**❌ Don’t**
- Approve designs that clearly violate core principles without strong justification.
- Skip reviews on production surfaces.

---

*Good critique protects the integrity of the design system.*

---

**Related Documents:**
- `DESIGN_SYSTEM_GOVERNANCE.md`
- `BUILDING_V2_SCREEN_PLAYBOOK.md`


---

<a name="design-spec"></a>

## SOURCE: DESIGN_SPEC.md

# CareIndeed Home Health — Design System Specification (v2)

**Status:** Active Direction  
**Date:** May 2026  
**Focus:** Mobile-First + Desktop Enhanced, Premium Glassmorphic

---

## 1. Visual Direction (Locked)

**Primary / Strongest Aesthetic (v2 Base):**
- Deep, elegant dark glassmorphic (inspired by CES Board mobile + Evidence Center desktop)
- Navy + Charcoal base with subtle frosted depth
- Teal (#007970) and restrained warm orange accents
- Clean, modern, clinical, expensive, professional

**Secondary (Light Mode):**
- Soft light glassmorphic
- Very subtle hairline borders only (no hard/dark borders)
- Layered soft shadows + light background tints for separation
- Maintains the premium glass feeling while solving white-on-white issues

---

## 2. Glass Layering System (Strict Rule)

**Maximum of 3 glass layers** are allowed in the interface.

### Layer Definitions

| Layer | Name                          | Purpose                                      | Visual Treatment                                      | When to Use |
|-------|-------------------------------|----------------------------------------------|-------------------------------------------------------|-------------|
| **0** | Dark Atmospheric Background   | Deepest background layer                     | Dark navy/charcoal with subtle texture or gradient    | Page / screen background |
| **1** | Main App Surface              | Primary working surface                      | Frosted glass panel (main content area)               | Default surface for most screens |
| **2** | Elevated Actionable Surface   | Cards, dialogs, and focused components       | Slightly more opaque + stronger shadow / definition   | Task cards, forms, modals, bottom sheets, detail panels |
| **3** | Exception Layer               | Only when functionally necessary             | Highest elevation + strongest definition              | Rare cases only (e.g., floating action menus, critical multi-layer confirmations) |

### Desktop Main Surface Container Rule (Critical for Glassmorphism)

**On desktop (≥1024px), the main Layer 1 app surface must NEVER take up the full viewport width.**

To strongly enhance the premium glassmorphic effect:

- The Layer 1 main content area must be **constrained** with a reasonable `max-width` (recommended 1280px–1600px depending on content density).
- Horizontal margins/padding on the sides must be visible (minimum 32–48px on 1440px screens, more on larger displays).
- This allows the rich **Layer 0 atmospheric background** to show on the left, right, top, and bottom — creating beautiful depth and making the main glass surface feel like a distinct, elevated panel.

This rule is directly inspired by the current high-quality desktop implementations (see referenced Policy Library desktop view).

**Why this matters:**
- Full-bleed Layer 1 on desktop kills the glass feeling and makes the interface feel flat and heavy.
- Visible Layer 0 around the main surface is one of the strongest contributors to the "expensive, premium" perception.
- Cards (Layer 2) inside the constrained Layer 1 then get proper elevation contrast.

**Implementation guidance:**
- Use a centered container with `max-width` + `margin: 0 auto` + side padding for the main content area on desktop routes.
- Mobile and tablet remain closer to full-width (as they have less room for breathing room).

### Strict Rules

- **Layer 3 is not default.** It should only be used when it directly supports a critical function and cannot be solved with Layer 2.
- **Do not stack glass on glass endlessly.** Over-layering kills the premium, calm, and expensive feeling.
- In **light mode**, Layer 2 should rely more on stronger shadows and very subtle borders rather than heavy transparency.
- In **dark mode**, Layer 2 can use slightly more opacity and depth, but still stay elegant and soft.

**Philosophy**:  
The interface should feel like a calm, focused operating system — not a stack of floating windows.

---

## 3. Key Rules

- **No hard or dark borders** in light mode (breaks the glass aesthetic).
- Light mode separation comes from: soft shadows, subtle background differentiation, typography weight, and restrained accent usage.
- Dark mode can use slightly stronger definition but still elegant and soft.
- Every screen must feel like part of the same premium compliance operating system.
- **Maximum 3 glass layers** (Layer 0, 1, 2). Layer 3 only by exception.

---

## 4. Current v2 Mockup Status

v2 mockups are being generated in:
- `mockup/Mobile/v2/`
- `mockup/Desktop/v2/`

**Already delivered in v2 (as of now):**
- Dashboard (Mobile + Desktop)
- CES Board (Mobile + Desktop)
- Policy Detail (Mobile + Desktop)
- eCign Signing (Mobile + Desktop)
- Onboarding Batch View (Mobile + Desktop)
- Onboarding Activation (Mobile + Desktop)
- Onboarding Dashboard (Desktop)
- Evidence Capture (Mobile + Desktop)
- Evidence List (Mobile)
- CES Task Detail (Mobile)
- CES My Tasks (Desktop)
- CES Reports (Mobile + Desktop)
- Audit Readiness (Mobile)
- Policies Library (Mobile + Desktop)
- Policy Search (Mobile)

**Next in queue (prioritized):**
1. CES Calendar – Mobile (Light v2)
2. CES Calendar – Desktop (Light v2)
3. Journey Home / Module List – Mobile (Light v2)
4. Journey Home / Module List – Desktop (Light v2)
5. Journey Module Player – Mobile (Light v2)
6. Journey Module Player – Desktop (Light v2)

---

## 5. Notes

- All future mockups should follow the v2 aesthetic and the **3-layer glass rule**.
- Vary layouts per screen type (do not make every page look identical).
- Pull good elements from previous successful designs (typography, card treatment, spacing, accent usage).
- Keep the feeling expensive, clean, modern, clinical, and professional.

---

*This document will be updated as the v2 direction evolves.*


---

<a name="design-system-governance"></a>

## SOURCE: DESIGN_SYSTEM_GOVERNANCE.md

# Design System Governance Process — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines how the CareIndeed v2 design system will be maintained, evolved, and protected over time. Good governance prevents drift and ensures the system remains useful as the product grows.

---

## 2. Roles & Responsibilities

| Role                        | Responsibilities |
|-----------------------------|------------------|
| **Design Systems Lead**     | Owns the overall vision, tokens, and component library. Final approver on major changes. |
| **Product Designers**       | Propose new components or variants. Must follow the Figma Kit and documentation. |
| **Frontend Engineers**      | Implement and maintain `ui/` components. Responsible for code quality and token usage. |
| **QA**                      | Validates that implemented components match the documented specs and visual guidelines. |

---

## 3. Change Process

### Small Changes (No review needed)
- Minor copy updates in documentation
- Adding new icon to the icon library (after design approval)
- Small bug fixes in existing components

### Medium Changes (Design Systems review required)
- Adding a new variant to an existing component
- Updating token values
- Changing spacing or radius scale
- New microcopy patterns

### Major Changes (Full review + approval)
- Creating a new canonical component
- Changing the glass layering rules
- Modifying the color palette or typography scale
- Introducing new motion principles
- Changes that affect multiple production surfaces

**Process for Major Changes:**
1. Designer/Engineer creates a short proposal (1 page) in Notion or Slack.
2. Design Systems Lead reviews within 3 business days.
3. If approved, the change is implemented in Figma + code.
4. Documentation is updated.
5. Team is notified via #design-system-updates channel.

---

## 4. Contribution Guidelines

- All new components must have:
  - Figma component with variants
  - Documentation in `COMPONENT_ANATOMY_AND_CODE_EXAMPLES.md`
  - Accessibility checklist completed
  - Usage examples
- No one-off components in production code. Use or extend the `ui/` library.

---

## 5. Deprecation Process

When a component or pattern is no longer recommended:

1. Mark it as **Deprecated** in documentation.
2. Add a clear replacement recommendation.
3. Set a removal date (minimum 2 releases or 3 months).
4. Add ESLint warning (if possible).
5. Remove only after all usages have been migrated.

---

## 6. Versioning

- Use **Semantic Versioning** for the design system.
  - Major = Breaking visual or API changes
  - Minor = New components or non-breaking improvements
  - Patch = Bug fixes and small refinements

- The version should be visible in Storybook and in the Figma file cover.

---

## 7. Communication Channels

- **#design-system-updates** (Slack) — For announcements and changes
- **Design Systems Notion page** — Central source of truth for proposals and decisions
- **Monthly Design Systems Sync** — 30-minute meeting to review upcoming changes

---

## 8. Success Metrics for Governance

- Low number of custom/one-off components in production
- High adoption rate of new v2 components
- Fast turnaround time for design system change requests
- Consistent visual quality across production surfaces

---

*Good governance turns a design system from a one-time effort into a living, sustainable product.*

---

**Related Documents:**
- `ENGINEERING_HANDOFF_GUIDE.md`
- `FIGMA_KIT_SPEC.md`
- `MIGRATION_AND_ROLLOUT_STRATEGY.md`


---

<a name="design-system-health-and-metrics"></a>

## SOURCE: DESIGN_SYSTEM_HEALTH_AND_METRICS.md

# Design System Health, Metrics & Success Tracking — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines how to measure whether the v2 design system is healthy and delivering value over time.

---

## 2. Key Success Metrics

### Adoption Metrics
- % of production screens using only v2 components
- Number of new features built using the design system (vs. custom code)
- Adoption rate of new components after release

### Consistency Metrics
- Number of visual regression violations per month
- Number of one-off / custom components created in production code
- Design review feedback volume related to styling drift

### Efficiency Metrics
- Average time from design handoff to production for new screens
- Number of design system-related bugs reported by QA
- Developer satisfaction with the design system (quarterly survey)

### Quality Metrics
- Accessibility score on key production surfaces
- Performance impact of design system components
- User-reported issues related to clarity or usability of the interface

---

## 3. Recommended Tracking Methods

- **Automated**: 
  - ESLint rules counting usage of legacy components
  - Visual regression dashboards
  - Bundle size tracking for `ui/` components

- **Manual**:
  - Quarterly design system health review
  - Developer and designer satisfaction surveys
  - Design review retrospectives

---

## 4. Health Dashboard (Recommended)

Create a simple internal dashboard showing:
- Adoption percentage over time
- Top 10 most used components
- Number of deprecated components still in use
- Open design system improvement requests

---

## 5. Review Cadence

- **Monthly**: Quick check on adoption and regression metrics
- **Quarterly**: Full design system health review with stakeholders
- **Yearly**: Strategic review of whether the system still meets business needs

---

## 6. Success Criteria (After 12 months)

- >85% of production surfaces using v2 components
- <5 active one-off component patterns in production
- Positive or neutral developer satisfaction scores
- Measurable reduction in UI-related QA time

---

*A healthy design system is one that is widely adopted, consistently applied, and continuously improved.*

---

**Related Documents:**
- `DESIGN_SYSTEM_GOVERNANCE.md`
- `MIGRATION_AND_ROLLOUT_STRATEGY.md`
- `VISUAL_REGRESSION_TESTING_STRATEGY.md`


---

<a name="design-system-metrics-dashboard"></a>

## SOURCE: DESIGN_SYSTEM_METRICS_DASHBOARD.md

# Design System Metrics Dashboard Recommendations — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document recommends what a Design System Health Dashboard should track to give leadership and the team visibility into the health of the v2 design system.

---

## 2. Recommended Dashboard Sections

### Adoption
- % of production screens using v2 components (target: >85%)
- Top 10 most used components
- Number of new features shipped using the design system

### Consistency
- Visual regression violations per month
- Number of one-off components still in production
- Design review feedback related to styling

### Efficiency
- Average time from design handoff to production
- Number of design system-related bugs in QA
- Developer satisfaction score (quarterly survey)

### Quality
- Accessibility scores on key surfaces (CES, eCign, Onboarding)
- Performance impact of design system components
- User satisfaction with interface clarity

---

## 3. Data Sources

- ESLint + custom scripts for component usage
- Visual regression tools (Chromatic/Percy)
- Design review notes
- User feedback channels
- Performance monitoring tools

---

## 4. Review Cadence

- Weekly: Quick automated metrics
- Monthly: Design Systems team review
- Quarterly: Leadership review

---

*What gets measured gets managed.*

---

**Related Documents:**
- `DESIGN_SYSTEM_HEALTH_AND_METRICS.md`
- `VISUAL_REGRESSION_TESTING_STRATEGY.md`


---

<a name="design-system-release-process"></a>

## SOURCE: DESIGN_SYSTEM_RELEASE_PROCESS.md

# Design System Release & Versioning Process — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines how changes to the CareIndeed v2 design system are released in a controlled, predictable way.

---

## 2. Versioning Model

We follow **Semantic Versioning**:

- **Major (v2.0 → v3.0)**: Breaking changes (token removal, major component API changes, glass system rule changes)
- **Minor (v2.1 → v2.2)**: New components, new variants, non-breaking improvements
- **Patch (v2.1.0 → v2.1.1)**: Bug fixes, small refinements, documentation updates

---

## 3. Release Cadence (Recommended)

- **Minor releases**: Every 4–6 weeks
- **Patch releases**: As needed (bug fixes)
- **Major releases**: Only when truly necessary (planned well in advance)

---

## 4. Release Process

1. **Proposal** — Change is proposed and approved via governance process.
2. **Implementation** — Code + Figma + Documentation updated.
3. **Testing** — Visual regression + accessibility + usage in at least 2 production surfaces.
4. **Review** — Design Systems Lead + relevant engineers sign off.
5. **Release Notes** — Written and published (even for small releases).
6. **Communication** — Announced in #design-system-updates + updated in Storybook.
7. **Deprecation Clock** (if applicable) — Started for any replaced patterns.

---

## 5. Release Artifacts

Every release should include:
- Updated `tokens.json`
- Updated Storybook
- Release notes (What changed / Why / Migration steps if needed)
- Updated documentation in this folder

---

## 6. Do’s and Don’ts

**✅ Do**
- Write clear release notes, even for small changes.
- Give teams time to migrate when deprecating something.
- Version the Figma library in sync with code.

**❌ Don’t**
- Release breaking changes without warning.
- Release new components without documentation and tests.

---

*Good release hygiene builds trust in the design system.*

---

**Related Documents:**
- `DESIGN_SYSTEM_GOVERNANCE.md`
- `MIGRATION_AND_ROLLOUT_STRATEGY.md`


---

<a name="design-tokens-implementation-guide"></a>

## SOURCE: DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md

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


---

<a name="design-token-export-guide"></a>

## SOURCE: DESIGN_TOKEN_EXPORT_GUIDE.md

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


---

<a name="dos-and-donts"></a>

## SOURCE: DOS_AND_DONTS.md

# Do’s and Don’ts — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## Visual Language

### ✅ Do

- Use the Care Indeed palette only (Navy + Teal + Restrained Orange).
- Maintain generous spacing and breathing room — this is a premium clinical product.
- Use soft, elegant glassmorphism with subtle depth.
- Let shadows and background tints do the heavy lifting for elevation in light mode.
- Keep orange **restrained** — use it for action, urgency, and CTAs only.

### ❌ Don’t

- Introduce CI-ION maroon or gold into production interfaces.
- Use hard or dark borders in light mode (kills the glass feeling).
- Overuse orange — it loses impact and feels noisy.
- Stack too many translucent layers (maximum 3 layers total).
- Make every card or panel the same elevation.

---

## Glass & Layering

### ✅ Do

- Respect the 3-layer system:
  - Layer 0 = Dark atmospheric background
  - Layer 1 = Main app surface
  - Layer 2 = Elevated actionable cards / dialogs
- Use Layer 3 only when functionally necessary.
- In light mode, favor stronger soft shadows over heavy transparency.

### ❌ Don’t

- Create 4+ layers of glass.
- Use dark, high-contrast borders on light glass cards.
- Over-layer glass just for decoration.

---

## Typography & Hierarchy

### ✅ Do

- Use Montserrat for headings and Inter (or system) for body.
- Create clear visual hierarchy through size and weight.
- Give metadata and secondary text enough breathing room.

### ❌ Don’t

- Use too many font weights on one screen.
- Make body text too light or too small on light backgrounds.
- Let headings compete with each other.

---

## Color Usage

### ✅ Do

- Use **Teal** for stable, compliant, and secondary actions.
- Use **Orange** strategically for pending actions, signatures, escalations, and primary CTAs.
- Use semantic colors (green, amber, red) consistently for status.

### ❌ Don’t

- Scatter orange across the entire interface.
- Use bright or neon versions of brand colors.
- Create new semantic colors without adding them to the token system.

---

## Components & Patterns

### ✅ Do

- Vary layouts between screen types (Dashboard ≠ Form ≠ Board ≠ Detail).
- Make task urgency and risk visually clear without relying only on color.
- Design for one-handed use on mobile (especially signing and evidence capture).
- Keep forms calm, clear, and focused.

### ❌ Don’t

- Make every screen feel like a generic dashboard.
- Create competing visual systems inside the same product.
- Design hover-dependent interactions for mobile.
- Over-design empty states — keep them helpful and calm.

---

## Motion & Interaction

### ✅ Do

- Use subtle, purposeful motion that feels premium and calm.
- Make transitions feel intentional and not flashy.
- Support keyboard navigation and focus states on desktop.

### ❌ Don’t

- Use excessive animation or bouncy effects.
- Make loading states feel slow or uncertain.

---

## General Philosophy

### ✅ Do

- Design for the real user: a clinician in a home, a DON under time pressure, a surveyor during an audit.
- Make compliance feel like a natural part of the workflow, not a burden.
- Protect the expensive, clinical, trustworthy feeling at all times.

### ❌ Don’t

- Optimize only for happy paths.
- Add visual noise for the sake of “looking busy.”
- Forget that every pixel reflects on the professionalism of the organization.

---

**Print this sheet. Use it in every design review.**

*When in doubt, ask: “Does this feel expensive, calm, and operationally clear?”*


---

<a name="empty-state-patterns"></a>

## SOURCE: EMPTY_STATE_PATTERNS.md

# Empty State Patterns — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Philosophy

Empty states are not failures — they are **opportunities to guide the user**.

In a high-stakes compliance environment, a blank screen creates anxiety. Every empty state must:

- Clearly explain **why** the area is empty
- Tell the user what they can do next (even if the action is "wait for someone else")
- Use calm, professional, non-alarmist language
- Maintain the premium glass aesthetic

---

## 2. Three Types of Empty States

### Type A — First Use / Onboarding
**Example:** New clinician has no assigned tasks yet.

- Friendly illustration or icon
- Clear headline ("You’re all set for now")
- One primary action ("Browse Available Training" or "View Your Schedule")
- Helpful secondary text

### Type B — No Results from Filter / Search
**Example:** CES board filtered to "Overdue" with nothing showing.

- Simple icon (magnifying glass or filter)
- "No results match your filters"
- Clear "Clear Filters" button (primary action)
- Optional "Adjust your search" helper text

### Type C — System / Workflow State
**Example:** No evidence uploaded for a specific requirement yet, or no signatures on a policy.

- More serious but still calm tone
- Explain the compliance implication briefly ("This requirement is not yet satisfied")
- Strongest possible next action ("Upload Evidence" or "Request Signature")

---

## 3. Visual Treatment (v2 Glass System)

- Use **Layer 1** glass surface
- Centered content with generous whitespace (never cramped)
- One large, meaningful icon (never tiny)
- Headline in `--color-text-primary`
- Body text in `--color-text-muted`
- Primary action button (usually Teal or Orange depending on urgency)
- Never use hard black borders — soft hairline only in light mode

**Recommended layout:**
```
[ Large calm icon ]
[ Clear headline ]
[ Helpful explanation (2–3 lines max) ]
[ Primary action button ]
[ Optional secondary link ]
```

---

## 4. Tone & Microcopy Rules

**Good:**
- "No tasks due today — you’re ahead of schedule."
- "This policy has not received any signatures yet."
- "No evidence has been captured for this requirement."

**Bad:**
- "Nothing here."
- "Empty."
- "No data." (too cold)
- "Error loading content." (when it’s not an error)

---

## 5. Component Ownership

- Prefer the **canonical `ui/EmptyState`** component.
- Do **not** create local empty states inside CES cards, PolicyDetail, EvidenceCenter, or OnboardingV2 unless absolutely necessary.
- All new empty states must go through design systems review.

---

## 6. Special Cases

### Evidence Center
- Distinguish between "No evidence ever uploaded" vs "No evidence for this specific requirement".
- Offer "Capture Evidence" as the primary action when appropriate.

### CES Board
- When a clinician has zero active tasks: "You have no active tasks. Great job staying on top of things."
- When filtered to zero: "No tasks match the current filters."

### Onboarding V2
- When a batch has no units yet: "This batch has no units assigned. Add units to begin the activation process."

---

## 7. Do’s and Don’ts

**✅ Do**
- Always provide a clear next step
- Use illustrations sparingly and only when they add warmth (never clipart)
- Keep copy short and scannable
- Respect `prefers-reduced-motion`

**❌ Don’t**
- Use alarming language ("Failed", "Missing", "Error") for normal empty states
- Leave the user with no action
- Use tiny icons or cramped layouts
- Show different empty states for the same situation across mobile and desktop

---

*An empty state should reduce anxiety, not create it.*

---

**Next:** Create illustrated empty state library for the Figma kit.


---

<a name="engineering-handoff-guide"></a>

## SOURCE: ENGINEERING_HANDOFF_GUIDE.md

# Engineering Handoff Guide — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Audience:** Design Systems + Frontend Engineering

---

## 1. Purpose

This guide defines the exact process for handing off designs from the v2 design system to engineering. The goal is zero ambiguity, zero drift, and fast, high-quality implementation.

---

## 2. Handoff Package Requirements

Every handoff (new feature or major update) must include:

1. **Figma Link** to the specific screens + variants
2. **Design Token Reference** (link to latest `COLOR_TOKENS.md`, `TYPOGRAPHY_SCALE.md`, etc.)
3. **Component Audit** — Which `ui/` primitives are used vs. new components needed
4. **Interaction Spec** (states, gestures, loading, empty, error)
5. **Responsive Matrix** (mobile first, tablet, desktop)
6. **Accessibility Notes** (from the Accessibility Component Checklist)
7. **Print/PDF Requirements** (if applicable)

---

## 3. Token & Primitive Rules (Strict)

- **All new code** must use design tokens via CSS custom properties (`--ci-*`) or the JS token object.
- **No raw hex, rgb, or arbitrary values** in new components (ESLint rule planned).
- Prefer existing `ui/` primitives (Button, Card, GlassPanel, Tabs, EmptyState, etc.).
- New primitives must be approved by Design Systems before implementation.

**Canonical owners** (from the strategy documents):
- Layout shell → `CommandCenterLayout` + `ui/*`
- eCign packets → `FormViewer` + `FormSigningWorkspace`
- General policy detail → `SharedPolicyDetailView`
- Onboarding V2 → OnboardingV2 engine components
- Calendar → MasterCalendar

---

## 4. Handoff Meeting / Review Process

1. Designer creates a **Handoff Note** in the Figma file (or Notion page).
2. 15–30 min review with engineering (focus on edge cases, mobile behavior, accessibility).
3. Engineering creates a tracking ticket with:
   - Link to Figma
   - Link to relevant docs in `/design/`
   - List of tokens and primitives to use
4. Implementation happens against the `ui/` primitive library when possible.
5. Design reviews the PR visually (especially glass layers, typography, and mobile).

---

## 5. What Engineering Must Deliver Back

- Token usage audit (no drift)
- Component usage report (how many places still use old local components)
- Mobile-first implementation proof (tested on real devices)
- Accessibility audit results (using the checklist)
- Print/PDF fidelity check (for any eCign or report work)

---

## 6. Common Anti-Patterns to Avoid

- Creating a new "Card" component instead of using `ui/Card` or `GlassPanel`
- Hardcoding colors for status instead of using semantic tokens
- Different tab implementations across CES, Policy, and Onboarding
- Ignoring `prefers-reduced-motion`
- Building custom drawers on mobile instead of using bottom sheets

---

## 7. Tooling & Automation (Future)

- Token sync via Style Dictionary or Tokens Studio
- Visual regression tests for key screens (especially signed eCign packets)
- Automated accessibility checks in CI

---

*Good handoff = fast implementation + zero visual debt.*

---

**Related Documents:**
- `FIGMA_KIT_SPEC.md`
- `DESIGN_TOKEN_EXPORT_GUIDE.md`
- `COMPONENT_GUIDELINES.md`
- `V2_DESIGN_DIRECTION_SUMMARY.md`


---

<a name="error-handling-guidelines"></a>

## SOURCE: ERROR_HANDLING_GUIDELINES.md

# Error Handling Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Philosophy

Errors in a compliance platform create anxiety. Good error handling must be:

- **Calm and clear** — Never alarming unless there is real patient or regulatory risk.
- **Actionable** — Always tell the user what they can do next.
- **Recoverable** — Give users a path forward when possible.
- **Consistent** — Same tone and treatment across the entire app.

---

## 2. Error Severity Levels

| Level | Name             | Treatment                              | Example |
|-------|------------------|----------------------------------------|---------|
| 1     | Inline / Field   | Subtle red text under the field        | Invalid date format |
| 2     | Banner / Toast   | Top or bottom banner with action       | "Failed to save. Retry?" |
| 3     | Modal / Sheet    | Focused error with clear resolution    | Signature failed to lock |
| 4     | Full Screen      | Rare — major system issue              | "We cannot reach the server" |

---

## 3. Visual Treatment

- Use semantic red only for true errors (never for warnings or info).
- Pair color with clear text and, when possible, an icon.
- In light mode: soft red background tint + hairline border.
- In dark mode: slightly stronger but still calm red treatment on glass.
- Always include a primary recovery action when possible ("Retry", "Go Back", "Contact Support").

---

## 4. Microcopy Rules

**Good examples:**
- "We couldn't save your signature. Please try again."
- "This document is currently locked by another user."
- "Network connection lost. Your changes are saved locally."

**Bad examples:**
- "Error 500"
- "Something went wrong"
- "Invalid input" (too vague)

Always explain **what happened** + **what the user can do**.

---

## 5. Technical Requirements

- All error states must use `role="alert"` or `aria-live="assertive"` when appropriate.
- Network errors should detect offline state and offer graceful degradation.
- Form validation errors must appear immediately on blur (not only on submit).

---

## 6. Do’s and Don’ts

**✅ Do**
- Log technical details for support while showing human-friendly messages to users.
- Offer "Retry" for transient failures.
- Allow users to copy error codes when contacting support.

**❌ Don’t**
- Show stack traces or raw error objects to end users.
- Use scary language for normal business errors ("Critical failure").
- Trap the user with no recovery path.

---

## 7. Special Cases

- **Signature / eCign locking errors**: Highest priority. Must be extremely clear and offer immediate retry + support escalation.
- **Evidence upload failures**: Keep the photo locally and allow retry without forcing recapture.
- **Onboarding gate submission failures**: Preserve all entered data.

---

*Good error handling turns frustration into trust.*

---

**Related:** `FORM_VALIDATION_PATTERNS.md`, `LOADING_STATE_GUIDELINES.md`


---

<a name="evidence-capture-specification"></a>

## SOURCE: EVIDENCE_CAPTURE_SPECIFICATION.md

# Evidence Capture Specification — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Evidence capture is the **core action** of the CES system. Clinicians must be able to quickly and reliably capture proof of completed work (photos of documents, signatures, forms, etc.) in the field, often under time pressure and sometimes in poor lighting or one-handed.

This document defines the exact experience and visual treatment for evidence capture.

---

## 2. Primary Use Cases

- CES task completion (most common)
- Onboarding V2 unit activation evidence
- Policy acknowledgment evidence
- Incident / MobileIncident photo evidence
- Audit / Surveyor evidence requests

---

## 3. Capture Flow (Mobile-First)

### Recommended Simple Flow

1. User taps "Capture Evidence" on a task or requirement.
2. Bottom sheet or full-screen camera view opens.
3. Clear instructions: "Take a clear photo of [specific document / signature / form]".
4. Camera preview with large, thumb-friendly shutter button.
5. Optional: "Upload from library" as secondary action.
6. After capture: Immediate preview with "Retake" and "Use this photo" actions.
7. Optional quick note / description field (not required in most cases).
8. "Attach to [Task/Requirement]" confirmation.

**Key rule:** Minimize steps. A clinician should be able to capture and attach evidence in under 15 seconds in ideal conditions.

---

## 4. Visual Treatment

- Camera UI should feel part of the Care Indeed glass system (subtle overlays, not jarring system camera).
- Large, high-contrast shutter button (minimum 56px).
- Clear "Retake" and "Confirm" actions after capture.
- Evidence thumbnail should use the same Layer 2 card treatment as the rest of the app.
- Status after upload: "Evidence attached" with teal check + timestamp.

**Never** use bright CI-ION colors or heavy borders on evidence thumbnails.

---

## 5. Quality & Compliance Requirements

- Photos must be stored at sufficient resolution for audit review and printing.
- EXIF data (timestamp, location when permitted) should be captured where possible.
- Evidence must be linked immutably to the specific task/requirement and the clinician who captured it.
- Support for multiple photos per requirement when needed.

---

## 6. Edge Cases & Error States

- User has no camera permission → Clear message + "Go to Settings" deep link.
- Poor lighting / blurry photo detected → Gentle suggestion ("This photo may be too dark. Consider retaking.").
- Upload fails after capture → Keep the photo locally and offer retry (do not lose the capture).
- User tries to attach evidence to the wrong requirement → Prevent or warn strongly.

---

## 7. Desktop / Tablet Behavior

- On larger screens, allow drag-and-drop file upload in addition to camera.
- Still show the same "Capture Evidence" primary action for consistency.
- Evidence grid should use the same card language as mobile.

---

## 8. Do’s and Don’ts

**✅ Do**
- Make the camera experience feel native and fast
- Give very specific instructions ("Photo of the signed consent form", not just "Upload evidence")
- Allow easy retake
- Show clear confirmation that evidence was successfully attached

**❌ Don’t**
- Force long forms before allowing capture
- Use tiny camera controls
- Lose the photo if upload fails
- Mix evidence capture UI with generic file pickers

---

## 9. Related Components & Patterns

- `EMPTY_STATE_PATTERNS.md` — "No evidence yet" treatment
- `LOADING_STATE_GUIDELINES.md` — Upload progress
- `CES_BOARD_VISUAL_LANGUAGE.md` — How evidence status appears on task cards
- `PRINT_PDF_CONSISTENCY_GUIDELINES.md` — How evidence appears in exported reports

---

*Evidence capture must be the fastest, most reliable action in the entire operational workflow.*

---

**Next:** Align the actual Evidence Center and CES evidence upload components with this specification.


---

<a name="figma-kit-spec"></a>

## SOURCE: FIGMA_KIT_SPEC.md

# Figma Kit Specification — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Audience:** Design Systems + Product Design Team

---

## 1. Purpose

This document defines the structure and content of the official **CareIndeed v2 Figma Kit** that will be the single source of truth for all product and marketing design work.

---

## 2. Kit Structure (Recommended Organization)

```
CareIndeed v2 Design System
├── Foundations
│   ├── Color Tokens (Light + Dark)
│   ├── Typography Scale
│   ├── Spacing & Radius
│   ├── Elevation & Glass Layers (0/1/2/3)
│   └── Motion Tokens
├── Primitives
│   ├── Button (Primary, Secondary, Ghost, Danger)
│   ├── Input / Textarea / Select
│   ├── Card (Layer 1 & Layer 2)
│   ├── Badge / Status
│   ├── Icon (24px line set)
│   └── Divider
├── Components
│   ├── Navigation (Bottom Nav, Sidebar, Top Bar)
│   ├── Tabs
│   ├── Modal / Bottom Sheet
│   ├── Drawer
│   ├── Empty State
│   ├── Loading States (Skeleton + Spinner)
│   ├── Form Field + Validation
│   ├── Signature Capture
│   └── Evidence Upload
├── Patterns
│   ├── CES Board Cards
│   ├── Policy Detail
│   ├── Onboarding V2 Batch / Unit
│   ├── Evidence Center
│   ├── Calendar
│   └── Task List
├── Templates (Full Screens)
│   ├── Mobile (iPhone 14/15/16 Pro)
│   ├── Desktop (1440px + 1920px)
│   └── Tablet (iPad)
└── Documentation
    ├── Glass Layering Cheat Sheet
    ├── Light Mode Elevation Rules
    └── Do’s and Don’ts
```

---

## 3. Component Requirements

Every component in the kit must have:

- **Variants** for all major states (default, hover, active, disabled, error, success)
- **Light + Dark** versions
- **Responsive** behavior notes (mobile vs desktop)
- **Usage guidelines** in the component description
- **Auto Layout** properly configured
- **Constraints** set for resizing

---

## 4. Glass Layering in Figma

Because Figma does not have real backdrop blur in all cases, the kit must simulate the 3-layer system using:

- Layer 0: Dark atmospheric background (subtle noise or gradient)
- Layer 1: Main surface (soft translucent fill + subtle border)
- Layer 2: Elevated card (stronger shadow + slightly more opaque)
- Layer 3: Only when functionally required (rare)

Provide clear variant naming:
- `Glass / Layer 1 / Dark`
- `Glass / Layer 2 / Light`
- etc.

---

## 5. Icon Library

- One master icon component set (60–80 icons max)
- Consistent 24×24 base
- 1.5–2px stroke, 2–4px corner radius
- Variants for size (16 / 20 / 24 / 32)
- Color inheritance via `currentColor`

---

## 6. Maintenance Process

1. Designer updates a component in the master kit.
2. Updates the corresponding documentation in the `design/` folder.
3. Notifies engineering (via Slack + PR) when tokens or components change.
4. Engineering updates the `ui/` primitive library to match.

**Rule:** The Figma kit is the source of truth. Code must follow the kit.

---

## 7. Versioning

- Major version bumps only when breaking visual or structural changes occur.
- Minor versions for new components or significant refinements.
- All changes must be documented in a "Changelog" page inside the Figma file.

---

## 8. Access & Governance

- Only Design Systems team members may edit the master kit.
- Product designers work from a duplicated "working copy".
- Quarterly audit of the kit vs. production code to catch drift.

---

*This kit will become the foundation for all future design and handoff work.*

---

**Next Step:** Build the initial v2 Figma kit based on the strongest approved mockups (`09_CES_Board_Dark.jpg` + `07_EvidenceCenter_Dark.jpg` as base) + all documentation in this folder.


---

<a name="figma-to-code-mapping"></a>

## SOURCE: FIGMA_TO_CODE_MAPPING.md

# Figma to Code Component Mapping — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document provides a clear mapping between Figma components/variants and the actual React/React Native components in the `ui/` folder. This reduces interpretation errors during implementation.

---

## 2. Core Principle

**One Figma component = One canonical `ui/` component** (with variants handled via props).

---

## 3. Component Mapping Table

| Figma Component          | Code Component              | Key Props / Variants                          | Notes |
|--------------------------|-----------------------------|-----------------------------------------------|-------|
| **Button**               | `ui/Button`                 | `variant`: primary, secondary, ghost, danger<br>`size`: sm, md, lg<br>`loading`, `disabled` | Primary uses restrained orange |
| **Card**                 | `ui/Card`                   | `layer`: 1 \| 2<br>`padding`: sm, md, lg<br>`clickable` | Use for most elevated surfaces |
| **GlassPanel**           | `ui/GlassPanel`             | `padding`: none, sm, md, lg                   | Lower-level primitive |
| **Input / Text Field**   | `ui/Input`                  | `label`, `error`, `helperText`, `size`        | Always include label |
| **Select**               | `ui/Select`                 | `options`, `error`                            | - |
| **Badge / Status**       | `ui/Badge`                  | `variant`: success, warning, error, neutral, info | Never rely on color alone |
| **Tabs**                 | `ui/Tabs`                   | `tabs[]`, `activeTab`, `onChange`             | Supports keyboard navigation |
| **Empty State**          | `ui/EmptyState`             | `icon`, `title`, `description`, `action`      | Use the approved patterns |
| **Loading**              | `ui/Loading`                | `type`: skeleton, spinner, inline             | Prefer skeleton for lists |
| **Bottom Sheet**         | `ui/BottomSheet`            | `isOpen`, `onClose`, `title`, `size`          | Default for mobile modals |
| **Modal**                | `ui/Modal`                  | `isOpen`, `onClose`, `size`                   | Desktop preferred |
| **Drawer**               | `ui/Drawer`                 | `side`: left \| right, `width`                | Desktop only. Use BottomSheet on mobile |
| **Avatar**               | `ui/Avatar`                 | `src`, `name`, `size`                         | - |

---

## 4. Layout & Shell Components

| Figma Element                    | Code Component                     | Usage |
|----------------------------------|------------------------------------|-------|
| Main App Shell                   | `CommandCenterLayout`              | Primary layout wrapper |
| Bottom Navigation (Mobile)       | `ui/BottomNav`                     | Max 5 items |
| Sidebar (Desktop)                | `ui/Sidebar`                       | Collapsible supported |
| Top Bar / Header                 | `ui/TopBar`                        | Contains title + actions |

---

## 5. Specialized Components

| Area                    | Figma Component              | Code Owner                              | Notes |
|-------------------------|------------------------------|-----------------------------------------|-------|
| CES Board               | `CesTaskCard`                | Should be refactored to `ui/Card` + `ui/Badge` | Avoid creating new card variants |
| eCign Signature         | `SignaturePad`               | `ui/SignatureCapture` (to be created)  | See `SIGNATURE_CAPTURE_BEST_PRACTICES.md` |
| Evidence Upload         | `EvidenceCapture`            | Custom component (reuses `ui/Button`)  | Follow `EVIDENCE_CAPTURE_SPECIFICATION.md` |
| Onboarding V2 Gates     | `GateCard` / `UnitCard`      | Use `ui/Card` + status badges          | See `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md` |

---

## 6. How to Use This Mapping

1. Designer hands off Figma file with component names clearly labeled.
2. Engineer opens this document and maps each Figma component to the corresponding `ui/` component.
3. If a component does not exist in the mapping, **stop and ask Design Systems** before building a custom version.

---

## 7. Variant Handling

Most variants are handled via **props**, not by creating separate components.

Example:
- Figma has "Button/Primary", "Button/Secondary", "Button/Ghost" → All map to `<Button variant="primary" />`, `<Button variant="secondary" />`, etc.

---

## 8. Future Updates

This document must be updated every time:
- A new canonical component is added to the `ui/` folder
- A Figma component is renamed or restructured

---

*This mapping is the bridge between design and code. Keep it up to date.*

---

**Related Documents:**
- `COMPONENT_GUIDELINES.md`
- `FIGMA_KIT_SPEC.md`
- `ENGINEERING_HANDOFF_GUIDE.md`
- `BUILDING_V2_SCREEN_PLAYBOOK.md`


---

<a name="form-validation-patterns"></a>

## SOURCE: FORM_VALIDATION_PATTERNS.md

# Form Validation Patterns — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Consistent, clear, and helpful form validation is essential for eCign packets, onboarding forms, evidence metadata, and administrative workflows. This document defines the standard patterns.

---

## 2. Validation Timing

- **On blur** (when the user leaves the field): Show error if invalid.
- **On submit**: Re-validate all fields and highlight all errors.
- **Real-time** (optional): For complex rules (password strength, date ranges) where helpful.

Never wait until the very end of a long form to show errors.

---

## 3. Error Presentation

### Per-Field Errors
- Red text directly below the input.
- Clear, specific message.
- Keep the field border in the error state (subtle red tint in light mode).

### Form-Level Summary (for long forms)
- When the user submits a form with multiple errors, show a summary banner at the top:
  - "Please fix the 3 errors below before continuing."
- Scroll the first error into view.

---

## 4. Message Style

**Good:**
- "Date of birth must be in the past."
- "Signature is required before locking this document."
- "This email is already associated with another clinician."

**Bad:**
- "Invalid value"
- "Required"
- "Error"

Always explain **what is wrong** and (when possible) **how to fix it**.

---

## 5. Required vs Optional

- Clearly mark required fields with an asterisk or "(required)" text.
- Do not show "required" errors until the user has interacted with the field or tries to submit.

---

## 6. Complex Validation

- Date ranges: "End date cannot be before start date."
- Signature + Affirmation: Block final submit until both signature exists **and** affirmation checkbox is checked.
- File uploads: Show specific errors ("File too large. Maximum size is 25MB.").

---

## 7. Accessibility

- Associate error messages with inputs using `aria-describedby`.
- Announce validation errors to screen readers on submit.
- Ensure error states have sufficient contrast.

---

## 8. Do’s and Don’ts

**✅ Do**
- Be specific and helpful.
- Validate as early as reasonable.
- Preserve user input after validation errors.

**❌ Don’t**
- Use generic messages.
- Clear the entire form on validation failure.
- Show validation errors only after a full page reload.

---

*Validation should feel like a helpful colleague, not a strict examiner.*

---

**Related Documents:**
- `ERROR_HANDLING_GUIDELINES.md`
- `SIGNATURE_CAPTURE_BEST_PRACTICES.md`


---

<a name="gesture-interaction-guidelines"></a>

## SOURCE: GESTURE_INTERACTION_GUIDELINES.md

# Gesture Interaction Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Mobile users (clinicians, DONs, surveyors) often use the app one-handed while walking, in the field, or under time pressure. Gestures must be intuitive, forgiving, and consistent.

---

## 2. Core Principles

- **One-handed friendly** — All primary gestures should be reachable with the thumb.
- **Forgiving** — Accidental gestures should not cause destructive actions.
- **Consistent** — The same gesture must mean the same thing across the app.
- **Discoverable** — Use visual affordances when possible.

---

## 3. Approved Gestures & Patterns

### Tap
- Primary action on buttons, cards, and list items.
- Minimum 44×44px target (48px preferred).

### Long Press (Press & Hold)
- Reveals contextual menu or quick actions.
- Recommended duration: 500–600ms.
- Use cases: Quick actions on CES tasks, evidence items, policy cards.

### Swipe Left / Right
- **Swipe Left** on list items → Primary quick action (e.g., “Mark Complete”, “Capture Evidence”).
- **Swipe Right** → Secondary action or “More”.
- Must show clear visual feedback during the swipe.
- Destructive actions (Delete, Reject) should require confirmation or be harder to trigger.

### Pull-to-Refresh
- Supported on list views (CES Board, Policy Library, Evidence Center, Calendar).
- Should feel calm and not overly bouncy.

### Drag & Drop (Desktop + Tablet only)
- Supported on CES Board for reordering or moving tasks between columns.
- Provide clear visual feedback (ghost card + drop zone highlight).

### Two-Finger Pinch / Zoom
- Only for document viewers and eCign packet preview.
- Disabled by default on most operational screens.

---

## 4. Bottom Sheet & Modal Gestures

- **Swipe down** on bottom sheets → Dismiss (standard iOS/Android pattern).
- Must include a clear drag handle at the top of the sheet.
- Tapping the backdrop should also dismiss the sheet (except for critical flows like signing).

---

## 5. Signature & Evidence Capture Specifics

- **Signature pad**: Support both finger and stylus. Large target area. No complex gestures required.
- **Evidence camera**: Large shutter button. Tap to capture. Long press not used here.

---

## 6. Do’s and Don’ts

**✅ Do**
- Make swipe actions predictable and reversible when possible.
- Show the action label while swiping (not just an icon).
- Use long press for secondary actions only.
- Respect `prefers-reduced-motion` for gesture animations.

**❌ Don’t**
- Use swipe-to-delete as the only way to delete important items.
- Require multi-finger gestures for core tasks.
- Make gestures too sensitive (accidental triggers are common in the field).

---

## 7. Accessibility & Reduced Motion

- All gestures must have a non-gesture alternative (e.g., menu button).
- Gesture animations should respect the user’s reduced-motion preference.

---

## 8. Future Enhancements

- Voice + gesture combination (“Hey Brad, mark this task complete” while swiping)
- Haptic feedback on successful gestures (subtle)
- Contextual quick actions that adapt based on task urgency

---

*Great gestures feel invisible. The user just knows what to do.*

---

**Related Documents:**
- `HOVER_FOCUS_ACTIVE_STATES.md`
- `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md`
- `CES_BOARD_VISUAL_LANGUAGE.md`


---

<a name="glass-layering-cheat-sheet"></a>

## SOURCE: GLASS_LAYERING_CHEAT_SHEET.md

# Glass Layering Cheat Sheet — CareIndeed Home Health (v2)

**One-page reference for the entire team**

---

## The 3-Layer System (Hard Limit)

| Layer | Name                    | What it is                          | Typical Use                          | Elevation Treatment |
|-------|-------------------------|-------------------------------------|--------------------------------------|---------------------|
| **0** | Atmospheric Background  | Deepest dark background             | Page background                      | Subtle texture/gradient |
| **1** | Main App Surface        | Primary working area                | Most page content, lists, dashboards | Frosted glass, base level |
| **2** | Elevated Surface        | Cards, dialogs, focused areas       | Task cards, forms, modals, bottom sheets | Stronger shadow + more opacity |
| **3** | Exception Only          | Rare functional necessity           | Critical floating menus, complex confirmations | Maximum elevation |

**Layer 3 is not for decoration.** It is only used when it directly enables a function that cannot be solved with Layer 2.

---

## Golden Rules

- **Never exceed 3 layers.**
- On **desktop**, the main Layer 1 surface **must not** take up the full screen width.
  - Use a constrained `max-width` container + visible side margins.
  - This exposes Layer 0 around the main glass panel and dramatically improves the premium glassmorphic feeling.
- In **light mode**, rely on layered shadows + subtle hairline borders rather than heavy transparency.
- Do not stack glass endlessly (e.g., glass card inside glass card inside glass panel).

---

## Desktop Container Rule (Enhances Glassmorphism)

**On desktop (≥1024px):**

The main Layer 1 working surface **must have breathing room**.

- Apply `max-width` (1280px–1600px recommended) + side margins/padding.
- Let the rich dark **Layer 0** background show on the left, right, top, and bottom of the main content area.

**This is mandatory** for v2 desktop experiences. Full-bleed main surfaces kill the expensive glass depth.

Reference example: Current desktop Policy Library view — the main card grid is nicely contained with dark atmospheric background visible around it.

---

**Print this page. Follow it on every screen.**


---

<a name="global-error-handling-patterns"></a>

## SOURCE: GLOBAL_ERROR_HANDLING_PATTERNS.md

# Global Error Handling & Error Boundary Patterns — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines how to handle unexpected errors at the application level while staying consistent with the calm, professional tone of the v2 design system.

---

## 2. Error Boundary Strategy

### Recommended Structure

1. **App-Level Error Boundary**
   - Catches unhandled errors in the entire React tree.
   - Shows a full-screen calm error state.
   - Allows user to reload or contact support.
   - Logs error to monitoring tool (Sentry, etc.).

2. **Route / Feature Level Error Boundaries**
   - Wrap major sections (CES Board, Onboarding V2, eCign flow) in their own error boundaries.
   - Allows the rest of the app to remain usable if one feature breaks.

3. **Component Level Error Handling**
   - Use `try/catch` + error states inside complex components (forms, signature, evidence upload).

---

## 3. Design Treatment for Errors

- Use the approved `EmptyState` or dedicated `ErrorState` component.
- Tone: Calm and helpful, never alarming unless it is a safety/regulatory issue.
- Always provide:
  - Clear explanation of what happened (user-friendly language)
  - Recommended next action
  - Option to report the issue

**Example Message:**
> “Something went wrong while loading your tasks. Your data is safe.  
> You can try again or continue working on other sections.”

---

## 4. Error Logging & Monitoring

- Log all errors with context (user ID, route, action being performed).
- Include design system version and app version.
- Tag errors that come from `ui/` components for easier triage.

---

## 5. Special Cases

- **eCign Signing Errors**: Highest priority. Must be extremely clear and offer immediate support escalation.
- **Evidence Upload Failures**: Must preserve the captured photo locally.
- **Offline Errors**: Should be handled gracefully (see Offline-First document).

---

## 6. Do’s and Don’ts

**✅ Do**
- Show recovery paths whenever possible.
- Log technical details but show simple messages to users.
- Test error boundaries regularly.

**❌ Don’t**
- Show raw error messages or stack traces to end users.
- Crash the entire app for non-critical errors.
- Use scary language for normal transient failures.

---

*Good error handling protects user trust even when things go wrong.*

---

**Related Documents:**
- `ERROR_HANDLING_GUIDELINES.md`
- `BUILDING_V2_SCREEN_PLAYBOOK.md`


---

<a name="hover-focus-active-states"></a>

## SOURCE: HOVER_FOCUS_ACTIVE_STATES.md

# Hover, Focus & Active States — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Consistent and purposeful hover, focus, and active states are essential for building trust, accessibility, and a premium feel. In a compliance platform, users must always understand what is interactive and where they currently are.

---

## 2. Core Principles

- **Subtle but clear** — States should feel refined, never flashy or cartoonish.
- **Accessible** — Focus states must be highly visible (minimum 2px teal ring or equivalent).
- **Glass-aware** — States must work on both Layer 1 and Layer 2 surfaces without breaking the glass aesthetic.
- **Mobile-first** — Hover is secondary on touch devices. Focus and active states remain critical.

---

## 3. State Definitions

| State   | Trigger                  | Visual Treatment                                                                 | Usage |
|---------|--------------------------|----------------------------------------------------------------------------------|-------|
| **Hover**   | Mouse enter              | Subtle lift (1–2px), slight increase in glass opacity, or soft shadow enhancement | Desktop only (cards, buttons, links) |
| **Focus**   | Keyboard focus           | Clear 2px teal ring (`--color-brand-teal`) around the element + slight background lift | All interactive elements (mandatory) |
| **Active**  | Mouse down / tap         | Brief scale (0.98) or color shift on primary action color (restrained orange for buttons) | Buttons, links, selectable cards |
| **Selected**| Toggled / chosen state   | Teal left border or subtle teal background tint on Layer 1/2                     | Tabs, list items, radio-style cards |

---

## 4. Component-Specific Rules

### Buttons
- **Primary (Orange)**: Hover → slightly darker orange + lift. Active → scale + stronger orange.
- **Secondary (Teal)**: Same treatment with teal.
- **Ghost**: Hover → very subtle background tint + lift. Focus ring must be clearly visible.

### Cards (Layer 1 & Layer 2)
- Hover (desktop): Gentle lift + slightly stronger glass highlight.
- Active: Quick press feedback (scale or border flash).
- Do **not** overdo hover on every card — only apply when the entire card is clickable.

### Form Fields
- Focus: Strong teal ring + background lift.
- Error state overrides focus color with semantic red ring.

### Navigation & Tabs
- Active tab: Teal underline or left accent + slightly bolder text.
- Hover on inactive tabs: Subtle text color change + underline preview.

### Links
- Hover: Underline appears + color shifts to teal.
- Focus: Teal ring (never rely on underline alone).

---

## 5. Desktop vs Mobile

- **Desktop**: Full hover + focus + active states.
- **Mobile**: Focus and active states only. Hover effects are ignored (no cursor).
- Touch devices should still show clear press feedback (active state).

---

## 6. Accessibility Requirements

- Focus indicator must always be visible and at least 2px thick.
- Do not remove focus outlines without providing a strong alternative.
- All states must pass WCAG contrast when combined with text.

---

## 7. Do’s and Don’ts

**✅ Do**
- Use the teal focus ring consistently across the system.
- Make hover states feel like a natural extension of the glass treatment.
- Keep active/pressed feedback quick and satisfying.

**❌ Don’t**
- Use bright or neon hover colors.
- Make hover effects too strong (they should feel elegant, not dramatic).
- Forget focus states on custom components.
- Apply hover effects on non-interactive elements.

---

## 8. Token Recommendations

- Focus ring: `--color-brand-teal` at 100% opacity, 2px width
- Hover lift: `--shadow-elevation-2` with slight increase
- Active scale: `transform: scale(0.985)`

---

*Good states make the interface feel alive and trustworthy without being distracting.*

---

**Related Documents:**
- `COMPONENT_GUIDELINES.md`
- `GESTURE_INTERACTION_GUIDELINES.md` (next)


---

<a name="iconography-guidelines"></a>

## SOURCE: ICONOGRAPHY_GUIDELINES.md

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


---

<a name="icon-implementation-guide"></a>

## SOURCE: ICON_IMPLEMENTATION_GUIDE.md

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


---

<a name="icon-library-export-guide"></a>

## SOURCE: ICON_LIBRARY_EXPORT_GUIDE.md

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


---

<a name="light-mode-elevation-system"></a>

## SOURCE: LIGHT_MODE_ELEVATION_SYSTEM.md

# Light Mode Elevation & Contrast System
**CareIndeed Home Health Platform**

**Last Updated:** May 2026

---

## 1. Objective

Solve the "white on white" and low visual separation problem in light mode **while preserving the premium glassmorphic aesthetic**.

The goal is to create clear hierarchy and depth in light mode without using hard or dark borders, which break the soft, frosted glass feeling that defines the Care Indeed visual language.

---

## 2. Glass Layering System (Strict Rule)

**Maximum of 3 glass layers** are allowed.

### Layer Definitions

| Layer | Name                          | Purpose                                      | Visual Treatment                                      | When to Use |
|-------|-------------------------------|----------------------------------------------|-------------------------------------------------------|-------------|
| **0** | Dark Atmospheric Background   | Deepest background layer                     | Dark navy/charcoal with subtle texture or gradient    | Page / screen background |
| **1** | Main App Surface              | Primary working surface                      | Frosted glass panel (main content area)               | Default surface for most screens |
| **2** | Elevated Actionable Surface   | Cards, dialogs, and focused components       | Slightly more opaque + stronger shadow / definition   | Task cards, forms, modals, bottom sheets, detail panels |
| **3** | Exception Layer               | Only when functionally necessary             | Highest elevation + strongest definition              | Rare cases only (e.g. critical floating actions or multi-layer confirmations) |

**Strict Rules:**
- Layer 3 is **not** default. It should only be used when it directly supports a critical function and cannot be solved cleanly with Layer 2.
- Do not stack glass endlessly. Over-layering kills the premium, calm, and expensive feeling.
- In light mode, Layer 2 should rely more on stronger soft shadows and very subtle borders rather than heavy transparency.

---

## 3. Core Principle for Light Mode

**Avoid strong/dark borders in light mode.**

Hard borders (especially dark or high-contrast ones) destroy the elegant, soft glassmorphic quality. Instead, we achieve separation and elevation through a combination of:

- Very subtle, soft hairline borders (`#E5E4E3` range)
- Layered and stronger shadows
- Slight background differentiation / tints
- Typography hierarchy
- Strategic use of teal and orange accents

---

## 4. Recommended Elevation Methods (Light Mode)

### Preferred Order

| Method                    | How to Apply                                      | Strength | Notes |
|---------------------------|---------------------------------------------------|----------|-------|
| **Shadow Elevation**      | Use layered, soft shadows (multiple shadow values) | High     | Most important tool in light mode |
| **Background Tint**       | Use very light cool gray tints (`#F8FAFC`, `#F1F5F9`) for secondary surfaces | Medium   | Helps create subtle depth |
| **Soft Hairline Borders** | Use extremely subtle borders (`#E5E4E3` or `#E8E6E3`) | Low-Medium | Should feel almost invisible |
| **Typography & Weight**   | Stronger heading weights and better spacing       | Medium   | Creates visual separation without lines |
| **Accent Color**          | Use teal/orange sparingly to draw attention       | Medium   | Great for CTAs and status |

### Border Rules (Light Mode)

- **Never use dark or high-contrast borders** in light mode.
- Recommended border color: `#E5E4E3` or `#E8E6E3` (very soft warm gray).
- Border should feel like a gentle definition rather than a hard line.
- For most cards, a border is optional if shadow elevation is strong enough.

**Bad Practice:**
- Dark gray or black borders (`#64748B`, `#475569`, etc.)
- High contrast borders that cut through the glass effect

**Good Practice:**
- Extremely soft borders that almost disappear
- Rely primarily on shadow + background tint for separation

---

## 5. Recommended Elevation Scale (Aligned with 3-Layer System)

| Elevation | Background     | Border (Soft)   | Shadow                                      | Layer | Usage |
|-----------|----------------|------------------|---------------------------------------------|-------|-------|
| 0         | `#F8FAFC`      | None             | None                                        | 0     | Page background |
| 1         | `#FFFFFF`      | `#E8E6E3` (optional) | `0 1px 3px rgba(0,0,0,0.06)`               | 1     | Basic list items |
| 2         | `#FFFFFF`      | `#E5E4E3`        | `0 4px 12px rgba(15,23,42,0.08)`            | 1–2   | Primary cards (Tasks, Evidence, Policy) |
| 3         | `#FFFFFF`      | `#E5E4E3`        | `0 8px 24px rgba(15,23,42,0.10) + 0 2px 4px rgba(15,23,42,0.06)` | 2     | Modals, bottom sheets, important panels |
| 4         | `#F1F5F9`      | `#E5E4E3`        | `0 12px 32px rgba(15,23,42,0.12)`           | 3     | Highest elevation surfaces (rare) |

**Note:** Background can stay pure white (`#FFFFFF`) for main cards. Use very light tints (`#F1F5F9`) only for clearly nested or secondary surfaces.

---

## 6. Glassmorphism Usage in Light Mode

- Light mode glass should remain **soft and elegant**.
- Backdrop blur is still allowed, but should be paired with very subtle borders.
- Heavy transparency (below 70% opacity) often causes blending — consider using 80–85% opacity glass panels when blur is applied.
- Respect the 3-layer limit strictly.

---

## 7. Summary of Rules

**Do:**
- Use soft, almost invisible borders (`#E5E4E3` range)
- Use layered, soft shadows for elevation
- Use very light background tints for secondary surfaces
- Rely on typography weight and spacing for hierarchy
- Use teal and orange strategically for focus
- Limit glass layers to a maximum of 3 (Layer 3 only when functionally necessary)

**Don't:**
- Use dark, high-contrast, or black borders in light mode
- Over-rely on transparency (causes white-on-white blending)
- Make all cards the exact same elevation
- Use strong borders as the primary separation method
- Stack glass beyond Layer 2 without strong justification

---

## 8. Affected Areas (Current State)

These screens were previously noted as having contrast issues in light mode and should be reviewed against the new 3-layer + soft elevation rules:

- CES My Tasks
- Policy Search
- Policy Appendices
- CES Workloads
- Onboarding V2 batch views (light mode)

---

**Document Owner:** Grok  
**Related Files:**
- `DESIGN_SPEC.md` (main spec)
- `LIGHT_MODE_ELEVATION_SYSTEM.md` (this file)

---

*This document aligns with the v2 direction: Care Indeed as the single canonical brand, strict 3-layer glass system, and soft elevation in light mode.*


---

<a name="loading-state-guidelines"></a>

## SOURCE: LOADING_STATE_GUIDELINES.md

# Loading State Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Philosophy

Loading states exist to **reduce perceived wait time** and **maintain trust**.

In a compliance platform, long or confusing loading states create anxiety ("Is the signature going through?"). Every loading state must feel calm, purposeful, and transparent.

---

## 2. Three Levels of Loading

### Level 1 — Immediate / Skeleton (Preferred for most views)

- Use skeleton loaders that match the final layout.
- Never show a generic spinner for complex pages.
- Skeleton should feel like the content is "coming into focus."

**Recommended for:**
- CES Board
- Policy Library
- Evidence Center list
- Onboarding V2 batch list

### Level 2 — Inline / Component Level

- Small, subtle spinner or progress indicator inside a card or button.
- Use for form submissions, evidence upload, signature capture.

**Rules:**
- Must include `role="status"` + `aria-live="polite"`
- Text should be meaningful ("Uploading evidence…", "Verifying signature…")

### Level 3 — Full Screen / Critical Action

- Used only for high-stakes actions (final signature lock, batch activation, large PDF generation).
- Must show clear progress when possible.
- Must show what is happening ("Finalizing eCign packet and generating certificate…").

---

## 3. Visual Treatment

- **Primary spinner color:** Teal (`--color-brand-teal`)
- **Accent / progress:** Restrained Orange only for long-running critical actions
- Never use bright cyan or legacy CI-ION colors.
- Respect `prefers-reduced-motion` — reduce or remove animation when requested.

**Glass integration:**
- Loading states should feel like they belong on the same Layer 1 or Layer 2 glass surface.
- Avoid hard white boxes on dark mode.

---

## 4. Timing Guidelines

| Duration       | Recommended Treatment                  | Example |
|----------------|----------------------------------------|-------|
| < 300ms        | None (instant)                         | Button click feedback |
| 300ms – 1.2s   | Subtle inline spinner or skeleton      | Filtering a list |
| 1.2s – 4s      | Skeleton or meaningful progress        | Loading CES board |
| 4s – 12s       | Progress indicator + helpful text      | Generating large PDF / signing packet |
| > 12s          | Explicit message + estimated time      | Large evidence batch processing |

---

## 5. Do’s and Don’ts

**✅ Do**
- Show what is happening when the action is important
- Use skeletons for list and card views
- Provide meaningful microcopy during long operations
- Allow cancellation for non-critical long operations when possible

**❌ Don’t**
- Show a generic spinner with no context for more than 2 seconds
- Use different spinner styles across the app
- Block the entire interface for minor actions
- Forget reduced-motion support

---

## 6. Component Ownership

- Canonical loading primitives should live in `ui/Loading*`
- Every surface (CES, eCign, Onboarding V2, Evidence, Policy) must use the same primitives
- Custom loaders are only allowed for truly unique situations and must be reviewed

---

## 7. Accessibility Requirements

- All loading indicators must be announced to screen readers
- Long operations must communicate progress (even approximate)
- Never trap focus during loading unless it is a modal critical action

---

*Good loading states make the system feel fast and trustworthy even when the network is slow.*

---

**Next:** Integrate skeleton loaders into CES Board and Evidence Center as part of Phase 2 Mobile Shell work.


---

<a name="master-implementation-readiness-checklist"></a>

## SOURCE: MASTER_IMPLEMENTATION_READINESS_CHECKLIST.md

# Master Implementation Readiness Checklist — CareIndeed v2 Design System

**Version:** 1.0  
**Date:** May 2026

---

## Purpose

This checklist helps the team verify that the v2 design system is ready for successful implementation across the organization.

---

## Foundations

- [ ] `DESIGN_SPEC.md` reviewed and understood by core team
- [ ] `GLASS_LAYERING_CHEAT_SHEET.md` printed and followed
- [ ] `COLOR_TOKENS.md` + `TYPOGRAPHY_SCALE.md` implemented in code
- [ ] `DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md` + `tokens.json` in use
- [ ] `LIGHT_MODE_ELEVATION_SYSTEM.md` rules applied in light mode

---

## Components & Code

- [ ] `COMPONENT_ANATOMY_AND_CODE_EXAMPLES.md` used as reference
- [ ] `FIGMA_TO_CODE_MAPPING.md` followed during implementation
- [ ] `BUILDING_V2_SCREEN_PLAYBOOK.md` used for every new screen
- [ ] Core `ui/` components built and tested (Button, Card, Input, Badge, Tabs, etc.)
- [ ] Storybook / Component library structure in place

---

## Specialized Workflows

- [ ] CES Board follows `CES_BOARD_VISUAL_LANGUAGE.md`
- [ ] Onboarding V2 follows `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md`
- [ ] Evidence follows `EVIDENCE_CAPTURE_SPECIFICATION.md`
- [ ] Signatures follow `SIGNATURE_CAPTURE_BEST_PRACTICES.md`
- [ ] Calendar follows `CALENDAR_VISUAL_PATTERNS.md`
- [ ] Charts follow `CHART_VISUAL_GUIDELINES.md`

---

## Implementation Support

- [ ] `MIGRATION_AND_ROLLOUT_STRATEGY.md` approved by leadership
- [ ] `ENGINEERING_HANDOFF_GUIDE.md` in use
- [ ] `DESIGN_SYSTEM_GOVERNANCE.md` and `CONTRIBUTION_PROCESS.md` active
- [ ] `DESIGN_SYSTEM_RELEASE_PROCESS.md` defined
- [ ] `VISUAL_REGRESSION_TESTING_STRATEGY.md` implemented

---

## Advanced / Critical Areas

- [ ] `OFFLINE_FIRST_AND_SYNC_PATTERNS.md` designed and implemented
- [ ] `GLOBAL_ERROR_HANDLING_PATTERNS.md` in place
- [ ] `PERFORMANCE_AND_LOADING_STRATEGY.md` followed
- [ ] `SECURITY_AND_PRIVACY_IN_UI.md` reviewed with security team
- [ ] `ACCESSIBILITY_IMPLEMENTATION_GUIDE.md` used in development

---

## Team Readiness

- [ ] `DESIGN_SYSTEM_ONBOARDING_GUIDE.md` created and used
- [ ] `TRAINING_MATERIALS_STRUCTURE.md` in progress
- [ ] Design System Health Dashboard planned (`DESIGN_SYSTEM_METRICS_DASHBOARD.md`)
- [ ] Quarterly review cadence defined

---

## Final Sign-off

- [ ] Core team (Design + Engineering) confident in the system
- [ ] First 3 production surfaces successfully built using v2
- [ ] Visual regression, accessibility, and performance targets met

---

**Use this checklist before starting major v2 implementation work.** Update it as gaps are closed.


---

<a name="migration-and-rollout-strategy"></a>

## SOURCE: MIGRATION_AND_ROLLOUT_STRATEGY.md

# Migration & Phased Rollout Strategy — CareIndeed v2 Design System

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document outlines a realistic, low-risk strategy for migrating the existing fragmented UI to the new v2 Care Indeed design system without a big-bang rewrite.

---

## 2. Overall Approach

**Do not attempt a full rewrite.**  
Instead, use a **strangler fig pattern** — gradually replace old components and surfaces with v2 versions while keeping the application stable.

---

## 3. Recommended Phases

### Phase 0: Foundations (Current)
- Freeze new component creation outside the `ui/` folder
- Establish token system (`DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md`)
- Build core primitives (`Button`, `Card`, `Input`, `Badge`, `EmptyState`, `Loading`, `Tabs`, `BottomSheet`)
- Create this documentation set

**Goal:** Have a usable primitive library before touching production screens.

### Phase 1: High-Impact Shared Components (1–2 months)
Replace the most duplicated components across the app:

- Buttons and form fields
- Cards and status badges
- Empty states and loading indicators
- Tabs and navigation primitives

**Target surfaces:** Any screen that uses these heavily (Policy Library, CES Board, Evidence Center, etc.)

### Phase 2: Core Operational Workflows (2–4 months)
Apply full v2 treatment to the highest-value production surfaces:

1. **CES Board + My Tasks** (highest daily usage)
2. **eCign Signing Experience** (legal risk + visual regression history)
3. **Evidence Capture & Evidence Center**
4. **Onboarding V2** (critical for business)
5. **Calendar** (unified view)

These surfaces should receive the full treatment (proper glass layering, mobile patterns, tokens, accessibility, content).

### Phase 3: Secondary Production Surfaces
- Policy Detail & Library
- Audit Readiness
- Reports & Dashboards
- Clinician & Patient profiles
- Staffing Calendar (read-only)

### Phase 4: Cleanup & Deprecation
- Remove old local components
- Delete legacy styling
- Enforce ESLint rules against raw values and old component usage
- Update Storybook / documentation

---

## 4. Risk Mitigation

| Risk                        | Mitigation |
|-----------------------------|----------|
| Visual inconsistency during migration | Use feature flags or route-based theming where possible |
| Breaking existing functionality | Never replace a component until it has full test coverage |
| Team resistance to new system | Provide the **Building a v2 Screen Playbook** and good examples |
| Scope creep                   | Strictly follow the **Production Surface Filter** (no Demo, iAdmin, Hubstaff, etc.) |

---

## 5. Governance During Migration

- Any new feature or major update on a production surface **must** use v2 components.
- Old surfaces can continue using legacy components temporarily, but no new legacy components should be created.
- Design Systems team reviews any PR that introduces new UI on production routes.

---

## 6. Success Metrics

- % of production screens using only v2 primitives
- Reduction in custom CSS / inline styles
- Improved accessibility scores on key surfaces
- Faster design-to-production time for new features
- Reduced visual bugs reported by QA and users

---

## 7. Recommended Tooling

- ESLint rules to ban raw color/spacing values
- Visual regression testing on key screens (especially eCign packets)
- Storybook for the `ui/` component library
- Feature flags for gradual rollout of new surfaces

---

*This phased approach allows the team to deliver value early while steadily moving toward a clean, consistent v2 system.*

---

**Related Documents:**
- `BUILDING_V2_SCREEN_PLAYBOOK.md`
- `ENGINEERING_HANDOFF_GUIDE.md`
- `PRODUCTION_SURFACE_FILTER.md` (from strategy folder)


---

<a name="motion-animation-principles"></a>

## SOURCE: MOTION_ANIMATION_PRINCIPLES.md

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


---

<a name="motion-implementation-examples"></a>

## SOURCE: MOTION_IMPLEMENTATION_EXAMPLES.md

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


---

<a name="motion-token-implementation"></a>

## SOURCE: MOTION_TOKEN_IMPLEMENTATION.md

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


---

<a name="offline-first-and-sync-patterns"></a>

## SOURCE: OFFLINE_FIRST_AND_SYNC_PATTERNS.md

# Offline-First & Data Sync Patterns — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Field clinicians and surveyors often work in areas with poor or no internet. This document defines how the v2 experience should gracefully handle offline scenarios while maintaining trust and data integrity.

---

## 2. Core Principles

- **Never lose user work** — Evidence capture, signatures, form progress, and notes must be preserved locally.
- **Clear communication** — The user must always know when they are offline and what will happen when they reconnect.
- **Prioritize critical actions** — Signing and evidence capture should work offline when possible.
- **Calm UX** — Offline states should feel intentional and controlled, not broken.

---

## 3. Recommended Patterns

### 3.1 Local-First Data Storage
- Use IndexedDB or a lightweight local database (e.g., WatermelonDB, Realm, or SQLite via Expo SQLite).
- Store drafts of:
  - eCign form progress
  - Evidence metadata + photo references
  - Task notes and status changes
  - Onboarding V2 gate responses

### 3.2 Optimistic Updates
- Allow users to mark tasks complete, capture evidence, or fill forms while offline.
- Show clear “Pending Sync” status.
- Queue actions and sync when connectivity returns.

### 3.3 Evidence Capture Offline
- Allow photo capture even when offline.
- Store photos locally with metadata.
- Upload automatically when back online (with progress indicator).
- Show “Evidence will sync when connected” message.

### 3.4 Signature Flow Offline
- Allow signature capture offline.
- Store the signature image + form state locally.
- Prevent final “Sign & Lock” until the packet can be verified and hashed on the server (or handle it carefully with local hashing + server reconciliation).

---

## 4. UI Patterns

- Persistent offline banner or indicator at the top of the screen (subtle, not alarming).
- “Sync” status in task cards and evidence items.
- Clear “You are offline. Changes will sync when connected.” messaging.
- Retry mechanism for failed syncs.

---

## 5. Conflict Resolution

- Last-write-wins with timestamp for most data.
- For critical items (signed documents), require server confirmation before marking as fully signed.
- Show clear conflict resolution UI when needed.

---

## 6. Testing Requirements

- Test core flows completely offline.
- Test going offline mid-flow (e.g., during evidence upload).
- Test long offline periods (days) and successful sync afterward.

---

*Offline support is not a nice-to-have — it is a core operational requirement for home health work.*

---

**Related Documents:**
- `EVIDENCE_CAPTURE_SPECIFICATION.md`
- `SIGNATURE_CAPTURE_BEST_PRACTICES.md`
- `PERFORMANCE_AND_LOADING_STRATEGY.md`


---

<a name="onboarding-v2-mobile-pattern-library"></a>

## SOURCE: ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md

# Onboarding V2 Mobile Pattern Library — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Onboarding V2 is a complex, high-stakes workflow involving batch creation, unit assignment, gate resolution, evidence collection, and activation. This document defines the mobile-first visual and interaction patterns so the experience feels consistent and manageable on phones and tablets.

---

## 2. Core Philosophy for Mobile

- **Progressive disclosure** — Do not overwhelm the user with the entire batch at once.
- **One-handed friendly** — Large targets, thumb zones, bottom sheets.
- **Clear state** — User must always know "where we are" in the activation process (Draft → In Progress → Gates → Evidence → Ready → Activated).
- **Calm urgency** — Use the restrained orange only for real blockers.

---

## 3. Key Mobile Patterns

### 3.1 Batch List View
- Vertical list of batches.
- Each card shows: Batch name, # of units, overall progress (visual bar or percentage), current phase, due date.
- Tap opens the Batch Detail (not a wide drawer on mobile).

### 3.2 Batch Detail (Mobile)
- Use **bottom sheet or full-screen page** (not the 760px desktop drawer).
- Segmented control or tabs for: Overview, Units, Gates, Evidence, Audit Readiness.
- Units shown as a clean list (not a complex table).

### 3.3 Unit Detail
- Large header with unit name + current status.
- Accordion or progressive sections for each gate/requirement.
- "Capture Evidence" as a prominent action (see `EVIDENCE_CAPTURE_SPECIFICATION.md`).
- Clear "Mark Complete" or "Request Review" buttons.

### 3.4 Gate Resolution Flow
- When a gate is ready for review: Clear "Submit for Review" button.
- Status badges: Not Started / In Progress / Evidence Needed / Under Review / Approved / Blocked.
- Use teal for approved, orange for action needed, red only for blocked.

---

## 4. Visual Treatment

- All surfaces follow the 3-layer glass system.
- Progress indicators should be subtle but clear (never flashy).
- Use the same card language as CES and Evidence Center.
- "Activation Readiness" score or checklist should feel like a calm dashboard, not a red alert system.

---

## 5. Interaction Patterns Specific to V2

- **Long press on unit** → Quick actions (Assign clinician, Capture evidence, Mark reviewed).
- **Pull to refresh** on batch list and unit list.
- **FAB** on Batch Detail for common actions ("Add Unit", "Capture Evidence for All").
- Bottom sheet for unit assignment instead of complex modals.

---

## 6. Empty States

- New batch with no units: "Add your first unit to begin the activation process."
- Unit with no outstanding gates: "This unit has cleared all gates. Ready for activation review."
- No evidence yet: Use the standard empty state pattern with "Capture Evidence" as primary action.

---

## 7. Do’s and Don’ts

**✅ Do**
- Keep the most common actions (Capture Evidence, Mark Gate Complete) extremely easy to reach.
- Show clear "Next Step" guidance on every screen.
- Make the final "Activate Batch" action feel deliberate and important (confirmation + summary).

**❌ Don’t**
- Replicate the wide desktop drawer pattern on mobile.
- Show 15+ requirements at once without strong grouping and search.
- Use different status colors or labels than the rest of the system.

---

## 8. Accessibility & Field Considerations

- Must work well in bright sunlight (good contrast).
- Large tap targets for gloved hands when relevant.
- Clear voice labels for screen readers on all status and action elements.

---

*Onboarding V2 on mobile must feel like a powerful but calm assistant, not a complex form to fight.*

---

**Related Documents:**
- `EVIDENCE_CAPTURE_SPECIFICATION.md`
- `EMPTY_STATE_PATTERNS.md`
- `CES_BOARD_VISUAL_LANGUAGE.md` (similar card and urgency language)


---

<a name="performance-and-loading-strategy"></a>

## SOURCE: PERFORMANCE_AND_LOADING_STRATEGY.md

# Performance & Progressive Loading Strategy — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document connects the design loading states (`LOADING_STATE_GUIDELINES.md`) with actual technical performance strategies to ensure the app feels fast and calm, especially on mobile in the field.

---

## 2. Core Philosophy

- **Perceived performance > actual performance** — Make the app feel fast even when the network is slow.
- **Skeleton first** — Show structure immediately.
- **Progressive enhancement** — Load the most important content first.
- **Respect the user’s time** — Clinicians and surveyors are often in a rush.

---

## 3. Recommended Loading Strategy by Surface

### CES Board / Task Lists
- **Initial load**: Show skeleton cards immediately (within 100ms).
- **Data fetch**: Load in parallel (tasks + status + assignees).
- **Progressive reveal**: Show high-priority (overdue + due today) first, then the rest.
- **Empty state**: Only show after data has loaded and confirmed empty.

### Evidence Center
- Show skeleton list first.
- Load thumbnails progressively.
- Use blur-up or low-res placeholders for images when possible.

### Onboarding V2
- Load batch overview first.
- Load unit list with skeletons.
- Load gate details on demand (lazy load when user opens a unit).

### eCign Packet Viewing
- Show document structure immediately.
- Load signature and certificate data in the background.
- Use optimistic UI when possible for signing flow.

---

## 4. Technical Recommendations

### React (Web)
- Use `React.Suspense` + lazy loading for heavy components.
- Implement skeleton components that match the final layout exactly.
- Use `useTransition` for non-urgent state updates.

### React Native
- Use `FlatList` with `getItemLayout` and `initialNumToRender` optimization.
- Implement skeleton screens using `react-native-skeleton-placeholder` or custom views.
- Consider offline-first with local caching for frequently accessed data.

### General
- Cache token and component styles aggressively.
- Minimize re-renders on list screens (use `React.memo` and proper keys).
- Preload critical data (e.g., current user’s tasks) on app launch.

---

## 5. Connection to Design

- All skeleton screens must match the final layout (see `LOADING_STATE_GUIDELINES.md`).
- Loading states should feel calm — avoid aggressive spinners when possible.
- Use the approved loading patterns (skeleton for lists, inline for actions, full screen only for major flows).

---

## 6. Performance Budget Targets (Recommended)

| Metric                        | Mobile Target     | Desktop Target    |
|-------------------------------|-------------------|-------------------|
| Time to Interactive (TTI)     | < 3.5s            | < 2.5s            |
| First Contentful Paint        | < 1.5s            | < 1s              |
| Skeleton visible              | < 100ms           | < 80ms            |
| List of 20 items fully loaded | < 4s              | < 2.5s            |

---

## 7. Monitoring

- Track Core Web Vitals (especially on key production surfaces).
- Monitor real user metrics for CES Board and eCign signing flows.
- Set up alerts for regressions in loading performance.

---

*Fast and calm is a competitive advantage in field-based compliance work.*

---

**Related Documents:**
- `LOADING_STATE_GUIDELINES.md`
- `BUILDING_V2_SCREEN_PLAYBOOK.md`
- `CES_BOARD_VISUAL_LANGUAGE.md`


---

<a name="print-pdf-consistency-guidelines"></a>

## SOURCE: PRINT_PDF_CONSISTENCY_GUIDELINES.md

# Print & PDF Consistency Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Critical For:** Legal defensibility, compliance artifacts, eCign packets, audit exports

---

## 1. Philosophy

Print and PDF outputs from the CareIndeed platform are **legal and regulatory artifacts**. They must be:

- Visually consistent
- Legally defensible
- Easy to read on paper or as a PDF
- Clearly branded as Care Indeed (single brand only)

**Never** allow visual drift between on-screen and printed versions of the same document.

---

## 2. Core Rules

### 2.1 Single Source of Truth for Headers & Footers

- **eCign signed packets** must use the single `buildPrintablePacketHtml` renderer in [FormSigningWorkspace.tsx](/src/policy/components/FormSigningWorkspace.tsx).
- The `.ci-brand-header` (fixed top bar) and `.ecign-footer` must appear on **every printed page**.
- Do **not** allow `.form-frame` (embedded) and `.form-page` (standalone) to render different header treatments.

### 2.2 Brand Header (Mandatory on All Printed Pages)

The Care Indeed brand header must contain:
- Care Indeed logo (mark + wordmark)
- "Care Indeed Home Health Care, Inc."
- "Enterprise Forms Library · Signed Document Package"
- Form title (right aligned)
- Subtle teal bottom border

**Color rules on print:**
- Background: near-white with slight opacity
- Text: Navy primary, Muted secondary
- Accent: Teal for the bottom border

### 2.3 Footer Requirements

Every printed compliance document must show:
- Small Care Indeed logo
- Certificate / Document ID (monospace)
- Signer name
- Signed timestamp
- "SIGNED" badge (bold, orange accent)

---

## 3. eCign Packet Specific Rules

### Approved Structure (Signed Locked State)

1. Care Indeed fixed brand header (every page)
2. Form content (the actual eCign form)
3. Appended certificate page(s) — if any
4. Fixed footer with signature metadata (every page)

### Prohibited

- Dual header systems (old CI-ION + new Care Indeed)
- Hard black borders on any printed element
- Different typography or spacing between the form body and the certificate
- Overlapping content under the fixed header/footer

---

## 4. CES Reports & Audit Exports

When exporting CES reports, Audit Readiness, or Onboarding Activation summaries to PDF:

- Use the same typography scale as the design system (Montserrat headings, Inter body)
- Maintain 3-layer glass hierarchy visually (via soft shadows or subtle tints)
- Include the Care Indeed brand header + timestamp + generated-by line
- Use restrained orange only for high-urgency items (overdue, failed, blocked)
- Teal for completed / compliant items

---

## 5. Technical Implementation Requirements

- All print styles must live in the component that owns the printable artifact (never global `* {}` overrides).
- Use `@media print` + `@page` rules.
- Force `page-break-inside: avoid` on cards, sections, and tables that should stay together.
- Test on both Chrome and Edge (most common for field users).

---

## 6. QA Checklist Before Shipping Any Print/PDF Feature

- [ ] Header appears on every page
- [ ] Footer appears on every page
- [ ] No content overlaps header/footer
- [ ] Form title is accurate
- [ ] Certificate ID matches the signed record
- [ ] Signature image is clear and not distorted
- [ ] All required legal text is present and legible
- [ ] No CI-ION maroon/gold appears anywhere

---

## 7. Known Historical Issues (Do Not Reintroduce)

- Conflicting `.form-frame` vs `.form-page` renderers (caused white-screen / header duplication on signed_locked packets).
- Two different brand headers in the same print job.
- Missing or incorrect `ciLogoSrc` / `logoSrc` paths.

---

**Print and PDF outputs are the final legal record.** Treat them with the same rigor as the signing experience itself.

---

*Next:* Add automated visual regression tests for signed eCign packets.


---

<a name="readme"></a>

## SOURCE: README.md

# CareIndeed Home Health — Design System Documentation (v2)

**Location:** `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/`

**Status:** Comprehensive — Production Ready  
**Last Updated:** May 2026

---

## Overview

This folder contains the **complete v2 design system documentation** for the CareIndeed Home Health Compliance Platform.

**Non-negotiable rules:**
- **Care Indeed is the ONLY active canonical brand** (CI-ION maroon/gold is retired for production).
- **Strict 3-Layer Glass System** (Layer 0 atmospheric background, Layer 1 main surface, Layer 2 elevated card/dialog). Layer 3 only when functionally required.
- **Dark mode** is primary for operational work. Light mode uses soft glass treatment (hairline borders + layered shadows, never hard black borders).
- **Mobile-first operational philosophy** — clinician / DON / surveyor one-handed use, interruption-tolerant, 44px targets.

---

## Complete Document Index

### Core Foundations

| Document | Purpose |
|----------|---------|
| `DESIGN_SPEC.md` | Master vision, principles, layout rules, component philosophy |
| `LIGHT_MODE_ELEVATION_SYSTEM.md` | Light mode contrast, soft glass elevation, hairline borders + shadows |
| `GLASS_LAYERING_CHEAT_SHEET.md` | One-page quick reference (Layer 0/1/2/3 rules) |
| `COLOR_TOKENS.md` | Official Care Indeed palette (Navy / Teal / Restrained Orange) with usage |
| `TYPOGRAPHY_SCALE.md` | Heading + body scale for mobile and desktop |
| `MOTION_ANIMATION_PRINCIPLES.md` | Timing, easing, micro-interactions, reduced-motion rules |
| `DESIGN_TOKEN_EXPORT_GUIDE.md` | Token structure and export formats for engineering |

### Guidelines & Standards

| Document | Purpose |
|----------|---------|
| `DOS_AND_DONTS.md` | High-level visual, motion, and component rules |
| `COMPONENT_GUIDELINES.md` | Detailed specs (Button, Card, Form, Navigation, Status, Modal, Tabs, etc.) |
| `COMPONENT_USAGE_EXAMPLES.md` | Correct vs incorrect real-world usage examples |
| `ICONOGRAPHY_GUIDELINES.md` | Icon style, sizing, color usage, and library recommendations |
| `ICON_LIBRARY_EXPORT_GUIDE.md` | How to build and export the official icon set |
| `DARK_VS_LIGHT_MODE_GUIDE.md` | When to use each mode and how the treatments differ |
| `ACCESSIBILITY_GUIDELINES.md` | WCAG 2.2 AA requirements tailored to this platform |
| `ACCESSIBILITY_COMPONENT_CHECKLIST.md` | Per-component accessibility checklist |
| `CONTENT_MICROCOPY_GUIDELINES.md` | Voice, tone, terminology, error messages, and empty states |

### Implementation & Handoff

| Document | Purpose |
|----------|---------|
| `MOTION_TOKEN_IMPLEMENTATION.md` | How to implement motion tokens in code (React / React Native) |
| `FIGMA_KIT_SPEC.md` | Structure and governance for the official Figma design kit |
| `ENGINEERING_HANDOFF_GUIDE.md` | How design hands off to engineering (tokens, primitives, review process) |
| `PRINT_PDF_CONSISTENCY_GUIDELINES.md` | eCign packet, CES reports, and audit export print rules (legal artifacts) |

### Specialized Workflow Specs

| Document | Purpose |
|----------|---------|
| `CES_BOARD_VISUAL_LANGUAGE.md` | Exact card hierarchy, urgency system, and mobile patterns for CES |
| `EMPTY_STATE_PATTERNS.md` | Three types of empty states + approved treatments |
| `LOADING_STATE_GUIDELINES.md` | Skeleton, inline, and full-screen loading rules |
| `V2_MOCKUP_GENERATION_BRIEF.md` | Precise prompt for Gemini / AI image generation (cohesive v2 style) |
| `V2_DESIGN_DIRECTION_SUMMARY.md` | One-page executive summary of the entire v2 direction |

---

## Current Design Direction (Summary)

- **Single Brand:** Care Indeed only (Navy `#0F172A`, Teal `#007970`, Restrained Orange `#E07B2C`)
- **Glass System:** Maximum 3 layers. Layer 3 is rare and functional only.
- **Light Mode:** Soft, expensive glass — subtle hairline borders + layered shadows (no hard black borders)
- **Motion:** Calm, purposeful, premium. Never flashy or bouncy.
- **Typography:** Montserrat for headings, Inter for body text.
- **Primary Use Case:** Field clinicians, DONs, and surveyors doing real compliance work on phones and tablets.

---

## Status & Next Steps

**Completed (as of this update):**
- Full foundations (color, typography, motion, tokens, glass system)
- All major guidelines (components, icons, accessibility, content, dark/light)
- Implementation handoff documents (Figma kit, engineering, print/PDF)
- Specialized operational specs (CES Board, Empty States, Loading)

**Remaining High-Value Documents (being added in this session):**
- Signature Capture Best Practices
- Evidence Capture Specification
- Onboarding V2 Mobile Pattern Library
- Calendar Visual Patterns
- Task Urgency Hierarchy Spec
- Responsive Behavior Matrix
- Form Validation Patterns
- Error Handling Guidelines
- Hover/Focus/Active States
- Gesture Interaction Guidelines
- Voice/Brad Integration Hooks
- And additional workflow-specific pattern libraries

All documents enforce the single Care Indeed brand, 3-layer glass limit, soft light mode treatment, and mobile-first operational philosophy.

---

**This package is ready for:**
- Engineering implementation (5-phase reconstruction plan)
- Building the official Figma v2 kit
- Sharing `V2_MOCKUP_GENERATION_BRIEF.md` with Gemini for cohesive light-mode v2 mockups (CES Calendar, Journey/LMS, etc.)
- Team onboarding and design system governance

---

*Built for calm, trustworthy, and operationally excellent home health compliance.*


---

<a name="responsive-behavior-matrix"></a>

## SOURCE: RESPONSIVE_BEHAVIOR_MATRIX.md

# Responsive Behavior Matrix — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This matrix defines how every major component and screen behaves across Mobile (< 768px), Tablet (768–1024px), and Desktop (> 1024px). Mobile-first is non-negotiable.

---

## 2. Breakpoints

- **Mobile**: 0 – 767px (primary target)
- **Tablet**: 768 – 1023px
- **Desktop**: 1024px and up (enhanced experience)

---

## 3. Navigation

| Surface       | Mobile                          | Tablet                     | Desktop                          |
|---------------|---------------------------------|----------------------------|----------------------------------|
| Main Nav      | Bottom tab bar (max 5 items)    | Collapsible sidebar or top | Persistent left sidebar          |
| "More" menu   | Bottom sheet                    | Bottom sheet or drawer     | Expanded in sidebar              |
| Back / Close  | Top-left or gesture             | Top-left                   | Top-left + breadcrumb support    |

---

## 4. Major Components

### Cards & Lists
- **Mobile**: Single column, generous padding, large tap targets.
- **Tablet**: 1–2 column grid depending on content density.
- **Desktop**: 2–3+ column grids where appropriate (e.g., Evidence Center, CES reports).

### Modals vs Bottom Sheets
- **Mobile**: Almost everything that would be a modal on desktop becomes a **bottom sheet**.
- **Tablet**: Bottom sheet for most actions, full modal only for very complex flows.
- **Desktop**: Traditional modals and side drawers allowed.

### Drawers
- **Mobile**: Never use wide right drawers. Convert to bottom sheet or full-screen page.
- **Desktop**: Right drawers acceptable for detail panels (e.g., UnitDrawer on desktop only).

### Forms
- **Mobile**: Stacked fields, large inputs (min 48px height), helper text above or below.
- **Tablet/Desktop**: Can use two-column layouts for long forms when it improves scannability.

### Main App Surface Container (Desktop Glassmorphism Rule)

**Critical for premium glass effect on desktop:**

- The main Layer 1 working surface **must not** take up the full screen width.
- Apply a constrained container with `max-width` (recommended 1280px – 1600px) + visible horizontal margins (32px+ on each side on standard desktop, more on ultrawide).
- This exposes the rich **Layer 0 dark atmospheric background** around the main glass panel, dramatically increasing depth and the "expensive" glassmorphic feeling.

**Reference:** Current desktop implementations (e.g. the Policy Library view) show the main card area nicely contained with background visible on all sides.

- **Mobile & Tablet**: Closer to full-width is acceptable due to limited screen real estate.
- **Desktop only**: This breathing room rule is mandatory for visual quality.

---

## 5. CES Board

- **Mobile**: Vertical list (agenda style). No Kanban columns.
- **Tablet**: Can show limited columns if space allows.
- **Desktop**: Full Kanban or grouped board views supported.

---

## 6. Onboarding V2

- **Mobile**: Batch list → Batch detail page → Unit detail page. Bottom sheets for actions.
- **Tablet**: Can use split view (list + detail) in landscape.
- **Desktop**: List + wide detail drawer or side panel.

---

## 7. Calendar

- **Mobile**: Agenda/List view primary. Week view via swipe. Month view secondary.
- **Tablet**: Week or month grid + agenda.
- **Desktop**: Full month grid + sidebar agenda.

---

## 8. Evidence & Signature Capture

- **Mobile**: Full camera experience + large signature pad.
- **Tablet/Desktop**: Camera + file upload options + reasonably sized signature area.

---

## 9. General Rules

- **Never** hide critical actions behind hover on mobile.
- **Always** test thumb reach zones on real devices.
- Progressive disclosure increases on smaller screens.
- Touch targets minimum 44×44px everywhere (48px preferred for primary actions).

---

## 10. Testing Requirements

Every new screen or component must be reviewed in:
1. iPhone 14/15/16 Pro (or equivalent)
2. iPad (landscape + portrait)
3. Desktop browser at 1440px and 1920px

---

*If it doesn't feel excellent on a phone in one hand, it doesn't ship.*

---

**This matrix must be followed during all Phase 2 (Mobile Shell) and Phase 3 (High-Frequency Workflow) implementation.**


---

<a name="security-and-privacy-in-ui"></a>

## SOURCE: SECURITY_AND_PRIVACY_IN_UI.md

# Security & Privacy Considerations in UI Components — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document highlights security and privacy considerations that should be built into the design and implementation of v2 components, especially those handling sensitive data (signatures, evidence, patient information).

---

## 2. Key Areas

### Signature Capture
- Never store raw signature images in localStorage or easily accessible places.
- Ensure signature data is only transmitted over secure channels.
- Show clear confirmation before final submission.

### Evidence Capture
- Photos may contain sensitive patient information (names, dates, medical details).
- Design should support redaction or cropping tools when appropriate.
- Clear messaging about data handling and retention.

### Form Data
- Auto-save should be local-first and encrypted where possible.
- Clear indication when data is stored locally vs synced to the server.

### Display of Sensitive Information
- Use masking or truncation for sensitive fields when displayed in lists.
- Require explicit action to reveal full details.

---

## 3. Design Implications

- Include privacy notices in relevant flows (especially signing and evidence).
- Design clear “Delete locally stored data” options.
- Avoid showing full sensitive documents in thumbnail views when possible.

---

## 4. Implementation Notes

- Work closely with backend and security teams on data handling.
- Ensure offline storage follows company security policies.
- Audit all `ui/` components that handle or display sensitive data.

---

*Security and privacy must be considered at the design system level, not just at the feature level.*

---

**Related Documents:**
- `SIGNATURE_CAPTURE_BEST_PRACTICES.md`
- `EVIDENCE_CAPTURE_SPECIFICATION.md`
- `OFFLINE_FIRST_AND_SYNC_PATTERNS.md`


---

<a name="signature-capture-best-practices"></a>

## SOURCE: SIGNATURE_CAPTURE_BEST_PRACTICES.md

# Signature Capture Best Practices — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Critical For:** eCign legal defensibility, regulatory compliance

---

## 1. Purpose

Electronic signatures in the CareIndeed platform are **legally binding** compliance artifacts. This document defines the visual, interaction, and technical standards for all signature capture experiences.

---

## 2. Core Requirements

### 2.1 Legal & Audit Trail (Non-negotiable)

- The signer must explicitly affirm they are the named person and that the signature is theirs.
- Timestamp, device info, IP (when available), and form version must be captured.
- The signature image + metadata must be stored immutably (tied to the eCign hash chain).

### 2.2 Visual Treatment

- Large, comfortable capture area on mobile (minimum 300px height on phone, preferably more).
- Clean white or very light background for the signature pad (high contrast for later printing).
- Clear "Sign here" placeholder text that disappears on first stroke.
- Visible "Clear" button that is easy to tap but not accidentally triggered.
- "I am [Name] and this is my electronic signature" checkbox or affirmation statement **before** the final "Sign & Lock" action.

### 2.3 Mobile Ergonomics

- Signature area must be usable one-handed (thumb-friendly zone when possible).
- Support both finger and stylus.
- Do not require precise small movements.
- Provide generous undo/clear affordance.

---

## 3. Interaction Flow (Recommended)

1. User reaches the signature step in the eCign packet.
2. System shows the document summary + "You are about to electronically sign this document as [Full Name]".
3. Large signature pad appears.
4. User draws signature.
5. "Clear" button available at all times.
6. Affirmation checkbox appears: "I confirm this is my signature and I am authorized to sign."
7. Primary action button: **"Sign & Lock"** (Orange, high emphasis).
8. On success: Clear confirmation ("Document signed and locked") + immediate transition to signed_locked state.

---

## 4. Error & Edge Cases

- User tries to sign without the affirmation → Block with clear message.
- Signature is too small / too faint → Gentle prompt ("Please provide a clear signature").
- Network failure during final lock → Clear error + option to retry without losing the signature data.
- User wants to go back → Allow until the final "Sign & Lock" is confirmed.

---

## 5. Print / PDF Output

The captured signature must render cleanly in the printed eCign packet:
- Reasonable size (not microscopic)
- Good contrast on paper
- Paired with signer name, timestamp, and certificate ID in the footer

See `PRINT_PDF_CONSISTENCY_GUIDELINES.md` for exact footer requirements.

---

## 6. Accessibility

- Signature pad must be usable via external input devices when possible.
- All buttons and the affirmation must be keyboard and screen-reader accessible.
- Clear focus states on the capture area and controls.

---

## 7. Do’s and Don’ts

**✅ Do**
- Make the capture area large and forgiving
- Require explicit affirmation before locking
- Show a clear, calm success state
- Store the signature at high enough resolution for printing

**❌ Don’t**
- Allow signing without the legal affirmation
- Make the pad too small on mobile
- Hide the "Clear" button
- Use overly stylized or "fun" signature pad visuals (this is a legal document)

---

*Signature capture is one of the highest-risk interactions in the entire platform. It must feel serious, clear, and trustworthy.*

---

**Related Documents:**
- `PRINT_PDF_CONSISTENCY_GUIDELINES.md`
- `EVIDENCE_CAPTURE_SPECIFICATION.md` (future)
- `FORM_VALIDATION_PATTERNS.md` (future)


---

<a name="tailwind-and-token-integration"></a>

## SOURCE: TAILWIND_AND_TOKEN_INTEGRATION.md

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


---

<a name="task-urgency-hierarchy-spec"></a>

## SOURCE: TASK_URGENCY_HIERARCHY_SPEC.md

# Task Urgency Hierarchy Specification — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines exactly how urgency is communicated across CES tasks, My Tasks, calendar items, and Onboarding V2. Consistent urgency signaling is critical for clinicians and DONs who must prioritize under time pressure.

---

## 2. Urgency Levels (Canonical)

| Level | Name              | Visual Treatment                          | When to Use |
|-------|-------------------|-------------------------------------------|-------------|
| 0     | Completed         | Teal check + muted text                   | Task done |
| 1     | On Track / Normal | Standard Layer 1 glass card               | Due in future, no issues |
| 2     | Due Today         | Orange badge + subtle highlight           | Due within the current day |
| 3     | Overdue           | Orange left border + "Overdue Xd" badge   | Past due date |
| 4     | Blocked / Critical| Red left border + strong badge (rare)     | Regulatory blocker, patient safety, failed gate |

**Rule:** Level 4 (red) must be used extremely sparingly. Most "urgent" items should live in Level 3 with clear orange treatment.

---

## 3. Visual Rules

- **Badges**: Small, rounded, high contrast. Text is always present ("Due Today", "Overdue 4d", "Blocked").
- **Left Border Accent**: Only on cards that need to stand out in a list (CES board, task list).
- **Text Weight**: Due date text becomes bolder when overdue.
- **Never** rely on color alone — always combine color + text + (when possible) icon.

---

## 4. Application Across Surfaces

### CES Board
- Cards follow the above hierarchy strictly.
- "My Tasks" section can promote Level 2 and 3 items to the top.

### Calendar
- Agenda view groups by day.
- Overdue items from previous days appear at the top of "Today" with clear overdue treatment.

### Onboarding V2
- Gate status uses the same levels.
- A blocked gate on a unit that is blocking activation should use Level 4 treatment.

### Evidence Center
- Missing evidence on a high-urgency requirement inherits the urgency of the parent task.

---

## 5. Mobile Considerations

- On small screens, urgency must be scannable at a glance.
- Use larger "Overdue" badges when space allows.
- Swipe actions can surface quick resolution for Level 2 and 3 items.

---

## 6. Do’s and Don’ts

**✅ Do**
- Make "Due Today" and "Overdue" extremely clear.
- Allow users to filter by urgency level.
- Show count of overdue items in navigation badges when relevant (e.g., CES tab).

**❌ Don’t**
- Create new urgency colors or labels per feature.
- Use red for anything that is merely "important".
- Make urgency indicators too small to read while walking or in a car.

---

## 7. Future Enhancements

- Smart prioritization (AI-suggested "Do these first").
- Voice summary: "You have 3 overdue tasks and 7 due today."
- Personal urgency settings (some clinicians want stronger signals than others).

---

*Urgency must reduce cognitive load, not increase anxiety.*

---

**Related:** `CES_BOARD_VISUAL_LANGUAGE.md`, `CALENDAR_VISUAL_PATTERNS.md`


---

<a name="training-materials-structure"></a>

## SOURCE: TRAINING_MATERIALS_STRUCTURE.md

# Training Materials Structure — CareIndeed v2 Design System

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document outlines the recommended structure for training materials so that new designers, engineers, and stakeholders can quickly become productive with the v2 design system.

---

## 2. Recommended Training Tracks

### For New Engineers
1. **Foundations** (2–3 hours)
   - Read: `V2_DESIGN_DIRECTION_SUMMARY.md`, `DESIGN_SPEC.md`, `GLASS_LAYERING_CHEAT_SHEET.md`
   - Watch: Short video on the 3-layer glass system

2. **Core Implementation** (4–6 hours)
   - `BUILDING_V2_SCREEN_PLAYBOOK.md`
   - `COMPONENT_ANATOMY_AND_CODE_EXAMPLES.md`
   - `FIGMA_TO_CODE_MAPPING.md`
   - `DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md`

3. **Advanced Topics**
   - Migration strategy
   - Offline patterns
   - Performance & loading
   - Error handling

### For New Designers
1. **Design Principles** (2 hours)
   - `DESIGN_SPEC.md`
   - `DOS_AND_DONTS.md`
   - `LIGHT_MODE_ELEVATION_SYSTEM.md`

2. **Workflow Specs** (Ongoing)
   - Deep dive into CES, Onboarding V2, Evidence, Signature, Calendar specs

3. **Figma Kit Training**
   - How to use the v2 Figma library
   - Contribution process

---

## 3. Training Assets to Create

- Short Loom / video walkthroughs of key documents
- Interactive Figma file with annotated examples
- “Build your first v2 screen” workshop (hands-on)
- Quarterly “What’s new in the design system” sessions

---

## 4. Ownership

- Design Systems team owns the curriculum and materials
- Engineering Enablement helps deliver technical training

---

*Good training reduces onboarding time and protects the quality of the design system.*

---

**Related Documents:**
- `DESIGN_SYSTEM_ONBOARDING_GUIDE.md`
- `BUILDING_V2_SCREEN_PLAYBOOK.md`


---

<a name="typography-scale"></a>

## SOURCE: TYPOGRAPHY_SCALE.md

# Typography Scale — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Font Stack

| Purpose       | Font Family                  | Weight     | Fallback |
|---------------|------------------------------|------------|----------|
| Headings      | Montserrat                   | 600 / 700  | System sans-serif |
| Body & UI     | Inter (preferred) or system  | 400 / 500 / 600 | System UI sans-serif |
| Monospace     | JetBrains Mono               | 400 / 500  | ui-monospace, monospace |

---

## 2. Type Scale (Mobile-First)

We use a **modular, responsive scale** optimized for clinical readability and operational clarity.

### Mobile (< 768px)

| Token              | Size   | Line Height | Weight | Letter Spacing | Usage |
|--------------------|--------|-------------|--------|----------------|-------|
| `text-display`     | 28px   | 1.2         | 700    | -0.02em        | Major page titles (rare) |
| `text-title`       | 24px   | 1.25        | 700    | -0.015em       | Screen titles, section headers |
| `text-subtitle`    | 20px   | 1.3         | 600    | -0.01em        | Card titles, important labels |
| `text-body-lg`     | 16px   | 1.5         | 500    | Normal         | Primary body text |
| `text-body`        | 15px   | 1.5         | 400    | Normal         | Default body text |
| `text-body-sm`     | 13px   | 1.45        | 400    | Normal         | Secondary information |
| `text-label`       | 12px   | 1.4         | 600    | 0.02em         | Form labels, tags, metadata |
| `text-caption`     | 11px   | 1.35        | 400    | 0.03em         | Timestamps, helper text |
| `text-mono`        | 12px   | 1.4         | 400    | Normal         | IDs, hashes, codes |

### Desktop (≥ 1024px)

| Token              | Size   | Line Height | Weight | Letter Spacing | Usage |
|--------------------|--------|-------------|--------|----------------|-------|
| `text-display`     | 32px   | 1.15        | 700    | -0.025em       | Major page titles |
| `text-title`       | 26px   | 1.2         | 700    | -0.02em        | Screen titles |
| `text-subtitle`    | 22px   | 1.25        | 600    | -0.015em       | Card titles |
| `text-body-lg`     | 17px   | 1.55        | 500    | Normal         | Primary body |
| `text-body`        | 16px   | 1.55        | 400    | Normal         | Default body |
| `text-body-sm`     | 14px   | 1.5         | 400    | Normal         | Secondary |
| `text-label`       | 13px   | 1.4         | 600    | 0.02em         | Labels, tags |
| `text-caption`     | 12px   | 1.35        | 400    | 0.03em         | Metadata |
| `text-mono`        | 13px   | 1.4         | 400    | Normal         | Code / IDs |

---

## 3. Responsive Behavior

- On mobile, headings are intentionally tighter to save vertical space.
- On desktop, we allow slightly more breathing room and larger sizes.
- Line height increases slightly on desktop for better long-form readability (especially policy documents and audit views).

---

## 4. Usage Guidelines

- **Never** go below 11px for any text.
- Use **Montserrat 700** for the most important titles only.
- Use **Inter 500** for medium emphasis (e.g., card titles, important labels).
- Monospace should be used consistently for IDs, audit hashes, timestamps, and technical data.
- In light mode, body text should have enough weight (minimum 400) for readability on clinical backgrounds.

---

## 5. Recommended Tailwind / CSS Mapping (Example)

```css
.text-display   { font-size: 28px; line-height: 1.2; font-weight: 700; }
.text-title     { font-size: 24px; line-height: 1.25; font-weight: 700; }
.text-subtitle  { font-size: 20px; line-height: 1.3; font-weight: 600; }
.text-body-lg   { font-size: 16px; line-height: 1.5; font-weight: 500; }
.text-body      { font-size: 15px; line-height: 1.5; font-weight: 400; }
.text-body-sm   { font-size: 13px; line-height: 1.45; font-weight: 400; }
.text-label     { font-size: 12px; line-height: 1.4; font-weight: 600; letter-spacing: 0.02em; }
.text-caption   { font-size: 11px; line-height: 1.35; font-weight: 400; letter-spacing: 0.03em; }
.text-mono      { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
```

---

*This scale is designed for high readability in high-stakes healthcare compliance environments.*


---

<a name="v2-design-direction-summary"></a>

## SOURCE: V2_DESIGN_DIRECTION_SUMMARY.md

# v2 Design Direction Summary
**CareIndeed Home Health Compliance Platform**

**One-Page Executive Summary**

---

## The Change

We have moved from a **dual-brand system** (Care Indeed + legacy CI-ION) to a **single canonical brand**: **Care Indeed**.

**Reason:** The CI-ION maroon/gold system was causing visual drift, inconsistent accents, and conflicting glass treatments across the platform.

---

## New Visual Identity (v2)

**"Premium Clinical Compliance Operating System"**

- **Dark Mode** (Primary for operational work): Deep navy + charcoal glassmorphic
- **Light Mode** (Secondary): Soft glassmorphic with subtle elevation
- **Colors:** Navy + Teal (#007970) + Restrained Orange (#E07B2C)
- **Glass System:** Maximum 3 layers (Layer 0 background, Layer 1 main surface, Layer 2 elevated cards/dialogs). Layer 3 only by exception.

**Core Aesthetic:**
Expensive • Clean • Modern • Clinical • Professional

---

## Design Principles

1. **Mobile-first, Desktop-enhanced**
2. **Task-first, not data-first**
3. **One Brand Only** (Care Indeed)
4. **Strict 3-Layer Glass System**
5. **Calm, Purposeful Motion**
6. **Strong Operational Clarity** (urgency, risk, and compliance status must be immediately visible)

---

## Key Experience Priorities

- **eCign Signing** — Premium, defensible, one-handed friendly
- **CES Execution** — Clear task state, workload visibility, easy evidence handoff
- **Evidence & Artifacts** — Document-centric with visible chain of custody
- **Onboarding V2** — Gate clarity and smooth activation
- **Policy & Audit** — Calm, scannable, and authoritative

---

## Current Status

- Full design system documentation is being built in the `/design` folder.
- v2 mockups are being developed in `mockup/Mobile/v2` and `mockup/Desktop/v2`.
- Light mode is being refined with softer glass treatment (no hard borders).
- All future work must follow the single-brand Care Indeed direction.

---

**This is the official v2 design direction.**

*For full details, refer to `DESIGN_SPEC.md`.*

---

*Maintained by the Design Systems team.*


---

<a name="v2-mockup-generation-brief"></a>

## SOURCE: V2_MOCKUP_GENERATION_BRIEF.md

# v2 Mockup Generation Brief (Optimized for Gemini / External Models)

**Project:** CareIndeed Home Health – v2 Design System  
**Date:** May 2026  
**Purpose:** Use this as a strict prompt when generating new mockups with Gemini, Claude, or other image models.

---

## 1. Overall Direction (Locked)

**Style:** Premium, clinical-grade, expensive, clean, modern, professional healthcare compliance platform.

**Primary Aesthetic (v2 Base):**
- Deep, elegant **dark glassmorphic**
- Deep navy + charcoal base with soft frosted depth
- Teal (#007970) and restrained warm orange (#E07B2C) accents only
- High-end "Compliance Operating System" feel (not generic admin dashboard)

**Light Mode Treatment:**
- Soft, elegant light glassmorphic
- **Very subtle hairline borders only** (almost invisible — e.g. #E5E4E3)
- Layered soft shadows + very light background tints for separation
- **Never use hard or dark borders** in light mode (this breaks the glass feeling)

---

## 2. Glass Layering System (Strict)

**Maximum 3 layers allowed:**

- **Layer 0** — Dark atmospheric background (deep navy/charcoal)
- **Layer 1** — Main app surface (primary working area)
- **Layer 2** — Elevated actionable cards, dialogs, bottom sheets, detail panels
- **Layer 3** — Only when functionally necessary (rare exception)

**Do not over-layer.** Over-layering destroys the premium, calm, expensive feeling.

---

## 3. Color Rules

- Use **only** the Care Indeed palette:
  - Navy (#0F172A)
  - Teal (#007970)
  - Restrained warm orange (#E07B2C)
- Orange must feel **strategic** (CTAs, pending actions, signatures, escalations). Do not scatter it.
- Teal = stable / compliant / secondary
- Semantic colors (green, amber, red) for status only

---

## 4. Typography

- Headings: Montserrat (600/700)
- Body & UI: Inter or clean system sans-serif
- Monospace: JetBrains Mono (for IDs, hashes, codes)

Maintain strong, clear hierarchy.

---

## 5. Base References (Use These as Visual Benchmark)

Use these two mockups as the **quality and feeling benchmark** for all new work:

- **Mobile Reference:** `09_CES_Board_Dark.jpg` (CES Board)
- **Desktop Reference:** `07_EvidenceCenter_Dark.jpg` (Evidence Center)

All new mockups should feel like they belong in the same family, while varying layout structure per screen type.

---

## 6. Screen Variation Rules

- **Do not** make every screen look the same.
- Vary layout and structure depending on the screen type:
  - Dashboards → KPI + overview cards
  - Boards → Column or card-based (kanban feel)
  - Detail views → Focused content + right panel or bottom sheet
  - Forms / Signing → Calm, high-trust, large comfortable targets
  - Lists → Clean, scannable, strong status visibility

Pull strong elements from previous successful mockups (card treatments, typography, spacing, accent usage, icon placement).

---

## 7. Current Priority Queue (Light Mode v2)

Generate the following in this order (all in the refined v2 soft light glassmorphic style):

### Highest Priority
1. **CES Calendar** – Mobile (iPhone 16 Pro)
2. **CES Calendar** – Desktop (1920x1080)

### Next Priority (Journey / LMS)
3. **Journey Home / Module List** – Mobile
4. **Journey Home / Module List** – Desktop
5. **Journey Module Player / Course View** – Mobile
6. **Journey Module Player / Course View** – Desktop

### Following Priority
7. CES Workloads (Mobile + Desktop)
8. Policy Appendices (Mobile + Desktop)
9. Onboarding V2 Governance (Mobile + Desktop)
10. Evidence Artifact Viewer – Detail view (Mobile + Desktop)

---

## 8. Output Requirements

When generating mockups, please follow these rules:

- Use realistic device frames (iPhone 16 Pro for mobile, clean modern browser frame for desktop)
- Show the **CareIndeed** orange circular logo mark in the header
- Maintain excellent visual hierarchy and operational clarity
- Use the **3-layer glass system** strictly
- In light mode: use **very subtle hairline borders** + layered soft shadows (no hard or dark borders)
- Vary the layout structure between different screen types
- Pull good elements from previous successful mockups (card design, typography, spacing, accent usage)
- Keep the feeling **expensive, clean, modern, clinical, and professional**

---

## 9. Important Notes for the Generator

- This is a **compliance-heavy operational platform**, not a consumer app.
- Users (clinicians, DONs, surveyors) are often under time pressure.
- The UI must feel **trustworthy, calm, and premium**.
- Dark mode currently carries the strongest brand feel, but light mode must match it in quality.

---

**You can copy everything above this line** and paste it directly into Gemini (or another model) along with references to the two strongest mockups (`09_CES_Board_Dark.jpg` and `07_EvidenceCenter_Dark.jpg`).

---

Would you like me to also create a **shorter, more aggressive version** of this brief optimized for faster Gemini generations? Or shall I continue building the remaining documentation first?


---

<a name="visual-regression-testing-strategy"></a>

## SOURCE: VISUAL_REGRESSION_TESTING_STRATEGY.md

# Visual Regression & Quality Assurance Strategy — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines how to protect the visual integrity of the v2 design system through automated and manual visual regression testing, especially during the migration and ongoing development.

---

## 2. Why This Matters

The v2 system relies heavily on subtle glass effects, elevation, typography, and spacing. Small regressions (wrong padding, broken glass layers, incorrect focus states) can quickly destroy the premium feel.

---

## 3. Recommended Testing Layers

### Layer 1: Component-Level Visual Regression (Storybook + Chromatic / Percy)
- Test all `ui/` components in all variants and states (default, hover, focus, active, disabled, loading, error).
- Test in both Dark and Light mode.
- Test at multiple breakpoints (mobile, tablet, desktop).

### Layer 2: Key Screen Snapshots (Critical Production Surfaces)
Prioritize these surfaces for full-page visual regression:
- CES Board (most used)
- eCign Signing flow (legal + high risk)
- Evidence Center
- Onboarding V2 Batch & Unit views
- Master Calendar
- Policy Detail (SharedPolicyDetailView)

### Layer 3: Cross-Browser & Device Testing
- Chrome, Edge, Safari (iOS)
- Real iPhone + Android devices for gesture and touch interactions

---

## 4. Tooling Recommendations

| Tool                  | Use Case                              | Priority |
|-----------------------|---------------------------------------|----------|
| **Chromatic** or **Percy** | Storybook component regression       | High     |
| **Playwright**        | Full page + interaction screenshots  | High     |
| **Storybook**         | Component development + docs         | High     |
| Manual QA             | Final human review before release    | Required |

---

## 5. Testing Cadence

- **On every PR** that touches `ui/` components or key production screens → Run visual regression.
- **Before merging** any design system change → Require visual approval.
- **Monthly** full regression on the top 8 production surfaces.

---

## 6. Process

1. Developer makes a change.
2. Visual regression tests run automatically.
3. Reviewer compares snapshots (new vs baseline).
4. If approved, change can be merged.
5. Baselines are updated only after human review.

---

## 7. Success Criteria

- Zero unapproved visual drift in production.
- New components are added with visual tests from day one.
- Design reviews can focus on intent instead of catching pixel bugs.

---

*Visual regression testing is one of the best investments for maintaining a premium design system at scale.*

---

**Related Documents:**
- `DESIGN_SYSTEM_GOVERNANCE.md`
- `BUILDING_V2_SCREEN_PLAYBOOK.md`
- `COMPONENT_ANATOMY_AND_CODE_EXAMPLES.md`


---

<a name="voice-brad-integration-hooks"></a>

## SOURCE: VOICE_BRAD_INTEGRATION_HOOKS.md

# Voice / Brad Integration Hooks — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines the visual and interaction hooks where **Brad** (the platform’s guidance avatar) and future voice features can be naturally integrated without breaking the calm, premium glass aesthetic.

---

## 2. Who is Brad?

Brad is the friendly, knowledgeable compliance assistant. He appears in:
- Guided tours
- Contextual help
- Proactive suggestions
- (Future) Voice interactions

The goal is to make Brad feel helpful and calm — never annoying or salesy.

---

## 3. Visual Treatment

- **Avatar**: Clean, professional illustration or simple icon (not cartoonish).
- **Placement**: Usually bottom-right or as a floating action element on Layer 2.
- **Appearance**: Subtle fade-in. Should feel like part of the glass system.
- **Color**: Uses the Care Indeed palette (Teal or Navy dominant).

---

## 4. Integration Hooks (Places to Add Brad)

| Surface                  | Recommended Hook                          | Trigger Type          | Example Use |
|--------------------------|-------------------------------------------|-----------------------|-------------|
| CES Board                | Floating “Need help?” bulb                | Contextual            | “You have 3 overdue tasks. Would you like me to show them first?” |
| eCign Signing            | Before final “Sign & Lock”                | Proactive             | “Double-check the attestation text before signing.” |
| Onboarding V2            | After completing a gate                  | Guidance              | “Great job. Next, you’ll need evidence for the medication list.” |
| Evidence Capture         | First time using the camera               | Onboarding            | “Take a clear photo of the signed form.” |
| Policy Detail            | Complex policies (many statements)        | On-demand             | “Would you like me to summarize the key requirements?” |
| Calendar                 | High number of overdue items              | Proactive             | “You have several items due today. Want me to read them out?” |
| Audit Readiness          | Low readiness score                       | Alert + Guidance      | “Here’s what’s blocking activation. I can walk you through it.” |

---

## 5. Voice Interaction Patterns (Future)

When voice is enabled, Brad should support:

- “Hey Brad, show me my overdue tasks”
- “Hey Brad, what do I need to do for this patient?”
- “Hey Brad, read the next requirement”
- “Hey Brad, mark this as complete”

**Design rules for voice UI:**
- Use a calm listening indicator (subtle pulsing teal ring).
- Keep the main glass interface visible — voice should feel like an enhancement, not a takeover.
- Always provide a visual transcript or action summary after voice commands.

---

## 6. Do’s and Don’ts

**✅ Do**
- Make Brad feel like a helpful colleague, not a tutor.
- Allow users to easily dismiss or snooze Brad suggestions.
- Use natural, conversational language.
- Respect user preference (some users may want Brad less frequently).

**❌ Don’t**
- Interrupt critical flows (e.g., during signature).
- Use overly enthusiastic or sales-like tone.
- Block the interface with Brad.
- Make voice the only way to complete important tasks.

---

## 7. Implementation Notes

- Brad should be built as a reusable component (`BradAvatar`, `BradSuggestion`, `BradTourTrigger`).
- All suggestions should be dismissible and learn from user behavior over time.
- Keep the current GuidedTour system as the foundation for future voice expansion.

---

*Brad should feel like the calm, knowledgeable person on your team who is always available when needed.*

---

**Related Documents:**
- `CONTENT_MICROCOPY_GUIDELINES.md`
- `GESTURE_INTERACTION_GUIDELINES.md`
