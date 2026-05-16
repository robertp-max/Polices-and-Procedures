# MOBILE-FIRST UX RECONSTRUCTION STRATEGY
**Project**: HomeHealth Policies_and_Procedures — Field Clinician / DON / Surveyor Mobile Experience  
**Date**: 2026-05-15  
**Mode**: LOCKED — Documentation & Analysis Only (no source edits, no new components, no commits, no deploys)  
**Context**: Follows exhaustive UI/UX Design Audit (12 reports in ForGrok/UIUX_Audit/), prior QA_UAT_AUDIT series (eCIgn_Legal_Defensibility_Gap_Analysis.md, Accessibility_Compliance_Deep_Audit.md, QA_UAT_TEST_PLAN.md, FINAL_QA_UAT_REPORT.md), LAYOUT_NORMALIZATION_REPORT, GVGB001_CANONICAL_UX_REFINEMENT, and the UIUX_REDESIGN_ROADMAP.md (Phases 0–7).  
**Scope Filter**: Only real production operational workflows executed by field clinicians (in-home visits), DONs (multi-signer oversight), and surveyors (on-site ACHC/policy/evidence review). No hypothetical or internal-only paths.

**Canonical References** (frozen per Phase 0 of redesign roadmap — see DESIGN_OWNERS.md to be created):
- Shell/Navigation: `src/policy/components/CommandCenterLayout.tsx` (MOBILE_PRIMARY_TABS, useIsMobile, GlobalTaskDrawer, RightDrawer) + `src/policy/components/ui/` primitives (GlassPanel, SurfaceCard, Tabs, ActionButton, CiStatusBadge, DataGrid, PageHeader, EmptyState, RightDrawer).
- Policy Detail: `PolicyDetailPage.tsx` + `SharedPolicyDetailView.tsx` (QA-PG-001 canonical) + `GVGBDetailView.tsx` (GV-GB-001 specimen only).
- Forms + eCign: `FormViewer.tsx` + `FormSigningWorkspace.tsx` (buildPrintablePacketHtml, signed_locked Options, multi-signer roster/cert/audit, canvas signature) + `FormPrintView.tsx`.
- CES / Task Execution: `src/policy/ces/` (regulatoryExecutionStore.ts, SprintExecutionBoard, WorkflowExecutionPanel, CesEvidenceHierarchyPanel) + enforcementEngine.
- Onboarding/Activation: `src/policy/onboarding-v2/` (gate/reconciliation engine, UnitDrawer, KpiTile, AuditTimeline).
- Evidence/Artifact: `ArtifactViewerPage.tsx` + evidence hierarchy + hash-chain verification.
- Supporting: `server/ecign/` (hashChain.ts, integrity.ts, stateMachine.ts), Journey regulatory mapping, policy governance/lifecycle/autogen, feature gating (PermissionGate/FeatureRouteGuard).

**Mobile Current State (from UIUX_MOBILE_RESPONSIVE_AUDIT.md + EXECUTIVE_SUMMARY)**: Overall ~5/10. Critical surfaces (FormSigningWorkspace signing 5/10, CES boards/tasks 4/10, OnboardingV2 BatchView/UnitDrawer 4/10, Journey/StagingM01 3/10, evidence hierarchy 4/10) are desktop-biased (wide drawers, dense tables, absolute vw carousels, <44px targets, no robust offline/interrupt handling). Signature canvas and dynamic forms are particularly fragile on phone under real conditions. 2313+ inline styles and parallel design dialects (CES navy/orange, eCign navy/orange, Journey cinematic) compound the problem.

---

## Section 8 — UAT + QA + AUDIT STRATEGY

### 8.1 Mobile-First UAT Participant Model (Real Operators Only)

**Primary Testers (mandatory — no substitutes)**:
- 12–15 active field clinicians (RNs, LPNs, HHAs, PT/OT) from 2–3 contracted Home Health Agencies (real caseloads, real rural/suburban/urban routes, real glove use, real one-handed scenarios while patient care is happening).
- 4–6 DONs / Clinical Supervisors (multi-signer second-signature flows, oversight of assistant-completed forms, real-time task approval under time pressure).
- 3–5 ACHC surveyors or state surveyors (or rigorously trained compliance auditors simulating unannounced survey behavior) — on-site policy lookup, evidence verification, finding logging, time-boxed reviews.
- 2–3 Compliance / QA Officers (internal, but only for facilitation and legal defensibility sign-off; they do not count as "field" testers).

