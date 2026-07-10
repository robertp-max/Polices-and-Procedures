import { useEffect, useId, type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { ToneBadge } from '../primitives';

export interface VeilModalProps {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  tone?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClass?: string;
}

export function VeilModal({
  open,
  onClose,
  eyebrow,
  title,
  tone = 'teal',
  children,
  footer,
  maxWidthClass = 'max-w-modal-md',
}: VeilModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-backdrop flex items-center justify-center bg-brand-teal/15 p-md backdrop-blur-sm">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <section 
        className={`v6-modal-surface relative z-modal flex max-h-[90vh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-lg border border-card backdrop-blur-md`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex shrink-0 items-start justify-between gap-md border-b border-hairline p-lg">
          <div className="min-w-0">
            <ToneBadge status={tone === 'orange' ? 'attention' : 'active'}>{eyebrow}</ToneBadge>
            <h3 className="mt-sm text-h2 font-medium text-ink" id={titleId}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-sm text-muted transition duration-fast ease-standard hover:text-brand-teal focus:outline-none focus-visible:shadow-focus"
            aria-label="Close modal"
            type="button"
          >
            <X className="h-icon-sm w-icon-sm" />
          </button>
        </div>
        <div className="v6-modal-content min-h-0 flex-1 overflow-y-auto p-lg">{children}</div>
        {footer && <div className="flex shrink-0 justify-end gap-md border-t border-hairline p-lg">{footer}</div>}
      </section>
    </div>,
    document.body
  );
}
