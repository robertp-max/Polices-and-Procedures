import { AlertTriangle, ClipboardCheck, Download, ExternalLink, FileCheck2, FileText, History, Link2, LockKeyhole, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, ToneTag, toneSoftTileClasses, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Badge, Button, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';

interface HashStep {
  detail: string;
  icon: LucideIcon;
  label: string;
  status: string;
  tone: Tone;
}

interface LinkedReferenceRow extends Record<string, string> {
  itemId: string;
  relationship: string;
  status: string;
  title: string;
  type: string;
}

interface MetadataItem {
  label: string;
  tone?: Tone;
  value: string;
}

interface ReviewCard extends SurfaceCardData {
  facts: readonly [string, string][];
}

const referenceMetrics: readonly MetricTileData[] = [
  { label: 'Mandates', value: '9', helper: 'Compliance obligations indexed', tone: 'teal' },
  { label: 'Hash state', value: 'Valid', helper: 'Snapshot and source chain match', tone: 'green' },
  { label: 'Linked items', value: '11', helper: 'Policies, forms, and evidence rows', tone: 'orange' },
  { label: 'Review cards', value: '4', helper: 'Right-rail owner checks', tone: 'teal' },
];

const sourceMetadata: readonly MetadataItem[] = [
  { label: 'Reference ID', tone: 'teal', value: 'REF-CMS-484-105-A' },
  { label: 'Source title', value: '42 CFR 484.105 - Organization and administration of services' },
  { label: 'Source family', value: 'CMS Conditions of Participation' },
  { label: 'Jurisdiction', value: 'Federal / Home Health Agency' },
  { label: 'Steward', value: 'Compliance Officer' },
  { label: 'Verified date', value: '2026-06-20 static snapshot' },
  { label: 'Retention rule', value: 'Attach citation snapshot to policy packet for 7 years from lock date' },
  { label: 'Content hash', tone: 'green', value: 'sha256: 7f4c9d21b8a0...ab42' },
];

const mandateHighlights = [
  {
    body: 'Governing body accountability and administrator delegation must be visible in policy, minutes, and approval packets.',
    label: 'Governance authority',
    status: 'validated',
    tone: 'teal',
  },
  {
    body: 'Agency services, personnel qualifications, and operational oversight need traceable source evidence before packet lock.',
    label: 'Operational oversight',
    status: 'ready',
    tone: 'green',
  },
  {
    body: 'Annual review cadence remains open until the policy council confirms linked forms and evidence retention.',
    label: 'Review cadence',
    status: 'review-required',
    tone: 'orange',
  },
] as const satisfies readonly { body: string; label: string; status: string; tone: Tone }[];

const hashSteps: readonly HashStep[] = [
  {
    detail: 'Reference text captured from the approved citation snapshot and normalized for viewer display.',
    icon: FileText,
    label: 'Source snapshot',
    status: 'validated',
    tone: 'green',
  },
  {
    detail: 'Citation metadata, title, jurisdiction, and steward fields match the taxonomy reference index.',
    icon: ClipboardCheck,
    label: 'Metadata match',
    status: 'ready',
    tone: 'teal',
  },
  {
    detail: 'Linked policy and form rows are attached; one owner review remains before final packet lock.',
    icon: AlertTriangle,
    label: 'Owner review',
    status: 'review-required',
    tone: 'orange',
  },
  {
    detail: 'Hash chain is locked for read-only audit use after reviewer sign-off.',
    icon: LockKeyhole,
    label: 'Packet lock',
    status: 'awaiting',
    tone: 'amber',
  },
];

const linkedReferenceColumns: readonly DataTableColumn<LinkedReferenceRow>[] = [
  { key: 'itemId', label: 'Item ID' },
  { key: 'title', label: 'Linked policy / form' },
  { key: 'type', label: 'Type' },
  { key: 'relationship', label: 'Relationship' },
  { key: 'status', label: 'Status', status: true },
];

const linkedReferenceRows: readonly LinkedReferenceRow[] = [
  {
    itemId: 'GV-GB-001',
    relationship: 'Primary policy',
    status: 'ready',
    title: 'Governing Body Authority & Responsibilities',
    type: 'Policy',
  },
  {
    itemId: 'GV-FM-005',
    relationship: 'Meeting evidence',
    status: 'validated',
    title: 'Governing Body Minutes Checklist',
    type: 'Form',
  },
  {
    itemId: 'GV-FM-006',
    relationship: 'Disclosure packet',
    status: 'review-required',
    title: 'Conflict of Interest Disclosure',
    type: 'Form',
  },
  {
    itemId: 'QA-QM-004',
    relationship: 'QAPI oversight support',
    status: 'active',
    title: 'QAPI Indicator Review',
    type: 'Policy',
  },
  {
    itemId: 'EV-4519',
    relationship: 'Survey packet artifact',
    status: 'uploaded',
    title: 'Signed Policy Packet Evidence',
    type: 'Artifact',
  },
];

const reviewCards: readonly ReviewCard[] = [
  {
    body: 'Mandate extraction is complete and tied to policy owner, governing body minutes, and survey packet evidence.',
    facts: [
      ['Mandates', '9 extracted'],
      ['Owner', 'Compliance Officer'],
      ['Next action', 'Confirm final disclosure form'],
    ],
    icon: ShieldCheck,
    progress: 91,
    status: 'validated',
    title: 'Mandate review',
    tone: 'green',
  },
  {
    body: 'Source lineage is clean; the current citation snapshot and viewer metadata resolve to the same content hash.',
    facts: [
      ['Hash', '7f4c9d...ab42'],
      ['Method', 'sha256'],
      ['Audit use', 'Read-only'],
    ],
    icon: History,
    progress: 96,
    status: 'validated',
    title: 'Evidence hash',
    tone: 'teal',
  },
  {
    body: 'One linked disclosure needs owner review before this reference can be included in the final survey packet.',
    facts: [
      ['Blocking item', 'GV-FM-006'],
      ['Reviewer', 'Administrator'],
      ['Window', 'Before packet lock'],
    ],
    icon: AlertTriangle,
    progress: 68,
    status: 'review-required',
    title: 'Open review',
    tone: 'orange',
  },
  {
    body: 'Download remains permission-gated to users with reference read access and packet export responsibility.',
    facts: [
      ['Permission', 'reference.read'],
      ['Export', 'Citation packet'],
      ['Mode', 'Viewer only'],
    ],
    icon: Download,
    progress: 74,
    status: 'awaiting',
    title: 'Export gate',
    tone: 'amber',
  },
];

const sourceLinks = [
  ['Policy detail', 'GV-GB-001 active viewer', 'ready'],
  ['Form workspace', 'GV-FM-006 disclosure review', 'review-required'],
  ['Artifact packet', 'EV-4519 signed evidence', 'uploaded'],
] as const;

export function GenericReferenceScreen() {
  return (
    <div
      className="grid gap-xl"
      data-hash-id="generic-reference"
      data-route="/viewer/:referenceId"
      data-template="reference-viewer"
    >


      <MetricGrid metrics={referenceMetrics} />

      {/* PDF / Image Preview Toolbar */}
      <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-md overflow-hidden shadow-rest flex flex-wrap items-center justify-between gap-md sticky top-[88px] z-sticky backdrop-blur-md">
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs border-r border-hairline pr-md">
            <Button size="sm" variant="secondary">Zoom Out (-)</Button>
            <span className="text-xs text-secondary font-medium px-xs">100%</span>
            <Button size="sm" variant="secondary">Zoom In (+)</Button>
          </div>
          <div className="flex items-center gap-xs border-r border-hairline pr-md">
            <Button size="sm" variant="secondary">Rotate ↺</Button>
            <Button size="sm" variant="secondary">Rotate ↻</Button>
          </div>
          <div className="flex items-center gap-xs">
            <Button
              className="border-brand-teal text-brand-teal hover:bg-surface-hover font-light"
              size="sm"
              variant="secondary"
              onClick={() => alert('SHA-256: 7f4c9d21b8a0147afbf4c8996fb92427ae41e4649b934ca495991b7852b855a\nStatus: Verified Integrity Anchor')}
            >
              Verify Hash SHA-256
            </Button>
          </div>
        </div>
        <div>
          <Button
            className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange/95 font-light"
            size="sm"
            iconLeft={<Download className="h-icon-sm w-icon-sm" />}
          >
            Download Source PDF
          </Button>
        </div>
      </section>

      <section className="grid gap-xl desktop:grid-cols-1">
        <div className="grid content-start gap-lg">
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="reference-source-title">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div className="grid gap-sm">
                <ToneTag tone="teal">Source metadata</ToneTag>
                <div className="grid gap-xs">
                  <h2 className="text-h2 font-medium text-ink" id="reference-source-title">
                    CMS organization reference
                  </h2>
                  <p className="max-w-content text-sm text-muted">
                    Static V6 reference viewer content showing citation details, steward ownership, verified snapshot state, and
                    packet-retention context.
                  </p>
                </div>
              </div>
              <Button
                iconRight={<ExternalLink aria-hidden="true" className="h-icon-sm w-icon-sm" />}
                size="sm"
                variant="secondary"
              >
                Source index
              </Button>
            </div>

            <dl className="grid gap-md tablet-l:grid-cols-2">
              {sourceMetadata.map((item) => (
                <MetadataTile item={item} key={item.label} />
              ))}
            </dl>
          </section>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="mandate-title">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="mandate-title">
                  Citation mandate highlights
                </h2>
                <p className="max-w-content text-sm text-muted">
                  Core obligations are summarized for survey review while preserving links to the original source snapshot.
                </p>
              </div>
              <ToneTag tone="green">3 primary focus areas</ToneTag>
            </div>

            <div className="grid gap-md tablet-l:grid-cols-3">
              {mandateHighlights.map((highlight) => (
                <article className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg overflow-hidden" key={highlight.label}>
                  <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
                    <h3 className="text-body font-light text-ink">{highlight.label}</h3>
                    <ToneBadge size="sm" status={highlight.status} />
                  </div>
                  <p className="text-sm text-muted">{highlight.body}</p>
                  <div className="mt-md">
                    <ToneTag tone={highlight.tone}>Mandate</ToneTag>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="linked-items-title">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="linked-items-title">
                  Linked policies, forms, and artifacts
                </h2>
                <p className="max-w-content text-sm text-muted">
                  Representative rows connect the source reference to policy detail, form viewer, and artifact viewer surfaces.
                </p>
              </div>
              <Badge variant="count">5 shown / 11 linked</Badge>
            </div>

            <DataTable columns={linkedReferenceColumns} label="Linked policies forms and artifacts" rows={linkedReferenceRows} />
          </section>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="hash-state-title">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="hash-state-title">
                  Evidence and hash state
                </h2>
                <p className="max-w-content text-sm text-muted">
                  The reference-viewer template keeps verification visible without turning the read-only source into an editor.
                </p>
              </div>
              <ToneBadge size="sm" status="validated" />
            </div>

            <div className="grid gap-md tablet-l:grid-cols-2">
              {hashSteps.map((step) => (
                <HashStateStep step={step} key={step.label} />
              ))}
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-lg" aria-label="Reference review cards">
          {reviewCards.map((card) => (
            <SurfaceCard card={card} key={card.title}>
              <dl className="grid gap-sm border-t border-hairline pt-md">
                {card.facts.map(([label, value]) => (
                  <div className="grid gap-xs" key={label}>
                    <dt className="text-tag uppercase tracking-tag text-brand-teal">{label}</dt>
                    <dd className="text-sm text-secondary">{value}</dd>
                  </div>
                ))}
              </dl>
            </SurfaceCard>
          ))}

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="source-links-title">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                <Link2 aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="source-links-title">
                  Related sources
                </h2>
                <p className="text-sm text-muted">Right-side review links for the coordinator-owned route import.</p>
              </div>
            </div>
            <div className="grid gap-sm">
              {sourceLinks.map(([label, detail, status]) => (
                <div className="rounded-md border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-md" key={label}>
                  <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                    <p className="text-tag uppercase tracking-tag text-secondary">{label}</p>
                    <ToneBadge size="sm" status={status} />
                  </div>
                  <p className="text-sm text-ink">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="reference-actions-title">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-orange-bg text-tone-orange-text">
                <FileCheck2 aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="reference-actions-title">
                  Review actions
                </h2>
                <p className="text-sm text-muted">Mock actions expose the template interaction points without wiring data mutations.</p>
              </div>
            </div>
            <div className="grid gap-sm">
              <Button iconLeft={<Download aria-hidden="true" className="h-icon-sm w-icon-sm" />} variant="secondary">
                Download citation packet
              </Button>
              <Button iconLeft={<Workflow aria-hidden="true" className="h-icon-sm w-icon-sm" />} variant="tertiary">
                Send to policy council
              </Button>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function HashStateStep({ step }: { step: HashStep }) {
  const Icon = step.icon;

  return (
    <article className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg overflow-hidden">
      <div className="mb-md flex items-start justify-between gap-md">
        <span className={cx('grid h-tap w-tap place-items-center rounded-md', toneSoftTileClasses[step.tone])}>
          <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
        </span>
        <ToneBadge size="sm" status={step.status} />
      </div>
      <h3 className="text-body font-light text-ink">{step.label}</h3>
      <p className="mt-sm text-sm text-muted">{step.detail}</p>
    </article>
  );
}

function MetadataTile({ item }: { item: MetadataItem }) {
  return (
    <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg overflow-hidden">
      <dt className="text-tag uppercase tracking-tag text-secondary">{item.label}</dt>
      <dd className="mt-sm break-words text-sm text-ink">
        {item.tone ? <ToneTag tone={item.tone}>{item.value}</ToneTag> : item.value}
      </dd>
    </div>
  );
}

export default GenericReferenceScreen;
