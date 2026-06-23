import { CesLayout } from '../layouts/CesLayout';
import { SprintExecutionBoard } from '../components/board/SprintExecutionBoard';

export function CesBoardPage() {
  // 4-col pastel MetricTile (UPCOMING/READY/BLOCKED/CERTIFIED + notes/tones per 03-md + 11-ces-board.png), prototype filter pills, kanban cards via SurfaceCard wrapper (children-only for ID badge first, Completion h-2 bg-white, no dupe icon/tone-badge/title) + flat columns + live data + 6 lanes. Structure aligned to ref PNG/MD (chips, progress, tones, SurfaceCard base). See ExecutionUnitCard + SprintExecutionBoard for exact card/column.
  return (
    <CesLayout>
      <SprintExecutionBoard />
    </CesLayout>
  );
}
