# 05 — UI / UX Design Specification

> Visual and interaction design for the unified Policy Lifecycle Workspace. Light-mode-first, enterprise typography, navy/orange accents over a clean white workspace with strong whitespace. Implements the workflows in [04-Efficiency-Workflow-Design.md](04-Efficiency-Workflow-Design.md).

---

## 1. Design Tokens

### Color (light mode primary)

| Token | Hex | Use |
|---|---|---|
| `bg.canvas` | `#FFFFFF` | Workspace background |
| `bg.surface` | `#FAFBFC` | Panels (left rail, right rail) |
| `bg.muted` | `#F2F4F7` | Selected row, hover |
| `border.subtle` | `#E5E7EB` | Dividers |
| `border.strong` | `#CBD5E1` | Card outlines |
| `ink.primary` | `#0F172A` | Body text |
| `ink.secondary` | `#475569` | Meta text |
| `ink.muted` | `#94A3B8` | Captions |
| `accent.navy` | `#1A3778` | Primary buttons, headers, focus ring |
| `accent.navy-deep` | `#0F2456` | Hover state on navy |
| `accent.orange` | `#C74601` | Action highlights, SLA-warning, primary CTAs |
| `accent.orange-soft` | `#FFEAD9` | CTA backgrounds, badge fills |
| `state.active` | `#16A34A` | Active version chip |
| `state.warning` | `#D97706` | SLA at-risk |
| `state.danger` | `#B91C1C` | Overdue / blocked |
| `state.info` | `#1D4ED8` | Informational |

Status badges always use white text on solid color; muted variants use the soft tint with same-hue text.

### Typography

- **Display / H1:** Outfit Light, 28–34px, tracking `-0.01em`. Used only on workspace title and policy header.
- **Section / H2:** Montserrat SemiBold, 18–20px, tracking `0`.
- **Eyebrow / H3:** Montserrat Bold, 12px, **uppercase**, tracking `0.16em`. Used for right-rail card titles and lifecycle-stage chips.
- **Body:** Roboto Regular, 14px, line-height 1.55.
- **Body small / Meta:** Roboto Regular, 12px, color `ink.secondary`.
- **Mono (IDs, hashes, version numbers):** JetBrains Mono / monospace, 12–13px.

### Spacing & Radius

- 4px base unit; standard paddings 16 / 24 / 32px.
- Card radius `8px`; pill / chip radius `999px`; input radius `6px`.
- Right rail width `360px`; left rail width `280px`; min center column `720px`. Below 1280px viewport the right rail collapses to icons.

### Shadow

- `shadow.card`: `0 1px 2px rgba(15,23,42,.06)`.
- `shadow.float`: `0 8px 24px rgba(15,23,42,.10)` — only for floating selectors and command palette.
- No drop shadows on rails or section dividers; rely on `border.subtle`.

---

## 2. Workspace Anatomy

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│  TOP BAR                                                                          │
│  Policy ID · Title · Version · Lifecycle Stage · Owner · Compliance Flags        │
├──────────────┬─────────────────────────────────────────────────┬───────────────────┤
│              │                                                  │                   │
│  LEFT PANEL  │             MAIN WORKSPACE                       │   RIGHT PANEL    │
│              │                                                  │                   │
│  Stages      │   [Mode tabs: Edit · Review · Approve · Publish] │  Required        │
│  Queues      │                                                  │  Approvals       │
│  Filters     │   Section navigator + center editor / viewer     │  eCIgn           │
│              │   Comment overlay (review mode)                  │  Evidence        │
│              │   Diff lens (compare versions)                   │  Audit Trail     │
│              │                                                  │  Publish         │
│              │                                                  │  Readiness       │
│              │                                                  │                   │
├──────────────┴─────────────────────────────────────────────────┴───────────────────┤
│  REQUIRED-COMMENT DOCK / BATCH BAR (contextual; appears only when needed)         │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Top Bar (height 56px, sticky)

Left → right:

