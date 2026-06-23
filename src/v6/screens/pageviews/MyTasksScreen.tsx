import { BoardLane, MetricGrid, type BoardLaneData, type MetricTileData } from '../../components';

const taskMetrics: readonly MetricTileData[] = [
  { label: 'Assigned', value: '31', helper: '9 due this week', tone: 'teal' },
  { label: 'Blocked', value: '4', helper: 'Evidence or signature missing', tone: 'orange' },
  { label: 'Ready to close', value: '12', helper: 'All requirements complete', tone: 'green' },
  { label: 'Escalated', value: '2', helper: 'Needs manager decision', tone: 'amber' },
];

// Design cross-ref (Agent 04/03/18): my-tasks aligns to V6_DESIGN.html ~1434 (myTaskColumns, metrics).
// Cards include meta for BoardLane display; matches design exactly post one-pass alignment. See also V6_DESIGN_RECONCILIATION for my-tasks MATCHED_REFERENCE.
// Implementation proposals (Agent 18): consider dynamic data from CES seeds/projections for real tasks; add navigation links to ces-board or evidence for integration; ensure 4-col grid and BoardLane meta rendering for design fidelity. Current static but fully aligned.

const taskLanes: readonly BoardLaneData[] = [
  {
    cards: [
      {
        chips: ['SOC', 'Coverage'],
        due: 'Today 3:00 PM',
        id: 'MT-101',
        owner: 'Clinical Manager',
        meta: 'Elena Vargas - HH-88291',
        progress: 64,
        title: 'Confirm SOC nurse backup',
        tone: 'orange',
      },
      {
        chips: ['Staffing'],
        due: 'Today 4:30 PM',
        id: 'MT-102',
        owner: 'Scheduler',
        meta: 'Two high-acuity patients',
        progress: 42,
        title: 'Route CHHA weekend pool',
        tone: 'orange',
      },
    ],
    count: 9,
    title: 'Today',
    tone: 'orange',
  },
  {
    cards: [
      {
        chips: ['Recert'],
        due: 'Jun 19',
        id: 'MT-204',
        owner: 'Maria Delgado, RN',
        meta: 'Robert Hale - HH-88402',
        progress: 82,
        title: 'Review recert visit cadence',
        tone: 'teal',
      },
      {
        chips: ['Audit'],
        due: 'Jun 20',
        id: 'MT-205',
        owner: 'QAPI Nurse',
        meta: 'Five chart sample',
        progress: 71,
        title: 'Medication reconciliation audit',
        tone: 'teal',
      },
    ],
    count: 10,
    title: 'Clinical Review',
    tone: 'teal',
  },
  {
    cards: [
      {
        chips: ['Credential'],
        due: 'Jun 22',
        id: 'MT-206',
        owner: 'HR Credentialing',
        meta: 'James Kwon, PT',
        progress: 38,
        title: 'PT credential renewal packet',
        tone: 'orange',
      },
      {
        chips: ['Orders'],
        due: 'Jun 23',
        id: 'MT-213',
        owner: 'Clinical Ops',
        meta: 'Five pending signatures',
        progress: 55,
        title: 'Physician order signature follow-up',
        tone: 'amber',
      },
    ],
    count: 4,
    title: 'Blocked',
    tone: 'amber',
  },
  {
    cards: [
      {
        chips: ['Discharge'],
        due: 'Jun 24',
        id: 'MT-307',
        owner: 'Nora Patel, MSW',
        meta: 'George Lin - HH-88910',
        progress: 94,
        title: 'Discharge teaching checklist',
        tone: 'green',
      },
      {
        chips: ['Evidence'],
        due: 'Jun 21',
        id: 'MT-308',
        owner: 'QAPI Nurse',
        meta: 'Amina Yusuf - HH-88701',
        progress: 88,
        title: 'Wound photo evidence approved',
        tone: 'green',
      },
    ],
    count: 12,
    title: 'Ready',
    tone: 'green',
  },
];

export function MyTasksScreen() {
  return (
    <div className="grid gap-lg">
      <MetricGrid metrics={taskMetrics} />

      <section className="grid gap-sm tablet-l:grid-cols-2 desktop:grid-cols-4" aria-label="My task board">
        {taskLanes.map((lane) => (
          <BoardLane key={lane.title} lane={lane} />
        ))}
      </section>
    </div>
  );
}
