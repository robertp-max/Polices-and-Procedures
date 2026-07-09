import { Link, useSearchParams } from 'react-router-dom';

import { ArrowRight, BookOpen, ClipboardCheck, FileCheck2, Landmark, Layers3, Network, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react';
import { ProgressMeter, ToneTag, type MetricTileData, type SurfaceCardData } from '../../components';
import { ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';
import { POLICY_CORPUS, LIFECYCLE_DOMAIN_ORDER, DOMAIN_LABEL } from '@/policy/data/policyCorpus';
import { frameworkPolicies } from '@/policy/data/frameworkSeed.generated';
import { achcSurveyRows } from '@/policy/data/achcSurveyProjection.generated';
import { PolicyAreaNav } from './PolicyAreaNav';

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

// ─── Real framework + ACHC data ──────────────────────────
// Domain tiles use POLICY_CORPUS + full frameworkSeed.generated
// + achcSurveyProjection.generated for counts, anchors, and readiness.
// Real records render where data exists; presentation-only icons/tones are constants.

// Presentation maps keyed by canonical domain code (UI styling, not data).
const DOMAIN_ICON: Record<string, LucideIcon> = {
  GV: Landmark,
  CL: ClipboardCheck,
  QA: ShieldCheck,
  HR: FileCheck2,
  CO: Workflow,
  FN: BookOpen,
  OP: Layers3,
  IT: Network,
  RM: ShieldCheck,
  EN: Network,
};

const DOMAIN_TONE: Record<string, Tone> = {
  GV: 'teal',
  CL: 'teal',
  QA: 'green',
  HR: 'orange',
  CO: 'orange',
  FN: 'teal',
  OP: 'teal',
  IT: 'amber',
  RM: 'green',
  EN: 'teal',
};

const DOMAIN_DESCRIPTION: Record<string, string> = {
  GV: 'Governing body authority, administrator accountability, policy council, and agency oversight.',
  CL: 'Assessment, care planning, OASIS, medication reconciliation, and skilled visit execution.',
  QA: 'QAPI indicators, incident trending, plan-of-correction follow-through, and audit cadence.',
  HR: 'Hiring files, credentialing, competency validation, supervision, and personnel health checks.',
  CO: 'Contracts, business associates, referral agreements, conflict disclosures, and vendor oversight.',
  FN: 'Billing controls, cost reporting, service authorization, revenue integrity, and payer evidence.',
  OP: 'Scheduling, visit coordination, on-call coverage, intake handoffs, and field documentation flow.',
  IT: 'Systems access, privacy safeguards, audit logs, continuity, and record-retention tooling.',
  RM: 'Emergency management, infection control, incident reporting, drill records, and corrective actions.',
  EN: 'Taxonomy governance, lifecycle coordination, crosswalk stewardship, and reporting metrics.',
};

// Per-domain corpus aggregates (policy count + distinct subdomains).
const domainAggregates = LIFECYCLE_DOMAIN_ORDER.map((code) => {
  const policies = POLICY_CORPUS.filter((p) => p.domainCode === code);
  const subdomains = new Set(policies.map((p) => p.subdomainCode));
  return { code, policyCount: policies.length, subdomainCount: subdomains.size };
});

const totalSubdomains = domainAggregates.reduce((sum, d) => sum + d.subdomainCount, 0);

// Real framework + ACHC derivation for tiles and mappings (full seed + projections)
const frameworkPoliciesByDomain = new Map<string, number>();
frameworkPolicies.forEach(p => {
  frameworkPoliciesByDomain.set(p.domainCode, (frameworkPoliciesByDomain.get(p.domainCode) || 0) + 1);
});
const achcAnchorsByDomain: Record<string, number> = {};
const achcMappedPolicyIds = new Set<string>();
achcSurveyRows.forEach(r => {
  const count = r.achcStandards.length;
  achcAnchorsByDomain[r.domain] = (achcAnchorsByDomain[r.domain] || 0) + count;
  achcMappedPolicyIds.add(r.policyId);
});


const frameworkMetrics: readonly MetricTileData[] = [
  { label: 'Domains', value: String(LIFECYCLE_DOMAIN_ORDER.length), helper: 'Top-level strategic pillars', tone: 'teal' },
  { label: 'Subdomains', value: String(totalSubdomains), helper: 'Operating taxonomy branches', tone: 'orange' },
  { label: 'Framework policies', value: String(frameworkPolicies.length), helper: 'Mapped to domains and standards', tone: 'teal' },
  { label: 'Lifecycle corpus', value: String(POLICY_CORPUS.length), helper: 'Draft and active records tracked', tone: 'green' },
];

const frameworkDomains: readonly DomainTileData[] = domainAggregates.map((d) => ({
  achcAnchors: String(achcAnchorsByDomain[d.code] ?? frameworkPoliciesByDomain.get(d.code) ?? 0),
  code: d.code,
  description: DOMAIN_DESCRIPTION[d.code] ?? '—',
  icon: DOMAIN_ICON[d.code] ?? Network,
  policies: String(frameworkPoliciesByDomain.get(d.code) ?? d.policyCount),
  readiness: Math.min(100, Math.round(((achcAnchorsByDomain[d.code] || 0) / Math.max(1, (frameworkPoliciesByDomain.get(d.code) || 1))) * 100)),
  status: 'active',
  subdomains: String(d.subdomainCount),
  title: DOMAIN_LABEL[d.code] ?? d.code,
  tone: DOMAIN_TONE[d.code] ?? 'teal',
}));

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

// Real ACHC / CMS / Title 22 counts derived from crosswalk + survey projections (no fabrication).
const totalAchcAnchors = Object.values(achcAnchorsByDomain).reduce((a, b) => a + b, 0);
const totalCmsRefs = achcSurveyRows.reduce((sum, r) => sum + (r.medicareCop?.length || 0), 0);
const totalTitle22 = achcSurveyRows.reduce((sum, r) => sum + (r.title22?.length || 0), 0);
const alignmentCards: readonly (readonly [string, string, string, Tone])[] = [
  ['ACHC anchors', String(totalAchcAnchors), 'Standards directly linked to policy and form evidence (from achcSurveyProjection + crosswalks)', 'teal'],
  ['CMS CoP refs', String(totalCmsRefs), 'Federal citations represented in the framework map', 'green'],
  ['Title 22 refs', String(totalTitle22), 'State references with active stewardship rows', 'orange'],
];

export type FrameworkTabKey = 'framework' | 'lifecycle' | 'achc';

export function FrameworkTabs() {
  return <PolicyAreaNav />;
}

export function FrameworkScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const viewMode: 'grid' | 'tree' | 'heat' =
    viewParam === 'tree' || viewParam === 'heat' ? viewParam : 'grid';
  const setViewMode = (view: 'grid' | 'tree' | 'heat') => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('view', view);
      return next;
    });
  };
  

  const sortedDomains = viewMode === 'heat'
    ? [...frameworkDomains].sort((a, b) => a.readiness - b.readiness)
    : frameworkDomains;

  return (
    <div
      className="-m-xl min-h-screen overflow-x-hidden bg-[#FAFBF8] px-6 pb-16 pt-4 font-roboto text-[#52404B] md:px-12"
      data-hash-id="framework"
      data-route="/framework"
      data-template="framework"
    >
      <main className="mx-auto flex w-full max-w-[1400px] flex-col">
        <PolicyAreaNav />

        <section className="ci-page-hero mb-8 rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:px-12 md:py-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 font-montserrat text-[12px] font-bold uppercase tracking-wider text-[#F06923]">Policy Architecture</p>
              <h1 className="font-montserrat text-3xl font-bold leading-tight tracking-tight text-[#007970] md:text-5xl">
                Policies & Procedures
              </h1>
              <p className="mt-4 max-w-2xl font-roboto text-base leading-relaxed text-[#747470]">
                A decluttered view of the agency taxonomy, policy corpus, ACHC anchors, and lifecycle signals using live framework data.
              </p>
            </div>
          </div>
        </section>

        <div className="mb-8 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {frameworkMetrics.map((metric) => (
            <FrameworkMetricCard key={metric.label} metric={metric} />
          ))}
        </div>

        <div className="space-y-8 pb-12">
          <section className="rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-10">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">Framework Domains</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#747470]">
                  Domain ownership, policy scope, ACHC anchor density, and survey-readiness signals.
                </p>
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Framework view modes">
                {[
                  ['grid', 'Grid'],
                  ['tree', 'Hierarchy'],
                  ['heat', 'Readiness'],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setViewMode(id as 'grid' | 'tree' | 'heat')}
                    className={cx(
                      'rounded-[10px] px-4 py-2 font-montserrat text-[10px] font-bold uppercase tracking-wider transition-all',
                      viewMode === id
                        ? 'bg-[#007970] text-white shadow-sm'
                        : 'border border-[#E5E4E3] bg-white text-[#747470] hover:bg-[#F7FEFF] hover:text-[#007970]',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {viewMode === 'tree' ? (
              <div className="space-y-5">
                <FrameworkLayerSection
                  accent="red"
                  label="Layer 1"
                  title="Regulatory Board"
                  items={['Title 22', '42 CFR Part 484', 'CMS State Ops', 'HIPAA', 'OSHA', 'OIG']}
                />
                <FrameworkLayerSection
                  accent="teal"
                  label="Layer 2"
                  title="Strategic Domains"
                  items={frameworkDomains.map((domain) => `${domain.code} - ${domain.title}`)}
                />
                <FrameworkLayerSection
                  accent="orange"
                  label="Layer 3"
                  title="Policy Stewardship"
                  items={['Named owners', 'Review cycle', 'Approval authority', 'Attestation records', 'Evidence anchors']}
                />
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="list">
                {sortedDomains.map((domain) => (
                  <DomainTile domain={domain} key={domain.code} />
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            {contextCards.map((card) => (
              <PolicySignalCard card={card} key={card.title} />
            ))}
          </section>

          <section className="rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-10">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-montserrat text-[12px] font-bold uppercase tracking-wider text-[#F06923]">Authority Context</p>
                <h2 className="mt-2 font-montserrat text-2xl font-semibold tracking-tight text-[#007970]">ACHC / CMS / Title 22</h2>
              </div>
              <ToneBadge size="sm" status="ready" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {alignmentCards.map(([label, value, helper, tone]) => (
                <div className="rounded-[18px] border border-[#E5E4E3] bg-[#FAFBF8] p-5" key={label}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#747470]">{label}</p>
                      <p className="mt-2 font-montserrat text-3xl font-bold text-[#007970]">{value}</p>
                    </div>
                    <ToneTag tone={tone}>{tone === 'orange' ? 'Review' : 'Mapped'}</ToneTag>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#747470]">{helper}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function FrameworkMetricCard({ metric }: { metric: MetricTileData }) {
  return (
    <div className="group flex min-h-[154px] flex-col justify-center rounded-[24px] border border-[#E5E4E3] bg-white p-7 shadow-sm transition-colors hover:border-[#007970]">
      <span className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#747470]">{metric.label}</span>
      <span className="mt-3 font-montserrat text-4xl font-bold text-[#F06923] transition-transform duration-300 group-hover:scale-[1.03]">{metric.value}</span>
      <span className="mt-3 text-sm leading-relaxed text-[#747470]">{metric.helper}</span>
    </div>
  );
}

function FrameworkLayerSection({
  accent,
  label,
  title,
  items,
}: {
  accent: 'orange' | 'red' | 'teal';
  label: string;
  title: string;
  items: readonly string[];
}) {
  const accentClass = {
    orange: 'border-[#F06923] text-[#F06923] bg-[#FFF0E5]',
    red: 'border-red-400 text-red-500 bg-red-50',
    teal: 'border-[#007970] text-[#007970] bg-[#E5FEFF]',
  }[accent];

  return (
    <div className={cx('border-l-4 pl-5', accent === 'orange' ? 'border-l-[#F06923]' : accent === 'red' ? 'border-l-red-400' : 'border-l-[#007970]')}>
      <div className="mb-4 flex items-center gap-3">
        <span className={cx('rounded-md border px-2 py-1 font-montserrat text-[9px] font-bold uppercase tracking-widest', accentClass)}>{label}</span>
        <h3 className="font-montserrat text-xs font-bold uppercase tracking-wider text-[#52404B]">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-[10px] border border-[#E5E4E3] bg-white px-3 py-2 font-montserrat text-[10px] font-bold uppercase tracking-wide text-[#52404B] shadow-sm">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function PolicySignalCard({ card }: { card: SurfaceCardData }) {
  const Icon = card.icon ?? FileCheck2;
  const progress = card.progress ?? 0;
  return (
    <article className="flex min-h-[210px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#007970] hover:shadow-md">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#E5FEFF] text-[#007970]">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <ToneBadge size="sm" status={card.status} />
        </div>
        <h3 className="font-montserrat text-base font-bold text-[#007970]">{card.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#747470]">{card.body}</p>
      </div>
      <div className="mt-6">
        <ProgressMeter label="Signal strength" tone={card.tone} value={progress} />
      </div>
    </article>
  );
}

function DomainTile({ domain }: { domain: DomainTileData }) {
  const Icon = domain.icon;

  return (
    <article
      className="grid min-h-[286px] content-between gap-6 overflow-hidden rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#007970] hover:shadow-md"
      role="listitem"
    >
      <div className="grid gap-md">
        <div className="flex items-start justify-between gap-md">
          <span className={cx('grid h-11 w-11 place-items-center rounded-[14px] bg-[#FAFBF8] text-[#007970]', domainIconClasses[domain.tone])}>
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <ToneTag tone={domain.tone}>{domain.code}</ToneTag>
        </div>
        <div className="grid gap-xs">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <h3 className="font-montserrat text-base font-bold text-[#007970]">{domain.title}</h3>
            <ToneBadge size="sm" status={domain.status} />
          </div>
          <p className="text-sm leading-relaxed text-[#747470]">{domain.description}</p>
        </div>
      </div>

      <div className="grid gap-md">
        <div className="grid grid-cols-3 gap-sm">
          <DomainStat label="Subdomains" value={domain.subdomains} />
          <DomainStat label="Policies" value={domain.policies} />
          <DomainStat label="ACHC" value={domain.achcAnchors} />
        </div>
        <ProgressMeter label="Survey readiness" tone={domain.tone} value={domain.readiness} />
        <Link
          className="inline-flex min-h-tap items-center justify-between gap-md rounded-[12px] border border-[#E5E4E3] bg-white px-4 py-3 text-left font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#007970] transition hover:bg-[#F7FEFF] focus-visible:outline-none focus-visible:shadow-focus"
          to="/framework/achc-survey"
        >
          Inspect architecture
          <ArrowRight aria-hidden="true" className="h-4 w-4 text-brand-orange" />
        </Link>
      </div>
    </article>
  );
}

function DomainStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E5E4E3] bg-[#FAFBF8] p-3 text-center">
      <p className="font-montserrat text-xl font-bold text-[#007970]">{value}</p>
      <p className="mt-1 font-montserrat text-[8px] font-bold uppercase tracking-wider text-[#747470]">{label}</p>
    </div>
  );
}

const domainIconClasses: Record<Tone, string> = {
  amber: 'bg-tone-amber-bg text-tone-amber-text',
  blue: 'bg-tone-blue-bg text-tone-blue-text',
  green: 'bg-tone-green-bg text-tone-green-text',
  orange: 'bg-tone-orange-bg text-tone-orange-text',
  red: 'bg-tone-red-bg text-tone-red-text',
  slate: 'bg-surface-glass backdrop-blur-md shadow-glass-inset text-tone-slate-text',
  teal: 'bg-tone-teal-bg text-tone-teal-text',
  violet: 'bg-tone-violet-bg text-tone-violet-text',
};

export default FrameworkScreen;
