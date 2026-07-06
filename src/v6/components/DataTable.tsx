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
    <div className="overflow-hidden rounded-xl border border-card bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs" aria-label={label}>
          <thead className="bg-surface-hover text-[10px] font-bold uppercase tracking-wider text-brand-teal-deep border-b border-card">
            <tr>
              {columns.map((column) => (
                <th className="whitespace-nowrap px-4 py-3 font-bold text-brand-teal-deep" key={String(column.key)} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                className={cx(
                  'transition duration-150 hover:bg-surface-hover',
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
                        'border-b border-card px-4 py-3 text-xs text-ink leading-normal',
                        isIdentityColumn && 'whitespace-nowrap font-bold text-brand-teal',
                        isTitleColumn && 'font-bold text-brand-teal-deep',
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
