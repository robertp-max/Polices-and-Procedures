import { ShieldAlert, BookOpen, AlertTriangle, Plus } from 'lucide-react';
import { useState } from 'react';
import { MetricGrid, DataTable, VeilModal, type MetricTileData, type DataTableColumn } from '../../components';
import { Button } from '../../primitives';
import { buildSeedSnapshot } from '@/policy/onboarding-v2/store/seed';

interface OverrideRow extends Record<string, string> {
  overrideId: string;
  subject: string;
  gate: string;
  reason: string;
  approvers: string;
  status: string;
}

const snap = buildSeedSnapshot();
const ovCount = (snap.overrides || []).length;
const activeO = (snap.overrides || []).filter((o: any) => o.status === 'Active').length;
const expiredish = Math.max(0, ovCount - activeO);
const metrics = [
  { label: 'Active Overrides', value: String(activeO || 0), helper: 'Active dual-signature overrides (from seed)', tone: 'orange' },
  { label: 'Pending Sign-off', value: String(Math.max(0, ovCount - activeO)), helper: 'Awaiting secondary supervisor', tone: 'amber' },
  { label: 'Expired Overrides', value: String(expiredish), helper: 'Completed or deactivated overrides', tone: 'teal' },
] satisfies readonly MetricTileData[];

const columns: readonly DataTableColumn<OverrideRow>[] = [
  { key: 'overrideId', label: 'Override ID' },
  { key: 'subject', label: 'Subject' },
  { key: 'gate', label: 'Gate' },
  { key: 'reason', label: 'Bypass Reason' },
  { key: 'approvers', label: 'Approvers Pair' },
  { key: 'status', label: 'State', status: true },
];

const initialRows: readonly OverrideRow[] = (snap.overrides || []).length ? snap.overrides.map((o: any) => ({
  overrideId: o.id,
  subject: o.subjectId,
  gate: o.gateOrRuleId || 'Gate',
  reason: o.reason || 'Seed override',
  approvers: (o.signerIds || []).join(' / ') || 'DON / Compliance',
  status: (o.status || 'active').toLowerCase() === 'active' ? 'review-required' : 'complete',
})) : [
  { overrideId: 'OVR-seed', subject: 'seed-subject', gate: 'Governance', reason: 'Seed demo (no overrides in current snap)', approvers: 'system', status: 'complete' },
];

