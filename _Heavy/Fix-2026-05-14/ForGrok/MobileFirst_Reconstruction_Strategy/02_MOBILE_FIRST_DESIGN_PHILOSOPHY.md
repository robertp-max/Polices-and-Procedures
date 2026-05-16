# Section 2 — MOBILE-FIRST DESIGN PHILOSOPHY
**Date**: 2026-05-15  
**Part of**: Mobile-First Reconstruction Strategy (follows 00_PRODUCTION_SURFACE_FILTER.md)  
**Status**: Foundational. All subsequent IA, component, navigation, and workflow work must derive from these principles. No desktop-first assumptions allowed on canonical operational surfaces.

---

## Purpose of This Philosophy

This document defines the irreversible shift from the current desktop-biased, mouse-precise, multi-modal browsing application to a **task-first, one-handed, interruption-resilient mobile operating system for home health compliance execution**.

The personas that matter (per 00_): Field Clinician (RN/LVN/HHA), DON/Clinical Manager, Surveyor/ACHC Auditor, Compliance Officer, Training Coordinator. Every pixel, tap target, navigation depth, and state decision is judged against these users performing real regulatory work in real environments: patient homes, facility hallways, cars between visits, weak rural cell signal, family interruptions, and 15-20 minute visit slots.

Current state is a failure for these users. The app was built as if clinicians sit at desks with mice and stable Wi-Fi. They do not.

---

## 1. Mobile-First Operational Principles

**Core Mandate**: Design for the worst realistic field condition first, then enhance for tablet/DON desk use. Never the reverse.

Specific operational realities that must drive every decision:

- **One-handed use during home visits**: Clinician holds phone in right hand (dominant), patient chart or supply bag in left, standing in living room, kitchen, or bathroom. Primary actions (next task, capture evidence, sign, submit) must be reachable with right thumb without shifting grip or using second hand. Secondary actions (view full policy, history) can require grip shift or two hands.
- **Interruption recovery when called to patient**: A family member interrupts, patient codes or falls, phone rings from agency, or DON calls with urgent exception. The clinician must be able to background the app, handle the emergency (potentially 30 seconds to 15 minutes), return, and resume *exactly* where they were — form field values, partial signature stroke, current tab in UnitDrawer, evidence upload in progress — with zero data loss and zero re-navigation.
- **Weak signal / offline tolerance**: Rural patient homes, basements, elevators, or during network outages (documented in Journey lessons as 18-hour EHR downtime scenarios). Core flows (view assigned task, capture timestamped photo evidence, record finding, queue signature) must succeed locally and sync when signal returns. Current reality: eCign signing, evidence capture to AWS staging, and CES state transitions all require live backend calls with no graceful degradation or local queue.
- **Fast cognitive load under time pressure**: 2pm Tuesday, 4th visit of the day, 102°F in the home, patient in pain, surveyor due tomorrow, DON texting about missing signature on last chart. The UI must answer "What must I do in the next 30 seconds?" instantly. No scanning dashboards, no parsing 12-column tables, no deciphering ambiguous status pills.

**Brutal current failures**:
- The entire CES board, policy detail carousels, and FormViewer rely on stable connectivity and precise interaction.
- No service worker, no IndexedDB task/evidence queue, no `navigator.onLine` + visibilitychange aggressive persistence visible in the core operational paths (FormSigningWorkspace, CesBoard, EvidencePanel, regulatoryExecutionStore).
- EvidencePanel.tsx (onboarding-v2) and CesEvidenceHierarchyPanel use manual filename text inputs + Upload buttons instead of native `<input type="file" capture="environment" accept="image/*">` one-tap camera flows.

---

## 2. Task-First Interaction Strategy

**Rule**: Every screen that a field user lands on must answer "What do I do next?" within **two taps maximum**, with zero dashboard browsing required for 80% of daily work.

- No "command center" landing pages full of cards the user must scan to find their active task.
- The primary surface for clinicians is the task itself (from Calendar event, MyTasks list, or CES execution unit). Tapping a task card must open the *execution context* (evidence capture + signing + submit) in one additional tap.
- "Browse policy library" or "open CES board to hunt for my items" are DON/compliance officer secondary flows only. Field clinicians should never need them during a visit.

**Current failures**:
- MyTasks/PM views and CesBoard require scanning swimlanes or lists, then drilling multiple levels into WorkflowDrawer + SprintTaskPanel + evidence + form.
- OnboardingV2 BatchView uses 9/3 grids and UnitDrawer tabs that force exploration instead of surfacing the single next gate action.
- Dashboard and Calendar still present dense overviews rather than "Your next 3 patient visits — tap to execute."

