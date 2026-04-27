import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import type { SignatureRecord } from '../types';

interface Props {
  signatures: SignatureRecord[];
  onSign?: (sigId: string) => void;
  onDecline?: (sigId: string) => void;
}

const ICON = {
  Signed:    { I: CheckCircle2, color: 'text-[#1F8A4C]' },
  Sent:      { I: Clock,        color: 'text-[#1E63B0]' },
  Viewed:    { I: Clock,        color: 'text-[#1E63B0]' },
  Requested: { I: Circle,       color: 'text-[#6B7280]' },
  Declined:  { I: XCircle,      color: 'text-[#B42318]' },
  Expired:   { I: XCircle,      color: 'text-[#B45309]' },
  Voided:    { I: XCircle,      color: 'text-[#6B7280]' },
};

export function SignerStrip({ signatures, onSign, onDecline }: Props) {
  if (signatures.length === 0) {
    return <div className="text-[12px] text-[#6B7280] italic">No signature requirements for this unit.</div>;
  }
  return (
    <div className="space-y-2">
      {signatures.map(sig => {
        const def = ICON[sig.status];
        const I = def.I;
        return (
          <div key={sig.id} className="flex items-center justify-between gap-3 border border-[#E5E7EB] rounded-[8px] px-3 py-2.5 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <I size={16} className={def.color} />
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-[#0B1220] truncate">{sig.signerName}</div>
                <div className="text-[11px] text-[#4B5563]">
                  {sig.signerRole} · binds to {sig.bindsToType} <span className="text-[#6B7280]">({sig.bindsToRef})</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6B7280]">{sig.status}</span>
              {sig.status !== 'Signed' && sig.status !== 'Declined' && onSign && (
                <button
                  type="button"
                  onClick={() => onSign(sig.id)}
                  className="text-[11px] font-semibold px-3 py-1 rounded-md bg-[#0B2545] text-white hover:bg-[#13355E]"
                >
                  Sign via eCIgn
                </button>
              )}
              {sig.status !== 'Signed' && sig.status !== 'Declined' && onDecline && (
                <button
                  type="button"
                  onClick={() => onDecline(sig.id)}
                  className="text-[11px] font-semibold px-2 py-1 rounded-md border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F7F8FA]"
                >
                  Decline
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
