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
        color: 'var(--v3-text-primary)',
        fontSize: 13,
      }}
    >
      {children}
    </table>
  );
}

DataGrid.Head = function GridHead({ children }: { children: ReactNode }) {
  return (
    <thead style={{ background: 'transparent' }}>{children}</thead>
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
        color: 'var(--v3-text-tertiary)',
        borderBottom: '1px solid var(--v3-border-subtle)',
        whiteSpace: 'nowrap',
        background: '#F7FEFF', /* match ref DataTable header neutral-50-ish pastel */
        fontWeight: 700,
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
      className={`${className ?? ''} hover:bg-brand-teal-50/40`} /* match ref DataTable row hover */
      style={{
        background: selected ? 'rgba(0, 209, 193, 0.06)' : 'transparent',
        boxShadow: 'none',
        transition: 'background-color 120ms var(--v3-ease)',
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
  colSpan,
  ...rest
}: HTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center'; colSpan?: number }) {
  return (
    <td
      {...rest}
      colSpan={colSpan}
      style={{
        textAlign: align,
        padding: '12px 16px',
        borderBottom: '1px solid var(--v3-border-subtle)',
        verticalAlign: 'top',
        ...rest.style,
      }}
    >
      {children}
    </td>
  );
};
