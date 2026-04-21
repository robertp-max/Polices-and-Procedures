/**
 * RegulatoryAlerts
 *
 * Renders Phase 2 regulatory update alerts below the structured answer.
 * These records are matched from the CMS/OIG regulatory feed against
 * the retrieved corpus policies — deterministic, not LLM-generated.
 */

import { useState } from 'react';
import { Globe, ChevronDown, ChevronUp, ExternalLink, AlertTriangle } from 'lucide-react';
import type { RegulatoryAlert, RegulatoryAlertSeverity } from '../lib/responseTypes.js';

const ACCENT = '#C8A96E';

/* ── Severity styling ─────────────────────────────────────────────── */

interface SevStyle { bg: string; border: string; text: string }

function sevStyle(sev: RegulatoryAlertSeverity, isLight: boolean): SevStyle {
  switch (sev) {
    case 'immediate':
      return {
        bg: isLight ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.12)',
        border: 'rgba(220,38,38,0.35)',
        text: '#DC2626',
      };
    case 'high':
      return {
        bg: isLight ? 'rgba(234,88,12,0.06)' : 'rgba(234,88,12,0.12)',
        border: 'rgba(234,88,12,0.35)',
        text: '#EA580C',
      };
    case 'moderate':
      return {
        bg: isLight ? 'rgba(200,169,110,0.08)' : 'rgba(200,169,110,0.12)',
        border: 'rgba(200,169,110,0.35)',
        text: ACCENT,
      };
    default:
      return {
        bg: isLight ? 'rgba(100,116,139,0.06)' : 'rgba(100,116,139,0.12)',
        border: 'rgba(100,116,139,0.25)',
        text: isLight ? '#64748B' : '#94A3B8',
      };
  }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: '#DC2626' },
  under_review: { label: 'Under Review', color: '#EA580C' },
  reviewed: { label: 'Reviewed', color: ACCENT },
  action_taken: { label: 'Action Taken', color: '#22C55E' },
};

/* ── Individual regulatory alert card ────────────────────────────── */

