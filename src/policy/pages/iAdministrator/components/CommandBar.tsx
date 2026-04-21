import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send, Command, Loader2, Mic } from 'lucide-react';
import type { IntentKind } from '../lib/responseTypes';

/* ═══════════════════════════════════════════════════════════════
   CommandBar — the compliance COMMAND interface.

   Deliberately not a chat input. Users issue commands like:
     - "Run pre-survey audit"
     - "Show missing forms in governing body"
     - "Open CO-HP-001 §4"
     - "Create QAPI digest for wound care"

   The microphone is present but stubbed (future Brad / voice layer).
   ═══════════════════════════════════════════════════════════════ */

export interface CommandBarProps {
  onSubmit: (input: string, intent?: IntentKind) => void;
  loading: boolean;
  isLight: boolean;
  placeholder?: string;
  suggestions?: string[];
}

export function CommandBar({
  onSubmit,
  loading,
  isLight,
  placeholder = 'Issue a compliance command or reference a policy/form ID…',
  suggestions,
}: CommandBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = value.trim();
    if (!text || loading) return;
    onSubmit(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter submits; Shift+Enter inserts newline.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const borderColor = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const accent = isLight ? '#C74601' : '#FFC107';
  const surface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.03)';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';
  const textColor = isLight ? '#1F1C1B' : '#E0E0E0';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className="w-full flex items-start gap-3 p-3 rounded-2xl transition-colors"
        style={{
          background: surface,
          border: `1px solid ${borderColor}`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{
            width: 40,
            height: 40,
            background: isLight ? '#FFEEE5' : 'rgba(255,193,7,0.08)',
            color: accent,
            border: `1px solid ${isLight ? '#FFD5BF' : 'rgba(255,193,7,0.18)'}`,
          }}
          aria-hidden="true"
        >
          <Command size={18} strokeWidth={1.75} />
        </div>

        <label htmlFor="ia-command" className="sr-only">Compliance command</label>
        <textarea
          id="ia-command"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
          disabled={loading}
          className="flex-1 resize-none bg-transparent outline-none border-0 py-2 text-sm leading-6 font-body"
          style={{
            color: textColor,
            minHeight: 40,
            maxHeight: 160,
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
          }}
        />

        <button
          type="button"
          aria-label="Voice command (coming soon)"
          disabled
          title="Voice input — coming soon"
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{
            width: 40,
            height: 40,
            background: 'transparent',
            color: muted,
            border: `1px dashed ${borderColor}`,
            cursor: 'not-allowed',
            opacity: 0.55,
          }}
        >
          <Mic size={16} strokeWidth={1.75} />
        </button>

        <button
          type="submit"
          disabled={loading || value.trim().length === 0}
          aria-label="Run command"
          className="flex items-center gap-2 rounded-xl shrink-0 px-4 py-2 font-heading text-xs font-semibold uppercase tracking-[0.18em] transition-colors"
          style={{
            height: 40,
            color: isLight ? '#FFFFFF' : '#0A0202',
            background: isLight
              ? (loading ? '#421700' : '#C74601')
              : 'linear-gradient(to bottom,#FFC107,#D9A406)',
            border: 'none',
            cursor: loading ? 'wait' : (value.trim() ? 'pointer' : 'not-allowed'),
            opacity: value.trim().length === 0 ? 0.5 : 1,
          }}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          {loading ? 'Running' : 'Run'}
        </button>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setValue(s);
                onSubmit(s);
              }}
              className="text-[11px] px-3 py-1.5 rounded-full transition-colors"
              style={{
                color: isLight ? '#52404B' : 'rgba(255,255,255,0.75)',
                background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${borderColor}`,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.05em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.color = accent;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = borderColor;
                e.currentTarget.style.color = isLight ? '#52404B' : 'rgba(255,255,255,0.75)';
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
