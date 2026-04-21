import { useState } from 'react';
import { Printer, Download } from 'lucide-react';
import type { ReferencePreview } from '../lib/responseTypes';

/* ═══════════════════════════════════════════════════════════════
   FormRenderer — parses the form schema txt format and renders a
   real interactive fillable form UI.

   Schema format (from Builder/Forns/*.txt):
     layout: grid | checklist | signature | table
     fields:  - Label (type=text|textarea|date|signature|select, required=true, col=1-4)
              - Label (type=select, col=4, options=[A | B | C])
     checklist_items: - Item text
     table_columns: - Col name  /  table_row_count: N

   Column system: 4-column grid. col=1=quarter, col=2=half, col=4=full.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Schema types ──────────────────────────────────────────────── */
type FieldType = 'text' | 'textarea' | 'date' | 'signature' | 'select' | 'checkbox' | 'radio' | 'number';

interface ParsedField {
  label: string;
  type: FieldType;
  required: boolean;
  col: 1 | 2 | 3 | 4;
  options?: string[];
}

interface ParsedGridSection   { layout: 'grid' | 'signature'; fields: ParsedField[] }
interface ParsedChecklistSection { layout: 'checklist'; items: string[] }
interface ParsedTableSection  { layout: 'table'; columns: string[]; rowCount: number }
interface ParsedTextSection   { layout: 'text'; body: string }

type ParsedSection = { id: string; title: string } & (
  | ParsedGridSection | ParsedChecklistSection | ParsedTableSection | ParsedTextSection
);

/* ─── Parser ─────────────────────────────────────────────────────── */
function parseField(raw: string): ParsedField {
  const paren = raw.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!paren) return { label: raw.trim(), type: 'text', required: false, col: 4 };

  const label = paren[1].trim();
  const attrs = paren[2];
  const type   = (attrs.match(/type=(\w+)/)?.[1] ?? 'text') as FieldType;
  const req    = attrs.match(/required=(true|false)/)?.[1] === 'true';
  const col    = (Math.max(1, Math.min(4, parseInt(attrs.match(/col=(\d)/)?.[1] ?? '4'))) as 1|2|3|4);
  const opts   = attrs.match(/options=\[([^\]]+)\]/)?.[1]
                   .split('|').map(o => o.trim()).filter(Boolean);
  return { label, type, required: req, col, options: opts };
}

/** Strip "SECTION N: " or "SECTION N — " prefixes from titles. */
function cleanTitle(raw: string): string {
  return raw.replace(/^SECTION\s+\d+[:\s—–-]+/i, '').trim() || raw;
}

function parseSection(s: { id: string; title: string; body: string }): ParsedSection {
  const lines   = s.body.split('\n').map(l => l.trim());
  const layoutL = lines.find(l => l.startsWith('layout:'));
  const layout  = layoutL?.slice('layout:'.length).trim() ?? 'text';

  const title = cleanTitle(s.title);

  if (layout === 'checklist') {
    const start = lines.findIndex(l => l === 'checklist_items:');
    const items = (start >= 0 ? lines.slice(start + 1) : lines)
      .filter(l => l.startsWith('- ')).map(l => l.slice(2).trim());
    return { id: s.id, title, layout: 'checklist', items };
  }

  if (layout === 'table') {
    const cStart = lines.findIndex(l => l === 'table_columns:');
    const columns = (cStart >= 0 ? lines.slice(cStart + 1) : [])
      .filter(l => l.startsWith('- ')).map(l => l.slice(2).trim());
    const rowCount = parseInt(lines.find(l => l.startsWith('table_row_count:'))?.split(':')[1] ?? '8') || 8;
    return { id: s.id, title, layout: 'table', columns, rowCount };
  }

  if (layout === 'grid' || layout === 'signature') {
    const fStart = lines.findIndex(l => l === 'fields:');
    const fields = (fStart >= 0 ? lines.slice(fStart + 1) : [])
      .filter(l => l.startsWith('- ')).map(l => parseField(l.slice(2).trim()));
    return { id: s.id, title, layout: layout as 'grid' | 'signature', fields };
  }

  return { id: s.id, title, layout: 'text', body: s.body };
}

