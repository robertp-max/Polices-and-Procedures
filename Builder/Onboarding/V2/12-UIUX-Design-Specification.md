# 12 — UI/UX Design Specification

## Purpose

Detailed UI/UX design specification for the onboarding surfaces. This document is the visual + interaction contract. Conceptual architecture lives in doc 07; this document defines layout, components, behavior, and visual language.

---

## 1. Visual System

Aligned with Command Center + CES. No deviation.

### 1.1 Palette

| Token | Hex | Use |
|-------|-----|-----|
| `--surface` | `#FFFFFF` | Workspace background |
| `--surface-muted` | `#F7F8FA` | Section backgrounds, list rows alt |
| `--border` | `#E5E7EB` | Dividers, card borders |
| `--text-primary` | `#0B1220` | Body text |
| `--text-secondary` | `#4B5563` | Meta text |
| `--text-muted` | `#6B7280` | Tertiary |
| `--navy` | `#0B2545` | Primary brand, headers, primary buttons |
| `--navy-700` | `#13355E` | Hover, active |
| `--orange` | `#E07B2C` | Accent, status flags, key CTAs |
| `--orange-600` | `#C76A1F` | Hover |
| `--success` | `#1F8A4C` | Completed, Pass |
| `--warning` | `#B45309` | At Risk |
| `--danger` | `#B42318` | Blocked, Fail, Hard-gate violation |
| `--info` | `#1E63B0` | Awaiting Signature/Evidence |

### 1.2 Typography

- Family: `Inter, system-ui, sans-serif`
- Scale (rem): 0.75 / 0.875 / 1.0 / 1.125 / 1.25 / 1.5 / 1.875 / 2.25
- Headings: navy, semibold; body: text-primary, regular
- Numerals: tabular for KPIs and counts

### 1.3 Spacing & Radius

- Spacing scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56
- Radius: 6 (controls), 10 (cards), 14 (panels)
- Shadows: subtle (`0 1px 2px rgba(11,18,32,0.06)`); elevated (`0 8px 24px rgba(11,18,32,0.08)`)

### 1.4 Density

Operator-grade: 32–40px row heights on lists, 12–16px cell padding. No empty hero illustrations. No mascots. No confetti.

### 1.5 Iconography

- Lucide-style line icons, 16/20/24px
- Status icons use color tokens above; no emoji status

---

## 2. Shell & Navigation

The onboarding surfaces live inside the Command Center shell:

- Top bar: tenant switcher, global search, notifications, user menu
- Left rail: Calendar, Sprint Board, Audit Mode, **Onboarding** (active), Policies, Forms, Settings
- Sub-rail (when Onboarding active): Dashboard, Activations, Batches, Revalidations, Vendors, Governance, Audit Readiness

Navigation behavior:
- Deep links restore exact filter state.
- Breadcrumbs in every batch/unit view: `Onboarding › Batches › {Subject} › {BatchID}`.
- All onboarding entities are also reachable via global search.

---

## 3. Surface Specifications

Each surface specifies: layout, component list, data per component, interaction behavior.

---

### 3.1 Onboarding Dashboard

**Layout**: 12-column grid, 1440 design width; dense top row of KPIs; primary content split 8/4 (lists / readiness panel).

**Components**:

1. **KPI Strip** (8 tiles, equal width): Active Batches, Pending Activation, At Risk, Blocked, Awaiting Signature, Awaiting Evidence, Completed (period), Overrides Active.
   - Tile content: numeral (tabular), label, sparkline (last 30 days), delta vs prior period.
   - Click → filtered Batches list.
2. **Readiness Panel** (4 cols): radial gauge for Onboarding contribution to overall readiness; secondary bars for: pre-field gate compliance, pre-billing gate compliance, vendor compliance, governance compliance, revalidation freshness.
3. **Tabbed List** (8 cols): tabs — New Hires | Role Changes | Reactivations | Revalidations | Vendors | Governance.
   - Columns: Subject, Role(s), Trigger, Created, Due, Owner, Status pill, Risk pill, Gate strip (mini), Actions (kebab).
   - Sort, multi-filter (domain, role, owner, sprint, due window), saved views.
4. **Live Feed** (4 cols, below readiness): newest state transitions; click → batch view at the relevant unit.
5. **Filter Bar** (sticky): chips for active filters; "Save view" button.

**Interactions**:
- Row click → Batch View.
- KPI tile click → list pre-filtered.
- Live feed item click → unit-anchored Batch View.

---

### 3.2 Role-Based Activation Screen

**Layout**: single-page form, 2-column split: left = inputs (8 cols), right = preview (4 cols). No wizard steps.

**Components**:

