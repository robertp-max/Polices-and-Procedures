import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardCheck, FileCheck2, FileText, History, Link2, ShieldCheck, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, ToneBadge } from '../../primitives';
import { DataTable, ProgressMeter, SurfaceCard, ToneTag, type DataTableColumn, type SurfaceCardData } from '../../components';
import { cx } from '../../utils/classNames';

const routeMarker = {
  group: 'Taxonomy',
  hashId: 'policy-detail',
  path: '/library/:policyId',
  template: 'detail',
} as const;

const policy = {
  approvedBy: 'Governing Body Chair',
  effective: '2026-06-01',
  id: 'GV-GB-001',
  nextReview: '2027-06-01',
  owner: 'Administrator',
  title: 'Governing Body Authority & Responsibilities',
  version: '6.0',
} as const;

const metadataItems: readonly (readonly [string, string])[] = [
  ['Domain', 'GV - Governance'],
  ['Subdomain', 'GB - Governing Body'],
  ['Version', policy.version],
  ['Effective', policy.effective],
  ['Next review', policy.nextReview],
  ['Owner steward', policy.owner],
  ['Approved by', policy.approvedBy],
  ['Regulatory anchors', '42 CFR 484.105, ACHC HH1-1A, Title 22'],
];

const policyTabs = [
  { href: '#overview-definitions', label: 'Overview & Definitions' },
  { href: '#policy-statements', label: 'Policy Statements' },
  { href: '#procedures', label: 'Procedures' },
  { href: '#documentation', label: 'Documentation' },
  { href: '#compliance-audit', label: 'Compliance & Audit' },
  { href: '#references', label: 'References & Admin' },
] as const;

const requiredCodeHeader = [
  ['Domain', 'GV - Governance & Administration'],
  ['Tier', 'Required'],
  ['Approved by', 'Governing Body Chair - Care Indeed Home Health Care, Inc.'],
  ['Supersedes', 'N/A (Initial Version)'],
  ['Required codes', '42 CFR 484.105, ACHC HH1-1A, Title 22'],
  ['Effective date', policy.effective],
  ['Last reviewed', '2026-06-01'],
  ['Next review', policy.nextReview],
  ['Version', `v${policy.version}`],
] as const;

const policySections = [
  {
    body:
      'The governing body retains ultimate authority for agency compliance, quality, fiscal stewardship, and approval of policies that direct home health operations.',
    bullets: ['Defines administrator delegation boundaries.', 'Keeps committee decisions tied to signed minutes.', 'Requires annual review of authority records.'],
    id: 'purpose',
    status: 'ready',
    title: 'Purpose',
  },
  {
    body:
      'This policy applies to governing body members, the administrator, the director of nursing, compliance leadership, and delegated committee owners.',
    bullets: ['Covers policy adoption and exception approval.', 'Includes QAPI, personnel, emergency preparedness, and patient-rights decisions.'],
    id: 'scope',
    status: 'ready',
    title: 'Scope',
  },
  {
    body:
      'The agency maintains a governing body that is legally responsible for services furnished, operational oversight, and the appointment of qualified leadership.',
    bullets: ['Minutes must show quorum, motion, second, vote, and final action.', 'Delegated authority does not remove governing body accountability.'],
    id: 'policy-statements',
    status: 'approved',
    title: 'Policy Statements',
  },
  {
    body:
      'Administrators prepare decision packets, route required disclosures, collect eCIgn signatures, and archive supporting evidence before a policy is published.',
    bullets: ['Packet owner verifies linked forms before lock.', 'Policy changes require version history and rationale.', 'Emergency changes receive retrospective governing body ratification.'],
    id: 'procedures',
    status: 'in-review',
    title: 'Procedures',
  },
  {
    body:
      'Required records include governing body minutes, appointment evidence, conflict disclosures, policy approval certificates, and survey packet exports.',
    bullets: ['Evidence files retain hash and signer metadata.', 'Linked forms remain visible from the policy detail route.', 'Audit exports use UTC timestamps and sealed packet IDs.'],
    id: 'documentation',
    status: 'uploaded',
    title: 'Documentation',
  },
  {
    body:
      'Compliance leadership reviews policy currency, evidence completeness, and survey alignment before the annual governing body packet is closed.',
    bullets: ['Open evidence gaps block packet certification.', 'ACHC references are checked during review.', 'Exceptions require documented rationale and dual approval.'],
    id: 'compliance-audit',
    status: 'review-required',
    title: 'Compliance & Audit',
  },
  {
    body:
      'Reference controls connect this policy to CMS conditions of participation, ACHC standards, California Title 22 requirements, and agency governance records.',
    bullets: ['42 CFR 484.105', 'ACHC HH1-1A and HH1-2A', 'California Title 22 governing body requirements'],
    id: 'references',
    status: 'validated',
    title: 'References',
  },
] as const;