1. **Workspace title:** "Policy Lifecycle" — Outfit Light 18px.
2. **Breadcrumb:** `Library / CL-OA-006 / v6.1` — `ink.secondary`, mono for IDs and version.
3. **Lifecycle stage chip:** stage name on a navy-soft background; current `Internal Review · Day 4 / 15` with a thin progress bar inside the chip when in a SLA window.
4. **Owner avatar + name** (clickable → owner profile drawer).
5. **Compliance flags cluster** (right side):
   - Tier badge (REQUIRED in solid orange, RECOMMENDED in navy outline, OPTIONAL in muted)
   - Required-comments counter (`!` in orange if > 0)
   - Hash-chain integrity dot (green / red)
   - Acknowledgment % (only when Active)
6. **Mode toggle** (rightmost): segmented control `Edit · Review · Approve · Publish · View`. Modes that are not permitted for the current state or current user role are visibly disabled with tooltip explaining why.

The top bar **never scrolls away**, ensuring the user always sees the policy ID, version, stage, and compliance state.

---

## 4. Left Panel (width 280px, collapsible)

Three vertical sections, separated by 16px:

### 4.1 Lifecycle Stages

A stacked nav showing every stage with a count badge:

```
DRAFTING                 12
INTERNAL REVIEW           7
COMPLIANCE REVIEW         3
PENDING APPROVAL          5
APPROVED FOR PUBLISH      2
PUBLISHED                 1
ACTIVE                  214
UNDER REVISION            4
ARCHIVED               (61)
```

Stage rows highlight on selection with `accent.orange` left border (3px). Counts update live from store selectors.

### 4.2 Role Queues

The user's role-specific queues from §3 of the Workflow Design document. Each queue shows count and SLA risk dot.

```
MY DRAFTS                 3   ●
AWAITING MY REVIEW        7   ● ●
AWAITING MY SIGNATURE     2   ●
OVERDUE                   1   ●
```

Risk dots: green (none at risk), amber (≥1 at-risk), red (≥1 overdue).

### 4.3 Filters

Compact accordion: Tier · Domain · Owner · Review Cadence · Audience Role. Selections stack as removable chips above the queue list. State persists per session.

---

## 5. Main Workspace (center)

### 5.1 Mode Tabs

A horizontally segmented control at top of the center pane: `Edit  ·  Review  ·  Approve  ·  Publish  ·  View`. Visual:

- Active tab: navy underline 2px, navy text.
- Inactive: `ink.secondary` text.
- Disabled: muted, with tooltip ("Approval mode unlocks once Compliance Review completes").

### 5.2 Section Navigator (left edge of center pane, width 200px)

Vertical list of EN-FM-004 sections. Each row shows:

- Section title
- Status dot (filled = has content, hollow = empty/required)
- Comment count chip (`3` if comments on that section)

Click scrolls the editor to the section. Reordering is disabled (template enforced).

### 5.3 Editor / Viewer

- **Edit mode:** Rich-text editor with the EN-FM-004 schema. Inline reference autocomplete on `EN-FM-`, `42 CFR §`, `CA H&S §`. Inline broken-reference warnings. Section headers are sticky inside the scroll area.
- **Review mode:** Same canvas, but read-only. Comment layer overlays text — highlighted ranges with colored underline (Required = orange, Suggestion = navy, General = muted). Hover on a range opens the comment popover; click pins the thread to the right rail.
- **Approve mode:** Read-only canvas; right rail switches to Required Approvals card (see §6.1).
- **Publish mode:** Read-only canvas with version banner ("This view is the locked, approved version 6.1"); right rail switches to Publish Readiness (see §6.5).
- **View mode:** Identical to today's PolicyDetailPage tabs but rendered in this same pane; no full-page navigation. `?asOf=YYYY-MM-DD` allows historical view of the version that was active on that date.

### 5.4 Diff Lens (overlay)

A `Compare to v6.0` button in the top-right of the editor opens a split view: previous version (left) vs current (right), with side-by-side scroll sync and changed lines highlighted in `accent.orange-soft`. ESC closes.

### 5.5 Policy Metadata Strip (above editor)

A compact 1-row strip showing key metadata: Tier, Domain, Owner, Review Cadence, Effective Date, Supersedes. Click any chip to edit (only in Edit mode); chips are read-only in other modes.