/* ─── Main component ─────────────────────────────────────────────── */
export interface FormRendererProps {
  reference: ReferencePreview;
  isLight: boolean;
}

const ACCENT = '#C74601';
const TEXT   = '#1F1C1B';
const MUTED  = '#52404B';
const DIMMED = '#8E7E85';
const BORDER = '#D9D0CE';

export function FormRenderer({ reference, isLight }: FormRendererProps) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setChecks(p => ({ ...p, [key]: !p[key] }));

  const all = reference.sections.map(parseSection);

  const textBlocks = all.filter(s => s.layout === 'text') as (ParsedTextSection & { id: string; title: string })[];
  const purposeText = reference.description
    ?? textBlocks.find(s => /purpose/i.test(s.title))?.body;
  const instructText = textBlocks.find(s => /instruction/i.test(s.title))?.body;
  const formBlocks = all.filter(s => s.layout !== 'text');

  const completedCount = formBlocks
    .filter(s => s.layout === 'checklist')
    .flatMap(s => (s as ParsedChecklistSection).items.map((_, i) => `${s.id}-${i}`))
    .filter(k => checks[k]).length;
  const totalChecks = formBlocks
    .filter(s => s.layout === 'checklist')
    .reduce((a, s) => a + (s as ParsedChecklistSection).items.length, 0);

  return (
    <div className="ia-form-renderer">
      {/* Toolbar — hidden in print */}
      <div
        className="ia-no-print flex items-center justify-between mb-3 pb-3"
        style={{ borderBottom: `1px solid ${isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)'}` }}
      >
        <div className="flex items-center gap-2">
          {totalChecks > 0 && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: completedCount === totalChecks ? '#047857' : DIMMED,
                background: completedCount === totalChecks ? 'rgba(4,120,87,0.08)' : 'rgba(142,126,133,0.08)',
                border: `1px solid ${completedCount === totalChecks ? 'rgba(4,120,87,0.2)' : 'rgba(142,126,133,0.2)'}`,
              }}
            >
              {completedCount}/{totalChecks} complete
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{
              color: '#FFFFFF',
              background: ACCENT,
              border: `1px solid ${ACCENT}`,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <Download size={12} strokeWidth={2} />
            PDF / Print
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{
              color: isLight ? MUTED : 'rgba(255,255,255,0.7)',
              background: 'transparent',
              border: `1px solid ${isLight ? '#E5E4E3' : 'rgba(255,255,255,0.12)'}`,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <Printer size={12} strokeWidth={2} />
            Print
          </button>
        </div>
      </div>

      {/* ── Printable form body ──────────────────────────────── */}
      <div className="ia-form-print-root">

        {/* Form Header */}
        <div style={{ borderBottom: `2px solid ${ACCENT}`, paddingBottom: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: ACCENT, fontFamily: "'JetBrains Mono', monospace", marginBottom: 5,
              }}>
                Care Indeed Home Health Care, Inc.
              </div>
              <h2 style={{
                fontSize: 17, fontWeight: 700, color: TEXT, margin: 0, lineHeight: 1.25,
                fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
              }}>
                {reference.title}
              </h2>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, fontFamily: "'JetBrains Mono', monospace" }}>
                {reference.id}
              </div>
              <div style={{ fontSize: 10, color: DIMMED, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                v{reference.version ?? '—'} · {reference.effectiveDate ?? '—'}
              </div>
            </div>
          </div>

          {(purposeText || instructText) && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {purposeText && (
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                    Purpose:{' '}
                  </span>
                  {purposeText.trim()}
                </div>
              )}
              {instructText && (
                <div style={{
                  fontSize: 12, color: TEXT, lineHeight: 1.5,
                  padding: '6px 10px', background: 'rgba(199,70,1,0.04)',
                  border: `1px solid rgba(199,70,1,0.15)`, borderRadius: 6,
                }}>
                  <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: ACCENT }}>
                    Instructions:{' '}
                  </span>
                  {instructText.trim()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Sections */}
        {formBlocks.map((section) => (
          <div key={section.id} style={{ marginBottom: 22 }}>
            {/* Section title */}
            <div style={{
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em',
              color: ACCENT, fontFamily: "'JetBrains Mono', monospace",
              borderBottom: `1px solid rgba(199,70,1,0.18)`, paddingBottom: 4, marginBottom: 10,
            }}>
              {section.title}
            </div>

            {(section.layout === 'grid' || section.layout === 'signature') && (
              <GridSection fields={(section as ParsedGridSection).fields} />
            )}
            {section.layout === 'checklist' && (
              <ChecklistSection
                items={(section as ParsedChecklistSection).items}
                sectionKey={section.id}
                checks={checks}
                toggle={toggle}
              />
            )}
            {section.layout === 'table' && (
              <TableSection
                columns={(section as ParsedTableSection).columns}
                rowCount={(section as ParsedTableSection).rowCount}
              />
            )}
          </div>
        ))}

        {/* Footer */}
        <div style={{
          marginTop: 24, paddingTop: 10,
          borderTop: `1px solid rgba(199,70,1,0.25)`,
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          gap: 6, alignItems: 'center',
        }}>
          <span style={{ fontSize: 9, color: DIMMED, fontFamily: "'JetBrains Mono', monospace" }}>
            Care Indeed Home Health Care, Inc. · {reference.id} · v{reference.version ?? '—'} · Effective {reference.effectiveDate ?? '—'} · Next Review {reference.nextReviewDate ?? '—'}
          </span>
          {reference.linkedIds.length > 0 && (
            <span style={{ fontSize: 9, color: DIMMED, fontFamily: "'JetBrains Mono', monospace" }}>
              Linked Policies: {reference.linkedIds.join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Grid / Signature section ────────────────────────────────── */
function GridSection({ fields }: { fields: ParsedField[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px 14px' }}>
      {fields.map((field, i) => (
        <div key={i} style={{ gridColumn: `span ${field.col}` }}>
          <FieldControl field={field} />
        </div>
      ))}
    </div>
  );
}

/* ─── Individual field control ─────────────────────────────────── */
function FieldControl({ field }: { field: ParsedField }) {
  const labelEl = (
    <div style={{
      fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em',
      color: DIMMED, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4,
      display: 'flex', alignItems: 'center', gap: 3,
    }}>
      {field.label}
      {field.required && <span style={{ color: ACCENT, fontWeight: 800 }}>*</span>}
    </div>
  );

  const baseInput: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    border: `1px solid ${BORDER}`, borderRadius: 5,
    padding: '6px 9px', fontSize: 13, color: TEXT,
    background: '#FFFFFF', outline: 'none',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'border-color 0.15s',
  };

  if (field.type === 'signature') {
    return (
      <div>
        {labelEl}
        <div style={{
          height: 48,
          borderBottom: `2px solid ${TEXT}`,
          display: 'flex', alignItems: 'flex-end', paddingBottom: 4, paddingLeft: 2,
        }}>
          <span style={{
            fontSize: 9, color: '#C5B8B3', textTransform: 'uppercase',
            letterSpacing: '0.15em', fontFamily: "'JetBrains Mono', monospace",
          }}>
            Signature
          </span>
        </div>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div>
        {labelEl}
        <textarea
          rows={field.col === 4 ? 3 : 2}
          style={{ ...baseInput, resize: 'vertical', minHeight: 56 }}
          onFocus={e => { e.currentTarget.style.borderColor = ACCENT; }}
          onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
        />
      </div>
    );
  }

  if (field.type === 'select' && field.options) {
    return (
      <div>
        {labelEl}
        <select
          style={{ ...baseInput, appearance: 'auto' }}
          onFocus={e => { e.currentTarget.style.borderColor = ACCENT; }}
          onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
        >
          <option value="">Select…</option>
          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    );
  }

  if (field.type === 'date') {
    return (
      <div>
        {labelEl}
        <input
          type="date"
          style={baseInput}
          onFocus={e => { e.currentTarget.style.borderColor = ACCENT; }}
          onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
        />
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20, cursor: 'pointer' }}>
        <input type="checkbox" style={{ width: 14, height: 14, accentColor: ACCENT }} />
        <span style={{ fontSize: 13, color: TEXT }}>
          {field.label}
          {field.required && <span style={{ color: ACCENT, marginLeft: 3 }}>*</span>}
        </span>
      </label>
    );
  }

  if (field.type === 'radio') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20, cursor: 'pointer' }}>
        <input type="radio" style={{ width: 14, height: 14, accentColor: ACCENT }} />
        <span style={{ fontSize: 13, color: TEXT }}>{field.label}</span>
      </label>
    );
  }

  // Default: text / number
  return (
    <div>
      {labelEl}
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        style={baseInput}
        onFocus={e => { e.currentTarget.style.borderColor = ACCENT; }}
        onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
      />
    </div>
  );
}

