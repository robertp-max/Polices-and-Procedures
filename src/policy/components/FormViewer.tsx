import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Printer, Download } from 'lucide-react';
import ciLogoGray from '@/assets/ci-logo-gray.png';
import { useShellStore } from '@/policy/stores/uiStore';
import {
  buildFormContent,
  type FormContent,
  type FormSection,
  type FormField,
} from '../data/formsLibraryContent';

/* ═══════════════════════════════════════════════════════════════
   FormViewer — Care Indeed-branded fillable & printable form
   Used for every one of the 281 forms in the Enterprise Library.
   Also usable standalone via /forms/:formId route.
   ═══════════════════════════════════════════════════════════════ */

// Imported from FormsPage to keep a single source of truth for
// the 281 forms dataset — we re-export the minimal shape we need
// here so the viewer can be opened by ID without cyclical imports.
import { FORMS_DATASET } from '../data/formsLibraryDataset';

// ─── Care Indeed brand accents (NOT the app's maroon/gold shell) ───
const CI_TEAL = '#00e59b';
const CI_TEAL_DARK = '#00a370';
const CI_ORANGE = '#e85200';
const CI_INK = '#1F1C1B';

// ─── Field rendering (fillable inputs) ───────────────────────────
function Field({ f }: { f: FormField }) {
  const colSpan = { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4' }[f.col ?? 2];
  const baseInput =
    'w-full bg-transparent text-[13px] text-[#1F1C1B] focus:outline-none border-b border-gray-300 focus:border-[#00a370] pb-1 pt-2 print:border-b-gray-400';

  return (
    <div className={colSpan}>
      <label className="text-[10px] font-bold text-[#555] uppercase tracking-[0.15em] mb-1 block">
        {f.label}
        {f.required && <span className="text-[#e85200] ml-1">*</span>}
      </label>
      {f.type === 'textarea' ? (
        <textarea rows={3} placeholder={f.placeholder} className={baseInput + ' min-h-[70px] resize-y'} />
      ) : f.type === 'select' ? (
        <select className={baseInput}>
          <option value="">— Select —</option>
          {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : f.type === 'checkbox' ? (
        <input type="checkbox" className="w-5 h-5 accent-[#00a370]" />
      ) : f.type === 'radio' ? (
        <div className="flex gap-4 flex-wrap">
          {f.options?.map(o => (
            <label key={o} className="flex items-center gap-2 text-[12px]">
              <input type="radio" name={f.label} className="w-4 h-4 accent-[#00a370]" /> {o}
            </label>
          ))}
        </div>
      ) : f.type === 'signature' ? (
        <div className="border-b border-dashed border-gray-400 h-10 w-full"></div>
      ) : (
        <input type={f.type} placeholder={f.placeholder} className={baseInput} />
      )}
      {f.help && <p className="text-[10px] text-gray-500 italic mt-1">{f.help}</p>}
    </div>
  );
}

// ─── Section rendering ───────────────────────────────────────────
function SectionRenderer({ s, idx }: { s: FormSection; idx: number }) {
  return (
    <section className="mb-8 avoid-break">
      <header className="mb-4 pb-2 border-b-2" style={{ borderColor: CI_TEAL }}>
        <h2 className="font-bold text-[13px] uppercase tracking-[0.18em] text-[#1F1C1B]">
          {s.title || `Section ${idx + 1}`}
        </h2>
        {s.description && <p className="text-[11px] text-gray-600 mt-1">{s.description}</p>}
      </header>

      {s.layout === 'grid' && s.fields && (
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          {s.fields.map((f, i) => <Field key={i} f={f} />)}
        </div>
      )}

      {s.layout === 'table' && s.columns && (
        <div className="overflow-x-auto border border-gray-300 rounded">
          <table className="w-full text-[11px]">
            <thead style={{ background: '#F5F5F5' }}>
              <tr>
                {s.columns.map(c => (
                  <th key={c} className="px-3 py-2 text-left font-bold uppercase tracking-wider text-[9px] text-[#555] border-b border-gray-300 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: s.rowCount ?? 12 }).map((_, r) => (
                <tr key={r} className={r % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                  {s.columns!.map((_, c) => (
                    <td key={c} className="border-b border-gray-200 p-1.5">
                      <input className="w-full bg-transparent text-[11px] focus:outline-none" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {s.layout === 'checklist' && s.items && (
        <ul className="space-y-2">
          {s.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 p-2 border-b border-gray-100">
              <input type="checkbox" className="w-5 h-5 mt-0.5 accent-[#00a370] shrink-0" />
              <div className="flex-1">
                <span className="text-[12px] text-[#1F1C1B] leading-relaxed">{item}</span>
                <div className="grid grid-cols-3 gap-3 mt-1.5">
                  <input placeholder="Date completed" className="text-[10px] border-b border-gray-200 bg-transparent focus:outline-none focus:border-[#00a370]" />
                  <input placeholder="Initials" className="text-[10px] border-b border-gray-200 bg-transparent focus:outline-none focus:border-[#00a370]" />
                  <input placeholder="Notes" className="text-[10px] border-b border-gray-200 bg-transparent focus:outline-none focus:border-[#00a370]" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {s.layout === 'attestation' && (
        <div>
          {s.body && <p className="text-[12px] text-[#1F1C1B] mb-4 leading-relaxed font-medium">{s.body}</p>}
          {s.acknowledgments && (
            <ol className="list-decimal list-outside ml-6 space-y-3 text-[12px] text-[#1F1C1B]">
              {s.acknowledgments.map((a, i) => (
                <li key={i} className="leading-relaxed pl-2">{a}</li>
              ))}
            </ol>
          )}
        </div>
      )}

      {s.layout === 'signature' && s.fields && (
        <div className="grid grid-cols-4 gap-x-6 gap-y-4 pt-4 border-t border-gray-200">
          {s.fields.map((f, i) => <Field key={i} f={f} />)}
        </div>
      )}

      {s.layout === 'narrative' && (
        <textarea rows={8} className="w-full bg-transparent text-[12px] text-[#1F1C1B] focus:outline-none border border-gray-300 rounded p-3 focus:border-[#00a370]" />
      )}

      {s.layout === 'matrix' && s.matrixRows && s.matrixCols && (
        <div className="overflow-x-auto border border-gray-300 rounded">
          <table className="w-full text-[11px]">
            <thead style={{ background: '#F5F5F5' }}>
              <tr>
                <th className="px-3 py-2 text-left font-bold text-[9px]">Item</th>
                {s.matrixCols.map(c => <th key={c} className="px-3 py-2 text-left font-bold text-[9px]">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {s.matrixRows.map((row, r) => (
                <tr key={r} className={r % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                  <td className="px-3 py-2 border-b border-gray-200 text-[11px] font-medium">{row}</td>
                  {s.matrixCols!.map((_, c) => (
                    <td key={c} className="border-b border-gray-200 p-1.5">
                      <input className="w-full bg-transparent text-[11px] focus:outline-none" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* Print CSS is now handled globally in src/index.css via the
   [data-shell-bg] / [data-shell-card] / .form-page / @page reset.
   Forms print full-page, no card chrome, no browser headers/footers. */

// ─── Main view ───────────────────────────────────────────────────
export function FormViewer({ formId }: { formId?: string }) {
  const { formId: routeId } = useParams();
  const navigate = useNavigate();
  const id = formId ?? routeId;
  const setDetailMode = useShellStore(s => s.setDetailMode);

  // Standardize browser print header ("Care Indeed Home Health Care, Inc.
  // - Policies and Procedures") by setting document.title while mounted.
  useEffect(() => {
    const prev = document.title;
    document.title = 'Care Indeed Home Health Care, Inc. - Policies and Procedures';
    setDetailMode(true);
    return () => {
      document.title = prev;
      setDetailMode(false);
    };
  }, [setDetailMode]);

  const content: FormContent | null = useMemo(() => {
    if (!id) return null;
    const rec = FORMS_DATASET.find(f => f.id === id);
    if (!rec) return null;
    return buildFormContent(rec);
  }, [id]);

  if (!id) return null;
  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-[#1F1C1B]">Form Not Found</h2>
          <p className="text-sm text-gray-600 mt-2">Form ID "{id}" is not in the Enterprise Forms Library.</p>
          <button onClick={() => navigate('/forms')} className="mt-4 px-4 py-2 rounded bg-[#00a370] text-white text-sm">
            Return to Forms Library
          </button>
        </div>
      </div>
    );
  }

  const orientation = content.orientation;
  const pageWidth = orientation === 'landscape' ? '11in' : '8.5in';

  return (
    <div className="min-h-screen overflow-auto relative" style={{ background: '#ececec' }}>
      {/* ── In-card chrome: Return link top-left + Print/Download top-right ── */}
      <div className="no-print flex items-center justify-between px-6 md:px-10 pt-5 pb-3 max-w-[1200px] mx-auto">
        <button
          type="button"
          onClick={() => navigate('/forms')}
          className="flex items-center gap-2 text-[12px] font-semibold text-[#1F1C1B] hover:text-[#007970] transition-colors"
        >
          <ChevronLeft size={15} /> Return to Forms Library
        </button>
        <div className="flex items-center gap-3">
          <div className="text-[11px] text-gray-500 font-mono">
            {content.id} · v{content.version}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#007970] hover:bg-[#005751] text-white text-[12px] font-semibold"
          >
            <Printer size={14} /> Print
          </button>
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `${content.id}.html`; a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-[#1F1C1B] text-[12px] font-semibold hover:bg-gray-50"
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* ── Form page (paper simulation) ── */}
      <div
        className="form-page mx-auto my-4 bg-white shadow-xl"
        style={{
          width: `min(${pageWidth}, 100%)`,
          minHeight: '11in',
          padding: '0.6in 0.6in 1in 0.6in',
          color: CI_INK,
          fontFamily: "'Roboto','Open Sans',sans-serif",
        }}
      >
        {/* Masthead — logo aligned with the form classification + ID.
            The "Enterprise Forms Library" label was removed per product
            direction; the logo alone carries brand recognition. */}
        <header className="flex items-center justify-between pb-4 border-b-2" style={{ borderColor: CI_TEAL }}>
          <div className="flex items-center gap-4">
            <img src={ciLogoGray} alt="Care Indeed" style={{ height: 48 }} />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: CI_ORANGE }}>
              {content.type}
            </p>
            <p className="text-[12px] font-mono font-bold text-[#1F1C1B] mt-0.5">
              {content.id}
            </p>
          </div>
        </header>

        {/* Title block */}
        <div className="py-5">
          <h1 className="text-[22px] font-bold text-[#1F1C1B] leading-tight" style={{ fontFamily: "'Montserrat','Roboto',sans-serif" }}>
            {content.title}
          </h1>
          <div className="mt-3 grid grid-cols-4 gap-4 text-[10px]">
            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-gray-500">Form ID</p>
              <p className="text-[#1F1C1B] mt-1 font-mono">{content.id}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-gray-500">Version</p>
              <p className="text-[#1F1C1B] mt-1">v{content.version}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-gray-500">Effective</p>
              <p className="text-[#1F1C1B] mt-1">{content.effectiveDate}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-[0.18em] text-gray-500">Next Review</p>
              <p className="text-[#1F1C1B] mt-1">{content.revisionDate}</p>
            </div>
          </div>
        </div>

        {/* Linked policies */}
        {content.policies.length > 0 && (
          <div className="mb-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">
              Linked Policy IDs
            </p>
            <div className="flex flex-wrap gap-1.5">
              {content.policies.map(p => (
                <span key={p} className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold" style={{ background: 'rgba(0,229,155,0.12)', color: CI_TEAL_DARK, border: `1px solid ${CI_TEAL}40` }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Purpose */}
        <section className="mb-5 p-4 rounded" style={{ background: '#F5FBF8', borderLeft: `3px solid ${CI_TEAL}` }}>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: CI_TEAL_DARK }}>Purpose</p>
          <p className="text-[12px] text-[#1F1C1B] leading-relaxed">{content.purpose}</p>
        </section>

        {/* Instructions */}
        <section className="mb-6 p-4 rounded" style={{ background: '#FFF6F0', borderLeft: `3px solid ${CI_ORANGE}` }}>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: CI_ORANGE }}>Instructions</p>
          <p className="text-[12px] text-[#1F1C1B] leading-relaxed">{content.instructions}</p>
        </section>

        {/* Sections */}
        {content.sections.map((s, i) => <SectionRenderer key={i} s={s} idx={i} />)}

        {/* Footer */}
        <footer className="mt-10 pt-4 border-t border-gray-200 flex items-start justify-between">
          <div className="text-[9px] text-gray-500 leading-relaxed">
            {content.footerNotes?.map((n, i) => <p key={i}>{n}</p>)}
            <p className="mt-1">
              <span className="font-bold uppercase tracking-[0.2em]" style={{ color: CI_TEAL_DARK }}>Accreditation Status:</span>{' '}
              ACHC Accredited · Home Health Agency
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: CI_TEAL_DARK }}>
              Care Indeed · Policies and Procedures
            </p>
            <p className="text-[9px] text-gray-500 font-mono">
              {content.id} · v{content.version}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default FormViewer;
