# Stabilization Plan & Action Items

**Project:** Care Indeed Home Health — Unified MVP QA + UI/UX Implementation  
**Phase:** Pre-Rollout Stabilization (UAT Readiness)  
**Target Date:** Before Training Week (Next Week)  
**Success Target:** 90% (as accepted by stakeholder)  
**Document Owner:** Primary Orchestration Lead  
**Last Updated:** May 2026

---

## 1. Context & Objectives

### Background
The unified implementation plan combines:
- Original MVP QA and rollout work
- Full v2 Design System rollout (Care Indeed branding, glass system, component unification, mobile-first patterns)
- Hardening requirements identified during multi-agent reviews

During the 16-agent convergence review, one of the most critical findings was:

> “Several workflows still assume ideal conditions.”

This finding highlighted that many parts of the current and planned system do not sufficiently account for real-world usage (interruptions, weak networks, browser refreshes, multi-tab usage, mobile field conditions, etc.).

### Goal of This Phase
Deliver a **Stabilization Sprint** that prepares the application for internal UAT with ~100 users (mostly office staff + training participants) next week.

**Key Constraints:**
- The app **cannot look or behave like the current version** by Monday.
- This is an **MVP Demo / Internal UAT**, not full production.
- 100+ users = self-service access + training (not 100 simultaneous heavy production users).
- Full 3-week stabilization is not possible. We must compress critical items.

**Accepted Trade-offs (90% Target):**
- Some rough edges and unfinished hardening are acceptable.
- Not all mobile field scenarios will be perfect.
- Some post-UAT hardening will be required after the first training wave.

---

## 2. Scope of Stabilization

### In Scope for This Phase (Must Be Addressed Before Training)
- Navigation & browser history reliability
- Runtime survivability (refresh, interruption, session recovery)
- Removal of global swipe + left/right arrow key navigation
- Basic mobile usability on core flows
- Protection of critical subsystems (eCign, Evidence, CES identity)
- Basic design system enforcement mechanisms
- Rollback capability definition and basic testing
- Go/No-Go criteria for UAT exposure

### Out of Scope for This Phase (Deferred Post-UAT)
- Full multi-tab conflict resolution system
- Comprehensive long-idle session handling
- Advanced state desynchronization detection
- Complete mobile field UAT under all conditions
- Heavy design system linting and visual regression in CI
- Full accessibility audit with real users

---

## 3. Actionable Items Converted from 16-Agent Review

The following items were derived from the independent 16-agent convergence review. Each has been converted into implementation-grade tasks.

### 3.1 Navigation & History (P0 – Highest Immediate Risk)

- **Remove global swipe navigation** (touch events) from `CommandCenterLayout.tsx`
- **Remove global left/right arrow key navigation** from `CommandCenterLayout.tsx`
- Audit and reduce aggressive use of `replace: true` on normal navigation routes
- Validate that browser Back/Forward works predictably on key flows (CES, Evidence, eCign, Onboarding V2, Calendar)

**Owner:** Frontend Engineering  
**Validation:** Browser navigation testing across main surfaces  
**UAT Priority:** P0

### 3.2 Runtime Survivability (P0)

- Implement form draft persistence with automatic rehydration on refresh
- Implement interruption recovery (app backgrounding, tab switching, visibility change events)
- Add basic state staleness detection on CES and Evidence data fetches
- Standardize modal and drawer escape/re-entry behavior

**Owner:** Frontend Engineering  
**Validation:** Refresh + interruption tests on major forms  
**UAT Priority:** P0

### 3.3 Mobile Operational Survivability (P0)

- Execute dedicated mobile UAT on real iOS and Android devices
- Test core flows (Evidence capture, eCign signing, CES task completion) under throttled/weak network conditions
- Validate one-handed usability and touch target compliance (≥48px)
- Test behavior during interruptions (calls, backgrounding)

**Owner:** QA + Mobile Engineering  
**Validation:** Real-device testing with network simulation  
**UAT Priority:** P0

### 3.4 eCign + Evidence Protection Layer (P0)

- Formally designate eCign signing flow as a Protected Subsystem
- Formally designate Evidence Center (capture + retrieval) as a Protected Subsystem
- Add mandatory integrity verification after signing and evidence upload
- Define specific rollback triggers if eCign or Evidence integrity is compromised

**Owner:** Architecture + Compliance + Engineering  
**Validation:** Integrity checks pass in testing  
**UAT Priority:** P0

### 3.5 Design System Enforcement (P0 / P1)

- Implement ESLint rules to block raw hex/rgb values and non-`--ci-*` tokens in new code
- Add visual regression requirement to PR checklist for any `ui/` component changes
- Begin normalizing component usage (deprecate local Card/Tab patterns)

**Owner:** Engineering + Design Systems  
**Validation:** Lint rules active in CI; PR checklist updated  
**UAT Priority:** P0 for basic linting, P1 for full normalization

### 3.6 Rollback & Blast Radius Governance (P0)

- Create and document Rollback Trigger Matrix
- Assign rollback owners for each major subsystem
- Conduct at least one rollback drill on a non-critical surface
- Define clear subsystem isolation boundaries

**Owner:** DevOps + Architecture + Engineering Leads  
**Validation:** Successful rollback drill + documented process  
**UAT Priority:** P0

### 3.7 Go/No-Go Governance (P0)

- Define explicit P0 runtime gates before wider UAT exposure
- Define P0 mobile survivability gates
- Define P0 eCign and Evidence integrity gates
- Establish deployment hold conditions if any P0 gate fails

**Owner:** QA + Engineering + Compliance + Design Systems  
**Validation:** Gates documented and passable  
**UAT Priority:** P0

---

## 4. Implementation Approach with 32 Agents

We have access to **32 agents** (16 Grok 4.3 + 16 Claude Sonnet 4.6).

Recommended split for the Stabilization phase:

- **Navigation & History Cleanup** → 4–6 agents (Frontend focus)
- **Runtime Persistence & Recovery** → 6–8 agents (Forms + State management)
- **Mobile UAT Execution** → 6–8 agents (QA + Mobile specialists)
- **Protected Systems + Rollback** → 4–6 agents (Architecture + DevOps)
- **Design System Enforcement** → 4 agents (Engineering + Design Systems)
- **Go/No-Go Criteria & Documentation** → 2–4 agents (Coordination)

---

## 5. Recommended Sequence (Compressed for Next Week)

**Wave 0 – Immediate Stabilization (This Week)**

1. Remove global swipe and keyboard navigation handlers
2. Implement core form + evidence + eCign draft persistence and recovery
3. Clean aggressive `replace: true` usage
4. Run initial mobile smoke tests on core flows
5. Define and document Protected Subsystems + Rollback Matrix
6. Establish Go/No-Go gates

**Post-Wave 0 (After First Training Feedback)**  
Address remaining P1 items (multi-tab handling, deeper mobile scenarios, full design system linting, etc.).

---

## 6. Validation & Success Criteria (90% Target)

By the start of training next week, the following must be true:

- App visibly uses the new v2 Care Indeed design system on main surfaces
- Global swipe and arrow key navigation has been removed
- Browser back/forward works reasonably well on core flows
- Evidence upload and eCign signing have basic interruption + refresh recovery
- Protected systems have clear change controls
- Rollback process is documented and at least one drill has been performed
- Go/No-Go criteria are defined and measurable

---

**Document Status:** Living document. Will be updated as tasks are completed and new risks are identified during implementation.

---

*This document converts the 16-agent review feedback into a trackable, implementation-focused backlog for the Stabilization phase.*