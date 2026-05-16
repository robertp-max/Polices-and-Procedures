# Stabilization Action Items — Converted from 16-Agent Convergence Review

**Source:** UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md (16-agent convergence review)  
**Date:** May 2026  
**Purpose:** Convert high-level review findings into clear, actionable, trackable implementation items for the Stabilization phase.

**Note:** These items are derived directly from the independent agent feedback. Each item includes priority, recommended timing, ownership, validation needs, and rollback implications.

---

## 1. Navigation & History Stabilization (Highest Immediate Risk)

| ID | Actionable Item | Priority | Recommended Wave | Primary Owner | Validation Requirements | Rollback Implication | Complexity |
|----|------------------|----------|------------------|---------------|--------------------------|----------------------|------------|
| N-01 | Remove global swipe navigation (touch) from CommandCenterLayout.tsx | P0 | Wave 0 | Frontend Engineering | Browser back/forward works on 8+ key flows after removal | Medium | Medium |
| N-02 | Remove global left/right arrow key navigation from CommandCenterLayout.tsx | P0 | Wave 0 | Frontend Engineering | Keyboard navigation no longer hijacks app history | Low | Low |
| N-03 | Audit and reduce aggressive `replace: true` usage on normal navigation routes | P0 | Wave 0 | Frontend Engineering | Browser history behaves predictably on CES, Evidence, eCign, Onboarding V2 | Medium | Medium |
| N-04 | Validate browser Back/Forward behavior on main operational flows | P0 | Wave 0 | QA + Frontend | Documented test cases pass on Chrome, Edge, Safari | Medium | Medium |

---

## 2. Runtime Survivability Hardening

| ID | Actionable Item | Priority | Recommended Wave | Primary Owner | Validation Requirements | Rollback Implication | Complexity |
|----|------------------|----------|------------------|---------------|--------------------------|----------------------|------------|
| R-01 | Implement form draft persistence + auto-rehydration on refresh | P0 | Wave 0 | Frontend | Refresh at 30/60/90% on major forms restores state | Low | Medium |
| R-02 | Implement session interruption recovery (visibility change + background/foreground) | P0 | Wave 0 | Frontend | App background/return preserves in-progress work on key forms | Low | Medium |
| R-03 | Add basic state staleness detection on CES and Evidence fetches | P1 | Wave 1 | Frontend | Detect when data is outdated and show warning or refresh | Low | Medium |
| R-04 | Ensure modal/drawer escape behavior preserves context and allows clean re-entry | P1 | Wave 1 | Frontend | Escape key + browser back tested on multiple modal flows | Medium | Low |

---

## 3. Mobile Operational Survivability

| ID | Actionable Item | Priority | Recommended Wave | Primary Owner | Validation Requirements | Rollback Implication | Complexity |
|----|------------------|----------|------------------|---------------|--------------------------|----------------------|------------|
| M-01 | Execute dedicated mobile UAT on real devices (iOS + Android) under normal + throttled network | P0 | Wave 0 | QA | Evidence capture, eCign signing, CES task completion tested on real devices | Low | Medium |
| M-02 | Validate one-handed usability and touch target sizes (≥48px) on core mobile flows | P0 | Wave 0 | QA + Design | Single-hand completion of top 3 mobile workflows | Low | Low |
| M-03 | Test evidence upload and eCign signing under weak/intermittent signal | P0 | Wave 0 | QA | Offline queue + recovery tested for Evidence | Medium | Medium |
| M-04 | Test app behavior during interruptions (calls, backgrounding, low battery) | P1 | Wave 1 | QA | Drafts and progress preserved after interruption | Low | Medium |

---

## 4. eCign + Evidence Center Protection Layer

| ID | Actionable Item | Priority | Recommended Wave | Primary Owner | Validation Requirements | Rollback Implication | Complexity |
|----|------------------|----------|------------------|---------------|--------------------------|----------------------|------------|
| E-01 | Designate eCign signing flow as Protected Subsystem | P0 | Wave 0 | Architecture + Compliance | Any change to signing flow requires explicit approval | High | Low |
| E-02 | Designate Evidence Center (capture + retrieval) as Protected Subsystem | P0 | Wave 0 | Architecture + Compliance | Audit retrieval tests included in validation | High | Low |
| E-03 | Add mandatory post-sign and post-upload integrity verification | P0 | Wave 0 | Engineering | Automated or manual checks for signed packets and evidence artifacts | High | Medium |
| E-04 | Create rollback trigger specifically for eCign or Evidence integrity failure | P0 | Wave 0 | DevOps + Compliance | Clear criteria and process defined | High | Low |

