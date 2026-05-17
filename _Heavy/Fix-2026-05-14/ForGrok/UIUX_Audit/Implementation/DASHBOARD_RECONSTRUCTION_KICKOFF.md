# Dashboard Reconstruction Kickoff Package

**Surface:** Command Center / Dashboard  
**Role:** First Reference Surface for the hardened system  
**Status:** Phase 1 active — Token contract locked (v0.2); baseline complete, ready for migration PR

---

## Purpose

The Dashboard is the primary narrative surface and the first real test of the Phase 1 governance system. Success here validates the entire reconstruction approach.

---

## Pre-Start Requirements (All Green)

- [x] All 3 major decisions recorded in Decision Log
- [x] Dashboard Reconstruction Checklist complete
- [x] Responsive Acceptance Matrix reviewed
- [x] Accessibility Gap List reviewed for Dashboard
- [x] Drift items D01, D12, D13, D21, D22 assigned to Dashboard
- [x] Token generators producing output

---

## Kickoff Structure

### Team
- **Surface Owner:** [To Be Assigned at Kickoff]
- **Design Lead:** [To Be Assigned at Kickoff]
- **Engineering Lead:** [To Be Assigned at Kickoff]
- **Drift Owner:** [To Be Assigned at Kickoff] (responsible for closing assigned drift items)

### Duration
- **Phase 1 Validation Sprint:** 2–3 weeks (prove the system)
- **Full Reconstruction:** Follows Phase 2 shell work

---

## First 30-Day Task List

### Week 1 – Setup & Baseline
1. Create feature branch: `feat/dashboard-reconstruction-v1`
2. Capture current "Before" screenshots (desktop + mobile) using `REFERENCE_CAPTURE_PROTOCOL.md`
3. Run initial raw-value audit on Dashboard files (target: document 150+ raw values)
4. Review all linked drift items (D01, D12, D13, D21, D22)

### Week 2 – Token & Primitive Migration
5. Replace first 50 raw values with tokens from `tokens.json`
6. Convert existing cards to `SurfaceCard` + `GlassPanel` where appropriate
7. Ensure 4-sided constrained frame is respected on desktop
8. Apply mobile patterns from Responsive Acceptance Matrix

### Week 3 – Validation & Regression
9. Run full visual regression baseline (Playwright)
10. Complete side-by-side comparison with approved reference captures attached to the PR
11. Pass internal design review against Constrained Page View + Responsive Matrix
12. Update Drift Register with progress on assigned items

---

## PR & Code Review Requirements

Every PR in this effort must include:
- Link to this kickoff document
- Link to `SURFACE_CHECKLISTS/Dashboard.md`
- Evidence that no new raw values were introduced
- Confirmation that the 4-sided breathing room is preserved
- Mobile behavior check against the Responsive Acceptance Matrix
- Update to the Drift Register (if related items were touched)

---

## Success Criteria for Phase 1 Validation Sprint

- Dashboard uses only canonical primitives
- Zero new raw values introduced
- Passes visual comparison against approved reference captures (desktop + mobile)
- All assigned drift items show measurable progress
- Internal design + engineering sign-off obtained

---

## Next Actions

1. Assign Surface Owner + Engineering Lead
2. Schedule Kickoff Meeting (use this document as agenda)
3. Create feature branch and baseline screenshots
4. Begin Week 1 tasks

---

**This is the official starting point for Dashboard reconstruction.**  
Supporting execution artifacts for this surface live in the `Implementation/` folder and linked checklist/matrix files.