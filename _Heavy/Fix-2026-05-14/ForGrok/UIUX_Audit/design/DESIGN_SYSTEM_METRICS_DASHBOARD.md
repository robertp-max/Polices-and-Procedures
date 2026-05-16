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