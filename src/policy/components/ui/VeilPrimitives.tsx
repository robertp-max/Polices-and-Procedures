import { type ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface TaskRowMinimalProps {
  title: ReactNode;
  status?: ReactNode;
  meta?: ReactNode;
  onClick?: () => void;
}

export function TaskRowMinimal({ title, status, meta, onClick }: TaskRowMinimalProps) {
  return (
    <button
      type="button"
      className="v3-task-row-minimal w-full text-left"
      onClick={onClick}
    >
      <span className="v3-veil-highlight-orange min-w-0 flex-1 truncate">{title}</span>
      {meta ? <span className="truncate text-[var(--v3-text-tertiary)]">{meta}</span> : null}
      {status ? <span className="shrink-0 text-[var(--v3-text-secondary)]">{status}</span> : null}
    </button>
  );
}

export interface VeilSectionProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function VeilSection({ title, children, defaultOpen = false }: VeilSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="v3-veil-section">
      <button
        type="button"
        className="v3-veil-section-trigger"
        onClick={() => setOpen(value => !value)}
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={open ? 'v3-veil-section-chevron-open' : undefined}
        />
      </button>
      {open ? <div className="v3-veil-section-body">{children}</div> : null}
    </section>
  );
}

export function VeilCriticalText({ children }: { children: ReactNode }) {
  return <span className="v3-veil-highlight-red">{children}</span>;
}
