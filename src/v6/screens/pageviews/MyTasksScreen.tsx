import { BoardLane, MetricGrid, type BoardLaneData, type MetricTileData } from '../../components';
import { useNavigate } from 'react-router-dom';
import { buildSprintSummary, buildTaskLanes } from '@/policy/ces/cesViewProjections';

const sprint = buildSprintSummary();
const taskMetrics: readonly MetricTileData[] = [
  { label: 'Assigned', value: String(sprint.total), helper: `${sprint.overdue} overdue`, tone: 'teal' },
  { label: 'Blocked', value: String(sprint.blocked), helper: 'Evidence or signature missing', tone: 'orange' },
  { label: 'Ready to close', value: String(sprint.completed), helper: 'All requirements complete', tone: 'green' },
  { label: 'Escalated', value: String(sprint.overdue), helper: 'Needs manager decision', tone: 'amber' },
];

// Design cross-ref (Agent 04/03/18): my-tasks aligns to V6_DESIGN.html ~1434 (myTaskColumns, metrics).
// Cards include meta for BoardLane display; matches design exactly post one-pass alignment. See also V6_DESIGN_RECONCILIATION for my-tasks MATCHED_REFERENCE.
// Data source: real V3 ExecutionUnitsSeed via buildTaskLanes + buildSprintSummary (no placeholders, full seed records).

const taskLanes: readonly BoardLaneData[] = buildTaskLanes();

export function MyTasksScreen() {
  const navigate = useNavigate();
  return (
    <div className="grid gap-lg">
      <MetricGrid metrics={taskMetrics} />

      <section className="grid gap-sm tablet-l:grid-cols-2 desktop:grid-cols-4" aria-label="My task board">
        {taskLanes.map((lane) => (
          <BoardLane key={lane.title} lane={lane} onCardClick={(card) => navigate(`/evidence?control=${encodeURIComponent(card?.id || '')}`)} />
        ))}
      </section>
    </div>
  );
}