The philosophy demands that the mobile shell surface the user's *personal task queue* as the root view (filtered by role), with direct "Execute" primary action.

---

## 3. Progressive Disclosure Model

**Rule**: Surface only the next required regulatory action. Hide all complexity until the user explicitly needs it or the role demands it.

- **Clinician (field)**: Sees task title, due time, 1-2 required evidence types, large "Capture Photo" or "Record Note" thumb target, "Sign Form" target, "Submit & Mark Complete". Policy text and full evidence history collapsed behind "View Reference" (one tap, read-only, auto-closes on action).
- **DON / Manager**: Sees the above plus exception queue ("3 signatures awaiting your review"), bulk approve, audit readiness score, staffing coverage alerts — still on one primary screen.
- **Surveyor / Auditor (on-site)**: Policy detail opens directly to the relevant section + linked evidence status. "Log ACHC Finding" or "Mark Compliant" is the primary action. Full history, cross-references, and report generation are secondary (progressively revealed after logging).
- **Compliance Officer**: CES board or AuditMode surfaces exception list + one-tap assignment + full trail visibility.

Different depths by persona, enforced by role-based UI rendering (not feature flags that everyone sees).

**Current failures**:
- UnitDrawer.tsx exposes 4 tabs (overview/evidence/signatures/audit) immediately with small text-[12px] labels and no role filtering — surveyor and clinician see the same complex nested interface.
- FormSigningWorkspace renders all 6 UI_STEPS pills on mobile (horizontal scroll) plus full legal text, identity fields, and canvas regardless of role or urgency.
- Evidence hierarchy and policy appendices use deep nesting and wide tables visible to everyone.

Progressive disclosure must be *structural*, not just "hide on small screen."

---

## 4. Navigation Philosophy

**Rule**: Bottom navigation (or gesture-driven primary actions) is the only acceptable primary pattern on phone. Never more than 2-3 levels deep for 80% of daily work. "Back" must always be safe and state-preserving.

