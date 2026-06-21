import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileCheck2,
  Landmark,
  Layers3,
  Network,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { MetricGrid, ProgressMeter, SurfaceCard, ToneTag, type MetricTileData, type SurfaceCardData } from '../../components';
import { Badge, Button, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';

interface DomainTileData {
  achcAnchors: string;
  code: string;
  description: string;
  icon: LucideIcon;
  policies: string;
  readiness: number;
  status: string;
  subdomains: string;
  title: string;
  tone: Tone;
}

interface MappingRowData {
  achc: string;
  cmsTitle22: string;
  evidence: string;
  forms: string;
  policy: string;
  standard: string;
  status: string;
  tone: Tone;
}

const frameworkMetrics: readonly MetricTileData[] = [
  { label: 'Domains', value: '10', helper: 'Top-level strategic pillars', tone: 'teal' },
  { label: 'Subdomains', value: '54', helper: 'Operating taxonomy branches', tone: 'orange' },
  { label: 'Framework policies', value: '269', helper: 'Mapped to domains and standards', tone: 'teal' },
  { label: 'Lifecycle corpus', value: '279', helper: 'Draft and active records tracked', tone: 'green' },
];

const frameworkDomains: readonly DomainTileData[] = [
  {
    achcAnchors: '18',
    code: 'GV',
    description: 'Governing body authority, administrator accountability, policy council, and agency oversight.',
    icon: Landmark,
    policies: '31',
    readiness: 94,
    status: 'ready',
    subdomains: '4',
    title: 'Governance',
    tone: 'teal',
  },
  {
    achcAnchors: '42',
    code: 'CL',
    description: 'Assessment, care planning, OASIS, medication reconciliation, and skilled visit execution.',
    icon: ClipboardCheck,
    policies: '68',
    readiness: 89,
    status: 'active',
    subdomains: '9',
    title: 'Clinical Operations',
    tone: 'teal',
  },
  {
    achcAnchors: '26',
    code: 'QA',
    description: 'QAPI indicators, incident trending, plan-of-correction follow-through, and audit cadence.',
    icon: ShieldCheck,
    policies: '34',
    readiness: 86,
    status: 'validated',
    subdomains: '6',
    title: 'Quality & Compliance',
    tone: 'green',
  },
  {
    achcAnchors: '21',
    code: 'HR',
    description: 'Hiring files, credentialing, competency validation, supervision, and personnel health checks.',
    icon: FileCheck2,
    policies: '29',
    readiness: 76,
    status: 'review-required',
    subdomains: '7',
    title: 'Human Resources',
    tone: 'orange',
  },
  {
    achcAnchors: '17',
    code: 'CO',
    description: 'Contracts, business associates, referral agreements, conflict disclosures, and vendor oversight.',
    icon: Workflow,
    policies: '18',
    readiness: 71,
    status: 'review-required',
    subdomains: '5',
    title: 'Contracts & Oversight',
    tone: 'orange',
  },
  {
    achcAnchors: '9',
    code: 'FN',
    description: 'Billing controls, cost reporting, service authorization, revenue integrity, and payer evidence.',
    icon: BookOpen,
    policies: '15',
    readiness: 83,
    status: 'active',
    subdomains: '4',
    title: 'Finance',
    tone: 'teal',
  },
  {
    achcAnchors: '24',
    code: 'OP',
    description: 'Scheduling, visit coordination, on-call coverage, intake handoffs, and field documentation flow.',
    icon: Layers3,
    policies: '37',
    readiness: 81,
    status: 'active',
    subdomains: '6',
    title: 'Operations',
    tone: 'teal',
  },
  {
    achcAnchors: '13',
    code: 'IT',
    description: 'Systems access, privacy safeguards, audit logs, continuity, and record-retention tooling.',
    icon: Network,
    policies: '16',
    readiness: 78,
    status: 'pending',
    subdomains: '4',
    title: 'Information Systems',
    tone: 'amber',
  },
  {
    achcAnchors: '16',
    code: 'RM',
    description: 'Emergency management, infection control, incident reporting, drill records, and corrective actions.',
    icon: ShieldCheck,
    policies: '23',
    readiness: 88,
    status: 'ready',
    subdomains: '5',
    title: 'Risk Management',
    tone: 'green',
  },
  {
    achcAnchors: '11',
    code: 'EN',
    description: 'Taxonomy governance, lifecycle coordination, crosswalk stewardship, and reporting metrics.',
    icon: Network,
    policies: '18',
    readiness: 91,
    status: 'complete',
    subdomains: '4',
    title: 'Enterprise Framework',
    tone: 'teal',
  },
];

const mappingRows: readonly MappingRowData[] = [
  {
    achc: 'HH1-1A.01',
    cmsTitle22: '42 CFR 484.105 / Title 22 governing-body authority',
    evidence: 'Policy, minutes, roster',
    forms: 'GV-FM-005',
    policy: 'GV-GB-001',
    standard: 'Governing body authority and administrator accountability',
    status: 'validated',
    tone: 'green',
  },
  {
    achc: 'HH5-2A.01',
    cmsTitle22: '42 CFR 484.55 / 22 CCR 74695 comprehensive assessment',
    evidence: 'Policy, OASIS, RN assessment',
    forms: 'CL-FM-001',
    policy: 'CL-CA-001',
    standard: 'Comprehensive assessment and start-of-care evidence',
    status: 'ready',
    tone: 'teal',
  },
  {
    achc: 'HH1-12A.01',
    cmsTitle22: '42 CFR 484.105(e) contract and vendor oversight',
    evidence: 'Policy, agreement, annual review',
    forms: 'GV-FM-009',
    policy: 'GV-EA-001',
    standard: 'Contract services governance and business associate review',
    status: 'review-required',
    tone: 'orange',
  },
  {
    achc: 'HH7-2A.03',
    cmsTitle22: 'Title 22 personnel file and competency documentation',
    evidence: 'Checklist, credential file, supervision log',
    forms: 'HR-FM-014',
    policy: 'HR-CG-021',
    standard: 'Personnel qualification and competency file completeness',
    status: 'pending',
    tone: 'amber',
  },
];

const contextCards: readonly SurfaceCardData[] = [
  {
    body: 'ACHC standards, CMS Conditions of Participation, and Title 22 state references are kept in one traceable architecture map.',
    icon: Network,
    progress: 92,
    status: 'validated',
    title: 'Regulatory spine',
    tone: 'teal',
  },
  {
    body: 'Partial mappings are concentrated in contracts, personnel files, and vendor review evidence.',
    icon: ShieldCheck,
    progress: 71,
    status: 'review-required',
    title: 'Reviewer focus',
    tone: 'orange',
  },
  {
    body: 'Policy Library, Forms Library, and Evidence Center inherit these domain and authority links.',
    icon: BookOpen,
    progress: 86,
    status: 'ready',
    title: 'Corpus inheritance',
    tone: 'green',
  },
];

const alignmentCards = [
  ['ACHC anchors', '197', 'Standards directly linked to policy and form evidence', 'teal'],
  ['CMS CoP refs', '64', 'Federal citations represented in the framework map', 'green'],
  ['Title 22 refs', '41', 'State references with active stewardship rows', 'orange'],
] as const satisfies readonly (readonly [string, string, string, Tone])[];

export function FrameworkScreen() {
  return (
    <div className="grid gap-xl" data-hash-id="framework" data-route="/framework" data-template="framework">
      <section className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-card bg-surface p-lg shadow-rest">
        <div className="flex flex-wrap items-center gap-sm">
          <ToneTag>/framework</ToneTag>
          <Badge>hash: framework</Badge>
          <Badge>Taxonomy</Badge>
        </div>
        <ToneBadge size="sm" status="active" />
      </section>

      <MetricGrid metrics={frameworkMetrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="grid gap-lg">
          <div className="flex flex-wrap items-end justify-between gap-md">
            <div className="grid gap-xs">
              <h2 className="text-h2 font-medium text-ink">Framework domains</h2>
              <p className="max-w-content text-sm text-muted">
                Top-level taxonomy tiles show domain ownership, policy scope, ACHC anchor density, and survey-readiness signals.
              </p>
            </div>
            <div className="flex flex-wrap gap-sm" aria-label="Framework view modes">
              <Button selected size="sm" variant="secondary">
                Grid
              </Button>
              <Button size="sm" variant="tertiary">
                Tree
              </Button>
              <Button size="sm" variant="tertiary">
                Heat
              </Button>
            </div>
          </div>

          <div className="grid gap-lg tablet-l:grid-cols-2 laptop:grid-cols-3" role="list">
            {frameworkDomains.map((domain) => (
              <DomainTile domain={domain} key={domain.code} />
            ))}
          </div>
        </section>

        <aside className="grid content-start gap-lg">
          {contextCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex items-start justify-between gap-md">
              <div>
                <ToneTag tone="orange">Authority context</ToneTag>
                <h2 className="mt-md text-h2 font-medium text-ink">ACHC / CMS / Title 22</h2>
              </div>
              <ToneBadge size="sm" status="ready" />
            </div>
            <div className="grid gap-md">
              {alignmentCards.map(([label, value, helper, tone]) => (
                <div className="rounded-lg border border-card bg-tone-slate-bg p-lg" key={label}>
                  <div className="flex items-start justify-between gap-md">
                    <div>
                      <p className="text-tag uppercase tracking-tag text-muted">{label}</p>
                      <p className="mt-xs text-h2 text-ink">{value}</p>
                    </div>
                    <ToneTag tone={tone}>{tone === 'orange' ? 'Review' : 'Mapped'}</ToneTag>
                  </div>
                  <p className="mt-md text-sm text-secondary">{helper}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
        <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
          <div className="grid gap-xs">
            <h2 className="text-h2 font-medium text-ink">Standard mapping snapshot</h2>
            <p className="max-w-content text-sm text-muted">
              Representative rows connect ACHC standards to CMS Conditions of Participation, Title 22 references, policy IDs, forms,
              and evidence methods.
            </p>
          </div>
          <Button
            className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange"
            iconRight={<ArrowRight aria-hidden="true" className="h-icon-sm w-icon-sm" />}
            size="sm"
          >
            Open crosswalk
          </Button>
        </div>

        <div className="hidden overflow-x-auto laptop:block">
          <table className="min-w-full border-collapse text-left text-xs" aria-label="Framework standard mapping snapshot">
            <thead className="bg-tone-slate-bg text-tag uppercase tracking-tag text-muted">
              <tr>
                <th className="border-b border-card px-lg py-md font-light" scope="col">
                  ACHC
                </th>
                <th className="border-b border-card px-lg py-md font-light" scope="col">
                  Standard focus
                </th>
                <th className="border-b border-card px-lg py-md font-light" scope="col">
                  CMS / Title 22
                </th>
                <th className="border-b border-card px-lg py-md font-light" scope="col">
                  Policy / Form
                </th>
                <th className="border-b border-card px-lg py-md font-light" scope="col">
                  Evidence
                </th>
                <th className="border-b border-card px-lg py-md font-light" scope="col">
                  Support
                </th>
              </tr>
            </thead>
            <tbody>
              {mappingRows.map((row) => (
                <tr className="transition duration-fast ease-standard hover:bg-surface-hover" key={row.achc}>
                  <td className="border-b border-hairline px-lg py-md">
                    <ToneTag tone={row.tone}>{row.achc}</ToneTag>
                  </td>
                  <td className="border-b border-hairline px-lg py-md text-secondary">{row.standard}</td>
                  <td className="border-b border-hairline px-lg py-md text-muted">{row.cmsTitle22}</td>
                  <td className="border-b border-hairline px-lg py-md text-secondary">
                    <span className="text-brand-teal">{row.policy}</span>
                    <span className="block text-muted">{row.forms}</span>
                  </td>
                  <td className="border-b border-hairline px-lg py-md text-muted">{row.evidence}</td>
                  <td className="border-b border-hairline px-lg py-md">
                    <ToneBadge size="sm" status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-md laptop:hidden">
          {mappingRows.map((row) => (
            <article className="rounded-lg border border-card bg-tone-slate-bg p-lg" key={row.achc}>
              <div className="mb-md flex flex-wrap items-start justify-between gap-sm">
                <ToneTag tone={row.tone}>{row.achc}</ToneTag>
                <ToneBadge size="sm" status={row.status} />
              </div>
              <h3 className="text-body font-light text-ink">{row.standard}</h3>
              <p className="mt-sm text-sm text-muted">{row.cmsTitle22}</p>
              <div className="mt-md grid gap-sm text-sm text-secondary">
                <span>{row.policy}</span>
                <span>{row.forms}</span>
                <span>{row.evidence}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function DomainTile({ domain }: { domain: DomainTileData }) {
  const Icon = domain.icon;

  return (
    <article
      className="grid min-h-[270px] content-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest transition duration-fast ease-standard hover:shadow-hover"
      role="listitem"
    >
      <div className="grid gap-md">
        <div className="flex items-start justify-between gap-md">
          <span className={cx('grid h-tap w-tap place-items-center rounded-md', domainIconClasses[domain.tone])}>
            <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
          </span>
          <ToneTag tone={domain.tone}>{domain.code}</ToneTag>
        </div>
        <div className="grid gap-xs">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <h3 className="text-h3 font-light text-ink">{domain.title}</h3>
            <ToneBadge size="sm" status={domain.status} />
          </div>
          <p className="text-sm text-muted">{domain.description}</p>
        </div>
      </div>

      <div className="grid gap-md">
        <div className="grid grid-cols-3 gap-sm">
          <DomainStat label="Subdomains" value={domain.subdomains} />
          <DomainStat label="Policies" value={domain.policies} />
          <DomainStat label="ACHC" value={domain.achcAnchors} />
        </div>
        <ProgressMeter label="Survey readiness" tone={domain.tone} value={domain.readiness} />
        <button
          className="inline-flex min-h-tap items-center justify-between gap-md rounded-md border border-card px-md text-left text-sm text-brand-teal transition duration-fast ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
          type="button"
        >
          Inspect architecture
          <ArrowRight aria-hidden="true" className="h-icon-sm w-icon-sm" />
        </button>
      </div>
    </article>
  );
}

function DomainStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-hairline bg-tone-slate-bg p-sm">
      <p className="text-h3 text-ink">{value}</p>
      <p className="mt-xs text-tag uppercase tracking-tag text-muted">{label}</p>
    </div>
  );
}

const domainIconClasses: Record<Tone, string> = {
  amber: 'bg-tone-amber-bg text-tone-amber-text',
  blue: 'bg-tone-blue-bg text-tone-blue-text',
  green: 'bg-tone-green-bg text-tone-green-text',
  orange: 'bg-tone-orange-bg text-tone-orange-text',
  red: 'bg-tone-red-bg text-tone-red-text',
  slate: 'bg-tone-slate-bg text-tone-slate-text',
  teal: 'bg-tone-teal-bg text-tone-teal-text',
  violet: 'bg-tone-violet-bg text-tone-violet-text',
};

export default FrameworkScreen;
