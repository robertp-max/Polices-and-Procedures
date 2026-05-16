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