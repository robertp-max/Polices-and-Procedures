/**
 * ChatThread — Multi-turn chat interface for Brad.
 *
 * Renders the full conversation history with:
 * - User message bubbles (right-aligned)
 * - Brad structured response cards (compact, expandable)
 * - Emergency banner pin at the top when lifeSafetyFlag = true
 * - Input bar at bottom
 * - "Still in case" context indicator
 */

import { useEffect, useRef, useState } from 'react';
import { Send, ChevronDown, ChevronUp, MessageSquare, AlertCircle } from 'lucide-react';
import type { ChatMessage, SessionSummary } from '../lib/sessionTypes';
import { MODE_LABELS, MODE_COLORS, URGENCY_COLORS } from '../lib/sessionTypes';
import { StructuredAnswer } from './StructuredAnswer';
import { CitationChips } from './CitationChips';
import { RequirementsSnapshot } from './RequirementsSnapshot';
import { OperationalGaps } from './OperationalGaps';
import { RegulatoryAlerts } from './RegulatoryAlerts';
import { EmergencyBanner } from './EmergencyBanner';
import type { AvailableAction } from '../lib/responseTypes';

const ACCENT = '#C8A96E';

/* ── Context indicator bar ─────────────────────────────────────────── */

function CaseContextBar({
  session, isLight, onNewCase,
}: {
  session: SessionSummary; isLight: boolean; onNewCase: () => void;
}) {
  const mono = "'JetBrains Mono', monospace";
  const modeColor = MODE_COLORS[session.mode] ?? ACCENT;
  const subColor = isLight ? '#6B6860' : '#9B9488';
  const surface = isLight ? '#F4F3F2' : 'rgba(255,255,255,0.04)';
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.08)';

  if (session.mode === 'general' && !session.caseTitle) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg mb-2"
      style={{ background: surface, border: `1px solid ${border}` }}
    >
      <span
        className="text-[9px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
        style={{ color: modeColor, background: `${modeColor}22`, fontFamily: mono }}
      >
        {MODE_LABELS[session.mode] ?? session.mode}
      </span>
      <span className="text-[10px] flex-1 truncate" style={{ color: subColor }}>
        {session.caseTitle ?? 'Active case'}
      </span>
      <button
        type="button"
        onClick={onNewCase}
        className="text-[9px] uppercase tracking-[0.15em] hover:opacity-75 transition-opacity"
        style={{ color: subColor, fontFamily: mono }}
      >
        New case
      </button>
    </div>
  );
}

/* ── User message bubble ──────────────────────────────────────────── */

function UserBubble({ message, isLight: _isLight }: { message: ChatMessage; isLight: boolean }) {
  return (
    <div className="flex justify-end mb-3">
      <div
        className="max-w-[80%] px-3 py-2 rounded-2xl rounded-tr-sm text-[12px] leading-relaxed"
        style={{
          background: ACCENT,
          color: '#1F1C1B',
        }}
      >
        {message.content}
      </div>
    </div>
  );
}

/* ── Brad response card ───────────────────────────────────────────── */

