I am Agent 02 — Progressive Disclosure Architect. Current assessment of clutter on the default view: The default task execution surfaces currently blast 5+ fully expanded regulatory sections (FORM fields, full evidence lists, signature rosters, review histories, audit trails) plus dense secondary lists directly into the user's face, creating near-90% cognitive overload on first load instead of a calm scannable queue.

# Agent 02 — Progressive Disclosure Architect — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 02 — Progressive Disclosure Architect  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Dense Task Execution view (multiple visible sections: FORM, SUPPORTING EVIDENCE, SIGNATURES, REVIEW/CERTIFICATION, LOCK/AUDIT + task list below)  
**Target Reduction:** Minimum 70% clutter reduction on default view

---

## 1. Current Clutter Diagnosis

The current default task execution surfaces (MyTasks, SprintExecutionBoard right-rails, TaskDetailRightPanel, WorkflowDrawer, SprintTaskPanel) are catastrophic information dumps. A single selected task immediately exposes a massive "TASK EXECUTION REQUIREMENTS" banner + 5+ fully-expanded stacked sections (FORM with live fields, full SUPPORTING EVIDENCE lists + thumbnails + upload controls, SIGNATURES roster with multiple avatars + status, REVIEW/CERTIFICATION history + comments, LOCK/AUDIT immutable trail + requirements) plus a secondary dense list of sibling tasks below. Every visual element competes for attention with zero hierarchy or breathing room. Status badges, progress bars, multiple action buttons, meta KV pairs, and regulatory text blocks are all simultaneously visible on first load. This is the antithesis of calm operational software.

**Estimated current clutter level:** 85–92% (far exceeds acceptable operational density; primary cause of user fatigue and slow scanning).

---

## 2. 70% Reduction Strategy

### 2.1 Move to Right-Side Drawer (Veil) — PRIMARY CONTAINER (≈55–60% of current visual mass)
- All FORM content (actual input fields, multi-step form renderer, validation errors, submission controls) → Veil Drawer "Form" tab or dedicated pane
- Full SUPPORTING EVIDENCE lists, thumbnails, upload/drop zones, evidence detail cards, artifact links → Veil Drawer "Evidence" section (progressive within drawer)
- SIGNATURES full roster (all required signers, avatars, current status, "Sign" CTAs, history) → Veil Drawer "Signatures" pane
- REVIEW / CERTIFICATION details, approver chain, comments, certification history, QAPI-style validation checks → Veil Drawer "Review & Certification" section
- LOCK/AUDIT full trail (immutable log rows, requirements matrix, lock status, escalation history, actor timestamps) → Veil Drawer "Audit & Lock" pane
- Child/sibling task lists (the secondary dense cards below the main execution view)
- Full meta details, workflow timeline expanded, blocker reasons with resolution UI, escalation details
- All advanced action buttons and bulk operations

### 2.2 Move to Hover Cards / Previews — MICRO DISCLOSURE (≈10–12% of current visual mass)
- Evidence count chip → Hover reveals 3–4 key evidence thumbnails + "X more" + quick "View All in Veil" link
- Status badge (ComplianceState) → Hover shows compact state-change timeline (last 3 transitions + actor + timestamp)
- Assignee / owner chip → Hover shows compact user card (name, role, contact quick link, current load)
- Due date / escalation timer → Hover shows full due context + risk assessment summary
- AuditReadinessTag → Hover shows mini regulatory readiness breakdown
- Task title (if truncated) → Hover expands full title + one-sentence context
- Quick signature status summary (e.g. "3/5 signed") → Hover lists pending signers only

### 2.3 Move to Modals — DEEP INTERACTION ONLY (≈8–10% of current visual mass)
- Full FormViewer / Form filling experience (especially complex regulatory forms with many fields) — triggered from Veil but rendered as focused modal
- Signature capture pad / e-signature workflow (pen, legal text, submit)
- Evidence artifact viewer / zoom / download / annotation (large images, PDFs)
- Full audit log export or detailed searchable audit explorer
- Review certification confirmation dialogs and multi-approver flows
- Lock / unlock confirmation with reason capture
- "Execute Task" advanced flows that require focused attention
- Any "View Artifact" or "Open in Policy Library" deep navigation

### 2.4 Remove or Collapse Entirely — ELIMINATE FROM DEFAULT VIEW (≈15–20% of current visual mass)
- The giant "TASK EXECUTION REQUIREMENTS" header/banner/container entirely from list and initial detail surfaces
- All inline expanded lists (evidence items, signer names, audit rows, review comments) in default list rows or hero areas
- Redundant progress bars, duplicated status indicators, and visual "checklist" explosions on list items
- Secondary dense sibling/child task cards rendered below the primary execution panel (move to Veil "Related Tasks" or integrate as minimal chips)
- All non-essential icons, borders, and decorative dividers on the default list rows
- Full KV meta blocks (owner, workflow, due full date) — reduce to 1–2 chips
- Any "Requirements Met: X/Y" progress text blocks on the list view
- Expanded regulatory text, CFR references, or policy excerpts — surface only via Veil "Regulatory Context" link

