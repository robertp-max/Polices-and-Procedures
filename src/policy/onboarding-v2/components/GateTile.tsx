import { Lock, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import type { GateResult } from '../engine/gates';
import { GATE_LABEL } from '../engine/gates';

const ICON = {
  Pass:        ShieldCheck,
  Fail:        ShieldAlert,
  Conditional: Lock,
  Pending:     ShieldQuestion,
};
const COLOR = {
  Pass:        { ring: 'border-[#BFE6CE]', bg: 'bg-[#F2FAF6]', text: 'text-[#1F8A4C]', label: 'Pass' },
  Fail:        { ring: 'border-[#F2BCBC]', bg: 'bg-[#FCF1F1]', text: 'text-[#B42318]', label: 'Fail' },
  Conditional: { ring: 'border-[#F2D2A4]', bg: 'bg-[#FBEDD7]', text: 'text-[#B45309]', label: 'Conditional Override' },
  Pending:     { ring: 'border-[#E5E7EB]', bg: 'bg-[#F7F8FA]', text: 'text-[#4B5563]', label: 'Pending' },
};

interface Props {
  result: GateResult;
  lastEvalAt?: string;
  onView?: () => void;
}

export function GateTile({ result, lastEvalAt, onView }: Props) {
  const Icon = ICON[result.outcome];
  const c = COLOR[result.outcome];
  return (
    <button
      type="button"
      onClick={onView}
      className={`text-left w-full border ${c.ring} ${c.bg} rounded-[10px] p-4 transition hover:shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={18} className={c.text} />
          <span className="text-[13px] font-semibold text-[#0B1220]">{GATE_LABEL[result.gateId]}</span>
        </div>
        <span className={`text-[11px] font-semibold uppercase tracking-wide ${c.text}`}>{c.label}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-[#4B5563]">
        <div>
          <div className="uppercase tracking-wider text-[10px] text-[#6B7280]">Missing</div>
          <div className="text-[14px] font-semibold text-[#0B1220] tabular-nums">{result.missingRequirementIds.length}</div>
        </div>
        <div>
          <div className="uppercase tracking-wider text-[10px] text-[#6B7280]">Last evaluated</div>
          <div className="text-[12px] text-[#0B1220]">{lastEvalAt ? new Date(lastEvalAt).toLocaleString() : '—'}</div>
        </div>
      </div>
    </button>
  );
}
