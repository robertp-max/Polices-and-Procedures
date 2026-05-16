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