1. **Subject Card** (top-left): avatar, legal name, status, branch, supervisor; "Change subject" link.
2. **Trigger Selector**: segmented control (NEW_HIRE / ROLE_CHANGE / REACTIVATION / VENDOR_ONBOARD / GOVERNANCE_APPOINTMENT).
3. **Role Picker**: multi-select with domain grouping; shows policy count and SLA per role on hover.
4. **Effective Date**: date picker with calendar.
5. **Scope Selectors**: service line(s), branch, patient population(s).
6. **Template Preview** (right column, sticky): template ID + version, requirement count, estimated SLA, gate impact.
7. **Reconciliation Preview** (right column): list of requirements that will be suppressed (with source evidence) and reasons.
8. **Activate Button** (primary, navy): disabled until all required inputs valid; on click, opens confirmation modal showing audit-event preview, then emits trigger.

**Interactions**:
- Changing role(s) live-updates Template Preview and Reconciliation Preview.
- "Compare prior profile" link visible on ROLE_CHANGE.
- Confirmation modal requires explicit confirm; emits trigger → routes to Batch View.

---

### 3.3 Onboarding Execution Batch View

**Layout**: 3-region — Header (full width), Body (8 cols), Side Panel (4 cols).

**Components**:

1. **Batch Header**:
   - Subject chip (clickable → dossier)
   - Role(s), trigger, template version
   - Status pill, owner, created, due
   - Readiness contribution chip
   - Action menu: Reassign owner, Withdraw (gated), Request Override (gated)
2. **Gate Strip** (full-width below header): tiles for Field Clearance, Billing Clearance, System Access Clearance (and Vendor Engagement / Governance Active when applicable).
   - Each tile: gate name, state (Pass / Pending / Fail), missing requirements count, last evaluation timestamp.
3. **Phase Sections** (Body, accordion): Pre-Hire → Orientation → Training → Competency → Acknowledgments → Clearance → Post-Activation.
   - Each phase shows a unit list:
     - Columns: Unit name, Workflow, Due, Status, Evidence (count + check), Signature (count + check), Owner, Last action.
     - Row click → Unit Drawer (right-side, slide-in).
4. **Unit Drawer**:
   - Tabs: Overview | Evidence | Signatures | Audit Timeline
   - Overview: requirement, policy linkage (clickable to policy@version), SLA, dependencies, attempts.
   - Evidence: opens Evidence & Forms Panel inline (3.4).
   - Signatures: opens Signature View inline (3.6).
   - Audit Timeline: append-only event list with actor, timestamp, payload preview.
5. **Side Panel** (full Batch Audit Timeline):
   - Vertical timeline of all batch events (filterable by type).
   - Export ▾: CSV, signed PDF.

**Interactions**:
- Hovering a unit's policy link shows policy version + content hash.
- Blocked units show the failing gate inline with a "View gate" link.
- Override requests open a multi-sig eCIgn flow (CO + Admin) and require reason + validity window.

---

### 3.4 Evidence & Forms Panel

**Layout**: drawer over Batch View or full-screen when launched standalone; left = required-evidence list, right = capture/preview.

**Components**:

1. **Required Evidence List**: each item shows object_type, status (Pending / Valid / Rejected / Superseded), required-fields summary.
2. **Capture Region** (right):
   - For form submissions: embedded Forms library renderer at the pinned form version.
   - For file uploads: dropzone + file picker; live validation feedback (size, type, OCR).
   - For external system records: "Pull from {source}" button with last result.
   - For system attestations: read-only with origin/timestamp.
3. **Validation Result**: schema check + content check, with errors listed.
4. **Bound Policy Strip** (when applicable): policy ID + version + content hash.
5. **History**: prior versions with rejection reasons; supersession chain.

**Interactions**:
- Save creates an immutable EvidenceObject; subsequent edits create new versions and supersede.
- Rejected evidence requires reason text and emits an audit event; reopens the unit.

---

### 3.5 Competency Validation View

**Layout**: full-screen workspace (the act of validating a competency is itself work).

**Components**:

1. **Header**: competency name, version, subject, observer (auto-resolved), setting selector (Patient | Simulated).
2. **Skill Grid**: rows = skills; columns = Pass | Fail | Needs Remediation | Notes; per-row attempt counter.
3. **Pass Criteria Bar**: live evaluation against criteria; cannot mark Completed unless criteria met.
4. **Result Summary** (right side): outcome, attempt index, remediation requirements (auto-listed if Fail).
5. **Sign-off Block** (bottom):
   - Observer signature (eCIgn) — required
   - Subject signature (eCIgn) — required
   - Sequential or parallel per spec
6. **Linked Remediation** (visible after Fail): link to the auto-emitted remediation sub-batch.

**Interactions**:
- Observer must be qualified (engine-validated); UI prevents an unqualified observer from being chosen.
- Saving partial scores keeps unit InProgress; only Completion + dual signatures finalize.
- Failure auto-creates remediation units and keeps Field Clearance Blocked.

---

### 3.6 Signature / Acknowledgment View

**Layout**: split view — left = document at pinned version, right = signer strip + sign action; can render inline in Unit Drawer or full screen.

**Components**:

