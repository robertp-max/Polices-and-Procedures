import { useState } from 'react';
import { CheckCircle2, Download, FileCheck2, Fingerprint, IdCard, LockKeyhole, PenLine, RotateCcw, Send, ShieldCheck, Stamp, type LucideIcon } from 'lucide-react';
import { MetricGrid, ProgressMeter, SurfaceCard, ToneTag, VeilModal, toneSurfaceClasses, toneGlassSurfaceClasses, type MetricTileData, type SurfaceCardData } from '../../components';
import { Badge, Button, Checkbox, FormField, Input, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';

interface SigningStep {
  description: string;
  icon: LucideIcon;
  key: string;
  label: string;
  progress: number;
  status: string;
  tone: Tone;
}

interface Signer {
  due: string;
  name: string;
  role: string;
  sequence: string;
  status: string;
  tone: Tone;
}

interface DocumentLine {
  label: string;
  status: string;
  text: string;
  tone: Tone;
}

interface ActionPanel {
  body: string;
  button: string;
  icon: LucideIcon;
  status: string;
  title: string;
  tone: Tone;
}

const ecignMetrics = [
  { label: 'Step readiness', value: '4 / 6', helper: 'Consent through review cleared', tone: 'teal' },
  { label: 'Active signer', value: '1', helper: 'Compliance officer signature due', tone: 'orange' },
  { label: 'Queued signers', value: '2', helper: 'Administrator and governing body', tone: 'amber' },
  { label: 'Certificate state', value: 'Ready', helper: 'Evidence shell prepared', tone: 'green' },
] satisfies readonly MetricTileData[];

const signingSteps: readonly SigningStep[] = [
  {
    description: 'E-SIGN Act consent recorded with signer acknowledgement.',
    icon: CheckCircle2,
    key: 'CONSENT',
    label: 'Consent',
    progress: 100,
    status: 'complete',
    tone: 'green',
  },
  {
    description: 'Signer identity profile matched to the active personnel record.',
    icon: IdCard,
    key: 'IDENTITY_VERIFIED',
    label: 'Identity',
    progress: 100,
    status: 'validated',
    tone: 'green',
  },
  {
    description: 'Conflict disclosure, reviewer note, and linked policy were opened.',
    icon: FileCheck2,
    key: 'REVIEW_ACK',
    label: 'Review',
    progress: 100,
    status: 'ready',
    tone: 'teal',
  },
  {
    description: 'Typed signature is staged; seal action remains locked to attestation.',
    icon: PenLine,
    key: 'SIGNED',
    label: 'Signature',
    progress: 68,
    status: 'awaiting',
    tone: 'orange',
  },
  {
    description: 'Final attestation checkbox unlocks after the signature is sealed.',
    icon: ShieldCheck,
    key: 'ATTESTED',
    label: 'Attestation',
    progress: 0,
    status: 'upcoming',
    tone: 'slate',
  },
  {
    description: 'Hash lock and evidence export wait for every required signer.',
    icon: LockKeyhole,
    key: 'LOCKED',
    label: 'Finalize',
    progress: 0,
    status: 'upcoming',
    tone: 'slate',
  },
];

const signerSequence: readonly Signer[] = [
  {
    due: 'Due Jun 21, 2026 16:00 UTC',
    name: 'Thomas Parker',
    role: 'Compliance Officer',
    sequence: 'Signer 1',
    status: 'awaiting',
    tone: 'orange',
  },
  {
    due: 'Queued after signer 1',
    name: 'Alexandra Rivera',
    role: 'Administrator',
    sequence: 'Signer 2',
    status: 'upcoming',
    tone: 'slate',
  },
  {
    due: 'Queued after administrator',
    name: 'Mei Chen',
    role: 'Governing Body Designee',
    sequence: 'Signer 3',
    status: 'upcoming',
    tone: 'slate',
  },
];

const documentLines: readonly DocumentLine[] = [
  {
    label: 'Identity block',
    status: 'complete',
    text: 'Full legal name, organization role, department, and completion date have been reconciled.',
    tone: 'green',
  },
  {
    label: 'Disclosure statement',
    status: 'review-required',
    text: 'Potential care-vendor consulting relationship routed to administrator before board packet close.',
    tone: 'orange',
  },
  {
    label: 'Linked policy',
    status: 'validated',
    text: 'GV-COI-003 Conflict of Interest and Business Ethics policy is attached to this form instance.',
    tone: 'teal',
  },
  {
    label: 'Signature block',
    status: 'awaiting',
    text: 'Typed signature, signer role, timestamp, and device evidence will be stamped after seal.',
    tone: 'amber',
  },
];

const certificateCard = {
  body: 'The evidence certificate shell is prepared before submission and locks only after every signer completes the ordered flow.',
  icon: Stamp,
  progress: 82,
  status: 'ready',
  title: 'Evidence certificate',
  tone: 'green',
} satisfies SurfaceCardData;

const readinessCard = {
  body: 'Consent, identity, review acknowledgement, typed signature, final attestation, and packet lock are tracked as separate no-skip checkpoints.',
  icon: Fingerprint,
  progress: 68,
  status: 'awaiting',
  title: 'Signature readiness',
  tone: 'orange',
} satisfies SurfaceCardData;

const actionPanels: readonly ActionPanel[] = [
  {
    body: 'Notify the current signer with form context, due time, and the locked review state.',
    button: 'Send reminder',
    icon: Send,
    status: 'awaiting',
    title: 'Current signer',
    tone: 'orange',
  },
  {
    body: 'Prepare the administrator handoff as soon as signer 1 seals the active signature block.',
    button: 'Queue second signature',
    icon: PenLine,
    status: 'upcoming',
    title: 'Second signature',
    tone: 'slate',
  },
  {
    body: 'Download remains available as a draft preview until the final certificate hash is locked.',
    button: 'Preview packet',
    icon: Download,
    status: 'ready',
    title: 'Packet preview',
    tone: 'teal',
  },
  {
    body: 'Reset is scoped to the active signature attempt and keeps consent, identity, and review evidence intact.',
    button: 'Reset signature',
    icon: RotateCcw,
    status: 'attention',
    title: 'Attempt controls',
    tone: 'orange',
  },
];

const certificateRows = [
  ['Form instance', 'GV-FM-006-2026-0619'],
  ['Document hash', 'sha256: 84f2 19bd 72ac 0e45'],
  ['Manifest hash', 'sha256: c77e e041 93aa b610'],
  ['Signer profile', 'Thomas Parker / Compliance Officer'],
  ['Network evidence', '192.0.2.44 / managed workstation'],
  ['Timestamp mode', 'UTC, ISO retained for audit'],
] as const;

const formContextRows = [
  ['Form', 'GV-FM-006 Conflict of Interest Disclosure'],
  ['Signing flow', 'Ordered eCIgn signer sequence'],
  ['Certificate state', 'Prepared after all signers complete'],
  ['Linked policy', 'GV-COI-003 Business Ethics'],
  ['Retention target', 'Evidence Center certificate archive'],
] as const;

export function EcignWorkspaceScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signatureStaged, setSignatureStaged] = useState(false);
  const [attestationChecked, setAttestationChecked] = useState(false);

  return (
    <section className="grid gap-xl" data-hash-id="ecign-workspace" data-route="/forms/:formId/esign" data-template="ecign">
      <MetricGrid metrics={ecignMetrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)_minmax(320px,1fr)]">
        <aside className="grid content-start gap-lg" aria-label="Signer sequence and form context">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <ToneTag tone="orange">No-skip sequence</ToneTag>
                <h2 className="mt-md text-h2 font-medium text-ink">Signer sequence</h2>
              </div>
              <Badge variant="count">3 signers</Badge>
            </div>
            <div className="grid gap-md">
              {signerSequence.map((signer) => (
                <SignerCard signer={signer} key={signer.sequence} />
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg">
              <ToneTag tone="teal">Form context</ToneTag>
              <h2 className="mt-md text-h2 font-medium text-ink">Packet anchors</h2>
            </div>
            <dl className="grid gap-sm">
              {formContextRows.map(([label, value]) => (
                <div className="rounded-md border border-hairline bg-tone-slate-bg p-md" key={label}>
                  <dt className="text-tag uppercase tracking-tag text-muted">{label}</dt>
                  <dd className="mt-xs text-sm text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>

        <section className="grid content-start gap-lg" aria-label="Document review and signature readiness">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div>
                <ToneTag tone="teal">Document preview</ToneTag>
                <h2 className="mt-md text-h2 font-medium text-ink">Conflict of Interest Disclosure</h2>
                <p className="mt-xs max-w-content text-sm text-muted">
                  Representative form lines show review state and the signature block that will receive the eCIgn stamp.
                </p>
              </div>
              <ToneBadge size="sm" status="awaiting" />
            </div>

            <div className="grid gap-md">
              {documentLines.map((line) => (
                <article className={cx('rounded-lg p-lg', toneGlassSurfaceClasses[line.tone])} key={line.label}>
                  <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                    <h3 className="text-body font-light text-ink">{line.label}</h3>
                    <ToneBadge size="sm" status={line.status} />
                  </div>
                  <p className="text-sm text-secondary">{line.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-ecign-orange bg-surface p-xl shadow-rest" aria-labelledby="signature-readiness-heading">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div>
                <ToneTag tone="orange">Typed signature</ToneTag>
                <h2 className="mt-md text-h2 font-medium text-ink" id="signature-readiness-heading">
                  Consent and signature readiness
                </h2>
              </div>
              <ToneBadge size="sm" status="awaiting" />
            </div>

            <div className="grid gap-lg tablet-l:grid-cols-[minmax(0,1fr)_minmax(220px,320px)]">
              <div className="grid gap-md">
                <div className="rounded-lg border border-card bg-tone-slate-bg p-lg">
                  <label className="flex items-start gap-md text-sm text-secondary">
                    <Checkbox checked readOnly aria-label="E-SIGN Act consent completed" />
                    <span>
                      E-SIGN Act consent captured. Signer agrees that the typed signature is legally equivalent to a
                      handwritten signature for this disclosure packet.
                    </span>
                  </label>
                </div>
                <FormField help="Prepared for the active signer." id="ecign-typed-signature" label="Typed signature">
                  {({ 'aria-describedby': ariaDescribedBy, id, invalid }) => (
                    <Input
                      aria-describedby={ariaDescribedBy}
                      id={id}
                      invalid={invalid}
                      readOnly
                      value="Thomas Parker"
                    />
                  )}
                </FormField>
                <div className="grid min-h-[150px] w-full place-items-center rounded-lg border border-dashed border-card bg-tone-slate-bg p-lg text-center">
                  {signatureStaged ? (
                    <div>
                      <CheckCircle2 aria-hidden="true" className="mx-auto h-icon-lg w-icon-lg text-tone-green-text" />
                      <p className="mt-md text-h3 font-medium text-tone-green-text">Hand Signature Staged</p>
                      <Button
                        className="mt-md"
                        iconLeft={<PenLine aria-hidden="true" className="h-icon-sm w-icon-sm" />}
                        onClick={() => setIsModalOpen(true)}
                        size="sm"
                        variant="secondary"
                      >
                        Redraw signature
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <PenLine aria-hidden="true" className="mx-auto h-icon-lg w-icon-lg text-brand-teal" />
                      <p className="mt-md text-h3 font-light text-ink">Signature pad ready</p>
                      <p className="mt-xs text-sm text-muted">Hand signature drawing overlay is ready.</p>
                      <Button
                        className="mt-md"
                        iconLeft={<PenLine aria-hidden="true" className="h-icon-sm w-icon-sm" />}
                        onClick={() => setIsModalOpen(true)}
                        size="sm"
                      >
                        Draw signature
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid content-start gap-md">
                {signingSteps.map((step) => (
                  <SigningStepCard step={step} key={step.key} />
                ))}
              </div>
            </div>
          </section>
        </section>

        {/* eCIgn Mobile Signature Drawing Overlay Modal */}
        <VeilModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          eyebrow="eCIgn Signature Pad"
          title="Draw Your Signature"
          tone="orange"
          footer={
            <div className="flex gap-md">
              <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="border-ecign-orange bg-ecign-orange text-on-brand hover:bg-ecign-orange/95 font-light"
                disabled={!attestationChecked}
                size="sm"
                onClick={() => {
                  setSignatureStaged(true);
                  setIsModalOpen(false);
                }}
              >
                Confirm & Complete eCIgn
              </Button>
            </div>
          }
        >
          <div className="grid gap-md text-sm">
            <div className="grid gap-xs">
              <span className="text-[10px] font-medium text-brand-teal uppercase tracking-wider">Signer Profile</span>
              <div className="rounded-md bg-tone-slate-bg p-md border border-hairline text-xs font-light text-secondary">
                <p><span className="font-medium text-ink">Name:</span> Thomas Parker</p>
                <p className="mt-xs"><span className="font-medium text-ink">Role:</span> Compliance Officer</p>
                <p className="mt-xs"><span className="font-medium text-ink">IP:</span> 192.0.2.44 (Managed Workstation)</p>
              </div>
            </div>

            <div className="grid gap-xs">
              <span className="text-[10px] font-medium text-brand-teal uppercase tracking-wider">Drawing Canvas</span>
              <div className="w-full h-[180px] rounded-lg border border-dashed border-ecign-navy bg-tone-slate-bg/50 relative overflow-hidden flex items-center justify-center">
                {/* Mock Drawn Signature representation */}
                <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
                  <span className="text-h1 font-heading text-ecign-navy rotate-[-6deg] opacity-75 font-medium italic select-none">
                    Thomas Parker
                  </span>
                </div>
                <div className="absolute bottom-md right-md flex gap-xs">
                  <button
                    className="px-sm py-xs text-[10px] bg-surface text-secondary hover:text-ink rounded border border-card shadow-rest"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Canvas cleared.');
                    }}
                    type="button"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-md rounded-md bg-tone-slate-bg p-md text-xs text-secondary mt-sm">
              <input
                type="checkbox"
                checked={attestationChecked}
                onChange={(e) => setAttestationChecked(e.target.checked)}
                className="mt-xs"
              />
              <span className="font-light">
                I attest that this signature represents my formal execution stamp for the associated GV-FM-006 Conflict disclosure packet.
              </span>
            </label>
          </div>
        </VeilModal>

        <aside className="grid content-start gap-lg" aria-label="Certificate and signing actions">
          <SurfaceCard card={certificateCard}>
            <dl className="grid gap-sm">
              {certificateRows.map(([label, value]) => (
                <div className="rounded-md border border-hairline bg-tone-slate-bg p-md" key={label}>
                  <dt className="text-tag uppercase tracking-tag text-muted">{label}</dt>
                  <dd className="mt-xs text-sm text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </SurfaceCard>

          <SurfaceCard card={readinessCard}>
            <ProgressMeter label="Ordered flow" tone="orange" value={68} />
          </SurfaceCard>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg">
              <ToneTag tone="teal">Action panels</ToneTag>
              <h2 className="mt-md text-h2 font-medium text-ink">Workspace actions</h2>
            </div>
            <div className="grid gap-md">
              {actionPanels.map((panel) => (
                <ActionPanelCard panel={panel} key={panel.title} />
              ))}
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}

function SignerCard({ signer }: { signer: Signer }) {
  return (
    <article className={cx('rounded-lg p-lg', toneGlassSurfaceClasses[signer.tone])}>
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="min-w-0">
          <div className="mb-sm flex flex-wrap items-center gap-sm">
            <ToneTag tone={signer.tone}>{signer.sequence}</ToneTag>
            <ToneBadge size="sm" status={signer.status} />
          </div>
          <h3 className="text-body font-light text-ink">{signer.name}</h3>
          <p className="mt-xs text-sm text-secondary">{signer.role}</p>
          <p className="mt-xs text-xs text-muted">{signer.due}</p>
        </div>
        <Button
          iconLeft={<Send aria-hidden="true" className="h-icon-sm w-icon-sm" />}
          size="sm"
          variant={signer.tone === 'orange' ? 'secondary' : 'tertiary'}
        >
          Reminder
        </Button>
      </div>
    </article>
  );
}

function SigningStepCard({ step }: { step: SigningStep }) {
  const Icon = step.icon;

  return (
    <article className="rounded-lg border border-card bg-surface p-md">
      <div className="flex items-start gap-md">
        <span className={cx('grid h-tap w-tap flex-none place-items-center rounded-md', toneSurfaceClasses[step.tone])}>
          <Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-xs flex flex-wrap items-center justify-between gap-sm">
            <h3 className="text-sm font-light text-ink">{step.label}</h3>
            <ToneBadge size="sm" status={step.status} />
          </div>
          <p className="text-xs text-muted">{step.description}</p>
          <ProgressMeter className="mt-md" label={step.key} tone={step.tone} value={step.progress} />
        </div>
      </div>
    </article>
  );
}

function ActionPanelCard({ panel }: { panel: ActionPanel }) {
  const Icon = panel.icon;

  return (
    <article className={cx('rounded-lg p-lg', toneGlassSurfaceClasses[panel.tone])}>
      <div className="mb-md flex flex-wrap items-start justify-between gap-md">
        <span className="grid h-tap w-tap place-items-center rounded-md bg-surface">
          <Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />
        </span>
        <ToneBadge size="sm" status={panel.status} />
      </div>
      <h3 className="text-body font-light text-ink">{panel.title}</h3>
      <p className="mt-xs text-sm text-secondary">{panel.body}</p>
      <Button className="mt-md w-full" size="sm" variant={panel.tone === 'orange' ? 'secondary' : 'tertiary'}>
        {panel.button}
      </Button>
    </article>
  );
}

export default EcignWorkspaceScreen;
