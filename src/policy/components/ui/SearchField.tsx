import type { InputHTMLAttributes, ReactNode } from 'react';
import { Search } from 'lucide-react';

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  leadingIcon?: ReactNode;
}

/** Token-driven search field. Pairs with `.ci-field`. */
export function SearchField({ leadingIcon, className, ...rest }: SearchFieldProps) {
  return (
    <label
      className={'inline-flex items-center gap-2 ' + (className ?? '')}
      style={{
        height: 36,
        padding: '0 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--ci-border-strong)',
        background: 'var(--ci-surface)',
        minWidth: 220,
      }}
    >
      <span style={{ color: 'var(--ci-text-subtle)' }}>
        {leadingIcon ?? <Search size={16} aria-hidden="true" />}
      </span>
      <input
        {...rest}
        type={rest.type ?? 'search'}
        className="bg-transparent border-0 outline-none w-full"
        style={{
          color: 'var(--ci-text-primary)',
          fontSize: 14,
          lineHeight: '20px',
        }}
      />
    </label>
  );
}