1. **Document Viewer** (left): renders the policy at its pinned version with content hash visible; or the evidence object for non-policy signatures.
2. **Signer Strip** (right):
   - Current signer card: name, role, auth method
   - Remaining signers list (for multi-sig) with order indicator (Sequential | Parallel)
   - Acknowledgment language (per policy/spec)
3. **Sign Button**: triggers eCIgn flow; on success, returns signed artifact (watermarked, hashed) and updates unit.
4. **Signed Artifact Preview**: displayed after signing; metadata pane shows timestamp, IP, auth, hash.

**Interactions**:
- Decline → captures reason; emits `SIGNATURE_DECLINED`; engine reopens or escalates per spec.
- Multi-sig: subsequent signers receive notification + dashboard surfacing; UI shows progress.

---

### 3.7 Audit Readiness View (Per-Subject Dossier)

**Layout**: top-anchored subject header; tabbed body.

**Components**:

1. **Subject Header**: subject card, current roles, current branch, status, hire date, current scope.
2. **Role Timeline**: horizontal timeline of role assignments (start/end), with batches anchored.
3. **Tabs**:
   - **Credentials**: license, BLS, TB, drug screen, OIG/SAM, background — each with status, expiry, source, evidence link.
   - **Acknowledgments**: per policy ledger (policy, version, signed at, signer, link to artifact, hash).
   - **Competencies**: per competency history (attempts, observers, outcomes, signed artifacts).
   - **Trainings**: training records (content hash, duration, knowledge check).
   - **Gates**: timeline of gate evaluations (Field/Billing/SystemAccess) with grant/revoke and actor.
   - **Overrides**: override ledger (gate, reason, validity window, signers).
   - **Evidence**: filterable evidence object explorer.
4. **Export Bar**: "Export Signed Dossier (PDF)" — produces watermarked, hash-verifiable PDF; "Export CSV" for tabular sections.
5. **Surveyor Quick Answers** (right rail): canned queries — "Qualified to perform {X} on {date}?" with date picker and skill picker; returns Pass/Fail with citations.

**Interactions**:
- All artifact links resolve to the eCIgn-signed asset with watermark.
- Dossier export emits an audit event recording exporter, scope, and recipient hint.

---

## 4. Component Library (shared)

| Component | Behavior |
|-----------|----------|
| `StatusPill` | Color + label; tokens map to status enum. |
| `RiskPill` | At Risk / Blocked / On Track. |
| `GateTile` | Pass/Pending/Fail with missing-count and last-eval timestamp. |
| `RequirementRow` | Unit row used across Batch View and Drawer. |
| `EvidenceCard` | Object_type + status + actions. |
| `SignerStrip` | Sequential/parallel signer rendering. |
| `AuditTimelineItem` | Actor, timestamp, event_type, payload preview, expand. |
| `PolicyVersionLink` | Hover shows version + hash; click opens policy at version. |
| `OverrideBadge` | Visually distinct (orange border + lock icon); shows validity window. |
| `ReadinessGauge` | Radial gauge for readiness contribution. |
| `KPI Tile` | Numeral + label + sparkline + delta. |

All components are accessible (WCAG 2.1 AA): keyboard, focus rings, ARIA labels, color-not-sole-conveyance for status.

---

## 5. Page Layout Standards

- Page max width: 1440 (content), 1680 (full bleed dashboard).
- Sticky page header (subject/batch context) + sticky sub-tab bar.
- Drawers slide in from the right at 560px; modals centered, max 720px.
- Tables support column resizing, hide/show columns, saved views, CSV export.

---

## 6. Interaction Behaviors

- Inline validation everywhere; no submit-then-error patterns.
- All destructive or governance actions require confirmation modal with audit-event preview.
- All overrides require dual eCIgn — UI surfaces both signers' progress in real time.
- Notifications appear in-shell first; email is a fallback, never the primary channel.
- Keyboard: J/K row navigation in lists; `g d` jump to Dashboard; `g b` Batches; `/` global search.

---

## 7. Empty & Error States

- Every empty list shows a state aligned to compliance intent (e.g., "No batches at risk — all clear").
- Errors render with cause, remediation link, and a one-click "Open related unit" path.
- Loading states use skeleton rows, not spinners over content.

---

## 8. Cross-Surface Consistency Rules

- Status colors are consistent across Dashboard, Sprint Board, Calendar, Audit Mode, and Onboarding.
- A subject chip behaves identically everywhere (click → dossier).
- A unit row behaves identically on Sprint Board and Batch View.
- Signature artifacts are presented identically wherever they appear.

---

## 9. What This Spec Forbids

- Wizards / steppers
- Generic checklist UI
- Playful illustrations, mascots, confetti
- Color used as the sole conveyor of status
- "Mark complete" buttons that bypass evidence/signature
- Standalone calendar or task list outside Compliance Calendar / Sprint Board
- Inline form authoring (forms must come from the Forms library)

---

## 10. Visual Direction Summary

Premium, calm, dense, operator-grade. Navy and orange punctuation on a quiet white workspace. Compliance state is always visible; consequences are never hidden; evidence and signatures are first-class citizens, not afterthoughts.