type LinkedFormRow = Record<'id' | 'title' | 'owner' | 'status', string>;

const linkedFormColumns: readonly DataTableColumn<LinkedFormRow>[] = [
  { key: 'id', label: 'Form ID' },
  { key: 'title', label: 'Linked Form' },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Readiness', status: true },
];

const linkedForms: readonly LinkedFormRow[] = [
  { id: 'GV-FM-001', title: 'Governing Body Annual Attestation', owner: 'Administrator', status: 'signed' },
  { id: 'GV-FM-006', title: 'Conflict of Interest Disclosure', owner: 'Governing Body', status: 'pending' },
  { id: 'QA-FM-014', title: 'QAPI Governing Body Report', owner: 'QAPI Nurse', status: 'ready' },
  { id: 'CO-FM-003', title: 'Policy Exception Approval Log', owner: 'Compliance Officer', status: 'review-required' },
];

const lifecycleItems = [
  { label: 'Draft envelope', meta: 'Source policy text normalized', progress: 100, status: 'complete' },
  { label: 'Review packet', meta: 'Owner and compliance review sealed', progress: 100, status: 'validated' },
  { label: 'Approval certificate', meta: 'Governing body signature complete', progress: 100, status: 'approved' },
  { label: 'Publication lock', meta: 'Awaiting one linked disclosure', progress: 84, status: 'review-required' },
] as const;

const evidenceItems = [
  { label: 'Policy source hash', status: 'validated', value: 'sha256: 8d9a...f42c' },
  { label: 'Signed minutes', status: 'uploaded', value: '2026-06 governing body packet' },
  { label: 'ACHC mapping', status: 'ready', value: 'HH1-1A, HH1-2A, HH5-1A' },
  { label: 'Disclosure roster', status: 'pending', value: '1 signer outstanding' },
] as const;

const readinessCards: readonly SurfaceCardData[] = [
  {
    body: 'Policy text, references, and approval history are ready for internal review and survey packet assembly.',
    icon: ShieldCheck,
    progress: 94,
    status: 'ready',
    title: 'Survey readiness',
    tone: 'teal',
  },
  {
    body: 'One conflict disclosure remains pending before the publication lock can be fully certified.',
    icon: AlertTriangle,
    progress: 84,
    status: 'review-required',
    title: 'Publication blocker',
    tone: 'orange',
  },
  {
    body: 'Lifecycle history has a complete draft, review, approval, and evidence hash chain for audit review.',
    icon: History,
    progress: 100,
    status: 'validated',
    title: 'Version audit',
    tone: 'green',
  },
];