**Recruitment & Logistics**:
- Partner with existing agency relationships (compensated time or CEU credits for participation).
- Mix of lab-simulated home visits (nursing lab with actor "patient", props, scripted family interruptions, controlled weak-signal boxes) + shadowed real in-home visits (IRB/consent, de-identified data only, clinician uses own device or agency loaner).
- Devices: Real iPhone SE/14/15/16 (various iOS), Android Pixel/Samsung (various Android), iPad mini / 10" Android tablets — exactly what field staff carry. Include cases, gloves (nitrile), and low-battery states.
- No internal QA engineers or developers as primary executors of field scenarios. They script, observe, log, and repair.

**Success Gate**: Minimum 80% of core flows (CES task complete + evidence photo, full eCign single + multi-signer, policy + evidence review for surveyor) must pass with zero data loss or legal-chain breakage across the full cohort before any Phase 1 mobile code ships.

### 8.2 Clinician Simulation Testing (In-Home Visit Realism)

**Core Scenario (repeated across 3+ visits per clinician, different patients/times of day)**:
1. One-handed only (non-dominant hand exclusively; dominant hand "occupied" holding patient, chart, or assisting ambulation). Phone strapped or held against forearm if needed.
2. Arrive at simulated or real home. Open app via mobile primary tabs → My Tasks or Calendar → locate today's CES event/task for the patient (e.g., HHC Competency Evaluation, medication reconciliation, wound care protocol).
3. Open WorkflowExecutionPanel / task detail (must become bottom sheet on phone). Complete requirement: open form via CES link (generates stable `form_instance_id` + `eventId-formId-seq` canonical).
4. Fill dynamic multi-page form (checkboxes, text, selects, conditional sections) — all one-handed, large targets, auto-save every change.
5. Attach photo evidence (wound photo, signed paper copy, ID, environment) — launch camera, preview, annotate if supported, attach — one-handed.
6. Proceed through eCign flow if signature required (consent checkbox, review packet, signature canvas with finger/stylus, attest, lock).
7. Task auto-updates in CES board, calendar, Evidence Center hierarchy, audit trail.

**Interruption Matrix (execute every scenario at least once)**:
- Mid-form field edit, mid-signature canvas stroke (any of the 4 steps in FormSigningWorkspace: sign → verify → review → options), mid-evidence upload.
- Triggers: Incoming phone call (real or simulated), push notification from agency, family member "patient" verbal interruption, orientation change (pocket to landscape), app background/kill (home button or task switcher), low battery warning, iOS/Android memory pressure.
- Resume windows: 30 seconds, 4 minutes, 45 minutes, next calendar day (cold app launch).
- Pass criteria: 100% state restoration (exact field values, partial signature strokes if any, current step, form_instance_id, any queued evidence). Clear "Resumed from interruption at HH:MM" banner + automatic audit event. Zero data loss or duplicate artifact creation. Hash chain remains valid post-sync.

**Weak Signal / Offline Testing (rural home, basement, travel between patients)**:
- Start in airplane mode or network-throttled (1 bar LTE, 200ms+ latency, 10% packet loss).
- Perform full form fill (50%+ fields), photo attach (large image), begin or complete signature.
- Queue must be explicit and visible ("2 items pending sync — will auto-upload on signal").
- Drive or walk to strong signal area (or toggle airplane off). App detects online → syncs without user intervention or with one-tap "Sync Now".
- Post-sync verification: Evidence Center + CES task status + ArtifactViewer all show the artifact with correct timestamps, single canonical `linkedFormInstanceId`, full multi-signer roster if applicable, hash chain intact, no orphaned records (directly tests fixes for the multi-signer artifact identity issues documented in eCIgn_Legal_Defensibility_Gap_Analysis.md).
- Failure modes tested: Partial sync, conflict (DON signed offline while clinician was offline), retry after failure, manual queue inspection.

**One-Hand + Glove + Patient-Present Pressure**:
- Nitrile gloves on operating hand.
- "Patient" actor talks, moves, requires assistance, or creates realistic distractions throughout.
- Time-boxed realistic visit windows (8–15 minutes per complex task).
- Metrics collected per clinician: task completion rate, time-on-task, error/tap-miss rate, signature legibility/quality score (DON or compliance reviewer blind rating), subjective NASA-TLX or 1–10 frustration, "would you use this in the field tomorrow?" binary + verbatim.

All flows must succeed at ≥90% first-attempt rate under these conditions.

### 8.3 Surveyor Simulation Testing (On-Site Time Pressure)

**Scenario**:
- Unannounced-style entry to agency or facility (simulated).
- On tablet or phone: Use Library search or ACHC-aligned Framework to locate required policy (GV-GB-001, QA-PG-001, or specific regulatory section) within 30 seconds.
- Open detail view (must reflow without horizontal scroll, readable font scaling, sticky but not obstructive header on phone).
- Review key sections (one-handed or with clipboard in other hand), highlight/annotate if supported.
- Log 4–6 findings: non-compliance note + required photo evidence attachment (environment, record, staff) + direct link to supporting CES evidence or signed artifact.
- Drill into Evidence Center / CesEvidenceHierarchyPanel or UnitDrawer from surveyor lens: verify hash chain, view certificate/roster/audit trail for a recent signed eCign package, confirm single canonical artifact.
- Generate and export ACHC-aligned finding log packet or survey summary (print fidelity must match desktop).

