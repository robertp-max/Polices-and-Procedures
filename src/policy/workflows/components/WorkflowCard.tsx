import { CI, DOMAIN_META, RISK_META, CADENCE_LABEL } from '../brand';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import type { WorkflowCardProjection } from '@/policy/types/workflow';
import { resolveWorkflowPolicyRefs } from '@/policy/workflows/utils/resolveWorkflowPolicyRefs';

/* ══════════════════════════════════════════════════════════════════
   WorkflowCard — library grid card.

   Rules enforced:
   - white, 1px #E5E4E3 border, radius 8
   - no shadow, no scale, no lift
   - hover only mutates border color toward teal
   ══════════════════════════════════════════════════════════════════ */

interface Props {
  card: WorkflowCardProjection;
  onOpen: () => void;
  compact?: boolean;
}

export function WorkflowCard({ card, onOpen, compact = false }: Props) {
  const domain = DOMAIN_META[card.domain];
  const risk = RISK_META[card.declaredRisk];
  const workflow = WORKFLOWS[card.id];
  const stepCount = workflow?.steps?.length ?? 0;
  const policyCount = workflow
    ? resolveWorkflowPolicyRefs(workflow).effectivePolicyRefs.length
    : card.policyCount;

  return (
    <button
      onClick={onOpen}
      className="text-left w-full flex flex-col h-full transition-colors"
      style={{
        background: CI.paper,
        border: `1px solid ${CI.line}`,
        borderRadius: 8,
        padding: compact ? 14 : 16,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = CI.teal; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = CI.line; }}
    >
      {/* Row 1 — domain chip + risk dot */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 10, fontWeight: 600, letterSpacing: 1.2,
            color: CI.teal, textTransform: 'uppercase',
            padding: '3px 8px', border: `1px solid ${CI.line}`, borderRadius: 4,
            background: CI.paper,
          }}
        >
          {card.domain} · {domain.name}
        </span>
        <span
          className="flex items-center gap-1"
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: risk.text }}
        >
          <span
            style={{ width: 6, height: 6, borderRadius: 3, background: risk.dot, display: 'inline-block' }}
          />
          {risk.label}
        </span>
      </div>

      {/* Row 2 — ID */}
      <div
        style={{
          marginTop: 12,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 11, fontWeight: 600, letterSpacing: 0.6,
          color: CI.muted,
        }}
      >
        {card.id}
      </div>

      {/* Row 3 — Title */}
      <div
        style={{
          marginTop: 4,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 15, fontWeight: 600, lineHeight: 1.3,
          color: CI.ink,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: 40,
        }}
      >
        {titleCase(card.title)}
      </div>

      {!compact && (
        <div
          style={{
            marginTop: 10,
            fontFamily: 'Roboto, sans-serif',
            fontSize: 12, lineHeight: 1.5,
            color: CI.inkSoft,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 36,
          }}
        >
          {card.processOverview || card.triggerSummary}
        </div>
      )}

      <div className="flex-1" />

      {/* Row 5 — Meta line: cadence · forms · policies */}
      <div
        className="flex items-center justify-between"
        style={{
          marginTop: 16, paddingTop: 12,
          borderTop: `1px solid ${CI.lineSoft}`,
          fontFamily: 'Roboto, sans-serif', fontSize: 11, color: CI.muted,
        }}
      >
        <div className="flex items-center gap-3">
          <span>{CADENCE_LABEL[card.cadence.interval] ?? 'On demand'}</span>
          <span style={{ color: CI.line }}>·</span>
          <span>{stepCount} step{stepCount === 1 ? '' : 's'}</span>
          <span style={{ color: CI.line }}>·</span>
          <span>{card.formCount} form{card.formCount === 1 ? '' : 's'}</span>
          {!compact && (
            <>
              <span style={{ color: CI.line }}>·</span>
              <span>{policyCount} polic{policyCount === 1 ? 'y' : 'ies'}</span>
            </>
          )}
        </div>
        {card.requiresGoverningBody ? (
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
              color: CI.orange, textTransform: 'uppercase',
            }}
          >
            GB approval
          </span>
        ) : null}
      </div>
    </button>
  );
}

function titleCase(raw: string): string {
  if (!raw) return raw;
  const words = raw.toLowerCase().split(/\s+/);
  return words
    .map((w) => {
      if (/^[a-z]{2,3}$/.test(w) && !/^(and|of|or|the|to|in|on|by|for|at)$/.test(w)) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}
