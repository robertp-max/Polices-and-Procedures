import { useState } from 'react';
import { AlertTriangle, Archive, CheckCircle2, ClipboardCheck, FileSignature, Link2, LockKeyhole, ShieldCheck, Upload, UserCheck, PenLine, type LucideIcon } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, ToneTag, toneSoftTileClasses, VeilModal, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Badge, Button, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';


interface ProcedureSection {
  body: string;
  bullets: readonly string[];
  icon: LucideIcon;
  id: string;
  status: string;
  title: string;
  tone: Tone;
}

interface CitationPanel {
  detail: string;
  label: string;
  ref: string;
  status: string;
  tone: Tone;
}

interface EvidenceExpectation {
  detail: string;
  label: string;
  owner: string;
  status: string;
  tone: Tone;
}

interface ChecklistRow extends Record<string, string> {
  item: string;
  number: string;
  policyRef: string;
  result: string;
  status: string;
}

const routeMarker = {
  group: 'Onboarding',
  hashId: 'appendix-f',
  path: '/journey/appendix-f',
  template: 'docs',
} as const;

const appendixMetrics = [
  { label: 'Items', value: '15', helper: 'HR-TA-001 checklist rows', tone: 'teal' },
  { label: 'Complete', value: '12 / 15', helper: 'PASS or N/A recorded', tone: 'green' },
  { label: 'Pending', value: '2', helper: 'License and immunization follow-up', tone: 'orange' },
  { label: 'Signature', value: 'Required', helper: 'HR Director hard-stop release', tone: 'amber' },
] satisfies readonly MetricTileData[];

const procedureSections = [
  {
    body:
      'No work, orientation module access, field exposure, or supervised visit scheduling begins until Appendix F is complete and signed.',
    bullets: [
      'HR confirms every item is PASS or N/A before release.',
      'Pending rows keep the learner in Pre-Day-1 hold.',
      'The clearance result is visible to Journey Overview and supervisor review.',
    ],
    icon: LockKeyhole,
    id: 'hard-stop',
    status: 'locked',
    title: 'Hard stop gate',
    tone: 'orange',
  },
  {
    body:
      'The HR coordinator collects screening artifacts, verifies source dates, and records the controlling policy reference for each checklist row.',
    bullets: [
      'Primary source checks are attached to the employee screening packet.',
      'Expired or name-mismatched artifacts are returned before signoff.',
      'N/A rows require a documented reason in the evidence note.',
    ],
    icon: ClipboardCheck,
    id: 'intake-verification',
    status: 'review-required',
    title: 'Intake verification',
    tone: 'amber',
  },
  {
    body:
      'Clinical leadership reviews role-sensitive items such as licensure, credentials, TB clearance, and required health documentation.',
    bullets: [
      'RN, LVN, therapy, and aide tracks retain discipline-specific credentials.',
      'License checks must show active state, expiration, and source date.',
      'Clinical blocks are escalated to the DON before a work assignment is opened.',
    ],
    icon: UserCheck,
    id: 'clinical-review',
    status: 'pending',
    title: 'Clinical review',
    tone: 'orange',
  },
  {
    body:
      'The HR Director signs the completed packet, seals the checklist snapshot, and releases the learner into GAO only after all blocks are cleared.',
    bullets: [
      'Signature requires final checklist state, date, and packet owner.',
      'Evidence Center receives the sealed Appendix F packet.',
      'Independent work remains blocked until later journey gates are also complete.',
    ],
    icon: FileSignature,
    id: 'signature',
    status: 'awaiting',
    title: 'HR Director signoff',
    tone: 'teal',
  },
] satisfies readonly ProcedureSection[];

const checklistColumns: readonly DataTableColumn<ChecklistRow>[] = [
  { key: 'number', label: '#' },
  { key: 'item', label: 'Check Item (HR-TA-001)' },
  { key: 'policyRef', label: 'Policy Ref' },
  { key: 'result', label: 'Result' },
  { key: 'status', label: 'Gate State', status: true },
] as const;