- Primary bottom nav (5-6 slots max): Tasks (personal queue), Calendar (today's visits), Evidence (quick capture), Library (reference), More (role-specific: DON sign-offs, Surveyor findings, Help).
- All execution (signing, evidence, task detail) occurs in full-screen or bottom-sheet overlays that preserve the parent context.
- Drill depth cap: Task → Evidence Capture → Sign → Submit (3 taps from list). Policy reference from task opens in a dismissible panel, not a new route that breaks the backstack.
- Safe back: Every drawer, sheet, and form must serialize its complete state (including partial canvas strokes, form field values, current tab) on `visibilitychange`, `pagehide`, and beforeunload. Returning via browser back or app resume must restore pixel-perfect prior state.
- No deep hamburger sub-menus for core work. "More" is a bottom sheet, not a 5-level tree.

**Current failures** (CommandCenterLayout.tsx:143-149):
- MOBILE_PRIMARY_TABS exist (Dashboard/Calendar/Tasks/Workflows/More) but "More" routes to Help, and full operational surfaces (CES board, OnboardingV2 batches, evidence hierarchy, policy detail with multiple renderers) live behind the hamburger or side nav that requires 3+ taps and loses context.
- UnitDrawer is a fixed inset-0 overlay with internal 4-tab state that resets on close/reopen in many paths.
- Calendar drill-down (event → workflow → task → evidence → form) routinely exceeds 3 levels with no gesture "swipe to complete" or bottom-sheet task executor.
- No consistent bottom nav + gesture navigation; many surfaces still use desktop-style sidebar + multi-level breadcrumbs.

"Back" in current FormSigningWorkspace and drawer flows frequently drops the clinician back to a high-level list instead of the exact prior partial form state.

---

## 5. Touch Ergonomics

**Strict non-negotiable rules** (enforced in tokens and lint):

- Minimum 48×48 px touch targets (larger than the 44px iOS guideline because field users wear gloves, work one-handed, and have fatigued thumbs after 8 visits).
- Right-hand dominant thumb zone mapping: Primary CTAs (Sign, Submit, Capture, Next Patient) must live in the bottom-right 35% of the screen (reachable without grip shift). Secondary actions (Cancel, View Details, History) higher or left edge.
- Signature pad: Minimum 320px wide × 180px tall usable canvas area on phone (scaled from the current 1400×420 internal in FormSigningWorkspace.tsx:2085-2086 but with proper responsive container). Large enough for a natural thumb or stylus signature while holding the device one-handed. Dashed "Signature line" guide must be prominent. Clear button must also be 48px+ and thumb-reachable.
- Evidence photo upload: Native device camera capture with **one tap** (no filename typing, no type select, no multi-step "choose file then upload"). Preview + retake + metadata stamp (timestamp + geo + patient context) must be two taps total.
- All list items, cards, buttons, tabs, and form controls must use explicit `.ci-touch-target` or equivalent 48px minimum with generous padding (py-3.5 px-4 minimum on primary actions).
- No icon-only buttons under 48px. No dense tables with sub-32px rows on mobile (reflow to cards automatically).

**Brutal current failures**:
- UnitDrawer tabs: `px-3 py-2.5 text-[12px]` (effective height ~28-32px).
- EvidencePanel inputs/selects: `px-2 py-1.5 text-[12px]` — finger-sized disaster.
- FormSigningWorkspace clear button: `px-3.5 py-1.5 text-[11px]` + tiny RefreshCw icon.
- Apply Signature: `px-6 py-2.5` marginal, and placed after a 280px+ tall canvas that pushes it off thumb zone on smaller phones.
- CES ExecutionUnitCard and board columns have no touch-optimized hit areas; drag logic is pure mouse.
- Signature canvas wrapper has minHeight:280 but the "Sign here" prompt and controls are visually and physically cramped for gloved or one-handed use on a 6" screen.
- V2 UnitDrawer 760px width (line 34) + 12-column grids inside BatchView guarantee horizontal panning and mis-taps.

---

## 6. Interruption Recovery Strategy

**Non-negotiable**: Zero lost work. Ever.

- Aggressive auto-save on every field change, every canvas stroke (throttled), every tab switch, and on any visibility loss.
- State keys must be deterministic and hierarchical: `ecign:{formInstanceId}:{fieldId}:{signerId}:partial`, `task:{taskId}:evidence-draft`, `unit:{unitId}:currentTab:evidence`.
- On resume (app foreground, visibilitychange, or route return), the system must:
  1. Detect the prior in-flight context.
  2. Restore the exact screen + values + canvas bitmap + scroll position.
  3. Show a non-dismissible "Resumed from interruption — your work is intact" banner for 4 seconds (clinician reassurance under stress).
- For signing specifically: the canvas stroke data + current backendState + any unapplied signature must survive app backgrounding, phone call, or low-memory kill. Current implementation only stashes the final PDF packet (localStorage in FormSigningWorkspace); partial canvas strokes and mid-flow form edits in the uncontrolled inputs of FormViewer are lost.
- Evidence uploads must support resumable chunked + local queue so a 4MB photo doesn't require restarting after signal drop.
- Calendar + MobileIncident must preserve any in-progress incident note or evidence attachment across navigation away and back.

**Current reality**: The combination of uncontrolled inputs (FormViewer deep audit), lack of comprehensive `useEffect` + `visibilitychange` + `beforeunload` serializers for all execution surfaces, and backend-only state machines in eCign / regulatoryExecutionStore means a single phone call during a signature flow forces the clinician to restart the entire 6-step process. This is a compliance and burnout disaster.

---

## 7. Clinician Workflow Optimization (In-Home Visit Flow)

**Canonical happy path** (must be achievable in < 8 taps total, one-handed, under 90 seconds once at the patient):

1. Phone vibrates or calendar reminder: "Next: Mrs. Ramirez — 2pm — Medication Reconciliation + Consent (WAPI-017)".
2. One-tap opens the task card (full context: patient, required evidence, linked policy version, due SLA).
3. Thumb reaches primary "Capture Evidence" (camera opens instantly, geo/timestamp/patient auto-stamped).
4. Photo taken → instant preview + "Retake" or "Accept" (large thumb targets).
5. "Sign Form" (large bottom action) opens eCign in the minimal-step mobile-optimized mode (role=clinician collapses some legal text; signature pad is the hero element).
6. One natural signature stroke → "Apply & Submit".
7. System shows "Complete. Next patient: 2:45pm Mr. Chen — 3 taps away" + auto-syncs evidence + signed packet to Evidence Center and CES.
8. One-tap "Next Patient" or back to personal queue.

All policy reference, full audit trail, and multi-signer roster are secondary and collapsed.

**Current failures** on this exact flow: eCign 6-step full UI, tiny targets, no camera capture, drawer widths, no auto-resume, CES board not integrated as the execution surface for the task.

---

## 8. Surveyor Workflow Optimization (On-Site)

**Canonical path**:
- Arrive on-site → open policy from schedule or QR/ link.
- Policy detail (SharedPolicyDetailView or GVGB specimen) opens with the relevant section already expanded or highlighted (progressive from the survey protocol).
- "Check Evidence" one-tap surfaces the linked artifacts with status (Valid / Pending / Rejected) in a card stack, not a deep tree.
- "Log Finding" primary action (ACHC reference auto-populated) — minimal form (finding type, severity, evidence ref, notes) with 48px targets.
- "Generate Preliminary Report" produces the packet for supervisor review.

Full lifecycle, all statements, appendices, and history available via "Deep Reference" but never in the way of logging the finding.

**Current failures**: Policy detail has competing renderers (GVGB local UI vs Shared SCard vs carousel), wide tables that require horizontal scroll on phone, evidence hierarchy nesting too deep, no direct "log finding from policy view" action surfaced.

---

## 9. Admin / DON Workflow Optimization

**Canonical daily experience**:
- Morning: Open app → primary view is "Today's Sign-off Queue" (personal + team exceptions) + "Audit Readiness Hotspots" (OnboardingV2 gates failing) + "CES Blocked Items" — all one-screen, actionable cards.
- Tapping any item opens the minimal context + one-tap bulk or individual approve/sign/assign.
- Exception handling is the hero surface, not buried in PM approvals or workloads reports.
- End of day: One-screen "Audit Readiness Snapshot" (V2 + CES + Evidence completeness) with "Export for ACHC" primary action.

DONs spend their day in exception handling and sign-off, not browsing boards or drilling 4 levels into UnitDrawer tabs.

**Current failures**: OnboardingV2 AuditReadiness and CES reports/ workloads are dense table + grid experiences requiring desktop. UnitDrawer 760px + 4-tab complexity is presented identically to DONs. No unified "sign-off queue" surface.

---

## North Star — The Ideal 2pm Tuesday Experience

At 2:07 pm on a humid Tuesday in a small two-bedroom home in a rural county, the clinician (right thumb on a 6.1" phone, left hand steadying a blood pressure cuff on Mrs. Ramirez) receives the vibration for the next required action. She glances down: the task card for "WAPI-017 Medication Reconciliation + Patient Rights Acknowledgment" is already the full screen — patient photo, due time, two required evidence items (photo of signed med list + rights form), and two massive 56 px thumb-reachable buttons: "Capture Evidence (Camera)" and "View Policy Reference". She taps Capture; the native camera opens instantly, she frames the signed document on the kitchen table with one hand, the photo is stamped with GPS, timestamp, and patient ID, and she accepts with a second thumb tap. The screen returns to the task with the evidence thumbnail live and green. The second button has transformed to "Sign Form — 1 of 2". She taps it; the eCign interface appears as a single large signature canvas (340×200 px usable area, clear "Sign here" guide, 52 px "Apply Signature" button parked perfectly in the right-thumb zone) with only the minimal legally required attestation text collapsed above it. She signs naturally with her thumb in one fluid stroke, taps Apply, watches the "Attested & Locked" confirmation (green, 2-second auto-advance), and the system immediately surfaces the next patient card 12 minutes away with "You're on time — tap to navigate." She slips the phone into her scrub pocket, finishes the visit, and by the time she reaches the car the packet has synced over the weak signal, the CES board has the unit moved to completed, the evidence is in the center, and the DON's sign-off queue has already incremented. No data was lost when Mrs. Ramirez's daughter called mid-signature; the partial stroke and form state restored perfectly on resume. The entire interaction from task appearance to "next patient" confirmation took under 90 seconds of active attention, required only the right thumb, and left zero compliance gaps. This is what the rebuilt mobile experience feels like — invisible, inevitable, and legally bulletproof.

---

**Enforcement Note**: Every future component, route change, or workflow in the INCLUDED surfaces (CES, eCign/FormViewer/FormSigningWorkspace, Evidence/Artifact, Tasks/MyTasks/PM, Calendar + MobileIncident, OnboardingV2 real batches/gates, Journey real modules, Policy library/detail/lifecycle, AuditMode, AchcSurvey, staffing operational profiles, operational Help) must be reviewed against this philosophy before any code is written. Desktop mouse patterns, multi-step wizard UIs, sub-48px targets, and non-resumable state are now technical debt to be surgically removed.

This philosophy is the North Star for the entire reconstruction program. Violate it and the field users will continue to suffer, compliance risk will remain elevated, and the product will fail its core mission.