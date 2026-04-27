import type { PolicyVersionRef } from '../types';

interface Props {
  policy: PolicyVersionRef;
  compact?: boolean;
}

export function PolicyVersionLink({ policy, compact }: Props) {
  return (
    <a
      href={`/library/${policy.policyId}`}
      title={`${policy.policyId} v${policy.policyVersion} · ${policy.contentHash}`}
      className={`inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-[#F7F8FA] hover:bg-white text-[#13355E] ${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]'} font-medium tabular-nums`}
    >
      <span>{policy.policyId}</span>
      <span className="text-[#6B7280]">v{policy.policyVersion}</span>
    </a>
  );
}