const checklistRows: readonly ChecklistRow[] = [
  {
    item: 'Criminal background screening completed',
    number: '01',
    policyRef: 'HR-TA-002',
    result: 'PASS',
    status: 'passed',
  },
  {
    item: 'OIG LEIE exclusion check documented',
    number: '02',
    policyRef: 'CO-CP-004',
    result: 'PASS',
    status: 'validated',
  },
  {
    item: 'SAM.gov exclusion check documented',
    number: '03',
    policyRef: 'CO-CP-004',
    result: 'PASS',
    status: 'validated',
  },
  {
    item: 'Identity and work authorization reviewed',
    number: '04',
    policyRef: 'HR-TA-001',
    result: 'PASS',
    status: 'passed',
  },
  {
    item: 'Professional license primary-source verification',
    number: '05',
    policyRef: 'HR-TA-003',
    result: 'PENDING',
    status: 'pending',
  },
  {
    item: 'TB screening or risk assessment on file',
    number: '06',
    policyRef: 'IC-IP-004',
    result: 'PASS',
    status: 'passed',
  },
  {
    item: 'Hepatitis B offer or declination captured',
    number: '07',
    policyRef: 'RM-OS-001',
    result: 'PASS',
    status: 'uploaded',
  },
  {
    item: 'CPR or BLS credential verified for role',
    number: '08',
    policyRef: 'HR-TA-005',
    result: 'PASS',
    status: 'validated',
  },
  {
    item: 'Driver license and auto insurance reviewed',
    number: '09',
    policyRef: 'HR-TA-004',
    result: 'N/A',
    status: 'complete',
  },
  {
    item: 'Job description signed by employee',
    number: '10',
    policyRef: 'HR-TA-001',
    result: 'PASS',
    status: 'signed',
  },
  {
    item: 'Confidentiality and HIPAA attestation signed',
    number: '11',
    policyRef: 'CO-HP-001',
    result: 'PASS',
    status: 'signed',
  },
  {
    item: 'Offer letter and compensation acknowledgement',
    number: '12',
    policyRef: 'HR-TA-001',
    result: 'PASS',
    status: 'signed',
  },
  {
    item: 'Reference checks completed or waived by policy',
    number: '13',
    policyRef: 'HR-TA-002',
    result: 'N/A',
    status: 'complete',
  },
  {
    item: 'Required immunization documentation complete',
    number: '14',
    policyRef: 'IC-IP-004',
    result: 'PENDING',
    status: 'pending',
  },
  {
    item: 'HR Director final clearance signature',
    number: '15',
    policyRef: 'HR-TA-001 Appendix F',
    result: 'PENDING',
    status: 'awaiting',
  },
] as const;

const citationPanels = [
  {
    detail: 'Pre-employment screening and Appendix F completion define the hard-stop release condition.',
    label: 'Screening checklist authority',
    ref: 'HR-TA-001 Appendix F',
    status: 'review-required',
    tone: 'orange',
  },
  {
    detail: 'Personnel qualification records support home health agency staffing and survey review expectations.',
    label: 'Personnel qualification record',
    ref: '42 CFR 484.115',
    status: 'ready',
    tone: 'teal',
  },
  {
    detail: 'Exclusion checks and compliance screening preserve program integrity before patient contact.',
    label: 'Compliance screening',
    ref: 'CO-CP-004, OIG LEIE, SAM.gov',
    status: 'validated',
    tone: 'green',
  },
  {
    detail: 'Occupational health artifacts attach to the learner packet before onboarding progresses.',
    label: 'Health and exposure controls',
    ref: 'OSHA 29 CFR 1910.1030',
    status: 'uploaded',
    tone: 'blue',
  },
] satisfies readonly CitationPanel[];

