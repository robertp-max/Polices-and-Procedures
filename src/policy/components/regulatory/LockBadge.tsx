import { useEnforcementStore } from '@/policy/stores/enforcementStore';

/** Small badge + optional unlock button shown on event headers. */
export function LockBadge({ eventId, onRequestUnlock }: { eventId: string; onRequestUnlock?: () => void }) {
  const lock = useEnforcementStore(s => s.locks[eventId]);
  const actor = useEnforcementStore(s => s.actor);
  const unlock = useEnforcementStore(s => s.unlock);

  if (!lock?.locked) return null;

  const canUnlockHere =
    lock.unlockRole === undefined || actor.role === lock.unlockRole || actor.role === 'Administrator';

  return (
    <div
      className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded"
      style={{
        background: 'rgba(167,139,250,0.12)',
        border: '1px solid rgba(167,139,250,0.30)',
        color: '#C4B5FD',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="4" y="11" width="16" height="10" rx="1.5" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      <span className="text-[9px] font-roboto font-semibold tracking-[0.08em]">
        LOCKED · {lock.unlockRole ?? 'Administrator'}
      </span>
      {canUnlockHere && (
        <button
          onClick={() => {
            const r = unlock(eventId, 'Unlocked from event header');
            if (!r.ok && onRequestUnlock) onRequestUnlock();
          }}
          className="ml-1 text-[9px] font-semibold px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(167,139,250,0.18)', color: '#DDD6FE' }}
        >
          Unlock
        </button>
      )}
    </div>
  );
}
