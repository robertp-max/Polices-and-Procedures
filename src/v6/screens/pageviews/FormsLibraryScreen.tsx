import { Archive, ClipboardCheck, ClipboardList, FileCheck2, Link2, PenLine, ShieldCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FORMS_DATASET, type FormRecord } from '@/policy/data/formsLibraryDataset';
import { DataTable, MetricGrid, SurfaceCard, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Badge, ToneBadge } from '../../primitives';

interface FormLibraryRow extends Record<string, string> {
  domain: string;
  evidence: string;
  formId: string;
  linkedPolicies: string;
  status: string;
  title: string;
  type: string;
}

interface FormsLibraryCard extends SurfaceCardData {
  meta: readonly [string, string][];
}

// Domain code → human name. Verified against FORMS_DATASET domainCode values
// (EN, GV, HR, CL, QA, RM, OP, FN, CO, IT, IS). Unknown codes fall back to the code itself.
const DOMAIN_NAMES: Record<string, string> = {
  EN: 'Enterprise',
  GV: 'Governance',
  HR: 'Human Resources',
  CL: 'Clinical',
  QA: 'Quality',
  RM: 'Risk Management',
  OP: 'Operations',
  FN: 'Finance',
  IT: 'IT & Security',
  IS: 'IT & Security',
  CO: 'Compliance',
};

const domainName = (code: string): string => DOMAIN_NAMES[code] ?? code;

// Linked-policy summary. "ALL (…)" sentinels pass through verbatim; otherwise a real count.
const linkedPoliciesLabel = (policies: readonly string[]): string => {
  const first = policies[0] ?? '';
  if (first.startsWith('ALL')) return first;
  const count = policies.length;
  return count === 1 ? '1 policy' : `${count} policies`;
};

// Status derived from the real `usage` field (whether the artifact is mandatory).
const statusFromUsage = (usage: string): string => {
  switch (usage) {
    case 'Required':
      return 'active';
    case 'Conditional':
      return 'pending';
    case 'Optional':
      return 'draft';
    default:
      return usage;
  }
};

// Evidence posture derived from real classifications: audit-critical artifacts are
// validated evidence; everything else is informational.
const evidenceFromClassifications = (classifications: readonly string[]): string =>
  classifications.includes('audit_critical') ? 'validated' : 'info';

const toRow = (record: FormRecord): FormLibraryRow => ({
  domain: domainName(record.domainCode),
  evidence: evidenceFromClassifications(record.classifications),
  formId: record.id,
  linkedPolicies: linkedPoliciesLabel(record.policies),
  status: statusFromUsage(record.usage),
  title: record.name,
  type: record.type,
});

const formRows: readonly FormLibraryRow[] = FORMS_DATASET.map(toRow);

const totalForms = FORMS_DATASET.length;
const distinctDomains = new Set(FORMS_DATASET.map((record) => record.domainCode)).size;
const digitalCandidates = FORMS_DATASET.filter((record) => record.classifications.includes('digital_candidate')).length;

const formsMetrics = [
  { label: 'Canonical artifacts', value: String(totalForms), helper: 'Approved agency form records', tone: 'teal' },
  { label: 'Runtime records', value: String(totalForms), helper: 'Templates, packets, and checklists', tone: 'blue' },
  { label: 'Domains', value: String(distinctDomains), helper: 'Taxonomy families represented', tone: 'slate' },
  { label: 'eCIgn candidates', value: String(digitalCandidates), helper: 'Ready for signer routing', tone: 'orange' },
] satisfies readonly MetricTileData[];

