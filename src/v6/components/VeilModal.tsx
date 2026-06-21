import { type ReactNode } from 'react';
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
  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-backdrop flex items-center justify-center bg-brand-teal/15 p-md backdrop-blur-sm">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <section 
        className={`relative z-modal max-h-[90vh] w-full ${maxWidthClass} overflow-y-auto rounded-lg border border-card bg-surface p-xl shadow-hover transition-all`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-md border-b border-hairline pb-lg">
          <div>
            <ToneBadge status={tone === 'orange' ? 'attention' : 'active'}>{eyebrow}</ToneBadge>
            <h3 className="mt-md text-h2 font-medium text-ink">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-card bg-surface p-sm text-muted hover:text-brand-teal focus:outline-none"
            aria-label="Close modal"
            type="button"
          >
            <X className="h-icon-sm w-icon-sm" />
          </button>
        </div>
        <div className="mt-xl">{children}</div>
        {footer && <div className="mt-xl border-t border-hairline pt-lg flex justify-end gap-md">{footer}</div>}
      </section>
    </div>,
    document.body
  );
}
