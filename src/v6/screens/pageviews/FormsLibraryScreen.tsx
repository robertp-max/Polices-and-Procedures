import { useMemo, useState } from 'react';
import { Archive, ClipboardCheck, ClipboardList, FileCheck2, Link2, PenLine, Search, ShieldCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FORMS_DATASET, type FormRecord } from '@/policy/data/formsLibraryDataset';
import { DataTable, ToneTag, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { ToneBadge } from '../../primitives';
import {
  PolicyMetricsGrid,
  PolicyPanel,
  PolicySegmentTabs,
  PolicySignalCard,
  PolicyTinyStat,
  PolicyWorkspaceShell,
  type PolicyWorkspaceTab,
} from './PolicyWorkspace';

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
  const [view, setView] = useState<'library' | 'matrix' | 'evidence'>('library');
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('ALL');

  const domainOptions = useMemo(() => Array.from(new Set(formRows.map((row) => row.domain))).sort(), []);
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return formRows.filter((row) => {
      if (domain !== 'ALL' && row.domain !== domain) return false;
      if (!q) return true;
      return (
        row.formId.toLowerCase().includes(q) ||
        row.title.toLowerCase().includes(q) ||
        row.domain.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q) ||
        row.linkedPolicies.toLowerCase().includes(q)
      );
    });
  }, [domain, query]);

  const handleRowClick = (row: FormLibraryRow) => {
    const id = row.formId;
    if (id) navigate(`/forms/${encodeURIComponent(id)}`);
  };

  const tabs: readonly PolicyWorkspaceTab<typeof view>[] = [
    { id: 'library', label: 'Library', tone: 'teal' },
    { id: 'matrix', label: 'Matrix', tone: 'orange' },
    { id: 'evidence', label: 'Evidence', tone: 'green' },
  ];

  const visibleRows = filteredRows.slice(0, 36);
  const hiddenCount = filteredRows.length - visibleRows.length;

  return (
    <PolicyWorkspaceShell
      activeTab={view}
      dataHashId="forms-library"
      dataRoute="/forms"
      description="Browse approved forms as cards first, with the full matrix tucked behind its own tab for audit and bulk review work."
      eyebrow="Forms Registry"
      onTabChange={setView}
      tabs={tabs}
      title="Forms Library"
      actions={[
        { icon: ShieldCheck, label: 'Policies', to: '/library', variant: 'secondary' },
        { icon: ClipboardCheck, label: 'Approvals', to: '/policy-approvals' },
      ]}
    >
      <PolicyMetricsGrid metrics={formsMetrics} />

      {view === 'library' ? (
        <PolicyPanel
          title="Form Cards"
          description={`${filteredRows.length} of ${formRows.length} records. Use search and domain filters to keep the view light.`}
          actions={
            <>
              <label className="flex min-h-11 min-w-[260px] items-center gap-2 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-3 text-sm text-[#3D3D3A]">
                <Search className="h-4 w-4 shrink-0" aria-hidden />
                <input
                  aria-label="Search forms"
                  className="w-full bg-transparent py-3 text-[#52404B] outline-none placeholder:text-[#9A9A96]"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search ID, title, policy..."
                  value={query}
                />
              </label>
              <select
                aria-label="Filter forms by domain"
                className="min-h-11 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-3 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#3D3D3A] outline-none focus:border-[#007970]"
                onChange={(event) => setDomain(event.target.value)}
                value={domain}
              >
                <option value="ALL">All domains</option>
                {domainOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </>
          }
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleRows.map((row) => (
              <button
                key={row.formId}
                type="button"
                onClick={() => handleRowClick(row)}
                className="group flex min-h-[230px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#007970] hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
              >
                <span>
                  <span className="mb-4 flex items-start justify-between gap-4">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">{row.formId}</span>
                    <ToneTag tone="teal">{row.status}</ToneTag>
                  </span>
                  <span className="block font-montserrat text-lg font-semibold leading-snug text-[#007970] transition-colors group-hover:text-[#C2410C]">
                    {row.title}
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-[#3D3D3A]">{row.domain} - {row.type}</span>
                </span>
                <span className="mt-6 flex items-center justify-between gap-4 border-t border-[#E5E4E3] pt-4">
                  <span className="min-w-0 text-xs font-medium leading-relaxed text-[#3D3D3A]">{row.linkedPolicies}</span>
                  <ToneBadge size="sm" status={row.evidence} />
                </span>
              </button>
            ))}
          </div>
          {hiddenCount > 0 ? <p className="mt-8 text-center text-sm text-[#3D3D3A]">Showing first 36 matches. Search or filter to narrow the list.</p> : null}
        </PolicyPanel>
      ) : null}

      {view === 'matrix' ? (
        <PolicyPanel
          title="Forms Matrix"
          description="Full table remains available for audit, export, and side-by-side review workflows."
          actions={<PolicySegmentTabs active="matrix" onChange={() => undefined} tabs={[{ id: 'matrix', label: 'Full Matrix' }]} />}
        >
          <DataTable columns={formColumns} label="Forms library matrix" rows={filteredRows} onRowClick={handleRowClick} />
        </PolicyPanel>
      ) : null}

      {view === 'evidence' ? (
        <div className="grid gap-8">
          <section className="grid gap-5 xl:grid-cols-3" aria-label="Forms library context cards">
            {rightRailCards.map((card) => (
              <PolicySignalCard card={card} key={card.title} label="Readiness" />
            ))}
          </section>

          <PolicyPanel title="Evidence Metadata" description="Signer, certificate, policy, and retention counts for the forms matrix.">
            <div className="grid gap-4 md:grid-cols-4">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <article key={stat.label} className="rounded-[20px] border border-[#E5E4E3] bg-[#FAFBF8] p-5">
                    <Icon aria-hidden="true" className="h-5 w-5 text-[#007970]" />
                    <p className="mt-4 font-montserrat text-2xl font-bold text-[#C2410C]">{stat.value}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#3D3D3A]">{stat.label}</p>
                  </article>
                );
              })}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {signerEvidencePanels.map((panel) => (
                <article className="rounded-[20px] border border-[#E5E4E3] bg-white p-5 shadow-sm" key={panel.label}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-montserrat text-sm font-bold text-[#007970]">{panel.label}</h3>
                    <ToneBadge size="sm" status={panel.status} />
                  </div>
                  <p className="text-sm leading-relaxed text-[#3D3D3A]">{panel.detail}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
              {classificationFilters.map((filter) => (
                <PolicyTinyStat key={filter.label} label={filter.label} value={filter.value} />
              ))}
            </div>
          </PolicyPanel>
        </div>
      ) : null}
    </PolicyWorkspaceShell>
  );
}

export default FormsLibraryScreen;
