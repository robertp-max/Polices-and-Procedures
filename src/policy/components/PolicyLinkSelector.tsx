/* ═══════════════════════════════════════════════════════════════════
   PolicyLinkSelector — Phase 11
   ───────────────────────────────────────────────────────────────────
   Multi-select autocomplete + chips for the "Linked Policy /
   Procedure (Required)" field that gates form submission.

   Behaviour:
     • Search by policy ID / title / keywords
     • Selected items render as removable chips
     • Calls onChange(ids) on every add / remove
     • Surfaces a hard-gate validation banner when empty + `required`
   ═══════════════════════════════════════════════════════════════ */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ShieldAlert, BookmarkCheck, ChevronDown } from 'lucide-react';
import {
  type PolicyLinkMeta,
  type PolicyLinkSource,
  searchPolicies,
  resolvePolicyMetaList,
  validatePolicyLinks,
  emitPolicyLinkAudit,
} from '@/policy/services/policyLinkService';

const NAVY        = '#1A3778';
const NAVY_SOFT   = '#EEF1FA';
const ORANGE      = '#F04B22';
const ORANGE_SOFT = '#FFF0EB';
const INK         = '#1F1C1B';
const MUTED       = '#747470';
const BORDER      = '#E5E4E3';
const PAPER       = '#FAFBF8';
const ERROR       = '#B91C1C';
const ERROR_SOFT  = '#FEF2F2';
const ERROR_BORD  = '#FCA5A5';

export interface PolicyLinkSelectorProps {
  /** Current selection (ordered). */
  value:           readonly string[];
  /** Called whenever the selection changes. */
  onChange:        (ids: string[]) => void;
  /** Used for chip-removal audit context. */
  artifactId:      string;
  artifactKind:    'form' | 'signature' | 'acknowledgment' | 'task';
  /** Where the form was opened from — drives audit context. */
  source?:         PolicyLinkSource;
  /** Field label override. */
  label?:          string;
  /** Hard-gate marker. Defaults to true (Phase 11 contract). */
  required?:       boolean;
  /** Disable input (e.g. after document is locked). */
  disabled?:       boolean;
  /** Compact rendering for tight panels. */
  compact?:        boolean;
}

