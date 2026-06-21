import { ToneBadge } from '../primitives';
import { cx } from '../utils/classNames';

export interface DataTableColumn<Row> {
  key: keyof Row;
  label: string;
  render?: (row: Row) => string;
  status?: boolean;
}

export interface DataTableProps<Row extends Record<string, string>> {
  columns: readonly DataTableColumn<Row>[];
  label: string;
  rows: readonly Row[];
  onRowClick?: (row: Row) => void;
}

export function DataTable<Row extends Record<string, string>>({ columns, label, rows, onRowClick }: DataTableProps<Row>) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-transparent">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs" aria-label={label}>
          <thead className="bg-tone-slate-bg text-tag uppercase tracking-tag text-secondary">
            <tr>
              {columns.map((column) => (
                <th className="border-b border-card px-lg py-md font-light" key={String(column.key)} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                className={cx(
                  'transition duration-fast ease-standard hover:bg-surface-hover',
                  onRowClick && 'cursor-pointer',
                )}
                key={`${label}-${rowIndex}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column, columnIndex) => {
                  const value = column.render ? column.render(row) : row[column.key];

                  const isIdentityColumn = columnIndex === 0;
                  const isTitleColumn = columnIndex === 1;

                  return (
                    <td
                      className={cx(
                        'border-b border-hairline px-lg py-md leading-body text-secondary',
                        isIdentityColumn && 'whitespace-nowrap font-medium text-brand-teal',
                        isTitleColumn && 'font-medium text-ink',
                        column.status && 'whitespace-nowrap',
                      )}
                      key={String(column.key)}
                    >
                      {column.status ? <ToneBadge size="sm" status={value} /> : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