function RegAlertCard({ alert, isLight }: { alert: RegulatoryAlert; isLight: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const s = sevStyle(alert.severity, isLight);
  const mono = "'JetBrains Mono', monospace";
  const textColor = isLight ? '#1F1C1B' : '#E8E4DF';
  const subColor = isLight ? '#6B6860' : '#9B9488';
  const st = STATUS_LABELS[alert.status] ?? { label: alert.status, color: subColor };

  return (
    <div
      className="rounded-lg mb-2"
      style={{ background: s.bg, border: `1px solid ${s.border}`, overflow: 'hidden' }}
    >
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-2.5 p-3 text-left hover:opacity-90 transition-opacity"
      >
        <span style={{ color: s.text, flexShrink: 0, marginTop: '1px' }}>
          <Globe size={13} strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[9px] font-bold uppercase tracking-[0.25em] px-1.5 py-0.5 rounded"
              style={{ color: s.text, background: s.border, fontFamily: mono }}
            >
              {alert.severity}
            </span>
            <span
              className="text-[9px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: st.color, fontFamily: mono }}
            >
              {st.label}
            </span>
            {alert.effectiveDate && (
              <span className="text-[9px]" style={{ color: subColor, fontFamily: mono }}>
                eff. {alert.effectiveDate}
              </span>
            )}
          </div>
          <p className="text-[12px] font-semibold mt-0.5 leading-snug" style={{ color: textColor }}>
            {alert.title}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: subColor }}>
            {alert.source} · {alert.topic}
          </p>
          {alert.impactedPolicies.length > 0 && (
            <p className="text-[10px] mt-0.5" style={{ color: subColor, fontFamily: mono }}>
              Impacts: {alert.impactedPolicies.join(', ')}
            </p>
          )}
        </div>
        <span style={{ color: subColor, flexShrink: 0, marginTop: '2px' }}>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {expanded && (
        <div
          className="px-3 pb-3 space-y-2"
          style={{ color: subColor, borderTop: `1px solid ${s.border}` }}
        >
          <p className="pt-2 text-[11px]" style={{ color: textColor }}>
            <span className="font-bold" style={{ color: ACCENT }}>Affected Area: </span>
            {alert.affectedArea}
          </p>
          <div
            className="rounded p-2 text-[10px]"
            style={{ background: isLight ? 'rgba(200,169,110,0.08)' : 'rgba(200,169,110,0.06)', color: ACCENT }}
          >
            <span className="font-bold uppercase tracking-[0.15em]" style={{ fontFamily: mono }}>
              Review Required:{' '}
            </span>
            <span style={{ color: textColor }}>{alert.reviewRecommendation}</span>
          </div>
          <div
            className="rounded p-2 text-[10px]"
            style={{ background: isLight ? 'rgba(200,169,110,0.05)' : 'rgba(200,169,110,0.04)', color: s.text }}
          >
            <span className="font-bold uppercase tracking-[0.15em]" style={{ fontFamily: mono }}>
              Next Action:{' '}
            </span>
            <span style={{ color: textColor }}>{alert.nextAction}</span>
          </div>
          {alert.impactedForms.length > 0 && (
            <p className="text-[10px]" style={{ fontFamily: mono, color: subColor }}>
              Impacted Forms: {alert.impactedForms.join(', ')}
            </p>
          )}
          {alert.sourceUrl && (
            <a
              href={alert.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] hover:opacity-75 transition-opacity"
              style={{ color: ACCENT, fontFamily: mono }}
            >
              <ExternalLink size={10} /> View Source
            </a>
          )}
          <p className="text-[9px]" style={{ color: subColor, fontFamily: mono }}>
            Published: {alert.publishedDate} · ID: {alert.updateId}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────── */

export interface RegulatoryAlertsProps {
  regulatoryAlerts?: RegulatoryAlert[];
  isLight: boolean;
}

export function RegulatoryAlerts({ regulatoryAlerts = [], isLight }: RegulatoryAlertsProps) {
  const [open, setOpen] = useState(true);
  const subColor = isLight ? '#6B6860' : '#9B9488';
  const divider = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
  const mono = "'JetBrains Mono', monospace";

  if (regulatoryAlerts.length === 0) return null;

  const immediateCount = regulatoryAlerts.filter(r => r.severity === 'immediate').length;
  const newCount = regulatoryAlerts.filter(r => r.status === 'new').length;

  return (
    <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${divider}` }}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={13} strokeWidth={2} style={{ color: '#EA580C' }} />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: '#EA580C', fontFamily: mono }}
        >
          Regulatory Updates
        </span>
        {immediateCount > 0 && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ color: '#fff', background: '#DC2626', fontFamily: mono }}
          >
            {immediateCount} immediate
          </span>
        )}
        {newCount > 0 && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ color: '#fff', background: '#EA580C', fontFamily: mono }}
          >
            {newCount} new
          </span>
        )}
      </div>

      <div
        className="rounded p-2 text-[10px] mb-3"
        style={{
          background: isLight ? 'rgba(100,116,139,0.06)' : 'rgba(100,116,139,0.1)',
          border: `1px solid ${divider}`,
          color: subColor,
        }}
      >
        <Globe size={10} strokeWidth={2} style={{ display: 'inline', marginRight: '4px', color: ACCENT }} />
        These updates are matched against the retrieved policies. Review each update with a policy owner.
        {' '}<strong>Phase 2 — Curated CMS/OIG seed feed.</strong>
      </div>

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 mb-2 hover:opacity-75 transition-opacity"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: subColor, fontFamily: mono }}>
          Updates Requiring Review ({regulatoryAlerts.length})
        </span>
        {open ? <ChevronUp size={11} style={{ color: subColor }} /> : <ChevronDown size={11} style={{ color: subColor }} />}
      </button>

      {open && regulatoryAlerts.map(r => (
        <RegAlertCard key={r.updateId} alert={r} isLight={isLight} />
      ))}
    </div>
  );
}