### 2.5 React Component Opportunities
- `TaskListItemMinimal` — strictly governed component accepting only: `id, title, oneLineContext?, complianceState, dueDate, evidenceCount, signaturesCount, auditReadiness, escalationHours?, onOpenVeil, quickActions[]`. Zero internal sections or lists.
- `VeilDrawer` (or promote/enhance existing `RightDrawer` / `WorkflowDrawer`) — glassmorphic, configurable header, tabbed or accordion body slots for Form / Evidence / Signatures / Review / Audit, with glass treatment only when open.
- `EvidenceCountChip` — count + hover renderer prop (receives preview data)
- `StatusBadgeWithHistory` — wraps existing ComplianceStateBadge + hover timeline
- `SignatureSummaryChip` — "X/Y signed" + hover pending list
- `AuditTrailSummary` — last action summary + hover for 3-line preview
- `MinimalTaskQueue` — the new default list renderer (replaces dense ul with strict spacing and no internal cards)
- `DisclosureMatrix` — shared config object / hook used by all surfaces to decide placement (single source of truth for 02/07/16)

---

## 3. Impact on Default View

The default task list view (MyTasksPage, CES board lists, calendar task rows, etc.) must become a calm, high-density but low-cognitive-load scannable queue. Users should be able to instantly triage 20–50 tasks without scrolling fatigue or decision paralysis.

**Expected visual reduction:** 78–85% (exceeds 70% minimum; measured by visible DOM elements, information blocks per row, and pixel occupancy of non-essential content).

**Before vs After summary**

| Aspect                        | Before (Current Clutter)                                      | After (V3 Veil Progressive)                                      | Reduction Impact |
|-------------------------------|---------------------------------------------------------------|------------------------------------------------------------------|------------------|
| Per-task row content          | 12–18+ elements (title, domain, 5+ sections snippets, lists, 4+ badges, buttons, progress, meta) | 5–7 elements max (title, 1-line context or domain, status badge, due chip, 2 count chips, 1 primary action) | ~75% |
| Expanded sections on load     | 5+ (FORM, EVIDENCE, SIGNATURES, REVIEW, AUDIT/LOCK) all visible | 0 — zero sections expanded on list | 100% |
| Secondary lists               | Dense sibling task cards always rendered below | None (or 1–2 minimal related chips) | 90%+ |
| Visual weight / borders       | Heavy cards, many internal borders, icons everywhere | Flat minimal rows, subtle hover only, strong glass reserved for Veil | 70%+ |
| Interactive targets           | 8–12+ per task row (scattered)                                | 2–3 (row click = open Veil, count chips, primary CTA)            | 75% |
| Cognitive load (first scan)   | "What do I need to do first?" requires parsing everything     | Instant triage by status + due + counts; details on demand       | Dramatic |

Default view becomes: clean header + filter bar + list of `TaskListItemMinimal` rows with generous but consistent spacing. No glass, no heavy cards, no regulatory explosions.

---

## 4. Glassmorphism Application (Veil Glass Rules)

Glassmorphism is **strictly contextual and reserved for the Veil**:
- The right-side Veil Drawer receives the full V3 premium dark glass treatment: frosted translucency, strong visible 4-sided borders with luminous edges, elevated Layer-2 shadow/glow, matching the Dashboard_v3_Floating_Cards.jpg north star.
- Background list view dims subtly (overlay or reduced opacity) when Veil is open to reinforce focus — never compete.
- Inside the Veil: sub-cards or panes may use lighter glass or clean dark panels with the same border language for hierarchy, but never more than 2 internal layers.
- Default list items: **zero glass**. Use flat dark surface with very subtle hover lift (1px border change or soft background shift) only. No floating, no glow, no translucency.
- Modals: full-screen or centered glassmorphic overlays using the same Veil Glass token family for consistency (Agent 03 defines exact tokens).
- Hover cards: minimal glass or clean elevated tooltips with thin border only — never heavy.
- Rule: "Glass appears only when the user has committed to deeper context (click to open Veil or modal). Default scanning surface remains ruthlessly matte/minimal dark."

This restraint ensures the 70%+ reduction is perceptual as well as quantitative.

---

## 5. Risks & Trade-offs

- **Discoverability risk**: Critical regulatory details (evidence gaps, unsigned items, audit blocks) may be missed if users never open the Veil. **Mitigation**: Count chips are always visible and color-coded (red = blocking); hover previews surface the top 1–2 problems; list supports powerful filters ("blocked", "awaiting_signature", "overdue", "missing_evidence"); empty states and first-use tooltips educate users.
- **Extra click tax**: Users must click to see details they previously saw inline. **Mitigation**: Primary "Execute / Open" CTA on every row is one click to Veil; most common actions (status change, quick sign) remain available via chips or quick actions without full open; keyboard shortcuts + persistent Veil state.
- **Mobile / small screen**: Veil Drawer becomes bottom sheet. Risk of cramped content. **Mitigation**: Agent 11 + Agent 03 must define responsive breakpoints; progressive sections inside Veil become accordions by default on <768px.
- **Power users / auditors**: May resent "hiding" the audit trail. **Mitigation**: Provide "Always show summary on list" user preference (stored) and "Export full audit" from list header; Agent 14 ensures consistency so no surface cheats.
- **Over-aggressive reduction**: Removing too much context could slow complex workflows. **Mitigation**: This spec is aggressive but balanced by Agent 06 minimal core + Agent 07 matrix; validated by real user paths in Agent 15 + 16.

