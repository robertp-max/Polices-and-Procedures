import { BoardLane, MetricGrid, type BoardLaneData, type MetricTileData } from '../../components';

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
    ],
    count: 9,
    title: 'Today',
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
    ],
    count: 10,
    title: 'Clinical Review',
    tone: 'teal',
  },
  {
    cards: [
      {
        chips: ['Credential', 'Packet', 'Blocked'],
        due: 'Jun 23',
        id: 'MT-206',
        owner: 'HR Credentialing',
        progress: 38,
        title: 'PT credential renewal packet',
        tone: 'orange',
      },
      {
        chips: ['Orders', 'Signature', 'Blocked'],
        due: 'Jun 21',
        id: 'MT-213',
        owner: 'Compliance Officer',
        progress: 44,
        title: 'Physician signature packet hold',
        tone: 'amber',
      },
    ],
    count: 4,
    title: 'Blocked',
    tone: 'orange',
  },
  {
    cards: [
      {
        chips: ['QAPI', 'Minutes', 'Close'],
        due: 'Jun 25',
        id: 'MT-309',
        owner: 'Administrator',
        progress: 91,
        title: 'Close QAPI minutes packet',
        tone: 'green',
      },
      {
        chips: ['Discharge', 'Teaching', 'Evidence'],
        due: 'Jun 24',
        id: 'MT-307',
        owner: 'Clinical Manager',
        progress: 94,
        title: 'Discharge teaching checklist',
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
    <div className="grid gap-xl">
      <MetricGrid metrics={taskMetrics} />

      <section className="grid gap-lg desktop:grid-cols-4" aria-label="My task board">
        {taskLanes.map((lane) => (
          <BoardLane key={lane.title} lane={lane} />
        ))}
      </section>
    </div>
  );
}

export default MyTasksScreen;
