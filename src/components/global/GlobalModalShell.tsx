import { useEffect, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { useGlobalModal } from '@/contexts/ModalContext';

type OverlayStyle = CSSProperties & {
  '--global-modal-overlay-width': string;
  '--global-modal-overlay-height': string;
  '--global-modal-panel-max-width': string;
  '--global-modal-panel-max-height': string;
  '--swimlane-overlay-width': string;
  '--swimlane-overlay-height': string;
};

export function GlobalModalShell() {
  const { modal, closeModal } = useGlobalModal();

  useEffect(() => {
    if (!modal?.isOpen || modal.disableEscape) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (modal.requestClose) {
        modal.requestClose();
        return;
      }
      closeModal(modal.id);
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modal, closeModal]);

  if (typeof document === 'undefined' || !modal) return null;

  const viewportHeight = typeof window === 'undefined' ? 900 : window.innerHeight;
  const viewportWidth = typeof window === 'undefined' ? 1440 : window.innerWidth;

  const overlayStyle: OverlayStyle = modal.bounds ? {
    top: modal.bounds.top,
    left: modal.bounds.left,
    width: modal.bounds.width,
    height: modal.bounds.height,
    '--global-modal-overlay-width': `${modal.bounds.width}px`,
    '--global-modal-overlay-height': `${modal.bounds.height}px`,
    '--global-modal-panel-max-width': `${Math.max(320, Math.min(viewportWidth - 24, modal.bounds.width - 24))}px`,
    '--global-modal-panel-max-height': `${Math.max(320, Math.min(viewportHeight - 24, modal.bounds.height - 24))}px`,
    '--swimlane-overlay-width': `${modal.bounds.width}px`,
    '--swimlane-overlay-height': `${modal.bounds.height}px`,
  } : {
    inset: 0,
    '--global-modal-overlay-width': '100vw',
    '--global-modal-overlay-height': '100vh',
    '--global-modal-panel-max-width': `${Math.max(320, viewportWidth - 24)}px`,
    '--global-modal-panel-max-height': `${Math.max(320, viewportHeight - 24)}px`,
    '--swimlane-overlay-width': '100vw',
    '--swimlane-overlay-height': '100vh',
  };

  const requestClose = () => {
    if (modal.requestClose) {
      modal.requestClose();
      return;
    }
    closeModal(modal.id);
  };

  const overlayClassName = [
    'fixed z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden p-3 md:p-6 bg-[#0B0F15]/70 backdrop-blur-sm transition-opacity duration-300',
    modal.isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
    modal.overlayClassName ?? '',
  ].filter(Boolean).join(' ');

  const panelClassName = [
    modal.variant === 'custom-surface'
      ? 'max-h-[var(--global-modal-panel-max-height)] w-auto max-w-[var(--global-modal-panel-max-width)] shadow-2xl ring-1 ring-white/5 transition-[opacity] duration-300'
      : 'w-full max-h-[85vh] shadow-2xl ring-1 ring-white/5 transition-[opacity] duration-300',
    modal.maxWidthClassName ?? 'max-w-4xl',
    modal.variant === 'custom-surface' ? '' : 'bg-[#0F131A]',
    modal.panelClassName ?? '',
  ].filter(Boolean).join(' ');

  const content = modal.variant === 'custom-surface' ? modal.content : (
    <SpotlightCard
      className={panelClassName}
      spotlightColor={modal.spotlightColor ?? 'rgba(0, 121, 112, 0.15)'}
      style={modal.panelStyle}
      onClick={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div className="shrink-0 border-b border-[#1C2433] bg-[#141A23]/90 px-8 py-6 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[#007970]">
              {modal.eyebrow ?? (
                <span className="inline-flex items-center gap-1">
                  <Maximize2 size={10} />
                  Workspace Focus
                </span>
              )}
            </div>
            {modal.title ? <h2 className="text-2xl font-semibold leading-tight text-white">{modal.title}</h2> : null}
            {modal.subtitle ? <p className="mt-2 max-w-2xl text-sm text-[#A0ABC0]">{modal.subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {modal.headerActions}
            {!modal.hideClose ? (
              <button
                type="button"
                onClick={requestClose}
                className="rounded-lg p-2 text-[#5E6A7F] transition-colors hover:bg-[#1C2433] hover:text-white"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div className={['relative z-20 flex-1 overflow-y-auto p-8 custom-scrollbar', modal.bodyClassName ?? ''].join(' ')}>
        {modal.content}
      </div>
      {modal.footer ? (
        <div className="shrink-0 border-t border-[#1C2433] bg-[#141A23]/80 px-8 py-5 backdrop-blur-md">
          {modal.footer}
        </div>
      ) : null}
    </SpotlightCard>
  );

  return createPortal(
    <div
      className={overlayClassName}
      style={overlayStyle}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        if (modal.closeOnBackdrop === false) return;
        requestClose();
      }}
    >
      {modal.variant === 'custom-surface'
        ? (
          <div className="flex min-h-full w-full items-center justify-center">
            <div className={panelClassName}>{content}</div>
          </div>
        )
        : content}
    </div>,
    document.body,
  );
}
