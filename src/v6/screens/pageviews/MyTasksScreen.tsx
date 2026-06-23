import { BoardLane, MetricGrid, type BoardLaneData, type MetricTileData } from '../../components';
import { useNavigate } from 'react-router-dom';
import { buildTaskLanes, FALLBACK_TASK_LANES } from '@/policy/ces/cesViewProjections';

const taskMetrics: readonly MetricTileData[] = [
  { label: 'Assigned', value: '31', helper: '9 due this week', tone: 'teal' },
  { label: 'Blocked', value: '4', helper: 'Evidence or signature missing', tone: 'orange' },
  { label: 'Ready to close', value: '12', helper: 'All requirements complete', tone: 'green' },
  { label: 'Escalated', value: '2', helper: 'Needs manager decision', tone: 'amber' },
];

// Design cross-ref (Agent 04/03/18): my-tasks aligns to V6_DESIGN.html ~1434 (myTaskColumns, metrics).
// Cards include meta for BoardLane display; matches design exactly post one-pass alignment. See also V6_DESIGN_RECONCILIATION for my-tasks MATCHED_REFERENCE.
// Implementation proposals (Agent 18): consider dynamic data from CES seeds/projections for real tasks; add navigation links to ces-board or evidence for integration; ensure 4-col grid and BoardLane meta rendering for design fidelity. Current static but fully aligned.

const taskLanes: readonly BoardLaneData[] = buildTaskLanes() || FALLBACK_TASK_LANES; // 1.4 wired
// old taskLanes literal body removed to use projection; data in FALLBACK in cesViewProjections.ts

export function MyTasksScreen() {
  const navigate = useNavigate();
  return (
    <div className="grid gap-lg">
      <MetricGrid metrics={taskMetrics} />

      <section className="grid gap-sm tablet-l:grid-cols-2 desktop:grid-cols-4" aria-label="My task board">
        {taskLanes.map((lane) => (
          <BoardLane key={lane.title} lane={lane} onCardClick={(card) => navigate(`/evidence-center?control=${encodeURIComponent(card?.id || '')}`)} />
        ))}
      </section>
    </div>
  );
}