Trade-off accepted: Slightly higher interaction cost for dramatically lower cognitive load and faster primary scanning/decision speed on the default view — the explicit goal of Phase 1.1.

---

## 6. Dependencies on Other Agents

- **Agent 03 (Right Drawer / Veil Designer)**: Must deliver the production VeilDrawer primitive with exact glass treatment, animation, tab/accordion patterns, and mobile sheet behavior before any surface adopts the disclosure rules. Critical path.
- **Agent 06 (Task List Minimal Core Defender)**: Defines the absolute final props and visual spec for `TaskListItemMinimal`. This spec (02) provides the "what to hide" rules; 06 owns the "what stays and how it looks".
- **Agent 07 (Detail Containment Rules Enforcer)**: Co-author the canonical Disclosure Matrix (single JSON/config) that every surface (CES, PM, Evidence, Calendar) imports. Prevents drift.
- **Agent 04 (Hover Card & Preview Strategist)**: Designs the exact hover card components and data contracts for the chips defined here.
- **Agent 05 (Modal vs Drawer Decision Maker)**: Final arbitration on borderline cases (e.g., "is full form a modal or stays in Veil?").
- **Agent 14 (Cross-Surface Consistency Guardian)**: Enforces that MyTasks, Calendar, Audit Readiness, Onboarding, etc. all use identical placement rules from the matrix.
- **Agent 16 (70% Reduction Validator)**: Owns before/after measurement harness using this spec + reference screenshot. Must countersign the final matrix.
- **Agent 08 + 12**: React extraction and DOM/performance impact of new minimal components + Veil.
- **Agent 13 + 11**: Glass restraint + mobile sheet behavior inside Veil.

All recommendations here are designed for tight coordination; unilateral changes by any surface will be blocked by Agent 16 fidelity gate.

---

## 7. Measurement & Validation Approach

Agent 16 (and the team) will verify 70%+ reduction using multiple orthogonal methods on the exact reference screenshot + new minimal mock:

1. **Quantitative DOM / Element Count** (primary): 
   - Screenshot pixel analysis + React DevTools tree count on default list container (MyTasks + Sprint board list view).
   - Target: ≥70% fewer visible text nodes, interactive elements, cards, borders, and icon instances.

2. **Information Density per Row**:
   - Manual + automated count of distinct data fields surfaced without interaction.
   - Before: 15–25+ fields/row. After: ≤6.

3. **Visual Weight / Pixel Occupancy**:
   - Measure % of row height/width occupied by non-essential decorative or content blocks. Target reduction 75%+.

4. **User Task Performance** (Agent 15 + 16):
   - "Scan 15 tasks and select the 3 highest priority for immediate action" — time-to-first-correct-action + NASA-TLX cognitive load score.
   - A/B with current vs new (simulated in prototype).

5. **Disclosure Matrix Coverage Audit**:
   - Every element from the original screenshot (FORM fields, evidence items, signer rows, audit entries, review cards, etc.) must be mapped to exactly one of: List (visible), Hover, Veil, Modal, or Removed. 100% coverage required.

6. **Cross-surface Consistency Score** (Agent 14 + 16):
   - Same rules applied to CES, PM, Evidence Center, Calendar task rows.

Agent 16 will publish a signed "Phase 1.1 70%+ Reduction Validation Report" with numbers, screenshots, and matrix before Phase 2 foundation work proceeds.

---

## 8. Phase 1.1 Exit Recommendation

Before any Veil implementation code or surface migration:

- Produce and freeze the **Canonical Disclosure Matrix** (table + machine-readable config) co-signed by Agents 02, 06, 07, 03, 05, 14, 16.
- Agent 03 delivers high-fidelity Veil Drawer mock + interaction spec (including glass tokens) aligned to this disclosure strategy.
- Agent 06 delivers the final `TaskListItemMinimal` visual spec and storybook examples.
- Agent 16 runs the measurement harness against the reference screenshot and confirms ≥70% reduction target is achievable and measurable.
- All 16 agents have reviewed and countersigned this Progressive Disclosure spec (or provided explicit deltas).

This output becomes the binding contract for Phase 2 Veil foundation and all subsequent surface generation. No surface may render FORM, full EVIDENCE lists, SIGNATURES rosters, REVIEW details, or AUDIT trails in the default list view after this gate.

**Agent 02 Signature:** Phase 1.1 Progressive Disclosure Rules — 2026-05-18

*Ready for inclusion in the consolidated `Phase1.1_V3_Veil_Clutter_Reduction_Strategy.md`.*

---

**End of Agent 02 — Progressive Disclosure Architect Recommendations**