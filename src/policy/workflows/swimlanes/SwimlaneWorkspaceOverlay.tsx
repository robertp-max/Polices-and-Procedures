import { type ReactNode } from 'react';
import { GlobalModalBridge, type ModalBounds } from '@/contexts/ModalContext';

export function SwimlaneWorkspaceOverlay({
  id,
  children,
  onBackdropClick,
  workspaceRect: _workspaceRect,
}: {
  id: string;
  children: ReactNode;
  onBackdropClick: () => void;
  workspaceRect?: DOMRect | null;
}) {
  // Always use full viewport inset for clean full-bleed dim + no edge bleed from partial rects.
  // Card sizing uses CSS vars (defaults to 100vw/vh when no bounds).
  // High contained z (125 on popups, 140 on portal) + isolation + clip + token bgs only.
  const bounds: ModalBounds | null = null;

  return (
    <GlobalModalBridge
      open
      onClose={onBackdropClick}
      config={{
        id,
        content: children,
        variant: 'custom-surface',
        bounds,
        closeOnBackdrop: true,
        overlayClassName: 'swimlane-workspace-overlay animate-fadeIn',
        panelClassName: 'max-w-none overflow-hidden',
        // full live data driven popup surface, no bleed from shell. Prevents bleed over side nav / main card.
      }}
    />
  );
}