export function PolicyLinkSelector({
  value,
  onChange,
  artifactId,
  artifactKind,
  source,
  label = 'Linked Policy / Procedure',
  required = true,
  disabled = false,
  compact = false,
}: PolicyLinkSelectorProps) {
  const [query, setQuery]       = useState('');
  const [open, setOpen]         = useState(false);
  const [touched, setTouched]   = useState(false);
  const wrapRef                  = useRef<HTMLDivElement>(null);
  const inputRef                 = useRef<HTMLInputElement>(null);

  const selectedMeta = useMemo<PolicyLinkMeta[]>(
    () => resolvePolicyMetaList(value),
    [value],
  );

  const results = useMemo<PolicyLinkMeta[]>(
    () => searchPolicies(query, { exclude: value, limit: 20 }),
    [query, value],
  );

  const validation = validatePolicyLinks(value);
  const showError  = required && touched && !validation.ok;

  /* close on outside click */
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const addPolicy = (meta: PolicyLinkMeta) => {
    if (disabled) return;
    if (value.includes(meta.id)) return;
    const next = [...value, meta.id];
    onChange(next);
    emitPolicyLinkAudit({
      action: 'POLICY_LINK_ADDED',
      target: { artifactId, artifactKind },
      policyIds: [meta.id],
      source,
    });
    setQuery('');
    setTouched(true);
    inputRef.current?.focus();
  };

  const removePolicy = (id: string) => {
    if (disabled) return;
    const next = value.filter(x => x !== id);
    onChange(next);
    emitPolicyLinkAudit({
      action: 'POLICY_LINK_REMOVED',
      target: { artifactId, artifactKind },
      policyIds: [id],
      source,
    });
    setTouched(true);
  };

  const padY = compact ? 'py-2' : 'py-2.5';

  return (
    <div ref={wrapRef} className="w-full">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookmarkCheck size={13} style={{ color: NAVY }} />
          <span
            className="font-montserrat font-bold text-[10px] uppercase tracking-[0.16em]"
            style={{ color: INK }}
          >
            {label}
            {required && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-[0.14em]"
                style={{ background: ORANGE_SOFT, color: ORANGE }}
              >
                REQUIRED
              </span>
            )}
          </span>
        </div>
        <span className="font-roboto text-[10.5px]" style={{ color: MUTED }}>
          {value.length} selected
        </span>
      </div>

      {/* ── Chips ──────────────────────────────────────────────── */}
      {selectedMeta.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedMeta.map(m => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full font-roboto text-[11px]"
              style={{
                background: NAVY_SOFT,
                color:      NAVY,
                border:     `1px solid ${NAVY}33`,
              }}
              title={`${m.id} — ${m.title} ${m.version}`}
            >
              <span className="font-mono font-semibold text-[10.5px]">{m.id}</span>
              <span className="opacity-70">—</span>
              <span className="truncate max-w-[180px]">{m.title}</span>
              <span className="opacity-60 text-[10px]">{m.version}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removePolicy(m.id)}
                  className="ml-0.5 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/60 transition-colors"
                  aria-label={`Remove ${m.id}`}
                >
                  <X size={11} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* ── Search input ───────────────────────────────────────── */}
      <div
        className="relative flex items-center gap-2 px-3 rounded-lg bg-white"
        style={{
          border: `1px solid ${showError ? ERROR_BORD : open ? NAVY : BORDER}`,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Search size={14} style={{ color: MUTED }} className="shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); setTouched(true); }}
          placeholder={value.length === 0 ? 'Search policy ID, title, or keyword…' : 'Add another policy…'}
          className={`flex-1 bg-transparent outline-none font-roboto text-[12.5px] ${padY}`}
          style={{ color: INK }}
          aria-label={label}
          aria-required={required}
          aria-invalid={showError || undefined}
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          disabled={disabled}
          className="shrink-0 p-1 rounded hover:bg-[#F4F6FB] transition-colors"
          aria-label="Toggle results"
        >
          <ChevronDown size={14} style={{ color: MUTED, transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 120ms' }} />
        </button>
      </div>

      {/* ── Results dropdown ──────────────────────────────────── */}
      {open && !disabled && (
        <div
          className="mt-1 rounded-lg bg-white shadow-lg overflow-hidden"
          style={{ border: `1px solid ${BORDER}`, maxHeight: 280, overflowY: 'auto' }}
          role="listbox"
        >
          {results.length === 0 ? (
            <div
              className="px-3 py-3 font-roboto text-[12px]"
              style={{ color: MUTED, background: PAPER }}
            >
              No matching policies. Try a different keyword.
            </div>
          ) : (
            results.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => addPolicy(m)}
                className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-[#F4F6FB] transition-colors"
                role="option"
                aria-selected={false}
              >
                <span
                  className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: NAVY_SOFT, color: NAVY }}
                >
                  {m.id}
                </span>
                <span className="flex-1 min-w-0 font-roboto text-[12.5px] truncate" style={{ color: INK }}>
                  {m.title}
                </span>
                <span className="shrink-0 font-roboto text-[10.5px]" style={{ color: MUTED }}>
                  {m.domainCode} · {m.version}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {/* ── Hard-gate banner ──────────────────────────────────── */}
      {showError && (
        <div
          className="mt-2 px-3 py-2 rounded-lg flex items-start gap-2 font-roboto text-[11.5px]"
          style={{ background: ERROR_SOFT, color: ERROR, border: `1px solid ${ERROR_BORD}` }}
          role="alert"
        >
          <ShieldAlert size={13} className="mt-0.5 shrink-0" />
          <span>{validation.error}</span>
        </div>
      )}
    </div>
  );
}

export default PolicyLinkSelector;
