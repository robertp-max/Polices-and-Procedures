/**
 * ActiveCasePanel — Right-panel case state display.
 *
 * Shows the live operational state of the current chat thread:
 * - Mode + urgency
 * - Case title + summary
 * - Immediate actions checklist
 * - Pending tasks
 * - Required forms
 * - Active policy basis
 * - Compact timeline
 * - Start New Case button
 */

import { useState } from 'react';
import {
  AlertTriangle, Activity, Clock, FileText,
  BookOpen, CheckCircle2, Circle,
  RefreshCw, ChevronDown, ChevronUp, Zap, CheckSquare, AlertCircle, XCircle,
} from 'lucide-react';
import type { SessionSummary, BradMode, BradUrgency, CaseStatus } from '../lib/sessionTypes';
import { MODE_LABELS, MODE_COLORS, URGENCY_COLORS } from '../lib/sessionTypes';
import { iaClient } from '../lib/iaClient';
import { uniqueResolvedReferenceIds } from '../lib/referenceResolver';
import { ReferenceLink } from './ReferenceLink';

const ACCENT = '#C8A96E';

/* ── Subcomponents ─────────────────────────────────────────────────── */

function ModeUrgencyBar({
  mode, urgency, isLight,
}: {
  mode: BradMode; urgency: BradUrgency; isLight: boolean;
}) {
  const modeColor = MODE_COLORS[mode] ?? ACCENT;
  const urgColor = URGENCY_COLORS[urgency] ?? ACCENT;
  const mono = "'JetBrains Mono', monospace";
  const subColor = isLight ? '#6B6860' : '#9B9488';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className="text-[9px] font-bold uppercase tracking-[0.25em] px-2 py-0.5 rounded"
        style={{
          color: modeColor,
          background: `${modeColor}22`,
          border: `1px solid ${modeColor}55`,
          fontFamily: mono,
        }}
      >
        {mode === 'emergency_response' && '🚨 '}
        {MODE_LABELS[mode] ?? mode}
      </span>
      <span
        className="text-[9px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
        style={{
          color: urgColor,
          background: `${urgColor}22`,
          border: `1px solid ${urgColor}44`,
          fontFamily: mono,
        }}
      >
        {urgency}
      </span>
      {mode === 'general' && (
        <span className="text-[9px]" style={{ color: subColor, fontFamily: mono }}>
          Waiting for case…
        </span>
      )}
    </div>
  );
}

function ActionItem({
  text, done, onToggle, isLight,
}: {
  text: string; done: boolean; onToggle: () => void; isLight: boolean;
}) {
  const textColor = isLight ? '#1F1C1B' : '#E8E4DF';
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-start gap-2 w-full text-left hover:opacity-80 transition-opacity py-0.5"
    >
      {done
        ? <CheckCircle2 size={13} strokeWidth={2} style={{ color: '#22C55E', flexShrink: 0, marginTop: '1px' }} />
        : <Circle size={13} strokeWidth={2} style={{ color: ACCENT, flexShrink: 0, marginTop: '1px' }} />
      }
      <span
        className="text-[11px] leading-snug"
        style={{
          color: done ? '#6B6860' : textColor,
          textDecoration: done ? 'line-through' : 'none',
        }}
      >
        {text}
      </span>
    </button>
  );
}

