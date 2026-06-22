import { useEffect, useId, useState, type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { ToneBadge } from '../primitives';
import { cx } from '../utils/classNames';

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
  const titleId = useId();
  const [shouldRender, setShouldRender] = useState(open);
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      const id = window.setTimeout(() => setIsOpen(true), 16);
      return () => window.clearTimeout(id);
    } else {
      setIsOpen(false);
      const id = window.setTimeout(() => setShouldRender(false), 220);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    if (!shouldRender) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, shouldRender]);

  if (!shouldRender) return null;

  const drawerClass = cx(
    'relative z-drawer flex h-full w-full max-w-md flex-col overflow-hidden border-l border-card bg-surface shadow-hover transition-transform duration-base ease-standard',
    isOpen ? 'translate-x-0' : 'translate-x-3'
  );

  return ReactDOM.createPortal(
    <div className={cx(
      'fixed inset-0 z-backdrop flex justify-end bg-brand-teal/15 backdrop-blur-sm transition-opacity duration-base ease-standard',
      isOpen ? 'opacity-100' : 'opacity-0'
    )}>
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      <aside
        aria-labelledby={titleId}
        className={drawerClass}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-start justify-between gap-md border-b border-hairline p-lg">
          <div className="min-w-0">
            <ToneBadge status={tone === 'orange' ? 'attention' : 'active'}>{eyebrow}</ToneBadge>
            <h3 className="mt-sm text-h2 font-medium text-ink" id={titleId}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md border border-card bg-surface p-sm text-muted transition-all duration-fast ease-standard hover:text-brand-teal focus:outline-none focus-visible:shadow-focus"
            aria-label="Close drawer"
            type="button"
          >
            <X className="h-icon-sm w-icon-sm" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-lg">{children}</div>
        {footer && <div className="shrink-0 border-t border-hairline bg-surface p-lg">{footer}</div>}
      </aside>
    </div>,
    document.body
  );
}
