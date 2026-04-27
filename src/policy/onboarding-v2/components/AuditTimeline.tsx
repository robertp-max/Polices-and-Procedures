import type { OnboardingAuditEvent } from '../types';
import { AUDIT_LABEL } from '../engine/audit';

export function AuditTimeline({ events }: { events: OnboardingAuditEvent[] }) {
  if (events.length === 0) {
    return <div className="text-[12px] text-[#6B7280] italic">No audit events.</div>;
  }
  return (
    <ol className="relative border-l border-[#E5E7EB] ml-2 pl-4 space-y-3">
      {events.map(ev => (
        <li key={ev.id} className="relative">
          <span className="absolute -left-[22px] top-1.5 w-2 h-2 rounded-full bg-[#0B2545] ring-4 ring-white" />
          <div className="text-[11px] uppercase tracking-wider text-[#6B7280]">
            #{ev.sequence} · {new Date(ev.createdAt).toLocaleString()}
          </div>
          <div className="text-[12px] font-semibold text-[#0B1220]">{AUDIT_LABEL[ev.eventType]}</div>
          {ev.actorName && (
            <div className="text-[11px] text-[#4B5563]">by {ev.actorName}</div>
          )}
          <pre className="mt-1 text-[10px] leading-snug text-[#4B5563] bg-[#F7F8FA] border border-[#E5E7EB] rounded-md px-2 py-1 overflow-x-auto">
{JSON.stringify(ev.payload, null, 0)}
          </pre>
          <div className="text-[10px] text-[#9CA3AF] mt-0.5 tabular-nums">
            prev: {ev.prevHash.slice(0, 22)}… · hash: {ev.eventHash.slice(0, 22)}…
          </div>
        </li>
      ))}
    </ol>
  );
}
