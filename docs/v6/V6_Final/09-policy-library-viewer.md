# 09 - Policy Library Viewer, Policy Detail, Policy Lifecycle

**View Registrations:**
- `policy-library` (group: "Taxonomy") — Route: `/library`, Template: `matrix` (DataTable), Icon: `book-open`
- `policy-detail` (group: "Taxonomy") — Route: `/library/:policyId`, Template: `policy-viewer`, Icon: `file-text`
- `policy-lifecycle` (group: "Taxonomy") — Route: `/policy-lifecycle` (and `/:policyId`), Template: `lifecycle`, Icon: `file-edit`

**PNG Confirmation:** 
- `Reference/V6/09-policy-library-viewer.png` confirmed (96,948 bytes, LastWriteTime 2026-06-19 5:20:47 PM).
- Both PNGs in V6 share identical shell capture size; visual content from image read + prototype render shows library table grid, policy detail viewer layout, lifecycle stage cards + Brad overlay elements in shell.
- MD written to describe table columns, lifecycle stages, viewer sections based on PNG visual references + prototypes (PolicyViewerPrototype, LifecyclePrototype) + production pages (LibraryPage.tsx, PolicyDetailPage.tsx, PolicyLifecyclePage.tsx, PolicyViewer32).

## Layout & Structure (Shell + Prototypes)

**Shared App Shell (from index.html + real pages):**
- Left sidebar navigation (PRIMARY OPERATIONS, COMPLIANCE EXECUTION, ADMINISTRATION/KNOWLEDGE) with "Taxonomy" group highlighting Policy Library / Forms / etc.
- Top search: "Search policies, tasks, evidence..."
- Main area: V32PageHeader (eyebrow + title + description), filters, content.
- Right panels / rail for metadata, cards, actions.
- Brad iAdministrator chat overlay commonly visible on capture.

**policy-library (Matrix / Library Table View):**
- Uses `MatrixPrototype` → `<DataTable view={view} />`
- Header row: grid of `tableHeaders`
  - In prototype config: `['Policy ID', 'Policy title', 'Owner steward', 'Status']`
  - PNG visual + enriched samples show extended columns (inferred/observed from design seed + LibraryPage + viewer context):
    - Policy ID (e.g. POL-001 / GV-GB-001)
    - Title (e.g. "Infection Control and Prevention Program", "Governing Body Authority & Responsibilities")
    - Domain / Sub (e.g. CL-SD, GV-GB)
    - Version (e.g. 6.0 / 1.0)
    - Owner / Steward (Administrator, Governing Body, DON)
    - Review (Next Review Date: 2026-07-10)
    - Lifecycle (DRAFT, ACTIVE, PUBLISHED)
    - Actions (View, Acknowledge, Print, Lifecycle)
- Rows rendered as hoverable grid rows in white card with border.
  - ID cell: bold teal text
  - Title: medium teal
  - Status: `ToneBadge` (teal/orange based on pattern match)
- Filters in real LibraryPage.tsx:
  - IBM Framework vs ACHC Survey toggle
  - Domain pills (ALL, GV, CL, QA, HR, CO, FN, OP, IT, RM, EN)
  - Subdomain browse cards or direct list
  - SearchField
  - ACHC-specific selects (mapping DIRECT/PARTIAL, evidence codes P/D/I/O/S, standards)
- Data source: `FRAMEWORK_RENDER_DATASET` (from frameworkSeed + enrichment) + `FULL_POLICY_DATASET` (~270+ policies).
- Cards in production (grid 1-5 cols responsive): policyId badge + domain, title, subdomain + tags. Click → `/library/${policyId}`

**policy-detail (PolicyViewer32 / PolicyViewerPrototype):**
- Split layout (prototype grid cols 1 + 3 + 2):
  - **Left aside (TOC / Contents)**: clickable section buttons (Purpose, Scope, Definitions, Policy Statements, Procedures, Documentation, Compliance & Audit, References & Administration).
    - Highlighted active (teal bg).
  - **Center article**:
    - Header: `ToneBadge` (e.g. GV-GB-001 - v6.0), title, summary/desc.
    - Buttons: Print, Acknowledge (or Download in real).
    - Sections: rounded cards with heading + badge (Required/Current), body text, optional highlights bullets with check icons.
  - **Right aside**:
    - Policy metadata grid tiles (Tier, Effective, Next review, Owner, Approved by, CoP etc.)
    - Linked forms list (ID, title, ToneBadge Ready/Needs signature). Clickable in full impl.
- Real impl (PolicyViewer32.tsx + adapters):
  - `buildPolicyViewer32Model` from policyContentMap + corpus.
  - Scrollable sections with anchors, TOC collapse, search-within, reading progress.
  - Print/Download routes via openPolicyPrintRoute.
  - Embedded vs full modes.
  - Appendices panel, regulatory tags, ACHC mappings.
