import { AlertTriangle, ShieldAlert } from 'lucide-react';

export interface DemoCriticalEmergencyResponseProps {
  isLight: boolean;
  acknowledged: boolean;
  onAcknowledge: () => void;
}

export function DemoCriticalEmergencyResponse({
  isLight,
  acknowledged,
  onAcknowledge,
}: DemoCriticalEmergencyResponseProps) {
  const text = isLight ? 'text-[#1F1C1B]' : 'text-[#E0E0E0]';
  const muted = isLight ? 'text-[#6B6B6B]' : 'text-white/60';
  const surface = isLight ? 'bg-white border border-[#E5E4E3]' : 'bg-white/[0.03] border border-white/[0.10]';

  return (
    <section className={`rounded-2xl p-5 md:p-6 ${surface}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#DC2626]/15 border border-[#DC2626]/30 flex items-center justify-center">
          <ShieldAlert size={20} className="text-[#DC2626]" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#DC2626] font-mono">Critical Alert</p>
          <h2 className={`text-[17px] md:text-[19px] font-semibold ${text}`}>LIFE-THREATENING EMERGENCY</h2>
        </div>
      </div>

      <div className="rounded-xl border border-[#DC2626]/30 bg-[#DC2626]/8 p-4 mb-4">
        <p className={`text-[14px] font-semibold ${text}`}>Safety First: Your safety comes first. Do not put yourself at risk.</p>
      </div>

      <div className="mb-5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#DC2626] font-mono mb-2">Immediate Action — DO THIS NOW</h3>
        <ul className={`space-y-2 text-[13.5px] leading-relaxed ${text}`}>
          <li>1. Call 911 immediately and report:</li>
          <li className="ml-4">- Active cardiac emergency</li>
          <li className="ml-4">- Presence of a firearm in the home</li>
          <li>2. DO NOT attempt treatment in an unsafe environment</li>
          <li>3. If firearm is present and unsecured:</li>
          <li className="ml-4">- Do NOT touch the weapon</li>
          <li className="ml-4">- Create distance immediately</li>
          <li className="ml-4">- Exit the home if necessary</li>
          <li>4. Remain on the line with emergency services</li>
          <li>5. Follow dispatcher instructions exactly</li>
          <li>6. Only re-enter once scene is declared safe</li>
        </ul>
      </div>

      <div className="mb-5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C74601] font-mono mb-2">Clinical Priority</h3>
        <p className={`text-[13.5px] leading-relaxed ${text}`}>
          This is a cardiac emergency requiring immediate EMS intervention.
        </p>
        <p className={`text-[13.5px] leading-relaxed ${text}`}>
          Your role is to activate emergency response — NOT manage a hazardous scene.
        </p>
      </div>

      <div className="mb-5">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0EA5E9] font-mono mb-2">Operational Enforcement</h3>
        <ul className={`space-y-1.5 text-[13.5px] ${text}`}>
          <li>- Notify Director of Nursing (DON) immediately after 911 activation</li>
          <li>- Document call, instructions given, and actions taken</li>
        </ul>
      </div>

      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className={acknowledged ? 'text-[#16A34A]' : 'text-[#DC2626]'} />
          <span className={`text-[12px] ${muted}`}>
            {acknowledged ? 'Acknowledgment captured in immutable audit trail.' : 'Acknowledge & Continue is required before execution links unlock.'}
          </span>
        </div>
        <button
          type="button"
          disabled={acknowledged}
          onClick={onAcknowledge}
          className={`px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-[0.16em] font-mono transition-colors ${acknowledged ? 'bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 cursor-default' : 'bg-[#DC2626] text-white hover:bg-[#B91C1C] border border-[#DC2626]'}`}
        >
          {acknowledged ? 'Acknowledged' : 'Acknowledge & Continue'}
        </button>
      </div>
    </section>
  );
}
