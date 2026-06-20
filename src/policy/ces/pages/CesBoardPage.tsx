import { CesLayout } from '../layouts/CesLayout';
import { SprintExecutionBoard } from '../components/board/SprintExecutionBoard';

export function CesBoardPage() {
  // PHASE 2: CES Board — SurfaceCard + ToneBadge + BorderGlow wrappers on kanban cards (real data, 6 states, no logic changes)
  return (
    <CesLayout>
      <SprintExecutionBoard />
    </CesLayout>
  );
}