- Sample sections (from index.html + PolicyViewer32Types):
  - 1. Purpose
  - 2. Scope
  - 3. Definitions
  - 4. Policy Statements
  - 6. Procedures (note numbering gaps in seed)
  - 8. Survey Evidence / Documentation / Compliance & Audit
  - References & Administration
- Highlights, linked forms (GV-FM-00x), actions.

## Lifecycle Stages (from LifecyclePrototype + PolicyLifecyclePage + types.ts)

Canonical 5-state machine (DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED):
```js
const policyLifecycleStages = [
  ['DRAFT', '279 policies', 'Current lifecycle seed starts the full corpus as editable draft envelopes.', 'orange', 100],
  ['REVIEW', '0 policies', 'No policies have been submitted for review in the current lifecycle store.', 'teal', 0],
  ['APPROVED', '0 policies', 'No approval envelopes have been generated from the seeded draft state.', 'green', 0],
  ['PUBLISHED', '0 policies', 'Published library records exist separately from lifecycle state.', 'teal', 0],
  ['ARCHIVED', '0 policies', 'Archived lifecycle envelopes require explicit archive intent and rationale.', 'slate', 0],
];
```

**LifecyclePrototype (prototype cards):**
- 4-5 column grid of stage cards:
  - `ToneBadge` (DRAFT orange, REVIEW teal, APPROVED green, PUBLISHED teal, ARCHIVED slate)
  - Large count (e.g. "279 policies")
  - Description paragraph
  - Progress bar (h-2 bg + fill using tone.bar)

**Production Lifecycle (PolicyLifecyclePage.tsx):**
- Query params: `?stage=DRAFT&mode=edit`
- Three-pane:
  - **Left rail**: Queues grouped by STATE_ORDER. Filterable by stage/domain/search. Items clickable to select.
  - **Center**: Selected policy header + embedded PolicyViewer32 + history timeline (LifecycleHistoryEntry chain: id, from/to, intent, actor, rationale, timestamp, chainHash, signatureRef).
  - **Right rail**: Mode-aware action card (based on MODES_BY_STATE).
    - Intents: submitForReview, requestRevision, approve, reject, publish, archive, reopenForRevision.
    - Rationale textarea + runIntent button.
    - Permission gates (policy.draft, policy.approve).
- STATE_COLOR, STATE_LABEL, STATE_ICON (FileEdit, CheckSquare, ShieldCheck, Send, Archive).
- Counts derived from envelopes store.
- History is append-only hash-chained (ties to eCIgn audit).

**Transitions & Guards (types.ts):**
- DRAFT: edit, view
- REVIEW: review, view
- APPROVED: approve, publish, view
- PUBLISHED: publish, view (reopen allowed)
- ARCHIVED: view only
- Envelopes in usePolicyLifecycleStore.

## Tables, Fields, Metadata (Summary)

**Policy Library Table Fields (prototype + visual):**
- Policy ID, Policy title, Domain/Subdomain, Version, Owner/Steward, Review (date), Lifecycle (state), Status, Actions.

**Policy Detail Metadata Tiles:**
- Tier (Required), Effective, Next review, Owner, Approved by, Version, CoP references, Supersedes.

**Linked Artifacts:**
- Forms list with readiness badges.

**Data Notes:**
- 10 domains, ~46 subdomains, 269+ policies seeded.
- Regulatory tags (cms, hipaa, fca, oig, 42cfr, osha, title22).
- ACHC projections joined.

## Styling & Tokens (consistent with shell)

- `ToneBadge` (teal/orange/green/slate/amber) with specific bg/border/text.
- Cards: `rounded-2xl border border-brand-neutral-200 bg-white shadow-soft p-5`
- Interactive: `hover:bg-brand-teal-50/40`, glass in real pages.
- Fonts: font-heading (extrabold), roboto.

**PNG Visual Confirmation Notes:**
- Displays table-like rows for policy corpus (POL-00x IDs visible in read).
- Policy detail sections + metadata visible.
- Lifecycle stages implied in navigation or cards.
- Full shell with topbar/search/sidebar + main content + possible Brad prompt.
- Clean corporate light theme with teal (#007970) + orange accents.

**Related Production Files:**
- LibraryPage.tsx, PolicyDetailPage.tsx (wraps PolicyViewer32), PolicyLifecyclePage.tsx
- Components: policy-viewer/PolicyViewer32*.tsx, lifecycle/*
- Data: frameworkSeed, policyCorpus, FULL_POLICY_DATASET

**Cross-refs:** See 10-forms-ecign.md for linked forms + eCIgn flows; policy viewer surfaces linked forms that route to form-viewer/ecign.