/* ─── Checklist section ─────────────────────────────────────────── */
function ChecklistSection({ items, sectionKey, checks, toggle }: {
  items: string[];
  sectionKey: string;
  checks: Record<string, boolean>;
  toggle: (k: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {items.map((item, i) => {
        const key   = `${sectionKey}-${i}`;
        const done  = checks[key] ?? false;
        return (
          <label
            key={key}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
              background: done ? 'rgba(199,70,1,0.04)' : 'transparent',
              border: `1px solid ${done ? 'rgba(199,70,1,0.22)' : BORDER}`,
              transition: 'all 0.13s',
            }}
            onClick={() => toggle(key)}
          >
            {/* Custom checkbox */}
            <span style={{
              width: 16, height: 16, flexShrink: 0, marginTop: 1,
              border: `1.5px solid ${done ? ACCENT : BORDER}`,
              borderRadius: 3, background: done ? ACCENT : '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.13s',
            }}>
              {done && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span style={{
              fontSize: 13, color: done ? DIMMED : TEXT, lineHeight: 1.5,
              textDecoration: done ? 'line-through' : 'none',
              transition: 'all 0.13s',
            }}>
              {item}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/* ─── Table section ─────────────────────────────────────────────── */
function TableSection({ columns, rowCount }: { columns: string[]; rowCount: number }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 6, border: `1px solid ${BORDER}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#FAFAFA' }}>
            {columns.map((col, ci) => (
              <th key={ci} style={{
                padding: '7px 10px', textAlign: 'left',
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em',
                color: MUTED, fontFamily: "'JetBrains Mono', monospace",
                borderBottom: `2px solid ${ACCENT}`,
                borderRight: ci < columns.length - 1 ? `1px solid ${BORDER}` : 'none',
                whiteSpace: 'nowrap',
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid ${BORDER}` }}>
              {columns.map((_, ci) => (
                <td key={ci} style={{
                  borderRight: ci < columns.length - 1 ? `1px solid ${BORDER}` : 'none',
                  padding: 0,
                }}>
                  <input
                    type="text"
                    style={{
                      width: '100%', border: 'none', background: 'transparent',
                      fontSize: 12, color: TEXT, padding: '5px 10px', outline: 'none',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                    onFocus={e => { e.currentTarget.style.background = 'rgba(199,70,1,0.03)'; }}
                    onBlur={e => { e.currentTarget.style.background = 'transparent'; }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
