import { type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { ToneBadge } from '../primitives';

export interface VeilDrawerProps {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  tone?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function VeilDrawer({
  open,
  onClose,
  eyebrow,
  title,
  tone = 'teal',
  children,
  footer,
}: VeilDrawerProps) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-backdrop flex justify-end bg-brand-teal/15 backdrop-blur-sm">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <aside className="relative z-drawer flex h-full w-full max-w-md flex-col border-l border-card bg-surface shadow-hover transition-transform duration-base ease-standard">
        <div className="flex items-start justify-between gap-md border-b border-hairline p-xl">
          <div>
            <ToneBadge status={tone === 'orange' ? 'attention' : 'active'}>{eyebrow}</ToneBadge>
            <h3 className="mt-md text-h2 font-medium text-ink">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-card bg-surface p-sm text-muted hover:text-brand-teal focus:outline-none"
            aria-label="Close drawer"
            type="button"
          >
            <X className="h-icon-sm w-icon-sm" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-xl">{children}</div>
        {footer && <div className="border-t border-hairline p-xl bg-surface">{footer}</div>}
      </aside>
    </div>,
    document.body
  );
}
