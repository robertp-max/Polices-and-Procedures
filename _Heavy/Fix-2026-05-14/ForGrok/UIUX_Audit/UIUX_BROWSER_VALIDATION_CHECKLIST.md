# UI/UX Browser Validation Checklist
**Date**: 2026-05-15  
**Purpose**: Manual + automated (Playwright where possible) validation pass for the redesign project. Use before/after each phase. Capture screenshots in _Heavy/Fix-2026-05-14/ForGrok/Screenshots/ (new dated folder).

---

## Routes to Open (Desktop + Mobile Emulation + Real Devices)

**Core Command Center**:
- /dashboard (widgets, hover, empty states)
- /library (grid/list, search, filter, policy cards)
- /library/GV-GB-001 (overview + non-overview sticky header, sub-tabs, procedures, appendices, print)
- /library/QA-PG-001 or similar general policy (compare to GVGB)
- /policy-lifecycle (drafts/review/publish)
- /forms (grid)
- /forms/:formId (WAPI or similar — full signing flow, all states, signed_locked Options, Download/Print)
- /evidence (hierarchy, artifact links)
- /artifacts/:artifactId (signed packet preview)
- /ces/dashboard + /ces/board (board, task detail, role switcher)
- /my-tasks + /pm/my-tasks + /pm/sprint-plan + /pm/approvals (PM overlays)
- /calendar (month, sprint toggle, event drill-down to MobileIncidentExecutionPage stages)
- /onboarding-v2/dashboard + /onboarding-v2/activate + /onboarding-v2/batches/:id (reconciliation preview, gates, UnitDrawer tabs, AuditTimeline)
- /journey (home, PhaseRail, module cards)
- /journey/module/:moduleId (player + evidence/signing)
- /journey/staging/m01 (carousel states, pre-assess, final, certificate — desktop + mobile critical)
- /help/* (HelpCenter + contextual bulb)
- /iadministrator (Brad UI, tour trigger)
- /admin/user-groups + /admin/roles + /admin/permissions (admin identity)

**Standalone Prints** (open in new tab/window, trigger print preview):
- /print/GV-GB-001
- /print/:policyId (general)
- /print/GV-GB-001/appendix/:id
- /forms/:formId/print
- Signed packet from FormSigningWorkspace Options (Download/Print) — compare visual to on-screen + ArtifactViewer

**Auth**:
- /login, /register, /forgot-password, /setup-account (flows)

**Mobile Emulation + Real Devices** (iPhone SE, iPhone 14/15, Android small phone, iPad, Android tablet):
- All above + specifically: signing flow, CES board, V2 BatchView + UnitDrawer, StagingM01, evidence hierarchy, calendar drill-down, form tables, policy detail long content.

---

## Desktop Checks (Chrome, Firefox, Edge, Safari latest)

- [ ] No horizontal scroll/overflow (max-width:100vw guard + no rogue fixed-width).
- [ ] Visual consistency (tokens, primitives, no drift between GVGB vs general policy vs shell vs CES vs Journey vs V2).
- [ ] Hover states, focus rings (gold/orange), active states.
- [ ] Typography (Outfit/Montserrat/Roboto + tracking) consistent; no overflow.
- [ ] Cards, tabs, tables, buttons, badges, status render correctly (no overlapping, proper spacing).
- [ ] Glass/ one-glass (dark CI-ION) vs light Care Indeed (solid paper) both clean.
- [ ] Loading/empty/error states visible and styled.
- [ ] Feature flags / permission gates hide/show correctly.
- [ ] Print preview (Cmd/Ctrl+P): Layout, page breaks, headers, footers, no shadows, color exact, logo inlining.
- [ ] Signed packet PDF (from Options or ArtifactViewer): Form content + cert + audit + roster + eCign footer; compare fidelity across entry paths.
- [ ] No console errors/warnings related to UI.

---

## Mobile Checks (Emulation + Real Devices)

- [ ] No horizontal scroll/overflow on phone (iPhone SE critical).
- [ ] Touch targets ≥44px (icon-only, buttons, inputs, signature pad, carousel nav, table rows, evidence hierarchy items).
- [ ] Forms/:id signing flow usable (inputs, signature pad, multi-signer, Options cards).
- [ ] CES board/kanban usable (tap, detail, no broken drag).
- [ ] Onboarding V2 BatchView + UnitDrawer (progressive disclosure, bottom sheet or stack on phone).
- [ ] StagingM01 carousel (touch swipe or simplified; no broken absolute positioning).
- [ ] Evidence hierarchy + ArtifactViewer preview (zoom/scroll, tap targets).
- [ ] Calendar + MobileIncident drill-down (forms inside usable on phone).
- [ ] Journey module player + evidence capture (rating + dual sig on phone).
- [ ] Library + policy detail long content (reflow, no overflow).
- [ ] Nav (hamburger + primary tabs + "more") functional.
- [ ] Safe-area insets (notched devices).
- [ ] Orientation: Portrait + landscape both usable.
- [ ] Performance (no jank on lower-end phones for carousels, boards, V2 views).

---

## Keyboard Checks (Tab, Shift+Tab, Enter, Space, Esc, Arrows)

- [ ] Full keyboard navigation through nav, dashboard widgets, library grid, policy detail tabs, forms inputs, signing flow, CES board (or alternative), evidence hierarchy, V2 gates/UnitDrawer, Journey cards, admin tables.
- [ ] Focus visible (gold/orange rings) on all interactive.
- [ ] Tab order logical (no trapped focus outside modals/drawers).
- [ ] Modals/Drawers (RightDrawer, FormSigningWorkspace, UnitDrawer, PM overlays): Focus trap + Esc closes + return focus.
- [ ] Tabs (ui/Tabs + all consumers): Arrow keys roving tabIndex, aria-selected, focus management.
- [ ] Signature pad / canvas in signing + supervisor: Keyboard alternative or clear labeling.
- [ ] Carousels (StagingM01, any policy): Keyboard accessible (or documented limitation).
- [ ] No keyboard traps.

---

## Print / Export Checks

- [ ] All print routes (/print/*, /forms/:id/print) produce clean Letter PDF with correct headers, page breaks, no shadows, color exact, logos.
- [ ] Signed packet from eCign Options (Download/Print) or ArtifactViewer: Form + cert + audit trail + roster + eCign footer visible and legible. Compare visual to on-screen FormViewer + GVGB print.
- [ ] GV-GB-001 print vs QA-PG-001 print vs form print vs signed WAPI packet — side-by-side fidelity (logo, title, metadata, sections).
- [ ] Appendix prints.
- [ ] No cut-off text, overlapping, or missing legal content in packets.

---

## Accessibility Checks (axe DevTools, WAVE, Manual)

- [ ] axe/WAVE on all priority routes (dashboard, library/:id, forms/:id, ces/board, onboarding-v2/batch, journey/module, evidence, calendar, signing).
- [ ] Color contrast (light + dark + mixed themes; small text, badges, links).
- [ ] ARIA (roles, labels, describedby, live regions for status/signing/gate changes, tree for evidence hierarchy).
- [ ] Icon-only buttons have aria-label or visible text.
- [ ] Form labels (especially dynamic/conditional in FormViewer/FormSigningWorkspace).
- [ ] Error messaging (role=alert).
- [ ] Focus management (traps, return focus, visible rings).
- [ ] Reduced-motion respected.
- [ ] Screen reader (VoiceOver + TalkBack) on signing flow, CES board, evidence, V2 activation, policy detail.
- [ ] Keyboard + SR combined testing on high-risk surfaces (FormViewer/FormSigningWorkspace, CES, evidence).

---

## Pass / Fail Template (per route or flow)

**Route/Flow**: ___________________________  
**Date/Tester**: ___________________________  
**Device/Browser**: ___________________________  

**Desktop Visual**: Pass / Fail (notes)  
**Mobile Visual + Touch**: Pass / Fail (notes)  
**Keyboard**: Pass / Fail (notes)  
**Print/Packet**: Pass / Fail (notes)  
**Accessibility (axe + manual)**: Pass / Fail (notes)  
**Performance**: Pass / Fail (notes)  

**Screenshots captured**: Yes/No (paths)  
**Bugs logged**: (links or IDs)  
**Overall**: Pass / Fail / Block  

**Sign-off**: ___________________________ Date: ___________

---

## Execution Recommendations

- Run full checklist before Phase 0 freeze, after Phase 1 (tokens), after Phase 3 (print/eCign), after Phase 4 (mobile), after Phase 5 (a11y).
- Capture new dated screenshot set in ForGrok/Screenshots/ for all priority flows (side-by-side GVGB vs general policy, signed packet vs on-screen, mobile states).
- Use Playwright for automated regression (visual, a11y axe, print PDF comparison where possible).
- Real device lab for mobile signing, CES, V2, Journey on phones.
- Track all Fail/Block to closure in a tracking sheet linked from this checklist.

**Success**: All priority routes Pass on desktop + mobile + keyboard + print + a11y (documented). No new drift introduced. Baseline for future audits.