**Time Pressure**: Entire policy + evidence + finding log cycle completed in <20 minutes real time with zero UI friction or data loss. Horizontal scroll, cramped targets, or drawer overflow = automatic fail.

### 8.4 Interruption Testing (Mid-Flow Resume — Non-Negotiable)

Every critical stateful surface (FormSigningWorkspace at every step, FormViewer dynamic sections, WorkflowExecutionPanel requirement completion, evidence upload, OnboardingV2 gate evaluation + UnitDrawer, CES board drag or status change) must survive:
- App background/foreground
- Process kill + relaunch
- Network flap
- Device rotation
- Incoming call / notification
- Low power mode

Resume must land the user in the identical micro-state (form page + values + signature progress + current eCign step + any pending evidence) with an immutable audit trail entry. This is the #1 legal defensibility requirement for mobile.

### 8.5 One-Hand Usage Testing (All Core Flows)

Explicit non-dominant-hand-only execution of:
- Full CES task execution (board → detail → form → evidence photo → signature if required → close)
- eCign multi-signer flow end-to-end (first and second signer perspectives)
- Policy library search + detail + appendix review
- Evidence hierarchy navigation + artifact open + download/print
- Calendar event drill-down + MobileIncidentExecutionPage
- Onboarding V2 batch activation (if clinician is also a preceptor)
- Training module complete (Journey or V2)

Pass = zero reliance on second hand for taps, scrolls, signatures, camera, or navigation. Thumb-zone optimization and 44px+ targets are mandatory (enforced in new mobile primitives).

### 8.6 Accessibility Testing (WCAG 2.2 AA on Real Phone + Tablet + Assistive Tech)

**Devices & Tools**:
- iPhone + iPad with VoiceOver (latest iOS).
- Android phone + tablet with TalkBack (latest).
- External keyboard + switch access simulation.
- axe DevTools + WAVE + manual contrast audit (WCAG AA 4.5:1 text, 3:1 UI) in light, dark, and ci-mode on mobile viewports.
- Real low-vision, motor-impaired, and blind tester participation where possible (or contracted accessibility consultants).

**Flows That Must Pass End-to-End**:
- eCign signing (FormSigningWorkspace): All form inputs (dynamic/conditional), consent, signature canvas (announcements for stroke progress, alternative large-button or voice-assisted signing path if canvas is fundamentally inaccessible), multi-signer review packet (headings, landmarks), Options screen actions. Focus management and live regions for step changes.
- CES task execution (WorkflowExecutionPanel + form + evidence attach + board status): Requirement rows as list or tree, task actions, form fields with proper labels, status changes announced (task completed, evidence attached, signed).
- Policy detail + surveyor review (SharedPolicyDetailView / GVGB): Long content headings, tables, tabs, appendix navigation.
- Evidence hierarchy + ArtifactViewer: Tree or list navigation with ARIA, filter results live, artifact actions.
- Onboarding V2 UnitDrawer tabs, reconciliation preview, gate status.

**Requirements**:
- All icon-only buttons have aria-label or visible text.
- Live regions (role=status, aria-live=polite) for every async status (signing complete, sync success/fail, gate evaluated, task updated).
- Focus trap + escape in all drawers/modals (RightDrawer, WorkflowExecutionPanel, UnitDrawer, signing workspace).
- No loss of functionality when zoomed 200% or with large text.
- Documented contrast ratios for every new mobile component in both themes.

Every accessibility violation found in prior Full_App_Accessibility_Compliance_Audit.md and Accessibility_Compliance_Deep_Audit.md (especially FormSigningWorkspace, evidence hierarchy, WorkflowExecutionPanel, CES boards) must be closed in the mobile rebuild or explicitly accepted with compensating control and surveyor sign-off.

### 8.7 Regression Strategy (Protect eCign Legal Defensibility, CES Integrity, Audit Trail, ACHC Alignment on Every Change)

**"Compliance Lock" Regression Gate** (run on every PR touching forms, ecign, ces, evidence, onboarding-v2, policy detail, or mobile shell):
1. **Automated Core** (Playwright + existing scripts):
   - Full DON Assistant → DON two-signer CES workflow (exact reproduction of Test 2 in QA_UAT_TEST_PLAN.md).
   - eCign Download/Print/Artifact consistency (Test 3).
   - Evidence refresh + artifact retrieval across sessions (Test 4).
   - Audit trail linkage + targetId integrity (Test 5).
   - Form URL hydration with `?form_instance_id`.
   - Hash chain verification (`server/ecign/hashChain.ts` verifyChain) on every signed package.
   - ACHC surveyor projection (scripts/simulateAuditEngine.ts or buildAchcSurveyProjection.mjs) + policy coverage (verifyPolicyCoverage.ts).

