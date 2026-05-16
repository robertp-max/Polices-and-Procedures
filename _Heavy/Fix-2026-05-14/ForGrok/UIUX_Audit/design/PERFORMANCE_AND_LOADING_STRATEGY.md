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