export function PolicyDetailScreen() {
  return (
    <section
      aria-labelledby="policy-detail-title"
      className="grid gap-xl"
      data-hash-id={routeMarker.hashId}
      data-route={routeMarker.path}
      data-template={routeMarker.template}
    >
      <article className="relative isolate grid gap-xl overflow-visible rounded-lg border border-card bg-white/[.62] p-xl shadow-rest backdrop-blur-xl">
        <nav
          aria-label="Policy document sections"
          className="sticky top-0 z-30 -mx-xl -mt-xl flex gap-xl overflow-x-auto rounded-t-lg border-b border-hairline bg-white/[.92] px-xl pt-xl pb-xs shadow-[0_16px_30px_rgba(0,65,66,0.08)] backdrop-blur-xl after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-16 after:h-16 after:bg-gradient-to-b after:from-white after:via-white/88 after:to-transparent"
          style={{
            maskImage: 'linear-gradient(to right, black 0, black calc(100% - 44px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0, black calc(100% - 44px), transparent 100%)',
          }}
        >
          {policyTabs.map((tab, index) => (
            <a
              aria-current={index === 0 ? 'page' : undefined}
              className={cx(
                'shrink-0 border-b-2 px-xs pb-md text-sm font-medium transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                index === 0
                  ? 'border-brand-teal text-brand-teal'
                  : 'border-transparent text-secondary hover:border-tone-teal-border hover:text-brand-teal',
              )}
              href={tab.href}
              key={tab.label}
            >
              {tab.label}
            </a>
          ))}
          <Link
            className="shrink-0 border-b-2 border-transparent px-xs pb-md text-sm font-medium text-brand-teal transition duration-fast ease-standard hover:border-brand-teal focus-visible:outline-none focus-visible:shadow-focus"
            to="/journey/appendix-f"
          >
            Appendices
          </Link>
        </nav>

        <section className="grid scroll-mt-28 gap-xl" id="overview-definitions">
          <div className="grid gap-lg rounded-lg border border-card bg-tone-slate-bg/80 p-xl">
            <div className="flex flex-wrap items-start justify-between gap-lg border-b border-hairline pb-lg">
              <div className="grid gap-sm">
                <ToneTag tone="teal">
                  Policy ID: {policy.id} - Active
                </ToneTag>
                <h2 className="text-[28px] font-medium leading-tight text-ink">{policy.title}</h2>
                <p className="max-w-measure text-sm text-secondary">
                  Governing-body authority, delegation boundaries, required approvals, and survey-facing evidence controls for the canonical V6 policy library.
                </p>
              </div>
              <ToneBadge size="sm" status="validated" />
            </div>

            <dl className="grid gap-lg tablet:grid-cols-2 desktop:grid-cols-4">
              {requiredCodeHeader.map(([label, value]) => (
                <div className="min-h-row rounded-md border border-card bg-surface/80 p-md" key={label}>
                  <dt className="text-tag uppercase tracking-tag text-muted">{label}</dt>
                  <dd className={cx('mt-xs text-sm font-medium text-ink', label === 'Tier' && 'text-brand-orange')}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-lg desktop:grid-cols-2">
            {policySections.slice(0, 2).map((section, index) => (
              <section className="scroll-mt-28 rounded-lg border border-card bg-white/[.56] p-lg shadow-rest backdrop-blur-md" id={section.id} key={section.id}>
                <div className="mb-md flex items-center gap-sm">
                  <ToneTag tone="teal">{index + 1}</ToneTag>
                  <h3 className="text-h2 font-medium text-ink">{section.title}</h3>
                </div>
                <p className="text-body text-secondary">{section.body}</p>
                <ul className="mt-md grid gap-sm">
                  {section.bullets.map((bullet) => (
                    <li className="flex gap-sm text-sm text-secondary" key={bullet}>
                      <CheckCircle2 aria-hidden="true" className="mt-xs h-icon-xs w-icon-xs shrink-0 text-brand-teal" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <div className="grid gap-lg">
          {policySections.slice(2).map((section, index) => (
            <section className="scroll-mt-28 rounded-lg border border-card bg-tone-slate-bg/86 p-lg shadow-rest backdrop-blur-md" id={section.id} key={section.id}>
              <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                <div className="flex items-center gap-sm">
                  <span className="grid h-tap w-tap place-items-center rounded-md bg-surface text-brand-teal">
                    <FileText aria-hidden="true" className="h-icon-sm w-icon-sm" />
                  </span>
                  <div>
                    <p className="text-tag uppercase tracking-tag text-muted">Section {index + 3}</p>
                    <h3 className="text-h2 font-medium text-ink">{section.title}</h3>
                  </div>
                </div>
                <ToneBadge size="sm" status={section.status} />
              </div>
              <p className="text-body text-secondary">{section.body}</p>
              <ul className="mt-md grid gap-sm">
                {section.bullets.map((bullet) => (
                  <li className="flex gap-sm text-sm text-secondary" key={bullet}>
                    <CheckCircle2 aria-hidden="true" className="mt-xs h-icon-xs w-icon-xs shrink-0 text-brand-teal" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </article>

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
            <div>
              <h2 className="text-h2 font-medium text-ink">Linked Forms</h2>
              <p className="mt-xs text-sm text-muted">Forms connected to policy approval, disclosure, QAPI reporting, and exception control.</p>
            </div>
            <ToneBadge size="sm" status="review-required" />
          </div>
          <DataTable columns={linkedFormColumns} label="Linked policy forms" rows={linkedForms} />
        </section>

        <section className="rounded-lg border border-card bg-surface p-lg shadow-rest" aria-label="Evidence panel">
          <div className="mb-lg flex items-center gap-sm">
            <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-brand-teal">
              <Upload aria-hidden="true" className="h-icon-md w-icon-md" />
            </span>
            <h2 className="text-h2 font-medium text-ink">Evidence</h2>
          </div>
          <div className="grid gap-sm">
            {evidenceItems.map((item) => (
              <div className="rounded-md border border-card bg-tone-slate-bg p-md" key={item.label}>
                <div className="flex items-start justify-between gap-md">
                  <div>
                    <p className="text-sm text-ink">{item.label}</p>
                    <p className="mt-xs text-xs text-muted">{item.value}</p>
                  </div>
                  <ToneBadge size="sm" status={item.status} />
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-lg w-full" iconLeft={<Link2 aria-hidden="true" className="h-icon-sm w-icon-sm" />} variant="secondary">
            Open evidence index
          </Button>
        </section>
      </section>

      <section className="grid gap-lg desktop:grid-cols-3" aria-label="Readiness cards">
        {readinessCards.map((card) => (
          <SurfaceCard card={card} key={card.title} />
        ))}
      </section>

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-label="Policy metadata">
          <div className="mb-lg flex items-center gap-sm">
            <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-blue-bg text-tone-blue-text">
              <FileCheck2 aria-hidden="true" className="h-icon-md w-icon-md" />
            </span>
            <h2 className="text-h2 font-medium text-ink">Administrative Record</h2>
          </div>
          <dl className="grid gap-sm tablet:grid-cols-2">
            {metadataItems.map(([label, value]) => (
              <div className="rounded-md border border-card bg-tone-slate-bg p-md" key={label}>
                <dt className="text-tag uppercase tracking-tag text-muted">{label}</dt>
                <dd className="mt-xs text-sm text-secondary">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <SurfaceCard
          card={{
            body: 'DRAFT to REVIEW to APPROVED is complete; publication waits on the final disclosure form.',
            icon: History,
            progress: 84,
            status: 'review-required',
            title: 'Lifecycle panel',
            tone: 'orange',
          }}
        >
          <div className="grid gap-sm">
            {lifecycleItems.map((item) => (
              <div className="rounded-md border border-card bg-surface p-md" key={item.label}>
                <div className="flex items-start justify-between gap-md">
                  <div>
                    <p className="text-sm text-ink">{item.label}</p>
                    <p className="mt-xs text-xs text-muted">{item.meta}</p>
                  </div>
                  <ToneBadge size="sm" status={item.status} />
                </div>
                <ProgressMeter className="mt-md" label={item.label} tone={item.status === 'review-required' ? 'orange' : 'teal'} value={item.progress} />
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-label="Readiness controls">
        <div className="grid gap-lg desktop:grid-cols-3">
          <div className="rounded-lg border border-card bg-tone-teal-bg p-lg">
            <ClipboardCheck aria-hidden="true" className="h-icon-md w-icon-md text-brand-teal" />
            <h2 className="mt-md text-h2 font-medium text-ink">ACHC Mapping</h2>
            <p className="mt-sm text-sm text-secondary">Standards HH1-1A, HH1-2A, and HH5-1A are linked to policy text and evidence rows.</p>
          </div>
          <div className="rounded-lg border border-card bg-tone-orange-bg p-lg">
            <CalendarClock aria-hidden="true" className="h-icon-md w-icon-md text-brand-orange" />
            <h2 className="mt-md text-h2 font-medium text-ink">Review Cadence</h2>
            <p className="mt-sm text-sm text-secondary">Next annual review is staged with a 60-day reminder and owner steward confirmation.</p>
          </div>
          <div className="rounded-lg border border-card bg-tone-blue-bg p-lg">
            <ShieldCheck aria-hidden="true" className="h-icon-md w-icon-md text-tone-blue-text" />
            <h2 className="mt-md text-h2 font-medium text-ink">Survey Export</h2>
            <p className="mt-sm text-sm text-secondary">Print packet, linked forms, and hash evidence are prepared for read-only survey review.</p>
          </div>
        </div>
      </section>
    </section>
  );
}

export default PolicyDetailScreen;
