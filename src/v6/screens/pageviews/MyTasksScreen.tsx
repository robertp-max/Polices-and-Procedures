import {
  BoardLane,
  MetricGrid,
  SurfaceCard,
  ToneTag,
  type BoardLaneData,
  type MetricTileData,
  type SurfaceCardData,
} from '../../components';
import { type Tone } from '../../tokens';

interface ActionSummaryItem {
  helper: string;
  label: string;
  tone: Tone;
  value: string;
}

const taskMetrics: readonly MetricTileData[] = [
  { label: 'Assigned', value: '31', helper: '9 due this week', tone: 'teal' },
  { label: 'Blocked', value: '4', helper: 'Evidence or signature missing', tone: 'orange' },
  { label: 'Ready to close', value: '12', helper: 'All requirements complete', tone: 'green' },
  { label: 'Escalated', value: '2', helper: 'Needs manager decision', tone: 'amber' },
];

const taskLanes: readonly BoardLaneData[] = [
  {
    cards: [
      {
        chips: ['SOC', 'Coverage', 'Evidence'],
        due: 'Today 3:00 PM',
        id: 'MT-101',
        owner: 'Clinical Manager',
        progress: 64,
        title: 'Confirm SOC nurse backup',
        tone: 'orange',
      },
      {
        chips: ['Staffing', 'Route', 'Evidence'],
        due: 'Today 4:30 PM',
        id: 'MT-102',
        owner: 'Scheduler',
        progress: 42,
        title: 'Route CHHA weekend pool',
        tone: 'orange',
      },
      {
        chips: ['Orders', 'Signature', 'Blocked'],
        due: 'Jun 21',
        id: 'MT-103',
        owner: 'Compliance Officer',
        progress: 55,
        title: 'Physician order signature follow-up',
        tone: 'amber',
      },
    ],
    count: 9,
    title: 'Todo',
    tone: 'orange',
  },
  {
    cards: [
      {
        chips: ['Recert', 'Care plan', 'Evidence'],
        due: 'Jun 22',
        id: 'MT-204',
        owner: 'Maria Delgado, RN',
        progress: 82,
        title: 'Review recert visit cadence',
        tone: 'teal',
      },
      {
        chips: ['Audit', 'Medication', 'Evidence'],
        due: 'Jun 22',
        id: 'MT-205',
        owner: 'QAPI Nurse',
        progress: 71,
        title: 'Medication reconciliation audit',
        tone: 'teal',
      },
      {
        chips: ['Credential', 'Packet', 'Blocked'],
        due: 'Jun 23',
        id: 'MT-206',
        owner: 'HR Credentialing',
        progress: 38,
        title: 'PT credential renewal packet',
        tone: 'orange',
      },
    ],
    count: 10,
    title: 'In Progress',
    tone: 'teal',
  },
  {
    cards: [
      {
        chips: ['Discharge', 'Teaching', 'Evidence'],
        due: 'Jun 24',
        id: 'MT-307',
        owner: 'Clinical Manager',
        progress: 94,
        title: 'Discharge teaching checklist',
        tone: 'green',
      },
      {
        chips: ['Wound', 'Photo', 'Evidence'],
        due: 'Jun 24',
        id: 'MT-308',
        owner: 'QAPI Nurse',
        progress: 88,
        title: 'Wound photo evidence approved',
        tone: 'green',
      },
      {
        chips: ['QAPI', 'Minutes', 'Close'],
        due: 'Jun 25',
        id: 'MT-309',
        owner: 'Administrator',
        progress: 91,
        title: 'Close QAPI minutes packet',
        tone: 'green',
      },
    ],
    count: 12,
    title: 'Done',
    tone: 'green',
  },
];

const actionSummaryCard: SurfaceCardData = {
  body: 'Personal queue posture for the next same-day actions, evidence follow-up, and close-ready compliance units.',
  progress: 78,
  status: 'review-required',
  title: 'Action summary',
  tone: 'orange',
};

const actionSummaryItems: readonly ActionSummaryItem[] = [
  {
    helper: 'Start with same-day coverage and order signatures before the afternoon review window.',
    label: 'Next focus',
    tone: 'orange',
    value: '3 urgent tasks',
  },
  {
    helper: 'Ready cards have all requirements complete and can be certified after manager glance.',
    label: 'Close queue',
    tone: 'green',
    value: '12 ready',
  },
  {
    helper: 'Most open cards already carry source proof; four need either evidence or eCIgn.',
    label: 'Evidence posture',
    tone: 'teal',
    value: '87% attached',
  },
];

export function MyTasksScreen() {
  return (
    <div className="grid gap-xl">
      <MetricGrid metrics={taskMetrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,1fr)_340px]">
        <section className="grid gap-lg">
          <div className="flex flex-wrap items-start justify-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest">
            <div className="grid gap-sm">
              <ToneTag tone="teal">/my-tasks</ToneTag>
              <div>
                <h2 className="text-h2 font-medium text-ink">Personal CES task board</h2>
                <p className="mt-xs max-w-content text-sm text-muted">
                  Persona-gated compliance work assigned to the current user, grouped by execution state with due dates,
                  owners, and evidence markers.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-sm">
              <ToneTag tone="teal">my-tasks</ToneTag>
              <ToneTag tone="slate">board</ToneTag>
              <ToneTag tone="orange">CES</ToneTag>
            </div>
          </div>

          <div className="grid gap-lg desktop:grid-cols-3">
            {taskLanes.map((lane) => (
              <BoardLane key={lane.title} lane={lane} />
            ))}
          </div>
        </section>

        <aside className="grid content-start gap-lg">
          <SurfaceCard card={actionSummaryCard}>
            <div className="grid gap-sm">
              {actionSummaryItems.map((item) => (
                <div className="rounded-md border border-card bg-tone-slate-bg p-md" key={item.label}>
                  <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                    <p className="text-tag uppercase tracking-tag text-secondary">{item.label}</p>
                    <ToneTag tone={item.tone}>{item.value}</ToneTag>
                  </div>
                  <p className="text-sm text-muted">{item.helper}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <h2 className="text-h2 font-medium text-ink">Owner handoffs</h2>
                <p className="mt-xs text-sm text-muted">Small summary of the people waiting on action.</p>
              </div>
              <ToneTag tone="amber">2 escalated</ToneTag>
            </div>
            <div className="grid gap-sm">
              {[
                ['Clinical Manager', 'SOC backup and discharge checklist', 'orange'],
                ['QAPI Nurse', 'Medication audit and wound evidence', 'teal'],
                ['Administrator', 'QAPI minutes packet final glance', 'green'],
              ].map(([owner, detail, tone]) => (
                <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md" key={owner}>
                  <div>
                    <p className="text-sm font-medium text-ink">{owner}</p>
                    <p className="mt-xs text-xs text-muted">{detail}</p>
                  </div>
                  <ToneTag tone={tone as Tone}>owner</ToneTag>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

export default MyTasksScreen;
