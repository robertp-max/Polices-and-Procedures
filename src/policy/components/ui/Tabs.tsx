import type { ReactNode } from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  variant?: 'segmented' | 'underline';
  className?: string;
  ariaLabel?: string;
}

/** Token-driven Tabs — segmented (compact) or underline (page-level). */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = 'underline',
  className,
  ariaLabel,
}: TabsProps<T>) {
  if (variant === 'segmented') {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={className}
        style={{
          display: 'inline-flex',
          gap: 4,
          padding: 4,
          background: 'transparent',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {items.map(it => {
          const active = it.id === value;
          return (
            <button
              key={it.id}
              role="tab"
              type="button"
              aria-selected={active ? 'true' : 'false'}
              disabled={it.disabled}
              onClick={() => onChange(it.id)}
              style={{
                height: 28,
                padding: '0 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: active ? 'rgba(0, 209, 193, 0.1)' : 'transparent',
                color: active ? 'var(--v3-text-primary)' : 'var(--v3-text-secondary)',
                boxShadow: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: it.disabled ? 'not-allowed' : 'pointer',
                opacity: it.disabled ? 0.4 : 1,
              }}
            >
              {it.label}
              {it.badge != null && <span className="ml-2">{it.badge}</span>}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={className}
      style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--v3-border-subtle)' }}
    >
      {items.map(it => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            role="tab"
            type="button"
            aria-selected={active ? 'true' : 'false'}
            disabled={it.disabled}
            onClick={() => onChange(it.id)}
            style={{
              padding: '12px 0',
              border: 'none',
              background: 'transparent',
              color: active ? 'var(--v3-teal-light)' : 'var(--v3-text-secondary)',
              borderBottom: active ? '2px solid var(--v3-teal-light)' : '2px solid transparent',
              fontSize: 14,
              fontWeight: 600,
              cursor: it.disabled ? 'not-allowed' : 'pointer',
              opacity: it.disabled ? 0.4 : 1,
              transition: 'color 120ms ease, border-color 120ms ease',
            }}
          >
            {it.label}
            {it.badge != null && <span className="ml-2">{it.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