---

## 6. Right Panel (width 360px, collapsible)

The right panel is **mode-aware**: cards swap based on mode but always render in the same vertical order:

### 6.1 Required Approvals (Approve mode primary)

See [04-Efficiency-Workflow-Design.md §6](04-Efficiency-Workflow-Design.md). One row per `ApprovalRequirement` with role, signer, signed-on date, and inline Sign button. Failed guards show inline in red text below the row.

### 6.2 eCIgn Signatures

History list of all signatures captured for this version: signer, role, hash (truncated, click to copy full), timestamp. Embeds the existing `FormSignatureFlow` component when a new signature is requested.

### 6.3 Evidence Checklist

A scrollable checklist of all evidence the version requires:

- `EN-FM-002 Master Index entry` — with link
- `EN-FM-003 Change Request` — with link
- `EN-FM-005 Review Comment Log` — auto-generated
- `EN-FM-006 Legal/Compliance Sign-Off` — attach button
- `GV-FM-005 Governing Body Minutes` — attach button (REQUIRED tier only)
- Acknowledgment assignments — auto-generated on Activate

Each row: green checkmark when satisfied, orange `Attach` action when missing.

### 6.4 Audit Trail

Reverse-chronological list of `audit_event` rows for this version. Each row: action verb, actor, timestamp, hash dot. Click expands to show payload JSON. Filter chips at top: `All · Edits · Comments · Signatures · Transitions`.

### 6.5 Publish Readiness (Publish mode primary)

The checklist from [04 §7](04-Efficiency-Workflow-Design.md). Each row green/red. The single **Activate version X.Y** button at the bottom is `accent.orange` solid when all rows green; otherwise disabled and shows reason on hover.

---

## 7. Required-Comment Dock

A **persistent footer strip** (height 44px) that appears only when there are unresolved Required comments on the current version:

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│  ⚠  3 Required comments unresolved   [ Jump to next ]   [ Resolve all (author) ]  │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Color: `accent.orange-soft` background, `accent.orange` left border 3px. Disappears when count = 0.

---

## 8. Batch Bar

When the user multi-selects rows in the queue (left panel), a footer strip replaces the dock:

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│  ◉  4 selected   ·   Run Annual Review   ·   Mark No Change   ·   Bulk Approve   │
│                                                                  ·  Reassign       │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Disabled actions show a tooltip with the failing condition (e.g. "Bulk Approve: 1 selection is not in Pending Approval").

---

## 9. Empty / Loading / Error States

- **Empty queues:** Outfit Light 18px headline + 14px body explaining what state must occur. No illustrations; whitespace and a single primary action button.
- **Loading:** Skeleton blocks matching the rendered layout (top bar 56px, left rail rows, center editor, right rail cards). Never spinners on the page level — only on individual eCIgn captures and Activate.
- **Errors:** Inline within the affected card; never modal. Errors that block a transition surface in the right rail with `state.danger` border and a retry CTA.

---

## 10. Accessibility

- WCAG 2.1 AA for all color pairs in this token set.
- Every action reachable by keyboard (see shortcut table in [04 §11](04-Efficiency-Workflow-Design.md)).
- Mode toggle is a real `<select>` for screen readers; keyboard shortcuts have an accessible `aria-keyshortcuts`.
- Focus ring: 2px `accent.navy` with 2px offset on every interactive element; never removed.
- Right-rail cards announce live updates (`aria-live=polite`) when audit-trail row appears or a signature is captured.

---

## 11. What's Explicitly Out

- No tab graveyards (today's `/library/:id` 7-tab pattern is replaced by mode tabs + section navigator).
- No status as a checkbox/checklist UI without a state-machine action behind it.
- No disconnected pages — every link inside the workspace stays in the workspace.
- No emojis. No skeuomorphic treatments. No gradient buttons.
- No "Deprecated" badge or status anywhere in the visual system.

The compliance enforcement that backs every UI decision is in [06-Compliance-Enforcement-Model.md](06-Compliance-Enforcement-Model.md).