function BradCard({
  message, isLight, onOpenReference, onAction: _onAction, urgency, mode,
}: {
  message: ChatMessage;
  isLight: boolean;
  onOpenReference: (id: string) => void;
  onAction: (action: AvailableAction) => void;
  urgency?: string;
  mode?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const resp = message.structuredResponse;
  const textColor = isLight ? '#1F1C1B' : '#E8E4DF';
  const subColor = isLight ? '#6B6860' : '#9B9488';
  const surface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.03)';
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const mono = "'JetBrains Mono', monospace";

  const urgencyColor = urgency ? (URGENCY_COLORS[urgency as keyof typeof URGENCY_COLORS] ?? ACCENT) : ACCENT;
  const isEmergency = mode === 'emergency_response' || message.structuredResponse?.riskLevel === 'critical';

  return (
    <div className="flex justify-start mb-4">
      <div
        className="w-full max-w-[95%] rounded-xl overflow-hidden"
        style={{
          background: surface,
          border: isEmergency ? '1px solid rgba(220,38,38,0.4)' : `1px solid ${border}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ borderBottom: `1px solid ${border}` }}
        >
          <span
            className="text-[9px] font-bold uppercase tracking-[0.3em]"
            style={{ color: ACCENT, fontFamily: mono }}
          >
            Brad
          </span>
          {mode && mode !== 'general' && (
            <span
              className="text-[8px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
              style={{
                color: MODE_COLORS[mode as keyof typeof MODE_COLORS] ?? ACCENT,
                background: `${MODE_COLORS[mode as keyof typeof MODE_COLORS] ?? ACCENT}22`,
                fontFamily: mono,
              }}
            >
              {MODE_LABELS[mode as keyof typeof MODE_LABELS] ?? mode}
            </span>
          )}
          {resp?.riskLevel && resp.riskLevel !== 'none' && (
            <span
              className="text-[8px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded ml-auto"
              style={{
                color: urgencyColor,
                background: `${urgencyColor}22`,
                fontFamily: mono,
              }}
            >
              {resp.riskLevel}
            </span>
          )}
          <span className="text-[9px]" style={{ color: subColor, marginLeft: 'auto' }}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {/* Direct answer */}
        <div className="px-3 py-2.5">
          {resp ? (
            <>
              {/* Safeguard: never render a raw corpus/knowledge dump as the answer */}
              {resp.noAnswerFound || !resp.directAnswer ? (
                <p className="text-[12px] leading-relaxed" style={{ color: subColor, fontStyle: 'italic' }}>
                  {resp.noAnswerReason || 'Unable to generate response. Please retry.'}
                </p>
              ) : (
                <p className="text-[12px] leading-relaxed" style={{ color: textColor }}>
                  {resp.directAnswer}
                </p>
              )}

              {/* Quick actions snapshot */}
              {!expanded && resp.requirementsSnapshot?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {resp.requirementsSnapshot.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.1em] px-1 py-0.5 rounded flex-shrink-0 mt-0.5"
                        style={{
                          color: item.status === 'warning' ? '#DC2626' : ACCENT,
                          background: item.status === 'warning' ? 'rgba(220,38,38,0.1)' : 'rgba(200,169,110,0.1)',
                          fontFamily: mono,
                        }}
                      >
                        {item.status}
                      </span>
                      <span className="text-[11px]" style={{ color: subColor }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Inline Operational Impact (connects answer to live state) ── */}
              {!expanded && (() => {
                const criticalGaps = (resp.operationalGaps ?? []).filter(
                  g => g.severity === 'critical' || g.severity === 'high'
                ).slice(0, 2);
                if (criticalGaps.length === 0) return null;
                return (
                  <div
                    className="mt-2 rounded-lg px-2.5 py-2"
                    style={{
                      background: 'rgba(220,38,38,0.06)',
                      border: '1px solid rgba(220,38,38,0.2)',
                    }}
                  >
                    <p
                      className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1"
                      style={{ color: '#DC2626', fontFamily: mono }}
                    >
                      ⚠ Operational Impact
                    </p>
                    {criticalGaps.map((g, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-0.5">
                        <span
                          className="text-[8px] font-bold uppercase tracking-[0.1em] px-1 py-0.5 rounded flex-shrink-0"
                          style={{ color: g.severity === 'critical' ? '#DC2626' : '#EA580C', background: 'rgba(220,38,38,0.1)', fontFamily: mono }}
                        >
                          {g.severity}
                        </span>
                        <span className="text-[10px] leading-snug" style={{ color: subColor }}>{g.title}</span>
                      </div>
                    ))}
                    {(resp.operationalGaps ?? []).length > 2 && (
                      <p className="text-[9px] mt-0.5" style={{ color: subColor, fontFamily: mono }}>
                        +{(resp.operationalGaps ?? []).length - 2} more gaps — expand to see all
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* ── Data quality note (confidence downgrade indicator) ── */}
              {!expanded && (resp.meta as Record<string, unknown>)?.['allSeedData'] && resp.confidence !== 'high' && (
                <div
                  className="mt-1.5 px-2 py-1 rounded"
                  style={{
                    background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${border}`,
                  }}
                >
                  <p className="text-[9px]" style={{ color: subColor, fontFamily: mono }}>
                    Based on Phase 1-2 seed data · Live integration pending
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Fallback for messages without structuredResponse.
               Suppress any raw markdown/knowledge dump that slipped through. */
            /^###\s+[A-Z]{2}-|^\[P\d+\]|^CORPUS\s*\(/i.test(message.content) ? (
              <p className="text-[12px]" style={{ color: subColor, fontStyle: 'italic' }}>
                Unable to generate response. Please retry.
              </p>
            ) : (
              <p className="text-[12px]" style={{ color: textColor }}>{message.content}</p>
            )
          )}
        </div>

        {/* Expand button */}
        {resp && (
          <>
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 w-full hover:opacity-75 transition-opacity"
              style={{ borderTop: `1px solid ${border}` }}
            >
              <span
                className="text-[9px] font-semibold uppercase tracking-[0.2em] flex-1 text-left"
                style={{ color: subColor, fontFamily: mono }}
              >
                {expanded ? 'Collapse' : `Full Response ${resp.citations?.length ? `· ${resp.citations.length} citations` : ''}`}
              </span>
              {expanded
                ? <ChevronUp size={11} style={{ color: subColor }} />
                : <ChevronDown size={11} style={{ color: subColor }} />
              }
            </button>

            {/* Full expanded response */}
            {expanded && (
              <div className="px-3 pb-3" style={{ borderTop: `1px solid ${border}` }}>
                <div className="mt-3">
                  <StructuredAnswer
                    response={resp}
                    isLight={isLight}
                  />
                  {resp.requirementsSnapshot?.length > 0 && (
                    <RequirementsSnapshot
                      items={resp.requirementsSnapshot}
                      isLight={isLight}
                      onOpenReference={onOpenReference}
                    />
                  )}
                  {resp.citations?.length > 0 && (
                    <CitationChips
                      citations={resp.citations}
                      isLight={isLight}
                      onOpenReference={onOpenReference}
                    />
                  )}
                  <OperationalGaps
                    operationalGaps={resp.operationalGaps}
                    lifecycleAlerts={resp.lifecycleAlerts}
                    phaseStatus={resp.phaseStatus}
                    isLight={isLight}
                  />
                  <RegulatoryAlerts
                    regulatoryAlerts={resp.regulatoryAlerts}
                    isLight={isLight}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Loading indicator ─────────────────────────────────────────────── */

function TypingIndicator({ phase1Mode, isLight }: { phase1Mode?: string; isLight: boolean }) {
  const subColor = isLight ? '#6B6860' : '#9B9488';
  const surface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.03)';
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const mono = "'JetBrains Mono', monospace";

  const isEmergency = phase1Mode === 'emergency_response';

  return (
    <div className="flex justify-start mb-3">
      <div
        className="px-3 py-2.5 rounded-xl"
        style={{
          background: surface,
          border: isEmergency ? '1px solid rgba(220,38,38,0.4)' : `1px solid ${border}`,
          minWidth: '120px',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isEmergency ? '#DC2626' : ACCENT,
                  animation: `bounce 1.2s infinite ${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          <span className="text-[10px]" style={{ color: subColor, fontFamily: mono }}>
            {isEmergency
              ? 'Brad — Emergency Response…'
              : phase1Mode && phase1Mode !== 'general'
                ? `Brad — ${MODE_LABELS[phase1Mode as keyof typeof MODE_LABELS] ?? phase1Mode}…`
                : 'Brad is thinking…'
            }
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ───────────────────────────────────────────────────── */

export interface ChatThreadProps {
  messages: ChatMessage[];
  session: SessionSummary | null;
  loading: boolean;
  retrieving: boolean;
  phase1Mode?: string;
  error: string | null;
  isLight: boolean;
  onSubmit: (input: string) => void;
  onNewCase: () => void;
  onOpenReference: (id: string) => void;
  onAction: (action: AvailableAction) => void;
}

export function ChatThread({
  messages,
  session,
  loading,
  retrieving,
  phase1Mode,
  error,
  isLight,
  onSubmit,
  onNewCase,
  onOpenReference,
  onAction,
}: ChatThreadProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const subColor = isLight ? '#6B6860' : '#9B9488';
  const surface = isLight ? '#F7F6F5' : 'rgba(255,255,255,0.02)';
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const mono = "'JetBrains Mono', monospace";

  const showEmergency = session?.lifeSafetyFlag || session?.mode === 'emergency_response';

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, loading]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    onSubmit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Emergency banner — pinned at top */}
      {showEmergency && <EmergencyBanner />}

      {/* Case context bar */}
      {session && (
        <CaseContextBar session={session} isLight={isLight} onNewCase={onNewCase} />
      )}

      {/* Message thread */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-1 py-2"
        style={{ minHeight: 0 }}
      >
        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <MessageSquare size={28} strokeWidth={1.5} style={{ color: ACCENT, marginBottom: '12px' }} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: ACCENT, fontFamily: mono }}>
              Brad · Chat Mode
            </p>
            <p className="text-[11px] max-w-[260px]" style={{ color: subColor }}>
              Ask a compliance question or report an incident. Brad will remember the context across your conversation.
            </p>
            <div className="mt-4 space-y-1.5 text-left">
              {[
                'Clinician called — client having a heart attack',
                'What is the protocol?',
                'Who do I notify?',
                'What form do I complete?',
                'Are we ready for survey?',
              ].map(s => (
                <button
                  key={s}
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="block w-full text-left text-[10px] px-2.5 py-1.5 rounded-lg"
                  style={{
                    color: subColor,
                    background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${border}`,
                    cursor: 'not-allowed',
                    opacity: 0.6,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, _i) => (
          msg.role === 'user' ? (
            <UserBubble key={msg.id} message={msg} isLight={isLight} />
          ) : (
            <BradCard
              key={msg.id}
              message={msg}
              isLight={isLight}
              onOpenReference={onOpenReference}
              onAction={onAction}
              urgency={session?.urgency}
              mode={session?.mode}
            />
          )
        ))}

        {/* Typing indicator */}
        {(loading || retrieving) && (
          <TypingIndicator phase1Mode={phase1Mode} isLight={isLight} />
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
            style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)' }}>
            <AlertCircle size={12} strokeWidth={2} style={{ color: '#DC2626' }} />
            <span className="text-[11px]" style={{ color: '#DC2626' }}>{error}</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="flex-shrink-0 pt-3 mt-2"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <div
          className="flex items-end gap-2 rounded-xl px-3 py-2"
          style={{
            background: surface,
            border: `1px solid ${border}`,
            opacity: 0.55,
            cursor: 'not-allowed',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Enter message (guided prompts recommended)"
            className="flex-1 resize-none bg-transparent outline-none text-[12px] leading-relaxed"
            style={{
              color: subColor,
              maxHeight: '100px',
              fontFamily: 'inherit',
              cursor: 'not-allowed',
            }}
            disabled
            readOnly
          />
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex-shrink-0 p-1.5 rounded-lg"
            style={{
              background: 'transparent',
              border: `1px solid ${border}`,
              opacity: 0.35,
              cursor: 'not-allowed',
            }}
          >
            <Send size={13} strokeWidth={2} style={{ color: subColor }} />
          </button>
        </div>
        <p className="text-[9px] mt-1 text-center" style={{ color: subColor, fontFamily: mono }}>
          Use the guided prompts above for best results.
        </p>
      </div>
    </div>
  );
}
