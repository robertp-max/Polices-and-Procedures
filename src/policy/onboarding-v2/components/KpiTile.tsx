interface Props {
  label: string;
  value: number | string;
  hint?: string;
  tone?: 'default' | 'warning' | 'danger' | 'success';
  onClick?: () => void;
}

const TONE = {
  default: 'ci-border-overlay ci-bg-overlay-faint',
  warning: 'border-[var(--ci-warning-bdr)] ci-bg-warning-soft',
  danger:  'border-[var(--ci-danger-bdr)] ci-bg-danger-soft',
  success: 'ci-border-success ci-bg-success-soft',
};

export function KpiTile({ label, value, hint, tone = 'default', onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left border ${TONE[tone]} rounded-[10px] p-4 transition-colors w-full`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider ci-text-subtle">{label}</div>
      <div className="mt-2 text-[28px] font-semibold ci-text tabular-nums leading-none">{value}</div>
      {hint && <div className="mt-2 text-[11px] ci-text-muted">{hint}</div>}
    </button>
  );
}