// Signer metadata column removed: the dataset carries no honest per-form signer
// roles, and deriving them from `type` would fabricate unique fake strings.
const formColumns: readonly DataTableColumn<FormLibraryRow>[] = [
  { key: 'formId', label: 'Form ID' },
  { key: 'title', label: 'Form title' },
  { key: 'domain', label: 'Domain' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status', status: true },
  { key: 'evidence', label: 'Evidence', status: true },
  { key: 'linkedPolicies', label: 'Linked policies' },
];

const classificationFilters = [
  { label: 'Master template', value: String(FORMS_DATASET.filter(r => r.classifications.includes('master_template')).length) },
  { label: 'Audit critical', value: String(FORMS_DATASET.filter(r => r.classifications.includes('audit_critical')).length) },
  { label: 'Shared enterprise', value: String(FORMS_DATASET.filter(r => r.classifications.includes('shared_enterprise')).length) },
  { label: 'High risk', value: String(FORMS_DATASET.filter(r => r.classifications.includes('high_risk')).length) },
  { label: 'Digital candidate', value: String(FORMS_DATASET.filter(r => r.classifications.includes('digital_candidate')).length) },
] as const;

const signerEvidencePanels = [
  {
    detail: '74 candidate forms keep signer roles, order, and certificate handoff visible before eCIgn routing.',
    label: 'Signer readiness',
    status: 'awaiting',
  },
  {
    detail: 'Each matrix row preserves evidence state for audit packet checks and retained hash references.',
    label: 'Evidence posture',
    status: 'validated',
  },
  {
    detail: 'Library records separate read/fill forms from canonical signing workspaces at the route level.',
    label: 'Viewer split',
    status: 'ready',
  },
] as const;

const rightRailCards = [
  {
    body: 'Domain and classification slices keep master templates, audit-critical forms, and digital candidates in one matrix surface.',
    icon: ClipboardList,
    meta: [
      ['Primary filters', 'All, Governance, Clinical, Quality, HR, Operations'],
      ['Classification', 'Master template, shared enterprise, high risk'],
      ['Digital path', 'Candidate rows flow to the eCIgn signing workspace'],
    ],
    progress: 86,
    status: 'active',
    title: 'Library filters',
    tone: 'teal',
  },
  {
    body: 'Signer evidence tracks required roles, current certificate state, and packet readiness without merging viewer and signing routes.',
    icon: PenLine,
    meta: [
      ['Signed artifacts', '51 forms with completed signer evidence'],
      ['Awaiting signers', '23 routed to signer queues'],
      ['Locked packets', '17 retained for survey packet release'],
    ],
    progress: 69,
    status: 'awaiting',
    title: 'Signature readiness',
    tone: 'orange',
  },
  {
    body: 'Validated artifacts carry form ID, linked policies, owner, evidence state, and retention posture into Evidence Center.',
    icon: ShieldCheck,
    meta: [
      ['Hash chain', 'Form instance, certificate, linked policy refs'],
      ['Audit use', 'ACHC survey packet and governance review'],
      ['Retention', 'Locked evidence stays read-only after packet seal'],
    ],
    progress: 91,
    status: 'validated',
    title: 'Evidence chain',
    tone: 'green',
  },
] satisfies readonly FormsLibraryCard[];

const totalLinkedRefs = FORMS_DATASET.reduce((sum, r) => sum + r.policies.length, 0);
const signerCandidates = FORMS_DATASET.filter(r => r.classifications.includes('digital_candidate') || r.usage === 'Required').length;
const auditCritical = FORMS_DATASET.filter(r => r.classifications.includes('audit_critical')).length;
const quickStats = [
  { icon: Link2, label: 'Linked policy refs', value: String(totalLinkedRefs) },
  { icon: Users, label: 'Signer roles mapped', value: String(signerCandidates) },
  { icon: Archive, label: 'Locked certificates', value: String(auditCritical) },
  { icon: FileCheck2, label: 'Audit-ready records', value: String(auditCritical) },
] as const;

export function FormsLibraryScreen() {
  const navigate = useNavigate();
  const handleRowClick = (row: FormLibraryRow) => {
    const id = row.formId;
    if (id) navigate(`/forms/${encodeURIComponent(id)}`);
  };
  return (
    <section className="grid gap-xl" data-hash-id="forms-library" data-route="/forms">
      <MetricGrid metrics={formsMetrics} />

      <section className="grid gap-xl desktop:grid-cols-5" aria-label="Forms library matrix and evidence readiness">
        <div className="grid content-start gap-lg desktop:col-span-3">


          <div className="flex flex-wrap gap-sm" aria-label="Forms classification filters">
            {classificationFilters.map((filter) => (
              <Badge key={filter.label} variant="count">
                {filter.label}: {filter.value}
              </Badge>
            ))}
          </div>

          <DataTable columns={formColumns} label="Forms library matrix" rows={formRows} onRowClick={handleRowClick} />

          <section className="grid gap-md tablet-l:grid-cols-3" aria-label="Signer and evidence metadata summary">
            {signerEvidencePanels.map((panel) => (
              <article className="rounded-lg border border-card bg-tone-slate-bg p-lg" key={panel.label}>
                <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
                  <h3 className="text-body font-light text-ink">{panel.label}</h3>
                  <ToneBadge size="sm" status={panel.status} />
                </div>
                <p className="text-sm font-light text-muted">{panel.detail}</p>
              </article>
            ))}
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-2" aria-label="Forms library context cards">
          {rightRailCards.map((card) => (
            <SurfaceCard card={card} key={card.title}>
              <dl className="grid gap-sm border-t border-hairline pt-md">
                {card.meta.map(([label, value]) => (
                  <div className="grid gap-xs" key={label}>
                    <dt className="text-tag font-light uppercase tracking-tag text-brand-teal">{label}</dt>
                    <dd className="text-sm font-light text-secondary">{value}</dd>
                  </div>
                ))}
              </dl>
            </SurfaceCard>
          ))}

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="forms-quick-stats-heading">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-blue-bg text-tone-blue-text">
                <ClipboardCheck aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="forms-quick-stats-heading">
                  Evidence metadata
                </h2>
                <p className="text-sm font-light text-muted">Signer, certificate, policy, and retention counts for the forms matrix.</p>
              </div>
            </div>
            <div className="grid gap-sm">
              {quickStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md" key={stat.label}>
                    <span className="inline-flex min-w-0 items-center gap-sm text-sm font-light text-secondary">
                      <Icon aria-hidden="true" className="h-icon-sm w-icon-sm shrink-0 text-brand-teal" />
                      {stat.label}
                    </span>
                    <span className="text-body font-light text-ink">{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}

export default FormsLibraryScreen;
