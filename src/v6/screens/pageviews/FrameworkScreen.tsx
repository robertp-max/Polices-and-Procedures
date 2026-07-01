import { Link, useSearchParams } from 'react-router-dom';

import { ArrowRight, BookOpen, ClipboardCheck, FileCheck2, Landmark, Layers3, Network, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react';
import { MetricGrid, ProgressMeter, SurfaceCard, ToneTag, type MetricTileData, type SurfaceCardData } from '../../components';
import { Button, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';
import { POLICY_CORPUS, LIFECYCLE_DOMAIN_ORDER, DOMAIN_LABEL } from '@/policy/data/policyCorpus';
import { frameworkPolicies } from '@/policy/data/frameworkSeed.generated';
import { achcSurveyRows } from '@/policy/data/achcSurveyProjection.generated';
import { achcPrintCrosswalk } from '@/policy/data/achcPrintCrosswalk.generated';

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

// ─── Real framework + ACHC data ──────────────────────────
// Domain tiles + mapping rows use POLICY_CORPUS + full frameworkSeed.generated
// + achcSurveyProjection.generated + achc*Crosswalk for counts, anchors,
// standards, CMS/Title22, evidence. Real records and mappings now render
// (no placeholders where data exists). Presentation-only (icons/tones) are constants.

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

// One representative real policy per domain, enriched with real ACHC / crosswalk mappings when present.
const mappingRows: readonly MappingRowData[] = LIFECYCLE_DOMAIN_ORDER.flatMap((code) => {
  const policy = POLICY_CORPUS.find((p) => p.domainCode === code);
  if (!policy) return [];
  const surveyHit = achcSurveyRows.find(r => r.policyId === policy.id);
  const crossHit = achcPrintCrosswalk.find(r => r.ibmPolicyId === policy.id);
  const achcLabel = surveyHit?.achcStandards?.[0] || crossHit?.achcStandards?.[0] || policy.id;
  const cms = surveyHit?.title22?.[0] || crossHit?.title22?.[0] || '—';
  const ev = surveyHit?.evidenceCodes?.join('/') || (crossHit?.evidenceCodes?.length ? crossHit.evidenceCodes.join('/') : '—');
  return [
    {
      achc: achcLabel,
      cmsTitle22: cms,
      evidence: ev,
      forms: '—',
      policy: policy.id,
      standard: surveyHit?.policyTitle || policy.title,
      status: (surveyHit?.mappingType === 'DIRECT' || crossHit) ? 'active' : 'review-required',
      tone: DOMAIN_TONE[code] ?? 'teal',
    },
  ];
});

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

export type FrameworkTabKey = 'taxonomy' | 'mapping' | 'achc-survey' | 'achc-crosswalk' | 'hh-evidence-map';

export function FrameworkTabs({
  activeTab,
  onFrameworkTabChange,
}: {
  activeTab: FrameworkTabKey;
  onFrameworkTabChange?: (tab: 'taxonomy' | 'mapping') => void;
}) {
  const tabClass = (isActive: boolean) =>
    cx(
      'rounded-md px-lg py-sm font-heading text-xs font-medium uppercase tracking-wider transition-all duration-fast focus-visible:outline-none focus-visible:shadow-focus',
      isActive
        ? 'bg-brand-teal text-on-brand shadow-rest'
        : 'text-brand-teal-deep hover:bg-surface-hover hover:text-brand-teal',
    );

  return (
    <div className="flex justify-start">
      <div className="flex flex-wrap gap-xs rounded-lg border border-hairline bg-surface-glass p-xs shadow-rest backdrop-blur-md">
        {onFrameworkTabChange ? (
          <button onClick={() => onFrameworkTabChange('taxonomy')} className={tabClass(activeTab === 'taxonomy')}>
            Taxonomy Structure
          </button>
        ) : (
          <Link to="/framework" className={tabClass(activeTab === 'taxonomy')}>
            Taxonomy Structure
          </Link>
        )}
        {onFrameworkTabChange ? (
          <button onClick={() => onFrameworkTabChange('mapping')} className={tabClass(activeTab === 'mapping')}>
            Standard Mapping Snapshot
          </button>
        ) : (
          <Link to="/framework?tab=mapping" className={tabClass(activeTab === 'mapping')}>
            Standard Mapping Snapshot
          </Link>
        )}
        <Link to="/framework/achc-survey" className={tabClass(activeTab === 'achc-survey')}>
          ACHC Survey Alignment
        </Link>
        <Link to="/framework/achc-survey/crosswalk" className={tabClass(activeTab === 'achc-crosswalk')}>
          ACHC Crosswalk
        </Link>
        <Link to="/framework/hh-evidence-map" className={tabClass(activeTab === 'hh-evidence-map')}>
          HH Tag Evidence Map
        </Link>
      </div>
    </div>
  );
}

export function FrameworkScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: 'taxonomy' | 'mapping' = searchParams.get('tab') === 'mapping' ? 'mapping' : 'taxonomy';
  const setActiveTab = (tab: 'taxonomy' | 'mapping') => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('tab', tab);
      return next;
    });
  };
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
  

  return (
    <div className="grid gap-xl" data-hash-id="framework" data-route="/framework" data-template="framework">
      {/* Premium Segmented Tab Control */}
      <FrameworkTabs activeTab={activeTab} onFrameworkTabChange={setActiveTab} />

      <MetricGrid metrics={frameworkMetrics} />

      {activeTab === 'taxonomy' ? (
        <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
          <section className="grid content-start gap-lg">
            <div className="flex flex-wrap items-end justify-between gap-md">
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink">Framework domains</h2>
                <p className="max-w-content text-sm text-muted">
                  Top-level taxonomy tiles show domain ownership, policy scope, ACHC anchor density, and survey-readiness signals.
                </p>
              </div>
              <div className="flex flex-wrap gap-sm" aria-label="Framework view modes">
                <Button selected={viewMode === 'grid'} size="sm" variant={viewMode === 'grid' ? 'secondary' : 'tertiary'} onClick={() => setViewMode('grid')}>
                  Grid
                </Button>
                <Button selected={viewMode === 'tree'} size="sm" variant={viewMode === 'tree' ? 'secondary' : 'tertiary'} onClick={() => setViewMode('tree')}>
                  Tree
                </Button>
                <Button selected={viewMode === 'heat'} size="sm" variant={viewMode === 'heat' ? 'secondary' : 'tertiary'} onClick={() => setViewMode('heat')}>
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

            <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
              <div className="mb-lg flex items-start justify-between gap-md">
                <div>
                  <ToneTag tone="orange">Authority context</ToneTag>
                  <h2 className="mt-md text-h2 font-medium text-ink">ACHC / CMS / Title 22</h2>
                </div>
                <ToneBadge size="sm" status="ready" />
              </div>
              <div className="grid gap-md">
                {alignmentCards.map(([label, value, helper, tone]) => (
                  <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg" key={label}>
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
      ) : (
        <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
          <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
            <div className="grid gap-xs">
              <h2 className="text-h2 font-medium text-ink">Standard mapping snapshot</h2>
              <p className="max-w-content text-sm text-muted">
                Representative rows connect ACHC standards to CMS Conditions of Participation, Title 22 references, policy IDs, forms,
                and evidence methods.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-sm rounded-md border border-brand-orange bg-brand-orange px-md py-xs text-sm text-on-brand hover:bg-brand-orange focus-visible:outline-none focus-visible:shadow-focus"
              to="/framework/achc-survey/crosswalk"
            >
              Open crosswalk
              <ArrowRight aria-hidden="true" className="h-icon-sm w-icon-sm" />
            </Link>
          </div>

          <div className="hidden overflow-x-auto laptop:block">
            <table className="min-w-full border-collapse text-left text-xs" aria-label="Framework standard mapping snapshot">
              <thead className="bg-surface-glass backdrop-blur-md shadow-glass-inset text-tag uppercase tracking-tag text-muted">
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
              <article className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg" key={row.achc}>
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
      )}
    </div>
  );
}

function DomainTile({ domain }: { domain: DomainTileData }) {
  const Icon = domain.icon;

  return (
    <article
      className="grid min-h-[270px] content-between gap-lg rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest transition duration-fast ease-standard hover:shadow-hover overflow-hidden"
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
        <Link
          className="inline-flex min-h-tap items-center justify-between gap-md rounded-md border border-card px-md text-left text-sm text-brand-teal transition duration-fast ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
          to="/framework/achc-survey"
        >
          Inspect architecture
          <ArrowRight aria-hidden="true" className="h-icon-sm w-icon-sm" />
        </Link>
      </div>
    </article>
  );
}

function DomainStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-sm overflow-hidden">
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
  slate: 'bg-surface-glass backdrop-blur-md shadow-glass-inset text-tone-slate-text',
  teal: 'bg-tone-teal-bg text-tone-teal-text',
  violet: 'bg-tone-violet-bg text-tone-violet-text',
};

export default FrameworkScreen;
