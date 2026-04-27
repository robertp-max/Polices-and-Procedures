interface Props {
  label: string;
  value: number | string;
  hint?: string;
  tone?: 'default' | 'warning' | 'danger' | 'success';
  onClick?: () => void;
}

const TONE = {
  default: 'border-[#E5E7EB] bg-white',
  warning: 'border-[#F2D2A4] bg-[#FBEDD7]',
  danger:  'border-[#F2BCBC] bg-[#FCF1F1]',
  success: 'border-[#BFE6CE] bg-[#F2FAF6]',
};

export function KpiTile({ label, value, hint, tone = 'default', onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left border ${TONE[tone]} rounded-[10px] p-4 transition hover:shadow-sm w-full`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">{label}</div>
      <div className="mt-2 text-[28px] font-semibold text-[#0B2545] tabular-nums leading-none">{value}</div>
      {hint && <div className="mt-2 text-[11px] text-[#4B5563]">{hint}</div>}
    </button>
  );
}
