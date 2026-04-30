import type { ReactNode, TableHTMLAttributes, HTMLAttributes } from 'react';

/** Token-driven table primitives. Compose: <DataGrid><DataGrid.Head>... */
export function DataGrid({ className, children, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      {...rest}
      className={className}
      style={{
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
        color: 'var(--ci-text-primary)',
        fontSize: 13,
      }}
    >
      {children}
    </table>
  );
}

DataGrid.Head = function GridHead({ children }: { children: ReactNode }) {
  return (
    <thead style={{ background: 'var(--ci-surface-muted)' }}>{children}</thead>
  );
};

DataGrid.HeaderRow = function HeaderRow({ children }: { children: ReactNode }) {
  return <tr>{children}</tr>;
};

DataGrid.HeaderCell = function HeaderCell({
  children,
  align = 'left',
  ...rest
}: HTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }) {
  return (
    <th
      {...rest}
      style={{
        textAlign: align,
        padding: '10px 16px',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: 'var(--ci-text-muted-2)',
        borderBottom: '1px solid var(--ci-border)',
        whiteSpace: 'nowrap',
        ...rest.style,
      }}
    >
      {children}
    </th>
  );
};

DataGrid.Body = function Body({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
};

DataGrid.Row = function Row({
  selected,
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }) {
  return (
    <tr
      {...rest}
      className={className}
      style={{
        background: selected ? 'var(--ci-info-bg)' : 'transparent',
        boxShadow: selected ? 'inset 2px 0 0 var(--ci-accent)' : undefined,
        transition: 'background 120ms ease',
        ...rest.style,
      }}
    >
      {children}
    </tr>
  );
};

DataGrid.Cell = function Cell({
  children,
  align = 'left',
  ...rest
}: HTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }) {
  return (
    <td
      {...rest}
      style={{
        textAlign: align,
        padding: '12px 16px',
        borderBottom: '1px solid var(--ci-border)',
        verticalAlign: 'top',
        ...rest.style,
      }}
    >
      {children}
    </td>
  );
};
