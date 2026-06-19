import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, Printer } from 'lucide-react';
import { buildFormContent } from '@/policy/data/formsLibraryContent';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { FormBody } from '@/policy/components/FormViewer';
import { PrintFrame } from '@/policy/components/ui/print';

/**
 * MVP-P1-PRINT-001 (Wave 5A) — FormPrintView migrated to <PrintFrame>.
 *
 * PrintFrame now owns:
 *   - the canonical Care Indeed print header (logo + title + meta)
 *   - the canonical @page rule + baseline @media print resets
 *   - the auto-print timer with iframe-suppression guard
 *
 * This file retains:
 *   - the screen-only toolbar (Close + Save buttons)
 *   - the .screen-shell / .form-frame paper-card screen preview
 *   - FormPrintView-specific @media print overrides (table layout: fixed,
 *     word-break, .form-frame paper-card strip-down) which PrintFrame does
 *     not emit
 *   - the document.title management
 *
 * Rollback: flip `print_unified_chrome` feature flag OFF — PrintFrame becomes
 * a transparent passthrough rendering only {children}, and this page falls
 * back to its prior visual (no unified header/footer chrome). FormPrintView-
 * specific overrides below remain in effect either way, so table fidelity is
 * unaffected by the flag.
 */
export function FormPrintView() {
  const { formId } = useParams<{ formId: string }>();

  const content = useMemo(() => {
    if (!formId) return null;
    const rec = FORMS_DATASET.find(f => f.id === formId);
    return rec ? buildFormContent(rec) : null;
  }, [formId]);

  useEffect(() => {
    if (!content) return;
    const prev = document.title;
    document.title = `${content.id} — ${content.title}`;
    return () => {
      document.title = prev;
    };
  }, [content]);

  if (!content) {
    return (
      <div className="min-h-screen bg-white p-8 text-[#1F1C1B] font-roboto">
        <h1 className="font-montserrat text-xl font-semibold">Form not found</h1>
        <p className="mt-2 text-sm text-[#524048]">Form ID: {formId}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-roboto text-[#1F1C1B]" style={{ backgroundColor: '#FFFFFF', color: '#1F1C1B' }}>
      <style>{`
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; }
          .screen-shell { background: #FFFFFF !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
          .form-frame {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
            background: #FFFFFF !important;
          }
          * { transition: none !important; }
          .form-frame table {
            table-layout: fixed !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .form-frame table th,
          .form-frame table td {
            word-break: break-word !important;
            overflow-wrap: anywhere !important;
            white-space: normal !important;
          }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <div className="fixed top-0 left-0 right-0 bg-white border-b border-[#E5E4E3] z-50 p-4 shadow-sm flex justify-between items-center no-print">
        <button
          onClick={() => window.close()}
          className="flex items-center gap-2 text-[#524048] font-montserrat font-semibold text-xs uppercase tracking-wider hover:text-[#1F1C1B]"
        >
          <ChevronLeft size={14} /> Close
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#007970] text-white px-5 py-2 rounded-lg font-montserrat font-bold text-xs uppercase tracking-wider hover:bg-[#004142] transition-colors shadow-sm"
        >
          <Printer size={16} /> Save to PDF / Print
        </button>
      </div>

      <div className="screen-shell w-full px-0 pb-0 pt-20">
        <div className="form-frame w-full bg-white px-8 py-10 md:px-12 md:py-14">
          <PrintFrame
            documentTitle={content.title}
            documentId={content.id}
            documentVersion={content.version}
            documentDate={content.effectiveDate}
            documentKind="FORM"
            orientation={content.orientation === 'landscape' ? 'landscape' : 'portrait'}
            contentScopeSelector=".form-frame"
            autoPrint
          >
            <FormBody content={content} />
          </PrintFrame>
        </div>
      </div>
    </div>
  );
}

export default FormPrintView;