const evidenceExpectations = [
  {
    detail: 'Source lookup screenshots or vendor certificates show date, subject, result, reviewer, and policy reference.',
    label: 'Primary-source proof',
    owner: 'HR Coordinator',
    status: 'uploaded',
    tone: 'blue',
  },
  {
    detail: 'Each N/A result includes role reason, approver initials, and date so the gate remains auditable.',
    label: 'N/A rationale',
    owner: 'HR Director',
    status: 'ready',
    tone: 'teal',
  },
  {
    detail: 'Open license and immunization items require documented follow-up before GAO access is released.',
    label: 'Pending follow-up',
    owner: 'Clinical Manager',
    status: 'pending',
    tone: 'orange',
  },
  {
    detail: 'Final packet carries checklist snapshot, signature certificate, and retention metadata for Evidence Center.',
    label: 'Sealed packet',
    owner: 'Evidence Steward',
    status: 'awaiting',
    tone: 'amber',
  },
] satisfies readonly EvidenceExpectation[];

const readinessCards = [
  {
    body: 'The Appendix F gate is intentionally blocking because two required artifacts remain pending and final HR Director signature is not sealed.',
    icon: AlertTriangle,
    progress: 80,
    status: 'blocked',
    title: 'Hard stop gate',
    tone: 'orange',
  },
  {
    body: 'Completed screening rows already carry source references, result state, and retention expectations for Evidence Center.',
    icon: Archive,
    progress: 92,
    status: 'uploaded',
    title: 'Evidence posture',
    tone: 'blue',
  },
  {
    body: 'Checklist release requires all rows to resolve to PASS or N/A plus HR Director signature before any orientation work begins.',
    icon: ShieldCheck,
    progress: 72,
    status: 'awaiting',
    title: 'Release rule',
    tone: 'amber',
  },
] satisfies readonly SurfaceCardData[];

const signatureFacts = [
  ['Signer', 'HR Director'],
  ['Learner', 'Maria Santos, RN'],
  ['Employee ID', 'EMP-1001'],
  ['Current gate', 'Pre-Day-1 hold'],
  ['Required release state', 'All PASS or N/A plus signature'],
  ['Evidence destination', 'Evidence Center employee packet'],
] as const;

