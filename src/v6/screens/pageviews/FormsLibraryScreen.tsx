import { Archive, ClipboardCheck, ClipboardList, FileCheck2, Link2, PenLine, ShieldCheck, Users } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Badge, ToneBadge } from '../../primitives';

interface FormLibraryRow extends Record<string, string> {
  domain: string;
  evidence: string;
  formId: string;
  linkedPolicies: string;
  signers: string;
  status: string;
  title: string;
  type: string;
}

interface FormsLibraryCard extends SurfaceCardData {
  meta: readonly [string, string][];
}

const formsMetrics = [
  { label: 'Canonical artifacts', value: '361', helper: 'Approved agency form records', tone: 'teal' },
  { label: 'Runtime records', value: '410', helper: 'Templates, packets, and checklists', tone: 'blue' },
  { label: 'Domains', value: '10', helper: 'Taxonomy families represented', tone: 'slate' },
  { label: 'eCIgn candidates', value: '74', helper: 'Ready for signer routing', tone: 'orange' },
] satisfies readonly MetricTileData[];

const formColumns: readonly DataTableColumn<FormLibraryRow>[] = [
  { key: 'formId', label: 'Form ID' },
  { key: 'title', label: 'Form title' },
  { key: 'domain', label: 'Domain' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status', status: true },
  { key: 'signers', label: 'Signer metadata' },
  { key: 'evidence', label: 'Evidence', status: true },
  { key: 'linkedPolicies', label: 'Linked policies' },
];

const formRows: readonly FormLibraryRow[] = [
  {
    domain: 'Enterprise',
    evidence: 'validated',
    formId: 'EN-FM-001',
    linkedPolicies: '18 policies',
    signers: 'All staff acknowledgment',
    status: 'ready',
    title: 'Universal Policy Acknowledgment Form',
    type: 'Attestation',
  },
  {
    domain: 'Governance',
    evidence: 'awaiting',
    formId: 'GV-FM-006',
    linkedPolicies: '6 policies',
    signers: 'Board member, Administrator',
    status: 'active',
    title: 'Conflict of Interest Disclosure',
    type: 'Interactive',
  },
  {
    domain: 'Human Resources',
    evidence: 'uploaded',
    formId: 'HR-FM-014',
    linkedPolicies: '11 policies',
    signers: 'Employee, Supervisor',
    status: 'review-required',
    title: 'Competency Skills Checklist',
    type: 'Checklist',
  },
  {
    domain: 'Clinical',
    evidence: 'validated',
    formId: 'CL-FM-030',
    linkedPolicies: '9 policies',
    signers: 'RN Case Manager',
    status: 'ready',
    title: 'Start of Care Visit Checklist',
    type: 'Digital sheet',
  },
  {
    domain: 'Quality',
    evidence: 'missing-evidence',
    formId: 'QA-FM-021',
    linkedPolicies: '7 policies',
    signers: 'QAPI Lead',
    status: 'attention',
    title: 'QAPI Audit Worksheet',
    type: 'Audit critical',
  },
  {
    domain: 'Risk Management',
    evidence: 'uploaded',
    formId: 'RM-FM-018',
    linkedPolicies: '5 policies',
    signers: 'Administrator, Safety Lead',
    status: 'pending',
    title: 'Emergency Drill After Action Report',
    type: 'Packet input',
  },
  {
    domain: 'Operations',
    evidence: 'complete',
    formId: 'OP-FM-044',
    linkedPolicies: '8 policies',
    signers: 'Scheduler, Clinical Manager',
    status: 'signed',
    title: 'Missed Visit Follow-up Log',
    type: 'Log table',
  },
];

const classificationFilters = [
  { label: 'Master template', value: '128' },
  { label: 'Audit critical', value: '47' },
  { label: 'Shared enterprise', value: '39' },
  { label: 'High risk', value: '22' },
  { label: 'Digital candidate', value: '74' },
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

const quickStats = [
  { icon: Link2, label: 'Linked policy refs', value: '1,124' },
  { icon: Users, label: 'Signer roles mapped', value: '142' },
  { icon: Archive, label: 'Locked certificates', value: '51' },
  { icon: FileCheck2, label: 'Audit-ready records', value: '288' },
] as const;

export function FormsLibraryScreen() {
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

          <DataTable columns={formColumns} label="Forms library matrix" rows={formRows} />

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
