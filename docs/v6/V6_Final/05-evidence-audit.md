# 05 - Evidence Center + Audit Mode (evidence-center, audit-mode)

**View Registrations:**
- `evidence-center` (group: "Compliance Execution (CES)")
  - Route: `/evidence`
  - Icon: `folder-open`
  - Template: `evidence`
  - Description: "Evidence repository for policies, forms, eCIgn certificates, source files, audit indexes, and retention state."
- `audit-mode` (group: "Compliance Execution (CES)")
  - Route: `/audit`
  - Icon: `scan-search`
  - Template: `evidence`
  - Description: "Read-only audit queue for readiness states, missing evidence, pending approvals, and certified locked packets."

**PNG Confirmation:** File exists at `Reference/V6/05-evidence-audit.png` (read via tool returns shell + overlay; content dynamic from index.html EvidencePrototype + metrics row). File size consistent with peer V6 captures (~96kB range).

## Layout & Structure
- Shared prototype shell: sidebar, TopBar (group ToneBadge "Compliance Execution (CES)", title, description).
- Generic metrics row (4 MetricTiles) rendered before content (since template !== 'dashboard').
- EvidencePrototype render (~2580-2624): `grid grid-cols-1 gap-6 xl:grid-cols-5`
  - Left (xl:col-span-3): rounded-2xl border bg-white p-5 shadow-soft
    - h3: evidenceTitle (e.g. "Evidence hierarchy" or "Audit health queue")
    - p: evidenceDescription
    - space-y-3 list of row divs
  - Right (xl:col-span-2): rounded-2xl border bg-white p-5 shadow-soft
    - h3: auditPacketTitle || 'Audit packet'
    - 2-col grid of auditPacketTiles (value large teal, label uppercase small)
    - Full-width "Generate packet" button (teal-50 border teal-100)
- Evidence rows use identical markup for both views (view.evidenceRows overrides defaults).

## Evidence Lists & Audit Items (from constants ~512-527)
**auditEvidenceRows (for audit-mode):**
- ['QAPI Committee Review Packet', 'QA-WF-03', 'Ready to certify', 'teal']
- ['Governing Body minutes signature', 'GV-FM-005', 'Pending approval', 'orange']
- ['TB screening contractor file', 'HR-FM-012', 'Missing evidence', 'orange']
- ['Emergency drill after-action', 'RM-WF-04', 'Certified locked', 'green']
- ['HIPAA training completion roster', 'HR-TR-101', 'Ready to certify', 'teal']

**evidenceCenterRows (for evidence-center):**
- ['Signed policy packet', 'GV-GB-001', 'EVIDENCE_LOCKED', 'teal']
- ['Meeting minutes', 'GV-FM-005', 'PENDING_UPLOAD', 'orange']
- ['QAPI report', 'QA-QM-001', 'VALIDATED', 'teal']
- ['Training attestation', 'EN-FM-001', 'VALIDATING', 'amber']
- ['eCIgn certificate packet', 'GV-FM-006', 'PROMOTED', 'green']
- ['Survey rollup export', 'AU-2026-0618', 'EXPORTED', 'teal']

## Row UI Details
- Container: flex items-center justify-between rounded-xl border border-brand-neutral-100 bg-brand-neutral-50 p-4
- Left: 
  - div.text-sm.font-bold.text-brand-teal-600 = row[0] (title)
  - div.mt-1.text-xs.text-brand-neutral-400 = row[1] (ref ID)
- Right: `<ToneBadge tone={row[3].toLowerCase()}>{row[2]}</ToneBadge>`
- States shown: EVIDENCE_LOCKED, PENDING_UPLOAD, VALIDATED, VALIDATING, PROMOTED, EXPORTED, Ready to certify, Pending approval, Missing evidence, Certified locked

## Audit Packet Tiles (right panel)
Default:
- ['Policies', '269']
- ['Forms', '128']
- ['Evidence', '445']
- ['Approvals', '72']
- Tiles: rounded-xl border bg-neutral-50 p-4; value 2xl font-extrabold teal-500; label [10px] uppercase tracking-wider neutral-400
- CTAs: "Generate packet" (uppercase tracking-wider)

## Metrics (top row per view)
**audit-mode:**
- metric('Audit ready', '18', 'Instances in view', 'teal')
- metric('Missing evidence', '2', 'Requires upload', 'orange')
- metric('Pending approval', '4', 'Awaiting approver', 'amber')
- metric('Certified locked', '12', 'Final audit state', 'green')

**evidence-center:**
- metric('Artifacts', '445', 'Indexed and searchable', 'teal')
- metric('Locked', '318', 'Hash and certificate saved', 'green')
- metric('Needs upload', '11', 'Owner action required', 'orange')
- metric('Retention', '7 yrs', 'Default compliance window', 'teal')

## Tones (global `tones` map ~129)
- teal: tile bg-brand-teal-50 border-teal-100, badge teal-50 border-teal-100, dot/bar teal-500 (locked, validated, ready, certified)
- orange: bg-orange-50 border-orange-100, dot/bar orange-500 (pending, missing, upload)
- green: bg-emerald-50 border-emerald-100, dot/bar emerald-500 (promoted, certified locked, exported)
- amber: bg-amber-50 border-amber-100, dot/bar amber-500 (validating)
- Consistent: ToneBadge renders dot + uppercase text; used in rows + metrics + header badges

## Progress
- No inline progress bars in EvidencePrototype rows (contrast with action rows/SurfaceCards elsewhere).
- Progress motif present in related CES cards (e.g. 84%, 48%, 91% on report surfaces) and top metrics imply state completeness.
- Evidence states themselves encode progress/audit posture (LOCKED=complete; PENDING=action required).

## Components Used
- EvidencePrototype, MetricTile (colored tiles), ToneBadge, SurfaceCard (elsewhere), shared AppShell/TopBar.
- No DataTable here (used in matrix/admin views); list-of-cards + tiles pattern.
- Icons via lucide (folder-open, scan-search).

**Source Sections:** VIEW_GROUPS ~1280 (audit), ~1292 (evidence), auditEvidenceRows/evidenceCenterRows ~512, EvidencePrototype ~2580, tones ~129, renderTemplate ~4220, metrics render ~4594, PageHeader ~4371.

## Key UI Elements (per PNG/code)
- Rounded-2xl cards, shadow-soft, brand-neutral-50 list bg.
- Calm compliance tones; status via badges (not heavy icons in list).
- Responsive xl: 3/2 split; stacks on smaller.
- "Evidence hierarchy" + "Audit packet" focus. Retention/hash traceability emphasized in copy.
