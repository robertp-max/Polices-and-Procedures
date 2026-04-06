import { AlertTriangle } from 'lucide-react';

export function DraftBanner() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#C74600]/20 bg-transparent px-5 py-3 text-sm">
      <AlertTriangle size={18} className="shrink-0 text-[#ff8e52] icon-interactive" />
      <span className="font-roboto font-medium text-white/60">
        <span className="font-montserrat font-bold text-[#ff8e52]">Draft Working State.</span>
        {' '}This policy is not official until it has been approved and published.
      </span>
    </div>
  );
}