2. **Manual Field Clinician + DON + Surveyor Regression** (minimum 2 clinicians + 1 DON + 1 surveyor per release candidate):
   - One full in-home simulation with interruption + weak-signal + one-hand on the changed flows.
   - Full multi-signer eCign on phone/tablet.
   - Surveyor policy + evidence + finding log cycle under 20-min pressure.
   - Explicit re-execution of all scenarios from eCIgn_Legal_Defensibility_Gap_Analysis.md (role enforcement, required fields gate, snapshot fidelity for subsequent signers, single canonical artifact).

3. **Legal/Traceability Sign-off**: Compliance Architect (owner of server/ecign/* and regulatoryExecutionStore) + one external field DON must co-sign that the signed package, evidence hierarchy, and audit trail remain single-canonical, hash-chained, and surveyor-defensible. Any duplicate artifact risk or chain break = automatic block.

4. **Design Governance Regression**: Run `npx tsx scripts/verifyUiDesignSystem.ts --strict`, mobile viewport screenshot diff of 8–10 canonical flows (library detail, signing Options + packet, CES board + task drawer on phone emulator, OnboardingV2 BatchView/UnitDrawer on phone, evidence hierarchy), drift count vs baseline. Zero new local Tab/Card/primitive families allowed.

**Release Train Rule**: No mobile or form/CES/eCign change reaches production without passing Compliance Lock + real field UAT cohort sign-off. This protects the production strengths listed in Section 9.

### 8.8 Design Governance QA (Veto + Drift Prevention)

- **Veto Holder**: Designated Design Integrity Owner (rotating senior role: UI architect + compliance representative). Any proposed new component, Tab variant, Card family, theme palette, drawer pattern, or layout grid requires written approval before implementation. "No new local Tab/Card/SectionTitle/primitive" is absolute (extends the rule already in UIUX_REDESIGN_ROADMAP Phase 1).
- **Weekly Drift Review** (45 minutes every Friday):
  - Run strict verifyUiDesignSystem.ts.
  - Review all PRs since last meeting for inline styles, hex values, arbitrary Tailwind, parallel card/tab systems (CES primitives, GVGB local elements, eCign-specific, Journey absolute positioning).
  - Visual diff of mobile emulated screenshots for priority flows.
  - Update DRIFT_AND_REDUNDANCY_REPORT.md and this strategy appendix.
  - Any drift = assigned remediation ticket + blocked feature release until fixed.
- **Tooling Enforcement**:
  - Extend verifyUiDesignSystem.ts with mobile-specific rules (touch target <44px detection, fixed-width containers without responsive guards, missing safe-area-inset, signature canvas without responsive wrapper).
  - PR template mandatory checkboxes: "Uses only canonical ui/ primitives or approved mobile variants", "Mobile viewport tested on real iPhone/Android", "Interruption + offline scenarios executed in UAT cohort".
  - Living DESIGN_OWNERS.md + header comments in every canonical file ("CANONICAL OWNER — see DESIGN_OWNERS.md. Do not create parallel Tabs/Card/Button/Print/Theme systems.").
- **Consequence**: Repeated drift violations by a team = escalation to executive sponsor. The governance is what prevents the 5+ parallel design systems from re-emerging during the long rebuild.

---

## Section 9 — FINAL RECOMMENDATION (Brutal, No-Fluff Assessment)

### Realistic Implementation Order

**Phase 0 (Weeks 1–3, non-negotiable)**: Execute full Phase 0 of the UIUX_REDESIGN_ROADMAP (DESIGN_OWNERS.md, freeze comments on all canonical files, PR gate, DESIGN_OWNERS enforcement via extended verify script). Charter the real-world Mobile Field UAT Cohort and run the first 2-week pilot on current code to establish baseline failure rates (expect 40–60% failure on one-hand + interruption + weak-signal for signing and CES).

**Start reconstruction with CES Task Execution mobile flows (MyTasks, Calendar drill-down, WorkflowExecutionPanel, evidence photo attach, board status) — including full interruption resume and offline queue.**

**Then (immediately after CES mobile viability proven in UAT cohort) do eCign signing on phone as the next major vertical slice.**

**Rationale (brutal)**:
- CES task execution is the highest-volume daily workflow for field clinicians. A reliable one-handed, interrupt-resilient, weak-signal-tolerant CES experience delivers the fastest visible operational win and proves the new mobile interaction layer (bottom sheets, large targets, persistent state manager) works in the harshest real conditions. This builds the trust required before touching the higher-stakes legal signing surface.
- eCign signing (especially the canvas in FormSigningWorkspace, multi-signer snapshot review, and packet lock) carries direct legal and certification risk. A bug here (lost partial signature on background, fidelity drop on resume, duplicate artifact on sync) can create non-defensible evidence (see eCIgn_Legal_Defensibility_Gap_Analysis.md gaps on client-side role enforcement, snapshot fidelity, and artifact identity). Do not expose the legal moat to mobile until the interaction primitives and resume/sync engine are battle-tested on lower-risk CES flows.
- Parallel tracks (Onboarding V2 mobile, Journey mobile rescue or deprecation, surveyor policy/evidence review, print unification) run after the core CES → eCign vertical is stable.
- Full component unification and shell adaptive behavior (CommandCenterLayout + ui/ primitives) is the horizontal foundation that ships alongside each vertical.

**90-Day Milestone**: CES mobile (one-hand + interrupt + offline) live and UAT-cohort approved.  
**6-Month Milestone**: eCign mobile signing hardened with same resilience + legal sign-off.  
**12–18 Month**: Complete unification, accessibility, training surfaces, governance embedded as muscle memory.

Starting with eCign signing first would be a strategic error — high legal exposure with unproven mobile primitives and low daily volume for proving the layer.

### Biggest Risks (What Will Actually Cause Certification Issues, Legal Exposure, User Revolt, Budget Overrun, or Timeline Slip)

1. **Legal & Certification Exposure on Mobile Signed Evidence (Existential Risk)**: The signature canvas + state in FormSigningWorkspace is not built for mobile backgrounding, one-handed finger input under stress, or offline queuing. An interruption that loses even partial strokes or a sync that creates a second `signed_package` artifact for the same `canonicalFormInstanceId` (the exact failure mode already flagged in the P0 multi-signer gap analysis) gives a plaintiff attorney or ACHC surveyor an easy "the signature was not meaningfully executed or the chain is broken" argument. Medicare/ACHC certification, state license, or a single high-value lawsuit can result. Current localStorage/zustand + demo cache patterns are insufficient for production field use.

2. **Field Clinician Revolt & Silent Bypass (Adoption Death)**: Clinicians already tolerate the desktop bias because they have no choice. If the rebuilt mobile version still fails one-handed (small canvas, missed taps, lost data on signal drop in a patient's basement, two-handed required for camera or drawer), they will revert to paper, verbal attestations, or the old system within weeks. Once field staff lose faith, DONs stop trusting the second-signature queue, and the entire compliance chain collapses from the bottom. "User revolt" is not theoretical — it is the most likely outcome if real UAT cohort data is ignored.

3. **Scope Explosion from Uncontrolled Drift (Budget & Timeline Killer)**: The audit documented 5+ parallel visual systems (shell glass, CES navy/orange primitives, eCign navy/orange, Journey absolute cinematic, GVGB local hardcoded, Onboarding V2 light professional). Without the immediate Phase 0 freeze + Design Integrity Owner veto + weekly drift review, every "mobile fix" will spawn yet another Card or Tab variant. The rebuild will quietly become a full rewrite, 2313 inline styles will be replaced by 4000 new ones, and the 18-month timeline becomes 36 months with massive overruns.

4. **Insufficient Real-Condition UAT (False Confidence → Catastrophic Go-Live)**: Emulator testing + internal QA will pass. Real one-handed gloved operation in a moving patient's home with a ringing phone and 1-bar signal will reveal fatal flows (signature canvas too small for thumb, form state not surviving iOS background kill, photo upload blocking the UI thread, drawer focus traps trapping VoiceOver users). If the cohort is not real agency staff executing real scenarios before code is written, the first production release will be a disaster.

5. **Offline/Sync Architecture Debt Creating New Integrity Holes**: Adding a queue without deep integration into the existing ecign stateMachine, regulatoryExecutionStore event log, hashChain, and the S3 presigned upload path (infra/aws-staging) will create exactly the duplicate-artifact and broken-chain problems the prior QA_UAT work spent weeks closing. The "mobile" layer must strengthen, not weaken, the legal defensibility.

### Highest ROI Wins (Visible Daily Life Improvement for Clinicians/DONs in First 90 Days)

1. **One-handed CES task execution + photo evidence attach with bulletproof interrupt resume** (MyTasks/Calendar → WorkflowExecutionPanel → form → camera → close). Clinician finishes a real competency evaluation or med rec while the patient needs physical assistance. Phone rings or app backgrounds — resumes exactly. Task closes, evidence appears in hierarchy. This is the 2pm Tuesday experience that matters most. ROI: reduced visit time, zero "I had to start over" complaints, measurable productivity lift in first quarter.

2. **Explicit "Sync Later" + auto-sync for weak signal** (form drafts, photo evidence, and even full signed eCign packets queued with visible pending count and conflict resolution UI). Eliminates the rural/home-basement "I can't finish because no bars" failure that currently forces workarounds or incomplete documentation. Immediate credibility win with field staff.

3. **Usable eCign signature flow on phone** (large responsive canvas, clear step progress, resume-safe, readable review packet even before full multi-signer mobile polish). DONs and clinicians can actually complete required signatures on site without returning to the office laptop. Highest legal-risk flow becomes a daily tool instead of a desktop-only ritual.

4. **Surveyor-grade policy + evidence review on tablet** (fast search, reflowed detail without scroll, one-tap evidence drill + photo finding attach, clean packet export). Cuts on-site survey prep and actual survey time. Direct ACHC readiness improvement visible to leadership and external auditors.

These four deliver 80% of the perceived value to the people who actually do the work. Everything else is table stakes or polish.

### What Should NEVER Be Rewritten (Protect These at All Costs — They Are Already Excellent)

These backend/domain strengths are production-grade, regulator-ready, and the reason the product has any chance of success. Rebuild only the presentation and mobile interaction layer on top of them. Any attempt to "improve" the core logic will create new legal and compliance holes:

- **CES engine** (`regulatoryExecutionStore.ts`, `obligationSelectors.ts`, `useExecutionEnforcement.ts`, `enforcementEngine.ts`, `cesRoles.ts`, `cesExecutionMode.ts`, SprintExecutionBoard, WorkflowExecutionPanel, event sync to calendar/audit, obligation-to-task-to-evidence-to-completion state machine). The task integrity, role enforcement, and propagation are correct and integrated. Only the board, drawer, and card chrome need mobile adaptation.

- **eCign multi-signer + packet + hash chain** (entire `server/ecign/` directory: `hashChain.ts`, `integrity.ts`, `stateMachine.ts`, `compliance.ts`, `networkMetadata.ts`; `FormSigningWorkspace.tsx` buildPrintablePacketHtml + roster + cert + audit trail + artifact mirroring via `hhcEvidence.ts`; `FormViewer.tsx` getPrintableFormHtml and snapshot logic). Strict state machine, consent gate, document + manifest hashing, multi-signer roster, evidence binding, and packet generation are the legal foundation. Mobile must produce byte-identical or structurally identical artifacts and never break the chain.

- **Evidence hierarchy + traceability** (`CesEvidenceHierarchyPanel.tsx`, `ArtifactViewerPage.tsx`, regulatoryExecutionStore event log + artifact linking, `queryEvidenceByContext`). Single canonical artifact per form_instance, full prev_hash audit trail, surveyor-defensible drill-down and verification — this is already best-in-class. Mobile views must preserve every link, timestamp, and verification action.

- **OnboardingV2 gate/reconciliation** (entire `src/policy/onboarding-v2/` engine: trigger selection, live SVG reconciliation preview (suppressed vs. emit), gate evaluation, phase accordions, UnitDrawer (evidence/signatures/audit tabs), StatusPill, KpiTile, AuditTimeline, hash-chain verification). Already "audit-grade" and surveyor-defensible by design. The 9/3 grid and wide drawer are the only mobile problems — the logic is untouchable.

- **Policy governance, lifecycle, autogen, compliance mapping** (`policy/lifecycle/`, `autogen/`, `compliance/`, `services/policyLinkService.ts`, ACHC alignment data and scripts). The regulatory mapping and auto-generated sections are a core competitive and compliance strength.

- **Journey regulatory mapping** (`policy/journey/` data files: achcLessons_*.ts, trainingContent, module player structure, pre-assess/debrief/certificate flows). The content-to-competency linkage for annual/competency training is solid. Only the fragile absolute-position cinematic UI (StagingM01Page) needs rescue.

- **Feature gating / permission system** (FeatureRouteGuard, PermissionGate, server/access/ (bundles, pdp, pep, sod), approvedUsers, role-based visibility). Mature, auditable, and already used consistently for compliance surfaces. Mobile navigation must inherit the exact same gates.

These are the parts that make the product defensible. The UI shell, navigation, component families, and mobile interaction layer are the parts that make it unusable in the field. Fix the latter; protect the former.

### What Should Be Aggressively Rebuilt (The Mobile Interaction & Presentation Layer — Be Specific)

- **UI Shell & Navigation** (`CommandCenterLayout.tsx` + MOBILE_PRIMARY_TABS + hamburger + GlobalTaskDrawer + useIsMobile + RightDrawer): Replace ad-hoc 1024px breakpoint with proper responsive + safe-area-inset support. Convert all drawers (RightDrawer, WorkflowExecutionPanel, UnitDrawer, GlobalTaskDrawer, signing workspace) to adaptive behavior: desktop side sheet with focus trap; mobile full-height bottom sheet with drag handle, snap points (25%/60%/95%), and proper aria-modal + focus return. Unify mobile entry points for CES, Evidence, Forms, Library, Training, Calendar under the primary tabs + "More" so field users never hunt. Make the shell itself thumb-zone optimized.

- **Component Families**: Complete ruthless migration to (and mobile expansion of) `src/policy/components/ui/` primitives only. Deprecate and delete all local implementations: CES `primitives.tsx` + CesCard + theme.ts (map or replace with ci- tokens), GVGBDetailView local Card/SectionTitle/SimpleTable/TabButton (honor the specimen behavior but use primitives underneath), eCign-specific navy/orange cards, Journey absolute elements, any remaining glass-panel-lib / SCard / hardcoded hex surfaces. New approved mobile-only primitives allowed only with Design Integrity Owner sign-off: MobileFormSection (large labels + 48px inputs), SignaturePad (responsive wrapper around the existing canvas with undo, clear, finger detection, large hit area, orientation handling, loading state), MobileEvidenceCardStack, AdaptiveDrawer, QueueStatusPill.

- **Mobile Interaction Layer (New Critical Infrastructure — Highest Technical Priority)**:
  - **State Persistence & Resume Manager**: Centralized service (or extension of existing stores) that serializes form field state + partial signature strokes (as stroke array or compressed data URL + metadata) + current eCign step + evidence queue entries keyed by `userId + form_instance_id + eventId`. Persist to IndexedDB (preferred over localStorage for >4MB photo blobs) with checksum, TTL, and version. Hook `visibilitychange`, `beforeunload`, `pageshow`, network `online`/`offline`. On resume or app launch, hydrate exactly and emit audit event. This is non-negotiable for legal defensibility.
  - **Offline Queue + Sync Engine**: PendingFormDraftsQueue, PendingEvidenceQueue, PendingSignedPackageQueue with retry/backoff, conflict detection (e.g., "DON signed while you were offline"), and user resolution UI that still produces a single canonical artifact and valid hash chain. Integrate with existing `regulatoryExecutionStore.uploadEvidence` seam and the `infra/aws-staging` S3 presigned upload/validate/promote lambdas for the real backend path. Optimistic UI updates + eventual consistency with clear "pending / synced / conflict" states.
  - **Touch-First Form & Signing Experience**: Extend FormViewer and FormSigningWorkspace with mobile variants — 44px minimum (ideally 48px) touch targets everywhere, thumb-reachable primary actions (bottom of screen), large signature canvas (minimum 280–320px high on phone, pressure/velocity smoothing for finger input, stroke undo, clear with confirmation), auto-save on blur/keystroke + persistent "Saved locally — will sync when online" indicator. Dynamic/conditional form sections must remain keyboard + screen-reader friendly while being large-tap friendly.
  - **Adaptive Layouts & Progressive Disclosure**: OnboardingV2 BatchView 9/3 grid → single-column stack + "Expand details" progressive disclosure; UnitDrawer 760px → bottom sheet or full modal; CES board/kanban → vertical card stack or horizontal snap list on phone (no drag on touch or tap-to-open detail); evidence hierarchy → search-first list or accordion tree; policy tables/appendix → card reflow or horizontal scroll with snap + "pinch to zoom" where unavoidable; calendar dense cells → list-first with day detail.
  - **One-Hand Affordances**: Contextual reachability (primary CTAs in thumb zone), swipe navigation for multi-page forms (with guard against accidental), voice input fallback for notes, large floating action buttons, camera launch that doesn't trap the user in native UI without return path.
  - **Print/Packet on Mobile**: Unified renderer (per Phase 3 of roadmap) so mobile "Download / Print / Share" produces the same high-fidelity packet (form + cert + roster + audit + eCign footer) as desktop. Reliable share-sheet integration + in-app preview that matches final artifact.

- **Journey / Training Mobile Rescue**: Replace or wrap the fragile absolute `vw` carousel and fixed HUD in `StagingM01Page.tsx` with a standard touch-swipe carousel + responsive HUD. Make ModulePlayer + evidence capture + competency signature flows (SignaturePad instances) one-handed and glove-friendly. Decide cinematic V1 vs audit V2 ownership clearly (V2 as default for compliance, V1 preserved for engagement modules).

- **Accessibility as First-Class Mobile Citizen**: Every new mobile primitive and adaptive surface must pass VoiceOver/TalkBack on the full signing and task flows before merge. Live regions mandatory for all status changes. No regression on prior accessibility debt.

- **Governance & Tooling**: Extend `scripts/verifyUiDesignSystem.ts` with mobile rules (touch-target audit, responsive guards, safe-area). Automated screenshot baselines for all 8–10 priority field flows on mobile viewports on every PR. Weekly drift review as non-negotiable ceremony.

This is not cosmetic responsive polish. It is a ground-up mobile interaction architecture layered on the existing excellent domain engines.

### Expected Outcome if Executed Correctly (The 2pm Tuesday Field Clinician Experience, 18 Months Out)

Eighteen months from now, on a random Tuesday at 2:07 PM, Maria (RN, 14 years home health, left-handed operator because her right hand is supporting Mrs. Thompson who is unsteady post-hip replacement) pulls into the gravel driveway of a modest rural home with one bar of signal.

She walks in gloved, phone in left hand (thumb operating), right arm supporting the patient. Opens the app via the bottom primary tabs — "Tasks" shows the CES requirement for today's competency evaluation and medication review. One tap (large, reliable target) opens the task in a clean bottom sheet. She selects "Complete Form". The dynamic WAPI form loads with large, high-contrast inputs that her gloved thumb can hit without error. Auto-save after every field. "Saved locally" pill visible.

Halfway through page 3 (conditional wound section), the patient's daughter calls on the house phone. Maria answers with her right hand/earbud. The app detects backgrounding, serializes every field value, current page, and any started signature data to the local queue with a checksum. Call lasts six minutes.

Back in the app (exact same page, same values, "Resumed after interruption — 2:14 PM" subtle non-intrusive banner, audit event recorded). She finishes the form, snaps a one-handed photo of the completed paper copy and the patient's current wound status (camera preview large and clear, attach succeeds). Reaches the eCign step. Large responsive signature canvas (thumb-friendly height, clear instructions, stroke undo). Draws a firm, legible signature one-handed while the patient chats. Checks the oversized E-SIGN consent. Attests. Locks.

Signal is marginal — the signed package + photo evidence queue visibly as "2 items pending — will sync automatically on better signal." She finishes the visit, helps the patient to the chair, and drives 1.2 miles toward the next patient. At the stop sign with full bars, the app syncs in the background: "Sync complete — artifact locked, hash chain verified, CES task marked complete in board and calendar, evidence attached to event 88421." DON receives the second-signature notification on her own device.

Maria opens Evidence Center on the drive (one-handed at red light) — the new signed package is there with full roster, certificate, immutable audit trail, and prev_hash. One tap opens the ArtifactViewer or shares the clean packet. The CES board on her phone already shows green. No desktop, no rework, no data loss.

Later that week an ACHC surveyor arrives unannounced. The DON hands the surveyor an iPad. The surveyor searches the library, opens the exact policy in <15 seconds (reflowed, readable, no horizontal scroll even in bright lighting), drills into the recent signed artifact from Maria's visit, verifies the hash chain in the UnitDrawer, logs three findings with photo attachments (one-handed while walking the home), and generates the aligned packet. The agency passes with zero documentation-related citations.

Maria finishes her day at 5:25 PM knowing every required signature, photo, and task status is locked, traceable to the exact second, and surveyor-ready. The app was invisible during the care — it simply worked, one-handed, interrupted, in weak signal, and produced evidence she would proudly defend in any audit or courtroom.

Compliance sleeps. Legal has zero exposure on these artifacts. Leadership sees visit completion time down ~18%, signature compliance at 99.4%, zero mobile-related ACHC or state survey findings, and field staff retention comments that specifically praise "the app finally works in the field."

This is the outcome when mobile-first UAT with real operators drives the reconstruction of the interaction layer while the domain engines (CES, eCign packet/hash, evidence, OnboardingV2, policy/Journey governance, gating) remain untouched and protected.

---

**The single most important decision leadership must make in the next 30 days is to formally charter and fund the real-agency Mobile Field UAT Cohort (12–15 clinicians + DONs + surveyors) with protected pilot budget, executive sponsor, and explicit veto authority over any non-mobile or drift-creating changes, because without validated one-handed interrupted weak-signal performance data from actual field conditions on the eCign and CES flows before any code is written, the reconstruction will optimize the wrong problems, the legal defensibility of signed evidence will be compromised on day one of field use, and field staff will revolt and bypass the system entirely.**

*End of MOBILE_FIRST_UX_RECONSTRUCTION_STRATEGY — Sections 8 & 9. Prior sections (1–7) to be populated from the UIUX_Audit reports, REDESIGN_ROADMAP, CANONICAL_COMPONENTS_MAP, DRIFT report, and QA_UAT series as the living strategy document.*