import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { ArrowRight, ShieldCheck, Sparkles, X, Loader2, Compass, FastForward } from 'lucide-react';
import { BradTourAvatar } from './BradTourAvatar';
import { setPendingMissionQuery } from './missionHandoff';

/* ═══════════════════════════════════════════════════════════════
   MissionPromptOverlay — shown on every login.

   Three actions:
     • Run with Brad   → submit mission and route to /iadministrator
     • Start Guided Tour → calls onStartTour to launch GuidedTourOverlay
     • Skip For Now    → just dismisses (does not block future logins)

   Larger card layout (max width 720px), spacious padding, fewer chips.
   ═══════════════════════════════════════════════════════════════ */

const SUGGESTIONS: ReadonlyArray<string> = [
  'Run pre-survey audit',
  'Identify QAPI gaps',
  'Show missing governing body forms',
];

export interface MissionPromptOverlayProps {
  onClose: () => void;
  onStartTour: () => void;
}

export function MissionPromptOverlay({ onClose, onStartTour }: MissionPromptOverlayProps) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.firstName ?? user?.name?.split(' ')[0] ?? 'there';

  const submit = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    setPendingMissionQuery(text);
    window.setTimeout(() => {
      onClose();
      navigate('/iadministrator');
    }, 350);
  }, [submitting, navigate, onClose]);

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    submit(value);
  }, [submit, value]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Welcome back — set your mission"
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        width: 480,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 32px)',
        zIndex: 1000,
        borderRadius: 18,
        background: '#FFFFFF',
        color: '#1F1C1B',
        border: '1px solid #E5E4E3',
        boxShadow: '0 18px 45px rgba(15,23,42,0.18)',
        fontFamily: "'Roboto', 'Inter', system-ui, sans-serif",
        overflowY: 'auto',
        overflowX: 'hidden',
        transform: 'translateZ(0)',
        contain: 'layout paint',
        willChange: 'transform, opacity',
      }}
    >
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#F8FAFC',
            color: '#334155',
            border: '1px solid #E2E8F0',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ padding: '20px 22px 10px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <BradTourAvatar size={56} variant="circle" />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#64748B',
                fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif",
                marginBottom: 8,
              }}
            >
              Brad iAdministrator
            </div>
            <h2
              style={{
                fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif",
                fontSize: 22,
                lineHeight: 1.2,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Hello, {firstName}, I am Brad!
            </h2>
          </div>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '8px 22px 4px' }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E4E3',
              borderRadius: 16,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Sparkles size={20} style={{ color: '#007970', flexShrink: 0, marginLeft: 6 }} />
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={submitting}
              placeholder="Ask Brad what you need to accomplish…"
              style={{
                flex: 1,
                minWidth: 0,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#334155',
                fontSize: 16,
                padding: '10px 6px',
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={submitting || !value.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                borderRadius: 12,
                background: '#C74600',
                color: '#FFFFFF',
                border: 'none',
                fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: submitting || !value.trim() ? 'not-allowed' : 'pointer',
                opacity: submitting || !value.trim() ? 0.7 : 1,
                whiteSpace: 'nowrap',
                boxShadow: '0 6px 18px rgba(199,70,0,0.22)',
              }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {submitting ? 'Brad is analyzing…' : 'Run with Brad'}
            </button>
          </div>
        </form>

        <div style={{ padding: '14px 22px 8px' }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#64748B',
              fontFamily: "'JetBrains Mono', 'Menlo', monospace",
              marginBottom: 10,
            }}
          >
            Suggested missions
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                disabled={submitting}
                style={{
                  padding: '10px 14px',
                  borderRadius: 999,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#334155',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginTop: 16,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#64748B',
              fontFamily: "'JetBrains Mono', 'Menlo', monospace",
            }}
          >
            <ShieldCheck size={14} />
            Grounded in your internal Home Health corpus
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onStartTour}
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 20px',
                borderRadius: 12,
                background: '#FFFFFF',
                color: '#007970',
                border: '1px solid #CFE7E5',
                fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              <Compass size={16} />
              Start Guided Tour
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 12,
                background: 'transparent',
                color: '#475569',
                border: '1px solid #CBD5E1',
                fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 13,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              <FastForward size={14} />
              Skip For Now
            </button>
          </div>
        </div>
    </div>
  );
}