function Section({
  title, icon, children, defaultOpen = true, isLight,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isLight: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const subColor = isLight ? '#6B6860' : '#9B9488';
  const divider = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
  const mono = "'JetBrains Mono', monospace";
  return (
    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${divider}` }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 w-full hover:opacity-75 transition-opacity mb-1.5"
      >
        <span style={{ color: ACCENT }}>{icon}</span>
        <span
          className="text-[9px] font-bold uppercase tracking-[0.3em] flex-1 text-left"
          style={{ color: subColor, fontFamily: mono }}
        >
          {title}
        </span>
        {open
          ? <ChevronUp size={11} style={{ color: subColor }} />
          : <ChevronDown size={11} style={{ color: subColor }} />
        }
      </button>
      {open && children}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

const CASE_STATUS_CONFIG: Record<CaseStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: '#22C55E', icon: <Activity size={10} strokeWidth={2} /> },
  resolved: { label: 'Resolved', color: '#6B7280', icon: <CheckSquare size={10} strokeWidth={2} /> },
  requires_followup: { label: 'Requires Follow-Up', color: '#EA580C', icon: <AlertCircle size={10} strokeWidth={2} /> },
  closed: { label: 'Closed', color: '#6B7280', icon: <XCircle size={10} strokeWidth={2} /> },
};

export interface ActiveCasePanelProps {
  session: SessionSummary | null;
  isLight: boolean;
  onNewCase: () => void;
  onOpenReference?: (id: string) => void;
  onSessionUpdate?: (summary: Partial<SessionSummary>) => void;
}

export function ActiveCasePanel({
  session, isLight, onNewCase, onOpenReference: _onOpenReference, onSessionUpdate,
}: ActiveCasePanelProps) {
  const [completedActions, setCompletedActions] = useState<Set<number>>(new Set());
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [resolving, setResolving] = useState(false);

  const textColor = isLight ? '#1F1C1B' : '#E8E4DF';
  const subColor = isLight ? '#6B6860' : '#9B9488';
  const surface = isLight ? '#FAFAF9' : 'rgba(255,255,255,0.02)';
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const mono = "'JetBrains Mono', monospace";

  // Empty / no session
  if (!session || session.mode === 'general') {
    return (
      <div
        className="h-full flex flex-col items-center justify-center p-6 text-center"
        style={{ color: subColor }}
      >
        <Activity size={24} strokeWidth={1.5} style={{ color: ACCENT, marginBottom: '12px' }} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ fontFamily: mono, color: subColor }}>
          No Active Case
        </p>
        <p className="text-[10px] mt-1.5 max-w-[200px]">
          Ask Brad a compliance question or report an incident to open a case.
        </p>
      </div>
    );
  }

  const handleResolve = async (status: 'resolved' | 'requires_followup' | 'closed') => {
    if (!session?.threadId) return;
    setResolving(true);
    try {
      await iaClient.resolveSession(session.threadId, status);
      onSessionUpdate?.({ caseStatus: status });
    } catch { /* non-fatal */ } finally {
      setResolving(false);
    }
  };

  const toggleAction = (i: number) => setCompletedActions(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });
  const toggleTask = (i: number) => setCompletedTasks(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });
  const activeForms = uniqueResolvedReferenceIds(session.activeForms, 'form', 'ActiveCasePanel.activeForms');
  const activePolicies = uniqueResolvedReferenceIds(session.activePolicies, 'policy', 'ActiveCasePanel.activePolicies');

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ background: surface, border: `1px solid ${border}`, borderRadius: '12px' }}
    >
      {/* Header */}
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.3em]"
            style={{ color: ACCENT, fontFamily: mono }}
          >
            Active Case
          </span>
          <button
            type="button"
            onClick={onNewCase}
            className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.15em] px-2 py-0.5 rounded hover:opacity-75 transition-opacity"
            style={{
              color: subColor,
              border: `1px solid ${border}`,
              fontFamily: mono,
            }}
            title="Start a new case (clears current context)"
          >
            <RefreshCw size={9} strokeWidth={2} /> New Case
          </button>
        </div>

        <ModeUrgencyBar mode={session.mode} urgency={session.urgency} isLight={isLight} />

        {/* Case status badge */}
        {session.caseStatus && (
          <div className="flex items-center gap-1.5 mt-1.5">
            {(() => {
              const cfg = CASE_STATUS_CONFIG[session.caseStatus];
              return (
                <span
                  className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded"
                  style={{ color: cfg.color, background: `${cfg.color}18`, fontFamily: mono }}
                >
                  {cfg.icon} {cfg.label}
                </span>
              );
            })()}
          </div>
        )}

        {session.caseTitle && (
          <p
            className="text-[12px] font-semibold mt-2 leading-snug"
            style={{ color: textColor }}
          >
            {session.caseTitle}
          </p>
        )}

        {session.detectedIncidentType && (
          <p
            className="text-[9px] mt-0.5 uppercase tracking-[0.15em]"
            style={{ color: subColor, fontFamily: mono }}
          >
            {session.detectedIncidentType.replace(/_/g, ' ')}
          </p>
        )}

        {session.caseSummary && (
          <p className="text-[10px] mt-1.5 leading-relaxed line-clamp-3" style={{ color: subColor }}>
            {session.caseSummary}
          </p>
        )}

        {/* Flags */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {session.escalationRequired && (
            <span
              className="text-[8px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded"
              style={{ color: '#DC2626', background: 'rgba(220,38,38,0.12)', fontFamily: mono }}
            >
              Escalation Required
            </span>
          )}
          {session.qapiTriggerPossible && (
            <span
              className="text-[8px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded"
              style={{ color: '#6366F1', background: 'rgba(99,102,241,0.12)', fontFamily: mono }}
            >
              QAPI Trigger
            </span>
          )}
          {session.formsRequired && (
            <span
              className="text-[8px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded"
              style={{ color: ACCENT, background: 'rgba(200,169,110,0.12)', fontFamily: mono }}
            >
              Forms Required
            </span>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Immediate actions */}
        {session.immediateActions.length > 0 && (
          <Section
            title={`Immediate Actions (${completedActions.size}/${session.immediateActions.length})`}
            icon={<Zap size={12} strokeWidth={2} />}
            isLight={isLight}
          >
            <div className="space-y-1">
              {session.immediateActions.map((a, i) => (
                <ActionItem
                  key={i}
                  text={a}
                  done={completedActions.has(i)}
                  onToggle={() => toggleAction(i)}
                  isLight={isLight}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Pending tasks */}
        {session.pendingTasks.length > 0 && (
          <Section
            title={`Pending Tasks (${session.pendingTasks.length - completedTasks.size} open)`}
            icon={<Clock size={12} strokeWidth={2} />}
            isLight={isLight}
          >
            <div className="space-y-1">
              {session.pendingTasks.map((t, i) => (
                <ActionItem
                  key={i}
                  text={t}
                  done={completedTasks.has(i)}
                  onToggle={() => toggleTask(i)}
                  isLight={isLight}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Required forms */}
        {activeForms.length > 0 && (
          <Section
            title={`Required Forms (${activeForms.length})`}
            icon={<FileText size={12} strokeWidth={2} />}
            isLight={isLight}
          >
            <div className="flex flex-wrap gap-1.5">
              {activeForms.map(formId => (
                <ReferenceLink
                  key={formId}
                  id={formId}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded hover:opacity-80 transition-opacity"
                  style={{
                    color: ACCENT,
                    background: 'rgba(200,169,110,0.12)',
                    border: '1px solid rgba(200,169,110,0.3)',
                    fontFamily: mono,
                    textDecoration: 'none',
                  }}
                >
                  {formId}
                </ReferenceLink>
              ))}
            </div>
          </Section>
        )}

        {/* Policy basis */}
        {activePolicies.length > 0 && (
          <Section
            title="Policy Basis"
            icon={<BookOpen size={12} strokeWidth={2} />}
            isLight={isLight}
            defaultOpen={false}
          >
            <div className="flex flex-wrap gap-1.5">
              {activePolicies.map(pId => (
                <ReferenceLink
                  key={pId}
                  id={pId}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded hover:opacity-80 transition-opacity"
                  style={{
                    color: subColor,
                    background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${border}`,
                    fontFamily: mono,
                    textDecoration: 'none',
                  }}
                >
                  {pId}
                </ReferenceLink>
              ))}
            </div>
          </Section>
        )}

        {/* Message count */}
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${border}` }}>
          <p className="text-[9px]" style={{ color: subColor, fontFamily: mono }}>
            {session.messageCount} message{session.messageCount !== 1 ? 's' : ''} · Case opened {new Date(session.createdAt).toLocaleTimeString()}
          </p>
          {session.lifeSafetyFlag && (
            <div className="flex items-center gap-1 mt-1.5">
              <AlertTriangle size={10} strokeWidth={2} style={{ color: '#DC2626' }} />
              <span className="text-[9px] font-semibold" style={{ color: '#DC2626', fontFamily: mono }}>
                Life Safety Event — Escalation required
              </span>
            </div>
          )}
        </div>

        {/* Case lifecycle actions */}
        {session.caseStatus === 'active' && (
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${border}` }}>
            <p
              className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2"
              style={{ color: subColor, fontFamily: mono }}
            >
              Mark Case As
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                disabled={resolving}
                onClick={() => handleResolve('resolved')}
                className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] px-2 py-1 rounded hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{ color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', fontFamily: mono }}
              >
                <CheckSquare size={9} strokeWidth={2} /> Resolved
              </button>
              <button
                type="button"
                disabled={resolving}
                onClick={() => handleResolve('requires_followup')}
                className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] px-2 py-1 rounded hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{ color: '#EA580C', background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.3)', fontFamily: mono }}
              >
                <AlertCircle size={9} strokeWidth={2} /> Needs Follow-Up
              </button>
              <button
                type="button"
                disabled={resolving}
                onClick={() => handleResolve('closed')}
                className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] px-2 py-1 rounded hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{ color: subColor, background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', border: `1px solid ${border}`, fontFamily: mono }}
              >
                <XCircle size={9} strokeWidth={2} /> Close
              </button>
            </div>
          </div>
        )}
        {session.caseStatus !== 'active' && session.caseStatus !== undefined && (
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${border}` }}>
            <button
              type="button"
              onClick={() => handleResolve('active' as 'resolved')}
              className="text-[9px] font-semibold uppercase tracking-[0.12em] hover:opacity-75 transition-opacity"
              style={{ color: ACCENT, fontFamily: mono }}
            >
              Reopen Case
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
