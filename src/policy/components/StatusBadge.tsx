import type { LifecycleStatus } from '@/policy/types';

const statusColor: Record<LifecycleStatus, string> = {
  Draft:              'bg-[#FFC700]/15 text-[#FFC700] border-[#FFC700]/30',
  'Under Review':     'bg-white/10 text-white/70 border-white/20',
  'Revision Requested': 'bg-[#C74600]/15 text-[#ff8e52] border-[#C74600]/30',
  Approved:           'bg-[#FFC107]/15 text-[#FFC107] border-[#FFC107]/30',
  Rejected:           'bg-[#D70101]/15 text-[#ff6060] border-[#D70101]/30',
  Published:          'bg-[#D4AF37]/15 text-[#FFC107] border-[#D4AF37]/30',
  Archived:           'bg-white/5 text-white/40 border-white/10',
};

interface Props {
  status: LifecycleStatus;
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] font-montserrat font-bold uppercase tracking-wider ${statusColor[status]}`}>
      {status}
    </span>
  );
}

