import { type ReactNode } from 'react';
import { GlobalModalBridge, type ModalBounds } from '@/contexts/ModalContext';

export function SwimlaneWorkspaceOverlay({
  id,
  workspaceRect,
  children,
  onBackdropClick,
}: {
  id: string;
  workspaceRect: DOMRect | null;
  children: ReactNode;
  onBackdropClick: () => void;
}) {
  const shouldUseViewport = !workspaceRect || workspaceRect.width < 960 || workspaceRect.height < 640;
  const bounds: ModalBounds | null = shouldUseViewport ? null : {
    top: workspaceRect.top,
    left: workspaceRect.left,
    width: workspaceRect.width,
    height: workspaceRect.height,
  };

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
        overlayClassName: 'swimlane-workspace-overlay bg-[#0b0f15]/75 animate-fadeIn',
        panelClassName: 'max-w-none',
      }}
    />
  );
}