---

## 5. Design System Enforcement

| ID | Actionable Item | Priority | Recommended Wave | Primary Owner | Validation Requirements | Rollback Implication | Complexity |
|----|------------------|----------|------------------|---------------|--------------------------|----------------------|------------|
| D-01 | Implement ESLint rules blocking raw hex/rgb values and non-`--ci-*` tokens | P0 | Wave 0 | Engineering | New code fails lint if raw values are used | Low | Low |
| D-02 | Add visual regression requirement to PR checklist for `ui/` components | P0 | Wave 0 | Engineering + QA | PRs touching design system components must include visual checks | Low | Low |
| D-03 | Enforce glass-layer discipline in code reviews (max 2 layers) | P1 | Wave 1 | Design Systems | Code review checklist updated | Low | Low |
| D-04 | Normalize component usage (deprecate local Card/Tab/Button patterns) | P1 | Wave 1 | Design Systems + Engineering | Audit of remaining parallel patterns | Medium | Medium |

---

## 6. Rollback + Blast Radius Governance

| ID | Actionable Item | Priority | Recommended Wave | Primary Owner | Validation Requirements | Rollback Implication | Complexity |
|----|------------------|----------|------------------|---------------|--------------------------|----------------------|------------|
| RB-01 | Define Rollback Trigger Matrix with clear conditions | P0 | Wave 0 | DevOps + Architecture | Matrix documented and approved | High | Low |
| RB-02 | Assign rollback owners for each major subsystem | P0 | Wave 0 | Engineering Leads | Owners listed and contacted | High | Low |
| RB-03 | Create and test rollback execution checklist | P0 | Wave 0 | DevOps | At least one successful rollback drill completed | High | Medium |
| RB-04 | Define subsystem isolation boundaries for safe partial rollback | P0 | Wave 0 | Architecture | Clear boundaries documented | High | Medium |

---

## 7. Go/No-Go Governance

| ID | Actionable Item | Priority | Recommended Wave | Primary Owner | Validation Requirements | Rollback Implication | Complexity |
|----|------------------|----------|------------------|---------------|--------------------------|----------------------|------------|
| GG-01 | Define P0 runtime gates before wider UAT exposure | P0 | Wave 0 | QA + Engineering | Gates documented and passable | High | Low |
| GG-02 | Define P0 mobile survivability gates | P0 | Wave 0 | QA | Mobile-specific gates created | Medium | Low |
| GG-03 | Define P0 eCign and Evidence integrity gates | P0 | Wave 0 | Compliance + Engineering | Integrity checks pass | High | Low |
| GG-04 | Create deployment hold conditions if any P0 gate fails | P0 | Wave 0 | All Leads | Process documented | High | Low |

---

## 8. Ownership & Validation Requirements

Every actionable item above must include:

- **Owner Category** (Engineering, Design Systems, QA, DevOps, Compliance, Architecture)
- **Validation Requirement** (specific test or check)
- **Rollback Implication** if the item fails validation

All items in this document already follow this structure.

---

## Prioritized Summary for Next Week (UAT Focus)

**Must Complete Before Training (P0):**
- N-01, N-02, N-03, N-04 (Navigation)
- R-01, R-02 (Runtime persistence)
- M-01, M-02, M-03 (Mobile basics)
- E-01, E-02, E-03 (Protected systems)
- RB-01, RB-02, RB-03 (Rollback)
- GG-01, GG-02, GG-03, GG-04 (Go/No-Go)

**Can Be Completed During or After First UAT Wave (P1):**
- D-01 to D-04
- R-03, R-04
- M-04
- Multi-tab and deep-link improvements

---

**Next Step Recommendation:**

Use this document as the source of truth for assigning work to the 32 agents (16 Grok + 16 Claude).

Would you like me to now create a **7-Day Execution Plan** that assigns these items to specific agents with daily targets and validation checkpoints?