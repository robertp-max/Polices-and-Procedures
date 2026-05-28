import { type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { VeilDrawer } from './VeilDrawer';

export type DrawerLayer =
  | { type: 'event'; eventId: string }
  | { type: 'task'; taskId: string; eventId?: string }
  | { type: 'evidence'; evidenceId: string; taskId: string }
  | { type: 'form'; formId: string; taskId: string }
  | { type: 'audit'; auditId: string };

export interface V3StackedDrawerHostProps {
  drawers: DrawerLayer[];
  renderLayer: (layer: DrawerLayer, index: number) => ReactNode;
  getLayerTitle: (layer: DrawerLayer) => ReactNode;
  getLayerEyebrow?: (layer: DrawerLayer) => string | undefined;
  onPop: () => void;
  onCloseAll: () => void;
}

export function V3StackedDrawerHost({
  drawers,
  renderLayer,
  getLayerTitle,
  getLayerEyebrow,
  onPop,
  onCloseAll,
}: V3StackedDrawerHostProps) {
  const open = drawers.length > 0;

  if (!open) return null;
  const topIndex = drawers.length - 1;
  const topLayer = drawers[topIndex];

  return (
    <VeilDrawer
      key={`${topLayer.type}-${layerId(topLayer)}`}
      open={open}
      onClose={onCloseAll}
      layer={topLayer.type === 'event' ? 1 : 2}
      eyebrow={getLayerEyebrow?.(topLayer)}
      title={getLayerTitle(topLayer)}
      headerActions={topIndex > 0 ? (
        <button
          type="button"
          className="v3-veil-close p-1.5 text-[var(--v3-text-secondary)] hover:text-[var(--v3-teal-light)]"
          aria-label="Back to parent drawer"
          onClick={onPop}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
      ) : undefined}
      width={topLayer.type === 'event' ? 'md' : 'lg'}
    >
      {renderLayer(topLayer, topIndex)}
    </VeilDrawer>
  );
}

function layerId(layer: DrawerLayer): string {
  switch (layer.type) {
    case 'event': return layer.eventId;
    case 'task': return layer.taskId;
    case 'evidence': return layer.evidenceId;
    case 'form': return layer.formId;
    case 'audit': return layer.auditId;
    default: return 'layer';
  }
}
