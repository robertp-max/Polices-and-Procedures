# PM-Notifications-and-Reminders

**Phase:** Architecture only.
**Cross-refs:** `PM-Data-Model.md`, `PM-Task-System.md`, `PM-Sprint-Board-Design.md`.

---

## 1. Purpose

Define a notification/reminder subsystem that surfaces compliance-relevant events to assignees, watchers, and managers — without competing with CES audit events and without spamming users.

---

## 2. Notification Kinds

| Kind | Trigger | Default audience |
|---|---|---|
| `assigned` | Assignee added to a task | New assignee |
| `unassigned` | Assignee removed | Removed assignee |
| `mention` | `@user` in description/comment | Mentioned user |
| `due_soon` | T-72h, T-24h, T-2h before due | Assignees + watchers |
| `overdue` | Past due, status ≠ done | Assignees + watchers + manager |
| `blocked` | CES raises blocker | Assignees + watchers |
| `unblocked` | CES blocker cleared | Assignees |
| `approval_required` | Form awaiting approval (CES-driven) | Approver(s) |
| `evidence_added` | Evidence attached in CES | Watchers + assignees |
| `sprint_starting` | Day 0 of a sprint with assigned tasks | Assignees |
| `sprint_ending` | Day 13 EOD with open tasks | Assignees + manager |
| `weekend_scheduled` | Compliance task scheduled on Sat/Sun (override fired) | Assignees + manager |

---

## 3. Delivery Channels

- In-app notification center (always on).
- Email digest (configurable cadence: instant, hourly, daily).
- Optional future channels: SMS, MS Teams, calendar invite — out of scope this phase, but interfaces should be channel-agnostic.

---

## 4. Scheduler Architecture

```
CES events ──┐
PM overlay ──┼──► NotificationDecider ──► pm_notification rows
Time tick  ──┘                              │
                                            ▼
                                     ChannelDispatcher
                                     ├─ in-app stream
                                     └─ email digest job
```

- **NotificationDecider** is a pure function: `(event, taskState, userPrefs) → Notification[]`.
- Time-based reminders (`due_soon`, `overdue`, `sprint_starting`) come from a periodic ticker (e.g. every 15 min) that scans tasks needing reminders.
- Idempotency: each `(user, task, kind, window)` produces at most one row per window.

---

## 5. User Preferences

```ts
interface PmNotificationPrefs {
  user_id: string;
  channels: { in_app: boolean; email: 'instant'|'hourly'|'daily'|'off' };
  quiet_hours: { start: string; end: string; tz: string };
  mute: { task_ids?: string[]; kinds?: NotificationKind[] };
  digest_includes_personal: boolean;
}
```

Defaults: in-app on, email daily digest at 07:00 user-local, quiet hours 20:00–07:00.

---

## 6. Data Flow

1. CES emits an event (e.g. blocker raised on step).
2. NotificationDecider consults the merged Task + audience rules → produces 0..N `pm_notification` rows.
3. Dispatcher pushes in-app immediately, queues for email digest if not instant.
4. UI notification center subscribes to user's notification stream.
5. Read state is per-notification; "Mark all read" supported.

---

## 7. Backend Contract Impact

- New tables: `pm_notification`, `pm_notification_prefs`.
- New endpoints: `GET /pm/notifications`, `POST /pm/notifications/:id/read`, `PUT /pm/notifications/prefs`.
- Periodic job for time-based reminders (cron-style or scheduler job).
- No CES changes — NotificationDecider subscribes to CES change stream.

---

## 8. UI Behavior

- Notification center bell with unread count.
- Grouping by task (collapse multiple kinds into one card).
- Click → opens Task Drawer scrolled to relevant section (CES blocker, eSign, evidence).
- "Snooze" option per notification (1h, 1d, until next sprint).
- Toasts only for high-urgency kinds (`assigned`, `mention`, `overdue`, `approval_required`); others silent in-app.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Notification storm on bulk reassignment | Coalesce per `(user, task, window)`; bulk-action notification single-card |
| Duplicate of CES audit | PM notifications target users; CES audit targets compliance trail — separate concerns, both retained |
| Email fatigue | Daily digest default; explicit instant opt-in only for high-urgency kinds |
| Time zone errors in reminders | Store all schedules in UTC; render in user TZ; quiet-hours in user TZ |
| Privacy (assignee disclosure) | Notification audience computed via permission filter |

---

## 10. Acceptance Criteria

- Each notification kind has explicit trigger + audience + default channel.
- Idempotency rule documented and enforceable.
- Quiet hours and digest cadence honored.
- Snooze + mute supported.
- No notifications fire from PM overlay actions that mirror CES (avoid double-notify with CES native notifications, if any).

---

## 11. Verification Checklist

- [ ] Notification kinds enumerated and matched to triggers.
- [ ] Idempotency window defined per kind.
- [ ] Preferences schema reviewed.
- [ ] Email digest format prototyped on paper.
- [ ] Permission filter applied before notification creation.
- [ ] No collision with existing CES alerting.
