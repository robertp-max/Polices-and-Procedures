import { FileText, ClipboardList, Boxes, Workflow } from 'lucide-react';
import type { LinkedReference, ReferenceIntent } from '../lib/responseTypes';
import { ReferenceLink } from './ReferenceLink';

/* ═══════════════════════════════════════════════════════════════
   ReferenceCards — renders `linkedReferences` as action-ready cards
   grouped by whether they are mission-critical (required / required_for_*)
   or supporting / related.
   ═══════════════════════════════════════════════════════════════ */

export interface ReferenceCardsProps {
  references: LinkedReference[];
  isLight: boolean;
  activeId?: string | null;
  onOpenReference: (id: string) => void;
}

export function ReferenceCards({ references, isLight, activeId, onOpenReference: _onOpenReference }: ReferenceCardsProps) {
  if (references.length === 0) return null;

  const critical = references.filter(r => isCriticalIntent(r.intent) || r.required);
  const supporting = references.filter(r => !critical.includes(r));

  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const surface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.025)';
  const accent = isLight ? '#C74601' : '#FFC107';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';

  return (
    <section
      className="rounded-2xl"
      style={{ background: surface, border: `1px solid ${border}` }}
    >
      <header className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${border}` }}>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
        >
          Linked References
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {references.length} {references.length === 1 ? 'item' : 'items'}
        </span>
      </header>

      {critical.length > 0 && (
        <Group
          label="Required"
          items={critical}
          isLight={isLight}
          activeId={activeId}
          primary
        />
      )}
      {supporting.length > 0 && (
        <Group
          label="Supporting & Related"
          items={supporting}
          isLight={isLight}
          activeId={activeId}
        />
      )}
    </section>
  );
}

function Group({
  label,
  items,
  isLight,
  activeId,
  primary = false,
}: {
  label: string;
  items: LinkedReference[];
  isLight: boolean;
  activeId?: string | null;
  primary?: boolean;
}) {
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.45)';

  return (
    <div className="px-5 py-3">
      <div
        className="text-[9px] font-bold uppercase tracking-[0.24em] mb-2"
        style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
      >
        {label}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map(r => (
          <ReferenceCard
            key={r.id}
            reference={r}
            isLight={isLight}
            selected={r.id === activeId}
            primary={primary}
          />
        ))}
      </div>
      <div className="h-px mt-3 -mx-5" style={{ background: border }} />
    </div>
  );
}

function ReferenceCard({
  reference,
  isLight,
  selected,
  primary,
}: {
  reference: LinkedReference;
  isLight: boolean;
  selected: boolean;
  primary: boolean;
}) {
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const accent = isLight ? '#C74601' : '#FFC107';
  const text = isLight ? '#1F1C1B' : '#E0E0E0';
  const muted = isLight ? '#747474' : 'rgba(255,255,255,0.55)';
  const Icon = iconFor(reference.type);

  return (
    <div
      className="text-left flex items-start gap-3 rounded-xl p-3 transition-colors"
      style={{
        background: isLight
          ? (selected ? '#FFFAF7' : '#FAFAFA')
          : (selected ? 'rgba(255,193,7,0.055)' : 'rgba(255,255,255,0.02)'),
        border: `1px solid ${selected ? accent : (primary ? (isLight ? '#FFD5BF' : 'rgba(255,193,7,0.2)') : border)}`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-lg shrink-0"
        style={{
          width: 36,
          height: 36,
          background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${border}`,
          color: primary ? accent : muted,
        }}
      >
        <Icon size={16} strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <ReferenceLink
            id={reference.id}
            isLight={isLight}
            className="text-[11px] font-bold"
            style={{
              color: primary ? accent : text,
              fontFamily: "'JetBrains Mono', monospace",
              textDecoration: 'none',
            }}
          >
            {reference.id}
          </ReferenceLink>
          <TypeChip type={reference.type} isLight={isLight} />
          <IntentChip intent={reference.intent} isLight={isLight} />
        </div>
        <div className="text-[12.5px] font-semibold mt-1 truncate" style={{ color: text }}>
          {reference.title}
        </div>
        {reference.description && (
          <div
            className="text-[11px] mt-0.5 line-clamp-2"
            style={{ color: muted, lineHeight: 1.4 }}
          >
            {reference.description}
          </div>
        )}
        <div
          className="text-[10px] mt-1.5 uppercase tracking-[0.18em]"
          style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
        >
          {reference.domain}
          {reference.subdomain && ` · ${reference.subdomain}`}
          {reference.accessTier && ` · ${compactTier(reference.accessTier)}`}
        </div>
      </div>
    </div>
  );
}

function iconFor(type: LinkedReference['type']) {
  switch (type) {
    case 'form':     return ClipboardList;
    case 'appendix': return Boxes;
    case 'workflow': return Workflow;
    case 'policy':
    default:         return FileText;
  }
}

function compactTier(tier: string): string {
  const m = tier.match(/Tier\s*(\d)/i);
  return m ? `T${m[1]}` : tier.slice(0, 12);
}

function TypeChip({ type, isLight }: { type: LinkedReference['type']; isLight: boolean }) {
  const muted = isLight ? '#52404B' : 'rgba(255,255,255,0.55)';
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  return (
    <span
      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
      style={{
        color: muted,
        background: isLight ? '#F7F6F5' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${border}`,
        letterSpacing: '0.18em',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {type}
    </span>
  );
}

function IntentChip({ intent, isLight }: { intent: LinkedReference['intent']; isLight: boolean }) {
  const cfg = intentStyle(intent, isLight);
  return (
    <span
      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
      style={{
        color: cfg.text,
        background: cfg.bg,
        letterSpacing: '0.18em',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {intentLabel(intent)}
    </span>
  );
}

function intentStyle(intent: ReferenceIntent, isLight: boolean) {
  if (isCriticalIntent(intent)) {
    return {
      text: isLight ? '#B45309' : '#FCD34D',
      bg: isLight ? '#FFF7ED' : 'rgba(252,211,77,0.08)',
    };
  }
  return {
    text: isLight ? '#52404B' : 'rgba(255,255,255,0.55)',
    bg: isLight ? '#F0EFEE' : 'rgba(255,255,255,0.04)',
  };
}

function isCriticalIntent(intent: ReferenceIntent): boolean {
  return intent === 'required'
    || intent === 'required_for_audit'
    || intent === 'required_for_completion'
    || intent === 'required_for_review';
}

function intentLabel(intent: ReferenceIntent): string {
  switch (intent) {
    case 'required':               return 'REQUIRED';
    case 'recommended':            return 'RECOMMENDED';
    case 'supporting':             return 'SUPPORTING';
    case 'related':                return 'RELATED';
    case 'required_for_audit':     return 'AUDIT';
    case 'required_for_completion':return 'COMPLETE';
    case 'required_for_review':    return 'REVIEW';
    default:                       return 'RELATED';
  }
}
