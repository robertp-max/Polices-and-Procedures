/**
 * EmergencyBanner — Critical mode sticky banner.
 * Always shown at the top of the chat thread when lifeSafetyFlag = true.
 * The emergency action is pinned so it is never buried under policy text.
 */
import { AlertTriangle, PhoneCall, X } from 'lucide-react';
import { useState } from 'react';

export function EmergencyBanner({ onDismiss }: { onDismiss?: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-lg mb-3"
      style={{
        background: 'rgba(220,38,38,0.15)',
        border: '2px solid rgba(220,38,38,0.6)',
        animation: 'pulse 2s infinite',
      }}
      role="alert"
      aria-live="assertive"
    >
      <div
        className="flex-shrink-0 mt-0.5 p-1.5 rounded-full"
        style={{ background: '#DC2626' }}
      >
        <AlertTriangle size={14} strokeWidth={2.5} style={{ color: '#fff' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[12px] font-bold uppercase tracking-[0.2em] mb-0.5"
          style={{ color: '#DC2626', fontFamily: "'JetBrains Mono', monospace" }}
        >
          ⚠ Life-Threatening Emergency Detected
        </p>
        <p className="text-[13px] font-semibold" style={{ color: '#FECACA' }}>
          Call 911 immediately.{' '}
          <span style={{ color: '#FCA5A5' }}>Stay with the patient. Follow dispatcher instructions.</span>
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <a
            href="tel:911"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded"
            style={{
              background: '#DC2626',
              color: '#fff',
              fontFamily: "'JetBrains Mono', monospace",
              textDecoration: 'none',
            }}
          >
            <PhoneCall size={11} strokeWidth={2.5} /> Call 911
          </a>
          <span className="text-[10px]" style={{ color: '#FCA5A5' }}>
            Then ask Brad for next steps
          </span>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={() => { setDismissed(true); onDismiss(); }}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          title="Dismiss"
        >
          <X size={14} style={{ color: '#FCA5A5' }} />
        </button>
      )}
    </div>
  );
}
