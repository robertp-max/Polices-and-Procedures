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