export function OnboardingV2GovernanceScreen() {
  const [rows, setRows] = useState<readonly OverrideRow[]>(initialRows);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [targetLearner, setTargetLearner] = useState('James Carter');
  const [targetGate, setTargetGate] = useState('Gate 3: Health & Safety');
  const [overrideReason, setOverrideReason] = useState('Primary source latency');
  const [expirationWindow, setExpirationWindow] = useState('30');
  const [dualApprover1, setDualApprover1] = useState('Dr. Elena Navarro, RN DON');
  const [dualApprover2, setDualApprover2] = useState('Compliance Officer');
  const [attested, setAttested] = useState(false);

  const handleCreateOverride = () => {
    const newOverride: OverrideRow = {
      overrideId: `OVR-${Math.floor(104 + Math.random() * 100)}`,
      subject: targetLearner,
      gate: targetGate,
      reason: overrideReason,
      approvers: `${dualApprover1.split(',')[0]} / ${dualApprover2}`,
      status: 'awaiting',
    };
    setRows([newOverride, ...rows]);
    setIsOverrideOpen(false);
  };

  return (
    <section
      className="grid gap-lg"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-governance"
      data-route="/onboarding-v2/governance"
      data-template="reports"
    >
      <MetricGrid metrics={metrics} />

      <section className="grid gap-lg desktop:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="grid content-start gap-md">
          <section className="rounded-lg border border-card bg-surface p-lg shadow-rest">
            <div className="mb-md flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Override Authorizations</h3>
                <p className="mt-xs text-sm text-muted">Auditable logs of active and signed bypass settings.</p>
              </div>
              <Button
                className="border-brand-orange text-brand-orange hover:bg-tone-orange-bg font-light"
                iconLeft={<Plus aria-hidden="true" className="h-icon-sm w-icon-sm" />}
                onClick={() => setIsOverrideOpen(true)}
                size="sm"
                variant="secondary"
              >
                Request override
              </Button>
            </div>
            <DataTable columns={columns} label="Override authorizations table" rows={rows} />
          </section>
        </div>

        <aside className="grid content-start gap-md" aria-label="Governance checks">
          <section className="rounded-lg border border-card bg-surface p-lg shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <ShieldAlert aria-hidden="true" className="h-icon-sm w-icon-sm text-tone-orange-text" />
              Safety Alerts
            </h3>
            <div className="rounded-md bg-tone-orange-bg p-md text-sm text-tone-orange-text flex items-start gap-sm mb-md">
              <AlertTriangle aria-hidden="true" className="h-icon-sm w-icon-sm shrink-0 mt-xs" />
              <div>
                <p className="font-medium">Approver pairs must match</p>
                <p className="text-xs mt-xs opacity-90">All overrides require a designated Clinical Director + Compliance Officer or HR Director pair signature.</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface p-lg shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <BookOpen aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Audit Constraints
            </h3>
            <p className="text-sm text-secondary">
              Overrides carry strict expiration gates. Expired entries automatically block subject logins and trigger supervisor email warnings.
            </p>
          </section>
        </aside>
      </section>

      <VeilModal
        open={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        eyebrow="Governance Control"
        title="Override Request Form"
        tone="orange"
        footer={
          <div className="flex justify-end gap-md">
            <Button onClick={() => setIsOverrideOpen(false)} variant="secondary" size="sm">
              Cancel
            </Button>
            <Button
              className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange font-light"
              disabled={!attested || !targetLearner || !targetGate}
              onClick={handleCreateOverride}
              size="sm"
            >
              Issue Override
            </Button>
          </div>
        }
      >
        <div className="grid gap-md text-sm">
          <div className="grid gap-xs">
            <label className="text-[10px] font-medium uppercase tracking-wider text-brand-teal">Target Learner</label>
            <input
              type="text"
              value={targetLearner}
              onChange={(e) => setTargetLearner(e.target.value)}
              className="w-full rounded-md border border-card bg-tone-slate-bg px-3 py-2 text-sm text-secondary outline-none focus:border-brand-teal font-light"
              placeholder="e.g. James Carter"
            />
          </div>

          <div className="grid gap-xs">
            <label className="text-[10px] font-medium uppercase tracking-wider text-brand-teal">Target Gate</label>
            <select
              value={targetGate}
              onChange={(e) => setTargetGate(e.target.value)}
              className="w-full rounded-md border border-card bg-tone-slate-bg px-3 py-2 text-sm text-secondary outline-none focus:border-brand-teal font-light"
            >
              <option value="Gate 1: Background & Screening">Gate 1: Background & Screening</option>
              <option value="Gate 2: Credentials & License">Gate 2: Credentials & License</option>
              <option value="Gate 3: Health & Safety">Gate 3: Health & Safety</option>
              <option value="Gate 4: Orientation Training">Gate 4: Orientation Training</option>
              <option value="Gate 5: Supervised Visit">Gate 5: Supervised Visit</option>
            </select>
          </div>

          <div className="grid gap-xs">
            <label className="text-[10px] font-medium uppercase tracking-wider text-brand-teal">Override Reason</label>
            <select
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full rounded-md border border-card bg-tone-slate-bg px-3 py-2 text-sm text-secondary outline-none focus:border-brand-teal font-light"
            >
              <option value="Primary source latency">Primary source latency</option>
              <option value="TB screening delay">TB screening delay</option>
              <option value="Orientation module transfer">Orientation module transfer</option>
              <option value="Temporary license extension">Temporary license extension</option>
            </select>
          </div>

          <div className="grid gap-xs">
            <label className="text-[10px] font-medium uppercase tracking-wider text-brand-teal">Expiration Window (valid 30 days max)</label>
            <input
              type="number"
              max={30}
              min={1}
              value={expirationWindow}
              onChange={(e) => setExpirationWindow(e.target.value)}
              className="w-full rounded-md border border-card bg-tone-slate-bg px-3 py-2 text-sm text-secondary outline-none focus:border-brand-teal font-light"
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="grid gap-xs">
              <label className="text-[10px] font-medium uppercase tracking-wider text-brand-teal">Dual Approver 1</label>
              <input
                type="text"
                value={dualApprover1}
                onChange={(e) => setDualApprover1(e.target.value)}
                className="w-full rounded-md border border-card bg-tone-slate-bg px-3 py-2 text-sm text-secondary outline-none focus:border-brand-teal font-light"
                readOnly
              />
            </div>
            <div className="grid gap-xs">
              <label className="text-[10px] font-medium uppercase tracking-wider text-brand-teal">Dual Approver 2</label>
              <select
                value={dualApprover2}
                onChange={(e) => setDualApprover2(e.target.value)}
                className="w-full rounded-md border border-card bg-tone-slate-bg px-3 py-2 text-sm text-secondary outline-none focus:border-brand-teal font-light"
              >
                <option value="Compliance Officer">Compliance Officer</option>
                <option value="HR Director">HR Director</option>
              </select>
            </div>
          </div>

          <label className="flex items-start gap-md rounded-md bg-tone-slate-bg p-md text-xs text-secondary mt-sm">
            <input
              type="checkbox"
              checked={attested}
              onChange={(e) => setAttested(e.target.checked)}
              className="mt-xs"
            />
            <span className="font-light">
              I certify that this override carries active clinical supervision and does not violate any conditions of our home health agency participation.
            </span>
          </label>
        </div>
      </VeilModal>
    </section>
  );
}