export function AppendixFScreen() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'procedures' | 'evidence'>('checklist');
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [signatureStrokes, setSignatureStrokes] = useState<boolean>(false);
  const [attested, setAttested] = useState<boolean>(false);

  return (
    <section
      aria-labelledby="appendix-f-title"
      className="grid gap-xl"
      data-group={routeMarker.group}
      data-hash-id={routeMarker.hashId}
      data-route={routeMarker.path}
      data-template={routeMarker.template}
    >
      <MetricGrid metrics={appendixMetrics} />

      {/* Premium Segmented Tab Control */}
      <div className="flex justify-start">
        <div className="flex rounded-lg border border-hairline bg-tone-slate-bg/30 p-xs gap-xs">
          <button
            onClick={() => setActiveTab('checklist')}
            className={cx(
              'px-lg py-sm text-xs font-heading font-medium uppercase tracking-wider rounded-md transition-all duration-fast',
              activeTab === 'checklist'
                ? 'bg-brand-teal text-on-brand shadow-rest'
                : 'text-brand-teal-deep hover:bg-surface-hover hover:text-brand-teal'
            )}
          >
            Checklist & Signoff
          </button>
          <button
            onClick={() => setActiveTab('procedures')}
            className={cx(
              'px-lg py-sm text-xs font-heading font-medium uppercase tracking-wider rounded-md transition-all duration-fast',
              activeTab === 'procedures'
                ? 'bg-brand-teal text-on-brand shadow-rest'
                : 'text-brand-teal-deep hover:bg-surface-hover hover:text-brand-teal'
            )}
          >
            Procedures & Guidance
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={cx(
              'px-lg py-sm text-xs font-heading font-medium uppercase tracking-wider rounded-md transition-all duration-fast',
              activeTab === 'evidence'
                ? 'bg-brand-teal text-on-brand shadow-rest'
                : 'text-brand-teal-deep hover:bg-surface-hover hover:text-brand-teal'
            )}
          >
            Evidence & Citations
          </button>
        </div>
      </div>

      {activeTab === 'checklist' && (
        <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_340px]">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" id="checklist">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink">Screening checklist</h2>
                <p className="max-w-content text-sm text-muted">
                  Every row must resolve to PASS or N/A before HR Director signoff releases the learner from Pre-Day-1 hold.
                </p>
              </div>
              <Badge variant="count">15 rows</Badge>
            </div>
            <DataTable columns={checklistColumns} label="Appendix F screening checklist" rows={checklistRows} />
          </section>

          <aside className="grid gap-lg content-start">
            <section className="rounded-lg border border-card bg-surface p-lg shadow-rest" aria-label="Learner clearance snapshot">
              <div className="mb-md flex items-start justify-between gap-md">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-orange-bg text-tone-orange-text">
                  <UserCheck aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <ToneBadge size="sm" status="blocked" />
              </div>
              <div className="grid gap-xs">
                <p className="text-tag uppercase tracking-tag text-muted">Learner</p>
                <h2 className="text-h2 font-medium text-ink">Maria Santos, RN</h2>
                <p className="text-sm text-secondary">Start date Apr 20, 2026</p>
              </div>
              <dl className="mt-lg grid gap-sm">
                {signatureFacts.slice(1, 5).map(([label, value]) => (
                  <div className="rounded-md bg-tone-slate-bg p-md" key={label}>
                    <dt className="text-tag uppercase tracking-tag text-muted">{label}</dt>
                    <dd className="mt-xs text-sm text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" id="signature">
              <div className="mb-lg flex items-start justify-between gap-md">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                  <FileSignature aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <ToneBadge size="sm" status="awaiting" />
              </div>
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink">HR Director signoff</h2>
                <p className="text-sm text-muted">Final release cannot be sealed until every checklist row is PASS or N/A.</p>
              </div>
              <dl className="mt-lg grid gap-sm">
                {signatureFacts.map(([label, value]) => (
                  <div className="rounded-md border border-card bg-tone-slate-bg p-md" key={label}>
                    <dt className="text-tag uppercase tracking-tag text-muted">{label}</dt>
                    <dd className="mt-xs text-sm text-secondary">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-lg">
                <Button
                  className="w-full border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange font-light"
                  onClick={() => setIsSignatureOpen(true)}
                  size="sm"
                >
                  Open signature canvas
                </Button>
              </div>
            </section>
          </aside>
        </section>
      )}

      {activeTab === 'procedures' && (
        <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_340px]">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" id="procedures">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div className="grid gap-xs">
                <ToneTag tone="orange">HARD STOP</ToneTag>
                <h2 className="text-h2 font-medium text-ink">Procedure sections</h2>
                <p className="max-w-content text-sm text-muted">
                  The docs template keeps the procedure narrative visible beside the operational checklist so the release decision is
                  traceable.
                </p>
              </div>
              <ToneBadge size="sm" status="review-required" />
            </div>

            <div className="grid gap-md">
              {procedureSections.map((section, index) => (
                <ProcedureSectionCard index={index + 1} key={section.id} section={section} />
              ))}
            </div>
          </section>

          <aside className="grid content-start gap-lg" aria-label="Appendix F gate cards">
            {readinessCards.map((card) => (
              <SurfaceCard card={card} key={card.title} />
            ))}
          </aside>
        </section>
      )}

      {activeTab === 'evidence' && (
        <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_340px]">
          <div className="grid content-start gap-xl">
            <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
              <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
                <div className="grid gap-xs">
                  <h2 className="text-h2 font-medium text-ink">Evidence expectations</h2>
                  <p className="max-w-content text-sm text-muted">
                    Evidence requirements are written as packet acceptance checks so HR, clinical leadership, and audit reviewers agree on
                    what counts as clearance.
                  </p>
                </div>
                <ToneTag tone="blue">Evidence Center</ToneTag>
              </div>

              <div className="grid gap-md tablet-l:grid-cols-2">
                {evidenceExpectations.map((expectation) => (
                  <EvidenceExpectationCard expectation={expectation} key={expectation.label} />
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" id="citations">
              <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
                <div className="grid gap-xs">
                  <h2 className="text-h2 font-medium text-ink">Citations and authority</h2>
                  <p className="max-w-content text-sm text-muted">
                    Checklist items remain tied to the personnel, compliance, health, and source-verification controls that support the
                    onboarding gate.
                  </p>
                </div>
                <ToneBadge size="sm" status="validated" />
              </div>
              <div className="grid gap-md tablet-l:grid-cols-2">
                {citationPanels.map((panel) => (
                  <CitationPanelCard panel={panel} key={panel.label} />
                ))}
              </div>
            </section>
          </div>

          <aside className="grid gap-lg content-start">
            <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-label="Release checklist panel">
              <div className="mb-lg flex items-start gap-md">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-orange-bg text-tone-orange-text">
                  <AlertTriangle aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div className="grid gap-xs">
                  <h2 className="text-h2 font-medium text-ink">Release checklist</h2>
                  <p className="text-sm text-muted">The coordinator-owned route can import this screen once routing is wired.</p>
                </div>
              </div>
              <div className="grid gap-sm">
                {[
                  ['All checklist rows', 'PASS or N/A only', 'pending'],
                  ['HR Director signature', 'Required before GAO opens', 'awaiting'],
                  ['Evidence packet', 'Attach sealed Appendix F snapshot', 'uploaded'],
                  ['Journey handoff', 'Unlock only after hard stop clears', 'locked'],
                ].map(([label, detail, status]) => (
                  <div className="rounded-md border border-card bg-tone-slate-bg p-md" key={label}>
                    <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                      <p className="text-tag uppercase tracking-tag text-secondary">{label}</p>
                      <ToneBadge size="sm" status={status} />
                    </div>
                    <p className="text-sm text-ink">{detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      )}

      <VeilModal
        open={isSignatureOpen}
        onClose={() => setIsSignatureOpen(false)}
        eyebrow="Verify Identity & Sign"
        title="Preceptor Signature Drawing Overlay"
        tone="orange"
        footer={
          <div className="flex justify-end gap-md">
            <Button
              onClick={() => setIsSignatureOpen(false)}
              variant="secondary"
              size="sm"
            >
              Close
            </Button>
            <Button
              className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange font-light"
              disabled={!signatureStrokes || !attested}
              onClick={() => {
                setIsSignatureOpen(false);
              }}
              size="sm"
            >
              Confirm Signature
            </Button>
          </div>
        }
      >
        <div className="grid gap-md">
          <div className="grid grid-cols-2 gap-md text-sm">
            <div className="rounded-md bg-tone-slate-bg p-md">
              <span className="text-tag uppercase tracking-tag text-muted">Signer</span>
              <p className="mt-xs font-medium text-ink">HR Director</p>
            </div>
            <div className="rounded-md bg-tone-slate-bg p-md">
              <span className="text-tag uppercase tracking-tag text-muted">Role</span>
              <p className="mt-xs font-medium text-ink">HR Director</p>
            </div>
          </div>
          <div className="rounded-md bg-tone-slate-bg p-md text-sm">
            <span className="text-tag uppercase tracking-tag text-muted">Time</span>
            <p className="mt-xs font-medium text-ink">Jun 21, 2026 12:15 UTC</p>
          </div>

          <div
            className="grid min-h-[180px] place-items-center rounded-lg border border-dashed border-brand-teal bg-tone-slate-bg p-lg text-center cursor-pointer relative"
            onClick={() => setSignatureStrokes(true)}
          >
            {signatureStrokes ? (
              <div className="font-mono text-xl text-brand-teal italic select-none">
                ✓ HR Director Signature (Staged)
              </div>
            ) : (
              <div>
                <PenLine className="mx-auto h-icon-lg w-icon-lg text-brand-teal" />
                <p className="mt-md text-h3 font-light text-ink">Draw signature here</p>
                <p className="mt-xs text-sm text-secondary">Click to simulate drawing signature</p>
              </div>
            )}
          </div>

          <div className="flex gap-sm">
            <button
              onClick={() => setSignatureStrokes(false)}
              className="text-xs text-brand-teal hover:underline font-light"
              type="button"
            >
              Clear Canvas
            </button>
            <button
              onClick={() => setSignatureStrokes(true)}
              className="text-xs text-brand-teal hover:underline font-light"
              type="button"
            >
              Restore Default Signature
            </button>
          </div>

          <label className="flex items-start gap-md rounded-md bg-tone-slate-bg p-md text-sm text-secondary">
            <input
              type="checkbox"
              checked={attested}
              onChange={(e) => setAttested(e.target.checked)}
              className="mt-xs"
            />
            <span className="font-light">
              I declare under penalty of perjury that this signature matches my credential identity and validates the logged competency items.
            </span>
          </label>
        </div>
      </VeilModal>
    </section>
  );
}

function ProcedureSectionCard({ index, section }: { index: number; section: ProcedureSection }) {
  const Icon = section.icon;

  return (
    <article className="rounded-lg border border-card bg-tone-slate-bg p-lg" id={section.id}>
      <div className="mb-md flex flex-wrap items-start justify-between gap-md">
        <div className="flex items-start gap-md">
          <span className={cx('grid h-tap w-tap place-items-center rounded-md', toneSoftTileClasses[section.tone])}>
            <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
          </span>
          <div className="grid gap-xs">
            <p className="text-tag uppercase tracking-tag text-muted">Procedure {index}</p>
            <h3 className="text-h3 font-medium text-ink">{section.title}</h3>
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
    </article>
  );
}

function CitationPanelCard({ panel }: { panel: CitationPanel }) {
  return (
    <article className="rounded-lg border border-card bg-tone-slate-bg p-lg">
      <div className="mb-md flex flex-wrap items-start justify-between gap-md">
        <span className={cx('grid h-tap w-tap place-items-center rounded-md', toneSoftTileClasses[panel.tone])}>
          <Link2 aria-hidden="true" className="h-icon-md w-icon-md" />
        </span>
        <ToneBadge size="sm" status={panel.status} />
      </div>
      <div className="grid gap-sm">
        <ToneTag tone={panel.tone}>{panel.ref}</ToneTag>
        <h3 className="text-h3 font-medium text-ink">{panel.label}</h3>
        <p className="text-sm text-muted">{panel.detail}</p>
      </div>
    </article>
  );
}

function EvidenceExpectationCard({ expectation }: { expectation: EvidenceExpectation }) {
  return (
    <article className="rounded-lg border border-card bg-tone-slate-bg p-lg">
      <div className="mb-md flex flex-wrap items-start justify-between gap-md">
        <span className={cx('grid h-tap w-tap place-items-center rounded-md', toneSoftTileClasses[expectation.tone])}>
          <Upload aria-hidden="true" className="h-icon-md w-icon-md" />
        </span>
        <ToneBadge size="sm" status={expectation.status} />
      </div>
      <div className="grid gap-sm">
        <h3 className="text-h3 font-medium text-ink">{expectation.label}</h3>
        <p className="text-sm text-muted">{expectation.detail}</p>
        <div className="rounded-md border border-card bg-surface p-md">
          <p className="text-tag uppercase tracking-tag text-muted">Owner</p>
          <p className="mt-xs text-sm text-ink">{expectation.owner}</p>
        </div>
      </div>
    </article>
  );
}

export default AppendixFScreen;
