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